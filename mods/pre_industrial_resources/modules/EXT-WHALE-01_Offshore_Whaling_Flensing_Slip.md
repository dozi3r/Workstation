---
id: "EXT-WHALE-01"
title: "Offshore Whaling Flensing Slip"
set: "Set_A_Infrastructure_and_Engineering"
category: "Maritime_and_Transport"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-WHALE"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Animal: Whale-Blubber"
  - "Material: Baleen"
requires:
  - "Naval: Hemp-Cordage"
  - "Metal: Forged-Iron"
---

# Offshore Whaling Flensing Slip (`EXT-WHALE-01`)
> **Industry Chain**: `CHAIN-WHALE` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
The offshore whaling flensing slip is an inclined stone ramp jutting into tidal waters, equipped with heavy capstans, hemp-cordage blocks, and forged-iron flensing spades. When leviathans are towed ashore by whaling crews, workers winch the massive carcasses onto the slip to strip away thick layers of blubber and harvest flexible baleen plates.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 0, -2]` (pick integers -3 to +3) — **Radical Vanguard** (`Adhocracy`).
- **Sociological Rationale**: High-hazard open-ocean extraction requires opportunistic improvisation, intense physical courage, and volatile crew dynamics.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Harpooner Caleb Stark"
  role: "Lead Flenser"
  disposition: "[2, 0, -2]"
  motivation: "Extract high-grade blubber quickly before tides wash the carcass back out to sea."
- name: "Capstan Master Nora Kincaid"
  role: "Winch Operator"
  disposition: "[0, 1, -1]"
  motivation: "Maintain the heavy iron winches under immense strain from breaching behemoths."

### Material Stocks & Items (Item Prototypes)
- **Whale-Blubber** (`Animal`): Thick, fat-rich adipose tissue harvested for high-yield industrial oil rendering.
- **Flensing Spade** (`Tool`): Long-handled razor-sharp iron blade used to slice thick cetacean hide and blubber.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Carcass Recovery Rate` (`0–10`)**: At `0–3`, stormy surf makes beaching impossible, causing carcasses to rot offshore. At `8–10`, a glut of whales overruns the slip, leading to putrid waste buildup and public health hazards.
- **Quest Hook — *The Broken Capstan***: Caleb Stark faces a race against the rising tide when the main iron winch snaps while hauling a massive right whale onto the slip.
