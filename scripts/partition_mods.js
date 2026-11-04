const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MODS_DIR = path.join(ROOT_DIR, 'mods');

const PIR_DIR = path.join(MODS_DIR, 'pre_industrial_resources');
const PIR_MODULES = path.join(PIR_DIR, 'modules');

const UWL_DIR = path.join(MODS_DIR, 'universal_worldbuilding_library');
const UWL_MODULES = path.join(UWL_DIR, 'modules');

const T0_DIR = path.join(MODS_DIR, 'tier_0_settlement_substratum');
const T0_MODULES = path.join(T0_DIR, 'modules');

const TRANSIT_DIR = path.join(MODS_DIR, 'scale_fluid_transit_corridors');
const TRANSIT_MODULES = path.join(TRANSIT_DIR, 'modules');

// 1. Ensure target directories exist
[T0_DIR, T0_MODULES, TRANSIT_DIR, TRANSIT_MODULES].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 2. Create mod.json and mod.js for tier_0_settlement_substratum
const t0Json = {
  id: "tier_0_settlement_substratum",
  name: "Tier 0 Agrarian Settlement Substratum Pack",
  version: "1.0.0",
  enabled: true,
  entry: "mod.js",
  description: "Campaign-independent library of baseline agrarian village and settlement infrastructure modules (T0-DOM-01 through T0-DOM-08)."
};
fs.writeFileSync(path.join(T0_DIR, 'mod.json'), JSON.stringify(t0Json, null, 2) + '\n', 'utf8');

const t0Js = `// ============================================================================
// WORKSTATION MOD: Tier 0 Agrarian Settlement Substratum Pack
// Baseline Vernacular Infrastructure & Agrarian Commons (T0-DOM-01..08)
// ============================================================================
if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
  window.CreatorStudio.registerMod({
    id: 'tier_0_settlement_substratum',
    name: 'Tier 0 Agrarian Settlement Substratum Pack',
    version: '1.0.0',
    description: 'Provides 8 campaign-independent baseline village settlement and agrarian substratum modules.',
    onInit: function(studio) {
      // Automatically registered into Module Explorer and active campaign catalog
    }
  });
}
`;
fs.writeFileSync(path.join(T0_DIR, 'mod.js'), t0Js, 'utf8');

// 3. Create mod.json and mod.js for scale_fluid_transit_corridors
const transitJson = {
  id: "scale_fluid_transit_corridors",
  name: "Scale-Fluid Transit Corridors Pack",
  version: "1.0.0",
  enabled: true,
  entry: "mod.js",
  description: "Campaign-independent library of scale-fluid edge corridor modules slottable onto pointcrawl road edges."
};
fs.writeFileSync(path.join(TRANSIT_DIR, 'mod.json'), JSON.stringify(transitJson, null, 2) + '\n', 'utf8');

const transitJs = `// ============================================================================
// WORKSTATION MOD: Scale-Fluid Transit Corridors Pack
// Edge Corridor Modules Slottable onto Pointcrawl Roads (CWT-020..025)
// ============================================================================
if (typeof window !== 'undefined' && window.CreatorStudio && typeof window.CreatorStudio.registerMod === 'function') {
  window.CreatorStudio.registerMod({
    id: 'scale_fluid_transit_corridors',
    name: 'Scale-Fluid Transit Corridors Pack',
    version: '1.0.0',
    description: 'Provides 6 campaign-independent scale-fluid edge corridor modules slottable onto pointcrawl road edges.',
    onInit: function(studio) {
      // Automatically registered into Module Explorer and Edge slotting catalog
    }
  });
}
`;
fs.writeFileSync(path.join(TRANSIT_DIR, 'mod.js'), transitJs, 'utf8');

// 4. Move T0-DOM-01..08 from pre_industrial_resources to tier_0_settlement_substratum
const pirFiles = fs.readdirSync(PIR_MODULES);
let movedT0 = 0;
let movedTransit = 0;
let movedUwl = 0;

pirFiles.forEach(f => {
  const src = path.join(PIR_MODULES, f);
  if (f.startsWith('T0-DOM-')) {
    const dest = path.join(T0_MODULES, f);
    fs.renameSync(src, dest);
    movedT0++;
  } else if (f.startsWith('CWT-02')) {
    // Strip fake chain_id from edge corridor modules so they don't pollute the Node Importer
    let content = fs.readFileSync(src, 'utf8');
    content = content.replace(/^chain_id:\s*["']?CHAIN-TRANSIT["']?\r?\n/m, '');
    content = content.replace(/^chain_stage:\s*\d+\r?\n/m, '');
    content = content.replace(/^chain_role:\s*["']?[^"'\r\n]+["']?\r?\n/m, '');
    const dest = path.join(TRANSIT_MODULES, f);
    fs.writeFileSync(dest, content, 'utf8');
    fs.unlinkSync(src);
    movedTransit++;
  } else if (f.startsWith('CWT-03') || f.startsWith('CWT-06')) {
    // Move CWT survival / historical civilization modules to UWL
    let content = fs.readFileSync(src, 'utf8');
    // Strip artificial chain_id from standalone worldbuilding modules
    content = content.replace(/^chain_id:\s*["']?CHAIN-BIORESOURCE["']?\r?\n/m, '');
    content = content.replace(/^chain_stage:\s*\d+\r?\n/m, '');
    content = content.replace(/^chain_role:\s*["']?[^"'\r\n]+["']?\r?\n/m, '');
    const dest = path.join(UWL_MODULES, f);
    fs.writeFileSync(dest, content, 'utf8');
    fs.unlinkSync(src);
    movedUwl++;
  }
});

// Also clean up any fake chain_ids in existing UWL modules (CWT-010..015, CWT-040..078)
const uwlFiles = fs.readdirSync(UWL_MODULES);
let cleanedUwlChains = 0;
uwlFiles.forEach(f => {
  const p = path.join(UWL_MODULES, f);
  let content = fs.readFileSync(p, 'utf8');
  if (/^chain_id:\s*["']?(?:CHAIN-CIVILIZATION|CHAIN-CLIMAX)["']?/m.test(content)) {
    content = content.replace(/^chain_id:\s*["']?(?:CHAIN-CIVILIZATION|CHAIN-CLIMAX)["']?\r?\n/m, '');
    content = content.replace(/^chain_stage:\s*\d+\r?\n/m, '');
    content = content.replace(/^chain_role:\s*["']?[^"'\r\n]+["']?\r?\n/m, '');
    fs.writeFileSync(p, content, 'utf8');
    cleanedUwlChains++;
  }
});

console.log(`[SUCCESS] Partitioning Complete:`);
console.log(`- Moved ${movedT0} Tier 0 modules to mods/tier_0_settlement_substratum/modules`);
console.log(`- Moved ${movedTransit} Transit Corridor modules to mods/scale_fluid_transit_corridors/modules`);
console.log(`- Moved ${movedUwl} CWT modules to mods/universal_worldbuilding_library/modules`);
console.log(`- Cleaned artificial chain_ids from ${cleanedUwlChains} UWL modules.`);
console.log(`- Remaining modules in pre_industrial_resources: ${fs.readdirSync(PIR_MODULES).length}`);
console.log(`- Modules in tier_0_settlement_substratum: ${fs.readdirSync(T0_MODULES).length}`);
console.log(`- Modules in scale_fluid_transit_corridors: ${fs.readdirSync(TRANSIT_MODULES).length}`);
console.log(`- Modules in universal_worldbuilding_library: ${fs.readdirSync(UWL_MODULES).length}`);
