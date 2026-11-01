---
series_id: "series_d_module_supply_chains_and_contracts"
code: "Series D"
title: "The 5-Tier Module Pipeline, Resource Contracts (provides/requires) & Fallbacks"
volume: "vol-8"
---

# Series D: The 5-Tier Module Pipeline, Resource Contracts (provides/requires) & Fallbacks

> **Cross-Cutting Analytical Series**: How Tier 0–5 worldbuilding modules declare machine-readable resource inputs/outputs, form industrial supply chains across pointcrawl graphs, validate reachability via Breadth-First Search (BFS), and trigger Standalone Fallback Mode and 4-tick Severance Clocks when supply corridors are interdicted.

## 1. Architectural Seam Overview

This cross-cutting series slices across physical directory boundaries to document how architectural decision records, System Reference Documents (SRDs), browser slotting controllers, and multi-campaign manifests collaborate as a unified supply-chain and worldbuilding subsystem:

- **Governing Architecture & SRDs**:
  - [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]] — Establishes the Dual SRD split (Authoring Engine vs. Adventure Framework) and stratifies worldbuilding modules into the 5-Tier Pipeline with typed `provides` / `requires` resource contracts.
  - [[File:docs/srd/tier_0_substratum_srd.md]] — Formalizes the **Tier 0 Mundane Settlement Substratum** (`DOM-01` through `DOM-08`), caloric carrying capacities, the 3-mile ox-cart transport boundary, and the **Dual-Mode UX** (*Smooth Generic* vs. *Granular Modularity*).
  - [[File:docs/srd/authoring_engine_srd.md]] — Section 8 codifies the mathematical rules for module socketing, supply-line reachability, and recommendation scoring.
  - [[File:docs/srd/adventure_framework_srd.md]] — Defines the 4-level Universal Hazard Dials (Light DC 10, Moderate DC 13, Severe DC 16, Lethal DC 20) and 4/6/8-segment Threat Clocks embedded inside every module.
  - [[File:docs/srd/ip_module_framework_srd.md]] & [[File:docs/srd/scenario_primitives_srd.md]] — Govern setting-agnostic scenario conversion and structural deconstruction (see [[Series:series_f_campaign_authoring_and_ip_conversion]]).
- **Runtime Slotting & Supply Validation Engine**:
  - [[File:src/workstation/scripts/stage_5_slotting.js]] — Implements `isMaterialRequirement()`, `checkModuleSupplyLine()`, `calculateRecommendationScore()`, `auditAllSupplyLines()`, `toggleEdgeBlocked()`, `stepSeveranceTick()`, `advanceSeveranceTurn()`, and `smartSlotAllNodes()`.
  - [[File:src/workstation/scripts/module_explorer.js]] — Provides the Module Explorer UI, Node/Edge slotting toggle, filter bar (Sourcebook, Tier, Set, Resource Tag, Ancestry, Source), and 4-segment Severance Clock gauges.
- **Authoritative Catalogs, Manifests & Ticket Pipelines**:
  - [[File:docs/MODULES_CATALOG.md]] — Root cross-campaign module catalog and architectural router (tracked under [[Ticket:SYS-AUDIT-01]] and [[Series:series_g_duplicate_and_orphan_audit]]).
  - [[File:campaigns/opal_island/modules_manifest.json]] — Compiled manifest of the 48 industrial-alchemical modules (`INFRA-01` through `ESOT-06`) for the Original Opal Island campaign.
  - [[File:campaigns/generic_starter/modules_manifest.json]] — Compiled manifest of 52 system-agnostic modules spanning Core Governance (`FACT-01`..`06`), Tutorial Isle Starter Pack (`STARTER-01`..`06`), Tier 0 Substratum (`T0-DOM-01`..`08`), Creative Waves 1–5 (`CWT-010`..`050`), the *Civilizations & Collapse* historical archaeology suite (`CWT-060`..`078`), and Regional Hooks (`HOOK-01`).
  - [[File:tickets/tier_0/tier_0_manifest.json]] & [[File:tickets/creative/creative_backlog_manifest.json]] — Upstream tracer-bullet ticket registries compiled into [[File:tickets/master_ticket_manifest.json]].

---

## 2. The Stratified Worldbuilding Pipeline (Tiers 0–5)

Prior to [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], worldbuilding modules were stored in a flat catalog where macro-governance rules, road corridors, industrial smelters, and campaign-ending cataclysms competed as undifferentiated cards. Creator Studio resolves this by stratifying all worldbuilding modules into six functional layers (**Tier 0** through **Tier 5**):

