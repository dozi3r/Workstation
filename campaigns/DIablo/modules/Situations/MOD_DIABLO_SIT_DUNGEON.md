---
id: "MOD_DIABLO_SIT_DUNGEON"
title: "The Dungeon"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Servants-of-Darkness-Habitat", "Lore: Descent-Beneath-Tristram", "Defense: Resistant-Unique-Monsters"]
requires: ["Lore: Surface-Settlement-Gateway"]
tarot_affinity: ["The Moon", "Death"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Black"
hub_eligibility: "always"
summary: "The dark subterranean realm beneath Tristram, home of the Servants of Darkness. Its dank rooms and hordes grow harder with depth and lead down to the Cavern levels."
standalone_fallback: "Run it as a one-shot delve. The party descends from a threatened town into a godless abattoir of dank rooms and dark halls, faces escalating hordes and a few Uniques resistant to common magic, and tries to reach a goal and get back out."
injected_mechanics:
  output_dial:
    level_1: "Quiet, dank halls with stray monsters and the sense of being watched."
    level_2: "Hordes of minions and a resistant Unique make each room a real fight."
    level_3: "Packs and Uniques converge, common magic fails, and retreat to the surface is in doubt."
    level_4: "The abattoir closes around the party, every hall is held, and only a few leave alive."
  threat_clocks:
    - name: "Descent toll"
      ticks: 6
      advances_when: "The party presses deeper without resting or resupplying."
    - name: "The Unique stirs"
      ticks: 4
      advances_when: "The party makes noise or kills with magic that a resistant Unique shrugs off."
  yields_resource: "Treasure, knowledge of the Servants of Darkness, and progress toward ending the threat beneath the town."
linked_entity: "N_DUNGEON"
related: ["MOD_DIABLO_SIT_TRISTRAM", "MOD_DIABLO_SIT_SAVE_BEFORE_ACCESSING_A_SHRINE", "MOD_DIABLO_SIT_THREE_HEROES", "MOD_DIABLO_SIT_CAVERN_LEVELS", "MOD_DIABLO_SIT_SERVANTS_OF_DARKNESS"]
---

# MODULE MOD_DIABLO_SIT_DUNGEON: The Dungeon

The dark subterranean realm beneath Tristram, home of the Servants of Darkness. Its dank rooms and hordes grow harder with depth and lead down to the Cavern levels.

### Dramatic Premise
A hero who goes below to end a nightmare + a realm packed with hordes and resistant Uniques that grows worse with every level = a descent that costs more the deeper they push.

### Core Premise
The dungeon is the godless abattoir under Tristram. It is the realm of the Servants of Darkness and a trial of attrition for anyone who descends. It holds minion hordes, Uniques that shrug off common magic, and the Cavern levels deeper within.

### GM Placement & Synergies
Use it as the main hub of an adventure, with the town above as the safe base and the Cavern levels as the deeper escalation. It consumes the party's supplies and resolve and feeds the town with news of what lies below. An arrival goes well when the party scouts, rests and chooses fights, and badly when they treat every level as routine and meet a resistant Unique unprepared.

### 5D Sensory Pentagon
- **Physical environment:** Dank rooms and dark halls beneath the town.
- **Behaviors:** Flesh-eating demons, rotting corpses and winged beasties lurch, swarm and flutter through the halls.
- **Relationships:** The Servants of Darkness dwell here, and Uniques lead or accompany hordes of minions. The town above is connected by the descent.
- **Attitudes:** Hostile and predatory, with nothing sacred about it.
- **Values:** Appetite, domination and the ruin of the living.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Servants of Darkness):** The dungeon is their realm, and intruders are meat. *Leverage:* Numbers, depth, and Unique monsters resistant or immune to common magic. *Blind spot:* Their strength is spread across levels, so they meet intruders piecemeal.
* **Main opponent (The three heroes):** The darkness under the town must be explored and broken. *Leverage:* They explore the dungeon, and they bring varied skills and the will to descend. *Blind spot:* They are few, and the dungeon grows harsher with depth.
* **Thematic shadow (Tristram):** The town above survives only if the dungeon stays below. *Leverage:* It is the link to the surface, where supplies and rest lie. *Blind spot:* It depends entirely on the descenders and cannot protect itself.
* **Tertiary outcast (A delver who stayed too long below):** Down here the only rule is to survive the next room. *Leverage:* Knows the layout of rooms and halls that others have not mapped. *Blind spot:* Worn down, suspicious and possibly marked by what lives here.

### Output Dial
- **Level 1:** Quiet, dank halls with stray monsters and the sense of being watched.
- **Level 2:** Hordes of minions and a resistant Unique make each room a real fight.
- **Level 3:** Packs and Uniques converge, common magic fails, and retreat to the surface is in doubt.
- **Level 4:** The abattoir closes around the party, every hall is held, and only a few leave alive.

### Threat Clocks
- **Descent toll [6 Ticks]:** advances when The party presses deeper without resting or resupplying.
- **The Unique stirs [4 Ticks]:** advances when The party makes noise or kills with magic that a resistant Unique shrugs off.

### Yields
Treasure, knowledge of the Servants of Darkness, and progress toward ending the threat beneath the town.

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`
- `MOD_DIABLO_SIT_SAVE_BEFORE_ACCESSING_A_SHRINE`
- `MOD_DIABLO_SIT_THREE_HEROES`
- `MOD_DIABLO_SIT_CAVERN_LEVELS`
- `MOD_DIABLO_SIT_SERVANTS_OF_DARKNESS`

### Standalone Fallback
Run it as a one-shot delve. The party descends from a threatened town into a godless abattoir of dank rooms and dark halls, faces escalating hordes and a few Uniques resistant to common magic, and tries to reach a goal and get back out.
