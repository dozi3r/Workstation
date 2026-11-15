---
id: T0-DOM-01
title: "The Subsistence Agrarian Perimeter and Root Cellars"
pipeline_tier: 0
target_set: "Set A"
set: "Set A (Infrastructure & Engineering)"
category: "Agriculture_and_Subsistence"
tier: "Tier 0 (Baseline Settlement Substratum)"
culture_quadrant: Clan
operational_profile: Produce / Preserve
mtg_color: "Green"
chain_id: "CHAIN-SUBSISTENCE"
chain_stage: 1
chain_role: "extraction"
provides: ["Food: Baseline-Subsistence-Rations"]
requires: []
node_prerequisites:
  arable: Well-Drained Loam Sectors in a Three-Field Perimeter
  storage: Hillside Earth-Banked Root Cellars and Staddle Granary
  haul_horizon: Ox-Cart Lanes within a Three-Mile Transport Radius
standalone_fallback: "If arable soils freeze, flood, or suffer blighted rot, the settlement opens sealed winter root cellars and transitions to parched grain rationing, wild hedgerow foraged turnip soups, and slaughtering non-essential dairy sheep, maintaining subsistence for 30 days before starvation checks begin."
injected_mechanics:
  output_dial:
    level_1: "Bountiful Cellars & Threshing - Dry cellars filled with parsnips, turnips, and barley; DC 10 Athletics/Nature (Light Tier, DC 10, minor fatigue)."
    level_2: "Routine Porridge Rations - Standard 2,000 kcal rations; cold winter mud; damp grain drying (Moderate Tier, DC 13 Survival, 2d8 damage/spoilage)."
    level_3: "Spring Hunger Gap & Weevil Infestation - Stored grain moldy; rations halved to 1,000 kcal; DC 16 Fortitude/Survival, 4d10 starvation/blight damage."
    level_4: "Catastrophic Seed-Corn Famine - Seed grain eaten; draft oxen slaughtered; bread riots; DC 20 Survival, 8d12 lethal famine/dispersion."
  threat_clocks:
    spring_hunger_gap_clock: "Spring Hunger Gap Clock [4 Ticks] - Ticks each week stored cellars run low without spring greens; full clock triggers Level 4 Famine."
    root_rot_blight_meter: "Cellar Root-Rot Blight Meter [4 Ticks] - Ticks during flooded thaws or rodent infiltration; spoils 25% of stored tubers per tick."
  yields_resource: "Dryland Grain Bushels, Winter Root Tubers, Salt-Pork Rations"
---

# The Subsistence Agrarian Perimeter and Root Cellars (`T0-DOM-01`)
> **Industry Chain**: `CHAIN-SUBSISTENCE` (Stage 1: `extraction`)
*Domain: DOM-01 Food & Caloric Subsistence | Pipeline Tier: 0 (Baseline Substratum) | Set: Set A*

## 1. Architectural Overview & Operational Loop
Every pre-industrial settlement across the pointcrawl graph is anchored by an immutable caloric law: **the 3-mile transport horizon**. Beyond a 3-mile radius, the draft oxen hauling grain, turnip carts, and manure consume more calories in transit than their wagons deliver to market. Across the open fields, village reeves pool household oxen into heavy eight-ox plow teams, raise timber granaries on mushroom staddle stones against damp and rats, and brace against the late-winter hunger gap before green oats mature. A viable settlement of 200 to 500 souls relies on three core agricultural subsystems:

```
          +----------------------------------------------+
          |          THE 3-MILE AGRARIAN HORIZON         |
          +----------------------+-----------------------+
                                 |
         +-----------------------+-----------------------+
         v                       v                       v
[THE THREE-FIELD CYCLE]    [THE ROOT CELLAR VAULTS]   [THE MANURE & MUCK CORE]
* Autumn wheat/rye field   * Subterranean sand beds   * Composted cattle dung
* Spring oats/peas field   * Smoked salt-pork hooks   * Night-soil enrichment
* Fallow pasture clover    * Straw root ventilation   * 2,000 kcal/day balance
```

