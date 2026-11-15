---
file_path: "src/workstation/scripts/industry_chain_importer.js"
title: "industry_chain_importer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "f73dc652b90fd1eb"
reviewed_hash: "f73dc652b90fd1eb"
stale: false
size_bytes: 24930
line_count: 590
---

# industry_chain_importer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/industry_chain_importer.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/industry_chain_importer.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/industry_chain_importer.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`. Stamped imported facility anchors route cleanly into the partitioned `'industry'` explorer roster.
<!-- END_CUSTOM_NOTES -->
