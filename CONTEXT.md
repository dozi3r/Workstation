# Creator Studio

Universal, system-agnostic campaign authoring suite for procedural pointcrawl network design, organizational sociological alignment, and modular worldbuilding.

## Language

### 1. Core Workstation Domain Vocabulary

#### Network Topology & Geography
**Pointcrawl Graph**:
A mathematical network of spatial nodes connected by traversable edges with directional influence weights.
_Avoid_: Map, hex grid, dungeon layout

**Node**:
A discrete location or point of interest in the pointcrawl graph with coordinates, tier, and sociological attributes.
_Avoid_: Room, zone, encounter, cell

**Transit Road Edge (`E_adj`)**:
A bidirectional physical traversal corridor connecting adjacent nodes in the pointcrawl graph, carrying physical travel conditions, hazards, and biome transitions.
_Avoid_: Road, path, line, street

**Influence Link (`E_inf`)**:
A directional, asymmetric edge carrying mathematical or geopolitical pressure between two nodes.
_Avoid_: Connection, road, path

#### Core Sociology & Hermeneutics
**Granular Disposition `[S, E, C]`**:
A 3-dimensional coordinate vector measuring Structure (1-4), Energy (1-4), and Cohesion (1-4), yielding 64 discrete sociological archetypes.
_Avoid_: Alignment, personality score, stats

**Cultural Quadrant (CVF)**:
A macro-organizational classification based on the Competing Values Framework (Clan, Adhocracy, Market, Hierarchy) derived from Structure and Energy coordinates.
_Avoid_: Faction type, culture class

**Operational Profile**:
The primary mode of organizational power and production (Design, Service, Produce, Deliver) derived from Structure and Cohesion.
_Avoid_: Work style, guild role

**Corridor Disposition (Edge ODV)**:
The `[S, E, C]` sociological disposition vector governing a transit road edge, authored explicitly (`edge.odv`) or derived as the integer centroid midpoint between its connected endpoint nodes, parameterizing customs strictness, trade culture, and transit hazards along the corridor.
_Avoid_: Road alignment, path stats

**Archetype Cell Occupancy**:
The multi-tenant presence of active campaign pointcrawl nodes and transit road edges mapped to a specific cell in the 64-cell ODV matrix, tracked by numerical count badges on the cell and detailed roster entries in the GM dossier.
_Avoid_: Character list, cell inhabitants

**Master Sociological Reference Hub**:
The unified multi-tab knowledge engine consolidating SOC-01 through SOC-06 into a single collapsible reference surface inside `network/odv_archetype_matrix.html`.
_Avoid_: Cheatsheet, help tab

**Institutional Levers (SOC-02)**:
The operational trade-offs, basis of power, effective player negotiation levers, and fatal player errors governing the four operational profiles (Design, Service, Produce, Deliver).
_Avoid_: Charisma check list, persuasion hints

**Crisis Metamorphism (SOC-03)**:
The four-stage temporal clock and deterministic failure state shifts causing an archetype's baseline culture to collapse into an emergency survival posture under catastrophic pressure.
_Avoid_: Panic mode, disaster script

**Sensory Pentagon (SOC-04)**:
The procedural 5-dimension architectural framework parameterizing Behaviors, Relationships, Attitudes, Values, and Physical Environment for immediate settlement room skinning.
_Avoid_: Flavor text table, description generator

**Deterministic Diagnostic Wizard (SOC-06)**:
The 3-question inter-rater calibration wizard that maps observed faction behaviors directly onto the integer coordinate vector `[S, E, C]`.
_Avoid_: Personality quiz, alignment test

### 2. Topological Centrality & Hegemonic Tension Vocabulary

**Hegemonic Hub**:
A primary political, economic, or infrastructural center of gravity on the pointcrawl graph characterized by high outgoing influence (`E_inf`) and tier authority.
_Avoid_: Capital, major city, headquarter

**Satellite Node**:
A secondary node economically, militarily, or sociologically subordinated to an adjacent Hegemonic Hub via directional influence or supply dependency.
_Avoid_: Minor town, outpost, vassal

**Thematic Archetype Compendiums (`sociology/08`, `sociology/09`)**:
Standalone reference markdown tables mapping the 64-cell `[S, E, C]` disposition matrix to historical Major and Minor Arcana archetypes for optional narrative inspiration; completely decoupled from workstation runtime state.
_Avoid_: Tarot balancing engine, mandatory card draw

### Specifications & System Reference Documents

