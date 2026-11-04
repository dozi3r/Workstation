---
id: "EXT-CLAY-01"
title: "Riverbank Clay Pit"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CLAY"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Mineral: Raw-Clay"
requires: []
---
# Riverbank Clay Pit (`EXT-CLAY-01`)
> **Industry Chain**: `CHAIN-CLAY` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
A terraced alluvial excavation site along a meandering river floodplain features spade-dug pits, silt-settling pools, and wooden cart loading ramps. Laborers excavate dense, cohesive alluvial clay strata, washing away pebble impurities and piling the plastic sediment for weathering. This direct earth-extraction process harvests raw, unrefined mineral clay for downstream ceramic and masonry production.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -1, 0]` (pick integers -3 to +3) — **Clan** (`Clan`).
- **Sociological Rationale**: Labor-intensive seasonal earth-digging fosters a rugged, communal work culture bound to seasonal flood cycles and shared physical endurance.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Pitmaster Garret Clayborn"
  role: "Senior Excavation Boss"
  disposition: "[-1, -1, 0]"
  motivation: "Keep pit walls shored against collapse while maintaining a steady output of pure alluvial clay."
- name: "Digger Lyra Fenn"
  role: "Silt Sifter and Cart Loader"
  disposition: "[0, 0, -1]"
  motivation: "Clear stones and organic debris from raw clay loads without back strain."

### Material Stocks & Items (Item Prototypes)
- **Wooden Mattocks** (`Tool`): Weighted digging tools used to break up compacted alluvial clay beds.
- **Silt-Settling Sluices** (`Tool`): Water channels used to wash gravel and sand out of excavated clay.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Pit Drainage & Seep` (`0–10`)**: At `0–3`, groundwater floods the pit, turning excavations into impassable mud bogs. At `8–10`, dry pit walls fracture and trigger sudden cave-ins.
- **Quest Hook — *The Mud Slide* ***: Heavy rains cause a clay wall collapse in Garret's pit, trapping a cart and burying the drainage trench. Garret and Lyra must rally workers to dig out the sluice before the entire pit fills with stagnant floodwater.
