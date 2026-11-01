---
id: ECOL-05
title: Glacial Quartz Meltwater Filtration Caverns
set: Set B (Ecology & Biomes)
tier: Tier 2 (Topological & Biome Anchor)
pipeline_tier: 2
provides: ["Water: Sterile-Quartz-Water","Material: Pure-Quartz-Crystals"]
requires: ["Ecology: Alpine-Glacial-Caverns"]
culture_quadrant: Hierarchy / Design
operational_profile: Produce / Design
mtg_color: Blue / White
node_prerequisites:
  terrain: Subterranean Mountain Interior or Glacial Cirque
  mineral: Natural Quartz Crystal Caverns & Sub-Zero Meltwater
standalone_fallback: "Can function as a high mountain mineral spring in any alpine ridge; produces pristine drinking water but lacks massive subterranean sluice gates."

injected_mechanics:
  purity_dial:
    level_1: "Turbid Runoff - Silt and glacial flour; safe to drink after boiling."
    level_2: "Quartz-Filtered Purity - 100% sterile mineral water; removes 1 tick of disease."
    level_3: "Resonant Hydration - Crystalline water grants +1 to recovery checks for 24 hours."
    level_4: "Frozen Stasis Cascade - Sub-zero mineral flow flash-freezes uninsulated conduits."
  threat_clocks:
    ice_dam_collapse: "Glacial Dam Clock [4 Ticks] - Pressure surges risk catastrophic flood."
  yields_resource: "Pristine Drinkable Water, Raw Quartz Crystals & Glacial Ice"
---

# MODULE ECOL-05: GLACIAL QUARTZ MELTWATER FILTRATION CAVERNS

### 1. Subterranean Hydro-Ecology

The natural filtration engine that purifies thousands of tons of high-altitude glacial runoff before it reaches the human settlements below.

* **Quartz Labyrinth:** Subterranean chambers lined with immense columns of translucent milky and smoky quartz crystals.
* **Natural Mineral Filtration:** Frigid meltwater seeping down from high snowfields percolates through miles of crushed silica scree and crystal fissures, completely stripping biological parasites, mold spores, and sediment.
* **Subterranean Sluice Tunnels:** Feeds crystal-clear drinking water into downstream lakes (`INFRA-07`) and high-pressure penstocks (`INFRA-01`).

### 2. GM Socket Placement & Sovereign Value
* **Upstream Leverage:** Any faction controlling the quartz caverns holds the power of life and death over the entire island's fresh water supply.
* **Contamination Defense:** Templars and water-monks guard the cavern headwaters against saboteurs with heavy crossbows and alarm bells.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
