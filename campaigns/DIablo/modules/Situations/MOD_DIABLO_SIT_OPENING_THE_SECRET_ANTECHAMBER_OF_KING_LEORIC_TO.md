---
id: "MOD_DIABLO_SIT_OPENING_THE_SECRET_ANTECHAMBER_OF_KING_LEORIC_TO"
title: "Opening the Secret Antechamber of King Leoric's Tomb"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Material: Antechamber-Treasure", "Lore: Hidden-Door-Trigger", "Defense: Antechamber-Guardians"]
requires: ["Lore: Tomb-Large-Room", "Defense: Crucified-Skeletons"]
tarot_affinity: ["The Moon", "The Tower", "The Hermit"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Black"
hub_eligibility: "never"
summary: "In the large room of King Leoric's Tomb, the player destroys every crucified Skeleton in the corners. When the last one falls, a door opens in the middle of the long northern wall and reveals a secret antechamber with more foes and treasures."
standalone_fallback: "Run it as a one-room puzzle fight. The party enters a chamber with a crucified Skeleton in each corner, learns that destroying them all opens a hidden door in the northern wall, and then faces the guardians and loot behind it."
injected_mechanics:
  output_dial:
    level_1: "The last Skeleton falls, the door slides open, and a small band of foes and a modest cache wait behind it."
    level_2: "The door opens onto a proper antechamber with a tougher group of foes and worthwhile treasure."
    level_3: "The party is already worn down when the door opens, and the guardians behind it strike before they can regroup."
    level_4: "The opened door releases a force that overwhelms the weakened party and turns the antechamber into a trap."
  threat_clocks:
    - name: "The Antechamber Stirs"
      ticks: 4
      advances_when: "Each corner Skeleton is destroyed, or the party makes enough noise that the guardians behind the wall are alerted."
  yields_resource: "Antechamber treasure, plus the satisfaction and advantage of having solved the room's lock."
related: ["MOD_DIABLO_SIT_KING_LEORIC_TOMB"]
---

# MODULE MOD_DIABLO_SIT_OPENING_THE_SECRET_ANTECHAMBER_OF_KING_LEORIC_TO: Opening the Secret Antechamber of King Leoric's Tomb

In the large room of King Leoric's Tomb, the player destroys every crucified Skeleton in the corners. When the last one falls, a door opens in the middle of the long northern wall and reveals a secret antechamber with more foes and treasures.

### Dramatic Premise
Adventurers who clear every last foe + a tomb that rewards thoroughness with a hidden door = treasure and danger beyond what they expected

### Core Premise
In the large room of King Leoric's Tomb, a crucified Skeleton stands in each corner. Destroying all of them opens a door in the middle of the long northern wall. Behind it lies a secret antechamber with more foes and treasures. The puzzle rewards a party that clears the room completely instead of passing through.

### GM Placement & Synergies
Place it in the large room of King Leoric's Tomb, as a side objective that sits beside the main route. It consumes the party's attention and resources in the corner fights and feeds treasure and a harder encounter beyond the door. An arrival goes well when the GM signals the Skeletons as a pattern, lets the party discover the door, and sets the antechamber's difficulty against what they have spent. It goes badly if the trigger is unclear, if a missed Skeleton blocks progress with no hint, or if the reward does not justify the risk.

### 5D Sensory Pentagon
- **Physical environment:** A large tomb room with a crucified Skeleton in each corner and a long northern wall that conceals a door.
- **Behaviors:** The party hunts down each corner Skeleton, tracks which are still standing, and listens for the stone to move.
- **Relationships:** The Skeletons, the hidden door and the antechamber are tied together as a lock and its key.
- **Attitudes:** The room seems finished until the last Skeleton falls, and then it turns out to have been waiting.
- **Values:** Thoroughness is rewarded, and anything left undone keeps the secret shut.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The tomb's builders):** What lies in the tomb should be guarded and found only by the thorough. *Leverage:* The hidden door and its guardians. *Blind spot:* A lock that depends on a visible rule can be solved by anyone who notices the rule.
* **Main opponent (The antechamber's foes):** Intruders who open the door have come for what the tomb protects. *Leverage:* They lie in wait behind the opened door, with the party's attention spent on the corners. *Blind spot:* They guard the treasure but cannot stop the door from opening.
* **Thematic shadow (The crucified Skeletons):** They exist to hold the door shut by their very presence. *Leverage:* Each one is a link in the lock, so the party must deal with all of them. *Blind spot:* Destroying them is the very act that opens the door.
* **Tertiary outcast (The scavenger who skips the corners):** The main path is enough, and side duties are a waste of time. *Leverage:* A faster route through the tomb. *Blind spot:* They never find the secret antechamber, or find it only after others have emptied it.

### Output Dial
- **Level 1:** The last Skeleton falls, the door slides open, and a small band of foes and a modest cache wait behind it.
- **Level 2:** The door opens onto a proper antechamber with a tougher group of foes and worthwhile treasure.
- **Level 3:** The party is already worn down when the door opens, and the guardians behind it strike before they can regroup.
- **Level 4:** The opened door releases a force that overwhelms the weakened party and turns the antechamber into a trap.

### Threat Clocks
- **The Antechamber Stirs [4 Ticks]:** advances when Each corner Skeleton is destroyed, or the party makes enough noise that the guardians behind the wall are alerted.

### Yields
Antechamber treasure, plus the satisfaction and advantage of having solved the room's lock.

### Related Modules
- `MOD_DIABLO_SIT_KING_LEORIC_TOMB`

### Standalone Fallback
Run it as a one-room puzzle fight. The party enters a chamber with a crucified Skeleton in each corner, learns that destroying them all opens a hidden door in the northern wall, and then faces the guardians and loot behind it.
