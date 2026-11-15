---
id: "IND-OPTIC-01"
title: "Crown & Flint Lens-Grinding Lathe"
set: "Set_A_Infrastructure_and_Engineering"
category: "Precision_Instruments"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-OPTICS"
chain_stage: 1
chain_role: "refining"
provides:
  - "Component: Ground-Lenses"
requires:
  - "Commodity: Glassware"
  - "Mineral: Silica-Sand"
  - "Metal: Pig-Iron"
  - "Mineral: Emery-and-Rouge"
---
# Crown & Flint Lens-Grinding Lathe (`IND-OPTIC-01`)
> **Industry Chain**: `CHAIN-OPTICS` (Stage 1: `refining`)

## 1. Architectural Overview & Operational Loop
In dimly lit subterranean optics workshops, artisans operate treadle-driven vertical lathes mounted with cast-iron concave and convex grinding laps. Raw optical blanks cast from high-purity silica glass are meticulously ground down with graded emery powder and polished with rouge until microscopic spherical aberration is eliminated.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -2, 2]` — **Hermetic Virtuoso** (`Adhocracy`).
- **Sociological Rationale**: Precision optics work requires obsessive individual craftsmanship, secret polishing formulas, and absolute isolation from workshop vibrations and airborne dust.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Optician Alistair Penrose"
  role: "Master Lens Grinder"
  disposition: "[-1, -2, 2]"
  motivation: "Craft flawless achromatic doublet lenses capable of resolving astronomical star clusters."
- name: "Aide Sylvia Vance"
  role: "Lap Polishing Apprentice"
  disposition: "[0, -1, 1]"
  motivation: "Master the precise touch required for optical figuring without scratching expensive blanks."

### Material Stocks & Items (Item Prototypes)
- **Silica-Sand** (`Commodity`): Ultra-pure washed quartz sand utilized for high-grade crucible glass melts.
- **Ground-Lenses** (`Tool`): Curvature-ground optical components polished to micrometer tolerances.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Abrasive Grit Purity (`0–10`)**: At `0–3`, contaminated grit introduces deep micro-scratches across the glass face. At `8–10`, over-polishing deforms the focal length beyond usable tolerance.
- **Quest Hook — *The Imperfect Curve*---**: A critical batch of objective lenses intended for naval survey telescopes shows internal striae and surface distortion. Alistair and Sylvia must re-grind the entire set under impossible deadlines or face the wrath of the admiralty.
