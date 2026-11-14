---
id: SYS-LOOT-03
title: "AdventureCAD Host Readiness: Lifecycle, Extension Persistence & Atomic Item Bridge"
parent: SYS-LOOT-01
type: task
wayfinder: claimed
blocked_by: ["SYS-LOOT-02"]
pipeline_tier: 0
target_surface: "start.html"
status: in_drafting
triage: accepted
category: "system_architecture"
track: "Platform Development"
priority: "High"
wave: "Workstation Architecture: Modular Loot & Multi-Source Tables"
grounded_prerequisites: [
  "src/workstation/scripts/workstation_state.js",
  "src/workstation/scripts/state_adapter.js",
  "src/workstation/scripts/campaign_mutation_engine.js",
  "src/workstation/scripts/entity_core.js",
  "src/workstation/scripts/map_store.js",
  "src/workstation/scripts/campaign_exporter.js",
  "src/workstation/scripts/pack_engine.js",
  "src/workstation/scripts/selective_importer.js"
]
grounded_yields: [
  "Exactly-Once Mod Lifecycle Dispatch & Disabled-Mod Guard (HOST-02)",
  "Campaign-Global extensions Persistence Across Multi-Map Reload & All Package Formats (HOST-03)",
  "Atomic Create-Only Item Batch Acceptance, Split/Stack Helper & Sovereign Invariant #5 Reciprocal Sync (HOST-04/05)"
]
provides: ["Host: Loot-Adapter-Runtime", "Host: Create-Only-Entity-Batch", "Host: Campaign-Extensions-Transport"]
requires: ["Contract: Loot-Host-Adapter-v1"]
standalone_fallback: "Existing core item CRUD and prototype promotion."
---
# SYS-LOOT-03: AdventureCAD Host Readiness (`HOST-02`..`HOST-05`, Gate G2)

Implements Team A host readiness deliverables verified against Gate G2.
