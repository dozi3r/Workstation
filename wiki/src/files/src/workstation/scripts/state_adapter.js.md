---
file_path: "src/workstation/scripts/state_adapter.js"
title: "state_adapter.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "5df18f55c6780b26"
reviewed_hash: "5df18f55c6780b26"
stale: false
size_bytes: 67235
line_count: 1343
---

# state_adapter.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/state_adapter.js` serves as the authoritative multi-map data model, scale-fluid cartography sync adapter, and campaign package loading orchestrator. Provides `switchActiveMap()`, `loadCampaignProjectPackage()`, `syncAdapterFromWorkstationTopology()`, and `syncAdapterToWorkstationTopology()`, resolving background images via `resolveMapBackgroundUrl()` (IndexedDB, in-memory `dataUrl`, bound folder handle, or zero-CORS offline `assetPath`) without premature DB cache eviction when asset paths exist, and preserving node modules, arbitrary top-level mod properties (`node.tarot_data`, `node.weather_state` via `...n` spread), `campaignName` integrity across submap transitions, ad-hoc resource logistics (`provides`, `requires`, `operationalProfile`), `custom_modules` (`SYS-START-09`), and corridor `edgeData` across map transitions. Dispatches `window.CreatorStudio.emit('campaignLoaded')` upon completing package hydration. Includes defensive fallback hydration when multi-scale map shells omit `nodes` arrays but specify `nodeIds` or root package nodes.

### Corridor / Node Seam Aliases (SYS-ARCH-01)
This file no longer publishes `formatCorridorKey`, `getNodesList`, `ensureQueryableNodesCollection` and the other pointcrawl aliases, and `window.CampaignStateAdapter` is gone. That tail block was dead (state_adapter loaded before the engine) and had no readers. `campaign_mutation_engine.js` publishes the aliases from its UMD tail. In-file reads of the engine (`getNodesList`, `ensureQueryableNodesCollection`) are runtime `typeof CampaignMutationEngine` checks and are unchanged.
- ODV (SYS-ODV-02 S1): normalizeOdvVector uses normalizeOdvInput, returns undefined when unset/invalid; odvDefault removed.
- Campaign-Session Projection (Sprint 2): `loadCampaignProjectPackage` wraps package hydration in defensive try/catch rollback, restoring sterile slate via `resetWorkstationSlate` on corrupt/interrupted loads to prevent half-hydrated campaign state leaks.
- Package Orchestration (Sprint 4): loadCampaignProjectPackage preserves custom mod fields and unknown top-level attributes from pkg directly onto Workstation.activeTopology for seamless inter-adapter roundtripping.
<!-- END_CUSTOM_NOTES -->
