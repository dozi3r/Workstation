---
id: "IND-LIME-03"
title: "Mortar & Plaster Works"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-LIME"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Commodity: Masonry-Mortar"
requires:
  - "Chem: Slaked-Lime"
  - "Mineral: Silica-Sand"
---
# Mortar & Plaster Works (`IND-LIME-03`)
> **Industry Chain**: `CHAIN-LIME` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
In shaded wooden mixing sheds, laborers shovel silica-grade sand and rich slaked lime putty into low circular stone troughs, blending them with measured streams of water. Working with heavy wooden hoes, craftsmen knead the viscous mix into durable masonry mortar and wall plaster, bagging or barreling the compound before it cures in the open air.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, +1, +1]` — **Artisanal Collaborator** (`Clan`).
- **Sociological Rationale**: Proportions and batch consistency depend heavily on the tactile experience and inherited recipes of master plasterers, fostering tight-knit guild camaraderie.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Guildmaster Hettie Rowe"
  role: "Mortar Mixer"
  disposition: "[+1, +1, +1]"
  motivation: "Ensure every batch of mortar achieves optimal plasticity and tensile bond strength."
- name: "Apprentice Corin Sate"
  role: "Sand Handler"
  disposition: "[0, +1, 0]"
  motivation: "Graduate from hauling heavy aggregate barrows to trowelling plaster."

### Material Stocks & Items (Item Prototypes)
- **Masonry Mortar** (`Commodity`): Ready-to-use adhesive paste for bonding stone and brick structures.
- **Wooden Mortar Hoe** (`Tool`): Four-pronged heavy timber hoe designed for thorough aggregate folding.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Batch Consistency` (`0–10`)**: At `0–3`, sandy, watery mixes crumble upon drying. At `8–10`, overly lime-rich batches shrink and crack severely.
- **Quest Hook — *The Premature Set* حکمت**: When an unexpected heatwave accelerates curing inside the storage casks, Hettie must rescue an entire shipment of royal fortification mortar before it hardens solid.
