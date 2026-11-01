---
file_path: "start.html"
title: "Creator Studio - Campaign Authoring Workstation"
volume: "vol-1"
kind: "Standalone Zero-CORS HTML Workstation"
current_hash: "3c9d148f8eaacc5e"
reviewed_hash: "3c9d148f8eaacc5e"
stale: false
size_bytes: 5900449
line_count: 43076
---

# Creator Studio - Campaign Authoring Workstation

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`start.html` is the **Universal Desktop Workstation Shell** established under [[File:docs/adr/0004-desktop-workstation-start-html.md]], extended with narrative campaign entity management under [[File:docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md]], equipped with the primary **Module Explorer & Mechanics Inspector** under [[File:docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md]], and overhauled with a **Windows 95 Multiple Document Interface (MDI) Window Manager & Taskbar Engine** (**Volume I: System Architecture, Governance & Ontology**). It replaces the workflow of `index.html` with an integrated desktop application environment inspired by AutoCAD, Photoshop, and classic Visual Basic 6 desktop applications.

Rather than fragmenting campaign authoring across separate browser tabs, `start.html` hosts the full pointcrawl network canvas, CAD tool palette, menu bar, two-column property grid, entity managers, and comprehensive module sourcebook within an authentic Windows 95 / Visual Basic 3D beveled desktop chrome with floating, draggable, resizable windows and a bottom taskbar.

---

## Core Invariants & System Contracts
1. **Zero-CORS Offline Execution (`file:///`)**:
   Operates 100% offline directly from disk without local HTTP servers, external CDNs, or remote font dependencies.
2. **Classic Windows 95 / Visual Basic 6 Design System & MDI Engine**:
   - Classic teal desktop background (`#008080`).
   - 3D outset beveled buttons and chrome panels (`#ffffff #808080 #808080 #ffffff; background: #c0c0c0`).
   - System typography stack (`Segoe UI`, `Tahoma`, `MS Sans Serif`, sans-serif) with zero emojis.
   - **MDI Desktop Window Manager (`MDIWindowManager`)**: Non-modal draggable, resizable windows with Win95 3D title bars (`[ _ ]`, `[ □ ]`, `[ X ]`) and z-index focus stacking.
   - **Windows 95 Bottom Taskbar**: Sunken buttons for focused windows, raised buttons for minimized windows, `[Start]` menu popup, and retro system tray with live clock and telemetry.
3. **Modal Startup Dialogue ("Welcome to Creator Studio")**:
   Centered dialog providing immediate access to:
   - `Continue Last Campaign`: Resumes the active `localStorage` pointcrawl topology.
   - `New Campaign...`: Spawns the archetype / canvas setup wizard.
   - `Load Campaign / Import...`: Loads installed campaign packages (`opal_island`, `generic_starter`, `sun_wukong`) or imports JSON from disk.
   - `Workstation Settings...`: Configures snap grids, default link modes, and auto-save.
4. **CAD Canvas & Tool Palette**:
   - `Select / Pointer` (`V`): Select and drag nodes/edges.
   - `Pan Viewport` (`H` or Space): Pan canvas.
   - `Add Tier 2 Node` (`N`): Place standard hub-eligible node.
   - `Add Tier 3 Node` (`A`): Place hazard / apex non-hub node.
   - `Transit Road Edge` (`L`): Drag between nodes to author physical travel corridor ($E_{adj}$).
   - `Hegemony Vector` (`I`): Drag between nodes to author directional influence vector ($E_{inf}$).
   - `Erase / Sever` (`E`): Delete selected node or corridor.
   - `Ruler / Measure` (`M`): Measure Euclidean distance.
   - `Text Callout` (`T`): Place freeform map annotations.
5. **Comprehensive Module Explorer & Primary Sourcebook**:
   Established under [[File:docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md]]:
   - **Primary Source for Module Data**: Full catalog of 118+ worldbuilding modules compiled directly into `start.html` via `ALL_MODULES`.
   - **Multi-Pane Workstation Dialog** (`#modal-module-explorer`): Quick-launched via `Ctrl+M` / `F8`, toolbar button `[Modules]`, or top menu `Tools -> Module Explorer...`. Features dynamic filtering by campaign sourcebook, 5-tier pipeline classification, cultural quadrant, and live full-text search.
   - **Four Deep Inspection Tabs**:
     1. *Overview & Supply Chain*: 5-Tier role, Tarot affinities, MTG color pairing, `provides`/`requires` resource tags, node prerequisites, and standalone fallback execution mode.
     2. *Narrative Entities*: Latent NPCs, quests, and technological apparatus extracted from module text with 1-click promotion and direct node stationing.
     3. *Mechanics & Clocks*: Threat Clocks with tick escalation countdowns, Output Dials (Levels 1 to 4 severity/output), and Four-Corner Sociological Opposition.
     4. *Full Sourcebook & Notes*: Client-side offline Markdown reader with clean formatted text, raw source toggle, and direct source file links.
   - **Interactive Node Slotting Engine**: Slotting/unslotting modules directly onto graph nodes (`node.modules = []`), synchronizing real-time across the CAD canvas and Property Grid.
