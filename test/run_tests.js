/**
 * ================================================================================
 * CREATOR STUDIO: MASTER HEADLESS JS SYNTAX & UNIT TEST SUITE (ZERO DEPENDENCIES)
 * ================================================================================
 * AUTHORITATIVE SPECIFICATIONS:
 *   - docs/srd/authoring_engine_srd.md
 *   - docs/adr/0004-desktop-workstation-start-html.md
 *   - docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const ROOT = ROOT_DIR;

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures = [];

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`    [PASS] ${message}`);
  } else {
    failedAssertions++;
    failures.push(message);
    console.error(`    [FAIL] ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  assert(actualStr === expectedStr, `${message} (Expected: ${expectedStr}, Got: ${actualStr})`);
}

// Engine seam for hand-built vm sandboxes (SYS-ARCH-01).
// campaign_mutation_engine.js is a UMD kernel: require() takes the Node branch and publishes no root
// globals, while the browser branch (start.html) mirrors the engine onto window. Any sandbox that loads a
// script which resolves engine globals at runtime must be handed the same globals explicitly.
// ENGINE_ROOT_ALIASES mirrors the UMD tail (Suite 48 proves the two lists cannot drift apart).
const ENGINE_ROOT_ALIASES = [
  'formatCorridorKey', 'parseCorridorKey', 'corridorMatchesNode', 'addCorridor', 'removeCorridor',
  'removeCorridorsForNode', 'ensureQueryableNodesCollection', 'getNodesList', 'getNodesMap',
  'getNodeById', 'upsertNode', 'removeNode', 'normalizeSpatialPin'
];
function injectEngine(sandbox) {
  const engine = require(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_mutation_engine.js'));
  const win = (sandbox.window && typeof sandbox.window === 'object' && sandbox.window !== sandbox) ? sandbox.window : null;
  const studio = sandbox.CreatorStudio || (win && win.CreatorStudio) || {};
  studio.ai = engine;
  [sandbox, win].forEach(root => {
    if (!root) return;
    root.CreatorStudio = studio;
    root.CampaignMutationEngine = engine;
    ENGINE_ROOT_ALIASES.forEach(name => { root[name] = engine[name]; });
  });
  return engine;
}

console.log('================================================================');
console.log('     CREATOR STUDIO: HEADLESS JS SYNTAX & UNIT TEST RUNNER      ');
console.log('================================================================\n');

const suiteStartTime = Date.now();

// ============================================================================
// SUITE 1: HTML SURFACE SCRIPT SYNTAX AUDIT
// ============================================================================
console.log('--> SUITE 1: Inline JavaScript Syntax Validation across HTML Surfaces...');

const HTML_SURFACES = [
  'start.html',
  'admin.html',
  'index.html',
  'network/campaign_studio.html',
  'network/contradiction_matrix_dashboard.html',
  'network/network_builder.html',
  'network/platform_audit_dashboard.html',
  'network/odv_archetype_matrix.html',
  'tickets/unified_ticket_tracker.html',
  'tickets/tier_0/tier_0_project_visualizer.html'
];

HTML_SURFACES.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    assert(false, `Required HTML surface exists: ${relPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptIndex = 0;
  let surfaceSyntaxOk = true;

  while ((match = regex.exec(content)) !== null) {
    const attrs = match[1];
    const code = match[2];

    // Skip non-executable data or template script tags
    if (/type\s*=\s*["'](?:application\/json|text\/template)["']/i.test(attrs)) {
      continue;
    }

    if (!code.trim()) continue;

    scriptIndex++;
    try {
      new vm.Script(code, { filename: `${relPath}#script${scriptIndex}` });
    } catch (err) {
      surfaceSyntaxOk = false;
      assert(false, `Syntax error in ${relPath} (Script #${scriptIndex}): ${err.message}`);
    }
  }

  assert(surfaceSyntaxOk && scriptIndex > 0, `${relPath} verified (${scriptIndex} executable script tag(s) syntactically valid)`);
});

// Verify start.html top-level runtime boot & Workstation initialization (prevents TDZ / ReferenceError regressions)
(function testStartHtmlRuntimeBoot() {
  const startContent = fs.readFileSync(path.join(ROOT_DIR, 'start.html'), 'utf8');
  const scriptMatch = startContent.match(/<script>([\s\S]*?)<\/script>/i);
  assert(!!scriptMatch, 'start.html contains main runtime <script> block');
  const makeStubEl = () => ({
    style: {},
    dataset: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    appendChild: () => {},
    removeChild: () => {},
    setAttribute: () => {},
    getAttribute: () => '',
    setAttributeNS: () => {},
    addEventListener: () => {},
    closest: () => makeStubEl(),
    querySelector: () => makeStubEl(),
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    innerHTML: '',
    textContent: '',
    value: ''
  });
  const bootSandbox = {
    window: {},
    TextEncoder,
    TextDecoder,
    Uint8Array,
    DataView,
    ArrayBuffer,
    Promise,
    JSON,
    Math,
    Date,
    RegExp,
    Map,
    Set,
    Error,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    document: {
      getElementById: () => makeStubEl(),
      querySelector: () => makeStubEl(),
      querySelectorAll: () => [],
      addEventListener: () => {},
      createElement: () => makeStubEl(),
      createElementNS: () => makeStubEl(),
      body: makeStubEl()
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    indexedDB: { open: () => ({}) },
    location: { href: 'file:///start.html', search: '' },
    navigator: {},
    console,
    setTimeout: () => {},
    setInterval: () => {},
    clearTimeout: () => {},
    clearInterval: () => {},
    requestAnimationFrame: () => {},
    Blob,
    URL: { createObjectURL: () => '', revokeObjectURL: () => '' },
    FileReader: class {}
  };
  bootSandbox.window = bootSandbox;
  bootSandbox.window.addEventListener = () => {};
  bootSandbox.globalThis = bootSandbox;
  vm.runInNewContext(scriptMatch[1], bootSandbox, { filename: 'start.html#boot' });
  assert(typeof bootSandbox.openLoadPresetModal === 'function' && typeof bootSandbox.toggleMenu === 'function', 'start.html runtime executes top-to-bottom without ReferenceError and registers UI handlers');
  // SYS-ARCH-01: the engine loads first, so the bundle publishes its seam from the UMD tail with no state_adapter.js alias block
  assert(typeof bootSandbox.getNodesList === 'function' && typeof bootSandbox.ensureQueryableNodesCollection === 'function' && typeof bootSandbox.normalizeSpatialPin === 'function', 'start.html runtime publishes the engine seam aliases (getNodesList, ensureQueryableNodesCollection, normalizeSpatialPin)');
  assert(bootSandbox.normalizeSpatialPin === bootSandbox.CampaignMutationEngine.normalizeSpatialPin, 'start.html runtime normalizeSpatialPin is the engine function');
  assert(typeof bootSandbox.CampaignStateAdapter === 'undefined', 'start.html runtime defines no CampaignStateAdapter alias bag');
})();

async function testZeroCorsZip() {
  console.log('\n--> SUITE 2: ZeroCorsZip Engine (Creation, Signatures, CRC32, Round-Trip Parse)...');
  const zipEnginePath = path.join(ROOT_DIR, 'src/workstation/scripts/zip_engine.js');
  const zipCode = fs.readFileSync(zipEnginePath, 'utf8');

  const sandbox = {
    window: {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    TextEncoder,
    TextDecoder,
    Uint8Array,
    DataView,
    ArrayBuffer,
    Blob,
    console
  };
  vm.createContext(sandbox);
  vm.runInContext(zipCode, sandbox);

  const ZeroCorsZip = sandbox.window.ZeroCorsZip;
  assert(typeof ZeroCorsZip === 'function', 'ZeroCorsZip class is exported on window');

  const zip = new ZeroCorsZip();

  // Test adding various payload types
  const sampleText = 'Welcome to Creator Studio Zero-CORS Workstation!';
  const sampleJson = { campaign: 'Silica Island', nodes: 22, active: true };
  const sampleBinary = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF, 0xCA, 0xFE, 0xBA, 0xBE]);

  zip.addFile('manifest.txt', sampleText);
  zip.addFile('data/campaign.json', JSON.stringify(sampleJson, null, 2));
  zip.addFile('assets/marker.bin', sampleBinary);

  assert(zip.files.length === 3, 'ZeroCorsZip contains 3 staged files');
  assert(zip.files[0].path === 'manifest.txt', 'File 1 normalized path is correct');
  assert(zip.files[1].path === 'data/campaign.json', 'File 2 normalized nested path is correct');

  // Verify CRC32 calculation
  const manifestFile = zip.files[0];
  assert(typeof manifestFile.crc === 'number' && manifestFile.crc > 0, `CRC32 computed for manifest.txt: 0x${manifestFile.crc.toString(16)}`);

  // Generate binary ZIP Blob
  const blob = zip.generateBlob();
  assert(blob instanceof Blob, 'generateBlob returns a standard Blob');
  assert(blob.type === 'application/zip', 'Blob MIME type is application/zip');
  assert(blob.size > 0, `Blob size is valid: ${blob.size} bytes`);

  const arrayBuffer = await blob.arrayBuffer();
  const dataView = new DataView(arrayBuffer);

  // Check PKWARE Local File Header signature: 0x04034b50
  const firstSig = dataView.getUint32(0, true);
  assertEqual(firstSig, 0x04034b50, 'ZIP starts with PKWARE Local File Header signature (0x04034b50)');

  // Round-trip parse using ZeroCorsZip.parse()
  const extractedFiles = await ZeroCorsZip.parse(arrayBuffer);
  const fileKeys = Object.keys(extractedFiles);
  assert(fileKeys.includes('manifest.txt'), 'Parsed archive contains manifest.txt');
  assert(fileKeys.includes('data/campaign.json'), 'Parsed archive contains data/campaign.json');
  assert(fileKeys.includes('assets/marker.bin'), 'Parsed archive contains assets/marker.bin');

  // Verify extracted content fidelity
  const textDecoder = new TextDecoder();
  const extractedText = textDecoder.decode(extractedFiles['manifest.txt']);
  assertEqual(extractedText, sampleText, 'manifest.txt contents preserved 100% lossless');

  const extractedObj = JSON.parse(textDecoder.decode(extractedFiles['data/campaign.json']));
  assertEqual(extractedObj, sampleJson, 'campaign.json JSON preserved 100% lossless');

  const extractedBin = extractedFiles['assets/marker.bin'];
  assertEqual(Array.from(extractedBin), Array.from(sampleBinary), 'Binary payload preserved 100% byte-for-byte');

  // --- Obsidian Markdown Vault Exporter Verification ---
  const exporterPath = path.join(ROOT_DIR, 'src/workstation/scripts/campaign_exporter.js');
  const exporterCode = fs.readFileSync(exporterPath, 'utf8');
  vm.runInContext(exporterCode, sandbox);

  // 1. Windows Filename Sanitizer
  const sanitize = sandbox.sanitizeVaultFileName || sandbox.window.sanitizeVaultFileName;
  assert(typeof sanitize === 'function', 'sanitizeVaultFileName is exported');
  assertEqual(sanitize('The Citadel: Crown of the Sun? *<Special>|'), 'The Citadel_ Crown of the Sun_ __Special__', 'Strips illegal Windows filename chars');
  assertEqual(sanitize('Dangerous Node Name...   '), 'Dangerous Node Name', 'Strips trailing dots and spaces');
  const longName = 'A'.repeat(100);
  assertEqual(sanitize(longName).length, 64, 'Truncates filename to 64 chars');

  // 2. Frontmatter Escaping
  const formatFm = sandbox.formatYamlFrontmatter || sandbox.window.formatYamlFrontmatter;
  assert(typeof formatFm === 'function', 'formatYamlFrontmatter is exported');
  const testFm = formatFm({
    title: 'The Bastion: Outer Wall',
    id: 42,
    tags: ['fortress', 'high-danger'],
    notes: 'Quote: "Beware of shadows"'
  });
  assert(testFm.includes('title: "The Bastion: Outer Wall"'), 'Frontmatter quotes strings with colons');
  assert(testFm.includes('notes: "Quote: \\"Beware of shadows\\""'), 'Frontmatter escapes quotes in strings');
  assert(testFm.includes('id: 42'), 'Frontmatter formats numeric ID');

  // 3. Vault Files Generation & Wikilinks
  const buildVault = sandbox.buildObsidianVaultFiles || sandbox.window.buildObsidianVaultFiles;
  assert(typeof buildVault === 'function', 'buildObsidianVaultFiles is exported');

  const mockTopo = {
    name: 'Isle of Whispers: Act I',
    nodes: {
      '1': {
        id: 1,
        name: 'The Sunken Citadel: Lower Level',
        tier: 2,
        culture: 'Hierarchy',
        odv: { s: 3, e: 2, c: 3 },
        danger: 3,
        description: 'Flooded stone vaults beneath the tide.'
      },
      '2': {
        id: 2,
        name: 'Rebel Cove',
        tier: 2,
        culture: 'Adhocracy',
        odv: { s: 1, e: 3, c: 2 },
        danger: 2,
        description: 'Hidden cove of the reef-raiders.'
      }
    },
    edges: [
      { source: 1, target: 2, type: 'road', weight: 2, danger: 3 }
    ],
    factions: [
      {
        id: 'fac_1',
        name: 'The Reef Raiders',
        cvfQuadrant: 'Adhocracy',
        colorIdentity: 'U/R',
        leaderNpcId: 'npc_1',
        headquartersNodeId: 2,
        controlledNodeIds: [2],
        diplomaticStances: {},
        description: 'Free-roaming corsairs fighting the colonial crown.'
      }
    ],
    npcs: [
      {
        id: 'npc_1',
        name: 'Captain Kaelen: The Red-Eyed',
        role: 'Corsair Leader',
        factionId: 'fac_1',
        nodeId: 2,
        odv: { s: 1, e: 4, c: 2 },
        motivation: 'Free the reef from imperial control.',
        relationships: [
          { targetNpcId: 'npc_2', relationshipType: 'Rival', sentiment: -75, notes: 'Historic naval duel' }
        ]
      },
      {
        id: 'npc_2',
        name: 'Commander Sarah',
        role: 'Garrison Commander',
        nodeId: 1,
        odv: { s: 4, e: 2, c: 3 }
      }
    ],
    quests: [
      {
        id: 'quest_1',
        name: 'The Sunken Relic',
        status: 'active',
        threat: 'High',
        nodeId: 1,
        npcIds: ['npc_1', 'npc_2'],
        itemIds: ['item_1'],
        description: 'Retrieve the tide-stone before the citadel floods.'
      }
    ],
    items: [
      {
        id: 'item_1',
        name: 'Tide-Stone of the Deep',
        category: 'Relic',
        possessionMode: 'stored',
        nodeId: 1,
        specs: 'Controls coastal water levels'
      }
    ]
  };

  const vaultFiles = buildVault(mockTopo);
  assert(Array.isArray(vaultFiles) && vaultFiles.length >= 7, 'buildObsidianVaultFiles generated full suite of vault notes');

  const vPaths = vaultFiles.map(f => f.path);
  assert(vPaths.includes('.obsidian/app.json'), 'Vault contains .obsidian/app.json');
  assert(vPaths.includes('.obsidian/core-plugins.json'), 'Vault contains .obsidian/core-plugins.json');
  assert(vPaths.includes('_Index.md'), 'Vault contains _Index.md');
  assert(vPaths.some(p => p.startsWith('Nodes/')), 'Vault contains Nodes directory notes');
  assert(vPaths.some(p => p.startsWith('Characters/')), 'Vault contains Characters directory notes');
  assert(vPaths.some(p => p.startsWith('Factions/')), 'Vault contains Factions directory notes');
  assert(vPaths.some(p => p.startsWith('Quests/')), 'Vault contains Quests directory notes');
  assert(vPaths.some(p => p.startsWith('Items/')), 'Vault contains Items directory notes');

  // Verify aliased wikilinks and sanitized filename in Character file
  const kaelenNote = vaultFiles.find(f => f.path.includes('Kaelen'));
  assert(kaelenNote !== undefined, 'Found Captain Kaelen character note');
  assert(kaelenNote.content.includes('[[Factions/The Reef Raiders]]') || kaelenNote.content.includes('[[Factions/The Reef Raiders|The Reef Raiders]]'), 'Character note links to Faction');
  assert(kaelenNote.content.includes('Rival'), 'Character note contains relationship type Rival');
  assert(kaelenNote.content.includes('-75'), 'Character note contains negative sentiment -75');

  // 4. Round-trip ZIP generation and extraction
  const vaultZip = new ZeroCorsZip();
  vaultFiles.forEach(f => vaultZip.addFile(f.path, f.content));
  const vBlob = vaultZip.generateBlob();
  assert(vBlob.size > 500, `Obsidian Vault ZIP archive generated (${vBlob.size} bytes)`);

  const vBuffer = await vBlob.arrayBuffer();
  const vExtracted = await ZeroCorsZip.parse(vBuffer);
  assert(vExtracted['_Index.md'] !== undefined, 'Extracted vault contains _Index.md');
  const extractedIndexText = textDecoder.decode(vExtracted['_Index.md']);
  assert(extractedIndexText.includes('Isle of Whispers: Act I'), 'Extracted _Index.md preserves title and content');
}

function testSelectiveImporter() {
  console.log('\n--> SUITE 3: Selective Sub-Map Importer (Conflict Detection & Resolution Strategies)...');
  const importerPath = path.join(ROOT_DIR, 'src/workstation/scripts/selective_importer.js');
  const importerCode = fs.readFileSync(importerPath, 'utf8');

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: { getElementById: () => null },
    console,
    TextEncoder,
    TextDecoder
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(importerCode, sandbox);

  const detectEntityConflicts = sandbox.window.detectEntityConflicts;
  const mergeEntitiesWithResolutions = sandbox.window.mergeEntitiesWithResolutions;

  assert(typeof detectEntityConflicts === 'function', 'detectEntityConflicts is exposed on window');
  assert(typeof mergeEntitiesWithResolutions === 'function', 'mergeEntitiesWithResolutions is exposed on window');

  // Base Topology
  const curTopo = {
    npcs: [
      { id: 'npc_01', name: 'Goran Vance', role: 'Watch Captain', faction: 'City Guard', motivation: 'Law and Order' }
    ],
    quests: [
      { id: 'quest_01', title: 'The Lost Scepter', type: 'Retrieval', threat: 'Bandits', status: 'active', notes: 'Find scepter' }
    ],
    items: [
      { id: 'item_01', name: 'Obsidian Dagger', category: 'Weapon', specs: '+1 Piercing', notes: 'Ancient blade' }
    ],
    trackers: [
      { id: 'trk_01', name: 'City Siege Clock', type: 'Threat Clock', maxTicks: 6, faction: 'Invaders' }
    ],
    tickets: [
      { id: 'tkt_01', title: 'Fortify Gates', status: 'open', priority: 'High', syllogism: 'Stone > Siege' }
    ]
  };

  // Incoming Package with 1 conflict per category + 1 new entity
  const incoming = {
    npcs: [
      { id: 'npc_01', name: 'Goran Vance', role: 'Rebel General', faction: 'Sylvan League', motivation: 'Overthrow King' },
      { id: 'npc_new', name: 'Elara Moon', role: 'Archivist', faction: 'Royal Library', motivation: 'Preserve lore' }
    ],
    quests: [
      { id: 'quest_01', title: 'The Lost Scepter', type: 'Escort', threat: 'Assassins', status: 'shipped', notes: 'Scepter found' }
    ],
    items: [
      { id: 'item_01', name: 'Obsidian Dagger', category: 'Relic', specs: '+3 Shadow Dmg', notes: 'Cursed edge' }
    ],
    trackers: [
      { id: 'trk_01', name: 'City Siege Clock', type: 'Progress Bar', maxTicks: 8, faction: 'Defenders' }
    ],
    tickets: [
      { id: 'tkt_01', title: 'Fortify Gates', status: 'closed', priority: 'Low', syllogism: 'Gates are breached' }
    ]
  };

  // 1. Conflict Detection
  const conflicts = detectEntityConflicts(incoming, curTopo);
  assertEqual(conflicts.length, 5, 'Detects exactly 5 conflicting entities (1 per category)');
  assert(conflicts.some(c => c.category === 'npcs' && c.diffs.length >= 2), 'NPC conflict detected with multiple field diffs (role, faction, motivation)');
  assert(conflicts.some(c => c.category === 'quests' && c.diffs.length >= 2), 'Quest conflict detected with diffs (type, threat, status, notes)');
  assert(conflicts.some(c => c.category === 'items' && c.diffs.length >= 2), 'Item conflict detected with diffs (category, specs, notes)');

  // 2. Resolution Strategy: 'keep_existing'
  const topoKeep = JSON.parse(JSON.stringify(curTopo));
  mergeEntitiesWithResolutions(topoKeep, incoming, conflicts, {
    0: 'keep_existing',
    1: 'keep_existing',
    2: 'keep_existing',
    3: 'keep_existing',
    4: 'keep_existing'
  });
  assertEqual(topoKeep.npcs.find(n => n.id === 'npc_01').role, 'Watch Captain', 'Keep Existing: Retains current NPC role');
  assert(topoKeep.npcs.some(n => n.id === 'npc_new'), 'Keep Existing: Non-conflicting entity Elara Moon is merged');
  assertEqual(topoKeep.npcs.length, 2, 'Keep Existing: Correct total NPC count (1 original + 1 new)');

  // 3. Resolution Strategy: 'overwrite'
  const topoOverwrite = JSON.parse(JSON.stringify(curTopo));
  mergeEntitiesWithResolutions(topoOverwrite, incoming, conflicts, {
    0: 'overwrite',
    1: 'overwrite',
    2: 'overwrite',
    3: 'overwrite',
    4: 'overwrite'
  });
  assertEqual(topoOverwrite.npcs.find(n => n.id === 'npc_01').role, 'Rebel General', 'Overwrite: Updates NPC role to incoming value');
  assertEqual(topoOverwrite.quests.find(q => q.id === 'quest_01').status, 'shipped', 'Overwrite: Updates Quest status to incoming value');
  assertEqual(topoOverwrite.items.find(i => i.id === 'item_01').category, 'Relic', 'Overwrite: Updates Item category to incoming value');

  // 4. Resolution Strategy: 'clone'
  const topoClone = JSON.parse(JSON.stringify(curTopo));
  mergeEntitiesWithResolutions(topoClone, incoming, conflicts, {
    0: 'clone',
    1: 'clone',
    2: 'clone',
    3: 'clone',
    4: 'clone'
  });
  assertEqual(topoClone.npcs.find(n => n.id === 'npc_01').role, 'Watch Captain', 'Clone: Preserves original entity intact');
  const clonedNpc = topoClone.npcs.find(n => n.name.includes('(Imported)'));
  assert(!!clonedNpc, 'Clone: Emits new cloned NPC with "(Imported)" suffix');
  assertEqual(clonedNpc.role, 'Rebel General', 'Clone: Cloned entity has incoming properties');
  assertEqual(topoClone.npcs.length, 3, 'Clone: Total NPC count is 3 (original + clone + new)');
}

function testPortalCascadeDelete() {
  console.log('\n--> SUITE 4: Portal Sub-Map Cascade & Non-Orphaning Deletion Engine...');
  const cascadePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_cascade_delete.js');
  const cascadeCode = fs.readFileSync(cascadePath, 'utf8');

  function createTestEnvironment() {
    const sandbox = {
      window: {},
      document: {
        querySelectorAll: () => [],
        getElementById: () => null
      },
      console,
      Workstation: {
        activeTopology: {
          nodes: {
            '1': { id: 1, name: 'Sovereign Portal Hub', childMapId: 'map_underworld_01', adj: [2], infBy: [2] },
            '2': { id: 2, name: 'Frontier Outpost', adj: [1], infBy: [1] }
          },
          npcs: [
            { id: 'npc_gatekeeper', name: 'Keeper', nodeId: 1 }
          ],
          quests: [
            { id: 'quest_gate', title: 'Breach the Gate', nodeId: 1 }
          ],
          items: [
            { id: 'key_portal', name: 'Underworld Key', nodeId: 1 }
          ],
          trackers: [
            { id: 'clk_gate', name: 'Portal Collapse', nodeId: 1 }
          ],
          tickets: [],
          campaign_modules: []
        }
      },
      maps: {
        'map_root': { id: 'map_root', name: 'Overworld' },
        'map_underworld_01': { id: 'map_underworld_01', name: 'Underworld Level 1', parentMapId: 'map_root', parentNodeId: 1 }
      },
      activeMapId: 'map_root'
    };
    sandbox.window = sandbox;
    injectEngine(sandbox);

    vm.createContext(sandbox);
    vm.runInContext(cascadeCode, sandbox);
    return sandbox;
  }

  // 1. Dependency Analysis Test
  const env1 = createTestEnvironment();
  const depData = env1.analyzeEntityDependencies('node', 1);

  assertEqual(depData.target.name, 'Sovereign Portal Hub', 'Cascade Engine correctly targets node 1');
  const attachedMapDep = depData.dependencies.find(d => d.type === 'map');
  assert(!!attachedMapDep, 'analyzeEntityDependencies identifies attached portal sub-map');
  assertEqual(attachedMapDep.id, 'map_underworld_01', 'Attached map ID is map_underworld_01');
  assertEqual(attachedMapDep.nodeId, 1, 'Attached map is anchored to node #1');

  // 2. Non-Orphaning Test (Deleting Node WITHOUT Sub-Map)
  env1.executeEntityDeletion([{ type: 'node', id: 1 }]);
  assert(env1.Workstation.activeTopology.nodes['1'] === undefined, 'Node 1 deleted from active topology');
  assertEqual(env1.Workstation.activeTopology.nodes['2'].adj, [], 'Node 2 adjacency list cleanly purged of Node 1');
  assert(env1.maps['map_underworld_01'] !== undefined, 'Sub-map is preserved in maps registry');
  assertEqual(env1.maps['map_underworld_01'].parentNodeId, null, 'Sub-map parentNodeId set to null (clean detachment, non-orphaned)');

  // 3. Cascade Deletion Test (Deleting Node WITH Sub-Map)
  const env2 = createTestEnvironment();
  env2.executeEntityDeletion([
    { type: 'node', id: 1 },
    { type: 'map', id: 'map_underworld_01' }
  ]);
  assert(env2.Workstation.activeTopology.nodes['1'] === undefined, 'Node 1 deleted from active topology');
  assert(env2.maps['map_underworld_01'] === undefined, 'Sub-map map_underworld_01 completely deleted from maps registry');
}

// ============================================================================
// SUITE 5: ZERO-CORS OFFLINE EXECUTION & CDN ISOLATION AUDIT
// ============================================================================
function testZeroCorsOffline() {
  console.log('\n--> SUITE 5: Zero-CORS Offline Execution & Asset Isolation Audit...');
  const externalRegex = /<(?:script|link)[^>]+(?:src|href)\s*=\s*["'](?:https?:|\/\/)[^"']+["']/gi;
  const cssImportRegex = /@import\s+(?:url\()?["']?(?:https?:|\/\/)[^"'\);]+["']?\)?/gi;

  let totalExternalFound = 0;

  HTML_SURFACES.forEach(relPath => {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, 'utf8');

    const extTagMatches = content.match(externalRegex) || [];
    const cssImportMatches = content.match(cssImportRegex) || [];
    const allMatches = [...extTagMatches, ...cssImportMatches];

    totalExternalFound += allMatches.length;
    assert(allMatches.length === 0, `${relPath} has zero external scripts/stylesheets (0 CDN links found)`);
  });

  assert(totalExternalFound === 0, '100% Zero-CORS offline compliant across all primary HTML surfaces');
}

// ============================================================================
// SUITE 6: DYNAMIC CANVAS LAYERS & TOPOLOGY INTEGRITY
// ============================================================================
function testCanvasLayersEngine() {
  console.log('\n--> SUITE 6: Dynamic Canvas Layers & Topology Schema Integrity...');
  const layerMgrPath = path.join(ROOT_DIR, 'src/workstation/scripts/layer_manager.js');
  const layerMgrCode = fs.readFileSync(layerMgrPath, 'utf8');

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      querySelectorAll: () => [],
      getElementById: () => null
    },
    console,
    Buffer: global.Buffer,
    btoa: global.btoa,
    Uint8Array: global.Uint8Array,
    Workstation: {
      activeTopology: null
    },
    saveActiveCampaign: () => {},
    renderLayersManagerUI: () => {},
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    setStatusBarMessage: () => {}
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(layerMgrCode, sandbox);

  // 1. Core Default Layers
  const defaults = sandbox.getDefaultLayers();
  assertEqual(defaults.length, 6, 'getDefaultLayers returns 6 standard core layers');
  const coreIds = defaults.map(l => l.id);
  assert(coreIds.includes('layer-bg'), 'Includes layer-bg');
  assert(coreIds.includes('layer-drawings'), 'Includes layer-drawings');
  assert(coreIds.includes('layer-roads'), 'Includes layer-roads');
  assert(coreIds.includes('layer-hegemony'), 'Includes layer-hegemony');
  assert(coreIds.includes('layer-nodes'), 'Includes layer-nodes');
  assert(coreIds.includes('layer-annotations'), 'Includes layer-annotations');

  // 2. ensureTopologyLayers on empty topology
  const topo = { nodes: { '1': { id: 1, name: 'Node 1', layerId: 'layer-nodes' } } };
  sandbox.ensureTopologyLayers(topo);
  assert(Array.isArray(topo.layers), 'ensureTopologyLayers populates topo.layers');
  assertEqual(topo.layers.length, 6, 'topo.layers initialized with 6 core layers');
  assert(Array.isArray(topo.shapes), 'ensureTopologyLayers initializes topo.shapes as empty array');

  // 3. Custom Layer Addition
  sandbox.Workstation.activeTopology = topo;
  const custom = sandbox.addCustomLayer('Dungeon Level 1', topo);
  assert(!!custom, 'addCustomLayer returns created layer');
  assertEqual(custom.name, 'Dungeon Level 1', 'Custom layer name is preserved');
  assertEqual(custom.zIndex, 6, 'Custom layer assigned next sequential zIndex (6)');
  assertEqual(custom.isCore, false, 'Custom layer has isCore === false');
  assertEqual(topo.layers.length, 7, 'topo.layers count increases to 7');

  // 4. Layer Mutation & Clamping
  sandbox.toggleLayerVisibility(custom.id, topo);
  assertEqual(custom.visible, false, 'toggleLayerVisibility toggles visible to false');
  sandbox.toggleLayerVisibility(custom.id, topo);
  assertEqual(custom.visible, true, 'toggleLayerVisibility toggles visible back to true');

  sandbox.toggleLayerLock(custom.id, topo);
  assertEqual(custom.locked, true, 'toggleLayerLock toggles locked to true');

  sandbox.setLayerOpacity(custom.id, 1.5, topo);
  assertEqual(custom.opacity, 1.0, 'setLayerOpacity clamps >1.0 to 1.0');
  sandbox.setLayerOpacity(custom.id, -0.5, topo);
  assertEqual(custom.opacity, 0.0, 'setLayerOpacity clamps <0.0 to 0.0');
  sandbox.setLayerOpacity(custom.id, 0.45, topo);
  assertEqual(custom.opacity, 0.45, 'setLayerOpacity sets 0.45 correctly');

  // 5. Layer Reordering
  const initialSorted = sandbox.getTopologyLayers(topo);
  const layerDrawings = initialSorted.find(l => l.id === 'layer-drawings');
  const oldZ = layerDrawings.zIndex;
  sandbox.reorderLayer('layer-drawings', 'up', topo);
  assert(layerDrawings.zIndex > oldZ, 'reorderLayer("up") moves layer up in zIndex sequence');

  // 6. Entity Tallying on Layer
  topo.nodes['2'] = { id: 2, name: 'Node 2', layerId: custom.id };
  topo.shapes.push({ id: 'shape_01', type: 'rect', layerId: custom.id });
  const customCount = sandbox.countEntitiesOnLayer(custom.id, topo);
  assertEqual(customCount, 2, 'countEntitiesOnLayer correctly tallies 1 node + 1 shape on custom layer');

  // 7. Layer Deletion & Entity Migration
  const cannotDeleteCore = sandbox.deleteCustomLayer('layer-nodes', 'layer-drawings', topo);
  assertEqual(cannotDeleteCore, false, 'deleteCustomLayer rejects deletion of protected core layer');
  assertEqual(topo.layers.some(l => l.id === 'layer-nodes'), true, 'layer-nodes remains present in topo.layers');

  const deletedCustom = sandbox.deleteCustomLayer(custom.id, 'layer-drawings', topo);
  assertEqual(deletedCustom, true, 'deleteCustomLayer successfully deletes custom layer');
  assertEqual(topo.layers.some(l => l.id === custom.id), false, 'Custom layer removed from topo.layers');
  assertEqual(topo.nodes['2'].layerId, 'layer-drawings', 'Entities on deleted layer safely migrated to layer-drawings');
  assertEqual(topo.shapes[0].layerId, 'layer-drawings', 'Shapes on deleted layer safely migrated to layer-drawings');
}

// ============================================================================
// SUITE 7: VECTOR DRAWING ENGINE & SHAPE PRIMITIVES (RECT, CIRCLE, LINE)
// ============================================================================
function testVectorDrawingShapesEngine() {
  console.log('\n--> SUITE 7: Vector Drawing Engine & Shape Primitives (Rect, Circle, Line)...');
  const propGridPath = path.join(ROOT_DIR, 'src/workstation/scripts/property_grid_inspector.js');
  const propGridCode = fs.readFileSync(propGridPath, 'utf8');
  const rendererPath = path.join(ROOT_DIR, 'src/workstation/scripts/cad_canvas_renderer.js');
  const rendererCode = fs.readFileSync(rendererPath, 'utf8');
  const interactionPath = path.join(ROOT_DIR, 'src/workstation/scripts/cad_interaction.js');
  const interactionCode = fs.readFileSync(interactionPath, 'utf8');

  // Minimal SVG DOM mock for Node.js vm
  class MockSvgElement {
    constructor(tag) {
      this.tagName = tag;
      this.attributes = {};
      this.children = [];
      this.style = {};
      this.listeners = {};
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k]; }
    appendChild(child) { this.children.push(child); return child; }
    addEventListener(event, fn) { this.listeners[event] = fn; }
  }

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      createElementNS: (ns, tag) => new MockSvgElement(tag),
      createElement: (tag) => new MockSvgElement(tag),
      querySelectorAll: () => [],
      getElementById: (id) => ({
        style: {},
        innerHTML: '',
        textContent: '',
        classList: { remove: () => {}, add: () => {} },
        appendChild: () => {},
        querySelector: () => null,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
      })
    },
    console,
    Buffer: global.Buffer,
    btoa: global.btoa,
    Uint8Array: global.Uint8Array,
    Workstation: {
      activeTopology: null,
      selectedEntity: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      activeTool: 'select',
      isDrawingShape: false
    },
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    scheduleRenderCanvas: () => {},
    updatePropertiesGrid: () => {},
    updateObjectSelector: () => {},
    renderLayersManagerUI: () => {},
    setStatusBarMessage: () => {},
    getTopologyLayers: (topo) => topo.layers || [],
    getLayerById: (id, topo) => (topo.layers || []).find(l => l.id === id),
    getActiveLayerId: () => 'layer-drawings',
    confirm: () => true
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(rendererCode, sandbox);
  vm.runInContext(propGridCode, sandbox);
  vm.runInContext(interactionCode, sandbox);

  // 1. Tool keys
  assertEqual(sandbox.getToolKey('rect'), 'R', 'Rect tool hotkey is R');
  assertEqual(sandbox.getToolKey('circle'), 'C', 'Circle tool hotkey is C');
  assertEqual(sandbox.getToolKey('line'), 'W', 'Line tool hotkey is W');

  // 2. Topology Shapes Collection Setup
  const topo = {
    name: 'CAD Test Map',
    layers: [
      { id: 'layer-drawings', name: 'CAD Drawings', zIndex: 1, visible: true, locked: false, opacity: 1.0, isCore: true }
    ],
    shapes: []
  };
  sandbox.Workstation.activeTopology = topo;

  // 3. Rect Shape Schema & Rendering
  const rectShape = {
    id: 'shape-rect-1',
    type: 'rect',
    name: 'Sector A',
    layerId: 'layer-drawings',
    x: 50,
    y: 80,
    width: 200,
    height: 100,
    fillColor: 'rgba(59, 130, 246, 0.2)',
    strokeColor: '#2563eb',
    strokeWidth: 2,
    strokeDash: 'dashed',
    opacity: 0.9,
    visible: true,
    locked: false
  };
  topo.shapes.push(rectShape);

  const rectEl = sandbox.renderShapeSvgElement(rectShape, 0.9, true, false);
  assert(!!rectEl, 'renderShapeSvgElement returns SVG element for rect');
  assertEqual(rectEl.children[0].tagName, 'rect', 'First child is rect primitive');
  assertEqual(rectEl.children[0].attributes['stroke-dasharray'], '6,4', 'Dashed stroke style applied');
  assertEqual(rectEl.children[1].tagName, 'text', 'Second child is name label');
  assertEqual(rectEl.children[1].textContent, 'Sector A', 'Label text matches shape name');
  const grips = rectEl.children.filter(c => c.attributes['class'] === 'cad-grip-handle');
  assertEqual(grips.length, 4, 'Selected rect renders 4 CAD grip handles at corners');

  // 4. Circle Shape Schema & Rendering
  const circleShape = {
    id: 'shape-circle-1',
    type: 'circle',
    name: 'Blast Radius',
    layerId: 'layer-drawings',
    x: 400,
    y: 300,
    radius: 60,
    rx: 60,
    ry: 60,
    fillColor: 'rgba(239, 68, 68, 0.3)',
    strokeColor: '#dc2626',
    strokeWidth: 3,
    strokeDash: 'solid',
    opacity: 1.0,
    visible: true,
    locked: false
  };
  topo.shapes.push(circleShape);

  const circleEl = sandbox.renderShapeSvgElement(circleShape, 1.0, true, false);
  assertEqual(circleEl.children[0].tagName, 'ellipse', 'First child is ellipse/circle primitive');
  assertEqual(circleEl.children[0].attributes['cx'], '400', 'Ellipse center cx is 400');
  assertEqual(circleEl.children[0].attributes['cy'], '300', 'Ellipse center cy is 300');
  const circleGrips = circleEl.children.filter(c => c.attributes['class'] === 'cad-grip-handle');
  assertEqual(circleGrips.length, 4, 'Selected circle renders 4 CAD grip handles at cardinal points');

  // 5. Line Shape Schema & Rendering
  const lineShape = {
    id: 'shape-line-1',
    type: 'line',
    name: 'Border Trench',
    layerId: 'layer-drawings',
    x: 10,
    y: 20,
    x2: 150,
    y2: 120,
    strokeColor: '#10b981',
    strokeWidth: 2,
    strokeDash: 'dotted',
    opacity: 1.0,
    visible: true,
    locked: false
  };
  topo.shapes.push(lineShape);

  const lineEl = sandbox.renderShapeSvgElement(lineShape, 1.0, true, false);
  assertEqual(lineEl.children[0].tagName, 'line', 'First child is line primitive');
  assertEqual(lineEl.children[0].attributes['stroke-dasharray'], '2,3', 'Dotted stroke style applied');
  const lineGrips = lineEl.children.filter(c => c.attributes['class'] === 'cad-grip-handle');
  assertEqual(lineGrips.length, 2, 'Selected line renders 2 CAD grip handles at endpoints');

  // 6. Shape Selection Handler
  sandbox.selectShape(circleShape.id);
  assert(!!sandbox.Workstation.selectedEntity, 'selectShape assigns selectedEntity');
  assertEqual(sandbox.Workstation.selectedEntity.type, 'shape', 'selectedEntity type is shape');
  assertEqual(sandbox.Workstation.selectedEntity.id, circleShape.id, 'selectedEntity id matches circleShape');

  // 7. Shape Deletion Handler
  sandbox.deleteShape(rectShape.id, true);
  assertEqual(topo.shapes.some(s => s.id === rectShape.id), false, 'deleteShape removes shape from topo.shapes');
  assertEqual(topo.shapes.length, 2, 'Remaining shape count is 2');

  sandbox.deleteShape(circleShape.id, true);
  assertEqual(sandbox.Workstation.selectedEntity.type, 'global', 'Deleting active shape resets selectedEntity to global');
}

// ============================================================================
// SUITE 8: MULTI-ENTITY SELECTION ENGINE (SHIFT-CLICK, CTRL-CLICK, MARQUEE, GROUP DRAG)
// ============================================================================
function testSelectionEngine() {
  console.log('\n--> SUITE 8: Multi-Entity Selection Engine (Shift-Click, Ctrl-Click, Marquee, Group Drag)...');
  const selEnginePath = path.join(ROOT_DIR, 'src/workstation/scripts/selection_engine.js');
  const selEngineCode = fs.readFileSync(selEnginePath, 'utf8');
  const propGridPath = path.join(ROOT_DIR, 'src/workstation/scripts/property_grid_inspector.js');
  const propGridCode = fs.readFileSync(propGridPath, 'utf8');
  const interactionPath = path.join(ROOT_DIR, 'src/workstation/scripts/cad_interaction.js');
  const interactionCode = fs.readFileSync(interactionPath, 'utf8');

  class MockSvgElement {
    constructor(tag) {
      this.tagName = tag;
      this.attributes = {};
      this.children = [];
      this.style = {};
      this.listeners = {};
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k]; }
    appendChild(child) { this.children.push(child); return child; }
    addEventListener(event, fn) { this.listeners[event] = fn; }
  }

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      createElementNS: (ns, tag) => new MockSvgElement(tag),
      createElement: (tag) => new MockSvgElement(tag),
      querySelectorAll: () => [],
      getElementById: (id) => ({
        style: {},
        innerHTML: '',
        textContent: '',
        classList: { remove: () => {}, add: () => {} },
        appendChild: () => {},
        querySelector: () => null,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
      })
    },
    console,
    Buffer: global.Buffer,
    btoa: global.btoa,
    Uint8Array: global.Uint8Array,
    Workstation: {
      activeTopology: null,
      selectedEntity: null,
      selectedEntities: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
      activeTool: 'select',
      isGroupDragging: false
    },
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    scheduleRenderCanvas: () => {},
    updatePropertiesGrid: () => {},
    updateObjectSelector: () => {},
    renderLayersManagerUI: () => {},
    setStatusBarMessage: () => {},
    getTopologyLayers: (topo) => topo.layers || [],
    getLayerById: (id, topo) => (topo.layers || []).find(l => l.id === id),
    confirm: () => true,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(selEngineCode, sandbox);
  vm.runInContext(propGridCode, sandbox);
  vm.runInContext(interactionCode, sandbox);

  // 1. Basic Selection API
  assertEqual(sandbox.getSelectedEntities().length, 0, 'Initial selection is empty');
  sandbox.setSelection([{ type: 'node', id: 1 }, { type: 'node', id: 2 }]);
  assertEqual(sandbox.getSelectedEntities().length, 2, 'setSelection sets 2 entities');
  assertEqual(sandbox.Workstation.selectedEntity.id, 1, 'selectedEntity points to first item');
  assert(sandbox.isEntitySelected('node', 1), 'isEntitySelected returns true for node 1');
  assert(sandbox.isEntitySelected('node', 2), 'isEntitySelected returns true for node 2');
  assert(!sandbox.isEntitySelected('node', 3), 'isEntitySelected returns false for unselected node 3');

  // 2. Add, Remove & Toggle Selection
  sandbox.addToSelection({ type: 'shape', id: 's1' });
  assertEqual(sandbox.getSelectedEntities().length, 3, 'addToSelection adds shape s1');
  sandbox.addToSelection({ type: 'shape', id: 's1' });
  assertEqual(sandbox.getSelectedEntities().length, 3, 'addToSelection does not duplicate existing entity');

  sandbox.removeFromSelection('node', 1);
  assertEqual(sandbox.getSelectedEntities().length, 2, 'removeFromSelection removes node 1');
  assert(!sandbox.isEntitySelected('node', 1), 'node 1 is no longer selected');

  sandbox.toggleEntitySelection({ type: 'node', id: 2 });
  assertEqual(sandbox.getSelectedEntities().length, 1, 'toggleEntitySelection removes selected node 2');
  sandbox.toggleEntitySelection({ type: 'node', id: 2 });
  assertEqual(sandbox.getSelectedEntities().length, 2, 'toggleEntitySelection re-adds node 2');

  sandbox.clearSelection();
  assertEqual(sandbox.getSelectedEntities().length, 0, 'clearSelection empties selection array');
  assertEqual(sandbox.Workstation.selectedEntity.type, 'global', 'clearSelection resets selectedEntity to global');

  // 3. Topology Setup for Type-Select & Marquee
  const topo = {
    name: 'Multi-Select Test Map',
    layers: [
      { id: 'layer-nodes', name: 'Nodes', zIndex: 4, visible: true, locked: false, opacity: 1.0, isCore: true },
      { id: 'layer-drawings', name: 'Drawings', zIndex: 1, visible: true, locked: false, opacity: 1.0, isCore: true }
    ],
    nodes: {
      '1': { id: 1, name: 'Node 1', x: 50, y: 50, tier: 2, adj: [2], infBy: [] },
      '2': { id: 2, name: 'Node 2', x: 100, y: 100, tier: 2, adj: [1], infBy: [] },
      '3': { id: 3, name: 'Node 3', x: 500, y: 500, tier: 3, adj: [], infBy: [] }
    },
    shapes: [
      { id: 'rect-1', type: 'rect', name: 'Zone A', x: 60, y: 60, width: 80, height: 80, visible: true },
      { id: 'rect-2', type: 'rect', name: 'Zone B', x: 200, y: 200, width: 100, height: 50, visible: true },
      { id: 'circle-1', type: 'circle', name: 'Orbit A', x: 80, y: 80, radius: 30, rx: 30, ry: 30, visible: true }
    ]
  };
  sandbox.Workstation.activeTopology = topo;

  // 4. AutoCAD Ctrl+Click Type-Select (selectByType)
  sandbox.selectByType('shape', 'rect');
  assertEqual(sandbox.getSelectedEntities().length, 2, 'selectByType("shape", "rect") selects all 2 rect shapes');
  assert(sandbox.isEntitySelected('shape', 'rect-1'), 'rect-1 is selected');
  assert(sandbox.isEntitySelected('shape', 'rect-2'), 'rect-2 is selected');
  assert(!sandbox.isEntitySelected('shape', 'circle-1'), 'circle-1 is NOT selected');

  sandbox.selectByType('shape', 'circle');
  assertEqual(sandbox.getSelectedEntities().length, 1, 'selectByType("shape", "circle") selects only circle-1');

  sandbox.selectByType('node');
  assertEqual(sandbox.getSelectedEntities().length, 3, 'selectByType("node") selects all 3 nodes on active map');

  // 5. Multi-Entity Group Drag
  sandbox.setSelection([
    { type: 'node', id: 1 },
    { type: 'node', id: 2 },
    { type: 'shape', id: 'rect-1' }
  ]);
  sandbox.startGroupDrag({ clientX: 100, clientY: 100 });
  assertEqual(sandbox.Workstation.isGroupDragging, true, 'startGroupDrag sets isGroupDragging to true');

  // 6. Multi-Selection Properties Rendering & Shared Layer Assignment
  const tbody = new MockSvgElement('tbody');
  sandbox.renderMultiSelectionProperties(tbody, sandbox.getSelectedEntities(), topo);
  assert(tbody.children.length > 0, 'renderMultiSelectionProperties populates tbody');
  const summaryRow = tbody.children.find(r => r.children && r.children[0] && r.children[0].textContent === 'Selection Summary');
  assert(!!summaryRow, 'Renders Selection Summary row');

  // 7. Batch Delete
  sandbox.deleteNodeDirect(1);
  assertEqual(topo.nodes['1'], undefined, 'deleteNodeDirect successfully deletes node 1');
  assertEqual(topo.nodes['2'].adj.includes(1), false, 'deleteNodeDirect removes reference from Node 2 adj');
}

function testSharedPropertyGridAndBatchMutation() {
  console.log('\n--> SUITE 9: AutoCAD Shared Property Grid (*VARIES*) & Batch Mutation Engine...');
  const selEnginePath = path.join(__dirname, '../src/workstation/scripts/selection_engine.js');
  const propGridPath = path.join(__dirname, '../src/workstation/scripts/property_grid_inspector.js');
  const interactionPath = path.join(__dirname, '../src/workstation/scripts/cad_interaction.js');

  const selEngineCode = fs.readFileSync(selEnginePath, 'utf8');
  const propGridCode = fs.readFileSync(propGridPath, 'utf8');
  const interactionCode = fs.readFileSync(interactionPath, 'utf8');

  class MockSvgElement {
    constructor(tag) {
      this.tagName = tag;
      this.attributes = {};
      this.children = [];
      this.style = {};
      this.listeners = {};
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k]; }
    appendChild(child) { this.children.push(child); return child; }
    addEventListener(event, fn) { this.listeners[event] = fn; }
  }

  const objSelectorElem = new MockSvgElement('select');

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      createElementNS: (ns, tag) => new MockSvgElement(tag),
      createElement: (tag) => new MockSvgElement(tag),
      querySelectorAll: () => [],
      getElementById: (id) => {
        if (id === 'prop-object-selector') return objSelectorElem;
        return {
          style: {},
          innerHTML: '',
          textContent: '',
          classList: { remove: () => {}, add: () => {} },
          appendChild: () => {},
          querySelector: () => null,
          getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
        };
      }
    },
    console,
    Buffer: global.Buffer,
    btoa: global.btoa,
    Uint8Array: global.Uint8Array,
    Workstation: {
      activeTopology: null,
      selectedEntity: null,
      selectedEntities: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
      activeTool: 'select',
      isGroupDragging: false
    },
    AUTOCAD_COLORS: [
      { val: '#ff0000', label: 'ACI 1 - Red' },
      { val: '#ffff00', label: 'ACI 2 - Yellow' },
      { val: '#00ff00', label: 'ACI 3 - Green' },
      { val: '#00ffff', label: 'ACI 4 - Cyan' },
      { val: '#0000ff', label: 'ACI 5 - Blue' },
      { val: '#ff00ff', label: 'ACI 6 - Magenta' },
      { val: '#ffffff', label: 'ACI 7 - White / Black' }
    ],
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    scheduleRenderCanvas: () => {},
    updatePropertiesGrid: () => {},
    renderLayersManagerUI: () => {},
    setStatusBarMessage: () => {},
    getTopologyLayers: (topo) => topo.layers || [],
    getLayerById: (id, topo) => (topo.layers || []).find(l => l.id === id),
    confirm: () => true,
    prompt: () => null,
    alert: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(selEngineCode, sandbox);
  vm.runInContext(propGridCode, sandbox);
  vm.runInContext(interactionCode, sandbox);

  const topo = {
    name: 'AutoCAD Batch Test Map',
    layers: [
      { id: 'layer-nodes', name: 'Nodes', zIndex: 4, visible: true, locked: false, opacity: 1.0, isCore: true },
      { id: 'layer-drawings', name: 'Drawings', zIndex: 1, visible: true, locked: false, opacity: 1.0, isCore: true },
      { id: 'layer-bg', name: 'Background', zIndex: 0, visible: true, locked: false, opacity: 1.0, isCore: true }
    ],
    nodes: {
      '10': { id: 10, name: 'Node 10', x: 100, y: 100, tier: 2, radius: 18, shape: 'circle', culture: 'Clan', layerId: 'layer-nodes', locked: false, visible: true, color: '#ff0000' },
      '20': { id: 20, name: 'Node 20', x: 200, y: 200, tier: 3, radius: 15, shape: 'square', culture: 'Market', layerId: 'layer-nodes', locked: true, visible: true, color: '#00ff00' }
    },
    shapes: [
      { id: 'sh-1', name: 'Rect 1', type: 'rect', x: 50, y: 50, width: 80, height: 40, fillColor: '#2563eb', strokeColor: '#1e293b', strokeWidth: 2, strokeDash: 'solid', opacity: 0.8, layerId: 'layer-drawings', locked: false },
      { id: 'sh-2', name: 'Rect 2', type: 'rect', x: 150, y: 150, width: 100, height: 60, fillColor: '#ef4444', strokeColor: '#1e293b', strokeWidth: 2, strokeDash: 'dashed', opacity: 0.5, layerId: 'layer-drawings', locked: false }
    ],
    edgeData: {}
  };
  sandbox.Workstation.activeTopology = topo;

  // 1. Quick-Select in Object Dropdown
  sandbox.setSelection([
    { type: 'node', id: 10 },
    { type: 'node', id: 20 },
    { type: 'shape', id: 'sh-1' }
  ]);
  sandbox.updateObjectSelector();
  assertEqual(objSelectorElem.children.length >= 3, true, 'Object selector shows multi selection and filter options');
  const filterNodeOpt = objSelectorElem.children.find(c => c.value === 'multi-filter-node');
  assert(!!filterNodeOpt, 'Includes multi-filter-node option');

  // Filter down to nodes
  sandbox.onObjectSelectorChange('multi-filter-node');
  assertEqual(sandbox.getSelectedEntities().length, 2, 'multi-filter-node filters selection to only nodes');
  assert(sandbox.getSelectedEntities().every(e => e.type === 'node'), 'All items in filtered selection are nodes');

  // 2. Intersecting Property Computation & *VARIES* Detection
  sandbox.setSelection([
    { type: 'node', id: 10 },
    { type: 'node', id: 20 },
    { type: 'shape', id: 'sh-1' }
  ]);
  const tbody = new MockSvgElement('tbody');
  sandbox.renderMultiSelectionProperties(tbody, sandbox.getSelectedEntities(), topo);

  // Check Layer Row: Node 10/20 have 'layer-nodes', Rect 1 has 'layer-drawings' -> Should be *VARIES*
  const layerRow = tbody.children.find(r => r.children && r.children[0] && r.children[0].textContent === 'Canvas Layer');
  assert(!!layerRow, 'Renders Canvas Layer row for multi-selection');
  const layerSelect = layerRow.children[1].children[0];
  assertEqual(layerSelect.children.find(c => c.selected).value, '*VARIES*', 'Differing layers display *VARIES*');

  // Check Lock Row: Node 10 is unlocked, Node 20 is locked -> Should be *VARIES*
  const lockRow = tbody.children.find(r => r.children && r.children[0] && r.children[0].textContent === 'Position Locked');
  assert(!!lockRow, 'Renders Position Locked row');
  const lockSelect = lockRow.children[1].children[0];
  assertEqual(lockSelect.children.find(c => c.selected).value, '*VARIES*', 'Differing lock states display *VARIES*');

  // 3. Batch Mutation: Batch Layer Reassignment
  const layerChangeCallback = layerSelect.listeners['change'];
  layerSelect.value = 'layer-bg';
  layerChangeCallback();
  assertEqual(topo.nodes['10'].layerId, 'layer-bg', 'Batch layer reassignment updates Node 10');
  assertEqual(topo.nodes['20'].layerId, 'layer-bg', 'Batch layer reassignment updates Node 20');
  assertEqual(topo.shapes[0].layerId, 'layer-bg', 'Batch layer reassignment updates Rect 1');

  // 4. Batch Mutation: Batch Position Lock
  const lockChangeCallback = lockSelect.listeners['change'];
  lockSelect.value = 'true';
  lockChangeCallback();
  assertEqual(topo.nodes['10'].locked, true, 'Batch lock locks Node 10');
  assertEqual(topo.nodes['20'].locked, true, 'Node 20 remains locked');
  assertEqual(topo.shapes[0].locked, true, 'Batch lock locks Rect 1');

  // 5. Shape Appearance Batch Mutation (Homogeneous Shape Selection)
  sandbox.setSelection([
    { type: 'shape', id: 'sh-1' },
    { type: 'shape', id: 'sh-2' }
  ]);
  const shapeTbody = new MockSvgElement('tbody');
  sandbox.renderMultiSelectionProperties(shapeTbody, sandbox.getSelectedEntities(), topo);

  // Fill color differs -> *VARIES*
  const fillRow = shapeTbody.children.find(r => r.children && r.children[0] && r.children[0].textContent === 'Fill Color');
  assert(!!fillRow, 'Renders Fill Color row for shapes');
  const fillInput = fillRow.children[1].children[0];
  assertEqual(fillInput.value, '*VARIES*', 'Differing fill colors display *VARIES*');

  // Batch mutate fill color to '#10b981'
  fillInput.value = '#10b981';
  fillInput.listeners['change'] && fillInput.listeners['change']();
  assertEqual(topo.shapes[0].fillColor, '#10b981', 'Batch mutate updates Rect 1 fillColor');
  assertEqual(topo.shapes[1].fillColor, '#10b981', 'Batch mutate updates Rect 2 fillColor');

  // Batch mutate opacity to 90%
  const opacityRow = shapeTbody.children.find(r => r.children && r.children[0] && r.children[0].textContent === 'Opacity (0-100%)');
  assert(!!opacityRow, 'Renders Opacity row for shapes');
  const opacityInput = opacityRow.children[1].children[0];
  opacityInput.value = '90';
  opacityInput.listeners['change'] && opacityInput.listeners['change']();
  assertEqual(topo.shapes[0].opacity, 0.9, 'Batch mutate updates Rect 1 opacity to 0.9');
  assertEqual(topo.shapes[1].opacity, 0.9, 'Batch mutate updates Rect 2 opacity to 0.9');

  // 6. Homogeneous Node Selection Properties
  sandbox.setSelection([
    { type: 'node', id: 10 },
    { type: 'node', id: 20 }
  ]);
  const nodeTbody = new MockSvgElement('tbody');
  sandbox.renderMultiSelectionProperties(nodeTbody, sandbox.getSelectedEntities(), topo);

  const tierRow = nodeTbody.children.find(r => r.children && r.children[0] && r.children[0].textContent === 'Tier');
  assert(!!tierRow, 'Renders Tier row when all selected entities are nodes');
  const tierSelect = tierRow.children[1].children[0];
  assertEqual(tierSelect.children.find(c => c.selected).value, '*VARIES*', 'Differing tiers display *VARIES*');

  // Batch mutate tier to Tier 3
  tierSelect.value = '3';
  tierSelect.listeners['change'] && tierSelect.listeners['change']();
  assertEqual(topo.nodes['10'].tier, 3, 'Batch mutate updates Node 10 tier to 3');
  assertEqual(topo.nodes['20'].tier, 3, 'Node 20 tier remains 3');

  // 7. AutoCAD MOVE Offset Repositioning
  topo.nodes['10'].locked = false;
  topo.shapes[0].locked = false;
  sandbox.setSelection([
    { type: 'node', id: 10 },
    { type: 'shape', id: 'sh-1' }
  ]);
  // Mock prompt to return '25, -15'
  sandbox.prompt = () => '25, -15';
  sandbox.promptRepositionSelection();
  assertEqual(topo.nodes['10'].x, 125, 'Node 10 X shifted by +25 (100 -> 125)');
  assertEqual(topo.nodes['10'].y, 85, 'Node 10 Y shifted by -15 (100 -> 85)');
  assertEqual(topo.shapes[0].x, 75, 'Rect 1 X shifted by +25 (50 -> 75)');
  assertEqual(topo.shapes[0].y, 35, 'Rect 1 Y shifted by -15 (50 -> 35)');
}

async function testCampaignPackageLoadingAndMapSwitching() {
  console.log('\n--> SUITE 9: Campaign Package Loading & Multi-Map Switching (TDZ & Entity Integrity)...');
  const stateAdapterPath = path.join(ROOT_DIR, 'src/workstation/scripts/state_adapter.js');
  const stateAdapterCode = fs.readFileSync(stateAdapterPath, 'utf8');

  const mockStorage = {};
  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => []
    },
    localStorage: {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); },
      removeItem: (k) => { delete mockStorage[k]; }
    },
    console,
    Buffer: global.Buffer,
    btoa: global.btoa,
    Uint8Array: global.Uint8Array,
    Workstation: {
      activeTopology: null
    },
    ensureEntityCollections: (topo) => {
      if (!topo) return;
      ['npcs', 'quests', 'items', 'trackers', 'tickets'].forEach(k => {
        if (!Array.isArray(topo[k])) topo[k] = [];
      });
    },
    normalizeNodeSlottedModules: (m) => m || {},
    getDefaultLayers: () => [{ id: 'layer-nodes', name: 'Nodes', visible: true, locked: false, opacity: 1, isCore: true }],
    stripMapImageDataUrl: (meta) => meta,
    applyMapImageToCanvas: () => {},
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    renderLayoutTabs: () => {},
    updateBreadcrumbsHUD: () => {},
    renderEntityManagerTree: () => {},
    renderEntityManagerList: () => {},
    updatePropertiesGrid: () => {},
    selectGlobal: () => {},
    updateStatusBar: () => {},
    closeModal: () => {},
    setStatusBarMessage: () => {}
  };

  vm.createContext(sandbox);
  vm.runInContext(stateAdapterCode, sandbox);

  assert(typeof sandbox.window.loadCampaignProjectPackage === 'function', 'loadCampaignProjectPackage exported on window');

  // Test package payload with multi-scale maps and entities
  const testPkg = {
    id: 'test_realm',
    name: 'Test Multi-Scale Realm',
    maps: {
      'map_root': {
        id: 'map_root',
        name: 'Overworld',
        scaleTier: 'region',
        nodes: [
          { id: 1, name: 'Capital City', x: 100, y: 150, coordinates: { x: 100, y: 150 }, childMapId: 'map_dungeon' }
        ],
        links: []
      },
      'map_dungeon': {
        id: 'map_dungeon',
        name: 'Ancient Catacombs',
        scaleTier: 'building',
        parentMapId: 'map_root',
        parentNodeId: 1,
        nodes: [
          { id: 2, name: 'Crypt Entry', x: 50, y: 50, coordinates: { x: 50, y: 50 } }
        ],
        links: []
      }
    },
    entities: {
      npcs: [{ id: 'npc_1', name: 'Elder Sage', nodeId: 1 }],
      quests: [{ id: 'qst_1', title: 'Purify Shrine', targetNodeId: 2 }],
      items: [{ id: 'itm_1', name: 'Sun Amulet', nodeId: 1 }],
      trackers: [],
      tickets: []
    }
  };

  // 1. Test loadCampaignProjectPackage without TDZ error
  let loadSucceeded = false;
  try {
    await sandbox.window.loadCampaignProjectPackage(testPkg);
    loadSucceeded = true;
  } catch (err) {
    console.error('Error in loadCampaignProjectPackage:', err);
  }
  assert(loadSucceeded, 'loadCampaignProjectPackage loads package without TDZ or initialization error');
  assertEqual(sandbox.Workstation.activeTopology.id, 'map_root', 'Active topology initialized to root map');
  assertEqual(sandbox.Workstation.activeTopology.npcs.length, 1, 'NPCs hydrated onto activeTopology');
  assertEqual(sandbox.Workstation.activeTopology.npcs[0].name, 'Elder Sage', 'Elder Sage preserved in activeTopology');

  // 2. Test switchActiveMap drill-down to child map
  let switchSucceeded = false;
  try {
    await sandbox.switchActiveMap('map_dungeon');
    switchSucceeded = true;
  } catch (err) {
    console.error('Error in switchActiveMap:', err);
  }
  assert(switchSucceeded, 'switchActiveMap drills down to child map cleanly');
  assertEqual(sandbox.window.getActiveMapId(), 'map_dungeon', 'Active map switched to map_dungeon');
  assertEqual(sandbox.Workstation.activeTopology.id, 'map_dungeon', 'Workstation.activeTopology.id updated to map_dungeon');
  assertEqual(sandbox.Workstation.activeTopology.npcs.length, 1, 'NPCs preserved after map switch');

  // 3. Test switchActiveMap ascent back to root map
  await sandbox.switchActiveMap('map_root');
  assertEqual(sandbox.window.getActiveMapId(), 'map_root', 'Active map ascended back to map_root');
  assertEqual(sandbox.Workstation.activeTopology.id, 'map_root', 'Workstation.activeTopology.id updated back to map_root');
  assertEqual(sandbox.Workstation.activeTopology.npcs.length, 1, 'NPCs remain intact after round-trip ascent');
}

async function testDynamicCampaignManager() {
  console.log('\n--> SUITE 10: Dynamic Campaign Discovery, Library Persistence & Removal Engine...');
  const mapStorePath = path.join(ROOT_DIR, 'src/workstation/scripts/map_store.js');
  const mapStoreCode = fs.readFileSync(mapStorePath, 'utf8');

  const mockStorage = {};
  const mockDbStores = {
    active_map: {},
    project_handle: {},
    campaign_library: {}
  };

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => []
    },
    localStorage: {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); },
      removeItem: (k) => { delete mockStorage[k]; }
    },
    indexedDB: {
      open: () => {
        const req = {
          onupgradeneeded: null,
          onsuccess: null,
          onerror: null,
          result: {
            objectStoreNames: {
              contains: () => true
            },
            transaction: (storeName) => {
              const tx = {
                oncomplete: null,
                onerror: null,
                objectStore: () => ({
                  put: (val) => {
                    mockDbStores[storeName][val.id] = val;
                    setTimeout(() => tx.oncomplete && tx.oncomplete(), 0);
                  },
                  get: (id) => {
                    const r = { result: mockDbStores[storeName][id] || null, onsuccess: null, onerror: null };
                    setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                    return r;
                  },
                  getAll: () => {
                    const r = { result: Object.values(mockDbStores[storeName]), onsuccess: null, onerror: null };
                    setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                    return r;
                  },
                  delete: (id) => {
                    delete mockDbStores[storeName][id];
                    setTimeout(() => tx.oncomplete && tx.oncomplete(), 0);
                  }
                })
              };
              return tx;
            }
          }
        };
        setTimeout(() => req.onsuccess && req.onsuccess({ target: req }), 0);
        return req;
      }
    },
    console,
    Buffer: global.Buffer,
    btoa: global.btoa,
    Uint8Array: global.Uint8Array,
    Workstation: {
      activeTopology: {
        id: 'map_root',
        name: 'Curse of Strahd',
        nodes: { '1': { id: 1, name: 'Castle Ravenloft' } },
        links: [],
        npcs: [{ id: 'strahd', name: 'Strahd von Zarovich' }],
        quests: [],
        items: [],
        trackers: [],
        tickets: []
      }
    },
    currentCampaignName: 'Curse of Strahd',
    maps: {
      map_root: {
        id: 'map_root',
        name: 'Barovia',
        nodes: [{ id: 1, name: 'Castle Ravenloft' }]
      }
    },
    syncAdapterFromWorkstationTopology: () => {},
    syncActiveMapToRegistry: () => {},
    setStatusBarMessage: () => {}
  };

  vm.createContext(sandbox);
  sandbox.window.indexedDB = sandbox.indexedDB;
  vm.runInContext(mapStoreCode, sandbox);

  // 1. Test saveCampaignToIndexedDBLibrary
  const campRecord = {
    id: 'strahd_campaign',
    name: 'Curse of Strahd',
    description: 'Gothic horror sandbox in Barovia',
    nodes: { '1': { id: 1 } },
    entities: { npcs: [{ id: 'strahd' }] }
  };
  const saveResult = await sandbox.saveCampaignToIndexedDBLibrary(campRecord);
  assert(saveResult === true, 'saveCampaignToIndexedDBLibrary successfully saves campaign');
  assertEqual(mockDbStores.campaign_library['strahd_campaign'].name, 'Curse of Strahd', 'Record preserved in campaign_library store');

  // 2. Test getCampaignsFromIndexedDBLibrary
  const libCamps = await sandbox.getCampaignsFromIndexedDBLibrary();
  assertEqual(libCamps.length, 1, 'getCampaignsFromIndexedDBLibrary retrieves saved campaign');
  assertEqual(libCamps[0].id, 'strahd_campaign', 'Retrieved campaign has correct ID');

  // 3. Test deleteCampaignFromIndexedDBLibrary
  const delResult = await sandbox.deleteCampaignFromIndexedDBLibrary('strahd_campaign');
  assert(delResult === true, 'deleteCampaignFromIndexedDBLibrary returns success');
  assertEqual(Object.keys(mockDbStores.campaign_library).length, 0, 'Campaign cleanly purged from library');

  // 4. Test scanCampaignsDirectory simulation
  const mockEntries = new Map();
  mockEntries.set('silica_dunes', {
    kind: 'directory',
    name: 'silica_dunes',
    getFileHandle: async (filename) => {
      if (filename === 'campaign.json') {
        return {
          getFile: async () => ({
            text: async () => JSON.stringify({
              id: 'silica_dunes',
              name: 'Silica Dunes Sandbox',
              description: 'Desert survival pointcrawl',
              entities: { npcs: [{ id: 'nomad' }], quests: [], items: [] }
            })
          })
        };
      }
      if (filename === 'topology.json') {
        return {
          getFile: async () => ({
            text: async () => JSON.stringify({
              maps: {
                map_root: { nodes: [{ id: 1 }, { id: 2 }, { id: 3 }] }
              }
            })
          })
        };
      }
      throw new Error('File not found');
    }
  });

  const mockRootHandle = {
    name: 'campaigns',
    entries: async function* () {
      for (const [k, v] of mockEntries.entries()) {
        yield [k, v];
      }
    }
  };

  const scanned = await sandbox.scanCampaignsDirectory(mockRootHandle);
  assertEqual(Object.keys(scanned).length, 1, 'scanCampaignsDirectory finds exactly 1 campaign folder on disk');
  assertEqual(scanned['silica_dunes'].title, 'Silica Dunes Sandbox', 'Correct campaign title parsed from campaign.json');
  assertEqual(scanned['silica_dunes'].nodeCount, 3, 'Correct node count (3) parsed from topology.json');
  assertEqual(scanned['silica_dunes'].entityCount, 1, 'Correct entity count (1) counted');

  // 5. Test hydrateMapsWithImageDataUrls & resolveMapBackgroundUrl (portable background images)
  const samplePngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  await sandbox.saveMapImageToDB('dunes_bg.png', samplePngDataUrl, 1600, 900, 0.9, 'map_root');
  const strippedMaps = {
    map_root: {
      id: 'map_root',
      name: 'Root Map',
      mapMetadata: { name: 'dunes_bg.png', width: 1600, height: 900, opacity: 0.9 } // dataUrl stripped by stripMapImageDataUrl
    }
  };
  const hydrated = await sandbox.hydrateMapsWithImageDataUrls(strippedMaps);
  assertEqual(hydrated.map_root.mapMetadata.dataUrl, samplePngDataUrl, 'hydrateMapsWithImageDataUrls restores stripped dataUrl from IndexedDB before zip/folder export');
  assertEqual(hydrated.map_root.mapMetadata.assetPath, 'assets/map_root_bg.png', 'hydrateMapsWithImageDataUrls assigns assets/map_root_bg.png assetPath');

  // Simulate moving folder to a new machine (empty IndexedDB) and resolving relative offline assetPath
  await sandbox.deletePersistedMapFromDB('map_root');
  sandbox.activeCampaignId = 'silician';
  const resolvedOffline = await sandbox.resolveMapBackgroundUrl('map_root', { name: 'dunes_bg.png', assetPath: 'assets/map_root_bg.png', width: 1600, height: 900, opacity: 0.9 });
  assert(resolvedOffline && resolvedOffline.url === 'campaigns/silician/assets/map_root_bg.png', 'resolveMapBackgroundUrl falls back to zero-CORS relative campaign asset path when IndexedDB is empty');

  // 6. Test New Campaign Wizard Dynamic Presets (No hardcoded presets)
  sandbox.escapeHtml = (s) => String(s);
  sandbox.closeModal = () => {};
  sandbox.closeAllMenus = () => {};
  sandbox.renderCanvas = () => {};
  sandbox.selectGlobal = () => {};
  sandbox.updateStatusBar = () => {};
  sandbox.setInterval = global.setInterval;
  sandbox.clearInterval = global.clearInterval;
  sandbox.window.addEventListener = () => {};
  sandbox.CAMPAIGN_REGISTRY = {
    'emerald_isle': {
      id: 'emerald_isle',
      folder: 'Emerald Isle',
      metadata: { name: 'Emerald Isle', description: 'Island setting' },
      preset: { name: 'Emerald Isle', nodes: [{ id: 1, name: 'Harbor' }], maps: { map_root: { nodes: [{ id: 1 }] } } },
      modules: []
    }
  };
  sandbox.window.discoveredDiskCampaigns = {};

  const mdiManagerPath = path.join(ROOT_DIR, 'src/workstation/scripts/mdi_window_manager.js');
  const mdiManagerCode = fs.readFileSync(mdiManagerPath, 'utf8');
  vm.runInContext(mdiManagerCode, sandbox);

  const presetsFromRegistry = sandbox.window.getCampaignFolderPresets();
  assertEqual(presetsFromRegistry.length, 2, 'getCampaignFolderPresets returns Blank Canvas starter plus 1 campaign from CAMPAIGN_REGISTRY');
  assert(presetsFromRegistry.some(p => p.id === 'blank_canvas'), 'Blank Canvas starter preset included');
  assert(presetsFromRegistry.some(p => p.id === 'emerald_isle'), 'Campaign preset matches emerald_isle');
  assert(!presetsFromRegistry.some(p => p.id === 'generic_starter' || p.id === 'opal_island'), 'No hardcoded presets (generic_starter/opal_island) returned');

  // When disk campaigns are discovered in campaigns folder, they are included
  sandbox.window.discoveredDiskCampaigns = {
    'desert_oasis': {
      id: 'desert_oasis',
      folderName: 'desert_oasis',
      title: 'Desert Oasis',
      description: 'Oasis campaign',
      nodeCount: 5,
      topo: { maps: { map_root: { nodes: [{ id: 1 }, { id: 2 }] } } }
    }
  };
  const combinedPresets = sandbox.window.getCampaignFolderPresets();
  assertEqual(combinedPresets.length, 3, 'getCampaignFolderPresets returns 3 campaigns (Blank Canvas + 2 campaigns) when disk folder has desert_oasis');
  assert(combinedPresets.some(p => p.id === 'blank_canvas'), 'Blank Canvas starter included in combined presets');
  assert(combinedPresets.some(p => p.id === 'desert_oasis'), 'Desert Oasis disk campaign included in presets list');
  assert(combinedPresets.some(p => p.id === 'emerald_isle'), 'Emerald Isle registry campaign included in presets list');

  // 7. Test handleToolbarSave Prompting When Disk Is Not Bound
  let confirmPromptMessage = null;
  let confirmResponse = false;
  sandbox.window.confirm = (msg) => {
    confirmPromptMessage = msg;
    return confirmResponse;
  };

  let modalOpened = false;
  sandbox.openSaveAsNewCampaignModal = () => { modalOpened = true; };
  let lastStatusMsg = "";
  sandbox.setStatusBarMessage = (msg) => { lastStatusMsg = msg; };
  let lastIndicatorStatus = "";
  sandbox.updateDiskSyncIndicator = (status) => { lastIndicatorStatus = status; };

  sandbox.window.activeProjectDirectoryHandle = null;
  sandbox.window.pendingProjectDirectoryHandle = null;

  // Case A: User declines to bind live disk sync
  confirmResponse = false;
  modalOpened = false;
  await sandbox.handleToolbarSave();
  assert(confirmPromptMessage && confirmPromptMessage.includes("No disk folder is linked"), 'handleToolbarSave prompts author when no disk folder is bound');
  assert(!modalOpened, 'Save As modal not opened when user cancels prompt');
  assert(lastStatusMsg.includes("Not saved to disk"), 'Status bar warns user that changes are not saved to disk');
  assertEqual(lastIndicatorStatus, 'none', 'Disk sync indicator set to none when unlinked');

  // Case B: User accepts prompt to bind live disk sync
  confirmResponse = true;
  modalOpened = false;
  await sandbox.handleToolbarSave();
  assert(modalOpened, 'Save As modal opens when author confirms binding live disk sync');

  // 8. Test saveActiveCampaignAsNew Binds Live Disk Sync
  const createdSubDirs = {};
  const mockSubDirHandle = {
    name: 'emerald_isle',
    getFileHandle: async () => ({
      createWritable: async () => ({
        write: async () => {},
        close: async () => {}
      })
    })
  };

  const mockCampaignsRootHandle = {
    name: 'campaigns',
    queryPermission: async () => 'granted',
    requestPermission: async () => 'granted',
    getDirectoryHandle: async (slug, opts = {}) => {
      if (!opts.create && !createdSubDirs[slug]) {
        const err = new Error("NotFoundError");
        err.name = "NotFoundError";
        throw err;
      }
      createdSubDirs[slug] = opts;
      return mockSubDirHandle;
    }
  };

  sandbox.window.campaignsRootDirectoryHandle = mockCampaignsRootHandle;
  sandbox.window.activeProjectDirectoryHandle = null;

  const saveAsOk = await sandbox.saveActiveCampaignAsNew('Emerald Isle', 'emerald_isle', 'Emerald Isle island setting', 'disk');
  assert(saveAsOk === true, 'saveActiveCampaignAsNew succeeds for disk mode');
  assert(createdSubDirs['emerald_isle'] && createdSubDirs['emerald_isle'].create, 'saveActiveCampaignAsNew created /campaigns/emerald_isle subfolder');
  assertEqual(sandbox.window.activeProjectDirectoryHandle, mockSubDirHandle, 'saveActiveCampaignAsNew bounds new subDir to activeProjectDirectoryHandle');
  assertEqual(sandbox.window.activeProjectDirectoryName, 'emerald_isle', 'Active project directory name set to emerald_isle');
  assert(lastStatusMsg.includes('with live disk sync bound'), 'Status bar confirms live disk sync bound');

  // 9. Test loadCampaignFromDirectoryHandle Background Image Hydration & Resolution
  let closedModals = [];
  sandbox.closeModal = (id) => { closedModals.push(id); };

  const fakeImageBytes = Buffer.from("fake-jpeg-image-bytes");
  const fakeBlob = {
    type: "image/jpeg",
    arrayBuffer: async () => fakeImageBytes.buffer.slice(fakeImageBytes.byteOffset, fakeImageBytes.byteOffset + fakeImageBytes.byteLength)
  };

  const mockAssetsHandle = {
    kind: "directory",
    name: "assets",
    getFileHandle: async (name) => {
      if (name === "map_root_bg.jpg") {
        return {
          kind: "file",
          name: "map_root_bg.jpg",
          getFile: async () => fakeBlob
        };
      }
      const err = new Error("FileNotFound");
      err.name = "NotFoundError";
      throw err;
    },
    entries: async function* () {
      yield ["map_root_bg.jpg", { kind: "file", getFile: async () => fakeBlob }];
    }
  };

  let loadedCampaignPkg = null;
  sandbox.window.loadCampaignProjectPackage = async (pkg) => {
    loadedCampaignPkg = pkg;
    sandbox.maps = pkg.maps;
    sandbox.activeMapId = "map_root";
  };

  const mockEmeraldCampaignDir = {
    kind: "directory",
    name: "emerald_isle",
    getFileHandle: async (name) => {
      if (name === "campaign.json") {
        return {
          getFile: async () => ({
            text: async () => JSON.stringify({
              id: "emerald_isle",
              name: "Emerald Isle",
              description: "Emerald Isle archipelago"
            })
          })
        };
      }
      if (name === "topology.json") {
        return {
          getFile: async () => ({
            text: async () => JSON.stringify({
              maps: {
                map_root: {
                  id: "map_root",
                  name: "Emerald Isle - Main Regional Map",
                  scaleTier: "region",
                  nodes: [{ id: 1, name: "Harbor" }],
                  links: [],
                  mapMetadata: {
                    name: "map_root_bg.jpg",
                    assetPath: "assets/map_root_bg.jpg",
                    width: 2560,
                    height: 1440,
                    opacity: 0.9
                  }
                }
              }
            })
          })
        };
      }
      const err = new Error("FileNotFound");
      err.name = "NotFoundError";
      throw err;
    },
    getDirectoryHandle: async (name) => {
      if (name.toLowerCase() === "assets") {
        return mockAssetsHandle;
      }
      if (name === "modules") {
        return {
          values: async function* () {}
        };
      }
      const err = new Error("NotFoundError");
      err.name = "NotFoundError";
      throw err;
    }
  };

  await sandbox.loadCampaignFromDirectoryHandle(mockEmeraldCampaignDir);

  assert(loadedCampaignPkg !== null, 'loadCampaignFromDirectoryHandle passes hydrated package to loadCampaignProjectPackage');
  assert(loadedCampaignPkg.maps && loadedCampaignPkg.maps.map_root, 'Hydrated package contains root map');
  const rootMeta = loadedCampaignPkg.maps.map_root.mapMetadata;
  assert(rootMeta && rootMeta.dataUrl, 'Root map metadata has dataUrl hydrated from disk assets');
  assert(rootMeta.dataUrl.startsWith('data:image/jpeg;base64,'), 'Hydrated dataUrl contains correct MIME type and base64');
  assertEqual(rootMeta.width, 2560, 'Root map metadata width is preserved');
  assertEqual(rootMeta.height, 1440, 'Root map metadata height is preserved');
  assert(closedModals.includes('modal-load'), 'loadCampaignFromDirectoryHandle automatically closes modal-load');

  // Verify resolveMapBackgroundUrl finds and resolves this image from DB or metadata
  const resolvedBg = await sandbox.resolveMapBackgroundUrl('map_root', rootMeta);
  assert(resolvedBg !== null, 'resolveMapBackgroundUrl successfully resolves background image');
  assert(resolvedBg.url && resolvedBg.url.startsWith('data:image/jpeg;base64,'), 'resolveMapBackgroundUrl returns valid dataUrl');
  assertEqual(resolvedBg.width, 2560, 'resolveMapBackgroundUrl preserves image width');
  assertEqual(resolvedBg.height, 1440, 'resolveMapBackgroundUrl preserves image height');

  // Verify resolveCampaignWorkspaceHierarchy smart folder normalization (/Documents, USB root, /campaigns, direct campaign)
  const dirDirect = await sandbox.resolveCampaignWorkspaceHierarchy(mockEmeraldCampaignDir, 'emerald_isle');
  assertEqual(dirDirect.mode, 'direct_campaign', 'resolveCampaignWorkspaceHierarchy detects direct campaign folder with campaign.json');
  assertEqual(dirDirect.activeCampaignHandle, mockEmeraldCampaignDir, 'Direct campaign folder returns itself as activeCampaignHandle');

  const createdDirs = [];
  const mockSubCampaignDir = { name: 'my_campaign', getFileHandle: async () => { throw new Error('NotFound'); } };
  const mockCampaignsRoot = {
    name: 'campaigns',
    getFileHandle: async () => { throw new Error('NotFound'); },
    getDirectoryHandle: async (n, opts) => {
      if (opts && opts.create) {
        createdDirs.push(`campaigns/${n}`);
        return mockSubCampaignDir;
      }
      throw new Error('NotFound');
    }
  };
  const mockDocumentsRoot = {
    name: 'Documents',
    getFileHandle: async () => { throw new Error('NotFound'); },
    getDirectoryHandle: async (n, opts) => {
      if (n === 'campaigns' && opts && opts.create) {
        createdDirs.push('Documents/campaigns');
        return mockCampaignsRoot;
      }
      throw new Error('NotFound');
    }
  };

  const docsHierarchy = await sandbox.resolveCampaignWorkspaceHierarchy(mockDocumentsRoot, 'my_campaign');
  assertEqual(docsHierarchy.mode, 'parent_container', 'resolveCampaignWorkspaceHierarchy normalizes /Documents as parent_container');
  assertEqual(docsHierarchy.campaignsRootHandle, mockCampaignsRoot, 'resolveCampaignWorkspaceHierarchy resolves /Documents/campaigns');
  assertEqual(docsHierarchy.activeCampaignHandle, mockSubCampaignDir, 'resolveCampaignWorkspaceHierarchy resolves /Documents/campaigns/my_campaign');
  assert(createdDirs.includes('Documents/campaigns') && createdDirs.includes('campaigns/my_campaign'), 'Auto-creates /Documents/campaigns/<slug> hierarchy');

  // Verify lifecycle_modals.html vestigial Module Explorer button and requestEnterWorkstation wiring
  const lifecycleHtml = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/modals/lifecycle_modals.html'), 'utf8');
  assert(lifecycleHtml.includes('<!-- VESTIGIAL: Module Explorer button'), 'Welcome dialog preserves Module Explorer button vestigially in HTML comment');
  assert(lifecycleHtml.includes('requestEnterWorkstation()'), 'Welcome dialog Enter Workstation button routes through requestEnterWorkstation()');
  assert(lifecycleHtml.includes('welcome-disk-docs-btn'), 'Welcome dialog includes Use /Documents QoL button');
}

// ============================================================================
// SUITE 11: MODULE DELETION & ENTITY EXPLORER INTEGRITY
// ============================================================================
async function testModuleDeletionAndEntityExplorer() {
  console.log('\n--> SUITE 11: Module Deletion, Prototype Filtering & Entity Manager Integrity...');

  const entityCorePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js');
  const entityCoreCode = fs.readFileSync(entityCorePath, 'utf8');

  const cascadeDeletePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_cascade_delete.js');
  const cascadeDeleteCode = fs.readFileSync(cascadeDeletePath, 'utf8');

  const entityUiPath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_manager_ui.js');
  const entityUiCode = fs.readFileSync(entityUiPath, 'utf8');

  const workstationStatePath = path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js');
  const workstationStateCode = fs.readFileSync(workstationStatePath, 'utf8');

  const elements = {};
  function mockEl(id) {
    if (!elements[id]) {
      elements[id] = {
        id,
        innerHTML: '',
        textContent: '',
        children: [],
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: function(c) { this.children.push(c); },
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        removeAttribute: () => {},
        style: {}
      };
    }
    return elements[id];
  }

  const lsStore = {};
  const removedEntries = [];
  let updatedManifestJson = null;

  const mockSetADir = {
    kind: 'directory',
    name: 'Set_A_Infrastructure',
    removeEntry: async (fName) => { removedEntries.push(`Set_A_Infrastructure/${fName}`); },
    values: async function* () {
      yield { kind: 'file', name: 'SPARK-07_frontier_garrison.md' };
    }
  };
  const mockModulesDir = {
    kind: 'directory',
    name: 'modules',
    getDirectoryHandle: async (seg) => {
      if (seg === 'Set_A_Infrastructure') return mockSetADir;
      throw new Error('Not found');
    },
    removeEntry: async (fName) => { removedEntries.push(`modules/${fName}`); },
    values: async function* () {
      yield mockSetADir;
    }
  };
  const mockProjectDirHandle = {
    kind: 'directory',
    name: 'opal_island',
    getDirectoryHandle: async (seg) => {
      if (seg === 'modules') return mockModulesDir;
      throw new Error('Not found');
    },
    getFileHandle: async (fName) => {
      if (fName === 'modules_manifest.json') {
        return {
          getFile: async () => ({
            text: async () => JSON.stringify([{ id: 'SPARK-07', title: 'Frontier Garrison' }, { id: 'CORE-01', title: 'Core Rules' }])
          }),
          createWritable: async () => ({
            write: async (data) => { updatedManifestJson = JSON.parse(data); },
            close: async () => {}
          })
        };
      }
      throw new Error('Not found');
    },
    removeEntry: async (fName) => { removedEntries.push(fName); },
    values: async function* () {
      yield mockModulesDir;
    }
  };

  const initialTopo = {
    id: 'map_root',
    nodes: { '1': { id: 1, name: 'Outpost' } },
    npcs: [{ id: 'npc-1', name: 'Guard', nodeId: 1, moduleId: 'SPARK-07' }],
    quests: [],
    items: [],
    trackers: [],
    tickets: []
  };

  const sandbox = {
    console: console,
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: {
      getItem: (k) => lsStore[k] || null,
      setItem: (k, v) => { lsStore[k] = String(v); },
      removeItem: (k) => { delete lsStore[k]; }
    },
    activeProjectDirectoryHandle: mockProjectDirHandle,
    document: {
      addEventListener: () => {},
      removeEventListener: () => {},
      getElementById: (id) => mockEl(id),
      createElement: (tag) => ({
        tagName: tag,
        innerHTML: '',
        textContent: '',
        children: [],
        classList: { add: () => {}, remove: () => {} },
        appendChild: function(c) { this.children.push(c); },
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        removeAttribute: () => {},
        style: {}
      }),
      querySelectorAll: () => []
    },
    MDIWindowManager: {
      open: () => {},
      close: () => {},
      windows: {},
      renderTaskbar: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    closeAllMenus: () => {},
    Workstation: {
      activeTopology: initialTopo
    },
    ALL_MODULES: [
      {
        id: 'SPARK-07',
        title: 'Frontier Garrison',
        campaign: 'opal_island',
        path: './modules/Set_A_Infrastructure/SPARK-07_frontier_garrison.md',
        file_url: 'campaigns/opal_island/modules/Set_A_Infrastructure/SPARK-07_frontier_garrison.md',
        extracted_npcs: [{ id: 'PROTO-NPC-HROLF', name: 'Commander Hrolf', moduleId: 'SPARK-07' }],
        threat_clocks: ['**Garrison Siege [4 Ticks]**: Winter forces close in.']
      },
      {
        id: 'CORE-01',
        title: 'Core Rules',
        extracted_npcs: [{ id: 'PROTO-NPC-GUIDE', name: 'Old Guide', moduleId: 'CORE-01' }],
        threat_clocks: []
      }
    ],
    MODULE_ENTITY_PROTOTYPES: { npcs: [], quests: [], items: [], trackers: [] }
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(workstationStateCode, sandbox);
  sandbox.Workstation.activeTopology = initialTopo;
  vm.runInContext(entityCoreCode, sandbox);
  injectEngine(sandbox);
  vm.runInContext(cascadeDeleteCode, sandbox);
  vm.runInContext(entityUiCode, sandbox);

  // 1. Initial Prototypes retrieval
  const initialNpcProtos = sandbox.getPrototypesForType('npc');
  assert(initialNpcProtos.length >= 2, 'Initial NPC prototypes extracted from modules');
  assert(initialNpcProtos.some(p => p.moduleId === 'SPARK-07'), 'SPARK-07 NPC prototype present before deletion');

  // 2. Perform nested disk file deletion + module deletion
  await sandbox.deleteModuleFilesFromBoundProjectDirectory(['SPARK-07']);
  assert(removedEntries.includes('Set_A_Infrastructure/SPARK-07_frontier_garrison.md'), 'deleteModuleFilesFromBoundProjectDirectory removes nested module .md file');
  assert(Array.isArray(updatedManifestJson) && !updatedManifestJson.some(m => m.id === 'SPARK-07'), 'deleteModuleFilesFromBoundProjectDirectory purges module from modules_manifest.json');

  sandbox.executeEntityDeletion([{ type: 'module', id: 'SPARK-07' }]);
  assert(Array.isArray(sandbox.Workstation.activeTopology.deletedModules), 'activeTopology.deletedModules is array');
  assert(sandbox.Workstation.activeTopology.deletedModules.includes('SPARK-07'), 'deletedModules tracks SPARK-07');
  assert(JSON.parse(lsStore['cs_deleted_modules'] || '[]').includes('SPARK-07'), 'cs_deleted_modules persists SPARK-07 in localStorage across boots');

  // Simulate page reload where ALL_MODULES is re-populated from inline bundle and purgeDeletedModulesFromRuntimeCatalog runs on boot
  sandbox.ALL_MODULES.push({ id: 'SPARK-07', title: 'Frontier Garrison Re-bundled' });
  sandbox.purgeDeletedModulesFromRuntimeCatalog({ deletedModules: [] });
  assert(!sandbox.ALL_MODULES.some(m => m.id === 'SPARK-07'), 'purgeDeletedModulesFromRuntimeCatalog purges deleted module from ALL_MODULES on reboot');

  // 3. Prototypes retrieval AFTER module deletion must NOT throw TypeError
  let filteredNpcProtos = [];
  let noErrorThrown = false;
  try {
    filteredNpcProtos = sandbox.getPrototypesForType('npc');
    noErrorThrown = true;
  } catch (err) {
    console.error('Unexpected error in getPrototypesForType after module deletion:', err);
  }
  assert(noErrorThrown, 'getPrototypesForType executes without TypeError after module deletion');
  assert(!filteredNpcProtos.some(p => p.moduleId === 'SPARK-07'), 'Deleted module SPARK-07 prototypes filtered out');
  assert(filteredNpcProtos.some(p => p.moduleId === 'CORE-01'), 'Remaining module CORE-01 prototypes preserved');

  // 4. Entity manager open and tab switching after module deletion
  let managerOpenedCleanly = false;
  try {
    sandbox.openEntityManager('npc');
    sandbox.switchEntityManagerTab('quest');
    sandbox.switchEntityManagerTab('item');
    sandbox.switchEntityManagerTab('tracker');
    sandbox.switchEntityManagerTab('node');
    sandbox.switchEntityManagerTab('npc');
    managerOpenedCleanly = true;
  } catch (err) {
    console.error('Unexpected error in entity manager tabs after module deletion:', err);
  }
  assert(managerOpenedCleanly, 'Entity manager opens and switches tabs cleanly after module deletion');
}

// ============================================================================
// SUITE 12: AD-HOC RESOURCE FLOWS & CUSTOM MODULE STUDIO (SYS-START-08 / 09)
// ============================================================================
function testAdHocResourceFlowsAndCustomModules() {
  console.log('\n--> SUITE 12: Ad-Hoc Resource Supply Flows & Custom Module Studio (SYS-START-08 / SYS-START-09)...');
  const slottingCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/supply_chain_simulator.js'), 'utf8');
  const explorerCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/module_explorer.js'), 'utf8');

  const topo = {
    nodes: {
      '1': { id: 1, name: 'Basalt Quarry', adj: [2], infBy: [], provides: ['Mat: Cut-Basalt'], requires: [] },
      '2': { id: 2, name: 'Harbor Citadel', adj: [1], infBy: [], provides: ['Mat: Harbor-Coal'], requires: ['Mat: Cut-Basalt', 'Power: Geothermal-Steam'] }
    },
    edgeData: {
      '1-2': { a: 1, b: 2, condition: 'clear', dedicatedFlows: ['Power: Geothermal-Steam'] }
    },
    custom_modules: []
  };

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, addEventListener: () => {} }),
      body: { appendChild: () => {} }
    },
    console,
    ALL_MODULES: [],
    MODULES_MANIFEST: [
      { id: 'TEST-MOD-1', title: 'Steam Foundry', pipeline_tier: 3, provides: ['Mat: Steel-Plate'], requires: ['Mat: Cut-Basalt', 'Power: Geothermal-Steam'] }
    ],
    nodeSlottedModules: { '1': [], '2': ['TEST-MOD-1'] },
    edgeSlottedModules: {},
    nodeSupplyStatus: {},
    tier0SubstratumEnabled: false,
    tier0SubstratumMode: 'off',
    targetSlottingNodeId: 2,
    selectedCatalogOptionGroup: 'ALL',
    nodes: Object.values(topo.nodes),
    Workstation: { activeTopology: topo },
    getNode: (id) => topo.nodes[String(id)] || null,
    getNodeAdjacents: (id) => (topo.nodes[String(id)] && topo.nodes[String(id)].adj) || [],
    getEdgeKey: (a, b) => (Number(a) < Number(b) ? `${a}-${b}` : `${b}-${a}`),
    getEdgeRecord: (a, b) => topo.edgeData[Number(a) < Number(b) ? `${a}-${b}` : `${b}-${a}`] || null,
    isEdgeBlocked: (a, b) => {
      const rec = topo.edgeData[Number(a) < Number(b) ? `${a}-${b}` : `${b}-${a}`];
      return rec && rec.condition === 'severed';
    },
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    saveActiveCampaign: () => {},
    setStatusBarMessage: () => {},
    MDIWindowManager: { open: () => {}, close: () => {} }
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(slottingCode, sandbox);
  vm.runInContext(explorerCode, sandbox);

  // 1. SYS-START-08: Ad-hoc node.provides (Node 1) + edgeData.dedicatedFlows ('1-2') satisfy Node 2's slotted & intrinsic demands
  const initialSevered = sandbox.auditAllSupplyLines();
  const intactCheck = sandbox.checkNodeAdHocSupplyLine(2);
  assertEqual(initialSevered, 0, 'Node 2 supply line satisfied via peer node.provides and edge dedicatedFlows');
  assertEqual(intactCheck.ok, true, 'checkNodeAdHocSupplyLine(2) reports ok: true when edge is intact');

  // Sever edge 1-2 and verify both module and intrinsic node.requires report deficit
  topo.edgeData['1-2'].condition = 'severed';
  const severedCount = sandbox.auditAllSupplyLines();
  const severedCheck = sandbox.checkNodeAdHocSupplyLine(2);
  assert(severedCount > 0 && severedCheck.ok === false, 'Severing edge 1-2 triggers supply deficit on Node 2');
  assert(severedCheck.missing.includes('Mat: Cut-Basalt'), 'Missing includes Mat: Cut-Basalt from severed peer node.provides');
  assert(severedCheck.missing.includes('Power: Geothermal-Steam'), 'Missing includes Power: Geothermal-Steam from severed edge dedicatedFlows');
  topo.edgeData['1-2'].condition = 'clear';

  // 2. SYS-START-08: Recommendation score boosts module that satisfies intrinsic node.requires and uses node.provides
  const providerMod = { id: 'PROVIDER-1', title: 'Geothermal Bore', provides: ['Power: Geothermal-Steam'], requires: ['Mat: Harbor-Coal'] };
  const rec = sandbox.calculateRecommendationScore(2, providerMod);
  assert(rec.score >= 14, 'Recommendation engine awards +8 (satisfies node.requires) and +6 (fed by node.provides)');

  // 3. SYS-START-09: Custom Module normalization, Markdown generation, and Catalog sync
  const customRec = sandbox.normalizeCustomModuleRecord({
    id: 'CUST-01',
    title: 'Basalt Steamworks',
    pipeline_tier: 3,
    provides: ['Power: Geothermal-Steam'],
    requires: ['Mat: Cut-Basalt']
  });
  assertEqual(customRec.id, 'CUST-01', 'normalizeCustomModuleRecord preserves custom ID');
  assertEqual(customRec.campaign_name, 'Custom / Homebrew', 'normalizeCustomModuleRecord assigns Custom / Homebrew campaign_name');
  assert(customRec.raw_markdown.includes('pipeline_tier: 3'), 'buildCustomModuleMarkdown generates YAML frontmatter');

  topo.custom_modules.push(customRec);
  sandbox.syncCustomModulesToCatalog(topo);
  assert(sandbox.ALL_MODULES.some(m => m.id === 'CUST-01'), 'syncCustomModulesToCatalog injects custom module into ALL_MODULES');
  assert(sandbox.MODULES_MANIFEST.some(m => m.id === 'CUST-01'), 'syncCustomModulesToCatalog injects custom module into MODULES_MANIFEST');
}

function testOdvCampaignReflectionAndDenseMatrix() {
  console.log('\n--> SUITE 13: 64-Cell ODV Matrix Campaign State Reflection, Corridor Friction & Dense Cards (ADR 0014)...');
  const socioPath = path.join(ROOT_DIR, 'src/workstation/scripts/sociology_data.js');
  const socioCode = fs.readFileSync(socioPath, 'utf8');
  const matrixHtmlPath = path.join(ROOT_DIR, 'network/odv_archetype_matrix.html');
  const matrixHtml = fs.readFileSync(matrixHtmlPath, 'utf8');

  const scriptMatches = [...matrixHtml.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const inlineScript = scriptMatches.map(m => m[1]).find(s => s.includes('buildCampaignOdvIndex'));
  assert(!!inlineScript, 'odv_archetype_matrix.html contains buildCampaignOdvIndex inline engine');

  const mockElements = {};
  const getEl = (id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        innerText: '',
        innerHTML: '',
        value: '',
        className: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        querySelector: () => ({ classList: { add: () => {}, remove: () => {} } })
      };
    }
    return mockElements[id];
  };

  const mockStorage = {};
  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: (id) => getEl(id),
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); }
    },
    navigator: { clipboard: { writeText: async () => {} } },
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(socioCode, sandbox);
  vm.runInContext(inlineScript, sandbox);

  // 1. Verify Node ODV resolution (explicit object, array, and canonical fallback)
  const explicitObjOdv = sandbox.resolveNodeOdv({ id: 1, odv: { s: 4, e: 1, c: 3 } });
  assertEqual(explicitObjOdv.tag, '[4, 1, 3]', 'resolveNodeOdv resolves explicit object { s: 4, e: 1, c: 3 }');
  assertEqual(explicitObjOdv.explicit, true, 'resolveNodeOdv marks explicit object as explicit: true');

  const explicitArrOdv = sandbox.resolveNodeOdv({ id: 2, odv: [1, 3, 4] });
  assertEqual(explicitArrOdv.tag, '[1, 3, 4]', 'resolveNodeOdv resolves explicit array [1, 3, 4]');

  const canonicalFallbackOdv = sandbox.resolveNodeOdv({ id: 1, name: 'Beachhead' });
  assertEqual(canonicalFallbackOdv.tag, '[2, 2, 2]', 'resolveNodeOdv falls back to mathematical baseline [2, 2, 2] ("The Deliberative Concord") for untagged Node 1');

  const cultureFallbackClan = sandbox.resolveNodeOdv({ id: 2, name: 'Clan Redoubt', culture: 'Clan' });
  assertEqual(cultureFallbackClan.tag, '[3, 2, 2]', 'resolveNodeOdv falls back to Clan culture disposition [3, 2, 2]');

  const cultureFallbackMarket = sandbox.resolveNodeOdv({ id: 3, name: 'Market Bazaar', culture: 'Market' });
  assertEqual(cultureFallbackMarket.tag, '[2, 3, 2]', 'resolveNodeOdv falls back to Market culture disposition [2, 3, 2]');

  // 1b. Canonical getOdv / getEdgeOdv / getNodeQuadrant (SYS-ODV-02 S1)
  const g0 = sandbox.getOdv({});
  assertEqual(g0.set, false, 'getOdv({}) is unset');
  assertEqual(g0.source, 'unset', 'getOdv({}) source is unset');
  assertEqual(sandbox.getOdv({ odv: null }).set, false, 'getOdv({odv:null}) is unset');
  assertEqual(sandbox.getOdv({ odv: [0, 1, 2] }).source, 'invalid', 'getOdv rejects 0 instead of coercing to 2');
  assertEqual(sandbox.getOdv({ odv: [9, 9, 9] }).source, 'invalid', 'getOdv rejects [9,9,9] instead of clamping');
  assertEqual(sandbox.getOdv({ odv: '[1, 3, 4]' }).tag, '[1, 3, 4]', 'getOdv parses string tag');
  assertEqual(sandbox.getOdv({ odv: { s: 4, e: 1, c: 3 }, odvSource: 'authored' }).source, 'authored', 'getOdv reports odvSource');
  assertEqual(sandbox.getOdv({ disposition: 1 }).set, false, 'getOdv ignores NPC scalar disposition');
  assertEqual(sandbox.getOdv({ disposition: [3, 3, 3] }).set, true, 'getOdv reads array disposition');
  const eUnset = sandbox.getEdgeOdv(null, { set: true, s: 1, e: 1, c: 1 }, { set: false }, null);
  assertEqual(eUnset.set, false, 'getEdgeOdv with an unset endpoint is unset');
  assertEqual(eUnset.totalDelta, null, 'getEdgeOdv with an unset endpoint has null totalDelta');
  assertEqual(eUnset.isHighHazard, false, 'getEdgeOdv with an unset endpoint is not high hazard');
  assertEqual(sandbox.getNodeQuadrant({ culture: 'Clan' }), 'Clan', 'getNodeQuadrant honours authored culture');
  assertEqual(sandbox.getNodeQuadrant({}), null, 'getNodeQuadrant is null when nothing is set');

  // 1d. Campaign override slots (SYS-ODV-04 S1)
  {
    const ovr = require(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_override_slots.js'));
    const log = [];
    const mk = (id, bad) => ({ id, files: [new RegExp('^' + id + '\\.json$')], parse: x => x, validate: p => { if (bad) throw new Error('boom'); return []; }, apply: p => log.push('apply:' + id), clear: () => log.push('clear:' + id) });
    const slots = [mk('a', true), mk('b', false)];
    const rep = ovr.applyCampaignOverrides({ a: {}, b: {} }, slots);
    assertEqual(rep[0].status, 'skipped', 'bad slot is skipped');
    assertEqual(rep[1].status, 'applied', 'good slot still applies after a bad one');
    assertEqual(log.indexOf('clear:a') < log.indexOf('apply:b'), true, 'all slots cleared before apply');
    assertEqual(ovr.applyCampaignOverrides(null, slots).length, 0, 'null overrides applies nothing');
    assertEqual(ovr.matchSlotFile('overrides/odv_matrix_x.json').id, 'odvMatrix', 'matchSlotFile finds odvMatrix (overrides/ prefix)');
    assertEqual(ovr.matchSlotFile('campaign.json'), null, 'matchSlotFile ignores other files');
  }

  // 1c. Campaign ODV matrix overlay (SYS-ODV-03 S1)
  const builtin111 = sandbox.getArchetype('[1, 1, 1]').archetypeName;
  assertEqual(sandbox.getArchetypeDetails(1, 1, 1).archetypeName, builtin111, 'no override: built-in archetype');
  assertEqual(sandbox.setCampaignOdvMatrix({ matrix: { '[1, 1, 1]': { tag: '[1, 1, 1]', archetypeName: 'Krynn Test' } } }), 1, 'setCampaignOdvMatrix returns cell count');
  assertEqual(sandbox.getArchetypeDetails(1, 1, 1).archetypeName, 'Krynn Test', 'override cell wins');
  assertEqual(sandbox.getArchetype('[4, 4, 4]').archetypeName, sandbox.ODV_MATRIX_64['[4, 4, 4]'].archetypeName, 'omitted cell falls back to built-in');
  assertEqual(sandbox.ODV_MATRIX_64['[1, 1, 1]'].archetypeName, builtin111, 'built-in constant is never mutated');
  assertEqual(Object.keys(sandbox.getArchetypeMatrix()).length, Object.keys(sandbox.ODV_MATRIX_64).length, 'merged matrix keeps 64 cells');
  sandbox.setCampaignOdvMatrix(null);
  assertEqual(sandbox.getArchetype('[1, 1, 1]').archetypeName, builtin111, 'clearing override restores built-in');

  // 2. Verify Edge Corridor ODV resolution (midpoint centroid vs explicit override & friction delta)
  const midEdge = sandbox.resolveEdgeOdv(null, { s: 1, e: 1, c: 1 }, { s: 4, e: 3, c: 4 }, null);
  assertEqual(midEdge.tag, '[3, 2, 3]', 'resolveEdgeOdv computes rounded midpoint [3, 2, 3] between [1,1,1] and [4,3,4]');
  assertEqual(midEdge.totalDelta, 8, 'resolveEdgeOdv calculates corridor friction delta |1-4|+|1-3|+|1-4| = 8');
  assertEqual(midEdge.isHighHazard, true, 'resolveEdgeOdv flags Δ >= 5 as High-Hazard crossing');

  const explicitEdge = sandbox.resolveEdgeOdv({ odv: { s: 1, e: 2, c: 1 } }, { s: 4, e: 4, c: 4 }, { s: 4, e: 4, c: 4 }, null);
  assertEqual(explicitEdge.tag, '[1, 2, 1]', 'resolveEdgeOdv honors explicit edge.odv override');
  assertEqual(explicitEdge.explicit, true, 'resolveEdgeOdv marks explicit edge override as explicit: true');

  // 3. Verify Inverted Index generation & multi-occupant collision handling (>3 nodes in single cell)
  const sampleTopo = {
    name: 'Test Reflection Campaign',
    nodes: [
      { id: 1, name: 'Redoubt Alpha', odv: [4, 2, 2], adj: [2, 3] },
      { id: 2, name: 'Redoubt Beta',  odv: [4, 2, 2], adj: [1] },
      { id: 3, name: 'Redoubt Gamma', odv: [4, 2, 2], adj: [1] },
      { id: 4, name: 'Redoubt Delta', odv: [4, 2, 2], adj: [] },
      { id: 5, name: 'Citadel Omega', odv: [1, 1, 1], adj: [1] }
    ],
    edgeData: {
      '1-5': { name: 'Contested Gorge', odv: { s: 2, e: 1, c: 2 } }
    }
  };
  const idx = sandbox.buildCampaignOdvIndex(sampleTopo);
  assertEqual(idx['[4, 2, 2]'].nodes.length, 4, 'buildCampaignOdvIndex groups all 4 colliding nodes into [4, 2, 2]');
  assertEqual(idx['[4, 2, 2]'].edges.length, 2, 'buildCampaignOdvIndex maps corridors 1-2 and 1-3 to midpoint [4, 2, 2]');
  assertEqual(idx['[2, 1, 2]'].edges.length, 1, 'buildCampaignOdvIndex maps explicit corridor 1-5 to [2, 1, 2]');
  assertEqual(idx['[2, 1, 2]'].edges[0].isHighHazard, true, 'Corridor 1-5 ([4,2,2] <-> [1,1,1], Δ=5) flagged as isHighHazard');

  // 4. Verify Exemplar NPC Name & Dense Cell Formatter
  const npcName = sandbox.extractNpcName('**Warden Kaelen, Frontier Bailiff**<br>*"Keep your peace."*');
  assertEqual(npcName, 'Warden Kaelen, Frontier Bailiff', 'extractNpcName strips quote and HTML break to return clean NPC name');
  const denseHtml = sandbox.renderDenseCellRowsHtml(sandbox.ODV_MATRIX_64['[4, 2, 2]']);
  assert(denseHtml.includes('✨ Boon:') && denseHtml.includes('⚠️ Burden:') && denseHtml.includes('⚔️ Micro:') && denseHtml.includes('🗺️ Macro:') && denseHtml.includes('🎭 NPC:'), 'renderDenseCellRowsHtml renders all 5 required summary rows (Boon, Burden, Micro, Macro, NPC)');
}

function testCadHistoryAndUndoRedo() {
  console.log('\n--> SUITE 14: CAD Undo/Redo Engine & History Restitution (SYS-START-10)...');
  const zipPath = path.join(ROOT_DIR, 'src/workstation/scripts/zip_engine.js');
  const statePath = path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js');
  const mdiPath = path.join(ROOT_DIR, 'src/workstation/scripts/mdi_window_manager.js');

  const zipCode = fs.readFileSync(zipPath, 'utf8');
  const stateCode = fs.readFileSync(statePath, 'utf8');
  const mdiCode = fs.readFileSync(mdiPath, 'utf8');

  let statusMsg = '';
  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    setStatusBarMessage: (msg) => { statusMsg = msg; },
    renderCanvas: () => {},
    renderLayersManagerUI: () => {},
    updatePropertiesGrid: () => {},
    saveActiveCampaign: () => {},
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(zipCode, sandbox);
  vm.runInContext(stateCode, sandbox);
  vm.runInContext(mdiCode, sandbox);

  // 1. Invariants: Functions & Structures Exist
  assert(typeof sandbox.pushHistoryState === 'function', 'pushHistoryState function is defined');
  assert(sandbox.Workstation && sandbox.Workstation.history, 'Workstation.history controller exists');
  assertEqual(sandbox.Workstation.history.maxDepth, 30, 'Workstation.history.maxDepth is 30');
  assertEqual(sandbox.Workstation.history.undoStack.length, 0, 'undoStack initially empty');
  assertEqual(sandbox.Workstation.history.redoStack.length, 0, 'redoStack initially empty');

  // Setup test topology
  sandbox.Workstation.activeTopology = {
    nodes: {
      '1': { id: 1, name: 'Redoubt Alpha', x: 100, y: 150 }
    },
    links: [],
    shapes: [],
    mapMetadata: { name: 'Ground Floor', dataUrl: 'data:image/png;base64,LEAKY_IMAGE_DATA' },
    npcs: [], quests: [], items: [], trackers: [], tickets: []
  };

  // 2. Snapshot & Image Stripping Defense (F-06)
  sandbox.pushHistoryState('Initial Position');
  assertEqual(sandbox.Workstation.history.undoStack.length, 1, 'Snapshot pushed to undoStack');
  const snap1 = sandbox.Workstation.history.undoStack[0];
  assert(!snap1.topology.mapMetadata.dataUrl, 'stripMapImageDataUrl strips raster dataUrl from snapshot');

  // 3. Mutate Node & Execute Undo
  sandbox.Workstation.activeTopology.nodes['1'].x = 350;
  sandbox.Workstation.activeTopology.nodes['1'].y = 450;
  sandbox.Workstation.selectedEntities = [{ type: 'node', id: 1 }];

  sandbox.undoAction();
  assertEqual(sandbox.Workstation.activeTopology.nodes['1'].x, 100, 'undoAction restores node x coordinate');
  assertEqual(sandbox.Workstation.activeTopology.nodes['1'].y, 150, 'undoAction restores node y coordinate');
  assertEqual(sandbox.Workstation.selectedEntities.length, 0, 'undoAction resets Workstation.selectedEntities to prevent dangling references');
  assertEqual(sandbox.Workstation.history.redoStack.length, 1, 'undoAction moves undone state to redoStack');

  // 4. Execute Redo
  sandbox.redoAction();
  assertEqual(sandbox.Workstation.activeTopology.nodes['1'].x, 350, 'redoAction reapplies node x coordinate');
  assertEqual(sandbox.Workstation.activeTopology.nodes['1'].y, 450, 'redoAction reapplies node y coordinate');
  assertEqual(sandbox.Workstation.history.redoStack.length, 0, 'redoAction pops from redoStack');

  // 5. Bounded Depth Ring Buffer
  for (let i = 0; i < 35; i++) {
    sandbox.pushHistoryState('Step ' + i);
  }
  assertEqual(sandbox.Workstation.history.undoStack.length, 30, 'undoStack strictly capped at 30 states');
}

function testThreatClocksAndHazardRoller() {
  console.log('\n--> SUITE 15: Interactive Threat Clocks & Live Tabletop Hazard Roller (SYS-START-11)...');
  const ciPath = path.join(ROOT_DIR, 'src/workstation/scripts/cad_interaction.js');
  const pgiPath = path.join(ROOT_DIR, 'src/workstation/scripts/property_grid_inspector.js');

  const ciCode = fs.readFileSync(ciPath, 'utf8');
  const pgiCode = fs.readFileSync(pgiPath, 'utf8');

  let statusMsg = '';
  let historyPushed = '';
  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    setStatusBarMessage: (msg) => { statusMsg = msg; },
    scheduleRenderCanvas: () => {},
    saveActiveCampaign: () => {},
    pushHistoryState: (desc) => { historyPushed = desc; },
    Workstation: {
      activeTopology: {
        trackers: [
          { id: 'trk-1', name: 'Mine Collapse', currentTicks: 2, maxTicks: 4, type: 'Threat Clock' },
          { id: 'trk-2', name: 'Output Dial', currentTicks: 4, maxTicks: 4, type: 'Output Dial' }
        ],
        nodes: {
          '1': { id: '1', name: 'Bastion', odv: [4, 1, 3] },
          '2': { id: '2', name: 'Rebel Encampment', odv: [1, 4, 1] }
        }
      }
    },
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(ciCode, sandbox);
  vm.runInContext(pgiCode, sandbox);

  // 1. Threat Clock Segment Click Interaction
  assert(typeof sandbox.handleClockSegmentClick === 'function', 'handleClockSegmentClick function is exported');

  const tracker = sandbox.Workstation.activeTopology.trackers[0];
  // Currently 2 ticks. Clicking segment 1 (currentTicks - 1) unticks to 1.
  sandbox.handleClockSegmentClick(null, tracker.id, 1);
  assertEqual(tracker.currentTicks, 1, 'Clicking active tip decrements clock ticks by 1');

  // Clicking segment 2 (index 2 >= currentTicks) advances ticks to 3.
  sandbox.handleClockSegmentClick(null, tracker.id, 2);
  assertEqual(tracker.currentTicks, 3, 'Clicking unselected segment advances clock ticks to segmentIdx + 1');

  // Clicking segment 3 advances ticks to 4 (maxTicks). Must trigger threat alarm!
  sandbox.handleClockSegmentClick(null, tracker.id, 3);
  assertEqual(tracker.currentTicks, 4, 'Clock reaches maxTicks (4/4)');
  assert(statusMsg.includes('THREAT TRIGGERED') || statusMsg.includes('Mine Collapse'), 'Threat trigger alarm emitted to status bar');

  // 2. Corridor Hazard Calculation & Sociological Friction Escalation
  assert(typeof sandbox.calculateCorridorHazard === 'function', 'calculateCorridorHazard function is exported');

  const uNode = sandbox.Workstation.activeTopology.nodes['1']; // [4, 1, 3]
  const vNode = sandbox.Workstation.activeTopology.nodes['2']; // [1, 4, 1]
  // Manhattan delta: |4-1| + |1-4| + |3-1| = 3 + 3 + 2 = 8 (>= 5, high friction!)
  const edgeRecord = { hazardLevel: 1 }; // Base Light (1)

  const hazard = sandbox.calculateCorridorHazard(edgeRecord, uNode, vNode);
  assertEqual(hazard.baseLevel, 1, 'Base hazard level is 1 (Light)');
  assertEqual(hazard.frictionDelta, 8, 'Friction delta between [4,1,3] and [1,4,1] is 8');
  assertEqual(hazard.effectiveLevel, 2, 'High friction (Δ>=5) escalates effective hazard tier from Light (1) to Moderate (2)');
  assertEqual(hazard.dc, 13, 'Moderate hazard standard DC is 13');
  assertEqual(hazard.target2d6, 8, 'Moderate hazard 2d6 target is 8+');
  assertEqual(hazard.damageDice, '2d8', 'Moderate hazard damage dice is 2d8');

  // 3. Dice Roll Simulation Function
  assert(typeof sandbox.rollHazardCheck === 'function', 'rollHazardCheck function is exported');
  const rollRes = sandbox.rollHazardCheck(hazard, 2); // +2 mod
  assert(typeof rollRes.d20 === 'number' && rollRes.d20 >= 1 && rollRes.d20 <= 20, 'd20 roll between 1 and 20');
  assert(typeof rollRes.passed === 'boolean', 'Roll check evaluates passed boolean against DC');
}

function testCrossScalePortalLogistics() {
  console.log('\n--> SUITE 16: Trans-Scale Cartographic Logistics & Portal Flow (SYS-START-12)...');
  const slottingCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/supply_chain_simulator.js'), 'utf8');

  const rootMap = {
    id: 'map_root',
    name: 'Regional Surface',
    scaleTier: 'region',
    parentMapId: null,
    parentNodeId: null,
    nodes: {
      '1': { id: '1', name: 'Geothermal Station', adj: ['2'], provides: ['Power: Geothermal-Steam'], requires: [] },
      '2': { id: '2', name: 'Mine Portal Hub', adj: ['1'], childMapId: 'map_district', exportDown: true, importUp: true, provides: [], requires: [] }
    },
    links: [
      { from: '1', to: '2', type: 'twoway', layer: 'transit' }
    ],
    edgeData: {}
  };

  const districtMap = {
    id: 'map_district',
    name: 'Underground District',
    scaleTier: 'settlement',
    parentMapId: 'map_root',
    parentNodeId: '2',
    nodes: {
      'A': { id: 'A', name: 'Smelting Foundry', adj: ['B'], provides: [], requires: ['Power: Geothermal-Steam'] },
      'B': { id: 'B', name: 'Mithril Deep Quarry', adj: ['A'], provides: ['Ore: Mithril-Vein'], requires: [] }
    },
    links: [
      { from: 'A', to: 'B', type: 'twoway', layer: 'transit' }
    ],
    edgeData: {}
  };

  const mapsRegistry = {
    'map_root': rootMap,
    'map_district': districtMap
  };

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, addEventListener: () => {} }),
      body: { appendChild: () => {} }
    },
    maps: mapsRegistry,
    activeMapId: 'map_district',
    Workstation: {
      activeTopology: districtMap
    },
    MODULES_MANIFEST: [],
    nodeSlottedModules: {},
    edgeSlottedModules: {},
    tier0SubstratumEnabled: false,
    getNode: (id) => (sandbox.Workstation.activeTopology.nodes && sandbox.Workstation.activeTopology.nodes[String(id)]) || null,
    getNodeAdjacents: (id) => (sandbox.Workstation.activeTopology.nodes && sandbox.Workstation.activeTopology.nodes[String(id)] && sandbox.Workstation.activeTopology.nodes[String(id)].adj) || [],
    isEdgeBlocked: () => false,
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(slottingCode, sandbox);

  // 1. Down-Flow Test: Submap Node A requires "Power: Geothermal-Steam" provided by parent Node 1
  let subCheck = sandbox.checkNodeAdHocSupplyLine('A');
  assertEqual(subCheck.ok, true, 'Submap Node A receives Power: Geothermal-Steam from parent map via portal Node 2');
  assertEqual(subCheck.missing.length, 0, 'No missing supplies when exportDown is enabled');

  // Disable exportDown on parent portal node
  rootMap.nodes['2'].exportDown = false;
  subCheck = sandbox.checkNodeAdHocSupplyLine('A');
  assertEqual(subCheck.ok, false, 'Submap Node A supply line fails when parent portal exportDown is disabled');
  assert(subCheck.missing.includes('Power: Geothermal-Steam'), 'Missing includes Power: Geothermal-Steam');

  // Re-enable exportDown
  rootMap.nodes['2'].exportDown = true;

  // 2. Up-Flow Test: Parent Node 1 requires "Ore: Mithril-Vein" provided by submap Node B
  sandbox.activeMapId = 'map_root';
  sandbox.Workstation.activeTopology = rootMap;
  rootMap.nodes['1'].requires = ['Ore: Mithril-Vein'];

  let parentCheck = sandbox.checkNodeAdHocSupplyLine('1');
  assertEqual(parentCheck.ok, true, 'Parent Node 1 receives Ore: Mithril-Vein from submap via portal Node 2');
  assertEqual(parentCheck.missing.length, 0, 'No missing supplies when importUp is enabled');

  // Disable importUp on parent portal node
  rootMap.nodes['2'].importUp = false;
  parentCheck = sandbox.checkNodeAdHocSupplyLine('1');
  assertEqual(parentCheck.ok, false, 'Parent Node 1 supply line fails when portal importUp is disabled');
  assert(parentCheck.missing.includes('Ore: Mithril-Vein'), 'Missing includes Ore: Mithril-Vein');

  // 3. Cycle and recursion safety guard
  rootMap.nodes['2'].importUp = true;
  districtMap.nodes['B'].childMapId = 'map_root'; // Intentional cyclic loop
  let cycleCheck = sandbox.checkNodeAdHocSupplyLine('1');
  assert(typeof cycleCheck.ok === 'boolean', 'Cyclic portal recursion terminates cleanly without stack overflow');
}

function testQuantitativeResourceAccountingAndCorridorBandwidth() {
  console.log('\n--> SUITE 17: Quantitative Resource Accounting & Corridor Capacity (SYS-START-13)...');
  const slottingCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/supply_chain_simulator.js'), 'utf8');

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, addEventListener: () => {} }),
      body: { appendChild: () => {} }
    },
    MODULES_MANIFEST: [],
    nodeSlottedModules: {},
    edgeSlottedModules: {},
    tier0SubstratumEnabled: false,
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(slottingCode, sandbox);

  // 1. Tag Grammar Parser
  assert(typeof sandbox.parseResourceTag === 'function', 'parseResourceTag is exported');

  const parsedQty = sandbox.parseResourceTag('Power: Geothermal-Steam [24 kW]');
  assertEqual(parsedQty.category, 'Power', 'Parsed category is Power');
  assertEqual(parsedQty.name, 'Geothermal-Steam', 'Parsed name is Geothermal-Steam');
  assertEqual(parsedQty.quantity, 24, 'Parsed quantity is 24');
  assertEqual(parsedQty.unit, 'kW', 'Parsed unit is kW');

  const parsedCatalyst = sandbox.parseResourceTag('Tech: Bessemer-Process');
  assertEqual(parsedCatalyst.category, 'Tech', 'Parsed qualitative category is Tech');
  assertEqual(parsedCatalyst.name, 'Bessemer-Process', 'Parsed qualitative name is Bessemer-Process');
  assertEqual(parsedCatalyst.quantity, null, 'Qualitative catalyst quantity is null');
  assertEqual(parsedCatalyst.unit, null, 'Qualitative catalyst unit is null');

  // 2. Quantitative Balance Calculation
  assert(typeof sandbox.auditQuantitativeResourceBalances === 'function', 'auditQuantitativeResourceBalances is exported');

  const nodes = [
    { id: '1', name: 'Power Plant', provides: ['Power: Geothermal-Steam [24 kW]'], requires: [] },
    { id: '2', name: 'Factory A', provides: [], requires: ['Power: Geothermal-Steam [10 kW]'] },
    { id: '3', name: 'Arc Smelter B', provides: [], requires: ['Power: Geothermal-Steam [20 kW]'] }
  ];

  const balances = sandbox.auditQuantitativeResourceBalances(nodes);
  const powerBalance = balances['Power:Geothermal-Steam:kW'];
  assert(!!powerBalance, 'Power:Geothermal-Steam:kW balance record computed');
  assertEqual(powerBalance.totalYield, 24, 'Total power yield is 24 kW');
  assertEqual(powerBalance.totalDemand, 30, 'Total power demand is 30 kW (10 + 20)');
  assertEqual(powerBalance.balance, -6, 'Net power balance is -6 kW deficit');
  assertEqual(powerBalance.isDeficit, true, 'isDeficit is flagged true for negative balance');

  // 3. Corridor Capacity & Bottleneck Auditing
  assert(typeof sandbox.checkCorridorBandwidth === 'function', 'checkCorridorBandwidth is exported');

  const edgeRecord = { capacity: 15 };
  const overloaded = sandbox.checkCorridorBandwidth(edgeRecord, 20);
  assertEqual(overloaded.isOverloaded, true, 'Corridor carrying 20 units over 15 capacity is flagged overloaded');
  assertEqual(overloaded.excess, 5, 'Overloaded excess is 5 units');

  const normalFlow = sandbox.checkCorridorBandwidth(edgeRecord, 12);
  assertEqual(normalFlow.isOverloaded, false, 'Corridor carrying 12 units under 15 capacity is not overloaded');
}

function testNativeMdiOdvMatrixAndFogControls() {
  console.log('\n--> SUITE 18: Native MDI 64-Cell ODV Matrix Window & In-App Fog Controls (SYS-START-14)...');
  const slottingCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/supply_chain_simulator.js'), 'utf8');
  const socCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/sociology_data.js'), 'utf8');

  let historyItem = '';
  let statusMessage = '';
  const node1 = { id: '1', name: 'Bastion', visible: true, odv: [4, 1, 3] };
  const topo = {
    nodes: { '1': node1 },
    links: [],
    edgeData: {}
  };

  const sandbox = {
    window: {},
    addEventListener: () => {},
    document: {
      getElementById: (id) => {
        if (id === 'odv-mdi-grid') return { innerHTML: '', appendChild: () => {} };
        if (id === 'odv-mdi-dossier') return { innerHTML: '', appendChild: () => {} };
        if (id === 'odv-mdi-stats') return { textContent: '' };
        if (id === 'odv-mdi-search') return { value: '' };
        if (id === 'odv-mdi-occupied-only') return { checked: false };
        return null;
      },
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, addEventListener: () => {} })
    },
    Workstation: {
      activeTopology: topo
    },
    pushHistoryState: (desc) => { historyItem = desc; },
    setStatusBarMessage: (msg) => { statusMessage = msg; },
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    saveActiveCampaign: () => {},
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(slottingCode, sandbox);
  vm.runInContext(socCode, sandbox);

  // 1. Fog of War in-app controls
  assert(typeof sandbox.revealNode === 'function', 'revealNode is exported on window');
  assert(typeof sandbox.shroudNode === 'function', 'shroudNode is exported on window');

  sandbox.shroudNode('1');
  assertEqual(node1.visible, false, 'shroudNode shrouds node 1 in fog of war');
  assert(historyItem.includes('Shroud Node'), 'shroudNode registers history snapshot');

  sandbox.revealNode('1');
  assertEqual(node1.visible, true, 'revealNode reveals node 1 to players');
  assert(historyItem.includes('Reveal Node'), 'revealNode registers history snapshot');

  // 2. MDI 64-Cell ODV Matrix Reflection
  assert(typeof sandbox.renderMdiOdvMatrix === 'function', 'renderMdiOdvMatrix function is exported');
  assert(typeof sandbox.buildCampaignOdvIndex === 'function', 'buildCampaignOdvIndex function is exported');

  const odvIndex = sandbox.buildCampaignOdvIndex(topo);
  assert(!!odvIndex['[4, 1, 3]'], 'ODV Index maps Bastion to [4, 1, 3]');
  assertEqual(odvIndex['[4, 1, 3]'].nodes.length, 1, 'ODV Index contains 1 occupant at [4, 1, 3]');
}

function testExtensibleWikiMentionsAndDemographics() {
  console.log('\n--> SUITE 19: Extensible Wiki Mentions, Nested Backlinks, Demographics & Rapport (ADR-0015 v2)...');

  const rendererCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/cad_canvas_renderer.js'), 'utf8');
  const entityCoreCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js'), 'utf8');
  const wikiCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/wiki_engine.js'), 'utf8');
  const exportCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_exporter.js'), 'utf8');

  let pushHistorySpy = [];
  let openedEntityId = null;
  let openedEntityType = null;

  const mockNpc = { id: 'npc_01', name: 'Sergeant Bob', nodeId: 2 };
  const mockNode1 = {
    id: 1,
    name: 'Farmland',
    customNotes: 'Report to [[NPC:Sergeant Bob]] and check in with @"Sergeant Bob"',
    faction: 'player'
  };
  const mockNode2 = {
    id: 2,
    name: 'Barracks',
    customNotes: 'Main garrison',
    faction: 'concord'
  };
  const mockPortalNode = {
    id: 5,
    name: 'Outpost Portal',
    customNotes: 'Gateway to Outpost'
  };

  const mockMaps = {
    'map_root': {
      id: 'map_root',
      name: 'Root Map',
      nodes: [mockNode1, mockPortalNode],
      links: [],
      edgeData: {}
    },
    'map_outpost': {
      id: 'map_outpost',
      name: 'Outpost Interior',
      parentMapId: 'map_root',
      parentNodeId: 5,
      nodes: [mockNode2],
      links: [],
      edgeData: {}
    }
  };

  const topo = {
    nodes: { '1': mockNode1, '5': mockPortalNode },
    links: [],
    edgeData: {},
    npcs: [mockNpc],
    items: [{ id: 'item_01', name: 'Sunblade', possessionMode: 'free', nodeId: 2 }],
    quests: [],
    trackers: []
  };

  const sandbox = {
    window: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      getElementById: (id) => ({
        style: {},
        innerHTML: '',
        textContent: '',
        value: '',
        checked: true,
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        addEventListener: () => {}
      }),
      createElement: () => ({
        style: {},
        innerHTML: '',
        textContent: '',
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        addEventListener: () => {}
      })
    },
    addEventListener: () => {},
    Workstation: {
      activeTopology: topo,
      registeredMods: {}
    },
    CreatorStudio: {
      registerMod: () => {}
    },
    maps: mockMaps,
    activeMapId: 'map_root',
    nodes: [mockNode1, mockPortalNode],
    getNode: (id) => {
      const nid = parseInt(id);
      if (nid === 1) return mockNode1;
      if (nid === 2) return mockNode2;
      if (nid === 5) return mockPortalNode;
      return null;
    },
    getNodeIncomingSources: () => [],
    getNodeAdjacents: () => [],
    nodeSlottedModules: {},
    edgeSlottedModules: {},
    links: [],
    MODULES_MANIFEST: [],
    pushHistoryState: (desc) => {
      pushHistorySpy.push({ desc, time: Date.now() });
    },
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    setStatusBarMessage: () => {},
    openEditEntityModal: (id) => { openedEntityId = id; openedEntityType = 'entity'; },
    openEntityManager: (type, id) => { openedEntityType = type; openedEntityId = id; },
    centerCanvasOnNode: () => {},
    currentTool: 'select',
    selectTool: () => {},
    setTimeout: (fn) => fn(),
    escapeHtml: (s) => (s === null || s === undefined) ? '' : String(s),
    escapeAttr: (s) => (s === null || s === undefined) ? '' : String(s),
    console
  };
  sandbox.window = sandbox;
  sandbox.window.CreatorStudio = sandbox.CreatorStudio;

  vm.createContext(sandbox);
  vm.runInContext(rendererCode, sandbox);
  vm.runInContext(entityCoreCode, sandbox);
  vm.runInContext(wikiCode, sandbox);
  vm.runInContext(exportCode, sandbox);

  // 19.1: extractTokensFromText parses [[NPC:Sgt. Bob]] and [[Item:Sunblade]]
  assert(typeof sandbox.extractTokensFromText === 'function', 'extractTokensFromText is exported');
  const tokens19_1 = sandbox.extractTokensFromText('[[NPC:Sgt. Bob]] [[Item:Sunblade]]');
  assertEqual(tokens19_1.length, 2, 'extractTokensFromText parses 2 tokens');
  assertEqual(tokens19_1[0] ? tokens19_1[0].type : undefined, 'npc', 'First token type is npc');
  assertEqual(tokens19_1[0] ? tokens19_1[0].value : undefined, 'Sgt. Bob', 'First token value is Sgt. Bob');
  assertEqual(tokens19_1[1] ? tokens19_1[1].type : undefined, 'item', 'Second token type is item');
  assertEqual(tokens19_1[1] ? tokens19_1[1].value : undefined, 'Sunblade', 'Second token value is Sunblade');

  // 19.2: renderWikiDecoratedText renders wiki-pill-npc
  assert(typeof sandbox.renderWikiDecoratedText === 'function', 'renderWikiDecoratedText is exported');
  const renderedNpc = sandbox.renderWikiDecoratedText('Meet me at [[NPC:Sgt. Bob]] tomorrow');
  assert(renderedNpc.includes('wiki-pill-npc'), 'renderWikiDecoratedText contains wiki-pill-npc');

  // 19.3: [[Note: hello]] yields 0 tokens and stays literal
  const noteTokens = sandbox.extractTokensFromText('[[Note: hello]]');
  assertEqual(noteTokens.length, 0, 'Unregistered [[Note:...]] yields 0 tokens');
  const renderedNote = sandbox.renderWikiDecoratedText('[[Note: hello]]');
  assert(!renderedNote.includes('wiki-pill-note'), 'Unregistered [[Note:...]] does not render as pill');

  // 19.4: registerWikiTokenType adds type, parses, renders, and preserves registerMod
  assert(typeof sandbox.CreatorStudio?.registerWikiTokenType === 'function', 'CreatorStudio.registerWikiTokenType is exported');
  assert(typeof sandbox.CreatorStudio?.registerMod === 'function', 'CreatorStudio.registerMod is preserved on window.CreatorStudio');
  if (typeof sandbox.CreatorStudio?.registerWikiTokenType === 'function') {
    sandbox.CreatorStudio.registerWikiTokenType({
      type: 'spell',
      label: 'Spell',
      icon: '✨'
    });
  }
  const spellTokens = sandbox.extractTokensFromText('Casts [[Spell:Fireball]] in combat');
  assertEqual(spellTokens.length, 1, 'Custom registered [[Spell:...]] token parsed');
  assertEqual(spellTokens[0] ? spellTokens[0].type : undefined, 'spell', 'Custom token has type spell');
  const renderedSpell = sandbox.renderWikiDecoratedText('Casts [[Spell:Fireball]] in combat');
  assert(renderedSpell.includes('wiki-pill-spell'), 'Custom token renders as wiki-pill-spell');

  // 19.5: @"Sergeant Bob" multi-word mention token
  const atTokens = sandbox.extractTokensFromText('Check in with @"Sergeant Bob"');
  assertEqual(atTokens.length, 1, 'Multi-word @"Sergeant Bob" extracts 1 token');
  assertEqual(atTokens[0] ? atTokens[0].type : undefined, 'mention', 'Multi-word mention token has type mention');
  assertEqual(atTokens[0] ? atTokens[0].value : undefined, 'Sergeant Bob', 'Multi-word mention value is Sergeant Bob');

  // 19.6: getBacklinksForEntity resolves citations by id and display name
  assert(typeof sandbox.getBacklinksForEntity === 'function', 'getBacklinksForEntity is exported');
  if (typeof sandbox.buildWikiIndex === 'function') sandbox.buildWikiIndex();
  const npcBacklinks = sandbox.getBacklinksForEntity('npc', 'npc_01');
  assert(Array.isArray(npcBacklinks) && npcBacklinks.length >= 1, 'getBacklinksForEntity finds citations for npc_01');

  // 19.7: getNestedBacklinksForNode returns transitive citations via parentMapId/parentNodeId
  assert(typeof sandbox.getNestedBacklinksForNode === 'function', 'getNestedBacklinksForNode is exported');
  const nestedHits = (typeof sandbox.getNestedBacklinksForNode === 'function')
    ? sandbox.getNestedBacklinksForNode(5, 'map_root')
    : [];
  assert(Array.isArray(nestedHits) && nestedHits.length >= 1, 'getNestedBacklinksForNode returns citations');
  const nestedHit = nestedHits.find(h => h.isNested);
  assert(!!nestedHit, 'Nested citation flagged with isNested: true');
  assert(Array.isArray(nestedHit?.traversalPath) && nestedHit.traversalPath.length > 0, 'Nested citation includes traversalPath breadcrumbs');

  // 19.8: Cyclic map reference terminates cleanly
  const cyclicMaps = {
    'map_a': { id: 'map_a', name: 'Map A', nodes: [{ id: 1, childMapId: 'map_b' }] },
    'map_b': { id: 'map_b', name: 'Map B', nodes: [{ id: 2, childMapId: 'map_a' }] }
  };
  sandbox.maps = cyclicMaps;
  let cycleTerminated = false;
  if (typeof sandbox.getNestedBacklinksForNode === 'function') {
    try {
      sandbox.getNestedBacklinksForNode(1, 'map_a');
      cycleTerminated = true;
    } catch (e) {
      cycleTerminated = false;
    }
  }
  assert(cycleTerminated, 'Cyclic portal map references terminate without stack overflow');
  sandbox.maps = mockMaps; // restore

  // 19.9: buildWikiIndex called <= 1 time during getNestedBacklinksForNode
  let buildCount = 0;
  const origBuild = sandbox.buildWikiIndex;
  sandbox.buildWikiIndex = () => { buildCount++; if (origBuild) origBuild(); };
  if (typeof sandbox.getNestedBacklinksForNode === 'function') {
    sandbox.getNestedBacklinksForNode(5, 'map_root');
  }
  sandbox.buildWikiIndex = origBuild;
  assert(buildCount <= 1, `buildWikiIndex called at most 1 time during transitive crawl (was: ${buildCount})`);

  // 19.10: normalizeDemographics preserves primary and minorities and provides tags: []
  assert(typeof sandbox.normalizeDemographics === 'function', 'normalizeDemographics is exported');
  const normCensus = (typeof sandbox.normalizeDemographics === 'function')
    ? sandbox.normalizeDemographics({
        primary: { name: 'Human', percentage: 60 },
        minorities: [{ name: 'Gnome', percentage: 40 }]
      })
    : {};
  assertEqual(normCensus?.primary?.name, 'Human', 'Census primary preserved');
  assertEqual(normCensus?.minorities?.length, 1, 'Census minorities preserved');
  assert(Array.isArray(normCensus?.tags) && normCensus.tags.length === 0, 'Census tags initialized to empty array');

  // 19.11: normalizeDemographics on array deduplicates case-insensitively
  const normArray = (typeof sandbox.normalizeDemographics === 'function')
    ? sandbox.normalizeDemographics(['Goblin', 'goblin', 'Dwarf'])
    : { tags: [] };
  assertEqual(normArray?.tags?.length, 2, 'Array demographics deduplicated case-insensitively');
  assertEqual(normArray?.tags?.[0], 'Goblin', 'First tag preserved');
  assertEqual(normArray?.tags?.[1], 'Dwarf', 'Second tag preserved');

  // 19.12: getDemographicNames extracts all names
  assert(typeof sandbox.getDemographicNames === 'function', 'getDemographicNames is exported');
  const demoNames = (typeof sandbox.getDemographicNames === 'function')
    ? sandbox.getDemographicNames({
        primary: { name: 'Human', percentage: 60 },
        minorities: [{ name: 'Gnome', percentage: 40 }],
        tags: ['Orc']
      })
    : [];
  assertEqual(demoNames.length, 3, 'getDemographicNames extracts primary, minorities, and tags');
  assert(demoNames.includes('Human') && demoNames.includes('Gnome') && demoNames.includes('Orc'), 'getDemographicNames includes all 3 names');

  // 19.13: Faction suggestion pool includes node.faction and excludes neutral
  assert(typeof sandbox.getCampaignFactionSuggestions === 'function', 'getCampaignFactionSuggestions is exported');
  const facSuggestions = (typeof sandbox.getCampaignFactionSuggestions === 'function')
    ? sandbox.getCampaignFactionSuggestions()
    : [];
  assert(facSuggestions.includes('player'), 'Faction suggestions include player');
  assert(facSuggestions.includes('concord'), 'Faction suggestions include concord from submap');
  assert(!facSuggestions.includes('neutral'), 'Faction suggestions exclude neutral');

  // 19.14: normalizePartyRapport handles string and number clamping
  assert(typeof sandbox.normalizePartyRapport === 'function', 'normalizePartyRapport is exported');
  const strRapport = (typeof sandbox.normalizePartyRapport === 'function')
    ? sandbox.normalizePartyRapport('Blamed for fire')
    : {};
  assertEqual(strRapport.stance, 0, 'String party rapport defaults stance to 0');
  assertEqual(strRapport.notes, 'Blamed for fire', 'String party rapport sets notes');
  const clampedRapport = (typeof sandbox.normalizePartyRapport === 'function')
    ? sandbox.normalizePartyRapport({ stance: 9, notes: 'Allied' })
    : {};
  assertEqual(clampedRapport.stance, 2, 'Party rapport stance clamps to max 2');
  const clampedNeg = (typeof sandbox.normalizePartyRapport === 'function')
    ? sandbox.normalizePartyRapport({ stance: -5 })
    : {};
  assertEqual(clampedNeg.stance, -2, 'Party rapport stance clamps to min -2');

  // 19.15: PARTY_STANCE_LABELS exported with correct values
  assert(!!sandbox.PARTY_STANCE_LABELS, 'PARTY_STANCE_LABELS is exported');
  assertEqual(sandbox.PARTY_STANCE_LABELS?.['-1'], 'Unfriendly', 'Stance -1 label is Unfriendly');
  assertEqual(sandbox.PARTY_STANCE_LABELS?.['-2'], 'Hostile', 'Stance -2 label is Hostile');
  assertEqual(sandbox.PARTY_STANCE_LABELS?.['0'], 'Neutral', 'Stance 0 label is Neutral');
  assertEqual(sandbox.PARTY_STANCE_LABELS?.['1'], 'Friendly', 'Stance 1 label is Friendly');
  assertEqual(sandbox.PARTY_STANCE_LABELS?.['2'], 'Allied', 'Stance 2 label is Allied');

  // 19.16: addDemographicTag pushes history BEFORE mutation
  assert(typeof sandbox.addDemographicTag === 'function', 'addDemographicTag is exported');
  const testNode = { id: 99, demographics: { tags: [] } };
  let tagsLengthAtHistoryCall = -1;
  sandbox.pushHistoryState = (desc) => {
    tagsLengthAtHistoryCall = testNode?.demographics?.tags?.length;
  };
  if (typeof sandbox.addDemographicTag === 'function') {
    sandbox.addDemographicTag(testNode, 'Kobold');
  }
  assertEqual(tagsLengthAtHistoryCall, 0, 'pushHistoryState was called before tag was added');
  assertEqual(testNode?.demographics?.tags?.[0], 'Kobold', 'Tag was added to testNode');

  // 19.17: Node export mapping includes all 7 fields
  assert(typeof sandbox.generateCampaignJSON === 'function', 'generateCampaignJSON is exported');
  sandbox.nodes = [{
    id: 10,
    name: 'Export Node',
    demographics: { tags: ['Elf'] },
    factionPresence: ['Guild'],
    partyRapport: { stance: 1, notes: 'Friendly' },
    provides: ['Power: Steam'],
    requires: ['Ore: Iron'],
    exportDown: true,
    importUp: false
  }];
  const rawExported = sandbox.generateCampaignJSON();
  const exported = JSON.parse(rawExported);
  const expNode = exported.nodes.find(n => n.id === 10);
  assert(!!expNode, 'Node found in exported campaign JSON');
  assert(!!expNode.demographics, 'demographics included in exported node');
  assert(Array.isArray(expNode.factionPresence), 'factionPresence included in exported node');
  assert(!!expNode.partyRapport, 'partyRapport included in exported node');
  assert(Array.isArray(expNode.provides), 'provides included in exported node');
  assert(Array.isArray(expNode.requires), 'requires included in exported node');
  assertEqual(expNode.exportDown, true, 'exportDown included in exported node');
  assertEqual(expNode.importUp, false, 'importUp included in exported node');

  // 19.18: importCampaignData preserves the 7 fields
  assert(typeof sandbox.importCampaignData === 'function', 'importCampaignData is exported');
  sandbox.importCampaignData({
    preset: {
      nodes: [expNode]
    }
  }, 'test-import');
  const importedNode = sandbox.nodes.find(n => n.id === 10);
  assert(!!importedNode, 'Imported node exists');
  assertEqual(importedNode.exportDown, true, 'Imported node preserves exportDown');
  assertEqual(importedNode.importUp, false, 'Imported node preserves importUp');
  assert(Array.isArray(importedNode.provides) && importedNode.provides.includes('Power: Steam'), 'Imported node preserves provides');
  assert(Array.isArray(importedNode.requires) && importedNode.requires.includes('Ore: Iron'), 'Imported node preserves requires');
  assert(Array.isArray(importedNode.factionPresence) && importedNode.factionPresence.includes('Guild'), 'Imported node preserves factionPresence');
  assert(!!importedNode.demographics && importedNode.demographics.tags.includes('Elf'), 'Imported node preserves demographics');
  assert(!!importedNode.partyRapport && importedNode.partyRapport.stance === 1, 'Imported node preserves partyRapport');

  // 19.19: navigateToWikiEntity('npc', id) opens entity modal/manager
  assert(typeof sandbox.navigateToWikiEntity === 'function', 'navigateToWikiEntity is exported');
  openedEntityId = null;
  sandbox.navigateToWikiEntity('npc', 'npc_01');
  assertEqual(openedEntityId, 'npc_01', 'navigateToWikiEntity opens entity modal for npc_01');

  // 19.20: SYS-ARCH-01 census-aware demographics in the campaign JSON export and the Obsidian node dossier
  sandbox.nodes = [
    { id: 11, name: 'Census Harbor', demographics: { primary: { name: 'Seafolk', percentage: 60 }, minorities: [{ name: 'Dwarves', percentage: 25 }], tags: ['Dockworkers'] } },
    { id: 12, name: 'Flat Hamlet', demographics: ['Goblin', 'goblin', 'Kobold'] }
  ];
  const censusExport = JSON.parse(sandbox.generateCampaignJSON());
  const censusExpNode = censusExport.nodes.find(n => n.id === 11);
  assertEqual(censusExpNode.demographics.primary, { name: 'Seafolk', percentage: 60 }, 'generateCampaignJSON keeps census primary through normalizeDemographics');
  assertEqual(censusExpNode.demographics.minorities, [{ name: 'Dwarves', percentage: 25 }], 'generateCampaignJSON keeps census minorities');
  assertEqual(censusExport.nodes.find(n => n.id === 12).demographics, { minorities: [], tags: ['Goblin', 'Kobold'] }, 'generateCampaignJSON normalizes a flat demographics array the way importCampaignData does');

  const dossierTopo = {
    name: 'Census Isle',
    nodes: {
      '1': { id: 1, name: 'Census Harbor', tier: 2, culture: 'Market', demographics: { primary: { name: 'Seafolk', percentage: 60 }, minorities: [{ name: 'Dwarves', percentage: 25 }, { name: 'Gnomes', percentage: 15 }], tags: ['Dockworkers'] } },
      '2': { id: 2, name: 'Flat Hamlet', tier: 1, culture: 'Clan', demographics: ['Goblin', 'goblin', 'Kobold'] },
      '3': { id: 3, name: 'Empty Fort', tier: 1, culture: 'Hierarchy' },
      '4': { id: 4, name: 'Legacy Quay', tier: 1, culture: 'Market', demographics: [{ race: 'Elves', pct: 30 }, 'Merchant'] }
    },
    edges: [], factions: [], npcs: [], quests: [], items: []
  };
  const dossierNoteFrom = (vault, name) => (vault.find(f => f.path.startsWith('Nodes/') && f.path.includes(name)) || { content: '' }).content;
  const dossierVault = sandbox.buildObsidianVaultFiles(dossierTopo);
  const censusDossier = dossierNoteFrom(dossierVault, 'Census Harbor');
  assert(censusDossier.includes('- **Seafolk** (60%)') && censusDossier.includes('- Dwarves (25%)') && censusDossier.includes('- Gnomes (15%)') && censusDossier.includes('- Dockworkers'), 'Obsidian node dossier renders census primary, minorities and tags');
  assert(!censusDossier.includes('Cosmopolitan'), 'Obsidian node dossier omits the Cosmopolitan fallback for a census node');
  const flatDossier = dossierNoteFrom(dossierVault, 'Flat Hamlet');
  assert(flatDossier.includes('- Goblin') && flatDossier.includes('- Kobold') && !flatDossier.includes('Cosmopolitan'), 'Obsidian node dossier still renders a flat demographics array');
  assertEqual((flatDossier.match(/- goblin/gi) || []).length, 1, 'Obsidian node dossier lists a flat-array tag once (case-insensitive dedupe)');
  const legacyDossier = dossierNoteFrom(dossierVault, 'Legacy Quay');
  assert(legacyDossier.includes('- Elves (30%)') && legacyDossier.includes('- Merchant'), 'Obsidian node dossier keeps legacy flat-array {race, pct} groups and strings');
  assert(dossierNoteFrom(dossierVault, 'Empty Fort').includes('*Cosmopolitan / mixed frontier demographic.*'), 'Obsidian node dossier keeps the Cosmopolitan fallback only when demographics are empty');

  // The typeof guard: a sandbox without entity_core.js (no normalizeDemographics) still renders census demographics
  const bareExporter = { window: {}, document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} }, TextEncoder, TextDecoder, Uint8Array, DataView, ArrayBuffer, Blob, console };
  bareExporter.window = bareExporter;
  vm.createContext(bareExporter);
  vm.runInContext(exportCode, bareExporter);
  assert(typeof bareExporter.normalizeDemographics === 'undefined', 'bare exporter sandbox has no normalizeDemographics');
  const bareCensus = dossierNoteFrom(bareExporter.buildObsidianVaultFiles(dossierTopo), 'Census Harbor');
  assert(bareCensus.includes('- **Seafolk** (60%)') && bareCensus.includes('- Dwarves (25%)') && bareCensus.includes('- Dockworkers') && !bareCensus.includes('Cosmopolitan'), 'Obsidian node dossier renders census demographics even without normalizeDemographics');
}

// ============================================================================
// SUITE 20: WORKSTATION 2.5 STABILIZATION & ENHANCEMENT QUALITY GATE
// ============================================================================
function testWorkstationStabilizationAndEnhancementGate() {
  console.log('\n--> SUITE 20: Workstation 2.5 Stabilization & Enhancement Quality Gate...');

  // 20.1: Dynamic SVG Layer Stacking & Z-Index Ordering
  const cadRendererPath = path.join(ROOT_DIR, 'src/workstation/scripts/cad_canvas_renderer.js');
  const cadRendererCode = fs.readFileSync(cadRendererPath, 'utf8');
  assert(cadRendererCode.includes('renderShapeCenteredText'), 'cad_canvas_renderer includes renderShapeCenteredText');
  assert(cadRendererCode.includes('getLayerContainer'), 'cad_canvas_renderer includes getLayerContainer');
  assert(cadRendererCode.includes('canvas-layer-group'), 'cad_canvas_renderer creates dynamic canvas-layer-group elements');
  assert(cadRendererCode.includes('lengthAdjust'), 'cad_canvas_renderer handles SVG text lengthAdjust for text fit');

  // 20.2: Compound Edge Visibility
  assert(cadRendererCode.includes('u.layerId') && cadRendererCode.includes('v.layerId'), 'Transit edge rendering checks endpoint node layers');
  assert(cadRendererCode.includes('edgeLayerId') && cadRendererCode.includes('isEdgeLayerVisible'), 'Transit edge rendering checks edge record layerId');

  // 20.3: CAD Shape Interior Typography Font Scaling Math
  function computeShapeFontSize(shape, availW, availH) {
    const lines = String(shape.text).split('\n');
    const nLines = lines.length;
    let maxLen = 1;
    lines.forEach(l => { if (l.length > maxLen) maxLen = l.length; });
    const baseSize = shape.fontSize || 13;
    const sw = Math.floor(availW / (maxLen * 0.62));
    const sh = Math.floor(availH / (nLines * 1.3));
    return Math.max(7, Math.min(baseSize, sw, sh));
  }

  const rectSmall = { type: 'rect', width: 80, height: 40, text: 'Very Long Text Inside Rectangle', fontSize: 14 };
  const sizeSmall = computeShapeFontSize(rectSmall, 68, 32);
  assert(sizeSmall < 14, `Font shrunk from base size 14 down to ${sizeSmall} to fit small rect`);
  assert(sizeSmall >= 7, 'Font size is clamped to minimum 7px');

  const circleSmall = { type: 'circle', radius: 30, text: 'Long Label In Circle', fontSize: 13 };
  const availCircleW = Math.max(10, Math.floor(1.414 * 30 - 12));
  const availCircleH = Math.max(8, Math.floor(1.414 * 30 - 8));
  const sizeCircle = computeShapeFontSize(circleSmall, availCircleW, availCircleH);
  assert(sizeCircle < 13, `Font shrunk down to ${sizeCircle} to fit inside inscribed circle rectangle`);

  // 20.4: Scale-Fluid String Node ID Preservation
  const entityCorePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js');
  const entityCoreCode = fs.readFileSync(entityCorePath, 'utf8');
  assert(entityCoreCode.includes('(isNaN(k) || String(k).includes(\'-\')) ? k : parseInt(k)'), 'entity_core preserves alphanumeric node IDs without parseInt NaN corruption');

  // 20.5: Entity Manager UI Quote Safety & Map Scopes
  const emUiPath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_manager_ui.js');
  const emUiCode = fs.readFileSync(emUiPath, 'utf8');
  assert(emUiCode.includes('function escapeJsArg'), 'entity_manager_ui exports escapeJsArg');
  assert(emUiCode.includes('function getNodesForMapScope'), 'entity_manager_ui exports getNodesForMapScope');
  assert(emUiCode.includes('function jumpToNodeMap'), 'entity_manager_ui exports jumpToNodeMap');
  assert(emUiCode.includes('function switchNodeDetailSubtab'), 'entity_manager_ui exports switchNodeDetailSubtab');
  assert(emUiCode.includes('renderNodeProperties'), 'entity_manager_ui integrates renderNodeProperties in detail inspector');
  assert(!emUiCode.includes('promptEntityDelete(\'node\', ${node.id})'), 'entity_manager_ui eliminates all unquoted promptEntityDelete node callbacks');

  // 20.6: Retro Win95 Start Menu & MDI Drag Pointer Shielding
  const templatePath = path.join(ROOT_DIR, 'src/workstation/template.html');
  const templateCode = fs.readFileSync(templatePath, 'utf8');
  assert(templateCode.includes('Authoring Tools') && templateCode.includes('Administrative Surfaces'), 'template.html organizes Win95 Start Menu into cascading submenus');
  assert(templateCode.includes('Campaign Packages &amp; Presets...'), 'template.html replaces legacy "5 Sourcebook Packages" with "Campaign Packages & Presets..."');

  const cssPath = path.join(ROOT_DIR, 'src/workstation/styles/win95_workstation.css');
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  assert(cssCode.includes('body.mdi-dragging iframe'), 'win95_workstation.css contains body.mdi-dragging iframe pointer shielding');

  const mdiMgrPath = path.join(ROOT_DIR, 'src/workstation/scripts/mdi_window_manager.js');
  const mdiMgrCode = fs.readFileSync(mdiMgrPath, 'utf8');
  assert(mdiMgrCode.includes('document.body.classList.add(\'mdi-dragging\')'), 'mdi_window_manager toggles mdi-dragging on mouse down');
  assert(mdiMgrCode.includes('document.body.classList.remove(\'mdi-dragging\')'), 'mdi_window_manager cleans up mdi-dragging on mouse up');
  assert(mdiMgrCode.includes('function openEmbeddedSurfaceWindow'), 'mdi_window_manager exports openEmbeddedSurfaceWindow for zero-CORS surface launching');

  // 20.7: Sourcebooks & Modular Packages Clean 3-Tier Segmentation
  const statePath = path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js');
  const stateCode = fs.readFileSync(statePath, 'utf8');
  assert(stateCode.includes('INSTALLED CAMPAIGN PACKAGES &amp; PRESETS'), 'renderSourcebooksList includes Installed Campaign Packages section');
  assert(stateCode.includes('WORLDBUILDING SOURCEBOOK MODULES'), 'renderSourcebooksList includes Worldbuilding Sourcebooks section');
  assert(stateCode.includes('WORKSTATION EXTENSION MODS'), 'renderSourcebooksList includes Workstation Extension Mods section');
  assert(stateCode.includes('No third-party workstation mods currently loaded'), 'renderSourcebooksList provides unmodded clean empty state');
}

// ============================================================================
// SUITE 21: PATROL FACTION SETTING-AGNOSTIC & DATA INTEGRITY GATE
// ============================================================================
function testPatrolFactionAndSettingAgnosticGate() {
  console.log('\n--> SUITE 21: Patrol Faction Setting-Agnostic & Data Integrity Gate...');

  const inspectorPath = path.join(ROOT_DIR, 'src/workstation/scripts/property_grid_inspector.js');
  const inspectorCode = fs.readFileSync(inspectorPath, 'utf8');

  // 21.1: Setting-Agnostic Purity - No Emerald Isle setting lore hardcoded in property_grid_inspector
  const forbiddenLore = [
    'Imperial Frontier Guard',
    'Civic Guilds',
    'Ancient Dynasts',
    'Corsair Anchorage'
  ];
  forbiddenLore.forEach(faction => {
    assert(!inspectorCode.includes(faction), `property_grid_inspector.js contains no hardcoded lore '${faction}'`);
  });

  // 21.2: Dynamic Combobox & getCampaignFactionSuggestions Integration
  assert(inspectorCode.includes('appendComboboxPropRow'), 'property_grid_inspector.js defines appendComboboxPropRow');
  assert(inspectorCode.includes('dl-patrol-faction'), 'property_grid_inspector.js generates dynamic datalist for edge patrol factions');
  const usesDynamicFactions = /Patrol Faction[\s\S]{1,400}getCampaignFactionSuggestions/.test(inspectorCode) ||
    /getCampaignFactionSuggestions[\s\S]{1,400}Patrol Faction/.test(inspectorCode);
  assert(usesDynamicFactions, 'Edge Patrol Faction inspector queries getCampaignFactionSuggestions() dynamically');

  // 21.3: Lossless Custom Patrol Faction Preservation
  assert(!inspectorCode.includes("appendSelectPropRow(tbody, 'Patrol Faction'"), 'Edge inspector does not use static appendSelectPropRow for Patrol Faction');
  assert(inspectorCode.includes("edgeRecord.patrolFaction = canonical") || inspectorCode.includes("edgeRecord.patrolFaction = val"), 'Edge inspector commits user value directly to edgeRecord.patrolFaction');

  // 21.4: True Win95 Combobox UI Components
  assert(inspectorCode.includes('vb-combobox-btn') && inspectorCode.includes('▼'), 'appendComboboxPropRow renders Win95 dropdown button ▼');
  assert(inspectorCode.includes('vb-combobox-menu'), 'appendComboboxPropRow includes floating popup menu');

  // 21.5: Node Controlling Faction Combobox Integration
  const nodeFactionUsesCombobox = /Controlling Faction[\s\S]{1,400}appendComboboxPropRow/.test(inspectorCode) ||
    /appendComboboxPropRow[\s\S]{1,400}Controlling Faction/.test(inspectorCode);
  assert(nodeFactionUsesCombobox, 'Node Controlling Faction uses appendComboboxPropRow');

  // 21.6: Dynamic Faction Registration & Patrol Faction Indexing
  const entityCorePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js');
  const entityCoreCode = fs.readFileSync(entityCorePath, 'utf8');
  assert(entityCoreCode.includes('e.patrolFaction'), 'getCampaignFactionSuggestions indexes edge patrolFaction');
  assert(entityCoreCode.includes('registerCampaignFaction'), 'entity_core.js exports registerCampaignFaction');
}

// ============================================================================
// SUITE 22: CAMPAIGN ISOLATION, TEARDOWN ENGINE & STERILE SLATE (ADR-0018)
// ============================================================================
async function testCampaignIsolationAndSterileSlateGate() {
  console.log('\n--> SUITE 22: Campaign Isolation, Teardown Engine & Sterile Slate Gate (ADR-0018)...');

  const zipPath = path.join(ROOT_DIR, 'src/workstation/scripts/zip_engine.js');
  const mapStorePath = path.join(ROOT_DIR, 'src/workstation/scripts/map_store.js');
  const stateAdapterPath = path.join(ROOT_DIR, 'src/workstation/scripts/state_adapter.js');
  const statePath = path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js');
  const mdiPath = path.join(ROOT_DIR, 'src/workstation/scripts/mdi_window_manager.js');

  const zipCode = fs.readFileSync(zipPath, 'utf8');
  const mapStoreCode = fs.readFileSync(mapStorePath, 'utf8');
  const stateAdapterCode = fs.readFileSync(stateAdapterPath, 'utf8');
  const stateCode = fs.readFileSync(statePath, 'utf8');
  const mdiCode = fs.readFileSync(mdiPath, 'utf8');

  let statusMsg = '';
  const mockStatusEl = { textContent: '' };
  const storageMap = {};
  const mockElements = {
    'sb-status': mockStatusEl,
    'canvas-bg-image': {
      attributes: {},
      style: { display: '' },
      setAttribute: function(k, v) { this.attributes[k] = v; },
      setAttributeNS: function(ns, k, v) { this.attributes[`${ns}:${k}`] = v; },
      removeAttribute: function(k) { delete this.attributes[k]; },
      removeAttributeNS: function(ns, k) { delete this.attributes[`${ns}:${k}`]; delete this.attributes[k]; },
      getAttribute: function(k) { return this.attributes[k] || null; }
    }
  };

  const sandbox = {
    window: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      getElementById: (id) => mockElements[id] || null,
      querySelectorAll: (sel) => {
        if (sel === '.canvas-layer-group') {
          return [{ remove: () => {} }];
        }
        return [];
      },
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (k) => storageMap[k] !== undefined ? storageMap[k] : null,
      setItem: (k, v) => { storageMap[k] = String(v); },
      removeItem: (k) => { delete storageMap[k]; }
    },
    ALL_MODULES: [
      { id: 'MOD-BUILTIN-01', name: 'Builtin Forge', pipeline_tier: 2 },
      { id: 'MOD-BUILTIN-02', name: 'Builtin Council', pipeline_tier: 1 }
    ],
    MODULES_MANIFEST: [],
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    setStatusBarMessage: (msg) => { statusMsg = msg; },
    renderCanvas: () => {},
    renderLayersManagerUI: () => {},
    updatePropertiesGrid: () => {},
    renderLayoutTabs: () => {},
    updateStatusBar: () => {},
    updateBreadcrumbsHUD: () => {},
    saveActiveCampaign: () => {},
    console
  };
  sandbox.window = sandbox;
  sandbox.MODULES_MANIFEST = sandbox.ALL_MODULES;

  vm.createContext(sandbox);
  vm.runInContext(zipCode, sandbox);
  vm.runInContext(mapStoreCode, sandbox);
  vm.runInContext(stateAdapterCode, sandbox);
  vm.runInContext(stateCode, sandbox);
  vm.runInContext(mdiCode, sandbox);

  // 22.1: Sterile Container Invariant: Workstation.activeTopology is non-null on initialization
  assert(sandbox.Workstation && sandbox.Workstation.activeTopology !== null, 'Workstation.activeTopology is non-null on initialization');
  assert(typeof sandbox.Workstation.activeTopology.nodes === 'object', 'Initial activeTopology has nodes container');
  assert(Array.isArray(sandbox.Workstation.activeTopology.links), 'Initial activeTopology has links array');
  assert(Array.isArray(sandbox.Workstation.activeTopology.npcs), 'Initial activeTopology has npcs array');
  assert(Array.isArray(sandbox.Workstation.activeTopology.quests), 'Initial activeTopology has quests array');
  assert(Array.isArray(sandbox.Workstation.activeTopology.items), 'Initial activeTopology has items array');
  assert(Array.isArray(sandbox.Workstation.activeTopology.layers), 'Initial activeTopology has layers array');

  // 22.2: Undo/Redo empty stack guards
  sandbox.undoAction();
  assertEqual(mockStatusEl.textContent, 'Nothing to undo.', 'undoAction on empty stack sets status message without crashing');
  sandbox.redoAction();
  assertEqual(mockStatusEl.textContent, 'Nothing to redo.', 'redoAction on empty stack sets status message without crashing');

  // 22.3: Keyboard shortcut verification (Ctrl+Z and Ctrl+Y present)
  assert(mdiCode.includes("e.ctrlKey && (e.key === 'z' || e.key === 'Z')"), 'setupKeyboardShortcuts handles Ctrl+Z for undo');
  assert(mdiCode.includes("e.ctrlKey && (e.key === 'y' || e.key === 'Y')"), 'setupKeyboardShortcuts handles Ctrl+Y for redo');

  // 22.4: Snapshot restitution calls ensureEntityCollections
  assert(mdiCode.includes('ensureEntityCollections(current)'), 'restoreSnapshot calls ensureEntityCollections to prevent collection drop');

  // 22.5: Simulate active dirty campaign state
  sandbox.Workstation.activeTopology.nodes = {
    '1': { id: 1, name: 'Dirty Node 1' },
    '2': { id: 2, name: 'Dirty Node 2' }
  };
  sandbox.Workstation.activeTopology.links = [{ source: 1, target: 2 }];
  sandbox.Workstation.activeTopology.npcs = [{ id: 'npc_dirty', name: 'Dirty NPC' }];
  sandbox.Workstation.activeTopology.quests = [{ id: 'q_dirty', title: 'Dirty Quest' }];
  sandbox.Workstation.activeTopology.items = [{ id: 'item_dirty', name: 'Dirty Relic' }];
  sandbox.Workstation.selectedEntity = { type: 'node', id: 1 };
  sandbox.Workstation.selectedEntities = [{ type: 'node', id: 1 }];
  sandbox.Workstation.zoom = 2.5;
  sandbox.Workstation.pan = { x: 300, y: 150 };
  sandbox.Workstation.history.undoStack.push({ description: 'dirty step' });
  sandbox.Workstation.history.redoStack.push({ description: 'dirty redo' });
  sandbox.window.activeProjectDirectoryHandle = { name: 'DirtyDirHandle' };
  sandbox.window.activeProjectDirectoryName = 'DirtyDir';

  // Inject a disk module into ALL_MODULES to test baseline restitution
  sandbox.ALL_MODULES.push({ id: 'MOD-CUSTOM-DISK', name: 'Disk Module Leaked', pipeline_tier: 3 });
  assertEqual(sandbox.ALL_MODULES.length, 3, 'Simulated dirty disk module injected into catalog');

  // Store dirty localStorage items
  storageMap['creator_studio_maps_registry'] = JSON.stringify({ map_root: { nodes: [1, 2] } });
  storageMap['creator_studio_active_topology'] = JSON.stringify(sandbox.Workstation.activeTopology);
  storageMap['cs_active_campaign'] = 'old_campaign';

  // Register a mod with onCampaignUnload
  let modUnloadNotified = false;
  let modUnloadPayload = null;
  sandbox.CreatorStudio.registerMod({
    id: 'test_mod_lifecycle',
    name: 'Lifecycle Test Mod',
    onCampaignUnload: (info) => {
      modUnloadNotified = true;
      modUnloadPayload = info;
    }
  });

  // 22.6: Execute resetWorkstationSlate
  assert(typeof sandbox.resetWorkstationSlate === 'function', 'resetWorkstationSlate is defined on window');
  assert(typeof sandbox.CreatorStudio.resetWorkstationSlate === 'function', 'CreatorStudio.resetWorkstationSlate is exposed on mod API');

  await sandbox.resetWorkstationSlate({
    campaignId: 'clean_campaign',
    campaignName: 'Clean Slate Campaign',
    previousCampaignId: 'old_campaign'
  });

  // 22.7: Assert zero-artifact sterile slate
  assert(typeof sandbox.clearActiveMapImageStore === 'function', 'clearActiveMapImageStore is exported on window');
  const clearResult = await sandbox.clearActiveMapImageStore();
  assert(clearResult !== undefined, 'clearActiveMapImageStore returns an awaitable Promise');

  // Test SVG DOM image scrubbing
  mockElements['canvas-bg-image'].attributes['href'] = 'data:image/png;base64,OLD_LEAKED_BG';
  mockElements['canvas-bg-image'].style.display = 'block';
  sandbox.applyMapImageToCanvas(null);
  assertEqual(mockElements['canvas-bg-image'].style.display, 'none', 'applyMapImageToCanvas(null) hides SVG background element');
  assert(!mockElements['canvas-bg-image'].attributes['href'], 'applyMapImageToCanvas(null) scrubs href from SVG background element');

  // Test hydrateMapsWithImageDataUrls defense against blank maps
  mockElements['canvas-bg-image'].attributes['href'] = 'data:image/png;base64,OLD_LEAKED_BG';
  mockElements['canvas-bg-image'].getAttribute = (attr) => mockElements['canvas-bg-image'].attributes[attr] || null;
  const blankMaps = { map_root: { id: 'map_root', mapMetadata: null } };
  const hydratedBlank = await sandbox.hydrateMapsWithImageDataUrls(blankMaps);
  assert(hydratedBlank.map_root.mapMetadata === null, 'hydrateMapsWithImageDataUrls never leaks SVG DOM image to map with mapMetadata: null');

  assert(sandbox.window.activeProjectDirectoryHandle === null, 'resetWorkstationSlate unbinds activeProjectDirectoryHandle');
  assert(sandbox.window.activeProjectDirectoryName === null, 'resetWorkstationSlate clears activeProjectDirectoryName');
  assert(sandbox.Workstation.activeTopology !== null, 'Workstation.activeTopology is sterile and non-null');
  assertEqual(sandbox.Workstation.activeTopology.id, 'clean_campaign', 'Clean slate campaign ID is assigned');
  assertEqual(sandbox.Workstation.activeTopology.name, 'Clean Slate Campaign', 'Clean slate campaign name is assigned');
  assertEqual(Object.keys(sandbox.Workstation.activeTopology.nodes).length, 0, 'Active topology nodes are 100% emptied');
  assertEqual(sandbox.Workstation.activeTopology.links.length, 0, 'Active topology links are 100% emptied');
  assertEqual(sandbox.Workstation.activeTopology.npcs.length, 0, 'Active topology NPCs are 100% emptied');
  assertEqual(sandbox.Workstation.activeTopology.quests.length, 0, 'Active topology quests are 100% emptied');
  assertEqual(sandbox.Workstation.activeTopology.items.length, 0, 'Active topology items are 100% emptied');
  assertEqual(sandbox.Workstation.history.undoStack.length, 0, 'undoStack is completely purged');
  assertEqual(sandbox.Workstation.history.redoStack.length, 0, 'redoStack is completely purged');
  assertEqual(sandbox.Workstation.zoom, 1.0, 'Viewport zoom reset to 1.0');
  assertEqual(sandbox.Workstation.pan.x, 0, 'Viewport pan.x reset to 0');
  assertEqual(sandbox.Workstation.pan.y, 0, 'Viewport pan.y reset to 0');
  assertEqual(sandbox.Workstation.selectedEntity, null, 'Selection entity cleared to null');
  assertEqual(sandbox.Workstation.selectedEntities.length, 0, 'Multi-selection array cleared');

  // Baseline restitution
  assertEqual(sandbox.ALL_MODULES.length, 2, 'ALL_MODULES restored strictly to pristine baseline without leaked custom modules');
  assert(!sandbox.ALL_MODULES.some(m => m.id === 'MOD-CUSTOM-DISK'), 'Leaked disk module purged from runtime catalog');

  // Mod lifecycle notification
  assert(modUnloadNotified, 'Registered mod onCampaignUnload hook was dispatched');
  assertEqual(modUnloadPayload && modUnloadPayload.previousCampaignId, 'old_campaign', 'Mod received correct previousCampaignId');

  // Storage wipe
  assert(storageMap['creator_studio_maps_registry'] === undefined, 'creator_studio_maps_registry removed from localStorage');
  assert(storageMap['creator_studio_active_topology'] === undefined, 'creator_studio_active_topology removed from localStorage');
  assertEqual(storageMap['cs_active_campaign'], 'clean_campaign', 'cs_active_campaign updated to new campaign');

  // 22.8: Milestone 3 Tests - Dynamic Campaign Boot & Zero-Hardcode Startup
  // A. Cold boot with no localStorage session
  const mockWelcomeSummaryEl = { textContent: '' };
  const coldSandbox = {
    window: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      getElementById: (id) => (id === 'welcome-last-summary' ? mockWelcomeSummaryEl : null),
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    ALL_MODULES: [],
    MODULES_MANIFEST: [],
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    renderCanvas: () => {},
    renderLayersManagerUI: () => {},
    updatePropertiesGrid: () => {},
    renderLayoutTabs: () => {},
    updateStatusBar: () => {},
    updateBreadcrumbsHUD: () => {},
    saveActiveCampaign: () => {},
    console
  };
  coldSandbox.window = coldSandbox;

  vm.createContext(coldSandbox);
  vm.runInContext(zipCode, coldSandbox);
  vm.runInContext(mapStoreCode, coldSandbox);
  vm.runInContext(stateAdapterCode, coldSandbox);
  vm.runInContext(stateCode, coldSandbox);
  vm.runInContext(mdiCode, coldSandbox);

  coldSandbox.initTopology();
  assert(coldSandbox.Workstation && coldSandbox.Workstation.activeTopology !== null, 'Cold boot initializes non-null sterile topology');
  assertEqual(Object.keys(coldSandbox.Workstation.activeTopology.nodes).length, 0, 'Cold boot has zero nodes');
  assertEqual(coldSandbox.Workstation.activeTopology.links.length, 0, 'Cold boot has zero links');
  coldSandbox.updateWelcomeSummary();
  assertEqual(mockWelcomeSummaryEl.textContent, 'No active campaign session. Start a new campaign or open an existing one.', 'updateWelcomeSummary reports no active session instead of falling back to Emerald Isle');

  // B. Custom disk slug preservation (never wiped if session data exists)
  const diskSlugMap = {
    'cs_active_campaign': 'custom_disk_slug',
    'creator_studio_maps_registry': JSON.stringify({
      map_world: { id: 'map_world', name: 'World Overmap', nodes: [{ id: 1, name: 'Haven' }], links: [] }
    }),
    'creator_studio_active_map_id': 'map_world'
  };
  let diskWiped = false;
  const diskSandbox = {
    window: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (k) => diskSlugMap[k] !== undefined ? diskSlugMap[k] : null,
      setItem: (k, v) => { diskSlugMap[k] = String(v); },
      removeItem: (k) => {
        if (k === 'creator_studio_maps_registry') diskWiped = true;
        delete diskSlugMap[k];
      }
    },
    ALL_MODULES: [],
    MODULES_MANIFEST: [],
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    renderCanvas: () => {},
    renderLayersManagerUI: () => {},
    updatePropertiesGrid: () => {},
    renderLayoutTabs: () => {},
    updateStatusBar: () => {},
    updateBreadcrumbsHUD: () => {},
    saveActiveCampaign: () => {},
    console
  };
  diskSandbox.window = diskSandbox;

  vm.createContext(diskSandbox);
  vm.runInContext(zipCode, diskSandbox);
  vm.runInContext(mapStoreCode, diskSandbox);
  vm.runInContext(stateAdapterCode, diskSandbox);
  vm.runInContext(stateCode, diskSandbox);
  vm.runInContext(mdiCode, diskSandbox);

  diskSandbox.initTopology();
  assert(!diskWiped, 'initTopology never wipes localStorage for custom disk campaign slugs');
  assertEqual(diskSlugMap['cs_active_campaign'], 'custom_disk_slug', 'Custom disk campaign slug preserved in localStorage');
  assertEqual(diskSandbox.window.getActiveMapId(), 'map_world', 'initTopology dynamically resolves custom root map ID map_world');
  assert(diskSandbox.Workstation && diskSandbox.Workstation.activeTopology && diskSandbox.Workstation.activeTopology.nodes, 'Workstation activeTopology nodes container restored');
  assertEqual(Object.keys(diskSandbox.Workstation.activeTopology.nodes).length, 1, 'Restored nodes from custom root map');

  // C. Preset submaps preserved in maps registry on fresh initTopology boot
  const submapSandbox = {
    window: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: {
      _data: { 'cs_active_campaign': 'test_multimap_camp' },
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; }
    },
    CAMPAIGN_REGISTRY: {
      'test_multimap_camp': {
        id: 'test_multimap_camp',
        folder: 'test_multimap_camp',
        metadata: { name: 'Multi-Map Test Campaign' },
        preset: {
          id: 'test_multimap_camp',
          rootMapId: 'map_overworld',
          activeMapId: 'map_overworld',
          maps: {
            map_overworld: { id: 'map_overworld', name: 'Overworld', nodes: [{ id: 1, label: 'Portal to Dungeon', childMapId: 'map_dungeon' }], links: [] },
            map_dungeon: { id: 'map_dungeon', name: 'Dungeon Level 1', parentMapId: 'map_overworld', parentNodeId: 1, nodes: [{ id: 101, label: 'Entry Hall' }], links: [], mapMetadata: { id: 'map_dungeon', name: 'dungeon.png', assetPath: 'assets/dungeon.png', dataUrl: 'data:image/png;base64,AAAA' } }
          }
        },
        modules: []
      }
    },
    ALL_MODULES: [],
    MODULES_MANIFEST: [],
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    renderCanvas: () => {},
    renderLayersManagerUI: () => {},
    updatePropertiesGrid: () => {},
    renderLayoutTabs: () => {},
    updateStatusBar: () => {},
    updateBreadcrumbsHUD: () => {},
    saveActiveCampaign: () => {},
    console
  };
  submapSandbox.window = submapSandbox;
  vm.createContext(submapSandbox);
  vm.runInContext(zipCode, submapSandbox);
  vm.runInContext(mapStoreCode, submapSandbox);
  vm.runInContext(stateAdapterCode, submapSandbox);
  vm.runInContext(stateCode, submapSandbox);
  vm.runInContext(mdiCode, submapSandbox);

  submapSandbox.initTopology();
  const submapsReg = vm.runInContext('maps', submapSandbox);
  assert(submapsReg && submapsReg.map_dungeon !== undefined, 'initTopology preserves multi-scale submaps from campaign preset');
  assertEqual(submapSandbox.window.getActiveMapId(), 'map_overworld', 'Active map set to rootMapId');
  submapSandbox.switchActiveMap('map_dungeon');
  assertEqual(submapSandbox.window.getActiveMapId(), 'map_dungeon', 'switchActiveMap successfully transitions to child map without losing registration');

  // 22.9: Milestone 4 Tests - Guarded switchActiveMap & Package Ingestion
  // A. Blank canvas ingestion cleans all prior campaign nodes and entities (Zero-Bleed)
  const pkgSandbox = {
    window: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (k) => diskSlugMap[k] !== undefined ? diskSlugMap[k] : null,
      setItem: (k, v) => { diskSlugMap[k] = String(v); },
      removeItem: (k) => { delete diskSlugMap[k]; }
    },
    ALL_MODULES: [],
    MODULES_MANIFEST: [],
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    renderCanvas: () => {},
    renderLayersManagerUI: () => {},
    updatePropertiesGrid: () => {},
    renderLayoutTabs: () => {},
    updateStatusBar: () => {},
    updateBreadcrumbsHUD: () => {},
    renderEntityManagerTree: () => {},
    renderEntityManagerList: () => {},
    selectGlobal: () => {},
    closeModal: () => {},
    setStatusBarMessage: () => {},
    saveActiveCampaign: () => {},
    console
  };
  pkgSandbox.window = pkgSandbox;

  vm.createContext(pkgSandbox);
  vm.runInContext(zipCode, pkgSandbox);
  vm.runInContext(mapStoreCode, pkgSandbox);
  vm.runInContext(stateAdapterCode, pkgSandbox);
  vm.runInContext(stateCode, pkgSandbox);
  vm.runInContext(mdiCode, pkgSandbox);

  // Setup dirty active state
  pkgSandbox.Workstation.activeTopology.nodes = {
    '1': { id: 1, name: 'Old Cathedral' },
    '2': { id: 2, name: 'Old Watchtower' }
  };
  pkgSandbox.Workstation.activeTopology.links = [{ source: 1, target: 2 }];
  pkgSandbox.Workstation.activeTopology.npcs = [{ id: 'npc_willy', name: 'Groundskeeper Willy' }];
  pkgSandbox.Workstation.activeTopology.quests = [{ id: 'q_graveyard', title: 'Graveyard Haunting' }];
  pkgSandbox.Workstation.activeTopology.items = [{ id: 'item_cathedral_key', name: 'Cathedral Key' }];

  // Ingest blank canvas package
  const blankPkg = {
    id: 'blank_canvas',
    name: 'Fresh Canvas',
    campaignName: 'Fresh Canvas',
    rootMapId: 'map_root',
    activeMapId: 'map_root',
    maps: {
      map_root: { id: 'map_root', name: 'Root', nodes: [], links: [] }
    },
    nodes: [],
    links: [],
    entities: { npcs: [], quests: [], items: [], trackers: [], tickets: [] }
  };

  await pkgSandbox.loadCampaignProjectPackage(blankPkg);

  assertEqual(Object.keys(pkgSandbox.Workstation.activeTopology.nodes).length, 0, 'Blank canvas package loads with 0 nodes (no old nodes bled)');
  assertEqual(pkgSandbox.Workstation.activeTopology.links.length, 0, 'Blank canvas package loads with 0 links');
  assertEqual(pkgSandbox.Workstation.activeTopology.npcs.length, 0, 'Blank canvas package loads with 0 NPCs (Groundskeeper Willy not bled)');
  assertEqual(pkgSandbox.Workstation.activeTopology.quests.length, 0, 'Blank canvas package loads with 0 quests');
  assertEqual(pkgSandbox.Workstation.activeTopology.items.length, 0, 'Blank canvas package loads with 0 items (Cathedral Key not bled)');

  // B. In-campaign drill-down preserves edits and carries over campaign entities
  // Add a node and NPC to the active campaign
  pkgSandbox.Workstation.activeTopology.nodes['10'] = { id: 10, name: 'Sub-portal Node', x: 200, y: 200 };
  pkgSandbox.Workstation.activeTopology.npcs.push({ id: 'npc_explorer', name: 'Dungeon Delver' });

  // Add child map in maps registry
  const activeMaps = pkgSandbox.window.getMapsRegistry();
  activeMaps['map_dungeon_01'] = {
    id: 'map_dungeon_01',
    name: 'Deep Dungeon',
    scaleTier: 'dungeon',
    nodes: [{ id: 101, name: 'Dungeon Entrance', x: 50, y: 50 }],
    links: []
  };

  // Switch to sub-map (standard user navigation)
  await pkgSandbox.switchActiveMap('map_dungeon_01');

  assertEqual(pkgSandbox.window.getActiveMapId(), 'map_dungeon_01', 'Switched active map to map_dungeon_01');
  assertEqual(Object.keys(pkgSandbox.Workstation.activeTopology.nodes).length, 1, 'Sub-map loaded its own nodes');
  assertEqual(pkgSandbox.Workstation.activeTopology.npcs.length, 1, 'In-campaign map switch preserves campaign entities (Dungeon Delver)');

  // Switch back to root map
  await pkgSandbox.switchActiveMap('map_root');
  assertEqual(pkgSandbox.window.getActiveMapId(), 'map_root', 'Ascended back to map_root');
  assertEqual(Object.keys(pkgSandbox.Workstation.activeTopology.nodes).length, 1, 'map_root node 10 was preserved via syncActiveMapToRegistry');

  // 22.10: Milestone 5 Tests - Selective Importer & Mod Lifecycle Events
  const selectiveImporterPath = path.join(ROOT_DIR, 'src/workstation/scripts/selective_importer.js');
  const selectiveImporterCode = fs.readFileSync(selectiveImporterPath, 'utf8');

  // Assert Mode A invokes resetWorkstationSlate
  const modeAHasTeardown = /if\s*\(\s*importMode\s*===\s*["']new["']\s*\)[\s\S]{1,300}resetWorkstationSlate/.test(selectiveImporterCode);
  assert(modeAHasTeardown, 'selective_importer Mode A (new campaign) executes resetWorkstationSlate');

  // Assert Mode B does NOT invoke resetWorkstationSlate
  const modeBSplit = selectiveImporterCode.split('MODE B: ADD / MERGE SELECTED MAPS');
  assert(modeBSplit.length > 1, 'selective_importer contains distinct Mode B merge branch');
  const modeBCode = modeBSplit[1].split('window.triggerSelectiveImportPackage')[0];
  assert(!modeBCode.includes('resetWorkstationSlate'), 'selective_importer Mode B (merge) never wipes workstation state');

  // Assert map_store tags discovered disk modules with sourceType: "disk"
  assert(mapStoreCode.includes('sourceType: "disk"'), 'map_store tags discovered disk modules with sourceType: "disk"');

  // Test full mod lifecycle: onCampaignLoad and onCampaignUnload
  let modLoadedCamp = null;
  let modUnloadedCamp = null;
  pkgSandbox.CreatorStudio.registerMod({
    id: 'test_lifecycle_dual',
    name: 'Dual Lifecycle Mod',
    onCampaignLoad: (topo) => { modLoadedCamp = topo; },
    onCampaignUnload: (info) => { modUnloadedCamp = info; }
  });

  // Trigger package load
  const loadablePkg = {
    id: 'lifecycle_camp_1',
    name: 'Lifecycle Campaign 1',
    rootMapId: 'map_root',
    maps: { map_root: { id: 'map_root', name: 'Root', nodes: [], links: [] } },
    nodes: [],
    links: [],
    entities: { npcs: [], quests: [], items: [] }
  };
  await pkgSandbox.loadCampaignProjectPackage(loadablePkg);

  assert(modLoadedCamp !== null, 'onCampaignLoad fired upon loadCampaignProjectPackage');
  assertEqual(modLoadedCamp && modLoadedCamp.name, 'Lifecycle Campaign 1', 'onCampaignLoad received loaded campaign topology');

  // Trigger resetWorkstationSlate
  await pkgSandbox.resetWorkstationSlate({ campaignId: 'next_camp', previousCampaignId: 'lifecycle_camp_1' });
  assert(modUnloadedCamp !== null, 'onCampaignUnload fired upon resetWorkstationSlate');
  assertEqual(modUnloadedCamp && modUnloadedCamp.previousCampaignId, 'lifecycle_camp_1', 'onCampaignUnload received previousCampaignId');
}

// ============================================================================
// SUITE 23: INDEXEDDB SEPARATION, CONCURRENCY & DELETION PARITY GATE
// ============================================================================
async function testIndexedDbSeparationAndConcurrencyGate() {
  console.log('\n--> SUITE 23: IndexedDB Separation, Concurrency & Deletion Parity Gate...');

  const zipPath = path.join(ROOT_DIR, 'src/workstation/scripts/zip_engine.js');
  const mapStorePath = path.join(ROOT_DIR, 'src/workstation/scripts/map_store.js');
  const stateAdapterPath = path.join(ROOT_DIR, 'src/workstation/scripts/state_adapter.js');
  const statePath = path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js');
  const exportPath = path.join(ROOT_DIR, 'src/workstation/scripts/campaign_exporter.js');

  const zipCode = fs.readFileSync(zipPath, 'utf8');
  const mapStoreCode = fs.readFileSync(mapStorePath, 'utf8');
  const stateAdapterCode = fs.readFileSync(stateAdapterPath, 'utf8');
  const stateCode = fs.readFileSync(statePath, 'utf8');
  const exportCode = fs.readFileSync(exportPath, 'utf8');

  const mockElements = {
    'canvas-bg-image': {
      style: {},
      attributes: {},
      setAttribute: function(k, v) { this.attributes[k] = v; },
      setAttributeNS: function(ns, k, v) { this.attributes[`${ns}:${k}`] = v; },
      removeAttribute: function(k) { delete this.attributes[k]; },
      removeAttributeNS: function(ns, k) { delete this.attributes[`${ns}:${k}`]; delete this.attributes[k]; },
      getAttribute: function(k) { return this.attributes[k] || null; }
    },
    'sb-disk': { textContent: '', title: '', style: {} },
    'campaign-export-area': { value: '' }
  };

  const storageMap = {};
  const mockIdbData = {};

  const sandbox = {
    window: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    confirm: () => true,
    document: {
      getElementById: (id) => mockElements[id] || null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (k) => storageMap[k] !== undefined ? storageMap[k] : null,
      setItem: (k, v) => { storageMap[k] = String(v); },
      removeItem: (k) => { delete storageMap[k]; }
    },
    indexedDB: {
      open: () => {
        const req = {
          result: {
            objectStoreNames: { contains: () => true },
            transaction: () => ({
              objectStore: () => ({
                get: (id) => {
                  const r = { result: mockIdbData[id] || null, onsuccess: null, onerror: null };
                  setTimeout(() => { if (r.onsuccess) r.onsuccess(); }, 0);
                  return r;
                },
                put: (rec) => { mockIdbData[rec.id] = rec; },
                delete: (id) => { delete mockIdbData[id]; },
                clear: () => { Object.keys(mockIdbData).forEach(k => delete mockIdbData[k]); }
              }),
              oncomplete: null
            })
          },
          onsuccess: null,
          onerror: null
        };
        setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
        return req;
      }
    },
    ALL_MODULES: [],
    MODULES_MANIFEST: [],
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    renderCanvas: () => {},
    renderLayersManagerUI: () => {},
    updatePropertiesGrid: () => {},
    renderLayoutTabs: () => {},
    updateStatusBar: () => {},
    updateBreadcrumbsHUD: () => {},
    setStatusBarMessage: () => {},
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(zipCode, sandbox);
  vm.runInContext(mapStoreCode, sandbox);
  vm.runInContext(stateAdapterCode, sandbox);
  vm.runInContext(stateCode, sandbox);
  vm.runInContext(exportCode, sandbox);

  // 1. Sequence token increment & fast canvas blanking on switchActiveMap
  vm.runInContext(`
    maps = {
      map_root: { id: 'map_root', name: 'Root Map', nodes: [], links: [] },
      map_sub1: { id: 'map_sub1', name: 'Submap 1', nodes: [], links: [] },
      map_sub2: { id: 'map_sub2', name: 'Submap 2', nodes: [], links: [] }
    };
    activeMapId = 'map_root';
  `, sandbox);

  const p1 = sandbox.switchActiveMap('map_sub1');
  const p2 = sandbox.switchActiveMap('map_sub2');
  await Promise.all([p1, p2]);

  assertEqual(sandbox.window.__mapSwitchSequence, 2, 'switchActiveMap increments __mapSwitchSequence token monotonically');
  assertEqual(sandbox.window.getActiveMapId(), 'map_sub2', 'Out-of-order switchActiveMap settles on the latest requested map');

  // 2. clearLoadedMap sync persistence & localStorage update
  vm.runInContext(`
    activeMapId = 'map_root';
    maps.map_root.mapMetadata = { name: 'overworld.png', width: 1920, height: 1080 };
    activeMapMetadata = { name: 'overworld.png', width: 1920, height: 1080 };
    Workstation.activeTopology.mapMetadata = { name: 'overworld.png', width: 1920, height: 1080 };
    saveActiveCampaign();
  `, sandbox);

  await sandbox.clearLoadedMap();

  assert(vm.runInContext('activeMapMetadata', sandbox) === null, 'clearLoadedMap sets activeMapMetadata to null');
  assert(vm.runInContext('maps.map_root.mapMetadata', sandbox) === null, 'clearLoadedMap sets maps[activeMapId].mapMetadata to null');
  assert(sandbox.Workstation.activeTopology.mapMetadata === null, 'clearLoadedMap sets Workstation.activeTopology.mapMetadata to null');
  const parsedMapsInStorage = JSON.parse(storageMap['creator_studio_maps_registry'] || '{}');
  assert(parsedMapsInStorage.map_root && parsedMapsInStorage.map_root.mapMetadata === null, 'clearLoadedMap synchronously flushes null mapMetadata to creator_studio_maps_registry');

  // 3. Stage 6 Hydration Parity
  vm.runInContext(`
    maps.map_root.mapMetadata = { name: 'hydrated_bg.png', width: 1920, height: 1080 };
  `, sandbox);
  mockIdbData['map_root'] = {
    id: 'map_root',
    name: 'hydrated_bg.png',
    dataUrl: 'data:image/png;base64,HYDRATED_STAGE6_TEST_DATA',
    width: 1920,
    height: 1080,
    opacity: 0.85
  };

  const hydratedJsonStr = await sandbox.generateHydratedCampaignJSON();
  const parsedHydrated = JSON.parse(hydratedJsonStr);
  assert(parsedHydrated.maps && parsedHydrated.maps.map_root, 'generateHydratedCampaignJSON generates maps container');
  assertEqual(parsedHydrated.maps.map_root.mapMetadata.dataUrl, 'data:image/png;base64,HYDRATED_STAGE6_TEST_DATA', 'generateHydratedCampaignJSON hydrates map dataUrl from IndexedDB');

  // 4. Ephemeral Storage Telemetry
  sandbox.updateDiskSyncIndicator();
  assertEqual(mockElements['sb-disk'].textContent, 'Storage: Browser-Only', 'updateDiskSyncIndicator alerts user to browser-only storage when unbound');
}

// ============================================================================
// SUITE 24: ENTITY MODULE PACK ENGINE (.csmod / .zip)
// ============================================================================
async function testEntityModulePackEngine() {
  console.log('\n--> SUITE 24: Entity Module Pack Engine (.csmod / .zip Ingestion, Portal Anchoring & Teardown)...');

  const zipPath = path.join(ROOT_DIR, 'src/workstation/scripts/zip_engine.js');
  const packEnginePath = path.join(ROOT_DIR, 'src/workstation/scripts/pack_engine.js');
  const exportPath = path.join(ROOT_DIR, 'src/workstation/scripts/campaign_exporter.js');

  const zipCode = fs.readFileSync(zipPath, 'utf8');
  const packEngineCode = fs.readFileSync(packEnginePath, 'utf8');
  const exportCode = fs.readFileSync(exportPath, 'utf8');

  const sandbox = {
    window: {},
    console,
    TextEncoder: global.TextEncoder,
    TextDecoder: global.TextDecoder,
    Buffer: global.Buffer,
    Blob: global.Blob,
    Uint8Array: global.Uint8Array,
    ArrayBuffer: global.ArrayBuffer,
    document: {
      getElementById: () => null,
      createElement: () => ({ setAttribute: () => {}, style: {}, classList: { add: () => {}, remove: () => {} } }),
      querySelectorAll: () => []
    },
    setTimeout,
    clearTimeout
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(zipCode, sandbox);
  vm.runInContext(packEngineCode, sandbox);
  vm.runInContext(exportCode, sandbox);

  // 1. Manifest Validation
  const validManifest = {
    formatVersion: '1.0.0',
    packId: 'undermountain_l1',
    name: 'Undermountain Level 1',
    entryMapId: 'map_undermountain_l1'
  };
  const valResult = sandbox.validatePackManifest(validManifest);
  assert(valResult.valid === true, 'validatePackManifest approves valid manifest');
  assertEqual(valResult.errors.length, 0, 'No errors on valid manifest');

  const invalidManifest = {
    formatVersion: '1.0.0',
    packId: 'invalid pack id with spaces!',
    name: ''
  };
  const valInvalid = sandbox.validatePackManifest(invalidManifest);
  assert(valInvalid.valid === false, 'validatePackManifest rejects invalid manifest');
  assert(valInvalid.errors.length >= 2, 'Errors reported for packId and name');

  // 2. Round-Trip In-Memory Packaging and Parsing
  const zip = new sandbox.ZeroCorsZip();
  zip.addFile('pack.json', JSON.stringify(validManifest));
  zip.addFile('maps/map_undermountain_l1.json', JSON.stringify({
    id: 'map_undermountain_l1',
    name: 'Dungeon Level 1',
    nodes: [{ id: 101, name: 'Entry Room' }, { id: 102, name: 'Throne Room' }],
    links: [{ source: 101, target: 102 }],
    mapMetadata: { name: 'level1.png', assetPath: 'assets/level1.png', width: 1920, height: 1080 }
  }));
  zip.addFile('entities.json', JSON.stringify({
    npcs: [{ id: 'npc_halaster', name: 'Halaster Blackcloak', role: 'Mage' }],
    quests: [{ id: 'q_explore', title: 'Explore the Deep' }],
    items: [{ id: 'wand_wonder', name: 'Wand of Wonder' }]
  }));
  zip.addFile('modules/UNDR-01.md', 'id: UNDR-01\n# Undermountain Level 1\nWorldbuilding lore...');
  zip.addFile('assets/level1.png', new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));

  const blob = zip.generateBlob();
  const arrayBuffer = await blob.arrayBuffer();
  const parsedPack = await sandbox.parsePackArchive(arrayBuffer);

  assertEqual(parsedPack.manifest.packId, 'undermountain_l1', 'parsePackArchive decodes manifest packId');
  assert(parsedPack.maps.map_undermountain_l1 !== undefined, 'parsePackArchive extracts submaps');
  assertEqual(parsedPack.maps.map_undermountain_l1.nodes.length, 2, 'parsePackArchive parses map nodes');
  assertEqual(parsedPack.entities.npcs.length, 1, 'parsePackArchive extracts npcs');
  assertEqual(parsedPack.entities.npcs[0].id, 'npc_halaster', 'NPC id preserved');
  assert(parsedPack.modules['UNDR-01.md'] !== undefined, 'parsePackArchive extracts custom modules');
  assert(parsedPack.assets['level1.png'] !== undefined, 'parsePackArchive extracts assets');

  // 3. Campaign Installation & Portal Anchor Assignment
  sandbox.Workstation = {
    activeTopology: {
      name: 'Main Overworld',
      nodes: [{ id: 50, name: 'Yawning Portal Inn' }],
      links: [],
      maps: {},
      npcs: [{ id: 'npc_durnan', name: 'Durnan' }],
      quests: [],
      items: [],
      installedPacks: []
    }
  };
  sandbox.maps = {};
  sandbox.nodes = sandbox.Workstation.activeTopology.nodes;
  sandbox.activeMapId = 'map_root';

  let savedImages = {};
  sandbox.saveMapImageToDB = async function(name, dataUrl, w, h, op, mapId) {
    savedImages[mapId] = { name, dataUrl, w, h, op };
  };

  const installLedger = await sandbox.installPackIntoCampaign(parsedPack, { anchorNodeId: 50 });

  assertEqual(sandbox.nodes[0].childMapId, 'map_undermountain_l1', 'Anchor node set childMapId to entry submap');
  assert(sandbox.maps.map_undermountain_l1 !== undefined, 'Submap added to maps dictionary');
  assertEqual(sandbox.maps.map_undermountain_l1.parentMapId, 'map_root', 'Submap parentMapId set to activeMapId');
  assertEqual(sandbox.maps.map_undermountain_l1.parentNodeId, 50, 'Submap parentNodeId set to anchor node');
  assert(savedImages['map_undermountain_l1'] !== undefined, 'Raster asset offloaded to IndexedDB');
  assert(sandbox.maps.map_undermountain_l1.mapMetadata.dataUrl === undefined, 'dataUrl stripped from submap metadata');
  assertEqual(sandbox.Workstation.activeTopology.npcs.length, 2, 'NPC ingested into campaign entities');
  assertEqual(sandbox.Workstation.activeTopology.installedPacks.length, 1, 'Pack registered in installedPacks ledger');
  assertEqual(installLedger.packId, 'undermountain_l1', 'Ledger returned from installation');

  // 4. Collision Disambiguation (Clone)
  const collidingPack = {
    manifest: {
      formatVersion: '1.0.0',
      packId: 'alt_pack',
      name: 'Alternative Deep',
      entryMapId: 'map_alt'
    },
    maps: { map_alt: { id: 'map_alt', nodes: [] } },
    entities: {
      npcs: [{ id: 'npc_durnan', name: 'Durnan' }] // Collides with existing Durnan
    },
    modules: {},
    assets: {}
  };

  await sandbox.installPackIntoCampaign(collidingPack, { anchorNodeId: null });
  assertEqual(sandbox.Workstation.activeTopology.npcs.length, 3, 'Colliding entity cloned rather than overwritten');
  const clonedDurnan = sandbox.Workstation.activeTopology.npcs.find(n => n.name.includes('Alternative Deep'));
  assert(clonedDurnan !== undefined, 'Cloned entity name reflects pack title');
  assert(clonedDurnan.id !== 'npc_durnan', 'Cloned entity received unique disambiguated ID');

  // 5. Cascade Uninstallation & Teardown
  let deletedFromDb = [];
  sandbox.deletePersistedMapFromDB = async function(mapId) {
    deletedFromDb.push(mapId);
  };

  const uninstallResult = await sandbox.uninstallPackFromCampaign('undermountain_l1');
  assert(uninstallResult === true, 'uninstallPackFromCampaign returns true');
  assert(sandbox.nodes[0].childMapId === undefined, 'Anchor node childMapId cleared on uninstall');
  assert(sandbox.maps.map_undermountain_l1 === undefined, 'Submap purged from maps dictionary');
  assert(deletedFromDb.includes('map_undermountain_l1'), 'Submap image purged from IndexedDB');
  assert(!sandbox.Workstation.activeTopology.npcs.some(n => n.id === 'npc_halaster'), 'Pack NPC purged from entities');
  assertEqual(sandbox.Workstation.activeTopology.installedPacks.length, 1, 'Installed packs count decreased');
  assertEqual(sandbox.Workstation.activeTopology.installedPacks[0].packId, 'alt_pack', 'Remaining pack intact');

  // 6. Binary DataURL to Uint8Array Conversion (Offline Zero-CORS)
  const sampleBytes = new Uint8Array([10, 20, 30, 40, 50]);
  const sampleDataUrl = 'data:image/png;base64,' + Buffer.from(sampleBytes).toString('base64');
  const convertedBytes = sandbox.dataUrlToUint8Array(sampleDataUrl);
  assert(convertedBytes instanceof Uint8Array, 'dataUrlToUint8Array returns Uint8Array');
  assertEqual(convertedBytes.length, 5, 'Length matches original binary payload');
  assertEqual(convertedBytes[0], 10, 'Byte 0 preserved');
  assertEqual(convertedBytes[4], 50, 'Byte 4 preserved');
  assert(sandbox.dataUrlToUint8Array(null) === null, 'dataUrlToUint8Array returns null for null input');
  assert(sandbox.dataUrlToUint8Array('not a data url') === null, 'dataUrlToUint8Array returns null for malformed string');

  // 7. Relational Entity Cluster Remapping
  const clusterEntities = {
    npcs: [{ id: 'npc_smith', questIds: ['q_craft'], itemIds: ['it_hammer'], relationships: [{ targetNpcId: 'npc_apprentice', role: 'mentor' }] }],
    quests: [{ id: 'q_craft', npcIds: ['npc_smith'], targetNpcId: 'npc_smith', giverNpcId: 'npc_mayor', itemIds: ['it_hammer'] }],
    items: [{ id: 'it_hammer', ownerNpcId: 'npc_smith' }]
  };
  const clusterSubmaps = {
    map_forge: {
      id: 'map_forge',
      nodes: [{ id: 1, stationedNpcIds: ['npc_smith'], childMapId: 'map_basement' }]
    }
  };
  const idMap = {
    npc_smith: 'npc_smith_cloned_99',
    it_hammer: 'it_hammer_cloned_99'
  };
  const submapMap = {
    map_basement: 'map_basement_cloned_99'
  };
  sandbox.remapEntityCluster(clusterEntities, clusterSubmaps, idMap, submapMap);
  assertEqual(clusterEntities.quests[0].npcIds[0], 'npc_smith_cloned_99', 'Quest npcIds remapped to cloned NPC');
  assertEqual(clusterEntities.quests[0].targetNpcId, 'npc_smith_cloned_99', 'Quest targetNpcId remapped to cloned NPC');
  assertEqual(clusterEntities.quests[0].itemIds[0], 'it_hammer_cloned_99', 'Quest itemIds remapped to cloned Item');
  assertEqual(clusterEntities.items[0].ownerNpcId, 'npc_smith_cloned_99', 'Item ownerNpcId remapped to cloned NPC');
  assertEqual(clusterSubmaps.map_forge.nodes[0].stationedNpcIds[0], 'npc_smith_cloned_99', 'Submap node stationedNpcIds remapped');
  assertEqual(clusterSubmaps.map_forge.nodes[0].childMapId, 'map_basement_cloned_99', 'Submap node childMapId remapped');

  // 8. Portal Collision Preservation & Restoration
  sandbox.nodes[0].childMapId = 'pre_existing_dungeon';
  const portalTestPack = {
    manifest: {
      formatVersion: '1.0.0',
      packId: 'portal_collision_pack',
      name: 'Portal Test Pack',
      entryMapId: 'map_portal_test'
    },
    maps: { map_portal_test: { id: 'map_portal_test', nodes: [] } },
    entities: { npcs: [], quests: [], items: [] },
    modules: {},
    assets: {}
  };
  const portalLedger = await sandbox.installPackIntoCampaign(portalTestPack, { anchorNodeId: sandbox.nodes[0].id });
  assertEqual(portalLedger.previousChildMapId, 'pre_existing_dungeon', 'previousChildMapId recorded in ledger');
  assertEqual(sandbox.nodes[0].childMapId, 'map_portal_test', 'Anchor node childMapId updated to new pack');

  await sandbox.uninstallPackFromCampaign('portal_collision_pack');
  assertEqual(sandbox.nodes[0].childMapId, 'pre_existing_dungeon', 'previousChildMapId restored on uninstall');

  // 9. Active Map Safety Guard on Uninstall
  const activeGuardPack = {
    manifest: {
      formatVersion: '1.0.0',
      packId: 'danger_pack',
      name: 'Danger Pack',
      entryMapId: 'map_sub_danger'
    },
    maps: { map_sub_danger: { id: 'map_sub_danger', nodes: [] } },
    entities: { npcs: [] },
    modules: {},
    assets: {}
  };
  const dangerLedger = await sandbox.installPackIntoCampaign(activeGuardPack, { anchorNodeId: null });
  const installedDangerSubmapId = dangerLedger.submapIds[0];
  sandbox.activeMapId = installedDangerSubmapId;
  let switchedMapTo = null;
  sandbox.switchActiveMap = async function(fallbackId) {
    switchedMapTo = fallbackId;
    sandbox.activeMapId = fallbackId;
  };

  await sandbox.uninstallPackFromCampaign('danger_pack');
  assertEqual(switchedMapTo, 'map_root', 'Active map switched to fallback map_root before deleting active pack submap');
  assert(sandbox.maps[installedDangerSubmapId] === undefined, 'Pack submap deleted after safe map switch');

  // 10. Deep Module Controller Seams (packEngine)
  assert(sandbox.packEngine !== undefined, 'packEngine object exposed');
  assert(typeof sandbox.packEngine.openInstallerDialog === 'function', 'openInstallerDialog seam exposed');
  assert(typeof sandbox.packEngine.executeInstallFromDialog === 'function', 'executeInstallFromDialog seam exposed');
  assert(typeof sandbox.packEngine.renderInstalledPacksView === 'function', 'renderInstalledPacksView seam exposed');
  assert(typeof sandbox.packEngine.requestPackUninstall === 'function', 'requestPackUninstall seam exposed');

  const stagedPackRes = await sandbox.packEngine.openInstallerDialog(arrayBuffer);
  assertEqual(sandbox.packEngine.stagedPack.manifest.packId, 'undermountain_l1', 'openInstallerDialog stages pack');
  assertEqual(stagedPackRes.manifest.name, 'Undermountain Level 1', 'Returns parsed pack');

  const stagedInstallLedger = await sandbox.packEngine.executeInstallFromDialog({ anchorNodeId: null });
  assertEqual(stagedInstallLedger.packId, 'undermountain_l1', 'executeInstallFromDialog installs staged pack');
  assert(sandbox.packEngine.stagedPack === null, 'stagedPack cleared after installation');

  // 11. Guided Pack Installer UI Integration (Ticket 1)
  const mockDoms = {};
  function makeMockEl(tag = 'div') {
    return {
      tagName: tag.toUpperCase(),
      textContent: '',
      innerHTML: '',
      value: '',
      style: {},
      classList: {
        classes: new Set(),
        toggle(cls, force) {
          if (force !== undefined) {
            if (force) this.classes.add(cls); else this.classes.delete(cls);
          } else {
            if (this.classes.has(cls)) this.classes.delete(cls); else this.classes.add(cls);
          }
        },
        contains(cls) { return this.classes.has(cls); }
      },
      options: [],
      selectedIndex: 0,
      dataset: {},
      appendChild(child) { this.options.push(child); }
    };
  }

  ['pack-installer-file-input', 'btn-ptab-overview', 'btn-ptab-anchor', 'btn-ptab-conflicts',
   'ptab-content-overview', 'ptab-content-anchor', 'ptab-content-conflicts',
   'pack-preview-name', 'pack-preview-meta', 'pack-preview-desc', 'pack-preview-counts',
   'pack-preview-anchor-prompt', 'pack-preview-anchor-prompt-text', 'pack-installer-status',
   'pack-anchor-node-select', 'pack-anchor-collision-warning', 'pack-conflicts-list'].forEach(id => {
    mockDoms[id] = makeMockEl();
  });

  let fileInputClicked = false;
  mockDoms['pack-installer-file-input'].click = () => { fileInputClicked = true; };

  sandbox.document = {
    getElementById(id) { return mockDoms[id] || null; },
    querySelectorAll(selector) { return []; },
    createElement(tag) { return makeMockEl(tag); }
  };

  sandbox.triggerInstallPackFile();
  assert(fileInputClicked === true, 'triggerInstallPackFile clicks hidden file input');

  sandbox.switchPackInstallerTab('anchor');
  assert(mockDoms['btn-ptab-anchor'].classList.contains('active'), 'Anchor tab marked active');
  assert(!mockDoms['ptab-content-anchor'].classList.contains('hidden'), 'Anchor tab content visible');
  assert(mockDoms['ptab-content-overview'].classList.contains('hidden'), 'Overview tab content hidden');

  sandbox.populatePackInstallerModal(parsedPack);
  assertEqual(mockDoms['pack-preview-name'].textContent, 'Undermountain Level 1', 'populatePackInstallerModal sets title');
  assert(mockDoms['pack-preview-counts'].innerHTML.includes('Submaps'), 'Badges rendered');
  assert(mockDoms['pack-anchor-node-select'].options.length >= 1, 'Anchor dropdown populated with active map nodes');

  let mdiClosedWindow = null;
  sandbox.MDIWindowManager = {
    close(id) { mdiClosedWindow = id; },
    open(id) {}
  };
  sandbox.setStatusBarMessage = function(msg) {};

  sandbox.packEngine.stagedPack = parsedPack;
  await sandbox.executePackInstallation();
  assertEqual(mdiClosedWindow, 'modal-pack-installer', 'executePackInstallation closes installer modal');
  assert(sandbox.packEngine.stagedPack === null, 'stagedPack cleared after executePackInstallation');

  // 12. Installed Packs Inspector Ledger (Ticket 2)
  const installedContainer = makeMockEl();
  sandbox.packEngine.renderInstalledPacksView(installedContainer);
  assert(installedContainer.innerHTML.includes('Undermountain Level 1'), 'renderInstalledPacksView renders installed pack title');
  assert(installedContainer.innerHTML.includes('Uninstall...'), 'renderInstalledPacksView renders Uninstall button');

  // Empty state test
  sandbox.Workstation.activeTopology.installedPacks = [];
  sandbox.packEngine.renderInstalledPacksView(installedContainer);
  assert(installedContainer.innerHTML.includes('No modular entity packs installed'), 'renderInstalledPacksView renders empty state message');

  // 13. In-App Pack Exporter & Round-Trip Fidelity Invariant (Ticket 3)
  sandbox.Workstation.activeTopology.maps = {
    map_crystal_caverns: {
      id: 'map_crystal_caverns',
      name: 'Crystal Caverns',
      nodes: [{ id: 201, name: 'Crystal Entrance' }, { id: 202, name: 'Grotto of Echoes' }],
      links: [{ source: 201, target: 202 }],
      mapMetadata: { name: 'caverns.png', assetPath: 'assets/caverns.png', width: 1024, height: 768 }
    }
  };
  sandbox.maps = sandbox.Workstation.activeTopology.maps;
  sandbox.Workstation.activeTopology.npcs = [
    { id: 'npc_miner', name: 'Grumble Stone', nodeId: 201, role: 'Miner' }
  ];
  sandbox.Workstation.activeTopology.quests = [
    { id: 'q_crystals', title: 'Gather Glowing Crystals', nodeId: 202 }
  ];
  sandbox.loadPersistedMapFromDB = async function(mapId) {
    return { dataUrl: 'data:image/png;base64,' + Buffer.from([1, 2, 3, 4]).toString('base64') };
  };

  mockDoms['export-pack-submap-select'] = { value: 'map_crystal_caverns' };
  mockDoms['export-pack-id'] = { value: 'crystal_caverns_pack' };
  mockDoms['export-pack-title'] = { value: 'Crystal Caverns Expansion' };
  mockDoms['export-pack-author'] = { value: 'Dungeon Master' };
  mockDoms['export-pack-domain'] = { value: 'Silica Underdark' };
  mockDoms['export-pack-desc'] = { value: 'Deep crystalline subterranean tunnels.' };

  const exportedBlob = await sandbox.executeExportCsmodPack();
  assert(exportedBlob instanceof sandbox.Blob, 'executeExportCsmodPack returns generated Blob');
  assert(exportedBlob.size > 100, 'Exported blob has non-zero binary weight');

  // Verify Round-Trip Invariant: Decompress & re-ingest exported blob
  const exportedBuffer = await exportedBlob.arrayBuffer();
  const reimportedPack = await sandbox.parsePackArchive(exportedBuffer);
  assertEqual(reimportedPack.manifest.packId, 'crystal_caverns_pack', 'Round-trip: manifest packId preserved');
  assertEqual(reimportedPack.manifest.entryMapId, 'map_crystal_caverns', 'Round-trip: entryMapId preserved');
  assert(reimportedPack.maps.map_crystal_caverns !== undefined, 'Round-trip: submap preserved');
  assertEqual(reimportedPack.maps.map_crystal_caverns.nodes.length, 2, 'Round-trip: nodes count preserved');
  assertEqual(reimportedPack.entities.npcs.length, 1, 'Round-trip: stationed NPC preserved');
  assertEqual(reimportedPack.entities.npcs[0].id, 'npc_miner', 'Round-trip: NPC ID preserved');
  assert(reimportedPack.assets['caverns.png'] !== undefined, 'Round-trip: raster image asset preserved');
  assertEqual(reimportedPack.assets['caverns.png'].length, 4, 'Round-trip: image bytes preserved byte-for-byte');

  // Verify remapEntityCluster submapId remapping on collision
  const testEntities = {
    npcs: [{ id: 'npc_1', submapId: 'map_old_1' }],
    quests: [{ id: 'q_1', submapId: 'map_old_1' }],
    items: [{ id: 'item_1', submapId: 'map_old_1' }],
    trackers: [{ id: 'tr_1', submapId: 'map_old_1' }]
  };
  const testSubmaps = {
    map_old_1: {
      nodes: [{ id: 'n1', childMapId: 'map_old_child' }]
    }
  };
  sandbox.remapEntityCluster(testEntities, testSubmaps, {}, {
    map_old_1: 'map_new_1',
    map_old_child: 'map_new_child'
  });
  assertEqual(testEntities.npcs[0].submapId, 'map_new_1', 'remapEntityCluster remaps NPC submapId on collision');
  assertEqual(testEntities.quests[0].submapId, 'map_new_1', 'remapEntityCluster remaps Quest submapId on collision');
  assertEqual(testEntities.items[0].submapId, 'map_new_1', 'remapEntityCluster remaps Item submapId on collision');
  assertEqual(testEntities.trackers[0].submapId, 'map_new_1', 'remapEntityCluster remaps Tracker submapId on collision');
  assertEqual(testSubmaps.map_old_1.nodes[0].childMapId, 'map_new_child', 'remapEntityCluster remaps submap node childMapId');
}

// ============================================================================
// SUITE 25: EDGE EXPLORER & MULTI-SCALE CONDUIT CATALOG
// ============================================================================
async function testEdgeExplorerAndConduitCatalog() {
  console.log('\n--> SUITE 25: Edge Explorer & Multi-Scale Conduit Catalog (Aggregation, Deduplication, Filters & Mutation Lifecycle)...');

  const emUiPath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_manager_ui.js');
  const emUiCode = fs.readFileSync(emUiPath, 'utf8');

  const crudPath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_crud_dialogs.js');
  const crudCode = fs.readFileSync(crudPath, 'utf8');

  const propGridPath = path.join(ROOT_DIR, 'src/workstation/scripts/property_grid_inspector.js');
  const propGridCode = fs.readFileSync(propGridPath, 'utf8');

  const cadInteractionPath = path.join(ROOT_DIR, 'src/workstation/scripts/cad_interaction.js');
  const cadInteractionCode = fs.readFileSync(cadInteractionPath, 'utf8');

  const mdiPath = path.join(ROOT_DIR, 'src/workstation/scripts/mdi_window_manager.js');
  const mdiCode = fs.readFileSync(mdiPath, 'utf8');

  const templatePath = path.join(ROOT_DIR, 'src/workstation/template.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');

  const modalsPath = path.join(ROOT_DIR, 'src/workstation/modals/entity_modals.html');
  const modalsHtml = fs.readFileSync(modalsPath, 'utf8');

  // 1. Static Contract & Interface Checks
  assert(propGridCode.includes('function renderEdgeProperties'), 'property_grid_inspector.js exports renderEdgeProperties');
  assert(cadInteractionCode.includes('function createEdge'), 'cad_interaction.js exports createEdge');
  assert(cadInteractionCode.includes('function deleteEdge'), 'cad_interaction.js exports deleteEdge');
  assert(cadInteractionCode.includes('pushHistoryState') && cadInteractionCode.includes('Hegemony Vector'), 'cad_interaction.js createEdge calls pushHistoryState before mutation');
  assert((cadInteractionCode.includes('CampaignMutationEngine.removeCorridor') || (cadInteractionCode.includes('delete topo.edgeNotes[edgeKey]') && cadInteractionCode.includes('delete topo.edgeNotes[pairKey]'))), 'cad_interaction.js deleteEdge cleans up edgeNotes for both edgeKey and pairKey');
  assert(mdiCode.includes("e.key === 'F11'") && mdiCode.includes("openEntityManager('edge')"), 'mdi_window_manager.js handles Ctrl+F11 to open Edge Explorer');
  assert(templateHtml.includes("openEntityManager('edge')") && templateHtml.includes('<strong>Edges</strong>'), 'template.html contains menu entries and toolbar button [Edges] (Ctrl+F11)');
  assert(modalsHtml.includes('id="em-tab-edge"') && modalsHtml.includes('id="modal-edge-create"'), 'entity_modals.html contains #em-tab-edge button and #modal-edge-create dialog');
  assert(crudCode.includes('function openCreateEdgeModal') && crudCode.includes('function submitCreateEdgeModal'), 'entity_crud_dialogs.js exports openCreateEdgeModal and submitCreateEdgeModal');
  assert(emUiCode.includes('function escapeHtml'), 'entity_manager_ui.js exports escapeHtml');
  assert(emUiCode.includes('function getEdgeDisplayInfo'), 'entity_manager_ui.js exports getEdgeDisplayInfo');
  assert(emUiCode.includes('function resolveEdgeEndpointsAndMetrics'), 'entity_manager_ui.js exports resolveEdgeEndpointsAndMetrics');
  assert(emUiCode.includes('function getEdgesForMapScope'), 'entity_manager_ui.js exports getEdgesForMapScope');
  assert(emUiCode.includes('function jumpToEdgeMap'), 'entity_manager_ui.js exports jumpToEdgeMap');
  assert(emUiCode.includes('function switchEdgeDetailSubtab'), 'entity_manager_ui.js exports switchEdgeDetailSubtab');
  assert(emUiCode.includes('window.CreatorStudio.edgeClassifications'), 'entity_manager_ui.js exposes window.CreatorStudio.edgeClassifications');

  // 2. Headless VM Functional Tests
  const elements = {};
  function mockEl(id) {
    if (!elements[id]) {
      elements[id] = {
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        children: [],
        options: [],
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); },
          toggle(c, force) { if (force !== undefined) { force ? this.add(c) : this.remove(c); } else { this.contains(c) ? this.remove(c) : this.add(c); } }
        },
        appendChild(c) { this.children.push(c); },
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        removeAttribute: () => {}
      };
    }
    return elements[id];
  }

  let lastAlert = '';
  const historyPushes = [];
  let selectedEntitiesState = [];
  let centeredMidpoint = null;

  const sandbox = {
    console,
    window: {},
    document: {
      getElementById: (id) => mockEl(id),
      createElement: (tag) => mockEl(tag),
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    alert: (msg) => { lastAlert = String(msg); },
    setStatusBarMessage: () => {},
    renderCanvas: () => {},
    saveActiveCampaign: () => {},
    openModal: () => {},
    closeModal: () => {},
    pushHistoryState: (desc) => {
      historyPushes.push({
        desc,
        topo: JSON.parse(JSON.stringify(sandbox.Workstation.activeTopology))
      });
    },
    setSelection: (sel) => { selectedEntitiesState = sel; },
    getSelectedEntities: () => selectedEntitiesState,
    centerOnPoint: (x, y) => { centeredMidpoint = { x, y }; },
    switchActiveMap: async (mapId) => { sandbox.activeMapId = mapId; },
    CurrentEntityTab: 'edge',
    SelectedEntityFilter: 'all',
    CurrentEntitySearch: '',
    CurrentEntityScope: 'active',
    SelectedEntityId: null,
    activeMapId: 'map_root',
    maps: {},
    currentCampaignPackage: { maps: {} },
    Workstation: {
      activeTopology: null,
      state: {}
    },
    CampaignMutationEngine: require(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_mutation_engine.js'))
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);

  // Load scripts into VM
  vm.runInContext(propGridCode, sandbox);
  vm.runInContext(cadInteractionCode, sandbox);
  vm.runInContext(crudCode, sandbox);
  vm.runInContext(emUiCode, sandbox);

  // Set up mock active topology
  const topo = {
    id: 'map_root',
    name: 'Root Map',
    nodes: {
      '1': { id: 1, name: 'Bastion Alpha', x: 100, y: 100, adj: [2], infBy: [] },
      '2': { id: 2, name: 'Outpost Beta', x: 300, y: 100, adj: [1], infBy: [3] },
      '3': { id: 3, name: 'Keep Gamma', x: 200, y: 300, adj: [], infBy: [] }
    },
    edgeData: {
      '1-2': {
        name: 'Pass of Iron',
        conduitType: 'dedicated',
        dedicatedFlows: ['Iron Ore: 15'],
        hazardLevel: 3,
        modules: ['SPARK-01']
      },
      '3->2': {
        name: 'Southern March',
        conduitType: 'none',
        hazardLevel: 0
      }
    },
    edgeNotes: {
      '1-2': 'Underground transit tunnel',
      '3->2': 'Hegemony border watch'
    }
  };
  sandbox.Workstation.activeTopology = topo;
  sandbox.activeTopology = topo;
  sandbox.maps['map_root'] = topo;

  // Set up mock submap with Array nodes schema
  sandbox.maps['submap_dungeon'] = {
    id: 'submap_dungeon',
    name: 'Deep Dungeon',
    nodes: [
      { id: 'd1', name: 'Dungeon Gate', x: 10, y: 10, adj: ['d2'], infBy: [] },
      { id: 'd2', name: 'Crypt', x: 50, y: 50, adj: ['d1'], infBy: [] }
    ],
    edgeData: {
      'd1-d2': { conduitType: 'power', dedicatedFlows: ['Mana: 5'], hazardLevel: 1 }
    },
    edgeNotes: {}
  };

  // Test getEdgesForMapScope('active')
  const activeEdges = sandbox.getEdgesForMapScope('active');
  assertEqual(activeEdges.length, 2, 'getEdgesForMapScope("active") returns exactly 2 edges (1 road, 1 hegemony)');
  
  const roadEdge = activeEdges.find(e => e.edgeType === 'road');
  assert(roadEdge !== undefined, 'Road edge extracted');
  assertEqual(roadEdge.pairKey, '1-2', 'Bidirectional road deduplicated to canonical pairKey "1-2"');
  assertEqual(roadEdge.isDirectional, false, 'Road edge is non-directional (bidirectional transit)');

  const hegemonyEdge = activeEdges.find(e => e.edgeType === 'hegemony');
  assert(hegemonyEdge !== undefined, 'Hegemony edge extracted');
  assertEqual(hegemonyEdge.edgeKey, '3->2', 'Directional hegemony edge has directed key "3->2"');
  assertEqual(hegemonyEdge.uId, 3, 'Hegemony source is node 3');
  assertEqual(hegemonyEdge.vId, 2, 'Hegemony target is node 2');

  // Test getEdgesForMapScope('map:all') with heterogeneous child map (Array nodes)
  const allEdges = sandbox.getEdgesForMapScope('map:all');
  assertEqual(allEdges.length, 3, 'getEdgesForMapScope("map:all") aggregates across maps including array-based submap');
  const submapEdge = allEdges.find(e => e._mapId === 'submap_dungeon');
  assert(submapEdge !== undefined, 'Submap edge extracted');
  assertEqual(submapEdge.pairKey, 'd1-d2', 'Submap edge pairKey is d1-d2');

  // Test resolveEdgeEndpointsAndMetrics
  const resolved = sandbox.resolveEdgeEndpointsAndMetrics(roadEdge, topo);
  assertEqual(resolved.uNode.name, 'Bastion Alpha', 'resolveEdgeEndpointsAndMetrics resolves source node name');
  assertEqual(resolved.vNode.name, 'Outpost Beta', 'resolveEdgeEndpointsAndMetrics resolves target node name');
  assertEqual(resolved.lengthPx, 200, 'resolveEdgeEndpointsAndMetrics computes Euclidean distance (200px)');

  // Test filtering in getEdgesForMapScope
  const roadsOnly = sandbox.getEdgesForMapScope('type:road');
  assertEqual(roadsOnly.length, 1, 'Filter "type:road" returns 1 road');
  assertEqual(roadsOnly[0].pairKey, '1-2', 'Road edge is 1-2');

  const hegemonyOnly = sandbox.getEdgesForMapScope('type:hegemony');
  assertEqual(hegemonyOnly.length, 1, 'Filter "type:hegemony" returns 1 hegemony vector');
  assertEqual(hegemonyOnly[0].edgeKey, '3->2', 'Hegemony edge is 3->2');

  const highHazard = sandbox.getEdgesForMapScope('hazard:high');
  assertEqual(highHazard.length, 1, 'Filter "hazard:high" returns 1 high hazard edge');

  const flowsOnly = sandbox.getEdgesForMapScope('has:flows');
  assertEqual(flowsOnly.length, 1, 'Filter "has:flows" returns 1 edge with dedicated flows');

  const modulesOnly = sandbox.getEdgesForMapScope('has:modules');
  assertEqual(modulesOnly.length, 1, 'Filter "has:modules" returns 1 edge with slotted modules');

  // Test hardened edge display info (ADR 0020 & edge_explorer_endpoint_names_plan)
  assert(typeof sandbox.escapeHtml === 'function', 'escapeHtml exposed in sandbox');
  assertEqual(sandbox.escapeHtml('<script>&"\'</script>'), '&lt;script&gt;&amp;&quot;&#39;&lt;/script&gt;', 'escapeHtml safely escapes special HTML characters');

  // Default / generic name edge
  const defaultRoadEdge = { ...roadEdge, name: 'Corridor 1-2' };
  const infoDefaultRoad = sandbox.getEdgeDisplayInfo(defaultRoadEdge);
  assert(infoDefaultRoad.primaryTitle.includes('Bastion Alpha') && infoDefaultRoad.primaryTitle.includes('Outpost Beta'), 'Default road title contains both endpoint names');
  assert(infoDefaultRoad.primaryTitle.includes('[#1]') && infoDefaultRoad.primaryTitle.includes('[#2]'), 'Default road title preserves node IDs for disambiguation');
  assertEqual(infoDefaultRoad.dirArrow, '⮂', 'Road edge uses bidirectional arrow ⮂');
  assertEqual(infoDefaultRoad.endpointsSubtitle, null, 'Default road title does not duplicate endpoints in subtitle');

  // Author custom name with "Corridor" prefix preserved
  const customNamedEdge = { ...roadEdge, name: 'Corridor of Whispers' };
  const infoCustom = sandbox.getEdgeDisplayInfo(customNamedEdge);
  assertEqual(infoCustom.primaryTitle, 'Corridor of Whispers', 'Author custom name with "Corridor" prefix is preserved');
  assert(infoCustom.endpointsSubtitle !== null, 'Custom named edge includes endpoints in subtitle');
  assert(infoCustom.endpointsSubtitle.includes('[#1] Bastion Alpha') && infoCustom.endpointsSubtitle.includes('[#2] Outpost Beta'), 'Custom named edge endpoints subtitle contains formatted endpoints');

  // Directional hegemony vector display
  const infoHegemony = sandbox.getEdgeDisplayInfo(hegemonyEdge);
  assertEqual(infoHegemony.dirArrow, '➔', 'Hegemony edge uses directional arrow ➔');
  assert(infoHegemony.endpointsText.includes('[#3] Keep Gamma ➔ [#2] Outpost Beta'), 'Hegemony endpoints text formats correctly with directional arrow');
  assertEqual(infoHegemony.primaryTitle, 'Southern March', 'Hegemony custom name retained as primary title');
  assertEqual(infoHegemony.endpointsSubtitle, '[#3] Keep Gamma ➔ [#2] Outpost Beta', 'Hegemony endpoints formatted in subtitle');

  // Test Detail Selection and Subtabs
  sandbox.selectEntityItem('1-2');
  assertEqual(sandbox.SelectedEntityId, '1-2', 'selectEntityItem sets SelectedEntityId to "1-2"');
  assert(mockEl('em-detail-pane').innerHTML.includes('Bastion Alpha') && mockEl('em-detail-pane').innerHTML.includes('Outpost Beta'), 'Detail pane renders corridor endpoints');
  assert(mockEl('em-detail-pane').innerHTML.includes('em-edge-subtab-overview'), 'Detail pane renders telemetry overview subtab button');
  assert(mockEl('em-detail-pane').innerHTML.includes('em-edge-subtab-props'), 'Detail pane renders properties subtab button');

  sandbox.switchEdgeDetailSubtab('props');
  assertEqual(mockEl('em-edge-subtab-props-view').style.display, 'block', 'switchEdgeDetailSubtab switches to properties subtab');
  assertEqual(mockEl('em-edge-subtab-overview-view').style.display, 'none', 'switchEdgeDetailSubtab hides telemetry overview subtab');

  sandbox.switchEdgeDetailSubtab('overview');
  assertEqual(mockEl('em-edge-subtab-overview-view').style.display, 'flex', 'switchEdgeDetailSubtab switches back to telemetry overview subtab');
  assertEqual(mockEl('em-edge-subtab-props-view').style.display, 'none', 'switchEdgeDetailSubtab hides properties subtab');

  // Test CAD Interaction: createEdge & deleteEdge with pushHistoryState
  assertEqual(historyPushes.length, 0, 'History pushes initially empty');
  sandbox.createEdge(1, 3, 'road');
  assertEqual(historyPushes.length, 1, 'createEdge pushes history state before mutation');
  assert(historyPushes[0].desc.includes('1 -> 3'), 'History push description records new edge endpoints');
  assert(!historyPushes[0].topo.nodes['1'].adj.includes(3), 'Pre-mutation snapshot in history does NOT contain new edge');
  assert(sandbox.Workstation.activeTopology.nodes['1'].adj.includes(3), 'activeTopology node 1 adj now contains node 3');
  assert(sandbox.Workstation.activeTopology.nodes['3'].adj.includes(1), 'activeTopology node 3 adj now contains node 1');

  sandbox.deleteEdge(1, 2, 'road');
  assertEqual(historyPushes.length, 2, 'deleteEdge pushes history state before mutation');
  assert(!sandbox.Workstation.activeTopology.nodes['1'].adj.includes(2), 'deleteEdge removes node 2 from node 1 adj');
  assert(!sandbox.Workstation.activeTopology.nodes['2'].adj.includes(1), 'deleteEdge removes node 1 from node 2 adj');
  assert(sandbox.Workstation.activeTopology.edgeData['1-2'] === undefined, 'deleteEdge purges edgeData for severed corridor');
  assert(sandbox.Workstation.activeTopology.edgeNotes['1-2'] === undefined, 'deleteEdge purges edgeNotes for severed corridor');

  // Test Modal Validation: Self-loops & duplicates
  mockEl('edge-create-src').value = '1';
  mockEl('edge-create-tgt').value = '1';
  mockEl('edge-create-type').value = 'road';
  sandbox.submitCreateEdgeModal();
  assert(lastAlert.includes('Cannot create a self-loop'), 'submitCreateEdgeModal prevents self-loops');

  mockEl('edge-create-src').value = '1';
  mockEl('edge-create-tgt').value = '3';
  mockEl('edge-create-type').value = 'road';
  sandbox.submitCreateEdgeModal();
  assert(lastAlert.includes('already exists'), 'submitCreateEdgeModal prevents duplicate road edges');

  // Test jumpToEdgeMap
  let selectedEdgeType = null;
  let selectedEdgeU = null;
  let selectedEdgeV = null;
  sandbox.selectEdge = (type, u, v) => {
    selectedEdgeType = type;
    selectedEdgeU = u;
    selectedEdgeV = v;
  };
  mockEl('canvas-container').clientWidth = 800;
  mockEl('canvas-container').clientHeight = 600;
  sandbox.Workstation.pan = { x: 0, y: 0 };
  sandbox.Workstation.zoom = 1.0;

  await sandbox.jumpToEdgeMap('map_root', '1-3', 1, 3, 'road');
  assertEqual(selectedEdgeType, 'road', 'jumpToEdgeMap invokes selectEdge with edgeType "road"');
  assertEqual(selectedEdgeU, 1, 'jumpToEdgeMap invokes selectEdge with start node 1');
  assertEqual(selectedEdgeV, 3, 'jumpToEdgeMap invokes selectEdge with end node 3');
  assertEqual(sandbox.Workstation.pan.x, 250, 'jumpToEdgeMap centers canvas pan.x at corridor midpoint ( (800/2) - 150 = 250 )');
  assertEqual(sandbox.Workstation.pan.y, 100, 'jumpToEdgeMap centers canvas pan.y at corridor midpoint ( (600/2) - 200 = 100 )');

  // Verify Multi-Scale Corridor Deletion targeting child map
  const submapDungeon = sandbox.maps['submap_dungeon'];
  const initialRootNode1Adj = [...sandbox.Workstation.activeTopology.nodes['1'].adj];
  sandbox.deleteEdge('d1', 'd2', 'road', 'submap_dungeon');
  const dungeonNodeD1 = submapDungeon.nodes.find(n => n.id === 'd1');
  const dungeonNodeD2 = submapDungeon.nodes.find(n => n.id === 'd2');
  assert(!dungeonNodeD1.adj.includes('d2'), 'deleteEdge removes corridor from child map node d1 adj');
  assert(!dungeonNodeD2.adj.includes('d1'), 'deleteEdge removes corridor from child map node d2 adj');
  assertEqual(sandbox.Workstation.activeTopology.nodes['1'].adj, initialRootNode1Adj, 'deleteEdge targeting child map preserves active root map adjacency intact');
}

// ============================================================================
// SUITE 26: MASTER SOCIOLOGICAL REFERENCE HUB & HERMENEUTICS ENGINE (SYS-SOC-01)
// ============================================================================
function testSociologyReferenceHubAndHermeneutics() {
  console.log('\n--> SUITE 26: Master Sociological Reference Hub & Hermeneutics Engine (SYS-SOC-01)...');

  const socDataPath = path.join(ROOT_DIR, 'src/workstation/scripts/sociology_data.js');
  const socDataCode = fs.readFileSync(socDataPath, 'utf8');

  const sandbox = {
    window: {},
    console: console,
    Math: Math
  };
  vm.createContext(sandbox);
  vm.runInContext(socDataCode, sandbox);

  // 1. Assert rollSensoryProfile exists and produces valid 5D profiles
  assert(typeof sandbox.rollSensoryProfile === 'function', 'sociology_data.js exports rollSensoryProfile');
  const sensoryProfile = sandbox.rollSensoryProfile(2, 3, 1);
  assert(sensoryProfile !== null && typeof sensoryProfile === 'object', 'rollSensoryProfile returns object');
  assert(sensoryProfile.behavior && typeof sensoryProfile.behavior.title === 'string', 'Sensory profile includes behavior dimension');
  assert(sensoryProfile.relationship && typeof sensoryProfile.relationship.title === 'string', 'Sensory profile includes relationship dimension');
  assert(sensoryProfile.attitude && typeof sensoryProfile.attitude.title === 'string', 'Sensory profile includes attitude dimension');
  assert(sensoryProfile.value && typeof sensoryProfile.value.title === 'string', 'Sensory profile includes value dimension');
  assert(sensoryProfile.environment && typeof sensoryProfile.environment.title === 'string', 'Sensory profile includes environment dimension');

  // Verify boundary coordinate inputs (1..4)
  for (let s = 1; s <= 4; s++) {
    for (let e = 1; e <= 4; e++) {
      const p = sandbox.rollSensoryProfile(s, e, 2);
      assert(p.behavior && p.relationship && p.attitude && p.value && p.environment, `Sensory profile valid for coordinates S=${s}, E=${e}`);
    }
  }

  // 2. Assert SOC_DIAGNOSTIC_QUESTIONS contains 3 calibrated questions
  const questions = sandbox.window.SOC_DIAGNOSTIC_QUESTIONS || sandbox.SOC_DIAGNOSTIC_QUESTIONS;
  assert(Array.isArray(questions), 'sociology_data.js exports SOC_DIAGNOSTIC_QUESTIONS array');
  assertEqual(questions.length, 3, 'SOC_DIAGNOSTIC_QUESTIONS has exactly 3 trade-off questions');
  const dials = questions.map(q => q.dial);
  assert(dials.includes('s'), 'Diagnostic includes Structure (s) dial question');
  assert(dials.includes('e'), 'Diagnostic includes Energy/Execution (e) dial question');
  assert(dials.includes('c'), 'Diagnostic includes Coordination (c) dial question');
  questions.forEach((q, idx) => {
    assertEqual(q.options.length, 4, `Question ${idx + 1} provides 4 calibrated discrete choices (1..4)`);
    q.options.forEach(opt => {
      assert(opt.val >= 1 && opt.val <= 4, `Option value ${opt.val} clamped to 1..4`);
    });
  });

  // 3. Assert SOC_FACTION_COLORS maps all 4 CVF quadrants
  const factionColors = sandbox.window.SOC_FACTION_COLORS || sandbox.SOC_FACTION_COLORS;
  assert(factionColors !== undefined, 'sociology_data.js exports SOC_FACTION_COLORS');
  const quadrants = ['Clan', 'Adhocracy', 'Market', 'Hierarchy'];
  quadrants.forEach(q => {
    assert(factionColors[q] !== undefined, `SOC_FACTION_COLORS includes ${q}`);
    assert(typeof factionColors[q].mtgColor === 'string', `${q} has MTG color alignment`);
    assert(typeof factionColors[q].hex === 'string', `${q} has hex color`);
  });

  // 4. Verify network/odv_archetype_matrix.html contains 6-tab Master Reference Hub
  const matrixHtmlPath = path.join(ROOT_DIR, 'network/odv_archetype_matrix.html');
  const matrixHtml = fs.readFileSync(matrixHtmlPath, 'utf8');
  assert(matrixHtml.includes('id="master-reference-hub-section"'), 'odv_archetype_matrix.html contains #master-reference-hub-section');
  const hubTabIds = ['tab-btn-scales', 'tab-btn-levers', 'tab-btn-crisis', 'tab-btn-sensory', 'tab-btn-factions', 'tab-btn-tree'];
  hubTabIds.forEach((tabId, idx) => {
    assert(matrixHtml.includes(`id="${tabId}"`), `odv_archetype_matrix.html contains Reference Hub Tab ${idx + 1} (${tabId})`);
  });
}

// ============================================================================
// SUITE 27: FIRST-CLASS FACTIONS ENTITY ENGINE & ENGINE UNIFICATION (ADR 0021)
// ============================================================================
function testFirstClassFactionsEntityEngine() {
  console.log('\n--> SUITE 27: First-Class Factions Entity Engine & Engine Unification (ADR 0021)...');

  const statePath = path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js');
  const entityCorePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js');
  const stateAdapterPath = path.join(ROOT_DIR, 'src/workstation/scripts/state_adapter.js');
  const cascadePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_cascade_delete.js');
  const selectiveImporterPath = path.join(ROOT_DIR, 'src/workstation/scripts/selective_importer.js');
  const packEnginePath = path.join(ROOT_DIR, 'src/workstation/scripts/pack_engine.js');

  const stateCode = fs.readFileSync(statePath, 'utf8');
  const entityCoreCode = fs.readFileSync(entityCorePath, 'utf8');
  const stateAdapterCode = fs.readFileSync(stateAdapterPath, 'utf8');
  const cascadeCode = fs.readFileSync(cascadePath, 'utf8');
  const selectiveImporterCode = fs.readFileSync(selectiveImporterPath, 'utf8');
  const packEngineCode = fs.readFileSync(packEnginePath, 'utf8');

  // 1. Prototype Seeding & Collection Lifecycle
  const sandbox = {
    window: {},
    document: {
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {}
    },
    addEventListener: () => {},
    console,
    Math,
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; }
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  vm.runInContext(stateCode, sandbox);
  vm.runInContext(entityCoreCode, sandbox);
  injectEngine(sandbox);
  vm.runInContext(cascadeCode, sandbox);

  sandbox.Workstation.activeTopology = {
    id: 'map_root',
    nodes: {
      '1': { id: 1, name: 'Bastion of the Sun' },
      '2': { id: 2, name: 'Sylvan Grove' }
    },
    npcs: [
      { id: 'npc_commander', name: 'Commander Valen', factionId: 'fac_solar_covenant' }
    ],
    quests: [],
    items: [],
    trackers: [],
    tickets: [],
    factions: [
      {
        id: 'fac_solar_covenant',
        name: 'The Solar Covenant',
        cvfQuadrant: 'Hierarchy',
        colorIdentity: 'W',
        leaderNpcId: 'npc_commander',
        headquartersNodeId: 1,
        controlledNodeIds: [1, 2],
        diplomaticStances: {
          'fac_shadow_enclave': 'Hostile'
        },
        disposition: [3, 2, 3],
        description: 'Order of sun-paladins defending civilization.'
      },
      {
        id: 'fac_shadow_enclave',
        name: 'The Shadow Enclave',
        cvfQuadrant: 'Market',
        colorIdentity: 'B',
        leaderNpcId: null,
        headquartersNodeId: 2,
        controlledNodeIds: [2],
        diplomaticStances: {
          'fac_solar_covenant': 'Hostile'
        },
        disposition: [2, 3, 2],
        description: 'Syndicate of subterranean relic merchants.'
      }
    ]
  };

  // Assert seed prototypes exist
  const protos = sandbox.MODULE_ENTITY_PROTOTYPES || (sandbox.window && sandbox.window.MODULE_ENTITY_PROTOTYPES);
  assert(protos && Array.isArray(protos.factions), 'MODULE_ENTITY_PROTOTYPES defines factions array');
  assert(protos.factions.length >= 2, 'MODULE_ENTITY_PROTOTYPES has at least 2 seed factions');
  const covProto = protos.factions.find(f => f.id === 'PROTO-FAC-COVENANT');
  assert(covProto && covProto.cvfQuadrant === 'Hierarchy', 'Seed faction PROTO-FAC-COVENANT has Hierarchy quadrant');
  assert(covProto && covProto.colorIdentity === 'W', 'Seed faction PROTO-FAC-COVENANT has Color Identity W');

  // Assert getPrototypesForType & getActiveEntityList
  const factionProtos = sandbox.getPrototypesForType('faction');
  assert(Array.isArray(factionProtos) && factionProtos.length >= 2, 'getPrototypesForType(faction) returns prototypes');
  const activeFactions = sandbox.getActiveEntityList('faction');
  assert(Array.isArray(activeFactions) && activeFactions.length === 2, 'getActiveEntityList(faction) returns active factions');

  // 2. Backward Compatibility with getCampaignFactionSuggestions & registerCampaignFaction
  const suggestions = sandbox.getCampaignFactionSuggestions();
  assert(suggestions.includes('The Solar Covenant'), 'getCampaignFactionSuggestions includes active topology faction');
  assert(suggestions.includes('The Shadow Enclave'), 'getCampaignFactionSuggestions includes second active topology faction');

  sandbox.registerCampaignFaction('Obsidian Vanguard');
  const updatedSuggestions = sandbox.getCampaignFactionSuggestions();
  assert(updatedSuggestions.includes('Obsidian Vanguard'), 'registerCampaignFaction registers new faction in suggestions pool');
  const regFaction = sandbox.Workstation.activeTopology.factions.find(f => f.name === 'Obsidian Vanguard');
  assert(regFaction !== undefined, 'registerCampaignFaction adds first-class faction to Workstation.activeTopology.factions');
  assert(Array.isArray(sandbox.campaignFactions) && sandbox.campaignFactions.some(f => f.name === 'Obsidian Vanguard'), 'registerCampaignFaction maintains campaignFactions backward compatibility');

  // 3. Relational Cascade Deletion
  // Case A: Delete Leader NPC -> clears faction.leaderNpcId
  const allToDeleteA = [{ type: 'npc', id: 'npc_commander' }];
  sandbox.executeEntityDeletion(allToDeleteA);
  const covenantAfterNpcDel = sandbox.Workstation.activeTopology.factions.find(f => f.id === 'fac_solar_covenant');
  assertEqual(covenantAfterNpcDel.leaderNpcId, null, 'Deleting leader NPC sets faction.leaderNpcId to null');

  // Case B: Delete HQ Node -> clears faction.headquartersNodeId and removes from controlledNodeIds
  const allToDeleteB = [{ type: 'node', id: 1 }];
  sandbox.executeEntityDeletion(allToDeleteB);
  assertEqual(covenantAfterNpcDel.headquartersNodeId, null, 'Deleting HQ node sets faction.headquartersNodeId to null');
  assert(!covenantAfterNpcDel.controlledNodeIds.includes(1), 'Deleting node removes it from faction.controlledNodeIds');

  // Case C: Delete Faction -> cleans npc.factionId and survivor diplomatic stances
  sandbox.Workstation.activeTopology.npcs.push({ id: 'npc_shadow_broker', name: 'Broker', factionId: 'fac_shadow_enclave' });
  const allToDeleteC = [{ type: 'faction', id: 'fac_shadow_enclave' }];
  sandbox.executeEntityDeletion(allToDeleteC);
  const remainingFactions = sandbox.Workstation.activeTopology.factions;
  assert(!remainingFactions.some(f => f.id === 'fac_shadow_enclave'), 'Faction fac_shadow_enclave purged from active factions');
  const shadowBroker = sandbox.Workstation.activeTopology.npcs.find(n => n.id === 'npc_shadow_broker');
  assertEqual(shadowBroker.factionId, null, 'Deleting faction sets npc.factionId to null');
  assert(covenantAfterNpcDel.diplomaticStances['fac_shadow_enclave'] === undefined, 'Deleting faction purges diplomatic stance in surviving factions');

  // 4. Map Switch Persistence via cachedEntities
  assert(stateAdapterCode.includes('factions: (isPackageLoad && targetEntities)'), 'state_adapter.js caches factions during switchActiveMap()');
  assert(stateAdapterCode.includes('Workstation.activeTopology.factions = cachedEntities.factions'), 'state_adapter.js restores factions onto activeTopology');

  // 5. Pack Engine & remapEntityCluster
  const remapEntities = {
    npcs: [
      { id: 'npc_scout', name: 'Scout', factionId: 'old_fac_1' }
    ],
    factions: [
      {
        id: 'old_fac_1',
        name: 'The Rangers',
        leaderNpcId: 'old_npc_leader',
        diplomaticStances: {
          'old_fac_2': 'Allied'
        }
      }
    ]
  };
  const entityIdMap = {
    'old_fac_1': 'new_fac_1',
    'old_fac_2': 'new_fac_2',
    'old_npc_leader': 'new_npc_leader'
  };

  const packSandbox = {
    window: {},
    console
  };
  packSandbox.window = packSandbox;
  vm.createContext(packSandbox);
  vm.runInContext(packEngineCode, packSandbox);

  packSandbox.remapEntityCluster(remapEntities, {}, entityIdMap, {});
  assertEqual(remapEntities.npcs[0].factionId, 'new_fac_1', 'remapEntityCluster remaps npc.factionId');
  assertEqual(remapEntities.factions[0].leaderNpcId, 'new_npc_leader', 'remapEntityCluster remaps faction.leaderNpcId');
  assertEqual(remapEntities.factions[0].diplomaticStances['new_fac_2'], 'Allied', 'remapEntityCluster remaps diplomatic stance keys');
}

// ============================================================================
// SUITE 28: NPC SOCIAL WEB & RELATIONAL GRAPH (ADR 0021)
// ============================================================================
function testNpcSocialWebAndRelationalGraph() {
  console.log('\n--> SUITE 28: NPC Social Web & Relational Graph (ADR 0021)...');

  const statePath = path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js');
  const entityCorePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js');
  const cascadePath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_cascade_delete.js');
  const socialGraphPath = path.join(ROOT_DIR, 'src/workstation/scripts/social_graph_renderer.js');

  const stateCode = fs.readFileSync(statePath, 'utf8');
  const entityCoreCode = fs.readFileSync(entityCorePath, 'utf8');
  const cascadeCode = fs.readFileSync(cascadePath, 'utf8');
  const socialGraphCode = fs.readFileSync(socialGraphPath, 'utf8');

  const sandbox = {
    window: {},
    document: {
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {}
    },
    addEventListener: () => {},
    console,
    Math,
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; }
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  vm.runInContext(stateCode, sandbox);
  vm.runInContext(entityCoreCode, sandbox);
  injectEngine(sandbox);
  vm.runInContext(cascadeCode, sandbox);
  vm.runInContext(socialGraphCode, sandbox);

  // Setup active topology with NPCs across multiple factions
  sandbox.Workstation.activeTopology = {
    id: 'map_root',
    nodes: {
      '1': { id: 1, name: 'The Citadel' },
      '2': { id: 2, name: 'The Under-Bazaar' }
    },
    npcs: [
      { id: 'npc_archon', name: 'Archon Malakar', role: 'High Inquisitor', factionId: 'fac_hierarchy' },
      { id: 'npc_captain', name: 'Captain Mara', role: 'Guard Captain', factionId: 'fac_hierarchy' },
      { id: 'npc_smuggler', name: 'Corin the Sly', role: 'Shadow Merchant', factionId: 'fac_market' },
      { id: 'npc_sage', name: 'Elder Althea', role: 'Archivist', factionId: 'fac_clan' }
    ],
    factions: [
      { id: 'fac_hierarchy', name: 'Iron Ascendancy', cvfQuadrant: 'Hierarchy' },
      { id: 'fac_market', name: 'Gilded Consortium', cvfQuadrant: 'Market' },
      { id: 'fac_clan', name: 'Kindred of the Oak', cvfQuadrant: 'Clan' }
    ]
  };

  // 1. INVERSE_RELATIONSHIPS semantic mapping
  assert(sandbox.INVERSE_RELATIONSHIPS !== undefined, 'entity_core exports INVERSE_RELATIONSHIPS');
  assertEqual(sandbox.INVERSE_RELATIONSHIPS['Superior'], 'Subordinate', 'Inverse of Superior is Subordinate');
  assertEqual(sandbox.INVERSE_RELATIONSHIPS['Subordinate'], 'Superior', 'Inverse of Subordinate is Superior');
  assertEqual(sandbox.INVERSE_RELATIONSHIPS['Ally'], 'Ally', 'Inverse of Ally is Ally');
  assertEqual(sandbox.INVERSE_RELATIONSHIPS['Rival'], 'Rival', 'Inverse of Rival is Rival');
  assertEqual(sandbox.INVERSE_RELATIONSHIPS['Debtor'], 'Creditor', 'Inverse of Debtor is Creditor');
  assertEqual(sandbox.INVERSE_RELATIONSHIPS['Informant'], 'Handler', 'Inverse of Informant is Handler');

  // 2. addNpcRelationship & sentiment clamping
  // Test invalid / self-referential
  assert(!sandbox.addNpcRelationship('npc_archon', 'npc_archon', 'Ally', 50, '', false), 'Self-referential relationship rejected');
  assert(!sandbox.addNpcRelationship('', 'npc_captain', 'Ally', 50, '', false), 'Empty source ID rejected');

  // Test adding directional tie with sentiment clamping
  sandbox.addNpcRelationship('npc_archon', 'npc_captain', 'Superior', 250, 'Commands the city guard', true);
  const archon = sandbox.Workstation.activeTopology.npcs.find(n => n.id === 'npc_archon');
  const captain = sandbox.Workstation.activeTopology.npcs.find(n => n.id === 'npc_captain');

  assert(Array.isArray(archon.relationships) && archon.relationships.length === 1, 'Archon has 1 relationship');
  assertEqual(archon.relationships[0].targetNpcId, 'npc_captain', 'Target ID is string npc_captain');
  assertEqual(archon.relationships[0].relationshipType, 'Superior', 'Relationship type is Superior');
  assertEqual(archon.relationships[0].sentiment, 100, 'Sentiment clamped from 250 to 100');
  assertEqual(archon.relationships[0].notes, 'Commands the city guard', 'Notes preserved');

  // Reciprocal tie check on Captain
  assert(Array.isArray(captain.relationships) && captain.relationships.length === 1, 'Captain received reciprocal tie');
  assertEqual(captain.relationships[0].targetNpcId, 'npc_archon', 'Reciprocal target is npc_archon');
  assertEqual(captain.relationships[0].relationshipType, 'Subordinate', 'Reciprocal type inverted to Subordinate');
  assertEqual(captain.relationships[0].sentiment, 100, 'Reciprocal sentiment matches');

  // Test negative sentiment clamping (-200 -> -100) and Informant/Handler
  sandbox.addNpcRelationship('npc_smuggler', 'npc_archon', 'Informant', -200, 'Blackmailed into feeding intel', true);
  const smuggler = sandbox.Workstation.activeTopology.npcs.find(n => n.id === 'npc_smuggler');
  const archonRels = archon.relationships;
  assertEqual(smuggler.relationships[0].sentiment, -100, 'Negative sentiment clamped to -100');
  assertEqual(smuggler.relationships[0].relationshipType, 'Informant', 'Smuggler is Informant');
  const archonHandlerRel = archonRels.find(r => r.targetNpcId === 'npc_smuggler');
  assert(archonHandlerRel !== undefined, 'Archon has reciprocal tie from smuggler');
  assertEqual(archonHandlerRel.relationshipType, 'Handler', 'Archon is Handler of Informant');

  // Test updating relationship in place
  sandbox.addNpcRelationship('npc_smuggler', 'npc_archon', 'Informant', -60, 'Reduced pressure after debt payment', false);
  assertEqual(smuggler.relationships.length, 1, 'Updating existing relationship does not duplicate');
  assertEqual(smuggler.relationships[0].sentiment, -60, 'Updated sentiment to -60');

  // 3. removeNpcRelationship
  sandbox.removeNpcRelationship('npc_archon', 'npc_smuggler', true);
  assert(!archon.relationships.some(r => r.targetNpcId === 'npc_smuggler'), 'Relationship removed from Archon');
  assert(!smuggler.relationships.some(r => r.targetNpcId === 'npc_archon'), 'Reciprocal relationship removed from Smuggler');

  // 4. Cascade Deletion purges relationships across surviving NPCs
  // Restore tie
  sandbox.addNpcRelationship('npc_captain', 'npc_smuggler', 'Rival', -50, 'Frequent skirmishes in the market', true);
  assert(captain.relationships.some(r => r.targetNpcId === 'npc_smuggler'), 'Captain has tie to Smuggler');

  // Delete smuggler
  sandbox.executeEntityDeletion([{ type: 'npc', id: 'npc_smuggler' }]);
  assert(!sandbox.Workstation.activeTopology.npcs.some(n => n.id === 'npc_smuggler'), 'Smuggler deleted from topology');
  assert(!captain.relationships.some(r => r.targetNpcId === 'npc_smuggler'), 'Cascade deletion cleanly purged smuggler tie from Captain');

  // 5. Deterministic 2D SVG Layout Engine (generateSocialGraphSvg)
  const svgGlobal = sandbox.generateSocialGraphSvg(sandbox.Workstation.activeTopology, { connectedOnly: false });
  assert(svgGlobal.includes('<svg'), 'Global SVG output contains <svg tag');
  assert(svgGlobal.includes('Archon Malakar'), 'Global SVG includes Archon Malakar');
  assert(svgGlobal.includes('Captain Mara'), 'Global SVG includes Captain Mara');
  assert(!svgGlobal.includes('NaN'), 'Global SVG output contains 0 occurrences of NaN');
  assert(!svgGlobal.includes('Infinity'), 'Global SVG output contains 0 occurrences of Infinity');

  // Focus mode SVG
  const svgFocus = sandbox.generateSocialGraphSvg(sandbox.Workstation.activeTopology, { focusNpcId: 'npc_archon', connectedOnly: true });
  assert(svgFocus.includes('<svg'), 'Focus mode SVG output contains <svg tag');
  assert(svgFocus.includes('1st-Degree Social Circle'), 'Focus mode SVG includes 1st-degree circle');
  assert(!svgFocus.includes('NaN'), 'Focus mode SVG output contains 0 occurrences of NaN');
  assert(!svgFocus.includes('Infinity'), 'Focus mode SVG output contains 0 occurrences of Infinity');

  // Edge cases: empty topology and single-character topology
  const emptySvg = sandbox.generateSocialGraphSvg({ npcs: [] });
  assert(emptySvg.includes('<svg') && !emptySvg.includes('NaN'), 'Empty roster generates safe SVG without NaN');

  const singleSvg = sandbox.generateSocialGraphSvg({ npcs: [{ id: 'lone_wolf', name: 'Lone Wolf' }] });
  assert(singleSvg.includes('<svg') && !singleSvg.includes('NaN'), 'Single character generates safe SVG without NaN');

  // 6. Interactive Edge Selection & Viewport Zoom / Extents (Ticket 3)
  sandbox.addNpcRelationship('npc_archon', 'npc_captain', 'Superior', 80, 'Commander and Captain', true);

  const svgSelected = sandbox.generateSocialGraphSvg(sandbox.Workstation.activeTopology, {
    selectedEdge: { sourceId: 'npc_archon', targetId: 'npc_captain' },
    connectedOnly: false
  });
  assert(svgSelected.includes('sg-edge-hitbox'), 'SVG renders transparent clickable edge hitboxes');
  assert(svgSelected.includes('sg-edge-halo'), 'SVG renders under-glow halo for selected edge');
  assert(svgSelected.includes('sg-edge selected'), 'Selected edge has .selected class applied');

  sandbox.setSocialGraphViewBox({ x: -450, y: -320, w: 900, h: 640 });
  sandbox.socialGraphZoomIn(0.5);
  const vbIn = sandbox.getSocialGraphViewBox();
  assert(vbIn.w < 900 && vbIn.h < 640, 'socialGraphZoomIn shrinks viewBox dimensions');

  sandbox.socialGraphZoomOut(2.0);
  const vbOut = sandbox.getSocialGraphViewBox();
  assert(vbOut.w > vbIn.w && vbOut.h > vbIn.h, 'socialGraphZoomOut expands viewBox dimensions');

  sandbox.socialGraphZoomExtents();
  const vbExtents = sandbox.getSocialGraphViewBox();
  assert(typeof vbExtents.x === 'number' && typeof vbExtents.w === 'number', 'socialGraphZoomExtents calculates numeric coordinates');
  assert(!isNaN(vbExtents.x) && !isNaN(vbExtents.w) && isFinite(vbExtents.w), 'socialGraphZoomExtents produces finite non-NaN dimensions');

  sandbox.handleSocialGraphEdgeClick('npc_archon', 'npc_captain');
  assertEqual(sandbox.getActiveSocialGraphEdge().sourceId, 'npc_archon', 'Active selected edge sourceId tracked');
  assertEqual(sandbox.getActiveSocialGraphEdge().targetId, 'npc_captain', 'Active selected edge targetId tracked');

  sandbox.clearSelectedEdge();
  assertEqual(sandbox.getActiveSocialGraphEdge(), null, 'clearSelectedEdge resets selection to null');
}

// SUITE 29: LOCATION NAMES IN STATIONED NODE COLUMN ACROSS ENTITY EXPLORER
function testLocationNamesInStationedNodeColumns() {
  console.log('\n--> SUITE 29: Location Names in Stationed Node Column across Entity Explorer...');

  const entityUiPath = path.join(ROOT_DIR, 'src/workstation/scripts/entity_manager_ui.js');
  const entityUiCode = fs.readFileSync(entityUiPath, 'utf8');

  const elements = {};
  function mockEl(id) {
    if (!elements[id]) {
      const el = {
        id,
        _innerHTML: '',
        textContent: '',
        children: [],
        value: '',
        className: '',
        classList: { add: function(c) { this[c] = true; }, remove: function(c) { delete this[c]; }, contains: function(c) { return !!this[c]; } },
        appendChild: function(c) { this.children.push(c); },
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        removeAttribute: () => {},
        style: {}
      };
      Object.defineProperty(el, 'innerHTML', {
        get() { return this._innerHTML; },
        set(v) {
          this._innerHTML = v;
          if (v === '') this.children = [];
        }
      });
      elements[id] = el;
    }
    return elements[id];
  }

  const mockTopo = {
    id: 'map_root',
    name: 'Emerald Isle',
    nodes: {
      '5': { id: 5, name: "Alyssa the Bard's Encampment", tier: 2, culture: 'Adhocracy' },
      '26': { id: 26, name: "The Dragon's Lair", tier: 2, culture: 'Clan' },
      '30': { id: 30, name: "Brent Fillant's Ledge", tier: 2, culture: 'Clan' },
      '99': { id: 99, name: "Node 99", tier: 2, culture: 'Hierarchy' },
      '100': { id: 100, name: "Node 100: Mountain Keep", tier: 2, culture: 'Hierarchy' }
    },
    npcs: [
      { id: 'npc_alyssa', name: 'Alyssa the Bard', nodeId: 5, role: 'Musician' },
      { id: 'npc_dragon', name: 'Morcarack the Pitiless', nodeId: 26, role: 'Apex Dragon' },
      { id: 'npc_brent', name: 'Brent Fillant', nodeId: 30, role: 'Noble' }
    ],
    items: [
      { id: 'itm_lute', name: "Alyssa's Rosewood Lute", ownerNpcId: 'npc_alyssa', possessionMode: 'carried', nodeId: null, category: 'Tool' },
      { id: 'itm_bow', name: 'Cavern Yew Longbow', ownerNpcId: 'npc_dragon', possessionMode: 'stored', nodeId: 26, category: 'Weapon' },
      { id: 'itm_unassigned', name: 'Rusted Key', ownerNpcId: null, possessionMode: 'stored', nodeId: null, category: 'Key' }
    ],
    quests: [
      { id: 'qst_dragon', title: 'The Dragon Hunt', nodeId: 26, threat: 'High' }
    ],
    trackers: [
      { id: 'trk_dragon_slumber', name: "Morcarack's Slumber", nodeId: 26, currentTicks: 1, maxTicks: 4 }
    ],
    factions: [
      { id: 'fac_clans', name: 'Dragon Cultists', headquartersNodeId: 26, controlledNodeIds: [26, 30], cvfQuadrant: 'Clan', colorIdentity: 'R' }
    ]
  };

  const mockMaps = {
    'map_root': mockTopo,
    'map_sub1': {
      id: 'map_sub1',
      name: 'Sunken Caverns',
      nodes: [
        { id: 201, name: 'Crystal Chamber', tier: 1 }
      ]
    }
  };

  const sandbox = {
    console: console,
    Workstation: {
      activeTopology: mockTopo,
      registeredMods: {}
    },
    maps: mockMaps,
    activeMapId: 'map_root',
    document: {
      getElementById: (id) => mockEl(id),
      createElement: (tag) => ({
        tagName: tag,
        innerHTML: '',
        textContent: '',
        children: [],
        value: '',
        className: '',
        classList: { add: function(c) { this[c] = true; }, remove: function(c) { delete this[c]; }, contains: function(c) { return !!this[c]; } },
        appendChild: function(c) { this.children.push(c); },
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        removeAttribute: () => {},
        style: {}
      }),
      querySelectorAll: () => []
    },
    window: {},
    CurrentEntityTab: 'npc',
    SelectedEntityFilter: 'all',
    SelectedEntityId: null,
    MODULE_ENTITY_PROTOTYPES: { npcs: [], quests: [], items: [], trackers: [], factions: [] },
    ALL_MODULES: [],
    getActiveEntityList: function(type) {
      if (type === 'npc') return mockTopo.npcs || [];
      if (type === 'quest') return mockTopo.quests || [];
      if (type === 'item') return mockTopo.items || [];
      if (type === 'tracker') return mockTopo.trackers || [];
      if (type === 'faction') return mockTopo.factions || [];
      return [];
    },
    getPrototypesForType: function(type) {
      return [];
    },
    getItemEffectiveNodeId: function(item) {
      if (!item) return null;
      if (item.possessionMode === 'carried' && item.ownerNpcId) {
        const owner = (mockTopo.npcs || []).find(n => String(n.id) === String(item.ownerNpcId));
        if (owner && owner.nodeId != null) return owner.nodeId;
      }
      return item.nodeId != null ? item.nodeId : null;
    }
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(entityUiCode, sandbox);

  // 1. Verify formatNodeRef unit tests
  assert(typeof sandbox.formatNodeRef === 'function', 'formatNodeRef is exported on window');
  assert(sandbox.formatNodeRef(26) === "Node 26: The Dragon's Lair", `formatNodeRef(26) formats "Node 26: The Dragon's Lair" (Got: "${sandbox.formatNodeRef(26)}")`);
  assert(sandbox.formatNodeRef('26') === "Node 26: The Dragon's Lair", `formatNodeRef('26') handles string ID`);
  assert(sandbox.formatNodeRef('Node 26') === "Node 26: The Dragon's Lair", `formatNodeRef('Node 26') handles prefixed input`);
  assert(sandbox.formatNodeRef(100) === "Node 100: Mountain Keep", `formatNodeRef does not duplicate "Node 100:" prefix (Got: "${sandbox.formatNodeRef(100)}")`);
  assert(sandbox.formatNodeRef(99) === "Node 99", `formatNodeRef returns "Node 99" when node has default name (Got: "${sandbox.formatNodeRef(99)}")`);
  assert(sandbox.formatNodeRef(999) === "Node 999", `formatNodeRef returns "Node 999" when node does not exist`);
  assert(sandbox.formatNodeRef(null) === "(Unassigned)", `formatNodeRef(null) returns "(Unassigned)"`);
  assert(sandbox.formatNodeRef('') === "(Unassigned)", `formatNodeRef('') returns "(Unassigned)"`);
  assert(sandbox.formatNodeRef(201) === "Node 201: Crystal Chamber", `formatNodeRef resolves multi-scale submap node 201 (Got: "${sandbox.formatNodeRef(201)}")`);

  // 2. Verify List Table Rendering across entity types
  // Tab: NPC
  sandbox.CurrentEntityTab = 'npc';
  sandbox.SelectedEntityFilter = 'all';
  sandbox.renderEntityManagerList();
  const npcTbody = mockEl('em-table-body');
  assert(npcTbody.children.length === 3, 'Renders 3 NPCs in list table');
  const dragonNpcRow = npcTbody.children.find(r => r.innerHTML.includes('Morcarack the Pitiless'));
  assert(dragonNpcRow && dragonNpcRow.innerHTML.includes("Node 26: The Dragon's Lair"), `NPC row displays "Node 26: The Dragon's Lair" in Stationed Node column`);

  // Tab: Item
  sandbox.CurrentEntityTab = 'item';
  sandbox.SelectedEntityFilter = 'all';
  sandbox.renderEntityManagerList();
  const itmTbody = mockEl('em-table-body');
  assert(itmTbody.children.length === 3, 'Renders 3 items in list table');
  const storedItemRow = itmTbody.children.find(r => r.innerHTML.includes('Cavern Yew Longbow'));
  assert(storedItemRow && storedItemRow.innerHTML.includes("Node 26: The Dragon's Lair"), `Stored item displays "Node 26: The Dragon's Lair" in Stationed Node column`);
  const carriedItemRow = itmTbody.children.find(r => r.innerHTML.includes("Alyssa's Rosewood Lute"));
  assert(carriedItemRow && carriedItemRow.innerHTML.includes("Node 5: Alyssa the Bard's Encampment") && carriedItemRow.innerHTML.includes('(Carried)'), `Carried item displays "Node 5: Alyssa the Bard's Encampment (Carried)"`);
  const unassignedItemRow = itmTbody.children.find(r => r.innerHTML.includes('Rusted Key'));
  assert(unassignedItemRow && unassignedItemRow.innerHTML.includes('(Unassigned)'), `Unassigned item displays "(Unassigned)"`);

  // Tab: Quest
  sandbox.CurrentEntityTab = 'quest';
  sandbox.SelectedEntityFilter = 'all';
  sandbox.renderEntityManagerList();
  const qstTbody = mockEl('em-table-body');
  const questRow = qstTbody.children.find(r => r.innerHTML.includes('The Dragon Hunt'));
  assert(questRow && questRow.innerHTML.includes("Node 26: The Dragon's Lair"), `Quest row displays "Node 26: The Dragon's Lair" in Stationed Node column`);

  // Tab: Tracker
  sandbox.CurrentEntityTab = 'tracker';
  sandbox.SelectedEntityFilter = 'all';
  sandbox.renderEntityManagerList();
  const trkTbody = mockEl('em-table-body');
  const clockRow = trkTbody.children.find(r => r.innerHTML.includes("Morcarack's Slumber"));
  assert(clockRow && clockRow.innerHTML.includes("Node 26: The Dragon's Lair"), `Clock row displays "Node 26: The Dragon's Lair" in Stationed Node column`);

  // Tab: Faction
  sandbox.CurrentEntityTab = 'faction';
  sandbox.SelectedEntityFilter = 'all';
  sandbox.renderEntityManagerList();
  const facTbody = mockEl('em-table-body');
  const facRow = facTbody.children.find(r => r.innerHTML.includes('Dragon Cultists'));
  assert(facRow && facRow.innerHTML.includes("Node 26: The Dragon's Lair"), `Faction row displays "Node 26: The Dragon's Lair" for Headquarters column`);

  // 3. Search filter by location name
  sandbox.CurrentEntityTab = 'item';
  const searchInput = mockEl('em-search-input');
  searchInput.value = 'dragon';
  sandbox.renderEntityManagerList();
  const filteredTbody = mockEl('em-table-body');
  assert(filteredTbody.children.length === 1 && filteredTbody.children[0].innerHTML.includes('Cavern Yew Longbow'), `Searching "dragon" matches item stationed at "The Dragon's Lair"`);
  searchInput.value = '';

  // 4. Tree counts for items include carried items
  sandbox.CurrentEntityTab = 'item';
  const treeContainer = mockEl('em-tree-container');
  sandbox.renderEntityManagerTree();
  const treeItems = treeContainer.children;
  const alyssaTreeItem = treeItems.find(t => t.textContent.includes("Alyssa the Bard's Encampment"));
  assert(alyssaTreeItem && alyssaTreeItem.textContent.includes('(1)'), `Tree reflects carried item count for Alyssa's Encampment`);
}

// ============================================================================
// SUITE 30: TICKET CENTER UPGRADES (DEV TICKETS, DYNAMIC CATEGORIES, STATUS)
// ============================================================================
function testTicketCenterEnhancements() {
  console.log('\n--> SUITE 30: Ticket Center Upgrades (Dev Tickets, Dynamic Categories, Done Actions)...');

  const ticketCenterCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/ticket_center.js'), 'utf8');
  const mockDoms = {};
  function makeMockEl(tag = 'div') {
    return {
      tagName: tag.toUpperCase(),
      children: [],
      classList: {
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); },
        _classes: new Set()
      },
      style: {},
      value: '',
      textContent: '',
      innerHTML: '',
      appendChild: function(child) { this.children.push(child); },
      querySelectorAll: function() { return []; },
      querySelector: function() { return null; }
    };
  }

  function mockEl(id, tag = 'div') {
    if (!mockDoms[id]) {
      mockDoms[id] = makeMockEl(tag);
      mockDoms[id].id = id;
    }
    return mockDoms[id];
  }

  const sandbox = {
    window: {},
    document: {
      getElementById: (id) => mockEl(id),
      createElement: (tag) => makeMockEl(tag)
    },
    Workstation: {
      activeTopology: {
        nodes: {
          '1': { id: '1', name: "River Gate" },
          '2': { id: '2', name: "Sunken Watchtower" }
        },
        tickets: [
          { id: 'CAMP-01', title: 'Saltworks Strike', category: 'shopkeeper inventory', status: 'shipped', tier: 2 },
          { id: 'CAMP-02', title: 'Alchemical Leak', category: 'Tier 3: Apex Hazard Engine', status: 'ready_for_authoring', tier: 3 }
        ]
      }
    },
    MASTER_TICKETS_DATA: [
      { id: 'SYS-START-10', title: 'CAD History Engine', category: 'system_architecture', status: 'shipped', track: 'Platform Architecture (SYS)' }
    ],
    formatNodeRef: (nid, topo) => `Node ${nid}: ${(topo.nodes[nid] && topo.nodes[nid].name) || ''}`,
    saveActiveCampaign: () => {},
    setStatusBarMessage: () => {},
    openModal: () => {},
    closeModal: () => {},
    MDIWindowManager: { open: () => {}, close: () => {} },
    console
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(ticketCenterCode, sandbox);

  // 1. Datalist categories harvest dynamic ticket categories
  const categories = sandbox.getKnownTicketCategories();
  assert(Array.isArray(categories) && categories.includes('shopkeeper inventory'), 'getKnownTicketCategories harvests custom categories from active tickets');
  assert(categories.includes('Tier 2: Settlement & Biome'), 'getKnownTicketCategories includes default categories');

  // 2. Dev Ticket Type switching
  mockEl('ntc-gm-fields');
  mockEl('ntc-dev-fields');
  mockEl('ntc-title');
  mockEl('ntc-category');
  mockEl('ntc-notes-label');
  mockEl('ntc-modal-title');

  sandbox.onTicketTypeChanged('dev');
  assert(mockDoms['ntc-gm-fields'].classList.contains('hidden'), 'onTicketTypeChanged hides GM fields for dev tickets');
  assert(!mockDoms['ntc-dev-fields'].classList.contains('hidden'), 'onTicketTypeChanged reveals dev fields for dev tickets');
  assertEqual(mockDoms['ntc-category'].value, 'Platform Architecture', 'onTicketTypeChanged defaults dev ticket category to Platform Architecture');

  // 3. Save new Dev ticket
  mockEl('ntc-title').value = 'Resizable Dock Splitters';
  mockEl('ntc-type').value = 'dev';
  mockEl('ntc-category').value = 'MDI Shell';
  mockEl('ntc-priority').value = 'High';
  mockEl('ntc-node').value = '1';
  mockEl('ntc-target-surface').value = 'start.html';
  mockEl('ntc-prereqs').value = 'scripts/mdi_window_manager.js';
  mockEl('ntc-notes').value = 'Implement 8-way drag resizing.';

  sandbox.saveNewCampaignTicket();
  const createdDev = sandbox.Workstation.activeTopology.tickets.find(t => t.title === 'Resizable Dock Splitters');
  assert(Boolean(createdDev), 'saveNewCampaignTicket creates and stores dev ticket in activeTopology');
  assertEqual(createdDev.id, 'DEV-03', 'saveNewCampaignTicket assigns DEV- prefix to development tickets');
  assertEqual(createdDev.track, 'Platform Development', 'saveNewCampaignTicket assigns Platform Development track');
  assertEqual(createdDev.tier, 0, 'saveNewCampaignTicket sets tier to 0 for dev tickets');

  // 4. Mark Ticket Done and Undone
  sandbox.markTicketDone('CAMP-01', 'campaign');
  assertEqual(sandbox.Workstation.activeTopology.tickets[0].status, 'done', 'markTicketDone marks campaign ticket status as done');

  sandbox.markTicketDone('SYS-START-10', 'repo');
  assertEqual(sandbox.Workstation.activeTopology.ticketOverrides['SYS-START-10'].status, 'done', 'markTicketDone sets repo ticket override in activeTopology');

  const combined = sandbox.getCombinedTickets();
  const sysTicket = combined.repoTickets.find(t => t.id === 'SYS-START-10');
  assertEqual(sysTicket.status, 'done', 'getCombinedTickets applies ticketOverrides to repo tickets');

  sandbox.markTicketUndone('SYS-START-10', 'repo');
  assert(!sandbox.Workstation.activeTopology.ticketOverrides['SYS-START-10'], 'markTicketUndone removes repo ticket override');

  // 5. Node dropdown population includes formatted name
  const nodeSelect = mockEl('ntc-node', 'select');
  sandbox.openNewCampaignTicketModal();
  assert(nodeSelect.children.length >= 3, 'openNewCampaignTicketModal populates spatial node dropdown options');
  const nodeOpt1 = nodeSelect.children.find(c => c.value === '1');
  assert(nodeOpt1 && nodeOpt1.textContent.includes('River Gate'), 'Spatial node dropdown option includes human-readable node name');
}

// ============================================================================
// SUITE 31: RESIZABLE MDI WINDOWS & DOCK SPLITTERS (SYS-START-18)
// ============================================================================
function testMdiWindowResizingAndDockSplitters() {
  console.log('\n--> SUITE 31: Resizable MDI Windows & Flexible Workspace Splitters (SYS-START-18)...');

  const mdiCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/mdi_window_manager.js'), 'utf8');
  const propGridCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/property_grid_inspector.js'), 'utf8');

  const mockStorage = {};
  const docListeners = {};

  function makeMockEl(tag = 'div', initialClass = '') {
    const classSet = new Set(initialClass ? initialClass.split(/\s+/).filter(Boolean) : []);
    const el = {
      tagName: tag.toUpperCase(),
      get className() { return Array.from(classSet).join(' '); },
      set className(val) {
        classSet.clear();
        (val || '').split(/\s+/).filter(Boolean).forEach(c => classSet.add(c));
      },
      children: [],
      classList: {
        add: function(c) { classSet.add(c); },
        remove: function(c) { classSet.delete(c); },
        contains: function(c) { return classSet.has(c); }
      },
      dataset: {},
      style: {},
      listeners: {},
      addEventListener: function(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
      },
      removeEventListener: function(event, fn) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(f => f !== fn);
      },
      dispatchEvent: function(event) {
        const type = event.type || event;
        const ev = typeof event === 'string' ? { type: event, clientX: 0, clientY: 0, preventDefault: () => {}, stopPropagation: () => {} } : event;
        if (!ev.target) ev.target = el;
        if (this.listeners[type]) {
          this.listeners[type].forEach(fn => fn(ev));
        }
      },
      appendChild: function(child) {
        child.parentElement = this;
        this.children.push(child);
        return child;
      },
      querySelector: function(sel) {
        if (sel.startsWith('.')) {
          const cls = sel.substring(1);
          return findChild(this, c => c.classList && c.classList.contains(cls));
        }
        if (sel.startsWith('#')) {
          const id = sel.substring(1);
          return findChild(this, c => c.id === id);
        }
        return null;
      },
      querySelectorAll: function(sel) {
        const results = [];
        if (sel.startsWith('.')) {
          const cls = sel.substring(1);
          findAllChildren(this, c => c.classList && c.classList.contains(cls), results);
        }
        return results;
      },
      closest: function(sel) {
        if (sel.startsWith('.')) {
          const cls = sel.substring(1);
          let curr = this;
          while (curr) {
            if (curr.classList && curr.classList.contains(cls)) return curr;
            curr = curr.parentElement;
          }
        }
        return null;
      },
      offsetWidth: 800,
      offsetHeight: 550,
      offsetLeft: 100,
      offsetTop: 60
    };
    return el;
  }

  function findChild(parent, predicate) {
    for (const child of parent.children) {
      if (predicate(child)) return child;
      const found = findChild(child, predicate);
      if (found) return found;
    }
    return null;
  }

  function findAllChildren(parent, predicate, acc) {
    for (const child of parent.children) {
      if (predicate(child)) acc.push(child);
      findAllChildren(child, predicate, acc);
    }
  }

  const elementsById = {};
  function getOrMakeEl(id, tag = 'div', className = '') {
    if (!elementsById[id]) {
      elementsById[id] = makeMockEl(tag, className);
      elementsById[id].id = id;
    }
    return elementsById[id];
  }

  const mockBody = makeMockEl('body');
  const mockDoc = {
    body: mockBody,
    getElementById: (id) => elementsById[id] || null,
    createElement: (tag) => makeMockEl(tag),
    querySelector: (sel) => {
      if (sel.startsWith('#')) return elementsById[sel.substring(1)] || null;
      return null;
    },
    querySelectorAll: (sel) => [],
    addEventListener: (event, fn) => {
      if (!docListeners[event]) docListeners[event] = [];
      docListeners[event].push(fn);
    },
    removeEventListener: (event, fn) => {
      if (!docListeners[event]) return;
      docListeners[event] = docListeners[event].filter(f => f !== fn);
    }
  };

  const sandbox = {
    document: mockDoc,
    localStorage: {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); },
      removeItem: (k) => { delete mockStorage[k]; }
    },
    console: console,
    escapeHtml: (s) => s,
    setStatusBarMessage: () => {},
    Workstation: { activeTopology: { nodes: {}, tickets: [] } },
    getComputedStyle: (el) => ({
      cursor: 'default',
      minWidth: (el && el.style && el.style.minWidth) || '400px',
      minHeight: (el && el.style && el.style.minHeight) || '250px'
    }),
    innerWidth: 1400,
    innerHeight: 900
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(mdiCode, sandbox);
  vm.runInContext(propGridCode, sandbox);

  // 1. Verify MDI Window 8-way resize handle injection
  const win1 = getOrMakeEl('modal-test-win', 'div', 'mdi-window');
  win1.style.width = '800px';
  win1.style.height = '500px';
  win1.style.top = '60px';
  win1.style.left = '100px';
  const titleBar1 = makeMockEl('div', 'mdi-title-bar');
  win1.appendChild(titleBar1);

  sandbox.MDIWindowManager.registerWindow('modal-test-win', { title: 'Test Window' });

  const handles = win1.querySelector('.mdi-resize-handles');
  assert(Boolean(handles), 'registerWindow injects .mdi-resize-handles container');
  assertEqual(handles.children.length, 8, '8 distinct resize handles injected into window');

  const expectedDirs = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
  const actualDirs = handles.children.map(h => h.dataset.direction);
  expectedDirs.forEach(dir => {
    assert(actualDirs.includes(dir), `Handle for direction '${dir}' exists`);
  });

  // 2. Verify window geometry persistence in localStorage
  mockStorage['cs_mdi_geometry_modal-persisted-win'] = JSON.stringify({
    top: '75px',
    left: '125px',
    width: '680px',
    height: '420px'
  });
  const win2 = getOrMakeEl('modal-persisted-win', 'div', 'mdi-window');
  const titleBar2 = makeMockEl('div', 'mdi-title-bar');
  win2.appendChild(titleBar2);

  sandbox.MDIWindowManager.registerWindow('modal-persisted-win', { title: 'Persisted Window' });
  assertEqual(win2.style.width, '680px', 'registerWindow restores persisted width from localStorage');
  assertEqual(win2.style.height, '420px', 'registerWindow restores persisted height from localStorage');
  assertEqual(win2.style.top, '75px', 'registerWindow restores persisted top from localStorage');
  assertEqual(win2.style.left, '125px', 'registerWindow restores persisted left from localStorage');

  // 3. Test setupPaneSplitter & Right Dock Splitter
  const dockSplitter = getOrMakeEl('dock-splitter', 'div', 'workspace-splitter-vertical');
  const propDock = getOrMakeEl('properties-dock', 'div');
  propDock.offsetWidth = 310;
  propDock.style.width = '310px';

  let canvasRenderCount = 0;
  sandbox.renderCanvas = () => { canvasRenderCount++; };

  sandbox.setupPaneSplitter(dockSplitter, propDock, {
    mode: 'right',
    minWidth: 240,
    maxWidth: 600,
    defaultWidth: 310,
    storageKey: 'cs_properties_dock_width',
    onResize: () => { sandbox.renderCanvas(); },
    onResizeEnd: () => { sandbox.renderCanvas(); }
  });

  // Simulate mouse down at x=500
  dockSplitter.dispatchEvent({
    type: 'mousedown',
    clientX: 500,
    clientY: 200,
    preventDefault: () => {}
  });

  // Move left by 80px (dx = -80 -> width = 310 - (-80) = 390px)
  const moveFn = docListeners['mousemove'] ? docListeners['mousemove'][0] : null;
  assert(Boolean(moveFn), 'mousedown on dock splitter attaches mousemove listener');
  if (moveFn) {
    moveFn({ clientX: 420, clientY: 200 });
    assertEqual(propDock.style.width, '390px', 'Dragging splitter left widens properties dock smoothly');
  }

  // Mouse up persists to localStorage and triggers renderCanvas
  const upFn = docListeners['mouseup'] ? docListeners['mouseup'][0] : null;
  assert(Boolean(upFn), 'mousedown on dock splitter attaches mouseup listener');
  if (upFn) {
    upFn();
    assertEqual(mockStorage['cs_properties_dock_width'], '390px', 'Splitter mouseup persists dock width to localStorage');
    assert(canvasRenderCount > 0, 'Splitter adjustment triggers CAD canvas re-render');
  }

  // Constrain to maximum 600px
  dockSplitter.dispatchEvent({ type: 'mousedown', clientX: 500, clientY: 200, preventDefault: () => {} });
  if (docListeners['mousemove'][0]) {
    docListeners['mousemove'][0]({ clientX: 100, clientY: 200 });
    assertEqual(propDock.style.width, '600px', 'Dock width constrained to 600px maximum');
    docListeners['mouseup'][0]();
  }

  // Constrain to minimum 240px
  dockSplitter.dispatchEvent({ type: 'mousedown', clientX: 500, clientY: 200, preventDefault: () => {} });
  if (docListeners['mousemove'][0]) {
    docListeners['mousemove'][0]({ clientX: 900, clientY: 200 });
    assertEqual(propDock.style.width, '240px', 'Dock width constrained to 240px minimum');
    docListeners['mouseup'][0]();
  }

  // Double click resets dock to default 310px
  dockSplitter.dispatchEvent({ type: 'dblclick' });
  assertEqual(propDock.style.width, '310px', 'Double clicking dock splitter resets width to default 310px');
  assertEqual(mockStorage['cs_properties_dock_width'], '310px', 'Double click resets localStorage to 310px');

  // 4. Test togglePropertiesDock toggles dock and splitter together
  propDock.style.display = 'flex';
  dockSplitter.style.display = 'block';

  sandbox.togglePropertiesDock();
  assertEqual(propDock.style.display, 'none', 'togglePropertiesDock hides properties-dock');
  assertEqual(dockSplitter.style.display, 'none', 'togglePropertiesDock also hides dock-splitter');

  sandbox.togglePropertiesDock();
  assertEqual(propDock.style.display, 'flex', 'togglePropertiesDock restores properties-dock');
  assertEqual(dockSplitter.style.display, 'block', 'togglePropertiesDock restores dock-splitter');

  // 5. Test Entity Manager Splitters (#em-splitter-left and #em-splitter-right)
  const emSplitterLeft = getOrMakeEl('em-splitter-left', 'div', 'pane-splitter-vertical');
  const emTreePane = getOrMakeEl('em-tree-container', 'div', 'entity-sidebar-tree');
  emTreePane.offsetWidth = 210;
  emTreePane.style.width = '210px';

  const emSplitterRight = getOrMakeEl('em-splitter-right', 'div', 'pane-splitter-vertical');
  const emDetailPane = getOrMakeEl('em-detail-pane', 'div', 'entity-detail-pane');
  emDetailPane.offsetWidth = 280;
  emDetailPane.style.width = '280px';

  const cadTabsSplitter = getOrMakeEl('cad-tabs-splitter', 'div', 'workspace-splitter-horizontal');
  const cadTabsBar = getOrMakeEl('cad-layout-tabs-bar', 'div', 'cad-layout-tabs-bar');
  cadTabsBar.offsetHeight = 38;
  cadTabsBar.style.height = '38px';

  sandbox.initWorkspaceSplitters();

  assert(Boolean(emSplitterLeft.dataset.splitterBound), 'initWorkspaceSplitters binds #em-splitter-left');
  assert(Boolean(emSplitterRight.dataset.splitterBound), 'initWorkspaceSplitters binds #em-splitter-right');
  assert(Boolean(cadTabsSplitter.dataset.splitterBound), 'initWorkspaceSplitters binds #cad-tabs-splitter for vertical map tab browser resizing');

  // Drag horizontal splitter upward to make tab browser taller and trigger multi-row mode
  cadTabsSplitter.dispatchEvent({ type: 'mousedown', clientX: 400, clientY: 700, preventDefault: () => {} });
  const tabsMove = docListeners['mousemove'] ? docListeners['mousemove'][0] : null;
  if (tabsMove) {
    tabsMove({ clientX: 400, clientY: 640 }); // dy = -60 -> height = 38 + 60 = 98px
    assertEqual(cadTabsBar.style.height, '98px', 'Dragging cad-tabs-splitter upward increases map tab browser height');
    assert(cadTabsBar.classList.contains('multi-row'), 'Map tab browser switches to multi-row mode when height >= 56px');
    docListeners['mouseup'][0]();
    assertEqual(mockStorage['cs_layout_tabs_bar_height'], '98px', 'cad-tabs-splitter persists height in localStorage');
  }

  // Double click resets cad-layout-tabs-bar to default 38px and removes multi-row
  cadTabsSplitter.dispatchEvent({ type: 'dblclick' });
  assertEqual(cadTabsBar.style.height, '38px', 'Double clicking cad-tabs-splitter resets height to 38px');
  assert(!cadTabsBar.classList.contains('multi-row'), 'Resetting height to 38px exits multi-row mode');

  // Drag left splitter to widen tree pane
  emSplitterLeft.dispatchEvent({ type: 'mousedown', clientX: 200, clientY: 100, preventDefault: () => {} });
  const emTreeMove = docListeners['mousemove'] ? docListeners['mousemove'][0] : null;
  assert(Boolean(emTreeMove), 'em-splitter-left mousedown binds mousemove listener');
  if (emTreeMove) {
    emTreeMove({ clientX: 280, clientY: 100 });
    assertEqual(emTreePane.style.width, '290px', 'Dragging em-splitter-left right expands tree pane');
    docListeners['mouseup'][0]();
    assertEqual(mockStorage['cs_em_tree_width'], '290px', 'em-splitter-left persists width in localStorage');
  }

  // Double click resets em-tree-container to default 210px
  emSplitterLeft.dispatchEvent({ type: 'dblclick' });
  assertEqual(emTreePane.style.width, '210px', 'Double clicking em-splitter-left resets width to 210px');

  // Drag right splitter to widen detail inspector pane
  emSplitterRight.dispatchEvent({ type: 'mousedown', clientX: 800, clientY: 100, preventDefault: () => {} });
  const emDetailMove = docListeners['mousemove'] ? docListeners['mousemove'][0] : null;
  assert(Boolean(emDetailMove), 'em-splitter-right mousedown binds mousemove listener');
  if (emDetailMove) {
    emDetailMove({ clientX: 750, clientY: 100 });
    assertEqual(emDetailPane.style.width, '330px', 'Dragging em-splitter-right left widens detail inspector pane');
    docListeners['mouseup'][0]();
    assertEqual(mockStorage['cs_em_detail_width'], '330px', 'em-splitter-right persists width in localStorage');
  }

  // 6. Test MDIWindowManager maximize and safe unmaximize
  const emWin = getOrMakeEl('modal-em-test', 'div', 'mdi-window');
  const emTitle = makeMockEl('div', 'mdi-title-bar');
  emWin.appendChild(emTitle);
  sandbox.MDIWindowManager.registerWindow('modal-em-test', { title: 'Entity Explorer Test' });

  sandbox.MDIWindowManager.restoreOrMaximize('modal-em-test');
  assert(emWin.classList.contains('maximized'), 'restoreOrMaximize sets maximized class');

  sandbox.MDIWindowManager.restoreOrMaximize('modal-em-test');
  assert(!emWin.classList.contains('maximized'), 'restoreOrMaximize unmaximizes properly');
  assert(emWin.style.width !== '100%', 'unmaximize restores non-100% width');
}

// ============================================================================
// SUITE 32: CAMPAIGN SELECTOR RICH METADATA & CENSUS INSPECTION (SYS-START-20)
// ============================================================================
function testCampaignSelectorRichMetadataAndCensus() {
  console.log('\n--> SUITE 32: Campaign Selector Rich Metadata & Census (SYS-START-20 / DEV-01)...');

  const mdiCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/mdi_window_manager.js'), 'utf8');

  function makeMockEl(tag = 'div', initialClass = '') {
    const classSet = new Set(initialClass ? initialClass.split(/\s+/).filter(Boolean) : []);
    const children = [];
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: initialClass,
      classList: {
        add: (...cls) => cls.forEach(c => classSet.add(c)),
        remove: (...cls) => cls.forEach(c => classSet.delete(c)),
        contains: (c) => classSet.has(c),
        toggle: (c, force) => {
          if (force !== undefined) {
            force ? classSet.add(c) : classSet.delete(c);
          } else {
            classSet.has(c) ? classSet.delete(c) : classSet.add(c);
          }
        }
      },
      style: { cssText: '' },
      children,
      appendChild: (child) => { children.push(child); child.parentElement = el; return child; },
      removeChild: (child) => {
        const idx = children.indexOf(child);
        if (idx !== -1) children.splice(idx, 1);
        return child;
      },
      innerHTML: '',
      textContent: '',
      value: '',
      onclick: null
    };
    return el;
  }

  const elementsById = {};
  function getOrMakeEl(id, tag = 'div', className = '') {
    if (!elementsById[id]) {
      elementsById[id] = makeMockEl(tag, className);
      elementsById[id].id = id;
    }
    return elementsById[id];
  }

  const listContainer = getOrMakeEl('modal-installed-campaigns-list', 'div');
  const welcomeGrid = getOrMakeEl('welcome-installed-campaigns-grid', 'div');
  getOrMakeEl('camps-count-all', 'span');
  getOrMakeEl('camps-count-disk', 'span');
  getOrMakeEl('camps-count-library', 'span');
  getOrMakeEl('camps-count-presets', 'span');
  getOrMakeEl('campaign-launcher-search', 'input');

  const mockDoc = {
    getElementById: (id) => getOrMakeEl(id),
    createElement: (tag) => makeMockEl(tag)
  };

  const sandbox = {
    document: mockDoc,
    window: {
      discoveredDiskCampaigns: {
        baldurs_gate: {
          id: 'baldurs_gate',
          folderName: 'BaldursGate',
          title: 'The Iron Crisis of Nashkel & The Deep Mines of the Sword Coast',
          description: 'Investigate tainted iron and goblin mercenaries across the Sword Coast.',
          nodeCount: 42,
          mapsCount: 16,
          npcCount: 18,
          questCount: 7,
          itemCount: 12,
          modCount: 2,
          sourceType: 'disk_folder',
          handle: { name: 'BaldursGate' }
        }
      },
      savedLibraryCampaigns: [
        {
          id: 'opal_shores',
          name: 'Opal Shores Coastal Pointcrawl',
          description: 'A coastal archipelago campaign.',
          nodes: [{ id: 1 }, { id: 2 }, { id: 3 }],
          npcs: [{ id: 'npc_1' }, { id: 'npc_2' }],
          quests: [{ id: 'q_1' }],
          items: [{ id: 'item_1' }]
        }
      ]
    },
    CAMPAIGN_REGISTRY: {
      migmag: {
        folder: 'migmag',
        metadata: {
          name: 'MigMag Tactical Campaign',
          description: 'A tactical sandbox campaign setting.'
        },
        preset: {
          nodes: [{ id: 1 }, { id: 2 }],
          npcs: [{ id: 'n1' }],
          quests: [],
          items: []
        },
        modules: ['m1', 'm2']
      }
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {}
    },
    activeCampaignLauncherTab: 'all',
    escapeHtml: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    escapeAttr: (s) => String(s || '').replace(/"/g, '&quot;'),
    closeModal: () => {},
    updateCampaignsFolderStatusUI: () => {}
  };

  sandbox.window.document = mockDoc;
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.CAMPAIGN_REGISTRY = sandbox.CAMPAIGN_REGISTRY;

  vm.createContext(sandbox);
  vm.runInContext(mdiCode, sandbox);

  sandbox.renderInstalledCampaignsModalList();

  assert(listContainer.children.length === 3, `renderInstalledCampaignsModalList rendered 3 campaign cards (Got: ${listContainer.children.length})`);
  const bgCard = listContainer.children[0];
  const cardHtml = bgCard.children[0].innerHTML;

  assert(cardHtml.includes('16 Maps'), 'Card displays multi-map census badge "16 Maps"');
  assert(cardHtml.includes('42 Nodes'), 'Card displays node census badge "42 Nodes"');
  assert(cardHtml.includes('18 NPCs'), 'Card displays NPC census badge "18 NPCs"');
  assert(cardHtml.includes('7 Quests'), 'Card displays quest census badge "7 Quests"');
  assert(cardHtml.includes('12 Items'), 'Card displays item census badge "12 Items"');
  assert(cardHtml.includes('2 Mods'), 'Card displays mod census badge "2 Mods"');
  assert(cardHtml.includes('word-break:break-word'), 'Long campaign title handles word breaking cleanly');

  const actionsDiv = bgCard.children[1];
  assert(actionsDiv.style.cssText.includes('flex-shrink:0'), 'Action buttons have flex-shrink:0 to protect against wrapping');
  assert(actionsDiv.children[0].textContent === 'Open', 'Action buttons include Open button');

  // Welcome modal list test
  sandbox.renderWelcomeCampaignsList();
  assert(welcomeGrid.children.length > 0, 'renderWelcomeCampaignsList populates welcome grid tiles');
  const welcomeTile = welcomeGrid.children[0];
  assert(welcomeTile.innerHTML.includes('42 Nodes'), 'Welcome tile displays node census count');
}

// ============================================================================
// SUITE 33: AUTOCAD-STYLE MAP LAYOUT TABS STRIP & GROUPING (SYS-START-21 / DEV-02)
// ============================================================================
function testAutoCadMapLayoutTabsAndGrouping() {
  console.log('\n--> SUITE 33: AutoCAD-Style Map Layout Tabs Strip & Grouping (SYS-START-21 / DEV-02)...');

  const hudCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/canvas_hud.js'), 'utf8');

  function makeMockEl(tag = 'div', initialClass = '') {
    const classSet = new Set(initialClass ? initialClass.split(/\s+/).filter(Boolean) : []);
    const children = [];
    let innerHtmlVal = '';
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: initialClass,
      classList: {
        add: (...cls) => cls.forEach(c => classSet.add(c)),
        remove: (...cls) => cls.forEach(c => classSet.delete(c)),
        contains: (c) => classSet.has(c)
      },
      style: { cssText: '', display: '' },
      children,
      appendChild: (child) => { children.push(child); child.parentElement = el; return child; },
      querySelector: (sel) => {
        if (sel === '.layout-tab.active') {
          return children.find(c => c.classList && c.classList.contains('active')) || null;
        }
        return null;
      },
      querySelectorAll: (sel) => {
        return children.filter(c => c.classList && c.classList.contains('layout-tab'));
      },
      get innerHTML() { return innerHtmlVal; },
      set innerHTML(val) {
        innerHtmlVal = val;
        children.length = 0;
        const matches = val.match(/<div class="layout-tab[^"]*"[\s\S]*?<\/div>/gi) || [];
        matches.forEach(m => {
          const isAct = m.includes('active');
          const isChild = m.includes('layout-tab-child');
          const childEl = {
            tagName: 'DIV',
            className: `layout-tab ${isAct ? 'active' : ''} ${isChild ? 'layout-tab-child' : ''}`,
            classList: {
              contains: (c) => (isAct && c === 'active') || (isChild && c === 'layout-tab-child') || c === 'layout-tab'
            },
            innerHTML: m,
            scrollIntoView: () => {}
          };
          children.push(childEl);
        });
      },
      scrollWidth: 1200,
      scrollLeft: 0,
      scrollTo: function(opts) { if (opts && opts.left !== undefined) this.scrollLeft = opts.left; },
      scrollBy: function(opts) { if (opts && opts.left !== undefined) this.scrollLeft += opts.left; }
    };
    return el;
  }

  const tabsList = makeMockEl('div');
  tabsList.id = 'layout-tabs-list';
  const scrollContainer = makeMockEl('div');
  scrollContainer.id = 'cad-layout-scroll-container';

  const elementsById = {};
  elementsById['layout-tabs-list'] = tabsList;
  elementsById['cad-layout-scroll-container'] = scrollContainer;

  const mockDoc = {
    getElementById: (id) => elementsById[id] || null,
    createElement: (tag) => {
      const el = makeMockEl(tag);
      return el;
    },
    body: makeMockEl('body')
  };
  mockDoc.body.appendChild = function(child) {
    mockDoc.body.children.push(child);
    if (child.id) elementsById[child.id] = child;
    return child;
  };

  const mockStorage = {};
  const sandbox = {
    document: mockDoc,
    window: {},
    activeMapId: 'map_root',
    maps: {
      map_root: { id: 'map_root', name: 'Sword Coast (World Map)', scaleTier: 'region', parentMapId: null },
      nashkel_town: { id: 'nashkel_town', name: 'Nashkel Town', scaleTier: 'settlement', parentMapId: 'map_root' },
      mines_l1: { id: 'mines_l1', name: 'Nashkel Mines Level 1', scaleTier: 'dungeon', parentMapId: 'nashkel_town' },
      mines_l2: { id: 'mines_l2', name: 'Nashkel Mines Level 2', scaleTier: 'dungeon', parentMapId: 'nashkel_town' }
    },
    SCALE_TIERS: {
      region: { icon: '🌲', label: 'Region' },
      settlement: { icon: '🏘️', label: 'Settlement' },
      dungeon: { icon: '⛏️', label: 'Dungeon' }
    },
    localStorage: {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); }
    },
    escapeHtml: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    escapeAttr: (s) => String(s || '').replace(/"/g, '&quot;'),
    setTimeout: (fn) => fn()
  };

  sandbox.window.document = mockDoc;
  sandbox.window.localStorage = sandbox.localStorage;

  vm.createContext(sandbox);
  vm.runInContext(hudCode, sandbox);

  // 1. Initial render with 4 maps in tree (Sword Coast -> Nashkel Town -> Mines L1, Mines L2)
  sandbox.renderLayoutTabs();
  assert(tabsList.children.length === 4, `renderLayoutTabs renders 4 total tabs across hierarchy (Got: ${tabsList.children.length})`);
  assert(tabsList.innerHTML.includes('Sword Coast'), 'Contains root map tab "Sword Coast"');
  assert(tabsList.innerHTML.includes('layout-tab-fold-btn'), 'Parent map contains group fold toggle button');
  assert(tabsList.innerHTML.includes('layout-tab-child'), 'Child maps contain layout-tab-child styling class');
  assert(tabsList.innerHTML.includes('└─'), 'Child maps display visual tree branch prefix └─');

  // 2. Collapse Nashkel Town group
  sandbox.toggleMapGroupFold('nashkel_town');
  assert(tabsList.children.length === 2, `Collapsing Nashkel Town hides child mines tabs, leaving 2 tabs (Got: ${tabsList.children.length})`);
  assert(tabsList.innerHTML.includes('▶ 2'), 'Collapsed parent tab displays badge count of hidden submaps (▶ 2)');

  // 3. Auto-uncollapse when switching to a nested child map
  sandbox.activeMapId = 'mines_l1';
  sandbox.renderLayoutTabs();
  assert(tabsList.children.length === 4, 'Activating child map auto-uncollapses parent group so active tab is visible');

  // 4. Test horizontal scrolling controls
  sandbox.scrollLayoutTabs('right');
  assert(scrollContainer.scrollLeft === 220, `scrollLayoutTabs('right') increments scrollLeft by 220px (Got: ${scrollContainer.scrollLeft})`);
  sandbox.scrollLayoutTabs('first');
  assert(scrollContainer.scrollLeft === 0, `scrollLayoutTabs('first') scrolls back to 0 (Got: ${scrollContainer.scrollLeft})`);

  // 5. Test Quick Map List Dropdown
  sandbox.toggleMapQuickListMenu();
  const quickMenu = mockDoc.body.children.find(c => c.id === 'cad-quick-map-menu');
  assert(quickMenu && quickMenu.style.display === 'block', 'toggleMapQuickListMenu displays dropdown picker on body');
  assert(quickMenu.innerHTML.includes('All Maps (4)'), 'Quick Map picker displays correct total map count (4)');
}

// ============================================================================
// SUITE 34: BACKGROUND MAP RESIZING & TRANSFORM PERSISTENCE (SYS-START-22)
// ============================================================================
async function testBackgroundMapResizingAndTransformPersistence() {
  console.log('\n--> SUITE 34: Background Map Resizing & Transform Persistence (SYS-START-22 / DEV-03)...');

  const storeCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/map_store.js'), 'utf8');
  const hudCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/canvas_hud.js'), 'utf8');

  function makeMockEl(tag = 'div') {
    const attrs = {};
    const styles = {};
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      style: styles,
      value: '',
      checked: true,
      textContent: '',
      innerHTML: '',
      setAttribute: (k, v) => { attrs[k] = String(v); },
      getAttribute: (k) => attrs[k] || null,
      removeAttribute: (k) => { delete attrs[k]; },
      setAttributeNS: (ns, k, v) => { attrs[k] = String(v); },
      removeAttributeNS: (ns, k) => { delete attrs[k]; },
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    };
    return el;
  }

  const elementsById = {};
  function getOrMakeEl(id, tag = 'div') {
    if (!elementsById[id]) {
      elementsById[id] = makeMockEl(tag);
      elementsById[id].id = id;
    }
    return elementsById[id];
  }

  const bgImg = getOrMakeEl('canvas-bg-image', 'image');
  const widthInput = getOrMakeEl('map-prop-bg-width', 'input');
  const heightInput = getOrMakeEl('map-prop-bg-height', 'input');
  const scaleSlider = getOrMakeEl('map-prop-bg-scale', 'input');
  const scaleVal = getOrMakeEl('map-prop-bg-scale-val', 'span');
  const lockAspectEl = getOrMakeEl('map-prop-bg-lock-aspect', 'input');
  const xInput = getOrMakeEl('map-prop-bg-x', 'input');
  const yInput = getOrMakeEl('map-prop-bg-y', 'input');
  const opSlider = getOrMakeEl('map-prop-opacity', 'input');
  const propIdInput = getOrMakeEl('map-prop-id', 'input');
  const modalMapProp = getOrMakeEl('modal-map-properties', 'div');

  const mockDoc = {
    getElementById: (id) => getOrMakeEl(id),
    createElement: (tag) => makeMockEl(tag),
    body: makeMockEl('body')
  };

  const mockStorage = {};
  const mockDbStore = {};
  const mockDb = {
    transaction: () => ({
      objectStore: () => ({
        put: (record) => { mockDbStore[record.id] = record; },
        get: (id) => ({
          onsuccess: null,
          get result() { return mockDbStore[id] || null; }
        })
      })
    })
  };

  const sandbox = {
    document: mockDoc,
    window: {},
    activeMapId: 'map_root',
    activeMapMetadata: null,
    maps: {
      map_root: {
        id: 'map_root',
        name: 'Sword Coast',
        scaleTier: 'region',
        mapMetadata: {
          name: 'sword_coast_bg',
          dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          width: 2400,
          height: 1600,
          naturalWidth: 2400,
          naturalHeight: 1600,
          scale: 1.0,
          x: 0,
          y: 0,
          lockAspect: true,
          opacity: 0.85
        }
      }
    },
    Workstation: {
      activeTopology: {
        name: 'Sword Coast',
        nodes: {
          '1': { id: '1', x: 200, y: 150 },
          '2': { id: '2', x: 1200, y: 950 }
        }
      }
    },
    localStorage: {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); }
    },
    openMapDatabase: async () => mockDb,
    MAP_STORE_NAME: 'active_map',
    escapeHtml: (s) => String(s || ''),
    escapeAttr: (s) => String(s || ''),
    setStatusBarMessage: () => {},
    closeModal: () => {},
    renderLayoutTabs: () => {}
  };

  sandbox.window.document = mockDoc;
  sandbox.window.localStorage = sandbox.localStorage;

  vm.createContext(sandbox);
  vm.runInContext(storeCode, sandbox);
  vm.runInContext(hudCode, sandbox);

  // 1. Test applyMapImageToCanvas sets x, y, width, height on SVG image
  sandbox.applyMapImageToCanvas('data:image/png;base64,test', 3200, 2000, 0.9, false, { x: 50, y: 75, width: 3200, height: 2000 });
  assert(bgImg.getAttribute('width') === '3200', 'applyMapImageToCanvas sets SVG width attribute to 3200');
  assert(bgImg.getAttribute('height') === '2000', 'applyMapImageToCanvas sets SVG height attribute to 2000');
  assert(bgImg.getAttribute('x') === '50', 'applyMapImageToCanvas sets SVG x attribute to 50');
  assert(bgImg.getAttribute('y') === '75', 'applyMapImageToCanvas sets SVG y attribute to 75');

  // 2. Test saveMapImageToDB persists extra transform metadata
  const rec = await sandbox.saveMapImageToDB('test_bg', 'data:image/png;base64,test', 3000, 2000, 0.85, 'map_root', {
    naturalWidth: 2400,
    naturalHeight: 1600,
    scale: 1.25,
    x: 40,
    y: 60,
    lockAspect: true
  });
  assert(rec.scale === 1.25, 'saveMapImageToDB stores scale transform in DB record');
  assert(rec.x === 40 && rec.y === 60, 'saveMapImageToDB stores coordinate offsets in DB record');
  const metaCat = JSON.parse(mockStorage['cs_maps_meta_catalog'] || '{}');
  assert(metaCat['map_root'] && metaCat['map_root'].scale === 1.25, 'cs_maps_meta_catalog persists transform scale');

  // 3. Test openMapPropertiesDialog populates transform inputs
  propIdInput.value = 'map_root';
  sandbox.openMapPropertiesDialog('map_root');
  assert(widthInput.value === 2400, 'openMapPropertiesDialog populates width input (2400)');
  assert(heightInput.value === 1600, 'openMapPropertiesDialog populates height input (1600)');
  assert(lockAspectEl.checked === true, 'openMapPropertiesDialog defaults lockAspect to true');

  // 4. Test proportional lock aspect input
  widthInput.value = '1200';
  sandbox.onMapPropBgDimensionInput('width');
  assert(heightInput.value === 800, `onMapPropBgDimensionInput calculates proportional height (800) when aspect is locked (Got: ${heightInput.value})`);
  assert(bgImg.getAttribute('width') === '1200', 'previewMapBackgroundTransform live-previews width attribute on canvas SVG');

  // 5. Test fitMapBackgroundToNodes
  sandbox.fitMapBackgroundToNodes();
  assert(parseFloat(widthInput.value) >= 1100, `fitMapBackgroundToNodes computes bounding width from pointcrawl nodes (Got: ${widthInput.value})`);
  assert(parseFloat(xInput.value) <= 100, `fitMapBackgroundToNodes computes bounding x offset (Got: ${xInput.value})`);

  // 6. Test resetMapBackgroundNaturalSize
  sandbox.resetMapBackgroundNaturalSize();
  assert(widthInput.value === 2400, 'resetMapBackgroundNaturalSize restores naturalWidth 2400');
  assert(heightInput.value === 1600, 'resetMapBackgroundNaturalSize restores naturalHeight 1600');
  assert(xInput.value === 0 && yInput.value === 0, 'resetMapBackgroundNaturalSize restores 0 offsets');
}

// ============================================================================
// SUITE 35: RELATIONAL TRACKERS, TICKET WORKFLOWS, SUBMAP NAVIGATION & SPATIAL PINS (DEV-01 - DEV-04)
// ============================================================================
function testRelationalTrackersTicketWorkflowsAndSpatialPins() {
  console.log('\n--> SUITE 35: Relational Trackers, Ticket Workflows, Submap Navigation & Spatial Pins (DEV-01 - DEV-04)...');

  const scriptsDir = path.join(ROOT_DIR, 'src/workstation/scripts');
  const entityCoreCode = fs.readFileSync(path.join(scriptsDir, 'entity_core.js'), 'utf8');
  const emUiCode = fs.readFileSync(path.join(scriptsDir, 'entity_manager_ui.js'), 'utf8');
  const ticketCenterCode = fs.readFileSync(path.join(scriptsDir, 'ticket_center.js'), 'utf8');
  const cascadeDeleteCode = fs.readFileSync(path.join(scriptsDir, 'entity_cascade_delete.js'), 'utf8');
  const mdiCode = fs.readFileSync(path.join(scriptsDir, 'mdi_window_manager.js'), 'utf8');

  // 1. Dynamic Modal Z-Index Elevation
  const mockElements = {};
  const mockDocument = {
    getElementById: (id) => {
      if (!mockElements[id]) {
        mockElements[id] = {
          id: id,
          style: {},
          classList: {
            classes: new Set(['hidden']),
            remove: function(c) { this.classes.delete(c); },
            add: function(c) { this.classes.add(c); },
            contains: function(c) { return this.classes.has(c); }
          },
          appendChild: () => {},
          addEventListener: () => {}
        };
      }
      return mockElements[id];
    },
    createElement: () => ({
      style: {},
      classList: {
        classes: new Set(),
        add: function(c) { this.classes.add(c); },
        remove: function(c) { this.classes.delete(c); }
      },
      appendChild: () => {},
      addEventListener: () => {}
    }),
    querySelectorAll: () => []
  };

  const sandbox = {
    document: mockDocument,
    window: {},
    MODULE_ENTITY_PROTOTYPES: { npcs: [], quests: [], items: [], trackers: [], factions: [] },
    MDIWindowManager: { highestZIndex: 50 },
    Workstation: {
      activeTopology: {
        nodes: { '1': { id: 1, name: 'High Altar' } },
        npcs: [{ id: 'npc_1', name: 'Goran', nodeId: 1 }],
        quests: [{ id: 'quest_1', title: 'Find the Relic', nodeId: 1, steps: [{ id: 's1', title: 'Enter crypt', triggerTrackerId: 'trk_1', tickDelta: 1, isCompleted: false }] }],
        items: [{ id: 'item_1', name: 'Golden Chalice', nodeId: 1 }],
        trackers: [{ id: 'trk_1', name: 'Crypt Collapse', scopeTier: 'quest', currentTicks: 0, maxTicks: 4, triggerRefs: [{ entityType: 'quest', entityId: 'quest_1' }] }],
        tickets: [
          { id: 'DEV-01', title: 'Relatable Trackers', status: 'ready_for_authoring', targetType: 'tracker', targetId: 'trk_1', nodeId: 1, notes: 'Original note' },
          { id: 'CAMP-01', title: 'Goran Lore', status: 'in_progress', targetType: 'npc', targetId: 'npc_1', nodeId: 1, notes: 'Goran backstory' }
        ]
      }
    },
    saveActiveCampaign: () => {},
    setStatusBarMessage: () => {},
    closeModal: () => {},
    renderTicketList: () => {},
    selectTicket: () => {},
    renderEntityManagerList: () => {},
    selectEntityItem: () => {},
    updatePropertiesGrid: () => {},
    alert: () => {},
    console: console,
    Date: Date,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    parseInt: parseInt,
    Set: Set
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(mdiCode, sandbox);
  vm.runInContext(entityCoreCode, sandbox);
  injectEngine(sandbox);
  vm.runInContext(cascadeDeleteCode, sandbox);
  vm.runInContext(emUiCode, sandbox);
  vm.runInContext(ticketCenterCode, sandbox);

  // Test 1: openModal elevates zIndex dynamically
  sandbox.openModal('modal-ticket-author-new');
  const modalEl = mockElements['modal-ticket-author-new'];
  assert(modalEl.style.zIndex === 110, `openModal elevates style.zIndex to 110 (Got: ${modalEl.style.zIndex})`);
  assert(!modalEl.classList.contains('hidden'), 'openModal removes hidden class');

  // Test 2: getTicketsForEntity and getTrackersForEntity lookups
  const goranTickets = sandbox.getTicketsForEntity('npc', 'npc_1');
  assertEqual(goranTickets.length, 1, 'getTicketsForEntity finds ticket attached to NPC Goran');
  assertEqual(goranTickets[0].id, 'CAMP-01', 'Found ticket has correct ID CAMP-01');

  const cryptTrackers = sandbox.getTrackersForEntity('quest', 'quest_1');
  assertEqual(cryptTrackers.length, 1, 'getTrackersForEntity finds tracker triggered by quest_1');
  assertEqual(cryptTrackers[0].id, 'trk_1', 'Found tracker is trk_1');

  // Test 3: Cascade Deletion Orphan Protection for Tickets
  // Delete NPC Goran (npc_1)
  sandbox.executeEntityDeletion([{ type: 'npc', id: 'npc_1' }]);
  const orphanTicket = sandbox.Workstation.activeTopology.tickets.find(t => t.id === 'CAMP-01');
  assertEqual(orphanTicket.targetType, 'campaign', 'Deleted NPC ticket targetType reparented to campaign');
  assertEqual(orphanTicket.targetId, '', 'Deleted NPC ticket targetId cleared');
  assert(orphanTicket.notes.includes('Target npc (npc_1) was deleted'), 'Ticket notes contain orphan audit trail');

  // Test 4: Quest Step Advancement, Clock Trigger & Reset Rollback
  const quest = sandbox.Workstation.activeTopology.quests[0];
  const trk = sandbox.Workstation.activeTopology.trackers[0];
  assertEqual(trk.currentTicks, 0, 'Tracker starts at 0 ticks');
  sandbox.advanceQuestStep('quest_1', 0);
  assert(quest.steps[0].isCompleted, 'advanceQuestStep marks step as completed');
  assertEqual(trk.currentTicks, 1, 'advanceQuestStep ticks up linked tracker from 0 to 1');

  sandbox.resetQuestStep('quest_1', 0);
  assert(!quest.steps[0].isCompleted, 'resetQuestStep marks step as incomplete');
  assertEqual(trk.currentTicks, 0, 'resetQuestStep rolls back linked tracker from 1 to 0');

  // Test 5: Quest Step CRUD & Reordering
  sandbox.updateQuestStepTrigger('quest_1', 0, 'trk_1', 2);
  assertEqual(quest.steps[0].tickDelta, 2, 'updateQuestStepTrigger updates step tickDelta to 2');

  // Test 6: Tracker Scope Tier & Universal Entity Attribution
  sandbox.updateTrackerScopeTier('trk_1', 'faction');
  assertEqual(trk.scopeTier, 'faction', 'updateTrackerScopeTier updates tracker scopeTier to faction');

  // Test 7: Verify CAD Renderer & Spatial Pin Property Grid Wiring
  const cadRendererCode = fs.readFileSync(path.join(scriptsDir, 'cad_canvas_renderer.js'), 'utf8');
  const cadInteractionCode = fs.readFileSync(path.join(scriptsDir, 'cad_interaction.js'), 'utf8');
  const propGridCode = fs.readFileSync(path.join(scriptsDir, 'property_grid_inspector.js'), 'utf8');
  const crudDialogsCode = fs.readFileSync(path.join(scriptsDir, 'entity_crud_dialogs.js'), 'utf8');

  assert(cadRendererCode.includes('cad-node-'), 'cad_canvas_renderer.js assigns cad-node-<id> DOM ID for node ping highlight');
  assert(cadInteractionCode.includes("'spatial-pins-layer'"), 'cad_interaction.js includes spatial-pins-layer in applyCanvasTransform');
  assert(cadInteractionCode.includes('function addSpatialPinAt'), 'cad_interaction.js defines addSpatialPinAt for Spatial Pin tool');
  assert(propGridCode.includes("entity.type === 'spatialPin'"), 'property_grid_inspector.js renders Spatial Pin & Linked Target Inspector in Property Grid');
  assert(crudDialogsCode.includes("openModal('modal-entity-edit')"), 'entity_crud_dialogs.js openNewEntityModal uses openModal for dynamic z-index elevation');
  assert(!emUiCode.includes('openTicketCenterModal'), 'entity_manager_ui.js uses openTicketCenter instead of nonexistent openTicketCenterModal');
}

function testAuthoritativeReferenceClaimsAndGapsRemediation() {
  console.log('\n--- Suite 36: Authoritative Reference Audit & 8-Gap Remediation Gate ---');

  const scriptsDir = path.join(ROOT_DIR, 'src', 'workstation', 'scripts');
  const socCode = fs.readFileSync(path.join(scriptsDir, 'sociology_data.js'), 'utf8');
  const selImpCode = fs.readFileSync(path.join(scriptsDir, 'selective_importer.js'), 'utf8');
  const expCode = fs.readFileSync(path.join(scriptsDir, 'campaign_exporter.js'), 'utf8');
  const simCode = fs.readFileSync(path.join(scriptsDir, 'supply_chain_simulator.js'), 'utf8');

  const sandbox = {
    window: {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, appendChild: () => {}, addEventListener: () => {} })
    },
    console,
    Math,
    Date,
    Set,
    Map,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    parseInt,
    parseFloat,
    isNaN,
    Workstation: {
      activeTopology: {
        name: 'Audit Test Campaign',
        nodes: {
          '1': { id: 1, name: 'Sealed Citadel', x: 100, y: 100, tier: 2, odv: { s: 1, e: 1, c: 1 }, adj: [2], requires: ['smelted_iron'], customNotes: '' },
          '2': { id: 2, name: 'Entropic Outpost', x: 300, y: 200, tier: 2, odv: { s: 4, e: 4, c: 4 }, adj: [1], childMapId: 'map_outpost', customNotes: '' }
        },
        npcs: [{ id: 'npc_1', name: 'Captain Varek', role: 'Warden', faction: 'iron_guard', nodeId: 1 }],
        quests: [{ id: 'q_1', title: 'Defend the Gate', status: 'active', nodeId: 1, steps: [{ id: 's1', title: 'Bar the sluice', completed: false, triggerTrackerId: 'trk_1', tickDelta: 1 }] }],
        items: [{ id: 'itm_1', name: 'Iron Key', category: 'Relic', nodeId: 1 }],
        trackers: [{ id: 'trk_1', name: 'Siege Clock', currentTicks: 1, maxTicks: 4, scopeTier: 'settlement', nodeId: 1 }],
        factions: [{ id: 'iron_guard', name: 'Iron Guard', cvfQuadrant: 'Hierarchy', diplomaticStances: { raiders: 'Hostile' } }]
      },
      selectedEntity: { type: 'node', id: 1 },
      showContradictionOverlay: true
    },
    nodes: [
      { id: 1, name: 'Sealed Citadel', x: 100, y: 100, tier: 2, odv: { s: 1, e: 1, c: 1 }, adj: [2], requires: ['smelted_iron'], customNotes: '' },
      { id: 2, name: 'Entropic Outpost', x: 300, y: 200, tier: 2, odv: { s: 4, e: 4, c: 4 }, adj: [1], childMapId: 'map_outpost', customNotes: '' }
    ],
    nodeSlottedModules: { 1: [] },
    edgeSlottedModules: {},
    MODULES_MANIFEST: [],
    alert: () => {},
    confirm: () => true,
    updatePropertiesGrid: () => {},
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    setStatusBarMessage: () => {}
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(socCode, sandbox);
  vm.runInContext(selImpCode, sandbox);
  vm.runInContext(simCode, sandbox);
  vm.runInContext(expCode, sandbox);

  // Gap 1 & 3: Verify [S, E, C] 1..4 polarity, 1-click Sensory Pentagon insertion, and ODV Node application
  assertEqual(sandbox.ODV_MATRIX_64['[1, 1, 1]'].archetypeName, 'The Sealed Monolith', '[1, 1, 1] is The Sealed Monolith');
  assertEqual(sandbox.ODV_MATRIX_64['[4, 4, 4]'].archetypeName, 'The Entropic Vortex', '[4, 4, 4] is The Entropic Vortex');
  const appliedSensory = sandbox.applySensoryRollToSelectedNode(1, null, 1, 1, 1);
  assert(appliedSensory === true, 'applySensoryRollToSelectedNode returns true for valid node');
  assert(sandbox.Workstation.activeTopology.nodes['1'].customNotes.includes('5D Sensory Pentagon [1, 1, 1]'), '5D Sensory Pentagon markdown appended to node notes');

  const appliedOdv = sandbox.applyMdiOdvToSelectedNode(3, 2, 4, 1);
  assert(appliedOdv === true, 'applyMdiOdvToSelectedNode applies [3, 2, 4] to Node 1');
  assertEqual(sandbox.Workstation.activeTopology.nodes['1'].culture, 'Clan', 'Node 1 culture derived as Clan from [3, 2]');
  assertEqual(sandbox.Workstation.activeTopology.nodes['1'].opProfile, 'Service', 'Node 1 opProfile derived as Service from [3, 4]');

  // Gap 2: Verify normalizeImportedEntities converts shorthand AI schema fields to canonical runtime fields
  const rawAiEntities = {
    npcs: [{ id: 'npc_ai', name: 'Sorcha', factionId: 'union', dispositionToParty: 2, odv: [3, 2, 4], carriedItemIds: ['itm_ring'] }],
    items: [{ id: 'itm_ring', name: 'Union Ring' }],
    quests: [{ id: 'q_ai', title: 'Flume Sabotage', anchorNodeId: 'node_1', giverNpcId: 'npc_ai', rewardItemIds: ['itm_ring'], steps: [{ text: 'Check lock', completed: false, triggerTrackerId: 'trk_ai', tickDelta: 2 }] }],
    trackers: [{ id: 'trk_ai', name: 'Arson Clock', current: 2, max: 6, scope: 'city', consequence: 'Stockpile burns' }],
    factions: [{ id: 'union', name: 'Dockworkers', disposition: [3, 2, 4] }]
  };
  sandbox.normalizeImportedEntities(rawAiEntities);
  assertEqual(rawAiEntities.npcs[0].odv.s, 3, 'NPC array odv normalized to object {s, e, c}');
  assertEqual(rawAiEntities.npcs[0].faction, 'union', 'NPC factionId normalized to faction');
  assertEqual(rawAiEntities.items[0].ownerNpcId, 'npc_ai', 'NPC carriedItemIds bound to item.ownerNpcId');
  assertEqual(rawAiEntities.items[0].possessionMode, 'carried', 'NPC carriedItemIds sets item.possessionMode = carried');
  assertEqual(rawAiEntities.quests[0].nodeId, 'node_1', 'Quest anchorNodeId normalized to nodeId');
  assert(rawAiEntities.quests[0].npcIds.includes('npc_ai'), 'Quest giverNpcId normalized into npcIds');
  assertEqual(rawAiEntities.quests[0].steps[0].title, 'Check lock', 'Quest step text normalized to title');
  assertEqual(rawAiEntities.trackers[0].currentTicks, 2, 'Tracker current normalized to currentTicks');
  assertEqual(rawAiEntities.trackers[0].maxTicks, 6, 'Tracker max normalized to maxTicks');
  assertEqual(rawAiEntities.trackers[0].scopeTier, 'settlement', 'Tracker city scope normalized to settlement scopeTier');
  assertEqual(rawAiEntities.factions[0].odv.c, 4, 'Faction disposition array normalized to odv object');

  // Gap 5: Verify advanceSeveranceTurn ticks severed clocks, spawns settlement unrest clock, and triggers riot at 4/4
  const turn1 = sandbox.advanceSeveranceTurn({ silent: true });
  assert(turn1.advancedModules >= 1, 'advanceSeveranceTurn advances severed node requirement clock');
  assertEqual(turn1.spawnedClocks, 1, 'advanceSeveranceTurn spawns a Settlement Unrest Threat Clock on severed Node 1');
  sandbox.advanceSeveranceTurn({ silent: true });
  sandbox.advanceSeveranceTurn({ silent: true });
  const turn4 = sandbox.advanceSeveranceTurn({ silent: true });
  assertEqual(turn4.riotsTriggered, 1, 'advanceSeveranceTurn triggers Supply Riot & Crisis Metamorphism when severance clock hits 4/4');
  const sevClock = sandbox.Workstation.activeTopology.trackers.find(t => t.id === 'trk_severance_1');
  assert(sevClock && sevClock.notes.includes('[SUPPLY RIOT ACTIVE:'), 'Severance clock records SUPPLY RIOT ACTIVE and Crisis Shift');

  // Gap 6: Verify FoundryVTT, Universal VTT (.dd2vtt), and Printable HTML Dossier exporters
  const fvtt = sandbox.generateFoundryVTTJSON(sandbox.Workstation.activeTopology);
  assertEqual(fvtt.format, 'FoundryVTT-CreatorStudio-Bundle', 'generateFoundryVTTJSON produces valid FoundryVTT bundle');
  assertEqual(fvtt.notes.length, 2, 'FoundryVTT bundle includes map pins for all 2 nodes');
  assertEqual(fvtt.actors.length, 1, 'FoundryVTT bundle includes Actor for stationed NPC');

  const uvtt = sandbox.generateUniversalVTTJSON(sandbox.Workstation.activeTopology);
  assertEqual(uvtt.format, 0.2, 'generateUniversalVTTJSON produces format 0.2 .dd2vtt');
  assertEqual(uvtt.portals.length, 1, 'Universal VTT export maps Portal Node childMapId to portals array');

  const htmlDossier = sandbox.generateCampaignHTMLDossier(sandbox.Workstation.activeTopology);
  assert(htmlDossier.includes('<!DOCTYPE html>') && htmlDossier.includes('Sealed Citadel'), 'generateCampaignHTMLDossier outputs complete printable HTML5 sourcebook');

  // Gap 7: Verify Import-CampaignSlice.ps1 exists
  assert(fs.existsSync(path.join(ROOT_DIR, 'Import-CampaignSlice.ps1')), 'Import-CampaignSlice.ps1 headless CLI merge script exists');

  // Verify double-clicking a node on the canvas navigates to its submap
  sandbox.window.addEventListener = () => {};
  sandbox.window.removeEventListener = () => {};
  const canvasHudCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/canvas_hud.js'), 'utf8');
  const cadInteractionCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/cad_interaction.js'), 'utf8');
  vm.runInContext(canvasHudCode, sandbox);
  vm.runInContext(cadInteractionCode, sandbox);

  let switchedToMapId = null;
  sandbox.switchActiveMap = (mId) => { switchedToMapId = mId; };
  sandbox.selectNode = () => {}; // Simulate selectNode re-rendering on first click
  sandbox.maps = {
    map_root: { id: 'map_root', name: 'Root' },
    map_outpost: { id: 'map_outpost', name: 'Outpost Sub-Map', parentMapId: 'map_root', parentNodeId: 2 }
  };

  // First click (mousedown #1) selects node 2
  sandbox.onNodeMouseDown({ button: 0, detail: 1, clientX: 300, clientY: 200, stopPropagation: () => {}, preventDefault: () => {} }, 2);
  assertEqual(switchedToMapId, null, 'Single click on node does not switch map');

  // Rapid second click (mousedown #2 within 420ms) navigates to node 2 childMapId ('map_outpost')
  sandbox.onNodeMouseDown({ button: 0, detail: 1, clientX: 300, clientY: 200, stopPropagation: () => {}, preventDefault: () => {} }, 2);
  assertEqual(switchedToMapId, 'map_outpost', 'Double-clicking node on canvas navigates directly to its sub-map');
}

function testMultiLinkSpatialPinsShapeGripsContextMenuAndGlobalSearch() {
  console.log('\n--- Suite 37: Multi-Link Spatial Pins, Shape Resize Grips, Context Menu, Hover Cards & Global Search ---');

  const scriptsDir = path.join(ROOT_DIR, 'src', 'workstation', 'scripts');
  const cadInteractionCode = fs.readFileSync(path.join(scriptsDir, 'cad_interaction.js'), 'utf8');
  const cadRendererCode = fs.readFileSync(path.join(scriptsDir, 'cad_canvas_renderer.js'), 'utf8');
  const mdiCode = fs.readFileSync(path.join(scriptsDir, 'mdi_window_manager.js'), 'utf8');
  const modalsHtml = fs.readFileSync(path.join(ROOT_DIR, 'src', 'workstation', 'modals', 'entity_modals.html'), 'utf8');

  assert(modalsHtml.includes('id="modal-spatial-pin-picker"'), 'entity_modals.html defines #modal-spatial-pin-picker multi-link POI modal');
  assert(modalsHtml.includes('id="modal-global-search"'), 'entity_modals.html defines #modal-global-search Jump to Anything modal');
  assert(cadRendererCode.includes('onShapeGripMouseDown(ev, shape, handleKey'), 'cad_canvas_renderer.js binds interactive resize grips on selected shapes');
  assert(cadRendererCode.includes("openCanvasContextMenu(e, 'spatialPin', pin)"), 'cad_canvas_renderer.js binds right-click context menu on spatial pins');
  assert(cadRendererCode.includes("scheduleCanvasHoverCard(e, 'spatialPin', pin)"), 'cad_canvas_renderer.js binds hover preview cards on spatial pins');
  assert(mdiCode.includes('openGlobalSearchModal()'), 'mdi_window_manager.js wires Ctrl+F / Ctrl+P to openGlobalSearchModal');
  assert(mdiCode.includes('zoomToFitCanvas()'), 'mdi_window_manager.js wires F hotkey to zoomToFitCanvas');

  const sandbox = {
    window: { addEventListener: () => {}, removeEventListener: () => {}, innerWidth: 1280, innerHeight: 800 },
    document: {
      body: { classList: { contains: () => false } },
      getElementById: (id) => {
        if (id === 'canvas-container') {
          return {
            style: {},
            dataset: {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 700 }),
            addEventListener: () => {}
          };
        }
        return null;
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      createElementNS: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {}, addEventListener: () => {} })
    },
    console,
    Math,
    Date,
    Set,
    Map,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    parseInt,
    parseFloat,
    isNaN,
    setTimeout: () => 1,
    clearTimeout: () => {},
    escapeHtml: (s) => String(s || ''),
    Workstation: {
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      snapToGrid: false,
      gridSnapSize: 20,
      activeTool: 'select',
      selectedEntity: { type: 'global' },
      selectedEntities: [],
      activeTopology: {
        name: 'POI Test Campaign',
        nodes: {
          '1': { id: 1, name: 'Harbor Gate', x: 200, y: 180, tier: 2, culture: 'Market' }
        },
        npcs: [{ id: 'npc_harbormaster', name: 'Harbormaster Vance', role: 'Official' }],
        items: [{ id: 'itm_ledger', name: 'Smuggler Ledger', type: 'Document' }],
        quests: [{ id: 'q_contraband', title: 'Seize the Contraband', status: 'Active' }],
        trackers: [{ id: 'trk_patrol', name: 'Harbor Alert', value: 2, max: 6 }],
        factions: [{ id: 'fac_guild', name: 'Merchant Guild', quadrant: 'Market' }],
        shapes: [
          { id: 'shp_1', type: 'rect', x: 100, y: 100, width: 120, height: 80, visible: true }
        ],
        spatialPins: []
      }
    },
    activeMapId: 'map_root',
    maps: {
      map_root: { id: 'map_root', name: 'Root Harbor Map', nodes: {} },
      map_warehouse: { id: 'map_warehouse', name: 'Vault Warehouse Interior', parentMapId: 'map_root', nodes: {} }
    },
    renderCanvas: () => {},
    updateObjectSelector: () => {},
    updatePropertiesGrid: () => {},
    saveActiveCampaign: () => {},
    setStatusBarMessage: () => {}
  };
  sandbox.window = Object.assign(sandbox, sandbox.window);
  injectEngine(sandbox);
  vm.createContext(sandbox);
  vm.runInContext(cadInteractionCode, sandbox);

  // 1. Multi-link Spatial Pin creation & normalization
  const multiPin = sandbox.addSpatialPinAt(250, 210, 'npc', 'npc_harbormaster', 'Harbor Checkpoint', [
    { type: 'npc', id: 'npc_harbormaster' },
    { type: 'item', id: 'itm_ledger' },
    { type: 'submap', id: 'map_warehouse' },
    { type: 'tracker', id: 'trk_patrol' }
  ]);
  assert(multiPin !== null, 'addSpatialPinAt creates a multi-link Spatial Pin');
  assertEqual(multiPin.links.length, 4, 'Multi-link Spatial Pin stores all 4 linked entities (NPC, Item, Submap, Tracker)');
  assertEqual(multiPin.targetType, 'npc', 'Primary link targetType synced to legacy pin.targetType');
  assertEqual(multiPin.targetId, 'npc_harbormaster', 'Primary link targetId synced to legacy pin.targetId');
  assertEqual([multiPin.visible, multiPin.locked], [true, false], 'SYS-ARCH-01: addSpatialPinAt result is visible and unlocked via the engine normalizer');
  assertEqual(sandbox.resolvePinLinkTitle('submap', 'map_warehouse'), 'Vault Warehouse Interior', 'resolvePinLinkTitle resolves submap name');

  // 2. Snap-to-grid toggle & coordinate snapping
  assertEqual(sandbox.snapCoord(113), 113, 'snapCoord returns exact coordinate when snapToGrid is disabled');
  sandbox.toggleSnapToGrid();
  assertEqual(sandbox.Workstation.snapToGrid, true, 'toggleSnapToGrid enables 20px grid snapping');
  assertEqual(sandbox.snapCoord(113), 120, 'snapCoord snaps 113 to nearest 20px increment (120)');
  assertEqual(sandbox.snapCoord(113, { altKey: true }), 113, 'Holding Alt bypasses grid snapping');

  // 3. Zoom-to-Fit calculation
  sandbox.zoomToFitCanvas(false);
  assert(sandbox.Workstation.zoom > 0.1 && sandbox.Workstation.zoom <= 2.2, 'zoomToFitCanvas frames visible nodes, pins, and shapes');

  // 4. Red-Team Gate Checks (RT-01, RT-02, RT-04, RT-08)
  assert(cadInteractionCode.includes("getElementById('spp-label')") && modalsHtml.includes('id="spp-label"'), 'RT-01: Spatial Pin modal #spp-* DOM IDs match between entity_modals.html and cad_interaction.js');
  assert(cadInteractionCode.includes("getElementById('gs-results-container')") && modalsHtml.includes('id="gs-results-container"'), 'RT-01: Global Search modal #gs-* DOM IDs match between entity_modals.html and cad_interaction.js');

  const legacyPin = { id: 'pin_legacy', x: 100, y: 100, targetType: 'quest', targetId: 'q_contraband' };
  const normLinks = sandbox.getPinLinks(legacyPin);
  assertEqual(normLinks.length, 1, 'RT-02: getPinLinks promotes legacy single-link pin to pin.links array');
  assertEqual(normLinks[0].type, 'quest', 'RT-02: getPinLinks preserves legacy targetType');
  assertEqual(normLinks[0].id, 'q_contraband', 'RT-02: getPinLinks preserves legacy targetId');

  const searchEntries = sandbox.collectGlobalSearchEntries();
  assert(searchEntries.some(e => e.cat === 'spatialPin' && e.entityId === multiPin.id), 'RT-08: collectGlobalSearchEntries indexes multi-link spatialPins alongside nodes and entities');

  // RT-04, converted from a source-text check on entity_cascade_delete.js (SYS-ARCH-01): delete through the real
  // executeEntityDeletion and look at the pins. Entity links are scrubbed by the engine on the active topology and on
  // child maps; sub-map links are scrubbed by the cascade file because the engine is never called for maps.
  const cascadeCode = fs.readFileSync(path.join(scriptsDir, 'entity_cascade_delete.js'), 'utf8');
  vm.runInContext(cascadeCode, sandbox);
  sandbox.maps.map_warehouse.spatialPins = [
    { id: 'pin_wh', label: 'Warehouse Pin', targetType: 'npc', targetId: 'npc_harbormaster', links: [{ type: 'npc', id: 'npc_harbormaster' }, { type: 'item', id: 'itm_ledger' }] }
  ];
  const linkKeys = (pin) => pin.links.map(l => `${l.type}:${l.id}`);
  sandbox.executeEntityDeletion([{ type: 'npc', id: 'npc_harbormaster' }]);
  assertEqual(linkKeys(multiPin), ['item:itm_ledger', 'submap:map_warehouse', 'tracker:trk_patrol'], 'RT-04: executeEntityDeletion removes a deleted NPC link from spatialPins on the active topology');
  assertEqual(linkKeys(sandbox.maps.map_warehouse.spatialPins[0]), ['item:itm_ledger'], 'RT-04: executeEntityDeletion removes a deleted NPC link from spatialPins on a child map');
  assertEqual([multiPin.targetType, multiPin.targetId], ['item', 'itm_ledger'], 'RT-04: the pin target follows its first remaining link after the NPC is deleted');
  sandbox.executeEntityDeletion([{ type: 'map', id: 'map_warehouse' }]);
  assertEqual(linkKeys(multiPin), ['item:itm_ledger', 'tracker:trk_patrol'], 'RT-04: executeEntityDeletion removes submap links to a deleted sub-map from spatialPins');

  const propGridCode = fs.readFileSync(path.join(scriptsDir, 'property_grid_inspector.js'), 'utf8');
  assert(cadInteractionCode.includes('function onPinMouseDown'), 'cad_interaction.js defines onPinMouseDown for dragging spatial pins');
  assert(cadInteractionCode.includes('function promptMovePin'), 'cad_interaction.js defines promptMovePin for repositioning spatial pins');
  assert(propGridCode.includes('function renderEntityExplorerProperties'), 'property_grid_inspector.js defines renderEntityExplorerProperties');
  assert(propGridCode.includes('pin-entity:'), 'property_grid_inspector.js indexes linked entities in object selector');
}

function testTicket01QuestClockSchemaAndConsequences() {
  console.log('\n--- Suite 38: Quest-Clock Schema Alignment, Clock Threshold Consequences & Cascade Cleanup (Ticket 01) ---');

  const scriptsDir = path.join(ROOT_DIR, 'src', 'workstation', 'scripts');
  const entityCoreCode = fs.readFileSync(path.join(scriptsDir, 'entity_core.js'), 'utf8');
  const crudCode = fs.readFileSync(path.join(scriptsDir, 'entity_crud_dialogs.js'), 'utf8');
  const cascadeCode = fs.readFileSync(path.join(scriptsDir, 'entity_cascade_delete.js'), 'utf8');
  const wikiCode = fs.readFileSync(path.join(scriptsDir, 'wiki_engine.js'), 'utf8');
  const stateAdapterCode = fs.readFileSync(path.join(scriptsDir, 'state_adapter.js'), 'utf8');
  const modalsHtml = fs.readFileSync(path.join(ROOT_DIR, 'src', 'workstation', 'modals', 'entity_modals.html'), 'utf8');

  // 1. Static code assertions
  assert(modalsHtml.includes('id="ee-quest-status"'), 'entity_modals.html defines #ee-quest-status for quest status selection');
  assert(modalsHtml.includes('id="ee-tracker-consequences"'), 'entity_modals.html defines #ee-tracker-consequences for tick threshold consequence authoring');
  assert(entityCoreCode.includes('function evaluateTrackerConsequences'), 'entity_core.js exports evaluateTrackerConsequences');
  assert(entityCoreCode.includes('function syncQuestAndTrackerLinks'), 'entity_core.js exports syncQuestAndTrackerLinks');
  assert(entityCoreCode.includes('function syncTrackerToQuests'), 'entity_core.js exports syncTrackerToQuests');
  assert(wikiCode.includes('clock: { label: "Threat Clock"'), 'wiki_engine.js registers clock in WIKI_TOKEN_TYPES');

  // 2. Behavioral testing in VM sandbox
  const sandbox = {
    window: {},
    console: console,
    Date: Date,
    JSON: JSON,
    Math: Math,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    parseInt: parseInt,
    Set: Set,
    Map: Map,
    RegExp: RegExp,
    document: {
      querySelectorAll: () => [],
      getElementById: () => null
    }
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  // Execute entity_core in sandbox
  vm.runInContext(entityCoreCode, sandbox);
  vm.runInContext(wikiCode, sandbox);

  // Test A: evaluateTrackerConsequences forward tick & range checks
  const testTrk = {
    id: 'trk_test_1',
    name: 'Contamination',
    currentTicks: 0,
    maxTicks: 8,
    consequences: [
      { tick: 2, description: 'Minor leak detected' },
      { tick: 4, description: 'Quarantine gates closed' },
      { tick: 8, description: 'Total breach' }
    ]
  };

  // Jump from 0 to 5 (should cross tick 2 and 4, but not 8)
  const resultsForward = sandbox.evaluateTrackerConsequences(testTrk, 0, 5, { silent: true });
  assertEqual(resultsForward.length, 2, 'evaluateTrackerConsequences triggers 2 consequences on jump from 0 to 5');
  assert(testTrk.consequences[0].triggered, 'Tick 2 consequence marked as triggered');
  assert(testTrk.consequences[1].triggered, 'Tick 4 consequence marked as triggered');
  assert(!testTrk.consequences[2].triggered, 'Tick 8 consequence remains untriggered');

  // Step backward from 5 to 3 (should prompt to rearm tick 4)
  const resultsBackward = sandbox.evaluateTrackerConsequences(testTrk, 5, 3, { silent: true });
  assertEqual(resultsBackward.length, 1, 'evaluateTrackerConsequences re-arms tick 4 on rollback from 5 to 3');
  assert(!testTrk.consequences[1].triggered, 'Tick 4 consequence is re-armed (untriggered)');
  assert(testTrk.consequences[0].triggered, 'Tick 2 consequence remains triggered (since 3 >= 2)');

  // Test B: Bidirectional Quest ↔ Tracker Sync
  sandbox.Workstation = {
    activeTopology: {
      quests: [
        { id: 'q_mine', title: 'The Mine Crisis', trackerIds: [], steps: [{ id: 's1', title: 'Check shaft', triggerTrackerId: 'trk_mine' }] }
      ],
      trackers: [
        { id: 'trk_mine', name: 'Mine Collapse', currentTicks: 1, maxTicks: 6, triggerRefs: [] }
      ]
    }
  };

  sandbox.syncQuestAndTrackerLinks(sandbox.Workstation.activeTopology.quests[0], []);
  assert(sandbox.Workstation.activeTopology.quests[0].trackerIds.includes('trk_mine'), 'syncQuestAndTrackerLinks gathers step triggerTrackerId into quest.trackerIds');
  assert(sandbox.Workstation.activeTopology.trackers[0].triggerRefs.some(r => r.entityType === 'quest' && r.entityId === 'q_mine'), 'syncQuestAndTrackerLinks synchronizes quest into tracker.triggerRefs');

  // Test C: Wiki [[Clock:...]] token extraction and hovercard display
  const tokens = sandbox.extractTokensFromText('Investigate the rumors [[Clock:Mine Collapse]] in town.');
  assertEqual(tokens.length, 1, 'extractTokensFromText extracts [[Clock:...]] token');
  assertEqual(tokens[0].type, 'tracker', 'Clock token is normalized to tracker type');
  assertEqual(tokens[0].value, 'Mine Collapse', 'Clock token value matches');

  // Test D: Cascade deletion cleans quest.trackerIds and step triggers
  injectEngine(sandbox);
  vm.runInContext(cascadeCode, sandbox);
  const testTopoCascade = {
    quests: [
      { id: 'q_1', title: 'Quest 1', trackerIds: ['trk_del', 'trk_keep'], steps: [{ id: 's1', triggerTrackerId: 'trk_del' }, { id: 's2', triggerTrackerId: 'trk_keep' }] }
    ],
    items: [
      { id: 'it_1', name: 'Sword', ownerNpcId: 'npc_del', possessionMode: 'carried' }
    ],
    trackers: [
      { id: 'trk_del', name: 'Deleted Tracker', triggerRefs: [] },
      { id: 'trk_keep', name: 'Kept Tracker', triggerRefs: [] }
    ],
    npcs: [
      { id: 'npc_del', name: 'Deleted NPC', questIds: ['q_del'] }
    ]
  };

  sandbox.executeEntityDeletion([
    { type: 'tracker', id: 'trk_del', name: 'Deleted Tracker' },
    { type: 'npc', id: 'npc_del', name: 'Deleted NPC' }
  ], testTopoCascade, { skipBackup: true, skipConfirm: true });

  assertEqual(testTopoCascade.quests[0].trackerIds.length, 1, 'Cascade delete removes deleted tracker from quest.trackerIds');
  assertEqual(testTopoCascade.quests[0].trackerIds[0], 'trk_keep', 'Remaining trackerId is preserved');
  assertEqual(testTopoCascade.quests[0].steps[0].triggerTrackerId, null, 'Deleted tracker ID is nulled out on quest step 1');
  assertEqual(testTopoCascade.quests[0].steps[1].triggerTrackerId, 'trk_keep', 'Preserved tracker ID is kept on quest step 2');
  assertEqual(testTopoCascade.items[0].ownerNpcId, null, 'Deleted owner NPC is nulled out on carried item');
  assertEqual(testTopoCascade.items[0].possessionMode, 'stored', 'Carried item reverts to stored when owner NPC is deleted');

  // Converted from source-text checks on entity_cascade_delete.js (SYS-ARCH-01): the engine owns this scrub now, so
  // assert the outcome. Nothing in quest.trackerIds, quest.steps or the item roster may still point at what was deleted.
  assertEqual(sandbox.CampaignMutationEngine.findEntityReferences(testTopoCascade, 'tracker', 'trk_del'), [], 'cascade delete leaves no reference to the deleted tracker in quest.trackerIds or quest.steps');
  assertEqual(sandbox.CampaignMutationEngine.findEntityReferences(testTopoCascade, 'npc', 'npc_del'), [], 'cascade delete leaves no reference to the deleted NPC');
}

function testTicket02CampaignMutationEngine() {
  console.log('\n--- Suite 39: Shared Campaign Mutation Engine (Ticket 02) ---');

  const enginePath = path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js');
  assert(fs.existsSync(enginePath), 'src/workstation/scripts/campaign_mutation_engine.js exists');

  const engine = require(enginePath);
  assert(typeof engine.applyBatch === 'function', 'engine exports applyBatch');
  assert(typeof engine.revertBatch === 'function', 'engine exports revertBatch');
  assert(typeof engine.applySlice === 'function', 'engine exports applySlice');
  assert(typeof engine.getSummary === 'function', 'engine exports getSummary');
  assert(typeof engine.findNode === 'function', 'engine exports findNode');

  // Test state initialization
  const state = {
    name: 'Sword Coast Testing',
    entities: {
      npcs: [{ id: 'npc_kylee', name: 'Miner Kylee', status: 'Active', nodeId: 1 }],
      quests: [],
      items: [],
      trackers: [],
      factions: [],
      tickets: []
    },
    activeTopology: {
      nodes: {
        "1": { id: 1, name: "Township of Beregost", x: 100, y: 200 }
      }
    },
    appliedBatchIds: []
  };

  // Test 1: Two-Pass Symbol Resolution & Intra-Batch References
  const batch1 = {
    batchId: 'batch_test_01',
    actor: 'Antigravity AI',
    summary: 'Add poisoned shipment quest and contamination clock with Kylee captured',
    operations: [
      {
        op: 'set_npc_status',
        npc: 'Miner Kylee',
        status: 'Captured',
        node: 'Township of Beregost'
      },
      {
        op: 'create_clock',
        tempId: '$contamination_clock',
        name: 'Contamination Spreads',
        scopeTier: 'settlement',
        currentTicks: 1,
        maxTicks: 8,
        consequences: [
          { tick: 4, description: 'Smithy quarantine' },
          { tick: 8, description: 'Economic collapse' }
        ]
      },
      {
        op: 'create_quest',
        tempId: '$poisoned_shipment',
        title: 'The Poisoned Shipment',
        status: 'Active',
        npcIds: ['Miner Kylee'],
        trackerIds: ['$contamination_clock'],
        steps: [
          { title: 'Inspect ingots', isCompleted: false, triggerTrackerId: '$contamination_clock', tickDelta: 1 }
        ]
      }
    ]
  };

  const res1 = engine.applyBatch(state, batch1);
  assertEqual(res1.status, 'success', 'Batch 1 applied successfully');
  assertEqual(state.appliedBatchIds.length, 1, 'Batch ID recorded in state.appliedBatchIds');

  // Verify NPC status changed
  const kylee = state.entities.npcs.find(n => n.id === 'npc_kylee');
  assertEqual(kylee.status, 'Captured', 'Miner Kylee status updated to Captured');

  // Verify Threat Clock created
  assertEqual(state.entities.trackers.length, 1, 'Contamination Threat Clock created');
  const clock = state.entities.trackers[0];
  assertEqual(clock.name, 'Contamination Spreads', 'Clock name set');
  assertEqual(clock.maxTicks, 8, 'Clock maxTicks set to 8');

  // Verify Quest created and resolved intra-batch $contamination_clock symbol
  assertEqual(state.entities.quests.length, 1, 'Poisoned Shipment quest created');
  const quest = state.entities.quests[0];
  assertEqual(quest.title, 'The Poisoned Shipment', 'Quest title set');
  assert(quest.npcIds.includes('npc_kylee'), 'Quest resolved Miner Kylee reference to npc_kylee ID');
  assert(quest.trackerIds.includes(clock.id), 'Quest resolved $contamination_clock to generated clock ID');
  assertEqual(quest.steps[0].triggerTrackerId, clock.id, 'Quest step resolved $contamination_clock to generated clock ID');

  // Test 2: Idempotency
  const dupRes = engine.applyBatch(state, batch1);
  assertEqual(dupRes.status, 'already_applied', 'Re-applying batch 1 returns already_applied');
  assertEqual(state.entities.quests.length, 1, 'Quest count not duplicated on re-apply');

  // Test 3: Zero-token read queries
  const summary = engine.getSummary(state);
  assertEqual(summary.census.npcs, 1, 'Summary reports 1 NPC');
  assertEqual(summary.census.quests, 1, 'Summary reports 1 quest');
  assertEqual(summary.census.trackers, 1, 'Summary reports 1 tracker');
  assertEqual(summary.activeQuests[0].title, 'The Poisoned Shipment', 'Summary active quests list matches');

  const foundNodes = engine.findNode(state, 'Beregost');
  assertEqual(foundNodes.length, 1, 'findNode finds Beregost node');
  assertEqual(foundNodes[0].name, 'Township of Beregost', 'Found node name matches');

  // Test 4: Revert Batch with field diffs
  const revRes = engine.revertBatch(state, 'batch_test_01', [batch1]);
  assertEqual(revRes.status, 'reverted', 'Batch 1 reverted successfully');
  assertEqual(kylee.status, 'Active', 'Miner Kylee status reverted to Active');
  assertEqual(state.entities.quests.length, 0, 'Created quest removed on revert');
  assertEqual(state.entities.trackers.length, 0, 'Created clock removed on revert');

  // Test 5: applySlice with shorthand normalization
  const slice = {
    actor: 'Test Importer',
    entities: {
      npcs: [{ id: 'npc_slice', name: 'Alora', odv: [1, 3, 2], carriedItemIds: ['it_dagger'] }],
      items: [{ id: 'it_dagger', name: 'Rabbit Foot Dagger' }],
      trackers: [{ id: 'trk_slice', name: 'Guard Alarm', current: 2, max: 4, scope: 'city' }]
    }
  };
  const sliceRes = engine.applySlice(state, slice, 'overwrite');
  assertEqual(sliceRes.status, 'success', 'Slice applied via shared engine');
  const alora = state.entities.npcs.find(n => n.id === 'npc_slice');
  assert(alora, 'Alora imported');
  assertEqual(alora.odv.s, 1, 'Alora odv array normalized to object s=1');
  const dagger = state.entities.items.find(i => i.id === 'it_dagger');
  assertEqual(dagger.ownerNpcId, 'npc_slice', 'carriedItemIds bound dagger to ownerNpcId');
  assertEqual(dagger.possessionMode, 'carried', 'Dagger possessionMode set to carried');
  const alarm = state.entities.trackers.find(t => t.id === 'trk_slice');
  assertEqual(alarm.currentTicks, 2, 'Tracker current normalized to currentTicks 2');
  assertEqual(alarm.maxTicks, 4, 'Tracker max normalized to maxTicks 4');
  assertEqual(alarm.scopeTier, 'settlement', 'Tracker city scope normalized to settlement scopeTier');
}

function testTicket03CampaignCliAndLoopback() {
  console.log('\n--- Suite 40: Campaign CLI, Import Delegation & Loopback API Parity (Ticket 03) ---');

  const cliScriptPath = path.join(ROOT_DIR, 'scripts', 'campaign_cli.js');
  const aiPs1Path = path.join(ROOT_DIR, 'Campaign-AI.ps1');
  const importPs1Path = path.join(ROOT_DIR, 'Import-CampaignSlice.ps1');
  const serverJsPath = path.join(ROOT_DIR, 'server.js');
  const serverPs1Path = path.join(ROOT_DIR, 'server.ps1');

  assert(fs.existsSync(cliScriptPath), 'scripts/campaign_cli.js exists');
  assert(fs.existsSync(aiPs1Path), 'Campaign-AI.ps1 exists');
  assert(fs.existsSync(importPs1Path), 'Import-CampaignSlice.ps1 exists');
  assert(fs.existsSync(serverJsPath), 'server.js exists');
  assert(fs.existsSync(serverPs1Path), 'server.ps1 exists');

  const cli = require(cliScriptPath);
  const campaignsDir = path.join(ROOT_DIR, 'campaigns');

  // Test 1: Robust Slug & Folder Resolution
  assertEqual(cli.resolveCampaignFolder(campaignsDir, 'BaldursGate'), 'BaldursGate', 'Resolves exact folder name BaldursGate');
  assertEqual(cli.resolveCampaignFolder(campaignsDir, 'baldursgate'), 'BaldursGate', 'Resolves lower-case folder name baldursgate');
  assertEqual(cli.resolveCampaignFolder(campaignsDir, 'baldur_s_gate__the_sword_coast_campaign'), 'BaldursGate', 'Resolves campaign.json ID for BaldursGate');
  assertEqual(cli.resolveCampaignFolder(campaignsDir, 'Fallout2'), 'Fallout2', 'Resolves exact folder name Fallout2');
  assertEqual(cli.resolveCampaignFolder(campaignsDir, 'fallout2'), 'Fallout2', 'Resolves lower-case folder name fallout2');
  assertEqual(cli.resolveCampaignFolder(campaignsDir, 'fallout_2__the_northern_california_wasteland'), 'Fallout2', 'Resolves campaign.json ID for Fallout2');

  // Test 2: Read Commands
  const listRes = cli.runCliCommand('list-campaigns');
  assert(Array.isArray(listRes.campaigns), 'list-campaigns returns array');
  assert(listRes.campaigns.some(c => c.folder === 'BaldursGate'), 'list-campaigns includes BaldursGate');

  const summary = cli.runCliCommand('summary', { campaign: 'baldursgate' });
  assert(summary.census && summary.census.npcs > 0, 'summary returns census for BaldursGate');
  assert(Array.isArray(summary.activeQuests) && summary.activeQuests.length > 0, 'summary returns active quests for BaldursGate');

  const foundNodes = cli.runCliCommand('find-node', { campaign: 'baldursgate', query: 'Beregost' });
  assert(foundNodes.length > 0, 'find-node finds Beregost node');

  const inspectedNpc = cli.runCliCommand('inspect-entity', { campaign: 'baldursgate', type: 'npc', id: 'Jaheira' });
  assert(inspectedNpc && inspectedNpc.name === 'Jaheira', 'inspect-entity resolves Jaheira by name');

  // Test 3: Multi-File Atomic Disk Sync & Revert in Sandbox Campaign
  const sandboxFolder = '_test_sandbox_campaign_ticket03';
  const sandboxDir = path.join(campaignsDir, sandboxFolder);
  const mapsDir = path.join(sandboxDir, 'maps');

  try {
    if (fs.existsSync(sandboxDir)) fs.rmSync(sandboxDir, { recursive: true, force: true });
    fs.mkdirSync(mapsDir, { recursive: true });

    const initEntities = {
      npcs: [{ id: 'npc_sb_1', name: 'Sandbox Guardian', status: 'Active' }],
      quests: [],
      items: [],
      trackers: [],
      factions: [],
      tickets: []
    };

    fs.writeFileSync(path.join(sandboxDir, 'campaign.json'), JSON.stringify({ id: sandboxFolder, name: 'Sandbox Campaign', syncToken: 'sync_init', entities: initEntities }, null, 2), 'utf8');
    fs.writeFileSync(path.join(sandboxDir, 'topology.json'), JSON.stringify({ id: sandboxFolder, syncToken: 'sync_init', entities: initEntities, nodes: { '1': { id: 1, name: 'Root Node' } }, maps: { 'map_sub': { id: 'map_sub', name: 'Sub Map', nodes: [{ id: 10, name: 'Sub Node' }] } } }, null, 2), 'utf8');
    fs.writeFileSync(path.join(sandboxDir, 'preset.json'), JSON.stringify({ id: sandboxFolder, syncToken: 'sync_init', entities: initEntities, nodes: { '1': { id: 1, name: 'Root Node' } } }, null, 2), 'utf8');
    fs.writeFileSync(path.join(mapsDir, 'map_sub.json'), JSON.stringify({ id: 'map_sub', name: 'Sub Map', nodes: [{ id: 10, name: 'Sub Node' }] }, null, 2), 'utf8');

    // Apply batch
    const batch = {
      batchId: 'batch_sandbox_01',
      actor: 'Test Agent',
      summary: 'Add test quest and clock',
      operations: [
        { op: 'create_clock', tempId: '$sb_clock', name: 'Sandbox Threat', maxTicks: 6 },
        { op: 'create_quest', tempId: '$sb_quest', title: 'Sandbox Investigation', trackerIds: ['$sb_clock'] }
      ]
    };

    const applyRes = cli.runCliCommand('apply-batch', { campaign: sandboxFolder, json: batch });
    assertEqual(applyRes.status, 'success', 'apply-batch returns success');
    assert(applyRes.syncToken && applyRes.syncToken.startsWith('sync_'), 'apply-batch stamps fresh syncToken');

    // Verify campaign.json, topology.json, preset.json, maps/map_sub.json updated
    const updatedCamp = JSON.parse(fs.readFileSync(path.join(sandboxDir, 'campaign.json'), 'utf8'));
    const updatedTopo = JSON.parse(fs.readFileSync(path.join(sandboxDir, 'topology.json'), 'utf8'));
    const updatedPreset = JSON.parse(fs.readFileSync(path.join(sandboxDir, 'preset.json'), 'utf8'));
    const updatedMap = JSON.parse(fs.readFileSync(path.join(mapsDir, 'map_sub.json'), 'utf8'));
    const changelog = JSON.parse(fs.readFileSync(path.join(sandboxDir, 'changelog.json'), 'utf8'));
    const syncJs = fs.readFileSync(path.join(sandboxDir, 'campaign_sync.js'), 'utf8');

    assertEqual(updatedCamp.entities.quests.length, 1, 'campaign.json updated with new quest');
    assertEqual(updatedCamp.entities.trackers.length, 1, 'campaign.json updated with new clock');
    assertEqual(updatedCamp.syncToken, applyRes.syncToken, 'campaign.json stamped with fresh syncToken');
    assertEqual(updatedTopo.syncToken, applyRes.syncToken, 'topology.json stamped with matching syncToken');
    assertEqual(updatedPreset.syncToken, applyRes.syncToken, 'preset.json stamped with matching syncToken');
    assert(updatedMap && updatedMap.id === 'map_sub', 'maps/map_sub.json preserved/synced');
    assertEqual(changelog.length, 1, 'changelog.json appended with batch');
    assertEqual(changelog[0].batchId, 'batch_sandbox_01', 'changelog.json records batch ID');
    assert(syncJs.includes('window.__CS_LIVE_CAMPAIGNS__'), 'campaign_sync.js writes window.__CS_LIVE_CAMPAIGNS__');
    assert(syncJs.includes(applyRes.syncToken), 'campaign_sync.js contains fresh syncToken');

    // Revert batch
    const revertRes = cli.runCliCommand('revert-batch', { campaign: sandboxFolder, batchId: 'batch_sandbox_01' });
    assertEqual(revertRes.status, 'reverted', 'revert-batch returns reverted');

    const revertedCamp = JSON.parse(fs.readFileSync(path.join(sandboxDir, 'campaign.json'), 'utf8'));
    const revertedChangelog = JSON.parse(fs.readFileSync(path.join(sandboxDir, 'changelog.json'), 'utf8'));
    assertEqual(revertedCamp.entities.quests.length, 0, 'Revert removed created quest');
    assertEqual(revertedCamp.entities.trackers.length, 0, 'Revert removed created clock');
    assertEqual(revertedChangelog.length, 2, 'changelog.json appended with revert batch record');
  } finally {
    if (fs.existsSync(sandboxDir)) {
      try { fs.rmSync(sandboxDir, { recursive: true, force: true }); } catch (e) {}
    }
  }

  // Test 4: Loopback Parity in server.js and server.ps1
  const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
  const serverPs1Content = fs.readFileSync(serverPs1Path, 'utf8');

  assert(serverJsContent.includes('/api/campaign/sync-status'), 'server.js implements /api/campaign/sync-status');
  assert(serverJsContent.includes('/api/campaign/changelog'), 'server.js implements /api/campaign/changelog');
  assert(serverJsContent.includes('/api/campaign/load'), 'server.js implements /api/campaign/load');
  assert(serverJsContent.includes('/api/campaign/save'), 'server.js implements /api/campaign/save');
  assert(serverJsContent.includes('no-store, no-cache, must-revalidate'), 'server.js sends Cache-Control: no-store, no-cache, must-revalidate');

  assert(serverPs1Content.includes('/api/campaign/sync-status'), 'server.ps1 implements /api/campaign/sync-status');
  assert(serverPs1Content.includes('/api/campaign/changelog'), 'server.ps1 implements /api/campaign/changelog');
  assert(serverPs1Content.includes('/api/campaign/load'), 'server.ps1 implements /api/campaign/load');
  assert(serverPs1Content.includes('/api/campaign/save'), 'server.ps1 implements /api/campaign/save');
  assert(serverPs1Content.includes('no-store, no-cache, must-revalidate'), 'server.ps1 sends Cache-Control: no-store, no-cache, must-revalidate');
}

async function testTicket04TokenGuardAndBatchReplayMerge() {
  console.log('\n--- Suite 41: Pre-Write Token Guard, False-Dirty Suppression & Batch Replay Merge (Ticket 04) ---');

  const mapStorePath = path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'map_store.js');
  const mutEnginePath = path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js');
  const storeCode = fs.readFileSync(mapStorePath, 'utf8');
  const engineCode = fs.readFileSync(mutEnginePath, 'utf8');

  const storageMap = {};
  const mockElements = {
    'sb-disk': { textContent: '', title: '', style: {} }
  };

  const sandbox = {
    window: {},
    self: {},
    console: console,
    document: {
      getElementById: (id) => mockElements[id] || null,
      querySelectorAll: () => []
    },
    localStorage: {
      getItem: (k) => storageMap[k] || null,
      setItem: (k, v) => { storageMap[k] = String(v); },
      removeItem: (k) => { delete storageMap[k]; }
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    Workstation: {
      activeTopology: {
        name: 'Test Replay Campaign',
        nodes: {},
        links: [],
        npcs: [{ id: 'npc_1', name: 'Commander Vane', status: 'Active', role: 'Watch Commander' }],
        quests: [],
        items: [],
        trackers: [],
        factions: [],
        tickets: [],
        spatialPins: [{ id: 'pin_1', label: 'Old Watchtower', links: [{ type: 'npc', id: 'npc_1' }] }],
        appliedBatchIds: ['batch_base_00'],
        changelog: [{ batchId: 'batch_base_00', summary: 'Base initialization' }]
      }
    },
    maps: {
      'map_root': { id: 'map_root', name: 'Root Map', nodes: [], links: [] }
    },
    activeMapId: 'map_root',
    currentCampaignName: 'Test Replay Campaign',
    slugifyCampaignName: (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    setStatusBarMessage: () => {}
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;

  // Run engine then map_store in sandbox
  vm.runInNewContext(engineCode, sandbox);
  vm.runInNewContext(storeCode, sandbox);

  // Test 1: False-Dirty Suppression
  sandbox.setProjectDirectoryDirty(false);
  assertEqual(sandbox.isProjectDirectoryDirty(), false, 'Dirty state initialized to false');

  sandbox.window.__csSuppressDiskSync = true;
  sandbox.setProjectDirectoryDirty(true);
  assertEqual(sandbox.isProjectDirectoryDirty(), false, 'setProjectDirectoryDirty(true) suppressed when __csSuppressDiskSync is active');

  sandbox.scheduleProjectDirectorySync();
  assertEqual(sandbox.isProjectDirectoryDirty(), false, 'scheduleProjectDirectorySync suppressed when __csSuppressDiskSync is active');

  sandbox.window.__csSuppressDiskSync = false;
  sandbox.setProjectDirectoryDirty(true);
  assertEqual(sandbox.isProjectDirectoryDirty(), true, 'setProjectDirectoryDirty(true) succeeds when not suppressed');
  sandbox.setProjectDirectoryDirty(false);

  // Test 2: buildCampaignPackageFiles includes spatialPins, appliedBatchIds, and campaign_sync.js
  const pkg = await sandbox.buildCampaignPackageFiles({ syncToken: 'sync_test_tk4' });
  assert(pkg.campaignMeta.appliedBatchIds.includes('batch_base_00'), 'campaignMeta includes appliedBatchIds');
  assert(pkg.campaignMeta.entities.spatialPins.length === 1, 'campaignMeta includes spatialPins');
  const syncJsFile = pkg.files.find(f => f.path === 'campaign_sync.js');
  assert(syncJsFile, 'buildCampaignPackageFiles produces campaign_sync.js');
  assert(syncJsFile.data.includes('window.__CS_LIVE_CAMPAIGNS__'), 'campaign_sync.js populates window.__CS_LIVE_CAMPAIGNS__');
  assert(syncJsFile.data.includes('sync_test_tk4'), 'campaign_sync.js has syncToken');

  // Test 3: Batch Replay Merge with Non-Conflicting Updates
  const diskChangelog = [
    { batchId: 'batch_base_00', summary: 'Base initialization' }, // already applied
    {
      batchId: 'batch_ai_01',
      actor: 'AI Partner',
      summary: 'Add threat clock and quest',
      operations: [
        { op: 'create_clock', tempId: '$threat_clock', name: 'Goblin Horde Advances', maxTicks: 6 },
        { op: 'create_quest', tempId: '$scout_quest', title: 'Scout the Perimeter', trackerIds: ['$threat_clock'] }
      ],
      changes: [
        { category: 'trackers', entityId: 'tra_new', field: '_entity', before: undefined, after: { id: 'tra_new', name: 'Goblin Horde Advances' } },
        { category: 'quests', entityId: 'que_new', field: '_entity', before: undefined, after: { id: 'que_new', title: 'Scout the Perimeter' } }
      ]
    }
  ];

  const mergeRes1 = await sandbox.replayDiskChangelogOntoBrowserState(diskChangelog, 'test_camp');
  assertEqual(mergeRes1.merged, 1, 'Replays exactly 1 unapplied batch (skips batch_base_00)');
  assertEqual(mergeRes1.conflicts.length, 0, 'No conflicts in non-conflicting batch');
  assert(sandbox.Workstation.activeTopology.appliedBatchIds.includes('batch_ai_01'), 'batch_ai_01 added to appliedBatchIds');
  assert(sandbox.Workstation.activeTopology.trackers.length === 1, 'Goblin Horde clock merged into activeTopology');
  assert(sandbox.Workstation.activeTopology.quests.length === 1, 'Scout quest merged into activeTopology');
  assert(sandbox.window.__csNewUnseenBatches.some(b => b.batchId === 'batch_ai_01'), 'batch_ai_01 staged in __csNewUnseenBatches for digest');

  // Test 4: Idempotency (Re-running does nothing)
  const mergeResDup = await sandbox.replayDiskChangelogOntoBrowserState(diskChangelog, 'test_camp');
  assertEqual(mergeResDup.merged, 0, 'Re-running replay with no new batches merges 0 batches');

  // Test 5: Conflict Detection on Same-Field Concurrent Edit
  // Browser modifies Commander Vane role locally to 'Paladin Knight'
  sandbox.Workstation.activeTopology.npcs[0].role = 'Paladin Knight';

  // Remote AI batch modifies Commander Vane role from 'Watch Commander' to 'High Marshal'
  const conflictingChangelog = [
    ...diskChangelog,
    {
      batchId: 'batch_ai_02',
      actor: 'AI Partner',
      summary: 'Promote Commander Vane',
      operations: [
        { op: 'upsert_entity', category: 'npcs', data: { id: 'npc_1', role: 'High Marshal' } }
      ],
      changes: [
        { category: 'npcs', entityId: 'npc_1', entityName: 'Commander Vane', field: 'role', before: 'Watch Commander', after: 'High Marshal' }
      ]
    }
  ];

  const mergeResConflict = await sandbox.replayDiskChangelogOntoBrowserState(conflictingChangelog, 'test_camp');
  assertEqual(mergeResConflict.merged, 1, 'Merged batch_ai_02');
  assertEqual(mergeResConflict.conflicts.length, 1, 'Flagged 1 same-field concurrent modification conflict');
  const conf = mergeResConflict.conflicts[0];
  assertEqual(conf.entityId, 'npc_1', 'Conflict on npc_1');
  assertEqual(conf.field, 'role', 'Conflict on field role');
  assertEqual(conf.localValue, 'Paladin Knight', 'Local value captured in conflict record');
  assertEqual(conf.remoteValue, 'High Marshal', 'Remote value captured in conflict record');
  assertEqual(conf.baseValue, 'Watch Commander', 'Base value captured in conflict record');

  // Test 6: Semantic User Milestone Recording
  assertEqual(typeof sandbox.recordUserMilestoneInChangelog, 'function', 'recordUserMilestoneInChangelog is exported');
  sandbox.recordUserMilestoneInChangelog('GM triggered gate collapse', [{ op: 'tick_clock', clock: 'tra_new', delta: 2 }]);
  assert(sandbox.Workstation.activeTopology.changelog.some(b => b.actor === 'User GM' && b.summary === 'GM triggered gate collapse'), 'Milestone recorded in changelog');
}

function testTicket05SyncSummaryDigestAndChangelogUi() {
  console.log('\n--- Suite 42: Sync Summary Digest & Campaign Changelog UI (Ticket 05) ---');

  // Test 1: Verify Modal Templates Exist in Source Files
  const lifecycleModalsPath = path.join(ROOT_DIR, 'src', 'workstation', 'modals', 'lifecycle_modals.html');
  const studioMdiWindowsPath = path.join(ROOT_DIR, 'src', 'workstation', 'modals', 'studio_mdi_windows.html');
  const templatePath = path.join(ROOT_DIR, 'src', 'workstation', 'template.html');
  const workstationStatePath = path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'workstation_state.js');
  const changelogUiPath = path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'campaign_changelog_ui.js');

  const lifecycleHtml = fs.readFileSync(lifecycleModalsPath, 'utf8');
  const mdiHtml = fs.readFileSync(studioMdiWindowsPath, 'utf8');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const stateCode = fs.readFileSync(workstationStatePath, 'utf8');
  const changelogUiCode = fs.readFileSync(changelogUiPath, 'utf8');

  // HTML structural checks
  assert(lifecycleHtml.includes('id="modal-sync-digest"'), 'modal-sync-digest defined in lifecycle_modals.html');
  assert(lifecycleHtml.includes('id="sync-digest-content"'), 'sync-digest-content container defined');
  assert(lifecycleHtml.includes('id="sync-digest-conflicts"'), 'sync-digest-conflicts container defined');
  assert(lifecycleHtml.includes('dismissSyncSummaryDigest()'), 'dismissSyncSummaryDigest bound to close button');

  assert(mdiHtml.includes('id="modal-campaign-changelog"'), 'modal-campaign-changelog defined in studio_mdi_windows.html');
  assert(mdiHtml.includes('id="campaign-changelog-list"'), 'campaign-changelog-list container defined');
  assert(mdiHtml.includes('id="changelog-filter-select"'), 'changelog-filter-select dropdown defined');
  assert(mdiHtml.includes('id="changelog-search-input"'), 'changelog-search-input search box defined');
  assert(mdiHtml.includes('id="changelog-stats-label"'), 'changelog-stats-label stats display defined');

  // Menu, Toolbar & MDI Registration
  assert(templateHtml.includes('scripts/campaign_changelog_ui.js'), 'campaign_changelog_ui.js included in template.html');
  assert(templateHtml.includes('openCampaignChangelogModal()'), 'openCampaignChangelogModal bound in template menus');
  assert(templateHtml.includes('openSyncSummaryDigestModal(true)'), 'openSyncSummaryDigestModal bound in template tools menu');
  assert(stateCode.includes("'modal-campaign-changelog'"), 'modal-campaign-changelog registered in workstation_state.js');

  // Test 2: Execution in vm sandbox
  const domElements = {};
  function getMockElement(id, tag = 'div') {
    if (!domElements[id]) {
      domElements[id] = {
        id,
        tagName: tag.toUpperCase(),
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); }
        },
        style: {},
        value: '',
        textContent: '',
        innerHTML: ''
      };
    }
    return domElements[id];
  }

  // Pre-seed required mock elements
  getMockElement('modal-sync-digest');
  getMockElement('sync-digest-campaign-name');
  getMockElement('sync-digest-batch-count-badge');
  getMockElement('sync-digest-content');
  getMockElement('sync-digest-conflicts');
  getMockElement('sync-digest-conflicts-list');
  getMockElement('modal-campaign-changelog');
  getMockElement('campaign-changelog-list');
  getMockElement('changelog-stats-label');
  getMockElement('changelog-filter-select', 'select');
  getMockElement('changelog-search-input', 'input');

  const storageStore = {};
  const mockLocalStorage = {
    getItem(k) { return storageStore[k] || null; },
    setItem(k, v) { storageStore[k] = String(v); },
    removeItem(k) { delete storageStore[k]; }
  };

  const CampaignMutationEngine = require(path.join(ROOT_DIR, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js'));

  const sandbox = {
    console,
    Date,
    JSON,
    Array,
    String,
    Math,
    setTimeout: (fn) => fn(),
    localStorage: mockLocalStorage,
    document: {
      getElementById: (id) => getMockElement(id)
    },
    MDIWindowManager: {
      open(id) { getMockElement(id).classList.remove('hidden'); },
      close(id) { getMockElement(id).classList.add('hidden'); }
    },
    closeModal(id) { getMockElement(id).classList.add('hidden'); },
    confirm: () => true,
    alert: () => {},
    prompt: () => 'Test GM Note',
    CampaignMutationEngine,
    CreatorStudio: { ai: CampaignMutationEngine },
    Workstation: {
      activeTopology: {
        name: 'Test_Campaign',
        appliedBatchIds: ['batch_01', 'batch_02'],
        npcs: [
          { id: 'npc_1', name: 'Kylee', role: 'Miner' }
        ],
        quests: [],
        items: [],
        trackers: [],
        changelog: [
          {
            batchId: 'batch_01',
            actor: 'AI Partner',
            summary: 'Initial Scout Spawn',
            appliedAt: 1700000000000,
            operations: [{ op: 'upsert_entity', category: 'npcs', data: { id: 'npc_1', name: 'Kylee', role: 'Miner' } }],
            changes: [{ category: 'npcs', entityId: 'npc_1', entityName: 'Kylee', field: '_entity', before: undefined, after: { id: 'npc_1', name: 'Kylee' } }]
          },
          {
            batchId: 'batch_02',
            actor: 'AI Partner',
            summary: 'Advance Clock',
            appliedAt: 1700000010000,
            operations: [{ op: 'tick_clock', clock: 'Goblin Raid', delta: 1 }],
            changes: [{ category: 'trackers', entityId: 'clk_1', entityName: 'Goblin Raid', field: 'progress', before: 0, after: 1 }]
          }
        ]
      }
    },
    window: {}
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(changelogUiCode, sandbox);

  assert(typeof sandbox.openSyncSummaryDigestModal === 'function', 'openSyncSummaryDigestModal is defined');
  assert(typeof sandbox.renderCampaignChangelog === 'function', 'renderCampaignChangelog is defined');
  assert(typeof sandbox.revertChangelogBatch === 'function', 'revertChangelogBatch is defined');
  assert(typeof sandbox.resolveSyncConflict === 'function', 'resolveSyncConflict is defined');
  assert(typeof sandbox.logManualGMSessionNote === 'function', 'logManualGMSessionNote is defined');

  // Test 3: Render Changelog and Stats
  sandbox.renderCampaignChangelog();
  const changelogListHtml = getMockElement('campaign-changelog-list').innerHTML;
  assert(changelogListHtml.includes('Initial Scout Spawn'), 'Changelog renders batch_01 summary');
  assert(changelogListHtml.includes('Advance Clock'), 'Changelog renders batch_02 summary');
  assert(changelogListHtml.includes('revertChangelogBatch'), 'Changelog includes Revert buttons');

  // Test 4: Filter changelog by keyword search
  getMockElement('changelog-search-input').value = 'Scout';
  sandbox.renderCampaignChangelog();
  const filteredSearchHtml = getMockElement('campaign-changelog-list').innerHTML;
  assert(filteredSearchHtml.includes('Initial Scout Spawn'), 'Search filter includes matching batch');
  assert(!filteredSearchHtml.includes('Advance Clock'), 'Search filter excludes non-matching batch');

  // Test 5: Filter changelog by category
  getMockElement('changelog-search-input').value = '';
  getMockElement('changelog-filter-select').value = 'clock';
  sandbox.renderCampaignChangelog();
  const filteredCategoryHtml = getMockElement('campaign-changelog-list').innerHTML;
  assert(filteredCategoryHtml.includes('Advance Clock'), 'Clock filter includes clock batch');
  assert(!filteredCategoryHtml.includes('Initial Scout Spawn'), 'Clock filter excludes non-clock batch');

  // Test 6: Sync Summary Digest Rendering & Dismissal
  getMockElement('changelog-filter-select').value = 'all';
  sandbox.window.__csNewUnseenBatches = [
    sandbox.Workstation.activeTopology.changelog[1]
  ];
  sandbox.openSyncSummaryDigestModal(true);
  assert(getMockElement('sync-digest-content').innerHTML.includes('Advance Clock'), 'Digest renders unseen batch');
  assertEqual(getMockElement('sync-digest-batch-count-badge').textContent, '1 new batch(es)', 'Badge displays count');

  sandbox.dismissSyncSummaryDigest();
  assertEqual(mockLocalStorage.getItem('cs_last_seen_batch_id_test_campaign'), 'batch_02', 'dismissSyncSummaryDigest records last seen batchId');
  assertEqual(sandbox.window.__csNewUnseenBatches.length, 0, '__csNewUnseenBatches cleared on dismiss');

  // Test 7: Conflict Resolution in Sync Digest
  sandbox.window.__csActiveConflicts = [
    {
      category: 'npcs',
      entityId: 'npc_1',
      field: 'role',
      baseValue: 'Miner',
      localValue: 'Laborer',
      remoteValue: 'Foreman'
    }
  ];
  sandbox.renderSyncSummaryDigest([]);
  assert(getMockElement('sync-digest-conflicts-list').innerHTML.includes('Miner'), 'Conflict list renders base value');
  assert(getMockElement('sync-digest-conflicts-list').innerHTML.includes('Laborer'), 'Conflict list renders local value');
  assert(getMockElement('sync-digest-conflicts-list').innerHTML.includes('Foreman'), 'Conflict list renders remote value');

  // Resolving keeping remote
  sandbox.resolveSyncConflict(0, 'remote');
  assertEqual(sandbox.Workstation.activeTopology.npcs[0].role, 'Foreman', 'resolveSyncConflict(remote) updates topology entity');
  assertEqual(sandbox.window.__csActiveConflicts.length, 0, 'Conflict removed after resolution');

  // Test 8: Revert Changelog Batch
  let invalidatedWiki = false;
  let savedActive = false;
  sandbox.buildWikiIndex = () => { invalidatedWiki = true; };
  sandbox.saveActiveCampaign = () => { savedActive = true; };
  sandbox.revertChangelogBatch('batch_01');
  assertEqual(sandbox.Workstation.activeTopology.npcs.length, 0, 'Reverting batch_01 deleted npc_1');
  assert(invalidatedWiki, 'revertChangelogBatch triggers wiki invalidation');
  assert(savedActive, 'revertChangelogBatch triggers saveActiveCampaign');
  assert(sandbox.Workstation.activeTopology.changelog.some(b => b.batchId && b.batchId.startsWith('revert-batch_01')), 'Compensation batch added to changelog');
}

// ============================================================================
// SUITE 43: NODE CLI CONSOLIDATION, NATIVE BIOME & ARCHITECTURAL GUARDRAILS
// ============================================================================
function testSuite43NodeCliNativeBiomeAndGuardrails() {
  console.log('\n--> SUITE 43: Node CLI Consolidation, Native Biome & Architectural Guardrails...');

  // 43.1: Native Biome Property & Eviction of regions/
  const inspectorCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/property_grid_inspector.js'), 'utf8');
  assert(inspectorCode.includes('CORE_BIOME_PRESETS'), 'property_grid_inspector.js defines CORE_BIOME_PRESETS');
  assert(inspectorCode.includes("node.biome = (val || '').trim()"), 'property_grid_inspector.js assigns native node.biome');
  assert(inspectorCode.includes("edgeRecord.biome = (val || '').trim()"), 'property_grid_inspector.js assigns native edgeRecord.biome');
  assert(!fs.existsSync(path.join(ROOT_DIR, 'regions/regional_image_browser.html')), 'regions/regional_image_browser.html evicted from active workspace');

  const manifestRaw = fs.readFileSync(path.join(ROOT_DIR, 'docs/navigation_manifest.json'), 'utf8');
  assert(!manifestRaw.includes('regions/regional_image_browser.html'), 'navigation_manifest.json does not reference regions/regional_image_browser.html');
  assert(manifestRaw.includes('docs/adr/0022-coauthoring-architecture-and-rejected-patterns.md'), 'navigation_manifest.json references ADR-0022');

  // 43.2: Node CLI Modules (scripts/find_codebase_node.js & scripts/test_suite.js)
  const findNodeCli = require(path.join(ROOT_DIR, 'scripts/find_codebase_node.js'));
  assert(typeof findNodeCli.findFileNode === 'function', 'find_codebase_node.js exports findFileNode');
  assert(typeof findNodeCli.searchSymbols === 'function', 'find_codebase_node.js exports searchSymbols');
  assert(typeof findNodeCli.getStaleFiles === 'function', 'find_codebase_node.js exports getStaleFiles');

  const testSuiteCli = require(path.join(ROOT_DIR, 'scripts/test_suite.js'));
  assert(typeof testSuiteCli.validateCampaignPackage === 'function', 'test_suite.js exports validateCampaignPackage');
  const peridotValidation = testSuiteCli.validateCampaignPackage('Peridot');
  assert(peridotValidation === true, 'validateCampaignPackage(Peridot) returns true');

  // 43.3: Backburner & Rejected Architecture Guardrail Tickets + ADR-0022
  const expectedFiles = [
    'tickets/system/SYS-BACKBURNER-01_byok_in_app_chatbot_deferred.md',
    'tickets/system/SYS-BACKBURNER-02_google_drive_virtual_directory_sync_deferred.md',
    'tickets/system/SYS-BACKBURNER-03_regional_image_explorer_external_mod.md',
    'tickets/system/SYS-REJECTED-01_parallel_app_html_and_css_presenter_mode.md',
    'tickets/system/SYS-REJECTED-02_background_sse_fs_watch_auto_replay.md',
    'docs/adr/0022-coauthoring-architecture-and-rejected-patterns.md'
  ];
  for (const rel of expectedFiles) {
    assert(fs.existsSync(path.join(ROOT_DIR, rel)), `Guardrail/Backburner artifact exists: ${rel}`);
  }
}

// ============================================================================
// SUITE 44: ACTIVE CAMPAIGN ROSTER & THREAT CLOCK MUTATION SEAM (M1)
// ============================================================================
function testSuite44RosterAndThreatClockMutationSeam() {
  console.log('\n--> SUITE 44: Active Campaign Roster & Threat Clock Mutation Seam (M1)...');

  const cme = require(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_mutation_engine.js'));
  assert(typeof cme.remapEntityCluster === 'function', 'CampaignMutationEngine exports remapEntityCluster');
  assert(typeof cme.executeBrowserConsequence === 'function', 'CampaignMutationEngine exports executeBrowserConsequence');

  // 44.1: deleteEntity 11-table foreign-key scrub across factions, npcs.relationships, items.ownerNpcId, trackers.consequences
  const scrubState = {
    factions: [
      { id: 'fac_alpha', name: 'Alpha Order', leaderNpcId: 'npc_boss', memberNpcIds: ['npc_boss', 'npc_guard'], controlledNodeIds: ['node_1'], homeNodeId: 'node_1', alliedFactionIds: ['fac_beta'], rivalFactionIds: ['fac_beta'], diplomaticStances: { fac_beta: 'Allied' } },
      { id: 'fac_beta', name: 'Beta Guild', diplomaticStances: { fac_alpha: 'Allied' } }
    ],
    npcs: [
      { id: 'npc_boss', name: 'Boss Vane', factionId: 'fac_beta', faction: 'fac_beta', relationships: [{ targetNpcId: 'npc_guard', type: 'Ally' }] },
      { id: 'npc_guard', name: 'Guard Lin', factionId: 'fac_beta', faction: 'fac_beta', currentNodeId: 'node_1', relationships: [{ targetNpcId: 'npc_boss', type: 'Liege' }], questIds: ['q_main'], inventoryItemIds: ['itm_key'] }
    ],
    quests: [
      { id: 'q_main', title: 'Vault Breach', giverNpcId: 'npc_boss', npcIds: ['npc_boss', 'npc_guard'], factionId: 'fac_beta', targetNodeId: 'node_1', rewardItemId: 'itm_key', itemIds: ['itm_key'], steps: [{ id: 's1', title: 'Meet Boss', targetNpcId: 'npc_boss', targetNodeId: 'node_1', requiredItemId: 'itm_key' }] }
    ],
    items: [
      { id: 'itm_key', name: 'Vault Key', ownerNpcId: 'npc_boss', possessionMode: 'carried', locationNodeId: 'node_1', linkedQuestId: 'q_main', factionId: 'fac_beta' }
    ],
    trackers: [
      { id: 'trk_alarm', name: 'Vault Alarm', nodeId: 'node_1', factionId: 'fac_beta', triggerRefs: [{ entityType: 'npc', entityId: 'npc_boss' }], consequences: [{ tick: 3, description: 'Boss alerts guards', targetType: 'npc', targetId: 'npc_boss', npcId: 'npc_boss', questId: 'q_main', nodeId: 'node_1' }] }
    ],
    tickets: [
      { id: 'tkt_1', title: 'Check Boss', linkedNpcId: 'npc_boss', linkedFactionId: 'fac_beta', linkedNodeId: 'node_1', linkedQuestId: 'q_main' }
    ],
    spatialPins: [
      { id: 'pin_1', label: 'Boss Pin', targetType: 'npc', targetId: 'npc_boss', linkedEntityId: 'npc_boss', links: [{ type: 'npc', id: 'npc_boss' }] }
    ]
  };

  cme.deleteEntity(scrubState, 'npc', 'npc_boss');
  assertEqual(scrubState.factions[0].leaderNpcId, null, 'deleteEntity(npc) scrubs faction.leaderNpcId');
  assertEqual(scrubState.factions[0].memberNpcIds, ['npc_guard'], 'deleteEntity(npc) filters faction.memberNpcIds');
  assertEqual(scrubState.npcs[0].relationships.length, 0, 'deleteEntity(npc) scrubs remaining npc.relationships');
  assertEqual(scrubState.items[0].ownerNpcId, null, 'deleteEntity(npc) clears item.ownerNpcId');
  assertEqual(scrubState.items[0].possessionMode, 'stored', 'deleteEntity(npc) reverts item.possessionMode to stored');
  assertEqual(scrubState.trackers[0].consequences[0].npcId, null, 'deleteEntity(npc) scrubs tracker.consequences[].npcId');
  assertEqual(scrubState.trackers[0].consequences[0].targetId, null, 'deleteEntity(npc) scrubs tracker.consequences[].targetId');
  assertEqual(scrubState.quests[0].giverNpcId, null, 'deleteEntity(npc) scrubs quest.giverNpcId');
  assertEqual(scrubState.quests[0].steps[0].targetNpcId, null, 'deleteEntity(npc) scrubs quest.steps[].targetNpcId');
  assertEqual(scrubState.tickets[0].linkedNpcId, null, 'deleteEntity(npc) scrubs ticket.linkedNpcId');
  assertEqual(scrubState.spatialPins[0].links.length, 0, 'deleteEntity(npc) scrubs spatialPin.links');

  cme.deleteEntity(scrubState, 'faction', 'fac_beta');
  assertEqual(scrubState.factions[0].diplomaticStances.fac_beta, undefined, 'deleteEntity(faction) scrubs faction.diplomaticStances key');
  assertEqual(scrubState.factions[0].alliedFactionIds.length, 0, 'deleteEntity(faction) scrubs faction.alliedFactionIds');
  assertEqual(scrubState.npcs[0].factionId, null, 'deleteEntity(faction) scrubs npc.factionId');

  // 44.2: remapEntityCluster remapping internal foreign keys across a cloned cluster
  const rawCluster = {
    factions: [{ id: 'fac_old', name: 'Old Order', leaderNpcId: 'npc_old', diplomaticStances: { fac_old: 'Neutral' } }],
    npcs: [{ id: 'npc_old', name: 'Captain Old', factionId: 'fac_old', questIds: ['q_old'], itemIds: ['itm_old'], relationships: [{ targetNpcId: 'npc_old', type: 'Self' }] }],
    quests: [{ id: 'q_old', title: 'Old Quest', giverNpcId: 'npc_old', npcIds: ['npc_old'], itemIds: ['itm_old'], trackerIds: ['trk_old'], steps: [{ id: 'st_1', title: 'Step 1', triggerTrackerId: 'trk_old', targetNpcId: 'npc_old', requiredItemId: 'itm_old' }] }],
    items: [{ id: 'itm_old', name: 'Old Blade', ownerNpcId: 'npc_old', linkedQuestId: 'q_old', factionId: 'fac_old' }],
    trackers: [{ id: 'trk_old', name: 'Old Clock', factionId: 'fac_old', triggerRefs: [{ entityType: 'quest', entityId: 'q_old' }], consequences: [{ tick: 2, questId: 'q_old', npcId: 'npc_old', targetId: 'q_old' }] }]
  };
  const customMap = new Map();
  let seq = 0;
  const remapped = cme.remapEntityCluster(rawCluster, {
    idMap: customMap,
    idGenerator: (type) => `${type}_new_${++seq}`
  });
  assert(remapped !== rawCluster && rawCluster.npcs[0].id === 'npc_old', 'remapEntityCluster deep-clones by default without mutating source');
  assertEqual(customMap.get('npc_old'), 'npc_new_2', 'remapEntityCluster populates passed Map instance');
  assertEqual(remapped.factions[0].leaderNpcId, 'npc_new_2', 'remapEntityCluster remaps faction.leaderNpcId');
  assertEqual(remapped.npcs[0].factionId, 'faction_new_1', 'remapEntityCluster remaps npc.factionId');
  assertEqual(remapped.npcs[0].prototypeId, 'npc_old', 'remapEntityCluster preserves prototypeId');
  assertEqual(remapped.quests[0].giverNpcId, 'npc_new_2', 'remapEntityCluster remaps quest.giverNpcId');
  assertEqual(remapped.quests[0].steps[0].triggerTrackerId, 'tracker_new_5', 'remapEntityCluster remaps quest.steps[].triggerTrackerId');
  assertEqual(remapped.items[0].ownerNpcId, 'npc_new_2', 'remapEntityCluster remaps item.ownerNpcId');
  assertEqual(remapped.trackers[0].triggerRefs[0].entityId, 'quest_new_3', 'remapEntityCluster remaps tracker.triggerRefs[].entityId');
  assertEqual(remapped.trackers[0].consequences[0].questId, 'quest_new_3', 'remapEntityCluster remaps tracker.consequences[].questId');

  // 44.3: CAD canvas Threat Clock tick (handleClockSegmentClick & tickClock) firing threshold consequences
  const ciCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/cad_interaction.js'), 'utf8');
  const cadSandbox = {
    window: {},
    CampaignMutationEngine: cme,
    CreatorStudio: { ai: cme },
    Workstation: {
      activeTopology: {
        nodes: { '1': { id: 1, name: 'Hidden Sanctum', hidden: true, odv: { s: 2, e: 2, c: 2 }, disposition: [2, 2, 2] } },
        quests: [{ id: 'q_locked', title: 'Sanctum Siege', status: 'Inactive', unlocked: false }],
        npcs: [{ id: 'npc_sleeper', name: 'Sleeper Agent', status: 'Inactive' }],
        trackers: [{
          id: 'trk_canvas',
          name: 'Doomsday Clock',
          currentTicks: 1,
          maxTicks: 4,
          consequences: [
            { tick: 2, description: 'Unlock Siege Quest', type: 'unlock_quest', targetId: 'q_locked' },
            { tick: 3, description: 'Reveal Sanctum & Wake Agent', type: 'reveal_node', nodeId: '1', operations: [{ op: 'set_npc_status', npc: 'npc_sleeper', status: 'Active' }] }
          ]
        }]
      }
    },
    document: { addEventListener: () => {}, getElementById: () => null },
    console
  };
  cadSandbox.window = cadSandbox;
  vm.createContext(cadSandbox);
  vm.runInContext(ciCode, cadSandbox);

  cadSandbox.handleClockSegmentClick(null, 'trk_canvas', 2); // Advances from 1 to 3 (segmentIdx 2 -> 3 ticks)
  const tickedTrk = cadSandbox.Workstation.activeTopology.trackers[0];
  assertEqual(tickedTrk.currentTicks, 3, 'handleClockSegmentClick advances clock to 3 ticks');
  assertEqual(tickedTrk._lastTriggeredConsequences.length, 2, 'tickClock attaches _lastTriggeredConsequences for crossed thresholds 2 and 3');
  assertEqual(cadSandbox.Workstation.activeTopology.quests[0].status, 'Active', 'Browser consequence unlock_quest activates quest');
  assertEqual(cadSandbox.Workstation.activeTopology.nodes['1'].hidden, false, 'Browser consequence reveal_node unhides node');
  assertEqual(cadSandbox.Workstation.activeTopology.npcs[0].status, 'Active', 'Operation consequence activates sleeper NPC');

  // 44.4: selective_importer.js clone resolution remapping cross-entity foreign keys
  const importerCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/selective_importer.js'), 'utf8');
  const impSandbox = {
    window: {},
    CampaignMutationEngine: cme,
    addEventListener: () => {},
    document: { getElementById: () => null },
    console
  };
  impSandbox.window = impSandbox;
  vm.createContext(impSandbox);
  vm.runInContext(importerCode, impSandbox);

  const curTopo = {
    npcs: [{ id: 'npc_shared', name: 'Marshal Kael', role: 'Loyalist', faction: 'Crown' }],
    quests: [{ id: 'q_shared', title: 'Border Patrol', status: 'Active', notes: 'Original patrol', npcIds: ['npc_shared'], giverNpcId: 'npc_shared' }],
    items: [],
    trackers: [],
    tickets: [],
    factions: []
  };
  const incomingPkgEntities = {
    npcs: [{ id: 'npc_shared', name: 'Marshal Kael', role: 'Defector', faction: 'Rebels' }],
    quests: [{ id: 'q_shared', title: 'Border Patrol', status: 'Pending', notes: 'Variant patrol', npcIds: ['npc_shared'], giverNpcId: 'npc_shared' }],
    items: [],
    trackers: [],
    tickets: [],
    factions: []
  };
  const impConflicts = impSandbox.detectEntityConflicts(incomingPkgEntities, curTopo);
  impSandbox.mergeEntitiesWithResolutions(curTopo, incomingPkgEntities, impConflicts, { 0: 'clone', 1: 'clone' });

  const clonedNpc = curTopo.npcs.find(n => n.id !== 'npc_shared');
  const clonedQuest = curTopo.quests.find(q => q.id !== 'q_shared');
  assert(!!clonedNpc && !!clonedQuest, 'Both colliding NPC and Quest were cloned');
  assertEqual(clonedQuest.giverNpcId, clonedNpc.id, 'Cloned quest giverNpcId remapped to cloned NPC ID');
  assert(clonedQuest.npcIds.includes(clonedNpc.id) && !clonedQuest.npcIds.includes('npc_shared'), 'Cloned quest npcIds remapped to cloned NPC ID');
  assertEqual(curTopo.quests.find(q => q.id === 'q_shared').giverNpcId, 'npc_shared', 'Original quest still points to original NPC ID');
}

function testSuite45CorridorSeamAndKeyCanonicalization() {
  console.log('\n--- Suite 45: Transit Road Edge (E_adj) & Influence Link (E_inf) Corridor Seam (M2) ---');
  const cme = require(path.join(ROOT, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js'));

  // 1. formatCorridorKey & parseCorridorKey
  assertEqual(cme.formatCorridorKey(10, 2, 'adj'), '2-10', 'Numeric road key sorts numerically (2-10, not 10-2)');
  assertEqual(cme.formatCorridorKey('10', '2', 'adj'), '2-10', 'Numeric string road key sorts numerically');
  assertEqual(cme.formatCorridorKey('SLV10', 'SLV2', 'adj'), 'SLV2-SLV10', 'Alphanumeric submap road key uses natural numeric ordering');
  assertEqual(cme.formatCorridorKey('SLV1', 'SLV2', 'inf'), 'SLV1->SLV2', 'Directed influence link preserves u->v direction');
  assertEqual(cme.formatCorridorKey(5, 2, 'influence'), '5->2', 'Directed influence link preserves numeric direction 5->2');

  const pAdj = cme.parseCorridorKey('10-2');
  assert(pAdj && pAdj.u === 10 && pAdj.v === 2 && pAdj.type === 'adj' && pAdj.canonicalKey === '2-10', 'parseCorridorKey parses numeric road and normalizes canonicalKey');

  const pLegacy = cme.parseCorridorKey('1--2');
  assert(pLegacy && pLegacy.u === 1 && pLegacy.v === 2 && pLegacy.type === 'adj' && pLegacy.canonicalKey === '1-2', 'parseCorridorKey migrates legacy double-hyphen 1--2 to 1-2');

  const pAlphaAdj = cme.parseCorridorKey('SLV10-SLV2');
  assert(pAlphaAdj && pAlphaAdj.u === 'SLV10' && pAlphaAdj.v === 'SLV2' && pAlphaAdj.type === 'adj' && pAlphaAdj.canonicalKey === 'SLV2-SLV10', 'parseCorridorKey parses alphanumeric road key');

  const pAlphaInf = cme.parseCorridorKey('SLV1->SLV2');
  assert(pAlphaInf && pAlphaInf.u === 'SLV1' && pAlphaInf.v === 'SLV2' && pAlphaInf.type === 'inf' && pAlphaInf.canonicalKey === 'SLV1->SLV2', 'parseCorridorKey parses alphanumeric influence link');

  assertEqual(cme.parseCorridorKey('invalid_key'), null, 'parseCorridorKey returns null on invalid key');

  // 2. corridorMatchesNode
  assert(cme.corridorMatchesNode('1-2', 1) === true, 'corridorMatchesNode matches numeric road endpoint 1');
  assert(cme.corridorMatchesNode('1->2', 1) === true, 'corridorMatchesNode matches directed influence source 1');
  assert(cme.corridorMatchesNode('1->2', 2) === true, 'corridorMatchesNode matches directed influence target 2');
  assert(cme.corridorMatchesNode('SLV1->SLV2', 'SLV2') === true, 'corridorMatchesNode matches alphanumeric submap node SLV2');
  assert(cme.corridorMatchesNode('10-2', 1) === false, 'corridorMatchesNode avoids false positive matching 1 against 10-2');
  assert(cme.corridorMatchesNode('SLV10->SLV2', 'SLV1') === false, 'corridorMatchesNode avoids false positive matching SLV1 against SLV10->SLV2');

  // 3. addCorridor, removeCorridor & removeCorridorsForNode
  const topo = {
    nodes: {
      '1': { id: 1, name: 'Node 1', adj: [], infBy: [] },
      '2': { id: 2, name: 'Node 2', adj: [], infBy: [] },
      '3': { id: 3, name: 'Node 3', adj: [], infBy: [] }
    },
    links: [
      { source: 1, target: 2, type: 'road' },
      { source: 1, target: 3, type: 'hegemony' },
      { source: 2, target: 3, type: 'road' }
    ],
    edgeData: {
      '1--2': { condition: 'Legacy Road' }
    },
    edgeNotes: {
      '1-2': 'Road note 1-2',
      '1->3': 'Influence note 1->3',
      '2-3': 'Road note 2-3'
    },
    edgeSlottedModules: {
      '1-2': ['MOD-ROAD-12'],
      '1->3': ['MOD-INF-13'],
      '2-3': ['MOD-ROAD-23']
    }
  };
  const externalEdgeSlotted = {
    '1-2': ['MOD-ROAD-12'],
    '1->3': ['MOD-INF-13'],
    '2-3': ['MOD-ROAD-23']
  };

  const addedRoad = cme.addCorridor(topo, 2, 1, 'adj', { condition: 'Paved Highway' });
  assertEqual(addedRoad.key, '1-2', 'addCorridor returns canonical road key 1-2');
  assert(topo.nodes['1'].adj.includes(2) && topo.nodes['2'].adj.includes(1), 'addCorridor populates symmetric adj arrays');
  assertEqual(topo.edgeData['1-2'].condition, 'Paved Highway', 'addCorridor writes metadata to canonical key');

  const addedInf = cme.addCorridor(topo, 1, 3, 'inf', { condition: 'Tribute' });
  assertEqual(addedInf.key, '1->3', 'addCorridor returns canonical influence key 1->3');
  assert(topo.nodes['3'].infBy.includes(1), 'addCorridor populates target infBy array');
  assertEqual(topo.edgeData['1->3'].condition, 'Tribute', 'addCorridor writes influence metadata');

  cme.addCorridor(topo, 2, 3, 'adj', { condition: 'Rough Terrain' });

  // Remove road 1-2 (and legacy 1--2)
  cme.removeCorridor(topo, 1, 2, 'adj', { edgeSlottedModules: externalEdgeSlotted });
  assert(!topo.nodes['1'].adj.includes(2) && !topo.nodes['2'].adj.includes(1), 'removeCorridor removes 1-2 from both adj arrays');
  assert(!topo.edgeData['1-2'] && !topo.edgeData['1--2'], 'removeCorridor scrubs canonical 1-2 and legacy 1--2 from edgeData');
  assert(!topo.edgeNotes['1-2'], 'removeCorridor scrubs 1-2 from edgeNotes');
  assert(!topo.edgeSlottedModules['1-2'] && !externalEdgeSlotted['1-2'], 'removeCorridor scrubs 1-2 from edgeSlottedModules');
  assertEqual(topo.links.length, 2, 'removeCorridor removes matching road link from links');

  // Remove all corridors for node 3 (scrubs both 1->3 and 2-3)
  cme.removeCorridorsForNode(topo, 3, { edgeSlottedModules: externalEdgeSlotted });
  assert(!topo.nodes['2'].adj.includes(3), 'removeCorridorsForNode scrubs node 3 from node 2 adj');
  assert(!topo.nodes['3'].infBy.includes(1), 'removeCorridorsForNode scrubs node 3 infBy');
  assert(!topo.edgeData['1->3'] && !topo.edgeData['2-3'], 'removeCorridorsForNode scrubs both 1->3 and 2-3 from edgeData');
  assert(!topo.edgeNotes['1->3'] && !topo.edgeNotes['2-3'], 'removeCorridorsForNode scrubs both 1->3 and 2-3 from edgeNotes');
  assert(!topo.edgeSlottedModules['1->3'] && !externalEdgeSlotted['1->3'], 'removeCorridorsForNode scrubs 1->3 from edgeSlottedModules');
  assertEqual(topo.links.length, 0, 'removeCorridorsForNode removes all links incident to node 3');

  // 4. Verify browser callers use the canonical corridor seam
  const propGridSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'property_grid_inspector.js'), 'utf8');
  assert(!propGridSrc.includes('Math.min(uId, vId)}--${Math.max(uId, vId)'), 'property_grid_inspector.js has zero legacy Math.min--Math.max key constructions');
  assert(propGridSrc.includes('CampaignMutationEngine.formatCorridorKey'), 'property_grid_inspector.js uses CampaignMutationEngine.formatCorridorKey');
  assert(propGridSrc.includes('CampaignMutationEngine.removeCorridor'), 'property_grid_inspector.js uses CampaignMutationEngine.removeCorridor');

  const cadSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'cad_interaction.js'), 'utf8');
  assert(cadSrc.includes('CampaignMutationEngine.removeCorridorsForNode'), 'cad_interaction.js uses CampaignMutationEngine.removeCorridorsForNode');
  assert(cadSrc.includes('CampaignMutationEngine.removeCorridor'), 'cad_interaction.js uses CampaignMutationEngine.removeCorridor');

  const exporterSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'campaign_exporter.js'), 'utf8');
  assert(exporterSrc.includes('CampaignMutationEngine.parseCorridorKey'), 'campaign_exporter.js uses CampaignMutationEngine.parseCorridorKey');

  const cascadeSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'entity_cascade_delete.js'), 'utf8');
  assert(cascadeSrc.includes('CampaignMutationEngine.removeCorridorsForNode'), 'entity_cascade_delete.js uses CampaignMutationEngine.removeCorridorsForNode');
}

function testSuite46PointcrawlGraphNodeSeam() {
  console.log('\n--- Suite 46: Hierarchical Cartography Pointcrawl Graph Node Seam (M3) ---');
  const cme = require(path.join(ROOT, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js'));

  // 1. ensureQueryableNodesCollection on Dictionary
  const dict = {
    '1': { id: 1, name: 'Candlekeep', adj: [2], infBy: [] },
    'SLV1': { id: 'SLV1', name: 'Beregost', adj: [], infBy: [1] }
  };
  cme.ensureQueryableNodesCollection(dict);

  // Non-enumerable methods check
  assertEqual(typeof dict.find, 'function', 'dict.find is attached');
  assertEqual(typeof dict.filter, 'function', 'dict.filter is attached');
  assertEqual(typeof dict.map, 'function', 'dict.map is attached');
  assertEqual(typeof dict.forEach, 'function', 'dict.forEach is attached');
  assertEqual(typeof dict.some, 'function', 'dict.some is attached');
  assertEqual(typeof dict.every, 'function', 'dict.every is attached');
  assertEqual(typeof dict.toArray, 'function', 'dict.toArray is attached');

  // Pure dictionary keys & serialization invariant
  const keys = Object.keys(dict).sort();
  assertEqual(keys.length, 2, 'Object.keys(dict) length is exactly 2');
  assertEqual(keys[0], '1', 'Key 0 is "1"');
  assertEqual(keys[1], 'SLV1', 'Key 1 is "SLV1"');
  const values = Object.values(dict);
  assertEqual(values.length, 2, 'Object.values(dict) length is exactly 2');
  const jsonParsed = JSON.parse(JSON.stringify(dict));
  assertEqual(Object.keys(jsonParsed).length, 2, 'JSON.stringify preserves pure dictionary keys');

  // Method behavior
  const found1 = dict.find(n => n.id === 1);
  assert(found1 && found1.name === 'Candlekeep', 'dict.find locates numeric node 1');
  const foundSlv = dict.find(n => n.id === 'SLV1');
  assert(foundSlv && foundSlv.name === 'Beregost', 'dict.find locates alphanumeric node SLV1');
  assertEqual(dict.filter(n => n.name.includes('e')).length, 2, 'dict.filter works correctly');
  assertEqual(dict.map(n => n.name).join(','), 'Candlekeep,Beregost', 'dict.map works correctly');
  assert(dict.some(n => n.id === 1), 'dict.some works correctly');
  assert(dict.every(n => Boolean(n.id)), 'dict.every works correctly');
  assertEqual(dict.toArray().length, 2, 'dict.toArray returns an array of length 2');

  // 2. getNodesList, getNodesMap, getNodeById, upsertNode, removeNode on Array vs Dictionary
  const arrayTopo = {
    nodes: [
      { id: 1, name: 'Candlekeep', adj: [2], infBy: [] },
      { id: 'SLV1', name: 'Beregost', adj: [], infBy: [1] }
    ]
  };
  const dictTopo = {
    nodes: {
      '1': { id: 1, name: 'Candlekeep', adj: [2], infBy: [] },
      'SLV1': { id: 'SLV1', name: 'Beregost', adj: [], infBy: [1] }
    }
  };

  // getNodesList
  const arrList = cme.getNodesList(arrayTopo);
  const dictList = cme.getNodesList(dictTopo);
  assertEqual(arrList.length, 2, 'getNodesList on Array topo returns 2 nodes');
  assertEqual(dictList.length, 2, 'getNodesList on Dict topo returns 2 nodes');
  assertEqual(cme.getNodesList(dict).length, 2, 'getNodesList on direct Dict returns 2 nodes');
  assertEqual(cme.getNodesList(null).length, 0, 'getNodesList on null returns empty array');

  // getNodesMap
  const arrMap = cme.getNodesMap(arrayTopo);
  const dictMap = cme.getNodesMap(dictTopo);
  assertEqual(Object.keys(arrMap).length, 2, 'getNodesMap on Array topo returns dict with 2 keys');
  assertEqual(Object.keys(dictMap).length, 2, 'getNodesMap on Dict topo returns dict with 2 keys');
  assert(arrMap['1'] && arrMap['SLV1'], 'getNodesMap has keys "1" and "SLV1"');
  assert(typeof arrMap.find === 'function', 'getNodesMap returns queryable collection');

  // getNodeById
  assertEqual(cme.getNodeById(arrayTopo, 1).name, 'Candlekeep', 'getNodeById(1) on Array topo');
  assertEqual(cme.getNodeById(dictTopo, 1).name, 'Candlekeep', 'getNodeById(1) on Dict topo');
  assertEqual(cme.getNodeById(arrayTopo, 'SLV1').name, 'Beregost', 'getNodeById(SLV1) on Array topo');
  assertEqual(cme.getNodeById(dictTopo, 'SLV1').name, 'Beregost', 'getNodeById(SLV1) on Dict topo');
  assertEqual(cme.getNodeById(dictTopo, null), null, 'getNodeById(null) returns null');
  assertEqual(cme.getNodeById(dictTopo, 'nonexistent'), null, 'getNodeById for nonexistent node returns null');

  // upsertNode
  cme.upsertNode(arrayTopo, { id: 3, name: 'Nashkel' });
  cme.upsertNode(dictTopo, { id: 3, name: 'Nashkel' });
  assertEqual(cme.getNodeById(arrayTopo, 3).name, 'Nashkel', 'upsertNode adds to Array topo');
  assertEqual(cme.getNodeById(dictTopo, 3).name, 'Nashkel', 'upsertNode adds to Dict topo');
  assert(typeof dictTopo.nodes.find === 'function', 'Dict topo nodes remains queryable after upsertNode');
  assertEqual(dictTopo.nodes.find(n => n.id === 3).name, 'Nashkel', 'Dict topo nodes.find finds upserted node');

  // removeNode & cascade scrub
  cme.removeNode(arrayTopo, 3);
  cme.removeNode(dictTopo, 3);
  assertEqual(cme.getNodeById(arrayTopo, 3), null, 'removeNode removes from Array topo');
  assertEqual(cme.getNodeById(dictTopo, 3), null, 'removeNode removes from Dict topo');

  // 3. pack_engine.js portal/node resolution when topo.nodes is a Dictionary and global nodes is empty
  const packEngineSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'pack_engine.js'), 'utf8');
  assert(!packEngineSrc.includes("(topo.nodes || [])"), 'pack_engine.js no longer uses unsafe (topo.nodes || [])');
  assert(packEngineSrc.includes('CampaignMutationEngine.getNodesList'), 'pack_engine.js uses CampaignMutationEngine.getNodesList');

  // Test simulation: Anchor resolution on Dictionary topo without global nodes array
  const mockTopo = {
    nodes: {
      '10': { id: 10, name: 'Portal Gate', childMapId: null }
    }
  };
  const resolvedList = cme.getNodesList(mockTopo);
  const foundAnchor = resolvedList.find(n => n && n.id == 10);
  assert(foundAnchor && foundAnchor.name === 'Portal Gate', 'Portal anchor node found in Dictionary topo without TypeError');

  // 4. Exporter and sandbox seam check (SYS-ARCH-01: the engine UMD tail, mirrored by injectEngine, is the only alias publisher)
  const seamSandbox = {};
  injectEngine(seamSandbox);
  assert(typeof seamSandbox.ensureQueryableNodesCollection === 'function', 'injected sandbox exposes ensureQueryableNodesCollection from the engine');
  assert(typeof seamSandbox.getNodesList === 'function', 'injected sandbox exposes getNodesList from the engine');

  const exporterSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'campaign_exporter.js'), 'utf8');
  assert(exporterSrc.includes('CampaignMutationEngine.getNodesList'), 'campaign_exporter.js uses CampaignMutationEngine.getNodesList in resolveMapNodes');
  assert(exporterSrc.includes('CampaignMutationEngine.getNodeById'), 'campaign_exporter.js uses CampaignMutationEngine.getNodeById in findNodeObj');
}

function testSuite47IndustryChainImporterAndDeduplication() {
  console.log('--> SUITE 47: Industry Chain Importer & Deduplication Engine (SYS-RES-01..04)...');

  const IndustryChainImporter = require(path.join(ROOT, 'src', 'workstation', 'scripts', 'industry_chain_importer.js'));
  assert(IndustryChainImporter && typeof IndustryChainImporter.getAvailableIndustryChains === 'function', 'IndustryChainImporter exports getAvailableIndustryChains');
  assert(typeof IndustryChainImporter.auditChainDeduplication === 'function', 'IndustryChainImporter exports auditChainDeduplication');
  assert(typeof IndustryChainImporter.openIndustryChainImporterModal === 'function', 'IndustryChainImporter exports openIndustryChainImporterModal');

  // Test benchmark industry chains detection (from Universal Pre-Industrial Resource Mod & Peridot)
  const manifestPath = path.join(ROOT, 'campaigns', 'Peridot', 'modules_manifest.json');
  const modManifestPath = path.join(ROOT, 'mods', 'pre_industrial_resources', 'modules_manifest.json');
  let testModules = [];
  if (fs.existsSync(manifestPath)) {
    testModules = testModules.concat(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
  }
  if (fs.existsSync(modManifestPath)) {
    const rawModManifest = JSON.parse(fs.readFileSync(modManifestPath, 'utf8'));
    testModules = testModules.concat(rawModManifest.map(m => ({ ...m, mod_id: 'pre_industrial_resources' })));
  }
  global.ALL_MODULES = testModules;

  const chains = IndustryChainImporter.getAvailableIndustryChains();
  assert(chains['CHAIN-SUGAR'], 'Detected CHAIN-SUGAR in catalog');
  if (chains['CHAIN-SUGAR']) {
    assertEqual(chains['CHAIN-SUGAR'].stages.length, 3, 'CHAIN-SUGAR contains 3 stages');
    assertEqual(chains['CHAIN-SUGAR'].stages[0].module.id, 'AGRI-SUGAR-01', 'CHAIN-SUGAR Stage 1 is AGRI-SUGAR-01');
    assertEqual(chains['CHAIN-SUGAR'].stages[1].module.id, 'AGRI-SUGAR-02', 'CHAIN-SUGAR Stage 2 is AGRI-SUGAR-02');
    assertEqual(chains['CHAIN-SUGAR'].stages[2].module.id, 'AGRI-SUGAR-03', 'CHAIN-SUGAR Stage 3 is AGRI-SUGAR-03');
  }

  assert(chains['CHAIN-STEEL'], 'Detected CHAIN-STEEL in catalog');
  assert(chains['CHAIN-IRON'], 'Detected CHAIN-IRON in catalog');
  assert(chains['CHAIN-COAL'], 'Detected CHAIN-COAL in catalog');

  // Test Deduplication Auditing:
  // Setup mock topology with existing Iron Mining facility (Node 1 has MINE-IRON-01, Node 2 has MINE-IRON-02)
  const mockTopo = {
    nodes: {
      '1': { id: 1, name: 'Red Bluffs Quarry', modules: ['MINE-IRON-01'] },
      '2': { id: 2, name: 'Great Smelter Basin', modules: ['MINE-IRON-02'] }
    },
    edgeData: {}
  };
  global.nodeSlottedModules = {
    '1': ['MINE-IRON-01'],
    '2': ['MINE-IRON-02']
  };

  const ironAudit = IndustryChainImporter.auditChainDeduplication('CHAIN-IRON', mockTopo);
  assert(ironAudit && ironAudit.stages.length === 3, 'auditChainDeduplication returns 3 stages for CHAIN-IRON');
  assertEqual(ironAudit.stages[0].status, 'already_slotted', 'Stage 1 (MINE-IRON-01) detected as already_slotted');
  assertEqual(ironAudit.stages[0].matchedNodeId, '1', 'Stage 1 matched to Node 1');
  assertEqual(ironAudit.stages[1].status, 'already_slotted', 'Stage 2 (MINE-IRON-02) detected as already_slotted');
  assertEqual(ironAudit.stages[1].matchedNodeId, '2', 'Stage 2 matched to Node 2');
  assertEqual(ironAudit.stages[2].status, 'unmet', 'Stage 3 (IND-IRON-03) detected as unmet');

  // When auditing Steel (which requires Iron & Coal), Stage 3 is unmet while stages 1 & 2 are already satisfied!
  const steelAudit = IndustryChainImporter.auditChainDeduplication('CHAIN-STEEL', mockTopo);
  assert(steelAudit && steelAudit.stages.length >= 1, 'auditChainDeduplication returns stages for CHAIN-STEEL');
  const steelStage = steelAudit.stages.find(s => s.moduleId === 'IND-STEEL-01');
  assert(steelStage && steelStage.status === 'unmet', 'Crucible Steelworks correctly identified as unmet and requiring placement');

  // Test Idempotent Prototype Promotion
  const entityCoreSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'entity_core.js'), 'utf8');
  assert(entityCoreSrc.includes('const existing = activeList.find(e => String(e.prototypeId) === String(proto.id) || String(e.id) === String(proto.id));'), 'entity_core.js enforces prototype promotion idempotency');

  // Test Cascade Deletion Conduit Cleanup
  const cascadeDeleteSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'entity_cascade_delete.js'), 'utf8');
  assert(cascadeDeleteSrc.includes('flow.sourceModuleId'), 'entity_cascade_delete.js purges dedicatedFlows by sourceModuleId on module delete');

  // Test Runtime Mod Toggle & DF Stockpile Simulator
  const workstationStateSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'workstation_state.js'), 'utf8');
  assert(workstationStateSrc.includes('disabledMods:'), 'workstation_state.js declares disabledMods');
  assert(workstationStateSrc.includes('promptLoadRuntimeModFile'), 'workstation_state.js defines promptLoadRuntimeModFile');
  assert(workstationStateSrc.includes('toggleWorkstationMod'), 'workstation_state.js defines toggleWorkstationMod');

  const supplySimSrc = fs.readFileSync(path.join(ROOT, 'src', 'workstation', 'scripts', 'supply_chain_simulator.js'), 'utf8');
  assert(supplySimSrc.includes('onAdvanceSupplyTurn'), 'supply_chain_simulator.js invokes onAdvanceSupplyTurn mod lifecycle hook');

  const preIndustrialMod = require(path.join(ROOT, 'mods', 'pre_industrial_resources', 'mod.js'));
  assert(preIndustrialMod && typeof preIndustrialMod.onAdvanceSupplyTurn === 'function', 'pre_industrial_resources mod exports onAdvanceSupplyTurn');
  assert(typeof preIndustrialMod._advanceDfSupplySimulation === 'function', 'pre_industrial_resources exports _advanceDfSupplySimulation');

  // Test DF Turn Simulation in action
  global.nodeSlottedModules = {
    '1': ['MINE-IRON-01'],
    '2': ['MINE-IRON-02']
  };
  const simTopo = {
    nodes: [
      { id: 1, name: 'Mining Pit', modules: ['MINE-IRON-01'], provides: ['Ore: Raw-Iron-Ore [10]'], adj: [2] },
      { id: 2, name: 'Blast Furnace', modules: ['MINE-IRON-02'], requires: ['Ore: Raw-Iron-Ore [5]', 'Fuel: Charcoal-or-Coal [5]'], provides: ['Metal: Pig-Iron [5]'], adj: [1] }
    ],
    edgeData: {
      '1-2': { condition: 'Passable', capacity: 25, modData: { pre_industrial_resources: { inTransit: [] } } }
    },
    modData: {
      pre_industrial_resources: { dfSimEnabled: true }
    }
  };

  // Seed node 1 with some output
  const n1Store = preIndustrialMod._ensureNodeStorage(simTopo.nodes[0]);
  n1Store.outputBin['Ore: Raw-Iron-Ore'] = { qty: 10, cap: 20 };

  // Run turn 1: Auto-dispatches 5 ore into edge '1-2'
  const turn1Res = preIndustrialMod._advanceDfSupplySimulation({ topo: simTopo, nodes: simTopo.nodes });
  assert(turn1Res.active === true, 'DF Simulation is active');
  assertEqual(n1Store.outputBin['Ore: Raw-Iron-Ore'].qty, 6, '1 unit produced via baseline extraction and 5 units dispatched from outputBin');
  const edgeStore = simTopo.edgeData['1-2'].modData.pre_industrial_resources;
  assertEqual(edgeStore.inTransit.length, 1, 'Caravan in transit on edge 1-2');
  assertEqual(edgeStore.inTransit[0].qty, 5, 'Caravan has 5 units of Ore: Raw-Iron-Ore');

  // Seed fuel for MINE-IRON-02 so all inputs are met
  const n2Store = preIndustrialMod._ensureNodeStorage(simTopo.nodes[1]);
  n2Store.stockpile['Fuel: Charcoal-or-Coal'] = { qty: 10, cap: 50 };

  // Run turn 2: Caravan delivered to Node 2 inputHopper, and Furnace processes inputs -> outputs
  const turn2Res = preIndustrialMod._advanceDfSupplySimulation({ topo: simTopo, nodes: simTopo.nodes });
  if (!n2Store.outputBin['Metal: Pig-Iron']) {
    console.log('DEBUG n2Store on fail:', JSON.stringify(n2Store));
    console.log('DEBUG turn2Res:', turn2Res);
    console.log('DEBUG modules for node 2:', global.ALL_MODULES.find(m => m.id === 'MINE-IRON-02'));
  }
  assertEqual(turn2Res.deliveredShipments, 1, 'Caravan delivered in turn 2');
  assert(n2Store.outputBin['Metal: Pig-Iron'] && n2Store.outputBin['Metal: Pig-Iron'].qty > 0, 'Furnace produced Pig-Iron into outputBin');

  // 1. Stage 1 extraction module (MINE-IRON-01) baseline extraction without Timber: Mine-Props
  global.nodeSlottedModules = {
    '101': ['MINE-IRON-01']
  };
  const extractionTopo = {
    nodes: [
      { id: 101, name: 'Open Cast Quarry', modules: ['MINE-IRON-01'], provides: ['Ore: Raw-Iron-Ore'], adj: [] }
    ],
    edgeData: {},
    modData: { pre_industrial_resources: { dfSimEnabled: true } }
  };
  const extStore = preIndustrialMod._ensureNodeStorage(extractionTopo.nodes[0]);
  assertEqual(extStore.inputHopper['Timber: Mine-Props']?.qty || 0, 0, 'No timber props pre-seeded in hopper');
  const extTurnRes = preIndustrialMod._advanceDfSupplySimulation({ topo: extractionTopo, nodes: extractionTopo.nodes });
  assertEqual(extTurnRes.unitsProduced, 1, 'Baseline extraction produced 1 unit on Turn 1');
  assert(extStore.outputBin['Ore: Raw-Iron-Ore'] && extStore.outputBin['Ore: Raw-Iron-Ore'].qty >= 1, 'Stage 1 extraction module produced Ore: Raw-Iron-Ore');

  // 2. Multi-hop dispatch across a 3-node chain (Node 1 [Mine] -> Node 2 [Waystation] -> Node 3 [Furnace]) where topo.edgeData starts empty {}
  global.nodeSlottedModules = {
    '1': ['MINE-IRON-01'],
    '2': [],
    '3': ['MINE-IRON-02']
  };
  const multiHopTopo = {
    nodes: [
      { id: 1, name: 'Iron Mine', modules: ['MINE-IRON-01'], provides: ['Ore: Raw-Iron-Ore'], adj: [2] },
      { id: 2, name: 'Waystation', modules: [], adj: [1, 3] },
      { id: 3, name: 'Blast Furnace', modules: ['MINE-IRON-02'], requires: ['Ore: Raw-Iron-Ore [5]', 'Fuel: Charcoal-or-Coal [5]'], provides: ['Metal: Pig-Iron [5]'], adj: [2] }
    ],
    edgeData: {},
    modData: { pre_industrial_resources: { dfSimEnabled: true } }
  };
  const mh1Store = preIndustrialMod._ensureNodeStorage(multiHopTopo.nodes[0]);
  mh1Store.outputBin['Ore: Raw-Iron-Ore'] = { qty: 5, cap: 20 };
  const mhTurnRes = preIndustrialMod._advanceDfSupplySimulation({ topo: multiHopTopo, nodes: multiHopTopo.nodes });
  assert(multiHopTopo.edgeData['1-2'], 'EdgeData 1-2 was auto-created from empty edgeData');
  const mhEdgeStore = multiHopTopo.edgeData['1-2'].modData.pre_industrial_resources;
  assertEqual(mhEdgeStore.inTransit.length, 1, 'Caravan dispatched multi-hop towards waystation');
  assertEqual(mhEdgeStore.inTransit[0].resource, 'Ore: Raw-Iron-Ore', 'Caravan resource is Ore: Raw-Iron-Ore');
  assertEqual(mhEdgeStore.inTransit[0].to, 2, 'Caravan destination is intermediate waystation Node 2');

  // 3. Setting Workstation.disabledMods filters out mod modules and re-enabling restores them
  global.Workstation = global.Workstation || {};
  Workstation.disabledMods = { pre_industrial_resources: true };
  const disabledChains = IndustryChainImporter.getAvailableIndustryChains();
  assert(!disabledChains['CHAIN-SUGAR'], 'Disabled mod causes pre_industrial_resources modules to be excluded');
  Workstation.disabledMods = {};
  const restoredChains = IndustryChainImporter.getAvailableIndustryChains();
  assert(restoredChains['CHAIN-SUGAR'], 'Resetting disabledMods restores pre_industrial_resources modules');
}

// ============================================================================
// SUITE 51: IMPORTER REGRESSIONS - stale chain selection & conduit flow overwrite
// ============================================================================
function testSuite51ImporterChainSelectionAndConduitMerge() {
  console.log('\n--> SUITE 51: Importer imports the selected chain and merges conduit flows across imports...');

  const ICI = require(path.join(ROOT, 'src', 'workstation', 'scripts', 'industry_chain_importer.js'));
  const CME = require(path.join(ROOT, 'src', 'workstation', 'scripts', 'campaign_mutation_engine.js'));

  // ---- save globals we touch ----
  const keys = ['document', 'ALL_MODULES', 'Workstation', 'nodeSlottedModules', 'CampaignMutationEngine', 'alert'];
  const saved = {};
  keys.forEach(k => { saved[k] = Object.prototype.hasOwnProperty.call(global, k) ? { v: global[k] } : null; });
  const alerts = [];

  try {
    // ---- fake DOM: elements keyed by id, with value + classList ----
    const els = {};
    const getEl = id => (els[id] = els[id] || { id, value: '', innerHTML: '', classList: { add() {}, remove() {} }, appendChild(o) { this.options = (this.options || []).concat(o); } });
    global.document = { getElementById: getEl, createElement: () => ({ value: '', textContent: '' }) };
    global.alert = m => alerts.push(m);
    global.CampaignMutationEngine = CME;

    const mkMod = (id, chain, stage, role, provides, requires) =>
      ({ id, title: id, chain_id: chain, chain_stage: stage, chain_role: role, provides, requires });
    global.ALL_MODULES = [
      mkMod('A-1', 'CHAIN-A', 1, 'extraction', ['Commodity: Cane'], []),
      mkMod('A-2', 'CHAIN-A', 2, 'refining', ['Commodity: Molasses'], ['Commodity: Cane']),
      mkMod('B-1', 'CHAIN-B', 1, 'extraction', ['Timber: Logs'], []),
      mkMod('B-2', 'CHAIN-B', 2, 'refining', ['Timber: Lumber'], ['Timber: Logs'])
    ];

    const freshTopo = () => ({
      nodes: {
        'N1': { id: 'N1', name: 'Alpha', modules: [], adj: [], infBy: [] },
        'N2': { id: 'N2', name: 'Beta', modules: [], adj: [], infBy: [] }
      },
      edgeData: {}, campaign_modules: []
    });
    const setup = () => {
      const topo = freshTopo();
      global.Workstation = { activeTopology: topo, disabledMods: {} };
      global.nodeSlottedModules = {};
      return topo;
    };
    const place = (stageToNode) => Object.keys(stageToNode).forEach(i => { getEl(`ici-stage-action-${i}`).value = stageToNode[i]; });

    // ---- BUG 1: dropdown change must retarget the import ----
    let topo = setup();
    ICI.openIndustryChainImporterModal();            // opens with first chain (CHAIN-A) selected
    getEl('ici-chain-select').value = 'CHAIN-B';
    ICI.renderChainStageGrid('CHAIN-B');             // exactly what the select's onchange calls
    place({ 0: 'N1', 1: 'N2' });
    ICI.executeChainImport();
    assert(topo.nodes.N1.modules.includes('B-1') && topo.nodes.N2.modules.includes('B-2'), 'Switching dropdown to CHAIN-B imports CHAIN-B modules');
    assert(!topo.nodes.N1.modules.includes('A-1') && !topo.nodes.N2.modules.includes('A-2'), 'Switching dropdown does NOT import the originally opened CHAIN-A');
    assert(topo.campaign_modules.includes('B-1') && !topo.campaign_modules.includes('A-1'), 'campaign_modules contains only the selected chain');
    assert(alerts[alerts.length - 1].includes('CHAIN-B') || alerts[alerts.length - 1].includes('CHAIN-B Industry Chain'), 'Summary message names the selected chain');

    // Re-audit button path (renderChainStageGrid with select value) also retargets
    topo = setup();
    ICI.openIndustryChainImporterModal('CHAIN-A');
    ICI.renderChainStageGrid('CHAIN-B');
    place({ 0: 'N1', 1: 'N2' });
    ICI.executeChainImport();
    assert(topo.nodes.N1.modules.includes('B-1'), 'Re-render with another chain retargets import');

    // Opening with an explicit default chain still works without a change event
    topo = setup();
    ICI.openIndustryChainImporterModal('CHAIN-B');
    place({ 0: 'N1', 1: 'N2' });
    ICI.executeChainImport();
    assert(topo.nodes.N1.modules.includes('B-1') && !topo.nodes.N1.modules.includes('A-1'), 'openIndustryChainImporterModal(defaultChainId) imports that chain');

    // Clearing selection imports nothing
    topo = setup();
    ICI.renderChainStageGrid(null);
    const alertsBefore = alerts.length;
    ICI.executeChainImport();
    assertEqual(alerts.length, alertsBefore, 'No chain selected -> executeChainImport is a no-op');
    assertEqual(topo.campaign_modules.length, 0, 'No chain selected -> nothing slotted');

    // ---- BUG 2: second import must merge, not overwrite, dedicatedFlows on a shared edge ----
    topo = setup();
    const edgeKey = CME.formatCorridorKey('N1', 'N2', 'adj');

    ICI.openIndustryChainImporterModal('CHAIN-A');
    place({ 0: 'N1', 1: 'N2' });
    ICI.executeChainImport();
    let flows = (topo.edgeData[edgeKey] || {}).dedicatedFlows || [];
    assert(flows.some(f => f.tag === 'Commodity: Cane' && f.sourceModuleId === 'A-1'), 'Import #1 wires Cane flow on N1-N2');

    ICI.openIndustryChainImporterModal('CHAIN-B');
    place({ 0: 'N1', 1: 'N2' });
    ICI.executeChainImport();
    flows = topo.edgeData[edgeKey].dedicatedFlows;
    assert(flows.some(f => f.tag === 'Commodity: Cane'), 'Import #2 preserves Cane flow from import #1');
    assert(flows.some(f => f.tag === 'Timber: Logs' && f.sourceModuleId === 'B-1'), 'Import #2 adds Timber flow alongside Cane');
    assertEqual(flows.length, 2, 'Shared edge carries exactly both flows');
    assert(topo.nodes.N1.modules.includes('A-1') && topo.nodes.N1.modules.includes('B-1'), 'Node keeps both chains\' modules');

    // Idempotency: re-importing the same chain must not duplicate flows
    ICI.openIndustryChainImporterModal('CHAIN-B');
    // stages are now already_slotted -> default action 'skip'; force rebinding to hit wireConduit again
    place({ 0: 'N1', 1: 'N2' });
    ICI.executeChainImport();
    assertEqual(topo.edgeData[edgeKey].dedicatedFlows.length, 2, 'Re-importing same chain does not duplicate flows');

    // Existing conduitType is preserved, adjacency stays symmetric and deduped
    topo = setup();
    topo.edgeData[edgeKey] = { conduitType: 'Smuggling Tunnel', dedicatedFlows: [{ tag: 'Ore: Pre-existing', sourceModuleId: 'X-1' }] };
    ICI.openIndustryChainImporterModal('CHAIN-B');
    place({ 0: 'N1', 1: 'N2' });
    ICI.executeChainImport();
    const e = topo.edgeData[edgeKey];
    assertEqual(e.conduitType, 'Smuggling Tunnel', 'Pre-existing conduitType is not clobbered');
    assert(e.dedicatedFlows.some(f => f.tag === 'Ore: Pre-existing') && e.dedicatedFlows.some(f => f.tag === 'Timber: Logs'), 'Hand-authored flows survive an import');
    assertEqual(topo.nodes.N1.adj.filter(x => String(x) === 'N2').length, 1, 'adjacency N1->N2 recorded once');
    assertEqual(topo.nodes.N2.adj.filter(x => String(x) === 'N1').length, 1, 'adjacency N2->N1 recorded once');

    // ---- Realistic scenario with the shipped modules: SUGAR then TIMBER on the same nodes ----
    const realMods = [];
    const peridot = path.join(ROOT, 'campaigns', 'Peridot', 'modules_manifest.json');
    const preInd = path.join(ROOT, 'mods', 'pre_industrial_resources', 'modules_manifest.json');
    if (fs.existsSync(peridot)) realMods.push(...JSON.parse(fs.readFileSync(peridot, 'utf8')));
    if (fs.existsSync(preInd)) realMods.push(...JSON.parse(fs.readFileSync(preInd, 'utf8')).map(m => ({ ...m, mod_id: 'pre_industrial_resources' })));
    global.ALL_MODULES = realMods;
    const realChains = ICI.getAvailableIndustryChains();
    if (realChains['CHAIN-SUGAR'] && realChains['CHAIN-TIMBER']) {
      topo = setup();
      topo.nodes = {
        'BG-SC-01': { id: 'BG-SC-01', name: 'Candlekeep', modules: [], adj: [], infBy: [] },
        'BG-SC-13': { id: 'BG-SC-13', name: 'Cloakwood', modules: [], adj: [], infBy: [] }
      };
      const nStages = c => realChains[c].stages.length;
      const layout = c => { const m = {}; for (let i = 0; i < nStages(c); i++) m[i] = (i === nStages(c) - 1) ? 'BG-SC-01' : 'BG-SC-13'; return m; };

      ICI.openIndustryChainImporterModal('CHAIN-SUGAR');
      getEl('ici-chain-select').value = 'CHAIN-TIMBER';
      ICI.renderChainStageGrid('CHAIN-TIMBER');         // user switches dropdown to Timber
      place(layout('CHAIN-TIMBER'));
      ICI.executeChainImport();
      const timberIds = realChains['CHAIN-TIMBER'].stages.map(s => s.module.id);
      const sugarIds = realChains['CHAIN-SUGAR'].stages.map(s => s.module.id);
      assert(timberIds.every(id => topo.campaign_modules.includes(id)), 'Real: Timber modules slotted after switching dropdown');
      assert(!sugarIds.some(id => topo.campaign_modules.includes(id)), 'Real: Sugar modules NOT slotted when Timber selected');

      const key = CME.formatCorridorKey('BG-SC-13', 'BG-SC-01', 'adj');
      const timberTags = ((topo.edgeData[key] || {}).dedicatedFlows || []).map(f => f.tag);
      assert(timberTags.length > 0, 'Real: Timber import created dedicated flows on the 13-01 edge');

      ICI.openIndustryChainImporterModal('CHAIN-SUGAR');
      place(layout('CHAIN-SUGAR'));
      ICI.executeChainImport();
      const after = ((topo.edgeData[key] || {}).dedicatedFlows || []).map(f => f.tag);
      assert(timberTags.every(t => after.includes(t)), 'Real: Sugar import keeps Timber flows on shared edge');
      assert(after.length > timberTags.length, 'Real: Sugar import adds its own flows alongside Timber');
      assert(sugarIds.every(id => topo.campaign_modules.includes(id)), 'Real: Sugar modules slotted after second import');
    } else {
      assert(false, 'Real chains CHAIN-SUGAR and CHAIN-TIMBER must exist in shipped manifests');
    }
  } finally {
    keys.forEach(k => { if (saved[k]) global[k] = saved[k].v; else delete global[k]; });
  }
}

// ============================================================================
// SUITE 48: CANONICAL SPATIAL PIN NORMALIZER (SYS-ARCH-01 / PHASE A)
// ============================================================================
function testSuite48CanonicalSpatialPinNormalizer() {
  console.log('\n--> SUITE 48: Canonical normalizeSpatialPin, in place, one definition (SYS-ARCH-01)...');

  const enginePath = path.join(ROOT_DIR, 'src/workstation/scripts/campaign_mutation_engine.js');
  const cme = require(enginePath);
  const norm = cme.normalizeSpatialPin;
  assert(typeof norm === 'function', 'CampaignMutationEngine exports normalizeSpatialPin');

  // 48.1: mutates in place and returns the same reference
  const pinA = { id: 'pin_a', x: '12', y: 7, label: 'Gate' };
  assert(norm(pinA) === pinA, 'normalizeSpatialPin returns the same reference it was given');
  assertEqual([pinA.x, pinA.y], [12, 7], 'normalizeSpatialPin coerces x/y to numbers in place');

  // 48.2: never deletes or rebuilds unknown properties
  const pinB = { id: 'pin_b', x: 1, y: 2, label: 'Keep', color: '#ff0000', notes: 'GM only', modField: { depth: 3 } };
  norm(pinB);
  assertEqual([pinB.color, pinB.notes, pinB.modField], ['#ff0000', 'GM only', { depth: 3 }], 'normalizeSpatialPin preserves color, notes and mod-injected fields');

  // 48.3: canvas defaults
  const pinC = { x: 'abc' };
  norm(pinC);
  assert(typeof pinC.id === 'string' && pinC.id.startsWith('pin_'), 'normalizeSpatialPin generates a pin_ id when one is missing');
  assertEqual([pinC.x, pinC.y, pinC.label], [0, 0, 'POI Pin'], 'normalizeSpatialPin defaults x/y to 0 and label to POI Pin');
  assertEqual([pinC.visible, pinC.locked], [true, false], 'normalizeSpatialPin defaults visible=true and locked=false');
  assertEqual([pinC.targetType, pinC.targetId, pinC.links], ['npc', '', []], 'a pin with no target defaults to targetType npc, empty targetId and empty links');
  const pinC2 = { id: 'pin_c2', name: 'Named Only', visible: false, locked: true };
  norm(pinC2);
  assertEqual([pinC2.id, pinC2.label, pinC2.visible, pinC2.locked], ['pin_c2', 'Named Only', false, true], 'normalizeSpatialPin keeps an existing id and explicit visible/locked flags and falls back to name for label');

  // 48.4: legacy targetType/targetId become links
  const pinD = { id: 'pin_d', targetType: 'quest', targetId: 77 };
  norm(pinD);
  assertEqual(pinD.links, [{ type: 'quest', id: '77' }], 'legacy targetType/targetId becomes a single link with a string id');
  assertEqual([pinD.targetType, pinD.targetId], ['quest', '77'], 'legacy targetType/targetId stay synced with the new primary link');

  // 48.5: links[0] drives targetType/targetId
  const pinE = { id: 'pin_e', targetType: 'npc', targetId: 'stale', links: [{ type: 'item', id: 'itm_1' }, { type: 'npc', id: 'npc_2' }] };
  norm(pinE);
  assertEqual([pinE.targetType, pinE.targetId], ['item', 'itm_1'], 'links[0] drives targetType/targetId over stale legacy values');
  assertEqual(pinE.links.length, 2, 'normalizeSpatialPin keeps every link');

  // 48.6: a link object keeps its extra fields; id is coerced; a missing type defaults to node
  const richLink = { type: 'submap', id: 5, note: 'trapdoor', meta: { depth: 2 } };
  const typelessLink = { id: 'x1' };
  const pinF = { id: 'pin_f', links: [richLink, typelessLink] };
  norm(pinF);
  assert(pinF.links[0] === richLink && pinF.links[1] === typelessLink, 'normalizeSpatialPin keeps each link object instead of rebuilding it');
  assertEqual(richLink, { type: 'submap', id: '5', note: 'trapdoor', meta: { depth: 2 } }, 'a link keeps its extra fields while its id is coerced to string');
  assertEqual(typelessLink.type, 'node', 'a link without a type defaults to node');
  assertEqual([pinF.targetType, pinF.targetId], ['submap', '5'], 'primary link of a rich link list syncs targetType/targetId');
  const before = JSON.stringify(pinF);
  norm(pinF);
  assertEqual(JSON.stringify(pinF), before, 'normalizeSpatialPin is idempotent');

  // 48.7: non-objects return null
  assertEqual([norm(null), norm(undefined), norm('pin'), norm(42)], [null, null, null, null], 'normalizeSpatialPin returns null for a non-object');

  // 48.8: engine upsert of an existing pin keeps unknown fields and records the new visible/locked diffs
  const upsertState = { spatialPins: [{ id: 'pin_up', x: 1, y: 2, label: 'Old', color: '#0000ff', links: [{ type: 'npc', id: 'npc_1' }] }] };
  const upsertChanges = [];
  cme.upsertEntity(upsertState, 'spatialpins', { id: 'pin_up', x: 5, y: 2, label: 'Old', links: [{ type: 'npc', id: 'npc_1' }] }, { changes: upsertChanges });
  assertEqual(upsertState.spatialPins.length, 1, 'engine upsert updates the existing pin instead of adding one');
  assertEqual([upsertState.spatialPins[0].x, upsertState.spatialPins[0].color], [5, '#0000ff'], 'engine upsert applies the payload and keeps pin fields the payload does not carry');
  assertEqual(upsertChanges.map(c => c.field).sort(), ['locked', 'targetId', 'targetType', 'visible', 'x'], 'engine upsert changelog records x plus the normalized visible/locked/targetType/targetId diffs');

  // 48.9: the engine UMD tail publishes the aliases that injectEngine mirrors into sandboxes
  const umdCtx = vm.createContext({});
  vm.runInContext(fs.readFileSync(enginePath, 'utf8'), umdCtx);
  const publishedAliases = Object.keys(umdCtx).filter(k => typeof umdCtx[k] === 'function').sort();
  assertEqual(publishedAliases, ENGINE_ROOT_ALIASES.slice().sort(), 'injectEngine mirrors exactly the root aliases the engine UMD tail publishes');
  assert(umdCtx.normalizeSpatialPin === umdCtx.CampaignMutationEngine.normalizeSpatialPin, 'UMD tail publishes root.normalizeSpatialPin straight from the engine');
  const injected = { window: {} };
  injectEngine(injected);
  assert(injected.normalizeSpatialPin === cme.normalizeSpatialPin && injected.window.normalizeSpatialPin === cme.normalizeSpatialPin, 'injectEngine publishes normalizeSpatialPin on the sandbox and on a separate sandbox.window');
  assert(injected.CreatorStudio.ai === cme && injected.window.CreatorStudio === injected.CreatorStudio, 'injectEngine shares one CreatorStudio.ai engine between sandbox and sandbox.window');

  // 48.10: exactly one definition of normalizeSpatialPin across the workstation scripts
  const scriptsDir = path.join(ROOT_DIR, 'src/workstation/scripts');
  const definers = fs.readdirSync(scriptsDir)
    .filter(f => f.endsWith('.js') && /function\s+normalizeSpatialPin\s*\(|window\.normalizeSpatialPin\s*=/.test(fs.readFileSync(path.join(scriptsDir, f), 'utf8')));
  assertEqual(definers, ['campaign_mutation_engine.js'], 'normalizeSpatialPin has exactly one definition (campaign_mutation_engine.js)');
}

// ============================================================================
// SUITE 49: ENGINE INCLUDE ORDER (SYS-ARCH-01 / PHASE B)
// ============================================================================
function testSuite49EngineIncludeOrder() {
  console.log('\n--> SUITE 49: Engine-first script include order (SYS-ARCH-01)...');

  const templateHtml = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/template.html'), 'utf8');
  const scriptIncludes = [...templateHtml.matchAll(/^\/\/\s*@@INCLUDE:\s*scripts\/(\S+)\s*@@/gm)].map(m => m[1]);
  assert(scriptIncludes.length > 20, `template.html lists the workstation script includes (${scriptIncludes.length})`);
  assertEqual(scriptIncludes[0], 'campaign_mutation_engine.js', 'template.html includes campaign_mutation_engine.js before every other script');
  assertEqual(scriptIncludes.length, new Set(scriptIncludes).size, 'template.html includes each workstation script exactly once');
}

// ============================================================================
// SUITE 50: ENTITY REFERENCE INTEGRITY, ONE SCRUB (SYS-ARCH-01 / PHASE D)
// ============================================================================
function testSuite50EntityReferenceIntegrity() {
  console.log('\n--> SUITE 50: Entity reference integrity, one scrub for delete preview and execution (SYS-ARCH-01)...');

  const cme = require(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_mutation_engine.js'));

  const buildChildMaps = () => ({
    map_root: { id: 'map_root', spatialPins: [] },
    map_child: {
      id: 'map_child',
      parentMapId: 'map_root',
      nodes: { '7': { id: 7, name: 'Cellar', npcIds: ['npc_a', 'npc_b'] } },
      spatialPins: [
        { id: 'pin_child', label: 'Cellar Pin', targetType: 'npc', targetId: 'npc_a', links: [{ type: 'npc', id: 'npc_a' }, { type: 'item', id: 'itm_x' }] }
      ]
    }
  });
  const buildTopo = () => ({
    npcs: [{ id: 'npc_a', name: 'Alva' }, { id: 'npc_b', name: 'Bren' }],
    spatialPins: [{ id: 'pin_root', label: 'Root Pin', targetType: 'npc', targetId: 'npc_a', links: [{ type: 'npc', id: 'npc_a' }] }]
  });

  // 50.1 (D2): deleteEntity scrubs child maps handed in through batchContext.maps (the active topology carries none)
  const regTopo = buildTopo();
  const regMaps = buildChildMaps();
  const regChanges = [];
  cme.deleteEntity(regTopo, 'npc', 'npc_a', { allowMissingEntity: true, maps: regMaps, changes: regChanges });
  const childPin = regMaps.map_child.spatialPins[0];
  assertEqual(childPin.links, [{ type: 'item', id: 'itm_x' }], 'deleteEntity(npc, {maps}) removes the npc link from a pin on a child map');
  assertEqual([childPin.targetType, childPin.targetId], ['item', 'itm_x'], 'deleteEntity(npc, {maps}) re-syncs the child-map pin target from its remaining link');
  assertEqual(regMaps.map_child.nodes['7'].npcIds, ['npc_b'], 'deleteEntity(npc, {maps}) filters npcIds on child-map nodes');
  assertEqual(regTopo.spatialPins[0].links, [], 'deleteEntity(npc, {maps}) still scrubs the active topology pins');
  assertEqual(regChanges.filter(c => c.category === 'spatialpins' && c.field === 'links').map(c => c.entityId).sort(), ['pin_child', 'pin_root'], 'deleteEntity(npc, {maps}) logs one links change per pin, child map included');

  // A map reachable through both state.maps and batchContext.maps is scrubbed once
  const dupTopo = Object.assign(buildTopo(), { maps: buildChildMaps() });
  const dupChanges = [];
  cme.deleteEntity(dupTopo, 'npc', 'npc_a', { allowMissingEntity: true, maps: dupTopo.maps, changes: dupChanges });
  assertEqual(dupChanges.filter(c => c.entityId === 'pin_child').length, 1, 'a map reachable through state.maps and batchContext.maps is scrubbed once');

  // The existing state.maps walk is unchanged
  const stateMapsTopo = Object.assign(buildTopo(), { maps: buildChildMaps() });
  cme.deleteEntity(stateMapsTopo, 'npc', 'npc_a', { allowMissingEntity: true });
  assertEqual(stateMapsTopo.maps.map_child.spatialPins[0].links, [{ type: 'item', id: 'itm_x' }], 'deleteEntity still walks state.maps without batchContext.maps');

  // 50.2 (D2): executeEntityDeletion hands the global maps registry to the engine
  const cascadeCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_cascade_delete.js'), 'utf8');
  const uiMaps = buildChildMaps();
  const uiSandbox = {
    window: {},
    document: { querySelectorAll: () => [], getElementById: () => null },
    console,
    Workstation: { activeTopology: buildTopo() },
    maps: uiMaps,
    activeMapId: 'map_root'
  };
  uiSandbox.window = uiSandbox;
  injectEngine(uiSandbox);
  const realEngine = uiSandbox.CampaignMutationEngine;
  let seenContext = null;
  uiSandbox.CampaignMutationEngine = Object.assign({}, realEngine, {
    deleteEntity: (topo, type, id, ctx) => { seenContext = ctx; return realEngine.deleteEntity(topo, type, id, ctx); }
  });
  vm.createContext(uiSandbox);
  vm.runInContext(cascadeCode, uiSandbox);
  uiSandbox.executeEntityDeletion([{ type: 'npc', id: 'npc_a' }]);
  assert(!!seenContext && seenContext.maps === uiSandbox.maps, 'executeEntityDeletion passes the global maps registry to CampaignMutationEngine.deleteEntity');
  assertEqual(uiMaps.map_child.spatialPins[0].links, [{ type: 'item', id: 'itm_x' }], 'deleting an NPC from the UI scrubs its link from a pin on a child map');
  assertEqual(uiSandbox.Workstation.activeTopology.npcs.map(n => n.id), ['npc_b'], 'deleting an NPC from the UI removes it from the roster');

  // 50.3 (D3): one descriptor table drives both the read-only query and the scrub
  const descriptors = cme.ENTITY_REFERENCE_DESCRIPTORS;
  const OP_BY_SHAPE = { id: 'null', ids: 'filter', refs: 'filter', keys: 'delete-key', text: 'clear', operations: 'filter', ticketTarget: 'retarget', pinTarget: 'resync', endpoints: 'splice' };
  assert(Array.isArray(descriptors) && descriptors.length >= 70, `the reference descriptor table lists ${descriptors.length} reference fields`);
  assert(descriptors.every(r => OP_BY_SHAPE[r.shape] === r.op), 'every descriptor row pairs its shape with the matching scrub operation');
  assert(descriptors.every(r => ['npc', 'quest', 'item', 'creature', 'tracker', 'faction', 'node', '*'].includes(r.target)), 'every descriptor row names a known target type or *');

  const REFERENCE_TYPES = ['npc', 'quest', 'item', 'tracker', 'faction', 'node'];
  const TARGET_IDS = { npc: 'npc_t', quest: 'quest_t', item: 'item_t', tracker: 'trk_t', faction: 'fac_t', node: '7' };
  const TARGET_COLLECTION = { npc: 'npcs', quest: 'quests', item: 'items', tracker: 'trackers', faction: 'factions' };
  const PREVIEW_TYPES = { factions: 'faction', npcs: 'npc', quests: 'quest', items: 'item', creatures: 'creature', trackers: 'tracker' };

  // A world with one referring record per descriptor row (holding the target id) and one decoy per row (holding another id)
  function buildReferenceWorld(type) {
    const id = TARGET_IDS[type];
    const world = { factions: [], npcs: [], quests: [], items: [], creatures: [], trackers: [], tickets: [], spatialPins: [], nodes: {}, links: [], maps: { map_child: { id: 'map_child', nodes: {}, links: [], spatialPins: [] } } };
    if (TARGET_COLLECTION[type]) world[TARGET_COLLECTION[type]].push({ id, name: `Target ${type}` });
    else world.nodes[id] = { id: Number(id), name: 'Target node', adj: [], infBy: [] };

    const fill = (rec, row, value) => {
      let holder = rec;
      if (row.list) { holder = { id: `${rec.id}_el` }; rec[row.list] = [holder]; }
      const typed = (o) => (row.typeKey ? Object.assign(o, { [row.typeKey]: type }) : o);
      switch (row.shape) {
        case 'id': holder[row.field] = value; if (row.typeField) holder[row.typeField] = type; break;
        case 'ids': holder[row.field] = ['other', value]; break;
        case 'refs': rec[row.path] = [typed({ [row.idKeys[0]]: value }), typed({ [row.idKeys[0]]: 'other' })]; break;
        case 'keys': rec[row.path] = { [value]: 'Allied', other: 'Hostile' }; break;
        case 'text': rec[row.path] = `warning ${value}`; break;
        case 'operations': holder[row.field] = [{ npc: value }, { npc: 'other' }]; break;
        case 'ticketTarget': rec.targetType = type; rec.targetId = value; break;
        case 'pinTarget': rec.targetType = type; rec.targetId = value; rec.links = []; break;
        case 'endpoints': rec.source = value; rec.target = 'other'; break;
        default: throw new Error(`unhandled reference shape ${row.shape}`);
      }
    };

    descriptors.filter(r => r.target === '*' || r.target === type).forEach((row, i) => {
      [id, 'decoy'].forEach(value => {
        const rec = { id: `${row.collection}_${i}_${value === id ? 'ref' : 'decoy'}` };
        fill(rec, row, value);
        const onMap = JSON.parse(JSON.stringify(rec));
        onMap.id = `${rec.id}_m`;
        if (row.collection === 'spatialpins') { world.spatialPins.push(rec); world.maps.map_child.spatialPins.push(onMap); }
        else if (row.collection === 'nodes') { world.nodes[rec.id] = rec; world.maps.map_child.nodes[onMap.id] = onMap; }
        else if (row.collection === 'links') { world.links.push(rec); world.maps.map_child.links.push(onMap); }
        else world[row.collection].push(rec);
      });
    });
    const registry = world.maps;
    delete world.maps;
    return { world, registry, id, targetKey: TARGET_COLLECTION[type] ? `${TARGET_COLLECTION[type]}::${id}` : `nodes::${id}` };
  }

  function snapshotWorld(world, registry) {
    const snap = new Map();
    const put = (collection, mapId, rec, recId) => snap.set(`${collection}:${mapId}:${recId}`, JSON.stringify(rec));
    ['factions', 'npcs', 'quests', 'items', 'creatures', 'trackers', 'tickets'].forEach(c => (world[c] || []).forEach(r => put(c, '', r, r.id)));
    world.spatialPins.forEach(r => put('spatialpins', '', r, r.id));
    Object.values(world.nodes).forEach(r => put('nodes', '', r, r.id));
    world.links.forEach(l => put('links', '', l, `${l.source}->${l.target}`));
    Object.values(registry).forEach(m => {
      m.spatialPins.forEach(r => put('spatialpins', m.id, r, r.id));
      Object.values(m.nodes).forEach(r => put('nodes', m.id, r, r.id));
      m.links.forEach(l => put('links', m.id, l, `${l.source}->${l.target}`));
    });
    return snap;
  }

  // The records deleteEntity really changes (ground truth, independent of what it chooses to log)
  const actuallyChanged = {};
  REFERENCE_TYPES.forEach(type => {
    const { world, registry, id, targetKey } = buildReferenceWorld(type);
    const refs = cme.findEntityReferences(world, type, id, { maps: registry });
    const untouched = JSON.stringify([world, registry]);
    const before = snapshotWorld(world, registry);
    cme.findEntityReferences(world, type, id, { maps: registry });
    assertEqual(JSON.stringify([world, registry]) === untouched, true, `findEntityReferences(${type}) is read-only`);

    cme.deleteEntity(world, type, id, { allowMissingEntity: true, maps: registry, changes: [] });
    const after = snapshotWorld(world, registry);
    const changed = [...before.keys()].filter(k => k !== targetKey && (!after.has(k) || after.get(k) !== before.get(k))).sort();
    const reported = [...new Set(refs.map(r => `${r.collection}:${r.mapId || ''}:${r.entityId}`))].sort();
    actuallyChanged[type] = changed;
    assertEqual(reported, changed, `findEntityReferences(${type}) reports exactly the records deleteEntity changes`);

    const found = new Set(refs.map(r => `${r.collection}|${r.field}`));
    const missing = descriptors.filter(r => (r.target === '*' || r.target === type) && !found.has(`${r.collection}|${r.path}`)).map(r => `${r.collection}.${r.path}`);
    assertEqual(missing, [], `findEntityReferences(${type}) finds a referrer for every descriptor row that applies to ${type}`);
    assert(refs.every(r => !String(r.entityId).includes('decoy')), `findEntityReferences(${type}) ignores records that hold other ids`);
    assert(refs.some(r => r.mapId === 'map_child'), `findEntityReferences(${type}) searches the registered child map`);
  });

  // 50.4 (D3): the delete preview lists the same id-based referrers the scrub changes
  const cascadeUiCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_cascade_delete.js'), 'utf8');
  function makeCascadeSandbox(world, registry, extra) {
    const sb = Object.assign({
      window: {},
      document: { querySelectorAll: () => [], getElementById: () => null },
      console,
      Workstation: { activeTopology: world },
      maps: registry,
      activeMapId: 'map_root',
      getActiveEntityList: (t) => world[{ npc: 'npcs', quest: 'quests', item: 'items', creature: 'creatures', tracker: 'trackers', faction: 'factions' }[t]] || [],
      getPrototypesForType: () => [],
      escapeHtml: (s) => String(s)
    }, extra || {});
    sb.window = sb;
    injectEngine(sb);
    vm.createContext(sb);
    vm.runInContext(cascadeUiCode, sb);
    return sb;
  }
  REFERENCE_TYPES.forEach(type => {
    const { world, registry, id } = buildReferenceWorld(type);
    const analysis = makeCascadeSandbox(world, registry).analyzeEntityDependencies(type, id);
    const previewed = [...new Set(analysis.dependencies.filter(d => d.kind === 'reference').map(d => `${d.type}:${d.id}`))].sort();
    const scrubbed = [...new Set(actuallyChanged[type]
      .map(k => k.split(':'))
      .filter(([collection, mapId]) => PREVIEW_TYPES[collection] && mapId === '')
      .map(([collection, mapId, ...rest]) => `${PREVIEW_TYPES[collection]}:${rest.join(':')}`))].sort();
    assertEqual(previewed, scrubbed, `analyzeEntityDependencies(${type}) lists exactly the id-based referrers deleteEntity changes`);
    assert(analysis.references.length > 0 && analysis.dependencies.filter(d => d.kind === 'reference').every(d => /^Linked via /.test(d.reason)), `analyzeEntityDependencies(${type}) explains each referrer by the field that links it`);
  });

  // 50.5 (D3): name mentions are a distinct group and the delete does not touch them
  const mentionWorld = () => ({
    factions: [],
    npcs: [{ id: 'npc_m', name: 'Maren Voss' }, { id: 'npc_w', name: 'Watcher', threat: 'Maren Hunt' }],
    quests: [
      { id: 'q_ref', title: 'Linked Quest', npcIds: ['npc_m'] },
      { id: 'q_men', title: 'Gossip', motivation: 'Hunts maren voss for the bounty' }
    ],
    items: [], tickets: [], spatialPins: [], nodes: {}, links: [],
    trackers: [{ id: 'trk_m', name: 'Maren Hunt' }]
  });
  const mentionSandbox = makeCascadeSandbox(mentionWorld(), {});
  const mentionAnalysis = mentionSandbox.analyzeEntityDependencies('npc', 'npc_m');
  const kindOf = (list, type, depId) => (list.find(d => d.type === type && d.id === depId) || {}).kind;
  assertEqual(kindOf(mentionAnalysis.dependencies, 'quest', 'q_ref'), 'reference', 'a quest that lists the NPC in npcIds is an id-based reference');
  assertEqual(kindOf(mentionAnalysis.dependencies, 'quest', 'q_men'), 'mention', 'a quest that only names the NPC is a mention');
  assertEqual(mentionAnalysis.mentionCount, 1, 'analyzeEntityDependencies counts mentions separately');
  const trackerAnalysis = mentionSandbox.analyzeEntityDependencies('tracker', 'trk_m');
  assertEqual(kindOf(trackerAnalysis.dependencies, 'npc', 'npc_w'), 'mention', 'an NPC whose threat text only names the clock is a mention');

  const mentionDeleteWorld = mentionWorld();
  makeCascadeSandbox(mentionDeleteWorld, {}).executeEntityDeletion([{ type: 'npc', id: 'npc_m' }]);
  assertEqual(mentionDeleteWorld.quests.find(q => q.id === 'q_ref').npcIds, [], 'deleting an NPC unlinks it from quests that reference its id');
  assertEqual(mentionDeleteWorld.quests.find(q => q.id === 'q_men').motivation, 'Hunts maren voss for the bounty', 'deleting an NPC leaves name mentions untouched');

  // The confirmation dialog shows mentions under their own heading
  const dialogEls = [];
  const makeDialogEl = () => { const el = { style: {}, innerHTML: '', children: [], classList: { add() {}, remove() {} }, appendChild(c) { this.children.push(c); } }; dialogEls.push(el); return el; };
  const dialogById = { 'ed-modal-title': makeDialogEl(), 'ed-alert-container': makeDialogEl(), 'ed-dependencies-list': makeDialogEl(), 'modal-entity-delete-confirm': makeDialogEl() };
  const dialogSandbox = makeCascadeSandbox(mentionWorld(), {}, {
    document: { querySelectorAll: () => [], getElementById: (elId) => dialogById[elId] || null, createElement: makeDialogEl }
  });
  dialogSandbox.promptEntityDelete('npc', 'npc_m');
  const headings = dialogById['ed-dependencies-list'].children.filter(c => /\(\d+\):$/.test(c.innerHTML)).map(c => c.innerHTML);
  assertEqual(headings, ['📜 RELATED QUESTS & DILEMMAS (1):', '💬 MENTIONS BY NAME (NOT UNLINKED) (1):'], 'the delete dialog lists related quests and mentions under separate headings');
  assert(dialogById['ed-alert-container'].innerHTML.includes('only mention this npc by name'), 'the delete dialog banner counts the mentions');

  // 50.6 (D4): the cascade file no longer scrubs entity types itself; it only calls the engine
  const spyWorld = () => ({
    factions: [], items: [], nodes: {}, links: [], deletedPrototypes: [],
    npcs: [{ id: 'npc_a', name: 'Alva' }],
    quests: [{ id: 'q_a', title: 'Q', npcIds: ['npc_a'] }],
    trackers: [{ id: 'trk_a', name: 'T', triggerRefs: [{ entityType: 'npc', entityId: 'npc_a' }] }],
    tickets: [{ id: 'tk_a', targetType: 'npc', targetId: 'npc_a', notes: '' }],
    spatialPins: [{ id: 'pin_a', links: [{ type: 'npc', id: 'npc_a' }], targetType: 'npc', targetId: 'npc_a' }]
  });
  const engineCalls = [];
  const spyDeleteWorld = spyWorld();
  const spySandbox = makeCascadeSandbox(spyDeleteWorld, {});
  spySandbox.CampaignMutationEngine = Object.assign({}, spySandbox.CampaignMutationEngine, {
    deleteEntity: (topo, type, entId, ctx) => { engineCalls.push(`${type}:${entId}`); return true; }
  });
  spySandbox.executeEntityDeletion([{ type: 'npc', id: 'npc_a' }]);
  assertEqual(engineCalls, ['npc:npc_a'], 'executeEntityDeletion delegates an NPC delete to CampaignMutationEngine.deleteEntity');
  assertEqual(JSON.stringify(spyDeleteWorld.npcs.concat(spyDeleteWorld.quests, spyDeleteWorld.trackers, spyDeleteWorld.tickets, spyDeleteWorld.spatialPins)), JSON.stringify(spyWorld().npcs.concat(spyWorld().quests, spyWorld().trackers, spyWorld().tickets, spyWorld().spatialPins)), 'with the engine stubbed out, executeEntityDeletion leaves the roster, quests, trigger refs, tickets and pins alone');
  assertEqual(spyDeleteWorld.deletedPrototypes, ['npc_a'], 'executeEntityDeletion still records the deleted prototype id');

  // 50.7 (D4): tickets that target a deleted entity (engine), sub-map or module (cascade file) get one audit note each
  const ticketWorld = () => ({
    factions: [], items: [], quests: [], creatures: [], trackers: [], nodes: {}, links: [], spatialPins: [], campaign_modules: ['MOD-1'],
    npcs: [{ id: 'npc_a', name: 'Alva' }],
    tickets: [
      { id: 'tk_npc', targetType: 'npc', targetId: 'npc_a', notes: 'n1' },
      { id: 'tk_map', targetType: 'map', targetId: 'map_child', notes: 'n2' },
      { id: 'tk_mod', targetType: 'module', targetId: 'MOD-1', notes: 'n3' },
      { id: 'tk_other', targetType: 'npc', targetId: 'npc_other', notes: 'n4' }
    ]
  });
  const ticketDeleteWorld = ticketWorld();
  const ticketRegistry = buildChildMaps();
  makeCascadeSandbox(ticketDeleteWorld, ticketRegistry).executeEntityDeletion([
    { type: 'npc', id: 'npc_a' },
    { type: 'map', id: 'map_child' },
    { type: 'module', id: 'MOD-1' }
  ]);
  const audited = (tid) => ticketDeleteWorld.tickets.find(t => t.id === tid);
  ['tk_npc', 'tk_map', 'tk_mod'].forEach(tid => {
    assertEqual([audited(tid).targetType, audited(tid).targetId], ['campaign', ''], `ticket ${tid} is retargeted to the campaign when its target is deleted`);
    assertEqual((audited(tid).notes.match(/\[Audit: Target /g) || []).length, 1, `ticket ${tid} gets exactly one audit note`);
  });
  assert(audited('tk_map').notes.includes('Target map (map_child) was deleted'), 'the sub-map ticket audit note names the deleted map');
  assertEqual([audited('tk_other').targetType, audited('tk_other').targetId, audited('tk_other').notes], ['npc', 'npc_other', 'n4'], 'a ticket aimed at something else is left alone');
}

async function testSuite52ResourcePartitionAndBestiaryPersistence() {
  console.log('\n--- Suite 52: Resource Partitioning, Bestiary Persistence & Zero-CORS Evidence Pipeline ---');

  // Load scripts in a sandbox
  const entityCoreCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js'), 'utf8');
  const workstationStateCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js'), 'utf8');
  const stateAdapterCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/state_adapter.js'), 'utf8');

  const sb = {
    window: {},
    document: {
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    console,
    localStorage: {
      _store: {},
      getItem: function(k) { return this._store[k] || null; },
      setItem: function(k, v) { this._store[k] = String(v); },
      removeItem: function(k) { delete this._store[k]; }
    },
    MODULE_ENTITY_PROTOTYPES: {},
    ALL_MODULES: [],
    CAMPAIGN_REGISTRY: {},
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    renderEntityManagerTree: () => {},
    renderEntityManagerList: () => {},
    setStatusBarMessage: () => {}
  };
  sb.window = sb;
  injectEngine(sb);
  vm.createContext(sb);

  vm.runInContext(workstationStateCode, sb);
  vm.runInContext(entityCoreCode, sb);
  vm.runInContext(stateAdapterCode, sb);

  // 1. isResourceItem classification tests
  const sword = { id: 'it_sword', name: 'Moonblade', category: 'Weapon' };
  const potion = { id: 'it_pot', name: 'Healing Salve', category: 'Consumable' };
  const gristmill = { id: 'it_mill', name: 'Windmill Grist', category: 'Infrastructural Machinery' };
  const ore = { id: 'res_ore', name: 'Iron Ore', category: 'Resource Export / Supply Anchor' };
  const grain = { id: 'res_grain', name: 'Hard Wheat', isResource: true };
  const timber = { id: 'res_timber', name: 'Oak Logs', category: 'Commodity: Timber' };
  const fuel = { id: 'res_coal', name: 'Bituminous Coal', category: 'Resource: Fuel' };
  const flax = { id: 'res_flax', name: 'Raw Flax', tags: ['resource'] };

  assert(!sb.isResourceItem(sword), 'Moonblade is not classified as a resource');
  assert(!sb.isResourceItem(potion), 'Healing Salve is not classified as a resource');
  assert(!sb.isResourceItem(gristmill), 'Infrastructural Machinery is not classified as a resource');
  assert(sb.isResourceItem(ore), 'Resource Export / Supply Anchor is classified as a resource');
  assert(sb.isResourceItem(grain), 'isResource: true flag is classified as a resource');
  assert(sb.isResourceItem(timber), 'Commodity: prefix is classified as a resource');
  assert(sb.isResourceItem(fuel), 'Resource: prefix is classified as a resource');
  assert(sb.isResourceItem(flax), 'tags: ["resource"] is classified as a resource');

  // 2. getCreatureEffectiveNodeId tests
  const cUnassigned = { id: 'c1', name: 'Demon' };
  const cNodeId = { id: 'c2', name: 'Ghoul', nodeId: 'node_dungeon_3' };
  const cStationing = { id: 'c3', name: 'Butcher', stationing: { mode: 'lair', nodeId: 'node_cellar_1' } };
  assertEqual(sb.getCreatureEffectiveNodeId(cUnassigned), null, 'unassigned creature returns null effective node');
  assertEqual(sb.getCreatureEffectiveNodeId(cNodeId), 'node_dungeon_3', 'creature with direct nodeId returns nodeId');
  assertEqual(sb.getCreatureEffectiveNodeId(cStationing), 'node_cellar_1', 'creature with stationing.nodeId returns stationing.nodeId');

  // 3. getBackingEntityList vs getActiveEntityList Partitioning
  const testWorld = {
    nodes: { 1: { id: 1, name: 'Town' }, 2: { id: 2, name: 'Mine' } },
    links: [],
    npcs: [],
    quests: [],
    items: [sword, potion, gristmill, ore, grain, timber],
    creatures: [cUnassigned, cNodeId, cStationing],
    trackers: [],
    tickets: [],
    factions: []
  };
  sb.Workstation.activeTopology = testWorld;

  // Verify getBackingEntityList returns the raw mutable array
  assert(sb.getBackingEntityList('item') === testWorld.items, 'getBackingEntityList("item") returns the exact backing items array');
  assert(sb.getBackingEntityList('resource') === testWorld.items, 'getBackingEntityList("resource") returns the exact backing items array');
  assert(sb.getBackingEntityList('creature') === testWorld.creatures, 'getBackingEntityList("creature") returns the exact backing creatures array');

  // Verify getActiveEntityList partitions items vs resources
  const activeItems = sb.getActiveEntityList('item');
  const activeResources = sb.getActiveEntityList('resource');
  const activeCreatures = sb.getActiveEntityList('creature');

  assertEqual(activeItems.map(i => i.id), ['it_sword', 'it_pot', 'it_mill'], 'getActiveEntityList("item") returns only non-resource items (including Machinery)');
  assertEqual(activeResources.map(i => i.id), ['res_ore', 'res_grain', 'res_timber'], 'getActiveEntityList("resource") returns only resource/commodity items');
  assertEqual(activeCreatures.map(c => c.id), ['c1', 'c2', 'c3'], 'getActiveEntityList("creature") returns creatures array');

  // Verify mutating backing list via getBackingEntityList('resource').push updates backing items and partition
  sb.getBackingEntityList('resource').push(fuel);
  assertEqual(sb.getActiveEntityList('resource').map(i => i.id), ['res_ore', 'res_grain', 'res_timber', 'res_coal'], 'pushing to getBackingEntityList("resource") updates the active resource view');
  assertEqual(sb.getActiveEntityList('item').map(i => i.id), ['it_sword', 'it_pot', 'it_mill'], 'pushing resource does not leak into active items view');

  // 4. Diablo1 Campaign Hydration & Zero-CORS Evidence
  const diabloTopoPath = path.join(ROOT_DIR, 'campaigns', 'DIablo', 'topology.json');
  const diabloEvidencePath = path.join(ROOT_DIR, 'campaigns', 'DIablo', 'creatures', 'evidence.json');
  assert(fs.existsSync(diabloTopoPath), 'campaigns/DIablo/topology.json exists on disk');
  assert(fs.existsSync(diabloEvidencePath), 'campaigns/DIablo/creatures/evidence.json exists on disk');

  const diabloTopo = JSON.parse(fs.readFileSync(diabloTopoPath, 'utf8'));
  const diabloEvidence = JSON.parse(fs.readFileSync(diabloEvidencePath, 'utf8'));

  assert(Array.isArray(diabloTopo.creatures) && diabloTopo.creatures.length === 68, 'Diablo1 topology.json defines 68 bestiary creatures');
  assert(Object.keys(diabloEvidence).length === 68, 'Diablo1 evidence.json defines 68 creature evidence records');

  await sb.loadCampaignProjectPackage({
    id: 'Diablo1',
    name: 'Diablo: The Darkening of Tristram',
    preset: diabloTopo,
    creatures: diabloTopo.creatures,
    creatureEvidence: diabloEvidence,
    maps: diabloTopo.maps
  });
  assertEqual(sb.Workstation.activeTopology.creatures.length, 68, 'loadCampaignProjectPackage hydrates all 68 creatures onto activeTopology');
  assertEqual(Object.keys(sb.Workstation.activeTopology.creatureEvidence).length, 68, 'loadCampaignProjectPackage preserves all 68 creature evidence records');

  // Verify submap stationing resolution for Diablo creatures
  const skel = sb.Workstation.activeTopology.creatures.find(c => c.id === 'creature_crucified_skeletons');
  assert(Boolean(skel), 'Crucified Skeletons creature exists in hydrated topology');
  assertEqual(sb.getCreatureEffectiveNodeId(skel), 'N_KING_LEORIC_TOMB', 'Crucified Skeletons effective node resolves to submap node N_KING_LEORIC_TOMB');

  // 5. BaldursGate Campaign Items vs Resources Partition
  const bgTopoPath = path.join(ROOT_DIR, 'campaigns', 'BaldursGate', 'topology.json');
  if (fs.existsSync(bgTopoPath)) {
    const bgTopo = JSON.parse(fs.readFileSync(bgTopoPath, 'utf8'));
    await sb.loadCampaignProjectPackage({
      id: 'BaldursGate',
      name: bgTopo.name || 'BaldursGate',
      preset: bgTopo,
      maps: bgTopo.maps
    });
    const bgItems = sb.getActiveEntityList('item');
    const bgResources = sb.getActiveEntityList('resource');
    assert(bgItems.length > 0, `BaldursGate active items loaded (${bgItems.length} items)`);
    assert(bgResources.length > 0, `BaldursGate active resources loaded (${bgResources.length} resources)`);
    assertEqual(bgItems.length + bgResources.length, bgTopo.items.length, 'Sum of BaldursGate items + resources equals total backing items count');
  }
}

async function testSuite53ResourceExplorerUiAndMultiMapAggregation() {
  console.log('\n--- Suite 53: Resource Explorer Tab, DF Stockpile Inspector & Multi-Map Aggregation ---');

  // 1. Verify entity_modals.html template defines the new tabs
  const modalsHtml = fs.readFileSync(path.join(ROOT_DIR, 'src', 'workstation', 'modals', 'entity_modals.html'), 'utf8');
  assert(modalsHtml.includes('id="em-tab-resource"'), 'entity_modals.html contains #em-tab-resource button');
  assert(modalsHtml.includes('id="em-tab-creature"'), 'entity_modals.html contains #em-tab-creature button');

  // 2. Set up VM sandbox with entity_core, entity_manager_ui, cad_canvas_renderer, entity_crud_dialogs, entity_cascade_delete
  const entityCoreCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js'), 'utf8');
  const workstationStateCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js'), 'utf8');
  const cmeCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_mutation_engine.js'), 'utf8');
  const cadRendererCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/cad_canvas_renderer.js'), 'utf8');
  const emUiCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_manager_ui.js'), 'utf8');
  const crudCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_crud_dialogs.js'), 'utf8');
  const cascadeCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_cascade_delete.js'), 'utf8');

  // DOM Mock stubs
  const domElements = {};
  const makeElement = (id) => ({
    id,
    style: {},
    classList: { add: () => {}, remove: () => {} },
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getAttribute: () => null,
    setAttribute: () => {},
    setAttributeNS: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  });

  const sb = {
    console,
    Math,
    Date,
    parseInt,
    parseFloat,
    isNaN,
    Array,
    Object,
    Set,
    Map,
    String,
    Boolean,
    RegExp,
    JSON,
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    prompt: () => '',
    window: {},
    document: {
      getElementById: (id) => {
        if (!domElements[id]) domElements[id] = makeElement(id);
        return domElements[id];
      },
      querySelectorAll: () => [],
      createElement: (tag) => makeElement(tag),
      createElementNS: (ns, tag) => makeElement(tag)
    },
    MDIWindowManager: {
      open: () => {},
      windows: {},
      renderTaskbar: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    closeAllMenus: () => {},
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    setStatusBarMessage: () => {},
    saveActiveCampaign: () => {},
    closeModal: () => {}
  };
  sb.window = sb;

  vm.createContext(sb);
  vm.runInContext(entityCoreCode, sb);
  vm.runInContext(workstationStateCode, sb);
  vm.runInContext(cmeCode, sb);
  vm.runInContext(cadRendererCode, sb);
  vm.runInContext(emUiCode, sb);
  vm.runInContext(crudCode, sb);
  vm.runInContext(cascadeCode, sb);

  // 3. Multi-map node aggregation test
  const testWorld = {
    name: 'Multi-Map Test World',
    nodes: {
      '1': { id: 1, name: 'Root Citadel', modData: { pre_industrial_resources: { stockpile: { 'Timber': 25 } } } }
    },
    edges: [],
    npcs: [],
    quests: [
      { id: 'q_timber', title: 'Timber Supply', itemIds: ['res_timber'] }
    ],
    items: [
      { id: 'it_sword', name: 'Steel Longsword', category: 'Weapon', nodeId: 1 },
      { id: 'res_timber', name: 'Boreal Timber', category: 'Resource Export / Supply Anchor', isResource: true, nodeId: 1 }
    ],
    creatures: [
      { id: 'cr_wolf', name: 'Timber Wolf', threatTier: 1, stationing: { nodeId: 201 } }
    ],
    maps: {
      map_sub: {
        id: 'map_sub',
        name: 'Deep Forest Submap',
        nodes: [
          { id: 201, name: 'Wolf Den', modData: { pre_industrial_resources: { backpressureHalt: true } } }
        ]
      }
    }
  };

  sb.Workstation.activeTopology = testWorld;
  sb.maps = testWorld.maps;

  // Test getAllKnownNodesMap aggregates across root map and submap
  const allNodes = sb.getAllKnownNodesMap();
  assert(Boolean(allNodes['1']), 'getAllKnownNodesMap includes root node 1');
  assert(Boolean(allNodes['201']), 'getAllKnownNodesMap includes submap node 201');

  // Test getRecursiveNodeEntities partitions items vs resources, and surfaces creatures
  const recRoot = sb.getRecursiveNodeEntities(1, 'map_root');
  assertEqual(recRoot.direct.items.map(i => i.id), ['it_sword'], 'getRecursiveNodeEntities direct.items has only non-resource items');
  assertEqual(recRoot.direct.resources.map(r => r.id), ['res_timber'], 'getRecursiveNodeEntities direct.resources has resource item');

  // Test switchEntityManagerTab
  sb.switchEntityManagerTab('resource');
  assertEqual(sb.CurrentEntityTab, 'resource', 'switchEntityManagerTab("resource") sets CurrentEntityTab to "resource"');

  sb.switchEntityManagerTab('resources');
  assertEqual(sb.CurrentEntityTab, 'resource', 'switchEntityManagerTab("resources") normalizes to "resource"');

  sb.switchEntityManagerTab('creature');
  assertEqual(sb.CurrentEntityTab, 'creature', 'switchEntityManagerTab("creature") sets CurrentEntityTab to "creature"');

  // Test Resource CRUD in entity_crud_dialogs: save custom resource
  sb.CurrentEntityTab = 'resource';
  sb.document.getElementById('ee-entity-type').value = 'resource';
  sb.document.getElementById('ee-entity-id').value = '';
  sb.document.getElementById('ee-name').value = 'Highland Wool';
  sb.document.getElementById('ee-role').value = 'Commodity: Textiles';
  sb.document.getElementById('ee-meta').value = 'Bale [50 lbs]';
  sb.document.getElementById('ee-notes').value = 'Spun from highland sheep.';
  sb.document.getElementById('ee-node-select').value = '1';

  sb.saveCustomEntity();

  const activeResources = sb.getActiveEntityList('resource');
  const activeItems = sb.getActiveEntityList('item');
  assert(activeResources.some(r => r.name === 'Highland Wool' && r.isResource === true), 'saveCustomEntity creates new resource with isResource: true in backing items');
  assert(!activeItems.some(i => i.name === 'Highland Wool'), 'new custom resource is excluded from active items tab');

  // Test entity cascade deletion for resource
  const wool = activeResources.find(r => r.name === 'Highland Wool');
  const depData = sb.analyzeEntityDependencies('resource', wool.id);
  assert(depData.target.id === wool.id, 'analyzeEntityDependencies resolves resource target');
  assertEqual(sb.getEntityIcon('resource'), '📦', 'getEntityIcon("resource") returns 📦');
  assertEqual(sb.getEntityIcon('creature'), '🐉', 'getEntityIcon("creature") returns 🐉');
}

async function testSuite54BestiaryExplorerAndFftIntegration() {
  console.log('\n--- Suite 54: Bestiary Explorer Tab, Creature FFT Adapter & Canon Evidence Integration ---');

  const fftCoreCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/fast_frugal_tree.js'), 'utf8');
  const fftUiCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/fft_editor_ui.js'), 'utf8');
  const entityCoreCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_core.js'), 'utf8');
  const workstationStateCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/workstation_state.js'), 'utf8');
  const cmeCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/campaign_mutation_engine.js'), 'utf8');
  const cadRendererCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/cad_canvas_renderer.js'), 'utf8');
  const emUiCode = fs.readFileSync(path.join(ROOT_DIR, 'src/workstation/scripts/entity_manager_ui.js'), 'utf8');

  // 1. Verify Diablo campaign has 68 creatures and evidence
  const diabloTopoPath = path.join(ROOT_DIR, 'campaigns/DIablo/topology.json');
  const diabloEvPath = path.join(ROOT_DIR, 'campaigns/DIablo/creatures/evidence.json');
  const diabloTopo = JSON.parse(fs.readFileSync(diabloTopoPath, 'utf8'));
  const diabloEv = JSON.parse(fs.readFileSync(diabloEvPath, 'utf8'));

  assert(Array.isArray(diabloTopo.creatures) && diabloTopo.creatures.length === 68, 'Diablo topology contains 68 bestiary creatures');
  assert(Object.keys(diabloEv).length === 68, 'Diablo creature evidence contains 68 evidence records');

  // 2. Set up VM sandbox
  const domElements = {};
  const makeElement = (id) => ({
    id,
    style: {},
    classList: { add: () => {}, remove: () => {} },
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getAttribute: () => null,
    setAttribute: () => {},
    setAttributeNS: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  });

  const sb = {
    console,
    Math,
    Date,
    parseInt,
    parseFloat,
    isNaN,
    Boolean,
    String,
    Number,
    Array,
    Object,
    Set,
    JSON,
    document: {
      getElementById: (id) => {
        if (!domElements[id]) domElements[id] = makeElement(id);
        return domElements[id];
      },
      createElement: (tag) => makeElement(tag),
      createElementNS: (ns, tag) => makeElement(tag),
      body: { appendChild: () => {} },
      querySelectorAll: () => []
    },
    window: {},
    Workstation: {
      activeTopology: diabloTopo,
      registeredMods: {}
    },
    MDIWindowManager: {
      open: () => {},
      windows: {},
      renderTaskbar: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    closeAllMenus: () => {},
    closeModal: () => {},
    maps: { map_root: diabloTopo },
    activeMapId: 'map_root',
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    setStatusBarMessage: () => {},
    alert: () => {},
    confirm: () => true,
    prompt: () => ''
  };
  sb.window = sb;
  sb.globalThis = sb;

  vm.createContext(sb);
  vm.runInContext(fftCoreCode, sb);
  vm.runInContext(fftUiCode, sb);
  vm.runInContext(workstationStateCode, sb);
  vm.runInContext(cmeCode, sb);
  vm.runInContext(entityCoreCode, sb);
  vm.runInContext(cadRendererCode, sb);
  vm.runInContext(emUiCode, sb);

  // Set activeTopology on Workstation after scripts initialize
  sb.Workstation.activeTopology = diabloTopo;
  diabloTopo.creatureEvidence = diabloEv;

  // Test normalizeCreatureFft & getEntityFft
  assert(typeof sb.normalizeCreatureFft === 'function', 'normalizeCreatureFft is exported on window');
  assert(typeof sb.getEntityFft === 'function', 'getEntityFft is exported on window');

  let invalidCreatureFftCount = 0;
  diabloTopo.creatures.forEach(c => {
    if (c.gigerenzerBehavior && c.gigerenzerBehavior.fastAndFrugalTree) {
      const norm = sb.normalizeCreatureFft(c.gigerenzerBehavior.fastAndFrugalTree);
      const errs = sb.validateFft(norm);
      if (errs.length > 0) invalidCreatureFftCount++;
      norm.cues.forEach((cue, i) => {
        assert(cue.id === 'cue_' + (i + 1), `Creature ${c.id} cue ${i} has normalized cue ID`);
        assert(cue.testType === 'boolean_query', `Creature ${c.id} cue ${i} has boolean_query testType`);
        assert(cue.targetValue === true, `Creature ${c.id} cue ${i} has boolean targetValue: true`);
      });
    }
  });
  assertEqual(invalidCreatureFftCount, 0, 'All 68 Diablo creature FFTs pass validateFft after normalization');

  // Test getEntityFft resolution
  const acidBeast = diabloTopo.creatures.find(c => c.id === 'creature_acid_beasts');
  const acidFft = sb.getEntityFft('creature', acidBeast);
  assert(acidFft !== null && acidFft.name === 'Acid beast spit', 'getEntityFft resolves and normalizes creature FFT');

  // Test renderFftDossierHtml for creature
  const fftHtml = sb.renderFftDossierHtml('creature', acidBeast);
  assert(fftHtml.includes('Acid beast spit'), 'renderFftDossierHtml renders tree name');
  assert(fftHtml.includes('Is a target within spit range?'), 'renderFftDossierHtml renders cue questions');
  assert(fftHtml.includes('Spit acid at it'), 'renderFftDossierHtml renders exit label');
  assert(fftHtml.includes('Advance with the swarm'), 'renderFftDossierHtml renders default exit label');

  // 3. Test Bestiary Tab Switching & Tree Rendering
  sb.switchEntityManagerTab('creature');
  assertEqual(sb.CurrentEntityTab, 'creature', 'CurrentEntityTab is creature');

  const treeContainer = sb.document.getElementById('em-tree-container');
  treeContainer.children = [];
  treeContainer.appendChild = (child) => { treeContainer.children.push(child); };
  sb.renderEntityManagerTree();
  assert(treeContainer.children.some(c => (c.textContent || '').includes('BY THREAT TIER:')), 'Tree contains BY THREAT TIER header');
  assert(treeContainer.children.some(c => (c.textContent || '').includes('BY CLASSIFICATION:')), 'Tree contains BY CLASSIFICATION header');
  assert(treeContainer.children.some(c => (c.textContent || '').includes('Tier 2: Dangerous Threat')), 'Tree contains Tier 2 count');

  // 4. Test Bestiary List Table Rendering & Row Structure
  const tableBody = sb.document.getElementById('em-table-body');
  tableBody.rows = [];
  tableBody.appendChild = (row) => { tableBody.rows.push(row); };
  sb.renderEntityManagerList();

  const thead = sb.document.getElementById('em-table-head');
  assert(thead.innerHTML.includes('Creature / Monster'), 'Table header has Creature / Monster column');
  assert(thead.innerHTML.includes('Threat Tier'), 'Table header has Threat Tier column');
  assert(thead.innerHTML.includes('Kind / Subtype'), 'Table header has Kind / Subtype column');
  assert(thead.innerHTML.includes('Dread'), 'Table header has Dread column');
  assert(thead.innerHTML.includes('Lair / Station Node'), 'Table header has Lair / Station Node column');

  assert(tableBody.rows.length === 68, 'All 68 Diablo creatures rendered in table list');
  const acidRow = tableBody.rows.find(r => (r.innerHTML || '').includes('Acid Beasts'));
  assert(acidRow !== null, 'Table contains row for Acid Beasts');
  assert(acidRow.innerHTML.includes('🐉 Acid Beasts'), 'Row contains creature icon and name');
  assert(acidRow.innerHTML.includes('T2'), 'Row contains Threat Tier T2 badge');
  assert(acidRow.innerHTML.includes('💀 4/10'), 'Row contains Dread Index 4/10 badge');
  assert(acidRow.innerHTML.includes('Beast'), 'Row contains Kind');

  // 5. Test Filtering by Threat Tier and Kind
  sb.SelectedEntityFilter = 'threat:2';
  tableBody.rows = [];
  sb.renderEntityManagerList();
  assert(tableBody.rows.length > 0 && tableBody.rows.length < 68, 'Filtered list by threat:2');

  sb.SelectedEntityFilter = 'kind:beast';
  tableBody.rows = [];
  sb.renderEntityManagerList();
  assert(tableBody.rows.length > 0, 'Filtered list by kind:beast');

  sb.SelectedEntityFilter = 'all';

  // 6. Test Creature Detail Inspector (selectEntityItem)
  const detailPane = sb.document.getElementById('em-detail-pane');
  sb.selectEntityItem('creature_acid_beasts', false);

  assert(detailPane.innerHTML.includes('🐉 Acid Beasts'), 'Detail pane contains creature header');
  assert(detailPane.innerHTML.includes('Tier 2: Dangerous Threat'), 'Detail pane contains threat tier badge');
  assert(detailPane.innerHTML.includes('Relative Capabilities'), 'Detail pane contains Relative Capabilities section');
  assert(detailPane.innerHTML.includes('Might:'), 'Detail pane contains Might capability bar');
  assert(detailPane.innerHTML.includes('Agility:'), 'Detail pane contains Agility capability bar');
  assert(detailPane.innerHTML.includes('Dread: 4/10'), 'Detail pane contains Dread 4/10 badge');
  assert(detailPane.innerHTML.includes('Acid-spitting swarms make corridors hazardous'), 'Detail pane contains Dread Effect');
  assert(detailPane.innerHTML.includes('TAKE_THE_BEST'), 'Detail pane contains heuristic strategy TAKE_THE_BEST');
  assert(detailPane.innerHTML.includes('target_in_spit_range → target_standing_still'), 'Detail pane contains Cue Priority');
  assert(detailPane.innerHTML.includes('Spit at the first target in range'), 'Detail pane contains Stopping Rule');
  assert(detailPane.innerHTML.includes('Acid beast spit'), 'Detail pane renders embedded decision tree');
  assert(detailPane.innerHTML.includes('Acid Glob'), 'Detail pane contains signature action Acid Glob');
  assert(detailPane.innerHTML.includes('Agonizing Spit'), 'Detail pane contains signature action Agonizing Spit');
  assert(detailPane.innerHTML.includes('Source Figures &amp; Rating Rationale'), 'Detail pane contains collapsible Source Figures section');
  assert(detailPane.innerHTML.includes('Table 5-8 Acid Beast resistance/immunity'), 'Detail pane contains canonical figure from evidence.json');
  assert(detailPane.innerHTML.includes('Station Lair to Node:'), 'Detail pane contains Station Lair to Node selector');

  // 7. Test Stationing creature to a node
  sb.assignEntityToNode('creature_acid_beasts', '1', false);
  assertEqual(acidBeast.nodeId, 1, 'assignEntityToNode stations creature to Node 1');
  assertEqual(acidBeast.stationing.nodeId, 1, 'assignEntityToNode sets stationing.nodeId to 1');
  assertEqual(acidBeast.stationing.mode, 'lair', 'assignEntityToNode sets stationing.mode to lair');

  // Test getRecursiveNodeEntities surfaces creature on Node 1
  const recNode1 = sb.getRecursiveNodeEntities(1, 'map_root');
  assert(recNode1.direct.creatures.some(c => c.id === 'creature_acid_beasts'), 'getRecursiveNodeEntities includes direct creature on Node 1');
  assertEqual(recNode1.totals.creatures, 1, 'getRecursiveNodeEntities totals.creatures is 1');
}

async function testSuite55CreatureCrudAndCascadeDelete() {
  console.log('\n--- Suite 55: Creature CRUD Dialogs, Cascade Deletion & Stationing Lifecycle ---');

  const diabloTopo = JSON.parse(fs.readFileSync(path.join(ROOT, 'campaigns/DIablo/topology.json'), 'utf8'));
  const diabloEv = JSON.parse(fs.readFileSync(path.join(ROOT, 'campaigns/DIablo/creatures/evidence.json'), 'utf8'));

  const fftCoreCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/fast_frugal_tree.js'), 'utf8');
  const fftUiCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/fft_editor_ui.js'), 'utf8');
  const workstationStateCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/workstation_state.js'), 'utf8');
  const cmeCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/campaign_mutation_engine.js'), 'utf8');
  const entityCoreCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_core.js'), 'utf8');
  const cadRendererCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/cad_canvas_renderer.js'), 'utf8');
  const emUiCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_manager_ui.js'), 'utf8');
  const entityCrudCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_crud_dialogs.js'), 'utf8');
  const cascadeDeleteCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_cascade_delete.js'), 'utf8');

  const domElements = {};
  function makeElement(id) {
    return {
      id: id,
      value: '',
      innerHTML: '',
      textContent: '',
      style: { display: '' },
      classList: {
        classes: new Set(),
        add: function(c) { this.classes.add(c); },
        remove: function(c) { this.classes.delete(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      children: [],
      appendChild: function(c) { this.children.push(c); },
      querySelectorAll: function() { return []; },
      getAttribute: function(k) { return ''; },
      setAttribute: function(k, v) {},
      getAttributeNS: function(ns, k) { return ''; },
      setAttributeNS: function(ns, k, v) {},
      addEventListener: function() {},
      removeEventListener: function() {}
    };
  }

  const sb = {
    console,
    Math,
    parseInt,
    parseFloat,
    isNaN,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Date,
    RegExp,
    Set,
    Map,
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    JSON,
    document: {
      getElementById: (id) => {
        if (!domElements[id]) domElements[id] = makeElement(id);
        return domElements[id];
      },
      createElement: (tag) => makeElement(tag),
      createElementNS: (ns, tag) => makeElement(tag),
      body: { appendChild: () => {} },
      querySelectorAll: () => []
    },
    window: {},
    Workstation: {
      activeTopology: diabloTopo,
      registeredMods: {}
    },
    MDIWindowManager: {
      open: () => {},
      windows: {},
      renderTaskbar: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    closeAllMenus: () => {},
    closeModal: () => {},
    maps: { map_root: diabloTopo },
    activeMapId: 'map_root',
    saveActiveCampaign: () => {},
    renderCanvas: () => {},
    updatePropertiesGrid: () => {},
    setStatusBarMessage: () => {},
    alert: () => {},
    confirm: () => true,
    prompt: () => ''
  };
  sb.window = sb;
  sb.globalThis = sb;

  vm.createContext(sb);
  vm.runInContext(fftCoreCode, sb);
  vm.runInContext(fftUiCode, sb);
  vm.runInContext(workstationStateCode, sb);
  vm.runInContext(cmeCode, sb);
  vm.runInContext(entityCoreCode, sb);
  vm.runInContext(cadRendererCode, sb);
  vm.runInContext(emUiCode, sb);
  vm.runInContext(entityCrudCode, sb);
  vm.runInContext(cascadeDeleteCode, sb);

  sb.Workstation.activeTopology = diabloTopo;
  diabloTopo.creatureEvidence = diabloEv;

  // 1. Test openNewEntityModal('creature')
  sb.switchEntityManagerTab('creature');
  sb.openNewEntityModal('creature');

  const titleEl = sb.document.getElementById('ee-modal-title');
  assert(titleEl.textContent.includes('CREATURE'), 'openNewEntityModal sets CREATURE title');
  const creatureExt = sb.document.getElementById('ee-creature-extensions');
  assertEqual(creatureExt.style.display, 'flex', 'openNewEntityModal displays creature extensions');
  const npcExt = sb.document.getElementById('ee-npc-extensions');
  assertEqual(npcExt.style.display, 'none', 'openNewEntityModal hides NPC extensions');

  assertEqual(sb.document.getElementById('ee-creature-kind').value, 'beast', 'Default creature kind is beast');
  assertEqual(sb.document.getElementById('ee-creature-size').value, 'Medium', 'Default creature size is Medium');
  assertEqual(sb.document.getElementById('ee-creature-threat-tier').value, '2', 'Default creature threat tier is 2');
  assertEqual(sb.document.getElementById('ee-creature-dread-index').value, '3', 'Default creature dread index is 3');
  assertEqual(sb.document.getElementById('ee-creature-roaming-scope').value, 'stationary_lair', 'Default roaming scope is stationary_lair');
  assertEqual(sb.document.getElementById('ee-creature-might').value, '3', 'Default might capability is 3');

  // 2. Test Custom Creature Creation via saveCustomEntity()
  const initialCreatureCount = diabloTopo.creatures.length;
  sb.document.getElementById('ee-entity-type').value = 'creature';
  sb.document.getElementById('ee-entity-id').value = '';
  sb.document.getElementById('ee-name').value = 'Obsidian Behemoth';
  sb.document.getElementById('ee-notes').value = 'Colossal magma beast dwelling in the subterranean depths.';
  sb.document.getElementById('ee-node-select').value = '1';
  sb.document.getElementById('ee-creature-kind').value = 'elemental';
  sb.document.getElementById('ee-creature-subtype').value = 'magma behemoth';
  sb.document.getElementById('ee-creature-size').value = 'Gargantuan';
  sb.document.getElementById('ee-creature-threat-tier').value = '4';
  sb.document.getElementById('ee-creature-dread-index').value = '8';
  sb.document.getElementById('ee-creature-dread-effect').value = 'Radiates extreme heat that melts weapons.';
  sb.document.getElementById('ee-creature-roaming-scope').value = 'district_wide';
  sb.document.getElementById('ee-creature-might').value = '5';
  sb.document.getElementById('ee-creature-agility').value = '1';
  sb.document.getElementById('ee-creature-resilience').value = '5';
  sb.document.getElementById('ee-creature-cunning').value = '2';
  sb.document.getElementById('ee-creature-awareness').value = '3';
  sb.document.getElementById('ee-creature-presence').value = '5';

  sb.saveCustomEntity();

  assertEqual(diabloTopo.creatures.length, initialCreatureCount + 1, 'New creature pushed to diabloTopo.creatures');
  const createdCreature = diabloTopo.creatures.find(c => c.name === 'Obsidian Behemoth');
  assert(createdCreature !== undefined, 'Created creature found in creatures list');
  assert(createdCreature.id.startsWith('creature_obsidian_behemoth'), 'Created creature ID slugified');
  assertEqual(createdCreature.kind, 'elemental', 'Created creature kind is elemental');
  assertEqual(createdCreature.subtype, 'magma behemoth', 'Created creature subtype is magma behemoth');
  assertEqual(createdCreature.size, 'Gargantuan', 'Created creature size is Gargantuan');
  assertEqual(createdCreature.threatTier, 4, 'Created creature threat tier is 4');
  assertEqual(createdCreature.nodeId, 1, 'Created creature nodeId is 1');
  assertEqual(createdCreature.stationing.nodeId, 1, 'Created creature stationing.nodeId is 1');
  assertEqual(createdCreature.stationing.mode, 'lair', 'Created creature stationing.mode is lair');
  assertEqual(createdCreature.stationing.roamingScope, 'district_wide', 'Created creature roaming scope is district_wide');
  assertEqual(createdCreature.relativeCapabilities.might, 5, 'Might capability is 5');
  assertEqual(createdCreature.relativeCapabilities.resilience, 5, 'Resilience capability is 5');
  assertEqual(createdCreature.gigerenzerBehavior.dreadIndex, 8, 'Dread index is 8');
  assertEqual(createdCreature.gigerenzerBehavior.dreadEffect, 'Radiates extreme heat that melts weapons.', 'Dread effect saved');
  assert(createdCreature.gigerenzerBehavior.fastAndFrugalTree !== undefined, 'Auto-generated fastAndFrugalTree exists');
  assertEqual(sb.validateFft(createdCreature.gigerenzerBehavior.fastAndFrugalTree).length, 0, 'Auto-generated FFT passes validation');

  // 3. Test Editing Creature via openEditEntityModal & saveCustomEntity()
  sb.openEditEntityModal(createdCreature.id);
  assertEqual(sb.document.getElementById('ee-name').value, 'Obsidian Behemoth', 'openEditEntityModal populates name');
  assertEqual(sb.document.getElementById('ee-creature-kind').value, 'elemental', 'openEditEntityModal populates kind');
  assertEqual(sb.document.getElementById('ee-creature-threat-tier').value, '4', 'openEditEntityModal populates threat tier');
  assertEqual(sb.document.getElementById('ee-creature-dread-index').value, '8', 'openEditEntityModal populates dread index');
  assertEqual(sb.document.getElementById('ee-node-select').value, '1', 'openEditEntityModal populates stationed node');

  // Modify fields
  sb.document.getElementById('ee-name').value = 'Elder Obsidian Behemoth';
  sb.document.getElementById('ee-creature-threat-tier').value = '5';
  sb.document.getElementById('ee-creature-dread-index').value = '10';
  sb.document.getElementById('ee-node-select').value = '2';
  sb.saveCustomEntity();

  assertEqual(createdCreature.name, 'Elder Obsidian Behemoth', 'Edited creature name updated');
  assertEqual(createdCreature.threatTier, 5, 'Edited creature threat tier updated to 5');
  assertEqual(createdCreature.gigerenzerBehavior.dreadIndex, 10, 'Edited creature dread index updated to 10');
  assertEqual(createdCreature.nodeId, 2, 'Edited creature nodeId updated to 2');
  assertEqual(createdCreature.stationing.nodeId, 2, 'Edited creature stationing.nodeId updated to 2');

  // 4. Test analyzeEntityDependencies on Creature
  const depData = sb.analyzeEntityDependencies('creature', createdCreature.id);
  assert(depData !== null, 'analyzeEntityDependencies returns dependency data for creature');
  assertEqual(depData.target.name, 'Elder Obsidian Behemoth', 'Dependency target name matches');
  assert(depData.target.role.includes('elemental'), 'Dependency target role includes elemental');
  assert(depData.target.details.includes('Tier 5'), 'Dependency target details includes Tier 5');
  assert(depData.target.details.includes('Dread: 10/10'), 'Dependency target details includes Dread 10/10');
  assertEqual(depData.target.isActive, true, 'Dependency target is active in campaign');

  // 5. Test Deletion of Creature via executeCascadeDelete
  sb._activeDeletionContext = depData;
  sb.executeCascadeDelete([depData.target]);
  assertEqual(diabloTopo.creatures.some(c => c.id === createdCreature.id), false, 'Created creature removed from diabloTopo.creatures by cascade delete');

  // 6. Test Node Deletion Cascade Unlinking Stationed Creature
  const nodeKeys = Object.keys(diabloTopo.nodes);
  const targetNodeKey = nodeKeys[0];
  const acidBeast = diabloTopo.creatures.find(c => c.id === 'creature_acid_beasts');
  sb.assignEntityToNode('creature_acid_beasts', targetNodeKey, false);
  assertEqual(acidBeast.stationing.nodeId, targetNodeKey, 'Acid beasts stationed at target node');

  // Analyze target node dependencies
  const nodeDep = sb.analyzeEntityDependencies('node', targetNodeKey);
  const creatureDep = nodeDep.dependencies.find(d => d.type === 'creature' && d.id === 'creature_acid_beasts');
  assert(creatureDep !== undefined, 'Target node dependency analysis detects stationed creature');
  assert(creatureDep.reason.toLowerCase().includes('station'), 'Creature dependency reason mentions node stationing');

  // Delete target node via CampaignMutationEngine
  sb.CampaignMutationEngine.deleteEntity(diabloTopo, 'nodes', targetNodeKey);
  assertEqual(acidBeast.nodeId, null, 'CME deleteEntity on node nulls creature nodeId');
  assertEqual(acidBeast.stationing.nodeId, null, 'CME deleteEntity on node nulls creature stationing.nodeId');
  assertEqual(acidBeast.stationing.mode, 'unassigned', 'CME deleteEntity on node resets creature stationing.mode to unassigned');
}

function testSuite56QuestExplorerEnrichmentAndCrucible() {
  console.log('\n--- Test Suite 56: Quest Explorer Enrichment, What-If Crucibles & NPC Semantic Roles ---');

  const emUiCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_manager_ui.js'), 'utf8');
  const wsStateCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/workstation_state.js'), 'utf8');

  const sb = {
    console,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    RegExp,
    Set,
    Map,
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    window: {},
    Workstation: { activeTopology: {} }
  };
  sb.window = sb;

  vm.createContext(sb);
  vm.runInContext(wsStateCode, sb);
  vm.runInContext(emUiCode, sb);

  // 1. Test parseQuestCrucibleNotes on standard What-If Crucible with markdown tokens
  const sample1 = `A rogue sister has turned to evil.
**Canonical Outcome:** Kashya rewards the rogue hero.
**Crucible Divergence Point:** The hero spares Blood Raven's corrupted soul.
**Snarky vs Altruistic:** Mock the Sisterhood or uphold their solemn vow.
**Immediate Dilemma:** Execute or exorcise.
**Long-Term Ripple:** Rogue archers refuse to aid the Monastery.
**Key NPC Reactions:** Akara weeps; Kashya draws her blade.
**Table Hook:** A haunting melody plays across the burial grounds.`;

  const res1 = sb.parseQuestCrucibleNotes(sample1);
  assertEqual(res1.hasCrucible, true, 'Crucible detected in sample 1');
  assertEqual(res1.synopsis, 'A rogue sister has turned to evil.', 'Synopsis separated cleanly');
  assert(res1.canonicalOutcome.includes('Kashya rewards'), 'Canonical outcome extracted');
  assert(res1.divergencePoint.includes('spares Blood Raven'), 'Divergence point extracted');
  assert(res1.snarkyVsAltruistic.includes('Mock the Sisterhood'), 'Snarky vs altruistic extracted');
  assert(res1.dilemma.includes('Execute or exorcise'), 'Immediate dilemma extracted');
  assert(res1.ripple.includes('Rogue archers refuse'), 'Long-term ripple extracted');
  assert(res1.npcReactions.includes('Akara weeps'), 'Key NPC reactions extracted');
  assert(res1.tableHook.includes('haunting melody'), 'Table hook extracted');

  // 2. Test parseQuestCrucibleNotes with **What-If Crucible:** header
  const sample2 = `Rescue Cain from Tristram.
**What-If Crucible:**
**Immediate Dilemma:** The portal closes before Cain escapes.
**Long-Term Ripple:** Tristram remains consumed by flames.`;

  const res2 = sb.parseQuestCrucibleNotes(sample2);
  assertEqual(res2.hasCrucible, true, 'Crucible detected with What-If header');
  assertEqual(res2.synopsis, 'Rescue Cain from Tristram.', 'Synopsis separated cleanly with header');
  assert(res2.dilemma.includes('portal closes'), 'Dilemma extracted with header');
  assert(res2.ripple.includes('consumed by flames'), 'Ripple extracted with header');

  // 3. Test parseQuestCrucibleNotes without crucible tokens
  const sample3 = 'Retrieve the Horadric Malus from the Smith.';
  const res3 = sb.parseQuestCrucibleNotes(sample3);
  assertEqual(res3.hasCrucible, false, 'No crucible detected on plain notes');
  assertEqual(res3.synopsis, 'Retrieve the Horadric Malus from the Smith.', 'Plain synopsis retained intact');
  assertEqual(res3.canonicalOutcome, '', 'Canonical outcome is empty for plain notes');

  // 4. Test getQuestThreatBadgeHtml
  const lethalBadge = sb.getQuestThreatBadgeHtml('Lethal');
  assert(lethalBadge.includes('#fee2e2') && lethalBadge.includes('Lethal'), 'Lethal threat displays text with red badge style');

  const ticksBadge = sb.getQuestThreatBadgeHtml('4 Ticks');
  assert(ticksBadge.includes('4 Ticks'), '4 Ticks threat displays text');

  const emptyBadge = sb.getQuestThreatBadgeHtml('');
  assertEqual(emptyBadge, '', 'Empty threat returns empty string');

  // 5. Test ensureEntityCollections normalization of quest roles and step dual flags
  const testTopo = {
    nodes: { '1': { id: 1, name: 'Rogue Encampment' } },
    npcs: [
      { id: 'npc_akara', name: 'Akara' },
      { id: 'npc_blood_raven', name: 'Blood Raven' }
    ],
    quests: [
      {
        id: 'q_blood_raven',
        title: "Sisters' Burial Grounds",
        giverNpcId: 'npc_akara',
        targetNpcId: 'npc_blood_raven',
        npcIds: [],
        steps: [
          { id: 's1', title: 'Find the Burial Grounds', completed: true },
          { id: 's2', title: 'Slay Blood Raven', isCompleted: false, text: 'Defeat the corrupted sister.' }
        ]
      }
    ]
  };

  sb.ensureEntityCollections(testTopo);
  const normQ = testTopo.quests[0];
  assertEqual(normQ.name, "Sisters' Burial Grounds", 'Quest name synchronized with title');
  assert(normQ.npcIds.includes('npc_akara'), 'giverNpcId included in npcIds');
  assert(normQ.npcIds.includes('npc_blood_raven'), 'targetNpcId included in npcIds');
  assertEqual(normQ.steps[0].isCompleted, true, 'step[0].isCompleted synchronized from completed:true');
  assertEqual(normQ.steps[0].completed, true, 'step[0].completed preserved');
  assertEqual(normQ.steps[1].completed, false, 'step[1].completed synchronized from isCompleted:false');
  assertEqual(normQ.steps[1].text, 'Defeat the corrupted sister.', 'step.text narrative preserved');
}

async function testSuite57CrossCampaignExplorerAndTransplant() {
  console.log('\n--- Test Suite 57: Cross-Campaign Entity Exploration & Transplant Packaging Wizard ---');

  const ecCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_core.js'), 'utf8');
  const wsStateCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/workstation_state.js'), 'utf8');
  const emUiCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_manager_ui.js'), 'utf8');
  const crudCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_crud_dialogs.js'), 'utf8');

  // Create mock DOM & Browser environment
  const mockElements = {};
  function createMockElement(id) {
    return {
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      appendChild: () => {},
      querySelectorAll: () => [],
      querySelector: () => null
    };
  }

  const domIds = [
    'modal-transplant-package', 'tp-modal-title', 'tp-primary-summary',
    'tp-primary-name', 'tp-primary-meta', 'tp-target-node', 'tp-id-strategy',
    'tp-deps-count', 'tp-deps-table-body', 'tp-conflict-banner', 'em-sources-popover',
    'em-sources-checklist', 'em-sources-count-badge', 'em-table-body', 'em-detail-pane'
  ];
  domIds.forEach(id => { mockElements[id] = createMockElement(id); });

  const sb = {
    console,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    RegExp,
    Set,
    Map,
    JSON,
    addEventListener: () => {},
    removeEventListener: () => {},
    alert: (msg) => {},
    confirm: () => true,
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    document: {
      getElementById: (id) => mockElements[id] || null,
      querySelectorAll: () => [],
      querySelector: (sel) => null,
      createElement: (tag) => createMockElement(tag),
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    window: {},
    CAMPAIGN_REGISTRY: {
      diablo2: {
        name: 'Diablo II: Lord of Destruction',
        campaign: {
          topology: {
            nodes: {
              '10': { id: '10', name: 'Rogue Encampment', culture: 'Clan' },
              '11': { id: '11', name: 'Burial Grounds', culture: 'Hierarchy' }
            },
            npcs: [
              { id: 'npc_ext_kashya', name: 'Kashya', nodeId: '10', role: 'Captain' },
              { id: 'npc_ext_raven', name: 'Blood Raven', nodeId: '11', role: 'Corrupted Sister' }
            ],
            items: [
              { id: 'item_ext_bow', name: 'Raven Claw Bow', ownerNpcId: 'npc_ext_raven', nodeId: '11' }
            ],
            quests: [
              {
                id: 'quest_blood_raven',
                title: 'Sisters\' Burial Grounds',
                giverNpcId: 'npc_ext_kashya',
                targetNpcId: 'npc_ext_raven',
                itemIds: ['item_ext_bow'],
                nodeId: '11',
                steps: [
                  { title: 'Defeat Raven', triggerTrackerId: 'clock_corrupt' }
                ]
              }
            ],
            trackers: [
              { id: 'clock_corrupt', title: 'Corruption Clock', segments: 4 }
            ]
          }
        }
      }
    },
    Workstation: {
      activeTopology: {
        name: 'Active Campaign',
        nodes: {
          '1': { id: '1', name: 'Town Square', culture: 'Clan' }
        },
        npcs: [
          { id: 'npc_active_deckard', name: 'Deckard Cain', nodeId: '1' }
        ],
        items: [],
        quests: [],
        trackers: [],
        factions: [],
        creatures: []
      }
    },
    saveActiveCampaign: () => {},
    setStatusBarMessage: () => {}
  };
  sb.window = sb;

  vm.createContext(sb);
  vm.runInContext(wsStateCode, sb);
  vm.runInContext(ecCode, sb);
  vm.runInContext(emUiCode, sb);
  vm.runInContext(crudCode, sb);

  sb.Workstation.activeTopology = {
    name: 'Active Campaign',
    nodes: {
      '1': { id: '1', name: 'Town Square', culture: 'Clan' }
    },
    npcs: [
      { id: 'npc_active_deckard', name: 'Deckard Cain', nodeId: '1' }
    ],
    items: [],
    quests: [],
    trackers: [],
    factions: [],
    creatures: []
  };

  // 1. Verify CrossCampaignService registration
  assert(sb.CrossCampaignService, 'CrossCampaignService is defined and attached to window');
  const sources = sb.CrossCampaignService.discoverAvailableSources();
  assert(Array.isArray(sources), 'discoverAvailableSources returns an array');
  const d2Source = sources.find(s => s.id === 'diablo2');
  assert(d2Source, 'Bundled diablo2 source found in available sources');
  assertEqual(d2Source.isLoaded, false, 'Diablo 2 starts unloaded');

  // 2. Toggle load source
  const loadedPkg = await sb.CrossCampaignService.toggleSource('diablo2', true);
  assert(loadedPkg, 'toggleSource loads Diablo II');
  assertEqual(sb.CrossCampaignService.isSourceLoaded('diablo2'), true, 'Diablo II is marked loaded');

  // 3. Strict Isolation Invariant: active campaign list untouched
  const activeQuests = sb.getActiveEntityList('quest');
  assertEqual(activeQuests.length, 0, 'Active campaign quests list remains empty (Strict Isolation)');

  // 4. Staged external entities accessible via CrossCampaignService
  const extQuests = sb.CrossCampaignService.getExternalEntities('quest');
  assertEqual(extQuests.length, 1, '1 external quest discovered across loaded sources');
  const extQ = extQuests[0];
  assertEqual(extQ._isExternal, true, 'External entity stamped with _isExternal');
  assertEqual(extQ._sourceCampaignId, 'diablo2', 'External entity stamped with _sourceCampaignId');
  assertEqual(extQ.nodeId, null, 'External entity stationing decoupled to null to prevent collision');
  assertEqual(extQ._originalNodeId, '11', 'Original stationing captured in _originalNodeId');
  assertEqual(extQ._externalKey, 'ext::diablo2::quest_blood_raven', 'External key formatted correctly');

  // 5. Test resolveExternalEntity
  const resolved = sb.CrossCampaignService.resolveExternalEntity('ext::diablo2::quest_blood_raven', 'quest');
  assert(resolved, 'resolveExternalEntity finds external quest by key');
  assertEqual(resolved.sourceId, 'diablo2', 'Resolved sourceId matches');
  assertEqual(resolved.entity.id, 'quest_blood_raven', 'Resolved entity matches');

  // 6. Test analyzeTransplantDependencies
  const deps = sb.analyzeTransplantDependencies(resolved.entity, 'quest', resolved.sourcePool);
  assert(Array.isArray(deps), 'analyzeTransplantDependencies returns array');
  assertEqual(deps.length, 4, 'Discovered exactly 4 dependencies (Giver NPC, Target NPC, Item, Tracker)');

  const giverDep = deps.find(d => d.id === 'npc_ext_kashya');
  assert(giverDep, 'Giver NPC found in dependencies');
  assertEqual(giverDep.role, 'Quest Giver', 'Giver role identified');
  assertEqual(giverDep.type, 'npc', 'Giver type is npc');

  const tgtDep = deps.find(d => d.id === 'npc_ext_raven');
  assert(tgtDep, 'Target NPC found in dependencies');
  assertEqual(tgtDep.role, 'Quest Target', 'Target role identified');

  const itemDep = deps.find(d => d.id === 'item_ext_bow');
  assert(itemDep, 'Bow relic found in dependencies');
  assertEqual(itemDep.role, 'Required / Reward Relic', 'Item role identified');

  const clockDep = deps.find(d => d.id === 'clock_corrupt');
  assert(clockDep, 'Trigger clock found in dependencies');
  assertEqual(clockDep.role, 'Step Trigger Clock', 'Clock role identified');

  // 7. Test openTransplantPackageModal
  sb.openTransplantPackageModal('ext::diablo2::quest_blood_raven', 'quest');
  assert(mockElements['tp-primary-name'].textContent.includes('Burial Grounds'), 'Transplant modal populated primary entity name');

  // 8. Test executeTransplantPackage with Foreign-Key Rewriting & ID auto_unique
  mockElements['tp-id-strategy'].value = 'auto_unique';
  mockElements['tp-target-node'].value = '1';

  // Override querySelector to simulate user selecting:
  // - giver: copy
  // - target: copy
  // - item: copy
  // - clock: omit
  sb.document.querySelector = (sel) => {
    if (sel.includes('.tp-action-select[data-dep-idx="0"]')) return { value: 'copy' };
    if (sel.includes('.tp-action-select[data-dep-idx="1"]')) return { value: 'copy' };
    if (sel.includes('.tp-action-select[data-dep-idx="2"]')) return { value: 'copy' };
    if (sel.includes('.tp-action-select[data-dep-idx="3"]')) return { value: 'omit' };
    return null;
  };

  sb.executeTransplantPackage();

  // Verify Active Campaign after transplant
  const topo = sb.Workstation.activeTopology;
  assertEqual(topo.quests.length, 1, 'Active campaign now contains 1 transplanted quest');
  const activeQ = topo.quests[0];
  assertEqual(activeQ.id, 'quest_blood_raven', 'Transplanted quest ID preserved under auto_unique without collision');
  assertEqual(activeQ.nodeId, '1', 'Transplanted quest stationed to selected active node 1');
  assertEqual(activeQ._isExternal, undefined, '_isExternal stripped on transplant');

  // Verify NPCs copied into active campaign
  assertEqual(topo.npcs.length, 3, 'Active campaign has 3 NPCs (Deckard + Kashya + Raven)');
  const kashya = topo.npcs.find(n => n.name === 'Kashya');
  const raven = topo.npcs.find(n => n.name === 'Blood Raven');
  assert(kashya, 'Kashya copied into active campaign');
  assert(raven, 'Raven copied into active campaign');
  assertEqual(kashya.nodeId, '1', 'Kashya stationed to active node 1');
  assertEqual(raven.nodeId, '1', 'Raven stationed to active node 1');

  // Verify Foreign Key Rewriting on quest
  assertEqual(activeQ.giverNpcId, kashya.id, 'Quest giver foreign key rewritten to active Kashya');
  assertEqual(activeQ.targetNpcId, raven.id, 'Quest target foreign key rewritten to active Raven');

  // Verify Item copied
  assertEqual(topo.items.length, 1, 'Bow relic copied into active campaign');
  assertEqual(topo.items[0].nodeId, '1', 'Bow stationed to active node 1');

  // Verify Omitted clock cleared from quest step
  assertEqual(activeQ.steps[0].triggerTrackerId, null, 'Omitted clock reference cleanly severed to null');
  assertEqual(topo.trackers.length, 0, 'Omitted clock was not added to active trackers');

  // 9. Test ID collision handling under auto_unique
  sb.openTransplantPackageModal('ext::diablo2::quest_blood_raven', 'quest');
  sb.executeTransplantPackage();
  assertEqual(topo.quests.length, 2, 'Second transplant created duplicate without error under auto_unique');
  assertEqual(topo.quests[1].id, 'quest_blood_raven_imported', 'Second transplant generated unique ID with _imported suffix');

  // 10. Test unloadAllSources
  sb.CrossCampaignService.unloadAllSources();
  assertEqual(sb.CrossCampaignService.getLoadedSourcesList().length, 0, 'unloadAllSources clears loaded sources');
  assertEqual(sb.CrossCampaignService.getExternalEntities('quest').length, 0, 'External entities empty after unload');
}

function testSuite58MultiExplorerEnrichment() {
  console.log('\n--- Test Suite 58: Multi-Explorer Enrichment & Cross-Entity Property Grid Parity ---');

  const ecCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_core.js'), 'utf8');
  const wsStateCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/workstation_state.js'), 'utf8');
  const emUiCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/entity_manager_ui.js'), 'utf8');
  const propGridCode = fs.readFileSync(path.join(ROOT, 'src/workstation/scripts/property_grid_inspector.js'), 'utf8');

  const mockElements = {};
  function getMockEl(id) {
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: function(child) { this.children.push(child); },
        children: [],
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        removeAttribute: () => {},
        querySelectorAll: () => [],
        querySelector: () => null
      };
    }
    return mockElements[id];
  }

  const sb = {
    console,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    RegExp,
    Set,
    Map,
    JSON,
    addEventListener: () => {},
    removeEventListener: () => {},
    alert: () => {},
    confirm: () => true,
    MDIWindowManager: { windows: {} },
    AUTOCAD_COLORS: [{ val: 'red', label: 'Red' }],
    getRecursiveNodeEntities: () => ({ direct: { npcs: [], quests: [], items: [], trackers: [], submaps: [] }, submaps: [], totals: { npcs: 0, quests: 0, items: 0, trackers: 0, submaps: 0 } }),
    document: {
      getElementById: (id) => getMockEl(id),
      querySelectorAll: () => [],
      querySelector: () => null,
      createElement: (tag) => getMockEl(tag),
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    window: {}
  };
  sb.window = sb;

  vm.createContext(sb);
  vm.runInContext(wsStateCode, sb);
  vm.runInContext(ecCode, sb);
  vm.runInContext(emUiCode, sb);
  vm.runInContext(propGridCode, sb);

  // 1. formatEntityNavId helper tests
  assertEqual(sb.formatEntityNavId('npc_1', false), 'npc_1', 'formatEntityNavId preserves bare ID for local entities');
  assertEqual(sb.formatEntityNavId('npc_1', true, 'bg1'), 'ext::bg1::npc_1', 'formatEntityNavId prefixes ext::<sourceId>:: for external entities');
  assertEqual(sb.formatEntityNavId('ext::bg1::npc_1', true, 'bg1'), 'ext::bg1::npc_1', 'formatEntityNavId does not double-prefix external key');
  assertEqual(sb.formatEntityNavId('', true, 'bg1'), '', 'formatEntityNavId returns empty string for falsy ID');

  // 2. renderNpcDialogueHooksHtml polymorphic tests
  const objHookNpc = {
    dialogueHooks: [
      { text: 'The ancient stone gate is sealed shut.', revealed: true },
      { text: 'Knows the royal secret passphrase.', revealed: false }
    ]
  };
  const objHookHtml = sb.renderNpcDialogueHooksHtml(objHookNpc, false);
  assert(!objHookHtml.includes('[object Object]'), 'Object dialogue hooks do not render as [object Object]');
  assert(objHookHtml.includes('[REVEALED IN CANON]') && objHookHtml.includes('ancient stone gate'), 'Object hook renders [REVEALED IN CANON] badge and text');
  assert(objHookHtml.includes('royal secret passphrase'), 'Object hook renders unrevealed dialogue hook text');

  const bifocalHookNpc = {
    dialogueHooks: [
      'Spoken: Greetings, traveler! | Subtext: Assessing whether you carry gold'
    ]
  };
  const bifocalHtml = sb.renderNpcDialogueHooksHtml(bifocalHookNpc, false);
  assert(!bifocalHtml.includes('[object Object]'), 'Bifocal dialogue hook does not render as [object Object]');
  assert(bifocalHtml.includes('Greetings, traveler!') && bifocalHtml.includes('Assessing whether you carry gold'), 'Bifocal hook renders both spoken dialogue and subtext');

  // 3. Property Grid Inspector Parity Tests
  const mockTopo = {
    nodes: {
      '1': { id: 1, name: 'Beregost' },
      '2': { id: 2, name: 'Friendly Arm Inn' }
    },
    npcs: [
      { id: 'npc_1', name: 'Khalid', fourCornersRole: 'Mentor' }
    ],
    items: [
      { id: 'item_1', name: 'Moonblade', status: 'attuned', value: '5000 gp' }
    ],
    quests: [],
    trackers: [],
    factions: [
      {
        id: 'fac_1',
        name: 'Harpers',
        status: 'Underground',
        reach: 'Regional',
        force: 'Covert',
        wealth: 'Substantial',
        secrecy: 'High',
        territoryNodeIds: ['1', '2'],
        memberNpcIds: ['npc_1']
      }
    ],
    creatures: [
      {
        id: 'cr_1',
        name: 'Gargoyle',
        threatTier: 'Apex',
        kind: 'Monstrosity',
        roamingScope: 'territorial',
        defenses: { immunities: ['Petrification'] }
      }
    ],
    resources: [
      {
        id: 'res_1',
        name: 'Refined Iron',
        category: 'Metals & Minerals',
        supplyTier: 'Manufactured',
        priceIndex: '15 gp / ingot'
      }
    ]
  };

  // 3a: Creature in property grid
  const crTbody = getMockEl('tbody-creature-pg');
  sb.renderEntityExplorerProperties(crTbody, 'creature', 'cr_1', mockTopo);
  assert(crTbody.children.length > 5, 'Creature properties rendered in property grid');

  // 3b: Resource in property grid
  const resTbody = getMockEl('tbody-resource-pg');
  sb.renderEntityExplorerProperties(resTbody, 'resource', 'res_1', mockTopo);
  assert(resTbody.children.length > 4, 'Resource properties rendered in property grid');

  // 3c: Item status & value in property grid
  const itmTbody = getMockEl('tbody-item-pg');
  sb.renderEntityExplorerProperties(itmTbody, 'item', 'item_1', mockTopo);
  assert(itmTbody.children.length > 5, 'Item properties rendered in property grid');

  // 3d: Faction 4-axis power & territory in property grid
  const facTbody = getMockEl('tbody-faction-pg');
  sb.renderEntityExplorerProperties(facTbody, 'faction', 'fac_1', mockTopo);
  assert(facTbody.children.length > 5, 'Faction properties rendered in property grid');

  // 4. Faction Inspector in entity_manager_ui.js
  sb.Workstation.activeTopology = {
    name: 'Active Test Campaign',
    nodes: {
      '1': {
        id: 1,
        name: 'Beregost',
        cat: 'Settlement',
        dangerRating: 3,
        customNotes: 'A bustling trade town centered around the Jovial Juggler.',
        provides: ['Food: Grain', 'Water: Well'],
        requires: ['Defense: Militia'],
        demographics: { primary: { name: 'Humans', percentage: 80 } },
        faction: 'Shadow Thieves',
        factionPresence: ['Harpers'],
        partyRapport: { stance: 1, notes: 'Saved the town from bandits' }
      },
      '2': { id: 2, name: 'Coast Way' }
    },
    npcs: [
      { id: 'npc_boss', name: 'Shadowmaster', factionId: 'fac_shadow', carriedItemIds: ['itm_dagger'] },
      { id: 'npc_footpad', name: 'Footpad', faction: 'Shadow Thieves' }
    ],
    items: [
      { id: 'itm_dagger', name: 'Poison Dagger', status: 'Active', value: '150 gp', ownerNpcId: 'npc_boss' }
    ],
    quests: [],
    trackers: [],
    factions: [
      {
        id: 'fac_shadow',
        name: 'Shadow Thieves',
        status: 'Active',
        disposition: [1, 3, 2],
        reach: 'Continental',
        force: 'Lethal',
        wealth: 'Immense',
        secrecy: 'Absolute',
        territoryNodeIds: ['1'],
        controlledNodeIds: ['2'],
        memberNpcIds: ['npc_boss']
      }
    ],
    creatures: [
      {
        id: 'cr_drake',
        name: 'Shadow Drake',
        scientificOrArchaicName: 'Draco Umbra',
        threatTier: 'Apex',
        roamingScope: 'regional',
        defenses: { immunities: ['Cold', 'Necrotic'] },
        harvest: { harvestYields: ['Shadow Drake Scales x4'], domesticationProfile: 'Wild / Untamable' },
        relationalLinks: { hunts: 'Mountain Wyverns' }
      }
    ]
  };

  sb.switchEntityManagerTab('faction');
  sb.selectEntityItem('fac_shadow');
  const facPaneHtml = getMockEl('em-detail-pane').innerHTML;
  assert(facPaneHtml.includes('Shadow Thieves'), 'Faction Inspector renders faction title');
  assert(facPaneHtml.includes('REACH') && facPaneHtml.includes('Continental'), 'Faction Inspector renders Reach metric');
  assert(facPaneHtml.includes('FORCE') && facPaneHtml.includes('Lethal'), 'Faction Inspector renders Force metric');
  assert(facPaneHtml.includes('WEALTH') && facPaneHtml.includes('Immense'), 'Faction Inspector renders Wealth metric');
  assert(facPaneHtml.includes('SECRECY') && facPaneHtml.includes('Absolute'), 'Faction Inspector renders Secrecy metric');
  assert(facPaneHtml.includes('Beregost') && facPaneHtml.includes('Coast Way'), 'Faction Inspector unionizes territoryNodeIds and controlledNodeIds');
  assert(facPaneHtml.includes('Shadowmaster') && facPaneHtml.includes('Footpad'), 'Faction Inspector unionizes memberNpcIds and faction matching');
  assert(facPaneHtml.includes('Highlight on Canvas'), 'Local faction renders Canvas Territory Highlight button');

  // 5. External Faction Isolation
  const extFac = {
    id: 'fac_ext',
    name: 'Red Wizards of Thay',
    status: 'Ascendant',
    _isExternal: true,
    _sourceCampaignId: 'bg1',
    territoryNodeIds: ['10'],
    diplomaticStances: { fac_other: 'Hostile' }
  };
  sb.CrossCampaignService.loadedSources['bg1'] = {
    id: 'bg1',
    name: 'Baldurs Gate',
    factions: [extFac, { id: 'fac_other', name: 'Harpers' }],
    npcs: [],
    items: [],
    quests: [],
    creatures: [],
    trackers: []
  };
  sb.selectEntityItem('ext::bg1::fac_ext');
  const extFacPaneHtml = getMockEl('em-detail-pane').innerHTML;
  assert(!extFacPaneHtml.includes('Highlight on Canvas'), 'External faction omits Canvas Territory Highlight button');
  assert(extFacPaneHtml.includes('Hostile'), 'External faction renders read-only diplomatic stance');

  // 6. Creature Inspector in entity_manager_ui.js
  sb.switchEntityManagerTab('creature');
  sb.selectEntityItem('cr_drake');
  const crPaneHtml = getMockEl('em-detail-pane').innerHTML;
  assert(crPaneHtml.includes('Draco Umbra'), 'Creature Inspector renders scientificOrArchaicName');
  assert(crPaneHtml.includes('Cold') && crPaneHtml.includes('Necrotic'), 'Creature Inspector renders immunities');
  assert(crPaneHtml.includes('Shadow Drake Scales x4'), 'Creature Inspector renders harvest yields');
  assert(crPaneHtml.includes('Wild / Untamable'), 'Creature Inspector renders domestication profile');
  assert(crPaneHtml.includes('Mountain Wyverns'), 'Creature Inspector renders relational links');
  assert(crPaneHtml.includes('regional'), 'Creature Inspector renders roaming scope selector');

  // 7. Node Inspector Subtab 1 (Telemetry & Links)
  sb.switchEntityManagerTab('node');
  sb.selectEntityItem(1);
  const nodePaneHtml = getMockEl('em-detail-pane').innerHTML;
  assert(nodePaneHtml.includes('Danger Rating'), 'Node Inspector renders Danger Rating selector');
  assert(nodePaneHtml.includes('Settlement'), 'Node Inspector renders Node Category selector');
  assert(nodePaneHtml.includes('Humans') && nodePaneHtml.includes('80%'), 'Node Inspector renders Demographics summary');
  assert(nodePaneHtml.includes('Shadow Thieves'), 'Node Inspector renders Controlling Faction link');
  assert(nodePaneHtml.includes('Friendly'), 'Node Inspector renders Party Rapport stance');
  assert(nodePaneHtml.includes('bustling trade town'), 'Node Inspector renders Lore reader');
  assert(nodePaneHtml.includes('Food: Grain') && nodePaneHtml.includes('Defense: Militia'), 'Node Inspector renders Commodity Logistics summary');
}

// ============================================================================
function testSuite59MutationInvariantOwnerAndQuestTrackerSync() {
  console.log('\n--- Suite 59: CampaignMutationEngine Invariant Ownership & Quest/Tracker Sync (Sprint 1) ---');
  const cme = require(path.join(ROOT, 'src/workstation/scripts/campaign_mutation_engine.js'));

  // 1. Pure headless Node upsert of quest with steps[].triggerTrackerId synchronizes tracker triggerRefs
  const headlessState = {
    trackers: [{ id: 'trk_raid', name: 'Raid Clock', maxTicks: 6, currentTicks: 0, triggerRefs: [] }],
    quests: [],
    npcs: [],
    items: [],
    nodes: []
  };

  cme.upsertEntity(headlessState, 'quests', {
    id: 'q_defend',
    title: 'Defend the Wall',
    steps: [
      { id: 'st_1', title: 'Raise shields', triggerTrackerId: 'trk_raid' }
    ]
  });

  assertEqual(headlessState.quests.length, 1, 'Quest upserted into state.quests');
  assertEqual(headlessState.quests[0].trackerIds, ['trk_raid'], 'Quest trackerIds automatically includes triggerTrackerId');
  const raidTrk = headlessState.trackers.find(t => t.id === 'trk_raid');
  assert(Boolean(raidTrk), 'Tracker exists in state');
  assertEqual(raidTrk.triggerRefs, [{ entityType: 'quest', entityId: 'q_defend' }], 'Headless Node upsert of quest links tracker.triggerRefs without DOM/window');

  // 2. Pure headless Node upsert of tracker synchronizes quest.trackerIds
  cme.upsertEntity(headlessState, 'trackers', {
    id: 'trk_siege',
    name: 'Siege Escalation',
    maxTicks: 8,
    triggerRefs: [{ entityType: 'quest', entityId: 'q_defend' }]
  });
  assertEqual(headlessState.quests[0].trackerIds.includes('trk_siege'), true, 'Upserting tracker synchronizes quest.trackerIds');

  // 3. Mod-injected custom fields are never stripped
  cme.upsertEntity(headlessState, 'npcs', {
    id: 'npc_alien',
    name: 'Xenomorph',
    acidBloodLevel: 9000,
    hiveOriginMap: 'submap_caverns'
  });
  const alienNpc = headlessState.npcs.find(n => n.id === 'npc_alien');
  assert(Boolean(alienNpc), 'Alien NPC upserted');
  assertEqual(alienNpc.acidBloodLevel, 9000, 'Custom numeric mod field preserved');
  assertEqual(alienNpc.hiveOriginMap, 'submap_caverns', 'Custom string mod field preserved');

  // 4. Batch revert of mixed entity and corridor operations
  const batchState = {
    nodes: [{ id: 'n1', x: 0, y: 0, adj: [] }, { id: 'n2', x: 100, y: 100, adj: [] }],
    links: [],
    items: []
  };
  const batchRes = cme.applyBatch(batchState, {
    operations: [
      { op: 'upsert_entity', category: 'items', data: { id: 'it_sword', name: 'Iron Sword', nodeId: 'n1' } },
      { op: 'link_entities', source: 'n1', target: 'n2', linkType: 'road' }
    ]
  });
  assert(batchRes.status === 'success', 'Batch applied successfully');
  assert(batchState.items.length === 1, 'Item added by batch');
  const revertRes = cme.revertBatch(batchState, batchRes.batchId, [batchRes]);
  assert(revertRes.status === 'reverted', 'Batch reverted successfully');
  assertEqual(batchState.items.length, 0, 'Reverted item cleaned up');

  // 5. Delete entity on child map scrub matches findEntityReferences
  const multiMapState = {
    npcs: [{ id: 'npc_boss', name: 'Dungeon Boss' }],
    quests: [],
    trackers: [],
    spatialPins: [],
    nodes: [{ id: 'n1', name: 'Entrance' }],
    links: []
  };
  const registry = {
    map_sub: {
      id: 'map_sub',
      nodes: [{ id: 'sub_n1', name: 'Lair', stationedNpcIds: ['npc_boss'] }],
      links: [],
      spatialPins: [{ id: 'pin_boss', targetType: 'npc', targetId: 'npc_boss', links: [{ type: 'npc', id: 'npc_boss' }] }]
    }
  };
  const refs = cme.findEntityReferences(multiMapState, 'npc', 'npc_boss', { maps: registry });
  assert(refs.some(r => r.mapId === 'map_sub' && r.collection === 'nodes'), 'findEntityReferences discovers child map node referrer');
  assert(refs.some(r => r.mapId === 'map_sub' && r.collection === 'spatialpins'), 'findEntityReferences discovers child map pin referrer');

  cme.deleteEntity(multiMapState, 'npc', 'npc_boss', { maps: registry });
  assertEqual(multiMapState.npcs.length, 0, 'NPC deleted from active topology');
  assertEqual(registry.map_sub.nodes[0].stationedNpcIds, [], 'Child map node scrubbed of deleted NPC');
  assertEqual(registry.map_sub.spatialPins[0].links, [], 'Child map pin links scrubbed of deleted NPC');
}
// RUN ASYNC SUITES AND REPORT
// ============================================================================
(async function runAll() {
  try {
    await testZeroCorsZip();
    testSelectiveImporter();
    testPortalCascadeDelete();
    testZeroCorsOffline();
    testCanvasLayersEngine();
    testVectorDrawingShapesEngine();
    testSelectionEngine();
    testSharedPropertyGridAndBatchMutation();
    await testCampaignPackageLoadingAndMapSwitching();
    await testDynamicCampaignManager();
    await testModuleDeletionAndEntityExplorer();
    testAdHocResourceFlowsAndCustomModules();
    testOdvCampaignReflectionAndDenseMatrix();
    testCadHistoryAndUndoRedo();
    testThreatClocksAndHazardRoller();
    testCrossScalePortalLogistics();
    testQuantitativeResourceAccountingAndCorridorBandwidth();
    testNativeMdiOdvMatrixAndFogControls();
    testExtensibleWikiMentionsAndDemographics();
    testWorkstationStabilizationAndEnhancementGate();
    testPatrolFactionAndSettingAgnosticGate();
    await testCampaignIsolationAndSterileSlateGate();
    await testIndexedDbSeparationAndConcurrencyGate();
    await testEntityModulePackEngine();
    await testEdgeExplorerAndConduitCatalog();
    testSociologyReferenceHubAndHermeneutics();
    testFirstClassFactionsEntityEngine();
    testNpcSocialWebAndRelationalGraph();
    testLocationNamesInStationedNodeColumns();
    testTicketCenterEnhancements();
    testMdiWindowResizingAndDockSplitters();
    testCampaignSelectorRichMetadataAndCensus();
    testAutoCadMapLayoutTabsAndGrouping();
    await testBackgroundMapResizingAndTransformPersistence();
    testRelationalTrackersTicketWorkflowsAndSpatialPins();
    testAuthoritativeReferenceClaimsAndGapsRemediation();
    testMultiLinkSpatialPinsShapeGripsContextMenuAndGlobalSearch();
    testTicket01QuestClockSchemaAndConsequences();
    testTicket02CampaignMutationEngine();
    testTicket03CampaignCliAndLoopback();
    await testTicket04TokenGuardAndBatchReplayMerge();
    testTicket05SyncSummaryDigestAndChangelogUi();
    testSuite43NodeCliNativeBiomeAndGuardrails();
    testSuite44RosterAndThreatClockMutationSeam();
    testSuite45CorridorSeamAndKeyCanonicalization();
    testSuite46PointcrawlGraphNodeSeam();
    testSuite47IndustryChainImporterAndDeduplication();
    testSuite48CanonicalSpatialPinNormalizer();
    testSuite49EngineIncludeOrder();
    testSuite50EntityReferenceIntegrity();
    testSuite51ImporterChainSelectionAndConduitMerge();
    await testSuite52ResourcePartitionAndBestiaryPersistence();
    await testSuite53ResourceExplorerUiAndMultiMapAggregation();
    await testSuite54BestiaryExplorerAndFftIntegration();
    await testSuite55CreatureCrudAndCascadeDelete();
    testSuite56QuestExplorerEnrichmentAndCrucible();
    await testSuite57CrossCampaignExplorerAndTransplant();
    testSuite58MultiExplorerEnrichment();
    testSuite59MutationInvariantOwnerAndQuestTrackerSync();
    require('./test_gigerenzer_heuristics.js')({ assert, assertEqual, ROOT });

    const elapsedMs = Date.now() - suiteStartTime;
    console.log('\n================================================================');
    if (failedAssertions === 0) {
      console.log(`     HEADLESS TEST RUNNER SUCCESSFUL: 100% PASS (${passedAssertions}/${totalAssertions} assertions in ${elapsedMs}ms)`);
      console.log('================================================================\n');
      process.exit(0);
    } else {
      console.error(`     HEADLESS TEST RUNNER FAILED (${failedAssertions} failure(s) out of ${totalAssertions} assertions):`);
      failures.forEach((f, i) => console.error(`       ${i + 1}. ${f}`));
      console.log('================================================================\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal unhandled error during test suite execution:', err);
    process.exit(1);
  }
})();
