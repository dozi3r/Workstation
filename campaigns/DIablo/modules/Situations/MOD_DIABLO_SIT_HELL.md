---
id: "MOD_DIABLO_SIT_HELL"
title: "Hell"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 5 (Esoteric & Eschatological Engines)"
pipeline_tier: 5
provides: ["Climax: Final-Descent", "Lore: Infernal-Realm"]
requires: ["Lore: Hell-Passage", "Defense: Prepared-Party"]
tarot_affinity: ["The Devil", "Judgement", "The Tower"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Black"
hub_eligibility: "never"
summary: "The deep realm reached through the fissure behind Pepin's house on dungeon level 13."
standalone_fallback: "Run it as a one-shot: the party steps through a crack in the earth into a hostile infernal realm and must press on to confront its source. The card says little about the realm, so the GM supplies its geography and inhabitants."
injected_mechanics:
  output_dial:
    level_1: "The realm is a watchful, oppressive place, and the party passes while mostly unnoticed."
    level_2: "Hell's denizens contest the party's advance and the way forward demands effort and sacrifice."
    level_3: "The party is cut off from the fissure and forced deeper, with resources failing."
    level_4: "The party is overwhelmed in the deep, and the way back is lost."
  threat_clocks:
    - name: "The Way Back Closes"
      ticks: 6
      advances_when: "The party lingers, takes losses, or fails to secure the passage behind them."
  yields_resource: "Confrontation with the source of the evil and a conclusive end to the descent."
linked_entity: "N_HELL"
related: ["MOD_DIABLO_SIT_FISSURE_BEHIND_PEPIN_HOUSE"]
---

# MODULE MOD_DIABLO_SIT_HELL: Hell

The deep realm reached through the fissure behind Pepin's house on dungeon level 13.

### Dramatic Premise
Heroes who return to finish what they started + an infernal realm that offers no safe ground = a climax where the cost of the pursuit is faced.

### Core Premise
Hell is the deep realm reached through the fissure behind Pepin's house on dungeon level 13. The card states only that the fissure lets the player return to hell, so everything else about the realm is the GM's to define.

### GM Placement & Synergies
Use it as the campaign's final stage. It consumes the party's arrival via the fissure and feeds the climax. An arrival goes well when the party has prepared and knows their purpose. It goes badly when they enter hurt, divided or unprepared. Because the source is sparse, the GM should treat the realm's contents as invented material.

### 5D Sensory Pentagon
- **Physical environment:** A deep realm beyond the fissure; the source states nothing more, so details are left to the GM.
- **Behaviors:** Travelers arrive by the fissure and are expected to press onward.
- **Relationships:** Linked in both directions with the fissure behind Pepin's house.
- **Attitudes:** Hostile and final; entering it means returning to where the evil began.
- **Values:** Endurance and resolve; there is no retreat except back through the same passage.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Rulers of Hell):** The realm's ruling powers, unnamed on this card, hold the deep as their own. *Leverage:* Control of the realm the party enters. *Blind spot:* Their dominion is entered through a single known passage.
* **Main opponent (The returning party):** Those who descend intend to end the threat at its source. *Leverage:* Arrival through the fissure and the resolve to continue. *Blind spot:* Isolated from the surface and from healing.
* **Thematic shadow (Fallen predecessors):** Earlier travelers who went down and did not come back, a warning of the realm's cost. *Leverage:* Traces and cautionary example. *Blind spot:* They have already failed.
* **Tertiary outcast (Hell's lesser denizen):** A creature of the deep with no loyalty to the powers above it, willing to bargain. *Leverage:* Knowledge of the realm's paths. *Blind spot:* Unreliable and hunted by its own kind.

### Output Dial
- **Level 1:** The realm is a watchful, oppressive place, and the party passes while mostly unnoticed.
- **Level 2:** Hell's denizens contest the party's advance and the way forward demands effort and sacrifice.
- **Level 3:** The party is cut off from the fissure and forced deeper, with resources failing.
- **Level 4:** The party is overwhelmed in the deep, and the way back is lost.

### Threat Clocks
- **The Way Back Closes [6 Ticks]:** advances when The party lingers, takes losses, or fails to secure the passage behind them.

### Yields
Confrontation with the source of the evil and a conclusive end to the descent.

### Related Modules
- `MOD_DIABLO_SIT_FISSURE_BEHIND_PEPIN_HOUSE`

### Standalone Fallback
Run it as a one-shot: the party steps through a crack in the earth into a hostile infernal realm and must press on to confront its source. The card says little about the realm, so the GM supplies its geography and inhabitants.
