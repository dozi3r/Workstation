---
id: "IND-CORN-02"
title: "Nixtamalization Vats & Stone Metate Mill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CORN"
chain_stage: 2
chain_role: "refining"
provides:
  - "Food: Masa-Flour"
  - "Food: Cornmeal-Rations"
requires:
  - "Crop: Raw-Maize"
  - "Chem: Slaked-Lime"
---

## 1. Architectural Overview & Operational Loop
Equipped with large boiling vats and carved stone metate grinding stones, this processing station cooks dried maize kernels in an alkaline solution of slaked lime. This ancient chemical transformation softens the outer pericarp, releases bound niacin, and unlocks nutritional value before stone-grinding the softened maize into pliable masa dough and coarse meal.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 0]` — **Operational Artisan** (`Market`).
- **Sociological Rationale**: Precise soaking times and grinding rhythm determine the quality of staple food supplies for the entire settlement.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Miller Xochitl Green-Corn"
  role: "Chief Nixtamal Master"
  disposition: "[0, 1, 0]"
  motivation: "Maintain exact lime-to-water ratios for optimal dough consistency."
- name: "Grinder Tepoz Tochtli"
  role: "Metate Operator"
  disposition: "[-1, 0, 1]"
  motivation: " Grind daily quotas of masa without straining wrist and shoulder joints."

### Material Stocks & Items (Item Prototypes)
- **Masa-Flour** (`Commodity`): Freshly ground, alkaline-treated corn dough ready for flatbread baking.
- **Stone-Metate** (`Tool`): Carved volcanic basalt grinding slab and mano used for manual grain milling.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Alkaline Concentration (`0–10`)**: At `0–3`, under-cooked corn remains tough and nutritionally locked. At `8–10`, excessive lime dissolves the grain into a bitter, unusable mush.
- **Quest Hook — *The Contaminated Spring*---**: The water source used for boiling turns brackish with sediment, threatening to ruin the entire daily nixtamal batch.
