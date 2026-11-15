---
id: "IND-CANDLE-01"
title: "Tallow Chandlery"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-CANDLE"
chain_stage: 1
chain_role: "manufacturing"
provides:
  - "Light: Tallow-Candles"
requires:
  - "Animal: Tallow"
  - "Textile: Flax-Fiber"
---
# Tallow Chandlery (`IND-CANDLE-01`)
> **Industry Chain**: `CHAIN-CANDLE` (Stage 1: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A warm, smoky workshop filled with hanging wooden dipping frames where braided flax wicks are repeatedly immersed in vats of rendered animal tallow and allowed to cool between dips, building up solid cylindrical wax tapers destined for domestic and industrial illumination.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, -1]` — **Traditionalist** (`Hierarchy`).
- **Sociological Rationale**: Repetitive, rhythm-driven dipping labor and strict adherence to guild-approved wax purity standards create a steady, conservative craft culture.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Chandler Martha Vance"
  role: "Chandlery Proprietor"
  disposition: "[0, 1, -1]"
  motivation: "Ensure consistent taper thickness and secure cheap tallow contracts from local butchers."
- name: "Wick Braider Jory"
  role: "Fiber Artisan"
  disposition: "[-1, 0, 1]"
  motivation: "Prevent wick curling and smoke odor by refining flax fiber twists."

### Material Stocks & Items (Item Prototypes)
- **Tallow Candle** (`Light`): Sturdy rendered-fat taper providing reliable flame illumination in mines and workshops.
- **Dipper Frame** (`Tool`): Multi-wick wooden rack used to suspend flax strings during successive wax baths.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Tallow Melting Temperature` (`0–10`)**: At `0–3`, cold fat clumps unevenly and ruins wick adhesion. At `8–10`, overheating boils off volatile fats and creates foul-smelling smoke.
- **Quest Hook — *The Rancid Vat*스러**: When a shipment of spoiled slaughterhouse fat contaminates the main melting kettle, Martha must source clean rendering stock before evening work begins.