* **The Three-Field Rotation Perimeter**: Arable ground is divided into three equal sectors: one planted with winter crops (wheat, rye), one planted with spring nitrogen-fixers (peas, lentils, oats), and one left fallow to recover fertility under grazed livestock.
* **Subterranean Dry-Stone Root Cellars**: Dug 8 to 12 feet into well-drained hillsides beneath fieldstone lintels. Layered with dry sand and pine sawdust, these cellars preserve thousands of pounds of beets, turnips, cabbage heads, parsnips, and smoked lard at a steady 38 to 45 degrees F (3 to 7 degrees C).
* **The Spring "Hunger Gap"**: The structural crisis of all pre-industrial subsistence occurs between late winter and early summer. Autumn grain bins are empty or tainted with weevil grubs, while the green spring oats have not yet formed ears. During this 6-week window, human survival depends on wild field dandelion greens, nettle broth, and carefully metered cellars.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[3, 2, 2]` - **Agrarian Subsistence** (`Clan`).
- **Sociological Rationale**: Traditional agrarian village cooperation prioritizing seasonal survival and communal storage across shared three-field plow strips and hillside cellars.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Granary Bailiff Godric"
  role: "Communal Seed-Corn Guardian"
  disposition: "[2, 3, 1]"
  motivation: "Strictly guard the village seed-corn against premature winter consumption regardless of immediate hunger."
- name: "Sharecropper Marha"
  role: "Fallow-Field Tenant Insurgent"
  disposition: "[3, 1, 3]"
  motivation: "Break the granary locks to feed her starving children before spring planting begins."
- name: "Miller Osmund"
  role: "Watermill Multure Holder & Grain Speculator"
  disposition: "[2, 3, 2]"
  motivation: "Skim disputed multure grain into dry mill-tower lofts and exchange winter flour loans for tenant field mortgages."
- name: "Hayward Wulfric"
  role: "Hedgerow Keeper & Pasture Pound-Master"
  disposition: "[3, 2, 2]"
  motivation: "Keep stray swine out of young winter wheat strips and levy pinfold fines before boundary quarrels turn bloody."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Granary Bailiff Godric
role: Communal Seed-Corn Guardian
motivation: Strictly guard the village seed-corn against premature winter consumption regardless of immediate hunger.
disposition: [2, 3, 1]
```
```text
name: Sharecropper Marha
role: Fallow-Field Tenant Insurgent
motivation: Break the granary locks to feed her starving children before spring planting begins.
disposition: [3, 1, 3]
```
```text
name: Miller Osmund
role: Watermill Multure Holder & Grain Speculator
motivation: Skim disputed multure grain into dry mill-tower lofts and exchange winter flour loans for tenant field mortgages.
disposition: [2, 3, 2]
```
```text
name: Hayward Wulfric
role: Hedgerow Keeper & Pasture Pound-Master
motivation: Keep stray swine out of young winter wheat strips and levy pinfold fines before boundary quarrels turn bloody.
disposition: [3, 2, 2]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Dryland Grain Bushel** (`Commodity`): kiln-dried winter wheat or barley sealed in woven willow sacks inside raised staddle-stone granaries against damp and mice.
- **Granary Iron Padlock & Staddle Plinth** (`Tool`): wrought lockbox hasp and carved stone mushroom footings protecting next season's seed-corn from hunger raids and vermin.
- **Sand-Bedded Winter Root Tubers** (`Commodity`): parsnips, turnips, cabbages, and smoked salt-pork sides stacked in dry sawdust at cellar depth to survive hard frosts.
- **Hayward's Pinfold Horn** (`Tool`): brass-bound cow-horn blown along field balks to summon neighbors when breached hedges let livestock trample sprouting strips.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Caloric Subsistence Stress` (`0-10`)**: At `0-3`, root cellars stay cool and dry with full 2,000 kcal porridge and turnip rations across winter. At `8-10`, spring thaws flood cellar vaults and black weevils spoil the flour bins, starving tenants smash granary padlocks to eat next year's seed-corn, and plowing oxen are slaughtered for stew unless external grain arrives.
- **Quest Hook — *The Seed-Corn Mutiny***: With the `Spring Hunger Gap Clock` at 3/4 ticks after a thaw floods half the root cellars, `Sharecropper Marha` rallies forty tenants with flails to storm the staddle granary at dusk while `Miller Osmund` quietly offers flour only in exchange for strip deeds; the party must help `Granary Bailiff Godric` and `Hayward Wulfric` broker an emergency ration or secure safe hedgerow forage before blood spills and planting seed vanishes.

