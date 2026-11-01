// ============================================================================
// CREATOR STUDIO: DYNAMIC CANVAS LAYERS MANAGER ENGINE
// ============================================================================
// Authoritative layer data model, per-map layer stacks, visibility/lock cascades,
// and Windows 95 / VB6 dual-mount (floating MDI window + properties dock) UI.

/**
 * Standard 6 core default layers for any newly created or migrated map topology
 * @returns {Array<{id: string, name: string, zIndex: number, visible: boolean, locked: boolean, opacity: number}>}
 */
function getDefaultLayers() {
  return [
    { id: 'layer-bg', name: 'Background & Grid', zIndex: 0, visible: true, locked: false, opacity: 1.0, isCore: true },
    { id: 'layer-drawings', name: 'Drawing Shapes', zIndex: 1, visible: true, locked: false, opacity: 1.0, isCore: true },
    { id: 'layer-roads', name: 'Transit Roads', zIndex: 2, visible: true, locked: false, opacity: 1.0, isCore: true },
    { id: 'layer-hegemony', name: 'Hegemony Conduits', zIndex: 3, visible: true, locked: false, opacity: 1.0, isCore: true },
    { id: 'layer-nodes', name: 'Topological Nodes', zIndex: 4, visible: true, locked: false, opacity: 1.0, isCore: true },
    { id: 'layer-annotations', name: 'Annotations & Clocks', zIndex: 5, visible: true, locked: false, opacity: 1.0, isCore: true }
  ];
}

/**
 * Ensure topology has complete, normalized layers and shapes collections
 * @param {Object} topo
 */
function ensureTopologyLayers(topo) {
  if (!topo) return;
  if (!topo.layers || !Array.isArray(topo.layers) || topo.layers.length === 0) {
    topo.layers = getDefaultLayers();
  } else {
    // Verify core layers exist, append any missing core layers
    const existingIds = new Set(topo.layers.map(l => l.id));
    const defaults = getDefaultLayers();
    defaults.forEach(def => {
      if (!existingIds.has(def.id)) {
        topo.layers.push(def);
      }
    });

    // Normalize each layer's attributes
    topo.layers.forEach((l, idx) => {
      if (typeof l.zIndex !== 'number') l.zIndex = idx;
      if (typeof l.visible !== 'boolean') l.visible = true;
      if (typeof l.locked !== 'boolean') l.locked = false;
      if (typeof l.opacity !== 'number' || isNaN(l.opacity)) l.opacity = 1.0;
      else l.opacity = Math.max(0, Math.min(1, l.opacity));
      if (!l.name) l.name = l.id;
      if (defaults.some(d => d.id === l.id)) l.isCore = true;
    });
  }

  // Ensure shapes array exists
  if (!topo.shapes || !Array.isArray(topo.shapes)) {
    topo.shapes = [];
  }
}

/**
 * Get layers sorted by zIndex ascending (0 at bottom, highest on top)
 * @param {Object} [topo]
 * @returns {Array<Object>}
 */
function getTopologyLayers(topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return getDefaultLayers();
  ensureTopologyLayers(targetTopo);
  return [...targetTopo.layers].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

/**
 * Get layer by ID
 * @param {string} layerId
 * @param {Object} [topo]
 * @returns {Object|null}
 */
function getLayerById(layerId, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo || !Array.isArray(targetTopo.layers)) return null;
  return targetTopo.layers.find(l => l.id === layerId) || null;
}

/**
 * Add a new custom user layer to the active topology
 * @param {string} name
 * @param {Object} [topo]
 * @returns {Object}
 */
