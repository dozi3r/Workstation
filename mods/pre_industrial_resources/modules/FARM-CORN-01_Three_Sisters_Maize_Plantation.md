---
id: "FARM-CORN-01"
title: "Three-Sisters Maize Plantation"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CORN"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Crop: Raw-Maize"
requires: []
---

## 1. Architectural Overview & Operational Loop
Organized around symbiotic polyculture mounds, this agrarian plantation interplants maize stalks, climbing beans, and sprawling squash together. Maize provides natural trellis support for nitrogen-fixing beans, while prickly squash leaves shade the soil to retain moisture and deter pests, yielding abundant raw maize cobs at harvest.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -1, 1]` — **Communal Agriculturalist** (`Clan`).
- **Sociological Rationale**: Sustained by reciprocal land stewardship, seasonal planting ceremonies, and collective harvest sharing.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Elder Tall-Pine"
  role: "Master Agronomist"
  disposition: "[-1, -1, 1]"
  motivation: "Preserve sacred seed strains and maintain soil fertility across generations."
- name: "Sower Elan Red-Earth"
  role: "Field Custodian"
  disposition: "[0, -1, 1]"
  motivation: "Ensure balanced spacing between companion crops to maximize yields."

### Material Stocks & Items (Item Prototypes)
- **Raw-Maize** (`Commodity`): Unprocessed corn ears with husks intact, ready for culinary processing.
- **Digging-Stick** (`Tool`): Hardened wooden pole used for planting seed trios in mounded earth.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Companion Balance (`0–10`)**: At `0–3`, aggressive squash chokes out young maize stalks. At `8–10`, nitrogen depletion stunts overall crop vigor.
- **Quest Hook — *The Weevil Infestation*---**: A sudden outbreak of corn borers threatens the primary seed stock before Elder Tall-Pine can apply herbal deterrents.
