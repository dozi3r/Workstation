---
id: SYS-START-17
title: "IntelliCAD Layers Explorer & Deterministic SVG Stacking Order Engine"
pipeline_tier: 0
target_surface: "start.html"
status: ready
category: "system_architecture"
wave: "Workstation Architecture: CAD Core & Spatial Canvas"
grounded_prerequisites: ["docs/adr/0013-cad-drawing-shapes-layers-and-multi-entity-selection.md", "src/workstation/scripts/layer_manager.js", "src/workstation/template.html"]
grounded_yields: ["IntelliCAD Layers Explorer Window", "Deterministic DOM Stacking", "Layer Color & Opacity Overrides", "Draw Order Occlusion Prevention"]
provides: ["Workstation: IntelliCAD-Layers-Explorer", "CAD: SVG-Stacking-Engine"]
requires: ["Workstation: start.html", "State: activeTopology.layers"]
standalone_fallback: "Default canvas rendering with fixed layer ordering."
---
# SYS-START-17: IntelliCAD Layers Explorer & Deterministic SVG Stacking Order Engine
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-11-01*

## 1. Overview & Objective
Creator Studio features multi-layer vector canvas capabilities, but past implementations suffered from severe z-ordering and draw-order issues:
1. **Draw-Order Occlusion**: Dynamically re-ordering SVG child elements caused background vector rectangles to cover interactive node handles and corridor hitboxes.
2. **Toolbar Redundancy**: A top toolbar button labeled "Layers" was ineffective, while the actual functional controls lived inside the Right Dock Panel (`#dock-layers`) and Canvas HUD.
3. **Missing CAD Layer Controls**: Users require standard IntelliCAD/AutoCAD layer paradigms (Freeze/Thaw, Lock/Unlock, Layer Color Overrides, and Z-Stack Grouping).

Pending full redesign, the non-functional top toolbar button has been removed, retaining layer access via the Properties/Layers Dock tab. This ticket implements the authoritative IntelliCAD-style Layers Explorer.

---

## 2. Implementation Deliverables

### 2.1 Fixed DOM Stacking Hierarchy
To prevent background drawings from occluding interactive nodes or corridors, SVG `<g>` groups must strictly adhere to an immutable DOM hierarchy regardless of user layer creation:
```html
<svg id="cad-svg">
  <g id="map-bg-layer"></g>          <!-- 0: Map Image -->
  <g id="grid-layer"></g>            <!-- 1: Background Orthogonal Grid -->
  <g id="drawings-layer"></g>        <!-- 2: User CAD Vector Shapes -->
  <g id="edges-layer"></g>           <!-- 3: Transit Corridors & Conduits -->
  <g id="corridor-labels-layer"></g> <!-- 4: Distance & Transit Labels -->
  <g id="nodes-layer"></g>           <!-- 5: Spatial Pointcrawl Nodes -->
  <g id="portals-layer"></g>         <!-- 6: Scale-Fluid Portal Rings -->
  <g id="clocks-layer"></g>          <!-- 7: Active Threat Clocks -->
  <g id="interaction-layer"></g>     <!-- 8: Marquee Box & Drag Handles -->
</svg>
```

### 2.2 IntelliCAD Layers Explorer Modal (MDI Window)
Create a dedicated MDI dialog mirroring IntelliCAD layer tables:
- **Layer Name**: Editable string identifier.
- **Status**: On/Off (Eye icon), Freeze/Thaw (Snowflake icon), Lock/Unlock (Padlock icon).
- **Color Swatch**: Clickable hex picker overriding child entity strokes.
- **Entity Count**: Live count of nodes, shapes, and edges residing on this layer.

---

## 3. Acceptance Criteria
- [ ] Layer visibility, locking, and opacity changes reflect deterministically without SVG reordering bugs.
- [ ] Nodes and interactive drag handles remain clickable regardless of shape draw counts.
- [ ] IntelliCAD Layers Explorer MDI window syncs bidirectionally with the Dock panel and HUD buttons.