| Pipeline Tier | Architectural Layer | Graph Scope | Core Mechanical Responsibility | Canonical Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | **Mundane Settlement Substratum** | Node (Implicit or Auxiliary Socket) | Baseline caloric, hydrological, shelter, watch, barter, health, sanitation, and folkloric survival (`DOM-01`..`DOM-08`). | [[Mod:T0-DOM-01]], [[Mod:T0-DOM-02]], [[Mod:T0-DOM-05]], [[Mod:T0-DOM-07]] |
| **Tier 1** | **Macro Network & Governance Engines** | Graph-Wide / Sovereign Hub | Sovereign Hub election rules, adjacency smothering, 2-axis diplomatic tension matrices, mosaic state continuity, and stability clocks. | [[Mod:FACT-01]], [[Mod:FACT-02]], [[Mod:FACT-03]], [[Mod:FACT-04]], [[Mod:CWT-060]], [[Mod:HIST-01]], [[Mod:DND-01]] |
| **Tier 2** | **Topological & Biome Anchors** | Node (Biome) or Edge (Transit Corridor) | Physical ecology, natural resource extraction, hazard fauna, arrival gambits, and physical transit corridors (`E_adj`). | [[Mod:ECOL-01]], [[Mod:ECOL-05]], [[Mod:EDGE-01]], [[Mod:EDGE-03]], [[Mod:STARTER-02]], [[Mod:CWT-020]], [[Mod:CWT-061]] |
| **Tier 3** | **Infrastructural Supply Chains** | Node (Crucible / Refinery Socket) | High-order industrial conversion nodes that consume upstream `requires` tags and output refined `provides` tags along unblocked edges. | [[Mod:INFRA-01]], [[Mod:INFRA-02]], [[Mod:INFRA-03]], [[Mod:STARTER-01]], [[Mod:CWT-043]], [[Mod:CWT-060A]], [[Mod:CWT-063]] |
| **Tier 4** | **Dynamic Narrative Sparks & Social Conflation** | Node or Edge (Crisis / Dilemma) | Faction mutinies, quarantine wards, ideological conflations, debt-peonage collisions, and escalating social unrest clocks. | [[Mod:SPARK-01]], [[Mod:SPARK-02]], [[Mod:CONF-01]], [[Mod:STARTER-04]], [[Mod:CWT-065]], [[Mod:CWT-074]], [[Mod:HOOK-01]] |
| **Tier 5** | **Esoteric & Eschatological Climax Engines** | Equilibrium Key (Node #22) / Endgame | Campaign-climax singularities, planar colliders, time-loops, information-warfare presses, and existential reckonings. | [[Mod:ESOT-01]], [[Mod:ESOT-03]], [[Mod:ESOT-06]], [[Mod:CWT-010]], [[Mod:CWT-012]], [[Mod:CWT-066]], [[Mod:DBZ-01]] |

### 2.1 The Tier 0 Dual-Mode UX Contract (`Smooth Generic` vs. `Granular Modularity`)

To prevent administrative bookkeeping fatigue while supporting hardcore survival sandboxes, [[File:docs/srd/tier_0_substratum_srd.md]] and `toggleTier0Substratum(enabled)` in [[File:src/workstation/scripts/stage_5_slotting.js]] implement a two-mode switch:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                     TIER 0 SUBSTRATUM EXECUTION MODES                        │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ MODE A: SMOOTH GENERIC (Default ON)  │ MODE B: GRANULAR MODULARITY (OFF)     │
│ tier0SubstratumMode = "smooth"       │ tier0SubstratumMode = "granular"      │
├──────────────────────────────────────┼───────────────────────────────────────┤
│ • Automatically injects 11 baseline  │ • Removes implicit baseline resources │
│   Tier 0 tags into every node's      │ • Settlements must connect via un-    │
│   localProvides set                  │   blocked edges to explicit Tier 0/2/3│
│ • Zero auxiliary sockets consumed    │   food, water, and fuel providers     │
│ • Supply auditor focuses strictly on │ • Severed agrarian corridors advance  │
│   Tier 2–5 industrial dependencies   │   Hunger Gap & Drought Clocks (+1/wk) │
└──────────────────────────────────────┴───────────────────────────────────────┘
```

When `tier0SubstratumEnabled === true` (`Smooth Generic`), `checkModuleSupplyLine()` automatically injects the following 11 foundational tags into every node's `localProvides` set (`stage_5_slotting.js` lines 139–151):
- `Food: Baseline-Subsistence-Rations` and `Cal: Grain-Bushels`
- `Water: Baseline-Potable-Well-Head` and `Water: Artesian-Flow`
- `Shelter: Weatherproof-Civic-Fabric` and `Civic: Vernacular-Shelter`
- `Defense: Local-Palisade-and-Watch`
- `Economy: Baseline-Mundane-Smithy-and-Trade`
- `Health: Folk-Leechcraft-and-Midwifery`
- `Sanitation: Vernacular-Midden-Management`
- `Social: Communal-Folklore-Solidarity`

---

## 3. Typed Resource Tag Taxonomy (`provides` / `requires`)

Every module in `campaigns/<campaign_id>/modules_manifest.json` declares its supply-chain interface through two arrays of machine-readable strings formatted as `"[Category]: [Asset-Identifier]"`:
- **`provides`**: Resources, capabilities, infrastructure states, or narrative conditions exported by the module to its host node and any connected unblocked subgraph.
- **`requires`**: Upstream inputs required for the module to operate at its normal (Level 2) or overdriven (Level 3) dial state without ticking a severance clock.

### 3.1 Material vs. Conceptual Requirement Classifier (`isMaterialRequirement`)

A critical design insight in [[File:src/workstation/scripts/stage_5_slotting.js]] (lines 104–116) is that not all `requires` tags represent haulable physical commodities that can be blockaded on a road. Some tags describe **environmental topology** (`Geography: High-Elevation-Water-Head`) or **sociological preconditions** (`Sociology: Enforced-Labor-Quotas`).

The function `isMaterialRequirement(req)` separates `requires` tags into two enforcement classes:

| Requirement Class | Category Prefixes Matched | Runtime Validation Behavior in `checkModuleSupplyLine()` |
| :--- | :--- | :--- |
| **Conceptual / Environmental Preconditions** *(Non-Blockadable)* | `Geography:`, `Ecology:`, `Environment:`, `Sociology:`, `Authority:`, `Topology:`, `Network:`, `System:`, `Tarot:`, `Facility:`, `Military:`, `Perimeter:`, `Trigger:`, `Relics:`, `Physics:`, `Cosmology:`, `Factions:`, `Statecraft:`, `Resilience:`, `Doctrine:`, `Diagnostics:`, `Strategy:` | Filtered out of `materialReqs` (`isMaterialRequirement(req) === false`). Serves as semantic placement guidance for the GM and AI authoring agents without triggering false-positive supply-line severance alerts. |
| **Material / Logistical Supply Inputs** *(Graph-Validated)* | `Power:`, `Material:`, `Mat:`, `Chem:`, `Water:`, `Food:`, `Cal:`, `Fuel:`, `Munitions:`, `Signal:`, `Comms:`, `Bio:`, `Medicine:`, `Labor:`, `Trade:`, `Transit:`, `Mineral:`, `Metal:`, `Bullion:`, `Agriculture:`, `Hydrology:`, `Hydraulics:`, `Forest:`, `Pasture:`, `Textile:`, `Meat:`, `Glass:`, `Energy:`, `Moisture:`, `Organic:`, `Insulation:`, `Resource:`, `Life-Support:` | Strictly enforced (`isMaterialRequirement(req) === true`). Must be satisfied by a module's `provides` array on the **same node**, a **reachable node** across unblocked edges, or an **unblocked incident edge**; otherwise the module is flagged `⚠️ Severed`. |

---

## 4. Supply-Line Validation, Edge Slotting & Recommendation Math

All runtime supply-chain verification and module recommendation logic resides in [[File:src/workstation/scripts/stage_5_slotting.js]].

### 4.1 Graph-Traversing Supply Verification (`checkModuleSupplyLine`)

When evaluating whether module `mod` slotted at `nodeId` has intact supply lines, `checkModuleSupplyLine(nodeId, mod)` executes a 3-stage algorithm:

```text
[Stage 1: Local Node Aggregation]
  localProvides = union of m.provides for all m in nodeSlottedModules[nodeId]
  if (tier0SubstratumEnabled && mode === "smooth") -> inject 11 Tier 0 baseline tags

[Stage 2: Unblocked Breadth-First Search (BFS)]
  reachableNodes = { nodeId }
  queue = [ nodeId ]
  while queue not empty:
    curr = queue.shift()
    for each neighbor in getNodeAdjacents(curr):
      if isEdgeBlocked(curr, neighbor) -> CONTINUE (severed edge halts flow!)
      if neighbor not in reachableNodes:
        reachableNodes.add(neighbor)
        queue.push(neighbor)

[Stage 3: Network & Corridor Aggregation]
  networkProvides = union of m.provides across all nodes in reachableNodes
                  + union of m.provides across all unblocked edges (u->v)
                    where u in reachableNodes OR v in reachableNodes
  missing = materialReqs.filter(req => !networkProvides.has(req))
  return { ok: missing.length === 0, missing, fallback: mod.fallback }
```

- **Global Integrity Badge (`auditAllSupplyLines`)**: Iterates over all 22 nodes and counts every slotted module where `checkModuleSupplyLine(nid, mod).ok === false`. Updates `#supply-integrity-badge` in the studio header between `✅ Supply Lines Intact` (emerald) and `⚠️ N Severed Supply Line(s)` (pulsing rose).

### 4.2 Dual-Target Slotting: Nodes vs. Transit Edges (`setSlottingMode`)

Stage 5 supports two distinct socketing targets toggled via `setSlottingMode("node" | "edge")`:
- **Node Slotting Mode (`slottingMode === "node"`)**: Sockets modules into `nodeSlottedModules[nodeId]`. Displays node sociological metadata (CVF Culture, Category, Hub/Satellite status, drawn Major Arcana card, Amalgamation score, and `demographics` census from [[Ticket:SYS-RACE-02]]).
- **Edge Slotting Mode (`slottingMode === "edge"`)**: Targets directed or bidirectional pointcrawl links (`targetSlottingEdgeId = "u->v"`), socketing Tier 2 transit corridors (`EDGE-01`..`05`, `CWT-020`..`025`, `HOOK-01`) into `edgeSlottedModules["u->v"]`. Provides an interactive **Sever / Reopen Transit Edge** button (`toggleEdgeBlocked(edgeKey)`) that sets `blockedEdges["u->v"] = true`, immediately recalculating supply reachability across the entire graph.

### 4.3 Multi-Factor Module Recommendation Engine (`calculateRecommendationScore`)

To help GMs and automated builders select synergetic modules for any node `nodeId`, `calculateRecommendationScore(nodeId, mod)` computes an additive heuristic score:

| Scoring Factor | Condition | Delta | Badge / UI Feedback |
| :--- | :--- | :---: | :--- |
| **1. Tarot Archetype Affinity** | Node's drawn Major Arcana card (`drawnCards[nodeId].name`) matches an entry in `mod.tarot` | **`+10`** | `🌟 Tarot Synergy (+10)` (Amber ring highlight) |
| **2. CVF Culture Quadrant Match** | Node `culture` matches `mod.culture` (e.g. `Hierarchy` in `Hierarchy / Market`) | **`+5`** | `⭐ Cultural Fit (+5)` (Sky ring highlight) |
| **3. CVF Culture Quadrant Clash** | `mod.culture` contains the diagonal CVF opposite (`Clan <-> Market` or `Hierarchy <-> Adhocracy`) | **`-5`** | `⚠️ Cultural Friction (-5)` (Rose warning border) |
| **4. MTG Color Wheel Share** | Node `color` and `mod.color` share at least one ideological color token (`W/U/B/R/G`) | **`+3`** | `Color Match: [Color] (+3)` |
| **5. Downstream Supply Synergy** | `mod.provides` resolves an active `missing` material requirement on any node in `reachableNodes` | **`+3`** | `Supplies: [Tag] (+3)` |
| **6. Upstream Inputs Intact** | `mod` has material requirements AND `checkModuleSupplyLine(nodeId, mod).ok === true` | **`+2`** | `Inputs Intact (+2)` |
| **7. Duplicate Socket Penalty** | `nodeSlottedModules[nodeId]` already contains `mod.id` | **`-10`** | Prevents redundant recommendation |

When the user clicks **Smart Slot All Nodes** (`smartSlotAllNodes()`), the engine executes a 4-pass greedy assignment across all 22 nodes using `getBestModule(nid, filterFn)`:
- **Pass 1 (Infrastructure)**: Best Tier 3 / Set A / Life-Support module.
- **Pass 2 (Ecology)**: Best Tier 2 / Set B / Ecology / Maritime module.
- **Pass 3 (Social & Governance)**: Best Tier 1 or Tier 4 / Set C / Set D module.
- **Pass 4 (Catalysts & Climax)**: Best Tier 5 / Set F / Set G module.

---

## 5. Standalone Fallback Mode, Severance Clocks & Dial 8 Crisis Gate

Every module in Creator Studio is required by [[File:campaigns/Test-CampaignPackage.ps1]] and [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]] to define a `fallback` (in `modules_manifest.json`) / `standalone_fallback` (in Markdown YAML frontmatter).

