---
id: "MOD_DIABLO_SIT_BLOOD_FOUNTAIN"
title: "Blood Fountain"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Bio: Restorative-Fountain", "Defense: Field-Recovery"]
requires: ["Authority: Safe-Access-To-Fountain"]
tarot_affinity: ["Temperance", "The Star"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "White"
hub_eligibility: "never"
summary: "A fountain in the dungeon from which a single drink restores a character's Health. A small refuge of recovery amid the depths."
standalone_fallback: "Run it as a quiet oasis room in any dungeon: a fountain of blood-red liquid offers healing to whoever dares drink, and the only question is whether the party takes the offer, shares it, or guards it against others who also need it."
injected_mechanics:
  output_dial:
    level_1: "The fountain is a calm, untouched stop where a drink eases the party's wounds before they move on."
    level_2: "The fountain helps, but the party must stop, guard it and decide who drinks first."
    level_3: "Rivals or monsters converge on the fountain just as the party is badly hurt and desperate for it."
    level_4: "The party stakes everything on the fountain and finds it contested, fouled or out of reach when the worst moment arrives."
  threat_clocks:
    - name: "Dependence on the Fountain"
      ticks: 4
      advances_when: "The party chooses to push on wounded rather than rest elsewhere, counting on returning to drink."
    - name: "Rivals Close In"
      ticks: 6
      advances_when: "The party lingers, makes noise or leaves signs of their presence near the fountain."
  yields_resource: "Restored Health for the party, and a fixed point of safety to plan a descent around."
linked_entity: "N_BLOOD_FOUNTAIN"
---

# MODULE MOD_DIABLO_SIT_BLOOD_FOUNTAIN: Blood Fountain

A fountain in the dungeon from which a single drink restores a character's Health. A small refuge of recovery amid the depths.

### Dramatic Premise
A wounded delver who trusts anything that heals + a fountain that offers recovery without explanation = a gamble between relief and unknown cost.

### Core Premise
The Blood Fountain is a single, simple promise: drink and your character's Health is restored. Its value is in the timing. A wounded party that finds it feels relief, and the story is in what they do with it, whether they share, guard or squander it.

### GM Placement & Synergies
Place it after a hard fight or hazard, or just before a chokepoint or boss. It consumes the party's time and attention and feeds their ability to continue. It pairs well with chokepoints such as lava crossings and with any pressure from pursuers. An arrival goes well when the party is hurt, calm and cooperative and drinks without incident. It goes badly when they arrive with enemies on their heels, or when they build a plan around the fountain that the situation then denies them. The card gives no further properties, so any hidden cost, limits or guardians are the GM's own addition.

### 5D Sensory Pentagon
- **Physical environment:** A fountain set within the dungeon, its contents offered for drinking.
- **Behaviors:** Wounded characters stop to drink and recover before pressing on.
- **Relationships:** Travelers who share the find, or compete over it, when several are hurt.
- **Attitudes:** Relief mixed with wariness at drinking from a fountain in a dungeon.
- **Values:** Restoration of Health and the chance to continue the descent.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The party's healer or caretaker):** Recovery is a resource to be rationed so everyone can keep going. *Leverage:* Controls who drinks and in what order. *Blind spot:* Rationing slows the group and breeds resentment.
* **Main opponent (A rival delver or wandering horde claiming the fountain):** Whoever holds the healing wins the dungeon. *Leverage:* Can contest or foul the fountain and punish those who linger. *Blind spot:* Overconfidence in a place they treat as safe.
* **Thematic shadow (A desperate wounded survivor):** Any cure is worth any risk. *Leverage:* Shows what drinking costs when it is relied on too heavily. *Blind spot:* Dependence blinds them to danger.
* **Tertiary outcast (A wary scout who refuses to drink):** Nothing in the dungeon is free. *Leverage:* Notices signs others miss around the fountain. *Blind spot:* Suspicion leaves them weaker than their companions.

### Output Dial
- **Level 1:** The fountain is a calm, untouched stop where a drink eases the party's wounds before they move on.
- **Level 2:** The fountain helps, but the party must stop, guard it and decide who drinks first.
- **Level 3:** Rivals or monsters converge on the fountain just as the party is badly hurt and desperate for it.
- **Level 4:** The party stakes everything on the fountain and finds it contested, fouled or out of reach when the worst moment arrives.

### Threat Clocks
- **Dependence on the Fountain [4 Ticks]:** advances when The party chooses to push on wounded rather than rest elsewhere, counting on returning to drink.
- **Rivals Close In [6 Ticks]:** advances when The party lingers, makes noise or leaves signs of their presence near the fountain.

### Yields
Restored Health for the party, and a fixed point of safety to plan a descent around.

### Standalone Fallback
Run it as a quiet oasis room in any dungeon: a fountain of blood-red liquid offers healing to whoever dares drink, and the only question is whether the party takes the offer, shares it, or guards it against others who also need it.
