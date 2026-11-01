---
file_path: "docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md"
title: "0003: Bidirectional Wiki Engine and Scale-Fluid Hierarchical Cartography"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "619bca9fdc43b7df"
reviewed_hash: "619bca9fdc43b7df"
stale: false
size_bytes: 5069
line_count: 64
---

# 0003: Bidirectional Wiki Engine and Scale-Fluid Hierarchical Cartography

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md` (**ADR-0003**) is the **Architectural Decision Record Governing Multi-Scale Hierarchical Pointcrawls, Global State Swapping, IndexedDB v2 Persistence, and Bidirectional Wiki Indexing** within **Volume I: System Architecture, Governance & Ontology**. It documents how Creator Studio evolved from a single flat canvas into a recursive, scale-fluid cartographic tree with an integrated client-side wiki lexer (`wiki_engine.js`) and codebase encyclopedia (`wiki/build_wiki.js`), while preserving 100% Zero-CORS `file:///` execution and mathematical parity with [[File:network/Run-NetworkEngine.ps1]].

It is the primary authority for [[Series:series_b_scale_fluid_nested_cartography]] and [[File:docs/AI_DEVELOPER_GUIDE.md]].

---

## Core Invariants & The 5 Architectural Decisions
1. **The Scale-Fluid Principle (Scale-Agnostic Pointcrawls)**:
   - Rejects rigid top-down-only hierarchies (`World -> Region -> City -> Dungeon`). Any pointcrawl map can act as a standalone root, be attached as a child map to a Portal Node (`node.childMapId`), or be reparented (`reparentMap()`) at any time.
   - Defines 7 descriptive `SCALE_TIERS` in [[File:src/campaign_studio/scripts/state.js]]: `cosmic`, `continent`, `region`, `settlement`, `district`, `building`, and `floorplan`.
2. **State Encapsulation via the Global Unpack/Pack Adapter**:
   - Preserves existing runtime globals (`nodes`, `links`, `waves`, `drawnCards`, `sovereignHubs`, `smotheredNodes`, `nodeSlottedModules`, `edgeSlottedModules`, `revealedNodes`, `activeMapMetadata`) so [[File:src/campaign_studio/scripts/stage_4_balancing.js]], [[File:src/campaign_studio/scripts/stage_2_waves.js]], and [[File:src/campaign_studio/scripts/faction_manager.js]] require zero nested-path refactoring.
   - `syncActiveMapToRegistry()` packs live globals into `maps[activeMapId]`; `switchActiveMap(targetMapId)` swaps context, re-hydrates globals, loads the map raster from IndexedDB, and recalculates balancing in sub-millisecond time.
3. **Multi-Asset Offline Persistence in IndexedDB v2 (`map_store.js`)**:
   - Upgrades `CreatorStudioMapDB` to schema version `2` in [[File:src/campaign_studio/scripts/map_store.js]], keying raster backgrounds by `id: mapId` while mirroring `map_root` to legacy `id: "active_map"` and caching lightweight metadata in `localStorage` (`cs_maps_meta_catalog`).
4. **Client-Side Inverted Index & Token Grammar (`wiki_engine.js`)**:
   - Implements reactive parsing for `[[Node:id]]`, `[[Node:mapId/id]]`, `[[Map:mapId]]`, `[[Mod:modId]]`, `[[Faction:factionId]]`, `[[Corridor:from-to]]`, and natural `@EntityName` mentions in [[File:src/campaign_studio/scripts/wiki_engine.js]].
   - `buildWikiIndex()` builds the inverted backlink index (`wikiIndex`), powers keyboard-navigable autocomplete popovers (`attachWikiAutocomplete`), renders floating hovercards (`showWikiHovercard`), and executes cross-map drill-down (`navigateToWikiEntity`).
5. **Canvas Portal Visual Grammar (`canvas_engine.js`)**:
   - Nodes with `childMapId` render a concentric pulsating cyan portal ring and scale-tier glyph in [[File:src/campaign_studio/scripts/canvas_engine.js]], supporting double-click drill-down and `Escape` key / breadcrumb HUD (`#canvas-breadcrumbs-hud` in [[File:src/campaign_studio/scripts/map_navigator.js]]) ascent.

---

## Data Flow & Backwards Compatibility Pipeline
- **Single-to-Multi-Map Upgrade Seam**: When importing a legacy single-map JSON file in [[File:src/campaign_studio/scripts/stage_6_export.js]] (`importCampaignJSON`), the engine transparently wraps top-level `nodes` and `links` into `maps["map_root"]` with `rootMapId = "map_root"` and `activeMapId = "map_root"`, ensuring zero breaking changes for older saved campaigns.

---

## AI Agent Maintenance Checklist
- **Before modifying state management, canvas navigation, or wiki citations**: Read `docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md` alongside [[File:docs/AI_DEVELOPER_GUIDE.md]] and [[Series:series_b_scale_fluid_nested_cartography]].
- **When extending `wiki_engine.js` or `wiki/build_wiki.js`**: Ensure both the in-app campaign lore wiki (`wiki_engine.js`) and the repository codebase wiki (`wiki/build_wiki.js`) remain 100% offline and zero-CORS compliant.
<!-- END_CUSTOM_NOTES -->
