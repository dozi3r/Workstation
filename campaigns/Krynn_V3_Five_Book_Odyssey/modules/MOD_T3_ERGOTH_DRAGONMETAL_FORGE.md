---
id: "MOD_T3_ERGOTH_DRAGONMETAL_FORGE"
title: "The Foghaven Dragonlance Forge of Huma"
set: "Set_3_Winter_Night"
tier: "Tier 3"
pipeline_tier: 3
provides: ["forged_true_dragonlances"]
requires: ["hammer_of_kharas_authority","icewall_dragon_orb"]
culture_quadrant: "Clan"
operational_profile: "Design"
mtg_color: "WU"
summary: "Sacred forge inside the silver dragon monument of Southern Ergoth where Theros Ironfeld unites the Silver Arm of Ergoth, the Hammer of Kharas, and pure dragonmetal (`Q_WIN_03B`, `CRUC-18`)."
standalone_fallback: "Produces masterwork silvered weapons even if one of the two forging artifacts is delayed."
injected_mechanics:
  output_dial:
    level_1: "Cold, forgotten altar inside the Tomb of Huma"
    level_2: "Awakening of the forge-fires with the Silver Arm and Hammer of Kharas"
    level_3: "First batch of Footman's and Mounted Dragonlances completed"
    level_4: "Full armory shipped to Sancrist and the High Clerist's Tower"
  threat_clocks:
    dragonlance_production: "Dragonlance Production Clock [6 Ticks] - Advances to arm the Knights of Solamnia before the Blue Wing strikes."
  yields_resource: "forged_true_dragonlances"
---

# MODULE MOD_T3_ERGOTH_DRAGONMETAL_FORGE: THE FOGHAVEN DRAGONLANCE FORGE OF HUMA

## Granular Disposition Baseline ([3, 1, 2])

### 1. Executive Summary & Egri Premise
Sacred forge inside the silver dragon monument of Southern Ergoth where Theros Ironfeld unites the Silver Arm of Ergoth, the Hammer of Kharas, and pure dragonmetal (`Q_WIN_03B`, `CRUC-18`).

- **Pipeline Tier:** Tier 3
- **Provides:** `forged_true_dragonlances`
- **Requires:** `hammer_of_kharas_authority`, `icewall_dragon_orb`
- **Standalone Fallback:** Produces masterwork silvered weapons even if one of the two forging artifacts is delayed.

### 2. 5D Sensory Pentagon
- **Physical Environment:** White-hot silver sparks, ringing anvil strikes echoing inside a carved stone dragon belly, and cold mountain mist.
- **Behaviors:** Theros hammering tireless rhythms with his living silver arm while Silvara watches the passes.
- **Relationships:** Gilthanas and Silvara falling in love across the mortal-dragon divide.
- **Attitudes:** Sacred craftsmanship.
- **Values:** Hope forged in silver.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Silvara & The Guardians of Foghaven Valley
* **Main Opponent:** Sivak Draconian Infiltrators (`CRUC-18`)
* **Thematic Shadow:** Hostile Qualinesti & Kagonesti Border Patrols
* **Tertiary Outcast:** Theros Ironfeld (The Silver-Armed Blacksmith)

### 4. Severance & Escalation Threat Clock
- **Dragonlance Production Clock [6 Ticks]:** Advances to arm the Knights of Solamnia before the Blue Wing strikes.

### Key Personnel (NPC Prototypes)
- name: "Silvara & The Guardians of Foghaven Valley"
  role: "Establishment"
  disposition: "[3, 1, 1]"
  motivation: "Pushes the module toward: Cold, forgotten altar inside the Tomb of Huma"
- name: "Sivak Draconian Infiltrators"
  role: "Main Opponent"
  disposition: "[4, 1, 2]"
  motivation: "Pushes the module toward: Awakening of the forge-fires with the Silver Arm and Hammer of Kharas"
- name: "Hostile Qualinesti & Kagonesti Border Patrols"
  role: "Thematic Shadow"
  disposition: "[3, 2, 3]"
  motivation: "Pushes the module toward: First batch of Footman's and Mounted Dragonlances completed"
- name: "Theros Ironfeld (The Silver-Armed Blacksmith)"
  role: "Tertiary Outcast"
  disposition: "[4, 2, 4]"
  motivation: "Pushes the module toward: Full armory shipped to Sancrist and the High Clerist's Tower"
