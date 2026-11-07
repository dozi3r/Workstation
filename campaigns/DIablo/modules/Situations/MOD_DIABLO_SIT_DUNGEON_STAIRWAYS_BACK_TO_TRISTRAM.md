---
id: "MOD_DIABLO_SIT_DUNGEON_STAIRWAYS_BACK_TO_TRISTRAM"
title: "Dungeon Stairways Back to Tristram"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 3 (Infrastructural Supply Chains)"
pipeline_tier: 3
provides: ["Defense: Safe-Retreat-Route", "Material: Resupply-Access", "Lore: Shortcut-Locations"]
requires: ["Authority: Surface-Town-Refuge"]
tarot_affinity: ["The Hermit", "Temperance", "The Tower"]
culture_quadrant: "Market"
operational_profile: "Deliver"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "Hidden stairways deep in the dungeon lead back to town, saving the player a long walk and enabling quick trips topside to replenish health and mana."
standalone_fallback: "Run it as a delve-and-retreat loop. The party pushes into dangerous depths, finds a stairway or portal back to a safe settlement, and uses short trips to recover and resupply before pushing deeper."
injected_mechanics:
  output_dial:
    level_1: "A known stairway or portal makes a trip home a minor interruption."
    level_2: "The party must find and reach the right stairway, and the trip is a real but manageable choice."
    level_3: "The party is deep and depleted, the nearest shortcut is far, and they must decide whether to press on or retreat."
    level_4: "Every route home is cut off or compromised, and the party must survive with whatever they have left."
  threat_clocks:
    - name: "Overextension"
      ticks: 6
      advances_when: "The party pushes deeper without recovering or checking for a way home"
  yields_resource: "Safe recovery, resupply, and a reliable loop between town and dungeon."
related: ["MOD_DIABLO_SIT_TRISTRAM"]
---

# MODULE MOD_DIABLO_SIT_DUNGEON_STAIRWAYS_BACK_TO_TRISTRAM: Dungeon Stairways Back to Tristram

Hidden stairways deep in the dungeon lead back to town, saving the player a long walk and enabling quick trips topside to replenish health and mana.

### Dramatic Premise
An explorer who pushes too far + a long, dangerous way home = a choice between overextending and using the shortcuts to recover

### Core Premise
Short of the stairs, Town Portal is the quickest route home. But stairways deep in the dungeon also open avenues back to Tristram. A mid-depth stair emerges from the crypt in the graveyard, a deeper one leads to a cave near where Wirt stands, and a still deeper up staircase opens a fissure behind Pepin's house. Once the party reaches the catacombs, the mausoleum opens to return to town. The advice is to overextend less and make quick trips topside to replenish health and mana.

### GM Placement & Synergies
Place it at intervals in a multi-level dungeon, tied to the town hub. It consumes the party's supplies and fatigue and feeds them back as recovered resources and new information from town. Arrival goes well when the party discovers a stairway at the moment of greatest need and the loop feels earned. It goes badly if the shortcuts remove all tension, so vary their discovery, keep some hidden, and let the fissure route hint at danger.

### 5D Sensory Pentagon
- **Physical environment:** Stairways deep in the dungeon open onto town: one emerges from the crypt in the graveyard, another into a cave near where Wirt stands, and in the catacombs the mausoleum opens to return to town.
- **Behaviors:** The player makes quick trips topside to replenish health and mana rather than walking back out.
- **Relationships:** The deep dungeon is linked to Tristram by these hidden routes.
- **Attitudes:** Caution is rewarded. The guide advises the player to overextend less.
- **Values:** Efficiency, recovery, and knowing the shortcuts.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Tristram, the home town):** The town is the refuge and the dungeon should be a round trip. *Leverage:* It offers recovery and resupply to anyone who can reach it. *Blind spot:* It cannot help those who are too deep or too proud to come back.
* **Main opponent (The long way out):** The dungeon wants delvers worn down far from safety. *Leverage:* Distance and attrition punish those who push on without a retreat. *Blind spot:* It is defeated by anyone who learns the shortcuts.
* **Thematic shadow (The fissure to hell):** The same deep stairs that lead home can also open the way to something worse. *Leverage:* One up staircase opens a fissure behind Pepin's house through which the player can return to hell, so the shortcut has a dark twin. *Blind spot:* The card's wording is brief, so the exact meaning of that route is left to the GM.
* **Tertiary outcast (The overextended delver):** One more room, one more fight, and then home. *Leverage:* Boldness can earn quick rewards. *Blind spot:* They ignore the stairs and the portal until it is too late.

### Output Dial
- **Level 1:** A known stairway or portal makes a trip home a minor interruption.
- **Level 2:** The party must find and reach the right stairway, and the trip is a real but manageable choice.
- **Level 3:** The party is deep and depleted, the nearest shortcut is far, and they must decide whether to press on or retreat.
- **Level 4:** Every route home is cut off or compromised, and the party must survive with whatever they have left.

### Threat Clocks
- **Overextension [6 Ticks]:** advances when The party pushes deeper without recovering or checking for a way home

### Yields
Safe recovery, resupply, and a reliable loop between town and dungeon.

### Source Figures (verbatim evidence; not read by the app)
```
Stairway to Tristram, level: 5
Stairway to Tristram, level: 9
Stairway to Tristram, level: 13
```

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`

### Standalone Fallback
Run it as a delve-and-retreat loop. The party pushes into dangerous depths, finds a stairway or portal back to a safe settlement, and uses short trips to recover and resupply before pushing deeper.
