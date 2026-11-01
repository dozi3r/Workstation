const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcPath = 'src/workstation/scripts/workstation_core.js';
if (!fs.existsSync(srcPath)) {
  console.error('Source file workstation_core.js not found!');
  process.exit(1);
}

const content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split(/\r?\n/);
console.log('Original total lines:', lines.length);

function getSlice(start1Based, end1Based) {
  return lines.slice(start1Based - 1, end1Based).join('\n');
}

// 1. workstation_state.js
const workstation_state_code = [
  '// Workstation State & Lifecycle Management',
  getSlice(1, 594),
  getSlice(3111, 3127),
  getSlice(3128, 3428),
  '',
  '// Exported globals',
  'window.Workstation = Workstation;',
  'window.CreatorStudio = CreatorStudio;',
  'window.MODULE_ENTITY_PROTOTYPES = MODULE_ENTITY_PROTOTYPES;',
  'window.initTopology = initTopology;',
  'window.ensureEntityCollections = ensureEntityCollections;',
  'window.flushProjectDirectorySync = flushProjectDirectorySync;',
  'window.saveActiveCampaign = saveActiveCampaign;',
  'window.setStatusBarMessage = setStatusBarMessage;',
  'window.updateStatusBar = updateStatusBar;',
  'window.initMenuBar = initMenuBar;',
  'window.toggleMenu = toggleMenu;',
  'window.closeAllMenus = closeAllMenus;',
  'window.toggleToolPalette = toggleToolPalette;',
  'window.stepWave = stepWave;',
  'window.resetBalancing = resetBalancing;',
  'window.openMapNavigatorModal = openMapNavigatorModal;',
  'window.renderMapNavigatorTree = renderMapNavigatorTree;',
  'window.openSourcebooksModal = openSourcebooksModal;',
  'window.renderSourcebooksList = renderSourcebooksList;',
  'window.enableAllSourcebooks = enableAllSourcebooks;',
  'window.disableInactiveSourcebooks = disableInactiveSourcebooks;',
  'window.openCampaignExportModal = openCampaignExportModal;',
  'window.switchExportTab = switchExportTab;',
  'window.updateExportOutput = updateExportOutput;',
  'window.copyExportToClipboard = copyExportToClipboard;',
  'window.downloadExportFile = downloadExportFile;'
].join('\n');

// 2. cad_canvas_renderer.js
const cad_canvas_renderer_code = [
  '// CAD Canvas Renderer & Visual Geometry Engine',
  getSlice(615, 689),
  getSlice(691, 889),
  getSlice(891, 1511),
  getSlice(3094, 3104),
  '',
  '// Exported globals',
  'window.computeStarPoints = computeStarPoints;',
  'window.computePolygonPoints = computePolygonPoints;',
  'window.renderGrid = renderGrid;',
  'window.AUTOCAD_COLORS = AUTOCAD_COLORS;',
  'window.toggleGmVision = toggleGmVision;',
  'window.lockAllNodes = lockAllNodes;',
  'window.getItemEffectiveNodeId = getItemEffectiveNodeId;',
  'window.getRecursiveNodeEntities = getRecursiveNodeEntities;',
  'window.scheduleRenderCanvas = scheduleRenderCanvas;',
  'window.renderCanvas = renderCanvas;',
  'window.toggleGrid = toggleGrid;',
  'window.toggleInfluenceVectors = toggleInfluenceVectors;'
].join('\n');

// 3. cad_interaction.js
const cad_interaction_code = [
  '// CAD Canvas Interaction & Tool Gestures',
  getSlice(595, 614),
  getSlice(1513, 1779),
  getSlice(1781, 1963),
  getSlice(3021, 3092),
  '',
  '// Exported globals',
  'window.setTool = setTool;',
  'window.getToolKey = getToolKey;',
  'window.onClockCalloutMouseDown = onClockCalloutMouseDown;',
  'window.onNodeMouseDown = onNodeMouseDown;',
  'window.onCanvasMouseDown = onCanvasMouseDown;',
  'window.onCanvasMouseMove = onCanvasMouseMove;',
  'window.onCanvasMouseUp = onCanvasMouseUp;',
  'window.applyCanvasTransform = applyCanvasTransform;',
  'window.addNodeAt = addNodeAt;',
  'window.deleteNode = deleteNode;',
  'window.createEdge = createEdge;',
  'window.deleteEdge = deleteEdge;',
  'window.promptMoveNode = promptMoveNode;',
  'window.zoomIn = zoomIn;',
  'window.zoomOut = zoomOut;',
  'window.zoomAt = zoomAt;',
  'window.resetZoom = resetZoom;',
  'window.initCanvasInteractions = initCanvasInteractions;'
].join('\n');

// 4. property_grid_inspector.js
const property_grid_inspector_code = [
  '// Visual Basic 6 Property Grid & Entity Inspector',
  getSlice(1965, 2109),
  getSlice(2111, 3019),
  getSlice(3106, 3109),
  '',
  '// Exported globals',
  'window.selectNode = selectNode;',
  'window.selectEdge = selectEdge;',
  'window.selectGlobal = selectGlobal;',
  'window.updateObjectSelector = updateObjectSelector;',
  'window.onObjectSelectorChange = onObjectSelectorChange;',
  'window.updatePropertiesGrid = updatePropertiesGrid;',
  'window.appendCategoryRow = appendCategoryRow;',
  'window.appendPropRow = appendPropRow;',
  'window.appendSelectPropRow = appendSelectPropRow;',
  'window.appendActionPropRow = appendActionPropRow;',
  'window.appendButtonPropRow = appendButtonPropRow;',
  'window.appendTextareaPropRow = appendTextareaPropRow;',
  'window.appendBacklinksPropRow = appendBacklinksPropRow;',
  'window.togglePropertiesDock = togglePropertiesDock;'
].join('\n');

const targetDir = 'src/workstation/scripts';
const outputs = [
  { file: 'workstation_state.js', code: workstation_state_code },
  { file: 'cad_canvas_renderer.js', code: cad_canvas_renderer_code },
  { file: 'cad_interaction.js', code: cad_interaction_code },
  { file: 'property_grid_inspector.js', code: property_grid_inspector_code }
];

// Verify syntax before writing
outputs.forEach(out => {
  new vm.Script(out.code, { filename: out.file });
  console.log(`Validated syntax for ${out.file}`);
});

// Write each modular file
outputs.forEach(out => {
  const destPath = path.join(targetDir, out.file);
  fs.writeFileSync(destPath, out.code, 'utf8');
  console.log(`Wrote: ${destPath} (${out.code.split('\n').length} lines)`);
});

// Delete old monolithic workstation_core.js
fs.unlinkSync(srcPath);
console.log(`Deleted monolithic file: ${srcPath}`);
console.log('Split completed successfully.');
