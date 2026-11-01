---
file_path: "src/workstation/scripts/layer_manager.js"
title: "layer_manager.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "fc3933e62e47a851"
reviewed_hash: "fc3933e62e47a851"
stale: false
size_bytes: 25799
line_count: 647
---

# layer_manager.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/layer_manager.js` provides authoritative CAD layer management for Creator Studio workstation canvases:
1. **Per-Map Canvas Layer Schema**: Defines the `CanvasLayer` data model (`id`, `name`, `zIndex`, `visible`, `locked`, `opacity`).
2. **Default Core Layers**: Manages the 6 standard core layers (`layer-bg`, `layer-drawings`, `layer-roads`, `layer-hegemony`, `layer-nodes`, `layer-annotations`).
3. **Layer Cascades**: Synchronizes layer visibility, locking, and opacity directly into canvas rendering and interaction gates.
4. **Win95 Dual-Mount UI**: Renders the Windows 95 / VB6 Layers Manager interface across both the floating MDI window (`modal-layers-manager`) and the right Properties dock tab.
<!-- END_CUSTOM_NOTES -->
