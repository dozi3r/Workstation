---
id: SYS-LOOT-02
title: "Modular Loot G1 Contract Freeze & Shared Fixture Suite"
parent: SYS-LOOT-01
type: task
wayfinder: claimed
pipeline_tier: 0
target_surface: "start.html"
status: in_drafting
triage: accepted
category: "system_architecture"
track: "Platform Development"
priority: "High"
wave: "Workstation Architecture: Modular Loot & Multi-Source Tables"
grounded_prerequisites: [
  "scratch/loot-planning/01-shared-contract.md",
  "scratch/loot-planning/02-review-disposition.md"
]
grounded_yields: [
  "Frozen Host-Mod Adapter Contract & Error Envelopes",
  "Deterministic RNG (mulberry32/xmur3), Canonical Digest & Probability Fixtures",
  "Quantity, Idempotency, Reciprocal Crosslink & Security Validation Fixtures"
]
provides: ["Contract: Loot-Host-Adapter-v1", "Fixtures: Loot-G1-Suite"]
requires: ["Workstation: start.html"]
standalone_fallback: "Mock host adapter and standalone JSON schema fixtures."
blocks: ["SYS-LOOT-03", "SYS-LOOT-04"]
---
# SYS-LOOT-02: Modular Loot G1 Contract Freeze & Shared Fixture Suite

Covers `HOST-00`, `HOST-01`, and `MOD-00`. Freezes the concrete host adapter API, extension envelope location, deterministic RNG and canonical hashing rules, quantity-to-instance mapping, and executable G1 contract fixtures.
