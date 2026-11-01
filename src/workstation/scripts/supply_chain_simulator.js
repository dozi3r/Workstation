// --- STAGE 5: MODULE SLOTTING (NODES & EDGES) ---
let slottingMode = "node"; // "node" or "edge"
let targetSlottingEdgeId = "1->2";
if (typeof edgeSlottedModules === "undefined") edgeSlottedModules = {};
let blockedEdges = {}; // { "u->v": true }
let selectedCatalogSourcebook = "all";
let selectedCatalogAncestry = "all";
let selectedCatalogSource = "all";
let selectedCatalogOptionGroup = "all";
let moduleSeveranceClocks = {}; // { "${nodeId}:${modId}": 0..4 }
if (typeof tier0SubstratumEnabled === "undefined") var tier0SubstratumEnabled = false;
if (typeof tier0SubstratumMode === "undefined") var tier0SubstratumMode = "discrete";

function revealNode(nodeId) {
  const topo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || null;
  if (!topo || !topo.nodes) return;
  const n = topo.nodes[String(nodeId)] || (Array.isArray(topo.nodes) ? topo.nodes.find(x => x.id == nodeId) : null);
  if (n) {
    if (typeof pushHistoryState === 'function') pushHistoryState(`Reveal Node #${nodeId}`);
    n.visible = true;
    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Node #${nodeId} revealed to players.`);
  }
}
window.revealNode = revealNode;

function shroudNode(nodeId) {
  const topo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || null;
  if (!topo || !topo.nodes) return;
  const n = topo.nodes[String(nodeId)] || (Array.isArray(topo.nodes) ? topo.nodes.find(x => x.id == nodeId) : null);
  if (n) {
    if (typeof pushHistoryState === 'function') pushHistoryState(`Shroud Node #${nodeId}`);
    n.visible = false;
    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Node #${nodeId} shrouded in Fog of War.`);
  }
}
window.shroudNode = shroudNode;

function toggleTier0Substratum(enabled) {
  tier0SubstratumEnabled = enabled;
  tier0SubstratumMode = enabled ? "smooth" : "granular";
  auditAllSupplyLines();
  if (typeof renderCatalogModules === "function") renderCatalogModules();
  if (typeof updateTargetNodeSidebar === "function") updateTargetNodeSidebar();
}

function initOptionGroupFilter() {
  const sel = document.getElementById("mod-option-select");
  if (sel) {
    sel.value = selectedCatalogOptionGroup;
    sel.onchange = (e) => {
      selectedCatalogOptionGroup = e.target.value;
      renderCatalogModules();
    };
  }
}

function initAncestryFilter() {
  const sel = document.getElementById("mod-ancestry-select");
  if (sel) {
    sel.value = selectedCatalogAncestry;
    sel.onchange = (e) => {
      selectedCatalogAncestry = e.target.value;
      renderCatalogModules();
    };
  }
}

function initSourceFilter() {
  const sel = document.getElementById("mod-source-select");
  if (sel) {
    sel.value = selectedCatalogSource;
    sel.onchange = (e) => {
      selectedCatalogSource = e.target.value;
      renderCatalogModules();
    };
  }
}

function getSeveranceTick(nodeId, modId) {
  const key = `${nodeId}:${modId}`;
  return moduleSeveranceClocks[key] || 0;
}

function stepSeveranceTick(nodeId, modId, delta) {
  const key = `${nodeId}:${modId}`;
  const curr = moduleSeveranceClocks[key] || 0;
  const next = Math.max(0, Math.min(4, curr + delta));
  moduleSeveranceClocks[key] = next;
  updateTargetNodeSidebar();
  auditAllSupplyLines();
}

function advanceSeveranceTurn() {
  let count = 0;
  nodes.forEach(n => {
    const slotted = nodeSlottedModules[n.id] || [];
    slotted.forEach(mid => {
      const mod = MODULES_MANIFEST.find(m => m.id === mid);
      if (mod) {
        const check = checkModuleSupplyLine(n.id, mod);
        if (!check.ok) {
          const key = `${n.id}:${mid}`;
          const curr = moduleSeveranceClocks[key] || 0;
          if (curr < 4) {
            moduleSeveranceClocks[key] = curr + 1;
            count++;
          }
        }
      }
    });
  });
  updateTargetNodeSidebar();
  auditAllSupplyLines();
  alert(`Turn Advanced: ${count} severed module(s) advanced +1 tick on their threat clocks.`);
}

function isEdgeBlocked(u, v) {
  if (typeof blockedEdges !== "undefined" && blockedEdges && (blockedEdges[`${u}->${v}`] || blockedEdges[`${v}->${u}`])) {
    return true;
  }
  if (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.edgeData) {
    const ed = Workstation.activeTopology.edgeData;
    const rec = ed[`${u}->${v}`] || ed[`${v}->${u}`] || ed[`${u}-${v}`] || ed[`${v}-${u}`];
    if (rec && (rec.condition === "severed" || rec.condition === "blocked")) return true;
  }
  return false;
}

function toggleEdgeBlocked(edgeKey) {
  if (!blockedEdges) blockedEdges = {};
  const [uStr, vStr] = edgeKey.split("->");
  const u = parseInt(uStr);
  const v = parseInt(vStr);
  const k1 = `${u}->${v}`;
  const k2 = `${v}->${u}`;
  if (blockedEdges[k1] || blockedEdges[k2]) {
    delete blockedEdges[k1];
    delete blockedEdges[k2];
  } else {
    blockedEdges[k1] = true;
    blockedEdges[k2] = true;
  }
  updateTargetNodeSidebar();
  renderCatalogModules();
  auditAllSupplyLines();
  if (typeof renderStage1 === "function") renderStage1();
}

function isMaterialRequirement(req) {
  if (!req || typeof req !== 'string') return false;
  const conceptualPrefixes = [
    "Geography:", "Ecology:", "Environment:", "Sociology:", "Authority:",
    "Topology:", "Network:", "System:", "Facility:", "Military:",
    "Perimeter:", "Trigger:", "Relics:", "Physics:", "Cosmology:", "Factions:",
    "Statecraft:", "Resilience:", "Doctrine:", "Diagnostics:", "Strategy:"
  ];
  for (const prefix of conceptualPrefixes) {
    if (req.startsWith(prefix)) return false;
  }
  return true;
}

// ============================================================================
// TRANS-SCALE CARTOGRAPHIC LOGISTICS HELPERS (SYS-START-12)
// ============================================================================
function collectMapNetworkProvides(mapObj, startNodeId, context) {
  const provides = new Set();
  if (!mapObj || !context || context.depth > 5) return provides;
  context.visitedMaps.add(mapObj.id || 'map');

  const nodesObj = mapObj.nodes || {};
  const getNodeObj = (id) => Array.isArray(nodesObj) ? nodesObj.find(n => String(n.id) === String(id)) : nodesObj[String(id)];
  const getAdj = (id) => {
    const n = getNodeObj(id);
    return (n && Array.isArray(n.adj)) ? n.adj : [];
  };

  const reachable = new Set([String(startNodeId)]);
  const queue = [String(startNodeId)];
  while (queue.length > 0) {
    const curr = queue.shift();
    const adj = getAdj(curr);
    for (const neighbor of adj) {
      const nStr = String(neighbor);
      const edgeKey1 = `${curr}-${nStr}`;
      const edgeKey2 = `${nStr}-${curr}`;
      const eRec = (mapObj.edgeData && (mapObj.edgeData[edgeKey1] || mapObj.edgeData[edgeKey2]));
      if (eRec && (eRec.condition === 'severed' || eRec.blocked)) continue;
      if (!reachable.has(nStr)) {
        reachable.add(nStr);
        queue.push(nStr);
      }
    }
  }

  reachable.forEach(nid => {
    const n = getNodeObj(nid);
    if (n && Array.isArray(n.provides)) {
      n.provides.forEach(p => { if (p) provides.add(p); });
    }
    const slotted = (mapObj.nodeSlottedModules && mapObj.nodeSlottedModules[nid]) || (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[nid]) || [];
    slotted.forEach(mid => {
      const m = (typeof MODULES_MANIFEST !== 'undefined' && MODULES_MANIFEST) ? MODULES_MANIFEST.find(x => x.id === mid) : null;
      if (m && Array.isArray(m.provides)) m.provides.forEach(p => provides.add(p));
    });
  });

  if (mapObj.edgeData) {
    Object.keys(mapObj.edgeData).forEach(edgeKey => {
      const rec = mapObj.edgeData[edgeKey];
      if (!rec || !Array.isArray(rec.dedicatedFlows)) return;
      const parts = edgeKey.includes('->') ? edgeKey.split('->') : edgeKey.split('-');
      if (reachable.has(String(parts[0])) || reachable.has(String(parts[1]))) {
        rec.dedicatedFlows.forEach(flow => {
          const tag = (typeof flow === 'string') ? flow : (flow && flow.tag);
          if (tag) provides.add(tag);
        });
      }
    });
  }

  reachable.forEach(nid => {
    const n = getNodeObj(nid);
    if (!n) return;
    const cMapId = n.childMapId;
    if (cMapId && n.importUp !== false && typeof maps !== 'undefined' && maps && maps[cMapId] && !context.visitedMaps.has(cMapId)) {
      const subSupplies = collectSubmapAllProvides(maps[cMapId], {
        visitedMaps: new Set(context.visitedMaps),
        depth: context.depth + 1
      });
      subSupplies.forEach(p => provides.add(p));
    }
  });

  return provides;
}

