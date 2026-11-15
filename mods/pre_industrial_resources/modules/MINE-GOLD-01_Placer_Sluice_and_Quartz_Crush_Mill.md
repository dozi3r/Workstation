---
id: "MINE-GOLD-01"
title: "Placer Sluice & Quartz Crush Mill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-GOLD"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Ore: Gold-Dust"
requires:
  - "Timber: Mine-Props"
---
# Placer Sluice & Quartz Crush Mill (`MINE-GOLD-01`)
> **Industry Chain**: `CHAIN-GOLD` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The gold extraction works combine rushing water sluices for alluvial gravels with heavy drop-stamp quartz mills powered by overshot waterwheels. Prospectors shovel auriferous gravels or crushed gold-bearing quartz veins through baffled wooden sluice runs lined with fleece or mercury rungs. The required input of Timber: Mine-Props builds the sturdy flumes and stamp frames, transforming raw river silt and quartz rock into heavy, glittering Ore: Gold-Dust.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 2, -1]` (pick integers -3 to +3) — **Independent Prospectors** (`Adhocracy`).
- **Sociological Rationale**: The speculative, high-reward nature of gold panning and quartz crushing attracts fiercely independent, opportunistic prospectors resistant to central authority.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Prospector Silas MacLeod"
  role: "Claim Owner"
  disposition: "[1, 2, -1]"
  motivation: "Strike the mother lode vein before his creditors seize his stamp mill."
- name: "Rocker Tender Elspeth"
  role: "Sluice Hand"
  disposition: "[0, 1, 0]"
  motivation: "Secure a legitimate share of cleanup gold to fund her journey away from the camps."

### Material Stocks & Items (Item Prototypes)
- **Wooden Long Tom** (`Tool`): Extended wooden sluice box used for washing large volumes of auriferous gravel.
- **Iron Stamp Head** (`Tool`): Heavy cast-iron shoe dropped by cams to pulverize hard gold quartz ore.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Quartz Ore Richness` (`0–10`)**: At `0–3`, barren rock yields negligible dust, bankrupting the mill. At `8–10`, rich pocket strikes yield heavy flakes and nuggets.
- **Quest Hook — *The Jumped Claim***: A rival prospector syndicate fences off Silas's main water ditch, threatening armed violence over water rights right before the seasonal cleanup.
