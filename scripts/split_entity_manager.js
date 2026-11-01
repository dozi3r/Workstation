/**
 * scripts/split_entity_manager.js
 * Deterministically splits src/workstation/scripts/entity_manager.js (3,198 lines)
 * into 4 modular sub-files:
 *  1. entity_core.js           (~500 lines: State, Dissonance, Prototypes, Trackers, Node-Stationing)
 *  2. entity_manager_ui.js     (~1,365 lines: Tree, List Table, and Entity Inspector)
 *  3. entity_crud_dialogs.js   (~550 lines: Create/Edit modals, Quest Spanning Preview)
 *  4. entity_cascade_delete.js (~800 lines: Dependency Tracing, Backup Zip, Cascade Deletion)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcPath = path.join(__dirname, '..', 'src', 'workstation', 'scripts', 'entity_manager.js');
const scriptsDir = path.join(__dirname, '..', 'src', 'workstation', 'scripts');

if (!fs.existsSync(srcPath)) {
  console.error(`Source file not found: ${srcPath}`);
  process.exit(1);
}

const lines = fs.readFileSync(srcPath, 'utf8').split('\n');
console.log(`Read ${lines.length} lines from ${srcPath}`);

// 1. entity_core.js
const p1Lines = [
  '    // ========================================================================',
  '    // UNIVERSAL CAMPAIGN ENTITY MANAGER - CORE (STATE, DISSONANCE & PROTOTYPES)',
  '    // ========================================================================',
  ...lines.slice(3, 192),    // state vars (CurrentEntityTab, etc.) & getItemEffectiveNodeId .. removeNpcRelationship
  '',
  '    // --- Entity Collection & Prototype Seeding ---',
  ...lines.slice(256, 334),  // getPrototypesForType
  '',
  ...lines.slice(448, 467),  // getActiveEntityList
  '',
  '    // --- Tracker Clocks & Stationing Helpers ---',
  ...lines.slice(1636, 1838) // advanceTrackerTick .. removeEntityFromCampaign
];
const p1Content = p1Lines.join('\n');

// 2. entity_manager_ui.js
const p2Lines = [
  '    // ========================================================================',
  '    // UNIVERSAL CAMPAIGN ENTITY MANAGER - UI (TREE, LIST & INSPECTOR PANELS)',
  '    // ========================================================================',
  ...lines.slice(192, 256),  // openEntityManager, switchEntityManagerTab, updateEntityTabButtons
  '',
  '    // --- Entity Hierarchy Tree ---',
  ...lines.slice(334, 448),  // renderEntityManagerTree, addTreeItem
  '',
  '    // --- Entity Catalog List Table ---',
  ...lines.slice(467, 734),  // renderEntityManagerList, renderMiniClockGauge
  '',
  '    // --- Entity Detail & Property Inspector ---',
  ...lines.slice(734, 1636), // selectEntityItem
  '',
  '    // --- Navigation & Cross-Linking ---',
  ...lines.slice(3185, 3198) // navigateToEntity
];
const p2Content = p2Lines.join('\n');

// 3. entity_crud_dialogs.js
const p3Lines = [
  '    // ========================================================================',
  '    // UNIVERSAL CAMPAIGN ENTITY MANAGER - CRUD DIALOGS & QUEST SPANNING',
  '    // ========================================================================',
  ...lines.slice(2637, 3185) // getQuestSpanningNodes comment .. saveCustomEntity
];
const p3Content = p3Lines.join('\n');

// 4. entity_cascade_delete.js
const p4Lines = [
  '    // ========================================================================',
  '    // UNIVERSAL CAMPAIGN ENTITY MANAGER - CASCADE DELETION & BACKUP SUBSYSTEM',
  '    // ========================================================================',
  ...lines.slice(1842, 2637) // getEntityIcon .. executeEntityDeletion (skipping original duplicate header)
];
const p4Content = p4Lines.join('\n');

const targets = [
  { name: 'entity_core.js', content: p1Content, lines: p1Lines.length },
  { name: 'entity_manager_ui.js', content: p2Content, lines: p2Lines.length },
  { name: 'entity_crud_dialogs.js', content: p3Content, lines: p3Lines.length },
  { name: 'entity_cascade_delete.js', content: p4Content, lines: p4Lines.length }
];

// Syntax Validation on each module
targets.forEach(t => {
  try {
    new vm.Script(t.content);
    console.log(`[SYNTAX OK] ${t.name} (${t.lines} lines)`);
  } catch (err) {
    console.error(`[SYNTAX ERROR] in ${t.name}: ${err.message}`);
    process.exit(1);
  }
});

// Write files to disk
targets.forEach(t => {
  const dest = path.join(scriptsDir, t.name);
  fs.writeFileSync(dest, t.content, 'utf8');
  console.log(`[WROTE] ${dest} (${t.lines} lines, ${t.content.length} bytes)`);
});

console.log('Successfully sliced entity_manager.js into 4 modular files.');