function collectSubmapAllProvides(childMap, context) {
  const provides = new Set();
  if (!childMap || !context || context.depth > 5) return provides;
  context.visitedMaps.add(childMap.id || 'child_map');

  const nodesObj = childMap.nodes || {};
  const nodeList = Array.isArray(nodesObj) ? nodesObj : Object.values(nodesObj);

  nodeList.forEach(n => {
    if (!n) return;
    if (Array.isArray(n.provides)) {
      n.provides.forEach(p => { if (p) provides.add(p); });
    }
    const slotted = (childMap.nodeSlottedModules && childMap.nodeSlottedModules[n.id]) || (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules[n.id]) || [];
    slotted.forEach(mid => {
      const m = (typeof MODULES_MANIFEST !== 'undefined' && MODULES_MANIFEST) ? MODULES_MANIFEST.find(x => x.id === mid) : null;
      if (m && Array.isArray(m.provides)) m.provides.forEach(p => provides.add(p));
    });

    if (n.childMapId && n.importUp !== false && typeof maps !== 'undefined' && maps && maps[n.childMapId] && !context.visitedMaps.has(n.childMapId)) {
      const subSub = collectSubmapAllProvides(maps[n.childMapId], {
        visitedMaps: new Set(context.visitedMaps),
        depth: context.depth + 1
      });
      subSub.forEach(p => provides.add(p));
    }
  });

  if (childMap.edgeData) {
    Object.values(childMap.edgeData).forEach(rec => {
      if (rec && Array.isArray(rec.dedicatedFlows)) {
        rec.dedicatedFlows.forEach(flow => {
          const tag = (typeof flow === 'string') ? flow : (flow && flow.tag);
          if (tag) provides.add(tag);
        });
      }
    });
  }

  return provides;
}

