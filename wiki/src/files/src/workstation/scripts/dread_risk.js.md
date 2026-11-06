---
file_path: "src/workstation/scripts/dread_risk.js"
title: "dread_risk.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "3aef89228e9d58a1"
reviewed_hash: "3aef89228e9d58a1"
stale: false
size_bytes: 8345
line_count: 165
---

# dread_risk.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/dread_risk.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/dread_risk.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/dread_risk.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
- Gigerenzer suite (ADR 0024): pure what-if cascade for panic detours after a catastrophe. Never mutates the topology; conserves flow (entering = direct + served + unserved).
<!-- END_CUSTOM_NOTES -->
