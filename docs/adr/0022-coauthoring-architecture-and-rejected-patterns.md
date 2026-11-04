# 0022: Co-Authoring Architecture, Node-First CLI Consolidation, and Rejected Patterns

## Context
During the Workstation 2.5 / 2.6 co-authoring evaluation, we integrated external agent co-authoring workflows alongside human browser authoring. At the same time, we audited the repository for tooling duplication, false-positive documentation staleness triggers, external image bloat, and high-risk UI proposals.

Four concrete architectural questions emerged:
1. How should external AI agents and human authors mutate campaign state, review external changes, and revert batches safely?
2. Why did saving a campaign or compiling the suite trigger false-positive "Stale Wiki Drift" errors in `Test-Suite.ps1`?
3. How should core nodes and roads preserve ecological `biome` properties after evicting the ~1 GB `regions/` scenery image recommendation browser into an external mod?
4. Which proposed patterns from the partner's Workstation 2.6 spec (`app.html`, `.presenter-mode`, background SSE `fs.watch` auto-replay, and in-app BYOK LLM chatbots) should be adopted, deferred to the backburner, or permanently rejected?

## Decision
1. **Phase 1 Co-Authoring Foundation (`CampaignMutationEngine` & Changelog Audit)**:
   - Centralize programmatic campaign reads and mutations in `src/workstation/scripts/campaign_mutation_engine.js` (`window.CampaignMutationEngine`) with structured `{ ok, data, error, warnings, batchId }` envelopes.
   - Persist atomic disk writes in `server.js` and `server.ps1` using temp-file + rename and generate `campaigns/<id>/campaign_sync.js` for zero-CORS `file:///` parity.
   - Surface external disk modifications via the non-destructive **Sync Digest Modal (`#modal-sync-digest`)** and record every mutation batch in an append-only changelog (`#modal-campaign-changelog`, `Ctrl+Shift+L`) with 1-click compensating undo (`revertChangelogBatch`).
2. **Surgical Node-First CLI Consolidation**:
   - Port the standalone PowerShell logic in `Find-CodebaseNode.ps1`, `Test-Suite.ps1`, and `campaigns/Test-CampaignPackage.ps1` into cross-platform Node.js scripts (`scripts/find_codebase_node.js` and `scripts/test_suite.js`), turning the `.ps1` entry points into thin Node launchers while preserving `server.ps1` as the zero-install Windows loopback fallback.
   - Update `wiki/build_wiki.js` (`isAutoSyncedDataOrDist`) to auto-sync `reviewed_hash` on live campaign JSON files (`campaigns/*/topology.json`, `preset.json`, `campaign.json`) and compiled HTML bundles so saving a campaign never causes false wiki drift failures.
3. **Native `biome` Property Without `regions/` Image Bloat**:
   - Evict `regions/regional_image_browser.html`, `regions/Find-RegionalImage.ps1`, and `regions/regional_image_catalog.json` from the core repository (`SYS-BACKBURNER-03`).
   - Restore native `node.biome` and road `edgeRecord.biome` directly in `src/workstation/scripts/property_grid_inspector.js` (`CORE_BIOME_PRESETS` across 8 ecological categories + custom string support), `sociology_data.js`, and `campaign_mutation_engine.js`, with automatic fallback to legacy `node.modData.regional_biomes.biome`.
4. **Permanently Rejected & Backburnered Patterns**:
   - **Rejected (`SYS-REJECTED-01`)**: Parallel `app.html` entry points and CSS `.presenter-mode` shell overrides are permanently rejected to uphold ADR-0007 (single unified `start.html` surface) and prevent un-closable floating MDI window state traps.
   - **Rejected (`SYS-REJECTED-02`)**: Background SSE `fs.watch` auto-replay is permanently rejected to prevent silent mid-drag state overwrites during active human authoring.
   - **Deferred (`SYS-BACKBURNER-01`, `SYS-BACKBURNER-02`)**: In-app BYOK LLM chat UI (`Tickets 06–09`) and Google Drive virtual-filesystem lock retry wrappers remain deferred on the backburner.

## Consequences
- External IDE agents and browser users co-author campaigns safely with full auditability, 1-click undo, and zero silent state overwrites.
- All build, graph-query, and test pipelines execute identically in Node.js across Windows, macOS, and Linux, while existing `.ps1` entry points remain 100% backward-compatible.
- Core nodes and roads retain rich ecological biome classification with zero multi-megabyte regional image catalog bloat.
