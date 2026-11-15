---
id: FARM-HOPS-01
title: Hop Garden and Oast Kiln
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-HOPS
chain_stage: 1
chain_role: extraction
provides: ["Crop: Hops"]
requires: ["Fuel: Wood-Fuel"]
culture_quadrant: Clan / Market
operational_profile: Produce / Exchange
mtg_color: Green / Red
node_prerequisites:
  soil_type: Deep Enclosed Field with Well-Drained Loam
  coppice: Chestnut Coppice for Hop Poles
  kiln: Brick Oast with Slatted Drying Floor
standalone_fallback: "If the oast cannot be fired, green hops are spread to dry on barn floors, where much of the crop spoils before it can be bagged and the brewery receives half its order."

injected_mechanics:
  picking_season_dial:
    level_1: "Climbing Bines - Vines twine up tarred chestnut poles; the garden is quiet and the oast stands cold."
    level_2: "Picking Time - Poles are pulled and stripped; crowds of seasonal pickers fill the rows from dawn."
    level_3: "Kiln Rush - The oast burns day and night; damp hops pile up faster than the drying floor can take them."
    level_4: "Oast Ablaze - The fire catches the dry hop floor; the kiln roof goes up in a sweet, choking blaze."
  threat_clocks:
    bine_blight: "Mould and Fly Clock [4 Ticks] - Mildew and swarming aphids spread along the rows; each tick ruins a section of the garden before it can be picked."
    picker_camp_trouble: "Picker Camp Clock [6 Ticks] - Drink, short pay and crowded tents turn the seasonal camp toward brawls and a walk-off."
  yields_resource: "Kiln-Dried Hops Trodden into Hessian Pockets (8 Pockets/Day in Season)"
---

# MODULE FARM-HOPS-01: HOP GARDEN AND OAST KILN

### 1. Garden & Kiln Architecture

The hop garden is a forest of tall poles and climbing bines that sits sleepy for most of the year, then explodes into a noisy, crowded harvest when the cones ripen and every hand is needed before mould sets in.

* **Pole Garden:** Rows of coppiced chestnut poles with tarred feet, each carrying twisting bines heavy with pale green cones. At harvest the poles are pulled up whole and laid across the picking bins.
* **Oast Kiln:** A brick drying house with a fire chamber below and a slatted, hair-cloth floor above. Green hops are spread on the floor and dried by the heat of the wood fire rising through them.
* **Cooling Floor & Pocket Press:** A loft where dried hops cool before being trodden by foot into tall hessian pockets, then hand-sewn shut, marked, and stacked for the brewery carts.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Burns stacks of `Fuel: Wood-Fuel` in the oast fire chamber through the drying season; the garden cannot ship a single pocket without it.
* **Output Transmission:** Sends carts of hessian pockets of `Crop: Hops` to the **Copper Mash Tun and Civic Brewery (`IND-BREW-02`)**, where they bitter and preserve the beer.
* **Tactical Chokepoint:** The crop is only worth anything for a few weeks. Delay the pickers, the fuel, or the poles and the year's harvest rots on the bine.

### 3. Notable Characters & Personnel

```text
name: Hester Quayle
role: Hop Grower & Garden Mistress
motivation: Get the crop picked, dried and pocketed before the mould reaches the south rows, without the picker camp turning on her.
disposition: [1, 1, 2]
```

```text
name: Old Benet Furrow
role: Oast Drier & Night Fire-Keeper
motivation: Hold the kiln fire at a steady heat through the rush nights, and never let the hop floor scorch on his watch again.
disposition: [0, -1, 3]
```

### 4. Vague Game Hazards
* **Oast Floor Fire:** Over-stoking the fire chamber during a Level 3 rush can ignite the dry hops above, filling the kiln with flame and smoke in moments ($2\text{d}6$ fire damage to anyone on the drying floor).
* **Bine Scratch & Pole Fall:** Hop bines rasp bare skin raw, and a pulled pole falling the wrong way can strike a picker in the crowded rows ($1\text{d}6$ bludgeoning damage).

### Key Personnel (NPC Prototypes)
- name: "Wenna Dray"
  role: "Picker Gang Leader & Camp Spokeswoman"
  disposition: "[-1, 2, 0]"
  motivation: "Win fair tallies and clean water for the seasonal pickers, and keep the young ones out of the alehouse until the last bin is full."
- name: "Excise Tallyman Corvin Peale"
  role: "Duty Collector Stationed at the Oast"
  disposition: "[3, -2, 1]"
  motivation: "Count every pocket that leaves the cooling floor and catch the grower moving bags before the duty is paid."
