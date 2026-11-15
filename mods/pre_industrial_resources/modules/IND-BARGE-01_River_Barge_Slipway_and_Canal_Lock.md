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
culture_quadrant: Hierarchy
operational_profile: Produce / Coordinate
mtg_color: White / Blue
node_prerequisites:
  water: Canal Pound with Stone-Lined Lock
  yard: Sloping Timber Slipway with Launching Cradle
  shelter: Caulking Hearth and Pitch Shed
standalone_fallback: "If pine pitch stops arriving, the yard can still frame and plank hulls but cannot pay the seams; barges launch half-sealed, need a refit that takes twice as long, and output falls to one barge a season."
injected_mechanics:
  hull_sealing_dial:
    level_1: "Idle Slipway - Cradle empty, pitch cold and the lock used only by passing traffic; the yard has no hull on the stocks."
    level_2: "Sound Hull - Frames, planking and caulked seams all on schedule; the barge slides down the greased ways and floats dry."
    level_3: "Weeping Seams - Green planking or thin oakum leaves seams that seep; the launch is delayed for a second paying and the toll clerk charges the lock for the extra days."
    level_4: "Stuck Cradle - Warped framing or slack grease jams the carriage halfway down; the hull threatens the lock gates and the canal pound."
  threat_clocks:
    owner_deadline_clock: "Owner Deadline Clock [6 Ticks] - Each week a hull is late from the stocks adds a tick; when full the carrier company cancels the order and the yard must sell the half-built barge at a loss."
    scour_clock: "Gate Scour Clock [4 Ticks] - Each hurried or badly judged lock passage adds a tick of bank scour and leaking paddles; when full the pound drains and the slipway sits dry for a month of repair."
  yields_resource: "1 Finished River Barge per 3 weeks (about 20-40 tons of carrying capacity)"
