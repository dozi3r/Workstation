---
id: CWT-034
title: Deep-Well Aquifer Siphon & Solar Distillation Array
set: Wave 3 Biological Life-Support (Tier 3)
tier: Tier 3 (Crucible Workshops & Resource Refineries)
pipeline_tier: 3
provides: ["Water: Artesian-Potable-Yield", "Mineral: Refined-Brine-Salts"]
requires: ["Hydraulics: Deep-Bore-Steel-Pipes", "Energy: Concentrated-Solar-Panels"]
culture_quadrant: Hierarchy / Hydraulic Bureaucracy
operational_profile: Design / Deliver
mtg_color: Blue / White
standalone_fallback: "If polished solar collector mirrors shatter or hydraulic siphon pumps seize, laborers operate counter-weighted donkey sweeps over the bore-shaft, skimming mineral brine into open-air earthen pans to yield potable brackish water at Light Tier."
injected_mechanics:
  output_dial:
    level_1: "Brackish Ration Flow - Chalky, mineral-heavy drinking water; modest daily salt scraping (Light Tier, DC 10 Con)."
    level_2: "Sweet Artesian Surplus - Sparkling purified spring water piped across regional aqueducts; pristine salt cakes for food preservation (Moderate Tier, DC 13 Investigate)."
    level_3: "Boiler Superheat Rupture - Parabolic mirror array concentrates thermal flash onto dry copper siphons; explosive superheated steam scalds refinery crews (Severe Tier, DC 16 Dex / 4d10 fire)."
    level_4: "Tectonic Aquifer Cavitation - Unchecked over-pumping drains subterranean hollows; sudden bedrock collapse swallows the distillation tower in a 200-foot sinkhole (Lethal Tier, DC 20 Dex / 8d12 bludgeoning)."
  threat_clocks:
    solar_overpressure: "Solar Reflector Overpressure Clock [4 Ticks] - Boiler pressure builds behind calcified valve seats."
    aquifer_depletion: "Bedrock Cavitation Clock [6 Ticks] - Deep water table drops below bedrock support limits."
  yields_resource: "Pressurized Potable Water, Food-Grade White Salt, Concentrated Industrial Brine"
---

# MODULE CWT-034: DEEP-WELL AQUIFER SIPHON & SOLAR DISTILLATION ARRAY

### 1. Mechanical Architecture & Thermal Desalination
Rising from the sun-bleached desert basin like a crystalline fortress, the Array extracts ancient fossil water trapped half a mile beneath impervious capstone rock. Deep-bore steel pipes sink into pressurized thermal aquifers, drawing mineral-saturated brine into surface holding vats. Hundreds of polished parabolic mirrors focus blazing sunlight onto glass distillation domes, boiling the liquid into pure, sweet condensation while leaving glittering mounds of pure salt behind.

* **The Deep Steel Bore-Hole:** A central derrick driving reciprocating piston rods into the subterranean aquifer, cycling under hydraulic counterweights.
* **The Parabolic Solar Basin:** Concentric rings of curved brass and silvered glass mirrors tracking the sun to boil brine inside blackened copper siphons.
* **The Sweetwater Aqueduct Header:** Elevated stone conduit distributing pressurized potable water downstream to arid towns, military garrisons, and irrigation canals.

### 2. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Bureau of Hydraulic Distribution):** Pompous magistrates in linen robes who operate the master valve wheels. They ration freshwater based on civic tax contributions and military loyalty oaths.
* **Main Opponent (The Desert Water Guerrillas):** Nomad clans who view the aquifer as sacred common heritage; they raid perimeter pipes with sledgehammers to redirect water to desert oases.
* **Thematic Shadow (The Brine Speculators):** Industrial magnates who buy rights to the boiling pans, demanding maximum salt yield for leather tanning even when municipal drinking cups run dry.
* **Tertiary Outcast: **The Sun-Blind Pan Scrapers:** Bound debtors forced to rake blinding white salt crystals across reflective shallow pools without eye protection.

### 3. GM Placement & Tactical Synergies
* **Placement:** Recommended on **Node 10 (Desert Salt Flats / Oasis)**, **Node 15 (Dry Frontier Basin)**, or any arid chokepoint commanding the regional water table.
* **Supply Chain Interlocks:** Consumes `Hydraulics: Deep-Bore-Steel-Pipes` and `Energy: Concentrated-Solar-Panels`; outputs `Water: Artesian-Potable-Yield` (which resolves water starvation across 3 adjacent nodes) and `Mineral: Refined-Brine-Salts` (needed for meat curing in CWT-033).
* **Standalone Fallback:** If solar mirrors lose alignment, draft animals work primitive bucket belts, providing life-sustaining emergency rations.
