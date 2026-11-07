---
id: "MOD_DIABLO_SIT_OPENING_ARRIVAL_IN_THE_VILLAGE"
title: "Opening Arrival in the Village"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Lore: Rumor-of-Dark-Riders", "Lore: Ruined-Cathedral-Lead", "Signal: Dungeon-Entrance-Hook", "Authority: Frightened-Local-Petitioners"]
requires: []
tarot_affinity: ["The Fool", "The Hermit", "The Moon"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "The hero arrives in a somber, twilit village, hears of dark riders and rituals at a ruined cathedral, passes a dying man at the church entrance, and faces a stone stairway leading down into darkness."
standalone_fallback: "Run it as a one-shot prologue. The party arrives in a dimming village, gathers rumors from a frightened few, sees the dying man at the church door, and chooses whether to descend the stairs. The descent is the cliffhanger."
injected_mechanics:
  output_dial:
    level_1: "The village is quiet and tense, rumors come freely, and the stairway is just an ominous option."
    level_2: "Villagers speak urgently about riders and rituals, and the dying man makes the cost of delay plain."
    level_3: "More villagers have vanished or fled, the church doorway pulses with unnatural light, and the party feels the descent is overdue."
    level_4: "The village is nearly empty, the riders are close, and the stairway is the only place left that offers any answers."
  threat_clocks:
    - name: "The village empties"
      ticks: 6
      advances_when: "The party delays, dithers, or ignores the villagers' fears"
  yields_resource: "Rumors, motivation and a clear route into the dungeon. The party leaves with their first leads and a reason to care."
---

# MODULE MOD_DIABLO_SIT_OPENING_ARRIVAL_IN_THE_VILLAGE: Opening Arrival in the Village

The hero arrives in a somber, twilit village, hears of dark riders and rituals at a ruined cathedral, passes a dying man at the church entrance, and faces a stone stairway leading down into darkness.

### Dramatic Premise
A newcomer who cannot ignore suffering + a village too frightened to explain its own doom = a descent into the dark with half the story missing

### Core Premise
This is the opening beat. A newcomer enters a village already losing its people to dark riders and strange rituals at a ruined cathedral. A dying man at the church entrance and a stairway descending into darkness make the choice plain: go down or turn away.

### GM Placement & Synergies
Place it at the very start of a campaign or one-shot, with the dungeon directly beneath. It feeds the rumor clue about riders and rituals and gives the party a reason to return to town later. It consumes only the party's willingness to engage. Arrival goes well when the party gets a sense of place, a cause worth fighting for, and one or two leads. It goes badly if the GM lectures instead of letting the villagers be anxious and incomplete, or if the party treats the dying man as scenery.

### 5D Sensory Pentagon
- **Physical environment:** A somber, twilit village. Dim light seeps from the church doorway and a stone stairway plunges into darkness.
- **Behaviors:** The anxious, dwindling populace talks in hushed fragments. A dying man writhes at the church entrance.
- **Relationships:** The villagers are strangers who now lean on the newcomer. They are cut off from one another by fear and loss.
- **Attitudes:** Dread, resignation and a thin hope that someone will do something about the cathedral.
- **Values:** Survival, the memory of a safer village, and the faint expectation that outsiders can still help.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The dwindling villagers):** The village is dying and an outsider might be its last chance. *Leverage:* They hold the rumors and local knowledge the hero needs to begin. *Blind spot:* Fear keeps them vague, so their information is incomplete and secondhand.
* **Main opponent (The dark riders and the cathedral ritualists):** The village is prey and the ruined cathedral is a gate to be used. *Leverage:* Their invasion has already thinned the population and set the village's fear. *Blind spot:* Their nature and purpose are unclear, so they are known only through rumor and consequences.
* **Thematic shadow (The dying man at the church entrance):** Suffering has already come to this door, and the descent will cost more of the same. *Leverage:* He is a visible, immediate proof of the stakes. *Blind spot:* He cannot speak or act in any lasting way, and may be a warning rather than a guide.
* **Tertiary outcast (A villager who has stopped hoping):** Nothing can be done and newcomers merely die in the dark. *Leverage:* They can discourage or mislead the party with despair. *Blind spot:* Their resignation leaves them with no plan and no allies.

### Output Dial
- **Level 1:** The village is quiet and tense, rumors come freely, and the stairway is just an ominous option.
- **Level 2:** Villagers speak urgently about riders and rituals, and the dying man makes the cost of delay plain.
- **Level 3:** More villagers have vanished or fled, the church doorway pulses with unnatural light, and the party feels the descent is overdue.
- **Level 4:** The village is nearly empty, the riders are close, and the stairway is the only place left that offers any answers.

### Threat Clocks
- **The village empties [6 Ticks]:** advances when The party delays, dithers, or ignores the villagers' fears

### Yields
Rumors, motivation and a clear route into the dungeon. The party leaves with their first leads and a reason to care.

### Standalone Fallback
Run it as a one-shot prologue. The party arrives in a dimming village, gathers rumors from a frightened few, sees the dying man at the church door, and chooses whether to descend the stairs. The descent is the cliffhanger.
