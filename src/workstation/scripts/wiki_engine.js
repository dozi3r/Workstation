// ============================================================================
// CREATOR STUDIO: BIDIRECTIONAL WIKI & CITATION ENGINE (ZERO-CORS OFFLINE)
// ============================================================================
// Provides reactive cross-linking, inverted backlink indexing, @mentions,
// [[wikilinks]], hover preview cards, and deep cartographic navigation.

// Global Inverted Backlink Index
// Schema: { [targetKey: string]: Array<{ sourceType, sourceId, sourceName, mapId, field, snippet }> }
let wikiIndex = {};
let activeAutocompleteContext = null;

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

// Registry of supported and mod-extended wiki token types (ADR-0015 v2)
const WIKI_TOKEN_TYPES = {
  node: { label: "Node", icon: "📍" },
  map: { label: "Map", icon: "🗺️" },
  mod: { label: "Module", icon: "📦" },
  faction: { label: "Faction", icon: "🚩" },
  corridor: { label: "Corridor", icon: "🛤️" },
  npc: { label: "NPC", icon: "👤" },
  item: { label: "Item", icon: "🗡️" },
  quest: { label: "Quest", icon: "📜" },
  tracker: { label: "Tracker", icon: "⏱️" }
};

// Entity scale icons
const WIKI_ICONS = {
  node: "📍",
  map: "🗺️",
  module: "📦",
  mod: "📦",
  faction: "🚩",
  corridor: "🛤️",
  npc: "👤",
  item: "🗡️",
  quest: "📜",
  tracker: "⏱️"
};

function buildWikiBracketRegex() {
  const types = Object.keys(WIKI_TOKEN_TYPES);
  if (!types.includes("module")) types.push("module");
  const pattern = types.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(`\\[\\[(${pattern}):([^\\]]+)\\]\\]`, "gi");
}

window.CreatorStudio = window.CreatorStudio || {};
window.CreatorStudio.registerWikiTokenType = function(spec) {
  if (!spec || !spec.type) return;
  const tKey = spec.type.toLowerCase().trim();
  WIKI_TOKEN_TYPES[tKey] = {
    label: spec.label || spec.type,
    icon: spec.icon || "🔗",
    resolve: typeof spec.resolve === "function" ? spec.resolve : null,
    navigate: typeof spec.navigate === "function" ? spec.navigate : null,
    hovercard: typeof spec.hovercard === "function" ? spec.hovercard : null,
    getSuggestions: typeof spec.getSuggestions === "function" ? spec.getSuggestions : null
  };
  WIKI_ICONS[tKey] = spec.icon || "🔗";
};

/**
 * Initialize the Wiki Engine and inject floating UI containers into DOM
 */
function initWikiEngine() {
  ensureWikiHovercardElement();
  ensureWikiAutocompleteElement();
  buildWikiIndex();
  console.log("[WikiEngine] Initialized offline bidirectional wiki engine.");
}

/**
 * Ensures floating hovercard container exists in DOM
 */
function ensureWikiHovercardElement() {
  if (document.getElementById("wiki-hovercard")) return;
  const card = document.createElement("div");
  card.id = "wiki-hovercard";
  card.className = "fixed z-[100] hidden pointer-events-none";
  card.style.position = "fixed";
  card.style.zIndex = "1000";
  card.style.background = "#ffffd0";
  card.style.color = "#000000";
  card.style.border = "1px solid #808080";
  card.style.boxShadow = "2px 2px 4px rgba(0,0,0,0.3)";
  card.style.padding = "6px 8px";
  card.style.fontSize = "11px";
  card.style.maxWidth = "280px";
  card.style.fontFamily = "'Tahoma', 'MS Sans Serif', sans-serif";
  card.style.top = "0px";
  card.style.left = "0px";
  document.body.appendChild(card);
}

/**
 * Ensures floating autocomplete popover exists in DOM
 */
function ensureWikiAutocompleteElement() {
  if (document.getElementById("wiki-autocomplete-dropdown")) return;
  const drop = document.createElement("div");
  drop.id = "wiki-autocomplete-dropdown";
  drop.className = "fixed z-[110] hidden";
  drop.style.position = "fixed";
  drop.style.zIndex = "1010";
  drop.style.background = "#ffffff";
  drop.style.color = "#000000";
  drop.style.border = "2px outset #dfdfdf";
  drop.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.35)";
  drop.style.padding = "4px";
  drop.style.fontSize = "11px";
  drop.style.maxHeight = "200px";
  drop.style.overflowY = "auto";
  drop.style.width = "260px";
  drop.style.fontFamily = "'Tahoma', 'MS Sans Serif', sans-serif";
  drop.style.top = "0px";
  drop.style.left = "0px";
  document.body.appendChild(drop);

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!drop.contains(e.target) && (!activeAutocompleteContext || e.target !== activeAutocompleteContext.textarea)) {
      closeWikiAutocomplete();
    }
  });
}

/**
 * Build or rebuild the reactive inverted backlink index across the campaign
 */
