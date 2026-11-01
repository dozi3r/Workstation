# AI Developer Guide: Creator Studio Architecture & Operations

> **Notice to AI Assistants & Autonomous Agents**:  
> Read this manual thoroughly before proposing or executing changes in this repository. This document explains the system architecture, foundational design rationales, invariants, and implementation patterns established in the codebase.

---

## 1. Prime Invariants & Ground Rules

1. **Zero-CORS Offline Execution (`file:///`)**:
   - Every surface in `start.html`, `network/*.html`, `regions/*.html`, and `wiki/*.html` must execute cleanly when opened directly from a local disk via the `file:///` protocol in any standard browser.
   - **Never** introduce external CDN scripts, WebSockets, or HTTP-based `fetch()` calls that fail under CORS restrictions.
   - Client-side storage uses the browser's native **IndexedDB API** (for large raster map images) and **localStorage** (for settings and metadata).

2. **Single Source of Truth (`src/workstation/` & `start.html`)**:
   - **Never** manually edit `start.html` or inlined constants inside HTML bundles.
   - Edit the modular JavaScript/HTML sources inside `src/workstation/scripts/` and `src/workstation/template.html`.
   - Note that `index.html` and `network/campaign_studio.html` are deprecated zero-CORS redirect stubs forwarding directly to `start.html`.
   - The suite compiler inlines and resolves `// @@INCLUDE: <relPath> @@` and injects campaign sourcebooks (`// @@INJECT_ALL_MODULES@@`, `// @@INJECT_CAMPAIGN_REGISTRY@@`, `// @@INJECT_MASTER_TICKETS_DATA@@`).

3. **Compilation Command**:
   - After updating any script, module, preset, workstation template, or manifest, compile the suite via:
     ```powershell
     powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
     ```

4. **Topological & Sociological Consistency**:
   - The 64-cell Granular Disposition `[S, E, C]` algebra (`src/workstation/scripts/sociology_data.js`), Competing Values Framework (CVF) quadrants, and supply-chain BFS reachability (`src/workstation/scripts/stage_5_slotting.js`) must remain consistent across workstation surfaces and specifications.

---

## 2. System Architecture: The Scale-Fluid Principle

### The Problem It Solves
Tabletop campaigns develop to vastly different extents:
- **Top-Down Development**: A worldbuilder drafts an entire continent or province, then defines major settlements, and finally zooms into specific dungeons or buildings.
- **Bottom-Up Development**: A campaign starts with just a single building (e.g., *Krak des Chevaliers*, a roadside inn, an ancient vault). The surrounding wilderness and cities do not exist yet. Later, the author drafts an outer region and wants to wrap that building as a node inside the new region.
- **Lateral / Modular**: Several distinct pointcrawls (e.g., three rival citadels) exist independently without needing a macro-world map.

### Core Architectural Decisions
- **Scale-Agnostic Pointcrawls**: There is **no mandatory top-level continent**. Any map can be the root map or a standalone map.
- **7 Descriptive Scale Tiers**:
  1. `cosmic`: 🌌 Cosmic / Macro
  2. `continent`: 🗺️ Continent / World
  3. `region`: 🌲 Region / Province (default)
  4. `settlement`: 🏰 Settlement / City
  5. `district`: 🏘️ District / Quarter
  6. `building`: 🏛️ Building / Site
  7. `floorplan`: ⚔️ Floorplan / Dungeon
- **Bidirectional Hierarchy**:
  - **Drill-Down / Sub-Map Creation**: A node on map $A$ can have a child map $B$ attached via `node.childMapId = "map_b"`.
  - **Reparenting**: Map $B$ can be reparented to map $C$, or detached to become a standalone root map at any time (`reparentMap(mapId, newParentId, newParentNodeId)`).

---

## 3. The State Model: Global State Swap Adapter

### Why Global State Swapping Was Chosen
The simulation engine (`stage_4_balancing.js`, `stage_2_waves.js`, `canvas_engine.js`) comprises over 15,000 lines of tight mathematical calculations relying on variables:
`nodes`, `links`, `waves`, `drawnCards`, `sovereignHubs`, `sovereignHubTarget`, `smotheredNodes`, `nodeSlottedModules`, `edgeSlottedModules`, `revealedNodes`, `activeMapMetadata`.

Refactoring every math function to accept `activeMapId` and navigate deep nested objects would introduce immense performance overhead, risk subtle regressions, and break CLI parity with `Run-NetworkEngine.ps1`.