### 4.1 4-Level Dynamic Dial: Caloric Subsistence Stress

* **Level 1 (Bountiful Cellars & Threshing / Light Severity Tier - DC 10):**
  * *Condition:* Cellars packed with root vegetables; livestock wintered safely; granary bins sealed against vermin.
  * *Mechanics:* Characters resting within the settlement gain +1 temporary hit point per rest and automatically succeed on mundane survival sustenance checks. Minor maintenance requires a **DC 10 Athletics or Nature check** to thresh grain or repair root cellar thatch flues.
* **Level 2 (Routine Porridge Rations / Moderate Severity Tier - DC 13):**
  * *Condition:* Normal winter draw; standard 2,000 kcal rations (oat porridge, salt-pork rind, boiled turnip).
  * *Mechanics:* Foraging or purchasing food requires normal market rates. Weather delays or spoiled bins force a **DC 13 Survival or Constitution check**; failure inflicts **2d8 non-lethal starvation strain damage** or depletes 1 unit of party provisions.
* **Level 3 (Spring Hunger Gap & Weevil Infestation / Severe Severity Tier - DC 16):**
  * *Condition:* Root cellars empty except for sprouting, bitter potatoes; flour bins infested with black weevils; rations slashed to 1,000 kcal/day; villagers forage roadside nettles.
  * *Mechanics:* All physical rest recoveries are halved unless the party supplies fresh meat or grain. Mediating bread lines or foraging wild roots requires a **DC 16 Fortitude or Survival check**; failure inflicts **4d10 bludgeoning/poison exhaustion damage** from tainted meal or civil unrest.
* **Level 4 (Catastrophic Seed-Corn Famine / Lethal Climax Tier - DC 20):**
  * *Condition:* Granary locks smashed; seed-corn eaten; draft oxen and plow mules slaughtered for stew; bread riots erupt across muddy lanes; families abandon stone cottages to wander frozen roads.
  * *Mechanics:* Complete caloric collapse. Surviving in the settlement without external emergency relief requires a **DC 20 Survival or Fortitude check** every 24 hours; failure inflicts **8d12 lethal starvation damage**. All economic trade and labor cease permanently as the settlement dissolves into a ghost hamlet.

### 4.2 Segmented Threat Clocks

```
[ ][ ][ ][ ] Spring Hunger Gap Clock (4 Ticks)
[ ][ ][ ][ ] Cellar Root-Rot Blight Meter (4 Ticks)
```

* **Spring Hunger Gap Clock [4 Ticks]:**
  * *Trigger:* Ticks forward (+1) each campaign week between late winter and the first barley harvest when external supply edges are severed or blocked.
  * *Escalation:*
    * *Tick 1:* Dairy cows stop producing milk; cheese presses run dry.
    * *Tick 2:* Village council enacts strict rationing; tavern closes; beggars congregate at granary doors.
    * *Tick 3:* Granary Bailiff is assaulted; tenant farmers eat their winter seed-grain.
    * *Consequence when full (4/4):* Triggers **Dial Level 4: Catastrophic Seed-Corn Famine**.
  * *Mitigation:* Sponsoring a grain caravan, hunting 500 lbs of venison, or negotiating aid from a neighboring satellite node clears 1 tick.
