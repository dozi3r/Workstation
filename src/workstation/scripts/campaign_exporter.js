// --- STAGE 6: CAMPAIGN EXPORT (THING 3) ---
let activeExportTab = "json";

if (typeof window.getNodeDisplayName !== "function") {
  window.getNodeDisplayName = function(n) {
    if (!n) return "Unknown Node";
    return n.name || n.label || ("Node " + (n.id !== undefined ? n.id : "?"));
  };
}

function resolveMapNodes(mapOrTopo) {
  if (typeof CampaignMutationEngine !== "undefined" && CampaignMutationEngine && typeof CampaignMutationEngine.getNodesList === "function") {
    return CampaignMutationEngine.getNodesList(mapOrTopo);
  }
  if (!mapOrTopo) return [];
  const col = Array.isArray(mapOrTopo) ? mapOrTopo : (mapOrTopo.nodes || (mapOrTopo.activeTopology && mapOrTopo.activeTopology.nodes));
  if (Array.isArray(col)) return col.filter(Boolean);
  if (col && typeof col === "object") return Object.values(col).filter(Boolean);
  return [];
}

function findNodeObj(mapOrTopo, nodeId) {
  if (typeof CampaignMutationEngine !== "undefined" && CampaignMutationEngine && typeof CampaignMutationEngine.getNodeById === "function") {
    return CampaignMutationEngine.getNodeById(mapOrTopo, nodeId);
  }
  if (nodeId === null || nodeId === undefined) return null;
  const list = resolveMapNodes(mapOrTopo);
  return list.find(n => n && String(n.id) === String(nodeId)) || null;
}

function generateCampaignJSON() {
  if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();

  const campaignData = {
    metadata: {
      campaignName: (typeof currentCampaignName !== "undefined" ? currentCampaignName : "Custom Sandbox Campaign"),
      generatedAt: new Date().toISOString(),
      creator: "Lead World Architect",
      version: "2.0.0-nested"
    },
    rootMapId: (typeof maps !== "undefined" && maps["map_root"]) ? "map_root" : "map_root",
    activeMapId: (typeof activeMapId !== "undefined") ? activeMapId : "map_root",
    maps: (typeof maps !== "undefined" && Object.keys(maps).length > 0) ? maps : null,
    globalDials: {
      metaphysicalConduits: document.getElementById("dial-metaphysics") ? document.getElementById("dial-metaphysics").checked : true,
      resourceScarcity: document.getElementById("dial-resource-scarcity") ? document.getElementById("dial-resource-scarcity").checked : true,
      frontierHazards: document.getElementById("dial-frontier-hazard") ? document.getElementById("dial-frontier-hazard").checked : true,
      techDisparity: document.getElementById("dial-tech-disparity") ? document.getElementById("dial-tech-disparity").checked : true,
      key22Inversion: document.getElementById("dial-key22-inversion") ? document.getElementById("dial-key22-inversion").checked : true,
      cvfSociology: document.getElementById("dial-cvf-sociology") ? document.getElementById("dial-cvf-sociology").checked : true,
      dial8ClimaxTrigger: {
        mode: (typeof dial8ClimaxTriggerMode !== "undefined" ? dial8ClimaxTriggerMode : "crisis"),
        name: (typeof dial8ClimaxTriggerMode !== "undefined" && dial8ClimaxTriggerMode === "crisis") ? "Mode A: Crisis Gate Window" : "Mode B: Hardcore Cataclysm"
      },
      tier0Substratum: {
        enabled: typeof tier0SubstratumEnabled !== "undefined" ? tier0SubstratumEnabled : true,
        mode: typeof tier0SubstratumMode !== "undefined" ? tier0SubstratumMode : "smooth"
      }
    },
    factions: typeof campaignFactions !== "undefined" ? campaignFactions : [],
    nodes: resolveMapNodes(typeof nodes !== "undefined" && Array.isArray(nodes) && nodes.length > 0 ? nodes : (typeof Workstation !== "undefined" ? Workstation.activeTopology : null)).map(n => {
      return {
        id: n.id,
        name: n.name || getNodeDisplayName(n),
        displayName: getNodeDisplayName(n),
        coordinates: n.coordinates,
        tier: n.tier || (n.cat ? `Tier 2/3 ${n.cat}` : "Active Node"),
        category: n.cat,
        culture: n.culture,
        faction: n.faction || "neutral",
        layerId: n.layerId || "layer-nodes",
        childMapId: n.childMapId || null,
        customNotes: n.customNotes || "",
        locked: !!n.locked,
        visible: n.visible !== false,
        color: n.color || null,
        odv: n.odv || null,
        odvOverridden: !!n.odvOverridden,
        demographics: n.demographics || null,
        factionPresence: Array.isArray(n.factionPresence) ? n.factionPresence : [],
        partyRapport: n.partyRapport || null,
        provides: Array.isArray(n.provides) ? n.provides : [],
        requires: Array.isArray(n.requires) ? n.requires : [],
        exportDown: n.exportDown !== false,
        importUp: n.importUp !== false,
        incomingInfluenceSources: getNodeIncomingSources(n.id),
        adjacentNeighbors: getNodeAdjacents(n.id),
        slottedModules: (nodeSlottedModules[n.id] || []).map(mid => {
          const mod = MODULES_MANIFEST.find(m => m.id === mid);
          const check = mod ? checkModuleSupplyLine(n.id, mod) : { ok: true, missing: [] };
          return mod ? {
            id: mod.id,
            title: mod.title,
            set: mod.set,
            yields: mod.yields,
            threatClock: (typeof getSeveranceTick === "function" ? getSeveranceTick(n.id, mod.id) : 0),
            supplyIntact: check.ok,
            missingRequirements: check.missing,
            activeFallback: !check.ok ? mod.fallback : null
          } : { id: mid };
        })
      };
    }),
    slottedEdgeModules: edgeSlottedModules,
    severedEdges: (typeof blockedEdges !== "undefined" ? Object.keys(blockedEdges) : []),
    moduleSeveranceClocks: (typeof moduleSeveranceClocks !== "undefined" ? moduleSeveranceClocks : {}),
    influenceLinks: links,
    layers: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.layers) || (typeof getDefaultLayers === "function" ? getDefaultLayers() : []),
    shapes: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.shapes) || [],
    npcs: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.npcs) || [],
    quests: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.quests) || [],
    items: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.items) || [],
    trackers: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.trackers) || [],
    factions: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.factions) || [],
    custom_modules: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.custom_modules) || [],
    edgeData: (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.edgeData) || {},
    mapMetadata: (typeof activeMapMetadata !== "undefined" && activeMapMetadata) ? {
      name: activeMapMetadata.name,
      width: activeMapMetadata.width,
      height: activeMapMetadata.height,
      opacity: activeMapMetadata.opacity,
      dataUrl: activeMapMetadata.dataUrl
    } : null
  };
  return JSON.stringify(campaignData, null, 2);
}

function generateCampaignMarkdown() {
  let cName = (typeof currentCampaignName !== "undefined" ? currentCampaignName : "CUSTOM POINTCRAWL CAMPAIGN");
  let md = `# ${cName.toUpperCase()} DOSSIER\n\n`;
  md += `*Generated: ${new Date().toLocaleDateString()} | Panopticon Key: ${globalInversion ? 'LOCKDOWN ACTIVE' : 'Equilibrium'}*\n\n`;
  md += `## 1. Active Nodes Roster\n\n`;
  nodes.forEach(n => {
    md += `* **Node #${n.id}: ${getNodeDisplayName(n)}** | Culture: ${n.culture} | Category: ${n.cat}\n`;
  });

  md += `\n## 2. All Nodes & Slotted Modules\n\n`;
  let severedModulesCount = 0;
  nodes.forEach(n => {
    const mods = nodeSlottedModules[n.id] || [];
    md += `### Node #${n.id}: ${getNodeDisplayName(n)}\n`;
    md += `* **Category:** ${n.cat} | **Culture:** ${n.culture}\n`;
    md += `* **Slotted Modules (${mods.length}):**\n`;
    mods.forEach(mid => {
      const mod = MODULES_MANIFEST.find(m => m.id === mid);
      if (mod) {
        const check = checkModuleSupplyLine(n.id, mod);
        md += `  * **[${mod.id}]** ${mod.title} (${mod.yields})\n`;
        if (!check.ok) {
          severedModulesCount++;
          md += `    * ⚠️ **Severed Supply Line**: Missing ${check.missing.join(", ")}\n`;
          md += `    * ⚙️ **Active Fallback**: ${mod.fallback}\n`;
        }
      }
    });
    md += `\n`;
  });

  md += `## 3. Transit Edge Corridors & Slotted Edge Modules\n\n`;
  const slottedEdgeKeys = Object.keys(edgeSlottedModules).filter(k => edgeSlottedModules[k] && edgeSlottedModules[k].length > 0);
  if (slottedEdgeKeys.length === 0) {
    md += `*No transit modules currently slotted on physical edge corridors.*\n\n`;
  } else {
    slottedEdgeKeys.forEach(k => {
      const parsed = (typeof CampaignMutationEngine !== "undefined" && CampaignMutationEngine.parseCorridorKey)
        ? CampaignMutationEngine.parseCorridorKey(k)
        : null;
      const uId = parsed ? parsed.u : k.split("->")[0];
      const vId = parsed ? parsed.v : k.split("->")[1];
      const uStr = parsed ? parsed.uStr : String(uId || "");
      const vStr = parsed ? parsed.vStr : String(vId || "");
      const uNode = getNode(uId);
      const vNode = getNode(vId);
      md += `* **Edge #${uStr} (${uNode ? getNodeDisplayName(uNode) : uStr}) ➔ #${vStr} (${vNode ? getNodeDisplayName(vNode) : vStr})**:\n`;
      edgeSlottedModules[k].forEach(mid => {
        const mod = MODULES_MANIFEST.find(m => m.id === mid);
        if (mod) md += `  * **[${mod.id}]** ${mod.title} — Yields: ${mod.yields}\n`;
      });
    });
    md += `\n`;
  }

  md += `## 4. Supply Line Integrity Summary\n\n`;
  if (severedModulesCount === 0) {
    md += `*✅ All slotted module material dependencies are fully satisfied across the network graph.*\n`;
  } else {
    md += `*⚠️ Detected ${severedModulesCount} slotted module(s) operating in degraded Standalone Fallback mode due to severed upstream supply lines.*\n`;
  }
  return md;
}

