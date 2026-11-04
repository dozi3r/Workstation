---
id: "IND-SHIP-02"
title: "Drydock Slipway & Caulking Yard"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SHIP"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Naval: Careened-Hull"
requires:
  - "Naval: Seasoned-Ship-Timber"
  - "Textile: Oakum-and-Tow"
  - "Chem: Pine-Pitch"
  - "Metal: Forged-Iron"
---

> Drydock Slipway & Caulking Yard (`IND-SHIP-02`)
> **Industry Chain**: `CHAIN-SHIP` (Stage 2: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The drydock slipway is a massive stone-lined tidal basin where shipwrights assemble seasoned ship timbers over sturdy keel blocks, fastening them with forged-iron bolts and trunnels. Once the structural hull skeleton is planked, caulkers hammer oakum into every seam and seal the exterior hull with boiling pine-pitch to create a watertight, floating vessel.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 1, 0]` (pick integers -3 to +3) — **Technocratic Hierarchy** (`Hierarchy`).
- **Sociological Rationale**: Major shipbuilding requires synchronized trade guilds, rigorous structural engineering oversight, and massive capital coordination.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Shipwright Oakhaven"
  role: "Chief Naval Architect"
  disposition: "[2, 1, 0]"
  motivation: "Construct a seaworthy hull capable of surviving transatlantic exploration routes."
- name: "Caulker Bramble Finch"
  role: "Seam Sealer"
  disposition: "[0, -1, 1]"
  motivation: "Ensure every planking seam is hammered tight and pitched before high tide."

### Material Stocks & Items (Item Prototypes)
- **Careened-Hull** (`Naval`): Complete, watertight wooden ship hull ready for masts and rigging.
- **Caulking Mallet** (`Tool`): Heavy wooden mallet used with iron chisels to drive oakum into hull seams.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Hull Watertight Integrity` (`0–10`)**: At `0–3`, faulty caulking causes severe leaks upon launching, risking immediate sinking. At `8–10`, flawless construction ensures absolute buoyancy and structural rigidity.
- **Quest Hook — *The Leaky Seam***: Bramble Finch discovers a major seawater leak along the garboard strake during the initial drydock flood test, requiring immediate emergency pitching.
