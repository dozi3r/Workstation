---
file_path: "src/workstation/scripts/entity_manager_ui.js"
title: "entity_manager_ui.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "a92d7ef5fddc7390"
reviewed_hash: "a92d7ef5fddc7390"
stale: false
size_bytes: 95072
line_count: 1585
---

# entity_manager_ui.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_manager_ui.js` controls the universal Entity Manager MDI workspace surface within Creator Studio (`start.html`).

### Key Capabilities
- **Workspace Navigation & Tabs**: Handles workspace lifecycle (`openEntityManager`), tab switching across NPCs, Quests, Items, Clocks, and Nodes (`switchEntityManagerTab`), and visual active state button indicators (`updateEntityTabButtons`).
- **Hierarchical Classification Tree**: Builds and updates the categorized left sidebar tree (`renderEntityManagerTree`, `addTreeItem`), grouping entities by module, station node, cultural quadrant, threat level, or tier.
- **Filterable Entity Roster Table**: Generates the central multi-column tabular ledger (`renderEntityManagerList`, `renderMiniClockGauge`) displaying status tags, ownership indicators, station nodes, and archetype badges.
- **Comprehensive Entity Inspector**: Implements the in-depth right inspector pane (`selectEntityItem`), providing editable fields, ODV coordinate readouts, relationship tables, quest step progression lists, item inventory links, and clock gauge controllers.
- **Deep-Link Entity Navigation**: Exposes `navigateToEntity(type, id)` to programmatically transition workstation focus from canvas nodes or HUD badges directly into the specific entity inspector.
<!-- END_CUSTOM_NOTES -->
