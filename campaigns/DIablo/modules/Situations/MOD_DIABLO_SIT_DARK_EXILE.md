---
id: "MOD_DIABLO_SIT_DARK_EXILE"
title: "The Dark Exile"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Lore: Exile-Tale-Fragment", "Lore: Tome-Of-The-Exile"]
requires: ["Authority: Custodian-Of-The-Tomes"]
tarot_affinity: ["The Hermit", "The Moon", "Judgement"]
culture_quadrant: "Clan"
operational_profile: "Design"
mtg_color: "Black"
hub_eligibility: "never"
summary: "A tale recorded in tomes scattered through the game world, recounting the Dark Exile. The card gives only the existence of the story, so its content is left for the table to fill in."
standalone_fallback: "The party finds a tome in a ruined library or crypt that tells of a banished figure. Reading it raises the question of who the exile was, why they were cast out, and whether anyone still wants the story kept hidden. Resolve it as a single scene of discovery and a choice about what to do with the knowledge."
injected_mechanics:
  output_dial:
    level_1: "A tome is found and its tale of the Dark Exile is read as idle lore."
    level_2: "The party gathers several volumes and begins to see the outline of the exile's story."
    level_3: "The tale draws the attention of those who would suppress it, and the tomes become contested."
    level_4: "The story's truth is lost or weaponized, leaving the party with a legend that reshapes how the exile is judged."
  threat_clocks:
    - name: "The Tale Is Silenced"
      ticks: 6
      advances_when: "The party delays, or rivals gather and destroy the tomes."
  yields_resource: "Knowledge of the Dark Exile's story, which can serve as a lead, a rumor, or leverage with those who care about the tale."
---

# MODULE MOD_DIABLO_SIT_DARK_EXILE: The Dark Exile

A tale recorded in tomes scattered through the game world, recounting the Dark Exile. The card gives only the existence of the story, so its content is left for the table to fill in.

### Dramatic Premise
Characters who seek the truth behind a buried story + a tale whose teller and subject are both unclear = a hunt for an exile whose fate is still unsettled.

### Core Premise
The only canon support is that tomes in the game world tell the tale of the Dark Exile. Everything else here, including the keepers, the suppressors and the outcast reader, is a judgement offered to give the table something to play with. Treat the exile's identity and fate as open.

### GM Placement & Synergies
Place in a library, crypt, or sanctum as a quiet lore beat between action scenes. It consumes a discovery scene and feeds rumors, quests, or a later confrontation with whoever the exile turns out to be. Arrival goes well if the party reads carefully and shares or guards the knowledge with purpose. It goes badly if they treat the tomes as loot, or let a rival take the volumes and the narrative with them.

### 5D Sensory Pentagon
- **Physical environment:** Worn tomes shelved or abandoned in dim chambers, their pages telling the story of the Dark Exile.
- **Behaviors:** Readers pore over the volumes and piece the account together from fragments.
- **Relationships:** The reader stands in relation to an absent exile known only through the written account.
- **Attitudes:** Curiosity mixed with unease about a figure labelled 'Dark'.
- **Values:** Remembered history and the preservation of stories in written form.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Keepers of the tomes):** Written accounts should be preserved and interpreted by those entrusted with them. *Leverage:* They control access to the volumes and decide how the tale is read. *Blind spot:* Their reading may be partial and their silence may hide inconvenient parts of the story.
* **Main opponent (Those who would suppress the tale):** Some stories are dangerous and are better lost. *Leverage:* They can remove, burn, or discredit the tomes. *Blind spot:* Their efforts draw attention to the very story they want forgotten.
* **Thematic shadow (The Dark Exile):** Cast out and defined by others, the exile is known only through the tale. *Leverage:* The legend itself shapes how others act long after the exile's removal. *Blind spot:* The exile cannot speak for themselves, and the account may be unreliable.
* **Tertiary outcast (A wandering reader of the tomes):** The tale belongs to anyone willing to read it. *Leverage:* Independent, answerable to no keeper, and willing to share what they have pieced together. *Blind spot:* Without standing, their interpretations are easy to dismiss.

### Output Dial
- **Level 1:** A tome is found and its tale of the Dark Exile is read as idle lore.
- **Level 2:** The party gathers several volumes and begins to see the outline of the exile's story.
- **Level 3:** The tale draws the attention of those who would suppress it, and the tomes become contested.
- **Level 4:** The story's truth is lost or weaponized, leaving the party with a legend that reshapes how the exile is judged.

### Threat Clocks
- **The Tale Is Silenced [6 Ticks]:** advances when The party delays, or rivals gather and destroy the tomes.

### Yields
Knowledge of the Dark Exile's story, which can serve as a lead, a rumor, or leverage with those who care about the tale.

### Standalone Fallback
The party finds a tome in a ruined library or crypt that tells of a banished figure. Reading it raises the question of who the exile was, why they were cast out, and whether anyone still wants the story kept hidden. Resolve it as a single scene of discovery and a choice about what to do with the knowledge.
