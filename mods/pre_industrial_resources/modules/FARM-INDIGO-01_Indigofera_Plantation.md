---
id: "FARM-INDIGO-01"
title: "Indigofera Plantation"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-INDIGO"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Indigo-Leaves"
requires: []
---

> **Indigofera Plantation** (`FARM-INDIGO-01`)
> **Industry Chain**: `CHAIN-INDIGO` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The Indigofera plantation consists of leveled tropical fields planted in dense rows of leguminous shrubbery adjacent to stone steeping vats. Field laborers harvest leafy branches at dawn before midday heat degrades the indican content within the foliage. Unprocessed inputs are zero, while harvested indigo-leaves are rushed to steeping vats to initiate pigment extraction.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 0]` (pick integers -3 to +3) — **Agricultural Enterprise** (`Market`).
- **Sociological Rationale**: Driven by high commercial demand for natural blue dye, plantation workflows balance rapid harvest schedules with strict fermentation timing.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Planter Natesan"
  role: "Chief Crop Supervisor"
  disposition: "[0, 1, 1]"
  motivation: "Ensure leaves are harvested at peak indican maturity right before sunrise."
- name: "Harvester Valli"
  role: "Field Cutting Lead"
  disposition: "[1, 0, 0]"
  motivation: "Maximize daily foliage yield without damaging the perennial shrub rootstock."

### Material Stocks & Items (Item Prototypes)
- **Indigo-Leaves** (`Commodity`): Freshly harvested, green foliage containing glucoside indican precursors for blue dye.
- **Harvesting Sickle** (`Tool`): Curved iron blade used for clean, rapid pruning of Indigofera branches.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Indican Degradation Rate` (`0–10`)**: At `0–3`, leaves reach vats fresh with maximum pigment potential. At `8–10`, delayed transport causes leaves to ferment prematurely in baskets, ruining the dye yield.
- **Quest Hook — *The Wilting Carts***: Harvester Valli reports that broken transport carts are delaying leaf delivery, causing harvested indigo leaves to sour in the tropical sun.
