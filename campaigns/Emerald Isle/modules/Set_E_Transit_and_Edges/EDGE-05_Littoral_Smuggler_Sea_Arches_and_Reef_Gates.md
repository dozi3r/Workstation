---
id: EDGE-05
title: Littoral Smuggler Sea Arches & Reef Gates
set: Set E (Transit & Edges)
tier: Tier 2 (Topological & Edge Transit Corridor)
pipeline_tier: 2
provides: ["Transit: Submerged-Smuggler-Reef-Siphon"]
requires: ["Geography: Littoral-Reef-Anchorage"]
culture_quadrant: Market / Adhocracy
operational_profile: Deliver / Service
mtg_color: Blue / Black
edge_prerequisites:
  environment: Rocky Marine Coastline, Sea Caves, or Volcanic Archipelago
  nautical_craft: Shallow-Draft Skiffs, Rowed Galleasses, or Smuggler Cutters
standalone_fallback: "Can bridge two coastal beach/cove nodes by sea, subject to tidal timing clocks."

injected_mechanics:
  tidal_gate_dial:
    level_1: "High Tide Surge - Sea arches flooded to ceiling; impassable to masted vessels."
    level_2: "Navigable Slack Water - 4-hour window; calm clear channels; safe transit."
    level_3: "Low Tide Volcanic Teeth - Razor reefs breach surface; requires local pilot (2d6)."
    level_4: "Black-Water Breakers - Gale surf hammers caves; ships crushed against basalt walls."
  threat_clocks:
    hull_breach_clock: "Keel Grinding Clock [3 Ticks] - Unpiloted ships accumulate hull damage."
    corsair_patrol_clock: "Smuggler Ambush Clock [4 Ticks] - Pirate cutters intercept unauthorized traffic."
  yields_resource: "Contraband Coastal Bypassing of Imperial Outposts & Underwater Sea Cave Access"
---

# MODULE EDGE-05: LITTORAL SMUGGLER SEA ARCHES & REEF GATES

### 1. Maritime Edge Architecture

The clandestine maritime channels connecting isolated coves, beaches, and island harbors along the black ocean perimeter.

* **Submerged Navigation Gates:** Natural tunnels hollowed out by pounding surf through headland cliffs, concealed behind crashing breakers.
* **Tidal Window Mechanics:** Sea arches can only be navigated during a 4-hour window between low and high tide. At high tide, the cave ceilings submerge; at low tide, razor-sharp volcanic pinnacles tear out ship bottoms.
* **Boom Chains & Net Traps:** Corsairs maintain submerged iron boom chains across cave mouths that can be winched taut to snag passing rudders.

### 2. GM Edge Placement & Nautical Smuggling
* **Bypassing Land Taxes:** Allows players to bypass all land-based chokepoints and customs garrisons by boat, in exchange for paying a smuggler pilot 20 Silver Links or passing a difficult Seamanship check.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