function buildWikiIndex() {
  if (typeof syncActiveMapToRegistry === "function") syncActiveMapToRegistry();
  const newIndex = {};

  function addLink(targetKey, sourceMeta) {
    if (!targetKey) return;
    const cleanKey = targetKey.toLowerCase().trim();
    if (!newIndex[cleanKey]) newIndex[cleanKey] = [];
    // Deduplicate by sourceId + field
    const exists = newIndex[cleanKey].some(s => s.sourceId === sourceMeta.sourceId && s.field === sourceMeta.field && s.mapId === sourceMeta.mapId);
    if (!exists) {
      newIndex[cleanKey].push(sourceMeta);
    }
  }

  // 1. Scan Maps Registry (or current map if flat)
  const mapList = (typeof maps !== "undefined" && maps && Object.keys(maps).length > 0)
    ? Object.values(maps)
    : [{
        id: (typeof activeMapId !== "undefined" ? activeMapId : "map_root"),
        name: (typeof currentCampaignName !== "undefined" ? currentCampaignName : "Active Map"),
        nodes: (typeof nodes !== "undefined" ? nodes : []),
        links: (typeof links !== "undefined" ? links : []),
        customNotes: ""
      }];

  mapList.forEach(m => {
    const curMapId = m.id || "map_root";

    // Scan Map notes
    if (m.customNotes) {
      extractTokensFromText(m.customNotes).forEach(t => {
        addLink(t.key, {
          sourceType: "map",
          sourceId: m.id,
          sourceName: m.name || m.id,
          mapId: curMapId,
          field: "notes",
          snippet: createSnippet(m.customNotes, t.raw)
        });
      });
    }

    // Scan Nodes
    (m.nodes || []).forEach(n => {
      const nodeTitle = n.name || (typeof getNodeDisplayName === "function" ? getNodeDisplayName(n) : `#${n.id}`);

      // Scan node custom notes
      if (n.customNotes) {
        extractTokensFromText(n.customNotes).forEach(t => {
          addLink(t.key, {
            sourceType: "node",
            sourceId: n.id,
            sourceName: nodeTitle,
            mapId: curMapId,
            field: "notes",
            snippet: createSnippet(n.customNotes, t.raw)
          });
        });
      }

      // Scan node category / description if any
      if (n.cat) {
        extractTokensFromText(n.cat).forEach(t => {
          addLink(t.key, {
            sourceType: "node",
            sourceId: n.id,
            sourceName: nodeTitle,
            mapId: curMapId,
            field: "category",
            snippet: createSnippet(n.cat, t.raw)
          });
        });
      }
    });

    // Scan Links / Corridors
    (m.links || []).forEach(l => {
      const edgeKey = `${l.from}-${l.to}`;
      if (l.customNotes) {
        extractTokensFromText(l.customNotes).forEach(t => {
          addLink(t.key, {
            sourceType: "corridor",
            sourceId: edgeKey,
            sourceName: `Corridor ${edgeKey}`,
            mapId: curMapId,
            field: "notes",
            snippet: createSnippet(l.customNotes, t.raw)
          });
        });
      }
      if (l.scenarioPrompt) {
        extractTokensFromText(l.scenarioPrompt).forEach(t => {
          addLink(t.key, {
            sourceType: "corridor",
            sourceId: edgeKey,
            sourceName: `Corridor ${edgeKey}`,
            mapId: curMapId,
            field: "scenario",
            snippet: createSnippet(l.scenarioPrompt, t.raw)
          });
        });
      }
    });
  });

  // 2. Scan Slotted Modules in Active Campaign
  if (typeof nodeSlottedModules !== "undefined" && nodeSlottedModules && typeof MODULES_MANIFEST !== "undefined") {
    Object.keys(nodeSlottedModules).forEach(nid => {
      const rawMods = nodeSlottedModules[nid];
      const sMods = Array.isArray(rawMods) ? rawMods : (rawMods && typeof rawMods === "object" ? Object.values(rawMods).filter(Boolean) : []);
      sMods.forEach(mid => {
        const mod = MODULES_MANIFEST.find(m => m.id === mid);
        if (mod && mod.description) {
          extractTokensFromText(mod.description).forEach(t => {
            addLink(t.key, {
              sourceType: "module",
              sourceId: mod.id,
              sourceName: mod.title || mod.id,
              mapId: (typeof activeMapId !== "undefined" ? activeMapId : "map_root"),
              field: "description",
              snippet: createSnippet(mod.description, t.raw)
            });
          });
        }
      });
    });
  }

  // 3. Scan Active Campaign Entities (NPCs, Items, Quests, Trackers - ADR-0015 v2)
  const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
  const rootMapId = (typeof activeMapId !== "undefined" ? activeMapId : "map_root");

  (currentTopo.npcs || []).forEach(npc => {
    const npcNotes = [npc.customNotes, npc.description, npc.notes, npc.role, npc.motivation].filter(Boolean).join(" ");
    if (npcNotes) {
      extractTokensFromText(npcNotes).forEach(t => {
        addLink(t.key, {
          sourceType: "npc",
          sourceId: npc.id,
          sourceName: npc.name || `NPC #${npc.id}`,
          mapId: rootMapId,
          field: "notes",
          snippet: createSnippet(npcNotes, t.raw)
        });
      });
    }
  });

  (currentTopo.items || []).forEach(item => {
    const itemNotes = [item.customNotes, item.description, item.specs].filter(Boolean).join(" ");
    if (itemNotes) {
      extractTokensFromText(itemNotes).forEach(t => {
        addLink(t.key, {
          sourceType: "item",
          sourceId: item.id,
          sourceName: item.name || `Item #${item.id}`,
          mapId: rootMapId,
          field: "notes",
          snippet: createSnippet(itemNotes, t.raw)
        });
      });
    }
  });

  (currentTopo.quests || []).forEach(quest => {
    const questNotes = [quest.customNotes, quest.description, quest.stakes, quest.summary].filter(Boolean).join(" ");
    if (questNotes) {
      extractTokensFromText(questNotes).forEach(t => {
        addLink(t.key, {
          sourceType: "quest",
          sourceId: quest.id,
          sourceName: quest.title || quest.name || `Quest #${quest.id}`,
          mapId: rootMapId,
          field: "notes",
          snippet: createSnippet(questNotes, t.raw)
        });
      });
    }
  });

  (currentTopo.trackers || []).forEach(tr => {
    const trNotes = [tr.customNotes, tr.description].filter(Boolean).join(" ");
    if (trNotes) {
      extractTokensFromText(trNotes).forEach(t => {
        addLink(t.key, {
          sourceType: "tracker",
          sourceId: tr.id,
          sourceName: tr.name || tr.title || `Tracker #${tr.id}`,
          mapId: rootMapId,
          field: "notes",
          snippet: createSnippet(trNotes, t.raw)
        });
      });
    }
  });

  wikiIndex = newIndex;
  return wikiIndex;
}

/**
 * Extracts mention tokens and wikilinks from raw text
 * Supported:
 * [[Node:12]], [[Node:mapId/12]], [[Node:Name]]
 * [[Map:mapId]], [[Map:Name]]
 * [[Mod:SET_A_01]]
 * [[Faction:concord]]
 * @EntityName
 */
