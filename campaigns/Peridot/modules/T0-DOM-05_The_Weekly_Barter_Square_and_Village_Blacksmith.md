---
id: T0-DOM-05
title: "The Weekly Barter Square and Village Blacksmith"
pipeline_tier: 0
target_set: "Set A"
set: "Set A (Infrastructure & Engineering)"
tier: "Tier 0 (Baseline Settlement Substratum)"
culture_quadrant: "Market / Village Barter"
mtg_color: "Red"
provides: ["Economy: Baseline-Mundane-Smithy-and-Trade"]
requires: ["Material: Scrap-Iron-Billets", "Fuel: Hardwood-Charcoal"]
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

# T0-DOM-05: The Weekly Barter Square and Village Blacksmith
*Domain: DOM-05 Trade, Barter & Mundane Craft | Pipeline Tier: 0 (Baseline Substratum) | Set: Set A*

---

### 1. Mechanical Architecture & Mundane Craft Reality

Pre-industrial economies do not run on shiny gold coins; ordinary peasants may go five years without seeing a single silver piece. Mundane survival is held together by two physical institutions: **the charcoal-fired village forge** and **the weekly open-air barter square**. These systems keep draft oxen working and allow households to exchange non-storable surpluses (eggs, fresh milk, churned butter) for durable staples (salt, homespun linen, iron nails):

```
                  ┌──────────────────────────────────────────────┐
                  │       VILLAGE MUNDANE CRAFT & EXCHANGE       │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
    [THE CHARCOAL SMITHY FORGE]  [THE OPEN BARTER CROSS]  [THE MEASURING SCALES]
    • Double-chamber leather tuyère • Central granite cross• Dressed limestone standard
    • Cast-iron anvil and horn  • Bushel baskets & sacks  • Iron yard-wand rod
    • Recycled plowshares/nails • Butter crocks & fleeces • Notched wooden tally-sticks
```

* **The Charcoal Smithy**: The technological beating heart of agriculture. A blacksmith does not forge legendary swords; they shoe sixteen plow horses every week, weld fractured iron plowshares, forge scythe blades, and draw nails from scrap iron billets. A settlement without a smith loses 40% of its harvesting capacity within a month due to broken cutting edges.
* **The Barter Cross & Market Square**: A cleared gravel quadrangle centered around an ancient stone boundary cross where weekly trading occurs. Transactions follow traditional conversion rates: *1 tub of butter = 2 bushels of barley = 1 pair of homespun wool breeches = 4 horseshoe nails*.
* **Standard Metrology & Tally-Sticks**: Disputes over volume are resolved at the Market Cross, where hollowed stone basins establish standard bushels and notched willow tally-sticks record seasonal credit debts between families without requiring ink or paper.

---

### 2. Thematic Premise & Syllogism

* **The Stasis / The Lie**: "Our tools are shaped from honest local iron, and an honest man can always trade butter for flour; currency and taxes are tricks for city folk."
* **The Crucible / Conflict**: The highland charcoalers burn down their kilns in a timber rebellion; no charcoal reaches the valley forge, and the village blacksmith’s last box of horseshoe nails is exhausted on the eve of the winter sowing.
* **Dramatic Syllogism**:  
  $$\text{Reliance on Recycled Mundane Iron} + \text{Charcoal Supply Severance / Broken Plowshares} = \text{Paralyzed Agricultural Labor \& Total Rural Barter Gridlock}$$
* **The Truth / Synthesis**: Without the glowing hearth of the blacksmith shaping dull iron into plowshares, rural labor reverts to sticks and bone. The entire complex food chain hinges upon twenty pounds of glowing charcoal and forty iron nails.

---

### 3. Truby 4-Corner Opposition Web

```
                       [THE ESTABLISHMENT]
                      Village Master Blacksmith
               (Massive forearms, leather apron;
                rationing scrap iron by the ounce;
                refuses to forge weapons while farm tools break)
                               ▲
                               │
                               │ (Craft Priorities)
                               │
                               ▼
    [THE ZEALOT OPPONENT]             ◄── (Market War) ──►              [THE THEMATIC SHADOW]
  Itinerant Tinker & Peddler                                          Town Coin-Clipper & Moneylender
 (Sells shoddy slag-metal pots;                                       (Demands silver coin instead of grain;
  undercuts local prices with low-grade                               charges 30% interest on iron loans;
  river copper; incites buyers against smith)                         forecloses on oxen for overdue copper debt)
                               ▲                                                           ▲
                               │                                                           │
                               │ (Counterfeit Metal)                                       │ (Predatory Usury)
                               │                                                           │
                               ▼                                                           ▼
                                   [THE TERTIARY OUTCAST]
                               Bog-Iron Smelter & Charcoaler
                            (Hermit living in mosquito-choked fen;
                             bakes low-grade spongy bloomery iron
                             from orange bog mud and willow charcoal)
```

