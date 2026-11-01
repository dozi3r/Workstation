---
file_path: "src/workstation/scripts/selection_engine.js"
title: "selection_engine.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "14c1a55b055ee580"
reviewed_hash: "14c1a55b055ee580"
stale: false
size_bytes: 8037
line_count: 189
---

# selection_engine.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/selection_engine.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/selection_engine.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/selection_engine.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
<!-- END_CUSTOM_NOTES -->