---
# River Barge Slipway & Canal Lock (`IND-BARGE-01`)
> **Industry Chain**: `CHAIN-BARGE` (Stage 1: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A sloping timber slipway adjacent to a stone-lined canal lock features gantries, caulking hearths, and mechanical winches. Shipwrights frame keel timbers, plank hulls with sawn lumber, fasten structures with forged iron rivets, and seal seams with boiling pine pitch. This heavy construction process turns raw forest and metal products into heavy-duty river transport vessels capable of hauling bulk cargo across canal networks. The required inputs of Timber: Sawn-Lumber, Metal: Forged-Iron, Chem: Pine-Pitch and Animal: Tallow are built into the finished Transport: River-Barge.

The yard works in a fixed order: lay the frame, plank it, fasten it, caulk it, then pay it. Caulkers drive oakum (hemp fibre) soaked in pine tar into the wedge-shaped seams with a mallet and caulking iron, working bent double inside the hull, and the seams are then paid with melted pitch. Barges are flat-bottomed and built to the width of the narrowest lock they must pass. Curved compass timber is scarce, so some knees are forged in iron. Beside the yard the lock keeper keeps the canal pound at level, records every vessel and cargo that passes, and collects the company's tolls.
- **Slipway and Cradle:** greased timber ways and the carriage that carries a hull to the water.
- **Caulking Hearth:** the pitch cauldron and oakum shed where seams are paid.
- **Pound Lock:** stone chamber with mitre gates and rack-and-pinion paddles.
- **Towpath:** the bank track along which horses haul the finished barge.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 2, 4]` - **Hierarchy** (`Hierarchy`).
- **Sociological Rationale**: Coordinating complex structural carpentry, heavy hoisting, and water-control locks demands strict engineering oversight and disciplined crew coordination.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Shipwright Oakhaven Thorne"
  role: "Chief Vessel Designer and Slipway Master"
  disposition: "[2, 3, 4]"
  motivation: "Ensure every barge hull is watertight and balanced before launching down the greased slipway."
- name: "Lockkeeper Bram Sluice"
  role: "Canal Water Level and Gate Operator"
  disposition: "[2, 2, 3]"
  motivation: "Regulate water levels precisely to facilitate safe vessel passage without scouring canal banks."
- name: "Caulker Wenna Marrow"
  role: "Oakum Caulker and Seam Payer"
  disposition: "[4, 2, 3]"
  motivation: "Drive every seam tight and pay it with good pitch, because her pay is docked for each hull that weeps after launch and her back is already failing from years bent inside hulls."
- name: "Toll Clerk Edric Pannier"
  role: "Canal Company Toll Clerk"
  disposition: "[1, 2, 4]"
  motivation: "Record every vessel and cargo that passes the lock and catch boatmen who understate their loads, because the canal company takes the shortfall out of his own wage."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Master Shipwright Oakhaven Thorne
role: Chief Vessel Designer and Slipway Master
motivation: Ensure every barge hull is watertight and balanced before launching down the greased slipway.
disposition: [2, 3, 4]
```
```text
name: Lockkeeper Bram Sluice
role: Canal Water Level and Gate Operator
motivation: Regulate water levels precisely to facilitate safe vessel passage without scouring canal banks.
disposition: [2, 2, 3]
```
```text
name: Caulker Wenna Marrow
role: Oakum Caulker and Seam Payer
motivation: Drive every seam tight and pay it with good pitch, because her pay is docked for each hull that weeps after launch and her back is already failing from years bent inside hulls.
disposition: [4, 2, 3]
```
```text
name: Toll Clerk Edric Pannier
role: Canal Company Toll Clerk
motivation: Record every vessel and cargo that passes the lock and catch boatmen who understate their loads, because the canal company takes the shortfall out of his own wage.
disposition: [1, 2, 4]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Boiling Pitch Cauldron** (`Tool`): Iron vessel used to heat pine resin and tallow for waterproofing hull seams.
- **Winch and Gantry Rig** (`Tool`): Heavy geared mechanical hoist used to position massive oak framing ribs.
- **Oakum Bale** (`Commodity`): Tarred hemp fibre, driven into the hull seams with a caulking iron before they are paid with pitch.
- **Finished River Barge** (`Commodity`): Flat-bottomed, narrow-beam hull built to pass the lock and carry bulk cargo.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial - `Hull Sealing & Buoyancy` (`0-10`)**: At `0-3`, leaky hull seams cause newly launched barges to take on water and list. At `8-10`, warped framing jams the slipway carriage during launch.
- **Quest Hook - *The Jammed Slipway Cradle***: A newly built timber barge sticks halfway down the greased slipway, threatening to capsize into the canal lock. Oakhaven and Bram must deploy emergency winches and jacks to free the vessel before the lock gates are overwhelmed, while Toll Clerk Edric Pannier counts the hours the lock stands closed and the carrier's deadline runs out in three days.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** Frames and planks the hull with `Timber: Sawn-Lumber` from the **Water-Powered Sawmill (`IND-TIMBER-02`)**; fastens it with `Metal: Forged-Iron` from the **Blacksmith Forge (`IND-IRON-03`)**; pays the seams with `Chem: Pine-Pitch` from the **Tar Kiln & Pitch Boilery (`IND-PINE-02`)**; and greases the ways and softens the pitch with `Animal: Tallow` from the **Civic Abattoir (`IND-CATTLE-02`)**.
* **Output Transmission:** Launches `Transport: River-Barge`, an end product with no consumer module; the barges carry the canal's bulk cargo for every other chain.
* **Tactical Chokepoint:** The lock and the pitch supply. Whoever holds the gates or the pitch road decides which hulls get finished and floated.

## 6. Vague Game Hazards
* **Boiling Pitch:** A spilled or overheated cauldron burns the caulkers and can set the shed alight ($2\text{d}6$ fire damage, and the yard loses a week).
* **Launch Cradle:** A hull that breaks loose on the ways crushes anyone beside it ($3\text{d}6$ bludgeoning damage) or swamps the lock.
* **Paddle and Gate Work:** A slipped paddle or a man swept off the gate beam is dragged into the chamber ($1\text{d}6$ damage and drowning risk).
