---
id: INFRA-05
title: Swamp Mist-Maker Poles & Alchemical Pitcher Distillery
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Power: Compressed-Air-8Bar","Bio: Scent-Stripping-Mist"]
requires: ["Geography: Marine-Tidal-Flume"]
culture_quadrant: Market / Adhocracy
operational_profile: Produce / Service
mtg_color: Black / Green
node_prerequisites:
  environment: Mangrove Swamp, Brackish Wetland, or Mire Border
  botanical_resource: Carnivorous Pitcher Plants or Glandular Flora
  timber: Swamp Cypress or Rotted Cedar Columns
standalone_fallback: "Can function as handheld atomizers or portable smudge pots; creates localized 10-foot clouds lasting 10 minutes rather than continuous regional perimeter mist."

injected_mechanics:
  mist_density_dial:
    level_1: "Dissipated Ground Haze - Strips scent within 5 feet; heat signatures visible."
    level_2: "Dense Veiled Mist - Complete olfactory masking; strips hemoglobin scent from stirges."
    level_3: "Thermal Blur Fog - Heavy chemical aerosols confuse stirge compound heat-vision."
    level_4: "Suffocating Miasma - Zero visibility; masks travel entirely; requires breathing masks."
  threat_clocks:
    pole_wick_fouling: "Wick Fouling Clock [4 Ticks] - Algae and silt clog passive evaporative wicks."
    blue_rot_resin_spoilage: "Enzyme Spoilage Clock [6 Ticks] - Unstabilized pitcher fluid rots in 48h."
  yields_resource: "Scent-Stripping Aerosol, Zim-Sharr Torch Pitch & 'Lung-Wash' Doses"
---

# MODULE INFRA-05: SWAMP MIST-MAKER POLES & ALCHEMICAL PITCHER DISTILLERY

### 1. Wetland Alchemical Architecture

The organic camouflage system that enables survival in wetlands by chemically erasing human scent and heat from aerial predators.

* **Passive Brackish-Border Mist Poles:** Tall, hollow-slotted cedar trunks sunk along the water boundary. Capillary wicks draw alchemical brine up through solar chimneys, emitting continuous low-lying cool ground fog.
* **Active Pressurized Brass Atomizers:** Hand-pumped brass sprayers mounted to wooden watchtowers along boardwalks, spraying pressurized pitcher enzyme extracts into the air.
* **Pitcher Plant Distillation Shed:** Stilt-mounted workshop where secretions from giant carnivorous pitcher plants are boiled and refined into:
  * **Scent-Stripping Brine:** Destroys hemoglobin and sweat scent on skin and boots.
  * **Zim-Sharr Torches:** Heavy pitch torches burning with blue flame; repels $1\text{d}4$ swarms in a 30-foot radius for 4 hours.
  * **"Lung-Wash":** Caustic oral tonic halting Blue-Rot petrification progression for 24 hours.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Requires raw digestive fluid harvested from living wetland pitcher plants (`ECOL-04`).
* **Output Transmission:** Exports Zim-Sharr torches and Lung-Wash doses across the island in exchange for iron, salt, and grain.

### 3. Vague Game Mechanics
* **Olfactory Camouflage:** Travelers walking through active mist zones are completely undetectable to creatures tracking by scent or body heat.
* **Corrosive Acid-Mist Hazard:** The acidic spray accelerates metal wear; ungreased ferrous equipment accumulates 1 tick on the Iron-Blight clock per 6 hours.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
