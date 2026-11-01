// ============================================================================
// CREATOR STUDIO: MULTI-MAP STORE & INDEXEDDB PERSISTENCE (ZERO-CORS OFFLINE)
// ============================================================================
// Supports multi-map asset persistence, scale-fluid cartography, and quota protection.

const MAP_DB_NAME = "CreatorStudioMapDB";
const MAP_STORE_NAME = "active_map";
let activeMapMetadata = null;

function openMapDatabase() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      console.warn("[MapStore] IndexedDB not supported; using fallback memory store.");
      return resolve(null);
    }
    const req = indexedDB.open(MAP_DB_NAME, 4);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(MAP_STORE_NAME)) {
        db.createObjectStore(MAP_STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("project_handle")) {
        db.createObjectStore("project_handle", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("campaign_library")) {
        db.createObjectStore("campaign_library", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      console.warn("[MapStore] IndexedDB open error:", req.error);
      resolve(null);
    };
  });
}

/**
 * Persist map background image to IndexedDB keyed by mapId
 */
async function saveMapImageToDB(name, dataUrl, width, height, opacity = 0.85, mapId = null) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  const db = await openMapDatabase();
  const record = {
    id: targetId,
    name: name || "Custom Campaign Map",
    dataUrl: dataUrl,
    width: width || 1920,
    height: height || 1080,
    opacity: opacity,
    timestamp: Date.now()
  };

  if (!mapId || (typeof activeMapId !== "undefined" && mapId === activeMapId)) {
    activeMapMetadata = record;
  }

  if (db) {
    try {
      const tx = db.transaction(MAP_STORE_NAME, "readwrite");
      const store = tx.objectStore(MAP_STORE_NAME);
      store.put(record);
      if (targetId === "map_root" || targetId === "active_map") {
        store.put({ ...record, id: "active_map" });
      }
      tx.oncomplete = () => console.log(`[MapStore] Saved map image for "${targetId}" to IndexedDB:`, name);
    } catch (e) {
      console.warn("[MapStore] Error writing to IndexedDB:", e);
    }
  }

  try {
    const metaListStr = localStorage.getItem("cs_maps_meta_catalog") || "{}";
    const metaList = JSON.parse(metaListStr);
    metaList[targetId] = {
      name: record.name,
      width: record.width,
      height: record.height,
      opacity: record.opacity,
      timestamp: record.timestamp
    };
    localStorage.setItem("cs_maps_meta_catalog", JSON.stringify(metaList));
    if (targetId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root")) {
      localStorage.setItem("cs_active_map_meta", JSON.stringify(metaList[targetId]));
    }
  } catch(e) {}

  return record;
}

/**
 * Load persisted map background for a given mapId
 */
async function loadPersistedMapFromDB(mapId = null) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  const db = await openMapDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(MAP_STORE_NAME, "readonly");
      const store = tx.objectStore(MAP_STORE_NAME);
      const req = store.get(targetId);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else if (targetId === "map_root" || targetId === "active_map" || !mapId) {
          const fallbackReq = store.get("active_map");
          fallbackReq.onsuccess = () => resolve(fallbackReq.result || null);
          fallbackReq.onerror = () => resolve(null);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Delete persisted map background from DB
 */
async function deletePersistedMapFromDB(mapId = null) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  if (!targetId) return;
  const db = await openMapDatabase();
  if (db) {
    try {
      const tx = db.transaction(MAP_STORE_NAME, "readwrite");
      const store = tx.objectStore(MAP_STORE_NAME);
      store.delete(targetId);
      if (targetId === "map_root") store.delete("active_map");
    } catch(e) {}
  }

  try {
    const metaListStr = localStorage.getItem("cs_maps_meta_catalog") || "{}";
    const metaList = JSON.parse(metaListStr);
    delete metaList[targetId];
    localStorage.setItem("cs_maps_meta_catalog", JSON.stringify(metaList));
    if (targetId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root")) {
      localStorage.removeItem("cs_active_map_meta");
    }
  } catch(e) {}
}

/**
 * Fully clear the active_map store in IndexedDB on campaign switch/unload.
 * Returns a Promise that resolves when the IndexedDB transaction completes.
 */
function clearActiveMapImageStore() {
  return new Promise((resolve) => {
    openMapDatabase().then((db) => {
      if (!db) {
        return resolve(false);
      }
      try {
        const tx = db.transaction(MAP_STORE_NAME, "readwrite");
        const store = tx.objectStore(MAP_STORE_NAME);
        store.clear();
        tx.oncomplete = () => {
          console.log("[MapStore] Successfully cleared active_map store in IndexedDB.");
          resolve(true);
        };
        tx.onerror = (err) => {
          console.warn("[MapStore] Transaction error clearing active_map store:", err);
          resolve(false);
        };
        tx.onabort = () => resolve(false);
      } catch (e) {
        console.warn("[MapStore] Exception clearing active_map store:", e);
        resolve(false);
      }
    }).catch(() => resolve(false));
  });
}
window.clearActiveMapImageStore = clearActiveMapImageStore;

/**
 * Retrieve list of all cached map metadata records
 */
async function listPersistedMapsFromDB() {
  const db = await openMapDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(MAP_STORE_NAME, "readonly");
      const store = tx.objectStore(MAP_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result || [])
          .filter(r => r.id !== "active_map")
          .map(r => ({
            id: r.id,
            name: r.name,
            width: r.width,
            height: r.height,
            opacity: r.opacity,
            timestamp: r.timestamp
          }));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch(e) {
      resolve([]);
    }
  });
}

/**
 * Ingestion Handler for File Input & Drag-and-Drop
 */
function handleMapFileIngestion(file, targetMapId = null) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Please select a valid image file (PNG, JPG, WebP, SVG).");
    return;
  }

  const mapScope = targetMapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const img = new Image();
    img.onload = async () => {
      const w = img.naturalWidth || 1920;
      const h = img.naturalHeight || 1080;
      const ext = getImageExtensionFromDataUrl(dataUrl);
      const assetPath = `assets/${mapScope}_bg.${ext}`;
      const record = await saveMapImageToDB(file.name, dataUrl, w, h, 0.85, mapScope);
      record.assetPath = assetPath;
      
      if (typeof maps !== "undefined" && maps[mapScope]) {
        const stripped = (typeof stripMapImageDataUrl === "function")
          ? stripMapImageDataUrl(record)
          : {
              name: record.name,
              width: record.width,
              height: record.height,
              opacity: record.opacity
            };
        stripped.assetPath = assetPath;
        maps[mapScope].mapMetadata = stripped;
      }

      if (mapScope === (typeof activeMapId !== "undefined" ? activeMapId : "map_root")) {
        applyMapImageToCanvas(record.dataUrl, record.width, record.height, record.opacity, true);
        if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
      }
      if (typeof saveActiveCampaign === "function") {
        saveActiveCampaign();
      }
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

function applyMapImageToCanvas(dataUrl, width, height, opacity = 0.85, autoFit = false) {
  const bgImg = document.getElementById("canvas-bg-image");
  if (!bgImg) return;

  if (dataUrl) {
    bgImg.setAttribute("href", dataUrl);
    bgImg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", dataUrl);
    bgImg.setAttribute("width", width);
    bgImg.setAttribute("height", height);
    bgImg.setAttribute("opacity", opacity);
    bgImg.style.display = "block";
    bgImg.style.pointerEvents = "none";
  } else {
    bgImg.setAttribute("href", "");
    if (typeof bgImg.setAttributeNS === "function") bgImg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "");
    if (typeof bgImg.removeAttribute === "function") bgImg.removeAttribute("href");
    if (typeof bgImg.removeAttributeNS === "function") {
      bgImg.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
      bgImg.removeAttributeNS("http://www.w3.org/1999/xlink", "xlink:href");
    }
    bgImg.style.display = "none";
  }
}

function updateMapOpacity(val) {
  const num = Math.max(0, Math.min(100, parseInt(val) || 85)) / 100;
  const bgImg = document.getElementById("canvas-bg-image");
  if (bgImg) bgImg.setAttribute("opacity", num);

  if (activeMapMetadata) {
    activeMapMetadata.opacity = num;
    saveMapImageToDB(activeMapMetadata.name, activeMapMetadata.dataUrl, activeMapMetadata.width, activeMapMetadata.height, num);
  }
  if (typeof maps !== "undefined" && typeof activeMapId !== "undefined" && maps[activeMapId] && maps[activeMapId].mapMetadata) {
    maps[activeMapId].mapMetadata.opacity = num;
  }
}

