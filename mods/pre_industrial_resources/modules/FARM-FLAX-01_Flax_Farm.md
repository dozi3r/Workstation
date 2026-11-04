---
id: "FARM-FLAX-01"
title: "Flax Farm"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-FLAX"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Raw-Flax"
requires: []
---
# Flax Farm (`FARM-FLAX-01`)
> **Industry Chain**: `CHAIN-FLAX` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Flax cultivation demands damp, fertile bottomlands where delicate blue-flowered stalks can grow tall without branching. Laborers painstakingly pull the mature plants up entirely by the roots rather than cutting them to preserve maximum fiber length, bundling them into sheaves for drying. This delicate agricultural extraction yields fibrous raw flax ready for industrial retting.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, 0, +1]` — **Bureaucrat** (`Hierarchy`).
- **Sociological Rationale**: Cultivating delicate industrial crops requires strict adherence to seasonal harvesting windows and careful hand-labor organization, fostering disciplined agrarian routines.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Overseer Lyra Fenn"
  role: "Flax Field Supervisor"
  disposition: "[+1, 0, +2]"
  motivation: "Ensure every stalk is pulled root-and-all before over-ripening ruins the inner bast fibers."
- name: "Fieldhand Corin Vane"
  role: "Harvester"
  disposition: "[0, -1, 0]"
  motivation: "Survive the grueling dawn-to-dusk root pulling without debilitating back injuries."

### Material Stocks & Items (Item Prototypes)
- **Raw-Flax** (`Commodity`): Bundled bundles of dried, unretted flax stalks complete with seed bolls.
- **Rooting Fork** (`Tool`): A short-tine digging fork used to loosen stubborn clay around root bases.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Harvest Timing (`0–10`)**: At `0–3`, premature harvesting yields weak, underdeveloped fibers. At `8–10`, precise yellowing triggers maximum tensile strength.
- **Quest Hook — *The Premature Storm***: An unseasonal autumn squall threatens to flatten the ripe flax fields, forcing Lyra to rally reluctant villagers for frantic round-the-clock pulling before stalks rot in the mud.
