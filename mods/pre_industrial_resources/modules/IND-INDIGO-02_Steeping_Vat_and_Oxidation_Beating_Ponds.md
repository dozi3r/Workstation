---
id: "IND-INDIGO-02"
title: "Steeping Vat & Oxidation Beating Ponds"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-INDIGO"
chain_stage: 2
chain_role: "refining"
provides:
  - "Dye: Indigo-Paste"
requires:
  - "Crop: Indigo-Leaves"
  - "Chem: Slaked-Lime"
---

## 1. Architectural Overview & Operational Loop
Constructed from lined stone vats and shallow terraced oxidation basins, this facility ferments harvested indigo leaves in standing water to release indican, which is then hydrolyzed into indoxyl. Workers beat the alkaline solution with wooden paddles to aerate the liquor, triggering precipitation into dense indigo sediment. Slaked lime is added to stabilize the reaction, transforming raw agricultural biomass into concentrated indigo paste.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 2, -1]` — **Systemic Technocrat** (`Hierarchy`).
- **Sociological Rationale**: Precise chemical timing and rigid process control require strict adherence to standard operational procedures among the vat-tenders.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Vat-Master Kaelen Vance"
  role: "Chief Steeping Supervisor"
  disposition: "[1, 2, -1]"
  motivation: "Maintain absolute chemical consistency across fermentation batches."
- name: "Paddle-Hand Sula Thorne"
  role: "Oxidation Laborer"
  disposition: "[0, 1, 0]"
  motivation: "Earn enough coin during harvest season to pay off family debts."

### Material Stocks & Items (Item Prototypes)
- **Indigo-Paste** (`Commodity`): Dense, deep blue pigment sludge ready for dyeing textiles.
- **Slaked-Lime** (`Reagent`): Caustic alkaline powder used to precipitate and settle dye molecules.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Aeration Rigor (`0–10`)**: At `0–3`, incomplete oxidation produces weak, greyish dye. At `8–10`, aggressive beating causes foaming losses and structural vat strain.
- **Quest Hook — *The Spoiled Fermentation*---**: A sudden temperature drop stalls the steeping vats, threatening the entire seasonal dye yield unless Kaelen can secure emergency hot water barrels.
