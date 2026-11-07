---
id: "MOD_DIABLO_SIT_CRYPT_IN_THE_GRAVEYARD"
title: "Crypt in the Graveyard"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Defense: Safe-Retreat-Route", "Lore: Graveyard-Threshold"]
requires: ["Authority: Town-Sanctuary", "Ecology: Deep-Dungeon-Descent"]
tarot_affinity: ["Death", "The Moon"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "A crypt in Tristram's graveyard where the stairway from the fifth dungeon level emerges, giving delvers a way back to town."
standalone_fallback: "Run it as a one-shot: the party climbs out of a lower dungeon through a crypt into a quiet graveyard above a frightened village, and must decide whether to rest, resupply and return below or seal the way behind them."
injected_mechanics:
  output_dial:
    level_1: "The crypt is a quiet, reliable exit and the party passes through to town unmolested."
    level_2: "The stairway is usable, but the graveyard stirs uneasily and the party must move carefully."
    level_3: "Something follows the party up the stairs and the crypt becomes a fight to protect the town."
    level_4: "The crypt becomes a breach and the dungeon's horrors pour into Tristram's graveyard and the town beyond."
  threat_clocks:
    - name: "Breach at the Crypt"
      ticks: 6
      advances_when: "Delvers flee upward with pursuers, the crypt goes unguarded, or the dead are disturbed."
  yields_resource: "A safe way back to town to heal, resupply and regroup, plus knowledge of what is stirring below."
linked_entity: "N_CRYPT_IN_THE_GRAVEYARD"
related: ["MOD_DIABLO_SIT_TRISTRAM"]
---

# MODULE MOD_DIABLO_SIT_CRYPT_IN_THE_GRAVEYARD: Crypt in the Graveyard

A crypt in Tristram's graveyard where the stairway from the fifth dungeon level emerges, giving delvers a way back to town.

### Dramatic Premise
Delvers who need to recover + a way home that opens onto the dead = relief shadowed by the thing they left below.

### Core Premise
The fifth level of the dungeon has stairways rising into the crypt in Tristram's graveyard, opening a route to the town. It is both lifeline and weak point: a way home for the party and a door for whatever follows.

### GM Placement & Synergies
Place it as the first reliable exit after the early dungeon descent. It consumes the party's need for rest and supplies, and feeds Tristram's scenes of recovery, trade and rumor. An arrival goes well when the party reaches the crypt unpursued and uses the town to prepare. It goes badly when pursuers follow them up, or when retreat becomes habit and the town starts to bear the cost.

### 5D Sensory Pentagon
- **Physical environment:** A crypt in Tristram's graveyard; stairways rise out of it from the dungeon below.
- **Behaviors:** Weary adventurers climb out toward the town; villagers avoid the graveyard.
- **Relationships:** The crypt ties the dungeon's fifth level to Tristram, linking the buried horror to the people above.
- **Attitudes:** Relief at reaching the surface mixed with unease at what the crypt lets out or lets in.
- **Values:** Return, recovery and the thin line between the living town and what lies beneath it.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Tristram):** The town wants the graveyard quiet and its heroes returning alive. *Leverage:* Shelter, trade and healing waiting at the top of the stairs. *Blind spot:* It cannot defend the crypt itself and depends on outsiders.
* **Main opponent (The dungeon's denizens):** The passage runs both ways and the dead have a claim on the surface. *Leverage:* The stairway offers them a path to the town. *Blind spot:* They are drawn to the route and can be ambushed or sealed off at it.
* **Thematic shadow (A returning delver):** Retreat is wisdom, not cowardice. *Leverage:* Knows exactly what waits below the crypt. *Blind spot:* Brings the dungeon's taint back up with them.
* **Tertiary outcast (A graveyard watcher):** Someone must keep vigil over the crypt, whatever the town prefers. *Leverage:* Sees who and what climbs out, and when. *Blind spot:* Isolated, doubted and easily silenced.

### Output Dial
- **Level 1:** The crypt is a quiet, reliable exit and the party passes through to town unmolested.
- **Level 2:** The stairway is usable, but the graveyard stirs uneasily and the party must move carefully.
- **Level 3:** Something follows the party up the stairs and the crypt becomes a fight to protect the town.
- **Level 4:** The crypt becomes a breach and the dungeon's horrors pour into Tristram's graveyard and the town beyond.

### Threat Clocks
- **Breach at the Crypt [6 Ticks]:** advances when Delvers flee upward with pursuers, the crypt goes unguarded, or the dead are disturbed.

### Yields
A safe way back to town to heal, resupply and regroup, plus knowledge of what is stirring below.

### Source Figures (verbatim evidence; not read by the app)
```
Dungeon level: 5
```

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`

### Standalone Fallback
Run it as a one-shot: the party climbs out of a lower dungeon through a crypt into a quiet graveyard above a frightened village, and must decide whether to rest, resupply and return below or seal the way behind them.
