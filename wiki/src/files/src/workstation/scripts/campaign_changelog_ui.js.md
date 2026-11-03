---
file_path: "src/workstation/scripts/campaign_changelog_ui.js"
title: "campaign_changelog_ui.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "9cadc21fc605d17e"
reviewed_hash: "9cadc21fc605d17e"
stale: false
size_bytes: 22591
line_count: 480
---

# campaign_changelog_ui.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/campaign_changelog_ui.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/campaign_changelog_ui.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/campaign_changelog_ui.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
<!-- END_CUSTOM_NOTES -->
