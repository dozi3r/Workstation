---
id: "MOD_T4_SILVER_CLUTCH_BETRAYAL"
title: "The Stolen Silver Clutch of Hope's End (347 AC)"
set: "Set_1_Preludes_and_Abanasinia"
tier: "Tier 4"
pipeline_tier: 4
provides: ["silver_clutch_eggshell_evidence"]
requires: ["mercenary_sellsword_contracts"]
culture_quadrant: "Adhocracy"
operational_profile: "Service"
mtg_color: "UBR"
summary: "Secret conspiracy beneath the Siege of Hope's End where the Red Dragon Immolatus uses Baron Ivor's war as a smokescreen to seize a clutch of Silver Dragon eggs (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-07`)."
standalone_fallback: "Leaves forensic dragon-glass and eggshell shards (`ITM-SILVER-SHARD`) in the ruined cellars of Hope's End."
injected_mechanics:
  output_dial:
    level_1: "Rumors of strange silver spheres hidden beneath Hope's End keep"
    level_2: "Bakaris betrays the vault location to Kitiara"
    level_3: "Immolatus incinerates the keep to extract the clutch"
    level_4: "Raistlin secures the forensic secret of the Sanction egg trade"
  threat_clocks:
    silver_clutch_extraction: "Silver Clutch Extraction Clock [6 Ticks] - Advances during the final 48 hours of the Siege of Hope's End."
  yields_resource: "silver_clutch_eggshell_evidence"
---

# MODULE MOD_T4_SILVER_CLUTCH_BETRAYAL: THE STOLEN SILVER CLUTCH OF HOPE'S END (347 AC)

## Granular Disposition Baseline ([3, 3, 3])

### 1. Executive Summary & Egri Premise
Secret conspiracy beneath the Siege of Hope's End where the Red Dragon Immolatus uses Baron Ivor's war as a smokescreen to seize a clutch of Silver Dragon eggs (`Q_PRE_02`, `Q_ECHO_02`, `CRUC-07`).

- **Pipeline Tier:** Tier 4
- **Provides:** `silver_clutch_eggshell_evidence`
- **Requires:** `mercenary_sellsword_contracts`
- **Standalone Fallback:** Leaves forensic dragon-glass and eggshell shards (`ITM-SILVER-SHARD`) in the ruined cellars of Hope's End.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Frost-rimmed silver eggs glowing in a dark stone vault while dragonfire roars overhead.
- **Behaviors:** Kitiara bargaining with Immolatus in the smoke while Raistlin records forensic notes.
- **Relationships:** Kitiara choosing imperial ambition over her mercenary comrades.
- **Attitudes:** Cold calculation amidst a burning town.
- **Values:** Forbidden knowledge as ultimate leverage (`CRUC-07`).

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Immolatus (Ancient Red Wyrm) & Sanction Agents
* **Main Opponent:** Raistlin, Caramon & Horkin's Mutineers
* **Thematic Shadow:** Kitiara Uth Matar & Lord Bakaris (`CRUC-06`)
* **Tertiary Outcast:** D'Argent (Mother of the Stolen Silver Clutch)

### 4. Severance & Escalation Threat Clock
- **Silver Clutch Extraction Clock [6 Ticks]:** Advances during the final 48 hours of the Siege of Hope's End.

### Key Personnel (NPC Prototypes)
- name: "Immolatus (Ancient Red Wyrm) & Sanction Agents"
  role: "Establishment"
  disposition: "[3, 3, 2]"
  motivation: "Pushes the module toward: Rumors of strange silver spheres hidden beneath Hope's End keep"
- name: "Raistlin, Caramon & Horkin's Mutineers"
  role: "Main Opponent"
  disposition: "[4, 3, 3]"
  motivation: "Pushes the module toward: Bakaris betrays the vault location to Kitiara"
- name: "Kitiara Uth Matar & Lord Bakaris"
  role: "Thematic Shadow"
  disposition: "[3, 4, 4]"
  motivation: "Pushes the module toward: Immolatus incinerates the keep to extract the clutch"
- name: "D'Argent (Mother of the Stolen Silver Clutch)"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 4]"
  motivation: "Pushes the module toward: Raistlin secures the forensic secret of the Sanction egg trade"
