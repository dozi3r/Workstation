---
id: "IND-OLIVE-02"
title: "Stone Olive Press"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-OLIVE"
chain_stage: 2
chain_role: "refining"
provides:
  - "Oil: Olive-Oil"
requires:
  - "Crop: Olives"
  - "Commodity: Ceramic-Vessels"
  - "Livestock: Draft-Animals"
---
# Stone Olive Press (`IND-OLIVE-02`)
> **Industry Chain**: `CHAIN-OLIVE` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
A heavy circular stone basin and rotating edge-runner mill powered by draft animals crush harvested olives into a dense pomace. Laborers transfer the crushed mash into woven fiber mats, stacking them beneath a massive wooden lever-and-screw press to extract golden virgin oil. The facility transforms raw olives and empty ceramic vessels into high-grade edible oil and storage jars.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 1]` — **Master Artisan** (`Hierarchy`).
- **Sociological Rationale**: Precise calibration of pressing weight and strict sanitation protocols require specialized guild discipline and structured workshop oversight.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Presser Nikolas Vance"
  role: "Chief Miller"
  disposition: "[0, 1, 1]"
  motivation: "Extract the maximum volume of clear oil without bitter sediment contamination."
- name: "Vessel Maker Thalia Thorne"
  role: "Potter and Glazer"
  disposition: "[1, 0, 0]"
  motivation: "Ensure flawless, non-porous ceramic amphorae that prevent oil rancidity."

### Material Stocks & Items (Item Prototypes)
- **Oil: Olive-Oil** (`Commodity`): Golden, aromatic cooking and lighting oil of exceptional clarity.
- **Commodity: Ceramic-Vessels** (`Commodity`): Kiln-fired amphorae sealed with pitch for long-term preservation.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Pressing Pressure` (`0–10`)**: At `0–3`, insufficient torque leaves residual oil trapped in the dry pomace. At `8–10`, excessive force shatters wooden press components or crushes bitter pits into the oil.
- **Quest Hook — *The Rusted Screw***: The bronze-threaded driving screw of Master Presser Nikolas Vance binds under maximum load, requiring Thalia Thorne to fabricate an emergency replacement pin before the stacked olive mash begins to ferment and ruin the batch.
