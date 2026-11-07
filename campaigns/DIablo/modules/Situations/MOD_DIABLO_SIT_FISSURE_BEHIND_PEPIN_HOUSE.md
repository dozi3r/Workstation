---
id: "MOD_DIABLO_SIT_FISSURE_BEHIND_PEPIN_HOUSE"
title: "The Fissure behind Pepin's House"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Hell-Passage", "Authority: Threshold-Access"]
requires: ["Lore: Dungeon-Descent", "Defense: Village-Watch"]
tarot_affinity: ["The Tower", "Judgement", "The Moon"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "A fissure in the ground behind Pepin's house, opened by the up staircase on dungeon level 13, through which travelers can return to hell."
standalone_fallback: "Run it as a one-shot: the party climbs a staircase out of the depths and finds a crack in the earth behind a healer's house in a quiet village. Beyond it lies a way back down to somewhere far worse. They must decide whether to use it, seal it, or guard it."
injected_mechanics:
  output_dial:
    level_1: "The fissure sits quiet behind the house, noticed only by those who know what it is."
    level_2: "Travelers use the opening to descend while villagers keep an uneasy distance and rumors spread."
    level_3: "The village is fearful as the opening becomes contested ground, with watchers posted and tempers short."
    level_4: "The passage becomes a gateway into Tristram itself, and the village is overrun or abandoned."
  threat_clocks:
    - name: "The Village Notices"
      ticks: 6
      advances_when: "The party's comings and goings, or noise from the fissure, draw attention from Tristram's residents."
    - name: "Something Climbs Out"
      ticks: 6
      advances_when: "The fissure is left unguarded or the party delays making a decision about it."
  yields_resource: "A direct route to Hell, and a defensible choke point to watch or seal."
linked_entity: "N_FISSURE_BEHIND_PEPIN_HOUSE"
related: ["MOD_DIABLO_SIT_TRISTRAM", "MOD_DIABLO_SIT_HELL"]
---

# MODULE MOD_DIABLO_SIT_FISSURE_BEHIND_PEPIN_HOUSE: The Fissure behind Pepin's House

A fissure in the ground behind Pepin's house, opened by the up staircase on dungeon level 13, through which travelers can return to hell.

### Dramatic Premise
Heroes who climb toward safety + a door to hell opening at the doorstep of home = a choice between pursuing the evil and protecting the village.

### Core Premise
Taking the up staircase on level 13 opens a fissure in the ground behind Pepin's house, and through it one can return to hell. The scene is a threshold: safety in the village on one side, the source of the evil on the other.

### GM Placement & Synergies
Place it as the end of a dungeon climb or the start of a final descent. It consumes the party's arrival from the dungeon and feeds directly into Hell and Tristram. An arrival goes well when the party has prepared, has a clear intent for the passage, and keeps the village out of harm. It goes badly when they arrive wounded and undecided, or when the opening is left unwatched and the village pays.

### 5D Sensory Pentagon
- **Physical environment:** A fissure in the ground behind Pepin's house, in the village of Tristram, opened where the upward staircase from level 13 emerges.
- **Behaviors:** Villagers go about their business next door, while travelers approach the crack to go back to hell.
- **Relationships:** It is tied to Tristram by location, to the dungeon by the staircase, and to Hell as a two-way connection.
- **Attitudes:** Treated as the way back to hell: a route for those who mean to return, and a danger to those who live beside it.
- **Values:** Resolve and return over comfort; the village's calm rests beside a passage it cannot close.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Pepin):** A healer whose house stands beside the fissure and who wants the village safe and ordinary. *Leverage:* Trusted standing in Tristram and healing aid for those who return from the depths. *Blind spot:* Cannot close or guard a passage to hell by himself.
* **Main opponent (Powers of Hell):** Hell's denizens regard the fissure as a path between their realm and the village above. *Leverage:* The passage links Hell to Tristram. *Blind spot:* Their reach depends on a single fixed opening that can be watched.
* **Thematic shadow (The returning hero):** Whoever descends again accepts that the fight must be carried to its source. *Leverage:* Direct access to Hell via the fissure. *Blind spot:* Leaves the village, and any unfinished business above, behind.
* **Tertiary outcast (Frightened villager):** Believes the crack should be sealed or fled from, whatever it costs the heroes. *Leverage:* Knows the village and can raise alarm or hinder travelers. *Blind spot:* Has no means to act against what comes through.

### Output Dial
- **Level 1:** The fissure sits quiet behind the house, noticed only by those who know what it is.
- **Level 2:** Travelers use the opening to descend while villagers keep an uneasy distance and rumors spread.
- **Level 3:** The village is fearful as the opening becomes contested ground, with watchers posted and tempers short.
- **Level 4:** The passage becomes a gateway into Tristram itself, and the village is overrun or abandoned.

### Threat Clocks
- **The Village Notices [6 Ticks]:** advances when The party's comings and goings, or noise from the fissure, draw attention from Tristram's residents.
- **Something Climbs Out [6 Ticks]:** advances when The fissure is left unguarded or the party delays making a decision about it.

### Yields
A direct route to Hell, and a defensible choke point to watch or seal.

### Source Figures (verbatim evidence; not read by the app)
```
Dungeon level: 13
```

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`
- `MOD_DIABLO_SIT_HELL`

### Standalone Fallback
Run it as a one-shot: the party climbs a staircase out of the depths and finds a crack in the earth behind a healer's house in a quiet village. Beyond it lies a way back down to somewhere far worse. They must decide whether to use it, seal it, or guard it.