### 5.1 Dual Purpose of the Standalone Fallback Contract
- **1. One-Shot / Isolated Node Portability**: Allows a GM to pluck a single module (e.g., `INFRA-02` Arc Smelter or `CWT-061` Derinkuyu Bastion) out of its parent campaign and drop it into an unrelated homebrew session without importing the rest of the 22-node supply web.
- **2. Runtime Degradation State**: Defines the exact physical and mechanical behavior of the facility when its upstream `requires` tags are severed by player sabotage, enemy blockade, or environmental disaster.

### 5.2 The 4-Segment Severance Clock & Dial 8 Branching

When `checkModuleSupplyLine(nid, mod).ok` evaluates to `false`, the Stage 5 sidebar renders an interactive 4-segment **Severance Threat Clock** (`moduleSeveranceClocks["${nodeId}:${modId}"]`) governed by `stepSeveranceTick(nodeId, modId, delta)` and global turn progression (`advanceSeveranceTurn()`):

| Severance Clock Tick | Operational State & Mechanical Consequence | Visual Gauge Color |
| :---: | :--- | :--- |
| **Tick 0 / 4** | **Supply Severed (Grace Window)**: Local emergency stockpiles holding; **Active Fallback** mode engaged. | Slate (0 bars lit) |
| **Tick 1 / 4** | **Stockpiles Depleted**: Primary output dial drops (`-1 Yield`); rationing instituted. | Amber (1 bar lit) |
| **Tick 2 / 4** | **Operational Strain**: Equipment degradation and civil unrest checks (`+1 Regional Peril`). | Orange (2 bars lit) |
| **Tick 3 / 4** | **Critical Distress**: Cascading systemic failure imminent on next campaign turn. | Rose (3 bars lit) |
| **Tick 4 / 4 (Branch A)**<br>*Dial 8 = `crisis`* | **🚨 HEROIC CRISIS GATE ACTIVE**: Opens a mandatory 1-session emergency encounter window for players to reopen the severed corridor or deliver relief supplies (`Relief -2`) before permanent ruin. | Pulsing Purple (4 bars lit) |
| **Tick 4 / 4 (Branch B)**<br>*Dial 8 = `hardcore`* | **💀 SYSTEMIC COLLAPSE**: Hardcore Cataclysm mode; module infrastructure is permanently ruined and node collapses. | Pinging Crimson (4 bars lit) |

