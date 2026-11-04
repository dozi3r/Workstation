---
id: "IND-SOAP-01"
title: "Caustic Soapboiler Vat"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SOAP"
chain_stage: 1
chain_role: "manufacturing"
provides:
  - "Commodity: Soap"
requires:
  - "Oil: Olive-Oil"
  - "Chem: Potash"
  - "Chem: Slaked-Lime"
---
</Agent System Instructions>
<Caustic Soapboiler Vat (`IND-SOAP-01`)>
> **Industry Chain**: `CHAIN-SOAP` (Stage 1: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Large lead-lined wooden vats are filled with water, potash, and slaked lime to causticize the mixture, generating lye. Olive oil is slowly added over gentle wood fires, and workers stir the boiling alkaline solution continuously with long wooden paddles until saponification occurs, casting the thick soap paste into wooden frames to cool and harden.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 0, +1]` — **Methodical Operator** (`Hierarchy`).
- **Sociological Rationale**: Boiling caustic lye requires strict safety protocols and precise measurement to prevent severe chemical burns or spoiled batches.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Soapboiler Dame Marta"
  role: "Soapboiler"
  disposition: "[0, 0, +1]"
  motivation: "Ensure complete saponification without scorching the oil batch."
- name: "Stirring Hand Jule Vane"
  role: "Vat Tender"
  disposition: "[-1, 0, 0]"
  motivation: "Maintain steady agitation through hours of thick, heavy boiling."

### Material Stocks & Items (Item Prototypes)
- **Hard Soap Block** (`Commodity`): Cured alkaline soap bars used for hygiene and wool scouring.
- **Wooden Stirring Paddle** (`Tool`): Long-handled ash paddle shaped for scraping the bottom of boiling vats.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Lye Causticity` (`0–10`)**: At `0–3`, weak lye leaves oil unreacted, yielding greasy sludge. At `8–10`, overly caustic lye ruins equipment and irritates workers' skin.
- **Quest Hook — *The Scorched Batch***: When a sudden wood-fire flare-up scorches the bottom of the master boiling vat, Dame Marta must skim the clean soap before the burnt odor ruins the entire export batch.
