---
series_id: "series_e_zero_cors_compiler_and_agent_router"
code: "Series E"
title: "Zero-CORS Offline Bundling, Compass Headers & Self-Updating Wiki Architecture"
volume: "vol-3"
---

# Series E: Zero-CORS Offline Bundling, Compass Headers & Self-Updating Wiki Architecture

> [!IMPORTANT]
> **Cross-Cutting Analytical Series**: How [[File:Build-Suite.ps1]], [[File:build_suite.js]], [[File:wiki/build_wiki.js]], and [[File:docs/navigation_manifest.json]] collaborate to enforce zero-CORS `file:///` execution, inline fenced datasets, resolve `@@INCLUDE@@` directives, stamp Compass Headers, generate [[File:AGENTS.md]], and compile the Technical Manual Series and AST Codebase Graph (`wiki/wiki_graph.json`).

---

## 1. Architectural Seam Overview & Core Problem Statement

Modern browser security engines treat every local file opened over the `file:///` protocol as an opaque origin (`Origin: null`). Consequently, any runtime attempt by an offline HTML application to load external JSON manifests, Markdown modules, or modular JavaScript components via `fetch()`, `XMLHttpRequest`, or ES6 `<script type="module">` triggers an immediate Cross-Origin Resource Sharing (CORS) security violation.

At the same time, maintaining a 15,000+ line tabletop authoring workstation inside monolithic HTML files creates a **Multiple Source of Truth Hazard** (documented in [[File:docs/audit/2026-10-creator-studio-audit-dossier.md]]). Without a centralized build pipeline, edits to node topologies, sociological matrices, or worldbuilding modules quickly drift out of sync across surfaces.

**Series E** documents the centralized compilation architecture that bridges these two requirements: developers and AI agents edit clean, modular source files (`src/workstation/`, `mods/`, `campaigns/`, `wiki/src/series/`), while the master compiler assembles 100% self-contained, zero-CORS single-file HTML distributions and self-validating navigation routers.

### Primary Collaborating Subsystem Files
- [[File:Build-Suite.ps1]] — Root PowerShell entry point and Node.js runtime discovery wrapper.
- [[File:build_suite.js]] — Master asset bundler, dataset injector, and Compass Header stamper.
- [[File:docs/navigation_manifest.json]] — Declarative JSON registry mapping workstation surfaces to their governing SRDs, data sources, and immutability rules.
- [[File:AGENTS.md]] — Auto-generated root agent operating manual and Surface-to-Authority routing matrix.
- [[File:docs/AI_DEVELOPER_GUIDE.md]] — Architectural manual governing modular compilation, Global State Swap, and IndexedDB persistence.
- [[File:wiki/build_wiki.js]] — AST symbol extractor, YAML contract parser, Series HTML renderer, and bidirectional backlink graph compiler.

---

## 2. The Master Compilation Pipeline (`build_suite.js`)

When a human developer or autonomous agent runs `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1`, [[File:Build-Suite.ps1]] locates a valid `node.exe` binary and executes [[File:build_suite.js]].

| Stage | Subsystem Operation | Authoritative Inputs | Generated / Mutated Outputs |
| :--- | :--- | :--- | :--- |
| **Step 1–2** | Load Manifest & Generate Agent Router | [[File:docs/navigation_manifest.json]] | [[File:AGENTS.md]] (root operating manual) |
| **Step 3** | Discover & Enrich Campaigns | `campaigns/<id>/campaign.json`, `preset.json`, `topology.json`, `modules/*.md` | In-memory `campaignRegistry`, [[File:network/campaign_odv_matrices.js]], [[File:network/modules_manifest.json]] |
| **Step 4c & 6b** | Compile Surface Catalog & Platform Explorer | `campaignRegistry`, `mods/*/modules/*.md`, [[File:tickets/creative/creative_backlog_manifest.json]] | `ALL_SURFACES_DATA`, [[File:network/platform_audit_dashboard.html]] |
| **Step 6c** | Compile Unified Ticket Tracker & Mod Registry | [[File:tickets/build_unified_tracker.js]], `mods/*/mod.js` | [[File:tickets/master_ticket_manifest.json]], [[File:tickets/unified_ticket_tracker.html]], `startModsBlock` |
| **Step 6d** | Assemble Universal Desktop Workstation | [[File:src/workstation/template.html]], `src/workstation/scripts/*.js`, `mods/` | [[File:start.html]] |
| **Step 6e–8** | Emit Redirect Stubs, CSS & Stamp Compass Headers | `navManifest.surfaces`, [[File:scripts/build_zero_cors_css.js]] | [[File:index.html]], `network/*.html` stubs, Compass Headers |
| **Step 9** | Compile Technical Manual Series & Codebase Graph | [[File:wiki/build_wiki.js]], `wiki/src/series/*.md` | `wiki/index.html`, `wiki/pages/series/*.html`, `wiki/wiki_graph.json`, `wiki/search_index.js` |