function addCustomLayer(name, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return null;
  ensureTopologyLayers(targetTopo);

  const cleanName = (name || '').trim() || `Layer ${targetTopo.layers.length + 1}`;
  const timestamp = Date.now().toString(36);
  const layerId = `layer-${cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}-${timestamp}`;
  const maxZ = targetTopo.layers.reduce((max, l) => Math.max(max, l.zIndex ?? 0), 0);

  const newLayer = {
    id: layerId,
    name: cleanName,
    zIndex: maxZ + 1,
    visible: true,
    locked: false,
    opacity: 1.0,
    isCore: false
  };

  targetTopo.layers.push(newLayer);

  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Created custom canvas layer: "${cleanName}".`);

  return newLayer;
}

/**
 * Delete a custom layer. Reassigns all entities on that layer to fallbackLayerId.
 * Core default layers cannot be deleted.
 * @param {string} layerId
 * @param {string} [fallbackLayerId='layer-drawings']
 * @param {Object} [topo]
 * @returns {boolean}
 */
function deleteCustomLayer(layerId, fallbackLayerId = 'layer-drawings', topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo || !Array.isArray(targetTopo.layers)) return false;

  const layer = getLayerById(layerId, targetTopo);
  if (!layer) return false;
  if (layer.isCore) {
    if (typeof alert === 'function') alert(`Cannot delete core system layer: "${layer.name}". Core layers are required for graph topology.`);
    return false;
  }

  // Fallback destination check
  const fallback = getLayerById(fallbackLayerId, targetTopo) || getLayerById('layer-drawings', targetTopo) || targetTopo.layers[0];
  const targetDestId = fallback ? fallback.id : 'layer-drawings';

  // 1. Reassign nodes
  if (targetTopo.nodes) {
    Object.values(targetTopo.nodes).forEach(n => {
      if (n.layerId === layerId) n.layerId = targetDestId;
    });
  }

  // 2. Reassign edges
  if (targetTopo.edgeData) {
    Object.values(targetTopo.edgeData).forEach(e => {
      if (e.layerId === layerId) e.layerId = targetDestId;
    });
  }

  // 3. Reassign drawing shapes
  if (Array.isArray(targetTopo.shapes)) {
    targetTopo.shapes.forEach(s => {
      if (s.layerId === layerId) s.layerId = targetDestId;
    });
  }

  // 4. Reassign trackers / clocks
  if (Array.isArray(targetTopo.trackers)) {
    targetTopo.trackers.forEach(t => {
      if (t.layerId === layerId) t.layerId = targetDestId;
    });
  }

  // Remove layer from collection
  targetTopo.layers = targetTopo.layers.filter(l => l.id !== layerId);

  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
  if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Deleted layer "${layer.name}". Reassigned items to "${fallback.name}".`);

  return true;
}

/**
 * Toggle visibility for a layer
 * @param {string} layerId
 * @param {Object} [topo]
 */
function toggleLayerVisibility(layerId, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return;
  ensureTopologyLayers(targetTopo);

  // Support legacy short keys ('roads', 'hegemony', 'clocks', 'bg')
  let resolvedId = layerId;
  if (layerId === 'roads') resolvedId = 'layer-roads';
  else if (layerId === 'hegemony') resolvedId = 'layer-hegemony';
  else if (layerId === 'clocks') resolvedId = 'layer-annotations';
  else if (layerId === 'bg') resolvedId = 'layer-bg';

  const layer = getLayerById(resolvedId, targetTopo);
  if (!layer) return;

  layer.visible = !layer.visible;

  // Sync global Workstation flags
  if (typeof Workstation !== 'undefined') {
    if (resolvedId === 'layer-roads') Workstation.showRoads = layer.visible;
    else if (resolvedId === 'layer-hegemony') Workstation.showInfluence = layer.visible;
    else if (resolvedId === 'layer-annotations') Workstation.showClocks = layer.visible;
    else if (resolvedId === 'layer-bg') Workstation.showBgMap = layer.visible;
  }

  // Sync HUD buttons
  syncHudLayerButtons();

  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
  if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Layer "${layer.name}" visibility: ${layer.visible ? 'VISIBLE 👁️' : 'HIDDEN 🕶️'}.`);
}

/**
 * Toggle locked state for a layer
 * @param {string} layerId
 * @param {Object} [topo]
 */
function toggleLayerLock(layerId, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return;
  ensureTopologyLayers(targetTopo);

  const layer = getLayerById(layerId, targetTopo);
  if (!layer) return;

  layer.locked = !layer.locked;

  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
  if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Layer "${layer.name}" is now ${layer.locked ? 'LOCKED 🔒' : 'UNLOCKED 🔓'}.`);
}

