---
id: "FARM-HEMP-01"
title: "Coastal Hemp Plantation"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-HEMP"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Raw-Hemp-Stalks"
requires: []
---

# Coastal Hemp Plantation (`FARM-HEMP-01`)
> **Industry Chain**: `CHAIN-HEMP` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Coastal hemp plantations cultivate deep-rooted *Cannabis sativa* in fertile alluvial floodplains near tidal estuaries. Field laborers sow dense seedbeds that grow rapidly into tall, fibrous stalks. Once mature, workers harvest the crops by hand, binding them into bundles and submerging them in retting ponds to loosen the inner bast fibers from the woody core.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, -1, 1]` (pick integers -3 to +3) — **Agrarian Clan** (`Clan`).
- **Sociological Rationale**: Large-scale agricultural cultivation relies on generational farming communities, seasonal collective labor, and deep stewardship of local soil chemistry.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Fieldreeve Lyra Fenn"
  role: "Plantation Overseer"
  disposition: "[0, -1, 1]"
  motivation: "Coordinate harvest rotations before autumn rains rot the standing hemp stalks."
- name: "Ditcher Micah Holt"
  role: "Irrigation Master"
  disposition: "[-1, 0, 0]"
  motivation: "Manage tidal creek sluices to keep the retting ponds at optimal bacterial activity levels."

### Material Stocks & Items (Item Prototypes)
- **Raw-Hemp-Stalks** (`Crop`): Tall, fibrous plant stems harvested for maritime cordage and textile production.
- **Retting Pit** (`Tool`): Earthen pool where harvested stalks undergo water-rotting to separate fibers.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Fiber Tenacity & Growth` (`0–10`)**: At `0–3`, soil salinity spikes stunt growth, yielding brittle, weak fibers. At `8–10`, ideal conditions produce massive bumper crops that overwhelm local retting capacity.
- **Quest Hook — *The Stagnant Sluice***: Micah Holt finds the main irrigation channel blocked by silt, threatening to dry out the vital retting ponds before harvest processing begins.