Instead, we implemented the **Global State Swap Pattern**:
1. Active globals (`nodes`, `links`, etc.) represent the **currently viewed map context**.
2. Master state lives in `maps: { [mapId]: MapData }` and `activeMapId`.
3. When switching maps:
   ```javascript
   // 1. Pack live globals into current map
   syncActiveMapToRegistry();

   // 2. Unpack target map record into live globals
   activeMapId = targetMapId;
   nodes = maps[targetMapId].nodes;
   links = maps[targetMapId].links;
   ...

   // 3. Load map image from IndexedDB
   await loadPersistedMapFromDB(targetMapId);

   // 4. Recalculate balancing and refresh UI
   recalculateBalancing();
   renderCanvasGraph();
   updateBreadcrumbsHUD();
   renderInspectorDrawer();
   buildWikiIndex();
   ```

### Map Data Schema
Every map inside `maps` conforms to this structure:
```typescript
interface MapRecord {
  id: string;                         // e.g. "map_root" or "map_mva49rx0_t"
  name: string;                       // e.g. "Krak des Chevaliers Fortress"
  scaleTier: "cosmic" | "continent" | "region" | "settlement" | "district" | "building" | "floorplan";
  parentMapId: string | null;         // null if standalone or root
  parentNodeId: number | null;        // node ID in parent map leading here
  nodes: NodeObject[];                // Pointcrawl POI nodes
  links: LinkObject[];                // Physical transit & hegemonic influence links
  waves: WaveObject[];                // 7-wave exploration sequence
  drawnCards: Record<number, Card>;   // Tarot cards drawn per node
  sovereignHubs: HubObject[];         // Elected Sovereign Hubs
  sovereignHubTarget: number;         // Hub election target (default 5)
  smotheredNodes: Record<number, Hub>;// Nodes smothered by adjacent hubs
  nodeSlottedModules: Record<number, string[]>; // Modules slotted on nodes
  edgeSlottedModules: Record<string, string[]>; // Modules slotted on corridors
  revealedNodes: Record<number, boolean>;       // Fog of war exploration
  mapMetadata: {                      // Map background dimensions & opacity
    name: string;
    width: number;
    height: number;
    opacity: number;
    dataUrl?: string;
  } | null;
  customNotes?: string;               // GM notes on this map
}
```

---

## 4. Bidirectional Wiki & Citation Engine (`wiki_engine.js`)

### Token Grammar & Syntax
The lexer and parser support both explicit structured tokens and natural shorthand mentions:
| Syntax | Target Entity | Example | Action on Click |
| :--- | :--- | :--- | :--- |
| `[[Node:id]]` | Node in active map | `[[Node:15]]` | Centers canvas on node #15, opens inspector, pulses ring. |
| `[[Node:mapId/id]]` | Node in another map | `[[Node:map_crypts/3]]` | Switches active map to `map_crypts`, centers canvas on node #3. |
| `[[Map:mapId]]` | Map in campaign | `[[Map:map_crypts]]` | Switches canvas to view `map_crypts`. |
| `[[Mod:modId]]` | Slotted/Catalog Module | `[[Mod:SET_A_01]]` | Switches inspector to Module catalog, focuses module #SET_A_01. |
| `[[Faction:id]]` | Campaign Faction | `[[Faction:concord]]` | Opens Faction Roster inspector drawer. |
| `[[Corridor:u-v]]` | Edge between $u$ and $v$ | `[[Corridor:2-6]]` | Selects corridor between node 2 and 6, opens corridor inspector. |
| `@EntityName` | Natural mention | `@Beachhead Bastion` | Resolves entity by display name and navigates to it. |

### Inverted Index Architecture
- Function: `buildWikiIndex()`:
  1. Synchronizes active map globals (`syncActiveMapToRegistry()`).
  2. Scans all text fields: node notes, node biomes, corridor notes, corridor scenario prompts, module descriptions, and map notes across every map in `maps`.
  3. Indexes every token match into:
     ```javascript
     wikiIndex = {
       "node:1": [
         { sourceType: "node", sourceId: 15, sourceName: "Central Artery", mapId: "map_root", field: "notes", snippet: "..." }
       ]
     };
     ```
- Function: `getBacklinksForEntity(type, id, mapId)`:
  - Queries `wikiIndex` by exact key (`node:1`, `node:map_root/1`, and lowercased display name).
  - Returns deduplicated array of inbound citations for the inspector backlinks tray.

### Live Autocomplete Controller
- Function: `attachWikiAutocomplete(textareaElement)`:
  - Listens to `input` and `keydown` events.
  - When user types `@` or `[[`:
    - Filters candidate nodes, maps, modules, and factions matching the query.
    - Positions floating `#wiki-autocomplete-dropdown` directly under the cursor.
    - Supports `ArrowUp`, `ArrowDown`, `Enter`, `Tab` to select, and `Escape` to dismiss.
    - Inserts the formatted token and triggers `buildWikiIndex()`.

---

## 5. Offline Cartography & IndexedDB (`map_store.js`)

