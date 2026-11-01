# ADR 0013: CAD Vector Drawing Shapes, Dynamic Canvas Layers, and Multi-Entity Selection Engine

## Status
Accepted (2026-10-21)

## Context
As Creator Studio's desktop workstation (`start.html`) evolves into a full-featured tabletop campaign authoring environment, authors and Game Masters need more than bare pointcrawl graphs:
1. **Spatial & Architectural Zoning**: Worldbuilders need to sketch room outlines, hazard zones, territorial borders, and boundary perimeters directly onto the canvas alongside pointcrawl nodes, giving them custom colors, opacity, labels, and the ability to reposition them.
2. **Layer Organization (AutoCAD Parity)**: Campaigns with multiple map scales (continents down to tactical dungeons) require structural separation of background imagery, transit networks, political influence vectors, topological settlements, and annotation drawings. Hiding or locking a layer must instantly cascade to all entities assigned to it.
3. **Multi-Entity Selection & Batch Property Editing**: Modifying large networks one node or shape at a time is tedious. Authors require standard CAD selection gestures:
   - `Shift+Click` to add or remove individual items from a selection set.
   - `Ctrl+Click` to instantly select all entities of the same primitive type (e.g., all Nodes, all Transit Roads, or all Rectangles).
   - Canvas background marquee drag (window/crossing selection) to box-select a cluster of entities.
   - When multiple entities are selected, the Property Grid must display their shared attributes (Layer, Color, Opacity, Visibility, Locked), show `*VARIES*` for conflicting values, and propagate changes across the entire selection set in a single action.

## Decision
1. **Drawn Shape Entities (`DrawingEntity`)**:
   - Each active map topology maintains a `topo.shapes` collection.
   - Initial supported primitives: **Rectangle**, **Circle/Ellipse**, and **Straight Line / Arrow**.
   - Shape data schema:
     ```typescript
     interface DrawingEntity {
       id: string;          // e.g. "shape-1729519200000"
       type: 'rect' | 'circle' | 'line';
       name: string;        // e.g. "Quarantine Perimeter"
       layerId: string;     // Reference to parent CanvasLayer
       x: number;           // Top-left or center X
       y: number;           // Top-left or center Y
       width?: number;      // For rect
       height?: number;     // For rect
       radius?: number;     // For circle
       x2?: number;         // For line endpoint
       y2?: number;         // For line endpoint
       fillColor: string;   // Hex / AutoCAD ACI / "none"
       strokeColor: string; // Hex / AutoCAD ACI
       strokeWidth: number; // In canvas units
       strokeDash?: string; // "solid" | "dashed" | "dotted"
       opacity: number;     // 0.0 - 1.0
       visible: boolean;
       locked: boolean;
     }
     ```
   - Interaction: MS Paint-style click-and-drag creation via Toolbox buttons (`[Box]`, `[Circle]`, `[Line]`) with live SVG rubber-band preview in `interaction-layer`. Commits on mouse up, switching back to Select tool.
   - Canvas manipulation: Direct drag-to-move for selected shapes, plus 8-point bounding box resize handles.

2. **Per-Map Dynamic CAD Layers (`CanvasLayer`)**:
   - Each active map topology maintains `topo.layers`:
     ```typescript
     interface CanvasLayer {
       id: string;          // e.g. "layer-nodes"
       name: string;        // e.g. "Topological Nodes"
       zIndex: number;      // Ordering index (0 = bottom)
       visible: boolean;    // Hides/reveals all assigned entities
       locked: boolean;     // Prevents selection/drag for assigned entities
       opacity: number;     // Layer-wide opacity multiplier (0.0 - 1.0)
     }
     ```
   - Default initial layers for every map:
     - `layer-bg`: Background Imagery & Grid (`zIndex: 0`)
     - `layer-drawings`: CAD Drawing Shapes (`zIndex: 1`)
     - `layer-roads`: Transit Corridors $E_{adj}$ (`zIndex: 2`)
     - `layer-hegemony`: Hegemonic Conduits $E_{inf}$ (`zIndex: 3`)
     - `layer-nodes`: Topological Nodes $V$ (`zIndex: 4`)
     - `layer-annotations`: Threat Clocks, Labels & Telemetry (`zIndex: 5`)
   - Every canvas entity (Node, Edge, Drawing Shape) has a `layerId` property, default-bound to its respective standard layer, but reassignable to any custom user layer via the Property Grid.
   - UI: A dedicated Win95 Layers Pane allowing creation, renaming, reordering, visibility toggle (`👁️`), lock toggle (`🔒`), and opacity adjustment.

3. **Multi-Entity Selection Set & Type-Select**:
   - Workstation state maintains `Workstation.selectedEntities: Array<{ type: 'node'|'edge'|'shape', id: string, ... }>` (with backward-compatible single `Workstation.selectedEntity` alias).
   - **Shift+Click**: Toggles single clicked entity in/out of the active selection set.
   - **Ctrl+Click**: Type-Selects all entities sharing the clicked entity's primitive type on the active map.
   - **Marquee Selection Box**: Clicking and dragging on the background canvas draws an AutoCAD-style crossing rectangle. Releasing selects all entities intersecting or contained inside the box.
   - **Group Drag**: Dragging any selected entity translates all currently selected entities by the same $(\Delta x, \Delta y)$ delta.

4. **Shared Property Intersection (`*VARIES*`)**:
   - When `selectedEntities.length > 1`, `updatePropertiesGrid()` calculates the intersection of shared attributes: `layerId`, `color`, `opacity`, `visible`, `locked`.
   - If values differ across the selection, the cell renders `*VARIES*`.
   - Modifying any property in the grid immediately applies the new value across all selected entities, updates `activeTopology`, and saves state.

## Consequences
- Worldbuilders can author rich tactical maps, hazard perimeters, and faction zones with immediate visual feedback without leaving Creator Studio.
- Multi-selection transforms large-scale map editing from a repetitive chore into rapid bulk adjustments.
- Total zero-CORS compliance is preserved: layers and shapes serialize directly into the campaign JSON/archive package with 100% backward compatibility.
