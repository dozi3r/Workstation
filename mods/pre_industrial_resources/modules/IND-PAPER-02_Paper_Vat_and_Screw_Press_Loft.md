---
id: "IND-PAPER-02"
title: "Paper Vat & Screw-Press Loft"
set: "Set_A_Infrastructure_and_Engineering"
category: "Paper_and_Printing"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-PAPER"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Commodity: Laid-Paper"
requires:
  - "Material: Rag-Pulp"
  - "Chem: Mordant-Alum"
---

## 1. Architectural Overview & Operational Loop
Centered around heated vats of liquid pulp and towering oak screw-presses, skilled vatmen dip wire-mesh moulds into the slurry, expertly shaking them to interlock wet fibers into uniform sheets. The nascent paper sheets are couched onto felt blankets, stacked in multi-ton screw presses to expel excess water, and then loft-dried into durable laid paper.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, -1]` — **Guild Artisan** (`Hierarchy`).
- **Sociological Rationale**: Sheet formation requires rhythmic muscular coordination, strict quality standards, and generational apprenticeship secrets.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Vatman Corin Finch"
  role: "Chief Paper Maker"
  disposition: "[1, 1, -1]"
  motivation: "Produce flawlessly flat, translucent sheets without watermark distortion."
- name: "Pressman Toby Ross"
  role: "Screw-Press Operator"
  disposition: "[0, 1, 0]"
  motivation: "Maintain hydraulic and mechanical pressure consistency across every stack."

### Material Stocks & Items (Item Prototypes)
- **Laid-Paper** (`Commodity`): High-quality, durable writing sheets featuring distinct wire chain lines.
- **Wire-Mould** (`Tool`): Fine brass mesh frame used to catch and drain fibrous slurry into sheets.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Press Pressure (`0–10`)**: At `0–3`, waterlogged sheets warp and delaminate during drying. At `8–10`, excessive torque crushes the wet felts and tears the paper web.
- **Quest Hook — *The Faded Watermark*---**: A batch of custom crest moulds becomes misaligned, stamping blurred insignia onto the municipal tax rolls.
