---
file_path: "docs/srd/tier_0_substratum_srd.md"
title: "Tier 0 Substratum SRD: Baseline Settlement Framework"
volume: "vol-2"
kind: "System Reference Document (SRD)"
current_hash: "a2c7e422ad9eb6a6"
reviewed_hash: "a2c7e422ad9eb6a6"
stale: false
size_bytes: 10109
line_count: 131
---

# Tier 0 Substratum SRD: Baseline Settlement Framework

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/srd/tier_0_substratum_srd.md` is the **Authoritative System Reference Document Governing Mundane Settlement Survival, Caloric Carrying Capacity, and the Dual-Mode Tier 0 Substratum** within **Volume II: System Reference Documents (The Dual SRD & Substratum)**. While Tiers 1–5 of [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]] model macro-governance, biomes, industrial alchemy, social dilemmas, and eschatological climaxes, **Tier 0** establishes the material baseline (food, water, vernacular shelter, parish watch, barter, leechcraft, sanitation, hearth vigils) that prevents "phantom starvation" in pointcrawl networks.

It serves as the primary specification for [[File:tickets/unified_ticket_tracker.html]], [[File:tickets/tier_0/README.md]], [[File:tickets/tier_0/tier_0_manifest.json]], and the 8 Tier 0 domain modules (`T0-DOM-01` through `T0-DOM-08` in `tickets/tier_0/tickets/`).

---

## Core Invariants & Architectural Contracts

### 1. The Dual-Mode UX Architecture (`enable_tier_0_substratum`)
To balance fast high-concept worldbuilding against gritty logistical survival simulation, Tier 0 enforces a two-mode switch in [[File:network/campaign_studio.html]] and [[File:network/Run-NetworkEngine.ps1]]:
- **Mode A: Smooth Generic ("Checkbox Through" / `enable_tier_0_substratum: true`)**:
  - Every settlement node (`Hub`, `Settlement`, `Outpost`) automatically receives implicit baseline resources: `Food: Baseline-Subsistence-Rations`, `Water: Baseline-Potable-Flow`, and `Shelter: Baseline-Vernacular-Hearth`.
  - Consumes **zero socket slots** and suppresses mundane starvation deficits so authors can focus immediately on Tiers 1–5.
- **Mode B: Granular Modularity (Deep Authoring / Survival Core / `enable_tier_0_substratum: false`)**:
  - Settlements require explicit Tier 0 (`T0-DOM-01..08`) or Tier 2/3 food and water providers within $k \le 2$ graph hops.
  - Unmet baseline needs advance active **Starvation**, **Drought**, or **Unrest Threat Clocks**.

### 2. The 8 Mundane Survival Domains (`DOM-01` to `DOM-08`)
| Domain Code | Ticket / Module ID | Core Physical Reality | Primary Resource Tag Provided |
| :--- | :--- | :--- | :--- |
| **DOM-01** | [[Ticket:T0-DOM-01]] | Dryland grain rotation, root cellars, communal threshing | `Food: Baseline-Subsistence-Rations` |
| **DOM-02** | [[Ticket:T0-DOM-02]] | Artesian wells, snowmelt flumes, rainwater cisterns | `Water: Baseline-Potable-Flow` |
| **DOM-03** | [[Ticket:T0-DOM-03]] | Timber, wattle-and-daub, fieldstone masonry, hearth flues | `Shelter: Baseline-Vernacular-Hearth` |
| **DOM-04** | [[Ticket:T0-DOM-04]] | Ditch-and-palisade, town bailiff, parish militia, horn alarms | `Defense: Baseline-Perimeter-Watch` |
| **DOM-05** | [[Ticket:T0-DOM-05]] | Weekly barter square, village blacksmith, cooperage, tool repair | `Commerce: Baseline-Barter-Market` |
| **DOM-06** | [[Ticket:T0-DOM-06]] | Village midwife, herbalist drying racks, leechcraft, quarantine | `Health: Baseline-Leechcraft-Care` |
| **DOM-07** | [[Ticket:T0-DOM-07]] | Midden trenches, swine scavenging pens, night-soil composting | `Sanitation: Baseline-Midden-Trench` |
| **DOM-08** | [[Ticket:T0-DOM-08]] | Wayside boundary shrines, ancestor cairns, solstitial feast vigils | `Culture: Baseline-Communal-Vigil` |

### 3. Pre-Industrial Carrying Capacity & The Agrarian Radius Law (Section 4)
- **5 Settlement Scale Tiers**: `Thorp` (20–60 pop), `Hamlet` (60–250 pop, 3 sockets), `Village` (250–1,000 pop), `Market Town` (1,000–5,000 pop), and `Sovereign Hub` (5,000–25,000+ pop, 4 sockets).
- **The 3-Mile Ox-Cart Transport Boundary & Sovereign Hub Deficit Law**: Any Sovereign Hub ($>5,000$ pop) runs a structural caloric and hydrological deficit (`-2,000 Cal` net balance) within its municipal walls and **must** maintain 2 to 4 unsevered `transit` edges connecting it to agricultural/hydrological Satellite Nodes (`+250 Cal Surplus`).

---

## Data Flow & Execution Pipeline
- **Upstream Governance**: Extends [[File:docs/srd/authoring_engine_srd.md]] and [[File:docs/srd/adventure_framework_srd.md]] downward to `pipeline_tier: 0`.
- **Downstream Manifests**: Implemented in [[File:tickets/tier_0/tier_0_manifest.json]] and compiled by [[File:tickets/build_unified_tracker.js]] into [[File:tickets/master_ticket_manifest.json]] and [[File:tickets/unified_ticket_tracker.html]].

---

## AI Agent Maintenance Checklist
- **When editing Tier 0 tickets (`tickets/tier_0/tickets/T0-DOM-*.md`) or `tier_0_manifest.json`**: Ensure `provides` tags match the exact 8 canonical strings (`Food: Baseline-Subsistence-Rations`, etc.) defined in Section 3 of `docs/srd/tier_0_substratum_srd.md`, then run [[File:Build-Suite.ps1]].
<!-- END_CUSTOM_NOTES -->
