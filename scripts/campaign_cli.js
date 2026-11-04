/**
 * Creator Studio - Headless Campaign CLI (scripts/campaign_cli.js)
 *
 * Supports zero-token campaign queries and atomic disk mutations across
 * campaign.json, topology.json, preset.json, maps/*.json, changelog.json,
 * and campaign_sync.js.
 *
 * Usage:
 *   node scripts/campaign_cli.js list-campaigns
 *   node scripts/campaign_cli.js summary --campaign <slug>
 *   node scripts/campaign_cli.js find-node --campaign <slug> --query <nodeName>
 *   node scripts/campaign_cli.js inspect-entity --campaign <slug> --type <npc|quest|item|tracker|faction> --id <ref>
 *   node scripts/campaign_cli.js active-quests --campaign <slug>
 *   node scripts/campaign_cli.js active-clocks --campaign <slug>
 *   node scripts/campaign_cli.js changelog --campaign <slug>
 *   node scripts/campaign_cli.js apply-batch --campaign <slug> [--file <path> | --json <str>]
 *   node scripts/campaign_cli.js import-slice --campaign <slug> --file <path> [--conflict-policy <overwrite|keep_existing|clone>]
 *   node scripts/campaign_cli.js revert-batch --campaign <slug> --batch-id <id>
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CAMPAIGNS_DIR = path.join(ROOT_DIR, 'campaigns');

// Require the shared mutation engine
const CampaignMutationEngine = require(path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js'));

function normalizeSlug(str) {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves a campaign query to an authoritative folder name under campaigns/.
 * Checks:
 *  1. Exact folder name
 *  2. Case-insensitive folder name
 *  3. campaign.json id
 *  4. campaign.json name
 *  5. preset.json id / name
 *  6. Stripped alphanumeric slug match
 */
