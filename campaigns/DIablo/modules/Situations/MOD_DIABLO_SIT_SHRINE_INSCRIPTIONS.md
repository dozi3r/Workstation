---
id: "MOD_DIABLO_SIT_SHRINE_INSCRIPTIONS"
title: "Shrine Inscriptions"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 5 (Esoteric & Eschatological Engines)"
pipeline_tier: 5
provides: ["Lore: Shrine-Riddle-Hints", "Lore: Boon-Bargain-Warnings"]
requires: ["Lore: Shrine-Site"]
tarot_affinity: ["The Hermit", "The High Priestess", "The Wheel of Fortune"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "Blue"
hub_eligibility: "never"
summary: "Every shrine speaks a riddling message that hints at what it will do, and the table supplies the translation. Some messages split between 'You' and 'Others', showing who the shrine's effect lands on."
standalone_fallback: "Run it as a one-shot puzzle at a single shrine. The GM reads the inscription aloud, the players argue over what it means and who it affects, and then someone commits to touching it. The GM reveals the true effect, with a boon and a cost that match the riddle."
injected_mechanics:
  output_dial:
    level_1: "The shrine's message is a mild curiosity, and the effect is a small, welcome boon that matches a plain reading."
    level_2: "The message hints at a real tradeoff, and the effect gives something useful while taking something in return."
    level_3: "The message hides a harsh bargain, and a misreading leaves the party weakened at a bad moment."
    level_4: "A mistaken reading ruins a character or splits the party, and the shrine's cost cannot be undone."
  threat_clocks:
    - name: "The Gamble Closes In"
      ticks: 4
      advances_when: "The party debates in the open while threats gather, a shrine is touched without discussion, or a riddle is misread."
  yields_resource: "A boon of strength, insight or fortune, and a clearer grasp of how the world's shrines trade power for cost."
---

# MODULE MOD_DIABLO_SIT_SHRINE_INSCRIPTIONS: Shrine Inscriptions

Every shrine speaks a riddling message that hints at what it will do, and the table supplies the translation. Some messages split between 'You' and 'Others', showing who the shrine's effect lands on.

### Dramatic Premise
Characters who gamble on cryptic promises + a shrine that tells the truth only in riddles = power won or lost by how well the table reads it

### Core Premise
Each shrine speaks a riddle that hints at its effect, and the table provides the translation. Lines like 'New strength is forged through destruction', 'Those who defend seldom attack' and 'Some are weakened as one grows strong' point to a tradeoff. Messages that split between 'You' and 'Others' show who the effect targets. Players decide how much to trust the hint before they commit.

### GM Placement & Synergies
Place a shrine in a quiet pause between fights, or at a decision point where a party under pressure might gamble. It feeds on any location that can host a shrine and gives back a boon or a cost for the next scene. An arrival goes well when the GM keeps the riddle clear enough to read, the cost matches the wording, and the party's discussion matters. It goes badly if the riddle is arbitrary, the effect contradicts the words, or one player decides for everyone.

### 5D Sensory Pentagon
- **Physical environment:** A lone shrine in a dim, hostile place, its message spoken or etched where adventurers cannot miss it.
- **Behaviors:** Travelers stop, repeat the line aloud, argue over its meaning, and hesitate before touching the shrine.
- **Relationships:** Some messages address 'You' and 'Others' separately, so a shrine can favor the one who touches it or the companions beside them.
- **Attitudes:** Suspicion and temptation. Every line sounds like wisdom and also like a trap.
- **Values:** Strength forged through destruction, wisdom traded for power, and the idea that nothing is gained without a price.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The shrine's voice):** Truth is offered freely, but only to those who can read it. *Leverage:* It always tells the truth in some form, so careful readers can profit. *Blind spot:* Its riddles are ambiguous, and the same words can support opposite readings.
* **Main opponent (The reckless toucher):** Power is for whoever grabs it first. *Leverage:* Speed and nerve; they act while others are still debating. *Blind spot:* They ignore the warning in the words and pay for it.
* **Thematic shadow (The over-reader):** Every phrase hides a precise instruction, and a clever enough mind can decode it. *Leverage:* Patient analysis can spot real tradeoffs. *Blind spot:* They invent meaning and miss the plain one, such as 'Wherever you go, there you are'.
* **Tertiary outcast (The companion left out):** Boons meant for 'Others' should not depend on a leader's gamble. *Leverage:* They can refuse to follow, or demand a say before anyone touches the shrine. *Blind spot:* They have no way to check a riddle, so they rely on trust.

### Output Dial
- **Level 1:** The shrine's message is a mild curiosity, and the effect is a small, welcome boon that matches a plain reading.
- **Level 2:** The message hints at a real tradeoff, and the effect gives something useful while taking something in return.
- **Level 3:** The message hides a harsh bargain, and a misreading leaves the party weakened at a bad moment.
- **Level 4:** A mistaken reading ruins a character or splits the party, and the shrine's cost cannot be undone.

### Threat Clocks
- **The Gamble Closes In [4 Ticks]:** advances when The party debates in the open while threats gather, a shrine is touched without discussion, or a riddle is misread.

### Yields
A boon of strength, insight or fortune, and a clearer grasp of how the world's shrines trade power for cost.

### Standalone Fallback
Run it as a one-shot puzzle at a single shrine. The GM reads the inscription aloud, the players argue over what it means and who it affects, and then someone commits to touching it. The GM reveals the true effect, with a boon and a cost that match the riddle.
