---
id: "MOD_DIABLO_SIT_MAGICAL_RESISTANCE"
title: "Magical Resistance"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 3 (Infrastructural Supply Chains)"
pipeline_tier: 3
provides: ["Defense: Magic-Resistance", "Defense: Fire-Resistance", "Defense: Lightning-Resistance"]
requires: ["Material: Resistance-Bearing-Gear"]
tarot_affinity: ["Temperance", "The Chariot", "Strength"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "Three kinds of magic resistance, General, Fire and Lightning, protect the hero from magical attacks. Because magic does not wear down armor the way physical blows do, resistance can justify wearing otherwise weak armor."
standalone_fallback: "Run it as a single encounter against casters, such as succubi, where the party must decide whether to trade solid armor for protection against magic, and see how their choice plays out."
injected_mechanics:
  output_dial:
    level_1: "A hero's resistance shrugs off a stray spell and the fight carries on."
    level_2: "Magical attackers pressure the party, and those with the right resistance hold the line while others struggle."
    level_3: "Fire and lightning assaults overwhelm unprepared heroes, and the party must rethink its gear."
    level_4: "Magic strikes with no matching resistance, leaving the party stripped of defenses and in flight."
  threat_clocks:
    - name: "Unwarded Against Magic"
      ticks: 6
      advances_when: "The party meets magical attackers without matching resistance."
  yields_resource: "Resistance to General, Fire or Lightning magic, and the knowledge that warded gear can be worth wearing even when its physical protection is weak."
---

# MODULE MOD_DIABLO_SIT_MAGICAL_RESISTANCE: Magical Resistance

Three kinds of magic resistance, General, Fire and Lightning, protect the hero from magical attacks. Because magic does not wear down armor the way physical blows do, resistance can justify wearing otherwise weak armor.

### Dramatic Premise
Heroes who armor themselves against blades + enemies who attack with magic instead = a gamble over which protection to wear.

### Core Premise
Magic Resistance comes in three types: General, which concerns monsters like the Succubi, and then Fire and Lightning. Magical attacks do not damage armor Durability as physical attacks do, so resistance can justify wearing otherwise weak armor. Which type to prepare for is the central decision.

### GM Placement & Synergies
Place before a magic-heavy area or boss and let the party learn what they face beforehand, so the choice is informed. It consumes the party's gear options and feeds the Character Class Philosophy theme of secondary configurations, since resistance is part of a flexible build. Arrival goes well if the party scouts and prepares the right ward. It goes badly if they arrive in heavy armor with no resistance and meet fire, lightning or the Succubi unprepared.

### 5D Sensory Pentagon
- **Physical environment:** Armor and gear marked by what they guard against, with magical blasts of fire and lightning striking them.
- **Behaviors:** Heroes weigh equipment, trading physical protection for resistance against magic.
- **Relationships:** Casting monsters like the Succubi press against heroes who prepare for their attacks.
- **Attitudes:** Wariness of magic, and willingness to wear weak armor if it shields against spells.
- **Values:** Preparedness and the right protection for the right threat.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The hero's equipment):** Resistance is a deliberate defensive choice among three types: General, Fire and Lightning. *Leverage:* It blunts magical attacks that armor cannot stop. *Blind spot:* Gear chosen for resistance may be weak against physical blows.
* **Main opponent (The Succubi):** Magic is a weapon that bypasses ordinary armor. *Leverage:* Their magical attacks are not stopped by physical protection, though they leave armor Durability intact. *Blind spot:* General magic resistance is aimed squarely at monsters like them.
* **Thematic shadow (Physical armor):** Sturdy plate is the answer to every threat. *Leverage:* Strong against physical attacks. *Blind spot:* It wears down under physical attacks and does nothing special against magic.
* **Tertiary outcast (The hero in weak but warded gear):** Magical protection is worth more than solid armor. *Leverage:* Strong resistance to the magic that threatens them. *Blind spot:* Exposed to physical attack.

### Output Dial
- **Level 1:** A hero's resistance shrugs off a stray spell and the fight carries on.
- **Level 2:** Magical attackers pressure the party, and those with the right resistance hold the line while others struggle.
- **Level 3:** Fire and lightning assaults overwhelm unprepared heroes, and the party must rethink its gear.
- **Level 4:** Magic strikes with no matching resistance, leaving the party stripped of defenses and in flight.

### Threat Clocks
- **Unwarded Against Magic [6 Ticks]:** advances when The party meets magical attackers without matching resistance.

### Yields
Resistance to General, Fire or Lightning magic, and the knowledge that warded gear can be worth wearing even when its physical protection is weak.

### Standalone Fallback
Run it as a single encounter against casters, such as succubi, where the party must decide whether to trade solid armor for protection against magic, and see how their choice plays out.
