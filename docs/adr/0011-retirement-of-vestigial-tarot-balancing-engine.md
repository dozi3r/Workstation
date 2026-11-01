# 0011: Complete Retirement of Vestigial 22-Node Smothering & Tarot Balancing Engine

## Context
[ADR-0009](0009-tarot-and-wave-balancing-mod-extraction.md) previously proposed extracting the legacy 22-node, 7-wave Tarot balancing and adjacency smothering engine out of Core `start.html` into a client-side workstation mod (`mods/tarot_balancing/`).

As Creator Studio evolved into a scale-fluid, multi-layer CAD workstation (`start.html`) supporting arbitrary node counts, recursive portal nesting (`childMapId`), and ad-hoc resource supply chains (`provides` / `requires`), the fixed 22-node Major Arcana smothering protocol became obsolete. While `src/workstation/scripts/balancing_engine.js`, `tarot/`, and `mods/tarot_balancing/` were removed from the repository, vestigial runtime state variables (`sovereignHubs`, `sovereignHubTarget`, `smotheredNodes`, `tarotDecks`), dead callbacks (`recalculateBalancing()`), UI inputs (`#cme-tarot`), and stale documentation/wiki references remained across the codebase.

## Decision

1. **Core Workstation State & UI Purge**:
   - Remove `sovereignHubs`, `sovereignHubTarget`, `smotheredNodes`, and `tarotDecks` from `state_adapter.js`, `map_store.js`, `mdi_window_manager.js`, and `selective_importer.js`, while gracefully ignoring those keys if encountered when loading legacy JSON campaign packages.
   - Remove `hasTarotMod` conditional branches and the 7-Wave Balancer eligibility checkbox from `entity_manager_ui.js` and `sociology_data.js`.
   - Remove the `#cme-tarot` input and `tarot_card` YAML output from `module_explorer.js` and `explorer_modals.html`.
   - Remove all dead `recalculateBalancing()` invocations.

2. **Authoring Engine SRD & Wiki Series A Modernization**:
   - Generalize `docs/srd/authoring_engine_srd.md` (Sections 2, 4, 5, and 7) to formalize scale-fluid pointcrawl topology ($N$ nodes across nested scale tiers), directional hegemony propagation, supply-chain BFS reachability, and 2-axis ODV contradiction tension.
   - Move the historical 22-node 7-wave Tarot & Adjacency Smothering algorithm to an informative legacy appendix in `authoring_engine_srd.md`.
   - Re-title and update `wiki/src/series/series_a_balancing_and_smothering_math.md` as **Series A: Pointcrawl Topological Mathematics & Network Centrality**.

3. **Campaign Module Tag Sanitization & Static Lore Preservation**:
   - Retain all narrative prose, NPCs, and threat clocks in `campaigns/Emerald Isle/modules/` (`FACT-01`, `FACT-04`, `CWT-050`, `SPARK-08`), while replacing mechanical resource tags (`System: Adjacency-Smothering-Protocol` $\to$ `System: Hegemony-Tension-Matrix`) and stripping `tarot_affinity` frontmatter fields.
   - Preserve `sociology/08_Tarot_Sociology_Matrix.md` and `sociology/09_Minor_Arcana_Edge_Matrix.md` strictly as static thematic reference compendiums for lore authors, decoupled from workstation software execution.

## Consequences
- **Zero Ghost State**: `start.html`, `CreatorStudioMapDB`, and exported campaign JSON manifests carry only active, meaningful topology and entity state.
- **Documentation & Graph Integrity**: `admin.html`, `CONTEXT.md`, `authoring_engine_srd.md`, and the 8-Volume Codebase Wiki accurately reflect the surviving files and scale-fluid CAD architecture with zero phantom file links.
- **Backward Compatibility**: Legacy campaign files containing obsolete keys load cleanly without runtime errors.
