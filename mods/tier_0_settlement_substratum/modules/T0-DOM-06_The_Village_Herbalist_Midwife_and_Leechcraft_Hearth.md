---
id: T0-DOM-06
title: "The Village Herbalist, Midwife & Leechcraft Hearth"
pipeline_tier: 0
target_set: "Set E"
set: "Set E (Factions & Societal Tensions)"
category: "Chemicals_and_Reagents"
tier: "Tier 0 (Baseline Settlement Substratum)"
culture_quadrant: Clan
operational_profile: Forage / Heal
mtg_color: "Green"
chain_id: "CHAIN-FRONTIER"
chain_stage: 1
chain_role: "extraction"
provides: ["Health: Folk-Leechcraft-and-Midwifery"]
requires: []
node_prerequisites:
  botanicals: Hedgerow Willow Bark, Marsh Yarrow, and Elderberry Gathering Beds
  sanctuary: Smokey Cottage Herb-Drying Rafters and Boiling Copper Kettles
  aquatic: Cool Springwater Medicinal Leeches and Split-Ash Bone Splints
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

# The Village Herbalist, Midwife & Leechcraft Hearth (`T0-DOM-06`)
> **Industry Chain**: `CHAIN-FRONTIER` (Stage 1: `extraction`)
*Domain: DOM-06 Health, Folk Medicine & Midwifery | Pipeline Tier: 0 (Baseline Substratum) | Set: Set E*

## 1. Architectural Overview & Operational Loop
In pre-industrial campaign settings, there are no clerical miracle-workers casting *Cure Light Wounds* on every sick child or blistered plowman. Mundane survival against dysentery, broken femur fractures, and maternal mortality rests entirely in the hands of **the village midwife and herbalist hearth**. Guarding their empirical reputation under watchful church scrutiny, midwives boil linen cloths, press ergot labor teas, set limbs with split ash, and fend off quack mercury peddlers. Operating from a smokey wattle-and-daub cottage hung with dried roots, this mundane health system relies on three traditional practices:

```
          +----------------------------------------------+
          |       FOLK LEECHCRAFT & MIDWIFERY CORE       |
          +----------------------+-----------------------+
                                 |
         +-----------------------+-----------------------+
         v                       v                       v
[THE DRYING HERB RAFTERS]   [THE CERAMIC LEECH JARS]  [THE CHILD-BED STEAM HEARTH]
* Bundled willow bark       * Wetland Hirudo leeches  * Boiling copper kettles
* Crushed yarrow flowers    * Fresh springwater jars  * Steamed flax linen cloths
* Dried elderberry & garlic * Boiled bone-set splints * Herbal labor teas
```

* **The Drying Rafters & Hedgerow Foraging**: A skilled elder collects healing herbs from roadside hedgerows and marshes: *willow bark* (drawn in hot infusions for pain and inflammatory fever), *yarrow flowers* (crushed to staunch hemorrhage in deep scythe cuts), *marsh mallow roots* (steeped for soothing chest coughs), and *honey-garlic rubs* for festering puncture wounds.
* **The Glazed Leech Jars & Bone-Setting Splints**: Two dozen medicinal leeches kept in cool well-water jars, used to draw stagnant blood and reduce swelling around crushed ankles and livestock kicks. Alongside these sit split-ash splints and rawhide binding bands used to immobilize broken limbs until bone callus forms.
* **The Childbed Steam Hearth**: Midwifery is the sacred demographic engine of the settlement. Using boiling thyme water, warm hearth bricks wrapped in fleece, and measured rye-ergot draughts to arrest childbed flooding, the midwife ensures the community's next generation survives birth.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[3, 2, 3]` - **Folk Healing** (`Clan`).
- **Sociological Rationale**: Compassionate community care and folk botanical midwifery sustaining seasonal childbirth, wound triage, and domestic quarantine.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Elder Midwife Gwendolyn"
  role: "Village Healer & Birth Attendant"
  disposition: "[3, 3, 2]"
  motivation: "Keep every childbed linen boiled and the yarrow bundles dry on the rafters, because another childbed fever loss turns the parish elders against her hearth and costs her the grain tithe that keeps her fed through winter."
- name: "Quack Apothecary Phineas"
  role: "Itinerant Mercury Peddler"
  disposition: "[1, 4, 1]"
  motivation: "Exploit rural health panics by selling expensive, toxic mercury elixirs to desperate villagers."
- name: "Marsh-Herbalist Morwen"
  role: "Exiled Mold-Poultice & Antiseptic Forager"
  disposition: "[4, 2, 3]"
  motivation: "Gather blister-beetles and cultivate blue barley bread mold in marsh crocks to break sepsis before witch-fear reaches her shack."
- name: "Leech-Gatherer Swithin"
  role: "Fen Collector & Linen Boiler"
  disposition: "[3, 2, 2]"
  motivation: "Wade icy reeds to supply living leeches and chop firewood for the childbed copper kettle in return for winter meal."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Elder Midwife Gwendolyn