async function clearLoadedMap() {
  if (confirm("Remove active map image and revert to tactical CAD grid?")) {
    const curMapId = (typeof activeMapId !== "undefined" && activeMapId) ? activeMapId : "map_root";
    if (typeof deletePersistedMapFromDB === "function") {
      try {
        await deletePersistedMapFromDB(curMapId);
      } catch (e) {
        console.warn("[MapStore] Error deleting persisted map on clear:", e);
      }
    }
    activeMapMetadata = null;
    if (typeof maps !== "undefined" && maps[curMapId]) {
      maps[curMapId].mapMetadata = null;
    }
    if (typeof Workstation !== "undefined" && Workstation.activeTopology) {
      Workstation.activeTopology.mapMetadata = null;
      if (Workstation.activeTopology.maps && Workstation.activeTopology.maps[curMapId]) {
        Workstation.activeTopology.maps[curMapId].mapMetadata = null;
      }
    }
    applyMapImageToCanvas(null, 1000, 700);
    if (typeof updateBreadcrumbsHUD === "function") updateBreadcrumbsHUD();
    if (typeof pushHistoryState === "function") pushHistoryState("Clear Map Background");
    if (typeof saveActiveCampaign === "function") {
      saveActiveCampaign();
    }
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Removed background image from "${(typeof maps !== "undefined" && maps[curMapId] && maps[curMapId].name) || curMapId}".`);
    }
  }
}

// ============================================================================
// PROJECT DIRECTORY BINDING (FILE SYSTEM ACCESS API) & DUAL-MODE EXPORTS
// ============================================================================

window.activeProjectDirectoryHandle = null;
window.activeProjectDirectoryName = "";

function dataUrlToUint8Array(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) return null;
  const base64 = dataUrl.slice(commaIdx + 1);
  const binaryStr = (typeof atob === "function") ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

function getImageExtensionFromDataUrl(dataUrl) {
  if (!dataUrl) return "png";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "jpg";
  if (dataUrl.startsWith("data:image/webp")) return "webp";
  if (dataUrl.startsWith("data:image/svg+xml")) return "svg";
  return "png";
}

/**
 * Asynchronously read a Blob or File into a base64 data URL
 */
function blobToDataUrl(blob) {
  if (!blob) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      if (typeof FileReader !== "undefined") {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      } else if (typeof blob.arrayBuffer === "function") {
        blob.arrayBuffer().then(buf => {
          let base64 = "";
          if (typeof Buffer !== "undefined") {
            base64 = Buffer.from(buf).toString("base64");
          } else if (typeof btoa === "function") {
            const bytes = new Uint8Array(buf);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            base64 = btoa(binary);
          }
          const mime = blob.type || "image/png";
          resolve(base64 ? `data:${mime};base64,${base64}` : null);
        }).catch(() => resolve(null));
      } else {
        resolve(null);
      }
    } catch (_) {
      resolve(null);
    }
  });
}
window.blobToDataUrl = blobToDataUrl;

// ----------------------------------------------------------------------------
// DIRECT DISK SYNC: USB-PORTABLE PROJECT FOLDER BINDING
// ----------------------------------------------------------------------------
// The bound Project Directory is the authoritative home of the open campaign.
// Every edit is debounced and streamed to it as the exact file set produced by
// "Export Campaign Package (.zip)" (see buildCampaignPackageFiles). Browser
// storage is only a crash/session cache.
//
// Cross-PC safety: every disk write stamps campaign.json with a random
// `syncToken`; this browser remembers the last token it wrote/read
// (CS_SYNC_TOKEN_KEY) and whether it has edits not yet on disk (CS_DIRTY_KEY).
// On reconnect, a token mismatch means the folder was changed elsewhere
// (e.g. on another PC via USB), so the folder version is loaded instead of
// being overwritten with this browser's stale session.

const CS_SYNC_TOKEN_KEY = "cs_project_sync_token";
const CS_DIRTY_KEY = "cs_project_dirty";
const CS_DISK_SYNC_DEBOUNCE_MS = 700;

window.pendingProjectDirectoryHandle = null; // stored handle awaiting a user gesture to re-grant permission
window.projectDirectoryWriteCache = new Map(); // relPath -> content signature already on disk
window.projectDirectorySyncState = "none";     // none | reconnect | pending | saving | synced | error

function slugifyCampaignName(name) {
  return String(name || "campaign").toLowerCase().replace(/[^a-z0-9_]/g, "_") || "campaign";
}

function generateSyncToken() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

function isProjectDirectoryDirty() {
  try { return localStorage.getItem(CS_DIRTY_KEY) === "1"; } catch(e) { return false; }
}

function setProjectDirectoryDirty(isDirty) {
  try {
    if (isDirty) localStorage.setItem(CS_DIRTY_KEY, "1");
    else localStorage.removeItem(CS_DIRTY_KEY);
  } catch(e) {}
}
window.setProjectDirectoryDirty = setProjectDirectoryDirty;
window.isProjectDirectoryDirty = isProjectDirectoryDirty;

/**
 * Update the status-bar disk indicator (#sb-disk).
 */
function updateDiskSyncIndicator(state, detail) {
  if (state) window.projectDirectorySyncState = state;
  const el = (typeof document !== "undefined" && document.getElementById) ? document.getElementById("sb-disk") : null;
  if (!el) return;
  const s = window.projectDirectorySyncState;
  const boundName = window.activeProjectDirectoryName || "";
  const pendingName = (window.pendingProjectDirectoryHandle && window.pendingProjectDirectoryHandle.name) || "";
  let text = "Storage: Browser-Only";
  let title = "Campaign is only in browser storage. Click to save or link a folder on disk / USB to safeguard artwork.";
  let color = "#64748b";
  if (s === "reconnect") {
    text = `⚠ Reconnect "${pendingName}"`;
    title = `Click to re-grant access to folder "${pendingName}" and resume saving to disk.`;
    color = "#b45309";
  } else if (s === "pending") {
    text = `💾 ${boundName} •`;
    title = `Unsaved changes queued for folder "${boundName}".`;
    color = "#1d4ed8";
  } else if (s === "saving") {
    text = `💾 ${boundName} saving…`;
    title = `Writing campaign files to "${boundName}"...`;
    color = "#1d4ed8";
  } else if (s === "synced") {
    text = `💾 ${boundName} ✓`;
    title = `All changes saved to folder "${boundName}"${detail ? " — " + detail : ""}.`;
    color = "#047857";
  } else if (s === "error") {
    text = `⚠ ${boundName || pendingName} write failed`;
    title = `Saving to disk failed${detail ? ": " + detail : ""}. Click to retry.`;
    color = "#b91c1c";
  }
  el.textContent = text;
  el.title = title;
  el.style.color = color;
}
window.updateDiskSyncIndicator = updateDiskSyncIndicator;

/**
 * Status-bar indicator click: reconnect, retry, or start disk saving.
 */
async function onDiskSyncIndicatorClick() {
  const s = window.projectDirectorySyncState;
  if (s === "reconnect" && window.pendingProjectDirectoryHandle) {
    await reconnectProjectDirectory(window.pendingProjectDirectoryHandle, { interactive: true });
  } else if (window.activeProjectDirectoryHandle) {
    await flushProjectDirectoryNow({ interactive: true });
  } else if (typeof openSaveAsNewCampaignModal === "function") {
    openSaveAsNewCampaignModal();
  } else {
    await setProjectDirectory();
  }
}
window.onDiskSyncIndicatorClick = onDiskSyncIndicatorClick;

/**
 * Check (and optionally request, which needs a user gesture) readwrite permission.
 */
async function ensureDirWritePermission(handle, interactive = false) {
  if (!handle) return false;
  try {
    if (typeof handle.queryPermission !== "function") return true; // non-standard / test handles
    let p = await handle.queryPermission({ mode: "readwrite" });
    if (p === "granted") return true;
    if (!interactive || typeof handle.requestPermission !== "function") return false;
    p = await handle.requestPermission({ mode: "readwrite" });
    return p === "granted";
  } catch(e) {
    console.warn("[ProjectDirectory] Permission check failed:", e);
    return false;
  }
}
window.ensureDirWritePermission = ensureDirWritePermission;

async function readStoredProjectHandleRecord() {
  const db = await openMapDatabase();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction("project_handle", "readonly");
      const req = tx.objectStore("project_handle").get("active_dir");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch(e) {
      resolve(null);
    }
  });
}

async function persistProjectDirectoryHandle(handle) {
  const db = await openMapDatabase();
  if (db) {
    try {
      const tx = db.transaction("project_handle", "readwrite");
      const store = tx.objectStore("project_handle");
      if (handle) store.put({ id: "active_dir", handle: handle, name: handle.name });
      else store.delete("active_dir");
    } catch(e) {}
  }
  try {
    if (handle) localStorage.setItem("cs_project_dir_name", handle.name);
    else localStorage.removeItem("cs_project_dir_name");
  } catch(e) {}
}

/**
 * Make `handle` the authoritative campaign folder (persisted across reloads).
 */
async function bindProjectDirectory(handle, opts = {}) {
  if (!handle) return;
  if (window.activeProjectDirectoryHandle !== handle) {
    window.projectDirectoryWriteCache = new Map();
  }
  window.activeProjectDirectoryHandle = handle;
  window.activeProjectDirectoryName = handle.name;
  window.pendingProjectDirectoryHandle = null;
  if (opts.syncToken !== undefined) {
    try { localStorage.setItem(CS_SYNC_TOKEN_KEY, opts.syncToken || ""); } catch(e) {}
  }
  await persistProjectDirectoryHandle(handle);
  updateDiskSyncIndicator(isProjectDirectoryDirty() ? "pending" : "synced");
}
window.bindProjectDirectory = bindProjectDirectory;

/**
 * Detach the current campaign from any folder (e.g. when a different campaign is loaded),
 * so the next autosave can never overwrite the previous campaign's folder.
 */
async function unbindProjectDirectory() {
  if (_diskSyncTimer) { clearTimeout(_diskSyncTimer); _diskSyncTimer = null; }
  const hadFolder = !!(window.activeProjectDirectoryHandle || window.pendingProjectDirectoryHandle);
  window.activeProjectDirectoryHandle = null;
  window.activeProjectDirectoryName = "";
  window.pendingProjectDirectoryHandle = null;
  window.projectDirectoryWriteCache = new Map();
  try { localStorage.removeItem(CS_SYNC_TOKEN_KEY); } catch(e) {}
  setProjectDirectoryDirty(false);
  if (hadFolder) await persistProjectDirectoryHandle(null);
  updateDiskSyncIndicator("none");
}
window.unbindProjectDirectory = unbindProjectDirectory;

/**
 * Read campaign.json from a folder (null if the folder is not a campaign package).
 */
async function readCampaignJsonFromDir(dirHandle) {
  if (!dirHandle) return null;
  try {
    const fh = await dirHandle.getFileHandle("campaign.json", { create: false });
    return JSON.parse(await (await fh.getFile()).text());
  } catch(e) {
    return null;
  }
}

async function dirLooksLikeCampaign(dirHandle) {
  for (const f of ["campaign.json", "topology.json", "preset.json"]) {
    try { await dirHandle.getFileHandle(f, { create: false }); return true; } catch(e) {}
  }
  return false;
}

async function dirIsEmpty(dirHandle) {
  try {
    if (typeof dirHandle.keys === "function") {
      for await (const _k of dirHandle.keys()) return false;
      return true;
    }
    if (typeof dirHandle.entries === "function") {
      for await (const _e of dirHandle.entries()) return false;
      return true;
    }
  } catch(e) {}
  return false;
}

/**
 * Normalizes any selected directory handle (USB root, /Documents, Workstation root,
 * /campaigns, or a direct campaign folder) into a guaranteed .../campaigns/<slug>/ structure
 * so campaign entities are never written loose into root or /campaigns.
 */
async function resolveCampaignWorkspaceHierarchy(pickedHandle, targetCampaignSlug = "") {
  if (!pickedHandle) return null;
  const cleanSlug = targetCampaignSlug ? slugifyCampaignName(targetCampaignSlug) : "";

  // 1. Direct campaign folder (already contains campaign.json / topology.json / preset.json)
  if (await dirLooksLikeCampaign(pickedHandle)) {
    return {
      campaignsRootHandle: null,
      activeCampaignHandle: pickedHandle,
      existing: (await readCampaignJsonFromDir(pickedHandle)) || {},
      mode: "direct_campaign"
    };
  }

  // 2. Empty folder already named after the target campaign slug
  const pickedSlug = slugifyCampaignName(pickedHandle.name || "");
  if (cleanSlug && pickedSlug === cleanSlug && (await dirIsEmpty(pickedHandle))) {
    return {
      campaignsRootHandle: null,
      activeCampaignHandle: pickedHandle,
      existing: null,
      mode: "direct_campaign"
    };
  }

  // 3. Dedicated "campaigns" directory
  if ((pickedHandle.name || "").toLowerCase() === "campaigns") {
    if (typeof setCampaignsFolderHandle === "function") {
      try { await setCampaignsFolderHandle(pickedHandle); } catch(_) {}
    }
    let sub = null;
    let existing = null;
    if (cleanSlug) {
      // Prefer existing matching folder (e.g. "Emerald Isle" vs "emerald_isle") before creating
      if (typeof pickedHandle.entries === "function") {
        try {
          for await (const [entryName, entryHandle] of pickedHandle.entries()) {
            if (entryHandle.kind === "directory" && slugifyCampaignName(entryName) === cleanSlug) {
              sub = entryHandle;
              break;
            }
          }
        } catch(_) {}
      }
      if (!sub) {
        sub = await pickedHandle.getDirectoryHandle(cleanSlug, { create: true });
      }
      existing = await readCampaignJsonFromDir(sub);
    }
    return {
      campaignsRootHandle: pickedHandle,
      activeCampaignHandle: sub,
      existing: existing,
      mode: "campaigns_root"
    };
  }

  // 4. Parent container (Workspace root with start.html, USB root, or /Documents):
  // Ensure a "campaigns" subfolder exists inside it, then place the campaign in campaigns/<slug>/
  let subCampaigns = null;
  try {
    subCampaigns = await pickedHandle.getDirectoryHandle("campaigns", { create: false });
  } catch(_) {}
  if (!subCampaigns) {
    subCampaigns = await pickedHandle.getDirectoryHandle("campaigns", { create: true });
  }
  if (subCampaigns && typeof setCampaignsFolderHandle === "function") {
    try { await setCampaignsFolderHandle(subCampaigns); } catch(_) {}
  }

  let subCamp = null;
  let existing = null;
  if (cleanSlug && subCampaigns) {
    if (typeof subCampaigns.entries === "function") {
      try {
        for await (const [entryName, entryHandle] of subCampaigns.entries()) {
          if (entryHandle.kind === "directory" && slugifyCampaignName(entryName) === cleanSlug) {
            subCamp = entryHandle;
            break;
          }
        }
      } catch(_) {}
    }
    if (!subCamp) {
      subCamp = await subCampaigns.getDirectoryHandle(cleanSlug, { create: true });
    }
    existing = await readCampaignJsonFromDir(subCamp);
  }

  return {
    campaignsRootHandle: subCampaigns,
    activeCampaignHandle: subCamp,
    parentRootHandle: pickedHandle,
    existing: existing,
    mode: "parent_container"
  };
}
window.resolveCampaignWorkspaceHierarchy = resolveCampaignWorkspaceHierarchy;

/**
 * Resolve where campaign files should go when the user picks a folder.
 * Enforces that picking a USB root, /Documents, workspace root, or /campaigns folder
 * always places campaign files inside a dedicated `.../campaigns/<slug>/` subfolder.
 * Returns { handle, existing, campaignsRootHandle, mode } or null if cancelled.
 */
async function resolveCampaignTargetFolder(pickedHandle, slug) {
  if (!pickedHandle) return null;
  const hierarchy = await resolveCampaignWorkspaceHierarchy(pickedHandle, slug || "campaign");
  if (!hierarchy || !hierarchy.activeCampaignHandle) return null;
  return {
    handle: hierarchy.activeCampaignHandle,
    campaignsRootHandle: hierarchy.campaignsRootHandle || null,
    existing: hierarchy.existing || null,
    mode: hierarchy.mode
  };
}

async function pickReadWriteDirectory(pickerOpts = {}) {
  if (!window.showDirectoryPicker) {
    alert("Saving directly to a folder requires a Chromium browser (Chrome, Edge, Opera).\n\nIn this browser use 'Export Campaign Package (.zip)' instead.");
    return null;
  }
  try {
    const opts = { mode: "readwrite", id: pickerOpts.id || "cs-workspace-root" };
    if (pickerOpts.startIn) {
      opts.startIn = pickerOpts.startIn;
    } else if (window.campaignsRootDirectoryHandle) {
      opts.startIn = window.campaignsRootDirectoryHandle;
    } else if (window.activeProjectDirectoryHandle) {
      opts.startIn = window.activeProjectDirectoryHandle;
    }
    let h;
    try { h = await window.showDirectoryPicker(opts); }
    catch(e) { if (e && e.name === "AbortError") throw e; h = await window.showDirectoryPicker({ mode: "readwrite" }); }
    if (!h) return null;
    if (!(await ensureDirWritePermission(h, true))) {
      alert("Write permission to the selected folder was not granted.");
      return null;
    }
    return h;
  } catch(err) {
    if (err && err.name !== "AbortError") {
      console.warn("[ProjectDirectory] Folder picker failed:", err);
      alert("Could not open folder: " + err.message);
    }
    return null;
  }
}

/**
 * File -> Set Project Directory (Direct Disk Sync)
 * Binds a folder so every change is saved into it. If the folder already holds a
 * campaign, offers to OPEN it (the normal case when moving between PCs) rather than
 * silently overwriting it with this browser's session.
 */
async function setProjectDirectory() {
  if (typeof closeAllMenus === "function") closeAllMenus();
  const picked = await pickReadWriteDirectory();
  if (!picked) return;
  try {
    const curName = (typeof currentCampaignName !== "undefined" && currentCampaignName)
      || (window.Workstation && window.Workstation.activeTopology && window.Workstation.activeTopology.name) || "campaign";
    const target = await resolveCampaignTargetFolder(picked, slugifyCampaignName(curName));
    if (!target) return;

    if (target.existing) {
      const existingName = target.existing.name || target.existing.campaignName || target.handle.name;
      const stamp = target.existing.updatedAt || target.existing.exportedAt;
      const openIt = confirm(
        `Folder "${target.handle.name}" already contains campaign "${existingName}"` +
        (stamp ? ` (last saved ${new Date(stamp).toLocaleString()})` : "") + `.\n\n` +
        `OK = Open that campaign from the folder and keep it synced\n` +
        `Cancel = Choose whether to overwrite it with the campaign open now ("${curName}")`
      );
      if (openIt) {
        await loadCampaignFromDirectoryHandle(target.handle);
        return;
      }
      if (!confirm(`Overwrite the campaign files in "${target.handle.name}" with "${curName}"?\n\nThis replaces campaign.json, topology.json, preset.json and map images in that folder.`)) {
        return;
      }
    }

    await bindProjectDirectory(target.handle);
    setProjectDirectoryDirty(true);
    const ok = await flushProjectDirectoryNow({ interactive: true });
    if (ok && typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Direct disk sync ON: every change now saves to folder "${target.handle.name}".`);
    }
    if (typeof refreshCampaignsManager === "function") refreshCampaignsManager(false);
  } catch(err) {
    console.warn("[ProjectDirectory] Failed to bind directory:", err);
    alert("Could not bind Project Directory: " + err.message);
  }
}

