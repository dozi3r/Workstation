---
id: "IND-COTTON-03"
title: "Calico Weaving & Print Works"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-COTTON"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Textile: Dyed-Calico"
requires:
  - "Textile: Spun-Cotton-Yarn"
  - "Dye: Indigo-Paste"
  - "Chem: Mordant-Alum"
---

> **Calico Weaving & Print Works** (`IND-COTTON-03`)
> **Industry Chain**: `CHAIN-COTTON` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The calico weaving and print works is a bustling urban workshop lined with pit looms, wooden block-printing tables, and steaming vats of mordant and dye. Weavers interlace spun cotton yarn into plain-cloth fabric, which is subsequently stamped with intricate geometric patterns using carved wooden blocks soaked in alum mordant and indigo paste. Spun yarn, indigo dye, and alum inputs are synthesized into vibrant, colorfast dyed-calico fabrics.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, 1]` (pick integers -3 to +3) — **Collaborative Guild** (`Clan`).
- **Sociological Rationale**: Collaborative artistic design, secret dye recipes, and shared workshop spaces foster a strong clan-like loyalty among master printers and weavers.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Printer Veda Sharma"
  role: "Chief Block-Printer and Colorist"
  disposition: "[1, 1, 2]"
  motivation: "Perfect the mordant-resist formula to ensure brilliant, smudge-free indigo patterns."
- name: "Loom Master Homi Guzder"
  role: "Pit-Loom Weaving Master"
  disposition: "[0, 0, 1]"
  motivation: "Maintain flawless warp tension to prevent thread snaps during high-speed shuttle runs."

### Material Stocks & Items (Item Prototypes)
- **Dyed-Calico** (`Commodity`): Finished cotton cloth adorned with permanent, vibrant block-printed indigo motifs.
- **Carved Printing Block** (`Tool`): Seasoned teak block intricately carved with traditional botanical and geometric motifs.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Mordant Bleed` (`0–10`)**: At `0–3`, alum holds lines crisp and sharp. At `8–10`, contaminated mordant bleeds across threads, blurring printed patterns into muddy smears.
- **Quest Hook — *The Blurry Block***: Master Printer Veda Sharma discovers that a batch of adulterated alum is causing dye bleed across the imperial export bolts.
