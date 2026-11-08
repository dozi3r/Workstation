---
id: "MOD_JTTW_SIT_BORROWED_HUSBAND"
title: "The Borrowed Husband"
kind: "situation"
ip: "JTTW"
set: "Journey to the West: Flaming Mountains"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Climax: Domestic Showdown"]
requires: ["Lore: The Husband's Habits"]
culture_quadrant: "Market"
hub_eligibility: "candidate"
summary: "A demon king with two homes, two wives and one treasure that only the first wife holds; whoever impersonates him wins it."
standalone_fallback: "Use as a two-household love triangle where the husband's absence is the weakness and a disguise unlocks the first wife's secret."
injected_mechanics:
  output_dial:
    level_1: "The husband visits both wives and the gossip stays quiet."
    level_2: "A false husband appears and a treasure moves."
    level_3: "The real husband finds the mount gone and races home."
    level_4: "One wife is dead and the other is in tears; the fan is the only thing left."
  threat_clocks:
    - name: "Rakshasi's Grudge"
      ticks: 6
      advances_when: "An insult to Rakshasi, an impersonation of her husband, or a refusal to bring Red Boy."
    - name: "The Bull King's Pursuit"
      ticks: 6
      advances_when: "An hour passes with the fan outside the party's hands."
  yields_resource: "Climax: A true fan and a husband in pursuit"
linked_entity: "N_CLOUD_TOUCHING_CAVE"
related: ["MOD_JTTW_FAC_HOARD_THUNDER_COURT", "MOD_JTTW_FAC_PALM_LEAF_HOUSEHOLD"]
---

# MODULE MOD_JTTW_SIT_BORROWED_HUSBAND: The Borrowed Husband

A demon king with two homes, two wives and one treasure that only the first wife holds; whoever impersonates him wins it.

### Dramatic Premise
Divided loyalty invites imitation; imitation invites betrayal; betrayal makes a lord lose more than a fan.

### Core Premise
Wukong plays a husband, Rakshasi gets drunk, the real husband returns and changes shape to take it back.

### GM Placement & Synergies
Best placed after the first duel: the party now has a plan, the Bull King's mount and a reason to hurry.

### 5D Sensory Pentagon
- **Sight:** A library of elixir books; bolts of silk and jewels sent to the first wife.
- **Sound:** Weeping and shouting.
- **Smell:** Wine and orchid.
- **Touch:** Hands held under a table.
- **Taste:** Home brew from a shared cup.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Bull King):** A hero keeps both houses. *Leverage:* Strength. *Blind spot:* Vain; sloppy about weapons and mounts.
* **Main opponent (Wukong):** Borrow now, return later. *Leverage:* Disguise. *Blind spot:* Forgets the shrink formula.
* **Thematic shadow (Rakshasi):** A wife manages; a husband provides. *Leverage:* The fan. *Blind spot:* Drink.
* **Tertiary outcast (Jade Countenance):** She bought protection and wants it kept. *Leverage:* A fortune. *Blind spot:* No kin.

### Output Dial
- **Level 1:** The husband visits both wives and the gossip stays quiet.
- **Level 2:** A false husband appears and a treasure moves.
- **Level 3:** The real husband finds the mount gone and races home.
- **Level 4:** One wife is dead and the other is in tears; the fan is the only thing left.

### Threat Clocks
- **Rakshasi's Grudge [6 Ticks]:** advances when An insult to Rakshasi, an impersonation of her husband, or a refusal to bring Red Boy.
- **The Bull King's Pursuit [6 Ticks]:** advances when An hour passes with the fan outside the party's hands.

### Yields
Climax: A true fan and a husband in pursuit

### Related Modules
- `MOD_JTTW_FAC_HOARD_THUNDER_COURT`
- `MOD_JTTW_FAC_PALM_LEAF_HOUSEHOLD`

### Standalone Fallback
Use as a two-household love triangle where the husband's absence is the weakness and a disguise unlocks the first wife's secret.
