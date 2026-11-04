/**
 * Stage 1: Deterministic Zero-Token Peridot Debloat & Mod Partitioning
 * 1. Deletes 6 exact root duplicates in campaigns/Peridot/modules/
 * 2. Merges 3 pure facility overlaps (STARTER-01 -> IND-WHEAT-02, CWT-043 -> IND-STEEL-01, CWT-060A -> IND-COPPER-02)
 * 3. Moves 20 resource/substratum/transit modules to mods/pre_industrial_resources/modules/
 * 4. Creates mods/universal_worldbuilding_library/ and moves 29 universal CWT/STARTER modules there
 * 5. Cleans up orphaned Peridot wiki pages and manifest entries
 * 6. Generates 6 compact worklists in scratch/ for parallel flash_lite v2.0 upgrading
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PERIDOT_MODULES = path.join(ROOT, 'campaigns', 'Peridot', 'modules');
const PERIDOT_MANIFEST = path.join(ROOT, 'campaigns', 'Peridot', 'modules_manifest.json');
const RES_MOD_DIR = path.join(ROOT, 'mods', 'pre_industrial_resources');
const RES_MOD_MODULES = path.join(RES_MOD_DIR, 'modules');
const UWL_MOD_DIR = path.join(ROOT, 'mods', 'universal_worldbuilding_library');
const UWL_MOD_MODULES = path.join(UWL_MOD_DIR, 'modules');
const SCRATCH_DIR = 'C:\\Users\\Milo\\.gemini\\antigravity\\brain\\c9b3618f-aea2-46be-b7c8-dd77eda04ee6\\scratch';

fs.mkdirSync(RES_MOD_MODULES, { recursive: true });
fs.mkdirSync(UWL_MOD_MODULES, { recursive: true });
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

function removeOldPeridotWiki(fileName) {
  const oldSrc = path.join(ROOT, 'wiki', 'src', 'files', 'campaigns', 'Peridot', 'modules', `${fileName}.md`);
  const oldPage = path.join(ROOT, 'wiki', 'pages', 'campaigns', 'Peridot', 'modules', `${fileName}.html`);
  if (fs.existsSync(oldSrc)) fs.unlinkSync(oldSrc);
  if (fs.existsSync(oldPage)) fs.unlinkSync(oldPage);
}

// 1. Delete 6 exact root duplicates
const EXACT_DUPLICATES = [
  'FACT-01_The_5_Sovereign_Hub_Archetypes_and_Smothering.md',
  'FACT-02_The_2_Axis_Sovereign_Tension_Matrix.md',
  'FACT-03_Decapitation_Proof_Mosaic_Governance.md',
  'FACT-04_The_Equilibrium_Engine_and_Stability_Points.md',
  'FACT-06_Tactical_Bastion_Fortification_Ranks.md',
  'SPARK-08_Tarot_Disembark_and_Arrival_Gambit_Tables.md'
];

let deletedDups = 0;
for (const dup of EXACT_DUPLICATES) {
  const p = path.join(PERIDOT_MODULES, dup);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    removeOldPeridotWiki(dup);
    deletedDups++;
  }
}
console.log(`[OK] Deleted ${deletedDups} exact root duplicates from campaigns/Peridot/modules/.`);

// 2. Merge 3 pure facility overlaps into canonical chain stages and delete redundant files
const OVERLAP_MERGES = [
  {
    srcFile: 'STARTER-01_River_Watermill_and_Grain_Silo.md',
    targetFile: 'IND-WHEAT-02_Water_Powered_Gristmill.md',
    extraNote: '\n- **Threat Clock — *Damp Grain Mold Clock [4 Ticks]***: Wet rot ruins winter grain stores if sluice humidity rises.\n- **Threat Clock — *Mill Dam Wear Clock [6 Ticks]***: Floodwater vibrations weaken the heavy timber weir and stone sluice gates.\n'
  },
  {
    srcFile: 'CWT-043_The_Colossal_Foundry_of_Strength_and_Crucible_Steel.md',
    targetFile: 'IND-STEEL-01_Crucible_Steelworks_and_Foundry.md',
    extraNote: '\n- **Threat Clock — *Hydraulic Camshaft Torque Stress Clock [6 Ticks]***: Metal fatigue creeps through the iron-sheathed trip-hammer drive axle.\n'
  },
  {
    srcFile: 'CWT-060A_The_Cypriot_Copper_Smelting_Slag_Foundries.md',
    targetFile: 'IND-COPPER-02_Copper_Smelting_Furnace.md',
    extraNote: '\n- **Threat Clock — *Highland Deforestation Horizon Clock [6 Ticks]***: Continuous charcoal roasting clears highland timber stands; when full, furnaces throttle by 80%.\n- **Threat Clock — *Crucible Slag Pressure Breach Clock [4 Ticks]***: Skipping maintenance or burning green scrub risks a molten slag retaining wall breach.\n'
  }
];

for (const m of OVERLAP_MERGES) {
  const srcPath = path.join(PERIDOT_MODULES, m.srcFile);
  const dstPath = path.join(RES_MOD_MODULES, m.targetFile);
  if (fs.existsSync(dstPath)) {
    let dstText = fs.readFileSync(dstPath, 'utf8');
    if (!dstText.includes(m.extraNote.trim().slice(0, 30))) {
      dstText = dstText.trimEnd() + '\n' + m.extraNote;
      fs.writeFileSync(dstPath, dstText, 'utf8');
    }
  }
  if (fs.existsSync(srcPath)) {
    fs.unlinkSync(srcPath);
    removeOldPeridotWiki(m.srcFile);
  }
}
console.log(`[OK] Merged & deleted 3 overlapping facility modules (STARTER-01, CWT-043, CWT-060A).`);

// 3. Partition remaining root files (except HOOK-01, which is native Peridot)
const RESOURCE_MOD_PREFIXES = [
  'T0-DOM-01', 'T0-DOM-02', 'T0-DOM-03', 'T0-DOM-04', 'T0-DOM-05', 'T0-DOM-06', 'T0-DOM-07', 'T0-DOM-08',
  'CWT-020', 'CWT-021', 'CWT-022', 'CWT-023', 'CWT-024', 'CWT-025',
  'CWT-030', 'CWT-032', 'CWT-033', 'CWT-034', 'CWT-063', 'CWT-064'
];

const rootEntries = fs.readdirSync(PERIDOT_MODULES, { withFileTypes: true });
const movedToRes = [];
const movedToUwl = [];

for (const ent of rootEntries) {
  if (!ent.isFile() || !ent.name.endsWith('.md')) continue;
  if (ent.name.startsWith('HOOK-01')) continue; // Keep HOOK-01 in Peridot

  const srcPath = path.join(PERIDOT_MODULES, ent.name);
  const content = fs.readFileSync(srcPath, 'utf8').replace(/^\uFEFF/, '');

  const isResourceMod = RESOURCE_MOD_PREFIXES.some(pref => ent.name.startsWith(pref));
  if (isResourceMod) {
    const dstPath = path.join(RES_MOD_MODULES, ent.name);
    fs.writeFileSync(dstPath, content, 'utf8');
    fs.unlinkSync(srcPath);
    removeOldPeridotWiki(ent.name);
    movedToRes.push(dstPath);
  } else {
    const dstPath = path.join(UWL_MOD_MODULES, ent.name);
    fs.writeFileSync(dstPath, content, 'utf8');
    fs.unlinkSync(srcPath);
    removeOldPeridotWiki(ent.name);
    movedToUwl.push(dstPath);
  }
}

console.log(`[OK] Relocated ${movedToRes.length} modules to mods/pre_industrial_resources/modules/`);
console.log(`[OK] Relocated ${movedToUwl.length} modules to mods/universal_worldbuilding_library/modules/`);

// 4. Create mod.json and mod.js for mods/universal_worldbuilding_library
const uwlModJson = {
  id: "universal_worldbuilding_library",
  name: "Universal Worldbuilding & CWT Archetype Library",
  version: "2.0.0",
  enabled: true,
  entry: "mod.js",
  description: "Campaign-independent library of 29 universal Climax Engines, Ideological Sanctuaries, Historical Civilizations, and Starter Adventure Sites wired to canonical supply-chain resource tags."
};
fs.writeFileSync(path.join(UWL_MOD_DIR, 'mod.json'), JSON.stringify(uwlModJson, null, 2) + '\n', 'utf8');

const uwlModJs = `// ============================================================================
// WORKSTATION MOD: Universal Worldbuilding & CWT Archetype Library
// Campaign-Independent Climax Engines, Sanctuaries, Civilizations & Starter Sites
// ============================================================================
if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
  window.CreatorStudio.registerMod({
    id: 'universal_worldbuilding_library',
    name: 'Universal Worldbuilding & CWT Archetype Library',
    version: '2.0.0',
    description: 'Provides 29 campaign-independent climax engines, sanctuaries, historical civilization archetypes, and starter adventure sites.',
    onInit: function(studio) {
      // Automatically available across all campaigns via Module Explorer and Industry Chain Importer
    }
  });
}
`;
fs.writeFileSync(path.join(UWL_MOD_DIR, 'mod.js'), uwlModJs, 'utf8');

// 5. Reset Peridot modules_manifest.json to [] so build_suite.js rebuilds it cleanly from the 50 native files
fs.writeFileSync(PERIDOT_MANIFEST, '[]\n', 'utf8');

// 6. Generate 6 worklist files in SCRATCH_DIR for parallel flash_lite v2.0 upgrading
const allToRewrite = [...movedToRes, ...movedToUwl];
const batchSize = Math.ceil(allToRewrite.length / 6);
for (let i = 0; i < 6; i++) {
  const slice = allToRewrite.slice(i * batchSize, (i + 1) * batchSize);
  const specLines = [
    `# v2.0 Schema Upgrade Batch ${i + 1} (${slice.length} Files)`,
    `Upgrade each of the following files IN-PLACE using \`write_file\` (Overwrite: true) to the Unified v2.0 Schema:`,
    ...slice.map((p, idx) => `${idx + 1}. \`${p}\``)
  ];
  fs.writeFileSync(path.join(SCRATCH_DIR, `v2_rewrite_batch_${i + 1}.md`), specLines.join('\n') + '\n', 'utf8');
}
console.log(`[OK] Wrote 6 subagent batch specs covering ${allToRewrite.length} modules.`);
