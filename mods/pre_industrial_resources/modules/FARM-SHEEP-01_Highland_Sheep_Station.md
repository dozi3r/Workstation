---
id: "FARM-SHEEP-01"
title: "Highland Sheep Station"
set: "Set_A_Infrastructure_and_Engineering"
category: "Pastoral_and_Animal_Products"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SHEEP"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Animal: Raw-Fleece"
  - "Food: Mutton"
requires: []
---
# Highland Sheep Station (`FARM-SHEEP-01`)
> **Industry Chain**: `CHAIN-SHEEP` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Rugged stone fold enclosures and turf-roofed shelters perched on wind-swept upland pastures graze resilient flocks on coarse grasses. Shepherds manage breeding, predator defense, and seasonal shearing cycles using specialized hand shears. The station transforms upland forage, seasonal livestock care, and manual shearing labor into raw greasy fleece and meat.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, -1, 1]` — **Pastoral Patriarch** (`Clan`).
- **Sociological Rationale**: Isolated upland existence fosters strong family-clan loyalty, stoic endurance, and deep reliance on hereditary grazing traditions.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Flockmaster Callum MacLeod"
  role: "Senior Shepherd"
  disposition: "[1, -1, 1]"
  motivation: "Protect the flock from highland predators and harsh winter blizzards."
- name: "Sheepshearer Morag Fenn"
  role: "Master Shearer"
  disposition: "[0, 0, -1]"
  motivation: "Complete the seasonal fleece shearing cleanly without nicking animal skin."

### Material Stocks & Items (Item Prototypes)
- **Animal: Raw-Fleece** (`Commodity`): Unwashed sheep wool laden with natural lanolin and dirt.
- **Food: Mutton** (`Commodity`): Nutritious, hearty meat harvested from mature range sheep.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Pasture Grazing Pressure` (`0–10`)**: At `0–3`, under-grazing allows coarse brush to choke out nutritious pasture grass. At `8–10`, overgrazing strips the hillsides bare, causing severe soil erosion during spring thaws.
- **Quest Hook — *The Predator Incursion***: A pack of wolves breaches the fold perimeter of Flockmaster Callum MacLeod, requiring Morag Fenn and her fellow herders to track the marauders across the ridge before the breeding ewes scatter.
