// ============================================================================
// CREATOR STUDIO: CAD CANVAS HUD, CORRIDOR ARCS & TACTICAL OVERLAYS (ZERO-CORS)
// ============================================================================
// Handles Translucent CAD Inset HUDs (Breadcrumbs, Layer Focus, Map Legend),
// Multi-Vector Curved Corridors (Bézier Hegemony Arcs, 1-Way/2-Way Directional Roads),
// and Scale-Fluid Cartographic Portals.

/**
 * Updates the floating Breadcrumbs HUD above the CAD viewport
 */
function updateBreadcrumbsHUD() {
  const trail = document.getElementById('hud-breadcrumbs-lineage');
  const btnAscend = document.getElementById('hud-btn-ascend');
  if (!trail) return;

  const currentMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
  const mapData = (typeof maps !== "undefined" && maps) ? maps[currentMapId] : null;
  const path = (typeof getBreadcrumbPath === "function")
    ? getBreadcrumbPath(currentMapId)
    : [{ id: "map_root", name: (Workstation.activeTopology && Workstation.activeTopology.name) || "Root Map", scaleTier: "region" }];

  trail.innerHTML = path.map((step, idx) => {
    const isLast = (idx === path.length - 1);
    const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[step.scaleTier])
      ? SCALE_TIERS[step.scaleTier]
      : { icon: "🗺️", label: "Map" };
    return `
      <span class="hud-map-step ${isLast ? 'active' : ''}" onclick="switchActiveMap('${escapeAttr(step.id)}')" title="${escapeAttr(tier.label)}: ${escapeAttr(step.name)}">
        <span>${tier.icon}</span>
        <span>${escapeHtml(step.name)}</span>
      </span>
      ${!isLast ? '<span style="color:#777; font-size:9px; margin: 0 1px;">&gt;</span>' : ''}
    `;
  }).join('');

  if (btnAscend) {
    if (mapData && mapData.parentMapId) {
      btnAscend.classList.remove('hidden');
    } else {
      btnAscend.classList.add('hidden');
    }
  }
}

/**
 * Ascend to parent pointcrawl map
 */
function ascendToParentMap() {
  if (typeof maps === "undefined" || !maps || typeof activeMapId === "undefined") return;
  const cur = maps[activeMapId];
  if (cur && cur.parentMapId && maps[cur.parentMapId]) {
    switchActiveMap(cur.parentMapId);
    setStatusBarMessage(`Ascended to parent map: "${maps[cur.parentMapId].name}".`);
  }
}

/**
 * Prompt user to create a new sub-map attached to active or selected node
 */
function openNewSubMapPrompt() {
  const sel = Workstation.selectedEntity;
  let parentNodeId = null;
  if (sel && sel.type === 'node') {
    parentNodeId = sel.id;
  }
  const defaultName = parentNodeId ? `District of Node ${parentNodeId}` : "New Campaign District";
  const name = prompt("Enter sub-map name:", defaultName);
  if (!name) return;

  const tier = prompt("Enter scale tier (continent, region, district, site, chamber):", "district") || "district";
  if (typeof createMap === "function") {
    const newMap = createMap(name, tier, activeMapId, parentNodeId);
    if (confirm(`Created sub-map "${newMap.name}". Switch to it now?`)) {
      switchActiveMap(newMap.id);
    }
  }
}

/**
 * Set active layer focus preset (All, Roads, Hegemony)
 */
