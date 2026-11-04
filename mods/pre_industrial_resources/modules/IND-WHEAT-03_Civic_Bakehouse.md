---
id: "IND-WHEAT-03"
title: "Civic Bakehouse"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-WHEAT"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Food: Baked-Bread"
requires:
  - "Food: Wheat-Flour"
  - "Fuel: Wood-Fuel"
---
# Civic Bakehouse (`IND-WHEAT-03`)
> **Industry Chain**: `CHAIN-WHEAT` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The civic bakehouse features cavernous brick-lined ovens heated by intense hardwood fires until the masonry radiates steady baking heat. Bakers mix refined flour with water and sourdough leaven in deep wooden troughs, knead the dough by hand, shape heavy loaves, and slide them onto the hot hearth using long-handled ash peels. This final thermal transformation converts milled flour and fuel into nourishing baked bread for the settlement.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, +1, -1]` — **Collaborator** (`Clan`).
- **Sociological Rationale**: Communal baking environments rely on intense daily cooperation, shared warmth, and strict adherence to guild loaf-weight regulations to maintain social harmony.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Baker Martha Vance"
  role: "Guild Master Baker"
  disposition: "[0, +1, 0]"
  motivation: "Maintain absolute consistency in loaf size and quality to satisfy both guild inspectors and hungry citizens."
- name: "Kneader Jory Weaver"
  role: "Journeyman Baker"
  disposition: "[-1, +1, -1]"
  motivation: "Earn enough coin to buy into full guild membership and start his own hearth."

### Material Stocks & Items (Item Prototypes)
- **Baked-Bread** (`Commodity`): Dense, crusty loaves stamped with the municipal weight seal.
- **Wooden Peel** (`Tool`): A wide wooden paddle used for loading and retrieving loaves from deep stone ovens.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Oven Thermal Retention (`0–10`)**: At `0–3`, masonry cools prematurely, leaving dough raw and unrisen. At `8–10`, ideal radiant heat yields golden, crisp crusts.
- **Quest Hook — *The Scarcity Loaf***: When dwindling wood fuel threatens to shut down the ovens mid-baking, Martha must negotiate emergency timber allotments while guarding the remaining dough from desperate citizens.