### Database Details
- **Database Name**: `CreatorStudioMapDB`
- **Version**: `2`
- **Object Store**: `active_map` with `keyPath: "id"`
- **Storage Strategy**:
  - Stored records: `{ id: mapId, name, dataUrl, width, height, opacity, timestamp }`.
  - Saving a map for `map_root` mirrors to legacy `id: "active_map"` to ensure older sessions open without missing their map background.
  - `loadPersistedMapFromDB(mapId)` checks `mapId`, falling back to `"active_map"` if root is requested.
  - `listPersistedMapsFromDB()` retrieves metadata for all cached map images.

---

## 6. UI Surface Integration & Files Map

| Source File | Role & Modifications |
| :--- | :--- |
| **`src/workstation/template.html`** | Single-document workstation shell HTML template with Win95 bevel chrome, MDI desktop layout, docked `#properties-dock`, and modal placeholders. |
| **`src/workstation/scripts/workstation_core.js`** | Workstation desktop initialization, top menu bar, status bar telemetry, and global keyboard shortcuts. |
| **`src/workstation/scripts/balancing_engine.js`** | Primary mathematical balancer in `start.html`: amalgamation scoring, adjacency smothering, 7-wave progression, and dial overrides (parity with `Run-NetworkEngine.ps1`). |
| **`src/workstation/scripts/state_adapter.js`** | Scale-fluid global state swap adapter, `SCALE_TIERS` registry, multi-map swapping, and breadcrumb path resolution. |
| **`src/workstation/scripts/canvas_hud.js`** | CAD pointcrawl graph renderer, canvas zoom/pan, node stationing glyphs, portal node cyan rings, and link vector styling. |
| **`src/workstation/scripts/module_explorer.js`** | Modular workstation explorer MDI window: 5-tier pipeline filtering, BFS supply-chain validation, and module slotting. |
| **`src/workstation/scripts/entity_manager.js`** | Active campaign roster management: NPC personas, quest objectives, items, dials, and tickets stationed on nodes. |
| **`src/workstation/scripts/ticket_center.js`** | Unified backlog ticket tracker and command center window. |
| **`src/workstation/scripts/map_navigator.js`** | Breadcrumb HUD renderer and multi-scale Map Tree hierarchy modal. |
| **`src/workstation/scripts/map_store.js`** | Multi-map IndexedDB persistence keyed by `mapId` in `CreatorStudioMapDB`. |
| **`src/workstation/scripts/wiki_engine.js`** | Token lexer (`[[Node:...]]`, `[[Map:...]]`, `@...`), inverted index builder, and live autocomplete popup. |
| **`src/workstation/scripts/stage_5_slotting.js`** | Node and corridor module slotting engine, resource tag contract validator (`provides`/`requires`). |
| **`src/workstation/scripts/stage_6_export.js`** | Serializes `maps`, roster, and settings into campaign JSON presets and VTT packages. |
| **`src/workstation/scripts/mdi_window_manager.js`** | MDI window manager for draggable, resizable, minimizable dialog windows. |
| **`src/campaign_studio/` (Legacy Reference)** | Historical modular source directory preserved for backward compatibility and reference. |

---

## 7. Checklist for Future AI Agents Extending This Code

Before writing code:
- [ ] Check `CONTEXT.md` for canonical terms (Pointcrawl, Sovereign Hub, Satellite Node, Granular Disposition `[S, E, C]`).
- [ ] Are you making modifications in `src/workstation/`? (Never edit `start.html` or `network/campaign_studio.html` directly).

During implementation:
- [ ] If you add a new node attribute, ensure it is preserved in:
  1. `state_adapter.js`: `initCanonicalState()` and `switchCampaign()`
  2. `state_adapter.js`: `syncActiveMapToRegistry()` and `switchActiveMap()`
  3. `stage_6_export.js`: `generateCampaignJSON()` and `importCampaignJSON()`
- [ ] If you add a text/lore field, call `attachWikiAutocomplete(textarea)` on it and call `buildWikiIndex()` upon change.
- [ ] If you modify canvas interactions, ensure middle-click drag, wheel zoom, node click, edge hitbox, and double-click portal navigation all stop propagation cleanly.

After implementation:
- [ ] Compile the suite:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
  ```
- [ ] Verify JavaScript syntax on the compiled output using Node.js:
  ```powershell
  node -e "const fs=require('fs');const h=fs.readFileSync('start.html','utf8');const r=/<script\b[^>]*>([\s\S]*?)<\/script>/gi;let m;while((m=r.exec(h))!==null){new Function(m[1]);}"
  ```
- [ ] Run mathematical simulation parity test:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\network\Run-NetworkEngine.ps1
  ```
- [ ] Verify the file opens cleanly in browser over `file:///`.
