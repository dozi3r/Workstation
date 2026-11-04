/**
 * Zero-Token Migration Script:
 * Moves all generic Pre-Industrial Resource Chain modules out of campaigns/Peridot/
 * into the campaign-independent Workstation Mod: mods/pre_industrial_resources/modules/
 * and cleans up orphaned Peridot manifest & wiki entries.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PERIDOT_SET_A = path.join(ROOT, 'campaigns', 'Peridot', 'modules', 'Set_A_Infrastructure_and_Engineering');
const PERIDOT_MANIFEST = path.join(ROOT, 'campaigns', 'Peridot', 'modules_manifest.json');
const MOD_DIR = path.join(ROOT, 'mods', 'pre_industrial_resources');
const MOD_MODULES_DIR = path.join(MOD_DIR, 'modules');

fs.mkdirSync(MOD_MODULES_DIR, { recursive: true });

// Identify generic resource modules vs Peridot native A-01..A-24 modules
const files = fs.readdirSync(PERIDOT_SET_A).filter(f => f.endsWith('.md'));
const movedIds = new Set();
let movedCount = 0;

// Move INFRA-01..09 back to Peridot Set_A if present in MOD_MODULES_DIR
for (const f of fs.readdirSync(MOD_MODULES_DIR).filter(f => /^INFRA-\d+/i.test(f))) {
    const src = path.join(MOD_MODULES_DIR, f);
    const dst = path.join(PERIDOT_SET_A, f);
    fs.writeFileSync(dst, fs.readFileSync(src, 'utf8'), 'utf8');
    fs.unlinkSync(src);
    const oldModWikiSrc = path.join(ROOT, 'wiki', 'src', 'files', 'mods', 'pre_industrial_resources', 'modules', `${f}.md`);
    const oldModWikiPage = path.join(ROOT, 'wiki', 'pages', 'mods', 'pre_industrial_resources', 'modules', `${f}.html`);
    if (fs.existsSync(oldModWikiSrc)) fs.unlinkSync(oldModWikiSrc);
    if (fs.existsSync(oldModWikiPage)) fs.unlinkSync(oldModWikiPage);
}

for (const file of files) {
    // Keep Peridot native modules (INFRA-01..09)
    if (/^INFRA-\d+/i.test(file)) {
        continue;
    }

    const srcPath = path.join(PERIDOT_SET_A, file);
    const destPath = path.join(MOD_MODULES_DIR, file);
    const content = fs.readFileSync(srcPath, 'utf8');

    const idMatch = content.match(/^id:\s*["']?([^"'\r\n]+)["']?/m);
    if (idMatch) movedIds.add(idMatch[1].trim());

    fs.writeFileSync(destPath, content, 'utf8');
    fs.unlinkSync(srcPath);
    movedCount++;

    // Remove old wiki src and page for the Peridot path if present
    const oldWikiSrc = path.join(ROOT, 'wiki', 'src', 'files', 'campaigns', 'Peridot', 'modules', 'Set_A_Infrastructure_and_Engineering', `${file}.md`);
    const oldWikiPage = path.join(ROOT, 'wiki', 'pages', 'campaigns', 'Peridot', 'modules', 'Set_A_Infrastructure_and_Engineering', `${file}.html`);
    if (fs.existsSync(oldWikiSrc)) fs.unlinkSync(oldWikiSrc);
    if (fs.existsSync(oldWikiPage)) fs.unlinkSync(oldWikiPage);
}

// Clean up Peridot modules_manifest.json so moved IDs aren't retained as ghost entries
if (fs.existsSync(PERIDOT_MANIFEST)) {
    try {
        const list = JSON.parse(fs.readFileSync(PERIDOT_MANIFEST, 'utf8'));
        const filtered = list.filter(m => !movedIds.has(String(m.id)));
        fs.writeFileSync(PERIDOT_MANIFEST, JSON.stringify(filtered, null, 2) + '\n', 'utf8');
        console.log(`[OK] Pruned ${list.length - filtered.length} moved modules from Peridot modules_manifest.json (${filtered.length} native Peridot modules remain).`);
    } catch (e) {
        console.warn('[WARN] Could not prune Peridot manifest:', e.message);
    }
}

// Write mod.json
const modJson = {
    id: "pre_industrial_resources",
    name: "Universal Pre-Industrial Resource & Industry Pack",
    version: "1.0.0",
    enabled: true,
    entry: "mod.js",
    description: "Campaign-independent library of 83 pre-industrial extraction, refining, and manufacturing modules across 32 interconnected industry chains."
};
fs.writeFileSync(path.join(MOD_DIR, 'mod.json'), JSON.stringify(modJson, null, 2) + '\n', 'utf8');

// Write mod.js
const modJs = `// ============================================================================
// WORKSTATION MOD: Universal Pre-Industrial Resource & Industry Pack
// Campaign-Independent Industry Chain Catalog (83 Modules / 32 Chains)
// ============================================================================
if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
  window.CreatorStudio.registerMod({
    id: 'pre_industrial_resources',
    name: 'Universal Pre-Industrial Resource & Industry Pack',
    version: '1.0.0',
    description: 'Provides 83 campaign-independent pre-industrial resource and industry modules across 32 supply chains.',
    onInit: function(studio) {
      // Universal mod modules are automatically available in Module Explorer and Industry Chain Importer
    }
  });
}
`;
fs.writeFileSync(path.join(MOD_DIR, 'mod.js'), modJs, 'utf8');

console.log(`[OK] Migrated ${movedCount} generic resource modules to mods/pre_industrial_resources/modules/`);