---

## 3. Deep Dive: Modular Template Resolution & Fenced Dataset Injection

### 3.1 Recursive `@@INCLUDE@@` Resolution (Step 6d)
To prevent developers from editing a monolithic HTML file, [[File:start.html]] is authored as modular JavaScript controllers and shell templates under `src/workstation/`. During assembly, [[File:build_suite.js]] reads [[File:src/workstation/template.html]] and resolves all JavaScript include directives matching:

```javascript
const includeRegex = /(?:<!--|\/\/)\s*@@INCLUDE:\s*([^\s@]+)\s*@@\s*(?:-->)?/g;
```

- JavaScript engine modules (such as [[File:src/workstation/scripts/state_adapter.js]], [[File:src/workstation/scripts/entity_manager_ui.js]], [[File:src/workstation/scripts/supply_chain_simulator.js]], and [[File:src/workstation/scripts/wiki_engine.js]]) are injected via `// @@INCLUDE: scripts/... @@`.
- Mod extensions from `mods/` are registered dynamically via `window.CreatorStudio.registerMod()`.

### 3.2 Campaign Discovery & Markdown Metadata Extraction (Step 3)
Before injecting datasets into HTML tools, [[File:build_suite.js]] scans subdirectories in `campaigns/` containing a valid `campaign.json` (e.g., [[File:campaigns/Peridot/campaign.json]], [[File:campaigns/TheElderScrolls_Morrowind/campaign.json]]):
- It loads the topology and preset JSON (`preset.json` / `topology.json`).
- It scans `modules/*.md` and merges module contracts (`provides`, `requires`, `threat_clocks`, `dials`, `four_corners`) into `modules_manifest.json` and `ALL_MODULES`.

### 3.3 Fenced Dataset Injection & Replacement Markers
Once `campaignRegistry` and `modules` are assembled in memory, [[File:build_suite.js]] injects them into the offline HTML surfaces using placeholder tokens (`// @@INJECT_MODS_REGISTRY@@`, `// @@INJECT_MASTER_TICKETS_DATA@@`) in [[File:src/workstation/template.html]] and fenced block replacement in standalone HTML tools such as [[File:network/platform_audit_dashboard.html]].

---

## 4. Agent Routing: `navigation_manifest.json`, `AGENTS.md`, and Compass Headers

Creator Studio enforces architectural governance across human contributors and AI coding agents through a three-part routing loop anchored by [[File:docs/navigation_manifest.json]]:

- **Declarative Authority Registry (`docs/navigation_manifest.json`)**: Every registered surface in `surfaces[]` declares `file`, `type`, `title`, `authoritative_specs[]`, `data_sources[]`, and `immutable_rule`.
- **Root Operating Manual (`AGENTS.md`)**: In Step 2, [[File:build_suite.js]] overwrites [[File:AGENTS.md]] at the workspace root with the Ground Rules and the **Surface-to-Authority Routing Matrix**. Permanent routing changes must be made in [[File:docs/navigation_manifest.json]] (or the generator template in [[File:build_suite.js]]).
- **Post-Build Compass Header Stamping (`injectCompassHeaders()`)**: In Step 8, [[File:build_suite.js]] stamps a `CREATOR STUDIO COMPASS HEADER` block at line 1 of registered HTML, PowerShell, and Markdown surfaces pointing to their governing specifications and build command.

---

## 5. Curated Series Wiki & Machine-Extracted Codebase Graph (`wiki/build_wiki.js`)

