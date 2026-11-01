// ============================================================================
// CREATOR STUDIO: HIERARCHICAL MAP NAVIGATOR & BREADCRUMB HUD (ZERO-CORS OFFLINE)
// ============================================================================
// Manages multi-scale cartography, breadcrumbs, map tree hierarchy, and drill-downs.

/**
 * Updates the floating breadcrumb HUD above the canvas viewport (Legacy container fallback)
 */
function updateLegacyNavigatorBreadcrumbsHUD() {
  const container = document.getElementById("canvas-breadcrumbs-hud");
  if (!container) return;

  if (typeof maps === "undefined" || !maps || Object.keys(maps).length === 0) {
    container.classList.add("hidden");
    return;
  }
  container.classList.remove("hidden");

  const path = (typeof getBreadcrumbPath === "function") 
    ? getBreadcrumbPath(activeMapId) 
    : [{ id: activeMapId, name: getActiveMapName(), scaleTier: getActiveMapScaleTier() }];

  const currentMap = maps[activeMapId] || { id: activeMapId, name: getActiveMapName(), scaleTier: "region" };
  const currentScale = SCALE_TIERS[currentMap.scaleTier] || { label: "Region", icon: "🌲" };
  const hasParent = !!currentMap.parentMapId;
  const totalMaps = Object.keys(maps).length;

  container.innerHTML = `
    <!-- Lineage Trail -->
    <div class="flex items-center gap-1.5 overflow-x-auto max-w-md py-0.5 scrollbar-none">
      ${path.map((step, idx) => {
        const isLast = (idx === path.length - 1);
        const tier = SCALE_TIERS[step.scaleTier] || { icon: "🗺️", label: "Map" };
        return `
          <button onclick="switchActiveMap('${step.id}')" 
            class="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition ${isLast ? 'bg-sky-950 text-sky-200 border border-sky-700/80 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}"
            title="${tier.label}: ${step.name}">
            <span>${tier.icon}</span>
            <span class="truncate max-w-[110px]">${step.name}</span>
          </button>
          ${!isLast ? '<span class="text-slate-600 text-[10px] font-bold">&gt;</span>' : ''}
        `;
      }).join('')}
    </div>

    <div class="h-4 w-px bg-slate-700 mx-1"></div>

    <!-- Active Scale Tag -->
    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-sky-400 border border-slate-800 shrink-0 flex items-center gap-1">
      <span>${currentScale.icon}</span>
      <span>${currentScale.label.split(' / ')[0]}</span>
    </span>

    <!-- Up / Ascend Button (if in a sub-map) -->
    ${hasParent ? `
      <button onclick="switchActiveMap('${currentMap.parentMapId}')" 
        class="px-2 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-700/80 text-amber-300 font-bold text-xs transition flex items-center gap-1 shrink-0 shadow-sm"
        title="Ascend to parent map (Shortcut: ESC)">
        <span>⬆️</span>
        <span>Up</span>
      </button>
    ` : ''}

    <!-- Map Tree Navigator Modal Button -->
    <button onclick="openMapNavigatorModal()" 
      class="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition shrink-0 shadow-sm"
      title="Open Map Hierarchy & Pointcrawl Navigator">
      <span>🗺️</span>
      <span>Maps (${totalMaps})</span>
    </button>
  `;
}

/**
 * Open the Map Navigator & Hierarchy Tree modal
 */
function openMapNavigatorModal() {
  if (typeof MDIWindowManager !== "undefined") {
    MDIWindowManager.open('modal-map-navigator');
  } else {
    const modal = document.getElementById("modal-map-navigator") || document.getElementById("map-navigator-modal");
    if (modal) modal.classList.remove("hidden");
  }
  renderMapNavigatorList();
}

/**
 * Close the Map Navigator modal
 */
function closeMapNavigatorModal() {
  if (typeof MDIWindowManager !== "undefined") {
    MDIWindowManager.close('modal-map-navigator');
  } else {
    const modal = document.getElementById("modal-map-navigator") || document.getElementById("map-navigator-modal");
    if (modal) modal.classList.add("hidden");
  }
  hideCreateMapForm();
}

