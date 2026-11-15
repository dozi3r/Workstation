---
id: T0-DOM-08
title: "The Wayside Boundary Shrine & Hearth Vigil"
pipeline_tier: 0
target_set: "Set G"
set: "Set G (Esoterica & Climax Engines)"
category: "Agriculture_and_Subsistence"
tier: "Tier 0 (Baseline Settlement Substratum)"
culture_quadrant: Clan
operational_profile: Ritualize / Bind
mtg_color: "White / Green"
chain_id: "CHAIN-FRONTIER"
chain_stage: 1
chain_role: "extraction"
provides: ["Social: Communal-Folklore-Solidarity"]
requires: []
node_prerequisites:
  landmark: Fieldstone Wayside Boundary Cairn Supporting a Carved Oak Icon
  perimeter: Parish Perambulation Stones and Ditches Mapped Across Generations
  hearth: Perpetual Winter Hearth Ember and Threshold Ward Salt Stores
standalone_fallback: "If the boundary shrine is desecrated or sacred icons are smashed, the community fractures into suspicious family enclaves; solstice feasts cease, paranoia against outsiders spikes, and characters suffer disadvantage on morale checks, but private hearth candle vigils sustain baseline social survival."
injected_mechanics:
  output_dial:
    level_1: "Sanctified Boundary Cairn & Solstice Feast - Fresh wildflowers on altar; harvest beer shared; high communal solidarity; DC 10 Performance/Insight (Light Tier, DC 10)."
    level_2: "Seasonal Hearth Vigil & Minor Omen Unease - Tallow candles lit; minor family squabbles mediated by elder; DC 13 Insight/Persuasion (Moderate Tier, DC 13, 2d8 damage/unease)."
    level_3: "Desecrated Wayside Icon & Clan Paranoia - Boundary stone toppled; ominous bird omens; neighbor accuses neighbor; DC 16 Will/Insight, 4d10 psychic/paranoia damage."
    level_4: "Weeping Blood Icon & Witch-Hunt Bloodletting - Sacred icon defaced; mass hysteria; midnight witch-hunts; DC 20 Will/Intimidation, 8d12 lethal mob violence damage."
  threat_clocks:
    sacred_taboo_violation_clock: "Sacred Taboo Desecration Clock [4 Ticks] - Ticks when outsiders violate boundary markers or ancient oaks are felled; provokes communal dread."
    clan_hysteria_paranoia_meter: "Clan Paranoia & Witch-Hunt Meter [4 Ticks] - Ticks during crop failures or unexplained deaths; triggers violent purge of scapegoats."
  yields_resource: "Carved Wooden Boundary Effigies, Blessed Solstice Honey Cakes, Hearth-Ash Ward Salt"
---

# The Wayside Boundary Shrine & Hearth Vigil (`T0-DOM-08`)
> **Industry Chain**: `CHAIN-FRONTIER` (Stage 1: `extraction`)
*Domain: DOM-08 Folklore, Shrine & Communal Rites | Pipeline Tier: 0 (Baseline Substratum) | Set: Set G*

## 1. Architectural Overview & Operational Loop
A human settlement is not merely a collection of caloric stomachs and timber roofs; it is a psychological pact against the terrifying darkness of the wild frontier. Without shared ancestral rituals, seasonal feasts, and boundary taboos, isolated hamlets succumb to claustrophobic madness, generational blood-feuds, and mutual destruction within two seasons. Spring Rogationtide perambulations imprint parish stones onto young memory with willow wands, winter solstice embers pass flame from one banked hearth to all cottages, and ostracized corpse-ritualists absorb dread at the village margin. This baseline social substratum relies on three folk mechanisms:

```
          +----------------------------------------------+
          |       COMMUNAL FOLKLORE & VIGIL FABRIC       |
          +----------------------+-----------------------+
                                 |
         +-----------------------+-----------------------+
         v                       v                       v
[THE WAYSIDE BOUNDARY CAIRN]  [THE ANNUAL PERAMBULATION]  [THE PERPETUAL HEARTH COAL]
* Dressed limestone boundary * Beating the parish bounds   * Unextinguished hearth coal
* Carved wooden folk icons   * Seasonal honey cakes        * Salt dusted on thresholds
* Wildflower offerings       * Youth boundary memory rods  * Solstice feast vigils
```

