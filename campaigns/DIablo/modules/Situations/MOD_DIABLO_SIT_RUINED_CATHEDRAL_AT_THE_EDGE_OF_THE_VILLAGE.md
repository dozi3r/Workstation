---
id: "MOD_DIABLO_SIT_RUINED_CATHEDRAL_AT_THE_EDGE_OF_THE_VILLAGE"
title: "Ruined Cathedral at the Edge of the Village"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Strange-Ritual-Rumors", "Tech: Descent-Access-Stairway", "Ecology: Gateway-To-Underworld"]
requires: ["Authority: Frightened-Local-Populace"]
tarot_affinity: ["The Tower", "The Moon", "Death"]
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "A ruined cathedral at the edge of a somber, twilit village, where the townsfolk say strange rituals are performed. Dim light seeps from its church doorway, and inside a stone stairway plunges into darkness toward a dungeon."
standalone_fallback: "Run it as a one-shot threshold scene. The party arrives at a twilit village, hears of rituals in the ruined cathedral, meets a dying man at the church door, and must decide whether to take the stairway down."
injected_mechanics:
  output_dial:
    level_1: "The village is gloomy and rumor-ridden, the doorway glows dimly, and the party can study the ruin from outside."
    level_2: "The dying man and the villagers' warnings press the party toward the cathedral, and the stairway beckons."
    level_3: "The rituals and the dark riders make the village's decline plain, and the party must act or watch it empty."
    level_4: "The village is lost or the party is trapped on the stairway, with the scent of death leaving no doubt about what lies below."
  threat_clocks:
    - name: "The Village Empties"
      ticks: 6
      advances_when: "The party delays, and the dark riders and rituals continue unopposed."
    - name: "The Rituals Complete"
      ticks: 8
      advances_when: "The ruin's strange rituals proceed without interruption."
  yields_resource: "Dealing with the cathedral gives the party the villagers' trust and information, and access to the stairway down into the dungeon."
linked_entity: "N_RUINED_CATHEDRAL_AT_THE_EDGE_OF_THE_VILLAGE"
related: ["MOD_DIABLO_SIT_DUNGEON_BENEATH_THE_CATHEDRAL"]
---

# MODULE MOD_DIABLO_SIT_RUINED_CATHEDRAL_AT_THE_EDGE_OF_THE_VILLAGE: Ruined Cathedral at the Edge of the Village

A ruined cathedral at the edge of a somber, twilit village, where the townsfolk say strange rituals are performed. Dim light seeps from its church doorway, and inside a stone stairway plunges into darkness toward a dungeon.

### Dramatic Premise
A hero who answers a frightened village's plea + a cathedral where evil rituals lead down into death = a descent no one can walk back from unchanged.

### Core Premise
The ruined cathedral at the village edge is where the evil is first felt. The villagers speak of dark riders and strange rituals, a dying man writhes at the entrance, dim light seeps from the doorway, and a stone stairway plunges into darkness toward a dungeon that smells of death.

### GM Placement & Synergies
Place it at the start of the adventure as the threshold between the village and the dungeon beneath the cathedral. It consumes the party's first impressions and nerve, and it feeds them the rumors, the warning of the dying man and the way down. An arrival goes well when the party gathers what the villagers know and takes the stairway prepared. It goes badly when they ignore the warnings and descend unready, or treat the dying man as scenery.

### 5D Sensory Pentagon
- **Physical environment:** A somber, twilit village. Dim light seeps from the church doorway, and a stone stairway plunges into darkness toward a dungeon where the scent of death surrounds the hero.
- **Behaviors:** A dying man writhes in agony at the church entrance. The townsfolk speak of invasion by dark riders and of strange rituals performed in the ruin.
- **Relationships:** The cathedral stands at the village edge and connects to the dungeon beneath it. The dwindling villagers fear it and cannot stop what happens there.
- **Attitudes:** Somber, evil and anxious.
- **Values:** Survival and warning over bravery. The village wants someone else to face the evil.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The anxious and dwindling populace):** The evil is real and the village cannot fight it. *Leverage:* They know the rumors of dark riders and strange rituals, and they have been watching the cathedral. *Blind spot:* They are frightened and shrinking, and cannot act on what they know.
* **Main opponent (The dark riders and ritual performers):** The village and its people are there to be invaded and consumed. *Leverage:* They have invaded the area and use the ruin for strange rituals. *Blind spot:* Their nature is not immediately clear, which leaves room for the party to learn what they are before they strike.
* **Thematic shadow (The dying man at the entrance):** He is a warning of what the cathedral does to those who go in. *Leverage:* His suffering shows the stakes without a word of explanation. *Blind spot:* He is dying and can give only fragments.
* **Tertiary outcast (Whatever haunts the dungeon below):** Death is the only welcome the descent offers. *Leverage:* The scent of death surrounds all who go down the stairway. *Blind spot:* It is far below, so the party meets it only if it chooses to descend.

### Output Dial
- **Level 1:** The village is gloomy and rumor-ridden, the doorway glows dimly, and the party can study the ruin from outside.
- **Level 2:** The dying man and the villagers' warnings press the party toward the cathedral, and the stairway beckons.
- **Level 3:** The rituals and the dark riders make the village's decline plain, and the party must act or watch it empty.
- **Level 4:** The village is lost or the party is trapped on the stairway, with the scent of death leaving no doubt about what lies below.

### Threat Clocks
- **The Village Empties [6 Ticks]:** advances when The party delays, and the dark riders and rituals continue unopposed.
- **The Rituals Complete [8 Ticks]:** advances when The ruin's strange rituals proceed without interruption.

### Yields
Dealing with the cathedral gives the party the villagers' trust and information, and access to the stairway down into the dungeon.

### Related Modules
- `MOD_DIABLO_SIT_DUNGEON_BENEATH_THE_CATHEDRAL`

### Standalone Fallback
Run it as a one-shot threshold scene. The party arrives at a twilit village, hears of rituals in the ruined cathedral, meets a dying man at the church door, and must decide whether to take the stairway down.
