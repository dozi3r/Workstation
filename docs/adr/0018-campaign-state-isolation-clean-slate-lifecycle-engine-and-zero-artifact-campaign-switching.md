# ADR 0018: Campaign State Isolation, Clean-Slate Lifecycle Engine, and Zero-Artifact Campaign Switching

## Status
Accepted (2026-10-31)

## Context
Creator Studio originally operated under an implicit single-campaign assumption: workstation sessions were initialized against a single preset (*Emerald Isle*) and edited in-place. With the introduction of the New Campaign Wizard, multiple campaign packages, and live disk folder synchronization ([ADR 0010](0010-portable-campaign-packages-and-project-directory-synchronization.md), [ADR 0016](0016-workstation-2-5-zero-install-loopback-and-legacy-framework-retirement.md)), authors began authoring multiple independent campaigns and switching between them.

However, creating a new campaign from scratch or switching between campaigns exhibited critical cross-contamination defects:
1. **Ghost Map Packing via `switchActiveMap()`**: When `loadCampaignProjectPackage()` ingested a new package, it replaced `maps = compiledMaps` but left `activeMapId` pointing to the previous campaign's map. When calling `switchActiveMap(rootMapId, true)`, `targetMapId !== activeMapId` evaluated to `true`, triggering `syncActiveMapToRegistry()`. This packed the previous campaign's live canvas nodes and map ID straight into the new campaign's maps registry.
2. **Greedy Entity Fallback**: `switchActiveMap()` cached `Workstation.activeTopology.npcs` when navigating between sub-maps. When a new blank canvas was created with 0 NPCs, this fallback evaluated `Workstation.activeTopology.npcs.length > 0` (from the prior campaign) as `true`, resurrecting old NPCs, quests, items, and threat clocks onto the blank canvas.
3. **Startup Wipe & Hardcoded Preset Whitelisting**: `initTopology()` validated `localStorage.getItem("cs_active_campaign")` against compile-time `CAMPAIGN_REGISTRY` keys. Any custom campaign authored on disk (e.g. `pbtest2`) was rejected as invalid, causing `initTopology()` to delete all `creator_studio_*` keys in `localStorage` and silently reboot *Emerald Isle*.
4. **Rigid `"map_root"` Map Registry Validation**: Both `initTopology()` and `initMapsRegistry()` asserted `if (parsedMaps && parsedMaps["map_root"])`. If a campaign deleted, renamed, or generated a root map with a dynamic ID (e.g., `map_mvwl5v4w_k4`), the registry was discarded and defaulted back to *Emerald Isle*.
5. **IndexedDB Image Store Bleed**: The `active_map` object store in IndexedDB (`CreatorStudioMapDB`) keyed background images by map ID alone (`map_root`). Because most campaigns use `map_root` for their top-level map, opening a new campaign pulled the previous campaign's background image from the browser cache and saved it into the new campaign's `assets/` directory.
6. **Persistent Subsystem Artifacts**: Undo/redo stacks, entity selections, custom SVG layer groups (`#layer-group-*`), and workstation mod data persisted across campaign transitions, allowing Ctrl+Z or inspector interactions to corrupt the new campaign.

## Decision

### 1. Authoritative Teardown Function (`resetWorkstationSlate`)
Introduce a centralized, authoritative teardown procedure executed prior to creating, opening, or switching any campaign:
- **Directory Writes**: Flushes pending writes to the previous campaign if bound, or unbinds gracefully.
- **Selection & Interaction**: Clears `Workstation.selectedEntity`, `Workstation.selectedEntities`, and resets active tools to `select`.
- **History Stacks**: Completely resets `history.undoStack`, `redoStack`, and legacy stacks to `[]`.
- **Cartographic Globals**: Sets `activeMapId = null`, `maps = {}`, `nodes = []`, `links = []`, `waves = []`, `drawnCards = {}`, `nodeSlottedModules = {}`, `edgeSlottedModules = {}`, `revealedNodes = {}`, and `activeMapMetadata = null`.
- **Active Topology**: Re-initializes `Workstation.activeTopology` to a sterile container with empty entity arrays (`npcs`, `quests`, `items`, `trackers`, `tickets`, `custom_modules`, `deletedModules`, `deletedPrototypes`) and default layers.
- **SVG DOM Layers**: Scans `#cad-svg` and removes all dynamic `.canvas-layer-group` elements, clearing any image `href` on `#canvas-bg-image`.
- **Runtime Catalog Purge**: Strips custom and disk-scanned modules from `ALL_MODULES` / `MODULES_MANIFEST` that belonged to the previous campaign.