/**
 * File -> Open Campaign Folder (Disk / USB)...
 */
async function openCampaignFolder() {
  if (typeof closeAllMenus === "function") closeAllMenus();
  const picked = await pickReadWriteDirectory();
  if (!picked) return;
  if (!(await dirLooksLikeCampaign(picked))) {
    alert(`"${picked.name}" does not contain campaign.json / topology.json.\n\nPick a campaign folder (for example campaigns/Emerald Isle), or use File -> Save As New Campaign to create one.`);
    return;
  }
  await loadCampaignFromDirectoryHandle(picked);
}
window.openCampaignFolder = openCampaignFolder;

/**
 * Re-attach a stored/pending folder handle after a reload or on another session.
 * Loads the folder version if it was changed elsewhere; otherwise resumes syncing.
 */
async function reconnectProjectDirectory(handle, opts = {}) {
  if (!handle) return false;
  const granted = await ensureDirWritePermission(handle, !!opts.interactive);
  if (!granted) {
    window.pendingProjectDirectoryHandle = handle;
    updateDiskSyncIndicator("reconnect");
    return false;
  }

  const disk = await readCampaignJsonFromDir(handle);
  let localToken = "";
  try { localToken = localStorage.getItem(CS_SYNC_TOKEN_KEY) || ""; } catch(e) {}
  const diskToken = (disk && disk.syncToken) || "";
  const dirty = isProjectDirectoryDirty();
  const changedElsewhere = !!disk && diskToken !== localToken;

  if (changedElsewhere) {
    let loadFolder = true;
    if (dirty) {
      loadFolder = confirm(
        `Folder "${handle.name}" was saved from another computer/session since this browser last synced, ` +
        `and this browser ALSO has changes that were never written to the folder.\n\n` +
        `OK = Load the folder version (discard this browser's unsaved changes)\n` +
        `Cancel = Keep this browser's version and overwrite the folder`
      );
    }
    if (loadFolder) {
      await loadCampaignFromDirectoryHandle(handle);
      if (typeof setStatusBarMessage === "function") {
        setStatusBarMessage(`Loaded the latest version of "${(disk && disk.name) || handle.name}" from folder "${handle.name}".`);
      }
      return true;
    }
  }

  await bindProjectDirectory(handle);
  if (dirty || !disk || changedElsewhere) {
    setProjectDirectoryDirty(true);
    await flushProjectDirectoryNow({ interactive: !!opts.interactive });
  } else {
    // Clean state: reload campaign from folder to ensure live assets and modules match disk
    if (typeof loadCampaignFromDirectoryHandle === "function") {
      await loadCampaignFromDirectoryHandle(handle);
    }
    updateDiskSyncIndicator("synced");
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Reconnected & synced folder "${handle.name}". Changes save directly to disk.`);
    }
  }
  return true;
}
window.reconnectProjectDirectory = reconnectProjectDirectory;

/**
 * Called once on startup: restore the last bound folder. Chromium usually requires
 * a click to re-grant write access after a browser restart, so if needed we show a
 * "Reconnect" indicator (status bar + welcome dialog) instead of silently dropping it.
 */
async function restoreProjectDirectoryOnStartup() {
  const rec = await readStoredProjectHandleRecord();
  let handle = rec ? rec.handle : null;

  if (!handle && typeof getStoredCampaignsFolderHandle === "function") {
    try {
      const rootHandle = await getStoredCampaignsFolderHandle();
      if (rootHandle) {
        let p = "prompt";
        try { p = await rootHandle.queryPermission({ mode: "readwrite" }); } catch(_) {}
        if (p === "granted") {
          const disc = await scanCampaignsDirectory(rootHandle);
          const keys = Object.keys(disc || {});
          if (keys.length === 1 && disc[keys[0]].handle) {
            handle = disc[keys[0]].handle;
            await persistProjectDirectoryHandle(handle);
          }
        } else {
          window.pendingCampaignsRootDirectoryHandle = rootHandle;
        }
      }
    } catch(e) {}
  }

  if (!handle) {
    updateDiskSyncIndicator("none");
    if (typeof updateWelcomeDiskTile === "function") updateWelcomeDiskTile();
    return;
  }
  window.pendingProjectDirectoryHandle = handle;
  const ok = await reconnectProjectDirectory(handle, { interactive: false });
  if (!ok) {
    updateDiskSyncIndicator("reconnect");
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Click "Reconnect" (status bar, welcome dialog, or Ctrl+S) to resume saving to folder "${handle.name}".`);
    }
  }
  if (typeof updateWelcomeDiskTile === "function") updateWelcomeDiskTile();
}
window.restoreProjectDirectoryOnStartup = restoreProjectDirectoryOnStartup;

/**
 * Retrieve bound directory handle (only if write permission is currently granted).
 */
async function getBoundProjectDirectoryHandle() {
  if (window.activeProjectDirectoryHandle) return window.activeProjectDirectoryHandle;
  const rec = await readStoredProjectHandleRecord();
  if (rec && rec.handle && await ensureDirWritePermission(rec.handle, false)) {
    window.activeProjectDirectoryHandle = rec.handle;
    window.activeProjectDirectoryName = rec.name || rec.handle.name;
    return rec.handle;
  }
  return null;
}

// ----------------------------------------------------------------------------
// DEBOUNCED SINGLE-FLIGHT DISK WRITER
// ----------------------------------------------------------------------------
let _diskSyncTimer = null;
let _diskWriteInFlight = null;
let _diskWriteRequested = false;

/**
 * Queue a disk write (called on every edit via saveActiveCampaign()).
 */
function scheduleProjectDirectorySync() {
  setProjectDirectoryDirty(true);
  if (!window.activeProjectDirectoryHandle) {
    if (window.pendingProjectDirectoryHandle) updateDiskSyncIndicator("reconnect");
    return;
  }
  updateDiskSyncIndicator("pending");
  if (_diskSyncTimer) clearTimeout(_diskSyncTimer);
  _diskSyncTimer = setTimeout(() => {
    _diskSyncTimer = null;
    flushProjectDirectoryNow();
  }, CS_DISK_SYNC_DEBOUNCE_MS);
}
window.scheduleProjectDirectorySync = scheduleProjectDirectorySync;

/**
 * Write now (coalescing with any in-flight write). Resolves true on success.
 */
async function flushProjectDirectoryNow(opts = {}) {
  if (_diskSyncTimer) { clearTimeout(_diskSyncTimer); _diskSyncTimer = null; }
  if (!window.activeProjectDirectoryHandle) {
    if (opts.interactive && window.pendingProjectDirectoryHandle) {
      return reconnectProjectDirectory(window.pendingProjectDirectoryHandle, { interactive: true });
    }
    return false;
  }
  if (_diskWriteInFlight) {
    _diskWriteRequested = true;
    return _diskWriteInFlight;
  }
  const handle = window.activeProjectDirectoryHandle;
  _diskWriteInFlight = (async () => {
    updateDiskSyncIndicator("saving");
    let ok = false;
    try {
      ok = await writeCampaignToProjectDirectory(handle, { interactive: !!opts.interactive });
    } finally {
      _diskWriteInFlight = null;
    }
    if (_diskWriteRequested && window.activeProjectDirectoryHandle) {
      _diskWriteRequested = false;
      return flushProjectDirectoryNow(opts);
    }
    return ok;
  })();
  return _diskWriteInFlight;
}
window.flushProjectDirectoryNow = flushProjectDirectoryNow;

/**
 * Unified Save Handler for toolbar Save button, menu bar, and Ctrl+S.
 * If live disk sync is active, flushes directly to disk.
 * If no disk folder is linked, prompts the author to bind live disk sync.
 */
async function handleToolbarSave() {
  // 1. If actively bound to a project directory on disk, save session state and flush to disk directly
  if (window.activeProjectDirectoryHandle) {
    if (typeof saveActiveCampaign === "function") {
      saveActiveCampaign();
    }
    if (typeof flushProjectDirectoryNow === "function") {
      return await flushProjectDirectoryNow({ interactive: true });
    }
    return true;
  }

  // 2. If a folder was previously bound and is pending reconnection permission
  if (window.pendingProjectDirectoryHandle) {
    if (typeof reconnectProjectDirectory === "function") {
      const ok = await reconnectProjectDirectory(window.pendingProjectDirectoryHandle, { interactive: true });
      if (ok) {
        if (typeof saveActiveCampaign === "function") saveActiveCampaign();
        return true;
      }
    }
  }

  // 3. No disk linked: prompt the author to bind live disk sync
  const shouldBind = (typeof window !== "undefined" && typeof window.confirm === "function")
    ? window.confirm(
        "No disk folder is linked for live disk sync.\n\n" +
        "Changes are currently stored in temporary browser memory only and are NOT saved to files on your PC.\n\n" +
        "Would you like to bind live disk sync now?"
      )
    : false;

  if (shouldBind) {
    if (typeof openSaveAsNewCampaignModal === "function") {
      openSaveAsNewCampaignModal();
    }
  } else {
    // User declined disk sync; keep changes in browser memory and warn explicitly
    if (typeof saveActiveCampaign === "function") {
      saveActiveCampaign();
    }
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage("⚠️ Not saved to disk: No disk folder is linked for live disk sync.");
    }
    if (typeof updateDiskSyncIndicator === "function") {
      updateDiskSyncIndicator("none");
    }
  }
}
window.handleToolbarSave = handleToolbarSave;