Step 9 of [[File:build_suite.js]] invokes [[File:wiki/build_wiki.js]] to compile the **7 Cross-Cutting Subsystem Series** and the **AST & Supply-Chain Knowledge Graph** (`wiki/wiki_graph.json`).

### 5.1 Workspace Discovery & Volume Classification
[[File:wiki/build_wiki.js]] recursively walks the workspace (excluding `.git`, `node_modules`, `.zip`, `.pdf`, `regions/images/`, `wiki/`, `tickets/`, `scratch/`, and `infographic/`) and classifies indexed files into **8 Volumes** (`classifyVolume(relPath)`) and a **File Kind** (`classifyFileKind(relPath)`).

### 5.2 Curated Series Without 1:1 Per-File Boilerplate
Architectural prose is intentionally concentrated in the **7 Cross-Cutting Series** (`wiki/src/series/*.md`) and **ADRs** (`docs/adr/*.md`), rather than maintaining 1:1 Markdown note stubs or SHA-hash staleness stamps for hundreds of individual files. Compiled outputs (`wiki/index.html`, `wiki/pages/`, `wiki/search_index.js`, `wiki/wiki_manifest.json`, `wiki/wiki_graph.json`) are `.gitignore`d build artifacts regenerated locally by `Build-Suite.ps1` or `Find-CodebaseNode.ps1`.

### 5.3 Multi-Pass AST Extraction & Bidirectional Knowledge Graph
[[File:wiki/build_wiki.js]] combines static analysis with explicit wiki tokens to construct a directed graph (`outbound` and `inbound` maps in `buildKnowledgeGraph(allMetas)`):
- **Static Code & Frontmatter Extraction**:
  - `.js` files: Extracts top JSDoc comments, function signatures (`function name(...)`), and top-level globals (`let`/`const`/`var`). Cross-references function invocations across `src/workstation/scripts/*.js` and `mods/`.
  - `.ps1` files: Extracts `.SYNOPSIS`, `.DESCRIPTION`, and PowerShell `function` declarations.
  - `.html` files: Extracts `<title>`, `@@INCLUDE@@` directives, and inline function declarations.
  - `.md` files: Parses YAML frontmatter (`provides`, `requires`, `pipeline_tier`, `tarot_affinity`, `culture_quadrant`), headings, Threat Clocks, 4-Level Dials, Dramatic Syllogisms, 4-Corner Opposition matrices, and real-world historical/literary anchors (`extractReferenceSources`).
  - **Supply Chain Matching**: Automatically links any module declaring `requires: ["Category: Asset"]` to all modules declaring `provides: ["Category: Asset"]`.
  - **Audit Flagging ([[Ticket:SYS-AUDIT-01]])**: Checks files against `AUDIT_FLAGS` and links legacy/mirror files to [[Series:series_g_duplicate_and_orphan_audit]].
- **Explicit Wiki Token Resolution (`scanTextForLinks`)**:
  - `[[File:path/to/file]]` creates a `Wiki Citation` edge to `file:path/to/file`.
  - `[[Series:series_id]]` creates a `Series Citation` edge to `series:series_id`.
  - `[[Ticket:ID]]` creates a `Ticket Citation` edge to the corresponding ticket markdown file in `tickets/`.
  - `[[Mod:ID]]` creates a `Module Citation` edge to all campaign modules matching `ID` (e.g., [[Mod:INFRA-01]]).

---

## 6. AI Agent Maintenance & Verification Protocol

Whenever an autonomous agent or developer modifies the build pipeline, adds a new workstation surface, or updates source files:
- **Never edit compiled targets directly**: Do not edit [[File:AGENTS.md]], [[File:start.html]], [[File:network/campaign_studio.html]], or `wiki/pages/**` by hand.
- **Register new surfaces in `docs/navigation_manifest.json`**: Adding a surface to [[File:docs/navigation_manifest.json]] automatically adds it to [[File:AGENTS.md]], stamps its Compass Header, and wires its governing specification edges into the codebase graph.
- **Update Series / ADRs only on architectural changes**: Edit `wiki/src/series/*.md` or `docs/adr/*.md` when cross-cutting subsystem contracts or ownership boundaries change.
- **Run the Master Compiler & Test Gate**: Execute `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1` and `powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1` (or `Find-CodebaseNode.ps1 -Check` for graph integrity).
