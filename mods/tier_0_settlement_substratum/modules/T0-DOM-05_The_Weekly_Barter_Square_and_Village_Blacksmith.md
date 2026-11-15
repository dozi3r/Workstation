---
id: T0-DOM-05
title: "The Weekly Barter Square and Village Blacksmith"
pipeline_tier: 0
target_set: "Set A"
set: "Set A (Infrastructure & Engineering)"
category: "Mining_and_Metallurgy"
tier: "Tier 0 (Baseline Settlement Substratum)"
culture_quadrant: Market
operational_profile: Forge / Exchange
mtg_color: "Red"
chain_id: "CHAIN-FRONTIER"
chain_stage: 1
chain_role: "extraction"
provides: ["Economy: Baseline-Mundane-Smithy-and-Trade"]
requires: []
node_prerequisites:
  hearth: Charcoal-Fired Smithy Forge with Twin Leather Tuyere Bellows
  barter_ground: Open Gravel Square Centered on a Carved Stone Market Cross
  metrology: Hollowed Limestone Bushel Basins and Split-Hazel Tally-Sticks
standalone_fallback: "If iron scrap or charcoal supplies fail, the forge goes cold; the village reverts to wood-pegged plows, stone-sharpened scythes, and pure commodity barter (bushels of oats for wool fleeces); agricultural efficiency drops 30%, but mundane village exchanges continue without monetary currency."
injected_mechanics:
  output_dial:
    level_1: "Rhythmic Anvil & Bustling Barter Square - Forge glowing; horses shod; eggs and salt traded freely; DC 10 Persuasion/Craft (Light Tier, DC 10)."
    level_2: "Charcoal Shortage & Dull Scythe Repair - Bellows wheeze; long queue for plow repairs; DC 13 Haggling/Athletics (Moderate Tier, DC 13, 2d8 damage/delay)."
    level_3: "Iron Scrap Depletion & Broken Plowshares - No replacement iron; plows break on stones; DC 16 Insight/Intimidation, 4d10 economic/labor damage."
    level_4: "Cold Hearth & Economic Barter Gridlock - Forge cold; charcoal gone; trade ceases; tool crisis sparks agrarian riot; DC 20 Survival, 8d12 economic collapse."
  threat_clocks:
    charcoal_reserve_clock: "Charcoal Reserve Depletion Clock [4 Ticks] - Ticks when highland timber supply lines are blocked; cold hearth halts tool fabrication."
    scrap_iron_famine_meter: "Scrap Iron Famine Meter [4 Ticks] - Ticks when regional trade breaks down; villagers forced to melt domestic pots."
  yields_resource: "Forged Iron Plowshares, Draft-Horse Shoes, Hand-Woven Wool Homespun"
---

# The Weekly Barter Square and Village Blacksmith (`T0-DOM-05`)
> **Industry Chain**: `CHAIN-FRONTIER` (Stage 1: `extraction`)
*Domain: DOM-05 Trade, Barter & Mundane Craft | Pipeline Tier: 0 (Baseline Substratum) | Set: Set A*

## 1. Architectural Overview & Operational Loop
Pre-industrial economies do not run on shiny gold coins; ordinary peasants may go five years without seeing a single silver piece. Mundane survival is held together by two physical institutions: **the charcoal-fired village forge** and **the weekly open-air barter square**. Beside the stone Market Cross, clerks enforce sealed bushel standards against forestalling while blacksmiths log plowing credit across split hazelwood tally-sticks. These systems keep draft oxen working and allow households to exchange non-storable surpluses (eggs, fresh milk, churned butter) for durable staples (salt, homespun linen, iron nails):

```
          +----------------------------------------------+
          |       VILLAGE MUNDANE CRAFT & EXCHANGE       |
          +----------------------+-----------------------+
                                 |
         +-----------------------+-----------------------+
         v                       v                       v
[THE CHARCOAL SMITHY FORGE]  [THE OPEN BARTER CROSS]  [THE MEASURING SCALES]
* Double-chamber tuyere     * Central granite cross   * Dressed limestone basin
* Cast-iron anvil and horn  * Bushel baskets & sacks  * Iron yard-wand rod
* Recycled plowshares/nails * Butter crocks & fleeces * Notched wooden tallies
```

