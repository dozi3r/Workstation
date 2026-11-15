---
id: "IND-SPICE-02"
title: "Firing Woks & Curing Sheds"
set: "Set_A_Infrastructure_and_Engineering"
category: "Agriculture_and_Subsistence"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SPICE"
chain_stage: 2
chain_role: "refining"
provides:
  - "Luxury: Cured-Spices-and-Tea"
requires:
  - "Crop: Raw-Spices-and-Tea"
  - "Fuel: Charcoal-or-Coal"
  - "Commodity: Ceramic-Vessels"
  - "Metal: Pig-Iron"
---
# Firing Woks & Curing Sheds (`IND-SPICE-02`)

## 1. Architectural Overview & Operational Loop
Equipped with massive cast-iron woks, brick flues, and tiered bamboo drying racks, this processing station halts enzymatic decay in raw agricultural crops through controlled heat application. Artisans roast, steam, and ferment raw leaves and spices over steady charcoal fires before packing them tightly into sealed ceramic vessels for long-distance export.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, 0]` — **Market Operator** (`Market`).
- **Sociological Rationale**: Driven by grade classification, weight optimization, and market demand for premium aromatic profiles.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Roaster Bramen Crows"
  role: "Chief Kiln-Master"
  disposition: "[1, 1, 0]"
  motivation: "Achieve the exact moisture content and aroma demanded by foreign merchant guilds."
- name: "Sorter Meera Vance"
  role: "Quality Assayer"
  disposition: "[1, 0, -1]"
  motivation: "Detect and discard contaminated batches before they enter export packing."

### Material Stocks & Items (Item Prototypes)
- **Cured-Spices-and-Tea** (`Commodity`): Highly valuable, shelf-stable aromatics packaged for luxury trade routes.
- **Cast-Iron-Wok** (`Tool`): Heavy thermal vessel used for precise flash-roasting of botanical leaves.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Firing Temperature (`0–10`)**: At `0–3`, under-dried goods mold in transit. At `8–10`, excessive heat scorches the crop, ruining delicate essential oils.
- **Quest Hook — *The Scorched Batch*---**: A sudden draft flares the primary flues, charring a high-value tea shipment intended for the provincial governor's palace.