role: Village Healer & Birth Attendant
motivation: Keep every childbed linen boiled and the yarrow bundles dry on the rafters, because another childbed fever loss turns the parish elders against her hearth and costs her the grain tithe that keeps her fed through winter.
disposition: [3, 3, 2]
```
```text
name: Quack Apothecary Phineas
role: Itinerant Mercury Peddler
motivation: Exploit rural health panics by selling expensive, toxic mercury elixirs to desperate villagers.
disposition: [1, 4, 1]
```
```text
name: Marsh-Herbalist Morwen
role: Exiled Mold-Poultice & Antiseptic Forager
motivation: Gather blister-beetles and cultivate blue barley bread mold in marsh crocks to break sepsis before witch-fear reaches her shack.
disposition: [4, 2, 3]
```
```text
name: Leech-Gatherer Swithin
role: Fen Collector & Linen Boiler
motivation: Wade icy reeds to supply living leeches and chop firewood for the childbed copper kettle in return for winter meal.
disposition: [3, 2, 2]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Dried Willow Bark & Yarrow Bundle** (`Reagent`): cured willow bark for joint fevers paired with crushed yarrow blossoms to staunch deep harvest cuts.
- **Glazed Ceramic Leech Crock** (`Tool`): perforated stoneware jar housing two dozen medicinal leeches in cool spring water to bleed bruised sprains.
- **Boiled Flax Linen & Split-Ash Splint** (`Tool`): fire-sterilized dressing rolls and padded ash wood staves kept beside the midwife's hearth for fractures and births.
- **Fermented Blue-Mold Barley Poultice** (`Reagent`): brackish marsh-cured mold paste used cautiously to arrest gangrenous puncture sepsis when herbs fail.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Folk Healthcare Integrity` (`0-10`)**: At `0-3`, rafters hang thick with dry willow bark and yarrow, boiled flax dressings stay spotless, and fevers break in a day. At `8-10`, winter frosts strip hedgerows bare while black-tongue typhus rides in with travelers, panicked crowds stone isolation huts or trust mercury charlatans, and two in five villagers perish without antiseptic care.
- **Quest Hook — *The Mercury Peddler's Fever***: With the `Contagious Pestilence Outbreak Meter` at 3/4 ticks after a sick carter collapses near the tavern, `Elder Midwife Gwendolyn` is fighting a double breach birth with empty yarrow jars while `Quack Apothecary Phineas` sells poisoned lead-sugar cordials to frightened fathers; the party must guard the pest-hut quarantine with `Leech-Gatherer Swithin` and wade out to `Marsh-Herbalist Morwen` for clean antiseptic mold poultices before midnight mob torches light.

### 4.1 4-Level Dynamic Dial: Folk Healthcare Integrity

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

### 4.2 Segmented Threat Clocks

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

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** No hard `requires` dependencies (wild hedgerow alkaloids and domestic kettles operate autonomously), while an inferred textile bridge draws `Textile: Linen-Cloth` from **Handloom Linen Weaver (`IND-FLAX-03`)** for clean steamed childbed and surgical dressings.
* **Output Transmission:** Produces `Health: Folk-Leechcraft-and-Midwifery` as a settlement end product with no hard `requires` consumers, and transmits two inferred bridges: `Medicine: Folk herbal base` into **Spagyric Apothecary & Quarantine Lazaretto (`IND-APOTH-01`)** and `Health: Leechcraft` into **The Ditch-and-Palisade with Town Watch Bailiff (`T0-DOM-04`)**.
* **Settlement Scale & Dual-Mode UX:** Essential demographic and attrition infrastructure across all settlement nodes, and buffered adjacent to swamp, ruin, or battlefield routes. In "Smooth Generic" mode it clears routine sickness with zero accounting; in "Granular Mode" `Health: Folk-Leechcraft-and-Midwifery` satisfies medical prerequisites for parish garrisons (`T0-DOM-04`) and remote mining camps.

## 6. Vague Game Hazards
* **Quack Mercury & Lead Cordial:** Peddled cure-alls burn gut linings and induce convulsions rather than breaking fever ($2\text{d}8$ poison damage, Medicine or Fortitude DC 14).
* **Pest-Hut Typhus Contagion:** Unmasked attendance in crowded fever hovels transmits black-tongue infection through fleas and soiled straw ($3\text{d}6$ disease exhaustion, Fortitude DC 15).
* **Ergot Tea Hemorrhage:** Mismeasured rye-ergot labor draughts over-contract vessels and plunge weakened patients into delirium ($2\text{d}6$ necrotic/bludgeoning strain, Medicine DC 14).

## 7. Thematic Premise & Syllogism

* **The Stasis / The Lie**: "Our mothers' remedies have carried our clan through a hundred winters; as long as the herbs dry on the rafters, simple blood and honest prayer will cure any fever."
* **The Crucible / Conflict**: An unseasonal summer drought withers the wetland yarrow beds; simultaneously, an infected traveler collapses at the tavern with black-tongue typhus, and the settlement's sole midwife is bitten by a rabid badger while gathering elderberries.
* **Dramatic Syllogism**:
  $$\text{Fragile Botanical Medicine Margins} + \text{Infectious Typhus Outbreak / Dried Herb Shortage} = \text{Uncontrollable Rural Pestilence \& Paralyzed Demographic Continuity}$$
* **The Truth / Synthesis**: High-level adventurers worry about magical curses and dragon breath, but mundane settlements are constantly on the brink of being wiped out by a single rusted nail or an untreated childbed infection. The herbalist's boiling kettle is the fragile wall between human life and silent graveyards.

## 8. Truby 4-Corner Opposition Web

```
               [THE ESTABLISHMENT]
              Parish Elder Midwife
       (Weathered grandmother with silver shears;
        demands absolute obedience in sickrooms;
        strictly quarantines infected travelers)
                        ^
                        |
                        | (Empirical Quarantine)
                        |
                        v
