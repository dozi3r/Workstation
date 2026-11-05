---
id: "MOD_T4_SOLAMNIC_SCHISM_MEASURE"
title: "The Solamnic Schism: Derek's Folly vs. Sturm's Honor"
set: "Set_3_Winter_Night"
tier: "Tier 4"
pipeline_tier: 4
provides: ["northern_offensive_supply_line"]
requires: ["blue_wing_broken_siege"]
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "W"
summary: "Deadly ideological fracture inside theHigh Clerist's Tower between Lord Derek Crownguard's glory-seeking charge and Sturm Brightblade's selfless defense of the walls (`Q_WIN_04`, `CRUC-13`)."
standalone_fallback: "Resolves at the Whitestone war-table if the Tower siege is bypassed."
injected_mechanics:
  output_dial:
    level_1: "Bitter court-martial threats against Sturm inside the Tower"
    level_2: "Derek marches two-thirds of the garrison into Bakaris's trap outside the gate"
    level_3: "Derek returns mortally insane; Sturm takes sole command of the parapet"
    level_4: "Sturm's stand unites the surviving Knighthood behind the Golden General"
  threat_clocks:
    garrison_morale_collapse: "Garrison Morale Collapse [6 Ticks] - Advances when Derek's sally is slaughtered outside the West Gate."
  yields_resource: "northern_offensive_supply_line"
---

# MODULE MOD_T4_SOLAMNIC_SCHISM_MEASURE: THE SOLAMNIC SCHISM: DEREK'S FOLLY VS. STURM'S HONOR

## Granular Disposition Baseline ([1, 1, 3])

### 1. Executive Summary & Egri Premise
Deadly ideological fracture inside theHigh Clerist's Tower between Lord Derek Crownguard's glory-seeking charge and Sturm Brightblade's selfless defense of the walls (`Q_WIN_04`, `CRUC-13`).

- **Pipeline Tier:** Tier 4
- **Provides:** `northern_offensive_supply_line`
- **Requires:** `blue_wing_broken_siege`
- **Standalone Fallback:** Resolves at the Whitestone war-table if the Tower siege is bypassed.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Dented plate armor smeared with blood and ash; Derek's broken helm; Sturm's saluting blade in the dawn light.
- **Behaviors:** Derek leading knights into a catastrophic field ambush while Sturm holds the inner parapet with three hundred raw recruits.
- **Relationships:** Laurana defying knightly prejudice to command the defense.
- **Attitudes:** Hollow legalism shattered by authentic heroism.
- **Values:** True honor (`CRUC-13`).

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Sturm Brightblade & Laurana's Wall Defenders
* **Main Opponent:** Lord Derek Crownguard's Field Faction
* **Thematic Shadow:** Kitiara Uth Matar Watching from Skie's Saddle (`CRUC-13`)
* **Tertiary Outcast:** Young Solamnic Footmen & Squires

### 4. Severance & Escalation Threat Clock
- **Garrison Morale Collapse [6 Ticks]:** Advances when Derek's sally is slaughtered outside the West Gate.

### Key Personnel (NPC Prototypes)
- name: "Sturm Brightblade & Laurana's Wall Defenders"
  role: "Establishment"
  disposition: "[1, 1, 2]"
  motivation: "Pushes the module toward: Bitter court-martial threats against Sturm inside the Tower"
- name: "Lord Derek Crownguard's Field Faction"
  role: "Main Opponent"
  disposition: "[2, 1, 3]"
  motivation: "Pushes the module toward: Derek marches two-thirds of the garrison into Bakaris's trap outside the gate"
- name: "Kitiara Uth Matar Watching from Skie's Saddle"
  role: "Thematic Shadow"
  disposition: "[1, 2, 4]"
  motivation: "Pushes the module toward: Derek returns mortally insane; Sturm takes sole command of the parapet"
- name: "Young Solamnic Footmen & Squires"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 4]"
  motivation: "Pushes the module toward: Sturm's stand unites the surviving Knighthood behind the Golden General"
