---
id: SYS-START-16
title: "Scoped CAD & Property Inspector Undo/Redo Engine (Memory Leak & Circular Reference Mitigation)"
pipeline_tier: 0
target_surface: "start.html"
status: ready
category: "system_architecture"
wave: "Workstation Architecture: CAD Core & State Integrity"
grounded_prerequisites: ["docs/adr/0013-cad-drawing-shapes-layers-and-multi-entity-selection.md", "src/workstation/scripts/workstation_state.js", "src/workstation/scripts/mdi_window_manager.js"]
grounded_yields: ["Scoped Delta Ring Buffer", "Command Reversibility", "Zero-CORS State Restitution", "Storage Leak Mitigation"]
provides: ["Workstation: Scoped-Undo-Redo", "CAD: Bounded-Delta-History"]
requires: ["Workstation: start.html", "State: activeTopology"]
standalone_fallback: "Manual editing without Undo/Redo recovery."
---
# SYS-START-16: Scoped CAD & Property Inspector Undo/Redo Engine (Memory Leak & Circular Reference Mitigation)
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-11-01*

## 1. Overview & Objective
In previous implementations, `undoAction()` and `redoAction()` attempted to capture full-state snapshots (`JSON.stringify(Workstation.activeTopology)`) on every pointer interaction. This triggered critical failures:
1. **Unbounded Storage & Memory Leaks**: Full topology clones rapidly consumed tens of megabytes of memory and bloated browser IndexedDB/localStorage.
2. **Circular Reference Exceptions**: DOM nodes and circular references within complex entity graphs broke `JSON.stringify()`.
3. **Unscoped Fallout**: Reverting a node move inadvertently rolled back unrelated changes in worldbuilding modules or ticket metadata.

Pending this formal re-architecture, the `Undo` and `Redo` buttons have been pruned from the primary workstation toolbar and disabled in the Edit menu. This ticket establishes the correct bounded command-delta scope for restoration.

---

## 2. Architectural Boundaries & Scope

### 2.1 Explicit Seam Boundaries
Undo/Redo is strictly restricted to two domains:
1. **CAD Canvas Geometry**:
   - Node translations (x, y updates).
   - Drawing vector creation/deletion/translation (rectangles, circles, lines).
   - Corridor connection additions and removals.
2. **Property Inspector Edges & Nodes**:
   - In-cell property grid field edits for the actively selected node or corridor.

**Excluded from Scope**:
- Roster entity creation/deletion (NPCs, Quests, Items) - managed via Entity Explorer with explicit CRUD confirmation.
- Campaign package loads, preset switching, and ticket status changes.

### 2.2 Delta-Command Architecture (No Full-State Cloning)
Instead of deep-cloning `activeTopology`, the history manager must use inverted command deltas:
```javascript
Workstation.history = {
  undoStack: [],
  redoStack: [],
  maxDepth: 25,
  push(cmd) {
    // cmd: { op: 'move_node', id: '1', from: {x: 100, y: 150}, to: {x: 200, y: 250} }
  }
};
```

---

## 3. Acceptance Criteria & Test Plan
- [ ] Undo/Redo operates on command deltas with a maximum buffer depth of 25 items.
- [ ] Memory footprint remains constant across hundreds of drag interactions.
- [ ] No circular reference errors during complex multi-entity selection.
- [ ] Toolbar controls re-enabled only after headless command-replay unit tests pass.
