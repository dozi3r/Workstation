---
id: "MINE-TIN-01"
title: "Alluvial Cassiterite Streamworks"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-TIN"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Ore: Tin-Ore"
requires:
  - "Timber: Mine-Props"
---
# Alluvial Cassiterite Streamworks (`MINE-TIN-01`)
> **Industry Chain**: `CHAIN-TIN` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The streamworks harness diverted upland headwaters to wash tin-bearing detritus across tiered wooden leats and rough fern-matted riffles. Manual labor using shovels and diverting gates feeds heavy alluvial gravels into the current, washing away sterile muds while dense black tin oxide (cassiterite) settles behind the wooden stops. The requires input of Timber: Mine-Props constructs the diversion flumes and sluice boxes, transforming raw streambed sediment into concentrated Ore: Tin-Ore.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, -1, 2]` (pick integers -3 to +3) — **Bureaucratic Guild** (`Hierarchy`).
- **Sociological Rationale**: The repetitive, physically grueling labor governed by strict water rights and tenement leases breeds a rigid, rule-bound adherence to guild oversight and supervisory control.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Stannary Bailiff Thomas Trevithick"
  role: "Streamworks Inspector"
  disposition: "[2, -1, 3]"
  motivation: "Ensure all extracted tin is accurately weighed and taxed before private removal."
- name: "Gravel Washer Margery Penrose"
  role: "Sluice Tender"
  disposition: "[0, -2, 1]"
  motivation: "Supplement meager piece-wages by secretly pocketing high-grade pebble cassiterite."

### Material Stocks & Items (Item Prototypes)
- **Cassiterite Gravel** (`Commodity`): Heavy, water-worn pebbles of tin dioxide dredged directly from the riverbed.
- **Wooden Staking Riffle** (`Tool`): Grooved oak boards placed in the sluice run to catch dense heavy metals.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Water Head Pressure` (`0–10`)**: At `0–3`, drought chokes the sluices and halts production. At `8–10`, torrential floods wash away the wooden flumes and scatter tailings.
- **Quest Hook — *The Stannary Contraband***: Bailiff Trevithick discovers high-grade cassiterite missing from the tally boards, directly implicating Margery Penrose and threatening a violent camp strike.
