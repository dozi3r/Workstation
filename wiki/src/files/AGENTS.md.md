---
file_path: "AGENTS.md"
title: "AGENTS.md: Creator Studio Agent Operating Manual & Router"
volume: "vol-1"
kind: "Technical Documentation / Guide"
current_hash: "4a3d4494b7e1ed8d"
reviewed_hash: "4a3d4494b7e1ed8d"
stale: false
size_bytes: 11746
line_count: 55
---

# AGENTS.md: Creator Studio Agent Operating Manual & Router

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`AGENTS.md` is the **Auto-Generated Root Agent Operating Manual & Surface-to-Authority Router** within **Volume I: System Architecture, Governance & Ontology**. Positioned at the workspace root so autonomous AI coding assistants (Google Antigravity, Claude Code, Cursor) ingest it automatically as a system rule, it establishes the non-negotiable engineering ground rules and maps every interactive HTML tool, PowerShell CLI engine, and catalog surface to its governing System Reference Documents (SRDs), authoritative JSON/Markdown data sources, and compilation triggers.

This file is a core component of [[Series:series_e_zero_cors_compiler_and_agent_router]] and works in tandem with [[File:docs/navigation_manifest.json]], [[File:build_suite.js]], and [[File:docs/AI_DEVELOPER_GUIDE.md]].

---

## Core Invariants & Contracts
> [!WARNING]
> **Auto-Generated Compilation Artifact**: `AGENTS.md` is dynamically overwritten during **Stage 2** of [[File:build_suite.js]] (lines 50–94) using the surface registry defined in [[File:docs/navigation_manifest.json]]. **Never edit `AGENTS.md` manually** without also updating [[File:docs/navigation_manifest.json]] or the template string in [[File:build_suite.js]], or your changes will be wiped on the next run of [[File:Build-Suite.ps1]].

The router enforces five foundational workspace invariants across all engineering sessions:
- **1. Zero-CORS Offline Execution (`file:///`)**: All HTML workstations (`start.html`, `network/*.html`, `tarot/*.html`, `regions/*.html`, `wiki/*.html`) must execute cleanly when opened directly from local disk without a web server.
- **2. Modular Source of Truth**: Edit workstation UI and logic in `src/workstation/template.html` and `src/workstation/scripts/*.js` (compiled into `start.html`). Edit data in source `.md`/`.json` files rather than inlined HTML constants (`ALL_MODULES`, `CAMPAIGN_REGISTRY`, `TAROT_DECKS_DATA`, `MASTER_TICKETS_DATA`).
- **3. Mandatory Suite Compilation**: Changes to modular workstation sources (`src/workstation/`), campaign packages (`campaigns/`), Tarot decks (`tarot/decks/`), or manifests must be compiled via [[File:Build-Suite.ps1]].
- **4. Mathematical Parity**: Amalgamation scoring (`Round(BaseWeight + 0.5 * sum(InfBy), 2)`), deterministic ascending Node ID tie-breaking, and Adjacency Smothering must produce identical results across [[File:src/workstation/scripts/balancing_engine.js]] (`start.html`) and [[File:network/Run-NetworkEngine.ps1]] (see [[Series:series_a_balancing_and_smothering_math]] and [[File:docs/srd/authoring_engine_srd.md]]).
- **5. Bidirectional Codebase Wiki Synchronization**: Every repository file has a 1:1 Markdown source in `wiki/src/files/<relPath>.md` compiled by [[File:wiki/build_wiki.js]] into `wiki/pages/<relPath>.html`.

---

## Data Flow & Execution Pipeline
- **Upstream Input**: [[File:docs/navigation_manifest.json]] (`surfaces[]` array containing `file`, `title`, `authoritative_specs`, `data_sources`, and `immutable_rule`).
- **Transformation Engine**: [[File:build_suite.js]] (Stage 2, lines 48–94) reads `navManifest.surfaces`, formats each entry into the 4-column Surface-to-Authority Routing Matrix, prepends Task-Branch Context Pointers, appends canonical domain terminology from [[File:CONTEXT.md]], and writes `AGENTS.md`.
- **Downstream Consumers**:
  - Ingested as a top-level workspace rule by autonomous AI agents before modifying any file.
  - Indexed by [[File:wiki/build_wiki.js]] to create `Routes Agent To` knowledge-graph edges connecting `AGENTS.md` to all registered workstation surfaces.

---

## AI Agent Maintenance Checklist
- **Before editing any repository file**: Consult the **Task-Branch Context Pointers** and **Surface-to-Authority Routing Matrix** in `AGENTS.md` to identify the authoritative specification (e.g., [[File:docs/srd/authoring_engine_srd.md]], [[File:docs/srd/adventure_framework_srd.md]], [[File:docs/srd/tier_0_substratum_srd.md]]) and upstream data source.
- **When adding a new HTML tool or PowerShell runner**: Register the new surface in [[File:docs/navigation_manifest.json]] first, then run [[File:Build-Suite.ps1]] so `AGENTS.md` and the surface's line-1 Compass Header are updated automatically.
- **When updating domain terminology**: Update [[File:CONTEXT.md]] and synchronize Section 4 of the `AGENTS.md` generator template in [[File:build_suite.js]].
<!-- END_CUSTOM_NOTES -->
