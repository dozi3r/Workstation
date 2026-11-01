---
file_path: "src/workstation/scripts/entity_cascade_delete.js"
title: "entity_cascade_delete.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "f346ec793daf4286"
reviewed_hash: "f346ec793daf4286"
stale: false
size_bytes: 49822
line_count: 1128
---

# entity_cascade_delete.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_cascade_delete.js` provides relational dependency tracing, interactive cascade deletion dialogs, and pre-deletion offline backup zip archiving within Creator Studio (`start.html`).

### Key Capabilities
- **Relational Dependency Tracing**: Performs comprehensive dependency graph traversal (`analyzeEntityDependencies`) whenever an entity or node is selected for deletion, discovering co-stationed NPCs, linked quests, held items, threat clocks, module bindings, and attached portal sub-maps (`childMapId` / `parentNodeId`).
- **Interactive Cascade Deletion Modal**: Prompts the author with a detailed dependency impact dialog (`promptEntityDelete`), offering granular checkboxes to selectively delete linked entities or keep them unlinked/orphaned.
- **Zero-CORS Backup Archiving**: Bundles a standalone zip backup (`saveDeletedBackupZip`) of the pre-deletion campaign state using `ZeroCorsZip`, safely prefixing all exported archive artifacts with `_deleted_` before destructive operations.
- **Cascaded Clean Deletion Engine & Disk File Removal**: Executes the atomic removal of chosen entities from the active topology (`executeEntityDeletion`), unlinking or cascade-deleting portal sub-maps, persisting deleted module IDs to `cs_deleted_modules` (`localStorage`), recursively removing nested module `.md` files and updating `modules_manifest.json` on disk (`deleteModuleFilesFromBoundProjectDirectory`), purging deleted modules from `ALL_MODULES`, `MODULES_MANIFEST`, and `custom_modules`, sanitizing relationship tables, updating properties grids, and refreshing active views.
<!-- END_CUSTOM_NOTES -->
