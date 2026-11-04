---
id: "IND-OPTIC-02"
title: "Clockwork & Navigational Instrument Guild"
set: "Set_A_Infrastructure_and_Engineering"
category: "Precision_Instruments"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-OPTICS"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Luxury: Precision-Instruments"
requires:
  - "Component: Ground-Lenses"
  - "Alloy: Cast-Bronze"
  - "Alloy: Crucible-Steel"
---
# Clockwork & Navigational Instrument Guild (`IND-OPTIC-02`)
> **Industry Chain**: `CHAIN-OPTICS` (Stage 2: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The instrument guild hall is a quiet, well-lit sanctuary filled with jeweled pivot lathes, dividing engines, and fine-tooth gear cutters. Horologists and instrument makers assemble ground lenses, cast bronze circles, and spring-tempered steel escapements into intricate sextants, chronometers, and astronomical transits.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 0, 2]` — **Guild Technocrat** (`Hierarchy`).
- **Sociological Rationale**: High-precision manufacture demands strict guild standardization, rigorous mathematical calibration, and unyielding protection of proprietary mechanical designs.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Horologist Cornelius Finch"
  role: "Guild Dean of Instruments"
  disposition: "[2, 0, 2]"
  motivation: "Deliver marine chronometers of unprecedented accuracy to secure the royal navigation patent."
- name: "Journeyman Tacy Mercer"
  role: "Escapement Adjuster"
  disposition: "[1, -1, 1]"
  motivation: "Perfect balance-wheel spring tensions to prevent thermal drift during long sea voyages."

### Material Stocks & Items (Item Prototypes)
- **Cast-Bronze** (`Commodity`): Stable alloy castings machined into graduated circles and instrument frames.
- **Precision-Instruments** (`Tool`): Finished brass-and-glass marvels enabling exact celestial navigation.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Escapement Calibration (`0–10`)**: At `0–3`, erratic gear friction causes chronometers to lose vital seconds daily. At `8–10`, over-tensioned mainsprings fracture under tension during stress testing.
- **Quest Hook — *The Stolen Ephemeris*---**: A prototype marine chronometer vanishes from the locked guild vault right before naval trials. Cornelius and Tacy must recover the instrument before rival smugglers replicate the secret escapement design.
