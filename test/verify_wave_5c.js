const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('========================================================');
console.log('       WAVE 5C VERIFICATION: WORKSTATION CORE SPLIT     ');
console.log('========================================================\n');

let pass = true;

// 1. Verify modular files exist
const targetModules = [
  'src/workstation/scripts/workstation_state.js',
  'src/workstation/scripts/cad_canvas_renderer.js',
  'src/workstation/scripts/cad_interaction.js',
  'src/workstation/scripts/property_grid_inspector.js'
];

targetModules.forEach(modPath => {
  if (fs.existsSync(modPath)) {
    const lines = fs.readFileSync(modPath, 'utf8').split(/\r?\n/).length;
    console.log(`[PASS] Modular file exists: ${modPath} (${lines} lines)`);
  } else {
    console.error(`[FAIL] Missing expected modular file: ${modPath}`);
    pass = false;
  }
});

// 2. Verify monolithic workstation_core.js is retired
const oldFile = 'src/workstation/scripts/workstation_core.js';
if (!fs.existsSync(oldFile)) {
  console.log(`[PASS] Monolithic file successfully retired: ${oldFile}`);
} else {
  console.error(`[FAIL] Monolithic file still present: ${oldFile}`);
  pass = false;
}

// 3. Verify VM script compilation for each module
targetModules.forEach(modPath => {
  if (!fs.existsSync(modPath)) return;
  const code = fs.readFileSync(modPath, 'utf8');
  try {
    new vm.Script(code, { filename: path.basename(modPath) });
    console.log(`[PASS] vm.Script compilation syntax OK: ${path.basename(modPath)}`);
  } catch (e) {
    console.error(`[FAIL] Syntax error in ${modPath}:`, e.message);
    pass = false;
  }
});

// 4. Verify compiled start.html contains all 4 modules and critical function symbols
const startHtmlPath = 'start.html';
if (!fs.existsSync(startHtmlPath)) {
  console.error('[FAIL] start.html not found!');
  process.exit(1);
}

const startContent = fs.readFileSync(startHtmlPath, 'utf8');
const criticalSymbols = [
  // workstation_state.js
  'Workstation',
  'CreatorStudio',
  'MODULE_ENTITY_PROTOTYPES',
  'initTopology',
  'ensureEntityCollections',
  'flushProjectDirectorySync',
  'saveActiveCampaign',
  'setStatusBarMessage',
  'updateStatusBar',
  'initMenuBar',
  'toggleMenu',
  'closeAllMenus',
  'toggleToolPalette',
  'stepWave',
  'resetBalancing',
  'openMapNavigatorModal',
  'openSourcebooksModal',
  'openCampaignExportModal',
  'switchExportTab',
  'updateExportOutput',
  'downloadExportFile',

  // cad_canvas_renderer.js
  'computeStarPoints',
  'computePolygonPoints',
  'renderGrid',
  'AUTOCAD_COLORS',
  'toggleGmVision',
  'lockAllNodes',
  'getItemEffectiveNodeId',
  'getRecursiveNodeEntities',
  'scheduleRenderCanvas',
  'renderCanvas',
  'toggleGrid',
  'toggleInfluenceVectors',

  // cad_interaction.js
  'setTool',
  'getToolKey',
  'onClockCalloutMouseDown',
  'onNodeMouseDown',
  'onCanvasMouseDown',
  'onCanvasMouseMove',
  'onCanvasMouseUp',
  'applyCanvasTransform',
  'addNodeAt',
  'deleteNode',
  'createEdge',
  'deleteEdge',
  'promptMoveNode',
  'zoomIn',
  'zoomOut',
  'zoomAt',
  'resetZoom',
  'initCanvasInteractions',

  // property_grid_inspector.js
  'selectNode',
  'selectEdge',
  'selectGlobal',
  'updateObjectSelector',
  'onObjectSelectorChange',
  'updatePropertiesGrid',
  'appendCategoryRow',
  'appendPropRow',
  'appendSelectPropRow',
  'appendActionPropRow',
  'appendButtonPropRow',
  'appendTextareaPropRow',
  'appendBacklinksPropRow',
  'togglePropertiesDock'
];

let foundSymbols = 0;
criticalSymbols.forEach(sym => {
  if (startContent.includes(sym)) {
    foundSymbols++;
  } else {
    console.error(`[FAIL] Expected symbol not found in start.html: ${sym}`);
    pass = false;
  }
});
console.log(`[PASS] Critical symbols verified in start.html: ${foundSymbols}/${criticalSymbols.length}`);

// 5. Zero-CORS offline validation
if (startContent.includes('http://') || startContent.includes('https://') || startContent.includes('//cdn') || startContent.includes('//unpkg')) {
  // Check if any match is an actual external script/stylesheet tag
  const externalTagRegex = /<(?:script|link)[^>]+(?:src|href)=["'](https?:|\/\/)[^"']+["']/i;
  if (externalTagRegex.test(startContent)) {
    console.error('[FAIL] External network dependency found in start.html');
    pass = false;
  } else {
    console.log('[PASS] Zero external script/link tags in start.html');
  }
} else {
  console.log('[PASS] Zero external network URLs in start.html');
}

// 6. Test sandbox initialization
const sandbox = {
  window: {},
  addEventListener: () => {},
  document: {
    getElementById: (id) => ({
      style: {},
      dataset: {},
      addEventListener: () => {},
      appendChild: () => {},
      textContent: '',
      value: ''
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, dataset: {}, appendChild: () => {}, addEventListener: () => {} }),
    body: { appendChild: () => {}, removeChild: () => {} }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Math: Math,
  JSON: JSON,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  RegExp: RegExp,
  URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
  Blob: function() {}
};
sandbox.window = sandbox;

try {
  // Execute the 4 modules in order in sandbox
  targetModules.forEach(modPath => {
    const code = fs.readFileSync(modPath, 'utf8');
    vm.runInNewContext(code, sandbox, { filename: path.basename(modPath) });
  });
  console.log('[PASS] Sandbox execution of all 4 modules completed without error.');
  
  // Verify window exports in sandbox
  const requiredWindowProps = [
    'Workstation', 'CreatorStudio', 'AUTOCAD_COLORS', 'initTopology',
    'renderCanvas', 'setTool', 'selectNode', 'updatePropertiesGrid'
  ];
  let windowPass = true;
  requiredWindowProps.forEach(prop => {
    if (typeof sandbox.window[prop] === 'undefined') {
      console.error(`[FAIL] Expected window.${prop} not defined in sandbox.`);
      windowPass = false;
    }
  });
  if (windowPass) {
    console.log('[PASS] All required window properties defined in sandbox.');
  } else {
    pass = false;
  }
} catch (e) {
  console.error('[FAIL] Sandbox execution error:', e.message);
  pass = false;
}

console.log('\n========================================================');
if (pass) {
  console.log('   ALL WAVE 5C VERIFICATION CHECKS PASSED SUCCESSFULLY  ');
  console.log('========================================================');
  process.exit(0);
} else {
  console.error('   WAVE 5C VERIFICATION FAILED                         ');
  console.log('========================================================');
  process.exit(1);
}
