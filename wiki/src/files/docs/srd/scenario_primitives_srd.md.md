---
file_path: "docs/srd/scenario_primitives_srd.md"
title: "CWT-051: Opal Island Module Deconstruction & Scenario Primitives Extraction"
volume: "vol-2"
kind: "System Reference Document (SRD)"
current_hash: "3d79ec331fbf80d3"
reviewed_hash: "3d79ec331fbf80d3"
stale: false
size_bytes: 4588
line_count: 45
---

# CWT-051: Opal Island Module Deconstruction & Scenario Primitives Extraction

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/srd/scenario_primitives_srd.md` (`CWT-051`) is the **Scenario Primitives Deconstruction & Abstraction Specification** within **Volume II: System Reference Documents (The Dual SRD & Substratum)**. Formatted itself as a canonical Tier 1 Meta-Module (`id: CWT-051`, `pipeline_tier: 1`), it codifies the methodology used to deconstruct the 48 setting-specific *Opal Island* modules (`campaigns/opal_island/modules/Set_A..G/`) into universal, setting-agnostic **Scenario Primitives**—reusable dramatic syllogisms, 4-corner tension webs, 4-level hazard dials, and semantic resource tokens that power the broader Creative Writing Ticket backlog (`tickets/creative/backlog/`) and external IP conversions.

It is a core component of [[Series:series_f_campaign_authoring_and_ip_conversion]] and is cross-referenced in [[Series:series_g_duplicate_and_orphan_audit]].

> [!NOTE]
> **Mirrored Specification Surface (`3d79ec331fbf80d3`)**: This file is byte-for-byte identical (`4,588` bytes, 45 lines, SHA-256 prefix `3d79ec331fbf80d3`) to [[File:system/primitives/051_opal_island_module_deconstruction_and_scenario_primitives.md]]. `docs/srd/scenario_primitives_srd.md` serves as the canonical Volume II SRD path referenced by [[File:docs/srd/adventure_framework_srd.md]] and [[File:docs/srd/tier_0_substratum_srd.md]], while `system/primitives/051_...` preserves the `CWT-051` module artifact in the `system/primitives/` directory (tracked under [[Ticket:SYS-AUDIT-01]]).

---

## Core Invariants & Deconstructive Methodology
`docs/srd/scenario_primitives_srd.md` defines three foundational abstraction seams:
- **1. The 3-Step Extraction Pipeline**:
  - **Lajos Egri Dramatic Syllogism**: Abstracting the core dramatic argument (`Premise = Trait + Conflict -> Consequence`) from proprietary setting lore.
  - **John Truby 4-Corner Tension Web**: Mapping local factional conflict onto **Establishment**, **Main Opponent**, **Thematic Shadow**, and **Tertiary Outcast**.
  - **Universal 4-Level Hazard Dial**: Translating localized hazards into standardized Light (DC 10), Moderate (DC 13), Severe (DC 16), and Lethal (DC 20) tiers with 4-tick and 6-tick Threat Clocks.
- **2. The Semantic Token Dictionary**:
  - Replaces setting-locked proper noun trade goods (e.g., *Opal Island Vitriol*, *Argent-Fume*) with typed system-level resource tags (`Acid: High-Purity-Vitriol`, `Bio: Fungal-Toxin-Extract`, `Chem: CaC2-Carbide-Pellets`).
- **3. The "Universes Beyond" Ingestion Seam**:
  - Guarantees that external IPs (defined via [[File:docs/srd/ip_module_framework_srd.md]] and [[File:docs/srd/campaign_preset_specification_srd.md]]) slot seamlessly alongside generic scenario primitives in [[File:network/campaign_studio.html]] and [[File:network/platform_audit_dashboard.html]] without modifying balancing algorithms.

---

## Data Flow & Supply Chain Contract
- **YAML Resource Contract**:
  - `requires`: `["Archive: campaigns/opal_island/modules/"]`
  - `provides`: `["Analysis: Opal-Island-Deconstruction", "Catalog: Generic-Scenario-Primitives"]`
- **Downstream Consumers**:
  - Referenced by [[File:docs/srd/adventure_framework_srd.md]] (Section 11) and [[File:docs/srd/tier_0_substratum_srd.md]].
  - Tracked in [[File:tickets/creative/creative_backlog_manifest.json]] (`CWT-051`) and rendered inside [[File:network/platform_audit_dashboard.html]] and [[File:tickets/unified_ticket_tracker.html]].

---

## AI Agent Maintenance Checklist
- **Synchronization Invariant**: If you edit `docs/srd/scenario_primitives_srd.md`, either mirror the exact change to [[File:system/primitives/051_opal_island_module_deconstruction_and_scenario_primitives.md]] or consolidate them per [[Ticket:SYS-AUDIT-01]].
- **When deconstructing a legacy adventure or setting into reusable modules**: Apply the 3-Step Extraction Pipeline (Egri Syllogism + Truby 4-Corner Matrix + 4-Level Dial & Semantic Resource Tags) defined in this document.
<!-- END_CUSTOM_NOTES -->
