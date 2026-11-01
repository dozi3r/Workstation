---
file_path: "docs/MODULES_CATALOG.md"
title: "CAMPAIGN CREATOR: UNIVERSAL PLUG-AND-PLAY MODULE LIBRARY"
volume: "vol-8"
kind: "Technical Documentation / Guide"
current_hash: "1a1532d86d0fd57e"
reviewed_hash: "1a1532d86d0fd57e"
stale: false
size_bytes: 11737
line_count: 136
---

# CAMPAIGN CREATOR: UNIVERSAL PLUG-AND-PLAY MODULE LIBRARY

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/MODULES_CATALOG.md` is the **Master Module Router, Architecture Guide & GM Slotting Manual** within **Volume VIII: Campaign Packages, Modules, Templates & Unified Ticket Backlog**. Relocated from `modules/README.md` under [[Ticket:SYS-AUDIT-01]], it acts as the primary conceptual index and navigational gateway connecting the universal authoring framework to specific campaign packages in [[File:campaigns/opal_island]] and [[File:campaigns/generic_starter]].

Directly governed by [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], [[File:docs/srd/adventure_framework_srd.md]], [[Series:series_d_module_supply_chains_and_contracts]], and tracked under [[Ticket:SYS-AUDIT-01]].

---

## The 5-Tier Worldbuilding Pipeline
The catalog establishes the foundational 5-tier vertical hierarchy that governs all playable content in Creator Studio:

```text
               UNIVERSAL CAMPAIGN CREATOR 5-TIER PIPELINE
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TIER 1: MACRO NETWORK & GOVERNANCE ENGINES                             │
 │ • Sovereign Hubs, Smothering, Tension Matrix, Mosaic Cell Syndicates   │
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

## Multi-Campaign Routing & Settings Decoupling
Per the "2 Settings & A System" architecture formalized in ADR-0001 and ADR-0002, `docs/MODULES_CATALOG.md` routes between two distinct operational environments:
1. **Generic Starter Campaign (`campaigns/generic_starter/`)**:
   - A clean, accessible tutorial setting (Levels 1–6) comprising 12 baseline starter modules.
   - Designed for rapid onboarding and low cognitive load, demonstrating basic governance, arrival gambits, watermills, and frontier riots.
2. **Opal Island Industrial-Alchemical Setting (`campaigns/opal_island/`)**:
   - The flagship production setting comprising 48 deeply integrated modules organized across 7 thematic sets:
     - `Set_A`: Infrastructure and Engineering
     - `Set_B`: Ecology and Biomes
     - `Set_C`: Faction and Governance
     - `Set_D`: Social Dynamics and Conflation
     - `Set_E`: Transit and Edges
     - `Set_F`: Catalysts, NPCs, and Dilemmas
     - `Set_G`: Esoterica and Information Warfare

---

## Resource Contracts & Supply Chain Graph Integration
Every module cataloged via this router declares explicit inputs and outputs:
- **`provides`**: Resources generated (e.g. `Bio: Caloric-Grain-Surplus`, `Power: Pelton-Hydroelectric-Output`, `Authority: Consular-Warrant`).
- **`requires`**: Dependencies necessary for stable operation.
- **Starvation & Cascade Rules**: If transit corridors are severed or provider nodes fall below required dial levels, consumer modules advance their local threat clocks. This dependency topology is compiled by [[File:build_suite.js]] and visualized interactively in [[File:network/platform_audit_dashboard.html]].

---

## Remediation & Audit Provenance ([[Ticket:SYS-AUDIT-01]])
During the October 2026 audit, this document was remediated under [[File:.scratch/creator-remediation/issues/01-fix-stale-desktop-links.md]] to eliminate broken hardcoded paths and reconcile legacy references to monolithic root module directories, aligning it with the modern decoupled multi-campaign directory structure.
<!-- END_CUSTOM_NOTES -->
