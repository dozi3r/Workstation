---
id: MINE-COAL-01
title: Deep Colliery and Coking Ovens
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-COAL
chain_stage: 1
chain_role: extraction
provides: ["Fuel: Charcoal-or-Coal"]
requires: ["Timber: Mine-Props"]
culture_quadrant: Market / Hierarchy
operational_profile: Produce / Coordinate
mtg_color: Black / Red
node_prerequisites:
  geology: Bituminous or Anthracite Carbon Seam
  ventilation: Air Shaft with Gravity Fire-Brazier Draught
  coking_banks: Masonry Beehive Oven Construction
standalone_fallback: "If coking ovens are destroyed, raw bituminous coal can be burned directly, producing heavy choking sulfur smoke and degrading smelting metal quality."

injected_mechanics:
  coking_battery_dial:
    level_1: "Oven Ignition - Smoky yellow flames licking damper brick; coal desulfurizing."
    level_2: "Steady Coking (2000°F) - Blue hydrocarbon burn; incandescent silver-grey coke beds."
    level_3: "High-Heat Quench Phase - Water sprays billow superheated steam clouds."
    level_4: "Coking Bank Flashback - Coal dust atmosphere flashes into explosion; oven crown blows out."
  threat_clocks:
    firedamp_methane_buildup: "Firedamp Methane Clock [4 Ticks] - Explosive gas pockets accumulate in deep drifts."
    coal_seam_fire: "Seam Fire Clock [6 Ticks] - Smoldering underground fire creeps behind timber props."
  yields_resource: "High-Carbon Metallurgical Coke & Bituminous Steaming Coal (30 Tons/Day)"
---

# MODULE MINE-COAL-01: DEEP COLLIERY AND COKING OVENS

### 1. Mining & Coking Architecture

The colliery works tap rich carboniferous fossil beds deep beneath the ridges, baking bituminous coal in circular beehive batteries to drive high-temperature metallurgy.

* **Main Drift & Haulage Shaft:** Supported by massive square-hewn timber frames, carrying iron-tracked handcarts from the coal face to the pithead tipple.
* **Beehive Coking Oven Battery:** Bank of hemispherical firebrick ovens with arched charge doors. Coal is heated with restricted air, driving off volatile sulfur and tar gases to leave porous, high-carbon coke.
* **Pithead Screening & Quench Platform:** Raised timber trestle where glowing coke is raked out and quenched with torrents of ditch water, creating roaring plumes of white steam.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes square-cut timbers from `Timber: Mine-Props` to keep the deep shafts from crushing shut.
* **Output Transmission:** Dispatches bulk `Fuel: Charcoal-or-Coal` to power blast furnaces (`MINE-IRON-02`), boiling houses (`AGRI-SUGAR-02`), and steelworks (`IND-STEEL-01`).

### 3. Notable Characters & Personnel

```text
name: Colliery Master Vond
role: Pithead Director & Air Inspector
motivation: Detect deadly methane gas pockets with caged canaries and keep production moving.
disposition: [2, 0, 2]
```

```text
name: Runa the Breaker
role: Sorting Screen Foreman
motivation: Keep child picking crews alert and prevent pyrite sulfur stones from contaminating metallurgical coke batches.
disposition: [0, 2, 2]
```

### 4. Vague Game Hazards
* **Methane Gas Flash:** Open flame in the lower galleries triggers explosive methane deflagration ($4\text{d}6$ fire damage and shockwave).
* **Quench Steam Burns:** Stepping onto the quench apron without wooden clogs inflicts scald burns from boiling sulfurous slurry.

### Key Personnel (NPC Prototypes)
- name: "Chief Warden MINECOAL01 Vance"
  role: "Principal Facility Administrator"
  disposition: "[2, 2, 2]"
  motivation: "Maintain operational throughput and safeguard critical reserves for Deep Colliery and Coking Ovens."
- name: "Inspector MINECOAL01 Kaelen"
  role: "Counter-Sabotage & Logistics Auditor"
  disposition: "[2, 3, 2]"
  motivation: "Uncover illicit skimming and prevent catastrophic clock escalation."
