---
id: "MOD_DIABLO_SIT_DIABLO_MONSTER_TEMPLATES"
title: "Diablo's Monster Templates"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 1 (Macro Network & Governance)"
pipeline_tier: 1
provides: ["Lore: Monster-Taxonomy", "Ecology: Template-Variation-Rules"]
requires: ["Lore: Bestiary-Knowledge"]
tarot_affinity: ["The Hierophant", "The Magician"]
culture_quadrant: "Hierarchy"
operational_profile: "Design"
mtg_color: "Colorless"
hub_eligibility: "candidate"
summary: "The many monsters of the dungeon derive from a few general templates, the Undead, the Demons and the Animals. Added magical immunities or a distance attack modify each, so a new foe can be read as a variation on a known one."
standalone_fallback: "Use it as a GM design tool. Pick a base template (Undead, Demon or Animal), add one twist such as a magical immunity or a ranged attack, and present the result as a new monster that veterans can half-recognize."
injected_mechanics:
  output_dial:
    level_1: "The party recognizes the template and handles the variant with little trouble."
    level_2: "A familiar monster arrives with an unexpected twist, and the party must adjust its approach."
    level_3: "Several variants with different immunities or ranged attacks arrive together, and the party's habits fail it."
    level_4: "The party's assumptions about the template are badly wrong, and an unrecognized immunity leaves it without an answer."
  threat_clocks:
    - name: "Assumptions Fail"
      ticks: 4
      advances_when: "The party treats a variant as its base template and ignores the added immunity or distance attack."
  yields_resource: "A working taxonomy the party can use to predict and counter new monsters, and a GM shorthand for building them."
---

# MODULE MOD_DIABLO_SIT_DIABLO_MONSTER_TEMPLATES: Diablo's Monster Templates

The many monsters of the dungeon derive from a few general templates, the Undead, the Demons and the Animals. Added magical immunities or a distance attack modify each, so a new foe can be read as a variation on a known one.

### Dramatic Premise
A delver who trusts what they know about a monster type + a variant with a twist added = a lesson that must be partly relearned.

### Core Premise
The guide sorts the diverse monsters into three basic classes, the Undead, the Demons and the Animals. Many are derivations of a general type, given added magical immunities, a distance attack, or similar changes.

### GM Placement & Synergies
Use it as a framing device at the start of a delve or whenever a new monster is introduced. It consumes the party's bestiary knowledge and feeds the other monster modules, including early patterns and depth progression. An arrival goes well when the party learns the template and probes for the twist. It goes badly when it assumes the variant behaves exactly like its base.

### 5D Sensory Pentagon
- **Physical environment:** Dungeon halls and caverns populated by recognizable kinds of creature, each kind showing a family resemblance.
- **Behaviors:** Monsters behave according to their base type, with a twist added, such as a distance attack.
- **Relationships:** Many monsters are derivations of a general type, so variants are kin to their base template.
- **Attitudes:** Diverse on the surface, but a delver who knows the template can anticipate the foe.
- **Values:** Pattern recognition. Knowing the template is half of knowing the monster.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Undead):** The oldest and most orderly template, risen dead in ranks. *Leverage:* Numerous variants built on one base. *Blind spot:* Predictable once the template is understood.
* **Main opponent (The Demons):** A template of infernal predators who form the core threat. *Leverage:* Added magical immunities and distance attacks make variants dangerous. *Blind spot:* Reliance on the twist leaves them exposed once it is identified.
* **Thematic shadow (The Animals):** Natural beasts that follow instinct and are still modified by the dungeon. *Leverage:* Simple, direct threats that are easy to underestimate. *Blind spot:* Lack the sophistication of the other templates.
* **Tertiary outcast (The unclassified variants):** Monsters whose added immunities or distance attacks blur the template they came from. *Leverage:* Surprise, because they break expectations about their base type. *Blind spot:* They are still derivations, so the base template reveals their weakness.

### Output Dial
- **Level 1:** The party recognizes the template and handles the variant with little trouble.
- **Level 2:** A familiar monster arrives with an unexpected twist, and the party must adjust its approach.
- **Level 3:** Several variants with different immunities or ranged attacks arrive together, and the party's habits fail it.
- **Level 4:** The party's assumptions about the template are badly wrong, and an unrecognized immunity leaves it without an answer.

### Threat Clocks
- **Assumptions Fail [4 Ticks]:** advances when The party treats a variant as its base template and ignores the added immunity or distance attack.

### Yields
A working taxonomy the party can use to predict and counter new monsters, and a GM shorthand for building them.

### Standalone Fallback
Use it as a GM design tool. Pick a base template (Undead, Demon or Animal), add one twist such as a magical immunity or a ranged attack, and present the result as a new monster that veterans can half-recognize.
