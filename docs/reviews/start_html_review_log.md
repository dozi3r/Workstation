# `start.html` Comprehensive Review & Execution Plan
**Authors:** Claude Opus 5.5 (Initial Pass) & Gemini 4 Argon (Deep Verification & Execution Blueprint)
**Executor:** Gemini Flash 3.8 High
**Date:** 2026-10-20

> **CRITICAL RULES FOR GEMINI FLASH 3.8 (READ BEFORE STARTING):**
> 1. **Never edit `start.html` directly.** It is compiled from `src/workstation/template.html`, `src/workstation/modals/*.html`, `src/workstation/scripts/*.js`, and `src/workstation/styles/*.css`.
> 2. **Never use PowerShell `Get-Content` / `Set-Content` to inspect or edit files.** Windows PowerShell 5.1 defaults to Windows-1252 and corrupts UTF-8 emojis. Always use the `read_file` / `edit_file` / `write_file` tools, or Node.js (`& "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe"` with `'utf8'`).
> 3. **After all code edits, compile the suite** via:
>    `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1`
> 4. **Update Wiki Custom Notes** if any tracked file's architectural contract changes, per `AGENTS.md` Rule 5.

---

## Part 1: Argon Verification of Opus Findings & New Discoveries

### Verified False Positives (DO NOT "FIX")
- **F-01 (`FALSE-POSITIVE` — Console Encoding Artifact):** Opus flagged ~290 lines of "mojibake" (`dY-`, `ðŸ`, `???`) by piping `Get-Content` and `Select-String` through PowerShell 5.1's OEM/1252 console pipe. Argon verified via Node.js `fs.readFileSync(..., 'utf8')` across every file in `src/workstation/` that **0 bytes of UTF-8 corruption or `\uFFFD` exist on disk**. Emojis (`🗺️`, `👑`, `⚠️`, `🔗`) are intact. **Action: Skip F-01 completely.**
- **F-05 (`FALSE-POSITIVE`):** `getNodeDisplayName`, `activeProjectDirectoryHandle`, and `JSON.parse(JSON.stringify(...))` clones are benign.

### Verified High/Medium Bugs (Including 4 New Argon Findings)

