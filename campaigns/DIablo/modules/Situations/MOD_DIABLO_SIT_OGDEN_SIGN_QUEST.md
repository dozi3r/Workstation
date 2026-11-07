---
id: "MOD_DIABLO_SIT_OGDEN_SIGN_QUEST"
title: "Ogden's Sign Quest"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Authority: Descent-Permission", "Lore: Harlequin-Crest-Reward"]
requires: ["Authority: Tavern-Owner-Commission", "Defense: Dungeon-Level-Clearance"]
tarot_affinity: ["Justice", "The Devil"]
culture_quadrant: "Clan"
operational_profile: "Deliver"
mtg_color: ["White", "Black"]
hub_eligibility: "candidate"
summary: "Demons have stolen the sign of Ogden's Rising Sun Inn and Tavern. Snotspill will not let the party descend until it is recovered, and then a choice awaits about who gets it."
standalone_fallback: "Run it as a one-shot where a tavern's stolen sign sits in a monster's lair. A gatekeeper blocks the stairs until the sign is claimed, and the party must decide between giving it to the gatekeeper or returning it to its owner."
injected_mechanics:
  output_dial:
    level_1: "The sign is found, the stairs open and the party returns or hands it over without complication."
    level_2: "The party must weigh the two options carefully, with Ogden's gratitude on one side and a random item on the other."
    level_3: "The party hesitates over the choice while Snotspill still blocks the stairs, stalling their descent."
    level_4: "The sign is lost or mishandled, the way down remains shut, and the town's goodwill sours."
  threat_clocks:
    - name: "Stairs stay shut"
      ticks: 4
      advances_when: "The party fails to find the sign or delays the choice while Snotspill continues to block the way."
  yields_resource: "Passage down to the fifth level, and either the Harlequin Crest from Ogden or a random item from Snotspill."
related: ["MOD_DIABLO_SIT_SNOTSPILL_SET_PIECE_DUNGEON_LEVEL_4"]
---

# MODULE MOD_DIABLO_SIT_OGDEN_SIGN_QUEST: Ogden's Sign Quest

Demons have stolen the sign of Ogden's Rising Sun Inn and Tavern. Snotspill will not let the party descend until it is recovered, and then a choice awaits about who gets it.

### Dramatic Premise
A party that wants to go deeper + a gatekeeper who blocks the stairs until a stolen sign is returned = a choice between a quick payoff and an honest reward.

### Core Premise
Those demons have stolen the sign to Ogden’s Rising Sun Inn and Tavern, and it's up to you to get it back. The party must claim the sign before Snotspill will let them advance from the fourth to the fifth level. After recovery there are two options: hand it to Snotspill, who is then killed for a random item, or return it to Ogden, who produces the Harlequin Crest.

### GM Placement & Synergies
Place this on the fourth dungeon level, tied to Snotspill's set piece and the staircase beyond. It consumes the party's time and the goodwill of Ogden, and it feeds the descent into deeper levels. An arrival goes well when the party gets the sign and chooses knowingly between the reward from Ogden and the item from Snotspill; it goes badly when they stall or lose the sign and find the stairs still shut.

### 5D Sensory Pentagon
- **Physical environment:** The fourth dungeon level, Snotspill's set piece, and the staircase down to the fifth level.
- **Behaviors:** Adventurers hunt for the sign, deal with Snotspill and decide what to do with it afterward.
- **Relationships:** Ogden the Tavern Owner gives the quest, Snotspill blocks the stairs, and Cain and Adria offer advice.
- **Attitudes:** Ogden wants his sign back, and the little creature Snotspill treats the stairs as his to guard.
- **Values:** Fair dealing, a tavern's pride, and the pull of a quick reward.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Ogden the Tavern Owner):** A sign is a tavern's name and a town's small piece of normal life. *Leverage:* He gives the quest and, if the sign is returned to him, produces the Harlequin Crest. *Blind spot:* He cannot retrieve the sign himself.
* **Main opponent (Snotspill):** The stairs are his to control, and nobody passes without the sign. *Leverage:* He blocks the way down to the fifth level until the sign is claimed. *Blind spot:* He can be handed the sign and then killed for a random item.
* **Thematic shadow (The demons who stole the sign):** Even a humble tavern sign is a trophy worth taking from the living. *Leverage:* They hold the town's small pride to ransom in the depths. *Blind spot:* Their theft draws the very heroes who will undo it.
* **Tertiary outcast (Cain the Storyteller and Adria the Witch):** Counsel is cheap and the choices belong to others. *Leverage:* They advise on the quest and its options. *Blind spot:* They cannot make the choice for the party.

### Output Dial
- **Level 1:** The sign is found, the stairs open and the party returns or hands it over without complication.
- **Level 2:** The party must weigh the two options carefully, with Ogden's gratitude on one side and a random item on the other.
- **Level 3:** The party hesitates over the choice while Snotspill still blocks the stairs, stalling their descent.
- **Level 4:** The sign is lost or mishandled, the way down remains shut, and the town's goodwill sours.

### Threat Clocks
- **Stairs stay shut [4 Ticks]:** advances when The party fails to find the sign or delays the choice while Snotspill continues to block the way.

### Yields
Passage down to the fifth level, and either the Harlequin Crest from Ogden or a random item from Snotspill.

### Source Figures (verbatim evidence; not read by the app)
```
Quest group: Group 2
Quest level: Level 4
```

### Related Modules
- `MOD_DIABLO_SIT_SNOTSPILL_SET_PIECE_DUNGEON_LEVEL_4`

### Standalone Fallback
Run it as a one-shot where a tavern's stolen sign sits in a monster's lair. A gatekeeper blocks the stairs until the sign is claimed, and the party must decide between giving it to the gatekeeper or returning it to its owner.
