---
id: T0-DOM-04
title: "The Ditch-and-Palisade with Town Watch Bailiff"
pipeline_tier: 0
target_set: "Set C"
set: "Set C (Governance & Hierarchy)"
tier: "Tier 0 (Baseline Settlement Substratum)"
culture_quadrant: "Hierarchy / Parish Defense"
mtg_color: "White"
provides: ["Defense: Local-Palisade-and-Watch"]
requires: ["Material: Hewn-Log-Stakes", "Social: Able-Bodied-Militia"]
standalone_fallback: "If timber palisades rot or the bailiff's watch dissolves, the hamlet retreats into a central fortified stone church tower or communal barn, barricading doorways with oak tables and sounding brass alarm horns; petty marauders loot outer gardens, but residents survive sieges up to 7 days before surrender."
injected_mechanics:
  output_dial:
    level_1: "Vigilant Gatehouse & Manned Horn-Post - Gate barred at sundown; watch horn signals every 2 hours; DC 10 Perception/Insight (Light Tier, DC 10)."
    level_2: "Sleepy Night Watch & Smuggler Gaps - Gate left unlatched for late carts; minor contraband; DC 13 Stealth/Intimidation (Moderate Tier, DC 13, 2d8 damage/theft)."
    level_3: "Rotted Stakes & Marauder Infiltration - Gaps in the ditch; wolf packs and night-bandits enter outer lanes; DC 16 Reflex/Perception, 4d10 combat/ambush damage."
    level_4: "Torched Gatehouse & Settlement Plunder - Gate burned down; bailiff slain; raiders plunder houses; DC 20 Survival/Athletics, 8d12 lethal combat/conflagration damage."
  threat_clocks:
    palisade_decay_clock: "Palisade Decay & Timber Rot Clock [4 Ticks] - Ticks in damp seasons without replacement pine stakes; creates breached gaps in perimeter."
    marauder_assembly_meter: "Bandit & Wolf Assembly Meter [4 Ticks] - Ticks when outer patrols fail or carcasses draw beasts; triggers coordinated night assault."
  yields_resource: "Sharpened Pine Stakes, Communal Billhooks, Perimeter Alarm Horns"
---

# T0-DOM-04: The Ditch-and-Palisade with Town Watch Bailiff
*Domain: DOM-04 Peacekeeping & Perimeter Defense | Pipeline Tier: 0 (Baseline Substratum) | Set: Set C*

---

### 1. Mechanical Architecture & Perimeter Reality

Peacekeeping in a pre-industrial hamlet does not mean a standing army of knights; it means twelve sleep-deprived tenant farmers armed with rusty billhooks, taking turns standing watch on an earthen embankment in the freezing rain. This mundane defense layer protects against roving wolves, hungry deserters, cattle rustlers, and petty bandit gangs (CR 1/8 to 1/2) through three low-cost engineering components:

```
                  ┌──────────────────────────────────────────────┐
                  │       DITCH-AND-PALISADE DEFENSE CORE        │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
    [THE V-SHAPED BERM DITCH]  [THE HEWN-LOG STAKE WALL]  [THE BAILIFF WATCH-HORN]
    • 6-foot-deep dry trench   • Fire-hardened oak stakes • Iron-barred timber gate
    • Thorny blackthorn brush  • Interwoven wicker hurdles• Communal horn roster
    • Up-cast earthen revetment• Arrow-loop timber platform• 12-man parish militia
```

* **The V-Shaped Earthen Trench & Berm**: Dug 6–8 feet deep and 10 feet wide around the settlement perimeter. The excavated soil is thrown inward to create an elevated earthen rampart (*berm*), planted thickly with thorny blackthorn and brambles to snag intruders.
* **The Fire-Hardened Log Palisade**: 10-foot sharpened pine and oak poles driven into the crest of the rampart, lashed together with wild hemp cordage and backed by an elevated plank walkway where watchmen can patrol.
* **The Bailiff’s Gatehouse & Alarm Horn**: A single heavy two-leaf oak gate, barred from within with a 4-inch square timber bar. Above the gate hangs a cow-horn or bronze hand-bell capable of sounding two distinct calls: *Curfew* (safe, gate closing) and *The Bray* (breach, grab billhooks).

---

### 2. Thematic Premise & Syllogism

