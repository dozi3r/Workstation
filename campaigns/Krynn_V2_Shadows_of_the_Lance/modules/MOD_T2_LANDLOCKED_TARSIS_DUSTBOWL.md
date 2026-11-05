---
id: "MOD_T2_LANDLOCKED_TARSIS_DUSTBOWL"
title: "The Landlocked Dust-Harbor of Tarsis"
set: "Set_3_Winter_Night"
tier: "Tier 2"
pipeline_tier: 2
provides: ["icewall_expedition_charts","silvanesti_griffon_escort"]
requires: []
culture_quadrant: "Market"
operational_profile: "Produce"
mtg_color: "WR"
summary: "Once Krynn's jewel seaport, left forty miles inland by the Cataclysm where rotting galleons sit in prairie dust under corrupt merchants and Blue Wing occupation (`Q_WIN_02`)."
standalone_fallback: "Functions as a black-market caravan hub across the Plains of Dust."
injected_mechanics:
  output_dial:
    level_1: "Dust-choked markets and suspicious municipal arrests"
    level_2: "Tas uncovers the cracked Dragon Orb in the basement library"
    level_3: "Blue and Red Dragons strafe the Red Dragon Inn"
    level_4: "Total Dragonarmy martial law across the burning city"
  threat_clocks:
    tarsis_street_riot: "Tarsis Street Riot Clock [6 Ticks] - Advances when the Dragon Orb is disturbed or Bakaris recognizes the Companions."
  yields_resource: "icewall_expedition_charts, silvanesti_griffon_escort"
---

# MODULE MOD_T2_LANDLOCKED_TARSIS_DUSTBOWL: THE LANDLOCKED DUST-HARBOR OF TARSIS

## Granular Disposition Baseline ([2, 3, 1])

### 1. Executive Summary & Egri Premise
Once Krynn's jewel seaport, left forty miles inland by the Cataclysm where rotting galleons sit in prairie dust under corrupt merchants and Blue Wing occupation (`Q_WIN_02`).

- **Pipeline Tier:** Tier 2
- **Provides:** `icewall_expedition_charts`, `silvanesti_griffon_escort`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Functions as a black-market caravan hub across the Plains of Dust.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Dry red dust swirling around marble colonnades and sun-bleached ship hulls.
- **Behaviors:** Corrupt watchmen arresting outsiders while tavern crowds riot under dragon fire.
- **Relationships:** Lord Bakaris enforcing Kitiara's curfew while Alhana Starbreeze seeks allies.
- **Attitudes:** Decadent denial of faded glory.
- **Values:** Mercantile survival and Opportunism.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Tarsis Merchant Magistrates & City Watch
* **Main Opponent:** Highlord Kitiara & Lord Bakaris's Blue Wing Strike Force
* **Thematic Shadow:** The Fellowship of the Lance (`CRUC-24`)
* **Tertiary Outcast:** Princess Alhana Starbreeze & Her Griffon Guard

### 4. Severance & Escalation Threat Clock
- **Tarsis Street Riot Clock [6 Ticks]:** Advances when the Dragon Orb is disturbed or Bakaris recognizes the Companions.

### Key Personnel (NPC Prototypes)
- name: "Tarsis Merchant Magistrates & City Watch"
  role: "Establishment"
  disposition: "[2, 3, 1]"
  motivation: "Pushes the module toward: Dust-choked markets and suspicious municipal arrests"
- name: "Highlord Kitiara & Lord Bakaris's Blue Wing Strike Force"
  role: "Main Opponent"
  disposition: "[3, 3, 1]"
  motivation: "Pushes the module toward: Tas uncovers the cracked Dragon Orb in the basement library"
- name: "The Fellowship of the Lance"
  role: "Thematic Shadow"
  disposition: "[2, 4, 2]"
  motivation: "Pushes the module toward: Blue and Red Dragons strafe the Red Dragon Inn"
- name: "Princess Alhana Starbreeze & Her Griffon Guard"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 3]"
  motivation: "Pushes the module toward: Total Dragonarmy martial law across the burning city"
