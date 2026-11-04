---
id: "IND-COPPER-02"
title: "Copper Smelting Furnace"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-COPPER"
chain_stage: 2
chain_role: "refining"
provides:
  - "Metal: Copper-Ingot"
requires:
  - "Ore: Copper-Ore"
  - "Fuel: Charcoal-or-Coal"
---
</Agent System Instructions>
<Copper Smelting Furnace (`IND-COPPER-02`)>
> **Industry Chain**: `CHAIN-COPPER` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
Crushed malachite ore is mixed with charcoal fuel in stone-built shaft furnaces fitted with clay tuyeres and leather-skinned bellows. As intense heat reduces the copper carbonate, molten metal pools at the bottom of the hearth, allowing workers to tap fiery red-gold streams into sand molds to form solid copper ingots.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[+2, 0, +1]` — **Rigid Regulator** (`Hierarchy`).
- **Sociological Rationale**: Smelting demands strict adherence to blast timing and precise flux ratios to avoid brittle, slag-contaminated metal ingots.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Smelter Thaddeus Drake"
  role: "Hearth Master"
  disposition: "[+2, 0, +1]"
  motivation: "Produce high-purity copper ingots without excessive slag inclusions."
- name: "Bellows Boy Pipen Callow"
  role: "Draft Tender"
  disposition: "[0, -1, 0]"
  motivation: "Maintain rhythmic, tireless air pressure through grueling shifts."

### Material Stocks & Items (Item Prototypes)
- **Copper Ingot** (`Commodity`): Heavy cast bar of refined red copper ready for smithing.
- **Clay Tuyere** (`Tool`): Heat-resistant ceramic nozzle protecting bellows pipes from furnace heat.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Blast Temperature` (`0–10`)**: At `0–3`, incomplete reduction leaves copper trapped in slag. At `8–10`, overheating boils impurities into porous, useless metal.
- **Quest Hook — *The Ruptured Tuyere***: When a clay blast nozzle melts and floods the bellows with molten slag, Thaddeus must plug the tuyere breach before the entire hearth explodes.

- **Threat Clock — *Highland Deforestation Horizon Clock [6 Ticks]***: Continuous charcoal roasting clears highland timber stands; when full, furnaces throttle by 80%.
- **Threat Clock — *Crucible Slag Pressure Breach Clock [4 Ticks]***: Skipping maintenance or burning green scrub risks a molten slag retaining wall breach.
