---
id: "IND-SALT-02"
title: "Salt Boiling House & Granary"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SALT"
chain_stage: 2
chain_role: "refining"
provides:
  - "Commodity: Coarse-Salt"
requires:
  - "Commodity: Brine-Slurry"
  - "Fuel: Wood-Fuel"
---

> Salt Boiling House & Granary (`IND-SALT-02`)
> **Industry Chain**: `CHAIN-SALT` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
The salt boiling house utilizes massive iron pans suspended over stone hearths to drive off remaining water from brine-slurry delivered by coastal pans. Wood-fuel stoked continuously by boilermen generates intense heat, forcing rapid crystallization of coarse salt crystals. The dried product is shoveled into adjacent timber granaries where it cures and stabilizes before export.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 2, -1]` (pick integers -3 to +3) — **Entrepreneurial Optimizer** (`Market`).
- **Sociological Rationale**: High fuel costs and fluctuating market demand for preserved provisions drive intense commercial competition and rapid scaling among salt-boilers.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Boiler Bronwen Fane"
  role: "Chief Evaporation Overseer"
  disposition: "[1, 2, -1]"
  motivation: "Secure high-grade timber fuel contracts to keep boiling pans operating at maximum output."
- name: "Granary Clerk Silas Mallow"
  role: "Salt Storekeeper"
  disposition: "[-1, 1, 1]"
  motivation: "Prevent moisture seepage into the dry storage bins to protect profit margins."

### Material Stocks & Items (Item Prototypes)
- **Coarse-Salt** (`Commodity`): Large, mineral-rich salt crystals packed in barrels for maritime preservation.
- **Iron Boiling Pan** (`Tool`): Heavy forged iron vessel capable of withstanding intense continuous wood-fire heat.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Furnace Heat Intensity` (`0–10`)**: At `0–3`, wet wood chokes the hearths and halts boiling operations. At `8–10`, overheating cracks the expensive cast-iron boiling pans, halting production.
- **Quest Hook — *The Damp Reserve***: Silas Mallow discovers rising damp threatening the central granary stock, requiring immediate relocation of tons of salt before it dissolves.
