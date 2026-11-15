---
id: "IND-FURS-02"
title: "Pelt Scraping & Furrier's Guild"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-FURS"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Luxury: Dressed-Furs"
requires:
  - "Animal: Raw-Pelts"
  - "Chem: Tannin"
  - "Metal: Forged-Iron"
---
# Pelt Scraping & Furrier's Guild (`IND-FURS-02`)
> **Industry Chain**: `CHAIN-FURS` (Stage 2: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A drafty, odor-heavy municipal workshop where raw, salted pelts are soaked in vats of astringent tree bark tannin, scraped clean of subcutaneous fat with curved draw-knives, and tumbled with chalk to soften the leather backing into supple, lustrous luxury garments ready for high-society tailoring.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, 0]` — **Administrator** (`Hierarchy`).
- **Sociological Rationale**: Guild-regulated grading, exacting chemical soaking times, and precise knife work enforce strict quality controls and artisanal hierarchy.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Guild Master Alistair Grey"
  role: "Chief Furrier"
  disposition: "[1, 1, 0]"
  motivation: "Maintain strict guild monopoly pricing and flawless pelt grading standards."
- name: "Scraper Journeyman Nials"
  role: "Fleshing Specialist"
  disposition: "[-1, 0, 1]"
  motivation: "Perfect his scraping technique to earn master status and guild voting rights."

### Material Stocks & Items (Item Prototypes)
- **Dressed Fur** (`Luxury`): Supple, cleaned, and conditioned animal pelt suitable for aristocratic garments.
- **Curved Fleshing Knife** (`Tool`): Double-handled steel blade used to scrape fat and membrane from raw pelts.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Tanning Bath Concentration` (`0–10`)**: At `0–3`, weak liquor leaves pelts stiff and prone to rotting hair slip. At `8–10`, overly strong acid eats the leather grain and ruins the batch.
- **Quest Hook — *The Spoiled Lot*스러**: When a prized shipment of ermine pelts arrives water-damaged, Alistair must rush emergency tannin baths to save the guild's royal commission.
