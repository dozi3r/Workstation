---
id: MINE-COAL-01
title: Deep Colliery and Coking Ovens
set: Set A (Infrastructure & Engineering)
category: Fuel_and_Energy
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-COAL
chain_stage: 1
chain_role: extraction
provides: ["Fuel: Charcoal-or-Coal"]
requires: ["Timber: Mine-Props"]
culture_quadrant: Market / Hierarchy
operational_profile: Produce / Coordinate
mtg_color: Black / Red
node_prerequisites:
  geology: Bituminous or Anthracite Carbon Seam
  ventilation: Air Shaft with Gravity Fire-Brazier Draught
  coking_banks: Masonry Beehive Oven Construction
  haulage: Waggonway and Staith to the River or Road
standalone_fallback: "If coking ovens are destroyed, raw bituminous coal can be burned directly, producing heavy choking sulfur smoke and degrading smelting metal quality; coke output drops to zero and every ironmaster downstream pays a quality penalty."

injected_mechanics:
  coking_battery_dial:
    level_1: "Oven Ignition - Smoky yellow flames licking damper brick; coal desulfurizing."
    level_2: "Steady Coking (2000 degrees F) - Blue hydrocarbon burn; incandescent silver-grey coke beds."
    level_3: "High-Heat Quench Phase - Water sprays billow superheated steam clouds."
    level_4: "Coking Bank Flashback - Coal dust atmosphere flashes into explosion; oven crown blows out."
  threat_clocks:
    firedamp_methane_buildup: "Firedamp Methane Clock [4 Ticks] - Explosive gas pockets accumulate in deep drifts; each tick the overman's gas count worsens, and at full a naked light fires the gallery."
    coal_seam_fire: "Seam Fire Clock [6 Ticks] - Smoldering underground fire creeps behind timber props; at full the district is flooded or walled off and the seam is lost."
  yields_resource: "High-Carbon Metallurgical Coke & Bituminous Steaming Coal (30 Tons/Day)"
---
# Deep Colliery and Coking Ovens (`MINE-COAL-01`)
> **Industry Chain**: `CHAIN-COAL` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The colliery works tap rich carboniferous fossil beds deep beneath the ridges, baking bituminous coal in circular beehive batteries to drive high-temperature metallurgy. The pit consumes `Timber: Mine-Props` from the sawmills to hold its roofs up and yields `Fuel: Charcoal-or-Coal` for every furnace, forge and boiling house downstream.

