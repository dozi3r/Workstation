---
id: "MOD_DIABLO_SIT_MAGICAL_ITEM_PREFIXES_AND_SUFFIXES"
title: "Magical item prefixes and suffixes"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 3 (Infrastructural Supply Chains)"
pipeline_tier: 3
provides: ["Material: Magical-Item-Properties", "Tech: Item-Enchantment-Profile", "Lore: Item-Identification-Clue"]
requires: ["Material: Unidentified-Magical-Item", "Lore: Item-Source"]
tarot_affinity: ["Wheel of Fortune", "The Magician"]
culture_quadrant: "Market"
operational_profile: "Produce"
mtg_color: "Blue"
hub_eligibility: "candidate"
summary: "Magical weapons, armor, amulets and cloaks gain randomly assigned prefixes and suffixes that define their properties. Items with both a positive prefix and suffix are best, and prefixes can modify damage, armor, accuracy, Mana, resistances and spell levels."
standalone_fallback: "Run it as an item-appraisal scene: the party finds a magical item and learns its random properties from its prefix and suffix. They decide whether to keep, trade or fear what it does."
injected_mechanics:
  output_dial:
    level_1: "The party finds a modestly enchanted item that gives a small, welcome edge."
    level_2: "A well-matched prefix and suffix make an item clearly useful and spark trading or debate over who should hold it."
    level_3: "A mismatched or negative property makes the item risky, and the party must decide whether to rely on it."
    level_4: "A powerful but flawed item grants vast advantage at a terrible cost, tempting the party into a disastrous bargain."
  threat_clocks:
    - name: "The Gamble Sours"
      ticks: 4
      advances_when: "The party relies on an unidentified or poorly matched item without checking its properties."
  yields_resource: "Knowledge of an item's properties and a useful, well-matched magical item."
---

# MODULE MOD_DIABLO_SIT_MAGICAL_ITEM_PREFIXES_AND_SUFFIXES: Magical item prefixes and suffixes

Magical weapons, armor, amulets and cloaks gain randomly assigned prefixes and suffixes that define their properties. Items with both a positive prefix and suffix are best, and prefixes can modify damage, armor, accuracy, Mana, resistances and spell levels.

### Dramatic Premise
Adventurers who crave a better edge + loot whose properties are assigned by chance = they gamble on what each find is truly worth.

### Core Premise
When a character acquires a magical weapon, armor, amulet or cloak, a set of randomly assigned prefixes and suffixes defines its properties. Prefixes modify things such as damage, armor, To Hit, Mana, resistances and spell levels. Items with both a prefix and a suffix, if positive, are best. The source gives only partial prefix tables.

### GM Placement & Synergies
Place this wherever the party gains loot, such as the reward from a slain Unique. It consumes unidentified items and feeds the party's capabilities and trading choices. An arrival goes well when the party reads the name, matches the item to its wielder, and gains a clear boost. It goes badly when they assume any magical item is good, equip a negative property, or give a prize to a character who cannot use it.

### 5D Sensory Pentagon
- **Physical environment:** A weapon, armor, amulet or cloak whose name carries a prefix and suffix that hint at what it holds.
- **Behaviors:** Characters read an item's name, compare its properties, and weigh keeping or trading it.
- **Relationships:** Each item's prefix and suffix together define it, so the pairing matters as much as either part.
- **Attitudes:** Excitement at a lucky roll and wariness that a bad suffix or prefix may curse the find.
- **Values:** Items with both a prefix and a suffix, if positive, are best.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The item's makers or the roll of chance):** Properties are assigned at random and define an item's worth. *Leverage:* Prefixes and suffixes grant resistances, damage, armor, To Hit and Mana bonuses, and spell-level boosts. *Blind spot:* Outcomes are unpredictable and some properties may be negative.
* **Main opponent (The unlucky finder):** Every find should be a prize, so bad rolls feel like betrayal. *Leverage:* They can discard or trade a weak item. *Blind spot:* They cannot control what properties an item receives.
* **Thematic shadow (The collector):** Only items with both a good prefix and a good suffix are worth keeping. *Leverage:* Discernment and patience. *Blind spot:* Obsession with the best may leave them without a workable tool.
* **Tertiary outcast (The class who can't use it):** A role that cannot use a property sees it as worthless trade goods. *Leverage:* They can sell or trade it. *Blind spot:* They miss what the item might have done in other hands.

### Output Dial
- **Level 1:** The party finds a modestly enchanted item that gives a small, welcome edge.
- **Level 2:** A well-matched prefix and suffix make an item clearly useful and spark trading or debate over who should hold it.
- **Level 3:** A mismatched or negative property makes the item risky, and the party must decide whether to rely on it.
- **Level 4:** A powerful but flawed item grants vast advantage at a terrible cost, tempting the party into a disastrous bargain.

### Threat Clocks
- **The Gamble Sours [4 Ticks]:** advances when The party relies on an unidentified or poorly matched item without checking its properties.

### Yields
Knowledge of an item's properties and a useful, well-matched magical item.

### Standalone Fallback
Run it as an item-appraisal scene: the party finds a magical item and learns its random properties from its prefix and suffix. They decide whether to keep, trade or fear what it does.
