---
file_path: "network/modules_manifest.json"
title: "modules_manifest.json"
volume: "vol-5"
kind: "Authoritative JSON Data / Manifest"
current_hash: "2b09e601dfaf464d"
reviewed_hash: "2b09e601dfaf464d"
stale: false
size_bytes: 214379
line_count: 3595
---

# modules_manifest.json

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`network/modules_manifest.json` is the **Authoritative JSON Manifest of Worldbuilding Modules** within **Volume V: Network Surfaces, Topologies & CLI Simulation (network/)**. Converted to pure JSON under remediation ticket `TICKET-04` ([[File:.scratch/creator-remediation/issues/04-build-centralized-compiler.md]]), this 2,779-line catalog indexes every Tier 1 through Tier 5 module across all registered campaign packages.

It is governed by [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]] and powers [[Series:series_d_module_supply_chains_and_contradictions]].

---

## Module Schema & Metadata Contracts
Each module entry adheres to the 5-Tier Worldbuilding Schema:
- **Identifier & Location**: `id` (e.g., `ESOT-01`, `GOV-03`), `title`, `category` (`GOV`, `WAR`, `REL`, `COM`, `CRIM`, `CUL`, `ESOT`, `WILD`, `MON`), and relative `path`.
- **Pipeline Tier Level**: `tier` ($1..5$) from Macro Governance (Tier 1) to Climax Engines (Tier 5).
- **Resource Tag Contracts**:
  - `provides`: Array of typed resource capabilities emitted by this module (e.g., `caloric_surplus`, `arcane_warding`, `iron_ore`).
  - `requires`: Array of typed prerequisites necessary for the module to function without crisis metamorphism.
- **Build Pipeline Role**: Parsed by [[File:build_suite.js]] (lines 142–170) to generate the global `MODULES_MANIFEST` array in [[File:network/campaign_studio.html]] and [[File:network/network_visualizer.html]].
<!-- END_CUSTOM_NOTES -->