async function generateHydratedCampaignJSON() {
  if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();
  const rawJson = generateCampaignJSON();
  let parsed = null;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    return rawJson;
  }
  if (typeof hydrateMapsWithImageDataUrls === "function" && parsed && parsed.maps) {
    try {
      parsed.maps = await hydrateMapsWithImageDataUrls(parsed.maps);
      const curActive = parsed.activeMapId || "map_root";
      if (parsed.maps[curActive] && parsed.maps[curActive].mapMetadata) {
        parsed.mapMetadata = { ...parsed.maps[curActive].mapMetadata };
      }
    } catch (err) {
      console.warn("[Stage6] Error hydrating maps for export:", err);
    }
  }
  return JSON.stringify(parsed, null, 2);
}
window.generateHydratedCampaignJSON = generateHydratedCampaignJSON;

async function renderStage6() {
  const area = document.getElementById("campaign-export-area");
  if (!area) return;
  if (activeExportTab === "json") {
    area.value = generateCampaignJSON();
    if (typeof generateHydratedCampaignJSON === "function") {
      try {
        const hydratedJson = await generateHydratedCampaignJSON();
        if (activeExportTab === "json") {
          area.value = hydratedJson;
        }
      } catch (e) {
        console.warn("[Stage6] Hydrated render error:", e);
      }
    }
  } else {
    area.value = generateCampaignMarkdown();
  }
}

const tabJson = document.getElementById("export-tab-json");
if (tabJson) {
  tabJson.addEventListener("click", () => {
    activeExportTab = "json";
    tabJson.className = "px-3 py-1 rounded text-xs font-bold text-sky-400 bg-sky-950/80 border border-sky-800";
    const tabMd = document.getElementById("export-tab-md");
    if (tabMd) tabMd.className = "px-3 py-1 rounded text-xs font-semibold text-slate-400 hover:text-white";
    renderStage6();
  });
}

const tabMd = document.getElementById("export-tab-md");
if (tabMd) {
  tabMd.addEventListener("click", () => {
    activeExportTab = "md";
    tabMd.className = "px-3 py-1 rounded text-xs font-bold text-sky-400 bg-sky-950/80 border border-sky-800";
    const tabJsonEl = document.getElementById("export-tab-json");
    if (tabJsonEl) tabJsonEl.className = "px-3 py-1 rounded text-xs font-semibold text-slate-400 hover:text-white";
    renderStage6();
  });
}

const btnCopyJson = document.getElementById("btn-copy-campaign-json");
if (btnCopyJson) {
  btnCopyJson.addEventListener("click", () => {
    const area = document.getElementById("campaign-export-area");
    const text = area ? area.value : "";
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopyJson.textContent;
      btnCopyJson.textContent = "Copied to Clipboard!";
      setTimeout(() => btnCopyJson.textContent = orig, 1800);
    });
  });
}