function extractTokensFromText(text) {
  if (!text || typeof text !== "string") return [];
  const tokens = [];

  // 1. Explicit [[Type:Value]] tokens based on registered WIKI_TOKEN_TYPES (ADR-0015 v2)
  const bracketRegex = buildWikiBracketRegex();
  let match;
  while ((match = bracketRegex.exec(text)) !== null) {
    const rawType = match[1].toLowerCase();
    const type = (rawType === "module") ? "mod" : rawType;
    const val = match[2].trim();
    tokens.push({
      type: type,
      value: val,
      key: `${type}:${val.toLowerCase()}`,
      raw: match[0]
    });
  }

  // 2. Natural @mentions (@Word or @"Multi Word Entity")
  const atRegex = /@("([^"]+)"|([a-zA-Z0-9_\-]{2,30}))/g;
  while ((match = atRegex.exec(text)) !== null) {
    const name = (match[2] || match[3] || "").trim();
    if (name) {
      tokens.push({
        type: "mention",
        value: name,
        key: `name:${name.toLowerCase()}`,
        raw: match[0]
      });
    }
  }

  return tokens;
}

/**
 * Helper to generate a contextual snippet around a matched token
 */
function createSnippet(fullText, tokenRaw) {
  if (!fullText) return "";
  const idx = fullText.indexOf(tokenRaw);
  if (idx === -1) return fullText.slice(0, 100);
  const start = Math.max(0, idx - 30);
  const end = Math.min(fullText.length, idx + tokenRaw.length + 30);
  let snippet = fullText.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < fullText.length) snippet = snippet + "...";
  return snippet;
}

/**
 * Returns all inbound backlinks for a given entity
 */
function getBacklinksForEntity(type, id, mapId = null, options = {}) {
  if (!options || !options.skipRebuild) {
    buildWikiIndex(); // ensure index is fresh
  }
  const results = [];
  const cleanId = String(id).toLowerCase();

  // Primary key search: e.g. "node:1" or "node:map_root/1"
  const keysToTest = [
    `${type}:${cleanId}`,
    mapId ? `${type}:${mapId.toLowerCase()}/${cleanId}` : null
  ].filter(Boolean);

  const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};

  // Resolve display name for entity (ADR-0015 v2)
  let entityName = null;
  if (type === "node" && typeof getNode === "function") {
    const n = getNode(parseInt(id));
    if (n && n.name) entityName = n.name.toLowerCase();
  } else if (type === "map" && typeof maps !== "undefined" && maps[id]) {
    entityName = (maps[id].name || id).toLowerCase();
  } else if (type === "faction" && typeof campaignFactions !== "undefined") {
    const f = campaignFactions.find(fac => fac.id === id);
    if (f && f.name) entityName = f.name.toLowerCase();
  } else if (type === "npc" && currentTopo.npcs) {
    const npc = currentTopo.npcs.find(n => String(n.id) === cleanId || String(n.prototypeId) === cleanId || (n.name && n.name.toLowerCase() === cleanId));
    if (npc && npc.name) entityName = npc.name.toLowerCase();
  } else if (type === "item" && currentTopo.items) {
    const it = currentTopo.items.find(i => String(i.id) === cleanId || String(i.prototypeId) === cleanId || (i.name && i.name.toLowerCase() === cleanId));
    if (it && it.name) entityName = it.name.toLowerCase();
  } else if (type === "quest" && currentTopo.quests) {
    const q = currentTopo.quests.find(x => String(x.id) === cleanId || String(x.prototypeId) === cleanId);
    if (q && (q.title || q.name)) entityName = (q.title || q.name).toLowerCase();
  } else if (type === "tracker" && currentTopo.trackers) {
    const tr = currentTopo.trackers.find(t => String(t.id) === cleanId || String(t.prototypeId) === cleanId);
    if (tr && (tr.name || tr.title)) entityName = (tr.name || tr.title).toLowerCase();
  }

  if (entityName) {
    keysToTest.push(`name:${entityName}`);
    keysToTest.push(`${type}:${entityName}`);
  }

  keysToTest.forEach(k => {
    if (wikiIndex[k] && Array.isArray(wikiIndex[k])) {
      wikiIndex[k].forEach(item => {
        if (!results.some(r => r.sourceId === item.sourceId && r.field === item.field && r.mapId === item.mapId)) {
          results.push(item);
        }
      });
    }
  });

  return results;
}

/**
 * Transitive Backlink Aggregation for Scale-Fluid Portal Nodes (ADR-0015 v2)
 * Reuses getRecursiveNodeEntities() to crawl direct and nested citations
 */
function getNestedBacklinksForNode(nodeId, mapId) {
  buildWikiIndex(); // Rebuild once for the entire transitive search
  const targetMapId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  const results = [];
  const seenKeys = new Set();

  function pushHit(hit, isNested, traversalPath) {
    const dedupKey = `${hit.sourceType}|${hit.sourceId}|${hit.field}|${hit.mapId}`;
    if (hit.sourceType === "node" && String(hit.sourceId) === String(nodeId) && hit.mapId === targetMapId) {
      return; // Skip self-citations
    }
    if (!seenKeys.has(dedupKey)) {
      seenKeys.add(dedupKey);
      results.push({
        ...hit,
        isNested: !!isNested,
        traversalPath: traversalPath || []
      });
    }
  }

  // 1. Direct citations of the queried node
  const directNodeHits = getBacklinksForEntity("node", nodeId, targetMapId, { skipRebuild: true });
  directNodeHits.forEach(h => pushHit(h, false, []));

  // 2. Direct entities stationed on this node
  const rec = (typeof getRecursiveNodeEntities === "function")
    ? getRecursiveNodeEntities(nodeId, targetMapId)
    : { direct: { npcs: [], items: [], quests: [], trackers: [] }, submaps: [] };

  (rec.direct.npcs || []).forEach(ent => {
    const hits = getBacklinksForEntity("npc", ent.id, targetMapId, { skipRebuild: true });
    hits.forEach(h => pushHit(h, false, [ent.name || `NPC #${ent.id}`]));
  });
  (rec.direct.items || []).forEach(ent => {
    const hits = getBacklinksForEntity("item", ent.id, targetMapId, { skipRebuild: true });
    hits.forEach(h => pushHit(h, false, [ent.name || `Item #${ent.id}`]));
  });
  (rec.direct.quests || []).forEach(ent => {
    const hits = getBacklinksForEntity("quest", ent.id, targetMapId, { skipRebuild: true });
    hits.forEach(h => pushHit(h, false, [ent.title || ent.name || `Quest #${ent.id}`]));
  });
  (rec.direct.trackers || []).forEach(ent => {
    const hits = getBacklinksForEntity("tracker", ent.id, targetMapId, { skipRebuild: true });
    hits.forEach(h => pushHit(h, false, [ent.name || ent.title || `Tracker #${ent.id}`]));
  });

  // 3. Descendant submaps and their descendant nodes / stationed entities
  (rec.submaps || []).forEach(sm => {
    const smPath = Array.isArray(sm.path) && sm.path.length > 0 ? sm.path : [sm.mapName || sm.mapId];

    // Citations of the descendant submap itself
    const smHits = getBacklinksForEntity("map", sm.mapId, sm.mapId, { skipRebuild: true });
    smHits.forEach(h => pushHit(h, true, [...smPath]));

    // Citations of nodes inside descendant submap
    (sm.nodes || []).forEach(subNode => {
      const nodeTitle = subNode.name || (typeof getNodeDisplayName === "function" ? getNodeDisplayName(subNode) : `Node #${subNode.id}`);
      const nodeHits = getBacklinksForEntity("node", subNode.id, sm.mapId, { skipRebuild: true });
      nodeHits.forEach(h => pushHit(h, true, [...smPath, nodeTitle]));
    });

    // Citations of entities inside descendant submap
    (sm.npcs || []).forEach(ent => {
      const hits = getBacklinksForEntity("npc", ent.id, sm.mapId, { skipRebuild: true });
      const stationedNode = (sm.nodes || []).find(n => String(n.id) === String(ent.nodeId));
      const nodeTitle = stationedNode ? (stationedNode.name || `#${stationedNode.id}`) : `Node #${ent.nodeId}`;
      hits.forEach(h => pushHit(h, true, [...smPath, nodeTitle, ent.name || `NPC #${ent.id}`]));
    });
    (sm.items || []).forEach(ent => {
      const hits = getBacklinksForEntity("item", ent.id, sm.mapId, { skipRebuild: true });
      hits.forEach(h => pushHit(h, true, [...smPath, ent.name || `Item #${ent.id}`]));
    });
    (sm.quests || []).forEach(ent => {
      const hits = getBacklinksForEntity("quest", ent.id, sm.mapId, { skipRebuild: true });
      hits.forEach(h => pushHit(h, true, [...smPath, ent.title || ent.name || `Quest #${ent.id}`]));
    });
    (sm.trackers || []).forEach(ent => {
      const hits = getBacklinksForEntity("tracker", ent.id, sm.mapId, { skipRebuild: true });
      hits.forEach(h => pushHit(h, true, [...smPath, ent.name || ent.title || `Tracker #${ent.id}`]));
    });
  });

  return results;
}

