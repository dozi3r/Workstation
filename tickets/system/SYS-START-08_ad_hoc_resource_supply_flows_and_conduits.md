---
id: SYS-START-08
title: "Ad-Hoc Node & Edge Resource Supply Flows and Trade Conduits"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Logistics & Supply Flow Simulation"
grounded_prerequisites: ["docs/srd/authoring_engine_srd.md", ".scratch/creator-remediation/issues/13-ad-hoc-node-and-edge-resource-supply-flows.md"]
grounded_yields: ["Node Resource Endowments", "Corridor Trade Conduits", "Ad-Hoc Deficit Auditing"]
provides: ["Logistics: Ad-Hoc-Resource-Yields", "Logistics: Trade-Conduits"]
requires: ["Workstation: start.html", "Topology: Active-Graph"]
standalone_fallback: "Module-only supply chain checking without ad-hoc node endowments."
---
# SYS-START-08: Ad-Hoc Node & Edge Resource Supply Flows and Trade Conduits
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: shipped*  
*Date: 2026-10-22*

## 1. Overview & Objective
Enable Game Masters to author localized natural endowments (e.g. natural aquifers, salt flats, iron veins) and settlement deficits directly on nodes (`node.provides`, `node.requires`) and establish explicit transport pipelines/trade routes on corridors (`edgeRecord.dedicatedFlows`) without being forced to create a full worldbuilding module. Extend the BFS supply chain algorithm in `stage_5_slotting.js` to ingest these properties directly during pointcrawl reachability audits.

## 2. Implementation Deliverables
1. **Topology Schema Extension**:
   - `node.provides = []`: Array of typed resource tags produced naturally by this location.
   - `node.requires = []`: Array of typed resource tags demanded by this location's population.
   - `edgeRecord.dedicatedFlows = []`: Array of resource tags permitted to flow through this specific corridor regardless of standard transit impedance.
2. **Property Grid Inspector (`property_grid_inspector.js`)**:
   - Add `[ Local Resource Logistics ]` category when inspecting nodes with editable chip/tag fields for yields and demands.
   - Add `[ Dedicated Conduits ]` row when inspecting corridors.
3. **Simulation Engine (`stage_5_slotting.js`)**:
   - Merge `node.provides` into `localProvides` and BFS reachable resource sets.
   - Evaluate `node.requires` during `auditAllSupplyLines()`, generating a warning badge if unfulfilled.
4. **Canvas Visual Telemetry**:
   - Add optional HUD toggle or node badges indicating active natural endowments.
