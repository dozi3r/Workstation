---
id: "IND-PINE-02"
title: "Tar Kiln & Pitch Boilery"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-PINE"
chain_stage: 2
chain_role: "refining"
provides:
  - "Chem: Pine-Pitch"
requires:
  - "Resin: Raw-Pine-Resin"
  - "Fuel: Wood-Fuel"
---
> **Tar Kiln & Pitch Boilery** (`IND-PINE-02`)
> **Industry Chain**: `CHAIN-PINE` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
A terraced earthen mound built over a stone-lined drainage basin where pine roots and resinous billets are stacked, sealed with turf, and slowly smothered-burned to render dark wood tar. The raw tar is subsequently boiled down in heavy copper cauldrons to drive off volatile spirits, producing thick, waterproof pine pitch for ship-calking and timber preservation.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, -1, -1]` — **Traditionalist** (`Hierarchy`).
- **Sociological Rationale**: Operating smoky, low-oxygen earth kilns requires generational tacit knowledge, strict adherence to smothering times, and steady custodial endurance.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Kiln Master Jorn Kaelen"
  role: "Tar Burner"
  disposition: "[1, -1, -1]"
  motivation: "Maintain perfect kiln seal integrity to prevent wood from flashing into useless ash."
- name: "Boilery Hand Miri Voss"
  role: "Cauldron Tender"
  disposition: "[-1, 0, 1]"
  motivation: "Extract maximum viscous pitch yield without scorching the bottom plates."

### Material Stocks & Items (Item Prototypes)
- **Pine Pitch** (`Commodity`): Thick, black, waterproof resinous compound used to calk timber hulls and seams.
- **Copper Cauldron** (`Tool`): Large heavy-lipped vessel used for boiling down crude tar into refined pitch.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Kiln Smothering Rate` (`0–10`)**: At `0–3`, air leaks cause the entire wood stack to burst into open flame, destroying the batch. At `8–10`, oxygen starvation chokes the burn so completely that no tar drains.
- **Quest Hook — *The Ruptured Mound*스러**: When a turf seal collapses on the main tar kiln, Jorn must shovel wet clay into the blazing vent before the entire winter harvest ignites.