function setLayerFocus(focusType) {
  Workstation.activeLayerFocus = focusType;
  document.querySelectorAll('#hud-layer-focus .hud-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(`btn-focus-${focusType}`);
  if (btn) btn.classList.add('active');

  if (focusType === 'all') {
    Workstation.showRoads = true;
    Workstation.showInfluence = true;
    Workstation.showClocks = true;
    const rBtn = document.getElementById('btn-focus-roads');
    const hBtn = document.getElementById('btn-focus-hegemony');
    const cBtn = document.getElementById('btn-focus-clocks');
    if (rBtn) rBtn.classList.add('active');
    if (hBtn) hBtn.classList.add('active');
    if (cBtn) cBtn.classList.add('active');
  }
  renderCanvas();
  setStatusBarMessage(`Layer focus: ${focusType.toUpperCase()}`);
}

/**
 * Toggle individual layer visibility on CAD canvas
 */
function toggleLayerVisibility(layerKey) {
  const topo = (typeof Workstation !== 'undefined') ? Workstation.activeTopology : null;
  let resolvedId = layerKey;
  if (layerKey === 'roads') resolvedId = 'layer-roads';
  else if (layerKey === 'hegemony') resolvedId = 'layer-hegemony';
  else if (layerKey === 'clocks') resolvedId = 'layer-annotations';
  else if (layerKey === 'bg') resolvedId = 'layer-bg';

  if (topo && Array.isArray(topo.layers)) {
    const layer = topo.layers.find(l => l.id === resolvedId);
    if (layer) {
      layer.visible = !layer.visible;
      if (resolvedId === 'layer-roads') Workstation.showRoads = layer.visible;
      else if (resolvedId === 'layer-hegemony') Workstation.showInfluence = layer.visible;
      else if (resolvedId === 'layer-annotations') Workstation.showClocks = layer.visible;
      else if (resolvedId === 'layer-bg') Workstation.showBgMap = layer.visible;
    }
  } else {
    if (layerKey === 'roads') Workstation.showRoads = !Workstation.showRoads;
    else if (layerKey === 'hegemony') Workstation.showInfluence = !Workstation.showInfluence;
    else if (layerKey === 'clocks') Workstation.showClocks = !Workstation.showClocks;
    else if (layerKey === 'bg') Workstation.showBgMap = !Workstation.showBgMap;
  }

  const bRoads = document.getElementById('btn-focus-roads');
  if (bRoads) bRoads.classList.toggle('active', !!Workstation.showRoads);
  const bHegem = document.getElementById('btn-focus-hegemony');
  if (bHegem) bHegem.classList.toggle('active', !!Workstation.showInfluence);
  const bClocks = document.getElementById('btn-focus-clocks');
  if (bClocks) bClocks.classList.toggle('active', !!Workstation.showClocks);
  const bBg = document.getElementById('btn-focus-bg');
  if (bBg) bBg.classList.toggle('active', !!Workstation.showBgMap);

  const bgImg = document.getElementById('canvas-bg-image');
  if (bgImg) bgImg.style.display = Workstation.showBgMap ? 'block' : 'none';

  renderCanvas();
  if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
  if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
  setStatusBarMessage(`Toggled ${layerKey.toUpperCase()} layer.`);
}

/**
 * Collapsible Visual Grammar Legend
 */
function toggleCanvasLegend() {
  const panel = document.getElementById('hud-map-legend');
  const btn = document.getElementById('btn-toggle-legend');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (btn) btn.classList.toggle('active', !panel.classList.contains('hidden'));
}

function switchLegendTab(tabId) {
  const tabs = ['corridors', 'nodes', 'cultures', 'balancing'];
  tabs.forEach(t => {
    const btn = document.getElementById(`ltab-btn-${t}`);
    const content = document.getElementById(`ltab-content-${t}`);
    if (btn) btn.classList.toggle('active', t === tabId);
    if (content) content.classList.toggle('hidden', t !== tabId);
  });
}

/**
 * Drag and drop map image file ingestion
 */
function onCanvasDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (file && typeof handleMapFileIngestion === "function") {
    handleMapFileIngestion(file, (typeof activeMapId !== "undefined") ? activeMapId : "map_root");
    setStatusBarMessage(`Imported map background image: ${file.name}`);
  }
}

/**
 * Helper to compute curved Bézier control point for directional conduits
 */
function computeCorridorCurve(x1, y1, x2, y2, offsetDistance = 24) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const ctrlX = Math.round((x1 + x2) / 2 + nx * offsetDistance);
  const ctrlY = Math.round((y1 + y2) / 2 + ny * offsetDistance);
  return { ctrlX, ctrlY };
}

// ============================================================================
// AUTOCAD-STYLE MODEL & LAYOUT TABS ENGINE + MAP IMAGE WORKFLOWS
// ============================================================================

/**
 * Triggers file upload dialog for map image ingestion
 */
function triggerMapImageUpload(targetMapId = null) {
  const input = document.getElementById('cad-map-file-input');
  if (!input) return;
  input.dataset.targetMapId = targetMapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  input.value = '';
  input.click();
}

/**
 * Handles file selected from #cad-map-file-input
 */
function onMapFileSelected(e) {
  const input = e.target;
  const file = input && input.files && input.files[0];
  if (!file) return;

  const targetMapId = input.dataset.targetMapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  if (typeof handleMapFileIngestion === "function") {
    handleMapFileIngestion(file, targetMapId);
    setStatusBarMessage(`Imported map background image: "${file.name}" for ${targetMapId}`);
    
    // Refresh properties modal if currently open for this map
    const propModal = document.getElementById('modal-map-properties');
    if (propModal && !propModal.classList.contains('hidden')) {
      const propId = document.getElementById('map-prop-id').value;
      if (propId === targetMapId) {
        openMapPropertiesDialog(targetMapId);
      }
    }
  }
}

/**
 * Clear map background image from property modal
 */
function clearMapImageFromProp() {
  const mapId = document.getElementById('map-prop-id').value;
  if (!mapId || typeof maps === "undefined" || !maps[mapId]) return;

  if (confirm(`Remove custom background image for map "${maps[mapId].name}" and revert to tactical CAD grid?`)) {
    if (typeof deletePersistedMapFromDB === "function") {
      deletePersistedMapFromDB(mapId);
    }
    maps[mapId].mapMetadata = null;
    if (mapId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root")) {
      activeMapMetadata = null;
      if (typeof applyMapImageToCanvas === "function") applyMapImageToCanvas(null, 1000, 700);
      if (typeof renderCanvas === "function") renderCanvas();
    }
    openMapPropertiesDialog(mapId);
    renderLayoutTabs();
    setStatusBarMessage(`Cleared background image for map: "${maps[mapId].name}".`);
  }
}