const btnDownloadJson = document.getElementById("btn-download-campaign-json");
if (btnDownloadJson) {
  btnDownloadJson.addEventListener("click", () => {
    const isJson = activeExportTab === "json";
    const area = document.getElementById("campaign-export-area");
    const content = area ? area.value : "";
    const blob = new Blob([content], { type: isJson ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (typeof currentCampaignName !== "undefined" ? currentCampaignName.toLowerCase().replace(/\s+/g, "_") : "campaign");
    a.download = isJson ? `${slug}.json` : `${slug}_dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

const btnOpenExport = document.getElementById("btn-open-export");
if (btnOpenExport) {
  btnOpenExport.addEventListener("click", () => {
    if (typeof setStage === "function") setStage(6);
    else if (typeof setInspectorTab === "function") setInspectorTab("export");
  });
}

// ============================================================================
// CAMPAIGN JSON IMPORT & STATE RESTORATION ENGINE
// ============================================================================

function handleCampaignFileIngestion(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      importCampaignData(data, file.name);
    } catch (err) {
      alert("Failed to parse campaign JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

function importCampaignData(data, sourceLabel = "") {
  if (!data || typeof data !== "object") {
    alert("Invalid campaign data format: Expected a valid JSON object.");
    return;
  }

  // 1. Campaign Name & Metadata
  if (data.metadata && data.metadata.campaignName) {
    currentCampaignName = data.metadata.campaignName;
  } else if (data.name) {
    currentCampaignName = data.name;
  } else if (data.campaignName) {
    currentCampaignName = data.campaignName;
  } else if (sourceLabel) {
    currentCampaignName = sourceLabel.replace(/\.json$/i, "").replace(/[-_]/g, " ");
  }

  // Determine root/active map ID if data has maps
  const rootMapId = data.activeMapId || data.rootMapId || (data.maps && Object.keys(data.maps)[0]) || "map_root";
  const mapScope = (data.maps && data.maps[rootMapId]) ? data.maps[rootMapId] : null;

  // Ensure Workstation.activeTopology container exists
  if (typeof Workstation !== "undefined") {
    if (!Workstation.activeTopology) {
      Workstation.activeTopology = {
        id: rootMapId,
        name: currentCampaignName,
        nodes: {},
        links: [],
        npcs: [],
        quests: [],
        items: [],
        trackers: [],
        tickets: [],
        factions: []
      };
    } else {
      Workstation.activeTopology.name = currentCampaignName;
      Workstation.activeTopology.id = rootMapId;
    }
  }

  // 2. Parse & Hydrate Nodes
  let rawNodes = [];
  if (Array.isArray(data.nodes)) {
    rawNodes = data.nodes;
  } else if (data.nodes && typeof data.nodes === "object") {
    rawNodes = Object.keys(data.nodes)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(k => ({ id: (isNaN(k) || String(k).includes('-')) ? k : parseInt(k), ...data.nodes[k] }));
  } else if (data.preset && data.preset.nodes) {
    if (Array.isArray(data.preset.nodes)) {
      rawNodes = data.preset.nodes;
    } else {
      rawNodes = Object.keys(data.preset.nodes)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(k => ({ id: (isNaN(k) || String(k).includes('-')) ? k : parseInt(k), ...data.preset.nodes[k] }));
    }
  } else if (mapScope && mapScope.nodes) {
    if (Array.isArray(mapScope.nodes)) {
      rawNodes = mapScope.nodes;
    } else if (typeof mapScope.nodes === "object") {
      rawNodes = Object.keys(mapScope.nodes)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(k => ({ id: (isNaN(k) || String(k).includes('-')) ? k : parseInt(k), ...mapScope.nodes[k] }));
    }
  }

  if (rawNodes.length > 0) {
    nodes = rawNodes.map(n => {
      const nid = (isNaN(n.id) || String(n.id).includes('-')) ? n.id : parseInt(n.id);
      const rawX = (n.coordinates && n.coordinates.x !== undefined) ? n.coordinates.x : (n.x !== undefined ? n.x : 100);
      const rawY = (n.coordinates && n.coordinates.y !== undefined) ? n.coordinates.y : (n.y !== undefined ? n.y : 100);
      const numX = Number(rawX);
      const numY = Number(rawY);
      const finalX = Number.isFinite(numX) ? numX : 100;
      const finalY = Number.isFinite(numY) ? numY : 100;

      const hubEl = n.hubEligibility || (n.eligibleForHub === false || n.eligible === false ? "never" : (n.eligible === "always" ? "always" : "candidate"));
      return {
        id: nid,
        name: n.name || n.displayName || `POI #${nid}`,
        displayName: n.displayName || n.name || `POI #${nid}`,
        x: finalX,
        y: finalY,
        coordinates: { x: finalX, y: finalY },
        cat: n.category || n.cat || "Frontier Outpost",
        culture: n.culture || "Hierarchy",
        shape: n.shape || 'circle',
        radius: n.radius !== undefined ? n.radius : undefined,
        adj: Array.isArray(n.adj) ? n.adj : (Array.isArray(n.adjacentNeighbors) ? n.adjacentNeighbors : []),
        infBy: Array.isArray(n.infBy) ? n.infBy : (Array.isArray(n.incomingInfluenceSources) ? n.incomingInfluenceSources : []),
        hubEligibility: hubEl,
        eligible: hubEl !== "never",
        faction: n.faction || "neutral",
        wave: parseInt(n.wave) || 1,
        childMapId: n.childMapId || null,
        customNotes: n.customNotes || "",
        locked: !!n.locked,
        visible: n.visible !== false,
        color: n.color || null,
        odv: n.odv || null,
        odvOverridden: !!n.odvOverridden,
        demographics: (typeof normalizeDemographics === 'function') ? normalizeDemographics(n.demographics) : (n.demographics || null),
        factionPresence: Array.isArray(n.factionPresence) ? n.factionPresence : [],
        partyRapport: (typeof normalizePartyRapport === 'function') ? normalizePartyRapport(n.partyRapport) : (n.partyRapport || null),
        provides: Array.isArray(n.provides) ? n.provides : [],
        requires: Array.isArray(n.requires) ? n.requires : [],
        exportDown: n.exportDown !== false,
        importUp: n.importUp !== false
      };
    });
    nodes.sort((a, b) => {
      const na = parseInt(a.id);
      const nb = parseInt(b.id);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a.id).localeCompare(String(b.id));
    });
  }

  // 3. Parse & Hydrate Links
  const rawLinks = data.influenceLinks || data.links || (data.preset && data.preset.links) || (mapScope && mapScope.links) || [];
  if (Array.isArray(rawLinks)) {
    links = rawLinks.map(l => ({
      from: (isNaN(l.from) || String(l.from).includes('-')) ? l.from : parseInt(l.from),
      to: (isNaN(l.to) || String(l.to).includes('-')) ? l.to : parseInt(l.to),
      type: l.type || "oneway",
      layer: l.layer || "transit",
      suit: l.suit || "swords",
      reversed: !!l.reversed,
      vectors: l.vectors ? { ...l.vectors } : undefined,
      customNotes: l.customNotes || ""
    }));
  }

  // 4. Slotted Modules (Nodes & Corridors)
  nodeSlottedModules = {};
  nodes.forEach(n => { nodeSlottedModules[n.id] = []; });
  if (data.nodeSlottedModules && typeof data.nodeSlottedModules === "object") {
    Object.keys(data.nodeSlottedModules).forEach(k => {
      const nid = parseInt(k);
      nodeSlottedModules[nid] = Array.isArray(data.nodeSlottedModules[k]) ? [...data.nodeSlottedModules[k]] : [];
    });
  } else if (Array.isArray(rawNodes)) {
    rawNodes.forEach(n => {
      const nid = parseInt(n.id);
      if (Array.isArray(n.slottedModules)) {
        nodeSlottedModules[nid] = n.slottedModules.map(m => (typeof m === "object" && m.id) ? m.id : m);
      }
    });
  }

  if (data.slottedEdgeModules && typeof data.slottedEdgeModules === "object") {
    edgeSlottedModules = JSON.parse(JSON.stringify(data.slottedEdgeModules));
  } else if (data.edgeSlottedModules && typeof data.edgeSlottedModules === "object") {
    edgeSlottedModules = JSON.parse(JSON.stringify(data.edgeSlottedModules));
  } else {
    edgeSlottedModules = {};
  }

  // 5. Threat Clocks & Dials
  if (data.moduleSeveranceClocks && typeof data.moduleSeveranceClocks === "object") {
    moduleSeveranceClocks = JSON.parse(JSON.stringify(data.moduleSeveranceClocks));
  } else {
    moduleSeveranceClocks = {};
  }

  // 6. Factions
  if (Array.isArray(data.factions) && typeof campaignFactions !== "undefined") {
    campaignFactions = JSON.parse(JSON.stringify(data.factions));
    if (typeof renderFactionRoster === "function") renderFactionRoster();
  }

  // 7. Global Dials
  if (data.globalDials) {
    if (data.globalDials.dial8ClimaxTrigger && typeof setDial8Mode === "function") {
      setDial8Mode(data.globalDials.dial8ClimaxTrigger.mode || "crisis");
    }
    if (data.globalDials.tier0Substratum) {
      if (data.globalDials.tier0Substratum.enabled !== undefined) {
        tier0SubstratumEnabled = !!data.globalDials.tier0Substratum.enabled;
        const el = document.getElementById("dial-tier0-enable");
        if (el) el.checked = tier0SubstratumEnabled;
      }
      if (data.globalDials.tier0Substratum.mode !== undefined) {
        tier0SubstratumMode = data.globalDials.tier0Substratum.mode;
        const el = document.getElementById("dial-tier0-mode");
        if (el) el.value = tier0SubstratumMode;
      }
    }
    const dialMap = [
      ["metaphysicalConduits", "dial-metaphysics"],
      ["resourceScarcity", "dial-resource-scarcity"],
      ["frontierHazards", "dial-frontier-hazard"],
      ["techDisparity", "dial-tech-disparity"],
      ["key22Inversion", "dial-key22-inversion"],
      ["cvfSociology", "dial-cvf-sociology"]
    ];
    dialMap.forEach(([prop, elId]) => {
      if (data.globalDials[prop] !== undefined) {
        const el = document.getElementById(elId);
        if (el) el.checked = !!data.globalDials[prop];
      }
    });
  }

  // 8. Map Background Image Ingestion (if embedded)
  if (data.mapMetadata && data.mapMetadata.dataUrl && typeof applyMapImageToCanvas === "function") {
    if (typeof saveMapImageToDB === "function") {
      saveMapImageToDB(data.mapMetadata.name, data.mapMetadata.dataUrl, data.mapMetadata.width, data.mapMetadata.height, data.mapMetadata.opacity || 0.85);
    }
    applyMapImageToCanvas(data.mapMetadata.dataUrl, data.mapMetadata.width, data.mapMetadata.height, data.mapMetadata.opacity || 0.85, true);
  }

  // 9. Recalculate Adjacency & Sources
  nodes.forEach(n => {
    n.infBy = getNodeIncomingSources(n.id);
    n.adj = getNodeAdjacents(n.id);
  });

  // 10. Fog of War / Revealed Nodes
  if (data.revealedNodes && typeof data.revealedNodes === "object") {
    revealedNodes = { ...data.revealedNodes };
  } else {
    revealedNodes = {};
    nodes.forEach(n => {
      revealedNodes[n.id] = true;
    });
  }

  // 13b. Restore Maps Hierarchy & Registry
  if (data.maps && typeof data.maps === "object" && Object.keys(data.maps).length > 0) {
    maps = JSON.parse(JSON.stringify(data.maps));
    activeMapId = data.activeMapId || data.rootMapId || "map_root";
    if (!maps[activeMapId]) activeMapId = Object.keys(maps)[0];
    if (typeof switchActiveMap === "function") {
      switchActiveMap(activeMapId);
    } else if (typeof syncAdapterToWorkstationTopology === "function") {
      syncAdapterToWorkstationTopology();
    }
  } else {
    // Legacy flat single-map export: Wrap into maps["map_root"]
    if (typeof initMapsRegistry === "function") initMapsRegistry(true);
    if (typeof syncAdapterToWorkstationTopology === "function") syncAdapterToWorkstationTopology();
  }

  // 13c. Restore Active Campaign Entities (NPCs, Quests, Items, Trackers, Tickets)
  const targetTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) 
    ? Workstation.activeTopology 
    : (window.Workstation && window.Workstation.activeTopology ? window.Workstation.activeTopology : null);

  if (targetTopo) {
    const srcEntities = data.entities 
      || (data.activeTopology && data.activeTopology.entities)
      || data.activeTopology 
      || data;

    if (Array.isArray(srcEntities.npcs)) targetTopo.npcs = JSON.parse(JSON.stringify(srcEntities.npcs));
    else if (Array.isArray(data.npcs)) targetTopo.npcs = JSON.parse(JSON.stringify(data.npcs));

    if (Array.isArray(srcEntities.quests)) targetTopo.quests = JSON.parse(JSON.stringify(srcEntities.quests));
    else if (Array.isArray(data.quests)) targetTopo.quests = JSON.parse(JSON.stringify(data.quests));

    if (Array.isArray(srcEntities.items)) targetTopo.items = JSON.parse(JSON.stringify(srcEntities.items));
    else if (Array.isArray(data.items)) targetTopo.items = JSON.parse(JSON.stringify(data.items));

    if (Array.isArray(srcEntities.trackers)) targetTopo.trackers = JSON.parse(JSON.stringify(srcEntities.trackers));
    else if (Array.isArray(data.trackers)) targetTopo.trackers = JSON.parse(JSON.stringify(data.trackers));

    if (Array.isArray(srcEntities.tickets)) targetTopo.tickets = JSON.parse(JSON.stringify(srcEntities.tickets));
    else if (Array.isArray(data.tickets)) targetTopo.tickets = JSON.parse(JSON.stringify(data.tickets));

    if (Array.isArray(srcEntities.factions)) targetTopo.factions = JSON.parse(JSON.stringify(srcEntities.factions));
    else if (Array.isArray(data.factions)) targetTopo.factions = JSON.parse(JSON.stringify(data.factions));

    if (Array.isArray(srcEntities.custom_modules)) targetTopo.custom_modules = JSON.parse(JSON.stringify(srcEntities.custom_modules));
    else if (Array.isArray(data.custom_modules)) targetTopo.custom_modules = JSON.parse(JSON.stringify(data.custom_modules));

    if (data.edgeData && typeof data.edgeData === 'object') targetTopo.edgeData = JSON.parse(JSON.stringify(data.edgeData));
    if (typeof ensureEntityCollections === 'function') ensureEntityCollections(targetTopo);
    if (typeof syncCustomModulesToCatalog === 'function') syncCustomModulesToCatalog(targetTopo);
  }

  if (typeof renderEntityManagerTree === "function") renderEntityManagerTree();
  if (typeof renderEntityManagerList === "function") renderEntityManagerList();
  if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();

  // 14. UI Updates
  if (typeof renderCanvasGraph === "function") renderCanvasGraph();
  if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
  if (typeof buildWikiIndex === "function") buildWikiIndex();
  if (typeof renderInspectorDrawer === "function") renderInspectorDrawer();
  if (typeof renderStage6 === "function") renderStage6();
  if (typeof renderActiveStage === "function") renderActiveStage();

  // Reset tool to select
  if (typeof setTool === "function") setTool("select");

  // Status banner notification
  const banner = document.getElementById("canvas-tool-status");
  if (banner) {
    banner.textContent = `Campaign imported: "${currentCampaignName}" (${nodes.length} nodes, ${links.length} corridors)`;
    setTimeout(() => {
      if (banner && currentTool === "select") {
        banner.textContent = "Select & Move Mode: Click/drag nodes. Click edge to inspect.";
      }
    }, 4000);
  }
}

/**
 * In-App Entity Module Pack Exporter (Stage 6 / Ctrl+E)
 * Bundles selected submap branch, stationed entities, and IndexedDB graphics into .csmod
 */
