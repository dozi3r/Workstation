// ============================================================================
// CREATOR STUDIO: UNIFIED MULTI-MAP REGISTRY & SCALE-FLUID CARTOGRAPHY
// ============================================================================
// Authoritative multi-map data model, scale tiers, and bidirectional sync adapter.

const SCALE_TIERS = {
  cosmic:     { label: "Cosmic / Planar",        icon: "🌌", defaultRadius: 22 },
  continent:  { label: "Continental / Planetary", icon: "🌐", defaultRadius: 18 },
  region:     { label: "Regional Pointcrawl",    icon: "🗺️", defaultRadius: 14 },
  settlement: { label: "Settlement / City",      icon: "🏘️", defaultRadius: 13 },
  district:   { label: "District / City Ward",   icon: "🏛️", defaultRadius: 12 },
  site:       { label: "Site / Complex",         icon: "🏰", defaultRadius: 10 },
  building:   { label: "Building / Dungeon",     icon: "🚪", defaultRadius: 9 },
  chamber:    { label: "Chamber / Room Level",   icon: "🗝️", defaultRadius: 8 },
  floorplan:  { label: "Floorplan / Interior",   icon: "📐", defaultRadius: 8 }
};

let activeMapId = "map_root";
let maps = {};
let activeCampaignId = (typeof CAMPAIGN_REGISTRY !== "undefined" && Object.keys(CAMPAIGN_REGISTRY)[0]) || "emerald_isle";
let currentCampaignName = (typeof CAMPAIGN_REGISTRY !== "undefined" && CAMPAIGN_REGISTRY[activeCampaignId]?.metadata?.name) || "Emerald Isle";

if (typeof window.getNodeDisplayName !== "function") {
  window.getNodeDisplayName = function(n) {
    if (!n) return "Unknown Node";
    return n.name || n.label || ("Node " + (n.id !== undefined ? n.id : "?"));
  };
}

// Topology & Slotting State mirroring
let nodes = [];
let links = [];
let waves = [];
let drawnCards = {};
let nodeSlottedModules = {};
let edgeSlottedModules = {};
let revealedNodes = {};
let fogOfWarMode = false;

/**
 * Initialize or synchronize maps registry from active global state
 */
function initMapsRegistry(forceReset = false) {
  if (!forceReset) {
    const savedMapsStr = localStorage.getItem("creator_studio_maps_registry");
    if (savedMapsStr) {
      try {
        const parsed = JSON.parse(savedMapsStr);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          maps = parsed;
          const savedActiveId = localStorage.getItem("creator_studio_active_map_id");
          const defaultKey = maps["map_root"] ? "map_root" : Object.keys(maps)[0];
          activeMapId = (savedActiveId && maps[savedActiveId]) ? savedActiveId : defaultKey;
          if (typeof renderLayoutTabs === "function") renderLayoutTabs();
          if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
          return;
        }
      } catch (e) {
        console.warn("[MapsRegistry] Failed to load maps registry from localStorage:", e);
      }
    }
  }

  const hasValidMaps = maps && typeof maps === "object" && Object.keys(maps).length > 0;
  if (forceReset || !hasValidMaps) {
    maps = {};
    if ((!nodes || nodes.length === 0) && typeof syncAdapterFromWorkstationTopology === "function") {
      syncAdapterFromWorkstationTopology();
    }
    const rootName = (Workstation.activeTopology && Workstation.activeTopology.name) || currentCampaignName || "Root Map";
    const rootId = (Workstation.activeTopology && (Workstation.activeTopology.rootMapId || Workstation.activeTopology.activeMapId)) || "map_root";
    maps[rootId] = {
      id: rootId,
      name: rootName,
      nodePrefix: "",
      scaleTier: "region",
      parentMapId: null,
      parentNodeId: null,
      dispositionModifier: "",
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links)),
      waves: JSON.parse(JSON.stringify(waves)),
      drawnCards: JSON.parse(JSON.stringify(drawnCards)),
      nodeSlottedModules: JSON.parse(JSON.stringify(nodeSlottedModules)),
      edgeSlottedModules: JSON.parse(JSON.stringify(edgeSlottedModules)),
      revealedNodes: JSON.parse(JSON.stringify(revealedNodes)),
      mapMetadata: (typeof activeMapMetadata !== "undefined" && activeMapMetadata)
        ? ((typeof stripMapImageDataUrl === "function") ? stripMapImageDataUrl(activeMapMetadata) : JSON.parse(JSON.stringify(activeMapMetadata)))
        : null,
      layers: (Workstation.activeTopology && Workstation.activeTopology.layers) 
        ? JSON.parse(JSON.stringify(Workstation.activeTopology.layers)) 
        : (typeof getDefaultLayers === "function" ? getDefaultLayers() : []),
      shapes: (Workstation.activeTopology && Workstation.activeTopology.shapes) 
        ? JSON.parse(JSON.stringify(Workstation.activeTopology.shapes)) 
        : [],
      customNotes: ""
    };
    activeMapId = rootId;
  } else {
    syncActiveMapToRegistry();
  }
  if (typeof updateBreadcrumbsHUD === 'function') updateBreadcrumbsHUD();
  if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
}

/**
 * Sync active global variables into the active map record in maps registry
 */
function syncActiveMapToRegistry() {
  if (!activeMapId) activeMapId = "map_root";
  if (!maps[activeMapId]) {
    maps[activeMapId] = {
      id: activeMapId,
      name: currentCampaignName || "Custom Map",
      scaleTier: "region",
      parentMapId: null,
      parentNodeId: null,
      dispositionModifier: "",
      layers: (typeof getDefaultLayers === "function") ? getDefaultLayers() : [],
      shapes: []
    };
  }

  maps[activeMapId].nodes = JSON.parse(JSON.stringify(nodes));
  maps[activeMapId].links = JSON.parse(JSON.stringify(links));
  maps[activeMapId].waves = JSON.parse(JSON.stringify(waves));
  maps[activeMapId].drawnCards = JSON.parse(JSON.stringify(drawnCards));
  maps[activeMapId].nodeSlottedModules = JSON.parse(JSON.stringify(nodeSlottedModules));
  maps[activeMapId].edgeSlottedModules = JSON.parse(JSON.stringify(edgeSlottedModules));
  maps[activeMapId].revealedNodes = JSON.parse(JSON.stringify(revealedNodes));
  if (typeof Workstation !== "undefined" && Workstation.activeTopology) {
    if (Workstation.activeTopology.layers) {
      maps[activeMapId].layers = JSON.parse(JSON.stringify(Workstation.activeTopology.layers));
    }
    if (Workstation.activeTopology.shapes) {
      maps[activeMapId].shapes = JSON.parse(JSON.stringify(Workstation.activeTopology.shapes));
    }
    if (Workstation.activeTopology.edgeData) {
      maps[activeMapId].edgeData = JSON.parse(JSON.stringify(Workstation.activeTopology.edgeData));
    }
    if (Workstation.activeTopology.edgeNotes) {
      maps[activeMapId].edgeNotes = JSON.parse(JSON.stringify(Workstation.activeTopology.edgeNotes));
    }
    if (Workstation.activeTopology.modData) {
      maps[activeMapId].modData = JSON.parse(JSON.stringify(Workstation.activeTopology.modData));
    }
    if (Array.isArray(Workstation.activeTopology.custom_modules)) {
      maps[activeMapId].custom_modules = JSON.parse(JSON.stringify(Workstation.activeTopology.custom_modules));
    }
  }
  maps[activeMapId].mapMetadata = (typeof activeMapMetadata !== "undefined" && activeMapMetadata)
    ? ((typeof stripMapImageDataUrl === "function") ? stripMapImageDataUrl(activeMapMetadata) : JSON.parse(JSON.stringify(activeMapMetadata)))
    : (maps[activeMapId].mapMetadata ? ((typeof stripMapImageDataUrl === "function") ? stripMapImageDataUrl(maps[activeMapId].mapMetadata) : maps[activeMapId].mapMetadata) : null);
}

