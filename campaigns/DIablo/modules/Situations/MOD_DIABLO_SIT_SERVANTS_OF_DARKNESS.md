---
id: "MOD_DIABLO_SIT_SERVANTS_OF_DARKNESS"
title: "Servants of Darkness"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Monster-Host", "Defense: Dungeon-Garrison", "Lore: Monster-Taxonomy"]
requires: ["Authority: Diablo-Command", "Ecology: Dungeon-Habitat"]
tarot_affinity: ["The Devil", "Death", "The Moon"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "The vast host of dungeon monsters, unique horrors with a single purpose, which is to kill. They fall into Undead, Animal-based monsters and Demons, and are served up by category and template."
standalone_fallback: "Run it as a single encounter table. Pick one of three families (Undead, Animal-based, Demon), build a monster from a template in that family, and place it where the party must pass."
injected_mechanics:
  output_dial:
    level_1: "A few scattered servants turn up as routine hazards of the descent."
    level_2: "Groups of one family, such as Undead, Animal-based or Demon, contest the party's route and demand tactics."
    level_3: "Mixed families swarm the party, and the dungeon feels like one hostile organism."
    level_4: "The full host converges and the party faces an unbroken tide with no safe ground."
  threat_clocks:
    - name: "The Host Gathers"
      ticks: 6
      advances_when: "The party makes noise, lingers in one place, or leaves earlier encounters unresolved."
  yields_resource: "Knowledge of each monster family's habits, and safer passage through the dungeon once a family's pattern is understood."
related: ["MOD_DIABLO_SIT_DUNGEON"]
---

# MODULE MOD_DIABLO_SIT_SERVANTS_OF_DARKNESS: Servants of Darkness

The vast host of dungeon monsters, unique horrors with a single purpose, which is to kill. They fall into Undead, Animal-based monsters and Demons, and are served up by category and template.

### Dramatic Premise
Monsters bred for nothing but killing + heroes who must cross their territory = every room is a test of the party's endurance.

### Core Premise
The Servants of Darkness are a very large host of unique horrors with one purpose, which is to kill. They are grouped into Undead, Animal-based monsters and Demons, and refined into templates. Which monster appears is chosen randomly or by the depth of the level, so treat the host as a generator rather than a fixed cast.

### GM Placement & Synergies
Use it as the standing background for any dungeon. It consumes Diablo's command and a habitat, and it feeds encounters, garrisons and lore about the dungeon. Link it to the dungeon module. It goes well when each family has a recognizable feel and the party can learn to read it. It goes badly when every fight is the same swarm and the variety of templates is lost.

### 5D Sensory Pentagon
- **Physical environment:** The subterranean lands of Tristram, filled with flesh-eating demons, rotting corpses and winged beasties.
- **Behaviors:** They lurch, swarm and flutter through the dungeon, and kill is their one aim.
- **Relationships:** They serve Diablo, who commands them, and they inhabit the dungeon. Undead, Animal-based monsters and Demons are their three families.
- **Attitudes:** Relentless, mindless hostility.
- **Values:** Killing is the only purpose, and nothing else counts.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Diablo):** The monsters are his army, existing to kill on his behalf. *Leverage:* He commands them and they serve him. *Blind spot:* His power rests on servants who have no loyalty beyond killing.
* **Main opponent (The delving heroes):** The host must be fought through to restore the world above. *Leverage:* Skill, preparation and the chance to pick their battles. *Blind spot:* They are outnumbered by a host built to kill.
* **Thematic shadow (The Demons):** They are the purest form of the dungeon's malice. *Leverage:* Raw menace and a place of command within the host. *Blind spot:* They are bound to a master and a single purpose.
* **Tertiary outcast (The Animal-based monsters):** They are beasts twisted into killers and sit apart from the Undead and Demons. *Leverage:* They are the host's most natural fauna. *Blind spot:* They are the least bound by any higher purpose, so they are the easiest to read.

### Output Dial
- **Level 1:** A few scattered servants turn up as routine hazards of the descent.
- **Level 2:** Groups of one family, such as Undead, Animal-based or Demon, contest the party's route and demand tactics.
- **Level 3:** Mixed families swarm the party, and the dungeon feels like one hostile organism.
- **Level 4:** The full host converges and the party faces an unbroken tide with no safe ground.

### Threat Clocks
- **The Host Gathers [6 Ticks]:** advances when The party makes noise, lingers in one place, or leaves earlier encounters unresolved.

### Yields
Knowledge of each monster family's habits, and safer passage through the dungeon once a family's pattern is understood.

### Source Figures (verbatim evidence; not read by the app)
```
Number of monster types: 150
```

### Related Modules
- `MOD_DIABLO_SIT_DUNGEON`

### Standalone Fallback
Run it as a single encounter table. Pick one of three families (Undead, Animal-based, Demon), build a monster from a template in that family, and place it where the party must pass.
