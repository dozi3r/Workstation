---
file_path: "src/workstation/scripts/cad_interaction.js"
title: "cad_interaction.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "10f14d8c92efd8ff"
reviewed_hash: "10f14d8c92efd8ff"
stale: false
size_bytes: 138601
line_count: 3075
---

# cad_interaction.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/cad_interaction.js` encapsulates all canvas mouse, pointer, and keyboard tool gestures for the desktop CAD canvas. It coordinates active tool states, node positioning, viewport navigation, and structural topology graph mutations.

### Core Subsystems & Responsibilities
- **CAD Tool Palette Engine**: Manages active tool modes (`setTool`, `getToolKey`) including Select (`V`), Pan (`H`), Move (`M`), Tier 2 Settlement (`N`), Tier 3 Sovereign Hub (`A`), Transit Road (`L`), Hegemony Influence Vector (`I`), Box / Rectangle (`R`), Circle / Ellipse (`C`), Vector Line (`W`), and Erase (`E`).
- **Pointer & Drag Gestures**: Handles node drag-and-drop (`onNodeMouseDown`), threat clock callout displacement (`onClockCalloutMouseDown`), vector shape repositioning (`onShapeMouseDown`), canvas panning gestures, and edge connection dragging (`onCanvasMouseDown`, `onCanvasMouseMove`, `onCanvasMouseUp`).
- **Vector Drawing Tools & Rubber-Band Creation**: Implements click-and-drag shape creation with live SVG rubber-band preview in `#interaction-layer` (`renderShapeDrawPreview`, `clearShapeDrawPreview`), locked layer guarding, and automatic return to Select tool.
- **Viewport Pan & Cursor-Centered Deep Zoom**: Implements Photoshop-style cursor-centered zoom (`zoomIn`, `zoomOut`, `zoomAt`, `resetZoom`) with world coordinate invariance and zoom clamping (0.02x to 10.0x).
- **Drag-and-Drop File Import Shield**: Intercepts canvas drag-and-drop events (`dragenter`, `dragover`, `drop`) to shield against accidental browser file navigation while routing `.csmod` entity packs and campaign packages into the workstation importer pipeline.
- **Graph Topology Mutation**: Executes atomic node creation (`addNodeAt`), edge linking (`createEdge`), edge deletion (`deleteEdge`), node deletion with cascade modal integration (`deleteNode`), and manual coordinate precision input (`promptMoveNode`).
- **Spatial Pin Normalization (SYS-ARCH-01)**: This file no longer defines or publishes `normalizeSpatialPin`. `getPinLinks`, `selectSpatialPin`, the context menu and the hover card call the global published by the `campaign_mutation_engine.js` UMD tail, which normalizes in place (with hover/card summaries accounting for partitioned `industry` and `resource` entities). Test sandboxes that run this file need `injectEngine(sandbox)`.
<!-- END_CUSTOM_NOTES -->
