---
id: "IND-BREW-01"
title: "Floor Malting Kiln"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-BREW"
chain_stage: 1
chain_role: "refining"
provides:
  - "Food: Malted-Grain"
requires:
  - "Crop: Raw-Wheat"
  - "Fuel: Wood-Fuel"
---
# Floor Malting Kiln (`IND-BREW-01`)
> **Industry Chain**: `CHAIN-BREW` (Stage 1: `refining`)

## 1. Architectural Overview & Operational Loop
The floor malting kiln is a specialized vaulted masonry hall where harvested cereal grains are steeped in water, germinated on stone floors to activate diastatic enzymes, and gently roasted over a closed wood-fuel kiln. Laborers meticulously rake and turn the sprouting grain beds by hand to regulate humidity and heat, transforming raw agricultural starches into saccharified malt ready for brewing.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, -1, 2]` — **Bureaucratic Artisan** (`Hierarchy`).
- **Sociological Rationale**: The strict thermal timing and moisture control schedules demand disciplined guild adherence to communal processing norms and meticulous record-keeping.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Malter Master Gerhardt Vane"
  role: "Chief Maltster"
  disposition: "[1, -1, 2]"
  motivation: "Ensure even germination across batches without risking scorching or mold growth."
- name: "Kiln Laborer Marta Kael"
  role: "Turnkey Raker"
  disposition: "[0, -2, 1]"
  motivation: "Maintain daily wage parity and secure extra rations during grueling winter drying cycles."

### Material Stocks & Items (Item Prototypes)
- **Raw-Wheat** (`Commodity`): Unprocessed dry cereal grain delivered from regional agrarian estates.
- **Malted-Grain** (`Commodity`): Sprouted and kiln-dried grain rich in fermentable sugars.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Thermal Draft Control (`0–10`)**: At `0–3`, kiln temperatures drop, resulting in damp, under-modified grain. At `8–10`, excessive draft scorches the malt bed, turning batches bitter and useless.
- **Quest Hook — *The Scorched Sprout Emergency*---**: A sudden damp snap threatens the germination floor while a corrupted batch of wood-fuel sends thick soot over the malting beds. Master Gerhardt must enlist Marta to hand-sort the viable grain before guild inspectors condemn the entire seasonal malt yield.