function hasPendingDiskWrites() {
  return !!(_diskSyncTimer || _diskWriteInFlight);
}
window.hasPendingDiskWrites = hasPendingDiskWrites;

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("beforeunload", (e) => {
    const boundAndUnsaved = window.activeProjectDirectoryHandle && (hasPendingDiskWrites() || isProjectDirectoryDirty());
    const pendingAndUnsaved = !window.activeProjectDirectoryHandle && window.pendingProjectDirectoryHandle && isProjectDirectoryDirty();
    if (boundAndUnsaved) flushProjectDirectoryNow();
    if (boundAndUnsaved || pendingAndUnsaved) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

/**
 * Hydrate a cloned maps dictionary with full image dataUrls from IndexedDB / active canvas
 * so exports (.zip, .creator.json, and disk folders) never miss background images whose
 * in-memory dataUrl was stripped by stripMapImageDataUrl().
 */
async function hydrateMapsWithImageDataUrls(sourceMaps) {
  const cleanMaps = JSON.parse(JSON.stringify(sourceMaps && typeof sourceMaps === "object" ? sourceMaps : {}));
  const curActiveMapId = (typeof activeMapId !== "undefined" && activeMapId) ? activeMapId : "map_root";

  for (const mId of Object.keys(cleanMaps)) {
    const mMap = cleanMaps[mId];
    if (!mMap) continue;
    if (mMap.mapMetadata && mMap.mapMetadata.dataUrl) continue;

    let resolvedRec = null;
    // IndexedDB image records are keyed by map id only (not by campaign), so only
    // consult them for maps that actually declare a background image; otherwise a
    // stale image from a previously opened campaign could leak into this package.
    if (mMap.mapMetadata) {
      try {
        resolvedRec = await loadPersistedMapFromDB(mId);
      } catch(e) {}
    }

    if ((!resolvedRec || !resolvedRec.dataUrl) && mId === curActiveMapId && mMap.mapMetadata) {
      if (activeMapMetadata && activeMapMetadata.dataUrl) {
        resolvedRec = activeMapMetadata;
      } else if (typeof document !== "undefined" && document.getElementById) {
        const bgEl = document.getElementById("canvas-bg-image");
        const href = bgEl && bgEl.getAttribute ? bgEl.getAttribute("href") : null;
        if (href && href.startsWith("data:image/")) {
          resolvedRec = {
            name: (mMap.mapMetadata && mMap.mapMetadata.name) || `${mId}_bg`,
            dataUrl: href,
            width: (mMap.mapMetadata && mMap.mapMetadata.width) || Number(bgEl.getAttribute("width")) || 1920,
            height: (mMap.mapMetadata && mMap.mapMetadata.height) || Number(bgEl.getAttribute("height")) || 1080,
            opacity: (mMap.mapMetadata && mMap.mapMetadata.opacity !== undefined) ? mMap.mapMetadata.opacity : (Number(bgEl.getAttribute("opacity")) || 0.85)
          };
        }
      }
    }

    if (resolvedRec && resolvedRec.dataUrl) {
      const ext = getImageExtensionFromDataUrl(resolvedRec.dataUrl);
      mMap.mapMetadata = {
        ...(mMap.mapMetadata || {}),
        name: (mMap.mapMetadata && mMap.mapMetadata.name) || resolvedRec.name || `${mId}_bg.${ext}`,
        width: (mMap.mapMetadata && mMap.mapMetadata.width) || resolvedRec.width || 1920,
        height: (mMap.mapMetadata && mMap.mapMetadata.height) || resolvedRec.height || 1080,
        opacity: (mMap.mapMetadata && mMap.mapMetadata.opacity !== undefined) ? mMap.mapMetadata.opacity : (resolvedRec.opacity ?? 0.85),
        assetPath: (mMap.mapMetadata && mMap.mapMetadata.assetPath) || `assets/${mId}_bg.${ext}`,
        dataUrl: resolvedRec.dataUrl
      };
    }
  }
  return cleanMaps;
}
window.hydrateMapsWithImageDataUrls = hydrateMapsWithImageDataUrls;

/**
 * Resolve a map's background image from IndexedDB, in-memory dataUrl, bound folder handle,
 * or zero-CORS offline relative assetPath (surviving cache clears & machine transfers).
 */
async function resolveMapBackgroundUrl(mapId, mapMetadata) {
  const targetId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");

  // 1. In-memory dataUrl (highest fidelity, explicit active asset)
  if (mapMetadata && (mapMetadata.dataUrl || mapMetadata.url)) {
    const src = mapMetadata.dataUrl || mapMetadata.url;
    return {
      url: src,
      width: mapMetadata.width || 1920,
      height: mapMetadata.height || 1080,
      opacity: mapMetadata.opacity ?? 0.85,
      metadata: { ...mapMetadata, dataUrl: src, url: src }
    };
  }

  // 2. Bound project directory handle on disk
  const dirHandle = window.activeProjectDirectoryHandle || null;
  if (dirHandle && typeof dirHandle.getDirectoryHandle === "function") {
    try {
      let assetsDir = null;
      try { assetsDir = await dirHandle.getDirectoryHandle("assets", { create: false }); } catch(_) {}
      if (!assetsDir) {
        try { assetsDir = await dirHandle.getDirectoryHandle("Assets", { create: false }); } catch(_) {}
      }
      if (assetsDir) {
        const candidates = [];
        if (mapMetadata) {
          if (mapMetadata.assetPath) candidates.push(String(mapMetadata.assetPath).replace(/\\/g, "/").split("/").pop());
          if (mapMetadata.name) candidates.push(String(mapMetadata.name).replace(/\\/g, "/").split("/").pop());
        }
        candidates.push(`${targetId}_bg.png`, `${targetId}_bg.jpg`, `${targetId}_bg.jpeg`, `${targetId}_bg.webp`, `${targetId}.png`, `${targetId}.jpg`);
        if (targetId === "map_root") {
          candidates.push("map_root_bg.png", "map_root_bg.jpg", "map_root_bg.jpeg", "map_root_bg.webp", "bg.png", "bg.jpg", "map.png", "map.jpg");
        }
        for (const fileName of candidates) {
          if (!fileName) continue;
          try {
            const imgFile = await assetsDir.getFileHandle(fileName, { create: false });
            const blob = await imgFile.getFile();
            const dUrl = (typeof blobToDataUrl === "function") ? await blobToDataUrl(blob) : null;
            if (dUrl) {
              if (typeof saveMapImageToDB === "function") {
                await saveMapImageToDB(mapMetadata?.name || fileName, dUrl, mapMetadata?.width || 1920, mapMetadata?.height || 1080, mapMetadata?.opacity ?? 0.85, targetId);
              }
              const meta = { ...(mapMetadata || {}), dataUrl: dUrl, url: dUrl, assetPath: `assets/${fileName}` };
              return {
                url: dUrl,
                width: meta.width || 1920,
                height: meta.height || 1080,
                opacity: meta.opacity ?? 0.85,
                metadata: meta
              };
            }
          } catch(_) {}
        }
      }
    } catch(e) {}
  }

  // 2b. Fallback: check linked campaigns root folder if activeProjectDirectoryHandle is not yet bound
  if (!dirHandle && window.campaignsRootDirectoryHandle) {
    try {
      let folderSlug = (typeof activeCampaignId !== "undefined" && activeCampaignId) ? activeCampaignId : "";
      if (window.activeProjectDirectoryName) folderSlug = window.activeProjectDirectoryName;
      if (typeof CAMPAIGN_REGISTRY !== "undefined" && CAMPAIGN_REGISTRY[folderSlug]?.folder) {
        folderSlug = CAMPAIGN_REGISTRY[folderSlug].folder;
      }
      if (folderSlug) {
        let subDir = null;
        try { subDir = await window.campaignsRootDirectoryHandle.getDirectoryHandle(folderSlug, { create: false }); } catch(_) {}
        if (!subDir && folderSlug.includes(" ")) {
          try { subDir = await window.campaignsRootDirectoryHandle.getDirectoryHandle(folderSlug.toLowerCase().replace(/[^a-z0-9_]/g, "_"), { create: false }); } catch(_) {}
        }
        if (subDir) {
          let assetsDir = null;
          try { assetsDir = await subDir.getDirectoryHandle("assets", { create: false }); } catch(_) {}
          if (!assetsDir) {
            try { assetsDir = await subDir.getDirectoryHandle("Assets", { create: false }); } catch(_) {}
          }
          if (assetsDir) {
            const candidates = [];
            if (mapMetadata) {
              if (mapMetadata.assetPath) candidates.push(String(mapMetadata.assetPath).replace(/\\/g, "/").split("/").pop());
              if (mapMetadata.name) candidates.push(String(mapMetadata.name).replace(/\\/g, "/").split("/").pop());
            }
            candidates.push(`${targetId}_bg.png`, `${targetId}_bg.jpg`, `${targetId}_bg.jpeg`, `${targetId}_bg.webp`);
            if (targetId === "map_root") {
              candidates.push("map_root_bg.png", "map_root_bg.jpg", "map_root_bg.jpeg", "map_root_bg.webp", "bg.png", "bg.jpg");
            }
            for (const fileName of candidates) {
              if (!fileName) continue;
              try {
                const imgFile = await assetsDir.getFileHandle(fileName, { create: false });
                const blob = await imgFile.getFile();
                const dUrl = (typeof blobToDataUrl === "function") ? await blobToDataUrl(blob) : null;
                if (dUrl) {
                  if (typeof saveMapImageToDB === "function") {
                    await saveMapImageToDB(mapMetadata?.name || fileName, dUrl, mapMetadata?.width || 1920, mapMetadata?.height || 1080, mapMetadata?.opacity ?? 0.85, targetId);
                  }
                  const meta = { ...(mapMetadata || {}), dataUrl: dUrl, url: dUrl, assetPath: `assets/${fileName}` };
                  return {
                    url: dUrl,
                    width: meta.width || 1920,
                    height: meta.height || 1080,
                    opacity: meta.opacity ?? 0.85,
                    metadata: meta
                  };
                }
              } catch(_) {}
            }
          }
        }
      }
    } catch(_) {}
  }

  // 3. Stored IndexedDB record (only if map declares an image, avoiding cross-campaign leaks)
  if (mapMetadata) {
    try {
      const persisted = await loadPersistedMapFromDB(targetId);
      if (persisted && persisted.dataUrl) {
        return {
          url: persisted.dataUrl,
          width: persisted.width || (mapMetadata && mapMetadata.width) || 1920,
          height: persisted.height || (mapMetadata && mapMetadata.height) || 1080,
          opacity: persisted.opacity ?? (mapMetadata && mapMetadata.opacity) ?? 0.85,
          metadata: { ...(mapMetadata || {}), ...persisted, dataUrl: persisted.dataUrl, url: persisted.dataUrl }
        };
      }
    } catch(e) {}
  }

  // 4. Zero-CORS offline relative file URL fallback
  if (mapMetadata && mapMetadata.assetPath) {
    const rawAssetPath = String(mapMetadata.assetPath).replace(/\\/g, "/").replace(/^\.\//, "");
    let relUrl = rawAssetPath;
    if (!relUrl.startsWith("campaigns/") && !relUrl.startsWith("data:") && !relUrl.startsWith("blob:") && !relUrl.startsWith("http")) {
      let folderSlug = (typeof activeCampaignId !== "undefined" && activeCampaignId) ? activeCampaignId : "";
      if (window.activeProjectDirectoryName) {
        folderSlug = window.activeProjectDirectoryName;
      } else if (typeof CAMPAIGN_REGISTRY !== "undefined" && CAMPAIGN_REGISTRY) {
        if (CAMPAIGN_REGISTRY[folderSlug] && CAMPAIGN_REGISTRY[folderSlug].folder) {
          folderSlug = CAMPAIGN_REGISTRY[folderSlug].folder;
        } else {
          const match = Object.values(CAMPAIGN_REGISTRY).find(c => c && (c.id === folderSlug || c.folder === folderSlug || c.metadata?.id === folderSlug));
          if (match && match.folder) folderSlug = match.folder;
        }
      }
      if (folderSlug && folderSlug !== "custom") {
        relUrl = `campaigns/${folderSlug}/${rawAssetPath}`;
      }
    }
    return {
      url: relUrl,
      width: mapMetadata.width || 1920,
      height: mapMetadata.height || 1080,
      opacity: mapMetadata.opacity ?? 0.85,
      metadata: { ...mapMetadata, url: relUrl, dataUrl: relUrl }
    };
  }

  return null;
}
window.resolveMapBackgroundUrl = resolveMapBackgroundUrl;

/**
 * Fast full-content signature (FNV-1a) used to skip rewriting unchanged files on
 * every autosave (keeps USB writes small). Hashes the whole string so a same-length
 * edit (e.g. a node moving from x=120 to x=130) is never mistaken for "unchanged".
 */
function quickSignature(str) {
  const s = String(str || "");
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return s.length + ":" + (h >>> 0).toString(36);
}

function normalizeAssetRelPath(assetPath) {
  const raw = String(assetPath || "").replace(/\\/g, "/").replace(/^\.\//, "");
  if (!raw || raw.startsWith("data:") || raw.startsWith("blob:") || raw.startsWith("http")) return null;
  const fileName = raw.split("/").pop();
  return fileName ? `assets/${fileName}` : null;
}

/**
 * Read raw bytes of a relative file (e.g. "assets/map_root_bg.png") from a folder handle.
 */
async function readFileBytesFromDir(dirHandle, relPath) {
  if (!dirHandle || !relPath || typeof dirHandle.getDirectoryHandle !== "function") return null;
  try {
    const parts = relPath.split("/").filter(Boolean);
    let dir = dirHandle;
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: false });
    }
    const fh = await dir.getFileHandle(parts[parts.length - 1], { create: false });
    const file = await fh.getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch(e) {
    return null;
  }
}

/**
 * Build the canonical campaign package file set. This is the single source of truth
 * for BOTH "Export Campaign Package (.zip)" and every direct-disk folder write, so a
 * synced / saved-as folder always contains exactly what the zip would.
 *
 * opts.syncToken            stamped into campaign.json (folder writes only)
 * opts.assetSourceDirHandle folder to copy map images from when they are not cached
 *                           in this browser (e.g. Save As from one folder to another)
 *
 * Returns { cName, slug, files: [{ path, data, sig }], imageCount, campaignMeta, customMods }.
 */
async function buildCampaignPackageFiles(opts = {}) {
  if (typeof syncAdapterFromWorkstationTopology === "function") syncAdapterFromWorkstationTopology();
  if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();

  const activeTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology)
    ? Workstation.activeTopology
    : ((window.Workstation && window.Workstation.activeTopology) ? window.Workstation.activeTopology : null);
  const cName = (typeof currentCampaignName !== "undefined" && currentCampaignName)
    || (activeTopo && activeTopo.name) || "campaign";
  const slug = slugifyCampaignName(cName);
  const nowIso = new Date().toISOString();

  const files = [];
  let imageCount = 0;

  // 1. Map background images -> assets/<mapId>_bg.<ext>
  const cleanMaps = await hydrateMapsWithImageDataUrls(typeof maps !== "undefined" ? maps : {});
  for (const mId of Object.keys(cleanMaps)) {
    const mMap = cleanMaps[mId];
    if (!mMap || !mMap.mapMetadata) continue;
    const meta = mMap.mapMetadata;
    if (meta.dataUrl) {
      const ext = getImageExtensionFromDataUrl(meta.dataUrl);
      const fileName = `${mId}_bg.${ext}`;
      const imgBytes = dataUrlToUint8Array(meta.dataUrl);
      if (imgBytes) {
        files.push({ path: `assets/${fileName}`, data: imgBytes, sig: "img:" + quickSignature(meta.dataUrl) });
        imageCount++;
        meta.assetPath = `assets/${fileName}`;
        if (typeof maps !== "undefined" && maps[mId] && maps[mId].mapMetadata) {
          maps[mId].mapMetadata.assetPath = meta.assetPath;
        }
      }
      // Omit raw dataUrl from clean on-disk JSON
      delete meta.dataUrl;
      if (typeof meta.url === "string" && meta.url.startsWith("data:")) {
        delete meta.url;
      }
    } else if (meta.assetPath && opts.assetSourceDirHandle) {
      const rel = normalizeAssetRelPath(meta.assetPath);
      const bytes = rel ? await readFileBytesFromDir(opts.assetSourceDirHandle, rel) : null;
      if (bytes) {
        files.push({ path: rel, data: bytes, sig: "raw:" + bytes.length });
        meta.assetPath = rel;
        imageCount++;
      }
      if (typeof meta.url === "string" && meta.url.startsWith("data:")) {
        delete meta.url;
      }
    } else if (typeof meta.url === "string" && meta.url.startsWith("data:")) {
      delete meta.url;
    }
  }

  // 2. campaign.json
  const entities = {
    npcs: (activeTopo && activeTopo.npcs) || [],
    quests: (activeTopo && activeTopo.quests) || [],
    items: (activeTopo && activeTopo.items) || [],
    trackers: (activeTopo && activeTopo.trackers) || [],
    tickets: (activeTopo && activeTopo.tickets) || [],
    custom_modules: (activeTopo && activeTopo.custom_modules) || [],
    deletedModules: (activeTopo && activeTopo.deletedModules) || [],
    deletedPrototypes: (activeTopo && activeTopo.deletedPrototypes) || []
  };
  const campaignMeta = {
    id: slug,
    name: cName,
    campaignName: cName,
    description: (activeTopo && activeTopo.description) || "Authored in Creator Studio Pointcrawl Workstation",
    author: "Creator Studio World Architect",
    packageType: "workstation_project",
    enabled: true,
    topologyFile: "topology.json",
    manifestFile: "modules_manifest.json",
    updatedAt: nowIso,
    exportedAt: nowIso,
    globalDials: {
      dial8ClimaxTrigger: (typeof dial8ClimaxTriggerMode !== "undefined" ? dial8ClimaxTriggerMode : "crisis"),
      tier0Substratum: typeof tier0SubstratumEnabled !== "undefined" ? tier0SubstratumEnabled : true
    },
    entities: entities
  };
  if (opts.syncToken) campaignMeta.syncToken = opts.syncToken;

  // 3. preset.json + topology.json (identical payloads, as in the zip export)
  let cleanActiveTopo = activeTopo;
  if (activeTopo && typeof activeTopo === "object" && activeTopo.maps) {
    cleanActiveTopo = Object.assign({}, activeTopo, { maps: cleanMaps });
  }
  const presetData = {
    id: slug,
    name: cName,
    campaignName: cName,
    rootMapId: "map_root",
    activeMapId: (typeof activeMapId !== "undefined") ? activeMapId : "map_root",
    maps: cleanMaps,
    activeTopology: cleanActiveTopo,
    edgeData: (activeTopo && activeTopo.edgeData) || {},
    edgeNotes: (activeTopo && activeTopo.edgeNotes) || {},
    nodes: (activeTopo && activeTopo.nodes) || {},
    links: (activeTopo && activeTopo.links) || [],
    waves: (typeof waves !== "undefined") ? waves : [],
    entities: entities,
    npcs: entities.npcs,
    quests: entities.quests,
    items: entities.items,
    trackers: entities.trackers,
    tickets: entities.tickets,
    custom_modules: entities.custom_modules,
    deletedModules: entities.deletedModules,
    deletedPrototypes: entities.deletedPrototypes
  };
  const presetStr = JSON.stringify(presetData, null, 2);
  const presetSig = "json:" + quickSignature(presetStr);

  // 4. modules/*.md + modules_manifest.json
  const customMods = (entities.custom_modules || []).filter(cm => cm && cm.id);
  for (const cm of customMods) {
    const mdText = cm.raw_markdown || (typeof buildCustomModuleMarkdown === "function" ? buildCustomModuleMarkdown(cm) : `# ${cm.title || cm.id}\n`);
    files.push({ path: `modules/${cm.id}.md`, data: mdText, sig: "md:" + quickSignature(mdText) });
  }
  const manifestStr = JSON.stringify(customMods, null, 2);
  files.push({ path: "modules_manifest.json", data: manifestStr, sig: "manifest:" + quickSignature(manifestStr + JSON.stringify(entities.deletedModules)), isManifest: true });

  files.push({ path: "preset.json", data: presetStr, sig: presetSig });
  files.push({ path: "topology.json", data: presetStr, sig: presetSig });
  // campaign.json last: its syncToken only lands once all other files are written
  files.push({ path: "campaign.json", data: JSON.stringify(campaignMeta, null, 2), sig: null });

  return { cName, slug, files, imageCount, campaignMeta, customMods };
}
window.buildCampaignPackageFiles = buildCampaignPackageFiles;

async function writeFileToDir(rootHandle, relPath, data) {
  const parts = String(relPath).split("/").filter(Boolean);
  let dir = rootHandle;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: true });
  }
  const fh = await dir.getFileHandle(parts[parts.length - 1], { create: true });
  const writable = await fh.createWritable();
  try {
    await writable.write(data);
    await writable.close();
  } catch(e) {
    try { if (typeof writable.abort === "function") await writable.abort(); } catch(_) {}
    throw e;
  }
}

