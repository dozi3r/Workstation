---
id: STARTER-04
title: The Ancient Barrow & Restless Dead
set: Starter Pack (Regional Perils)
tier: Tier 4 (Dynamic Narrative Sparks & Clocks)
pipeline_tier: 4
chain_id: "CHAIN-FRONTIER"
chain_stage: 1
chain_role: "extraction"
provides: ["Crisis: Barrow-Wight-Incursion", "Relic: Ancient-Gilded-Torc"]
requires: []
culture_quadrant: Clan / Ancient Memory
operational_profile: Deliver / Design
mtg_color: Black / White
node_prerequisites:
  elevation: Highland Foothill or Grassy Mound
standalone_fallback: "The restless dead cannot cross running water; they remain contained within the barrow boundary unless grave robbers disturb the center lintel stone."

injected_mechanics:
  output_dial:
    level_1: "Silent Slumber - Grassy mound quiet; cold blue will-o'-wisps visible only on moonless nights."
    level_2: "Restless Whispers - Grazing sheep refuse to ascend the mound; eerie cold chills surrounding air."
    level_3: "Desecrated Seal - Grave robbers breach the iron doors; skeletons and barrow wights wander nearby paths."
    level_4: "Cursed Eclipse - Ancient chieftain rises in bronze armor; commands an undead host to reclaim the valley."
  threat_clocks:
    seal_decay: "Ancient Wardstone Cracking [6 Ticks] - Ticks each night the seal remains broken."
  yields_resource: "Ancient Gravestone Runes, Barrow Silver, Undead Incursion Clock"
---

# MODULE STARTER-04: THE ANCIENT BARROW & RESTLESS DEAD

## Granular Disposition Baseline ([S, E, C])
- Coordinate: `[1, 1, 4]` (Rigid ancestral guardian and necromantic boundary orientation)

### 1. Crypt Architecture
A monumental prehistoric earthworks mound faced with moss-covered megalithic stones. Beneath the earth lies an octagonal burial chamber built by an ancient chieftain dynasty.

* **Heavy Dolmen Lintel:** Requires a combined Strength check (DC 15) or crowbar leverage to shift the slab entrance.
* **Cold Mist Sanctum:** Frost coats the stone sarcophagi regardless of summer heat outside; non-magical torches burn low with pale blue flames.
* **Ancient Grave Goods:** Bronzework axes, silver torque necklaces, and clay urns holding ancestral ash.

### 2. GM Placement & Synergies
* **Placement:** Recommended on **Node 10 (The Crypt Barrow)** or any highland foothill node.
* **Synergies:** If the seal cracks, undead drift toward **Node 11 (The Sylvan Abbey)** and terrify herdsmen on **Node 3 (Highland Pastures)**.

### Key Personnel (NPC Prototypes)
- name: "Barrow-Wight King Halvar"
  role: "Awakened Chieftain & Undead Guardian"
  disposition: "[1, 1, 4]"
  motivation: "Slay all living intruders who desecrate the sacred royal sepulcher."
- name: "Relic Hunter Silas Vance"
  role: "Desperate Tomb Raider & Black-Market Antiquarian"
  disposition: "[3, 4, 1]"
  motivation: "Plunder ancient gold torcs from the barrow before the guardian spirit awakens."
