---
id: "MOD_T2_BLOOD_SEA_VORTEX"
title: "The Blood Sea of Istar Maelstrom & Drowned Ruins"
set: "Set_4_Spring_Dawning"
tier: "Tier 2"
pipeline_tier: 2
provides: ["black_robe_transfiguration","berem_everman_revelation"]
requires: ["perechon_smuggler_berth"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "UR"
summary: "Perpetual arterial-red whirlpool above the sunken Cataclysm crater of Istar, pulling ships down into the Dargonesti sea-elf ruins (`Q_SPR_01`)."
standalone_fallback: "Red silt storms and corsair patrols hazard all shipping between Flotsam and Kalaman."
injected_mechanics:
  output_dial:
    level_1: "Outer crimson currents pulling the Perechon off course"
    level_2: "Skie and Kitiara boarding-strike above the vortex lip"
    level_3: "Raistlin teleports away with the Dragon Orb as the ship plunges"
    level_4: "Awakening in the air-filled domes of sunken Istar"
  threat_clocks:
    maelstrom_hull_crush: "Maelstrom Hull Crush [6 Ticks] - Advances each round the Perechon remains trapped in the vortex funnel."
  yields_resource: "black_robe_transfiguration, berem_everman_revelation"
---

# MODULE MOD_T2_BLOOD_SEA_VORTEX: THE BLOOD SEA OF ISTAR MAELSTROM & DROWNED RUINS

## Granular Disposition Baseline ([3, 3, 1])

### 1. Executive Summary & Egri Premise
Perpetual arterial-red whirlpool above the sunken Cataclysm crater of Istar, pulling ships down into the Dargonesti sea-elf ruins (`Q_SPR_01`).

- **Pipeline Tier:** Tier 2
- **Provides:** `black_robe_transfiguration`, `berem_everman_revelation`
- **Requires:** `perechon_smuggler_berth`
- **Standalone Fallback:** Red silt storms and corsair patrols hazard all shipping between Flotsam and Kalaman.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Roaring funnel of blood-red seawater, groaning ship timbers, and bioluminescent sunken marble domes.
- **Behaviors:** Corsair crews lashing themselves to the wheel as Blue Dragons dive from the clouds.
- **Relationships:** Raistlin abandoning Caramon and Tanis as his robes turn black.
- **Attitudes:** Apocalyptic dread.
- **Values:** Survival and cosmic reckoning.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Kitiara's Blue Wing Aerial Interceptors
* **Main Opponent:** Tanis, Caramon & Crew of the Perechon
* **Thematic Shadow:** Raistlin Majere Embracing Nuitari's Black Robes
* **Tertiary Outcast:** Apoletta, Dargonesti Sea Elves & Berem the Everman

### 4. Severance & Escalation Threat Clock
- **Maelstrom Hull Crush [6 Ticks]:** Advances each round the Perechon remains trapped in the vortex funnel.

### Key Personnel (NPC Prototypes)
- name: "Kitiara's Blue Wing Aerial Interceptors"
  role: "Establishment"
  disposition: "[3, 3, 1]"
  motivation: "Pushes the module toward: Outer crimson currents pulling the Perechon off course"
- name: "Tanis, Caramon & Crew of the Perechon"
  role: "Main Opponent"
  disposition: "[4, 3, 1]"
  motivation: "Pushes the module toward: Skie and Kitiara boarding-strike above the vortex lip"
- name: "Raistlin Majere Embracing Nuitari's Black Robes"
  role: "Thematic Shadow"
  disposition: "[3, 4, 2]"
  motivation: "Pushes the module toward: Raistlin teleports away with the Dragon Orb as the ship plunges"
- name: "Apoletta, Dargonesti Sea Elves & Berem the Everman"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 3]"
  motivation: "Pushes the module toward: Awakening in the air-filled domes of sunken Istar"
