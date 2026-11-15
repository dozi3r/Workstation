---
id: "FARM-COTTON-01"
title: "Cotton Plantation"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-COTTON"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Raw-Cotton-Boll"
requires: []
---

# Cotton Plantation (`FARM-COTTON-01`)
> **Industry Chain**: `CHAIN-COTTON` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The cotton plantation consists of sprawling sun-baked alluvial fields divided by drainage ditches and overseen from a central timber drying platform. Field hands labor under intense solar heat, manually picking fluffy white cotton bolls from thorny scrub shrubs. Unprocessed inputs are zero, while harvested raw cotton bolls are packed into burlap sacks and hauled to regional ginning houses.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, 2, -1]` (pick integers -3 to +3) — **Plutocratic Enterprise** (`Market`).
- **Sociological Rationale**: Driven by cash-crop export incentives and strict volume quotas, plantation operations emphasize market efficiency, output maximization, and labor commodification.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Estate Factor Gideon Vance"
  role: "Plantation Administrator and Yield Assessor"
  disposition: "[0, 2, -1]"
  motivation: "Exceed export quotas and secure premium pricing from coastal merchant syndicates."
- name: "Field Boss Kora Diallo"
  role: "Harvest Crew Foreman"
  disposition: "[-1, 1, 0]"
  motivation: "Protect harvest workers from extreme heat exhaustion while meeting daily weighing minimums."

### Material Stocks & Items (Item Prototypes)
- **Raw-Cotton-Boll** (`Commodity`): Unprocessed cotton fibers intertwined with stubborn seed pods straight from the field.
- **Weighing Scale** (`Tool`): Brass-balanced hanging scale used to measure daily picker quotas.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Boll Weevil Infestation` (`0–10`)**: At `0–3`, plants flourish untouched in dry conditions. At `8–10`, parasitic beetles ravage fields, destroying staple bolls before harvest.
- **Quest Hook — *The Pestilence Spread***: Field Boss Kora Diallo warns Estate Factor Gideon Vance that an uncontained beetle swarm threatens the entire western acreage.
