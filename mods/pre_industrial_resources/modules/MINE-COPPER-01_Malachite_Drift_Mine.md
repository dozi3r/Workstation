---
id: "MINE-COPPER-01"
title: "Malachite Drift Mine"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-COPPER"
chain_stage: 1
chain_role: "extraction"
provides:
  - "Ore: Copper-Ore"
  - "Chem: Copper-Sulfate"
requires:
  - "Timber: Mine-Props"
  - "Fuel: Charcoal-or-Coal"
culture_quadrant: Clan
operational_profile: Extract / Endure
mtg_color: Green / Black
node_prerequisites:
  geology: Oxidized Copper-Bearing Limestone with Pyrite Pockets
  drainage: Sump and Bucket Chain to the Adit Mouth
  boiling_yard: Boiling Pans Set Beside the Seep Channel
standalone_fallback: "If props or charcoal stop arriving, the drift is worked only at its shallowest faces and the fire-setting stops; ore output falls to a third and the vitriol pans go cold."
injected_mechanics:
  tunnel_shoring_dial:
    level_1: "Open Roofs - Drifts stand on rotten or missing props; the strata shift and the roof comes down without warning."
    level_2: "Well-Propped Drift - Notched props wedged tight under every span; fire-setting and hauling go on in steady shifts."
    level_3: "Over-Timbered Drift - Props crowd every span and the forest runs thin; extraction slows while carpenters chase more timber."
    level_4: "Drift Collapse - A prop line fails or a water pocket breaches the lower drift; the face crew is buried or the lower level floods."
  threat_clocks:
    sump_rise_clock: "Sump Rise Clock [6 Ticks] - Each shift the bucket chain falls behind the seep adds a tick; when full the lower drift floods and the vitriol sump overflows with acid water."
    fume_and_vitriol_clock: "Fume and Vitriol Clock [4 Ticks] - Each fire-setting round without airing the drift adds a tick as smoke and corrosive drips sicken the crew; when full the miners down tools until the shaft is cleared."
  yields_resource: "Copper Ore (8 Rawhide Skips/Day) and Blue Vitriol (a sack of crystals every 3 days while the pans boil)"
---
# Malachite Drift Mine (`MINE-COPPER-01`)
> **Industry Chain**: `CHAIN-COPPER` (Stage 1: `extraction`)

## 1. Architectural Overview & Operational Loop
Miners tunnel into colorful oxidized copper-bearing limestone strata along arid hillsides, shoring up unstable roofs with notched timber props and hauling green malachite ore up inclined shafts in rawhide skips. Pickaxes, wedges, and slow-burning charcoal fires are employed to fracture stubborn rock faces before sorting rich green veins from barren gangue. Where scattered copper-pyrite pockets break the limestone, the acid seep water is bailed into shallow boiling pans and boiled down until blue vitriol crystals form, scraped out as copper sulfate. The drift consumes `Timber: Mine-Props` and `Fuel: Charcoal-or-Coal` and yields `Ore: Copper-Ore` and `Chem: Copper-Sulfate`.

