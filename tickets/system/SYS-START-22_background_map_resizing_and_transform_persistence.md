---
id: SYS-START-22
title: "Background Map Scaling, Resizing & Transform Persistence Engine"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
track: "Platform Development"
priority: "Medium"
wave: "Workstation Architecture: Multi-Scale Cartography & Vector Precision"
grounded_prerequisites: [
  "docs/adr/0004-desktop-workstation-start-html.md",
  "src/workstation/scripts/map_store.js",
  "src/workstation/scripts/canvas_hud.js",
  "src/workstation/scripts/cad_canvas_renderer.js",
  "src/workstation/modals/lifecycle_modals.html"
]
grounded_yields: [
  "Interactive Width, Height, Scale Factor, and Offset (X, Y) Controls",
  "Preserve Aspect Ratio Toggle & Natural Size Restoration",
  "Deterministic Persistence in mapMetadata, IndexedDB, and Campaign Packages",
  "Live Canvas Preview During Dimension Adjustment"
]
provides: ["Workstation: Background-Map-Scaling", "Cartography: Raster-Transform-Engine"]
requires: ["Workstation: start.html", "applyMapImageToCanvas", "mapMetadata"]
standalone_fallback: "Fixed raster image dimension fallback (1920x1080) at canvas origin."
alias_id: "DEV-03"
---
# SYS-START-22: Background Map Scaling, Resizing & Transform Persistence Engine (DEV-03)
*Category: system_architecture | Priority: Medium | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready | Author: Development Backlog*  
*Date: 2026-11-01*

## 1. Overview & Objective
Creator Studio allows authors to load custom raster background assets (regional maps, dungeon floorplans, battlemap sketches) under their pointcrawl network. However, currently the background image dimensions are fixed to the file's natural resolution (or hardcoded defaults of 1920x1080) without user-adjustable width, height, scale, or coordinate offsets.

Authors cannot resize the background image to align with a custom grid or pointcrawl node spacing. Even more critically, when switching between maps, reloading the page, or exporting the campaign package, any dynamic canvas transformations are lost, reverting the image to default unscaled dimensions.

### Acceptance Criteria / Acceptance Test:
Feature will be accepted when:
1. Authors can explicitly inspect and modify the background image's **Width**, **Height**, **Scale Percentage (25% to 500%)**, and **Origin Offsets (X, Y)** within the Map & Layout Properties dialog (`modal-map-properties`).
2. A **Lock Aspect Ratio** checkbox preserves proportional scaling when modifying width or height.
3. Quick action buttons are provided:
   - **Reset to 100% (Natural Dimensions)**: Restores original image pixel dimensions.
   - **Fit to Pointcrawl Nodes**: Automatically computes bounding box of all nodes on the active map and scales the background to comfortably frame the network.
4. Dimensions and transforms persist deterministically across:
   - Map transitions (`switchActiveMap`)
   - Browser reloads and IndexedDB storage (`CreatorStudioMapDB`)
   - Campaign package exports (`exportPackage`, `topology.json`, `campaign.json`)
5. Interactive live preview: Changing slider or number inputs reflects immediately on `#canvas-bg-image` without requiring modal dismissal.

---

## 2. Implementation Deliverables & Architectural Seams

### 2.1 Map Properties Modal Dialog Expansion (`src/workstation/modals/lifecycle_modals.html`)
In `modal-map-properties`, expand the **Map Background Image Section** with granular transform controls:
```html
<div class="bevel-inset" style="padding:8px; background:#f4f4f4; display:flex; flex-direction:column; gap:6px;">
  <strong style="font-size:11px; color:#000080;">Custom Map Background Asset &amp; Dimensions:</strong>
  <div id="map-prop-image-status" style="font-size:10px; color:#333;">...</div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
    <label style="display:flex; align-items:center; gap:4px; font-size:10px;">
      <strong>Width (px):</strong>
      <input type="number" id="map-prop-bg-width" class="win-select-input" min="100" max="20000" style="width:70px;">
    </label>
    <label style="display:flex; align-items:center; gap:4px; font-size:10px;">
      <strong>Height (px):</strong>
      <input type="number" id="map-prop-bg-height" class="win-select-input" min="100" max="20000" style="width:70px;">
    </label>
    <label style="display:flex; align-items:center; gap:4px; font-size:10px;">
      <strong>Scale (%):</strong>
      <input type="range" id="map-prop-bg-scale" min="25" max="400" value="100" style="width:70px;">
      <span id="map-prop-bg-scale-val" style="font-family:monospace; font-size:10px; width:35px;">100%</span>
    </label>
    <label style="display:flex; align-items:center; gap:4px; font-size:10px;">
      <input type="checkbox" id="map-prop-bg-lock-aspect" checked>
      <span>Lock Aspect Ratio</span>
    </label>
    <label style="display:flex; align-items:center; gap:4px; font-size:10px;">
      <strong>Offset X:</strong>
      <input type="number" id="map-prop-bg-x" class="win-select-input" style="width:60px;" value="0">
    </label>
    <label style="display:flex; align-items:center; gap:4px; font-size:10px;">
      <strong>Offset Y:</strong>
      <input type="number" id="map-prop-bg-y" class="win-select-input" style="width:60px;" value="0">
    </label>
  </div>
  <div style="display:flex; gap:4px; align-items:center; margin-top:4px;">
    <button class="win-btn" type="button" onclick="resetMapBackgroundNaturalSize()" style="font-size:10px;">Reset 100%</button>
    <button class="win-btn" type="button" onclick="fitMapBackgroundToNodes()" style="font-size:10px;">Fit to Nodes</button>
  </div>
</div>
```

### 2.2 SVG Image Transform Engine (`src/workstation/scripts/map_store.js`)
Upgrade `applyMapImageToCanvas(dataUrl, width, height, opacity, autoFit, transform)`:
- Support optional `transform: { width, height, x, y, scale, naturalWidth, naturalHeight }`.
- Set SVG attributes on `#canvas-bg-image`:
  - `x`: `transform.x || 0`
  - `y`: `transform.y || 0`
  - `width`: `transform.width || width || 1920`
  - `height`: `transform.height || height || 1080`
  - `opacity`: `opacity`
- Attach `naturalWidth` and `naturalHeight` to `mapMetadata` upon image loading so scaling is always relative to native resolution.

### 2.3 IndexedDB & Schema Persistence (`src/workstation/scripts/map_store.js` & `workstation_state.js`)
- Ensure `saveMapImageToDB()` and `saveActiveCampaign()` include all transform fields:
  ```javascript
  mapMetadata: {
    name: 'bg_image',
    assetPath: 'assets/map_bg.png',
    dataUrl: '...',
    width: 2400,
    height: 1600,
    naturalWidth: 2400,
    naturalHeight: 1600,
    x: 0,
    y: 0,
    scale: 1.0,
    opacity: 0.85
  }
  ```
- In `switchActiveMap()`, retrieve the persisted transforms from `target.mapMetadata` or IndexedDB and apply them cleanly to `#canvas-bg-image`.

---

## 3. Acceptance Checklist
- [ ] Map Properties dialog allows direct editing of Width, Height, Scale, and X/Y Offsets.
- [ ] Lock Aspect Ratio correctly keeps width/height proportional during adjustments.
- [ ] "Reset 100%" and "Fit to Nodes" buttons correctly calculate dimensions.
- [ ] Custom image dimensions persist after switching to another map and returning.
- [ ] Custom image dimensions persist after saving to disk and re-opening the campaign.
- [ ] Suite compilation and tests pass with zero regression.