* **The Wayside Boundary Cairn**: A 6-foot pyramid of fieldstones erected at the crossroads where the parish road meets the wilderness forest. Atop the cairn sits an ancient, weather-beaten wooden icon carved from heart of oak, depicting the nameless ancestral protector who first cleared the valley. Passing travelers add a pebble to the cairn to pay respect and guarantee safe passage.
* **The Parish Perambulation ("Beating the Bounds")**: An annual spring procession where village elders, children, and priests walk the entire legal perimeter of the settlement. Young boys are gently struck with willow wands at key boundary stones and tossed into boundary ditches so they will remember the exact property lines when they are eighty years old, preventing bloody land disputes between rival clans.
* **The Perpetual Hearth Vigil & Threshold Salt**: Every family keeps a single coal burning continuously beneath ash in their hearth, rekindled each winter solstice from a communal central bonfire. Salt-ash lines are drawn across barn doorways each new moon to ward off blight, binding the community into a shared psychological fortress.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[3, 2, 3]` - **Ancestral Folk Vigil** (`Clan`).
- **Sociological Rationale**: Ancestral folk traditions, boundary perambulations, and solstice hearth vigils preserving solidarity against fear and factional scapegoating.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Parish Hearth-Elder Martha"
  role: "Ancestral Lore Keeper"
  disposition: "[3, 3, 2]"
  motivation: "Preserve boundary markers and traditional perambulation rites to prevent community factionalism."
- name: "Iconoclast Zealot Brother Malachi"
  role: "Wandering Relic Purifier"
  disposition: "[1, 4, 1]"
  motivation: "Shatter pagan wayside shrines and boundary cairns to enforce orthodox religious conformity."
- name: "Bounds-Warden Oswin"
  role: "Rogationtide Procession Steward"
  disposition: "[3, 2, 2]"
  motivation: "Walk the parish ditch every spring with peeled willow wands so rival farms never spill blood over moved stones."
- name: "Sin-Eater Eadgyth"
  role: "Ostracized Corpse-Ritualist"
  disposition: "[4, 1, 4]"
  motivation: "Absorb unquiet dead burdens for bread porridge while noting poison signs that panicked elders blame on witches."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Parish Hearth-Elder Martha
role: Ancestral Lore Keeper
motivation: Preserve boundary markers and traditional perambulation rites to prevent community factionalism.
disposition: [3, 3, 2]
```
```text
name: Iconoclast Zealot Brother Malachi
role: Wandering Relic Purifier
motivation: Shatter pagan wayside shrines and boundary cairns to enforce orthodox religious conformity.
disposition: [1, 4, 1]
```
```text
name: Bounds-Warden Oswin
role: Rogationtide Procession Steward
motivation: Walk the parish ditch every spring with peeled willow wands so rival farms never spill blood over moved stones.
disposition: [3, 2, 2]
```
```text
name: Sin-Eater Eadgyth
role: Ostracized Corpse-Ritualist
motivation: Absorb unquiet dead burdens for bread porridge while noting poison signs that panicked elders blame on witches.
disposition: [4, 1, 4]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Heart-of-Oak Boundary Effigy** (`Relic`): weathered ancestral figure perched atop the crossroads fieldstone cairn where travelers leave pebbles for safe passage.
- **Perpetual Solstice Brazier Coal** (`Relic`): banked oak ember carried from cottage to cottage each winter solstice to rekindle dead hearths under one clan pact.
- **Hearth-Ash & Coarse Ward Salt** (`Reagent`): wood ash mixed with boiled coarse salt scattered across barn thresholds on each new moon against blight and dread.
- **Peeled Willow Perambulation Wand** (`Tool`): spring-cut willow switch used during bounds-beating processions to mark boundary stones onto boys' memories.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Communal Morale & Cohesion` (`0-10`)**: At `0-3`, fresh wildflowers crown the wayside cairn, solstice hearth coals pass hand to hand, and elders settle strip disputes cleanly. At `8-10`, smashed boundary icons and dead calves split neighbors behind bolted doors, zealots incite ducking-stool purges around the millpond, and mob hysteria devours innocent scapegoats.
- **Quest Hook — *The Shattered Crossroads Cairn***: With the `Clan Paranoia & Witch-Hunt Meter` at 3/4 ticks after a noble's horse topples the oak icon and two cows dry up, `Iconoclast Zealot Brother Malachi` swings an iron hammer to finish breaking the boundary stones while a terrified mob drags the miller's daughter toward the pond; the party must help `Parish Hearth-Elder Martha` and `Bounds-Warden Oswin` restore peace or consult `Sin-Eater Eadgyth` in the abandoned kiln to expose real poison before mob hangings begin.

### 4.1 4-Level Dynamic Dial: Communal Morale & Cohesion

* **Level 1 (Sanctified Boundary Cairn / Light Severity Tier - DC 10):**
  * *Condition:* Wayside cairn intact; wildflowers fresh; seasonal solstice feast shared; high clan solidarity.
  * *Mechanics:* Characters resting in the settlement gain advantage on saves against fear, charm, or morale despair. Minor mediation requires a **DC 10 Insight or Performance check**.
