---
creator_source: "Chill Dude Explains"
tags: ["chill_dude", "civilizations_and_collapse"]
id: CWT-060A
title: "The Cypriot Copper Smelting Slag Foundries"
pipeline_tier: 3
target_set: "Set A"
set: "Set A (Infrastructure & Engineering)"
tier: "Tier 3 (Crucible Workshops & Resource Refineries)"
culture_quadrant: "Hierarchy / Industrial Extraction"
mtg_color: "Red / Black"
provides: ["Mineral: Refined-Copper-Ingots", "Industry: Blast-Furnace-Crucibles"]
requires: ["Fuel: Highland-Charcoal-Timber", "Labor: Conscripted-Slag-Workers"]
standalone_fallback: "If timber shipments cease, furnaces run on scrub brush, lowering output by 80% and spewing toxic sulfur fumes that inflict Light respiratory penalties on the settlement."
injected_mechanics:
  output_dial:
    level_1: "Sulfur Smog & Respiratory Cough - Continuous furnace roasting fills valley with acrid sulfur haze (Light Tier, DC 10 Constitution, minor friction/fatigue)."
    level_2: "Charcoal Scarcity & Furnace Throttling - Timber runs out; green scrub lowers smelting temperatures; production halved (Moderate Tier, DC 13 Crafting/Athletics, 2d6 bludgeoning/burn damage or resource cost)."
    level_3: "Arsenical Gas Surge & Timber Insurrection - Rotten ore releases toxic arsenical vapors; charcoalers ambush convoys (Severe Tier, DC 16 Fortitude, 4d6 poison damage, lasting harm)."
    level_4: "Catastrophic Slag Breach & Molten Cascade - Retaining walls fail; 1,200°C molten slag river floods settlement (Lethal Climax Tier, DC 20 Reflex, 8d10 lethal fire damage)."
  threat_clocks:
    highland_deforestation: "Highland Deforestation Horizon Clock [6 Ticks] - Ticks each production cycle timber quotas are enforced without replanting; when full, timber hits 0 and foundries go cold."
    crucible_slag_pressure: "Crucible Slag Pressure Breach Clock [4 Ticks] - Ticks whenever maintenance checks are skipped or green timber is burned to force speed; when full, triggers Dial Level 4 molten wall breach."
  yields_resource: "Standardized Oxhide Copper Ingots, Blast-Furnace Crucibles, Toxic Slag Hazardous Runoff"
---

# MODULE CWT-060A: THE CYPRIOT COPPER SMELTING SLAG FOUNDRIES

### 1. Mechanical Architecture & Industrial Grounding
Drawing from the Bronze Age smelting complexes of the eastern Mediterranean (analogous to Enkomi, Kition, and the foothills of the Troodos mountains), this module models the industrial crucible where raw chalcopyrite ore is roasted, melted, and cast into standardized 30-kilogram "oxhide ingots." Built with four curved corner handles to permit transport by pack animal or two bearers, these ingots form the physical currency and martial foundation of imperial statecraft.

Underneath the veneer of imperial prosperity lies an unforgiving thermodynamic balance: **smelting 1 kilogram of refined copper consumes between 100 and 200 kilograms of cured hardwood charcoal**. Sustaining peak export quotas necessitates the perpetual clear-cutting of highland oak, pine, and cedar stands. Surrounding the stone foundries are artificial hills of glassy black slag accumulated over centuries—totaling millions of metric tons of toxic waste that leach arsenic, lead, and sulfur into downslope waterways.

```
       [Highland Timber Forests]
                   │
                   ▼ (150:1 Charcoal Mass Ratio)
         [Charcoal Kilns]
                   │
                   ▼
[Raw Chalcopyrite Ore] ──► [Roasting Yards (SO₂ Gas)] ──► [Blast Crucibles (1,150°C)] ──► [Oxhide Ingots (30kg)]
                                                                  │
                                                                  ▼
                                                      [Glassy Slag Heaps & Heavy Runoff]
```

