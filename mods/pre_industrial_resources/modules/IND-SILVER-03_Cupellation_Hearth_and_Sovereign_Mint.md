---
id: "IND-SILVER-03"
title: "Cupellation Hearth & Sovereign Mint"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SILVER"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Currency: Silver-Coinage"
requires:
  - "Metal: Crude-Bullion"
  - "Fuel: Charcoal-or-Coal"
---
</Agent System Instructions>
<Cupellation Hearth & Sovereign Mint (`IND-SILVER-03`)>
> **Industry Chain**: `CHAIN-SILVER` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Crude bullion is melted in bone-ash cupels inside a draft-controlled hearth, where an oxidizing blast burns away base lead and base impurities into the porous hearth lining. The purified molten silver is cast into bars, rolled to precise thickness, blanked with iron punches, and struck between heavy steel dies bearing the sovereign seal. The required inputs of Metal: Crude-Bullion and Fuel: Charcoal-or-Coal are refined and stamped into gleaming Currency: Silver-Coinage.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[3, 1, 2]` (pick integers -3 to +3) — **Sovereign Treasury** (`Hierarchy`).
- **Sociological Rationale**: High-security royal minting operations enforce absolute bureaucratic accountability, strict auditing, and severe penal consequences for assay tampering.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Royal Assayer Lord Valerian Vance"
  role: "Master of the Mint"
  disposition: "[3, 0, 2]"
  motivation: "Guarantee exact coin weight and fineness to uphold crown credit across foreign realms."
- name: "Die-Sinker Kaelen Swift"
  role: "Master Engraver"
  disposition: "[1, 2, 0]"
  motivation: "Craft tamper-proof dies with micro-detailing that prevents counterfeiting rings."

### Material Stocks & Items (Item Prototypes)
- **Bone-Ash Cupel** (`Tool`): Compressed calcined bone hearth designed to absorb base metal oxides during fire assay.
- **Steel Coinage Die** (`Tool`): Hardened tool-steel punch engraved with the sovereign's likeness and mint marks.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Coin Fineness Purity` (`0–10`)**: At `0–3`, debased alloy sparks inflation and merchant riots. At `8–10`, sterling purity establishes absolute trust in regional trade.
- **Quest Hook — *The Clipped Shillings***: An audit reveals widespread coin clipping originating within the mint guards, threatening Lord Valerian with treason charges if he fails to unmask the ringleader.
