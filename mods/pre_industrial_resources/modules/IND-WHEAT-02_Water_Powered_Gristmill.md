---
id: "IND-WHEAT-02"
title: "Water-Powered Gristmill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-WHEAT"
chain_stage: 2
chain_role: "refining"
provides:
  - "Food: Wheat-Flour"
requires:
  - "Crop: Raw-Wheat"
  - "Metal: Forged-Iron"
---
# Water-Powered Gristmill (`IND-WHEAT-02`)
> **Industry Chain**: `CHAIN-WHEAT` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
A rushing stream drives a massive timber undershot waterwheel, transferring kinetic rotational energy through iron-shod axle shafts to heavy vertical millstones. Raw wheat grain is fed steadily from overhead wooden hoppers down between the grinding surfaces, where shearing friction pulverizes the kernels into fine meal before bolting screens sift out the coarse bran. This mechanical mill transforms bulky agricultural harvests into refined flour.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, +1, +1]` — **Administrator** (`Hierarchy`).
- **Sociological Rationale**: Operating precise, heavy machinery under strict manorial toll collection rules fosters a methodical, rule-bound technical mindset focused on output volume and gear maintenance.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Miller Silas Croft"
  role: "Master Miller"
  disposition: "[0, +1, +2]"
  motivation: "Collect accurate multure tolls in grain while keeping the grinding stones perfectly dressed."
- name: "Miller's Boy Toby"
  role: "Mill Apprentice"
  disposition: "[-1, 0, -1]"
  motivation: "Learn the secrets of stone dressing without losing a finger to the drive gears."

### Material Stocks & Items (Item Prototypes)
- **Wheat-Flour** (`Commodity`): Fine white flour packed into tightly sewn canvas sacks.
- **Dressing Pick** (`Tool`): A tempered steel chisel used to re-cut gripping grooves into stone mill faces.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Stone Clearance (`0–10`)**: At `0–3`, stones grind too close, sparking fire and scorching flour. At `8–10`, optimal clearance yields premium silky flour.
- **Quest Hook — *The Cracked Runner Stone***: When the main granite millstone fractures during peak harvest grinding, Silas must broker with local miners for emergency steel reinforcement before restless farmers riot.

- **Threat Clock — *Damp Grain Mold Clock [4 Ticks]***: Wet rot ruins winter grain stores if sluice humidity rises.
- **Threat Clock — *Mill Dam Wear Clock [6 Ticks]***: Floodwater vibrations weaken the heavy timber weir and stone sluice gates.
