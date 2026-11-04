---
id: "IND-TIMBER-03"
title: "Master Cooperage"
set: "Set_A_Infrastructure_and_Engineering"
category: "Forestry_and_Timber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-TIMBER"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Timber: Cooperage-Casks"
requires:
  - "Timber: Sawn-Lumber"
  - "Metal: Forged-Iron"
---
# Master Cooperage (`IND-TIMBER-03`)
> **Industry Chain**: `CHAIN-TIMBER` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Master coopers shape sawn lumber into tapered, bevel-edged staves using drawknives and steaming boxes, arranging them inside iron hoops without adhesives or nails. Heat from wood-shaving fires softens the oak staves so they can be bent inward and locked tightly with heavy forged iron hoops, creating watertight casks for wine, beer, and dry goods. This intricate craft converts lumber and iron into essential storage vessels.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 0, -1]` — **Collaborator** (`Clan`).
- **Sociological Rationale**: Traditional cooperage workshops rely on multi-generational apprenticeship traditions, precise geometrical formulas, and tight guild camaraderie.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Cooper Gavin Fletcher"
  role: "Guild Master Cooper"
  disposition: "[0, 0, 0]"
  motivation: "Ensure every cask passes the rigorous water-pressure test without a single droplet leaking."
- name: "Hooper Jessa Miller"
  role: "Journeyman Cooper"
  disposition: "[-1, 0, -1]"
  motivation: "Master the art of heat-bending staves without scorching the inner wood grain."

### Material Stocks & Items (Item Prototypes)
- **Cooperage-Casks** (`Commodity`): Airtight, iron-hooped wooden barrels sealed with rushes.
- **Cooper's Drawknife** (`Tool`): A curved two-handled blade used for shaving precise bevels on cask staves.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Hoop Tension (`0–10`)**: At `0–3`, loose hoops cause casks to collapse under liquid weight. At `8–10`, perfectly driven iron hoops seal wood staves into indestructible vessels.
- **Quest Hook — *The Leaking Vintage***: When a batch of newly manufactured wine casks begins weeping juice during storage, Gavin must re-hoop and reseal every barrel before the merchant guild rejects the entire shipment.
