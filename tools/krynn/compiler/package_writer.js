/**
 * Standalone campaign package writer for the Krynn compiler.
 *
 * Emits the same on-disk layout as map_store.js buildCampaignPackageFiles():
 *   campaign.json, preset.json, topology.json, modules_manifest.json,
 *   campaign_sync.js, modules/<id>.md, maps/<mapId>.json
 *
 * Intentionally does NOT emit changelog.json or chat_history.json (offline-only build;
 * no AI chat). Replaces the CampaignPackageCodec dependency of the original compiler.
 */
'use strict';

function arr(...candidates) {
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

function encodeCampaignPackage(state, opts = {}) {
  const src = state || {};
  const cName = src.name || src.campaignName || opts.campaignName || 'campaign';
  const slug = opts.slug || src.id;
  const nowIso = opts.timestamp || new Date().toISOString();
  const syncToken = opts.syncToken || src.syncToken || `tok_${Date.now().toString(36)}`;

  const cleanMaps = JSON.parse(JSON.stringify(src.maps || {}));
  Object.values(cleanMaps).forEach(m => {
    if (m && m.mapMetadata) {
      delete m.mapMetadata.dataUrl;
      if (typeof m.mapMetadata.url === 'string' && m.mapMetadata.url.startsWith('data:')) delete m.mapMetadata.url;
    }
  });

  const se = src.entities || {};
  const entities = {
    npcs: arr(src.npcs, se.npcs),
    quests: arr(src.quests, se.quests),
    items: arr(src.items, se.items),
    trackers: arr(src.trackers, se.trackers),
    tickets: arr(src.tickets, se.tickets),
    factions: arr(src.factions, se.factions),
    spatialPins: arr(src.spatialPins, se.spatialPins),
    custom_modules: arr(src.custom_modules, se.custom_modules),
    deletedModules: arr(src.deletedModules, se.deletedModules),
    deletedPrototypes: arr(src.deletedPrototypes, se.deletedPrototypes)
  };
  const appliedBatchIds = arr(src.appliedBatchIds);

  const campaignMeta = {
    id: slug,
    name: cName,
    campaignName: cName,
    description: src.description || 'Authored in Creator Studio Pointcrawl Workstation',
    author: src.author || 'Creator Studio World Architect',
    packageType: 'workstation_project',
    enabled: true,
    topologyFile: 'topology.json',
    manifestFile: 'modules_manifest.json',
    updatedAt: nowIso,
    exportedAt: nowIso,
    entryMapId: src.entryMapId,
    entryNodeId: src.entryNodeId,
    globalDials: src.globalDials || { dial8ClimaxTrigger: 'crisis', tier0Substratum: true },
    appliedBatchIds,
    entities,
    syncToken
  };

  const rootMapId = src.rootMapId || Object.keys(cleanMaps).find(k => cleanMaps[k] && !cleanMaps[k].parentMapId) || 'map_root';
  const presetData = {
    id: slug,
    name: cName,
    campaignName: cName,
    description: campaignMeta.description,
    syncToken,
    rootMapId,
    entryMapId: src.entryMapId,
    entryNodeId: src.entryNodeId,
    activeMapId: src.activeMapId || rootMapId,
    maps: cleanMaps,
    edgeData: src.edgeData || {},
    edgeNotes: src.edgeNotes || {},
    layers: src.layers,
    shapes: src.shapes,
    nodes: src.nodes || {},
    links: src.links || [],
    waves: src.waves || [],
    appliedBatchIds,
    spatialPins: entities.spatialPins,
    entities,
    npcs: entities.npcs,
    quests: entities.quests,
    items: entities.items,
    trackers: entities.trackers,
    tickets: entities.tickets,
    factions: entities.factions,
    custom_modules: entities.custom_modules,
    deletedModules: entities.deletedModules,
    deletedPrototypes: entities.deletedPrototypes
  };
  const presetStr = JSON.stringify(presetData, null, 2);

  const files = [];
  const mods = entities.custom_modules.filter(cm => cm && cm.id);
  for (const cm of mods) {
    files.push({ path: `modules/${cm.id}.md`, data: cm.raw_markdown || `# ${cm.title || cm.id}\n` });
  }
  files.push({ path: 'modules_manifest.json', data: JSON.stringify(mods, null, 2) });
  for (const mId of Object.keys(cleanMaps)) {
    if (cleanMaps[mId]) files.push({ path: `maps/${mId}.json`, data: JSON.stringify(cleanMaps[mId], null, 2) + '\n' });
  }
  const lastBatchId = appliedBatchIds.length ? appliedBatchIds[appliedBatchIds.length - 1] : '';
  files.push({
    path: 'campaign_sync.js',
    data:
      `// Auto-generated zero-CORS sync token file\n` +
      `window.__CS_LIVE_CAMPAIGNS__ = window.__CS_LIVE_CAMPAIGNS__ || {};\n` +
      `window.__CS_LIVE_CAMPAIGNS__["${opts.folderName || slug}"] = {\n` +
      `  syncToken: "${syncToken}",\n  lastBatchId: "${lastBatchId}",\n  timestamp: "${nowIso}"\n};\n`
  });
  files.push({ path: 'preset.json', data: presetStr });
  files.push({ path: 'topology.json', data: presetStr });
  files.push({ path: 'campaign.json', data: JSON.stringify(campaignMeta, null, 2) });

  return { cName, slug, files, campaignMeta, presetData, customMods: mods };
}

module.exports = { encodeCampaignPackage };
