---
series_id: "series_e_zero_cors_compiler_and_agent_router"
code: "Series E"
title: "Zero-CORS Offline Bundling, Compass Headers & Self-Updating Wiki Architecture"
volume: "vol-3"
---

# Series E: Zero-CORS Offline Bundling, Compass Headers & Self-Updating Wiki Architecture

> [!IMPORTANT]
> **Cross-Cutting Analytical Series**: How [[File:Build-Suite.ps1]], [[File:build_suite.js]], [[File:wiki/build_wiki.js]], and [[File:docs/navigation_manifest.json]] collaborate to enforce zero-CORS `file:///` execution, inline fenced datasets, resolve `@@INCLUDE@@` directives, stamp Compass Headers, generate [[File:AGENTS.md]], and maintain SHA-256 staleness tracking across the Bidirectional Codebase Wiki.

---

## 1. Architectural Seam Overview & Core Problem Statement

Modern browser security engines treat every local file opened over the `file:///` protocol as an opaque origin (`Origin: null`). Consequently, any runtime attempt by an offline HTML application to load external JSON manifests, Markdown modules, or modular JavaScript components via `fetch()`, `XMLHttpRequest`, or ES6 `<script type="module">` triggers an immediate Cross-Origin Resource Sharing (CORS) security violation.

At the same time, maintaining a 15,000+ line tabletop authoring workstation inside monolithic HTML files creates a **Multiple Source of Truth Hazard** (documented in [[File:docs/audit/2026-10-creator-studio-audit-dossier.md]] and remediated via [[File:.scratch/creator-remediation/issues/04-build-centralized-compiler.md]]). Without a centralized build pipeline, edits to node topologies, Tarot deck profiles, or worldbuilding modules quickly drift out of sync across surfaces.

**Series E** documents the 9-stage compilation architecture that bridges these two requirements: developers and AI agents edit clean, modular source files (`src/workstation/`, `mods/`, `campaigns/`, `tarot/decks/`, `wiki/src/`), while the master compiler assembles 100% self-contained, zero-CORS single-file HTML distributions and self-validating navigation routers.

### Primary Collaborating Subsystem Files
- [[File:Build-Suite.ps1]] — Root PowerShell entry point and Node.js runtime discovery wrapper.
- [[File:build_suite.js]] — Master 9-stage asset bundler, dataset injector, and Compass Header stamper.
- [[File:docs/navigation_manifest.json]] — Declarative JSON registry mapping all 14 workstation surfaces to their governing SRDs, data sources, and immutability rules.
- [[File:AGENTS.md]] — Auto-generated root agent operating manual and Surface-to-Authority routing matrix.
- [[File:docs/AI_DEVELOPER_GUIDE.md]] — Architectural manual governing modular compilation, Global State Swap, and IndexedDB persistence.
- [[File:wiki/build_wiki.js]] — AST symbol extractor, YAML contract parser, SHA-256 staleness tracker, and bidirectional backlink graph compiler.

---

## 2. The 9-Stage Master Compilation Pipeline (`build_suite.js`)

