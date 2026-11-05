---
id: "MOD_T3_AGHAR_LIFT_HYDRAULICS"
title: "The Great Chain Lift & Express Chutes of Xak Tsaroth"
set: "Set_2_Autumn_Twilight"
tier: "Tier 3"
pipeline_tier: 3
provides: ["aghar_express_chute_access"]
requires: []
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "RG"
summary: "Precarious counterfactual pulley-lift and slick trash-chute network maintained by the Aghar gully dwarves across the vertical tiers of sunken Xak Tsaroth (`Q_AUT_02`, `CRUC-28`)."
standalone_fallback: "Counterweight buckets operate manually via gully dwarf crank-teams."
injected_mechanics:
  output_dial:
    level_1: "Creaking bucket lift operating normally between cavern tiers"
    level_2: "Express chute bypass dropping travelers straight to the library"
    level_3: "Overloaded chain straining under 85 lbs of Platinum Disks"
    level_4: "Emergency counterweight release flinging the cage to the surface"
  threat_clocks:
    lift_chain_structural_failure: "Lift Chain Structural Failure [6 Ticks] - Advances when heavy loads or acid splashes corrode the main hoist."
  yields_resource: "aghar_express_chute_access"
---

# MODULE MOD_T3_AGHAR_LIFT_HYDRAULICS: THE GREAT CHAIN LIFT & EXPRESS CHUTES OF XAK TSAROTH

## Granular Disposition Baseline ([3, 3, 2])

### 1. Executive Summary & Egri Premise
Precarious counterfactual pulley-lift and slick trash-chute network maintained by the Aghar gully dwarves across the vertical tiers of sunken Xak Tsaroth (`Q_AUT_02`, `CRUC-28`).

- **Pipeline Tier:** Tier 3
- **Provides:** `aghar_express_chute_access`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Counterweight buckets operate manually via gully dwarf crank-teams.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Shrieking un-oiled iron links, rusted ore-buckets, and grease-slick stone chutes.
- **Behaviors:** Gully dwarves counting "one, two, many" while pulling levers at random.
- **Relationships:** Bupu guiding the Companions past Highbulp Phudge's guards.
- **Attitudes:** Chaotic mechanical improvisation.
- **Values:** Fast vertical escape.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Highbulp Phudge I's Lift Operators
* **Main Opponent:** Pursuing Baaz & Kapak Draconian Squads
* **Thematic Shadow:** Collapsing Cavern Ceiling (`CRUC-28`)
* **Tertiary Outcast:** Bupu & Tasslehoff Burrfoot at the Winch

### 4. Severance & Escalation Threat Clock
- **Lift Chain Structural Failure [6 Ticks]:** Advances when heavy loads or acid splashes corrode the main hoist.

### Key Personnel (NPC Prototypes)
- name: "Highbulp Phudge I's Lift Operators"
  role: "Establishment"
  disposition: "[3, 3, 1]"
  motivation: "Pushes the module toward: Creaking bucket lift operating normally between cavern tiers"
- name: "Pursuing Baaz & Kapak Draconian Squads"
  role: "Main Opponent"
  disposition: "[4, 3, 2]"
  motivation: "Pushes the module toward: Express chute bypass dropping travelers straight to the library"
- name: "Collapsing Cavern Ceiling"
  role: "Thematic Shadow"
  disposition: "[3, 4, 3]"
  motivation: "Pushes the module toward: Overloaded chain straining under 85 lbs of Platinum Disks"
- name: "Bupu & Tasslehoff Burrfoot at the Winch"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 4]"
  motivation: "Pushes the module toward: Emergency counterweight release flinging the cage to the surface"
