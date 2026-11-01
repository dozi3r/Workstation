// ============================================================================
// CREATOR STUDIO: SELECTIVE SUB-MAP IMPORTER & ENTITY CONFLICT DETECTOR
// ============================================================================
// Ingests external campaign folders, .zip archives, or .creator.json packages,
// allows authors to cherry-pick submaps, and merges them into an active campaign
// or creates a new one, with granular entity conflict detection and resolution.

(function() {
  let incomingPackage = null;
  let detectedConflicts = [];
  let conflictResolutions = {};
  let importMode = "merge"; // 'new' | 'merge'

  /**
   * Main entrypoint: prompt user to pick Folder or File
   */
  function triggerSelectiveImportPackage() {
    if (window.showDirectoryPicker) {
      const pick = confirm("Click OK to import from a Campaign Folder on disk,\nor Cancel to select an Archive / File (.zip, .creator.json).");
      if (pick) {
        triggerSelectiveImportFolder();
        return;
      }
    }
    triggerSelectiveImportFile();
  }

  /**
   * Trigger folder selection via Chromium File System Access API
   */
  async function triggerSelectiveImportFolder(options = {}) {
    if (!window.showDirectoryPicker) {
      alert("Folder selection is supported in Chromium browsers. Please select a .zip or .creator.json file instead.");
      triggerSelectiveImportFile();
      return;
    }
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: "read" });
      if (!dirHandle) return;

      const pkg = {
        name: dirHandle.name,
        sourceType: "folder",
        maps: {},
        entities: { npcs: [], quests: [], items: [], trackers: [], tickets: [] },
        globalDials: {},
        directoryHandle: dirHandle
      };
      window.activeProjectDirectoryHandle = dirHandle;

      // 1. Read campaign.json if present
      try {
        const cFile = await dirHandle.getFileHandle("campaign.json");
        const cData = await (await cFile.getFile()).text();
        const parsed = JSON.parse(cData);
        pkg.name = parsed.name || parsed.campaignName || dirHandle.name;
        if (parsed.entities) {
          pkg.entities = {
            npcs: parsed.entities.npcs || [],
            quests: parsed.entities.quests || [],
            items: parsed.entities.items || [],
            trackers: parsed.entities.trackers || [],
            tickets: parsed.entities.tickets || []
          };
        }
        if (Array.isArray(parsed.npcs)) pkg.entities.npcs = parsed.npcs;
        if (Array.isArray(parsed.quests)) pkg.entities.quests = parsed.quests;
        if (Array.isArray(parsed.items)) pkg.entities.items = parsed.items;
        if (Array.isArray(parsed.trackers)) pkg.entities.trackers = parsed.trackers;
        if (Array.isArray(parsed.tickets)) pkg.entities.tickets = parsed.tickets;
        if (parsed.globalDials) pkg.globalDials = parsed.globalDials;
      } catch(e) {}

      // 2. Read topology.json or preset.json
      let topoParsed = null;
      try {
        const tFile = await dirHandle.getFileHandle("topology.json");
        topoParsed = JSON.parse(await (await tFile.getFile()).text());
      } catch(e) {
        try {
          const pFile = await dirHandle.getFileHandle("preset.json");
          topoParsed = JSON.parse(await (await pFile.getFile()).text());
        } catch(e2) {}
      }

      // 3. Collect maps and fallback entities
      if (topoParsed) {
        if (topoParsed.maps && typeof topoParsed.maps === "object" && Object.keys(topoParsed.maps).length > 0) {
          pkg.maps = topoParsed.maps;
        } else if (topoParsed.nodes) {
          pkg.maps["map_root"] = {
            id: "map_root",
            name: topoParsed.name || pkg.name || "Imported Map",
            scaleTier: "region",
            nodes: Array.isArray(topoParsed.nodes)
              ? topoParsed.nodes
              : Object.keys(topoParsed.nodes).map(k => {
                  const nObj = topoParsed.nodes[k];
                  const parsedNum = Number(k);
                  const resolvedId = (nObj && nObj.id !== undefined) ? nObj.id : (!isNaN(parsedNum) ? parsedNum : k);
                  return { ...nObj, id: resolvedId };
                }),
            links: topoParsed.links || []
          };
        }

        const candidateEntities = (topoParsed.activeTopology && topoParsed.activeTopology.entities)
          || topoParsed.entities
          || (topoParsed.activeTopology ? {
              npcs: topoParsed.activeTopology.npcs || [],
              quests: topoParsed.activeTopology.quests || [],
              items: topoParsed.activeTopology.items || [],
              trackers: topoParsed.activeTopology.trackers || [],
              tickets: topoParsed.activeTopology.tickets || []
             } : null);

        ['npcs', 'quests', 'items', 'trackers', 'tickets'].forEach(cat => {
          if (!pkg.entities[cat] || pkg.entities[cat].length === 0) {
            if (candidateEntities && Array.isArray(candidateEntities[cat]) && candidateEntities[cat].length > 0) {
              pkg.entities[cat] = candidateEntities[cat];
            } else if (Array.isArray(topoParsed[cat]) && topoParsed[cat].length > 0) {
              pkg.entities[cat] = topoParsed[cat];
            }
          }
        });
      }

      // 4. Ingest raster image assets from assets/ folder
      try {
        const assetsDir = await dirHandle.getDirectoryHandle("assets");
        for (const mId of Object.keys(pkg.maps)) {
          const mMap = pkg.maps[mId];
          if (mMap && mMap.mapMetadata && mMap.mapMetadata.assetPath) {
            const fileName = mMap.mapMetadata.assetPath.split("/").pop();
            try {
              const imgFile = await assetsDir.getFileHandle(fileName);
              const blob = await imgFile.getFile();
              mMap.mapMetadata.dataUrl = await blobToDataUrl(blob);
            } catch(imgErr) {}
          }
        }
      } catch(e) {}

      if (options && options.directOpen && typeof window.loadCampaignProjectPackage === "function") {
        await window.loadCampaignProjectPackage(pkg);
        if (typeof closeModal === "function") closeModal("modal-load");
        return;
      }
      openSelectiveImportModal(pkg);
    } catch(err) {
      if (err.name !== "AbortError") {
        console.error("[SelectiveImportFolder]", err);
        alert("Failed to read campaign folder: " + err.message);
      }
    }
  }

  /**
   * Trigger file input selection (.zip, .creator.json, .json)
   */
  function triggerSelectiveImportFile(options = {}) {
    window._selectiveImportOptions = options || {};
    let input = document.getElementById("selective-import-file-input");
    if (!input) {
      input = document.createElement("input");
      input.type = "file";
      input.id = "selective-import-file-input";
      input.accept = ".zip,.csz,.creator.json,.json";
      input.style.display = "none";
      document.body.appendChild(input);
      input.addEventListener("change", onSelectiveImportFileSelected);
    }
    input.value = "";
    input.click();
  }

  async function onSelectiveImportFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const options = window._selectiveImportOptions || {};

    try {
      const isZip = file.name.endsWith(".zip") || file.name.endsWith(".csz");
      if (isZip) {
        if (!window.ZeroCorsZip) {
          alert("ZIP decompression engine not loaded.");
          return;
        }
        const buffer = await file.arrayBuffer();
        const zipFiles = await window.ZeroCorsZip.parse(buffer);

        let mainData = null;
        if (zipFiles["preset.json"]) mainData = JSON.parse(new TextDecoder().decode(zipFiles["preset.json"]));
        else if (zipFiles["topology.json"]) mainData = JSON.parse(new TextDecoder().decode(zipFiles["topology.json"]));
        else if (zipFiles["campaign.json"]) mainData = JSON.parse(new TextDecoder().decode(zipFiles["campaign.json"]));

        if (!mainData) {
          alert("ZIP archive does not contain preset.json, topology.json, or campaign.json.");
          return;
        }

        let campMeta = {};
        if (zipFiles["campaign.json"]) {
          try { campMeta = JSON.parse(new TextDecoder().decode(zipFiles["campaign.json"])); } catch(e) {}
        }

        const candidateEntities = campMeta.entities 
          || (mainData && mainData.entities)
          || (mainData && mainData.activeTopology && mainData.activeTopology.entities)
          || (mainData && mainData.activeTopology ? {
              npcs: mainData.activeTopology.npcs || [],
              quests: mainData.activeTopology.quests || [],
              items: mainData.activeTopology.items || [],
              trackers: mainData.activeTopology.trackers || [],
              tickets: mainData.activeTopology.tickets || [],
              custom_modules: mainData.activeTopology.custom_modules || [],
              deletedModules: mainData.activeTopology.deletedModules || [],
              deletedPrototypes: mainData.activeTopology.deletedPrototypes || []
             } : null);

        const extractedEntities = {
          npcs: (candidateEntities && candidateEntities.npcs) || campMeta.npcs || (mainData && mainData.npcs) || [],
          quests: (candidateEntities && candidateEntities.quests) || campMeta.quests || (mainData && mainData.quests) || [],
          items: (candidateEntities && candidateEntities.items) || campMeta.items || (mainData && mainData.items) || [],
          trackers: (candidateEntities && candidateEntities.trackers) || campMeta.trackers || (mainData && mainData.trackers) || [],
          tickets: (candidateEntities && candidateEntities.tickets) || campMeta.tickets || (mainData && mainData.tickets) || [],
          custom_modules: (candidateEntities && candidateEntities.custom_modules) || campMeta.custom_modules || (mainData && mainData.custom_modules) || [],
          deletedModules: (candidateEntities && candidateEntities.deletedModules) || campMeta.deletedModules || (mainData && mainData.deletedModules) || [],
          deletedPrototypes: (candidateEntities && candidateEntities.deletedPrototypes) || campMeta.deletedPrototypes || (mainData && mainData.deletedPrototypes) || []
        };

        const pkg = {
          name: campMeta.name || mainData.name || file.name.replace(/\.[^/.]+$/, ""),
          sourceType: "zip",
          maps: mainData.maps || {},
          entities: extractedEntities,
          custom_modules: extractedEntities.custom_modules,
          deletedModules: extractedEntities.deletedModules,
          deletedPrototypes: extractedEntities.deletedPrototypes,
          edgeData: (mainData && mainData.edgeData) || (mainData && mainData.activeTopology && mainData.activeTopology.edgeData) || {},
          edgeNotes: (mainData && mainData.edgeNotes) || (mainData && mainData.activeTopology && mainData.activeTopology.edgeNotes) || {},
          globalDials: campMeta.globalDials || {}
        };

        if (Object.keys(pkg.maps).length === 0 && mainData.nodes) {
          pkg.maps["map_root"] = {
            id: "map_root",
            name: pkg.name,
            scaleTier: "region",
            nodes: Array.isArray(mainData.nodes)
              ? mainData.nodes
              : Object.keys(mainData.nodes).map(k => {
                  const nObj = mainData.nodes[k];
                  const parsedNum = Number(k);
                  const resolvedId = (nObj && nObj.id !== undefined) ? nObj.id : (!isNaN(parsedNum) ? parsedNum : k);
                  return { ...nObj, id: resolvedId };
                }),
            links: mainData.links || []
          };
        }

        // Hydrate images from zip
        for (const mId of Object.keys(pkg.maps)) {
          const mMap = pkg.maps[mId];
          if (!mMap) continue;
          const candidatePaths = [];
          if (mMap.mapMetadata && mMap.mapMetadata.assetPath) {
            candidatePaths.push(mMap.mapMetadata.assetPath.replace(/^\//, ""));
          }
          candidatePaths.push(`assets/${mId}_bg.png`, `assets/${mId}_bg.jpg`, `assets/${mId}_bg.jpeg`, `assets/${mId}_bg.webp`);
          for (const relPath of candidatePaths) {
            const rawBytes = zipFiles[relPath];
            if (rawBytes) {
              const lower = relPath.toLowerCase();
              const mime = (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) ? "image/jpeg" : (lower.endsWith(".webp") ? "image/webp" : "image/png");
              const blob = new Blob([rawBytes], { type: mime });
              const dUrl = await blobToDataUrl(blob);
              if (dUrl) {
                if (!mMap.mapMetadata) mMap.mapMetadata = { name: relPath.split("/").pop(), width: 1920, height: 1080, opacity: 0.85 };
                mMap.mapMetadata.assetPath = relPath;
                mMap.mapMetadata.dataUrl = dUrl;
                break;
              }
            }
          }
        }

        if (options && options.directOpen && typeof window.loadCampaignProjectPackage === "function") {
          await window.loadCampaignProjectPackage(pkg);
          if (typeof closeModal === "function") closeModal("modal-load");
          return;
        }
        openSelectiveImportModal(pkg);
      } else {
        // .creator.json or .json
        const text = await file.text();
        const parsed = JSON.parse(text);

        const candidateEntities = parsed.entities
          || (parsed.activeTopology && parsed.activeTopology.entities)
          || (parsed.activeTopology ? {
              npcs: parsed.activeTopology.npcs || [],
              quests: parsed.activeTopology.quests || [],
              items: parsed.activeTopology.items || [],
              trackers: parsed.activeTopology.trackers || [],
              tickets: parsed.activeTopology.tickets || []
             } : null);

        const extractedEntities = {
          npcs: (candidateEntities && candidateEntities.npcs) || parsed.npcs || [],
          quests: (candidateEntities && candidateEntities.quests) || parsed.quests || [],
          items: (candidateEntities && candidateEntities.items) || parsed.items || [],
          trackers: (candidateEntities && candidateEntities.trackers) || parsed.trackers || [],
          tickets: (candidateEntities && candidateEntities.tickets) || parsed.tickets || []
        };

        const pkg = {
          name: (parsed.metadata && parsed.metadata.campaignName) || parsed.name || file.name.replace(/\.[^/.]+$/, ""),
          sourceType: "json",
          maps: parsed.maps || {},
          entities: extractedEntities,
          globalDials: parsed.globalDials || {}
        };

        if (Object.keys(pkg.maps).length === 0 && (parsed.nodes || (parsed.preset && parsed.preset.nodes))) {
          const rawNodes = parsed.nodes || parsed.preset.nodes;
          pkg.maps["map_root"] = {
            id: "map_root",
            name: pkg.name,
            scaleTier: "region",
            nodes: Array.isArray(rawNodes)
              ? rawNodes
              : Object.keys(rawNodes).map(k => {
                  const nObj = rawNodes[k];
                  const parsedNum = Number(k);
                  const resolvedId = (nObj && nObj.id !== undefined) ? nObj.id : (!isNaN(parsedNum) ? parsedNum : k);
                  return { ...nObj, id: resolvedId };
                }),
            links: parsed.links || (parsed.preset && parsed.preset.links) || []
          };
        }

        if (options && options.directOpen && typeof window.loadCampaignProjectPackage === "function") {
        await window.loadCampaignProjectPackage(pkg);
        if (typeof closeModal === "function") closeModal("modal-load");
        return;
      }
      openSelectiveImportModal(pkg);
      }
    } catch(err) {
      console.error("[SelectiveImportFile]", err);
      alert("Failed to parse campaign file: " + err.message);
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Entity Conflict Detection Engine
   */
  function detectEntityConflicts(incomingEntities, currentTopology) {
    const conflicts = [];
    if (!incomingEntities || !currentTopology) return conflicts;

    const categories = [
      { key: "npcs", label: "NPC", nameProp: "name", compareProps: ["role", "faction", "motivation", "moduleId"] },
      { key: "quests", label: "Quest", nameProp: "title", compareProps: ["type", "threat", "faction", "status", "notes"] },
      { key: "items", label: "Item", nameProp: "name", compareProps: ["category", "specs", "notes"] },
      { key: "trackers", label: "Threat Clock", nameProp: "name", compareProps: ["type", "maxTicks", "faction", "notes"] },
      { key: "tickets", label: "Ticket", nameProp: "title", compareProps: ["status", "priority", "syllogism", "notes"] }
    ];

    categories.forEach(cat => {
      const inList = incomingEntities[cat.key] || [];
      const curList = currentTopology[cat.key] || [];

      inList.forEach(inEnt => {
        const inName = (inEnt[cat.nameProp] || "").trim().toLowerCase();
        const inId = String(inEnt.id || "").trim().toLowerCase();

        // Match on exact ID or exact Name
        const match = curList.find(cur => {
          const curId = String(cur.id || "").trim().toLowerCase();
          const curName = (cur[cat.nameProp] || "").trim().toLowerCase();
          return (inId && curId && inId === curId) || (inName && curName && inName === curName);
        });

        if (match) {
          const diffs = [];
          cat.compareProps.forEach(prop => {
            const v1 = String(match[prop] || "").trim();
            const v2 = String(inEnt[prop] || "").trim();
            if (v1 && v2 && v1 !== v2) {
              diffs.push({ field: prop, currentVal: v1, incomingVal: v2 });
            }
          });

          if (diffs.length > 0) {
            conflicts.push({
              category: cat.key,
              categoryLabel: cat.label,
              displayName: inEnt[cat.nameProp] || inEnt.id,
              currentEntity: match,
              incomingEntity: inEnt,
              diffs: diffs
            });
          }
        }
      });
    });

    return conflicts;
  }

  /**
   * Merge incoming entities into current topology with conflict resolutions applied
   */
  function mergeEntitiesWithResolutions(curTopo, incomingEntities, conflicts, resolutions) {
    if (!curTopo || !incomingEntities) return curTopo;
    if (!curTopo.npcs) curTopo.npcs = [];
    if (!curTopo.quests) curTopo.quests = [];
    if (!curTopo.items) curTopo.items = [];
    if (!curTopo.trackers) curTopo.trackers = [];
    if (!curTopo.tickets) curTopo.tickets = [];

    const resolvedIncomingIds = new Set();
    const conflictList = conflicts || [];
    const resMap = resolutions || {};

    conflictList.forEach((c, idx) => {
      const action = resMap[idx] || "keep_existing";
      const cat = c.category;
      const targetList = curTopo[cat] || [];
      resolvedIncomingIds.add(String(c.incomingEntity.id).toLowerCase());

      if (action === "overwrite") {
        const curIdx = targetList.findIndex(e => String(e.id).toLowerCase() === String(c.currentEntity.id).toLowerCase());
        if (curIdx >= 0) {
          targetList[curIdx] = { ...c.incomingEntity, id: c.currentEntity.id };
        }
      } else if (action === "clone") {
        const cloneId = `${c.incomingEntity.id}_${Date.now().toString(36).slice(-3)}`;
        const cloneName = `${c.displayName} (Imported)`;
        const nameProp = (cat === "quests" || cat === "tickets") ? "title" : "name";
        const cloned = { ...c.incomingEntity, id: cloneId, [nameProp]: cloneName };
        targetList.push(cloned);
      }
      // 'keep_existing': do nothing
    });

    ["npcs", "quests", "items", "trackers", "tickets"].forEach(cat => {
      const inList = incomingEntities[cat] || [];
      const curList = curTopo[cat] || [];
      inList.forEach(inEnt => {
        const idKey = String(inEnt.id).toLowerCase();
        if (!resolvedIncomingIds.has(idKey)) {
          // Ensure no ID clash
          const exists = curList.some(e => String(e.id).toLowerCase() === idKey);
          if (!exists) {
            curList.push(JSON.parse(JSON.stringify(inEnt)));
          }
        }
      });
    });

    return curTopo;
  }

  /**
   * Open the Selective Map Import Modal
   */
  function openSelectiveImportModal(pkg) {
    incomingPackage = pkg;
    conflictResolutions = {};
    const curTopology = (window.Workstation && window.Workstation.activeTopology) || { npcs: [], quests: [], items: [], trackers: [], tickets: [] };

    // Default to 'merge' if current canvas has nodes; otherwise 'new'
    const hasCurrentProject = (curTopology.nodes && (Array.isArray(curTopology.nodes) ? curTopology.nodes.length > 0 : Object.keys(curTopology.nodes).length > 0));
    importMode = hasCurrentProject ? "merge" : "new";

    detectedConflicts = detectEntityConflicts(pkg.entities, curTopology);
    detectedConflicts.forEach((c, idx) => {
      conflictResolutions[idx] = "keep_existing"; // Default safe choice
    });

    renderSelectiveImportModal();
    if (typeof MDIWindowManager !== "undefined") {
      MDIWindowManager.open("modal-selective-map-import");
    } else {
      const el = document.getElementById("modal-selective-map-import");
      if (el) el.classList.remove("hidden");
    }
  }

  /**
   * Render the Selective Map Import UI
   */
  function renderSelectiveImportModal() {
    const body = document.getElementById("selective-import-modal-body");
    if (!body || !incomingPackage) return;

    const mapsObj = incomingPackage.maps || {};
    const mapKeys = Object.keys(mapsObj);
    const totalMaps = mapKeys.length;

    // Get active nodes in current campaign to populate parent node dropdown
    const currentActiveMapNodes = (typeof nodes !== "undefined" && Array.isArray(nodes)) ? nodes : [];

    let html = `
      <!-- Source Header & Mode Selector -->
      <div class="bevel-inset" style="padding:6px 8px; background:#f1f5f9; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#000080; font-size:12px;">Package: ${incomingPackage.name}</strong>
          <span style="font-size:10px; color:#64748b; margin-left:6px;">(${totalMaps} sub-map${totalMaps === 1 ? '' : 's'} available)</span>
        </div>
        <div style="display:flex; gap:12px; font-size:11px; font-weight:bold;">
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="radio" name="sel-import-mode" value="new" ${importMode === 'new' ? 'checked' : ''} onchange="window.setSelectiveImportMode('new')">
            <span>Start New Campaign</span>
          </label>
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="radio" name="sel-import-mode" value="merge" ${importMode === 'merge' ? 'checked' : ''} onchange="window.setSelectiveImportMode('merge')">
            <span>Add / Merge into Active Campaign</span>
          </label>
        </div>
      </div>

      <!-- Map Checklist Container -->
      <div style="flex:1; display:flex; flex-direction:column; min-height:0; gap:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:bold; color:#334155;">
          <span>Select Sub-Maps to Bring In:</span>
          <div style="display:flex; gap:6px;">
            <button class="win-btn" onclick="window.toggleAllSelectiveMaps(true)" style="font-size:9px; padding:1px 6px;">Select All</button>
            <button class="win-btn" onclick="window.toggleAllSelectiveMaps(false)" style="font-size:9px; padding:1px 6px;">Deselect All</button>
          </div>
        </div>

        <div class="bevel-inset" style="flex:1; overflow-y:auto; background:#ffffff; padding:6px; display:flex; flex-direction:column; gap:6px;">
          ${mapKeys.map(mId => {
            const m = mapsObj[mId];
            const nodeCount = (m.nodes || []).length || (m.nodes ? Object.keys(m.nodes).length : 0);
            const linkCount = (m.links || []).length;
            const hasImg = !!(m.mapMetadata && (m.mapMetadata.dataUrl || m.mapMetadata.assetPath));
            const tier = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier]) ? SCALE_TIERS[m.scaleTier] : { label: "Region", icon: "🗺️" };

            return `
              <div class="bevel-outset" style="padding:6px; background:#f8fafc; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="chk-map-${mId}" value="${mId}" checked style="cursor:pointer;">
                  <span style="font-size:16px;">${hasImg ? '🖼️' : tier.icon}</span>
                  <div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <strong style="font-size:11px; color:#000080;">${m.name || mId}</strong>
                      <span style="font-size:9px; background:#000080; color:#fff; padding:1px 4px; border-radius:2px; font-weight:bold;">${(m.scaleTier || 'region').toUpperCase()}</span>
                      ${hasImg ? '<span style="font-size:9px; background:#16a34a; color:#fff; padding:1px 4px; border-radius:2px;">Custom Image</span>' : ''}
                    </div>
                    <div style="font-size:10px; color:#64748b; margin-top:2px;">
                      <span>📍 ${nodeCount} Nodes</span> &bull; 
                      <span>🛤️ ${linkCount} Corridors</span>
                    </div>
                  </div>
                </div>

                ${importMode === 'merge' ? `
                  <div style="display:flex; align-items:center; gap:4px; font-size:10px;">
                    <span style="color:#475569;">Attach to Node:</span>
                    <select id="sel-parent-node-${mId}" class="win-select-input" style="font-size:10px; width:160px;">
                      <option value="">[Standalone Layout Tab]</option>
                      ${currentActiveMapNodes.map(n => `
                        <option value="${n.id}">Node #${n.id}: ${(n.name || 'POI #' + n.id).substring(0, 20)}</option>
                      `).join('')}
                    </select>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Entity Import & Conflict Resolution Section -->
      <div class="bevel-inset" style="padding:6px; background:#f8fafc; display:flex; flex-direction:column; gap:4px; max-height:160px; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:bold; cursor:pointer;">
            <input type="checkbox" id="chk-import-entities" checked>
            <span>Import Stationed Campaign Entities (NPCs, Quests, Items, Clocks)</span>
          </label>
          ${detectedConflicts.length > 0 && importMode === 'merge' ? `
            <span style="font-size:10px; color:#b91c1c; font-weight:bold; background:#fee2e2; padding:1px 6px; border:1px solid #f87171; border-radius:2px;">
              ⚠️ ${detectedConflicts.length} Conflict(s) Detected
            </span>
          ` : ''}
        </div>

        ${detectedConflicts.length > 0 && importMode === 'merge' ? `
          <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
            <span style="font-size:10px; font-weight:bold; color:#7f1d1d;">Conflict Resolution Table:</span>
            ${detectedConflicts.map((c, idx) => `
              <div class="bevel-outset" style="padding:4px 6px; background:#fff; font-size:10px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
                <div style="flex:1;">
                  <strong>[${c.categoryLabel}] ${c.displayName}</strong>
                  <div style="color:#475569; font-size:9px;">
                    ${c.diffs.map(d => `<span style="margin-right:6px;">${d.field}: <em>"${d.currentVal.substring(0,18)}"</em> vs <strong>"${d.incomingVal.substring(0,18)}"</strong></span>`).join(' ')}
                  </div>
                </div>
                <select class="win-select-input" style="font-size:10px; width:170px;" onchange="window.setSelectiveConflictResolution(${idx}, this.value)">
                  <option value="keep_existing" ${conflictResolutions[idx] === 'keep_existing' ? 'selected' : ''}>Keep Current Version</option>
                  <option value="overwrite" ${conflictResolutions[idx] === 'overwrite' ? 'selected' : ''}>Overwrite Current</option>
                  <option value="clone" ${conflictResolutions[idx] === 'clone' ? 'selected' : ''}>Clone as New (Keep Both)</option>
                </select>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Dialog Footer -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:4px;">
        <span style="font-size:10px; color:#64748b;">Selected submaps will be hydrated with all nodes and images.</span>
        <div style="display:flex; gap:6px;">
          <button class="win-btn" onclick="window.executeSelectiveImport()" style="font-weight:bold; padding:3px 12px; color:#000080;">
            Import Selected Maps
          </button>
          <button class="win-btn" onclick="MDIWindowManager.close('modal-selective-map-import')" style="min-width:60px;">
            Cancel
          </button>
        </div>
      </div>
    `;

    body.innerHTML = html;
  }

  window.setSelectiveImportMode = function(mode) {
    importMode = mode;
    renderSelectiveImportModal();
  };

  window.toggleAllSelectiveMaps = function(checked) {
    if (!incomingPackage || !incomingPackage.maps) return;
    Object.keys(incomingPackage.maps).forEach(mId => {
      const chk = document.getElementById(`chk-map-${mId}`);
      if (chk) chk.checked = checked;
    });
  };

  window.setSelectiveConflictResolution = function(idx, val) {
    conflictResolutions[idx] = val;
  };

  /**
   * Execute the Selective Import
   */
  window.executeSelectiveImport = async function() {
    if (!incomingPackage || !incomingPackage.maps) return;
    const mapsObj = incomingPackage.maps;
    const selectedMapIds = Object.keys(mapsObj).filter(mId => {
      const chk = document.getElementById(`chk-map-${mId}`);
      return chk && chk.checked;
    });

    if (selectedMapIds.length === 0) {
      alert("Please select at least one sub-map to import.");
      return;
    }

    const importEntities = document.getElementById("chk-import-entities") ? document.getElementById("chk-import-entities").checked : true;

    if (importMode === "new") {
      // -------------------------------------------------------------
      // MODE A: START NEW CAMPAIGN WITH SELECTED MAPS
      // -------------------------------------------------------------
      if (typeof resetWorkstationSlate === "function") {
        await resetWorkstationSlate({
          campaignId: incomingPackage.id || incomingPackage.campaignId || "imported_campaign",
          campaignName: incomingPackage.name || "Imported Campaign"
        });
      }

      const newMaps = {};
      selectedMapIds.forEach(mId => {
        newMaps[mId] = JSON.parse(JSON.stringify(mapsObj[mId]));
      });

      // Set first selected as root if needed
      const rootId = selectedMapIds.includes("map_root") ? "map_root" : selectedMapIds[0];
      activeMapId = rootId;
      maps = newMaps;

      if (typeof currentCampaignName !== "undefined") {
        currentCampaignName = incomingPackage.name || "Imported Campaign";
      }

      // Restore first map into active canvas
      const firstMap = maps[activeMapId];
      nodes = Array.isArray(firstMap.nodes) ? JSON.parse(JSON.stringify(firstMap.nodes)) : [];
      links = Array.isArray(firstMap.links) ? JSON.parse(JSON.stringify(firstMap.links)) : [];
      drawnCards = firstMap.drawnCards || {};
      nodeSlottedModules = firstMap.nodeSlottedModules || {};
      edgeSlottedModules = firstMap.edgeSlottedModules || {};

      if (typeof syncAdapterToWorkstationTopology === "function") syncAdapterToWorkstationTopology();

      // Entities
      const targetTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) 
        ? Workstation.activeTopology 
        : ((window.Workstation && window.Workstation.activeTopology) ? window.Workstation.activeTopology : null);

      if (importEntities && incomingPackage.entities && targetTopo) {
        targetTopo.npcs = JSON.parse(JSON.stringify(incomingPackage.entities.npcs || []));
        targetTopo.quests = JSON.parse(JSON.stringify(incomingPackage.entities.quests || []));
        targetTopo.items = JSON.parse(JSON.stringify(incomingPackage.entities.items || []));
        targetTopo.trackers = JSON.parse(JSON.stringify(incomingPackage.entities.trackers || []));
        targetTopo.tickets = JSON.parse(JSON.stringify(incomingPackage.entities.tickets || []));
        if (Array.isArray(incomingPackage.entities.custom_modules)) {
          targetTopo.custom_modules = JSON.parse(JSON.stringify(incomingPackage.entities.custom_modules));
        }
        if (Array.isArray(incomingPackage.entities.deletedModules)) {
          targetTopo.deletedModules = JSON.parse(JSON.stringify(incomingPackage.entities.deletedModules));
        }
        if (Array.isArray(incomingPackage.entities.deletedPrototypes)) {
          targetTopo.deletedPrototypes = JSON.parse(JSON.stringify(incomingPackage.entities.deletedPrototypes));
        }
        if (incomingPackage.edgeData) targetTopo.edgeData = JSON.parse(JSON.stringify(incomingPackage.edgeData));
        if (incomingPackage.edgeNotes) targetTopo.edgeNotes = JSON.parse(JSON.stringify(incomingPackage.edgeNotes));
        if (typeof ensureEntityCollections === 'function') ensureEntityCollections(targetTopo);
        if (typeof syncCustomModulesToCatalog === 'function') syncCustomModulesToCatalog(targetTopo);
        if (typeof purgeDeletedModulesFromRuntimeCatalog === 'function') purgeDeletedModulesFromRuntimeCatalog(targetTopo);
      }

      // Persist map images
      for (const mId of selectedMapIds) {
        const mMap = maps[mId];
        if (mMap && mMap.mapMetadata && mMap.mapMetadata.dataUrl && typeof saveMapImageToDB === "function") {
          const preservedAssetPath = mMap.mapMetadata.assetPath;
          await saveMapImageToDB(mMap.mapMetadata.name, mMap.mapMetadata.dataUrl, mMap.mapMetadata.width, mMap.mapMetadata.height, mMap.mapMetadata.opacity || 0.85, mId);
          if (mId === activeMapId && typeof applyMapImageToCanvas === "function") {
            applyMapImageToCanvas(mMap.mapMetadata.dataUrl, mMap.mapMetadata.width, mMap.mapMetadata.height, mMap.mapMetadata.opacity || 0.85, true);
          }
          if (typeof stripMapImageDataUrl === "function") {
            mMap.mapMetadata = stripMapImageDataUrl(mMap.mapMetadata);
            if (preservedAssetPath) mMap.mapMetadata.assetPath = preservedAssetPath;
          }
        }
      }

      if (typeof renderCanvas === "function") renderCanvas();
      if (typeof renderLayoutTabs === "function") renderLayoutTabs();
      if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
      if (typeof renderEntityManagerTree === "function") renderEntityManagerTree();
      if (typeof renderEntityManagerList === "function") renderEntityManagerList();
      if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
      if (typeof saveActiveCampaign === "function") saveActiveCampaign();

      // Dispatch onCampaignLoad lifecycle hook to registered mods
      if (typeof Workstation !== "undefined" && Workstation.registeredMods) {
        Object.values(Workstation.registeredMods).forEach(modDef => {
          if (modDef && typeof modDef.onCampaignLoad === 'function') {
            try {
              modDef.onCampaignLoad(targetTopo);
            } catch (modErr) {
              console.error(`[Mod ${modDef.id}] onCampaignLoad error:`, modErr);
            }
          }
        });
      }

      MDIWindowManager.close("modal-selective-map-import");
      if (typeof setStatusBarMessage === "function") {
        setStatusBarMessage(`Initialized new campaign "${currentCampaignName}" with ${selectedMapIds.length} map(s).`);
      }
    } else {
      // -------------------------------------------------------------
      // MODE B: ADD / MERGE SELECTED MAPS INTO CURRENT CAMPAIGN
      // -------------------------------------------------------------
      if (typeof maps === "undefined" || !maps) maps = {};
      const idMap = {}; // oldId -> newId

      for (const oldId of selectedMapIds) {
        const srcMap = mapsObj[oldId];
        let targetId = oldId;

        // Collision avoidance: if map ID already exists in current project, generate unique ID
        if (maps[targetId] || targetId === "map_root") {
          const slug = (srcMap.name || oldId).toLowerCase().replace(/[^a-z0-9_]/g, "_");
          targetId = `map_${slug}_${Date.now().toString(36).slice(-4)}`;
        }
        idMap[oldId] = targetId;

        const clonedMap = JSON.parse(JSON.stringify(srcMap));
        clonedMap.id = targetId;

        // Check if user chose to attach this map to a node in the current active map
        const selParent = document.getElementById(`sel-parent-node-${oldId}`);
        const parentNodeId = (selParent && selParent.value) ? parseInt(selParent.value) : null;

        if (parentNodeId !== null && !isNaN(parentNodeId)) {
          clonedMap.parentMapId = activeMapId;
          clonedMap.parentNodeId = parentNodeId;

          // Set childMapId on that node to turn it into a Portal Node!
          const targetNode = (typeof getNode === "function") ? getNode(parentNodeId) : null;
          if (targetNode) {
            targetNode.childMapId = targetId;
          }
          if (window.Workstation && window.Workstation.activeTopology && window.Workstation.activeTopology.nodes) {
            const wNode = window.Workstation.activeTopology.nodes[parentNodeId] || window.Workstation.activeTopology.nodes[String(parentNodeId)];
            if (wNode) wNode.childMapId = targetId;
          }
        }

        maps[targetId] = clonedMap;

        // Persist image
        if (clonedMap.mapMetadata && clonedMap.mapMetadata.dataUrl && typeof saveMapImageToDB === "function") {
          const preservedAssetPath = clonedMap.mapMetadata.assetPath;
          await saveMapImageToDB(clonedMap.mapMetadata.name, clonedMap.mapMetadata.dataUrl, clonedMap.mapMetadata.width, clonedMap.mapMetadata.height, clonedMap.mapMetadata.opacity || 0.85, targetId);
          if (targetId === activeMapId && typeof applyMapImageToCanvas === "function") {
            applyMapImageToCanvas(clonedMap.mapMetadata.dataUrl, clonedMap.mapMetadata.width, clonedMap.mapMetadata.height, clonedMap.mapMetadata.opacity || 0.85, true);
          }
          if (typeof stripMapImageDataUrl === "function") {
            clonedMap.mapMetadata = stripMapImageDataUrl(clonedMap.mapMetadata);
            if (preservedAssetPath) clonedMap.mapMetadata.assetPath = preservedAssetPath;
          }
        }
      }

      // Handle Entities & Conflicts
      const curTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) 
        ? Workstation.activeTopology 
        : ((window.Workstation && window.Workstation.activeTopology) ? window.Workstation.activeTopology : null);

      if (importEntities && incomingPackage.entities && curTopo) {
        mergeEntitiesWithResolutions(curTopo, incomingPackage.entities, detectedConflicts, conflictResolutions);
      }

      if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();
      if (typeof renderCanvas === "function") renderCanvas();
      if (typeof renderLayoutTabs === "function") renderLayoutTabs();
      if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
      if (typeof renderMapNavigatorList === "function") renderMapNavigatorList();
      if (typeof renderEntityManagerTree === "function") renderEntityManagerTree();
      if (typeof renderEntityManagerList === "function") renderEntityManagerList();
      if (typeof updatePropertiesGrid === "function") updatePropertiesGrid();
      if (typeof saveActiveCampaign === "function") saveActiveCampaign();

      // Dispatch onCampaignLoad lifecycle hook to registered mods
      if (typeof Workstation !== "undefined" && Workstation.registeredMods) {
        Object.values(Workstation.registeredMods).forEach(modDef => {
          if (modDef && typeof modDef.onCampaignLoad === 'function') {
            try {
              modDef.onCampaignLoad(targetTopo);
            } catch (modErr) {
              console.error(`[Mod ${modDef.id}] onCampaignLoad error:`, modErr);
            }
          }
        });
      }

      MDIWindowManager.close("modal-selective-map-import");
      if (typeof setStatusBarMessage === "function") {
        setStatusBarMessage(`Added ${selectedMapIds.length} sub-map(s) into active campaign with conflict resolutions.`);
      }
    }
  };

  // Expose global triggers
  window.triggerSelectiveImportPackage = triggerSelectiveImportPackage;
  window.triggerSelectiveImportFile = triggerSelectiveImportFile;
  window.triggerSelectiveImportFolder = triggerSelectiveImportFolder;
  window.openSelectiveImportModal = openSelectiveImportModal;
  window.detectEntityConflicts = detectEntityConflicts;
  window.mergeEntitiesWithResolutions = mergeEntitiesWithResolutions;
})();
