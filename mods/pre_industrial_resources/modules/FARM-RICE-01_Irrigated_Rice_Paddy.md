---
id: "FARM-RICE-01"
title: "Irrigated Rice Paddy"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-RICE"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Paddy-Rice"
  - "Material: Rice-Straw"
requires: []
---

> **Irrigated Rice Paddy** (`FARM-RICE-01`)
> **Industry Chain**: `CHAIN-RICE` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The irrigated rice paddy relies on terraced earthwork bunds, intricately managed irrigation channels, and seasonal monsoon inundation to sustain submerged grain cultivation. Laborers spend grueling shifts transplanting seedlings knee-deep in anaerobic mud and harvesting mature panicles with sickles before drying the stalks. Unprocessed inputs are absent, while harvested paddy-rice and leftover rice-straw are bundled and exported to granaries and fodder stores.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, -1, 2]` (pick integers -3 to +3) — **Bureaucratic Agrarian** (`Hierarchy`).
- **Sociological Rationale**: The rigid coordination required for communal water allocation and levee maintenance fosters a strict hierarchical discipline and collective civic compliance among the agrarian workforce.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Paddy Overseer Jian Lin"
  role: "Water Master and Levee Inspector"
  disposition: "[2, -1, 2]"
  motivation: "Ensure equitable sluice-gate timing across all terraced basins to prevent drought riots."
- name: "Trench Laborer Mae Sorn"
  role: "Seedling Transplanter"
  disposition: "[1, -2, 1]"
  motivation: "Survive the grueling monsoon planting season without succumbing to foot rot or debt bondage."

### Material Stocks & Items (Item Prototypes)
- **Paddy-Rice** (`Commodity`): Raw, unhusked rice grains still encased in protective hulls.
- **Rice-Straw** (`Commodity`): Dried stalks harvested alongside grain, used for thatch, fuel, and fodder.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Sluice Siltation Level` (`0–10`)**: At `0–3`, crystal-clear mountain meltwaters nourish robust stalks. At `8–10`, heavy upstream erosion chokes primary irrigation canals, threatening total crop failure.
- **Quest Hook — *The Silt-Choked Sluice***: Overseer Jian Lin demands that laborer Mae Sorn clear the collapsed eastern dam before the midday monsoon flood drowns the lower terraces.