* **The Charcoal Smithy**: The technological beating heart of agriculture. A blacksmith does not forge legendary swords; they shoe sixteen plow horses every week, weld fractured iron plowshares, forge scythe blades, and draw nails from scrap iron billets. A settlement without a smith loses 40% of its harvesting capacity within a month due to broken cutting edges.
* **The Barter Cross & Market Square**: A cleared gravel quadrangle centered around an ancient stone boundary cross where weekly trading occurs. Transactions follow traditional conversion rates: *1 tub of butter = 2 bushels of barley = 1 pair of homespun wool breeches = 4 horseshoe nails*.
* **Standard Metrology & Tally-Sticks**: Disputes over volume are resolved at the Market Cross, where hollowed stone basins establish standard bushels and notched willow tally-sticks record seasonal credit debts between families without requiring ink or paper.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[2, 3, 2]` - **Village Barter** (`Market`).
- **Sociological Rationale**: Pragmatic market exchange and guild-regulated artisan trade maintaining iron plow repairs, standard weights, and seasonal tally credit.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Master Blacksmith Orson"
  role: "Village Forge Master"
  disposition: "[2, 3, 2]"
  motivation: "Prioritize essential agricultural plowshares and horse-shoeing over adventuring weapon requests."
- name: "Itinerant Tinker Jorah"
  role: "Scrap Metal Peddler"
  disposition: "[3, 2, 3]"
  motivation: "Undercut local forge prices with low-grade imported tin and alloyed trade trinkets."
- name: "Market-Clerk Matilda"
  role: "Weights-and-Measures Inspector & Tally Keeper"
  disposition: "[2, 3, 2]"
  motivation: "Guard the limestone bushel basins at the Market Cross against forestallers and short-weight loaves before market riots break out."
- name: "Bog-Smelter Folke"
  role: "Fenland Bloomery Iron & Charcoal Hermit"
  disposition: "[3, 1, 4]"
  motivation: "Smelt spongy iron blooms from orange marsh ore to buy winter bacon while avoiding royal excise tax-gatherers."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Master Blacksmith Orson
role: Village Forge Master
motivation: Prioritize essential agricultural plowshares and horse-shoeing over adventuring weapon requests.
disposition: [2, 3, 2]
```
```text
name: Itinerant Tinker Jorah
role: Scrap Metal Peddler
motivation: Undercut local forge prices with low-grade imported tin and alloyed trade trinkets.
disposition: [3, 2, 3]
```
```text
name: Market-Clerk Matilda
role: Weights-and-Measures Inspector & Tally Keeper
motivation: Guard the limestone bushel basins at the Market Cross against forestallers and short-weight loaves before market riots break out.
disposition: [2, 3, 2]
```
```text
name: Bog-Smelter Folke
role: Fenland Bloomery Iron & Charcoal Hermit
motivation: Smelt spongy iron blooms from orange marsh ore to buy winter bacon while avoiding royal excise tax-gatherers.
disposition: [3, 1, 4]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Welded Iron Plowshare & Coulter** (`Tool`): wrought farm cutting blade and sod-knife drawn out of salvaged iron billets to keep eight-ox plow teams turning clay furrows.
- **Paired Split-Hazel Tally-Stick** (`Tool`): notched willow or hazel baton split lengthwise into creditor stock and debtor foil to settle seasonal forge debts without coin.
- **Market-Cross Limestone Bushel Basin** (`Tool`): carved civic volume measure chained beside the stone cross to catch short measures and adulterated meal.
- **Wrought Horseshoe Nail Keg** (`Commodity`): forty square-shanked wrought iron nails kept dry beside the quenching trough for teamsters and cartwrights.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Craft & Barter Health` (`0-10`)**: At `0-3`, charcoal bins stand heaped beside a roaring hearth, sixteen plow horses get fresh shoes weekly, and butter trades cleanly by notched tallies. At `8-10`, highland charcoal stalls and iron scrap vanishes, brittle counterfeit alloy snaps mid-furrow, and moneylenders foreclose on plow oxen while brawls erupt around empty market stalls.
- **Quest Hook — *The Cold Hearth on Sowing Eve***: With the `Charcoal Reserve Depletion Clock` at 3/4 ticks and winter sowing forty hours off, `Master Blacksmith Orson` refuses to shoe bailiff mounts ahead of three snapped plow coulters while `Itinerant Tinker Jorah` dumps brittle slag-iron blades beside the Market Cross; the party must work with `Market-Clerk Matilda` to audit fraudulent stalls and venture into the wetlands to help `Bog-Smelter Folke` deliver an emergency iron bloom and willow charcoal load before planting fails.

### 4.1 4-Level Dynamic Dial: Craft & Barter Health

* **Level 1 (Rhythmic Anvil & Bustling Square / Light Severity Tier - DC 10):**
  * *Condition:* Charcoal kiln full; forge glowing yellow; horses shod; barter rates stable at the stone cross.
  * *Mechanics:* Repairing armor, shoeing mounts, or replenishing mundane tools takes 1 hour and costs standard barter trade goods. Minor negotiations require a **DC 10 Persuasion or Craft check**.