[THE ZEALOT OPPONENT]  <-- (Healing Feud) -->  [THE THEMATIC SHADOW]
Wandering Faith-Healer Peddler               Quack Apothecary & Arsenic Dealer
(Condemns herbalism as witchcraft;           (Sells expensive colored sugar pills;
 sells holy blessed water and relics;         prescribes toxic mercury and arsenic;
 encourages breaking quarantine for prayers)  demands gold jewelry from dying elders)
                        ^                                   ^
                        |                                   |
                        | (Fanatical Relics)                | (Predatory Charlatanism)
                        |                                   |
                        v                                   v
                   [THE TERTIARY OUTCAST]
                Hedgerow Witch & Leper Hermit
            (Disfigured outcast living in the marsh;
             grows toxic nightshade and moldy bread poultices;
             understands mold poultices and wound-cleansing decoctions)
```

* **Corner 1: The Establishment (Parish Elder Midwife):** A sharp-tongued matriarch who has delivered every soul in the valley under forty. Enforcing strict boiling of linen and isolating cough victims in outer barns, she brooks no nonsense from church deacons or panic-stricken fathers.
* **Corner 2: The Zealot Opponent (Wandering Faith-Healer Peddler):** A fanatic monk or charismatic pilgrim carrying a carved saint's femur bone. Preaching that illness is the divine punishment for unpaid parish tithes, they urge crowds to gather in crowded chapel vigils, inadvertently supercharging the spread of airborne contagion.
* **Corner 3: The Thematic Shadow (Quack Apothecary & Arsenic Dealer):** A suave merchant with a velvet coat and locked medicine chest. Arriving from the sovereign capital, they sell glittering "Elixirs of Life" adulterated with lead sugar and mercury, bleeding dying families of their last silver coins while their patients vomit blood.
* **Corner 4: The Tertiary Outcast (Hedgerow Witch & Leper Hermit):** A solitary elder banished to the salt marsh on suspicion of witchcraft. Cultivating blue mold on stale barley bread for wound poultices and collecting blister-beetles for counter-irritant salves, they possess practical wound-healing lore that orthodox villagers fear.

## 9. Scene Calculus & Tactical Spatial Encounters

* **Encounter 1: The Childbed Complication at Midnight (Arrival Collision)**
  * *Collision ($><$):* Arriving in the village looking for an herbalist to heal a party member's infected wound, the party is dragged into the midwife's cottage where a young farm mother is hemorrhaging during a breach delivery, and the midwife has run out of dried ergot and yarrow.
  * *Polarity Shift ($+ \to -$):* The party enters asking for help, but is immediately forced to provide clean water, steady the screaming mother (**DC 13 Athletics/Medicine**), or sprint to the marsh to gather emergency yarrow roots before the woman bleeds out.
* **Encounter 2: The Torched Pest-Hovel (The Severance Dilemma)**
  * *Dilemma:* A hysterical mob of villagers armed with pitchforks and torches surrounds a poor woodcutter's hovel where two fever-stricken children are coughing black phlegm. The mob intends to burn the house down with the family inside to stop the contagion. The party must decide whether to stand against the mob (**DC 16 Intimidation/Combat**) to enforce a humane quarantine, or assist in sealing the doors to protect the wider settlement.
* **Encounter 3: The Hedgerow Witch's Moldy Bread Cure (The Outcast Route)**
  * *Outcast Route:* To cure an otherwise fatal blood poisoning without high-tier magic, the party journeys into the marsh to seek the Leper Hermit, who requires them to ingest a foul poultice of blue-mold barley porridge (**DC 13 Fortitude check** to suppress gagging), successfully breaking the sepsis.

## 10. Authoritative Specifications & Cross-References
* **Baseline Substratum Standard**: Governed by [Tier 0 Substratum SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/tier_0_substratum_srd.md).
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Hazard Tiers**: Governed by [Universal Adventure Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
