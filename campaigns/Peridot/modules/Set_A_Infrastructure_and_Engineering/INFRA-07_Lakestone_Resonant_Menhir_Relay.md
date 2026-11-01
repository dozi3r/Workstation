---
id: INFRA-07
title: Lakestone Resonant Menhir Radio Relay
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Signal: Resonant-Menhir-Relay","Chem: Refined-Salt-and-Bromine","Water: Distilled-Potable-Water"]
requires: ["Geography: Deep-Brine-Well","Signal: Freewave-HF-Radio"]
culture_quadrant: Hierarchy / Clan
operational_profile: Deliver / Design
mtg_color: White / Blue
node_prerequisites:
  terrain: Elevated Glacial Lake Shore or Leyline Nexus
  monument: Prehistoric Resonant Standing Stone (Megalithic Menhir)
  grounding: Heavy Copper Grounding Rods Sunk into Deep Water
standalone_fallback: "Without radio equipment, functions purely as a mystical sonic resonator; grants advantage on concentration checks and divination spells within 100 yards."

injected_mechanics:
  resonance_multiplier_dial:
    level_1: "Dormant Monolith - Natural stone; no electrical amplification."
    level_2: "Grounded Antenna - Doubles transmission range of connected transceivers."
    level_3: "High-Q Resonance - Flawless island-wide broadcast clarity; cuts through storm static."
    level_4: "Sonic Cavitation - Standing stone hums audibly; shatters nearby glass; induces migraines."
  threat_clocks:
    copper_cable_sabotage: "Grounding Cable Sabotage Clock [4 Ticks] - Divers cutting underwater cables."
  yields_resource: "Island-Wide Signal Amplification & Unidirectional Downstream Pressure"
---

# MODULE INFRA-07: LAKESTONE RESONANT MENHIR RADIO RELAY

### 1. Acoustic & Electronic Architecture

A fusion of prehistoric megalithic resonance and modern copper grounding that serves as the central telecommunications repeater for the entire island.

* **The Resonant Menhir:** A 30-foot polished granite standing stone rich in natural piezoelectric quartz veins, erected on high ground overlooking deep mountain waters.
* **Copper Grounding Lattice:** Heavy copper straps bolted to the stone's base and submerged deep into the lakebed, turning the entire glacial water body into a gigantic grounding plane.
* **The Repeater Rig:** Artificers tap radio antennas directly into the stone's quartz veins, using the megalith's acoustic geometry to amplify weak signals across mountain ranges without requiring high dynamo wattage.

### 2. GM Socket Placement & Asymmetric Influence
* **Synergy with Freewave Radios (`INFRA-06`):** Any radio transmitter operating within 100 yards of the Lakestone automatically broadcasts at **Level 3 (Clear Broadcast)** across the entire campaign network.
* **Asymmetric Downstream Pressure:** Controlling the Lakestone grants direct eavesdropping and signal dominance over all downstream valleys and coastal ports.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
