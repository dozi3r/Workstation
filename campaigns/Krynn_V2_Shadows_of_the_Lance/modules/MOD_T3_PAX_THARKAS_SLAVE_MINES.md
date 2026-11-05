---
id: "MOD_T3_PAX_THARKAS_SLAVE_MINES"
title: "The Iron Mines, Great Chain & Hostage Nursery of Pax Tharkas"
set: "Set_2_Autumn_Twilight"
tier: "Tier 3"
pipeline_tier: 3
provides: ["pax_tharkas_iron_ore","liberated_800_refugees","everman_berem_release"]
requires: ["pax_tharkas_undercroft_breach","disks_of_mishakal_liturgy"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "BR"
summary: "Verminaard's industrial slave-mining complex where 500 adult prisoners forge Dragonarmy steel while 250 children are held hostage under the senile red dragon Flamestrike (`Q_AUT_03`, `CRUC-10`)."
standalone_fallback: "Produces raw iron weapons via hobgoblin labor if the human slaves revolt."
injected_mechanics:
  output_dial:
    level_1: "Full iron-ore output under brutal draconian overseers"
    level_2: "Sla-Mori infiltrators ascend the bronze Great Chain into the furnace room"
    level_3: "Children freed from the nursery; Flamestrike unleashed upon Pyros"
    level_4: "Verminaard slain in the sanctum; 800 refugees march into the Kharolis"
  threat_clocks:
    pax_tharkas_garrison_lockdown: "Pax Tharkas Garrison Lockdown Clock [6 Ticks] - Advances if alarms sound before the hostage children are secured."
  yields_resource: "pax_tharkas_iron_ore, liberated_800_refugees, everman_berem_release"
---

# MODULE MOD_T3_PAX_THARKAS_SLAVE_MINES: THE IRON MINES, GREAT CHAIN & HOSTAGE NURSERY OF PAX THARKAS

## Granular Disposition Baseline ([1, 1, 2])

### 1. Executive Summary & Egri Premise
Verminaard's industrial slave-mining complex where 500 adult prisoners forge Dragonarmy steel while 250 children are held hostage under the senile red dragon Flamestrike (`Q_AUT_03`, `CRUC-10`).

- **Pipeline Tier:** Tier 3
- **Provides:** `pax_tharkas_iron_ore`, `liberated_800_refugees`, `everman_berem_release`
- **Requires:** `pax_tharkas_undercroft_breach`, `disks_of_mishakal_liturgy`
- **Standalone Fallback:** Produces raw iron weapons via hobgoblin labor if the human slaves revolt.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Roaring blast-furnaces, clanking ankle-irons, and the suffocating heat of the sixty-foot bronze Great Chain.
- **Behaviors:** Miners passing secret word to Elistan's cell while Laurana and Tika infiltrate the nursery.
- **Relationships:** Parents terrorized into submission by threats to their children above.
- **Attitudes:** Crushing despair igniting into righteous revolt.
- **Values:** Family survival and liberation.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Highlord Verminaard, Pyros & The Red Wing Garrison
* **Main Opponent:** Tanis, Elistan & The Slave Uprising
* **Thematic Shadow:** Flamestrike (Matafleur's Maternal Frenzy, `CRUC-10`)
* **Tertiary Outcast:** Sestun & The Imprisoned Everman Berem

### 4. Severance & Escalation Threat Clock
- **Pax Tharkas Garrison Lockdown Clock [6 Ticks]:** Advances if alarms sound before the hostage children are secured.

### Key Personnel (NPC Prototypes)
- name: "Highlord Verminaard, Pyros & The Red Wing Garrison"
  role: "Establishment"
  disposition: "[1, 1, 1]"
  motivation: "Pushes the module toward: Full iron-ore output under brutal draconian overseers"
- name: "Tanis, Elistan & The Slave Uprising"
  role: "Main Opponent"
  disposition: "[2, 1, 2]"
  motivation: "Pushes the module toward: Sla-Mori infiltrators ascend the bronze Great Chain into the furnace room"
- name: "Flamestrike"
  role: "Thematic Shadow"
  disposition: "[1, 2, 3]"
  motivation: "Pushes the module toward: Children freed from the nursery; Flamestrike unleashed upon Pyros"
- name: "Sestun & The Imprisoned Everman Berem"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 4]"
  motivation: "Pushes the module toward: Verminaard slain in the sanctum; 800 refugees march into the Kharolis"
