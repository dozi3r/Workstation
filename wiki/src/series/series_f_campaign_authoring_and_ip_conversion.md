---
series_id: "series_f_campaign_authoring_and_ip_conversion"
code: "Series F"
title: "Authoring Custom Campaign Presets, IP Conversions & Scenario Primitives"
volume: "vol-2"
---

# Series F: Authoring Custom Campaign Presets, IP Conversions & Scenario Primitives

> [!IMPORTANT]
> **Cross-Cutting Analytical Series**: End-to-end engineering and design specification for transforming any setting, historical era, or Intellectual Property (IP) into a 100% validated Creator Studio Campaign Preset Package (`campaigns/<campaign_id>/`) without setting bleed or system lock-in.

---

## 1. Architectural Seam Overview & The "Universes Beyond" Paradigm

Creator Studio is engineered around **ADR-0001 (Dual-Mode Preset Architecture)** ([[File:docs/adr/0001-dual-mode-preset-architecture.md]]) and **ADR-0002 (Dual SRD and Tiered Module Architecture)** ([[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]]). Rather than hardcoding setting lore into the simulation engine, Creator Studio treats every campaign world as an isolated, plug-and-play **Sourcebook Package** under `campaigns/<campaign_id>/`.

Whether an author is converting a classical myth (*Journey to the West* in `campaigns/sun_wukong/`), a historical crisis (*The Crossing of the Rubicon* in [[File:templates/examples/HIST-01_The_Crossing_of_the_Rubicon.md]]), an anime/sci-fi conflict (*Planet Namek* in [[File:templates/examples/DBZ-01_The_Siege_of_Planet_Namek.md]]), a gothic tabletop classic (*Barovia* in [[File:templates/examples/DND-01_The_Mists_of_Barovia.md]]), or a tutorial sandbox (`campaigns/generic_starter/`), the conversion follows a strict structural pipeline.

### Primary Collaborating Subsystem Files
- [[File:docs/srd/campaign_preset_specification_srd.md]] — Defines the directory layout and JSON schemas (`campaign.json`, `preset.json`, `modules_manifest.json`) required for a campaign package.
- [[File:docs/srd/ip_module_framework_srd.md]] — The cross-domain Rosetta Stone mapping narrative IP elements onto the 5-Tier Pipeline, `[S, E, C]` sociology, typed resource tags, and 4-Corner Opposition webs.
- [[File:docs/srd/scenario_primitives_srd.md]] — Codifies the deconstruction of setting-bound lore into reusable dramatic syllogisms, hazard dials, and semantic resource tokens (`CWT-051`).
- [[File:system/primitives/051_opal_island_module_deconstruction_and_scenario_primitives.md]] — System-level primitives extraction baseline mirrored from `CWT-051`.
- [[File:templates/IP_MODULE_TEMPLATE.md]] — Copy-and-fill YAML frontmatter and Markdown authoring template for individual worldbuilding modules.
- [[File:campaigns/Test-CampaignPackage.ps1]] — Automated PowerShell conformance validator auditing package structure, 22-node / 7-wave / 22-disembark / 5-color invariants, and module frontmatter integrity.
- [[File:build_suite.js]] — Discovers active packages in `campaigns/` and compiles them into `CAMPAIGN_REGISTRY` for [[File:start.html]] and [[File:network/platform_audit_dashboard.html]].

---

## 2. Package Directory Contract & JSON Schemas

Per [[File:docs/srd/campaign_preset_specification_srd.md]], every campaign package resides in `campaigns/<campaign_id>/` and must provide four core components:

```text
campaigns/<campaign_id>/
├── campaign.json            # Identity, author, default dials, and enablement flag
├── preset.json              # 22-node topology, 7 waves, 22 disembark events, 5 color profiles
├── modules_manifest.json    # JSON array indexing all setting modules
└── modules/                 # Authoritative 5-Tier module Markdown files (*.md)
```