When a human developer or autonomous agent runs `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1`, [[File:Build-Suite.ps1]] locates a valid `node.exe` binary (checking system `PATH`, Adobe Photoshop's bundled Node runtime, and `Program Files` / `LOCALAPPDATA`) and executes [[File:build_suite.js]].

[[File:build_suite.js]] executes nine deterministic compilation stages in strict sequence:

| Stage | Subsystem Operation | Authoritative Inputs | Generated / Mutated Outputs |
| :--- | :--- | :--- | :--- |
| **Stage 1** | Load Navigation Manifest | [[File:docs/navigation_manifest.json]] | In-memory `navManifest` registry (14 surfaces) |
| **Stage 2** | Generate Root Agent Router | `navManifest.surfaces` array | [[File:AGENTS.md]] (root operating manual) |
| **Stage 3** | Discover & Enrich Campaigns | `campaigns/<id>/campaign.json`, `preset.json`, `modules_manifest.json`, `modules/*.md` | In-memory `campaignRegistry`, [[File:network/modules_manifest.json]] |
| **Stage 4b** | Compile Tarot Decks Registry | [[File:tarot/decks/deck_manifest.json]], [[File:tarot/decks/minor/minor_deck_manifest.json]] | In-memory `TAROT_DECKS_DATA` (6 Major & 4 Minor decks) |
| **Stage 5** | Assemble Universal Desktop Workstation | [[File:src/workstation/template.html]], `src/workstation/scripts/*.js`, `mods/` | [[File:start.html]] |
| **Stage 6** | Inline Visualizer & Audit Datasets | `campaignRegistry`, [[File:tickets/creative/creative_backlog_manifest.json]] | [[File:network/network_visualizer.html]], [[File:network/network_builder.html]], [[File:network/platform_audit_dashboard.html]], [[File:tickets/creative/platform_audit_visualizer.html]], [[File:tickets/unified_ticket_tracker.html]] |
| **Stage 7** | Compile Tarot Matrix Suite | [[File:tarot/generate_minor_matrix.js]], [[File:tarot/generate_tarot_matrix.js]] | [[File:tarot/minor_matrix_browser.html]], [[File:tarot/tarot_matrix_browser.html]], [[File:tarot/tarot_sociology_matrix.json]], [[File:tarot/tarot_minor_arcana_matrix.json]] |
| **Stage 8** | Stamp Surface Compass Headers | `navManifest.surfaces` metadata | Line-1 header comments in all registered `.html` and `.ps1` surfaces |
| **Stage 9** | Compile Codebase Wiki & Backlinks | [[File:wiki/build_wiki.js]], `wiki/src/files/**`, `wiki/src/series/*.md` | [[File:wiki/index.html]], `wiki/pages/**`, `wiki/wiki_manifest.json`, `wiki/search_index.js` |

---

## 3. Deep Dive: Modular Template Resolution & Fenced Dataset Injection

### 3.1 Recursive `@@INCLUDE@@` Resolution (Stage 5)
To prevent developers from editing a monolithic HTML file, [[File:start.html]] is authored as modular JavaScript controllers and shell templates under `src/workstation/`. During Stage 5, [[File:build_suite.js]] reads [[File:src/workstation/template.html]] and resolves all JavaScript include directives matching the regular expression:

```javascript
const includeRegex = /(?:<!--|\/\/)\s*@@INCLUDE:\s*([^\s@]+)\s*@@\s*(?:-->)?/g;
```

- JavaScript engine modules (such as [[File:src/workstation/scripts/state_adapter.js]], [[File:src/workstation/scripts/entity_manager.js]], [[File:src/workstation/scripts/stage_5_slotting.js]], and [[File:src/workstation/scripts/wiki_engine.js]]) are injected via `// @@INCLUDE: scripts/... @@`.
- Mod extensions from `mods/` are registered dynamically via `window.CreatorStudio.registerMod()`.

### 3.2 Campaign Discovery & Markdown Metadata Extraction (Stage 3)
Before injecting datasets into HTML tools, [[File:build_suite.js]] scans every subdirectory in `campaigns/` (ignoring directories prefixed with `_` or `.`). For each campaign containing a valid `campaign.json` (e.g., [[File:campaigns/generic_starter/campaign.json]], [[File:campaigns/opal_island/campaign.json]], [[File:campaigns/sun_wukong/campaign.json]]):
- It loads the 22-node topology and 7-wave sequence from `preset.json`.
- It loads `modules_manifest.json` and resolves each module's `.md` file on disk.
- If a module entry in `modules_manifest.json` lacks explicit `threat_clocks`, `dials`, or `four_corners` properties, [[File:build_suite.js]] parses the raw Markdown source on the fly using regex extractors to populate `m.threat_clocks`, `m.dials` (Levels 1–4), `m.four_corners` (`establishment`, `opponent`, `shadow`, `outcast`), and `m.file_url`.

### 3.3 Fenced Dataset Injection & Replacement Markers
Once `campaignRegistry`, `modules`, and `genericWaves` are assembled in memory, [[File:build_suite.js]] injects them into the offline HTML surfaces using two mechanisms:
- **Placeholder Token Injection (in [[File:src/workstation/template.html]])**: Replaces `// @@INJECT_TAROT_DECKS_DATA@@`, `// @@INJECT_MODS_REGISTRY@@`, and `// @@INJECT_MASTER_TICKETS_DATA@@` with serialized JavaScript constants.
- **Fenced Block Regex Replacement (in standalone HTML tools)**: In files like [[File:network/network_visualizer.html]], [[File:network/network_builder.html]], and [[File:network/platform_audit_dashboard.html]], [[File:build_suite.js]] locates fenced comment blocks (`// [AUTO-GENERATED ... VIA build_suite.js] ... // [END AUTO-GENERATED ...]`) and replaces their contents idempotently. Notice that inside [[File:network/platform_audit_dashboard.html]], closing `</script>` tags inside raw module Markdown are escaped as `<\/script>` to prevent premature script tag termination in the browser DOM.

---

## 4. Agent Routing: `navigation_manifest.json`, `AGENTS.md`, and Compass Headers

Creator Studio enforces architectural governance across both human contributors and AI coding agents through a three-part routing loop anchored by [[File:docs/navigation_manifest.json]]:

- **Declarative Authority Registry (`docs/navigation_manifest.json`)**: Every user-facing HTML surface, PowerShell runner, and catalog README is registered as an entry in `surfaces[]` with five mandatory properties: `file`, `type` (`html`, `powershell`, or `markdown`), `title`, `authoritative_specs[]`, `data_sources[]`, and `immutable_rule`.
- **Root Operating Manual (`AGENTS.md`)**: In Stage 2, [[File:build_suite.js]] overwrites [[File:AGENTS.md]] at the workspace root with the 5 Ground Rules and the **Surface-to-Authority Routing Matrix** table compiled directly from `navManifest.surfaces`. Because [[File:AGENTS.md]] is auto-generated, manual edits to [[File:AGENTS.md]] will be overwritten on the next build; permanent routing changes must be made in [[File:docs/navigation_manifest.json]].
- **Post-Build Compass Header Stamping (`injectCompassHeaders()`)**: In Stage 8, [[File:build_suite.js]] iterates over every surface in `navManifest.surfaces` (skipping `wiki/index.html`, which is generated in Stage 9) and injects or refreshes a standardized `CREATOR STUDIO COMPASS HEADER` block at line 1 of the file (`<!-- ... -->` for HTML files, `<# ... #>` for PowerShell scripts). This guarantees that even if an AI agent views a compiled surface file directly without reading [[File:AGENTS.md]] first, line 1 of the file immediately alerts the agent to its compiled status, its wiki page path, its governing SRDs, and the `Build-Suite.ps1` compilation command.

---

## 5. Self-Updating Codebase Wiki & SHA-256 Staleness Architecture (`wiki/build_wiki.js`)

Stage 9 of [[File:build_suite.js]] invokes [[File:wiki/build_wiki.js]] to compile the 8-Volume Technical Manual & Bidirectional Codebase Wiki.

### 5.1 Workspace Discovery & Volume Classification
[[File:wiki/build_wiki.js]] recursively walks the workspace (excluding `.git`, `node_modules`, `.zip`, `.pdf`, `regions/images/`, `wiki/pages/`, and `wiki/src/`) and classifies every tracked file into one of **8 Volumes** (`classifyVolume(relPath)`) and a specific **File Kind** (`classifyFileKind(relPath)`).

### 5.2 Non-Destructive Custom Notes & SHA-256 Hash Tracking
For every tracked file `<relPath>`, [[File:wiki/build_wiki.js]] maintains a 1:1 Markdown source file at `wiki/src/files/<relPath>.md`:
- **Content Hash Computation**: `computeFileHash(fullPath)` computes the first 16 hexadecimal characters of the file's SHA-256 digest (`crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)`).
- **Custom Notes Preservation**: `syncMarkdownSourceForFile(meta)` extracts everything inside the `<!-- BEGIN_CUSTOM_NOTES --> ... <!-- END_CUSTOM_NOTES -->` markers from the existing `wiki/src/files/<relPath>.md` file and preserves it untouched while refreshing the YAML frontmatter (`current_hash`, `size_bytes`, `line_count`).
- **Staleness Detection (`stale: true | false`)**: The YAML frontmatter stores both `current_hash` (the live SHA-256 prefix of the source file on disk) and `reviewed_hash` (the hash when a human or agent last audited the wiki page). If `reviewed_hash !== current_hash`, `isStale` is set to `true` (unless `--stamp-reviewed` is passed to `build_wiki.js`), flagging the file in the compiled HTML wiki as needing documentation review.

### 5.3 Multi-Pass AST Extraction & Bidirectional Knowledge Graph
[[File:wiki/build_wiki.js]] combines static analysis with explicit wiki tokens to construct a complete directed graph (`outbound` and `inbound` maps in `buildKnowledgeGraph(allMetas)`):
- **Static Code & Frontmatter Extraction**:
  - `.js` files: Extracts top JSDoc comments, function signatures (`function name(...)`), and top-level globals (`let`/`const`/`var`). Cross-references function invocations across `src/workstation/scripts/*.js` and `mods/`.
  - `.ps1` files: Extracts `.SYNOPSIS`, `.DESCRIPTION`, and PowerShell `function` declarations.
  - `.html` files: Extracts `<title>`, `@@INCLUDE@@` directives, and inline function declarations.
  - `.md` files: Parses YAML frontmatter (`provides`, `requires`, `pipeline_tier`, `tarot_affinity`, `culture_quadrant`), headings, Threat Clocks, 4-Level Dials, Dramatic Syllogisms, 4-Corner Opposition matrices, and real-world historical/literary anchors (`extractReferenceSources`).
  - **Supply Chain Matching**: Automatically links any module declaring `requires: ["Category: Asset"]` to all modules declaring `provides: ["Category: Asset"]`.
  - **Audit Flagging ([[Ticket:SYS-AUDIT-01]])**: Checks every file against `AUDIT_FLAGS` and links duplicate/legacy files to their canonical counterparts and [[Series:series_g_duplicate_and_orphan_audit]].
- **Explicit Wiki Token Resolution (`scanTextForLinks`)**:
  - `[[File:relative/path]]` creates a `Wiki Citation` edge to `file:relative/path`.
  - `[[Series:series_id]]` creates a `Series Citation` edge to `series:series_id`.
  - `[[Ticket:ID]]` creates a `Ticket Citation` edge to the corresponding ticket markdown file in `tickets/`.
  - `[[Mod:ID]]` creates a `Module Citation` edge to all campaign modules matching `ID` (e.g., [[Mod:INFRA-01]]).

---

## 6. AI Agent Maintenance & Verification Protocol

Whenever an autonomous agent or developer modifies the build pipeline, adds a new workstation surface, or updates source files:
- **Never edit compiled targets directly**: Do not edit [[File:AGENTS.md]], [[File:start.html]], [[File:network/campaign_studio.html]], or `wiki/pages/**` by hand.
- **Register new surfaces in `docs/navigation_manifest.json`**: Adding a surface to [[File:docs/navigation_manifest.json]] automatically adds it to [[File:AGENTS.md]], stamps its Compass Header, and wires its governing specification edges into the Wiki knowledge graph.
- **Update Wiki Custom Notes**: When modifying a source file `<relPath>`, update the `<!-- BEGIN_CUSTOM_NOTES -->` section in `wiki/src/files/<relPath>.md` and synchronize `reviewed_hash` to match the file's new 16-char SHA-256 prefix.
- **Run the Master Compiler**: Execute `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1` to run Stages 1–9 end-to-end.
