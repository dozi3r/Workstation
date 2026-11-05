---
file_path: "src/workstation/scripts/entity_cascade_delete.js"
title: "entity_cascade_delete.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "7e751c17f086a3f8"
reviewed_hash: "7e751c17f086a3f8"
stale: false
size_bytes: 59984
line_count: 1277
---

# entity_cascade_delete.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_cascade_delete.js` provides relational dependency tracing, interactive cascade deletion dialogs, and pre-deletion offline backup zip archiving within Creator Studio (`start.html`).

### Key Capabilities
- **Relational Dependency Tracing**: Performs comprehensive dependency graph traversal (`analyzeEntityDependencies`) whenever an entity or node is selected for deletion, discovering co-stationed NPCs, linked quests, held items, threat clocks, module bindings, and attached portal sub-maps (`childMapId` / `parentNodeId`).
- **Interactive Cascade Deletion Modal**: Prompts the author with a detailed dependency impact dialog (`promptEntityDelete`), offering granular checkboxes to selectively delete linked entities or keep them unlinked/orphaned.
- **Zero-CORS Backup Archiving**: Bundles a standalone zip backup (`saveDeletedBackupZip`) of the pre-deletion campaign state using `ZeroCorsZip`, safely prefixing all exported archive artifacts with `_deleted_` before destructive operations.
- **Cascaded Clean Deletion Engine & Disk File Removal**: Executes the atomic removal of chosen entities from the active topology (`executeEntityDeletion`), unlinking or cascade-deleting portal sub-maps, persisting deleted module IDs to `cs_deleted_modules` (`localStorage`), recursively removing nested module `.md` files and updating `modules_manifest.json` on disk (`deleteModuleFilesFromBoundProjectDirectory`), purging deleted modules from `ALL_MODULES`, `MODULES_MANIFEST`, and `custom_modules`, updating properties grids, and refreshing active views. Relationship tables are sanitized by the engine (see Engine Delegation below).

### Delete Preview Reads The Engine's Reference Table (SYS-ARCH-01)
`analyzeEntityDependencies` takes its id-based referrers from `CampaignMutationEngine.findEntityReferences`, the read-only twin of the scrub, so the preview lists exactly the records the delete unlinks. Every dependency carries a `kind`:
- `reference`: holds the target id in a field the scrub unlinks (from the engine's descriptor table).
- `related`: a link the scrub leaves alone (forward link, shared node, shared quest, module origin, station node).
- `mention`: matched by name (quest narrative, NPC/quest `threat` text, faction name) or by a legacy field (`quest.trackerId`, prototype ids). Never unlinked. `promptEntityDelete` shows these in their own "Mentions by name (not unlinked)" group and the banner counts them.
- `map` and `module`: the sub-map/portal and source-module sections, unchanged.
The result also carries `mentionCount` and the raw `references` list.

### Engine Delegation (SYS-ARCH-01)
`executeEntityDeletion` calls `CampaignMutationEngine.deleteEntity` for every `npc`, `quest`, `item`, `tracker`, `faction` and `node` target and passes the global `maps` registry as `batchContext.maps`. The engine is the only scrub for those types: it removes the entity from its collection and unlinks it from quests, items, NPCs, factions, trackers (`triggerRefs`, consequences), tickets (with the audit note), spatial pins and node records, on the active topology and every registered map. This file no longer filters the five entity collections or unlinks entity references, and it logs an error if the engine is missing.

What stays here, because the engine is never called for `module` or `map` targets or because it is UI work:
- `deletedPrototypes` / `deletedModules` bookkeeping and the `nodeChildMapSnapshot` taken before the engine removes the node.
- Sub-map deletion, re-parenting of child maps, `deletePersistedMapFromDB`, active-map fallback.
- Node removal bookkeeping after the engine (`topo.nodes` entry, `adj`/`infBy`, corridor and edge-data keys, mirror arrays).
- Module deletion, including the `dedicatedFlows` purge, `ALL_MODULES`/`MODULES_MANIFEST`/`nodeSlottedModules` purges and `localStorage`.
- Ticket retargeting with the audit note for `map` and `module` targets only.
- Pin link scrubbing for `map`/`submap` link types only.
- Persist and refresh of the UI.
<!-- END_CUSTOM_NOTES -->