async function executeExportCsmodPack() {
  if (typeof document === 'undefined') return;
  const submapSelect = document.getElementById('export-pack-submap-select');
  const packIdInput = document.getElementById('export-pack-id');
  const titleInput = document.getElementById('export-pack-title');
  const authorInput = document.getElementById('export-pack-author');
  const domainInput = document.getElementById('export-pack-domain');
  const descInput = document.getElementById('export-pack-desc');

  const rootSubmapId = submapSelect ? submapSelect.value : '';
  if (!rootSubmapId) {
    if (typeof alert === 'function') alert('Please select a submap to export as pack.');
    return;
  }

  const packId = (packIdInput && packIdInput.value.trim()) || `pack_${rootSubmapId}_${Date.now()}`;
  const packName = (titleInput && titleInput.value.trim()) || rootSubmapId;
  const author = (authorInput && authorInput.value.trim()) || 'Creator Studio User';
  const ipDomain = (domainInput && domainInput.value.trim()) || 'Custom';
  const description = (descInput && descInput.value.trim()) || 'Exported from Creator Studio';

  const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
  const allMaps = (typeof maps !== 'undefined' && maps) ? maps : (topo && topo.maps ? topo.maps : {});
  const targetMap = allMaps[rootSubmapId];
  if (!targetMap) {
    if (typeof alert === 'function') alert('Selected submap not found in maps registry.');
    return;
  }

  // Collect target submaps (root submap plus any nested child submaps)
  const mapsToExport = {};
  mapsToExport[rootSubmapId] = targetMap;

  // Collect all maps in hierarchy (root + recursive child maps) via BFS
  const queue = [rootSubmapId];
  const allExportedMapIds = new Set([rootSubmapId]);

  while (queue.length > 0) {
    const curMid = queue.shift();
    const curMap = mapsToExport[curMid];
    if (!curMap) continue;
    const curNodes = resolveMapNodes(curMap);
    for (const n of curNodes) {
      if (n && n.childMapId && allMaps[n.childMapId] && !allExportedMapIds.has(n.childMapId)) {
        allExportedMapIds.add(n.childMapId);
        mapsToExport[n.childMapId] = allMaps[n.childMapId];
        queue.push(n.childMapId);
      }
    }
  }

  // Collect node IDs across ALL exported maps
  const allExportedNodeIds = new Set();
  for (const mId of allExportedMapIds) {
    const mMap = mapsToExport[mId];
    if (mMap) {
      const mNodes = resolveMapNodes(mMap);
      mNodes.forEach(n => {
        if (n && n.id !== undefined) allExportedNodeIds.add(n.id);
      });
    }
  }

  const entitiesToExport = { npcs: [], quests: [], items: [], trackers: [], tickets: [], factions: [] };
  if (topo) {
    const matchesMapScope = (e) => {
      if (!e) return false;
      if (allExportedNodeIds.has(e.nodeId)) return true;
      if (e.submapId && allExportedMapIds.has(e.submapId)) return true;
      return false;
    };
    if (Array.isArray(topo.npcs)) {
      entitiesToExport.npcs = topo.npcs.filter(matchesMapScope);
    }
    if (Array.isArray(topo.quests)) {
      entitiesToExport.quests = topo.quests.filter(matchesMapScope);
    }
    if (Array.isArray(topo.items)) {
      entitiesToExport.items = topo.items.filter(matchesMapScope);
    }
    if (Array.isArray(topo.trackers)) {
      entitiesToExport.trackers = topo.trackers.filter(matchesMapScope);
    }
    if (Array.isArray(topo.factions)) {
      entitiesToExport.factions = topo.factions.filter(f => {
        if (rootSubmapId === 'map_root' || rootSubmapId === 'root') return true;
        if (f.headquartersNodeId && allExportedNodeIds.has(f.headquartersNodeId)) return true;
        if (Array.isArray(f.controlledNodeIds) && f.controlledNodeIds.some(nid => allExportedNodeIds.has(nid))) return true;
        return false;
      });
    }
  }

  // Collect assets (IndexedDB raster map backgrounds)
  const assetsToExport = {};
  for (const mId of Object.keys(mapsToExport)) {
    const mMap = mapsToExport[mId];
    if (mMap.mapMetadata && mMap.mapMetadata.assetPath) {
      const assetFileName = mMap.mapMetadata.assetPath.replace(/^assets\//, '');
      let dataUrl = null;
      if (typeof loadPersistedMapFromDB === 'function') {
        try {
          const loaded = await loadPersistedMapFromDB(mId);
          if (loaded && loaded.dataUrl) dataUrl = loaded.dataUrl;
        } catch (_) {}
      }
      if (!dataUrl && mMap.mapMetadata.dataUrl) {
        dataUrl = mMap.mapMetadata.dataUrl;
      }
      if (dataUrl && typeof dataUrlToUint8Array === 'function') {
        const bytes = dataUrlToUint8Array(dataUrl);
        if (bytes) assetsToExport[assetFileName] = bytes;
      }
    }
  }

  // Build manifest
  const manifest = {
    formatVersion: '1.0.0',
    packId,
    name: packName,
    author,
    ipDomain,
    version: '1.0.0',
    description,
    entryMapId: rootSubmapId,
    contents: {
      mapsCount: Object.keys(mapsToExport).length,
      npcsCount: entitiesToExport.npcs.length,
      questsCount: entitiesToExport.quests.length,
      itemsCount: entitiesToExport.items.length,
      factionsCount: entitiesToExport.factions.length,
      modulesCount: 0
    }
  };

  try {
    const buildFn = (typeof buildPackArchive === 'function')
      ? buildPackArchive
      : (typeof packEngine !== 'undefined' && typeof packEngine.buildPackArchive === 'function' ? packEngine.buildPackArchive : null);
    if (!buildFn) throw new Error('buildPackArchive not available');

    const blob = await buildFn({
      manifest,
      maps: mapsToExport,
      entities: entitiesToExport,
      modules: {},
      assets: assetsToExport
    });

    // Zero-CORS safe browser download (remediated per Red Team Finding 4)
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packId}.csmod`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    if (typeof setStatusBarMessage === 'function') {
      setStatusBarMessage(`Exported pack "${packName}" successfully (${blob.size} bytes).`);
    }
    return blob;
  } catch (err) {
    console.error('[PackEngine] Error building pack export:', err);
    if (typeof alert === 'function') alert('Failed to export pack: ' + err.message);
    throw err;
  }
}

window.executeExportCsmodPack = executeExportCsmodPack;

// ============================================================================
// WINDOWS-HARDENED OBSIDIAN MARKDOWN VAULT EXPORTER
// Pure Zero-CORS Vault Generator with Aliased WikiLinks & Frontmatter Escaping
// ============================================================================

function sanitizeVaultFileName(name) {
  let clean = String(name || 'Unnamed')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Windows ban: cannot end with a period or space
  clean = clean.replace(/[. ]+$/, '');
  // Limit length to avoid Windows MAX_PATH limits
  if (clean.length > 64) clean = clean.substring(0, 64).trim().replace(/[. ]+$/, '');
  return clean || 'Untitled';
}
window.sanitizeVaultFileName = sanitizeVaultFileName;

function formatYamlFrontmatter(fields) {
  let lines = ['---'];
  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined || val === null) {
      lines.push(`${key}: null`);
    } else if (typeof val === 'string') {
      lines.push(`${key}: ${JSON.stringify(val)}`);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      lines.push(`${key}: ${val}`);
    } else if (Array.isArray(val)) {
      if (val.length === 0) {
        lines.push(`${key}: []`);
      } else if (val.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')) {
        lines.push(`${key}: [${val.map(item => typeof item === 'string' ? JSON.stringify(item) : item).join(', ')}]`);
      } else {
        lines.push(`${key}:`);
        val.forEach(item => {
          lines.push(`  - ${JSON.stringify(item)}`);
        });
      }
    } else if (typeof val === 'object') {
      lines.push(`${key}: ${JSON.stringify(val)}`);
    }
  }
  lines.push('---');
  return lines.join('\n') + '\n\n';
}
window.formatYamlFrontmatter = formatYamlFrontmatter;

function formatWikiLink(folder, sanitizedStem, originalName) {
  const target = folder ? `${folder}/${sanitizedStem}` : sanitizedStem;
  if (originalName && originalName !== sanitizedStem) {
    return `[[${target}|${originalName}]]`;
  }
  return `[[${target}]]`;
}
window.formatWikiLink = formatWikiLink;

function buildObsidianVaultFiles(topo) {
  if (!topo) topo = {};
  const campaignName = topo.name || 'Campaign';

  const files = [];

  // 1. Obsidian App Settings
  files.push({
    path: '.obsidian/app.json',
    content: JSON.stringify({
      useMarkdownLinks: false,
      newLinkFormat: "shortest"
    }, null, 2)
  });

  files.push({
    path: '.obsidian/core-plugins.json',
    content: JSON.stringify([
      "file-explorer",
      "global-search",
      "switcher",
      "graph",
      "backlink",
      "canvas",
      "outgoing-link",
      "tag-pane",
      "page-preview",
      "outline",
      "word-count"
    ], null, 2)
  });

  // Prepare lookups and unique sanitized stems
  const nodeLookup = {};
  const seenNodeStems = {};
  const nodeList = resolveMapNodes(topo);

  nodeList.forEach(n => {
    if (!n) return;
    const sName = sanitizeVaultFileName(n.name || `Node_${n.id}`);
    let stem = sName;
    if (seenNodeStems[stem] && seenNodeStems[stem] !== String(n.id)) {
      stem = `${sName}_${n.id}`;
    }
    seenNodeStems[stem] = String(n.id);
    nodeLookup[String(n.id)] = {
      node: n,
      sanitizedStem: stem,
      displayName: n.name || `Node #${n.id}`
    };
  });

  const factionLookup = {};
  const seenFactionStems = {};
  const factions = Array.isArray(topo.factions) ? topo.factions : [];
  factions.forEach(f => {
    if (!f) return;
    const sName = sanitizeVaultFileName(f.name || `Faction_${f.id}`);
    let stem = sName;
    if (seenFactionStems[stem] && seenFactionStems[stem] !== String(f.id)) {
      stem = `${sName}_${f.id}`;
    }
    seenFactionStems[stem] = String(f.id);
    factionLookup[String(f.id)] = {
      faction: f,
      sanitizedStem: stem,
      displayName: f.name || `Faction [${f.id}]`
    };
  });

  const npcLookup = {};
  const seenNpcStems = {};
  const npcs = Array.isArray(topo.npcs) ? topo.npcs : [];
  npcs.forEach(npc => {
    if (!npc) return;
    const sName = sanitizeVaultFileName(npc.name || `NPC_${npc.id}`);
    let stem = sName;
    if (seenNpcStems[stem] && seenNpcStems[stem] !== String(npc.id)) {
      stem = `${sName}_${npc.id}`;
    }
    seenNpcStems[stem] = String(npc.id);
    npcLookup[String(npc.id)] = {
      npc,
      sanitizedStem: stem,
      displayName: npc.name || `NPC [${npc.id}]`
    };
  });

  const questLookup = {};
  const seenQuestStems = {};
  const quests = Array.isArray(topo.quests) ? topo.quests : [];
  quests.forEach(q => {
    if (!q) return;
    const sName = sanitizeVaultFileName(q.name || q.title || `Quest_${q.id}`);
    let stem = sName;
    if (seenQuestStems[stem] && seenQuestStems[stem] !== String(q.id)) {
      stem = `${sName}_${q.id}`;
    }
    seenQuestStems[stem] = String(q.id);
    questLookup[String(q.id)] = {
      quest: q,
      sanitizedStem: stem,
      displayName: q.name || q.title || `Quest [${q.id}]`
    };
  });

  const itemLookup = {};
  const seenItemStems = {};
  const items = Array.isArray(topo.items) ? topo.items : [];
  items.forEach(itm => {
    if (!itm) return;
    const sName = sanitizeVaultFileName(itm.name || `Item_${itm.id}`);
    let stem = sName;
    if (seenItemStems[stem] && seenItemStems[stem] !== String(itm.id)) {
      stem = `${sName}_${itm.id}`;
    }
    seenItemStems[stem] = String(itm.id);
    itemLookup[String(itm.id)] = {
      item: itm,
      sanitizedStem: stem,
      displayName: itm.name || `Item [${itm.id}]`
    };
  });

  // Collect edges
  const edges = Array.isArray(topo.edges) ? topo.edges : [];

  // 2. Generate _Index.md (Vault Landing Page)
  let indexMd = formatYamlFrontmatter({
    title: campaignName,
    type: "campaign_index",
    nodes_count: nodeList.length,
    characters_count: npcs.length,
    factions_count: factions.length,
    quests_count: quests.length,
    items_count: items.length,
    generated_at: new Date().toISOString()
  });

  indexMd += `# 🗺️ ${campaignName}\n\n`;
  indexMd += `Welcome to the Obsidian Campaign Vault for **${campaignName}**.\n`;
  indexMd += `Generated by **Creator Studio Universal Workstation** with full bidirectional wikilinks.\n\n`;

  indexMd += `## 🧭 Major Pointcrawl Nodes (${nodeList.length})\n\n`;
  if (nodeList.length === 0) {
    indexMd += `*No nodes recorded in this campaign.*\n\n`;
  } else {
    indexMd += `| Node | Tier | Culture | Sociological Vector | Stationed NPCs |\n`;
    indexMd += `| :--- | :--- | :--- | :--- | :--- |\n`;
    nodeList.forEach(n => {
      const entry = nodeLookup[String(n.id)];
      const link = formatWikiLink('Nodes', entry.sanitizedStem, entry.displayName);
      const stationed = npcs.filter(npc => String(npc.nodeId) === String(n.id));
      const npcLinks = stationed.map(s => {
        const nEntry = npcLookup[String(s.id)];
        return formatWikiLink('Characters', nEntry.sanitizedStem, nEntry.displayName);
      }).join(', ') || '*None*';
      const odvStr = n.odv ? `[${n.odv.s}, ${n.odv.e}, ${n.odv.c}]` : `[${n.s || 2}, ${n.e || 2}, ${n.c || 2}]`;
      indexMd += `| ${link} | Tier ${n.tier || 2} | ${n.culture || 'Universal'} | ${odvStr} | ${npcLinks} |\n`;
    });
    indexMd += `\n`;
  }

  indexMd += `## 👑 Active Factions (${factions.length})\n\n`;
  if (factions.length === 0) {
    indexMd += `*No factions recorded.*\n\n`;
  } else {
    factions.forEach(f => {
      const fEntry = factionLookup[String(f.id)];
      const link = formatWikiLink('Factions', fEntry.sanitizedStem, fEntry.displayName);
      indexMd += `- ${link} (${f.cvfQuadrant || 'Universal'} / Color: ${f.colorIdentity || 'Colorless'})\n`;
    });
    indexMd += `\n`;
  }

  indexMd += `## 👤 Dramatis Personae (${npcs.length})\n\n`;
  if (npcs.length === 0) {
    indexMd += `*No characters recorded.*\n\n`;
  } else {
    npcs.forEach(npc => {
      const nEntry = npcLookup[String(npc.id)];
      const link = formatWikiLink('Characters', nEntry.sanitizedStem, nEntry.displayName);
      indexMd += `- ${link} &mdash; *${npc.role || 'Resident'}*\n`;
    });
    indexMd += `\n`;
  }

  files.push({
    path: '_Index.md',
    content: indexMd
  });

  // 3. Generate Nodes/*.md
  nodeList.forEach(n => {
    const entry = nodeLookup[String(n.id)];
    const nodeFm = formatYamlFrontmatter({
      title: n.name || `Node #${n.id}`,
      id: n.id,
      type: "node",
      tier: n.tier || 2,
      culture: n.culture || "Universal",
      odv: n.odv ? [n.odv.s, n.odv.e, n.odv.c] : [n.s || 2, n.e || 2, n.c || 2],
      danger_level: n.danger || 1,
      tags: Array.isArray(n.tags) ? n.tags : []
    });

    let nodeMd = nodeFm;
    nodeMd += `# 📍 ${n.name || `Node #${n.id}`}\n\n`;
    if (n.description) nodeMd += `${n.description}\n\n`;

    // Slotted Modules
    nodeMd += `## 📦 Slotted Worldbuilding Modules\n\n`;
    const modules = n.modules || n.slottedModules || [];
    if (modules.length === 0) {
      nodeMd += `*No modules slotted onto this node.*\n\n`;
    } else {
      modules.forEach(m => {
        const mTitle = typeof m === 'string' ? m : (m.title || m.name || m.id);
        const mTier = m.tier || m.pipeline_tier || 'Tier ?';
        nodeMd += `- **${mTitle}** (${mTier})${m.summary ? `: ${m.summary}` : ''}\n`;
      });
      nodeMd += `\n`;
    }

    // Travel Corridors & Adjacencies
    nodeMd += `## 🛣️ Travel Corridors & Adjacencies\n\n`;
    const outboundEdges = edges.filter(e => String(e.source) === String(n.id) || (!e.directional && String(e.target) === String(n.id)));
    if (outboundEdges.length === 0) {
      nodeMd += `*No connecting corridors recorded for this node.*\n\n`;
    } else {
      outboundEdges.forEach(e => {
        const otherId = String(e.source) === String(n.id) ? String(e.target) : String(e.source);
        const targetEntry = nodeLookup[otherId];
        const targetLink = targetEntry ? formatWikiLink('Nodes', targetEntry.sanitizedStem, targetEntry.displayName) : `Node #${otherId}`;
        const edgeTypeStr = e.type === 'hegemony' ? 'Hegemonic Influence Vector' : 'Transit Road';
        const dirStr = e.directional ? ' (Directional)' : ' (Bidirectional)';
        nodeMd += `- → ${targetLink}: **${edgeTypeStr}**${dirStr} &bull; Travel: ${e.weight || 1} day(s) &bull; Danger: ${e.danger || 1}/5\n`;
      });
      nodeMd += `\n`;
    }

    // Demographics
    nodeMd += `## 👥 Demographics & Local Peoples\n\n`;
    if (n.demographics && Array.isArray(n.demographics) && n.demographics.length > 0) {
      n.demographics.forEach(d => {
        nodeMd += `- ${typeof d === 'string' ? d : `${d.name || d.race}: ${d.percentage || d.pct || 0}%`}\n`;
      });
      nodeMd += `\n`;
    } else {
      nodeMd += `*Cosmopolitan / mixed frontier demographic.*\n\n`;
    }

    // Stationed NPCs
    nodeMd += `## 👤 Stationed Characters\n\n`;
    const stationedNpcs = npcs.filter(npc => String(npc.nodeId) === String(n.id));
    if (stationedNpcs.length === 0) {
      nodeMd += `*No characters stationed here.*\n\n`;
    } else {
      stationedNpcs.forEach(npc => {
        const nEntry = npcLookup[String(npc.id)];
        const link = formatWikiLink('Characters', nEntry.sanitizedStem, nEntry.displayName);
        const facName = npc.factionId && factionLookup[String(npc.factionId)] ? factionLookup[String(npc.factionId)].displayName : 'Free Agent';
        nodeMd += `- ${link} &mdash; *${npc.role || 'Resident'}* (${facName})\n`;
      });
      nodeMd += `\n`;
    }

    // Stationed Items
    nodeMd += `## 💎 Relics & Stored Items\n\n`;
    const stationedItems = items.filter(itm => String(itm.nodeId) === String(n.id) && itm.possessionMode !== 'carried');
    if (stationedItems.length === 0) {
      nodeMd += `*No relics or items stored at this location.*\n\n`;
    } else {
      stationedItems.forEach(itm => {
        const iEntry = itemLookup[String(itm.id)];
        const link = formatWikiLink('Items', iEntry.sanitizedStem, iEntry.displayName);
        nodeMd += `- ${link} &mdash; ${itm.category || 'Relic'} (${itm.specs || 'Standard'})\n`;
      });
      nodeMd += `\n`;
    }

    files.push({
      path: `Nodes/${entry.sanitizedStem}.md`,
      content: nodeMd
    });
  });

  // 4. Generate Characters/*.md
  npcs.forEach(npc => {
    const entry = npcLookup[String(npc.id)];
    const hostNodeEntry = npc.nodeId ? nodeLookup[String(npc.nodeId)] : null;
    const factionEntry = npc.factionId ? factionLookup[String(npc.factionId)] : null;

    const charFm = formatYamlFrontmatter({
      name: npc.name || `NPC #${npc.id}`,
      id: npc.id,
      type: "npc",
      role: npc.role || "Resident",
      faction: factionEntry ? factionEntry.displayName : null,
      stationed_node: hostNodeEntry ? hostNodeEntry.displayName : null,
      culture: npc.culture || (hostNodeEntry ? hostNodeEntry.node.culture : "Universal"),
      odv: npc.odv ? [npc.odv.s, npc.odv.e, npc.odv.c] : [2, 2, 2],
      four_corners_role: npc.fourCornersRole || null
    });

    let charMd = charFm;
    charMd += `# 👤 ${npc.name || `NPC #${npc.id}`}\n\n`;
    charMd += `**Role / Vocation:** ${npc.role || 'Resident / Specialist'}\n`;
    if (npc.fourCornersRole) charMd += `**Dramatic Archetype:** ${npc.fourCornersRole}\n`;

    charMd += `**Stationed Location:** ${hostNodeEntry ? formatWikiLink('Nodes', hostNodeEntry.sanitizedStem, hostNodeEntry.displayName) : '*Unassigned / Wandering*'}\n`;
    charMd += `**Faction Allegiance:** ${factionEntry ? formatWikiLink('Factions', factionEntry.sanitizedStem, factionEntry.displayName) : '*Independent Free Agent*'}\n\n`;

    if (npc.motivation || npc.agenda) {
      charMd += `## 🎯 Motivation & Agenda\n\n`;
      charMd += `${npc.motivation || npc.agenda}\n\n`;
    }

    // Secrets Known
    const secrets = Array.isArray(npc.secretsKnown) ? npc.secretsKnown : [];
    if (secrets.length > 0) {
      charMd += `## 🗝️ Secrets Known (Three-Clue Tracker)\n\n`;
      secrets.forEach(s => {
        const sText = typeof s === 'string' ? s : (s.clue || s.text || s.title);
        charMd += `- ${sText}\n`;
      });
      charMd += `\n`;
    }

    // Dialogue Hooks
    const hooks = Array.isArray(npc.dialogueHooks) ? npc.dialogueHooks : [];
    if (hooks.length > 0) {
      charMd += `## 💬 Dialogue Hooks & Quotes\n\n`;
      hooks.forEach(h => {
        charMd += `> &ldquo;${h}&rdquo;\n\n`;
      });
    }

    // Social Web & Relational Graph
    charMd += `## 👥 Social Web & Relational Ties\n\n`;
    const outbound = Array.isArray(npc.relationships) ? npc.relationships : [];
    const inbound = npcs.filter(other => other.id !== npc.id && Array.isArray(other.relationships) && other.relationships.some(r => String(r.targetNpcId) === String(npc.id)));

    if (outbound.length === 0 && inbound.length === 0) {
      charMd += `*No recorded social relationships.*\n\n`;
    } else {
      if (outbound.length > 0) {
        charMd += `### Outbound Ties\n`;
        outbound.forEach(r => {
          const tEntry = npcLookup[String(r.targetNpcId)];
          const tLink = tEntry ? formatWikiLink('Characters', tEntry.sanitizedStem, tEntry.displayName) : `NPC [${r.targetNpcId}]`;
          const s = typeof r.sentiment === 'number' ? r.sentiment : 0;
          const sStr = s >= 0 ? `+${s}` : `${s}`;
          charMd += `- → ${tLink}: **${r.relationshipType || r.type || 'Connected'}** (Sentiment: ${sStr})${r.notes ? ` &mdash; *${r.notes}*` : ''}\n`;
        });
        charMd += `\n`;
      }
      if (inbound.length > 0) {
        charMd += `### Inbound Ties\n`;
        inbound.forEach(other => {
          const matchRel = other.relationships.find(r => String(r.targetNpcId) === String(npc.id));
          const oEntry = npcLookup[String(other.id)];
          const oLink = formatWikiLink('Characters', oEntry.sanitizedStem, oEntry.displayName);
          const s = typeof matchRel.sentiment === 'number' ? matchRel.sentiment : 0;
          const sStr = s >= 0 ? `+${s}` : `${s}`;
          charMd += `- ← ${oLink}: **${matchRel.relationshipType || matchRel.type || 'Connected'}** (Sentiment: ${sStr})${matchRel.notes ? ` &mdash; *${matchRel.notes}*` : ''}\n`;
        });
        charMd += `\n`;
      }
    }

    // Carried Relics / Inventory
    const carriedItems = items.filter(itm => String(itm.ownerNpcId) === String(npc.id) && itm.possessionMode === 'carried');
    if (carriedItems.length > 0) {
      charMd += `## 🎒 Carried Equipment & Relics\n\n`;
      carriedItems.forEach(itm => {
        const iEntry = itemLookup[String(itm.id)];
        const link = formatWikiLink('Items', iEntry.sanitizedStem, iEntry.displayName);
        charMd += `- ${link} (${itm.category || 'Gear'})\n`;
      });
      charMd += `\n`;
    }

    files.push({
      path: `Characters/${entry.sanitizedStem}.md`,
      content: charMd
    });
  });

  // 5. Generate Factions/*.md
  factions.forEach(f => {
    const entry = factionLookup[String(f.id)];
    const leaderEntry = f.leaderNpcId ? npcLookup[String(f.leaderNpcId)] : null;
    const hqEntry = f.headquartersNodeId ? nodeLookup[String(f.headquartersNodeId)] : null;

    const facFm = formatYamlFrontmatter({
      name: f.name || `Faction #${f.id}`,
      id: f.id,
      type: "faction",
      cvf_quadrant: f.cvfQuadrant || "Universal",
      color_identity: f.colorIdentity || "C",
      leader: leaderEntry ? leaderEntry.displayName : null,
      headquarters: hqEntry ? hqEntry.displayName : null
    });

    let facMd = facFm;
    facMd += `# 👑 ${f.name || `Faction #${f.id}`}\n\n`;
    facMd += `**CVF Cultural Quadrant:** ${f.cvfQuadrant || 'Universal'} &bull; **Color Identity:** ${f.colorIdentity || 'Colorless'}\n\n`;

    if (f.description) {
      facMd += `## 📜 Manifesto & Doctrine\n\n`;
      facMd += `${f.description}\n\n`;
    }

    facMd += `## 🏛️ Leadership & Strongholds\n\n`;
    facMd += `- **Leader:** ${leaderEntry ? formatWikiLink('Characters', leaderEntry.sanitizedStem, leaderEntry.displayName) : '*No appointed leader*'}\n`;
    facMd += `- **Headquarters:** ${hqEntry ? formatWikiLink('Nodes', hqEntry.sanitizedStem, hqEntry.displayName) : '*Wandering / Nomadic*'}\n\n`;

    // Controlled Territory
    facMd += `## 🏰 Controlled Territory\n\n`;
    const controlledIds = Array.isArray(f.controlledNodeIds) ? f.controlledNodeIds : [];
    if (controlledIds.length === 0) {
      facMd += `*No territorial nodes occupied.*\n\n`;
    } else {
      controlledIds.forEach(nId => {
        const nEntry = nodeLookup[String(nId)];
        if (nEntry) {
          facMd += `- ${formatWikiLink('Nodes', nEntry.sanitizedStem, nEntry.displayName)}\n`;
        }
      });
      facMd += `\n`;
    }

    // Diplomatic Stances
    facMd += `## ⚖️ Diplomatic Stances\n\n`;
    const stances = f.diplomaticStances || {};
    const stanceEntries = Object.entries(stances);
    if (stanceEntries.length === 0) {
      facMd += `*No formal diplomatic agreements or treaties recorded.*\n\n`;
    } else {
      stanceEntries.forEach(([targetFacId, stance]) => {
        const targetEntry = factionLookup[String(targetFacId)];
        const targetLink = targetEntry ? formatWikiLink('Factions', targetEntry.sanitizedStem, targetEntry.displayName) : `Faction [${targetFacId}]`;
        facMd += `- ${targetLink}: **${stance}**\n`;
      });
      facMd += `\n`;
    }

    files.push({
      path: `Factions/${entry.sanitizedStem}.md`,
      content: facMd
    });
  });

  // 6. Generate Quests/*.md
  quests.forEach(q => {
    const entry = questLookup[String(q.id)];
    const anchorEntry = q.nodeId ? nodeLookup[String(q.nodeId)] : null;

    const questFm = formatYamlFrontmatter({
      title: q.name || q.title || `Quest #${q.id}`,
      id: q.id,
      type: "quest",
      status: q.status || "active",
      threat: q.threat || "Standard",
      anchor_node: anchorEntry ? anchorEntry.displayName : null
    });

    let questMd = questFm;
    questMd += `# ⚔️ ${q.name || q.title || `Quest #${q.id}`}\n\n`;
    questMd += `**Status:** ${q.status || 'Active'} &bull; **Threat Level:** ${q.threat || 'Standard'}\n`;
    questMd += `**Anchor Node:** ${anchorEntry ? formatWikiLink('Nodes', anchorEntry.sanitizedStem, anchorEntry.displayName) : '*Unanchored*'}\n\n`;

    if (q.synopsis || q.description || q.hook) {
      questMd += `## 📜 Synopsis & Narrative Hooks\n\n`;
      questMd += `${q.synopsis || q.description || q.hook}\n\n`;
    }

    // Key NPCs
    const qNpcIds = Array.isArray(q.npcIds) ? q.npcIds : [];
    if (qNpcIds.length > 0) {
      questMd += `## 👤 Dramatis Personae Involved\n\n`;
      qNpcIds.forEach(nId => {
        const nEntry = npcLookup[String(nId)];
        if (nEntry) {
          questMd += `- ${formatWikiLink('Characters', nEntry.sanitizedStem, nEntry.displayName)}\n`;
        }
      });
      questMd += `\n`;
    }

    // Quest Items
    const qItemIds = Array.isArray(q.itemIds) ? q.itemIds : [];
    if (qItemIds.length > 0) {
      questMd += `## 💎 Associated Items & Relics\n\n`;
      qItemIds.forEach(iId => {
        const iEntry = itemLookup[String(iId)];
        if (iEntry) {
          questMd += `- ${formatWikiLink('Items', iEntry.sanitizedStem, iEntry.displayName)}\n`;
        }
      });
      questMd += `\n`;
    }

    files.push({
      path: `Quests/${entry.sanitizedStem}.md`,
      content: questMd
    });
  });

  // 7. Generate Items/*.md
  items.forEach(itm => {
    const entry = itemLookup[String(itm.id)];
    const nodeEntry = itm.nodeId ? nodeLookup[String(itm.nodeId)] : null;
    const ownerEntry = itm.ownerNpcId ? npcLookup[String(itm.ownerNpcId)] : null;

    const itemFm = formatYamlFrontmatter({
      name: itm.name || `Item #${itm.id}`,
      id: itm.id,
      type: "item",
      category: itm.category || "Relic",
      possession_mode: itm.possessionMode || "stored",
      owner: ownerEntry ? ownerEntry.displayName : null,
      stored_at: nodeEntry ? nodeEntry.displayName : null
    });

    let itemMd = itemFm;
    itemMd += `# 💎 ${itm.name || `Item #${itm.id}`}\n\n`;
    itemMd += `**Category:** ${itm.category || 'Relic'} &bull; **Possession Mode:** ${itm.possessionMode === 'carried' ? '🎒 Carried' : '📦 Stored'}\n\n`;

    if (itm.description) {
      itemMd += `## 📜 Description\n\n`;
      itemMd += `${itm.description}\n\n`;
    }

    if (itm.specs) {
      itemMd += `## ⚙️ Specifications & Mechanics\n\n`;
      itemMd += `${itm.specs}\n\n`;
    }

    itemMd += `## 📍 Spatial Resolution & Custody\n\n`;
    if (itm.possessionMode === 'carried' && ownerEntry) {
      itemMd += `- **Carried by:** ${formatWikiLink('Characters', ownerEntry.sanitizedStem, ownerEntry.displayName)}\n`;
    } else if (nodeEntry) {
      itemMd += `- **Stored at Location:** ${formatWikiLink('Nodes', nodeEntry.sanitizedStem, nodeEntry.displayName)}\n`;
    } else {
      itemMd += `*Unassigned location / inventory.*\n`;
    }

    files.push({
      path: `Items/${entry.sanitizedStem}.md`,
      content: itemMd
    });
  });

  return files;
}
window.buildObsidianVaultFiles = buildObsidianVaultFiles;