### 2. Guarded Map Switching During Package Ingestion
- `switchActiveMap(targetMapId, force, options)` supports `options.skipSyncToRegistry = true`.
- During `loadCampaignProjectPackage()`, `resetWorkstationSlate()` is invoked first. The subsequent call to `switchActiveMap(rootMapId, true, { skipSyncToRegistry: true })` bypasses canvas topology packing into `maps`.
- Remove the greedy `cachedEntities` fallback: campaign entities belong strictly to the campaign package being loaded. If an incoming campaign declares 0 NPCs, the roster remains empty `[]`.

### 3. Dynamic Startup Campaign Resolution & Zero-Hardcode Fallback
- `initTopology()` removes the compile-time whitelist check against `CAMPAIGN_REGISTRY`.
- If `cs_active_campaign` is set and valid session data exists in `localStorage` (`creator_studio_maps_registry` or `creator_studio_active_topology`), the workstation resumes that session regardless of whether it is a compiled preset or a custom disk campaign.
- If no saved session data exists in `localStorage`, `initTopology()` does **not** fall back to *Emerald Isle*. Instead, it presents the Welcome Modal over a sterile, clean canvas and displays a clear status message: *"No active campaign session. Start a new campaign or open an existing one."*
- Replace hardcoded `parsedMaps["map_root"]` checks with `Object.keys(parsedMaps).length > 0` and dynamically resolve the active map via `parsedMaps[savedActiveMapId] || parsedMaps["map_root"] || Object.keys(parsedMaps)[0]`.

### 4. Ephemeral Session Flush for IndexedDB Images (Option B)
- Under our core design philosophy ([ADR 0010](0010-portable-campaign-packages-and-project-directory-synchronization.md)), on-disk folders (`campaigns/<slug>/assets/`) and JSON packages are the single authoritative source of truth for assets.
- IndexedDB's `active_map` object store is strictly an ephemeral runtime cache.
- `resetWorkstationSlate()` clears the `active_map` store on campaign unload. Background images are re-hydrated directly from the incoming campaign's `assets/` directory or package metadata upon activation, completely eliminating cross-campaign image bleed.

### 5. Workstation Mod Lifecycle Hooks (`onCampaignLoad`, `onCampaignUnload`)
- Workstation mods installed via `window.CreatorStudio.registerMod()` remain registered at the workstation shell level across campaign transitions.
- When `resetWorkstationSlate()` runs, it dispatches `onCampaignUnload({ previousCampaignId })` to all registered mods.
- When a campaign completes loading, `onCampaignLoad(activeCampaign)` is dispatched.
- Mods store their campaign-specific state inside the campaign folder (under `Workstation.activeTopology.modData` or node/edge `modData`), preserving campaign portability via simple folder copy/paste without unneeded duplication of mod tool code.

### 6. Auto-Flush Pending Disk Writes Before Teardown
- When transitioning to a new campaign, the workstation checks `hasPendingDiskWrites()`.
- If active, it automatically calls `await flushProjectDirectoryNow()`. If write access is ungranted or the write fails, it prompts the author with a confirmation alert before proceeding with state teardown.

## Consequences

### Positive
- Creating a new campaign from scratch (Blank Canvas) reliably starts with a sterile slate: 0 nodes, 0 edges, 0 NPCs, 0 quests, and no leaked background graphics.
- Authors can seamlessly switch between multiple disk campaigns without nodes or entities from Campaign A contaminating Campaign B.
- Closing and reopening the browser window preserves the active disk campaign session instead of wiping `localStorage` and falling back to *Emerald Isle*.
- Hardcoded dependencies on *Emerald Isle* are eliminated from workstation boot routines.
- Workstation mods gain clean, predictable lifecycle boundaries for loading and unloading campaign-specific data.

### Negative / Trade-offs
- Undo/redo stacks are cleared on campaign switch (by design; undoing actions across different campaign graphs would cause severe data corruption).
