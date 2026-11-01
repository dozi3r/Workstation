// ============================================================================
// CREATOR STUDIO: SIMPLE ENTITY MODULE PACK ENGINE (.csmod / .zip)
// ============================================================================
// Zero-CORS offline ingestion, validation, portal anchoring, persistence,
// provenance tracking, teardown, and export for Entity Module Packs.
// Conforms to ADR-0003, ADR-0005, ADR-0010, ADR-0018.

(function() {
  /**
   * Helper: Convert Uint8Array to DataURL safely in browser and Node.js
   */
  function uint8ArrayToDataUrl(bytes, mimeType) {
    if (typeof Buffer !== 'undefined') {
      const base64 = Buffer.from(bytes).toString('base64');
      return Promise.resolve(`data:${mimeType || 'image/png'};base64,${base64}`);
    }
    if (typeof Blob !== 'undefined' && typeof FileReader !== 'undefined') {
      return new Promise((resolve) => {
        try {
          const blob = new Blob([bytes], { type: mimeType || 'image/png' });
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        } catch (_) {
          resolve(null);
        }
      });
    }
    return Promise.resolve(null);
  }

  /**
   * Helper: Infer MIME type from asset filename
   */
  function inferMimeType(fileName) {
    const lower = (fileName || '').toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    return 'image/png';
  }

  /**
   * Helper: Convert DataURL to raw Uint8Array safely in browser and Node.js
   */
  function dataUrlToUint8Array(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const base64 = dataUrl.slice(commaIdx + 1);

    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    }
    if (typeof atob !== 'undefined') {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    return null;
  }

  /**
   * Helper: Remap foreign key references across entities and submap nodes when cloned
   */
  function remapEntityCluster(entities, submaps, entityIdMap, mapIdMap) {
    const hasEntityRemaps = entityIdMap && Object.keys(entityIdMap).length > 0;
    const hasMapRemaps = mapIdMap && Object.keys(mapIdMap).length > 0;
    if (!hasEntityRemaps && !hasMapRemaps) return;

    const remapId = (id) => (hasEntityRemaps && entityIdMap[id]) ? entityIdMap[id] : id;
    const remapArr = (arr) => Array.isArray(arr) ? arr.map(remapId) : arr;
    const remapMapId = (id) => (hasMapRemaps && mapIdMap[id]) ? mapIdMap[id] : id;

    // Remap NPCs
    if (entities && Array.isArray(entities.npcs)) {
      for (const npc of entities.npcs) {
        if (!npc) continue;
        if (npc.questIds) npc.questIds = remapArr(npc.questIds);
        if (npc.itemIds) npc.itemIds = remapArr(npc.itemIds);
        if (npc.submapId) npc.submapId = remapMapId(npc.submapId);
        if (Array.isArray(npc.relationships)) {
          for (const rel of npc.relationships) {
            if (rel && rel.targetNpcId) rel.targetNpcId = remapId(rel.targetNpcId);
          }
        }
      }
    }

    // Remap Quests
    if (entities && Array.isArray(entities.quests)) {
      for (const q of entities.quests) {
        if (!q) continue;
        if (q.npcIds) q.npcIds = remapArr(q.npcIds);
        if (q.targetNpcId) q.targetNpcId = remapId(q.targetNpcId);
        if (q.giverNpcId) q.giverNpcId = remapId(q.giverNpcId);
        if (q.itemIds) q.itemIds = remapArr(q.itemIds);
        if (q.submapId) q.submapId = remapMapId(q.submapId);
      }
    }

    // Remap Items
    if (entities && Array.isArray(entities.items)) {
      for (const it of entities.items) {
        if (!it) continue;
        if (it.ownerNpcId) it.ownerNpcId = remapId(it.ownerNpcId);
        if (it.submapId) it.submapId = remapMapId(it.submapId);
      }
    }

    // Remap Trackers
    if (entities && Array.isArray(entities.trackers)) {
      for (const tr of entities.trackers) {
        if (!tr) continue;
        if (tr.submapId) tr.submapId = remapMapId(tr.submapId);
      }
    }

    // Remap Submap Nodes
    if (submaps && typeof submaps === 'object') {
      for (const mId of Object.keys(submaps)) {
        const mapObj = submaps[mId];
        if (mapObj && mapObj.nodes) {
          const nodesList = Array.isArray(mapObj.nodes) ? mapObj.nodes : Object.values(mapObj.nodes);
          for (const node of nodesList) {
            if (!node) continue;
            if (node.stationedNpcIds) node.stationedNpcIds = remapArr(node.stationedNpcIds);
            if (node.npcIds) node.npcIds = remapArr(node.npcIds);
            if (node.questIds) node.questIds = remapArr(node.questIds);
            if (node.itemIds) node.itemIds = remapArr(node.itemIds);
            if (hasMapRemaps && node.childMapId && mapIdMap[node.childMapId]) {
              node.childMapId = mapIdMap[node.childMapId];
            }
          }
        }
      }
    }
  }

  /**
   * Validate a pack.json manifest structure
   */
  function validatePackManifest(manifest) {
    const errors = [];
    if (!manifest || typeof manifest !== 'object') {
      return { valid: false, errors: ['Manifest must be a non-null JSON object'] };
    }
    if (!manifest.formatVersion || typeof manifest.formatVersion !== 'string') {
      errors.push('Missing or invalid formatVersion');
    }
    if (!manifest.packId || typeof manifest.packId !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(manifest.packId)) {
      errors.push('Missing or invalid packId (must be alphanumeric snake_case/kebab-case)');
    }
    if (!manifest.name || typeof manifest.name !== 'string' || manifest.name.trim().length === 0) {
      errors.push('Missing or invalid name');
    }
    if (!manifest.entryMapId || typeof manifest.entryMapId !== 'string' || manifest.entryMapId.trim().length === 0) {
      errors.push('Missing or invalid entryMapId');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse an Entity Module Pack archive from an ArrayBuffer
   */
  async function parsePackArchive(arrayBuffer) {
    if (!window.ZeroCorsZip || typeof window.ZeroCorsZip.parse !== 'function') {
      throw new Error('ZeroCorsZip engine not available');
    }
    const zipFiles = await window.ZeroCorsZip.parse(arrayBuffer);

    if (!zipFiles['pack.json']) {
      throw new Error('Invalid Entity Module Pack: pack.json manifest not found.');
    }

    const textDecoder = new TextDecoder();
    let manifest;
    try {
      manifest = JSON.parse(textDecoder.decode(zipFiles['pack.json']));
    } catch (err) {
      throw new Error('Corrupt pack.json manifest: ' + err.message);
    }

    const validation = validatePackManifest(manifest);
    if (!validation.valid) {
      throw new Error('Invalid pack manifest: ' + validation.errors.join('; '));
    }

    // Extract Maps (maps/*.json)
    const maps = {};
    for (const filePath of Object.keys(zipFiles)) {
      if (filePath.startsWith('maps/') && filePath.endsWith('.json')) {
        try {
          const mapData = JSON.parse(textDecoder.decode(zipFiles[filePath]));
          const mapId = mapData.id || filePath.replace(/^maps\//, '').replace(/\.json$/, '');
          mapData.id = mapId;
          maps[mapId] = mapData;
        } catch (e) {
          console.warn('[PackEngine] Failed to parse submap file:', filePath, e);
        }
      }
    }

    // Extract Entities (entities.json)
    let entities = { npcs: [], quests: [], items: [], trackers: [], tickets: [] };
    if (zipFiles['entities.json']) {
      try {
        const entData = JSON.parse(textDecoder.decode(zipFiles['entities.json']));
        ['npcs', 'quests', 'items', 'trackers', 'tickets'].forEach((cat) => {
          if (Array.isArray(entData[cat])) entities[cat] = entData[cat];
        });
      } catch (e) {
        console.warn('[PackEngine] Failed to parse entities.json:', e);
      }
    }

    // Extract Worldbuilding Modules (modules/*.md)
    const modules = {};
    for (const filePath of Object.keys(zipFiles)) {
      if (filePath.startsWith('modules/') && filePath.endsWith('.md')) {
        const modName = filePath.replace(/^modules\//, '');
        modules[modName] = textDecoder.decode(zipFiles[filePath]);
      }
    }

    // Extract Raster Image Assets (assets/*)
    const assets = {};
    for (const filePath of Object.keys(zipFiles)) {
      if (filePath.startsWith('assets/') && zipFiles[filePath].length > 0) {
        const assetName = filePath.replace(/^assets\//, '');
        assets[assetName] = zipFiles[filePath];
      }
    }

    return {
      manifest,
      maps,
      entities,
      modules,
      assets
    };
  }

  /**
   * Ingest and install a parsed pack into the active campaign
   */
  async function installPackIntoCampaign(parsedPack, options = {}) {
    if (!parsedPack || !parsedPack.manifest) {
      throw new Error('installPackIntoCampaign: Invalid parsedPack');
    }
    const manifest = parsedPack.manifest;
    const anchorNodeId = options.anchorNodeId !== undefined ? options.anchorNodeId : null;
    const conflictResolutions = options.conflictResolutions || {};

    if (typeof Workstation === 'undefined') {
      window.Workstation = {};
    }
    if (!Workstation.activeTopology) {
      Workstation.activeTopology = {
        name: 'Active Campaign',
        nodes: [],
        links: [],
        maps: {},
        npcs: [],
        quests: [],
        items: [],
        trackers: [],
        tickets: [],
        custom_modules: [],
        installedPacks: []
      };
    }
    const topo = Workstation.activeTopology;
    if (!topo.maps) topo.maps = {};
    if (!topo.installedPacks) topo.installedPacks = [];
    if (!topo.custom_modules) topo.custom_modules = [];
    ['npcs', 'quests', 'items', 'trackers', 'tickets'].forEach((cat) => {
      if (!Array.isArray(topo[cat])) topo[cat] = [];
    });
    if (typeof maps === 'undefined') {
      window.maps = {};
    }

    // 1. Map ID Collision Avoidance & Registration
    const mapIdMap = {};
    const existingMaps = Object.assign({}, maps, topo.maps);
    for (const rawMapId of Object.keys(parsedPack.maps)) {
      let resolvedMapId = rawMapId;
      if (existingMaps[resolvedMapId]) {
        resolvedMapId = `${rawMapId}_${manifest.packId}_${Date.now()}`;
      }
      mapIdMap[rawMapId] = resolvedMapId;
    }

    const resolvedEntryMapId = mapIdMap[manifest.entryMapId] || manifest.entryMapId;

    // 2. Portal Anchor Linking
    let previousChildMapId = null;
    if (anchorNodeId !== null && anchorNodeId !== undefined) {
      const activeNodes = (typeof nodes !== 'undefined' && Array.isArray(nodes)) ? nodes : (topo.nodes || []);
      const anchorNode = activeNodes.find((n) => n && n.id == anchorNodeId);
      if (anchorNode) {
        if (anchorNode.childMapId && anchorNode.childMapId !== resolvedEntryMapId) {
          previousChildMapId = anchorNode.childMapId;
        }
        anchorNode.childMapId = resolvedEntryMapId;
      }
    }

    // 3. Process Submaps & Offload Raster Images to IndexedDB
    const currentActiveMapId = (typeof activeMapId !== 'undefined' && activeMapId) ? activeMapId : 'map_root';
    for (const rawMapId of Object.keys(parsedPack.maps)) {
      const submap = JSON.parse(JSON.stringify(parsedPack.maps[rawMapId]));
      const newMapId = mapIdMap[rawMapId];
      submap.id = newMapId;
      if (rawMapId === manifest.entryMapId) {
        submap.parentMapId = currentActiveMapId;
        submap.parentNodeId = anchorNodeId;
      }

      // Check for raster asset hydration into IndexedDB
      if (submap.mapMetadata && submap.mapMetadata.assetPath) {
        const assetName = submap.mapMetadata.assetPath.replace(/^assets\//, '');
        const assetBytes = parsedPack.assets[assetName];
        if (assetBytes) {
          const mime = inferMimeType(assetName);
          const dataUrl = await uint8ArrayToDataUrl(assetBytes, mime);
          if (dataUrl && typeof saveMapImageToDB === 'function') {
            await saveMapImageToDB(
              submap.mapMetadata.name || assetName,
              dataUrl,
              submap.mapMetadata.width || 1920,
              submap.mapMetadata.height || 1080,
              submap.mapMetadata.opacity ?? 0.85,
              newMapId
            );
          }
          if (typeof stripMapImageDataUrl === 'function') {
            submap.mapMetadata = stripMapImageDataUrl(submap.mapMetadata);
          } else {
            delete submap.mapMetadata.dataUrl;
            delete submap.mapMetadata.url;
          }
        }
      }

      maps[newMapId] = submap;
      topo.maps[newMapId] = submap;
    }

    // 4. Ingest Entities & Disambiguate Collisions
    const ingestedEntityIds = { npcs: [], quests: [], items: [], trackers: [], tickets: [] };
    const entityIdMap = {};

    for (const cat of ['npcs', 'quests', 'items', 'trackers', 'tickets']) {
      const incomingList = parsedPack.entities[cat] || [];
      const currentList = topo[cat];

      for (const ent of incomingList) {
        const entCopy = Object.assign({}, ent);
        entCopy._packId = manifest.packId;

        const collision = currentList.find((e) => e && (e.id === entCopy.id || (e.name && e.name === entCopy.name)));
        const resolution = conflictResolutions[entCopy.id] || 'clone';

        if (collision) {
          if (resolution === 'skip') {
            continue;
          } else if (resolution === 'overwrite') {
            const idx = currentList.findIndex((e) => e && e.id === collision.id);
            if (idx !== -1) currentList.splice(idx, 1);
            currentList.push(entCopy);
            ingestedEntityIds[cat].push(entCopy.id);
            continue;
          } else {
            // Default: 'clone'
            const origId = entCopy.id;
            const newId = `${entCopy.id}_${manifest.packId}_${Date.now()}`;
            entCopy.id = newId;
            entCopy.name = `${entCopy.name} (${manifest.name})`;
            entityIdMap[origId] = newId;
          }
        }

        currentList.push(entCopy);
        ingestedEntityIds[cat].push(entCopy.id);
      }
    }

    // Remap relational cluster references across newly ingested entities and submaps
    remapEntityCluster(topo, topo.maps, entityIdMap, mapIdMap);

    // 5. Ingest Custom Modules
    const ingestedModuleIds = [];
    if (parsedPack.modules) {
      for (const modFile of Object.keys(parsedPack.modules)) {
        const rawMd = parsedPack.modules[modFile];
        const modIdMatch = rawMd.match(/^id:\s*["']?([^"'\r\n]+)["']?/m);
        const modId = modIdMatch ? modIdMatch[1].trim() : modFile.replace(/\.md$/, '');
        ingestedModuleIds.push(modId);

        const existingMod = topo.custom_modules.find((m) => m && m.id === modId);
        if (!existingMod) {
          topo.custom_modules.push({
            id: modId,
            filename: modFile,
            raw_markdown: rawMd,
            _packId: manifest.packId
          });
        }
      }
      if (typeof syncCustomModulesToCatalog === 'function') {
        try { syncCustomModulesToCatalog(); } catch (_) {}
      }
    }

    // 6. Provenance Ledger Record
    const ledgerEntry = {
      packId: manifest.packId,
      name: manifest.name,
      version: manifest.version || '1.0.0',
      installedAt: new Date().toISOString(),
      anchorNodeId: anchorNodeId,
      previousChildMapId: previousChildMapId,
      submapIds: Object.values(mapIdMap),
      entityIds: ingestedEntityIds,
      moduleIds: ingestedModuleIds
    };
    topo.installedPacks.push(ledgerEntry);

    // 7. Flush Persistence
    if (typeof saveActiveCampaign === 'function') {
      try { saveActiveCampaign(); } catch (_) {}
    }
    if (typeof updateBreadcrumbsHUD === 'function') {
      try { updateBreadcrumbsHUD(); } catch (_) {}
    }
    if (typeof renderEntityManagerTree === 'function') {
      try { renderEntityManagerTree(); } catch (_) {}
    }
    if (typeof drawCanvas === 'function') {
      try { drawCanvas(); } catch (_) {}
    }

    return ledgerEntry;
  }

  /**
   * Cleanly uninstall an installed pack from the campaign
   */
  async function uninstallPackFromCampaign(packId) {
    if (!Workstation || !Workstation.activeTopology) return false;
    const topo = Workstation.activeTopology;
    if (!Array.isArray(topo.installedPacks)) return false;

    const packIdx = topo.installedPacks.findIndex((p) => p && p.packId === packId);
    if (packIdx === -1) return false;
    const pack = topo.installedPacks[packIdx];

    // 0. Active Map Safety Guard: Switch away if currently viewing a pack submap
    const curActive = (typeof activeMapId !== 'undefined' && activeMapId) ? activeMapId : (topo.activeMapId || 'map_root');
    if (pack.submapIds && pack.submapIds.includes(curActive)) {
      const fallbackMap = 'map_root';
      if (typeof switchActiveMap === 'function') {
        try {
          await switchActiveMap(fallbackMap, true);
        } catch (_) {
          if (typeof activeMapId !== 'undefined') activeMapId = fallbackMap;
        }
      } else {
        if (typeof activeMapId !== 'undefined') activeMapId = fallbackMap;
        if (topo.activeMapId) topo.activeMapId = fallbackMap;
      }
    }

    // 1. Restore or Clear Portal Anchor Node childMapId
    if (pack.anchorNodeId !== null && pack.anchorNodeId !== undefined) {
      const activeNodes = (typeof nodes !== 'undefined' && Array.isArray(nodes)) ? nodes : (topo.nodes || []);
      const anchorNode = activeNodes.find((n) => n && n.id == pack.anchorNodeId);
      if (anchorNode && pack.submapIds.includes(anchorNode.childMapId)) {
        if (pack.previousChildMapId) {
          anchorNode.childMapId = pack.previousChildMapId;
        } else {
          delete anchorNode.childMapId;
        }
      }
    }

    // 2. Cascade Submaps Deletion and Purge from IndexedDB
    for (const submapId of (pack.submapIds || [])) {
      if (typeof maps !== 'undefined' && maps[submapId]) {
        delete maps[submapId];
      }
      if (topo.maps && topo.maps[submapId]) {
        delete topo.maps[submapId];
      }
      if (typeof deletePersistedMapFromDB === 'function') {
        try {
          await deletePersistedMapFromDB(submapId);
        } catch (_) {}
      }
    }

    // 3. Purge Entities
    if (pack.entityIds) {
      ['npcs', 'quests', 'items', 'trackers', 'tickets'].forEach((cat) => {
        const idsToRemove = new Set(pack.entityIds[cat] || []);
        if (Array.isArray(topo[cat])) {
          topo[cat] = topo[cat].filter((e) => e && !idsToRemove.has(e.id) && e._packId !== packId);
        }
      });
    }

    // 4. Purge Custom Modules and Slotted Bindings
    if (pack.moduleIds && Array.isArray(pack.moduleIds) && pack.moduleIds.length > 0) {
      const modIdsToRemove = new Set(pack.moduleIds);
      if (Array.isArray(topo.custom_modules)) {
        topo.custom_modules = topo.custom_modules.filter((m) => m && !modIdsToRemove.has(m.id) && m._packId !== packId);
      }
      if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
        for (let i = ALL_MODULES.length - 1; i >= 0; i--) {
          if (modIdsToRemove.has(ALL_MODULES[i].id)) {
            ALL_MODULES.splice(i, 1);
          }
        }
      }
      if (typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST)) {
        for (let i = MODULES_MANIFEST.length - 1; i >= 0; i--) {
          if (modIdsToRemove.has(MODULES_MANIFEST[i].id)) {
            MODULES_MANIFEST.splice(i, 1);
          }
        }
      }
      // Purge nodeSlottedModules
      if (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules) {
        Object.keys(nodeSlottedModules).forEach((nid) => {
          if (Array.isArray(nodeSlottedModules[nid])) {
            nodeSlottedModules[nid] = nodeSlottedModules[nid].filter((mId) => !modIdsToRemove.has(String(mId)));
          }
        });
      }
      // Purge edgeSlottedModules
      if (typeof edgeSlottedModules !== 'undefined' && edgeSlottedModules) {
        Object.keys(edgeSlottedModules).forEach((ek) => {
          if (modIdsToRemove.has(String(edgeSlottedModules[ek]))) {
            delete edgeSlottedModules[ek];
          }
        });
      }
      // Purge modules on nodes across maps
      if (typeof maps !== 'undefined' && maps) {
        Object.values(maps).forEach((m) => {
          if (m && m.nodes) {
            (Array.isArray(m.nodes) ? m.nodes : Object.values(m.nodes)).forEach((n) => {
              if (n && n.modules) n.modules = n.modules.filter((mId) => !modIdsToRemove.has(String(mId)));
            });
          }
          if (m && m.nodeSlottedModules) {
            Object.keys(m.nodeSlottedModules).forEach((nid) => {
              if (Array.isArray(m.nodeSlottedModules[nid])) {
                m.nodeSlottedModules[nid] = m.nodeSlottedModules[nid].filter((mId) => !modIdsToRemove.has(String(mId)));
              }
            });
          }
        });
      }
      if (typeof syncCustomModulesToCatalog === 'function') {
        try { syncCustomModulesToCatalog(topo); } catch (_) {}
      }
    }

    // 5. Remove Ledger Record
    topo.installedPacks.splice(packIdx, 1);

    // 6. Synchronize Persistence & Refresh Views
    if (typeof saveActiveCampaign === 'function') {
      try { saveActiveCampaign(); } catch (_) {}
    }
    if (typeof updateBreadcrumbsHUD === 'function') {
      try { updateBreadcrumbsHUD(); } catch (_) {}
    }
    if (typeof renderEntityManagerTree === 'function') {
      try { renderEntityManagerTree(); } catch (_) {}
    }
    if (typeof drawCanvas === 'function') {
      try { drawCanvas(); } catch (_) {}
    }

    return true;
  }

  /**
   * Build a .csmod ZIP archive buffer from campaign components
   */
  async function buildPackArchive(options = {}) {
    if (!window.ZeroCorsZip) {
      throw new Error('ZeroCorsZip engine not available');
    }
    const manifest = options.manifest || {
      formatVersion: '1.0.0',
      packId: options.packId || 'custom_pack_' + Date.now(),
      name: options.name || 'Custom Pack',
      entryMapId: options.entryMapId || 'map_root'
    };
    const validation = validatePackManifest(manifest);
    if (!validation.valid) {
      throw new Error('Invalid manifest: ' + validation.errors.join('; '));
    }

    const zip = new window.ZeroCorsZip();
    zip.addFile('pack.json', JSON.stringify(manifest, null, 2));

    // Add Submaps
    const submaps = options.maps || {};
    for (const mId of Object.keys(submaps)) {
      const mObj = JSON.parse(JSON.stringify(submaps[mId]));
      if (typeof stripMapImageDataUrl === 'function' && mObj.mapMetadata) {
        mObj.mapMetadata = stripMapImageDataUrl(mObj.mapMetadata);
      }
      zip.addFile(`maps/${mId}.json`, JSON.stringify(mObj, null, 2));
    }

    // Add Entities
    const entities = options.entities || { npcs: [], quests: [], items: [], trackers: [], tickets: [] };
    zip.addFile('entities.json', JSON.stringify(entities, null, 2));

    // Add Modules
    const modules = options.modules || {};
    for (const mFile of Object.keys(modules)) {
      zip.addFile(`modules/${mFile}`, modules[mFile]);
    }

    // Add Assets
    const assets = options.assets || {};
    for (const aFile of Object.keys(assets)) {
      zip.addFile(`assets/${aFile}`, assets[aFile]);
    }

    return zip.generateBlob();
  }

  /**
   * Win95 File Picker Trigger for Packs
   */
  function triggerInstallPackFile() {
    if (typeof document === 'undefined') return;
    const input = document.getElementById('pack-installer-file-input');
    if (input) {
      input.value = '';
      input.click();
    }
  }

  /**
   * File selection handler for #pack-installer-file-input
   */
  async function onPackFileSelected(event) {
    const file = event.target && event.target.files && event.target.files[0];
    if (!file) return;
    try {
      await packEngine.openInstallerDialog(file);
    } catch (err) {
      console.error('[PackEngine] Error opening installer dialog:', err);
      if (typeof alert === 'function') alert('Failed to load pack archive: ' + err.message);
    } finally {
      if (event.target) event.target.value = '';
    }
  }

  /**
   * Tab switcher for #modal-pack-installer dialog
   */
  function switchPackInstallerTab(tabName) {
    if (typeof document === 'undefined') return;
    const tabs = ['overview', 'anchor', 'conflicts'];
    for (const t of tabs) {
      const btn = document.getElementById(`btn-ptab-${t}`);
      const content = document.getElementById(`ptab-content-${t}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (content) content.classList.toggle('hidden', t !== tabName);
    }
  }

  /**
   * Populate #modal-pack-installer dialog with staged pack metadata & options
   */
  function populatePackInstallerModal(parsedPack) {
    if (typeof document === 'undefined') return;
    if (!parsedPack || !parsedPack.manifest) return;
    const manifest = parsedPack.manifest;
    const nameEl = document.getElementById('pack-preview-name');
    const metaEl = document.getElementById('pack-preview-meta');
    const descEl = document.getElementById('pack-preview-desc');
    const countsEl = document.getElementById('pack-preview-counts');
    const promptBox = document.getElementById('pack-preview-anchor-prompt');
    const promptText = document.getElementById('pack-preview-anchor-prompt-text');
    const statusEl = document.getElementById('pack-installer-status');

    if (nameEl) nameEl.textContent = manifest.name || manifest.packId;
    if (metaEl) metaEl.textContent = `Author: ${manifest.author || 'Unknown'} | Version: ${manifest.version || '1.0.0'} | Domain: ${manifest.ipDomain || 'Custom'}`;
    if (descEl) descEl.textContent = manifest.description || 'No description provided.';
    if (statusEl) statusEl.textContent = `Pack: ${manifest.packId} (${Object.keys(parsedPack.maps || {}).length} map(s))`;

    if (promptBox && promptText) {
      if (manifest.recommendedAnchor && manifest.recommendedAnchor.prompt) {
        promptText.textContent = manifest.recommendedAnchor.prompt;
        promptBox.style.display = 'block';
      } else {
        promptBox.style.display = 'none';
      }
    }

    if (countsEl) {
      const mapsCount = Object.keys(parsedPack.maps || {}).length;
      const npcsCount = (parsedPack.entities && parsedPack.entities.npcs || []).length;
      const questsCount = (parsedPack.entities && parsedPack.entities.quests || []).length;
      const itemsCount = (parsedPack.entities && parsedPack.entities.items || []).length;

      countsEl.innerHTML = `
        <div class="bevel-thin-inset" style="padding:6px; background:#f9f9f9; text-align:center;">
          <div style="font-size:16px; font-weight:bold; color:#000080;">${mapsCount}</div>
          <div style="font-size:10px; color:#555;">Submaps</div>
        </div>
        <div class="bevel-thin-inset" style="padding:6px; background:#f9f9f9; text-align:center;">
          <div style="font-size:16px; font-weight:bold; color:#000080;">${npcsCount}</div>
          <div style="font-size:10px; color:#555;">NPCs</div>
        </div>
        <div class="bevel-thin-inset" style="padding:6px; background:#f9f9f9; text-align:center;">
          <div style="font-size:16px; font-weight:bold; color:#000080;">${questsCount}</div>
          <div style="font-size:10px; color:#555;">Quests</div>
        </div>
        <div class="bevel-thin-inset" style="padding:6px; background:#f9f9f9; text-align:center;">
          <div style="font-size:16px; font-weight:bold; color:#000080;">${itemsCount}</div>
          <div style="font-size:10px; color:#555;">Items/Relics</div>
        </div>
      `;
    }

    // Populate Anchor Dropdown
    const selectEl = document.getElementById('pack-anchor-node-select');
    const warningEl = document.getElementById('pack-anchor-collision-warning');
    if (selectEl) {
      selectEl.innerHTML = '<option value="">[Do not link - Keep as independent submap]</option>';
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      const activeNodes = (typeof nodes !== 'undefined' && Array.isArray(nodes)) ? nodes : (topo && topo.nodes || []);

      for (const n of activeNodes) {
        if (!n) continue;
        const opt = document.createElement('option');
        opt.value = n.id;
        const portalText = n.childMapId ? ` (⚠️ Already linked: ${n.childMapId})` : '';
        opt.textContent = `Node #${n.id}: ${n.name || 'Unnamed'}${portalText}`;
        if (!opt.dataset) opt.dataset = {};
        opt.dataset.hasPortal = n.childMapId ? 'true' : 'false';
        selectEl.appendChild(opt);
      }

      selectEl.onchange = function() {
        const selected = selectEl.options[selectEl.selectedIndex];
        if (warningEl) {
          warningEl.style.display = (selected && selected.dataset.hasPortal === 'true') ? 'block' : 'none';
        }
      };
    }

    // Populate Entity Conflicts
    const conflictsList = document.getElementById('pack-conflicts-list');
    if (conflictsList) {
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      let conflictsCount = 0;
      let conflictsHtml = '';

      if (topo && parsedPack.entities) {
        for (const cat of ['npcs', 'quests', 'items']) {
          const incomingList = parsedPack.entities[cat] || [];
          const currentList = topo[cat] || [];
          for (const ent of incomingList) {
            const collision = currentList.find((e) => e && (e.id === ent.id || (e.name && e.name === ent.name)));
            if (collision) {
              conflictsCount++;
              conflictsHtml += `
                <div class="bevel-thin-inset" style="padding:6px; background:#fffbe8; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong>${cat.toUpperCase().slice(0, -1)}:</strong> ${ent.name || ent.id}
                    <div style="font-size:10px; color:#666;">Matches existing "${collision.name || collision.id}"</div>
                  </div>
                  <div style="display:flex; gap:8px; font-size:11px;">
                    <label><input type="radio" name="conflict_${ent.id}" value="clone" checked> Clone (Recommended)</label>
                    <label><input type="radio" name="conflict_${ent.id}" value="overwrite"> Overwrite</label>
                    <label><input type="radio" name="conflict_${ent.id}" value="skip"> Skip</label>
                  </div>
                </div>
              `;
            }
          }
        }
      }

      if (conflictsCount === 0) {
        conflictsList.innerHTML = '<div style="color:#666; font-style:italic; font-size:11px;">No naming collisions detected with active campaign roster.</div>';
      } else {
        conflictsList.innerHTML = conflictsHtml;
      }
    }

    switchPackInstallerTab('overview');
  }

  /**
   * Gather choices from dialog and execute pack installation
   */
  async function executePackInstallation() {
    if (typeof document === 'undefined') return;
    if (!packEngine.stagedPack) {
      if (typeof alert === 'function') alert('No pack currently staged for installation.');
      return;
    }

    const selectEl = document.getElementById('pack-anchor-node-select');
    const rawAnchor = selectEl ? selectEl.value : '';
    const anchorNodeId = rawAnchor !== '' ? (isNaN(Number(rawAnchor)) ? rawAnchor : Number(rawAnchor)) : null;

    // Collect conflict resolutions
    const conflictResolutions = {};
    const conflictInputs = document.querySelectorAll('input[type="radio"][name^="conflict_"]:checked');
    conflictInputs.forEach((input) => {
      const entityId = input.name.replace(/^conflict_/, '');
      conflictResolutions[entityId] = input.value;
    });

    try {
      const ledger = await packEngine.executeInstallFromDialog({
        anchorNodeId,
        conflictResolutions
      });

      if (typeof MDIWindowManager !== 'undefined' && typeof MDIWindowManager.close === 'function') {
        MDIWindowManager.close('modal-pack-installer');
      }

      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(`Pack installed successfully: "${ledger.name}" (${ledger.submapIds.length} submap(s)).`);
      }
    } catch (err) {
      console.error('[PackEngine] Installation failed:', err);
      if (typeof alert === 'function') alert('Failed to install pack: ' + err.message);
    }
  }

  /**
   * Deep Module UI Controller: Pack Engine State & Dialog Lifecycle
   */
  const packEngine = {
    stagedPack: null,
    stagedFile: null,

    async openInstallerDialog(arrayBufferOrFile) {
      let arrayBuffer = null;
      let fileName = 'pack.csmod';
      const isArrayBuffer = (typeof ArrayBuffer !== 'undefined' && arrayBufferOrFile instanceof ArrayBuffer) ||
                            (arrayBufferOrFile && typeof arrayBufferOrFile.byteLength === 'number' && typeof arrayBufferOrFile.slice === 'function');
      if (isArrayBuffer) {
        arrayBuffer = arrayBufferOrFile;
      } else if (typeof File !== 'undefined' && arrayBufferOrFile instanceof File) {
        fileName = arrayBufferOrFile.name;
        arrayBuffer = await arrayBufferOrFile.arrayBuffer();
      } else if (arrayBufferOrFile && typeof arrayBufferOrFile.arrayBuffer === 'function') {
        fileName = arrayBufferOrFile.name || fileName;
        arrayBuffer = await arrayBufferOrFile.arrayBuffer();
      } else {
        throw new Error('Invalid pack input: expected ArrayBuffer or File');
      }

      const parsed = await parsePackArchive(arrayBuffer);
      packEngine.stagedPack = parsed;
      packEngine.stagedFile = { name: fileName, size: arrayBuffer.byteLength };

      if (typeof populatePackInstallerModal === 'function') {
        populatePackInstallerModal(parsed);
      }
      if (typeof MDIWindowManager !== 'undefined' && typeof MDIWindowManager.open === 'function') {
        MDIWindowManager.open('modal-pack-installer');
      }
      return parsed;
    },

    async executeInstallFromDialog(config = {}) {
      if (!packEngine.stagedPack) {
        throw new Error('No pack currently staged for installation');
      }
      const result = await installPackIntoCampaign(packEngine.stagedPack, config);
      packEngine.stagedPack = null;
      packEngine.stagedFile = null;
      return result;
    },

    renderInstalledPacksView(containerEl) {
      if (!containerEl) return;
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology)
        ? Workstation.activeTopology
        : (typeof activeTopology !== 'undefined' ? activeTopology : null);
      const packs = (topo && Array.isArray(topo.installedPacks)) ? topo.installedPacks : [];

      if (packs.length === 0) {
        containerEl.innerHTML = '<div style="padding:12px; color:#666; font-style:italic; text-align:center;">No modular entity packs installed in this campaign.</div>';
        return;
      }

      const escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

      let html = '<table class="win95-table" style="width:100%; border-collapse:collapse; font-size:11px;">';
      html += '<thead><tr style="background:#e0e0e0; text-align:left;">';
      html += '<th style="border:1px solid #999; padding:4px;">Pack Name</th>';
      html += '<th style="border:1px solid #999; padding:4px;">Version</th>';
      html += '<th style="border:1px solid #999; padding:4px;">Installed</th>';
      html += '<th style="border:1px solid #999; padding:4px;">Anchor Node</th>';
      html += '<th style="border:1px solid #999; padding:4px;">Submaps</th>';
      html += '<th style="border:1px solid #999; padding:4px; text-align:center;">Action</th>';
      html += '</tr></thead><tbody>';

      for (const p of packs) {
        const pId = p.packId || 'unknown';
        const pName = p.name || pId;
        const pVer = p.version || '1.0.0';
        const pDate = p.installedAt ? new Date(p.installedAt).toLocaleDateString() : 'N/A';
        const pAnchor = p.anchorNodeId !== null && p.anchorNodeId !== undefined ? `Node #${p.anchorNodeId}` : 'Independent';
        const pSubmaps = (p.submapIds || []).length;

        html += '<tr>';
        html += `<td style="border:1px solid #ccc; padding:4px; font-weight:bold;">${escapeHtml(pName)}</td>`;
        html += `<td style="border:1px solid #ccc; padding:4px;">${escapeHtml(pVer)}</td>`;
        html += `<td style="border:1px solid #ccc; padding:4px;">${escapeHtml(pDate)}</td>`;
        html += `<td style="border:1px solid #ccc; padding:4px;">${escapeHtml(pAnchor)}</td>`;
        html += `<td style="border:1px solid #ccc; padding:4px;">${pSubmaps}</td>`;
        html += `<td style="border:1px solid #ccc; padding:4px; text-align:center;">`;
        html += `<button class="win-btn" onclick="packEngine.requestPackUninstall('${escapeHtml(pId)}')">Uninstall...</button>`;
        html += `</td></tr>`;
      }
      html += '</tbody></table>';
      containerEl.innerHTML = html;
    },

    async requestPackUninstall(packId) {
      if (!packId) return false;
      if (typeof confirm === 'function') {
        const ok = confirm('Uninstalling this pack will remove its submaps and unstationed characters. Proceed?');
        if (!ok) return false;
      }
      const success = await uninstallPackFromCampaign(packId);
      if (success) {
        const container = document.getElementById('installed-packs-container');
        if (container) packEngine.renderInstalledPacksView(container);
      }
      return success;
    }
  };

  // Export on window for modular script execution
  window.validatePackManifest = validatePackManifest;
  window.parsePackArchive = parsePackArchive;
  window.installPackIntoCampaign = installPackIntoCampaign;
  window.uninstallPackFromCampaign = uninstallPackFromCampaign;
  window.buildPackArchive = buildPackArchive;
  window.dataUrlToUint8Array = dataUrlToUint8Array;
  window.remapEntityCluster = remapEntityCluster;
  window.packEngine = packEngine;
  window.triggerInstallPackFile = triggerInstallPackFile;
  window.onPackFileSelected = onPackFileSelected;
  window.switchPackInstallerTab = switchPackInstallerTab;
  window.populatePackInstallerModal = populatePackInstallerModal;
  window.executePackInstallation = executePackInstallation;
})();
