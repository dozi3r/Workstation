---
id: "MOD_DIABLO_SIT_PROCEDURAL_DUNGEONS_AND_FIXED_GEOGRAPHY"
title: "Procedural Dungeons and Fixed Geography"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Constant-Town-Anchor", "Defense: Direct-Route-Home", "Ecology: Shifting-Underground-Layout"]
requires: ["Authority: Table-Consent-To-Improvise", "Lore: Dungeon-Descent-Setting"]
tarot_affinity: ["The Hermit", "The Tower", "The Star"]
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: ["White", "Green"]
hub_eligibility: "always"
summary: "The dungeons and caves generate randomly while Tristram's geography remains constant."
standalone_fallback: "Run it as a base-and-descent scenario. Fix Tristram as a map the party can trust, generate each underground level fresh as they enter it, and let them use the direct avenues back to the town whenever they need to recover."
injected_mechanics:
  output_dial:
    level_1: "The party moves easily between the constant town and a fresh level, and treats the random layout as a pleasant puzzle."
    level_2: "Unfamiliar passages slow the party, and they lean on the town as a reliable place to regroup and resupply."
    level_3: "The party is deep, the layout is unfamiliar and prior notes are useless, so they must find a direct avenue back before their resources fail."
    level_4: "The party is lost in a level that matches nothing they know, cut off from supplies and uncertain how to reach the way home."
  threat_clocks:
    - name: "Lost Below"
      ticks: 6
      advances_when: "The party presses deeper without noting the direct avenues back to Tristram, or relies on a guide's route that no longer holds."
    - name: "False Certainty"
      ticks: 4
      advances_when: "A player insists a fail-safe solution exists and acts on it despite the layout having changed."
  yields_resource: "A dependable anchor in Tristram, knowledge of the direct avenues home, and the party's growing skill at reading unfamiliar ground."
---

# MODULE MOD_DIABLO_SIT_PROCEDURAL_DUNGEONS_AND_FIXED_GEOGRAPHY: Procedural Dungeons and Fixed Geography

The dungeons and caves generate randomly while Tristram's geography remains constant.

### Dramatic Premise
Delvers who want a reliable plan + an underworld that never repeats itself = they must rely on one constant place and their own judgement below.

### Core Premise
The dungeons and caves beneath the earth generate randomly, yet Tristram's geography remains constant. Because of the randomness, no guide can offer fail-safe solutions and no single best route through the game exists. Direct avenues exist even from deep underground back to Tristram. Use this pairing of fixed surface and shifting depths to give the party both uncertainty and a way home.

### GM Placement & Synergies
Place this as the structural backbone of a campaign: Tristram is the stable hub, and every descent branches from it. It consumes the party's wish for certainty and feeds modules about the dungeon, the heroes and the reshuffling world, since all of them benefit from a fixed point of return. An arrival goes well when the party respects the constant town and uses the direct avenues to recover. It goes badly when they trust an old route, or forget that a way back exists, and spend their strength wandering.

### 5D Sensory Pentagon
- **Physical environment:** Dungeons and caves beneath the earth that generate randomly, set against a town whose geography remains constant.
- **Behaviors:** Delvers push downward without a fail-safe guide, then use direct avenues even from deep underground back to Tristram.
- **Relationships:** The town is the fixed point to which every random descent is tied.
- **Attitudes:** No one claims a single best route, and no guide offers fail-safe solutions.
- **Values:** Judgement over formula, with a dependable home to return to.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Tristram):** A fixed home gives meaning to every uncertain journey out of it. *Leverage:* Its constant geography and the direct avenues leading back to it. *Blind spot:* It cannot predict or control what the dungeons below will become.
* **Main opponent (The Randomized Depths):** No path is repeated, so no path can be relied on. *Leverage:* Layouts that change and thereby defeat any memorized solution. *Blind spot:* They are bounded by the fixed ground above and by the routes that lead back to it.
* **Thematic shadow (The Route-Planner (a delver who seeks the single best way)):** With enough study, a perfect route through the game must exist. *Leverage:* Experience and confidence that make familiar stretches efficient. *Blind spot:* The randomness defeats the idea that any one best route exists.
* **Tertiary outcast (The Stranded Delver (a hero lost far underground)):** Home is far away, and the way back may not be obvious. *Leverage:* First-hand knowledge of how deep the dungeon goes and what it costs. *Blind spot:* Overlooking the direct avenues that lead back to Tristram.

### Output Dial
- **Level 1:** The party moves easily between the constant town and a fresh level, and treats the random layout as a pleasant puzzle.
- **Level 2:** Unfamiliar passages slow the party, and they lean on the town as a reliable place to regroup and resupply.
- **Level 3:** The party is deep, the layout is unfamiliar and prior notes are useless, so they must find a direct avenue back before their resources fail.
- **Level 4:** The party is lost in a level that matches nothing they know, cut off from supplies and uncertain how to reach the way home.

### Threat Clocks
- **Lost Below [6 Ticks]:** advances when The party presses deeper without noting the direct avenues back to Tristram, or relies on a guide's route that no longer holds.
- **False Certainty [4 Ticks]:** advances when A player insists a fail-safe solution exists and acts on it despite the layout having changed.

### Yields
A dependable anchor in Tristram, knowledge of the direct avenues home, and the party's growing skill at reading unfamiliar ground.

### Standalone Fallback
Run it as a base-and-descent scenario. Fix Tristram as a map the party can trust, generate each underground level fresh as they enter it, and let them use the direct avenues back to the town whenever they need to recover.
