---
id: AGRI-SUGAR-03
title: Rum Distillery and Excise Harbor
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-SUGAR
chain_stage: 3
chain_role: commercial
provides: ["Commodity: High-Proof-Rum"]
requires: ["Commodity: Cane-Molasses", "Timber: Cooperage-Casks", "Metal: Forged-Copper"]
culture_quadrant: Market / Adhocracy
operational_profile: Exchange / Invent
mtg_color: Blue / Black
node_prerequisites:
  harbor_access: Deep-water Wharf, Tidal Pier or River Dock
  distillery_license: Imperial Excise Seal or Freebooter Charter
  cooperage_access: Oak Cask Staves and Iron Hoops
standalone_fallback: "If oak casks are unavailable, raw rum distillate is stored in clay jugs or skin bladders, spoiling flavor profile and halving export value."

injected_mechanics:
  spirit_proof_dial:
    level_1: "Low Wines (25% ABV) - Cloudy, aromatic wash from primary wash still."
    level_2: "Navy Strength Proof (57% ABV) - Clear, gunpowder-burn tested, barrel-aged export."
    level_3: "High-Proof Overproof (75% ABV) - Highly volatile spirit; caustic vapor cloud."
    level_4: "Stillhead Deflagration - Alcohol vapors ignite; distillery warehouse engulfed in flames."
  threat_clocks:
    excise_inspection_raid: "Excise Raid Clock [4 Ticks] - Revenue cutters search for untaxed spirit casks."
    fermentation_acid_sour: "Vat Souring Clock [6 Ticks] - Acetobacter infection turns wash into vinegar."
  yields_resource: "Tier 1 Export Navy Rum Barrels (50 Casks/Week)"
---

# MODULE AGRI-SUGAR-03: RUM DISTILLERY AND EXCISE HARBOR

### 1. Mechanical & Commercial Architecture

Stationed at the interface of fresh river water and ocean trade winds, the rum distillery converts refinery waste byproducts into the primary maritime trade currency of the realm.

* **Dunder & Skimmings Cisterns:** Sunken stone vats where cane skimmings and seasoned dunder broth ferment into esters, creating rich molasses wash.
* **Gooseneck Copper Pot Stills:** Twin 600-gallon copper stills equipped with worm condensers coiled inside wooden cooling flumes. Distills rich alcoholic vapors into crystal spirit.
* **Bonded Rum Wharf & Cooperage:** Heavily guarded bonded warehouse with oak cask aging racks, barrel testing gauges, and rolling ramps to cargo sloops.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes black molasses from `AGRI-SUGAR-02` and barrels from `Timber: Cooperage-Casks`.
* **Output Transmission:** Exports `Commodity: High-Proof-Rum` across regional sea lanes and satisfies military tavern rations.

### 3. Notable Characters & Personnel

```text
name: Captain Orlaith Vance
role: Smuggler & Independent Privateer
motivation: Evade customs cutter patrols and ferry untaxed spirit casks to distant insurgent cells.
disposition: [-3, 3, 2]
```

```text
name: Magistrate Hector Finch
role: Senior Imperial Excise Collector
motivation: Stamp every barrel with sovereign tax seals and confiscate contraband manifests.
disposition: [3, -2, 3]
```

### 4. Vague Game Hazards
* **Volatile Alcohol Vapors:** Enclosed distillery areas require dousing lanterns; sparks ignite explosive fireball flashes ($3\text{d}6$ fire damage).
* **Bonded Warehouse Guard Dogs:** Patrol mastiffs trained to tackle intruders attempting nighttime barrel theft.

### Key Personnel (NPC Prototypes)
- name: "Chief Warden AGRISUGAR03 Vance"
  role: "Principal Facility Administrator"
  disposition: "[2, 2, 2]"
  motivation: "Maintain operational throughput and safeguard critical reserves for Rum Distillery and Excise Harbor."
- name: "Inspector AGRISUGAR03 Kaelen"
  role: "Counter-Sabotage & Logistics Auditor"
  disposition: "[2, 3, 2]"
  motivation: "Uncover illicit skimming and prevent catastrophic clock escalation."
