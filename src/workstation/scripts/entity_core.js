    // ========================================================================
    // UNIVERSAL CAMPAIGN ENTITY MANAGER - CORE (STATE, DISSONANCE & PROTOTYPES)
    // ========================================================================
    let CurrentEntityTab = 'npc';
    if (typeof window !== 'undefined') window.CurrentEntityTab = CurrentEntityTab;
    let SelectedEntityFilter = 'all'; // 'all', 'unassigned', or moduleId / nodeId / culture / tier
    let SelectedEntityId = null;

    function getItemEffectiveNodeId(item) {
      if (!item) return null;
      const topo = (typeof Workstation !== "undefined" && Workstation.activeTopology) || {};
      if (item.possessionMode === 'carried' && item.ownerNpcId) {
        const owner = (topo.npcs || []).find(n => String(n.id) === String(item.ownerNpcId));
        if (owner && owner.nodeId != null && owner.nodeId !== '') {
          return owner.nodeId;
        }
      }
      return item.nodeId != null ? item.nodeId : null;
    }
    window.getItemEffectiveNodeId = getItemEffectiveNodeId;

    function parseResourceTagMeta(raw) {
      if (!raw || typeof raw !== 'string') {
        return { raw: '', sector: 'General', name: '', canonicalKey: '', tailKey: '' };
      }
      const cleaned = raw.trim().replace(/^(?:provides|requires|yields|resource|commodity)\s*:\s*/i, '');
      let sector = 'General';
      let label = cleaned;
      const colonIdx = cleaned.indexOf(':');
      if (colonIdx > 0) {
        const prefix = cleaned.slice(0, colonIdx).trim();
        const rest = cleaned.slice(colonIdx + 1).trim();
        if (prefix && rest && !/^(provides|requires|yields)$/i.test(prefix)) {
          sector = prefix.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
          sector = sector ? (sector.charAt(0).toUpperCase() + sector.slice(1)) : 'General';
          label = rest;
        }
      }
      const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const humanName = label.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
      const tailKey = slug(label);
      const canonicalKey = (colonIdx > 0 && sector !== 'General')
        ? `${slug(sector)}:${tailKey}`
        : tailKey;
      return {
        raw: raw.trim(),
        sector,
        name: humanName || cleaned,
        canonicalKey,
        tailKey
      };
    }
    window.parseResourceTagMeta = parseResourceTagMeta;

    function normalizeResourceTagKey(raw) {
      return parseResourceTagMeta(raw).canonicalKey;
    }
    window.normalizeResourceTagKey = normalizeResourceTagKey;

    function isResourceItem(item) {
      if (!item || typeof item !== 'object' || item.isResource === false) return false;
      return Boolean(
        item.isResource === true ||
        item.entityKind === 'resource' ||
        item.category === 'Resource Export / Supply Anchor' ||
        /^(Resource|Commodity)\s*:/i.test(item.category || '') ||
        (item.tags && Array.isArray(item.tags) && item.tags.some(t => /^(resource|commodity)$/i.test(t)))
      );
    }
    window.isResourceItem = isResourceItem;

    function isIndustryItem(item) {
      if (!item || typeof item !== 'object') return false;
      // Strict mutual exclusion: resources always win first priority
      if (isResourceItem(item)) return false;
      // Explicit opt-outs protect real tabletop loot, RPG gear, weapons, armor & keys
      if (item.isIndustry === false || item.isLoot === true || item.entityKind === 'item' || item.kind === 'item') return false;
      if (item.lootMetadata && item.isIndustry !== true && item.entityKind !== 'industry') return false;
      // Explicit opt-ins
      if (item.isIndustry === true || item.entityKind === 'industry' || item.kind === 'industry') return true;

      const cat = String(item.category || item.type || '').trim();
      if (/^(Weapon|Armor|Shield|Consumable|Potion|Scroll|Spellbook|Ring|Amulet|Wondrous Item|Clothing|Jewelry|Key|Key Item|Document|Book|Letter|Quest Item|Currency|Treasure|Ammo|Ammunition|Gear|Equipment|Adventure Gear|Tool)$/i.test(cat)) {
        return false;
      }
      if (/^(Infrastructural Machinery|Industrial Facility|Production Facility|Extraction Apparatus|Infrastructure|Utility Facility|Supply Infrastructure|Agricultural Facility|Refinery|Foundry|Workshop Facility)$/i.test(cat)) {
        return true;
      }
      if (/\b(machinery|apparatus|infrastructure|facility|refinery|foundry|smelter|granary|kiln|waterworks|aqueduct|cistern|pelton)\b/i.test(cat)) {
        return true;
      }
      if (Array.isArray(item.tags) && item.tags.some(t => /^(industry|infrastructure|facility|machinery|apparatus|extractor|refiner|depot)$/i.test(String(t || '').trim()))) {
        return true;
      }
      const modId = String(item.moduleId || '').trim();
      const specs = String(item.specs || '').trim();
      const notes = String(item.notes || '').trim();
      if (item.chain_id || item.chainId) return true;
      if (/^(T0-DOM|ECOL|AGRI|FARM|IND|EXT|INFRA|MINE|FORGE|MILL)-/i.test(modId)) {
        if (/^(Infrastructural Machinery|Tabletop Asset \/ Relic)$/i.test(cat) ||
            /^(Module Anchor|Provides:|Requires:|Standalone Fallback)/i.test(specs) ||
            /^Primary technological, infrastructural, or tactical anchor established by/i.test(notes) ||
            /_item_0$/i.test(String(item.prototypeId || item.id || ''))) {
          return true;
        }
      }
      return false;
    }
    window.isIndustryItem = isIndustryItem;

    function splitResourceTagList(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(x => String(x || '').trim()).filter(Boolean);
      return String(val).split(/[;,]/).map(x => x.trim()).filter(Boolean);
    }

    function buildIndustryResourceIndex(targetTopo = null) {
      const topo = targetTopo || ((typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : {}) || {};
      const mods = (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) ? ALL_MODULES : [];
      const modById = new Map();
      mods.forEach(m => { if (m && m.id) modById.set(String(m.id), m); });

      const allItems = Array.isArray(topo.items) ? topo.items : [];
      const activeResources = allItems.filter(i => isResourceItem(i));
      const activeIndustries = allItems.filter(i => !isResourceItem(i) && isIndustryItem(i));
      const protoResources = (typeof getPrototypesForType === 'function') ? getPrototypesForType('resource') : [];
      const protoIndustries = (typeof getPrototypesForType === 'function') ? getPrototypesForType('industry') : [];

      const resByKey = new Map();
      const addResKey = (key, entry) => {
        if (!key) return;
        if (!resByKey.has(key)) resByKey.set(key, []);
        const bucket = resByKey.get(key);
        if (!bucket.some(b => b.entity === entry.entity)) bucket.push(entry);
      };
      const registerRes = (r, isProto) => {
        const candidates = [r.name, r.provides, r.yields, r.specs];
        candidates.forEach(c => {
          splitResourceTagList(c).forEach(tag => {
            const meta = parseResourceTagMeta(tag);
            const rec = { entity: r, isPrototype: isProto, tag: meta.raw, meta };
            addResKey(meta.canonicalKey, rec);
            if (meta.tailKey && meta.tailKey !== meta.canonicalKey) addResKey(meta.tailKey, rec);
          });
        });
      };
      activeResources.forEach(r => registerRes(r, false));
      protoResources.forEach(r => registerRes(r, true));

      const resolveEntityTags = (ent, field) => {
        const direct = splitResourceTagList(ent[field]);
        if (direct.length > 0) return direct;
        const m = ent.moduleId ? modById.get(String(ent.moduleId)) : null;
        if (m && m[field]) return splitResourceTagList(m[field]);
        if (field === 'provides' && ent.specs && /Provides\s*:/i.test(ent.specs)) {
          return splitResourceTagList(ent.specs.replace(/^.*?Provides\s*:/i, ''));
        }
        if (field === 'requires' && ent.specs && /Requires\s*:/i.test(ent.specs)) {
          return splitResourceTagList(ent.specs.replace(/^.*?Requires\s*:/i, ''));
        }
        return [];
      };

      const lookupResourceMatches = (tag) => {
        const meta = parseResourceTagMeta(tag);
        const rawMatches = [
          ...(resByKey.get(meta.canonicalKey) || []),
          ...(meta.tailKey && meta.tailKey !== meta.canonicalKey ? (resByKey.get(meta.tailKey) || []) : [])
        ];
        const seen = new Set();
        const unique = [];
        rawMatches.forEach(m => {
          const k = `${m.isPrototype ? 'p' : 'a'}:${m.entity.id}`;
          if (!seen.has(k)) { seen.add(k); unique.push(m); }
        });
        return { tag: meta.raw, meta, active: unique.filter(u => !u.isPrototype), prototypes: unique.filter(u => u.isPrototype) };
      };

      const findIndustryLinksForTag = (tag) => {
        const meta = parseResourceTagMeta(tag);
        const matchesTag = (candidateList) => candidateList.some(ct => {
          const cm = parseResourceTagMeta(ct);
          return (meta.canonicalKey && cm.canonicalKey === meta.canonicalKey) ||
                 (meta.tailKey && cm.tailKey === meta.tailKey);
        });
        const producers = [];
        const consumers = [];
        const inspectInd = (ind, isProto) => {
          const prov = resolveEntityTags(ind, 'provides').concat(resolveEntityTags(ind, 'yields'));
          const req = resolveEntityTags(ind, 'requires');
          if (matchesTag(prov)) producers.push({ entity: ind, isPrototype: isProto });
          if (matchesTag(req)) consumers.push({ entity: ind, isPrototype: isProto });
        };
        activeIndustries.forEach(i => inspectInd(i, false));
        protoIndustries.forEach(p => {
          if (!activeIndustries.some(a => String(a.prototypeId) === String(p.id) || String(a.id) === String(p.id))) {
            inspectInd(p, true);
          }
        });
        const nodeConsumers = [];
        Object.keys(topo.nodes || {}).forEach(nid => {
          const n = topo.nodes[nid];
          if (n && matchesTag(splitResourceTagList(n.requires))) nodeConsumers.push(n);
        });
        const caravans = [];
        Object.keys(topo.edgeData || {}).forEach(ek => {
          const ed = topo.edgeData[ek];
          const tr = ed && ed.modData && ed.modData.pre_industrial_resources && Array.isArray(ed.modData.pre_industrial_resources.inTransit)
            ? ed.modData.pre_industrial_resources.inTransit : [];
          tr.forEach(sh => {
            if (sh && matchesTag([sh.resource || ''])) caravans.push({ edgeKey: ek, shipment: sh });
          });
        });
        return { meta, producers, consumers, nodeConsumers, caravans };
      };

      return {
        resolveEntityTags,
        lookupResourceMatches,
        findIndustryLinksForTag
      };
    }
    window.buildIndustryResourceIndex = buildIndustryResourceIndex;

    // --- Stage 3A: Runtime rich-metadata fallback for legacy campaign entities ---
    const LEGACY_ENTITY_NOTE_RE = /^(Primary technological, infrastructural, or tactical anchor established by|Supply chain material or energy export produced by|Operational catalyst triggered by)/i;

    function isLegacyBoilerplateNote(notes) {
      const t = String(notes == null ? '' : notes).trim();
      return t === '' || LEGACY_ENTITY_NOTE_RE.test(t);
    }
    window.isLegacyBoilerplateNote = isLegacyBoilerplateNote;

    function resolveRichEntityMetadata(entity, type) {
      const empty = {
        type: type || null, moduleId: null, moduleTitle: '', source: 'entity', legacyNotes: false,
        notes: '', customNotes: '', moduleLore: '', extractionLore: '', refiningContext: '',
        mechanicalSpecs: null, batchSpecs: null, dials: [], outputDial: null, threatClocks: [],
        nodePrerequisites: null, standaloneFallback: '', chain: { chainId: null, chainStage: null, chainRole: null },
        originFacility: '', consumedByHint: '', produces: [], consumes: [], upstream: [], downstream: []
      };
      if (!entity || typeof entity !== 'object') return empty;

      const kind = type || (isResourceItem(entity) ? 'resource' : (isIndustryItem(entity) ? 'industry'
        : ((entity.title && (entity.threat !== undefined || /crisis|dilemma|threat/i.test(entity.type || ''))) ? 'quest' : 'item')));
      const out = { ...empty, type: kind };
      const moduleId = entity.moduleId != null ? String(entity.moduleId) : '';
      const mods = (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) ? ALL_MODULES : [];
      const mod = moduleId ? (mods.find(m => m && String(m.id) === moduleId) || null) : null;
      out.moduleId = moduleId || null;
      out.moduleTitle = (mod && mod.title) || entity.moduleTitle || '';

      // --- Locate the matching module prototype (module extraction first, then MODULE_ENTITY_PROTOTYPES) ---
      const pool = [];
      if (mod) {
        const list = kind === 'quest' ? mod.extracted_quests : mod.extracted_items;
        if (Array.isArray(list)) pool.push(...list);
      }
      if (typeof getPrototypesForType === 'function' && moduleId) {
        try {
          getPrototypesForType(kind === 'quest' ? 'quest' : kind).forEach(p => {
            if (p && String(p.moduleId || '') === moduleId && !pool.some(q => q.id === p.id)) pool.push(p);
          });
        } catch (e) { /* prototype bag unavailable in this context */ }
      }
      const entityTags = splitResourceTagList(entity.provides).concat(
        (entity.specs && /Provides\s*:/i.test(entity.specs)) ? splitResourceTagList(String(entity.specs).replace(/^.*?Provides\s*:/i, '')) : []
      );
      const entityKeys = new Set(entityTags.map(t => normalizeResourceTagKey(t)).filter(Boolean));
      if (entity.name) entityKeys.add(normalizeResourceTagKey(entity.name));
      const sameId = (p) => p.id === entity.prototypeId || p.id === entity.id;
      let proto = pool.find(sameId) || null;
      if (!proto) {
        if (kind === 'industry') {
          proto = pool.find(p => !isResourceItem(p) && isIndustryItem(p)) || null;
        } else if (kind === 'resource') {
          proto = pool.find(p => isResourceItem(p) && (splitResourceTagList(p.provides).concat([p.name])).some(t => entityKeys.has(normalizeResourceTagKey(t)))) || null;
        } else if (kind === 'quest') {
          const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
          proto = pool.find(p => norm(p.title) === norm(entity.title || entity.name)) || null;
        } else {
          proto = pool.find(p => p.name && entity.name && p.name === entity.name) || null;
        }
      }
      out.source = proto ? 'prototype' : (mod ? 'module' : 'entity');

      // --- Pick structural / prose fields from entity -> proto -> module ---
      const pick = (own, fromProto, fromMod) => {
        const nonEmpty = (v) => !(v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0));
        if (nonEmpty(own)) return own;
        if (nonEmpty(fromProto)) return fromProto;
        return nonEmpty(fromMod) ? fromMod : (Array.isArray(own) ? [] : (own === undefined ? null : own));
      };

      out.moduleLore = (proto && (proto.lore || proto.notes)) || (mod && (mod.mechanical_architecture || mod.overview || mod.summary)) || '';
      out.extractionLore = (proto && proto.extractionLore)
        || (mod && mod.extraction_lore ? String(mod.extraction_lore).replace(/\s*\*\s+/g, ' ').replace(/\s+/g, ' ').trim() : '');
      out.refiningContext = (proto && (proto.refiningProcess || proto.extractionMethod)) || '';
      out.originFacility = (proto && proto.originFacility) || (kind === 'resource' ? out.moduleTitle : '');
      out.consumedByHint = (proto && proto.consumedByHint) || '';
      out.mechanicalSpecs = pick(entity.mechanicalSpecs, proto && proto.mechanicalSpecs, null);
      out.batchSpecs = pick(entity.batchSpecs, proto && proto.batchSpecs, null);
      out.outputDial = pick(entity.output_dial || entity.outputDial, proto && proto.output_dial, mod && mod.output_dial);
      out.dials = pick(entity.dials, proto && proto.dials, mod && mod.dials) || [];
      out.threatClocks = pick(entity.threatClocks || entity.threat_clocks, proto && proto.threatClocks, mod && mod.threat_clocks) || [];
      out.nodePrerequisites = pick(entity.nodePrerequisites || entity.node_prerequisites, proto && proto.nodePrerequisites, mod && mod.node_prerequisites);
      out.standaloneFallback = pick(entity.standaloneFallback || entity.standalone_fallback, proto && proto.standaloneFallback, mod && mod.standalone_fallback) || '';
      out.chain = {
        chainId: pick(entity.chainId || entity.chain_id, proto && proto.chainId, mod && mod.chain_id),
        chainStage: pick(entity.chainStage != null ? entity.chainStage : entity.chain_stage, proto && proto.chainStage, mod && mod.chain_stage),
        chainRole: pick(entity.chainRole || entity.chain_role, proto && proto.chainRole, mod && mod.chain_role)
      };

      // --- Non-destructive notes: GM-authored text is preserved verbatim in customNotes ---
      // Recognize empty/legacy boilerplate notes AND unmodified module-hydrated prose so baked JSON notes do not duplicate UI panels.
      const normWs = (s) => String(s || '').replace(/\s+/g, ' ').trim();
      const stripKnownAutoTail = (s) => normWs(s).replace(/\s+Downstream:\s+(?:In "Granular Mode", it provides\b[^.]+\.|(?:Used|Consumed) by\b[^.]+\.|Dispatches\b[^.]+\.)$/i, '').trim();
      const rawNoteNorm = normWs(entity.notes);
      const rawCoreNorm = stripKnownAutoTail(entity.notes);
      const autoCandidates = [
        proto && proto.notes,
        proto && proto.lore,
        out.moduleLore,
        mod && mod.mechanical_architecture,
        mod && mod.overview,
        mod && mod.summary
      ].filter(Boolean);
      const matchesAutoHydrated = Boolean(rawNoteNorm) && autoCandidates.some(cand => {
        const cn = normWs(cand);
        if (cn && cn === rawNoteNorm) return true;
        const cc = stripKnownAutoTail(cand);
        return Boolean(cc && rawCoreNorm && cc === rawCoreNorm);
      });
      const legacy = isLegacyBoilerplateNote(entity.notes) || matchesAutoHydrated;
      out.legacyNotes = legacy;
      out.customNotes = legacy ? '' : String(entity.notes);

      // Display notes: rich module prose only when the saved note is empty, legacy boilerplate, or unmodified hydrated lore.
      out.notes = legacy ? (out.moduleLore || '') : String(entity.notes);
      if (legacy && kind === 'resource' && proto && proto.notes) out.notes = proto.notes;

      // --- Supply-chain partners (upstream producers / downstream consumers) ---
      try {
        const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
        const index = buildIndustryResourceIndex(topo);
        const probe = { ...entity, moduleId: entity.moduleId, provides: entity.provides, requires: entity.requires, specs: entity.specs };
        let provTags = index.resolveEntityTags(probe, 'provides');
        if (provTags.length === 0 && proto) provTags = splitResourceTagList(proto.provides);
        if (kind === 'resource' && provTags.length === 0) provTags = entityTags.length ? entityTags : [entity.name];
        let reqTags = index.resolveEntityTags(probe, 'requires');
        if (reqTags.length === 0 && proto) reqTags = splitResourceTagList(proto.requires);
        if (kind === 'resource' && reqTags.length === 0 && mod) reqTags = splitResourceTagList(mod.requires);
        out.produces = provTags;
        out.consumes = reqTags;

        const brief = (rec, tag) => ({
          tag,
          id: rec.entity.id,
          name: rec.entity.name || rec.entity.title || String(rec.entity.id),
          moduleId: rec.entity.moduleId || null,
          isPrototype: Boolean(rec.isPrototype)
        });
        const selfModule = (rec) => moduleId && String(rec.entity.moduleId || '') === moduleId;
        const seen = new Set();
        const pushUnique = (arr, rec, tag) => {
          // One row per partner facility: an active instance wins over its own module prototype.
          const k = `${arr === out.upstream ? 'u' : 'd'}|${rec.entity.moduleId || rec.entity.id}|${rec.entity.name || rec.entity.title || ''}`;
          if (seen.has(k)) return;
          seen.add(k);
          arr.push(brief(rec, tag));
        };
        if (kind === 'industry') {
          reqTags.forEach(tag => index.findIndustryLinksForTag(tag).producers.forEach(rec => { if (!selfModule(rec)) pushUnique(out.upstream, rec, tag); }));
          provTags.forEach(tag => index.findIndustryLinksForTag(tag).consumers.forEach(rec => { if (!selfModule(rec)) pushUnique(out.downstream, rec, tag); }));
        } else if (kind === 'resource') {
          provTags.forEach(tag => {
            const links = index.findIndustryLinksForTag(tag);
            links.producers.forEach(rec => pushUnique(out.upstream, rec, tag));
            links.consumers.forEach(rec => { if (!selfModule(rec)) pushUnique(out.downstream, rec, tag); });
            (links.nodeConsumers || []).forEach(n => out.downstream.push({ tag, id: n.id, name: n.name || `Node ${n.id}`, moduleId: null, isPrototype: false, isNode: true }));
          });
        }
      } catch (e) {
        // Supply-chain index is best-effort context; never block rich-note resolution.
      }
      return out;
    }
    window.resolveRichEntityMetadata = resolveRichEntityMetadata;
    window.getResolvedEntityLoreContext = resolveRichEntityMetadata;

    function getCreatureEffectiveNodeId(creature) {
      if (!creature) return null;
      return (creature.stationing && creature.stationing.nodeId != null) ? creature.stationing.nodeId : (creature.nodeId != null ? creature.nodeId : null);
    }
    window.getCreatureEffectiveNodeId = getCreatureEffectiveNodeId;

    function getNpcEffectiveSociology(npc, targetTopo = null, options = {}) {
      if (!npc) {
        return {
          set: false,
          odv: null,
          s: null, e: null, c: null,
          tag: 'Unset',
          culture: 'Unset',
          opProfile: null,
          source: 'unset',
          sourceLabel: 'Unset'
        };
      }

      const topo = targetTopo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
      const getOdvFn = (typeof getOdv === 'function') ? getOdv : ((ent) => {
        if (!ent) return { set: false };
        const raw = ent.odv || ent.disposition;
        if (!raw) return { set: false };
        if (typeof raw === 'object' && raw.s && raw.e && raw.c) return { set: true, s: Number(raw.s), e: Number(raw.e), c: Number(raw.c) };
        if (Array.isArray(raw) && raw.length >= 3) return { set: true, s: Number(raw[0]), e: Number(raw[1]), c: Number(raw[2]) };
        return { set: false };
      });
      const deriveCvf = (typeof deriveCvfQuadrant === 'function') ? deriveCvfQuadrant : null;
      const deriveOp = (typeof deriveOperationalMode === 'function') ? deriveOperationalMode : null;

      // 1. Explicit / Bespoke on NPC (Priority 1)
      if (npc.odvInherited !== true) {
        const ownOdv = getOdvFn(npc);
        if (ownOdv && ownOdv.set) {
          const s = ownOdv.s, e = ownOdv.e, c = ownOdv.c;
          const cult = npc.culture || (deriveCvf ? deriveCvf(s, e) : null);
          const op = npc.opProfile || (deriveOp ? deriveOp(s, c) : null);
          return {
            set: true,
            odv: { s, e, c },
            s, e, c,
            tag: `[S:${s}, E:${e}, C:${c}]`,
            culture: cult || 'Bespoke',
            opProfile: op,
            source: 'explicit',
            sourceLabel: 'Bespoke'
          };
        }
      }

      // 2. Inherited from Faction (Priority 2)
      const poolFactions = (options && options.factions) || (topo && topo.factions) || [];
      const facRef = npc.factionId || npc.faction;
      let matchedFaction = null;
      if (facRef && Array.isArray(poolFactions)) {
        matchedFaction = poolFactions.find(f => f && (String(f.id) === String(facRef) || String(f.name) === String(facRef)));
      }
      if (!matchedFaction && Array.isArray(poolFactions)) {
        matchedFaction = poolFactions.find(f => f && Array.isArray(f.memberNpcIds) && f.memberNpcIds.some(mId => String(mId) === String(npc.id)));
      }

      if (matchedFaction) {
        const fOdv = getOdvFn(matchedFaction);
        const fName = matchedFaction.name || matchedFaction.id || 'Faction';
        if (fOdv && fOdv.set) {
          const s = fOdv.s, e = fOdv.e, c = fOdv.c;
          const cult = npc.culture || matchedFaction.cvfQuadrant || matchedFaction.culture || (deriveCvf ? deriveCvf(s, e) : null);
          const op = npc.opProfile || matchedFaction.opProfile || (deriveOp ? deriveOp(s, c) : null);
          return {
            set: true,
            odv: { s, e, c },
            s, e, c,
            tag: `[S:${s}, E:${e}, C:${c}]`,
            culture: cult || 'Clan',
            opProfile: op,
            source: 'faction',
            sourceName: fName,
            sourceLabel: `Inherited from Faction (${fName})`
          };
        } else if (matchedFaction.cvfQuadrant || matchedFaction.culture) {
          const cult = npc.culture || matchedFaction.cvfQuadrant || matchedFaction.culture;
          return {
            set: false,
            odv: null,
            s: null, e: null, c: null,
            tag: 'Unset',
            culture: cult,
            opProfile: npc.opProfile || matchedFaction.opProfile || null,
            source: 'faction',
            sourceName: fName,
            sourceLabel: `Inherited from Faction (${fName})`
          };
        }
      }

      // 3. Inherited from Host Settlement / Node (Priority 3)
      const hostNode = (options && options.hostNode) || (typeof resolveNodeObject === 'function' ? resolveNodeObject(npc.nodeId || npc.suggestedNode, topo) : null);
      if (hostNode) {
        const nOdv = getOdvFn(hostNode);
        const nName = hostNode.displayName || hostNode.name || `Node ${hostNode.id}`;
        if (nOdv && nOdv.set) {
          const s = nOdv.s, e = nOdv.e, c = nOdv.c;
          const cult = npc.culture || hostNode.culture || (deriveCvf ? deriveCvf(s, e) : null);
          const op = npc.opProfile || hostNode.opProfile || (deriveOp ? deriveOp(s, c) : null);
          return {
            set: true,
            odv: { s, e, c },
            s, e, c,
            tag: `[S:${s}, E:${e}, C:${c}]`,
            culture: cult || 'Clan',
            opProfile: op,
            source: 'node',
            sourceName: nName,
            sourceLabel: `Inherited from Node (${nName})`
          };
        } else if (hostNode.culture) {
          return {
            set: false,
            odv: null,
            s: null, e: null, c: null,
            tag: 'Unset',
            culture: npc.culture || hostNode.culture,
            opProfile: npc.opProfile || null,
            source: 'node',
            sourceName: nName,
            sourceLabel: `Inherited from Node (${nName})`
          };
        }
      }

      // 4. Unset (Priority 4 - Never default to 2,2,2)
      return {
        set: false,
        odv: null,
        s: null, e: null, c: null,
        tag: 'Unset',
        culture: npc.culture || 'Unset',
        opProfile: npc.opProfile || null,
        source: 'unset',
        sourceLabel: 'Unset'
      };
    }
    window.getNpcEffectiveSociology = getNpcEffectiveSociology;

    function computeNpcNodeDissonance(npc, node, targetTopo = null, options = {}) {
      if (!npc || !node) return null;
      const topo = targetTopo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
      const eff = getNpcEffectiveSociology(npc, topo, options);
      const getOdvFn = (typeof getOdv === 'function') ? getOdv : ((ent) => {
        if (!ent) return { set: false };
        const raw = ent.odv || ent.disposition;
        if (!raw) return { set: false };
        if (typeof raw === 'object' && raw.s && raw.e && raw.c) return { set: true, s: Number(raw.s), e: Number(raw.e), c: Number(raw.c) };
        if (Array.isArray(raw) && raw.length >= 3) return { set: true, s: Number(raw[0]), e: Number(raw[1]), c: Number(raw[2]) };
        return { set: false };
      });
      const nodeOdv = getOdvFn(node);

      // If the NPC directly inherited disposition from this host node:
      if (eff.source === 'node') {
        return {
          deltaD: 0,
          level: 'Harmonious',
          badgeClass: 'entity-badge-tag',
          style: 'background:#dcfce7; color:#166534; border:1px solid #86efac;',
          summary: 'Harmonious: Conforms to Host Settlement Norms (Inherited)',
          warning: null
        };
      }

      // If neither NPC nor Node has ODV set
      if (!eff.set || !nodeOdv || !nodeOdv.set) {
        const cultMismatch = !!(eff.culture && node.culture && eff.culture !== 'Unset' && eff.culture !== node.culture);
        if (cultMismatch) {
          return {
            deltaD: null,
            level: 'Moderate Tension',
            badgeClass: 'entity-badge-tag',
            style: 'background:#fef3c7; color:#92400e; border:1px solid #f59e0b;',
            summary: `Moderate Tension (Cultural Divergence): ${eff.culture} vs Node ${node.culture}`,
            warning: 'Cultural misalignment with host settlement.'
          };
        }
        return {
          deltaD: null,
          level: 'Unset / Baseline',
          badgeClass: 'entity-badge-tag',
          style: 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;',
          summary: 'Sociological vector unset on Character or Host Settlement',
          warning: null
        };
      }

      const deltaD = Math.abs(nodeOdv.s - eff.s) + Math.abs(nodeOdv.e - eff.e) + Math.abs(nodeOdv.c - eff.c);
      const cultureMismatch = !!(eff.culture && node.culture && eff.culture !== node.culture);
      const sourceDesc = eff.source === 'faction' ? `Faction ${eff.sourceName || 'Affiliation'}` : (eff.culture || 'Individual');

      if (deltaD >= 4 || (cultureMismatch && deltaD >= 3)) {
        return {
          deltaD,
          level: 'Severe Clash',
          badgeClass: 'entity-badge-tag',
          style: 'background:#fee2e2; color:#b91c1c; border:1px solid #ef4444; font-weight:bold;',
          summary: `Severe Clash (ΔD=${deltaD}): ${sourceDesc} vs Node ${node.culture || 'Culture'}`,
          warning: `Ideological friction with host settlement! Character is vulnerable to local betrayal, mutiny, or political ostracism.`
        };
      } else if (deltaD >= 2 || cultureMismatch) {
        return {
          deltaD,
          level: 'Moderate Tension',
          badgeClass: 'entity-badge-tag',
          style: 'background:#fef3c7; color:#92400e; border:1px solid #f59e0b;',
          summary: `Moderate Tension (ΔD=${deltaD}): ${sourceDesc} vs Node ${node.culture || 'Culture'}`,
          warning: `Subtle cultural misalignment. Character harbors reservations about local governing customs.`
        };
      } else {
        return {
          deltaD,
          level: 'Harmonious',
          badgeClass: 'entity-badge-tag',
          style: 'background:#dcfce7; color:#166534; border:1px solid #86efac;',
          summary: `Harmonious (ΔD=${deltaD}): Cultural Resonance`,
          warning: null
        };
      }
    }
    window.computeNpcNodeDissonance = computeNpcNodeDissonance;

    function setNpcPartyDisposition(npcId, delta) {
      const topo = Workstation.activeTopology;
      const activeList = getActiveEntityList('npc');
      let npc = activeList.find(n => n.id === npcId || n.prototypeId === npcId);
      if (!npc) {
        promotePrototypeToCampaign(npcId, 'npc');
        npc = activeList[activeList.length - 1];
      }
      if (!npc) return;
      const cur = (npc.dispositionToParty !== undefined) ? npc.dispositionToParty : 0;
      npc.dispositionToParty = Math.max(-2, Math.min(2, cur + delta));
      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      renderEntityManagerList();
      selectEntityItem(npc.id, false);
      const labels = (typeof PARTY_STANCE_LABELS !== "undefined") ? PARTY_STANCE_LABELS : { '-2': 'Hostile', '-1': 'Unfriendly', '0': 'Neutral', '1': 'Friendly', '2': 'Allied' };
      setStatusBarMessage(`Party standing with ${npc.name} set to ${labels[String(npc.dispositionToParty)] || npc.dispositionToParty}.`);
    }
    window.setNpcPartyDisposition = setNpcPartyDisposition;

    function toggleNpcSecretRevealed(npcId, secretIndex) {
      const topo = Workstation.activeTopology;
      const activeList = getActiveEntityList('npc');
      let npc = activeList.find(n => n.id === npcId || n.prototypeId === npcId);
      if (!npc) {
        promotePrototypeToCampaign(npcId, 'npc');
        npc = activeList[activeList.length - 1];
      }
      if (!npc || !npc.secretsKnown || !npc.secretsKnown[secretIndex]) return;
      const sec = npc.secretsKnown[secretIndex];
      sec.revealed = !sec.revealed;
      saveActiveCampaign();
      renderEntityManagerList();
      selectEntityItem(npc.id, false);
      setStatusBarMessage(`Secret marked as ${sec.revealed ? 'REVEALED to players' : 'CONCEALED'}.`);
    }
    window.toggleNpcSecretRevealed = toggleNpcSecretRevealed;

    function toggleItemPossessionMode(itemId, isProto) {
      const topo = Workstation.activeTopology;
      const activeList = getActiveEntityList('item');
      let item = activeList.find(i => i.id === itemId || i.prototypeId === itemId);
      if (!item && isProto) {
        promotePrototypeToCampaign(itemId, 'item');
        item = activeList[activeList.length - 1];
      }
      if (!item) return;
      item.possessionMode = (item.possessionMode === 'carried') ? 'stored' : 'carried';
      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      renderEntityManagerTree();
      renderEntityManagerList();
      selectEntityItem(item.id, false);
      const modeStr = (item.possessionMode === 'carried') ? 'Equipped / Carried by character (Inherits node)' : 'Stored at Stationed Node';
      setStatusBarMessage(`Item "${item.name}" possession mode set to ${modeStr}.`);
    }
    window.toggleItemPossessionMode = toggleItemPossessionMode;

    // --- Inter-NPC Relational Web & Social Graph (ADR 0021) ---
    const INVERSE_RELATIONSHIPS = {
      'Ally': 'Ally',
      'Rival': 'Rival',
      'Family': 'Family',
      'Superior': 'Subordinate',
      'Subordinate': 'Superior',
      'Debtor': 'Creditor',
      'Creditor': 'Debtor',
      'Informant': 'Handler',
      'Handler': 'Informant'
    };
    window.INVERSE_RELATIONSHIPS = INVERSE_RELATIONSHIPS;

    function addNpcRelationship(sourceNpcId, targetNpcId, relationshipType, sentiment = 0, notes = '', isReciprocal = false) {
      if (!sourceNpcId || !targetNpcId) return false;
      const sId = String(sourceNpcId).trim();
      const tId = String(targetNpcId).trim();
      if (sId === tId) return false;

      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo) return false;
      if (!Array.isArray(topo.npcs)) topo.npcs = [];

      let sourceNpc = topo.npcs.find(n => String(n.id) === sId);
      if (!sourceNpc && typeof promotePrototypeToCampaign === 'function') {
        promotePrototypeToCampaign(sId, 'npc');
        sourceNpc = topo.npcs.find(n => String(n.id) === sId || String(n.prototypeId) === sId);
      }
      if (!sourceNpc) return false;

      // Verify target NPC exists in roster or prototypes
      let targetNpc = topo.npcs.find(n => String(n.id) === tId);
      if (!targetNpc && typeof promotePrototypeToCampaign === 'function') {
        promotePrototypeToCampaign(tId, 'npc');
        targetNpc = topo.npcs.find(n => String(n.id) === tId || String(n.prototypeId) === tId);
      }

      const relType = String(relationshipType || 'Ally').trim();
      let sNum = parseInt(sentiment, 10);
      if (isNaN(sNum)) sNum = 0;
      sNum = Math.max(-100, Math.min(100, sNum));

      if (!Array.isArray(sourceNpc.relationships)) sourceNpc.relationships = [];

      const relRecord = {
        targetNpcId: tId,
        relationshipType: relType,
        relationship: relType,
        type: relType, // backward-compatibility alias
        sentiment: sNum,
        notes: String(notes || '')
      };

      const existingIdx = sourceNpc.relationships.findIndex(r => String(r.targetNpcId) === tId);
      if (existingIdx >= 0) {
        sourceNpc.relationships[existingIdx] = relRecord;
      } else {
        sourceNpc.relationships.push(relRecord);
      }

      // Handle reciprocal tie creation
      if (isReciprocal && targetNpc) {
        const invType = INVERSE_RELATIONSHIPS[relType] || relType;
        addNpcRelationship(tId, sId, invType, sNum, notes, false);
      }

      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
      if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
      if (typeof selectEntityItem === 'function' && typeof CurrentEntityTab !== 'undefined' && CurrentEntityTab === 'npc') {
        selectEntityItem(sourceNpc.id, false);
      }
      if (typeof setStatusBarMessage === 'function') {
        const targetName = targetNpc ? targetNpc.name : `NPC [${tId}]`;
        setStatusBarMessage(`Added relationship: ${sourceNpc.name} -> ${relType} -> ${targetName} (${sNum >= 0 ? '+' : ''}${sNum}).`);
      }
      if (typeof renderSocialGraph === 'function') renderSocialGraph();
      return true;
    }
    window.addNpcRelationship = addNpcRelationship;

    function removeNpcRelationship(sourceNpcId, targetNpcId, isReciprocal = true) {
      if (!sourceNpcId || !targetNpcId) return false;
      const sId = String(sourceNpcId).trim();
      const tId = String(targetNpcId).trim();

      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo || !Array.isArray(topo.npcs)) return false;

      const sourceNpc = topo.npcs.find(n => String(n.id) === sId);
      if (sourceNpc && Array.isArray(sourceNpc.relationships)) {
        sourceNpc.relationships = sourceNpc.relationships.filter(r => String(r.targetNpcId) !== tId);
      }

      if (isReciprocal) {
        const targetNpc = topo.npcs.find(n => String(n.id) === tId);
        if (targetNpc && Array.isArray(targetNpc.relationships)) {
          targetNpc.relationships = targetNpc.relationships.filter(r => String(r.targetNpcId) !== sId);
        }
      }

      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
      if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
      if (typeof selectEntityItem === 'function' && typeof CurrentEntityTab !== 'undefined' && CurrentEntityTab === 'npc') {
        selectEntityItem(sId, false);
      }
      if (typeof setStatusBarMessage === 'function') setStatusBarMessage("Relationship removed.");
      if (typeof renderSocialGraph === 'function') renderSocialGraph();
      return true;
    }
    window.removeNpcRelationship = removeNpcRelationship;

    function promptAddNpcRelationship(sourceNpcId) {
      if (typeof openAddNpcRelationshipModal === 'function') {
        openAddNpcRelationshipModal(sourceNpcId);
        return;
      }
      const topo = Workstation.activeTopology;
      const activeList = getActiveEntityList('npc');
      let sourceNpc = activeList.find(n => n.id === sourceNpcId || n.prototypeId === sourceNpcId);
      if (!sourceNpc) {
        promotePrototypeToCampaign(sourceNpcId, 'npc');
        sourceNpc = activeList[activeList.length - 1];
      }
      if (!sourceNpc) return;
      const otherNpcs = (topo.npcs || []).filter(n => n.id !== sourceNpc.id);
      if (otherNpcs.length === 0) {
        alert("No other NPCs in the active campaign roster to form a relationship with. Add more characters first.");
        return;
      }
      const listPrompt = otherNpcs.map((n, idx) => `${idx + 1}: ${n.name} (${n.role || 'Resident'})`).join('\n');
      const pickStr = prompt(`Select target NPC by number:\n${listPrompt}`);
      if (!pickStr) return;
      const pickIdx = parseInt(pickStr) - 1;
      const targetNpc = otherNpcs[pickIdx];
      if (!targetNpc) {
        alert("Invalid selection.");
        return;
      }
      const relType = prompt(`Enter relationship type (Ally, Rival, Family, Superior, Subordinate, Debtor, Creditor, Informant, Handler):`, 'Rival');
      if (!relType) return;
      const relNotes = prompt(`Enter context notes between ${sourceNpc.name} and ${targetNpc.name}:`, '');

      addNpcRelationship(sourceNpc.id, targetNpc.id, relType, 0, relNotes || '', true);
    }
    window.promptAddNpcRelationship = promptAddNpcRelationship;


    // --- Entity Collection & Prototype Seeding ---
    function getPrototypesForType(type) {
      let result = [];
      const seedsKey = type === 'npc' ? 'npcs'
        : (type === 'quest' ? 'quests'
        : ((type === 'item' || type === 'industry' || type === 'resource') ? 'items'
        : (type === 'creature' ? 'creatures'
        : (type === 'tracker' ? 'trackers'
        : (type === 'faction' ? 'factions' : '')))));
      const protoBag = (typeof MODULE_ENTITY_PROTOTYPES !== 'undefined' && MODULE_ENTITY_PROTOTYPES) ? MODULE_ENTITY_PROTOTYPES : {};
      const rawSeeds = protoBag[seedsKey] || [];
      const partitionItems = (arr) => {
        if (!Array.isArray(arr)) return [];
        if (type === 'resource') return arr.filter(i => isResourceItem(i));
        if (type === 'industry') return arr.filter(i => !isResourceItem(i) && isIndustryItem(i));
        if (type === 'item') return arr.filter(i => !isResourceItem(i) && !isIndustryItem(i));
        return arr;
      };
      const seeds = (type === 'item' || type === 'industry' || type === 'resource') ? partitionItems(rawSeeds) : rawSeeds;
      result.push(...seeds);

      if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
        ALL_MODULES.forEach(m => {
          if (type === 'npc' || type === 'quest' || type === 'item' || type === 'industry' || type === 'resource') {
            const rawList = type === 'npc' ? m.extracted_npcs : (type === 'quest' ? m.extracted_quests : m.extracted_items);
            const list = (type === 'item' || type === 'industry' || type === 'resource') ? partitionItems(rawList) : rawList;
            if (Array.isArray(list)) {
              list.forEach(item => {
                if (!result.some(existing => existing.id === item.id || (item.name && existing.name === item.name) || (item.title && existing.title === item.title))) {
                  result.push({
                    ...item,
                    suggestedNode: null
                  });
                }
              });
            }
          } else if (type === 'creature') {
            const list = m.extracted_creatures || m.creatures;
            if (Array.isArray(list)) {
              list.forEach(c => {
                if (!result.some(existing => existing.id === c.id || (c.name && existing.name === c.name))) {
                  result.push({
                    ...c,
                    suggestedNode: null
                  });
                }
              });
            }
          } else if (type === 'tracker') {
            // Dynamic Threat Clocks extraction from Worldbuilding Modules
            (m.threat_clocks || []).forEach((c, idx) => {
              const tickMatch = c.match(/\[(\d+)\s*Ticks?\]/i);
              const maxTicks = tickMatch ? parseInt(tickMatch[1]) : 6;
              let name = c.split(/\[|\:\*\*/)[0].replace(/\*\*/g, '').trim();
              if (!name) name = `${m.title} Threat Clock`;
              const notes = c.replace(/^.*?\:\*\*/, '').replace(/\*\*/g, '').trim();
              const id = `PROTO-TRK-${m.id}-${idx}`;
              if (!result.some(existing => existing.name === name || existing.id === id)) {
                result.push({
                  id: id,
                  name: name,
                  type: 'Threat Clock',
                  currentTicks: 0,
                  maxTicks: maxTicks,
                  faction: m.four_corners ? (m.four_corners.active || m.four_corners.adversary || 'Faction Stakes') : 'Regional',
                  notes: notes || c,
                  moduleId: m.id,
                  suggestedNode: null
                });
              }
            });

            // Dynamic Output Dials extraction from Worldbuilding Modules
            if (m.dials && m.dials.length > 0) {
              const dialId = `PROTO-DIAL-${m.id}`;
              const dialName = `${m.title} Output Dial`;
              if (!result.some(existing => existing.name === dialName || existing.id === dialId)) {
                result.push({
                  id: dialId,
                  name: dialName,
                  type: 'Output Dial',
                  currentTicks: 1,
                  maxTicks: m.dials.length,
                  faction: 'System Dial',
                  notes: m.dials.map(d => d.replace(/\"/g, '')).join(' | '),
                  moduleId: m.id,
                  suggestedNode: null
                });
              }
            }
          }
        });
      }

      const topo = Workstation.activeTopology;
      if (topo) {
        if (Array.isArray(topo.deletedPrototypes) && topo.deletedPrototypes.length > 0) {
          result = result.filter(item => !item || !item.id || !topo.deletedPrototypes.includes(String(item.id)));
        }
        if (Array.isArray(topo.deletedModules) && topo.deletedModules.length > 0) {
          result = result.filter(item => !item || !item.moduleId || !topo.deletedModules.includes(String(item.moduleId)));
        }
      }

      return result;
    }


    function getBackingEntityList(type) {
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo) return [];
      if (type === 'npc') {
        if (!Array.isArray(topo.npcs)) topo.npcs = [];
        return topo.npcs;
      }
      if (type === 'quest') {
        if (!Array.isArray(topo.quests)) topo.quests = [];
        return topo.quests;
      }
      if (type === 'item' || type === 'industry' || type === 'resource') {
        if (!Array.isArray(topo.items)) topo.items = [];
        return topo.items;
      }
      if (type === 'creature') {
        if (!Array.isArray(topo.creatures)) topo.creatures = [];
        return topo.creatures;
      }
      if (type === 'tracker') {
        if (!Array.isArray(topo.trackers)) topo.trackers = [];
        return topo.trackers;
      }
      if (type === 'faction') {
        if (!Array.isArray(topo.factions)) topo.factions = [];
        return topo.factions;
      }
      return [];
    }
    window.getBackingEntityList = getBackingEntityList;

    function getActiveEntityList(type) {
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo) return [];
      if (type === 'npc') return topo.npcs || [];
      if (type === 'quest') return topo.quests || [];
      if (type === 'item') {
        return (topo.items || []).filter(i => !isResourceItem(i) && !isIndustryItem(i));
      }
      if (type === 'industry') {
        return (topo.items || []).filter(i => !isResourceItem(i) && isIndustryItem(i));
      }
      if (type === 'resource') {
        return (topo.items || []).filter(i => isResourceItem(i));
      }
      if (type === 'creature') {
        return topo.creatures || [];
      }
      if (type === 'tracker') return topo.trackers || [];
      if (type === 'faction') return topo.factions || [];
      if (type === 'node') {
        return Object.keys(topo.nodes || {}).map(k => {
          const n = topo.nodes[k];
          const cleanId = (isNaN(k) || String(k).includes('-')) ? k : parseInt(k);
          return {
            ...n,
            id: cleanId,
            key: k
          };
        });
      }
      return [];
    }
    window.getActiveEntityList = getActiveEntityList;

    function getTicketsForEntity(targetType, targetId) {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(topo.tickets)) return [];
      if (!targetType && !targetId) return [];
      const idStr = String(targetId);
      return topo.tickets.filter(tk => {
        if (targetType && tk.targetType && tk.targetType !== targetType) return false;
        if (tk.targetId != null && String(tk.targetId) === idStr) return true;
        // Node fallback: if ticket has nodeId matching targetId and targetType is 'node'
        if ((!tk.targetType || tk.targetType === 'node') && targetType === 'node' && String(tk.nodeId) === idStr) return true;
        return false;
      });
    }
    window.getTicketsForEntity = getTicketsForEntity;

    function getTrackersForEntity(targetType, targetId) {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(topo.trackers)) return [];
      if (!targetType && !targetId) return [];
      const idStr = String(targetId);

      // If targetType is quest, also collect tracker IDs referenced directly on the quest object or its steps
      const questLinkedTrackerIds = new Set();
      if (targetType === 'quest' && Array.isArray(topo.quests)) {
        const q = topo.quests.find(qItem => String(qItem.id) === idStr);
        if (q) {
          (q.trackerIds || []).forEach(tid => { if (tid) questLinkedTrackerIds.add(String(tid)); });
          (q.steps || []).forEach(s => { if (s && s.triggerTrackerId) questLinkedTrackerIds.add(String(s.triggerTrackerId)); });
        }
      }

      return topo.trackers.filter(trk => {
        if (!trk) return false;
        // Direct stationing check if node
        if (targetType === 'node' && String(trk.nodeId) === idStr) return true;
        // Quest reverse-link check
        if (targetType === 'quest' && questLinkedTrackerIds.has(String(trk.id))) return true;
        // Trigger refs check
        if (Array.isArray(trk.triggerRefs)) {
          return trk.triggerRefs.some(ref => {
            if (!ref) return false;
            if (targetType && ref.entityType && ref.entityType !== targetType) return false;
            return String(ref.entityId) === idStr;
          });
        }
        return false;
      });
    }
    window.getTrackersForEntity = getTrackersForEntity;


    // --- Tracker Clocks, Consequences & Stationing Helpers ---
    function evaluateTrackerConsequences(trk, prevTicks, newTicks, options = {}) {
      if (!trk || !Array.isArray(trk.consequences)) return [];
      const results = [];

      if (newTicks > prevTicks) {
        // Ascending tick order
        const crossed = trk.consequences
          .filter(c => c && typeof c.tick === 'number' && prevTicks < c.tick && newTicks >= c.tick && !c.triggered)
          .sort((a, b) => a.tick - b.tick);

        for (const c of crossed) {
          let apply = true;
          if (!options.silent && typeof window !== 'undefined' && typeof window.confirm === 'function') {
            apply = window.confirm(
              `⏱️ THREAT CLOCK CONVERSION MILESTONE REACHED!\n\n` +
              `Clock: "${trk.name || trk.title}" reached ${newTicks}/${trk.maxTicks || 6} ticks (Threshold: Tick ${c.tick}).\n\n` +
              `Consequence: ${c.description}\n\n` +
              `Apply this consequence to the campaign world now?`
            );
          }
          if (apply) {
            c.triggered = true;
            c.triggeredAt = new Date().toISOString();
            if (options.batchId) c.triggeredByBatchId = options.batchId;

            const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof window !== 'undefined' && window.CreatorStudio && window.CreatorStudio.ai) || null;
            if (cme && typeof cme.executeBrowserConsequence === 'function' && typeof Workstation !== 'undefined' && Workstation.activeTopology) {
              try {
                cme.executeBrowserConsequence(Workstation.activeTopology, trk, c, options);
              } catch (err) {
                console.warn('[ClockConsequence] Error executing browser consequence:', err);
              }
            }

            if (Array.isArray(c.operations) && c.operations.length > 0) {
              const cascadeDepth = (options.cascadeDepth || 0) + 1;
              if (cascadeDepth <= 3) {
                if (cme && typeof cme.applyBatch === 'function') {
                  try {
                    cme.applyBatch(Workstation.activeTopology, {
                      actor: 'Clock Consequence',
                      summary: `Consequence of ${trk.name || trk.title} reaching tick ${c.tick}: ${c.description}`,
                      operations: c.operations
                    }, { cascadeDepth });
                  } catch (err) {
                    console.warn('[ClockConsequence] Error executing consequence operations:', err);
                  }
                }
              } else {
                console.warn('[ClockConsequence] Reached MAX_CONSEQUENCE_CASCADE_DEPTH (3), stopping consequence recursion.');
              }
            }
            results.push({ action: 'applied', consequence: c });
            if (typeof setStatusBarMessage === 'function') {
              setStatusBarMessage(`Triggered Consequence for "${trk.name || trk.title}" (Tick ${c.tick}): ${c.description}`);
            }
          } else {
            results.push({ action: 'skipped', consequence: c });
          }
        }
      } else if (newTicks < prevTicks) {
        // Rolled back below a triggered threshold
        const rolledBack = trk.consequences
          .filter(c => c && typeof c.tick === 'number' && newTicks < c.tick && prevTicks >= c.tick && c.triggered)
          .sort((a, b) => b.tick - a.tick);

        for (const c of rolledBack) {
          let rearm = true;
          if (!options.silent && typeof window !== 'undefined' && typeof window.confirm === 'function') {
            rearm = window.confirm(
              `⏱️ THREAT CLOCK ROLLED BACK BELOW THRESHOLD!\n\n` +
              `Clock: "${trk.name || trk.title}" rolled back from ${prevTicks} to ${newTicks} ticks (Below Tick ${c.tick}).\n\n` +
              `Consequence: ${c.description}\n\n` +
              `Click OK to RE-ARM this consequence so it can trigger again.\n` +
              `Click Cancel to keep it marked as already triggered.`
            );
          }
          if (rearm) {
            c.triggered = false;
            delete c.triggeredAt;
            delete c.triggeredByBatchId;
            results.push({ action: 'rearmed', consequence: c });
          } else {
            results.push({ action: 'kept', consequence: c });
          }
        }
      }
      try {
        Object.defineProperty(trk, '_lastTriggeredConsequences', {
          value: results.filter(r => r.action === 'applied').map(r => r.consequence),
          writable: true,
          enumerable: false,
          configurable: true
        });
      } catch (_) {}
      return results;
    }
    window.evaluateTrackerConsequences = evaluateTrackerConsequences;

    function advanceTrackerTick(trackerId, delta, options = {}) {
      const activeList = getActiveEntityList('tracker');
      let trk = activeList.find(t => String(t.id) === String(trackerId) || String(t.prototypeId) === String(trackerId));

      if (!trk) {
        // Auto-promote if prototype with explicit type 'tracker'
        if (typeof promotePrototypeToCampaign === 'function') {
          trk = promotePrototypeToCampaign(trackerId, 'tracker');
        }
        if (!trk) trk = activeList[activeList.length - 1];
      }

      if (trk) {
        const prevTicks = trk.currentTicks !== undefined ? trk.currentTicks : (trk.value || 0);
        const maxTicks = trk.maxTicks || 6;
        let newTicks = prevTicks;
        if (delta === -999) {
          newTicks = 0;
        } else {
          newTicks = Math.max(0, Math.min(maxTicks, prevTicks + delta));
        }
        trk.currentTicks = newTicks;

        evaluateTrackerConsequences(trk, prevTicks, newTicks, options);

        if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
        if (typeof renderCanvas === 'function') renderCanvas();
        if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
        if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
        if (typeof selectEntityItem === 'function') selectEntityItem(trk.id, false);
        if (typeof setStatusBarMessage === 'function') {
          setStatusBarMessage(`Threat Clock "${trk.name || trk.title}" set to ${trk.currentTicks}/${maxTicks} ticks.`);
        }
        return trk;
      }
      return null;
    }
    window.advanceTrackerTick = advanceTrackerTick;

    function resetTrackerTicks(trackerId, options = {}) {
      return advanceTrackerTick(trackerId, -999, options);
    }
    window.resetTrackerTicks = resetTrackerTicks;

    function toggleTrackerCanvasVisibility(trackerId, isVisible, isPrototype) {
      const activeList = getActiveEntityList('tracker');
      let trk = activeList.find(t => t.id === trackerId || t.prototypeId === trackerId);
      if (!trk && isPrototype) {
        promotePrototypeToCampaign(trackerId, 'tracker');
        trk = activeList[activeList.length - 1];
      }
      if (trk) {
        trk.showOnCanvas = isVisible;
        saveActiveCampaign();
        renderCanvas();
        setStatusBarMessage(`Threat Clock "${trk.name}" canvas gauge ${isVisible ? 'enabled' : 'hidden'}.`);
      }
    }

    function setTrackerDialLevel(trackerId, level, isPrototype) {
      const activeList = getActiveEntityList('tracker');
      let trk = activeList.find(t => t.id === trackerId || t.prototypeId === trackerId);
      if (!trk && isPrototype) {
        promotePrototypeToCampaign(trackerId, 'tracker');
        trk = activeList[activeList.length - 1];
      }
      if (trk) {
        trk.currentTicks = Math.max(1, Math.min(4, level));
        saveActiveCampaign();
        renderCanvas();
        updatePropertiesGrid();
        renderEntityManagerList();
        selectEntityItem(trk.id, false);
        setStatusBarMessage(`Dial "${trk.name}" set to Level ${trk.currentTicks} / 4.`);
      }
    }

    function resetTrackerOffset(trackerId) {
      const activeList = getActiveEntityList('tracker');
      const trk = activeList.find(t => t.id === trackerId || t.prototypeId === trackerId);
      if (trk) {
        delete trk.offsetX;
        delete trk.offsetY;
        saveActiveCampaign();
        renderCanvas();
        selectEntityItem(trk.id, false);
        setStatusBarMessage(`Reset canvas callout position for "${trk.name}".`);
      }
    }

    function updateNodeProp(nodeId, prop, value, targetMapId = null) {
      let topo = Workstation.activeTopology;
      let node = topo && topo.nodes ? topo.nodes[nodeId.toString()] : null;

      if (!node && typeof maps !== "undefined") {
        const mId = targetMapId || Object.keys(maps).find(k => {
          const m = maps[k];
          return Array.isArray(m.nodes) ? m.nodes.some(n => String(n.id) === String(nodeId)) : (m.nodes && m.nodes[nodeId.toString()]);
        });
        if (mId && maps[mId]) {
          const m = maps[mId];
          node = Array.isArray(m.nodes) ? m.nodes.find(n => String(n.id) === String(nodeId)) : (m.nodes && m.nodes[nodeId.toString()]);
        }
      }
      if (!node) return;

      node[prop] = value;
      if (prop === 'tier' && value === 3) node.eligible = false;
      if (prop === 'eligible' && value) node.tier = 2;

      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      renderEntityManagerTree();
      renderEntityManagerList();
      selectEntityItem(nodeId, false, targetMapId);
      setStatusBarMessage(`Updated Node ${nodeId} ${prop} = ${value}`);
    }

    async function centerOnNode(nodeId, optMapId = null) {
      if (nodeId == null || nodeId === '') return;

      const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
      if (optMapId && optMapId !== curMapId && typeof switchActiveMap === 'function') {
        await switchActiveMap(optMapId);
        await new Promise(r => setTimeout(r, 40));
      }

      const topo = Workstation.activeTopology;
      let node = topo && topo.nodes
        ? (Array.isArray(topo.nodes)
            ? topo.nodes.find(n => String(n.id) === String(nodeId))
            : (topo.nodes[nodeId.toString()] || Object.values(topo.nodes).find(n => String(n.id) === String(nodeId))))
        : null;

      // If node is not on active map, find which map owns it and switch to it!
      const mapRegistry = (typeof maps !== "undefined" && maps) ? maps : (window.maps || {});
      if (!node && mapRegistry && Object.keys(mapRegistry).length > 0) {
        for (const mId of Object.keys(mapRegistry)) {
          const m = mapRegistry[mId];
          if (!m) continue;
          const found = Array.isArray(m.nodes)
            ? (m.nodes || []).find(n => String(n.id) === String(nodeId))
            : (m.nodes && (m.nodes[nodeId.toString()] || Object.values(m.nodes).find(n => String(n.id) === String(nodeId))));
          if (found) {
            if (typeof switchActiveMap === 'function') {
              await switchActiveMap(mId);
              await new Promise(r => setTimeout(r, 60));
              return centerOnNode(nodeId);
            }
          }
        }
      }

      if (!node) return;

      if (typeof selectNode === 'function') selectNode(nodeId);
      const container = document.getElementById('canvas-container');
      if (container) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const zoom = Workstation.zoom || 1.0;
        if (!Workstation.pan) Workstation.pan = { x: 0, y: 0 };
        Workstation.pan.x = (cw / 2) - (node.x * zoom);
        Workstation.pan.y = (ch / 2) - (node.y * zoom);
        if (typeof applyCanvasTransform === 'function') applyCanvasTransform();
      }

      // Visual ping highlight on node element
      const nodeEl = document.getElementById(`cad-node-${nodeId}`) || document.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeEl) {
        nodeEl.classList.remove('node-ping-highlight');
        void nodeEl.offsetWidth;
        nodeEl.classList.add('node-ping-highlight');
      }

      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(`Centered viewport on Node ${nodeId}: "${node.name || 'Station'}".`);
      }
    }

    let _promoSequence = 0;
    function promotePrototypeToCampaign(protoId, explicitType = null) {
      const type = explicitType || (typeof CurrentEntityTab !== 'undefined' ? CurrentEntityTab : 'npc');
      const protoList = getPrototypesForType(type);
      const proto = protoList.find(p => String(p.id) === String(protoId));
      if (!proto) return null;

      const activeList = getActiveEntityList(type);
      const backingList = getBackingEntityList(type);
      const existing = activeList.find(e => String(e.prototypeId) === String(proto.id) || String(e.id) === String(proto.id));
      if (existing) {
        if (proto.suggestedNode && !existing.nodeId) existing.nodeId = proto.suggestedNode;
        return existing;
      }

      _promoSequence++;
      const uniqueSuffix = `${Date.now().toString(36)}-${_promoSequence.toString(36)}`;
      const newId = `${type}-${uniqueSuffix}`;

      const newEntity = {
        ...proto,
        id: newId,
        prototypeId: proto.id,
        nodeId: proto.suggestedNode || null,
        status: 'Active',
        isCustom: false
      };
      if (type === 'resource') {
        newEntity.isResource = true;
        newEntity.entityKind = 'resource';
        if (!newEntity.category) newEntity.category = 'Resource Export / Supply Anchor';
      } else if (type === 'industry') {
        newEntity.isIndustry = true;
        newEntity.entityKind = 'industry';
        if (!newEntity.category) newEntity.category = 'Infrastructural Machinery';
      }
      if (type === 'creature') {
        if (!newEntity.stationing) {
          newEntity.stationing = {
            mode: proto.suggestedNode ? 'lair' : 'unassigned',
            nodeId: proto.suggestedNode || null
          };
        }
      }
      if (proto.fft) newEntity.fft = JSON.parse(JSON.stringify(proto.fft)); // never share a tree between entities
      if (type === 'tracker') {
        newEntity.currentTicks = proto.currentTicks !== undefined ? proto.currentTicks : (proto.value || 0);
        newEntity.maxTicks = proto.maxTicks !== undefined ? proto.maxTicks : (proto.max || 6);
        if (proto.consequences && Array.isArray(proto.consequences)) {
          newEntity.consequences = JSON.parse(JSON.stringify(proto.consequences));
        }
      } else if (type === 'quest') {
        newEntity.status = proto.status || 'Active';
      }

      backingList.push(newEntity);

      // Relational foreign key rewriting: update references across active topology pointing to protoId
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (topo) {
        const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);
        if (cme && typeof cme.remapEntityCluster === 'function') {
          cme.remapEntityCluster(topo, {
            mutateInPlace: true,
            autoGenerateIds: false,
            idMap: { [String(protoId)]: newId },
            submaps: (typeof maps !== 'undefined' && maps) ? maps : topo.maps
          });
        }
        if (type === 'npc') {
          (topo.quests || []).forEach(q => {
            if (Array.isArray(q.npcIds)) {
              q.npcIds = q.npcIds.map(id => String(id) === String(protoId) ? newId : id);
            }
            if (String(q.giverNpcId) === String(protoId)) q.giverNpcId = newId;
            if (String(q.targetNpcId) === String(protoId)) q.targetNpcId = newId;
          });
          (topo.factions || []).forEach(f => {
            if (String(f.leaderNpcId) === String(protoId)) f.leaderNpcId = newId;
          });
        } else if (type === 'tracker') {
          (topo.quests || []).forEach(q => {
            if (Array.isArray(q.trackerIds)) {
              q.trackerIds = q.trackerIds.map(id => String(id) === String(protoId) ? newId : id);
            }
            if (Array.isArray(q.steps)) {
              q.steps.forEach(st => {
                if (st && String(st.triggerTrackerId) === String(protoId)) st.triggerTrackerId = newId;
              });
            }
          });
        }
        // Spatial Pins targetId and links remapping
        const updatePins = (pins) => {
          if (!Array.isArray(pins)) return;
          pins.forEach(pin => {
            if (pin && String(pin.targetId) === String(protoId) && pin.targetType === type) {
              pin.targetId = newId;
            }
            if (pin && Array.isArray(pin.links)) {
              pin.links.forEach(lnk => {
                if (lnk && String(lnk.id) === String(protoId) && lnk.type === type) {
                  lnk.id = newId;
                }
              });
            }
          });
        };
        updatePins(topo.spatialPins);
        if (typeof maps !== 'undefined' && maps) {
          Object.values(maps).forEach(m => {
            if (m && Array.isArray(m.spatialPins)) updatePins(m.spatialPins);
          });
        }
      }

      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
      if (typeof renderCanvas === 'function') renderCanvas();
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
      if (typeof renderEntityManagerTree === 'function') renderEntityManagerTree();
      if (typeof selectEntityItem === 'function') selectEntityItem(newEntity.id, false);
      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(`Added ${newEntity.name || newEntity.title} to active campaign.`);
      }
      return newEntity;
    }
    window.promotePrototypeToCampaign = promotePrototypeToCampaign;

    function syncQuestAndTrackerLinks(quest, previousTrackerIds = []) {
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo || !Array.isArray(topo.trackers)) return;
      const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);
      if (cme && typeof cme.syncQuestAndTrackerLinks === 'function') {
        return cme.syncQuestAndTrackerLinks(topo, quest, previousTrackerIds);
      }
      const currentTrackerIds = new Set(quest.trackerIds ? quest.trackerIds.map(String) : []);

      if (Array.isArray(quest.steps)) {
        quest.steps.forEach(st => {
          if (st && st.triggerTrackerId) currentTrackerIds.add(String(st.triggerTrackerId));
        });
      }
      quest.trackerIds = Array.from(currentTrackerIds);

      topo.trackers.forEach(trk => {
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
    window.syncQuestAndTrackerLinks = syncQuestAndTrackerLinks;

    function syncTrackerToQuests(tracker, previousTriggerQuestIds = []) {
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo || !Array.isArray(topo.quests)) return;
      const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);
      if (cme && typeof cme.syncTrackerToQuests === 'function') {
        return cme.syncTrackerToQuests(topo, tracker, previousTriggerQuestIds);
      }
      const trkId = String(tracker.id);
      const currentQuestIds = new Set(
        (tracker.triggerRefs || [])
          .filter(r => r && r.entityType === 'quest')
          .map(r => String(r.entityId))
      );

      topo.quests.forEach(q => {
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
    window.syncTrackerToQuests = syncTrackerToQuests;

    function assignEntityToNode(entityId, nodeIdVal, isProto, explicitType = null) {
      let targetType = explicitType || (typeof CurrentEntityTab !== 'undefined' ? CurrentEntityTab : 'item');
      let activeList = getActiveEntityList(targetType);
      let entity = activeList.find(e => e.id === entityId || e.prototypeId === entityId);

      if (!entity && !explicitType) {
        for (const fallbackType of ['item', 'industry', 'resource', 'npc', 'quest', 'creature', 'tracker', 'faction']) {
          if (fallbackType === targetType) continue;
          const candList = getActiveEntityList(fallbackType);
          const found = candList.find(e => e.id === entityId || e.prototypeId === entityId);
          if (found) {
            targetType = fallbackType;
            activeList = candList;
            entity = found;
            break;
          }
        }
      }

      if (!entity && isProto) {
        // Auto-promote when assigning a prototype
        promotePrototypeToCampaign(entityId, targetType);
        activeList = getActiveEntityList(targetType);
        entity = activeList.find(e => e.id === entityId || e.prototypeId === entityId) || activeList[activeList.length - 1];
      }

      if (entity) {
        const parsedNodeId = nodeIdVal ? ((isNaN(nodeIdVal) || String(nodeIdVal).includes('-')) ? nodeIdVal : parseInt(nodeIdVal)) : null;
        entity.nodeId = parsedNodeId;
        if (entity.stationing) {
          entity.stationing.nodeId = parsedNodeId;
          if (parsedNodeId && (!entity.stationing.mode || entity.stationing.mode === 'unassigned')) {
            entity.stationing.mode = 'lair';
          }
        } else if (targetType === 'creature') {
          entity.stationing = { mode: parsedNodeId ? 'lair' : 'unassigned', nodeId: parsedNodeId };
        }
        saveActiveCampaign();
        renderCanvas();
        updatePropertiesGrid();
        renderEntityManagerTree();
        renderEntityManagerList();
        const nodeDisplay = (typeof window.formatNodeRef === 'function') ? window.formatNodeRef(nodeIdVal) : (nodeIdVal ? `Node ${nodeIdVal}` : 'Unassigned');
        setStatusBarMessage(`Stationed ${entity.name || entity.title} to ${nodeDisplay}.`);
      }
    }

    function removeEntityFromCampaign(entityId) {
      if (typeof promptEntityDelete === 'function') {
        promptEntityDelete(CurrentEntityTab, entityId);
        return;
      }
      // No confirmation dialog loaded: still delete through the engine so every reference is unlinked the same way
      const topo = Workstation.activeTopology;
      const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);
      const effectiveType = (CurrentEntityTab === 'resource' || CurrentEntityTab === 'industry') ? 'item' : CurrentEntityTab;
      if (cme && typeof cme.deleteEntity === 'function' && ['npc', 'quest', 'item', 'creature', 'tracker', 'faction'].includes(effectiveType)) {
        cme.deleteEntity(topo, effectiveType, entityId, { allowMissingEntity: true, maps: (typeof maps !== 'undefined' ? maps : undefined) });
      }

      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      renderEntityManagerTree();
      renderEntityManagerList();
      document.getElementById('em-detail-pane').innerHTML = '<div style="font-size:11px; color:#666; text-align:center; margin-top:40px;">Select an item to inspect, edit, or station to a node.</div>';
      setStatusBarMessage("Entity removed from active campaign.");
    }
    window.removeEntityFromCampaign = removeEntityFromCampaign;

    // ========================================================================
    // DEMOGRAPHICS, FACTION PRESENCE & PARTY RAPPORT HELPERS (ADR-0015 v2)
    // ========================================================================
    const PARTY_STANCE_LABELS = {
      '-2': 'Hostile',
      '-1': 'Unfriendly',
      '0': 'Neutral',
      '1': 'Friendly',
      '2': 'Allied'
    };

    function dedupeStringsCI(arr) {
      if (!Array.isArray(arr)) return [];
      const seen = new Set();
      const res = [];
      arr.forEach(item => {
        if (item && typeof item === 'string') {
          const trimmed = item.trim();
          const lower = trimmed.toLowerCase();
          if (trimmed && !seen.has(lower)) {
            seen.add(lower);
            res.push(trimmed);
          }
        }
      });
      return res;
    }

    function normalizeDemographics(raw) {
      if (!raw) {
        return { minorities: [], tags: [] };
      }
      if (Array.isArray(raw)) {
        return { minorities: [], tags: dedupeStringsCI(raw) };
      }
      if (typeof raw === 'object') {
        const res = {
          minorities: Array.isArray(raw.minorities) ? raw.minorities : [],
          tags: dedupeStringsCI(raw.tags || [])
        };
        if (raw.primary && typeof raw.primary === 'object') {
          res.primary = {
            name: String(raw.primary.name || ''),
            percentage: Number(raw.primary.percentage || 0)
          };
        }
        if (raw.social_friction_notes) {
          res.social_friction_notes = String(raw.social_friction_notes);
        }
        return res;
      }
      return { minorities: [], tags: [] };
    }

    function getDemographicNames(raw) {
      const norm = normalizeDemographics(raw);
      const names = [];
      if (norm.primary && norm.primary.name) names.push(norm.primary.name);
      if (Array.isArray(norm.minorities)) {
        norm.minorities.forEach(m => {
          if (m && m.name) names.push(m.name);
        });
      }
      if (Array.isArray(norm.tags)) {
        names.push(...norm.tags);
      }
      return dedupeStringsCI(names);
    }

    function normalizePartyRapport(raw) {
      if (!raw) {
        return { stance: 0, notes: '' };
      }
      if (typeof raw === 'string') {
        return { stance: 0, notes: raw };
      }
      if (typeof raw === 'object') {
        let s = parseInt(raw.stance, 10);
        if (isNaN(s)) s = 0;
        s = Math.max(-2, Math.min(2, s));
        const n = typeof raw.notes === 'string' ? raw.notes : '';
        return { stance: s, notes: n };
      }
      return { stance: 0, notes: '' };
    }

    function addDemographicTag(target, tag) {
      if (!target || !tag || typeof tag !== 'string') return;
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (typeof pushHistoryState === 'function') pushHistoryState(`Add Demographic Tag: ${trimmed}`);
      target.demographics = normalizeDemographics(target.demographics);
      if (!target.demographics.tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
        target.demographics.tags.push(trimmed);
      }
      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    }

    function removeDemographicTag(target, tag) {
      if (!target || !target.demographics) return;
      const tagStr = String(tag || '').trim();
      if (!tagStr) return;
      if (typeof pushHistoryState === 'function') pushHistoryState(`Remove Demographic Tag: ${tagStr}`);
      target.demographics = normalizeDemographics(target.demographics);
      target.demographics.tags = target.demographics.tags.filter(t => t.toLowerCase() !== tagStr.toLowerCase());
      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    }

    function addFactionPresence(target, faction) {
      if (!target || !faction || typeof faction !== 'string') return;
      const trimmed = faction.trim();
      if (!trimmed) return;
      if (typeof pushHistoryState === 'function') pushHistoryState(`Add Faction Presence: ${trimmed}`);
      if (!Array.isArray(target.factionPresence)) target.factionPresence = [];
      if (!target.factionPresence.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
        target.factionPresence.push(trimmed);
      }
      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    }

    function removeFactionPresence(target, faction) {
      if (!target || !Array.isArray(target.factionPresence)) return;
      const facStr = String(faction || '').trim();
      if (!facStr) return;
      if (typeof pushHistoryState === 'function') pushHistoryState(`Remove Faction Presence: ${facStr}`);
      target.factionPresence = target.factionPresence.filter(f => f.toLowerCase() !== facStr.toLowerCase());
      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    }

    function setPartyRapport(target, rapport) {
      if (!target) return;
      const norm = normalizePartyRapport(rapport);
      if (typeof pushHistoryState === 'function') pushHistoryState(`Update Party Rapport: ${PARTY_STANCE_LABELS[String(norm.stance)] || norm.stance}`);
      target.partyRapport = norm;
      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    }

    function getCampaignFactionSuggestions() {
      const pool = [];
      const allMaps = (typeof maps !== 'undefined' && maps) ? maps : {};
      const currentTopo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || {};

      Object.values(allMaps).forEach(m => {
        if (Array.isArray(m.nodes)) {
          m.nodes.forEach(n => {
            if (n.faction && typeof n.faction === 'string') pool.push(n.faction);
            if (Array.isArray(n.factionPresence)) pool.push(...n.factionPresence);
          });
        } else if (m.nodes && typeof m.nodes === 'object') {
          Object.values(m.nodes).forEach(n => {
            if (n.faction && typeof n.faction === 'string') pool.push(n.faction);
            if (Array.isArray(n.factionPresence)) pool.push(...n.factionPresence);
          });
        }
        if (m.edgeData && typeof m.edgeData === 'object') {
          Object.values(m.edgeData).forEach(e => {
            if (e.patrolFaction && typeof e.patrolFaction === 'string') pool.push(e.patrolFaction);
            if (Array.isArray(e.factionPresence)) pool.push(...e.factionPresence);
          });
        }
      });

      if (currentTopo.nodes) {
        const list = Array.isArray(currentTopo.nodes) ? currentTopo.nodes : Object.values(currentTopo.nodes);
        list.forEach(n => {
          if (n.faction && typeof n.faction === 'string') pool.push(n.faction);
          if (Array.isArray(n.factionPresence)) pool.push(...n.factionPresence);
        });
      }
      if (currentTopo.edgeData && typeof currentTopo.edgeData === 'object') {
        Object.values(currentTopo.edgeData).forEach(e => {
          if (e.patrolFaction && typeof e.patrolFaction === 'string') pool.push(e.patrolFaction);
          if (Array.isArray(e.factionPresence)) pool.push(...e.factionPresence);
        });
      }

      const activeFactions = (typeof campaignFactions !== 'undefined' && Array.isArray(campaignFactions))
        ? campaignFactions
        : ((typeof window !== 'undefined' && Array.isArray(window.campaignFactions)) ? window.campaignFactions : []);
      activeFactions.forEach(f => {
        if (f && f.name) pool.push(f.name);
      });

      if (currentTopo && Array.isArray(currentTopo.factions)) {
        currentTopo.factions.forEach(f => {
          if (f && f.name) pool.push(f.name);
        });
      }

      const filtered = pool.filter(f => f && typeof f === 'string' && f.trim().toLowerCase() !== 'neutral' && f.trim().toLowerCase() !== 'contested');
      return dedupeStringsCI(filtered);
    }

    function registerCampaignFaction(name) {
      if (!name || typeof name !== 'string') return;
      const trimmed = name.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (lower === 'neutral' || lower === 'contested') return;

      if (typeof campaignFactions === 'undefined' || !Array.isArray(campaignFactions)) {
        if (typeof window !== 'undefined') {
          window.campaignFactions = [];
        } else if (typeof global !== 'undefined') {
          global.campaignFactions = [];
        }
      }
      const list = (typeof campaignFactions !== 'undefined' && Array.isArray(campaignFactions))
        ? campaignFactions
        : ((typeof window !== 'undefined' && Array.isArray(window.campaignFactions)) ? window.campaignFactions : []);

      const factionId = 'fac_' + lower.replace(/[^a-z0-9]+/g, '_');

      if (!list.some(f => f && f.name && f.name.toLowerCase() === lower)) {
        list.push({
          id: factionId,
          name: trimmed,
          type: 'Power Group'
        });
      }

      // Also ensure synchronized onto Workstation.activeTopology.factions
      if (typeof Workstation !== 'undefined' && Workstation.activeTopology) {
        if (!Array.isArray(Workstation.activeTopology.factions)) {
          Workstation.activeTopology.factions = [];
        }
        if (!Workstation.activeTopology.factions.some(f => f && f.name && f.name.toLowerCase() === lower)) {
          Workstation.activeTopology.factions.push({
            id: factionId,
            name: trimmed,
            cvfQuadrant: 'Clan',
            colorIdentity: 'C',
            leaderNpcId: null,
            headquartersNodeId: null,
            controlledNodeIds: [],
            diplomaticStances: {},
            disposition: null,
            odv: null,
            description: `${trimmed} power group.`
          });
        }
      }
    }

    window.PARTY_STANCE_LABELS = PARTY_STANCE_LABELS;
    window.normalizeDemographics = normalizeDemographics;
    window.getDemographicNames = getDemographicNames;
    window.normalizePartyRapport = normalizePartyRapport;
    window.addDemographicTag = addDemographicTag;
    window.removeDemographicTag = removeDemographicTag;
    window.addFactionPresence = addFactionPresence;
    window.removeFactionPresence = removeFactionPresence;
    window.setPartyRapport = setPartyRapport;
    window.getCampaignFactionSuggestions = getCampaignFactionSuggestions;
    window.registerCampaignFaction = registerCampaignFaction;

    // ========================================================================
    // CROSS-CAMPAIGN ENTITY EXPLORER & ON-DEMAND SOURCE REGISTRY
    // ========================================================================
    const CrossCampaignService = {
      loadedSources: {},
      customRegisteredSources: {},

      /**
       * Discover all available campaign packages across bundled CAMPAIGN_REGISTRY,
       * IndexedDB / localStorage campaign_library, and session-registered sources.
       */
      discoverAvailableSources() {
        const results = [];
        const seenIds = new Set();
        const activeCampId = (typeof activeCampaignId !== 'undefined' && activeCampaignId)
          ? activeCampaignId
          : ((typeof localStorage !== 'undefined' ? localStorage.getItem("cs_active_campaign") : null) || (typeof Workstation !== 'undefined' && Workstation.activeTopology && Workstation.activeTopology.campaign_id) || "peridot");

        // 1. Bundled CAMPAIGN_REGISTRY
        if (typeof CAMPAIGN_REGISTRY !== 'undefined' && CAMPAIGN_REGISTRY) {
          Object.keys(CAMPAIGN_REGISTRY).forEach(cId => {
            const entry = CAMPAIGN_REGISTRY[cId];
            if (!entry) return;
            const regId = entry.id || cId;
            seenIds.add(String(regId));
            const isActive = String(regId) === String(activeCampId);
            const sum = entry.summary || null;
            const hasLoadedPreset = !Object.getOwnPropertyDescriptor(entry, 'preset')?.get && !!entry.preset;
            const metaName = (sum && sum.title) || (entry.metadata && entry.metadata.name) || entry.name || regId;
            let counts;
            if (sum && !hasLoadedPreset) {
              counts = {
                npcs: sum.npcCount || 0,
                quests: sum.questCount || 0,
                items: sum.itemCount || 0,
                creatures: sum.creatureCount || 0,
                trackers: sum.trackerCount || 0,
                factions: sum.factionCount || 0
              };
            } else {
              const p = entry.preset || (entry.campaign && (entry.campaign.topology || entry.campaign)) || entry.topology || entry;
              const ent = p.entities || entry.metadata?.entities || p;
              counts = {
                npcs: Array.isArray(ent.npcs) ? ent.npcs.length : (Array.isArray(p.npcs) ? p.npcs.length : 0),
                quests: Array.isArray(ent.quests) ? ent.quests.length : (Array.isArray(p.quests) ? p.quests.length : 0),
                items: Array.isArray(ent.items) ? ent.items.length : (Array.isArray(p.items) ? p.items.length : 0),
                creatures: Array.isArray(ent.creatures) ? ent.creatures.length : (Array.isArray(p.creatures) ? p.creatures.length : 0),
                trackers: Array.isArray(ent.trackers) ? ent.trackers.length : (Array.isArray(p.trackers) ? p.trackers.length : 0),
                factions: Array.isArray(ent.factions) ? ent.factions.length : (Array.isArray(p.factions) ? p.factions.length : 0)
              };
            }
            results.push({
              id: regId,
              name: metaName,
              sourceType: 'bundled',
              isLoaded: !!this.loadedSources[regId],
              isCurrentActive: isActive,
              counts: counts
            });
          });
        }

        // 2. Custom session-registered sources (from disk / file ingestion)
        Object.keys(this.customRegisteredSources).forEach(cId => {
          if (seenIds.has(String(cId))) return;
          seenIds.add(String(cId));
          const src = this.customRegisteredSources[cId];
          const isActive = String(cId) === String(activeCampId);
          results.push({
            id: cId,
            name: src.name || cId,
            sourceType: src.sourceType || 'custom_file',
            isLoaded: !!this.loadedSources[cId],
            isCurrentActive: isActive,
            counts: src.counts || { npcs: (src.npcs || []).length, quests: (src.quests || []).length, items: (src.items || []).length, creatures: (src.creatures || []).length, trackers: (src.trackers || []).length, factions: (src.factions || []).length }
          });
        });

        // 3. Saved IndexedDB / localStorage campaign_library index
        try {
          const listStr = (typeof localStorage !== 'undefined' ? localStorage.getItem("cs_campaign_library_index") : null) || "{}";
          const list = JSON.parse(listStr);
          Object.keys(list).forEach(cId => {
            if (seenIds.has(String(cId))) return;
            seenIds.add(String(cId));
            const item = list[cId];
            results.push({
              id: cId,
              name: item.name || cId,
              sourceType: 'indexeddb',
              isLoaded: !!this.loadedSources[cId],
              isCurrentActive: String(cId) === String(activeCampId),
              counts: { npcs: 0, quests: 0, items: 0, creatures: 0, trackers: 0, factions: 0 }
            });
          });
        } catch (e) {}

        return results;
      },

      /**
       * Normalizes a raw campaign object into a standardized staged entity pool.
       */
      extractAndNormalizeSource(sourceId, name, rawPkg, sourceType = 'bundled') {
        const pool = {
          id: sourceId,
          name: name || sourceId,
          sourceType: sourceType,
          npcs: [],
          quests: [],
          items: [],
          creatures: [],
          trackers: [],
          factions: [],
          nodeNames: {}
        };

        if (!rawPkg) return pool;

        // 1. Build nodeNames dictionary from maps / nodes
        const mapsDict = rawPkg.maps || (rawPkg.preset && rawPkg.preset.maps) || null;
        if (mapsDict && typeof mapsDict === 'object') {
          Object.values(mapsDict).forEach(m => {
            if (!m) return;
            const nodesArr = Array.isArray(m.nodes) ? m.nodes : (m.nodes ? Object.values(m.nodes) : []);
            nodesArr.forEach(n => {
              if (n && n.id != null) {
                pool.nodeNames[String(n.id)] = n.name || `Node ${n.id}`;
              }
            });
          });
        }
        const topNodes = rawPkg.nodes
          || (rawPkg.preset && rawPkg.preset.nodes)
          || (rawPkg.activeTopology && rawPkg.activeTopology.nodes)
          || (rawPkg.campaign && (rawPkg.campaign.nodes || (rawPkg.campaign.topology && rawPkg.campaign.topology.nodes)))
          || (rawPkg.topology && rawPkg.topology.nodes)
          || null;
        if (topNodes) {
          const topArr = Array.isArray(topNodes) ? topNodes : Object.values(topNodes);
          topArr.forEach(n => {
            if (n && n.id != null && !pool.nodeNames[String(n.id)]) {
              pool.nodeNames[String(n.id)] = n.name || `Node ${n.id}`;
            }
          });
        }

        // 2. Discover raw entity arrays across possible package shapes
        const entRoot = rawPkg.entities
          || (rawPkg.preset && (rawPkg.preset.entities || rawPkg.preset))
          || (rawPkg.activeTopology && (rawPkg.activeTopology.entities || rawPkg.activeTopology))
          || (rawPkg.campaign && rawPkg.campaign.topology && (rawPkg.campaign.topology.entities || rawPkg.campaign.topology))
          || (rawPkg.campaign && (rawPkg.campaign.entities || rawPkg.campaign))
          || (rawPkg.topology && (rawPkg.topology.entities || rawPkg.topology))
          || (rawPkg.activeTopology ? {
              npcs: rawPkg.activeTopology.npcs,
              quests: rawPkg.activeTopology.quests,
              items: rawPkg.activeTopology.items,
              creatures: rawPkg.activeTopology.creatures,
              trackers: rawPkg.activeTopology.trackers,
              factions: rawPkg.activeTopology.factions
            } : null)
          || (rawPkg.preset ? {
              npcs: rawPkg.preset.npcs,
              quests: rawPkg.preset.quests,
              items: rawPkg.preset.items,
              creatures: rawPkg.preset.creatures,
              trackers: rawPkg.preset.trackers,
              factions: rawPkg.preset.factions
            } : null)
          || rawPkg;

        const rawNpcs = Array.isArray(entRoot.npcs) ? entRoot.npcs : (Array.isArray(rawPkg.npcs) ? rawPkg.npcs : []);
        const rawQuests = Array.isArray(entRoot.quests) ? entRoot.quests : (Array.isArray(rawPkg.quests) ? rawPkg.quests : []);
        const rawItems = Array.isArray(entRoot.items) ? entRoot.items : (Array.isArray(rawPkg.items) ? rawPkg.items : []);
        const rawCreatures = Array.isArray(entRoot.creatures) ? entRoot.creatures : (Array.isArray(rawPkg.creatures) ? rawPkg.creatures : []);
        const rawTrackers = Array.isArray(entRoot.trackers) ? entRoot.trackers : (Array.isArray(rawPkg.trackers) ? rawPkg.trackers : []);
        const rawFactions = Array.isArray(entRoot.factions) ? entRoot.factions : (Array.isArray(rawPkg.factions) ? rawPkg.factions : []);

        const stampExternal = (e, cat) => {
          const origNode = (e.nodeId != null && e.nodeId !== '') ? e.nodeId : ((e.headquartersNodeId != null && e.headquartersNodeId !== '') ? e.headquartersNodeId : null);
          const origNodeName = origNode != null ? (pool.nodeNames[String(origNode)] || `Node ${origNode}`) : null;
          const clone = JSON.parse(JSON.stringify(e));
          clone._isExternal = true;
          clone._sourceCampaignId = sourceId;
          clone._sourceCampaignName = pool.name;
          clone._externalKey = `ext::${sourceId}::${String(clone.id)}`;
          clone._originalNodeId = origNode;
          clone._originalNodeName = origNodeName;
          clone.nodeId = null;
          if (clone.headquartersNodeId != null) clone.headquartersNodeId = null;
          if (cat === 'quest') {
            if (!clone.name && clone.title) clone.name = clone.title;
            if (!clone.title && clone.name) clone.title = clone.name;
            if (!Array.isArray(clone.npcIds)) clone.npcIds = [];
            if (clone.giverNpcId && !clone.npcIds.includes(clone.giverNpcId)) clone.npcIds.push(clone.giverNpcId);
            if (clone.targetNpcId && !clone.npcIds.includes(clone.targetNpcId)) clone.npcIds.push(clone.targetNpcId);
            if (Array.isArray(clone.steps)) {
              clone.steps.forEach(st => {
                if (st) {
                  if (st.completed === undefined && st.isCompleted !== undefined) st.completed = !!st.isCompleted;
                  if (st.isCompleted === undefined && st.completed !== undefined) st.isCompleted = !!st.completed;
                }
              });
            }
          }
          return clone;
        };

        pool.npcs = rawNpcs.map(e => stampExternal(e, 'npc'));
        pool.quests = rawQuests.map(e => stampExternal(e, 'quest'));
        pool.items = rawItems.map(e => stampExternal(e, 'item'));
        pool.creatures = rawCreatures.map(e => stampExternal(e, 'creature'));
        pool.trackers = rawTrackers.map(e => stampExternal(e, 'tracker'));
        pool.factions = rawFactions.map(e => stampExternal(e, 'faction'));

        return pool;
      },

      /**
       * Toggle loading/unloading of an external source on demand.
       */
      async toggleSource(sourceId, forceState) {
        const isLoaded = !!this.loadedSources[sourceId];
        const targetState = forceState !== undefined ? !!forceState : !isLoaded;

        if (!targetState) {
          delete this.loadedSources[sourceId];
          return false;
        }

        // 1. Check customRegisteredSources
        if (this.customRegisteredSources[sourceId]) {
          const custom = this.customRegisteredSources[sourceId];
          this.loadedSources[sourceId] = this.extractAndNormalizeSource(sourceId, custom.name, custom.rawPkg || custom, custom.sourceType || 'custom_file');
          return true;
        }

        // 2. Check bundled CAMPAIGN_REGISTRY
        if (typeof CAMPAIGN_REGISTRY !== 'undefined' && CAMPAIGN_REGISTRY[sourceId]) {
          if (typeof ensureCampaignBundleLoaded === 'function') {
            await ensureCampaignBundleLoaded(sourceId);
          }
          const entry = CAMPAIGN_REGISTRY[sourceId];
          const rawPkg = entry.preset || (entry.campaign && (entry.campaign.topology || entry.campaign)) || entry.topology || entry;
          const metaName = (entry.summary && entry.summary.title) || (entry.metadata && entry.metadata.name) || entry.name || sourceId;
          this.loadedSources[sourceId] = this.extractAndNormalizeSource(sourceId, metaName, rawPkg, 'bundled');
          return true;
        }

        // 3. Check IndexedDB campaign_library
        if (typeof getCampaignsFromIndexedDBLibrary === 'function') {
          try {
            const list = await getCampaignsFromIndexedDBLibrary();
            const hit = list.find(c => c && String(c.id) === String(sourceId));
            if (hit) {
              const name = hit.name || hit.campaignName || sourceId;
              this.loadedSources[sourceId] = this.extractAndNormalizeSource(sourceId, name, hit, 'indexeddb');
              return true;
            }
          } catch (e) {
            console.warn("[CrossCampaignService] Error loading from IndexedDB:", e);
          }
        }

        return false;
      },

      /**
       * Check if an external source is currently staged / loaded.
       */
      isSourceLoaded(sourceId) {
        return !!this.loadedSources[sourceId];
      },

      /**
       * Unload all currently staged external sources.
       */
      unloadAllSources() {
        this.loadedSources = {};
      },

      /**
       * Get array of all currently loaded source descriptors.
       */
      getLoadedSourcesList() {
        return Object.values(this.loadedSources).map(s => ({
          id: s.id,
          name: s.name,
          sourceType: s.sourceType,
          counts: {
            npcs: s.npcs.length,
            quests: s.quests.length,
            items: s.items.filter(i => !isResourceItem(i) && !isIndustryItem(i)).length,
            industries: s.items.filter(i => !isResourceItem(i) && isIndustryItem(i)).length,
            resources: s.items.filter(i => isResourceItem(i)).length,
            creatures: s.creatures.length,
            trackers: s.trackers.length,
            factions: s.factions.length
          }
        }));
      },

      /**
       * Retrieve external entities for a given type, optionally scoped to a single source.
       */
      getExternalEntities(type, filterSourceId = null) {
        const normType = (type || 'npc').toLowerCase();
        let result = [];
        const sources = filterSourceId
          ? (this.loadedSources[filterSourceId] ? [this.loadedSources[filterSourceId]] : [])
          : Object.values(this.loadedSources);

        sources.forEach(src => {
          if (normType === 'npc') result.push(...src.npcs);
          else if (normType === 'quest') result.push(...src.quests);
          else if (normType === 'item') result.push(...src.items.filter(i => !isResourceItem(i) && !isIndustryItem(i)));
          else if (normType === 'industry') result.push(...src.items.filter(i => !isResourceItem(i) && isIndustryItem(i)));
          else if (normType === 'resource') result.push(...src.items.filter(i => isResourceItem(i)));
          else if (normType === 'creature') result.push(...src.creatures);
          else if (normType === 'tracker') result.push(...src.trackers);
          else if (normType === 'faction') result.push(...src.factions);
        });

        return result;
      },

      /**
       * Resolves an external entity by composite key ("ext::<sourceId>::<entityId>")
       * or by raw entityId across loaded sources.
       */
      resolveExternalEntity(externalKeyOrId, explicitType = null, optSourceId = null) {
        if (!externalKeyOrId) return null;
        const str = String(externalKeyOrId);

        let sourceId = optSourceId;
        let entityId = str;

        if (str.startsWith('ext::')) {
          const parts = str.split('::');
          sourceId = parts[1];
          entityId = parts.slice(2).join('::');
        }

        const candidateSources = sourceId && this.loadedSources[sourceId]
          ? [this.loadedSources[sourceId]]
          : Object.values(this.loadedSources);

        const cats = explicitType
          ? [(explicitType === 'resource' || explicitType === 'industry' || explicitType === 'item') ? 'items' : explicitType + 's']
          : ['npcs', 'quests', 'items', 'creatures', 'trackers', 'factions'];

        for (const src of candidateSources) {
          for (const cat of cats) {
            const list = src[cat] || [];
            const found = list.find(e => String(e.id) === String(entityId) || String(e._externalKey) === str);
            if (found) {
              const detectedType = explicitType || (cat === 'npcs' ? 'npc' : (cat === 'quests' ? 'quest' : (cat === 'items' ? (isResourceItem(found) ? 'resource' : (isIndustryItem(found) ? 'industry' : 'item')) : (cat === 'creatures' ? 'creature' : (cat === 'trackers' ? 'tracker' : (cat === 'factions' ? 'faction' : 'npc'))))));
              return {
                entity: found,
                sourcePool: src,
                sourceId: src.id,
                sourceName: src.name,
                type: detectedType
              };
            }
          }
        }

        return null;
      },

      /**
       * Prompt author to load a local campaign JSON file (.json, .creator.json, preset.json)
       */
      promptLoadExternalCampaignFile() {
        let input = document.getElementById("cs-external-file-input");
        if (!input) {
          input = document.createElement("input");
          input.type = "file";
          input.id = "cs-external-file-input";
          input.accept = ".json,.creator.json";
          input.style.display = "none";
          document.body.appendChild(input);
        }
        input.onchange = async (ev) => {
          const file = ev.target.files && ev.target.files[0];
          if (!file) return;
          try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const baseName = file.name.replace(/\.(creator\.)?json$/i, '');
            const campId = parsed.id || parsed.campaign_id || baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            const campName = parsed.name || parsed.campaignName || baseName;

            this.customRegisteredSources[campId] = {
              id: campId,
              name: campName,
              sourceType: 'custom_file',
              rawPkg: parsed
            };
            await this.toggleSource(campId, true);

            if (typeof renderEntityManagerTree === 'function') renderEntityManagerTree();
            if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
            if (typeof renderEntitySourcesPopover === 'function') renderEntitySourcesPopover();
            if (typeof setStatusBarMessage === 'function') {
              setStatusBarMessage(`Loaded external campaign library: "${campName}" from file.`);
            }
          } catch (err) {
            alert(`Failed to load external campaign JSON: ${err.message}`);
          } finally {
            input.value = "";
          }
        };
        input.click();
      },

      /**
       * Prompt author to load an external campaign folder from disk via showDirectoryPicker()
       */
      async promptLoadExternalCampaignFolder() {
        if (!window.showDirectoryPicker) {
          alert("Folder selection is supported in Chromium browsers. Please use '+ Load JSON...' instead.");
          this.promptLoadExternalCampaignFile();
          return;
        }
        try {
          const dirHandle = await window.showDirectoryPicker({ mode: "read" });
          if (!dirHandle) return;

          let campName = dirHandle.name;
          let parsedPkg = {
            id: dirHandle.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
            name: campName,
            entities: { npcs: [], quests: [], items: [], creatures: [], trackers: [], factions: [] },
            maps: {},
            nodes: {}
          };

          // Try campaign.json
          try {
            const cFile = await dirHandle.getFileHandle("campaign.json");
            const cText = await (await cFile.getFile()).text();
            const cJson = JSON.parse(cText);
            if (cJson.name) parsedPkg.name = cJson.name;
            if (cJson.id) parsedPkg.id = cJson.id;
            if (cJson.entities) parsedPkg.entities = cJson.entities;
          } catch (e) {}

          // Try preset.json or topology.json
          try {
            const pFile = await dirHandle.getFileHandle("preset.json");
            const pJson = JSON.parse(await (await pFile.getFile()).text());
            if (pJson.name && !parsedPkg.name) parsedPkg.name = pJson.name;
            if (pJson.entities) {
              Object.keys(pJson.entities).forEach(k => {
                if (Array.isArray(pJson.entities[k]) && (!parsedPkg.entities[k] || parsedPkg.entities[k].length === 0)) {
                  parsedPkg.entities[k] = pJson.entities[k];
                }
              });
            }
            if (pJson.maps) parsedPkg.maps = pJson.maps;
            if (pJson.nodes) parsedPkg.nodes = pJson.nodes;
          } catch (e1) {
            try {
              const tFile = await dirHandle.getFileHandle("topology.json");
              const tJson = JSON.parse(await (await tFile.getFile()).text());
              if (tJson.entities) {
                Object.keys(tJson.entities).forEach(k => {
                  if (Array.isArray(tJson.entities[k]) && (!parsedPkg.entities[k] || parsedPkg.entities[k].length === 0)) {
                    parsedPkg.entities[k] = tJson.entities[k];
                  }
                });
              }
              if (tJson.maps) parsedPkg.maps = tJson.maps;
              if (tJson.nodes) parsedPkg.nodes = tJson.nodes;
            } catch (e2) {}
          }

          this.customRegisteredSources[parsedPkg.id] = {
            id: parsedPkg.id,
            name: parsedPkg.name,
            sourceType: 'folder',
            rawPkg: parsedPkg
          };
          await this.toggleSource(parsedPkg.id, true);

          if (typeof renderEntityManagerTree === 'function') renderEntityManagerTree();
          if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
          if (typeof renderEntitySourcesPopover === 'function') renderEntitySourcesPopover();
          if (typeof setStatusBarMessage === 'function') {
            setStatusBarMessage(`Loaded external campaign library: "${parsedPkg.name}" from folder.`);
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            alert(`Failed to load campaign folder: ${err.message}`);
          }
        }
      }
    };

    window.CrossCampaignService = CrossCampaignService;
