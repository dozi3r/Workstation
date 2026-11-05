---
id: "MOD_T4_BLUE_WING_AERIAL_BLITZ"
title: "Kitiara's Blue Wing Aerial Blitz & The Tarsis Split"
set: "Set_3_Winter_Night"
tier: "Tier 4"
pipeline_tier: 4
provides: ["dragon_orb_lore_clue"]
requires: []
culture_quadrant: "Market"
operational_profile: "Deliver"
mtg_color: "UB"
summary: "Coordinated dragon-and-draconian shock assault on Tarsis the Beautiful that shatters the Red Dragon Inn and forces the Fellowship's iconic split (`Q_WIN_02`, `CRUC-24`)."
standalone_fallback: "Blue Dragon patrols sweep the Plains of Dust and northern ports."
injected_mechanics:
  output_dial:
    level_1: "Covert surveillance of the Companions in Tarsis market"
    level_2: "Street brawl and arrest of Tas at the courthouse"
    level_3: "Full aerial bombardment of the Red Dragon Inn"
    level_4: "Split extraction: Griffons to Silvanesti vs. Horses to Icewall"
  threat_clocks:
    tarsis_aerial_encirclement: "Tarsis Aerial Encirclement [6 Ticks] - Advances each hour the party lingers in Tarsis after visiting the library."
  yields_resource: "dragon_orb_lore_clue"
---

# MODULE MOD_T4_BLUE_WING_AERIAL_BLITZ: KITIARA'S BLUE WING AERIAL BLITZ & THE TARSIS SPLIT

## Granular Disposition Baseline ([2, 3, 3])

### 1. Executive Summary & Egri Premise
Coordinated dragon-and-draconian shock assault on Tarsis the Beautiful that shatters the Red Dragon Inn and forces the Fellowship's iconic split (`Q_WIN_02`, `CRUC-24`).

- **Pipeline Tier:** Tier 4
- **Provides:** `dragon_orb_lore_clue`
- **Requires:** None (Root Producer)
- **Standalone Fallback:** Blue Dragon patrols sweep the Plains of Dust and northern ports.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Ozone crackle of lightning breath, crashing inn rafters, and screaming griffons on the rooftops.
- **Behaviors:** Bakaris arresting Laurana in the chaos while Tanis covers the stairwell.
- **Relationships:** The agonizing split of the Companions across two halves of the continent (`CRUC-24`).
- **Attitudes:** Shock and tactical improvisation.
- **Values:** Sacrificing formation to save one another.

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Highlord Kitiara & Lord Bakaris's Blue Wing
* **Main Opponent:** The Unified Fellowship at the Red Dragon Inn (`CRUC-24`)
* **Thematic Shadow:** Red Wing Dragons Strafing indiscriminately
* **Tertiary Outcast:** Alhana Starbreeze's Griffon Rescue Flight

### 4. Severance & Escalation Threat Clock
- **Tarsis Aerial Encirclement [6 Ticks]:** Advances each hour the party lingers in Tarsis after visiting the library.

### Key Personnel (NPC Prototypes)
- name: "Highlord Kitiara & Lord Bakaris's Blue Wing"
  role: "Establishment"
  disposition: "[2, 3, 2]"
  motivation: "Pushes the module toward: Covert surveillance of the Companions in Tarsis market"
- name: "The Unified Fellowship at the Red Dragon Inn"
  role: "Main Opponent"
  disposition: "[3, 3, 3]"
  motivation: "Pushes the module toward: Street brawl and arrest of Tas at the courthouse"
- name: "Red Wing Dragons Strafing indiscriminately"
  role: "Thematic Shadow"
  disposition: "[2, 4, 4]"
  motivation: "Pushes the module toward: Full aerial bombardment of the Red Dragon Inn"
- name: "Alhana Starbreeze's Griffon Rescue Flight"
  role: "Tertiary Outcast"
  disposition: "[4, 4, 4]"
  motivation: "Pushes the module toward: Split extraction: Griffons to Silvanesti vs. Horses to Icewall"
