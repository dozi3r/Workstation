---
id: "MOD_T1_HIGHLORD_COUNCIL_CONCLAVE"
title: "The Imperial Highlord Conclave of Neraka"
set: "Set_4_Spring_Dawning"
tier: "Tier 1"
pipeline_tier: 1
provides: ["crown_of_power_dominion"]
requires: ["draconian_army_reinforcements"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "BR"
summary: "Darwinian military summit of the five Dragonarmies at Neraka where Emperor Ariakas rules via the Crown of Power while Highlord Kitiara plots her coup (`CRUC-19`, `CRUC-23`)."
standalone_fallback: "Each Dragonarmy Wing operates as an autonomous regional warlord state if Neraka's central command collapses."
injected_mechanics:
  output_dial:
    level_1: "Tense factional rivalry between the five Dragonarmy Wings"
    level_2: "Ariakas orders the public execution of failed commanders and Laurana's presentation"
    level_3: "Raistlin drops Ariakas's arcane ward; Tanis strikes for the Crown of Power"
    level_4: "Total Dragonarmy civil war inside the collapsing Temple of Darkness"
  threat_clocks:
    highlord_civil_war: "Highlord Civil War Clock [6 Ticks] - Advances as Kitiara and Tanis destabilize Ariakas's grip on the Crown of Power."
  yields_resource: "crown_of_power_dominion"
---

# MODULE MOD_T1_HIGHLORD_COUNCIL_CONCLAVE: THE IMPERIAL HIGHLORD CONCLAVE OF NERAKA

## Granular Disposition Baseline ([1, 1, 1])

### 1. Executive Summary & Egri Premise
Darwinian military summit of the five Dragonarmies at Neraka where Emperor Ariakas rules via the Crown of Power while Highlord Kitiara plots her coup (`CRUC-19`, `CRUC-23`).

- **Pipeline Tier:** Tier 1
- **Provides:** `crown_of_power_dominion`
- **Requires:** `draconian_army_reinforcements`
- **Standalone Fallback:** Each Dragonarmy Wing operates as an autonomous regional warlord state if Neraka's central command collapses.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Five colored dragon banners whipping in volcanic ash above 200,000 armored troops; the ruby glow of the Crown of Power.
- **Behaviors:** Highlords exchanging poisoned compliments while Black Robe mages maintain Ariakas's force-shield.
- **Relationships:** Kitiara and Lord Soth conspiring against Ariakas while Raistlin plays both sides.
- **Attitudes:** Ruthless ambition masked as devotion to Takhisis.
- **Values:** Strength, betrayal rewarded by victory, and imperial dominion.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Emperor Ariakas & The Imperial Red Guard
* **Main Opponent:** Highlord Kitiara Uth Matar & Lord Soth
* **Thematic Shadow:** Raistlin Majere (Black Robe Conspirator)
* **Tertiary Outcast:** Tanis Half-Elven (Disguised in Dragonarmy Plate)

### 4. Severance & Escalation Threat Clock
- **Highlord Civil War Clock [6 Ticks]:** Advances as Kitiara and Tanis destabilize Ariakas's grip on the Crown of Power.

### Key Personnel (NPC Prototypes)
- name: "Emperor Ariakas & The Imperial Red Guard"
  role: "Establishment"
  disposition: "[1, 1, 1]"
  motivation: "Pushes the module toward: Tense factional rivalry between the five Dragonarmy Wings"
- name: "Highlord Kitiara Uth Matar & Lord Soth"
  role: "Main Opponent"
  disposition: "[2, 1, 1]"
  motivation: "Pushes the module toward: Ariakas orders the public execution of failed commanders and Laurana's presentation"
- name: "Raistlin Majere (Black Robe Conspirator)"
  role: "Thematic Shadow"
  disposition: "[1, 2, 2]"
  motivation: "Pushes the module toward: Raistlin drops Ariakas's arcane ward; Tanis strikes for the Crown of Power"
- name: "Tanis Half-Elven (Disguised in Dragonarmy Plate)"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 3]"
  motivation: "Pushes the module toward: Total Dragonarmy civil war inside the collapsing Temple of Darkness"
