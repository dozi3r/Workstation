---
file_path: "src/workstation/scripts/stage_6_export.js"
title: "stage_6_export.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "574d94dad09b67da"
reviewed_hash: "574d94dad09b67da"
stale: false
size_bytes: 32203
line_count: 738
---

# stage_6_export.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/stage_6_export.js` manages Stage 6 Campaign JSON (`generateCampaignJSON`) and Markdown Dossier (`generateCampaignMarkdown`) export and ingestion (`importCampaignData`), preserving multi-scale maps, nodes, corridors, active entities, and `custom_modules` (`SYS-START-09`).

### Data Preservation (ADR-0015 v2)
Ensures full lossless export and hydration for all node metadata properties, specifically: `demographics`, `factionPresence`, `partyRapport`, `provides`, `requires`, `exportDown`, and `importUp`.

### Entity Module Pack Exporter (`executeExportCsmodPack`)
Enables packaging of submap branches, stationed entities, and IndexedDB graphics into `.csmod` archives via `buildPackArchive()`. Implements zero-CORS browser downloads appending `<a>` to `document.body` with deferred `URL.revokeObjectURL()`.
<!-- END_CUSTOM_NOTES -->
