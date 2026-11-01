---
id: EDGE-02
title: The South Coastal Road Paving Initiative
set: Set E (Transit & Edges)
tier: Tier 2 (Topological & Edge Transit Corridor)
pipeline_tier: 2
provides: ["Transit: Paved-Coastal-Highway"]
requires: ["Material: Smelted-Alloy","Material: Direct-Reduced-Iron"]
culture_quadrant: Market / Hierarchy
operational_profile: Deliver / Produce
mtg_color: White / Green
edge_prerequisites:
  geography: Southern Coastal Rim
  trigger: Either Southern Hub (Outpost, Grasslands, or Stone Mountain) Elected Sovereign
standalone_fallback: "Can exist as an ancient half-buried Roman-style causeway that players can clear of debris node-by-node."

injected_mechanics:
  road_completion_clock: "Paving Progress Clock [8 Ticks] - Financed by Sovereign Hub silver."
  emergent_gameplay_impact:
    when_completed:
      bypass: "Directly bridges southern perimeter nodes, completely bypassing interior mountain gorges."
      economic_impact: "Cuts overland transit time in half; starves interior canyon bandits of toll revenue."
      bandwidth: "Enables heavy freight wagon convoys and mule teams carrying 500 lbs per cart."
  yields_resource: "High-Speed Southern Perimeter Commerce, Military Logistics & Bandit Starvation"
---

# MODULE EDGE-02: THE SOUTH COASTAL ROAD PAVING INITIATIVE

### 1. Dynamic Edge Progression

An emergent civil engineering project that permanently reshapes the campaign's geopolitical and commercial graph.

* **The Baseline Sandbox:** In the early game, traveling between the southern coast and the eastern mines requires heading north into the treacherous Canyon Road (`EDGE-01`).
* **The Sovereign Trigger:** If either the Outpost, the Grasslands, or Stone Mountain achieves Sovereign Hub status, the ruling power has the capital and military incentive to pave **The South Coastal Road** along the perimeter.
* **The Construction Loop:** Requires 8 ticks on the Paving Progress Clock (each tick costs 1,000 Silver Links, 20 wagon loads of crushed limestone gravel, and 1 week of convict labor).

### 2. GM Edge Placement & Economic Consequence
* **When Completed:** Directly connects the southern littoral nodes. Freight wagons bypass the mountain bandits entirely.
* **Bandit Reaction:** Starved of toll revenue, the canyon toll-lords abandon their gatehouses and launch desperate scorched-earth raids against the road construction crews.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
