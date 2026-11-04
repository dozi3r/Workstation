---
id: "IND-SHEEP-02"
title: "Fulling Mill & Scouring Vat"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SHEEP"
chain_stage: 2
chain_role: "refining"
provides:
  - "Textile: Carded-Wool"
requires:
  - "Animal: Raw-Fleece"
  - "Commodity: Soap"
---
# Fulling Mill & Scouring Vat (`IND-SHEEP-02`)
> **Industry Chain**: `CHAIN-SHEEP` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
Waterwheel-driven wooden trip hammers rhythmically pound wet woolen cloth inside heavy stone troughs filled with alkaline scouring soap and stale urine. Laborers scour raw fleece to strip natural lanolin before carding the clean fibers into parallel alignments. The facility transforms raw greasy fleece and scouring soap into clean, carded wool ready for spinning.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 0]` — **Guild Miller** (`Hierarchy`).
- **Sociological Rationale**: Operation of heavy mechanical water-mills and chemical scouring vats enforces strict labor safety and standardized guild throughput.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Millwright Orson Vance"
  role: "Head Fulling Master"
  disposition: "[0, 1, 0]"
  motivation: "Keep the wooden trip hammers synchronized and water-wheel journals greased."
- name: "Scourer Alis Wetherby"
  role: "Vat Attendant"
  disposition: "[-1, 0, -1]"
  motivation: "Strip every trace of animal grease from the fleece without damaging delicate staple fibers."

### Material Stocks & Items (Item Prototypes)
- **Textile: Carded-Wool** (`Commodity`): Clean, combed wool fibers aligned for high-tensile spinning.
- **Commodity: Soap** (`Commodity`): Alkaline cleansing blocks saponified from animal tallow and wood ash lye.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Scouring Alkalinity` (`0–10`)**: At `0–3`, weak lye leaves residual lanolin that fouls the carding combs. At `8–10`, caustic over-treatment dissolves the wool proteins, reducing strong fibers to useless lint.
- **Quest Hook — *The Jammed Sluice***: Debris clogs the water intake of Millwright Orson Vance, halting the fulling hammers while Alis Wetherby's vats threaten to overflow with caustic scouring lye.
