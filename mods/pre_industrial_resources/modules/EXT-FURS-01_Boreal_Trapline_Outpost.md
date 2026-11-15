---
id: "EXT-FURS-01"
title: "Boreal Trapline Outpost"
set: "Set_A_Infrastructure_and_Engineering"
category: "Pastoral_and_Animal_Products"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-FURS"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Animal: Raw-Pelts"
requires:
  - "Metal: Forged-Iron"
  - "Commodity: Coarse-Salt"
---
# Boreal Trapline Outpost (`EXT-FURS-01`)
> **Industry Chain**: `CHAIN-FURS` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
A remote cluster of log-and-sod cabins situated along deep forest game trails in sub-zero taiga environments. Trappers set forged-iron spring traps across wide territorial beats, harvesting thick-furred winter animals, skinning carcasses on site, and salting raw pelts on wooden stretching frames before sled transport to trading posts.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, -2, 0]` — **Hermit** (`Clan`).
- **Sociological Rationale**: Solitary wilderness existence and bitter cold breed fierce independence, silent endurance, and deep mutual reliance among paired trappers.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Trapper Silas Vance"
  role: "Outpost Hunter"
  disposition: "[-1, -2, 0]"
  motivation: "Expand trap lines into unmapped high valleys before rival trading syndicates arrive."
- name: "Pelt Skinner Maren Kael"
  role: "Hide Preparer"
  disposition: "[0, -1, 1]"
  motivation: "Ensure every raw pelt is fleshed and salted perfectly to command top grade value."

### Material Stocks & Items (Item Prototypes)
- **Raw Pelt** (`Commodity`): Unprocessed, thick-furred animal skin salted and stretched on a wooden frame.
- **Iron Spring Trap** (`Tool`): Heavy forged-iron jaw trap fitted with a chain and anchor stake for predator capture.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Trap-Line Coverage` (`0–10`)**: At `0–3`, traps go unvisited and ruined pelts rot in the snow. At `8–10`, overextended lines exhaust trappers and expose them to freezing storms.
- **Quest Hook — *The Poached Line*스러**: When Silas finds his prime marten traps systematically robbed by an unknown trespasser, he must track the culprit across hostile winter ridges.
