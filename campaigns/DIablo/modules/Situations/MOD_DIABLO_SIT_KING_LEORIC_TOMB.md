---
id: "MOD_DIABLO_SIT_KING_LEORIC_TOMB"
title: "King Leoric's Tomb"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Material: Tomb-Treasure", "Lore: Hidden-Antechamber", "Ecology: Skeleton-Guardians"]
requires: ["Defense: Party-Combat-Capability", "Lore: Dungeon-Access-Route"]
tarot_affinity: ["Death", "The Emperor", "The Devil"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Black"
hub_eligibility: "never"
summary: "A cramped tomb stuffed with Skeletons, with a small room of obvious treasure chests and a hidden antechamber. The hidden area opens only when every crucified Skeleton in the large room's corners has been destroyed."
standalone_fallback: "Run the tomb as a one-room puzzle fight. The party must find and destroy every crucified Skeleton in the corners of the large room to open the hidden door, then face what is behind it for the better treasure."
injected_mechanics:
  output_dial:
    level_1: "The party quietly clears the Skeletons, opens the door and takes the treasure with little trouble."
    level_2: "The cramped rooms make every fight messy, and the party must hunt down each crucified Skeleton before the door appears."
    level_3: "The party enters the antechamber already worn out, and the foes inside press them hard in the tight space."
    level_4: "The party is overwhelmed in the cramped tomb, trapped between the Skeletons and the antechamber's guardians, with the treasure out of reach."
  threat_clocks:
    - name: "The Party Is Worn Down"
      ticks: 6
      advances_when: "The party fights the Skeletons in the cramped rooms without resting or retreating."
  yields_resource: "Treasure from the chests in the small room and better treasure from the hidden antechamber."
linked_entity: "N_KING_LEORIC_TOMB"
related: ["MOD_DIABLO_SIT_OPENING_THE_SECRET_ANTECHAMBER_OF_KING_LEORIC_TO"]
---

# MODULE MOD_DIABLO_SIT_KING_LEORIC_TOMB: King Leoric's Tomb

A cramped tomb stuffed with Skeletons, with a small room of obvious treasure chests and a hidden antechamber. The hidden area opens only when every crucified Skeleton in the large room's corners has been destroyed.

### Dramatic Premise
A party that wants the easy treasure + a hidden chamber that opens only after a thorough clearing = greed rewarded only by patience and violence.

### Core Premise
The tomb tests thoroughness. Obvious treasure chests wait in the small room, but the real prize lies behind a door that appears only after every crucified Skeleton in the large room's corners is destroyed. Inside are more foes and more treasure.

### GM Placement & Synergies
Place this tomb partway down the dungeon, as a mid-game side objective reached from an early level. It consumes the party's combat strength and feeds loot back toward town. It links to the scene of opening the secret antechamber. An arrival goes well when the party scouts the corners and clears them methodically. It goes badly when they take the obvious chests, miss the hidden door, or go in wounded.

### 5D Sensory Pentagon
- **Physical environment:** Cramped quarters stuffed with Skeletons, a small room with treasure chests in plain view, and a large room with a long northern wall.
- **Behaviors:** Crucified Skeletons stand guard in the corners. When the last falls to the ground, a door opens in the middle of the long northern wall.
- **Relationships:** The tomb belongs to King Leoric, who is entombed here. The Skeletons serve him, even after death.
- **Attitudes:** Oppressive and watchful, with the sense that the obvious treasure is bait.
- **Values:** Guarded royal treasure and the reward for thoroughness.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (King Leoric):** The tomb is his domain, and what lies in it is his to guard. *Leverage:* He commands the Skeletons and holds the treasure in his tomb. *Blind spot:* He is bound to the tomb and cannot leave it.
* **Main opponent (The Crucified Skeletons):** They guard the hidden door and exist to keep the antechamber sealed. *Leverage:* They stand in the corners of the large room and keep the door shut while any of them remains. *Blind spot:* They are fixed in place, and destroying all of them is what opens the door.
* **Thematic shadow (The treasure-hunting adventurer):** Anything sealed away is there to be taken. *Leverage:* They can open the tomb by clearing it methodically. *Blind spot:* Greed for the easy chests may lead them to miss the hidden reward or to walk into the foes behind it.
* **Tertiary outcast (The antechamber's foes):** They wait out of sight behind the hidden door, apart from the rest of the tomb. *Leverage:* They hit a party that is already worn down by the Skeletons. *Blind spot:* They only act once the door is opened, so the party can prepare for them.

### Output Dial
- **Level 1:** The party quietly clears the Skeletons, opens the door and takes the treasure with little trouble.
- **Level 2:** The cramped rooms make every fight messy, and the party must hunt down each crucified Skeleton before the door appears.
- **Level 3:** The party enters the antechamber already worn out, and the foes inside press them hard in the tight space.
- **Level 4:** The party is overwhelmed in the cramped tomb, trapped between the Skeletons and the antechamber's guardians, with the treasure out of reach.

### Threat Clocks
- **The Party Is Worn Down [6 Ticks]:** advances when The party fights the Skeletons in the cramped rooms without resting or retreating.

### Yields
Treasure from the chests in the small room and better treasure from the hidden antechamber.

### Related Modules
- `MOD_DIABLO_SIT_OPENING_THE_SECRET_ANTECHAMBER_OF_KING_LEORIC_TO`

### Standalone Fallback
Run the tomb as a one-room puzzle fight. The party must find and destroy every crucified Skeleton in the corners of the large room to open the hidden door, then face what is behind it for the better treasure.