/**
 * Renders horizontal AutoCAD-style tabs along the bottom of the CAD viewport
 */
function renderLayoutTabs() {
  const container = document.getElementById('layout-tabs-list');
  if (!container) return;

  const curId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
  const mRegistry = (typeof maps !== "undefined" && maps && Object.keys(maps).length > 0)
    ? maps
    : { "map_root": { id: "map_root", name: (Workstation.activeTopology && Workstation.activeTopology.name) || "Root Map", scaleTier: "region" } };

  const mapKeys = Object.keys(mRegistry);
  const existingTabs = container.querySelectorAll('.layout-tab');

  // Check if existing DOM tabs match mapKeys in length and order for in-place update (prevents DOM recreation breaking dblclick)
  const canUpdateInPlace = (existingTabs.length === mapKeys.length) && Array.from(existingTabs).every((el, idx) => el.dataset.mapId === mapKeys[idx]);

  if (canUpdateInPlace) {
    existingTabs.forEach((el, idx) => {
      const mId = mapKeys[idx];
      const m = mRegistry[mId];
      const isCur = (mId === curId);
      const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier])
        ? SCALE_TIERS[m.scaleTier]
        : { icon: "🗺️", label: "Region" };
      const hasImage = !!(m.mapMetadata && (m.mapMetadata.dataUrl || m.mapMetadata.url || m.mapMetadata.assetPath));

      el.className = `layout-tab ${isCur ? 'active' : ''}`;
      el.title = `${m.name} [${tier.label}${m.dispositionModifier ? ' | Disp: ' + m.dispositionModifier : ''}] - Click to switch view, double-click for Map Properties`;

      const iconEl = el.querySelector('.layout-tab-icon');
      if (iconEl) iconEl.textContent = hasImage ? '🖼️' : tier.icon;

      const titleEl = el.querySelector('.layout-tab-title');
      if (titleEl) titleEl.textContent = m.name;

      const tierEl = el.querySelector('.layout-tab-tier');
      if (tierEl) tierEl.textContent = tier.label.split(' / ')[0];

      let dispEl = el.querySelector('.layout-tab-disp');
      if (m.dispositionModifier) {
        if (!dispEl) {
          dispEl = document.createElement('span');
          dispEl.className = 'layout-tab-disp';
          dispEl.style.cssText = 'background:#e0e7ff; color:#3730a3; padding:1px 3px; font-size:8px; border-radius:2px; font-weight:bold; margin-left:2px;';
          el.appendChild(dispEl);
        }
        dispEl.textContent = `[${m.dispositionModifier.substring(0,4)}]`;
        dispEl.title = `Overall Disposition Modifier: ${m.dispositionModifier}`;
      } else if (dispEl) {
        dispEl.remove();
      }
      let closeEl = el.querySelector('.layout-tab-close');
      if (mapKeys.length > 1) {
        if (!closeEl) {
          closeEl = document.createElement('span');
          closeEl.className = 'layout-tab-close';
          closeEl.style.cssText = 'margin-left:5px; font-weight:bold; color:#777; font-size:11px; cursor:pointer; padding:0 2px;';
          closeEl.title = `Delete Map "${m.name}"`;
          closeEl.textContent = '×';
          closeEl.onmouseover = () => { closeEl.style.color = '#b91c1c'; };
          closeEl.onmouseout = () => { closeEl.style.color = '#777'; };
          closeEl.onclick = (e) => { e.stopPropagation(); deleteMap(mId); };
          el.appendChild(closeEl);
        }
      } else if (closeEl) {
        closeEl.remove();
      }
    });
  } else {
    container.innerHTML = mapKeys.map(mId => {
      const m = mRegistry[mId];
      const isCur = (mId === curId);
      const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier])
        ? SCALE_TIERS[m.scaleTier]
        : { icon: "🗺️", label: "Region" };
      const hasImage = !!(m.mapMetadata && (m.mapMetadata.dataUrl || m.mapMetadata.url || m.mapMetadata.assetPath));

      const dispBadge = m.dispositionModifier 
        ? `<span class="layout-tab-disp" style="background:#e0e7ff; color:#3730a3; padding:1px 3px; font-size:8px; border-radius:2px; font-weight:bold; margin-left:2px;" title="Overall Disposition Modifier: ${m.dispositionModifier}">[${m.dispositionModifier.substring(0,4)}]</span>`
        : '';

      const closeBtn = mapKeys.length > 1 
        ? `<span class="layout-tab-close" onclick="event.stopPropagation(); deleteMap('${m.id}')" title="Delete Map '${escapeAttr(m.name)}'" style="margin-left:5px; font-weight:bold; color:#777; font-size:11px; cursor:pointer; padding:0 2px;" onmouseover="this.style.color='#b91c1c'" onmouseout="this.style.color='#777'">×</span>`
        : '';

      return `
        <div class="layout-tab ${isCur ? 'active' : ''}" 
             data-map-id="${m.id}"
             onclick="switchActiveMap('${m.id}')" 
             ondblclick="openMapPropertiesDialog('${m.id}')"
             oncontextmenu="event.preventDefault(); openMapPropertiesDialog('${m.id}');"
             title="${m.name} [${tier.label}${m.dispositionModifier ? ' | Disp: ' + m.dispositionModifier : ''}] - Click to switch view, double-click for Map Properties">
          <span class="layout-tab-icon">${hasImage ? '🖼️' : tier.icon}</span>
          <span class="layout-tab-title">${m.name}</span>
          <span class="layout-tab-tier">${tier.label.split(' / ')[0]}</span>
          ${dispBadge}
          ${closeBtn}
        </div>
      `;
    }).join('');
  }

  // Update quick opacity slider and percentage readout
  const activeMeta = (typeof activeMapMetadata !== "undefined" && activeMapMetadata) 
    ? activeMapMetadata 
    : (mRegistry[curId] && mRegistry[curId].mapMetadata);
  const curOpacity = activeMeta ? Math.round((activeMeta.opacity !== undefined ? activeMeta.opacity : 0.85) * 100) : 85;
  const opSlider = document.getElementById('cad-tab-opacity-slider');
  const opVal = document.getElementById('cad-tab-opacity-val');
  if (opSlider) opSlider.value = curOpacity;
  if (opVal) opVal.textContent = `${curOpacity}%`;

  // Update quick scale button label
  const scaleValEl = document.getElementById('cad-tab-scale-val');
  if (scaleValEl && typeof getActiveMapScaleSummary === "function") {
    scaleValEl.textContent = getActiveMapScaleSummary(curId);
  }
}

