---
id: "IND-CLAY-02"
title: "Brickworks & Pottery Kiln"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CLAY"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Commodity: Fired-Bricks"
  - "Commodity: Ceramic-Vessels"
requires:
  - "Mineral: Raw-Clay"
  - "Fuel: Wood-Fuel"
---
# Brickworks & Pottery Kiln (`IND-CLAY-02`)
> **Industry Chain**: `CHAIN-CLAY` (Stage 2: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A cluster of domed beehive kilns, pugmills, and open-air drying sheds forms the municipal brickworks and ceramic yard. Artisans and laborers mold raw clay into uniform wooden forms or turn vessels on foot-powered wheels, dry the greenware, and stack the kilns for high-temperature wood firing. This thermal transformation converts plastic mud into durable structural bricks and water-tight ceramic containers.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 0, 1]` (pick integers -3 to +3) — **Hierarchy** (`Hierarchy`).
- **Sociological Rationale**: Managing extreme thermal cycles and precise firing schedules requires strict operational discipline, standardized molds, and hierarchical quality control.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Potter Tessa kilnwright"
  role: "Chief Kiln Burner and Ceramic Master"
  disposition: "[1, 0, 1]"
  motivation: "Maintain exact internal kiln temperatures to prevent thermal shock cracking in high-value pottery."
- name: "Molder Hob Bricklayer"
  role: "Brick Presser and Yard Foreman"
  disposition: "[0, 1, 1]"
  motivation: "Ensure high volume output of uniform bricks for municipal construction projects."

### Material Stocks & Items (Item Prototypes)
- **Beehive Kiln Structure** (`Tool`): Brick-lined thermal oven designed for multi-day wood firing of ceramics.
- **Wooden Brick Molds** (`Tool`): Hand-carved rectangular forms used to shape wet clay into standardized masonry blocks.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Kiln Firing Rate` (`0–10`)**: At `0–3`, underfired bricks crumble in the rain and pottery remains porous. At `8–10`, thermal runaway vitrifies and warps entire kiln loads into unusable slag.
- **Quest Hook — *The Cracked Archway* ***: A draft in Tessa's kiln causes uneven heating, cracking the main archway bricks mid-fire. She and Hob must shore up the glowing structure before the entire batch collapses into the firebox.
