---
id: SYS-START-21
title: "AutoCAD-Style Map Layout Tabs Strip with Hierarchical Grouping & Overflow"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
track: "Platform Development"
priority: "Medium"
wave: "Workstation Architecture: Multi-Scale Cartography & Spatial CAD"
grounded_prerequisites: [
  "docs/adr/0004-desktop-workstation-start-html.md",
  "src/workstation/scripts/map_navigator.js",
  "src/workstation/scripts/canvas_hud.js",
  "src/workstation/scripts/state_adapter.js",
  "src/workstation/template.html"
]
grounded_yields: [
  "AutoCAD-Style Layout Tab Strip (Bottom CAD Canvas Dock)",
  "Hierarchical / Parent Map Grouping with Expand/Collapse Folders",
  "Tab Horizontal Overflow Panning (|◀, ◀, ▶, ▶|)",
  "Quick Map Dropdown Switcher",
  "Right-Click Tab Context Menu (Properties, Add Child Map, Delete)"
]
provides: ["Workstation: Map-Layout-Tabs", "Cartography: Multi-Map-Switcher"]
requires: ["Workstation: start.html", "creator_studio_maps_registry", "switchActiveMap"]
standalone_fallback: "Floating HUD breadcrumbs and MDI Map Navigator window."
alias_id: "DEV-02"
---
# SYS-START-21: AutoCAD-Style Map Layout Tabs Strip with Hierarchical Grouping & Overflow (DEV-02)
*Category: system_architecture | Priority: Medium | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready | Author: Development Backlog*  
*Date: 2026-11-01*

## 1. Overview & Objective
In Creator Studio campaigns containing numerous maps and nested submaps (e.g. *Baldur's Gate 1* with Sword Coast, Candlekeep, Beregost, Nashkel, Nashkel Mines Levels 1-4, Cloakwood, Bandit Camp, City of Baldur's Gate, Undercity, and Durlag's Tower—over 16 maps), switching between maps becomes clumsy and nearly unusable using only floating breadcrumbs or deeply nested modal dialogs.

Professional CAD workstations (AutoCAD, IntelliCAD, MicroStation) solve spatial layout proliferation via a dedicated bottom layout tab strip. Authors can rapidly toggle between paper-space sheets and model-space layouts, group sheets into logical sets (e.g. "Nashkel Mines" group containing Surface, L1, L2, L3, L4), expand/collapse groups to preserve screen real estate, and pan through tabs via overflow scroll controls.

### Acceptance Criteria / Acceptance Test:
Feature will be accepted when:
1. An AutoCAD-style layout tab strip is mounted along the bottom of the CAD canvas (above the status bar).
2. Maps are organized hierarchically:
   - Root / Top-level maps display as primary layout tabs (e.g. `[🗺️ Sword Coast]`).
   - Maps with child submaps render with an expand/collapse toggle or as a grouped cluster (e.g. `[📁 Nashkel Mines (5) ▾]`).
   - Expanding a group reveals its child layout tabs; minimizing collapses them into the parent tab header.
3. Overflow controls (`|◀`, `◀`, `▶`, `▶|` and a `📑 All Maps...` dropdown picker) allow smooth horizontal scrolling when the campaign contains more maps than fit in the viewport width.
4. Active map tab is distinctly highlighted with Win95 outset/active state and syncs bidirectionally with `activeMapId`, portal navigation, and breadcrumb trails.
5. Tab context actions: Right-clicking or clicking the tab ellipsis allows opening Map Properties, adding a child submap, or re-centering.

---

## 2. Implementation Deliverables & Architectural Seams

### 2.1 Tab Strip DOM Container (`src/workstation/template.html`)
- Insert `<div id="canvas-map-tabs-bar" class="cad-map-tabs-bar bevel-thin">` at the bottom of `#canvas-container` (or docked immediately above the desktop taskbar/status bar).
- Structure:
  ```html
  <div id="canvas-map-tabs-bar" class="cad-map-tabs-bar">
    <div class="cad-tabs-controls">
      <button class="win-btn tab-nav-btn" onclick="scrollMapTabs('start')" title="First Map">|&#9664;</button>
      <button class="win-btn tab-nav-btn" onclick="scrollMapTabs('left')" title="Scroll Left">&#9664;</button>
      <button class="win-btn tab-nav-btn" onclick="scrollMapTabs('right')" title="Scroll Right">&#9654;</button>
      <button class="win-btn tab-nav-btn" onclick="scrollMapTabs('end')" title="Last Map">&#9654;|</button>
      <button class="win-btn tab-nav-btn" onclick="toggleMapQuickPickerMenu()" title="Quick Map List (All Maps)">&#128196;&#9662;</button>
    </div>
    <div id="cad-tabs-viewport" class="cad-tabs-viewport">
      <div id="cad-tabs-scroll-container" class="cad-tabs-scroll-container">
        <!-- Dynamically rendered tabs & groups -->
      </div>
    </div>
    <div class="cad-tabs-actions">
      <button class="win-btn tab-add-btn" onclick="openNewSubMapPrompt()" title="Create New Map / Layout">+ Map</button>
    </div>
  </div>
  ```

### 2.2 Tab Strip Styling (`src/workstation/styles/win95_workstation.css`)
- Win95 / CAD layout tab styling:
  - `.cad-map-tabs-bar`: Height ~28px, background `#d4d0c8`, border-top `1px solid #808080`, flex layout, zero-clipping.
  - `.cad-tab`: Inset bevel when inactive, outset bevel with white background and blue text when active (`#000080`), bold typography, icon + name.
  - `.cad-tab-group`: Visual bracket/folder cluster with badge count `(N)` and chevron toggle `▾` / `▸`.
  - `.cad-tab-group.collapsed .cad-child-tab`: Hidden (`display: none`).

### 2.3 Tab Controller & Lifecycle Engine (`src/workstation/scripts/map_navigator.js`)
- Implement `renderMapTabsBar()`:
  - Query all maps from `creator_studio_maps_registry` (or global `maps` object).
  - Group maps into tree clusters:
    - Independent root maps.
    - Parent maps with nested child submaps (`parentMapId`).
  - Read expansion state from `localStorage.getItem("cs_map_tab_groups_state")` to preserve user fold/unfold preferences.
  - Render tabs with active highlight matching `activeMapId`.
  - Attach click handlers calling `switchActiveMap(mapId)`.
- Implement `scrollMapTabs(direction)`:
  - Smooth scroll `#cad-tabs-scroll-container` horizontally.
- Auto-scroll active tab into view whenever `switchActiveMap()` completes.

---

## 3. Acceptance Checklist
- [ ] Tab strip mounts cleanly at the bottom of the canvas viewport without obscuring CAD drawing tools.
- [ ] Child submaps group under parent maps with functional expand/collapse buttons.
- [ ] Collapsed/expanded group state persists across page sessions.
- [ ] Overflow scroll controls and Quick Map dropdown allow seamless navigation in campaigns with 15+ maps.
- [ ] Switching maps updates the active tab, HUD breadcrumbs, and active topology canvas synchronously.
- [ ] Tests and suite compilation pass with zero errors.
