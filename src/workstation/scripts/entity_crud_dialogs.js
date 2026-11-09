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

      // 2. Linked NPCs (including Quest Giver & Quest Target)
      const allLinkedNpcIds = Array.from(new Set([...(quest.npcIds || []), quest.giverNpcId, quest.targetNpcId].filter(Boolean)));
      allLinkedNpcIds.forEach(nId => {
        const npc = campaignNpcs.find(n => String(n.id) === String(nId));
        if (npc && npc.nodeId != null && npc.nodeId !== '') {
          const key = String(npc.nodeId);
          let roleLabel = npc.role || 'Resident';
          if (quest.giverNpcId && String(quest.giverNpcId) === String(npc.id)) {
            roleLabel = 'Quest Giver';
          } else if (quest.targetNpcId && String(quest.targetNpcId) === String(npc.id)) {
            roleLabel = 'Quest Target';
          }
          if (nodeMap.has(key)) {
            nodeMap.get(key).reasons.push(`NPC: ${npc.name} (${roleLabel})`);
          } else {
            const info = resolveNodeInfo(npc.nodeId);
            nodeMap.set(key, {
              ...info,
              role: 'NPC Location',
              reasons: [`NPC: ${npc.name} (${roleLabel})`]
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
      const giverVal = document.getElementById('ee-quest-giver') ? document.getElementById('ee-quest-giver').value : '';
      const targetVal = document.getElementById('ee-quest-target') ? document.getElementById('ee-quest-target').value : '';

      const previewBox = document.getElementById('ee-quest-spanning-nodes-text');
      if (!previewBox) return;

      const entries = [];
      const uniqueNodes = new Set();
      if (mainNodeId) {
        const nodeObj = topo.nodes && (topo.nodes[mainNodeId] || topo.nodes[String(mainNodeId)]);
        entries.push(`<strong>Anchor:</strong> Node ${mainNodeId}${nodeObj ? ' (' + nodeObj.name + ')' : ''}`);
        uniqueNodes.add(String(mainNodeId));
      }

      if (giverVal) {
        const gNpc = allNpcs.find(n => String(n.id) === String(giverVal));
        if (gNpc) {
          entries.push(`<strong>Quest Giver:</strong> ${gNpc.name} @ Node ${gNpc.nodeId != null ? gNpc.nodeId : 'Unassigned'}`);
          if (gNpc.nodeId != null) uniqueNodes.add(String(gNpc.nodeId));
        }
      }

      if (targetVal) {
        const tNpc = allNpcs.find(n => String(n.id) === String(targetVal));
        if (tNpc) {
          entries.push(`<strong>Quest Target:</strong> ${tNpc.name} @ Node ${tNpc.nodeId != null ? tNpc.nodeId : 'Unassigned'}`);
          if (tNpc.nodeId != null) uniqueNodes.add(String(tNpc.nodeId));
        }
      }

      checkedNpcIds.forEach(nId => {
        if (nId === giverVal || nId === targetVal) return;
        const npc = allNpcs.find(n => n.id === nId);
        if (npc) {
          entries.push(`<strong>NPC:</strong> ${npc.name} @ Node ${npc.nodeId != null ? npc.nodeId : 'Unassigned'}`);
          if (npc.nodeId != null) uniqueNodes.add(String(npc.nodeId));
        }
      });

      checkedItemIds.forEach(iId => {
        const item = allItems.find(i => i.id === iId);
        if (item) {
          entries.push(`<strong>Item:</strong> ${item.name} @ Node ${item.nodeId != null ? item.nodeId : 'Unassigned'}`);
          if (item.nodeId != null) uniqueNodes.add(String(item.nodeId));
        }
      });

      checkedTrackerIds.forEach(tId => {
        const trk = allTrackers.find(t => t.id === tId);
        if (trk) {
          entries.push(`<strong>Clock:</strong> ${trk.name} @ Node ${trk.nodeId != null ? trk.nodeId : 'Unassigned'}`);
          if (trk.nodeId != null) uniqueNodes.add(String(trk.nodeId));
        }
      });

      if (entries.length === 0) {
        previewBox.innerHTML = '<span style="color:#777; font-style:italic;">(Select an anchor node, NPCs, items, or clocks to calculate quest footprint)</span>';
      } else {
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
        if (typeof refreshEntityManager === 'function') {
          refreshEntityManager({ selectId: nextId });
        } else {
          renderEntityManagerTree();
          renderEntityManagerList();
          selectEntityItem(nextId, false);
        }
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

          // Populate Quest Giver and Quest Target dropdowns
          const giverSel = document.getElementById('ee-quest-giver');
          const targetSel = document.getElementById('ee-quest-target');
          const allNpcsForQuest = (Workstation.activeTopology && Workstation.activeTopology.npcs) || [];
          let npcSelectOpts = '<option value="">-- None / Unassigned --</option>';
          allNpcsForQuest.forEach(n => {
            npcSelectOpts += `<option value="${n.id}">👤 ${n.name} (${n.role || 'Resident'})</option>`;
          });
          if (giverSel) {
            giverSel.innerHTML = npcSelectOpts;
            giverSel.value = '';
            giverSel.onchange = updateQuestSpanningPreview;
          }
          if (targetSel) {
            targetSel.innerHTML = npcSelectOpts;
            targetSel.value = '';
            targetSel.onchange = updateQuestSpanningPreview;
          }

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
      document.getElementById('ee-meta').value = (CurrentEntityTab === 'tracker')
        ? (entity.maxTicks || 6)
        : (CurrentEntityTab === 'quest'
            ? (entity.threat || entity.stakes || entity.faction || '')
            : (entity.faction || entity.threat || entity.specs || (CurrentEntityTab === 'creature' ? (entity.size || 'Medium') : '')));
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
        if (document.getElementById('ee-quest-giver')) {
          document.getElementById('ee-quest-giver').value = entity.giverNpcId || '';
        }
        if (document.getElementById('ee-quest-target')) {
          document.getElementById('ee-quest-target').value = entity.targetNpcId || '';
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
            entity.name = name;
            entity.type = role;
            entity.category = role;
            entity.threat = meta;
            entity.notes = notes;
            entity.motivation = notes;
            if (document.getElementById('ee-quest-status')) {
              entity.status = document.getElementById('ee-quest-status').value || 'Active';
            } else if (!entity.status) {
              entity.status = 'Active';
            }
            const giverVal = document.getElementById('ee-quest-giver') ? document.getElementById('ee-quest-giver').value : '';
            const targetVal = document.getElementById('ee-quest-target') ? document.getElementById('ee-quest-target').value : '';
            entity.giverNpcId = giverVal || null;
            entity.targetNpcId = targetVal || null;
            const chosenNpcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
            if (entity.giverNpcId && !chosenNpcIds.includes(entity.giverNpcId)) chosenNpcIds.push(entity.giverNpcId);
            if (entity.targetNpcId && !chosenNpcIds.includes(entity.targetNpcId)) chosenNpcIds.push(entity.targetNpcId);
            entity.npcIds = chosenNpcIds;
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
          newEntity.name = name;
          newEntity.type = role;
          newEntity.category = role;
          newEntity.threat = meta;
          newEntity.notes = notes;
          newEntity.motivation = notes;
          newEntity.status = document.getElementById('ee-quest-status') ? (document.getElementById('ee-quest-status').value || 'Active') : 'Active';
          const giverVal = document.getElementById('ee-quest-giver') ? document.getElementById('ee-quest-giver').value : '';
          const targetVal = document.getElementById('ee-quest-target') ? document.getElementById('ee-quest-target').value : '';
          newEntity.giverNpcId = giverVal || null;
          newEntity.targetNpcId = targetVal || null;
          const chosenNpcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
          if (newEntity.giverNpcId && !chosenNpcIds.includes(newEntity.giverNpcId)) chosenNpcIds.push(newEntity.giverNpcId);
          if (newEntity.targetNpcId && !chosenNpcIds.includes(newEntity.targetNpcId)) chosenNpcIds.push(newEntity.targetNpcId);
          newEntity.npcIds = chosenNpcIds;
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
      if (typeof refreshEntityManager === 'function') {
        refreshEntityManager();
      } else {
        renderEntityManagerTree();
        renderEntityManagerList();
      }
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

      if (typeof refreshEntityManager === 'function') {
        refreshEntityManager({ selectId: canonicalKey });
      } else {
        if (typeof renderEntityManagerTree === 'function') renderEntityManagerTree();
        if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
        if (typeof selectEntityItem === 'function') selectEntityItem(canonicalKey, false);
      }
      setStatusBarMessage(`Connected ${edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road'} between Node ${srcId} and Node ${tgtId}.`);
    }
    window.submitCreateEdgeModal = submitCreateEdgeModal;

    // ========================================================================
    // CROSS-CAMPAIGN ENTITY TRANSPLANT PACKAGE WIZARD & DEPENDENCY ENGINE
    // ========================================================================
    let currentTransplantState = null;

    function getActiveCollectionForType(type, topo) {
      if (!topo) return [];
      if (type === 'npc') { topo.npcs = topo.npcs || []; return topo.npcs; }
      if (type === 'quest') { topo.quests = topo.quests || []; return topo.quests; }
      if (type === 'item') { topo.items = topo.items || []; return topo.items; }
      if (type === 'tracker') { topo.trackers = topo.trackers || []; return topo.trackers; }
      if (type === 'faction') { topo.factions = topo.factions || []; return topo.factions; }
      if (type === 'creature') { topo.creatures = topo.creatures || []; return topo.creatures; }
      if (type === 'resource') { topo.items = topo.items || []; return topo.items; }
      return topo.npcs || [];
    }

    function ensureUniqueEntityId(desiredId, existingList) {
      if (!existingList || !existingList.some(e => String(e.id) === String(desiredId))) {
        return desiredId;
      }
      let counter = 1;
      let candidate = `${desiredId}_imported`;
      while (existingList.some(e => String(e.id) === String(candidate))) {
        counter++;
        candidate = `${desiredId}_imported_${counter}`;
      }
      return candidate;
    }

    /**
     * Inspects an external entity and resolves all its outbound dependencies from the sourcePool.
     */
    function analyzeTransplantDependencies(entity, entityType, sourcePool) {
      if (!entity || !sourcePool) return [];
      const deps = [];
      const seen = new Set();

      function addDep(depEntity, type, role) {
        if (!depEntity || !depEntity.id) return;
        const key = `${type}::${depEntity.id}`;
        if (seen.has(key)) return;
        seen.add(key);
        deps.push({
          id: depEntity.id,
          type: type,
          name: depEntity.name || depEntity.title || depEntity.id,
          role: role,
          entity: depEntity,
          action: 'copy'
        });
      }

      const poolNpcs = Array.isArray(sourcePool.npcs) ? sourcePool.npcs : [];
      const poolItems = Array.isArray(sourcePool.items) ? sourcePool.items : [];
      const poolQuests = Array.isArray(sourcePool.quests) ? sourcePool.quests : [];
      const poolTrackers = Array.isArray(sourcePool.trackers) ? sourcePool.trackers : [];
      const poolFactions = Array.isArray(sourcePool.factions) ? sourcePool.factions : [];

      if (entityType === 'quest') {
        // Giver NPC
        if (entity.giverNpcId) {
          const giver = poolNpcs.find(n => String(n.id) === String(entity.giverNpcId));
          if (giver) addDep(giver, 'npc', 'Quest Giver');
        }
        // Target NPC
        if (entity.targetNpcId) {
          const tgt = poolNpcs.find(n => String(n.id) === String(entity.targetNpcId));
          if (tgt) addDep(tgt, 'npc', 'Quest Target');
        }
        // Cast NPCs
        if (Array.isArray(entity.npcIds)) {
          entity.npcIds.forEach(nid => {
            const castNpc = poolNpcs.find(n => String(n.id) === String(nid));
            if (castNpc) addDep(castNpc, 'npc', 'Associated Cast');
          });
        }
        // Required / Reward Items
        if (Array.isArray(entity.itemIds)) {
          entity.itemIds.forEach(iid => {
            const itm = poolItems.find(i => String(i.id) === String(iid));
            if (itm) addDep(itm, 'item', 'Required / Reward Relic');
          });
        }
        // Clocks & Trackers
        const trkIds = entity.trackerIds || entity.threatClockIds || [];
        if (Array.isArray(trkIds)) {
          trkIds.forEach(tid => {
            const trk = poolTrackers.find(t => String(t.id) === String(tid));
            if (trk) addDep(trk, 'tracker', 'Linked Threat Clock');
          });
        }
        if (Array.isArray(entity.steps)) {
          entity.steps.forEach(st => {
            const stTrkId = st.triggerTrackerId || st.clockId;
            if (stTrkId) {
              const trk = poolTrackers.find(t => String(t.id) === String(stTrkId));
              if (trk) addDep(trk, 'tracker', 'Step Trigger Clock');
            }
          });
        }
      } else if (entityType === 'npc') {
        // Inter-NPC Relationships
        if (Array.isArray(entity.relationships)) {
          entity.relationships.forEach(r => {
            if (r.targetNpcId) {
              const relTarget = poolNpcs.find(n => String(n.id) === String(r.targetNpcId));
              if (relTarget) addDep(relTarget, 'npc', `Social Tie (${r.relationshipType || r.relationship || r.type || 'Connected'})`);
            }
          });
        }
        // Affiliated Faction
        if (entity.factionId) {
          const fac = poolFactions.find(f => String(f.id) === String(entity.factionId));
          if (fac) addDep(fac, 'faction', 'Affiliated Faction');
        }
        // Owned & Carried Items
        poolItems.filter(i => String(i.ownerNpcId) === String(entity.id)).forEach(itm => {
          addDep(itm, 'item', itm.possessionMode === 'carried' ? 'Equipped / Carried Item' : 'Owned Depot Item');
        });
      } else if (entityType === 'item' || entityType === 'resource') {
        // Owning NPC
        if (entity.ownerNpcId) {
          const owner = poolNpcs.find(n => String(n.id) === String(entity.ownerNpcId));
          if (owner) addDep(owner, 'npc', 'Owning Character');
        }
      } else if (entityType === 'faction') {
        // Leader NPC
        if (entity.leaderNpcId) {
          const leader = poolNpcs.find(n => String(n.id) === String(entity.leaderNpcId));
          if (leader) addDep(leader, 'npc', 'Faction Leader / Spokesperson');
        }
        // Member NPCs
        poolNpcs.filter(n => n.factionId === entity.id || n.faction === entity.name).forEach(mem => {
          addDep(mem, 'npc', 'Member Character');
        });
      }

      return deps;
    }
    window.analyzeTransplantDependencies = analyzeTransplantDependencies;

    function openTransplantPackageModal(externalKey, explicitType) {
      if (typeof CrossCampaignService === 'undefined') {
        alert('CrossCampaignService is not initialized.');
        return;
      }
      const resolved = CrossCampaignService.resolveExternalEntity(externalKey, explicitType);
      if (!resolved || !resolved.entity) {
        alert(`Could not resolve external entity: ${externalKey}`);
        return;
      }

      const { entity, sourcePool, sourceId } = resolved;
      const type = resolved.type || explicitType || 'quest';
      const deps = analyzeTransplantDependencies(entity, type, sourcePool);

      currentTransplantState = {
        primaryKey: externalKey,
        primaryType: type,
        primaryEntity: entity,
        sourceId: sourceId,
        sourcePool: sourcePool,
        dependencies: deps
      };

      // Populate Header Summary
      const nameEl = document.getElementById('tp-primary-name');
      const metaEl = document.getElementById('tp-primary-meta');
      const typeIcons = { quest: '📜', npc: '👤', item: '💎', tracker: '⏱️', faction: '👑', creature: '🐉', resource: '📦' };
      const icon = typeIcons[type] || '📦';

      if (nameEl) nameEl.textContent = `${icon} ${entity.title || entity.name || entity.id}`;
      if (metaEl) {
        metaEl.textContent = `Type: ${type.toUpperCase()} • Source: ${sourcePool.name || sourceId} • Original Node: ${entity._originalNodeName || entity._originalNodeId || 'Unstationed'}`;
      }

      // Populate Target Node Dropdown
      const nodeSelect = document.getElementById('tp-target-node');
      if (nodeSelect) {
        nodeSelect.innerHTML = '<option value="">(Unstationed / Nomadic)</option>';
        const topo = Workstation.activeTopology || {};
        const nodesObj = topo.nodes || {};
        const nodeIds = Object.keys(nodesObj);
        nodeIds.sort((a, b) => {
          const numA = Number(a), numB = Number(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return String(a).localeCompare(String(b));
        });
        nodeIds.forEach(nid => {
          const n = nodesObj[nid];
          const nName = n ? (n.displayName || n.name || `Node ${nid}`) : `Node ${nid}`;
          const opt = document.createElement('option');
          opt.value = nid;
          opt.textContent = `📍 #${nid}: ${nName} (${n ? (n.culture || 'Adhocracy') : ''})`;
          nodeSelect.appendChild(opt);
        });
      }

      // Populate Dependencies Table
      const countEl = document.getElementById('tp-deps-count');
      if (countEl) countEl.textContent = `Found ${deps.length} ${deps.length === 1 ? 'dependency' : 'dependencies'}`;

      const tbody = document.getElementById('tp-deps-table-body');
      if (tbody) {
        tbody.innerHTML = '';
        if (deps.length === 0) {
          const emptyTr = document.createElement('tr');
          emptyTr.innerHTML = `
            <td colspan="3" style="text-align:center; padding:15px; color:#64748b; font-style:italic;">
              No outbound dependencies found. This entity can be transplanted cleanly into the active campaign.
            </td>
          `;
          tbody.appendChild(emptyTr);
        } else {
          const topo = Workstation.activeTopology || {};
          deps.forEach((dep, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';

            const activeCandidates = getActiveCollectionForType(dep.type, topo);
            let candidateOptionsHtml = '';
            if (activeCandidates.length === 0) {
              candidateOptionsHtml = `<option value="">(No active ${dep.type}s exist in campaign)</option>`;
            } else {
              candidateOptionsHtml = activeCandidates.map(c => `
                <option value="${escapeJsArg(c.id)}">${escapeHtml(c.name || c.title || c.id)} [${escapeHtml(c.id)}]</option>
              `).join('');
            }

            const depIcon = typeIcons[dep.type] || '📦';
            tr.innerHTML = `
              <td style="padding:4px 6px; vertical-align:top;">
                <div style="font-weight:bold; color:#000080;">${depIcon} ${escapeHtml(dep.name)}</div>
                <div style="font-size:8.5px; color:#64748b;">ID: ${escapeHtml(dep.id)} &bull; ${dep.type.toUpperCase()}</div>
              </td>
              <td style="padding:4px 6px; vertical-align:top;">
                <span class="entity-badge-tag" style="background:#f1f5f9; color:#334155; font-size:9px;">${escapeHtml(dep.role)}</span>
              </td>
              <td style="padding:4px 6px; vertical-align:top;">
                <select class="win-select-input tp-action-select" data-dep-idx="${idx}" onchange="window.updateTransplantDepRow(this, ${idx})" style="width:100%; font-size:9.5px; margin-bottom:2px;">
                  <option value="copy" selected>📥 Copy as New Entity to Active Campaign</option>
                  <option value="reassign">🔄 Reassign to Active Entity...</option>
                  <option value="omit">❌ Omit / Sever Reference</option>
                </select>
                <div id="tp-reassign-container-${idx}" style="display:none; margin-top:2px; background:#eff6ff; padding:3px 4px; border:1px solid #bfdbfe; border-radius:2px;">
                  <div style="font-size:8.5px; font-weight:bold; color:#1e40af; margin-bottom:1px;">Select Target Active Entity:</div>
                  <select class="win-select-input tp-reassign-target" data-dep-idx="${idx}" style="width:100%; font-size:9.5px;">
                    ${candidateOptionsHtml}
                  </select>
                </div>
              </td>
            `;
            tbody.appendChild(tr);
          });
        }
      }

      const modal = document.getElementById('modal-transplant-package');
      if (modal) modal.classList.remove('hidden');
    }
    window.openTransplantPackageModal = openTransplantPackageModal;

    function closeTransplantPackageModal() {
      const modal = document.getElementById('modal-transplant-package');
      if (modal) modal.classList.add('hidden');
      currentTransplantState = null;
    }
    window.closeTransplantPackageModal = closeTransplantPackageModal;

    function updateTransplantDepRow(selectEl, idx) {
      const action = selectEl.value;
      const container = document.getElementById(`tp-reassign-container-${idx}`);
      if (container) {
        container.style.display = (action === 'reassign') ? 'block' : 'none';
      }
      if (currentTransplantState && currentTransplantState.dependencies[idx]) {
        currentTransplantState.dependencies[idx].action = action;
      }
    }
    window.updateTransplantDepRow = updateTransplantDepRow;

    function executeTransplantPackage() {
      if (!currentTransplantState) {
        alert('No active transplant package configured.');
        return;
      }

      const topo = Workstation.activeTopology;
      if (!topo) {
        alert('No active campaign topology loaded.');
        return;
      }

      const idStrategy = (document.getElementById('tp-id-strategy') && document.getElementById('tp-id-strategy').value) || 'auto_unique';
      const targetNodeId = (document.getElementById('tp-target-node') && document.getElementById('tp-target-node').value) || null;

      const idMap = {};
      let copiedCount = 0;

      // 1. Process Dependencies
      const deps = currentTransplantState.dependencies || [];
      for (let idx = 0; idx < deps.length; idx++) {
        const dep = deps[idx];
        const actionSelect = document.querySelector(`.tp-action-select[data-dep-idx="${idx}"]`);
        const action = actionSelect ? actionSelect.value : dep.action;

        if (action === 'copy') {
          const activeColl = getActiveCollectionForType(dep.type, topo);
          let targetId = dep.id;

          if (idStrategy === 'auto_unique') {
            targetId = ensureUniqueEntityId(dep.id, activeColl);
          } else if (idStrategy === 'preserve_strict') {
            if (activeColl.some(e => String(e.id) === String(dep.id))) {
              alert(`Transplant Aborted: Entity ID collision on dependency ${dep.id} under strict preservation.`);
              return;
            }
          } else if (idStrategy === 'overwrite_if_exists') {
            const existingIdx = activeColl.findIndex(e => String(e.id) === String(dep.id));
            if (existingIdx !== -1) activeColl.splice(existingIdx, 1);
          }

          const clonedDep = JSON.parse(JSON.stringify(dep.entity));
          delete clonedDep._isExternal;
          delete clonedDep._sourceCampaignId;
          delete clonedDep._sourceCampaignName;
          delete clonedDep._externalKey;
          delete clonedDep._originalNodeId;
          delete clonedDep._originalNodeName;

          clonedDep.id = targetId;
          clonedDep.nodeId = targetNodeId;
          if (clonedDep.suggestedNode !== undefined) clonedDep.suggestedNode = targetNodeId;

          idMap[dep.id] = targetId;
          const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);
          if (cme && typeof cme.upsertEntity === 'function') {
            cme.upsertEntity(topo, dep.type, clonedDep);
          } else {
            activeColl.push(clonedDep);
          }
          copiedCount++;
        } else if (action === 'reassign') {
          const reassignSelect = document.querySelector(`.tp-reassign-target[data-dep-idx="${idx}"]`);
          const reassignedId = reassignSelect ? reassignSelect.value : null;
          idMap[dep.id] = reassignedId || null;
        } else if (action === 'omit') {
          idMap[dep.id] = null;
        }
      }

      // 2. Process Primary Entity
      const primaryColl = getActiveCollectionForType(currentTransplantState.primaryType, topo);
      let primaryTargetId = currentTransplantState.primaryEntity.id;

      if (idStrategy === 'auto_unique') {
        primaryTargetId = ensureUniqueEntityId(primaryTargetId, primaryColl);
      } else if (idStrategy === 'preserve_strict') {
        if (primaryColl.some(e => String(e.id) === String(primaryTargetId))) {
          alert(`Transplant Aborted: Entity ID collision on primary entity ${primaryTargetId} under strict preservation.`);
          return;
        }
      } else if (idStrategy === 'overwrite_if_exists') {
        const existingIdx = primaryColl.findIndex(e => String(e.id) === String(primaryTargetId));
        if (existingIdx !== -1) primaryColl.splice(existingIdx, 1);
      }

      const primaryClone = JSON.parse(JSON.stringify(currentTransplantState.primaryEntity));
      delete primaryClone._isExternal;
      delete primaryClone._sourceCampaignId;
      delete primaryClone._sourceCampaignName;
      delete primaryClone._externalKey;
      delete primaryClone._originalNodeId;
      delete primaryClone._originalNodeName;

      primaryClone.id = primaryTargetId;
      primaryClone.nodeId = targetNodeId;
      if (primaryClone.suggestedNode !== undefined) primaryClone.suggestedNode = targetNodeId;
      if (primaryClone.headquartersNodeId !== undefined) primaryClone.headquartersNodeId = targetNodeId;

      // 3. Rewrite Foreign Keys on Primary Entity using idMap
      if (currentTransplantState.primaryType === 'quest') {
        if (primaryClone.giverNpcId && idMap.hasOwnProperty(primaryClone.giverNpcId)) {
          primaryClone.giverNpcId = idMap[primaryClone.giverNpcId];
        }
        if (primaryClone.targetNpcId && idMap.hasOwnProperty(primaryClone.targetNpcId)) {
          primaryClone.targetNpcId = idMap[primaryClone.targetNpcId];
        }
        if (Array.isArray(primaryClone.npcIds)) {
          primaryClone.npcIds = primaryClone.npcIds.map(nid => idMap.hasOwnProperty(nid) ? idMap[nid] : nid).filter(Boolean);
        }
        if (Array.isArray(primaryClone.itemIds)) {
          primaryClone.itemIds = primaryClone.itemIds.map(iid => idMap.hasOwnProperty(iid) ? idMap[iid] : iid).filter(Boolean);
        }
        if (Array.isArray(primaryClone.trackerIds)) {
          primaryClone.trackerIds = primaryClone.trackerIds.map(tid => idMap.hasOwnProperty(tid) ? idMap[tid] : tid).filter(Boolean);
        }
        if (Array.isArray(primaryClone.threatClockIds)) {
          primaryClone.threatClockIds = primaryClone.threatClockIds.map(tid => idMap.hasOwnProperty(tid) ? idMap[tid] : tid).filter(Boolean);
        }
        if (Array.isArray(primaryClone.steps)) {
          primaryClone.steps.forEach(st => {
            if (st.triggerTrackerId && idMap.hasOwnProperty(st.triggerTrackerId)) {
              st.triggerTrackerId = idMap[st.triggerTrackerId];
            }
            if (st.clockId && idMap.hasOwnProperty(st.clockId)) {
              st.clockId = idMap[st.clockId];
            }
          });
        }
      } else if (currentTransplantState.primaryType === 'npc') {
        if (Array.isArray(primaryClone.relationships)) {
          primaryClone.relationships = primaryClone.relationships.map(r => {
            const mapped = idMap.hasOwnProperty(r.targetNpcId) ? idMap[r.targetNpcId] : r.targetNpcId;
            return mapped ? { ...r, targetNpcId: mapped } : null;
          }).filter(Boolean);
        }
        if (primaryClone.factionId && idMap.hasOwnProperty(primaryClone.factionId)) {
          primaryClone.factionId = idMap[primaryClone.factionId];
        }
      } else if (currentTransplantState.primaryType === 'item' || currentTransplantState.primaryType === 'resource') {
        if (primaryClone.ownerNpcId && idMap.hasOwnProperty(primaryClone.ownerNpcId)) {
          primaryClone.ownerNpcId = idMap[primaryClone.ownerNpcId];
        }
      } else if (currentTransplantState.primaryType === 'faction') {
        if (primaryClone.leaderNpcId && idMap.hasOwnProperty(primaryClone.leaderNpcId)) {
          primaryClone.leaderNpcId = idMap[primaryClone.leaderNpcId];
        }
      }

      const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);
      if (cme && typeof cme.upsertEntity === 'function') {
        cme.upsertEntity(topo, currentTransplantState.primaryType, primaryClone);
      } else {
        primaryColl.push(primaryClone);
      }

      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();

      const primaryLabel = primaryClone.title || primaryClone.name || primaryClone.id;
      setStatusBarMessage(`Transplanted ${primaryLabel} and ${copiedCount} dependencies into active campaign.`);

      closeTransplantPackageModal();

      if (typeof refreshEntityManager === 'function') {
        refreshEntityManager({ selectId: primaryClone.id });
      } else {
        if (typeof renderEntityManagerTree === 'function') renderEntityManagerTree();
        if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
        if (typeof selectEntityItem === 'function') selectEntityItem(primaryClone.id);
      }
    }
    window.executeTransplantPackage = executeTransplantPackage;

    window.TransplantService = {
      analyzeTransplantDependencies,
      openTransplantPackageModal,
      closeTransplantPackageModal,
      updateTransplantDepRow,
      executeTransplantPackage
    };