Heat from fire-setting cracks the face, and miners follow with wedges and picks; the drift advances slowly, a metre or so a month. Miners work in groups as specialised craftsmen, and the best paid are the fire-setters and rock-breakers; newcomers begin by hauling broken ore in hand barrows. Ore is sorted underground, which leaves rich lumps open to theft, and the authority that owns the land claims its share. The workings are hot and smoky, and corrosive vitriol drips from the roof. Blue vitriol, a poisonous sweet-tasting crystal, collects where the oxidation zone is wet, and refiners value it as a reagent.
- **Drift and Adit:** the main gallery and its side faces, following the green seam into the hill.
- **Rawhide Skip Incline:** the sloped shaft where loaded skips are hauled to the sorting floor.
- **Sump and Bucket Chain:** the low point where seep water is bailed out hand to hand.
- **Vitriol Pans:** boiling pans on the hillside where seep water is boiled to blue crystals.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[4, 1, 3]` - **Resistant Survivalist** (`Clan`).
- **Sociological Rationale**: Subterranean danger, cramped darkness, and shared physical toil forge tight bonds of mutual reliance and deep distrust of surface administrators.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Underground Boss Kaelen Varr"
  role: "Shift Boss"
  disposition: "[4, 1, 3]"
  motivation: "Extract high-grade malachite without triggering roof cave-ins."
- name: "Timber Man Joram Slate"
  role: "Prop Carpenter"
  disposition: "[3, 1, 2]"
  motivation: "Ensure every drift tunnel is securely shored against shifting earth."
- name: "Fire-Setter Rhosyn Tallow"
  role: "Fire-Setter and Rock-Breaker"
  disposition: "[4, 3, 2]"
  motivation: "Keep her place among the best-paid crew in the drift by laying fires that crack the face cleanly, before the smoke and the vitriol drips take her lungs."
- name: "Vitriol Boiler Anselm Quillfeather"
  role: "Seep-Water Boiler and Crystal Seller"
  disposition: "[3, 4, 1]"
  motivation: "Sell blue vitriol to the refiners on his own account instead of at the owner's fixed price, because the sump water is his only road out of debt."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Underground Boss Kaelen Varr
role: Shift Boss
motivation: Extract high-grade malachite without triggering roof cave-ins.
disposition: [4, 1, 3]
```
```text
name: Timber Man Joram Slate
role: Prop Carpenter
motivation: Ensure every drift tunnel is securely shored against shifting earth.
disposition: [3, 1, 2]
```
```text
name: Fire-Setter Rhosyn Tallow
role: Fire-Setter and Rock-Breaker
motivation: Keep her place among the best-paid crew in the drift by laying fires that crack the face cleanly, before the smoke and the vitriol drips take her lungs.
disposition: [4, 3, 2]
```
```text
name: Vitriol Boiler Anselm Quillfeather
role: Seep-Water Boiler and Crystal Seller
motivation: Sell blue vitriol to the refiners on his own account instead of at the owner's fixed price, because the sump water is his only road out of debt.
disposition: [3, 4, 1]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Copper Ore** (`Commodity`): Raw malachite and azurite lumps rich in copper carbonate.
- **Notched Mine Prop** (`Tool`): Seasoned hardwood timber cut to wedge tightly against tunnel roofs.
- **Blue Vitriol** (`Commodity`): Deep-blue copper-sulfate crystals evaporated from sump water, prized by refiners as a reagent.
- **Rawhide Skip** (`Tool`): Hide-bottomed haul bag dragged up the incline by a windlass, carrying a barrow load of ore.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial - `Tunnel Shoring` (`0-10`)**: At `0-3`, shifting strata cause catastrophic drift collapses. At `8-10`, over-timbering exhausts available forest props and slows extraction.
- **Quest Hook - *The Seeping Sump***: When a subterranean water pocket breaches the lower drift, Kaelen must organize bucket chains before the entire lower level floods. Anselm Quillfeather's vitriol pans overflow with the same acid water, Rhosyn Tallow refuses to set another fire in the wet drift, and the roof props in the lower drift will not last the week.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** Wedges the roof with `Timber: Mine-Props` from the **Water-Powered Sawmill (`IND-TIMBER-02`)**, and burns `Fuel: Charcoal-or-Coal` from the **Charcoal Burner's Mound (`IND-CHARCOAL-01`)** or the **Deep Colliery and Coking Ovens (`MINE-COAL-01`)** to set fires against the face and to heat the vitriol pans.
* **Output Transmission:** Hauls `Ore: Copper-Ore` to the **Copper Smelting Furnace (`IND-COPPER-02`)**, and scrapes blue vitriol as `Chem: Copper-Sulfate` for the **Stamping Mill & Patio Amalgamation Floor (`IND-SILVER-02`)**, where it is dosed into the patio heaps.
* **Tactical Chokepoint:** The adit and its sump. Whoever keeps the water out controls both the ore and the vitriol.

## 6. Vague Game Hazards
* **Drift Collapse:** Rotten or skimped props let the roof come down on the face crew ($3\text{d}6$ bludgeoning damage and the victims are pinned).
* **Fire-Set Smoke:** Entering the drift before the fire-set smoke clears sickens the lungs and blurs the sight ($1\text{d}6$ damage per hour and a penalty to perception).
* **Vitriol Drip:** Acid seep water burns skin and eyes and ruins tools left in it ($1\text{d}6$ acid damage and corroded gear).
