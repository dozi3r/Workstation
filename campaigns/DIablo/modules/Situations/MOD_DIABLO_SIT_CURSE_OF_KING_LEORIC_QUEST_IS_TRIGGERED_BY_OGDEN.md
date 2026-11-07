---
id: "MOD_DIABLO_SIT_CURSE_OF_KING_LEORIC_QUEST_IS_TRIGGERED_BY_OGDEN"
title: "The Tavern Keeper's Plea: The Curse of King Leoric"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Lore: Fallen-King-Legend", "Authority: Townsfolk-Quest-Mandate", "Signal: Tomb-Rumor"]
requires: ["Defense: Undead-Slaying-Capability", "Lore: Local-Town-Community"]
tarot_affinity: ["The Hierophant", "Death", "The Moon"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "In the Tristram tavern, Ogden recounts the tragic tale of King Leoric and begs the hero to destroy the king's cursed form and free his soul."
standalone_fallback: "Run it as a single tavern scene. A frightened innkeeper tells of a king who rose from the grave in a cursed body and pleads with the party to end his torment. The scene closes when the party accepts or refuses, and the innkeeper points them toward the king's resting place."
injected_mechanics:
  output_dial:
    level_1: "The tale is told over a quiet drink and the party takes it as an interesting piece of local history."
    level_2: "Ogden makes a heartfelt appeal, and the party takes on the task of laying the king to rest."
    level_3: "The plea is desperate, the townsfolk are afraid, and refusing the task means the curse spreads unchecked."
    level_4: "The cursed king's horde reaches the town itself, and the tale becomes a warning of what the party failed to prevent."
  threat_clocks:
    - name: "The Unquiet King"
      ticks: 6
      advances_when: "The party delays or refuses, and rumors of the cursed king's movements grow."
  yields_resource: "A clear mandate from the townsfolk, the story of the king's fall, and the direction to his tomb."
---

# MODULE MOD_DIABLO_SIT_CURSE_OF_KING_LEORIC_QUEST_IS_TRIGGERED_BY_OGDEN: The Tavern Keeper's Plea: The Curse of King Leoric

In the Tristram tavern, Ogden recounts the tragic tale of King Leoric and begs the hero to destroy the king's cursed form and free his soul.

### Dramatic Premise
A decent man who cannot fight + a beloved dead king walking cursed = he must beg a stranger to give the king peace.

### Core Premise
Ogden the Tavern Owner tells the tragic story of King Leoric and implores the hero to destroy his cursed form so that his soul may be at ease. It is a quest hook driven by pity as much as fear.

### GM Placement & Synergies
Place it in a tavern or common room early in a campaign, once the party has reached the town. It consumes the party's willingness to help and feeds directly into the tomb encounter, where the king can actually be destroyed. It goes well when the grief in the telling gives the fight a moral weight. It goes badly if it is delivered as a plain job offer, or if the party ignores the plea and the king's threat grows unopposed.

### 5D Sensory Pentagon
- **Physical environment:** The tavern in Tristram, a small and shaken town. Lamplight, low voices, and a keeper who lowers his voice to tell the old tale.
- **Behaviors:** Ogden implores the hero, speaking with reverence and grief about a king he cannot help himself.
- **Relationships:** A townsman asks a stranger to settle a matter of loyalty to a former ruler. The king is both a lost sovereign and a danger.
- **Attitudes:** Pity for the king and fear of what he has become, joined by a sense that the dead should be at peace.
- **Values:** Mercy toward the dead, duty to a fallen lord, and the hope that destruction can be a kindness.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Ogden the Tavern Owner):** A decent townsman who believes the king's soul deserves rest and that someone brave must give it. *Leverage:* Local trust, the knowledge of the king's story, and the standing to direct the hero. *Blind spot:* He is no fighter. He can only plead and hope the stranger will act.
* **Main opponent (King Leoric (cursed)):** A once-noble ruler now bound in a cursed form, with no peace to be had. *Leverage:* His undead power, and his ability to raise an army of bones. *Blind spot:* He is trapped by the curse and cannot choose to stop.
* **Thematic shadow (The unquiet dead of Tristram):** Those who cannot rest are a symptom of the corruption beneath the town. *Leverage:* Fear, which spreads through the town as rumor. *Blind spot:* They are echoes without will and cannot bargain.
* **Tertiary outcast (A townsperson who would rather leave the king undisturbed):** Some things are better left buried, and a hero may only make them worse. *Leverage:* Gossip and discouragement that sow doubt about the quest. *Blind spot:* Their caution offers no answer to the threat.

### Output Dial
- **Level 1:** The tale is told over a quiet drink and the party takes it as an interesting piece of local history.
- **Level 2:** Ogden makes a heartfelt appeal, and the party takes on the task of laying the king to rest.
- **Level 3:** The plea is desperate, the townsfolk are afraid, and refusing the task means the curse spreads unchecked.
- **Level 4:** The cursed king's horde reaches the town itself, and the tale becomes a warning of what the party failed to prevent.

### Threat Clocks
- **The Unquiet King [6 Ticks]:** advances when The party delays or refuses, and rumors of the cursed king's movements grow.

### Yields
A clear mandate from the townsfolk, the story of the king's fall, and the direction to his tomb.

### Standalone Fallback
Run it as a single tavern scene. A frightened innkeeper tells of a king who rose from the grave in a cursed body and pleads with the party to end his torment. The scene closes when the party accepts or refuses, and the innkeeper points them toward the king's resting place.
