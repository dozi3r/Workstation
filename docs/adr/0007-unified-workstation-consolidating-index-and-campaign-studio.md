# 0007: Unified Desktop Workstation Architecture Consolidating index.html and campaign_studio.html into start.html

## Context
Creator Studio previously maintained three overlapping primary authoring and launching surfaces:
1. **`index.html`**: A Tailwind-styled landing dashboard for resuming sessions, creating campaigns, browsing installed sourcebook packages, and jumping to pipeline tools.
2. **`network/campaign_studio.html`**: A Tailwind-styled pointcrawl studio compiled from `src/campaign_studio/` containing the authoritative 7-Wave Tarot progression engine, Amalgamation & Adjacency Smothering balancer (in mathematical parity with `network/Run-NetworkEngine.ps1`), 6 Major / 4 Minor Arcana deck hermeneutics, Multi-Vector Corridor Flow gradients (`-100%` to `+100%`), Scale-Fluid Hierarchical Cartography (`maps[activeMapId]` + IndexedDB `CreatorStudioMapDB`), Bidirectional Wiki Engine (`[[...]]` & `@mentions`), BFS Supply-Line validation, and Stage 6 Export (`JSON`, `Markdown`, `Foundry VTT`).
3. **`start.html`**: A zero-CORS Windows 95 / Visual Basic 6 MDI desktop workstation shell (established in ADR-0004, ADR-0005, and ADR-0006) housing the CAD tool palette, custom SVG node shapes, draggable Threat Clock canvas callouts, 2-column VB6 Property Grid, Entity Manager (`NPCs`, `Quests`, `Items`, `Trackers`, `Nodes`), Comprehensive Module Explorer, and Ticket Command Center—but relying on simplified flat-topology stubs for wave progression and balancing.

Maintaining both `network/campaign_studio.html` and `start.html` split the user experience across two incompatible UI paradigms and duplicated state management. Furthermore, keeping `start.html` as a monolithic 6,752+ line hand-edited file made iterative maintenance token-intensive and error-prone for AI coding agents.

## Decision
1. **Deprecate `index.html` and `network/campaign_studio.html` via Zero-CORS Redirect Stubs**:
   - `start.html` becomes the single authoritative entrypoint and authoring workstation for Creator Studio.
   - `index.html` and `network/campaign_studio.html` are replaced with lightweight (~15-line) zero-CORS HTML redirect stubs that preserve all URL query parameters (`?campaign=...&title=...&newTitle=...`) and immediately forward to `start.html`.
   - `start.html` parses URL query parameters on boot to load requested campaigns, titles, or wizard states.

2. **Modular Source Architecture (`src/workstation/`) Compiled by `build_suite.js`**:
   - Extract `start.html`'s source into modular HTML partials and focused JavaScript subsystem files inside `src/workstation/` (`template.html`, `styles/`, `modals/`, `scripts/`).
   - `build_suite.js` (`Build-Suite.ps1`) resolves `// @@INCLUDE: ... @@` directives and injects fenced authoritative datasets (`CAMPAIGN_REGISTRY`, `ALL_MODULES`, `TAROT_DECKS_DATA`, `MASTER_TICKETS_DATA`, `DEFAULT_WAVES`) to produce the standalone, zero-CORS `start.html` distribution.
   - Never edit compiled `start.html` directly; edit modular files in `src/workstation/` and run `Build-Suite.ps1`.

3. **Unified Multi-Map + Entity Runtime State with `Workstation.activeTopology` Adapter**:
   - Adopt the Scale-Fluid Multi-Map state model (`maps[activeMapId]`, `nodes[]` with `odv: [S,E,C]`, `drawnCards`, `sovereignHubs`, `smotheredNodes`, `links[]` with 4-axis vectors and Minor Arcana cards, `nodeSlottedModules`, `edgeSlottedModules`, `blockedEdges`, `moduleSeveranceClocks`, `campaignFactions`, `enabledSourcebooks`, and `globalDials`) as the core mathematical runtime.
   - Preserve root-level and map-aware entity collections (`npcs[]`, `quests[]`, `items[]`, `trackers[]`, `tickets[]`) and expose a synchronous bidirectional adapter on `Workstation.activeTopology` so all existing Entity, Module, and Ticket managers operate seamlessly.
   - Maintain 100% mathematical parity between `start.html` (`src/workstation/scripts/stage_4_balancing.js`) and `network/Run-NetworkEngine.ps1`.