/**
 * Open the Map & Layout Properties dialog
 */
function openMapPropertiesDialog(mapId) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  const m = (typeof maps !== "undefined" && maps[targetId]) ? maps[targetId] : {
    id: targetId,
    name: (Workstation.activeTopology && Workstation.activeTopology.name) || "Root Map",
    scaleTier: "region",
    parentMapId: null,
    parentNodeId: null,
    customNotes: ""
  };

  const modal = document.getElementById('modal-map-properties');
  if (!modal) return;

  document.getElementById('map-prop-id').value = m.id;
  document.getElementById('map-prop-name').value = m.name || (targetId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root") && Workstation.activeTopology && Workstation.activeTopology.name) || '';
  document.getElementById('map-prop-scale').value = m.scaleTier || 'region';
  document.getElementById('map-prop-notes').value = m.customNotes || '';

  // Node Prefix Code
  const prefixInput = document.getElementById('map-prop-prefix');
  if (prefixInput) {
    prefixInput.value = m.nodePrefix !== undefined ? m.nodePrefix : getMapNodePrefix(targetId);
  }

  // Dimensional Map Scale
  const currentScale = (typeof getMapScale === "function") ? getMapScale(targetId) : { value: 5, unit: "miles", pixels: 20 };
  const scalePxInput = document.getElementById('map-prop-scale-pixels');
  const scaleDistInput = document.getElementById('map-prop-scale-dist');
  const scaleUnitSelect = document.getElementById('map-prop-scale-unit');
  if (scalePxInput) scalePxInput.value = currentScale.pixels;
  if (scaleDistInput) scaleDistInput.value = currentScale.value;
  if (scaleUnitSelect) scaleUnitSelect.value = currentScale.unit;

  // Populate Parent Map Selector
  const parentSel = document.getElementById('map-prop-parent');
  if (parentSel) {
    parentSel.innerHTML = `<option value="none">None (Root / Standalone Map)</option>`;
    if (typeof maps !== "undefined") {
      Object.keys(maps).forEach(k => {
        if (k !== m.id) {
          const other = maps[k];
          parentSel.innerHTML += `<option value="${escapeAttr(other.id)}" ${other.id === m.parentMapId ? 'selected' : ''}>${escapeHtml(other.name)} (${escapeHtml(other.scaleTier)})</option>`;
        }
      });
    }
  }

  // Populate Parent Node Options for the selected parent map
  updateMapPropParentNodeOptions(m.parentNodeId);

  // Overall Disposition Modifier
  const dispSel = document.getElementById('map-prop-disposition');
  if (dispSel) {
    dispSel.value = m.dispositionModifier || "";
  }

  // Map Image status & opacity
  const imgStatus = document.getElementById('map-prop-image-status');
  const opSlider = document.getElementById('map-prop-opacity');
  const opVal = document.getElementById('map-prop-opacity-val');
  const meta = m.mapMetadata;
  if (meta && (meta.dataUrl || meta.name)) {
    if (imgStatus) imgStatus.innerHTML = `<span style="color:#000080; font-weight:bold;">Custom Image:</span> ${escapeHtml(meta.name || 'image')} (${escapeHtml(meta.width || 1920)}x${escapeHtml(meta.height || 1080)})`;
    const pct = Math.round((meta.opacity !== undefined ? meta.opacity : 0.85) * 100);
    if (opSlider) opSlider.value = pct;
    if (opVal) opVal.textContent = `${pct}%`;
  } else {
    if (imgStatus) imgStatus.innerHTML = `<span style="color:#666;">No background image loaded (Tactical CAD Grid active).</span>`;
    if (opSlider) opSlider.value = 85;
    if (opVal) opVal.textContent = `85%`;
  }

  // Delete button logic (cannot delete root map)
  const delBtn = document.getElementById('btn-delete-map-prop');
  if (delBtn) {
    delBtn.style.display = (m.id === 'map_root') ? 'none' : 'inline-block';
  }

  modal.classList.remove('hidden');
}

