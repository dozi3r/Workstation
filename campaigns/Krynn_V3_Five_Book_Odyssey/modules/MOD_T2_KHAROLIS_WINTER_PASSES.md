---
id: "MOD_T2_KHAROLIS_WINTER_PASSES"
title: "The Kharolis Blizzard Passes & Vitrified Skullcap"
set: "Set_3_Winter_Night"
tier: "Tier 2"
pipeline_tier: 2
provides: ["helm_of_grallen_relic","thorbardin_secret_gate_map"]
requires: []
culture_quadrant: "Clan"
operational_profile: "Design"
mtg_color: "RW"
summary: "Lethal high-altitude winter mountain passes haunted by the spectral Dwarfgate legions around Fistandantilus's melted skull-fortress (`Q_WIN_01`, `CRUC-12`)."
standalone_fallback: "Freezing exposure and spectral guardians persist across the mountain trails year-round."
injected_mechanics:
  output_dial:
    level_1: "Bitter mountain frost slowing wagon movement"
    level_2: "Eben's trail-markers drawing draconian outriders"
    level_3: "Spectral Dwarfgate phalanxes awakening around Skullcap"
    level_4: "Full Red Wing pincer ambush in the snow pass"
  threat_clocks:
    refugee_frostbite_attrition: "Refugee Frostbite & Attrition [6 Ticks] - Advances each day the 800 refugees remain outside Thorbardin's gates."
  yields_resource: "helm_of_grallen_relic, thorbardin_secret_gate_map"
---

# MODULE MOD_T2_KHAROLIS_WINTER_PASSES: THE KHAROLIS BLIZZARD PASSES & VITRIFIED SKULLCAP

## Granular Disposition Baseline ([3, 1, 1])

### 1. Executive Summary & Egri Premise
Lethal high-altitude winter mountain passes haunted by the spectral Dwarfgate legions around Fistandantilus's melted skull-fortress (`Q_WIN_01`, `CRUC-12`).

- **Pipeline Tier:** Tier 2
- **Provides:** `helm_of_grallen_relic`, `thorbardin_secret_gate_map`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Freezing exposure and spectral guardians persist across the mountain trails year-round.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Howling whiteout blizzards, green vitrified glass crags, and phantom battle-cries in the snow.
- **Behaviors:** 800 shivering Solace refugees huddling around pine-needle fires while Eben marks rocks.
- **Relationships:** Elistan holding refugee morale together while Tanis and Flint hunt for Thorbardin's gate.
- **Attitudes:** Desperate endurance against starvation and betrayal.
- **Values:** Communal survival.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Spectral Guardians of Derkin's Tomb & Skullcap
* **Main Opponent:** Red Dragonarmy Pursuit Columns
* **Thematic Shadow:** Eben Shatterstone (Internal Traitor, `CRUC-12`)
* **Tertiary Outcast:** 800 Starving Pax Tharkas Refugees

### 4. Severance & Escalation Threat Clock
- **Refugee Frostbite & Attrition [6 Ticks]:** Advances each day the 800 refugees remain outside Thorbardin's gates.

### Key Personnel (NPC Prototypes)
- name: "Spectral Guardians of Derkin's Tomb & Skullcap"
  role: "Establishment"
  disposition: "[3, 1, 1]"
  motivation: "Pushes the module toward: Bitter mountain frost slowing wagon movement"
- name: "Red Dragonarmy Pursuit Columns"
  role: "Main Opponent"
  disposition: "[4, 1, 1]"
  motivation: "Pushes the module toward: Eben's trail-markers drawing draconian outriders"
- name: "Eben Shatterstone"
  role: "Thematic Shadow"
  disposition: "[3, 2, 2]"
  motivation: "Pushes the module toward: Spectral Dwarfgate phalanxes awakening around Skullcap"
- name: "800 Starving Pax Tharkas Refugees"
  role: "Tertiary Outcast"
  disposition: "[4, 2, 3]"
  motivation: "Pushes the module toward: Full Red Wing pincer ambush in the snow pass"
