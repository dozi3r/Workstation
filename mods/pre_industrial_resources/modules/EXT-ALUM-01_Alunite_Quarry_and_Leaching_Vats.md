---
id: "EXT-ALUM-01"
title: "Alunite Quarry & Leaching Vats"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-ALUM"
chain_stage: 1
chain_role: "refining"
provides:
  - "Chem: Mordant-Alum"
requires:
  - "Fuel: Wood-Fuel"
---
# Alunite Quarry & Leaching Vats (`EXT-ALUM-01`)
> **Industry Chain**: `CHAIN-ALUM` (Stage 1: `refining`)

## 1. Architectural Overview & Operational Loop
Volcanic alunite rock is quarried from arid hillsides, broken into manageable fragments, and roasted in specialized kilns to drive off sulfur gases. The calcined rock is then steeped in large lead-lined leaching vats filled with hot water, allowing pure potassium alum crystals to precipitate out upon cooling for use as an essential textile dyeing mordant.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+1, -1, +1]` — **Industrious Technocrat** (`Hierarchy`).
- **Sociological Rationale**: Chemical refining demands strict temperature control and careful crystallization timing, fostering a methodical and disciplined workforce.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Alchemist Alistair Vance"
  role: "Leaching Master"
  disposition: "[+1, -1, +1]"
  motivation: "Extract high-purity alum crystals without sulfur contamination."
- name: "Quarry Hand Beryl Fenn"
  role: "Roasting Tender"
  disposition: "[0, -1, 0]"
  motivation: "Maintain steady kiln temperatures through sulfur fumes."

### Material Stocks & Items (Item Prototypes)
- **Potassium Alum** (`Commodity`): Purified crystalline mordant used to fix dyes in textiles.
- **Lead Leaching Vat** (`Tool`): Corrosion-resistant heavy tank used for boiling calcined alunite rock.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Roasting Heat` (`0–10`)**: At `0–3`, under-roasted alunite fails to leach into soluble alum. At `8–10`, excessive heat decomposes the mineral into useless alumina.
- **Quest Hook — *The Sulfur Leak***: When a cracked roasting kiln releases choking sulfur dioxide across the compound, Alistair must seal the breach before local authorities shut down the operation.
