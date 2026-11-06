---
file_path: "src/workstation/scripts/dread_risk_overlay.js"
title: "dread_risk_overlay.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "bb6535c81889e18a"
reviewed_hash: "bb6535c81889e18a"
stale: false
size_bytes: 2676
line_count: 52
---

# dread_risk_overlay.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/dread_risk_overlay.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/dread_risk_overlay.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/dread_risk_overlay.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
- Gigerenzer suite (ADR 0024): runs the dread-risk what-if from the node property grid, exposes getDreadOverlayEdgeKind for the renderer, and reports totals in the status bar. Nothing is saved.
<!-- END_CUSTOM_NOTES -->
