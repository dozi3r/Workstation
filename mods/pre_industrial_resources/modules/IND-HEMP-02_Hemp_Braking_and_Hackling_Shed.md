---
id: "IND-HEMP-02"
title: "Hemp Braking & Hackling Shed"
set: "Set_A_Infrastructure_and_Engineering"
category: "Textiles_and_Fiber"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-HEMP"
chain_stage: 2
chain_role: "refining"
provides:
  - "Textile: Oakum-and-Tow"
requires:
  - "Crop: Raw-Hemp-Stalks"
  - "Metal: Forged-Iron"
---

# Hemp Braking & Hackling Shed (`IND-HEMP-02`)
> **Industry Chain**: `CHAIN-HEMP` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
In the braking and hackling shed, dried and retted hemp stalks are crushed under heavy wooden break-mallets to shatter the brittle woody cores (hurds). Artisans then pull the clean fiber bundles through spiked iron hackling combs of increasing fineness, separating long line fibers from short tow and coarse oakum used for caulking and rough cordage.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[-1, 1, 0]` (pick integers -3 to +3) — **Process Bureaucrat** (`Hierarchy`).
- **Sociological Rationale**: Mechanical fiber separation is dusty, highly repetitive labor governed by strict output quotas and grade sorting standards.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Hackler Brendan Vance"
  role: "Fiber Sorter"
  disposition: "[-1, 1, 0]"
  motivation: "Grade every batch accurately to ensure only premium tow reaches the ropewalks."
- name: "Braker Alisoun Reed"
  role: "Mallet Operator"
  disposition: "[1, -1, 0]"
  motivation: "Maintain rhythm at the breaking benches despite choking dust and repetitive strain."

### Material Stocks & Items (Item Prototypes)
- **Oakum-and-Tow** (`Textile`): Coarse, fibrous hemp scrap and short fibers used for naval caulking and packing.
- **Hackling Comb** (`Tool`): Wooden board fitted with parallel rows of sharpened steel spikes for combing fiber.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Fiber Purity & Cleanliness` (`0–10`)**: At `0–3`, inadequate breaking leaves woody shives embedded in the fibers, ruining downstream rope quality. At `8–10`, excessive combing over-processes the batch, reducing total yield.
- **Quest Hook — *The Choking Dust***: Brendan Vance reports respiratory illness spreading among the brakers due to blocked ventilation shafts in the dusty shed.
