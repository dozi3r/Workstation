    // ========================================================================
    // UNIVERSAL CAMPAIGN ENTITY MANAGER - CRUD DIALOGS & QUEST SPANNING
    // ========================================================================
    /**
     * Computes the complete structural footprint of a quest, including its anchor node,
     * the nodes housing linked NPCs, and the nodes housing linked items.
     */
    function getQuestSpanningNodes(quest) {
      if (!quest) return [];
      const topo = Workstation.activeTopology || {};
      const allMaps = (typeof maps !== "undefined" && maps) ? maps : {};
      const campaignNpcs = topo.npcs || [];
      const campaignItems = topo.items || [];
      const campaignTrackers = topo.trackers || [];

      const nodeMap = new Map();

      function resolveNodeInfo(nodeId) {
        const nStr = String(nodeId);
        let nObj = topo.nodes && (topo.nodes[nStr] || topo.nodes[nodeId]);
        let mapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        let mapName = (topo && topo.name) || "Active Map";

        if (!nObj) {
          for (const mId of Object.keys(allMaps)) {
            const mNodes = allMaps[mId].nodes || [];
            const found = Array.isArray(mNodes)
              ? mNodes.find(n => String(n.id) === nStr)
              : (mNodes[nStr] || mNodes[nodeId]);
            if (found) {
              nObj = found;
              mapId = mId;
              mapName = allMaps[mId].name || mId;
              break;
            }
          }
        }
        return {
          nodeId: nodeId,
          nodeName: nObj ? (nObj.name || `Node ${nodeId}`) : `Node ${nodeId}`,
          mapId: mapId,
          mapName: mapName
        };
      }

      // 1. Anchor node
      if (quest.nodeId != null && quest.nodeId !== '') {
        const info = resolveNodeInfo(quest.nodeId);
        nodeMap.set(String(quest.nodeId), {
          ...info,
          role: 'Main Quest Anchor',
          reasons: ['Origin / Anchor Node']
        });
      }

      // 2. Linked NPCs
      (quest.npcIds || []).forEach(nId => {
        const npc = campaignNpcs.find(n => n.id === nId);
        if (npc && npc.nodeId != null && npc.nodeId !== '') {
          const key = String(npc.nodeId);
          if (nodeMap.has(key)) {
            nodeMap.get(key).reasons.push(`NPC: ${npc.name} (${npc.role || 'Resident'})`);
          } else {
            const info = resolveNodeInfo(npc.nodeId);
            nodeMap.set(key, {
              ...info,
              role: 'NPC Location',
              reasons: [`NPC: ${npc.name} (${npc.role || 'Resident'})`]
            });
          }
        }
      });

      // 3. Linked Items
      (quest.itemIds || []).forEach(iId => {
        const item = campaignItems.find(i => i.id === iId);
        const effNode = getItemEffectiveNodeId(item);
        if (item && effNode != null && effNode !== '') {
          const key = String(effNode);
          if (nodeMap.has(key)) {
            nodeMap.get(key).reasons.push(`Item: ${item.name} [${item.category || 'Gear'}]`);
          } else {
            const info = resolveNodeInfo(effNode);
            nodeMap.set(key, {
              ...info,
              role: 'Item Location',
              reasons: [`Item: ${item.name} [${item.category || 'Gear'}]`]
            });
          }
        }
      });

      // 4. Linked Threat Clocks & Trackers (explicit quest.trackerIds, step triggerTrackerId, or tracker.triggerRefs)
      const linkedTrackerSet = new Set(quest.trackerIds || []);
      (quest.steps || []).forEach(s => { if (s && s.triggerTrackerId) linkedTrackerSet.add(s.triggerTrackerId); });
      campaignTrackers.forEach(t => {
        if (Array.isArray(t.triggerRefs) && t.triggerRefs.some(r => r.entityType === 'quest' && String(r.entityId) === String(quest.id))) {
          linkedTrackerSet.add(t.id);
        }
      });
      linkedTrackerSet.forEach(tId => {
        const trk = campaignTrackers.find(t => t.id === tId);
        if (trk && trk.nodeId != null && trk.nodeId !== '') {
          const key = String(trk.nodeId);
          if (nodeMap.has(key)) {
            nodeMap.get(key).reasons.push(`Clock: ${trk.name} (${trk.currentTicks || 0}/${trk.maxTicks || 6})`);
          } else {
            const info = resolveNodeInfo(trk.nodeId);
            nodeMap.set(key, {
              ...info,
              role: 'Threat Clock Location',
              reasons: [`Clock: ${trk.name} (${trk.currentTicks || 0}/${trk.maxTicks || 6})`]
            });
          }
        }
      });

      return Array.from(nodeMap.values());
    }
    window.getQuestSpanningNodes = getQuestSpanningNodes;

    // Recalculates live spanning nodes readout inside the entity edit modal
    function updateQuestSpanningPreview() {
      const nodeSel = document.getElementById('ee-node-select');
      const mainNodeId = nodeSel ? nodeSel.value : null;
      const topo = Workstation.activeTopology || {};
      const allNpcs = topo.npcs || [];
      const allItems = topo.items || [];
      const allTrackers = topo.trackers || [];

      const checkedNpcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
      const checkedItemIds = Array.from(document.querySelectorAll('.ee-quest-item-cb:checked')).map(cb => cb.value);
      const checkedTrackerIds = Array.from(document.querySelectorAll('.ee-quest-tracker-cb:checked')).map(cb => cb.value);

      const previewBox = document.getElementById('ee-quest-spanning-nodes-text');
      if (!previewBox) return;

      const entries = [];
      if (mainNodeId) {
        const nodeObj = topo.nodes && (topo.nodes[mainNodeId] || topo.nodes[String(mainNodeId)]);
        entries.push(`<strong>Anchor:</strong> Node ${mainNodeId}${nodeObj ? ' (' + nodeObj.name + ')' : ''}`);
      }

      checkedNpcIds.forEach(nId => {
        const npc = allNpcs.find(n => n.id === nId);
        if (npc) {
          entries.push(`<strong>NPC:</strong> ${npc.name} @ Node ${npc.nodeId != null ? npc.nodeId : 'Unassigned'}`);
        }
      });

      checkedItemIds.forEach(iId => {
        const item = allItems.find(i => i.id === iId);
        if (item) {
          entries.push(`<strong>Item:</strong> ${item.name} @ Node ${item.nodeId != null ? item.nodeId : 'Unassigned'}`);
        }
      });

      checkedTrackerIds.forEach(tId => {
        const trk = allTrackers.find(t => t.id === tId);
        if (trk) {
          entries.push(`<strong>Clock:</strong> ${trk.name} @ Node ${trk.nodeId != null ? trk.nodeId : 'Unassigned'}`);
        }
      });

      if (entries.length === 0) {
        previewBox.innerHTML = '<span style="color:#777; font-style:italic;">(Select an anchor node, NPCs, items, or clocks to calculate quest footprint)</span>';
      } else {
        const uniqueNodes = new Set();
        if (mainNodeId) uniqueNodes.add(String(mainNodeId));
        checkedNpcIds.forEach(nId => {
          const npc = allNpcs.find(n => n.id === nId);
          if (npc && npc.nodeId != null) uniqueNodes.add(String(npc.nodeId));
        });
        checkedItemIds.forEach(iId => {
          const item = allItems.find(i => i.id === iId);
          if (item && item.nodeId != null) uniqueNodes.add(String(item.nodeId));
        });
        checkedTrackerIds.forEach(tId => {
          const trk = allTrackers.find(t => t.id === tId);
          if (trk && trk.nodeId != null) uniqueNodes.add(String(trk.nodeId));
        });

        previewBox.innerHTML = `
          <div style="margin-bottom:3px;">${entries.join(' &bull; ')}</div>
          <div style="font-weight:bold; color:#0f766e;">Total Spanning Footprint: ${uniqueNodes.size} Node(s) [${Array.from(uniqueNodes).join(', ')}]</div>
        `;
      }
    }
    window.updateQuestSpanningPreview = updateQuestSpanningPreview;

    // Modal: Create / Edit Custom Entity
    function openNewEntityModal(type, preselectedNodeId) {
      if (type === 'node') {
        const topo = Workstation.activeTopology;
        const numericIds = Object.keys(topo.nodes || {}).map(k => parseInt(k, 10)).filter(n => !isNaN(n));
        const nextId = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1;
        const name = prompt(`Enter name for new Node ${nextId}:`, `Location ${nextId}`);
        if (!name) return;

        topo.nodes[nextId.toString()] = {
          id: nextId,
          name: name,
          wave: 3,
          x: 400 + Math.floor(Math.random() * 160 - 80),
          y: 300 + Math.floor(Math.random() * 160 - 80),
          eligible: true,
          adj: [],
          infBy: [],
          culture: 'Adhocracy',
          tier: 2,
          visible: true,
          locked: false,
          color: ''
        };

        saveActiveCampaign();
        renderCanvas();
        updatePropertiesGrid();
        renderEntityManagerTree();
        renderEntityManagerList();
        selectEntityItem(nextId, false);
        setStatusBarMessage(`Added Node ${nextId}: "${name}".`);
        return;
      }

      if (type === 'edge') {
        openCreateEdgeModal(preselectedNodeId);
        return;
      }

      const modal = document.getElementById('modal-entity-edit');
      document.getElementById('ee-modal-title').textContent = `Create New ${type.toUpperCase()}`;
      document.getElementById('ee-entity-id').value = '';
      document.getElementById('ee-entity-type').value = type;

      document.getElementById('ee-name').value = '';
      document.getElementById('ee-role').value = '';
      document.getElementById('ee-meta').value = '';
      document.getElementById('ee-notes').value = '';

      const questExt = document.getElementById('ee-quest-extensions');
      const npcExt = document.getElementById('ee-npc-extensions');
      const itemExt = document.getElementById('ee-item-extensions');
      const trackerExt = document.getElementById('ee-tracker-extensions');
      const factionExt = document.getElementById('ee-faction-extensions');
      const creatureExt = document.getElementById('ee-creature-extensions');
      const nodeLabel = document.getElementById('ee-node-label');

      if (npcExt) npcExt.style.display = (type === 'npc') ? 'flex' : 'none';
      if (itemExt) itemExt.style.display = (type === 'item') ? 'flex' : 'none';
      if (questExt) questExt.style.display = (type === 'quest') ? 'flex' : 'none';
      if (trackerExt) trackerExt.style.display = (type === 'tracker') ? 'flex' : 'none';
      if (factionExt) factionExt.style.display = (type === 'faction') ? 'flex' : 'none';
      if (creatureExt) creatureExt.style.display = (type === 'creature') ? 'flex' : 'none';

      if (type === 'npc') {
        document.getElementById('ee-role-label').textContent = 'Role / Profession:';
        document.getElementById('ee-meta-label').textContent = 'Faction / Affiliation:';
        document.getElementById('ee-notes-label').textContent = 'Motivation, Agenda & Personality:';
        if (nodeLabel) nodeLabel.textContent = 'Station to Node:';
        if (document.getElementById('ee-npc-status')) document.getElementById('ee-npc-status').value = 'Active';
        if (document.getElementById('ee-npc-standing')) document.getElementById('ee-npc-standing').value = '0';
        if (document.getElementById('ee-npc-culture')) document.getElementById('ee-npc-culture').value = '';
        if (document.getElementById('ee-npc-four-corners')) document.getElementById('ee-npc-four-corners').value = '';
        if (document.getElementById('ee-npc-odv-s')) document.getElementById('ee-npc-odv-s').value = '2';
        if (document.getElementById('ee-npc-odv-e')) document.getElementById('ee-npc-odv-e').value = '2';
        if (document.getElementById('ee-npc-odv-c')) document.getElementById('ee-npc-odv-c').value = '2';
        if (document.getElementById('ee-npc-secrets')) document.getElementById('ee-npc-secrets').value = '';
        if (document.getElementById('ee-npc-vulnerability')) document.getElementById('ee-npc-vulnerability').value = '';
        if (document.getElementById('ee-npc-bribe')) document.getElementById('ee-npc-bribe').value = '';
        if (document.getElementById('ee-npc-dialogue')) document.getElementById('ee-npc-dialogue').value = '';
      } else if (type === 'quest') {
        document.getElementById('ee-role-label').textContent = 'Quest Category (Dilemma, Contract, Heist, Escort, Retrieval):';
        document.getElementById('ee-meta-label').textContent = 'Threat Clock & Faction Stakes:';
        document.getElementById('ee-notes-label').textContent = 'Objective & Complications:';
        if (nodeLabel) nodeLabel.textContent = 'Main Anchored Quest Node:';
        if (questExt) {
          questExt.style.display = 'flex';

          // Populate NPCs list
          const npcsContainer = document.getElementById('ee-quest-npcs-list');
          if (npcsContainer) {
            const allNpcs = (Workstation.activeTopology && Workstation.activeTopology.npcs) || [];
            if (allNpcs.length === 0) {
              npcsContainer.innerHTML = '<span style="color:#777; font-style:italic;">No NPCs currently in active campaign roster.</span>';
            } else {
              npcsContainer.innerHTML = allNpcs.map(n => `
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:2px 0;">
                  <input type="checkbox" class="ee-quest-npc-cb" value="${n.id}" onchange="updateQuestSpanningPreview()">
                  <span><strong>${n.name}</strong> (${n.role || 'Resident'}) &bull; Node ${n.nodeId != null ? n.nodeId : 'Unassigned'}</span>
                </label>
              `).join('');
            }
          }

          // Populate Items list
          const itemsContainer = document.getElementById('ee-quest-items-list');
          if (itemsContainer) {
            const allItems = (Workstation.activeTopology && Workstation.activeTopology.items) || [];
            if (allItems.length === 0) {
              itemsContainer.innerHTML = '<span style="color:#777; font-style:italic;">No items currently in active campaign catalog.</span>';
            } else {
              itemsContainer.innerHTML = allItems.map(i => `
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:2px 0;">
                  <input type="checkbox" class="ee-quest-item-cb" value="${i.id}" onchange="updateQuestSpanningPreview()">
                  <span><strong>${i.name}</strong> [${i.category || 'Gear'}] &bull; Node ${i.nodeId != null ? i.nodeId : 'Unassigned'}</span>
                </label>
              `).join('');
            }
          }

          // Populate Trackers list
          const trackersContainer = document.getElementById('ee-quest-trackers-list');
          if (trackersContainer) {
            const allTrackers = (Workstation.activeTopology && Workstation.activeTopology.trackers) || [];
            if (allTrackers.length === 0) {
              trackersContainer.innerHTML = '<span style="color:#777; font-style:italic;">No threat clocks currently in active campaign roster.</span>';
            } else {
              trackersContainer.innerHTML = allTrackers.map(t => `
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:2px 0;">
                  <input type="checkbox" class="ee-quest-tracker-cb" value="${t.id}" onchange="updateQuestSpanningPreview()">
                  <span><strong>⏱️ ${t.name}</strong> (${t.currentTicks || 0}/${t.maxTicks || 6}) &bull; Node ${t.nodeId != null ? t.nodeId : 'Unassigned'}</span>
                </label>
              `).join('');
            }
          }

          updateQuestSpanningPreview();
        }
      } else if (type === 'tracker') {
        document.getElementById('ee-role-label').textContent = 'Clock Type (Threat Clock, Hazard, Dial):';
        document.getElementById('ee-meta-label').textContent = 'Max Ticks / Steps (e.g. 4, 6, 8):';
        document.getElementById('ee-notes-label').textContent = 'Trigger Event, Stakes & Escalation Outcome:';
        if (nodeLabel) nodeLabel.textContent = 'Station to Node:';
        const scopeSel = document.getElementById('ee-tracker-scope');
        if (scopeSel) scopeSel.value = 'settlement';
        const triggersContainer = document.getElementById('ee-tracker-triggers-list');
        if (triggersContainer) {
          const topo = Workstation.activeTopology || {};
          const candidates = [];
          (topo.quests || []).forEach(q => candidates.push({ type: 'quest', id: q.id, label: `📜 Quest: ${q.title || q.name}` }));
          (topo.npcs || []).forEach(n => candidates.push({ type: 'npc', id: n.id, label: `👤 NPC: ${n.name} (${n.role || 'Resident'})` }));
          (topo.items || []).forEach(i => candidates.push({ type: 'item', id: i.id, label: `📦 Item: ${i.name}` }));
          (topo.factions || []).forEach(f => candidates.push({ type: 'faction', id: f.id, label: `👑 Faction: ${f.name}` }));
          (topo.trackers || []).forEach(t => candidates.push({ type: 'tracker', id: t.id, label: `⏱️ Clock: ${t.name}` }));
          if (candidates.length === 0) {
            triggersContainer.innerHTML = '<span style="color:#777; font-style:italic;">No quests, NPCs, items, factions, or clocks in campaign roster yet.</span>';
          } else {
            triggersContainer.innerHTML = candidates.map(c => `
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:2px 0;">
                <input type="checkbox" class="ee-tracker-trigger-cb" data-entity-type="${c.type}" value="${c.id}">
                <span>${c.label}</span>
              </label>
            `).join('');
          }
        }
      } else if (type === 'faction') {
        document.getElementById('ee-role-label').textContent = 'Faction Type (Order, Guild, Syndicate, Clan, Power Group):';
        document.getElementById('ee-meta-label').textContent = 'Ideological Stance / Motto:';
        document.getElementById('ee-notes-label').textContent = 'Ideological Agenda & Dossier Overview:';
        if (nodeLabel) nodeLabel.textContent = 'Headquarters Node:';
        if (document.getElementById('ee-faction-culture')) document.getElementById('ee-faction-culture').value = 'Clan';
        if (document.getElementById('ee-faction-color')) document.getElementById('ee-faction-color').value = 'W';
        if (document.getElementById('ee-faction-odv-s')) document.getElementById('ee-faction-odv-s').value = '2';
        if (document.getElementById('ee-faction-odv-e')) document.getElementById('ee-faction-odv-e').value = '2';
        if (document.getElementById('ee-faction-odv-c')) document.getElementById('ee-faction-odv-c').value = '2';

        const leaderSel = document.getElementById('ee-faction-leader');
        if (leaderSel) {
          const allNpcs = (Workstation.activeTopology && Workstation.activeTopology.npcs) || [];
          let opts = '<option value="">(None / Autonomous Council)</option>';
          allNpcs.forEach(n => {
            opts += `<option value="${n.id}">👤 ${n.name} (${n.role || 'Resident'})</option>`;
          });
          leaderSel.innerHTML = opts;
          leaderSel.value = '';
        }

        const nodesContainer = document.getElementById('ee-faction-nodes-list');
        if (nodesContainer) {
          const topoNodes = Workstation.activeTopology && Workstation.activeTopology.nodes ? Object.values(Workstation.activeTopology.nodes) : [];
          if (topoNodes.length === 0) {
            nodesContainer.innerHTML = '<span style="color:#777; font-style:italic;">No nodes in active topology.</span>';
          } else {
            nodesContainer.innerHTML = topoNodes.map(n => `
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:2px 0;">
                <input type="checkbox" class="ee-faction-node-cb" value="${n.id}">
                <span><strong>Node ${n.id}:</strong> ${n.name} (${n.culture || 'Adhocracy'})</span>
              </label>
            `).join('');
          }
        }
      } else if (type === 'resource') {
        document.getElementById('ee-role-label').textContent = 'Resource Sector & Commodity (e.g. Mining, Timber, Agriculture):';
        document.getElementById('ee-meta-label').textContent = 'DF Stockpile / Batch Specs / Unit Weight:';
        document.getElementById('ee-notes-label').textContent = 'Extraction Lore, Refining Steps & Logistics Notes:';
        if (nodeLabel) nodeLabel.textContent = 'Stationed Stockpile Node:';
        if (itemExt) itemExt.style.display = 'flex';

        const ownerSel = document.getElementById('ee-item-owner');
        if (ownerSel) {
          const allNpcs = (Workstation.activeTopology && Workstation.activeTopology.npcs) || [];
          let opts = '<option value="">(None - Public Stockpile / Settlement Depot)</option>';
          allNpcs.forEach(n => {
            opts += `<option value="${n.id}">👤 ${n.name} (${n.role || 'Resident'})</option>`;
          });
          ownerSel.innerHTML = opts;
          ownerSel.value = '';
        }
        const posSel = document.getElementById('ee-item-possession-mode');
        if (posSel) posSel.value = 'stored';
      } else if (type === 'creature') {
        document.getElementById('ee-role-label').textContent = 'Kind / Subtype Summary:';
        document.getElementById('ee-meta-label').textContent = 'Tactical Role / Ecological Niche:';
        document.getElementById('ee-notes-label').textContent = 'Creature Summary & Encounter Lore:';
        if (nodeLabel) nodeLabel.textContent = 'Stationed Lair Node:';
        if (document.getElementById('ee-creature-kind')) document.getElementById('ee-creature-kind').value = 'beast';
        if (document.getElementById('ee-creature-subtype')) document.getElementById('ee-creature-subtype').value = '';
        if (document.getElementById('ee-creature-size')) document.getElementById('ee-creature-size').value = 'Medium';
        if (document.getElementById('ee-creature-threat-tier')) document.getElementById('ee-creature-threat-tier').value = '2';
        if (document.getElementById('ee-creature-dread-index')) document.getElementById('ee-creature-dread-index').value = '3';
        if (document.getElementById('ee-creature-roaming-scope')) document.getElementById('ee-creature-roaming-scope').value = 'stationary_lair';
        if (document.getElementById('ee-creature-dread-effect')) document.getElementById('ee-creature-dread-effect').value = '';
        if (document.getElementById('ee-creature-might')) document.getElementById('ee-creature-might').value = '3';
        if (document.getElementById('ee-creature-agility')) document.getElementById('ee-creature-agility').value = '2';
        if (document.getElementById('ee-creature-resilience')) document.getElementById('ee-creature-resilience').value = '3';
        if (document.getElementById('ee-creature-cunning')) document.getElementById('ee-creature-cunning').value = '1';
        if (document.getElementById('ee-creature-awareness')) document.getElementById('ee-creature-awareness').value = '2';
        if (document.getElementById('ee-creature-presence')) document.getElementById('ee-creature-presence').value = '2';
      } else {
        document.getElementById('ee-role-label').textContent = 'Item Category (Weapon, Gear, Relic, Tech, Document, Key Item):';
        document.getElementById('ee-meta-label').textContent = 'Specifications / Output Dial / Trait:';
        document.getElementById('ee-notes-label').textContent = 'Lore, Mechanical Properties & Notes:';
        if (nodeLabel) nodeLabel.textContent = 'Stationed Node (When Stored):';

        const ownerSel = document.getElementById('ee-item-owner');
        if (ownerSel) {
          const allNpcs = (Workstation.activeTopology && Workstation.activeTopology.npcs) || [];
          let opts = '<option value="">(None - Unassigned / Public World Relic)</option>';
          allNpcs.forEach(n => {
            opts += `<option value="${n.id}">👤 ${n.name} (${n.role || 'Resident'})</option>`;
          });
          ownerSel.innerHTML = opts;
          ownerSel.value = '';
        }
        const posSel = document.getElementById('ee-item-possession-mode');
        if (posSel) posSel.value = 'stored';
      }

      // Populate Node Select
      const topo = Workstation.activeTopology;
      const nodeSel = document.getElementById('ee-node-select');
      let nodeOptions = '<option value="">(Unassigned / In Pool)</option>';
      if (typeof maps !== "undefined" && Object.keys(maps).length > 1) {
        Object.keys(maps).forEach(mId => {
          const m = maps[mId];
          const isCur = (mId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root"));
          const mapNodes = isCur ? (topo.nodes ? Object.values(topo.nodes) : (m.nodes || [])) : (m.nodes || []);
          if (mapNodes.length > 0) {
            nodeOptions += `<optgroup label="${m.name} [${(m.scaleTier || 'region').toUpperCase()}]">`;
            mapNodes.forEach(n => {
              nodeOptions += `<option value="${n.id}">Node ${n.id}: ${n.name}</option>`;
            });
            nodeOptions += `</optgroup>`;
          }
        });
      } else {
        Object.keys(topo.nodes || {}).forEach(k => {
          const n = topo.nodes[k];
          nodeOptions += `<option value="${k}">Node ${k}: ${n.name}</option>`;
        });
      }
      nodeSel.innerHTML = nodeOptions;

      const effectiveNodeId = (preselectedNodeId != null && preselectedNodeId !== '')
        ? preselectedNodeId
        : ((Workstation && Workstation.selectedEntity && Workstation.selectedEntity.type === 'node')
            ? Workstation.selectedEntity.id
            : ((CurrentEntityTab === 'node' && SelectedEntityId) ? SelectedEntityId : null));

      if (effectiveNodeId != null && effectiveNodeId !== '') {
        nodeSel.value = String(effectiveNodeId);
      } else {
        nodeSel.value = '';
      }

      if (type === 'quest') {
        updateQuestSpanningPreview();
      }

      nodeSel.onchange = () => {
        if (document.getElementById('ee-entity-type').value === 'quest') {
          updateQuestSpanningPreview();
        }
      };

      if (typeof openModal === 'function') {
        openModal('modal-entity-edit');
      } else {
        modal.classList.remove('hidden');
      }
    }
    window.openNewEntityModal = openNewEntityModal;

    function openEditEntityModal(entityId) {
      const activeList = getActiveEntityList(CurrentEntityTab);
      const entity = activeList.find(e => e.id === entityId);
      if (!entity) return;

      openNewEntityModal(CurrentEntityTab);
      document.getElementById('ee-modal-title').textContent = `Edit ${CurrentEntityTab.toUpperCase()}`;
      document.getElementById('ee-entity-id').value = entity.id;
      document.getElementById('ee-name').value = entity.name || entity.title || '';
      document.getElementById('ee-role').value = entity.role || entity.category || entity.type || entity.subtype || '';
      document.getElementById('ee-meta').value = (CurrentEntityTab === 'tracker') ? (entity.maxTicks || 6) : (entity.faction || entity.threat || entity.specs || (CurrentEntityTab === 'creature' ? (entity.size || 'Medium') : ''));
      document.getElementById('ee-notes').value = entity.motivation || entity.notes || entity.summary || '';
      const effectiveNodeId = (CurrentEntityTab === 'creature' && typeof getCreatureEffectiveNodeId === 'function') ? getCreatureEffectiveNodeId(entity) : entity.nodeId;
      document.getElementById('ee-node-select').value = effectiveNodeId != null ? String(effectiveNodeId) : '';

      if (CurrentEntityTab === 'npc') {
        if (document.getElementById('ee-npc-status')) document.getElementById('ee-npc-status').value = entity.status || 'Active';
        if (document.getElementById('ee-npc-standing')) document.getElementById('ee-npc-standing').value = (entity.dispositionToParty !== undefined) ? String(entity.dispositionToParty) : '0';
        if (document.getElementById('ee-npc-culture')) document.getElementById('ee-npc-culture').value = entity.culture || '';
        if (document.getElementById('ee-npc-four-corners')) document.getElementById('ee-npc-four-corners').value = entity.fourCornersRole || '';
        if (entity.odv) {
          if (document.getElementById('ee-npc-odv-s')) document.getElementById('ee-npc-odv-s').value = String(entity.odv.s || 2);
          if (document.getElementById('ee-npc-odv-e')) document.getElementById('ee-npc-odv-e').value = String(entity.odv.e || 2);
          if (document.getElementById('ee-npc-odv-c')) document.getElementById('ee-npc-odv-c').value = String(entity.odv.c || 2);
        } else {
          if (document.getElementById('ee-npc-odv-s')) document.getElementById('ee-npc-odv-s').value = '2';
          if (document.getElementById('ee-npc-odv-e')) document.getElementById('ee-npc-odv-e').value = '2';
          if (document.getElementById('ee-npc-odv-c')) document.getElementById('ee-npc-odv-c').value = '2';
        }
        if (document.getElementById('ee-npc-secrets')) {
          document.getElementById('ee-npc-secrets').value = (entity.secretsKnown || []).map(s => typeof s === 'string' ? s : s.secret).join('\n');
        }
        if (document.getElementById('ee-npc-vulnerability')) {
          document.getElementById('ee-npc-vulnerability').value = (entity.leverage && entity.leverage.vulnerability) || '';
        }
        if (document.getElementById('ee-npc-bribe')) {
          document.getElementById('ee-npc-bribe').value = (entity.leverage && entity.leverage.bribe) || '';
        }
        if (document.getElementById('ee-npc-dialogue')) {
          document.getElementById('ee-npc-dialogue').value = (entity.dialogueHooks || []).join('\n');
        }
      } else if (CurrentEntityTab === 'item' || CurrentEntityTab === 'resource') {
        const ownerSel = document.getElementById('ee-item-owner');
        if (ownerSel) {
          const allNpcs = (Workstation.activeTopology && Workstation.activeTopology.npcs) || [];
          let opts = CurrentEntityTab === 'resource'
            ? '<option value="">(None - Public Stockpile / Settlement Depot)</option>'
            : '<option value="">(None - Unassigned / Public World Relic)</option>';
          allNpcs.forEach(n => {
            opts += `<option value="${n.id}" ${String(entity.ownerNpcId) === String(n.id) ? 'selected' : ''}>👤 ${n.name} (${n.role || 'Resident'})</option>`;
          });
          ownerSel.innerHTML = opts;
          ownerSel.value = entity.ownerNpcId || '';
        }
        const posSel = document.getElementById('ee-item-possession-mode');
        if (posSel) posSel.value = entity.possessionMode || 'stored';
      } else if (CurrentEntityTab === 'quest') {
        if (document.getElementById('ee-quest-status')) {
          document.getElementById('ee-quest-status').value = entity.status || 'Active';
        }
        const npcIds = Array.isArray(entity.npcIds) ? entity.npcIds : [];
        const itemIds = Array.isArray(entity.itemIds) ? entity.itemIds : [];
        const trackerIds = Array.isArray(entity.trackerIds) ? entity.trackerIds : [];
        document.querySelectorAll('.ee-quest-npc-cb').forEach(cb => {
          cb.checked = npcIds.includes(cb.value);
        });
        document.querySelectorAll('.ee-quest-item-cb').forEach(cb => {
          cb.checked = itemIds.includes(cb.value);
        });
        document.querySelectorAll('.ee-quest-tracker-cb').forEach(cb => {
          cb.checked = trackerIds.includes(cb.value);
        });
        updateQuestSpanningPreview();
      } else if (CurrentEntityTab === 'tracker') {
        const scopeSel = document.getElementById('ee-tracker-scope');
        if (scopeSel) {
          const normScope = (entity.scopeTier === 'city') ? 'settlement' : (entity.scopeTier || 'settlement');
          scopeSel.value = normScope;
        }
        const refs = Array.isArray(entity.triggerRefs) ? entity.triggerRefs : [];
        document.querySelectorAll('.ee-tracker-trigger-cb').forEach(cb => {
          const eType = cb.getAttribute('data-entity-type');
          cb.checked = refs.some(r => (!r.entityType || r.entityType === eType) && String(r.entityId) === String(cb.value));
        });
        if (document.getElementById('ee-tracker-consequences')) {
          if (Array.isArray(entity.consequences) && entity.consequences.length > 0) {
            document.getElementById('ee-tracker-consequences').value = entity.consequences
              .map(c => `${c.tick}: ${c.description || ''}`)
              .join('\n');
          } else {
            document.getElementById('ee-tracker-consequences').value = '';
          }
        }
      } else if (CurrentEntityTab === 'faction') {
        if (document.getElementById('ee-faction-culture')) document.getElementById('ee-faction-culture').value = entity.cvfQuadrant || 'Clan';
        if (document.getElementById('ee-faction-color')) document.getElementById('ee-faction-color').value = entity.colorIdentity || 'W';
        if (document.getElementById('ee-faction-leader')) document.getElementById('ee-faction-leader').value = entity.leaderNpcId || '';
        if (Array.isArray(entity.disposition) && entity.disposition.length >= 3) {
          if (document.getElementById('ee-faction-odv-s')) document.getElementById('ee-faction-odv-s').value = String(entity.disposition[0]);
          if (document.getElementById('ee-faction-odv-e')) document.getElementById('ee-faction-odv-e').value = String(entity.disposition[1]);
          if (document.getElementById('ee-faction-odv-c')) document.getElementById('ee-faction-odv-c').value = String(entity.disposition[2]);
        }
        const controlled = Array.isArray(entity.controlledNodeIds) ? entity.controlledNodeIds.map(String) : [];
        document.querySelectorAll('.ee-faction-node-cb').forEach(cb => {
          cb.checked = controlled.includes(String(cb.value));
        });
      } else if (CurrentEntityTab === 'creature') {
        if (document.getElementById('ee-creature-kind')) document.getElementById('ee-creature-kind').value = entity.kind || 'beast';
        if (document.getElementById('ee-creature-subtype')) document.getElementById('ee-creature-subtype').value = entity.subtype || '';
        if (document.getElementById('ee-creature-size')) document.getElementById('ee-creature-size').value = entity.size || 'Medium';
        if (document.getElementById('ee-creature-threat-tier')) document.getElementById('ee-creature-threat-tier').value = String(entity.threatTier !== undefined ? entity.threatTier : 2);
        const dreadVal = (entity.gigerenzerBehavior && entity.gigerenzerBehavior.dreadIndex !== undefined) ? entity.gigerenzerBehavior.dreadIndex : (entity.dreadIndex !== undefined ? entity.dreadIndex : 3);
        if (document.getElementById('ee-creature-dread-index')) document.getElementById('ee-creature-dread-index').value = String(dreadVal);
        const dreadEff = (entity.gigerenzerBehavior && entity.gigerenzerBehavior.dreadEffect) || entity.dreadEffect || '';
        if (document.getElementById('ee-creature-dread-effect')) document.getElementById('ee-creature-dread-effect').value = dreadEff;
        const rScope = (entity.stationing && entity.stationing.roamingScope) || 'stationary_lair';
        if (document.getElementById('ee-creature-roaming-scope')) document.getElementById('ee-creature-roaming-scope').value = rScope;
        const caps = entity.relativeCapabilities || {};
        if (document.getElementById('ee-creature-might')) document.getElementById('ee-creature-might').value = String(caps.might || 3);
        if (document.getElementById('ee-creature-agility')) document.getElementById('ee-creature-agility').value = String(caps.agility || 2);
        if (document.getElementById('ee-creature-resilience')) document.getElementById('ee-creature-resilience').value = String(caps.resilience || 3);
        if (document.getElementById('ee-creature-cunning')) document.getElementById('ee-creature-cunning').value = String(caps.cunning || 1);
        if (document.getElementById('ee-creature-awareness')) document.getElementById('ee-creature-awareness').value = String(caps.awareness || 2);
        if (document.getElementById('ee-creature-presence')) document.getElementById('ee-creature-presence').value = String(caps.presence || 2);
      }
    }

    function saveCustomEntity() {
      const type = document.getElementById('ee-entity-type').value;
      const id = document.getElementById('ee-entity-id').value;
      const name = document.getElementById('ee-name').value.trim();
      const role = document.getElementById('ee-role').value.trim();
      const meta = document.getElementById('ee-meta').value.trim();
      const notes = document.getElementById('ee-notes').value.trim();
      const nodeIdVal = document.getElementById('ee-node-select').value;
      const nodeId = nodeIdVal ? ((isNaN(nodeIdVal) || String(nodeIdVal).includes('-')) ? nodeIdVal : parseInt(nodeIdVal)) : null;

      if (!name) {
        alert("Please enter a name or title.");
        return;
      }

      const backingList = typeof getBackingEntityList === 'function' ? getBackingEntityList(type) : getActiveEntityList(type);
      const activeList = getActiveEntityList(type);

      if (id) {
        // Edit existing
        const entity = activeList.find(e => e.id === id);
        if (entity) {
          if (type === 'npc') {
            entity.name = name;
            entity.role = role;
            entity.faction = meta;
            entity.motivation = notes;
            if (document.getElementById('ee-npc-status')) entity.status = document.getElementById('ee-npc-status').value;
            if (document.getElementById('ee-npc-standing')) entity.dispositionToParty = parseInt(document.getElementById('ee-npc-standing').value, 10) || 0;
            if (document.getElementById('ee-npc-culture')) entity.culture = document.getElementById('ee-npc-culture').value || null;
            if (document.getElementById('ee-npc-four-corners')) entity.fourCornersRole = document.getElementById('ee-npc-four-corners').value || null;
            if (document.getElementById('ee-npc-odv-s')) {
              entity.odv = {
                s: parseInt(document.getElementById('ee-npc-odv-s').value, 10) || 2,
                e: parseInt(document.getElementById('ee-npc-odv-e').value, 10) || 2,
                c: parseInt(document.getElementById('ee-npc-odv-c').value, 10) || 2
              };
            }
            if (document.getElementById('ee-npc-secrets')) {
              const rawSecs = document.getElementById('ee-npc-secrets').value.split('\n').map(s => s.trim()).filter(Boolean);
              const prevSecs = entity.secretsKnown || [];
              entity.secretsKnown = rawSecs.map(st => {
                const prev = prevSecs.find(p => (typeof p === 'object' ? p.secret : p) === st);
                return { secret: st, revealed: prev ? !!prev.revealed : false };
              });
            }
            if (document.getElementById('ee-npc-vulnerability') || document.getElementById('ee-npc-bribe')) {
              entity.leverage = {
                vulnerability: (document.getElementById('ee-npc-vulnerability') ? document.getElementById('ee-npc-vulnerability').value.trim() : ''),
                bribe: (document.getElementById('ee-npc-bribe') ? document.getElementById('ee-npc-bribe').value.trim() : '')
              };
            }
            if (document.getElementById('ee-npc-dialogue')) {
              entity.dialogueHooks = document.getElementById('ee-npc-dialogue').value.split('\n').map(d => d.trim()).filter(Boolean);
            }
          } else if (type === 'quest') {
            const prevTrackerIds = Array.isArray(entity.trackerIds) ? [...entity.trackerIds] : [];
            entity.title = name;
            entity.type = role;
            entity.threat = meta;
            entity.notes = notes;
            if (document.getElementById('ee-quest-status')) {
              entity.status = document.getElementById('ee-quest-status').value || 'Active';
            } else if (!entity.status) {
              entity.status = 'Active';
            }
            entity.npcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
            entity.itemIds = Array.from(document.querySelectorAll('.ee-quest-item-cb:checked')).map(cb => cb.value);
            entity.trackerIds = Array.from(document.querySelectorAll('.ee-quest-tracker-cb:checked')).map(cb => cb.value);
            if (typeof syncQuestAndTrackerLinks === 'function') {
              syncQuestAndTrackerLinks(entity, prevTrackerIds);
            }
          } else if (type === 'tracker') {
            const prevQuestRefs = (entity.triggerRefs || [])
              .filter(r => r && r.entityType === 'quest')
              .map(r => String(r.entityId));
            entity.name = name;
            entity.type = role || 'Threat Clock';
            entity.maxTicks = parseInt(meta) || 6;
            entity.notes = notes;
            if (document.getElementById('ee-tracker-scope')) {
              entity.scopeTier = document.getElementById('ee-tracker-scope').value || 'settlement';
            }
            entity.triggerRefs = Array.from(document.querySelectorAll('.ee-tracker-trigger-cb:checked')).map(cb => ({
              entityType: cb.getAttribute('data-entity-type') || 'quest',
              entityId: cb.value
            }));
            if (document.getElementById('ee-tracker-consequences')) {
              const parseConsequences = (text, existing = []) => {
                if (!text) return [];
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                const existingMap = new Map();
                if (Array.isArray(existing)) {
                  existing.forEach(c => { if (c && typeof c.tick === 'number') existingMap.set(c.tick, c); });
                }
                return lines.map(line => {
                  const m = line.match(/^(\d+)[\s:|]+(.+)$/);
                  if (!m) return null;
                  const tick = parseInt(m[1], 10);
                  const desc = m[2].trim();
                  const ex = existingMap.get(tick);
                  return {
                    tick,
                    description: desc,
                    triggered: ex ? !!ex.triggered : false,
                    triggeredAt: ex ? ex.triggeredAt : undefined,
                    triggeredByBatchId: ex ? ex.triggeredByBatchId : undefined,
                    operations: (ex && ex.operations) ? ex.operations : []
                  };
                }).filter(Boolean).sort((a, b) => a.tick - b.tick);
              };
              entity.consequences = parseConsequences(document.getElementById('ee-tracker-consequences').value, entity.consequences);
            }
            if (typeof syncTrackerToQuests === 'function') {
              syncTrackerToQuests(entity, prevQuestRefs);
            }
          } else if (type === 'faction') {
            entity.name = name;
            entity.type = role || 'Power Group';
            entity.cvfQuadrant = document.getElementById('ee-faction-culture') ? document.getElementById('ee-faction-culture').value : 'Clan';
            entity.colorIdentity = document.getElementById('ee-faction-color') ? document.getElementById('ee-faction-color').value : 'W';
            entity.leaderNpcId = document.getElementById('ee-faction-leader') ? (document.getElementById('ee-faction-leader').value || null) : null;
            entity.headquartersNodeId = nodeId;
            const cNodes = Array.from(document.querySelectorAll('.ee-faction-node-cb:checked')).map(cb => isNaN(cb.value) ? cb.value : parseInt(cb.value, 10));
            if (nodeId != null && !cNodes.includes(nodeId)) cNodes.push(nodeId);
            entity.controlledNodeIds = cNodes;
            entity.disposition = [
              parseInt(document.getElementById('ee-faction-odv-s').value, 10) || 2,
              parseInt(document.getElementById('ee-faction-odv-e').value, 10) || 2,
              parseInt(document.getElementById('ee-faction-odv-c').value, 10) || 2
            ];
            entity.description = notes;
            entity.notes = notes;
          } else if (type === 'resource') {
            entity.name = name;
            entity.category = role || 'Resource Export / Supply Anchor';
            entity.specs = meta;
            entity.notes = notes;
            entity.isResource = true;
            if (document.getElementById('ee-item-owner')) entity.ownerNpcId = document.getElementById('ee-item-owner').value || null;
            if (document.getElementById('ee-item-possession-mode')) entity.possessionMode = document.getElementById('ee-item-possession-mode').value || 'stored';
          } else if (type === 'creature') {
            entity.name = name;
            entity.summary = notes;
            entity.notes = notes;
            if (document.getElementById('ee-creature-kind')) entity.kind = document.getElementById('ee-creature-kind').value || 'beast';
            if (document.getElementById('ee-creature-subtype')) entity.subtype = document.getElementById('ee-creature-subtype').value.trim() || '';
            if (document.getElementById('ee-creature-size')) entity.size = document.getElementById('ee-creature-size').value || 'Medium';
            if (document.getElementById('ee-creature-threat-tier')) entity.threatTier = parseInt(document.getElementById('ee-creature-threat-tier').value, 10) || 0;
            entity.relativeCapabilities = entity.relativeCapabilities || {};
            if (document.getElementById('ee-creature-might')) entity.relativeCapabilities.might = parseInt(document.getElementById('ee-creature-might').value, 10) || 1;
            if (document.getElementById('ee-creature-agility')) entity.relativeCapabilities.agility = parseInt(document.getElementById('ee-creature-agility').value, 10) || 1;
            if (document.getElementById('ee-creature-resilience')) entity.relativeCapabilities.resilience = parseInt(document.getElementById('ee-creature-resilience').value, 10) || 1;
            if (document.getElementById('ee-creature-cunning')) entity.relativeCapabilities.cunning = parseInt(document.getElementById('ee-creature-cunning').value, 10) || 1;
            if (document.getElementById('ee-creature-awareness')) entity.relativeCapabilities.awareness = parseInt(document.getElementById('ee-creature-awareness').value, 10) || 1;
            if (document.getElementById('ee-creature-presence')) entity.relativeCapabilities.presence = parseInt(document.getElementById('ee-creature-presence').value, 10) || 1;

            entity.gigerenzerBehavior = entity.gigerenzerBehavior || {};
            if (document.getElementById('ee-creature-dread-index')) entity.gigerenzerBehavior.dreadIndex = parseInt(document.getElementById('ee-creature-dread-index').value, 10) || 1;
            if (document.getElementById('ee-creature-dread-effect')) entity.gigerenzerBehavior.dreadEffect = document.getElementById('ee-creature-dread-effect').value.trim() || '';

            entity.stationing = entity.stationing || {};
            entity.stationing.nodeId = nodeId;
            entity.stationing.mode = nodeId != null ? 'lair' : 'unassigned';
            if (document.getElementById('ee-creature-roaming-scope')) entity.stationing.roamingScope = document.getElementById('ee-creature-roaming-scope').value || 'stationary_lair';
            entity.nodeId = nodeId;
          } else {
            entity.name = name;
            entity.category = role;
            entity.specs = meta;
            entity.notes = notes;
            if (document.getElementById('ee-item-owner')) entity.ownerNpcId = document.getElementById('ee-item-owner').value || null;
            if (document.getElementById('ee-item-possession-mode')) entity.possessionMode = document.getElementById('ee-item-possession-mode').value || 'stored';
          }
          entity.nodeId = nodeId;
        }
      } else {
        // Create new
        const newEntity = {
          id: `${type}-${Date.now().toString().slice(-6)}`,
          nodeId: nodeId,
          isCustom: true,
          status: 'Active'
        };
        if (type === 'npc') {
          newEntity.name = name;
          newEntity.role = role;
          newEntity.faction = meta;
          newEntity.motivation = notes;
          newEntity.status = document.getElementById('ee-npc-status') ? document.getElementById('ee-npc-status').value : 'Active';
          newEntity.dispositionToParty = document.getElementById('ee-npc-standing') ? (parseInt(document.getElementById('ee-npc-standing').value, 10) || 0) : 0;
          newEntity.culture = document.getElementById('ee-npc-culture') ? (document.getElementById('ee-npc-culture').value || null) : null;
          newEntity.fourCornersRole = document.getElementById('ee-npc-four-corners') ? (document.getElementById('ee-npc-four-corners').value || null) : null;
          if (document.getElementById('ee-npc-odv-s')) {
            newEntity.odv = {
              s: parseInt(document.getElementById('ee-npc-odv-s').value, 10) || 2,
              e: parseInt(document.getElementById('ee-npc-odv-e').value, 10) || 2,
              c: parseInt(document.getElementById('ee-npc-odv-c').value, 10) || 2
            };
          }
          if (document.getElementById('ee-npc-secrets')) {
            newEntity.secretsKnown = document.getElementById('ee-npc-secrets').value.split('\n').map(s => s.trim()).filter(Boolean).map(st => ({ secret: st, revealed: false }));
          } else {
            newEntity.secretsKnown = [];
          }
          newEntity.leverage = {
            vulnerability: (document.getElementById('ee-npc-vulnerability') ? document.getElementById('ee-npc-vulnerability').value.trim() : ''),
            bribe: (document.getElementById('ee-npc-bribe') ? document.getElementById('ee-npc-bribe').value.trim() : '')
          };
          if (document.getElementById('ee-npc-dialogue')) {
            newEntity.dialogueHooks = document.getElementById('ee-npc-dialogue').value.split('\n').map(d => d.trim()).filter(Boolean);
          } else {
            newEntity.dialogueHooks = [];
          }
          newEntity.relationships = [];
        } else if (type === 'quest') {
          newEntity.title = name;
          newEntity.type = role;
          newEntity.threat = meta;
          newEntity.notes = notes;
          newEntity.status = document.getElementById('ee-quest-status') ? (document.getElementById('ee-quest-status').value || 'Active') : 'Active';
          newEntity.npcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
          newEntity.itemIds = Array.from(document.querySelectorAll('.ee-quest-item-cb:checked')).map(cb => cb.value);
          newEntity.trackerIds = Array.from(document.querySelectorAll('.ee-quest-tracker-cb:checked')).map(cb => cb.value);
          newEntity.steps = [];
          if (typeof syncQuestAndTrackerLinks === 'function') {
            syncQuestAndTrackerLinks(newEntity, []);
          }
        } else if (type === 'tracker') {
          newEntity.name = name;
          newEntity.type = role || 'Threat Clock';
          newEntity.maxTicks = parseInt(meta) || 6;
          newEntity.currentTicks = 0;
          newEntity.faction = 'Custom';
          newEntity.notes = notes;
          newEntity.scopeTier = document.getElementById('ee-tracker-scope') ? (document.getElementById('ee-tracker-scope').value || 'settlement') : 'settlement';
          newEntity.triggerRefs = Array.from(document.querySelectorAll('.ee-tracker-trigger-cb:checked')).map(cb => ({
            entityType: cb.getAttribute('data-entity-type') || 'quest',
            entityId: cb.value
          }));
          if (document.getElementById('ee-tracker-consequences')) {
            const lines = document.getElementById('ee-tracker-consequences').value.split('\n').map(l => l.trim()).filter(Boolean);
            newEntity.consequences = lines.map(line => {
              const m = line.match(/^(\d+)[\s:|]+(.+)$/);
              if (!m) return null;
              return {
                tick: parseInt(m[1], 10),
                description: m[2].trim(),
                triggered: false,
                operations: []
              };
            }).filter(Boolean).sort((a, b) => a.tick - b.tick);
          } else {
            newEntity.consequences = [];
          }
          if (typeof syncTrackerToQuests === 'function') {
            syncTrackerToQuests(newEntity, []);
          }
        } else if (type === 'faction') {
          const cNodes = Array.from(document.querySelectorAll('.ee-faction-node-cb:checked')).map(cb => isNaN(cb.value) ? cb.value : parseInt(cb.value, 10));
          if (nodeId != null && !cNodes.includes(nodeId)) cNodes.push(nodeId);
          newEntity.id = 'faction_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now().toString().slice(-4);
          newEntity.name = name;
          newEntity.type = role || 'Power Group';
          newEntity.cvfQuadrant = document.getElementById('ee-faction-culture') ? document.getElementById('ee-faction-culture').value : 'Clan';
          newEntity.colorIdentity = document.getElementById('ee-faction-color') ? document.getElementById('ee-faction-color').value : 'W';
          newEntity.leaderNpcId = document.getElementById('ee-faction-leader') ? (document.getElementById('ee-faction-leader').value || null) : null;
          newEntity.headquartersNodeId = nodeId;
          newEntity.controlledNodeIds = cNodes;
          newEntity.diplomaticStances = {};
          newEntity.disposition = [
            parseInt(document.getElementById('ee-faction-odv-s').value, 10) || 2,
            parseInt(document.getElementById('ee-faction-odv-e').value, 10) || 2,
            parseInt(document.getElementById('ee-faction-odv-c').value, 10) || 2
          ];
          newEntity.description = notes;
          newEntity.notes = notes;
          if (typeof registerCampaignFaction === 'function') registerCampaignFaction(name);
        } else if (type === 'resource') {
          newEntity.name = name;
          newEntity.category = role || 'Resource Export / Supply Anchor';
          newEntity.specs = meta;
          newEntity.notes = notes;
          newEntity.isResource = true;
          newEntity.ownerNpcId = document.getElementById('ee-item-owner') ? (document.getElementById('ee-item-owner').value || null) : null;
          newEntity.possessionMode = document.getElementById('ee-item-possession-mode') ? (document.getElementById('ee-item-possession-mode').value || 'stored') : 'stored';
        } else if (type === 'creature') {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
          newEntity.id = `creature_${slug || Date.now().toString().slice(-6)}`;
          newEntity.name = name;
          newEntity.kind = document.getElementById('ee-creature-kind') ? document.getElementById('ee-creature-kind').value : 'beast';
          newEntity.subtype = document.getElementById('ee-creature-subtype') ? document.getElementById('ee-creature-subtype').value.trim() : '';
          newEntity.size = document.getElementById('ee-creature-size') ? document.getElementById('ee-creature-size').value : 'Medium';
          newEntity.threatTier = document.getElementById('ee-creature-threat-tier') ? (parseInt(document.getElementById('ee-creature-threat-tier').value, 10) || 0) : 2;
          newEntity.summary = notes;
          newEntity.notes = notes;
          newEntity.relativeCapabilities = {
            might: document.getElementById('ee-creature-might') ? (parseInt(document.getElementById('ee-creature-might').value, 10) || 3) : 3,
            agility: document.getElementById('ee-creature-agility') ? (parseInt(document.getElementById('ee-creature-agility').value, 10) || 2) : 2,
            resilience: document.getElementById('ee-creature-resilience') ? (parseInt(document.getElementById('ee-creature-resilience').value, 10) || 3) : 3,
            cunning: document.getElementById('ee-creature-cunning') ? (parseInt(document.getElementById('ee-creature-cunning').value, 10) || 1) : 1,
            awareness: document.getElementById('ee-creature-awareness') ? (parseInt(document.getElementById('ee-creature-awareness').value, 10) || 2) : 2,
            presence: document.getElementById('ee-creature-presence') ? (parseInt(document.getElementById('ee-creature-presence').value, 10) || 2) : 2
          };
          newEntity.senses = { vision: 'standard', special: [], blindspots: '' };
          newEntity.locomotion = { primary: 'walk', secondary: [], terrainAffinities: [] };
          newEntity.defenses = { armorType: 'natural hide', immunities: [], resistances: [], vulnerabilities: [], anatomicalWeakSpots: [] };
          newEntity.disposition = {
            odv: { s: 2, e: 2, c: 2 },
            odvTag: '[2, 2, 2]',
            cvfQuadrant: 'Clan',
            ethologySummary: 'Autonomous Instinct'
          };
          const dreadVal = document.getElementById('ee-creature-dread-index') ? (parseInt(document.getElementById('ee-creature-dread-index').value, 10) || 3) : 3;
          const dreadEff = document.getElementById('ee-creature-dread-effect') ? document.getElementById('ee-creature-dread-effect').value.trim() : 'Corridor transit hazard; parties must stay vigilant.';
          newEntity.gigerenzerBehavior = {
            dreadIndex: dreadVal,
            dreadEffect: dreadEff,
            heuristicProfile: {
              strategy: 'TAKE_THE_BEST',
              cueValidityHierarchy: ['target_in_range', 'threat_detected'],
              stoppingRule: 'Engage the first hostile target encountered.'
            },
            fastAndFrugalTree: {
              id: `tree_${slug || 'creature'}`,
              name: `${name} Instinct`,
              cues: [
                {
                  id: 'cue_1',
                  label: 'Is a hostile target within melee range?',
                  testType: 'boolean_query',
                  targetValue: true,
                  exitDirection: 'yes',
                  exitAction: 'ATTACK',
                  exitLabel: 'Attack aggressively'
                }
              ],
              defaultExit: {
                action: 'STALK',
                label: 'Stalk and circle prey'
              }
            }
          };
          newEntity.signatureActions = [];
          newEntity.psychologyAndFolklore = {
            instinctiveQuirks: [],
            primaryDrive: 'territory_defense',
            moraleThreshold: 'normal',
            spoorAndSigns: [],
            vocalizations: [],
            vernacularFolklore: []
          };
          newEntity.harvest = { harvestYields: [], domesticationProfile: 'untameable' };
          newEntity.stationing = {
            mode: nodeId != null ? 'lair' : 'unassigned',
            nodeId: nodeId,
            edgeKey: null,
            roamingScope: document.getElementById('ee-creature-roaming-scope') ? (document.getElementById('ee-creature-roaming-scope').value || 'stationary_lair') : 'stationary_lair'
          };
          newEntity.relationalLinks = {};
          newEntity.isCustom = true;
        } else {
          newEntity.name = name;
          newEntity.category = role;
          newEntity.specs = meta;
          newEntity.notes = notes;
          newEntity.ownerNpcId = document.getElementById('ee-item-owner') ? (document.getElementById('ee-item-owner').value || null) : null;
          newEntity.possessionMode = document.getElementById('ee-item-possession-mode') ? (document.getElementById('ee-item-possession-mode').value || 'stored') : 'stored';
        }
        backingList.push(newEntity);
      }

      saveActiveCampaign();
      closeModal('modal-entity-edit');
      renderCanvas();
      updatePropertiesGrid();
      renderEntityManagerTree();
      renderEntityManagerList();
      setStatusBarMessage(`Saved ${type.toUpperCase()}: "${name}".`);
    }

    function openCreateEdgeModal(defaultSrcId = null, defaultTgtId = null, defaultType = 'road') {
      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) {
        alert('No active topology nodes available to connect.');
        return;
      }
      const nodeKeys = Object.keys(topo.nodes);
      if (nodeKeys.length < 2) {
        alert('At least two nodes are required to create a corridor connection.');
        return;
      }

      const srcSelect = document.getElementById('edge-create-src');
      const tgtSelect = document.getElementById('edge-create-tgt');
      const typeSelect = document.getElementById('edge-create-type');
      if (!srcSelect || !tgtSelect || !typeSelect) return;

      srcSelect.innerHTML = '';
      tgtSelect.innerHTML = '';

      nodeKeys.forEach((k, idx) => {
        const n = topo.nodes[k];
        const label = `#${k}: ${n.name || 'Node ' + k}`;
        const opt1 = document.createElement('option');
        opt1.value = k;
        opt1.textContent = label;
        if (defaultSrcId && String(defaultSrcId) === String(k)) opt1.selected = true;
        else if (!defaultSrcId && idx === 0) opt1.selected = true;
        srcSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = k;
        opt2.textContent = label;
        if (defaultTgtId && String(defaultTgtId) === String(k)) opt2.selected = true;
        else if (!defaultTgtId && idx === 1) opt2.selected = true;
        tgtSelect.appendChild(opt2);
      });

      typeSelect.value = defaultType || 'road';
      openModal('modal-edge-create');
    }
    window.openCreateEdgeModal = openCreateEdgeModal;

    function submitCreateEdgeModal() {
      const srcSelect = document.getElementById('edge-create-src');
      const tgtSelect = document.getElementById('edge-create-tgt');
      const typeSelect = document.getElementById('edge-create-type');
      if (!srcSelect || !tgtSelect || !typeSelect) return;

      const srcId = srcSelect.value;
      const tgtId = tgtSelect.value;
      const edgeType = typeSelect.value || 'road';

      if (!srcId || !tgtId) {
        alert('Please select both a start node and an end node.');
        return;
      }
      if (String(srcId) === String(tgtId)) {
        alert('Cannot create a self-loop. Start and end nodes must be distinct.');
        return;
      }

      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) return;
      const u = topo.nodes[String(srcId)];
      const v = topo.nodes[String(tgtId)];
      if (!u || !v) {
        alert('One or both selected endpoint nodes could not be found.');
        return;
      }

      if (edgeType === 'road') {
        if (u.adj && u.adj.some(id => String(id) === String(tgtId))) {
          alert(`A transit road already exists between Node ${srcId} and Node ${tgtId}.`);
          return;
        }
      } else if (edgeType === 'hegemony') {
        if (v.infBy && v.infBy.some(id => String(id) === String(srcId))) {
          alert(`A hegemony vector from Node ${srcId} to Node ${tgtId} already exists.`);
          return;
        }
      }

      if (typeof createEdge === 'function') {
        createEdge(srcId, tgtId, edgeType);
      }
      closeModal('modal-edge-create');

      const pairKey = [String(srcId), String(tgtId)].sort().join('-');
      const canonicalKey = (edgeType === 'hegemony') ? `${srcId}->${tgtId}` : pairKey;

      if (typeof renderEntityManagerTree === 'function') renderEntityManagerTree();
      if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
      if (typeof selectEntityItem === 'function') selectEntityItem(canonicalKey, false);
      setStatusBarMessage(`Connected ${edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road'} between Node ${srcId} and Node ${tgtId}.`);
    }
    window.submitCreateEdgeModal = submitCreateEdgeModal;
