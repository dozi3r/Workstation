---
id: "IND-SHIP-01"
title: "Seasoning Timber Pond & Sawpit"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SHIP"
chain_stage: 1
chain_role: "refining"
provides:
  - "Naval: Seasoned-Ship-Timber"
requires:
  - "Timber: Hardwood-Logs"
  - "Timber: Mast-Spars"
  - "Metal: Forged-Iron"
---

# Seasoning Timber Pond & Sawpit (`IND-SHIP-01`)
> **Industry Chain**: `CHAIN-SHIP` (Stage 1: `refining`)

## 1. Architectural Overview & Operational Loop
Raw oak logs and towering pine mast-spars are submerged in coastal tidal seasoning ponds to leach out natural saps and sugars that attract wood-boring pests and rot. After months of soaking, pit-sawyers position the heavy timbers over deep sawpits, using long two-man rip-saws to cut precise structural frames, curved ribs, and planking for shipbuilding.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 0, 1]` (pick integers -3 to +3) — **Craftsman Hierarchy** (`Hierarchy`).
- **Sociological Rationale**: Timber seasoning and pit-sawing demand absolute patience, generational empirical knowledge, and strict adherence to geometric templating.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Sawyer Ulfric Stone"
  role: "Timber Inspector"
  disposition: "[1, 0, 1]"
  motivation: "Ensure every curved oak futtock is seasoned and cut without grain flaws."
- name: "Pond-Master Hilda Marsh"
  role: "Seasoning Overseer"
  disposition: "[-1, 1, 0]"
  motivation: "Monitor timber immersion schedules to prevent dry rot and insect infestation."

### Material Stocks & Items (Item Prototypes)
- **Seasoned-Ship-Timber** (`Naval`): Cured, cut oak ribs and planking ready for structural hull assembly.
- **Rip Saw** (`Tool`): Heavy two-man steel saw used in sawpits for vertical timber planking cuts.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Timber Seasoning Depth` (`0–10`)**: At `0–3`, premature removal leaves internal moisture, causing warping and dry rot inside finished hulls. At `8–10`, perfect curing yields exceptionally durable framing timbers.
- **Quest Hook — *The Split Rib***: Master Sawyer Ulfric Stone discovers a hidden hairline fracture running through the keelson timber, halting framing work on the new flagship.
