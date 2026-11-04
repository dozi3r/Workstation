---
id: "IND-VINE-02"
title: "Wine Press & Fermenting Cellar"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-VINE"
chain_stage: 2
chain_role: "refining"
provides:
  - "Food: Vintage-Wine"
  - "Chem: Wine-Vinegar"
requires:
  - "Crop: Wine-Grapes"
  - "Timber: Cooperage-Casks"
---
# Wine Press & Fermenting Cellar (`IND-VINE-02`)
> **Industry Chain**: `CHAIN-VINE` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
Subterranean stone-vaulted cellars maintain cool, stable temperatures ideal for fermentation. Laborers tread grapes in stone vats before drawing the must into wooden casks where natural yeasts convert sugars into alcohol, with over-oxygenated batches turning naturally to sharp vinegar. The facility transforms raw wine grapes and cooperage casks into aged vintage wine and acidic preservative vinegar.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 1]` — **Cellar Master** (`Hierarchy`).
- **Sociological Rationale**: Precision in fermentation timing and strict environmental hygiene govern the transformation of volatile organic must into stable vintage stock.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Cellar Master Lucian Vance"
  role: "Head Sommelier"
  disposition: "[0, 1, 1]"
  motivation: "Monitor cask bung-holes daily to prevent acetification of premier vintages."
- name: "Cooper and Drawer Silas Cole"
  role: "Cask Inspector"
  disposition: "[1, 0, 1]"
  motivation: "Ensure every oak stave is tightly bound to eliminate leakage during aging."

### Material Stocks & Items (Item Prototypes)
- **Food: Vintage-Wine** (`Commodity`): Fermented grape juice aged to complex aromatic perfection.
- **Chem: Wine-Vinegar** (`Commodity`): Sharp, acetic acid solution used for food preservation and cleaning.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Cellar Temperature` (`0–10`)**: At `0–3`, freezing winter drafts halt fermentation prematurely, leaving sickly sweet must. At `8–10`, summer heat spikes accelerate bacterial growth, turning entire reserves into sour vinegar.
- **Quest Hook — *The Spiked Cask***: A rogue heat wave threatens the main aging stock of Lucian Vance, prompting Silas Cole to haul cold spring water through the cellars to cool the barrels before the prized vintage spoils entirely.
