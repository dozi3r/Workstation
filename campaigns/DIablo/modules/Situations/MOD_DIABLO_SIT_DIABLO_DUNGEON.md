---
id: "MOD_DIABLO_SIT_DIABLO_DUNGEON"
title: "The Diablo Dungeon"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Depth-Stratified-Monster-Ladder", "Lore: Descent-Into-Hell-Setting", "Defense: Magic-Resistant-Guardians"]
requires: ["Authority: Surface-Settlement-Base", "Tech: Descent-Access-Stairway"]
tarot_affinity: ["The Tower", "The Moon", "Death"]
culture_quadrant: "Hierarchy"
operational_profile: "Produce"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "The dungeon beneath Tristram, descended level by level. Its monsters are sorted by depth, from Goat Demons and Bats near the top to Acid Beasts, Overlords and Balrogs in the lower reaches. The Knights wait near the bottom."
standalone_fallback: "Run it as a one-shot delve. The party descends through tiers of worsening monsters toward a bottom guarded by magic-resistant Knights. Each tier is a new threat family, and a way back up is the only safe resource."
injected_mechanics:
  output_dial:
    level_1: "The upper levels are grim but manageable: Goat Demons and Bats harry the party, and the way back to the surface is still short."
    level_2: "Mid-depth monsters such as Vipers and Acid Beasts press the party. Supplies and healing run down, and each new level demands a different approach."
    level_3: "The deep levels bring Overlords, Magma Demons and Balrogs. The party is cut off from the surface and forced to commit to the descent."
    level_4: "At the bottom the Knights shrug off the party's magic and hold the final approach. Retreat is nearly impossible, and the party survives only by a hard-won change of tactics."
  threat_clocks:
    - name: "The Descent Deepens"
      ticks: 6
      advances_when: "The party goes down a level, or lingers on one long enough for its inhabitants to gather."
    - name: "The Knights Awaken"
      ticks: 4
      advances_when: "The party reaches the lower levels or makes noise near the bottom."
  yields_resource: "Clearing a depth tier gives safer passage, knowledge of that tier's monster family, and access to the next level. Reaching the bottom gives the objective the dungeon guards."
linked_entity: "N_DIABLO_DUNGEON"
related: ["MOD_DIABLO_SIT_TRISTRAM"]
---

# MODULE MOD_DIABLO_SIT_DIABLO_DUNGEON: The Diablo Dungeon

The dungeon beneath Tristram, descended level by level. Its monsters are sorted by depth, from Goat Demons and Bats near the top to Acid Beasts, Overlords and Balrogs in the lower reaches. The Knights wait near the bottom.

### Dramatic Premise
Heroes who must descend to end a threat + a dungeon whose monsters grow deadlier and more magic-proof with depth = a delve that punishes anyone who relies on one trick.

### Core Premise
The Diablo dungeon is a vertical gauntlet beneath Tristram. Its inhabitants are sorted by depth, from Goat Demons and Bats near the top, through Vipers, Gargoyles and Acid Beasts in the middle, to Overlords, Magma Demons and Balrogs in the deep. The Knights sit near the bottom and resist virtually every type of magic. The dungeon rewards variety and punishes dependence on one trick.

### GM Placement & Synergies
Place it directly under Tristram as the main adventure site. It consumes the party's supplies, healing and resolve, and it feeds the surface settlement with news, relics and dread. Introduce each depth tier as a distinct encounter family. Horned Demons should appear a little below the early levels. An arrival goes well when the party has scouted, kept a retreat open and mixed physical and magical options. It goes badly when the party relies on magic alone against the Knights, or presses into the deep without supplies.

### 5D Sensory Pentagon
- **Physical environment:** A dungeon of stacked levels. The upper levels hold Goat Demons and Bats, the middle and lower levels hold Acid Beasts and Vipers, and the deepest reaches hold Overlords, Magma Demons, Gargoyles and Balrogs. The bottom is the domain of the Knights.
- **Behaviors:** Monsters are grouped by depth, so each descent brings a new family of foes. Some inhabitants remain hidden until the party is among them.
- **Relationships:** The dungeon lies under Tristram and contains the Knights. Horned Demons are first expected a little below the early levels.
- **Attitudes:** Every level is hostile. The deeper levels feel more final and more resistant to the party's usual methods.
- **Values:** Depth is the measure of danger. The Knights at the bottom resist nearly every kind of magic, so brute persistence and varied tactics matter more than one favored spell.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Knights):** The bottom of the dungeon is theirs to hold, and they cannot be harmed by ordinary sorcery. *Leverage:* They resist virtually every type of magic. *Blind spot:* They are found only at the bottom, so they cannot react to what happens higher up.
* **Main opponent (The Balrogs and Overlords):** The deep levels belong to the strong, and intruders are prey. *Leverage:* They hold the lower depths where the surface has no reach. *Blind spot:* They are tied to their depth and are not expected near the entrance.
* **Thematic shadow (The Acid Beasts):** Attrition is enough. Anything that comes down will be worn away. *Leverage:* They are common in the mid-to-lower levels, where the party's supplies are already thin. *Blind spot:* They are a mid-depth hazard and can be bypassed or prepared for by anyone who has scouted ahead.
* **Tertiary outcast (The hidden things of the dungeon):** Unseen things strike only when the moment is right. *Leverage:* They stay concealed until the party has committed to a level. *Blind spot:* Their reliance on surprise fails once they are anticipated.

### Output Dial
- **Level 1:** The upper levels are grim but manageable: Goat Demons and Bats harry the party, and the way back to the surface is still short.
- **Level 2:** Mid-depth monsters such as Vipers and Acid Beasts press the party. Supplies and healing run down, and each new level demands a different approach.
- **Level 3:** The deep levels bring Overlords, Magma Demons and Balrogs. The party is cut off from the surface and forced to commit to the descent.
- **Level 4:** At the bottom the Knights shrug off the party's magic and hold the final approach. Retreat is nearly impossible, and the party survives only by a hard-won change of tactics.

### Threat Clocks
- **The Descent Deepens [6 Ticks]:** advances when The party goes down a level, or lingers on one long enough for its inhabitants to gather.
- **The Knights Awaken [4 Ticks]:** advances when The party reaches the lower levels or makes noise near the bottom.

### Yields
Clearing a depth tier gives safer passage, knowledge of that tier's monster family, and access to the next level. Reaching the bottom gives the objective the dungeon guards.

### Source Figures (verbatim evidence; not read by the app)
```
Dungeon level: Horned Demons first expected between levels 5 and 6
```

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`

### Standalone Fallback
Run it as a one-shot delve. The party descends through tiers of worsening monsters toward a bottom guarded by magic-resistant Knights. Each tier is a new threat family, and a way back up is the only safe resource.
