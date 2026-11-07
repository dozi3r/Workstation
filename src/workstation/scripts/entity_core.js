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

    function isResourceItem(item) {
      if (!item) return false;
      return Boolean(
        item.isResource === true ||
        item.category === 'Resource Export / Supply Anchor' ||
        /^(Resource|Commodity)\s*:/i.test(item.category || '') ||
        (item.tags && Array.isArray(item.tags) && item.tags.some(t => /^(resource|commodity)$/i.test(t)))
      );
    }
    window.isResourceItem = isResourceItem;

    function getCreatureEffectiveNodeId(creature) {
      if (!creature) return null;
      return (creature.stationing && creature.stationing.nodeId != null) ? creature.stationing.nodeId : (creature.nodeId != null ? creature.nodeId : null);
    }
    window.getCreatureEffectiveNodeId = getCreatureEffectiveNodeId;

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
        : ((type === 'item' || type === 'resource') ? 'items'
        : (type === 'creature' ? 'creatures'
        : (type === 'tracker' ? 'trackers'
        : (type === 'faction' ? 'factions' : '')))));
      const protoBag = (typeof MODULE_ENTITY_PROTOTYPES !== 'undefined' && MODULE_ENTITY_PROTOTYPES) ? MODULE_ENTITY_PROTOTYPES : {};
      const rawSeeds = protoBag[seedsKey] || [];
      const seeds = (type === 'resource')
        ? rawSeeds.filter(i => isResourceItem(i))
        : ((type === 'item') ? rawSeeds.filter(i => !isResourceItem(i)) : rawSeeds);
      result.push(...seeds);

      if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
        ALL_MODULES.forEach(m => {
          if (type === 'npc' || type === 'quest' || type === 'item' || type === 'resource') {
            const rawList = type === 'npc' ? m.extracted_npcs : (type === 'quest' ? m.extracted_quests : m.extracted_items);
            const list = (type === 'resource')
              ? (Array.isArray(rawList) ? rawList.filter(i => isResourceItem(i)) : [])
              : ((type === 'item') ? (Array.isArray(rawList) ? rawList.filter(i => !isResourceItem(i)) : []) : rawList);
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
      if (type === 'item' || type === 'resource') {
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
        return (topo.items || []).filter(i => !isResourceItem(i));
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
        if (!newEntity.category) newEntity.category = 'Resource Export / Supply Anchor';
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

    function assignEntityToNode(entityId, nodeIdVal, isProto) {
      let activeList = getActiveEntityList(CurrentEntityTab);
      let entity = activeList.find(e => e.id === entityId || e.prototypeId === entityId);

      if (!entity && isProto) {
        // Auto-promote when assigning a prototype
        promotePrototypeToCampaign(entityId, CurrentEntityTab);
        activeList = getActiveEntityList(CurrentEntityTab);
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
        } else if (CurrentEntityTab === 'creature') {
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
      const effectiveType = CurrentEntityTab === 'resource' ? 'item' : CurrentEntityTab;
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
            disposition: [2, 2, 2],
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
