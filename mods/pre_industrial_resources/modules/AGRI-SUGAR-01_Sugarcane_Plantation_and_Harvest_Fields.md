---
id: AGRI-SUGAR-01
title: Sugarcane Plantation and Harvest Fields
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-SUGAR
chain_stage: 1
chain_role: extraction
provides: ["Crop: Raw-Sugarcane"]
requires: ["Water: Baseline-Potable-Flow", "Naval: Hemp-Cordage"]
culture_quadrant: Clan / Hierarchy
operational_profile: Produce / Coordinate
mtg_color: Green / White
node_prerequisites:
  elevation: Lowland Alluvial Plain
  water_source: River Flume or Rain Reservoir
  soil_type: Fertile Volcanic Loam
standalone_fallback: "If municipal irrigation is severed, harvesters can tap brackish tidal ditches, reducing cane sugar density by 40% and multiplying fungal rot clocks."

injected_mechanics:
  cane_ripeness_dial:
    level_1: "Green Shoots - Slender stalks; sap thin; low sucrose density."
    level_2: "Prime Sucrose Stalks - Heavy purple-ribbed cane; ready for machete gang harvest."
    level_3: "Dry Tassel Over-Ripeness - Leaves brown and brittle; extreme wildfire hazard."
    level_4: "Cane Field Firestorm - Uncontrolled blaze roars through cane brakes; total harvest ruin."
  threat_clocks:
    cane_field_blight: "Red Rot Blight Clock [4 Ticks] - Spores infect stalks if drainage trenches stagnate."
    field_labor_unrest: "Cutter Strike Clock [4 Ticks] - Exhausted cane cutters organize slowdown."
  yields_resource: "Bundled Raw Sugarcane Stalks (10 Tons/Day)"
---

# MODULE AGRI-SUGAR-01: SUGARCANE PLANTATION AND HARVEST FIELDS

### 1. Mechanical & Agrarian Architecture

The sugarcane fields form the agricultural engine of the coastal river bottom, converting tropical humidity and deep volcanic loam into mountain-high stacks of dense, sucrose-rich cane.

* **Alluvial Drainage Canals:** Grid-cut earth trenches fed by wooden sluice gates. Regulates seasonal inundation and drains muddy water into the bay.
* **Cane Brake Stands:** Dense, 14-foot stands of thick-rind Saccharum cane, harvested by crews armed with weighted broad machetes.
* **Ox-Cart Weigh Station:** High-beamed timber scale house where bundled cane stalks are weighed, inspected for borer beetles, and bound with hemp rope for transport.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Requires uninterrupted fresh water from upstream headwaters (`Water: Baseline-Potable-Flow`).
* **Output Transmission:** Dispatches cartloads of `Crop: Raw-Sugarcane` to the **Cane Crushing Mill & Boiling House (`AGRI-SUGAR-02`)**.
* **Tactical Chokepoint:** Setting fire to the dry perimeter ditch-banks can ignite the entire estate within 30 minutes.

### 3. Notable Characters & Personnel

```text
name: Thaddeus Varen
role: Field Overseer & Cane Steward
motivation: Enforce strict harvest quotas before tropical monsoon season rots the stalks.
disposition: [2, -1, 3]
```

```text
name: Jarek Horn
role: Cutter Foreman & Labor Advocate
motivation: Secure quinine rations and wage advances for the ditch-clearing crews.
disposition: [-1, 2, -1]
```

### 4. Vague Game Hazards
* **Razor Cane Cuts:** Moving through unharvested cane without heavy canvas canvas gaiters inflicts slashing briar scrapes ($1\text{d}4$ damage) and risks swamp rot fever.
* **Tassel Fire Hazard:** Any open flame or spell spark in Level 3 tasseling conditions ignites a 30-foot cone of roaring fire.

### Key Personnel (NPC Prototypes)
- name: "Chief Warden AGRISUGAR01 Vance"
  role: "Principal Facility Administrator"
  disposition: "[2, 2, 2]"
  motivation: "Maintain operational throughput and safeguard critical reserves for Sugarcane Plantation and Harvest Fields."
- name: "Inspector AGRISUGAR01 Kaelen"
  role: "Counter-Sabotage & Logistics Auditor"
  disposition: "[2, 3, 2]"
  motivation: "Uncover illicit skimming and prevent catastrophic clock escalation."
