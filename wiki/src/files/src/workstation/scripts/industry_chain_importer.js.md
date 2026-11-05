---
file_path: "src/workstation/scripts/industry_chain_importer.js"
title: "industry_chain_importer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "3012707ad1a9bccc"
reviewed_hash: "3012707ad1a9bccc"
stale: false
size_bytes: 24906
line_count: 590
---

# industry_chain_importer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/industry_chain_importer.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/industry_chain_importer.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/industry_chain_importer.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
<!-- END_CUSTOM_NOTES -->
