---
file_path: "src/workstation/scripts/campaign_mutation_engine.js"
title: "campaign_mutation_engine.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "ebb9735c2093ddea"
reviewed_hash: "ebb9735c2093ddea"
stale: false
size_bytes: 111055
line_count: 2524
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

### deleteEntity Map Registry (SYS-ARCH-01)
`deleteEntity(state, type, id, batchContext)` scrubs child-map nodes, links, corridors and spatial pins from `state.maps` (or `state.activeTopology.maps`) **and** from the optional `batchContext.maps` registry. `Workstation.activeTopology` carries no `maps`, so the UI passes its global `maps` registry (`executeEntityDeletion` in `entity_cascade_delete.js`). A map reachable through both registries is scrubbed once. For `node` targets the same walk also removes the node id from `adj`/`infBy`, links and corridors of every registered map.
<!-- END_CUSTOM_NOTES -->
