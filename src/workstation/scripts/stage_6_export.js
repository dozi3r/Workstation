// --- STAGE 6: CAMPAIGN EXPORT (THING 3) ---
let activeExportTab = "json";

if (typeof window.getNodeDisplayName !== "function") {
  window.getNodeDisplayName = function(n) {
    if (!n) return "Unknown Node";
    return n.name || n.label || ("Node " + (n.id !== undefined ? n.id : "?"));
  };
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
    nodes: nodes.map(n => {
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
      const [uStr, vStr] = k.split("->");
      const uNode = getNode(parseInt(uStr));
      const vNode = getNode(parseInt(vStr));
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
        tickets: []
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

