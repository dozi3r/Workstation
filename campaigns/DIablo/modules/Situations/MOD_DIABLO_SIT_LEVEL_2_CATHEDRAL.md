---
id: "MOD_DIABLO_SIT_LEVEL_2_CATHEDRAL"
title: "Level 2 Cathedral"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Authority: Butcher-Quest-Hook", "Lore: Desecration-Evidence"]
requires: ["Defense: Combat-Ready-Party", "Labor: Townsfolk-Request"]
tarot_affinity: ["The Tower", "Death", "Judgement"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "A desecrated cathedral on the second dungeon level where the Butcher's first quest begins, with a dying townsman at the church entrance."
standalone_fallback: "Run it as a one-shot. The party reaches a profaned cathedral, meets a dying townsman at its door, and takes up his plea to deal with the horror inside."
injected_mechanics:
  output_dial:
    level_1: "The party finds the cathedral defiled and takes the townsman's last words as a grim hook."
    level_2: "The desecration is plain, the quest begins in earnest, and the party moves inside carefully."
    level_3: "Signs of the Butcher's work close in, the cathedral turns into a gauntlet, and retreat is costly."
    level_4: "The party is overwhelmed in the defiled sanctuary, and the dying townsman's fate becomes theirs."
  threat_clocks:
    - name: "The Townsman Fades"
      ticks: 4
      advances_when: "The party delays at the entrance or ignores what the townsman tells them."
    - name: "The Desecration Deepens"
      ticks: 6
      advances_when: "The party fails to press the quest or retreats from the cathedral."
  yields_resource: "The start of the Butcher quest, with the townsman's warning and the chance to restore the church."
linked_entity: "N_LEVEL_2_CATHEDRAL"
---

# MODULE MOD_DIABLO_SIT_LEVEL_2_CATHEDRAL: Level 2 Cathedral

A desecrated cathedral on the second dungeon level where the Butcher's first quest begins, with a dying townsman at the church entrance.

### Dramatic Premise
Heroes who answer a dying plea + a sanctuary turned into a slaughterhouse = a quest that proves what the dungeon does to the innocent.

### Core Premise
The cathedral is where the Butcher's first quest begins. Its two canon images are a desecrated sanctuary and a dying townsman at the entrance. Use them to make the stakes personal before any fight starts. How the Butcher behaves and what the party finds inside are GM judgements.

### GM Placement & Synergies
Place it early in the second dungeon level, as the first major hook after the party has descended from the surface. It consumes a party ready for combat and feeds the Butcher quest and evidence of desecration. It goes well when the party honors the dying plea and enters prepared. It goes badly when they rush in, or leave the townsman to die without learning what he knew.

### 5D Sensory Pentagon
- **Physical environment:** A desecrated cathedral, with a church entrance where a townsman lies dying.
- **Behaviors:** The dying townsman gasps out warnings. Arriving heroes hurry inside, torn between aiding him and pressing on.
- **Relationships:** The townsman stands for the townsfolk who depend on the heroes. The Butcher is the quest's implied source of dread.
- **Attitudes:** Dread, urgency, and horror at profanation.
- **Values:** Duty to the helpless, and the sanctity that has been violated.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The townsfolk):** Someone must cleanse the church so the community can survive. *Leverage:* Desperate need, and the heroes' conscience. *Blind spot:* They can only send those who may not come back.
* **Main opponent (The Butcher):** The cathedral is his domain to defile. *Leverage:* He claims the ground and the terror it inspires. *Blind spot:* He is one fixed horror, and the quest centers on beating him.
* **Thematic shadow (The dying townsman):** A last warning matters more than his own life. *Leverage:* He is the first witness to what happened. *Blind spot:* He is fading, and what he knows may die with him.
* **Tertiary outcast (The faithful who fled):** The church is lost and must be abandoned. *Leverage:* They know the cathedral's former shape. *Blind spot:* Their fear leaves them useless for the fight.

### Output Dial
- **Level 1:** The party finds the cathedral defiled and takes the townsman's last words as a grim hook.
- **Level 2:** The desecration is plain, the quest begins in earnest, and the party moves inside carefully.
- **Level 3:** Signs of the Butcher's work close in, the cathedral turns into a gauntlet, and retreat is costly.
- **Level 4:** The party is overwhelmed in the defiled sanctuary, and the dying townsman's fate becomes theirs.

### Threat Clocks
- **The Townsman Fades [4 Ticks]:** advances when The party delays at the entrance or ignores what the townsman tells them.
- **The Desecration Deepens [6 Ticks]:** advances when The party fails to press the quest or retreats from the cathedral.

### Yields
The start of the Butcher quest, with the townsman's warning and the chance to restore the church.

### Standalone Fallback
Run it as a one-shot. The party reaches a profaned cathedral, meets a dying townsman at its door, and takes up his plea to deal with the horror inside.