6. **Universal Campaign Entity & Spatial Explorer Architecture (NPCs, Quests, Items, Trackers, Nodes)**:
   Established under [[File:docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md]]:
   - **Active Campaign State**: Collections `topology.npcs`, `topology.quests`, `topology.items`, and `topology.trackers` stored directly on the active topology JSON.
   - **Comprehensive 5-Subsystem Entity Manager** (`#modal-entity-manager`):
     - `NPCs` (`Ctrl+F5`): Active roster, psychological drives, stationing.
     - `Quests` (`Ctrl+F6`): Dynamic dilemmas, threat stakes, complications.
     - `Items & Relics` (`Ctrl+F7`): Hardware anchors, dynamos, transceivers.
     - `Threat Trackers & Clocks` (`Ctrl+F9`): Interactive segmented progress tracks (`[■■□□] 2/4 Ticks`), real-time `+` / `-` tick escalation buttons, crisis trigger alerts, and 186+ module-extracted clocks/dials.
     - `Nodes & Hubs` (`Ctrl+F10`): Pointcrawl graph node matrix with live name/culture/tier editing, transit corridor traversal, slotted module inspector, stationed entity rosters, and 1-click CAD canvas centering.
   - **Dynamic Module Prototype Pool**: Ingests hundreds of latent characters, dilemmas, relics, and escalation clocks directly from `ALL_MODULES`.
   - **Custom Entity & Node Creation**: Dedicated dialogs for custom entity authoring and prompt-driven graph node insertion.
7. **Movable Threat Clocks & Severity Dials Canvas Engine (Milestone 3)**:
   - **Spatial Gauges Overlay**: Active threat clocks and severity dials stationed on nodes render interactive Win95 floating callouts on the CAD canvas (`[■■■□] 3/4` or `LVL 2/4`).
   - **Per-Tracker Canvas Visibility**: Interactive `[x] Show Visual Gauge on CAD Canvas` checkbox toggle in Tracker inspector.
   - **Pulsing Hazard Perimeters**: SVG nodes with triggered clocks (100% ticks) or Level 4 lethal dials automatically animate with a pulsing red hazard perimeter (`.node-hazard-pulse`).
   - **Draggable Callout Offsets**: Map authors can freely drag clock callouts around their anchor nodes; coordinate offsets (`offsetX`, `offsetY`) persist in campaign JSON with a 1-click `[Reset Offset]` and dashed connector line.
8. **Gamedev & Campaign Author Ticket Command Center (Milestone 4 - `F9`)**:
   - **MDI Ticket Command Center (`#modal-ticket-center`)**: Dedicated Win95 workspace window bound to `F9`, View Menu, Tools Menu, and Toolbar button `[ Tickets ]`.
   - **Dual-Mode Backlog Split**:
     - *Repo Master Backlog*: Inspects 60 enriched repository master tickets from [[File:tickets/master_ticket_manifest.json]] inlined into `MASTER_TICKETS_DATA`. Filters by Workstream Track (CWT, Tier 0, SYS), Pipeline Tier (1..5), and Delivery Status.
     - *Campaign Author Tickets*: Authors local setting-specific tickets (`topology.tickets = []`) logged against spatial anchor nodes.
   - **Rigorous Narrative Schemas**: In-depth inspector displaying Lajos Egri Central Dramatic Syllogisms, John Truby Four-Corner Opposition (Establishment vs Opponent vs Shadow vs Outcast), Injected Clocks/Dials, and Resource Flow Contracts.
   - **1-Click Markdown Exporter**: Monospace export dialog (`#modal-ticket-export`) producing clean, formatted Markdown conforming strictly to [[File:tickets/creative/TEMPLATE.md]] with Copy-to-Clipboard and `.md` file download.
