---
id: EDGE-01
title: The Canyon Road Fatal Funnel Chokepoint
set: Set E (Transit & Edges)
tier: Tier 2 (Topological & Edge Transit Corridor)
pipeline_tier: 2
provides: ["Transit: Chokepoint-Gorge-Highway"]
requires: ["Geography: Deep-Canyon-Corridor"]
culture_quadrant: Market / Adhocracy
operational_profile: Service / Deliver
mtg_color: Red / Black
edge_prerequisites:
  terrain: Narrow Sunken Canyon, River Gorge, or Mountain Pass
  flanking: Vertical Cliffs on Both Flanks (minimum 200 ft height)
standalone_fallback: "Can bridge ANY two interior mountain nodes as a perilous bottleneck pass."

injected_mechanics:
  chokepoint_peril_dial:
    level_1: "Open Valley Road - Gentle river banks; minor gravel washouts; peaceful passage."
    level_2: "Narrowing Gorge - Cobblestone road pinches to single-wagon width; bandit toll gate."
    level_3: "The Fatal Funnel - 10-ft gap between 800-ft cliffs; pre-rigged boulder deadfalls."
    level_4: "Flash Flood Surge - Mountain whitewater submerge the roadway; 100% drowning hazard."
  threat_clocks:
    ambush_deadfall_clock: "Rockfall Trigger Clock [3 Ticks] - Tripwires release tons of granite rubble."
    toll_extortion_clock: "Toll Master Hostility [4 Ticks] - Unpaid tolls lead to volley fire from cliff embrasures."
  yields_resource: "Overland Transit Between North and South Hubs, Toll Bullion & Ambush Loot"
---

# MODULE EDGE-01: THE CANYON ROAD FATAL FUNNEL CHOKEPOINT

### 1. Edge Transit Architecture

The primary arterial passage connecting the northern alpine highlands with the southern coastal lowlands before emergent coastal roads are paved.

* **Physical Corridor:** A 50-mile sunken limestone canyon carved by a violent mountain river, flanked by sheer 800-foot vertical cliffs.
* **The Fatal Funnel:** At three distinct points, the canyon walls pinch together to a width of just 10 feet. Traveling freight wagons cannot turn around and must advance in single file.
* **Ambush Infrastructure:** Mercenary toll syndicates man fortified stone gatehouses built directly across the gorge, backed by ballistas and pre-rigged boulder deadfalls suspended from cliff overhangs.

### 2. GM Edge Placement & Tactical Rules
* **Placement:** Connects any two nodes separated by an elevation spine or mountain range.
* **Ambush Mechanics:** Attackers firing down from cliff embrasures gain **+4 Cover**, ignore line-of-sight penalties, and roll attacks with Advantage against targets pinned in the funnel.
* **Toll Negotiations:** Standard toll is **10 Silver Links per head, 50 per freight wagon**. Refusing payment advances the Toll Master Hostility clock to open volley fire.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
