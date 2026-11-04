---
id: STARTER-03
title: The Goblin Warrens & Abandoned Clay Pits
set: Starter Pack (Regional Perils)
tier: Tier 2 (Topological & Biome Anchors)
pipeline_tier: 2
chain_id: "CHAIN-FRONTIER"
chain_stage: 1
chain_role: "extraction"
provides: ["Hazard: Goblin-Raid-Warband", "Material: Crude-Iron-Scrap"]
requires: []
culture_quadrant: Adhocracy / Clan
operational_profile: Produce / Service
mtg_color: Black / Red
node_prerequisites:
  elevation: Lowland Ravine or Excavation
standalone_fallback: "Goblins raid exclusively at night and scatter into the scrub brush if their war-chief is slain."

injected_mechanics:
  output_dial:
    level_1: "Nuisance Scavengers - Goblins steal chickens, cut fence lines, and throw rocks at carters."
    level_2: "Highway Ambushes - Goblin raiding parties dig spiked pits across the King's Highway; DC 12 Perception to spot."
    level_3: "Night Raids on Farmsteads - Barns burned, cattle stolen; militia called to arms."
    level_4: "Warren Surge - Goblin war-chief unites the tribe under a feral banner; assaults township perimeter."
  threat_clocks:
    raid_readiness: "Goblin Warband Mobilization [4 Ticks] - Ticks when farmers' warnings are ignored."
  yields_resource: "Lowland Threat Escalation, Scrap Weapons, Bounty Ears"
---

# MODULE STARTER-03: THE GOBLIN WARRENS & CLAY PITS

## Granular Disposition Baseline ([S, E, C])
- Coordinate: `[1, 2, 1]` (Aggressive feral scavenger clan orientation)

### 1. Warren Architecture
An old commercial brickworks and clay quarry abandoned twenty years ago. The excavation pit is overgrown with thorny briars and honeycombed with narrow, claustrophobic crawlways dug by a goblin tribe.

* **Flooded Pit Basin:** A stagnant slurry of orange water filled with slippery clay mud; difficult terrain for medium creatures.
* **Narrow Squeeze Holes:** Tunnels are sized for small creatures (3 feet high); medium humanoids suffer disadvantage on attack rolls and speed is halved.
* **Crude Alarm Traps:** Wire-strung tin cans and falling rock deadfalls warn the war-chief of intruders.

### 2. GM Placement & Synergies
* **Placement:** Recommended on **Node 12 (Goblin Warrens)**.
* **Synergies:** Menaces traffic on **Node 15 (The King's Highway)** and steals cattle from **Node 2 (Frontier Farmlands)**. Town bailiff offers 10 silver pieces per goblin ear.

### Key Personnel (NPC Prototypes)
- name: "Warchief Snagga Iron-Tooth"
  role: "Tribal Chieftain & Raider Leader"
  disposition: "[1, 1, 1]"
  motivation: "Raid surrounding farmsteads for livestock, weapons, and shiny trinkets."
- name: "Shaman Gribble Scabs-To-Toe"
  role: "Feral Oracle & Tunnel Trap Master"
  disposition: "[1, 2, 1]"
  motivation: "Defend the subterranean warrens through vile tripwires and toxic fungus brews."
