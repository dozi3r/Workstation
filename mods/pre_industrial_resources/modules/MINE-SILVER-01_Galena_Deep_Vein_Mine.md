---
id: "MINE-SILVER-01"
title: "Galena Deep-Vein Mine"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SILVER"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Ore: Argentiferous-Galena"
requires:
  - "Timber: Mine-Props"
  - "Light: Tallow-Candles"
  - "Livestock: Draft-Animals"
---
# Galena Deep-Vein Mine (`MINE-SILVER-01`)
> **Industry Chain**: `CHAIN-SILVER` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Carved deep into limestone fault lines, the galena mine descends through dripping vertical shafts and timber-shored adits. Miners hack at sulfide veins bearing lead and silver with heavy picks and wedges, guided only by flickering tallow candles. The required inputs of Timber: Mine-Props prevent catastrophic gallery collapses, while Light: Tallow-Candles sustains subterranean labor, turning dark rock faces into extracted Ore: Argentiferous-Galena hauled up by horse-gins worked by Livestock: Draft-Animals.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-2, -1, 1]` (pick integers -3 to +3) — **Subterranean Syndicate** (`Clan`).
- **Sociological Rationale**: Constant peril in pitch-black tunnels binds miners into tight, insular brotherhoods suspicious of surface managers and royal auditors.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Underground Captain Barnaby Crouch"
  role: "Shift Boss"
  disposition: "[-1, -1, 2]"
  motivation: "Maximize daily ore skip quotas without triggering a fatal roof cave-in."
- name: "Powder Monkey and Splicer Pip"
  role: "Tallow Runner"
  disposition: "[-2, 1, -1]"
  motivation: "Smuggle high-grade silver nuggets out in candle tins to pay off gambling debts."

### Material Stocks & Items (Item Prototypes)
- **Tallow Dip Candle** (`Commodity`): Rendered animal fat candle providing essential illumination in firedamp-prone tunnels.
- **Oak Pit Prop** (`Tool`): Hand-hewn timber pillar wedged to support unstable overhead limestone strata.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Strata Stability` (`0–10`)**: At `0–3`, ceiling collapses trap shifts and flood lower levels. At `8–10`, stable rock permits steady, high-volume ore extraction.
- **Quest Hook — *The Flooded Sump***: A pickaxe strike punctures an ancient subterranean aquifer, rapidly flooding the lower galleries and trapping Captain Crouch and his crew behind rising waters.
