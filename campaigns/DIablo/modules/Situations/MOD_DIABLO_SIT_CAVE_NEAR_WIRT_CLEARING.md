---
id: "MOD_DIABLO_SIT_CAVE_NEAR_WIRT_CLEARING"
title: "Cave near Wirt's Clearing"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Defense: Safe-Retreat-Route", "Lore: Cave-Threshold"]
requires: ["Authority: Town-Sanctuary", "Ecology: Deep-Dungeon-Descent"]
tarot_affinity: ["The Hermit", "The Devil"]
culture_quadrant: "Market"
operational_profile: "Service"
mtg_color: "Black"
hub_eligibility: "candidate"
summary: "A cave near where Wirt stands in Tristram; the stairs from the ninth dungeon level lead up to it and back to town."
standalone_fallback: "Run it as a one-shot: after a punishing descent, the party climbs a stair into a cave beside a shady peddler's stand and must trade, recover and decide whether to go back down."
injected_mechanics:
  output_dial:
    level_1: "The stair delivers the party to the cave and a calm, if shady, chance to trade and rest."
    level_2: "The cave offers shelter but the party feels watched and bargains come at a cost."
    level_3: "Pursuers follow the party up, turning the cave into a desperate defense near the town's edge."
    level_4: "The cave becomes a breach that lets deep horrors spill toward Tristram while the party is spent."
  threat_clocks:
    - name: "Deep Pursuit"
      ticks: 6
      advances_when: "Delvers retreat while hunted, linger too long at the cave, or leave the stair unguarded."
  yields_resource: "A route back to town from deep in the dungeon, with access to trade and recovery."
linked_entity: "N_CAVE_NEAR_WIRT_CLEARING"
related: ["MOD_DIABLO_SIT_TRISTRAM"]
---

# MODULE MOD_DIABLO_SIT_CAVE_NEAR_WIRT_CLEARING: Cave near Wirt's Clearing

A cave near where Wirt stands in Tristram; the stairs from the ninth dungeon level lead up to it and back to town.

### Dramatic Premise
Delvers worn down by the deep + an exit that opens beside a shady dealer = a chance to recover that comes with a price.

### Core Premise
On the ninth level, the stairs to town lead to a cave near where Wirt stands. It is the deep delver's way home, and it opens right beside a figure who profits from the desperate.

### GM Placement & Synergies
Place it as the mid-to-late dungeon exit. It consumes the party's depleted resources and feeds Wirt-style trade scenes and tension about what the deep sends after them. An arrival goes well when the party emerges unpursued and bargains wisely. It goes badly when they are chased, drained of supplies, or pressed into a poor deal.

### 5D Sensory Pentagon
- **Physical environment:** A cave near the spot where Wirt stands in Tristram, reached by stairs from the ninth level.
- **Behaviors:** Battered delvers emerge from the stairs and head toward the town and its peddler.
- **Relationships:** The cave joins the deep dungeon to Tristram and sits close to Wirt.
- **Attitudes:** Relief, wariness and a hint of bargaining with whoever waits at the cave mouth.
- **Values:** Survival, trade and the cost of coming back from the deep.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Tristram):** The town needs its delvers alive and returning. *Leverage:* Rest, healing and goods at the top of the stairs. *Blind spot:* Cannot reach or control what happens in the deep cave.
* **Main opponent (The dungeon's denizens):** The deep levels belong to them, and the stair is a path out. *Leverage:* They can follow weakened delvers up the stairs. *Blind spot:* They are drawn into the cave where delvers can ambush them.
* **Thematic shadow (Wirt):** Everything has a price, including a safe return. *Leverage:* Stands right beside the way home and sells to those in need. *Blind spot:* His wares and motives are never fully trusted.
* **Tertiary outcast (A stranded deep-delver):** The stairs are the only hope, and no one above understands what the deep is. *Leverage:* Has seen what lies below the ninth level. *Blind spot:* Exhausted and desperate, easy to exploit.

### Output Dial
- **Level 1:** The stair delivers the party to the cave and a calm, if shady, chance to trade and rest.
- **Level 2:** The cave offers shelter but the party feels watched and bargains come at a cost.
- **Level 3:** Pursuers follow the party up, turning the cave into a desperate defense near the town's edge.
- **Level 4:** The cave becomes a breach that lets deep horrors spill toward Tristram while the party is spent.

### Threat Clocks
- **Deep Pursuit [6 Ticks]:** advances when Delvers retreat while hunted, linger too long at the cave, or leave the stair unguarded.

### Yields
A route back to town from deep in the dungeon, with access to trade and recovery.

### Source Figures (verbatim evidence; not read by the app)
```
Dungeon level: 9
```

### Related Modules
- `MOD_DIABLO_SIT_TRISTRAM`

### Standalone Fallback
Run it as a one-shot: after a punishing descent, the party climbs a stair into a cave beside a shady peddler's stand and must trade, recover and decide whether to go back down.