| ID | Sev | Status | Summary |
| :--- | :--- | :--- | :--- |
| **F-06** | **CRITICAL** | `FIXED` | **Base64 `dataUrl` leaks into `localStorage` (`creator_studio_maps_registry`), blowing the 5MB quota and silently dropping map/node edits.** Furthermore, **Argon found 3 companion bugs (F-06b/c/d):**<br>• **F-06b:** `switchActiveMap()` (`state_adapter.js:189-200`) loads `activeMapMetadata` from IndexedDB (`CreatorStudioMapDB`), and `initTopology()` (`workstation_core.js:191`) restores `activeMapMetadata`, **but neither calls `applyMapImageToCanvas()`**! Switching maps leaves the previous map's image stuck on the SVG canvas (`#canvas-bg-image`), and reloading the page never renders the persisted IndexedDB background image.<br>• **F-06c:** `clearLoadedMap()` (`map_store.js:246`) calls `deletePersistedMapFromDB()` with **no argument**, and `deletePersistedMapFromDB(mapId)` (`map_store.js:122`) starts with `if (!mapId) return;` — so clearing a map background **never deletes it from IndexedDB**.<br>• **F-06d:** `selective_importer.js:605-607` saves imported map images to IndexedDB, but never calls `applyMapImageToCanvas` for the active map and leaves `dataUrl` inside `maps[mId].mapMetadata`. |
| **F-07** | **HIGH** | `FIXED` | **`saveActiveCampaign()` (`workstation_core.js:345-351`) calls `async function writeCampaignToProjectDirectory()` without `await`.** It immediately sets `dirSynced = true` (reporting success even if permission fails) and can trigger overlapping concurrent File System Access API writes when `saveActiveCampaign()` is called rapidly across entity edits. |
| **F-02** | **HIGH** | `FIXED` | **Duplicate `updateBreadcrumbsHUD()` & Missing Top-Left HUD Container.**<br>• `map_navigator.js:9` (Tailwind classes, targets `#canvas-breadcrumbs-hud`) overwrites `canvas_hud.js:11` (Win95 classes, targets `#hud-breadcrumbs-lineage` and `#hud-btn-ascend`) because `map_navigator.js` is included later in `template.html`.<br>• Neither DOM element exists in `template.html` (`#hud-layer-focus` is HUD top-right, `#hud-map-legend` is HUD 3 bottom-left; HUD 1 top-left was accidentally omitted from `template.html` even though `.hud-top-left`, `.hud-lineage-trail`, and `.hud-map-step` are styled in `win95_workstation.css:503-557`). |
| **F-11** | **HIGH** | `FIXED` | **`selective_importer.js` Crashes & Drops String Node IDs.**<br>1. `selective_importer.js:177-179`: `JSON.parse(new TextDecoder().decode(zipFiles[...]))` is outside a `try/catch` inside an `async` handler — malformed JSON in a ZIP causes an unhandled rejection with no user feedback.<br>2. `selective_importer.js:93` and `:223`: `Object.keys(mainData.nodes).map(k => ({ id: parseInt(k), ...mainData.nodes[k] }))` — if a map uses prefixed string IDs (e.g. `"D1"`), `parseInt(k)` is `NaN`, or if `mainData.nodes[k]` didn't have `.id`, it becomes `NaN`. Should preserve `mainData.nodes[k].id ?? (isNaN(Number(k)) ? k : Number(k))`. |
| **F-12** | **HIGH** | `FIXED` | **`wiki_engine.js` Hovercard Crash on Standard Topology Nodes + XSS/Broken Attributes.**<br>1. `wiki_engine.js:420`: `showWikiHovercard()` accesses `(${n.coordinates.x}, ${n.coordinates.y})`. In `start.html`, nodes use `n.x` and `n.y` (only legacy Campaign Studio nodes had `n.coordinates`). Hovering a `[[Node:1]]` wiki pill throws `TypeError: Cannot read properties of undefined (reading 'x')` if `n.coordinates` is undefined!<br>2. `wiki_engine.js:369-370, 383-384`: Inline `onclick="navigateToWikiEntity('${type}', '${entityId}', ...)"` and `displayTitle` are unescaped. A node/NPC name with `'` or `<` breaks the pill or injects HTML. |
| **F-13** | **MEDIUM** | `FIXED` | **Unisolated Workstation Mod Bundle in `build_suite.js`.**<br>In `build_suite.js:758-765`, each mod's `mod.js` is concatenated directly into `startModsBlock` inside the single `<script>` tag of `start.html`. If one mod throws a runtime error during registration, subsequent mods fail to load. Wrapping each mod in an IIFE + `try/catch` isolates failures cleanly. |
| **F-03** | **MEDIUM** | `FIXED` | **Unescaped HTML interpolation (`innerHTML`) across UI surfaces.**<br>`ticket_center.js:8` already defines `function escapeHtml(str)` (which is global since all scripts share one `<script>` block, though defined late in bundle order). Moving `escapeHtml` and a new `escapeAttr(str)` helper to the top of `zip_engine.js` (first script in bundle) makes it available everywhere to sanitize user-editable names in `canvas_hud.js`, `map_navigator.js`, `mdi_window_manager.js`, `workstation_core.js`, and `wiki_engine.js`. |
| **F-08** | **MEDIUM** | `FIXED` | **Unthrottled `renderCanvas()` during mouse drag loops.**<br>`renderCanvas()` (`workstation_core.js:656`) rebuilds all SVG nodes/edges. Adding a `scheduleRenderCanvas()` helper using `requestAnimationFrame` coalescing and using it in high-frequency `mousemove` drag handlers (`workstation_core.js:1312` clock drag and node drag) eliminates frame drops without risky rewrites. |
| **F-09** | **LOW** | `FIXED` | **Duplicate event listener registration.**<br>• `stage_5_slotting.js:878-884` AND `stage_5_slotting.js:906-909` (`initResourceTagFilter`) both attach a `change` listener to `#mod-resource-select`.<br>• `canvas_hud.js:786-788` (`openSetMapScaleDialog`) calls `addEventListener` on `#scale-val-input`, `#scale-unit-select`, `#scale-px-input` every time the modal opens instead of assigning `.oninput` / `.onchange`. |
| **F-10** | **LOW** | `FIXED` | **NaN Node ID in `entity_manager.js:1457`.**<br>`Math.max(...Object.keys(topo.nodes || {}).map(k => parseInt(k)), 0) + 1` evaluates to `NaN` if any node on the active map has a non-numeric prefixed ID (like `"UG1"`). `workstation_core.js:1572` already filters `.filter(n => !isNaN(n))`. |

