---
file_path: "src/workstation/scripts/campaign_exporter.js"
title: "campaign_exporter.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "5e11e89c007f20e3"
reviewed_hash: "5e11e89c007f20e3"
stale: false
size_bytes: 77470
line_count: 1821
---

# campaign_exporter.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/stage_6_export.js` manages Stage 6 Campaign JSON (`generateCampaignJSON`) and Markdown Dossier (`generateCampaignMarkdown`) export and ingestion (`importCampaignData`), preserving multi-scale maps, nodes, corridors, active entities, and `custom_modules` (`SYS-START-09`).

### Data Preservation (ADR-0015 v2)
Ensures full lossless export and hydration for all node metadata properties, specifically: `demographics`, `factionPresence`, `partyRapport`, `provides`, `requires`, `exportDown`, and `importUp`.

### Census-Aware Demographics (SYS-ARCH-01)
`node.demographics` is the census shape `{ primary: {name, percentage}, minorities: [{name, percentage}], social_friction_notes, tags: [] }` (see `CONTEXT.md`, `normalizeDemographics` in `entity_core.js`). Export (`generateCampaignJSON`) and import (`importCampaignData`) both pass it through `normalizeDemographics`, behind a `typeof ... === 'function'` guard. The Obsidian node dossier (`buildObsidianVaultFiles`) renders `primary` (percentage, marked primary population), each minority, then `tags`. A legacy flat array renders as tags, and `{name|race, percentage|pct}` entries in it render as minorities. The "Cosmopolitan / mixed frontier demographic." line appears only when all three are empty.

### Entity Module Pack Exporter (`executeExportCsmodPack`)
Enables packaging of submap branches, stationed entities, and IndexedDB graphics into `.csmod` archives via `buildPackArchive()`. Implements zero-CORS browser downloads appending `<a>` to `document.body` with deferred `URL.revokeObjectURL()`.
- ODV (SYS-ODV-02 S1): resolveNodeOdv calls no longer pass the topology as fallbackIndex.
<!-- END_CUSTOM_NOTES -->
