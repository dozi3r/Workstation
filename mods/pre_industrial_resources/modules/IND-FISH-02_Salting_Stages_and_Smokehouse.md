---
id: "IND-FISH-02"
title: "Salting Stages & Smokehouse"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-FISH"
chain_stage: 2
chain_role: "refining"
provides:
  - "Food: Salted-Fish"
requires:
  - "Food: Fresh-Catch"
  - "Commodity: Coarse-Salt"
  - "Timber: Cooperage-Casks"
  - "Fuel: Wood-Fuel"
---

# Salting Stages & Smokehouse (`IND-FISH-02`)
> **Industry Chain**: `CHAIN-FISH` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
The salting stages and smokehouse transform perishable fresh-catch into shelf-stable provisions for long sea voyages. Laborers gut, wash, and heavily pack fish layers with coarse-salt inside cooperage casks, or hang them in vaulted smokehouses fueled by slow-burning hardwood. This multi-step dehydration and curing process prevents spoilage.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, 1, 1]` (pick integers -3 to +3) — **Regulated Guild** (`Hierarchy`).
- **Sociological Rationale**: Preservation standards must meet strict export guidelines to prevent botulism and naval supply rejections, enforcing rigorous sanitary protocols.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Salter Gideon Finch"
  role: "Chief Curing Inspector"
  disposition: "[-1, 1, 1]"
  motivation: "Ensure every salt-cask meets Admiralty standards for long-distance oceanic provisioning."
- name: "Smokehouse Tender Martha Brooks"
  role: "Curing Artisan"
  disposition: "[1, 0, 0]"
  motivation: "Manage hardwood smolder times perfectly to achieve optimal flavor and shelf life."

### Material Stocks & Items (Item Prototypes)
- **Salted-Fish** (`Food`): Cured, barreled protein preserved for winter storage and maritime trade fleets.
- **Cooperage Cask** (`Tool`): Watertight oak barrel specifically hooped for packing salted fish provisions.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Curing Salinity` (`0–10`)**: At `0–3`, under-salted batches rot rapidly in storage, causing massive economic loss. At `8–10`, over-salting ruins the texture and renders the fish unpalatable.
- **Quest Hook — *The Sppoiled Batch***: Gideon Finch discovers mold infiltrating an entire row of storage casks, threatening the annual contract with the merchant navy.
