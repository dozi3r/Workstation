---
file_path: "test/run_tests.js"
title: "run_tests.js"
volume: "vol-8"
kind: "Node.js / Browser Engine Script"
current_hash: "04d39047368436f2"
reviewed_hash: "04d39047368436f2"
stale: false
size_bytes: 537513
line_count: 10509
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
8. **Suite 24: Simple Entity Module Packs (`.csmod`) & Round-Trip Fidelity**:
   - Validates `.csmod` archive construction and extraction via `window.packEngine`.
   - Asserts foreign-key entity cluster remapping across quests, items, NPCs, relationships, and submap stationed NPCs during `clone` resolution.
   - Tests portal anchor attachment, preservation of pre-existing `childMapId` pointers, and clean restoration upon pack uninstallation.
   - Tests active map teardown safety guard (switching to `map_root` before submap deletion to avert renderer crashes).
   - Validates custom module slotting purge across node/edge module maps.
   - Asserts 100% round-trip fidelity: export `.csmod` package with submaps and graphics -> parse archive -> install -> verify state parity.
9. **Engine seam for `vm` sandboxes (SYS-ARCH-01)**: `injectEngine(sandbox)` `require()`s `campaign_mutation_engine.js` and publishes `CampaignMutationEngine`, `CreatorStudio.ai` and the root aliases the engine UMD tail publishes in a browser (`ENGINE_ROOT_ALIASES`, including `normalizeSpatialPin`). It mirrors them onto a separate `sandbox.window` when one exists. Call it in every sandbox that loads a script resolving engine globals at runtime. Every sandbox that loads `entity_cascade_delete.js` (Suite 4 portal cascade, module deletion, faction/NPC/quest cascade, ticket-center and clock cascade sandboxes) calls it, so `executeEntityDeletion` takes the production path where `CampaignMutationEngine.deleteEntity` runs first.
10. **Suite 48: Canonical Spatial Pin Normalizer (SYS-ARCH-01)**:
   - Exercises `normalizeSpatialPin` through the engine `require()` seam with no DOM: same reference, unknown fields kept, `visible`/`locked`/label/id defaults, legacy `targetType`/`targetId` to `links`, `links[0]` driving the legacy fields, link objects keeping extra fields, `null` for non-objects.
   - Proves the `ENGINE_ROOT_ALIASES` list equals what the engine UMD tail publishes (the engine is run in a fresh `vm` context) and that only `campaign_mutation_engine.js` defines `normalizeSpatialPin`.
11. **Suite 19.20: Census-aware demographics (SYS-ARCH-01)**: `generateCampaignJSON` normalizes census and flat-array demographics, and the Obsidian node dossier renders census primary, minorities and tags, flat arrays, legacy `{race, pct}` groups, and the Cosmopolitan fallback only when empty. A bare exporter sandbox with no `normalizeDemographics` proves the `typeof` guard path.
12. **Suite 49: Engine-first include order (SYS-ARCH-01)**: asserts `template.html` lists `campaign_mutation_engine.js` as its first script include and lists each script once. The compiled-bundle boot test in Suite 1 also asserts the engine seam aliases are published and `CampaignStateAdapter` no longer exists.
13. **Suite 50: Entity reference integrity (SYS-ARCH-01 Phase D)**: `deleteEntity` scrubs child-map pins and nodes passed through `batchContext.maps`, scrubs a map reachable twice once, and keeps the `state.maps` walk. `executeEntityDeletion` passes the global `maps` registry to the engine (spy on the injected engine) and the child-map pin link disappears.
   - Descriptor parity: a world is generated from `ENTITY_REFERENCE_DESCRIPTORS` (one referring record and one decoy per row, state and child map) for every entity type. `findEntityReferences` must report exactly the records `deleteEntity` changes (measured by diffing the world, not by reading the changelog), be read-only, cover every row, and ignore decoys.
   - Preview parity: `analyzeEntityDependencies` must list exactly those id-based referrers as `reference` dependencies. Name mentions are a separate `mention` group, are not unlinked by the delete, and the dialog renders them under their own heading.
   - Ownership: with the engine's `deleteEntity` stubbed out, `executeEntityDeletion` changes none of the roster, quests, trigger refs, tickets or pins (the cascade file no longer scrubs entity types). Tickets aimed at a deleted NPC (engine), sub-map or module (cascade file) each get exactly one audit note.
   - Converted source-text checks (SYS-ARCH-01): the `sanitizePinArray(topo.spatialPins)` check (Suite 37 RT-04) and the `q.trackerIds.filter` / `st.triggerTrackerId && deletedIdsByType.tracker.has` checks (Suite 38) now run the real `executeEntityDeletion` and assert the outcome on pins, `quest.trackerIds` and `quest.steps`.
