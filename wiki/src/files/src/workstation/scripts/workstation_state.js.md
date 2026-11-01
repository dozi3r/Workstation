---
file_path: "src/workstation/scripts/workstation_state.js"
title: "workstation_state.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "4760da98525d9b89"
reviewed_hash: "4760da98525d9b89"
stale: false
size_bytes: 74772
line_count: 1512
---

# workstation_state.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/workstation_state.js` serves as the foundational state container and lifecycle coordinator for the Creator Studio desktop workstation shell. It defines the global `Workstation` reactive state model, the public `window.CreatorStudio` mod extension API, and orchestrates DOMContentLoaded initialization across all canvas, menu, and MDI subsystems.

### Core Subsystems & Responsibilities
- **Workstation Reactive State**: Maintains active topology reference (`activeTopology`), active CAD tool, selected entity/node/edge focus, zoom/pan transforms, layer display toggles (grid, influence vectors, roads, threat clocks, tarot markers, GM vision), registered mod hooks, and undo/redo stacks.
- **Creator Studio Mod API**: Exposes `window.CreatorStudio` with lifecycle hooks (`registerMod`, `getActiveTopology`, `selectNode`, `selectEdge`, `refresh`, `saveActiveCampaign`, `registerMDIWindow`).
- **Campaign Persistence & Auto-Sync**: Handles `initTopologyState()`, local storage fallback caching, `ensureEntityCollections()` (including `custom_modules`, `deletedModules`, and `deletedPrototypes`), `syncCustomModulesToCatalog()`, `purgeDeletedModulesFromRuntimeCatalog()` (splicing deleted modules out of `ALL_MODULES` and `MODULES_MANIFEST` across reboots), and asynchronous project directory flushing (`flushProjectDirectorySync`, `saveActiveCampaign`).
- **Workbench UI Chrome, Deep-Linking & Modals**: Implements menu bar interaction (`initMenuBar`, `toggleMenu`, `closeAllMenus`), URL query parameter deep-linking (`?selectNode=<id>` and `?selectEdge=<u-v>` from `network/odv_archetype_matrix.html`), status bar telemetry (`setStatusBarMessage`, `updateStatusBar`), MDI registration (including `modal-custom-module-editor` and `modal-pack-installer`), sourcebook package manager (`openSourcebooksModal`, `renderSourcebooksList`, `switchSourcebookTab` delegating to `packEngine.renderInstalledPacksView`), and universal multi-format campaign export modal (`openCampaignExportModal`, `switchExportTab`, `populatePackExportForm`, `downloadExportFile`).
<!-- END_CUSTOM_NOTES -->
