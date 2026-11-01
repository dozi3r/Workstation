---
file_path: "src/workstation/scripts/map_store.js"
title: "map_store.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "b535bc436abc9478"
reviewed_hash: "b535bc436abc9478"
stale: false
size_bytes: 106422
line_count: 2614
---

# map_store.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/map_store.js` manages campaign persistence, local storage, IndexedDB caching (`CreatorStudioMapDB`), and File System Access API operations for the workstation. It provides `hydrateMapsWithImageDataUrls()` (re-hydrating stripped background image `dataUrl`s from IndexedDB/canvas before `.zip`, `.creator.json`, or disk folder exports) and `resolveMapBackgroundUrl()` (falling back to zero-CORS relative `assets/<mapId>_bg.*` paths when IndexedDB is empty), and handles multi-scale pointcrawl export/import (`writeCampaignToProjectDirectory`, `saveCampaignAsZip`, `saveCampaignAsCreatorJson`, `loadCampaignFromDirectoryHandle`), serializing active map hierarchies into standardized `workstation_project` packages with `campaign.json`, `topology.json`, `preset.json`, `modules_manifest.json`, and `assets/`.

Unified save routing (`handleToolbarSave`) checks whether an active disk directory handle is bound; if unlinked, it prompts the author via a confirmation dialog to bind live disk sync, warning explicitly when declining that edits remain in temporary browser storage only. `saveActiveCampaignAsNew` resolves the `/campaigns` directory without auto-loading, creates or validates the target campaign slug subfolder, calls `bindProjectDirectory(subDir)` to bind live disk sync, and flushes initial package files directly to disk. During campaign opening (`loadCampaignFromDirectoryHandle`), the universal `blobToDataUrl(blob)` engine scans and hydrates raster images directly from `assets/` into base64 data URLs, persists them into IndexedDB, and updates active map metadata so backgrounds immediately render on the tactical CAD canvas upon opening.
<!-- END_CUSTOM_NOTES -->
