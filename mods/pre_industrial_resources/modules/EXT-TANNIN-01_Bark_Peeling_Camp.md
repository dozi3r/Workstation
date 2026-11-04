---
id: "EXT-TANNIN-01"
title: "Bark Peeling Camp"
set: "Set_A_Infrastructure_and_Engineering"
category: "Forestry_and_Timber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-TANNIN"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Commodity: Tree-Bark"
requires:
  - "Timber: Hardwood-Logs"
---
# Bark Peeling Camp (`EXT-TANNIN-01`)
> **Industry Chain**: `CHAIN-TANNIN` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
During the spring sap run when bark slips easily from hardwood trunks, laborers use spuds and barking irons to strip thick oak and hemlock bark sheets from freshly felled logs. The stripped bark is dried in open air drying racks and bundled tightly for transport to leather tanneries. This specialized extractive forestry harvest captures the essential tannins required for hide preservation.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, -2, 0]` — **Explorer** (`Adhocracy`).
- **Sociological Rationale**: Seasonal forest work requiring nomadic roaming through timber tracts fosters self-reliant, adaptable laborers who operate independently of urban oversight.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Tanner's Agent Silas Mallow"
  role: "Bark Harvest Boss"
  disposition: "[+1, -1, +1]"
  motivation: "Secure high-tannin oak bark grades without staining the material with rot or dirt."
- name: "Peeler Jory Vance"
  role: "Bark Stripper"
  disposition: "[0, -2, -1]"
  motivation: "Strip clean, wide sheets of bark rapidly during the short spring sap-running window."

### Material Stocks & Items (Item Prototypes)
- **Tree-Bark** (`Commodity`): Dried, curled sheets of tannin-rich oak bark bundled for shipment.
- **Barking Iron** (`Tool`): A curved metal spud tool used to pry bark away from fresh sapwood.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Sap Window (`0–10`)**: At `0–3`, bark adheres stubbornly to dry wood, halting peeling. At `8–10`, peak spring sap allows effortless, pristine stripping.
- **Quest Hook — *The Rains of Rot***: When an unseasonal damp spell threatens stacked drying bark with mold, Silas must mobilize every hand to move tons of tannin sheets under shelter before the active compounds leach away.
