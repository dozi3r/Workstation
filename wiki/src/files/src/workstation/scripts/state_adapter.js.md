---
file_path: "src/workstation/scripts/state_adapter.js"
title: "state_adapter.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "4447857d23710628"
reviewed_hash: "4447857d23710628"
stale: false
size_bytes: 56091
line_count: 1183
---

# state_adapter.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/state_adapter.js` serves as the authoritative multi-map data model, scale-fluid cartography sync adapter, and campaign package loading orchestrator. Provides `switchActiveMap()`, `loadCampaignProjectPackage()`, `syncAdapterFromWorkstationTopology()`, and `syncAdapterToWorkstationTopology()`, resolving background images via `resolveMapBackgroundUrl()` (IndexedDB, in-memory `dataUrl`, bound folder handle, or zero-CORS offline `assetPath`) without premature DB cache eviction when asset paths exist, and preserving node modules, ad-hoc resource logistics (`provides`, `requires`, `operationalProfile`), `custom_modules` (`SYS-START-09`), and corridor `edgeData` across map transitions.
<!-- END_CUSTOM_NOTES -->