/**
 * Dynamically populate Parent Node options in Map Properties dialog
 */
function updateMapPropParentNodeOptions(selectedNodeId) {
  const parentSel = document.getElementById('map-prop-parent');
  const nodeSel = document.getElementById('map-prop-parent-node');
  if (!parentSel || !nodeSel) return;

  const parentMapId = parentSel.value;
  nodeSel.innerHTML = `<option value="none">(No specific node anchor)</option>`;

  if (parentMapId !== 'none' && typeof maps !== 'undefined' && maps[parentMapId]) {
    const parentMap = maps[parentMapId];
    // Gather candidate nodes from parentMap.nodes or live nodes if parent is active
    let parentNodes = [];
    if (parentMapId === (typeof activeMapId !== 'undefined' ? activeMapId : 'map_root') && Workstation.activeTopology && Workstation.activeTopology.nodes) {
      parentNodes = Object.keys(Workstation.activeTopology.nodes).map(k => Workstation.activeTopology.nodes[k]);
    } else if (Array.isArray(parentMap.nodes)) {
      parentNodes = parentMap.nodes;
    }

    parentNodes.forEach(n => {
      const nid = n.id;
      const isSelected = (selectedNodeId !== undefined && selectedNodeId !== null && String(selectedNodeId) === String(nid));
      nodeSel.innerHTML += `<option value="${escapeAttr(nid)}" ${isSelected ? 'selected' : ''}>Node ${escapeHtml(nid)}: ${escapeHtml(n.name || `#${nid}`)}</option>`;
    });
  }
}

/**
 * Save edits from Map & Layout Properties dialog
 */
function saveMapProperties() {
  const mapId = document.getElementById('map-prop-id').value;
  if (!mapId || typeof maps === "undefined" || !maps[mapId]) return;

  const m = maps[mapId];
  m.name = document.getElementById('map-prop-name').value.trim() || m.name;
  m.scaleTier = document.getElementById('map-prop-scale').value || m.scaleTier;
  m.customNotes = document.getElementById('map-prop-notes').value || '';
  
  const prefixInput = document.getElementById('map-prop-prefix');
  if (prefixInput) {
    m.nodePrefix = prefixInput.value.trim();
  }

  const oldParentMapId = m.parentMapId;
  const oldParentNodeId = m.parentNodeId;

  const parentVal = document.getElementById('map-prop-parent').value;
  m.parentMapId = (parentVal === 'none' || !parentVal) ? null : parentVal;

  const nodeVal = document.getElementById('map-prop-parent-node') ? document.getElementById('map-prop-parent-node').value : 'none';
  m.parentNodeId = (nodeVal === 'none' || !nodeVal || !m.parentMapId) ? null : nodeVal;

  // Unlink previous parent node if changed
  if (oldParentMapId && oldParentNodeId !== null && (oldParentMapId !== m.parentMapId || String(oldParentNodeId) !== String(m.parentNodeId))) {
    if (maps[oldParentMapId] && Array.isArray(maps[oldParentMapId].nodes)) {
      const prevNode = maps[oldParentMapId].nodes.find(n => String(n.id) === String(oldParentNodeId));
      if (prevNode && prevNode.childMapId === mapId) delete prevNode.childMapId;
    }
  }

  // Link new parent node
  if (m.parentMapId && m.parentNodeId !== null && maps[m.parentMapId]) {
    if (Array.isArray(maps[m.parentMapId].nodes)) {
      const parentNode = maps[m.parentMapId].nodes.find(n => String(n.id) === String(m.parentNodeId));
      if (parentNode) parentNode.childMapId = mapId;
    }
    if (m.parentMapId === activeMapId && Workstation.activeTopology && Workstation.activeTopology.nodes) {
      const liveNode = Workstation.activeTopology.nodes[String(m.parentNodeId)];
      if (liveNode) liveNode.childMapId = mapId;
    }
  }

  // Save Overall Disposition Modifier
  const dispSel = document.getElementById('map-prop-disposition');
  if (dispSel) {
    m.dispositionModifier = dispSel.value || "";
  }

  const scaleDistEl = document.getElementById('map-prop-scale-dist');
  const scaleUnitEl = document.getElementById('map-prop-scale-unit');
  const scalePxEl = document.getElementById('map-prop-scale-pixels');
  if (scaleDistEl && scaleUnitEl) {
    m.mapScale = {
      value: parseFloat(scaleDistEl.value) || 5,
      unit: scaleUnitEl.value || "miles",
      pixels: parseFloat(scalePxEl ? scalePxEl.value : 20) || 20
    };
  }

  const opVal = parseInt(document.getElementById('map-prop-opacity').value) || 85;
  if (m.mapMetadata) {
    m.mapMetadata.opacity = opVal / 100;
  }
  if (mapId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root")) {
    if (typeof Workstation !== "undefined" && Workstation.activeTopology) {
      if (m.name) Workstation.activeTopology.name = m.name;
      if (m.scaleTier) Workstation.activeTopology.scaleTier = m.scaleTier;
      if (m.customNotes !== undefined) Workstation.activeTopology.customNotes = m.customNotes;
    }
    updateMapOpacity(opVal);
  }

  if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();
  if (typeof saveActiveCampaign === "function") saveActiveCampaign();
  renderLayoutTabs();
  if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
  if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
  if (typeof updateObjectSelector === "function") updateObjectSelector();
  if (typeof updateStatusBar === "function") updateStatusBar();
  if (typeof renderCanvas === "function") renderCanvas();
  if (typeof renderMapNavigatorList === "function") renderMapNavigatorList();

  closeModal('modal-map-properties');
  const dispDesc = m.dispositionModifier ? ` | Disposition: "${m.dispositionModifier}"` : '';
  const anchorDesc = m.parentNodeId ? ` | Parent Node: #${m.parentNodeId}` : '';
  setStatusBarMessage(`Updated properties for map: "${m.name}" [Prefix: "${m.nodePrefix || '(None)'}"${anchorDesc}${dispDesc}].`);
}

