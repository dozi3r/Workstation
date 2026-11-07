---
id: "MOD_DIABLO_SIT_CURSED_CATHEDRAL"
title: "The Cursed Cathedral"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Dungeon-Main-Entrance", "Defense: Threshold-Chokepoint", "Authority: Corrupted-Sacred-Ground"]
requires: ["Lore: Surface-Settlement-Gateway"]
tarot_affinity: ["Judgement", "The Devil"]
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "The church in Tristram. Its front door is the main entrance to the dungeon and leads down to the first level of the labyrinth."
standalone_fallback: "Run it as a one-shot threshold scene. The party stands at the front door of a cursed church, goes down into the labyrinth beneath it, and faces the first room-by-room exploration. The door is also their way back, along with stairways deep below that open to the town."
injected_mechanics:
  output_dial:
    level_1: "A quiet threshold. The door stands closed, and the descent is an ordinary decision."
    level_2: "The church feels watched. Delvers go in and the labyrinth below is cleared room by room."
    level_3: "Monsters press toward the stairways, and the church door is the town's last line."
    level_4: "What lives below breaks out through the cathedral, and the town's sacred center becomes its doom."
  threat_clocks:
    - name: "The curse spreads upward"
      ticks: 6
      advances_when: "The labyrinth below is left uncontested or its horrors grow."
    - name: "Breach at the threshold"
      ticks: 4
      advances_when: "Monsters follow retreating delvers up the stairways toward the town."
  yields_resource: "Access to the first level of the labyrinth, a safe return route to Tristram, and a clear sense of how the dungeon connects to the town."
linked_entity: "N_CURSED_CATHEDRAL"
related: ["MOD_DIABLO_SIT_TRISTRAM", "MOD_DIABLO_SIT_CATACOMBS_MAUSOLEUM"]
---

# MODULE MOD_DIABLO_SIT_CURSED_CATHEDRAL: The Cursed Cathedral

The church in Tristram. Its front door is the main entrance to the dungeon and leads down to the first level of the labyrinth.

### Dramatic Premise
A town that built its faith on a church + a door that now leads down into a labyrinth of increasingly vicious monsters = a sacred place that serves as the way into hell.

### Core Premise
The cathedral is the main entrance to the dungeon. Its front door leads to the first level of the labyrinth beneath it, where the party explores room by room. It is a holy place turned into a doorway, and the one link between the town and the horrors below.

### GM Placement & Synergies
Use it as the opening and closing scene of any delve. It consumes the party's readiness and feeds them into the dungeon. Stairways deep within the dungeon open back to Tristram, so it also marks the way home. An arrival goes well when the party prepares, learns what they can from the town, and treats the door as a decision. It goes badly when they descend carelessly or are chased back up with monsters on their heels.

### 5D Sensory Pentagon
- **Physical environment:** A church in Tristram whose front door opens onto the way down. Below it lies a labyrinth explored room by room.
- **Behaviors:** Delvers pass through the door and descend. Stairways deep within the dungeon open back to the town.
- **Relationships:** It stands in Tristram and connects the town to the labyrinth. It is the surface end of the route that leads down through the Catacombs.
- **Attitudes:** A cursed holy place, where faith has been turned into a threshold.
- **Values:** Passage, thresholds, and the memory of a sacred purpose now corrupted.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Tristram):** The town wants the church and its descent managed and its people kept safe. *Leverage:* It controls the surface side of the entrance and the supplies delvers need. *Blind spot:* It cannot close the door or defend itself against what comes up.
* **Main opponent (The labyrinth's monsters):** The door is an invitation, and each level below is another mouth. *Leverage:* Each level beneath the church is more vicious than the last. *Blind spot:* They are bound to the depths, so the church door marks the limit of their reach.
* **Thematic shadow (The cathedral's lost faith):** A holy place cannot be abandoned, even when it has been cursed. *Leverage:* Its sacred ground and purpose make it a powerful symbol to the town. *Blind spot:* The curse has twisted it, and the sacred has become the gateway.
* **Tertiary outcast (A watcher at the church door):** Someone must see who goes in and who comes out. *Leverage:* Knows who has descended and when they were last seen. *Blind spot:* Powerless to follow, and haunted by those who never returned.

### Output Dial
- **Level 1:** A quiet threshold. The door stands closed, and the descent is an ordinary decision.
- **Level 2:** The church feels watched. Delvers go in and the labyrinth below is cleared room by room.
- **Level 3:** Monsters press toward the stairways, and the church door is the town's last line.
- **Level 4:** What lives below breaks out through the cathedral, and the town's sacred center becomes its doom.

### Threat Clocks
- **The curse spreads upward [6 Ticks]:** advances when The labyrinth below is left uncontested or its horrors grow.
- **Breach at the threshold [4 Ticks]:** advances when Monsters follow retreating delvers up the stairways toward the town.

### Yields
Access to the first level of the labyrinth, a safe return route to Tristram, and a clear sense of how the dungeon connects to the town.

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`
- `MOD_DIABLO_SIT_CATACOMBS_MAUSOLEUM`

### Standalone Fallback
Run it as a one-shot threshold scene. The party stands at the front door of a cursed church, goes down into the labyrinth beneath it, and faces the first room-by-room exploration. The door is also their way back, along with stairways deep below that open to the town.