---

## 6. Complete Supply-Chain Topology: `opal_island` (48 Modules)

In [[File:campaigns/opal_island/modules_manifest.json]], the 48 modules form a tightly interlocked industrial-alchemical ecosystem where hydro-electric generation, metallurgy, chemical synthesis, radio telemetry, and ecological harvesting feed one another across the 22-node pointcrawl graph.

### 6.1 Primary Industrial & Alchemical Supply-Chain Graph (`opal_island`)

```text
[Geography: High-Elevation-Water-Head] (Alpine Node #8 / Waterfall Node #14)
   │
   ├──► [[Mod:INFRA-01]] Hydro Pelton Wheel & DC Dynamo
   │       │  provides: [Power: High-Amperage-DC], [Hydraulics: Industrial-Tailrace-Flow]
   │       │
   │       ├──► [[Mod:INFRA-02]] Carbon Electric Arc Smelting Furnace (+ Direct-Reduced-Iron from INFRA-04)
   │       │       │  provides: [Chem: CaC2-Carbide-Pellets], [Material: Smelted-Alloy]
   │       │       │
   │       │       ├──► [[Mod:INFRA-03]] "Argent-Fume" Incendiary Smokewall (+ Distilled-Potable-Water from INFRA-07)
   │       │       │       └──► provides: [Defense: Acetylene-Smoke-Screen], [Defense: Stirge-Swarm-Immunity]
   │       │       │            (Neutralizes [[Mod:ECOL-01]] Crystalline Stirge Hives!)
   │       │       │
   │       │       ├──► [[Mod:FACT-06]] Tactical Bastion Fortification Ranks (Levels 1-4)
   │       │       ├──► [[Mod:EDGE-02]] South Coastal Road Paving Initiative
   │       │       ├──► [[Mod:CONF-05]] Deception Hardware: Holy Silver Tracking Bracelets
   │       │       └──► [[Mod:ESOT-06]] The Cosmic Collider & Planar Breach Trigger (Tier 5 Climax)
   │       │
   │       ├──► [[Mod:INFRA-06]] Gnomish Freewave Vacuum-Tube Transceivers
   │       │       │  provides: [Signal: Freewave-HF-Radio], [Chem: Commercial-Sulfuric-Acid]
   │       │       └──► [[Mod:INFRA-07]] Lakestone Resonant Menhir Radio Relay (+ Deep-Brine-Well)
   │       │               │  provides: [Water: Distilled-Potable-Water], [Chem: Refined-Salt-and-Bromine]
   │       │               ├──► Feeds Water to [[Mod:INFRA-03]] Argent-Fume Smokewall
   │       │               └──► Feeds Salt/Bromine to [[Mod:SPARK-01]] Salt Warehouse Famine Riots
   │       │
   │       ├──► [[Mod:INFRA-08]] Cyclopean Cryo-Pyramid & Refrigeration Coils
   │       └──► [[Mod:SPARK-06]] Independent Conspiracy: The Promethean Lodge
   │
   └──► [[Mod:INFRA-04]] Operation White-Bloom Nitrification Beds (+ Hardwood-Timber from ECOL-06)
           └──► provides: [Material: Direct-Reduced-Iron], [Chem: Saltpeter-Nitrate], [Fuel: Black-Powder]
                   └──► Feeds Iron to [[Mod:INFRA-02]], [[Mod:FACT-06]], [[Mod:EDGE-02]]

[Ecology: Ancient-Temperate-Rainforest] (Redwoods Node #4 / High Canopy Node #9)
   └──► [[Mod:ECOL-06]] High Canopy Redwoods & Amber-Resin Taps
           │  provides: [Material: Hardwood-Timber], [Material: Amber-Pitch]
           ├──► Feeds Timber to [[Mod:INFRA-04]] Nitrification Beds & [[Mod:ESOT-01]] Yellow Rags Print Media
           └──► Feeds Timber + Amber-Pitch to [[Mod:EDGE-04]] High Arboreal Suspension Highways

[Geography: Marine-Tidal-Flume] (Blackmire Swamp Node #5 / Coastal Shelf Node #6)
   └──► [[Mod:INFRA-05]] Swamp Mist-Maker Poles & Pitcher Distillery
           │  provides: [Power: Compressed-Air-8Bar], [Bio: Scent-Stripping-Mist]
           ├──► Feeds 8-Bar Air to [[Mod:EDGE-03]] Walters Wiggles Pneumatic Capsule Tube
           └──► Feeds 8-Bar Air (+ Smelted-Alloy from INFRA-02) to [[Mod:INFRA-09]] Zim-Sharr Perimeter Braziers
```