function checkModuleSupplyLine(nodeId, mod, context) {
  if (!mod.requires || mod.requires.length === 0) {
    return { ok: true, missing: [] };
  }

  const materialReqs = mod.requires.filter(isMaterialRequirement);
  if (materialReqs.length === 0) {
    return { ok: true, missing: [] };
  }

  // 1. Local node provides (slotted modules + ad-hoc node.provides)
  const localSlotted = nodeSlottedModules[nodeId] || [];
  const localProvides = new Set();
  localSlotted.forEach(mid => {
    const m = MODULES_MANIFEST.find(x => x.id === mid);
    if (m && m.provides) {
      m.provides.forEach(p => localProvides.add(p));
    }
  });
  const localNodeObj = (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[String(nodeId)]) || getNode(nodeId);
  if (localNodeObj && Array.isArray(localNodeObj.provides)) {
    localNodeObj.provides.forEach(p => { if (p) localProvides.add(p); });
  }

  // Inject Tier 0 baseline substratum resources if Smooth Generic mode is enabled
  if (tier0SubstratumEnabled && tier0SubstratumMode === "smooth") {
    localProvides.add("Food: Baseline-Subsistence-Rations");
    localProvides.add("Cal: Grain-Bushels");
    localProvides.add("Water: Baseline-Potable-Well-Head");
    localProvides.add("Water: Artesian-Flow");
    localProvides.add("Shelter: Weatherproof-Civic-Fabric");
    localProvides.add("Civic: Vernacular-Shelter");
    localProvides.add("Defense: Local-Palisade-and-Watch");
    localProvides.add("Economy: Baseline-Mundane-Smithy-and-Trade");
    localProvides.add("Health: Folk-Leechcraft-and-Midwifery");
    localProvides.add("Sanitation: Vernacular-Midden-Management");
    localProvides.add("Social: Communal-Folklore-Solidarity");
  }

  // 2. BFS graph traversal to find reachable nodes through unblocked physical edges
  const reachableNodes = new Set([nodeId]);
  const queue = [nodeId];
  while (queue.length > 0) {
    const curr = queue.shift();
    const adj = getNodeAdjacents(curr);
    for (const neighbor of adj) {
      if (isEdgeBlocked(curr, neighbor)) continue; // Severed edge halts supply flow
      if (!reachableNodes.has(neighbor)) {
        reachableNodes.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  // 3. Network provides across all reachable nodes and connected edges
  const networkProvides = new Set(localProvides);
  reachableNodes.forEach(otherId => {
    const otherSlotted = nodeSlottedModules[otherId] || [];
    otherSlotted.forEach(mid => {
      const m = MODULES_MANIFEST.find(x => x.id === mid);
      if (m && m.provides) {
        m.provides.forEach(p => networkProvides.add(p));
      }
    });
    const otherNodeObj = (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[String(otherId)]) || getNode(otherId);
    if (otherNodeObj && Array.isArray(otherNodeObj.provides)) {
      otherNodeObj.provides.forEach(p => { if (p) networkProvides.add(p); });
    }
  });

  Object.keys(edgeSlottedModules).forEach(edgeKey => {
    const parts = edgeKey.includes("->") ? edgeKey.split("->") : edgeKey.split("-");
    const u = isNaN(parts[0]) ? parts[0] : parseInt(parts[0]);
    const v = isNaN(parts[1]) ? parts[1] : parseInt(parts[1]);
    if (!isEdgeBlocked(u, v) && (reachableNodes.has(u) || reachableNodes.has(v))) {
      (edgeSlottedModules[edgeKey] || []).forEach(mid => {
        const m = MODULES_MANIFEST.find(x => x.id === mid);
        if (m && m.provides) {
          m.provides.forEach(p => networkProvides.add(p));
        }
      });
    }
  });

  // 4. Dedicated Corridor Conduits (edgeRecord.dedicatedFlows)
  if (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.edgeData) {
    Object.keys(Workstation.activeTopology.edgeData).forEach(edgeKey => {
      const rec = Workstation.activeTopology.edgeData[edgeKey];
      if (!rec || !Array.isArray(rec.dedicatedFlows) || rec.dedicatedFlows.length === 0) return;
      const parts = edgeKey.includes("->") ? edgeKey.split("->") : edgeKey.split("-");
      const u = isNaN(parts[0]) ? parts[0] : parseInt(parts[0]);
      const v = isNaN(parts[1]) ? parts[1] : parseInt(parts[1]);
      if (!isEdgeBlocked(u, v) && (reachableNodes.has(u) || reachableNodes.has(v) || String(u) === String(nodeId) || String(v) === String(nodeId))) {
        rec.dedicatedFlows.forEach(flow => {
          const tag = (typeof flow === "string") ? flow : (flow && flow.tag);
          if (tag) networkProvides.add(tag);
        });
      }
    });
  }

  // 5. Trans-Scale Cartographic Logistics & Portal Flow (SYS-START-12)
  if (!context) {
    context = { visitedMaps: new Set(), depth: 0 };
  }
  const curMapId = (typeof activeMapId !== "undefined" && activeMapId)
    ? activeMapId
    : ((typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.id) ? Workstation.activeTopology.id : "map_root");
  context.visitedMaps.add(curMapId);

  const allMaps = (typeof maps !== "undefined" && maps) ? maps : null;
  const curMapData = (allMaps && allMaps[curMapId]) || (typeof Workstation !== "undefined" && Workstation.activeTopology);
  const parentMapId = curMapData && curMapData.parentMapId;
  const parentNodeId = curMapData && curMapData.parentNodeId;

  // Direction A: Down-Flow (Parent Map -> Submap)
  if (parentMapId && parentNodeId !== null && parentNodeId !== undefined && allMaps && allMaps[parentMapId] && !context.visitedMaps.has(parentMapId) && context.depth < 5) {
    const parentMap = allMaps[parentMapId];
    const parentNodesObj = parentMap.nodes || {};
    const parentPortalNode = Array.isArray(parentNodesObj)
      ? parentNodesObj.find(n => String(n.id) === String(parentNodeId))
      : parentNodesObj[String(parentNodeId)];

    if (parentPortalNode && parentPortalNode.exportDown !== false) {
      const parentSupplies = collectMapNetworkProvides(parentMap, parentNodeId, {
        visitedMaps: new Set(context.visitedMaps),
        depth: context.depth + 1
      });
      parentSupplies.forEach(p => networkProvides.add(p));
    }
  }

  // Direction B: Up-Flow (Child Submaps -> Current Map)
  if (allMaps && context.depth < 5) {
    reachableNodes.forEach(otherId => {
      const otherNodeObj = (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[String(otherId)]) || getNode(otherId);
      if (!otherNodeObj) return;

      let cMapId = otherNodeObj.childMapId;
      if (!cMapId && allMaps) {
        cMapId = Object.keys(allMaps).find(mid => {
          const m = allMaps[mid];
          return m && m.parentMapId === curMapId && String(m.parentNodeId) === String(otherId);
        });
      }

      if (cMapId && allMaps[cMapId] && otherNodeObj.importUp !== false && !context.visitedMaps.has(cMapId)) {
        const childMap = allMaps[cMapId];
        const childSupplies = collectSubmapAllProvides(childMap, {
          visitedMaps: new Set(context.visitedMaps),
          depth: context.depth + 1
        });
        childSupplies.forEach(p => networkProvides.add(p));
      }
    });
  }

  const missing = [];
  for (const req of materialReqs) {
    if (!networkProvides.has(req)) {
      missing.push(req);
    }
  }

  return {
    ok: missing.length === 0,
    missing: missing,
    fallback: mod.fallback
  };
}

function calculateRecommendationScore(nodeId, mod) {
  if (!mod) return { score: 0, reasons: [] };
  const n = getNode(nodeId);
  const slotted = nodeSlottedModules[nodeId] || [];
  let score = 0;
  const reasons = [];

  // Mod hook for module affinity extensions
  if (window.CreatorStudio && typeof window.CreatorStudio.calculateModuleAffinity === "function") {
    try {
      const modScore = window.CreatorStudio.calculateModuleAffinity(nodeId, mod);
      if (modScore && typeof modScore.score === "number") {
        score += modScore.score;
        if (modScore.reasons) reasons.push(...modScore.reasons);
      }
    } catch (_) {}
  }

  // 1. CVF Culture Quadrant match (+5) and clash (-5) (Q4)
  if (n && n.culture && mod.culture) {
    const nodeCult = n.culture.toLowerCase().trim();
    const modCult = mod.culture.toLowerCase().trim();
    const CVF_OPPOSITES = {
      "clan": "market",
      "market": "clan",
      "hierarchy": "adhocracy",
      "adhocracy": "hierarchy"
    };

    if (modCult.includes(nodeCult) || nodeCult.includes(modCult)) {
      score += 5;
      reasons.push(`Culture Match: ${n.culture} (+5)`);
    } else {
      const opp = CVF_OPPOSITES[nodeCult];
      if (opp && modCult.includes(opp)) {
        score -= 5;
        reasons.push(`Culture Clash: ${n.culture} vs ${mod.culture} (-5)`);
      }
    }
  }

  // 3. Color Identity match (+3) (Q4)
  if (n && n.color && mod.color) {
    const nodeColors = (n.color || '').split(/[\s/]+/);
    const modColors = (mod.color || '').split(/[\s/]+/);
    const sharesColor = nodeColors.some(nc => nc && modColors.some(mc => mc && mc.toLowerCase() === nc.toLowerCase()));
    if (sharesColor) {
      score += 3;
      reasons.push(`Color Match: ${mod.color} (+3)`);
    }
  }

  // 4. Supply Line Synergy - does mod resolve an unmet need on this node or reachable cluster? (+3)
  const reachableNodes = new Set([nodeId]);
  const queue = [nodeId];
  while (queue.length > 0) {
    const curr = queue.shift();
    const adj = getNodeAdjacents(curr);
    for (const neighbor of adj) {
      if (typeof isEdgeBlocked === "function" && isEdgeBlocked(curr, neighbor)) continue;
      if (!reachableNodes.has(neighbor)) {
        reachableNodes.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  const networkMissingNeeds = new Set();
  reachableNodes.forEach(otherId => {
    const otherSlotted = nodeSlottedModules[otherId] || [];
    otherSlotted.forEach(mid => {
      const m = MODULES_MANIFEST.find(x => x.id === mid);
      if (m && m.requires) {
        const check = checkModuleSupplyLine(otherId, m);
        if (!check.ok) {
          check.missing.forEach(miss => networkMissingNeeds.add(miss));
        }
      }
    });
    const adHocCheck = checkNodeAdHocSupplyLine(otherId);
    if (!adHocCheck.ok) {
      adHocCheck.missing.forEach(miss => networkMissingNeeds.add(miss));
    }
  });

  if (n && Array.isArray(n.requires) && mod.provides) {
    const satIntrinsic = mod.provides.filter(p => n.requires.includes(p));
    if (satIntrinsic.length > 0) {
      score += 8;
      reasons.push(`Satisfies Node Demand: ${satIntrinsic.join(', ')} (+8)`);
    }
  }
  if (n && Array.isArray(n.provides) && mod.requires) {
    const fedByIntrinsic = mod.requires.filter(r => n.provides.includes(r));
    if (fedByIntrinsic.length > 0) {
      score += 6;
      reasons.push(`Fed by Node Yield: ${fedByIntrinsic.join(', ')} (+6)`);
    }
  }

  if (mod.provides) {
    const resolves = mod.provides.filter(p => networkMissingNeeds.has(p));
    if (resolves.length > 0) {
      score += 3;
      reasons.push(`Supplies: ${resolves.join(', ')} (+3)`);
    }
  }

  // 5. Supply Out - Are mod's own material inputs fully supplied? (+2)
  const selfCheck = checkModuleSupplyLine(nodeId, mod);
  if (selfCheck.ok && mod.requires && mod.requires.filter(isMaterialRequirement).length > 0) {
    score += 2;
    reasons.push("Inputs Intact (+2)");
  }

  // 6. Already slotted penalty (-10)
  if (slotted.includes(mod.id)) {
    score -= 10;
  }

  return { score, reasons };
}

function getBestModule(nid, filterFn) {
  const slotted = nodeSlottedModules[nid] || [];
  const candidates = MODULES_MANIFEST.filter(m => !slotted.includes(m.id) && (!filterFn || filterFn(m)));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const scoreA = calculateRecommendationScore(nid, a).score;
    const scoreB = calculateRecommendationScore(nid, b).score;
    return scoreB - scoreA;
  });
  return candidates[0];
}

function getBestModuleForSet(nid, setPrefix) {
  return getBestModule(nid, m => m.set && m.set.toLowerCase().startsWith(setPrefix.toLowerCase()));
}

function checkNodeAdHocSupplyLine(nodeId, context) {
  const nObj = (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[String(nodeId)]) || getNode(nodeId);
  const reqs = (nObj && Array.isArray(nObj.requires)) ? nObj.requires : [];
  if (reqs.length === 0) return { ok: true, missing: [] };
  return checkModuleSupplyLine(nodeId, { requires: reqs, fallback: "Settlement ad-hoc resource deficit" }, context);
}
window.checkNodeAdHocSupplyLine = checkNodeAdHocSupplyLine;

// ============================================================================
// QUANTITATIVE RESOURCE ACCOUNTING & CORRIDOR BANDWIDTH (SYS-START-13)
// ============================================================================
function parseResourceTag(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  const match = trimmed.match(/^([^:]+):\s*([^\[]+)(?:\[\s*(\d+(?:\.\d+)?)\s*([a-zA-Z0-9_\-\/^]+)\s*\])?$/);
  if (!match) {
    const simpleMatch = trimmed.match(/^([^\[]+)\[\s*(\d+(?:\.\d+)?)\s*([a-zA-Z0-9_\-\/^]+)\s*\]$/);
    if (simpleMatch) {
      return {
        raw: trimmed,
        category: 'General',
        name: simpleMatch[1].trim(),
        quantity: parseFloat(simpleMatch[2]),
        unit: simpleMatch[3].trim()
      };
    }
    return {
      raw: trimmed,
      category: 'General',
      name: trimmed,
      quantity: null,
      unit: null
    };
  }

  return {
    raw: trimmed,
    category: match[1].trim(),
    name: match[2].trim(),
    quantity: match[3] ? parseFloat(match[3]) : null,
    unit: match[4] ? match[4].trim() : null
  };
}
window.parseResourceTag = parseResourceTag;

function auditQuantitativeResourceBalances(nodesList) {
  const balances = {};
  if (!Array.isArray(nodesList)) {
    if (nodesList && typeof nodesList === 'object') {
      nodesList = Object.values(nodesList);
    } else {
      return balances;
    }
  }

  nodesList.forEach(n => {
    if (!n) return;
    const providesList = Array.isArray(n.provides) ? n.provides : [];
    providesList.forEach(tag => {
      const parsed = parseResourceTag(tag);
      if (!parsed || parsed.quantity === null) return;
      const key = `${parsed.category}:${parsed.name}:${parsed.unit || 'unit'}`;
      if (!balances[key]) {
        balances[key] = {
          key,
          category: parsed.category,
          name: parsed.name,
          unit: parsed.unit,
          totalYield: 0,
          totalDemand: 0,
          balance: 0,
          isDeficit: false,
          suppliers: [],
          consumers: []
        };
      }
      balances[key].totalYield += parsed.quantity;
      balances[key].suppliers.push({ nodeId: n.id, nodeName: n.name, amount: parsed.quantity });
    });

    const requiresList = Array.isArray(n.requires) ? n.requires : [];
    requiresList.forEach(tag => {
      const parsed = parseResourceTag(tag);
      if (!parsed || parsed.quantity === null) return;
      const key = `${parsed.category}:${parsed.name}:${parsed.unit || 'unit'}`;
      if (!balances[key]) {
        balances[key] = {
          key,
          category: parsed.category,
          name: parsed.name,
          unit: parsed.unit,
          totalYield: 0,
          totalDemand: 0,
          balance: 0,
          isDeficit: false,
          suppliers: [],
          consumers: []
        };
      }
      balances[key].totalDemand += parsed.quantity;
      balances[key].consumers.push({ nodeId: n.id, nodeName: n.name, amount: parsed.quantity });
    });
  });

  Object.keys(balances).forEach(key => {
    const b = balances[key];
    b.balance = b.totalYield - b.totalDemand;
    b.isDeficit = b.balance < 0;
  });

  return balances;
}
window.auditQuantitativeResourceBalances = auditQuantitativeResourceBalances;

function checkCorridorBandwidth(edgeRecord, transmittedFlow) {
  const flow = typeof transmittedFlow === 'number' ? transmittedFlow : 0;
  const capacity = (edgeRecord && typeof edgeRecord.capacity === 'number') ? edgeRecord.capacity : null;

  if (capacity === null) {
    return {
      isOverloaded: false,
      flow,
      capacity: null,
      excess: 0
    };
  }

  const isOverloaded = flow > capacity;
  return {
    isOverloaded,
    flow,
    capacity,
    excess: isOverloaded ? flow - capacity : 0
  };
}
window.checkCorridorBandwidth = checkCorridorBandwidth;

function auditAllSupplyLines() {
  let totalSevered = 0;
  nodes.forEach(n => {
    const nid = n.id;
    const slotted = nodeSlottedModules[nid] || [];
    for (const mid of slotted) {
      const mod = MODULES_MANIFEST.find(m => m.id === mid);
      if (mod) {
        const res = checkModuleSupplyLine(nid, mod);
        if (!res.ok) totalSevered++;
      }
    }
    const adHocRes = checkNodeAdHocSupplyLine(nid);
    if (!adHocRes.ok) totalSevered += adHocRes.missing.length;
  });
  const badge = document.getElementById("supply-integrity-badge");
  if (badge) {
    if (totalSevered === 0) {
      badge.textContent = "✅ Supply Lines Intact";
      badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800";
    } else {
      badge.textContent = `⚠️ ${totalSevered} Severed Supply Line${totalSevered > 1 ? 's' : ''}`;
      badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 animate-pulse";
    }
  }
  return totalSevered;
}

function setSlottingMode(mode) {
  slottingMode = mode;
  const btnNode = document.getElementById("btn-mode-node");
  const btnEdge = document.getElementById("btn-mode-edge");
  const targetLabel = document.getElementById("slot-target-label");
  const selector = document.getElementById("slot-node-selector");

  if (mode === "node") {
    if (btnNode) btnNode.className = "px-2.5 py-1 rounded text-xs font-bold bg-sky-600 text-white";
    if (btnEdge) btnEdge.className = "px-2.5 py-1 rounded text-xs font-bold text-slate-400 hover:text-white";
    if (targetLabel) targetLabel.textContent = "Target Node:";
    selector.innerHTML = nodes.map(n => {
      return `<option value="${n.id}" ${n.id === targetSlottingNodeId ? 'selected' : ''}>#${n.id}: ${getNodeDisplayName(n)}</option>`;
    }).join("");
  } else {
    if (btnNode) btnNode.className = "px-2.5 py-1 rounded text-xs font-bold text-slate-400 hover:text-white";
    if (btnEdge) btnEdge.className = "px-2.5 py-1 rounded text-xs font-bold bg-sky-600 text-white";
    if (targetLabel) targetLabel.textContent = "Target Edge:";
    selector.innerHTML = links.map(l => {
      const srcId = l.from !== undefined ? l.from : l.source;
      const tgtId = l.to !== undefined ? l.to : l.target;
      const key = `${srcId}->${tgtId}`;
      const srcNode = getNode(srcId);
      const tgtNode = getNode(tgtId);
      const srcName = srcNode ? getNodeDisplayName(srcNode) : `#${srcId}`;
      const tgtName = tgtNode ? getNodeDisplayName(tgtNode) : `#${tgtId}`;
      const layerTag = l.layer === "hegemony" ? "👑 Hegemony" : (l.layer === "transit" ? "🛤️ Transit" : "🌐 Both");
      return `<option value="${key}" ${key === targetSlottingEdgeId ? 'selected' : ''}>[${layerTag}] #${srcId} (${srcName}) ➔ #${tgtId} (${tgtName})</option>`;
    }).join("");
  }

  updateTargetNodeSidebar();
  renderCatalogModules();
}

function renderStage5() {
  initSourcebookFilter();
  initResourceTagFilter();
  initAncestryFilter();
  initSourceFilter();
  initOptionGroupFilter();
  setSlottingMode(slottingMode);
}

const slotNodeSelector = document.getElementById("slot-node-selector");
if (slotNodeSelector) {
  slotNodeSelector.addEventListener("change", (e) => {
    if (slottingMode === "node") {
      targetSlottingNodeId = parseInt(e.target.value);
    } else {
      targetSlottingEdgeId = e.target.value;
    }
    updateTargetNodeSidebar();
    renderCatalogModules();
  });
}

function updateTargetNodeSidebar() {
  const isEdge = slottingMode === "edge";
  const badgeEl = document.getElementById("target-node-badge");
  const titleEl = document.getElementById("target-node-title");
  const cultEl = document.getElementById("target-node-culture");
  const statusEl = document.getElementById("target-node-status");
  const cardEl = document.getElementById("target-node-card");
  const scoreEl = document.getElementById("target-node-score");
  const modCountEl = document.getElementById("target-node-modcount");
  const listEl = document.getElementById("target-slotted-list");

  if (!badgeEl || !titleEl || !listEl) return;

  if (isEdge) {
    const [srcIdStr, tgtIdStr] = targetSlottingEdgeId.split("->");
    const srcId = parseInt(srcIdStr);
    const tgtId = parseInt(tgtIdStr);
    const srcNode = getNode(srcId);
    const tgtNode = getNode(tgtId);
    const srcName = srcNode ? getNodeDisplayName(srcNode) : `#${srcId}`;
    const tgtName = tgtNode ? getNodeDisplayName(tgtNode) : `#${tgtId}`;

    const linkObj = links.find(l => 
      ((l.from === srcId && l.to === tgtId) || (l.source === srcId && l.target === tgtId)) ||
      (l.type === "twoway" && ((l.from === tgtId && l.to === srcId) || (l.source === tgtId && l.target === srcId)))
    ) || { layer: "transit", type: "twoway" };

    const isBlocked = isEdgeBlocked(srcId, tgtId);
    const srcRevealed = isNodeRevealed(srcId);
    const tgtRevealed = isNodeRevealed(tgtId);
    const frontierEdge = fogOfWarMode && (!srcRevealed || !tgtRevealed);

    badgeEl.textContent = `Edge #${srcId} ➔ #${tgtId}`;
    titleEl.textContent = `${srcName} to ${tgtName}`;

    let corridorDesc = "Overland / Chasm Transit Corridor";
    if (linkObj.layer === "hegemony") {
      corridorDesc = "👑 Hegemonic Power Tether (Political / Religious Vector)";
    } else if (linkObj.layer === "transit") {
      corridorDesc = "🛤️ Physical Transit Corridor (Road / Pass / Waterway)";
    }
    if (isBlocked) corridorDesc = "⚠️ SEVERED CHOKEPOINT (No Transit/Supply)";
    cultEl.textContent = corridorDesc;

    statusEl.textContent = isBlocked ? "🛑 Severed Corridor" : "⚡ Active Corridor";
    statusEl.className = isBlocked
      ? "px-2 py-0.5 rounded text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800 animate-pulse"
      : "px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800";
    cardEl.textContent = isBlocked ? "Traversable: NO (Severed)" : `Traversable: YES (${linkObj.layer || 'transit'})`;
    scoreEl.textContent = isBlocked ? "Flow: 0.0 (Disconnected)" : `Directed Link (${linkObj.type || 'twoway'})`;

    const slotted = edgeSlottedModules[targetSlottingEdgeId] || [];
    modCountEl.textContent = slotted.length;

    let itemsHtml = `
      <div class="mb-2 p-2 rounded-lg ${isBlocked ? 'bg-rose-950/60 border border-rose-800' : 'bg-slate-900 border border-slate-800'} flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-bold ${isBlocked ? 'text-rose-300' : 'text-slate-300'}">Corridor Status:</span>
          <span class="font-black ${isBlocked ? 'text-rose-400' : 'text-emerald-400'}">${isBlocked ? 'SEVERED' : 'OPEN'}</span>
        </div>
        <button onclick="toggleEdgeBlocked('${targetSlottingEdgeId}')" class="w-full py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 ${
          isBlocked 
            ? 'bg-emerald-800 hover:bg-emerald-700 text-white' 
            : 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700'
        }">
          <span>${isBlocked ? '✓ Reopen Corridor' : '🛑 Sever Transit Edge'}</span>
        </button>
      </div>
    `;

    if (frontierEdge) {
      itemsHtml = `
        <div class="mb-2 p-2 rounded-lg bg-sky-950/50 border border-sky-800 text-[11px] text-sky-300 flex items-center gap-1.5">
          <span>🌫️</span>
          <span><strong>Frontier Route:</strong> Leads into unexplored Fog-of-War (${!srcRevealed ? '#' + srcId : ''} ${!tgtRevealed ? '#' + tgtId : ''}).</span>
        </div>
      ` + itemsHtml;
    }

    if (slotted.length === 0) {
      listEl.innerHTML = itemsHtml + `<span class="text-xs text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded-lg">No transit modules slotted on this corridor. Click "+ Slot Into Edge" on the left.</span>`;
    } else {
      listEl.innerHTML = itemsHtml + slotted.map(mid => {
        const mod = MODULES_MANIFEST.find(m => m.id === mid);
        if (!mod) return '';
        return `
          <div class="p-2.5 rounded-xl bg-slate-950 border border-indigo-900/60 flex flex-col gap-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sky-400 truncate">[${mod.id}] ${mod.title}</span>
              <button onclick="unslotEdgeModule('${targetSlottingEdgeId}', '${mod.id}')" class="text-rose-400 hover:text-rose-300 font-bold px-1" title="Remove">&times;</button>
            </div>
            <div class="text-[10px] text-slate-400">${mod.set}</div>
            <div class="text-[10px] text-emerald-400">Transit: ${mod.yields || 'Transit Flow'}</div>
          </div>
        `;
      }).join("");
    }
  } else {
    // Node Mode
    const nid = targetSlottingNodeId;
    const n = getNode(nid);
    const isRevealed = isNodeRevealed(nid);

    badgeEl.textContent = `Node #${nid}`;
    titleEl.textContent = getNodeDisplayName(n);
    cultEl.textContent = `${n.culture} (${n.cat})`;

    if (fogOfWarMode && !isRevealed) {
      statusEl.textContent = `🌫️ Fog of War (Unexplored)`;
      statusEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-700";
    } else {
      statusEl.textContent = n.cat ? `Node: ${n.cat}` : `Active Node`;
      statusEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700";
    }

    if (cardEl) cardEl.textContent = 'Active Node';
    if (scoreEl) scoreEl.textContent = n.tier ? `Tier ${n.tier}` : 'Active';

    const demoEl = document.getElementById("target-node-demographics");
    if (demoEl) {
      if (n && n.demographics) {
        const prim = n.demographics.primary ? `${n.demographics.primary.name} (${n.demographics.primary.percentage}%)` : 'Universal';
        const mins = (n.demographics.minorities || []).map(m => `${m.name} (${m.percentage}%)`).join(', ');
        demoEl.textContent = mins ? `${prim}, ${mins}` : prim;
      } else {
        demoEl.textContent = "Universal Mixed (100%)";
      }
    }

    const slotted = nodeSlottedModules[nid] || [];
    modCountEl.textContent = slotted.length;

    let fogBannerHtml = '';
    if (fogOfWarMode) {
      if (!isRevealed) {
        fogBannerHtml = `
          <div class="mb-3 p-3 rounded-xl bg-slate-950/90 border border-dashed border-sky-800 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-bold text-sky-300">
              <span>🌫️ Unexplored Frontier Zone</span>
              <span class="text-[10px] text-slate-400 font-mono">Living Campaign</span>
            </div>
            <p class="text-[11px] text-slate-400">
              Party has not discovered Node #${nid}. Node interactions remain latent until revealed.
            </p>
            <button onclick="revealNode(${nid}); updateTargetNodeSidebar();" class="w-full py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
              <span>👁️ Reveal Node</span>
            </button>
          </div>
        `;
      } else {
        fogBannerHtml = `
          <div class="mb-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Exploration: <strong class="text-emerald-400">👁️ Explored</strong></span>
            <button onclick="shroudNode(${nid}); updateTargetNodeSidebar();" class="text-[10px] text-slate-500 hover:text-slate-300 underline">Shroud in Fog</button>
          </div>
        `;
      }
    }

    const topoNodeObj = (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[String(nid)]) || n || {};
    const adHocProvides = Array.isArray(topoNodeObj.provides) ? topoNodeObj.provides : [];
    const adHocRequires = Array.isArray(topoNodeObj.requires) ? topoNodeObj.requires : [];
    const adHocAudit = checkNodeAdHocSupplyLine(nid);
    let adHocBannerHtml = '';
    if (adHocProvides.length > 0 || adHocRequires.length > 0) {
      adHocBannerHtml = `
        <div class="mb-2 p-2.5 rounded-xl bg-slate-950 border ${adHocAudit.ok ? 'border-emerald-900/60' : 'border-rose-800'} flex flex-col gap-1 text-xs">
          <div class="flex items-center justify-between font-bold ${adHocAudit.ok ? 'text-emerald-400' : 'text-rose-400'}">
            <span>📦 Local Resource Logistics</span>
            <span class="text-[10px]">${adHocAudit.ok ? '✅ Intact' : '⚠️ Deficit'}</span>
          </div>
          ${adHocProvides.length > 0 ? `<div class="text-[10px] text-emerald-300">Yields: ${adHocProvides.join(', ')}</div>` : ''}
          ${adHocRequires.length > 0 ? `<div class="text-[10px] ${adHocAudit.ok ? 'text-slate-300' : 'text-rose-300'}">Demands: ${adHocRequires.join(', ')}${!adHocAudit.ok ? ` (Missing: ${adHocAudit.missing.join(', ')})` : ''}</div>` : ''}
        </div>
      `;
    }

    if (slotted.length === 0) {
      listEl.innerHTML = fogBannerHtml + adHocBannerHtml + `<span class="text-xs text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded-lg">No modules slotted yet. Click "+ Slot Into Node" on the left.</span>`;
    } else {
      listEl.innerHTML = fogBannerHtml + adHocBannerHtml + slotted.map(mid => {
        const mod = MODULES_MANIFEST.find(m => m.id === mid);
        if (!mod) return '';
        const supplyCheck = checkModuleSupplyLine(nid, mod);
        return `
          <div class="p-2.5 rounded-xl bg-slate-950 border ${supplyCheck.ok ? 'border-slate-800' : 'border-rose-800/80'} flex flex-col gap-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sky-400 truncate">[${mod.id}] ${mod.title}</span>
              <button onclick="unslotModule(${nid}, '${mod.id}')" class="text-rose-400 hover:text-rose-300 font-bold px-1" title="Remove">&times;</button>
            </div>
            <div class="text-[10px] text-slate-400">${mod.set}</div>
            <div class="text-[10px] text-emerald-400">Yield: ${mod.yields || 'Advantage'}</div>
            ${!supplyCheck.ok ? (() => {
              const tick = getSeveranceTick(nid, mod.id);
              const tickDescriptions = [
                "Tick 0/4: Supply severed. Local emergency reserves holding.",
                "Tick 1/4: Local stockpiles depleted. Output reduced (-1 Yield).",
                "Tick 2/4: Operational strain. Rationing & civil unrest (+1 Regional Peril).",
                "Tick 3/4: Critical distress. Cascading failure imminent.",
                (typeof dial8ClimaxTriggerMode !== "undefined" && dial8ClimaxTriggerMode === "crisis")
                  ? "Tick 4/4: Critical threshold! 1-Session Heroic Crisis Gate Window Open."
                  : "Tick 4/4: Level 4 Systemic Collapse! Settlement ruined."
              ];
              const desc = tickDescriptions[tick] || tickDescriptions[0];
              const isCrisisMode = (typeof dial8ClimaxTriggerMode !== "undefined" && dial8ClimaxTriggerMode === "crisis");

              return `
                <div class="mt-2 p-2 rounded-lg bg-rose-950/70 border border-rose-800 text-xs flex flex-col gap-1.5">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-bold text-rose-300 truncate">⚠️ Severed: Missing ${supplyCheck.missing.join(", ")}</span>
                    <span class="font-mono font-bold text-rose-400 shrink-0 ml-1">Clock: ${tick}/4</span>
                  </div>

                  <!-- 4-segment gauge -->
                  <div class="grid grid-cols-4 gap-1 h-2.5 my-0.5">
                    <div class="rounded-sm border ${tick >= 1 ? 'bg-amber-500 border-amber-400 shadow-sm shadow-amber-500/50' : 'bg-slate-900 border-slate-800'}"></div>
                    <div class="rounded-sm border ${tick >= 2 ? 'bg-orange-500 border-orange-400 shadow-sm shadow-orange-500/50' : 'bg-slate-900 border-slate-800'}"></div>
                    <div class="rounded-sm border ${tick >= 3 ? 'bg-rose-600 border-rose-500 shadow-sm shadow-rose-600/50' : 'bg-slate-900 border-slate-800'}"></div>
                    <div class="rounded-sm border ${tick >= 4 ? (isCrisisMode ? 'bg-purple-600 border-purple-400 animate-pulse shadow-md shadow-purple-500/60' : 'bg-rose-700 border-rose-400 animate-ping') : 'bg-slate-900 border-slate-800'}"></div>
                  </div>

                  <div class="text-[10px] leading-snug ${tick === 4 ? (isCrisisMode ? 'text-purple-300 font-black' : 'text-rose-300 font-black') : 'text-slate-300'}">
                    ${desc}
                  </div>

                  <!-- Step buttons -->
                  <div class="flex items-center justify-between gap-1 mt-0.5">
                    <div class="flex items-center gap-1">
                      <button onclick="stepSeveranceTick(${nid}, '${mod.id}', -1)" ${tick === 0 ? 'disabled' : ''} class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
                        -1 Relief
                      </button>
                      <button onclick="stepSeveranceTick(${nid}, '${mod.id}', 1)" ${tick >= 4 ? 'disabled' : ''} class="px-2 py-0.5 rounded bg-rose-900 hover:bg-rose-800 text-rose-200 text-[10px] font-bold border border-rose-700 disabled:opacity-30 disabled:cursor-not-allowed">
                        +1 Tick Turn
                      </button>
                    </div>
                    <span class="text-[9px] text-slate-400 font-mono">Dial 8: ${isCrisisMode ? 'Crisis Gate' : 'Hardcore'}</span>
                  </div>

                  <!-- Crisis Gate Window or Cataclysm banner -->
                  ${tick === 4 ? (
                    isCrisisMode ? `
                      <div class="p-2 rounded bg-purple-950/90 border border-purple-500 text-purple-200 text-[10px] leading-relaxed shadow-lg shadow-purple-950/50 mt-1">
                        <div class="font-black text-purple-300 uppercase tracking-wide flex items-center gap-1">
                          <span>🚨 HEROIC CRISIS GATE ACTIVE</span>
                        </div>
                        <p class="mt-0.5">Threat Clock reached 4/4! Mandatory 1-Session Crisis Encounter Window open before irreversible collapse. Run an emergency mission to restore <strong>${supplyCheck.missing.join(', ')}</strong>!</p>
                        <div class="mt-1.5 flex items-center justify-between">
                          <span class="text-[9px] text-purple-400 italic truncate mr-1">Fallback: ${mod.fallback}</span>
                          <button onclick="stepSeveranceTick(${nid}, '${mod.id}', -2)" class="px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[9px] shrink-0">Relief (-2)</button>
                        </div>
                      </div>
                    ` : `
                      <div class="p-2 rounded bg-rose-950 border border-rose-600 text-rose-200 text-[10px] leading-relaxed shadow-lg mt-1">
                        <div class="font-black text-rose-300 uppercase tracking-wide">💀 SYSTEMIC COLLAPSE</div>
                        <p class="mt-0.5">Threat Clock 4/4 reached under Hardcore Cataclysm mode! Module destroyed; node infrastructure ruined.</p>
                      </div>
                    `
                  ) : `
                    <div class="p-1.5 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[10px] leading-tight">
                      <strong>Active Fallback:</strong> ${mod.fallback}
                    </div>
                  `}
                </div>
              `;
            })() : `
              <div class="text-[10px] text-emerald-400/80 font-semibold mt-0.5">✓ Supply Lines Active</div>
            `}
          </div>
        `;
      }).join("");
    }
  }

  auditAllSupplyLines();
}

function renderCatalogModules() {
  const grid = document.getElementById("modules-catalog-container") || document.getElementById("modules-catalog-grid");
  if (!grid) return;
  const searchInput = document.getElementById("catalog-search") || document.getElementById("mod-search-input");
  const search = searchInput ? searchInput.value.toLowerCase() : "";
  const chkRec = document.getElementById("chk-recommended-only");
  const recOnly = chkRec ? chkRec.checked : false;
  const isEdge = slottingMode === "edge";
  const nid = targetSlottingNodeId;
  const n = getNode(nid);
  const slotted = isEdge ? (edgeSlottedModules[targetSlottingEdgeId] || []) : (nodeSlottedModules[nid] || []);

  let filtered = MODULES_MANIFEST.filter(m => {
    if (selectedCatalogSourcebook !== "all" && m.sourcebookId && m.sourcebookId !== selectedCatalogSourcebook) return false;
    if (selectedCatalogSet !== "all" && !m.set.startsWith(selectedCatalogSet)) return false;
    if (selectedCatalogTier !== "all" && String(m.pipeline_tier) !== String(selectedCatalogTier)) return false;
    if (selectedCatalogTag !== "all") {
      const allTags = [...(m.provides || []), ...(m.requires || [])];
      const hasTag = allTags.some(t => t.toLowerCase().includes(selectedCatalogTag.toLowerCase()));
      if (!hasTag) return false;
    }
    if (selectedCatalogAncestry !== "all") {
      const isTraitSpecific = !!(m.ancestry_requirements || (m.tags && m.tags.includes("species_specific")));
      if (selectedCatalogAncestry === "universal" && isTraitSpecific) return false;
      if (selectedCatalogAncestry === "trait_specific" && !isTraitSpecific) return false;
    }
    if (selectedCatalogSource !== "all") {
      const isChillDude = !!((m.tags && m.tags.includes("chill_dude")) || (m.creator_source && m.creator_source.toLowerCase().includes("chill dude")));
      if (selectedCatalogSource === "chill_dude" && !isChillDude) return false;
      if (selectedCatalogSource === "non_chill_dude" && isChillDude) return false;
    }
    if (selectedCatalogOptionGroup !== "all") {
      if (selectedCatalogOptionGroup === "core_only" && m.is_option) return false;
      if (selectedCatalogOptionGroup === "options_only" && !m.is_option) return false;
      if (selectedCatalogOptionGroup !== "core_only" && selectedCatalogOptionGroup !== "options_only") {
        if (m.option_group !== selectedCatalogOptionGroup) return false;
      }
    }
    if (search) {
      const match = `${m.id} ${m.title} ${m.summary} ${m.yields} ${(m.tags||[]).join(' ')} ${m.creator_source||''} ${(m.provides||[]).join(' ')} ${(m.requires||[]).join(' ')}`.toLowerCase();
      if (!match.includes(search)) return false;
    }
    if (recOnly) {
      if (isEdge) {
        return m.set.includes("Transit") || m.id.startsWith("EDGE");
      }
      const rec = calculateRecommendationScore(nid, m);
      return rec.score >= 3;
    }
    return true;
  });

  if (!isEdge) {
    filtered.sort((a, b) => {
      const scoreA = calculateRecommendationScore(nid, a).score;
      const scoreB = calculateRecommendationScore(nid, b).score;
      return scoreB - scoreA;
    });
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center text-slate-500 py-12">No matching modules found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(m => {
    const isSlotted = slotted.includes(m.id);
    const rec = isEdge ? { score: 0, reasons: [] } : calculateRecommendationScore(nid, m);
    const isHighRec = !isEdge && rec.score >= 3;

    const buttonAction = isEdge
      ? (isSlotted ? `unslotEdgeModule('${targetSlottingEdgeId}', '${m.id}')` : `slotEdgeModule('${targetSlottingEdgeId}', '${m.id}')`)
      : (isSlotted ? `unslotModule(${nid}, '${m.id}')` : `slotModule(${nid}, '${m.id}')`);

    const buttonLabel = isSlotted
      ? 'Unslot Module'
      : (isEdge ? '+ Slot Into Edge' : '+ Slot Into Node');

    return `
      <div class="bg-slate-900/90 border ${isHighRec ? (rec.score >= 5 ? 'border-sky-500/70 shadow-sky-950/20' : 'border-emerald-600/50') : (rec.score < 0 ? 'border-rose-900/60' : 'border-slate-800')} rounded-2xl p-3.5 flex flex-col justify-between gap-2 shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-1 gap-1">
            <div class="flex items-center gap-1.5 overflow-hidden">
              <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-sky-400 border border-slate-700">${m.id}</span>
              ${m.is_option ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-700 shrink-0" title="Optional Addon: ${m.option_group || 'Addon'}">⚡ OPTION</span>` : ''}
              ${(m.tags && m.tags.includes('chill_dude')) ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800 shrink-0" title="Source: Chill Dude Explains">☕ Chill Dude</span>' : ''}
              <span class="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800 truncate max-w-[110px]" title="${m.sourcebookName || m.sourcebookId || 'Module'}">${m.sourcebookName || m.sourcebookId || 'Module'}</span>
            </div>
            <span class="text-[10px] text-slate-500 font-semibold truncate shrink-0">Tier ${m.pipeline_tier} • ${m.set.split('(')[0]}</span>
          </div>
          <h4 class="text-xs font-bold text-white mb-1 leading-snug">${m.title}</h4>
          ${isHighRec ? `
            <div class="px-2 py-0.5 rounded ${rec.score >= 5 ? 'bg-sky-950/70 border-sky-600/70 text-sky-300' : 'bg-emerald-950/70 border-emerald-700/70 text-emerald-300'} border text-[10px] font-bold flex items-center justify-between mb-1">
              <span>${rec.score >= 5 ? '⭐ Cultural Fit' : '✓ Compatible'} (+${rec.score})</span>
              <span class="text-[9px] font-normal truncate opacity-90">${rec.reasons.slice(0, 2).join(' • ')}</span>
            </div>
          ` : (rec.score < 0 ? `
            <div class="px-2 py-0.5 rounded bg-rose-950/70 border-rose-800/70 text-rose-300 border text-[10px] font-bold flex items-center justify-between mb-1">
              <span>⚠️ Cultural Friction (${rec.score})</span>
              <span class="text-[9px] font-normal truncate opacity-90">${rec.reasons.slice(0, 2).join(' • ')}</span>
            </div>
          ` : '')}
          <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">${m.summary}</p>
        </div>

        <div class="flex flex-col gap-1 pt-2 border-t border-slate-800">
          <div class="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Culture: <strong class="text-amber-300">${m.culture || 'Universal'}</strong></span>
            <span class="text-cyan-400">${m.color || ''}</span>
          </div>

          <button onclick="${buttonAction}" class="w-full mt-1 py-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
            isSlotted
              ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
              : (isEdge ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : (isHighRec ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black' : 'bg-sky-600 hover:bg-sky-500 text-white'))
          }">
            ${buttonLabel}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function slotModule(nid, modId) {
  if (!nodeSlottedModules[nid]) nodeSlottedModules[nid] = [];
  if (!nodeSlottedModules[nid].includes(modId)) {
    nodeSlottedModules[nid].push(modId);
  }
  updateTargetNodeSidebar();
  renderCatalogModules();
  updateHeaderMetrics();
  auditAllSupplyLines();
}

function unslotModule(nid, modId) {
  if (!nodeSlottedModules[nid]) return;
  nodeSlottedModules[nid] = nodeSlottedModules[nid].filter(id => id !== modId);
  updateTargetNodeSidebar();
  renderCatalogModules();
  updateHeaderMetrics();
  auditAllSupplyLines();
}

function slotEdgeModule(edgeKey, modId) {
  if (!edgeSlottedModules[edgeKey]) edgeSlottedModules[edgeKey] = [];
  if (!edgeSlottedModules[edgeKey].includes(modId)) {
    edgeSlottedModules[edgeKey].push(modId);
  }
  updateTargetNodeSidebar();
  renderCatalogModules();
  updateHeaderMetrics();
  auditAllSupplyLines();
}

function unslotEdgeModule(edgeKey, modId) {
  if (!edgeSlottedModules[edgeKey]) return;
  edgeSlottedModules[edgeKey] = edgeSlottedModules[edgeKey].filter(id => id !== modId);
  updateTargetNodeSidebar();
  renderCatalogModules();
  updateHeaderMetrics();
  auditAllSupplyLines();
}

// Set Filter Buttons
document.querySelectorAll(".mod-set-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedCatalogSet = btn.dataset.set;
    document.querySelectorAll(".mod-set-btn").forEach(b => {
      b.classList.remove("active", "bg-sky-600", "text-white");
      b.classList.add("bg-slate-800", "text-slate-300");
    });
    btn.classList.add("active", "bg-sky-600", "text-white");
    btn.classList.remove("bg-slate-800", "text-slate-300");
    renderCatalogModules();
  });
});

const tierSelectEl = document.getElementById("mod-tier-select");
if (tierSelectEl) {
  tierSelectEl.addEventListener("change", (e) => {
    selectedCatalogTier = e.target.value;
    renderCatalogModules();
  });
}

const tagSelectEl = document.getElementById("mod-resource-select");
if (tagSelectEl) {
  tagSelectEl.addEventListener("change", (e) => {
    selectedCatalogTag = e.target.value;
    renderCatalogModules();
  });
}

function initResourceTagFilter() {
  const sel = document.getElementById("mod-resource-select");
  if (!sel) return;
  const categories = new Set();
  MODULES_MANIFEST.forEach(m => {
    (m.provides || []).forEach(p => {
      const cat = p.split(':')[0].trim();
      if (cat) categories.add(cat);
    });
    (m.requires || []).forEach(r => {
      const cat = r.split(':')[0].trim();
      if (cat) categories.add(cat);
    });
  });
  Array.from(categories).sort().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = `Tag: ${cat}`;
    sel.appendChild(opt);
  });
}

function initSourcebookFilter() {
  const sel = document.getElementById("mod-sourcebook-select");
  if (!sel) return;
  const currentVal = sel.value || "all";
  sel.innerHTML = `<option value="all">All Sourcebooks</option>`;
  if (typeof CAMPAIGN_REGISTRY !== 'undefined' && Object.keys(CAMPAIGN_REGISTRY).length > 0) {
    Object.keys(CAMPAIGN_REGISTRY).forEach(cId => {
      const camp = CAMPAIGN_REGISTRY[cId];
      const opt = document.createElement("option");
      opt.value = cId;
      opt.textContent = (camp.metadata && camp.metadata.name) || cId;
      sel.appendChild(opt);
    });
  }
  sel.value = currentVal;
  sel.onchange = (e) => {
    selectedCatalogSourcebook = e.target.value;
    renderCatalogModules();
  };
}

const searchInputEl = document.getElementById("catalog-search") || document.getElementById("mod-search-input");
if (searchInputEl) {
  searchInputEl.addEventListener("input", renderCatalogModules);
}
const recOnlyEl = document.getElementById("chk-recommended-only");
if (recOnlyEl) {
  recOnlyEl.addEventListener("change", renderCatalogModules);
}

// Smart Slot All Function
function smartSlotAllNodes() {
  nodes.forEach(node => {
    nodeSlottedModules[node.id] = [];
  });

  // Pass 1: Infrastructure (Tier 3 / Set A / Life-Support / Infra)
  nodes.forEach(node => {
    const bestInfra = getBestModule(node.id, m => m.pipeline_tier === 3 || (m.set && (m.set.includes("Infra") || m.set.startsWith("Set A") || m.set.includes("Life-Support"))));
    if (bestInfra) nodeSlottedModules[node.id].push(bestInfra.id);
  });

  // Pass 2: Ecology (Tier 2 / Set B / Ecology / Maritime)
  nodes.forEach(node => {
    const bestEco = getBestModule(node.id, m => m.pipeline_tier === 2 || (m.set && (m.set.includes("Ecology") || m.set.startsWith("Set B") || m.set.includes("Maritime"))));
    if (bestEco) nodeSlottedModules[node.id].push(bestEco.id);
  });

  // Pass 3: Social Dynamics & Factions (Tier 1 or 4 / Set C / Set D / Governance / Social)
  nodes.forEach(node => {
    const bestSocial = getBestModule(node.id, m => m.pipeline_tier === 1 || m.pipeline_tier === 4 || (m.set && (m.set.includes("Social") || m.set.includes("Faction") || m.set.includes("Governance") || m.set.startsWith("Set C") || m.set.startsWith("Set D"))));
    if (bestSocial) nodeSlottedModules[node.id].push(bestSocial.id);
  });

  // Pass 4: Catalysts & Esoterica (Tier 5 / Set F / Set G / Catalyst / Climax)
  nodes.forEach(node => {
    const bestCatalyst = getBestModule(node.id, m => m.pipeline_tier === 5 || (m.set && (m.set.includes("Catalyst") || m.set.includes("Climax") || m.set.startsWith("Set F") || m.set.startsWith("Set G"))));
    if (bestCatalyst) nodeSlottedModules[node.id].push(bestCatalyst.id);
  });

  updateTargetNodeSidebar();
  renderCatalogModules();
  updateHeaderMetrics();
  auditAllSupplyLines();
  alert(`Smart Slotting Complete! All ${nodes.length} nodes equipped with synergetically matched Infrastructure, Ecology, Social, and Catalyst modules across all active campaign sourcebooks.`);
}

const btnSmartSlot = document.getElementById("btn-quick-smart-slot");
if (btnSmartSlot) {
  btnSmartSlot.addEventListener("click", smartSlotAllNodes);
}

const btnAutoSlot = document.getElementById("btn-auto-slot-target");
if (btnAutoSlot) {
  btnAutoSlot.addEventListener("click", () => {
    const nid = targetSlottingNodeId;
    nodeSlottedModules[nid] = [];

    const bestInfra = getBestModule(nid, m => m.pipeline_tier === 3 || (m.set && (m.set.includes("Infra") || m.set.startsWith("Set A") || m.set.includes("Life-Support"))));
    if (bestInfra) nodeSlottedModules[nid].push(bestInfra.id);
    const bestEco = getBestModule(nid, m => m.pipeline_tier === 2 || (m.set && (m.set.includes("Ecology") || m.set.startsWith("Set B") || m.set.includes("Maritime"))));
    if (bestEco) nodeSlottedModules[nid].push(bestEco.id);
    const bestSocial = getBestModule(nid, m => m.pipeline_tier === 1 || m.pipeline_tier === 4 || (m.set && (m.set.includes("Social") || m.set.includes("Faction") || m.set.includes("Governance") || m.set.startsWith("Set C") || m.set.startsWith("Set D"))));
    if (bestSocial) nodeSlottedModules[nid].push(bestSocial.id);
    const bestCatalyst = getBestModule(nid, m => m.pipeline_tier === 5 || (m.set && (m.set.includes("Catalyst") || m.set.includes("Climax") || m.set.startsWith("Set F") || m.set.startsWith("Set G"))));
    if (bestCatalyst) nodeSlottedModules[nid].push(bestCatalyst.id);

    updateTargetNodeSidebar();
    renderCatalogModules();
    updateHeaderMetrics();
    auditAllSupplyLines();
  });
}
