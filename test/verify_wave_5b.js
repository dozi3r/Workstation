/**
 * test/verify_wave_5b.js
 * Verification Gate for Wave 5B: Scripted entity_manager.js Decomposition
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.join(__dirname, '..');
const scriptsDir = path.join(rootDir, 'src', 'workstation', 'scripts');

console.log('=== WAVE 5B VERIFICATION SUITE ===');

// 1. Verify existence of 4 modular files
const expectedModules = [
  'entity_core.js',
  'entity_manager_ui.js',
  'entity_crud_dialogs.js',
  'entity_cascade_delete.js'
];

expectedModules.forEach(mod => {
  const filePath = path.join(scriptsDir, mod);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing modular script: ${mod}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    new vm.Script(content);
    console.log(`PASS: ${mod} exists and has valid JS syntax (${content.split('\n').length} lines)`);
  } catch (err) {
    console.error(`FAIL: Syntax error in ${mod}: ${err.message}`);
    process.exit(1);
  }
});

// 2. Verify deletion of original entity_manager.js
const oldFile = path.join(scriptsDir, 'entity_manager.js');
if (fs.existsSync(oldFile)) {
  console.error('FAIL: Monolithic entity_manager.js still exists!');
  process.exit(1);
} else {
  console.log('PASS: Monolithic entity_manager.js successfully retired.');
}

// 3. Verify template.html includes
const templatePath = path.join(rootDir, 'src', 'workstation', 'template.html');
const templateContent = fs.readFileSync(templatePath, 'utf8');
expectedModules.forEach(mod => {
  const includeStr = `// @@INCLUDE: scripts/${mod} @@`;
  if (!templateContent.includes(includeStr)) {
    console.error(`FAIL: template.html missing include: ${includeStr}`);
    process.exit(1);
  }
});
console.log('PASS: template.html includes all 4 modular scripts.');

// 4. Verify compiled start.html
const startHtmlPath = path.join(rootDir, 'start.html');
if (fs.existsSync(startHtmlPath)) {
  const startHtml = fs.readFileSync(startHtmlPath, 'utf8');
  
  // Extract main script
  const scriptMatches = startHtml.match(/<script>([\s\S]*?)<\/script>/g);
  if (!scriptMatches || scriptMatches.length === 0) {
    console.error('FAIL: No <script> block found in start.html');
    process.exit(1);
  }
  
  // Find workstation script (contains openEntityManager)
  const workstationScript = scriptMatches.find(s => s.includes('openEntityManager'));
  if (!workstationScript) {
    console.error('FAIL: Main workstation script block not found in start.html');
    process.exit(1);
  }
  
  const cleanScript = workstationScript.replace(/<\/?script>/g, '');
  try {
    new vm.Script(cleanScript);
    console.log('PASS: Compiled workstation script in start.html has 100% valid JS syntax.');
  } catch (err) {
    console.error(`FAIL: Syntax error in compiled start.html script: ${err.message}`);
    process.exit(1);
  }

  // Verify critical function definitions in compiled start.html
  const criticalFns = [
    'getItemEffectiveNodeId',
    'computeNpcNodeDissonance',
    'getPrototypesForType',
    'getActiveEntityList',
    'advanceTrackerTick',
    'openEntityManager',
    'switchEntityManagerTab',
    'renderEntityManagerTree',
    'renderEntityManagerList',
    'selectEntityItem',
    'getQuestSpanningNodes',
    'openNewEntityModal',
    'openEditEntityModal',
    'saveCustomEntity',
    'getEntityIcon',
    'analyzeEntityDependencies',
    'promptEntityDelete',
    'saveDeletedBackupZip',
    'executeEntityDeletion',
    'navigateToEntity'
  ];

  criticalFns.forEach(fn => {
    if (!cleanScript.includes(`function ${fn}`)) {
      console.error(`FAIL: Missing function declaration in start.html: ${fn}`);
      process.exit(1);
    }
  });
  console.log(`PASS: All ${criticalFns.length} critical entity management functions verified in start.html.`);
} else {
  console.log('NOTE: start.html not yet recompiled; will verify after Build-Suite.ps1.');
}

console.log('=== WAVE 5B VERIFICATION PASSED ===');
