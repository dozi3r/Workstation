# ADR 0020: Scale-Fluid Edge Explorer and Multi-Scale Conduit Catalog

## Status
Accepted (2026-10-31)

## Context
In Creator Studio's pointcrawl CAD architecture, spatial corridors and hegemony conduits connect locations, shape logistical flows, and exert political influence across worldbuilding pipeline tiers. However, prior to this architectural upgrade, edges lacked parity with other campaign primitives:
1. **First-Class Citizen Parity Deficit**: While Nodes (`Ctrl+F10`), NPCs (`Ctrl+F5`), Quests (`Ctrl+F6`), Items (`Ctrl+F7`), and Threat Clocks (`Ctrl+F9`) were accessible and inspectable within the Universal Campaign Entity Manager (`#modal-entity-manager`), edges had no dedicated management tab or catalog view. Users could only interact with edges by clicking thin SVG lines on the CAD canvas.
2. **Scale-Fluidity Blindspot**: Pointcrawl graphs frequently branch across hierarchical nested child maps (`childMapId` portals). Without an aggregated edge explorer, authors could not audit inter-settlement roads, subterranean conduits, or regional supply chains spanning child maps without manually opening and traversing every submap individually.
3. **Risk of Primitive Contamination**: Initial proposals suggested adding a third topological primitive (`resource`) alongside `road` and `hegemony`. This violated the mathematical integrity of the pointcrawl graph: resource logistics, power lines, pipelines, and supply convoys are attributes and flows carried by physical corridors or political hegemony, not independent topological entities.
4. **Redundant Property Grid Proliferation**: Previous naive implementations duplicated 300+ lines of ad-hoc HTML input fields in modal dialogs rather than mounting the authoritative, 18-category `PropertyGridInspector`.
5. **Mutation Lifecycle & Undo Restitution**: In `cad_interaction.js`, edge creation and deletion mutated topological adjacency arrays without capturing pre-mutation snapshots in `pushHistoryState`, causing CAD Undo (`Ctrl+Z`) to restore post-mutation states. Furthermore, edge deletion left orphaned metadata in `topo.edgeNotes`.

## Decision

### 1. Dual Topological Primitive Invariant
Creator Studio strictly preserves two mathematical pointcrawl primitives:
- **Transit Road (`road`)**: Unordered node pair `(u, v)` stored bidirectionally in `u.adj` and `v.adj`. Represents physical roads, trails, tunnels, sea lanes, and transit corridors.
- **Hegemonic Vector (`hegemony`)**: Directed edge `u -> v` stored in target node's `v.infBy` array. Represents political domination, cultural hegemony, garrison projection, and jurisdictional tribute.
- **Conduits as Logistical Attributes**: Logistics flows, aqueducts, mana conduits, ley lines, and dedicated bandwidth are attributes stored in `topo.edgeData[edgeKey]` (`conduitType`, `dedicatedFlows`, `capacity`, `hazardLevel`, `modules`), preserving pure graph topology.

### 2. Multi-Scale Edge Aggregation & Deduplication
`src/workstation/scripts/entity_manager_ui.js` introduces `getEdgesForMapScope(scope)`:
- **Canonical Deduplication**: For undirected transit roads, edges traversed from `u -> v` and `v -> u` are unified into a single canonical edge with `pairKey = [u, v].sort().join('-')` and `isDirectional: false`.
- **Directional Preservation**: Hegemony vectors preserve explicit orientation `edgeKey = "${srcId}->${targetId}"` with `isDirectional: true`.
- **Heterogeneous Child Map Schema Support**: Robustly handles both legacy dictionary maps (`m.nodes = { id: ... }`) and array-based maps (`m.nodes = [ ... ]`), calculating Euclidean lengths and resolving node names without throwing ReferenceErrors.

### 3. Reusable Property Grid Mounting
Rather than creating separate property forms, `src/workstation/scripts/property_grid_inspector.js` exports `renderEdgeProperties(targetTbody, edgeItem, topo)`.
- The Entity Manager's Edge detail pane features a dual-subtab layout:
  - **Subtab 1 (Telemetry & Links)**: Overview header, endpoint cultures, corridor distance, hazard roller launcher (`openCorridorHazardDialog`), slotted modules, and focus/delete actions.
  - **Subtab 2 (Properties Grid)**: Mounts the authoritative 18-category AutoCAD-style property grid, enabling immediate editing of layers, line styling, conduits, dedicated flows, tolls, party rapport, and backlink tags.

### 4. Non-Orphaning History & Edge Notes Cleanup
In `src/workstation/scripts/cad_interaction.js`:
- `createEdge(uId, vId, edgeType)` calls `pushHistoryState` *before* mutating adjacency lists, ensuring lossless CAD undo restitution.
- `deleteEdge(uId, vId, edgeType)` pushes history before mutation and purges both directed `edgeKey` and undirected `pairKey` entries from `topo.edgeData` and `topo.edgeNotes`.

### 5. Windows 95 Desktop Integration & Hotkey
- **MDI Hotkey**: `Ctrl+F11` is registered in `mdi_window_manager.js` adjacent to `Ctrl+F10` (Node Explorer).
- **Navigation Surfaces**: Added to `View -> Edge Explorer... (Ctrl+F11)`, `Tools -> Edge Explorer (Ctrl+F11)`, Win95 Start Menu, and CAD top toolbar button `[Edges]`.
- **Canvas Centering & Jump**: `jumpToEdgeMap(mapId, edgeKey, uId, vId, edgeType)` centers the CAD viewport at the corridor midpoint `((u.x + v.x)/2, (u.y + v.y)/2)` and selects the corridor.

## Consequences

### Positive
- Full parity across all campaign entities: Nodes, Edges, NPCs, Quests, Items, Threat Clocks, and Sourcebooks.
- Zero code duplication between Entity Manager and CAD canvas inspector.
- Complete scale-fluid visibility into corridors and conduits across complex multi-map campaigns.
- Rock-solid Undo/Redo stability during edge drafting.
- Zero-CORS offline execution preserved without external dependencies.

### Negative / Trade-offs
- The Entity Manager tab row accommodates one additional button (`Edges & Conduits`), requiring responsive flex wrapping on narrow 800x600 viewports.
