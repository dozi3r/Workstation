---
id: IND-STEEL-01
title: Crucible Steelworks and Foundry
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-STEEL
chain_stage: 3
chain_role: commercial
provides: ["Alloy: Crucible-Steel", "Commodity: Heavy-Ordnance"]
requires: ["Metal: Pig-Iron", "Fuel: Charcoal-or-Coal", "Commodity: Ceramic-Vessels", "Metal: Forged-Iron"]
culture_quadrant: Hierarchy / Market
operational_profile: Design / Produce
mtg_color: Red / White
node_prerequisites:
  refractory_furnace: High-Heat Coke Crucible Melting Melting Pit
  clay_crucibles: Graphite or Fireclay Sealed Pots
  heavy_foundry: Trip-Hammer or Crane Ingot Casting Bay
standalone_fallback: "If high-carbon coke fuel is severed, steelworks falls back to surface case-hardening of wrought iron; blades have soft cores and brittle edges."

injected_mechanics:
  crucible_melt_dial:
    level_1: "Charge Packing - Wrought-iron scraps and blister bar packed with crushed charcoal in sealed clay pots."
    level_2: "Melting Heat (2900°F) - Pots glowing incandescent white in coke pits; slag floating to top."
    level_3: "Teeming Ingot Pour - Liquid steel teemed into chilled iron ingot molds; blinding sparks."
    level_4: "Crucible Pot Breach - Clay crucible shatters in furnace pit; white-hot steel melts firebrick grate."
  threat_clocks:
    crucible_thermal_shock: "Pot Fracture Clock [4 Ticks] - Rapid temperature swings crack clay crucibles."
    ingot_mold_defect: "Cast Porosity Clock [6 Ticks] - Trapped gas bubbles ruin heavy ordnance barrels."
  yields_resource: "Wootz Crucible Steel Ingots & Rifled Artillery Castings (5 Tons/Day)"
---

# MODULE IND-STEEL-01: CRUCIBLE STEELWORKS AND FOUNDRY

### 1. Pyrometallurgical Architecture

The crucible steel foundry represents the pinnacle of island pyrotechnics, fusing brittle pig-iron and refined fuel inside sealed clay vessels to cast homogenous, razor-keen crucible steel.

* **Sunken Coke Melting Holes:** Subterranean melting pits lined with silica brick, fed by high-pressure bellows air to reach extraordinary temperatures exceeding **2,900°F (1,600°C)**.
* **Graphite Clay Crucibles:** Hand-thrown ceramic vessels sealed with wet clay lids, holding 60 lbs of crushed iron and special fluxing fluxes to exclude oxygen during the 4-hour melt.
* **Overhead Pivot Cranes & Water Trip-Hammer:** Cast-iron swinging crane with tongs used by heat-masked puller-outs to extract glowing pots, teaming the steel into cast-iron cannon molds and heavy forging anvils.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes `Metal: Pig-Iron` (from `MINE-IRON-02`) and high-heat `Fuel: Charcoal-or-Coal` (from `MINE-COAL-01`).
* **Output Transmission:** Produces sovereign-grade `Alloy: Crucible-Steel` for master weapon smiths and casts `Commodity: Heavy-Ordnance` for coastal bastions.

### 3. Notable Characters & Personnel

```text
name: Master Founder Valery
role: Chief Crucible Master & Metallurgist
motivation: Guard the proprietary clay recipe and flux formulas from foreign industrial spies.
disposition: [3, 0, 3]
```

```text
name: Olan Pot-Puller
role: Senior Foundry Crane Operator
motivation: Survive the heat radiant blisters and ensure zero spilled melts on the casting floor.
disposition: [1, 2, 0]
```

### 4. Vague Game Hazards
* **Crucible Ingot Teeming Sparks:** Standing within 20 feet of the teeming mold without heavy split-leather aprons and dark glass goggles inflicts blinding glare and burns ($2\text{d}8$ fire damage).
* **Molten Steel Concrete Splash:** Any water contact with molten steel triggers explosive steam explosions throwing white-hot metal across the bay.

- **Threat Clock — *Hydraulic Camshaft Torque Stress Clock [6 Ticks]***: Metal fatigue creeps through the iron-sheathed trip-hammer drive axle.

### Key Personnel (NPC Prototypes)
- name: "Chief Warden INDSTEEL01 Vance"
  role: "Principal Facility Administrator"
  disposition: "[2, 2, 2]"
  motivation: "Maintain operational throughput and safeguard critical reserves for Crucible Steelworks and Foundry."
- name: "Inspector INDSTEEL01 Kaelen"
  role: "Counter-Sabotage & Logistics Auditor"
  disposition: "[2, 3, 2]"
  motivation: "Uncover illicit skimming and prevent catastrophic clock escalation."
