---
id: SYS-START-14
title: "Assimilation of 64-Cell ODV Matrix into Native MDI Window & In-App Fog Fix"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: MDI Consolidation & Platform Hygiene"
grounded_prerequisites: ["docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md", "docs/adr/0014-campaign-state-reflection-and-edge-odv-on-64-matrix.md", "src/workstation/template.html", "src/workstation/scripts/mdi_window_manager.js"]
grounded_yields: ["Native MDI 64-Cell ODV Matrix Window", "Fog of War Reveal/Shroud In-App Fix"]
provides: ["Workstation: MDI-ODV-Matrix", "Workstation: In-App-Fog-Controls"]
requires: ["Workstation: start.html", "MDIWindowManager: Core"]
standalone_fallback: "External tab launching via window.open."
---
# SYS-START-14: Assimilation of 64-Cell ODV Matrix into Native MDI Window & In-App Fog Fix
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-10-30*

## 1. Overview & Objective
While Workstation 2.0 consolidated `index.html` and `campaign_studio.html` into `start.html`, the newly upgraded **64-Cell ODV Matrix & Hermeneutics Explorer** ([ADR-0014](file:///c:/Users/Milo/Documents/Antigravity/Workstation%20Application/docs/adr/0014-campaign-state-reflection-and-edge-odv-on-64-matrix.md)) still lives outside the CAD workstation as a standalone web page (`network/odv_archetype_matrix.html`) opened via `window.open` in a new browser tab. GMs must constantly toggle between tabs to correlate node/edge sociological profiles with CAD topology.

Concurrently, in `stage_5_slotting.js` (lines 630 & 639), `revealNode(nid)` and `shroudNode(nid)` are referenced in `onclick` handlers but are completely undefined, crashing with a `ReferenceError` whenever a GM tries to reveal or shroud a node from the Module Explorer sidebar.

This ticket embeds the 64-Cell ODV Matrix directly into `start.html` as a native draggable Win95 MDI window (`#modal-odv-matrix`, `Ctrl+Shift+O`) and implements the missing `revealNode` and `shroudNode` functions.

---

## 2. Implementation Deliverables

### 2.1 Native MDI ODV Matrix Window (`#modal-odv-matrix`, `Ctrl+Shift+O`)
1. Create `#modal-odv-matrix` inside `src/workstation/modals/mdi_dashboards.html` conforming to Win95 3D beveled window aesthetics.
2. In `src/workstation/scripts/mdi_window_manager.js`:
   - Register `modal-odv-matrix` with `MDIWindowManager`.
   - Add hotkey `Ctrl+Shift+O` and menu item under `View` and `Tools`.
3. In `src/workstation/scripts/sociology_data.js`:
   - Expose `renderMdiOdvMatrix()` using the dense 64-cell layout established in ADR-0014, dynamically reflecting `Workstation.activeTopology.nodes` and `edgeData` in real time.
   - Clicking any archetype cell filters the active campaign roster; clicking any mapped node name jumps directly to the CAD canvas (`selectNode(id)`).

### 2.2 In-App Fog of War Interactivity Fix (`src/workstation/scripts/stage_5_slotting.js`)
Implement global helper functions `revealNode` and `shroudNode`:
```javascript
function revealNode(nodeId) {
  const topo = Workstation.activeTopology;
  if (!topo || !topo.nodes) return;
  const n = topo.nodes[String(nodeId)] || (Array.isArray(topo.nodes) ? topo.nodes.find(x => x.id == nodeId) : null);
  if (n) {
    n.visible = true;
    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    setStatusBarMessage(`Node #${nodeId} revealed to players.`);
  }
}
window.revealNode = revealNode;

function shroudNode(nodeId) {
  const topo = Workstation.activeTopology;
  if (!topo || !topo.nodes) return;
  const n = topo.nodes[String(nodeId)] || (Array.isArray(topo.nodes) ? topo.nodes.find(x => x.id == nodeId) : null);
  if (n) {
    n.visible = false;
    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    setStatusBarMessage(`Node #${nodeId} shrouded in Fog of War.`);
  }
}
window.shroudNode = shroudNode;
```

---

## 3. Verification & Testing Criteria
1. **MDI Integration**:
   - Press `Ctrl+Shift+O` in `start.html`: assert `#modal-odv-matrix` opens, tiles, and minimizes cleanly.
   - Assert node and corridor occupancy counts match the active campaign topology.
2. **Fog of War**:
   - In Module Explorer, click "👁️ Reveal Node" on an unexplored node: assert `node.visible === true`, canvas re-renders, and no `ReferenceError` is thrown.
   - Click "Shroud in Fog": assert `node.visible === false`.

       if (typeof renderCanvas === 'function') renderCanvas();
       if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
       if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
       setStatusBarMessage(`Node #${nodeId} revealed to players.`);
     }
   }
   window.revealNode = revealNode;

   function shroudNode(nodeId) {
     const topo = Workstation.activeTopology;
     if (!topo || !topo.nodes) return;
     const n = topo.nodes[String(nodeId)] || (Array.isArray(topo.nodes) ? topo.nodes.find(x => x.id == nodeId) : null);
     if (n) {
       n.visible = false;
       if (typeof renderCanvas === 'function') renderCanvas();
       if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
       if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
       setStatusBarMessage(`Node #${nodeId} shrouded in Fog of War.`);
     }
   }
   window.shroudNode = shroudNode;
   ```
2. **Remove Dead Menu Rows (`src/workstation/template.html`)**:
   - Delete line 194: `<div class="dropdown-row" onclick="openStep1Studio()">Launch Step 1 Studio...</div>`.
   - Delete line 237: `<div class="dropdown-row" onclick="copyEngineSimulationCommand()">⚙️ Copy Engine Simulation Command</div>`.
3. **Synchronize Navigation Manifest & Modules Catalog**:
   - Update `docs/navigation_manifest.json` and `docs/MODULES_CATALOG.md` to reference `campaigns/Emerald Isle/modules/*.md`.

---

## 3. Verification & Testing Criteria
1. **Script Syntax & Test Suite (`Test-Suite.ps1`)**:
   - Assert all new modal HTML and scripts compile into `start.html` without syntax errors.
   - Assert clicking `revealNode` and `shroudNode` updates node visibility without throwing `ReferenceError`.
   - Assert no references to `openStep1Studio` or `copyEngineSimulationCommand` remain in compiled HTML.
2. **Zero-CORS Verification**:
   - Ensure embedded MDI dashboards operate 100% offline via `file:///` without external HTTP fetches.