* **Level 2 (Charcoal Shortage & Dull Scythe Repair / Moderate Severity Tier - DC 13):**
  * *Condition:* Low charcoal reserves; forge operates only two days per week; farmers waiting in line for tool welding.
  * *Mechanics:* Tool repairs take 1d4 days. Haggling for scarce horseshoe nails requires a **DC 13 Persuasion or Haggling check**; failure causes **2d8 equipment or travel delay damage**.
* **Level 3 (Iron Scrap Depletion & Broken Plowshares / Severe Severity Tier - DC 16):**
  * *Condition:* Scrap iron bins empty; villagers forced to melt domestic pots and iron pot-hooks; broken plowshares abandon unseeded fields.
  * *Mechanics:* Mundane equipment that suffers breakage cannot be repaired without sourcing external billets. Mediating angry market disputes requires a **DC 16 Insight or Intimidation check**; failure causes **4d10 labor damage** and closes market stalls.
* **Level 4 (Cold Hearth & Economic Barter Gridlock / Lethal Climax Tier - DC 20):**
  * *Condition:* The forge is dead cold; charcoal completely gone; moneylenders seize plow oxen; violence breaks out at the market cross over rotten grain; economic activity freezes.
  * *Mechanics:* Complete economic collapse. Procuring essential tools or resolving violent riots requires a **DC 20 Persuasion or Combat check**; failure inflicts **8d12 economic/riot damage**. The settlement loses 50% of its productive workforce to migration.

### 4.2 Segmented Threat Clocks

```
[ ][ ][ ][ ] Charcoal Reserve Depletion Clock (4 Ticks)
[ ][ ][ ][ ] Scrap Iron Famine Meter (4 Ticks)
```

* **Charcoal Reserve Depletion Clock [4 Ticks]:**
  * *Trigger:* Ticks forward (+1) each week mountain timber passes are blockaded, or during persistent torrential rain extinguishing charcoal burn-mounds.
  * *Consequence when full (4/4):* Forge goes out, immediately advancing the Scrap Iron Famine Meter by +2 ticks.
* **Scrap Iron Famine Meter [4 Ticks]:**
  * *Trigger:* Ticks forward (+1) each month trade caravans bypass the node or regional bandits intercept copper/iron carters.
  * *Mitigation:* Smelting bog iron with the wetland outcast, or salvaging battlefield armor via a **DC 16 Mining/Craft check** clears 1 tick.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** No hard `requires` dependencies (tally-stick barter persists even without coinage), though four inferred bridges sustain full smithy fabrication: `Fuel: Charcoal` from **Charcoal Burner's Mound (`IND-CHARCOAL-01`)**, `Metal: Iron stock` from **Charcoal Bloomery and Blast Furnace (`MINE-IRON-02`)**, `Defense: Palisade and watch` from **The Ditch-and-Palisade with Town Watch Bailiff (`T0-DOM-04`)**, and `Metal: Forged-Iron` from **Blacksmith Forge (`IND-IRON-03`)**.
* **Output Transmission:** Produces `Economy: Baseline-Mundane-Smithy-and-Trade` as an end product with no hard `requires` consumers, and sends two inferred structural bridges outward: `Tool: Iron plowshares` to **The Subsistence Agrarian Perimeter and Root Cellars (`T0-DOM-01`)** and `Economy: Smithy and trade` to **Vernacular Timber, Wattle & Stone Masonry (`T0-DOM-03`)**.
* **Settlement Scale & Dual-Mode UX:** Core economic anchor on central village nodes connecting farm hamlets to regional market towns across trade corridors (`Set A`). In "Smooth Generic" mode it provides routine gear repairs and bartered provisions; in "Granular Mode" `Economy: Baseline-Mundane-Smithy-and-Trade` unlocks fortification (`T0-DOM-04`) and construction (`T0-DOM-03`) maintenance.

## 6. Vague Game Hazards
* **Forge Scale & Hearth-Spit Burns:** Pumping damp charcoal or quenching cracked iron sprays white-hot slag across crowded bystanders ($2\text{d}6$ fire damage, Reflex DC 13).
* **Shattered Slag-Iron Blade Snap:** Using brittle tinker-forged alloy on heavy sod breaks tools mid-swing and whips sharp splinters ($2\text{d}6$ slashing damage, Reflex DC 14).
* **Market-Cross Pillory Brawl:** Catching a merchant with false bushel weights ignites cudgel fights among debtors around stacked stalls ($2\text{d}8$ bludgeoning damage, Persuasion or Athletics DC 14).

## 7. Thematic Premise & Syllogism

