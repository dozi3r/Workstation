---
file_path: "src/workstation/scripts/entity_crud_dialogs.js"
title: "entity_crud_dialogs.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "dea9b3a13ff07dcb"
reviewed_hash: "dea9b3a13ff07dcb"
stale: false
size_bytes: 49556
line_count: 934
---

# entity_crud_dialogs.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_crud_dialogs.js` manages custom entity creation modals, editing workflows, and spatial quest analysis within Creator Studio (`start.html`).

### Key Capabilities
- **Multi-Node Quest Spanning Engine**: Computes and previews the topological footprint of narrative quests across pointcrawl nodes (`getQuestSpanningNodes`, `updateQuestSpanningPreview`), identifying anchor stations, objective nodes, and referenced character/item locations.
- **Custom Entity Authoring Dialog**: Powers the New Entity creation modal (`openNewEntityModal`), pre-populating fields based on the active entity tab and auto-suggesting stationing candidates.
- **Entity Edit Controller**: Handles in-flight modification of existing campaign entities (`openEditEntityModal`), populating existing traits, descriptions, requirements, and reward structures.
- **Persistence & Canvas Synchronization**: Validates and commits created/updated entities to the active campaign topology (`saveCustomEntity`), triggering canvas HUD refreshes, properties grid updates, and notification status messages.
<!-- END_CUSTOM_NOTES -->
