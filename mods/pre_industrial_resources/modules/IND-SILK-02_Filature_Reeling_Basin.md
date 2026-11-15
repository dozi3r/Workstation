---
id: "IND-SILK-02"
title: "Filature Reeling Basin"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SILK"
chain_stage: 2
chain_role: "refining"
provides:
  - "Textile: Reeled-Silk-Thread"
requires:
  - "Animal: Silk-Cocoons"
  - "Fuel: Wood-Fuel"
  - "Metal: Forged-Copper"
---

# Filature Reeling Basin (`IND-SILK-02`)
> **Industry Chain**: `CHAIN-SILK` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
The filature reeling basin is a steaming workshop equipped with rows of copper water cauldrons heated by wood-fired brick stoves. Workers plunge harvested silk cocoons into boiling water to dissolve the sericin gum, gently brushing the basins to locate filament ends before combining and reeling multiple strands onto wooden spools. Silk-cocoon and wood-fuel inputs are transformed into strong, continuous reeled-silk-thread.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 0, 1]` (pick integers -3 to +3) — **Craft Guild** (`Hierarchy`).
- **Sociological Rationale**: Reeling requires immense dexterity and disciplined rhythm, maintained through strict guild supervision and generational apprenticeship traditions.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Reeler Xiulan"
  role: "Head Basin Inspector"
  disposition: "[1, 0, 2]"
  motivation: "Ensure consistent denier thickness across every reeled silk skein by monitoring water temperature."
- name: "Stoker Baator"
  role: "Cauldron Fire Tender"
  disposition: "[1, -1, 0]"
  motivation: "Maintain steady wood-fuel combustion to keep reeling basins at a constant simmering boil."

### Material Stocks & Items (Item Prototypes)
- **Reeled-Silk-Thread** (`Commodity`): Continuous, lustrous filament reeled from multiple cocoons into strong raw yarn.
- **Copper Reeling Basin** (`Tool`): Shallow, heated metal pan designed for softening and unwinding cocoon gum.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Water Temperature Variance` (`0–10`)**: At `0–3`, water simmers perfectly, allowing smooth filament unwinding. At `8–10`, boiling surges dissolve cocoons too fast, snapping threads constantly.
- **Quest Hook — *The Boiling Surge***: Stoker Baator overheats the primary cauldron, threatening to snap the delicate silk filaments currently being reeled by Master Reeler Xiulan.
