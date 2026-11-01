---
file_path: "src/workstation/scripts/selective_importer.js"
title: "selective_importer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "dc74aed83108c51b"
reviewed_hash: "dc74aed83108c51b"
stale: false
size_bytes: 42064
line_count: 882
---

# selective_importer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/selective_importer.js` ingests external campaign folders, `.zip` archives, and `.creator.json` packages (`triggerSelectiveImportFolder`, `triggerSelectiveImportFile`, `onSelectiveImportFileSelected`, `executeSelectiveImport`), extracting multi-scale maps, `assets/<mapId>_bg.*` background images, entities, `custom_modules`, `deletedModules`, and `edgeData` with interactive entity conflict detection and resolution (`detectEntityConflicts`, `mergeEntitiesWithResolutions`).
<!-- END_CUSTOM_NOTES -->
