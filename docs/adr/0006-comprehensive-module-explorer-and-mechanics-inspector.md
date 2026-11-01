# 0006: Comprehensive Module Explorer, Worldbuilding Sourcebook & Multi-Tier Mechanics Inspector

## Context
Creator Studio's 5-Tier Worldbuilding Pipeline organizes over 118 modular game assets across multiple campaign sourcebooks (`campaigns/generic_starter`, `campaigns/opal_island`, and `campaigns/sun_wukong`). Each module contains dense, interconnected tabletop data:
- 5-Tier Pipeline classification (Macro Governance, Biomes, Infrastructure, Narrative Sparks, Esoterica).
- Topological supply chain contracts (`provides` / `requires` resource tags).
- Injected narrative mechanics: latent Non-Player Characters (NPCs), quest vectors, threat clocks, output dials (Levels 1 to 4), and Four-Corner sociological opposition.
- Extensive mechanical architecture, GM placement sockets, and environmental hazards.

Previously, module data was fragmented across static markdown files, disparate audit dashboards, or limited slotting selectors without access to the rich internal text, threat clocks, or narrative entities. Tabletop authors and Game Masters needed a **comprehensive, primary in-workstation explorer** that allows them to browse, inspect, slot modules into nodes, extract entities directly into their active campaign rosters, and study full sourcebook notes in a single view.

## Decision
1. **Module Explorer as the Primary Source of Module Truth**:
   Establish an integrated, multi-pane **Module Explorer** (`#modal-module-explorer`) within the desktop workstation (`start.html`), serving as the authoritative interactive sourcebook for all modules across all registered campaigns.
2. **Four-Tab Deep Inspection Architecture**:
   - **Tab 1: Overview & Supply Chain**: 5-Tier classification, cultural quadrant, Tarot affinities, node placement prerequisites, standalone fallback execution mode, and bi-directional supply chain contracts (`provides` and `requires` resource tags).
   - **Tab 2: Narrative Entities (NPCs, Quests, Items)**: Explicit parsing of latent characters, dilemma stakes, and technological apparatus with one-click promotion into the active campaign roster and direct node stationing.
   - **Tab 3: Mechanics, Clocks & Dials**: Interactive breakdown of Threat Clocks with tick escalation, Output Dials (Levels 1 to 4 severity/output), and Four-Corner Sociological Opposition (Establishment, Opponent, Shadow, Outcast).
   - **Tab 4: Full Sourcebook & Notes**: Zero-CORS offline formatted markdown reader rendering full mechanical architecture, GM placement sockets, sabotage hazards, and cross-references, with a raw markdown toggle and direct file links.
3. **Interactive Node Slotting Engine**:
   - Modules can be slotted directly onto map nodes (`node.modules = []`), creating explicit topological anchors for supply chains and narrative threats.
   - Slotting/unslotting is synchronized instantly across the CAD canvas, the two-column Property Grid, and local persistence (`localStorage`).
4. **CAD Canvas & Property Grid Telemetry Synchronization**:
   - The CAD canvas renders real-time multi-dimensional spatial telemetry badges on node perimeters (`M:# N:# Q:# I:#`), tracking slotted modules (`M`), assigned NPCs (`N`), active quests (`Q`), and stationed items (`I`).
   - Selecting a node in the CAD canvas populates a dedicated `[ Slotted Modules ]` section in the Visual Basic 6 Property Grid, with direct action links to inspect or unslot modules.
5. **Automated Compiler Synchronization (`build_suite.js`)**:
   - The centralized compiler enriches all 118+ modules across installed campaigns with extracted entity collections (`extracted_npcs`, `extracted_quests`, `extracted_items`) and compiles the authoritative `ALL_MODULES` dataset directly into `start.html` within a fenced block, preserving the zero-CORS offline execution invariant.

## Consequences
- Tabletop Game Masters and authors have a single, unified workstation interface to discover, evaluate, and slot modules with complete visibility into all mechanics, clocks, and lore.
- Narrative entities within modules (240+ NPCs, 190+ Quests, 340+ Items) are seamlessly bridged into the active campaign roster without manual re-typing.
- Pointcrawl nodes become fully realized narrative hubs with visible multi-axis telemetry badges on the CAD canvas.
- System integrity is maintained with zero external dependencies and 100% offline functionality.
