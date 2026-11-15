---
id: "IND-SILVER-02"
title: "Stamping Mill & Patio Amalgamation Floor"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SILVER"
chain_stage: 2
chain_role: "refining"
provides:
  - "Metal: Crude-Bullion"
  - "Ore: Lead-Slag"
requires:
  - "Ore: Argentiferous-Galena"
  - "Commodity: Coarse-Salt"
  - "Metal: Forged-Iron"
  - "Livestock: Draft-Animals"
---
# Stamping Mill & Patio Amalgamation Floor (`IND-SILVER-02`)
> **Industry Chain**: `CHAIN-SILVER` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
Raw galena ore is crushed to fine powder by heavy iron-shod stamping hammers powered by waterwheels, then spread across a vast paved stone patio. Workers mix the crushed ore with mercury, copper sulfate, and coarse salt, driving mules in endless circles to trample the sludge and amalgamate the precious silver. The required inputs of Ore: Argentiferous-Galena and Coarse-Salt undergo chemical amalgamation, yielding refined Metal: Crude-Bullion and waste Ore: Lead-Slag.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, -2, 2]` (pick integers -3 to +3) — **Indentured Bureaucracy** (`Hierarchy`).
- **Sociological Rationale**: Industrial-scale processing floors dominated by toxic mercury vapor and forced mule-drivers foster strict foreman oversight and grueling mechanized routines.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Amalgamation Overseer Mateo Silva"
  role: "Process Master"
  disposition: "[1, -1, 2]"
  motivation: "Ensure maximum mercury recovery rates while minimizing loss into tailings drains."
- name: "Mule-Driver Kito"
  role: "Patio Laborer"
  disposition: "[-2, -2, 0]"
  motivation: "Survive chronic mercury poisoning long enough to buy manumission for his family."

### Material Stocks & Items (Item Prototypes)
- **Quicksilver Flask** (`Reagent`): Heavy iron flask containing liquid mercury used to bind native silver particles.
- **Paved Flagstone Yard** (`Tool`): Sloped masonry patio designed to contain toxic amalgamation slurries.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Amalgamation Efficiency` (`0–10`)**: At `0–3`, faulty mixing leaves silver trapped in tailings. At `8–10`, optimized chemical ratios extract maximum crude bullion.
- **Quest Hook — *The Quicksilver Leak***: A subterranean drainage pipe fractures, bleeding toxic mercury into the municipal river and sparking immediate panic among downstream farmers.
