---
id: "MOD_DIABLO_SIT_HELL_LEVELS"
title: "Hell Levels"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Material: Best-Treasure", "Climax: Diablo-Confrontation", "Lore: Return-Route-To-Town", "Ecology: Magical-Monster-Hordes"]
requires: ["Defense: Party-Combat-Capability", "Lore: Dungeon-Descent"]
tarot_affinity: ["The Devil", "The Tower", "Judgement"]
culture_quadrant: "Clan"
operational_profile: "Deliver"
mtg_color: "Black"
hub_eligibility: "never"
summary: "The bottom of the dungeon, with large crowds of magical monsters, Succubi and Counselor-type monsters. There is room to run, so ranged attackers can keep their distance, and the best treasure and Diablo himself are here."
standalone_fallback: "Run the Hell levels as a final-descent one-shot. The party fights through crowds of magical monsters in open spaces, survives the Succubi, and reaches Diablo for the climax, with a way back to town opening along the way."
injected_mechanics:
  output_dial:
    level_1: "The party moves through the Hell levels with careful use of distance and finds good treasure with manageable fights."
    level_2: "Crowds of magical monsters keep pressing, and the Succubi turn every fight into a long chase."
    level_3: "The party is swarmed on open ground, with no doorways to funnel enemies and supplies running low."
    level_4: "The party is overwhelmed by crowds and Succubi in the open, cut off from retreat, and Diablo waits at the end."
  threat_clocks:
    - name: "The Party's Supplies Run Out"
      ticks: 6
      advances_when: "Long fights with the Succubi and crowds drain healing and resources before the party reaches the last level."
    - name: "Diablo's Approach"
      ticks: 8
      advances_when: "The party descends deeper or delays, bringing the confrontation closer."
  yields_resource: "The best treasure in the game, the confrontation with Diablo, and another way back to the town level."
linked_entity: "N_HELL_LEVELS"
related: ["MOD_DIABLO_SIT_TRISTRAM"]
---

# MODULE MOD_DIABLO_SIT_HELL_LEVELS: Hell Levels

The bottom of the dungeon, with large crowds of magical monsters, Succubi and Counselor-type monsters. There is room to run, so ranged attackers can keep their distance, and the best treasure and Diablo himself are here.

### Dramatic Premise
A party worn down by the descent + open ground full of magical monsters, with Diablo waiting at the bottom = the best reward costs the hardest fights.

### Core Premise
The Hell levels are the final stretch of the dungeon, with large crowds of magical monsters in open ground. Distance attackers do well here since they are not easily drawn through doorways, while the Warrior has the roughest road. Succubi are the particular danger, and the last levels hold the best treasure and Diablo.

### GM Placement & Synergies
Place this as the final act of a dungeon campaign. It consumes the party's accumulated resources and feeds the climax with Diablo. Reaching it opens another route to Tristram, and the town's merchants begin stocking random Elixirs. An arrival goes well when the party comes prepared, uses distance and open ground to their advantage, and retreats to town to resupply. It goes badly when they push on without supplies or force melee in the open.

### 5D Sensory Pentagon
- **Physical environment:** The bottom of the dungeon, with enough open room for ranged attackers to run and keep their distance, so they are not easily drawn through doorways.
- **Behaviors:** Large crowds of magical monsters press in. Succubi chase, so there is no such thing as a short combat. The Counselor-type monsters stay in the depths and do not pursue.
- **Relationships:** Diablo holds the last level. The merchants in town begin to stock random Elixirs once the party descends.
- **Attitudes:** Relentless and hostile, and the toughest road for those who must close to melee.
- **Values:** The best treasure in the game is held in the last levels.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Diablo):** The bottom of the dungeon is his seat, and everything above is under his shadow. *Leverage:* He holds the deepest level and the best treasure around him. *Blind spot:* He is fixed at the bottom and the party can choose when to come for him.
* **Main opponent (The Succubi):** They hunt the intruders and never let a fight end quickly. *Leverage:* They chase, and the open ground gives them room to harry the party. *Blind spot:* They are drawn into pursuit, which can be used to pull them apart from the crowd.
* **Thematic shadow (The Counselor-type monsters):** They hold their ground in the depths and do not chase. *Leverage:* They are magical, dangerous at range and found deep in hell. *Blind spot:* They do not pursue, so the party can avoid or pick them off from outside their reach.
* **Tertiary outcast (The Warrior):** The adventurer who must close to melee finds no cover and no chokepoint here. *Leverage:* Strength and toughness for the fights that cannot be avoided. *Blind spot:* The open ground and ranged magic make this the roughest road for them.

### Output Dial
- **Level 1:** The party moves through the Hell levels with careful use of distance and finds good treasure with manageable fights.
- **Level 2:** Crowds of magical monsters keep pressing, and the Succubi turn every fight into a long chase.
- **Level 3:** The party is swarmed on open ground, with no doorways to funnel enemies and supplies running low.
- **Level 4:** The party is overwhelmed by crowds and Succubi in the open, cut off from retreat, and Diablo waits at the end.

### Threat Clocks
- **The Party's Supplies Run Out [6 Ticks]:** advances when Long fights with the Succubi and crowds drain healing and resources before the party reaches the last level.
- **Diablo's Approach [8 Ticks]:** advances when The party descends deeper or delays, bringing the confrontation closer.

### Yields
The best treasure in the game, the confrontation with Diablo, and another way back to the town level.

### Source Figures (verbatim evidence; not read by the app)
```
Diablo's level: 16
```

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`

### Standalone Fallback
Run the Hell levels as a final-descent one-shot. The party fights through crowds of magical monsters in open spaces, survives the Succubi, and reaches Diablo for the climax, with a way back to town opening along the way.