### 2.1 `campaign.json` Metadata Contract
Declares the package identifier (`id`), human-readable title (`name`), `enabled` boolean flag (if `false`, the campaign is registered in `CAMPAIGN_REGISTRY` but excluded from active default pools), `author`, `description`, `presetFile` (`"preset.json"`), and `manifestFile` (`"modules_manifest.json"`). Folders starting with `_` (such as `campaigns/_template/`) or `.` are automatically ignored by [[File:build_suite.js]].

### 2.2 `preset.json` Mathematical & Structural Invariants
To guarantee 100% mathematical compatibility with the balancing engine in [[File:mods/tarot_balancing/mod.js]] and [[File:network/Run-NetworkEngine.ps1]], `preset.json` must satisfy four strict invariants verified by [[File:campaigns/Test-CampaignPackage.ps1]]:

| Top-Level Key | Cardinality Invariant | Required Per-Item Schema Fields | Governing Engine Rule |
| :--- | :--- | :--- | :--- |
| **`nodes`** | Exactly **22 keys** (`"1"` to `"22"`) | `name`, `x`, `y`, `eligible` (`bool`), `hubEligibility` (`"candidate"` / `"never"` / `"always"`), `adj` (`int[]`), `infBy` (`int[]`), `cat`, `culture`, `tier` (`0..3`) | Nodes 1–21 are spatial POIs; Node 22 is the Tier 0 Meta-Key governing Global Inversion ([[File:docs/srd/authoring_engine_srd.md]] Section 4.6). |
| **`waves`** | Exactly **7 wave objects** | `wave` (`1..7`), `name`, `nodes` (`int[]`), `desc` | Sequences progressive Tarot draws from Wave 1 (Perimeter Arrival) to Wave 7 (Node 22 Synthesis). |
| **`disembarkTable`** | Exactly **22 card entries** | `cardKey` (`0..21`), `cardName`, `upEvent`, `revEvent`, `upGain`, `revDebt` | Drives the Dockside Arrival & Disembark Protocol ([[File:docs/srd/adventure_framework_srd.md]] Section 6). |
| **`colorWheel`** | Exactly **5 color entries** | `color` (`White`, `Blue`, `Black`, `Red`, `Green`), `culture`, `opsProfile`, `theme`, `perimeterDefense`, `leader`, `economy`, `flaw` | Maps the 5 elected Sovereign Hubs (Ranks 1–5) to their macro-organizational identity ([[File:docs/srd/authoring_engine_srd.md]] Section 4.5). |

---

## 3. Deconstructing an IP into Scenario Primitives & 5-Tier Modules

Rather than writing linear plot scripts or system-locked stat blocks, [[File:docs/srd/ip_module_framework_srd.md]] and [[File:docs/srd/scenario_primitives_srd.md]] prescribe a **3-Step Deconstruction & Translation Method** (modeled on the extraction of the 48 Opal Island modules in `campaigns/opal_island/`):

### 3.1 Step 1: 5-Tier Worldbuilding Pipeline Stratification
Every narrative element, location, or crisis from the source IP is assigned a `pipeline_tier` $\in \{1, 2, 3, 4, 5\}$:
- **Tier 1 (Macro Network & Governance)**: Overarching imperial laws, cold-war tension matrices, or planar lockdowns (e.g., *Roman Lex Cornelia*, *Frieza Force Planetary Quotas*, *Barovian Mist Borders*).
- **Tier 2 (Topological & Biome Anchors)**: Hazardous biomes, apex fauna, entry ports, and transit chokepoints (`EDGE-01..05` equivalents, such as [[Mod:ECOL-01]] or [[Mod:EDGE-03]]).
- **Tier 3 (Infrastructural Supply Chains)**: Resource extractors, generators, smelters, and communication relays that transform upstream inputs into downstream outputs (e.g., [[Mod:INFRA-01]] $\to$ [[Mod:INFRA-02]] $\to$ [[Mod:INFRA-03]]).
- **Tier 4 (Dynamic Narrative Sparks & Clocks)**: Boiling factional dilemmas, ideological conflations, labor strikes, and plagues (e.g., [[Mod:CONF-01]], [[Mod:SPARK-01]]).
- **Tier 5 (Esoteric & Eschatological Engines)**: Reality-warping anomalies, superweapons, and campaign climax triggers (e.g., [[Mod:ESOT-06]], *Planet Namek 5-Minute Core Detonation*).