async function exportObsidianVaultZip(topo = null) {
  if (!topo) {
    topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
  }
  if (!topo) {
    if (typeof alert === 'function') alert("No active campaign to export.");
    return null;
  }

  const ZipClass = (typeof ZeroCorsZip !== 'undefined') ? ZeroCorsZip : (typeof window !== 'undefined' && window.ZeroCorsZip ? window.ZeroCorsZip : null);
  if (!ZipClass) {
    if (typeof alert === 'function') alert("ZeroCorsZip engine not loaded.");
    return null;
  }

  const files = buildObsidianVaultFiles(topo);
  const zip = new ZipClass();
  files.forEach(f => {
    zip.addFile(f.path, f.content);
  });

  const blob = zip.generateBlob();
  const cName = sanitizeVaultFileName(topo.name || 'campaign');
  const filename = `${cName.toLowerCase().replace(/\s+/g, '_')}_obsidian_vault.zip`;

  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  if (typeof setStatusBarMessage === 'function') {
    setStatusBarMessage(`Exported Obsidian vault: "${filename}" (${files.length} notes, ${(blob.size / 1024).toFixed(1)} KB).`);
  }

  return { blob, files, zip };
}
window.exportObsidianVaultZip = exportObsidianVaultZip;

// ============================================================================
// FOUNDRY VTT, UNIVERSAL VTT (.dd2vtt) / ROLL20 & PRINTABLE HTML DOSSIER EXPORTERS
// ============================================================================

