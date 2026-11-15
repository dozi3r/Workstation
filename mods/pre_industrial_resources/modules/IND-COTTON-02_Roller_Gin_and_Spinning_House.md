---
id: "IND-COTTON-02"
title: "Roller Gin & Spinning House"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-COTTON"
chain_stage: 2
chain_role: "refining"
provides:
  - "Textile: Spun-Cotton-Yarn"
requires:
  - "Crop: Raw-Cotton-Boll"
---

# Roller Gin & Spinning House (`IND-COTTON-02`)
> **Industry Chain**: `CHAIN-COTTON` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
The roller gin and spinning house is a drafty industrial shed filled with double-roller charkha gins and multi-spindle spinning wheels. Raw cotton bolls are fed between counter-rotating wooden rollers that crush seeds away from lint, after which carded fibers are drawn and twisted into durable yarn on spinning frames. Raw cotton boll inputs are transformed into neatly spooled spun-cotton-yarn ready for weaving looms.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[0, 1, 0]` (pick integers -3 to +3) — **Artisan Enterprise** (`Market`).
- **Sociological Rationale**: Balancing piecework wages with strict guild quality standards, this workshop fosters competitive efficiency mediated by skilled craft pride.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Spinner Tariq Al-Din"
  role: "Chief Ginning and Spinning Overseer"
  disposition: "[0, 1, 1]"
  motivation: "Maintain consistent yarn tensile strength across all drop-spindle frames."
- name: "Roller Tender Amira Sen"
  role: "Charkha Gin Operator"
  disposition: "[1, 0, 0]"
  motivation: "Clear jammed seed rollers quickly without contaminating clean lint with broken husks."

### Material Stocks & Items (Item Prototypes)
- **Spun-Cotton-Yarn** (`Commodity`): Finely twisted cotton thread wound onto wooden bobbins.
- **Double-Roller Gin** (`Tool`): Hand-cranked mechanism utilizing brass and ironwood rollers to separate cotton fiber from seeds.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Roller Slippage` (`0–10`)**: At `0–3`, smooth counter-rotation strips seeds instantly. At `8–10`, warped wooden rollers crush seeds into the lint, ruining entire batches.
- **Quest Hook — *The Warped Rollers***: Master Spinner Tariq Al-Din discovers that humidity has warped the primary gin rollers, halting production right before the merchant deadline.
