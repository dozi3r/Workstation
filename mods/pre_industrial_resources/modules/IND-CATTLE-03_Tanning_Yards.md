---
id: "IND-CATTLE-03"
title: "Tanning Yards"
set: "Set_A_Infrastructure_and_Engineering"
category: "Pastoral_and_Animal_Products"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CATTLE"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Material: Cured-Leather"
requires:
  - "Animal: Raw-Hides"
  - "Chem: Tannin"
  - "Chem: Slaked-Lime"
---
# Tanning Yards (`IND-CATTLE-03`)
> **Industry Chain**: `CHAIN-CATTLE` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A sprawling complex of sunken wooden vats, open-air drying frames, and scraping sheds forms the municipal tanning yards downwind from residential districts. Workers soak raw hides in lime baths to strip hair, scrape away subcutaneous tissue, and steep the pelts in organic tannin infusions until the collagen crosslinks into durable leather. This chemical transformation turns putrid animal skins into pliable, water-resistant cured leather.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, 0, 1]` (pick integers -3 to +3) — **Clan** (`Clan`).
- **Sociological Rationale**: Stigmatized by foul chemical odors and physical isolation, tanners form a close-knit, self-reliant occupational caste with strict internal apprenticeship rituals.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Tanner Corin Hides"
  role: "Chief Vatsman and Liquor Master"
  disposition: "[-1, 0, 1]"
  motivation: "Perfect the tannin saturation gradient to prevent brittle or rotting leather batches."
- name: "Scraper Maren Vane"
  role: "Beam-Hand and De-hairing Specialist"
  disposition: "[0, -1, 1]"
  motivation: "Scrape hair and flesh from raw hides efficiently without nicking the pelt grain."

### Material Stocks & Items (Item Prototypes)
- **Currier's Fleshing Knife** (`Tool`): Curved, dual-handled steel blade used to scrape fat and muscle tissue from soaked hides.
- **Sun-Drying Racks** (`Tool`): Wooden frames where treated leather is stretched and oiled to retain suppleness.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Vat Liquor Strength` (`0–10`)**: At `0–3`, weak tannin liquor fails to penetrate hides, leaving them prone to rotting. At `8–10`, overly caustic baths burn and disintegrate valuable pelts.
- **Quest Hook — *The Rotted Vat Batch* ***: Corin discovers that a main soaking vat has lost its tannin potency due to a leaking seam, ruining half a season's hide delivery. He and Maren must rush emergency bark extract to salvage the remaining pelts before guild inspectors arrive.
