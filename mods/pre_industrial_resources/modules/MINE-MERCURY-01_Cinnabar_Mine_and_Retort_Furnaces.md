---
id: MINE-MERCURY-01
title: Cinnabar Mine and Retort Furnaces
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-MERCURY
chain_stage: 1
chain_role: extraction
provides: ["Chem: Mercury"]
requires: ["Timber: Mine-Props", "Fuel: Wood-Fuel", "Commodity: Ceramic-Vessels"]
culture_quadrant: Hierarchy / Market
operational_profile: Produce / Coordinate
mtg_color: Black / Blue
node_prerequisites:
  geology: Red Cinnabar Vein in Fractured Hillside Rock
  charter: Crown Monopoly Warrant with Sealed Flask Ledger
  furnace_yard: Walled Retort Yard Downwind of the Workers' Barracks
standalone_fallback: "If the clay condenser pots run out, smelters fall back on open pile roasting, losing most of the quicksilver to the air and fouling every slope downwind."

injected_mechanics:
  retort_vapor_dial:
    level_1: "Cold Charge - Crushed red ore packed into clay pots with lime; fires laid but not lit."
    level_2: "Steady Roast - Pots sealed and glowing; bright beads of quicksilver weep into the receivers."
    level_3: "Leaking Seals - Cracked pots hiss pale fumes; yard workers cough, tremble and lose count."
    level_4: "Opened Hot - A furnace is broken open before cooling; a poison cloud rolls over the barracks and the town below."
  threat_clocks:
    mine_cough_clock: "Mine Cough Clock [6 Ticks] - Convict and draft crews sicken; each tick removes hands from the retort yard and feeds the whispers of revolt."
    flask_ledger_clock: "Short Ledger Clock [4 Ticks] - Uncounted flasks slip out through the contraband trade; when it fills, the monopoly inspector arrives early."
  yields_resource: "Sealed Iron Flasks of Quicksilver (6 Flasks/Day, 76 lb each)"
---

# MODULE MINE-MERCURY-01: CINNABAR MINE AND RETORT FURNACES

### 1. Mining & Retort Architecture

The cinnabar works is a walled monopoly holding where blood-red ore is hacked from the hill, roasted in sealed clay pots, and coaxed into shivering beads of liquid metal that no one is allowed to count but the crown's clerks.

* **Cinnabar Galleries:** Narrow, timber-propped workings that follow the red vein into the hill. Convicts and drafted villagers work the face in shifts, hauling ore out in baskets to the sorting floor.
* **Retort Furnace Yard:** Rows of earthen pots charged with crushed ore and lime or iron filings, sealed, and fired over banked wood. The vapor rises, cools in the clay condenser pots, and drips into receivers as bright quicksilver. Pots crack in the heat and are smashed and replaced every week.
* **Flask House & Seal Room:** A barred stone strongroom where the metal is poured into heavy iron flasks, since iron does not take up quicksilver, then weighed at 76 lb, stamped with the monopoly seal, and entered in the ledger.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes `Timber: Mine-Props` to hold open the soft red galleries, cartloads of `Fuel: Wood-Fuel` to keep the retort fires banked day and night, and a steady stream of `Commodity: Ceramic-Vessels` to replace the clay condenser pots that crack in every firing.
* **Output Transmission:** Dispatches sealed flasks of `Chem: Mercury` under guard to the **Stamping Mill and Patio Amalgamation Floor (`IND-SILVER-02`)**, where it is mixed with salt and a blue copper-sulfate reagent into ground silver ore and trodden by mules on the open patio.
* **Tactical Chokepoint:** Whoever holds the flask house holds the silver country. Halting the retorts for a single season starves every amalgamation floor that depends on the monopoly.

### 3. Notable Characters & Personnel

```text
name: Smelter-Master Orrin Vashka
role: Retort Yard Overseer
motivation: Meet the crown quota at any cost, even if it means breaking open a furnace before it has cooled.
disposition: [2, -2, 3]
```

```text
name: Tesk Hollowbreath
role: Convict Pot-Charger & Yard Veteran
motivation: Trade his hidden cache of uncounted flasks for a pardon before the mine cough finishes him.
disposition: [-2, 1, -1]
```

### 4. Vague Game Hazards
* **Quicksilver Vapor:** Working the retort yard at Level 3 or higher without wet cloth over the face inflicts creeping poisoning ($1\text{d}6$ damage per hour and a cumulative tremor that penalizes fine work).
* **Red Gallery Collapse:** Rotten or skimped props in the cinnabar galleries give way without warning, burying the face crew under loose red rock ($3\text{d}6$ bludgeoning damage).

### Key Personnel (NPC Prototypes)
- name: "Clerk-Assayer Ysolde Marrane"
  role: "Monopoly Ledger Keeper & Flask Sealer"
  disposition: "[3, 0, 2]"
  motivation: "Reconcile every flask against the seal book before the inspector rides in, and find out who has been short-filling the receivers."
- name: "Dovic the Drafted"
  role: "Village Draft Captain & Gallery Gang Leader"
  disposition: "[-1, 2, 1]"
  motivation: "Bring his levy of village men home alive when their term ends, and refuse any order that sends them into the hot yard."
