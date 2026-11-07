---
id: "MOD_DIABLO_SIT_POISONED_WATER_SUPPLY_QUEST_IS_COMPLETED_IN_THE_"
title: "The Fouled Spring Beneath the Dungeon"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Water: Cleansed-Spring", "Material: Ring-of-Truth", "Authority: Healer-Gratitude"]
requires: ["Defense: Monster-Clearing-Force", "Lore: Poisoned-Water-Complaint"]
tarot_affinity: ["Temperance", "The Star", "The Devil"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: ["Green", "White"]
hub_eligibility: "candidate"
summary: "Behind a crack in the wall, a set-piece cavern holds Goat Demons and lesser beasts that foul the town's water. Clearing them cleanses the spring, and Pepin rewards the hero with the Ring of Truth."
standalone_fallback: "Run it as a one-shot cavern clearing. The party finds a hidden crack in a dungeon wall, fights the demons and beasts in the caverns beyond, and when the last falls the fouled water runs clear and a grateful healer gives a reward."
injected_mechanics:
  output_dial:
    level_1: "The party finds the crack, clears the caverns without much trouble, and the water runs clear."
    level_2: "The Goat Demons and beasts put up a hard fight through the whole level, and the party emerges victorious."
    level_3: "The caverns are a long gauntlet and the party is worn down, with the poisoned town waiting for relief."
    level_4: "The party is lost in the dark passages, the spring stays fouled, and the town's sickness spreads."
  threat_clocks:
    - name: "The Town Sickens"
      ticks: 6
      advances_when: "The party delays the clearing and the poisoned water continues to flow."
  yields_resource: "A cleansed water supply and the Ring of Truth from Pepin."
---

# MODULE MOD_DIABLO_SIT_POISONED_WATER_SUPPLY_QUEST_IS_COMPLETED_IN_THE_: The Fouled Spring Beneath the Dungeon

Behind a crack in the wall, a set-piece cavern holds Goat Demons and lesser beasts that foul the town's water. Clearing them cleanses the spring, and Pepin rewards the hero with the Ring of Truth.

### Dramatic Premise
A town that needs clean water + monsters poisoning the source below = a hero must clear the caverns to restore it.

### Core Premise
A set-piece cavern lies behind a crack in the wall. The party kills Goat Demons and lesser beasts. When the last monster falls, a trumpet of triumph sounds and the fouled waterway clears to blue before their eyes. Pepin then gives the Ring of Truth.

### GM Placement & Synergies
Place it just below an early dungeon level, reached through a hidden or marked crack. It consumes the party's strength and supplies, and feeds the town's wellbeing and a valuable reward. It goes well when the clearing feels like a real purge, with the water change as a visible payoff. It goes badly if the party skips the crack or leaves monsters alive, since the victory only comes when the last one falls.

### 5D Sensory Pentagon
- **Physical environment:** Set-piece caverns beyond a crack labeled 'To A Dark Passage'. A fouled waterway runs through them.
- **Behaviors:** The party kills Goat Demons and lesser beasts through the whole level. When the last monster falls, a trumpet of triumph sounds in the distance.
- **Relationships:** The healer Pepin depends on the hero to restore the town's water, and rewards success.
- **Attitudes:** Relief and triumph at the end, after grim, dirty fighting in the dark.
- **Values:** Public good, the cleansing of what has been defiled, and gratitude for the deed.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Pepin):** A healer who knows the town's sickness has a source and trusts the hero to remove it. *Leverage:* The Ring of Truth, as a reward, and his standing among the townsfolk. *Blind spot:* He can only wait for others to act.
* **Main opponent (The Goat Demons):** Brutes that hold the caverns as their own. *Leverage:* Strength in the dark, and their hold over the water source. *Blind spot:* They are territorial and fixed to the caverns, with no strategy beyond defense.
* **Thematic shadow (The lesser beasts of the caverns):** Creatures that feed on the corruption seeping through the water. *Leverage:* Numbers and surprise in tight passages. *Blind spot:* They are driven by instinct and scatter when their leaders fall.
* **Tertiary outcast (A townsperson who drinks the water regardless):** There is no other well, so the risk must be accepted. *Leverage:* Their illness is a visible warning of the cost of delay. *Blind spot:* They cannot act, only suffer.

### Output Dial
- **Level 1:** The party finds the crack, clears the caverns without much trouble, and the water runs clear.
- **Level 2:** The Goat Demons and beasts put up a hard fight through the whole level, and the party emerges victorious.
- **Level 3:** The caverns are a long gauntlet and the party is worn down, with the poisoned town waiting for relief.
- **Level 4:** The party is lost in the dark passages, the spring stays fouled, and the town's sickness spreads.

### Threat Clocks
- **The Town Sickens [6 Ticks]:** advances when The party delays the clearing and the poisoned water continues to flow.

### Yields
A cleansed water supply and the Ring of Truth from Pepin.

### Standalone Fallback
Run it as a one-shot cavern clearing. The party finds a hidden crack in a dungeon wall, fights the demons and beasts in the caverns beyond, and when the last falls the fouled water runs clear and a grateful healer gives a reward.