function generateFoundryVTTJSON(topo = null) {
  const activeTopo = topo || (typeof Workstation !== 'undefined' && Workstation.activeTopology) || {};
  const nodesList = resolveMapNodes(activeTopo);
  const npcs = Array.isArray(activeTopo.npcs) ? activeTopo.npcs : [];
  const quests = Array.isArray(activeTopo.quests) ? activeTopo.quests : [];
  const items = Array.isArray(activeTopo.items) ? activeTopo.items : [];
  const trackers = Array.isArray(activeTopo.trackers) ? activeTopo.trackers : [];
  const factions = Array.isArray(activeTopo.factions) ? activeTopo.factions : [];
  const edgeData = activeTopo.edgeData || {};

  // Build Scene Notes (Pins) & Journal Entries for every Node
  const sceneNotes = [];
  const journalEntries = [];
  const drawings = [];

  nodesList.forEach((n, idx) => {
    if (!n) return;
    const jId = `fvtt_journal_node_${n.id}`;
    const odvObj = (typeof resolveNodeOdv === 'function') ? resolveNodeOdv(n, activeTopo) : { s: 2, e: 2, c: 2 };
    const odvVec = [odvObj.s || 2, odvObj.e || 2, odvObj.c || 2];
    const quad = n.culture || (typeof deriveCvfQuadrant === 'function' ? deriveCvfQuadrant(odvVec[0], odvVec[1]) : 'Hierarchy');
    const htmlContent = [
      `<h2>${n.name || 'Node ' + n.id}</h2>`,
      `<p><strong>Tier:</strong> ${n.tier !== undefined ? n.tier : 2} | <strong>CVF Quadrant:</strong> ${quad} | <strong>ODV:</strong> [${odvVec.join(', ')}]</p>`,
      n.faction ? `<p><strong>Controlling Faction:</strong> ${n.faction}</p>` : '',
      (n.customNotes || n.notes) ? `<div>${String(n.customNotes || n.notes).replace(/\n/g, '<br/>')}</div>` : ''
    ].filter(Boolean).join('\n');

    journalEntries.push({
      _id: jId,
      name: `${n.name || 'Node ' + n.id} [Node #${n.id}]`,
      pages: [
        {
          name: 'Overview & Lore',
          type: 'text',
          text: { content: htmlContent, format: 1 }
        }
      ],
      flags: { creatorStudio: { nodeId: n.id, tier: n.tier, odv: odvVec, childMapId: n.childMapId || null } }
    });

    sceneNotes.push({
      _id: `fvtt_note_${idx + 1}`,
      entryId: jId,
      x: Number(n.x) || 400,
      y: Number(n.y) || 300,
      icon: n.childMapId ? 'icons/svg/portal.svg' : 'icons/svg/village.svg',
      iconSize: 36,
      text: n.name || `Node ${n.id}`,
      fontFamily: 'Signika',
      fontSize: 20,
      textAnchor: 1,
      textColor: '#ffffff'
    });
  });

  // Build Polylines for Transit Roads & Hegemony Corridors
  const seenPairs = new Set();
  nodesList.forEach(u => {
    if (!u || u.id === undefined) return;
    (u.adj || []).forEach(vId => {
      const pairKey = (typeof CampaignMutationEngine !== "undefined" && CampaignMutationEngine.formatCorridorKey)
        ? CampaignMutationEngine.formatCorridorKey(u.id, vId, 'adj')
        : [String(u.id), String(vId)].sort().join('-');
      if (seenPairs.has(pairKey)) return;
      seenPairs.add(pairKey);
      const v = findNodeObj(activeTopo, vId);
      if (!v) return;
      const rec = edgeData[pairKey] || {};
      drawings.push({
        _id: `fvtt_road_${pairKey}`,
        author: 'CreatorStudio',
        shape: {
          type: 'p',
          points: [0, 0, (Number(v.x) || 0) - (Number(u.x) || 0), (Number(v.y) || 0) - (Number(u.y) || 0)]
        },
        x: Number(u.x) || 0,
        y: Number(u.y) || 0,
        strokeWidth: 4,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.9,
        text: rec.name || '',
        flags: { creatorStudio: { edgeType: 'road', pairKey, conduitType: rec.conduitType || 'standard', hazardLevel: rec.hazardLevel || 1 } }
      });
    });
  });

  // Build Foundry Actors from NPCs
  const actors = npcs.map(npc => ({
    _id: `fvtt_actor_${npc.id}`,
    name: npc.name || String(npc.id),
    type: 'npc',
    img: 'icons/svg/mystery-man.svg',
    system: {
      details: {
        role: npc.role || 'NPC',
        faction: npc.faction || '',
        biography: { value: `<p><strong>Motivation:</strong> ${npc.motivation || ''}</p><p><strong>Secret:</strong> ${npc.secret || ''}</p><p>${npc.notes || ''}</p>` }
      }
    },
    flags: { creatorStudio: { id: npc.id, nodeId: npc.nodeId, odv: npc.odv || null, disposition: npc.disposition || 0 } }
  }));

  // Build Foundry Items from Items
  const fvttItems = items.map(itm => ({
    _id: `fvtt_item_${itm.id}`,
    name: itm.name || String(itm.id),
    type: 'loot',
    img: 'icons/svg/item-bag.svg',
    system: {
      description: { value: `<p><strong>Category:</strong> ${itm.category || 'Relic'}</p><p><strong>Specs:</strong> ${itm.specs || ''}</p><p>${itm.notes || itm.description || ''}</p>` }
    },
    flags: { creatorStudio: { id: itm.id, nodeId: itm.nodeId, ownerNpcId: itm.ownerNpcId || null, possessionMode: itm.possessionMode || 'stored' } }
  }));

  return {
    format: 'FoundryVTT-CreatorStudio-Bundle',
    foundryVersion: '12',
    name: activeTopo.name || 'Campaign Pointcrawl Scene',
    navigation: true,
    width: (activeTopo.mapMetadata && activeTopo.mapMetadata.width) || 2000,
    height: (activeTopo.mapMetadata && activeTopo.mapMetadata.height) || 1400,
    background: {
      src: (activeTopo.mapMetadata && activeTopo.mapMetadata.assetPath) || null
    },
    grid: {
      type: 1,
      size: 50,
      distance: 5,
      units: 'mi'
    },
    notes: sceneNotes,
    drawings: drawings,
    journal: journalEntries,
    actors: actors,
    items: fvttItems,
    flags: {
      creatorStudio: {
        factions: factions,
        quests: quests,
        trackers: trackers
      }
    }
  };
}
window.generateFoundryVTTJSON = generateFoundryVTTJSON;

