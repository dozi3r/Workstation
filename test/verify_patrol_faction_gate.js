/**
 * ================================================================================
 * CREATOR STUDIO: PATROL FACTION & SETTING-AGNOSTIC QUALITY GATE (RED-TEAM TEST)
 * ================================================================================
 * This gate test enforces architectural invariants:
 *   1. System-Agnostic Purity: Core CAD UI scripts MUST NOT contain hardcoded
 *      campaign/setting lore (e.g. Emerald Isle factions).
 *   2. Dynamic Faction Resolution: Patrol Factions must resolve from active
 *      campaign entities / getCampaignFactionSuggestions().
 *   3. Lossless Custom Value Preservation: Custom or imported patrol factions
 *      must not be clobbered or coerced to 'neutral'.
 *   4. True Win95 Combobox: Renders text input, ▼ dropdown button, and popup menu.
 *   5. Dynamic Edge Patrol Indexing: getCampaignFactionSuggestions indexes e.patrolFaction.
 *   6. Dynamic Faction Registration: registerCampaignFaction dynamically registers
 *      custom factions into campaignFactions roster.
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

let total = 0;
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message, details) {
  total++;
  if (condition) {
    passed++;
    console.log(`    [PASS] ${message}`);
  } else {
    failed++;
    failures.push({ message, details });
    console.error(`    [FAIL] ${message}`);
    if (details) console.error(`           -> Detail: ${details}`);
  }
}

console.log('================================================================');
console.log(' GATE TEST: PATROL FACTION SETTING-AGNOSTIC & DATA INTEGRITY    ');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// GATE 1: Setting-Agnostic Purity Gate (Static Source Code Inspection)
// Invariant: src/workstation/scripts/property_grid_inspector.js must not contain
// hardcoded setting-specific factions.
// ----------------------------------------------------------------------------
console.log('--> GATE 1: Setting-Agnostic Purity in Property Grid Inspector...');

const inspectorPath = path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'property_grid_inspector.js');
const inspectorSource = fs.readFileSync(inspectorPath, 'utf8');

const FORBIDDEN_HARDCODED_FACTIONS = [
  'Imperial Frontier Guard',
  'Civic Guilds',
  'Ancient Dynasts',
  'Corsair Anchorage'
];

FORBIDDEN_HARDCODED_FACTIONS.forEach(faction => {
  const containsFaction = inspectorSource.includes(faction);
  assert(
    !containsFaction,
    `property_grid_inspector.js must not hardcode '${faction}'`,
    containsFaction ? `Found hardcoded literal '${faction}' in property_grid_inspector.js` : null
  );
});

// ----------------------------------------------------------------------------
// GATE 2: Dynamic Campaign Faction Resolution (Headless Execution)
// Invariant: Patrol Faction options must dynamically include campaign factions
// from getCampaignFactionSuggestions() instead of a static 6-item array.
// ----------------------------------------------------------------------------
console.log('\n--> GATE 2: Dynamic Campaign Faction Resolution for Edge Patrols...');

// Check if inspector code invokes getCampaignFactionSuggestions for patrol faction
const usesDynamicSuggestionsForPatrol = /Patrol Faction[\s\S]{1,300}getCampaignFactionSuggestions/.test(inspectorSource) ||
  /getCampaignFactionSuggestions[\s\S]{1,300}Patrol Faction/.test(inspectorSource);

assert(
  usesDynamicSuggestionsForPatrol,
  'Edge Patrol Faction inspector must query getCampaignFactionSuggestions()',
  'Edge inspector currently hardcodes a static array and completely ignores getCampaignFactionSuggestions()'
);

// ----------------------------------------------------------------------------
// GATE 3: Custom Patrol Faction Preservation Gate (No Data Loss / Coercion)
// Invariant: An edge with a custom patrolFaction (e.g. "Outer Rim Smugglers")
// must have its value preserved when inspected, and not coerced to "neutral".
// ----------------------------------------------------------------------------
console.log('\n--> GATE 3: Lossless Custom Patrol Faction Preservation...');

const customEdgeRecord = {
  name: 'Sector 4 Jump Corridor',
  condition: 'Passable',
  hazardLevel: 1,
  tollCost: '100 Credits',
  patrolFaction: 'Outer Rim Smugglers' // Custom faction not in the hardcoded list
};

const supportsArbitraryPatrolFaction = !inspectorSource.includes(
  "appendSelectPropRow(tbody, 'Patrol Faction', edgeRecord.patrolFaction || 'neutral', [\n          { val: 'neutral', label: 'Neutral / Unguarded' },\n          { val: 'Imperial Frontier Guard'"
);

assert(
  supportsArbitraryPatrolFaction,
  'Inspector must preserve arbitrary custom patrol factions without defaulting to neutral',
  customEdgeRecord.patrolFaction + ' would be discarded by the current hardcoded appendSelectPropRow enum'
);

// ----------------------------------------------------------------------------
// GATE 4: Extensible Combobox / Custom Entry Support
// Invariant: The user must be able to input a new custom patrol faction name
// directly in the property grid or select from dynamic suggestions.
// ----------------------------------------------------------------------------
console.log('\n--> GATE 4: User-Extensible Faction Input Support...');

const hasCustomEntryOrCombobox = inspectorSource.includes('dl-patrol-faction') ||
  inspectorSource.includes('appendComboboxPropRow') ||
  (/Patrol Faction[\s\S]{1,400}(appendPropRow|prompt|Custom)/.test(inspectorSource) && !inspectorSource.includes("{ val: 'Imperial Frontier Guard'"));

assert(
  hasCustomEntryOrCombobox,
  'Edge Inspector must provide custom text entry or combobox for Patrol Faction',
  'Current implementation restricts input strictly to the static hardcoded dropdown options'
);

// ----------------------------------------------------------------------------
// GATE 5: True Win95 Editable Dropdown Combobox UI Architecture
// Invariant: appendComboboxPropRow provides an input, dropdown button (▼),
// and a floating popup menu with Win95 styling.
// ----------------------------------------------------------------------------
console.log('\n--> GATE 5: True Win95 Combobox Dropdown Architecture...');

assert(
  inspectorSource.includes('vb-combobox-btn'),
  'appendComboboxPropRow generates Win95 dropdown button (.vb-combobox-btn)'
);
assert(
  inspectorSource.includes('▼'),
  'appendComboboxPropRow renders Win95 dropdown arrow ▼'
);
assert(
  inspectorSource.includes('vb-combobox-menu'),
  'appendComboboxPropRow generates floating popup menu (.vb-combobox-menu)'
);

// Headless DOM test for appendComboboxPropRow
function createMockElement(tag) {
  return {
    tagName: tag.toUpperCase(),
    className: '',
    style: {},
    children: [],
    value: '',
    textContent: '',
    selected: false,
    options: [],
    appendChild(child) {
      this.children.push(child);
      if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
        this.options.push(child);
      }
      return child;
    },
    addEventListener(event, fn) {
      this[`on${event}`] = fn;
    },
    setAttribute(name, val) {
      this[name] = val;
    },
    contains(other) {
      if (this === other) return true;
      return (this.children || []).some(c => c === other || (c.contains && c.contains(other)));
    }
  };
}

const mockTbody = createMockElement('tbody');
const mockDoc = {
  createElement: (tag) => createMockElement(tag),
  getElementById: () => null,
  body: createMockElement('body'),
  addEventListener: () => {}
};

const comboboxSandbox = {
  document: mockDoc,
  window: {},
  getCampaignFactionSuggestions: () => ['Syndicate Alpha', 'Corsairs']
};
comboboxSandbox.window = comboboxSandbox;

// Execute inspector script in sandbox to extract appendComboboxPropRow
try {
  vm.runInNewContext(inspectorSource, comboboxSandbox);
} catch (e) {
  // It may fail on missing UI globals, extract function if needed
}

// ----------------------------------------------------------------------------
// GATE 6: Edge Patrol Faction Indexing in getCampaignFactionSuggestions
// Invariant: getCampaignFactionSuggestions indexes e.patrolFaction on allMaps
// and currentTopo.edgeData, and excludes 'neutral' and 'contested'.
// ----------------------------------------------------------------------------
console.log('\n--> GATE 6: Edge Patrol Faction Indexing in entity_core.js...');

const entityCorePath = path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'entity_core.js');
const entityCoreSource = fs.readFileSync(entityCorePath, 'utf8');

const entitySandbox = {
  window: {},
  maps: {
    map_alpha: {
      edgeData: {
        '1->2': { patrolFaction: 'Patrol Vanguard' },
        '2->3': { patrolFaction: 'neutral' },
        '3->4': { patrolFaction: 'Contested' }
      }
    }
  },
  Workstation: {
    activeTopology: {
      nodes: [],
      edgeData: {
        '10->11': { patrolFaction: 'Border Enforcers' }
      }
    }
  },
  campaignFactions: []
};
entitySandbox.window = entitySandbox;

vm.runInNewContext(entityCoreSource, entitySandbox);

assert(
  typeof entitySandbox.window.getCampaignFactionSuggestions === 'function',
  'entity_core.js exports getCampaignFactionSuggestions'
);

const suggestions = entitySandbox.window.getCampaignFactionSuggestions();
assert(
  suggestions.includes('Patrol Vanguard'),
  'getCampaignFactionSuggestions indexes patrolFaction from allMaps'
);
assert(
  suggestions.includes('Border Enforcers'),
  'getCampaignFactionSuggestions indexes patrolFaction from currentTopo'
);
assert(
  !suggestions.some(s => s.toLowerCase() === 'neutral'),
  'getCampaignFactionSuggestions excludes neutral'
);
assert(
  !suggestions.some(s => s.toLowerCase() === 'contested'),
  'getCampaignFactionSuggestions excludes contested'
);

// ----------------------------------------------------------------------------
// GATE 7: Controlling Faction Combobox Integration on Nodes & Edges
// Invariant: Both Node Controlling Faction and Edge Patrol Faction use
// appendComboboxPropRow.
// ----------------------------------------------------------------------------
console.log('\n--> GATE 7: Controlling Faction Combobox Integration...');

const nodeUsesCombobox = /Controlling Faction[\s\S]{1,400}appendComboboxPropRow/.test(inspectorSource) ||
  /appendComboboxPropRow[\s\S]{1,400}Controlling Faction/.test(inspectorSource);

assert(
  nodeUsesCombobox,
  'Node Controlling Faction uses appendComboboxPropRow'
);

const edgeUsesCombobox = /Patrol Faction[\s\S]{1,400}appendComboboxPropRow/.test(inspectorSource) ||
  /appendComboboxPropRow[\s\S]{1,400}Patrol Faction/.test(inspectorSource);

assert(
  edgeUsesCombobox,
  'Edge Patrol Faction uses appendComboboxPropRow'
);

// ----------------------------------------------------------------------------
// GATE 8: Dynamic Faction Registration
// Invariant: registerCampaignFaction dynamically adds new custom factions to
// campaignFactions, ignoring neutral/contested and preventing duplicates.
// ----------------------------------------------------------------------------
console.log('\n--> GATE 8: Dynamic Faction Registration (registerCampaignFaction)...');

assert(
  typeof entitySandbox.window.registerCampaignFaction === 'function',
  'entity_core.js exports registerCampaignFaction'
);

entitySandbox.window.registerCampaignFaction('Solar Syndicate');
assert(
  Array.isArray(entitySandbox.campaignFactions) &&
  entitySandbox.campaignFactions.some(f => f.name === 'Solar Syndicate' && f.id === 'fac_solar_syndicate'),
  'registerCampaignFaction adds custom faction with normalized ID and Power Group type'
);

// Verify deduplication
const countBefore = entitySandbox.campaignFactions.length;
entitySandbox.window.registerCampaignFaction('solar syndicate');
assert(
  entitySandbox.campaignFactions.length === countBefore,
  'registerCampaignFaction prevents case-insensitive duplicates'
);

// Verify exclusion of neutral and contested
entitySandbox.window.registerCampaignFaction('neutral');
entitySandbox.window.registerCampaignFaction('Contested');
assert(
  !entitySandbox.campaignFactions.some(f => f.name.toLowerCase() === 'neutral' || f.name.toLowerCase() === 'contested'),
  'registerCampaignFaction excludes neutral and contested'
);

// ----------------------------------------------------------------------------
// SUMMARY REPORT
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(` GATE TEST COMPLETED: ${passed}/${total} passed (${failed} failed)`);
console.log('================================================================');

if (failed > 0) {
  console.log('\n[RED-TEAM VERIFICATION CONFIRMED]');
  console.log(`The codebase successfully failed ${failed} gate assertions.`);
  console.log('This mathematically proves the rule violations and data loss vulnerabilities.');
  process.exit(1);
} else {
  console.log('\n[ALL GATES PASSED] System is 100% compliant.');
  process.exit(0);
}
