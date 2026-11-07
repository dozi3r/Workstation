---
id: "MOD_DIABLO_SIT_CAVES"
title: "Caves"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Authority: Surface-Access", "Lore: Cave-Entrance"]
requires: ["Defense: Dungeon-Descent-Progress"]
tarot_affinity: ["The Fool", "Judgement"]
culture_quadrant: "Adhocracy"
operational_profile: "Deliver"
mtg_color: "Green"
hub_eligibility: "candidate"
summary: "An area reached by descending the dungeon. Arriving here opens another entrance to the surface, giving the party a new way out and back."
standalone_fallback: "Run it as a cavern region that the party has pushed deep enough to reach, where discovering a second route to the surface changes how they resupply, retreat and plan."
injected_mechanics:
  output_dial:
    level_1: "The party reaches the caves and finds the new exit, an easy chance to resupply and return."
    level_2: "The new route helps, but the party must decide whether to use it or keep descending."
    level_3: "The new entrance exposes the route to threats, so going up or down both carry risk."
    level_4: "The second entrance proves a trap or a conduit, and the route to safety is cut off just when the party needs it most."
  threat_clocks:
    - name: "Route Compromised"
      ticks: 6
      advances_when: "The party leaves the new entrance unattended or draws pursuers toward it."
  yields_resource: "A second entrance to the surface, shortening retreat and resupply."
linked_entity: "N_CAVES"
---

# MODULE MOD_DIABLO_SIT_CAVES: Caves

An area reached by descending the dungeon. Arriving here opens another entrance to the surface, giving the party a new way out and back.

### Dramatic Premise
A delver committed to going deeper + a new exit opening at the caves = a choice between retreating to safety and descending further.

### Core Premise
Reaching the caves opens another entrance to the surface. The place is a waypoint and a decision, a moment when the party can step back toward the world above or press deeper.

### GM Placement & Synergies
Place it as a midpoint of a descent, where the party has earned a breather. It consumes the party's progress and feeds their options for retreat, resupply and pacing. It connects directly to the surface. It pairs well with hazards found within cave-like levels. An arrival goes well when the party uses the exit wisely to recover and return stronger. It goes badly when the party assumes the route is safe, or when the new entrance lets danger travel the other way. The card says nothing about what lies inside the caves, so inhabitants and hazards are the GM's addition.

### 5D Sensory Pentagon
- **Physical environment:** A cavernous area deep in the dungeon, with another entrance leading up to the surface.
- **Behaviors:** Delvers weigh whether to return to the surface or continue onward.
- **Relationships:** The caves connect the dungeon to the surface world above.
- **Attitudes:** Relief at a second way out, tempered by what lies deeper.
- **Values:** Access, retreat and the freedom to choose when to go on.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Those who hold the surface):** The way back must stay open and orderly. *Leverage:* Supplies and refuge at the surface end of the route. *Blind spot:* They are distant from the danger below.
* **Main opponent (Whatever dwells in the caves):** The caves are its territory, and a new entrance changes nothing for it. *Leverage:* Knows the terrain and can threaten the route. *Blind spot:* Bound to the place.
* **Thematic shadow (A delver who never goes back up):** The surface is behind them and only descent matters. *Leverage:* Shows the cost of ignoring the exit. *Blind spot:* Exhaustion and isolation.
* **Tertiary outcast (A scavenger using the new entrance):** Every opening is an opportunity. *Leverage:* Knows who comes and goes. *Blind spot:* Unreliable and exposed.

### Output Dial
- **Level 1:** The party reaches the caves and finds the new exit, an easy chance to resupply and return.
- **Level 2:** The new route helps, but the party must decide whether to use it or keep descending.
- **Level 3:** The new entrance exposes the route to threats, so going up or down both carry risk.
- **Level 4:** The second entrance proves a trap or a conduit, and the route to safety is cut off just when the party needs it most.

### Threat Clocks
- **Route Compromised [6 Ticks]:** advances when The party leaves the new entrance unattended or draws pursuers toward it.

### Yields
A second entrance to the surface, shortening retreat and resupply.

### Standalone Fallback
Run it as a cavern region that the party has pushed deep enough to reach, where discovering a second route to the surface changes how they resupply, retreat and plan.
