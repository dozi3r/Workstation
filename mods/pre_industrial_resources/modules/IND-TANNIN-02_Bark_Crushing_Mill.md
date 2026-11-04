---
id: "IND-TANNIN-02"
title: "Bark Crushing Mill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-TANNIN"
chain_stage: 2
chain_role: "refining"
provides:
  - "Chem: Tannin"
requires:
  - "Commodity: Tree-Bark"
---
# Bark Crushing Mill (`IND-TANNIN-02`)
> **Industry Chain**: `CHAIN-TANNIN` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
A rustic timber-framed water- or animal-powered pounder mill utilizes heavy stone stamps or iron-shod wooden beams to pulverize coarse oak and hemlock tree bark into a fibrous powder. Workers shovel raw bark into troughs where rhythmic crushing breaks down cellular structures, preparing the material for hot-water leaching. This mechanical transformation turns raw, bulky forest litter into concentrated tanning extract essential for hide preservation.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, -1, 2]` (pick integers -3 to +3) — **Bureaucracy** (`Hierarchy`).
- **Sociological Rationale**: The strict rhythm of the crushing machinery and the necessity of uniform grading foster a rigid supervisory hierarchy and standardized output inspection.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Millwright Alistair Vance"
  role: "Chief Millwright and Mechanism Inspector"
  disposition: "[1, -1, 2]"
  motivation: "Ensure the crushing stamps operate continuously without bearing failure or timber rot."
- name: "Journeyman Grinder Giles Cooper"
  role: "Bark Sorting and Feeding Foreman"
  disposition: "[0, -1, 1]"
  motivation: "Maintain a steady flow of pulverized bark while avoiding harmful airborne dust inhalation."

### Material Stocks & Items (Item Prototypes)
- **Granite Crushing Stamps** (`Tool`): Heavy stone blocks mounted on timber shafts used to pulverize fibrous bark.
- **Leaching Vats** (`Tool`): Large wooden tanks where crushed bark is steeped in hot water to extract active tannins.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Stamp Pressure & Moisture` (`0–10`)**: At `0–3`, bark is insufficiently crushed, lowering tannin yield. At `8–10`, damp bark jams the stamps, splintering the wooden drive cams.
- **Quest Hook — *The Splintered Cam* ***: Master Alistair discovers a cracked wooden drive cam just as a large shipment of oak bark arrives. He enlists Giles and local adventurers to source seasoned heartwood before the milling schedule stalls entirely.
