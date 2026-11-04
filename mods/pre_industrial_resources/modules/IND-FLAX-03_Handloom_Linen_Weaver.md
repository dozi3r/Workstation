---
id: "IND-FLAX-03"
title: "Handloom Linen Weaver"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-FLAX"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Textile: Linen-Cloth"
requires:
  - "Textile: Flax-Fiber"
---
# Handloom Linen Weaver (`IND-FLAX-03`)
> **Industry Chain**: `CHAIN-FLAX` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Skilled artisans mount spun flax yarn onto wooden warping frames, thread heddles on complex counterbalance looms, and rhythmically pass heavy shuttles back and forth through alternating warp sheds. The interlocking threads are beaten tight with a wooden batten, creating durable, breathable linen cloth. This meticulous craft transforms refined fiber into finished garments and sailcloth.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, 0, -1]` — **Collaborator** (`Clan`).
- **Sociological Rationale**: Guild-regulated weaving workshops foster tight-knit apprenticeship bonds, intricate pattern sharing, and pride in fine artisanal craftsmanship.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Weaver Elenor Vance"
  role: "Guild Master Weaver"
  disposition: "[0, 0, -1]"
  motivation: "Weave flawless damask and plain linen bolts that meet strict municipal export standards."
- name: "Drawer Jemma Cross"
  role: "Heddle Tender"
  disposition: "[-1, 0, -2]"
  motivation: "Keep yarn tension perfectly balanced across hundreds of fragile warp threads."

### Material Stocks & Items (Item Prototypes)
- **Linen-Cloth** (`Commodity`): Tight-woven bolts of bleached white linen fabric.
- **Flying Shuttle** (`Tool`): A boat-shaped wooden bobbin carrier that speeds weft thread across the loom.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Warp Tension (`0–10`)**: At `0–3`, uneven tension snaps warp threads constantly, halting production. At `8–10`, smooth, balanced tension creates flawless woven bolts.
- **Quest Hook — *The Broken Heddle Frame***: When the master loom's primary heddle collapses during a rush royal order, Elenor must improvise emergency repairs using bone pins and silk cord before the bailiff inspects the workshop.
