---
file_path: "src/workstation/scripts/pack_engine.js"
title: "pack_engine.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "d788e73e62bb6d2d"
reviewed_hash: "d788e73e62bb6d2d"
stale: false
size_bytes: 46028
line_count: 1086
---

# pack_engine.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/pack_engine.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/pack_engine.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/pack_engine.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
- **Entity Module Pack Engine (.csmod)**: Provides offline zero-CORS ingestion, archive parsing, manifest validation, scale-fluid portal anchoring, relational cluster remapping, provenance tracking, cascade uninstallation, and binary export.
- **Deep Module Seam (`window.packEngine`)**: Exposes controller APIs `openInstallerDialog()`, `executeInstallFromDialog()`, `renderInstalledPacksView()`, and `requestPackUninstall()`.
- **Relational Integrity (`remapEntityCluster`)**: Remaps all foreign keys (`quest.npcIds`, `quest.itemIds`, `item.ownerNpcId`, `npc.relationships`, and submap `node.stationedNpcIds` / `node.childMapId`) when cloned entities are disambiguated.
- **Teardown Safeguards**: Enforces active map safety guard before deleting submaps, restores prior portal links on anchor nodes via `previousChildMapId`, and purges custom module slotting across maps and nodes.
- **Entity Explorer Overhaul (`industries` normalization)**: Normalizes imported `entities.industries` arrays into `entities.items` stamped with `entityKind: 'industry'` and `isIndustry: true`.
- Package Orchestration (Sprint 4): parsePackArchive and uildPackArchive preserve custom mod fields, unknown entity attributes, and support creatures, creatureEvidence, and changelog serialization across .csmod archives and directory file sets for dual-adapter symmetry.
<!-- END_CUSTOM_NOTES -->
