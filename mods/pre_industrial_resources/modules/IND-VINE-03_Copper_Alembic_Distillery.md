---
id: "IND-VINE-03"
title: "Copper Alembic Distillery"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-VINE"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Chem: Distilled-Spirits"
requires:
  - "Food: Vintage-Wine"
  - "Metal: Forged-Copper"
  - "Fuel: Wood-Fuel"
---
# Copper Alembic Distillery (`IND-VINE-03`)
> **Industry Chain**: `CHAIN-VINE` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Hand-hammered copper pot stills featuring long cooling condensers and water jackets sit over controlled masonry hearths. Laborers manage wood-fuel combustion to gently vaporize fermented wine, capturing the concentrated alcohol vapor through precision fractional condensation. The facility transforms vintage wine, forged copper hardware, and wood fuel into potent, purified distilled spirits.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 2, 1]` — **Alchemical Technologist** (`Adhocracy`).
- **Sociological Rationale**: Managing thermal gradients, vapor condensation points, and volatile chemical separation requires experimental acuity and rigorous technical precision.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Alchemist Vespera Drake"
  role: "Chief Distiller"
  disposition: "[0, 2, 1]"
  motivation: "Isolate the purest heart-run distillate while discarding noxious methanol heads."
- name: "Hearth Tender Bram Mason"
  role: "Fire Control Artisan"
  disposition: "[-1, 1, 0]"
  motivation: "Maintain steady, controlled flame temperatures beneath the alembic boiler."

### Material Stocks & Items (Item Prototypes)
- **Chem: Distilled-Spirits** (`Commodity`): Highly concentrated ethanol solution used for medicine, solvents, and potent potables.
- **Copper Still Worm** (`Tool`): A coiled copper tube immersed in cold water for condensing vapor back into liquid.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Still Thermal Gradient` (`0–10`)**: At `0–3`, inadequate heat fails to vaporize the alcohol, stalling the run. At `8–10`, violent boiling scorches the wine, infusing the distillate with foul pyrolytic tars.
- **Quest Hook — *The Scorched Mash***: A sudden draft stokes the hearth of Bram Mason too fiercely, threatening to ruin Master Alchemist Vespera Drake's entire batch of high-grade spirit unless the heat is immediately damped and redirected.
