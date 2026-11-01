---
id: SYS-START-18
title: "Resizable MDI Windows & Flexible Workspace Dock Splitters"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Desktop MDI Shell & Layout Flexibility"
grounded_prerequisites: ["docs/adr/0004-desktop-workstation-start-html.md", "src/workstation/scripts/mdi_window_manager.js", "src/workstation/styles/win95_workstation.css"]
grounded_yields: ["8-Way Window Resizing", "Draggable Splitter Bars", "Persistent Viewport Geometry", "Dock Width Adjustment"]
provides: ["Workstation: MDI-Resizing", "Workstation: Splitter-Panels"]
requires: ["Workstation: start.html", "MDIWindowManager"]
standalone_fallback: "Fixed-dimension MDI windows with maximize/restore buttons."
---
# SYS-START-18: Resizable MDI Windows & Flexible Workspace Dock Splitters
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: shipped*  
*Date: 2026-11-01*

## 1. Overview & Objective
Currently, Creator Studio's MDI windows (Module Explorer, Entity Manager, Ticket Command Center, Social Relational Graph) have fixed initial dimensions and can only be toggled between standard size and fullscreen maximize (`restoreOrMaximize`). 

Additionally, the right dock panel (`#properties-dock`) has a hardcoded CSS width (`310px`), preventing authors on widescreen displays from expanding the properties inspector to see wide tabular datasets or collapsing it to maximize CAD canvas working area.

This ticket delivers complete desktop window elasticity:
1. **8-Way MDI Window Drag Resizing**: Standard desktop edge and corner handles (`n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`).
2. **Draggable Vertical Splitter**: Resizable dock bar between the CAD canvas workspace and `#properties-dock`.
3. **Internal Sub-Panel Splitters**: Resizable panes within explorers (e.g., ticket table width vs ticket inspector width).

---

## 2. Implementation Deliverables

### 2.1 MDI Resize Controller (`src/workstation/scripts/mdi_window_manager.js`)
Extend `MDIWindowManager` with pointer-drag listeners:
- Inject invisible border drag regions around each non-maximized MDI window.
- Constrain resize operations to window minimums (`min-width: 400px; min-height: 250px`).
- Persist window dimensions in `localStorage` under `cs_mdi_geometry_<windowId>`.

### 2.2 Workspace Splitter Bar (`src/workstation/template.html` & `win95_workstation.css`)
- Insert a `<div id="dock-splitter" class="workspace-splitter-vertical"></div>` between `.workspace-layout` canvas and `#properties-dock`.
- Support horizontal mouse drag adjusting `#properties-dock` width between `240px` and `600px`.

---

## 3. Acceptance Criteria
- [x] Users can drag the edges and corners of all MDI windows to resize them smoothly without cursor detachment.
- [x] Dragging the workspace splitter bar smoothly adjusts the right dock width and re-centers the CAD canvas.
- [x] Resized dimensions persist across page reloads in `localStorage`.
