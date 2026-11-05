---
id: "MOD_T5_DARGAARD_DEATH_KNIGHT_PACT"
title: "Lord Soth's Banshee Curse & The Soul-Trade of Laurana"
set: "Set_4_Spring_Dawning"
tier: "Tier 5"
pipeline_tier: 5
provides: ["soth_death_knight_cavalry","captured_bakaris_leverage"]
requires: []
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "B"
summary: "Unholy alliance between Highlord Kitiara and the undead Death Knight Lord Loren Soth of Dargaard Keep, trading Laurana's radiant soul for Soth's skeletal legions (`Q_SPR_02`, `CRUC-21`)."
standalone_fallback: "Dargaard Keep projects a lethal fear-and-chill aura across Nightlund."
injected_mechanics:
  output_dial:
    level_1: "Banshees singing Soth's curse inside Dargaard Keep"
    level_2: "Kitiara and Bakaris abduct Laurana from Kalaman"
    level_3: "Soth marches into Neraka as Kitiara's personal executioner"
    level_4: "Climax confrontation for Laurana's body and soul"
  threat_clocks:
    dargaard_soul_claim: "Dargaard Soul-Claim Clock [6 Ticks] - Advances once Laurana is brought in chains to the Temple of Neraka."
  yields_resource: "soth_death_knight_cavalry, captured_bakaris_leverage"
---

# MODULE MOD_T5_DARGAARD_DEATH_KNIGHT_PACT: LORD SOTH'S BANSHEE CURSE & THE SOUL-TRADE OF LAURANA

## Granular Disposition Baseline ([1, 1, 3])

### 1. Executive Summary & Egri Premise
Unholy alliance between Highlord Kitiara and the undead Death Knight Lord Loren Soth of Dargaard Keep, trading Laurana's radiant soul for Soth's skeletal legions (`Q_SPR_02`, `CRUC-21`).

- **Pipeline Tier:** Tier 5
- **Provides:** `soth_death_knight_cavalry`, `captured_bakaris_leverage`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Dargaard Keep projects a lethal fear-and-chill aura across Nightlund.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Two pinpricks of orange flame inside a blackened Solamnic helm; the scent of singed roses; thirteen banshees screaming.
- **Behaviors:** Soth killing with a single whispered word of power (`Power Word Kill`) and chilling even Kitiara's dragons.
- **Relationships:** Kitiara bargaining away her rival Laurana to secure Soth's aid against Ariakas.
- **Attitudes:** Eternal damned obsession.
- **Values:** Spiteful possession of pure light (`CRUC-21`).

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Lord Loren Soth & His Thirteen Banshees
* **Main Opponent:** Laurana (The Captured Golden General) & Tanis
* **Thematic Shadow:** Highlord Kitiara Uth Matar (Broker of the Pact)
* **Tertiary Outcast:** Skeletal Cavaliers of Dargaard Keep

### 4. Severance & Escalation Threat Clock
- **Dargaard Soul-Claim Clock [6 Ticks]:** Advances once Laurana is brought in chains to the Temple of Neraka.

### Key Personnel (NPC Prototypes)
- name: "Lord Loren Soth & His Thirteen Banshees"
  role: "Establishment"
  disposition: "[1, 1, 2]"
  motivation: "Pushes the module toward: Banshees singing Soth's curse inside Dargaard Keep"
- name: "Laurana (The Captured Golden General) & Tanis"
  role: "Main Opponent"
  disposition: "[2, 1, 3]"
  motivation: "Pushes the module toward: Kitiara and Bakaris abduct Laurana from Kalaman"
- name: "Highlord Kitiara Uth Matar (Broker of the Pact)"
  role: "Thematic Shadow"
  disposition: "[1, 2, 4]"
  motivation: "Pushes the module toward: Soth marches into Neraka as Kitiara's personal executioner"
- name: "Skeletal Cavaliers of Dargaard Keep"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 4]"
  motivation: "Pushes the module toward: Climax confrontation for Laurana's body and soul"
