---
id: "MOD_DIABLO_SIT_POISON_WATER_QUEST_BATTLE"
title: "Poison Water Quest Battle"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Defense: Combined-Demon-Ambush", "Lore: Allied-Monster-Warband"]
requires: ["Lore: Poison-Water-Quest"]
tarot_affinity: ["The Tower", "The Devil", "The Chariot"]
culture_quadrant: "Clan"
operational_profile: "Produce"
mtg_color: "Red"
hub_eligibility: "never"
summary: "During the Poison Water Quest, the Fallen Ones and a Goat Demon band together and attack the party at once."
standalone_fallback: "Run it as a one-shot: while the party seeks to cleanse a poisoned water source, a band of Fallen Ones and a Goat Demon close in from different sides and fight as one force."
injected_mechanics:
  output_dial:
    level_1: "The party anticipates the ambush, holds a good position, and fights the group piece by piece."
    level_2: "The enemies hit together and the party must fight hard and use terrain to avoid being overwhelmed."
    level_3: "The party is surrounded by the combined force and forced to retreat or split up while the quest is endangered."
    level_4: "The combined assault breaks the party, leaving them routed and the quest in jeopardy."
  threat_clocks:
    - name: "Closing Pincer"
      ticks: 4
      advances_when: "The party fails to separate the Fallen Ones from the Goat Demon, or lingers in the open."
  yields_resource: "Quest progress: surviving the battle clears the way to complete the Poison Water Quest."
---

# MODULE MOD_DIABLO_SIT_POISON_WATER_QUEST_BATTLE: Poison Water Quest Battle

During the Poison Water Quest, the Fallen Ones and a Goat Demon band together and attack the party at once.

### Dramatic Premise
A party pursuing a quest + enemies of different kinds who gang up = a hard fight that forces focus and coordination.

### Core Premise
The card states that the Fallen Ones and the Goat Demon will gang up on the player during the Poison Water Quest. The situation is a combined-arms fight where two monster types act as one.

### GM Placement & Synergies
Place it at a key point of the Poison Water Quest, such as approaching the objective. It consumes the party's resources and feeds quest completion. It goes well when the party divides the enemies or prepares a defensible position; it goes badly when they are caught in the open. Beyond the participants, the card gives no detail, so layout and numbers are the GM's judgement.

### 5D Sensory Pentagon
- **Physical environment:** The setting of the Poison Water Quest, with foes closing in.
- **Behaviors:** The Fallen Ones and the Goat Demon gang up on the party together.
- **Relationships:** Normally separate monsters fighting in concert against the party.
- **Attitudes:** Aggressive, converging hostility.
- **Values:** Overwhelm the intruder through numbers and combined force.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The party's quest-giver):** The poisoned water must be dealt with. *Leverage:* Directs the party and offers reward. *Blind spot:* Sends the party into danger it cannot fully see.
* **Main opponent (The Goat Demons):** Strength to be wielded with their allies against intruders. *Leverage:* Heavy force that backs up the Fallen Ones. *Blind spot:* Dependent on coordination with the Fallen Ones.
* **Thematic shadow (The Fallen Ones):** Swarm and overwhelm. *Leverage:* Numbers and flanking. *Blind spot:* Weakened once the group is split or the Goat Demon falls.
* **Tertiary outcast (A party member caught alone):** Survival comes first. *Leverage:* Can draw enemy attention away. *Blind spot:* Isolated and exposed when the enemies gang up.

### Output Dial
- **Level 1:** The party anticipates the ambush, holds a good position, and fights the group piece by piece.
- **Level 2:** The enemies hit together and the party must fight hard and use terrain to avoid being overwhelmed.
- **Level 3:** The party is surrounded by the combined force and forced to retreat or split up while the quest is endangered.
- **Level 4:** The combined assault breaks the party, leaving them routed and the quest in jeopardy.

### Threat Clocks
- **Closing Pincer [4 Ticks]:** advances when The party fails to separate the Fallen Ones from the Goat Demon, or lingers in the open.

### Yields
Quest progress: surviving the battle clears the way to complete the Poison Water Quest.

### Standalone Fallback
Run it as a one-shot: while the party seeks to cleanse a poisoned water source, a band of Fallen Ones and a Goat Demon close in from different sides and fight as one force.
