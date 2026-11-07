---
id: "MOD_DIABLO_SIT_BUTCHER_IS_DEFEATED_BY_LURING_HIM_THROUGH_A_GRAT"
title: "The Butcher and the Grated Door"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Material: Butcher-Cleaver", "Defense: Grated-Door-Chokepoint"]
requires: ["Defense: Ranged-Weapon", "Lore: Butcher-Location"]
tarot_affinity: ["The Chariot", "The Hermit"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "Blue"
hub_eligibility: "never"
summary: "After the party clears the cathedral depths, it lures the Butcher to a doorway flanked by steel grating, closes the door on him, shoots him with a bow until he dies, then takes his Cleaver."
standalone_fallback: "Run it as a one-shot tactical puzzle. A relentless brute cannot be fought in melee, but a doorway with a grated view lets one ranged attacker whittle it down safely, if the party can bait it there."
injected_mechanics:
  output_dial:
    level_1: "The party notes the grated doorway and plans a lure."
    level_2: "The party baits the Butcher to the door, closes it and fires until he falls, then takes the Cleaver."
    level_3: "The bait works but the party's ammunition or nerve falters, and the fight drags on with real risk."
    level_4: "The plan fails, the Butcher reaches the party in the open, and the slaughter the townsman described repeats itself."
  threat_clocks:
    - name: "The Butcher Closes In"
      ticks: 4
      advances_when: "The lure is botched, the party is caught away from the doorway, or ranged fire runs short."
  yields_resource: "The Butcher's Cleaver, a cleared route onward, and the promise to the dying townsman kept."
---

# MODULE MOD_DIABLO_SIT_BUTCHER_IS_DEFEATED_BY_LURING_HIM_THROUGH_A_GRAT: The Butcher and the Grated Door

After the party clears the cathedral depths, it lures the Butcher to a doorway flanked by steel grating, closes the door on him, shoots him with a bow until he dies, then takes his Cleaver.

### Dramatic Premise
A party that cannot match a brute in melee + a door the brute cannot pass = a kill from safety and a prize from the corpse.

### Core Premise
The solution is to let the Butcher chase the party to the grated doorway, close the door in his face and shoot him with a bow until he dies. It rewards using terrain over force.

### GM Placement & Synergies
Place it after the surrounding depths are cleared and before the Butcher's room is opened. It consumes ranged equipment and the party's preparation, and it feeds into the Cleaver as loot and into the avenging of the cathedral dead. It goes well when the party spots the doorway and plans around it. It goes badly when the party opens the Butcher's room first and has to improvise against a brute that outmatches it in the open.

### 5D Sensory Pentagon
- **Physical environment:** A doorway flanked by steel grating, with a closed door between hunter and hunted.
- **Behaviors:** The party baits the Butcher to the doorway, shuts the door in his face and fires from behind the grating.
- **Relationships:** The party relies on terrain against an enemy it could not beat directly.
- **Attitudes:** Patient, calculating and cautious.
- **Values:** Cleverness and preparation beat brute force.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The cleared cathedral depths):** Order has been restored, and only the Butcher remains. *Leverage:* A secured route and room to set up a trap. *Blind spot:* One mistake brings the Butcher into melee range.
* **Main opponent (The Butcher):** Chase and slaughter whatever moves. *Leverage:* Overwhelming strength in close combat. *Blind spot:* He chases blindly and cannot get past a closed door.
* **Thematic shadow (The reckless duelist):** Honor means facing a foe head-on. *Leverage:* Bravery and a direct approach. *Blind spot:* Dies to a brute that cleverness would have beaten.
* **Tertiary outcast (The archer who stays behind the grating):** Distance is the best armor. *Leverage:* A safe angle and steady ranged fire. *Blind spot:* Depends entirely on the door holding and on having enough ammunition.

### Output Dial
- **Level 1:** The party notes the grated doorway and plans a lure.
- **Level 2:** The party baits the Butcher to the door, closes it and fires until he falls, then takes the Cleaver.
- **Level 3:** The bait works but the party's ammunition or nerve falters, and the fight drags on with real risk.
- **Level 4:** The plan fails, the Butcher reaches the party in the open, and the slaughter the townsman described repeats itself.

### Threat Clocks
- **The Butcher Closes In [4 Ticks]:** advances when The lure is botched, the party is caught away from the doorway, or ranged fire runs short.

### Yields
The Butcher's Cleaver, a cleared route onward, and the promise to the dying townsman kept.

### Standalone Fallback
Run it as a one-shot tactical puzzle. A relentless brute cannot be fought in melee, but a doorway with a grated view lets one ranged attacker whittle it down safely, if the party can bait it there.