/**
 * Switch active cartographic map context (drill-down & ascent)
 */
async function switchActiveMap(targetMapId, force = false, options = {}) {
  if (!targetMapId || !maps[targetMapId]) {
    console.warn("[MapsRegistry] Target map not found:", targetMapId);
    return;
  }
  if (targetMapId === activeMapId && !force) return;

  // Track map switch sequence to prevent out-of-order asynchronous hydration
  window.__mapSwitchSequence = (window.__mapSwitchSequence || 0) + 1;
  const currentSeq = window.__mapSwitchSequence;

  // 1. Pack current canvas topology into current active map if switching to a different map
  const skipSync = options && options.skipSyncToRegistry;
  if (targetMapId !== activeMapId && !skipSync) {
    if (typeof syncAdapterFromWorkstationTopology === "function") {
      syncAdapterFromWorkstationTopology();
    }
    syncActiveMapToRegistry();
  }

  // Reset activeMapMetadata immediately so target map starts clean
  activeMapMetadata = null;
  // Immediately clear canvas background so prior map artwork does not linger during async fetch
  if (typeof applyMapImageToCanvas === "function") {
    applyMapImageToCanvas(null, 1000, 700);
  }

  // 2. Unpack target map record
  activeMapId = targetMapId;
  const target = maps[targetMapId];

  // Campaign entities handling:
  // If this is a fresh package load, honor the target's entities directly rather than falling back to old canvas state.
  const isPackageLoad = options && (options.skipSyncToRegistry || options.isPackageLoad);
  const targetEntities = target.entities || (target.npcs ? target : null);

  const cachedEntities = {
    npcs: (isPackageLoad && targetEntities)
      ? (targetEntities.npcs || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.npcs) && Workstation.activeTopology.npcs.length > 0)
          ? Workstation.activeTopology.npcs
          : (targetEntities && Array.isArray(targetEntities.npcs) ? targetEntities.npcs : [])),
    quests: (isPackageLoad && targetEntities)
      ? (targetEntities.quests || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.quests) && Workstation.activeTopology.quests.length > 0)
          ? Workstation.activeTopology.quests
          : (targetEntities && Array.isArray(targetEntities.quests) ? targetEntities.quests : [])),
    items: (isPackageLoad && targetEntities)
      ? (targetEntities.items || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.items) && Workstation.activeTopology.items.length > 0)
          ? Workstation.activeTopology.items
          : (targetEntities && Array.isArray(targetEntities.items) ? targetEntities.items : [])),
    trackers: (isPackageLoad && targetEntities)
      ? (targetEntities.trackers || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.trackers) && Workstation.activeTopology.trackers.length > 0)
          ? Workstation.activeTopology.trackers
          : (targetEntities && Array.isArray(targetEntities.trackers) ? targetEntities.trackers : [])),
    tickets: (isPackageLoad && targetEntities)
      ? (targetEntities.tickets || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.tickets) && Workstation.activeTopology.tickets.length > 0)
          ? Workstation.activeTopology.tickets
          : (targetEntities && Array.isArray(targetEntities.tickets) ? targetEntities.tickets : [])),
    deletedPrototypes: (isPackageLoad && targetEntities)
      ? (targetEntities.deletedPrototypes || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.deletedPrototypes))
          ? Workstation.activeTopology.deletedPrototypes
          : (targetEntities && Array.isArray(targetEntities.deletedPrototypes) ? targetEntities.deletedPrototypes : [])),
    deletedModules: (isPackageLoad && targetEntities)
      ? (targetEntities.deletedModules || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.deletedModules))
          ? Workstation.activeTopology.deletedModules
          : (targetEntities && Array.isArray(targetEntities.deletedModules) ? targetEntities.deletedModules : [])),
    custom_modules: (isPackageLoad && targetEntities)
      ? (targetEntities.custom_modules || [])
      : ((Workstation.activeTopology && Array.isArray(Workstation.activeTopology.custom_modules) && Workstation.activeTopology.custom_modules.length > 0)
          ? Workstation.activeTopology.custom_modules
          : (targetEntities && Array.isArray(targetEntities.custom_modules) ? targetEntities.custom_modules : []))
  };

  const rawTargetNodes = Array.isArray(target.nodes) 
    ? target.nodes 
    : (target.nodes && typeof target.nodes === 'object' ? Object.values(target.nodes) : []);

  nodes = rawTargetNodes.map(n => {
    const rawX = (n.coordinates && n.coordinates.x !== undefined) ? n.coordinates.x : n.x;
    const rawY = (n.coordinates && n.coordinates.y !== undefined) ? n.coordinates.y : n.y;
    const numX = Number(rawX);
    const numY = Number(rawY);
    const fx = Number.isFinite(numX) ? numX : 100;
    const fy = Number.isFinite(numY) ? numY : 100;
    return {
      ...n,
      x: fx,
      y: fy,
      coordinates: { x: fx, y: fy }
    };
  });
  links = Array.isArray(target.links) ? JSON.parse(JSON.stringify(target.links)) : [];
  waves = Array.isArray(target.waves) && target.waves.length > 0 ? JSON.parse(JSON.stringify(target.waves)) : (typeof DEFAULT_WAVES !== "undefined" ? JSON.parse(JSON.stringify(DEFAULT_WAVES)) : []);
  drawnCards = target.drawnCards ? JSON.parse(JSON.stringify(target.drawnCards)) : {};
  nodeSlottedModules = normalizeNodeSlottedModules(target.nodeSlottedModules);
  edgeSlottedModules = target.edgeSlottedModules ? JSON.parse(JSON.stringify(target.edgeSlottedModules)) : {};
  revealedNodes = target.revealedNodes ? JSON.parse(JSON.stringify(target.revealedNodes)) : {};

  // Ensure all node slotting arrays exist
  nodes.forEach(n => {
    if (!Array.isArray(nodeSlottedModules[n.id])) nodeSlottedModules[n.id] = [];
  });

  try {
    // 3. Load map image from DB, in-memory dataUrl, bound folder, or relative assetPath fallback
    const resolved = (typeof resolveMapBackgroundUrl === "function")
      ? await resolveMapBackgroundUrl(targetMapId, target.mapMetadata)
      : null;

    // Check sequence token: abort if another map switch was triggered while awaiting
    if (currentSeq !== window.__mapSwitchSequence) {
      console.log(`[MapsRegistry] Dropping stale background image load for seq ${currentSeq} (current: ${window.__mapSwitchSequence})`);
      return;
    }

    if (resolved && resolved.url) {
      activeMapMetadata = {
        ...(target.mapMetadata || {}),
        ...(resolved.metadata || {}),
        dataUrl: resolved.url,
        url: resolved.url,
        width: resolved.width || (target.mapMetadata && target.mapMetadata.width) || 1920,
        height: resolved.height || (target.mapMetadata && target.mapMetadata.height) || 1080,
        opacity: resolved.opacity ?? (target.mapMetadata && target.mapMetadata.opacity) ?? 0.85
      };
      if (target.mapMetadata) {
        target.mapMetadata.dataUrl = resolved.url;
        target.mapMetadata.url = resolved.url;
      }
      if (typeof applyMapImageToCanvas === "function") {
        applyMapImageToCanvas(resolved.url, activeMapMetadata.width, activeMapMetadata.height, activeMapMetadata.opacity ?? 0.85, false);
      }
    } else {
      const persisted = (typeof loadPersistedMapFromDB === "function") ? await loadPersistedMapFromDB(targetMapId) : null;

      // Check sequence token again after second async operation
      if (currentSeq !== window.__mapSwitchSequence) {
        console.log(`[MapsRegistry] Dropping stale persisted image load for seq ${currentSeq} (current: ${window.__mapSwitchSequence})`);
        return;
      }

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
        activeMapMetadata = target.mapMetadata ? ((typeof stripMapImageDataUrl === "function") ? stripMapImageDataUrl(target.mapMetadata) : target.mapMetadata) : null;
        if (typeof applyMapImageToCanvas === "function") {
          applyMapImageToCanvas(null, 1000, 700);
        }
      }
    }
  } catch(imgErr) {
    if (currentSeq !== window.__mapSwitchSequence) return;
    console.warn("[MapsRegistry] Image load error during map switch:", imgErr);
    activeMapMetadata = target.mapMetadata ? ((typeof stripMapImageDataUrl === "function") ? stripMapImageDataUrl(target.mapMetadata) : target.mapMetadata) : null;
    if (typeof applyMapImageToCanvas === "function") applyMapImageToCanvas(null, 1000, 700);
  }

  // Final check: do not unpack topology or trigger renders if this switch was superseded
  if (currentSeq !== window.__mapSwitchSequence) {
    return;
  }

  // 4. Synchronize into Workstation.activeTopology
  syncAdapterToWorkstationTopology();
  Workstation.activeTopology.edgeData = target.edgeData ? JSON.parse(JSON.stringify(target.edgeData)) : {};
  Workstation.activeTopology.edgeNotes = target.edgeNotes ? JSON.parse(JSON.stringify(target.edgeNotes)) : {};
  Workstation.activeTopology.modData = target.modData ? JSON.parse(JSON.stringify(target.modData)) : {};

  // Restore layers and shapes for target map
  Workstation.activeTopology.layers = (Array.isArray(target.layers) && target.layers.length > 0)
    ? JSON.parse(JSON.stringify(target.layers))
    : (typeof getDefaultLayers === "function" ? getDefaultLayers() : []);
  Workstation.activeTopology.shapes = Array.isArray(target.shapes)
    ? JSON.parse(JSON.stringify(target.shapes))
    : [];
  if (typeof ensureTopologyLayers === "function") {
    ensureTopologyLayers(Workstation.activeTopology);
  }

  // Restore campaign entities onto activeTopology so entity managers see all entities
  Workstation.activeTopology.npcs = cachedEntities.npcs;
  Workstation.activeTopology.quests = cachedEntities.quests;
  Workstation.activeTopology.items = cachedEntities.items;
  Workstation.activeTopology.trackers = cachedEntities.trackers;
  Workstation.activeTopology.tickets = cachedEntities.tickets;
  Workstation.activeTopology.deletedPrototypes = cachedEntities.deletedPrototypes;
  Workstation.activeTopology.deletedModules = cachedEntities.deletedModules;
  Workstation.activeTopology.custom_modules = cachedEntities.custom_modules || [];
  ensureEntityCollections(Workstation.activeTopology);
  if (typeof syncCustomModulesToCatalog === "function") syncCustomModulesToCatalog(Workstation.activeTopology);

  // Automatically save to local storage so activeMapId and packed maps are persisted
  try {
    if (typeof saveActiveCampaign === "function") {
      saveActiveCampaign();
    }
  } catch(saveErr) {
    console.warn("[MapsRegistry] Save active campaign warning:", saveErr);
  }

  try {
    if (typeof selectGlobal === "function") selectGlobal();
    if (typeof renderCanvas === "function") renderCanvas();
    if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
    if (typeof renderLayoutTabs === "function") renderLayoutTabs();
    if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
    if (typeof renderLayersManagerUI === "function") renderLayersManagerUI();
    if (typeof updateStatusBar === "function") updateStatusBar();
    const scaleLabel = (target.scaleTier || target.scale || "region").toUpperCase();
    if (typeof setStatusBarMessage === "function") setStatusBarMessage(`Switched map to: "${target.name || targetMapId}" [${scaleLabel}].`);
  } catch(uiErr) {
    console.error("[MapsRegistry] UI refresh error during map switch:", uiErr);
    if (typeof renderLayoutTabs === "function") renderLayoutTabs();
  }
}

