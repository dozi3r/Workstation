---
id: "MOD_DIABLO_SIT_BUTCHER_QUEST_IS_TRIGGERED_AT_THE_DESECRATED_CAT"
title: "A Dying Plea at the Desecrated Cathedral"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Authority: Avenge-Mandate", "Lore: Archbishop-Betrayal-Account"]
requires: ["Lore: Lost-Prince-Expedition", "Defense: Descent-Readiness"]
tarot_affinity: ["Justice", "The Devil", "Death"]
culture_quadrant: "Clan"
operational_profile: "Deliver"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "At the cathedral entrance a dying townsman tells the player that Archbishop Lazarus led them into a trap set by a demon called the Butcher, and begs the player to avenge them."
standalone_fallback: "Run it as a one-shot scene. The party meets a dying survivor at a defiled church door, hears who betrayed his group and what killed them, and chooses whether to take up his dying request."
injected_mechanics:
  output_dial:
    level_1: "The townsman is found and heard, and the party notes the accusation."
    level_2: "The party accepts the request, and the Butcher and Lazarus become active leads."
    level_3: "The townsman dies before the full story is told, and the party is left with rumor and a growing sense of betrayal."
    level_4: "The party ignores the plea or descends unprepared, and the Butcher's trap closes on them as it did on the expedition."
  threat_clocks:
    - name: "Souls Left Unrested"
      ticks: 4
      advances_when: "The party delays the hunt, or the cathedral's horrors spread while the Butcher goes unchallenged."
  yields_resource: "A clear objective, the Butcher, and a damning account of Archbishop Lazarus that gives the party moral standing."
---

# MODULE MOD_DIABLO_SIT_BUTCHER_QUEST_IS_TRIGGERED_AT_THE_DESECRATED_CAT: A Dying Plea at the Desecrated Cathedral

At the cathedral entrance a dying townsman tells the player that Archbishop Lazarus led them into a trap set by a demon called the Butcher, and begs the player to avenge them.

### Dramatic Premise
A hero who cannot ignore the dying + a betrayal that cost a whole expedition = a vow to hunt the Butcher and expose the Archbishop.

### Core Premise
The dying townsman says the Archbishop led his group down to find the lost prince, that it was a trap, and that everyone was killed by a demon called the Butcher. He asks to be avenged so that the souls of the dead may rest.

### GM Placement & Synergies
Place it at the first approach to the desecrated cathedral, as the opening beat of the descent. It consumes the party's curiosity about the church and feeds the Butcher hunt and any Lazarus storyline. It goes well when the plea gives the party a personal stake. It goes badly if the party treats the townsman as set dressing and enters the depths with no sense of the danger or the betrayal behind it.

### 5D Sensory Pentagon
- **Physical environment:** A defiled church entrance, with a wounded man slumped near the threshold.
- **Behaviors:** The townsman pleads, accuses and begs to be heard before he dies.
- **Relationships:** Followers were led into a trap by the leader they trusted, and the survivor now turns to a stranger.
- **Attitudes:** Betrayal, despair and a need for vengeance.
- **Values:** Justice for the dead and rest for souls that cannot find it.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Archbishop Lazarus):** The expedition for the lost prince justifies any cost. *Leverage:* Religious authority and the trust of the townsfolk. *Blind spot:* He led his followers into a trap and is accused of betraying them.
* **Main opponent (The Butcher):** Slaughter whatever enters his domain. *Leverage:* A demon's brutality that killed the whole expedition. *Blind spot:* He is a single, localized threat that can be hunted down.
* **Thematic shadow (The silent dead of the expedition):** They want rest and cannot get it. *Leverage:* The moral weight of unavenged souls. *Blind spot:* They have no voice except the survivor's plea.
* **Tertiary outcast (The Wounded Townsman):** Someone must know what happened here. *Leverage:* First-hand testimony as the last survivor. *Blind spot:* He is dying, and his account is passionate and one-sided.

### Output Dial
- **Level 1:** The townsman is found and heard, and the party notes the accusation.
- **Level 2:** The party accepts the request, and the Butcher and Lazarus become active leads.
- **Level 3:** The townsman dies before the full story is told, and the party is left with rumor and a growing sense of betrayal.
- **Level 4:** The party ignores the plea or descends unprepared, and the Butcher's trap closes on them as it did on the expedition.

### Threat Clocks
- **Souls Left Unrested [4 Ticks]:** advances when The party delays the hunt, or the cathedral's horrors spread while the Butcher goes unchallenged.

### Yields
A clear objective, the Butcher, and a damning account of Archbishop Lazarus that gives the party moral standing.

### Standalone Fallback
Run it as a one-shot scene. The party meets a dying survivor at a defiled church door, hears who betrayed his group and what killed them, and chooses whether to take up his dying request.
