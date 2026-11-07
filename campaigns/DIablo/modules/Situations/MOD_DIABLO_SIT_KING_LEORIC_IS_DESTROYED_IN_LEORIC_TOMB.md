---
id: "MOD_DIABLO_SIT_KING_LEORIC_IS_DESTROYED_IN_LEORIC_TOMB"
title: "The Bone King's Tomb"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Material: Skeleton-Crown", "Defense: Undead-Horde-Neutralized", "Lore: Fallen-King-Resolution"]
requires: ["Lore: Cursed-King-Legend", "Defense: Combat-Capability-Against-Undead"]
tarot_affinity: ["Death", "The Emperor", "The Tower"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "Reached through an obvious passage in the dungeon, Leoric's Tomb is a small level where the cursed king summons skeletons to defend himself. Destroying him earns the Skeleton Crown."
standalone_fallback: "Run it as a one-shot dungeon crawl. The party finds a passage into a royal tomb, fights through waves of skeletons the undead king keeps summoning, and destroys him to claim his crown."
injected_mechanics:
  output_dial:
    level_1: "The party moves quickly through the tomb and the king falls before his skeletons can gather."
    level_2: "Waves of skeletons are fought off steadily and the king is destroyed after a hard battle."
    level_3: "The skeletons multiply faster than the party can clear them and retreat becomes a real option."
    level_4: "An insurmountable horde of bonemen overwhelms the party and the king's curse spreads beyond the tomb."
  threat_clocks:
    - name: "The Bone Horde Grows"
      ticks: 6
      advances_when: "The king is left alive and summons more skeletons while the party is distracted or slow."
  yields_resource: "The Skeleton Crown, the end of the king's curse, and removal of the undead horde's threat."
---

# MODULE MOD_DIABLO_SIT_KING_LEORIC_IS_DESTROYED_IN_LEORIC_TOMB: The Bone King's Tomb

Reached through an obvious passage in the dungeon, Leoric's Tomb is a small level where the cursed king summons skeletons to defend himself. Destroying him earns the Skeleton Crown.

### Dramatic Premise
A hero who wants to end a curse + a king who raises bones faster than they can be broken = a race to destroy him before his horde is unstoppable.

### Core Premise
Leoric's Tomb is a small level reached through an obvious passage. The king summons skeletons, and the advice is to put him out of business as quickly as possible lest he create an insurmountable horde of bonemen. Destroying him yields the Skeleton Crown.

### GM Placement & Synergies
Place it a short way below a mid-depth dungeon level, as a compact set piece. It consumes the knowledge of the curse, ideally from the tavern plea, and feeds a reward item and a sense of closure. It goes well when the pressure of the growing horde pushes the party to act decisively. It goes badly if the party lingers, since time is what the king exploits.

### 5D Sensory Pentagon
- **Physical environment:** A small, enclosed tomb reached by an obvious passage from the dungeon above. Cramped chambers where bones gather.
- **Behaviors:** The king summons skeletons continually, so the longer the fight runs, the more of them there are.
- **Relationships:** A summoner and his endless servants. The party stands between the king and the world above.
- **Attitudes:** Urgency: the advice is to put him out of business as quickly as possible.
- **Values:** Speed over caution, and finality over mercy.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (King Leoric):** A ruler in death as in life, commanding his bonemen in his own tomb. *Leverage:* The power to summon skeletons without end. *Blind spot:* He is bound to his tomb and his cursed form, and his strength is spent if he is struck down quickly.
* **Main opponent (The summoned skeleton horde):** Servants without will that exist to protect the king. *Leverage:* Numbers, which grow the longer the fight lasts. *Blind spot:* They fall when the summoner falls, and they have no tactics.
* **Thematic shadow (The hero who becomes the new tomb-robber):** Taking the crown from a grave is a profit that may carry a price. *Leverage:* The prize of the Skeleton Crown. *Blind spot:* Greed can make a rescue into plunder.
* **Tertiary outcast (A wandering survivor or looter in the tomb):** The dead king's chambers are a place to scavenge while the fighting is elsewhere. *Leverage:* Knowledge of side passages. *Blind spot:* They are easily caught between the king and the party.

### Output Dial
- **Level 1:** The party moves quickly through the tomb and the king falls before his skeletons can gather.
- **Level 2:** Waves of skeletons are fought off steadily and the king is destroyed after a hard battle.
- **Level 3:** The skeletons multiply faster than the party can clear them and retreat becomes a real option.
- **Level 4:** An insurmountable horde of bonemen overwhelms the party and the king's curse spreads beyond the tomb.

### Threat Clocks
- **The Bone Horde Grows [6 Ticks]:** advances when The king is left alive and summons more skeletons while the party is distracted or slow.

### Yields
The Skeleton Crown, the end of the king's curse, and removal of the undead horde's threat.

### Standalone Fallback
Run it as a one-shot dungeon crawl. The party finds a passage into a royal tomb, fights through waves of skeletons the undead king keeps summoning, and destroys him to claim his crown.
