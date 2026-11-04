---
id: "FARM-OLIVE-01"
title: "Terraced Olive Grove"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-OLIVE"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Olives"
requires: []
---
# Terraced Olive Grove (`FARM-OLIVE-01`)
> **Industry Chain**: `CHAIN-OLIVE` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Dry stone agricultural terraces carved into arid hillsides capture sparse winter rainfall and retain thin, rocky limestone soils suited for resilient drupes. Human labor involves seasonal pruning, hand-harvesting with beating poles and baskets, and maintaining retaining walls. The grove transforms raw sunlight, winter moisture, and manual toil into fresh raw olives destined for milling.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, 1]` — **Paterfamilias** (`Hierarchy`).
- **Sociological Rationale**: Generations of land cultivation on fixed ancestral terraces enforce a strictly ordered generational authority and familial hierarchy.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Grove Overseer Kosta Vassos"
  role: "Terrace Master"
  disposition: "[1, 1, 1]"
  motivation: "Maintain ancestral property boundaries and stone wall integrity against erosion."
- name: "Seasonal Harvester Eleni Maris"
  role: "Pruner and Picker"
  disposition: "[0, 0, -1]"
  motivation: "Secure a fair share of the olive harvest payment before winter storms arrive."

### Material Stocks & Items (Item Prototypes)
- **Crop: Olives** (`Commodity`): Bitter, oil-rich drupes harvested at peak maturity.
- **Pruning Hook** (`Tool`): A curved steel blade on a wooden pole used for trimming fruitless branches.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Soil Retention` (`0–10`)**: At `0–3`, catastrophic winter flash floods collapse terrace walls. At `8–10`, deep root systems stabilize hillsides and maximize yields.
- **Quest Hook — *The Collapsed Wall* டை**: A torrential autumn cloudburst breaches the lower terrace wall of Grove Overseer Kosta Vassos, threatening to wash away ancient trees unless Eleni Maris and her crew rebuild the stonework before nightfall.
