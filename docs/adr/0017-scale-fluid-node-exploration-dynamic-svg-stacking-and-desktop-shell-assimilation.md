# ADR 0017: Scale-Fluid Node Exploration, Dynamic SVG Stacking, and Desktop Shell Assimilation

## Status
Accepted (2026-10-31)

## Context
Following the Workstation 2.5 architecture unification (ADR 0016), six subsystem capabilities required stabilization and architectural alignment to match the multi-scale, scale-fluid, and dual-runtime standards of the workstation:

1. **Node Explorer Isolation**: The Node Explorer (`src/workstation/scripts/entity_manager_ui.js`) was originally implemented for a single flat pointcrawl network. With the advent of nested scale-fluid submaps (ADR 0003, ADR 0015), the explorer only iterated over `Workstation.activeTopology.nodes`, blinding authors to locations, hazards, and entities stationed in child maps. Furthermore, its detail pane rendered a redundant, partial property form rather than embedding the authoritative `PropertyGridInspector`.
2. **Static Canvas DOM Layer Ordering**: While `layer_manager.js` maintained layer records with explicit `zIndex` sorting, `cad_canvas_renderer.js` rendered SVG elements into hardcoded, static DOM groups (`#grid-layer`, `#drawings-layer`, `#edges-layer`, `#nodes-layer`, `#corridor-labels-layer`). Consequently, moving a custom drawing or zone layer above nodes in the Layer Manager had no visual effect on canvas stacking order.
3. **Decoupled Edge Layer Visibility**: Topological nodes respected `node.layerId` visibility, but transit road corridors (`u.adj`) and hegemony conduits (`u.infBy`) only evaluated global layer toggles. Assigning an edge to a custom layer failed to hide the edge when that layer was toggled off. Moreover, hiding a node's layer left connected road corridors dangling into invisible coordinates.
4. **CAD Shape Typography Deficit**: Rectangles and circles drawn with CAD tools lacked integrated text labeling. Authors were forced to manually position separate floating text objects, which failed to move, resize, or scale with their parent shapes.
5. **Fragmented Administrative Surfaces**: Standalone analytical and visualizer surfaces (`network/platform_audit_dashboard.html`, `network/odv_archetype_matrix.html`, `regions/regional_image_browser.html`, `tickets/unified_ticket_tracker.html`, `tickets/tier_0/tier_0_project_visualizer.html`, and `wiki/index.html`) required opening detached HTML files. This fragmented the user experience and broke the Windows 95 MDI desktop immersion.
6. **Muddled Sourcebook vs. Mod Taxonomy**: The UI conflated **Campaign Sourcebooks** (data packages containing modules and topologies) with **Workstation Mods** (code extensions), displaying hardcoded strings like "5 Sourcebook Packages" and confusing empty states.

## Decision

### 1. Scale-Fluid Hierarchical Node Explorer
- **Multi-Map Aggregator**: `entity_manager_ui.js` introduces `getAllCampaignNodes(scope)` supporting three scopes: `active` (current map only), `all` (root and all recursive submaps), or specific map IDs.
- **Hierarchical Breadcrumbs & Scoped IDs**: Submap nodes display composite identifiers (e.g. `[Outpost Interior] #2: Barracks`) and hierarchical breadcrumbs (`Emerald Isle > Harbor > Barracks`). Double-clicking navigates the canvas directly into that submap.
- **Property Grid Mounting**: Selecting a node in the explorer mounts the authoritative `PropertyGridInspector` inside the right pane of the window, providing immediate access to demographics tags, party rapport stance, slotted modules, and backlink citations.

### 2. Dynamic SVG Layer Container Stacking
- The canvas renderer dynamically generates and manages SVG `<g id="svg-layer-${layer.id}">` containers for every layer defined in `getTopologyLayers(topo)`.
- Layer containers are strictly sorted in the SVG DOM by `layer.zIndex` ascending (bottom-to-top).
- Any drawing shape, transit road, node, or annotation assigned to a layer (`element.layerId`) is rendered inside that layer's container. Reordering layers in the Layer Manager immediately updates visual draw order on the canvas.

### 3. Compound Edge Visibility Cascade
- An edge's visibility is governed by compound logic:
  `isVisible = isEdgeLayerVisible && isEndpointNodeLayerVisible(u) && isEndpointNodeLayerVisible(v) && (!isExplicitHidden || Workstation.showGmVision)`
- If a custom layer assigned to an edge is hidden, the edge line, hitbox, and corridor badge are suppressed.
- If either connected endpoint node's layer is hidden, the edge is automatically suppressed, preventing dangling corridors.

### 4. Shape-Integrated Typography & Algorithmic Auto-Shrinking
- Rectangles and circles support first-class `text`, `textColor`, and `fontSize` properties.
- Text is rendered natively inside the shape using SVG `<text>` elements centered at `(cx, cy)` with `text-anchor="middle"` and `dominant-baseline="central"`.
- Typography employs an auto-shrink algorithm: when text width exceeds available bounding dimensions (`availWidth = shape.width * 0.88`), font size is dynamically scaled down to fit (clamped to a readable minimum of 8px) with multi-line wrapping if height permits.

### 5. Windows 95 Desktop Shell Assimilation
- The Windows 95 Start Menu (`#win95-start-menu`) is upgraded with cascading flyout submenus (`Programs`, `Documents`, `Settings`, `Shut Down`).
- All standalone HTML tools are integrated as first-class MDI windows managed by `MDIWindowManager`.
- Each assimilated window features standard Win95 window chrome, minimizes to the bottom taskbar, restores on click, and maintains full zero-CORS offline execution via iframe sandboxing or direct module rendering.

### 6. Disentangled Package & Mod Taxonomy
- **Campaign Sourcebooks**: Renamed menu items to `Campaign Packages & Sourcebooks...` and updated `modal-sourcebooks` to display discovered disk campaigns and active campaign packages with a "Create New Package" action.
- **Workstation Mods**: Replaced empty states with a retro Win95 guidance panel explaining the `/mods/<mod-id>/mod.js` directory convention and linking to the Mod SDK documentation.

## Consequences

### Positive
- GMs and worldbuilders gain instant visibility into all nodes and entities across nested cartographic scales.
- Visual draw order on the canvas strictly obeys author-configured layer z-indexes.
- Dangling road corridors and broken visuals from partially hidden layers are eliminated.
- CAD shapes have professional, auto-scaling labels that export cleanly to SVG.
- The entire tool suite operates seamlessly from a single desktop shell without context switching across multiple browser tabs.
- Clean separation between campaign content (sourcebooks) and functional extensions (mods).

### Negative / Trade-offs
- Embedded MDI visualizers running inside iframes require coordinated window resize events to recalculate internal responsive layouts.
- Dynamic SVG layer container sorting requires wiping and re-assembling layer groups during full canvas redraws.