/**
 * Renders the hierarchical tree and unattached maps inside the modal
 */
function renderMapNavigatorList() {
  const container = document.getElementById("map-nav-tree-container") || document.getElementById("map-navigator-list");
  if (!container || typeof maps === "undefined") return;

  const mapKeys = Object.keys(maps);
  if (mapKeys.length === 0) {
    container.innerHTML = `<div style="padding:12px; text-align:center; color:#64748b; font-style:italic;">No maps in campaign.</div>`;
    return;
  }

  // Find root maps (parentMapId === null)
  const roots = mapKeys.filter(k => !maps[k].parentMapId);
  const childrenMap = {};
  mapKeys.forEach(k => {
    const pId = maps[k].parentMapId;
    if (pId) {
      if (!childrenMap[pId]) childrenMap[pId] = [];
      childrenMap[pId].push(k);
    }
  });

  function renderMapCard(mapId, depth = 0) {
    const m = maps[mapId];
    if (!m) return "";
    const isCur = (mapId === activeMapId);
    const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier])
      ? SCALE_TIERS[m.scaleTier]
      : { label: "Region", icon: "🌲" };
    const nodeCount = (m.nodes || []).length;
    const linkCount = (m.links || []).length;
    const hasImg = !!(m.mapMetadata && (m.mapMetadata.dataUrl || m.mapMetadata.url || m.mapMetadata.assetPath));
    const childIds = childrenMap[mapId] || [];

    return `
      <div style="margin-left:${depth * 20}px; margin-bottom:6px;">
        <div class="bevel-outset" style="padding:6px 8px; background:${isCur ? '#e0f2fe' : '#f8fafc'}; border:1px solid ${isCur ? '#000080' : '#cbd5e1'}; display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">${hasImg ? '🖼️' : tier.icon}</span>
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <strong style="font-size:11px; color:#000080;">${m.name}</strong>
                <span style="font-size:9px; background:#000080; color:#fff; padding:1px 4px; border-radius:2px; font-weight:bold;">${tier.label.toUpperCase()}</span>
                ${isCur ? '<span style="font-size:9px; background:#16a34a; color:#fff; padding:1px 4px; border-radius:2px; font-weight:bold;">ACTIVE VIEW</span>' : ''}
                ${m.parentMapId === null ? '<span style="font-size:9px; background:#e2e8f0; color:#475569; padding:1px 3px; border-radius:2px;">Root</span>' : ''}
              </div>
              <div style="display:flex; align-items:center; gap:8px; font-size:10px; color:#64748b; margin-top:2px;">
                <span>📍 ${nodeCount} Nodes</span>
                <span>🛤️ ${linkCount} Corridors</span>
                <span>${hasImg ? '🖼️ Custom Image (' + (m.mapMetadata.width || 1920) + 'x' + (m.mapMetadata.height || 1080) + ')' : '📐 Tactical CAD Grid'}</span>
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:4px;">
            ${!isCur ? `
              <button onclick="switchActiveMap('${m.id}'); closeMapNavigatorModal();" class="win-btn" style="font-size:10px; font-weight:bold; padding:2px 8px;">
                Switch &rarr;
              </button>
            ` : `
              <span style="font-size:10px; color:#16a34a; font-weight:bold; padding:2px 6px;">[Active]</span>
            `}

            <button onclick="openMapPropertiesDialog('${m.id}')" class="win-btn" style="font-size:10px; padding:2px 6px;" title="Edit Map Properties (Name, Scale, Notes)">
              Properties...
            </button>

            <button onclick="triggerMapImageUpload('${m.id}')" class="win-btn" style="font-size:10px; padding:2px 6px;" title="Insert or Replace Background Map Image">
              ${hasImg ? 'Change Image...' : '+ Map Image'}
            </button>

            <button onclick="deleteMap('${m.id}'); renderMapNavigatorList();" class="win-btn" style="font-size:10px; color:#b91c1c; padding:2px 5px;" title="Delete / Reset Map">
              ✕
            </button>
          </div>
        </div>

        <!-- Render Children -->
        ${childIds.map(cId => renderMapCard(cId, depth + 1)).join('')}
      </div>
    `;
  }

  container.innerHTML = roots.map(rId => renderMapCard(rId, 0)).join('');
}

