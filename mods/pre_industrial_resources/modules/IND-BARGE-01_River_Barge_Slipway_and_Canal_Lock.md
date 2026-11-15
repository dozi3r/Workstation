---
id: "IND-BARGE-01"
title: "River Barge Slipway & Canal Lock"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-BARGE"
chain_stage: 1
chain_role: "manufacturing"
provides:
  - "Transport: River-Barge"
requires:
  - "Timber: Sawn-Lumber"
  - "Metal: Forged-Iron"
  - "Chem: Pine-Pitch"
  - "Animal: Tallow"
---
# River Barge Slipway & Canal Lock (`IND-BARGE-01`)
> **Industry Chain**: `CHAIN-BARGE` (Stage 1: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A sloping timber slipway adjacent to a stone-lined canal lock features gantries, caulking hearths, and mechanical winches. Shipwrights frame keel timbers, plank hulls with sawn lumber, fasten structures with forged iron rivets, and seal seams with boiling pine pitch. This heavy construction process turns raw forest and metal products into heavy-duty river transport vessels capable of hauling bulk cargo across canal networks.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, 2]` (pick integers -3 to +3) — **Hierarchy** (`Hierarchy`).
- **Sociological Rationale**: Coordinating complex structural carpentry, heavy hoisting, and water-control locks demands strict engineering oversight and disciplined crew coordination.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Shipwright Oakhaven Thorne"
  role: "Chief Vessel Designer and Slipway Master"
  disposition: "[1, 1, 2]"
  motivation: "Ensure every barge hull is watertight and balanced before launching down the greased slipway."
- name: "Lockkeeper Bram Sluice"
  role: "Canal Water Level and Gate Operator"
  disposition: "[1, 0, 1]"
  motivation: "Regulate water levels precisely to facilitate safe vessel passage without scouring canal banks."

### Material Stocks & Items (Item Prototypes)
- **Boiling Pitch Cauldron** (`Tool`): Iron vessel used to heat pine resin and tallow for waterproofing hull seams.
- **Winch and Gantry Rig** (`Tool`): Heavy geared mechanical hoist used to position massive oak framing ribs.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Hull Sealing & Buoyancy` (`0–10`)**: At `0–3`, leaky hull seams cause newly launched barges to take on water and list. At `8–10`, warped framing jams the slipway carriage during launch.
- **Quest Hook — *The Jammed Slipway Cradle* ***: A newly built timber barge sticks halfway down the greased slipway, threatening to capsize into the canal lock. Oakhaven and Bram must deploy emergency winches and jacks to free the vessel before the lock gates are overwhelmed.