### 3.2 Step 2: Semantic Resource Tokenization (`provides` & `requires`)
Setting-specific trade goods are abstracted into typed machine-readable contracts (`"[Category]: [Specific-Asset-Name]"`) across standardized categories (`Power`, `Chem`, `Material`, `Fuel`, `Water`, `Defense`, `Signal`, `Bio`, `Tech`, `Authority`, `Labor`, `Climax`). During gameplay and authoring, [[File:src/workstation/scripts/stage_5_slotting.js]] runs a Breadth-First Search (BFS) across unsevered `transit` edges ($k \le 3$ hops) to verify whether each module's `requires` tags are satisfied by upstream `provides` tags. If an edge is severed, the module degrades gracefully to its mandatory `standalone_fallback` clause.

### 3.3 Step 3: Dramatic Syllogism, 4-Corner Opposition & 4-Level Hazard Dials
Using [[File:templates/IP_MODULE_TEMPLATE.md]], each module codifies:
- **Lajos Egri Dramatic Syllogism**: The core thematic premise (`Character Trait + Action Conflict -> Thematic Conclusion`).
- **John Truby 4-Corner Dramatic Opposition Web**: Four irreconcilable local forces—**Establishment** (entrenched authority), **Main Opponent** (active challenger/insurgent), **Thematic Shadow** (profiteer/opportunist), and **Tertiary Outcast** (collateral victim/exile).
- **Universal 4-Level Output Dial & Segmented Threat Clocks**:
  - **Level 1 (Light Tier)**: DC 10 / 2d6 6+ / 1d6 (3) damage.
  - **Level 2 (Moderate Tier)**: DC 13 / 2d6 8+ / 2d8 (9) damage.
  - **Level 3 (Severe Tier)**: DC 16 / 2d6 10+ / 4d10 (22) damage.
  - **Level 4 (Lethal Tier)**: DC 20 / 2d6 12+ / 8d12 (52) damage.
  - **Threat Clocks**: 4-Tick (Tactical), 6-Tick (Operational/Node-Wide), and 8-Tick (Macro/Climax) progress clocks.

---

## 4. Automated Validation & Build Ingestion Pipeline

Once a campaign package is authored under `campaigns/<campaign_id>/`, it undergoes a two-step verification and compilation workflow:

- **Step 1: Package Validation (`campaigns/Test-CampaignPackage.ps1`)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\campaigns\Test-CampaignPackage.ps1 -Campaign <campaign_id>
  ```
  [[File:campaigns/Test-CampaignPackage.ps1]] verifies:
  - Existence and JSON validity of `campaign.json`, `preset.json`, and `modules_manifest.json`.
  - Exact node count (`22`), keys `"1"` through `"22"`, and presence of `name`, `x`, `y`, `cat`, `culture`, `tier`, and `hubEligibility` on every node.
  - Exact wave count (`7`), disembark card count (`22`), and color wheel count (`5`).
  - Physical file existence on disk for every module path in `modules_manifest.json`, plus YAML frontmatter verification for `pipeline_tier`, `provides`, and `requires`.
- **Step 2: Master Suite Compilation (`Build-Suite.ps1`)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
  ```
  [[File:build_suite.js]] ingests the validated campaign into `CAMPAIGN_REGISTRY`, extracts regex-backed `dials`, `threat_clocks`, and `four_corners` from each module's Markdown body, bundles them into [[File:start.html]] and [[File:network/platform_audit_dashboard.html]], and generates 1:1 wiki pages for every new file via [[File:wiki/build_wiki.js]] (see [[Series:series_e_zero_cors_compiler_and_agent_router]]).
