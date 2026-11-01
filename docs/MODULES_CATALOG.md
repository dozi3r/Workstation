<!--
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: Universal Worldbuilding Modules & Campaigns Catalog
WIKI PAGE: wiki/pages/docs/MODULES_CATALOG.md.html (Markdown Source: wiki/src/files/docs/MODULES_CATALOG.md.md)
AUTHORITATIVE SPECIFICATIONS:
  - docs/adr/0002-dual-srd-and-tiered-module-architecture.md
  - docs/srd/adventure_framework_srd.md
  - docs/srd/campaign_preset_specification_srd.md
  - docs/srd/ip_module_framework_srd.md
  - docs/srd/scenario_primitives_srd.md
DATA PROVENANCE & BUILD PIPELINE:
  - campaigns/Emerald Isle/modules/**/*.md
CRITICAL INSTRUCTION:
  Each module file must declare typed pipeline_tier, provides, and requires tags in YAML frontmatter.
  Re-compile suite via: powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
================================================================================
-->

# CAMPAIGN CREATOR: UNIVERSAL PLUG-AND-PLAY MODULE LIBRARY
## Master Catalog, Multi-Campaign Architecture & GM Slotting Guide
*Directory: `docs/` &bull; Campaigns Directory: `campaigns/`*

---

### 1. Executive System Architecture & 5-Tier Pipeline

The worldbuilding, mechanics, technology, sociology, biomes, and esoteric cosmology of Creator Studio are organized around the **5-Tier Worldbuilding Pipeline**:

```text
               UNIVERSAL CAMPAIGN CREATOR 5-TIER PIPELINE
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TIER 1: MACRO NETWORK & GOVERNANCE ENGINES                             │
 │ • Hegemonic Hubs, Faction Governance, Tension Matrix, Mosaic Syndicates│
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER 2: TOPOLOGICAL & BIOME ANCHORS                                    │
 │ • Regional Biomes, Crystalline Stirges, Transit Edges, Arrival Gambits │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER 3: INFRASTRUCTURAL SUPPLY CHAINS                                  │
 │ • Pelton Dynamos, Watermills, Smokewalls, Nitrification Beds           │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER 4: DYNAMIC NARRATIVE SPARKS & SOCIAL CONFLATION                   │
 │ • Famine Riots, Quarantine Wards, Ideological Conflations, Lynch Mobs  │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER 5: ESOTERIC & ESCHATOLOGICAL ENGINES                              │
 │ • Weaponized Print Media Forgery, Cosmic Collider Planar Breach        │
 └────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Multi-Campaign Structure ("2 Settings & A System")

Creator Studio decouples the universal engine from campaign-specific datasets. Campaign packages reside in `Creator/campaigns/`:

```text
Creator/
├── campaigns/
│   └── Emerald Isle/                  # [ACTIVE CAMPAIGN] Emerald Isle Comprehensive Sourcebook (109 Modules)
│       ├── campaign.json              # Metadata, active toggle
│       ├── preset.json                # Canonical 22-node preset
│       ├── modules_manifest.json      # 109-module manifest
│       └── modules/                   # 109 deeply detailed modules
│           ├── Set_A_Infrastructure_and_Engineering/
│           ├── Set_B_Ecology_and_Biomes/
│           ├── Set_C_Faction_and_Governance/
│           ├── Set_D_Social_Dynamics_and_Conflation/
│           ├── Set_E_Transit_and_Edges/
│           ├── Set_F_Catalysts_NPCs_and_Dilemmas/
│           ├── Set_G_Esoterica_and_Information_Warfare/
│           ├── Set_H_Executive_Options_and_Variants/
│           ├── CWT-*                          # Creative Writing Track Climax & Transit Modules
│           └── T0-*                           # Tier 0 Substratum Agrarian Modules
```

---

### 3. Campaign Sourcebook: Emerald Isle
*Directory: [`campaigns/Emerald Isle/`](../campaigns/Emerald%20Isle/)*

A system-agnostic, multi-tier campaign sourcebook consolidating 109 modules across infrastructure, ecology, governance, social dilemmas, and eschatological climax engines.

| Module ID | Module Title | Pipeline Tier | Culture Fit | Key Yields |
| :--- | :--- | :---: | :--- | :--- |
| **[FACT-01](../campaigns/Emerald%20Isle/modules/FACT-01_The_5_Sovereign_Hub_Archetypes_and_Smothering.md)** | The 5 Sovereign Hub Archetypes & Smothering | **Tier 1** | Universal | Geopolitical Balance |
| **[FACT-02](../campaigns/Emerald%20Isle/modules/FACT-02_The_2_Axis_Sovereign_Tension_Matrix.md)** | The 2-Axis Sovereign Tension Matrix | **Tier 1** | Cross-Quadrant | Diplomatic Polarities |
| **[FACT-03](../campaigns/Emerald%20Isle/modules/FACT-03_Decapitation_Proof_Mosaic_Governance.md)** | Decapitation-Proof State Architecture | **Tier 1** | Hierarchy / Clan | State Continuity |
| **[FACT-04](../campaigns/Emerald%20Isle/modules/FACT-04_The_Equilibrium_Engine_and_Stability_Points.md)** | The Equilibrium Engine & Stability Points | **Tier 1** | Universal | World State Shifting |
| **[FACT-06](../campaigns/Emerald%20Isle/modules/FACT-06_Tactical_Bastion_Fortification_Ranks.md)** | Tactical Bastion Fortification Ranks | **Tier 2** | Hierarchy / Clan | Fortified Perimeter |
| **[SPARK-08](../campaigns/Emerald%20Isle/modules/SPARK-08_Tarot_Disembark_and_Arrival_Gambit_Tables.md)** | Universal Arrival & Disembark Tables | **Tier 2** | Universal | Starting Boons & Debts |
| **[STARTER-01](../campaigns/Emerald%20Isle/modules/STARTER-01_River_Watermill_and_Grain_Silo.md)** | The River Watermill & Grain Silo | **Tier 3** | Hierarchy / Market | Milled Flour, River Weir |
| **[STARTER-02](../campaigns/Emerald%20Isle/modules/STARTER-02_Smugglers_Cove_and_Hidden_Sea_Cave.md)** | Smugglers' Cove & Hidden Sea Cave | **Tier 2** | Adhocracy / Market | Contraband Trade, Tidal Path |
| **[STARTER-03](../campaigns/Emerald%20Isle/modules/STARTER-03_Goblin_Warrens_and_Clay_Pits.md)** | Goblin Warrens & Abandoned Clay Pits | **Tier 2** | Adhocracy / Clan | Goblin Raids, Iron Scrap |
| **[STARTER-04](../campaigns/Emerald%20Isle/modules/STARTER-04_Ancient_Barrow_and_Restless_Dead.md)** | The Ancient Barrow & Restless Dead | **Tier 4** | Clan / Memory | Restless Dead, Barrow Silver |
| **[STARTER-05](../campaigns/Emerald%20Isle/modules/STARTER-05_Mountain_Watchtower_and_Signal_Pylon.md)** | Mountain Watchtower & Signal Pylon | **Tier 2** | Hierarchy | Early Raid Warning, Signals |
| **[STARTER-06](../campaigns/Emerald%20Isle/modules/STARTER-06_Whispering_Old_Woods_and_Herbalist_Cloister.md)** | Whispering Old Woods & Herbalist Cloister | **Tier 2** | Clan | Herbal Salves, Timber |
| **[HOOK-01](../campaigns/Emerald%20Isle/modules/HOOK-01_The_Indentured_Caravan_Desperation_Leap.md)** | The Indentured Caravan Desperation Leap | **Tier 4** | Market / Hierarchy | Debt Ledger, Truck Scrip, Labor Revolt |

---

### 4. Canonical Modular Sets (Sets A–G)
*Directory: [`campaigns/Emerald Isle/modules/`](../campaigns/Emerald%20Isle/modules/)*

The foundational 48 industrial-alchemical sandbox modules, organized across Sets A through G:
* **Set A: Infrastructure & Engineering** (Pelton Wheel `INFRA-01`, Arc Furnace `INFRA-02`, Smokewall `INFRA-03`, Nitrification `INFRA-04`, Mist Poles `INFRA-05`, Freewave Radio `INFRA-06`, Menhir Relay `INFRA-07`, Cryo Pyramid `INFRA-08`, Zim-Sharr Wards `INFRA-09`)
* **Set B: Ecology & Biomes** (Crystalline Stirges `ECOL-01`, Razor Sedge `ECOL-02`, Iron-Thorn `ECOL-03`, Pitcher Bogs `ECOL-04`, Quartz Filtration `ECOL-05`, Redwood Canopy `ECOL-06`, Siren Roosts `ECOL-07`)
* **Set C: Faction & Governance** (Sovereign Hubs `FACT-01`, Tension Matrix `FACT-02`, Mosaic Governance `FACT-03`, Equilibrium `FACT-04`, Beheaded Syndicate `FACT-05`, Bastions `FACT-06`, Canonical Factions `FACT-07`)
* **Set D: Social Dynamics & Conflation** (White-Blue `CONF-01`, Green-Red `CONF-02`, Green-Blue `CONF-03`, Hegemony `CONF-04`, Tracking Bracelets `CONF-05`, Lynch Mob `CONF-06`)
* **Set E: Transit Edges** (Canyon Fatal Funnel `EDGE-01`, Coastal Road `EDGE-02`, Walter's Wiggles `EDGE-03`, Canopy Highways `EDGE-04`, Smuggler Sea Arches `EDGE-05`)
* **Set F: Catalysts & Dilemmas** (Salt Famine `SPARK-01`, Blue-Rot `SPARK-02`, Memory Tithe `SPARK-03`, Iron-Blight `SPARK-04`, Hollow Architects `SPARK-05`, Promethean Lodge `SPARK-06`, Bureaucrat Dilemma `SPARK-07`, Opal Arrival `SPARK-08`)
* **Set G: Esoterica & Climax Engines** (Yellow Press `ESOT-01`, Divine Council `ESOT-02`, Saturnine Loop `ESOT-03`, Aquabah `ESOT-04`, Penal Labor `ESOT-05`, Cosmic Collider `ESOT-06`)

---

### 5. Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: [Campaign Authoring Engine SRD](srd/authoring_engine_srd.md)
* **Adventure Framework Standard**: [Universal Adventure Framework SRD](srd/adventure_framework_srd.md)
* **IP Module Framework Standard**: [IP Module Framework SRD](srd/ip_module_framework_srd.md)
* **Sociological Matrix Standard**: [Disposition Matrix & Tarot Framework](../sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md)
* **Canonical Vocabulary**: [CONTEXT.md](../CONTEXT.md)

---

### 6. Universal IP Module Authoring Kit & Conversion Framework
*Directory: [`templates/`](../templates/)*

For external IP holders, worldbuilders, historical scenario writers, and tabletop converters seeking to publish plug-and-play modules for Creator Studio:

* **Master Specification**: [`docs/srd/ip_module_framework_srd.md`](srd/ip_module_framework_srd.md) (Cross-domain ingestion, 5-tier mapping, and system-agnostic conversion rules).
* **Copy-Paste Authoring Template**: [`templates/IP_MODULE_TEMPLATE.md`](../templates/IP_MODULE_TEMPLATE.md) (Standardized YAML frontmatter, typed resource tags, 4-level dials, threat clocks, and 4-corner opposition web).
* **Canonical Domain Exemplars**:
  * **Real History**: [`templates/examples/HIST-01_Crossing_of_the_Rubicon_and_Senate_Flight.md`](../templates/examples/HIST-01_Crossing_of_the_Rubicon_and_Senate_Flight.md) (Late Roman Republic: constitutional breakdown, Senate evacuation, and legionary march).
  * **Shonen Anime / Pop Culture**: [`templates/examples/DBZ-01_Namek_Planetary_Meltdown_and_Dragon_Ball_Harvest.md`](../templates/examples/DBZ-01_Namek_Planetary_Meltdown_and_Dragon_Ball_Harvest.md) (Dragon Ball Z: Planet Namek 5-minute core meltdown, Dragon Ball hunt, and scouter grid).
  * **Classic D&D Module Conversion**: [`templates/examples/DND-01_Barovian_Mists_and_the_Vampire_Sovereign.md`](../templates/examples/DND-01_Barovian_Mists_and_the_Vampire_Sovereign.md) (Curse of Strahd / Ravenloft: Sovereign Hub smothering, mist quarantine dial, and wine supply chain).

