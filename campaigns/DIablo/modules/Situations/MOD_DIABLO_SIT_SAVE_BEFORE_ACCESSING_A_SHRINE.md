---
id: "MOD_DIABLO_SIT_SAVE_BEFORE_ACCESSING_A_SHRINE"
title: "Save Before Accessing a Shrine"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Lore: Shrine-Effect-Foreknowledge", "Authority: Informed-Choice"]
requires: ["Ecology: Dungeon-Setting"]
tarot_affinity: ["The Hermit", "The Magician", "Justice"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "Blue"
hub_eligibility: "never"
summary: "A shrine in the dungeon offers an unknown boon or burden, and the wise delegate pauses to weigh it before committing."
standalone_fallback: "Run it as a one-shot: the party finds a lone shrine in a dark chamber. Before anyone touches it, let them take a moment to consider, scout, and debate. Then reveal its effect and let them live with the consequences."
injected_mechanics:
  output_dial:
    level_1: "The shrine's effect is mild or helpful and the party chooses calmly after discussion."
    level_2: "The effect is a real trade-off and the party argues over whether to accept it."
    level_3: "The effect is harmful or hampers the party, and they must press on with a lasting cost."
    level_4: "A rash choice binds the party to a ruinous effect with no way to reverse it, shaping the rest of the descent."
  threat_clocks:
    - name: "Commitment to the Unknown"
      ticks: 4
      advances_when: "The party rushes, ignores precautions, or touches the shrine without weighing its possible effects."
  yields_resource: "Foreknowledge and a deliberate choice: the party gains the shrine's effect on terms they chose with open eyes."
related: ["MOD_DIABLO_SIT_DUNGEON"]
---

# MODULE MOD_DIABLO_SIT_SAVE_BEFORE_ACCESSING_A_SHRINE: Save Before Accessing a Shrine

A shrine in the dungeon offers an unknown boon or burden, and the wise delegate pauses to weigh it before committing.

### Dramatic Premise
Cautious adventurers + a shrine whose effects are binding once touched = a tense decision made with incomplete knowledge.

### Core Premise
The guide advises doing one thing before accessing a shrine in the dungeon: prepare so the effects can be considered before committing. The situation dramatizes that pause and what follows from it.

### GM Placement & Synergies
Place it as a quiet chamber partway through a dungeon, ideally after a fight so the party feels vulnerable and tempted. It consumes the party's caution and feeds whatever the shrine grants or costs. It goes well when the party scouts, discusses, and chooses together; it goes badly when impatience commits them to an effect they did not weigh. Specific shrine effects are the GM's invention, as the card names none.

### 5D Sensory Pentagon
- **Physical environment:** A shrine set within the dungeon, quiet and waiting.
- **Behaviors:** Adventurers hesitate, weigh the choice, and prepare before they commit.
- **Relationships:** The guide's advice passes from experience to newcomer; the shrine is a silent counterpart.
- **Attitudes:** Prudence and wariness toward effects that cannot be undone.
- **Values:** Consider effects before committing to them.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The guide):** Preparation and foresight keep adventurers alive. *Leverage:* Accumulated experience and advice. *Blind spot:* Its counsel cannot remove the risk itself.
* **Main opponent (The shrine):** Its effects take hold once accessed, for good or ill. *Leverage:* Uncertainty and the lure of power. *Blind spot:* It is passive and only acts when touched.
* **Thematic shadow (The reckless delver):** Fortune favors those who grab it at once. *Leverage:* Speed and boldness. *Blind spot:* Bears the full cost of any bad outcome.
* **Tertiary outcast (A party member who refuses to touch any shrine):** Unknown power is never worth the price. *Leverage:* Can veto or delay the group. *Blind spot:* Forfeits benefits the others might gain.

### Output Dial
- **Level 1:** The shrine's effect is mild or helpful and the party chooses calmly after discussion.
- **Level 2:** The effect is a real trade-off and the party argues over whether to accept it.
- **Level 3:** The effect is harmful or hampers the party, and they must press on with a lasting cost.
- **Level 4:** A rash choice binds the party to a ruinous effect with no way to reverse it, shaping the rest of the descent.

### Threat Clocks
- **Commitment to the Unknown [4 Ticks]:** advances when The party rushes, ignores precautions, or touches the shrine without weighing its possible effects.

### Yields
Foreknowledge and a deliberate choice: the party gains the shrine's effect on terms they chose with open eyes.

### Related Modules
- `MOD_DIABLO_SIT_DUNGEON`

### Standalone Fallback
Run it as a one-shot: the party finds a lone shrine in a dark chamber. Before anyone touches it, let them take a moment to consider, scout, and debate. Then reveal its effect and let them live with the consequences.
