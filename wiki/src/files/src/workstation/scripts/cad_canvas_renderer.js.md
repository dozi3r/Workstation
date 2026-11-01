---
file_path: "src/workstation/scripts/cad_canvas_renderer.js"
title: "cad_canvas_renderer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "e25d4c217c43b2a9"
reviewed_hash: "e25d4c217c43b2a9"
stale: false
size_bytes: 66265
line_count: 1335
---

# cad_canvas_renderer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/cad_canvas_renderer.js` implements the high-performance SVG pointcrawl CAD rendering engine for Creator Studio. It transforms graph topologies, geometric coordinates, and multi-scale hierarchy trees into visual vector graphics with sub-pixel precision.

### Core Subsystems & Responsibilities
- **Geometric Vector Math**: Generates multi-point SVG polygon and star geometry (`computeStarPoints`, `computePolygonPoints`) for varying node tier shapes and cultural quadrant markers.
- **AutoCAD Color Standard (ACI 1-9)**: Defines canonical CAD layer palette indexing (`AUTOCAD_COLORS`) and cultural quadrant color mapping.
- **Player Visibility & Fog-of-War (FoW)**: Manages concealment thresholds, GM vision overrides (`toggleGmVision`), and hidden node indicators.
- **CAD Drawing Shapes & Grip Handles**: Renders `topo.shapes` into `#drawings-layer` across rectangle, circle/ellipse, and vector line primitives (`renderShapeSvgElement`) with stroke styling (solid, dashed, dotted), layer/shape opacity blending, and 4/2-point CAD grip handles when selected.
- **Cartographic Elements & Badging**: Renders transit corridors (E_adj), cubic Bezier hegemony influence curves (E_inf), corridor module/flow badges (`M:x F:y`), portal indicator rings, position lock badges (`lockAllNodes`), node telemetry badges (`M`, `P`, `R`/`⚠️R`, `N`, `Q`, `I`, `T`), crisis state alerts, and draggable threat clock overlay callouts.
- **Background Map Canvas Integration**: Dynamically binds and projects raster map backgrounds onto `#canvas-bg-image` from active metadata (`dataUrl` or `url`), supporting opacity blending and layer toggles without canvas flickering.
- **Recursive Sub-Map Entity Aggregation**: Resolves effective stationed items and entities across nested portal sub-maps (`getItemEffectiveNodeId`, `getRecursiveNodeEntities`, `traverseSubmap`).
<!-- END_CUSTOM_NOTES -->