/**
 * modules_manifest.json in a folder may list hand-authored modules that are not
 * workstation custom modules; keep those, refresh custom ones, drop deleted ones.
 */
async function mergeModulesManifestForDir(dirHandle, customMods, deletedIds) {
  let existing = null;
  try {
    const fh = await dirHandle.getFileHandle("modules_manifest.json", { create: false });
    existing = JSON.parse(await (await fh.getFile()).text());
  } catch(e) {}

  const baseList = (Array.isArray(existing) && existing.length > 0)
    ? existing
    : (Array.isArray(window.lastScannedDiskModulesForActiveDir) ? window.lastScannedDiskModulesForActiveDir : []);

  const customIds = new Set((customMods || []).map(m => String(m.id)));
  const deleted = new Set((deletedIds || []).map(String));

  const kept = baseList.filter(e => e && e.id !== undefined && !customIds.has(String(e.id)) && !deleted.has(String(e.id)));
  return kept.concat(customMods || []);
}

/**
 * Write the full campaign package (same files as the .zip export) into a folder.
 * Unchanged files are skipped for the active bound folder. Resolves true on success.
 */
async function writeCampaignToProjectDirectory(dirHandle, opts = {}) {
  if (!dirHandle) return false;
  const isActive = dirHandle === window.activeProjectDirectoryHandle;
  const editSeqAtStart = window.__csEditSeq || 0;
  try {
    if (!(await ensureDirWritePermission(dirHandle, !!opts.interactive))) {
      if (isActive) {
        window.pendingProjectDirectoryHandle = dirHandle;
        window.activeProjectDirectoryHandle = null;
        updateDiskSyncIndicator("reconnect");
      }
      throw new Error(`write access to "${dirHandle.name}" is not granted (click Reconnect in the status bar)`);
    }

    const token = generateSyncToken();
    const pkg = await buildCampaignPackageFiles({
      syncToken: token,
      assetSourceDirHandle: opts.assetSourceDirHandle || null
    });
    const cache = isActive ? window.projectDirectoryWriteCache : null;
    const deletedIds = pkg.campaignMeta.entities.deletedModules || [];
    let written = 0;

    for (const f of pkg.files) {
      if (cache && f.sig && cache.get(f.path) === f.sig) continue;
      let data = f.data;
      if (f.isManifest) {
        data = JSON.stringify(await mergeModulesManifestForDir(dirHandle, pkg.customMods, deletedIds), null, 2) + "\n";
      }
      await writeFileToDir(dirHandle, f.path, data);
      if (cache && f.sig) cache.set(f.path, f.sig);
      written++;
    }

    if (isActive || dirHandle === window.activeProjectDirectoryHandle) {
      try { localStorage.setItem(CS_SYNC_TOKEN_KEY, token); } catch(e) {}
      if ((window.__csEditSeq || 0) === editSeqAtStart) setProjectDirectoryDirty(false);
      updateDiskSyncIndicator(isProjectDirectoryDirty() ? "pending" : "synced", `last saved ${new Date().toLocaleTimeString()}`);
    }
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Saved to folder "${dirHandle.name}" (${written} file(s) updated, ${pkg.imageCount} map image(s)).`);
    }
    return true;
  } catch(err) {
    console.warn("[ProjectDirectory] Write error:", err);
    window.lastProjectDirectoryError = err;
    if (window.projectDirectorySyncState !== "reconnect") {
      updateDiskSyncIndicator("error", err && err.message);
    }
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Could not save to folder "${dirHandle.name}": ${err && err.message ? err.message : err}`);
    }
    return false;
  }
}

/**
 * Save As... (.creator.json monolithic self-contained package)
 */
