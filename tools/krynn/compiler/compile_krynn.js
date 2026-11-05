/**
 * Deep-Module Campaign Compiler for The Chronicles of Krynn (Workstation 2.6)
 * Compiles 3 selectable campaign packages sharing the Ansalon topology, 12 submaps,
 * 5-Tier modules, Factions, NPCs, Relics, Quests, and Threat Clocks:
 *   1. campaigns/Krynn_V1_Heroes_of_the_Lance/
 *   2. campaigns/Krynn_V2_Shadows_of_the_Lance/
 *   3. campaigns/Krynn_V3_Five_Book_Odyssey/
 */
'use strict';

const fs = require('fs');
const path = require('path');

const WORKSTATION_ROOT = path.resolve(__dirname, '..', '..', '..');
const CAMPAIGNS_DIR = path.join(WORKSTATION_ROOT, 'campaigns');

// Local writer replaces the original CampaignPackageCodec (offline-only build, no chat/changelog files).
const CampaignPackageCodec = require('./package_writer.js');
const CampaignMutationEngine = require(path.join(WORKSTATION_ROOT, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js'));

const { buildMacroAnsalonMap, buildAllSubmaps } = require('./data_maps.js');
const { buildFactions, buildItems } = require('./data_factions_and_items.js');
const { buildNpcs } = require('./data_npcs.js');
const { getModuleDefinitions } = require('./data_modules.js');
const { buildTrackers, buildQuests } = require('./data_quests_and_clocks.js');

const EDITION_ADAPTERS = [
  {
    folderName: 'Krynn_V1_Heroes_of_the_Lance',
    slug: 'krynn_v1_heroes_of_the_lance',
    name: 'Krynn (V1): Heroes of the Lance (351 AC)',
    editionMode: 'V1_HEROES_351',
    eraMode: '351_AC',
    description:
      'Play as the canonical Heroes of the Lance (Tanis, Sturm, Caramon, Raistlin, Goldmoon, Riverwind, Tasslehoff, Flint + Laurana, Tika, Gilthanas) starting at the Inn of the Last Home in Autumn 351 AC. Includes all 29 branching "What-If" Crucibles (such as saving Sturm on the High Clerist\'s Tower parapet or keeping the Fellowship unified at Tarsis) plus 2 Relic & Locus Memory Crucible Quests projecting into 346–347 AC (The Soulforge & Brothers in Arms).'
  },
  {
    folderName: 'Krynn_V2_Shadows_of_the_Lance',
    slug: 'krynn_v2_shadows_of_the_lance',
    name: 'Krynn (V2): Shadows of the Lance (351 AC)',
    editionMode: 'V2_SHADOWS_351',
    eraMode: '351_AC',
    description:
      'Start in Autumn 351 AC as a custom non-canonical cohort while the Heroes of the Lance move across Ansalon as Autonomous NPCs driven by the 12-tick Companion Odyssey Clock (TRK_COMPANIONS_ODYSSEY). Features the Tri-Vector Allegiance Sandbox (aid the Heroes\' flanks, race them as Conclave/Freebooter rivals, or hunt and intercept them as Dragonarmy Highlord operatives) plus 2 Relic & Locus Memory Crucible Quests into 346–347 AC.'
  },
  {
    folderName: 'Krynn_V3_Five_Book_Odyssey',
    slug: 'krynn_v3_five_book_odyssey',
    name: 'Krynn (V3): The Five-Book Odyssey (346–352 AC)',
    editionMode: 'V3_346_AC',
    eraMode: '346_AC',
    description:
      'The complete 5-Book Dragonlance Saga starting in Spring 346 AC (The Soulforge & Brothers in Arms) as custom characters alongside young Raistlin, Caramon, and Kitiara at the Tower of Wayreth and the Siege of Hope\'s End, bridging 348–350 AC via The Four-Year Shadow Interlude, and carrying your persistent faction stance and legacy scars through the entire 351–352 AC War of the Lance.'
  }
];

function cleanHumanProse(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    // Remove parenthetical backticked IDs like (`CRUC-13`), (`ITM-BLOODSTONE`), (`Q_AUT_01`, `CRUC-08`)
    .replace(/\s*\((?:`[A-Z0-9_-]+`(?:\s*(?:,|\/|or|and|through)\s*`[A-Z0-9_-]+`)*)\)/g, '')
    // Replace standalone backticked IDs in prose with clean readable text or strip
    .replace(/\s*in `Q_ECHO_01`/g, ' in The Soulforge of Wayreth')
    .replace(/\s*for `Q_ECHO_02`/g, ' for Ashes of the Silver Clutch')
    .replace(/\s*in `Q_SPR_02` and `Q_SPR_03`/g, ' during the Sanction and Neraka campaigns')
    .replace(/`([A-Z0-9_-]+)`/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;!?])/g, '$1')
    .trim();
}

