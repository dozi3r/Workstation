---
id: CWT-025
title: The Volcanic Basalt Causeway & Sulfur Fords
set: Wave 2 Transit Corridors (Tier 2)
tier: Tier 2 (Topological & Biome Anchor / Edge Corridor)
pipeline_tier: 2
provides: ["Transit: Volcanic-Causeway-Crossing", "Chem: Raw-Sulfur-Harvest"]
requires: ["Geography: Active-Caldera-Basin", "Geo: Solid-Basalt-Strata"]
culture_quadrant: Market / Adhocracy
operational_profile: Produce / Deliver
mtg_color: Black / Red
standalone_fallback: "If steam vents fracture the basalt causeway, crossings can only be attempted by hopping across unstable crust islands, risking immersion in boiling acid sludge."
injected_mechanics:
  output_dial:
    level_1: "Sulfur Haze - Acrid yellow smoke stings eyes; boots grow hot on black basalt pavers; 2-hour cautious crossing (Light Tier)."
    level_2: "Pressurized Steam Fumaroles - Intermittent geysers blast super-heated mineral mist across the path; DC 13 Dex to avoid steam scalds (Moderate Tier)."
    level_3: "Basalt Crust Fractures - Molten magma oozes through cracks; sulfuric gas clouds suffocate unmasked travelers (Severe Tier, DC 16 Con / 4d10 fire/acid)."
    level_4: "Caldera Phreatic Eruption - Boiling acid lake surges over the causeway; basalt bridge shatters under seismic blast (Lethal Tier / 8d12)."
  threat_clocks:
    crust_subsidence: "Basalt Crust Subsidence Clock [4 Ticks] - Magma chamber pressure melts foundation pillars."
    toxic_gas_pocket: "Lethal Hydrogen-Sulfide Pocket Clock [4 Ticks] - Heavy odorless gas pools in low-lying causeway dips."
  yields_resource: "High-Temperature Volcanic Transit, Industrial Sulfur Crust, Pumice Stone"
---

# MODULE CWT-025: THE VOLCANIC BASALT CAUSEWAY & SULFUR FORDS

### 1. Mechanical Architecture & Transit Affordance
An ancient, natural hexagonal columnar basalt formation paved over with iron slag and volcanic mortar. The causeway stretches three miles directly across a steaming caldera basin and a boiling turquoise sulfur lake, cutting through an otherwise impassable ring of smoking volcanic craters.

* **The Hexagonal Roadbed:** Columns of basalt packed tight as giant cobblestones, naturally resisting high geothermal temperatures while radiating intense ground heat.
* **The Vent-Chimney Pylons:** Iron pipes driven deep into fissures along the causeway edge, venting pressurized steam safely eighty feet above the roadway to prevent roadbed explosions.
* **The Sulfur Scrape Stations:** Fortified huts equipped with long scrapers and zinc buckets where miners harvest pure yellow sulfur crust cooling along the water's edge.

### 2. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Caldera Transit Company & Sulfur Guild):** Tough, ash-covered engineers who inspect shoe soles and sell vinegar-soaked breath masks. They charge heavy tolls in exchange for guided transit between geyser cycles.
* **Main Opponent (The Fire-Born Zealots):** Hermits who worship the subterranean magma pulse. They wedge timber logs into the vent-chimneys to build up pressure and explode causeway sections beneath foreign invaders.
* **Thematic Shadow (The Black-Powder Chemical Syndicate):** Greedy arms merchants who force indentured laborers to harvest sulfur inside boiling fumaroles without breathing masks to maximize explosive yields.
* **Tertiary Outcast (The Ash-Stalker Smugglers):** Outcasts wearing thick cork-soled boots and leather respirators. They know the safe wading shallows across the boiling acid flats when the main causeway is closed by guards.

### 3. GM Edge Placement & Tactical Synergies
* **Edge Placement:** Recommended on **Edge #6 ➔ #17** or **Edge #17 ➔ #12** (connecting volcanic coastline or subterranean vaults across hazard craters).
* **Industrial Fuel Harvest:** Yields `Chem: Raw-Sulfur-Harvest` needed for `INFRA-03` smokewalls and `INFRA-09` perimeter warded braziers.
* **Standalone Fallback:** Converts into a treacherous, boiling death-trap if vent chimneys are neglected.