* **The Calcination Roasting Beds:** Open-air terraced stone yards where raw green sulfide ore is roasted over slow brush fires for weeks to drive off sulfur. Dense, yellowish plumes of choking sulfur dioxide blanket the surrounding valley, corroding exposed metal and rotting vegetation.
* **The Blast-Furnace Crucible Battery:** Batteries of hemispherical clay-and-stone shaft furnaces lined with refractory river clay. Pairs of conscripted laborers stand atop raised benches pumping double-acting leather and clay pot-bellows through terracotta tuyères (blowpipes), driving crucible temperatures past 1,150°C.
* **The Oxhide Sand-Casting Floor:** Damp sand molds carved into the foundry floor in the shape of stretched animal hides with four protruding lugs. Tapping crews crack the furnace clay plugs, pouring glowing white-orange copper into the trenches while clearing bubbling vitreous slag with iron scrapers.
* **The Vitreous Slag Mountains:** Immense, towering black talus slopes flanking the settlement. Emitting residual heat, sulfurous steam, and heavy metal dust, these artificial ridges are prone to catastrophic collapse when soaked by mountain rainfall.

---

### 2. Dramatic Opposition Web (4-Corner Matrix)

```
        [THE ESTABLISHMENT]
      Royal Smelting Overseer
   (Enforces 24-hr shifts, guards
    oxhide ingots, clears forests)
               ▲
               │
               │ (Resource War)
               │
               ▼
   [THE ZEALOT OPPONENT]          ◄── (Class War) ──►        [THE THEMATIC SHADOW]
 Highland Charcoalers' League                             Arsenical Counterfeiters
(Blockades mountain lumber trails,                       (Spikes low-grade ore with lethal
demands triple grain, protects groves)                    arsenic to counterfeit ingot weight)
               ▲                                                      ▲
               │                                                      │
               │ (Survival Knowledge)                                 │ (Black Market)
               ▼                                                      ▼
                                  [THE TERTIARY OUTCAST]
                                 Poisoned Slag-Scavengers
                           (Neuropathy-afflicted former bellows-
                            workers trading secrets for clean water)
```

* **Corner 1: The Establishment (The Royal Smelting Overseer):**  
  Appointed by the royal treasury, the Overseer commands squads of archers and heavy spearmen. Charged with meeting relentless tribute shipments for imperial bronze armories, they view the surrounding biosphere and labor force as disposable fuel. When highland timber runs low, they order the felling of ancient sacred groves, boundary hedges, and domestic olive orchards, executing work shirkers as traitors to the crown.