function sanitizeEntitiesHumanProse({ maps, factions, items, npcs, trackers, quests }) {
  Object.values(maps).forEach(m => {
    if (m.customNotes) m.customNotes = cleanHumanProse(m.customNotes);
    (m.nodes || []).forEach(n => {
      if (n.customNotes) n.customNotes = cleanHumanProse(n.customNotes);
      if (n.sensory) n.sensory = cleanHumanProse(n.sensory);
    });
  });
  factions.forEach(f => {
    if (f.description) f.description = cleanHumanProse(f.description);
    if (f.notes) f.notes = cleanHumanProse(f.notes);
  });
  items.forEach(it => {
    if (it.specs) it.specs = cleanHumanProse(it.specs);
    if (it.notes) it.notes = cleanHumanProse(it.notes);
  });
  npcs.forEach(n => {
    if (n.motivation) n.motivation = cleanHumanProse(n.motivation);
    if (n.notes) n.notes = cleanHumanProse(n.notes);
    if (n.leverage) {
      if (n.leverage.vulnerability) n.leverage.vulnerability = cleanHumanProse(n.leverage.vulnerability);
      if (n.leverage.bribe) n.leverage.bribe = cleanHumanProse(n.leverage.bribe);
    }
    if (Array.isArray(n.secretsKnown)) {
      n.secretsKnown.forEach(s => {
        if (s && s.secret) s.secret = cleanHumanProse(s.secret);
      });
    }
    if (Array.isArray(n.relationships)) {
      n.relationships.forEach(r => {
        if (r && r.notes) r.notes = cleanHumanProse(r.notes);
      });
    }
  });
  trackers.forEach(t => {
    if (t.notes) t.notes = cleanHumanProse(t.notes);
    (t.consequences || []).forEach(c => {
      if (c && c.description) c.description = cleanHumanProse(c.description);
    });
  });
  quests.forEach(q => {
    if (q.title) q.title = cleanHumanProse(q.title);
    if (q.name) q.name = cleanHumanProse(q.name);
    if (q.notes) q.notes = cleanHumanProse(q.notes);
    (q.steps || []).forEach(st => {
      if (st.title) st.title = cleanHumanProse(st.title);
      if (st.text) st.text = cleanHumanProse(st.text);
    });
  });
}

