const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcFile = path.join(rootDir, 'src', 'workstation', 'modals', 'existing_modals.html');
const modalsDir = path.join(rootDir, 'src', 'workstation', 'modals');
const templateFile = path.join(rootDir, 'src', 'workstation', 'template.html');

const originalContent = fs.readFileSync(srcFile, 'utf8');

// Extract all modal IDs from original
const originalIds = [...originalContent.matchAll(/id="(modal-[a-z0-9-]+)"/g)].map(m => m[1]);
console.log(`Original modal IDs (${originalIds.length}):`, originalIds);

// Split by top-level section headers
const sections = originalContent.split(/(?=<!--\s*={10,}\s*\n\s*(?:MODAL|MDI WINDOW))/);
console.log(`Found ${sections.length} sections.`);

// Section 0 is leading whitespace (if any)
// Section 1: MODAL 1: STARTUP WELCOME DIALOG (modal-welcome)
// Section 2: MODAL 2: NEW CAMPAIGN WIZARD (modal-new)
// Section 3: MODAL 3: LOAD PRESET / IMPORT JSON (modal-load, modal-installed-campaigns-list)
// Section 4: MODAL 4: WORKSTATION PREFERENCES (modal-settings)
// Section 5: MDI WINDOW 2: UNIVERSAL CAMPAIGN ENTITY MANAGER (modal-entity-manager)
// Section 6: MDI WINDOW 3: GAMEDEV & CAMPAIGN AUTHOR TICKET COMMAND CENTER (modal-ticket-center, modal-ticket-author-new, modal-ticket-export)
// Section 7: MODAL 6: CREATE / EDIT CUSTOM ENTITY MODAL (modal-entity-edit)
// Section 8: MDI WINDOW 1: COMPREHENSIVE MODULE EXPLORER (modal-module-explorer)
// Section 9: MODAL 10: MAP & LAYOUT PROPERTIES DIALOG (modal-map-properties)
// Section 10: MODAL 11: CREATE NEW SUB-MAP / LAYOUT DIALOG (modal-new-map)
// Section 11: MODAL 12: SET MAP SCALE & UNITS DIALOG (modal-map-scale)
// Section 12: MODAL: ENTITY DELETION & DEPENDENCY CASCADE CONFIRMATION (modal-entity-delete-confirm)

const lifecycleSections = [sections[1], sections[2], sections[3], sections[4], sections[9], sections[10], sections[11]];
const entitySections = [sections[5], sections[7], sections[12]];
const explorerSections = [sections[8]];
const ticketSections = [sections[6]];

const lifecycleContent = lifecycleSections.join('\n').trim() + '\n';
const entityContent = entitySections.join('\n').trim() + '\n';
const explorerContent = explorerSections.join('\n').trim() + '\n';
const ticketContent = ticketSections.join('\n').trim() + '\n';

const fileMap = {
  'lifecycle_modals.html': lifecycleContent,
  'entity_modals.html': entityContent,
  'explorer_modals.html': explorerContent,
  'ticket_modals.html': ticketContent
};

// Write out the 4 partials
for (const [filename, content] of Object.entries(fileMap)) {
  const filePath = path.join(modalsDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote ${filename} (${content.split('\n').length} lines)`);
}

// Check combined modal IDs
const combinedContent = Object.values(fileMap).join('\n');
const combinedIds = [...combinedContent.matchAll(/id="(modal-[a-z0-9-]+)"/g)].map(m => m[1]);

console.log(`Combined modal IDs (${combinedIds.length}):`, combinedIds);

const missing = originalIds.filter(id => !combinedIds.includes(id));
const extra = combinedIds.filter(id => !originalIds.includes(id));

if (missing.length > 0 || extra.length > 0) {
  console.error('Integrity error: modal IDs do not match!', { missing, extra });
  process.exit(1);
}

console.log('[SUCCESS] All modal IDs 100% accounted for with zero loss!');

// Update template.html
let template = fs.readFileSync(templateFile, 'utf8');
const oldInclude = '<!-- @@INCLUDE: modals/existing_modals.html @@ -->';
const newIncludes = [
  '<!-- @@INCLUDE: modals/lifecycle_modals.html @@ -->',
  '  <!-- @@INCLUDE: modals/entity_modals.html @@ -->',
  '  <!-- @@INCLUDE: modals/explorer_modals.html @@ -->',
  '  <!-- @@INCLUDE: modals/ticket_modals.html @@ -->'
].join('\n');

if (template.includes(oldInclude)) {
  template = template.replace(oldInclude, newIncludes);
  fs.writeFileSync(templateFile, template, 'utf8');
  console.log('[SUCCESS] Updated src/workstation/template.html with decomposed modal includes.');
} else {
  console.log('[INFO] template.html already updated or old include not found.');
}

// Remove original existing_modals.html now that it has been decomposed
if (fs.existsSync(srcFile)) {
  fs.unlinkSync(srcFile);
  console.log('[SUCCESS] Removed decomposed source file: existing_modals.html');
}
