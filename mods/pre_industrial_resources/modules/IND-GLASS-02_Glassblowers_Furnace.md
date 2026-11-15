---
id: "IND-GLASS-02"
title: "Glassblower's Furnace"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-GLASS"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Commodity: Glassware"
requires:
  - "Mineral: Silica-Sand"
  - "Chem: Potash"
  - "Fuel: Charcoal-or-Coal"
  - "Chem: Slaked-Lime"
  - "Metal: Forged-Iron"
  - "Commodity: Ceramic-Vessels"
---
# Glassblower's Furnace (`IND-GLASS-02`)
> **Industry Chain**: `CHAIN-GLASS` (Stage 2: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A massive, dome-topped brick furnace roars continuously, fueled by forced-draft charcoal chambers that melt silica sand, potash flux, and lime into a glowing, viscous batch of molten glass. Craftsmen dip long iron blowpipes into the crucibles, gathering the glowing gob and shaping it through synchronized lung inflation, rolling blocks, and dexterous metal shears.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, +2, +1]` — **Passionate Creator** (`Adhocracy`).
- **Sociological Rationale**: Glassblowing requires instantaneous artistic timing, intense thermal focus, and fluid teamwork under extreme heat, fostering high creative autonomy and craft pride.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Gaffer Lucian Vance"
  role: "Lead Glassblower"
  disposition: "[+1, +2, +1]"
  motivation: "Create flawless crystal vessels and optical lenses without thermal inclusions."
- name: "Blowpipe Tender Morag Fenn"
  role: "Furnace Stoker"
  disposition: "[0, +1, 0]"
  motivation: "Keep crucible temperatures perfectly stable through every shift."

### Material Stocks & Items (Item Prototypes)
- **Glassware** (`Commodity`): Blown flasks, vials, and window panes of varying clarity.
- **Iron Blowpipe** (`Tool`): Five-foot hollow steel tube tipped with a heat-resistant mouthpiece.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Crucible Heat` (`0–10`)**: At `0–3`, the batch chills and crystallizes prematurely on the pipe. At `8–10`, the crucible cracks, spilling molten glass into the firebox.
- **Quest Hook — *The Thermal Shock***: When a sudden draft cracks the primary melting pot mid-shift, Lucian must salvage the remaining molten batch before it solidifies in the firebox.
