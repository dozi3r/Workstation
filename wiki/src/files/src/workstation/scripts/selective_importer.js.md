---
file_path: "src/workstation/scripts/selective_importer.js"
title: "selective_importer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "609ec3f60b9d1460"
reviewed_hash: "609ec3f60b9d1460"
stale: false
size_bytes: 43304
line_count: 899
---

# selective_importer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/selective_importer.js` ingests external campaign folders, `.zip` archives, `.creator.json` packages, and `.csmod` entity module packs (`triggerSelectiveImportFolder`, `triggerSelectiveImportFile`, `onSelectiveImportFileSelected`, `executeSelectiveImport`), routing `.csmod` archives directly to `window.packEngine.openInstallerDialog(file)` while extracting multi-scale maps, `assets/<mapId>_bg.*` background images, entities, `custom_modules`, `deletedModules`, and `edgeData` with interactive entity conflict detection and resolution (`detectEntityConflicts`, `mergeEntitiesWithResolutions`).
<!-- END_CUSTOM_NOTES -->
