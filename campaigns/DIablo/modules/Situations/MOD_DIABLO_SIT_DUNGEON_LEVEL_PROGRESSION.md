---
id: "MOD_DIABLO_SIT_DUNGEON_LEVEL_PROGRESSION"
title: "Dungeon Level Progression"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Depth-Threat-Ladder", "Ecology: Monster-Depth-Map"]
requires: ["Defense: Party-Readiness", "Lore: Bestiary-Knowledge"]
tarot_affinity: ["The Tower", "The Hermit"]
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "Monster types are ordered by dungeon depth. Hidden and Goat Demons appear mid-to-lower, Vipers lower, Overlords and Magma Demons deep, Horned Demons in the middle stretch, and Knights near the bottom."
standalone_fallback: "Use it as a descent table. Each stage down brings a new class of foe, and the party can run it as a sequence of escalating zones, each introduced by its signature monster."
injected_mechanics:
  output_dial:
    level_1: "The party descends with the gear and knowledge to meet each new monster class as it arrives."
    level_2: "A new class of monster appears earlier than expected, and the party must adapt to the threshold."
    level_3: "The party presses deeper than it is ready for and meets Vipers, Magma Demons or Overlords without answers."
    level_4: "Knights and the deepest powers meet a party that has run out of resources, and retreat is no longer possible."
  threat_clocks:
    - name: "Descent Outpaces Readiness"
      ticks: 6
      advances_when: "The party goes deeper without adapting to the new class of monsters."
    - name: "Cut Off From the Surface"
      ticks: 8
      advances_when: "The party commits to the deep levels without resupply or an escape route."
  yields_resource: "A clear threat ladder for pacing a delve, and the rewards that come with passing each threshold."
---

# MODULE MOD_DIABLO_SIT_DUNGEON_LEVEL_PROGRESSION: Dungeon Level Progression

Monster types are ordered by dungeon depth. Hidden and Goat Demons appear mid-to-lower, Vipers lower, Overlords and Magma Demons deep, Horned Demons in the middle stretch, and Knights near the bottom.

### Dramatic Premise
A party that pushes deeper for greater rewards + a dungeon that fields worse monsters at each stage = a climb in danger that tests whether they are ready.

### Core Premise
The walkthrough orders monsters by depth. Hidden and Goat Demons are found on the mid-to-lower levels, Vipers on the lower levels, Overlords and Magma Demons deep in the dungeon, and Knights near the bottom. Horned Demons are first expected in the middle stretch between two of the earlier levels.

### GM Placement & Synergies
Use it as the backbone for pacing a multi-session dungeon crawl. It consumes the party's readiness and bestiary knowledge and feeds the monster-template and early-pattern modules, since each tier is a variation on known templates. An arrival goes well when the party treats each new monster class as a signal to reassess. It goes badly when it pushes on assuming the next level will resemble the last.

### 5D Sensory Pentagon
- **Physical environment:** A dungeon that grows more infernal with depth, from mid-level halls through lower reaches to the deep levels near the bottom.
- **Behaviors:** Each depth is marked by its signature monsters, and the party meets progressively fiercer foes as it descends.
- **Relationships:** Hidden and Goat Demons hold the mid-to-lower levels, Vipers the lower levels, Overlords and Magma Demons the deep dungeon, and Knights the bottom.
- **Attitudes:** Horned Demons are first expected somewhere in the middle stretch, a warning that the dungeon is turning dangerous.
- **Values:** Depth equals danger, and each tier of monsters marks a threshold the party must be ready to cross.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Overlords):** Deep-dungeon powers who rule the lower reaches. *Leverage:* Their position deep in the dungeon means the party must pass them to go further. *Blind spot:* They are far from the surface, so any party that reaches them is already worn down.
* **Main opponent (Knights):** The last guardians near the bottom of the dungeon. *Leverage:* They block the final stretch and hit hardest against a weakened party. *Blind spot:* Reaching them means the party has already survived everything above.
* **Thematic shadow (Horned Demons):** The first sign that the dungeon has turned truly infernal. *Leverage:* Their appearance marks the change from manageable to serious. *Blind spot:* They are only a herald, and the worst is still to come.
* **Tertiary outcast (Hidden and Goat Demons, Vipers and Magma Demons):** Mid and lower foes, each tied to its own stretch of the descent. *Leverage:* Specialized threats that punish a party unprepared for their depth. *Blind spot:* Bound to their stretch of the dungeon, they are avoidable by leaving it.

### Output Dial
- **Level 1:** The party descends with the gear and knowledge to meet each new monster class as it arrives.
- **Level 2:** A new class of monster appears earlier than expected, and the party must adapt to the threshold.
- **Level 3:** The party presses deeper than it is ready for and meets Vipers, Magma Demons or Overlords without answers.
- **Level 4:** Knights and the deepest powers meet a party that has run out of resources, and retreat is no longer possible.

### Threat Clocks
- **Descent Outpaces Readiness [6 Ticks]:** advances when The party goes deeper without adapting to the new class of monsters.
- **Cut Off From the Surface [8 Ticks]:** advances when The party commits to the deep levels without resupply or an escape route.

### Yields
A clear threat ladder for pacing a delve, and the rewards that come with passing each threshold.

### Source Figures (verbatim evidence; not read by the app)
```
Horned Demons first expected: Between dungeon levels 5 and 6
```

### Standalone Fallback
Use it as a descent table. Each stage down brings a new class of foe, and the party can run it as a sequence of escalating zones, each introduced by its signature monster.
