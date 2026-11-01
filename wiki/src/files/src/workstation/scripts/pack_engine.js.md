---
file_path: "src/workstation/scripts/pack_engine.js"
title: "pack_engine.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "4dd3d3ba91bb7061"
reviewed_hash: "4dd3d3ba91bb7061"
stale: false
size_bytes: 17146
line_count: 480
---

# pack_engine.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/pack_engine.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/pack_engine.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/pack_engine.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
<!-- END_CUSTOM_NOTES -->
