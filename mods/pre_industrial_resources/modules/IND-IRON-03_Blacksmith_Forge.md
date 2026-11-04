---
id: "IND-IRON-03"
title: "Blacksmith Forge"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-IRON"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Metal: Forged-Iron"
requires:
  - "Metal: Pig-Iron"
  - "Fuel: Charcoal-or-Coal"
---
# Blacksmith Forge (`IND-IRON-03`)
> **Industry Chain**: `CHAIN-IRON` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A stone-built hearth workbench equipped with leather bellows, heavy anvils, and water-quenching troughs serves as the primary municipal smithy. The smith heats brittle pig-iron pigs with charcoal combustion, folding and hammering out slag impurities to produce malleable, durable forged iron components. This thermal-mechanical craft converts raw cast metal stock into finished tools, hardware, and structural fasteners.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 2]` (pick integers -3 to +3) — **Market** (`Market`).
- **Sociological Rationale**: Operating as a direct nexus of tool commerce and municipal supply, the smithy emphasizes output velocity, material economy, and guild standard pricing.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Smith Gareth Ironhand"
  role: "Guild Master Bladesmith and Hardware Artisan"
  disposition: "[0, 1, 2]"
  motivation: "Deliver high-tolerance forged iron goods while maintaining absolute control over local metal pricing."
- name: "Striker Marta Vance"
  role: "Heavy Hammer Journeyman"
  disposition: "[1, 0, 1]"
  motivation: "Perfect her hammer-swing rhythm and eventually earn mastership of her own hearth."

### Material Stocks & Items (Item Prototypes)
- **Wrought Anvil** (`Tool`): Hardened steel-faced iron block used as the primary shaping surface for hot metalwork.
- **Quenching Oil and Water Vat** (`Reagent`): Thermal cooling bath used to temper forged iron tools for optimal hardness.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Hearth Temperature & Draft` (`0–10`)**: At `0–3`, the charcoal bed cools, causing metal to fracture under the hammer. At `8–10`, overheating burns the carbon out of the iron, rendering it brittle.
- **Quest Hook — *The Contaminated Pig Batch* ***: Gareth receives a shipment of high-sulfur pig-iron that crumbles into red-short shards under Marta's hammer. They must investigate the smelting camp upstream before the town guard's weapon requisition deadline passes.