9. **Desktop Ergonomics, Menu Bar & MDI Window Orchestration**:
   - **Top Menu Bar**: Click-to-open, outside-click dismiss, and smooth mouseover hover switching across `File`, `Edit`, `View`, `Insert`, `Tools`, `Window`, `Mods`, and `Help`.
   - **Procedural Waves & Balancing**: Relocated from toolbar to `Tools -> Procedural Waves & Balancing` with full 7-wave suite, step-by-step single-wave progression (`Wave 1..7`), adjacency smothering verification, and balance state reset.
   - **Dedicated `Window` Menu**: Window management commands (`Cascade Windows`, `Tile Horizontally`, `Tile Vertically`, `Minimize All`, `Restore All`, `Close All`) and quick-reopen shortcuts for all MDI windows (`Module Explorer`, `Entity Manager`, `Ticket Command Center`, `Properties Inspector`, `CAD Tool Palette`).
   - **Window Close `[X]` & Minimize `[_]` Fidelity**: `[X]` cleanly dismisses the window, detaches it from the active desktop, and removes its taskbar button; `[_]` minimizes it down to the Windows 95 taskbar with a raised 3D button. Any closed window can be reopened at any time from the `Window` menu or keyboard shortcuts.
   - **Widened CAD Tool Palette**: Expanded from 90px to 134px with comfortable two-column grid layout, preventing label clipping and accommodating full-width tools.
10. **Cross-Campaign Module Ingestion Engine**:
    - **Tri-State Scope Filtering**: Module Explorer features `Scope:` filtering across `All Project Modules (118)`, `In Current Campaign`, and `Outside Campaign (Available)`.
    - **1-Click Ingestion & Removal**: Active campaign membership toggle `[+ Add to Campaign]` / `[✓ In Campaign]` with slotted node protection guards, real-time table badges, and persistence in `topology.campaign_modules`.
11. **Variable Geometric Node Shapes & Diameter Engine**:
    - **Vector SVG Shape Generation**: Procedural math rendering across 7 distinct geometries: `circle`, `square`, `triangle`, `diamond`, `star` (5-point outer/inner trigonometric polygon), `oval` (aspect-ratio ellipse), and `pentagon`.
    - **Dynamic Diameters & Radii**: Configurable size scale (12px to 32px radius) with responsive label positioning and SVG hazard pulse animations adapted across all shapes.
    - **VB6 Property Grid Integration**: Live interactive `Shape` dropdown and `Diameter / Size` picker in the `Geometry & Appearance` section saving directly to topology JSON and re-rendering instantly.
12. **Two-Column Visual Basic 6 Property Grid**:
    Docked 310px inspector providing immediate bi-directional synchronization across:
    - *Topology*: `ID`, `Name`, `Tier`, `Hub Eligible`, `Wave`, `X/Y Coordinates`.
    - *Geometry & Appearance*: `Shape`, `Diameter / Radius`.
    - *Sociology*: `Cultural Quadrant` (Clan, Adhocracy, Market, Hierarchy), `Category`.
    - *Connectivity*: `Adjacencies (adj)`, `Influenced By (infBy)`.
    - *Slotted Modules*: `[ Slotted Modules ]` category with inspection links.
    - *Narrative Stationing*: `[ Assigned NPCs ]`, `[ Active Quests ]`, `[ Local Items & Relics ]`, and `[ Threat Clocks & Trackers ]` with clickable inspection links.
    - *Campaign Attributes*: Global parameters displayed when clicking canvas background.
13. **Systray Telemetry & Status Monitoring**:
    Win95 System Tray telemetry string: `M:118 ND:22 N:12 Q:8 I:15 T:6 TK:61`.
14. **Tri-Point Mod Area & Runtime API (`window.CreatorStudio`)**:
    Exposes `window.CreatorStudio.registerMod({ id, name, menuItems, paletteTools, customProperties })` allowing worldbuilding modules to register custom menu items, tool palette slots, and property fields dynamically.

---

## Deferred Development Backlog
To prevent scope creep and maintain engine stability, three formal tickets were logged in `tickets/system/` and registered in [[File:tickets/master_ticket_manifest.json]]:
- [[File:tickets/system/SYS-START-01_canvas_layers_and_selection_grouping_engine.md]]: Canvas multi-layer stack and selection grouping.
- [[File:tickets/system/SYS-START-02_visual_basic_in_cell_property_grid_editors.md]]: In-cell dropdown menus, color swatch pickers, and modal collection ellipsis buttons.
- [[File:tickets/system/SYS-START-03_module_extension_sdk_and_runtime_mod_hook_provider.md]]: Formalized Module Extension SDK runtime lifecycle.
<!-- END_CUSTOM_NOTES -->
