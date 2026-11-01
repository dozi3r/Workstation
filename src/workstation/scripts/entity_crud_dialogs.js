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

      const nodeMap = new Map();

      function resolveNodeInfo(nodeId) {
        const nStr = String(nodeId);
        let nObj = topo.nodes && (topo.nodes[nStr] || topo.nodes[nodeId]);
        let mapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        let mapName = (topo && topo.name) || "Active Map";

        if (!nObj) {
          for (const mId of Object.keys(allMaps)) {
            const found = (allMaps[mId].nodes || []).find(n => String(n.id) === nStr);
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

      const checkedNpcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
      const checkedItemIds = Array.from(document.querySelectorAll('.ee-quest-item-cb:checked')).map(cb => cb.value);

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

      if (entries.length === 0) {
        previewBox.innerHTML = '<span style="color:#777; font-style:italic;">(Select an anchor node, NPCs, or items to calculate quest footprint)</span>';
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
      const nodeLabel = document.getElementById('ee-node-label');

      if (npcExt) npcExt.style.display = (type === 'npc') ? 'flex' : 'none';
      if (itemExt) itemExt.style.display = (type === 'item') ? 'flex' : 'none';
      if (questExt) questExt.style.display = (type === 'quest') ? 'flex' : 'none';

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

          updateQuestSpanningPreview();
        }
      } else if (type === 'tracker') {
        document.getElementById('ee-role-label').textContent = 'Clock Type (Threat Clock, Hazard, Dial):';
        document.getElementById('ee-meta-label').textContent = 'Max Ticks / Steps (e.g. 4, 6, 8):';
        document.getElementById('ee-notes-label').textContent = 'Trigger Event, Stakes & Escalation Outcome:';
        if (nodeLabel) nodeLabel.textContent = 'Station to Node:';
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

      modal.classList.remove('hidden');
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
      document.getElementById('ee-role').value = entity.role || entity.category || entity.type || '';
      document.getElementById('ee-meta').value = (CurrentEntityTab === 'tracker') ? (entity.maxTicks || 6) : (entity.faction || entity.threat || entity.specs || '');
      document.getElementById('ee-notes').value = entity.motivation || entity.notes || '';
      document.getElementById('ee-node-select').value = entity.nodeId != null ? String(entity.nodeId) : '';

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
      } else if (CurrentEntityTab === 'item') {
        const ownerSel = document.getElementById('ee-item-owner');
        if (ownerSel) {
          const allNpcs = (Workstation.activeTopology && Workstation.activeTopology.npcs) || [];
          let opts = '<option value="">(None - Unassigned / Public World Relic)</option>';
          allNpcs.forEach(n => {
            opts += `<option value="${n.id}" ${String(entity.ownerNpcId) === String(n.id) ? 'selected' : ''}>👤 ${n.name} (${n.role || 'Resident'})</option>`;
          });
          ownerSel.innerHTML = opts;
          ownerSel.value = entity.ownerNpcId || '';
        }
        const posSel = document.getElementById('ee-item-possession-mode');
        if (posSel) posSel.value = entity.possessionMode || 'stored';
      } else if (CurrentEntityTab === 'quest') {
        const npcIds = Array.isArray(entity.npcIds) ? entity.npcIds : [];
        const itemIds = Array.isArray(entity.itemIds) ? entity.itemIds : [];
        document.querySelectorAll('.ee-quest-npc-cb').forEach(cb => {
          cb.checked = npcIds.includes(cb.value);
        });
        document.querySelectorAll('.ee-quest-item-cb').forEach(cb => {
          cb.checked = itemIds.includes(cb.value);
        });
        updateQuestSpanningPreview();
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
            entity.title = name;
            entity.type = role;
            entity.threat = meta;
            entity.notes = notes;
            entity.npcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
            entity.itemIds = Array.from(document.querySelectorAll('.ee-quest-item-cb:checked')).map(cb => cb.value);
          } else if (type === 'tracker') {
            entity.name = name;
            entity.type = role || 'Threat Clock';
            entity.maxTicks = parseInt(meta) || 6;
            entity.notes = notes;
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
          newEntity.npcIds = Array.from(document.querySelectorAll('.ee-quest-npc-cb:checked')).map(cb => cb.value);
          newEntity.itemIds = Array.from(document.querySelectorAll('.ee-quest-item-cb:checked')).map(cb => cb.value);
        } else if (type === 'tracker') {
          newEntity.name = name;
          newEntity.type = role || 'Threat Clock';
          newEntity.maxTicks = parseInt(meta) || 6;
          newEntity.currentTicks = 0;
          newEntity.faction = 'Custom';
          newEntity.notes = notes;
        } else {
          newEntity.name = name;
          newEntity.category = role;
          newEntity.specs = meta;
          newEntity.notes = notes;
          newEntity.ownerNpcId = document.getElementById('ee-item-owner') ? (document.getElementById('ee-item-owner').value || null) : null;
          newEntity.possessionMode = document.getElementById('ee-item-possession-mode') ? (document.getElementById('ee-item-possession-mode').value || 'stored') : 'stored';
        }
        activeList.push(newEntity);
      }

      saveActiveCampaign();
      closeModal('modal-entity-edit');
      renderCanvas();
      updatePropertiesGrid();
      renderEntityManagerTree();
      renderEntityManagerList();
      setStatusBarMessage(`Saved ${type.toUpperCase()}: "${name}".`);
    }
