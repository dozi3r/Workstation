---
id: ECOL-02
title: Razor-Sedge Plains & Narcotic Poppy Basins
set: Set B (Ecology & Biomes)
tier: Tier 2 (Topological & Biome Anchor)
pipeline_tier: 2
provides: ["Material: Phosphorescent-Spores","Chem: Sulfur-Alkaloid-Extracts"]
requires: ["Ecology: Toxic-Sulfur-Bog"]
culture_quadrant: Adhocracy / Clan
operational_profile: Service / Produce
mtg_color: Green / Red
node_prerequisites:
  terrain: Lowland Steppe, Dry Alluvial Plains, or Savanna Basin
  flora: Lacerating Grasses & Wild Opiate Flora
standalone_fallback: "Can manifest as an isolated weed patch around a farmstead; slows foot travel by half but lacks roving Axe Beak predators."

injected_mechanics:
  terrain_peril_dial:
    level_1: "Dry Scrub - Stiff weeds; mild scratches; normal movement speed."
    level_2: "Razor-Sedge Thicket - Halved movement speed; unarmored travelers take 1 bleed/hr."
    level_3: "Heavy Narcotic Basin - Dense poppy pollen mist; requires Stamina save (2d6) or sleep."
    level_4: "Savage Predation Ground - Axe Beak breeding grounds; razor grass conceals hunting packs."
  threat_clocks:
    poppy_somnolence_clock: "Pollen Sleep Clock [4 Ticks] - Prolonged exposure leads to comatose stupor."
  yields_resource: "Wild Opiate Sap, Axe Beak Feathers & Razor-Grass Cordage"
---

# MODULE ECOL-02: RAZOR-SEDGE PLAINS & NARCOTIC POPPY BASINS

### 1. Botanical Profile

A rolling sea of predatory prairie flora that punishes unarmored travelers and disorients sensory perception.

* **Razor-Sedge (The Lacerating Grass):** Tough, silica-sheathed grass stalks that slice like razor blades against exposed flesh, unlined boots, or pack animal tendons.
* **Wild Narcotic Poppy Basins:** Low-lying depressions where heavy, sweet, crimson-purple flowers release dense pollen at dawn and dusk, creating a natural anesthetic fog.
* **Ghost-Wheat:** Pale, silver-hued grain growing in scattered patches that radiates unnatural ground-level cold, masking mammalian heat signatures from flying predators.

### 2. Endemic Predators: The Axe Beak Pack
* **Apex Avian Hunters:** 8-foot-tall flightless carnivorous birds that sprint at 30 MPH through the razor grass.
* **Pack Tactics:** Drive prey into dense poppy hollows where victims succumb to sleep before being torn apart.

### 3. Vague Game Mechanics
* **Unarmored Transit:** Crossing off-trail without greaves or heavy leather inflicts 1 bleeding damage per hour and halves overland movement.
* **Poppy Resin:** Harvesting the sap yields raw opiate gum (acts as a potent painkiller or sedative; highly valued in Outpost barter).

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
