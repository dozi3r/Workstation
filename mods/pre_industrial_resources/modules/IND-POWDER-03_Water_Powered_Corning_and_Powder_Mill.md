---
id: "IND-POWDER-03"
title: "Water-Powered Corning & Powder Mill"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-POWDER"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Ordnance: Corned-Gunpowder"
requires:
  - "Chem: Refined-Saltpeter"
  - "Chem: Brimstone-Sulfur"
  - "Fuel: Charcoal-or-Coal"
  - "Timber: Cooperage-Casks"
  - "Alloy: Cast-Bronze"
  - "Metal: Forged-Copper"
---
# Water-Powered Corning & Powder Mill (`IND-POWDER-03`)
> **Industry Chain**: `CHAIN-POWDER` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
A heavily reinforced, blast-mitigated timber structure spanning a rushing stream where water-driven bronze stamping hammers pulverize and intimately blend saltpeter, sulfur, and charcoal inside damp leather troughs. The resulting explosive cake is forced through copper sieves to granulate into uniform grains before being barreled in sealed casks.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 1, 2]` — **Pioneer** (`Adhocracy`).
- **Sociological Rationale**: High-risk explosive manufacturing requires absolute concentration, peer reliance, and strict adherence to anti-static protocols among the powder-men.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Powder Master Caleb Miller"
  role: "Millwright & Blaster"
  disposition: "[1, 1, 2]"
  motivation: "Ensure zero spark incidents while maximizing batch density and dry speed."
- name: "Sieve Hand Jorah Fenn"
  role: "Granulation Operator"
  disposition: "[-1, 2, 0]"
  motivation: "Secure better water-wheel maintenance to eliminate erratic stamping vibration."

### Material Stocks & Items (Item Prototypes)
- **Corned Gunpowder** (`Ordnance`): Granulated explosive propellant packaged in moisture-proof copper-hooped casks.
- **Bronze Stamp Shoe** (`Tool`): Spark-resistant heavy bronze pestle used to crush explosive ingredients in troughs.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Stamping Moisture Level` (`0–10`)**: At `0–3`, dry friction triggers catastrophic detonation of the mill house. At `8–10`, excessive water ruins the explosive mix entirely.
- **Quest Hook — *The Dry Sieve*스러**: When a water raceway clogs during mid-stamp, Caleb must clear the wooden flume before friction heat ignites the active crushing trough.
