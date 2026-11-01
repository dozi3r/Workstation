---
id: SYS-START-10
title: "Bounded CAD History Engine (Undo/Redo Command & Snapshot Architecture)"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: CAD Core & Data Integrity"
grounded_prerequisites: ["docs/adr/0013-cad-drawing-shapes-layers-and-multi-entity-selection.md", "src/workstation/scripts/workstation_state.js", "src/workstation/scripts/mdi_window_manager.js"]
grounded_yields: ["Bounded History Ring Buffer", "Undo/Redo Actions", "State Restitution Engine", "CAD Operation Snapshots"]
provides: ["Workstation: Undo-Redo-History", "CAD: Bounded-State-Stack"]
requires: ["Workstation: start.html", "State: activeTopology"]
standalone_fallback: "Manual editing without Undo/Redo recovery."
---
# SYS-START-10: Bounded CAD History Engine (Undo/Redo Command & Snapshot Architecture)
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-10-30*

## 1. Overview & Objective
Creator Studio operates as an AutoCAD/Paint-style CAD canvas supporting node placement, vector drawing shapes (rectangles, circles, lines), layers, multi-entity marquee selection, and batch property editing. However, currently `undoAction()` and `redoAction()` in `mdi_window_manager.js` (lines 483-484) are no-op console stubs that print `"Undo performed."` while `undoStack: []` and `redoStack: []` in `workstation_state.js` remain completely unpopulated.

This ticket implements a robust, bounded (max 30 states) in-memory snapshot and command history stack for `start.html`. When an author creates, deletes, moves, or edits nodes, corridors, drawing shapes, or slotted modules, a deep-cloned topology snapshot is recorded. Pressing `Ctrl+Z` (Undo) or `Ctrl+Y` / `Ctrl+Shift+Z` (Redo) cleanly rolls back or advances the canvas and properties grid without corrupting campaign state or breaking zero-CORS compliance.

---

## 2. Implementation Deliverables

### 2.1 State Model (`src/workstation/scripts/workstation_state.js`)
Extend the global history state controller on `Workstation`:
```javascript
Workstation.history = {
  undoStack: [],
  redoStack: [],
  maxDepth: 30,
  isPerforming: false,
  push(description) {
    if (this.isPerforming) return;
    const snapshot = {
      description: description || 'State Change',
      timestamp: Date.now(),
      topology: JSON.parse(JSON.stringify(Workstation.activeTopology || {})),
      entities: {
        npcs: JSON.parse(JSON.stringify(Workstation.activeTopology?.npcs || [])),
        quests: JSON.parse(JSON.stringify(Workstation.activeTopology?.quests || [])),
        items: JSON.parse(JSON.stringify(Workstation.activeTopology?.items || [])),
        trackers: JSON.parse(JSON.stringify(Workstation.activeTopology?.trackers || [])),
        tickets: JSON.parse(JSON.stringify(Workstation.activeTopology?.tickets || []))
      }
    };
    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxDepth) this.undoStack.shift();
    this.redoStack = []; // Clear redo stack on new action
  }
};
```

