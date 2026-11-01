# 0008: Workstation Mod Extension Architecture and Save Isolation

## Context
Creator Studio's primary desktop workstation (`start.html`) supports campaign authoring across pointcrawl networks, Tarot sociological alignment, and worldbuilding modules. To support custom tooling, bespoke inspectors, and domain-specific mechanics (such as the Regional Image & Biome Explorer) without bloating the core application or locking users into brittle custom builds, an extensible **Mod Architecture** is required.

Key technical constraints and design challenges:
1. **Zero-CORS Offline Execution**: Tools operate directly via the `file:///` protocol without a web server or Node.js runtime in the browser. The browser cannot dynamically crawl directories on disk (e.g. `mods/` or `regions/images/`) at runtime.
2. **Save-File Invariant & Forward/Backward Compatibility**: Adding, editing, or deleting a mod must never corrupt or "brick" campaign save files or prevent them from loading in vanilla `start.html`.
3. **Inspectable Pointcrawl Integration**: Mods must be capable of injecting custom properties and controls into both **Nodes** and **Transit Road Edges (`E_adj`)**, including contextual cross-referencing between connected nodes.

## Decision

1. **Mod Directory Structure & Zero-CORS Discovery**:
   - Mods reside in `mods/<mod_id>/` (e.g. `mods/regional_biomes/`).
   - Each mod provides a `mod.json` (metadata, entry script, custom properties, menu items) and entry script `mod.js`.
   - `build_suite.js` (and a fast standalone CLI helper `mods/Update-Mods.ps1`) automatically scans `mods/`, scans external asset directories (such as `regions/images/` for biome folder hierarchies), and inlines or registers active mods into `start.html`.

2. **Save Isolation via Namespaced `modData`**:
   - Core topology primitives (`id`, `name`, `x`, `y`, `tier`, `adj`, `infBy`, `wave`, `culture`) remain strictly pristine.
   - Any custom properties contributed by mods are saved within an isolated `modData` dictionary keyed by the mod's unique ID:
     - On Nodes: `node.modData[modId] = { ... }`
     - On Transit Road Edges: `activeTopology.edgeData[pairKey].modData[modId] = { ... }`
   - If a mod is disabled or removed from `mods/`, `start.html` loads the campaign without throwing errors, ignores unrecognized `modData` keys, and preserves them during saves. Re-enabling the mod instantly restores all property values.

3. **Runtime Mod API (`window.CreatorStudio`)**:
   - Extends the core API (`SYS-START-03`):
     - `window.CreatorStudio.registerMod({ id, name, version, menuItems, paletteTools, nodeProperties, edgeProperties, onInit })`.
   - Dynamic Property Inspectors:
     - Nodes render custom mod sections in the Properties Inspector.
     - Transit Road Edges (`E_adj`) render custom mod sections that have access to the properties of both connected endpoints (`nodeU` and `nodeV`), enabling 1-click `[Apply]` actions from connected nodes to the corridor.

4. **Dynamic Folder Tree Extraction**:
   - Asset-derived hierarchies (such as biomes from `regions/images/<category>/<subcategory>/`) are extracted at build/manifest time and injected into the mod payload as structured option trees, eliminating runtime filesystem access while ensuring folder names are never manually hardcoded.

5. **Flexible Mod Presentation & MDI Coexistence**:
   - Mods may render custom UIs either by embedding in an MDI window within `start.html` (`MDIWindowManager.createWindow`) or launching standalone visual surfaces (such as `regions/regional_image_browser.html`), preserving authoring freedom for UI styles.

## Consequences
- The workstation gains a modular, decoupled plugin ecosystem that runs 100% offline.
- Campaign saves remain indestructible even when community or experimental mods are removed.
- Future image asset tagging, OCR tools, and biome calculators can be developed incrementally within `mods/regional_biomes/` without modifying core workstation code.
