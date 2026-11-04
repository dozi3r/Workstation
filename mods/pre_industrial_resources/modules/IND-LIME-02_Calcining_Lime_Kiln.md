---
id: "IND-LIME-02"
title: "Calcining Lime Kiln"
set: "Set_A_Infrastructure_and_Engineering"
category: "Masonry_and_Glass"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-LIME"
chain_stage: 2
chain_role: "refining"
provides:
  - "Chem: Slaked-Lime"
requires:
  - "Stone: Cut-Limestone"
  - "Fuel: Charcoal-or-Coal"
---
</Agent System Instructions>
<Calcining Lime Kiln (`IND-LIME-02`)>
> **Industry Chain**: `CHAIN-LIME` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
Limestone blocks are stacked in a stout, refractory-lined masonry shaft kiln over a roaring wood or charcoal fire, driven by natural draught from a low-slung flue. Intense dry heat decomposes the calcium carbonate into quicklime, which workers carefully rake out and quench with water in slaking troughs to yield smooth, reactive slaked lime putty for construction.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+2, -1, +2]` — **Bureaucratic Stabilizer** (`Hierarchy`).
- **Sociological Rationale**: The immense heat and hazards of lime burning demand absolute procedural compliance and strict adherence to firing schedules to prevent kiln explosions or structural collapses.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Kilnman Barnaby Vance"
  role: "Kiln Burner"
  disposition: "[+2, -1, +2]"
  motivation: "Maintain steady temperatures without cracking the expensive masonry lining."
- name: "Quencher Olen Vane"
  role: "Slaking Laborer"
  disposition: "[+1, -2, +1]"
  motivation: "Avoid caustic chemical burns while churning boiling slaking troughs."

### Material Stocks & Items (Item Prototypes)
- **Quicklime Clinker** (`Commodity`): Highly reactive calcium oxide chunks fresh from the firing chamber.
- **Slaking Shovel** (`Tool`): Long-handled iron paddle designed for agitating lime milk without splashing.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Draft Intensity` (`0–10`)**: At `0–3`, smothered fires produce uncalcined core stones. At `8–10`, thermal runaway vitrifies and ruins the kiln lining.
- **Quest Hook — *The Fused Draft*phosphor**: When wet limestone clogs the primary flue, Barnaby must prevent an explosive over-pressurization before the entire masonry shaft fractures.
