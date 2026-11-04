---
id: "IND-SHEEP-03"
title: "Master Draper's Guildhall"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SHEEP"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Textile: Broadcloth"
requires:
  - "Textile: Carded-Wool"
  - "Chem: Mordant-Alum"
---
# Master Draper's Guildhall (`IND-SHEEP-03`)
> **Industry Chain**: `CHAIN-SHEEP` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Multi-story timber-framed weaving halls housing numerous high-warp foot-treadle looms and dyeing vats. Master drapers supervise spinners, weavers, and dyers who fix natural pigments into carded wool using mineral mordants before weaving dense, windproof broadcloth. The facility transforms carded wool and mineral alum into luxurious, dyed broadcloth textiles.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, 1]` — **Guild Chancellor** (`Hierarchy`).
- **Sociological Rationale**: Guild monopolies on weaving standards and color formulas enforce rigorous quality control, hierarchical apprenticeship, and market protectionism.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Guild Master Geoffrey Vance"
  role: "Chief Draper"
  disposition: "[1, 1, 1]"
  motivation: "Enforce strict thread-count standards and protect the guild's regional monopoly."
- name: "Master Dyer Isolde Vane"
  role: "Colorist"
  disposition: "[0, 2, 0]"
  motivation: "Perfect vibrant, colorfast dye baths using precise mineral alum mordants."

### Material Stocks & Items (Item Prototypes)
- **Textile: Broadcloth** (`Commodity`): Heavy, tightly woven woolen cloth with a felted, weather-resistant surface.
- **Chem: Mordant-Alum** (`Reagent`): Double-sulfate mineral salt used to lock organic dyes permanently into woolen fibers.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Weave Tension` (`0–10`)**: At `0–3`, slack warp threads produce uneven, loose cloth that fails quality inspection. At `8–10`, excessive tension snaps threads constantly, stalling production and wasting yarn.
- **Quest Hook — *The Faded Batch***: A contaminated shipment of alum ruins the mordant bath of Master Dyer Isolde Vane, threatening Guild Master Geoffrey Vance's lucrative export contract with foreign merchants unless a replacement fix is discovered.