The pit is run for a landowner by a viewer, who sits mostly at the surface and answers for spending and for deaths, while an overman works the galleries below. Hewers cut the coal in rooms with pillars left standing to hold the roof (in deep pits less than half the seam can be taken), putters push the corves to the shaft, and trappers, often small children, sit in the dark opening and shutting the ventilation doors. Air is drawn through by a fire at the foot of the upcast shaft, steered by heavy damp sheets, and drainage is a constant fight. Coal leaves by waggonway to the staith, where it is loaded for river and road. The landowner leases the seam and the wayleaves, and his check-viewer watches the boundaries.
* **Main Drift & Haulage Shaft:** Supported by massive square-hewn timber frames, carrying iron-tracked handcarts from the coal face to the pithead tipple.
* **Beehive Coking Oven Battery:** Bank of hemispherical firebrick ovens with arched charge doors. Coal is heated with restricted air, driving off volatile sulfur and tar gases to leave porous, high-carbon coke.
* **Pithead Screening & Quench Platform:** Raised timber trestle where glowing coke is raked out and quenched with torrents of ditch water, creating roaring plumes of white steam.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 0, 2]` - **Cartel Pit-Head** (`Market / Hierarchy`).
- **Sociological Rationale**: Owners hold output down to keep the vend price high and bind their hewers by contract or custom, so the pit is rigidly ranked from landowner to trapper, yet every ton and every lease line is bargained over like a commodity.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Colliery Master Vond"
  role: "Pithead Director & Air Inspector"
  disposition: "[2, 0, 2]"
  motivation: "Detect deadly methane gas pockets with caged canaries and keep production moving."
- name: "Runa the Breaker"
  role: "Sorting Screen Foreman"
  disposition: "[0, 2, 2]"
  motivation: "Keep child picking crews alert and prevent pyrite sulfur stones from contaminating metallurgical coke batches."
- name: "Garrick Tolliver"
  role: "Overman & Deputy of the Underground Workings"
  disposition: "[1, 0, 3]"
  motivation: "Keep the piecework tally honest and the roof props sound, and quietly hold back the order to push a hewing stall into gassy ground that he knows will cost lives on his shift."
- name: "Anselm Rudge"
  role: "Landowner's Check-Viewer"
  disposition: "[3, -1, 1]"
  motivation: "Measure the workings against the lease plan to prove the lessee has robbed the pillars or crossed the boundary, because his master's rents, and his own post, depend on catching it."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Colliery Master Vond
role: Pithead Director & Air Inspector
motivation: Detect deadly methane gas pockets with caged canaries and keep production moving.
disposition: [2, 0, 2]
```
```text
name: Runa the Breaker
role: Sorting Screen Foreman
motivation: Keep child picking crews alert and prevent pyrite sulfur stones from contaminating metallurgical coke batches.
disposition: [0, 2, 2]
```
```text
name: Garrick Tolliver
role: Overman & Deputy of the Underground Workings
motivation: Keep the piecework tally honest and the roof props sound, and quietly hold back the order to push a hewing stall into gassy ground that he knows will cost lives on his shift.
disposition: [1, 0, 3]
```
```text
name: Anselm Rudge
role: Landowner's Check-Viewer
motivation: Measure the workings against the lease plan to prove the lessee has robbed the pillars or crossed the boundary, because his master's rents, and his own post, depend on catching it.
disposition: [3, -1, 1]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Beehive Coke** (`Commodity`): Porous silver-grey coke raked from the ovens, prized by ironmasters when it is low in sulfur.
- **Bituminous Steaming Coal** (`Commodity`): Raw screened coal sent by waggonway to the staith for boiling houses, forges and furnaces.
- **Damp Sheet** (`Tool`): Heavy canvas hung in the galleries to steer the draught from the upcast shaft to the working faces.
- **Wayleave Lease Plan** (`Relic`): The landowner's survey of seams, pillars and boundaries, kept as proof of what the lessee may and may not cut.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial - `Coking Battery` (`0-10`)**: At `0-3`, the ovens are cold or half-charged, coke is scarce and every furnace downstream burns raw coal or pays dearly for charcoal. At `8-10`, the battery roars at full heat and quench rush, but coal dust and gas thicken around the banks and a single spark flashes the crown out of an oven.
- **Quest Hook - *The Robbed Pillars***: Anselm Rudge has found the lease plan and the underground workings disagree, and he will hold up the next waggonway shipment until the viewer accounts for the missing pillars. Overman Garrick Tolliver begs the party to survey the gassy east stall before Colliery Master Vond is ordered to send hewers in, and the dry-season rent day falls in six days.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes `Timber: Mine-Props` from the **Water-Powered Sawmill (`IND-TIMBER-02`)**, square-cut timbers that keep the deep shafts from crushing shut.
* **Output Transmission:** Dispatches bulk `Fuel: Charcoal-or-Coal` to power the **Charcoal Bloomery and Blast Furnace (`MINE-IRON-02`)**, the **Cane Crushing Mill and Boiling House (`AGRI-SUGAR-02`)**, the **Crucible Steelworks and Foundry (`IND-STEEL-01`)**, and many other furnaces and forges, including the **Blacksmith Forge (`IND-IRON-03`)**, the **Copper Smelting Furnace (`IND-COPPER-02`)**, the **Glassblower's Furnace (`IND-GLASS-02`)** and the **Calcining Lime Kiln (`IND-LIME-02`)**.
* **Tactical Chokepoint:** The staith and the waggonway. Whoever holds the wayleave and the loading quay decides which furnaces get coal, and owners who hold output down on purpose can starve a rival city.

## 6. Vague Game Hazards
* **Methane Gas Flash:** Open flame in the lower galleries triggers explosive methane deflagration ($4\text{d}6$ fire damage and shockwave).
* **Quench Steam Burns:** Stepping onto the quench apron without wooden clogs inflicts scald burns from boiling sulfurous slurry.
* **Blackdamp Pocket:** Closed-off galleries hold air that will not support a flame, and anyone who descends without testing it is suffocated ($1\text{d}6$ damage per round until dragged out).