### 6.2 Master Contract Table: `opal_island` Infrastructure, Ecology & Climax Chains

| Module ID | Title | Tier | Requires (`requires`) | Provides (`provides`) | Standalone Fallback Degradation |
| :--- | :--- | :---: | :--- | :--- | :--- |
| [[Mod:INFRA-01]] | Hydro Pelton Wheel & DC Dynamo | **3** | `Geography: High-Elevation-Water-Head` | `Power: High-Amperage-DC`<br>`Hydraulics: Industrial-Tailrace-Flow` | Rigged to tidal flume or mule treadmill; drops to 20% output (illumination only; cannot drive arc furnaces). |
| [[Mod:INFRA-02]] | Carbon Electric Arc Smelting Furnace | **3** | `Power: High-Amperage-DC`<br>`Material: Direct-Reduced-Iron` | `Material: Smelted-Alloy`<br>`Chem: CaC2-Carbide-Pellets` | Converts to coal-blast cupola furnace (2200°F vs 4500°F); casts basic iron tools but **cannot synthesize Calcium Carbide**. |
| [[Mod:INFRA-03]] | "Argent-Fume" Incendiary Smokewall | **3** | `Chem: CaC2-Carbide-Pellets`<br>`Water: Distilled-Potable-Water` | `Defense: Acetylene-Smoke-Screen`<br>`Defense: Stirge-Swarm-Immunity` | Converts to sulfur-pitch smudge pots; defense drops from Level 4 to Level 2 (vulnerable to full stirge swarms). |
| [[Mod:INFRA-04]] | Operation White-Bloom Nitrification Beds | **3** | `Material: Hardwood-Timber`<br>`Geography: High-Elevation-Water-Head` | `Material: Direct-Reduced-Iron`<br>`Chem: Saltpeter-Nitrate`<br>`Fuel: Black-Powder` | Operates at homestead latrine scale (10% saltpeter volume; supports hunting muskets but not artillery). |
| [[Mod:INFRA-05]] | Swamp Mist-Maker Poles & Distillery | **3** | `Geography: Marine-Tidal-Flume` | `Power: Compressed-Air-8Bar`<br>`Bio: Scent-Stripping-Mist` | Handheld atomizers / smudge pots creating 10-ft clouds for 10 mins instead of continuous perimeter mist. |
| [[Mod:INFRA-06]] | Gnomish Freewave Vacuum-Tube Radio | **3** | `Power: High-Amperage-DC` | `Signal: Freewave-HF-Radio`<br>`Chem: Commercial-Sulfuric-Acid` | Unpowered crystal detector receiver; can listen to high-power broadcasts but cannot transmit. |
| [[Mod:INFRA-07]] | Lakestone Resonant Menhir Relay | **3** | `Geography: Deep-Brine-Well`<br>`Signal: Freewave-HF-Radio` | `Signal: Resonant-Menhir-Relay`<br>`Chem: Refined-Salt-and-Bromine`<br>`Water: Distilled-Potable-Water` | Functions as a passive acoustic menhir granting advantage on concentration/divination within 100 yards. |
| [[Mod:INFRA-08]] | Cyclopean Cryo-Pyramid & Coils | **3** | `Power: High-Amperage-DC` | `Facility: Cryo-Preservation-Vaults`<br>`Thermal: Cryogenic-Cooling-Grid` | Permafrost melts over 3 months, flooding forest and releasing dormant prehistoric pathogen spores. |
| [[Mod:INFRA-09]] | Zim-Sharr Perimeter Braziers & Wards | **3** | `Material: Smelted-Alloy`<br>`Power: Compressed-Air-8Bar` | `Defense: Sonic-Resonator-Wards`<br>`Defense: Heavy-Harbor-Boom-Grid` | Replaces sonic crystals with rhythmic bronze bell towers and chemical fuel with sulfur-tallow smudge pots. |
| [[Mod:ECOL-01]] | Crystalline Stirge Hives & Queen | **2** | `Ecology: Subterranean-Moist-Vaults` | `Hazard: Subterranean-Stirge-Swarm`<br>`Bio: Concentrated-Blood-Alkaloids` | Solitary scouting flights of 1d6 stirges repelled by ordinary wood smoke. |
| [[Mod:ECOL-05]] | Glacial Quartz Meltwater Caverns | **2** | `Ecology: Alpine-Glacial-Caverns` | `Water: Sterile-Quartz-Water`<br>`Material: Pure-Quartz-Crystals` | High mountain mineral spring yielding drinking water without subterranean sluice gates (feeds [[Mod:SPARK-02]]). |
| [[Mod:ECOL-06]] | High Canopy Redwoods & Amber Taps | **2** | `Ecology: Ancient-Temperate-Rainforest` | `Material: Amber-Pitch`<br>`Material: Hardwood-Timber` | Small hillside cedar grove yielding limited amber pitch (counters [[Mod:SPARK-04]] Iron-Blight). |
| [[Mod:EDGE-02]] | South Coastal Road Paving Initiative | **2** | `Material: Smelted-Alloy`<br>`Material: Direct-Reduced-Iron` | `Transit: Paved-Coastal-Highway` | Half-buried ancient Roman-style causeway clearable node-by-node. |
| [[Mod:EDGE-03]] | Walters Wiggles Switchback Ascent | **2** | `Power: Compressed-Air-8Bar` | `Transit: Switchback-Cliff-Stairway`<br>`Comms: Pneumatic-Capsule-Tube` | Grueling manual foot-climb switchback trail without pneumatic capsule message delivery. |
| [[Mod:EDGE-04]] | High Arboreal Suspension Highways | **2** | `Material: Amber-Pitch`<br>`Material: Hardwood-Timber` | `Transit: Canopy-Suspension-Highway` | Isolated rope-bridge bottleneck spanning a single forest ravine. |
| [[Mod:ESOT-01]] | Yellow Rags: Weaponized Print Media | **5** | `Material: Hardwood-Timber` | `Subversion: Weaponized-Print-Media`<br>`Info-War: Counterfeit-Pardons-and-Scandal` | Handwritten broadsheets and chalk notices in an illiterate shantytown. |
| [[Mod:ESOT-06]] | The Cosmic Collider & Planar Breach | **5** | `Power: High-Amperage-DC`<br>`Material: Smelted-Alloy` | `Climax: Subterranean-Particle-Collider`<br>`Anomaly: Planar-Breach-Trigger` | Unstable arcane accelerator causing localized gravity anomalies. |

