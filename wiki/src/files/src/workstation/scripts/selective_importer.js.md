---
file_path: "src/workstation/scripts/selective_importer.js"
title: "selective_importer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "8ae7cc5271d73d56"
reviewed_hash: "8ae7cc5271d73d56"
stale: false
size_bytes: 56129
line_count: 1117
---

# selective_importer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/selective_importer.js` ingests external campaign folders, `.zip` archives, `.creator.json` packages, and `.csmod` entity module packs (`triggerSelectiveImportFolder`, `triggerSelectiveImportFile`, `onSelectiveImportFileSelected`, `executeSelectiveImport`), routing `.csmod` archives directly to `window.packEngine.openInstallerDialog(file)` while extracting multi-scale maps, `assets/<mapId>_bg.*` background images, entities, `custom_modules`, `deletedModules`, and `edgeData` with interactive entity conflict detection and resolution (`detectEntityConflicts`, `mergeEntitiesWithResolutions`).
- ODV (SYS-ODV-02 S1): importer uses local set-or-delete ODV normalizer, tags odvSource=imported, moves scalar NPC disposition to dispositionToParty.
<!-- END_CUSTOM_NOTES -->
