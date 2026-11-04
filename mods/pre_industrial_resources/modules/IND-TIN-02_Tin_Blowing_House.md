---
id: "IND-TIN-02"
title: "Tin Blowing House"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-TIN"
chain_stage: 2
chain_role: "refining"
provides:
  - "Metal: Tin-Ingot"
requires:
  - "Ore: Tin-Ore"
  - "Fuel: Charcoal-or-Coal"
---
</Agent System Instructions>
<Tin Blowing House (`IND-TIN-02`)>
> **Industry Chain**: `CHAIN-TIN` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
The tin blowing house is a thick-walled stone furnace shed equipped with a large leather-and-wood foot-or-water-driven bellows. Workers charge the granite hearth with alternate layers of washed cassiterite ore and charcoal fuel, producing high blast temperatures that reduce the oxide to molten white metal. The required inputs of Ore: Tin-Ore and Fuel: Charcoal-or-Coal are smelted down and skimmed of slag, then cast into heavy stone moulds yielding pure Metal: Tin-Ingot.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 0, 1]` (pick integers -3 to +3) — **Technocratic Order** (`Hierarchy`).
- **Sociological Rationale**: Operating high-temperature pyrometallurgical equipment requires strict procedural discipline, thermal mastery, and centralized control over precious fuel supplies.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Melter Geoffrey Smelter"
  role: "Smelter Guild Master"
  disposition: "[2, 1, 1]"
  motivation: "Maintain absolute purity standards in every cast ingot to preserve the guild's royal charter."
- name: "Bellows Boy Jory Polglase"
  role: "Trench Labourer"
  disposition: "[-1, -2, -1]"
  motivation: "Survive grueling 12-hour shifts amid toxic arsenic fumes without collapsing."

### Material Stocks & Items (Item Prototypes)
- **Granite Hearth Slab** (`Tool`): Carved refractory stone basin capable of withstanding extreme reduction temperatures.
- **Slag Skimming Rake** (`Tool`): Long-handled iron tool used to remove glassy impurities from molten metal.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Blast Heat Intensity` (`0–10`)**: At `0–3`, the furnace chills and freezes the charge into an unworkable iron-tin mass. At `8–10`, runaway temperatures melt the granite lining and crack the bellows.
- **Quest Hook — *The Arsenical Choke***: Dangerous arsenic vapors escape a cracked hearthstone, incapacitating Jory Polglase and threatening a stoppage unless Master Geoffrey procures refractory clay repairs.
