# Tier 0 Substratum SRD: Baseline Settlement Framework

Version: 1.0.0  
Status: Authoritative Standard  
Authority: ADR-0001, ADR-0002, `docs/srd/authoring_engine_srd.md`, `docs/srd/adventure_framework_srd.md`, `CONTEXT.md`  

---

## 1. Scope & Architectural Role

The **Tier 0 Substratum SRD** establishes the baseline framework for the mundane survival requirements of fantasy settlements across pointcrawl campaign graphs.

While Creator Studio's Tier 1–5 pipeline models macro-governance, ideological tensions, and eschatological climax rifts, **Tier 0** models the physical substratum that keeps ordinary populations alive:
* Caloric intake and potable water supplies.
* Vernacular shelter, chimney ventilation, and municipal fire protection.
* Perimeter watch rotations, earthen berms, and local peacekeeping.
* Barter squares, craft blacksmithing, and sanitation disposal.

Tier 0 bridges the gap between high-concept worldbuilding and raw material verisimilitude, ensuring Game Masters and procedural engines never face "phantom starvation" when evaluating network balance.

---

## 2. The Dual-Mode UX Architecture

To prevent administrative worldbuilding fatigue while preserving deep simulation fidelity, Tier 0 enforces a strict **Dual-Mode UX**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 0 SUBSTRATUM MODES                         │
├───────────────────────────────────┬────────────────────────────────────┤
│   MODE A: SMOOTH GENERIC          │   MODE B: GRANULAR MODULARITY      │
│   ("Checkbox Through" / Fast Track)│   (Deep Authoring / Survival Core) │
├───────────────────────────────────┼────────────────────────────────────┤
│ • "Enable Baseline Substratum: ON"│ • Settlement population thresholds │
│ • Every settlement node satisfies │ • Discrete bushel/calorie accounting│
│   food, water, and shelter bounds │ • Active famine and drought clocks │
│ • Zero socket micromanagement     │ • Modular socketing of farms/wells │
│ • Instant focus on Tiers 1–5      │ • Logistics-driven player quests   │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 2.1 Mode A: Smooth Generic ("Checkbox Through")
* When `enable_tier_0_substratum: true` is active in `campaign_studio.html` or `Run-NetworkEngine.ps1`:
  * All settlement nodes (`Hub`, `Settlement`, `Outpost`) automatically receive implicit baseline flags for `Food: Baseline-Subsistence-Rations`, `Water: Baseline-Potable-Flow`, and `Shelter: Baseline-Vernacular-Hearth`.
  * Procedural recommendation engines ignore baseline survival deficits and focus on high-concept macro tensions (alchemy, factions, rifts).
  * No auxiliary socket slots are consumed.

### 2.2 Mode B: Granular Modularity (Deep Authoring)
* When `enable_tier_0_substratum: false` (or explicitly set to "Granular / Survival Mode"):
  * Settlements require explicit Tier 0 or Tier 2/3 food and water sources within a reachability radius ($k \le 2$ graph hops).
  * Nodes lacking adequate baseline inputs advance active **Starvation**, **Drought**, or **Unrest Threat Clocks**.
  * Game Masters can slot specific Tier 0 modules (`T0-DOM-01` through `T0-DOM-08`) directly into node auxiliary sockets, tailoring individual village crises.

---

## 3. The 8 Mundane Survival Domains

Baseline worldbuilding is categorized across eight discrete functional domains:

| Domain Code | Title | Core Physical Reality | Primary Resource Provides |
| :--- | :--- | :--- | :--- |
| **DOM-01** | Food & Caloric Subsistence | Dryland grain rotation, cabbage patches, root cellars, communal threshing | `Food: Baseline-Subsistence-Rations` |
| **DOM-02** | Water & Hydrology | Artesian wells, snowmelt flumes, rainwater cisterns, aquifer springheads | `Water: Baseline-Potable-Flow` |
| **DOM-03** | Shelter & Civic Fabric | Timber, wattle-and-daub, fieldstone masonry, hearth sooth flues, road paving | `Shelter: Baseline-Vernacular-Hearth` |
| **DOM-04** | Peacekeeping & Watch | Ditch-and-palisade, town bailiff, parish militia, perimeter horn alarms | `Defense: Baseline-Perimeter-Watch` |
| **DOM-05** | Trade, Barter & Craft | Weekly square barter, village blacksmith, cooperage, tool repair, copper coin | `Commerce: Baseline-Barter-Market` |
| **DOM-06** | Health & Herbalism | Village midwife, herbalist drying racks, leechcraft hearth, fever quarantine | `Health: Baseline-Leechcraft-Care` |
| **DOM-07** | Sanitation & Waste | Midden trenches, swine scavenging pens, night-soil pits, carcass composting | `Sanitation: Baseline-Midden-Trench` |
| **DOM-08** | Cohesion & Hearth Vigil | Wayside boundary shrines, ancestor cairns, solstitial feast vigils | `Culture: Baseline-Communal-Vigil` |

