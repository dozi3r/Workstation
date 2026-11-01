---
id: CWT-030
title: Terraced Hydroponic Rice Flumes & Silt Fisheries
set: Wave 3 Biological Life-Support (Tier 2)
tier: Tier 2 (Linear Corridors & Production Infrastructure)
pipeline_tier: 2
provides: ["Food: Staple-Grain-and-Protein", "Water: Filtered-Agricultural-Effluent"]
requires: ["Water: Feedstock-Cistern", "Hydraulics: Industrial-Tailrace-Flow"]
culture_quadrant: Clan / Market
operational_profile: Design / Deliver
mtg_color: Green / Blue
standalone_fallback: "If upstream industrial tailrace flow is severed, the flume bailiffs engage gravity-fed rainwater retention cisterns and manual bamboo bucket treadmills, keeping the silt carp alive and yielding subsistence rations at Light Tier."
injected_mechanics:
  output_dial:
    level_1: "Subsistence Rations - Slender green shoots; rationed bowls of steamed carp and salty duckweed mash (Light Tier, DC 10 Con)."
    level_2: "Bountiful Flume Harvest - Crisp river greens, fat armored bottom-feeders, surplus sun-dried grain sacks for trade (Moderate Tier, DC 13 Wis)."
    level_3: "Algal Rot & Silt Stagnation - Stagnant flumes choke on stringy green algae; carp float belly-up; foul stench nauseates laborers (Severe Tier, DC 16 Con / 4d10 poison)."
    level_4: "Carbide Slag Contamination - Upstream runoff saturates flumes with chemical sulfur; entire regional crop rots into toxic black sludge (Lethal Tier, DC 20 Con / 8d12 acid)."
  threat_clocks:
    crop_blight: "Crop Blight Contamination Clock [4 Ticks] - Chemical toxins and parasitic rot advance downstream terrace by terrace."
    silt_siphon: "Silt Siphon Clog Clock [6 Ticks] - River sediments pack intake valves, choking hydraulic flow."
  yields_resource: "Staple Grain Bundles, Smoked Silt Carp, Greywater Effluent"
---

# MODULE CWT-030: TERRACED HYDROPONIC RICE FLUMES & SILT FISHERIES

### 1. Mechanical Architecture & Agricultural Loop
Stretching across a half-mile amphitheater of carved slate hillside, the flumes represent an ingenious closed-loop caloric engine. Sluice gates tap descending river channels, guiding silty runoff through tiered paddies banked with interwoven willow wattle and volcanic stone. In the upper pools, heirloom short-grain rice drinks mineral nutrients; in the deeper lower troughs, thousands of armored river carp graze on falling plant detritus while oxygenating water for the next terrace below.

* **The Gravity Step Sluices:** Seven stepped tiers of flooded stone terraces. Water drops from one tier to the next over notched timber weirs, driving crude bamboo aeration churns.
* **The Silt-Trap Siphons:** Sluice gates capture fertile topsoil before it washes out to sea, allowing dredging crews to shovel rich organic muck directly back into grain roots.
* **Aquacultural Interlock:** Droppings from sixty thousand river carp serve as nitrate fertilizer, eliminating the need for imported alchemical guano.

### 2. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Water-Bailiff Clan):** An insular matriarchal lineage wielding notched brass measuring rods. They control the weir gates, apportioning liters of water based on ancestral hereditary ledgers and bloodline seniority.
* **Main Opponent (Upstream Industrial Tanneries & Foundries):** Machine shops that view the river as an open gutter. When night falls, their night-shifts dump caustic lye and heavy hydrocarbon sludge into the feeder streams, killing downstream fry.
* **Thematic Shadow (The Grain-Hoarding Syndicate):** Merchants who own the dry stone cavern silos along the riverbank. They secretly fund sabotage against the bailiffs' weirs to manufacture artificial local famines and quadruple grain margins.
* **Tertiary Outcast (The Fish-Dredge Untouchables):** Pariah laborers living in stilt hovels directly over the drainage gutters. Permanently soaked in foul greywater, they dive naked into freezing suction culverts to unblock debris before the terraces burst.

### 3. GM Placement & Tactical Synergies
* **Placement:** Recommended on **Node 06 (Lower River Basin)**, **Node 08 (Tiered Hillside Terraces)**, or any agrarian transit seam between an industrial hub and a lowland population node.
* **Supply Chain Interlocks:** Consumes `Water: Feedstock-Cistern` and `Hydraulics: Industrial-Tailrace-Flow`; outputs `Food: Staple-Grain-and-Protein` and `Water: Filtered-Agricultural-Effluent` (ideal for downstream textile mills or municipal wells).
* **Standalone Fallback:** If severed from outside feeder ditches, the bailiffs seal the emergency clay dams, recycling water between the lowest three carp pools with hand treadmills to keep basic rations flowing.
