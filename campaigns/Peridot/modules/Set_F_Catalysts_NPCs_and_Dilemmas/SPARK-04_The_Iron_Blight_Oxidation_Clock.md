---
id: SPARK-04
title: The Iron-Blight Atmospheric Degradation Clock
set: Set F (Catalysts, NPCs & Dilemmas)
tier: Tier 4 (Dynamic Narrative Sparks & Dilemmas)
pipeline_tier: 4
provides: ["Hazard: Iron-Blight-Atmospheric-Decay"]
requires: ["Environment: Blighted-Salt-Air"]
culture_quadrant: Environmental Physics
operational_profile: Resource Attrition Engine
mtg_color: Colorless / Environmental Decay
prerequisites: [Lowland nodes (Nodes 1, 2, 4, 5, 11) or Humid Salt-Coastlines]
standalone_fallback: "Can be applied to any survival campaign to create continuous economic pressure on steel equipment."

injected_mechanics:
  degradation_rule: "Every 24 hours spent outside a sealed bastion, non-silvered ferrous iron/steel has a 1-in-6 chance to advance 1 tick."
  blight_clock_ticks:
    tick_1: "Superficial Flaking - Red rust freckles; -1 damage or AC."
    tick_2: "Deep Pitting - Metal groans under stress; -2 damage or AC."
    tick_3: "Structural Brittleness - Edges notch; -3 damage or AC."
    tick_4: "Severe Delamination - Metal porous as sandstone; -4 damage or AC."
    tick_5: "Catastrophic Shatter - Weapon or armor plate shatters into oxide powder upon next impact."
  countermeasures:
    silver_dipping: "50 Silver Links per item; provides 7 days total immunity."
    amber_pitch_rub: "10 Silver Links; provides 24 hours immunity."
    backslope_sanctuary: "Deep backslope forest (Node 12) is immune due to high oxygen."
  yields_resource: "Economic Silver Drain, Resource Scarcity & Blacksmith Dependency"
---

# MODULE SPARK-04: THE IRON-BLIGHT ATMOSPHERIC DEGRADATION CLOCK

### 1. Environmental Decay Mechanics

The atmospheric phenomenon that prevents human civilization on the campaign network from stockpiling steel armaments and enforces the continuous burn of silver currency.

* **The Atmospheric Cause:** The air of the lower elevations is saturated with a unique mixture of ozone, sulfurous volcanic vapor, and microscopic airborne silicon spores from stirge hives. This aerosol attacks iron and steel with unnatural ferocity.
* **The Silver Economy:** Because pure refined silver is completely impervious to the blight, the entire penal economy revolves around **Silver-Dipping** vats in major bastions.
* **Non-Ferrous Alternatives:** Wise travelers seek out stone-knapped flint daggers, hardened bronze breastplates, or fey iron-wood spears (`ECOL-03`).

### 2. GM Running Notes
* **Rolling the Blight:** During morning camp checks, have players roll a d6 for their main weapon and armor. On a 1, advance the clock by 1 tick.
* **Shatter Moment:** When an item reaches 5 ticks, it holds together until struck in combat, whereupon it shatters dramatically, leaving the character defenseless.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
