---
id: "IND-BREW-02"
title: "Copper Mash-Tun & Civic Brewery"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-BREW"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Food: Barrelled-Ale"
requires:
  - "Food: Malted-Grain"
  - "Metal: Forged-Copper"
  - "Timber: Cooperage-Casks"
  - "Fuel: Wood-Fuel"
  - "Crop: Hops"
---
# Copper Mash-Tun & Civic Brewery (`IND-BREW-02`)
> **Industry Chain**: `CHAIN-BREW` (Stage 2: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The civic brewery houses immense riveted copper mash-tuns where crushed malted grain is steeped in hot water, mashed, and boiled with dried hop cones. Coopered timber casks receive the cooled, fermented wort, sealing the beverage into stable rations of nutritional ale for urban laborers and civic guards.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 1]` — **Commercial Guildsman** (`Market`).
- **Sociological Rationale**: High-volume urban provisioning and standard barrel taxation turn the brew house into a lively mercantile nexus governed by supply contracts and civic pricing edicts.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Brewmaster Hannelore Thorne"
  role: "Guild Master Brewer"
  disposition: "[0, 1, 1]"
  motivation: "Secure monopoly supply contracts with city tavern syndicates and municipal garrisons."
- name: "Cooper Joran Brass"
  role: "Master Barrelmaker"
  disposition: "[1, 0, 1]"
  motivation: "Maintain airtight cask staves to prevent costly leakage during long transport runs."

### Material Stocks & Items (Item Prototypes)
- **Forged-Copper** (`Tool`): Heavy hammered metal vessels engineered for rapid heat transfer and sanitation.
- **Barrelled-Ale** (`Commodity`): Fermented hopped malt liquor packaged for municipal distribution.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Fermentation Ferocity (`0–10`)**: At `0–3`, sluggish yeast action leads to flat, sweet swill. At `8–10`, runaway wild yeast infection spoils entire cellars of aging ale.
- **Quest Hook — *The Sour Cask Conspiracy*---**: Mysterious contamination ruins the municipal winter ale reserve just as the annual harvest festival begins. Hannelore and Joran must trace the tainted stave wood before civic inspectors shut down the brewery lanes.