/**
 * Set layer opacity (clamped between 0.0 and 1.0)
 * @param {string} layerId
 * @param {number} opacity
 * @param {Object} [topo]
 */
function setLayerOpacity(layerId, opacity, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return;
  ensureTopologyLayers(targetTopo);

  const layer = getLayerById(layerId, targetTopo);
  if (!layer) return;

  const num = parseFloat(opacity);
  layer.opacity = isNaN(num) ? 1.0 : Math.max(0, Math.min(1, num));

  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI(false);
  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
}

/**
 * Reorder layer up or down in the zIndex stack
 * @param {string} layerId
 * @param {'up'|'down'} direction
 * @param {Object} [topo]
 */
function reorderLayer(layerId, direction, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return;
  ensureTopologyLayers(targetTopo);

  const sorted = getTopologyLayers(targetTopo);
  const idx = sorted.findIndex(l => l.id === layerId);
  if (idx < 0) return;

  const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
  if (targetIdx < 0 || targetIdx >= sorted.length) return;

  // Swap zIndex
  const currentLayer = sorted[idx];
  const neighborLayer = sorted[targetIdx];
  const tempZ = currentLayer.zIndex;
  currentLayer.zIndex = neighborLayer.zIndex;
  neighborLayer.zIndex = tempZ;

  // Normalize zIndex sequence
  const reSorted = getTopologyLayers(targetTopo);
  reSorted.forEach((l, i) => { l.zIndex = i; });

  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
}

/**
 * Rename a custom layer
 * @param {string} layerId
 * @param {string} newName
 * @param {Object} [topo]
 */
function renameLayer(layerId, newName, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return;
  ensureTopologyLayers(targetTopo);

  const layer = getLayerById(layerId, targetTopo);
  if (!layer) return;

  const clean = (newName || '').trim();
  if (!clean) return;

  layer.name = clean;

  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
}

/**
 * Count entities assigned to a given layer
 * @param {string} layerId
 * @param {Object} [topo]
 * @returns {number}
 */
function countEntitiesOnLayer(layerId, topo) {
  const targetTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
  if (!targetTopo) return 0;
  let count = 0;

  // Nodes
  if (targetTopo.nodes) {
    Object.values(targetTopo.nodes).forEach(n => {
      if ((n.layerId || 'layer-nodes') === layerId) count++;
    });
  }

  // Edges
  if (layerId === 'layer-roads' && targetTopo.nodes) {
    let roadLinks = 0;
    Object.values(targetTopo.nodes).forEach(n => {
      if (Array.isArray(n.adj)) roadLinks += n.adj.length;
    });
    count += Math.floor(roadLinks / 2);
  } else if (layerId === 'layer-hegemony' && targetTopo.nodes) {
    let hegemLinks = 0;
    Object.values(targetTopo.nodes).forEach(n => {
      if (Array.isArray(n.infBy)) hegemLinks += n.infBy.length;
    });
    count += hegemLinks;
  } else if (targetTopo.edgeData) {
    Object.values(targetTopo.edgeData).forEach(e => {
      if (e.layerId === layerId) count++;
    });
  }

  // Drawing Shapes
  if (Array.isArray(targetTopo.shapes)) {
    targetTopo.shapes.forEach(s => {
      if ((s.layerId || 'layer-drawings') === layerId) count++;
    });
  }

  // Clocks / Trackers
  if (Array.isArray(targetTopo.trackers)) {
    targetTopo.trackers.forEach(t => {
      if ((t.layerId || 'layer-annotations') === layerId) count++;
    });
  }

  // Map Background Image / Grid
  if (layerId === 'layer-bg') {
    count = 1;
  }

  return count;
}

/**
 * Synchronize HUD buttons with active layer states
 */
