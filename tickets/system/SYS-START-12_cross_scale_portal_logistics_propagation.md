---
id: SYS-START-12
title: "Trans-Scale Cartographic Logistics & Portal Supply Propagation"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Multi-Scale Logistics & Supply Flow"
grounded_prerequisites: ["docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md", "tickets/system/SYS-START-08_ad_hoc_resource_supply_flows_and_conduits.md", "src/workstation/scripts/stage_5_slotting.js"]
grounded_yields: ["Portal Bridge Logistics Protocol", "Trans-Scale BFS Traversal", "Hierarchical Resource Export/Import", "Cross-Map Deficit Auditing"]
provides: ["Logistics: Cross-Scale-Propagation", "Cartography: Trans-Scale-BFS"]
requires: ["Workstation: start.html", "Cartography: Multi-Map-Registry", "Logistics: Ad-Hoc-Resource-Yields"]
standalone_fallback: "Single-map isolated BFS supply chain auditing without cross-scale flow."
---
# SYS-START-12: Trans-Scale Cartographic Logistics & Portal Supply Propagation
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-10-30*

## 1. Overview & Objective
Creator Studio features a scale-fluid cartography system allowing any pointcrawl node to serve as a portal node (`childMapId`) nesting subordinate maps (continents down to settlements, dungeons, and floorplans). However, the BFS supply chain validation engine in `stage_5_slotting.js` operates strictly on the active map's localized graph. As a result, submaps are logistical silos: a hydroelectric power station on the regional map cannot send `Power: High-Voltage` down through a settlement portal, and an agrarian farm valley inside a submap cannot export `Food: Fresh-Produce` up to the regional hub.

This ticket implements the **Portal Bridge Logistics Protocol**:
1. Allows portal nodes to declare directional trans-scale supply flow rules (`exportDown` and `importUp`).
2. Generalizes the BFS reachability engine in `stage_5_slotting.js` to traverse portal nodes into child maps and crawl parent linkages, enabling end-to-end multi-scale supply chain simulation.

---

## 2. Implementation Deliverables

### 2.1 Portal Node Logistics Attributes (`src/workstation/scripts/property_grid_inspector.js`)
When inspecting a node that possesses a `childMapId`:
1. Under `[ Hierarchical Cartography ]`, append two configuration toggles:
   - `exportDown: boolean` (Default: `true`) — "Export Parent Resources into Sub-Map".
   - `importUp: boolean` (Default: `true`) — "Import Sub-Map Resources into Parent Node".
2. Also support custom trans-scale conduit filters (optional array `transScaleFlows = []`).

### 2.2 Trans-Scale BFS Supply Algorithm (`src/workstation/scripts/stage_5_slotting.js`)
Refactor `checkNodeAdHocSupplyLine(nodeId)` and `checkModuleSupplyLine(mid, targetNodeId)`:
1. **Down-Flow (Parent to Child Submap)**:
   - When evaluating a node located on a submap (`activeTopology.parentMapId` exists):
   - Look up the parent map and parent portal node (`activeTopology.parentNodeId`).
   - If the parent portal has `exportDown !== false`:
     - Perform BFS on the parent map starting from `parentNodeId`.
     - Collect all reachable parent `provides` (from nodes, slotted modules, and dedicated conduits).
     - Merge these into the child map node's available resource pool.
2. **Up-Flow (Child Submap to Parent Map)**:
   - When evaluating a node on the parent map:
   - During standard BFS, if an unblocked reachable node $V$ has `childMapId` and `importUp !== false`:
     - Access `activeTopology.maps[v.childMapId]`.
     - Collect all `provides` generated within that submap (from nodes with `node.provides` and slotted modules).
     - Add them to the reachable network resource pool for $V$ and its incident network.
3. **Loop & Cycle Guard**:
   - Maintain a `visitedMapIds` Set in the traversal context.
   - Limit hierarchical recursion depth to 5 levels to guarantee instant execution (<10ms).

### 2.3 Canvas & Property Grid Badges
1. When a node's demands are satisfied via a trans-scale parent or child map, display an indicator icon: `🌀 Trans-Scale (from [Map Name])`.
2. In the Breadcrumbs HUD top-left, display a small indicator pill if any parent/child map is experiencing a supply deficit.

---

## 3. Verification & Testing Criteria
1. **Unit Test Coverage (`test/run_tests.js`)**:
   - Create parent map with Node 1 (`provides: ["Power: Geothermal"]`) connected to Node 2 (Portal Node with `childMapId: "map_district"`).
   - In `map_district`, create Sub-Node A (`requires: ["Power: Geothermal"]`).
   - Run `checkNodeAdHocSupplyLine("A")` on submap: assert `ok: true`.
   - Set Node 2 `exportDown: false`: assert `ok: false` with missing `"Power: Geothermal"`.
   - In `map_district`, create Sub-Node B (`provides: ["Ore: Mithril"]`). Run check on Parent Node 1 (`requires: ["Ore: Mithril"]`): assert `ok: true` when `importUp: true`.
2. **Regression Check**:
   - Verify that campaigns without submaps execute standard BFS with zero performance overhead.
