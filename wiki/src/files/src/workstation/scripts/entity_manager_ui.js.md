---
file_path: "src/workstation/scripts/entity_manager_ui.js"
title: "entity_manager_ui.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "4184d78792242c91"
reviewed_hash: "4184d78792242c91"
stale: false
size_bytes: 227964
line_count: 3804
---

# entity_manager_ui.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_manager_ui.js` controls the universal Entity Manager MDI workspace surface within Creator Studio (`start.html`).

### Key Capabilities
- **Workspace Navigation & Tabs**: Handles workspace lifecycle (`openEntityManager`), tab switching across NPCs, Quests, Items, Resources, Creatures, Clocks, Factions, and Nodes (`switchEntityManagerTab`), and visual active state button indicators (`updateEntityTabButtons`).
- **Resource Explorer Tab (`em-tab-resource`)**: Provides dedicated commodity logistics explorer with multi-map node aggregation, Dwarf Fortress physical stockpile and batch specs, and public settlement depot filters.
- **Bestiary Explorer Tab (`em-tab-creature`)**: Delivers full monster manual explorer with Threat Tier (0-5) and Kind filters, 6 Relative Capability stat bars with visual pips, Dread Index gauge (1-10) and Dread Effect hazard notes, embedded Fast-and-Frugal Tree preview, and collapsible Source Figures & Rating Rationale hydrated from `topo.creatureEvidence`.
- **Hierarchical Classification Tree**: Builds and updates the categorized left sidebar tree (`renderEntityManagerTree`, `addTreeItem`), grouping entities by module, station node, cultural quadrant, threat level, or tier.
- **Filterable Entity Roster Table**: Generates the central multi-column tabular ledger (`renderEntityManagerList`, `renderMiniClockGauge`) displaying status tags, ownership indicators, station nodes, and archetype badges.
- **Comprehensive Entity Inspector**: Implements the in-depth right inspector pane (`selectEntityItem`), providing editable fields, ODV coordinate readouts, relationship tables, quest step progression lists, item inventory links, and clock gauge controllers.
- **Deep-Link Entity Navigation**: Exposes `navigateToEntity(type, id)` to programmatically transition workstation focus from canvas nodes or HUD badges directly into the specific entity inspector.
- Gigerenzer suite (ADR 0024): NPC and faction panes render the heuristic badge and decision-tree dossier; Edge Explorer shows a natural-frequency summary under hazard risk.
<!-- END_CUSTOM_NOTES -->
