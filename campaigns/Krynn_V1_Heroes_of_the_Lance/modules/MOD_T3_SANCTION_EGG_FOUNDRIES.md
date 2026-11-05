---
id: "MOD_T3_SANCTION_EGG_FOUNDRIES"
title: "The Volcanic Draconian Hatcheries of Sanction"
set: "Set_1_Preludes_and_Abanasinia"
tier: "Tier 3"
pipeline_tier: 3
provides: ["draconian_army_reinforcements"]
requires: ["silver_clutch_eggshell_evidence"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "BR"
summary: "Industrial-ritual egg corruption vats inside the volcanic Temple of Luerkhisis where stolen Good Dragon eggs are mutated into Baaz, Kapak, Bozak, Sivak, and Aurak draconians (`Q_PRE_03`, `Q_SPR_02`)."
standalone_fallback: "Continues spawning reserve draconian regiments from stockpiled clutches until infiltrated."
injected_mechanics:
  output_dial:
    level_1: "Secret subterranean incubation of the first Baaz and Kapak clutches (348 AC)"
    level_2: "Full wartime production supplying all five Dragonarmy Wings (351 AC)"
    level_3: "Silvara and Gilthanas breach the lava vents to witness the horror"
    level_4: "Metallic Dragons shatter their neutrality oath and burn the vats"
  threat_clocks:
    draconian_clutch_hatching: "Draconian Clutch Hatching Clock [6 Ticks] - Advances to deploy fresh Sivak and Aurak strike teams across Ansalon."
  yields_resource: "draconian_army_reinforcements"
---

# MODULE MOD_T3_SANCTION_EGG_FOUNDRIES: THE VOLCANIC DRACONIAN HATCHERIES OF SANCTION

## Granular Disposition Baseline ([1, 1, 2])

### 1. Executive Summary & Egri Premise
Industrial-ritual egg corruption vats inside the volcanic Temple of Luerkhisis where stolen Good Dragon eggs are mutated into Baaz, Kapak, Bozak, Sivak, and Aurak draconians (`Q_PRE_03`, `Q_SPR_02`).

- **Pipeline Tier:** Tier 3
- **Provides:** `draconian_army_reinforcements`
- **Requires:** `silver_clutch_eggshell_evidence`
- **Standalone Fallback:** Continues spawning reserve draconian regiments from stockpiled clutches until infiltrated.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Geothermal lava conduits heating rows of weeping metallic eggs in black slime vats.
- **Behaviors:** Dark clerics chanting Wyrllish's corruption liturgy while red dragon guards patrol the vents.
- **Relationships:** Takhisis's priesthood holding the Good Dragons hostage by their own children.
- **Attitudes:** Cold industrial desecration.
- **Values:** Mass-produced shock troops and strategic blackmail.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** High Cleric Wyrllish & Temple of Luerkhisis Guard
* **Main Opponent:** Silvara, Gilthanas & Fizban's Infiltration Team (`Q_SPR_02`)
* **Thematic Shadow:** Raistlin's Early Forensic Discovery (`CRUC-07`)
* **Tertiary Outcast:** Captive Unhatched Metallic Dragon Wyrmlings

### 4. Severance & Escalation Threat Clock
- **Draconian Clutch Hatching Clock [6 Ticks]:** Advances to deploy fresh Sivak and Aurak strike teams across Ansalon.

### Key Personnel (NPC Prototypes)
- name: "High Cleric Wyrllish & Temple of Luerkhisis Guard"
  role: "Establishment"
  disposition: "[1, 1, 1]"
  motivation: "Pushes the module toward: Secret subterranean incubation of the first Baaz and Kapak clutches (348 AC)"
- name: "Silvara, Gilthanas & Fizban's Infiltration Team"
  role: "Main Opponent"
  disposition: "[2, 1, 2]"
  motivation: "Pushes the module toward: Full wartime production supplying all five Dragonarmy Wings (351 AC)"
- name: "Raistlin's Early Forensic Discovery"
  role: "Thematic Shadow"
  disposition: "[1, 2, 3]"
  motivation: "Pushes the module toward: Silvara and Gilthanas breach the lava vents to witness the horror"
- name: "Captive Unhatched Metallic Dragon Wyrmlings"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 4]"
  motivation: "Pushes the module toward: Metallic Dragons shatter their neutrality oath and burn the vats"