/**
 * Create a new map within the campaign (root, standalone, or child)
 */
function createMap(name, scaleTier = "region", parentMapId = null, parentNodeId = null, nodePrefix = null, dispositionModifier = "") {
  const mapId = "map_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1000).toString(36);
  const prefix = (nodePrefix !== null && nodePrefix !== undefined)
    ? nodePrefix
    : (typeof generateDefaultPrefix === "function" ? generateDefaultPrefix(name) : "");
  
  const initialNodeId = prefix ? `${prefix}1` : 1;
  const initialNodeName = prefix ? `${prefix}1 Arrival Portal` : "Arrival Portal";

  // If dispositionModifier is set and matches a known culture, set initial node culture
  const initialCulture = ["Hierarchy", "Clan", "Market", "Adhocracy"].includes(dispositionModifier)
    ? dispositionModifier
    : "Hierarchy";

  const newMap = {
    id: mapId,
    name: name || `New ${SCALE_TIERS[scaleTier] ? SCALE_TIERS[scaleTier].label : 'Map'}`,
    nodePrefix: prefix,
    scaleTier: scaleTier || "region",
    parentMapId: parentMapId,
    parentNodeId: parentNodeId,
    dispositionModifier: dispositionModifier || "",
    nodes: [
      { id: initialNodeId, name: initialNodeName, displayName: initialNodeName, coordinates: { x: 250, y: 250 }, hubEligibility: "candidate", eligible: true, cat: "Threshold Gate", culture: initialCulture, layerId: "layer-nodes", adj: [], infBy: [], wave: 1 }
    ],
    links: [],
    waves: [
      { wave: 1, nodes: [initialNodeId], description: "Initial Perimeter Exploration" }
    ],
    drawnCards: {},
    nodeSlottedModules: { [initialNodeId]: [] },
    edgeSlottedModules: {},
    revealedNodes: { [initialNodeId]: true },
    layers: (typeof getDefaultLayers === "function") ? getDefaultLayers() : [],
    shapes: [],
    mapMetadata: null,
    customNotes: ""
  };

  maps[mapId] = newMap;

  // If attached to parent node, link parent node
  if (parentMapId && parentNodeId !== null && maps[parentMapId]) {
    if (Array.isArray(maps[parentMapId].nodes)) {
      const parentNode = maps[parentMapId].nodes.find(n => String(n.id) === String(parentNodeId));
      if (parentNode) {
        parentNode.childMapId = mapId;
      }
    }
    if (parentMapId === activeMapId) {
      if (typeof getNode === "function") {
        const liveNode = getNode(parentNodeId);
        if (liveNode) liveNode.childMapId = mapId;
      }
      if (Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[String(parentNodeId)]) {
        Workstation.activeTopology.nodes[String(parentNodeId)].childMapId = mapId;
      }
    }
  }

  if (typeof saveActiveCampaign === "function") saveActiveCampaign();
  if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
  if (typeof renderLayoutTabs === "function") renderLayoutTabs();
  return newMap;
}

