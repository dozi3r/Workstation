---
id: "IND-BRONZE-01"
title: "Bell & Artillery Bronze Foundry"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-BRONZE"
chain_stage: 1
chain_role: "manufacturing"
provides:
  - "Alloy: Cast-Bronze"
requires:
  - "Metal: Copper-Ingot"
  - "Metal: Tin-Ingot"
  - "Fuel: Charcoal-or-Coal"
  - "Commodity: Fired-Bricks"
---
</Agent System Instructions>
<Bell & Artillery Bronze Foundry (`IND-BRONZE-01`)>
> **Industry Chain**: `CHAIN-BRONZE` (Stage 1: `manufacturing`)

## 1. Architectural Overview & Operational Loop
The bronze foundry is a cavernous pit-kiln workshop centered around deep casting pits lined with fired bricks and clay loam. Master founders precisely proportion copper and tin ingots inside graphite crucibles, firing them with abundant charcoal fuel until liquid bronze forms. The required inputs of copper, tin, fuel, and refractory bricks are transformed into high-tensile Alloy: Cast-Bronze poured directly into complex loam-and-wax molds for ordnance and bells.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 2, 0]` (pick integers -3 to +3) — **Guild Artisans** (`Adhocracy`).
- **Sociological Rationale**: Artistic precision and metallurgical alchemy combine with high-stakes craftsmanship, fostering a proud guild culture of trade secrets and creative tension.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Foundry Master Niccolò Vance"
  role: "Chief Bronzesmith"
  disposition: "[1, 2, 0]"
  motivation: "Cast a flawless cathedral bell that rings true across three valleys before retirement."
- name: "Mold Carver Sister Beatrice"
  role: "Wax Modeler"
  disposition: "[0, 1, -1]"
  motivation: "Incorporate intricate protective iconography into every ordnance and bell mold."

### Material Stocks & Items (Item Prototypes)
- **Graphite Crucible** (`Tool`): Heavy-duty vessel capable of containing multi-hundred-weight molten metal alloys.
- **Loam Molding Clay** (`Commodity`): Specialized organic-rich mud used to build collapsible internal casting cores.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Alloy Ratio Precision` (`0–10`)**: At `0–3`, tin segregation causes brittle, cracking castings. At `8–10`, perfect metallurgical balance yields resonant bronze of exceptional tensile strength.
- **Quest Hook — *The Cracked Recasting***: A massive siege gun mold fractures during the pour, releasing molten bronze across the pit floor and pitting Master Niccolò against desperate military inspectors.
