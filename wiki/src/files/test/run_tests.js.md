---
file_path: "test/run_tests.js"
title: "run_tests.js"
volume: "vol-8"
kind: "Node.js / Browser Engine Script"
current_hash: "6b2e6b8d398d253c"
reviewed_hash: "6b2e6b8d398d253c"
stale: false
size_bytes: 176408
line_count: 3834
---

# run_tests.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`test/run_tests.js` is the **Master Zero-Dependency Headless JavaScript Test Runner** for Creator Studio. Executed via Node.js in CI/local testing environments, it executes 70+ deterministic assertions across 5 core verification suites in under 200ms.

### Test Suites
1. **Suite 1: Inline JavaScript Syntax Validation across HTML Surfaces**:
   - Parses and validates all executable `<script>` blocks across 14 compiled HTML surfaces (`start.html`, `admin.html`, `index.html`, `network/*.html`, `tarot/*.html`, `regions/*.html`, `tickets/*.html`) using Node's `vm.Script` compiler.
   - Ignores embedded template or JSON scripts (`type="application/json"`).
2. **Suite 2: ZeroCorsZip Engine Unit Tests**:
   - Tests `ZeroCorsZip` (`src/workstation/scripts/zip_engine.js`) in-memory archive creation with text, formatted JSON, and binary `Uint8Array` payloads.
   - Asserts PKWARE signature standards (Local File Header `0x04034b50`), CRC-32 integrity, and lossless round-trip extraction via `ZeroCorsZip.parse()`.
3. **Suite 3: Selective Sub-Map Importer & Conflict Detection**:
   - Validates `detectEntityConflicts` and `mergeEntitiesWithResolutions` (`src/workstation/scripts/selective_importer.js`) across NPCs, quests, items, threat clocks, and tickets.
   - Asserts all three conflict resolution strategies:
     - `keep_existing`: Preserves original active entities and non-conflicting new entities.
     - `overwrite`: Modifies entity properties in-place according to incoming specifications.
     - `clone`: Clones the incoming entity with a unique ID and `(Imported)` name suffix.
4. **Suite 4: Portal Sub-Map Cascade & Non-Orphaning Engine**:
   - Verifies `analyzeEntityDependencies` and `executeEntityDeletion` (`src/workstation/scripts/entity_cascade_delete.js`).
   - Asserts non-orphaning detachment: deleting a portal node without checking the attached sub-map sets `parentNodeId = null`, detaching the child cleanly without orphaning or corrupting adjacency.
   - Asserts cascade deletion: deleting a portal node with the sub-map checked cleanly purges the child map from the `maps` registry.
5. **Suite 5: Zero-CORS Offline Execution & Asset Isolation Audit**:
   - Regex-scans all 14 HTML surfaces to guarantee zero external script or stylesheet links (`http://`, `https://`, `//cdn`).
6. **Suites 6–20: Canvas Layers, Shapes, Multi-Selection, Property Grid, Campaign Packages, Dynamic Campaign Manager, Module Deletion, Resource/Custom Module Engines, 64-Cell ODV Matrix Reflection, Undo/Redo, Threat Clocks, Logistics, Bandwidth, In-App Fog, Demographics & Stabilization Gate (`SYS-START-01..14`, `ADR 0014`, `ADR-0015 v2`, `ADR 0016`, `ADR 0017`)**.
7. **Suite 21: Patrol Faction Setting-Agnostic & Data Integrity Gate**:
   - Audits `property_grid_inspector.js` for strict setting-agnostic purity, forbidding hardcoded setting lore ('Imperial Frontier Guard', 'Civic Guilds', 'Ancient Dynasts', 'Corsair Anchorage').
   - Validates dynamic `appendComboboxPropRow` implementation and `getCampaignFactionSuggestions()` query.
   - Ensures custom and imported edge patrol factions are preserved losslessly without being clobbered or coerced to neutral.
<!-- END_CUSTOM_NOTES -->
