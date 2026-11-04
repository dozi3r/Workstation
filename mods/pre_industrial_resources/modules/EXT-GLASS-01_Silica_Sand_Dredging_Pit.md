---
id: "EXT-GLASS-01"
title: "Silica Sand Dredging Pit"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-GLASS"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Mineral: Silica-Sand"
requires: []
---
</Agent System Instructions>
<Silica Sand Dredging Pit (`EXT-GLASS-01`)>
> **Industry Chain**: `CHAIN-GLASS` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Open riverbanks and ancient lacustrine deposits are excavated by teams wielding iron-shod shovels and wooden screening frames. Coarse river gravel and heavy impurities are sluiced away in shallow wooden channels, leaving behind ultra-pure quartz sand washed clean of iron stains, ready for high-grade glassmaking.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, -1, 0]` — **Pragmatic Operative** (`Hierarchy`).
- **Sociological Rationale**: Dredging is grueling, repetitive manual labor governed by strict tidal or seasonal water schedules, fostering a stoic and obedient workforce.

## 3. StationedEntities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Pit Boss Garret Miller"
  role: "Dredge Overseer"
  disposition: "[0, -1, 0]"
  motivation: "Keep silt-free extraction quotas high despite rising groundwater."
- name: "Sluice Hand Tessa Bell"
  role: "Sand Washer"
  disposition: "[-1, 0, 0]"
  motivation: "Ensure no dark iron flecks remain in the settling bins."

### Material Stocks & Items (Item Prototypes)
- **Washed Silica Sand** (`Commodity`): High-purity quartz grains free of iron contamination.
- **Sluice Screen** (`Tool`): Woven copper-wire mesh frame used for filtering out pebbles and organic debris.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Wash Purity` (`0–10`)**: At `0–3`, sand contains iron impurities that discolor glass green or brown. At `8–10`, excessive washing washes away ultra-fine usable grains.
- **Quest Hook — *The Iron Vein***: Tessa discovers that upstream agricultural runoff has stained the latest sand deposit with rust, threatening the upcoming batch of royal crystal lenses.
