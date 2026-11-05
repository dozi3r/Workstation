---
id: "MOD_T1_SEEKER_THEOCRACY_NETWORK"
title: "The High Seeker Bureaucracy & Cult of Belzor"
set: "Set_1_Preludes_and_Abanasinia"
tier: "Tier 1"
pipeline_tier: 1
provides: ["seeker_safe_conduct_writ","steel_coin_treasury"]
requires: []
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "WB"
summary: "Post-Cataclysm bureaucratic theocracy in Haven and Solace taxing trade in steel pieces while appeasing Dragonarmy envoys and staging flash-powder miracles (`CRUC-02`)."
standalone_fallback: "Operates via local village bailiffs and traveling Seeker inquisitors even if Haven is cut off."
injected_mechanics:
  output_dial:
    level_1: "Lax municipal tolls and theatrical street sermons"
    level_2: "Mandatory checkpoint inspections for the Blue Crystal Staff"
    level_3: "Inquisitorial book-burnings and Seeker collaboration with Fewmaster Toede"
    level_4: "Total capitulation to Red Dragonarmy martial law"
  threat_clocks:
    seeker_theocratic_inquisition: "Seeker Theocratic Inquisition [6 Ticks] - Advances when divine miracles or arcane magic are displayed openly in Haven or Solace."
  yields_resource: "seeker_safe_conduct_writ, steel_coin_treasury"
---

# MODULE MOD_T1_SEEKER_THEOCRACY_NETWORK: THE HIGH SEEKER BUREAUCRACY & CULT OF BELZOR

## Granular Disposition Baseline ([1, 1, 1])

### 1. Executive Summary & Egri Premise
Post-Cataclysm bureaucratic theocracy in Haven and Solace taxing trade in steel pieces while appeasing Dragonarmy envoys and staging flash-powder miracles (`CRUC-02`).

- **Pipeline Tier:** Tier 1
- **Provides:** `seeker_safe_conduct_writ`, `steel_coin_treasury`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Operates via local village bailiffs and traveling Seeker inquisitors even if Haven is cut off.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Whitewashed council halls smelling of sealing wax, tallow, and sulfur flash-powder.
- **Behaviors:** Clerks weighing steel coins and confiscating unregistered spellbooks.
- **Relationships:** Hederick and Widow Judith vying for council influence while Antimodes watches.
- **Attitudes:** Smug institutional skepticism toward the ancient gods.
- **Values:** Order, steel taxation, and self-preservation.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** High Seeker Council of Haven & High Theocrat Hederick
* **Main Opponent:** Goldmoon & Bearers of the True Gods
* **Thematic Shadow:** Widow Judith's Fanatical Cult of Belzor
* **Tertiary Outcast:** Suspected Renegade Mages & Herbalists (Raistlin Majere)

### 4. Severance & Escalation Threat Clock
- **Seeker Theocratic Inquisition [6 Ticks]:** Advances when divine miracles or arcane magic are displayed openly in Haven or Solace.

### Key Personnel (NPC Prototypes)
- name: "High Seeker Council of Haven & High Theocrat Hederick"
  role: "Establishment"
  disposition: "[1, 1, 1]"
  motivation: "Pushes the module toward: Lax municipal tolls and theatrical street sermons"
- name: "Goldmoon & Bearers of the True Gods"
  role: "Main Opponent"
  disposition: "[2, 1, 1]"
  motivation: "Pushes the module toward: Mandatory checkpoint inspections for the Blue Crystal Staff"
- name: "Widow Judith's Fanatical Cult of Belzor"
  role: "Thematic Shadow"
  disposition: "[1, 2, 2]"
  motivation: "Pushes the module toward: Inquisitorial book-burnings and Seeker collaboration with Fewmaster Toede"
- name: "Suspected Renegade Mages & Herbalists (Raistlin Majere)"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 3]"
  motivation: "Pushes the module toward: Total capitulation to Red Dragonarmy martial law"
