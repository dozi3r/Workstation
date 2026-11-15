---
id: "EXT-PINE-01"
title: "Boreal Conifer Logging & Turpentine Camp"
set: "Set_A_Infrastructure_and_Engineering"
category: "Forestry_and_Timber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-PINE"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Timber: Mast-Spars"
  - "Resin: Raw-Pine-Resin"
requires: []
---
# Boreal Conifer Logging & Turpentine Camp (`EXT-PINE-01`)
> **Industry Chain**: `CHAIN-PINE` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Spread across dense, cold-climate evergreen forests, logging crews fell straight-grained old-growth pines for structural spars while simultaneously scarring living trunks with V-shaped 'cat faces' to bleed amber resin into hanging terracotta cups. Raw oleoresin and trimmed timber are hauled by sled to frozen riverbanks for spring thaw transport.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, -2, 1]` — **Isolationist** (`Clan`).
- **Sociological Rationale**: Remote northern outposts foster fierce self-reliance, tight-knit crew loyalty, and deep attunement to harsh seasonal weather patterns.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Timber Boss Torstein Lind"
  role: "Camp Superintendent"
  disposition: "[0, -2, 1]"
  motivation: "Fell quota timber and secure resin taps before the early winter blizzards lock the roads."
- name: "Resin Tapper Elenora Frost"
  role: "Box Cutter"
  disposition: "[-1, -1, 2]"
  motivation: "Map the highest-yield resin sectors and protect her crew from freezing exposure."

### Material Stocks & Items (Item Prototypes)
- **Raw Pine Resin** (`Commodity`): Viscous, aromatic amber sap harvested from scarred conifer trunks.
- **Broad Axe** (`Tool`): Heavy felling and squaring axe balanced for precision notching in sub-zero weather.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Bark Scarring Depth` (`0–10`)**: At `0–3`, shallow cuts yield meager resin flow. At `8–10`, deep slashing girdles and kills the pine trees prematurely.
- **Quest Hook — *The Frozen Haul***: When an early thaw threatens to strand the winter log decks before river floating, Torstein must mobilize every hand to raft the timber overnight.
