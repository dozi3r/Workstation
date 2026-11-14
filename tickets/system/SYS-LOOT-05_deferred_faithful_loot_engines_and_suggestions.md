---
id: SYS-LOOT-05
title: "Deferred Backlog: Faithful Game Loot Engines, Comprehensive Catalogs & Contextual Suggestions"
parent: SYS-LOOT-01
type: task
blocked_by: ["SYS-LOOT-03", "SYS-LOOT-04"]
pipeline_tier: 0
target_surface: "start.html"
status: discovery
triage: needs-triage
category: "system_architecture"
track: "Platform Development"
priority: "Low"
wave: "Workstation Architecture: Modular Loot & Multi-Source Tables"
grounded_prerequisites: [
  "scratch/loot-planning/00-coordination-and-gates.md"
]
grounded_yields: [
  "Faithful Diablo 2 Treasure Class Tree, NoDrop, ilvl/mlvl/qlvl & MF Diminishing Returns Engine",
  "Faithful Oblivion Leveled List (Calculate from all levels <= PC, Calculate for each item in count) Engine",
  "Edition-Specific Smash Crate/Capsule/Barrel Spawn & Item Frequency Rules",
  "Context-Aware Node/Biome/Culture Table Suggestions with Reason Traces"
]
provides: ["Mod: Faithful-Loot-Engines", "Mod: Contextual-Loot-Suggestions"]
requires: ["Mod: loot_simulator"]
standalone_fallback: "Declarative weighted source-share and entry-weight pool engine shipped in SYS-LOOT-04."
---
# SYS-LOOT-05: Deferred Backlog — Faithful Game Loot Engines & Contextual Suggestions

Tracks deferred post-MVP enhancements separated from the `SYS-LOOT-04` declarative weighted pool MVP.