function syncHudLayerButtons() {
  const topo = typeof Workstation !== 'undefined' ? Workstation.activeTopology : null;
  if (!topo) return;

  const roadsLayer = getLayerById('layer-roads', topo);
  const hegemLayer = getLayerById('layer-hegemony', topo);
  const clocksLayer = getLayerById('layer-annotations', topo);
  const bgLayer = getLayerById('layer-bg', topo);

  const bRoads = document.getElementById('btn-focus-roads');
  if (bRoads && roadsLayer) bRoads.classList.toggle('active', roadsLayer.visible);

  const bHegem = document.getElementById('btn-focus-hegemony');
  if (bHegem && hegemLayer) bHegem.classList.toggle('active', hegemLayer.visible);

  const bClocks = document.getElementById('btn-focus-clocks');
  if (bClocks && clocksLayer) bClocks.classList.toggle('active', clocksLayer.visible);

  const bBg = document.getElementById('btn-focus-bg');
  if (bBg && bgLayer) bBg.classList.toggle('active', bgLayer.visible);
}

/**
 * Open or toggle the Canvas Layers Manager MDI Window
 */
function toggleLayersPane() {
  if (typeof MDIWindowManager !== 'undefined' && typeof MDIWindowManager.toggleWindow === 'function') {
    MDIWindowManager.toggleWindow('modal-layers-manager');
    renderLayersManagerUI();
  }
}

/**
 * Prompt author to add a new custom layer
 */
function promptAddNewLayer() {
  const name = prompt('Enter a name for the new Canvas Layer:', `Layer ${(Workstation.activeTopology && Workstation.activeTopology.layers ? Workstation.activeTopology.layers.length : 6) + 1}`);
  if (name && name.trim()) {
    addCustomLayer(name.trim());
  }
}

/**
 * Prompt author to rename a layer
 * @param {string} layerId
 */
function promptRenameLayer(layerId) {
  const layer = getLayerById(layerId);
  if (!layer) return;
  const newName = prompt(`Rename Layer "${layer.name}":`, layer.name);
  if (newName && newName.trim() && newName.trim() !== layer.name) {
    renameLayer(layerId, newName.trim());
  }
}

/**
 * Render the Windows 95 / VB6 Layers Manager UI
 * Mounts into both floating MDI window and properties dock panel
 * @param {boolean} [rebuildTable=true]
 */
