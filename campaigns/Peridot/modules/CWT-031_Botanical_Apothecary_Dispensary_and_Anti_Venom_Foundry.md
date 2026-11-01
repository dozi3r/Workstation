---
id: CWT-031
title: Botanical Apothecary Dispensary & Anti-Venom Foundry
set: Wave 3 Biological Life-Support (Tier 3)
tier: Tier 3 (Crucible Workshops & Resource Refineries)
pipeline_tier: 3
provides: ["Bio: Concentrated-Blood-Alkaloids", "Medicine: Broad-Spectrum-Antitoxin"]
requires: ["Bio: Fungal-Toxin-Extract", "Glass: Pyrex-Distillation-Apparatus"]
culture_quadrant: Adhocracy / Bio-Science
operational_profile: Design / Deliver
mtg_color: Green / Black
standalone_fallback: "If specialized Pyrex glassware and imported serpent venoms are cut off, the apothecaries crush dried swamp willow bark in unglazed stone mortars, brewing astringent fever tea that manages pain and minor sepsis at Light Tier."
injected_mechanics:
  output_dial:
    level_1: "Crude Herbal Tinctures - Smelling salts, astringent willow decoctions, menthol chest balms (Light Tier, DC 10 Med)."
    level_2: "Refined Antivenom Serums - Distilled crystalline antivenoms and concentrated alkaloid injections; neutralizes lethal neurotoxins (Moderate Tier, DC 13 Med)."
    level_3: "Volatile Alembic Leak - Overheated glass retorts shatter; neurotoxic vapor floods the dispensary wards (Severe Tier, DC 16 Con / 4d10 poison)."
    level_4: "Hemorrhagic Pathogen Outbreak - Experimental fungal culture breaches glass isolation seals, spreading infectious necrotic fever (Lethal Tier, DC 20 Con / 8d12 necrotic)."
  threat_clocks:
    alembic_pressure: "Distillation Boiler Overpressure [4 Ticks] - Gas flames heat volatile ether solutions past condensing capacity."
    culture_contamination: "Bacterial Serum Contamination [4 Ticks] - Wild spores penetrate sheep-blood culture baths, corrupting whole batches."
  yields_resource: "Purified Antivenom Vials, Coagulant Bandages, Concentrated Blood Alkaloids"
---

# MODULE CWT-031: BOTANICAL APOTHECARY DISPENSARY & ANTI-VENOM FOUNDRY

### 1. Mechanical Architecture & Refining Foundry
Housed within a thick-walled vaulted stone laboratory smelling of chloroform, scorched moss, and boiling ether, the Foundry processes lethal biological venoms into life-preserving medicines. Rows of serpent terrariums and swamp-leech troughs line the lower vaults, where handlers milk gland secretions daily. In the upper refinery, bubbling glass fractions separate venom coagulants from neurotoxins, suspending pure antibodies in sheep-blood serum.

* **The Venom-Milking Pit:** Sunken stone arena where handlers extract raw secretions from giant pit-vipers, swamp mantises, and subterranean spore-centipedes.
* **The Fractional Distillation Array:** Intricate banks of hand-blown glass tubing and copper condensing coils heated by charcoal burners, fractioning raw bio-toxins by vapor density.
* **The Cold Serum Vault:** Sub-floor cellar cooled by natural cave ice, storing sealed ampoules of broad-spectrum antitoxins vital for frontier miners and shock troops.

### 2. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Licensed Apothecary Guild):** Scholarly monopolists who lock patented antidote formulas behind guild seals, charging exorbitant ransoms for life-saving injections during viper blooms.
* **Main Opponent (The Radical Street Herbalists):** Unsanctioned hedge-witches and radical students who steal guild venom samples to brew cheap, bootleg street remedies in tenement kitchens.
* **Thematic Shadow (The Black-Market Venom Cartel):** Reckless poachers smuggling aggressive breeding stock from untamed jungle corridors into city basements, caring nothing for accidental escapes.
* **Tertiary Outcast (The Venom-Immune Bleeders):** Impoverished day-laborers who subjected themselves to micro-dosed stings until their bodies developed natural antitoxins; the guild bleeds them weekly for their plasma while paying meager food rations.

### 3. GM Placement & Tactical Synergies
* **Placement:** Recommended on **Node 11 (Town Hospital & Alchemical Ward)**, **Node 14 (Marshland Outpost)**, or any urban settlement adjacent to perilous wilderness or underground mine corridors.
* **Supply Chain Interlocks:** Consumes `Bio: Fungal-Toxin-Extract` and `Glass: Pyrex-Distillation-Apparatus`; outputs `Bio: Concentrated-Blood-Alkaloids` (required by Tier 5 Climax Engines like CWT-010) and `Medicine: Broad-Spectrum-Antitoxin` (negates dungeon poison hazards).
* **Standalone Fallback:** If high-grade alchemical glass breaks, the practitioners fall back on crude open-air clay reduction bowls, providing reliable if slow symptom relief.