/**
 * Renders raw text with interactive, clickable, hoverable wiki pills
 */
function renderWikiDecoratedText(rawText, currentMapId = null) {
  if (!rawText || typeof rawText !== "string") return "";

  const mapScope = currentMapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
  let html = rawText;

  // 1. Replace [[Type:Value]] tokens based on registered types (ADR-0015 v2)
  const bracketRegex = buildWikiBracketRegex();
  html = html.replace(bracketRegex, (match, rawType, rawVal) => {
    const type = (rawType.toLowerCase() === "module") ? "mod" : rawType.toLowerCase();
    const val = rawVal.trim();
    let displayTitle = val;
    let targetMapId = mapScope;
    let entityId = val;

    // Handle map-scoped node: e.g. "map_id/node_id"
    if (type === "node" && val.includes("/")) {
      const parts = val.split("/");
      targetMapId = parts[0];
      entityId = parts[1];
    }

    const regType = WIKI_TOKEN_TYPES[type];
    if (regType && typeof regType.resolve === "function") {
      try {
        const resolved = regType.resolve(entityId, targetMapId);
        if (resolved && resolved.title) displayTitle = resolved.title;
      } catch (e) {}
    } else if (type === "node" && typeof getNode === "function") {
      const n = getNode(parseInt(entityId));
      if (n && n.name) displayTitle = n.name;
    } else if (type === "map" && typeof maps !== "undefined" && maps[entityId]) {
      displayTitle = maps[entityId].name || entityId;
    } else if (type === "mod" && typeof MODULES_MANIFEST !== "undefined") {
      const m = MODULES_MANIFEST.find(mod => mod.id === entityId);
      if (m && m.title) displayTitle = `[${entityId}] ${m.title}`;
    } else if (type === "faction" && typeof campaignFactions !== "undefined") {
      const f = campaignFactions.find(fac => fac.id === entityId);
      if (f && f.name) displayTitle = f.name;
    }

    const icon = (regType && regType.icon) || WIKI_ICONS[type] || "🔗";
    return `<span class="wiki-pill wiki-pill-${type} inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 text-sky-200 cursor-pointer shadow-sm transition" 
      data-entity-type="${escapeAttr(type)}" 
      data-entity-id="${escapeAttr(entityId)}" 
      data-map-id="${escapeAttr(targetMapId)}" 
      onclick="navigateToWikiEntity('${escapeAttr(type)}', '${escapeAttr(entityId)}', '${escapeAttr(targetMapId)}', event)" 
      onmouseenter="showWikiHovercard(event, '${escapeAttr(type)}', '${escapeAttr(entityId)}', '${escapeAttr(targetMapId)}')" 
      onmouseleave="hideWikiHovercard()">
      <span>${icon}</span>
      <span class="underline decoration-sky-500/60">${escapeHtml(displayTitle)}</span>
    </span>`;
  });

  // 2. Replace @mentions
  html = html.replace(/@("([^"]+)"|([a-zA-Z0-9_\-]{2,30}))/g, (match, p1, p2, p3) => {
    const name = (p2 || p3 || "").trim();
    return `<span class="wiki-pill wiki-pill-mention inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-200 cursor-pointer shadow-sm transition" 
      data-entity-type="mention" 
      data-entity-name="${escapeAttr(name)}" 
      onclick="navigateToWikiMention('${escapeAttr(name)}', event)" 
      onmouseenter="showWikiHovercard(event, 'mention', '${escapeAttr(name)}', '${escapeAttr(mapScope)}')" 
      onmouseleave="hideWikiHovercard()">
      <span>@</span>
      <span class="underline decoration-indigo-500/60">${escapeHtml(name)}</span>
    </span>`;
  });

  return html;
}

/**
 * Display interactive hover preview popover
 */
