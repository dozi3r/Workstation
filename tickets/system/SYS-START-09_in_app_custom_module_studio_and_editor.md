---
id: SYS-START-09
title: "In-App GM Custom Worldbuilding Module Studio & Editor"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Logistics & Supply Flow Simulation"
grounded_prerequisites: ["docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md", "tickets/system/SYS-START-08_ad_hoc_resource_supply_flows_and_conduits.md", ".scratch/creator-remediation/issues/14-in-app-custom-module-maker-and-editor.md"]
grounded_yields: ["Custom Module Studio Dialog", "Topology Custom Modules Storage", "Module Markdown Exporter"]
provides: ["Workstation: Custom-Module-Studio", "Entities: Custom-Module-CRUD"]
requires: ["Workstation: start.html", "Module: ALL_MODULES"]
standalone_fallback: "Read-only pre-compiled module catalog without in-app custom module creation."
---
# SYS-START-09: In-App GM Custom Worldbuilding Module Studio & Editor
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: shipped*  
*Date: 2026-10-26*

## 1. Overview & Objective
Close the primary architectural authoring gap in Creator Studio by introducing an in-app Windows 95 MDI dialog (`Custom Module Studio`) for designing, editing, cloning, and managing custom 5-Tier Worldbuilding Modules. Custom modules are stored directly in `activeTopology.custom_modules` and persist within `.creator.json` campaign packages, integrating seamlessly with Module Explorer, recommendation scoring, and supply flow simulation.

## 2. Implementation Deliverables
1. **MDI Window & Dialog UI**:
   - Create `#modal-custom-module-editor` in `template.html` conforming to the Win95/VB6 desktop aesthetics.
   - Add a `[+ New Custom Module]` button in `module_explorer.js`.
2. **Authoring Controls**:
   - Basic metadata: ID, Title, Pipeline Tier (1..5), CVF Culture Quadrant, MTG Color Identity, Tarot Major Arcana card.
   - Logistics: Inputs (`requires`), Outputs (`provides`), and `standalone_fallback` profile upon corridor severance.
   - Narrative & Latent Entities: Lore overview, encounter hook, and prototype NPCs/Quests/Items.
3. **Property Grid Integration**:
   - Provide a 1-click "Promote Node Endowments to Module" action that converts ad-hoc `node.provides`/`node.requires` into a reusable module.
4. **Serialization & Export**:
   - Save custom modules into `activeTopology.custom_modules = []` in `.creator.json` campaign archives.
   - "Export to Markdown" button that writes standardized `.md` files formatted for official inclusion in `campaigns/`.