/**
 * Delete active map from properties dialog
 */
function deleteCurrentMapFromProp() {
  const mapId = document.getElementById('map-prop-id') ? document.getElementById('map-prop-id').value : null;
  if (!mapId) return;
  closeModal('modal-map-properties');
  if (typeof deleteMap === "function") {
    deleteMap(mapId);
  }
}

/**
 * Open the Create New Map dialog
 */
function openNewMapModal() {
  const modal = document.getElementById('modal-new-map');
  if (!modal) return;

  const parentSel = document.getElementById('new-map-dialog-parent');
  if (parentSel && typeof maps !== "undefined") {
    parentSel.innerHTML = `<option value="none">Standalone Root (No Parent)</option>`;
    Object.keys(maps).forEach(k => {
      const m = maps[k];
      const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier]) ? SCALE_TIERS[m.scaleTier] : { icon: "🗺️" };
      parentSel.innerHTML += `<option value="${escapeAttr(m.id)}" ${m.id === activeMapId ? 'selected' : ''}>Child of: ${tier.icon} ${escapeHtml(m.name)}</option>`;
    });
  }

  const nameInput = document.getElementById('new-map-dialog-name');
  if (nameInput) {
    const sel = Workstation.selectedEntity;
    nameInput.value = (sel && sel.type === 'node') ? `District of Node ${sel.id}` : "New Campaign Map";
  }

  const prefixInput = document.getElementById('new-map-dialog-prefix');
  if (prefixInput && nameInput) {
    delete prefixInput.dataset.userEdited;
    prefixInput.value = generateDefaultPrefix(nameInput.value);
  }

  const fileInput = document.getElementById('new-map-dialog-image');
  if (fileInput) fileInput.value = '';

  modal.classList.remove('hidden');
  updateNewMapParentNodeOptions();
}

/**
 * Dynamically populate Parent Node options in Create New Map dialog
 */
function updateNewMapParentNodeOptions() {
  const parentSel = document.getElementById('new-map-dialog-parent');
  const nodeSel = document.getElementById('new-map-dialog-parent-node');
  if (!parentSel || !nodeSel) return;

  const parentMapId = parentSel.value;
  nodeSel.innerHTML = `<option value="none">(No specific node anchor)</option>`;

  if (parentMapId !== 'none' && typeof maps !== 'undefined' && maps[parentMapId]) {
    const parentMap = maps[parentMapId];
    let parentNodes = [];
    if (parentMapId === (typeof activeMapId !== 'undefined' ? activeMapId : 'map_root') && Workstation.activeTopology && Workstation.activeTopology.nodes) {
      parentNodes = Object.keys(Workstation.activeTopology.nodes).map(k => Workstation.activeTopology.nodes[k]);
    } else if (Array.isArray(parentMap.nodes)) {
      parentNodes = parentMap.nodes;
    }

    const sel = Workstation.selectedEntity;
    const preselectedId = (sel && sel.type === 'node' && parentMapId === activeMapId) ? sel.id : null;

    parentNodes.forEach(n => {
      const nid = n.id;
      const isSelected = (preselectedId !== null && String(preselectedId) === String(nid));
      nodeSel.innerHTML += `<option value="${escapeAttr(nid)}" ${isSelected ? 'selected' : ''}>Node ${escapeHtml(nid)}: ${escapeHtml(n.name || `#${nid}`)}</option>`;
    });
  }
}

/**
 * Submit Create New Map dialog
 */