function showWikiHovercard(event, type, id, mapId = null) {
  const card = document.getElementById("wiki-hovercard");
  if (!card) return;

  let title = `${type.toUpperCase()}: ${id}`;
  let badge = "Entity";
  let content = "No further details available.";
  let subBadge = "";

  if (type === "node") {
    const n = (typeof getNode === "function") ? (getNode(id) || getNode(parseInt(id))) : null;
    if (n) {
      title = n.name || `Node #${n.id}`;
      if (n.tier) subBadge = `<span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">${escapeHtml(String(n.tier))}</span>`;
      
      const rawSlotted = (typeof nodeSlottedModules !== "undefined" && nodeSlottedModules[n.id]) ? nodeSlottedModules[n.id] : [];
      const slotted = Array.isArray(rawSlotted) ? rawSlotted : (rawSlotted && typeof rawSlotted === "object" ? Object.values(rawSlotted).filter(Boolean) : []);
      const coordX = (n.coordinates && n.coordinates.x !== undefined) ? n.coordinates.x : (n.x !== undefined ? n.x : 0);
      const coordY = (n.coordinates && n.coordinates.y !== undefined) ? n.coordinates.y : (n.y !== undefined ? n.y : 0);
      content = `
        <div class="space-y-1">
          <div class="text-[11px] text-slate-300"><strong>Category:</strong> ${escapeHtml(n.cat || 'Bastion')}</div>
          <div class="text-[11px] text-slate-400"><strong>Coordinates:</strong> (${coordX}, ${coordY})</div>
          ${n.customNotes ? `<div class="text-[11px] text-slate-300 italic line-clamp-2 mt-1">"${escapeHtml(n.customNotes)}"</div>` : ''}
          ${slotted.length > 0 ? `<div class="text-[10px] text-emerald-400 font-bold mt-1">📦 ${slotted.length} Slotted Module(s)</div>` : ''}
          ${n.childMapId ? `<div class="text-[10px] text-sky-400 font-bold">🗺️ Has Attached Sub-Map</div>` : ''}
        </div>
      `;
    }
  } else if (type === "map") {
    if (typeof maps !== "undefined" && maps[id]) {
      const m = maps[id];
      title = m.name || id;
      badge = `Map &bull; Scale: ${(m.scaleTier || 'region').toUpperCase()}`;
      content = `
        <div class="space-y-1">
          <div class="text-[11px] text-slate-300">Nodes: ${(m.nodes || []).length} &bull; Corridors: ${(m.links || []).length}</div>
          ${m.customNotes ? `<div class="text-[11px] text-slate-300 italic line-clamp-2 mt-1">"${escapeHtml(m.customNotes)}"</div>` : ''}
        </div>
      `;
    }
  } else if (type === "mod") {
    if (typeof MODULES_MANIFEST !== "undefined") {
      const m = MODULES_MANIFEST.find(mod => mod.id === id);
      if (m) {
        title = m.title || id;
        badge = `Module &bull; Tier ${m.tier || 1}`;
        content = `
          <div class="space-y-1">
            <div class="text-[11px] text-slate-300 line-clamp-3">${escapeHtml(m.description || 'No description.')}</div>
            <div class="text-[10px] text-indigo-400 font-mono mt-1">Yields: ${(m.yields || []).map(escapeHtml).join(', ') || 'None'}</div>
          </div>
        `;
      }
    }
  } else if (type === "faction") {
    if (typeof campaignFactions !== "undefined") {
      const f = campaignFactions.find(fac => fac.id === id);
      if (f) {
        title = f.name;
        badge = `Faction &bull; ${escapeHtml(f.type || 'Power Group')}`;
        content = `<div class="text-[11px] text-slate-300 line-clamp-2">${escapeHtml(f.description || 'Campaign Faction.')}</div>`;
      }
    }
  } else if (type === "npc") {
    const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
    const n = (currentTopo.npcs || []).find(x => String(x.id) === String(id) || (x.name && x.name.toLowerCase() === String(id).toLowerCase()));
    if (n) {
      title = n.name || `NPC #${n.id}`;
      badge = `NPC &bull; ${escapeHtml(n.role || 'Campaign Entity')}`;
      content = `
        <div class="space-y-1">
          ${n.faction ? `<div class="text-[11px] text-slate-300"><strong>Faction:</strong> ${escapeHtml(n.faction)}</div>` : ''}
          ${n.dispositionToParty !== undefined ? `<div class="text-[10px] text-sky-400 font-bold">Party Standing: ${(typeof PARTY_STANCE_LABELS !== "undefined" ? PARTY_STANCE_LABELS[String(n.dispositionToParty)] : n.dispositionToParty)}</div>` : ''}
          ${n.notes || n.description ? `<div class="text-[11px] text-slate-300 italic line-clamp-2 mt-1">"${escapeHtml(n.notes || n.description)}"</div>` : ''}
        </div>
      `;
    }
  } else if (type === "item") {
    const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
    const it = (currentTopo.items || []).find(x => String(x.id) === String(id) || (x.name && x.name.toLowerCase() === String(id).toLowerCase()));
    if (it) {
      title = it.name || `Item #${it.id}`;
      badge = `Item &bull; ${escapeHtml(it.category || 'Gear')}`;
      content = `
        <div class="space-y-1">
          <div class="text-[11px] text-slate-300"><strong>Possession:</strong> ${escapeHtml(it.possessionMode || 'free')}</div>
          ${it.specs ? `<div class="text-[10px] text-slate-400 font-mono">${escapeHtml(it.specs)}</div>` : ''}
          ${it.notes || it.description ? `<div class="text-[11px] text-slate-300 italic line-clamp-2 mt-1">"${escapeHtml(it.notes || it.description)}"</div>` : ''}
        </div>
      `;
    }
  } else if (type === "quest") {
    const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
    const q = (currentTopo.quests || []).find(x => String(x.id) === String(id) || (x.title && x.title.toLowerCase() === String(id).toLowerCase()));
    if (q) {
      title = q.title || q.name || `Quest #${q.id}`;
      badge = `Quest &bull; ${escapeHtml(q.type || 'Mission')}`;
      content = `
        <div class="space-y-1">
          ${q.stakes ? `<div class="text-[11px] text-slate-300"><strong>Stakes:</strong> ${escapeHtml(q.stakes)}</div>` : ''}
          ${q.threat ? `<div class="text-[10px] text-amber-400 font-bold">Threat: ${escapeHtml(q.threat)}</div>` : ''}
          ${q.notes || q.summary ? `<div class="text-[11px] text-slate-300 italic line-clamp-2 mt-1">"${escapeHtml(q.notes || q.summary)}"</div>` : ''}
        </div>
      `;
    }
  } else if (type === "tracker") {
    const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
    const tr = (currentTopo.trackers || []).find(x => String(x.id) === String(id) || (x.name && x.name.toLowerCase() === String(id).toLowerCase()));
    if (tr) {
      title = tr.name || tr.title || `Tracker #${tr.id}`;
      badge = `Tracker &bull; ${escapeHtml(tr.type || 'Clock')}`;
      content = `
        <div class="space-y-1">
          <div class="text-[11px] text-slate-300"><strong>Ticks:</strong> ${tr.currentTicks || 0} / ${tr.maxTicks || 4}</div>
          ${tr.notes || tr.description ? `<div class="text-[11px] text-slate-300 italic line-clamp-2 mt-1">"${escapeHtml(tr.notes || tr.description)}"</div>` : ''}
        </div>
      `;
    }
  } else if (WIKI_TOKEN_TYPES[type] && typeof WIKI_TOKEN_TYPES[type].hovercard === "function") {
    try {
      const customContent = WIKI_TOKEN_TYPES[type].hovercard(id, mapId);
      if (customContent) content = customContent;
    } catch (e) {}
  }

  card.innerHTML = `
    <div class="space-y-1.5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-1 gap-2">
        <div class="font-bold text-white text-xs truncate">${WIKI_ICONS[type] || '🔗'} ${escapeHtml(title)}</div>
        ${subBadge}
      </div>
      <div class="text-[10px] font-bold text-sky-400">${badge}</div>
      <div>${content}</div>
      <div class="pt-1 border-t border-slate-800/80 text-[9px] text-slate-500 font-mono flex items-center justify-between">
        <span>Click to view & focus</span>
        <span>ESC to dismiss</span>
      </div>
    </div>
  `;

  // Position card near mouse cursor with viewport boundary safety
  const margin = 16;
  let x = event.clientX + margin;
  let y = event.clientY + margin;

  if (x + 280 > window.innerWidth) x = event.clientX - 290;
  if (y + 180 > window.innerHeight) y = event.clientY - 190;

  card.style.left = `${Math.max(10, x)}px`;
  card.style.top = `${Math.max(10, y)}px`;
  card.classList.remove("hidden");
}

