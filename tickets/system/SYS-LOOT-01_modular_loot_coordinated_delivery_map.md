---
id: SYS-LOOT-01
title: "Modular Loot System: Coordinated Delivery & Gate Map"
pipeline_tier: 0
target_surface: "start.html"
status: in_drafting
triage: accepted
category: "system_architecture"
track: "Platform Development"
priority: "High"
wave: "Workstation Architecture: Modular Loot & Multi-Source Tables"
grounded_prerequisites: [
  "docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md",
  "docs/adr/0022-coauthoring-architecture-and-rejected-patterns.md",
  "scratch/loot-planning/00-coordination-and-gates.md",
  "scratch/loot-planning/01-shared-contract.md"
]
grounded_yields: [
  "Versioned Host-Mod Loot Adapter & Contract Suite (G1)",
  "Atomic Create-Only Item Acceptance with Sovereign Invariant #5 Reciprocal Crosslinks (G2)",
  "Multi-Source Normalized Pool Engine, Presets, Replay & Zero-CORS Starter Packs (G3-G6)"
]
provides: ["Workstation: Modular-Loot-System", "Workstation: Loot-Host-Adapter"]
requires: ["Workstation: start.html", "CampaignMutationEngine"]
standalone_fallback: "Standard manual item creation and prototype promotion in Item Catalog."
blocks: ["SYS-LOOT-02", "SYS-LOOT-03", "SYS-LOOT-04", "SYS-LOOT-05"]
---
# SYS-LOOT-01: Modular Loot System — Coordinated Delivery & Gate Map

## Notes
Parent coordination ticket governing Team A (Host Readiness) and Team B (Loot Simulator Mod) under the G0–G6 gate sequence defined in `scratch/loot-planning/00-coordination-and-gates.md` and `01-shared-contract.md`.

## Decisions-so-far
- **G0 Approved (2026-11-09)**: Baseline recorded in `scratch/loot-planning/04-g0-baseline-record.json` (`HEAD: 22516681710f41dd8e5f07fe7b2c618bf20bcda7`).
- **CR01–CR07 Reconciled**:
  - Campaign-wide state stored in `extensions.loot_simulator` (256 KiB inline ceiling, persisted in `creator_studio_campaign_entities` and all package formats; custom packs up to 5 MiB in IndexedDB `CreatorStudioMapDB`).
  - Quantity mapped as 1 host item entity per accepted result slot (`quantity >= 1`) + host Split/Stack helper.
  - Sovereign Invariant #5 reciprocal crosslinks (`node.itemIds[]`, `npc.carriedItemIds[]`, `quest.itemIds[]`) enforced on acceptance and scrubbed on delete/`revertBatch`.
  - Create-only batch semantics (`create_entity` / `options.createOnly`) bypass name-matching in `CampaignMutationEngine.upsertEntity`.
  - Starter packs (`diablo2`, `oblivion`, `smash`) bundled for zero-CORS `file:///` execution and validated against `FORBIDDEN_TOKENS` / `NON_ITEM_KEYWORDS`.

## Child Tickets
- `SYS-LOOT-02`: Shared Contract & G1 Fixture Packet (`HOST-00`/`HOST-01`, `MOD-00`)
- `SYS-LOOT-03`: Host Readiness — Lifecycle, Extensions Persistence & Atomic Item Bridge (`HOST-02`..`HOST-05`, Gate G2)
- `SYS-LOOT-04`: Loot Simulator Mod — Catalog, Pool Engine, UI, Simulation & Starter Packs (`MOD-01`..`MOD-08`, Gate G3/G4)
- `SYS-LOOT-05`: Deferred Backlog — Faithful Game Rule Engines (Diablo 2 Treasure Classes, Oblivion Leveled Lists, Smash Edition Rules) & Context Suggestions