function submitNewMapDialog() {
  const nameInput = document.getElementById('new-map-dialog-name');
  const scaleSelect = document.getElementById('new-map-dialog-scale');
  const parentSelect = document.getElementById('new-map-dialog-parent');
  const parentNodeSelect = document.getElementById('new-map-dialog-parent-node');
  const dispSelect = document.getElementById('new-map-dialog-disposition');
  const fileInput = document.getElementById('new-map-dialog-image');
  const prefixInput = document.getElementById('new-map-dialog-prefix');

  const name = nameInput ? nameInput.value.trim() : "New Campaign Map";
  const scale = scaleSelect ? scaleSelect.value : "district";
  const parentVal = parentSelect ? parentSelect.value : "none";
  const parentMapId = (parentVal === "none" || !parentVal) ? null : parentVal;
  const nodePrefix = prefixInput ? prefixInput.value.trim() : generateDefaultPrefix(name);

  let parentNodeId = null;
  const pNodeVal = parentNodeSelect ? parentNodeSelect.value : "none";
  if (pNodeVal !== "none" && pNodeVal && parentMapId) {
    parentNodeId = pNodeVal;
  } else {
    const sel = Workstation.selectedEntity;
    if (sel && sel.type === 'node' && parentMapId === activeMapId) {
      parentNodeId = sel.id;
    }
  }

  const dispositionModifier = dispSelect ? dispSelect.value : "";

  let newMap;
  if (typeof createMap === "function") {
    newMap = createMap(name, scale, parentMapId, parentNodeId, nodePrefix, dispositionModifier);
  } else {
    const id = "map_" + Date.now().toString(36);
    newMap = { id, name, nodePrefix, scaleTier: scale, parentMapId, parentNodeId, dispositionModifier, nodes: [], links: [] };
    if (typeof maps !== "undefined") maps[id] = newMap;
  }

  closeModal('modal-new-map');

  // If user selected an image directly in the dialog, ingest it for the new map!
  const file = fileInput && fileInput.files && fileInput.files[0];
  if (file && typeof handleMapFileIngestion === "function") {
    handleMapFileIngestion(file, newMap.id);
  }

  // Switch to new map
  if (typeof switchActiveMap === "function") {
    switchActiveMap(newMap.id);
  }
  if (typeof renderLayoutTabs === "function") renderLayoutTabs();
  setStatusBarMessage(`Created and opened new map: "${newMap.name}" [${newMap.scaleTier.toUpperCase()} - Prefix: "${newMap.nodePrefix || '(None)'}"]. Ready to place nodes!`);
}

// ============================================================================
// SUB-MAP NODE CODE PREFIX ENGINE
// ============================================================================

/**
 * Generates a clean default node prefix code from a map's name (e.g. "Outpost" -> "O-", "Castle District" -> "CD-")
 */
function generateDefaultPrefix(mapName) {
  if (!mapName || mapName.toLowerCase().includes("root")) return "";
  const words = mapName.trim().split(/\s+|-|_/).filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase() + "-";
  }
  if (words.length === 1) {
    return (words[0].length >= 3 ? words[0].slice(0, 2) : words[0][0]).toUpperCase() + "-";
  }
  return "";
}

/**
 * Live autocomplete callback for Create New Map dialog
 */
function autoSuggestNodePrefix(mapName) {
  const prefixInput = document.getElementById('new-map-dialog-prefix');
  if (prefixInput && (!prefixInput.dataset.userEdited || prefixInput.value === '')) {
    prefixInput.value = generateDefaultPrefix(mapName);
  }
}

/**
 * Gets the configured or generated node prefix code for a map
 */
function getMapNodePrefix(mapId) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  if (targetId === "map_root") {
    return (typeof maps !== "undefined" && maps[targetId] && maps[targetId].nodePrefix) || "";
  }
  const m = (typeof maps !== "undefined" && maps[targetId]) ? maps[targetId] : null;
  if (m && m.nodePrefix !== undefined && m.nodePrefix !== null) {
    return m.nodePrefix;
  }
  if (m && m.name) {
    return generateDefaultPrefix(m.name);
  }
  return "";
}

// ============================================================================
// DIMENSIONAL MAP SCALE & CARTOGRAPHIC UNITS ENGINE
// ============================================================================

const SCALE_TIER_DEFAULTS = {
  cosmic: { value: 100, unit: "lightyears", pixels: 20 },
  continent: { value: 25, unit: "miles", pixels: 20 },
  region: { value: 5, unit: "miles", pixels: 20 },
  settlement: { value: 500, unit: "feet", pixels: 20 },
  district: { value: 100, unit: "feet", pixels: 20 },
  building: { value: 10, unit: "feet", pixels: 20 },
  floorplan: { value: 5, unit: "feet", pixels: 20 }
};

/**
 * Retrieves the dimensional scale config for a given map (or active map)
 */
function getMapScale(mapId) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  const m = (typeof maps !== "undefined" && maps[targetId]) ? maps[targetId] : null;
  if (m && m.mapScale && m.mapScale.value) {
    return {
      value: parseFloat(m.mapScale.value) || 5,
      unit: m.mapScale.unit || "miles",
      pixels: parseFloat(m.mapScale.pixels) || 20
    };
  }
  const tier = (m && m.scaleTier) ? m.scaleTier : "region";
  return SCALE_TIER_DEFAULTS[tier] || { value: 5, unit: "miles", pixels: 20 };
}