* **Cellar Root-Rot Blight Meter [4 Ticks]:**
  * *Trigger:* Ticks forward (+1) during unseasonal torrential thaws, river flooding, or rodent burrowing into underground cellar vaults.
  * *Consequence when full (4/4):* 100% of stored root tubers rot into foul, toxic black slurry, instantly advancing the Spring Hunger Gap Clock by +2 ticks.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** No hard `requires` dependencies (self-sufficient baseline agricultural substratum), though three inferred bridge edges feed harvest yields: `Tool: Iron plowshares` from **The Weekly Barter Square and Village Blacksmith (`T0-DOM-05`)**, `Material: Composted manure` from **The Midden Trenches, Swine Scavengers & Night-Soil Pit (`T0-DOM-07`)**, and `Livestock: Draft-Animals` from **Pasture Ranch (`FARM-CATTLE-01`)**.
* **Output Transmission:** Produces `Food: Baseline-Subsistence-Rations` as a standalone settlement end product with no hard `requires` consumers, and transmits an inferred bridge carrying `Food: Subsistence grain base` into **Open-Field Wheat Farm (`FARM-WHEAT-01`)**.
* **Settlement Scale & Dual-Mode UX:** Mandatory caloric anchor on all rural satellite nodes (`Thorps`, `Hamlets`, `Villages`), and paired via 1 to 2 transit edges to any **Sovereign Hub** with population above 5,000 where severing supply advances famine clocks. In "Smooth Generic" mode it satisfies node food needs with zero bookkeeping; in "Granular Mode" socketing `Food: Baseline-Subsistence-Rations` feeds downstream levies or foundries (`CWT-015`, `CWT-060A`).

## 6. Vague Game Hazards
* **Ergot & Weevil Grain Spoilage:** Milling damp or blighted winter rye causes stomach cramps, hallucinations, and nausea ($2\text{d}6$ poison damage, Fortitude DC 14).
* **Flooded Root-Cellar Collapse:** Spring thaw water undermining dry-stone cellar lintels drops saturated earth and rotting tubers on trapped workers ($3\text{d}6$ bludgeoning damage, Reflex DC 14).
* **Desperate Granary Riot:** Hungry sharecroppers wielding flails and scythes clash around locked seed bins during the hunger gap ($2\text{d}8$ bludgeoning damage and panic across the square).

## 7. Thematic Premise & Syllogism

* **The Stasis / The Lie**: "The earth will yield its daily bread through our sweat alone; as long as we sow in autumn and reap in harvest, no prince or dragon can starve a working family."
* **The Crucible / Conflict**: Late spring frost combined with an upstream border army burning outer hayricks exhausts the village's root stores; the village elder discovers mold in the seed-corn bins while hungry children cry for gruel.
* **Dramatic Syllogism**:
  $$\text{Fragile 3-Mile Caloric Margin} + \text{Unseasonal Frost / Factional Grain Levies} = \text{Desperate Seed-Corn Consumption \& Imminent Settlement Extinction}$$
* **The Truth / Synthesis**: High-concept kingdoms and arcane spires rest entirely upon the precarious bottom tier of root tubers and dried peas. If the mundane caloric baseline cracks, civilization dissolves into famished anarchy within twenty-one days.

## 8. Truby 4-Corner Opposition Web