* **The Stasis / The Lie**: "Our tools are shaped from honest local iron, and an honest man can always trade butter for flour; currency and taxes are tricks for city folk."
* **The Crucible / Conflict**: The highland charcoalers burn down their kilns in a timber rebellion; no charcoal reaches the valley forge, and the village blacksmith's last box of horseshoe nails is exhausted on the eve of the winter sowing.
* **Dramatic Syllogism**:
  $$\text{Reliance on Recycled Mundane Iron} + \text{Charcoal Supply Severance / Broken Plowshares} = \text{Paralyzed Agricultural Labor \& Total Rural Barter Gridlock}$$
* **The Truth / Synthesis**: Without the glowing hearth of the blacksmith shaping dull iron into plowshares, rural labor reverts to sticks and bone. The entire complex food chain hinges upon twenty pounds of glowing charcoal and forty iron nails.

## 8. Truby 4-Corner Opposition Web

```
               [THE ESTABLISHMENT]
              Village Master Blacksmith
       (Massive forearms, leather apron;
        rationing scrap iron by the ounce;
        refuses to forge weapons while farm tools break)
                        ^
                        |
                        | (Craft Priorities)
                        |
                        v
[THE ZEALOT OPPONENT]  <-- (Market War) -->   [THE THEMATIC SHADOW]
Itinerant Tinker & Peddler                   Town Coin-Clipper & Moneylender
(Sells shoddy slag-metal pots;               (Demands silver coin instead of grain;
 undercuts local prices with low-grade        charges 30% interest on iron loans;
 river copper; incites buyers against smith)  forecloses on oxen for overdue copper debt)
                        ^                                   ^
                        |                                   |
                        | (Counterfeit Metal)               | (Predatory Usury)
                        |                                   |
                        v                                   v
                   [THE TERTIARY OUTCAST]
                Bog-Iron Smelter & Charcoaler
            (Hermit living in mosquito-choked fen;
             bakes low-grade spongy bloomery iron
             from orange bog mud and willow charcoal)
```

* **Corner 1: The Establishment (Village Master Blacksmith):** A stern craftsman whose family anvil was imported two centuries ago. Dedicated to agricultural maintenance, they refuse to forge swords for adventuring vagrants or greedy bailiffs while neighbor farmers wait with cracked coulters.
* **Corner 2: The Zealot Opponent (Itinerant Tinker & Peddler):** A traveling tinker driving a gaudy yellow mule-cart filled with cheap tin whistles, brittle cast-iron kettles, and colored ribbons. Undercutting the local blacksmith, they introduce counterfeit lead-alloy nails that shear under plow strain, ruining farmers' furrows.
* **Corner 3: The Thematic Shadow (Town Coin-Clipper & Moneylender):** A visiting merchant-factor who refuses traditional bushel barter, insisting all transactions take place in debased silver coins. Offering loans of iron billets at predatory interest, they acquire ownership of village livestock when debts come due.
* **Corner 4: The Tertiary Outcast (Bog-Iron Smelter & Charcoaler):** A soot-caked hermit living in the deep wetlands where groundwater seeps orange with bog-iron slime. Using primitive clay furnaces and willow charcoal, they smelt spongy iron blooms, providing the only emergency metal when trade roads are blocked.

## 9. Scene Calculus & Tactical Spatial Encounters

* **Encounter 1: The Broken Plow Coulter at the Forging Trough (Arrival Collision)**
  * *Collision ($><$):* Arriving at the forge to shoe their horses, the party finds thirty furious farmers shouting at the blacksmith, who has just refused to shoe the bailiff's warhorse because three communal plows have cracked coulters on the eve of sowing.
  * *Polarity Shift ($+ \to -$):* Seeking quick service, the party is dragged into a bitter rural class clash where helping the bailiff gets their saddlebags slashed by commoners, and helping the farmers earns a fine from the watch.
* **Encounter 2: The Sinking Scrap-Iron Wherry (The Severance Dilemma)**
  * *Dilemma:* A river boat carrying two tons of scrap iron and charcoal hits a snag near the village mill. The boat is sinking fast. The party must decide whether to haul the heavy iron sacks onto the bank (**DC 16 Strength/Athletics**) to save the village's tool supply, or rescue the trapped ferryman and his child from the swirling weir waters (**DC 13 Athletics**).
* **Encounter 3: The Bog-Iron Smelter's Clay Kiln (The Outcast Route)**
  * *Outcast Route:* To procure iron weapons or replacement axles without alerting imperial tax-collectors, the party treks into the mosquito-infested fens to assist the Bog-Iron Smelter in roasting orange wetland mud with green willow charcoal (**DC 13 Survival/Craft**).

## 10. Authoritative Specifications & Cross-References
* **Baseline Substratum Standard**: Governed by [Tier 0 Substratum SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/tier_0_substratum_srd.md).
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Hazard Tiers**: Governed by [Universal Adventure Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
