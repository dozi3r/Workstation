---
id: "FARM-SILK-01"
title: "Mulberry Orchard & Silkworm Nursery"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SILK"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Animal: Silk-Cocoons"
requires: []
---

> **Mulberry Orchard & Silkworm Nursery** (`FARM-SILK-01`)
> **Industry Chain**: `CHAIN-SILK` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The mulberry orchard and silkworm nursery features rows of pruned Morus alba trees surrounding a climate-controlled bamboo rearing shed. Sericulture attendants meticulously harvest tender mulberry leaves to feed voracious silkworm larvae through multiple instars until they spin protective cocoons. Unprocessed inputs are zero, while harvested silk-cocoons are sorted by quality and delivered to filature reeling basins.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, -1, 1]` (pick integers -3 to +3) — **Traditional Steward** (`Hierarchy`).
- **Sociological Rationale**: The delicate hygiene and strict temperature regimens required for silkworm rearing enforce an orderly, ritualized hierarchy overseen by veteran nursery matrons.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Matron Mei-Ling"
  role: "Chief Sericulture Inspector"
  disposition: "[2, -1, 2]"
  motivation: "Maintain strict hygienic standards in the nursery to prevent viral flacherie outbreaks among larvae."
- name: "Pruner Lao Chen"
  role: "Orchard Cultivator"
  disposition: "[1, -2, 1]"
  motivation: "Ensure abundant leaf flushing by pruning mulberry boughs at precisely timed lunar intervals."

### Material Stocks & Items (Item Prototypes)
- **Silk-Cocoons** (`Commodity`): Oval proteinaceous casings spun by Bombyx mori silkworms, rich in continuous raw filament.
- **Bamboo Rearing Tray** (`Tool`): Woven slatted tray used to house silkworm caterpillars during their feeding stages.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Nursery Humidity` (`0–10`)**: At `0–3`, warm, dry air keeps silkworms active and healthy. At `8–10`, damp stagnant air breeds fungal muscardine, killing entire trays of caterpillars overnight.
- **Quest Hook — *The Fungal Blight***: Matron Mei-Ling alerts Pruner Lao Chen that damp mold is spreading across the upper bamboo rearing racks.
