---
id: "MINE-COPPER-01"
title: "Malachite Drift Mine"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-COPPER"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Ore: Copper-Ore"
requires:
  - "Timber: Mine-Props"
  - "Fuel: Charcoal-or-Coal"
---
# Malachite Drift Mine (`MINE-COPPER-01`)
> **Industry Chain**: `CHAIN-COPPER` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Miners tunnel into colorful oxidized copper-bearing limestone strata along arid hillsides, shoring up unstable roofs with notched timber props and hauling green malachite ore up inclined shafts in rawhide skips. Pickaxes, wedges, and slow-burning charcoal fires are employed to fracture stubborn rock faces before sorting rich green veins from barren gangue.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -1, +1]` — **Resistant Survivalist** (`Clan`).
- **Sociological Rationale**: Subterranean danger, cramped darkness, and shared physical toil forge tight bonds of mutual reliance and deep distrust of surface administrators.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Underground Boss Kaelen Varr"
  role: "Shift Boss"
  disposition: "[-1, -1, +1]"
  motivation: "Extract high-grade malachite without triggering roof cave-ins."
- name: "Timber Man Joram Slate"
  role: "Prop Carpenter"
  disposition: "[0, -1, 0]"
  motivation: "Ensure every drift tunnel is securely shored against shifting earth."

### Material Stocks & Items (Item Prototypes)
- **Copper Ore** (`Commodity`): Raw malachite and azurite lumps rich in copper carbonate.
- **Notched Mine Prop** (`Tool`): Seasoned hardwood timber cut to wedge tightly against tunnel roofs.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Tunnel Shoring` (`0–10`)**: At `0–3`, shifting strata cause catastrophic drift collapses. At `8–10`, over-timbering exhausts available forest props and slows extraction.
- **Quest Hook — *The Seeping Sump***: When a subterranean water pocket breaches the lower drift, Kaelen must organize bucket chains before the entire lower level floods.
