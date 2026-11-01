---
id: ECOL-07
title: Siren Roosts & Volcanic Skerry Reefs
set: Set B (Ecology & Biomes)
tier: Tier 2 (Topological & Biome Anchor)
pipeline_tier: 2
provides: ["Hazard: Siren-Song-Hypnosis","Chem: Bio-Corrosive-Lichen-Acids"]
requires: ["Ecology: Volcanic-Skerry-Reefs"]
culture_quadrant: Adhocracy / Market
operational_profile: Service / Design
mtg_color: Blue / Black
node_prerequisites:
  environment: Rocky Coastal Littoral, Offshore Skerries, or Shipwreck Shallows
  fauna: Predatory Acoustic Sirens & Giant Crustaceans
standalone_fallback: "Can manifest as an isolated offshore rock stack with 2 Sirens; threatens only nearby rowboats and midnight swimmers."

injected_mechanics:
  littoral_danger_dial:
    level_1: "Calm Shallows - Gentle surf; broken galleon flotsam; safe beachcombing."
    level_2: "Submerged Razor Reefs - Volcanic teeth breach wooden keels; Giant Sea Crabs."
    level_3: "Active Siren Call - Hypnotic acoustic song drifting across water at dawn/dusk."
    level_4: "Tidal Surge Skerry Trap - 12-ft tidal wave traps sailors against vertical chalk cliffs."
  threat_clocks:
    siren_hypnosis_clock: "Song Trance Clock [3 Ticks] - Failed Will saves compel jumping into surf."
    hull_breach_clock: "Hull Grounding Clock [4 Ticks] - Unpiloted ships grind into reefs."
  yields_resource: "Shipwreck Flotsam, Siren Vocal Glands & Giant Crab Chitin"
---

# MODULE ECOL-07: SIREN ROOSTS & VOLCANIC SKERRY REEFS

### 1. Littoral Ecology & Acoustic Predators

A treacherous maritime coastline littered with jagged volcanic reefs, sunken galleon ribs, and predatory amphibious hunters.

* **Volcanic Skerry Sea-Stacks:** Black basalt needle rocks jutting 100 feet out of churning white surf, accessible only by skilled swimmers or clifftop ropes.
* **The Siren Packs:** Carnivorous amphibious humanoids with iridescent scales and bioluminescent throat sacs. At dusk and during sea-fog, they sing complex harmonic frequencies that resonate in mammalian eardrums.
* **Giant Sea Crabs:** 12-foot armored scavengers burrowed beneath wet beach gravel, emerging at high tide to crush flotsam and drowning sailors.

### 2. GM Socket Placement & Navigation Hazards
* **Ship Approach Barrier:** Placing this socket along a coastal node forces ships to navigate treacherous channels or hire local smuggler pilots (`EDGE-05`).
* **Salvage Diving:** The sea floor around the reefs contains chests of soaked coins, preserved timber, and brass navigational tools from failed colonial expeditions.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
