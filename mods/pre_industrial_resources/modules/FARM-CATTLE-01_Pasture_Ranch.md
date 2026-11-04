---
id: "FARM-CATTLE-01"
title: "Pasture Ranch"
set: "Set_A_Infrastructure_and_Engineering"
category: "Pastoral_and_Animal_Products"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CATTLE"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Livestock: Cattle"
  - "Livestock: Draft-Animals"
requires: []
---
# Pasture Ranch (`FARM-CATTLE-01`)
> **Industry Chain**: `CHAIN-CATTLE` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Open rolling grasslands enclosed by post-and-rail fencing and supplemented by winter fodder barns form the foundation of pastoral cattle production. Herders manage rotational grazing patterns across meadows to prevent over-exhaustion of turf while monitoring herd health and breeding cycles. This agrarian cycle extracts living biological units—beef cattle and powerful draft oxen—from natural forage.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -1, 1]` (pick integers -3 to +3) — **Clan** (`Clan`).
- **Sociological Rationale**: Bound to weather cycles and livestock stewardship, ranch hands share an instinctive interdependence and customary stewardship over ancestral grazing territory.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Head Herder Silas Brooks"
  role: "Chief Stockman and Breeding Overseer"
  disposition: "[-1, -1, 1]"
  motivation: "Protect the prize breeding stock from predators and harsh winter blizzards."
- name: "Wrangler Sally Cooper"
  role: "Junior Herd Hand and Fence Rider"
  disposition: "[0, 0, 1]"
  motivation: "Keep stray yearlings from wandering into neighboring timber tracts."

### Material Stocks & Items (Item Prototypes)
- **Salt Licks** (`Commodity`): Mineral blocks placed in pastures to encourage herd weight gain and electrolyte balance.
- **Stock Whip** (`Tool`): Braided leather whip used for directional acoustic cueing of grazing cattle herds.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Pasture Carrying Capacity` (`0–10`)**: At `0–3`, overgrazing turns pastures to mud, starving the stock. At `8–10`, understocking allows brush encroachment and parasite infestation.
- **Quest Hook — *The Broken Fence Line* ***: Sally discovers a downed section of boundary fence allowing prime breeding bulls to intermingle with wild scrub cattle. Silas must coordinate an immediate roundup before disease or genetic dilution ruins the herd.