---

## Part 2: Step-by-Step Execution Plan for Gemini Flash 3.8 High

Execute these steps in exact sequence. Use `edit_file` for each change.

### Step 1: Add Global `escapeHtml`, `escapeAttr`, and `stripMapImageDataUrl` Helpers in `src/workstation/scripts/zip_engine.js`
`zip_engine.js` is the very first script included in `template.html`. At the top of `src/workstation/scripts/zip_engine.js` (before `window.ZeroCorsZip`), add:

```javascript
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.escapeHtml = escapeHtml;

function escapeAttr(str) {
  return escapeHtml(str);
}
window.escapeAttr = escapeAttr;

function stripMapImageDataUrl(meta) {
  if (!meta || typeof meta !== 'object') return null;
  const copy = Object.assign({}, meta);
  delete copy.dataUrl;
  return copy;
}
window.stripMapImageDataUrl = stripMapImageDataUrl;
```

### Step 2: Fix Map Image Persistence, Quota Overflow, Canvas Hydration & Deletion (F-06, F-06b, F-06c, F-06d)

1. **`src/workstation/scripts/map_store.js`**:
   - **Line 121 (`deletePersistedMapFromDB`)**: Default `mapId` to the active map so `clearLoadedMap()` actually deletes from IndexedDB, and also delete `"active_map"` when deleting `"map_root"`:
     ```javascript
     async function deletePersistedMapFromDB(mapId = null) {
       const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
       if (!targetId) return;
       const db = await openMapDatabase();
       if (db) {
         try {
           const tx = db.transaction(MAP_STORE_NAME, "readwrite");
           const store = tx.objectStore(MAP_STORE_NAME);
           store.delete(targetId);
           if (targetId === "map_root") store.delete("active_map");
         } catch(e) {}
       }
       try {
         const metaListStr = localStorage.getItem("cs_maps_meta_catalog") || "{}";
         const metaList = JSON.parse(metaListStr);
         delete metaList[targetId];
         localStorage.setItem("cs_maps_meta_catalog", JSON.stringify(metaList));
         if (targetId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root")) {
           localStorage.removeItem("cs_active_map_meta");
         }
       } catch(e) {}
     }
     ```
   - **Lines 191-199 (`handleMapFileIngestion`)**: Strip `dataUrl` from `maps[mapScope].mapMetadata` so `localStorage` never stores the multi-MB base64 string (IndexedDB already stores it in `saveMapImageToDB` on line 189):
     ```javascript
           if (typeof maps !== "undefined" && maps[mapScope]) {
             maps[mapScope].mapMetadata = stripMapImageDataUrl(record);
           }
     ```
   - **Line 246 (`clearLoadedMap`)**: Also set `activeMapMetadata = null;` when clearing the loaded map.

