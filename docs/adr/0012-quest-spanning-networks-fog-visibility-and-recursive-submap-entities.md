# ADR 0012: Quest Spanning Networks, Fog-of-War Visibility, AutoCAD Color Grammar, and Recursive Sub-Map Entity Aggregation

## Status
Accepted (2026-10-19)

## Context
As Creator Studio campaigns expand into multi-scale nested architectures (with root maps, district submaps, and tactical interior layouts) and live tabletop play sessions, several cartographic and narrative gaps emerged:
1. **Fog-of-War & Cartographic Secrecy**: Game Masters need to hide undiscovered nodes and secret transit corridors from player eyes without breaking mathematical network connectivity or balance metrics. Connected edges should automatically follow the visibility of their endpoint nodes, while secret roads must remain hidden even if both connecting nodes are revealed.
2. **AutoCAD Visual Classification**: Worldbuilders require immediate, standardized visual categorization of nodes without navigating deep RGB pickers. The classic 9-color AutoCAD Index Color (ACI) palette (Red, Yellow, Green, Cyan, Blue, Magenta, White, Dark Gray, Light Gray) provides an instant CAD-grade chromatic system.
3. **Cartographic Position Locking**: Accidental dragging of established nodes during play or editing creates accidental drift. A global "Lock All Node Positions" action and persistent node-level lock flag are necessary.
4. **Hierarchical Recursive Entity Aggregation**: A node anchoring a portal to a submap (or chain of submaps) could not previously reveal the characters, quests, items, or escalation dials stationed within its sub-tree. Selecting a surface settlement node must recursively inspect and tally all entities across all descendant submaps and sub-submaps.
5. **Quest Spanning Networks & Item Workflows**: Quests in pointcrawl adventures rarely exist at a single coordinate; they connect an origin hub, quest-giver NPCs, targets, and objective items across multiple nodes. The quest model must associate multiple NPCs and items, automatically deriving and presenting the full "Spanning Quest Network". Concurrently, items must be elevated to first-class entities with dedicated node assignments, specifications, and lore notes.

## Decision
1. **Dual Visibility Architecture (`node.visible` & `edge.visible`)**:
   - Every node stores a boolean `visible` flag (defaulting to `true`). When set to `false`, the node represents an unrevealed location (Fog-of-War).
   - Every edge in `topo.edgeData` stores a boolean `visible` flag (defaulting to `true`).
   - In **Player Presentation View** (`!Workstation.showGmVision`):
     - A node is rendered if and only if `node.visible !== false`.
     - An edge is rendered if and only if `isNodeUVisible && isNodeVVisible && edge.visible !== false`.
   - In **GM Vision Mode** (`Workstation.showGmVision`):
     - Hidden nodes and edges are rendered with semi-transparent dashed styling (opacity: 0.35 - 0.4, dashed borders, and `👁️‍🗨️ Hidden` badges), enabling the GM to inspect, manipulate, and reveal them with one click.
     - A dedicated HUD button `[GM Vision]` and View menu entry allow instant switching between GM and Player views.
2. **AutoCAD Color Standard (ACI 1-9)**:
   - Nodes support a `color` attribute mapped to standard AutoCAD colors (1: Red, 2: Yellow, 3: Green, 4: Cyan, 5: Blue, 6: Magenta, 7: White, 8: Dark Gray, 9: Light Gray, or Auto).
   - The Properties Inspector and Node Explorer provide an instant color swatch selector.
3. **Global Node Locking**:
   - The Edit menu provides "Lock All Node Positions" (<kbd>lockAllNodes(true)</kbd>) and "Unlock All Node Positions" (<kbd>lockAllNodes(false)</kbd>).
4. **Recursive Sub-Map Entity Traversal (`getRecursiveNodeEntities`)**:
   - Implemented a depth-first traversal engine that inspects `node.childMapId` and `map.parentMapId`/`map.parentNodeId` relationships to any arbitrary depth.
   - For any selected node, collects all direct entities stationed on that node plus all descendant submaps and their stationed NPCs, quests, items, and threat clocks.
   - Renders breadcrumbed submap trees and quick-jump actions (`[🌀 Enter Sub-Map]` and `[🎯 Center on Node]`) directly in the Property Dock and Node Explorer.
5. **Quest Spanning Network Engine & Items Workflow**:
   - Quests now maintain `nodeId` (Main Anchor Node), `npcIds` (array of linked NPCs), and `itemIds` (array of linked items).
   - The Quest Creator modal and Entity Inspector dynamically compute the **Spanning Quest Network**: the union of the anchor node, all nodes housing linked NPCs, and all nodes housing linked items.
   - Items are first-class entities (`id`, `name`, `category`, `specs`, `notes`, `nodeId`) with direct node placement and reverse-link tracking to parent quests.

## Consequences
- Worldbuilders can author complex multi-node conspiracies, heist networks, and mystery trails with visual verification across all nodes involved.
- GMs can run live sessions with real-time fog-of-war reveals without altering underlying graph topology or balance math.
- The Toolbox and Toolbar are decluttered: redundant move/T3 buttons are removed, map image background insertion is accessible via the Insert menu and quick tools, and layout tab double-clicks/right-clicks open the comprehensive Map & Layout Properties dialog.
- 100% zero-CORS compliance is preserved across `start.html`.