/**
 * Returns a human-friendly string of the scale (e.g. "1 sq = 5 mi")
 */
function getActiveMapScaleSummary(mapId) {
  const scale = getMapScale(mapId);
  const u = scale.unit === "miles" ? "mi" : (scale.unit === "feet" ? "ft" : (scale.unit === "kilometers" ? "km" : scale.unit));
  return `1 sq = ${scale.value} ${u}`;
}

/**
 * Formats a pixel length into real-world cartographic units (e.g. 180 px -> "45.0 mi")
 */
function formatDistance(pixels, mapId) {
  const scale = getMapScale(mapId);
  const pxPerGrid = scale.pixels || 20;
  const gridCells = pixels / pxPerGrid;
  const dist = gridCells * scale.value;
  let formatted = dist >= 100 ? Math.round(dist).toString() : (dist >= 10 ? dist.toFixed(1) : dist.toFixed(2));
  if (formatted.endsWith('.00')) formatted = formatted.slice(0, -3);
  else if (formatted.endsWith('.0')) formatted = formatted.slice(0, -2);
  const u = scale.unit === "miles" ? "mi" : (scale.unit === "feet" ? "ft" : (scale.unit === "kilometers" ? "km" : scale.unit));
  return `${formatted} ${u}`;
}

/**
 * Set scale for a specific map
 */
function setMapScale(mapId, value, unit, pixels) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  if (typeof maps !== "undefined" && maps[targetId]) {
    maps[targetId].mapScale = {
      value: parseFloat(value) || 5,
      unit: unit || "miles",
      pixels: parseFloat(pixels) || 20
    };
    if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();
  }
  renderLayoutTabs();
  if (typeof updateStatusBar === "function") updateStatusBar();
  if (typeof renderPropertyGrid === "function") renderPropertyGrid();
}

/**
 * Opens the Set Map Scale & Units modal
 */
function openSetMapScaleDialog(mapId) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  const m = (typeof maps !== "undefined" && maps[targetId]) ? maps[targetId] : { name: "Active Map" };
  const scale = getMapScale(targetId);

  const modal = document.getElementById('modal-map-scale');
  if (!modal) return;

  const targetHidden = document.getElementById('scale-dialog-target-map');
  if (targetHidden) targetHidden.value = targetId;
  const nameEl = document.getElementById('scale-dialog-map-name');
  if (nameEl) nameEl.textContent = m.name || targetId;

  const valInput = document.getElementById('scale-dialog-value');
  const unitSelect = document.getElementById('scale-dialog-unit');
  const pxInput = document.getElementById('scale-dialog-pixels');

  if (valInput) valInput.value = scale.value;
  if (unitSelect) unitSelect.value = scale.unit;
  if (pxInput) pxInput.value = scale.pixels;

  updateScalePreview();

  // Attach live preview listener if not already
  if (valInput) valInput.oninput = updateScalePreview;
  if (unitSelect) unitSelect.onchange = updateScalePreview;
  if (pxInput) pxInput.oninput = updateScalePreview;

  modal.classList.remove('hidden');
}

/**
 * Updates live preview text in the scale modal
 */
function updateScalePreview() {
  const valEl = document.getElementById('scale-dialog-value');
  const unitEl = document.getElementById('scale-dialog-unit');
  const pxEl = document.getElementById('scale-dialog-pixels');
  const preview = document.getElementById('scale-dialog-preview');
  if (!preview) return;

  const val = parseFloat(valEl ? valEl.value : 5) || 1;
  const unit = (unitEl ? unitEl.value : "miles") || "miles";
  const px = parseFloat(pxEl ? pxEl.value : 20) || 20;
  const u = unit === "miles" ? "miles" : (unit === "feet" ? "feet" : unit);
  const dist100 = (100 / px) * val;
  preview.innerHTML = `Preview: A 100px corridor edge will measure <strong>${dist100.toFixed(1)} ${u}</strong> (Grid cell = ${px}px = ${val} ${u}).`;
}

/**
 * Apply one of the quick scale presets
 */
function applyScalePreset(val, unit, px) {
  const v = document.getElementById('scale-dialog-value');
  const u = document.getElementById('scale-dialog-unit');
  const p = document.getElementById('scale-dialog-pixels');
  if (v) v.value = val;
  if (u) u.value = unit;
  if (p) p.value = px || 20;
  updateScalePreview();
}

/**
 * Save scale settings from modal
 */
function saveMapScaleDialog() {
  const targetId = document.getElementById('scale-dialog-target-map').value || activeMapId;
  const val = parseFloat(document.getElementById('scale-dialog-value').value) || 5;
  const unit = document.getElementById('scale-dialog-unit').value || "miles";
  const px = parseFloat(document.getElementById('scale-dialog-pixels').value) || 20;

  setMapScale(targetId, val, unit, px);
  closeModal('modal-map-scale');
  setStatusBarMessage(`Updated scale for map "${(maps && maps[targetId] && maps[targetId].name) || targetId}": 1 sq (${px}px) = ${val} ${unit}.`);
}
