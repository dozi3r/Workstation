---
id: "FARM-SPICE-01"
title: "Shade-Grown Spice & Tea Gardens"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SPICE"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Raw-Spices-and-Tea"
requires: []
---

## 1. Architectural Overview & Operational Loop
Laid out beneath a protective forest canopy of taller timber trees, these terraced hillside plantations cultivate delicate tea bushes and spice vines in rich, humid soil. Agricultural laborers hand-pick tender leaves and aromatic pods at precise dawn hours, preserving essential volatile oils before the tropical sun burns off the dew. The harvested biomass is sorted and bundled for immediate transport to curing sheds.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -1, 2]` — **Traditional Agrarian** (`Clan`).
- **Sociological Rationale**: Multi-generational farming families rely on customary planting cycles, mutual aid, and deep ecological intuition.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Matriarch Tressa Lin"
  role: "Garden Overseer"
  disposition: "[-1, -1, 2]"
  motivation: "Preserve ancestral cultivation techniques against encroaching commercial syndicates."
- name: "Pruner Jaro Krell"
  role: "Master Harvester"
  disposition: "[0, -1, 1]"
  motivation: "Secure better seasonal grain rations for the harvesting crew."

### Material Stocks & Items (Item Prototypes)
- **Raw-Spices-and-Tea** (`Commodity`): Unprocessed aromatic leaves and seed pods straight from the plantation.
- **Woven-Bamboo-Baskets** (`Tool`): Lightweight containers designed to prevent bruising during delicate harvests.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Canopy Density (`0–10`)**: At `0–3`, scorching sun wilts tender leaves and ruins flavor profiles. At `8–10`, excessive shade breeds fungal blights and rots root systems.
- **Quest Hook — *The Fungal Blight*---**: A mysterious white mold begins spreading across the lower tea terraces, threatening the harvest before Tressa can implement quarantine measures.