/**
 * Delete a map from the campaign (including root map with fallback promotion)
 */
async function deleteMap(mapId) {
  if (typeof maps === "undefined" || !maps || !maps[mapId]) return;

  const mapName = maps[mapId].name || mapId;
  const remainingIds = Object.keys(maps).filter(id => id !== mapId);

  // If this is the only map in the entire campaign:
  if (remainingIds.length === 0) {
    if (!confirm(`Map "${mapName}" is the only map in this campaign. Delete all its points of interest and reset to a blank canvas?`)) {
      return;
    }
    // Reset nodes, links, and background image
    nodes = [];
    links = [];
    drawnCards = {};
    nodeSlottedModules = {};
    edgeSlottedModules = {};
    activeMapMetadata = null;
    maps[mapId].nodes = [];
    maps[mapId].links = [];
    delete maps[mapId].mapMetadata;
    if (typeof deletePersistedMapFromDB === "function") {
      try {
        await deletePersistedMapFromDB(mapId);
      } catch (err) {
        console.warn("[MapsRegistry] Error deleting single map from IndexedDB:", err);
      }
    }
    if (typeof applyMapImageToCanvas === "function") {
      applyMapImageToCanvas(null, 1000, 700);
    }
    syncAdapterToWorkstationTopology();
    saveActiveCampaign();
    renderCanvas();
    renderLayoutTabs();
    if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
    if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
    if (typeof setStatusBarMessage === "function") setStatusBarMessage(`Reset map "${mapName}" to empty.`);
    return;
  }

  if (!confirm(`Delete map "${mapName}" and all its points of interest?`)) return;

  const parentId = maps[mapId].parentMapId;
  const parentNodeId = maps[mapId].parentNodeId;
  if (parentId && parentNodeId !== null && maps[parentId]) {
    const pNode = (maps[parentId].nodes || []).find(n => n.id === parentNodeId);
    if (pNode) pNode.childMapId = null;
    if (parentId === activeMapId) {
      const liveNode = getNode(parentNodeId);
      if (liveNode) liveNode.childMapId = null;
    }
  }

  // Re-parent any children that were attached to this deleted map
  Object.keys(maps).forEach(otherId => {
    if (maps[otherId] && maps[otherId].parentMapId === mapId) {
      maps[otherId].parentMapId = null;
      maps[otherId].parentNodeId = null;
    }
  });

  if (typeof deletePersistedMapFromDB === "function") {
    try {
      await deletePersistedMapFromDB(mapId);
    } catch (err) {
      console.warn("[MapsRegistry] Error deleting map from IndexedDB:", err);
    }
  }
  delete maps[mapId];

  // If the deleted map was active, switch to next available map
  if (activeMapId === mapId) {
    const nextMap = (parentId && maps[parentId]) ? parentId : remainingIds[0];
    await switchActiveMap(nextMap, true);
  } else {
    syncActiveMapToRegistry();
    if (typeof saveActiveCampaign === "function") saveActiveCampaign();
    if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
    if (typeof renderLayoutTabs === "function") renderLayoutTabs();
  }
}

/**
 * Get ordered breadcrumb lineage from root to current map
 */
function getBreadcrumbPath(mapId = activeMapId) {
  const path = [];
  let cur = maps[mapId];
  const visited = new Set();

  while (cur && !visited.has(cur.id)) {
    visited.add(cur.id);
    path.unshift({
      id: cur.id,
      name: cur.name || cur.id,
      scaleTier: cur.scaleTier || "region"
    });
    cur = cur.parentMapId ? maps[cur.parentMapId] : null;
  }

  return path;
}

function getActiveMapId() {
  return typeof activeMapId !== "undefined" ? activeMapId : "map_root";
}
window.getActiveMapId = getActiveMapId;

function getActiveMapName() {
  if (typeof maps !== "undefined" && typeof activeMapId !== "undefined" && maps[activeMapId]) {
    return maps[activeMapId].name || currentCampaignName || "Custom Map";
  }
  return typeof currentCampaignName !== "undefined" ? currentCampaignName : "Custom Map";
}

function getActiveMapScaleTier() {
  if (typeof maps !== "undefined" && typeof activeMapId !== "undefined" && maps[activeMapId]) {
    return maps[activeMapId].scaleTier || "region";
  }
  return "region";
}

function getNode(id) {
  if (id === undefined || id === null) return null;
  return nodes.find(n => String(n.id) === String(id)) || null;
}

function getNodeAdjacents(nid) {
  const n = getNode(nid);
  if (n && Array.isArray(n.adj) && n.adj.length > 0) return n.adj;
  const adj = [];
  const activeLinks = (typeof links !== "undefined" && Array.isArray(links) && links.length > 0)
    ? links
    : ((window.Workstation && window.Workstation.activeTopology && window.Workstation.activeTopology.links) || []);
  activeLinks.forEach(l => {
    if (l.layer === "hegemony") return;
    if (String(l.from) === String(nid)) adj.push(parseInt(l.to));
    else if (String(l.to) === String(nid)) adj.push(parseInt(l.from));
  });
  return [...new Set(adj)];
}

function getNodeIncomingSources(nid) {
  const n = getNode(nid);
  if (n && Array.isArray(n.infBy) && n.infBy.length > 0) return n.infBy;
  const sources = [];
  const activeLinks = (typeof links !== "undefined" && Array.isArray(links) && links.length > 0)
    ? links
    : ((window.Workstation && window.Workstation.activeTopology && window.Workstation.activeTopology.links) || []);
  activeLinks.forEach(l => {
    if (l.layer === "transit" && !l.vectors) return;
    if (String(l.to) === String(nid)) sources.push(parseInt(l.from));
  });
  return [...new Set(sources)];
}

// ============================================================================
// SYNCHRONOUS BIDIRECTIONAL ADAPTER: Workstation.activeTopology <-> maps[activeMapId]
// ============================================================================

/**
 * Normalize nodeSlottedModules dictionary so every node entry is guaranteed to be an Array of module IDs
 */
function normalizeNodeSlottedModules(rawMap) {
  const out = {};
  if (!rawMap || typeof rawMap !== "object") return out;
  Object.keys(rawMap).forEach(k => {
    const val = rawMap[k];
    if (Array.isArray(val)) {
      out[k] = val.filter(Boolean);
    } else if (val && typeof val === "object") {
      out[k] = Object.keys(val)
        .sort((a, b) => Number(a) - Number(b))
        .map(idx => val[idx])
        .filter(Boolean);
    } else {
      out[k] = [];
    }
  });
  return out;
}

