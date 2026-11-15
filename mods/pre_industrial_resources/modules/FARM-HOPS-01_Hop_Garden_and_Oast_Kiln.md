---
id: FARM-HOPS-01
title: Hop Garden and Oast Kiln
set: Set A (Infrastructure & Engineering)
category: Agriculture_and_Subsistence
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
    level_1: "Climbing Bines - Bines twine up pitch-dressed chestnut poles; the garden is quiet and the oast stands cold."
    level_2: "Picking Time - Bines are taken down and stripped; crowds of seasonal pickers fill the rows from dawn."
    level_3: "Kiln Rush - The oast burns day and night; damp hops pile up faster than the drying floor can take them."
    level_4: "Oast Ablaze - The fire catches the dry hop floor; the kiln roof goes up in a sweet, choking blaze."
  threat_clocks:
    bine_blight: "Mould and Fly Clock [4 Ticks] - Damp rot and swarming aphids spread along the rows; each tick ruins a section of the garden before it can be picked."
    picker_camp_trouble: "Picker Camp Clock [6 Ticks] - Drink, short pay and crowded huts and tents turn the seasonal camp toward brawls and a walk-off."
  yields_resource: "Kiln-Dried Hops Pressed into Coarse Sacking Pockets (8 Pockets/Day in Season)"
---
# Hop Garden and Oast Kiln (`FARM-HOPS-01`)
> **Industry Chain**: `CHAIN-HOPS` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The hop garden is a forest of tall poles and climbing bines that sits sleepy for most of the year, then explodes into a noisy, crowded harvest when the cones ripen and every hand is needed before mould sets in. The oast burns `Fuel: Wood-Fuel` to dry the crop, and the pockets it fills are the `Crop: Hops` that bitter and preserve the brewery's beer.

Picking lasts a few weeks at the end of summer. Migrant families fill canvas bins from dawn, and their count is kept on tally sticks and tokens, paid by the bushel. Fresh hops are mostly water, and must be dried from about eighty percent moisture to about six. They are spread roughly a foot deep on the slatted floor, the heat starts low and climbs but must never scorch them, and sulphur burned in the first hour bleaches the cones. The drier lives in the kiln, rising in the small hours to turn the hops with a wide wooden paddle and testing dryness by rubbing. After a day of drying and a cooling, the hops are pressed hard into pockets of about a hundredweight and a half, stitched, stamped with the grower's name, and marked by the excise officer.
* **Pole Garden:** Rows of coppiced chestnut poles with pitch-dressed feet, each carrying twisting bines heavy with pale green cones. At harvest the bines are cut down and carried to the picking bins.
* **Oast Kiln:** A brick drying house with a fire chamber below and a slatted, hair-cloth floor above. Green hops are spread on the floor and dried by the heat of the wood fire rising through them.
* **Cooling Floor & Pocket Press:** A loft where dried hops cool before being pressed down hard, often by a man treading them, into tall coarse-sacking pockets, then hand-sewn shut, marked, and stacked for the brewery carts.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[3, 2, 3]` - **Seasonal Harvest Commons** (`Clan / Market`).
- **Sociological Rationale**: The garden runs on kin ties, camp loyalty and a shared race against the rot, but the whole crop is sold at market and taxed by the pocket, so every tally and every unmarked pocket is a bargain.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Hester Quayle"
  role: "Hop Grower & Garden Mistress"
  disposition: "[2, 3, 4]"
  motivation: "Get the crop picked, dried and pocketed before the mould reaches the south rows, without the picker camp turning on her."
- name: "Old Benet Furrow"
  role: "Oast Drier & Night Fire-Keeper"
  disposition: "[3, 1, 4]"
  motivation: "Hold the kiln fire at a steady heat through the rush nights, and never let the hop floor scorch on his watch again."
- name: "Wenna Dray"
  role: "Picker Gang Leader & Camp Spokeswoman"
  disposition: "[4, 4, 2]"
  motivation: "Win fair tallies and clean water for the seasonal pickers, and keep the young ones out of the alehouse until the last bin is full."
- name: "Excise Tallyman Corvin Peale"
  role: "Excise Officer Who Marks and Weighs Pockets at the Oast"
  disposition: "[1, 1, 3]"
  motivation: "Count every pocket that leaves the cooling floor and catch the grower moving bags before the duty is paid."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Hester Quayle
role: Hop Grower & Garden Mistress
motivation: Get the crop picked, dried and pocketed before the mould reaches the south rows, without the picker camp turning on her.
disposition: [2, 3, 4]
```
```text
name: Old Benet Furrow
role: Oast Drier & Night Fire-Keeper
motivation: Hold the kiln fire at a steady heat through the rush nights, and never let the hop floor scorch on his watch again.
disposition: [3, 1, 4]
```
```text
name: Wenna Dray
role: Picker Gang Leader & Camp Spokeswoman
motivation: Win fair tallies and clean water for the seasonal pickers, and keep the young ones out of the alehouse until the last bin is full.
disposition: [4, 4, 2]
```
```text
name: Excise Tallyman Corvin Peale
role: Excise Officer Who Marks and Weighs Pockets at the Oast
motivation: Count every pocket that leaves the cooling floor and catch the grower moving bags before the duty is paid.
disposition: [1, 1, 3]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Sacking Pocket of Dried Hops** (`Commodity`): A tall stitched pocket of kiln-dried cones, stamped with the grower's name and marked by the excise officer before the brewery carts take it.
- **Scruppet** (`Tool`): The wide wooden paddle the drier uses to turn the hops on the drying floor in the small hours.
- **Tally Sticks and Picker Tokens** (`Relic`): The grower's record of every bushel picked, the paper trail of every pay dispute in the camp.
- **Burning Sulphur** (`Reagent`): Burned in the first hour of drying to bleach the cones a bright, saleable colour.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial - `Picking Season` (`0-10`)**: At `0-3`, the bines climb quietly, the oast stands cold, and nothing is picked, dried or sold. At `8-10`, the kiln rush has the oast burning day and night with damp hops stacked past what the floor can take, so scorched cones, exhausted driers and a flare in the fire chamber threaten the whole crop.
- **Quest Hook - *The Short Tally***: Wenna Dray claims Hester Quayle's tally sticks have been shorted by a bushel in every five, and she threatens a walk-off on the day the south rows are ripe. Old Benet Furrow cannot dry the crop without the pickers, and Excise Tallyman Corvin Peale is due to mark the first pockets within three days, so the party must settle the count before the camp leaves.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** Burns stacks of `Fuel: Wood-Fuel` from the **Hardwood Logging Camp (`EXT-TIMBER-01`)** in the oast fire chamber through the drying season; the garden cannot ship a single pocket without it.
* **Output Transmission:** Sends carts of sacking pockets of `Crop: Hops` to the **Copper Mash-Tun & Civic Brewery (`IND-BREW-02`)**, where they bitter and preserve the beer.
* **Tactical Chokepoint:** The crop is only worth anything for a few weeks. Delay the pickers, the fuel, or the poles and the year's harvest rots on the bine.

## 6. Vague Game Hazards
* **Oast Floor Fire:** Over-stoking the fire chamber during a Level 3 rush can ignite the dry hops above, filling the kiln with flame and smoke in moments ($2\text{d}6$ fire damage to anyone on the drying floor).
* **Bine Scratch & Pole Fall:** Hop bines rasp bare skin raw, and a falling pole can strike a picker in the crowded rows ($1\text{d}6$ bludgeoning damage).
* **Sulphur Fumes:** Burning sulphur on the kiln fire in a closed oast chokes anyone who lingers below the floor ($1\text{d}4$ damage per round and blurred eyes).
