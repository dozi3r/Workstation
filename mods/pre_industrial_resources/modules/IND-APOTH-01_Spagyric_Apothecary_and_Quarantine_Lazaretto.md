---
id: "IND-APOTH-01"
title: "Spagyric Apothecary & Quarantine Lazaretto"
set: "Set_A_Infrastructure_and_Engineering"
category: "Chemicals_and_Reagents"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-APOTHECARY"
chain_stage: 1
chain_role: "manufacturing"
provides:
  - "Medicine: Apothecary-Tinctures"
requires:
  - "Chem: Distilled-Spirits"
  - "Luxury: Cured-Spices-and-Tea"
  - "Commodity: Glassware"
  - "Chem: Wine-Vinegar"
---
# Spagyric Apothecary & Quarantine Lazaretto (`IND-APOTH-01`)
> **Industry Chain**: `CHAIN-APOTHECARY` (Stage 1: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Positioned at the city gates, this fortress-like apothecary combines distillation alembics and herbal extraction vats with isolation wards for arriving travelers. Apothecaries steep rare spices and botanical extracts in high-proof distilled spirits and vinegar, sealing the curative tinctures in sterile glassware to combat urban plagues.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 0, 3]` — **Civic Guardian** (`Hierarchy`).
- **Sociological Rationale**: Managing public health and enforcing strict quarantine protocols require absolute regulatory control, rigorous sanitation, and civic defense oversight.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Apothecary-General Silas Vance"
  role: "Chief Spagyrist & Quarantine Officer"
  disposition: "[1, 0, 3]"
  motivation: "Enforce strict contagion barriers while compounding efficacious remedies for civic epidemics."
- name: "Herbarium Master Kaelen Ross"
  role: "Botanical Extractor"
  disposition: "[0, -1, 2]"
  motivation: "Secure fresh exotic spice shipments before volatile active ingredients degrade in storage."

### Material Stocks & Items (Item Prototypes)
- **Distilled-Spirits** (`Reagent`): High-proof alcohol used as a primary solvent and preservative base.
- **Apothecary-Tinctures** (`Medicine`): Concentrated medicinal extracts formulated to treat fevers and infections.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — Quarantine Sealing (`0–10`)**: At `0–3`, lax sanitary barriers let infectious vectors slip past the lazaretto gates. At `8–10`, draconian lockdowns provoke civil unrest among quarantined merchant caravans.
- **Quest Hook — *The Contaminated Alchemical Stock*---**: A shipment of imported botanical spices arrives infested with mold, threatening to spoil the entire batch of plague preventative. Silas and Kaelen must isolate the compromised reserves and synthesize an alternative tincture before a fever outbreak strikes the inner wards.
