---
id: "EXT-FISH-01"
title: "Pelagic Fishing Fleet Wharf"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-FISH"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Food: Fresh-Catch"
requires:
  - "Naval: Hemp-Cordage"
  - "Timber: Sawn-Lumber"
---

# Pelagic Fishing Fleet Wharf (`EXT-FISH-01`)
> **Industry Chain**: `CHAIN-FISH` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The pelagic fishing wharf serves as the bustling home port for deep-water trawlers and handline dories. Using heavy hemp-cordage rigging and timber-built fish-handling piers, local crews launch daily expeditions into coastal shoals. Returning vessels offload massive quantities of fresh-catch directly to waiting cleaning tables.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, -1, 2]` (pick integers -3 to +3) — **Communal Cooperative** (`Clan`).
- **Sociological Rationale**: Pelagic fishing relies on tight-knit maritime crews sharing extreme physical risks, fostering profound internal solidarity and mutual trust.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Skipper Barnaby Drake"
  role: "Fleet Master"
  disposition: "[2, -1, 2]"
  motivation: "Ensure every boat in the fleet returns safely before autumn storms strike the coast."
- name: "Net-Mender Corinna Vane"
  role: "Wharf Shipwright"
  disposition: "[0, 0, 1]"
  motivation: "Repair salt-rotted cordage and torn hemp nets before the morning tide."

### Material Stocks & Items (Item Prototypes)
- **Fresh-Catch** (`Food`): Silver-scaled pelagic fish hauled straight from coastal trawls, awaiting preservation.
- **Dory Skiff** (`Tool`): Lightweight clinker-built wooden boat used for coastal netting and line fishing.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Shoal Abundance` (`0–10`)**: At `0–3`, overfishing and shifting thermal currents leave the nets empty. At `8–10`, glut catches overwhelm wharf offloading capacity and spoil on the docks.
- **Quest Hook — *The Torn Trawl***: Skipper Barnaby Drake urgently needs advanced net repairs after a deep-water snag shreds half the fleet's primary trawling gear right before a major run of mackerel.
