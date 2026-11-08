---
id: "MOD_JTTW_SIT_FAN_RAIN_GRAIN_CHAIN"
title: "The Fan-Rain Grain Chain"
kind: "situation"
ip: "JTTW"
set: "Journey to the West: Flaming Mountains"
tier: "Tier 3 (Infrastructural Supply Chains)"
pipeline_tier: 3
provides: ["Material: Rice Flour and Millet"]
requires: ["Water: Rain From a Fan", "Authority: A Keeper's Audience"]
culture_quadrant: "Clan"
hub_eligibility: "never"
summary: "One treasure sets the fire, the rain, the harvest and the pudding cart; break the chain at the top and everything downstream goes quiet."
standalone_fallback: "Use as a supply chain with a single upstream owner: weather, grain, food, trade; stop the owner and everyone downstream suffers."
injected_mechanics:
  output_dial:
    level_1: "Rain comes yearly; the chain holds."
    level_2: "Rain comes late; puddings cost double."
    level_3: "One wave, one harvest, then fire again."
    level_4: "Forty-nine waves; a permanent harvest but no keeper."
  threat_clocks:
    - name: "The Fire's Return"
      ticks: 8
      advances_when: "A harvest month passes after the last wave."
  yields_resource: "Material: Rice Flour and Millet (via a quenched fire and a returned fan)"
linked_entity: "N_RED_BRICK_VILLAGE"
related: ["MOD_JTTW_ABI_PALM_LEAF_FAN", "MOD_JTTW_SIT_DECENNIAL_TRIBUTE"]
---

# MODULE MOD_JTTW_SIT_FAN_RAIN_GRAIN_CHAIN: The Fan-Rain Grain Chain

One treasure sets the fire, the rain, the harvest and the pudding cart; break the chain at the top and everything downstream goes quiet.

### Dramatic Premise
A single owner of the key resource shapes every price and every season downstream.

### Core Premise
Fire out, breeze, rain; then sowing, reaping, flour, puddings. The villagers call it a yearly harvest; the text leaves the real cadence open.

### GM Placement & Synergies
Use it when the PCs consider keeping the fan: it shows what the region loses.

### 5D Sensory Pentagon
- **Sight:** Green on a burnt field after rain; red roofs.
- **Sound:** Rain on hot tile.
- **Smell:** Wet ash then rice steam.
- **Touch:** Warm cakes.
- **Taste:** Rice pudding.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Rakshasi):** The fan is not lent lightly. *Leverage:* Sole owner. *Blind spot:* Lonely and drunk.
* **Main opponent (The Bull King):** He can shrink what he is not given. *Leverage:* Knows the shrink formula. *Blind spot:* Torn between two wives.
* **Thematic shadow (Wukong with the False Fan):** Borrowing is not owning. *Leverage:* Trickery. *Blind spot:* Forgets to ask the whole procedure.
* **Tertiary outcast (The Peddler):** Rain is rice. *Leverage:* Local trade. *Blind spot:* Powerless.

### Output Dial
- **Level 1:** Rain comes yearly; the chain holds.
- **Level 2:** Rain comes late; puddings cost double.
- **Level 3:** One wave, one harvest, then fire again.
- **Level 4:** Forty-nine waves; a permanent harvest but no keeper.

### Threat Clocks
- **The Fire's Return [8 Ticks]:** advances when A harvest month passes after the last wave.

### Yields
Material: Rice Flour and Millet (via a quenched fire and a returned fan)

### Related Modules
- `MOD_JTTW_ABI_PALM_LEAF_FAN`
- `MOD_JTTW_SIT_DECENNIAL_TRIBUTE`

### Standalone Fallback
Use as a supply chain with a single upstream owner: weather, grain, food, trade; stop the owner and everyone downstream suffers.
