---
file_path: "docs/srd/ip_module_framework_srd.md"
title: "IP Module Framework SRD"
volume: "vol-2"
kind: "System Reference Document (SRD)"
current_hash: "f2829a06f73fe0b5"
reviewed_hash: "f2829a06f73fe0b5"
stale: false
size_bytes: 10693
line_count: 136
---

# IP Module Framework SRD

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/srd/ip_module_framework_srd.md` is the **Universal Cross-Domain Ingestion & IP Translation Standard** within **Volume II: System Reference Documents (The Dual SRD & Substratum)**. Functioning as the "Rosetta Stone" of Creator Studio under [[File:docs/adr/0001-dual-mode-preset-architecture.md]] and [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], it specifies how any external Intellectual Property (historical eras, shonen anime, sci-fi universes, or classic tabletop modules) is translated into system-agnostic, mechanically interoperable pointcrawl modules without prose bloat or ruleset lock-in.

It is the primary theoretical and practical foundation for [[Series:series_f_campaign_authoring_and_ip_conversion]], [[File:templates/IP_MODULE_TEMPLATE.md]], and the three canonical cross-domain reference exemplars:
- **Historical Exemplar**: [[File:templates/examples/HIST-01_The_Crossing_of_the_Rubicon.md]] (*Julius Caesar Crossing the Rubicon, 49 BC*).
- **Anime / Sci-Fi Exemplar**: [[File:templates/examples/DBZ-01_The_Siege_of_Planet_Namek.md]] (*Dragon Ball Z: The Siege of Planet Namek*).
- **Classic Tabletop Exemplar**: [[File:templates/examples/DND-01_The_Mists_of_Barovia.md]] (*Ravenloft / Curse of Strahd: The Mists of Barovia*).

---

## Core Invariants & The 7-Component Translation Contract
When translating any setting or IP element into a Creator Studio module, the author must map narrative lore into seven structured components:

| Component | Schema Field / Section | Structural Rule & Cross-Domain Examples |
| :--- | :--- | :--- |
| **1. Pipeline Tier Classification** | `pipeline_tier: 1..5` | **Tier 1** (Macro Governance: *Roman Lex Cornelia*, *Frieza Force Quotas*, *Barovian Mist Lockdown*); **Tier 2** (Biome/Corridor: *Rubicon River Barrier*, *Namek Coral Archipelago*, *Old Svalich Road*); **Tier 3** (Supply Chain: *Ostia Grain Silos*, *Scouter Relay Grid*, *Wizard of Wines*); **Tier 4** (Sparks/Clocks: *Plebeian Bread Riots*, *Namekian Village Cull*, *Feast of St. Andral*); **Tier 5** (Climax Engine: *Dictator Apotheosis*, *Namek 5-Minute Core Detonation*, *Heart of Sorrow*). |
| **2. Pointcrawl Spatial Anchor** | `hub_eligibility` (`candidate` / `never` / `always`) | Determines whether the location can win Tarot wave elections (`candidate`), is a dependent satellite/hazard (`never`), or locks a Sovereign Hub slot (`always`), plus 1-Way ($u \to v$) vs. 2-Way ($u \leftrightarrow v$) tethering. |
| **3. Sociological CVF & Tarot Affinity** | `culture_quadrant`, `operational_profile`, `mtg_color`, `tarot_affinity` | Maps faction culture to **Hierarchy (Control / White)**, **Adhocracy (Create / Blue-Red)**, **Market (Compete / Black)**, or **Clan (Collaborate / Green)**. |
| **4. Typed Resource Contracts** | `provides: [...]`, `requires: [...]` | Machine-readable `[Category]: [Specific-Asset-Name]` strings across `Power`, `Material`, `Bio`, `Tech`, `Authority`, `Labor`, and `Climax`. |
| **5. 4-Level Output Dial & Clocks** | `injected_mechanics.output_dial`, `threat_clocks` | Scales across Level 1 (Light DC 10 / `1d6`), Level 2 (Moderate DC 13 / `2d8`), Level 3 (Severe DC 16 / `4d10`), and Level 4 (Lethal DC 20 / `8d12`), paired with 4/6/8-tick Threat Clocks ([[File:docs/srd/adventure_framework_srd.md]]). |
| **6. 4-Corner Dramatic Opposition Web** | Markdown Section 2 (`four_corners`) | Pits **Establishment (The Power)**, **Main Opponent (The Challenger)**, **Thematic Shadow (The Profiteer)**, and **Tertiary Outcast (The Victim / Pariah)** in irreconcilable conflict. |
| **7. Standalone Fallback Invariant** | `standalone_fallback` | Mandatory narrative/mechanical clause explaining how the module operates if severed from external supply edges or run as an isolated one-shot. |

---

## Data Flow & Execution Pipeline
1. **Authoring**: Worldbuilders or AI agents copy [[File:templates/IP_MODULE_TEMPLATE.md]] into `campaigns/<campaign_id>/modules/` and populate the 7 components defined in this SRD.
2. **Validation**: [[File:campaigns/Test-CampaignPackage.ps1]] verifies frontmatter conformance against this SRD.
3. **Compilation & UI Ingestion**: [[File:build_suite.js]] (Stage 3) parses the Markdown body to extract `threat_clocks`, `dials`, and `four_corners`, injecting them into `CAMPAIGN_REGISTRY` for live filtering, slotting, and reader inspection in [[File:network/campaign_studio.html]] and [[File:network/platform_audit_dashboard.html]].

---

## AI Agent Maintenance Checklist
- **When converting an external IP or authoring new campaign modules**: Consult `docs/srd/ip_module_framework_srd.md` alongside [[File:templates/IP_MODULE_TEMPLATE.md]] and [[Series:series_f_campaign_authoring_and_ip_conversion]].
- **Never invent ungrounded generic fantasy filler**: Ground every module in concrete institutional sociology, material supply chains (`provides` / `requires`), and 4-corner dramatic opposition.
<!-- END_CUSTOM_NOTES -->
