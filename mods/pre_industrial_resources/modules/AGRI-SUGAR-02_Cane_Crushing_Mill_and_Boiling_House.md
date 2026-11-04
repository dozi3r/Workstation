---
id: AGRI-SUGAR-02
title: Cane Crushing Mill and Boiling House
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-SUGAR
chain_stage: 2
chain_role: refining
provides: ["Commodity: Cane-Molasses", "Food: Refined-Sugar"]
requires: ["Crop: Raw-Sugarcane", "Fuel: Charcoal-or-Coal"]
culture_quadrant: Market / Hierarchy
operational_profile: Produce / Design
mtg_color: Red / Green
node_prerequisites:
  power_source: Waterwheel, Steam Boiler or Draft Mule Gearing
  thermal_feed: Constant Fuel Supply (Cordwood, Charcoal, or Bagasse)
  facility_tier: Heavy Workshop or Outpost Mill
standalone_fallback: "If thermal fuel runs out, unboiled cane juice can be fermented directly into sour farm mash, producing zero refined loaves and cutting alcohol yield by 70%."

injected_mechanics:
  boiling_battery_dial:
    level_1: "Gentle Simmer - Clarification kettle skimming scum; pale thin cane syrup."
    level_2: "Full Train Boil - Five copper kettles roaring; syrup cascades through copper ladles."
    level_3: "High-Brix Concentration - Thick sticky syrup bubbling violently; scorching danger."
    level_4: "Kettle Boilover & Caramel Fire - Scorched vat flashes into explosive caramel smoke."
  threat_clocks:
    crusher_roller_jam: "Roller Jam Clock [4 Ticks] - Fiber tangles iron teeth if greasing fails."
    boiler_steam_rupture: "Boiler Pressure Clock [6 Ticks] - Safety valve caked in calcified lime."
  yields_resource: "Granulated Sugar Loaves & Heavy Blackstrap Molasses Vats"
---

# MODULE AGRI-SUGAR-02: CANE CRUSHING MILL AND BOILING HOUSE

### 1. Mechanical & Refining Architecture

The crushing mill and boiling house forms the industrial core of sugar manufacture, extracting sticky juice between iron rollers and evaporating it across a cascading furnace train.

* **Three-Roller Iron Mill:** Heavy grooved rollers driven by an undershot waterwheel or mule sweep. Stalks fed into the nip are crushed under immense mechanical pressure, expelling foamy green sap.
* **The Jamaica Boiling Train:** Five descending copper cauldrons built over a flue-fired firebrick furnace. The juice is clarified with quicklime, skimmed of scum, and ladled down the train until it granulates in the strike pan.
* **Curing Hogshead Loft:** Open-beamed timber loft where conical clay pots drain black molasses from the crystalline sugar loaves.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes cartloads of `Crop: Raw-Sugarcane` from `AGRI-SUGAR-01` and `Fuel: Charcoal-or-Coal`.
* **Output Transmission:** Dispatches casks of `Food: Refined-Sugar` to commercial markets and vats of `Commodity: Cane-Molasses` to the **Rum Distillery & Excise Harbor (`AGRI-SUGAR-03`)**.

### 3. Notable Characters & Personnel

```text
name: Kasia Vorn
role: Master Sugar Boiler & Still-Watcher
motivation: Perfect the crystalline strike point and prevent sugar masters from shorting her share.
disposition: [-2, 3, 1]
```

```text
name: Tobias Pike
role: Millwright & Steam Engineer
motivation: Keep the bronze roller bearings packed with beef tallow to avoid catastrophic seizures.
disposition: [1, -1, 2]
```

### 4. Vague Game Hazards
* **Roller Nip Trapping:** Touching the moving rollers risks dragging loose clothing or limbs into the gears ($2\text{d}10$ crushing damage).
* **Scalding Sugar Slurry:** Spilling boiling syrup causes agonizing thermal burns ($3\text{d}6$ fire damage) that adhere to skin like pitch.

### Key Personnel (NPC Prototypes)
- name: "Chief Warden AGRISUGAR02 Vance"
  role: "Principal Facility Administrator"
  disposition: "[2, 2, 2]"
  motivation: "Maintain operational throughput and safeguard critical reserves for Cane Crushing Mill and Boiling House."
- name: "Inspector AGRISUGAR02 Kaelen"
  role: "Counter-Sabotage & Logistics Auditor"
  disposition: "[2, 3, 2]"
  motivation: "Uncover illicit skimming and prevent catastrophic clock escalation."