* **Corner 2: The Zealot Opponent (Highland Charcoalers' League):**  
  Generations of mountain foresters who fell the timber, burn the earth-covered charcoal pits, and haul fuel down perilous gorges. Having watched their ancestral hills eroded into bare limestone scree, they have felled timber barricades across the only transit pass (Charcoal Gap). Armed with heavy felling axes and hunting bows, they demand triple grain rations and an immediate moratorium on logging watershed forests.
* **Corner 3: The Thematic Shadow (Arsenical Counterfeiters & Rogue Metallurgists):**  
  A clandestine syndicate of master smelters operating from abandoned roasting vaults. To pocket pure copper for maritime smuggling rings, they melt low-grade copper scrap blended with deadly concentrations of arsenic and lead to forge counterfeit oxhide ingots that mimic royal density. These alloyed ingots are brittle and prone to shattering upon cold working, while the vapors released during melting blind and cripple foundry hands.
* **Corner 4: The Tertiary Outcast (Poisoned Slag-Scavengers):**  
  Former bellows-conscripts and slag-breakers cast out into the smoking waste gullies once arsenic melanosis, "furnace palsy" (peripheral neuropathy), and necrotic lung rot made them incapable of heavy labor. Living in hollowed chambers beneath hot slag mounds, they scavenge copper prills from cold slag and possess unmatched knowledge of underground draft flues, weak retaining walls, and secret mountain springs. They trade intelligence and tactical passage for uncontaminated water, milk, and honey.

---

### 3. Injected Tabletop Mechanics & Runtime Primitives

#### 3.1 4-Level Dynamic Dial: The Blast-Furnace Ecological Tension
The industrial stability and ecological stress of the smelting operation are tracked along a 4-level dial strictly calibrated to Universal Hazard Tiers:

* **Level 1 (Sulfur Smog & Respiratory Cough / Light Severity Tier):**  
  * *Condition:* Normal operational roasting fills the basin with dense sulfur dioxide fumes; eyes water and bare stone surfaces turn acidic yellow.
  * *Mechanics:* Visibility across the worksite is limited to 60 feet. Characters without vinegar-soaked linen respirators must succeed on a **DC 10 Constitution check** each hour or suffer persistent coughing fits (disadvantage on Stealth checks and 1 level of minor fatigue).
* **Level 2 (Charcoal Scarcity & Furnace Throttling / Moderate Severity Tier):**  
  * *Condition:* Timber blockades halt cured charcoal shipments; overseers burn damp green logs and thorny scrub. Crucibles cannot maintain the 1,150°C threshold.
  * *Mechanics:* Ingot output speed is halved. Slag fails to separate cleanly from copper bloom; clearing clogged tuyères requires a **DC 13 Crafting or Athletics check**. Failure causes blowback that inflicts **2d6 bludgeoning/burn damage** or wastes 1 supply unit of flux. Work gangs grow mutinous (+1 Threat Tick to Deforestation Clock).
* **Level 3 (Arsenical Gas Surge & Timber Insurrection / Severe Severity Tier):**  
  * *Condition:* Counterfeiters cook high-arsenic arsenopyrite ores in open crucibles while the Charcoalers' League ambushes timber escorts with fire and arrows.
  * *Mechanics:* Toxic, garlic-scented arsenical clouds roll across the casting floors. Characters caught within must succeed on a **DC 16 Fortitude check** or suffer **4d6 poison damage**, 1 level of Exhaustion, and temporary motor palsy (speed halved for 24 hours). The foundry perimeter is an active combat zone (hostile sniper fire, burning timber wagons).
* **Level 4 (Catastrophic Slag Breach & Molten Cascade / Lethal Climax Tier):**  
  * *Condition:* Over-pressured blast crucibles fracture their fireclay linings; thermal shock ruptures stone retaining walls, releasing a thousand-ton tide of 1,200°C molten slag into the inhabited lower valley.
  * *Mechanics:* Immediate evacuation required. Escaping collapsing stonework, flying ceramic shrapnel, and liquid fire requires a **DC 20 Reflex check**. Failure inflicts **8d10 lethal fire/crushing damage** (instant incineration or structural burial). The smelting installation is permanently destroyed, poisoning the regional watershed for a generation.

#### 3.2 Segmented Threat Clocks

```
[ ][ ][ ][ ][ ][ ] Highland Deforestation Horizon Clock (6 Ticks)
[ ][ ][ ][ ]       Crucible Slag Pressure Breach Clock (4 Ticks)
```

* **Highland Deforestation Horizon Clock [6 Ticks]:**  
  * *Trigger:* Ticks forward (+1) each campaign cycle that royal timber quotas are extracted without reforestation, or when loggers are forced into watershed reserves under armed guard.
  * *Escalation Events:*  
    * *Tick 2:* Flash-floods carve gullies through logged hillsides; transit roads between forest and foundry become treacherous mud chutes.
    * *Tick 4:* Woodcutter strikes escalate; timber convoys require full military escorts, pulling garrison spearmen away from the settlement.
  * *Consequence when full (6/6):* The entire watershed forest is denuded to bare bedrock. Cured hardwood charcoal hits 0 units. Blast furnaces extinguish, copper smelting halts, and the royal palace initiates violent reprisal raids on neighboring domains for fuel.
* **Crucible Slag Pressure Breach Clock [4 Ticks]:**  
  * *Trigger:* Ticks forward (+1) whenever an 8-hour furnace maintenance inspection is skipped, green wood is burned to force speed, or cooling water spills into molten slag trenches.
  * *Escalation Events:*  
    * *Tick 1:* Terracotta tuyères crack under uneven thermal expansion; furnace drafts sputter.
    * *Tick 2:* Sub-floor foundations hiss as groundwater boils beneath overheated crucibles.
    * *Tick 3:* Deep structural fractures appear in the external stone revetment; sulfur steam vents violently through pavement cracks.
  * *Consequence when full (4/4):* Triggers **Dial Level 4: Catastrophic Slag Breach** immediately. Stone walls rupture, unleashing a molten cascade across the foundries.

---

### 4. Logistical & Resource Flow Contract

* **Input Prerequisites (`requires`):**
  * `Fuel: Highland-Charcoal-Timber`: 150 to 200 units of cured hardwood charcoal per unit of cast metal, harvested from high-elevation oak, pine, and cedar stands.
  * `Labor: Conscripted-Slag-Workers`: Continuous shifts of manual labor to pump pot-bellows, rake vitreous slag, break ore with hammerstones, and transport 30kg ingots.
* **Output Yields (`provides`):**
  * `Mineral: Refined-Copper-Ingots`: Standardized 30-kilogram oxhide ingots with four lug handles, stamped with the royal cartouche (99.2% purity, ready for bronze alloy casting).
  * `Industry: Blast-Furnace-Crucibles`: High-temperature refractory pyrotechnology capable of smelting advanced metals, casting heavy structural fittings, and firing refractory ceramics.
* **Standalone Fallback Mode:**
  * When `Fuel: Highland-Charcoal-Timber` is severed, the foundry shifts to burning dried brush, gorse, peat, and animal bone:
    * Smelting heat fails to reach copper's liquid melt phase; refined ingot production drops by **80%**.
    * Furnaces produce only brittle, spongy "black copper" blooms full of trapped slag inclusions, unusable for martial bronze casting.
    * Incomplete calcination spews persistent yellow sulfur smog over the settlement, imposing permanent **Dial Level 1 respiratory penalties** on all inhabitants.

---

### 5. Scene Calculus & Encounter Sparks

* **Encounter 1: The Weight of the Oxhide (Arrival Collision)**
  * *Collision ($><$):* As the party arrives at the foundry gates seeking to purchase refined copper or hire master smiths, the Royal Smelting Overseer marches out with an armed detachment. Imperial cargo galleys have docked at the coast demanding their quarterly tribute, and the Overseer summarily requisitions the party's beasts of burden and wagons to haul thirty 300-pound oxhide ingots.
  * *Polarity Shift ($+ \to -$):* The party enters as wealthy commercial patrons but is instantly reduced to dispossessed travelers whose essential transit assets are impounded under martial law.
  * *Bifocal Subtext:* The Overseer loudly praises the glory of the imperial sovereign and promises handsome promissory vouchers, while his eyes flick anxiously toward empty charcoal bins and the soot-blackened horizon where the charcoalers have lit signal bonfires.
* **Encounter 2: The Timber Blockade at Charcoal Gap (The Severance Crisis)**
  * *Collision ($><$):* High in the pine pass, the party encounters the Highland Charcoalers' League entrenched behind a barricade of felled ancient red pines. The charcoalers have captured a royal payroll wagon and refuse to let timber wagons pass until the Overseer signs a treaty protecting the watershed groves.
  * *The Dilemma:*  
    * *Side with the Charcoalers:* Preserve the watershed, prevent catastrophic landslides, and receive hidden caches of high-grade, un-taxed virgin copper ingots; however, this paralyzes the downstream foundries, violates royal contracts, and marks the party as outlaws.
    * *Side with the Smelting Overseer:* Clear the blockade with force or fire, securing royal patents, military escorts, and immediate ingot allocation; however, this accelerates the Deforestation Clock, dooming the valley to ecological collapse within two seasons.
* **Encounter 3: The Scavenger's Spring (Subterranean Infiltration)**
  * *Collision ($><$):* Seeking a way to bypass the guarded furnace gates or escape a toxic gas surge, the party stumbles into the subterranean warren of the Crippled Slag-Scavengers beneath the smoking talus heaps. An elder scavenger whose fingers are curled into permanent claws offers to lead them through the underground air ducts straight into the Overseer's vault—or the counterfeiters' secret arsenic cache—in exchange for two waterskins of uncontaminated mountain spring water and clean honey to soothe their ruined lungs.

---

### 6. GM Placement & Tactical Synergies

* **Recommended Placement:**
  * **Node 07 (Iron Ore Mines & Slag Heap / Mountain Foothills)**: Provides direct ore access and natural slopes for slag accumulation.
  * **Node 02 (River Waterfall & Watermill / Chokepoint)**: Can be adapted where hydraulic power is tested against manual bellow labor.
* **Topological Synergies:**
  * **Macro Network Integration**: Directly feeds `Mineral: Refined-Copper-Ingots` into `CWT-060` (The Systemic Interdependence Collapse Matrix), fulfilling its upstream requirement for `Mineral: Refined-Ingot-Supply`.
  * **Downstream Manufacturing**: Connects to `INFRA-02` (Blast Furnace & Foundry) or `CWT-043` (The Colossal Foundry of Strength & Crucible Steel) for structural casting.
  * **Thematic Tension**: Pair with `CWT-045` (Chasm Tollbridge) to create a choke point where bridge tolls must be paid in heavy oxhide copper or timber transit rights.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
