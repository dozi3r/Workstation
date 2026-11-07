---
id: "MOD_DIABLO_SIT_POTIONS_OF_HEALING_AND_MANA"
title: "Potions of Healing and Mana"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 3 (Infrastructural Supply Chains)"
pipeline_tier: 3
provides: ["Bio: Restorative-Potions", "Chem: Mana-Draughts"]
requires: ["Material: Gold-Coin", "Labor: Inventory-Space"]
tarot_affinity: ["The Magician", "Temperance"]
culture_quadrant: "Market"
operational_profile: "Service"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "Nearly every restorative in Tristram comes from the Healer or the Witch. Using them well is an economic puzzle of gold, pack space and what kind of fighter you are."
standalone_fallback: "Run it as a shopping scene in a besieged town. Two merchants sell restoratives, the party's purse and carrying room are limited, and each character must decide which mix of healing and mana to carry before descending."
injected_mechanics:
  output_dial:
    level_1: "The party restocks without trouble, buying a sensible mix that fits each character."
    level_2: "Purses run thin and packs fill up, so characters must pick which potions to leave behind."
    level_3: "A character who overspent on the costly all-in-one potion runs out of one resource mid-fight and cannot afford a replacement."
    level_4: "The party is deep in the dungeon with wasted gold and mismatched potions, and no way to recover one meter when it matters most."
  threat_clocks:
    - name: "Purse runs dry"
      ticks: 6
      advances_when: "The party buys the expensive all-in-one potion or a poorly matched mix instead of a cheaper tailored one."
  yields_resource: "A well-matched kit of restoratives that covers both health and mana at lower cost, plus the know-how to rebuild it as equipment changes."
---

# MODULE MOD_DIABLO_SIT_POTIONS_OF_HEALING_AND_MANA: Potions of Healing and Mana

Nearly every restorative in Tristram comes from the Healer or the Witch. Using them well is an economic puzzle of gold, pack space and what kind of fighter you are.

### Dramatic Premise
A fighter who wants a single flawless cure + a purse that cannot afford it = a hard choice between convenience and a smarter, cheaper mix of potions.

### Core Premise
Apart from a few quest-specific elixirs, nearly all potions come from the Healer and the Witch. The challenge is economic: what the purse can afford, how much the pack can hold, and what the character's class actually needs. The all-in-one potion is the tidiest answer, but the guide calls it a bad investment and advises mixing a full potion of one kind with a partial one of the other.

### GM Placement & Synergies
Place this in Tristram as a downtime or resupply scene before a descent, ideally in the mid-to-late game when purses are fuller. It consumes the party's gold and carrying space, and it feeds every dangerous encounter that follows. An arrival goes well when characters plan around their own class and keep a varied kit; it goes badly when they chase the single flashy purchase and are caught short.

### 5D Sensory Pentagon
- **Physical environment:** Crowded shelves and bottles at the Healer's and the Witch's stalls in Tristram, with a few stray potions in the dungeon below.
- **Behaviors:** Adventurers haggle, weigh their purses, count the free slots in their packs and stock different mixes of potions to suit their class.
- **Relationships:** Pepin the Healer and Adria the Witch are the two suppliers a character depends on, and each class leans on one of them more heavily.
- **Attitudes:** Prudent shoppers see the single all-in-one potion as flashy and wasteful, and a cross-section of cheaper potions as the wiser purchase.
- **Values:** Thrift, preparedness and fitting your supplies to your own nature.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Pepin the Healer):** Restoring the wounded is honest, steady work that keeps the town alive. *Leverage:* He is the main source of healing potions. *Blind spot:* He can only sell what adventurers can pay for.
* **Main opponent (Adria the Witch):** Mana is the real currency of power, and she sells it on her own terms. *Leverage:* She controls the supply of mana potions that casters rely on. *Blind spot:* Her customers can swap in cheaper mixes or healing magic instead.
* **Thematic shadow (The spendthrift fighter):** One perfect potion beats any fiddly arrangement. *Leverage:* Convenience and a fully restored character in a single swallow. *Blind spot:* The costly potion is, by the guide's own verdict, a bad investment.
* **Tertiary outcast (The rogue who hedges):** Health and mana are balanced, and equipment may change at any time, so no stock is ever final. *Leverage:* A flexible kit that suits whatever turns up in the dungeon. *Blind spot:* A mixed kit is never ideal for any single situation.

### Output Dial
- **Level 1:** The party restocks without trouble, buying a sensible mix that fits each character.
- **Level 2:** Purses run thin and packs fill up, so characters must pick which potions to leave behind.
- **Level 3:** A character who overspent on the costly all-in-one potion runs out of one resource mid-fight and cannot afford a replacement.
- **Level 4:** The party is deep in the dungeon with wasted gold and mismatched potions, and no way to recover one meter when it matters most.

### Threat Clocks
- **Purse runs dry [6 Ticks]:** advances when The party buys the expensive all-in-one potion or a poorly matched mix instead of a cheaper tailored one.

### Yields
A well-matched kit of restoratives that covers both health and mana at lower cost, plus the know-how to rebuild it as equipment changes.

### Source Figures (verbatim evidence; not read by the app)
```
Potion of Full Rejuvenation cost: 600 Gold
Combined Full Healing + Partial Mana cost (Warrior example): 200 Gold
Warrior Hit Points at high level: about 300
Warrior Mana at high level: about 150
```

### Standalone Fallback
Run it as a shopping scene in a besieged town. Two merchants sell restoratives, the party's purse and carrying room are limited, and each character must decide which mix of healing and mana to carry before descending.
