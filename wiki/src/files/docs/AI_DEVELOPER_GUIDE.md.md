---
file_path: "docs/AI_DEVELOPER_GUIDE.md"
title: "AI Developer Guide: Creator Studio Architecture & Operations"
volume: "vol-1"
kind: "Technical Documentation / Guide"
current_hash: "663fce57e4320ac8"
reviewed_hash: "663fce57e4320ac8"
stale: false
size_bytes: 13606
line_count: 226
---

# AI Developer Guide: Creator Studio Architecture & Operations

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/AI_DEVELOPER_GUIDE.md` is the **Authoritative Engineering Manual for Autonomous AI Agents & Human Developers** within **Volume I: System Architecture, Governance & Ontology**. While [[File:AGENTS.md]] serves as the concise root router, `docs/AI_DEVELOPER_GUIDE.md` provides the deep technical specification for modifying the modular Workstation codebase (`src/workstation/`), governing the **Scale-Fluid Hierarchical Cartography** engine, the **Global State Swap Adapter**, the **In-App Bidirectional Wiki & Citation Lexer**, and **IndexedDB Multi-Map Persistence**.

It is a core authority for [[Series:series_b_scale_fluid_nested_cartography]] and [[Series:series_e_zero_cors_compiler_and_agent_router]].

---

## Core Invariants & Architectural Contracts
- **1. Modular Source Invariant (`src/workstation/`)**: Never edit [[File:start.html]] directly. All feature work must target the modular scripts inside [[File:src/workstation/template.html]] and `src/workstation/scripts/*.js`, followed by executing [[File:Build-Suite.ps1]].
- **2. The Global State Swap Pattern (`state_adapter.js`)**:
  - Live global variables (`nodes`, `links`, `waves`, `drawnCards`, `sovereignHubs`, `sovereignHubTarget`, `smotheredNodes`, `nodeSlottedModules`, `edgeSlottedModules`, `revealedNodes`, `activeMapMetadata`) represent the **currently viewed map**.
  - `syncActiveMapToRegistry()` in [[File:src/workstation/scripts/state_adapter.js]] packs live globals into `maps[activeMapId]`.
  - `switchActiveMap(targetMapId)` synchronizes the outgoing map, swaps `activeMapId`, unpacks `maps[targetMapId]` into the live globals, loads the map raster from IndexedDB via [[File:src/workstation/scripts/map_store.js]], and triggers `recalculateBalancing()`, `renderCanvasGraph()`, `updateBreadcrumbsHUD()`, and `buildWikiIndex()`.
- **3. 7-Tier Scale-Fluid Cartography**: Any map can be a root map or attached as a child map (`node.childMapId = "map_id"`) across 7 descriptive tiers (`cosmic`, `continent`, `region`, `settlement`, `district`, `building`, `floorplan`), supporting top-down drill-down, bottom-up wrapping (`reparentMap()`), and lateral independence.
- **4. IndexedDB Schema v2 (`CreatorStudioMapDB`)**: Managed by [[File:src/workstation/scripts/map_store.js]], storing binary/DataURL raster backgrounds in object store `active_map` keyed by `id: mapId` (with transparent fallback to legacy key `"active_map"` for `map_root`).

---

## Data Flow & Subsystem Integration Matrix
`docs/AI_DEVELOPER_GUIDE.md` maps the collaboration across the modular Workstation source files:
- [[File:src/workstation/scripts/state_adapter.js]] — `SCALE_TIERS`, `maps` registry, `syncActiveMapToRegistry()`, `switchActiveMap()`, `createMap()`, `attachChildMapToNode()`, `reparentMap()`.
- [[File:src/workstation/scripts/map_store.js]] — `CreatorStudioMapDB` v2 IndexedDB persistence (`loadPersistedMapFromDB()`, `listPersistedMapsFromDB()`).
- [[File:src/workstation/scripts/map_navigator.js]] — Breadcrumb HUD (`#canvas-breadcrumbs-hud`) and Map Tree modal (`#map-navigator-modal`).
- [[File:src/workstation/scripts/wiki_engine.js]] — Token lexer (`[[Node:id]]`, `[[Node:mapId/id]]`, `[[Map:mapId]]`, `[[Mod:modId]]`, `[[Faction:id]]`, `[[Corridor:u-v]]`, `@EntityName`), `buildWikiIndex()`, `getBacklinksForEntity()`, and `attachWikiAutocomplete()`.
- [[File:src/workstation/scripts/canvas_hud.js]] — Concentric cyan portal ring rendering for nodes with `childMapId`, double-click drill-down, and `Escape` key parent ascent.
- [[File:src/workstation/scripts/entity_manager.js]] — Entity architecture (NPCs, quests, items, dials) stationed on active nodes.
- [[File:src/workstation/scripts/stage_6_export.js]] — Multi-map JSON preset serialization and transparent single-map legacy import upgrade.
- [[File:src/workstation/template.html]] — Master HTML shell containing `@@INCLUDE@@` and `@@INJECT@@` markers consumed by [[File:build_suite.js]].

---

## AI Agent Maintenance Checklist
- **When adding a new node or map property**: You MUST wire it into persistence seams:
  - `syncActiveMapToRegistry()` and `switchActiveMap()` in [[File:src/workstation/scripts/state_adapter.js]].
  - `generateCampaignJSON()` and `importCampaignJSON()` in [[File:src/workstation/scripts/stage_6_export.js]].
- **When adding a new lore or note `<textarea>`**: Call `attachWikiAutocomplete(textarea)` on initialization and invoke `buildWikiIndex()` on `input`/`change`.
- **Post-Build Verification**: Always run [[File:Build-Suite.ps1]], validate compiled JS syntax in [[File:start.html]] using Node's `new Function(...)`, and verify mathematical parity via [[File:mods/tarot_balancing/Run-NetworkEngine.ps1]].
<!-- END_CUSTOM_NOTES -->
