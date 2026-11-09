---
file_path: "src/workstation/scripts/workstation_state.js"
title: "workstation_state.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "e56fc90a03c7d1f7"
reviewed_hash: "e56fc90a03c7d1f7"
stale: false
size_bytes: 96487
line_count: 1907
---

# workstation_state.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/workstation_state.js` serves as the foundational state container and lifecycle coordinator for the Creator Studio desktop workstation shell. It defines the global `Workstation` reactive state model, the public `window.CreatorStudio` mod extension API, and orchestrates DOMContentLoaded initialization across all canvas, menu, and MDI subsystems.

### Core Subsystems & Responsibilities
- **Workstation Reactive State**: Maintains active topology reference (`activeTopology`), active CAD tool, selected entity/node/edge focus, zoom/pan transforms, layer display toggles (grid, influence vectors, roads, threat clocks, tarot markers, GM vision), registered mod hooks, and undo/redo stacks.
- **Creator Studio Mod API & Event Bus**: Exposes `window.CreatorStudio` with lifecycle hooks and a pub/sub mod event bus (`on`, `off`, `emit`) delivering `'campaignLoaded'` and `'campaignRenamed'` events with zero-throw `try/catch` error isolation. Mod registrations automatically bind optional `onCampaignLoad` and `onCampaignRename` lifecycle handlers.
- **Campaign Persistence & Auto-Sync**: Handles `initTopologyState()`, local storage fallback caching, `ensureEntityCollections()` (including `custom_modules`, `deletedModules`, and `deletedPrototypes`), `syncCustomModulesToCatalog()`, `purgeDeletedModulesFromRuntimeCatalog()` (splicing deleted modules out of `ALL_MODULES` and `MODULES_MANIFEST` across reboots), and asynchronous project directory flushing (`flushProjectDirectorySync`, `saveActiveCampaign`).
- **Workbench UI Chrome, Deep-Linking & Modals**: Implements menu bar interaction (`initMenuBar`, `toggleMenu`, `closeAllMenus`), URL query parameter deep-linking (`?selectNode=<id>` and `?selectEdge=<u-v>` from `network/odv_archetype_matrix.html`), status bar telemetry (`setStatusBarMessage`, `updateStatusBar` with resilient `campaignName` resolution across sub-maps), MDI registration (including `modal-custom-module-editor` and `modal-pack-installer`), sourcebook package manager (`openSourcebooksModal`, `renderSourcebooksList`, `switchSourcebookTab` delegating to `packEngine.renderInstalledPacksView`), and universal multi-format campaign export modal (`openCampaignExportModal`, `switchExportTab`, `populatePackExportForm`, `downloadExportFile`).
- **Campaign-Session Teardown & Sterile Slate (Sprint 2)**: `resetWorkstationSlate` comprehensively clears ephemeral session projection state including `waves`, `drawnCards`, `fogOfWarMode`, and `CrossCampaignService.loadedSources` to guarantee zero state leak across campaign loads.
<!-- END_CUSTOM_NOTES -->
