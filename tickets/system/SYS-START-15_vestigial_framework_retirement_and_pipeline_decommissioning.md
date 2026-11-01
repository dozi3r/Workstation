---
id: SYS-START-15
title: "Retirement of Vestigial Surfaces (Contradiction Dashboard, Step 0 Builder) & Framework Sanitization"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Platform Hygiene & Legacy Decommissioning"
grounded_prerequisites: ["docs/adr/0001-dual-mode-preset-architecture.md", "docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md", "docs/adr/0011-retirement-of-vestigial-tarot-balancing-engine.md", "docs/navigation_manifest.json"]
grounded_yields: ["Contradiction Dashboard Decommissioning", "Step 0 Builder Decommissioning", "Pipeline Step Jargon Purge", "Opal Island Path Sanitization", "Zero Dead Links"]
provides: ["Platform: Surface-Pruning", "Platform: Legacy-Purge"]
requires: ["Workstation: start.html", "Navigation: navigation_manifest.json"]
standalone_fallback: "Preserve obsolete surfaces as unmaintained standalone files."
---
# SYS-START-15: Retirement of Vestigial Surfaces (Contradiction Dashboard, Step 0 Builder) & Framework Sanitization
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-10-30*

## 1. Overview & Objective
Creator Studio has undergone rapid evolutionary leaps: from an early dual-mode setting prototype (ADR-0001) with a 22-node Major Arcana Tarot smothering engine, through a 3-step pipeline (`network_builder.html` $\to$ `campaign_studio.html` $\to$ `platform_audit_dashboard.html`), to the modern unified Windows 95/VB6 CAD desktop workstation (`start.html`, Workstation 2.0).

However, historical artifacts and obsolete framework vestiges remain scattered across the codebase, confusing users and AI coding agents:
1. **`network/contradiction_matrix_dashboard.html`**: A 100% static lore-reconciliation page created on October 11, 2026 for ADR-0001. It hardcodes a 6-card debate about the original "Opal Island" prison setting (Card 22 Panopticon upright vs reversed, Convict Silver vs Soul Siphon, Stirges vs Mosquitoes, 14 Hubs vs 22 Bastions). It does **not** dynamically calculate contradictions for active campaigns, and its Tarot mechanics were permanently retired in ADR-0011.
2. **`network/network_builder.html` ("Step 0")**: An 11,076-line, 2.7MB force-directed graph editor built before `start.html` had CAD vector capabilities. In `start.html`, GMs can place nodes, draw transit roads, draw hegemony vectors, draw CAD shapes, and export topology JSON directly.
3. **Pipeline "Step 0 / Step 1 / Step 3" Jargon**: Menu items and documentation still refer to a linear sequence of separate tools that was rendered obsolete when Workstation 2.0 consolidated everything into `start.html`.
4. **Phantom "Opal Island" & "generic_starter" File Paths**: References to `campaigns/opal_island/` and `campaigns/generic_starter/` linger in `navigation_manifest.json`, `MODULES_CATALOG.md`, and `wiki/build_wiki.js`, even though the campaign was unified and renamed to `campaigns/Emerald Isle/`.
5. **Dead Menu Links**: `openStep1Studio()` (`template.html:194`) and `copyEngineSimulationCommand()` (`template.html:237`) cause unhandled `ReferenceError` crashes.

This ticket formally decommissions these vestigial surfaces and purges obsolete framework references across the suite.

---

## 2. Implementation Deliverables

### 2.1 Decommission `network/contradiction_matrix_dashboard.html`
1. Reclassify `contradiction_matrix_dashboard.html` in `docs/navigation_manifest.json` as an archived historical artifact, or emit a zero-CORS deprecation redirect stub pointing to `start.html` (matching the pattern used for `index.html` and `campaign_studio.html`).
2. Remove "Contradiction Matrix Dashboard &rarr;" from `src/workstation/template.html` (line 170).
3. Confirm that dynamic sociopolitical tension is handled exclusively by the **64-Cell ODV Archetype Matrix & Corridor Friction Engine** ([ADR-0014](file:///c:/Users/Milo/Documents/Antigravity/Workstation%20Application/docs/adr/0014-campaign-state-reflection-and-edge-odv-on-64-matrix.md)).

### 2.2 Decommission `network/network_builder.html` ("Step 0")
1. Remove "Network Builder (Step 0) &rarr;" from `src/workstation/template.html` (line 171).
2. Emit a zero-CORS deprecation redirect stub at `network/network_builder.html` pointing to `../start.html` with query parameters.
3. Update `docs/navigation_manifest.json` to reflect `start.html` as the authoritative CAD graph builder.

### 2.3 Purge Dead Menu Actions & Pipeline Jargon (`src/workstation/template.html`)
1. Remove line 194: `<div class="dropdown-row" onclick="openStep1Studio()">Launch Step 1 Studio...</div>`.
2. Remove line 237: `<div class="dropdown-row" onclick="copyEngineSimulationCommand()">⚙️ Copy Engine Simulation Command</div>`.
3. In line 169, rename:
   - Old: `Platform Explorer (Step 3) &rarr;`
   - New: `Platform Module Explorer & Catalog &rarr;`

### 2.4 Sanitize Phantom Setting Paths
1. **`docs/navigation_manifest.json`**:
   - Replace `"campaigns/generic_starter/modules/*.md"` and `"campaigns/opal_island/modules/Set_A..G/*.md"` with `"campaigns/Emerald Isle/modules/**/*.md"`.
2. **`docs/MODULES_CATALOG.md`**:
   - Update file tree and directory links from `campaigns/opal_island/` to `campaigns/Emerald Isle/`.
3. **`wiki/build_wiki.js`**:
   - Update lines 658-661 to reference the actual existing image locations in `campaigns/Emerald Isle/`.
   - Remove orphaned references to `campaigns/opal_island/modules_manifest.json`.

---

## 3. Verification & Testing Criteria
1. **Compilation & Syntax Audit**:
   - Run `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1`.
   - Verify that 0 references to `openStep1Studio` or `copyEngineSimulationCommand` exist in `start.html`.
2. **Wiki Graph Drift**:
   - Run `powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Stale`.
   - Assert 0 stale files and 0 broken image paths.
3. **Master Test Suite**:
   - Run `powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1`.
   - Assert 100% pass across all test suites.
