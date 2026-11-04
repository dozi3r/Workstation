---
id: "EXT-TIMBER-01"
title: "Hardwood Logging Camp"
set: "Set_A_Infrastructure_and_Engineering"
category: "Forestry_and_Timber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-TIMBER"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Timber: Hardwood-Logs"
  - "Fuel: Wood-Fuel"
requires: []
---
# Hardwood Logging Camp (`EXT-TIMBER-01`)
> **Industry Chain**: `CHAIN-TIMBER` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Axemen and crosscut sawyers fell ancient oak and beech trees in deep temperate forests, trimming branches and bucking trunks into transportable lengths. Teams of oxen drag the massive hardwood logs along corduroy skid roads toward river loading banks or staging yards. This arduous extractive labor supplies both raw structural timber and essential firewood for the region.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+2, -2, -1]` — **Rebel** (`Adhocracy`).
- **Sociological Rationale**: Dangerous frontier conditions, physical isolation, and seasonal nomadism breed rugged, independent-minded loggers who despise bureaucracy and rely strictly on crew solidarity.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Boss Kaelen Oakenshield"
  role: "Logging Master"
  disposition: "[+2, -2, 0]"
  motivation: "Hit seasonal timber delivery targets without losing men to falling timber or spring floods."
- name: "Sawyer Rolf Braddock"
  role: "Felling Specialist"
  disposition: "[+1, -2, -1]"
  motivation: "Wield the crosscut saw with ruthless efficiency to earn top seasonal bounty."

### Material Stocks & Items (Item Prototypes)
- **Hardwood-Logs** (`Commodity`): Massive, unpeeled oak and beech logs stamped with the camp mark.
- **Felling Axe** (`Tool`): A balanced, razor-sharp broad axe fitted with a stout hickory handle.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Skid Road Glaze (`0–10`)**: At `0–3`, dry dirt roads stall hauling sleds completely. At `8–10`, frozen winter ice allows effortless log transport.
- **Quest Hook — *The Logjam Gorge***: When thousands of harvested logs jam a swollen river gorge after a flash thaw, Kaelen must lead a dangerous dynamite and cant-hook operation before the rising water washes away the entire winter cut.