async function saveCampaignAsCreatorJson() {
  if (typeof syncAdapterFromWorkstationTopology === "function") syncAdapterFromWorkstationTopology();
  if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();

  const cName = (typeof currentCampaignName !== "undefined" ? currentCampaignName : (window.Workstation && window.Workstation.activeTopology && window.Workstation.activeTopology.name) || "campaign");
  const slug = cName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const hydratedMaps = await hydrateMapsWithImageDataUrls(typeof maps !== "undefined" ? maps : {});

  let fullJson;
  if (typeof generateCampaignJSON === "function") {
    try {
      const gen = generateCampaignJSON();
      const parsedGen = (typeof gen === "string") ? JSON.parse(gen) : gen;
      if (parsedGen && typeof parsedGen === "object") {
        parsedGen.maps = hydratedMaps;
        fullJson = JSON.stringify(parsedGen, null, 2);
      }
    } catch(e) {
      console.warn("[SaveAs] generateCampaignJSON error, using active state:", e);
    }
  }

  if (!fullJson) {
    const activeTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) 
      ? Workstation.activeTopology 
      : ((window.Workstation && window.Workstation.activeTopology) ? window.Workstation.activeTopology : null);

    fullJson = JSON.stringify({
      metadata: { campaignName: cName, generatedAt: new Date().toISOString() },
      maps: hydratedMaps,
      activeMapId: typeof activeMapId !== "undefined" ? activeMapId : "map_root",
      activeTopology: activeTopo,
      entities: {
        npcs: (activeTopo && activeTopo.npcs) || [],
        quests: (activeTopo && activeTopo.quests) || [],
        items: (activeTopo && activeTopo.items) || [],
        trackers: (activeTopo && activeTopo.trackers) || [],
        tickets: (activeTopo && activeTopo.tickets) || [],
        custom_modules: (activeTopo && activeTopo.custom_modules) || [],
        deletedModules: (activeTopo && activeTopo.deletedModules) || [],
        deletedPrototypes: (activeTopo && activeTopo.deletedPrototypes) || []
      },
      npcs: (activeTopo && activeTopo.npcs) || [],
      quests: (activeTopo && activeTopo.quests) || [],
      items: (activeTopo && activeTopo.items) || [],
      trackers: (activeTopo && activeTopo.trackers) || [],
      tickets: (activeTopo && activeTopo.tickets) || [],
      custom_modules: (activeTopo && activeTopo.custom_modules) || [],
      deletedModules: (activeTopo && activeTopo.deletedModules) || [],
      deletedPrototypes: (activeTopo && activeTopo.deletedPrototypes) || []
    }, null, 2);
  }

  const content = (typeof fullJson === "string") ? fullJson : JSON.stringify(fullJson, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}.creator.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  if (typeof setStatusBarMessage === "function") {
    setStatusBarMessage(`Exported self-contained campaign package: "${slug}.creator.json".`);
  }
}

/**
 * Export Campaign Package (.zip archive with modular JSON & assets)
 * Uses the same buildCampaignPackageFiles() file set as direct-disk folder writes.
 */