function hideWikiHovercard() {
  const card = document.getElementById("wiki-hovercard");
  if (card) card.classList.add("hidden");
}

/**
 * Deep navigation to any entity across maps
 */
function navigateToWikiEntity(type, id, mapId = null, event = null) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  hideWikiHovercard();

  const regType = WIKI_TOKEN_TYPES[type];
  if (regType && typeof regType.navigate === "function") {
    try {
      regType.navigate(id, mapId);
      return;
    } catch (e) {}
  }

  const targetMap = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");

  // 1. Switch map if target is on a different map
  if (typeof activeMapId !== "undefined" && targetMap !== activeMapId && typeof switchActiveMap === "function") {
    switchActiveMap(targetMap);
  }

  // 2. Focus entity
  if (type === "node") {
    const nid = parseInt(id);
    if (typeof selectNode === "function") {
      selectNode(nid);
    } else {
      selectedNodeId = nid;
      selectedEdgeKey = null;
    }
    // Pan & center canvas on node
    centerCanvasOnNode(nid);
    if (typeof renderInspectorDrawer === "function") renderInspectorDrawer();
  } else if (type === "map") {
    if (typeof switchActiveMap === "function") switchActiveMap(id);
  } else if (type === "mod") {
    if (typeof setInspectorTab === "function") {
      setInspectorTab("modules");
      const searchBox = document.getElementById("catalog-search");
      if (searchBox) {
        searchBox.value = id;
        if (typeof renderCatalogModules === "function") renderCatalogModules();
      }
    }
  } else if (type === "faction") {
    if (typeof setInspectorTab === "function") setInspectorTab("factions");
  } else if (type === "corridor") {
    selectedEdgeKey = id;
    selectedNodeId = null;
    if (typeof renderInspectorDrawer === "function") renderInspectorDrawer();
  } else if (type === "npc" || type === "item" || type === "quest" || type === "tracker") {
    if (typeof openEditEntityModal === "function") {
      openEditEntityModal(id);
    } else if (typeof openEntityManager === "function") {
      openEntityManager(type, id);
    }
    const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
    const entList = currentTopo[type === "npc" ? "npcs" : (type === "item" ? "items" : (type === "quest" ? "quests" : "trackers"))] || [];
    const ent = entList.find(e => String(e.id) === String(id));
    if (ent && ent.nodeId) {
      centerCanvasOnNode(parseInt(ent.nodeId));
    }
  }
}

function navigateToWikiMention(name, event = null) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  hideWikiHovercard();

  const cleanName = name.toLowerCase().trim();

  // Try finding matching node in current map
  if (typeof nodes !== "undefined") {
    const matchNode = nodes.find(n => (n.name && n.name.toLowerCase() === cleanName) || (n.displayName && n.displayName.toLowerCase() === cleanName));
    if (matchNode) {
      navigateToWikiEntity("node", matchNode.id, typeof activeMapId !== "undefined" ? activeMapId : "map_root");
      return;
    }
  }

  // Try finding matching map
  if (typeof maps !== "undefined") {
    const matchMap = Object.values(maps).find(m => m.name && m.name.toLowerCase() === cleanName);
    if (matchMap) {
      navigateToWikiEntity("map", matchMap.id);
      return;
    }
  }

  // Try finding matching faction
  if (typeof campaignFactions !== "undefined") {
    const matchFac = campaignFactions.find(f => f.name && f.name.toLowerCase() === cleanName);
    if (matchFac) {
      navigateToWikiEntity("faction", matchFac.id);
      return;
    }
  }

  // Try finding matching active entity (NPC, Item, Quest, Tracker - ADR-0015 v2)
  const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
  const matchNpc = (currentTopo.npcs || []).find(n => n.name && n.name.toLowerCase() === cleanName);
  if (matchNpc) {
    navigateToWikiEntity("npc", matchNpc.id);
    return;
  }
  const matchItem = (currentTopo.items || []).find(i => i.name && i.name.toLowerCase() === cleanName);
  if (matchItem) {
    navigateToWikiEntity("item", matchItem.id);
    return;
  }
  const matchQuest = (currentTopo.quests || []).find(q => (q.title && q.title.toLowerCase() === cleanName) || (q.name && q.name.toLowerCase() === cleanName));
  if (matchQuest) {
    navigateToWikiEntity("quest", matchQuest.id);
    return;
  }
  const matchTracker = (currentTopo.trackers || []).find(t => (t.name && t.name.toLowerCase() === cleanName) || (t.title && t.title.toLowerCase() === cleanName));
  if (matchTracker) {
    navigateToWikiEntity("tracker", matchTracker.id);
    return;
  }

  alert(`Mentioned entity "${name}" was not found in the active campaign.`);
}

