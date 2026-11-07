---
id: "MOD_DIABLO_SIT_RISING_SUN_INN_AND_TAVERN"
title: "Rising Sun Inn and Tavern"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Authority: Tavern-Owner-Contact", "Lore: Local-Rumor-Hub", "Labor: Lodging-And-Hospitality"]
requires: ["Defense: Protection-From-Demon-Raids"]
tarot_affinity: ["The Hierophant", "The Moon"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "Ogden's inn and tavern, whose hanging sign was stolen by demons."
standalone_fallback: "Run it as a one-scene hook. The party arrives at a tavern whose owner is upset that demons stole his hanging sign, and they may be hired to recover it."
injected_mechanics:
  output_dial:
    level_1: "Ogden grumbles about his missing sign, and the inn is otherwise open and warm."
    level_2: "The loss of the sign sours the mood, regulars drift away, and Ogden asks the party to find it."
    level_3: "The demons return to take more from the inn, and the town begins to see the theft as a sign of worse to come."
    level_4: "The inn is abandoned or overrun, and its fall marks the end of safe, ordinary life in town."
  threat_clocks:
    - name: "The Town Loses Heart"
      ticks: 4
      advances_when: "The sign stays missing and the demons act again unchallenged."
  yields_resource: "Recovering the sign earns Ogden's gratitude, a safe place to rest, and the goodwill and rumors of the town."
linked_entity: "N_RISING_SUN_INN_AND_TAVERN"
---

# MODULE MOD_DIABLO_SIT_RISING_SUN_INN_AND_TAVERN: Rising Sun Inn and Tavern

Ogden's inn and tavern, whose hanging sign was stolen by demons.

### Dramatic Premise
A tavern keeper who wants his town's ordinary life back + demons who steal even his sign = a small, personal quest that shows the larger evil.

### Core Premise
Ogden's Rising Sun Inn and Tavern lost its hanging sign to demons. Little else is established, so the small theft carries the story: the evil reaches even the humble things in town.

### GM Placement & Synergies
Use it as the town's social hub and early quest-giver, near the start of play. It consumes the party's attention and feeds them rumors, lodging and a modest quest. The card names no further links, so any connection to other places is the GM's choice. An arrival goes well when the party treats the sign as worth recovering and so earns Ogden's trust. It goes badly if the party dismisses the theft and the town's morale keeps sinking.

### 5D Sensory Pentagon
- **Physical environment:** An inn and tavern with an empty spot where its hanging sign should be.
- **Behaviors:** Ogden runs the house and talks about the sign that demons took.
- **Relationships:** Ogden owns the establishment. The demons are the cause of its loss.
- **Attitudes:** The theft is a petty, mocking insult to a place of ordinary comfort.
- **Values:** Hospitality, normal life, and the dignity of a local landmark.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Ogden the Tavern Owner):** The inn is the heart of the town and its name should hang over the door. *Leverage:* He owns the inn, gives lodging and hears the town's talk. *Blind spot:* He is not a fighter and depends on outsiders to recover what was taken.
* **Main opponent (The demons who stole the sign):** Taking even small things shows the town that nothing is safe. *Leverage:* They have already taken the sign, and nobody in town has been able to get it back. *Blind spot:* Their petty theft leaves a trail that can be followed.
* **Thematic shadow (The anxious townsfolk):** Keep your head down and hope the evil passes. *Leverage:* They bring rumor and gossip to the inn. *Blind spot:* Fear makes them unwilling to help.
* **Tertiary outcast (A wandering patron):** A tavern is a place to hear a story and move on. *Leverage:* They carry news from elsewhere and owe the place no loyalty. *Blind spot:* They will not stay to see the problem solved.

### Output Dial
- **Level 1:** Ogden grumbles about his missing sign, and the inn is otherwise open and warm.
- **Level 2:** The loss of the sign sours the mood, regulars drift away, and Ogden asks the party to find it.
- **Level 3:** The demons return to take more from the inn, and the town begins to see the theft as a sign of worse to come.
- **Level 4:** The inn is abandoned or overrun, and its fall marks the end of safe, ordinary life in town.

### Threat Clocks
- **The Town Loses Heart [4 Ticks]:** advances when The sign stays missing and the demons act again unchallenged.

### Yields
Recovering the sign earns Ogden's gratitude, a safe place to rest, and the goodwill and rumors of the town.

### Standalone Fallback
Run it as a one-scene hook. The party arrives at a tavern whose owner is upset that demons stole his hanging sign, and they may be hired to recover it.