* **The Stasis / The Lie**: "Our sharpened logs and watchful neighbors are enough to keep evil outside our ditch; as long as the gate is barred, the wild darkness cannot touch our hearths."
* **The Crucible / Conflict**: A wet autumn rots ten yards of the eastern palisade into spongy mulch; simultaneously, a band of twenty battle-hardened mercenaries discharged from a distant war makes camp in the woods two miles away.
* **Dramatic Syllogism**:  
  $$\text{Amateur Peasant Militia} + \text{Rotted Perimeter Stakes / Professional Bandit Marauders} = \text{Terrifying Night Breach \& Bloody Hamlet Plunder}$$
* **The Truth / Synthesis**: A wooden wall is only as solid as the courage of the sleepy farmer standing atop it. When discipline slips, the ditch becomes an earthen grave for those who believed sharpened wood could replace constant vigilance.

---

### 3. Truby 4-Corner Opposition Web

```
                       [THE ESTABLISHMENT]
                      Parish Town Watch Bailiff
               (Former soldier with limp;
                enforces nightly curfews strictly;
                demands 1 watch shift weekly from every hearth)
                               ▲
                               │
                               │ (Martial Conscription)
                               │
                               ▼
    [THE ZEALOT OPPONENT]             ◄── (Watch Feud) ──►              [THE THEMATIC SHADOW]
  Insurgent Smuggler Freeman                                          Mercenary Free-Company Captain
 (Refuses curfew; leaves side gate                                    (Encamped in forest edge;
  unlatched to haul untaxed cider;                                     demands protection money in silver,
  accuses bailiff of acting like a feudal lord)                        promising to \"spare the thatch\")
                               ▲                                                           ▲
                               │                                                           │
                               │ (Contraband Defiance)                                     │ (Extortion Siege)
                               │                                                           │
                               ▼                                                           ▼
                                   [THE TERTIARY OUTCAST]
                               Disgraced Deserter & Trapper
                            (Lives in brush outside the ditch;
                             knows wolf trails and bandit ambushes;
                             despised by both villagers and bandits)
```

* **Corner 1: The Establishment (Parish Town Watch Bailiff):** A scarred veteran who survived a frontier war and returned home to organize his neighbors. Rigorous and humorless, they drill awkward farm boys with ash spears every Sunday after church, fining anyone who falls asleep on watch three days' wages.
* **Corner 2: The Zealot Opponent (Insurgent Smuggler Freeman):** A prosperous yeoman farmer who views the curfew as tyrannical interference. Running unlicensed cider and cured pork past the ditch at midnight, they deliberately leave side-wicket gates unlatched and encourage youth to defy the bailiff's horn.
* **Corner 3: The Thematic Shadow (Mercenary Free-Company Captain):** A ruthless captain leading eighteen dismounted lancers. Camping just outside the village's legal parish boundary, they offer "protective escort contracts" to the elders, subtly hinting that refusals will result in mysteriously torched hayricks.
* **Corner 4: The Tertiary Outcast (Disgraced Deserter & Trapper):** A mute woodsman living in an earthen burrow beneath the rootball of a fallen oak outside the palisade. Setting iron pit-traps for wolves, they spot raiding parties hours before the village watch, but refuse to speak unless paid in salt and bread.

---

### 4. Injected Tabletop Mechanics & Runtime Primitives

#### 4.1 4-Level Dynamic Dial: Perimeter Security

* **Level 1 (Vigilant Gatehouse & Manned Horn-Post / Light Severity Tier - DC 10):**  
  * *Condition:* Gate barred at sunset; torches burning on corner posts; watchmen awake; horn sounds on the hour.
  * *Mechanics:* Sneaking past the perimeter or spotting suspicious movement requires a **DC 10 Stealth or Perception check**. Roving beasts and petty thieves are automatically repelled.
* **Level 2 (Sleepy Night Watch & Smuggler Gaps / Moderate Severity Tier - DC 13):**  
  * *Condition:* Watchmen dozing in gatehouse; side wicket unlatched; minor thefts of poultry or tools.
  * *Mechanics:* Bribing the guard or slipping through the ditch requires a **DC 13 Persuasion or Stealth check**. Hostile tracking requires a **DC 13 Survival check**; failure causes **2d8 damage or loss of 1 pack mule**.