function resolveCampaignFolder(campaignsDir, query) {
  if (!query) return null;
  const qStr = String(query).trim();
  const qLower = qStr.toLowerCase();
  const qSlug = normalizeSlug(qStr);

  if (!fs.existsSync(campaignsDir)) return null;

  const entries = fs.readdirSync(campaignsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  // 1. Exact match
  if (entries.includes(qStr)) return qStr;

  // 2. Case-insensitive folder match
  const ciMatch = entries.find(e => e.toLowerCase() === qLower);
  if (ciMatch) return ciMatch;

  // 3 & 4. Scan campaign.json and preset.json
  for (const folder of entries) {
    const fPath = path.join(campaignsDir, folder);
    const campJsonPath = path.join(fPath, 'campaign.json');
    if (fs.existsSync(campJsonPath)) {
      try {
        const cData = JSON.parse(fs.readFileSync(campJsonPath, 'utf8'));
        if (cData.id && String(cData.id).toLowerCase() === qLower) return folder;
        if (cData.id && normalizeSlug(cData.id) === qSlug) return folder;
        if (cData.name && String(cData.name).toLowerCase() === qLower) return folder;
        if (cData.name && normalizeSlug(cData.name) === qSlug) return folder;
      } catch (e) {}
    }

    const presetJsonPath = path.join(fPath, 'preset.json');
    if (fs.existsSync(presetJsonPath)) {
      try {
        const pData = JSON.parse(fs.readFileSync(presetJsonPath, 'utf8'));
        if (pData.id && String(pData.id).toLowerCase() === qLower) return folder;
        if (pData.id && normalizeSlug(pData.id) === qSlug) return folder;
        if (pData.name && String(pData.name).toLowerCase() === qLower) return folder;
        if (pData.name && normalizeSlug(pData.name) === qSlug) return folder;
      } catch (e) {}
    }
  }

  // 5. Stripped slug match against folder names
  const slugMatch = entries.find(e => normalizeSlug(e) === qSlug);
  if (slugMatch) return slugMatch;

  return null;
}

/**
 * Loads campaign state from disk into an in-memory mutable state representation.
 */
function loadCampaignState(campDir, folder) {
  const campJsonPath = path.join(campDir, 'campaign.json');
  const topoJsonPath = path.join(campDir, 'topology.json');
  const presetJsonPath = path.join(campDir, 'preset.json');
  const changelogPath = path.join(campDir, 'changelog.json');

  const campData = fs.existsSync(campJsonPath)
    ? JSON.parse(fs.readFileSync(campJsonPath, 'utf8'))
    : { id: folder, name: folder, entities: {} };

  const targetTopoPath = fs.existsSync(topoJsonPath) ? topoJsonPath : presetJsonPath;
  const topoData = fs.existsSync(targetTopoPath)
    ? JSON.parse(fs.readFileSync(targetTopoPath, 'utf8'))
    : { nodes: {}, maps: {} };

  const presetData = fs.existsSync(presetJsonPath)
    ? JSON.parse(fs.readFileSync(presetJsonPath, 'utf8'))
    : null;

  let changelog = [];
  if (fs.existsSync(changelogPath)) {
    try {
      changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf8'));
    } catch (e) {
      changelog = [];
    }
  }
  if (!Array.isArray(changelog)) changelog = [];

  // Normalize entities
  if (!campData.entities) campData.entities = {};
  const categories = ['npcs', 'quests', 'items', 'trackers', 'tickets', 'factions'];
  categories.forEach(cat => {
    if (!Array.isArray(campData.entities[cat])) {
      campData.entities[cat] = Array.isArray(campData[cat])
        ? campData[cat]
        : (topoData.entities && Array.isArray(topoData.entities[cat]) ? topoData.entities[cat] : (Array.isArray(topoData[cat]) ? topoData[cat] : []));
    }
    campData[cat] = campData.entities[cat];
  });

  if (!topoData.entities) topoData.entities = campData.entities;

  // Load per-map JSON files if maps/ folder exists
  const mapsDir = path.join(campDir, 'maps');
  const mapFiles = {};
  if (fs.existsSync(mapsDir) && fs.statSync(mapsDir).isDirectory()) {
    fs.readdirSync(mapsDir).forEach(f => {
      if (f.endsWith('.json')) {
        const mId = path.basename(f, '.json');
        try {
          mapFiles[mId] = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8'));
        } catch (e) {}
      }
    });
  }

  if (!topoData.maps) topoData.maps = {};
  Object.keys(mapFiles).forEach(mId => {
    if (!topoData.maps[mId]) topoData.maps[mId] = mapFiles[mId];
  });

  const syncToken = campData.syncToken || topoData.syncToken || (presetData && presetData.syncToken) || `sync_${Date.now().toString(36)}`;
  const appliedBatchIds = Array.isArray(campData.appliedBatchIds)
    ? campData.appliedBatchIds
    : (Array.isArray(topoData.appliedBatchIds) ? topoData.appliedBatchIds : changelog.map(b => b.batchId).filter(Boolean));

  return {
    id: campData.id || topoData.id || folder,
    name: campData.name || topoData.name || folder,
    folder,
    dir: campDir,
    syncToken,
    appliedBatchIds,
    entities: campData.entities,
    activeTopology: topoData,
    maps: topoData.maps,
    changelog,
    _raw: {
      campData,
      topoData,
      presetData,
      mapFiles,
      campJsonPath,
      topoJsonPath: fs.existsSync(topoJsonPath) ? topoJsonPath : null,
      presetJsonPath: fs.existsSync(presetJsonPath) ? presetJsonPath : null,
      changelogPath
    }
  };
}

/**
 * Atomically writes back mutated campaign state across:
 *  - campaign.json
 *  - topology.json (if present)
 *  - preset.json (if present)
 *  - maps/*.json (if present)
 *  - changelog.json
 *  - campaign_sync.js (window.__CS_LIVE_CAMPAIGNS__)
 * Stamps a fresh syncToken.
 */
function saveCampaignStateToDisk(state, campDir, batchRecord = null) {
  const syncToken = 'sync_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  state.syncToken = syncToken;
  const updatedAt = new Date().toISOString();

  const { campData, topoData, presetData, mapFiles, campJsonPath, topoJsonPath, presetJsonPath, changelogPath } = state._raw;

  // 1. Update campData
  campData.syncToken = syncToken;
  campData.lastSavedAt = updatedAt;
  campData.appliedBatchIds = state.appliedBatchIds;
  campData.entities = state.entities;
  ['npcs', 'quests', 'items', 'trackers', 'tickets', 'factions'].forEach(cat => {
    campData[cat] = state.entities[cat];
  });
  fs.writeFileSync(campJsonPath, JSON.stringify(campData, null, 2) + '\n', 'utf8');

  // 2. Update topoData
  if (topoJsonPath && fs.existsSync(topoJsonPath)) {
    topoData.syncToken = syncToken;
    topoData.lastSavedAt = updatedAt;
    topoData.appliedBatchIds = state.appliedBatchIds;
    topoData.entities = state.entities;
    ['npcs', 'quests', 'items', 'trackers', 'tickets', 'factions'].forEach(cat => {
      topoData[cat] = state.entities[cat];
    });
    if (state.maps) topoData.maps = state.maps;
    fs.writeFileSync(topoJsonPath, JSON.stringify(topoData, null, 2) + '\n', 'utf8');
  }

  // 3. Update presetData
  if (presetJsonPath && fs.existsSync(presetJsonPath) && presetData) {
    presetData.syncToken = syncToken;
    presetData.lastSavedAt = updatedAt;
    presetData.appliedBatchIds = state.appliedBatchIds;
    presetData.entities = state.entities;
    ['npcs', 'quests', 'items', 'trackers', 'tickets', 'factions'].forEach(cat => {
      presetData[cat] = state.entities[cat];
    });
    if (state.activeTopology && state.activeTopology.nodes && presetData.nodes) {
      presetData.nodes = state.activeTopology.nodes;
    }
    if (state.maps && presetData.maps) {
      presetData.maps = state.maps;
    }
    fs.writeFileSync(presetJsonPath, JSON.stringify(presetData, null, 2) + '\n', 'utf8');
  }

  // 4. Update per-map files in maps/
  const mapsDir = path.join(campDir, 'maps');
  if (fs.existsSync(mapsDir) && fs.statSync(mapsDir).isDirectory()) {
    Object.keys(mapFiles).forEach(mId => {
      const mapObj = (state.maps && state.maps[mId]) || mapFiles[mId];
      if (mapObj) {
        fs.writeFileSync(path.join(mapsDir, `${mId}.json`), JSON.stringify(mapObj, null, 2) + '\n', 'utf8');
      }
    });
  }

  // 5. Update changelog.json
  let changelogArr = [];
  if (fs.existsSync(changelogPath)) {
    try {
      changelogArr = JSON.parse(fs.readFileSync(changelogPath, 'utf8'));
    } catch (e) {
      changelogArr = [];
    }
  }
  if (!Array.isArray(changelogArr)) changelogArr = [];
  if (batchRecord) {
    changelogArr.push(batchRecord);
    fs.writeFileSync(changelogPath, JSON.stringify(changelogArr, null, 2) + '\n', 'utf8');
    state.changelog = changelogArr;
  }

  // 6. Write campaign_sync.js
  const syncJsPath = path.join(campDir, 'campaign_sync.js');
  const summary = CampaignMutationEngine.getSummary(state);
  const syncJsContent = `/**
 * Auto-generated by Creator Studio Campaign Mutation Engine.
 * Enables zero-CORS file:/// live reload & sync detection.
 */
window.__CS_LIVE_CAMPAIGNS__ = window.__CS_LIVE_CAMPAIGNS__ || {};
window.__CS_LIVE_CAMPAIGNS__["${state.folder}"] = {
  folder: ${JSON.stringify(state.folder)},
  syncToken: ${JSON.stringify(syncToken)},
  updatedAt: ${JSON.stringify(updatedAt)},
  lastBatchId: ${JSON.stringify(batchRecord ? batchRecord.batchId : (state.appliedBatchIds[state.appliedBatchIds.length - 1] || null))},
  census: ${JSON.stringify(summary.census)}
};
`;
  fs.writeFileSync(syncJsPath, syncJsContent, 'utf8');

  return { syncToken, updatedAt };
}

/**
 * Executes a CLI command programmatically.
 */
function runCliCommand(command, options = {}) {
  const campaignsDir = options.campaignsDir || CAMPAIGNS_DIR;

  if (command === 'list-campaigns') {
    if (!fs.existsSync(campaignsDir)) return { campaigns: [] };
    const folders = fs.readdirSync(campaignsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const list = folders.map(folder => {
      try {
        const state = loadCampaignState(path.join(campaignsDir, folder), folder);
        const sum = CampaignMutationEngine.getSummary(state);
        return {
          folder,
          id: state.id,
          name: state.name,
          syncToken: state.syncToken,
          census: sum.census
        };
      } catch (e) {
        return { folder, error: e.message };
      }
    });
    return { campaigns: list };
  }

  // All other commands require --campaign
  const campaignQuery = options.campaign;
  if (!campaignQuery) {
    throw new Error(`Command "${command}" requires --campaign <name|folder|slug|id>`);
  }

  const folder = resolveCampaignFolder(campaignsDir, campaignQuery);
  if (!folder) {
    throw new Error(`Campaign "${campaignQuery}" not found under ${campaignsDir}`);
  }

  const campDir = path.join(campaignsDir, folder);
  const state = loadCampaignState(campDir, folder);

  switch (command) {
    case 'summary':
      return CampaignMutationEngine.getSummary(state);

    case 'find-node':
      return CampaignMutationEngine.findNode(state, options.query || options.name);

    case 'inspect-entity':
      return CampaignMutationEngine.inspectEntity(state, options.type, options.id || options.name);

    case 'active-quests':
      return CampaignMutationEngine.listActiveQuests(state);

    case 'active-clocks':
      return CampaignMutationEngine.listActiveClocks(state);

    case 'changelog':
      return state.changelog || [];

    case 'apply-batch': {
      let batchPayload = null;
      if (options.file) {
        batchPayload = JSON.parse(fs.readFileSync(options.file, 'utf8'));
      } else if (options.json) {
        batchPayload = typeof options.json === 'string' ? JSON.parse(options.json) : options.json;
      } else {
        throw new Error('apply-batch requires --file <path> or --json <string>');
      }

      const res = CampaignMutationEngine.applyBatch(state, batchPayload);
      if (res.status === 'success') {
        const diskRes = saveCampaignStateToDisk(state, campDir, batchPayload);
        res.syncToken = diskRes.syncToken;
        res.updatedAt = diskRes.updatedAt;
      }
      return res;
    }

    case 'import-slice': {
      let slicePayload = null;
      if (options.file) {
        slicePayload = JSON.parse(fs.readFileSync(options.file, 'utf8'));
      } else if (options.json) {
        slicePayload = typeof options.json === 'string' ? JSON.parse(options.json) : options.json;
      } else {
        throw new Error('import-slice requires --file <path> or --json <string>');
      }

      const policy = options.conflictPolicy || 'overwrite';
      const res = CampaignMutationEngine.applySlice(state, slicePayload, policy);
      if (res.status === 'success') {
        const batchRecord = {
          batchId: res.batchId,
          actor: slicePayload.actor || 'Slice Importer',
          summary: slicePayload.summary || `Imported slice via CLI (${res.changes ? res.changes.length : 0} changes, policy: ${policy})`,
          appliedAt: new Date().toISOString(),
          changes: res.changes || []
        };
        const diskRes = saveCampaignStateToDisk(state, campDir, batchRecord);
        res.syncToken = diskRes.syncToken;
        res.updatedAt = diskRes.updatedAt;
      }
      return res;
    }

    case 'revert-batch': {
      const batchId = options.batchId;
      if (!batchId) throw new Error('revert-batch requires --batch-id <id>');

      const res = CampaignMutationEngine.revertBatch(state, batchId, state.changelog);
      if (res.status === 'reverted') {
        const revertRecord = {
          batchId: res.revertBatchId,
          actor: 'Revert Batch CLI',
          summary: `Reverted batch ${batchId}`,
          appliedAt: new Date().toISOString(),
          changes: res.changes || []
        };
        const diskRes = saveCampaignStateToDisk(state, campDir, revertRecord);
        res.syncToken = diskRes.syncToken;
        res.updatedAt = diskRes.updatedAt;
      }
      return res;
    }

    default:
      throw new Error(`Unknown command: "${command}"`);
  }
}

// --- CLI Runner ---
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(`
Creator Studio 2.5 - Campaign AI CLI
Usage: node scripts/campaign_cli.js <command> [options]

Commands:
  list-campaigns                                 List all installed campaigns
  summary --campaign <c>                         Print campaign census and active entities
  find-node --campaign <c> --query <name>        Find nodes by name/ID
  inspect-entity --campaign <c> --type <t> --id <i> Inspect full entity JSON
  active-quests --campaign <c>                   List active quests and progress
  active-clocks --campaign <c>                   List threat clocks and consequence tiers
  changelog --campaign <c>                       List applied mutation batches
  apply-batch --campaign <c> --file <f>|--json <j> Apply batch mutations atomically
  import-slice --campaign <c> --file <f> [--conflict-policy <p>] Import campaign slice
  revert-batch --campaign <c> --batch-id <b>     Revert an applied batch cleanly
`);
    process.exit(0);
  }

  const options = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--campaign' && args[i + 1]) { options.campaign = args[++i]; }
    else if (args[i] === '--file' && args[i + 1]) { options.file = args[++i]; }
    else if (args[i] === '--json' && args[i + 1]) { options.json = args[++i]; }
    else if (args[i] === '--query' && args[i + 1]) { options.query = args[++i]; }
    else if (args[i] === '--type' && args[i + 1]) { options.type = args[++i]; }
    else if (args[i] === '--id' && args[i + 1]) { options.id = args[++i]; }
    else if (args[i] === '--batch-id' && args[i + 1]) { options.batchId = args[++i]; }
    else if (args[i] === '--conflict-policy' && args[i + 1]) { options.conflictPolicy = args[++i]; }
  }

  try {
    const result = runCliCommand(command, options);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }, null, 2));
    process.exit(1);
  }
}

module.exports = {
  normalizeSlug,
  resolveCampaignFolder,
  loadCampaignState,
  saveCampaignStateToDisk,
  runCliCommand
};