async function saveCampaignAsZip() {
  if (typeof window.ZeroCorsZip === "undefined") {
    alert("ZeroCorsZip engine not loaded.");
    return;
  }

  const pkg = await buildCampaignPackageFiles({
    assetSourceDirHandle: window.activeProjectDirectoryHandle || null
  });
  const zip = new window.ZeroCorsZip();
  for (const f of pkg.files) {
    zip.addFile(f.path, f.data);
  }

  const zipBlob = zip.generateBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(zipBlob);
  a.download = `${pkg.slug}_package.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  if (typeof setStatusBarMessage === "function") {
    setStatusBarMessage(`Exported ZIP campaign archive: "${pkg.slug}_package.zip" (${(zipBlob.size / 1024).toFixed(1)} KB).`);
  }
}

// ============================================================================
// DYNAMIC CAMPAIGN LIBRARY & DISK FOLDER SYNCHRONIZATION (ZERO-CORS OFFLINE)
// ============================================================================

window.discoveredDiskCampaigns = {};
window.savedLibraryCampaigns = [];

/**
 * Save full campaign package record into IndexedDB campaign_library
 */
async function saveCampaignToIndexedDBLibrary(campRecord) {
  if (!campRecord || !campRecord.id) return false;
  const db = await openMapDatabase();
  const record = {
    ...campRecord,
    updatedAt: new Date().toISOString()
  };
  if (db && db.objectStoreNames.contains("campaign_library")) {
    try {
      const tx = db.transaction("campaign_library", "readwrite");
      tx.objectStore("campaign_library").put(record);
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
    } catch(e) {
      console.warn("[CampaignLibrary] IndexedDB write notice:", e);
    }
  }
  try {
    const listStr = localStorage.getItem("cs_campaign_library_index") || "{}";
    const list = JSON.parse(listStr);
    list[campRecord.id] = {
      id: campRecord.id,
      name: campRecord.name || campRecord.campaignName || campRecord.id,
      description: campRecord.description || "",
      updatedAt: record.updatedAt
    };
    localStorage.setItem("cs_campaign_library_index", JSON.stringify(list));
  } catch(e) {}
  return true;
}
window.saveCampaignToIndexedDBLibrary = saveCampaignToIndexedDBLibrary;

/**
 * Retrieve all campaign packages stored in IndexedDB campaign_library
 */
async function getCampaignsFromIndexedDBLibrary() {
  const db = await openMapDatabase();
  if (db && db.objectStoreNames.contains("campaign_library")) {
    try {
      return await new Promise((resolve) => {
        const tx = db.transaction("campaign_library", "readonly");
        const req = tx.objectStore("campaign_library").getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch(e) {
      console.warn("[CampaignLibrary] IndexedDB read notice:", e);
    }
  }
  return [];
}
window.getCampaignsFromIndexedDBLibrary = getCampaignsFromIndexedDBLibrary;

/**
 * Delete a campaign from IndexedDB campaign_library
 */
async function deleteCampaignFromIndexedDBLibrary(id) {
  const db = await openMapDatabase();
  if (db && db.objectStoreNames.contains("campaign_library")) {
    try {
      const tx = db.transaction("campaign_library", "readwrite");
      tx.objectStore("campaign_library").delete(id);
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
    } catch(e) {}
  }
  try {
    const listStr = localStorage.getItem("cs_campaign_library_index") || "{}";
    const list = JSON.parse(listStr);
    delete list[id];
    localStorage.setItem("cs_campaign_library_index", JSON.stringify(list));
  } catch(e) {}
  return true;
}
window.deleteCampaignFromIndexedDBLibrary = deleteCampaignFromIndexedDBLibrary;

/**
 * Retrieve stored /campaigns root directory handle
 */
async function getStoredCampaignsFolderHandle() {
  if (window.campaignsRootDirectoryHandle) return window.campaignsRootDirectoryHandle;
  const db = await openMapDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("project_handle", "readonly");
      const req = tx.objectStore("project_handle").get("campaigns_root_handle");
      req.onsuccess = async () => {
        if (req.result && req.result.handle) {
          try {
            const h = req.result.handle;
            window.campaignsRootDirectoryHandle = h;
            window.campaignsRootDirectoryName = req.result.name || h.name;
            resolve(h);
            return;
          } catch(e) {}
        }
        resolve(null);
      };
      req.onerror = () => resolve(null);
    } catch(e) {
      resolve(null);
    }
  });
}
window.getStoredCampaignsFolderHandle = getStoredCampaignsFolderHandle;

/**
 * Persist /campaigns root directory handle
 */
async function setCampaignsFolderHandle(dirHandle) {
  if (!dirHandle) return;
  window.campaignsRootDirectoryHandle = dirHandle;
  window.campaignsRootDirectoryName = dirHandle.name;
  try { localStorage.setItem("cs_campaigns_folder_name", dirHandle.name); } catch(e) {}
  const db = await openMapDatabase();
  if (db) {
    try {
      const tx = db.transaction("project_handle", "readwrite");
      tx.objectStore("project_handle").put({ id: "campaigns_root_handle", handle: dirHandle, name: dirHandle.name });
    } catch(e) {}
  }
}
window.setCampaignsFolderHandle = setCampaignsFolderHandle;

/**
 * Dynamically scan a campaigns root directory on disk and catalog all campaigns
 */
async function scanCampaignsDirectory(rootHandle) {
  if (!rootHandle) return {};
  const discovered = {};
  try {
    for await (const [name, entry] of rootHandle.entries()) {
      if (entry.kind === "directory" && !name.startsWith(".") && !name.startsWith("_")) {
        try {
          let campMeta = null;
          let topoData = null;
          try {
            const cFile = await entry.getFileHandle("campaign.json");
            campMeta = JSON.parse(await (await cFile.getFile()).text());
          } catch(e) {}
          try {
            const tFile = await entry.getFileHandle("topology.json");
            topoData = JSON.parse(await (await tFile.getFile()).text());
          } catch(e) {
            try {
              const pFile = await entry.getFileHandle("preset.json");
              topoData = JSON.parse(await (await pFile.getFile()).text());
            } catch(e2) {}
          }
          if (campMeta || topoData) {
            const title = (campMeta && (campMeta.name || campMeta.campaignName))
              || (topoData && (topoData.name || topoData.campaignName))
              || name;
            const desc = (campMeta && campMeta.description)
              || (topoData && topoData.description)
              || "";
            let nodeCount = 0;
            if (topoData) {
              if (topoData.maps && typeof topoData.maps === "object") {
                Object.values(topoData.maps).forEach(m => {
                  if (m && m.nodes) nodeCount += Array.isArray(m.nodes) ? m.nodes.length : Object.keys(m.nodes).length;
                });
              } else if (topoData.nodes) {
                nodeCount = Array.isArray(topoData.nodes) ? topoData.nodes.length : Object.keys(topoData.nodes).length;
              }
            }
            let entityCount = 0;
            const entities = (campMeta && campMeta.entities) || (topoData && topoData.entities);
            if (entities) {
              entityCount = (entities.npcs?.length || 0) + (entities.quests?.length || 0) + (entities.items?.length || 0);
            }

            discovered[name] = {
              id: name,
              folderName: name,
              title: title,
              name: title,
              description: desc,
              nodeCount: nodeCount,
              entityCount: entityCount,
              meta: campMeta,
              topo: topoData,
              handle: entry,
              sourceType: "disk_folder"
            };
          }
        } catch(subErr) {
          console.warn("[CampaignScanner] Error scanning subfolder", name, subErr);
        }
      }
    }
  } catch(err) {
    console.warn("[CampaignScanner] Directory scan error:", err);
  }
  window.discoveredDiskCampaigns = discovered;
  return discovered;
}
window.scanCampaignsDirectory = scanCampaignsDirectory;

function parseFrontmatterYaml(rawText) {
  const fm = {};
  const fmMatch = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return fm;
  const lines = fmMatch[1].split('\n');
  let currentKey = null;
  let currentList = null;
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const kvMatch = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (kvMatch && !line.startsWith(' ') && !line.startsWith('\t')) {
      currentKey = kvMatch[1].trim();
      let rawVal = kvMatch[2].trim();
      if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
        try {
          fm[currentKey] = JSON.parse(rawVal);
        } catch(e) {
          fm[currentKey] = rawVal.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        }
        currentList = null;
      } else if (rawVal === '') {
        currentList = [];
        fm[currentKey] = currentList;
      } else {
        fm[currentKey] = rawVal.replace(/^["']|["']$/g, '');
        currentList = null;
      }
    } else if (currentList && (line.startsWith('  -') || line.startsWith('  *') || line.startsWith(' -') || line.startsWith('-'))) {
      currentList.push(trimmed.replace(/^[-*]\s*/, '').replace(/^["']|["']$/g, '').trim());
    }
  }
  return fm;
}

async function scanCampaignModulesFromDirectoryHandle(dirHandle, campaignId, campaignName, deletedIds = []) {
  if (!dirHandle || typeof dirHandle.getDirectoryHandle !== "function") return [];
  let modulesDir = null;
  try {
    modulesDir = await dirHandle.getDirectoryHandle("modules", { create: false });
  } catch(e) {
    return [];
  }
  if (!modulesDir) return [];

  const deletedSet = new Set((deletedIds || []).map(String));
  const discovered = [];

  async function walkDir(dHandle, relSubdir = "") {
    let entries = [];
    if (typeof dHandle.entries === "function") {
      try {
        for await (const [name, entry] of dHandle.entries()) {
          entries.push({ name, entry });
        }
      } catch(e) {}
    } else if (typeof dHandle.values === "function") {
      try {
        for await (const entry of dHandle.values()) {
          entries.push({ name: entry.name, entry });
        }
      } catch(e) {}
    }

    for (const item of entries) {
      const name = item.name || item.entry?.name;
      const entry = item.entry || item;
      if (!name || name.startsWith('.') || name.startsWith('_')) continue;

      if (entry.kind === "directory") {
        await walkDir(entry, relSubdir ? `${relSubdir}/${name}` : name);
      } else if (entry.kind === "file" && name.toLowerCase().endsWith(".md") && !name.toLowerCase().startsWith("readme")) {
        try {
          const file = await entry.getFile();
          const rawText = await file.text();
          const fm = parseFrontmatterYaml(rawText);

          let modId = fm.id || fm.module_id;
          if (!modId) {
            const baseNoExt = name.replace(/\.md$/i, '');
            const prefixMatch = baseNoExt.match(/^([A-Z0-9]+-[0-9]+|[A-Z0-9]+)/i);
            modId = prefixMatch ? prefixMatch[1] : baseNoExt;
          }

          if (deletedSet.has(String(modId))) continue;

          let title = fm.title;
          if (!title) {
            const h1Match = rawText.match(/^#\s+(?:MODULE\s+[A-Z0-9-]+:\s*)?([^\r\n]+)/m);
            title = h1Match ? h1Match[1].trim() : name.replace(/\.md$/i, '').replace(/_/g, ' ');
          }

          const pipelineTier = fm.pipeline_tier ? parseInt(fm.pipeline_tier) : (fm.tier && fm.tier.match(/Tier\s*(\d)/i) ? parseInt(fm.tier.match(/Tier\s*(\d)/i)[1]) : 3);
          const relPath = `./modules/${relSubdir ? relSubdir + '/' : ''}${name}`;
          const fileUrl = `campaigns/${encodeURIComponent(dirHandle.name)}/modules/${relSubdir ? relSubdir + '/' : ''}${name}`;

          let setName = fm.set;
          if (!setName) {
            setName = relSubdir && relSubdir.startsWith('Set_') ? relSubdir.replace(/_/g, ' ') : "Core Modules";
          }

          discovered.push({
            id: String(modId),
            title: title,
            set: setName,
            tier: fm.tier || `Tier ${pipelineTier}`,
            pipeline_tier: pipelineTier,
            culture: fm.culture || fm.culture_quadrant || "Universal",
            color: fm.color || fm.mtg_color || "Colorless",
            provides: Array.isArray(fm.provides) ? fm.provides : [],
            requires: Array.isArray(fm.requires) ? fm.requires : [],
            summary: fm.summary || fm.yields || fm.description || "",
            yields: fm.yields_resource || fm.yields || "",
            path: relPath,
            file_url: fileUrl,
            campaign: campaignId || dirHandle.name,
            campaign_name: campaignName || dirHandle.name,
            raw_markdown: rawText,
            standalone_fallback: fm.standalone_fallback || "",
            sourceType: "disk"
          });
        } catch(readErr) {
          console.warn("[scanCampaignModules] Error reading file:", name, readErr);
        }
      }
    }
  }

  await walkDir(modulesDir);
  return discovered;
}
window.scanCampaignModulesFromDirectoryHandle = scanCampaignModulesFromDirectoryHandle;

function syncDiskModulesIntoRuntimeCatalog(diskModules, campaignId) {
  if (!Array.isArray(diskModules) || diskModules.length === 0) return;
  if (typeof ALL_MODULES === "undefined" || !Array.isArray(ALL_MODULES)) return;

  diskModules.forEach(dm => {
    const idx = ALL_MODULES.findIndex(m => String(m.id) === String(dm.id));
    if (idx >= 0) {
      ALL_MODULES[idx] = { ...ALL_MODULES[idx], ...dm };
    } else {
      ALL_MODULES.push(dm);
    }
  });

  if (typeof MODULES_MANIFEST !== "undefined" && Array.isArray(MODULES_MANIFEST) && MODULES_MANIFEST !== ALL_MODULES) {
    diskModules.forEach(dm => {
      const idx = MODULES_MANIFEST.findIndex(m => String(m.id) === String(dm.id));
      if (idx >= 0) {
        MODULES_MANIFEST[idx] = { ...MODULES_MANIFEST[idx], ...dm };
      } else {
        MODULES_MANIFEST.push(dm);
      }
    });
  }
}
window.syncDiskModulesIntoRuntimeCatalog = syncDiskModulesIntoRuntimeCatalog;

/**
 * Load campaign directly from a FileSystemDirectoryHandle
 */
async function loadCampaignFromDirectoryHandle(dirHandle) {
  if (!dirHandle) return;
  try {
    // Finish writing the campaign that is open now before switching away from it
    if (window.activeProjectDirectoryHandle && window.activeProjectDirectoryHandle !== dirHandle && typeof hasPendingDiskWrites === "function" && hasPendingDiskWrites()) {
      if (typeof flushProjectDirectoryNow === "function") await flushProjectDirectoryNow();
    }
    const canWrite = (typeof ensureDirWritePermission === "function") ? await ensureDirWritePermission(dirHandle, true) : true;

    const pkg = {
      id: dirHandle.name,
      name: dirHandle.name,
      sourceType: "folder",
      maps: {},
      entities: { npcs: [], quests: [], items: [], trackers: [], tickets: [] },
      globalDials: {},
      directoryHandle: dirHandle
    };
    window.activeProjectDirectoryHandle = dirHandle;
    window.activeProjectDirectoryName = dirHandle.name;
    let diskSyncToken = "";

    // 1. Read campaign.json
    try {
      const cFile = await dirHandle.getFileHandle("campaign.json");
      const cData = await (await cFile.getFile()).text();
      const parsed = JSON.parse(cData);
      pkg.id = parsed.id || dirHandle.name;
      pkg.name = parsed.name || parsed.campaignName || dirHandle.name;
      pkg.campaignName = pkg.name;
      if (parsed.description) pkg.description = parsed.description;
      diskSyncToken = parsed.syncToken || "";
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

    if (topoParsed) {
      if (topoParsed.maps && typeof topoParsed.maps === "object" && Object.keys(topoParsed.maps).length > 0) {
        pkg.maps = topoParsed.maps;
      } else if (topoParsed.nodes) {
        pkg.maps["map_root"] = {
          id: "map_root",
          name: topoParsed.name || pkg.name || "Root Map",
          scaleTier: "region",
          nodes: Array.isArray(topoParsed.nodes)
            ? topoParsed.nodes
            : Object.keys(topoParsed.nodes).map(k => {
                const nObj = topoParsed.nodes[k];
                const parsedNum = Number(k);
                const resolvedId = (nObj && nObj.id !== undefined) ? nObj.id : (!isNaN(parsedNum) ? parsedNum : k);
                return { ...nObj, id: resolvedId };
              }),
          links: topoParsed.links || [],
          waves: topoParsed.waves || []
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

      ['npcs', 'quests', 'items', 'trackers', 'tickets', 'custom_modules', 'deletedModules', 'deletedPrototypes'].forEach(cat => {
        if (!pkg.entities[cat] || pkg.entities[cat].length === 0) {
          if (candidateEntities && Array.isArray(candidateEntities[cat]) && candidateEntities[cat].length > 0) {
            pkg.entities[cat] = candidateEntities[cat];
          } else if (Array.isArray(topoParsed[cat]) && topoParsed[cat].length > 0) {
            pkg.entities[cat] = topoParsed[cat];
          }
        }
      });
      if (Array.isArray(pkg.entities.custom_modules)) pkg.custom_modules = pkg.entities.custom_modules;
      if (Array.isArray(pkg.entities.deletedModules)) pkg.deletedModules = pkg.entities.deletedModules;
      if (Array.isArray(pkg.entities.deletedPrototypes)) pkg.deletedPrototypes = pkg.entities.deletedPrototypes;
    }

    // 3. Hydrate raster images from assets/
    try {
      let assetsDir = null;
      try { assetsDir = await dirHandle.getDirectoryHandle("assets", { create: false }); } catch(_) {}
      if (!assetsDir) {
        try { assetsDir = await dirHandle.getDirectoryHandle("Assets", { create: false }); } catch(_) {}
      }
      if (assetsDir) {
        for (const mId of Object.keys(pkg.maps)) {
          const mMap = pkg.maps[mId];
          if (!mMap) continue;
          const candidateFiles = [];
          if (mMap.mapMetadata) {
            if (mMap.mapMetadata.assetPath) {
              candidateFiles.push(String(mMap.mapMetadata.assetPath).replace(/\\/g, "/").split("/").pop());
            }
            if (mMap.mapMetadata.name) {
              candidateFiles.push(String(mMap.mapMetadata.name).replace(/\\/g, "/").split("/").pop());
            }
          }
          candidateFiles.push(
            `${mId}_bg.png`, `${mId}_bg.jpg`, `${mId}_bg.jpeg`, `${mId}_bg.webp`,
            `${mId}.png`, `${mId}.jpg`, `${mId}.jpeg`, `${mId}.webp`
          );
          if (mId === "map_root") {
            candidateFiles.push("map_root_bg.png", "map_root_bg.jpg", "map_root_bg.jpeg", "map_root_bg.webp", "bg.png", "bg.jpg", "map.png", "map.jpg");
          }

          let loadedDUrl = null;
          let matchedName = null;

          for (const fileName of candidateFiles) {
            if (!fileName) continue;
            try {
              const imgFile = await assetsDir.getFileHandle(fileName, { create: false });
              const blob = await imgFile.getFile();
              const dUrl = (typeof blobToDataUrl === "function") ? await blobToDataUrl(blob) : null;
              if (dUrl) {
                loadedDUrl = dUrl;
                matchedName = fileName;
                break;
              }
            } catch(imgErr) {}
          }

          // Fallback: If not found by candidate filenames, scan entries in assetsDir
          if (!loadedDUrl && typeof assetsDir.entries === "function") {
            try {
              for await (const [fName, fHandle] of assetsDir.entries()) {
                if (fHandle.kind === "file" && /\.(png|jpe?g|webp|gif|svg)$/i.test(fName)) {
                  if (fName.toLowerCase().includes(mId.toLowerCase()) || (mId === "map_root" && (fName.toLowerCase().includes("root") || fName.toLowerCase().includes("map") || Object.keys(pkg.maps).length === 1))) {
                    try {
                      const blob = await fHandle.getFile();
                      const dUrl = (typeof blobToDataUrl === "function") ? await blobToDataUrl(blob) : null;
                      if (dUrl) {
                        loadedDUrl = dUrl;
                        matchedName = fName;
                        break;
                      }
                    } catch(_) {}
                  }
                }
              }
            } catch(_) {}
          }

          if (loadedDUrl) {
            if (!mMap.mapMetadata) {
              mMap.mapMetadata = { name: matchedName, width: 1920, height: 1080, opacity: 0.85 };
            }
            mMap.mapMetadata.assetPath = `assets/${matchedName}`;
            mMap.mapMetadata.dataUrl = loadedDUrl;
            mMap.mapMetadata.url = loadedDUrl;
            if (typeof saveMapImageToDB === "function") {
              await saveMapImageToDB(mMap.mapMetadata.name || matchedName, loadedDUrl, mMap.mapMetadata.width || 1920, mMap.mapMetadata.height || 1080, mMap.mapMetadata.opacity ?? 0.85, mId);
            }
          }
        }
      }
    } catch(e) {
      console.warn("[LoadCampaignFolder] Error hydrating assets from folder:", e);
    }

    // 4. Live Scan Modules from modules/ Directory Handle
    try {
      const diskModules = await scanCampaignModulesFromDirectoryHandle(dirHandle, pkg.id, pkg.name, pkg.entities.deletedModules || []);
      if (diskModules && diskModules.length > 0) {
        window.lastScannedDiskModulesForActiveDir = diskModules;
        syncDiskModulesIntoRuntimeCatalog(diskModules, pkg.id);
      }
    } catch(modScanErr) {
      console.warn("[loadCampaignFromDirectoryHandle] Module scan notice:", modScanErr);
    }

    if (typeof window.loadCampaignProjectPackage === "function") {
      window.__csSuppressDiskSync = true;
      try {
        await window.loadCampaignProjectPackage(pkg);
      } finally {
        window.__csSuppressDiskSync = false;
      }
    }
    if (typeof window.Workstation !== "undefined" && window.Workstation.activeTopology && pkg.description) {
      window.Workstation.activeTopology.description = pkg.description;
    }

    // Refresh Module Explorer if open or initialized
    if (typeof filterModules === "function" && document.getElementById("me-table-body")) {
      try { filterModules(typeof SelectedModuleId !== "undefined" ? SelectedModuleId : null); } catch(_) {}
    }

    if (canWrite) {
      if (typeof setProjectDirectoryDirty === "function") setProjectDirectoryDirty(false);
      if (typeof bindProjectDirectory === "function") {
        await bindProjectDirectory(dirHandle, { syncToken: diskSyncToken });
      } else {
        window.activeProjectDirectoryHandle = dirHandle;
        window.activeProjectDirectoryName = dirHandle.name;
      }
    } else {
      window.pendingProjectDirectoryHandle = dirHandle;
      if (typeof updateDiskSyncIndicator === "function") updateDiskSyncIndicator("reconnect");
    }

    if (typeof closeModal === "function") closeModal("modal-load");
    if (typeof closeModal === "function") closeModal("modal-welcome");
    setStatusBarMessage(canWrite
      ? `Opened campaign "${pkg.name}" from folder "${dirHandle.name}". Changes save directly to this folder.`
      : `Opened campaign "${pkg.name}" read-only (write access to "${dirHandle.name}" not granted). Click Reconnect in status bar to enable saving.`);
  } catch(err) {
    console.error("[LoadCampaignFolder]", err);
    alert("Failed to load campaign from folder: " + err.message);
  }
}
window.loadCampaignFromDirectoryHandle = loadCampaignFromDirectoryHandle;

/**
 * Delete a campaign folder directly from disk
 */
async function deleteCampaignFromDisk(folderName) {
  const rootHandle = window.campaignsRootDirectoryHandle || (await getStoredCampaignsFolderHandle());
  if (!rootHandle) {
    alert("Campaigns folder is not linked.");
    return false;
  }
  const perm = await rootHandle.queryPermission({ mode: "readwrite" });
  if (perm !== "granted") {
    const req = await rootHandle.requestPermission({ mode: "readwrite" });
    if (req !== "granted") {
      alert("Permission to write to the campaigns folder was denied.");
      return false;
    }
  }
  try {
    await rootHandle.removeEntry(folderName, { recursive: true });
    if (window.activeProjectDirectoryName === folderName) {
      window.activeProjectDirectoryHandle = null;
      window.activeProjectDirectoryName = null;
    }
    delete (window.discoveredDiskCampaigns || {})[folderName];
    if (typeof refreshCampaignsManager === "function") {
      await refreshCampaignsManager(false);
    }
    return true;
  } catch(err) {
    console.error("[DeleteCampaignDisk]", err);
    alert("Failed to delete campaign folder: " + err.message);
    return false;
  }
}
window.deleteCampaignFromDisk = deleteCampaignFromDisk;

/**
 * Save active session as a new campaign (to disk folder, library, or zip)
 */
/**
 * Save As Campaign Folder (Disk / USB)...
 * Prompts user to select or create any folder on disk or USB drive.
 * Fully populates it with all files that would be in the "export campaign package zip"
 * (campaign.json, topology.json, preset.json, modules_manifest.json, modules/*.md, assets/*),
 * and binds it as active project directory handle so every subsequent change saves directly to it.
 */
async function saveCampaignAsFolder(promptName = null) {
  if (typeof closeAllMenus === "function") closeAllMenus();
  if (!window.showDirectoryPicker) {
    alert("Saving directly to a folder is supported in Chromium-based browsers (Chrome, Edge, Opera).\n\nIn this browser, use 'Export Campaign Package (.zip)' to save to disk.");
    return false;
  }
  const picked = await pickReadWriteDirectory();
  if (!picked) return false;

  const curName = promptName || (typeof currentCampaignName !== "undefined" && currentCampaignName)
    || (window.Workstation && window.Workstation.activeTopology && window.Workstation.activeTopology.name) || "campaign";
  const slug = slugifyCampaignName(curName);
  const target = await resolveCampaignTargetFolder(picked, slug);
  if (!target || !target.handle) return false;

  if (target.existing) {
    const existingName = target.existing.name || target.existing.campaignName || target.handle.name;
    const ok = confirm(`Folder "${target.handle.name}" already contains campaign "${existingName}".\n\nOverwrite this folder with the current campaign?`);
    if (!ok) return false;
  }

  // Update campaign name if default
  if (typeof Workstation !== "undefined" && Workstation.activeTopology) {
    if (!Workstation.activeTopology.name || Workstation.activeTopology.name === "campaign") {
      Workstation.activeTopology.name = target.handle.name;
    }
    if (typeof currentCampaignName !== "undefined") currentCampaignName = Workstation.activeTopology.name;
  }

  await bindProjectDirectory(target.handle);
  setProjectDirectoryDirty(true);
  const ok = await flushProjectDirectoryNow({ interactive: true });
  if (ok) {
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Campaign saved & bound to folder: "${target.handle.name}". Changes will save directly here.`);
    }
    if (typeof refreshCampaignsManager === "function") refreshCampaignsManager(false);
    return true;
  }
  return false;
}
window.saveCampaignAsFolder = saveCampaignAsFolder;

