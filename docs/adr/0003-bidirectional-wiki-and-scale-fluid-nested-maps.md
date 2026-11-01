# 0003: Bidirectional Wiki Engine and Scale-Fluid Hierarchical Cartography

## Context
Campaigns authoring in Creator Studio previously operated on a flat, single-canvas pointcrawl graph (`nodes[]`, `links[]`, and a single background image). While effective for isolated regional balancing, real tabletop campaigns develop at drastically different scales and stages of completion:
1. **Scale Disparity**: Some campaigns begin at the continental or provincial level with cities and wilderness; others begin as a single structure or tactical floorplan (e.g., *Krak des Chevaliers*, a roadside tavern, an isolated crypt) with the surrounding world completely unsettled.
2. **Encyclopedic Fragmentation**: Rich worldbuilding lore, module dossiers, and corridor encounter prompts lived in isolated text fields without automated cross-referencing, leading to manual citation overhead and broken setting continuity.

To match modern campaign authoring workstations (e.g., World Anvil) while strictly honoring our **Zero-CORS offline execution invariant (`file:///`)**, we required:
- A recursive, scale-fluid cartographic tree supporting both top-down and bottom-up workflows.
- A client-side, zero-dependency bidirectional wiki engine with `@mentions`, `[[wikilinks]]`, and reactive backlink indexing.

---

## Decisions

### 1. The Scale-Fluid Principle (Scale-Agnostic Pointcrawls)
We reject rigid, top-down-only cartographic hierarchies (e.g., enforcing `World -> Region -> Settlement -> Building`). Instead:
- Any pointcrawl map can serve as an independent root or standalone canvas.
- Scale tiers (`cosmic`, `continent`, `region`, `settlement`, `district`, `building`, `floorplan`) are descriptive, malleable attributes rather than rigid database constraints.
- Maps support bidirectional parenting:
  - **Top-Down**: Creating a child sub-map directly from an existing node.
  - **Bottom-Up**: Authoring a building first, then later generating an outer region and reparenting the building to a newly placed node.
  - **Lateral**: Re-organizing or detaching sub-maps into standalone root maps at will.

### 2. State Encapsulation: The Global Unpack/Pack Adapter
To preserve mathematical parity and prevent refactoring 15,000+ lines of balancing, smothering, and simulation logic across `stage_4_balancing.js`, `stage_2_waves.js`, `faction_manager.js`, and `Run-NetworkEngine.ps1`:
- Active global variables (`nodes`, `links`, `waves`, `drawnCards`, `sovereignHubs`, `smotheredNodes`, `nodeSlottedModules`, `edgeSlottedModules`, `revealedNodes`, `activeMapMetadata`) remain the primary runtime interface.
- A master registry `maps: { [mapId]: MapData }` stores all maps in the campaign.
- `syncActiveMapToRegistry()` packs live globals into `maps[activeMapId]`.
- `switchActiveMap(targetMapId)` synchronizes the current map, swaps the context, re-hydrates globals with the target map's dataset, loads its image from IndexedDB, and recalculates balancing in sub-millisecond time.

### 3. Multi-Asset Offline Persistence in IndexedDB
We updated `map_store.js` database schema to version 2:
- Map images are keyed by `id: mapId` inside `CreatorStudioMapDB`.
- Legacy `id: "active_map"` is maintained as a transparent fallback to guarantee 100% backwards compatibility for existing user databases.
- Lightweight metadata is cached in `localStorage` (`cs_maps_meta_catalog`) to permit instant tree rendering without loading heavy binary data URLs into memory.

### 4. Client-Side Inverted Index & Token Grammar
We introduced `wiki_engine.js`:
- Token Grammar:
  - `[[Node:id]]` or `[[Node:mapId/id]]` or `[[Node:Name]]`
  - `[[Map:mapId]]`
  - `[[Mod:modId]]`
  - `[[Faction:factionId]]`
  - `[[Corridor:from-to]]`
  - Natural `@EntityName` mentions
- `buildWikiIndex()` maintains a reactive inverted index (`wikiIndex: { [targetKey]: Array<sourceMetadata> }`).
- Textareas dynamically attach a floating, keyboard-navigable autocomplete popover on `@` or `[[`.
- Rendered text transforms tokens into interactive pills with hovercards (`showWikiHovercard`) and deep cross-map navigation (`navigateToWikiEntity`).

### 5. Canvas Drill-Down & Visual Grammar
- Nodes with an attached child map display a concentric pulsating cyan portal ring and a scale-tier glyph (`n.childMapId`).
- Double-clicking the node (or clicking "Enter Sub-Map" in the inspector) initiates drill-down navigation.
- The `Escape` key and breadcrumb HUD allow instant one-click ascent to parent maps.

---

## Consequences

- **100% Offline Zero-CORS Preserved**: No servers, no CDNs, no external APIs.
- **Mathematical Parity Maintained**: Sovereign hub election and smothering algorithms in `Run-NetworkEngine.ps1` and `campaign_studio.html` continue to match identically.
- **Seamless Upgrade Path**: Legacy single-map JSON files automatically upgrade to hierarchical multi-map structures (`maps["map_root"]`) upon import with zero data loss.
- **Deep Encyclopedic Cohesion**: Users can click a lore citation in a dungeon floorplan and immediately have the canvas navigate to a distant continental node.
