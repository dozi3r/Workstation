---
file_path: "build_suite.js"
title: "build_suite.js"
volume: "vol-3"
kind: "Node.js / Browser Engine Script"
current_hash: "17009e14f2d3489c"
reviewed_hash: "17009e14f2d3489c"
stale: false
size_bytes: 58850
line_count: 1214
---

# build_suite.js

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`build_suite.js` is the **Centralized Asset Compiler, Zero-CORS Bundler & Agent Navigation Engine** within **Volume III: Build Pipeline, Compiler & Legacy Scratch Tooling**. Created under [[File:.scratch/creator-remediation/issues/04-build-centralized-compiler.md]] to eliminate the Multiple Source of Truth Hazard identified in [[File:docs/audit/2026-10-creator-studio-audit-dossier.md]] and governed by [[File:docs/adr/0001-dual-mode-preset-architecture.md]], [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], and [[File:docs/navigation_manifest.json]], it is the single build orchestrator that compiles modular HTML/JS sources, multi-campaign sourcebooks, Tarot decks, unified ticket trackers, Compass Headers, and the Bidirectional Codebase Wiki into 100% offline `file:///` distributions.

For a deep cross-cutting analysis of this subsystem, consult [[Series:series_e_zero_cors_compiler_and_agent_router]].

---

## Core Invariants & Contracts
- **Zero External Dependencies**: Uses only built-in Node.js standard library modules (`fs`, `path`, `child_process.execSync`) so it can execute on any standalone Node binary discovered by [[File:Build-Suite.ps1]].
- **Idempotent Fenced Injection**: Every dataset injected into HTML distributions (`CAMPAIGN_REGISTRY`, `MODULES_MANIFEST`, `DEFAULT_WAVES`, `ALL_MODULES`, `TICKETS`, `MASTER_TICKETS_DATA`) is wrapped in deterministic comment fences (`// [AUTO-GENERATED ... VIA build_suite.js]`) or resolved from [[File:src/workstation/template.html]] (`// @@INJECT_*@@`), guaranteeing repeatable builds without file corruption.
- **Script-Safe HTML Serialization**: When inlining raw Markdown module bodies or ticket manifests into `<script>` blocks (such as `ALL_MODULES` in [[File:network/platform_audit_dashboard.html]] and `MASTER_TICKETS_DATA` in [[File:start.html]]), `build_suite.js` escapes closing `</script>` tags via `.replace(/<\/script>/gi, '<\\/script>')` and avoids regex `$` dollar sign replacement hazards using functional replacers `() => replacement`.
- **Build-Time Mirror Note ([[Ticket:SYS-AUDIT-01]])**: Lines 487–494 write an identical mirror of [[File:network/platform_audit_dashboard.html]] to [[File:tickets/creative/platform_audit_visualizer.html]], tracked under Category A of [[Series:series_g_duplicate_and_orphan_audit]].

---

## Data Flow & 9-Stage Execution Pipeline

