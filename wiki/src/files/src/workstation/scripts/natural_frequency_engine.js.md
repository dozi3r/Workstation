---
file_path: "src/workstation/scripts/natural_frequency_engine.js"
title: "natural_frequency_engine.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "4b3dbc924395e4f1"
reviewed_hash: "5aafcef9e076ddb3"
stale: true
size_bytes: 2699
line_count: 56
---

# natural_frequency_engine.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/natural_frequency_engine.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/natural_frequency_engine.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/natural_frequency_engine.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
- Gigerenzer suite (ADR 0024): pure UMD converter from conduit hazard data to whole-number counts and a 2x2 scout matrix. Defaults come from hazardLevel 0-4 when hazardProbability is absent.
<!-- END_CUSTOM_NOTES -->
