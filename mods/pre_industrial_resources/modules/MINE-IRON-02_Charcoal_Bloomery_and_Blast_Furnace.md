---
id: MINE-IRON-02
title: Charcoal Bloomery and Blast Furnace
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-IRON
chain_stage: 2
chain_role: refining
provides: ["Metal: Pig-Iron"]
requires: ["Ore: Raw-Iron-Ore", "Fuel: Charcoal-or-Coal"]
culture_quadrant: Hierarchy / Market
operational_profile: Produce / Design
mtg_color: Red / Black
node_prerequisites:
  air_blast: Waterwheel-driven Leather Bellows or Trompe Air Siphon
  flux_feed: Limestone or Oyster Shell Carbonate Beds
  refractory_hearth: Granite or Firebrick Stack Construction
standalone_fallback: "If mechanical air blast is lost, operations drop to low-temperature clay bloomeries; produces spongy bloomery iron instead of liquid pig-iron, unusable for crucible steel casting."

injected_mechanics:
  furnace_hearth_dial:
    level_1: "Charcoal Smolder (1800°F) - Pre-heating the bosh stack; slag running sluggishly."
    level_2: "Active Blast Smelt (2400°F) - Liquid pig-iron pool forming beneath slag layer."
    level_3: "White-Heat Blast (2800°F) - Carbon dissolution maxed; extreme spark shower from throat."
    level_4: "Tuyere Burn-Through - Molten iron burns through water-jacketed nozzle; blast floor flood."
  threat_clocks:
    slag_dam_overfill: "Slag Overfill Clock [4 Ticks] - Vitrified glassy slag plugs iron taphole."
    tuyere_clog_clock: "Bellows Air Clog Clock [6 Ticks] - Dust clogs leather flapper valves."
  yields_resource: "Cast Pig-Iron Sows & Malleable Bloom Bars (15 Tons/Day)"
---

# MODULE MINE-IRON-02: CHARCOAL BLOOMERY AND BLAST FURNACE

### 1. Pyrometallurgical Architecture

The blast furnace is a 30-foot masonry tower built against a hillside bluff, roaring continuously as air blast and burning fuel reduce raw iron oxides to heavy, carbon-rich molten metal.

* **Stone Bosh & Hearth Stack:** Heavy granite tower lined with heat-resistant refractory sandstone. Alternating charges of iron ore, charcoal, and limestone flux are dumped into the top throat.
* **Twin Leather Bellows & Waterwheel:** Heavy waterwheel driving cam-lifted bellows, delivering continuous forced air through water-cooled copper tuyeres into the hearth.
* **Sand Casting Casting Floor:** Level sand floor furrowed with trenches ("sow and pigs") into which molten iron flows when the clay taphole is breached with an iron punch.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes `Ore: Raw-Iron-Ore` from `MINE-IRON-01` and `Fuel: Charcoal-or-Coal`.
* **Output Transmission:** Dispatches raw sows of `Metal: Pig-Iron` to local blacksmiths or downstream to the **Crucible Steelworks & Foundry (`IND-STEEL-01`)**.

### 3. Notable Characters & Personnel

```text
name: Master Smelter Kaelen
role: Chief Blast Master
motivation: Keep the furnace tapped on schedule to prevent the molten salamander from freezing solid.
disposition: [2, -2, 2]
```

```text
name: Sela the Tapper
role: Taphole Chisel Specialist
motivation: Survive the deadly white-hot slag run and secure safe casting molds for iron shot.
disposition: [0, 2, 1]
```

### 4. Vague Game Hazards
* **Liquid Iron Splash:** Tapping the furnace releases molten metal sparks; unprotected bystanders suffer burns ($2\text{d}6$ fire damage).
* **Carbon Monoxide Flue Flare:** Leaning over the charging throat risks breathing toxic flue gases causing dizziness and suffocation checks.

### Key Personnel (NPC Prototypes)
- name: "Chief Warden MINEIRON02 Vance"
  role: "Principal Facility Administrator"
  disposition: "[2, 2, 2]"
  motivation: "Maintain operational throughput and safeguard critical reserves for Charcoal Bloomery and Blast Furnace."
- name: "Inspector MINEIRON02 Kaelen"
  role: "Counter-Sabotage & Logistics Auditor"
  disposition: "[2, 3, 2]"
  motivation: "Uncover illicit skimming and prevent catastrophic clock escalation."
