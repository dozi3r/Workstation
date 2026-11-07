---
id: "MOD_DIABLO_SIT_DUNGEON_BENEATH_THE_CATHEDRAL"
title: "Dungeon Beneath the Cathedral"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Dungeon-Descent", "Lore: Scent-Of-Death-Threshold", "Defense: Endless-Foe-Roster"]
requires: ["Authority: Reason-To-Descend", "Tech: Light-Source-For-The-Dark"]
tarot_affinity: ["Death", "The Moon"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "A dungeon reached by a stone stairway descending from the ruined church; the entry point into the game's 16 dungeon levels and their peripheral environments."
standalone_fallback: "Run it as a one-shot descent. The party takes the stone stairway from a ruined church into darkness, where the scent of death surrounds them and monsters wait below."
injected_mechanics:
  output_dial:
    level_1: "The stairway is a quiet descent, and the scent of death and the darkness are the only threats on the first steps."
    level_2: "Monsters begin to appear in the passages below the stair, and the party fights as it descends."
    level_3: "The foes grow thick and varied, peripheral environments show up unexpectedly, and the way back is uncertain."
    level_4: "The depths close around the party, mayhem is everywhere, and retreat up the stair is cut off."
  threat_clocks:
    - name: "The dark closes in"
      ticks: 6
      advances_when: "The party descends without rest, light or supplies, or ignores warning signs."
  yields_resource: "The party gains access to the whole descent, its levels and peripheral environments, and the chance to push deeper."
linked_entity: "N_DUNGEON_BENEATH_THE_CATHEDRAL"
related: ["MOD_DIABLO_SIT_RUINED_CATHEDRAL_AT_THE_EDGE_OF_THE_VILLAGE"]
---

# MODULE MOD_DIABLO_SIT_DUNGEON_BENEATH_THE_CATHEDRAL: Dungeon Beneath the Cathedral

A dungeon reached by a stone stairway descending from the ruined church; the entry point into the game's 16 dungeon levels and their peripheral environments.

### Dramatic Premise
Heroes who must go beneath the ruined church + a dark stair into the scent of death = a descent where each level brings more monsters and more mayhem

### Core Premise
A stone stairway inside the ruined church plunges down into darkness. At the bottom is a dungeon where the scent of death surrounds the hero. It is the entry point for the full descent, a long run of levels that also house a random mix of peripheral environments, with a huge list of foes.

### GM Placement & Synergies
Place it directly below the ruined cathedral as the campaign's main threshold. It consumes the party's light, nerve and supplies, and it feeds every deeper site, quest and set piece. Arrival goes well when the party descends prepared and treats the scent of death as a warning. It goes badly when they rush in unprepared, meet the first monsters in the dark, and find the stair behind them is the only way out.

### 5D Sensory Pentagon
- **Physical environment:** A stone stairway inside the church plunges down into darkness to a dungeon beneath the ruined cathedral.
- **Behaviors:** Monsters and mayhem fill the depths. A huge list of foes waits below.
- **Relationships:** The dungeon connects upward to the ruined cathedral and downward to many levels with a random mix of peripheral environments.
- **Attitudes:** The darkness is oppressive and the place feels like a threshold with no return.
- **Values:** Descent is the way forward, and survival is earned one level at a time.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The ruined cathedral above):** The church was the surface's last claim on the dark, and it has fallen. *Leverage:* Its stairway is the only known way down. *Blind spot:* It is ruined and offers no protection to those who leave it.
* **Main opponent (The monsters of the dungeon):** The depths belong to them, and intruders are prey. *Leverage:* A huge list of foes means there is always another threat. *Blind spot:* They have no unity beyond hunger and are separated level from level.
* **Thematic shadow (The scent of death):** Everything that goes down eventually joins the dead. *Leverage:* It unsettles every arrival and marks the place as a grave. *Blind spot:* It warns of danger and so lets a prepared party plan.
* **Tertiary outcast (The lone descender):** A hero who goes in alone owes nothing to anyone and has nothing to lose. *Leverage:* They can move quietly and take risks a group cannot. *Blind spot:* They have no support, and the dark favours the monsters.

### Output Dial
- **Level 1:** The stairway is a quiet descent, and the scent of death and the darkness are the only threats on the first steps.
- **Level 2:** Monsters begin to appear in the passages below the stair, and the party fights as it descends.
- **Level 3:** The foes grow thick and varied, peripheral environments show up unexpectedly, and the way back is uncertain.
- **Level 4:** The depths close around the party, mayhem is everywhere, and retreat up the stair is cut off.

### Threat Clocks
- **The dark closes in [6 Ticks]:** advances when The party descends without rest, light or supplies, or ignores warning signs.

### Yields
The party gains access to the whole descent, its levels and peripheral environments, and the chance to push deeper.

### Related Modules
- `MOD_DIABLO_SIT_RUINED_CATHEDRAL_AT_THE_EDGE_OF_THE_VILLAGE`

### Standalone Fallback
Run it as a one-shot descent. The party takes the stone stairway from a ruined church into darkness, where the scent of death surrounds them and monsters wait below.
