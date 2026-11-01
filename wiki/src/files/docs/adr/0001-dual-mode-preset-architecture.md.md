---
file_path: "docs/adr/0001-dual-mode-preset-architecture.md"
title: "0001: Dual Mode Preset Architecture (Universal Engine Core with Canonical Preset Canon Preset)"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "b861392833336ee4"
reviewed_hash: "b861392833336ee4"
stale: false
size_bytes: 1432
line_count: 17
---

# 0001: Dual Mode Preset Architecture (Universal Engine Core with Canonical Preset Canon Preset)

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/adr/0001-dual-mode-preset-architecture.md` (**ADR-0001**) is the **Foundational Architectural Decision Record Governing Engine-to-Setting Decoupling** within **Volume I: System Architecture, Governance & Ontology**. Originally formulated during the October 2026 System Audit ([[File:docs/audit/2026-10-creator-studio-audit-dossier.md]]) and implemented via [[File:.scratch/creator-remediation/issues/05-extract-preset-adapters.md]], it establishes the strict boundary between the **Universal Engine Core** and plug-and-play **Campaign Presets / Sourcebooks**.

It is a primary authority for [[Series:series_f_campaign_authoring_and_ip_conversion]] and governs [[File:docs/srd/campaign_preset_specification_srd.md]] and [[File:docs/srd/ip_module_framework_srd.md]].

---

## Core Invariants & Architectural Decision
ADR-0001 partitions Creator Studio into two decoupled layers:
- **Layer 1: Universal Engine Core**:
  - Comprises the balancing and simulation engines ([[File:src/campaign_studio/scripts/stage_4_balancing.js]], [[File:network/Run-NetworkEngine.ps1]]), the Tarot sociology compilers ([[File:tarot/generate_tarot_matrix.js]], [[File:tarot/generate_minor_matrix.js]]), and the topological graph schema ([[File:network/generic_network_topology.json]]).
  - **Zero Setting Bleed Invariant**: Core engine code must never hardcode setting-specific proper nouns, faction names, or geographic lore. It operates purely on node IDs (`1..22`), adjacency/influence vectors (`adj`, `infBy`), `[S, E, C]` disposition coordinates, and typed resource tags (`provides` / `requires`).
- **Layer 2: Selectable Preset Adapters & Sourcebook Packages**:
  - Concrete node names, canvas coordinates, 7-wave sequences, 22-card disembark tables, 5-color cultural wheels, and worldbuilding modules reside strictly inside external preset files ([[File:network/presets/generic_archetype.json]], [[File:network/presets/canonical_preset.json]]) and modular campaign packages under `campaigns/<campaign_id>/` (`generic_starter`, `opal_island`, `sun_wukong`).

---

## Data Flow & Downstream Consequences
- **Compile-Time Aggregation**: [[File:build_suite.js]] (Stage 3) scans `campaigns/*/campaign.json` and `preset.json` to assemble `CAMPAIGN_REGISTRY`, injecting both the Universal Generic Starter and setting-specific sourcebooks into [[File:network/campaign_studio.html]], [[File:network/network_visualizer.html]], [[File:network/network_builder.html]], and [[File:network/platform_audit_dashboard.html]].
- **Runtime Switching**: In [[File:src/campaign_studio/scripts/state.js]], `switchCampaign(campaignId)` swaps the active preset topology, wave sequence, disembark table, and module catalog instantaneously in browser memory without modifying any underlying engine formulas.
- **Validation**: New campaign presets are audited against ADR-0001 invariants by [[File:campaigns/Test-CampaignPackage.ps1]].

---

## AI Agent Maintenance Checklist
- **Before adding setting-specific flavor or mechanics**: Verify that no proper nouns from *Opal Island*, *Sun Wukong*, or any external IP are introduced into `src/campaign_studio/scripts/*.js`, `network/Run-NetworkEngine.ps1`, or `tarot/decks/*.json`.
- **When creating a new campaign setting**: Create a new self-contained directory `campaigns/<campaign_id>/` following [[File:docs/srd/campaign_preset_specification_srd.md]] and [[Series:series_f_campaign_authoring_and_ip_conversion]].
<!-- END_CUSTOM_NOTES -->
