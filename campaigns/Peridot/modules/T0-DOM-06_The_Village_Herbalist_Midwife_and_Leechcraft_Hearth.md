---
id: T0-DOM-06
title: "The Village Herbalist, Midwife & Leechcraft Hearth"
pipeline_tier: 0
target_set: "Set E"
set: "Set E (Factions & Societal Tensions)"
tier: "Tier 0 (Baseline Settlement Substratum)"
culture_quadrant: "Clan / Folk Healing"
mtg_color: "Green"
provides: ["Health: Folk-Leechcraft-and-Midwifery"]
requires: ["Ecology: Wild-Hedgerow-Botanicals"]
standalone_fallback: "If medicinal herbs run out or the midwife dies, the community relies on boiled onion poultices, pine-needle tea, and elder hearth vigils; non-magical disease recovery slows by 50% and infant mortality climbs, but basic domestic care prevents immediate depopulation."
injected_mechanics:
  output_dial:
    level_1: "Dried Willow Bark & Clean Bandages - Boiled yarrow tea; linen dressings; fever broken in 24 hours; DC 10 Medicine/Nature (Light Tier, DC 10)."
    level_2: "Childbed Fever & Yarrow Salve Shortage - Complicated delivery; rusty shears; minor infection; DC 13 Medicine/Survival (Moderate Tier, DC 13, 2d8 damage/exhaustion)."
    level_3: "Gangrene Wounds & Tainted Leech Jar - Leeches die in swamp water; open farm wounds fester; DC 16 Fortitude/Medicine, 4d10 gangrene/toxic damage."
    level_4: "Black-Tongue Pestilence & Torched Pest-Hut - Contagion sweeps lanes; herbalist dies; quarantine hut burned; DC 20 Survival/Medicine, 8d12 lethal plague damage."
  threat_clocks:
    herbal_reserve_depletion_clock: "Hedgerow Herbal Exhaustion Clock [4 Ticks] - Ticks in winter or drought when hedgerows freeze; cuts healing potency by half."
    village_pestilence_meter: "Contagious Pestilence Outbreak Meter [4 Ticks] - Ticks when open wounds go untreated or swamp miasma spreads; triggers quarantine panic."
  yields_resource: "Dried Willow Bark Bundles, Yarrow Wound-Salve, Clean Boiled Linen Rolls"
---

# T0-DOM-06: The Village Herbalist, Midwife & Leechcraft Hearth
*Domain: DOM-06 Health, Folk Medicine & Midwifery | Pipeline Tier: 0 (Baseline Substratum) | Set: Set E*

---

### 1. Mechanical Architecture & Folk Medicine Reality

In pre-industrial campaign settings, there are no clerical miracle-workers casting *Cure Light Wounds* on every sick child or blistered plowman. Mundane survival against dysentery, broken femur fractures, and maternal mortality rests entirely in the hands of **the village midwife and herbalist hearth**. Operating from a smokey wattle-and-daub cottage hung with dried roots, this mundane health system relies on three traditional practices:

```
                  ┌──────────────────────────────────────────────┐
                  │       FOLK LEECHCRAFT & MIDWIFERY CORE       │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
    [THE DRYING HERB RAFTERS]   [THE CERAMIC LEECH JARS]  [THE CHILD-BED STEAM HEARTH]
    • Bundled willow bark (fever)• Wetland Hirudo leeches   • Boiling copper kettles
    • Crushed yarrow (hemostasis)• Fresh springwater storage• Steamed flax linen cloths
    • Dried elderberry & garlic  • Boiled bone-setting splints• Herbal labor teas
```

* **The Drying Rafters & Hedgerow Foraging**: A skilled elder collects botanical alkaloids from roadside hedgerows and marshes: *willow bark* (salicin for pain and inflammatory fever), *yarrow flowers* (achilleine for stopping hemorrhage in deep scythe cuts), *marsh mallow roots* (mucilage for hacking chest coughs), and *honey-garlic rubs* for septic puncture wounds.
* **The Glazed Leech Jars & Bone-Setting Splints**: Two dozen medicinal leeches kept in cool well-water jars, used to draw stagnant blood and reduce swelling around crushed ankles and livestock kicks. Alongside these sit split-ash splints and rawhide binding bands used to immobilize broken limbs until bone callus forms.
* **The Childbed Steam Hearth**: Midwifery is the sacred demographic engine of the settlement. Using boiling thyme water, warm hearth bricks wrapped in fleece, and ergometrine-rich rye ergot teas to arrest postpartum bleeding, the midwife ensures the community's next generation survives birth.

