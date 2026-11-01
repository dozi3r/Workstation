---
id: INFRA-01
title: High-Head Hydro Pelton Wheel & Industrial DC Dynamo
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Power: High-Amperage-DC","Hydraulics: Industrial-Tailrace-Flow"]
requires: ["Geography: High-Elevation-Water-Head"]
culture_quadrant: Hierarchy / Market
operational_profile: Produce / Design
mtg_color: Blue / Red
node_prerequisites:
  elevation: High or Vertical Gorge (minimum 100-ft head)
  water_source: Torrential River or Mountain Waterfall
  power_tier: Sovereign Hub or Bastion Level 2+
standalone_fallback: "If installed without high-head water, can be rigged to a tidal surge flume or multi-mule treadmill, producing only 20% output (illumination only, cannot drive arc furnaces)."

injected_mechanics:
  output_dial:
    level_1: "Trickle Charge (12V) - Pilot lights and telegraph batteries only."
    level_2: "Standard Generation (60V @ 400A) - Heavy cavern hum; runs arc furnace."
    level_3: "Overdriven Surge (80V @ 550A) - Needle nozzle maxed; ozone clouds; doubles smelting."
    level_4: "Catastrophic Arc Flash - Commutator welds or penstock ruptures; explosive shockwave."
  threat_clocks:
    penstock_rupture: "Penstock Rupture Clock [4 Ticks] - Vibrations or explosives breach iron pipe."
    carbon_brush_wear: "Brush Wear Clock [6 Ticks] - Requires tallow grease and recalibration."
  yields_resource: "Continuous High-Amperage Direct Current (24 kW Electricity)"
---

# MODULE INFRA-01: HIGH-HEAD HYDRO PELTON WHEEL & INDUSTRIAL DC DYNAMO

### 1. Mechanical Architecture

This industrial generation anchor harnesses high-velocity hydraulic impulse to generate massive direct-current electrical energy, serving as the electrical backbone of regional metallurgy and signal arrays.

* **High-Pressure Penstock:** 18-inch riveted wrought-iron pipe anchored vertically to bedrock. Hydraulic head creates kinetic pressure exceeding 150 PSI at the base needle nozzle.
* **Cast-Iron Pelton Wheel:** Dual-cupped impulse buckets with a center splitter wedge. Rotates at extreme RPM when struck by the focused water jet.
* **Direct Current Dynamo:** Heavy copper-wound armature spinning inside cast pole shoes. Delivers continuous **60 Volts @ 400 Amperes** (~24 Kilowatts) through solid copper busbars mounted on porcelain ceiling insulators.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Requires torrential headwaters from an upstream lake or glacial river.
* **Output Transmission:** Directly powers the **Carbon Electric Arc Smelting Furnace (`INFRA-02`)** and charges wet-cell accumulator batteries for **Gnomish Radios (`INFRA-06`)**.
* **Tactical Chokepoint:** Seizing this facility grants absolute leverage over the regional electrical grid and weapons foundries.

### 3. Vague Game Hazards & Sabotage
* **Deafening Roar:** Conversing within 50 feet requires shouting; acoustic eavesdropping and stealth audio checks suffer disadvantage.
* **High-Amperage Contact:** Touching bare busbars inflicts lethal electrical trauma ($3\text{d}10$ shock damage) and throws the victim across the floor.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