function renderLayersManagerUI(rebuildTable = true) {
  const topo = typeof Workstation !== 'undefined' ? Workstation.activeTopology : null;
  if (!topo) return;
  ensureTopologyLayers(topo);

  const floatingMount = document.getElementById('floating-layers-mount');
  const dockMount = document.getElementById('dock-layers-mount');
  const mounts = [floatingMount, dockMount].filter(Boolean);
  if (mounts.length === 0) return;

  const sortedLayers = getTopologyLayers(topo); // 0 at bottom, highest on top
  // In UI, display top layer first (highest zIndex at top of list)
  const displayLayers = [...sortedLayers].reverse();

  mounts.forEach(mount => {
    // If not rebuilding table, just update sliders & badges
    if (!rebuildTable && mount.querySelector('.layers-table-container')) {
      displayLayers.forEach(l => {
        const slider = mount.querySelector(`input[data-layer-opacity="${l.id}"]`);
        if (slider) slider.value = Math.round((l.opacity ?? 1.0) * 100);
        const opVal = mount.querySelector(`span[data-layer-optext="${l.id}"]`);
        if (opVal) opVal.textContent = `${Math.round((l.opacity ?? 1.0) * 100)}%`;
      });
      return;
    }

    mount.innerHTML = `
      <!-- Toolbar Header -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; padding:2px 0;">
        <div style="display:flex; gap:3px;">
          <button class="win-btn" onclick="promptAddNewLayer()" style="font-size:11px; font-weight:bold; padding:2px 6px;">+ Add Layer</button>
          <button class="win-btn" onclick="setAllLayersVisibility(true)" style="font-size:10px; padding:2px 5px;" title="Make all layers visible">Show All</button>
          <button class="win-btn" onclick="setAllLayersVisibility(false)" style="font-size:10px; padding:2px 5px;" title="Hide all layers">Hide All</button>
        </div>
        <div style="font-size:10px; color:#444; font-family:monospace;">${sortedLayers.length} Layers</div>
      </div>

      <!-- Layers Table Container -->
      <div class="layers-table-container bevel-inset" style="flex:1; overflow-y:auto; background:#ffffff; font-size:11px;">
        <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
          <thead>
            <tr style="background:var(--win-base); border-bottom:1px solid #7f9db9; font-size:10px; text-align:left;">
              <th style="width:42px; padding:3px 4px; text-align:center;">Order</th>
              <th style="width:28px; padding:3px 2px; text-align:center;">Vis</th>
              <th style="width:28px; padding:3px 2px; text-align:center;">Lock</th>
              <th style="padding:3px 4px;">Layer Name</th>
              <th style="width:50px; padding:3px 2px; text-align:center;">Items</th>
              <th style="width:85px; padding:3px 2px;">Opacity</th>
              <th style="width:30px; padding:3px 2px; text-align:center;">Del</th>
            </tr>
          </thead>
          <tbody>
            ${displayLayers.map((l, index) => {
              const count = countEntitiesOnLayer(l.id, topo);
              const isTop = index === 0;
              const isBottom = index === displayLayers.length - 1;
              const opPct = Math.round((l.opacity ?? 1.0) * 100);

              return `
                <tr style="border-bottom:1px solid #e2e8f0; ${!l.visible ? 'background:#f8fafc; color:#94a3b8;' : ''}">
                  <!-- Z-Order Reorder Controls -->
                  <td style="padding:2px 2px; text-align:center; white-space:nowrap;">
                    <button class="win-btn" onclick="reorderLayer('${l.id}', 'up')" ${isTop ? 'disabled' : ''} style="padding:0 2px; font-size:8px; line-height:10px; width:14px; height:14px;" title="Move Up in Stack">▲</button>
                    <button class="win-btn" onclick="reorderLayer('${l.id}', 'down')" ${isBottom ? 'disabled' : ''} style="padding:0 2px; font-size:8px; line-height:10px; width:14px; height:14px;" title="Move Down in Stack">▼</button>
                  </td>

                  <!-- Visibility Toggle Button -->
                  <td style="padding:2px; text-align:center;">
                    <button class="win-btn" onclick="toggleLayerVisibility('${l.id}')" style="width:22px; height:20px; font-size:11px; padding:0; ${l.visible ? 'color:#0284c7;' : 'opacity:0.4;'}" title="${l.visible ? 'Visible - click to hide' : 'Hidden - click to reveal'}">
                      ${l.visible ? '👁️' : '🕶️'}
                    </button>
                  </td>

                  <!-- Lock Toggle Button -->
                  <td style="padding:2px; text-align:center;">
                    <button class="win-btn" onclick="toggleLayerLock('${l.id}')" style="width:22px; height:20px; font-size:11px; padding:0; ${l.locked ? 'color:#b91c1c; font-weight:bold;' : 'color:#64748b;'}" title="${l.locked ? 'Locked - entities cannot be dragged' : 'Unlocked - entities editable'}">
                      ${l.locked ? '🔒' : '🔓'}
                    </button>
                  </td>

                  <!-- Layer Name & Rename -->
                  <td style="padding:3px 4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l.name} (${l.id})">
                    <span style="font-weight:${l.isCore ? 'bold' : 'normal'}; cursor:pointer;" onclick="promptRenameLayer('${l.id}')">
                      ${escapeHtml(l.name)}
                    </span>
                    ${l.isCore ? '<span style="font-size:9px; color:#64748b; margin-left:3px;">(Core)</span>' : ''}
                  </td>

                  <!-- Entity Count Badge -->
                  <td style="padding:2px; text-align:center; font-family:monospace; font-size:10px;">
                    <span style="background:${count > 0 ? '#e0f2fe' : '#f1f5f9'}; color:${count > 0 ? '#0369a1' : '#94a3b8'}; padding:1px 4px; border-radius:3px;">
                      ${count}
                    </span>
                  </td>

                  <!-- Opacity Range Slider -->
                  <td style="padding:2px;">
                    <div style="display:flex; align-items:center; gap:2px;">
                      <input type="range" min="0" max="100" value="${opPct}" data-layer-opacity="${l.id}" style="width:48px; height:10px;" oninput="setLayerOpacity('${l.id}', this.value / 100)">
                      <span data-layer-optext="${l.id}" style="font-size:9px; font-family:monospace; width:26px;">${opPct}%</span>
                    </div>
                  </td>

                  <!-- Delete Custom Layer Action -->
                  <td style="padding:2px; text-align:center;">
                    <button class="win-btn" onclick="confirmDeleteLayer('${l.id}')" ${l.isCore ? 'disabled style="opacity:0.3; cursor:not-allowed;" title="Core system layer cannot be deleted"' : 'title="Delete custom layer"'} style="width:18px; height:18px; font-size:10px; line-height:10px; padding:0; color:#dc2626;">
                      ✕
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Quick Legend Footer -->
      <div style="font-size:10px; color:#64748b; padding:2px 4px; display:flex; justify-content:space-between; align-items:center; background:var(--win-base); border-top:1px solid #7f9db9;">
        <span>Eye toggles visibility; Lock prevents selection &amp; drag.</span>
      </div>
    `;
  });
}

/**
 * Set visibility for all layers at once
 * @param {boolean} visible
 */
function setAllLayersVisibility(visible) {
  const topo = typeof Workstation !== 'undefined' ? Workstation.activeTopology : null;
  if (!topo) return;
  ensureTopologyLayers(topo);

  topo.layers.forEach(l => {
    l.visible = visible;
  });

  if (typeof Workstation !== 'undefined') {
    Workstation.showRoads = visible;
    Workstation.showInfluence = visible;
    Workstation.showClocks = visible;
    Workstation.showBgMap = visible;
  }

  syncHudLayerButtons();
  if (typeof renderCanvas === 'function') renderCanvas();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
  if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`All canvas layers set to ${visible ? 'VISIBLE 👁️' : 'HIDDEN 🕶️'}.`);
}

/**
 * Confirm and delete a custom layer
 * @param {string} layerId
 */
function confirmDeleteLayer(layerId) {
  const layer = getLayerById(layerId);
  if (!layer) return;
  if (layer.isCore) {
    if (typeof alert === 'function') alert(`Core system layer "${layer.name}" cannot be deleted.`);
    return;
  }

  const ok = confirm(`Are you sure you want to delete custom layer "${layer.name}"?\nAll items on this layer will be reassigned to the default Drawing Shapes layer.`);
  if (ok) {
    deleteCustomLayer(layerId, 'layer-drawings');
  }
}

/**
 * Helper to escape HTML characters in user-entered layer names
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Export functions to window and CreatorStudio namespace
window.getDefaultLayers = getDefaultLayers;
window.ensureTopologyLayers = ensureTopologyLayers;
window.getTopologyLayers = getTopologyLayers;
window.getLayerById = getLayerById;
window.addCustomLayer = addCustomLayer;
window.deleteCustomLayer = deleteCustomLayer;
window.toggleLayerVisibility = toggleLayerVisibility;
window.toggleLayerLock = toggleLayerLock;
window.setLayerOpacity = setLayerOpacity;
window.reorderLayer = reorderLayer;
window.renameLayer = renameLayer;
window.countEntitiesOnLayer = countEntitiesOnLayer;
window.syncHudLayerButtons = syncHudLayerButtons;
window.toggleLayersPane = toggleLayersPane;
window.promptAddNewLayer = promptAddNewLayer;
window.promptRenameLayer = promptRenameLayer;
window.renderLayersManagerUI = renderLayersManagerUI;
window.setAllLayersVisibility = setAllLayersVisibility;
window.confirmDeleteLayer = confirmDeleteLayer;
