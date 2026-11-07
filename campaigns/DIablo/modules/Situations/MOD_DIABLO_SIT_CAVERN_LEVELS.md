---
id: "MOD_DIABLO_SIT_CAVERN_LEVELS"
title: "Cavern Levels"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Ecology: Poison-Spitter-Hordes", "Defense: Lava-Narrowed-Paths", "Lore: Open-Cave-Warfare"]
requires: ["Lore: Dungeon-Descent-Route"]
tarot_affinity: ["The Tower", "The Devil"]
culture_quadrant: "Clan"
operational_profile: "Produce"
mtg_color: "Red"
hub_eligibility: "candidate"
summary: "The cave-like middle depths of the dungeon. Lava lakes squeeze the footing into narrow paths, Poison Spitters hold the open ground, and big hordes have room to run. Ranged attackers can also keep their distance here, so the usual doorway trick fails."
standalone_fallback: "Run it as a one-shot fighting retreat across a lava-lit cave. The party must thin or evade a huge horde while Poison Spitters pepper them from range, and the only safe footing is a few narrow paths between lava lakes. Success means reaching the far side of the cave. Staying put means being overrun."
injected_mechanics:
  output_dial:
    level_1: "A cautious crossing of the lava paths, with a few Spitters and slow-moving monsters that can be handled one at a time."
    level_2: "A real horde gathers, Spitters keep their range, and the party has to fight while moving along narrow paths."
    level_3: "Hordes flood the open ground, ranged fire pins the party on the lava paths, and retreat is cut off."
    level_4: "The party is surrounded on a shrinking path, poison and lava close in together, and only a sacrifice or a desperate breakout survives."
  threat_clocks:
    - name: "The horde closes"
      ticks: 6
      advances_when: "The party stands and trades fire in the open instead of moving or finding a defensible path."
    - name: "Poison saturation"
      ticks: 4
      advances_when: "Spitters get uncontested ranged volleys onto the party's position."
  yields_resource: "Safe passage to the deeper dungeon, plus knowledge of which narrow lava paths hold, which can be reused as a defensible route."
linked_entity: "N_CAVERN_LEVELS"
related: ["MOD_DIABLO_SIT_DUNGEON", "MOD_DIABLO_SIT_NARROW_PATH_BETWEEN_LAVA_LAKES"]
---

# MODULE MOD_DIABLO_SIT_CAVERN_LEVELS: Cavern Levels

The cave-like middle depths of the dungeon. Lava lakes squeeze the footing into narrow paths, Poison Spitters hold the open ground, and big hordes have room to run. Ranged attackers can also keep their distance here, so the usual doorway trick fails.

### Dramatic Premise
A hero who relies on thinning hordes from a safe position + a cavern with no doorways to hide behind and enemies who keep their distance = a fight that is won by movement and nerve, not by attrition.

### Core Premise
The Cavern levels are the point where the dungeon stops funneling the party into corridors. Lava lakes carve narrow paths, hordes run freely and Poison Spitters keep range. The hero who relied on doorways and patience now faces an open fight that demands accuracy, mobility and nerve.

### GM Placement & Synergies
Place it in the middle of a descent, after tight-corridor levels have taught the party to rely on chokepoints. It consumes the party's assumption that distance attackers can be pulled through a doorway, and it feeds deeper levels with a worn-down, wary party. Use the lava paths as the main tactical feature. An arrival goes well when the party plans a route, uses the paths as their own chokepoints and picks off Spitters. It goes badly when they linger in the open or expect a doorway to save them.

### 5D Sensory Pentagon
- **Physical environment:** Cave-like middle levels where lava lakes become common and leave only narrow paths between them.
- **Behaviors:** Poison Spitters are common. Monsters arrive in large hordes, often with generally slower monsters in tow, and ranged enemies have room to run and keep their distance.
- **Relationships:** Spitters and their slower companions move together, and the horde works as one pressure. The Rogue fights here but is badly matched to its scale.
- **Attitudes:** The cave offers no mercy and no chokepoint. Everything is in the open and pressing in.
- **Values:** Space, range and mobility matter more than patience. Thinning the horde takes accuracy the hero may not have.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The monster hordes of the Cavern):** The open cave belongs to numbers. Overwhelm whatever walks in. *Leverage:* Sheer mass, room to run, and ranged Spitters that need no doorway. *Blind spot:* The slower monsters trail behind the fast ones, so the horde arrives in uneven waves.
* **Main opponent (The Rogue):** Distance and precision decide a fight. *Leverage:* Ranged skill, and the chance to draw foes through chokepoints elsewhere in the dungeon. *Blind spot:* Here the doorway trick fails, and thinning a horde takes very reliable accuracy.
* **Thematic shadow (Poison Spitters):** The best fight is the one where you are never touched. *Leverage:* They hold range in open cave and can pick off anyone caught on a narrow path. *Blind spot:* They rely on the slower brutes to screen them, and they are fragile if reached.
* **Tertiary outcast (A lone survivor stranded on a lava-locked ledge):** Nobody crosses the Cavern twice without a reason. *Leverage:* Knows which narrow paths still hold. *Blind spot:* Cut off, short of supplies, and watched by every Spitter in range.

### Output Dial
- **Level 1:** A cautious crossing of the lava paths, with a few Spitters and slow-moving monsters that can be handled one at a time.
- **Level 2:** A real horde gathers, Spitters keep their range, and the party has to fight while moving along narrow paths.
- **Level 3:** Hordes flood the open ground, ranged fire pins the party on the lava paths, and retreat is cut off.
- **Level 4:** The party is surrounded on a shrinking path, poison and lava close in together, and only a sacrifice or a desperate breakout survives.

### Threat Clocks
- **The horde closes [6 Ticks]:** advances when The party stands and trades fire in the open instead of moving or finding a defensible path.
- **Poison saturation [4 Ticks]:** advances when Spitters get uncontested ranged volleys onto the party's position.

### Yields
Safe passage to the deeper dungeon, plus knowledge of which narrow lava paths hold, which can be reused as a defensible route.

### Related Modules
- `MOD_DIABLO_SIT_DUNGEON`
- `MOD_DIABLO_SIT_NARROW_PATH_BETWEEN_LAVA_LAKES`

### Standalone Fallback
Run it as a one-shot fighting retreat across a lava-lit cave. The party must thin or evade a huge horde while Poison Spitters pepper them from range, and the only safe footing is a few narrow paths between lava lakes. Success means reaching the far side of the cave. Staying put means being overrun.
