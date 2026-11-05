---
file_path: "src/workstation/scripts/state_adapter.js"
title: "state_adapter.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "b9633b7d05796df3"
reviewed_hash: "b9633b7d05796df3"
stale: false
size_bytes: 59817
line_count: 1244
---

# state_adapter.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/state_adapter.js` serves as the authoritative multi-map data model, scale-fluid cartography sync adapter, and campaign package loading orchestrator. Provides `switchActiveMap()`, `loadCampaignProjectPackage()`, `syncAdapterFromWorkstationTopology()`, and `syncAdapterToWorkstationTopology()`, resolving background images via `resolveMapBackgroundUrl()` (IndexedDB, in-memory `dataUrl`, bound folder handle, or zero-CORS offline `assetPath`) without premature DB cache eviction when asset paths exist, and preserving node modules, ad-hoc resource logistics (`provides`, `requires`, `operationalProfile`), `custom_modules` (`SYS-START-09`), and corridor `edgeData` across map transitions.

### Corridor / Node Seam Aliases (SYS-ARCH-01)
This file no longer publishes `formatCorridorKey`, `getNodesList`, `ensureQueryableNodesCollection` and the other pointcrawl aliases, and `window.CampaignStateAdapter` is gone. That tail block was dead (state_adapter loaded before the engine) and had no readers. `campaign_mutation_engine.js` publishes the aliases from its UMD tail. In-file reads of the engine (`getNodesList`, `ensureQueryableNodesCollection`) are runtime `typeof CampaignMutationEngine` checks and are unchanged.
- ODV (SYS-ODV-02 S1): normalizeOdvVector uses normalizeOdvInput, returns undefined when unset/invalid; odvDefault removed.
<!-- END_CUSTOM_NOTES -->
