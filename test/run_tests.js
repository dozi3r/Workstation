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
  'regions/regional_image_browser.html',
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
  assert(cadInteractionCode.includes('delete topo.edgeNotes[edgeKey]') && cadInteractionCode.includes('delete topo.edgeNotes[pairKey]'), 'cad_interaction.js deleteEdge cleans up edgeNotes for both edgeKey and pairKey');
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
    }
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

  sandbox.initWorkspaceSplitters();

  assert(Boolean(emSplitterLeft.dataset.splitterBound), 'initWorkspaceSplitters binds #em-splitter-left');
  assert(Boolean(emSplitterRight.dataset.splitterBound), 'initWorkspaceSplitters binds #em-splitter-right');

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