* **Level 2 (Seasonal Hearth Vigil & Minor Unease / Moderate Severity Tier - DC 13):**
  * *Condition:* Tallow candles flickering; minor family squabbles over boundary fences; subtle anxiety over bad dreams.
  * *Mechanics:* Social interactions with insular commoners require a **DC 13 Persuasion or Insight check**; failure causes **2d8 social friction or minor mistrust**.
* **Level 3 (Desecrated Icon & Clan Paranoia / Severe Severity Tier - DC 16):**
  * *Condition:* Boundary stone smashed; livestock sick; families lock doors against each other; whispered accusations of hexes and curses in the tavern.
  * *Mechanics:* All social checks with villagers are made at disadvantage. Resisting mass hysteria or calming an angry gathering requires a **DC 16 Will or Intimidation check**; failure inflicts **4d10 psychic/paranoia damage**.
* **Level 4 (Weeping Blood Icon & Witch-Hunt Purge / Lethal Climax Tier - DC 20):**
  * *Condition:* The carved icon is defaced with pig blood; full-scale moral panic erupts; a howling mob drags scapegoats to the millpond to burn or drown them; civil order dissolves into mob rule.
  * *Mechanics:* Catastrophic social collapse. Defending scapegoats or escaping the lynching mob requires a **DC 20 Will, Persuasion, or Combat check**; failure inflicts **8d12 lethal bludgeoning/fire damage**. The settlement tears itself apart in bloody internecine warfare.

### 4.2 Segmented Threat Clocks

```
[ ][ ][ ][ ] Sacred Taboo Violation Clock (4 Ticks)
[ ][ ][ ][ ] Clan Paranoia & Witch-Hunt Meter (4 Ticks)
```

* **Sacred Taboo Violation Clock [4 Ticks]:**
  * *Trigger:* Ticks forward (+1) whenever sacred boundary cairns are toppled, ancestral oaks are felled for firewood, or foreigners mock local traditions.
  * *Consequence when full (4/4):* Triggers universal moral dread, advancing the Witch-Hunt Meter by +2 ticks.
* **Clan Paranoia & Witch-Hunt Meter [4 Ticks]:**
  * *Trigger:* Ticks forward (+1) with every unexplained cattle death, unseasonal frost, or rabble-rousing sermon by zealots.
  * *Mitigation:* Rebuilding the boundary cairn with the Sin-Eater or delivering an inspiring parley via a **DC 16 Insight/Performance check** clears 1 tick.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** No hard `requires` dependencies (folk customs endure on hearth ash and boundary stones alone), while two inferred supply bridges furnish ritual consumables: `Light: Tallow-Candles` from **Tallow Chandlery (`IND-CANDLE-01`)** and `Commodity: Coarse-Salt` from **Salt Boiling House & Granary (`IND-SALT-02`)**.
* **Output Transmission:** Produces `Social: Communal-Folklore-Solidarity` as an end product with no hard `requires` consumers, buffering adjacent crossroads and rural settlements against morale collapse.
* **Settlement Scale & Dual-Mode UX:** Essential psychological cohesion layer across all settlement nodes and frontier transition crossroads. In "Smooth Generic" mode it maintains baseline morale automatically; in "Granular Mode" `Social: Communal-Folklore-Solidarity` dampens fear, despair, and civil revolt clocks across neighboring nodes.

## 6. Vague Game Hazards
* **Mob Ducking-Stool Frenzy:** Panic-struck farmhands armed with pitchforks drag accused outsiders toward the swollen millpond ($2\text{d}8$ bludgeoning and drowning hazard, Intimidation or Persuasion DC 15).
* **Crossroads Iconoclast Ambush:** Fanatic purifiers swinging crowbars clash at dusk with parish youth guarding the cairn ($2\text{d}6$ bludgeoning damage, Reflex DC 13).
* **Superstitious Dread & Scapegoat Hex-Panic:** Keeping nocturnal vigils beside unburied poison victims inflicts chilling terror ($2\text{d}6$ psychic/morale strain, Will DC 14).

## 7. Thematic Premise & Syllogism

* **The Stasis / The Lie**: "Our ancestors watch over our fields from the boundary stones; as long as we place bread on the cairn and sing the solstice songs, evil can never divide neighbor from neighbor."
* **The Crucible / Conflict**: An arrogant passing noble's warhorse knocks over the sacred boundary cairn, shattering the ancient wooden protector icon; three days later, cows dry up, two infants die of sudden colic, and neighbor families begin whispering that the miller's daughter is casting hexes from her attic.
* **Dramatic Syllogism**:
  $$\text{Fragile Communal Folk Solidarity} + \text{Sacred Icon Desecration / Unexplained Hardship} = \text{Terrifying Witch-Hunt Hysteria \& Bloody Inter-Clan Purges}$$
