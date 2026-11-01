---
file_path: "src/workstation/scripts/desktop.ini"
title: "desktop.ini"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "b420fea70dc309e7"
reviewed_hash: "b420fea70dc309e7"
stale: false
size_bytes: 106
line_count: 3
---

# desktop.ini

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/desktop.ini` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/desktop.ini @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/desktop.ini` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
<!-- END_CUSTOM_NOTES -->
