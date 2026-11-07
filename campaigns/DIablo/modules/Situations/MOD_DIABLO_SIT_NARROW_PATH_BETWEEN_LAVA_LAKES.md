---
id: "MOD_DIABLO_SIT_NARROW_PATH_BETWEEN_LAVA_LAKES"
title: "Narrow Path Between Lava Lakes"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Defense: Chokepoint-Advantage", "Material: Defensible-Crossing"]
requires: ["Defense: Ranged-Attackers", "Lore: Cave-Midlevel-Access"]
tarot_affinity: ["The Chariot", "Strength"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Red"
hub_eligibility: "never"
summary: "A crossing between two lava lakes in the cave-like midlevels, narrower than a doorway and likely the most restrictive hurdle a horde of monsters can meet. Defenders gain the advantage; attackers must funnel through."
standalone_fallback: "Run it as a one-room set piece: a hero or party holds a crossing between lava lakes while a horde tries to funnel through, and the fight turns on who controls the choke."
injected_mechanics:
  output_dial:
    level_1: "The crossing is held easily; the horde trickles through the narrow path and is picked off."
    level_2: "The line holds with effort as the defender trades blows with a pair of foes while archers thin the rest."
    level_3: "Ranged attackers and sheer pressure strain the defenders, and the crossing begins to fail."
    level_4: "The line breaks, and the party is overrun at the lava's edge with no room to retreat."
  threat_clocks:
    - name: "The Line Cracks"
      ticks: 6
      advances_when: "The defender is worn down, ranged enemies find targets, or the archers lose their cover."
  yields_resource: "A defensible position that neutralizes a horde's numbers, and time to thin it out."
linked_entity: "N_NARROW_PATH_BETWEEN_LAVA_LAKES"
related: ["MOD_DIABLO_SIT_CAVERN_LEVELS"]
---

# MODULE MOD_DIABLO_SIT_NARROW_PATH_BETWEEN_LAVA_LAKES: Narrow Path Between Lava Lakes

A crossing between two lava lakes in the cave-like midlevels, narrower than a doorway and likely the most restrictive hurdle a horde of monsters can meet. Defenders gain the advantage; attackers must funnel through.

### Dramatic Premise
A fighter who holds the line + a path too narrow for a horde = a stand where numbers stop mattering and preparation decides the day.

### Core Premise
A narrow path between two lava lakes, common in the cave-like midlevels, is narrower than even a doorway and probably the most restrictive hurdle a horde of monsters can run into. It turns a numbers fight into a positional one: a strong character can stand toe-to-toe with one or two foes, and rogues can hit the crossing with arrows while the brutes slowly form a single-file line.

### GM Placement & Synergies
Place it in the cave-like midlevels, within the Cavern levels to which it is tied. It consumes the party's preparation and ranged support and feeds their ability to survive a horde. It pairs with the Caves and with a restorative stop such as the Blood Fountain afterward. An arrival goes well when the party sets a defender at the choke and archers behind. It goes badly when they are caught on the wrong side, lack ranged support, or face Poison Spitters, which lava only slightly slows. Whether the lava itself threatens those standing by it is not stated on the card and is the GM's call.

### 5D Sensory Pentagon
- **Physical environment:** A narrow path between two lava lakes, narrower than even a doorway, in the cave-like midlevels.
- **Behaviors:** Brutes slow to form a single-file line; a strong character stands toe-to-toe with one or two foes while rogues rain arrows on the crossing.
- **Relationships:** Defenders at the crossing against a horde trying to organize on the far side.
- **Attitudes:** Grim confidence among defenders, frustration among the bunched horde.
- **Values:** Position, discipline and picking enemies off while they organize.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The strong character holding the crossing):** One steady fighter at the choke is worth a dozen in the open. *Leverage:* Can stand toe-to-toe with one or two foes at a time. *Blind spot:* Cannot hold forever alone and is exposed to anything that goes around or over.
* **Main opponent (The horde of monsters):** Weight of numbers will break any line. *Leverage:* Sheer numbers and persistence. *Blind spot:* Slow to form a single-file line, which makes them easy to pick off.
* **Thematic shadow (Poison Spitters):** Range makes the choke irrelevant. *Leverage:* They attack from a distance, though lava lakes slightly inhibit their movement. *Blind spot:* Hampered by the lava around them.
* **Tertiary outcast (The rogue archers):** Stay back, shoot the crossing, never be caught in the melee. *Leverage:* A hail of arrows on the crossing while the brutes organize. *Blind spot:* Fragile if the line breaks.

### Output Dial
- **Level 1:** The crossing is held easily; the horde trickles through the narrow path and is picked off.
- **Level 2:** The line holds with effort as the defender trades blows with a pair of foes while archers thin the rest.
- **Level 3:** Ranged attackers and sheer pressure strain the defenders, and the crossing begins to fail.
- **Level 4:** The line breaks, and the party is overrun at the lava's edge with no room to retreat.

### Threat Clocks
- **The Line Cracks [6 Ticks]:** advances when The defender is worn down, ranged enemies find targets, or the archers lose their cover.

### Yields
A defensible position that neutralizes a horde's numbers, and time to thin it out.

### Related Modules
- `MOD_DIABLO_SIT_CAVERN_LEVELS`

### Standalone Fallback
Run it as a one-room set piece: a hero or party holds a crossing between lava lakes while a horde tries to funnel through, and the fight turns on who controls the choke.