### 2.2 Undo & Redo Actions (`src/workstation/scripts/mdi_window_manager.js`)
Replace the stub functions with real restoration logic:
```javascript
function undoAction() {
  if (!Workstation.history || Workstation.history.undoStack.length === 0) {
    setStatusBarMessage("Nothing to undo.");
    return;
  }
  Workstation.history.isPerforming = true;
  try {
    // Current state pushed to redo
    const currentState = {
      description: "Pre-Undo State",
      timestamp: Date.now(),
      topology: JSON.parse(JSON.stringify(Workstation.activeTopology || {})),
      entities: {
        npcs: JSON.parse(JSON.stringify(Workstation.activeTopology?.npcs || [])),
        quests: JSON.parse(JSON.stringify(Workstation.activeTopology?.quests || [])),
        items: JSON.parse(JSON.stringify(Workstation.activeTopology?.items || [])),
        trackers: JSON.parse(JSON.stringify(Workstation.activeTopology?.trackers || [])),
        tickets: JSON.parse(JSON.stringify(Workstation.activeTopology?.tickets || []))
      }
    };
    Workstation.history.redoStack.push(currentState);

    const prev = Workstation.history.undoStack.pop();
    Workstation.activeTopology = prev.topology;
    if (prev.entities) {
      Workstation.activeTopology.npcs = prev.entities.npcs;
      Workstation.activeTopology.quests = prev.entities.quests;
      Workstation.activeTopology.items = prev.entities.items;
      Workstation.activeTopology.trackers = prev.entities.trackers;
      Workstation.activeTopology.tickets = prev.entities.tickets;
    }

    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    setStatusBarMessage(`Undo: ${prev.description}`);
  } finally {
    Workstation.history.isPerforming = false;
  }
}

function redoAction() {
  if (!Workstation.history || Workstation.history.redoStack.length === 0) {
    setStatusBarMessage("Nothing to redo.");
    return;
  }
  Workstation.history.isPerforming = true;
  try {
    const currentState = {
      description: "Pre-Redo State",
      timestamp: Date.now(),
      topology: JSON.parse(JSON.stringify(Workstation.activeTopology || {})),
      entities: {
        npcs: JSON.parse(JSON.stringify(Workstation.activeTopology?.npcs || [])),
        quests: JSON.parse(JSON.stringify(Workstation.activeTopology?.quests || [])),
        items: JSON.parse(JSON.stringify(Workstation.activeTopology?.items || [])),
        trackers: JSON.parse(JSON.stringify(Workstation.activeTopology?.trackers || [])),
        tickets: JSON.parse(JSON.stringify(Workstation.activeTopology?.tickets || []))
      }
    };
    Workstation.history.undoStack.push(currentState);

    const next = Workstation.history.redoStack.pop();
    Workstation.activeTopology = next.topology;
    if (next.entities) {
      Workstation.activeTopology.npcs = next.entities.npcs;
      Workstation.activeTopology.quests = next.entities.quests;
      Workstation.activeTopology.items = next.entities.items;
      Workstation.activeTopology.trackers = next.entities.trackers;
      Workstation.activeTopology.tickets = next.entities.tickets;
    }

    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    setStatusBarMessage(`Redo: ${next.description}`);
  } finally {
    Workstation.history.isPerforming = false;
  }
}
```

### 2.3 Snapshot Trigger Points
Attach `Workstation.history.push(actionName)` before/after mutations in:
1. **`cad_interaction.js`**:
   - `onCanvasMouseDown`: Record snapshot on start of entity drag if entity moves more than 5px.
   - Shape creation commit in `onCanvasMouseUp`: `Workstation.history.push("Create Shape")`.
   - Node creation commit in `handleCanvasClick`: `Workstation.history.push("Create Node")`.
   - Edge creation commit: `Workstation.history.push("Connect Edge")`.
2. **`mdi_window_manager.js`**:
   - `deleteSelected()`: `Workstation.history.push("Delete Selected Entities")`.
3. **`property_grid_inspector.js`**:
   - Property value commit: `Workstation.history.push("Edit Property: " + propName)`.
4. **`stage_5_slotting.js`**:
   - Module slotting and unslotting: `Workstation.history.push("Slot Module: " + modId)`.

---

## 3. Verification & Testing Criteria
1. **Unit Test Coverage (`test/run_tests.js`)**:
   - Create a test node, push history state, mutate position, execute `undoAction()`, verify original coordinates restored.
   - Execute `redoAction()`, verify updated coordinates reapplied.
   - Ensure `undoStack` does not exceed 30 items.
2. **Zero-CORS & Parity**:
   - Verify that JSON serialization strips circular references and handles submaps cleanly.
   - Run `Test-Suite.ps1` to ensure zero regressions across all 13 existing suites.