4. **3-Tab VB6 Right Dock + 4 New Win95 MDI Windows**:
   - **Tabbed Right Dock (`#properties-dock`, 350px)** houses three Win95 tabs:
     1. `Properties`: Categorized 2-column VB6 Property Grid for the selected **Node**, **Corridor/Edge**, or **Global Map** (covering GM Overrides, Tarot & `[S,E,C]` Disposition, Amalgamation Breakdown, Multi-Vector Corridor Flow `-100%..+100%`, Multi-Perspective Hermeneutics, Slotted Modules & Supply Status, Stationed Entities, and `[[Wiki]]` Notes/Backlinks).
     2. `Waves & Dials`: Emergent 7-wave progression (`Advance`, `Pre-Gen`, `Reset`, `Fog of War`), Active Major/Minor Deck selectors, Dial 8 Climax Engine (`Crisis Gate` vs `Hardcore Cataclysm`), Tier 0 Substratum toggle, and Balancer Option Packs.
     3. `Factions`: Campaign Faction Roster management (`campaignFactions`, POI counts, agenda/color/icon editing).
   - **Four New Draggable Win95 MDI Windows** (registered with `MDIWindowManager` and integrated with the Menu Bar, Standard Toolbar, and Win95 Taskbar):
     1. `Cartographic Map Navigator` (`#modal-map-navigator`, `Ctrl+Shift+M`): Multi-scale map tree (`cosmic` to `floorplan`), sub-map creation, reparenting, and IndexedDB background map image upload/opacity controls.
     2. `Tarot Traditions & Hermeneutics` (`#modal-tarot-decks`, `Ctrl+T`): 6 Major & 4 Minor Arcana deck switcher, comparative card inspector, and Disembark sensory tables.
     3. `Sourcebook Package Manager` (`#modal-sourcebooks`, `Ctrl+B`): Toggle active campaign sourcebooks and inspect slotted module dependencies.
     4. `Campaign Dossier & VTT Exporter` (`#modal-campaign-export`, `Ctrl+E`): Stage 6 export suite (`Campaign JSON v2.0-nested`, `GM Markdown Dossier`, `Foundry VTT Scene/Journal JSON`, `SVG Map`).

5. **Unified CAD Canvas & Upgraded Module Explorer**:
   - Combine `start.html`'s custom SVG node shapes, ruler/text tools, multi-axis telemetry badges (`M:# N:# Q:# I:# T:#`), and draggable Threat Clock callouts with `campaign_studio.html`'s IndexedDB map backgrounds, Portal Node cyan rings (`childMapId` double-click drill-down + `ESC`/Breadcrumb HUD ascent), 1-Way/2-Way/Hegemony/Severed corridors, Layer Focus dimming (`All | Traffic | Hegemony`), and collapsible Tactical Visual Legend.
   - Upgrade `#modal-module-explorer` with corridor/edge module slotting, BFS supply-line validation (`checkModuleSupplyLine`), severance clock turn advancement (`advanceSeveranceTurn`), and recommendation scoring (`calculateRecommendationScore`).
   - Upgrade `#modal-welcome`, `#modal-new`, `#modal-load`, and the `Start` menu to incorporate all session telemetry, reset controls, package showcase cards, and pipeline tool links from `index.html`.

## Consequences
- Users and Game Masters experience a single, cohesive Win95/VB6 CAD desktop workstation (`start.html`) containing 100% of Creator Studio's topological, sociological, narrative, and export capabilities.
- Small, fast AI coding models (such as Gemini 3.8 Flash) can safely implement and maintain features inside isolated 250–600 line files in `src/workstation/` with deterministic `Build-Suite.ps1` compilation and clean `/compact` milestone boundaries.
- Legacy links to `index.html` and `network/campaign_studio.html` continue to work via zero-CORS query-forwarding redirect stubs.
