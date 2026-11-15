# ADR 0023: Campaign-Independent Workstation Module Packs & Unified v2.0 Module Schema

* **Status**: Accepted
* **Date**: 2026-11-04
* **Deciders**: Executive & Architecture Team

## Context and Problem Statement

Historically, universal worldbuilding modules—including Creative Writing Ticket (`CWT-*`) archetypes, generic starter adventure sites (`STARTER-*`), Tier 0 village substratum modules (`T0-DOM-01..08`), and 98 pre-industrial resource chain modules—were stored inside `campaigns/Peridot/modules/`. This bloated the Peridot Isle campaign package to 195 modules, violated the **Campaign Isolation Boundary**, and prevented other campaigns (`BaldursGate`, `Fallout2`, `migmag`, and Blank Canvas projects) from cleanly consuming universal supply chains without cross-campaign pollution. Furthermore, legacy modules lacked the v2.0 structured entity and chain metadata (`chain_id`, `chain_stage`, `chain_role`, canonical `provides`/`requires` tags, and structured NPC prototype blocks).

## Decision Drivers

* **Campaign Independence**: Universal resource chains and worldbuilding archetypes must be usable in any campaign without bloating a single IP setting.
* **Zero-Duplication Supply Chains**: Overlapping legacy modules (`STARTER-01`, `CWT-043`, `CWT-060A`) must not duplicate canonical industry chain stages (`IND-WHEAT-02`, `IND-STEEL-01`, `IND-COPPER-02`).
* **Unified v2.0 Module Schema**: Every module must expose machine-readable YAML frontmatter (`id`, `title`, `set`, `category`, `tier`, `pipeline_tier`, `chain_id`, `chain_stage`, `chain_role`, `provides`, `requires`), a `[S, E, C]` disposition baseline, structured `- name:` / `role:` / `disposition:` / `motivation:` NPC prototypes, item prototypes, and 4-level operational dials/threat clocks.

## Considered Options

* **Option 1**: Keep all modules inside `campaigns/Peridot/modules/`.
* **Option 2**: Hardcode all generic modules into the core `src/workstation/` engine bundle.
* **Option 3 (Chosen)**: Partition campaign-independent content into 4 modular, toggleable Workstation Mods (`mods/pre_industrial_resources/`, `mods/tier_0_settlement_substratum/`, `mods/scale_fluid_transit_corridors/`, and `mods/universal_worldbuilding_library/`) ingested by `build_suite.js` with `isUniversalMod: true`.

## Decision Outcome

Chosen option: **Option 3**, establishing four specialized, campaign-independent Workstation Mods while restoring `campaigns/Peridot/modules/` to its 51 native setting-specific modules (`Set_A` through `Set_H` and `HOOK-01`):

1. **`mods/pre_industrial_resources/`**: Houses 101 pre-industrial extraction, refining, and manufacturing commodity supply chain modules across 48 chains, powering `IndustryChainImporter` (`Ctrl+Shift+I`) and `SupplyChainSimulator`.
2. **`mods/tier_0_settlement_substratum/`**: Houses 8 baseline agrarian village and settlement infrastructure modules (`T0-DOM-01..08` under `CHAIN-SUBSISTENCE`), matching the Tier 0 Substratum SRD.
3. **`mods/scale_fluid_transit_corridors/`**: Houses 6 scale-fluid edge corridor modules (`CWT-020..025`) slottable onto pointcrawl road edges (`topo.edgeData[key].modules`), with artificial `chain_id`s removed so they do not pollute node industry chain importing.
4. **`mods/universal_worldbuilding_library/`**: Houses 41 universal Climax Engines (`CWT-010..015`), Survival/Agrarian Sites (`CWT-030..034`), Ideological Sanctuaries (`CWT-040..045`), Historical Civilization Archetypes (`CWT-060..078`), and Generic Starter Sites (`STARTER-02..06`) rewritten into the Unified v2.0 Schema and wired to canonical resource tags.
5. **Duplicate & Overlap Consolidation**: Exact file duplicates in `campaigns/Peridot/modules/` root (`FACT-01..04`, `FACT-06`, `SPARK-08`) are deleted, and pure facility overlaps (`STARTER-01`, `CWT-043`, `CWT-060A`) have their mechanical dials/clocks merged into their canonical chain stages (`IND-WHEAT-02`, `IND-STEEL-01`, `IND-COPPER-02`).
6. **Softcoded UI Telemetry**: Static module/chain numbers are removed from `mod.json` and `mod.js`; runtime counts are computed dynamically from `ALL_MODULES`. Conduit generation in `industry_chain_importer.js` automatically maps commodity tags to valid Property Grid `conduitType` enums.
