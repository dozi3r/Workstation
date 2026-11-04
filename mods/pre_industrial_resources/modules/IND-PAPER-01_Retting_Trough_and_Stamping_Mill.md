---
id: "IND-PAPER-01"
title: "Retting Trough & Stamping Mill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Paper_and_Printing"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-PAPER"
chain_stage: 1
chain_role: "refining"
provides:
  - "Material: Rag-Pulp"
requires:
  - "Textile: Linen-Cloth"
  - "Material: Rice-Straw"
  - "Chem: Slaked-Lime"
---

## 1. Architectural Overview & Operational Loop
This water-powered processing works features stone retting troughs and heavy timber stamping hammers driven by an overshot waterwheel. Plant fibers, rags, and straw are soaked in lime-infused water to break down lignins, then mechanically macerated by falling pestles into a uniform, fibrous slurry known as rag pulp.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 0]` — **Operational Pragmatist** (`Market`).
- **Sociological Rationale**: Focuses on mechanical throughput, fiber consistency, and raw material cost reduction.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Miller Hobb Miller"
  role: "Head Stamping Master"
  disposition: "[0, 1, 0]"
  motivation: "Keep the waterwheel turning and hammers synchronized without axle failure."
- name: "Trough-Hand Lyra Chen"
  role: "Fiber Prepper"
  disposition: "[-1, 0, 1]"
  motivation: "Ensure uniform soaking times to prevent knotty imperfections in the slurry."

### Material Stocks & Items (Item Prototypes)
- **Rag-Pulp** (`Commodity`): Wet, fibrous paste ready for sheet forming and pressing.
- **Waterwheel-Drive** (`Tool`): Heavy wooden linkage transferring kinetic energy to vertical stamping pestles.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Maceration Time (`0–10`)**: At `0–3`, coarse, lumpy pulp produces weak, uneven paper sheets. At `8–10`, over-beating turns fibers to mush, clogging drainage screens.
- **Quest Hook — *The Broken Axle*---**: The main wooden drive shaft splinters under heavy load, halting pulp production just as a major municipal book contract is due.
