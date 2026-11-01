---
file_path: "CONTEXT.md"
title: "Creator Studio"
volume: "vol-1"
kind: "Technical Documentation / Guide"
current_hash: "85c6029c3776140b"
reviewed_hash: "85c6029c3776140b"
stale: false
size_bytes: 23397
line_count: 333
---

# Creator Studio

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`CONTEXT.md` is the **Authoritative Ubiquitous Language & Domain Glossary** within **Volume I: System Architecture, Governance & Ontology**. Designed around Domain-Driven Design (DDD) principles, it defines the exact mathematical, sociological, topological, and architectural vocabulary used across all specifications, source scripts, UI labels, and module manifests in Creator Studio, together with explicit `_Avoid_` anti-terms to prevent conceptual drift.

It is referenced as a mandatory authority across almost every surface in [[File:docs/navigation_manifest.json]], [[File:AGENTS.md]], and [[File:docs/AI_DEVELOPER_GUIDE.md]].

---

## Core Invariants & Contracts
Every term defined in `CONTEXT.md` maps 1:1 to concrete data structures and algorithms in the codebase. Using imprecise synonyms (the listed `_Avoid_` terms) in code comments, UI labels, or module YAML frontmatter violates domain consistency:

| Domain Cluster | Canonical Term | Forbidden Synonyms (`_Avoid_`) | Governing Code / Spec Implementation |
| :--- | :--- | :--- | :--- |
| **Network Topology** | **Pointcrawl Graph**, **Node**, **Sovereign Hub**, **Satellite Node**, **Adjacency Smothering**, **Influence Link** | *Map, hex grid, room, capital, major city, suppression, proximity penalty, road* | [[File:docs/srd/authoring_engine_srd.md]], [[File:mods/tarot_balancing/mod.js]], [[File:network/Run-NetworkEngine.ps1]] |
| **Sociology & Hermeneutics** | **Granular Disposition `[S, E, C]`**, **Cultural Quadrant (CVF)**, **Operational Profile**, **Amalgamation Score**, **22nd Card Inversion** | *Alignment, stats, faction type, work style, power level, final card flip* | [[File:sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md]], [[File:sociology/07_Granular_64_Disposition_Matrix.md]], [[Series:series_c_sociology_and_tarot_hermeneutics]] |
| **System Reference Docs** | **Authoring Engine SRD**, **Adventure Framework SRD** | *Rulebook, game system, player's handbook, GM guide* | [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], [[File:docs/srd/authoring_engine_srd.md]], [[File:docs/srd/adventure_framework_srd.md]] |
| **Worldbuilding Content** | **Module**, **Worldbuilding Pipeline Tier (1–5)**, **Resource Tag (`provides` / `requires`)**, **Module Bundle**, **Standalone Fallback Mode**, **Preset** | *Encounter, quest, add-on, level, rarity, tech tree, failsafe, theme, skin* | [[File:docs/srd/ip_module_framework_srd.md]], [[File:src/workstation/scripts/stage_5_slotting.js]], [[Series:series_d_module_supply_chains_and_contracts]] |
| **Hierarchical Cartography** | **Hierarchical Cartography**, **Scale-Fluidity**, **Portal Node (`childMapId`)**, **Bidirectional Wiki & Citation Inverted Index** | *Sub-maps, minimaps, map link pin, doorway, lore links, text search* | [[File:docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md]], [[File:src/workstation/scripts/state_adapter.js]], [[File:src/workstation/scripts/wiki_engine.js]], [[Series:series_b_scale_fluid_nested_cartography]] |
| **Workstation & Extensibility** | **Workstation Shell (`start.html`)**, **Property Grid**, **Mod Extension Area** | *Dashboard, web page, detail view, sidebar form, plugin manager* | [[File:start.html]], [[File:docs/adr/0004-desktop-workstation-start-html.md]], [[File:tickets/system/SYS-START-03_module_extension_sdk_and_runtime_mod_hook_provider.md]] |
| **Campaign Entities & Narrative** | **Active Campaign Roster**, **Module Entity Prototype**, **Node Stationing / Assignment** | *Character list, database, party sheet, sample NPC, flavor text, location tag* | [[File:docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md]], [[File:start.html]] |
| **Demographics, Factions & Rapport (ADR-0015 v2)** | **Demographics** (census + `tags`), **Controlling Faction** (`node.faction`), **Faction Presence** (`factionPresence`), **Party Rapport & Stance** (`partyRapport`), **Transitive Backlink Propagation** | *Demographics-as-flat-array, factions array, partyReputation, Revered / Welcomed / Suspicious, recursive search* | [[File:docs/adr/0015-nested-backlinks-extensible-mentions-and-node-demographics.md]], [[File:src/workstation/scripts/wiki_engine.js]], [[File:src/workstation/scripts/entity_core.js]] |
| **Module Exploration & Sourcebook** | **Module Explorer**, **Slotted Module (`node.modules`)**, **Module Entity Extraction**, **Module Sourcebook Reader** | *File browser, module list, catalog viewer, attached module, character scraping* | [[File:docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md]], [[File:start.html]] |

---

## Data Flow & Execution Pipeline
- **Upstream Architectural Sources**: Synthesizes decisions recorded in [[File:docs/adr/0001-dual-mode-preset-architecture.md]], [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], and [[File:docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md]].
- **Downstream Propagation**:
  - Summarized in Section 3 of [[File:AGENTS.md]] by [[File:build_suite.js]].
  - Enforced across UI tooltips, inspector drawers, and property grids in [[File:start.html]].
  - Linked as an authoritative specification for `network/campaign_studio.html`, `network/network_builder.html`, `network/network_visualizer.html`, `tarot/minor_matrix_browser.html`, and `wiki/index.html` inside [[File:docs/navigation_manifest.json]].

---

## AI Agent Maintenance Checklist
- **Before naming variables, UI controls, or YAML properties**: Read `CONTEXT.md` to ensure identifiers and user-facing strings use canonical terminology (e.g., `sovereignHubs`, `smotheredNodes`, `standalone_fallback`, `childMapId`).
- **When introducing a major architectural concept (ADR)**: Record a new ADR in `docs/adr/` and simultaneously add the canonical domain terms and `_Avoid_` anti-terms to `CONTEXT.md`.
<!-- END_CUSTOM_NOTES -->
