---
id: SYS-LOOT-04
title: "Loot Simulator Workstation Mod: Pool Engine, Presets, Simulation & Starter Packs"
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
  "scratch/loot-planning/mod-findings.md",
  "scratch/loot-planning/01-shared-contract.md"
]
grounded_yields: [
  "Declarative Source Pack Validator, Resolver & Zero-CORS Bundler (MOD-01, MOD-07)",
  "Normalized Multi-Source Pool Sampler, Unique Mode, Deterministic Replay & Batch Simulator (MOD-02, MOD-06)",
  "Native Win95 MDI Tool Window, Presets, Preview/Accept Workflow & Update Diff Review (MOD-03, MOD-04, MOD-05, MOD-08)"
]
provides: ["Mod: loot_simulator", "Catalog: Starter-Loot-Packs"]
requires: ["Contract: Loot-Host-Adapter-v1", "Host: Loot-Adapter-Runtime"]
standalone_fallback: "Pure engine and mock host adapter execution."
---
# SYS-LOOT-04: Loot Simulator Workstation Mod (`MOD-01`..`MOD-08`, Gate G3/G4)

Implements Team B Loot Simulator Mod under `mods/loot_simulator/` and `test/loot_*.test.js`, verified against Gates G3 and G4.
