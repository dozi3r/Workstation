---
id: "MOD_JTTW_SIT_MOUNTAIN_OF_FLAMES"
title: "The Mountain of Flames"
kind: "situation"
ip: "JTTW"
set: "Journey to the West: Flaming Mountains"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Fire Barrier"]
requires: ["Water: A Fan's Rain"]
culture_quadrant: "Hierarchy"
hub_eligibility: "never"
summary: "Eight hundred li of flame across the only road west; a bronze skull would melt."
standalone_fallback: "Use as a fire-wall barrier on a road: scorching ground, no grass for miles, and a counter that must be fetched from two or three powers."
injected_mechanics:
  output_dial:
    level_1: "The camp is hot but safe."
    level_2: "Boots scorch and the horse refuses."
    level_3: "The fire climbs; the camp must retreat."
    level_4: "The fire fills the road; only a god's decree opens it."
  threat_clocks:
    - name: "The Mountain's Heat"
      ticks: 8
      advances_when: "The party fans with the false fan, enters unprotected or idles at camp."
  yields_resource: "Ecology: A passable road once the fire is quenched forty-nine times"
linked_entity: "N_FLAMING_MOUNTAIN"
related: ["MOD_JTTW_ABI_PALM_LEAF_FAN", "MOD_JTTW_FAC_PILGRIM_PARTY"]
---

# MODULE MOD_JTTW_SIT_MOUNTAIN_OF_FLAMES: The Mountain of Flames

Eight hundred li of flame across the only road west; a bronze skull would melt.

### Dramatic Premise
A cosmic accident created the barrier; the barrier forces the journey to ask the powers it avoided.

### Core Premise
A burning wall born from kicked-over brazier bricks; the fan is the only tool, the false fan makes it worse.

### GM Placement & Synergies
The central obstacle. It links to the Fire's Return and Heat clocks and the Palm-Leaf Fan ability.

### 5D Sensory Pentagon
- **Sight:** Eight hundred li of flame; red sky.
- **Sound:** Roar and crackle.
- **Smell:** Scorched earth.
- **Touch:** Boot soles hot, hair frizzing.
- **Taste:** Ash and dry heat.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Laozi's Brazier (origin)):** Order is a furnace. *Leverage:* The mountain's exile office. *Blind spot:* A careless attendant.
* **Main opponent (The Flames):** Fire grows when fanned by the false. *Leverage:* A hundredfold in one wave. *Blind spot:* Quenched by the true fan.
* **Thematic shadow (Sha Monk's Dilemma):** Where there are scriptures there is fire. *Leverage:* Truth. *Blind spot:* No solution offered.
* **Tertiary outcast (The Local Spirit):** Serve and wait for a pardon. *Leverage:* Ghost soldiers. *Blind spot:* Cannot leave.

### Output Dial
- **Level 1:** The camp is hot but safe.
- **Level 2:** Boots scorch and the horse refuses.
- **Level 3:** The fire climbs; the camp must retreat.
- **Level 4:** The fire fills the road; only a god's decree opens it.

### Threat Clocks
- **The Mountain's Heat [8 Ticks]:** advances when The party fans with the false fan, enters unprotected or idles at camp.

### Yields
Ecology: A passable road once the fire is quenched forty-nine times

### Related Modules
- `MOD_JTTW_ABI_PALM_LEAF_FAN`
- `MOD_JTTW_FAC_PILGRIM_PARTY`

### Standalone Fallback
Use as a fire-wall barrier on a road: scorching ground, no grass for miles, and a counter that must be fetched from two or three powers.