function showCreateMapForm() {
  const form = document.getElementById("create-map-inline-form");
  const parentSelect = document.getElementById("new-map-parent");
  if (parentSelect && typeof maps !== "undefined") {
    parentSelect.innerHTML = `<option value="none">Standalone Root (No Parent)</option>`;
    Object.keys(maps).forEach(k => {
      const m = maps[k];
      const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier]) ? SCALE_TIERS[m.scaleTier] : { icon: "🗺️" };
      parentSelect.innerHTML += `<option value="${escapeAttr(m.id)}" ${m.id === activeMapId ? 'selected' : ''}>Child of: ${tier.icon} ${escapeHtml(m.name)}</option>`;
    });
  }
  if (form) form.classList.remove("hidden");
}

function hideCreateMapForm() {
  const form = document.getElementById("create-map-inline-form");
  if (form) form.classList.add("hidden");
}

function submitCreateNewMap() {
  const nameInput = document.getElementById("new-map-name");
  const scaleSelect = document.getElementById("new-map-scale");
  const parentSelect = document.getElementById("new-map-parent");

  const name = nameInput ? nameInput.value.trim() : "New Campaign Map";
  const scale = scaleSelect ? scaleSelect.value : "region";
  const parentVal = parentSelect ? parentSelect.value : "none";

  const parentMapId = (parentVal === "none" || !parentVal) ? null : parentVal;

  const newMap = createMap(name, scale, parentMapId);
  if (nameInput) nameInput.value = "";
  hideCreateMapForm();
  renderMapNavigatorList();
  
  if (confirm(`Map "${newMap.name}" created! Would you like to switch to it now?`)) {
    switchActiveMap(newMap.id);
    closeMapNavigatorModal();
  }
}

/**
 * Prompt user from Node Inspector to create a child sub-map
 */
function promptCreateChildMapForNode(nid) {
  const node = getNode(nid);
  if (!node) return;

  const nodeName = node.name || `Node #${node.id}`;
  const mapName = prompt(`Enter name for child sub-map attached to "${nodeName}":`, `${nodeName} Interior`);
  if (!mapName) return;

  // Derive logical sub-scale
  const curScale = getActiveMapScaleTier();
  let defaultSubScale = "building";
  if (curScale === "continent" || curScale === "cosmic") defaultSubScale = "region";
  else if (curScale === "region") defaultSubScale = "settlement";
  else if (curScale === "settlement") defaultSubScale = "district";
  else if (curScale === "district" || curScale === "building") defaultSubScale = "floorplan";

  const newMap = createMap(mapName, defaultSubScale, activeMapId, nid);
  attachChildMapToNode(nid, newMap.id);

  if (confirm(`Sub-map "${newMap.name}" created and attached to ${nodeName}! Dive into it now?`)) {
    drillDownToChildMap(newMap.id);
  }
}

/**
 * Prompt user from Node Inspector to link an existing unattached map
 */
function promptLinkExistingMapToNode(nid) {
  const node = getNode(nid);
  if (!node || typeof maps === "undefined") return;

  const candidates = Object.values(maps).filter(m => m.id !== activeMapId && m.parentMapId === null);
  if (candidates.length === 0) {
    alert("No standalone or unattached maps available to link. Use 'Create New Sub-Map' instead.");
    return;
  }

  const options = candidates.map((m, i) => `${i + 1}: ${m.name} (${m.scaleTier})`).join('\n');
  const pick = prompt(`Select an existing map to link to this node:\n${options}\n\nEnter number (1-${candidates.length}):`);
  const idx = parseInt(pick) - 1;

  if (!isNaN(idx) && candidates[idx]) {
    attachChildMapToNode(nid, candidates[idx].id);
  }
}

/**
 * Update custom lore & notes on a node and rebuild the wiki index
 */
function updateNodeLore(nid, text) {
  const node = getNode(nid);
  if (!node) return;
  node.customNotes = text;
  syncActiveMapToRegistry();
  if (typeof buildWikiIndex === "function") buildWikiIndex();
}
