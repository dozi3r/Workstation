---
id: "IND-PAPER-03"
title: "Movable-Type Printshop & Bindery"
set: "Set_A_Infrastructure_and_Engineering"
category: "Paper_and_Printing"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-PAPER"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Luxury: Printed-Codices"
requires:
  - "Commodity: Laid-Paper"
  - "Material: Cured-Leather"
  - "Metal: Smelted-Lead"
---

## 1. Architectural Overview & Operational Loop
Filled with wooden type cases, hand-cranked screw presses, and sewing benches, this workshop sets cast lead alloy glyphs into composing sticks. Typographers lock pages into heavy iron chases, ink the forms with leather dabbers, and press laid paper sheets against them before master binders sew and bind the signatures in leather covers.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 1, -1]` — **Intellectual Technocrat** (`Hierarchy`).
- **Sociological Rationale**: Precise linguistic layout, typography standards, and intellectual copyright enforcement demand meticulous organization.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Printer Alistair Thorne"
  role: "Master Typographer"
  disposition: "[2, 1, -1]"
  motivation: "Publish definitive editions of classical treatises without typographical errors."
- name: "Apprentice Nola Drake"
  role: "Type-Setter"
  disposition: "[1, 0, 1]"
  motivation: "Master the arduous case layout and speed up daily galley assembly."

### Material Stocks & Items (Item Prototypes)
- **Printed-Codices** (`Luxury`): Bound, multi-page books containing knowledge, laws, or literature.
- **Composing-Stick** (`Tool`): Handheld metal tray used by typesetters to assemble lines of movable type.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Ink Viscosity (`0–10`)**: At `0–3`, runny ink bleeds and smudges text beyond legibility. At `8–10`, tacky ink rips the paper surface during impression release.
- **Quest Hook — *The Upside-Down Galleys*---**: An exhausted apprentice drops a complete forme of type for the new civil code, scattering thousands of lead characters across the floor.
