---
id: SYS-START-01
title: "CAD Vector Drawing Shapes, Dynamic Canvas Layers & Multi-Entity Selection Engine"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: CAD Drawing Shapes, Layers & Selection Grouping"
grounded_prerequisites: ["docs/adr/0004-desktop-workstation-start-html.md", "docs/adr/0013-cad-drawing-shapes-layers-and-multi-entity-selection.md", "start.html"]
grounded_yields: ["CAD Vector Drawing Primitives", "Dynamic Canvas Layer Manager", "Multi-Entity Selection & Marquee Box", "AutoCAD Shared Property Grid Intersect"]
provides: ["Canvas: Drawing-Shapes", "Canvas: Layer-Stack", "Canvas: Multi-Selection", "PropertyGrid: Shared-Intersect"]
requires: ["Surface: start.html", "Engine: cad_canvas_renderer.js", "Engine: cad_interaction.js", "Engine: property_grid_inspector.js"]
standalone_fallback: "All pointcrawl nodes and edges render on default standard layers without vector shapes or batch editing."
---

# SYS-START-01: CAD Vector Drawing Shapes, Dynamic Canvas Layers & Multi-Entity Selection Engine
*Category: system_architecture | Target Surface: `start.html`*  
*Status: shipped*  
*Authority: [ADR-0013](docs/adr/0013-cad-drawing-shapes-layers-and-multi-entity-selection.md), [CONTEXT.md](CONTEXT.md)*

---

## 1. Problem Statement & Scope
As campaigns scale in complexity, authors and GMs need to author territorial zones, tactical room perimeters, and environmental hazards alongside pointcrawl nodes. Currently, pointcrawl nodes and edges exist on a flat canvas without vector shape drawing, custom layer management, or multi-object selection.

This ticket implements an AutoCAD / MS Paint-inspired vector drawing and selection engine inside `start.html`:
1. **Vector Drawing Primitives**: Interactive MS Paint-style click-and-drag drawing of Rectangles, Circles/Ellipses, and Lines/Arrows with fill/stroke colors, opacity, labels, and 8-point resize handles.
2. **Dynamic Canvas Layers**: Per-map layer management with visibility (`👁️`), lock (`🔒`), and z-index reordering.
3. **Multi-Entity Selection**: `Shift+Click` toggle, `Ctrl+Click` type-selection (select all of same type), canvas background marquee box selection, and collective translation drag.
4. **AutoCAD Shared Property Grid**: Intersection of shared attributes across multi-selection with `*VARIES*` support for bulk attribute edits.

---

## 2. Technical Acceptance Criteria

### Sprint 1: Data Model, Per-Map Topology Storage & Dynamic Layer Manager
- Every map topology in `topo.layers` maintains an array of `CanvasLayer` objects with default layers (`layer-bg`, `layer-drawings`, `layer-roads`, `layer-hegemony`, `layer-nodes`, `layer-annotations`).
- Every entity (Node, Edge, Shape) maintains a `layerId` property.
- Win95 Layers Pane in `start.html` (accessible via View menu and HUD) supporting Add Layer, Delete Layer, rename, visibility toggle, lock toggle, and opacity adjustment.
- Zero-CORS backward compatibility: older campaigns without `layers` automatically receive default layers upon loading.

### Sprint 2: MS Paint-Style Vector Drawing Tools & Shape Primitives
- Toolbox palette additions: `[Box]` (`R`), `[Circle]` (`C`), `[Line]` (`W`).
- Click-and-drag creation with live SVG rubber-band preview in `interaction-layer`.
- Shapes serialize into `topo.shapes` with unique ID, name, layerId, coordinates, fill/stroke colors, strokeWidth, and opacity.
- Dedicated `<g id="shapes-layer">` rendering shapes in z-index order with layer opacity/visibility cascades.

### Sprint 3: Selection Engine (Shift-Click, Ctrl-Click Type-Select, Marquee Box, Drag/Resize)
- `Workstation.selectedEntities` multi-selection state with single `selectedEntity` alias.
- `Shift+Click`: Toggles clicked item in/out of selection.
- `Ctrl+Click`: Selects all entities of the same primitive type on active map.
- Canvas background marquee drag: AutoCAD crossing/window selection box.
- Collective drag: Moving any selected entity translates all selected entities by $(\Delta x, \Delta y)$.
- 8-point resize handles on selected shapes.

### Sprint 4: AutoCAD Shared Property Grid (`*VARIES*`) & Batch Editing
- When `selectedEntities.length > 1`, Property Grid calculates common attribute intersect (`layerId`, `color`, `opacity`, `visible`, `locked`).
- Differing values display `*VARIES*`. Modifying any property immediately updates all selected entities.
- Object selector dropdown reflects `[Multiple Objects Selected (N)]`.
- Full regression verification: `Test-Suite.ps1` 100% pass across all 5 phases.
