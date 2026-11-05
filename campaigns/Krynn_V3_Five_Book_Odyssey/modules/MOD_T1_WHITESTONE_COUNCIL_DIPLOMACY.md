---
id: "MOD_T1_WHITESTONE_COUNCIL_DIPLOMACY"
title: "The Whitestone Council & Measure of Solamnia"
set: "Set_3_Winter_Night"
tier: "Tier 1"
pipeline_tier: 1
provides: ["whitestone_alliance_treaty","gnome_catapult_schematics"]
requires: ["forged_true_dragonlances"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "GW"
summary: "Fragile continental war-coalition on Sancrist Isle uniting the fractured Knights of Solamnia, exiled Elves, and Dwarves around the cleaved Whitestone (`CRUC-15`)."
standalone_fallback: "Lord Gunthar commands his loyal Solamnic knights independently if the elven/dwarven envoys walk out."
injected_mechanics:
  output_dial:
    level_1: "Bickering racial delegations deadlocked over command authority"
    level_2: "Tasslehoff cracks the Dragon Orb; Fizban calming the chamber"
    level_3: "Theros Ironfeld hurls the True Dragonlance cleanly through the Whitestone"
    level_4: "Unified Whitestone Armies march under the Golden General"
  threat_clocks:
    coalition_fracture: "Coalition Fracture [6 Ticks] - Advances when racial insults or military defeats erode trust between Solamnia and the Elves."
  yields_resource: "whitestone_alliance_treaty, gnome_catapult_schematics"
---

# MODULE MOD_T1_WHITESTONE_COUNCIL_DIPLOMACY: THE WHITESTONE COUNCIL & MEASURE OF SOLAMNIA

## Granular Disposition Baseline ([1, 1, 1])

### 1. Executive Summary & Egri Premise
Fragile continental war-coalition on Sancrist Isle uniting the fractured Knights of Solamnia, exiled Elves, and Dwarves around the cleaved Whitestone (`CRUC-15`).

- **Pipeline Tier:** Tier 1
- **Provides:** `whitestone_alliance_treaty`, `gnome_catapult_schematics`
- **Requires:** `forged_true_dragonlances`
- **Standalone Fallback:** Lord Gunthar commands his loyal Solamnic knights independently if the elven/dwarven envoys walk out.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Salt wind off Sancrist bay snapping heraldic kingfisher banners around the split white quartz boulder.
- **Behaviors:** Knights citing volume and verse of the thirty-book Measure to block elven proposals.
- **Relationships:** Lord Gunthar leveraging Sturm's honor against Derek Crownguard's legalist bloc.
- **Attitudes:** Centuries of post-Cataclysm racial resentment melting only before the forged Dragonlances.
- **Values:** Chivalric honor (Est Sularus oth Mithas) versus pragmatic survival.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Lord Gunthar Uth Wistan & Moderate Knights of the Rose
* **Main Opponent:** Lord Derek Crownguard's Rigid Legalist Faction
* **Thematic Shadow:** Porthios & Isolationist Elven Royalists
* **Tertiary Outcast:** Tasslehoff Burrfoot, Fizban & Theros Ironfeld

### 4. Severance & Escalation Threat Clock
- **Coalition Fracture [6 Ticks]:** Advances when racial insults or military defeats erode trust between Solamnia and the Elves.

### Key Personnel (NPC Prototypes)
- name: "Lord Gunthar Uth Wistan & Moderate Knights of the Rose"
  role: "Establishment"
  disposition: "[1, 1, 1]"
  motivation: "Pushes the module toward: Bickering racial delegations deadlocked over command authority"
- name: "Lord Derek Crownguard's Rigid Legalist Faction"
  role: "Main Opponent"
  disposition: "[2, 1, 1]"
  motivation: "Pushes the module toward: Tasslehoff cracks the Dragon Orb; Fizban calming the chamber"
- name: "Porthios & Isolationist Elven Royalists"
  role: "Thematic Shadow"
  disposition: "[1, 2, 2]"
  motivation: "Pushes the module toward: Theros Ironfeld hurls the True Dragonlance cleanly through the Whitestone"
- name: "Tasslehoff Burrfoot, Fizban & Theros Ironfeld"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 3]"
  motivation: "Pushes the module toward: Unified Whitestone Armies march under the Golden General"
