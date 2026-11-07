---
file_path: "src/workstation/scripts/campaign_override_slots.js"
title: "campaign_override_slots.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "8f00a8bb38dae43b"
reviewed_hash: "63da501124db2745"
stale: true
size_bytes: 3087
line_count: 66
---

# campaign_override_slots.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/campaign_override_slots.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/campaign_override_slots.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/campaign_override_slots.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
<!-- END_CUSTOM_NOTES -->