/**
 * Smoothly centers canvas view on a node
 */
function centerCanvasOnNode(nid) {
  let n = null;
  if (typeof Workstation !== "undefined" && Workstation.activeTopology && Workstation.activeTopology.nodes) {
    n = Workstation.activeTopology.nodes[String(nid)] || Workstation.activeTopology.nodes[nid];
  }
  if (!n && typeof getNode === "function") {
    n = getNode(nid);
  }
  if (!n) return;

  const nx = n.coordinates ? n.coordinates.x : (n.x !== undefined ? n.x : 100);
  const ny = n.coordinates ? n.coordinates.y : (n.y !== undefined ? n.y : 100);

  if (typeof Workstation !== "undefined" && Workstation.pan) {
    const container = document.getElementById("canvas-viewport") || document.getElementById("canvas-container");
    const cw = container ? container.clientWidth : 800;
    const ch = container ? container.clientHeight : 600;
    Workstation.pan.x = (cw / 2) - (nx * (Workstation.zoom || 1));
    Workstation.pan.y = (ch / 2) - (ny * (Workstation.zoom || 1));
    Workstation.selectedEntity = { type: 'node', id: n.id !== undefined ? n.id : nid };
    if (typeof renderCanvas === "function") renderCanvas();
    if (typeof renderInspector === "function") renderInspector();
    return;
  }

  if (typeof canvasTransform !== "undefined") {
    const container = document.getElementById("canvas-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    canvasTransform.x = (rect.width / 2) - (nx * (canvasTransform.scale || 1));
    canvasTransform.y = (rect.height / 2) - (ny * (canvasTransform.scale || 1));
    if (typeof applyCanvasTransform === "function") applyCanvasTransform();
    if (typeof pulseNodeEffect === "function") pulseNodeEffect(nid);
  }
}

/**
 * Autocomplete Controller for textareas
 * Attaches live dropdown suggestions when user types '@' or '[['
 */
function attachWikiAutocomplete(textarea) {
  if (!textarea || textarea.dataset.wikiAutocompleteActive) return;
  textarea.dataset.wikiAutocompleteActive = "true";

  textarea.addEventListener("input", (e) => {
    handleAutocompleteInput(textarea);
  });

  textarea.addEventListener("keydown", (e) => {
    handleAutocompleteKeydown(textarea, e);
  });
}

function handleAutocompleteInput(textarea) {
  const cursorPos = textarea.selectionStart;
  const textBefore = textarea.value.slice(0, cursorPos);

  // Look for triggering prefixes: '@' or '[['
  const atMatch = /@([a-zA-Z0-9_\- ]*)$/.exec(textBefore);
  const bracketMatch = /\[\[([a-zA-Z0-9_\- :]*)$/.exec(textBefore);

  if (!atMatch && !bracketMatch) {
    closeWikiAutocomplete();
    return;
  }

  const triggerType = atMatch ? "@" : "[[";
  const query = atMatch ? atMatch[1] : bracketMatch[1];

  openWikiAutocomplete(textarea, triggerType, query, cursorPos);
}

function openWikiAutocomplete(textarea, triggerType, query, cursorPos) {
  const drop = document.getElementById("wiki-autocomplete-dropdown");
  if (!drop) return;

  activeAutocompleteContext = {
    textarea: textarea,
    triggerType: triggerType,
    cursorPos: cursorPos,
    selectedIndex: 0,
    matches: []
  };

  const cleanQuery = query.toLowerCase().trim();
  const candidates = [];

  // 1. Current & Sibling Nodes
  if (typeof nodes !== "undefined") {
    nodes.forEach(n => {
      const title = n.name || `Node #${n.id}`;
      candidates.push({
        type: "node",
        id: n.id,
        mapId: (typeof activeMapId !== "undefined" ? activeMapId : "map_root"),
        title: title,
        subtitle: `Node #${n.id} &bull; ${n.culture || 'Hierarchy'} &bull; ${n.cat || 'Bastion'}`,
        icon: WIKI_ICONS.node,
        insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[Node:${n.id}]]`
      });
    });
  }

  // 2. Maps in Campaign
  if (typeof maps !== "undefined") {
    Object.values(maps).forEach(m => {
      const title = m.name || m.id;
      candidates.push({
        type: "map",
        id: m.id,
        mapId: m.id,
        title: title,
        subtitle: `Map &bull; Scale: ${(m.scaleTier || 'region').toUpperCase()}`,
        icon: WIKI_ICONS.map,
        insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[Map:${m.id}]]`
      });
    });
  }

  // 3. Slotted or Manifest Modules
  if (typeof MODULES_MANIFEST !== "undefined") {
    MODULES_MANIFEST.forEach(m => {
      candidates.push({
        type: "mod",
        id: m.id,
        mapId: (typeof activeMapId !== "undefined" ? activeMapId : "map_root"),
        title: `[${m.id}] ${m.title || m.id}`,
        subtitle: `Module &bull; Tier ${m.tier || 1}`,
        icon: WIKI_ICONS.mod || WIKI_ICONS.module,
        insertText: `[[Mod:${m.id}]]`
      });
    });
  }

  // 4. Factions
  if (typeof campaignFactions !== "undefined") {
    campaignFactions.forEach(f => {
      const title = f.name;
      candidates.push({
        type: "faction",
        id: f.id,
        mapId: (typeof activeMapId !== "undefined" ? activeMapId : "map_root"),
        title: title,
        subtitle: `Faction &bull; ${f.type || 'Power Group'}`,
        icon: WIKI_ICONS.faction,
        insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[Faction:${f.id}]]`
      });
    });
  }

  // 5. Active Campaign Entities (NPCs, Items, Quests, Trackers - ADR-0015 v2)
  const currentTopo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
  const currentMapId = (typeof activeMapId !== "undefined" ? activeMapId : "map_root");

  (currentTopo.npcs || []).forEach(npc => {
    const title = npc.name || `NPC #${npc.id}`;
    candidates.push({
      type: "npc",
      id: npc.id,
      mapId: currentMapId,
      title: title,
      subtitle: `NPC &bull; ${npc.role || 'Character'}`,
      icon: WIKI_ICONS.npc || '👤',
      insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[NPC:${npc.id}]]`
    });
  });

  (currentTopo.items || []).forEach(item => {
    const title = item.name || `Item #${item.id}`;
    candidates.push({
      type: "item",
      id: item.id,
      mapId: currentMapId,
      title: title,
      subtitle: `Item &bull; ${item.type || 'Object'}`,
      icon: WIKI_ICONS.item || '🗡️',
      insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[Item:${item.id}]]`
    });
  });

  (currentTopo.quests || []).forEach(quest => {
    const title = quest.title || quest.name || `Quest #${quest.id}`;
    candidates.push({
      type: "quest",
      id: quest.id,
      mapId: currentMapId,
      title: title,
      subtitle: `Quest &bull; ${quest.status || 'Active'}`,
      icon: WIKI_ICONS.quest || '📜',
      insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[Quest:${quest.id}]]`
    });
  });

  (currentTopo.trackers || []).forEach(tracker => {
    const title = tracker.name || tracker.title || `Tracker #${tracker.id}`;
    candidates.push({
      type: "tracker",
      id: tracker.id,
      mapId: currentMapId,
      title: title,
      subtitle: `Tracker &bull; ${tracker.type || 'Event/Clock'}`,
      icon: WIKI_ICONS.tracker || '⏱️',
      insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[Tracker:${tracker.id}]]`
    });
  });

  // 6. Registered Mod Token Types (ADR-0015 v2)
  if (typeof WIKI_TOKEN_TYPES !== "undefined") {
    Object.keys(WIKI_TOKEN_TYPES).forEach(k => {
      const spec = WIKI_TOKEN_TYPES[k];
      if (spec && typeof spec.getSuggestions === "function") {
        try {
          const suggestions = spec.getSuggestions(cleanQuery) || [];
          suggestions.forEach(s => {
            const title = s.title || String(s.id);
            const prefix = k.charAt(0).toUpperCase() + k.slice(1);
            candidates.push({
              type: k,
              id: s.id,
              mapId: currentMapId,
              title: title,
              subtitle: s.subtitle || spec.label || k,
              icon: spec.icon || WIKI_ICONS[k] || '🔗',
              insertText: (triggerType === "@") ? (title.includes(" ") ? `@"${title}"` : `@${title}`) : `[[${prefix}:${s.id}]]`
            });
          });
        } catch (e) {
          console.warn(`[WikiEngine] Error fetching suggestions for mod type ${k}:`, e);
        }
      }
    });
  }

  // Filter candidates by query
  const matches = candidates.filter(c => {
    if (!cleanQuery) return true;
    return c.title.toLowerCase().includes(cleanQuery) || c.subtitle.toLowerCase().includes(cleanQuery) || String(c.id).toLowerCase().includes(cleanQuery);
  }).slice(0, 10);

  activeAutocompleteContext.matches = matches;

  if (matches.length === 0) {
    drop.classList.add("hidden");
    return;
  }

  renderAutocompleteItems();

  // Position dropdown right below cursor/textarea
  const rect = textarea.getBoundingClientRect();
  drop.style.left = `${Math.min(window.innerWidth - 300, Math.max(10, rect.left))}px`;
  drop.style.top = `${Math.min(window.innerHeight - 250, rect.bottom + 4)}px`;
  drop.classList.remove("hidden");
}

function renderAutocompleteItems() {
  const drop = document.getElementById("wiki-autocomplete-dropdown");
  if (!drop || !activeAutocompleteContext) return;

  const { matches, selectedIndex } = activeAutocompleteContext;

  drop.innerHTML = `
    <div class="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
      <span>Entities (${matches.length})</span>
      <span class="font-mono text-[9px]">↑↓ to navigate &bull; Enter to select</span>
    </div>
    <div class="space-y-0.5 mt-1">
      ${matches.map((item, idx) => `
        <div class="px-2 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${idx === selectedIndex ? 'bg-sky-950 border border-sky-600 text-white' : 'hover:bg-slate-900 text-slate-300'}"
          onmousedown="selectAutocompleteItem(${idx})">
          <span class="text-sm">${item.icon}</span>
          <div class="flex-1 truncate">
            <div class="font-bold text-xs truncate">${item.title}</div>
            <div class="text-[10px] text-slate-400 truncate">${item.subtitle}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function handleAutocompleteKeydown(textarea, e) {
  if (!activeAutocompleteContext) return;
  const { matches, selectedIndex } = activeAutocompleteContext;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeAutocompleteContext.selectedIndex = (selectedIndex + 1) % matches.length;
    renderAutocompleteItems();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeAutocompleteContext.selectedIndex = (selectedIndex - 1 + matches.length) % matches.length;
    renderAutocompleteItems();
  } else if (e.key === "Enter" || e.key === "Tab") {
    if (matches.length > 0) {
      e.preventDefault();
      selectAutocompleteItem(activeAutocompleteContext.selectedIndex);
    }
  } else if (e.key === "Escape") {
    closeWikiAutocomplete();
  }
}

function selectAutocompleteItem(index) {
  if (!activeAutocompleteContext) return;
  const { textarea, triggerType, cursorPos, matches } = activeAutocompleteContext;
  const selected = matches[index];
  if (!selected) return;

  const text = textarea.value;
  const textBefore = text.slice(0, cursorPos);
  const textAfter = text.slice(cursorPos);

  // Replace from trigger character to cursor with the token
  let replaceStart = -1;
  if (triggerType === "@") {
    replaceStart = textBefore.lastIndexOf("@");
  } else if (triggerType === "[[") {
    replaceStart = textBefore.lastIndexOf("[[");
  }

  if (replaceStart !== -1) {
    const newText = textBefore.slice(0, replaceStart) + selected.insertText + " " + textAfter;
    textarea.value = newText;
    const newCursor = replaceStart + selected.insertText.length + 1;
    textarea.setSelectionRange(newCursor, newCursor);
    textarea.dispatchEvent(new Event("change"));
  }

  closeWikiAutocomplete();
  buildWikiIndex();
}

function closeWikiAutocomplete() {
  const drop = document.getElementById("wiki-autocomplete-dropdown");
  if (drop) drop.classList.add("hidden");
  activeAutocompleteContext = null;
}
