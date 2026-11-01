---
id: SYS-START-07
title: "Quest Spanning Network Overhaul, Fog-of-War Map Visibility & Recursive Sub-Map Entity Aggregation"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Multi-Scale Cartography & Campaign Entities"
grounded_prerequisites: ["docs/adr/0012-quest-spanning-networks-fog-visibility-and-recursive-submap-entities.md"]
grounded_yields: ["Recursive Sub-Map Entity Discovery", "AutoCAD ACI Node Colors", "Global Position Locking", "Fog-of-War Visibility", "Quest Spanning Network"]
provides: ["Cartography: Fog-Of-War", "Entities: Recursive-Submap-Aggregation", "Entities: Quest-Spanning-Network"]
requires: ["Workstation: start.html", "Cartography: Multi-Map-Registry"]
standalone_fallback: "Flat single-map entity listing with all nodes visible."
---
# SYS-START-07: Quest Spanning Network Overhaul, Fog-of-War Map Visibility, and Recursive Sub-Map Entity Aggregation
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: shipped*  
*Date: 2026-10-19*

## 1. Overview & Objective
Enhance the Creator Studio workstation with five essential cartographic and campaign authoring capabilities:
1. **Recursive Sub-Map Entity Discovery**: Selecting any node automatically crawls nested child maps and sub-submaps to aggregate stationed NPCs, quests, items, and escalation clocks.
2. **AutoCAD Color Standard (ACI 1-9)**: Node chromatic styling based on standard AutoCAD Index Colors with instant swatch selection.
3. **Global Position Locking**: Edit menu actions to lock and unlock all node positions simultaneously.
4. **Fog-of-War Visibility Architecture**: Support for `visible` properties on nodes and edges, automatic edge concealment when endpoint nodes are hidden, and an interactive GM Vision toggle.
5. **Quest Spanning Network & Item Creator Overhaul**: First-class multi-entity quest association (main anchor node + linked NPCs + linked Items) with live spanning network calculation and first-class Item management.
6. **Toolbox & Toolbar Streamlining**: Renaming Toolbox header, removing obsolete T3/move buttons, removing the top toolbar Map Image button, and binding background image upload to layout tab double-clicks.

## 2. Implementation Deliverables
- **`src/workstation/template.html`**:
  - Rename palette header from "Tools" to "Toolbox".
  - Remove `#tool-move`, `#tool-node-t3`, and `#tool-map-image` from CAD Toolbox.
  - Remove `+ Map Image` button from `.standard-toolbar`.
  - Add "Lock All Node Positions" and "Unlock All Node Positions" to Edit menu.
  - Add `[GM Vision]` layer toggle button to `#hud-layer-focus`.
- **`src/workstation/modals/existing_modals.html`**:
  - Overhaul `#modal-entity-edit` with dedicated Quest association section (NPC selector, Item selector, and live Spanning Quest Network readout).
- **`src/workstation/scripts/workstation_core.js`**:
  - Implement `lockAllNodes(lock)`.
  - Implement `toggleGmVision()`.
  - Implement `getRecursiveNodeEntities(nodeId, mapId)`.
  - Update `renderCanvas()` to honor `node.visible`, `edge.visible`, and `Workstation.showGmVision`.
  - Support `node.color` with standard AutoCAD colors and high-contrast badge text.
  - Update Node Properties grid to display AutoCAD color selector, player visibility toggle, and recursive submap entity rosters.
  - Update Edge Properties grid to display corridor player visibility toggle.
- **`src/workstation/scripts/canvas_hud.js`**:
  - Update layout tab `ondblclick` to invoke `triggerMapImageUpload(m.id)`.
- **`src/workstation/scripts/entity_manager.js`**:
  - Update Quest Creator modal controller (`openNewEntityModal`, `openEditEntityModal`, `saveCustomEntity`) to bind NPCs, Items, and preview spanning nodes.
  - Update Quest Detail Inspector to show anchor node, linked NPCs, linked Items, and Spanning Quest Network with jump buttons.
  - Update Item Catalog inspector with specifications, assigned node, lore notes, and referencing quests.
  - Update Node Explorer to display visibility, position lock, AutoCAD color, shape, submap portals, and recursive submap entities.
- **`src/workstation/scripts/state_adapter.js` & `stage_6_export.js`**:
  - Ensure `visible`, `color`, `locked`, `npcIds`, and `itemIds` are preserved during normalization and campaign JSON export.
