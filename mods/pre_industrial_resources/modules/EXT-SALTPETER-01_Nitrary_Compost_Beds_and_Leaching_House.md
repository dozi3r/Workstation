---
id: "EXT-SALTPETER-01"
title: "Nitrary Compost Beds & Leaching House"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-POWDER"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Chem: Refined-Saltpeter"
requires:
  - "Chem: Potash"
  - "Fuel: Wood-Fuel"
---
> **Nitrary Compost Beds & Leaching House** (`EXT-SALTPETER-01`)
> **Industry Chain**: `CHAIN-POWDER` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Constructed over wide, walled earthen terraces, decomposing organic refuse, lime, and animal wastes are layered in long ridges to foster nitrifying bacteria. The resulting calcareous earth is shoveled into large wooden leaching vats where boiling water extracts crude potassium nitrate liquor, which is subsequently crystallized through wood-fueled evaporation.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 2, -1]` — **Bureaucrat** (`Hierarchy`).
- **Sociological Rationale**: The rigorous monitoring of compost temperature, moisture, and chemical purity enforces a deeply institutional and regimented labor discipline.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Nitrator Barnaby Vance"
  role: "Compost Supervisor"
  disposition: "[1, 2, -1]"
  motivation: "Maintain consistent bacterial yield and prevent explosive decomposition failures."
- name: "Leacher's Mate Garrow"
  role: "Vat Tender"
  disposition: "[-1, 1, 2]"
  motivation: "Secure extra rations of coarse salt and dry woolens for winter shifts."

### Material Stocks & Items (Item Prototypes)
- **Calcareous Earth** (`Commodity`): Earthen scrape rich in organic nitrates harvested from stable floors.
- **Leaching Vat** (`Tool`): Heavy oak tub fitted with straw and gravel false bottoms for brine filtration.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Compost Aeration Rate` (`0–10`)**: At `0–3`, heaps go anaerobic and sour, yielding zero saltpeter. At `8–10`, excessive turning dries the beds and halts microbial activity.
- **Quest Hook — *The Fouled Basin***: When a batch of leaching liquor is contaminated with organic grease, Master Barnaby must root out negligence before the gunpowder works halt supply.
