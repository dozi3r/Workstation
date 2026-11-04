# Red-Team & Gate-Check Plan: Canvas Linked Entities (Multi-Link Spatial Pins) & CAD Authoring UX

> [!IMPORTANT]
> **Instructions for Red-Team & Gate-Check Agents**
> You are auditing the **Canvas Linked Entities & CAD Authoring UX** feature set in `c:\Users\Milo\Documents\Antigravity\Workstation 2.5`.
> Your role is adversarial verification: stress-test every data contract, DOM binding, multi-map persistence boundary, and scope constraint listed below before signing off on the build.

---

## 1. Scope Boundaries & Hard Prohibitions (Out-of-Scope Guards)

Before inspecting feature logic, verify that the implementation **strictly obeys** the following negative constraints established by the user:

| Prohibition ID | Out-of-Scope Area | Mandatory Rule / Gate Check |
| :--- | :--- | :--- |
| **PROHIBIT-01** | **Undo/Redo Engine** | Do **not** expand `pushHistoryState()` or `restoreSnapshot()` across canvas drag/move/pin operations. Asynchronous IndexedDB map background hydration and `state_adapter.js` reference syncing cause destructive state races with snapshot restoration. |
| **PROHIBIT-02** | **Mouse Back/Forward (Buttons 3 & 4)** | Do **not** bind mouse buttons 3/4 (`auxclick` / `mouseup` button 3/4) or browser `popstate` history to `switchActiveMap()`. |
| **PROHIBIT-03** | **Category 3: Tabletop / Live Session Play Mode** | Completely deprioritized. Do **not** add Party Tokens (`We Are Here` markers), Second-Screen Player Viewport windows, Session Logs, or tabletop "Player Preview" toggles. All visibility toggles on Spatial Pins and Shapes must be pure **CAD Authoring Visibility** (`Visible on Canvas`). |
| **PROHIBIT-04** | **Direct Edits to Compiled Monoliths** | Never edit `start.html`, `network/platform_audit_dashboard.html`, or `wiki/wiki_graph.json` directly. All changes must live in modular sources under `src/workstation/` and compile cleanly via `Build-Suite.ps1`. |

---

## 2. Architecture & Component Contracts Under Review

### 2.1 Feature 1: Multi-Link Canvas Pin / POI Container (`spatialPin`)
- **Files Modified**:
  - `src/workstation/scripts/cad_interaction.js`
  - `src/workstation/scripts/cad_canvas_renderer.js`
  - `src/workstation/modals/entity_modals.html`
  - `src/workstation/scripts/property_grid_inspector.js`
  - `src/workstation/scripts/entity_manager_ui.js`
  - `src/workstation/scripts/map_navigator.js`
  - `src/workstation/scripts/canvas_hud.js`
  - `src/workstation/scripts/entity_cascade_delete.js`
- **Data Contract**:
  ```json
  {
    "id": "pin_...",
    "x": 400,
    "y": 300,
    "label": "Harbor Checkpoint",
    "icon": "",
    "visible": true,
    "locked": false,
    "notes": "Optional [[Wiki]] markdown notes",
    "targetType": "npc",
    "targetId": "npc_harbormaster",
    "links": [
      { "type": "npc", "id": "npc_harbormaster" },
      { "type": "item", "id": "itm_ledger" },
      { "type": "submap", "id": "map_warehouse" },
      { "type": "tracker", "id": "trk_patrol" }
    ]
  }
  ```
- **Invariants**:
  1. `normalizeSpatialPin(pin)` guarantees `pin.links` is always a valid array and mirrors `pin.links[0]` to `pin.targetType` and `pin.targetId` so legacy single-target code and existing unit tests never break.
  2. Clicking the canvas with the `Pin [P]` tool creates the pin at `(snapCoord(x), snapCoord(y))` and immediately opens `#modal-spatial-pin-picker` (`openSpatialPinModal(px, py, createdPin.id)`).
  3. Dragging any row from the Entity Manager (`npc`, `item`, `quest`, `tracker`, `faction`, `ticket`) or any map card from the Map Navigator (`submap`) onto the canvas creates a new `spatialPin` (or appends to an existing `spatialPin` if dropped within `24px` of its center).
  4. `spatialPin` participates in `P` tool hotkey, `Delete`/`Backspace` deletion (`deleteSelected()`), marquee box selection, Shift+Click multi-select, and `startGroupDrag()`.

### 2.2 Feature 2: Interactive Resize Grips on Drawn Shapes
- **Files Modified**:
  - `src/workstation/scripts/cad_canvas_renderer.js`
  - `src/workstation/scripts/cad_interaction.js`
  - `src/workstation/styles/win95_workstation.css`
