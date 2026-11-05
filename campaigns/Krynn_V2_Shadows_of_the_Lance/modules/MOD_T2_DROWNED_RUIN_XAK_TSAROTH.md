---
id: "MOD_T2_DROWNED_RUIN_XAK_TSAROTH"
title: "The Sunken Swamp & Acid Caverns of Xak Tsaroth"
set: "Set_2_Autumn_Twilight"
tier: "Tier 2"
pipeline_tier: 2
provides: ["disks_of_mishakal_liturgy","fistandantilus_sunken_grimoire"]
requires: []
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "BG"
summary: "Cataclysm-tilted city plunged into a subterranean chasm beneath a fetid black swamp, contested by Aghar gully dwarves, Baaz draconians, and the black wyrm Khisanth (`Q_AUT_02`)."
standalone_fallback: "Natural swamp miasma and collapsing marble colonnades challenge delves even after Khisanth's death."
injected_mechanics:
  output_dial:
    level_1: "Dormant swamp mists and scattered wicker-dragon patrols"
    level_2: "Active draconian ambushes at the surface Temple of Mishakal"
    level_3: "Khisanth stalking the flooded subterranean plaza"
    level_4: "Catastrophic cavern collapse triggered by Khisanth's death"
  threat_clocks:
    khisanth_cavern_collapse: "Khisanth Cavern Collapse [6 Ticks] - Advances during combat in the sunken plaza of Xak Tsaroth."
  yields_resource: "disks_of_mishakal_liturgy, fistandantilus_sunken_grimoire"
---

# MODULE MOD_T2_DROWNED_RUIN_XAK_TSAROTH: THE SUNKEN SWAMP & ACID CAVERNS OF XAK TSAROTH

## Granular Disposition Baseline ([3, 3, 1])

### 1. Executive Summary & Egri Premise
Cataclysm-tilted city plunged into a subterranean chasm beneath a fetid black swamp, contested by Aghar gully dwarves, Baaz draconians, and the black wyrm Khisanth (`Q_AUT_02`).

- **Pipeline Tier:** Tier 2
- **Provides:** `disks_of_mishakal_liturgy`, `fistandantilus_sunken_grimoire`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Natural swamp miasma and collapsing marble colonnades challenge delves even after Khisanth's death.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Sulfurous cypress mud, tilted marble columns, and the acrid tang of black-dragon acid.
- **Behaviors:** Aghar Bulps scavenging ancient libraries while draconians weave wicker dragon traps.
- **Relationships:** Highbulp Phudge appeasing Khisanth while Bupu aids Raistlin.
- **Attitudes:** Fatalistic subterranean survival.
- **Values:** Hoarded relics and ancient divine memory.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Khisanth (Onyx) & Baaz/Kapak Garrison
* **Main Opponent:** Goldmoon, Riverwind & The Companions
* **Thematic Shadow:** Raistlin Seeking Fistandantilus's Grimoire (`CRUC-09`)
* **Tertiary Outcast:** Bupu & The Aghar Gully Dwarf Clans

### 4. Severance & Escalation Threat Clock
- **Khisanth Cavern Collapse [6 Ticks]:** Advances during combat in the sunken plaza of Xak Tsaroth.

### Key Personnel (NPC Prototypes)
- name: "Khisanth (Onyx) & Baaz/Kapak Garrison"
  role: "Establishment"
  disposition: "[3, 3, 1]"
  motivation: "Pushes the module toward: Dormant swamp mists and scattered wicker-dragon patrols"
- name: "Goldmoon, Riverwind & The Companions"
  role: "Main Opponent"
  disposition: "[4, 3, 1]"
  motivation: "Pushes the module toward: Active draconian ambushes at the surface Temple of Mishakal"
- name: "Raistlin Seeking Fistandantilus's Grimoire"
  role: "Thematic Shadow"
  disposition: "[3, 4, 2]"
  motivation: "Pushes the module toward: Khisanth stalking the flooded subterranean plaza"
- name: "Bupu & The Aghar Gully Dwarf Clans"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 3]"
  motivation: "Pushes the module toward: Catastrophic cavern collapse triggered by Khisanth's death"
