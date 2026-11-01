---
file_path: "system/primitives/051_opal_island_module_deconstruction_and_scenario_primitives.md"
title: "CWT-051: Opal Island Module Deconstruction & Scenario Primitives Extraction"
volume: "vol-2"
kind: "Technical Documentation / Guide"
current_hash: "3d79ec331fbf80d3"
reviewed_hash: "3d79ec331fbf80d3"
stale: false
size_bytes: 4588
line_count: 45
---

# CWT-051: Opal Island Module Deconstruction & Scenario Primitives Extraction

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`system/primitives/051_opal_island_module_deconstruction_and_scenario_primitives.md` (`CWT-051`) is the **System Primitives Extraction Artifact** within **Volume II: System Reference Documents (The Dual SRD & Substratum)**. It documents the architectural deconstruction of the 48 *Opal Island* modules (`campaigns/opal_island/modules/Set_A..G/`) into setting-agnostic **Scenario Primitives** (`Analysis: Opal-Island-Deconstruction` and `Catalog: Generic-Scenario-Primitives`).

It is part of [[Series:series_f_campaign_authoring_and_ip_conversion]] and is cataloged in [[Series:series_g_duplicate_and_orphan_audit]].

> [!WARNING]
> **Mirrored Primitives Document ([[Ticket:SYS-AUDIT-01]])**: This file is byte-for-byte identical (`4,588` bytes, 45 lines, SHA-256 hash `3d79ec331fbf80d3`) to [[File:docs/srd/scenario_primitives_srd.md]]. While `system/primitives/051_opal_island_module_deconstruction_and_scenario_primitives.md` serves as the `CWT-051` deliverable inside `system/primitives/`, [[File:docs/srd/scenario_primitives_srd.md]] is the primary SRD surface linked from [[File:docs/srd/adventure_framework_srd.md]] and [[File:docs/srd/tier_0_substratum_srd.md]].

---

## Core Invariants & Contract Schema
- **Module Identity**: `id: CWT-051`, `set: Wave 5 Campaign Presets & Sandboxes`, `pipeline_tier: 1` (`Tier 1: Macro Network & Governance Engine`).
- **Typed Supply Contracts**:
  - `requires`: `["Archive: campaigns/opal_island/modules/"]`
  - `provides`: `["Analysis: Opal-Island-Deconstruction", "Catalog: Generic-Scenario-Primitives"]`
- **4-Level Output Dial (`injected_mechanics.output_dial`)**:
  - `level_1`: Setting Archive Isolation (`campaigns/opal_island/` partition, Light Tier DC 10).
  - `level_2`: Dilemma & Clock Extraction (48 narrative dilemmas and 96 threat clocks classified, Moderate Tier DC 13).
  - `level_3`: Decoupled Primitive Catalog (reusable templates for transit chokepoints, ecological collapses, and succession crises, Severe Tier DC 16).
  - `level_4`: Total Universal Engine Interoperability (zero-CORS external IP module slotting, Complete DC 20).
- **4-Corner Dramatic Opposition Web**:
  - **Establishment**: The Canonical Campaign Purists.
  - **Main Opponent**: The Strict Abstract Modularists.
  - **Thematic Shadow**: The Premature Pruners.
  - **Tertiary Outcast**: The Universal Scenario Primitives.

---

## Data Flow & Execution Pipeline
- **Upstream Source**: Deconstructs the 48 modules in `campaigns/opal_island/modules/Set_A..G/` (originally audited in [[File:docs/audit/2026-10-creator-studio-audit-dossier.md]]).
- **Downstream Integration**: Registered in [[File:wiki/build_wiki.js]] (line 200) as a core component of [[Series:series_f_campaign_authoring_and_ip_conversion]] and linked to [[File:tickets/creative/creative_backlog_manifest.json]] (`CWT-051`).

---

## AI Agent Maintenance Checklist
- **Keep in Sync with `docs/srd/scenario_primitives_srd.md`**: Any edit made to this file must be mirrored to [[File:docs/srd/scenario_primitives_srd.md]] (or vice versa) so their SHA-256 hashes remain aligned until consolidated under [[Ticket:SYS-AUDIT-01]].
<!-- END_CUSTOM_NOTES -->
