---
file_path: "docs/srd/adventure_framework_srd.md"
title: "Universal Adventure Framework SRD"
volume: "vol-2"
kind: "System Reference Document (SRD)"
current_hash: "69980a6b03bde424"
reviewed_hash: "69980a6b03bde424"
stale: false
size_bytes: 16134
line_count: 218
---

# Universal Adventure Framework SRD

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/srd/adventure_framework_srd.md` is the **System-Agnostic Tabletop Runtime System Reference Document (SRD)** within **Volume II: System Reference Documents (The Dual SRD & Substratum)**. Created under [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]] and [[File:.scratch/creator-remediation/issues/07-universal-adventure-framework-srd.md]], it forms the second half of the **Dual SRD** architecture alongside [[File:docs/srd/authoring_engine_srd.md]]. Whereas the Authoring Engine SRD governs compile-time and studio-time network mathematics, the **Universal Adventure Framework SRD** defines the lightweight tabletop procedures—Threat Clocks, Universal Hazard & Difficulty Tiers, Logistical Supply Units, Clock-Driven Supply Severance Degradation, Crisis Gate Windows, and the Multi-Campaign Sourcebook Ecosystem—referenced by every worldbuilding module in `campaigns/*/modules/` and `tickets/creative/backlog/`.

---

## Core Tabletop Runtime Invariants & Contracts
Every worldbuilding module (`injected_mechanics`) and creative writing ticket (`CWT-*`, `T0-DOM-*`) must adhere to the mechanical standards codified in this SRD:

### 1. Universal Hazard & Difficulty Severity Matrix (Section 3 & 7.3)
To remain interoperable across d20 (*D&D 5e, Knave, OSR*), 2d6 (*PbtA, Traveller*), and dice-pool (*Blades in the Dark / FitD*) systems without embedding proprietary stat blocks, all checks and hazards use four canonical severity tiers mapped 1:1 to the **4-Level Module Output Dial** (Section 7.1):

| Dial Level | Severity Tier | d20 DC Equivalent | 2d6 Target | Damage Die (Avg) | Tabletop Consequence Scale |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **Level 1** | **Light** | DC 10 | 6+ | `1d6` (3 dmg) | Minor delay, superficial injury, routine friction |
| **Level 2** | **Moderate** | DC 13 | 8+ | `2d8` (9 dmg) | Moderate wound, resource depletion, `+1 Threat Tick` |
| **Level 3** | **Severe** | DC 16 | 10+ | `4d10` (22 dmg) | Crippling injury, equipment shattered, node lockdown |
| **Level 4** | **Lethal** | DC 20 | 12+ | `8d12` (52 dmg) | Instant downing/death, permanent structural ruin / Climax Trigger |

### 2. Segmented Threat Clock Engine (Section 2 & 7.2)
- **4-Tick Clock (`[ ][ ][ ][ ]`)**: Imminent tactical crises, stealth alarms, or supply severance degradation.
- **6-Tick Clock (`[ ][ ][ ][ ][ ][ ]`)**: Operational or node-wide environmental shifts.
- **8-Tick Clock (`[ ][ ][ ][ ][ ][ ][ ][ ]`)**: Macro-geopolitical mobilization or campaign climax countdowns.
- **Tick Triggers**: Failed checks / soft moves (`+1`), hazardous corridor traversal (`+1`), or per-turn supply/fuel neglect (`+1`). Players can reverse clocks by expending abstract supply units (Fuel Casks, Silver Vouchers) or completing sabotage/relief objectives.

### 3. Campaign Turn Economy, Q2 Supply Severance & Q3 Crisis Gate Window (Section 4, 5 & 8)
- **Campaign Turn Unit**: `1 Turn = 1 Travel Watch (8 Hours)` or `1 Long Rest`.
- **Clock-Driven Supply Severance Degradation (Q2 Standard, Section 8.3)**: Severing a physical `transit` corridor ($E_{adj}$) does not cause instant binary ruin; instead, downstream dependent modules advance a **4-Segment Threat Clock** at `+1 Tick per Campaign Turn`:
  - `Tick 0/4`: Reserves Holding (normal operation).
  - `Tick 1/4`: Depleted Reserves (`-1` mechanical yield/advantage).
  - `Tick 2/4`: Operational Strain (rationing, `+1` regional peril modifier).
  - `Tick 3/4`: Critical Distress (infrastructure buckling, secondary stress on neighbors).
  - `Tick 4/4`: Threat Threshold reached $\to$ activates **Dial 8: Climax Trigger Protocol**.
- **Climax Trigger Protocol (Q3 Standard, Section 8.4)**:
  - **Mode A (Crisis Gate Window — Default)**: Reaching `4/4` opens a mandatory **1-Session Heroic Crisis Window**. Heroic completion reduces the clock by `-2 Ticks` (back to `2/4`); neglect or failure results in permanent Level 4 ruin.
  - **Mode B (Hardcore Cataclysm)**: Immediate, irreversible Level 4 collapse at `4/4`.

### 4. Modular Campaign Sourcebook Ecosystem (Q1 Architecture, Section 10)
Defines the `campaigns/<campaign_id>/` package standard (`campaign.json`, `preset.json`, `modules_manifest.json`, `modules/`) supporting both **Isolated Mode** (single setting) and **Aggregated Multi-Book Mode** with cross-campaign Weighted Affinity Scoring (`+10 Tarot`, `+5 Culture Match`, `-5 Culture Clash`, `+3 Color Match`).

---

## Data Flow & Subsystem Consumers
- **Module Regex Extraction**: Stage 3 of [[File:build_suite.js]] scans module Markdown files for the `[N Ticks]` Clock syntax and `Level 1..4` Dial syntax defined in this SRD to populate `CAMPAIGN_REGISTRY` and [[File:network/platform_audit_dashboard.html]].
- **Wiki Metadata Extraction**: [[File:wiki/build_wiki.js]] (lines 520–530) parses Threat Clocks and 4-Level Dials from every module and ticket page using this SRD's formatting rules.

---

## AI Agent Maintenance Checklist
- **When drafting or editing any module (`campaigns/*/modules/*.md`) or CWT/Tier-0 ticket (`tickets/`)**: Always format `output_dial` levels 1–4 with their corresponding Severity Tier (`Light Tier, DC 10 / 1d6`, `Moderate Tier, DC 13 / 2d8`, `Severe Tier, DC 16 / 4d10`, `Lethal Tier, DC 20 / 8d12`) and include `[4 Ticks]`, `[6 Ticks]`, or `[8 Ticks]` in threat clock titles so [[File:build_suite.js]] and [[File:wiki/build_wiki.js]] extract them cleanly.
<!-- END_CUSTOM_NOTES -->
