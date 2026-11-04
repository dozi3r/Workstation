---
id: "IND-GOLD-02"
title: "Assay Furnace & Goldsmith Bourse"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-GOLD"
chain_stage: 2
chain_role: "manufacturing"
provides:
  - "Metal: Gold-Bullion"
requires:
  - "Ore: Gold-Dust"
  - "Fuel: Charcoal-or-Coal"
  - "Chem: Nitric-Parting-Acid"
---
</Agent System Instructions>
<Assay Furnace & Goldsmith Bourse (`IND-GOLD-02`)>
> **Industry Chain**: `CHAIN-GOLD` (Stage 2: `manufacturing`)

## 1. Architectural Overview & Operational Loop
In secure back-alley bourse chambers, goldsmiths melt raw placer dust in small fire-clay crucibles and apply nitric parting acid to dissolve alloyed silver and base metals away from native gold. The required inputs of Ore: Gold-Dust, Fuel: Charcoal-or-Coal, and Chem: Nitric-Parting-Acid are refined through precise thermal and chemical dissolution, yielding pristine, stamped Metal: Gold-Bullion bars ready for high-value commerce.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 2, 1]` (pick integers -3 to +3) — **Merchant Guild** (`Market`).
- **Sociological Rationale**: Handling precious bullion and volatile parting acids in urban financial hubs fosters a calculating, secretive merchant culture driven by market arbitrage and security.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Assayer Barnaby Golding"
  role: "Bourse Warden"
  disposition: "[2, 1, 1]"
  motivation: "Maintain unblemished reputation for purity while profiting handsomely on assay fees."
- name: "Acid-Boy Jaron"
  role: "Fume Tender"
  disposition: "[0, 2, -1]"
  motivation: "Learn the secret arts of parting gold without losing his teeth to nitric acid fumes."

### Material Stocks & Items (Item Prototypes)
- **Fire-Clay Crucible** (`Tool`): Small specialized melting pot capable of withstanding intense gold-melting heats.
- **Graduated Parting Flask** (`Reagent`): Glass vessel used for boiling gold-silver alloys in nitric acid baths.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Acid Parting Purity` (`0–10`)**: At `0–3`, impure acid leaves silver contamination in the gold. At `8–10`, flawless parting yields 24-karat sovereign bullion.
- **Quest Hook — *The Pyrite Swindle***: A bag of cunningly plated iron pyrite dust is submitted for assay, threatening to poison the bourse's reserves if Master Barnaby fails to detect it.
