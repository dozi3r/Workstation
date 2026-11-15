---
id: "FARM-VINE-01"
title: "Hillside Vineyard"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-VINE"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Wine-Grapes"
requires:
  - "Chem: Brimstone-Sulfur"
---
# Hillside Vineyard (`FARM-VINE-01`)
> **Industry Chain**: `CHAIN-VINE` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Sun-drenched, rocky slopes planted with low-trained Vitis vinifera vines absorb thermal radiation from exposed stone ground. Laborers tend the vines through spring pruning, canopy management, and autumn vintage picking, utilizing wicker baskets for gentle transport. The vineyard transforms rocky soil, intense solar exposure, and meticulous manual pruning into sweet, high-sugar wine grapes.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 0, 1]` — **Traditionalist Steward** (`Clan`).
- **Sociological Rationale**: Cultivation relies on generational lore, seasonal timing, and tight-knit community harvest teams working in unison.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Vineyard Keeper Myra Sideris"
  role: "Master Viticulturist"
  disposition: "[1, 0, 1]"
  motivation: "Protect the ancient vine stock from mildew and unseasonal frosts."
- name: "Vintner Apprentice Damon Rael"
  role: "Grape Harvester"
  disposition: "[-1, 1, 0]"
  motivation: "Introduce experimental trellising methods to increase sugar concentrations."

### Material Stocks & Items (Item Prototypes)
- **Crop: Wine-Grapes** (`Commodity`): Heavy clusters of sweet, sun-ripened fruit rich in natural yeasts.
- **Harvesting Knife** (`Tool`): A short, hooked iron blade designed for clean stem cutting without bruising fruit.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Vine Canopy Density` (`0–10`)**: At `0–3`, over-pruning exposes delicate fruit to scorching sunburn. At `8–10`, dense leaves trap humidity and invite devastating fungal rot.
- **Quest Hook — *The Powdery Mildew***: A sudden coastal humidity spike threatens the prize vines of Myra Sideris, forcing Damon Rael to race against time to apply sulfur dust before the entire crop is blighted.