2. **`src/workstation/scripts/state_adapter.js`**:
   - **Line 86 (`initMapsRegistry`)**: Replace `mapMetadata: ...` with:
     ```javascript
           mapMetadata: (typeof activeMapMetadata !== "undefined" && activeMapMetadata) ? stripMapImageDataUrl(activeMapMetadata) : null,
     ```
   - **Lines 134-136 (`syncActiveMapToRegistry`)**: Replace with:
     ```javascript
       maps[activeMapId].mapMetadata = (typeof activeMapMetadata !== "undefined" && activeMapMetadata)
         ? stripMapImageDataUrl(activeMapMetadata)
         : (maps[activeMapId].mapMetadata ? stripMapImageDataUrl(maps[activeMapId].mapMetadata) : null);
     ```
   - **Lines 187-200 (`switchActiveMap`)**: After resolving `activeMapMetadata` from `loadPersistedMapFromDB(targetMapId)`, call `applyMapImageToCanvas` so the canvas background updates on map switch:
     ```javascript
       try {
         // 3. Load map image from DB or metadata
         const persisted = (typeof loadPersistedMapFromDB === "function") ? await loadPersistedMapFromDB(targetMapId) : null;
         if (persisted && persisted.dataUrl) {
           activeMapMetadata = persisted;
           if (typeof applyMapImageToCanvas === "function") {
             applyMapImageToCanvas(persisted.dataUrl, persisted.width, persisted.height, persisted.opacity ?? 0.85, false);
           }
         } else if (target.mapMetadata && target.mapMetadata.dataUrl) {
           activeMapMetadata = target.mapMetadata;
           if (typeof applyMapImageToCanvas === "function") {
             applyMapImageToCanvas(target.mapMetadata.dataUrl, target.mapMetadata.width, target.mapMetadata.height, target.mapMetadata.opacity ?? 0.85, false);
           }
         } else {
           activeMapMetadata = target.mapMetadata ? stripMapImageDataUrl(target.mapMetadata) : null;
           if (typeof applyMapImageToCanvas === "function") {
             applyMapImageToCanvas(null, 1000, 700);
           }
         }
       } catch(imgErr) {
         console.warn("[MapsRegistry] Image load error during map switch:", imgErr);
         activeMapMetadata = target.mapMetadata ? stripMapImageDataUrl(target.mapMetadata) : null;
         if (typeof applyMapImageToCanvas === "function") applyMapImageToCanvas(null, 1000, 700);
       }
     ```

3. **`src/workstation/scripts/workstation_core.js`**:
   - **Lines 191-193 (`initTopology`)**: After setting `activeMapMetadata = curMap.mapMetadata || null;`, asynchronously hydrate the active map's background image from IndexedDB (`loadPersistedMapFromDB(activeMapId)`) and call `applyMapImageToCanvas(...)`. Do the same at the end of `initTopology()` (around line 322) so initial page load always restores the background image from IndexedDB:
     ```javascript
     if (typeof loadPersistedMapFromDB === "function" && typeof applyMapImageToCanvas === "function") {
       const initMapId = (typeof activeMapId !== "undefined" && activeMapId) ? activeMapId : "map_root";
       loadPersistedMapFromDB(initMapId).then(rec => {
         if (rec && rec.dataUrl) {
           activeMapMetadata = rec;
           applyMapImageToCanvas(rec.dataUrl, rec.width, rec.height, rec.opacity ?? 0.85, false);
         }
       }).catch(() => {});
     }
     ```
   - **Lines 354-362 (`saveActiveCampaign`)**: Before `localStorage.setItem("creator_studio_maps_registry", JSON.stringify(maps))`, ensure every map's `mapMetadata` in `maps` has `dataUrl` stripped via `stripMapImageDataUrl`. And if `quotaErr` still occurs, call `setStatusBarMessage("Warning: Browser storage quota full. Use File -> Set Project Directory or Save As to save to disk.");`.

