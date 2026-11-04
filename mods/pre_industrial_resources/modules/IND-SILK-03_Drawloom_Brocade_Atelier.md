---
id: "IND-SILK-03"
title: "Drawloom Brocade Atelier"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SILK"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Luxury: Silk-Brocade"
requires:
  - "Textile: Reeled-Silk-Thread"
  - "Dye: Indigo-Paste"
  - "Metal: Gold-Bullion"
---

> **Drawloom Brocade Atelier** (`IND-SILK-03`)
> **Industry Chain**: `CHAIN-SILK` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The drawloom brocade atelier is an elite, quiet workshop dominated by massive complex drawlooms operated by paired weavers and draw-boys. Artisans interlace reeled silk threads with dyed-indigo backgrounds and beaten gold-bullion thread to create heavy, patterned imperial textiles. Reeled silk thread, indigo paste, and gold bullion inputs are synthesized into luxurious silk-brocade bolts for nobility and export.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 1, 2]` (pick integers -3 to +3) — **Elite Guild** (`Hierarchy`).
- **Sociological Rationale**: Serving royal patrons and producing high-value luxury goods requires absolute precision, strict secrecy of patterning codes, and hierarchical oversight.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Weaver Balam"
  role: "Chief Drawloom Designer"
  disposition: "[2, 1, 2]"
  motivation: "Execute flawless figural motifs incorporating gold thread without breaking warp alignment."
- name: "Draw-Boy Kavi"
  role: "Heddle Harness Operator"
  disposition: "[1, 0, 1]"
  motivation: "Pull complex draw-cords in exact sequence to form intricate geometric brocade patterns."

### Material Stocks & Items (Item Prototypes)
- **Silk-Brocade** (`Commodity`): Heavy, sumptuous fabric interwoven with gold threads and intricate dyed patterns.
- **Drawloom Harness** (`Tool`): Complex superstructure of weighted cords and heddles used to control pattern warps.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Harness Cord Tangling` (`0–10`)**: At `0–3`, draw-cords lift smoothly for clean patterning. At `8–10`, tangled cords jam the loom, ruining expensive gold-thread inlays.
- **Quest Hook — *The Tangled Draw-Cord***: Draw-Boy Kavi accidentally snaps a primary pattern cord, threatening to ruin a rush commission of imperial silk-brocade.
