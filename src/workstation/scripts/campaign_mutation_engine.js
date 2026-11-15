/**
 * Creator Studio - Campaign Mutation Engine (campaign_mutation_engine.js)
 * Dual-Homed Zero-Dependency JavaScript Kernel for Campaign State Mutations,
 * Slice Imports, Two-Pass Intra-Batch Symbol Resolution, and Lossless Revert.
 *
 * Runs in:
 *  - Node.js (CLI, scripts/campaign_cli.js, tests) via module.exports
 *  - Browser (start.html, app.html) via window.CreatorStudio.ai
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CreatorStudio = root.CreatorStudio || {};
    root.CreatorStudio.ai = factory();
    root.CampaignMutationEngine = root.CreatorStudio.ai;
    root.formatCorridorKey = root.CampaignMutationEngine.formatCorridorKey;
    root.parseCorridorKey = root.CampaignMutationEngine.parseCorridorKey;
    root.corridorMatchesNode = root.CampaignMutationEngine.corridorMatchesNode;
    root.addCorridor = root.CampaignMutationEngine.addCorridor;
    root.removeCorridor = root.CampaignMutationEngine.removeCorridor;
    root.removeCorridorsForNode = root.CampaignMutationEngine.removeCorridorsForNode;
    root.ensureQueryableNodesCollection = root.CampaignMutationEngine.ensureQueryableNodesCollection;
    root.getNodesList = root.CampaignMutationEngine.getNodesList;
    root.getNodesMap = root.CampaignMutationEngine.getNodesMap;
    root.getNodeById = root.CampaignMutationEngine.getNodeById;
    root.upsertNode = root.CampaignMutationEngine.upsertNode;
    root.removeNode = root.CampaignMutationEngine.removeNode;
    root.normalizeSpatialPin = root.CampaignMutationEngine.normalizeSpatialPin;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let _seqCounter = 0;
  function generateMonotonicId(prefix = 'ent') {
    _seqCounter++;
    return `${prefix}_${Date.now().toString(36)}_${_seqCounter.toString(36)}`;
  }

  // --- Normalization Helpers (Ported from Import-CampaignSlice.ps1 & selective_importer.js) ---

  // Local copy of sociology_data.js normalizeOdvInput (UMD engine also runs under node tests).
  // Returns {s,e,c} with integers 1..4, or null when absent/invalid. Never invents a value.
  function normalizeOdv(raw) {
    if (raw === undefined || raw === null || raw === '' || typeof raw === 'number') return null;
    let v = null;
    if (Array.isArray(raw)) v = raw.slice(0, 3);
    else if (typeof raw === 'string') { const m = raw.match(/(-?\d+)\D+(-?\d+)\D+(-?\d+)/); if (m) v = [m[1], m[2], m[3]]; }
    else if (typeof raw === 'object') v = [raw.s, raw.e, raw.c];
    if (!v || v.length < 3) return null;
    const n = v.map(x => Number(x));
    if (n.some(x => !Number.isInteger(x) || x < 1 || x > 4)) return null;
    return { s: n[0], e: n[1], c: n[2] };
  }

  // Set-or-delete: writes a valid ODV onto obj, otherwise removes any stale odv/odvSource.
  function applyOdvOrDelete(obj, raw) {
    const o = normalizeOdv(raw);
    if (o) { obj.odv = o; if (!obj.odvSource) obj.odvSource = 'imported'; }
    else { delete obj.odv; delete obj.odvSource; }
  }

  /**
   * Canonical spatial-pin normalizer (SYS-ARCH-01): the single definition used by the engine,
   * the canvas renderer, the CAD interaction layer and the property grid.
   * Mutates `pin` in place and returns the same reference, so callers that ignore the return
   * value keep working. Never deletes unknown properties (color, notes, mod-injected fields).
   * Returns null for a non-object.
   */
  function normalizeSpatialPin(pin) {
    if (!pin || typeof pin !== 'object') return null;
    if (pin.id === undefined || pin.id === null || pin.id === '') pin.id = generateMonotonicId('pin');
    pin.x = Number(pin.x) || 0;
    pin.y = Number(pin.y) || 0;
    pin.label = String(pin.label || pin.name || 'POI Pin');
    if (pin.visible === undefined) pin.visible = true;
    if (pin.locked === undefined) pin.locked = false;
    if (!Array.isArray(pin.links)) {
      pin.links = [];
      if (pin.targetType && pin.targetId) {
        pin.links.push({ type: pin.targetType, id: String(pin.targetId) });
      }
    } else {
      // Keep each link object (extra fields survive); coerce id to string, default a missing type.
      for (let i = pin.links.length - 1; i >= 0; i--) {
        const link = pin.links[i];
        if (!link || typeof link !== 'object') { pin.links.splice(i, 1); continue; }
        link.id = (link.id === undefined || link.id === null) ? '' : String(link.id);
        if (!link.type) link.type = 'node';
      }
    }
    // Legacy targetType / targetId mirror the primary link; 'npc' is the canvas default.
    if (pin.links.length > 0) {
      pin.targetType = pin.links[0].type;
      pin.targetId = pin.links[0].id;
    } else if (!pin.targetType) {
      pin.targetType = 'npc';
      pin.targetId = '';
    } else {
      pin.targetId = (pin.targetId === undefined || pin.targetId === null) ? '' : String(pin.targetId);
    }
    return pin;
  }

  function normalizeEntities(entitiesObj) {
    if (!entitiesObj || typeof entitiesObj !== 'object') entitiesObj = {};
    const categories = ['npcs', 'quests', 'items', 'creatures', 'trackers', 'tickets', 'factions'];
    categories.forEach(k => {
      if (!Array.isArray(entitiesObj[k])) entitiesObj[k] = [];
    });
    if (Array.isArray(entitiesObj.industries)) {
      entitiesObj.industries.forEach(ind => {
        if (!ind || typeof ind !== 'object') return;
        const tagged = { ...ind, isIndustry: true, entityKind: 'industry' };
        if (tagged.id && entitiesObj.items.some(it => it && String(it.id) === String(tagged.id))) {
          const ex = entitiesObj.items.find(it => it && String(it.id) === String(tagged.id));
          if (ex && ex.isIndustry === undefined) ex.isIndustry = true;
          if (ex && !ex.entityKind) ex.entityKind = 'industry';
        } else {
          entitiesObj.items.push(tagged);
        }
      });
      delete entitiesObj.industries;
    }

    entitiesObj.npcs.forEach(npc => {
      if (!npc) return;
      applyOdvOrDelete(npc, npc.odv !== undefined ? npc.odv : (typeof npc.disposition === 'number' ? null : npc.disposition));
      if (!npc.faction && npc.factionId) npc.faction = npc.factionId;
      if (typeof npc.disposition === 'number') {
        if (npc.dispositionToParty === undefined) npc.dispositionToParty = npc.disposition;
        delete npc.disposition;
      } else if (Array.isArray(npc.disposition)) {
        delete npc.disposition;
      }
      if (Array.isArray(npc.carriedItemIds) && npc.id) {
        npc.carriedItemIds.forEach(itemId => {
          const it = entitiesObj.items.find(x => x && String(x.id) === String(itemId));
          if (it) {
            it.ownerNpcId = npc.id;
            it.possessionMode = 'carried';
          }
        });
      }
      if (!npc.status) npc.status = 'Active';
      if (!Array.isArray(npc.relationships)) npc.relationships = [];
    });

    entitiesObj.quests.forEach(q => {
      if (!q) return;
      if (!q.title && q.name) q.title = q.name;
      if (q.nodeId === undefined && q.anchorNodeId !== undefined) q.nodeId = q.anchorNodeId;
      if (!Array.isArray(q.npcIds)) q.npcIds = [];
      if (q.giverNpcId && !q.npcIds.includes(q.giverNpcId)) q.npcIds.push(q.giverNpcId);
      if (!Array.isArray(q.itemIds)) q.itemIds = [];
      if (Array.isArray(q.rewardItemIds)) {
        q.rewardItemIds.forEach(id => {
          if (id && !q.itemIds.includes(id)) q.itemIds.push(id);
        });
      }
      if (!Array.isArray(q.trackerIds)) q.trackerIds = [];
      if (Array.isArray(q.steps)) {
        q.steps = q.steps.map((st, idx) => {
          const stepTitle = st.title || st.text || ('Step ' + (idx + 1));
          const done = !!(st.isCompleted || st.completed);
          return {
            ...st,
            id: st.id || ('step_' + (idx + 1)),
            title: stepTitle,
            text: st.text || stepTitle,
            isCompleted: done,
            completed: done,
            triggerTrackerId: st.triggerTrackerId || null,
            tickDelta: st.tickDelta !== undefined ? Number(st.tickDelta) : 1
          };
        });
        q.steps.forEach(st => {
          if (st.triggerTrackerId && !q.trackerIds.includes(st.triggerTrackerId)) {
            q.trackerIds.push(st.triggerTrackerId);
          }
        });
      } else {
        q.steps = [];
      }
      if (!q.status) q.status = 'Active';
    });

    entitiesObj.items.forEach(it => {
      if (!it) return;
      if (!it.category && it.type) it.category = it.type;
      if (!it.type && it.category) it.type = it.category;
      if (!it.possessionMode) it.possessionMode = it.ownerNpcId ? 'carried' : 'stored';
    });

    entitiesObj.trackers.forEach(t => {
      if (!t) return;
      if (t.currentTicks === undefined && t.current !== undefined) t.currentTicks = Number(t.current) || 0;
      if (t.currentTicks === undefined && t.value !== undefined) t.currentTicks = Number(t.value) || 0;
      if (t.currentTicks === undefined) t.currentTicks = 0;

      if (t.maxTicks === undefined && t.max !== undefined) t.maxTicks = Number(t.max) || 6;
      if (t.maxTicks === undefined) t.maxTicks = 6;

      if (!t.scopeTier && t.scope) t.scopeTier = (t.scope === 'city') ? 'settlement' : t.scope;
      if (!t.scopeTier) t.scopeTier = 'settlement';

      if (!t.notes && t.consequence) t.notes = t.consequence;
      if (!Array.isArray(t.triggerRefs)) t.triggerRefs = [];
      if (!Array.isArray(t.consequences)) t.consequences = [];
    });

    entitiesObj.factions.forEach(f => {
      if (!f) return;
      applyOdvOrDelete(f, f.odv !== undefined && f.odv !== null ? f.odv : f.disposition);
      if (Array.isArray(f.disposition)) delete f.disposition;
      if (!f.cvfQuadrant && (f.quadrant || f.culture)) f.cvfQuadrant = f.quadrant || f.culture;
      if (!f.quadrant && f.cvfQuadrant) f.quadrant = f.cvfQuadrant;
      if (!Array.isArray(f.controlledNodeIds)) f.controlledNodeIds = [];
      if (!f.diplomaticStances || typeof f.diplomaticStances !== 'object') f.diplomaticStances = {};
    });

    return entitiesObj;
  }

  function getTargetCollection(state, category) {
    if (!state) return null;
    const cat = category.toLowerCase();
    const camelCat = (cat === 'spatialpins' || cat === 'spatial_pins' || cat === 'spatialpin') ? 'spatialPins' : cat;
    // Support category names: npcs, quests, items, creatures, trackers, factions, tickets, nodes, spatialPins
    if (Array.isArray(state[cat])) {
      if (state.entities && Array.isArray(state.entities[cat]) && state.entities[cat] !== state[cat]) {
        state.entities[cat] = state[cat];
      }
      return state[cat];
    }
    if (Array.isArray(state[camelCat])) {
      if (state.entities && Array.isArray(state.entities[camelCat]) && state.entities[camelCat] !== state[camelCat]) {
        state.entities[camelCat] = state[camelCat];
      }
      return state[camelCat];
    }
    if (state.entities) {
      if (Array.isArray(state.entities[cat])) return state.entities[cat];
      if (Array.isArray(state.entities[camelCat])) return state.entities[camelCat];
    }
    if (state.activeTopology) {
      if (Array.isArray(state.activeTopology[cat])) {
        if (state.activeTopology.entities && Array.isArray(state.activeTopology.entities[cat]) && state.activeTopology.entities[cat] !== state.activeTopology[cat]) {
          state.activeTopology.entities[cat] = state.activeTopology[cat];
        }
        return state.activeTopology[cat];
      }
      if (Array.isArray(state.activeTopology[camelCat])) {
        if (state.activeTopology.entities && Array.isArray(state.activeTopology.entities[camelCat]) && state.activeTopology.entities[camelCat] !== state.activeTopology[camelCat]) {
          state.activeTopology.entities[camelCat] = state.activeTopology[camelCat];
        }
        return state.activeTopology[camelCat];
      }
      if (state.activeTopology.entities) {
        if (Array.isArray(state.activeTopology.entities[cat])) return state.activeTopology.entities[cat];
        if (Array.isArray(state.activeTopology.entities[camelCat])) return state.activeTopology.entities[camelCat];
      }
      if (cat === 'nodes' && state.activeTopology.nodes) return state.activeTopology.nodes;
    }
    if (cat === 'nodes' && state.nodes) return state.nodes;
    return null;
  }

  function ensureEntityCollection(state, category) {
    const cat = category.toLowerCase();
    let col = getTargetCollection(state, cat);
    if (!col) {
      if (!state.entities) state.entities = {};
      state.entities[cat] = (cat === 'nodes' && !Array.isArray(state.nodes)) ? {} : [];
      col = state.entities[cat];
      if (state.activeTopology) {
        if (!state.activeTopology.entities) state.activeTopology.entities = {};
        state.activeTopology.entities[cat] = col;
        state.activeTopology[cat] = col;
      }
    }
    return col;
  }

  // --- Two-Pass Symbol Resolution Engine ---

  function resolveEntityRef(state, targetType, ref, symbolTable = null) {
    if (ref === null || ref === undefined) return null;
    const refStr = String(ref).trim();
    if (!refStr) return null;

    // 1. Symbol table lookup ($tempId or batch registered alias)
    if (symbolTable) {
      if (symbolTable.has(refStr)) return symbolTable.get(refStr);
      if (symbolTable.has(refStr.toLowerCase())) return symbolTable.get(refStr.toLowerCase());
      if (refStr.startsWith('$') && symbolTable.has(refStr)) return symbolTable.get(refStr);
    }

    const normType = (targetType === 'clock') ? 'trackers' : (targetType.endsWith('s') ? targetType.toLowerCase() : targetType.toLowerCase() + 's');
    const collection = getTargetCollection(state, normType);

    if (Array.isArray(collection)) {
      // 2. Exact ID match
      let match = collection.find(e => e && (String(e.id) === refStr || String(e.prototypeId) === refStr));
      if (match) return match.id;

      // 3. Exact Name or Title match (case-insensitive)
      const lower = refStr.toLowerCase();
      match = collection.find(e => e && ((e.name && e.name.toLowerCase() === lower) || (e.title && e.title.toLowerCase() === lower) || (e.label && e.label.toLowerCase() === lower)));
      if (match) return match.id;

      // 4. Substring match if unique
      const subMatches = collection.filter(e => e && ((e.name && e.name.toLowerCase().includes(lower)) || (e.title && e.title.toLowerCase().includes(lower))));
      if (subMatches.length === 1) return subMatches[0].id;
    } else if (collection && typeof collection === 'object') {
      // Object dictionary (e.g., nodes)
      if (collection[refStr]) return refStr;
      const lower = refStr.toLowerCase();
      for (const [nid, n] of Object.entries(collection)) {
        if (n && n.name && n.name.toLowerCase() === lower) return nid;
      }
      const subMatches = Object.entries(collection).filter(([nid, n]) => n && n.name && n.name.toLowerCase().includes(lower));
      if (subMatches.length === 1) return subMatches[0][0];
    } else if (normType === 'anys' || !collection) {
      // Search across all entity collections when type is ambiguous
      const searchCats = ['npcs', 'quests', 'items', 'creatures', 'trackers', 'factions', 'tickets', 'spatialpins'];
      for (const sc of searchCats) {
        const col = getTargetCollection(state, sc);
        if (Array.isArray(col)) {
          let m = col.find(e => e && (String(e.id) === refStr || String(e.prototypeId) === refStr));
          if (m) return m.id;
          const lower = refStr.toLowerCase();
          m = col.find(e => e && ((e.name && e.name.toLowerCase() === lower) || (e.title && e.title.toLowerCase() === lower) || (e.label && e.label.toLowerCase() === lower)));
          if (m) return m.id;
        }
      }
    }

    return refStr; // Fallback to raw string
  }

  function resolveNodeRef(state, refStr, symbolTable = null) {
    if (refStr === null || refStr === undefined) return null;
    const str = String(refStr).trim();
    if (!str) return null;

    if (symbolTable && symbolTable.has(str)) return symbolTable.get(str);

    // Support "<submap>:<node>" syntax
    if (str.includes(':')) {
      const parts = str.split(':');
      const submapQuery = parts[0].trim().toLowerCase();
      const nodeQuery = parts[1].trim().toLowerCase();

      const allMaps = state.maps || (state.activeTopology && state.activeTopology.maps) || {};
      for (const [mId, m] of Object.entries(allMaps)) {
        if (mId.toLowerCase() === submapQuery || (m.name && m.name.toLowerCase() === submapQuery)) {
          if (Array.isArray(m.nodes)) {
            const found = m.nodes.find(n => n && (String(n.id).toLowerCase() === nodeQuery || (n.name && n.name.toLowerCase() === nodeQuery)));
            if (found) return found.id;
          }
        }
      }
    }

    // Check active topology nodes dictionary
    const topoNodes = (state.activeTopology && state.activeTopology.nodes) || state.nodes || {};
    if (typeof topoNodes === 'object' && !Array.isArray(topoNodes)) {
      if (topoNodes[str]) return str;
      const lower = str.toLowerCase();
      const matches = [];
      for (const [nid, n] of Object.entries(topoNodes)) {
        if (n && n.name && n.name.toLowerCase() === lower) matches.push(nid);
      }
      if (matches.length === 1) return matches[0];
      if (matches.length > 1) {
        throw new Error(`AMBIGUOUS_NODE_REFERENCE: Node "${str}" matches multiple nodes in active topology (${matches.join(', ')}). Use "<submap>:<node>" to disambiguate.`);
      }
    }

    // Check all submaps for ambiguous references
    const allMaps = state.maps || (state.activeTopology && state.activeTopology.maps) || {};
    const multiMapMatches = [];
    for (const [mId, m] of Object.entries(allMaps)) {
      if (Array.isArray(m.nodes)) {
        const found = m.nodes.find(n => n && (String(n.id) === str || (n.name && n.name.toLowerCase() === str.toLowerCase())));
        if (found) multiMapMatches.push({ mapId: mId, mapName: m.name || mId, nodeId: found.id });
      }
    }
    if (multiMapMatches.length === 1) return multiMapMatches[0].nodeId;
    if (multiMapMatches.length > 1) {
      const detail = multiMapMatches.map(m => `"${m.mapName}" (${m.mapId}: Node ${m.nodeId})`).join(', ');
      throw new Error(`AMBIGUOUS_NODE_REFERENCE: Node "${str}" exists on multiple maps: ${detail}. Use "<submap>:<node>" syntax.`);
    }

    return isNaN(str) ? str : Number(str);
  }

  // --- Canonical Mutators & Link Invariants ---

  function syncQuestAndTrackerLinks(stateOrTopo, quest, previousTrackerIds = []) {
    if (!stateOrTopo || !quest) return;
    const trackersCol = getTargetCollection(stateOrTopo, 'trackers');
    if (!Array.isArray(trackersCol)) return;
    const currentTrackerIds = new Set(quest.trackerIds ? quest.trackerIds.map(String) : []);

    if (Array.isArray(quest.steps)) {
      quest.steps.forEach(st => {
        if (st && st.triggerTrackerId) currentTrackerIds.add(String(st.triggerTrackerId));
      });
    }
    quest.trackerIds = Array.from(currentTrackerIds);

    trackersCol.forEach(trk => {
      if (!trk) return;
      const trkId = String(trk.id);
      if (!Array.isArray(trk.triggerRefs)) trk.triggerRefs = [];
      const hasRef = trk.triggerRefs.some(r => r && r.entityType === 'quest' && String(r.entityId) === String(quest.id));

      if (currentTrackerIds.has(trkId)) {
        if (!hasRef) {
          trk.triggerRefs.push({ entityType: 'quest', entityId: quest.id });
        }
      } else if (previousTrackerIds.map(String).includes(trkId)) {
        trk.triggerRefs = trk.triggerRefs.filter(r => !(r && r.entityType === 'quest' && String(r.entityId) === String(quest.id)));
      }
    });
  }

  function syncTrackerToQuests(stateOrTopo, tracker, previousTriggerQuestIds = []) {
    if (!stateOrTopo || !tracker) return;
    const questsCol = getTargetCollection(stateOrTopo, 'quests');
    if (!Array.isArray(questsCol)) return;
    const trkId = String(tracker.id);
    const currentQuestIds = new Set(
      (tracker.triggerRefs || [])
        .filter(r => r && r.entityType === 'quest')
        .map(r => String(r.entityId))
    );

    questsCol.forEach(q => {
      if (!q) return;
      const qId = String(q.id);
      if (!Array.isArray(q.trackerIds)) q.trackerIds = [];
      if (currentQuestIds.has(qId)) {
        if (!q.trackerIds.map(String).includes(trkId)) {
          q.trackerIds.push(tracker.id);
        }
      } else if (previousTriggerQuestIds.map(String).includes(qId)) {
        q.trackerIds = q.trackerIds.filter(id => String(id) !== trkId);
        if (Array.isArray(q.steps)) {
          q.steps.forEach(st => {
            if (st && String(st.triggerTrackerId) === trkId) st.triggerTrackerId = null;
          });
        }
      }
    });
  }

  function upsertEntity(state, category, payload, batchContext = {}) {
    const cat = category.toLowerCase().endsWith('s') ? category.toLowerCase() : category.toLowerCase() + 's';
    const collection = ensureEntityCollection(state, cat);
    const changes = batchContext.changes || [];
    const isNodeDict = (cat === 'nodes' && !Array.isArray(collection) && typeof collection === 'object');

    const origPayloadId = payload.id;
    let entityId = payload.id;
    let tempId = payload.tempId;

    if (!entityId && tempId && batchContext.symbolTable && batchContext.symbolTable.has(tempId)) {
      entityId = batchContext.symbolTable.get(tempId);
    }

    // Try resolving entityId or name/title to existing entity
    if (entityId) {
      const resolved = resolveEntityRef(state, cat, entityId, batchContext.symbolTable);
      if (resolved) {
        entityId = resolved;
      }
    } else if (payload.name || payload.title) {
      const resolved = resolveEntityRef(state, cat, payload.name || payload.title, batchContext.symbolTable);
      if (resolved) {
        entityId = resolved;
      }
    }

    let existing = null;
    let existingIdx = -1;

    if (isNodeDict) {
      existing = entityId ? collection[entityId] : null;
    } else {
      if (entityId) {
        existingIdx = collection.findIndex(e => e && String(e.id) === String(entityId));
        if (existingIdx >= 0) existing = collection[existingIdx];
      }
      if (!existing && (payload.name || payload.title)) {
        const queryName = (payload.name || payload.title).toLowerCase();
        existingIdx = collection.findIndex(e => e && ((e.name && e.name.toLowerCase() === queryName) || (e.title && e.title.toLowerCase() === queryName)));
        if (existingIdx >= 0) {
          existing = collection[existingIdx];
          entityId = existing.id;
        }
      }
    }

    if (!entityId || (typeof entityId === 'string' && entityId.startsWith('$'))) {
      entityId = generateMonotonicId(cat.slice(0, 3));
    }
    if (typeof origPayloadId === 'number' && Number(entityId) === origPayloadId) {
      entityId = origPayloadId;
    }
    payload.id = entityId;

    if (tempId && batchContext.symbolTable) {
      batchContext.symbolTable.set(tempId, entityId);
    }
    if (payload.name && batchContext.symbolTable) {
      batchContext.symbolTable.set(payload.name.toLowerCase(), entityId);
    }
    if (payload.title && batchContext.symbolTable) {
      batchContext.symbolTable.set(payload.title.toLowerCase(), entityId);
    }

    const normPayload = { ...payload };
    delete normPayload.tempId;
    if (typeof payload.id === 'number' && Number(entityId) === payload.id) {
      normPayload.id = payload.id;
    } else {
      normPayload.id = entityId;
    }

    // Type-specific shorthand normalization
    if (cat === 'npcs') {
      if (normPayload.odv !== undefined) {
        const o = normalizeOdv(normPayload.odv);
        if (o) normPayload.odv = o; else delete normPayload.odv;
      }
      if (normPayload.node) normPayload.nodeId = resolveNodeRef(state, normPayload.node, batchContext.symbolTable);
      if (normPayload.nodeId) normPayload.nodeId = resolveNodeRef(state, normPayload.nodeId, batchContext.symbolTable);
      if (typeof normPayload.disposition === 'number') {
        if (normPayload.dispositionToParty === undefined) normPayload.dispositionToParty = normPayload.disposition;
        delete normPayload.disposition;
      }
    } else if (cat === 'quests') {
      if (!normPayload.title && normPayload.name) normPayload.title = normPayload.name;
      if (normPayload.node) normPayload.nodeId = resolveNodeRef(state, normPayload.node, batchContext.symbolTable);
      if (normPayload.nodeId) normPayload.nodeId = resolveNodeRef(state, normPayload.nodeId, batchContext.symbolTable);
      if (Array.isArray(normPayload.npcIds)) {
        normPayload.npcIds = normPayload.npcIds.map(ref => resolveEntityRef(state, 'npc', ref, batchContext.symbolTable));
      }
      if (Array.isArray(normPayload.trackerIds)) {
        normPayload.trackerIds = normPayload.trackerIds.map(ref => resolveEntityRef(state, 'tracker', ref, batchContext.symbolTable));
      }
      if (Array.isArray(normPayload.itemIds)) {
        normPayload.itemIds = normPayload.itemIds.map(ref => resolveEntityRef(state, 'item', ref, batchContext.symbolTable));
      }
      if (Array.isArray(normPayload.steps)) {
        normPayload.steps = normPayload.steps.map((st, i) => ({
          id: st.id || ('step_' + (i + 1)),
          title: st.title || st.text || ('Step ' + (i + 1)),
          isCompleted: !!(st.isCompleted || st.completed),
          triggerTrackerId: st.triggerTrackerId ? resolveEntityRef(state, 'tracker', st.triggerTrackerId, batchContext.symbolTable) : null,
          tickDelta: st.tickDelta !== undefined ? Number(st.tickDelta) : 1
        }));
      }
    } else if (cat === 'trackers') {
      if (normPayload.currentTicks === undefined && normPayload.current !== undefined) normPayload.currentTicks = Number(normPayload.current) || 0;
      if (normPayload.maxTicks === undefined && normPayload.max !== undefined) normPayload.maxTicks = Number(normPayload.max) || 6;
      if (!normPayload.scopeTier && normPayload.scope) normPayload.scopeTier = normPayload.scope === 'city' ? 'settlement' : normPayload.scope;
      if (normPayload.node) normPayload.nodeId = resolveNodeRef(state, normPayload.node, batchContext.symbolTable);
      if (normPayload.nodeId) normPayload.nodeId = resolveNodeRef(state, normPayload.nodeId, batchContext.symbolTable);
      if (Array.isArray(normPayload.triggerRefs)) {
        normPayload.triggerRefs = normPayload.triggerRefs.map(ref => ({
          entityType: ref.entityType || 'quest',
          entityId: resolveEntityRef(state, ref.entityType || 'quest', ref.entityId, batchContext.symbolTable)
        }));
      }
    } else if (cat === 'spatialpins') {
      normalizeSpatialPin(normPayload);
    }

    // Clean undefined fields from normPayload
    Object.keys(normPayload).forEach(k => {
      if (normPayload[k] === undefined) delete normPayload[k];
    });

    const entityName = normPayload.name || normPayload.title || normPayload.label || `${cat}_${entityId}`;

    if (existing) {
      // Record field diffs
      Object.keys(normPayload).forEach(key => {
        if (key === 'id') return;
        const beforeVal = existing[key];
        const afterVal = normPayload[key];
        if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
          changes.push({
            category: cat,
            entityId: String(entityId),
            entityName: entityName,
            field: key,
            before: beforeVal !== undefined ? JSON.parse(JSON.stringify(beforeVal)) : undefined,
            after: afterVal !== undefined ? JSON.parse(JSON.stringify(afterVal)) : undefined
          });
        }
      });
      const prevTrackerIds = (cat === 'quests' && Array.isArray(existing.trackerIds)) ? [...existing.trackerIds] : [];
      const prevQuestRefs = (cat === 'trackers' && Array.isArray(existing.triggerRefs))
        ? existing.triggerRefs.filter(r => r && r.entityType === 'quest').map(r => String(r.entityId))
        : [];

      Object.assign(existing, normPayload);

      if (cat === 'quests') {
        syncQuestAndTrackerLinks(state, existing, prevTrackerIds);
      } else if (cat === 'trackers') {
        syncTrackerToQuests(state, existing, prevQuestRefs);
      }

      return existing;
    } else {
      // New entity created
      changes.push({
        category: cat,
        entityId: String(entityId),
        entityName: entityName,
        field: '_entity',
        before: undefined,
        after: JSON.parse(JSON.stringify(normPayload))
      });

      if (isNodeDict) {
        collection[entityId] = normPayload;
        ensureQueryableNodesCollection(collection);
      } else {
        collection.push(normPayload);
      }

      // Sync bidirectional triggerRefs across quest <-> tracker
      if (cat === 'quests') {
        syncQuestAndTrackerLinks(state, normPayload, []);
      } else if (cat === 'trackers') {
        syncTrackerToQuests(state, normPayload, []);
      }
      return normPayload;
    }
  }

  // --- Entity Reference Descriptors (SYS-ARCH-01) ---
  // One declarative table of every field that points at another entity by id. deleteEntity scrubs through
  // it and findEntityReferences reads it, so the delete preview and the scrub cannot drift apart.
  //
  //   collection  where the referring record lives: factions | npcs | quests | items | trackers | tickets |
  //               spatialpins | nodes | links  (nodes, links and pins are also looked up on every registered map)
  //   target      entity type being referenced: npc | quest | item | tracker | faction | node, or '*' for any type
  //   path        field on the record, or 'list[].field' for the field of each element of a nested list
  //   shape       how the reference is stored, which decides how it is matched:
  //                 id            scalar id (typeField/untyped: a stored type label guards the match)
  //                 ids           array of ids
  //                 refs          array of records (idKeys; optional typeKey + untyped for a stored type label)
  //                 keys          object keyed by id
  //                 text          free text that contains the id
  //                 operations    nested operation records (opKeys name the fields that can hold the target)
  //                 ticketTarget  ticket targetType/targetId pair
  //                 pinTarget     pin targetType/targetId pair
  //                 endpoints     corridor link whose source or target is the id
  //   op          what the scrub does: null | filter | delete-key | clear | retarget | resync | splice
  //   log         true when the scrub also records a changelog entry (kept exactly as it was before the table
  //               existed, so revertBatch sees the same entries)
  //   label       short human name of the relationship, shown by the delete preview
  //   set         extra fields written onto the record when the reference is nulled
  //   logAs       changelog field name template for nested paths ('{id}' is the nested element's id)
  //
  // Row order matters: rows run in table order per record, which is the order changelog entries are written.
  const OP_KEYS = ['npc', 'quest', 'clock', 'tracker', 'item', 'node', 'faction', 'entityId', 'id'];
  const ENTITY_REFERENCE_DESCRIPTORS = [
    // factions
    { collection: 'factions', target: 'npc', path: 'leaderNpcId', shape: 'id', op: 'null', log: true, label: 'faction leader' },
    { collection: 'factions', target: 'npc', path: 'memberNpcIds', shape: 'ids', op: 'filter', log: true, label: 'faction member list' },
    { collection: 'factions', target: 'node', path: 'controlledNodeIds', shape: 'ids', op: 'filter', log: true, label: 'controlled territory' },
    { collection: 'factions', target: 'node', path: 'homeNodeId', shape: 'id', op: 'null', log: true, label: 'faction home node' },
    { collection: 'factions', target: 'node', path: 'headquartersNodeId', shape: 'id', op: 'null', log: true, label: 'faction headquarters' },
    { collection: 'factions', target: 'faction', path: 'alliedFactionIds', shape: 'ids', op: 'filter', log: true, label: 'ally list' },
    { collection: 'factions', target: 'faction', path: 'rivalFactionIds', shape: 'ids', op: 'filter', log: true, label: 'rival list' },
    { collection: 'factions', target: 'faction', path: 'diplomaticStances', shape: 'keys', op: 'delete-key', log: true, label: 'diplomatic stance' },
    // npcs
    { collection: 'npcs', target: 'faction', path: 'factionId', shape: 'id', op: 'null', log: true, label: 'faction membership' },
    { collection: 'npcs', target: 'faction', path: 'faction', shape: 'id', op: 'null', log: true, label: 'faction membership' },
    { collection: 'npcs', target: 'npc', path: 'relationships', shape: 'refs', idKeys: ['targetNpcId', 'npcId'], op: 'filter', log: true, label: 'social tie' },
    { collection: 'npcs', target: 'node', path: 'currentNodeId', shape: 'id', op: 'null', log: true, label: 'current location' },
    { collection: 'npcs', target: 'node', path: 'homeNodeId', shape: 'id', op: 'null', log: true, label: 'home location' },
    { collection: 'npcs', target: 'node', path: 'nodeId', shape: 'id', op: 'null', log: true, label: 'station node' },
    { collection: 'npcs', target: 'quest', path: 'questIds', shape: 'ids', op: 'filter', log: true, label: 'quest list' },
    { collection: 'npcs', target: 'item', path: 'inventoryItemIds', shape: 'ids', op: 'filter', log: true, label: 'inventory' },
    { collection: 'npcs', target: 'item', path: 'itemIds', shape: 'ids', op: 'filter', log: true, label: 'inventory' },
    { collection: 'npcs', target: 'item', path: 'carriedItemIds', shape: 'ids', op: 'filter', log: true, label: 'carried items' },
    { collection: 'npcs', target: 'tracker', path: 'threat', shape: 'text', op: 'clear', log: false, label: 'threat note' },
    // quests
    { collection: 'quests', target: 'npc', path: 'npcIds', shape: 'ids', op: 'filter', log: true, label: 'quest roster' },
    { collection: 'quests', target: 'npc', path: 'giverNpcId', shape: 'id', op: 'null', log: true, label: 'quest giver' },
    { collection: 'quests', target: 'npc', path: 'targetNpcId', shape: 'id', op: 'null', log: true, label: 'quest target' },
    { collection: 'quests', target: 'npc', path: 'steps[].targetNpcId', shape: 'id', op: 'null', log: false, label: 'quest step target' },
    { collection: 'quests', target: 'item', path: 'itemIds', shape: 'ids', op: 'filter', log: true, label: 'quest items' },
    { collection: 'quests', target: 'item', path: 'rewardItemIds', shape: 'ids', op: 'filter', log: false, label: 'quest rewards' },
    { collection: 'quests', target: 'item', path: 'rewardItemId', shape: 'id', op: 'null', log: true, label: 'quest reward' },
    { collection: 'quests', target: 'item', path: 'steps[].requiredItemId', shape: 'id', op: 'null', log: false, label: 'quest step item' },
    { collection: 'quests', target: 'tracker', path: 'trackerIds', shape: 'ids', op: 'filter', log: true, label: 'quest threat clocks' },
    { collection: 'quests', target: 'tracker', path: 'steps[].triggerTrackerId', shape: 'id', op: 'null', log: true, logAs: 'step_{id}_triggerTrackerId', label: 'quest step trigger clock' },
    { collection: 'quests', target: 'faction', path: 'factionId', shape: 'id', op: 'null', log: true, label: 'quest faction' },
    { collection: 'quests', target: 'faction', path: 'faction', shape: 'id', op: 'null', log: false, label: 'quest faction' },
    { collection: 'quests', target: 'node', path: 'targetNodeId', shape: 'id', op: 'null', log: true, label: 'quest anchor' },
    { collection: 'quests', target: 'node', path: 'originNodeId', shape: 'id', op: 'null', log: true, label: 'quest anchor' },
    { collection: 'quests', target: 'node', path: 'nodeId', shape: 'id', op: 'null', log: true, label: 'quest anchor' },
    { collection: 'quests', target: 'node', path: 'anchorNodeId', shape: 'id', op: 'null', log: true, label: 'quest anchor' },
    { collection: 'quests', target: 'node', path: 'steps[].targetNodeId', shape: 'id', op: 'null', log: false, label: 'quest step location' },
    // items
    { collection: 'items', target: 'npc', path: 'ownerNpcId', shape: 'id', op: 'null', log: true, set: { possessionMode: 'stored' }, label: 'item owner' },
    { collection: 'items', target: 'node', path: 'locationNodeId', shape: 'id', op: 'null', log: true, label: 'item location' },
    { collection: 'items', target: 'node', path: 'nodeId', shape: 'id', op: 'null', log: true, label: 'item location' },
    { collection: 'items', target: 'quest', path: 'linkedQuestId', shape: 'id', op: 'null', log: true, label: 'linked quest' },
    { collection: 'items', target: 'quest', path: 'questId', shape: 'id', op: 'null', log: true, label: 'linked quest' },
    { collection: 'items', target: 'faction', path: 'factionId', shape: 'id', op: 'null', log: true, label: 'item faction' },
    // creatures (bestiary)
    { collection: 'creatures', target: 'node', path: 'nodeId', shape: 'id', op: 'null', log: true, label: 'creature location' },
    { collection: 'creatures', target: 'node', path: 'stationing.nodeId', shape: 'id', op: 'null', set: { mode: 'unassigned' }, log: true, label: 'creature stationing node' },
    { collection: 'creatures', target: 'faction', path: 'factionId', shape: 'id', op: 'null', log: true, label: 'creature faction' },
    // trackers (threat clocks)
    { collection: 'trackers', target: '*', path: 'triggerRefs', shape: 'refs', idKeys: ['entityId'], typeKey: 'entityType', untyped: 'match', op: 'filter', log: true, label: 'clock trigger' },
    { collection: 'trackers', target: 'node', path: 'nodeId', shape: 'id', op: 'null', log: true, label: 'clock location' },
    { collection: 'trackers', target: 'faction', path: 'factionId', shape: 'id', op: 'null', log: true, label: 'clock faction' },
    { collection: 'trackers', target: '*', path: 'consequences[].targetId', shape: 'id', typeField: 'targetType', untyped: 'match', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: 'quest', path: 'consequences[].questId', shape: 'id', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: 'tracker', path: 'consequences[].trackerId', shape: 'id', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: 'tracker', path: 'consequences[].clockId', shape: 'id', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: 'node', path: 'consequences[].nodeId', shape: 'id', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: 'npc', path: 'consequences[].npcId', shape: 'id', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: 'faction', path: 'consequences[].factionId', shape: 'id', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: 'item', path: 'consequences[].itemId', shape: 'id', op: 'null', log: false, label: 'clock consequence' },
    { collection: 'trackers', target: '*', path: 'consequences[].operations', shape: 'operations', opKeys: OP_KEYS, op: 'filter', log: false, label: 'clock consequence operation' },
    // tickets
    { collection: 'tickets', target: 'node', path: 'linkedNodeId', shape: 'id', op: 'null', log: false, label: 'ticket link' },
    { collection: 'tickets', target: 'npc', path: 'linkedNpcId', shape: 'id', op: 'null', log: false, label: 'ticket link' },
    { collection: 'tickets', target: 'quest', path: 'linkedQuestId', shape: 'id', op: 'null', log: false, label: 'ticket link' },
    { collection: 'tickets', target: 'faction', path: 'linkedFactionId', shape: 'id', op: 'null', log: false, label: 'ticket link' },
    { collection: 'tickets', target: 'item', path: 'linkedItemId', shape: 'id', op: 'null', log: false, label: 'ticket link' },
    { collection: 'tickets', target: 'tracker', path: 'linkedTrackerId', shape: 'id', op: 'null', log: false, label: 'ticket link' },
    { collection: 'tickets', target: '*', path: 'targetId', shape: 'ticketTarget', op: 'retarget', log: false, label: 'ticket target' },
    // spatial pins (active topology and every registered map)
    { collection: 'spatialpins', target: '*', path: 'links', shape: 'refs', idKeys: ['id'], typeKey: 'type', untyped: 'ignore', op: 'filter', log: true, label: 'pin link' },
    { collection: 'spatialpins', target: '*', path: 'targetId', shape: 'pinTarget', op: 'resync', log: false, label: 'pin target' },
    { collection: 'spatialpins', target: '*', path: 'linkedEntityId', shape: 'id', op: 'null', log: false, label: 'pin link' },
    // node records (active topology and every registered map)
    { collection: 'nodes', target: 'node', path: 'adj', shape: 'ids', op: 'filter', log: false, label: 'adjacent node' },
    { collection: 'nodes', target: 'node', path: 'infBy', shape: 'ids', op: 'filter', log: false, label: 'influence source' },
    { collection: 'nodes', target: 'npc', path: 'stationedNpcIds', shape: 'ids', op: 'filter', log: false, label: 'node roster' },
    { collection: 'nodes', target: 'npc', path: 'npcIds', shape: 'ids', op: 'filter', log: false, label: 'node roster' },
    { collection: 'nodes', target: 'quest', path: 'questIds', shape: 'ids', op: 'filter', log: false, label: 'node quests' },
    { collection: 'nodes', target: 'item', path: 'itemIds', shape: 'ids', op: 'filter', log: false, label: 'node items' },
    { collection: 'nodes', target: 'creature', path: 'creatureIds', shape: 'ids', op: 'filter', log: false, label: 'node creatures' },
    { collection: 'nodes', target: 'tracker', path: 'trackerIds', shape: 'ids', op: 'filter', log: false, label: 'node clocks' },
    { collection: 'nodes', target: 'faction', path: 'factionId', shape: 'id', op: 'null', log: false, label: 'node faction' },
    // corridor links (active topology and every registered map)
    { collection: 'links', target: 'node', path: 'source|target', shape: 'endpoints', op: 'splice', log: false, label: 'corridor endpoint' }
  ].map(row => {
    const nested = /^(\w+)\[\]\.(\w+)$/.exec(row.path);
    return Object.freeze(Object.assign({ list: nested ? nested[1] : null, field: nested ? nested[2] : row.path }, row));
  });

  // The name a changelog entry uses for each referring collection
  const REFERRER_NAMES = {
    factions: r => r.name || r.id,
    npcs: r => r.name || r.id,
    quests: r => r.title || r.name || r.id,
    items: r => r.name || r.id,
    creatures: r => r.name || r.id,
    trackers: r => r.name || r.title || r.id,
    tickets: r => r.title || r.name || r.id,
    spatialpins: r => r.label || r.id,
    nodes: r => r.name || r.id,
    links: r => r.id
  };

  function normalizeEntityCategory(category) {
    const rawCat = String(category || '').toLowerCase().trim();
    if (rawCat === 'clock' || rawCat === 'clocks') return 'trackers';
    if (rawCat === 'spatialpin' || rawCat === 'spatial_pin' || rawCat === 'spatial_pins') return 'spatialpins';
    if (rawCat === 'industry' || rawCat === 'industries' || rawCat === 'facility' || rawCat === 'facilities') return 'items';
    if (rawCat === 'resource' || rawCat === 'resources') return 'items';
    return rawCat.endsWith('s') ? rawCat : rawCat + 's';
  }

  function entityTypeOfCategory(cat) {
    return cat.endsWith('s') ? cat.slice(0, -1) : cat;
  }

  function makeReferenceContext(targetType, entityId) {
    const idStr = String(entityId);
    return {
      targetType,
      idStr,
      matchesId: (val) => val !== null && val !== undefined && String(val) === idStr,
      // 'clock' is the legacy stored name of the tracker type; 'industry' and 'resource' share backing collection with 'item'
      typeMatches: (t) => t === targetType
        || (t === 'clock' && targetType === 'tracker')
        || ((t === 'industry' || t === 'resource') && targetType === 'item')
    };
  }

  // The places a row can look: the record itself, or each element of its nested list
  function referenceSlots(rec, row) {
    if (!row.list) {
      if (rec[row.field] !== undefined) {
        return [{ holder: rec, key: row.field, element: null }];
      }
      if (row.field && row.field.includes('.')) {
        const parts = row.field.split('.');
        let cur = rec;
        for (let i = 0; i < parts.length - 1; i++) {
          cur = cur ? cur[parts[i]] : null;
        }
        return cur ? [{ holder: cur, key: parts[parts.length - 1], element: null }] : [];
      }
      return [{ holder: rec, key: row.field, element: null }];
    }
    const list = rec[row.list];
    if (!Array.isArray(list)) return [];
    if (row.field && row.field.includes('.')) {
      const parts = row.field.split('.');
      return list.filter(Boolean).map(el => {
        if (el[row.field] !== undefined) return { holder: el, key: row.field, element: el };
        let cur = el;
        for (let i = 0; i < parts.length - 1; i++) {
          cur = cur ? cur[parts[i]] : null;
        }
        return cur ? { holder: cur, key: parts[parts.length - 1], element: el } : null;
      }).filter(Boolean);
    }
    return list.filter(Boolean).map(el => ({ holder: el, key: row.field, element: el }));
  }

  // A stored type label (ticket target type, trigger entityType, link type) guards the id match
  function storedTypeOk(label, row, ctx) {
    return label ? ctx.typeMatches(label) : row.untyped === 'match';
  }

  function scalarHit(slot, row, ctx) {
    return ctx.matchesId(slot.holder[slot.key]) && (!row.typeField || storedTypeOk(slot.holder[row.typeField], row, ctx));
  }

  function refRecordHit(r, row, ctx) {
    return !!r && row.idKeys.some(k => ctx.matchesId(r[k])) && (!row.typeKey || storedTypeOk(r[row.typeKey], row, ctx));
  }

  function operationTarget(op, row) {
    return row.opKeys.reduce((found, k) => found || op[k], undefined);
  }

  function linkEndpoints(l) {
    const s = (l.source && typeof l.source === 'object') ? l.source.id : (l.source !== undefined ? l.source : l.u);
    const t = (l.target && typeof l.target === 'object') ? l.target.id : (l.target !== undefined ? l.target : l.v);
    return [s, t];
  }

  function logReferenceChange(changes, collection, rec, field, before, after) {
    changes.push({ category: collection, entityId: String(rec.id), entityName: REFERRER_NAMES[collection](rec), field, before, after });
  }

  // How each shape is matched (hit, read-only) and scrubbed (apply). apply never runs unless the caller is deleting.
  const REFERENCE_SHAPES = {
    id: {
      hit: (rec, row, ctx) => referenceSlots(rec, row).some(slot => scalarHit(slot, row, ctx)),
      apply(rec, row, ctx, changes, collection) {
        referenceSlots(rec, row).forEach(slot => {
          if (!scalarHit(slot, row, ctx)) return;
          if (row.log) {
            const field = row.logAs ? row.logAs.replace('{id}', slot.element.id) : row.path;
            logReferenceChange(changes, collection, rec, field, slot.holder[slot.key], null);
          }
          slot.holder[slot.key] = null;
          if (row.set) Object.assign(slot.holder, row.set);
        });
      }
    },
    ids: {
      hit: (rec, row, ctx) => referenceSlots(rec, row).some(slot => Array.isArray(slot.holder[slot.key]) && slot.holder[slot.key].some(ctx.matchesId)),
      apply(rec, row, ctx, changes, collection) {
        referenceSlots(rec, row).forEach(slot => {
          const arr = slot.holder[slot.key];
          if (!Array.isArray(arr) || !arr.some(ctx.matchesId)) return;
          const before = [...arr];
          slot.holder[slot.key] = arr.filter(id => !ctx.matchesId(id));
          if (row.log) logReferenceChange(changes, collection, rec, row.path, before, [...slot.holder[slot.key]]);
        });
      }
    },
    refs: {
      hit: (rec, row, ctx) => Array.isArray(rec[row.path]) && rec[row.path].some(r => refRecordHit(r, row, ctx)),
      apply(rec, row, ctx, changes, collection) {
        const arr = rec[row.path];
        if (!Array.isArray(arr) || !arr.some(r => refRecordHit(r, row, ctx))) return;
        const before = JSON.parse(JSON.stringify(arr));
        rec[row.path] = arr.filter(r => !refRecordHit(r, row, ctx));
        if (row.log) logReferenceChange(changes, collection, rec, row.path, before, JSON.parse(JSON.stringify(rec[row.path])));
      }
    },
    keys: {
      hit: (rec, row, ctx) => !!rec[row.path] && typeof rec[row.path] === 'object' && Object.keys(rec[row.path]).some(k => String(k) === ctx.idStr),
      apply(rec, row, ctx, changes, collection) {
        const dict = rec[row.path];
        if (!dict || typeof dict !== 'object') return;
        for (const k of Object.keys(dict)) {
          if (String(k) !== ctx.idStr) continue;
          const before = { ...dict };
          delete dict[k];
          if (row.log) logReferenceChange(changes, collection, rec, row.path, before, { ...dict });
        }
      }
    },
    text: {
      hit: (rec, row, ctx) => typeof rec[row.path] === 'string' && rec[row.path].includes(ctx.idStr),
      apply(rec, row, ctx) {
        if (typeof rec[row.path] === 'string' && rec[row.path].includes(ctx.idStr)) rec[row.path] = '';
      }
    },
    operations: {
      hit: (rec, row, ctx) => referenceSlots(rec, row).some(slot => Array.isArray(slot.holder[slot.key]) && slot.holder[slot.key].some(op => !!op && ctx.matchesId(operationTarget(op, row)))),
      // A scrub also drops empty operation entries, as it always has
      apply(rec, row, ctx) {
        referenceSlots(rec, row).forEach(slot => {
          if (Array.isArray(slot.holder[slot.key])) {
            slot.holder[slot.key] = slot.holder[slot.key].filter(op => !!op && !ctx.matchesId(operationTarget(op, row)));
          }
        });
      }
    },
    ticketTarget: {
      hit: (rec, row, ctx) => ctx.typeMatches(rec.targetType) && ctx.matchesId(rec.targetId),
      apply(rec, row, ctx) {
        if (!ctx.typeMatches(rec.targetType) || !ctx.matchesId(rec.targetId)) return;
        rec.targetType = 'campaign';
        rec.targetId = '';
        rec.notes = (rec.notes || '') + `\n[Audit: Target ${ctx.targetType} (${ctx.idStr}) was deleted on ${new Date().toISOString()}]`;
      }
    },
    pinTarget: {
      hit: (rec, row, ctx) => ctx.matchesId(rec.targetId) && (!rec.targetType || ctx.typeMatches(rec.targetType)),
      apply(rec, row, ctx) {
        if (!ctx.matchesId(rec.targetId) || (rec.targetType && !ctx.typeMatches(rec.targetType))) return;
        if (Array.isArray(rec.links) && rec.links.length > 0) {
          rec.targetType = rec.links[0].type;
          rec.targetId = String(rec.links[0].id);
        } else {
          rec.targetId = '';
        }
      }
    },
    endpoints: {
      hit: (rec, row, ctx) => linkEndpoints(rec).some(ctx.matchesId),
      apply: null // a link is removed from its list by the walker
    }
  };

  // Visit every record a reference can live in, in scrub order: entity collections, spatial pins, node records
  // and corridor links of the state, then the same for each registered map (state.maps / activeTopology.maps and
  // options.maps). visit(collection, record, rows, mapId) runs once per record that has rows for this target type.
  // afterScope(owner) runs once the state, then each map, has been visited.
  function eachReferrer(state, targetType, options, visit, afterScope, skipRecord) {
    const rowsByCollection = {};
    const rowsOf = (collection) => rowsByCollection[collection] || (rowsByCollection[collection] = ENTITY_REFERENCE_DESCRIPTORS.filter(r => r.collection === collection && (r.target === '*' || r.target === targetType)));
    const asRecords = (col) => (!col ? [] : (Array.isArray(col) ? col : Object.values(col)));
    const visitRecords = (collection, records, mapId) => {
      const rows = rowsOf(collection);
      if (rows.length === 0) return;
      records.forEach(rec => { if (rec && rec !== skipRecord) visit(collection, rec, rows, mapId); });
    };
    const visitLinks = (linksCol, mapId) => {
      const rows = rowsOf('links');
      if (rows.length === 0 || !Array.isArray(linksCol)) return;
      for (let i = linksCol.length - 1; i >= 0; i--) {
        if (linksCol[i]) visit('links', linksCol[i], rows, mapId, linksCol, i);
      }
    };
    const seenPinLists = new Set();
    const visitPins = (pins, mapId) => {
      if (!Array.isArray(pins) || seenPinLists.has(pins)) return;
      seenPinLists.add(pins);
      visitRecords('spatialpins', pins, mapId);
    };

    ['factions', 'npcs', 'quests', 'items', 'creatures', 'trackers', 'tickets'].forEach(name => {
      const list = getTargetCollection(state, name);
      if (Array.isArray(list)) visitRecords(name, list, null);
    });
    visitPins(getTargetCollection(state, 'spatialpins'), null);
    visitPins(state.spatialPins, null);
    if (state.activeTopology) visitPins(state.activeTopology.spatialPins, null);
    visitRecords('nodes', asRecords(getTargetCollection(state, 'nodes')), null);
    visitLinks(state.links || (state.activeTopology && state.activeTopology.links), null);
    if (afterScope) afterScope(state);

    const seenMaps = new Set();
    [state.maps || (state.activeTopology && state.activeTopology.maps), options && options.maps].forEach(registry => {
      if (!registry || typeof registry !== 'object') return;
      Object.keys(registry).forEach(key => {
        const m = registry[key];
        if (!m || seenMaps.has(m)) return;
        seenMaps.add(m);
        const mapId = m.id || key;
        visitRecords('nodes', asRecords(m.nodes), mapId);
        visitLinks(m.links, mapId);
        visitPins(m.spatialPins, mapId);
        if (afterScope) afterScope(m);
      });
    });
  }

  /**
   * Read-only twin of the deleteEntity scrub: every record that holds a reference to the entity, found through
   * the same descriptor table. Returns [{ collection, entityId, field, label, mapId? }] (mapId only for records
   * that live on a registered map). The entity's own record is skipped, as deleteEntity removes it first.
   * options.maps adds a map registry to search, as it does for deleteEntity.
   */
  function findEntityReferences(state, category, entityIdOrRef, options = {}) {
    if (!state || entityIdOrRef === null || entityIdOrRef === undefined || entityIdOrRef === '') return [];
    const cat = normalizeEntityCategory(category);
    const targetType = entityTypeOfCategory(cat);
    const resolvedId = resolveEntityRef(state, cat, entityIdOrRef, options.symbolTable);
    const entityId = resolvedId !== null && resolvedId !== undefined ? resolvedId : String(entityIdOrRef);
    const ctx = makeReferenceContext(targetType, entityId);

    const own = getTargetCollection(state, cat);
    const skipRecord = Array.isArray(own)
      ? own.find(e => e && String(e.id) === ctx.idStr)
      : (own && typeof own === 'object' ? own[entityId] : undefined);

    const found = [];
    eachReferrer(state, targetType, options, (collection, rec, rows, mapId) => {
      rows.forEach(row => {
        if (!REFERENCE_SHAPES[row.shape].hit(rec, row, ctx)) return;
        const ref = { collection, entityId: collection === 'links' ? linkEndpoints(rec).join('->') : String(rec.id), field: row.path, label: row.label };
        if (mapId) ref.mapId = mapId;
        found.push(ref);
      });
    }, null, skipRecord);
    return found;
  }

  function deleteEntity(state, category, entityIdOrRef, batchContext = {}) {
    const cat = normalizeEntityCategory(category);
    const collection = getTargetCollection(state, cat);
    if (!collection && !batchContext.allowMissingEntity) return false;

    const changes = batchContext.changes || [];
    const resolvedId = resolveEntityRef(state, cat, entityIdOrRef, batchContext.symbolTable);
    const entityId = resolvedId !== null && resolvedId !== undefined
      ? resolvedId
      : (batchContext.allowMissingEntity && entityIdOrRef !== null && entityIdOrRef !== undefined ? String(entityIdOrRef) : null);
    if (entityId === null || entityId === undefined || entityId === '') return false;

    const isNodeDict = (cat === 'nodes' && collection && !Array.isArray(collection) && typeof collection === 'object');
    let targetEntity = null;
    let idx = -1;

    if (collection) {
      if (isNodeDict) {
        targetEntity = collection[entityId];
        if (!targetEntity && !batchContext.allowMissingEntity) return false;
        if (targetEntity) delete collection[entityId];
      } else if (Array.isArray(collection)) {
        idx = collection.findIndex(e => e && String(e.id) === String(entityId));
        if (idx < 0 && !batchContext.allowMissingEntity) return false;
        if (idx >= 0) {
          targetEntity = collection[idx];
          collection.splice(idx, 1);
        }
      }
    }

    if (targetEntity) {
      const entityName = targetEntity.name || targetEntity.title || targetEntity.label || `${cat}_${entityId}`;
      changes.push({
        category: cat,
        entityId: String(entityId),
        entityName: entityName,
        field: '_entity',
        before: JSON.parse(JSON.stringify(targetEntity)),
        after: null
      });
    }

    // Cascade cleanup of every reference to the deleted entity. ENTITY_REFERENCE_DESCRIPTORS says where the
    // references live and how each one is scrubbed; findEntityReferences reads the same table.
    const targetType = entityTypeOfCategory(cat);
    const ctx = makeReferenceContext(targetType, entityId);
    eachReferrer(state, targetType, batchContext, (collectionName, rec, rows, mapId, linksCol, linkIndex) => {
      if (collectionName === 'links') {
        if (rows.some(row => REFERENCE_SHAPES[row.shape].hit(rec, row, ctx))) linksCol.splice(linkIndex, 1);
        return;
      }
      rows.forEach(row => REFERENCE_SHAPES[row.shape].apply(rec, row, ctx, changes, collectionName));
    }, owner => {
      // Corridor keys (edgeData, edgeNotes, edgeSlottedModules) are not id fields, so they stay outside the table
      if (targetType !== 'node') return;
      removeCorridorsForNode(owner, entityId);
      if (owner === state && state.activeTopology && state.activeTopology !== state) removeCorridorsForNode(state.activeTopology, entityId);
    });

    return true;
  }

  function remapEntityCluster(cluster, optionsOrSubmaps = {}, entityIdMapArg = undefined, mapIdMapArg = undefined) {
    if (!cluster || typeof cluster !== 'object') return cluster;

    let mutateInPlace = false;
    let preservePrototypeId = true;
    let idGenerator = null;
    let idMap = null;
    let mapIdMap = null;
    let submaps = null;
    let autoGenerateIds = true;

    const isLegacyFourArg = (arguments.length >= 3 || entityIdMapArg !== undefined || mapIdMapArg !== undefined);
    const OPTION_KEYS = new Set(['mutateInPlace', 'idGenerator', 'preservePrototypeId', 'idMap', 'mapIdMap', 'submaps', 'autoGenerateIds']);

    if (isLegacyFourArg) {
      mutateInPlace = true;
      autoGenerateIds = false;
      submaps = optionsOrSubmaps;
      idMap = entityIdMapArg || {};
      mapIdMap = mapIdMapArg || {};
    } else if (optionsOrSubmaps instanceof Map) {
      idMap = optionsOrSubmaps;
      if (idMap.size > 0) {
        mutateInPlace = true;
        autoGenerateIds = false;
      }
    } else if (optionsOrSubmaps && typeof optionsOrSubmaps === 'object') {
      const keys = Object.keys(optionsOrSubmaps);
      const looksLikePlainIdMap = keys.length > 0 && keys.every(k => !OPTION_KEYS.has(k) && (typeof optionsOrSubmaps[k] === 'string' || typeof optionsOrSubmaps[k] === 'number'));
      if (looksLikePlainIdMap) {
        idMap = optionsOrSubmaps;
        mutateInPlace = true;
        autoGenerateIds = false;
      } else {
        mutateInPlace = !!optionsOrSubmaps.mutateInPlace;
        preservePrototypeId = optionsOrSubmaps.preservePrototypeId !== false;
        idGenerator = typeof optionsOrSubmaps.idGenerator === 'function' ? optionsOrSubmaps.idGenerator : null;
        idMap = optionsOrSubmaps.idMap || {};
        mapIdMap = optionsOrSubmaps.mapIdMap || {};
        submaps = optionsOrSubmaps.submaps || null;
        if (optionsOrSubmaps.autoGenerateIds !== undefined) {
          autoGenerateIds = !!optionsOrSubmaps.autoGenerateIds;
        } else {
          const existingMapSize = (idMap instanceof Map) ? idMap.size : Object.keys(idMap).length;
          autoGenerateIds = (existingMapSize === 0 || !!idGenerator);
        }
      }
    } else {
      idMap = {};
    }

    if (!mapIdMap) mapIdMap = {};

    const hasId = (m, k) => {
      if (!m || k === null || k === undefined) return false;
      const ks = String(k);
      return (m instanceof Map) ? (m.has(k) || m.has(ks)) : (Object.prototype.hasOwnProperty.call(m, k) || Object.prototype.hasOwnProperty.call(m, ks));
    };
    const getId = (m, k) => {
      if (!m || k === null || k === undefined) return k;
      const ks = String(k);
      if (m instanceof Map) {
        if (m.has(k)) return m.get(k);
        if (m.has(ks)) return m.get(ks);
        return k;
      }
      if (Object.prototype.hasOwnProperty.call(m, k)) return m[k];
      if (Object.prototype.hasOwnProperty.call(m, ks)) return m[ks];
      return k;
    };
    const setId = (m, k, v) => {
      if (!m || k === null || k === undefined) return;
      const ks = String(k);
      if (m instanceof Map) {
        m.set(ks, v);
      } else {
        m[ks] = v;
      }
    };

    const targetCluster = mutateInPlace ? cluster : JSON.parse(JSON.stringify(cluster));
    const container = (targetCluster.entities && typeof targetCluster.entities === 'object' && !Array.isArray(targetCluster.npcs))
      ? targetCluster.entities
      : targetCluster;

    const categoryDefs = [
      { key: 'factions', single: 'faction', prefix: 'fac' },
      { key: 'npcs', single: 'npc', prefix: 'npc' },
      { key: 'quests', single: 'quest', prefix: 'quest' },
      { key: 'items', single: 'item', prefix: 'item' },
      { key: 'creatures', single: 'creature', prefix: 'creature' },
      { key: 'trackers', single: 'tracker', prefix: 'trk' },
      { key: 'tickets', single: 'ticket', prefix: 'tkt' }
    ];

    // Pass 1: Assign or apply new IDs across the cluster
    if (!isLegacyFourArg) {
      categoryDefs.forEach(({ key, single, prefix }) => {
        const list = container[key];
        if (!Array.isArray(list)) return;
        list.forEach(ent => {
          if (!ent || ent.id === undefined || ent.id === null) return;
          const oldId = String(ent.id);
          if (hasId(idMap, oldId)) {
            const mappedId = getId(idMap, oldId);
            const collisionInList = list.some(other => other !== ent && other && String(other.id) === String(mappedId));
            if (!collisionInList) {
              if (preservePrototypeId && !ent.prototypeId) ent.prototypeId = oldId;
              ent.id = mappedId;
            }
          } else if (autoGenerateIds) {
            const newId = idGenerator ? idGenerator(single, ent) : generateMonotonicId(prefix);
            setId(idMap, oldId, newId);
            if (preservePrototypeId && !ent.prototypeId) ent.prototypeId = oldId;
            ent.id = newId;
          }
        });
      });
    }

    const hasEntityRemaps = (idMap instanceof Map) ? idMap.size > 0 : (idMap && Object.keys(idMap).length > 0);
    const hasMapRemaps = (mapIdMap instanceof Map) ? mapIdMap.size > 0 : (mapIdMap && Object.keys(mapIdMap).length > 0);

    const remapId = (id) => (hasEntityRemaps && hasId(idMap, id)) ? getId(idMap, id) : id;
    const remapArr = (arr) => Array.isArray(arr) ? arr.map(remapId) : arr;
    const remapMapId = (id) => (hasMapRemaps && hasId(mapIdMap, id)) ? getId(mapIdMap, id) : id;

    // Pass 2: Rewrite internal foreign keys across all entity tables
    if (hasEntityRemaps || hasMapRemaps) {
      // 1. Remap Factions
      if (Array.isArray(container.factions)) {
        for (const fac of container.factions) {
          if (!fac) continue;
          if (fac.leaderNpcId) fac.leaderNpcId = remapId(fac.leaderNpcId);
          if (Array.isArray(fac.memberNpcIds)) fac.memberNpcIds = remapArr(fac.memberNpcIds);
          if (Array.isArray(fac.controlledNodeIds)) fac.controlledNodeIds = remapArr(fac.controlledNodeIds);
          if (fac.homeNodeId) fac.homeNodeId = remapId(fac.homeNodeId);
          if (fac.headquartersNodeId) fac.headquartersNodeId = remapId(fac.headquartersNodeId);
          if (Array.isArray(fac.alliedFactionIds)) fac.alliedFactionIds = remapArr(fac.alliedFactionIds);
          if (Array.isArray(fac.rivalFactionIds)) fac.rivalFactionIds = remapArr(fac.rivalFactionIds);
          if (fac.submapId) fac.submapId = remapMapId(fac.submapId);
          if (fac.diplomaticStances && typeof fac.diplomaticStances === 'object') {
            const newStances = {};
            for (const [targetFacId, stance] of Object.entries(fac.diplomaticStances)) {
              newStances[remapId(targetFacId)] = stance;
            }
            fac.diplomaticStances = newStances;
          }
        }
      }

      // 2. Remap NPCs
      if (Array.isArray(container.npcs)) {
        for (const npc of container.npcs) {
          if (!npc) continue;
          if (npc.factionId) npc.factionId = remapId(npc.factionId);
          if (npc.faction) npc.faction = remapId(npc.faction);
          if (Array.isArray(npc.questIds)) npc.questIds = remapArr(npc.questIds);
          if (Array.isArray(npc.itemIds)) npc.itemIds = remapArr(npc.itemIds);
          if (Array.isArray(npc.inventoryItemIds)) npc.inventoryItemIds = remapArr(npc.inventoryItemIds);
          if (Array.isArray(npc.carriedItemIds)) npc.carriedItemIds = remapArr(npc.carriedItemIds);
          if (npc.currentNodeId) npc.currentNodeId = remapId(npc.currentNodeId);
          if (npc.homeNodeId) npc.homeNodeId = remapId(npc.homeNodeId);
          if (npc.nodeId) npc.nodeId = remapId(npc.nodeId);
          if (npc.submapId) npc.submapId = remapMapId(npc.submapId);
          if (Array.isArray(npc.relationships)) {
            for (const rel of npc.relationships) {
              if (!rel) continue;
              if (rel.targetNpcId) rel.targetNpcId = remapId(rel.targetNpcId);
              if (rel.npcId) rel.npcId = remapId(rel.npcId);
            }
          }
        }
      }

      // 3. Remap Quests
      if (Array.isArray(container.quests)) {
        for (const q of container.quests) {
          if (!q) continue;
          if (Array.isArray(q.npcIds)) q.npcIds = remapArr(q.npcIds);
          if (q.targetNpcId) q.targetNpcId = remapId(q.targetNpcId);
          if (q.giverNpcId) q.giverNpcId = remapId(q.giverNpcId);
          if (q.factionId) q.factionId = remapId(q.factionId);
          if (q.faction) q.faction = remapId(q.faction);
          if (Array.isArray(q.itemIds)) q.itemIds = remapArr(q.itemIds);
          if (Array.isArray(q.rewardItemIds)) q.rewardItemIds = remapArr(q.rewardItemIds);
          if (q.rewardItemId) q.rewardItemId = remapId(q.rewardItemId);
          if (Array.isArray(q.trackerIds)) q.trackerIds = remapArr(q.trackerIds);
          if (q.targetNodeId) q.targetNodeId = remapId(q.targetNodeId);
          if (q.originNodeId) q.originNodeId = remapId(q.originNodeId);
          if (q.nodeId) q.nodeId = remapId(q.nodeId);
          if (q.anchorNodeId) q.anchorNodeId = remapId(q.anchorNodeId);
          if (q.submapId) q.submapId = remapMapId(q.submapId);
          if (Array.isArray(q.steps)) {
            for (const st of q.steps) {
              if (!st) continue;
              if (st.triggerTrackerId) st.triggerTrackerId = remapId(st.triggerTrackerId);
              if (st.targetNpcId) st.targetNpcId = remapId(st.targetNpcId);
              if (st.targetNodeId) st.targetNodeId = remapId(st.targetNodeId);
              if (st.requiredItemId) st.requiredItemId = remapId(st.requiredItemId);
            }
          }
        }
      }

      // 4. Remap Items
      if (Array.isArray(container.items)) {
        for (const it of container.items) {
          if (!it) continue;
          if (it.ownerNpcId) it.ownerNpcId = remapId(it.ownerNpcId);
          if (it.linkedQuestId) it.linkedQuestId = remapId(it.linkedQuestId);
          if (it.questId) it.questId = remapId(it.questId);
          if (it.factionId) it.factionId = remapId(it.factionId);
          if (it.locationNodeId) it.locationNodeId = remapId(it.locationNodeId);
          if (it.nodeId) it.nodeId = remapId(it.nodeId);
          if (it.submapId) it.submapId = remapMapId(it.submapId);
        }
      }

      // 4b. Remap Creatures
      if (Array.isArray(container.creatures)) {
        for (const cr of container.creatures) {
          if (!cr) continue;
          if (cr.nodeId) cr.nodeId = remapId(cr.nodeId);
          if (cr.stationing && cr.stationing.nodeId) cr.stationing.nodeId = remapId(cr.stationing.nodeId);
          if (cr.factionId) cr.factionId = remapId(cr.factionId);
          if (cr.submapId) cr.submapId = remapMapId(cr.submapId);
        }
      }

      // 5. Remap Trackers
      if (Array.isArray(container.trackers)) {
        for (const tr of container.trackers) {
          if (!tr) continue;
          if (tr.nodeId) tr.nodeId = remapId(tr.nodeId);
          if (tr.factionId) tr.factionId = remapId(tr.factionId);
          if (tr.submapId) tr.submapId = remapMapId(tr.submapId);
          if (Array.isArray(tr.triggerRefs)) {
            for (const ref of tr.triggerRefs) {
              if (ref && ref.entityId) ref.entityId = remapId(ref.entityId);
            }
          }
          if (Array.isArray(tr.consequences)) {
            for (const c of tr.consequences) {
              if (!c) continue;
              if (c.targetId) c.targetId = remapId(c.targetId);
              if (c.questId) c.questId = remapId(c.questId);
              if (c.trackerId) c.trackerId = remapId(c.trackerId);
              if (c.clockId) c.clockId = remapId(c.clockId);
              if (c.nodeId) c.nodeId = remapId(c.nodeId);
              if (c.npcId) c.npcId = remapId(c.npcId);
              if (c.factionId) c.factionId = remapId(c.factionId);
              if (c.itemId) c.itemId = remapId(c.itemId);
              if (Array.isArray(c.operations)) {
                for (const op of c.operations) {
                  if (!op) continue;
                  ['id', 'entityId', 'npc', 'quest', 'clock', 'tracker', 'item', 'faction', 'node', 'source', 'target', 'sourceNpc', 'targetNpc'].forEach(k => {
                    if (op[k]) op[k] = remapId(op[k]);
                  });
                }
              }
            }
          }
        }
      }

      // 6. Remap Tickets
      if (Array.isArray(container.tickets)) {
        for (const tk of container.tickets) {
          if (!tk) continue;
          if (tk.linkedNodeId) tk.linkedNodeId = remapId(tk.linkedNodeId);
          if (tk.linkedNpcId) tk.linkedNpcId = remapId(tk.linkedNpcId);
          if (tk.linkedQuestId) tk.linkedQuestId = remapId(tk.linkedQuestId);
          if (tk.linkedFactionId) tk.linkedFactionId = remapId(tk.linkedFactionId);
          if (tk.linkedItemId) tk.linkedItemId = remapId(tk.linkedItemId);
          if (tk.linkedTrackerId) tk.linkedTrackerId = remapId(tk.linkedTrackerId);
          if (tk.targetId) tk.targetId = remapId(tk.targetId);
        }
      }

      // 7. Remap Spatial Pins
      const remapPins = (pinsArr) => {
        if (!Array.isArray(pinsArr)) return;
        for (const pin of pinsArr) {
          if (!pin) continue;
          if (pin.targetId) {
            pin.targetId = (pin.targetType === 'submap') ? remapMapId(pin.targetId) : remapId(pin.targetId);
          }
          if (pin.linkedEntityId) pin.linkedEntityId = remapId(pin.linkedEntityId);
          if (Array.isArray(pin.links)) {
            for (const lnk of pin.links) {
              if (lnk && lnk.id) {
                lnk.id = (lnk.type === 'submap') ? remapMapId(lnk.id) : remapId(lnk.id);
              }
            }
          }
        }
      };
      remapPins(container.spatialPins);
      if (targetCluster.spatialPins && targetCluster.spatialPins !== container.spatialPins) {
        remapPins(targetCluster.spatialPins);
      }

      // 8. Remap Submap Nodes
      const mapsToRemap = submaps || targetCluster.maps;
      if (mapsToRemap && typeof mapsToRemap === 'object') {
        for (const mId of Object.keys(mapsToRemap)) {
          const mapObj = mapsToRemap[mId];
          if (!mapObj) continue;
          if (mapObj.nodes) {
            const nodesList = Array.isArray(mapObj.nodes) ? mapObj.nodes : Object.values(mapObj.nodes);
            for (const node of nodesList) {
              if (!node) continue;
              if (node.stationedNpcIds) node.stationedNpcIds = remapArr(node.stationedNpcIds);
              if (node.npcIds) node.npcIds = remapArr(node.npcIds);
              if (node.questIds) node.questIds = remapArr(node.questIds);
              if (node.itemIds) node.itemIds = remapArr(node.itemIds);
              if (node.trackerIds) node.trackerIds = remapArr(node.trackerIds);
              if (node.factionId) node.factionId = remapId(node.factionId);
              if (hasMapRemaps && node.childMapId && hasId(mapIdMap, node.childMapId)) {
                node.childMapId = remapMapId(node.childMapId);
              }
            }
          }
          if (Array.isArray(mapObj.spatialPins)) {
            remapPins(mapObj.spatialPins);
          }
        }
      }
    }

    try {
      Object.defineProperty(targetCluster, '_idMap', {
        value: idMap,
        writable: true,
        enumerable: false,
        configurable: true
      });
    } catch (_) {}

    return targetCluster;
  }

  function linkEntities(state, sourceRef, targetRef, linkType = 'auto', metadata = {}, batchContext = {}) {
    const changes = batchContext.changes || [];
    const sId = resolveEntityRef(state, metadata.sourceType || 'npc', sourceRef, batchContext.symbolTable);
    const tId = resolveEntityRef(state, metadata.targetType || 'quest', targetRef, batchContext.symbolTable);
    if (!sId || !tId) return false;

    // Detect link types
    if (linkType === 'quest_npc' || (!linkType && metadata.sourceType === 'quest' && metadata.targetType === 'npc')) {
      const quests = ensureEntityCollection(state, 'quests');
      const q = quests.find(x => String(x.id) === String(sId));
      if (q) {
        if (!Array.isArray(q.npcIds)) q.npcIds = [];
        if (!q.npcIds.includes(tId)) {
          changes.push({ category: 'quests', entityId: String(q.id), entityName: q.title || q.id, field: 'npcIds', before: [...q.npcIds], after: [...q.npcIds, tId] });
          q.npcIds.push(tId);
          return true;
        }
      }
    } else if (linkType === 'quest_clock' || linkType === 'quest_tracker') {
      const quests = ensureEntityCollection(state, 'quests');
      const q = quests.find(x => String(x.id) === String(sId));
      if (q) {
        if (!Array.isArray(q.trackerIds)) q.trackerIds = [];
        if (!q.trackerIds.includes(tId)) {
          changes.push({ category: 'quests', entityId: String(q.id), entityName: q.title || q.id, field: 'trackerIds', before: [...q.trackerIds], after: [...q.trackerIds, tId] });
          q.trackerIds.push(tId);
        }
      }
      const trackers = ensureEntityCollection(state, 'trackers');
      const tr = trackers.find(x => String(x.id) === String(tId));
      if (tr) {
        if (!Array.isArray(tr.triggerRefs)) tr.triggerRefs = [];
        const hasRef = tr.triggerRefs.some(r => r && r.entityType === 'quest' && String(r.entityId) === String(sId));
        if (!hasRef) {
          changes.push({ category: 'trackers', entityId: String(tr.id), entityName: tr.name || tr.id, field: 'triggerRefs', before: [...tr.triggerRefs], after: [...tr.triggerRefs, { entityType: 'quest', entityId: sId }] });
          tr.triggerRefs.push({ entityType: 'quest', entityId: sId });
        }
      }
      return true;
    } else if (linkType === 'npc_relationship') {
      const npcs = ensureEntityCollection(state, 'npcs');
      const n1 = npcs.find(x => String(x.id) === String(sId));
      if (n1) {
        if (!Array.isArray(n1.relationships)) n1.relationships = [];
        const existingRel = n1.relationships.find(r => r && String(r.targetNpcId) === String(tId));
        const relData = {
          targetNpcId: tId,
          relationshipType: metadata.relationshipType || 'Ally',
          sentiment: metadata.sentiment !== undefined ? Number(metadata.sentiment) : 0,
          notes: metadata.notes || ''
        };
        changes.push({ category: 'npcs', entityId: String(n1.id), entityName: n1.name || n1.id, field: 'relationships', before: JSON.parse(JSON.stringify(n1.relationships)), after: [...n1.relationships.filter(r => String(r.targetNpcId) !== String(tId)), relData] });
        if (existingRel) {
          Object.assign(existingRel, relData);
        } else {
          n1.relationships.push(relData);
        }
        return true;
      }
    } else if (linkType === 'item_owner') {
      const items = ensureEntityCollection(state, 'items');
      const it = items.find(x => String(x.id) === String(sId));
      if (it) {
        changes.push({ category: 'items', entityId: String(it.id), entityName: it.name || it.id, field: 'ownerNpcId', before: it.ownerNpcId, after: tId });
        it.ownerNpcId = tId;
        it.possessionMode = 'carried';
        return true;
      }
    }
    return false;
  }

  function unlinkEntities(state, sourceRef, targetRef, linkType = 'auto', batchContext = {}) {
    const changes = batchContext.changes || [];
    const sId = resolveEntityRef(state, 'any', sourceRef, batchContext.symbolTable);
    const tId = resolveEntityRef(state, 'any', targetRef, batchContext.symbolTable);
    if (!sId || !tId) return false;

    if (linkType === 'npc_relationship') {
      const npcs = ensureEntityCollection(state, 'npcs');
      const n1 = npcs.find(x => String(x.id) === String(sId));
      if (n1 && Array.isArray(n1.relationships)) {
        const before = JSON.parse(JSON.stringify(n1.relationships));
        n1.relationships = n1.relationships.filter(r => String(r.targetNpcId) !== String(tId));
        changes.push({ category: 'npcs', entityId: String(n1.id), entityName: n1.name || n1.id, field: 'relationships', before, after: JSON.parse(JSON.stringify(n1.relationships)) });
        return true;
      }
    }
    return false;
  }

  function executeBrowserConsequence(state, tr, c, options = {}, batchContext = {}) {
    if (!c || typeof c !== 'object') return;
    const cType = String(c.type || c.actionType || '').toLowerCase().trim();
    if (!cType) return;

    const targetRef = c.targetId || c.entityId || c.questId || c.npcId || c.nodeId || c.trackerId || c.clockId || c.factionId;

    if (cType === 'unlock_quest' || cType === 'activate_quest') {
      const quests = getTargetCollection(state, 'quests') || [];
      const qId = resolveEntityRef(state, 'quest', c.questId || c.quest || targetRef, batchContext.symbolTable);
      const q = quests.find(x => x && (String(x.id) === String(qId) || String(x.id) === String(targetRef)));
      if (q) {
        q.status = c.status || 'Active';
        q.unlocked = true;
        if (q.hidden) q.hidden = false;
      }
    } else if (cType === 'complete_quest') {
      const quests = getTargetCollection(state, 'quests') || [];
      const qId = resolveEntityRef(state, 'quest', c.questId || c.quest || targetRef, batchContext.symbolTable);
      const q = quests.find(x => x && (String(x.id) === String(qId) || String(x.id) === String(targetRef)));
      if (q) q.status = 'Completed';
    } else if (cType === 'fail_quest') {
      const quests = getTargetCollection(state, 'quests') || [];
      const qId = resolveEntityRef(state, 'quest', c.questId || c.quest || targetRef, batchContext.symbolTable);
      const q = quests.find(x => x && (String(x.id) === String(qId) || String(x.id) === String(targetRef)));
      if (q) q.status = 'Failed';
    } else if (cType === 'spawn_entity') {
      const entCat = c.entityType || c.category || c.targetType || 'npc';
      const payload = c.entity || c.payload || c.data || {
        id: targetRef || generateMonotonicId(String(entCat).slice(0, 3)),
        name: c.name || c.label || c.description || 'Spawned Entity',
        title: c.title || c.name || c.label || c.description || 'Spawned Entity',
        nodeId: c.nodeId !== undefined ? c.nodeId : (tr.nodeId || null),
        status: c.status || 'Active',
        hidden: false
      };
      upsertEntity(state, entCat, payload, batchContext);
    } else if (cType === 'activate_npc') {
      const npcs = getTargetCollection(state, 'npcs') || [];
      const nId = resolveEntityRef(state, 'npc', c.npcId || c.npc || targetRef, batchContext.symbolTable);
      const npc = npcs.find(x => x && (String(x.id) === String(nId) || String(x.id) === String(targetRef)));
      if (npc) {
        npc.status = c.status || 'Active';
        if (npc.hidden) npc.hidden = false;
        if (c.nodeId !== undefined) npc.nodeId = c.nodeId;
      }
    } else if (cType === 'modify_odv') {
      const nodeKey = c.nodeId || c.targetId || tr.nodeId;
      const nodesCol = getTargetCollection(state, 'nodes');
      let targetObj = null;
      if (nodesCol && nodeKey !== undefined && nodeKey !== null) {
        const resolvedN = resolveNodeRef(state, nodeKey, batchContext.symbolTable) || String(nodeKey);
        targetObj = Array.isArray(nodesCol)
          ? nodesCol.find(n => n && String(n.id) === String(resolvedN))
          : (nodesCol[resolvedN] || nodesCol[nodeKey]);
      }
      if (!targetObj && (c.factionId || c.targetType === 'faction')) {
        const facs = getTargetCollection(state, 'factions') || [];
        targetObj = facs.find(f => f && String(f.id) === String(c.factionId || targetRef));
      }
      if (!targetObj && (c.npcId || c.targetType === 'npc')) {
        const npcs = getTargetCollection(state, 'npcs') || [];
        targetObj = npcs.find(n => n && String(n.id) === String(c.npcId || targetRef));
      }
      if (targetObj) {
        const clamp = (v) => Math.max(1, Math.min(4, Number(v) || 2));
        const curOdv = normalizeOdv(targetObj.odv !== undefined ? targetObj.odv : (typeof targetObj.disposition === 'number' ? null : targetObj.disposition));
        const nextOdv = (c.odv || c.disposition) ? normalizeOdv(c.odv || c.disposition) : null;
        if (nextOdv) {
          targetObj.odv = { s: clamp(nextOdv.s), e: clamp(nextOdv.e), c: clamp(nextOdv.c) };
          targetObj.odvSource = 'authored';
        } else if (curOdv && (c.delta || c.deltaS !== undefined || c.deltaE !== undefined || c.deltaC !== undefined)) {
          const ds = Array.isArray(c.delta) ? (Number(c.delta[0]) || 0) : (c.delta && typeof c.delta === 'object' ? (Number(c.delta.s) || 0) : (Number(c.deltaS) || 0));
          const de = Array.isArray(c.delta) ? (Number(c.delta[1]) || 0) : (c.delta && typeof c.delta === 'object' ? (Number(c.delta.e) || 0) : (Number(c.deltaE) || 0));
          const dc = Array.isArray(c.delta) ? (Number(c.delta[2]) || 0) : (c.delta && typeof c.delta === 'object' ? (Number(c.delta.c) || 0) : (Number(c.deltaC) || 0));
          targetObj.odv = {
            s: clamp(curOdv.s + ds),
            e: clamp(curOdv.e + de),
            c: clamp(curOdv.c + dc)
          };
          targetObj.odvSource = 'authored';
        }
      }
    } else if (cType === 'reveal_node') {
      const nodeKey = c.nodeId || c.targetId || tr.nodeId;
      const nodesCol = getTargetCollection(state, 'nodes');
      if (nodesCol && nodeKey !== undefined && nodeKey !== null) {
        const resolvedN = resolveNodeRef(state, nodeKey, batchContext.symbolTable) || String(nodeKey);
        const nodeObj = Array.isArray(nodesCol)
          ? nodesCol.find(n => n && String(n.id) === String(resolvedN))
          : (nodesCol[resolvedN] || nodesCol[nodeKey]);
        if (nodeObj) {
          nodeObj.hidden = false;
          nodeObj.revealed = true;
          nodeObj.fogOfWar = false;
          if (nodeObj.status === 'Hidden' || nodeObj.status === 'Locked') nodeObj.status = 'Active';
        }
      }
    } else if (cType === 'advance_tracker' || cType === 'tick_clock') {
      const targetClk = c.trackerId || c.clockId || c.clock || c.tracker || targetRef;
      const stepDelta = c.delta !== undefined ? Number(c.delta) : (c.ticks !== undefined ? Number(c.ticks) : 1);
      const depth = (options.cascadeDepth || 0) + 1;
      if (depth <= 3 && targetClk && String(targetClk) !== String(tr.id)) {
        tickClock(state, targetClk, stepDelta, { ...options, cascadeDepth: depth }, batchContext);
      }
    } else if (cType === 'trigger_event') {
      const evtRecord = {
        clockId: tr.id,
        clockName: tr.name || tr.title || tr.id,
        tick: c.tick,
        eventId: c.eventId || targetRef || c.id || null,
        description: c.description || c.message || '',
        triggeredAt: c.triggeredAt || new Date().toISOString()
      };
      if (!Array.isArray(state.triggeredEvents)) state.triggeredEvents = [];
      state.triggeredEvents.push(evtRecord);
      if (state.activeTopology && state.activeTopology !== state) {
        if (!Array.isArray(state.activeTopology.triggeredEvents)) state.activeTopology.triggeredEvents = state.triggeredEvents;
      }
    }
  }

  function tickClock(state, clockRef, delta = 1, options = {}, batchContext = {}) {
    const trackers = ensureEntityCollection(state, 'trackers');
    const clkId = resolveEntityRef(state, 'tracker', clockRef, batchContext.symbolTable);
    const tr = trackers.find(t => t && (String(t.id) === String(clkId) || String(t.prototypeId) === String(clkId)));
    if (!tr) return null;

    const prevTicks = tr.currentTicks !== undefined ? tr.currentTicks : (tr.value !== undefined ? tr.value : 0);
    const maxTicks = tr.maxTicks || tr.max || 6;
    let newTicks = prevTicks;
    if (delta === -999) {
      newTicks = 0;
    } else {
      newTicks = Math.max(0, Math.min(maxTicks, prevTicks + delta));
    }
    tr.currentTicks = newTicks;
    if (tr.value !== undefined) tr.value = newTicks;

    const changes = batchContext.changes || [];
    changes.push({
      category: 'trackers',
      entityId: String(tr.id),
      entityName: tr.name || tr.title || tr.id,
      field: 'currentTicks',
      before: prevTicks,
      after: newTicks
    });

    let crossed = [];

    // Evaluate consequences
    if (Array.isArray(tr.consequences)) {
      if (newTicks > prevTicks) {
        crossed = tr.consequences
          .filter(c => c && typeof c.tick === 'number' && prevTicks < c.tick && newTicks >= c.tick && !c.triggered)
          .sort((a, b) => a.tick - b.tick);

        crossed.forEach(c => {
          c.triggered = true;
          c.triggeredAt = new Date().toISOString();
          if (batchContext.batchId) c.triggeredByBatchId = batchContext.batchId;

          // Execute browser/structured consequence type if present
          executeBrowserConsequence(state, tr, c, options, batchContext);

          // If consequence has operations and depth <= 3, execute them recursively
          if (Array.isArray(c.operations) && c.operations.length > 0) {
            const depth = (options.cascadeDepth || 0) + 1;
            if (depth <= 3) {
              applyBatch(state, {
                actor: 'Clock Consequence',
                summary: `Consequence of ${tr.name || tr.title} reaching tick ${c.tick}: ${c.description}`,
                operations: c.operations
              }, { cascadeDepth: depth });
            }
          }
        });
      } else if (newTicks < prevTicks) {
        const rolledBack = tr.consequences
          .filter(c => c && typeof c.tick === 'number' && newTicks < c.tick && prevTicks >= c.tick && c.triggered);
        rolledBack.forEach(c => {
          c.triggered = false;
          delete c.triggeredAt;
          delete c.triggeredByBatchId;
        });
      }
    }

    try {
      Object.defineProperty(tr, '_lastTriggeredConsequences', {
        value: crossed,
        writable: true,
        enumerable: false,
        configurable: true
      });
    } catch (_) {
      tr._lastTriggeredConsequences = crossed;
    }

    return tr;
  }

  // --- Verb Alias Normalization ---

  function normalizeOperation(op) {
    if (!op || typeof op !== 'object') return null;
    const v = String(op.op || op.verb || '').toLowerCase().trim();

    // 1. Quests
    if (v === 'create_quest' || v === 'add_quest') {
      return { op: 'upsert_entity', category: 'quests', data: { ...op, status: op.status || 'Active' } };
    }
    if (v === 'update_quest') {
      return { op: 'upsert_entity', category: 'quests', data: op };
    }
    if (v === 'delete_quest' || v === 'remove_quest') {
      return { op: 'delete_entity', category: 'quests', id: op.quest || op.id };
    }
    if (v === 'advance_quest_step') {
      return { op: 'advance_quest_step', questId: op.quest || op.id, stepIndex: op.stepIndex || 0 };
    }

    // 2. NPCs
    if (v === 'create_npc' || v === 'add_npc') {
      return { op: 'upsert_entity', category: 'npcs', data: { ...op, status: op.status || 'Active' } };
    }
    if (v === 'update_npc') {
      return { op: 'upsert_entity', category: 'npcs', data: op };
    }
    if (v === 'delete_npc' || v === 'remove_npc') {
      return { op: 'delete_entity', category: 'npcs', id: op.npc || op.id };
    }
    if (v === 'set_npc_status') {
      return { op: 'upsert_entity', category: 'npcs', data: { id: op.npc || op.id, name: op.npc || op.name, status: op.status, node: op.node, nodeId: op.nodeId, dispositionToParty: op.dispositionToParty } };
    }
    if (v === 'move_npc') {
      return { op: 'upsert_entity', category: 'npcs', data: { id: op.npc || op.id, name: op.npc || op.name, node: op.node || op.toNode, nodeId: op.nodeId || op.toNodeId } };
    }
    if (v === 'set_npc_relationship') {
      return { op: 'link_entities', linkType: 'npc_relationship', source: op.sourceNpc || op.source || op.from, target: op.targetNpc || op.target || op.to, metadata: { relationshipType: op.relationshipType || op.type || 'Ally', sentiment: op.sentiment, notes: op.notes } };
    }
    if (v === 'remove_npc_relationship') {
      return { op: 'unlink_entities', linkType: 'npc_relationship', source: op.sourceNpc || op.source || op.from, target: op.targetNpc || op.target || op.to };
    }

    // 3. Threat Clocks
    if (v === 'create_clock' || v === 'add_clock' || v === 'create_tracker') {
      return { op: 'upsert_entity', category: 'trackers', data: { ...op, name: op.name || op.title || 'Threat Clock' } };
    }
    if (v === 'update_clock' || v === 'update_tracker') {
      return { op: 'upsert_entity', category: 'trackers', data: op };
    }
    if (v === 'delete_clock' || v === 'remove_clock' || v === 'delete_tracker') {
      return { op: 'delete_entity', category: 'trackers', id: op.clock || op.tracker || op.id };
    }
    if (v === 'advance_clock' || v === 'tick_clock') {
      return { op: 'tick_clock', clock: op.clock || op.tracker || op.id, delta: op.delta !== undefined ? Number(op.delta) : 1 };
    }

    // 4. Items
    if (v === 'create_item' || v === 'add_item') {
      return { op: 'upsert_entity', category: 'items', data: op };
    }
    if (v === 'update_item') {
      return { op: 'upsert_entity', category: 'items', data: op };
    }
    if (v === 'delete_item' || v === 'remove_item') {
      return { op: 'delete_entity', category: 'items', id: op.item || op.id };
    }
    if (v === 'transfer_item') {
      return { op: 'link_entities', linkType: 'item_owner', source: op.item || op.id, target: op.toNpc || op.npc || op.ownerNpcId };
    }

    // 5. Spatial Pins & Nodes
    if (v === 'upsert_spatial_pin' || v === 'place_spatial_pin') {
      return { op: 'upsert_entity', category: 'spatialpins', data: op };
    }
    if (v === 'delete_spatial_pin') {
      return { op: 'delete_entity', category: 'spatialpins', id: op.pin || op.id };
    }
    if (v === 'create_node' || v === 'update_node') {
      return { op: 'upsert_entity', category: 'nodes', data: op };
    }
    if (v === 'delete_node') {
      return { op: 'delete_entity', category: 'nodes', id: op.node || op.id };
    }

    // Already canonical: upsert_entity, delete_entity, link_entities, unlink_entities, tick_clock
    return op;
  }

  // --- applyBatch (Two-Pass Execution with Symbol Registration & Determinism) ---

  function applyBatch(state, batchPayload, options = {}) {
    if (!state || !batchPayload) {
      throw new Error('applyBatch requires (state, batchPayload)');
    }

    if (!Array.isArray(state.appliedBatchIds)) {
      state.appliedBatchIds = [];
    }

    const batchId = batchPayload.batchId || generateMonotonicId('batch');
    batchPayload.batchId = batchId;

    // Idempotency check: skip already-applied batches
    if (state.appliedBatchIds.includes(batchId)) {
      return {
        status: 'already_applied',
        batchId: batchId,
        summary: batchPayload.summary || '',
        changes: []
      };
    }

    const operations = Array.isArray(batchPayload.operations) ? batchPayload.operations : [];
    const normalizedOps = operations.map(normalizeOperation).filter(Boolean);
    const symbolTable = new Map();
    const batchChanges = [];
    const batchContext = {
      batchId,
      symbolTable,
      changes: batchChanges
    };

    // --- PASS 1: Symbol Registration & Monotonic ID Assignment ---
    normalizedOps.forEach(op => {
      if (op.op === 'upsert_entity') {
        const cat = op.category.toLowerCase().endsWith('s') ? op.category.toLowerCase() : op.category.toLowerCase() + 's';
        const d = op.data || {};
        let assignedId = d.id;

        // Check if this references an existing entity (by id or name)
        const existingRef = resolveEntityRef(state, cat, assignedId || d.name || d.title, symbolTable);
        if (existingRef && (!assignedId || existingRef === assignedId || String(assignedId).toLowerCase() === String(d.name || d.title || '').toLowerCase())) {
          assignedId = existingRef;
          d.id = assignedId;
        } else if (!assignedId || assignedId.startsWith('$')) {
          assignedId = generateMonotonicId(cat.slice(0, 3));
          d.id = assignedId; // Stamp onto operation for determinism
        }

        if (d.tempId) symbolTable.set(d.tempId, assignedId);
        if (d.name) symbolTable.set(d.name.toLowerCase(), assignedId);
        if (d.title) symbolTable.set(d.title.toLowerCase(), assignedId);
        if (d.label) symbolTable.set(d.label.toLowerCase(), assignedId);
      }
    });

    // --- PASS 2: Execution & Cross-Reference Resolution ---
    normalizedOps.forEach(op => {
      switch (op.op) {
        case 'upsert_entity':
          upsertEntity(state, op.category, op.data, batchContext);
          break;
        case 'delete_entity':
          deleteEntity(state, op.category, op.id || op.entityId, batchContext);
          break;
        case 'link_entities':
          linkEntities(state, op.source, op.target, op.linkType, op.metadata, batchContext);
          break;
        case 'unlink_entities':
          unlinkEntities(state, op.source, op.target, op.linkType, batchContext);
          break;
        case 'tick_clock':
          tickClock(state, op.clock, op.delta, options, batchContext);
          break;
        case 'advance_quest_step': {
          const quests = getTargetCollection(state, 'quests') || [];
          const qId = resolveEntityRef(state, 'quest', op.questId, symbolTable);
          const q = quests.find(x => String(x.id) === String(qId));
          if (q && Array.isArray(q.steps) && q.steps[op.stepIndex]) {
            const st = q.steps[op.stepIndex];
            st.isCompleted = true;
            batchChanges.push({ category: 'quests', entityId: String(q.id), entityName: q.title || q.id, field: `step_${op.stepIndex}_isCompleted`, before: false, after: true });
            if (st.triggerTrackerId) {
              tickClock(state, st.triggerTrackerId, st.tickDelta || 1, options, batchContext);
            }
          }
          break;
        }
      }
    });

    state.appliedBatchIds.push(batchId);
    batchPayload.changes = batchChanges;
    batchPayload.appliedAt = new Date().toISOString();

    return {
      status: 'success',
      batchId: batchId,
      actor: batchPayload.actor || 'AI Co-Author',
      summary: batchPayload.summary || '',
      changes: batchChanges
    };
  }

  // --- revertBatch (Compensating Reverse Batch with Conflict Guard) ---

  function revertBatch(state, batchId, changelog = []) {
    if (!state || !batchId) throw new Error('revertBatch requires (state, batchId)');

    // Locate batch by ID
    let targetBatch = null;
    if (typeof batchId === 'object' && batchId.changes) {
      targetBatch = batchId;
    } else {
      targetBatch = (changelog || []).find(b => b && b.batchId === batchId);
      if (!targetBatch && state.changelog) {
        targetBatch = state.changelog.find(b => b && b.batchId === batchId);
      }
    }

    if (!targetBatch || !Array.isArray(targetBatch.changes)) {
      throw new Error(`Batch "${batchId}" not found in changelog or has no changes record.`);
    }

    const conflicts = [];
    const compensatingChanges = [];
    const revertBatchId = `revert-${targetBatch.batchId}-${Date.now().toString(36)}`;

    // Revert changes in reverse order
    for (let i = targetBatch.changes.length - 1; i >= 0; i--) {
      const ch = targetBatch.changes[i];
      const collection = getTargetCollection(state, ch.category);
      if (!collection) continue;

      if (ch.field === '_entity') {
        if (ch.before === undefined && ch.after !== null) {
          // Entity was created -> Delete it
          deleteEntity(state, ch.category, ch.entityId, { changes: compensatingChanges });
        } else if (ch.after === null && ch.before !== undefined) {
          // Entity was deleted -> Re-insert it
          upsertEntity(state, ch.category, ch.before, { changes: compensatingChanges });
        }
      } else {
        // Field was modified
        let entity = null;
        if (Array.isArray(collection)) {
          entity = collection.find(e => e && String(e.id) === String(ch.entityId));
        } else if (typeof collection === 'object') {
          entity = collection[ch.entityId];
        }

        if (entity) {
          const currentVal = entity[ch.field];
          // Check if current value matches expected after-value
          if (JSON.stringify(currentVal) !== JSON.stringify(ch.after)) {
            conflicts.push({
              category: ch.category,
              entityId: ch.entityId,
              entityName: ch.entityName,
              field: ch.field,
              expectedAfter: ch.after,
              currentValue: currentVal,
              revertedTo: ch.before
            });
          }
          compensatingChanges.push({
            category: ch.category,
            entityId: ch.entityId,
            entityName: ch.entityName,
            field: ch.field,
            before: currentVal,
            after: ch.before
          });
          entity[ch.field] = ch.before;
        }
      }
    }

    if (!Array.isArray(state.appliedBatchIds)) state.appliedBatchIds = [];
    state.appliedBatchIds.push(revertBatchId);

    return {
      status: 'reverted',
      revertBatchId,
      targetBatchId: targetBatch.batchId,
      conflicts,
      changes: compensatingChanges
    };
  }

  // --- applySlice (Parity with Import-CampaignSlice.ps1) ---

  function applySlice(state, slicePayload, conflictPolicy = 'overwrite') {
    if (!state || !slicePayload) throw new Error('applySlice requires (state, slicePayload)');

    const normalized = normalizeEntities(slicePayload.entities || slicePayload);
    const operations = [];

    ['npcs', 'quests', 'items', 'creatures', 'trackers', 'tickets', 'factions'].forEach(cat => {
      const items = normalized[cat] || [];
      const currentList = getTargetCollection(state, cat) || [];

      items.forEach(inItem => {
        if (!inItem) return;
        const existing = currentList.find(e => e && String(e.id) === String(inItem.id));
        if (existing) {
          if (conflictPolicy === 'overwrite') {
            operations.push({ op: 'upsert_entity', category: cat, data: inItem });
          } else if (conflictPolicy === 'clone') {
            const cloned = { ...inItem, id: `${inItem.id}_imported` };
            operations.push({ op: 'upsert_entity', category: cat, data: cloned });
          }
          // 'keep_existing' skips
        } else {
          operations.push({ op: 'upsert_entity', category: cat, data: inItem });
        }
      });
    });

    const batch = {
      actor: slicePayload.actor || 'Slice Importer',
      summary: slicePayload.summary || `Imported slice (${operations.length} operations, policy: ${conflictPolicy})`,
      operations
    };

    return applyBatch(state, batch);
  }

  // --- Low-Token Read Queries ---

  function getSummary(state) {
    if (!state) return { error: 'No state loaded' };
    const npcs = getTargetCollection(state, 'npcs') || [];
    const quests = getTargetCollection(state, 'quests') || [];
    const items = getTargetCollection(state, 'items') || [];
    const creatures = getTargetCollection(state, 'creatures') || [];
    const trackers = getTargetCollection(state, 'trackers') || [];
    const factions = getTargetCollection(state, 'factions') || [];
    const nodes = getTargetCollection(state, 'nodes') || [];
    const nodeCount = Array.isArray(nodes) ? nodes.length : Object.keys(nodes).length;

    return {
      campaign: state.name || state.title || state.id || 'Active Campaign',
      census: {
        nodes: nodeCount,
        npcs: npcs.length,
        quests: quests.length,
        items: items.length,
        creatures: creatures.length,
        trackers: trackers.length,
        factions: factions.length
      },
      activeQuests: quests.filter(q => q && q.status === 'Active').map(q => ({
        id: q.id,
        title: q.title || q.name,
        type: q.type,
        nodeId: q.nodeId,
        stepsCount: (q.steps || []).length,
        completedSteps: (q.steps || []).filter(s => s.isCompleted).length
      })),
      activeClocks: trackers.map(t => ({
        id: t.id,
        name: t.name || t.title,
        ticks: `${t.currentTicks || 0}/${t.maxTicks || 6}`,
        scopeTier: t.scopeTier,
        consequencesCount: (t.consequences || []).length
      }))
    };
  }

  function findNode(state, query) {
    if (!state || !query) return [];
    const qStr = String(query).toLowerCase().trim();
    const results = [];

    // Check active topology nodes
    const topoNodes = (state.activeTopology && state.activeTopology.nodes) || state.nodes || {};
    if (typeof topoNodes === 'object' && !Array.isArray(topoNodes)) {
      Object.entries(topoNodes).forEach(([id, n]) => {
        if (!n) return;
        if (String(id).toLowerCase() === qStr || (n.name && n.name.toLowerCase().includes(qStr))) {
          results.push({
            id: n.id || id,
            name: n.name || `Node ${id}`,
            x: n.x,
            y: n.y,
            scaleTier: n.scaleTier || 'region',
            culture: n.culture,
            opProfile: n.opProfile,
            biome: n.biome || (n.modData && n.modData.regional_biomes && n.modData.regional_biomes.biome) || null,
            childMapId: n.childMapId || null
          });
        }
      });
    }

    // Check submaps
    const allMaps = state.maps || (state.activeTopology && state.activeTopology.maps) || {};
    Object.entries(allMaps).forEach(([mId, m]) => {
      if (Array.isArray(m.nodes)) {
        m.nodes.forEach(n => {
          if (!n) return;
          if (String(n.id).toLowerCase() === qStr || (n.name && n.name.toLowerCase().includes(qStr))) {
            results.push({
              id: n.id,
              name: n.name || `Node ${n.id}`,
              submapId: mId,
              submapName: m.name || mId,
              x: n.x,
              y: n.y
            });
          }
        });
      }
    });

    return results;
  }

  function inspectEntity(state, type, idOrName) {
    const normType = (type === 'clock') ? 'trackers' : (type.endsWith('s') ? type.toLowerCase() : type.toLowerCase() + 's');
    const col = getTargetCollection(state, normType);
    if (!col) return null;

    const ref = resolveEntityRef(state, normType, idOrName);
    let entity = null;
    if (Array.isArray(col)) {
      entity = col.find(e => e && String(e.id) === String(ref));
    } else if (typeof col === 'object') {
      entity = col[ref];
    }
    if (!entity) return null;

    // Return clean copy stripping base64 images or internal caches
    const clean = JSON.parse(JSON.stringify(entity));
    delete clean.bgBase64;
    delete clean.imageData;
    return clean;
  }

  function listActiveQuests(state) {
    const quests = getTargetCollection(state, 'quests') || [];
    return quests.map(q => ({
      id: q.id,
      title: q.title || q.name,
      status: q.status || 'Active',
      type: q.type,
      nodeId: q.nodeId,
      npcIds: q.npcIds || [],
      trackerIds: q.trackerIds || [],
      steps: (q.steps || []).map(s => ({ id: s.id, title: s.title, isCompleted: !!s.isCompleted, triggerTrackerId: s.triggerTrackerId }))
    }));
  }

  function listActiveClocks(state) {
    const trackers = getTargetCollection(state, 'trackers') || [];
    return trackers.map(t => ({
      id: t.id,
      name: t.name || t.title,
      currentTicks: t.currentTicks || 0,
      maxTicks: t.maxTicks || 6,
      scopeTier: t.scopeTier || 'settlement',
      nodeId: t.nodeId || null,
      triggerRefs: t.triggerRefs || [],
      consequences: t.consequences || []
    }));
  }

  function getSocialWeb(state) {
    const npcs = getTargetCollection(state, 'npcs') || [];
    const factions = getTargetCollection(state, 'factions') || [];
    return {
      npcs: npcs.map(n => ({
        id: n.id,
        name: n.name,
        faction: n.faction || n.factionId,
        status: n.status,
        relationships: n.relationships || []
      })),
      factions: factions.map(f => ({
        id: f.id,
        name: f.name,
        cvfQuadrant: f.cvfQuadrant,
        leaderNpcId: f.leaderNpcId,
        controlledNodes: f.controlledNodeIds || [],
        diplomaticStances: f.diplomaticStances || {}
      }))
    };
  }

  // --- Canonical Corridor Seam (Transit Road Edge E_adj & Influence Link E_inf) ---

  function formatCorridorKey(u, v, type = 'adj') {
    if (type === 'inf' || type === 'influence' || type === 'directed' || type === 'hegemony') {
      return `${String(u).trim()}->${String(v).trim()}`;
    }
    const uStr = String(u).trim();
    const vStr = String(v).trim();
    if (uStr !== '' && vStr !== '' && !isNaN(Number(uStr)) && !isNaN(Number(vStr))) {
      return Number(uStr) <= Number(vStr) ? `${uStr}-${vStr}` : `${vStr}-${uStr}`;
    }
    return uStr.localeCompare(vStr, undefined, { numeric: true }) <= 0 ? `${uStr}-${vStr}` : `${vStr}-${uStr}`;
  }

  function parseCorridorKey(key) {
    if (typeof key !== 'string' || !key.trim()) return null;
    let parts = null;
    let type = 'adj';
    if (key.includes('->')) {
      parts = key.split('->');
      type = 'inf';
    } else if (key.includes('--')) {
      parts = key.split('--');
      type = 'adj';
    } else if (key.includes('-')) {
      parts = key.split('-');
      type = 'adj';
    } else {
      return null;
    }
    if (!parts || parts.length !== 2) return null;
    const rawU = parts[0].trim();
    const rawV = parts[1].trim();
    if (!rawU || !rawV) return null;
    const u = (!isNaN(Number(rawU)) && Number.isFinite(Number(rawU))) ? Number(rawU) : rawU;
    const v = (!isNaN(Number(rawV)) && Number.isFinite(Number(rawV))) ? Number(rawV) : rawV;
    const uStr = String(u);
    const vStr = String(v);
    const canonicalKey = formatCorridorKey(u, v, type);
    return { u, v, uStr, vStr, type, canonicalKey };
  }

  function corridorMatchesNode(key, nodeId) {
    if (nodeId === null || nodeId === undefined) return false;
    const target = String(nodeId).trim();
    if (!target) return false;
    const parsed = parseCorridorKey(key);
    return Boolean(parsed && (parsed.uStr === target || parsed.vStr === target));
  }

  function _findNodeInCol(col, id) {
    if (!col) return null;
    const sId = String(id).trim();
    if (Array.isArray(col)) {
      return col.find(n => n && String(n.id).trim() === sId) || null;
    }
    if (typeof col === 'object') {
      return col[sId] || Object.values(col).find(n => n && String(n.id).trim() === sId) || null;
    }
    return null;
  }

  function addCorridor(stateOrTopo, u, v, type = 'adj', metadata = {}, options = {}) {
    const normType = (type === 'inf' || type === 'influence' || type === 'directed' || type === 'hegemony') ? 'inf' : 'adj';
    const canonicalKey = formatCorridorKey(u, v, normType);
    const topo = (stateOrTopo && stateOrTopo.activeTopology) ? stateOrTopo.activeTopology : stateOrTopo;

    if (topo && typeof topo === 'object') {
      const applyToCol = (col) => {
        if (!col) return;
        const uNode = _findNodeInCol(col, u);
        const vNode = _findNodeInCol(col, v);
        const uVal = (uNode && uNode.id !== undefined) ? uNode.id : u;
        const vVal = (vNode && vNode.id !== undefined) ? vNode.id : v;
        const uStr = String(u).trim();
        const vStr = String(v).trim();
        if (normType === 'adj') {
          if (uNode) {
            if (!Array.isArray(uNode.adj)) uNode.adj = [];
            if (!uNode.adj.some(x => String(x).trim() === vStr)) uNode.adj.push(vVal);
          }
          if (vNode) {
            if (!Array.isArray(vNode.adj)) vNode.adj = [];
            if (!vNode.adj.some(x => String(x).trim() === uStr)) vNode.adj.push(uVal);
          }
        } else {
          if (vNode) {
            if (!Array.isArray(vNode.infBy)) vNode.infBy = [];
            if (!vNode.infBy.some(x => String(x).trim() === uStr)) vNode.infBy.push(uVal);
          }
        }
      };

      if (topo.nodes) applyToCol(topo.nodes);
      const extraNodes = (options && options.nodesArray) || (metadata && metadata.nodesArray);
      if (extraNodes && extraNodes !== topo.nodes) applyToCol(extraNodes);

      if (metadata && typeof metadata === 'object') {
        const metaClean = {};
        Object.keys(metadata).forEach(k => {
          if (k !== 'nodesArray' && k !== 'linksArray' && k !== 'edgeSlottedModules') {
            metaClean[k] = metadata[k];
          }
        });
        if (Object.keys(metaClean).length > 0) {
          if (!topo.edgeData) topo.edgeData = {};
          topo.edgeData[canonicalKey] = Object.assign(topo.edgeData[canonicalKey] || {}, metaClean);
        }
      }
    }

    return { key: canonicalKey, type: normType, u, v };
  }

  function removeCorridor(stateOrTopo, u, v, type = 'adj', options = {}) {
    const topo = (stateOrTopo && stateOrTopo.activeTopology) ? stateOrTopo.activeTopology : stateOrTopo;
    if (!topo || typeof topo !== 'object') return false;

    const uStr = String(u).trim();
    const vStr = String(v).trim();
    const removeAdj = (type === 'adj' || type === 'road' || type === 'both' || !type);
    const removeInf = (type === 'inf' || type === 'influence' || type === 'directed' || type === 'hegemony' || type === 'both');

    const scrubCol = (col) => {
      if (!col) return;
      const uNode = _findNodeInCol(col, uStr);
      const vNode = _findNodeInCol(col, vStr);
      if (removeAdj) {
        if (uNode && Array.isArray(uNode.adj)) uNode.adj = uNode.adj.filter(id => String(id).trim() !== vStr);
        if (vNode && Array.isArray(vNode.adj)) vNode.adj = vNode.adj.filter(id => String(id).trim() !== uStr);
      }
      if (removeInf) {
        if (vNode && Array.isArray(vNode.infBy)) vNode.infBy = vNode.infBy.filter(id => String(id).trim() !== uStr);
      }
    };

    if (topo.nodes) scrubCol(topo.nodes);
    if (options && options.nodesArray && options.nodesArray !== topo.nodes) scrubCol(options.nodesArray);

    const mainCol = topo.nodes || (options && options.nodesArray);
    const uN = _findNodeInCol(mainCol, uStr);
    const vN = _findNodeInCol(mainCol, vStr);
    const roadRemains = Boolean(
      (uN && Array.isArray(uN.adj) && uN.adj.some(id => String(id).trim() === vStr)) ||
      (vN && Array.isArray(vN.adj) && vN.adj.some(id => String(id).trim() === uStr))
    );
    const infRemains = Boolean(vN && Array.isArray(vN.infBy) && vN.infBy.some(id => String(id).trim() === uStr));

    const adjKey = formatCorridorKey(u, v, 'adj');
    const infKey = formatCorridorKey(u, v, 'inf');
    const keysToDelete = new Set();

    if (removeAdj) {
      keysToDelete.add(adjKey);
      keysToDelete.add(`${uStr}-${vStr}`);
      keysToDelete.add(`${vStr}-${uStr}`);
      keysToDelete.add(`${uStr}--${vStr}`);
      keysToDelete.add(`${vStr}--${uStr}`);
      if (!infRemains) keysToDelete.add(infKey);
    }
    if (removeInf) {
      keysToDelete.add(infKey);
      if (!roadRemains) {
        keysToDelete.add(adjKey);
        keysToDelete.add(`${uStr}-${vStr}`);
        keysToDelete.add(`${vStr}-${uStr}`);
        keysToDelete.add(`${uStr}--${vStr}`);
        keysToDelete.add(`${vStr}--${uStr}`);
      }
    }

    [topo.edgeData, topo.edgeNotes, topo.edgeSlottedModules, options && options.edgeSlottedModules].forEach(dict => {
      if (!dict || typeof dict !== 'object') return;
      keysToDelete.forEach(k => {
        delete dict[k];
      });
    });

    const scrubLinks = (linksArr) => {
      if (!Array.isArray(linksArr)) return;
      for (let i = linksArr.length - 1; i >= 0; i--) {
        const l = linksArr[i];
        if (!l) continue;
        const rawS = (l.source && typeof l.source === 'object') ? l.source.id : (l.source !== undefined ? l.source : (l.from !== undefined ? l.from : l.u));
        const rawT = (l.target && typeof l.target === 'object') ? l.target.id : (l.target !== undefined ? l.target : (l.to !== undefined ? l.to : l.v));
        const s = String(rawS !== undefined ? rawS : '').trim();
        const t = String(rawT !== undefined ? rawT : '').trim();
        const lType = String(l.type || l.edgeType || l.layer || '').toLowerCase();
        const isLinkInf = (lType === 'inf' || lType === 'influence' || lType === 'directed' || lType === 'hegemony');
        const isLinkAdj = (lType === 'adj' || lType === 'road' || lType === 'transit');
        const matchesDirected = (s === uStr && t === vStr);
        const matchesUndirected = (s === uStr && t === vStr) || (s === vStr && t === uStr);
        let shouldRemove = false;
        if (removeAdj && removeInf) {
          shouldRemove = matchesUndirected;
        } else if (removeAdj) {
          if (!isLinkInf) shouldRemove = matchesUndirected;
        } else if (removeInf) {
          if (isLinkInf || !isLinkAdj) shouldRemove = matchesDirected;
        }
        if (shouldRemove) linksArr.splice(i, 1);
      }
    };

    if (Array.isArray(topo.links)) scrubLinks(topo.links);
    if (options && Array.isArray(options.linksArray) && options.linksArray !== topo.links) scrubLinks(options.linksArray);

    return true;
  }

  function removeCorridorsForNode(stateOrTopo, nodeId, options = {}) {
    const topo = (stateOrTopo && stateOrTopo.activeTopology) ? stateOrTopo.activeTopology : stateOrTopo;
    if (!topo || typeof topo !== 'object' || nodeId === null || nodeId === undefined) return false;
    const targetStr = String(nodeId).trim();
    if (!targetStr) return false;

    const scrubNodes = (col) => {
      if (!col) return;
      if (Array.isArray(col)) {
        col.forEach(n => {
          if (!n) return;
          if (String(n.id !== undefined ? n.id : '').trim() === targetStr) {
            if (Array.isArray(n.adj)) n.adj = [];
            if (Array.isArray(n.infBy)) n.infBy = [];
          } else {
            if (Array.isArray(n.adj)) n.adj = n.adj.filter(id => String(id).trim() !== targetStr);
            if (Array.isArray(n.infBy)) n.infBy = n.infBy.filter(id => String(id).trim() !== targetStr);
          }
        });
      } else if (typeof col === 'object') {
        Object.keys(col).forEach(k => {
          const n = col[k];
          if (!n) return;
          if (String(k).trim() === targetStr || String(n.id !== undefined ? n.id : '').trim() === targetStr) {
            if (Array.isArray(n.adj)) n.adj = [];
            if (Array.isArray(n.infBy)) n.infBy = [];
          } else {
            if (Array.isArray(n.adj)) n.adj = n.adj.filter(id => String(id).trim() !== targetStr);
            if (Array.isArray(n.infBy)) n.infBy = n.infBy.filter(id => String(id).trim() !== targetStr);
          }
        });
      }
    };

    if (topo.nodes) scrubNodes(topo.nodes);
    if (options && options.nodesArray && options.nodesArray !== topo.nodes) scrubNodes(options.nodesArray);

    const scrubLinks = (linksArr) => {
      if (!Array.isArray(linksArr)) return;
      for (let i = linksArr.length - 1; i >= 0; i--) {
        const l = linksArr[i];
        if (!l) continue;
        const rawS = (l.source && typeof l.source === 'object') ? l.source.id : (l.source !== undefined ? l.source : (l.from !== undefined ? l.from : l.u));
        const rawT = (l.target && typeof l.target === 'object') ? l.target.id : (l.target !== undefined ? l.target : (l.to !== undefined ? l.to : l.v));
        if (String(rawS !== undefined ? rawS : '').trim() === targetStr || String(rawT !== undefined ? rawT : '').trim() === targetStr) {
          linksArr.splice(i, 1);
        }
      }
    };

    if (Array.isArray(topo.links)) scrubLinks(topo.links);
    if (options && Array.isArray(options.linksArray) && options.linksArray !== topo.links) scrubLinks(options.linksArray);

    [topo.edgeData, topo.edgeNotes, topo.edgeSlottedModules, options && options.edgeSlottedModules].forEach(dict => {
      if (!dict || typeof dict !== 'object') return;
      Object.keys(dict).forEach(k => {
        if (corridorMatchesNode(k, targetStr)) {
          delete dict[k];
        }
      });
    });

    return true;
  }

  // --- Hierarchical Cartography Pointcrawl Graph Store Seam (M3) ---

  function ensureQueryableNodesCollection(nodesCol) {
    if (!nodesCol || typeof nodesCol !== 'object' || Array.isArray(nodesCol)) {
      return nodesCol;
    }
    const props = {};
    const methods = {
      find: function (fn, thisArg) { return Object.values(this).find(fn, thisArg); },
      filter: function (fn, thisArg) { return Object.values(this).filter(fn, thisArg); },
      map: function (fn, thisArg) { return Object.values(this).map(fn, thisArg); },
      forEach: function (fn, thisArg) { return Object.values(this).forEach(fn, thisArg); },
      some: function (fn, thisArg) { return Object.values(this).some(fn, thisArg); },
      every: function (fn, thisArg) { return Object.values(this).every(fn, thisArg); },
      toArray: function () { return Object.values(this); }
    };
    for (const name of Object.keys(methods)) {
      if (typeof nodesCol[name] !== 'function') {
        props[name] = {
          value: methods[name],
          enumerable: false,
          configurable: true,
          writable: true
        };
      }
    }
    if (Object.keys(props).length > 0) {
      Object.defineProperties(nodesCol, props);
    }
    return nodesCol;
  }

  function getNodesList(stateOrTopo) {
    if (!stateOrTopo) return [];
    let col = null;
    if (Array.isArray(stateOrTopo)) {
      col = stateOrTopo;
    } else if (stateOrTopo && typeof stateOrTopo === 'object') {
      if (stateOrTopo.nodes !== undefined) {
        col = stateOrTopo.nodes;
      } else if (stateOrTopo.activeTopology && stateOrTopo.activeTopology.nodes !== undefined) {
        col = stateOrTopo.activeTopology.nodes;
      } else if (!stateOrTopo.activeTopology && !stateOrTopo.links && !stateOrTopo.entities && !stateOrTopo.campaign && !stateOrTopo.maps) {
        col = stateOrTopo;
      }
    }
    if (Array.isArray(col)) {
      return col.filter(Boolean);
    }
    if (col && typeof col === 'object') {
      ensureQueryableNodesCollection(col);
      return Object.values(col).filter(Boolean);
    }
    return [];
  }

  function getNodesMap(stateOrTopo) {
    const list = getNodesList(stateOrTopo);
    const dict = {};
    for (const n of list) {
      if (n && n.id !== undefined && n.id !== null) {
        dict[String(n.id)] = n;
      }
    }
    return ensureQueryableNodesCollection(dict);
  }

  function getNodeById(stateOrTopo, nodeId) {
    if (nodeId === null || nodeId === undefined) return null;
    const targetStr = String(nodeId).trim();
    if (!targetStr) return null;

    let col = null;
    if (Array.isArray(stateOrTopo)) {
      col = stateOrTopo;
    } else if (stateOrTopo && typeof stateOrTopo === 'object') {
      if (stateOrTopo.nodes !== undefined) {
        col = stateOrTopo.nodes;
      } else if (stateOrTopo.activeTopology && stateOrTopo.activeTopology.nodes !== undefined) {
        col = stateOrTopo.activeTopology.nodes;
      } else if (!stateOrTopo.activeTopology && !stateOrTopo.links && !stateOrTopo.entities && !stateOrTopo.campaign && !stateOrTopo.maps) {
        col = stateOrTopo;
      }
    }
    if (!col) return null;

    if (Array.isArray(col)) {
      return col.find(n => n && String(n.id) === targetStr) || null;
    }
    if (typeof col === 'object') {
      return col[nodeId] || col[targetStr] || Object.values(col).find(n => n && String(n.id) === targetStr) || null;
    }
    return null;
  }

  function upsertNode(stateOrTopo, nodePayload) {
    if (!stateOrTopo || !nodePayload) return null;
    const result = upsertEntity(stateOrTopo, 'nodes', nodePayload);
    const col = (stateOrTopo.activeTopology && stateOrTopo.activeTopology.nodes) || stateOrTopo.nodes;
    if (col && typeof col === 'object' && !Array.isArray(col)) {
      ensureQueryableNodesCollection(col);
    }
    return result;
  }

  function removeNode(stateOrTopo, nodeId, options = {}) {
    if (!stateOrTopo || nodeId === null || nodeId === undefined) return false;
    const targetStr = String(nodeId).trim();
    if (!targetStr) return false;

    // 1. Scrub corridors
    removeCorridorsForNode(stateOrTopo, nodeId, options);

    // 2. Delegate foreign-key cascade scrubbing to deleteEntity
    const batchContext = Object.assign({ allowMissingEntity: true }, options);
    deleteEntity(stateOrTopo, 'nodes', nodeId, batchContext);

    // 3. Explicitly scrub from nodes collection (whether Array or Dictionary)
    const topo = (stateOrTopo && stateOrTopo.activeTopology) ? stateOrTopo.activeTopology : stateOrTopo;
    const collections = [stateOrTopo.nodes, topo && topo.nodes, options && options.nodesArray];
    collections.forEach(col => {
      if (!col) return;
      if (Array.isArray(col)) {
        for (let i = col.length - 1; i >= 0; i--) {
          if (col[i] && String(col[i].id).trim() === targetStr) {
            col.splice(i, 1);
          }
        }
      } else if (typeof col === 'object') {
        if (col[nodeId] !== undefined) delete col[nodeId];
        if (col[targetStr] !== undefined) delete col[targetStr];
        Object.keys(col).forEach(k => {
          if (String(k).trim() === targetStr || (col[k] && String(col[k].id).trim() === targetStr)) {
            delete col[k];
          }
        });
      }
    });

    return true;
  }

  return {
    generateMonotonicId,
    normalizeOdv,
    normalizeSpatialPin,
    normalizeEntities,
    resolveEntityRef,
    resolveNodeRef,
    upsertEntity,
    deleteEntity,
    findEntityReferences,
    ENTITY_REFERENCE_DESCRIPTORS,
    remapEntityCluster,
    linkEntities,
    unlinkEntities,
    tickClock,
    executeBrowserConsequence,
    applyBatch,
    revertBatch,
    applySlice,
    getSummary,
    findNode,
    inspectEntity,
    listActiveQuests,
    listActiveClocks,
    getSocialWeb,
    formatCorridorKey,
    parseCorridorKey,
    corridorMatchesNode,
    addCorridor,
    removeCorridor,
    removeCorridorsForNode,
    ensureQueryableNodesCollection,
    getNodesList,
    getNodesMap,
    getNodeById,
    upsertNode,
    removeNode,
    syncQuestAndTrackerLinks,
    syncTrackerToQuests
  };
}));