function buildKrynnCampaignPackage(adapter) {
  const rootMap = buildMacroAnsalonMap(adapter.eraMode);
  const submaps = buildAllSubmaps();
  const maps = {
    map_ansalon_continent: rootMap,
    ...submaps
  };

  const factions = buildFactions();
  const items = buildItems();
  const npcs = buildNpcs(adapter.editionMode);
  const trackers = buildTrackers(adapter.editionMode);
  const quests = buildQuests(adapter.editionMode);
  const customModules = getModuleDefinitions();

  sanitizeEntitiesHumanProse({ maps, factions, items, npcs, trackers, quests });

  // Convert rootMap.nodes array into object map for top-level state.nodes compatibility
  const rootNodesDict = {};
  rootMap.nodes.forEach(n => {
    rootNodesDict[String(n.id)] = JSON.parse(JSON.stringify(n));
  });

  // Wire bidirectional Quest <-> NPC and Quest <-> Tracker links
  const npcById = new Map(npcs.map(n => [n.id, n]));
  quests.forEach(q => {
    (q.npcIds || []).forEach(nid => {
      const npc = npcById.get(nid);
      if (npc && !npc.questIds.includes(q.id)) {
        npc.questIds.push(q.id);
      }
    });
  });

  const state = {
    id: adapter.slug,
    name: adapter.name,
    campaignName: adapter.name,
    description: adapter.description,
    author: 'Margaret Weis & Tracy Hickman (Adapted for Creator Studio 2.6)',
    rootMapId: 'map_ansalon_continent',
    activeMapId: 'map_ansalon_continent',
    globalDials: {
      dial8ClimaxTrigger: 'crisis',
      tier0Substratum: true
    },
    maps,
    nodes: rootNodesDict,
    links: JSON.parse(JSON.stringify(rootMap.links)),
    edgeData: JSON.parse(JSON.stringify(rootMap.edgeData)),
    edgeNotes: JSON.parse(JSON.stringify(rootMap.edgeNotes)),
    layers: JSON.parse(JSON.stringify(rootMap.layers)),
    shapes: [],
    waves: [],
    spatialPins: [],
    appliedBatchIds: [`batch_init_${adapter.slug}`],
    changelog: [
      {
        batchId: `batch_init_${adapter.slug}`,
        narrative: `Initialized ${adapter.name} from the 6-book Dragonlance Master Lore Vault.`,
        timestamp: new Date().toISOString(),
        changes: []
      }
    ],
    chatHistory: [],
    npcs,
    quests,
    items,
    trackers,
    tickets: [],
    factions,
    custom_modules: customModules,
    deletedModules: [],
    deletedPrototypes: []
  };

  // Run CampaignMutationEngine normalization & Quest<->Clock sync
  if (CampaignMutationEngine && typeof CampaignMutationEngine.applyBatch === 'function') {
    CampaignMutationEngine.applyBatch(state, {
      batchId: `batch_norm_${adapter.slug}`,
      narrative: 'Normalize entities and synchronize bidirectional Quest-Clock links',
      operations: []
    });
  }

  // Encode via CampaignPackageCodec
  const encoded = CampaignPackageCodec.encodeCampaignPackage(state, {
    folderName: adapter.folderName,
    slug: adapter.slug,
    campaignName: adapter.name,
    timestamp: '2026-11-04T20:00:00.000Z',
    syncToken: `tok_${adapter.slug}_v1`
  });

  // Write files to disk
  const targetDir = path.join(CAMPAIGNS_DIR, adapter.folderName);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'modules'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'maps'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'assets'), { recursive: true });

  // Copy 13 map background assets from compiler/assets_src into campaign assets/
  const assetsSrcDir = path.join(__dirname, 'assets_src');
  if (fs.existsSync(assetsSrcDir)) {
    for (const assetFile of fs.readdirSync(assetsSrcDir)) {
      if (/\.(jpg|jpeg|png|webp|gif)$/i.test(assetFile)) {
        fs.copyFileSync(
          path.join(assetsSrcDir, assetFile),
          path.join(targetDir, 'assets', assetFile)
        );
      }
    }
  }

  for (const f of encoded.files) {
    const absFile = path.join(targetDir, f.path);
    fs.mkdirSync(path.dirname(absFile), { recursive: true });
    fs.writeFileSync(absFile, f.data, 'utf8');
  }

  // Verify foreign key integrity across all maps, nodes, npcs, items, quests, trackers, factions
  const allNodeIds = new Set();
  Object.values(maps).forEach(m => {
    (m.nodes || []).forEach(n => allNodeIds.add(String(n.id)));
  });
  const allNpcIds = new Set(npcs.map(n => n.id));
  const allItemIds = new Set(items.map(i => i.id));
  const allTrackerIds = new Set(trackers.map(t => t.id));
  const allFactionIds = new Set(factions.map(f => f.id));

  let fkErrors = 0;
  npcs.forEach(n => {
    if (n.nodeId && !allNodeIds.has(String(n.nodeId))) {
      console.error(`[FK ERROR] ${adapter.folderName}: NPC ${n.id} stationed at unknown node ${n.nodeId}`);
      fkErrors++;
    }
    if (n.factionId && !allFactionIds.has(n.factionId)) {
      console.error(`[FK ERROR] ${adapter.folderName}: NPC ${n.id} references unknown faction ${n.factionId}`);
      fkErrors++;
    }
  });
  items.forEach(it => {
    if (it.nodeId && !allNodeIds.has(String(it.nodeId))) {
      console.error(`[FK ERROR] ${adapter.folderName}: Item ${it.id} stationed at unknown node ${it.nodeId}`);
      fkErrors++;
    }
    if (it.ownerNpcId && !allNpcIds.has(it.ownerNpcId)) {
      console.error(`[FK ERROR] ${adapter.folderName}: Item ${it.id} owned by unknown NPC ${it.ownerNpcId}`);
      fkErrors++;
    }
  });
  quests.forEach(q => {
    if (q.nodeId && !allNodeIds.has(String(q.nodeId))) {
      console.error(`[FK ERROR] ${adapter.folderName}: Quest ${q.id} stationed at unknown node ${q.nodeId}`);
      fkErrors++;
    }
    (q.npcIds || []).forEach(nid => {
      if (!allNpcIds.has(nid)) {
        console.error(`[FK ERROR] ${adapter.folderName}: Quest ${q.id} references unknown NPC ${nid}`);
        fkErrors++;
      }
    });
    (q.itemIds || []).forEach(iid => {
      if (!allItemIds.has(iid)) {
        console.error(`[FK ERROR] ${adapter.folderName}: Quest ${q.id} references unknown Item ${iid}`);
        fkErrors++;
      }
    });
    (q.trackerIds || []).forEach(tid => {
      if (!allTrackerIds.has(tid)) {
        console.error(`[FK ERROR] ${adapter.folderName}: Quest ${q.id} references unknown Tracker ${tid}`);
        fkErrors++;
      }
    });
  });

  if (fkErrors > 0) {
    throw new Error(`Foreign key validation failed for ${adapter.folderName} with ${fkErrors} errors.`);
  }

  console.log(
    `[OK] Compiled ${adapter.folderName} (${adapter.slug}): ` +
    `${Object.keys(maps).length} maps (${allNodeIds.size} total nodes), ` +
    `${factions.length} factions, ${npcs.length} NPCs, ${items.length} items, ` +
    `${quests.length} quests, ${trackers.length} clocks, ${customModules.length} 5-tier modules.`
  );
}

for (const adapter of EDITION_ADAPTERS) {
  buildKrynnCampaignPackage(adapter);
}
