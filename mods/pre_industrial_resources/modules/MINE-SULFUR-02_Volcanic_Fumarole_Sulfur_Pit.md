---
id: "MINE-SULFUR-02"
title: "Volcanic Fumarole Sulfur Pit"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-POWDER"
chain_stage: 2
chain_role: "extraction"
provides:
  - "Chem: Brimstone-Sulfur"
  - "Chem: Nitric-Parting-Acid"
requires:
  - "Commodity: Ceramic-Vessels"
---
> **Volcanic Fumarole Sulfur Pit** (`MINE-SULFUR-02`)
> **Industry Chain**: `CHAIN-POWDER` (Stage 2: `extraction`)

## 1. Architectural Overview & Operational Loop
Excavated near noxious volcanic vents in unstable highland clefts, workers harness subterranean sulfurous vapors using earthenware retorts and condensing troughs. Crude brimstone is sublimated and scraped from stone flues, while secondary acid-condensing channels yield pungent parting acids used in metal refining and powder production.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, -1, 1]` — **Enforcer** (`Hierarchy`).
- **Sociological Rationale**: The lethal environment and toxic fumes demand absolute obedience to safety foremen and harsh disciplinary codes to prevent mass asphyxiation.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Vent Master Varis Thorne"
  role: "Fumarole Overseer"
  disposition: "[2, -1, 1]"
  motivation: "Exceed sulfur tonnage quotas despite crumbling rock walls and toxic gas pockets."
- name: "Retort Tender Lyra Vance"
  role: "Condenser Watcher"
  disposition: "[0, -2, 2]"
  motivation: "Acquire respiratory filters and hazard pay for her hazard-exposed crew."

### Material Stocks & Items (Item Prototypes)
- **Brimstone Lump** (`Commodity`): Raw yellow crystalline sulfur chunk harvested from vent rims.
- **Earthen Retort** (`Tool`): Heat-resistant ceramic vessel used to sublime and trap sulfur vapor.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Vent Flow Regulation` (`0–10`)**: At `0–3`, volcanic gases choke the pit and halt extraction. At `8–10`, pressure spikes fracture retorts and cause fatal sulfur fires.
- **Quest Hook — *The Choked Flue***: When a primary sulfur vent clogs with obsidian ash, Varis must risk an unauthorized dynamite blast to reopen the vein before the refinery starves.