| Stage | Lines | Input Files / Directories | Transformation & Processing Logic | Compiled Output Files |
| :--- | :---: | :--- | :--- | :--- |
| **1. Load Nav Manifest** | 31–45 | [[File:docs/navigation_manifest.json]] | Parses JSON registry of 14 workstation surfaces. | In-memory `navManifest` |
| **2. Generate `AGENTS.md`** | 47–94 | `navManifest.surfaces` | Formats Ground Rules, Surface-to-Authority table, and Domain Terminology. | [[File:AGENTS.md]] |
| **3. Campaign Discovery** | 96–204 | `campaigns/<id>/campaign.json`, `preset.json`, `modules_manifest.json`, `modules/*.md`, `assets/*` | Discovers active campaigns, auto-discovers and inlines `assets/<mapId>_bg.*` raster images for offline portability, and enriches modules with regex-extracted `threat_clocks`, `dials`, `four_corners`, and `file_url`. | `campaignRegistry`, [[File:network/modules_manifest.json]] |
| **4b. Tarot Registry** | 206–317 | [[File:tarot/decks/deck_manifest.json]], [[File:tarot/decks/minor/minor_deck_manifest.json]] | Compiles 6 Major Arcana decks and 4 Minor Arcana decks into `TAROT_DECKS_DATA`. | In-memory `TAROT_DECKS_DATA` |
| **5. Workstation Assembly** | 320–366 | [[File:src/workstation/template.html]], `src/workstation/scripts/*.js`, `mods/` | Resolves `// @@INCLUDE: scripts/<file>.js @@` directives and injects `TAROT_DECKS_DATA`, `MODS_REGISTRY`, and `MASTER_TICKETS_DATA`. | [[File:start.html]] |
| **6. Network, Audit & Workstation Inlining** | 368–706 | `campaignRegistry`, [[File:tickets/master_ticket_manifest.json]], [[File:tickets/build_unified_tracker.js]] | Updates fenced datasets in Visualizer, Builder, Audit Dashboard (+ mirror), inlines 60 enriched tickets into `MASTER_TICKETS_DATA` in [[File:start.html]], and invokes `build_unified_tracker.js`. | [[File:network/network_visualizer.html]], [[File:network/network_builder.html]], [[File:network/platform_audit_dashboard.html]], [[File:start.html]], [[File:tickets/creative/platform_audit_visualizer.html]], [[File:tickets/unified_ticket_tracker.html]] |
| **7. Tarot Compilers & Zero-CORS** | 708–750 | [[File:tarot/generate_minor_matrix.js]], [[File:tarot/generate_tarot_matrix.js]], [[File:scripts/build_zero_cors_css.js]] | Executes child Node compilers to regenerate Tarot JSON matrices/browsers, and runs `build_zero_cors_css.js` to compile inline offline CSS and strip external fonts/scripts. | [[File:tarot/minor_matrix_browser.html]], [[File:tarot/tarot_matrix_browser.html]], [[File:admin.html]], [[File:network/network_builder.html]], [[File:network/platform_audit_dashboard.html]], [[File:network/contradiction_matrix_dashboard.html]] |
| **8. Compass Headers** | 750–813 | `navManifest.surfaces` | Prepends/updates `CREATOR STUDIO COMPASS HEADER` comments at line 1 of all `.html` and `.ps1` surfaces (except `wiki/index.html`). | All registered HTML/PS1 surfaces |
| **9. Codebase Wiki** | 815–830 | [[File:wiki/build_wiki.js]] | Executes the Bidirectional Codebase Wiki compiler via `process.execPath`. | [[File:wiki/index.html]], `wiki/pages/**`, `wiki/wiki_manifest.json` |

---

## AI Agent Maintenance Checklist
- **When adding a new script to `src/workstation/scripts/`**: Add the `// @@INCLUDE: scripts/<file>.js @@` directive in [[File:src/workstation/template.html]] and run [[File:Build-Suite.ps1]].
- **When adding a new campaign package under `campaigns/<id>/`**: Ensure `campaign.json`, `preset.json`, and `modules_manifest.json` pass [[File:campaigns/Test-CampaignPackage.ps1]]; `build_suite.js` Stage 3 will automatically discover and bundle the new campaign on the next build.
- **When modifying `AGENTS.md` Ground Rules**: Edit the template string in Stage 2 of `build_suite.js` (lines 52–90) rather than editing `AGENTS.md` directly.

## Portable `file_url` Convention (Tech Debt Wave 0, 2026-10-20)
- Module `file_url` values are **root-relative** (`campaigns/<id>/modules/<file>.md`, URI-encoded per segment) via `toRootRelUrl()`. No absolute `file:///C:/Users/...` paths are emitted.
- Root surfaces ([[File:start.html]]) use them as-is. Subfolder surfaces ([[File:network/platform_audit_dashboard.html]], [[File:network/network_builder.html]], [[File:network/network_visualizer.html]]) get a `../` prefix at injection time via `rebaseFileUrls(json, '../')`.
- [[File:network/modules_manifest.json]] stores root-relative paths (resolve against the repo root, not `network/`).
- Injection replacers use functional form `() => block` so `$` sequences in module markdown cannot corrupt output.
<!-- END_CUSTOM_NOTES -->