4. **`src/workstation/scripts/selective_importer.js`**:
   - **Lines 603-608**: When persisting imported map images in Mode A (and check Mode B around line 665), after `await saveMapImageToDB(...)`, strip `dataUrl` from `mMap.mapMetadata = stripMapImageDataUrl(mMap.mapMetadata)` and if `mId === activeMapId`, call `applyMapImageToCanvas(dataUrl, width, height, opacity, true)`.

---

### Step 3: Fix Async Directory Sync & Single-Flight Guard in `saveActiveCampaign` (F-07)
In `src/workstation/scripts/workstation_core.js` (lines 332-387):
- Keep `saveActiveCampaign()` synchronous for `localStorage` persistence (steps 1, 3, 4, 5) so callers and page-unload flows save immediately to session.
- For step 2 (`window.activeProjectDirectoryHandle && typeof writeCampaignToProjectDirectory === "function"`), coalesce concurrent directory writes with a module-scoped guard (`let _dirWriteInFlight = false; let _dirWritePending = false;`) and handle the Promise properly instead of assuming synchronous completion:
  ```javascript
  let _dirWriteInFlight = false;
  let _dirWritePending = false;
  async function flushProjectDirectorySync() {
    if (!window.activeProjectDirectoryHandle || typeof writeCampaignToProjectDirectory !== "function") return;
    if (_dirWriteInFlight) { _dirWritePending = true; return; }
    _dirWriteInFlight = true;
    try {
      await writeCampaignToProjectDirectory(window.activeProjectDirectoryHandle);
      if (window.activeProjectDirectoryName) {
        setStatusBarMessage(`Campaign saved & synced directly to Project Directory: "${window.activeProjectDirectoryName}".`);
      }
    } catch (dirErr) {
      console.warn("[SaveActiveCampaign] Error writing to bound Project Directory:", dirErr);
      setStatusBarMessage(`Saved to session, but Project Directory sync failed: ${dirErr.message || dirErr}`);
    } finally {
      _dirWriteInFlight = false;
      if (_dirWritePending) {
        _dirWritePending = false;
        flushProjectDirectorySync();
      }
    }
  }
  ```
- Call `flushProjectDirectorySync();` inside `saveActiveCampaign()`.

---

### Step 4: Restore Breadcrumbs HUD & Remove Duplicate Override (F-02)
1. **`src/workstation/template.html` (around line 325, inside `<div id="canvas-container" ...>` right before `<!-- FLOATING CAD HUD: LAYER FOCUS TOOLBAR (TOP-RIGHT) -->`)**:
   Add the missing Top-Left Breadcrumbs HUD panel that matches `win95_workstation.css` (`.hud-top-left`, `.hud-lineage-trail`) and `canvas_hud.js` (`#hud-breadcrumbs-lineage`, `#hud-btn-ascend`):
   ```html
        <!-- FLOATING CAD HUD 1: BREADCRUMBS & SCALE LINEAGE (TOP-LEFT) -->
        <div id="hud-breadcrumbs-panel" class="cad-hud-panel hud-top-left bevel-thin">
          <button class="win-btn hud-btn hidden" id="hud-btn-ascend" onclick="ascendToParentMap()" title="Ascend to Parent Map">&#8593; Up</button>
          <div id="hud-breadcrumbs-lineage" class="hud-lineage-trail"></div>
          <button class="win-btn hud-btn" onclick="openNewSubMapPrompt()" title="Create New Map or Sub-Map">+ Map</button>
        </div>
   ```
