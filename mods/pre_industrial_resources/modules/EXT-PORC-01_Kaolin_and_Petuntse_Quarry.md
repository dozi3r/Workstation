---
id: "EXT-PORC-01"
title: "Kaolin & Petuntse Quarry"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-PORCELAIN"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Mineral: Kaolin-Clay"
requires: []
---
# Kaolin & Petuntse Quarry (`EXT-PORC-01`)

## 1. Architectural Overview & Operational Loop
Carved into weathered white hillsides, this extraction site features open-cast benches, pick-axes, and water-powered crushing mills. Miners unearth pristine kaolin clay and weathered petuntse (porcelain stone), which are pulverized, washed in settling pools, and filtered into dense, refined ceramic raw materials.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, 0, 1]` — **Resource Extraction Guild** (`Clan`).
- **Sociological Rationale**: Heavy manual labor in dusty, mineral-rich environments fosters tight-knit quarry brotherhoods and endurance lore.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Quarry-Boss Davos Vane"
  role: "Chief Excavator"
  disposition: "[-1, 0, 1]"
  motivation: "Locate the purest white clay veins free of iron staining."
- name: "Wash-Hand Jora Quinn"
  role: "Sediment Assayer"
  disposition: "[0, 1, 0]"
  motivation: "Ensure settling troughs separate gritty impurities from fine kaolin."

### Material Stocks & Items (Item Prototypes)
- **Kaolin-Clay** (`Commodity`): Pure white, refractory clay essential for high-fire porcelain bodies.
- **Crushing-Sledge** (`Tool`): Heavy iron-headed hammer used to break raw stone blocks before wet milling.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Sediment Purity (`0–10`)**: At `0–3`, iron contamination causes dark speckling and failure in high-fire kilns. At `8–10`, excessive washing wastes valuable fine fractions.
- **Quest Hook — *The Iron Vein Collapse*---**: Excavation hits an unexpected seam of iron pyrite, threatening to discolor an entire month's kaolin quota unless a new vein is opened.