* **Level 3 (Rotted Stakes & Marauder Infiltration / Severe Severity Tier - DC 16):**  
  * *Condition:* 30 feet of wooden palisade rotted and leaning; outer raiders slip inside at night to torch outbuildings and steal horses; panic in the streets.
  * *Mechanics:* Surviving an ambush inside the settlement requires a **DC 16 Reflex or Athletics check**; failure inflicts **4d10 slashing/bludgeoning combat damage**. Shoring the collapsed wall requires a **DC 16 Craft or Athletics check**.
* **Level 4 (Torched Gatehouse & Settlement Plunder / Lethal Climax Tier - DC 20):**  
  * *Condition:* Raiders smash the gate with a battering log and pitch torches into the thatch; the bailiff is dead on the rampart; commoners barricaded inside the burning church.
  * *Mechanics:* Total defensive collapse. Escaping the burning settlement or breaking the raider cordon requires a **DC 20 Combat or Athletics check**; failure inflicts **8d12 lethal fire/weapon damage**. The settlement is sacked and depopulated.

#### 4.2 Segmented Threat Clocks

```
[ ][ ][ ][ ] Palisade Decay & Timber Rot Clock (4 Ticks)
[ ][ ][ ][ ] Bandit & Wolf Assembly Meter (4 Ticks)
```

* **Palisade Decay & Timber Rot Clock [4 Ticks]:**  
  * *Trigger:* Ticks forward (+1) during heavy rains or flood seasons without active woodcutting and stake replacement.
  * *Consequence when full (4/4):* Creates an open 20-foot breach in the perimeter, immediately advancing the Bandit Assembly Meter by +2 ticks.
* **Bandit & Wolf Assembly Meter [4 Ticks]:**  
  * *Trigger:* Ticks forward (+1) whenever local patrols are canceled, livestock carcasses are left outside ditches, or travelers report smoke in nearby forests.
  * *Mitigation:* Leading an active counter-patrol or eliminating bandit scouts via a **DC 16 Survival/Combat check** clears 1 tick.

---

### 5. Scene Calculus & Tactical Spatial Encounters

* **Encounter 1: The Horn in the Fog (Arrival Collision)**  
  * *Collision ($><$):* Approaching the village gate at twilight through thick river fog, the party is suddenly halted by the frantic bray of the alarm horn; three panicked watchmen loose crossbow bolts blindly through the fog, mistaking the party for the raider band that killed the shepherd an hour ago.
  * *Polarity Shift ($+ \to -$):* The party seeks shelter and food, but is caught in a friendly-fire crossfire with paranoid commoners screaming from the ramparts.
* **Encounter 2: The Firebrand on the Gate Timber (The Severance Dilemma)**  
  * *Dilemma:* During a midnight assault, five raiders wedge a pitch-soaked burning wagon against the outer face of the heavy oak gate. The party must choose whether to jump down into the muddy ditch (**DC 16 Athletics**) to fight the raiders hand-to-hand and extinguish the wagon, or retreat to the church tower, letting the gate burn and sacrificing the outer houses.
* **Encounter 3: The Deserter’s Wolf-Pit Crossing (The Outcast Route)**  
  * *Outcast Route:* To flank an enemy encirclement without being spotted from the road, the Deserter guides the party through hidden narrow paths between concealed wolf-pits and punji stakes (**DC 13 Survival/Acrobatics**), emerging directly into the enemy camp's rear.

---

### 6. GM Placement, Settlement Scale & Topological Synergies

* **Recommended Placement:**
  * **Border Satellite Nodes & Waypoints**: Essential perimeter defense for frontier villages vulnerable to wilderness hazards.
  * **Sovereign Hub Satellite Shield**: Outpost nodes buffering a central Hub against early raider pressure.
* **Topological Synergies:**
  * **Dual-Mode UX**: In "Smooth Generic" mode, provides baseline security against low-level wilderness encounters. In "Granular Mode", outputs `Defense: Local-Palisade-and-Watch`, fulfilling prerequisites for trade squares (`T0-DOM-05`) or tax collection offices.

---

### 7. Authoritative Specifications & Cross-References
* **Baseline Substratum Standard**: Governed by [Tier 0 Substratum SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/tier_0_substratum_srd.md).
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Hazard Tiers**: Governed by [Universal Adventure Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
