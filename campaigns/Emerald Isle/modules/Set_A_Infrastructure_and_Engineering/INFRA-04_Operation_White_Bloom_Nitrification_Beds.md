---
id: INFRA-04
title: Operation White-Bloom Nitrification Midden Beds
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Material: Direct-Reduced-Iron","Chem: Saltpeter-Nitrate","Fuel: Black-Powder"]
requires: ["Material: Hardwood-Timber","Geography: High-Elevation-Water-Head"]
culture_quadrant: Hierarchy / Market
operational_profile: Produce / Service
mtg_color: Red / Black
node_prerequisites:
  terrain: Dry Leeward Cliff Shelf (protected from rain)
  airflow: Constant High Air Movement (to fuel aerobic bacterial rot)
  waste_inputs: Beast Manure + Aerial Guano + Urine + Limestone Rubble
standalone_fallback: "Can function at small homestead scale using simple latrine pits; produces saltpeter at 10% volume, enough for hunting muskets but insufficient for artillery munitions."

injected_mechanics:
  production_dial:
    level_1: "Fresh Midden Stacks - Raw waste piled; ammoniac stench unbearable; zero yield."
    level_2: "Active Bacterial Rot - Nitrification cycle active; efflorescence forming."
    level_3: "White-Bloom Harvest - Walls frosted in white salt; leaching vats operating at peak."
    level_4: "Explosive Munitions Depot - Continuous black powder production; massive blast risk."
  threat_clocks:
    ammonia_blindness_clock: "Ammonia Fume Clock [4 Ticks] - Working without grease masks burns eyes."
    powder_magazine_detonation: "Magazine Explosion Clock [4 Ticks] - Open sparks ignite stored barrels."
  yields_resource: "Potassium Nitrate (KNO3 / Saltpeter) & Military Black Powder"
---

# MODULE INFRA-04: OPERATION WHITE-BLOOM NITRIFICATION MIDDEN BEDS

### 1. Ordnance Architecture

The chemical engine that breaks the need for imported gunpowder by refining biological waste into military-grade explosive nitrate.

* **Midden-Masonry Aeration Walls:** 4-foot-high, 3-foot-thick walls erected on dry leeward mountain shelves protected by cliff overhangs. Spaced 2 feet apart for "Watering Wretches" to pass.
* **The Holy Trinity Composition:**
  * 20% cohesive binding clay
  * 10% crushed porous limestone rubble ($CaCO_3$)
  * 70% Organic Waste: Scraped Worg stable dung, aerial bat guano from high peaks, and human/beast urine.
* **The French Nitrification Cycle:** Aerobic nitrifying bacteria oxidize organic ammonia into nitrate salts over 6 to 9 months.
* **Leaching & Recrystallization:** The encrusted white bloom is scraped, boiled in copper vats with wood ash (potassium hydroxide), and recrystallized into 98% pure **Potassium Nitrate ($\text{KNO}_3$, Saltpeter)**.

### 2. GM Socket Placement & Munitions Synergy
* **Input Dependency:** Needs organic waste and protection from rain (water leaches the water-soluble nitrate salts).
* **Output Transmission:** Mixed with volcanic sulfur and hardwood charcoal to manufacture **Black Powder** for blast mining, wall cannons, and convict firearms.

### 3. Vague Game Hazards
* **Corrosive Ammonia Stench:** Spending more than 1 hour in the midden rows without dampened grease masks inflicts nausea ($-1$ to all physical checks).
* **Magazine Blast Hazard:** If the dry powder storage magazine takes fire or lightning damage, it detonates in a 60-foot radius dealing $6\text{d}10$ concussive fire trauma.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
