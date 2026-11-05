---
id: "MOD_T3_HIGH_CLERIST_DRAGON_TRAP"
title: "The Architectural Dragon-Trap of the High Clerist's Tower"
set: "Set_3_Winter_Night"
tier: "Tier 3"
pipeline_tier: 3
provides: ["blue_wing_broken_siege","parapet_of_sturm_legacy"]
requires: ["forged_true_dragonlances","whitestone_alliance_treaty"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "W"
summary: "Ancient fortress engineered by Vinas Solamnus not to keep dragons out, but to lure them via a central Dragon Orb into narrow stone kill-chutes lined with Dragonlances (`Q_WIN_04`, `CRUC-13`, `CRUC-17`)."
standalone_fallback: "Outer curtain walls hold conventional infantry assaults even without the Dragon Orb active."
injected_mechanics:
  output_dial:
    level_1: "Under-manned garrison freezing on the outer walls after Derek's rout"
    level_2: "Tasslehoff deciphers the symmetrical dragon-trap floorplan"
    level_3: "Sturm duels Kitiara on the parapet"
    level_4: "Blue Dragons dive blindly into the stone funnels and are impaled on Dragonlances"
  threat_clocks:
    high_clerist_s_tower_breach: "High Clerist's Tower Breach [6 Ticks] - Advances as Bakaris's draconians batter the West Gate."
  yields_resource: "blue_wing_broken_siege, parapet_of_sturm_legacy"
---

# MODULE MOD_T3_HIGH_CLERIST_DRAGON_TRAP: THE ARCHITECTURAL DRAGON-TRAP OF THE HIGH CLERIST'S TOWER

## Granular Disposition Baseline ([1, 1, 2])

### 1. Executive Summary & Egri Premise
Ancient fortress engineered by Vinas Solamnus not to keep dragons out, but to lure them via a central Dragon Orb into narrow stone kill-chutes lined with Dragonlances (`Q_WIN_04`, `CRUC-13`, `CRUC-17`).

- **Pipeline Tier:** Tier 3
- **Provides:** `blue_wing_broken_siege`, `parapet_of_sturm_legacy`
- **Requires:** `forged_true_dragonlances`, `whitestone_alliance_treaty`
- **Standalone Fallback:** Outer curtain walls hold conventional infantry assaults even without the Dragon Orb active.

### 2. 5D Sensory Pentagon
- **Physical Environment:** Symmetrical octagonal stone funnels, portcullis winches greased with tallow, and ozone from Blue Dragon lightning.
- **Behaviors:** Knights bracing sixteen-foot lances behind murder-holes while Laurana focuses on the Orb.
- **Relationships:** Sturm holding the sunlit parapet alone so Laurana and Tas have time below.
- **Attitudes:** Unyielding sacrifice.
- **Values:** Est Sularus oth Mithas (`CRUC-13`).

### 3. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment:** Sturm Brightblade, Laurana & The Tower Garrison
* **Main Opponent:** Highlord Kitiara, Bakaris & 30 Blue Dragons
* **Thematic Shadow:** Lord Derek Crownguard's Disastrous Field Charge
* **Tertiary Outcast:** Tasslehoff Burrfoot & Flint in the Orb Vault (`CRUC-26`)

### 4. Severance & Escalation Threat Clock
- **High Clerist's Tower Breach [6 Ticks]:** Advances as Bakaris's draconians batter the West Gate.

### Key Personnel (NPC Prototypes)
- name: "Sturm Brightblade, Laurana & The Tower Garrison"
  role: "Establishment"
  disposition: "[1, 1, 1]"
  motivation: "Pushes the module toward: Under-manned garrison freezing on the outer walls after Derek's rout"
- name: "Highlord Kitiara, Bakaris & 30 Blue Dragons"
  role: "Main Opponent"
  disposition: "[2, 1, 2]"
  motivation: "Pushes the module toward: Tasslehoff deciphers the symmetrical dragon-trap floorplan"
- name: "Lord Derek Crownguard's Disastrous Field Charge"
  role: "Thematic Shadow"
  disposition: "[1, 2, 3]"
  motivation: "Pushes the module toward: Sturm duels Kitiara on the parapet"
- name: "Tasslehoff Burrfoot & Flint in the Orb Vault"
  role: "Tertiary Outcast"
  disposition: "[3, 2, 4]"
  motivation: "Pushes the module toward: Blue Dragons dive blindly into the stone funnels and are impaled on Dragonlances"