* **The Truth / Synthesis**: Folklore and wayside shrines are not childish superstitions; they are the fragile moral mortar holding terrified people together against the abyss. When the boundary cairn is shattered, the demons that enter the settlement do not come from the forest--they awaken in the hearts of the neighbors.

## 8. Truby 4-Corner Opposition Web

```
               [THE ESTABLISHMENT]
              Parish Hearth-Elder
       (Old matriarch holding the willow wand;
        leads boundary perambulations;
        resolves family feuds through ancestral lore)
                        ^
                        |
                        | (Traditional Solidarity)
                        |
                        v
[THE ZEALOT OPPONENT]  <-- (Faith War) -->    [THE THEMATIC SHADOW]
Purifying Iconoclast Zealot                  Superstitious Blood-Diviner
(Fanatical itinerant priest condemning       (Village crone whispering in dark alleys;
 wayside icons as pagan idolatry;             interpreting every dead calf as a curse;
 demands smashing cairns with iron hammers)   demanding blood sacrifice of stranger vagrants)
                        ^                                   ^
                        |                                   |
                        | (Iconoclastic Destruction)        | (Scapegoat Hysteria)
                        |                                   |
                        v                                   v
                   [THE TERTIARY OUTCAST]
                 The Mute Sin-Eater Hermit
            (Dwells alone in an abandoned lime kiln;
             eats stale bread off dead corpses to
             absorb deceased sins; shunned by all)
```

* **Corner 1: The Establishment (Parish Hearth-Elder):** An eighty-year-old grandmother who knows the family lineage, burial cairns, and traditional land boundaries of every acre in the parish. Carrying an ash walking staff, she can calm a furious tavern brawl with a single ancestral proverb and demands respect for the ancient wayside stones.
* **Corner 2: The Zealot Opponent (Purifying Iconoclast Zealot):** A fiery foreign priest carrying an iron hammer and a book of orthodox scripture. Viewing roadside cairns and wood carvings as demonic pagan idolatry, they whip impressionable youth into a frenzy to topple the boundary icons and burn down ancient solstice maypoles.
* **Corner 3: The Thematic Shadow (Superstitious Blood-Diviner):** A bitter crone who exploits rural anxiety. When sickness strikes, she reads entrails in pig troughs, pointing trembling fingers at defenseless outcasts, ugly widows, or passing adventurers, demanding they be drowned in the millpond to "appease the blighted soil."
* **Corner 4: The Tertiary Outcast (The Mute Sin-Eater Hermit):** A shunned outcast living in an abandoned stone quarry. Hired for a wooden bowl of porridge to sit beside fresh corpses and eat bread off their chests, they spiritually absorb the deceased's sins so their ghost will not haunt the village lanes. Speaking only through guttural moans, they know which deaths were natural and which were poison.

## 9. Scene Calculus & Tactical Spatial Encounters

* **Encounter 1: The Broken Icon at the Crossroads (Arrival Collision)**
  * *Collision ($><$):* Arriving at the village boundary crossroads, the party discovers three hooded iconoclasts armed with iron crowbars levering the sacred oak icon off the boundary cairn; thirty paces away, six village farm boys with pitchforks are charging them with intent to kill.
  * *Polarity Shift ($+ \to -$):* The party seeks directions, but is instantly thrust between religious zealots smashing local heritage and murderous farm boys seeking revenge.
* **Encounter 2: The Ducking of the Miller's Daughter (The Severance Dilemma)**
  * *Dilemma:* A hysterical mob has bound the miller's young daughter to a ducking-stool over the swollen millpond, convinced her red hair brought the cattle plague. The miller is held at knife-point. The party must decide whether to draw steel against the mob (**DC 16 Intimidation/Combat**) to save the innocent girl, or negotiate an emergency ritual cure with the crone, risking the girl's drowning if negotiations stall.
* **Encounter 3: The Sin-Eater's Funeral Feast (The Outcast Route)**
  * *Outcast Route:* To obtain a vital clue from a poisoned murder victim before burial, the party attends the nocturnal wake in the abandoned lime kiln, sharing a symbolic bowl of salt-bread with the terrifying Mute Sin-Eater (**DC 13 Will check** against supernatural dread).

## 10. Authoritative Specifications & Cross-References
* **Baseline Substratum Standard**: Governed by [Tier 0 Substratum SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/tier_0_substratum_srd.md).
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Hazard Tiers**: Governed by [Universal Adventure Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
