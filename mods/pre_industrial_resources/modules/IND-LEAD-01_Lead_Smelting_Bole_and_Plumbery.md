---
id: "IND-LEAD-01"
title: "Lead Smelting Bole & Plumbery"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-LEAD"
chain_stage: 1
chain_role: "refining"
provides:
  - "Metal: Smelted-Lead"
requires:
  - "Ore: Lead-Slag"
  - "Fuel: Charcoal-or-Coal"
---
</Agent System Instructions>
<Lead Smelting Bole & Plumbery (`IND-LEAD-01`)>
> **Industry Chain**: `CHAIN-LEAD` (Stage 1: `refining`)

## 1. Architectural Overview & Operational Loop
Open-air stone boles built on windy hillside ledges harness natural drafts to smelt lead-rich slag and secondary ores without complex bellows. Workers feed alternating layers of slag and charcoal into the hearth, tapping molten lead into sand molds to form heavy ingots or hammering sheets for roofing and plumbing. The required inputs of Ore: Lead-Slag and Fuel: Charcoal-or-Coal are thermally reduced into malleable Metal: Smelted-Lead.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, -1, 1]` (pick integers -3 to +3) — **Craft Guild** (`Hierarchy`).
- **Sociological Rationale**: Dealing with toxic lead smelting produces stoic, insular workmen who enforce strict guild traditions to guard against plumbism and regulate output quotas.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Plumber Alistair Drake"
  role: "Guild Warden"
  disposition: "[1, -1, 1]"
  motivation: "Secure monopoly contracts for cathedral roof sheeting and municipal water conduits."
- name: "Slag Tender Brin"
  role: "Hearth Feeder"
  disposition: "[-1, -2, 0]"
  motivation: "Earn enough coin to buy milk and remedies to stave off chronic lead colic."

### Material Stocks & Items (Item Prototypes)
- **Hillside Stone Bole** (`Tool`): Terraced natural-draft furnace positioned to catch high-altitude gales.
- **Sand Casting Bed** (`Tool`): Levelled fine sand trough used for pouring flat lead sheets and pigs.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Draft Wind Velocity` (`0–10`)**: At `0–3`, dead air starves the fire, leaving ores half-reduced. At `8–10`, gale-force winds overheat the bole and vaporize valuable metal.
- **Quest Hook — *The Colic Outbreak***: Severe lead poisoning incapacitates half the smelting crew, threatening to halt cathedral lead deliveries unless Master Alistair imports fresh milk and mitigants.
