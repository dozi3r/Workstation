---
id: "EXT-SALT-01"
title: "Tidal Salt Evaporation Pans"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SALT"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Commodity: Brine-Slurry"
requires: []
---

# Tidal Salt Evaporation Pans (`EXT-SALT-01`)
> **Industry Chain**: `CHAIN-SALT` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Pre-industrial coastal evaporation pans harness solar radiation and tidal influx to concentrate seawater into dense brine-slurry. Laborers construct earthen dykes and shallow wooden lock-gates along salt marshes, managing sluices according to spring and neap cycles. Concentrated brine is channeled into crystallization basins where solar evaporation precipitates sodium chloride, which is harvested daily.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, 1, 0]` (pick integers -3 to +3) — **Bureaucratic Operator** (`Hierarchy`).
- **Sociological Rationale**: Tidal evaporation requires rigid scheduling, precise tidal calculations, and standardized basin maintenance, fostering a strict administrative hierarchy among salt-boilers.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Sluice-Master Jethro Vance"
  role: "Tidal Gatekeeper"
  disposition: "[-1, 1, 0]"
  motivation: "Maintain strict sluice timings to maximize brine concentration before autumn rains."
- name: "Pan-Raker Thomasin Cross"
  role: "Crystallization Laborer"
  disposition: "[0, -1, 1]"
  motivation: "Secure a higher daily wage before salt-crust burns ruin their footwear and hands."

### Material Stocks & Items (Item Prototypes)
- **Brine-Slurry** (`Commodity`): Highly saline seawater concentrate harvested from primary evaporation pans.
- **Wooden Sluice Gate** (`Tool`): Hand-operated cedar gate used to control tidal influx into evaporation terraces.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Solar Evaporation Efficiency` (`0–10`)**: At `0–3`, unseasonal cloud cover and persistent drizzle dilute the pans, halting crystallization. At `8–10`, intense heat waves accelerate output but risk salt-crust contamination from wind-blown silt.
- **Quest Hook — *The Breached Sluice***: Sluice-Master Jethro Vance needs urgent timber repairs after spring tides shatter the main bulkhead, threatening the entire seasonal salt harvest.
