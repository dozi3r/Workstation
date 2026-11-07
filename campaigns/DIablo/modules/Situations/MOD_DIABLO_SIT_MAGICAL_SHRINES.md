---
id: "MOD_DIABLO_SIT_MAGICAL_SHRINES"
title: "Magical Shrines"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Cryptic-Shrine-Messages", "Power: Shrine-Boons"]
requires: ["Lore: Shrine-Message-Table"]
tarot_affinity: ["The High Priestess", "The Wheel of Fortune"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: ["Blue", "Red"]
hub_eligibility: "never"
summary: "Shrines trigger when stepped upon and give only a cryptic message. Their effects range from helpful to costly, so every one is a gamble that rewards preparation."
standalone_fallback: "Run it as a single chamber holding one unmarked shrine. The party must decide whether to activate it after reading an ambiguous message, with the outcome a blessing, a trade-off or a hidden cost."
injected_mechanics:
  output_dial:
    level_1: "A shrine grants a small, welcome boon and the party moves on slightly stronger."
    level_2: "A shrine's message is unclear and its effect is a mixed trade, giving something and taking something else."
    level_3: "A badly timed shrine exacts a real cost, such as gear turned brittle or a spell upgrade bought with lost mana."
    level_4: "The party stumbles on a shrine whose effect spoils the whole expedition, leaving their kit damaged and their plan in ruins."
  threat_clocks:
    - name: "Gamble turns sour"
      ticks: 4
      advances_when: "The party activates shrines without reading the message or preparing for its effect."
  yields_resource: "A boon such as improved attributes, sturdier items, a spell upgrade or a protective shield, along with knowledge of what each shrine does."
---

# MODULE MOD_DIABLO_SIT_MAGICAL_SHRINES: Magical Shrines

Shrines trigger when stepped upon and give only a cryptic message. Their effects range from helpful to costly, so every one is a gamble that rewards preparation.

### Dramatic Premise
An adventurer eager for a boon + a shrine that speaks only in riddles = a blind gamble on power at a possible price.

### Core Premise
Most of the time a shrine offers only a cryptic clue to its function, and the hint is often lost on the weary adventurer. The guide catalogues shrine types, their messages and effects, which cover stat changes, durability, spell upgrades, mana shields, chest regeneration, potion transforms, a level teleport and level-wide mapping or identification. Some, such as the Cryptic, Thaumaturgic and Spiritual shrines, clearly reward preparation before activating.

### GM Placement & Synergies
Use shrines as small side rooms or optional detours inside any dungeon floor. They consume the party's caution and sometimes their mana or gear condition, and they feed boons into later fights. An arrival goes well when the party reads the message, prepares and weighs the trade; it goes badly when they press blindly and pay for effects they did not want.

### 5D Sensory Pentagon
- **Physical environment:** Lone shrines scattered through the dungeon, each of which activates when you step up to it.
- **Behaviors:** Weary adventurers step up, read a cryptic message and then decide whether to risk the effect, often missing the hint.
- **Relationships:** The shrine and the one who approaches it, with no guide except the message itself.
- **Attitudes:** The hint is often lost on the weary adventurer, so shrines breed both hope and suspicion.
- **Values:** Knowledge, readiness and a willingness to gamble on uncertain power.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The shrine's makers):** Power is offered in riddles to those who deserve it. *Leverage:* A dungeon dotted with boons that lure explorers onward. *Blind spot:* Their messages are so cryptic that few can use them.
* **Main opponent (The tainted shrine):** Every gift has a hidden price. *Leverage:* Costly trade-offs that punish the rash, such as lost mana or weakened gear. *Blind spot:* Its cost is only a gamble, and careful players can avoid it.
* **Thematic shadow (The reckless seeker):** Any boon is worth the risk, so activate everything. *Leverage:* Quick access to power the cautious never reach. *Blind spot:* Unprepared, they pay full price for effects they cannot use.
* **Tertiary outcast (The weary wanderer):** The hints mean nothing and one should simply press on. *Leverage:* Speed and economy of effort. *Blind spot:* Misses the shrines that clearly reward preparation.

### Output Dial
- **Level 1:** A shrine grants a small, welcome boon and the party moves on slightly stronger.
- **Level 2:** A shrine's message is unclear and its effect is a mixed trade, giving something and taking something else.
- **Level 3:** A badly timed shrine exacts a real cost, such as gear turned brittle or a spell upgrade bought with lost mana.
- **Level 4:** The party stumbles on a shrine whose effect spoils the whole expedition, leaving their kit damaged and their plan in ruins.

### Threat Clocks
- **Gamble turns sour [4 Ticks]:** advances when The party activates shrines without reading the message or preparing for its effect.

### Yields
A boon such as improved attributes, sturdier items, a spell upgrade or a protective shield, along with knowledge of what each shrine does.

### Source Figures (verbatim evidence; not read by the app)
```
Mysterious shrine effect: Adds 5 points to one random stat, takes 1 point from others
Hidden shrine effect: Adds 10 points to the maximum and current durability to all items, -10 to one
Gloomy shrine effect: Add +2AC to all shields, helmets, armor; -1 to all weapons max damage
Magical shrine effect: Adds +1 to all weapons max damage
Enchanted shrine effect: Gives Firebolt +2, but you lose 1/10 of your maximum Mana
Holy shrine effect: Adds 2 points to your magic
Sacred shrine effect: Charged bolt +2 levels, lose 1/10 max Mana
Spiritual shrine effect: Add +2 to Dex
Quiet shrine effect: Add +2 to VIT
Glimmering shrine effect: Holy Bolt level +2, lose 1/10 max Mana
```

### Standalone Fallback
Run it as a single chamber holding one unmarked shrine. The party must decide whether to activate it after reading an ambiguous message, with the outcome a blessing, a trade-off or a hidden cost.
