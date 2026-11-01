const fs = require('fs');
const path = require('path');

const startHtml = fs.readFileSync(path.join(__dirname, '..', 'start.html'), 'utf8');

const expectedModalIds = [
  'modal-welcome',
  'modal-new',
  'modal-load',
  'modal-installed-campaigns-list',
  'modal-settings',
  'modal-entity-manager',
  'modal-ticket-center',
  'modal-ticket-author-new',
  'modal-ticket-export',
  'modal-entity-edit',
  'modal-module-explorer',
  'modal-map-properties',
  'modal-new-map',
  'modal-map-scale',
  'modal-entity-delete-confirm'
];

const startModalIds = [...startHtml.matchAll(/id="(modal-[a-z0-9-]+)"/g)].map(m => m[1]);

console.log('--- Verification Gate 5A ---');
console.log(`Found ${startModalIds.length} modal element references in start.html.`);

let allPresent = true;
for (const id of expectedModalIds) {
  if (!startModalIds.includes(id)) {
    console.error(`[FAIL] Missing modal ID: ${id}`);
    allPresent = false;
  }
}

if (allPresent) {
  console.log('[PASS] All 15 expected modal IDs verified present in start.html!');
} else {
  process.exit(1);
}

// Check JavaScript syntax of embedded scripts in start.html
const scriptMatches = [...startHtml.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log(`Found ${scriptMatches.length} inline script block(s) in start.html.`);

const vm = require('vm');
scriptMatches.forEach((match, idx) => {
  try {
    new vm.Script(match[1]);
    console.log(`[PASS] Script block ${idx + 1} syntax is valid.`);
  } catch (err) {
    console.error(`[FAIL] Syntax error in script block ${idx + 1}:`, err.message);
    process.exit(1);
  }
});

console.log('[PASS] Verification Gate 5A completely passed!');
