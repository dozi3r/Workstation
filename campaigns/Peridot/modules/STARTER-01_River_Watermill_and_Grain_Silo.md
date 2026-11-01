---
id: STARTER-01
title: The River Watermill & Grain Silo
set: Starter Pack (Settlement Infrastructure)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Food: Milled-Flour-Stores", "Hydraulics: River-Weir-Control"]
requires: ["Geography: Flowing-River-Lowlands"]
culture_quadrant: Hierarchy / Market
operational_profile: Produce / Deliver
mtg_color: Blue / Green
node_prerequisites:
  elevation: Lowland River Valley
  water_source: Flowing River or Sluice Canal
standalone_fallback: "If the river freezes or runs dry, hand-cranked quern stones maintain 15% flour production, sufficient for emergency bread rations."

injected_mechanics:
  output_dial:
    level_1: "Quiet Grinding - Gentle flow; supplies local village bakery with daily flour."
    level_2: "Full Sluice Operations - High capacity; fills reserve grain silos and provisions wagon caravans."
    level_3: "Flood Gate Diverter - Diverts river floodwaters; mill stones race dangerously hot."
    level_4: "Sluice Gate Breach - Mill dam collapses; flash flood sweeps downstream lowlands."
  threat_clocks:
    grain_spoilage: "Damp Grain Mold Clock [4 Ticks] - Wet rot ruins winter grain stores."
    dam_structural_wear: "Mill Dam Wear Clock [6 Ticks] - Vibrations weaken stone weir."
  yields_resource: "Milled Grain Flour, River Crossing Control, Safe Rest Haven"
---

# MODULE STARTER-01: THE RIVER WATERMILL & GRAIN SILO

### 1. Mechanical Architecture
A timber-and-fieldstone grist mill built astride the central river. Its massive undershot waterwheel powers twin granite milling stones, grinding rye and barley for the entire lowlands.

* **Heavy Timber Weir:** Regulates river flow with adjustable sluice gates, doubling as a fortified pedestrian footbridge across the river.
* **Milling Loft & Silo:** Dry timber loft holding up to 80 sacks of flour and a conical stone silo storing raw grain.
* **Miller's Hearth:** A sturdy stone cottage adjoining the mill, providing a warm common room and resting quarters for visiting traders.

### 2. GM Placement & Synergies
* **Placement:** Recommended on **Node 14 (The River Mill & Weir)** or any lowland river crossing.
* **Synergies:** Receives raw grain from **Node 2 (Frontier Farmlands)**; ships flour barrels to **Node 1 (Harbor Haven)** and **Node 13 (Market Cross Township)**.
* **Tactical Leverage:** Controlling the sluice gate allows defenders to flood the downstream valley or starve the lower wetlands of water.
