---
id: "MOD_DIABLO_SIT_SNOTSPILL_SET_PIECE_DUNGEON_LEVEL_4"
title: "Snotspill's Set Piece"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Material: Tavern-Sign-Chest", "Defense: Guarded-Stair-Chokepoint", "Authority: Snotspill-Encounter"]
requires: ["Authority: Quest-For-The-Tavern-Sign", "Defense: Party-Strong-Enough-For-Massive-Monsters"]
tarot_affinity: ["The Chariot", "The Devil"]
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "Red"
hub_eligibility: "never"
summary: "A small set-piece area on Dungeon Level 4, between the player and the staircase down to Level 5. Snotspill waits here, and the large chest holding the tavern sign is here, guarded by several massive monsters."
standalone_fallback: "Run it as a one-shot boss room. The party must clear a small chamber held by Snotspill, his friends and several massive monsters to open the large chest and reach the stair down."
injected_mechanics:
  output_dial:
    level_1: "Snotspill and his friends are quickly beaten and the guards are thin, leaving the chest easy to open."
    level_2: "Snotspill and the massive monsters hold the area, and the party fights to open the chest and reach the stair."
    level_3: "The massive monsters swarm the room, Snotspill's friends flank the party, and the chest and stair are both out of reach."
    level_4: "The party is overwhelmed in the small chamber with no retreat, and the chest and stair stay out of reach."
  threat_clocks:
    - name: "The guards close in"
      ticks: 4
      advances_when: "The party fights in the open or fails to split Snotspill's friends from the massive monsters."
  yields_resource: "The party gains the large chest with the tavern sign, and passage to the staircase down."
linked_entity: "N_SNOTSPILL_SET_PIECE_DUNGEON_LEVEL_4"
related: ["MOD_DIABLO_SIT_OGDEN_SIGN_QUEST"]
---

# MODULE MOD_DIABLO_SIT_SNOTSPILL_SET_PIECE_DUNGEON_LEVEL_4: Snotspill's Set Piece

A small set-piece area on Dungeon Level 4, between the player and the staircase down to Level 5. Snotspill waits here, and the large chest holding the tavern sign is here, guarded by several massive monsters.

### Dramatic Premise
Heroes who need the way down + a chokepoint held by Snotspill and massive guardians = a fight that must be won to reach the chest and the stair

### Core Premise
A small set-piece area sits between the party and the staircase down. Snotspill waits here with his friends, and the large chest holding the tavern sign is guarded by several massive monsters. The area must be cleared to reach the stair.

### GM Placement & Synergies
Place it as the last obstacle before descending. It consumes the party's strength and the quest hook for the tavern sign, and it feeds the sign quest and the next descent. Arrival goes well when the party scouts, separates Snotspill from the guards, and claims the chest. It goes badly when they rush in, the massive monsters pin them, and the stair stays out of reach.

### 5D Sensory Pentagon
- **Physical environment:** A small set-piece area on the way to the staircase down, with a large chest at its centre.
- **Behaviors:** Snotspill waits here with his friends. Several massive monsters stand guard over the chest.
- **Relationships:** Snotspill leads his friends and the massive guardians. The chest is tied to the tavern sign quest.
- **Attitudes:** They are waiting, so the party is expected, and the place is defended.
- **Values:** The chest is worth defending and the stair is the prize. Nothing passes without a fight.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Snotspill and his friends):** This small area is theirs, and anyone heading for the stair has to deal with them. *Leverage:* They wait ready on ground they chose, between the party and the way down. *Blind spot:* They are tied to the spot and are cornered by a party that forces the fight.
* **Main opponent (The massive monsters):** They exist to guard the large chest and kill what approaches it. *Leverage:* Their size and number make the room dangerous to rush. *Blind spot:* They guard a fixed point, so they can be drawn off or fought one at a time.
* **Thematic shadow (The tavern sign chest):** What is lost can be recovered, but only at a cost. *Leverage:* The contents tie a quest to the room, so the party has to take it. *Blind spot:* It is bait, and the party is tempted to push on past what it can handle.
* **Tertiary outcast (The descending adventurer):** They only want the staircase down and have no stake in the chest. *Leverage:* They can skip the sign and press on to the stair. *Blind spot:* They cannot reach the stair without clearing the room first.

### Output Dial
- **Level 1:** Snotspill and his friends are quickly beaten and the guards are thin, leaving the chest easy to open.
- **Level 2:** Snotspill and the massive monsters hold the area, and the party fights to open the chest and reach the stair.
- **Level 3:** The massive monsters swarm the room, Snotspill's friends flank the party, and the chest and stair are both out of reach.
- **Level 4:** The party is overwhelmed in the small chamber with no retreat, and the chest and stair stay out of reach.

### Threat Clocks
- **The guards close in [4 Ticks]:** advances when The party fights in the open or fails to split Snotspill's friends from the massive monsters.

### Yields
The party gains the large chest with the tavern sign, and passage to the staircase down.

### Source Figures (verbatim evidence; not read by the app)
```
Dungeon level: 4
```

### Related Modules
- `MOD_DIABLO_SIT_OGDEN_SIGN_QUEST`

### Standalone Fallback
Run it as a one-shot boss room. The party must clear a small chamber held by Snotspill, his friends and several massive monsters to open the large chest and reach the stair down.
