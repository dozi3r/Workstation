---
id: FACT-04
title: The Equilibrium Engine & Stability Points (SP)
set: Set C (Faction & Governance)
tier: Tier 1 (Macro Network & Governance Engine)
pipeline_tier: 1
provides: ["Economy: Tariff-Cartel-Agreements","System: Equilibrium-Engine-Clock"]
requires: ["Governance: Sovereign-Hub-Archetypes"]
culture_quadrant: Cross-Systemic Mechanics
operational_profile: Dynamic Setting Balancer
mtg_color: All Colors
node_prerequisites:
  scale: Regional Sandbox (Spanning All Campaign Nodes)
  tracking_metric: Stability Points (0 to 100 SP)
standalone_fallback: "Can be applied to a single contested node to track whether it collapses into anarchy or hardens into a military police state."

injected_mechanics:
  stability_scale:
    sp_100: "Totalitarian Stagnation - Iron-fisted order; zero crime; absolute surveillance; creative death."
    sp_50: "Dynamic Equilibrium - The Ideal Sandbox; tension exists; active trade; fluid borders."
    sp_0: "The Shattering - Total systemic collapse; planar tear; stirge swarm overrun; civil slaughter."
  monthly_oracle_check:
    d20_roll: "Roll 1d20 + Net Faction Influence each campaign month to determine setting state shifts."
  yields_resource: "Automated Sandbox Geopolitical Evolution & World State Shifting"
---

# MODULE FACT-04: THE EQUILIBRIUM ENGINE & STABILITY POINTS (SP)

### 1. System Architecture

The Equilibrium Engine is a macro-level sandbox simulator that tracks the collective tension of the setting using a single numerical dial: **Stability Points (SP)**.

* **Primary Metric (0 to 100 SP):**
  * **100 SP (Totalitarian Order):** The state has eliminated all friction. Curfews are absolute, trade is strictly rationed, and dissent is extinguished.
  * **50 SP (Dynamic Equilibrium):** The sweet spot for adventuring. Factions contest territory, black markets thrive, borders are porous, and player choices tip the balance.
  * **0 SP (The Shattering):** The political fabric dissolves entirely. Garrisons abandon their posts, infrastructure fails, and the island succumbs to environmental extinction.
* **The Monthly Oracle Check:** At the end of each in-game month, the GM rolls $1\text{d}20$ modified by active faction initiatives to shift regional SP up or down by $2\text{d}10$ points.

### 2. GM Socket Placement & Regional Impact
* **Faction Spending:** Factions can expend wealth or resources to execute grand strategic rites (e.g., *Operation Roaring Lion* purges a region for $-20$ SP but grants $+2$ military influence).
* **Player Agency:** PC actions (assassinating a corrupt judge, securing a grain convoy, sabotaging a powerhouse) directly move regional SP by $\pm 5$ to $\pm 15$ points.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
