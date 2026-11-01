    // ========================================================================
    // UNIVERSAL CAMPAIGN ENTITY MANAGER - CORE (STATE, DISSONANCE & PROTOTYPES)
    // ========================================================================
    let CurrentEntityTab = 'npc';
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

    function computeNpcNodeDissonance(npc, node) {
      if (!npc || !node) return null;
      const nOdv = node.odv || { s: 2, e: 2, c: 2 };
      const nS = typeof nOdv.s === 'number' ? nOdv.s : 2;
      const nE = typeof nOdv.e === 'number' ? nOdv.e : 2;
      const nC = typeof nOdv.c === 'number' ? nOdv.c : 2;

      const npcOdv = npc.odv;
      const hasNpcOdv = npcOdv && typeof npcOdv.s === 'number';

      if (!hasNpcOdv && !npc.culture) {
        return {
          deltaD: 0,
          level: 'Harmonious',
          badgeClass: 'entity-badge-tag',
          style: 'background:#f1f5f9; color:#475569;',
          summary: 'Universal (Conforms to Local Norms)',
          warning: null
        };
      }

      let deltaD = 0;
      if (hasNpcOdv) {
        deltaD = Math.abs(nS - (npcOdv.s || 2)) + Math.abs(nE - (npcOdv.e || 2)) + Math.abs(nC - (npcOdv.c || 2));
      }

      const cultureMismatch = !!(npc.culture && node.culture && npc.culture !== node.culture);

      if (deltaD >= 4 || (cultureMismatch && deltaD >= 3)) {
        return {
          deltaD,
          level: 'Severe Clash',
          badgeClass: 'entity-badge-tag',
          style: 'background:#fee2e2; color:#b91c1c; border:1px solid #ef4444; font-weight:bold;',
          summary: `Severe Clash (ΔD=${deltaD}): ${npc.culture || 'Individual'} vs Node ${node.culture || 'Culture'}`,
          warning: `Ideological friction with host settlement! Character is vulnerable to local betrayal, mutiny, or political ostracism.`
        };
      } else if (deltaD >= 2 || cultureMismatch) {
        return {
          deltaD,
          level: 'Moderate Tension',
          badgeClass: 'entity-badge-tag',
          style: 'background:#fef3c7; color:#92400e; border:1px solid #f59e0b;',
          summary: `Moderate Tension (ΔD=${deltaD}): ${npc.culture || 'Individual'} vs Node ${node.culture || 'Culture'}`,
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
        promotePrototypeToCampaign(npcId);
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
        promotePrototypeToCampaign(npcId);
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
        promotePrototypeToCampaign(itemId);
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

    function promptAddNpcRelationship(sourceNpcId) {
      const topo = Workstation.activeTopology;
      const activeList = getActiveEntityList('npc');
      let sourceNpc = activeList.find(n => n.id === sourceNpcId || n.prototypeId === sourceNpcId);
      if (!sourceNpc) {
        promotePrototypeToCampaign(sourceNpcId);
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
      const relType = prompt(`Enter relationship type (Ally, Rival, Superior, Subordinate, Debtor, Creditor, Kin, Blackmailer):`, 'Rival');
      if (!relType) return;
      const relNotes = prompt(`Enter context notes between ${sourceNpc.name} and ${targetNpc.name}:`, '');

      if (!Array.isArray(sourceNpc.relationships)) sourceNpc.relationships = [];
      sourceNpc.relationships.push({
        targetNpcId: targetNpc.id,
        type: relType,
        notes: relNotes || ''
      });

      saveActiveCampaign();
      renderEntityManagerList();
      selectEntityItem(sourceNpc.id, false);
      setStatusBarMessage(`Added relationship: ${sourceNpc.name} -> ${relType} -> ${targetNpc.name}.`);
    }
    window.promptAddNpcRelationship = promptAddNpcRelationship;

    function removeNpcRelationship(sourceNpcId, targetNpcId) {
      const topo = Workstation.activeTopology;
      const sourceNpc = (topo.npcs || []).find(n => n.id === sourceNpcId);
      if (!sourceNpc || !Array.isArray(sourceNpc.relationships)) return;
      sourceNpc.relationships = sourceNpc.relationships.filter(r => r.targetNpcId !== targetNpcId);
      saveActiveCampaign();
      renderEntityManagerList();
      selectEntityItem(sourceNpc.id, false);
      setStatusBarMessage("Relationship removed.");
    }
    window.removeNpcRelationship = removeNpcRelationship;


    // --- Entity Collection & Prototype Seeding ---
    function getPrototypesForType(type) {
      let result = [];
      const seeds = MODULE_ENTITY_PROTOTYPES[type === 'npc' ? 'npcs' : (type === 'quest' ? 'quests' : (type === 'item' ? 'items' : (type === 'tracker' ? 'trackers' : '')))] || [];
      result.push(...seeds);

      if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
        ALL_MODULES.forEach(m => {
          if (type === 'npc' || type === 'quest' || type === 'item') {
            const list = type === 'npc' ? m.extracted_npcs : (type === 'quest' ? m.extracted_quests : m.extracted_items);
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


    function getActiveEntityList(type) {
      const topo = Workstation.activeTopology;
      if (type === 'npc') return topo.npcs || [];
      if (type === 'quest') return topo.quests || [];
      if (type === 'item') return topo.items || [];
      if (type === 'tracker') return topo.trackers || [];
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


    // --- Tracker Clocks & Stationing Helpers ---
    function advanceTrackerTick(trackerId, delta) {
      const activeList = getActiveEntityList('tracker');
      let trk = activeList.find(t => t.id === trackerId || t.prototypeId === trackerId);

      if (!trk) {
        // Auto-promote if prototype
        promotePrototypeToCampaign(trackerId);
        trk = activeList[activeList.length - 1];
      }

      if (trk) {
        const maxTicks = trk.maxTicks || 6;
        if (delta === -999) {
          trk.currentTicks = 0;
        } else {
          trk.currentTicks = Math.max(0, Math.min(maxTicks, (trk.currentTicks || 0) + delta));
        }

        saveActiveCampaign();
        renderCanvas();
        updatePropertiesGrid();
        renderEntityManagerList();
        selectEntityItem(trk.id, false);
        setStatusBarMessage(`Threat Clock "${trk.name}" set to ${trk.currentTicks}/${maxTicks} ticks.`);
      }
    }

    function resetTrackerTicks(trackerId) {
      advanceTrackerTick(trackerId, -999);
    }

    function toggleTrackerCanvasVisibility(trackerId, isVisible, isPrototype) {
      const activeList = getActiveEntityList('tracker');
      let trk = activeList.find(t => t.id === trackerId || t.prototypeId === trackerId);
      if (!trk && isPrototype) {
        promotePrototypeToCampaign(trackerId);
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
        promotePrototypeToCampaign(trackerId);
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

    function centerOnNode(nodeId) {
      const topo = Workstation.activeTopology;
      let node = topo && topo.nodes ? topo.nodes[nodeId.toString()] : null;

      // If node is not on active map, find which map owns it and switch to it!
      if (!node && typeof maps !== "undefined") {
        for (const mId of Object.keys(maps)) {
          const m = maps[mId];
          const found = Array.isArray(m.nodes)
            ? (m.nodes || []).find(n => String(n.id) === String(nodeId))
            : (m.nodes && m.nodes[nodeId.toString()]);
          if (found) {
            switchActiveMap(mId);
            setTimeout(() => {
              centerOnNode(nodeId);
            }, 60);
            return;
          }
        }
      }

      if (!node) return;

      selectNode(nodeId);
      const container = document.getElementById('canvas-container');
      if (container) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        Workstation.pan.x = (cw / 2) - (node.x * Workstation.zoom);
        Workstation.pan.y = (ch / 2) - (node.y * Workstation.zoom);
        applyCanvasTransform();
      }
      setStatusBarMessage(`Centered viewport on Node ${nodeId}: "${node.name}".`);
    }

    function promotePrototypeToCampaign(protoId) {
      const protoList = getPrototypesForType(CurrentEntityTab);
      const proto = protoList.find(p => p.id === protoId);
      if (!proto) return;

      const activeList = getActiveEntityList(CurrentEntityTab);
      const newEntity = {
        ...proto,
        id: `${CurrentEntityTab}-${Date.now().toString().slice(-6)}`,
        prototypeId: proto.id,
        nodeId: proto.suggestedNode || null,
        status: 'Active',
        isCustom: false
      };
      if (CurrentEntityTab === 'tracker') {
        newEntity.currentTicks = proto.currentTicks || 0;
        newEntity.maxTicks = proto.maxTicks || 6;
      }

      activeList.push(newEntity);
      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      renderEntityManagerTree();
      selectEntityItem(newEntity.id, false);
      setStatusBarMessage(`Added ${newEntity.name || newEntity.title} to active campaign.`);
    }

    function assignEntityToNode(entityId, nodeIdVal, isProto) {
      const activeList = getActiveEntityList(CurrentEntityTab);
      let entity = activeList.find(e => e.id === entityId || e.prototypeId === entityId);

      if (!entity && isProto) {
        // Auto-promote when assigning a prototype
        promotePrototypeToCampaign(entityId);
        entity = activeList[activeList.length - 1];
      }

      if (entity) {
        entity.nodeId = nodeIdVal ? ((isNaN(nodeIdVal) || String(nodeIdVal).includes('-')) ? nodeIdVal : parseInt(nodeIdVal)) : null;
        saveActiveCampaign();
        renderCanvas();
        updatePropertiesGrid();
        renderEntityManagerTree();
        renderEntityManagerList();
        setStatusBarMessage(`Stationed ${entity.name || entity.title} to Node ${nodeIdVal || 'Unassigned'}.`);
      }
    }

    function removeEntityFromCampaign(entityId) {
      if (typeof promptEntityDelete === 'function') {
        promptEntityDelete(CurrentEntityTab, entityId);
        return;
      }
      const topo = Workstation.activeTopology;
      if (CurrentEntityTab === 'npc' && topo.npcs) {
        topo.npcs = topo.npcs.filter(n => n.id !== entityId);
      } else if (CurrentEntityTab === 'quest' && topo.quests) {
        topo.quests = topo.quests.filter(q => q.id !== entityId);
      } else if (CurrentEntityTab === 'item' && topo.items) {
        topo.items = topo.items.filter(i => i.id !== entityId);
      } else if (CurrentEntityTab === 'tracker' && topo.trackers) {
        topo.trackers = topo.trackers.filter(t => t.id !== entityId);
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

      if (!list.some(f => f && f.name && f.name.toLowerCase() === lower)) {
        list.push({
          id: 'fac_' + lower.replace(/[^a-z0-9]+/g, '_'),
          name: trimmed,
          type: 'Power Group'
        });
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
