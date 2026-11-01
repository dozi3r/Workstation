# 0009: Extraction of Tarot Sociology & 7-Wave Balancing Engine into Workstation Mod

> [!NOTE]
> **Status: Superseded by ADR-0011 (2026-10)**. The `mods/tarot_balancing/` runtime mod and 22-node 7-wave balancing engine have been permanently retired from the software suite. The 64-cell `[S, E, C]` disposition algebra and CVF quadrants remain in Core, while `sociology/08` and `sociology/09` are preserved strictly as static markdown reference compendiums.

## Context
In previous iterations of Creator Studio (documented in ADR-0004 and ADR-0007), the 7-Wave Procedural Tarot Balancing Engine, Major & Minor Arcana hermeneutics, Sovereign Hub election, Adjacency Smothering, and Arrival/Disembark event tables were hardcoded directly into the Core application runtime (`src/workstation/scripts/balancing_engine.js`) and mandated as universal Ground Rules in `AGENTS.md`.

While Granular Disposition `[S, E, C]` (Structure, Energy, Cohesion) and Competing Values Framework (CVF) Cultural Quadrants (Clan, Adhocracy, Market, Hierarchy) are universal sociological primitives valuable to all setting genres (fantasy, sci-fi, historical, post-apocalyptic), the specific Tarot traditions (Rider-Waite-Smith, Crowley-Harris Thoth, H.R. Giger, Salvador Dalí) and 7-wave Sovereign Hub election algorithm represent a specialized domain overlay.

With the introduction of the Zero-CORS Workstation Mod Extension Architecture (ADR-0008), the workstation gained the capability to support pluggable toolsets. A clean architectural decoupling was required to:
1. Extract the Tarot system and 7-wave engine out of Core `start.html` into a workstation mod (`mods/tarot_balancing/`).
2. Retain `[S, E, C]` granular disposition scores and CVF cultural quadrants in Core Node/Corridor properties.
3. Remove `balancing_engine.js` and Tarot dataset injections (`TAROT_DECKS_DATA`, `DEFAULT_WAVES`) from Core templates.
4. Relocate the headless PowerShell simulator (`Run-NetworkEngine.ps1`) into the mod folder and decouple `AGENTS.md` and `docs/navigation_manifest.json` from hardcoded Tarot invariants.

## Decision

1. **Full Engine Encapsulation in `mods/tarot_balancing/mod.js`**:
   - The entire 7-wave procedural calculation engine (`recalculateBalancing`, `drawRandomCardForNode`, `setManualCardForNode`, `toggleCardReversed`, `drawActiveWave`, `drawAllCampaignCards`, `resetAllDraws`, `toggleInversion`, `setSovereignHubTarget`, `renderBalancingDock`, `renderFactionsDock`) is encapsulated inside `mods/tarot_balancing/mod.js`.
   - The obsolete file `src/workstation/scripts/balancing_engine.js` is physically deleted from the codebase.
   - The generic tab switcher `switchDockTab(tabId)` is relocated to `src/workstation/scripts/mdi_window_manager.js`, broadcasting `onDockTabSwitched(tabId)` events to registered mods.

2. **Core Preservation of `[S, E, C]` and CVF Quadrants**:
   - Core Node Properties Inspector in `workstation_core.js` directly provides standalone `[S, E, C]` (1..4) dropdown selectors and a 1-click `[Sync Quadrant]` action button to compute Clan, Adhocracy, Market, or Hierarchy directly from `[S, E]` vectors without needing Tarot cards.
   - Core edge properties provide Sociological & Transit Dynamics without hardcoding Minor Arcana suits.

3. **Mod Extension Hooks**:
   - `renderNodeInspector`: Appends the "Tarot Balancing & Progression (Mod)" category, allowing Wave assignment (1..7), Hub Eligibility toggles, Major Arcana card selection, Upright/Reversed orientation, base weight / amalgamation score calculation, and Arrival/Disembark event review.
   - `renderEdgeInspector`: Appends the "Minor Arcana Corridor Lore (Mod)" category, allowing Elemental Suit selection (Swords, Wands, Cups, Disks), Upright/Reversed aspect, dynamic corridor lore, and connected endpoint arcana context.
   - `renderCanvasNode`: Dynamically renders Sovereign Hub gold halos (`👑`), Smothered badges (`⛔`), and Tarot card subtitles beneath nodes.
   - `onDockTabSwitched`: Activates and renders `#panel-dock-waves` and `#panel-dock-factions` when selected.
   - `onGraphUpdated`: Re-runs amalgamation and adjacency smothering whenever topology changes.

4. **Mod-Specific Dataset Injection in `build_suite.js`**:
   - `TAROT_DECKS_DATA` (6 Major and 4 Minor traditional decks) and `DEFAULT_WAVES` are removed from Core `src/workstation/template.html` and injected specifically into the `tarot_balancing` script bundle during compilation.

5. **Headless PowerShell Simulator Relocation (`mods/tarot_balancing/Run-NetworkEngine.ps1`)**:
   - The headless simulator is relocated from `network/Run-NetworkEngine.ps1` to `mods/tarot_balancing/Run-NetworkEngine.ps1`.
   - Path resolution is updated to locate campaign presets via `$RootDir`.
   - `docs/navigation_manifest.json` routes the simulator under `mods/tarot_balancing/Run-NetworkEngine.ps1` and reclassifies `tarot/*.html` and `network/network_visualizer.html` as Companion Surfaces for the `tarot_balancing` mod.

6. **Decoupled `AGENTS.md` and `CONTEXT.md` Router**:
   - `build_suite.js` generates `AGENTS.md` with Ground Rule 4 scoped to "Mod Mathematical Parity" between `mods/tarot_balancing/mod.js` and `mods/tarot_balancing/Run-NetworkEngine.ps1`.
   - Domain terminology in `AGENTS.md` and `CONTEXT.md` is strictly partitioned into **Core Workstation Vocabulary** (Pointcrawl Graph, Granular Disposition `[S, E, C]`, CVF Quadrant, Pipeline Tiers 1..5, Scale-Fluid Portal Nodes, Active Campaign Roster, Workstation Mod) and **`tarot_balancing` Mod Vocabulary** (Sovereign Hub, Satellite Node, Adjacency Smothering, 7-Wave Progression, Major/Minor Arcana Corridors).

## Consequences
- **True Zero-CORS Modularity**: Core Creator Studio is now a lightweight, generic pointcrawl CAD canvas with universal CVF sociological vectoring. Users authoring settings without Tarot traditions operate with zero clutter.
- **Mathematical Parity Maintained**: Exact algorithmic equivalence between the JavaScript client engine and the headless PowerShell simulator is preserved.
- **Zero Save-File Breaking**: Existing campaigns with drawn cards and hub allocations retain their data under `modData['tarot_balancing']` while retaining dual-mirror compatibility during transition.
- **Surface Integrity**: Standalone browsers (`tarot_matrix_browser.html`, `minor_matrix_browser.html`, `tarot_deck_analytics.html`) remain functional and linked as companion surfaces without imposing architectural coupling on Core.
