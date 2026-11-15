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
  - "Stone: Cut-Limestone"
  - "Mineral: Raw-Clay"
culture_quadrant: Hierarchy
operational_profile: Refine / Regulate
mtg_color: Red / Black
node_prerequisites:
  ore_yard: Roasting Beds and Ore Sorting Floor
  blast: Bellows Pit with Water Wheel or Treadle Drive
  casting: Sand Molding Floor at Tap-Hole Level
standalone_fallback: "If the clay for tuyeres and hearth lining runs short, the furnace is relined with poor local earth that burns through in days; ingot output falls to a third and each ingot carries more slag."
injected_mechanics:
  blast_temperature_dial:
    level_1: "Cold Hearth - Blast too weak or charge too wet; copper stays trapped in the slag and the hearth chills."
    level_2: "Steady Blast - Bellows keep an even draft, slag floats clear and red-gold copper pools and taps clean into the sand molds."
    level_3: "Hot Blast - Over-driven bellows scorch the charge; impurities cook into the metal and slag eats the hearth lining."
    level_4: "Ruptured Tuyere - A clay nozzle melts and molten slag floods the bellows; the hearth is lost and the pit crew are scalded."
  threat_clocks:
    highland_deforestation_clock: "Highland Deforestation Horizon Clock [6 Ticks] - Continuous charcoal roasting clears highland timber stands; when full, furnaces throttle by 80%."
    slag_pressure_clock: "Crucible Slag Pressure Breach Clock [4 Ticks] - Skipping maintenance or burning green scrub risks a molten slag retaining wall breach."
  yields_resource: "Copper Ingots (6 Cast Bars/Day while the blast holds)"
---
# Copper Smelting Furnace (`IND-COPPER-02`)
> **Industry Chain**: `CHAIN-COPPER` (Stage 2: `refining`)

## 1. Architectural Overview & Operational Loop
Crushed malachite ore is mixed with charcoal fuel in stone-built shaft furnaces fitted with clay tuyeres and leather-skinned bellows. As intense heat reduces the copper carbonate, molten metal pools at the bottom of the hearth, allowing workers to tap fiery red-gold streams into sand molds to form solid copper ingots. The furnace consumes `Ore: Copper-Ore`, `Fuel: Charcoal-or-Coal`, `Stone: Cut-Limestone` as flux and `Mineral: Raw-Clay` for tuyeres and lining, and yields `Metal: Copper-Ingot`.