* **Corner 1: The Establishment (Village Master Blacksmith):** A stern craftsman whose family anvil was imported two centuries ago. Dedicated to agricultural maintenance, they refuse to forge swords for adventuring vagrants or greedy bailiffs while neighbor farmers wait with cracked coulters.
* **Corner 2: The Zealot Opponent (Itinerant Tinker & Peddler):** A traveling tinker driving a gaudy yellow mule-cart filled with cheap tin whistles, brittle cast-iron kettles, and colored ribbons. Undercutting the local blacksmith, they introduce counterfeit lead-alloy nails that shear under plow strain, ruining farmers' furrows.
* **Corner 3: The Thematic Shadow (Town Coin-Clipper & Moneylender):** A visiting merchant-factor who refuses traditional bushel barter, insisting all transactions take place in debased silver coins. Offering loans of iron billets at predatory interest, they acquire ownership of village livestock when debts come due.
* **Corner 4: The Tertiary Outcast (Bog-Iron Smelter & Charcoaler):** A soot-caked hermit living in the deep wetlands where groundwater seeps orange with iron bacteria. Using primitive clay furnaces and willow charcoal, they smelt spongy iron blooms, providing the only emergency metal when trade roads are blocked.

---

### 4. Injected Tabletop Mechanics & Runtime Primitives

#### 4.1 4-Level Dynamic Dial: Craft & Barter Health

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

#### 4.2 Segmented Threat Clocks

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

---

### 5. Scene Calculus & Tactical Spatial Encounters

* **Encounter 1: The Broken Plow Coulter at the Forging Trough (Arrival Collision)**  
  * *Collision ($><$):* Arriving at the forge to shoe their horses, the party finds thirty furious farmers shouting at the blacksmith, who has just refused to shoe the bailiff's warhorse because three communal plows have cracked coulters on the eve of sowing.
  * *Polarity Shift ($+ \to -$):* Seeking quick service, the party is dragged into a bitter rural class clash where helping the bailiff gets their saddlebags slashed by commoners, and helping the farmers earns a fine from the watch.
* **Encounter 2: The Sinking Scrap-Iron Wherry (The Severance Dilemma)**  
  * *Dilemma:* A river boat carrying two tons of scrap iron and charcoal hits a snag near the village mill. The boat is sinking fast. The party must decide whether to haul the heavy iron sacks onto the bank (**DC 16 Strength/Athletics**) to save the village's tool supply, or rescue the trapped ferryman and his child from the swirling weir waters (**DC 13 Athletics**).
* **Encounter 3: The Bog-Iron Smelter’s Clay Kiln (The Outcast Route)**  
  * *Outcast Route:* To procure iron weapons or replacement axles without alerting imperial tax-collectors, the party treks into the mosquito-infested fens to assist the Bog-Iron Smelter in roasting orange wetland mud with green willow charcoal (**DC 13 Survival/Craft**).

---

### 6. GM Placement, Settlement Scale & Topological Synergies

* **Recommended Placement:**
  * **Central Village Node**: Placed in core satellite settlements connecting outlying farm hamlets to regional market towns.
  * **Trade Cross Anchors**: Sockets directly into trade edge corridors (`Set A`).
* **Topological Synergies:**
  * **Dual-Mode UX**: In "Smooth Generic" mode, automatically provides basic equipment repairs and bartered supplies. In "Granular Mode", outputs `Economy: Baseline-Mundane-Smithy-and-Trade`, satisfying requirements for fortifications (`T0-DOM-04`) and masonry (`T0-DOM-03`).

---

### 7. Authoritative Specifications & Cross-References
* **Baseline Substratum Standard**: Governed by [Tier 0 Substratum SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/tier_0_substratum_srd.md).
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Hazard Tiers**: Governed by [Universal Adventure Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