```
               [THE ESTABLISHMENT]
              Communal Granary Bailiff
       (Guards the seed-corn with an iron bill;
        measures porridge flour by the thimble;
        forbids slaughtering milk goats)
                        ^
                        |
                        | (Ration Discipline)
                        |
                        v
[THE ZEALOT OPPONENT]  <-- (Food Scarcity) -->  [THE THEMATIC SHADOW]
Fallow-Field Sharecropper                      Grain Speculator Miller
(Demands cracking the emergency               (Hoards dry barley in hidden lofts,
 seed-bins to feed sick infants;               demands land deeds for grain,
 organizes nighttime root cellar raids)        sells flour adulterated with chalk)
                        ^                                   ^
                        |                                   |
                        | (Survival Autarky)                | (Black Market Grain)
                        |                                   |
                        v                                   v
                   [THE TERTIARY OUTCAST]
                Hedgerow Forager & Swine-Herder
            (Roams wild bramble margins;
             digs pig-nuts, acorn meal, and wild leeks;
             refuses to live within village ditches)
```

* **Corner 1: The Establishment (Communal Granary Bailiff):** A weathered elder appointed by the village council to safeguard the seed-corn. Armed with an oak staff and an iron lockbox containing the bin keys, they will let elderly relatives die of hunger before allowing a single bushel of planting grain to be ground into winter bread.
* **Corner 2: The Zealot Opponent (Fallow-Field Sharecropper):** A desperate tenant farmer with five starving children. Convinced that God will provide spring rain if the village shows mercy today, they rally younger laborers to break the granary chains and distribute the grain immediately.
* **Corner 3: The Thematic Shadow (Grain Speculator Miller):** The watermill owner who skims 15% off every sack ground into meal. Hoarding grain in an elevated, dry stone tower, they offer loans of flour in exchange for future harvest mortgages, quietly acquiring ownership of the settlement's most fertile acres.
* **Corner 4: The Tertiary Outcast (Hedgerow Forager & Swine-Herder):** An illiterate vagrant who lives in a turf hovel along the forest margin with twelve half-wild razorback swine. Knowing which roots are nourishing and which are deadly nightshade, they hold the secret wild calories that can save the hamlet if approached with respect.

## 9. Scene Calculus & Tactical Spatial Encounters

* **Encounter 1: The Granary Lock Breach (Arrival Collision)**
  * *Collision ($><$):* The party arrives at the muddy village square at dusk just as forty hungry tenant farmers armed with threshing flails and scythes surround the heavy timber granary, where the Granary Bailiff and three sons stand on the loading platform with cocked crossbows.
  * *Polarity Shift ($+ \to -$):* The party looks for a warm meal and dry stable, but is thrust into an armed standoff where defending the law means starving children, and letting the crowd break the locks means extinguishing next season's harvest.
  * *Bifocal Subtext:* The Bailiff shouts stern legal warnings about royal property and hanging offenses, but his hands tremble violently on his crossbow stock because he recognizes his own cousins in the front rank of the mob.
* **Encounter 2: The Sinking Turnip Sledge (The Severance Dilemma)**
  * *Dilemma:* An ox-drawn sledge carrying the last 800 lbs of winter root tubers from an outlying storage cellar breaks through thin river ice at the ford. The two draft oxen are thrashing in icy water, dragging the food down into deep mud. The party must decide whether to jump into freezing current (**DC 13 Athletics**) to cut the beasts free, or haul on the ropes (**DC 16 Strength**) to save the grain sack before the icy river sweeps the hamlet's survival away.
* **Encounter 3: The Hedgerow Forager's Poison Root (The Outcast Route)**
  * *Outcast Route:* Following the tracks of desperate children foraging in the deep brambles, the party discovers the Hedgerow Forager boiling a steaming iron cauldron of hemlock and wild nightshade tubers to remove toxic sap. The forager offers to teach the party the secret leaching technique, unlocking emergency rations for the settlement, but demands the party recover their confiscated hunting hounds from the bailiff's kennel.

## 10. Authoritative Specifications & Cross-References
* **Baseline Substratum Standard**: Governed by [Tier 0 Substratum SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/tier_0_substratum_srd.md).
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Hazard Tiers**: Governed by [Universal Adventure Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
