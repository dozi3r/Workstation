---
id: "EXT-LIME-01"
title: "Limestone Quarry"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-LIME"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Stone: Cut-Limestone"
  - "Mineral: Chalk"
requires:
  - "Metal: Forged-Iron"
---
# Limestone Quarry (`EXT-LIME-01`)
> **Industry Chain**: `CHAIN-LIME` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Open-cut terraced rock faces operated with iron wedges, sledgehammers, and hand-cranked wooden derricks. Laborers fracture sedimentary strata along natural bedding planes to quarry massive ashlar blocks and rubble stone for structural building. The facility transforms forged iron tools, human muscle, and exposed bedrock into uniform cut limestone blocks. Softer chalk seams in the upper face are cut apart from the building stone and ground into whiting.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 0, -1]` — **Quarry Foreman** (`Hierarchy`).
- **Sociological Rationale**: Heavy manual extraction and dangerous rock-face operations require direct supervisory control and unwavering discipline among work gangs.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Quarry Master Thaddeus Stone"
  role: "Chief Overseer"
  disposition: "[1, 0, -1]"
  motivation: "Extract flawless building blocks without fatal rockfalls or equipment fracture."
- name: "Blacksmith Apprentice Jory Weld"
  role: "Tool Sharpener"
  disposition: "[0, 1, 0]"
  motivation: "Keep iron wedges and chisel tips tempered and dressed against hard stone."

### Material Stocks & Items (Item Prototypes)
- **Stone: Cut-Limestone** (`Commodity`): Precisely dressed ashlar blocks ready for mortar-free or mortared masonry.
- **Metal: Forged-Iron** (`Tool`): Heavy wedges, crowbars, and sledgehammers hardened for splitting rock.
- **Chalk Whiting** (`Commodity`): Soft white chalk ground fine for dressing hides and polishing, set aside from the structural stone.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Quarry Face Stability` (`0–10`)**: At `0–3`, careless wedge placement triggers unexpected rock collapses, burying tools and workers. At `8–10`, meticulous shoring ensures high-yield block extraction.
- **Quest Hook — *The Fractured Wedge***: Master tool-steel wedges shatter against a hidden quartz vein in the quarry face of Thaddeus Stone, forcing Jory Weld to work through the night at the forge to re-temper a fresh batch of heavy splitting tools.
