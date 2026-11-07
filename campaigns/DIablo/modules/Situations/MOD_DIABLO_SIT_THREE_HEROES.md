---
id: "MOD_DIABLO_SIT_THREE_HEROES"
title: "The Three Heroes"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Lore: Hero-Archetype-Choice", "Authority: Player-Agency-Over-Protagonist", "Labor: Delver-Expedition"]
requires: ["Lore: Dungeon-Descent-Setting", "Material: Pre-Descent-Supplies"]
tarot_affinity: ["The Magician", "The Chariot", "The Lovers"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "Colorless"
hub_eligibility: "candidate"
summary: "Players guide one of three distinct characters through the dungeons beneath Tristram."
standalone_fallback: "Run it as a character-choice opening. Offer the table three distinct delver archetypes (the Rogue, the Warrior and the Sorcerer), let each player claim one, and send them into a single labyrinthine descent where their differences shape every problem."
injected_mechanics:
  output_dial:
    level_1: "The chosen hero fits the early dungeon well, and the player enjoys the sense of a role well played."
    level_2: "The hero's limits start to show: some obstacles favor the Rogue, the Warrior or the Sorcerer, and the player must lean on strengths and cover weaknesses."
    level_3: "The hero is poorly matched to the depths ahead, supplies are mis-prioritized and the player feels the cost of a hasty choice."
    level_4: "The chosen path collapses: the Sorcerer is caught without the Witch's stock, or a hero faces a threat that their role simply cannot answer, and the expedition faces ruin."
  threat_clocks:
    - name: "Unsuited Preparation"
      ticks: 4
      advances_when: "A hero descends without purchases fitting their role, such as a Sorcerer who skips the Witch's supply."
    - name: "Role Overreach"
      ticks: 6
      advances_when: "A hero is pushed into situations that their archetype handles poorly, and no ally or resource covers the gap."
  yields_resource: "A well-matched hero with fitting supplies, and the player's understanding of what each archetype does best."
related: ["MOD_DIABLO_SIT_DUNGEON"]
---

# MODULE MOD_DIABLO_SIT_THREE_HEROES: The Three Heroes

Players guide one of three distinct characters through the dungeons beneath Tristram.

### Dramatic Premise
A delver who must commit to one of three distinct paths + a labyrinth that treats each path differently = a choice that shapes the whole descent.

### Core Premise
Players guide one of three distinct characters through the labyrinthine dungeons and cavernous grottos carved deep in the earth near Tristram. The Sorcerer is one of the playable characters, and the guide advises checking the Witch's supply before other purchases when playing that role. Treat the choice of hero as the opening decision that colors every later problem.

### GM Placement & Synergies
Place this at the start of a campaign or descent, before the party enters the dungeon proper. It consumes the table's decision about who plays which archetype and feeds the dungeon module it points to, since the dungeon is where the choice is tested. The Witch's supply is a natural early stop for any Sorcerer. An arrival goes well when each player picks a role with intent and prepares for it. It goes badly when roles are chosen carelessly, or when supplies are neglected and the hero meets the depths unready.

### 5D Sensory Pentagon
- **Physical environment:** Labyrinthine dungeons and cavernous grottos carved deep in the earth near Tristram.
- **Behaviors:** The player guides one chosen character downward, and a Sorcerer is advised to check the Witch's supply before other purchases.
- **Relationships:** Each hero is distinct, and the Sorcerer in particular depends on the Witch's stock to prepare.
- **Attitudes:** Choosing a hero is a commitment that sets how the descent will feel.
- **Values:** Preparation suited to one's chosen role, and trust in a specialist supplier.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Tristram):** The town above is the stable base from which delvers set out and to which they should be able to return. *Leverage:* Supplies, shelter and the Witch's stock that the Sorcerer relies on. *Blind spot:* It can only support delvers, not descend and fight for them.
* **Main opponent (The Dungeons Beneath Tristram):** The labyrinth tests each hero differently and gives no quarter to any role. *Leverage:* Winding passages and grottos that punish unsuited preparation. *Blind spot:* It cannot stop a hero whose role is well matched to the challenge.
* **Thematic shadow (The Rival Hero (another archetype in the same descent)):** My chosen path is the right one, and the others are lesser versions of it. *Leverage:* A distinct set of strengths that complements or competes with the party. *Blind spot:* A single archetype alone cannot answer every problem the depths present.
* **Tertiary outcast (The Witch):** Magic must be stocked before it is needed, and a Sorcerer who forgets will pay for it. *Leverage:* Control over the supply that a Sorcerer must check first. *Blind spot:* Her usefulness is narrow, since non-casters need little from her.

### Output Dial
- **Level 1:** The chosen hero fits the early dungeon well, and the player enjoys the sense of a role well played.
- **Level 2:** The hero's limits start to show: some obstacles favor the Rogue, the Warrior or the Sorcerer, and the player must lean on strengths and cover weaknesses.
- **Level 3:** The hero is poorly matched to the depths ahead, supplies are mis-prioritized and the player feels the cost of a hasty choice.
- **Level 4:** The chosen path collapses: the Sorcerer is caught without the Witch's stock, or a hero faces a threat that their role simply cannot answer, and the expedition faces ruin.

### Threat Clocks
- **Unsuited Preparation [4 Ticks]:** advances when A hero descends without purchases fitting their role, such as a Sorcerer who skips the Witch's supply.
- **Role Overreach [6 Ticks]:** advances when A hero is pushed into situations that their archetype handles poorly, and no ally or resource covers the gap.

### Yields
A well-matched hero with fitting supplies, and the player's understanding of what each archetype does best.

### Related Modules
- `MOD_DIABLO_SIT_DUNGEON`

### Standalone Fallback
Run it as a character-choice opening. Offer the table three distinct delver archetypes (the Rogue, the Warrior and the Sorcerer), let each player claim one, and send them into a single labyrinthine descent where their differences shape every problem.