/**
 * Safely normalize a node ODV vector ([S, E, C] array or {s, e, c} object) into a 3-element array
 */
function normalizeOdvVector(odv, fallback) {
  const src = odv || fallback;
  if (!src) return undefined;
  if (Array.isArray(src)) return [...src];
  if (typeof src === "object") {
    return [src.s !== undefined ? src.s : 2, src.e !== undefined ? src.e : 2, src.c !== undefined ? src.c : 2];
  }
  return undefined;
}

/**
 * Convert Workstation.activeTopology (dictionary of nodes) into Campaign Studio arrays (nodes[], links[])
 */
function syncAdapterFromWorkstationTopology() {
  if (!Workstation.activeTopology || !Workstation.activeTopology.nodes) return;
  const topo = Workstation.activeTopology;
  nodeSlottedModules = normalizeNodeSlottedModules(nodeSlottedModules);

  // Convert dictionary or array to normalized nodes array
  const rawTopoNodes = Array.isArray(topo.nodes) ? topo.nodes : Object.values(topo.nodes);
  const nodeKeys = Object.keys(topo.nodes).sort((a, b) => {
    const na = parseInt(a);
    const nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  nodes = nodeKeys.map((k, idx) => {
    const n = topo.nodes[k];
    const resolvedId = (n && n.id !== undefined && n.id !== null)
      ? n.id
      : ((isNaN(k) || String(k).includes('-')) ? k : parseInt(k));
    const nid = (typeof resolvedId === 'number' || (typeof resolvedId === 'string' && !isNaN(Number(resolvedId)) && !resolvedId.includes('-')))
      ? (typeof resolvedId === 'number' ? resolvedId : parseInt(resolvedId))
      : resolvedId;

    const hubEl = (n && n.hubEligibility) || (n && n.eligible === false ? "never" : ((n && n.eligible === "always") ? "always" : "candidate"));

    // Sync node.modules array with nodeSlottedModules map (always keep as Array)
    const existingSlotted = Array.isArray(nodeSlottedModules[nid]) ? nodeSlottedModules[nid] : [];
    if (n && Array.isArray(n.modules) && n.modules.length > 0) {
      nodeSlottedModules[nid] = [...new Set([...existingSlotted, ...n.modules.filter(Boolean)])];
      n.modules = [...nodeSlottedModules[nid]];
    } else if (existingSlotted.length > 0) {
      nodeSlottedModules[nid] = [...existingSlotted];
      if (n) n.modules = [...existingSlotted];
    } else {
      nodeSlottedModules[nid] = [];
      if (n) n.modules = [];
    }

    let finalX = 100;
    let finalY = 100;
    if (n && n.coordinates && typeof n.coordinates === "object") {
      const cx = Number(n.coordinates.x);
      const cy = Number(n.coordinates.y);
      if (Number.isFinite(cx)) finalX = cx;
      else if (n.x !== undefined && Number.isFinite(Number(n.x))) finalX = Number(n.x);
      if (Number.isFinite(cy)) finalY = cy;
      else if (n.y !== undefined && Number.isFinite(Number(n.y))) finalY = Number(n.y);
    } else if (n && (n.x !== undefined || n.y !== undefined)) {
      const nx = Number(n.x);
      const ny = Number(n.y);
      if (Number.isFinite(nx)) finalX = nx;
      if (Number.isFinite(ny)) finalY = ny;
    }

    return {
      id: nid,
      name: (n && n.name) || (typeof nid === 'string' ? nid : `Node ${nid}`),
      displayName: (n && (n.displayName || n.name)) || (typeof nid === 'string' ? nid : `#${nid}`),
      x: finalX,
      y: finalY,
      coordinates: { x: finalX, y: finalY },
      cat: (n && (n.cat || n.category)) || "Standard POI",
      culture: (n && n.culture) || "Hierarchy",
      shape: (n && n.shape) || 'circle',
      radius: (n && n.radius !== undefined) ? n.radius : undefined,
      adj: (n && Array.isArray(n.adj)) ? [...n.adj] : [],
      infBy: (n && Array.isArray(n.infBy)) ? [...n.infBy] : [],
      hubEligibility: hubEl,
      eligible: hubEl !== "never",
      wave: (n && n.wave !== undefined) ? parseInt(n.wave) : 1,
      tier: (n && n.tier !== undefined) ? n.tier : 2,
      childMapId: (n && n.childMapId) || null,
      customNotes: (n && n.customNotes) || "",
      locked: !!(n && n.locked),
      visible: !n || n.visible !== false,
      color: (n && n.color) || null,
      modules: (n && Array.isArray(n.modules)) ? [...n.modules] : [],
      provides: (n && Array.isArray(n.provides)) ? [...n.provides] : [],
      requires: (n && Array.isArray(n.requires)) ? [...n.requires] : [],
      operationalProfile: (n && n.operationalProfile) ? n.operationalProfile : undefined,
      modData: (n && n.modData) ? JSON.parse(JSON.stringify(n.modData)) : {},
      odv: normalizeOdvVector(n && n.odv, n && n.odvDefault),
      odvOverridden: !!(n && n.odvOverridden),
      faction: (n && n.faction) || "neutral",
      layerId: (n && n.layerId) || "layer-nodes"
    };
  });

  // Always reconstruct links from current node adj & infBy arrays so edge edits stay in sync
  links = [];
  const linkMap = new Map();
  nodes.forEach(uNode => {
    const u = uNode.id;
    (uNode.adj || []).forEach(vRaw => {
      const v = (isNaN(vRaw) || String(vRaw).includes('-')) ? vRaw : parseInt(vRaw);
      const pairKey = [String(u), String(v)].sort().join('-');
      if (!linkMap.has(pairKey)) {
        const linkObj = { from: u, to: v, type: "twoway", layer: "transit" };
        linkMap.set(pairKey, linkObj);
        links.push(linkObj);
      }
    });
    (uNode.infBy || []).forEach(srcRaw => {
      const srcId = (isNaN(srcRaw) || String(srcRaw).includes('-')) ? srcIdRawNorm(srcRaw) : parseInt(srcRaw);
      if (String(srcId) !== String(u)) {
        const biKey = [String(srcId), String(u)].sort().join('-');
        if (linkMap.has(biKey)) {
          linkMap.get(biKey).layer = "both";
        } else {
          const key = `${srcId}->${u}`;
          if (!linkMap.has(key)) {
            const linkObj = { from: srcId, to: u, type: "oneway", layer: "hegemony" };
            linkMap.set(key, linkObj);
            links.push(linkObj);
          }
        }
      }
    });
  });
  topo.links = JSON.parse(JSON.stringify(links));

  // Preserve entity collections on activeMap
  syncActiveMapToRegistry();
}

function srcIdRawNorm(v) {
  return v;
}

/**
 * Convert Campaign Studio arrays (nodes[], links[]) into Workstation.activeTopology (nodes dictionary)
 */
function syncAdapterToWorkstationTopology() {
  if (!Workstation.activeTopology) {
    Workstation.activeTopology = { id: activeMapId, name: getActiveMapName(), nodes: {} };
  }
  const topo = Workstation.activeTopology;
  topo.id = activeMapId;
  topo.name = getActiveMapName();
  topo.scaleTier = getActiveMapScaleTier();
  topo.nodes = {};
  nodeSlottedModules = normalizeNodeSlottedModules(nodeSlottedModules);

  nodes.forEach(n => {
    // Sync nodeSlottedModules map to node.modules array
    let nodeMods = Array.isArray(n.modules) ? [...n.modules] : [];
    if (Array.isArray(nodeSlottedModules[n.id]) && nodeSlottedModules[n.id].length > 0) {
      nodeMods = [...new Set([...nodeMods, ...nodeSlottedModules[n.id].filter(Boolean)])];
    }
    nodeSlottedModules[n.id] = [...nodeMods];

    const rawX = (n.coordinates && n.coordinates.x !== undefined) ? n.coordinates.x : n.x;
    const rawY = (n.coordinates && n.coordinates.y !== undefined) ? n.coordinates.y : n.y;
    const numX = Number(rawX);
    const numY = Number(rawY);

    topo.nodes[String(n.id)] = {
      id: n.id,
      name: n.name,
      x: Number.isFinite(numX) ? numX : 100,
      y: Number.isFinite(numY) ? numY : 100,
      coordinates: {
        x: Number.isFinite(numX) ? numX : 100,
        y: Number.isFinite(numY) ? numY : 100
      },
      wave: n.wave || 1,
      tier: n.tier !== undefined ? n.tier : 2,
      culture: n.culture || "Hierarchy",
      shape: n.shape || 'circle',
      radius: n.radius !== undefined ? n.radius : undefined,
      eligible: n.eligible !== undefined ? n.eligible : (n.hubEligibility !== "never"),
      hubEligibility: n.hubEligibility || "candidate",
      adj: Array.isArray(n.adj) ? [...n.adj] : [],
      infBy: Array.isArray(n.infBy) ? [...n.infBy] : [],
      childMapId: n.childMapId || null,
      customNotes: n.customNotes || "",
      locked: !!n.locked,
      visible: n.visible !== false,
      color: n.color || null,
      modules: nodeMods,
      provides: Array.isArray(n.provides) ? [...n.provides] : [],
      requires: Array.isArray(n.requires) ? [...n.requires] : [],
      operationalProfile: n.operationalProfile || undefined,
      modData: n.modData ? JSON.parse(JSON.stringify(n.modData)) : {},
      odv: normalizeOdvVector(n.odv, n.odvDefault),
      odvOverridden: n.odvOverridden || false,
      faction: n.faction || "neutral",
      layerId: n.layerId || "layer-nodes"
    };
  });

  topo.links = JSON.parse(JSON.stringify(links));
  if (!topo.layers || !Array.isArray(topo.layers) || topo.layers.length === 0) {
    topo.layers = (maps[activeMapId] && Array.isArray(maps[activeMapId].layers) && maps[activeMapId].layers.length > 0)
      ? JSON.parse(JSON.stringify(maps[activeMapId].layers))
      : (typeof getDefaultLayers === "function" ? getDefaultLayers() : []);
  }
  if (!topo.shapes || !Array.isArray(topo.shapes)) {
    topo.shapes = (maps[activeMapId] && Array.isArray(maps[activeMapId].shapes))
      ? JSON.parse(JSON.stringify(maps[activeMapId].shapes))
      : [];
  }
  if (typeof ensureTopologyLayers === "function") ensureTopologyLayers(topo);
  ensureEntityCollections(topo);
}

/**
 * Sync from Campaign Studio state when nodes/links are modified in canvas/dials
 */
function syncAdapterFromStudioState() {
  syncActiveMapToRegistry();
  syncAdapterToWorkstationTopology();
}

/**
 * Universal Unified Campaign Project Package Loader
 * Loads campaigns from CAMPAIGN_REGISTRY, project folders, zip archives, or json files.
 * Ensures multi-scale maps, node coordinates, campaign entities, and background images
 * are flawlessly hydrated without node-stacking or entity data loss.
 */
async function loadCampaignProjectPackage(rawPkg, options = {}) {
  if (!rawPkg) return;

  const previousCamp = (typeof localStorage !== "undefined") ? localStorage.getItem("cs_active_campaign") : null;
  let campId = typeof rawPkg === "string" ? rawPkg : (rawPkg.id || rawPkg.campaignId || "");
  let campaignTitle = (typeof rawPkg === "string" ? rawPkg : (rawPkg.name || rawPkg.campaignName || campId || "Untitled Campaign"));

  if (typeof resetWorkstationSlate === 'function') {
    await resetWorkstationSlate({
      campaignId: campId,
      campaignName: campaignTitle,
      preserveStorage: true,
      previousCampaignId: previousCamp
    });
  }

  // 1. Resolve registered campaign ID if string was passed
  let pkg = rawPkg;
  if (typeof rawPkg === "string") {
    if (typeof CAMPAIGN_REGISTRY !== "undefined" && CAMPAIGN_REGISTRY[rawPkg]) {
      const reg = CAMPAIGN_REGISTRY[rawPkg];
      pkg = {
        id: rawPkg,
        name: reg.metadata?.name || reg.preset?.name || rawPkg,
        campaignName: reg.metadata?.name || reg.preset?.name || rawPkg,
        description: reg.metadata?.description || "",
        maps: reg.preset?.maps || null,
        nodes: reg.preset?.nodes || null,
        links: reg.preset?.links || null,
        waves: reg.preset?.waves || null,
        entities: reg.preset?.entities || reg.metadata?.entities || null,
        globalDials: reg.metadata?.globalDials || reg.preset?.globalDials || null,
        modules: reg.modules || []
      };
    } else if (typeof BUNDLED_TOPOLOGIES !== "undefined" && BUNDLED_TOPOLOGIES[rawPkg]) {
      const topo = BUNDLED_TOPOLOGIES[rawPkg];
      pkg = {
        id: rawPkg,
        name: topo.name || rawPkg,
        nodes: topo.nodes,
        links: topo.links,
        waves: topo.waves,
        entities: topo.entities || null
      };
    }
  }

  campaignTitle = pkg.name || pkg.campaignName || campId || "Untitled Campaign";

  // 2. Extract and normalize entities
  const candidateEntities = pkg.entities 
    || (pkg.preset && pkg.preset.entities)
    || (pkg.metadata && pkg.metadata.entities)
    || (pkg.activeTopology && pkg.activeTopology.entities)
    || (pkg.activeTopology ? {
        npcs: pkg.activeTopology.npcs || [],
        quests: pkg.activeTopology.quests || [],
        items: pkg.activeTopology.items || [],
        trackers: pkg.activeTopology.trackers || [],
        tickets: pkg.activeTopology.tickets || []
       } : null);

  const extractedEntities = {
    npcs: (candidateEntities && Array.isArray(candidateEntities.npcs) && candidateEntities.npcs.length > 0)
      ? JSON.parse(JSON.stringify(candidateEntities.npcs))
      : (Array.isArray(pkg.npcs) ? JSON.parse(JSON.stringify(pkg.npcs)) : (pkg.preset && Array.isArray(pkg.preset.npcs) ? JSON.parse(JSON.stringify(pkg.preset.npcs)) : [])),
    quests: (candidateEntities && Array.isArray(candidateEntities.quests) && candidateEntities.quests.length > 0)
      ? JSON.parse(JSON.stringify(candidateEntities.quests))
      : (Array.isArray(pkg.quests) ? JSON.parse(JSON.stringify(pkg.quests)) : (pkg.preset && Array.isArray(pkg.preset.quests) ? JSON.parse(JSON.stringify(pkg.preset.quests)) : [])),
    items: (candidateEntities && Array.isArray(candidateEntities.items) && candidateEntities.items.length > 0)
      ? JSON.parse(JSON.stringify(candidateEntities.items))
      : (Array.isArray(pkg.items) ? JSON.parse(JSON.stringify(pkg.items)) : (pkg.preset && Array.isArray(pkg.preset.items) ? JSON.parse(JSON.stringify(pkg.preset.items)) : [])),
    trackers: (candidateEntities && Array.isArray(candidateEntities.trackers) && candidateEntities.trackers.length > 0)
      ? JSON.parse(JSON.stringify(candidateEntities.trackers))
      : (Array.isArray(pkg.trackers) ? JSON.parse(JSON.stringify(pkg.trackers)) : (pkg.preset && Array.isArray(pkg.preset.trackers) ? JSON.parse(JSON.stringify(pkg.preset.trackers)) : [])),
    tickets: (candidateEntities && Array.isArray(candidateEntities.tickets) && candidateEntities.tickets.length > 0)
      ? JSON.parse(JSON.stringify(candidateEntities.tickets))
      : (Array.isArray(pkg.tickets) ? JSON.parse(JSON.stringify(pkg.tickets)) : (pkg.preset && Array.isArray(pkg.preset.tickets) ? JSON.parse(JSON.stringify(pkg.preset.tickets)) : [])),
    custom_modules: (Array.isArray(pkg.custom_modules) && pkg.custom_modules.length > 0)
      ? JSON.parse(JSON.stringify(pkg.custom_modules))
      : (pkg.activeTopology && Array.isArray(pkg.activeTopology.custom_modules) ? JSON.parse(JSON.stringify(pkg.activeTopology.custom_modules)) : (pkg.preset && Array.isArray(pkg.preset.custom_modules) ? JSON.parse(JSON.stringify(pkg.preset.custom_modules)) : []))
  };

  // 3. Normalize Multi-Scale Maps Hierarchy
  let compiledMaps = {};
  if (pkg.maps && typeof pkg.maps === "object" && Object.keys(pkg.maps).length > 0) {
    compiledMaps = JSON.parse(JSON.stringify(pkg.maps));
  } else if (pkg.nodes || (pkg.preset && pkg.preset.nodes)) {
    const rawNodes = pkg.nodes || (pkg.preset && pkg.preset.nodes);
    const rawLinks = pkg.links || (pkg.preset && pkg.preset.links) || [];
    const rawWaves = pkg.waves || (pkg.preset && pkg.preset.waves) || [];
    compiledMaps["map_root"] = {
      id: "map_root",
      name: campaignTitle,
      scaleTier: "region",
      nodes: rawNodes,
      links: rawLinks,
      waves: rawWaves,
      drawnCards: pkg.drawnCards || (pkg.preset && pkg.preset.drawnCards) || {},
      // Legacy keys (sovereignHubs, smotheredNodes, tarotDecks) are tolerated and ignored on import
      nodeSlottedModules: pkg.nodeSlottedModules || {},
      edgeSlottedModules: pkg.edgeSlottedModules || {},
      layers: pkg.layers || (pkg.preset && pkg.preset.layers) || (typeof getDefaultLayers === "function" ? getDefaultLayers() : []),
      shapes: pkg.shapes || (pkg.preset && pkg.preset.shapes) || [],
      mapMetadata: pkg.mapMetadata || null
    };
  }

  // Ensure coordinates on every node across all maps are finite numbers
  Object.keys(compiledMaps).forEach(mId => {
    const mMap = compiledMaps[mId];
    if (!mMap) return;
    const rawNodes = Array.isArray(mMap.nodes)
      ? mMap.nodes
      : (mMap.nodes && typeof mMap.nodes === "object" ? Object.values(mMap.nodes) : []);

    mMap.nodes = rawNodes.map((n, idx) => {
      const resolvedId = (n && n.id !== undefined && n.id !== null) ? n.id : (idx + 1);
      const rawX = (n.coordinates && n.coordinates.x !== undefined) ? n.coordinates.x : n.x;
      const rawY = (n.coordinates && n.coordinates.y !== undefined) ? n.coordinates.y : n.y;
      const numX = Number(rawX);
      const numY = Number(rawY);
      const fx = Number.isFinite(numX) ? numX : (100 + (idx % 5) * 120);
      const fy = Number.isFinite(numY) ? numY : (100 + Math.floor(idx / 5) * 100);
      return {
        ...n,
        id: resolvedId,
        x: fx,
        y: fy,
        coordinates: { x: fx, y: fy },
        layerId: n.layerId || "layer-nodes"
      };
    });

    if (!Array.isArray(mMap.links)) mMap.links = [];
    if (!Array.isArray(mMap.waves)) mMap.waves = [];
    if (!mMap.drawnCards) mMap.drawnCards = {};
    if (!mMap.nodeSlottedModules) mMap.nodeSlottedModules = {};
    if (!mMap.edgeSlottedModules) mMap.edgeSlottedModules = {};
    if (!mMap.layers || !Array.isArray(mMap.layers) || mMap.layers.length === 0) {
      mMap.layers = typeof getDefaultLayers === "function" ? getDefaultLayers() : [];
    }
    if (!Array.isArray(mMap.shapes)) mMap.shapes = [];
    if (typeof ensureTopologyLayers === "function") ensureTopologyLayers(mMap);
  });

  // 4. Update campaign identifiers and global registers
  if (typeof currentCampaignName !== "undefined") currentCampaignName = campaignTitle;
  if (typeof activeCampaignId !== "undefined") activeCampaignId = campId || "custom";
  localStorage.setItem("cs_active_campaign", activeCampaignId);

  maps = compiledMaps;
  const rootMapId = pkg.activeMapId || pkg.rootMapId || (maps["map_root"] ? "map_root" : Object.keys(maps)[0]);

  // Bind disk directory handle if available for direct filesystem operations
  if (pkg.directoryHandle) {
    if (typeof bindProjectDirectory === "function") {
      await bindProjectDirectory(pkg.directoryHandle);
    } else {
      window.activeProjectDirectoryHandle = pkg.directoryHandle;
    }
  } else {
    if (typeof unbindProjectDirectory === "function") {
      await unbindProjectDirectory();
    } else {
      window.activeProjectDirectoryHandle = null;
    }
  }

  // 5. Hydrate Workstation.activeTopology with authoritative entities
  if (typeof Workstation !== "undefined") {
    if (!Workstation.activeTopology) {
      Workstation.activeTopology = { id: rootMapId, name: campaignTitle, nodes: {} };
    }
    Workstation.activeTopology.id = rootMapId;
    Workstation.activeTopology.name = campaignTitle;
    Workstation.activeTopology.npcs = extractedEntities.npcs;
    Workstation.activeTopology.quests = extractedEntities.quests;
    Workstation.activeTopology.items = extractedEntities.items;
    Workstation.activeTopology.trackers = extractedEntities.trackers;
    Workstation.activeTopology.tickets = extractedEntities.tickets;
    Workstation.activeTopology.deletedPrototypes = Array.isArray(pkg.deletedPrototypes) ? pkg.deletedPrototypes : (pkg.preset && Array.isArray(pkg.preset.deletedPrototypes) ? pkg.preset.deletedPrototypes : (pkg.entities && Array.isArray(pkg.entities.deletedPrototypes) ? pkg.entities.deletedPrototypes : []));
    Workstation.activeTopology.deletedModules = Array.isArray(pkg.deletedModules) ? pkg.deletedModules : (pkg.preset && Array.isArray(pkg.preset.deletedModules) ? pkg.preset.deletedModules : (pkg.entities && Array.isArray(pkg.entities.deletedModules) ? pkg.entities.deletedModules : []));
    Workstation.activeTopology.custom_modules = extractedEntities.custom_modules || [];
    if (typeof ensureEntityCollections === "function") ensureEntityCollections(Workstation.activeTopology);
    if (typeof syncCustomModulesToCatalog === "function") syncCustomModulesToCatalog(Workstation.activeTopology);
  }

  // 6. Hydrate and Persist Map Images to IndexedDB Before Canvas Unpack
  for (const mId of Object.keys(maps)) {
    const mMap = maps[mId];
    if (mMap && mMap.mapMetadata && (mMap.mapMetadata.dataUrl || mMap.mapMetadata.url) && typeof saveMapImageToDB === "function") {
      try {
        const preservedAssetPath = mMap.mapMetadata.assetPath;
        const preservedDataUrl = mMap.mapMetadata.dataUrl || mMap.mapMetadata.url;
        await saveMapImageToDB(mMap.mapMetadata.name || `${mId}_bg`, preservedDataUrl, mMap.mapMetadata.width, mMap.mapMetadata.height, mMap.mapMetadata.opacity ?? 0.85, mId);
        if (mId === rootMapId && typeof applyMapImageToCanvas === "function") {
          applyMapImageToCanvas(preservedDataUrl, mMap.mapMetadata.width, mMap.mapMetadata.height, mMap.mapMetadata.opacity ?? 0.85, true);
        }
        if (typeof stripMapImageDataUrl === "function") {
          mMap.mapMetadata = stripMapImageDataUrl(mMap.mapMetadata);
          if (preservedAssetPath) mMap.mapMetadata.assetPath = preservedAssetPath;
        }
        if (preservedDataUrl) {
          mMap.mapMetadata.dataUrl = preservedDataUrl;
          mMap.mapMetadata.url = preservedDataUrl;
        }
      } catch(imgErr) {
        console.warn("[loadCampaignProjectPackage] Image persist warning:", imgErr);
      }
    } else if (mMap && (!mMap.mapMetadata) && typeof deletePersistedMapFromDB === "function") {
      try {
        await deletePersistedMapFromDB(mId);
      } catch(_) {}
    }
  }

  // 7. Switch to root map, forcing canvas unpacking
  await switchActiveMap(rootMapId, true, { skipSyncToRegistry: true, isPackageLoad: true });

  // Re-affirm entities on Workstation.activeTopology after switchActiveMap
  if (typeof Workstation !== "undefined" && Workstation.activeTopology) {
    Workstation.activeTopology.campaignName = campaignTitle;
    Workstation.activeTopology.name = campaignTitle;
    Workstation.activeTopology.npcs = extractedEntities.npcs;
    Workstation.activeTopology.quests = extractedEntities.quests;
    Workstation.activeTopology.items = extractedEntities.items;
    Workstation.activeTopology.trackers = extractedEntities.trackers;
    Workstation.activeTopology.tickets = extractedEntities.tickets;
    Workstation.activeTopology.deletedPrototypes = Array.isArray(pkg.deletedPrototypes) ? pkg.deletedPrototypes : (pkg.preset && Array.isArray(pkg.preset.deletedPrototypes) ? pkg.preset.deletedPrototypes : (pkg.entities && Array.isArray(pkg.entities.deletedPrototypes) ? pkg.entities.deletedPrototypes : []));
    Workstation.activeTopology.deletedModules = Array.isArray(pkg.deletedModules) ? pkg.deletedModules : (pkg.preset && Array.isArray(pkg.preset.deletedModules) ? pkg.preset.deletedModules : (pkg.entities && Array.isArray(pkg.entities.deletedModules) ? pkg.entities.deletedModules : []));
    Workstation.activeTopology.custom_modules = extractedEntities.custom_modules || [];
    if (typeof ensureEntityCollections === "function") ensureEntityCollections(Workstation.activeTopology);
    if (typeof syncCustomModulesToCatalog === "function") syncCustomModulesToCatalog(Workstation.activeTopology);
  }

  // Dispatch onCampaignLoad lifecycle hook to registered mods
  if (typeof Workstation !== "undefined" && Workstation.registeredMods) {
    Object.values(Workstation.registeredMods).forEach(modDef => {
      if (modDef && typeof modDef.onCampaignLoad === 'function') {
        try {
          modDef.onCampaignLoad(Workstation.activeTopology);
        } catch (modErr) {
          console.error(`[Mod ${modDef.id}] onCampaignLoad error:`, modErr);
        }
      }
    });
  }

  // 8. Global Dials
  const dials = pkg.globalDials || (pkg.metadata && pkg.metadata.globalDials) || (pkg.preset && pkg.preset.globalDials);
  if (dials) {
    if (dials.dial8ClimaxTrigger && typeof setDial8Mode === "function") {
      setDial8Mode(dials.dial8ClimaxTrigger.mode || dials.dial8ClimaxTrigger || "crisis");
    }
    if (dials.tier0Substratum !== undefined && typeof tier0SubstratumEnabled !== "undefined") {
      tier0SubstratumEnabled = !!dials.tier0Substratum;
    }
  }

  // 9. Save and Refresh Complete Workstation Shell
  try {
    if (typeof saveActiveCampaign === "function") saveActiveCampaign();
    if (typeof renderCanvas === "function") renderCanvas();
    if (typeof renderLayoutTabs === "function") renderLayoutTabs();
    if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
    if (typeof renderEntityManagerTree === "function") renderEntityManagerTree();
    if (typeof renderEntityManagerList === "function") renderEntityManagerList();
    if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
    if (typeof selectGlobal === "function") selectGlobal();
    if (typeof updateStatusBar === "function") updateStatusBar();
    if (typeof closeModal === "function") closeModal("modal-load");
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Loaded campaign package: "${campaignTitle}" [${Object.keys(maps).length} Maps, ${extractedEntities.npcs.length} NPCs, ${extractedEntities.quests.length} Quests, ${extractedEntities.items.length} Items].`);
    }
  } catch(refreshErr) {
    console.error("[loadCampaignProjectPackage] Refresh warning:", refreshErr);
  }
}
window.loadCampaignProjectPackage = loadCampaignProjectPackage;
window.loadInstalledCampaign = loadCampaignProjectPackage;
window.getMapsRegistry = function() { return maps; };
window.createMap = createMap;

