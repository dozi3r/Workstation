---
file_path: "src/workstation/scripts/campaign_exporter.js"
title: "campaign_exporter.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "f53b85b094f17d19"
reviewed_hash: "f53b85b094f17d19"
stale: false
size_bytes: 58583
line_count: 1439
---

# campaign_exporter.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/stage_6_export.js` manages Stage 6 Campaign JSON (`generateCampaignJSON`) and Markdown Dossier (`generateCampaignMarkdown`) export and ingestion (`importCampaignData`), preserving multi-scale maps, nodes, corridors, active entities, and `custom_modules` (`SYS-START-09`).

### Data Preservation (ADR-0015 v2)
Ensures full lossless export and hydration for all node metadata properties, specifically: `demographics`, `factionPresence`, `partyRapport`, `provides`, `requires`, `exportDown`, and `importUp`.

### Entity Module Pack Exporter (`executeExportCsmodPack`)
Enables packaging of submap branches, stationed entities, and IndexedDB graphics into `.csmod` archives via `buildPackArchive()`. Implements zero-CORS browser downloads appending `<a>` to `document.body` with deferred `URL.revokeObjectURL()`.
<!-- END_CUSTOM_NOTES -->