function generateUniversalVTTJSON(topo = null) {
  const activeTopo = topo || (typeof Workstation !== 'undefined' && Workstation.activeTopology) || {};
  const nodesList = resolveMapNodes(activeTopo);
  const ppGrid = 20;
  const widthPx = (activeTopo.mapMetadata && activeTopo.mapMetadata.width) || 1600;
  const heightPx = (activeTopo.mapMetadata && activeTopo.mapMetadata.height) || 1000;

  const portals = nodesList
    .filter(n => n && n.childMapId)
    .map(n => ({
      position: { x: Number((Number(n.x || 0) / ppGrid).toFixed(2)), y: Number((Number(n.y || 0) / ppGrid).toFixed(2)) },
      bounds: [
        { x: Number(((Number(n.x || 0) - 10) / ppGrid).toFixed(2)), y: Number((Number(n.y || 0) / ppGrid).toFixed(2)) },
        { x: Number(((Number(n.x || 0) + 10) / ppGrid).toFixed(2)), y: Number((Number(n.y || 0) / ppGrid).toFixed(2)) }
      ],
      rotation: 0,
      closed: false,
      freestanding: true,
      targetSubmapId: n.childMapId,
      nodeId: n.id,
      name: n.name || String(n.id)
    }));

  const lights = nodesList.map(n => ({
    position: { x: Number((Number(n.x || 0) / ppGrid).toFixed(2)), y: Number((Number(n.y || 0) / ppGrid).toFixed(2)) },
    range: n.tier === 3 ? 8 : 5,
    intensity: 1.0,
    color: 'ffeedd',
    shadows: false
  }));

  return {
    format: 0.2,
    resolution: {
      map_origin: { x: 0, y: 0 },
      map_size: { x: Math.round(widthPx / ppGrid), y: Math.round(heightPx / ppGrid) },
      pixels_per_grid: ppGrid
    },
    line_of_sight: [],
    objects_line_of_sight: [],
    portals: portals,
    environment: {
      baked_lighting: false,
      ambient_light: 'ffffffff'
    },
    lights: lights,
    roll20: {
      campaignName: activeTopo.name || 'Creator Studio Campaign',
      pageSize: { width: widthPx, height: heightPx },
      markers: nodesList.map(n => ({
        id: n.id,
        name: n.name || `Node ${n.id}`,
        left: Number(n.x) || 0,
        top: Number(n.y) || 0,
        layer: (n.visible === false) ? 'gmlayer' : 'objects',
        childMapId: n.childMapId || null
      }))
    },
    creatorStudio: {
      nodesCount: nodesList.length,
      factionsCount: (activeTopo.factions || []).length,
      npcsCount: (activeTopo.npcs || []).length,
      questsCount: (activeTopo.quests || []).length
    }
  };
}
window.generateUniversalVTTJSON = generateUniversalVTTJSON;

