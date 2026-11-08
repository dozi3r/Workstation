---
id: "MOD_JTTW_SIT_DECENNIAL_TRIBUTE"
title: "The Decennial Tribute Compact"
kind: "situation"
ip: "JTTW"
set: "Journey to the West: Flaming Mountains"
tier: "Tier 1 (Macro Network & Governance)"
pipeline_tier: 1
provides: ["Authority: Ritual Compact"]
requires: ["Material: Tribute Goods", "Labor: Month-Long Pilgrimage"]
culture_quadrant: "Clan"
hub_eligibility: "candidate"
summary: "A farming region pays a distant keeper once a decade for rain, and nobody remembers who set the price."
standalone_fallback: "Use as a village's ritual dependence on a hidden benefactor: the gift list is fixed, the benefactor never appears, and any stranger who offers a shortcut disturbs the compact."
injected_mechanics:
  output_dial:
    level_1: "The compact holds; the pilgrims are a curiosity."
    level_2: "The households ask the pilgrims to carry a gift to the keeper."
    level_3: "The households blame the pilgrims for provoking the keeper."
    level_4: "The compact breaks; the villagers march on Jade Cloud Mountain."
  threat_clocks:
    - name: "The Fire's Return"
      ticks: 8
      advances_when: "A harvest month passes after a one-wave quench or the fan is withheld."
  yields_resource: "Authority: Ritual Compact (rain rights and the right to ask for an audience)"
linked_entity: "N_RED_BRICK_VILLAGE"
related: ["MOD_JTTW_FAC_FLAME_HOUSEHOLDS", "MOD_JTTW_SIT_FAN_RAIN_GRAIN_CHAIN"]
---

# MODULE MOD_JTTW_SIT_DECENNIAL_TRIBUTE: The Decennial Tribute Compact

A farming region pays a distant keeper once a decade for rain, and nobody remembers who set the price.

### Dramatic Premise
Dependence on a hidden power leads to ritual; ritual leads to resentment; resentment leads to a bargain with an outsider.

### Core Premise
Every ten years, households bathe, load hogs, sheep, flowers, fruit, fowl and wine, and walk a month to beg an immortal for rain.

### GM Placement & Synergies
Start here: it explains the fan, the fire and the cost of both. It pairs with the Fan-Rain Grain Chain and the Fire's Return clock.

### 5D Sensory Pentagon
- **Sight:** Red tile, red brick, red benches, hot dust.
- **Sound:** Cart bells of the pudding peddler; chanted tribute lists.
- **Smell:** Hot rice, wine, scorched clay.
- **Touch:** Boiling puddings; stone benches too hot to sit on.
- **Taste:** Millet cake, tea, wine for the gift.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Old Householder):** The compact works if everyone follows it. *Leverage:* He controls hospitality and local lore. *Blind spot:* He has never seen the fan's keeper.
* **Main opponent (The Fire):** Nothing grows here; it is natural. *Leverage:* The whole region. *Blind spot:* A fan can quench it.
* **Thematic shadow (The Peddler):** Sell now; ask later. *Leverage:* Knows the flour source. *Blind spot:* Depends on the same rain.
* **Tertiary outcast (The Local Spirit):** The fire is his punishment and his duty. *Leverage:* Knows the origin. *Blind spot:* In exile, needs a pardon.

### Output Dial
- **Level 1:** The compact holds; the pilgrims are a curiosity.
- **Level 2:** The households ask the pilgrims to carry a gift to the keeper.
- **Level 3:** The households blame the pilgrims for provoking the keeper.
- **Level 4:** The compact breaks; the villagers march on Jade Cloud Mountain.

### Threat Clocks
- **The Fire's Return [8 Ticks]:** advances when A harvest month passes after a one-wave quench or the fan is withheld.

### Yields
Authority: Ritual Compact (rain rights and the right to ask for an audience)

### Related Modules
- `MOD_JTTW_FAC_FLAME_HOUSEHOLDS`
- `MOD_JTTW_SIT_FAN_RAIN_GRAIN_CHAIN`

### Standalone Fallback
Use as a village's ritual dependence on a hidden benefactor: the gift list is fixed, the benefactor never appears, and any stranger who offers a shortcut disturbs the compact.