/**
 * Save active session as a new campaign (to disk folder, library, or zip)
 */
async function saveActiveCampaignAsNew(name, slug, description = "", targetMode = "disk", chosenDirHandle = null) {
  if (!name) name = "Untitled Campaign";
  if (!slug) slug = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

  // Sync state
  if (typeof syncAdapterFromWorkstationTopology === "function") syncAdapterFromWorkstationTopology();
  if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();

  if (typeof currentCampaignName !== "undefined") currentCampaignName = name;
  if (typeof Workstation !== "undefined" && Workstation.activeTopology) {
    Workstation.activeTopology.name = name;
  }

  try { localStorage.setItem("cs_last_save_dest", targetMode); } catch(_) {}

  if (targetMode === "custom_folder") {
    return await saveCampaignAsFolder(name);
  }

  // Update in-memory campaign identity
  if (typeof Workstation !== "undefined" && Workstation.activeTopology) {
    Workstation.activeTopology.name = name;
    Workstation.activeTopology.id = slug;
  }
  if (typeof currentCampaignName !== "undefined") {
    currentCampaignName = name;
  }
  if (typeof activeCampaignId !== "undefined") {
    activeCampaignId = slug;
  }

  let savedOnDisk = false;
  let boundSubDirHandle = null;

  if (chosenDirHandle) {
    try {
      await bindProjectDirectory(chosenDirHandle);
      await writeCampaignToProjectDirectory(chosenDirHandle);
      savedOnDisk = true;
      boundSubDirHandle = chosenDirHandle;
      setProjectDirectoryDirty(false);
      updateDiskSyncIndicator("synced");
    } catch(dirErr) {
      console.warn("[SaveAsNew] Disk write notice:", dirErr);
    }
  } else if (targetMode === "disk" || targetMode === "both") {
    // 1. Resolve /campaigns root directory handle
    let rootHandle = window.campaignsRootDirectoryHandle;
    if (!rootHandle && typeof getStoredCampaignsFolderHandle === "function") {
      try {
        rootHandle = await getStoredCampaignsFolderHandle();
        if (rootHandle) window.campaignsRootDirectoryHandle = rootHandle;
      } catch(_) {}
    }

    // 2. If not yet linked, prompt author to connect the campaigns folder (without auto-loading existing campaigns)
    if (!rootHandle && typeof connectCampaignsFolder === "function") {
      try {
        rootHandle = await connectCampaignsFolder({ autoLoad: false });
      } catch(_) {}
    }

    // 3. If rootHandle is available, get or create the subfolder /campaigns/<slug> and bind live disk sync
    if (rootHandle) {
      let perm = "prompt";
      try { perm = await rootHandle.queryPermission({ mode: "readwrite" }); } catch(_) {}
      if (perm !== "granted") {
        try { perm = await rootHandle.requestPermission({ mode: "readwrite" }); } catch(_) {}
      }
      if (perm === "granted") {
        try {
          let subDir = null;

          // Guard against recursive nesting: Check if rootHandle is itself already a direct single-campaign directory
          let isSingleCampaignFolder = false;
          if (typeof dirLooksLikeCampaign === "function") {
            try { isSingleCampaignFolder = await dirLooksLikeCampaign(rootHandle); } catch(_) {}
          } else {
            try {
              const cF = await rootHandle.getFileHandle("campaign.json");
              if (cF) isSingleCampaignFolder = true;
            } catch(_) {}
          }

          const rootSlug = (typeof slugifyCampaignName === "function") 
            ? slugifyCampaignName(rootHandle.name) 
            : rootHandle.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

          if (isSingleCampaignFolder) {
            // Case A: The selected folder IS the target campaign folder (e.g. "Emerald Isle" for slug "emerald_isle")
            if (rootSlug === slug) {
              subDir = rootHandle;
            } else {
              // Case B: The author selected a different single campaign folder (e.g. "Emerald Isle" when saving "Silver Peaks")
              const confirmFn = (typeof window !== "undefined" && typeof window.confirm === "function") ? window.confirm : (() => true);
              const ok = confirmFn(`The selected folder "${rootHandle.name}" appears to be an existing single campaign rather than the "/campaigns" container.\n\nSave "${slug}" directly into this folder? (Cancel to abort without nesting)`);
              if (!ok) return false;
              subDir = rootHandle;
            }
          } else {
            // Case C: rootHandle is the container (/campaigns), get or create the child campaign folder
            try {
              subDir = await rootHandle.getDirectoryHandle(slug, { create: false });
            } catch(_) {}

            if (subDir) {
              const looksLike = (typeof dirLooksLikeCampaign === "function") ? await dirLooksLikeCampaign(subDir) : false;
              if (looksLike) {
                const confirmFn = (typeof window !== "undefined" && typeof window.confirm === "function") ? window.confirm : (() => true);
                const ok = confirmFn(`Folder "/campaigns/${slug}" already exists and contains campaign files.\n\nOverwrite this campaign on disk and bind live disk sync?`);
                if (!ok) return false;
              }
            } else {
              subDir = await rootHandle.getDirectoryHandle(slug, { create: true });
            }
          }

          if (subDir) {
            await bindProjectDirectory(subDir);
            await writeCampaignToProjectDirectory(subDir);
            savedOnDisk = true;
            boundSubDirHandle = subDir;
            setProjectDirectoryDirty(false);
            updateDiskSyncIndicator("synced");
          }
        } catch(dirErr) {
          console.warn("[SaveAsNew] Disk write error under campaigns folder:", dirErr);
          if (typeof window !== "undefined" && typeof window.alert === "function") {
            window.alert("Could not write campaign to /campaigns/" + slug + ": " + (dirErr.message || dirErr));
          }
        }
      }
    }

    // 4. Fallback if campaigns root was not linked: prompt user to pick folder directly
    if (!savedOnDisk && !rootHandle && typeof pickReadWriteDirectory === "function") {
      try {
        const picked = await pickReadWriteDirectory();
        if (picked) {
          const target = await resolveCampaignTargetFolder(picked, slug);
          if (target && target.handle) {
            await bindProjectDirectory(target.handle);
            await writeCampaignToProjectDirectory(target.handle);
            savedOnDisk = true;
            boundSubDirHandle = target.handle;
            setProjectDirectoryDirty(false);
            updateDiskSyncIndicator("synced");
          }
        }
      } catch(pickErr) {
        console.warn("[SaveAsNew] Pick directory fallback notice:", pickErr);
      }
    }
  }

  // Only persist in IndexedDB campaign library when explicitly requested (targetMode === "library" or "both")
  // or as fallback if disk write was not performed, avoiding shadow IndexedDB copies of live disk campaigns.
  if (targetMode === "library" || targetMode === "both" || (!savedOnDisk && targetMode !== "zip")) {
    const activeTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) ? Workstation.activeTopology : {};
    const hydratedMaps = await hydrateMapsWithImageDataUrls(typeof maps !== "undefined" ? maps : {});
    const pkg = {
      id: slug,
      name: name,
      campaignName: name,
      description: description || "Authored in Creator Studio Pointcrawl Workstation",
      maps: hydratedMaps,
      entities: {
        npcs: (activeTopo.npcs) ? JSON.parse(JSON.stringify(activeTopo.npcs)) : [],
        quests: (activeTopo.quests) ? JSON.parse(JSON.stringify(activeTopo.quests)) : [],
        items: (activeTopo.items) ? JSON.parse(JSON.stringify(activeTopo.items)) : [],
        trackers: (activeTopo.trackers) ? JSON.parse(JSON.stringify(activeTopo.trackers)) : [],
        tickets: (activeTopo.tickets) ? JSON.parse(JSON.stringify(activeTopo.tickets)) : [],
        custom_modules: (activeTopo.custom_modules) ? JSON.parse(JSON.stringify(activeTopo.custom_modules)) : [],
        deletedModules: (activeTopo.deletedModules) ? JSON.parse(JSON.stringify(activeTopo.deletedModules)) : [],
        deletedPrototypes: (activeTopo.deletedPrototypes) ? JSON.parse(JSON.stringify(activeTopo.deletedPrototypes)) : []
      },
      globalDials: {
        dial8ClimaxTrigger: (typeof dial8ClimaxTriggerMode !== "undefined" ? dial8ClimaxTriggerMode : "crisis"),
        tier0Substratum: typeof tier0SubstratumEnabled !== "undefined" ? tier0SubstratumEnabled : true
      },
      sourceType: savedOnDisk ? "disk_folder" : "library",
      updatedAt: new Date().toISOString()
    };
    await saveCampaignToIndexedDBLibrary(pkg);
  } else if (savedOnDisk && typeof deleteCampaignFromIndexedDBLibrary === "function") {
    try { await deleteCampaignFromIndexedDBLibrary(slug); } catch(_) {}
  }

  if (targetMode === "zip") {
    if (typeof saveCampaignAsZip === "function") await saveCampaignAsZip();
  }

  if (typeof refreshCampaignsManager === "function") {
    await refreshCampaignsManager(false);
  }

  if (savedOnDisk) {
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Campaign saved as new: "${name}" (/campaigns/${slug}/) with live disk sync bound.`);
    }
  } else {
    if (typeof setStatusBarMessage === "function") {
      setStatusBarMessage(`Campaign saved as new: "${name}" to in-browser library (live disk sync not bound).`);
    }
  }
  return true;
}
window.saveActiveCampaignAsNew = saveActiveCampaignAsNew;
