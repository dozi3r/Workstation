---
id: "IND-WHALE-02"
title: "Tryworks Rendering Furnace"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-WHALE"
chain_stage: 2
chain_role: "refining"
provides:
  - "Light: Whale-Oil"
requires:
  - "Animal: Whale-Blubber"
  - "Fuel: Wood-Fuel"
  - "Timber: Cooperage-Casks"
---

> Tryworks Rendering Furnace (`IND-WHALE-02`)
> **Industry Chain**: `CHAIN-WHALE` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
The tryworks facility houses double copper rendering vats set into massive brick masonry furnaces. Raw whale-blubber is diced and boiled relentlessly using wood-fuel and crackling scraps (scraps) as secondary combustion fuel. The rendered whale-oil is skimmed, cooled, and funneled directly into cooperage casks for global export as lamp fuel and lubricant.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, -1]` (pick integers -3 to +3) — **Competitive Market Player** (`Market`).
- **Sociological Rationale**: Whale oil commands soaring commodity prices across industrializing nations, driving ruthless efficiency and hazardous continuous-burn operations.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Renderer Ezra Thorne"
  role: "Furnace Supervisor"
  disposition: "[1, 1, -1]"
  motivation: "Maximize oil clarity and yield per vat while avoiding catastrophic boiling-pot fires."
- name: "Cooper's Lad Seth Gower"
  role: "Cask Sealant Artisan"
  disposition: "[0, 0, 1]"
  motivation: "Ensure every wooden barrel is perfectly pitched so zero precious oil leaks during transit."

### Material Stocks & Items (Item Prototypes)
- **Whale-Oil** (`Light`): Clear, combustible amber oil prized for street lamps and heavy machinery lubrication.
- **Rendering Vat** (`Tool`): Heavy copper boiling cauldron mounted over brick fireboxes.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Rendering Yield & Purity` (`0–10`)**: At `0–3`, tainted blubber and wet fuel produce murky, foul-smelling oil that commands low market value. At `8–10`, overheating causes the vats to boil over, igniting catastrophic yard fires.
- **Quest Hook — *The Scorched Batch***: Ezra Thorne battles a runaway fire in the rendering sheds after a crackling-fed furnace overheats, threatening thousands of gallons of stored oil.
