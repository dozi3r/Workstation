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
    if (anchorNodeId !== null) {
      const activeNodes = (typeof nodes !== 'undefined' && Array.isArray(nodes)) ? nodes : (topo.nodes || []);
      const anchorNode = activeNodes.find((n) => n && n.id == anchorNodeId);
      if (anchorNode) {
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
            entCopy.id = `${entCopy.id}_${manifest.packId}_${Date.now()}`;
            entCopy.name = `${entCopy.name} (${manifest.name})`;
          }
        }

        currentList.push(entCopy);
        ingestedEntityIds[cat].push(entCopy.id);
      }
    }

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

    // 1. Clear Portal Anchor Node childMapId
    if (pack.anchorNodeId !== null && pack.anchorNodeId !== undefined) {
      const activeNodes = (typeof nodes !== 'undefined' && Array.isArray(nodes)) ? nodes : (topo.nodes || []);
      const anchorNode = activeNodes.find((n) => n && n.id == pack.anchorNodeId);
      if (anchorNode && pack.submapIds.includes(anchorNode.childMapId)) {
        delete anchorNode.childMapId;
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

    // 4. Purge Custom Modules
    if (pack.moduleIds && Array.isArray(topo.custom_modules)) {
      const modIdsToRemove = new Set(pack.moduleIds);
      topo.custom_modules = topo.custom_modules.filter((m) => m && !modIdsToRemove.has(m.id) && m._packId !== packId);
      if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
        for (let i = ALL_MODULES.length - 1; i >= 0; i--) {
          if (modIdsToRemove.has(ALL_MODULES[i].id)) {
            ALL_MODULES.splice(i, 1);
          }
        }
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

  // Export on window for modular script execution
  window.validatePackManifest = validatePackManifest;
  window.parsePackArchive = parsePackArchive;
  window.installPackIntoCampaign = installPackIntoCampaign;
  window.uninstallPackFromCampaign = uninstallPackFromCampaign;
  window.buildPackArchive = buildPackArchive;
})();
