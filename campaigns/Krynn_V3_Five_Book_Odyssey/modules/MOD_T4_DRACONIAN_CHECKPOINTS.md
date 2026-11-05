---
id: "MOD_T4_DRACONIAN_CHECKPOINTS"
title: "Hooded Draconian Checkpoints & Death-Throes Ecology"
set: "Set_2_Autumn_Twilight"
tier: "Tier 4"
pipeline_tier: 4
provides: ["abanasinia_rumor_network"]
requires: []
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "BR"
summary: "Roadblock and ambush network across Abanasinia introducing the five Draconian sub-types and their lethal death-throes (Baaz petrification trapping swords, Kapak acid pools, Bozak bone-detonations, Sivak shape-stealing, Aurak arcane blasts)."
standalone_fallback: "Patrols operate autonomously along all major transit corridors."
injected_mechanics:
  output_dial:
    level_1: "Disguised \"hooded men\" asking questions at crossroads taverns"
    level_2: "Open roadblocks seizing weapons and steel coins"
    level_3: "Blade-trapping Baaz and venom-blade Kapak kill-squads"
    level_4: "Elite Bozak and Sivak hunter-packs with wyvern air support"
  threat_clocks:
    draconian_road_dragnet: "Draconian Road Dragnet Clock [6 Ticks] - Advances whenever checkpoints are alerted or survivors escape."
  yields_resource: "abanasinia_rumor_network"
---

# MODULE MOD_T4_DRACONIAN_CHECKPOINTS: HOODED DRACONIAN CHECKPOINTS & DEATH-THROES ECOLOGY

## Granular Disposition Baseline ([1, 1, 3])

### 1. Executive Summary & Egri Premise
Roadblock and ambush network across Abanasinia introducing the five Draconian sub-types and their lethal death-throes (Baaz petrification trapping swords, Kapak acid pools, Bozak bone-detonations, Sivak shape-stealing, Aurak arcane blasts).

- **Pipeline Tier:** Tier 4
- **Provides:** `abanasinia_rumor_network`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Patrols operate autonomously along all major transit corridors.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Coarse monk robes hiding brassy scales, reptilian snouts, and the clack of stone statues crumbling to dust.
- **Behaviors:** Baaz patrols demanding "the blue crystal staff" at bridges and inns.
- **Relationships:** Fewmaster Toede whipping goblins forward while draconians answer only to Verminaard.
- **Attitudes:** Cruel predatory discipline.
- **Values:** Hunt and capture.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Baaz & Kapak Checkpoint Squads
* **Main Opponent:** Travelers & Companions on the Solace Roads
* **Thematic Shadow:** Sivak Shapeshifters Mimicking Slain Victims
* **Tertiary Outcast:** Terrified Local Ferrymen & Woodcutters

### 4. Severance & Escalation Threat Clock
- **Draconian Road Dragnet Clock [6 Ticks]:** Advances whenever checkpoints are alerted or survivors escape.

### Key Personnel (NPC Prototypes)
- name: "Baaz & Kapak Checkpoint Squads"
  role: "Establishment"
  disposition: "[1, 1, 2]"
  motivation: "Pushes the module toward: Disguised \"hooded men\" asking questions at crossroads taverns"
- name: "Travelers & Companions on the Solace Roads"
  role: "Main Opponent"
  disposition: "[2, 1, 3]"
  motivation: "Pushes the module toward: Open roadblocks seizing weapons and steel coins"
- name: "Sivak Shapeshifters Mimicking Slain Victims"
  role: "Thematic Shadow"
  disposition: "[1, 2, 4]"
  motivation: "Pushes the module toward: Blade-trapping Baaz and venom-blade Kapak kill-squads"
- name: "Terrified Local Ferrymen & Woodcutters"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 4]"
  motivation: "Pushes the module toward: Elite Bozak and Sivak hunter-packs with wyvern air support"
