---
id: "MOD_T4_REFUGEE_EXODUS_COLUMN"
title: "The 800 Refugees of Pax Tharkas & The Traitor Within"
set: "Set_2_Autumn_Twilight"
tier: "Tier 4"
pipeline_tier: 4
provides: ["dwarven_heavy_infantry"]
requires: ["liberated_800_refugees"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "WG"
summary: "Moving settlement of 800 freed Solace men, women, and children trekking into the Kharolis Mountains while Eben Shatterstone secretly signals Red Wing pursuers (`Q_WIN_01`, `CRUC-12`)."
standalone_fallback: "Refugees fortify a hidden mountain box-canyon while scouts search for Thorbardin."
injected_mechanics:
  output_dial:
    level_1: "Jubilant liberation march out of burning Pax Tharkas"
    level_2: "Ration shortages and winter storms in the foothills"
    level_3: "Eben Shatterstone steals the Helm of Grallen"
    level_4: "Desperate stand at the gates of Thorbardin"
  threat_clocks:
    refugee_column_discovery: "Refugee Column Discovery Clock [6 Ticks] - Advances when campfires or Eben's signals alert Red Wing dragons."
  yields_resource: "dwarven_heavy_infantry"
---

# MODULE MOD_T4_REFUGEE_EXODUS_COLUMN: THE 800 REFUGEES OF PAX THARKAS & THE TRAITOR WITHIN

## Granular Disposition Baseline ([3, 1, 3])

### 1. Executive Summary & Egri Premise
Moving settlement of 800 freed Solace men, women, and children trekking into the Kharolis Mountains while Eben Shatterstone secretly signals Red Wing pursuers (`Q_WIN_01`, `CRUC-12`).

- **Pipeline Tier:** Tier 4
- **Provides:** `dwarven_heavy_infantry`
- **Requires:** `liberated_800_refugees`
- **Standalone Fallback:** Refugees fortify a hidden mountain box-canyon while scouts search for Thorbardin.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Crying infants wrapped in ragged blankets, squeaking handcarts, and Elistan's evening prayers.
- **Behaviors:** Families sharing meager rations while Eben slips away to the ridge at night.
- **Relationships:** Tanis and Riverwind rationing food while Goldmoon tends the sick.
- **Attitudes:** Fragile hope tested by hunger.
- **Values:** Leaving no family behind.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Elistan, Goldmoon & The Refugee Council
* **Main Opponent:** Pursuing Red Dragonarmy Vanguard
* **Thematic Shadow:** Eben Shatterstone (Paid Informant, `CRUC-12`)
* **Tertiary Outcast:** Brian Donner & Fever-Stricken Elders

### 4. Severance & Escalation Threat Clock
- **Refugee Column Discovery Clock [6 Ticks]:** Advances when campfires or Eben's signals alert Red Wing dragons.

### Key Personnel (NPC Prototypes)
- name: "Elistan, Goldmoon & The Refugee Council"
  role: "Establishment"
  disposition: "[3, 1, 2]"
  motivation: "Pushes the module toward: Jubilant liberation march out of burning Pax Tharkas"
- name: "Pursuing Red Dragonarmy Vanguard"
  role: "Main Opponent"
  disposition: "[4, 1, 3]"
  motivation: "Pushes the module toward: Ration shortages and winter storms in the foothills"
- name: "Eben Shatterstone"
  role: "Thematic Shadow"
  disposition: "[3, 2, 4]"
  motivation: "Pushes the module toward: Eben Shatterstone steals the Helm of Grallen"
- name: "Brian Donner & Fever-Stricken Elders"
  role: "Tertiary Outcast"
  disposition: "[4, 2, 4]"
  motivation: "Pushes the module toward: Desperate stand at the gates of Thorbardin"