- **Invariants**:
  1. Selected `rect` renders exactly **4** corner `.cad-grip-handle` elements (`nw`, `ne`, `sw`, `se`); `circle` renders 4 cardinal handles (`n`, `s`, `e`, `w`) resizing `rx`/`ry`/`radius`; `line` renders 2 endpoint handles (`start`, `end`) moving `(x, y)` or `(x2, y2)`.
  2. Dragging a grip invokes `onShapeGripMouseDown(ev, shape, handleKey)`, snaps coordinates via `snapCoord()` when enabled, enforces minimum dimensions (`width >= 10`, `height >= 10`, `rx >= 6`, `ry >= 6`), and persists on `mouseup`.

### 2.3 Feature 3: Right-Click Canvas Context Menu (`#cad-context-menu`)
- **Files Modified**:
  - `src/workstation/template.html`
  - `src/workstation/scripts/cad_interaction.js`
  - `src/workstation/scripts/cad_canvas_renderer.js`
- **Invariants**:
  1. Right-clicking a `node`, `spatialPin`, `edge`, `shape`, or empty `canvas` opens `#cad-context-menu` clamped within viewport bounds (`window.innerWidth - 245`, `window.innerHeight - 260`).
  2. Clicking anywhere or pressing `Escape` closes the menu.

### 2.4 Feature 4: Global Search / "Jump to Anything" Palette (`Ctrl+F` / `Ctrl+P`)
- **Files Modified**:
  - `src/workstation/modals/entity_modals.html`
  - `src/workstation/scripts/cad_interaction.js`
  - `src/workstation/scripts/mdi_window_manager.js`
- **Invariants**:
  1. `Ctrl+F` and `Ctrl+P` open `#modal-global-search`, focus `#gs-search-input`, and support `ArrowUp`, `ArrowDown`, `Enter`, and `Escape`.
  2. Selecting a result on another map invokes `switchActiveMap(targetMapId)`, selects the target Node or Spatial Pin, centers the viewport via `panToCanvasPoint()`, and emits a 1.35s SVG highlight ring (`pingCanvasCoordinate()`).

### 2.5 Feature 5: Rich Hover Preview Cards (`#cad-hover-preview-card`)
- **Files Modified**:
  - `src/workstation/template.html`
  - `src/workstation/scripts/cad_interaction.js`
- **Invariants**:
  1. 180ms debounced hover card displays summary telemetry for `node`, `spatialPin`, and `edge`.
  2. Automatically suppressed during drag/pan/wheel/contextmenu operations (`pointer-events: none` so it never intercepts mouse events).

### 2.6 Feature 6: Zoom-to-Fit (`[F]`) & 20px Snap-to-Grid
- **Files Modified**:
  - `src/workstation/scripts/cad_interaction.js`
  - `src/workstation/template.html`
- **Invariants**:
  1. Pressing `F` (when not typing in an input) frames the current selection bounding box, or all visible canvas entities if nothing is selected.
  2. Toggling Snap-to-Grid snaps dragged/placed coordinates to `20px` increments; holding `Alt` bypasses snapping.

---

## 3. Adversarial Red-Team Attack Matrix (10 Vectors to Probe)

Red-Team agents must actively test and attempt to break the following 10 vectors:

| Vector ID | Attack Surface | How to Red-Team / Attempt to Break | Expected Defensive Behavior |
| :--- | :--- | :--- | :--- |
| **RT-01** | **Modal DOM ID & `.hidden` Class Contract** | Call `openSpatialPinModal(300, 200)` and `openGlobalSearchModal()` in a headless or browser DOM and inspect `#spp-*` and `#gs-*` elements. | All inputs (`#spp-pin-id`, `#spp-label`, `#spp-entities-checklist`, `#gs-search-input`, `#gs-results-container`) populate without null-reference errors, and modals open/close via `openModal()` / `closeModal()` (`.hidden` class). |
| **RT-02** | **Legacy Single-Link Pin Migration** | Load a legacy topology containing `spatialPins: [{ id: "p1", x: 100, y: 100, targetType: "quest", targetId: "q1" }]` (no `links` array). | `normalizeSpatialPin()` populates `links: [{ type: "quest", id: "q1" }]`. Adding a second link preserves `links[0]` as `targetType`/`targetId`. |
| **RT-03** | **Cross-Map Switch Persistence** | Place a multi-link `spatialPin` with 3 links on `map_root`, call `switchActiveMap('map_child')`, then switch back to `map_root`. | `state_adapter.js` preserves the full `spatialPins` array including `pin.links`, `pin.notes`, `pin.icon`, `pin.visible`, and `pin.locked` with zero data loss or cross-map bleed. |
| **RT-04** | **Cascade Delete Orphaned Pin Links** | Link `npc_1` and `itm_1` to a `spatialPin`, then delete `npc_1` via `executeEntityDeletion()` in `entity_cascade_delete.js`. | Step `4f` in `executeEntityDeletion()` removes `npc_1` from `pin.links` across `topo.spatialPins` and all `maps[*].spatialPins`, promoting `itm_1` to primary `targetType`/`targetId`. |
| **RT-05** | **Recoverability of Hidden Pins (`pin.visible = false`)** | Right-click a `spatialPin` on the canvas and click **"Hide Pin on Canvas"** (`pin.visible = false`). Now try to select it again to unhide it. | Even though the pin is hidden on the SVG canvas, it remains selectable in `#prop-object-selector` (`── Canvas Spatial Pins ──`) and via Global Search (`Ctrl+F`), where `Visible on Canvas` can be re-checked. |
| **RT-06** | **Shape Resize Grip Inversion & Lock Bypass** | Select a `rect` shape, lock its position (`shape.locked = true`), and attempt to drag its `nw` grip; then unlock and drag `nw` past `se` (negative width/height). | Locked shapes reject grip resize (`if (shape.locked || isLayerLocked) return`). Dragging `nw` past `se` clamps `width >= 10` and `height >= 10` without NaN or negative SVG `<rect>` attributes. |
| **RT-07** | **Drag-and-Drop MIME Collision** | Drag an NPC row from Entity Manager onto `#canvas-container`, then drag a `.png` background map file onto `#canvas-container`. | `onCanvasDrop()` routes `application/x-cs-entity` payloads to `handleCanvasEntityDrop(e)` and only invokes `handleMapFileIngestion()` for actual OS file drops. |
| **RT-08** | **Quick-Create Sub-Map Registration** | Inside `#modal-spatial-pin-picker`, click **"+ 🌀 Sub-Map"** (`quickCreateForSpatialPin('submap')`). | Creates a valid map object in `maps[newId]` with `parentMapId: activeMapId`, checks it in the pin's `links`, and enables double-click portal navigation from the pin. |
| **RT-09** | **Special Characters in Entity Names / IDs** | Create an NPC named `O'Malley "The Blade" <Boss>` and right-click its pin or search for it in `Ctrl+F`. | `escapeHtml()` and escaped single quotes prevent HTML breakage or inline `onclick` syntax errors in `#cad-context-menu`, `#cad-hover-preview-card`, and `#modal-global-search`. |
| **RT-10** | **Tracker Tick Bounds via Context Menu & Pin Click** | Link a 4-segment clock (`maxTicks: 4`, `currentTicks: 3`) to a `spatialPin` and trigger **"Advance Linked Clock (+1 Tick)"** twice. | Inspect both `currentTicks`/`maxTicks` and `value`/`max` properties so clocks advance cleanly and wrap or clamp consistently across schema variants. |

---

## 4. Pre-Merge Gate-Check Protocol (Automated + Audit Rubric)

The Gate-Check agent must execute the following commands from `c:\Users\Milo\Documents\Antigravity\Workstation 2.5` and require **100% pass** on every gate:

### Step 1: Compile & Verify Zero Stale Wiki Drift
```powershell
powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1 --stamp-reviewed
powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Stale
```
- **Gate Criterion 1**: `Build-Suite.ps1` exits with code `0` and compiles `start.html` without warnings.
- **Gate Criterion 2**: `Find-CodebaseNode.ps1 -Stale` reports `0 file(s)` stale across all tracked files.

### Step 2: Execute Master Automated Test Suite
```powershell
powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1
```
- **Gate Criterion 3**: All 37 JS unit test suites in `test/run_tests.js` pass (`1054/1054` assertions, `0` failures), including:
  - `Suite 6: Vector Drawing Shapes Engine` (verifying 4 corner CAD grip handles on selected `rect`)
  - `Suite 35: Relational Trackers, Ticket Workflows & Spatial Pins`
  - `Suite 37: Multi-Link Spatial Pins, Shape Resize Grips, Context Menu, Hover Cards & Global Search`
- **Gate Criterion 4**: All 5 Campaign Packages pass `campaigns/Test-CampaignPackage.ps1`.
- **Gate Criterion 5**: Both Zero-Install Loopback Servers (`server.js` and `server.ps1`) pass HTTP 200, MIME, and CORS verification.

### Step 3: Scope & Diff Audit
```powershell
git diff --stat
```
- **Gate Criterion 6**: Confirm zero modifications to Undo/Redo snapshot triggers, zero mouse button 3/4 navigation listeners, and zero Category 3 tabletop/player-viewport features.
