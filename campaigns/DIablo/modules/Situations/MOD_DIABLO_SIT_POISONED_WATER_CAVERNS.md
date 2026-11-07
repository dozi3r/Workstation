---
id: "MOD_DIABLO_SIT_POISONED_WATER_CAVERNS"
title: "Poisoned Water Caverns"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Fouled-Waterway", "Lore: Dark-Passage-Entrance", "Defense: Demon-Infestation-Gauntlet"]
requires: ["Authority: Reason-To-Seek-The-Spring", "Tech: Light-Source-For-Rock-Corridors"]
tarot_affinity: ["The Moon", "The Tower"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "Black"
hub_eligibility: "never"
summary: "A set-piece cavern level beyond a crack in the Level 2 wall, where a fouled underground spring is tainted by a demon infestation."
standalone_fallback: "Run it as a one-shot cavern crawl. The party finds a crack in a wall marked 'To A Dark Passage', is ambushed by fallen ones on arrival, and fights through rock corridors of Goat Demons and lesser beasts to the fouled spring. They can cleanse it or flee."
injected_mechanics:
  output_dial:
    level_1: "A quiet crawl through the rock corridors, with a few lesser beasts and a foul smell from the water."
    level_2: "Fallen ones ambush the arrival point, and Goat Demons hold the corridors between the party and the spring."
    level_3: "The infestation is thick in every corridor, the water is dangerously tainted, and retreat to the crack is contested."
    level_4: "The cavern is a demon stronghold: the spring is poisoned beyond cleansing, the way back is cut off, and the party is trapped in the dark."
  threat_clocks:
    - name: "The taint spreads"
      ticks: 6
      advances_when: "The party lingers, fights loudly, or lets demons fall into the water."
  yields_resource: "The party gains a cleared dark passage, whatever lore or loot the marked entrance hid, and the chance to end the spring's fouling."
linked_entity: "N_POISONED_WATER_CAVERNS"
---

# MODULE MOD_DIABLO_SIT_POISONED_WATER_CAVERNS: Poisoned Water Caverns

A set-piece cavern level beyond a crack in the Level 2 wall, where a fouled underground spring is tainted by a demon infestation.

### Dramatic Premise
Heroes who follow every sign of hidden lore + a spring tainted by demons below = a fight through foul rock corridors to purify the water or be swallowed by the infestation

### Core Premise
A crack in a wall of the second depth, framed with ornaments normally kept for important tomes, leads to caverns where a spring has been fouled by demons. Fallen ones wait at the arrival point. The route is a few rock corridors of Goat Demons and lesser beasts, so it is a compact set piece.

### GM Placement & Synergies
Place it as a side branch off a dungeon level, found by a party that investigates odd wall decoration. It consumes a light source and an appetite for lore. It feeds any plot about tainted water, demon spread, or hidden passages. Arrival goes well when the party scouts the entrance and meets the fallen ones prepared. It goes badly when they walk in blind, are ambushed, and are caught between the beasts and the poisoned water.

### 5D Sensory Pentagon
- **Physical environment:** Rock corridors and caverns with a fouled waterway running through them, reached through a crack in the wall.
- **Behaviors:** Fallen ones wait at the arrival point. Goat Demons and lesser beasts hold the corridors.
- **Relationships:** The demon infestation has taken over a spring that once ran clean. Beasts follow the demons' lead.
- **Attitudes:** The place feels hidden and deliberately set apart. The ornate marking promises lore but delivers an ambush.
- **Values:** Taint is territory. Whoever holds the water holds the dark passage.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Fallen Ones):** The cavern is theirs to guard, and arrivals are intruders to be met at the door. *Leverage:* They wait at the entry and so have the first strike on anyone who comes through. *Blind spot:* They are posted to the arrival point and give ground once the party is past them.
* **Main opponent (Goat Demons):** The caverns are a demon holding and the poisoned spring is proof of their claim. *Leverage:* They are heavier hitters than the lesser beasts and are spread through the corridors. *Blind spot:* They are bound to the corridors and are drawn out piecemeal.
* **Thematic shadow (The marked wall):** Treasure and truth are hidden behind ornament, and curiosity is the way in. *Leverage:* The 'To A Dark Passage' label draws in anyone who loves lore. *Blind spot:* The ornament promises an answer it does not give, and the reward is a fight.
* **Tertiary outcast (Lesser beasts):** They live where the water has gone wrong and answer to no one. *Leverage:* They are numerous, fill gaps in the corridors, and cannot easily be bargained with. *Blind spot:* They have no plan and break when their demon masters fall.

### Output Dial
- **Level 1:** A quiet crawl through the rock corridors, with a few lesser beasts and a foul smell from the water.
- **Level 2:** Fallen ones ambush the arrival point, and Goat Demons hold the corridors between the party and the spring.
- **Level 3:** The infestation is thick in every corridor, the water is dangerously tainted, and retreat to the crack is contested.
- **Level 4:** The cavern is a demon stronghold: the spring is poisoned beyond cleansing, the way back is cut off, and the party is trapped in the dark.

### Threat Clocks
- **The taint spreads [6 Ticks]:** advances when The party lingers, fights loudly, or lets demons fall into the water.

### Yields
The party gains a cleared dark passage, whatever lore or loot the marked entrance hid, and the chance to end the spring's fouling.

### Standalone Fallback
Run it as a one-shot cavern crawl. The party finds a crack in a wall marked 'To A Dark Passage', is ambushed by fallen ones on arrival, and fights through rock corridors of Goat Demons and lesser beasts to the fouled spring. They can cleanse it or flee.
