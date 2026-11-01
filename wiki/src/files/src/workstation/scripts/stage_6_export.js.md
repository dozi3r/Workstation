---
file_path: "src/workstation/scripts/stage_6_export.js"
title: "stage_6_export.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "c3acaff1f4318dcd"
reviewed_hash: "c3acaff1f4318dcd"
stale: false
size_bytes: 26511
line_count: 593
---

# stage_6_export.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/stage_6_export.js` manages Stage 6 Campaign JSON (`generateCampaignJSON`) and Markdown Dossier (`generateCampaignMarkdown`) export and ingestion (`importCampaignData`), preserving multi-scale maps, nodes, corridors, active entities, and `custom_modules` (`SYS-START-09`).

### Data Preservation (ADR-0015 v2)
Ensures full lossless export and hydration for all node metadata properties, specifically: `demographics`, `factionPresence`, `partyRapport`, `provides`, `requires`, `exportDown`, and `importUp`.
<!-- END_CUSTOM_NOTES -->
