---
file_path: "Test-Suite.ps1"
title: "Test-Suite.ps1"
volume: "vol-8"
kind: "PowerShell Automation / Simulation Runner"
current_hash: "ff65fdd1d59283e3"
reviewed_hash: "ff65fdd1d59283e3"
stale: false
size_bytes: 11579
line_count: 239
---

# Test-Suite.ps1

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`Test-Suite.ps1` serves as the **Master Automated Test Harness & Quality Assurance Gate** for the Creator Studio platform. It provides a single-command CLI test runner that executes comprehensive end-to-end verification across the entire suite under 15 seconds.

### Execution Pipeline & Verification Phases
1. **Phase 1: Build Suite Compilation (`Build-Suite.ps1 --stamp-reviewed`)**:
   - Recompiles navigation manifests, worldbuilding module catalogs, ticket manifests, mod registries, and inlined `start.html`.
   - Hardens zero-CORS CSS and synchronizes knowledge graph hashes across all 298+ tracked workspace files.
2. **Phase 2: Headless JS Syntax & Unit Test Suite (`test/run_tests.js`)**:
   - Validates inline script syntax via Node's `vm.Script` across 14 compiled HTML surfaces (`start.html`, `admin.html`, `index.html`, `network/*.html`, `tarot/*.html`, `regions/*.html`, `tickets/*.html`).
   - Executes 70+ unit assertions across `ZeroCorsZip` archive generation/round-trip parsing, `selective_importer.js` entity conflict detection and merging strategies, `entity_cascade_delete.js` portal node detachment/deletion cascade, and zero-CORS CDN isolation.
3. **Phase 3: Cross-Language Tarot Balancing Parity (`mods/tarot_balancing/Test-TarotParity.ps1`)**:
   - Verifies 100% mathematical and algorithmic parity between the headless PowerShell simulation engine (`Run-NetworkEngine.ps1`) and the browser JavaScript balancing engine (`mod.js`) across 5 random seeds (card draws, weights, reversals, amalgamation scoring, Sovereign Hub elections, and adjacency smothering).
4. **Phase 4: Multi-Campaign Package Compliance (`campaigns/Test-CampaignPackage.ps1`)**:
   - Audits all registered campaign preset sourcebooks and workstation projects (`generic_starter`, `opal_island`, `silica_island`, `Silician`, `sun_wukong`) for schema conformity, node/edge topological integrity, module availability, and icon metadata.
5. **Phase 5: Knowledge Graph Drift & Stale Documentation Audit (`Find-CodebaseNode.ps1 -Stale`)**:
   - Inspects `wiki/wiki_graph.json` to verify 0 stale or unreviewed files, guaranteeing perpetual synchronization between implementation code and technical manual documentation.
6. **Phase 6: Loopback Server Engines (`server.js` & `server.ps1`)**:
   - Validates Node.js and PowerShell HttpListener loopback servers with full process-tree termination (`taskkill /PID $proc.Id /T /F`) to prevent child process leaks and port collisions (`EADDRINUSE`).

### CLI Usage & Parameters
- Standard full verification:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1
  ```
- Fast verification (single-seed tarot check):
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1 -Quick
  ```
- Skip compilation rebuild (when running immediately after manual build):
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1 -SkipBuild
  ```
<!-- END_CUSTOM_NOTES -->
