---
id: "IND-CHARCOAL-01"
title: "Charcoal Burner's Mound"
set: "Set_A_Infrastructure_and_Engineering"
category: "Fuel_and_Energy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CHARCOAL"
chain_stage: 1
chain_role: "refining"
provides:
  - "Fuel: Charcoal-or-Coal"
  - "Chem: Potash"
requires:
  - "Fuel: Wood-Fuel"
---
# Charcoal Burner's Mound (`IND-CHARCOAL-01`)
> **Industry Chain**: `CHAIN-CHARCOAL` (Stage 1: `refining`)

## 1. Architectural Overview & Operational Loop
A series of conical earth-covered timber stacks smolder deep in forest clearings, managed by experienced colliers who carefully regulate oxygen flow to pyrolyze cordwood into high-grade charcoal. Workers stack split logs vertically around a central chimney stake, seal the mound with turf and loam, and ignite the core. This controlled, oxygen-starved thermal conversion transforms raw wood fuel into dense, high-temperature charcoal and byproduct potash.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -2, 1]` (pick integers -3 to +3) — **Clan** (`Clan`).
- **Sociological Rationale**: Isolated forest camps and generational kiln-tending traditions create tight-knit, insular family units operating with tacit, smoke-hardened mutual trust.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Collier Brenna Ashworth"
  role: "Head Mound Burner"
  disposition: "[-1, -2, 1]"
  motivation: "Keep the smoldering earth mounds sealed against sudden drafts that could turn the entire pile to ash."
- name: "Apprentice Collier Jory Blackwood"
  role: "Wood Stacker and Vent Tender"
  disposition: "[0, -1, 0]"
  motivation: "Learn the subtle art of reading smoke color and temperature changes without scorching his eyebrows."

### Material Stocks & Items (Item Prototypes)
- **Sod and Loam Sealant** (`Commodity`): Damp earth mixture used to patch fissures in active carbonization mounds.
- **Quenching Rakes** (`Tool`): Long-handled iron tools used to spread and extinguish glowing charcoal fragments.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Mound Oxygenation` (`0–10`)**: At `0–3`, smothered fires produce uncarbonized white wood. At `8–10`, blowouts rupture the earth seal, incinerating the entire batch.
- **Quest Hook — *The Midnight Blowout* ***: A sudden gale force wind tears the loam seal off Brenna's largest charcoal mound at midnight. She must rouse Jory and nearby workers to patch the glowing breach before the wind completely consumes the winter fuel store.
