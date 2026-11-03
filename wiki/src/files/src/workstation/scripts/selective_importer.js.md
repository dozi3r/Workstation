---
file_path: "src/workstation/scripts/selective_importer.js"
title: "selective_importer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "1b47b2f9efe62778"
reviewed_hash: "1b47b2f9efe62778"
stale: false
size_bytes: 52279
line_count: 1087
---

# selective_importer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/selective_importer.js` ingests external campaign folders, `.zip` archives, `.creator.json` packages, and `.csmod` entity module packs (`triggerSelectiveImportFolder`, `triggerSelectiveImportFile`, `onSelectiveImportFileSelected`, `executeSelectiveImport`), routing `.csmod` archives directly to `window.packEngine.openInstallerDialog(file)` while extracting multi-scale maps, `assets/<mapId>_bg.*` background images, entities, `custom_modules`, `deletedModules`, and `edgeData` with interactive entity conflict detection and resolution (`detectEntityConflicts`, `mergeEntitiesWithResolutions`).
<!-- END_CUSTOM_NOTES -->
