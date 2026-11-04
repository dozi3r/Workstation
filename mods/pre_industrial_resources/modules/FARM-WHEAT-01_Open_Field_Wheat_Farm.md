---
id: "FARM-WHEAT-01"
title: "Open-Field Wheat Farm"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-WHEAT"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Raw-Wheat"
requires: []
---
# Open-Field Wheat Farm (`FARM-WHEAT-01`)
> **Industry Chain**: `CHAIN-WHEAT` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Open-field cultivation relies on communal crop rotation cycles, moldboard plows drawn by oxen teams, and manual broadcasting of grain seeds. Tenant laborers till the loam soil during early spring, maintain drainage furrows through summer rains, and harvest golden stalks in autumn using sickles and scythes before threshing them on stone floors. This relentless agrarian toil directly converts seasonal solar energy and fertile topsoil into raw harvested wheat.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, -1, +2]` — **Guardian** (`Hierarchy`).
- **Sociological Rationale**: The rigid demands of communal planting calendars and manor oversight cultivate a deeply conservative, duty-bound peasant disposition anchored in traditional hierarchy and seasonal routine.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Bailiff Thomas Vance"
  role: "Manorial Overseer"
  disposition: "[+2, -1, +2]"
  motivation: "Ensure annual harvest quotas exceed manorial tribute demands regardless of weather."
- name: "Plowman Garrett Miller"
  role: "Lead Agrarian Laborer"
  disposition: "[+1, -2, +1]"
  motivation: "Secure sufficient grain retention for his family's winter survival through honest toil."

### Material Stocks & Items (Item Prototypes)
- **Raw-Wheat** (`Commodity`): Heavy sacks of unthreshed cereal grain ready for milling.
- **Ox-Driven Plow** (`Tool`): A heavy timber moldboard plow fitted with an iron-tipped share.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Fallow Rotation Rate (`0–10`)**: At `0–3`, soil exhaustion triggers severe blight. At `8–10`, disciplined three-field rotation restores robust nutrient balance.
- **Quest Hook — *The Weevil Blight***: When a mysterious fungal rot infects the early granary reserves, Bailiff Vance presses the exhausted farm hands into emergency tilling before the autumn frost locks the soil.
