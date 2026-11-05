---
id: "MOD_T2_ICEWALL_GLACIAL_SPIRE"
title: "The Sub-Zero Glacier & Ice-Boat Wastes of Icewall"
set: "Set_3_Winter_Night"
tier: "Tier 2"
pipeline_tier: 2
provides: ["icewall_dragon_orb","golden_general_reputation"]
requires: ["icewall_expedition_charts"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "WU"
summary: "Blinding southern ice-sheet crossed by sail-rigged ice-boats and contested by Ice Folk barbarians, Than-Kar walrus-men, and Highlord Feal-Thas's white wolves (`Q_WIN_03B`)."
standalone_fallback: "Extreme cold and crevasse hazards challenge any expedition to the southern pole."
injected_mechanics:
  output_dial:
    level_1: "Howling polar gales and winter wolf scouting packs"
    level_2: "Ice-boat skirmishes across the crevasse fields"
    level_3: "Assault on the slick ice-tunnels of Icewall Castle"
    level_4: "Duel with Feal-Thas and Sleet at the Orb pedestal"
  threat_clocks:
    glacial_freeze_white_wing_alert: "Glacial Freeze & White Wing Alert Clock [6 Ticks] - Advances when wolf packs spot approaching ice-boats."
  yields_resource: "icewall_dragon_orb, golden_general_reputation"
---

# MODULE MOD_T2_ICEWALL_GLACIAL_SPIRE: THE SUB-ZERO GLACIER & ICE-BOAT WASTES OF ICEWALL

## Granular Disposition Baseline ([3, 3, 1])

### 1. Executive Summary & Egri Premise
Blinding southern ice-sheet crossed by sail-rigged ice-boats and contested by Ice Folk barbarians, Than-Kar walrus-men, and Highlord Feal-Thas's white wolves (`Q_WIN_03B`).

- **Pipeline Tier:** Tier 2
- **Provides:** `icewall_dragon_orb`, `golden_general_reputation`
- **Requires:** `icewall_expedition_charts`
- **Standalone Fallback:** Extreme cold and crevasse hazards challenge any expedition to the southern pole.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Singing steel runners of ice-boats on blue glacial glass; blinding snow-glare; frozen blood on white fur.
- **Behaviors:** Winter wolves stalking through whiteouts while Sleet circles the spire.
- **Relationships:** Laurana rallying the Ice Folk hunters after Sturm and Derek clash.
- **Attitudes:** Stark polar survival.
- **Values:** Courage against the frost.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Highlord Feal-Thas, Sleet & The White Wing
* **Main Opponent:** Laurana, Sturm & Ice Folk Raiders (`CRUC-14`, `CRUC-25`)
* **Thematic Shadow:** The Sentient Will Inside the Icewall Dragon Orb
* **Tertiary Outcast:** Than-Kar Walrus-Men Thralls

### 4. Severance & Escalation Threat Clock
- **Glacial Freeze & White Wing Alert Clock [6 Ticks]:** Advances when wolf packs spot approaching ice-boats.

### Key Personnel (NPC Prototypes)
- name: "Highlord Feal-Thas, Sleet & The White Wing"
  role: "Establishment"
  disposition: "[3, 3, 1]"
  motivation: "Pushes the module toward: Howling polar gales and winter wolf scouting packs"
- name: "Laurana, Sturm & Ice Folk Raiders"
  role: "Main Opponent"
  disposition: "[4, 3, 1]"
  motivation: "Pushes the module toward: Ice-boat skirmishes across the crevasse fields"
- name: "The Sentient Will Inside the Icewall Dragon Orb"
  role: "Thematic Shadow"
  disposition: "[3, 4, 2]"
  motivation: "Pushes the module toward: Assault on the slick ice-tunnels of Icewall Castle"
- name: "Than-Kar Walrus-Men Thralls"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 3]"
  motivation: "Pushes the module toward: Duel with Feal-Thas and Sleet at the Orb pedestal"