**Authoring Engine SRD**:
The formal mathematical and algorithmic manual governing Creator Studio itself (scale-fluid graph topology, 64-cell disposition algebra, supply-chain BFS reachability, dial balancing, contradiction tension matrices).
_Avoid_: Rulebook, game system, player's handbook

**Adventure Framework SRD**:
The lightweight, system-agnostic runtime ruleset for table play (resolution mechanics, hazard clocks, damage dice, faction turns) referenced by modular yields and dilemmas.
_Avoid_: Core engine, game system, GM guide

### Worldbuilding & Content Architecture

**Module**:
A self-contained plug-and-play worldbuilding asset providing mechanical yields, environmental hazards, or narrative dilemmas.
_Avoid_: Encounter, quest, room, add-on

**Workstation Mod / Extension**:
A client-side plugin package residing in `mods/<mod_name>/` that extends the Creator Studio CAD environment (`start.html`) with custom tools, inspector properties, and menu entries without altering core data schemas.
_Avoid_: Module (reserved for worldbuilding narrative units), patch, hack

**Worldbuilding Pipeline Tier**:
The structural stage at which a module is slotted into a campaign:
- **Tier 1 (Macro Network & Governance)**: Systemic network-wide rules and tension matrices.
- **Tier 2 (Topological & Biome Anchors)**: Environmental terrain, native species, and edge corridors.
- **Tier 3 (Infrastructural Supply Chains)**: Industrial production, power networks, chemical synthesis, and perimeter defense.
- **Tier 4 (Dynamic Narrative Sparks & Clocks)**: Faction dilemmas, social unrest, and arrival events.
- **Tier 5 (Esoteric & Eschatological Engines)**: High-concept anomalies, time anomalies, planar colliders, and campaign climax triggers.
_Avoid_: Level, set, rarity

**Resource Tag (`provides` / `requires`)**:
A typed machine-readable input or output contract declaring material, energy, or information prerequisites and yields.
_Avoid_: Prerequisite string, synergy note

**Module Bundle**:
A curated group of functionally complementary modules (e.g. Carbochemical Defense Complex) presented as a coherent slotting recommendation in the UI.
_Avoid_: Tech tree, addon pack

**Standalone Fallback Mode**:
A built-in operating state allowing a module to function without dangling dependencies if upstream supply lines or prerequisites are severed.
_Avoid_: Default mode, failsafe, backup plan

**Preset**:
A specific named configuration of node names, coordinates, and canonical distributions (e.g. Archetype Setting) that satisfies the universal engine template.
_Avoid_: Theme, skin, setting

### Hierarchical Cartography & Encyclopedic Engine

**Hierarchical Cartography / Multi-Scale Pointcrawls**:
A recursive tree of pointcrawl graphs connected across arbitrary scale tiers (Cosmic, Continent, Region, Settlement, District, Building, Floorplan) via Portal Nodes.
_Avoid_: Sub-maps, minimaps, zoomed-in view

**Scale-Fluidity**:
The architectural principle allowing any pointcrawl map to serve as an independent standalone root, be attached as a sub-map, or be reparented at will, accommodating campaigns authored bottom-up (single building) or top-down (macro continent).
_Avoid_: Map level restrictions, strict tree hierarchy

**Portal Node (`childMapId`)**:
A pointcrawl node possessing an attached sub-pointcrawl map, designated visually by a concentric cyan portal ring and scale-tier glyph, traversable via double-click drill-down.
_Avoid_: Map link pin, doorway, entrance marker

**Bidirectional Wiki & Citation Inverted Index**:
A reactive offline token lexer (`[[Node:...]]`, `[[Map:...]]`, `[[Mod:...]]`, `[[Faction:...]]`, `[[NPC:...]]`, `[[Item:...]]`, `@...`, plus mod-registered custom token prefixes) and backlink graph dynamically connecting world lore, corridor notes, modules, and campaign entities with live preview cards and cross-scale canvas navigation.
_Avoid_: Lore links, tags, text search

**Transitive Backlink Propagation**:
The scale-fluid aggregation mechanism where portal nodes automatically roll up inbound citations targeting descendant submap nodes and stationed campaign entities with hierarchical breadcrumb attribution (`↳ via Submap > Node > NPC`). Descendants are resolved exclusively through `getRecursiveNodeEntities()`, which honors both attachment models (`node.childMapId` and `map.parentMapId` + `map.parentNodeId`), NPC-carried items, and relationally linked quests.
_Avoid_: Recursive search, child search, deep links

