---
id: IND-STEEL-01
title: Crucible Steelworks and Foundry
set: Set A (Infrastructure & Engineering)
category: Mining_and_Metallurgy
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

# Crucible Steelworks and Foundry (`IND-STEEL-01`)
> **Industry Chain**: `CHAIN-STEEL` (Stage 3: `commercial`)

## 1. Architectural Overview & Operational Loop
The crucible steel foundry represents the pinnacle of island pyrotechnics, fusing brittle pig-iron and refined fuel inside sealed clay vessels to cast homogenous, razor-keen crucible steel. It takes `Metal: Pig-Iron`, `Fuel: Charcoal-or-Coal`, `Commodity: Ceramic-Vessels` and `Metal: Forged-Iron`, and it makes `Alloy: Crucible-Steel` and `Commodity: Heavy-Ordnance`.

The works is a closed yard: strangers are kept out, and the method is guarded as a trade secret rather than patented. A pot shop on the premises makes the clay crucibles, which are discarded in large numbers. In the melting shop the pots stand in rows of holes in a cellar with natural draught; the charge-room hands weigh iron and flux into each pot, the puller-out lifts it white-hot from the hole, and the teemer pours the steel into ingot molds. The ordnance side casts iron guns that are proved by powder before the crown accepts them.
* **Sunken Coke Melting Holes:** Subterranean melting pits lined with silica brick, fed by high-pressure bellows air to reach extraordinary temperatures exceeding **2,900 degrees F (1,600 degrees C)**.
* **Graphite Clay Crucibles:** Hand-thrown ceramic vessels sealed with wet clay lids, holding 60 lbs of crushed iron and special fluxing fluxes to exclude oxygen during the 4-hour melt.
* **Overhead Pivot Cranes & Water Trip-Hammer:** Cast-iron swinging crane with tongs used by heat-masked puller-outs to extract glowing pots, teeming the steel into cast-iron cannon molds and heavy forging anvils.
* **Pot Shop & Proof Yard:** The clay-working shed where crucibles are made and stacked to dry, and the walled yard where each finished gun is fired and inspected.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[3, -1, 3]` - **Closed Crucible Works** (`Hierarchy / Market`).
- **Sociological Rationale**: Secrecy, a crown ordnance contract and a guarded yard make the works rigidly hierarchical, while the steel and guns are sold to any buyer who can pay and any rival would pay to copy the method.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Founder Valery"
  role: "Chief Crucible Master & Metallurgist"
  disposition: "[3, 0, 3]"
  motivation: "Guard the proprietary clay recipe and flux formulas from foreign industrial spies."
- name: "Olan Pot-Puller"
  role: "Senior Foundry Crane Operator"
  disposition: "[1, 2, 0]"
  motivation: "Survive the heat radiant blisters and ensure zero spilled melts on the casting floor."
- name: "Brisa Claymere"
  role: "Pot Shop Master & Crucible Potter"
  disposition: "[0, 1, 2]"
  motivation: "Turn out enough sound pots for every melt without letting the foundry's clay and sand mixture be copied, since a single cracked pot in the hole loses a whole charge and she takes the blame."
- name: "Proofmaster Lucan Hadrell"
  role: "Ordnance Proof Officer"
  disposition: "[3, 1, -1]"
  motivation: "Fire every gun to proof and condemn the flawed ones without bending to the founder's pleas, knowing a gun that bursts in service would end his post and the works' contract."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
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
```text
name: Brisa Claymere
role: Pot Shop Master & Crucible Potter
motivation: Turn out enough sound pots for every melt without letting the foundry's clay and sand mixture be copied, since a single cracked pot in the hole loses a whole charge and she takes the blame.
disposition: [0, 1, 2]
```
```text
name: Proofmaster Lucan Hadrell
role: Ordnance Proof Officer
motivation: Fire every gun to proof and condemn the flawed ones without bending to the founder's pleas, knowing a gun that bursts in service would end his post and the works' contract.
disposition: [3, 1, -1]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Crucible Steel Ingots** (`Commodity`): Teemed ingots of homogenous steel, the works' prized product for master weapon smiths and instrument makers.
- **Proved Iron Gun** (`Commodity`): A cast iron gun that has passed the powder proof and been stamped by the proof officer.
- **Clay Crucible Pot** (`Tool`): A sealed fireclay pot on its sand stand, holding a charge of iron and flux through the melt; one is used up in most melts.
- **Glass Flux** (`Reagent`): Crushed glass shards weighed into each pot with the iron to help the slag separate.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial - `Crucible Melt` (`0-10`)**: At `0-3`, the pots are only packed and the holes run cold, so no steel is made and the ordnance contract slips. At `8-10`, the pots glow white and ingots pour fast, but a thermal-shocked crucible can shatter in the pit and the white-hot steel melts the firebrick grate.
- **Quest Hook - *The Failed Proof***: Proofmaster Lucan Hadrell has condemned a whole pour of guns after gas bubbles showed through the bore, and he will not pass them. Master Founder Valery blames Brisa Claymere's clay, Brisa blames the pig-iron, and Olan Pot-Puller suspects a spy has tampered with the flux. The party must find the fault before the crown's delivery date, or the contract and the works go to a rival.
- **Threat Clock - *Hydraulic Camshaft Torque Stress Clock [6 Ticks]***: Metal fatigue creeps through the iron-sheathed trip-hammer drive axle.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes `Metal: Pig-Iron` from the **Charcoal Bloomery and Blast Furnace (`MINE-IRON-02`)**, high-heat `Fuel: Charcoal-or-Coal` from the **Charcoal Burner's Mound (`IND-CHARCOAL-01`)** or the **Deep Colliery and Coking Ovens (`MINE-COAL-01`)**, `Commodity: Ceramic-Vessels` for the crucibles from the **Brickworks & Pottery Kiln (`IND-CLAY-02`)**, and `Metal: Forged-Iron` for tongs, molds and fittings from the **Blacksmith Forge (`IND-IRON-03`)**.
* **Output Transmission:** Produces sovereign-grade `Alloy: Crucible-Steel` for the **Clockwork & Navigational Instrument Guild (`IND-OPTIC-02`)** and the **Cupellation Hearth & Sovereign Mint (`IND-SILVER-03`)**, and casts `Commodity: Heavy-Ordnance` for coastal bastions, an end product with no consumer in this chain.
* **Tactical Chokepoint:** The pot shop; a bad batch of crucibles stops every melt in the cellar.

## 6. Vague Game Hazards
* **Crucible Ingot Teeming Sparks:** Standing within 20 feet of the teeming mold without heavy split-leather aprons and dark glass goggles inflicts blinding glare and burns ($2\text{d}8$ fire damage).
* **Molten Steel Concrete Splash:** Any water contact with molten steel triggers explosive steam explosions throwing white-hot metal across the bay.
* **Gun Burst on Proof:** A flawed gun can burst during proof, scattering iron across the proof yard ($2\text{d}6$ piercing damage).
