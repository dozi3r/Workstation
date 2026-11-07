---
id: "MOD_DIABLO_SIT_CATACOMBS"
title: "The Catacombs"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Demon-Haunt", "Lore: Dungeon-Region"]
requires: ["Defense: Prepared-Party"]
tarot_affinity: ["Death", "The Devil", "The Moon"]
culture_quadrant: "Clan"
operational_profile: "Deliver"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "A dungeon area where Horned Demons are a particular bane."
standalone_fallback: "Run it as a one-shot: the party explores a tomb-like dungeon region where a single kind of horned demon is the greatest threat, and must find a way to get through or around them."
injected_mechanics:
  output_dial:
    level_1: "The Catacombs are quiet, with the demons' presence suggested only by signs and distant sounds."
    level_2: "Horned Demons appear in the passages and the party must fight or avoid them with care."
    level_3: "The demons press the party from several directions and withdrawal becomes difficult."
    level_4: "The Catacombs belong entirely to the demons, and the party is trapped, hunted and overwhelmed."
  threat_clocks:
    - name: "The Demons Close In"
      ticks: 6
      advances_when: "The party makes noise, lingers, or leaves demons alive behind them."
  yields_resource: "Safe passage through the dungeon region and the removal of its defining danger."
linked_entity: "N_CATACOMBS"
---

# MODULE MOD_DIABLO_SIT_CATACOMBS: The Catacombs

A dungeon area where Horned Demons are a particular bane.

### Dramatic Premise
Delvers who press deeper + a region dominated by Horned Demons = survival that depends on handling the one foe that defines the place.

### Core Premise
"The Horned Demons are the bane of the Catacombs." The area is defined by a single dominant threat, and the party's success depends on dealing with it.

### GM Placement & Synergies
Place it mid-dungeon as a region that tests preparation. It consumes the party's resources and feeds progress deeper into the dungeon. An arrival goes well when the party scouts, plans and fights on chosen ground. It goes badly when they stumble in tired and split, letting the demons dictate the encounter.

### 5D Sensory Pentagon
- **Physical environment:** A dungeon area of catacombs, with Horned Demons dwelling within.
- **Behaviors:** Horned Demons prowl the passages and threaten those who enter.
- **Relationships:** Horned Demons are found in the Catacombs and the Catacombs contain them.
- **Attitudes:** The demons are regarded as the bane of the place.
- **Values:** Caution and preparation over bravado; the dominant threat must be respected.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Horned Demons):** They hold the Catacombs as their domain and are its defining presence. *Leverage:* Numbers and ferocity within their territory. *Blind spot:* Bound to one area and a recognizable pattern of threat.
* **Main opponent (Delving party):** Intruders who must cross the Catacombs to progress. *Leverage:* Planning, tactics and the ability to retreat. *Blind spot:* Outmatched if caught unprepared by the demons.
* **Thematic shadow (Earlier victims):** Those who entered before and fell, serving as a warning. *Leverage:* Remains that hint at the demons' habits. *Blind spot:* They are already lost.
* **Tertiary outcast (Lone survivor):** Someone who has evaded the demons and wants out more than victory. *Leverage:* Knowledge of safer routes. *Blind spot:* Shaken, weak and distrustful.

### Output Dial
- **Level 1:** The Catacombs are quiet, with the demons' presence suggested only by signs and distant sounds.
- **Level 2:** Horned Demons appear in the passages and the party must fight or avoid them with care.
- **Level 3:** The demons press the party from several directions and withdrawal becomes difficult.
- **Level 4:** The Catacombs belong entirely to the demons, and the party is trapped, hunted and overwhelmed.

### Threat Clocks
- **The Demons Close In [6 Ticks]:** advances when The party makes noise, lingers, or leaves demons alive behind them.

### Yields
Safe passage through the dungeon region and the removal of its defining danger.

### Standalone Fallback
Run it as a one-shot: the party explores a tomb-like dungeon region where a single kind of horned demon is the greatest threat, and must find a way to get through or around them.
