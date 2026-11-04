---
id: "IND-SHIP-03"
title: "Admiralty Fitting-Out Basin"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SHIP"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Transport: Ocean-Caravel"
requires:
  - "Naval: Careened-Hull"
  - "Naval: Hemp-Cordage"
  - "Naval: Canvas-Sails"
  - "Alloy: Cast-Bronze"
---

> Admiralty Fitting-Out Basin (`IND-SHIP-03`)
> **Industry Chain**: `CHAIN-SHIP` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The admiralty fitting-out basin represents the pinnacle of pre-industrial maritime manufacturing. Careened hulls receive towering pine masts, intricate hemp-cordage standing rigging, canvas sails, and heavy cast-bronze deck fittings and ordnance. Specialized riggers, carpenters, and naval inspectors coordinate the final outfitting before commissioning the ocean-going caravel for service.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[3, 2, 1]` (pick integers -3 to +3) — **Imperial Command** (`Hierarchy`).
- **Sociological Rationale**: Sovereign naval expansion requires top-down imperial bureaucracy, immense capital investment, and absolute coordination among diverse military-industrial guilds.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Commodore Alistair Vance"
  role: "Naval Commissioner"
  disposition: "[3, 2, 1]"
  motivation: "Inspect and commission the new caravel fleet for immediate colonial exploration duties."
- name: "Rigging Master Isolde Thorne"
  role: "Chief Rigger"
  disposition: "[1, 0, 1]"
  motivation: "Step masts and tension standing rigging perfectly so the vessel handles heavy gales."

### Material Stocks & Items (Item Prototypes)
- **Ocean-Caravel** (`Transport`): Fully rigged, seaworthy multi-masted sailing ship ready for deep-ocean exploration.
- **Bronze Ship Bell** (`Tool`): Cast bronze bell inscribed with naval registry marks for watch signaling.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Vessel Sea-Readiness` (`0–10`)**: At `0–3`, incomplete rigging and loose ordnance render the ship unseaworthy and prone to dismasting. At `8–10`, flawless outfitting produces a magnificent flagship ready for global voyage.
- **Quest Hook — *The Unstepped Mast***: Commodore Alistair Vance threatens to withhold commissioning funds unless the rigging crew steps the mainmast before the royal inspection at dawn.