2. **`src/workstation/scripts/map_navigator.js` (lines 9-72)**:
   - Rename `function updateBreadcrumbsHUD()` in `map_navigator.js` to `function updateLegacyNavigatorBreadcrumbsHUD()` (or remove it and have it delegate to `canvas_hud.js`'s `updateBreadcrumbsHUD`) so it **stops overwriting** `canvas_hud.js`'s `updateBreadcrumbsHUD()`.
3. **`src/workstation/scripts/canvas_hud.js` (lines 11-44)**:
   - Escape `step.id`, `tier.label`, and `step.name` using `escapeAttr` / `escapeHtml` in `updateBreadcrumbsHUD()`:
     ```javascript
     return `
       <span class="hud-map-step ${isLast ? 'active' : ''}" onclick="switchActiveMap('${escapeAttr(step.id)}')" title="${escapeAttr(tier.label)}: ${escapeAttr(step.name)}">
         <span>${tier.icon}</span>
         <span>${escapeHtml(step.name)}</span>
       </span>
       ${!isLast ? '<span style="color:#777; font-size:9px; margin: 0 1px;">&gt;</span>' : ''}
     `;
     ```

---

### Step 5: Fix `wiki_engine.js` Hovercard Crash & Token Escaping (F-12)
In `src/workstation/scripts/wiki_engine.js`:
1. **Lines 364-389 (`renderWikiText`)**: Escape `entityId`, `targetMapId`, `displayTitle`, and `name` using `escapeAttr` / `escapeHtml` so node or NPC names containing quotes or `<` cannot break the pill attributes or inject HTML.
2. **Lines 407-426 (`showWikiHovercard`)**:
   - Fix node lookup to support both numeric and string node IDs: `const n = (typeof getNode === "function") ? (getNode(id) || getNode(parseInt(id))) : null;`
   - Fix coordinate access on line 420 so it doesn't throw when `n.coordinates` is undefined:
     ```javascript
     const coordX = (n.coordinates && n.coordinates.x !== undefined) ? n.coordinates.x : (n.x !== undefined ? n.x : 0);
     const coordY = (n.coordinates && n.coordinates.y !== undefined) ? n.coordinates.y : (n.y !== undefined ? n.y : 0);
     ```
   - Escape `title`, `n.cat`, `n.customNotes`, `m.customNotes`, `m.description`, `f.description` with `escapeHtml(...)`.

---

### Step 6: Fix `selective_importer.js` Error Handling & Prefixed Node IDs (F-11)
In `src/workstation/scripts/selective_importer.js`:
1. **Lines 93 and 223**: When converting an object map `nodes` dictionary to an array, preserve non-numeric/prefixed node IDs instead of forcing `parseInt(k)` to `NaN`:
   ```javascript
   nodes: Array.isArray(topoParsed.nodes)
     ? topoParsed.nodes
     : Object.keys(topoParsed.nodes).map(k => {
         const nObj = topoParsed.nodes[k];
         const parsedNum = Number(k);
         const resolvedId = (nObj && nObj.id !== undefined) ? nObj.id : (!isNaN(parsedNum) ? parsedNum : k);
         return { ...nObj, id: resolvedId };
       }),
   ```
   (Apply the same fix at line 223 for `mainData.nodes` and check line 280 for single-JSON import.)
2. **Lines 173-185**: Wrap `ZeroCorsZip.parse(buffer)` and the `JSON.parse(new TextDecoder().decode(...))` calls in a `try { ... } catch (zipErr) { alert("Failed to parse ZIP archive: " + zipErr.message); return; }` block (check if an outer `try` exists; if it does, verify its `catch` alerts the user clearly).

---

### Step 7: Escape User Strings in `canvas_hud.js`, `mdi_window_manager.js`, `workstation_core.js`, and `map_navigator.js` (F-03)
- **`canvas_hud.js`**:
  - Line 345: `<option value="${escapeAttr(other.id)}" ...>${escapeHtml(other.name)} (${escapeHtml(other.scaleTier)})</option>`
  - Line 366: `${escapeHtml(meta.name || 'image')}`
  - Line 409 & 577: `<option value="${escapeAttr(nid)}" ...>Node ${escapeHtml(nid)}: ${escapeHtml(n.name || '#' + nid)}</option>`
  - Line 528: `<option value="${escapeAttr(m.id)}" ...>Child of: ${tier.icon} ${escapeHtml(m.name)}</option>`
- **`map_navigator.js`**:
  - Line 200: `<option value="${escapeAttr(m.id)}" ...>Child of: ${tier.icon} ${escapeHtml(m.name)}</option>`
- **`mdi_window_manager.js`**:
  - Line 1078: `titleSpan.innerHTML = \`<strong>\${escapeHtml(mod.name || modId)}</strong>\`;`
  - Line 1139: `btn.innerHTML = \`<strong>\${escapeHtml(tool.label)}</strong><span class="tool-tag">[MOD]</span>\`;`
- **`workstation_core.js`**:
  - Line 2682: `item.innerHTML = \`<strong>\${escapeHtml(b.sourceName)}</strong> <span style="color:#64748b; font-size:9px;">[\${escapeHtml(b.field)}]</span>\`;`

---

### Step 8: Isolate Injected Mods in `build_suite.js` (F-13)
In `build_suite.js` around line 759:
Wrap each injected mod script in an IIFE + `try/catch` so a broken mod cannot crash `start.html`:
```javascript
        modsScriptBundle += `\n// --- BEGIN WORKSTATION MOD: ${modMeta.id} (${modMeta.name || folder.name}) ---\n`;
        modsScriptBundle += `try {\n(function() {\n${modCode}\n})();\n} catch (modErr) { console.error("[WorkstationMod] Failed to initialize mod '${modMeta.id}':", modErr); }\n`;
        modsScriptBundle += `// --- END WORKSTATION MOD: ${modMeta.id} ---\n`;
```

---

### Step 9: Fix `scheduleRenderCanvas` Drag Coalescing, Listener Stacking & Node ID Gen (F-08, F-09, F-10)
1. **F-08 (`src/workstation/scripts/workstation_core.js`)**:
   - Right above `function renderCanvas()` (line 656), add:
     ```javascript
     let _canvasRenderScheduled = false;
     function scheduleRenderCanvas() {
       if (_canvasRenderScheduled) return;
       _canvasRenderScheduled = true;
       requestAnimationFrame(() => {
         _canvasRenderScheduled = false;
         renderCanvas();
       });
     }
     ```
   - In `mousemove` drag handlers inside `workstation_core.js` (e.g. clock drag at line 1312 and node/canvas drag `onCanvasMouseMove`), call `scheduleRenderCanvas()` instead of synchronous `renderCanvas()`. Keep final `mouseup` calling synchronous `renderCanvas()`.
2. **F-09 (`src/workstation/scripts/stage_5_slotting.js` & `canvas_hud.js`)**:
   - In `stage_5_slotting.js:906-909`: Delete the duplicate `sel.addEventListener("change", ...)` inside `initResourceTagFilter()` because lines 878-884 already bind `tagSelectEl.addEventListener("change", ...)` at load time.
   - In `canvas_hud.js:786-788` (`openSetMapScaleDialog`): Replace `addEventListener` with direct property assignment so reopening the dialog doesn't stack listeners:
     ```javascript
     valInput.oninput = updateScalePreview;
     if (unitSelect) unitSelect.onchange = updateScalePreview;
     if (pxInput) pxInput.oninput = updateScalePreview;
     ```
3. **F-10 (`src/workstation/scripts/entity_manager.js:1457`)**:
   - Filter out `NaN` when computing `nextId`:
     ```javascript
     const numericIds = Object.keys(topo.nodes || {}).map(k => parseInt(k, 10)).filter(n => !isNaN(n));
     const nextId = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1;
     ```

---

### Step 10: Compile & Verify Suite
1. Run syntax check on all modified scripts using Node:
   `& "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe" C:\Users\Milo\.gemini\antigravity\brain\6033eeeb-b9fb-4b7c-a320-89cf71a56565\scratch\analyze.js src/workstation/scripts`
2. Run the full suite build and stamp wiki hashes:
   `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1 --stamp-reviewed`
3. Verify `mods/tarot_balancing/Run-NetworkEngine.ps1` still passes with 0 errors.