**Demographics**:
The spatial population presence of biological species, ancestries, or cultural peoples at a pointcrawl node or transit road edge. On nodes it is the SYS-RACE-02 census object `{ primary: {name, percentage}, minorities: [{name, percentage, traits}], social_friction_notes, tags: string[] }`; on corridors it is `{ tags: string[] }`. Chip inputs edit `tags` only and never overwrite census `primary` / `minorities`. Read through `normalizeDemographics()` / `getDemographicNames()`.
_Avoid_: Monster list, race stats, demographics-as-flat-array (prefer system-agnostic Demographics / Species)

**Controlling Faction**:
The single faction id holding a node (`node.faction`: e.g. `player`, `bbeg`, `contested`, `neutral`), consumed by corridor tension math in `sociology_data.js`.
_Avoid_: Owner, factions array

**Faction Presence**:
The additional factions operating at a node or along a corridor without controlling it (`node.factionPresence` / `edgeRecord.factionPresence`: `string[]`). Never replaces Controlling Faction.
_Avoid_: Factions (ambiguous), faction list

**Party Rapport & Stance**:
The local relational standing between the player party and a node or corridor settlement, stored as `partyRapport: { stance: -2..2, notes: string }`. It shares the NPC `dispositionToParty` scale and labels via `PARTY_STANCE_LABELS`: `-2` Hostile, `-1` Unfriendly, `0` Neutral, `+1` Friendly, `+2` Allied. Legacy plain strings normalize to `{ stance: 0, notes }`.
_Avoid_: Karma, player alignment, approval points, partyReputation, Revered / Welcomed / Suspicious

### Workstation Interface & Extensibility

**Workstation Shell (`start.html`)**:
The single-document desktop application entrypoint styled with classic Windows 95 / Visual Basic 6 3D bevel chrome, consolidating all campaign launching, multi-scale CAD pointcrawl authoring, procedural balancing, entity stationing, module supply-chain slotting, and VTT/dossier export into one unified interface with dual-runtime support (zero-install loopback server or zero-CORS offline file).
_Avoid_: Dashboard, web page, portal, multi-page app

