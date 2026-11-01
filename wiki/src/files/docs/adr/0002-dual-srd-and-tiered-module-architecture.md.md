---
file_path: "docs/adr/0002-dual-srd-and-tiered-module-architecture.md"
title: "0002: Dual SRD and Tiered Worldbuilding Module Architecture"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "b30582383c23aaff"
reviewed_hash: "b30582383c23aaff"
stale: false
size_bytes: 2147
line_count: 22
---

# 0002: Dual SRD and Tiered Worldbuilding Module Architecture

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/adr/0002-dual-srd-and-tiered-module-architecture.md` (**ADR-0002**) is the **Architectural Decision Record Governing the Dual SRD Split and the 5-Tier Worldbuilding Module Pipeline** within **Volume I: System Architecture, Governance & Ontology**. Formulated to resolve the taxonomic and dependency flaws identified in Stage 3 of [[File:docs/audit/2026-10-creator-studio-audit-dossier.md]] and executed via tickets `06` through `10` in `.scratch/creator-remediation/issues/`, it separates compile/authoring math from tabletop runtime procedures and stratifies all worldbuilding modules into five dependency-aware tiers.

It is the primary architectural authority for [[Series:series_d_module_supply_chains_and_contracts]], [[File:docs/srd/authoring_engine_srd.md]], and [[File:docs/srd/adventure_framework_srd.md]].

---

## Core Invariants & Architectural Decisions

### 1. The Dual SRD Partition
ADR-0002 prohibits mixing pointcrawl graph math with tabletop RPG resolution mechanics inside the same specification:
- **[[File:docs/srd/authoring_engine_srd.md]] (Authoring Engine SRD)**: Codifies the mathematical graph $G = (V, E_{adj}, E_{inf})$, the 64-cell `[S, E, C]` disposition algebra, the 7-wave Tarot draw protocol, Amalgamation Score rounding, Adjacency Smothering, Card 22 Inversion, socket capacities, and BFS supply reachability.
- **[[File:docs/srd/adventure_framework_srd.md]] (Universal Adventure Framework SRD)**: Codifies system-agnostic tabletop runtime mechanics—4/6/8-tick Threat Clocks, Light/Moderate/Severe/Lethal difficulty and damage tiers (d20 DC vs. 2d6 target vs. damage dice), 4-level dynamic module dials, Campaign Turn fuel/power audits, and Clock-Driven Supply Severance Degradation.

### 2. The 5-Tier Worldbuilding Module Pipeline
Replacing the flat legacy catalog where macro network rules (`FACT-01`) and transit corridors (`EDGE-01`) were improperly slotted into single nodes, every module must declare `pipeline_tier: 1..5` (extended by [[File:docs/srd/tier_0_substratum_srd.md]] with `pipeline_tier: 0` for mundane survival substratum):
- **Tier 1 (Macro Network & Governance)**: System-wide geopolitical rules, tension matrices, and equilibrium triggers (e.g., [[Mod:FACT-01]], [[Mod:FACT-03]]).
- **Tier 2 (Topological & Biome Anchors)**: Node biomes, ecological hazards, and physical edge transit corridors (e.g., [[Mod:ECOL-01]], [[Mod:EDGE-01]]..[[Mod:EDGE-05]]).
- **Tier 3 (Infrastructural Supply Chains)**: Industrial production, power generation, smelting, and defense nodes with explicit `provides: [...]` and `requires: [...]` Resource Tags (e.g., [[Mod:INFRA-01]] $\to$ [[Mod:INFRA-02]] $\to$ [[Mod:INFRA-03]]).
- **Tier 4 (Dynamic Narrative Sparks & Clocks)**: Faction dilemmas, ideological conflation warfare, plagues, and dock arrival gambits (e.g., [[Mod:CONF-01]], [[Mod:SPARK-01]]).
- **Tier 5 (Esoteric & Eschatological Engines)**: Reality anomalies, time loops, and campaign-climax colliders (e.g., [[Mod:ESOT-03]], [[Mod:ESOT-06]]).

---

## Data Flow & Downstream Implementation
- **Module Frontmatter Contract**: Every `.md` module in `campaigns/*/modules/` declares `pipeline_tier`, `provides: [...]`, `requires: [...]`, and `standalone_fallback`.
- **Stage 5 Slotting & BFS Supply Verification**: [[File:src/campaign_studio/scripts/stage_5_slotting.js]] reads these fields to enforce node vs. corridor socketing, calculate module Recommendation Scores $RS(m, v)$, recommend curated **Module Bundles**, and compute live BFS supply-chain reachability across unsevered `transit` corridors.
- **Wiki Supply Graph**: [[File:wiki/build_wiki.js]] (lines 918–928, 1057–1065) automatically indexes all `provides` and `requires` tags across the repository to generate `Requires Resource From` backlinks between producer and consumer modules.

---

## AI Agent Maintenance Checklist
- **When authoring or editing any worldbuilding module**: Ensure YAML frontmatter includes valid `pipeline_tier`, typed `provides`, typed `requires`, and `standalone_fallback` fields, and run [[File:campaigns/Test-CampaignPackage.ps1]].
- **When modifying engine math vs. tabletop runtime rules**: Route graph/balancing math changes to [[File:docs/srd/authoring_engine_srd.md]] and tabletop clock/DC/severance rules to [[File:docs/srd/adventure_framework_srd.md]].
<!-- END_CUSTOM_NOTES -->
