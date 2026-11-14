---
file_path: "src/workstation/scripts/map_store.js"
title: "map_store.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "778214f05e365220"
reviewed_hash: "778214f05e365220"
stale: false
size_bytes: 139159
line_count: 3224
---

# map_store.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/map_store.js` manages campaign persistence, local storage, IndexedDB caching (`CreatorStudioMapDB`), and File System Access API operations for the workstation. It provides `hydrateMapsWithImageDataUrls()` (re-hydrating stripped background image `dataUrl`s from IndexedDB/canvas before `.zip`, `.creator.json`, or disk folder exports) and `resolveMapBackgroundUrl()` (falling back to zero-CORS relative `assets/<mapId>_bg.*` paths when IndexedDB is empty), and handles multi-scale pointcrawl export/import (`writeCampaignToProjectDirectory`, `saveCampaignAsZip`, `saveCampaignAsCreatorJson`, `loadCampaignFromDirectoryHandle`), serializing active map hierarchies into standardized `workstation_project` packages with `campaign.json`, `topology.json`, `preset.json`, `modules_manifest.json`, and `assets/`.

Unified save routing (`handleToolbarSave`) checks whether an active disk directory handle is bound; if unlinked, it prompts the author via a confirmation dialog to bind live disk sync, warning explicitly when declining that edits remain in temporary browser storage only. `applyCampaignSettings()` (SYS-START-19) applies live in-place campaign title, author, description, root map, Dial 8 climax trigger, and Tier 0 Substratum settings across in-memory state, document title, status bar, Property Grid, IndexedDB library, and bound disk files, and emits `'campaignRenamed'`. `saveActiveCampaignAsNew()` updates campaign identity (`name`, `campaignName`, `id`, `description`, `maps[rId].name`, `localStorage.cs_active_campaign`) before syncing, binds live disk sync or stores full entity collections (`creatures`, `evidence`, `factions`, `spatialPins`) in IndexedDB library, and emits `'campaignRenamed'`. During campaign opening (`loadCampaignFromDirectoryHandle`), the universal `blobToDataUrl(blob)` engine scans and hydrates raster images directly from `assets/` into base64 data URLs, persists them into IndexedDB, and updates active map metadata so backgrounds immediately render on the tactical CAD canvas upon opening.
- Package Orchestration (Sprint 4): uildCampaignPackageFiles preserves custom mod fields and unknown top-level attributes on campaign.json via activeTopology spread, and serializes creatures/evidence.json and changelog.json. loadCampaignFromDirectoryHandle extracts custom_modules, deletedModules, deletedPrototypes, and unknown top-level fields into pkg for dual-adapter symmetry.
<!-- END_CUSTOM_NOTES -->