---

## 4. Settlement Hierarchy & Caloric Carrying Capacity

Pre-industrial verisimilitude governs node consumption and trade radius:

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Satellite Farm  │──────►│  Market Town    │──────►│  Sovereign Hub  │
│ (250 Cal Surplus)│       │ (Breakeven Node)│       │ (2,000 Deficit) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 4.1 Population Scales & Carrying Capacities

| Scale Tier | Typical Population | Tier 0 Infrastructure | Pointcrawl Graph Role |
| :--- | :--- | :--- | :--- |
| **Thorp** | 20–60 | 1 artesian well, communal patch, woodcutter | Minor Waypoint / Hazard Edge Anchor |
| **Hamlet** | 60–250 | 3-field crop rotation, flour mill, ditch-palisade | Satellite Node (3 Sockets) |
| **Village** | 250–1,000 | Weekly barter square, bailiff watch, leech hearth | Major Satellite / Secondary Trade Anchor |
| **Market Town** | 1,000–5,000 | Stone walls, regional granaries, formal magistrates | Buffer Sovereign / Regional Bastion |
| **Sovereign Hub**| 5,000–25,000+ | Monumental palaces, aqueducts, standing garrison | Primary Sovereign Hub (4 Sockets) |

### 4.2 The Agrarian Radius & Hub Deficit Law
1. **The 3-Mile Transport Boundary**: Bulk foodstuffs (wheat bushels, root vegetables, beer barrels) cannot be transported by ox-cart beyond 3 miles without draft animals consuming a prohibitive share of the cargo.
2. **Sovereign Hub Deficit**: Any Sovereign Hub with population $>5,000$ runs a structural calorie and water deficit within its municipal perimeter.
3. **Supply Edge Coupling**: A Sovereign Hub requires at least **2 to 4 traversable edges** connecting it to agricultural and hydrological Satellite Nodes. If these edges are severed, the Hub's Threat Clocks advance immediately.

---

## 5. Universal Hazard Dials & Threat Clocks

Every Tier 0 module implements the standardized 4-level dial from the Universal Adventure Framework:

### 5.1 The 4-Level Vulnerability & Crisis Dial
* **Level 1 (Bountiful / Secure / Routine)**: Full root cellars, flowing artesian wells, alert town watch. Checks succeed automatically or require DC 10 Light tests.
* **Level 2 (Normal / Baseline Operation)**: Standard rations (2,000 kcal/day), mild seasonal mud, minor equipment wear. Checks require DC 13 Moderate tests (2d8 damage or minor resource loss).
* **Level 3 (Strained / Seasonal Hunger Gap)**: Spring hunger gap, dry spells, well silt buildup, rations halved to 1,000 kcal/day. Checks require DC 16 Severe tests (4d10 damage, fatigue, unrest checks).
* **Level 4 (Exhausted / Famine / Lockdown)**: Seed-grain eaten, draft animals slaughtered, wells tainted with brine, bread riots erupt. Triggers DC 20 Lethal Climax consequences.

### 5.2 Standardized Tier 0 Threat Clocks
* `[ ][ ][ ][ ]` **Hunger Gap & Caloric Exhaustion Clock [4 Ticks]**: Advances each campaign week a settlement is isolated from agricultural satellites; full clock triggers Level 4 Famine riots.
* `[ ][ ][ ][ ]` **Wellhead Silt & Contamination Clock [4 Ticks]**: Advances on neglected maintenance or runoff floods; full clock triggers dysentery outbreaks.
* `[ ][ ][ ][ ][ ][ ]` **Palisade Decay & Timber Rot Clock [6 Ticks]**: Advances in damp seasons without replacement timber; full clock collapses perimeter defense.

---

## 6. Tabletop Runtime Procedures

1. **Campaign Downtime Turns**: During long rests or 1-week campaign downtime cycles, GMs check active Tier 0 edges for blockades.
2. **Severance Fallout**: Severing a Tier 0 supply line inflicts no immediate damage on turn 1, but advances connected survival clocks by +1 tick per turn.
3. **Mundane Quests**: Tier 0 modules generate natural, low-level adventure hooks (escorting grain wagons through flooded gorges, clearing silted cistern intake pipes, resolving border boundary disputes between rival clan farmers).

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD](authoring_engine_srd.md).
* **Hazard & Runtime Mechanics**: Governed by [Universal Adventure Framework SRD](adventure_framework_srd.md).
* **Scenario Primitives Standard**: Governed by [Scenario Primitives SRD](scenario_primitives_srd.md).
* **Tier 0 Backlog Catalog**: Cataloged in [Tier 0 Manifest](file:///c:/Users/Milo/Documents/Antigravity/Creator/tickets/tier_0/tier_0_manifest.json).
