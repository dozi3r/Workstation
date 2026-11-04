---
id: "IND-TIMBER-02"
title: "Water-Powered Sawmill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Forestry_and_Timber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-TIMBER"
chain_stage: 2
chain_role: "refining"
provides:
  - "Timber: Sawn-Lumber"
  - "Timber: Mine-Props"
requires:
  - "Timber: Hardwood-Logs"
---
# Water-Powered Sawmill (`IND-TIMBER-02`)
> **Industry Chain**: `CHAIN-TIMBER` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
A rushing weir channels river current onto a large vertical waterwheel, driving a reciprocating crank mechanism that moves a vertically tensioned steel saw blade up and down. Logs are clamped onto sliding carriage frames and slowly fed into the screaming blade, slicing raw timber into uniform boards and sturdy mine props. This mechanical processing converts round logs into standardized construction materials.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, +1, +1]` — **Administrator** (`Hierarchy`).
- **Sociological Rationale**: Managing high-speed reciprocating machinery and maintaining precise dimensional tolerances requires disciplined oversight, safety discipline, and orderly yard stacking.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Millwright Silas Vance"
  role: "Sawmill Master"
  disposition: "[+1, +1, +2]"
  motivation: "Keep the reciprocating blade true and prevent gear-train binding under heavy cutting loads."
- name: "Carriage Hand Joric"
  role: "Log Feeder"
  disposition: "[0, 0, 0]"
  motivation: "Advance timber carriage smoothly without jamming knots into the tempered saw blade."

### Material Stocks & Items (Item Prototypes)
- **Sawn-Lumber** (`Commodity`): Precision-cut hardwood planks stacked in drying cribs.
- **Mine-Props** (`Commodity`): Short, thick round timber posts tapered for underground shaft shoring.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Blade Tension (`0–10`)**: At `0–3`, loose blades wander and ruin expensive hardwood logs. At `8–10`, taut, well-lubricated blades produce perfectly straight boards.
- **Quest Hook — *The Snapped Crank Shaft***: When the main cast-iron reciprocating crank shatters under a knotted oak log, Silas must coordinate emergency forge welds with the local blacksmith before construction projects stall.