---

## 7. Complete Supply-Chain Topology: `generic_starter` (52 Modules)

In [[File:campaigns/generic_starter/modules_manifest.json]], the 52 modules are organized into five modular layers designed for plug-and-play fantasy sandboxes and historical-archaeological simulations:

### 7.1 Layer Breakdown in `generic_starter`

1. **System Core Governance (`FACT-01`..`04`, `FACT-06`, `SPARK-08`)**:
   - `[[Mod:FACT-01]]` provides `Governance: Sovereign-Hub-Archetypes`, which directly satisfies the upstream requirement of `[[Mod:FACT-02]]` (2-Axis Tension Matrix) and `[[Mod:FACT-03]]` (Decapitation-Proof Mosaic Governance).
2. **Tutorial Isle Starter Pack (`STARTER-01`..`06`)**:
   - Self-contained Level 1–6 borderland modules (`[[Mod:STARTER-01]]` River Watermill -> `Food: Milled-Flour-Stores` & `Hydraulics: River-Weir-Control`; `[[Mod:STARTER-02]]` Smugglers' Cove; `[[Mod:STARTER-03]]` Goblin Warrens -> `Material: Crude-Iron-Scrap`; `[[Mod:STARTER-04]]` Ancient Barrow; `[[Mod:STARTER-05]]` Mountain Watchtower; `[[Mod:STARTER-06]]` Whispering Old Woods -> `Medicine: Healing-Herbal-Salves` & `Material: Heartwood-Timber`).
3. **Tier 0 Mundane Settlement Substratum (`T0-DOM-01`..`08`)**:
   - Granular socketable versions of the 8 survival domains (`[[Mod:T0-DOM-01]]` through `[[Mod:T0-DOM-08]]`), allowing GMs running in **Granular Modularity Mode** to model village subsistence, artesian wells, cruck timber framing, parish watch bailiffs, blacksmith barter squares (`requires: [Material: Scrap-Iron-Billets, Fuel: Hardwood-Charcoal]`), midwifery hearths, swine midden trenches, and boundary shrines.
4. **Creative Backlog Waves 1–5 (`CWT-010`..`050`)**:
   - **Wave 1 Climax Engines (Tier 5)**: `[[Mod:CWT-010]]` Biogenic Spore Bloom (consumes `Bio: Concentrated-Blood-Alkaloids` from `[[Mod:CWT-031]]` or `[[Mod:ECOL-01]]`), `[[Mod:CWT-011]]` Imperial Regicide, `[[Mod:CWT-012]]` Clockwork Demiurge, `[[Mod:CWT-013]]` Necrotic Eclipse, `[[Mod:CWT-014]]` Cosmic Planar Collision, and `[[Mod:CWT-015]]` Great Peasant Levée.
   - **Wave 2 Transit Corridors (Tier 2)**: `[[Mod:CWT-020]]` Minecart Gravity Incline, `[[Mod:CWT-021]]` River Sluice Lock, `[[Mod:CWT-022]]` Glacial Cable Funicular, `[[Mod:CWT-023]]` Sunken Willow Canal, `[[Mod:CWT-024]]` High Sierra Switchback Trail, and `[[Mod:CWT-025]]` Volcanic Basalt Causeway.
   - **Wave 3 Biological Life-Support (Tiers 2–3)**: `[[Mod:CWT-030]]` Terraced Hydroponic Rice Flumes (consumes `Hydraulics: Industrial-Tailrace-Flow` from `[[Mod:INFRA-01]]`), `[[Mod:CWT-031]]` Botanical Apothecary & Anti-Venom Foundry (provides `Bio: Concentrated-Blood-Alkaloids` to `[[Mod:CWT-010]]`), `[[Mod:CWT-032]]` Subterranean Fungiculture Vaults, `[[Mod:CWT-033]]` Altiplano Camelid Herds, and `[[Mod:CWT-034]]` Deep-Well Aquifer Siphon.
   - **Wave 4 Color & Tarot Balancing (Tiers 1–3)**: `[[Mod:CWT-040]]` Sylvan Sanctuary of The Lovers, `[[Mod:CWT-041]]` Scholastic Scriptorium, `[[Mod:CWT-042]]` Stargazer Spire, `[[Mod:CWT-043]]` Colossal Foundry of Strength (consumes `Material: Direct-Reduced-Iron` and provides `Material: High-Tensile-Crucible-Steel`), `[[Mod:CWT-044]]` Dawn Cathedral, and `[[Mod:CWT-045]]` Chasm Tollbridge.
5. **Wave 6 *Civilizations & Collapse* Archaeological Suite (`CWT-060`..`078`) & `HOOK-01`**:
   - Grounded in real-world historical and archaeological collapse mechanics (attributed to `Chill Dude Explains` / historical anthropology):

| Module ID | Historical / Archaeological Reference Anchor | Tier | Requires (`requires`) | Provides (`provides`) | Collapse / Fallback Trigger |
| :--- | :--- | :---: | :--- | :--- | :--- |
| [[Mod:CWT-060]] | **1177 BC Late Bronze Age Collapse** (Palatial trade cascade) | **1** | `Trade: Maritime-Tin-Corridor`<br>`Mineral: Refined-Ingot-Supply` | `Governance: Systemic-Interdependence-Matrix`<br>`Tension: Trade-Cascade-Contagion` | Severed tin/copper corridors dissolve palatial hubs into autarkic subsistence. |
| [[Mod:CWT-060A]] | **Late Bronze Age Cyprus** (Enkomi oxhide copper smelting) | **3** | `Fuel: Highland-Charcoal-Timber`<br>`Labor: Conscripted-Slag-Workers` | `Mineral: Refined-Copper-Ingots`<br>`Industry: Blast-Furnace-Crucibles` | Deforestation forces scrub-brush firing (-80% output, toxic sulfur fumes). |
| [[Mod:CWT-061]] | **Derinkuyu Underground City** (Cappadocia 18-tier tuff refuge) | **2** | `Geology: Soft-Volcanic-Tuff-Stratum`<br>`Air: Vertical-Convection-Airshafts` | `Topography: Subterranean-Refuge-Node`<br>`Defense: Hermetic-Rolling-Door-Seals`<br>`Life-Support: Deep-Tuff-Aquifer-Well` | Poisoned airshafts trigger hermetic blast-door lockdown (14-day oxygen clock). |
| [[Mod:CWT-062]] | **Thonis-Heracleion** (Canopic Nile seismic clay liquefaction) | **2** | `Geography: Alluvial-Nile-Silt-Islands`<br>`Hydrology: High-Tide-Barrier-Jetties` | `Transit: Delta-Maritime-Gateway`<br>`Commerce: Royal-Customs-Toll-Office`<br>`Relic: Submerged-Amun-Gereb-Treasury` | Seismic liquefaction sinks port 10m underwater (-90% trade, wreck scavengers). |
| [[Mod:CWT-063]] | **Greater Angkor Hydraulic Network** (Khmer barays & monsoons) | **3** | `Labor: Corv-e-Canal-Dredging-Crews`<br>`Climate: Predictable-Bimodal-Monsoon-Cycle` | `Agriculture: Quad-Harvest-Wetland-Rice`<br>`Hydrology: Macro-Baray-Reservoir-Network`<br>`Engineering: Masonry-Silt-Scouring-Sluice` | ENSO mega-monsoon siltation incises river 5m below canal intakes (-85% rice). |
| [[Mod:CWT-064]] | **Garamantian Empire** (Saharan foggara fossil water mining) | **3** | `Labor: Chattel-Slave-Tunneling-Crews`<br>`Engineering: Subterranean-Gradient-Surveyors` | `Life-Support: Subterranean-Fossil-Water-Flow`<br>`Agriculture: Saharan-Polyculture-Oasis`<br>`Mineral: Leached-Saline-Salt-Cakes` | Non-renewable water table drops below foggara gradient; oasis salinizes. |
| [[Mod:CWT-065]] | **Joseph Tainter Complexity Trap** (*Collapse of Complex Societies*) | **4** | `Food: Agrarian-Surplus-Tribute`<br>`Bureaucracy: Hyper-Specialized-Scribe-Castes` | `Governance: Diminishing-Marginal-Returns-Engine`<br>`Tension: Elite-Overproduction-Sclerosis` | Tribute drops below bureaucratic overhead; peasantry de-affiliates to Tier 0. |
| [[Mod:CWT-066]] | **Göbekli Tepe** (PPNA hunter-gatherer T-pillar sanctuaries) | **5** | `Ecology: Wild-Einkorn-Gazelle-Herds`<br>`Culture: Multi-Clan-Pilgrimage-Compact` | `Climax: Pre-Agrarian-Apotheosis`<br>`Ritual: Megalithic-T-Pillar-Enclosure` | Sanctuary intentionally backfilled with limestone rubble when compact expires. |
| [[Mod:CWT-067]] | **Tollense Valley Battlefield** (c. 1250 BC unwritten causeway war) | **5** | `Geography: Marshland-River-Causeway`<br>`Military: Heavy-Bronze-Warrior-Retinues` | `Climax: Total-Bronze-Age-Battlefield-Rift`<br>`Relic: Standardized-Bronze-War-Spur` | Mutual annihilation swallowed by anaerobic river peat for 3,200 years. |
| [[Mod:CWT-068]] | **Upano Valley Amazonian Cities** (LiDAR earthen tolas & canals) | **2** | `Ecology: Managed-Canopy-Agroforestry`<br>`Labor: Community-Biochar-Composters` | `Agriculture: Anthropogenic-Terra-Preta`<br>`Topography: Sunken-Canal-Causeway-Grid` | Mount Sangay volcanic tephra chokes canals (-70% yield, jungle regrowth). |
| [[Mod:CWT-069]] | **Roman Plumbum Fistulae & Antoninianus Debasement** | **3** | `Metal: Refined-Lead-Pig-Ingots`<br>`Bullion: Silver-Denarius-Reserves` | `Infrastructure: Lead-Fistulae-Aqueduct-Grid`<br>`Economy: Imperial-Coinage-Mint` | Hyperinflation and elite saturnine gout trigger municipal flight and barter. |
| [[Mod:CWT-070]] | **Rapa Nui (Easter Island)** (Rano Raraku moai & palm extinction) | **3** | `Material: Palm-Fiber-Hauling-Cables`<br>`Food: Deep-Sea-Tuna-Porpoise-Catch` | `Structure: Megalithic-Moai-Effigies`<br>`Agriculture: Lithic-Basalt-Mulch` | Polynesian rat seed predation and timber hauling end canoe fisheries; Birdman cult rises. |
| [[Mod:CWT-071]] | **Cahokia & Monks Mound** (Mississippian maize & mega-flood) | **4** | `Labor: Basket-Carried-Alluvial-Earth`<br>`Forest: Upland-Oak-Palisade-Timber` | `Agriculture: Intensive-Floodplain-Maize`<br>`Structure: Monumental-Earthen-Monks-Mound` | 1200 CE mega-flood inundates floodplain; commoners torch 2-mile palisade. |
| [[Mod:CWT-072]] | **The Antikythera Mechanism** (37-gear differential bronze computer) | **5** | `Metal: Low-Oxidation-Fine-Bronze-Gears`<br>`Mathematics: Hipparchian-Lunar-Calculus` | `Relic: Differential-Bronze-Clockwork-Computer`<br>`Science: Saros-Eclipse-Predictor` | Shipwreck sinks into seabed calcification, triggering a 1,500-year horological dark age. |
| [[Mod:CWT-073]] | **Harappan / Indus Valley Grid** (Mohenjo-daro drains & Saraswati) | **2** | `Hydrology: Perennial-Glacial-River-Flow`<br>`Resource: Kiln-Baked-Mudbrick-Supply` | `Infrastructure: Municipal-Sanitary-Drain-Grid`<br>`Metrology: Standardized-Cubical-Chert-Weights` | River avulsion dries Ghaggar-Hakra; brick sewers clog and cities de-urbanize. |
| [[Mod:CWT-074]] | **Teotihuacan Burn Horizon** (Avenue of the Dead selective revolt) | **4** | `Material: Volcanic-Basalt-Lime-Plaster`<br>`Agriculture: Valley-Chinampa-Irrigation` | `Structure: Talud-Tablero-Pyramidal-Citadel`<br>`Industry: Green-Pachuca-Obsidian-Blade-Cores` | Populist uprising surgically incinerates elite palaces while sparing apartment compounds. |
| [[Mod:CWT-075]] | **Chaco Canyon Great Houses** (Pueblo Bonito timber roads & drought) | **3** | `Forest: High-Altitude-Ponderosa-Pine-Timbers`<br>`Hydrology: Ephemeral-Wash-Runoff-Harvesting` | `Topography: Prehistoric-Chaco-Road-Radial-Grid`<br>`Structure: Multi-Story-Core-and-Veneer-Great-House` | 1130 CE 50-year megadrought triggers ritual kiva sealing and cliff-dwelling migration. |
| [[Mod:CWT-076]] | **Great Zimbabwe Enclosure** (Shona mortarless granite & gold trade) | **3** | `Fauna: Highveld-Humped-Cattle-Herds`<br>`Material: Thermal-Exfoliated-Granite-Slabs` | `Structure: Mortarless-Curved-Granite-Great-Enclosure`<br>`Trade: Indian-Ocean-Dhow-Monopoly` | Savanna cattle overgrazing and firewood exhaustion force northward dynastic shift. |
| [[Mod:CWT-077]] | **Nan Madol Basalt Megacity** (Pohnpei 92 artificial lagoon islets) | **2** | `Transit: Double-Hulled-Log-Raft-Flotilla`<br>`Life-Support: Mainland-Freshwater-and-Taro-Tribute` | `Topography: Inter-Tidal-Canal-Artificial-Islet-Network`<br>`Structure: Columnar-Basalt-Log-Stacked-Fortress` | Overthrow of Saudeleur dynasty halts mainland water/breadfruit tribute; mangroves engulf canals. |
| [[Mod:CWT-078]] | **Skara Brae Midden Haven** (Orkney subterranean flagstone village) | **2** | `Material: Marine-Flagstone-Quarry-Beds`<br>`Insulation: Decomposed-Bio-Midden-Earth` | `Topography: Subterranean-Midden-Insulated-Haven`<br>`Life-Support: Peat-Fired-Communal-Hearth-Grid` | North Atlantic winter gales bury sunken roofs beneath sand dunes for 5,000 years. |
| [[Mod:HOOK-01]] | **Company Town & Truck-System Fracture** (19th-c. scrip peonage) | **4** | `Authority: Company-Bailiff-Garrison`<br>`Logistics: Truck-Store-Grain-Rations`<br>`Transit: Physical-Arterial-Corridor` | `Labor: Indentured-Resource-Extraction`<br>`Intel: Company-Store-Debt-Ledger`<br>`Faction: Radicalized-Labor-Solidarity-Cell` | Slots onto any arterial ore/resource transit edge (`E_adj`) to spark a labor-strike dilemma. |