14. **Suites 52–55: Resource Partitioning, Bestiary Explorer, FFT Adaptation, Creature CRUD & Cascade Lifecycle**:
   - *Suite 52*: Validates 6-seam bidirectional creature persistence, zero-CORS evidence loading, and commodity item partitioning (`isResourceItem`, `getActiveEntityList('resource')`).
   - *Suite 53*: Validates multi-map node aggregation for resource export commodities, DF logistics stockpile specifications, and resource CRUD.
   - *Suite 54*: Validates Diablo bestiary FFT normalization (all 68 creatures pass `validateFft`), Threat Tier / Kind filtering, Relative Capability stat bars with pips, Dread Index gauge (1-10), and collapsible Source Figures section hydrated from `creatureEvidence`.
   - *Suite 55*: Validates creature creation via `openNewEntityModal('creature')` and `saveCustomEntity()`, editing via `openEditEntityModal()`, cascade deletion dependency analysis via `analyzeEntityDependencies('creature')`, deletion execution via `executeCascadeDelete`, and node deletion cascade unlinking stationed creatures.
15. **Suites 56–57: Quest Explorer Enrichment, Crucibles, Cross-Campaign Explorer & Transplant Packaging**:
   - *Suite 56*: Tests What-If Crucible parsing (`parseQuestCrucibleNotes`), synopsis extraction, dilemma/ripple breakdown, threat tier rendering, step progress meters, and semantic Quest Giver (`giverNpcId`) and Target (`targetNpcId`) binding.
   - *Suite 57*: Tests cross-campaign source discovery (`CrossCampaignService.discoverAvailableSources`), on-demand loading (`toggleSource`), strict isolation invariant (external entities never appear in `getActiveEntityList`), external entity normalization and staging (`_isExternal: true`, `_sourceCampaignId`, `nodeId: null`, `_originalNodeId`), composite key addressing (`ext::<sourceId>::<id>`), dependency graph analysis (`analyzeTransplantDependencies`), and transplant execution (`executeTransplantPackage`) with 3-way dependency actions (`copy`, `reassign`, `omit`), ID conflict strategies (`auto_unique`, `overwrite_if_exists`, `preserve_strict`), and foreign key rewriting.
16. **Suite 58: Multi-Explorer Enrichment & Cross-Entity Property Grid Parity**:
   - Validates `formatEntityNavId` prefixing `ext::<sourceId>::<id>` with idempotency and isolation.
   - Validates polymorphic `renderNpcDialogueHooksHtml` handling bare string quotes, bifocal `Spoken: ... | Subtext: ...` blocks, and `{ text, revealed }` objects with `[REVEALED IN CANON]` indicators.
   - Validates Property Grid parity across `creature`, `resource`, `item` (status and valuation), and `faction` (4-axis power profile and territory/member readouts).
   - Validates Faction Inspector in `entity_manager_ui.js` unionizing `territoryNodeIds`/`controlledNodeIds`, unionizing `memberNpcIds` and faction matching, rendering 4-Axis Power Matrix, and isolating external campaigns (omitting territory highlight on canvas and enforcing read-only diplomatic stances).
   - Validates Creature Inspector displaying `scientificOrArchaicName`, `immunities`, `harvestYields`, `domesticationProfile`, `relationalLinks`, and `roamingScope`.
   - Validates Node Inspector Subtab 1 rendering Danger Rating (0-4), Node Category selector, Demographics Census & Faction Presence, Party Rapport stance, collapsible Node Lore reader, and Commodity Logistics summary.
17. **Suite 59: Campaign Settings, Live In-Place Renaming & CreatorStudio Event Bus (SYS-START-19)**:
   - Validates template and modal DOM existence for `#modal-campaign-settings` and all metadata inputs.
   - Validates `window.CreatorStudio` event bus pub/sub lifecycle (`on`, `off`, `emit`) with zero-throw error isolation.
   - Validates arbitrary node mod-property preservation (`node.tarot_data`, `node.weather_state`) across `syncAdapterFromWorkstationTopology()`, `syncAdapterToWorkstationTopology()`, and `buildCampaignPackageFiles()`.
   - Validates `applyCampaignSettings()` updating active topology metadata, document title, status bar, Property Grid, and IndexedDB library records, and emitting `campaignRenamed`.
   - Validates `openCampaignSettingsModal()` pre-populating form controls accurately from active topology state.
   - Validates `saveActiveCampaignAsNew()` hardening: updates campaign identity and root map name before syncing, preserves all entity collections in IndexedDB library records, and emits `campaignRenamed`.
<!-- END_CUSTOM_NOTES -->
