---
id: INFRA-09
title: Zim-Sharr Perimeter Braziers & Sonic Resonator Wards
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Defense: Sonic-Resonator-Wards","Defense: Heavy-Harbor-Boom-Grid"]
requires: ["Material: Smelted-Alloy","Power: Compressed-Air-8Bar"]
culture_quadrant: Hierarchy / Clan
operational_profile: Protect / Stabilize
mtg_color: White / Blue
node_prerequisites:
  elevation: Any Perimeter, Coastal Wharf, or Frontier Gate
  water_source: None (requires sulfur-pitch or carbide fuel pipeline)
  power_tier: Tactical Bastion Rank 1+
standalone_fallback: "Usable as the primary perimeter defense system for any isolated frontier outpost, border garrison, or quarantine encampment surrounded by airborne predators, plague swarms, or miasmic beasts. In low-tech or low-magic settings, replace resonant sonic crystals with rhythmic bronze bell towers and replace chemical fuel with heavy sulfur-tallow smudge pots."

injected_mechanics:
  output_dial:
    level_1: "Flickering Pilot Flame - Smoldering sulfur embers; 15-ft perimeter aura; barely repels solitary scouts."
    level_2: "Standard Blue Burn - Continuous turquoise flame curtain; 30-ft repellent radius; deters minor swarms."
    level_3: "High-Pressure Blast - Overdriven kerosene/carbide feed; blinding azure glare and screeching resonant tone; repels mega-swarms and aerial breaches."
    level_4: "Thermal Conflagration / Sonic Rupture - Brazier casting cracks; burning pitch floods perimeter trench; quartz resonator shatters."
  threat_clocks:
    fuel_depletion: "Brazier Fuel Clock [4 Ticks] - Consumes 1 Fuel Unit per watch; tick accelerates during high winds."
    nozzle_corrosion: "Sulfur Clogging Clock [4 Ticks] - Slag build-up narrows gas feed; requires manual brass scraping."
  yields_resource: "Perimeter Atmospheric Containment, Scent-Stripping Blue Pitch & Resonant Perimeter Wards"
---

# MODULE INFRA-09: ZIM-SHARR PERIMETER BRAZIERS & SONIC RESONATOR WARDS

### 1. Mechanical & Atmospheric Architecture

This specialized containment and perimeter defense module combines chemical olfactory repulsion with acoustic barrier frequencies, safeguarding civilized nodes from predatory ecological vectors.

* **Cast-Iron Hanging Braziers:** Heavy, perforated cast-iron fire-pots suspended on swivel cranes over perimeter trenches, palisades, and harbor piers. Fueled by rendered sulfur-pitch or acetylene piped from central distillers (`INFRA-03`, `INFRA-05`).
* **The Turquoise Flame:** When fueled with refined pitch or cobalt-dusted oil, the combustion produces a low-temperature, pungent blue flame whose chemical vapor paralyzes the sensory antennae of airborne parasites and swarm bio-predators.
* **Tuned Sonic Resonator Pylons:** Cast bronze horn pylons or quartz menhirs (`INFRA-07`) driven by wind vanes or steam whistles. Emits a continuous, sub-audible mechanical drone (18–22 kHz) that disorients swarm flight vectors and drives apex predators away from the barrier line.

### 2. GM Socket Placement & Supply Synergy

* **Input Dependency:** Relies on continuous fuel shipments—either pitch and distillate from swamp refineries (`INFRA-05`), carbide gas (`INFRA-03`), or tallow rations from agrarian settlements.
* **Output Transmission:** Produces portable **Zim-Sharr Torches** (handheld blue-flame torches granting a personal 15-foot repellent aura for 4 hours) and **Lung-Wash Salve** (a sulfur-menthol chest balm that prevents aerosol poisoning).
* **Tactical Chokepoint:** Extinguishing or sabotaging a node's braziers instantly lowers the node's perimeter defenses, triggering an immediate predatory incursion.

### 3. Vague Game Mechanics & Emergent Scenarios

* **The Blue Path Navigation:** In nodes enveloped by thick fog or toxic fumes, travel is only safe along paved lanes flanked by active Zim-Sharr braziers (the "Blue Path"). Stepping more than 10 paces outside the illumination exposes travelers to immediate ecological hazards.
* **Fuel Strain Clock:** If fuel shipments are interrupted, the GM starts a 4-tick Fuel Depletion Clock. At Tick 3, braziers sputter to Level 1; at Tick 4, outer perimeter gates are breached by roaming fauna.
* **Sabotage Hook:** Sympathizers of rival syndicates or wild cults may attempt to pour brackish water or alkaline vinegar into the central fuel cistern, extinguishing the flame barrier during a scheduled shift change.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