---

### 2. Thematic Premise & Syllogism

* **The Stasis / The Lie**: "Our mothers’ remedies have carried our clan through a hundred winters; as long as the herbs dry on the rafters, simple blood and honest prayer will cure any fever."
* **The Crucible / Conflict**: An unseasonal summer drought withers the wetland yarrow beds; simultaneously, an infected traveler collapses at the tavern with black-tongue typhus, and the village’s only midwife is bitten by a rabid badger while gathering elderberries.
* **Dramatic Syllogism**:  
  $$\text{Fragile Botanical Medicine Margins} + \text{Infectious Typhus Outbreak / Dried Herb Shortage} = \text{Uncontrollable Rural Pestilence \& Paralyzed Demographic Continuity}$$
* **The Truth / Synthesis**: High-level adventurers worry about magical curses and dragon breath, but mundane settlements are constantly on the brink of being wiped out by a single rusted nail or an untreated childbed infection. The herbalist's boiling kettle is the fragile wall between human life and silent graveyards.

---

### 3. Truby 4-Corner Opposition Web

```
                       [THE ESTABLISHMENT]
                      Parish Elder Midwife
               (Weathered grandmother with silver shears;
                demands absolute obedience in sickrooms;
                strictly quarantines infected travelers)
                               ▲
                               │
                               │ (Empirical Quarantine)
                               │
                               ▼
    [THE ZEALOT OPPONENT]             ◄── (Healing Feud) ──►            [THE THEMATIC SHADOW]
  Wandering Faith-Healer Peddler                                      Quack Apothecary & Arsenic Dealer
 (Condemns herbalism as witchcraft;                                   (Sells expensive colored sugar pills;
  sells holy blessed water and relics;                                prescribes toxic mercury and arsenic;
  encourages breaking quarantine for prayers)                         demands gold jewelry from dying elders)
                               ▲                                                           ▲
                               │                                                           │
                               │ (Fanatical Relics)                                        │ (Predatory Charlatanism)
                               │                                                           │
                               ▼                                                           ▼
                                   [THE TERTIARY OUTCAST]
                               Hedgerow Witch & Leper Hermit
                            (Disfigured outcast living in the marsh;
                             grows toxic nightshade and moldy bread poultices;
                             understands deep antibacterial antiseptics)
```

* **Corner 1: The Establishment (Parish Elder Midwife):** A sharp-tongued matriarch who has delivered every soul in the valley under forty. Enforcing strict boiling of linen and isolating cough victims in outer barns, she brooks no nonsense from church deacons or panic-stricken fathers.
* **Corner 2: The Zealot Opponent (Wandering Faith-Healer Peddler):** A fanatic monk or charismatic pilgrim carrying a carved saint's femur bone. Preaching that illness is the divine punishment for unpaid parish tithes, they urge crowds to gather in crowded chapel vigils, inadvertently supercharging the spread of airborne contagion.
* **Corner 3: The Thematic Shadow (Quack Apothecary & Arsenic Dealer):** A suave merchant with a velvet coat and locked medicine chest. Arriving from the sovereign capital, they sell glittering "Elixirs of Life" adulterated with lead sugar and mercury, bleeding dying families of their last silver coins while their patients vomit blood.
* **Corner 4: The Tertiary Outcast (Hedgerow Witch & Leper Hermit):** A solitary elder banished to the salt marsh on suspicion of witchcraft. Cultivating blue mold on stale barley bread (*proto-penicillin*) and collecting blister-beetles for counter-irritant salves, they possess genuine antiseptic knowledge that orthodox villagers fear.

---

### 4. Injected Tabletop Mechanics & Runtime Primitives

#### 4.1 4-Level Dynamic Dial: Folk Healthcare Integrity

* **Level 1 (Dried Willow Bark & Clean Bandages / Light Severity Tier - DC 10):**  
  * *Condition:* Rafters full of herbs; clean boiled linen available; fevers broken within 24 hours.
  * *Mechanics:* Characters recovering from mundane illnesses or wounds make resting saves with advantage. Brewing healing teas requires a **DC 10 Medicine or Nature check**.
* **Level 2 (Childbed Fever & Salve Shortage / Moderate Severity Tier - DC 13):**  
  * *Condition:* Yarrow salves depleted; complicated births require grueling labor; mild wound infections fester.
  * *Mechanics:* Long rests restore only half hit dice unless the party provides fresh medicinal supplies. Stabilizing infected wounds requires a **DC 13 Medicine check**; failure inflicts **2d8 poison damage**.
