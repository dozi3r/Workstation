---
id: "MOD_T2_VALLEY_TREES_SOLACE"
title: "The Vallenwood Canopy of Solace"
set: "Set_1_Preludes_and_Abanasinia"
tier: "Tier 2"
pipeline_tier: 2
provides: ["spiced_potatoes_provisions","fellowship_sanctuary","timber_bridge_maintenance"]
requires: []
culture_quadrant: "Clan"
operational_profile: "Design"
mtg_color: "G"
summary: "Elevated treetop settlement built into giant vallenwood boughs, providing multi-tiered rope-bridge traversal and the hearth of the Inn of the Last Home (`Q_AUT_01`)."
standalone_fallback: "Retracting rope ladders isolates the upper vallenwood platforms from ground patrols."
injected_mechanics:
  output_dial:
    level_1: "Peaceful autumn festival in the vallenwood boughs"
    level_2: "Seeker curfews and hooded draconian searches on the walkways"
    level_3: "Red Dragon fire-bombing of the lower vallenwood trunks"
    level_4: "Occupied ash-ruin patrolled by Baaz garrisons"
  threat_clocks:
    solace_occupation: "Solace Occupation Clock [6 Ticks] - Advances as Verminaard's Red Wing tightens its grip on Abanasinia."
  yields_resource: "spiced_potatoes_provisions, fellowship_sanctuary, timber_bridge_maintenance"
---

# MODULE MOD_T2_VALLEY_TREES_SOLACE: THE VALLENWOOD CANOPY OF SOLACE

## Granular Disposition Baseline ([3, 1, 1])

### 1. Executive Summary & Egri Premise
Elevated treetop settlement built into giant vallenwood boughs, providing multi-tiered rope-bridge traversal and the hearth of the Inn of the Last Home (`Q_AUT_01`).

- **Pipeline Tier:** Tier 2
- **Provides:** `spiced_potatoes_provisions`, `fellowship_sanctuary`, `timber_bridge_maintenance`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Retracting rope ladders isolates the upper vallenwood platforms from ground patrols.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Golden autumn leaves, resinous vallenwood bark, and the warm aroma of Otik's spiced potatoes.
- **Behaviors:** Townsfolk crossing swaying rope bridges and gathering around the common hearth.
- **Relationships:** Tight-knit frontier solidarity tested by Seeker informants.
- **Attitudes:** Protective love of home and hearth.
- **Values:** Hospitality, loyalty, and peaceful craftsmanship.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Otik Sandath & Town Militia of Solace
* **Main Opponent:** Fewmaster Toede's Hobgoblin & Baaz Raiders
* **Thematic Shadow:** High Theocrat Hederick's Seeker Patrols
* **Tertiary Outcast:** Refugees Fleeing the Northern Burning

### 4. Severance & Escalation Threat Clock
- **Solace Occupation Clock [6 Ticks]:** Advances as Verminaard's Red Wing tightens its grip on Abanasinia.

### Key Personnel (NPC Prototypes)
- name: "Otik Sandath & Town Militia of Solace"
  role: "Establishment"
  disposition: "[3, 1, 1]"
  motivation: "Pushes the module toward: Peaceful autumn festival in the vallenwood boughs"
- name: "Fewmaster Toede's Hobgoblin & Baaz Raiders"
  role: "Main Opponent"
  disposition: "[4, 1, 1]"
  motivation: "Pushes the module toward: Seeker curfews and hooded draconian searches on the walkways"
- name: "High Theocrat Hederick's Seeker Patrols"
  role: "Thematic Shadow"
  disposition: "[3, 2, 2]"
  motivation: "Pushes the module toward: Red Dragon fire-bombing of the lower vallenwood trunks"
- name: "Refugees Fleeing the Northern Burning"
  role: "Tertiary Outcast"
  disposition: "[4, 2, 3]"
  motivation: "Pushes the module toward: Occupied ash-ruin patrolled by Baaz garrisons"
