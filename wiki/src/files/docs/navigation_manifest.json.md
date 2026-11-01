---
file_path: "docs/navigation_manifest.json"
title: "navigation_manifest.json"
volume: "vol-3"
kind: "Authoritative JSON Data / Manifest"
current_hash: "64766ca349b9e406"
reviewed_hash: "64766ca349b9e406"
stale: false
size_bytes: 9908
line_count: 241
---

# navigation_manifest.json

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/navigation_manifest.json` is the **Declarative Master Surface & Authority Registry** within **Volume III: Build Pipeline, Compiler & Legacy Scratch Tooling**. It serves as the single machine-readable source of truth defining every primary workstation surface in Creator Studio (14 registered surfaces across `network/`, `regions/`, `tarot/`, `modules/`, `tickets/`, and `wiki/`), mapping each surface to its governing System Reference Documents (SRDs), Architectural Decision Records (ADRs), upstream data sources, and immutability rules.

It is the foundational input to **Stage 1, Stage 2, and Stage 8** of [[File:build_suite.js]] and **Phase 5** of [[File:wiki/build_wiki.js]], as detailed in [[Series:series_e_zero_cors_compiler_and_agent_router]].

---

## Core Invariants & Schema Contract
The JSON document conforms to JSON Schema Draft 2020-12 and defines:
- **Root Metadata**: `project` (`"Creator Studio"`), `version` (`"1.2.0"`), `description`, and `master_build_command` (`"powershell -ExecutionPolicy Bypass -File .\\Build-Suite.ps1"`).
- **`surfaces[]` Array (14 Registered Surfaces)**: Each surface object must declare:
  - `file`: Workspace-relative POSIX path (e.g., `"network/campaign_studio.html"`, `"network/Run-NetworkEngine.ps1"`, `"wiki/index.html"`).
  - `type`: Surface classification (`"html"`, `"powershell"`, or `"markdown"`), which governs comment syntax during Compass Header injection.
  - `title`: Human-readable surface title and pipeline step designation.
  - `authoritative_specs`: Array of relative paths to governing SRDs, ADRs, and guides (e.g., [[File:docs/srd/authoring_engine_srd.md]], [[File:docs/srd/adventure_framework_srd.md]], [[File:CONTEXT.md]]).
  - `data_sources`: Array of upstream files or directories compiled into or read by the surface.
  - `immutable_rule`: Concise operational directive stamped into the surface's Compass Header warning developers/agents against editing compiled outputs directly.

---

## Data Flow & Execution Pipeline
1. **Generate `AGENTS.md` (Stage 2 of [[File:build_suite.js]])**: Reads `navManifest.surfaces` and compiles the **Surface-to-Authority Routing Matrix** table in [[File:AGENTS.md]].
2. **Stamp Compass Headers (Stage 8 of [[File:build_suite.js]])**: `injectCompassHeaders()` iterates over `navManifest.surfaces`, constructs a `CREATOR STUDIO COMPASS HEADER` block containing `SURFACE`, `WIKI PAGE`, `AUTHORITATIVE SPECIFICATIONS`, `DATA PROVENANCE`, and `CRITICAL INSTRUCTION`, and injects it at line 1 of every `.html` (`<!-- ... -->`) and `.ps1` (`<# ... #>`) surface (skipping `wiki/index.html`, which is compiled in Stage 9).
3. **Wire Knowledge Graph Edges ([[File:wiki/build_wiki.js]] lines 974–997)**: Parses `docs/navigation_manifest.json` and generates directed backlink edges (`Registers Surface`, `Routes Agent To`, `Governing Spec`, `Data Source`) connecting `navigation_manifest.json`, [[File:AGENTS.md]], each surface, and its specs/data sources.

---

## AI Agent Maintenance Checklist
- **When creating a new HTML tool, PowerShell CLI script, or catalog surface**: Add an entry to `surfaces[]` in `docs/navigation_manifest.json` and run [[File:Build-Suite.ps1]].
- **When changing a surface's governing SRD or data source**: Edit `docs/navigation_manifest.json` rather than manually editing [[File:AGENTS.md]] or the line-1 Compass Header inside the target HTML/PS1 file.
<!-- END_CUSTOM_NOTES -->
