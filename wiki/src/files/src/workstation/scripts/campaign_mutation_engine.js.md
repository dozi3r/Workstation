---
file_path: "src/workstation/scripts/campaign_mutation_engine.js"
title: "campaign_mutation_engine.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "67a7f7bb1322ec8f"
reviewed_hash: "67a7f7bb1322ec8f"
stale: false
size_bytes: 120031
line_count: 2532
---

# campaign_mutation_engine.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/campaign_mutation_engine.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/campaign_mutation_engine.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/campaign_mutation_engine.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.

### Canonical Spatial Pin Normalizer (SYS-ARCH-01)
- `normalizeSpatialPin(pin)` has exactly one definition, here. It mutates `pin` in place and returns the same reference (`null` for a non-object), so canvas, inspector and interaction callers can ignore the return value.
- Defaults: `id` via `generateMonotonicId('pin')` only when missing, `x`/`y` to `0`, `label` to `POI Pin`, `visible: true`, `locked: false`. Existing `visible`/`locked` flags are kept.
- `links`: built from legacy `targetType` + `targetId` when absent. When present, each link object is kept (extra fields survive); only `id` is coerced to string and a missing `type` becomes `node`.
- `targetType`/`targetId` follow `links[0]`. With no links the canvas default applies (`npc`, `''`). Unknown properties (`color`, `notes`, mod fields) are never deleted.
- The UMD tail publishes `root.normalizeSpatialPin`, so `cad_interaction.js`, `cad_canvas_renderer.js` and `property_grid_inspector.js` resolve the global. Hand-built `vm` sandboxes in `test/run_tests.js` get it from `injectEngine(sandbox)`.
- `upsertEntity` on an existing pin now also records `visible`/`locked`/`targetType`/`targetId` field diffs in the changelog when the stored pin lacked them.

### Entity Reference Descriptors (SYS-ARCH-01)
`ENTITY_REFERENCE_DESCRIPTORS` (exported) is the one declarative table of every field that references another entity by id. Each row names the referring `collection` (`factions`, `npcs`, `quests`, `items`, `trackers`, `tickets`, `spatialpins`, `nodes`, `links`), the `target` type (`npc`, `quest`, `item`, `tracker`, `faction`, `node`, or `*`), the `path` (a field, or `list[].field` for a nested list), the `shape` that decides how it is matched, the scrub `op` (`null`, `filter`, `delete-key`, `clear`, `retarget`, `resync`, `splice`), whether the scrub writes a changelog entry (`log`), and a human `label`. Rows run in table order, which is the order changelog entries are written.
- `deleteEntity` scrubs through the table (`eachReferrer` plus the per-shape handlers in `REFERENCE_SHAPES`). Scrub behavior and changelog output are unchanged from the earlier hand-written version.
- `findEntityReferences(state, type, id, { maps })` is the read-only twin. It returns `[{ collection, entityId, field, label, mapId? }]` for every record `deleteEntity` would change, skipping the entity's own record. The delete preview in `entity_cascade_delete.js` reads it, so the preview and the scrub cannot drift apart.
- Corridor keys (`edgeData`, `edgeNotes`, `edgeSlottedModules`) are not id fields and stay in `removeCorridorsForNode`, which runs after each state/map scope.
- To add a new reference field, add one row. Add a hand-written assertion for it in Suite 44 style, and the Suite 50 parity test covers hit/apply agreement.

### deleteEntity Map Registry (SYS-ARCH-01)
`deleteEntity(state, type, id, batchContext)` scrubs child-map nodes, links, corridors and spatial pins from `state.maps` (or `state.activeTopology.maps`) **and** from the optional `batchContext.maps` registry. `Workstation.activeTopology` carries no `maps`, so the UI passes its global `maps` registry (`executeEntityDeletion` in `entity_cascade_delete.js`). A map reachable through both registries is scrubbed once. For `node` targets the same walk also removes the node id from `adj`/`infBy`, links and corridors of every registered map.
- ODV (SYS-ODV-02 S1): normalizeOdv returns null instead of [2,2,2]; npc/faction odv set-or-delete with odvSource; scalar npc.disposition moves to dispositionToParty.
<!-- END_CUSTOM_NOTES -->