* **Level 3 (Gangrene Wounds & Tainted Leech Jar / Severe Severity Tier - DC 16):**  
  * *Condition:* Leeches die from muddy water; surgical tools rust; farm accidents turn into septic gangrene; infant mortality spikes.
  * *Mechanics:* Natural healing ceases completely for infected characters. Performing emergency amputations or fever lancing requires a **DC 16 Medicine or Survival check**; failure inflicts **4d10 necrotic damage**.
* **Level 4 (Black-Tongue Pestilence / Lethal Climax Tier - DC 20):**  
  * *Condition:* Uncontrollable typhus contagion sweeps the settlement; the midwife dies of infection; villagers nail infected families into their cottages or burn down pest-huts in terror.
  * *Mechanics:* Catastrophic epidemiological crisis. Characters residing in the node must succeed on a **DC 20 Fortitude check** every 24 hours; failure inflicts **8d12 lethal disease damage**. 40% of the settlement population perishes within 14 days.

#### 4.2 Segmented Threat Clocks

```
[ ][ ][ ][ ] Hedgerow Herbal Exhaustion Clock (4 Ticks)
[ ][ ][ ][ ] Contagious Pestilence Outbreak Meter (4 Ticks)
```

* **Hedgerow Herbal Exhaustion Clock [4 Ticks]:**  
  * *Trigger:* Ticks forward (+1) during hard winter frosts, severe droughts, or heavy chemical runoff poisoning roadside botanicals.
  * *Consequence when full (4/4):* Medicinal stores drop to zero, reducing all healthcare checks in the node to disadvantage.
* **Contagious Pestilence Outbreak Meter [4 Ticks]:**  
  * *Trigger:* Ticks forward (+1) whenever unburied animal carcasses accumulate, floodwaters contaminate wells, or sick refugees enter without quarantine.
  * *Mitigation:* Establishing strict perimeter quarantine and burning contaminated straw bedding via a **DC 16 Medicine/Survival check** removes 1 tick.

---

### 5. Scene Calculus & Tactical Spatial Encounters

* **Encounter 1: The Childbed Complication at Midnight (Arrival Collision)**  
  * *Collision ($><$):* Arriving in the village looking for an herbalist to heal a party member's infected wound, the party is dragged into the midwife's cottage where a young farm mother is hemorrhaging during a breach delivery, and the midwife has run out of dried ergot and yarrow.
  * *Polarity Shift ($+ \to -$):* The party enters asking for help, but is immediately forced to provide clean water, steady the screaming mother (**DC 13 Athletics/Medicine**), or sprint to the marsh to gather emergency yarrow roots before the woman bleeds out.
* **Encounter 2: The Torched Pest-Hovel (The Severance Dilemma)**  
  * *Dilemma:* A hysterical mob of villagers armed with pitchforks and torches surrounds a woodcutter’s hovel where two fever-stricken children are coughing black phlegm. The mob intends to burn the house down with the family inside to stop the contagion. The party must decide whether to stand against the mob (**DC 16 Intimidation/Combat**) to enforce a humane quarantine, or assist in sealing the doors to protect the wider settlement.
* **Encounter 3: The Hedgerow Witch’s Moldy Bread Cure (The Outcast Route)**  
  * *Outcast Route:* To cure an otherwise fatal blood poisoning without high-tier magic, the party journeys into the marsh to seek the Leper Hermit, who requires them to ingest a foul poultice of blue-mold barley porridge (**DC 13 Fortitude check** to suppress gagging), successfully breaking the sepsis.

---

### 6. GM Placement, Settlement Scale & Topological Synergies

* **Recommended Placement:**
  * **All Settlement Nodes**: Essential health infrastructure supporting local populations against attrition.
  * **Hazard Edge Buffering**: Placed adjacent to swamp, toxic ruin, or battlefield nodes to treat wounded travelers.
* **Topological Synergies:**
  * **Dual-Mode UX**: In "Smooth Generic" mode, handles disease recovery automatically without GM accounting. In "Granular Mode", outputs `Health: Folk-Leechcraft-and-Midwifery`, fulfilling requirements for military garrisons (`T0-DOM-04`) and mining camps.

---

### 7. Authoritative Specifications & Cross-References
* **Baseline Substratum Standard**: Governed by [Tier 0 Substratum SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/tier_0_substratum_srd.md).
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Hazard Tiers**: Governed by [Universal Adventure Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
