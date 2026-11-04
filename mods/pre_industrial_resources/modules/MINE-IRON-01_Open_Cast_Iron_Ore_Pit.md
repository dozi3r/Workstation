---
id: MINE-IRON-01
title: Open-Cast Iron Ore Pit
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-IRON
chain_stage: 1
chain_role: extraction
provides: ["Ore: Raw-Iron-Ore"]
requires: ["Timber: Mine-Props"]
culture_quadrant: Hierarchy / Clan
operational_profile: Produce / Coordinate
mtg_color: Red / Green
node_prerequisites:
  geology: Ferruginous Hematite or Bog Iron Deposit
  transport: Cart Track or Canal Wharf for Bulk Hauling
  timber_access: Seasoned Oak or Pine Shoring Props
standalone_fallback: "If heavy timber props are unavailable, mining retreats to shallow surface scratch trenches, cutting extraction volume by 60%."

injected_mechanics:
  ore_output_dial:
    level_1: "Surface Scrabbling - Low-grade bog ore gravel picked by hand."
    level_2: "Active Bench Quarrying - Pickaxe crews working 20-foot terraced benches; steady hematite flow."
    level_3: "Deep Trench Explosive Blasting - Powder charges fracture bedrock; double ore haul."
    level_4: "Bench Slope Catastrophic Slide - Quarry wall collapses, burying lower workings in rock."
  threat_clocks:
    pit_flooding_clock: "Pit Inundation Clock [4 Ticks] - Groundwater overwhelms siphon pumps."
    quarry_bench_subsidence: "Bench Collapse Clock [6 Ticks] - Fractured shale fractures along fault lines."
  yields_resource: "Raw Red Hematite & Magnetite Ore Chunks (25 Tons/Day)"
---

# MODULE MINE-IRON-01: OPEN-CAST IRON ORE PIT

### 1. Extractive Architecture

The iron quarry is an immense terraced amphitheater carved into red mineral bedrock, exposing thick veins of dense hematite and magnetite ore.

* **Terraced Extraction Benches:** Step-cut stone benches where miners drill holes with sledge and chisel, wedging out multi-ton slabs of dark red ore.
* **Timber Shoring & Sump Flumes:** Heavy timber headframes and gravity flumes that pump out seepage groundwater into perimeter settlement settling ponds.
* **Gravity Sled Runways:** Inclined timber chutes that slide loaded ore crates down from high extraction benches directly to wagon staging squares.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Requires constant timber shoring from `Timber: Mine-Props`.
* **Output Transmission:** Ships bulk raw ore (`Ore: Raw-Iron-Ore`) down-valley to the **Charcoal Bloomery & Blast Furnace (`MINE-IRON-02`)**.

### 3. Notable Characters & Personnel

```text
name: Foreman Grim Torvald
role: Chief Mine Quarryman
motivation: Drive extraction quotas to earn his crew's freedom bond from the mining guild.
disposition: [2, 1, 2]
```

```text
name: Bera Iron-Grip
role: Pit Shoring Carpenter & Sump Tender
motivation: Keep timber props braced against the creeping south fault line.
disposition: [1, -1, 3]
```

### 4. Vague Game Hazards
* **Falling Rock Slides:** Working on lower terraces without lookouts risks crushing rockfalls ($2\text{d}8$ bludgeoning damage).
* **Hematite Dust Inhalation:** Dry days produce choking mineral dust clouds; prolonged labor requires dampened bandanas or inflicts lung fatigue.

### Key Personnel (NPC Prototypes)
- name: "Chief Warden MINEIRON01 Vance"
  role: "Principal Facility Administrator"
  disposition: "[2, 2, 2]"
  motivation: "Maintain operational throughput and safeguard critical reserves for Open-Cast Iron Ore Pit."
- name: "Inspector MINEIRON01 Kaelen"
  role: "Counter-Sabotage & Logistics Auditor"
  disposition: "[2, 3, 2]"
  motivation: "Uncover illicit skimming and prevent catastrophic clock escalation."
