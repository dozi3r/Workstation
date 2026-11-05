---
id: "MOD_T3_MERCENARY_SIEGE_LINES"
title: "Baron Ivor's Mercenary Siege Logistics (347 AC)"
set: "Set_1_Preludes_and_Abanasinia"
tier: "Tier 3"
pipeline_tier: 3
provides: ["mercenary_sellsword_contracts","khalkist_smuggler_pass"]
requires: ["steel_coin_treasury"]
culture_quadrant: "Market"
operational_profile: "Produce"
mtg_color: "BR"
summary: "Combined-arms mercenary siege network pairing battle-magic with heavy infantry at Langtree and Hope's End (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-05`)."
standalone_fallback: "Veteran sellsword companies hire out to local barons for raw steel barter."
injected_mechanics:
  output_dial:
    level_1: "Standard siege encirclement and artillery bombardment"
    level_2: "Raistlin's illusions and sleep spells breaching outer defenses"
    level_3: "Horkin and the twins discover Baron Ivor's massacre orders"
    level_4: "Immolatus descends in fire to vitrify the valley walls"
  threat_clocks:
    hope_s_end_wall_breach: "Hope's End Wall Breach Clock [6 Ticks] - Advances as siege engines pound the eastern gate of Hope's End."
  yields_resource: "mercenary_sellsword_contracts, khalkist_smuggler_pass"
---

# MODULE MOD_T3_MERCENARY_SIEGE_LINES: BARON IVOR'S MERCENARY SIEGE LOGISTICS (347 AC)

## Granular Disposition Baseline ([2, 3, 2])

### 1. Executive Summary & Egri Premise
Combined-arms mercenary siege network pairing battle-magic with heavy infantry at Langtree and Hope's End (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-05`).

- **Pipeline Tier:** Tier 3
- **Provides:** `mercenary_sellsword_contracts`, `khalkist_smuggler_pass`
- **Requires:** `steel_coin_treasury`
- **Standalone Fallback:** Veteran sellsword companies hire out to local barons for raw steel barter.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Pitch cauldrons, mud-spattered pavilions, and the smell of scorched horsehair.
- **Behaviors:** Horkin's sergeants rationing steel pay-chits while sappers dig toward the东 gate.
- **Relationships:** Young Caramon shielding Raistlin as they perfect their sword-and-spell cadence.
- **Attitudes:** Pragmatic professional soldiering recoiling at wanton massacre.
- **Values:** Contract honor versus human conscience (`CRUC-05`).

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Mad Baron Ivor's High Command
* **Main Opponent:** Rebel Garrison & Citizens of Hope's End
* **Thematic Shadow:** Immolatus & Kitiara's Secret Egg Heist (`CRUC-06`)
* **Tertiary Outcast:** Captain Horkin, Caramon & Raistlin's Mutinous Company

### 4. Severance & Escalation Threat Clock
- **Hope's End Wall Breach Clock [6 Ticks]:** Advances as siege engines pound the eastern gate of Hope's End.

### Key Personnel (NPC Prototypes)
- name: "Mad Baron Ivor's High Command"
  role: "Establishment"
  disposition: "[2, 3, 1]"
  motivation: "Pushes the module toward: Standard siege encirclement and artillery bombardment"
- name: "Rebel Garrison & Citizens of Hope's End"
  role: "Main Opponent"
  disposition: "[3, 3, 2]"
  motivation: "Pushes the module toward: Raistlin's illusions and sleep spells breaching outer defenses"
- name: "Immolatus & Kitiara's Secret Egg Heist"
  role: "Thematic Shadow"
  disposition: "[2, 4, 3]"
  motivation: "Pushes the module toward: Horkin and the twins discover Baron Ivor's massacre orders"
- name: "Captain Horkin, Caramon & Raistlin's Mutinous Company"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 4]"
  motivation: "Pushes the module toward: Immolatus descends in fire to vitrify the valley walls"