function generateCampaignHTMLDossier(topo = null) {
  const activeTopo = topo || (typeof Workstation !== 'undefined' && Workstation.activeTopology) || {};
  const cName = activeTopo.name || (typeof currentCampaignName !== 'undefined' ? currentCampaignName : 'Campaign Sourcebook Dossier');
  const nodesList = resolveMapNodes(activeTopo);
  const npcs = Array.isArray(activeTopo.npcs) ? activeTopo.npcs : [];
  const quests = Array.isArray(activeTopo.quests) ? activeTopo.quests : [];
  const items = Array.isArray(activeTopo.items) ? activeTopo.items : [];
  const trackers = Array.isArray(activeTopo.trackers) ? activeTopo.trackers : [];
  const factions = Array.isArray(activeTopo.factions) ? activeTopo.factions : [];

  const esc = (str) => String(str === undefined || str === null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const nodeRows = nodesList.map(n => {
    const odvObj = (typeof resolveNodeOdv === 'function') ? resolveNodeOdv(n, activeTopo) : { s: 2, e: 2, c: 2 };
    const odvVec = [odvObj.s || 2, odvObj.e || 2, odvObj.c || 2];
    const quad = n.culture || (typeof deriveCvfQuadrant === 'function' ? deriveCvfQuadrant(odvVec[0], odvVec[1]) : 'Hierarchy');
    return `<tr>
      <td><strong>#${esc(n.id)}</strong></td>
      <td><strong>${esc(n.name || 'Node ' + n.id)}</strong>${n.childMapId ? ` <span class="badge">Portal &rarr; ${esc(n.childMapId)}</span>` : ''}</td>
      <td>Tier ${esc(n.tier !== undefined ? n.tier : 2)}</td>
      <td>[${odvVec.join(', ')}] (${esc(quad)})</td>
      <td>${esc(n.faction || 'neutral')}</td>
      <td>${esc(n.customNotes || n.notes || '').replace(/\n/g, '<br/>')}</td>
    </tr>`;
  }).join('\n');

  const factionRows = factions.map(f => {
    const stances = Object.entries(f.diplomaticStances || {}).map(([k, v]) => `${esc(k)}: <strong>${esc(v)}</strong>`).join(', ');
    return `<tr>
      <td><strong>${esc(f.name || f.id)}</strong></td>
      <td>${esc(f.cvfQuadrant || 'Hierarchy')}</td>
      <td>${esc(f.headquartersNodeId || 'None')}</td>
      <td>${esc(f.leaderNpcId || 'None')}</td>
      <td>${stances || '<em>None recorded</em>'}</td>
    </tr>`;
  }).join('\n');

  const npcRows = npcs.map(npc => `<tr>
    <td><strong>${esc(npc.name || npc.id)}</strong></td>
    <td>${esc(npc.role || 'NPC')}</td>
    <td>${esc(npc.faction || 'Unaligned')}</td>
    <td>${esc(npc.nodeId || 'Unstationed')}</td>
    <td>${esc(npc.motivation || npc.notes || '')}</td>
  </tr>`).join('\n');

  const questRows = quests.map(q => {
    const stepsHtml = (q.steps || []).map(st => `<li>[${st.completed ? 'x' : ' '}] ${esc(st.title || st.text || '')}${st.triggerTrackerId ? ` <em>(&rarr; ${esc(st.triggerTrackerId)} +${st.tickDelta || 1})</em>` : ''}</li>`).join('');
    return `<tr>
      <td><strong>${esc(q.title || q.name || q.id)}</strong></td>
      <td>${esc(q.status || 'active')}</td>
      <td>${esc(q.nodeId || 'Global')}</td>
      <td><ul>${stepsHtml}</ul><div>${esc(q.notes || q.synopsis || '')}</div></td>
    </tr>`;
  }).join('\n');

  const clockRows = trackers.map(t => `<tr>
    <td><strong>${esc(t.name || t.id)}</strong></td>
    <td>${esc(t.scopeTier || 'quest')}</td>
    <td><strong>${Number(t.currentTicks) || 0} / ${Number(t.maxTicks) || 4}</strong></td>
    <td>${esc(t.nodeId || 'Global')}</td>
    <td>${esc(t.notes || '')}</td>
  </tr>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(cName)} — Printable GM Sourcebook Dossier</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1e293b; max-width: 980px; margin: 24px auto; padding: 0 20px; line-height: 1.5; background: #ffffff; }
    h1 { color: #000080; border-bottom: 3px solid #000080; padding-bottom: 6px; margin-bottom: 4px; }
    h2 { color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; }
    .meta { font-size: 12px; color: #475569; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; color: #0f172a; font-family: Tahoma, sans-serif; font-size: 12px; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 1px 5px; border-radius: 3px; font-size: 11px; font-family: monospace; }
    ul { margin: 0 0 4px 16px; padding: 0; }
    @media print { body { margin: 0; max-width: 100%; } h2 { page-break-after: avoid; } }
  </style>
</head>
<body>
  <h1>${esc(cName)}</h1>
  <div class="meta">Generated by Creator Studio 2.5 &bull; Nodes: ${nodesList.length} &bull; Factions: ${factions.length} &bull; NPCs: ${npcs.length} &bull; Quests: ${quests.length} &bull; Clocks: ${trackers.length}</div>

  <h2>1. Pointcrawl Nodes &amp; Sociological Dispositions</h2>
  <table>
    <thead><tr><th>ID</th><th>Name</th><th>Tier</th><th>[S, E, C] &amp; Quadrant</th><th>Faction</th><th>Notes &amp; 5D Sensory Profile</th></tr></thead>
    <tbody>${nodeRows || '<tr><td colspan="6"><em>No nodes recorded.</em></td></tr>'}</tbody>
  </table>

  <h2>2. First-Class Factions &amp; Diplomatic Matrix</h2>
  <table>
    <thead><tr><th>Faction</th><th>CVF Quadrant</th><th>HQ Node</th><th>Leader NPC</th><th>Diplomatic Stances</th></tr></thead>
    <tbody>${factionRows || '<tr><td colspan="5"><em>No factions recorded.</em></td></tr>'}</tbody>
  </table>

  <h2>3. Active Campaign NPCs</h2>
  <table>
    <thead><tr><th>Name</th><th>Role</th><th>Faction</th><th>Stationed Node</th><th>Motivation &amp; Notes</th></tr></thead>
    <tbody>${npcRows || '<tr><td colspan="5"><em>No NPCs recorded.</em></td></tr>'}</tbody>
  </table>

  <h2>4. Quests &amp; Step Triggers</h2>
  <table>
    <thead><tr><th>Quest Title</th><th>Status</th><th>Anchor Node</th><th>Steps &amp; Notes</th></tr></thead>
    <tbody>${questRows || '<tr><td colspan="4"><em>No quests recorded.</em></td></tr>'}</tbody>
  </table>

  <h2>5. Threat Clocks &amp; Escalation Dials</h2>
  <table>
    <thead><tr><th>Clock Name</th><th>Scope Tier</th><th>Ticks</th><th>Node</th><th>Consequences &amp; Notes</th></tr></thead>
    <tbody>${clockRows || '<tr><td colspan="5"><em>No threat clocks recorded.</em></td></tr>'}</tbody>
  </table>
</body>
</html>`;
}
window.generateCampaignHTMLDossier = generateCampaignHTMLDossier;



