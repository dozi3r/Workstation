---
id: "IND-RICE-02"
title: "Water-Driven Hull Mill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-RICE"
chain_stage: 2
chain_role: "refining"
provides:
  - "Food: Hulled-Rice"
requires:
  - "Crop: Paddy-Rice"
---

> **Water-Driven Hull Mill** (`IND-RICE-02`)
> **Industry Chain**: `CHAIN-RICE` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
The water-driven hull mill utilizes an overshot wooden waterwheel connected to heavy stone pestles and wooden mortars housed in a timber pavilion. Rushing river currents turn the drive shaft, automatically lifting and dropping pestles into stone mortars filled with harvested paddy-rice. Raw paddy-rice inputs are scoured of their abrasive chaff and polished into edible hulled-rice, which is bagged for distribution to urban markets and garrisons.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, -1, 1]` (pick integers -3 to +3) — **Artisan Guild** (`Hierarchy`).
- **Sociological Rationale**: Millwrights and millers operate within a tightly structured cooperative guild that regulates milling tolerances and prevents profiteering on staple grain processing.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Millwright Master Thao Van"
  role: "Chief Millwright and Gear Inspector"
  disposition: "[0, -1, 2]"
  motivation: "Maintain smooth cam-shaft rotation and prevent catastrophic wooden gear stripping during peak harvest."
- name: "Sifter Apprentice Lian Keng"
  role: "Grain Sifter and Bagging Hand"
  disposition: "[1, -2, 1]"
  motivation: "Secure a full journeyman wage by mastering the delicate chaff-winnowing wind-screens."

### Material Stocks & Items (Item Prototypes)
- **Hulled-Rice** (`Commodity`): Cleaned, white or brown rice kernels stripped of inedible chaff, ready for consumption.
- **Granite Pestle** (`Tool`): Heavy stone grinding head mounted on an articulated wooden lever.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Cam-Tooth Wear` (`0–10`)**: At `0–3`, hardwood teeth mesh silently and efficiently. At `8–10`, worn teeth shatter under load, halting mill operations mid-season.
- **Quest Hook — *The Shattered Cam***: Master Thao Van enlists apprentice Lian Keng to carve a replacement ironwood cam tooth before the village grain tribute convoy arrives.
