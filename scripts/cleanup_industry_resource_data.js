// Deterministic source-data migration. Run again to verify it makes no changes.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const { scanModulesDirRecursive, enrichModuleEntities, applyResourceConsumerIndex } = require('../build_suite');
const targets = ['campaigns/Peridot/campaign.json', 'campaigns/Peridot/preset.json', 'campaigns/Peridot/topology.json', 'campaigns/BaldursGate/topology.json'];
const dirs = ['mods', 'campaigns'];
const modules = new Map();
for (const dir of dirs) for (const mod of scanModulesDirRecursive(path.join(root, dir), root).sort((a,b) => a.path.localeCompare(b.path))) {
  if (modules.has(mod.id)) continue;
  const file = path.join(root, mod.path.replace(/^\.\//, ''));
  const extracted = enrichModuleEntities(mod, fs.readFileSync(file, 'utf8'));
  mod.extracted_items = extracted.items;
  mod.extracted_quests = extracted.quests;
  modules.set(mod.id, mod);
}
if (typeof applyResourceConsumerIndex === 'function') applyResourceConsumerIndex([...modules.values()]);
const sandbox = { window: {}, ALL_MODULES: [...modules.values()], MODULE_ENTITY_PROTOTYPES: {}, Workstation: { activeTopology: {} }, console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'src/workstation/scripts/entity_core.js'), 'utf8'), sandbox);
const stable = o => JSON.stringify(Object.fromEntries(
  Object.keys(o)
    .filter(k => k !== 'id' && !(k === 'isCustom' && o[k] === false) && !(k === 'status' && o[k] === 'Active'))
    .sort()
    .map(k => [k, o[k]])
));
function walk(value, fn) {
  if (!value || typeof value !== 'object') return;
  fn(value);
  for (const child of Object.values(value)) walk(child, fn);
}
for (const rel of targets) {
  const file = path.join(root, rel), original = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(original), replacements = new Map();
  let removed = 0, stamped = 0, hydrated = 0;
  walk(data, obj => {
    if (!Array.isArray(obj.items)) return;
    const canonical = new Map(), keep = [];
    const questsFor = id => (obj.quests || []).filter(q => Array.isArray(q.itemIds) && q.itemIds.includes(id)).map(q => String(q.id || '')).sort().join('\u0000');
    for (const item of obj.items) {
      if (!item || typeof item !== 'object') { keep.push(item); continue; }
      const key = [String(item.name || '').toLowerCase().replace(/\s+/g,' ').trim(), String(item.nodeId ?? ''), String(item.moduleId || ''), !!sandbox.isResourceItem(item), String(item.category || '').toLowerCase()].join('\u0000');
      const prev = canonical.get(key);
      // Only truly identical records, with no owner, are safe to merge. Never collapse hand-authored variants.
      if (prev && item.id && prev.id && !item.ownerNpcId && questsFor(item.id) === questsFor(prev.id) && stable(item) === stable(prev) && (!replacements.has(item.id) || replacements.get(item.id) === prev.id)) {
        replacements.set(item.id, prev.id); removed++; continue;
      }
      if (!prev) canonical.set(key, item);
      keep.push(item);
    }
    obj.items = keep;
  });
  // Remap references everywhere in this bundle; never rewrite IDs of surviving entities.
  const referenceFields = /^(itemId|itemIds|entityId|entityIds|targetId|linkedEntityId|linkedItemId)$/i;
  function remap(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, val] of Object.entries(obj)) {
      if (referenceFields.test(key) && typeof val === 'string' && replacements.has(val)) obj[key] = replacements.get(val);
      else if (referenceFields.test(key) && Array.isArray(val)) obj[key] = [...new Set(val.map(v => typeof v === 'string' && replacements.has(v) ? replacements.get(v) : v))];
      else remap(val);
    }
  }
  remap(data);
  walk(data, obj => {
    if (!Array.isArray(obj.items)) return;
    for (const item of obj.items) {
      if (!item || typeof item !== 'object') continue;
      const resource = sandbox.isResourceItem(item), industry = !resource && sandbox.isIndustryItem(item);
      if (!resource && !industry) continue;
      const before = JSON.stringify(item);
      if (resource) { item.isResource = true; item.entityKind = 'resource'; item.resourceSector = sandbox.parseResourceTagMeta(item.name || item.provides || item.category).sector; }
      else { item.entityKind = 'industry'; item.isIndustry = true; }
      if (JSON.stringify(item) !== before) stamped++;
      const mod = modules.get(String(item.moduleId || ''));
      const needsHydration = sandbox.isLegacyBoilerplateNote(item.notes) || /\s+Downstream:\s+In "Granular Mode", it provides\b/i.test(String(item.notes || ''));
      if (!mod || !needsHydration) continue;
      const rich = sandbox.resolveRichEntityMetadata(item, resource ? 'resource' : 'industry');
      if (rich.notes && !sandbox.isLegacyBoilerplateNote(rich.notes) && String(item.notes || '').trim() !== String(rich.notes).trim()) { item.notes = rich.notes; hydrated++; }
      for (const key of ['provides','requires','yields','chain_id','chain_stage']) {
        if ((item[key] == null || item[key] === '' || (Array.isArray(item[key]) && !item[key].length)) && mod[key] != null && mod[key] !== '' && (!Array.isArray(mod[key]) || mod[key].length)) item[key] = mod[key];
      }
    }
  });
  const output = JSON.stringify(data, null, 2) + '\n';
  if (JSON.stringify(data) !== JSON.stringify(JSON.parse(original))) fs.writeFileSync(file, output);
  console.log(`${rel}: removed ${removed} exact clones; classified ${stamped}; hydrated ${hydrated}; ${output === original ? 'unchanged' : 'checked'}`);
}