Sulfide ores need roasting before they smelt; the cleaner oxidised ores go in more easily. The charge is smelted with a flux so impurities gather in a slag that floats on the metal. Slag is raked off and the copper is tapped, and some copper is always lost in the slag as oxide and small prills, which the crew crush and re-smelt. Poorly ventilated roasting gives thick poisonous smoke that marks the district, and arsenic is the main impurity. A smelter owner holds a share in the furnace and the authorities claim theirs, so every tap is counted.
- **Shaft Furnace:** stone stack where charge and charcoal burn under the blast.
- **Bellows Pit:** leather bellows worked by treadle or water wheel, feeding air through the tuyeres.
- **Tap Hole and Mold Floor:** where metal and slag run into separate channels and sand molds.
- **Roasting Beds:** open heaps where ore is calcined before smelting.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 2, 3]` - **Rigid Regulator** (`Hierarchy`).
- **Sociological Rationale**: Smelting demands strict adherence to blast timing and precise flux ratios to avoid brittle, slag-contaminated metal ingots.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Smelter Ruprecht Kolb"
  role: "Hearth Master who reads the slag and calls the tap"
  disposition: "[1, 2, 3]"
  motivation: "Keep to the flux ratio his father taught him against the owner's push to save limestone and charcoal, because his tenth of the tap is paid on clean metal and he alone is blamed when the authority's assay finds arsenic."
- name: "Bellows Hand Cuno Wiltsie"
  role: "Bellows Tender on the treadle who feeds the blast"
  disposition: "[3, 1, 2]"
  motivation: "Work off the debt his father left to the furnace without being moved to the roasting beds, where arsenic smoke has already ruined the lungs of two men he knew."
- name: "Furnace Shareholder Odalys Brannoch"
  role: "Smelter Owner and Share Holder"
  disposition: "[2, 4, 3]"
  motivation: "Squeeze a profit out of the furnace's share of every tap and fend off the authority's claim for a larger proportion, even if it means pushing Ruprecht Kolb to burn more fuel."
- name: "Slag Raker Hamo Fitchett"
  role: "Slag Raker and Prill Picker"
  disposition: "[4, 2, 1]"
  motivation: "Rake and crush the slag for the copper it still holds, because the prills he saves are the only bonus he is paid and the arsenic smoke is taking his breath."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Master Smelter Ruprecht Kolb
role: Hearth Master who reads the slag and calls the tap
motivation: Keep to the flux ratio his father taught him against the owner's push to save limestone and charcoal, because his tenth of the tap is paid on clean metal and he alone is blamed when the authority's assay finds arsenic.
disposition: [1, 2, 3]
```
```text
name: Bellows Hand Cuno Wiltsie
role: Bellows Tender on the treadle who feeds the blast
motivation: Work off the debt his father left to the furnace without being moved to the roasting beds, where arsenic smoke has already ruined the lungs of two men he knew.
disposition: [3, 1, 2]
```
```text
name: Furnace Shareholder Odalys Brannoch
role: Smelter Owner and Share Holder
motivation: Squeeze a profit out of the furnace's share of every tap and fend off the authority's claim for a larger proportion, even if it means pushing Ruprecht Kolb to burn more fuel.
disposition: [2, 4, 3]
```
```text
name: Slag Raker Hamo Fitchett
role: Slag Raker and Prill Picker
motivation: Rake and crush the slag for the copper it still holds, because the prills he saves are the only bonus he is paid and the arsenic smoke is taking his breath.
disposition: [4, 2, 1]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Copper Ingot** (`Commodity`): Heavy cast bar of refined red copper ready for smithing.
- **Clay Tuyere** (`Tool`): Heat-resistant ceramic nozzle protecting bellows pipes from furnace heat.
- **Smelter's Flux Sack** (`Reagent`): Crushed limestone and silica measured into the charge to draw impurities into the slag.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial - `Blast Temperature` (`0-10`)**: At `0-3`, incomplete reduction leaves copper trapped in slag. At `8-10`, overheating boils impurities into porous, useless metal and burns the clay tuyeres and lining through.
- **Quest Hook - *The Ruptured Tuyere***: When a clay blast nozzle melts and floods the bellows with molten slag, Ruprecht Kolb must plug the tuyere breach before the entire hearth explodes. Odalys Brannoch demands the ingot count anyway, Cuno Wiltsie is pinned beside the bellows, and the charcoal in the yard will not last past the next tap.
- **Threat Clock - *Highland Deforestation Horizon Clock [6 Ticks]***: Continuous charcoal roasting clears highland timber stands; when full, furnaces throttle by 80%.
- **Threat Clock - *Crucible Slag Pressure Breach Clock [4 Ticks]***: Skipping maintenance or burning green scrub risks a molten slag retaining wall breach.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** Charges `Ore: Copper-Ore` from the **Malachite Drift Mine (`MINE-COPPER-01`)**; burns `Fuel: Charcoal-or-Coal` from the **Charcoal Burner's Mound (`IND-CHARCOAL-01`)** or the **Deep Colliery and Coking Ovens (`MINE-COAL-01`)**; fluxes the melt with `Stone: Cut-Limestone` from the **Limestone Quarry (`EXT-LIME-01`)**; and forms its tuyeres and hearth lining from `Mineral: Raw-Clay` dug at the **Riverbank Clay Pit (`EXT-CLAY-01`)**.
* **Output Transmission:** Casts `Metal: Copper-Ingot` and sends it to the **Bell & Artillery Bronze Foundry (`IND-BRONZE-01`)** and the **Coppersmith & Brazier Shop (`IND-COPPER-03`)**.
* **Tactical Chokepoint:** The charcoal road. Every copper vessel and bell in the region depends on a hearth that can still find fuel.

## 6. Vague Game Hazards
* **Molten Slag Burst:** A breached slag wall or melted tuyere sprays the pit with molten slag ($2\text{d}6$ fire damage and the clothing ignites).
* **Smelter Smoke:** Standing downwind of the roasting beds breathes thick arsenical smoke ($1\text{d}6$ poison damage per hour and a persistent cough).
* **Hot Mold Floor:** Stepping on a freshly tapped ingot or damp sand mold scalds or explodes steam ($1\text{d}6$ fire damage).
