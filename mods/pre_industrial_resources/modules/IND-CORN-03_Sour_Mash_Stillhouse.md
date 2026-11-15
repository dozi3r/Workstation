---
id: "IND-CORN-03"
title: "Sour-Mash Stillhouse"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CORN"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Food: Corn-Whiskey"
requires:
  - "Food: Cornmeal-Rations"
  - "Timber: Cooperage-Casks"
  - "Fuel: Wood-Fuel"
  - "Metal: Forged-Copper"
  - "Water: Baseline-Potable-Flow"
---
# Sour-Mash Stillhouse (`IND-CORN-03`)
> **Industry Chain**: `CHAIN-CORN` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A timber-and-stone distillery equipped with copper pot stills, wooden fermenting mash tubs, and cooling worm coils fed by cold spring water. Fermented corn mash is boiled and distilled into potent corn whiskey, then aged in charred oak cooperage casks to mellow the spirit for trade and morale distribution.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 2, 1]` — **Entrepreneur** (`Market`).
- **Sociological Rationale**: High-margin liquor production driven by market demand, excise negotiations, and competitive batch potency creates a lively, mercantile social atmosphere.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Distiller Silas Vance"
  role: "Stillhouse Proprietor"
  disposition: "[0, 2, 1]"
  motivation: "Maximize high-proof spirit yields and evade municipal alcohol tax inspectors."
- name: "Mash Hand Jory Fenn"
  role: "Fermentation Tender"
  disposition: "[-1, 1, 0]"
  motivation: "Secure a steady supply of sweet cornmeal and dry firewood for the copper pots."

### Material Stocks & Items (Item Prototypes)
- **Corn Whiskey** (`Food`): High-proof distilled spirit aged in charred oak casks for morale and trade.
- **Copper Pot Still** (`Tool`): Large alembic boiler and condenser worm used to vaporize and distill fermented mash.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Still Condenser Flow` (`0–10`)**: At `0–3`, cooling water fails, causing vapor blowouts and bitter low-grade spirit. At `8–10`, over-cooling stalls distillation and wastes fuel.
- **Quest Hook — *The Taxman's Knock***: When municipal revenue agents arrive unannounced during a heavy distillation run, Silas must scramble to conceal his hidden spirit casks before inspection.