**Dual-Runtime Execution (Zero-Install Loopback & Offline file:///)**:
The architecture enabling Creator Studio to execute both via local loopback (`http://127.0.0.1:8080/start.html` via Node.js `server.js` or Windows native .NET `server.ps1`) for full Secure Context API capabilities, and as a zero-CORS standalone offline file (`file:///start.html`) with zero external network dependencies.
_Avoid_: Localhost only, web server requirement, online-only app

**Modular Workstation Source (`src/workstation/`)**:
The directory of isolated HTML templates and JavaScript subsystem scripts assembled and inlined by `build_suite.js` (`Build-Suite.ps1`) into the standalone `start.html` distribution.
_Avoid_: External script bundle, runtime module loader

**MDI Window Manager (`MDIWindowManager`)**:
The internal Multiple Document Interface windowing controller inside `start.html` managing draggable, resizable, minimizable, and tileable Windows 95 dialog windows (`Module Explorer`, `Entity Manager`, `Ticket Command Center`, `Cartographic Map Navigator`, `Tarot Traditions & Hermeneutics`, `Sourcebook Package Manager`, and `Campaign Dossier & VTT Exporter`) synchronized with the bottom taskbar.
_Avoid_: Popup modal, browser tab, overlay

**Tabbed Right Dock (`#properties-dock`)**:
The docked right-hand workstation panel housing three synchronized views: (1) the two-column **Property Grid** for bi-directional Node, Corridor, and Map inspection, (2) **Waves & Dials** for emergent 7-wave progression and global balancer controls, and (3) **Factions** for territorial roster management.
_Avoid_: Sidebar form, settings panel

**Property Grid**:
A categorized, two-column Visual Basic 6 attribute inspector reflecting selected node, corridor, or campaign parameters (including GM overrides, Tarot & `[S,E,C]` disposition, amalgamation score, multi-vector corridor flows, slotted modules, stationed entities, and `[[Wiki]]` backlinks), synchronizing canvas changes bi-directionally.
_Avoid_: Detail view, sidebar form, settings panel

**Deprecation Redirect Stub**:
A lightweight, zero-CORS HTML forwarding file at a legacy path (`index.html`, `network/campaign_studio.html`) that preserves URL query parameters (`?campaign=...&title=...`) and redirects immediately to `start.html`.
_Avoid_: Broken link, duplicate app surface

**Mod Extension Area**:
A standardized runtime registration hook (`window.CreatorStudio.registerMod`) providing third-party or setting-specific worldbuilding modules with dedicated menu items, tool palette slots, and custom property grid attributes.
_Avoid_: Plugin manager, addon tab, external script

### Campaign Entities & Narrative Topology

**Active Campaign Roster**:
The authoritative collection of Non-Player Characters (NPCs), quest vectors, tangible items/relics, threat clocks/dials (`trackers`), and authoring tickets (`tickets`) explicitly attached to the current campaign topology, distinct from unassigned module library prototypes.
_Avoid_: Character list, database, party sheet

**Module Entity Prototype**:
A latent narrative element (NPC persona, quest objective, or artifact) defined within a worldbuilding module manifest that can be inspected, previewed, and promoted into the Active Campaign Roster.
_Avoid_: Template, sample NPC, flavor text

**Node Stationing / Assignment**:
The structural binding of an active NPC, quest thread, item, threat clock, or ticket to a discrete pointcrawl node ID (and optional `mapId`), rendering spatial telemetry badges (`M:# N:# Q:# I:# T:#`) and draggable clock callouts on the CAD canvas.
_Avoid_: Location tag, placement string, pin

### Module Exploration & Worldbuilding Mechanics

**Module Explorer**:
The authoritative, multi-pane workstation MDI window in `start.html` for filtering, inspecting, recommendation scoring, slotting (onto nodes or corridors), validating BFS supply chains, and studying worldbuilding modules across all enabled campaign sourcebooks.
_Avoid_: File browser, module list, catalog viewer

**Slotted Module (`nodeSlottedModules` / `edgeSlottedModules`)**:
A worldbuilding module explicitly anchored to a pointcrawl node or transit corridor, providing its resource tags (`provides`/`requires`), narrative sparks, severance threat clocks, and severity dials to that discrete graph location.
_Avoid_: Attached module, installed plugin, node link

**Module Entity Extraction**:
The automated parsing of latent NPCs, quests, and technological apparatus from module frontmatter and scenario prose into promotable campaign roster assets.
_Avoid_: Character scraping, template cloning, entity copying

**Module Sourcebook Reader**:
The embedded, formatted full-text viewer for studying a module's complete mechanical architecture, GM placement sockets, sabotage hazards, and authoritative cross-references.
_Avoid_: Markdown preview, text box, documentation tab

### Campaign Packaging, Persistence & Storage

**Portable Campaign Package (`.creator.json`)**:
A single-file, self-contained JSON document encoding the entire recursive pointcrawl hierarchy (`maps`), active campaign entities, 7-wave Tarot states, global dials, and base64-encoded background map images for zero-dependency cross-machine sharing and backup.
_Avoid_: Topology export, partial save, map file

**Campaign Archive Package (`.zip`)**:
A multi-file compressed campaign bundle deconstructing campaign metadata and topological schemas from raw raster image files (`assets/*.png`, `assets/*.jpg`) for modular editing and external image processing.
_Avoid_: Zip file, backup dump, tarball

**Workspace Project Directory**:
A local filesystem folder bound to Creator Studio via the File System Access API (`showDirectoryPicker()`), enabling automatic zero-prompt disk synchronization for campaign definitions, submap schemas, and externalized image assets.
_Avoid_: Working folder, save path, download cache

**Selective Map Importer**:
The workstation dialog and workflow for inspecting an external campaign archive or folder, choosing individual pointcrawl submaps, and either initializing a fresh campaign or merging them into an active project.
_Avoid_: Map copy tool, submap loader, file import dialog

**Entity Conflict Resolution**:
The diffing and reconciliation engine that identifies overlapping NPCs, quests, items, or threat clocks between the active campaign and an incoming package, offering Keep Existing, Overwrite, or Clone as New.
_Avoid_: Duplicate cleaner, merge conflict, overwrite prompt

### Cartographic Control & Quest Topology

**AutoCAD Standard Palette (ACI 1-9)**:
A standardized 9-color chromatic grammar based on the classic AutoCAD Color Index (1: Red, 2: Yellow, 3: Green, 4: Cyan, 5: Blue, 6: Magenta, 7: White, 8: Dark Gray, 9: Light Gray) applied to node geometries for instant structural categorization.
_Avoid_: Custom color, hex picker, RGB palette

**Fog-of-War Map Visibility (`node.visible`, `edge.visible`)**:
The cartographic concealment system where nodes or edges marked invisible are suppressed in player presentations and exports, automatically hiding incident transit corridors while preserving mathematical topology and balancing metrics.
_Avoid_: Hidden map, deleted node, disabled link

**GM Vision vs. Player Presentation View**:
The dual-mode viewport rendering state: GM Vision displays concealed elements with semi-transparent dashed lines and `[Hidden]` markers for session authoring; Player View completely conceals hidden elements for live campaign reveal.
_Avoid_: Edit mode, fog overlay, secret view

**Recursive Sub-Map Entity Aggregation**:
The multi-scale hierarchical traversal engine that crawls down all attached submaps and nested sub-submaps of a parent node, collecting and presenting all stationed NPCs, quests, items, and escalation dials.
_Avoid_: Submap tally, nested entity search, child count

**Quest Spanning Network**:
The structural footprint of a campaign quest comprising its primary anchor node, the locations of all linked NPCs, and the locations of all required/reward items, defining its geographical span across the pointcrawl graph.
_Avoid_: Quest line, mission chain, multi-node quest

### CAD Vector Drawing, Layers & Selection Architecture

**Drawn Shape Entity (`DrawingEntity`)**:
A non-topological vector geometric annotation on the CAD canvas (Rectangle, Circle/Ellipse, Straight Line/Arrow) possessing spatial coordinates, dimensions, stroke/fill styling, opacity, label, and layer assignment.
_Avoid_: Node, token, drawing object, sticker, overlay

**CAD Canvas Layer (`CanvasLayer`)**:
A named cartographic visual plane (`id, name, zIndex, visible, locked, opacity`) within a map topology that governs the visibility, locking, and stacking order of its assigned nodes, edges, and drawn shapes.
_Avoid_: Group, folder, level, sheet

**Multi-Entity Selection Set**:
The active collection of distinct canvas entities (nodes, edges, or drawn shapes) selected simultaneously via Shift-click or marquee bounding box, supporting unified manipulation and batch property mutation.
_Avoid_: Multi-select, highlighted items, group selection

**Shared Property Intersection (`*VARIES*`)**:
The CAD property grid inspection state when multiple entities are selected simultaneously, displaying and modifying only their shared attributes (such as `layerId`, `color`, `opacity`, `visible`, `locked`) while marking divergent values with `*VARIES*`.
_Avoid_: Batch edit, bulk change, multi-property form

**Type-Select (`Ctrl+Click`)**:
The rapid selection shortcut that immediately selects all canvas entities of the same primitive type (e.g., all Nodes, all Transit Roads, or all Rectangles) across the active map.
_Avoid_: Select all, group click

**Marquee Bounding Box (Window / Crossing Selection)**:
A drag-to-select rectangular bounding marquee on the canvas background that adds all intersecting or enclosed entities into the active selection set.
_Avoid_: Drag select, rubber band, lasso

### Campaign Lifecycle & State Isolation

**Sterile Slate (`resetWorkstationSlate`)**:
The authoritative campaign teardown and sterilization sequence that purges active in-memory topologies, cartographic registries, selection sets, history undo/redo stacks, dynamic SVG canvas layers, and transient module registries before creating, opening, or switching campaigns.
_Avoid_: Clear canvas, reset view, new file wipe

**Campaign Isolation Boundary**:
The strict architectural boundary ensuring that nodes, transit corridors, NPCs, quests, items, tickets, raster map background caches, and mod-specific datasets from one campaign never bleed into another campaign.
_Avoid_: Workspace sandbox, folder separation

**Campaign Mod Lifecycle (`onCampaignLoad`, `onCampaignUnload`)**:
Event hooks dispatched by the workstation shell notifying installed workstation mods of campaign transitions, enabling mods to persist and hydrate campaign-scoped data in the campaign directory while keeping workstation-level tool registrations and global preferences intact.
_Avoid_: Plugin restart, mod reload, addon reset

### Git-Integrated Token Optimization & Diff-Driven Engineering

**Diff-Driven Context Verification**:
The architectural practice where AI agents inspect modifications strictly via unified diff (`git diff -U3`) rather than re-reading whole source files, minimizing prompt token consumption by up to 95%.
_Avoid_: Whole-file re-reading, full file verification

**Commit State Anchor**:
An immutable Git commit SHA referenced in handoff documents, tickets, and multi-session roadmaps as an exact point-in-time snapshot of repository state, replacing repetitive prose state dumps in conversation context.
_Avoid_: Session snapshot text, chat state summary

**Isolated Worktree Sandbox**:
A linked Git worktree created via `git worktree add` allowing autonomous subagents or experimental feature spikes to execute without colliding with the primary working directory, returning only a consolidated patch diff.
_Avoid_: Temp copy folder, branch clone

**Zero-Token Drift Audit**:
Verifying synchronization between documentation, schema models, and implementation files using Git status and file tree hashes (`Find-CodebaseNode.ps1 -Stale` or `git status --porcelain`) rather than reading documents into prompt memory.
_Avoid_: Manual doc comparison, full text drift check


