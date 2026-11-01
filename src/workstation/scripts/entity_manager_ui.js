    // ========================================================================
    // UNIVERSAL CAMPAIGN ENTITY MANAGER - UI (TREE, LIST & INSPECTOR PANELS)
    // ========================================================================
    function escapeJsArg(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    function getNodesForMapScope(scope = 'all') {
      const topo = Workstation.activeTopology;
      const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
      const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});
      const curMapName = (mapDict[curMapId] && mapDict[curMapId].name) || (topo && topo.name) || "Root Map";

      const getActiveNodes = () => {
        if (!topo || !topo.nodes) return [];
        return Object.keys(topo.nodes).map(k => {
          const n = topo.nodes[k];
          const cleanId = (isNaN(k) || String(k).includes('-')) ? k : parseInt(k);
          return {
            ...n,
            id: cleanId,
            key: k,
            _mapId: curMapId,
            _mapName: curMapName
          };
        });
      };

      if (!scope || scope === 'all' || scope.startsWith('tier:') || scope.startsWith('culture:') || scope.startsWith('has:')) {
        return getActiveNodes();
      }

      if (scope === `map:${curMapId}`) {
        return getActiveNodes();
      }

      if (scope === 'map:all') {
        const allList = [...getActiveNodes()];
        Object.keys(mapDict).forEach(mId => {
          if (mId !== curMapId) {
            const m = mapDict[mId];
            const mName = m.name || mId;
            const rawNodes = m.nodes || [];
            if (Array.isArray(rawNodes)) {
              rawNodes.forEach(n => {
                allList.push({
                  ...n,
                  id: (isNaN(n.id) || String(n.id).includes('-')) ? n.id : parseInt(n.id),
                  key: String(n.id),
                  _mapId: mId,
                  _mapName: mName
                });
              });
            } else if (typeof rawNodes === 'object') {
              Object.keys(rawNodes).forEach(k => {
                allList.push({
                  ...rawNodes[k],
                  id: (isNaN(k) || String(k).includes('-')) ? k : parseInt(k),
                  key: k,
                  _mapId: mId,
                  _mapName: mName
                });
              });
            }
          }
        });
        return allList;
      }

      if (scope.startsWith('map:')) {
        const targetMapId = scope.replace('map:', '');
        const targetMap = mapDict[targetMapId];
        if (!targetMap) return [];
        const mName = targetMap.name || targetMapId;
        const rawNodes = targetMap.nodes || [];
        if (Array.isArray(rawNodes)) {
          return rawNodes.map(n => ({
            ...n,
            id: (isNaN(n.id) || String(n.id).includes('-')) ? n.id : parseInt(n.id),
            key: String(n.id),
            _mapId: targetMapId,
            _mapName: mName
          }));
        } else if (typeof rawNodes === 'object') {
          return Object.keys(rawNodes).map(k => ({
            ...rawNodes[k],
            id: (isNaN(k) || String(k).includes('-')) ? k : parseInt(k),
            key: k,
            _mapId: targetMapId,
            _mapName: mName
          }));
        }
        return [];
      }

      return getActiveNodes();
    }

    async function jumpToNodeMap(mapId, nodeId) {
      if (typeof switchActiveMap === 'function' && mapId) {
        await switchActiveMap(mapId);
      }
      if (typeof selectNode === 'function' && nodeId !== undefined) {
        selectNode(nodeId);
      }
      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(`Navigated to Map [${mapId}] focusing Node #${nodeId}`);
      }
    }
    window.jumpToNodeMap = jumpToNodeMap;

    function openEntityManager(type, selectEntityId) {
      closeAllMenus();
      CurrentEntityTab = type || 'npc';
      SelectedEntityId = selectEntityId || null;
      SelectedEntityFilter = 'all';

      MDIWindowManager.open('modal-entity-manager');

      updateEntityTabButtons();
      renderEntityManagerTree();
      renderEntityManagerList();

      if (SelectedEntityId) {
        selectEntityItem(SelectedEntityId);
      }
    }

    function switchEntityManagerTab(type) {
      CurrentEntityTab = type;
      SelectedEntityId = null;
      SelectedEntityFilter = 'all';
      updateEntityTabButtons();
      renderEntityManagerTree();
      renderEntityManagerList();
      document.getElementById('em-detail-pane').innerHTML = '<div style="font-size:11px; color:#666; text-align:center; margin-top:40px;">Select an item to inspect, edit, or station to a node.</div>';
    }

    function updateEntityTabButtons() {
      ['npc', 'quest', 'item', 'tracker', 'node'].forEach(t => {
        const btn = document.getElementById(`em-tab-${t}`);
        if (btn) {
          if (t === CurrentEntityTab) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        }
      });
      const titleMap = {
        'npc': 'NPC Manager - Character Roster',
        'quest': 'Quest Tracker - Dynamic Dilemmas & Stakes',
        'item': 'Item & Relic Catalog - Hardware & Artifacts',
        'tracker': 'Threat Clocks & Trackers - Escalation Dials',
        'node': 'Node Explorer - Spatial Topology & Hub Roster'
      };
      const newTitle = titleMap[CurrentEntityTab] || 'Campaign Entity Manager';
      document.getElementById('em-dialog-title').textContent = newTitle;
      if (MDIWindowManager.windows['modal-entity-manager']) {
        MDIWindowManager.windows['modal-entity-manager'].title = newTitle;
        MDIWindowManager.renderTaskbar();
      }

      const btnNew = document.getElementById('em-btn-new-entity');
      if (btnNew) {
        if (CurrentEntityTab === 'node') {
          btnNew.textContent = '+ New Node...';
        } else if (CurrentEntityTab === 'tracker') {
          btnNew.textContent = '+ New Tracker...';
        } else {
          btnNew.textContent = `+ New ${CurrentEntityTab.toUpperCase()}...`;
        }
      }
    }


    // --- Entity Hierarchy Tree ---
    function renderEntityManagerTree() {
      const container = document.getElementById('em-tree-container');
      if (!container) return;
      container.innerHTML = '';

      const topo = Workstation.activeTopology;

      if (CurrentEntityTab === 'node') {
        // NODE EXPLORER TREE
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});
        const curMapName = (mapDict[curMapId] && mapDict[curMapId].name) || (topo && topo.name) || "Root Map";

        const activeNodes = getNodesForMapScope('all');
        const allMapsNodes = getNodesForMapScope('map:all');

        // 1. Map Hierarchy & Sub-Maps Scope
        const mapHeader = document.createElement('div');
        mapHeader.style.padding = '4px 6px 2px 6px';
        mapHeader.style.fontSize = '10px';
        mapHeader.style.fontWeight = 'bold';
        mapHeader.style.color = '#555';
        mapHeader.textContent = 'MAP SCOPE & SUBMAPS:';
        container.appendChild(mapHeader);

        addTreeItem(container, `Active Map: ${curMapName} (${activeNodes.length})`, 'all');
        if (Object.keys(mapDict).length > 1) {
          addTreeItem(container, `All Maps Global (${allMapsNodes.length})`, 'map:all');
          Object.keys(mapDict).forEach(mId => {
            const m = mapDict[mId];
            const mName = m.name || mId;
            const count = getNodesForMapScope(`map:${mId}`).length;
            addTreeItem(container, `🌀 ${mName} (${count})`, `map:${mId}`);
          });
        }

        // 2. Node Tiers
        const tierHeader = document.createElement('div');
        tierHeader.style.padding = '8px 6px 2px 6px';
        tierHeader.style.fontSize = '10px';
        tierHeader.style.fontWeight = 'bold';
        tierHeader.style.color = '#555';
        tierHeader.textContent = 'BY NODE TIER:';
        container.appendChild(tierHeader);

        addTreeItem(container, `Apex / Hazards (${activeNodes.filter(n => n.tier === 3).length})`, 'tier:3');
        addTreeItem(container, `Standard Nodes (${activeNodes.filter(n => n.tier === 2).length})`, 'tier:2');
        const t0Count = activeNodes.filter(n => n.tier === 0).length;
        if (t0Count > 0) {
          addTreeItem(container, `Universal T0 (${t0Count})`, 'tier:0');
        }

        // 3. Cultural Quadrants
        const cultHeader = document.createElement('div');
        cultHeader.style.padding = '8px 6px 2px 6px';
        cultHeader.style.fontSize = '10px';
        cultHeader.style.fontWeight = 'bold';
        cultHeader.style.color = '#555';
        cultHeader.textContent = 'BY CULTURAL QUADRANT:';
        container.appendChild(cultHeader);

        ['Clan', 'Adhocracy', 'Market', 'Hierarchy'].forEach(c => {
          const count = activeNodes.filter(n => n.culture === c).length;
          addTreeItem(container, `${c} (${count})`, `culture:${c}`);
        });

        // 4. Topology Activity
        const actHeader = document.createElement('div');
        actHeader.style.padding = '8px 6px 2px 6px';
        actHeader.style.fontSize = '10px';
        actHeader.style.fontWeight = 'bold';
        actHeader.style.color = '#555';
        actHeader.textContent = 'TOPOLOGY ACTIVITY:';
        container.appendChild(actHeader);

        const moddedCount = activeNodes.filter(n => n.modules && n.modules.length > 0).length;
        addTreeItem(container, `With Modules (${moddedCount})`, 'has:modules');

        const entCount = activeNodes.filter(n => {
          return (topo.npcs || []).some(e => String(e.nodeId) === String(n.id)) ||
                 (topo.quests || []).some(e => String(e.nodeId) === String(n.id)) ||
                 (topo.items || []).some(e => String(e.nodeId) === String(n.id)) ||
                 (topo.trackers || []).some(e => String(e.nodeId) === String(n.id));
        }).length;
        addTreeItem(container, `With Entities (${entCount})`, 'has:entities');
        return;
      }

      // ENTITIES (NPCS, QUESTS, ITEMS, TRACKERS) TREE
      const activeList = getActiveEntityList(CurrentEntityTab);
      const protoList = getPrototypesForType(CurrentEntityTab);

      // 1. All Active
      addTreeItem(container, `All Active (${activeList.length})`, 'all');
      addTreeItem(container, `Unassigned (${activeList.filter(e => !e.nodeId).length})`, 'unassigned');

      // 2. By Node Section
      const nodeHeader = document.createElement('div');
      nodeHeader.style.padding = '4px 6px 2px 6px';
      nodeHeader.style.fontSize = '10px';
      nodeHeader.style.fontWeight = 'bold';
      nodeHeader.style.color = '#555';
      nodeHeader.textContent = 'BY NODE STATION:';
      container.appendChild(nodeHeader);

      Object.keys(topo.nodes || {}).forEach(k => {
        const count = activeList.filter(e => String(e.nodeId) === String(k)).length;
        if (count > 0) {
          const n = topo.nodes[k];
          addTreeItem(container, `${n.name || `Node ${k}`} (${count})`, `node:${k}`);
        }
      });

      // 3. By Module Pool Section
      const modHeader = document.createElement('div');
      modHeader.style.padding = '8px 6px 2px 6px';
      modHeader.style.fontSize = '10px';
      modHeader.style.fontWeight = 'bold';
      modHeader.style.color = '#555';
      modHeader.textContent = 'MODULE PROTOTYPES:';
      container.appendChild(modHeader);

      const moduleMap = {};
      protoList.forEach(proto => {
        const modId = proto.moduleId || 'Core';
        if (!moduleMap[modId]) moduleMap[modId] = 0;
        moduleMap[modId]++;
      });

      Object.keys(moduleMap).forEach(modId => {
        addTreeItem(container, `${modId} Pool (${moduleMap[modId]})`, `module:${modId}`);
      });
    }

    function addTreeItem(container, label, filterVal) {
      const div = document.createElement('div');
      div.className = `entity-tree-item ${SelectedEntityFilter === filterVal ? 'active' : ''}`;
      div.textContent = label;
      div.onclick = () => {
        SelectedEntityFilter = filterVal;
        renderEntityManagerTree();
        renderEntityManagerList();
      };
      container.appendChild(div);
    }


    // --- Entity Catalog List Table ---
    function renderEntityManagerList() {
      const thead = document.getElementById('em-table-head');
      const tbody = document.getElementById('em-table-body');
      if (!thead || !tbody) return;
      const searchInput = document.getElementById('em-search-input');
      const searchTerm = (searchInput ? searchInput.value || '' : '').toLowerCase();
      const topo = Workstation.activeTopology;

      thead.innerHTML = '';
      tbody.innerHTML = '';

      if (CurrentEntityTab === 'node') {
        // NODE EXPLORER TABLE
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});
        const isMultiMapScope = SelectedEntityFilter === 'map:all' || SelectedEntityFilter.startsWith('map:');

        thead.innerHTML = `<th style="width:55px;">ID</th>${isMultiMapScope ? '<th style="width:85px;">Map</th>' : ''}<th>Location Name</th><th style="width:90px;">Tier &amp; Role</th><th style="width:75px;">Culture</th><th style="width:80px;">Transit (Roads)</th><th style="width:65px;">Modules</th><th style="width:75px;">Entities</th><th style="width:75px; text-align:center;">Action</th>`;

        const allNodes = getNodesForMapScope(SelectedEntityFilter);
        let displayNodes = allNodes.filter(n => {
          if (SelectedEntityFilter === 'tier:3') return n.tier === 3;
          if (SelectedEntityFilter === 'tier:2') return n.tier === 2;
          if (SelectedEntityFilter === 'tier:0') return n.tier === 0;
          if (SelectedEntityFilter.startsWith('culture:')) return n.culture === SelectedEntityFilter.replace('culture:', '');
          if (SelectedEntityFilter === 'has:modules') return n.modules && n.modules.length > 0;
          if (SelectedEntityFilter === 'has:entities') {
            const mapTopo = (n._mapId && mapDict && mapDict[n._mapId]) ? mapDict[n._mapId] : topo;
            return (mapTopo.npcs || []).some(e => String(e.nodeId) === String(n.id)) ||
                   (mapTopo.quests || []).some(e => String(e.nodeId) === String(n.id)) ||
                   (mapTopo.items || []).some(e => String(e.nodeId) === String(n.id)) ||
                   (mapTopo.trackers || []).some(e => String(e.nodeId) === String(n.id));
          }
          return true;
        });

        if (searchTerm) {
          displayNodes = displayNodes.filter(n => {
            const name = (n.name || '').toLowerCase();
            const cult = (n.culture || '').toLowerCase();
            const idStr = String(n.id).toLowerCase();
            const mName = (n._mapName || '').toLowerCase();
            return name.includes(searchTerm) || cult.includes(searchTerm) || idStr.includes(searchTerm) || mName.includes(searchTerm);
          });
        }

        displayNodes.forEach(node => {
          const tr = document.createElement('tr');
          if (String(SelectedEntityId) === String(node.id)) tr.className = 'selected';

          const roleStr = node.tier === 3
            ? '<span class="me-badge me-badge-crisis">Apex / Hazard</span>'
            : (node.tier === 0 ? '<span class="me-badge" style="background:#475569; color:#fff;">T0 Universal</span>' : '<span class="me-badge">Standard (T2)</span>');
          const modCount = (node.modules && Array.isArray(node.modules)) ? node.modules.length : 0;

          const mapTopo = (node._mapId && mapDict && mapDict[node._mapId]) ? mapDict[node._mapId] : topo;
          const nNpc = (mapTopo.npcs || []).filter(e => String(e.nodeId) === String(node.id)).length;
          const nQst = (mapTopo.quests || []).filter(e => String(e.nodeId) === String(node.id)).length;
          const nItm = (mapTopo.items || []).filter(e => String(e.nodeId) === String(node.id)).length;
          const nTrk = (mapTopo.trackers || []).filter(e => String(e.nodeId) === String(node.id)).length;
          const entTotal = nNpc + nQst + nItm + nTrk;

          const nodeMapId = node._mapId || curMapId;
          const rec = (typeof getRecursiveNodeEntities === "function")
            ? getRecursiveNodeEntities(node.id, nodeMapId)
            : null;
          const recTotal = rec ? (rec.totals.npcs + rec.totals.quests + rec.totals.items + rec.totals.trackers) : entTotal;
          const hasSubmaps = node.childMapId || (rec && rec.totals.submaps > 0);

          const colorDot = node.color ? `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${node.color}; border:1px solid #333; margin-right:4px;" title="AutoCAD Color: ${node.color}"></span>` : '';
          const hiddenBadge = (node.visible === false) ? '<span title="Hidden Fog (Concealed from Players)" style="margin-left:3px; opacity:0.8;">👁️‍🗨️</span>' : '';
          const lockBadge = node.locked ? '<span title="Position Locked" style="margin-left:3px;">🔒</span>' : '';
          const submapBadge = hasSubmaps ? '<span title="Portal Sub-Map Attached" style="margin-left:3px;">🌀</span>' : '';

          const entityDisplay = (recTotal > entTotal) 
            ? `${entTotal} <span style="font-size:9px; color:#1e40af; font-weight:bold;" title="${recTotal} total including nested submaps">(${recTotal}*)</span>`
            : `${entTotal} total`;

          const escapedId = escapeJsArg(node.id);
          const escapedMapId = escapeJsArg(nodeMapId);

          const jumpBtn = (nodeMapId !== curMapId)
            ? `<button class="win-btn" onclick="event.stopPropagation(); jumpToNodeMap('${escapedMapId}', '${escapedId}')" style="font-size:9px; padding:1px 3px; margin-right:2px; font-weight:bold; color:#0f766e;" title="Jump to Sub-Map">Go</button>`
            : '';

          tr.innerHTML = `
            <td><strong>${colorDot}#${node.id}${hiddenBadge}${lockBadge}</strong></td>
            ${isMultiMapScope ? `<td><span class="entity-badge-tag" style="font-size:9px;" title="${node._mapName}">${node._mapName || nodeMapId}</span></td>` : ''}
            <td><strong>${node.name}</strong>${submapBadge}</td>
            <td>${roleStr}</td>
            <td><span class="entity-badge-tag">${node.culture || 'Universal'}</span></td>
            <td>${(node.adj || []).length} corridors</td>
            <td><span class="entity-badge-tag" style="background:${modCount > 0 ? '#1e3a8a; color:#fff;' : '#f0f0f0;'}">M:${modCount}</span></td>
            <td><span class="entity-badge-tag" style="background:${entTotal > 0 || recTotal > 0 ? '#047857; color:#fff;' : '#f0f0f0;'}">${entityDisplay}</span></td>
            <td style="text-align:center; white-space:nowrap;">
              ${jumpBtn}
              <button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('node', '${escapedId}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Node">Del</button>
            </td>
          `;

          tr.onclick = () => selectEntityItem(node.id, false, nodeMapId);
          tbody.appendChild(tr);
        });

        document.getElementById('em-footer-stats').textContent = `Showing ${displayNodes.length} nodes (${SelectedEntityFilter}).`;
        return;
      }

      // ENTITIES (NPCS, QUESTS, ITEMS, TRACKERS) TABLE
      if (CurrentEntityTab === 'npc') {
        thead.innerHTML = '<th style="min-width:130px;">Name</th><th style="min-width:120px;">Role &amp; Status</th><th style="width:75px;">Standing</th><th>Stationed Node</th><th style="width:110px;">Culture / [S,E,C]</th><th>Source</th><th style="width:35px; text-align:center;">Action</th>';
      } else if (CurrentEntityTab === 'quest') {
        thead.innerHTML = '<th>Quest Title</th><th>Type / Stakes</th><th>Stationed Node</th><th>Source</th><th style="width:35px; text-align:center;">Action</th>';
      } else if (CurrentEntityTab === 'tracker') {
        thead.innerHTML = '<th>Threat / Clock Title</th><th style="width:90px;">Type</th><th style="width:95px;">Ticks / Progress</th><th>Stationed Node</th><th>Source / Faction</th><th style="width:35px; text-align:center;">Action</th>';
      } else {
        thead.innerHTML = '<th style="min-width:130px;">Item / Relic Name</th><th>Category</th><th>Owner &amp; Carrier</th><th>Stationed Node</th><th>Source</th><th style="width:35px; text-align:center;">Action</th>';
      }

      let displayList = [];
      const activeList = getActiveEntityList(CurrentEntityTab);
      const protoList = getPrototypesForType(CurrentEntityTab);

      if (SelectedEntityFilter.startsWith('module:')) {
        const modId = SelectedEntityFilter.replace('module:', '');
        displayList = protoList.filter(p => p.moduleId === modId).map(p => {
          const activeInstance = activeList.find(a => a.id === p.id || a.prototypeId === p.id);
          return {
            ...p,
            isPrototype: true,
            inCampaign: !!activeInstance,
            activeNodeId: activeInstance ? (CurrentEntityTab === 'item' ? getItemEffectiveNodeId(activeInstance) : activeInstance.nodeId) : null,
            currentTicks: activeInstance ? activeInstance.currentTicks : p.currentTicks,
            ownerNpcId: activeInstance ? activeInstance.ownerNpcId : p.ownerNpcId,
            possessionMode: activeInstance ? activeInstance.possessionMode : p.possessionMode,
            status: activeInstance ? activeInstance.status : p.status,
            dispositionToParty: activeInstance ? activeInstance.dispositionToParty : p.dispositionToParty
          };
        });
      } else {
        displayList = activeList.filter(item => {
          if (SelectedEntityFilter === 'unassigned') {
            if (CurrentEntityTab === 'item') {
              const effNode = getItemEffectiveNodeId(item);
              return !effNode;
            }
            return !item.nodeId;
          }
          if (SelectedEntityFilter.startsWith('node:')) {
            const nId = SelectedEntityFilter.replace('node:', '');
            if (CurrentEntityTab === 'item') {
              const effNode = getItemEffectiveNodeId(item);
              return String(effNode) === String(nId);
            }
            return String(item.nodeId) === String(nId);
          }
          return true;
        });
      }

      // Filter by search keyword
      if (searchTerm) {
        displayList = displayList.filter(e => {
          const name = (e.name || e.title || '').toLowerCase();
          const role = (e.role || e.category || e.type || '').toLowerCase();
          const mod = (e.moduleId || '').toLowerCase();
          const notes = (e.notes || e.motivation || '').toLowerCase();
          const faction = (e.faction || '').toLowerCase();
          return name.includes(searchTerm) || role.includes(searchTerm) || mod.includes(searchTerm) || notes.includes(searchTerm) || faction.includes(searchTerm);
        });
      }

      displayList.forEach(item => {
        const tr = document.createElement('tr');
        if (SelectedEntityId === item.id) tr.className = 'selected';

        const nameVal = item.name || item.title;
        const roleVal = item.role || item.category || item.type;
        const formatNodeRef = (nid) => {
          if (!nid) return '(Unassigned)';
          return `Node ${nid}`;
        };
        const nodeVal = item.isPrototype ? (item.inCampaign ? `${formatNodeRef(item.activeNodeId)} (In Use)` : '(In Pool)') : formatNodeRef(item.nodeId);
        const srcVal = item.isPrototype ? `Module [${item.moduleId}]` : (item.moduleId ? `Module [${item.moduleId}]` : 'Custom Authored');

        if (CurrentEntityTab === 'npc') {
          const stMap = {
            '2': '<span class="entity-badge-tag" style="background:#2563eb; color:#fff;">🔵 Allied (+2)</span>',
            '1': '<span class="entity-badge-tag" style="background:#16a34a; color:#fff;">🟢 Friendly (+1)</span>',
            '0': '<span class="entity-badge-tag" style="background:#64748b; color:#fff;">⚪ Neutral (0)</span>',
            '-1': '<span class="entity-badge-tag" style="background:#ea580c; color:#fff;">🟠 Unfriendly (-1)</span>',
            '-2': '<span class="entity-badge-tag" style="background:#dc2626; color:#fff;">🔴 Hostile (-2)</span>'
          };
          const standingBadge = stMap[String(item.dispositionToParty !== undefined ? item.dispositionToParty : 0)] || stMap['0'];

          const statusColorMap = {
            'Active': 'background:#047857; color:#fff;',
            'Captured': 'background:#ea580c; color:#fff;',
            'In Hiding': 'background:#7c3aed; color:#fff;',
            'Exiled': 'background:#92400e; color:#fff;',
            'Deceased': 'background:#991b1b; color:#fff;',
            'Missing': 'background:#475569; color:#fff;'
          };
          const stat = item.status || 'Active';
          const statStyle = statusColorMap[stat] || 'background:#047857; color:#fff;';
          const statusBadge = `<span class="entity-badge-tag" style="${statStyle}">${stat}</span>`;

          const odvStr = item.odv ? `[${item.odv.s},${item.odv.e},${item.odv.c}]` : '';
          const cultureStr = item.culture || (odvStr ? 'Custom' : 'Universal');
          const cultBadge = `<span class="entity-badge-tag" style="font-size:9px;">${cultureStr} ${odvStr}</span>`;

          tr.innerHTML = `
            <td><strong>👤 ${nameVal}</strong></td>
            <td><div>${roleVal || '-'}</div><div style="margin-top:2px;">${statusBadge}</div></td>
            <td>${standingBadge}</td>
            <td>${nodeVal}</td>
            <td>${cultBadge}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('npc', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete NPC">Del</button></td>
          `;
        } else if (CurrentEntityTab === 'item') {
          const ownerNpc = (topo.npcs || []).find(n => String(n.id) === String(item.ownerNpcId));
          const isCarried = (item.possessionMode === 'carried' && ownerNpc);
          const ownerBadge = ownerNpc
            ? `<span class="entity-badge-tag" style="${isCarried ? 'background:#0f766e; color:#fff;' : 'background:#475569; color:#fff;'}">${isCarried ? '🎒 ' : '📦 '}${ownerNpc.name}</span>`
            : '<span class="entity-badge-tag" style="background:#f1f5f9; color:#64748b;">(Unowned)</span>';

          const effNodeId = getItemEffectiveNodeId(item);
          const nodeDisplay = effNodeId
            ? (isCarried ? `Node ${effNodeId} <span style="font-size:9px; color:#0f766e; font-weight:bold;">(Carried)</span>` : `Node ${effNodeId}`)
            : '(Unassigned)';

          tr.innerHTML = `
            <td><strong>💎 ${nameVal}</strong></td>
            <td>${roleVal || '-'}</td>
            <td>${ownerBadge}</td>
            <td>${nodeDisplay}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('item', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Item">Del</button></td>
          `;
        } else if (CurrentEntityTab === 'tracker') {
          const curTicks = item.currentTicks || 0;
          const maxTicks = item.maxTicks || 6;
          const gaugeHtml = renderMiniClockGauge(curTicks, maxTicks);
          const isTriggered = curTicks >= maxTicks;

          tr.innerHTML = `
            <td><strong>${nameVal}</strong></td>
            <td><span class="me-badge ${isTriggered ? 'me-badge-crisis' : ''}">${roleVal || 'Threat Clock'}</span></td>
            <td>
              <span class="clock-mini-gauge">${gaugeHtml}</span>
              <strong style="font-size:10px; color:${isTriggered ? '#b91c1c' : '#333'}; margin-left:3px;">${curTicks}/${maxTicks}</strong>
            </td>
            <td>${nodeVal}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('tracker', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Clock">Del</button></td>
          `;
        } else {
          tr.innerHTML = `
            <td><strong>${nameVal}</strong></td>
            <td>${roleVal || '-'}</td>
            <td>${nodeVal}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('${CurrentEntityTab}', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete ${CurrentEntityTab.toUpperCase()}">Del</button></td>
          `;
        }

        tr.onclick = () => selectEntityItem(item.id, item.isPrototype);
        tbody.appendChild(tr);
      });

      document.getElementById('em-footer-stats').textContent = `Showing ${displayList.length} items (${SelectedEntityFilter}).`;
    }

    function renderMiniClockGauge(cur, max) {
      let html = '';
      for (let i = 1; i <= max; i++) {
        const filled = i <= cur;
        html += `<span style="color:${filled ? (cur >= max ? '#dc2626' : '#d97706') : '#ccc'};">${filled ? '■' : '□'}</span>`;
      }
      return html;
    }


    function switchNodeDetailSubtab(subtab) {
      const overviewBtn = document.getElementById('em-subtab-overview');
      const propsBtn = document.getElementById('em-subtab-props');
      const overviewView = document.getElementById('em-node-subtab-overview-view');
      const propsView = document.getElementById('em-node-subtab-props-view');
      if (subtab === 'props') {
        if (overviewBtn) overviewBtn.classList.remove('active');
        if (propsBtn) propsBtn.classList.add('active');
        if (overviewView) overviewView.style.display = 'none';
        if (propsView) propsView.style.display = 'block';
      } else {
        if (overviewBtn) overviewBtn.classList.add('active');
        if (propsBtn) propsBtn.classList.remove('active');
        if (overviewView) overviewView.style.display = 'flex';
        if (propsView) propsView.style.display = 'none';
      }
    }
    window.switchNodeDetailSubtab = switchNodeDetailSubtab;

    // --- Entity Detail & Property Inspector ---
    function selectEntityItem(id, isProto, optMapId = null) {
      SelectedEntityId = id;
      const pane = document.getElementById('em-detail-pane');
      let topo = Workstation.activeTopology;
      const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
      const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});

      if (CurrentEntityTab === 'node') {
        let nodeMapId = optMapId || curMapId;
        let node = (topo && topo.nodes) ? topo.nodes[id.toString()] : null;
        let targetTopo = topo;

        if (!node && mapDict) {
          for (const mId of Object.keys(mapDict)) {
            const m = mapDict[mId];
            const mNodes = m.nodes || {};
            if (Array.isArray(mNodes)) {
              const found = mNodes.find(n => String(n.id) === String(id));
              if (found) {
                node = found;
                nodeMapId = mId;
                targetTopo = m;
                break;
              }
            } else if (mNodes[id.toString()]) {
              node = mNodes[id.toString()];
              nodeMapId = mId;
              targetTopo = m;
              break;
            }
          }
        }
        if (!node) return;

        const escapedId = escapeJsArg(node.id);
        const escapedMapId = escapeJsArg(nodeMapId);

        const modCount = (node.modules && Array.isArray(node.modules)) ? node.modules.length : 0;
        const assignedNpcs = (targetTopo.npcs || []).filter(e => String(e.nodeId) === String(node.id));
        const assignedQuests = (targetTopo.quests || []).filter(e => String(e.nodeId) === String(node.id));
        const assignedItems = (targetTopo.items || []).filter(e => String(e.nodeId) === String(node.id));
        const assignedTrackers = (targetTopo.trackers || []).filter(e => String(e.nodeId) === String(node.id));

        let roadsHtml = (node.adj || []).map(adjId => {
          const adjNode = targetTopo.nodes ? (Array.isArray(targetTopo.nodes) ? targetTopo.nodes.find(x => String(x.id) === String(adjId)) : targetTopo.nodes[adjId.toString()]) : null;
          const adjName = adjNode ? adjNode.name : `Node ${adjId}`;
          return `<button class="win-btn" onclick="selectEntityItem('${escapeJsArg(adjId)}', false, '${escapedMapId}')" style="font-size:10px; padding:2px 5px;">#${adjId}: ${adjName}</button>`;
        }).join(' ') || '<span style="color:#777; font-style:italic;">None</span>';

        let modulesHtml = '<div style="font-size:10px; color:#777; font-style:italic;">No modules currently slotted.</div>';
        if (node.modules && node.modules.length > 0) {
          modulesHtml = node.modules.map(mId => {
            const mObj = (typeof ALL_MODULES !== 'undefined') ? ALL_MODULES.find(x => x.id === mId) : null;
            const mTitle = mObj ? mObj.title : mId;
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #ddd; padding:3px 5px; margin-bottom:3px;">
                <span style="font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><strong>[${mId}]</strong> ${mTitle}</span>
                <button class="win-btn" onclick="openModuleExplorer('${escapeJsArg(mId)}', '${escapedId}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
              </div>
            `;
          }).join('');
        }

        const rec = (typeof getRecursiveNodeEntities === "function") 
          ? getRecursiveNodeEntities(node.id, nodeMapId) 
          : { direct: { npcs: assignedNpcs, quests: assignedQuests, items: assignedItems, trackers: assignedTrackers, submaps: [] }, submaps: [], totals: { npcs: assignedNpcs.length, quests: assignedQuests.length, items: assignedItems.length, trackers: assignedTrackers.length, submaps: 0 } };

        const allMaps = (typeof maps !== "undefined" && maps) ? maps : {};
        const submapOptions = Object.keys(allMaps)
          .filter(mId => mId !== nodeMapId)
          .map(mId => `<option value="${mId}" ${node.childMapId === mId ? 'selected' : ''}>${allMaps[mId].name} (${allMaps[mId].scaleTier || 'region'})</option>`)
          .join('');

        const mapBadge = `<span class="entity-badge-tag" style="background:#1e40af; color:#fff;">Map: ${(mapDict[nodeMapId] && mapDict[nodeMapId].name) || nodeMapId}</span>`;

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:10px; color:#666; font-weight:bold;">POINTCRAWL GRAPH NODE #${node.id}</div>
              ${mapBadge}
            </div>
            <input type="text" class="win-select-input" value="${node.name}" style="font-size:12px; font-weight:bold; width:100%; margin-top:3px;" onchange="updateNodeProp('${escapedId}', 'name', this.value, '${escapedMapId}')">
            <div style="display:flex; gap:3px; margin-top:4px; flex-wrap:wrap;">
              <span class="entity-badge-tag">Coords: (${node.x}, ${node.y})</span>
              ${node.visible === false ? '<span class="entity-badge-tag" style="background:#475569; color:#fff;">👁️‍🗨️ Hidden Fog</span>' : '<span class="entity-badge-tag" style="background:#0f766e; color:#fff;">👁️ Visible</span>'}
              ${node.locked ? '<span class="entity-badge-tag" style="background:#78350f; color:#fff;">🔒 Locked</span>' : ''}
              ${node.color ? `<span class="entity-badge-tag" style="background:${node.color}; color:#000; border:1px solid #333;">CAD Color</span>` : ''}
            </div>
            <!-- Sub-tabs for Detail Pane -->
            <div style="display:flex; gap:3px; margin-top:6px; border-bottom:1px solid #999; padding-bottom:1px;">
              <button id="em-subtab-overview" class="win-btn active" style="font-size:10px; padding:2px 6px;" onclick="switchNodeDetailSubtab('overview')">Telemetry &amp; Links</button>
              <button id="em-subtab-props" class="win-btn" style="font-size:10px; padding:2px 6px;" onclick="switchNodeDetailSubtab('props')">Properties Grid</button>
            </div>
          </div>

          <!-- SUBTAB 1: Overview & Telemetry -->
          <div id="em-node-subtab-overview-view" style="font-size:11px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:calc(100% - 175px); padding-top:4px;">
            <!-- Culture & Tier -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Culture Quadrant:</strong>
                <select class="win-select-input" onchange="updateNodeProp('${escapedId}', 'culture', this.value, '${escapedMapId}')">
                  <option value="Clan" ${node.culture === 'Clan' ? 'selected' : ''}>Clan</option>
                  <option value="Adhocracy" ${node.culture === 'Adhocracy' ? 'selected' : ''}>Adhocracy</option>
                  <option value="Market" ${node.culture === 'Market' ? 'selected' : ''}>Market</option>
                  <option value="Hierarchy" ${node.culture === 'Hierarchy' ? 'selected' : ''}>Hierarchy</option>
                </select>
              </label>

              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Node Tier:</strong>
                <select class="win-select-input" onchange="updateNodeProp('${escapedId}', 'tier', parseInt(this.value), '${escapedMapId}')">
                  <option value="2" ${node.tier === 2 ? 'selected' : ''}>Tier 2: Standard</option>
                  <option value="3" ${node.tier === 3 ? 'selected' : ''}>Tier 3: Apex / Hazard</option>
                  <option value="0" ${node.tier === 0 ? 'selected' : ''}>Tier 0: Universal</option>
                </select>
              </label>
            </div>

            <!-- Visibility & Position Locking -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Visible to Players (Fog):</strong>
                <select class="win-select-input" onchange="updateNodeProp('${escapedId}', 'visible', this.value === 'true', '${escapedMapId}')">
                  <option value="true" ${node.visible !== false ? 'selected' : ''}>True 👁️ (Revealed)</option>
                  <option value="false" ${node.visible === false ? 'selected' : ''}>False 👁️‍🗨️ (Hidden Fog)</option>
                </select>
              </label>

              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Position Locked:</strong>
                <select class="win-select-input" onchange="updateNodeProp('${escapedId}', 'locked', this.value === 'true', '${escapedMapId}')">
                  <option value="false" ${!node.locked ? 'selected' : ''}>False (Movable)</option>
                  <option value="true" ${node.locked ? 'selected' : ''}>True 🔒 (Locked)</option>
                </select>
              </label>
            </div>

            <!-- AutoCAD Color & Shape -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>AutoCAD Node Color:</strong>
                <select class="win-select-input" onchange="updateNodeProp('${escapedId}', 'color', this.value, '${escapedMapId}')">
                  ${(window.AUTOCAD_COLORS || []).map(c => `<option value="${c.val}" ${(node.color || '').toLowerCase() === (c.val || '').toLowerCase() ? 'selected' : ''}>${c.label}</option>`).join('')}
                </select>
              </label>

              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Geometry Shape:</strong>
                <select class="win-select-input" onchange="updateNodeProp('${escapedId}', 'shape', this.value, '${escapedMapId}')">
                  <option value="circle" ${node.shape === 'circle' || !node.shape ? 'selected' : ''}>Circle (Standard)</option>
                  <option value="square" ${node.shape === 'square' ? 'selected' : ''}>Square (Fortress)</option>
                  <option value="triangle" ${node.shape === 'triangle' ? 'selected' : ''}>Triangle (Hazard)</option>
                  <option value="diamond" ${node.shape === 'diamond' ? 'selected' : ''}>Diamond (Checkpoint)</option>
                  <option value="star" ${node.shape === 'star' ? 'selected' : ''}>Star (Major POI)</option>
                  <option value="oval" ${node.shape === 'oval' ? 'selected' : ''}>Oval (Sprawl)</option>
                  <option value="pentagon" ${node.shape === 'pentagon' ? 'selected' : ''}>Pentagon (Citadel)</option>
                </select>
              </label>
            </div>

            <!-- Sub-Map Portal & Radius -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Attached Sub-Map Portal:</strong>
                <select class="win-select-input" onchange="updateNodeProp('${escapedId}', 'childMapId', this.value || null, '${escapedMapId}')">
                  <option value="">(None - Standard POI)</option>
                  ${submapOptions}
                </select>
              </label>

              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Radius (px):</strong>
                <input type="number" class="win-select-input" value="${node.radius || (node.tier === 0 ? 22 : (node.tier === 3 ? 15 : 18))}" min="8" max="64" onchange="updateNodeProp('${escapedId}', 'radius', parseInt(this.value) || 18, '${escapedMapId}')">
              </label>
            </div>

            <!-- Transit Roads -->
            <div>
              <strong>Adjacent Transit Roads (E_adj):</strong>
              <div style="display:flex; gap:3px; flex-wrap:wrap; margin-top:3px;">
                ${roadsHtml}
              </div>
            </div>

            <!-- Slotted Modules -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                <strong>Slotted Worldbuilding Modules (${modCount}):</strong>
                <button class="win-btn" onclick="openModuleExplorer(null, '${escapedId}')" style="font-size:9px; padding:1px 4px;">+ Slot...</button>
              </div>
              ${modulesHtml}
            </div>

            <!-- Stationed Narrative Entities (Direct + Recursive Sub-Maps) -->
            <div style="border-top:1px solid #ddd; padding-top:4px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>Stationed Entities (${rec.totals.npcs + rec.totals.quests + rec.totals.items + rec.totals.trackers} total):</strong>
                ${rec.totals.submaps > 0 ? `<span style="font-size:9px; color:#0f766e; font-weight:bold;">🌀 ${rec.totals.submaps} Sub-Map(s)</span>` : ''}
              </div>

              <!-- Direct Entities -->
              <div style="display:flex; flex-direction:column; gap:2px; margin-top:3px; font-size:10px;">
                ${rec.direct.npcs.map(n => `<div style="cursor:pointer; color:#000080;" onclick="switchEntityManagerTab('npc'); selectEntityItem('${escapeJsArg(n.id)}', false);">&bull; NPC: <strong>${n.name}</strong> (${n.role || 'Resident'})</div>`).join('')}
                ${rec.direct.quests.map(q => `<div style="cursor:pointer; color:#b91c1c;" onclick="switchEntityManagerTab('quest'); selectEntityItem('${escapeJsArg(q.id)}', false);">&bull; Quest: <strong>${q.title || q.name}</strong> [${q.threat || 'Threat'}]</div>`).join('')}
                ${rec.direct.items.map(i => `<div style="cursor:pointer; color:#065f46;" onclick="switchEntityManagerTab('item'); selectEntityItem('${escapeJsArg(i.id)}', false);">&bull; Item: <strong>${i.name}</strong> [${i.category || 'Gear'}]</div>`).join('')}
                ${rec.direct.trackers.map(t => `<div style="cursor:pointer; color:#991b1b;" onclick="switchEntityManagerTab('tracker'); selectEntityItem('${escapeJsArg(t.id)}', false);">&bull; Clock: <strong>${t.name}</strong> (${t.currentTicks || 0}/${t.maxTicks || 6} ticks)</div>`).join('')}
                ${(rec.direct.npcs.length + rec.direct.quests.length + rec.direct.items.length + rec.direct.trackers.length === 0) ? '<span style="color:#777; font-style:italic;">No direct entities stationed here.</span>' : ''}
              </div>

              <!-- Recursive Sub-Map Entities -->
              ${rec.submaps.length > 0 ? `
                <div style="margin-top:6px; background:#f0fdf4; border:1px solid #bbf7d0; padding:4px 6px; border-radius:2px;">
                  <div style="font-size:9px; font-weight:bold; color:#166534; margin-bottom:2px;">RECURSIVE SUB-MAP ENTITIES (${rec.submaps.reduce((acc, sm) => acc + sm.npcs.length + sm.quests.length + sm.items.length + sm.trackers.length, 0)}):</div>
                  <div style="display:flex; flex-direction:column; gap:2px; font-size:9px;">
                    ${rec.submaps.map(sm => {
                      const allSubEnts = [...sm.npcs.map(n => ({ type:'npc', label: `NPC: ${n.name}`, id: n.id })),
                                          ...sm.quests.map(q => ({ type:'quest', label: `Quest: ${q.title || q.name}`, id: q.id })),
                                          ...sm.items.map(i => ({ type:'item', label: `Item: ${i.name}`, id: i.id })),
                                          ...sm.trackers.map(t => ({ type:'tracker', label: `Clock: ${t.name}`, id: t.id }))];
                      if (allSubEnts.length === 0) return '';
                      return `
                        <div style="border-top:1px dashed #cbd5e1; padding-top:2px; margin-top:2px;">
                          <div style="font-weight:bold; color:#0f766e;">🌀 ${sm.mapName} (${sm.scaleTier}):</div>
                          ${allSubEnts.map(se => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:1px 0;">
                              <span>&bull; ${se.label}</span>
                              <button class="win-btn" onclick="jumpToNodeMap('${escapeJsArg(sm.mapId)}', '${escapeJsArg(se.id)}')" style="font-size:8px; padding:1px 3px;">Jump</button>
                            </div>
                          `).join('')}
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- SUBTAB 2: Properties Grid (VB6 Property Table) -->
          <div id="em-node-subtab-props-view" style="display:none; font-size:11px; overflow-y:auto; max-height:calc(100% - 175px); background:#fff; border:1px solid #7f9db9; margin-top:4px; padding:2px;">
            <table class="vb-props-table" style="width:100%; border-collapse:collapse;">
              <tbody id="em-node-props-tbody"></tbody>
            </table>
          </div>

          <!-- Action Footer -->
          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:4px;">
            ${nodeMapId !== curMapId
              ? `<button class="win-btn" onclick="jumpToNodeMap('${escapedMapId}', '${escapedId}')"><strong>🌀 Jump to Sub-Map &amp; Focus on CAD Canvas</strong></button>`
              : `<button class="win-btn" onclick="centerOnNode('${escapedId}')"><strong>🎯 Select &amp; Center on CAD Canvas</strong></button>`
            }
            <div style="display:flex; gap:4px;">
              <button class="win-btn" style="flex:1;" onclick="openNewEntityModal('npc', '${escapedId}')">+ Add NPC</button>
              <button class="win-btn" style="flex:1;" onclick="openNewEntityModal('quest', '${escapedId}')">+ Add Quest</button>
              <button class="win-btn" style="flex:1;" onclick="openNewEntityModal('item', '${escapedId}')">+ Add Item</button>
              <button class="win-btn" style="flex:1;" onclick="openNewEntityModal('tracker', '${escapedId}')">+ Add Clock</button>
            </div>
            <button class="win-btn" style="color:#b91c1c; font-weight:bold; margin-top:2px;" onclick="promptEntityDelete('node', '${escapedId}')">🗑️ Delete Node...</button>
          </div>
        `;

        // Render Property Grid into #em-node-props-tbody
        const propsTbody = document.getElementById('em-node-props-tbody');
        if (propsTbody && typeof renderNodeProperties === 'function') {
          renderNodeProperties(propsTbody, node, targetTopo);
        }

        // Highlight selected row in table
        document.querySelectorAll('#em-table-body tr').forEach(r => r.classList.remove('selected'));
        return;
      }

      // ENTITIES (NPCS, QUESTS, ITEMS, TRACKERS) DETAIL INSPECTOR
      const activeList = getActiveEntityList(CurrentEntityTab);
      const protoList = getPrototypesForType(CurrentEntityTab);

      let entity = activeList.find(e => e.id === id);
      if (!entity) entity = protoList.find(p => p.id === id);
      if (!entity) return;

      const isPrototype = !activeList.some(a => a.id === id || a.prototypeId === id);
      const activeInstance = activeList.find(a => a.id === id || a.prototypeId === id);

      let nodeOptions = '<option value="">(Unassigned / In Pool)</option>';
      const currentStationId = activeInstance ? activeInstance.nodeId : (entity.suggestedNode || entity.nodeId);

      if (typeof maps !== "undefined" && Object.keys(maps).length > 1) {
        Object.keys(maps).forEach(mId => {
          const m = maps[mId];
          const isCur = (mId === (typeof activeMapId !== "undefined" ? activeMapId : "map_root"));
          const mapNodes = isCur ? (topo.nodes ? Object.values(topo.nodes) : (m.nodes || [])) : (m.nodes || []);
          if (mapNodes.length > 0) {
            nodeOptions += `<optgroup label="${m.name} [${(m.scaleTier || 'region').toUpperCase()}]">`;
            mapNodes.forEach(n => {
              const nid = n.id;
              const selected = (String(currentStationId) === String(nid)) ? 'selected' : '';
              nodeOptions += `<option value="${nid}" ${selected}>Node ${nid}: ${n.name}</option>`;
            });
            nodeOptions += `</optgroup>`;
          }
        });
      } else {
        Object.keys(topo.nodes || {}).forEach(k => {
          const n = topo.nodes[k];
          const selected = (String(currentStationId) === String(k)) ? 'selected' : '';
          nodeOptions += `<option value="${k}" ${selected}>Node ${k}: ${n.name}</option>`;
        });
      }

      if (CurrentEntityTab === 'tracker') {
        const curTicks = activeInstance ? (activeInstance.currentTicks || 0) : (entity.currentTicks || 0);
        const maxTicks = entity.maxTicks || (entity.type === 'Output Dial' ? 4 : 6);
        const isTriggered = curTicks >= maxTicks;
        const isDial = entity.type === 'Output Dial';

        let tickTrackHtml = '';
        for (let i = 1; i <= maxTicks; i++) {
          const filled = i <= curTicks;
          tickTrackHtml += `<div class="clock-tick-box ${filled ? (isTriggered ? 'filled' : 'filled-warning') : ''}">${i}</div>`;
        }

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <h3 style="font-size:13px; color:#b91c1c; margin-bottom:2px;">${entity.name || entity.title}</h3>
            <span class="entity-badge-tag">${entity.moduleId ? `Module: ${entity.moduleId}` : 'Custom Authored'}</span>
            <span class="entity-badge-tag" style="background:${isTriggered ? '#fee2e2; color:#b91c1c; border-color:#ef4444;' : '#dbeafe; color:#1e40af;'}">${isTriggered ? '⚠️ CRISIS TRIGGERED' : (isPrototype ? 'Available Prototype' : 'Active in Campaign')}</span>
          </div>

          <div style="font-size:11px; display:flex; flex-direction:column; gap:6px;">
            <!-- Interactive Visual Gauge -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                <strong>${isDial ? 'Severity Output Level:' : 'Escalation Progress Track:'}</strong>
                <strong style="color:${isTriggered ? '#b91c1c' : '#000080'};">${curTicks} / ${maxTicks} ${isDial ? 'Levels' : 'Ticks'} (${Math.round((curTicks / maxTicks) * 100)}%)</strong>
              </div>
              <div class="clock-tick-track bevel-thin-inset">
                ${tickTrackHtml}
              </div>
            </div>

            <!-- Dial or Clock Step Controls -->
            ${isDial ? `
              <div style="display:flex; flex-direction:column; gap:3px;">
                <strong>Dynamic Severity Dial (Levels 1 to 4):</strong>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
                  <button class="win-btn ${curTicks === 1 ? 'active' : ''}" style="${curTicks === 1 ? 'background:#dbeafe; font-weight:bold; border-color:#2563eb;' : ''}" onclick="setTrackerDialLevel('${entity.id}', 1, ${isPrototype})">Lvl 1: Light</button>
                  <button class="win-btn ${curTicks === 2 ? 'active' : ''}" style="${curTicks === 2 ? 'background:#fef3c7; font-weight:bold; border-color:#d97706;' : ''}" onclick="setTrackerDialLevel('${entity.id}', 2, ${isPrototype})">Lvl 2: Moderate</button>
                  <button class="win-btn ${curTicks === 3 ? 'active' : ''}" style="${curTicks === 3 ? 'background:#ffedd5; font-weight:bold; border-color:#ea580c;' : ''}" onclick="setTrackerDialLevel('${entity.id}', 3, ${isPrototype})">Lvl 3: Severe</button>
                  <button class="win-btn ${curTicks === 4 ? 'active' : ''}" style="${curTicks === 4 ? 'background:#fee2e2; font-weight:bold; border-color:#dc2626; color:#991b1b;' : ''}" onclick="setTrackerDialLevel('${entity.id}', 4, ${isPrototype})">Lvl 4: Lethal</button>
                </div>
              </div>
            ` : `
              <!-- Interactive Tick Advance Controls -->
              <div style="display:flex; gap:4px;">
                <button class="win-btn" style="flex:1;" onclick="advanceTrackerTick('${entity.id}', -1)"><strong>- Step Tick</strong></button>
                <button class="win-btn" style="flex:1; background:#fee2e2; border-color:#dc2626; color:#991b1b;" onclick="advanceTrackerTick('${entity.id}', 1)"><strong>+ Advance Clock</strong></button>
                <button class="win-btn" onclick="resetTrackerTicks('${entity.id}')">Reset</button>
              </div>
            `}

            <!-- Canvas Visibility & Drag Position Controls -->
            <div style="background:#f1f5f9; border:1px solid #cbd5e1; padding:5px 8px; border-radius:2px; display:flex; flex-direction:column; gap:4px;">
              <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
                <input type="checkbox" ${activeInstance ? (activeInstance.showOnCanvas !== false ? 'checked' : '') : 'checked'} onchange="toggleTrackerCanvasVisibility('${entity.id}', this.checked, ${isPrototype})">
                <strong>Show Visual Gauge on CAD Canvas</strong>
              </label>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#64748b;">
                <span>Canvas Offset: (${activeInstance && activeInstance.offsetX ? activeInstance.offsetX : 0}, ${activeInstance && activeInstance.offsetY ? activeInstance.offsetY : 'Auto'})</span>
                ${activeInstance && (activeInstance.offsetX || activeInstance.offsetY) ? `<button class="win-btn" onclick="resetTrackerOffset('${entity.id}')" style="font-size:9px; padding:1px 4px;">Reset Offset</button>` : ''}
              </div>
            </div>

            ${isTriggered ? `
              <div style="background:#fee2e2; border:1px solid #ef4444; border-left:4px solid #b91c1c; padding:6px 8px; font-size:11px; color:#7f1d1d; line-height:1.3;">
                <strong>⚠️ CRISIS ACTIVE:</strong> Full escalation reached! Associated node has active pulsing red hazard perimeter on CAD canvas.
              </div>
            ` : ''}

            <div><strong>Clock Type / Vector:</strong> ${entity.type || 'Threat Clock'}</div>
            ${entity.faction ? `<div><strong>Associated Faction / Stakes:</strong> ${entity.faction}</div>` : ''}
            <div>
              <strong>Trigger Event &amp; Consequences:</strong>
              <p style="color:#444; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd;">${entity.notes || entity.motivation || 'No description provided.'}</p>
            </div>
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; flex-direction:column; gap:2px;">
              <strong>Station to Node:</strong>
              <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${entity.id}', this.value, ${isPrototype})">
                ${nodeOptions}
              </select>
            </label>

            ${(activeInstance && activeInstance.nodeId) ? `
              <button class="win-btn" onclick="centerOnNode(${activeInstance.nodeId})"><strong>🎯 Center Stationed Node on Canvas</strong></button>
            ` : ''}

            <div style="display:flex; gap:4px; margin-top:2px;">
              ${isPrototype ? `
                <button class="win-btn" style="flex:1;" onclick="promotePrototypeToCampaign('${entity.id}')"><strong>+ Add to Active Campaign</strong></button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('tracker', '${entity.id}')">Delete Clock...</button>
              ` : `
                <button class="win-btn" style="flex:1;" onclick="openEditEntityModal('${entity.id}')">Edit Clock</button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('tracker', '${entity.id}')">Delete Clock...</button>
              `}
            </div>
          </div>
        `;
      } else if (CurrentEntityTab === 'quest') {
        // DEDICATED QUEST INSPECTOR
        const questObj = activeInstance || entity;
        const spanningNodes = (typeof getQuestSpanningNodes === 'function') ? getQuestSpanningNodes(questObj) : [];
        const campaignNpcs = topo.npcs || [];
        const campaignItems = topo.items || [];
        const linkedNpcs = campaignNpcs.filter(n => (questObj.npcIds || []).includes(n.id));
        const linkedItems = campaignItems.filter(i => (questObj.itemIds || []).includes(i.id));

        let spanningHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No nodes mapped yet.</div>';
        if (spanningNodes.length > 0) {
          spanningHtml = spanningNodes.map(sn => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:3px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <span style="font-weight:bold; color:#0f172a; font-size:11px;">#${sn.nodeId}: ${sn.nodeName}</span>
                <div style="font-size:9px; color:#475569;">${sn.reasons.join(', ')} (${sn.mapName})</div>
              </div>
              <button class="win-btn" onclick="centerOnNode(${sn.nodeId})" style="font-size:9px; padding:1px 5px; white-space:nowrap;">🎯 Center</button>
            </div>
          `).join('');
        }

        let npcsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No NPCs linked to this quest.</div>';
        if (linkedNpcs.length > 0) {
          npcsHtml = linkedNpcs.map(npc => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:3px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <span style="font-weight:bold; font-size:11px;">${npc.name}</span>
                <span style="font-size:9px; color:#475569;">(${npc.role || 'Resident'}) - ${npc.nodeId ? `Node #${npc.nodeId}` : 'Unassigned'}</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('npc', '${npc.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${npc.nodeId ? `<button class="win-btn" onclick="centerOnNode(${npc.nodeId})" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
              </div>
            </div>
          `).join('');
        }

        let itemsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No items linked to this quest.</div>';
        if (linkedItems.length > 0) {
          itemsHtml = linkedItems.map(item => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:3px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <span style="font-weight:bold; font-size:11px;">${item.name}</span>
                <span style="font-size:9px; color:#475569;">[${item.category || 'Gear'}] - ${item.nodeId ? `Node #${item.nodeId}` : 'Unassigned'}</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('item', '${item.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${item.nodeId ? `<button class="win-btn" onclick="centerOnNode(${item.nodeId})" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
              </div>
            </div>
          `).join('');
        }

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <h3 style="font-size:13px; color:#000080; margin-bottom:2px;">📜 ${entity.title || entity.name}</h3>
            <span class="entity-badge-tag">${entity.moduleId ? `Module: ${entity.moduleId}` : 'Custom Authored'}</span>
            <span class="entity-badge-tag" style="background:#dbeafe; color:#1e40af;">${isPrototype ? 'Available Prototype' : 'Active in Campaign'}</span>
            <span class="entity-badge-tag" style="background:#fef3c7; color:#92400e;">${entity.type || entity.category || 'Standard Quest'}</span>
          </div>

          <div style="font-size:11px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:calc(100% - 130px);">
            ${entity.threat ? `<div><strong>Stakes / Failure Condition:</strong> <span style="color:#b91c1c;">${entity.threat}</span></div>` : ''}
            <div>
              <strong>Narrative Objective &amp; Details:</strong>
              <p style="color:#333; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd;">${entity.motivation || entity.notes || 'No description provided.'}</p>
            </div>

            <!-- Linked NPCs -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong>Linked NPCs (${linkedNpcs.length}):</strong>
                ${!isPrototype ? `<button class="win-btn" onclick="openEditEntityModal('${entity.id}')" style="font-size:9px; padding:1px 4px;">+ Link NPCs</button>` : ''}
              </div>
              ${npcsHtml}
            </div>

            <!-- Linked Items -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong>Linked Items / Relics (${linkedItems.length}):</strong>
                ${!isPrototype ? `<button class="win-btn" onclick="openEditEntityModal('${entity.id}')" style="font-size:9px; padding:1px 4px;">+ Link Items</button>` : ''}
              </div>
              ${itemsHtml}
            </div>

            <!-- Spanning Quest Network -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="color:#0f172a;">🗺️ Spanning Quest Network:</strong>
                <span style="font-size:10px; color:#2563eb; font-weight:bold;">${spanningNodes.length} Node${spanningNodes.length === 1 ? '' : 's'}</span>
              </div>
              <div style="font-size:9px; color:#64748b; margin-bottom:4px;">Nodes dynamically spanned by this quest anchor and its stationed NPCs/items:</div>
              ${spanningHtml}
            </div>
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; flex-direction:column; gap:2px;">
              <strong>Main Quest Anchor Node:</strong>
              <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${entity.id}', this.value, ${isPrototype})">
                ${nodeOptions}
              </select>
            </label>

            ${(currentStationId) ? `
              <button class="win-btn" onclick="centerOnNode(${currentStationId})"><strong>🎯 Center Anchor Node on Canvas</strong></button>
            ` : ''}

            <div style="display:flex; gap:4px; margin-top:4px;">
              ${isPrototype ? `
                <button class="win-btn" style="flex:1;" onclick="promotePrototypeToCampaign('${entity.id}')"><strong>+ Add Quest to Campaign</strong></button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('quest', '${entity.id}')">Delete Quest...</button>
              ` : `
                <button class="win-btn" style="flex:1;" onclick="openEditEntityModal('${entity.id}')">Edit Quest</button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('quest', '${entity.id}')">Delete Quest...</button>
              `}
            </div>
          </div>
        `;
      } else if (CurrentEntityTab === 'item') {
        // DEDICATED ITEM INSPECTOR
        const itemObj = activeInstance || entity;
        const ownerNpc = (topo.npcs || []).find(n => String(n.id) === String(itemObj.ownerNpcId));
        const isCarried = (itemObj.possessionMode === 'carried' && ownerNpc);
        const effNodeId = isCarried ? (ownerNpc.nodeId != null ? ownerNpc.nodeId : null) : (activeInstance ? activeInstance.nodeId : (entity.suggestedNode || entity.nodeId));

        const referencingQuests = (topo.quests || []).filter(q => 
          (q.itemIds && q.itemIds.includes(itemObj.id)) || 
          (q.itemIds && q.itemIds.includes(entity.id)) ||
          (q.nodeId && effNodeId && String(q.nodeId) === String(effNodeId))
        );

        let questsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No active quests currently reference this item.</div>';
        if (referencingQuests.length > 0) {
          questsHtml = referencingQuests.map(q => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:3px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <span style="font-weight:bold; font-size:11px;">📜 ${q.title || q.name}</span>
                <span style="font-size:9px; color:#475569;">[Anchor: ${q.nodeId ? `Node #${q.nodeId}` : 'Unassigned'}]</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('quest', '${q.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${q.nodeId ? `<button class="win-btn" onclick="centerOnNode(${q.nodeId})" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
              </div>
            </div>
          `).join('');
        }

        const possessionBadge = ownerNpc
          ? (isCarried
              ? `<span class="entity-badge-tag" style="background:#0f766e; color:#fff;">🎒 Equipped / Carried by ${ownerNpc.name}</span>`
              : `<span class="entity-badge-tag" style="background:#475569; color:#fff;">📦 Stored at Node #${itemObj.nodeId || 'Unassigned'} (Owned by ${ownerNpc.name})</span>`)
          : `<span class="entity-badge-tag" style="background:#f1f5f9; color:#64748b;">(Unowned / Public Relic)</span>`;

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <h3 style="font-size:13px; color:#000080; margin-bottom:2px;">💎 ${entity.name || entity.title}</h3>
            <span class="entity-badge-tag">${entity.moduleId ? `Module: ${entity.moduleId}` : 'Custom Authored'}</span>
            <span class="entity-badge-tag" style="background:#dbeafe; color:#1e40af;">${isPrototype ? 'Available Prototype' : 'Active in Campaign'}</span>
            <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3;">${entity.category || entity.role || entity.type || 'Relic / Item'}</span>
          </div>

          <div style="font-size:11px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:calc(100% - 130px);">
            <!-- Ownership & Possession Status Card -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="color:#0f172a; font-size:11px;">👤 Ownership &amp; Allocation:</strong>
                ${possessionBadge}
              </div>
              ${ownerNpc ? `
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:3px;">
                  <span style="font-size:10px; color:#334155;">Owner: <strong>${ownerNpc.name}</strong> (${ownerNpc.role || 'Resident'})</span>
                  <button class="win-btn" onclick="navigateToEntity('npc', '${ownerNpc.id}')" style="font-size:9px; padding:1px 4px;">Inspect Character</button>
                </div>
                <div style="font-size:10px; color:#64748b; margin-top:2px;">
                  ${isCarried
                    ? `🎒 Dynamically inherits station node from carrier <strong>Node #${ownerNpc.nodeId != null ? ownerNpc.nodeId : 'Unassigned'}</strong>.`
                    : `📦 Stored at designated station <strong>Node #${itemObj.nodeId || 'Unassigned'}</strong> (e.g. in vault/armory).`}
                </div>
                <div style="margin-top:4px;">
                  <button class="win-btn" onclick="toggleItemPossessionMode('${itemObj.id}', ${isPrototype})" style="font-size:10px; width:100%;">
                    ${isCarried ? '📦 Switch to Stored at Node' : '🎒 Switch to Equipped / Carried by Owner'}
                  </button>
                </div>
              ` : `
                <div style="font-size:10px; color:#64748b;">This item is currently unowned or a public world relic. Edit this item to assign an owning NPC.</div>
              `}
            </div>

            ${entity.specs ? `
              <div>
                <strong>Specifications &amp; Dial Traits:</strong>
                <p style="color:#333; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd; font-family:Consolas, monospace;">${entity.specs}</p>
              </div>
            ` : ''}

            <div>
              <strong>Lore, Provenance &amp; Notes:</strong>
              <p style="color:#333; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd;">${entity.motivation || entity.notes || 'No description provided.'}</p>
            </div>

            <!-- Associated / Referencing Quests -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong>Referencing Quests (${referencingQuests.length}):</strong>
                <button class="win-btn" onclick="openNewEntityModal('quest')" style="font-size:9px; padding:1px 4px;">+ New Quest</button>
              </div>
              ${questsHtml}
            </div>
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            ${isCarried ? `
              <div style="font-size:10px; background:#f0fdf4; border:1px solid #86efac; padding:4px 6px; border-radius:2px; color:#166534;">
                <strong>Station Node: Node #${effNodeId != null ? effNodeId : 'Unassigned'}</strong> (Inherited from carrier ${ownerNpc.name}). To station elsewhere, switch possession to "Stored at Node".
              </div>
            ` : `
              <label style="display:flex; flex-direction:column; gap:2px;">
                <strong>Station to Node:</strong>
                <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${entity.id}', this.value, ${isPrototype})">
                  ${nodeOptions}
                </select>
              </label>
            `}

            ${(effNodeId) ? `
              <button class="win-btn" onclick="centerOnNode(${effNodeId})"><strong>🎯 Center Stationed Node on Canvas</strong></button>
            ` : ''}

            <div style="display:flex; gap:4px; margin-top:4px;">
              ${isPrototype ? `
                <button class="win-btn" style="flex:1;" onclick="promotePrototypeToCampaign('${entity.id}')"><strong>+ Add Item to Campaign</strong></button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('item', '${entity.id}')">Delete Item...</button>
              ` : `
                <button class="win-btn" style="flex:1;" onclick="openEditEntityModal('${entity.id}')">Edit Item</button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('item', '${entity.id}')">Delete Item...</button>
              `}
            </div>
          </div>
        `;
      } else {
        // DEDICATED NPC INSPECTOR
        const npcObj = activeInstance || entity;
        const currentStationId = activeInstance ? activeInstance.nodeId : (entity.suggestedNode || entity.nodeId);
        const hostNode = currentStationId ? topo.nodes[String(currentStationId)] : null;

        // 1. Dissonance Calculation
        const dissonance = (hostNode) ? computeNpcNodeDissonance(npcObj, hostNode) : null;

        // 2. Party Standing
        const curStanding = (npcObj.dispositionToParty !== undefined) ? npcObj.dispositionToParty : 0;
        const standingLabels = {
          '2': { label: 'Allied (+2)', color: '#2563eb', bg: '#dbeafe' },
          '1': { label: 'Friendly (+1)', color: '#16a34a', bg: '#dcfce7' },
          '0': { label: 'Neutral (0)', color: '#475569', bg: '#f1f5f9' },
          '-1': { label: 'Unfriendly (-1)', color: '#d97706', bg: '#fef3c7' },
          '-2': { label: 'Hostile (-2)', color: '#dc2626', bg: '#fee2e2' }
        };
        const curStandObj = standingLabels[String(curStanding)] || standingLabels['0'];

        // 3. Status Badge
        const statusColorMap = {
          'Active': 'background:#047857; color:#fff;',
          'Captured': 'background:#ea580c; color:#fff;',
          'In Hiding': 'background:#7c3aed; color:#fff;',
          'Exiled': 'background:#92400e; color:#fff;',
          'Deceased': 'background:#991b1b; color:#fff;',
          'Missing': 'background:#475569; color:#fff;'
        };
        const npcStatus = npcObj.status || 'Active';
        const statusBadgeStyle = statusColorMap[npcStatus] || 'background:#047857; color:#fff;';

        // 4. Four-Corners Badge
        const fourCornersBadges = {
          'Active': '<span class="entity-badge-tag" style="background:#0284c7; color:#fff;">⚡ Catalyst (Active)</span>',
          'Adversary': '<span class="entity-badge-tag" style="background:#b91c1c; color:#fff;">⚔️ Adversary</span>',
          'Shadow': '<span class="entity-badge-tag" style="background:#6b21a8; color:#fff;">👤 Shadow Mirror</span>',
          'Target': '<span class="entity-badge-tag" style="background:#d97706; color:#fff;">🎯 Prize / Target</span>'
        };
        const fourCornerBadge = npcObj.fourCornersRole ? (fourCornersBadges[npcObj.fourCornersRole] || '') : '';

        // 5. Inter-NPC Relationships (Outbound & Inbound)
        const outboundRels = Array.isArray(npcObj.relationships) ? npcObj.relationships : [];
        const inboundRels = (topo.npcs || []).filter(other => other.id !== npcObj.id && Array.isArray(other.relationships) && other.relationships.some(r => r.targetNpcId === npcObj.id)).map(other => {
          const matchingRel = other.relationships.find(r => r.targetNpcId === npcObj.id);
          return {
            sourceNpc: other,
            rel: matchingRel
          };
        });

        let relsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No recorded social relationships.</div>';
        if (outboundRels.length > 0 || inboundRels.length > 0) {
          const outItems = outboundRels.map(r => {
            const targetNpc = (topo.npcs || []).find(n => n.id === r.targetNpcId);
            const targetName = targetNpc ? targetNpc.name : `NPC [${r.targetNpcId}]`;
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:2px;">
                <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                  <strong style="color:#0f172a; font-size:10px;">→ ${r.type}:</strong> <span style="font-size:10px;">${targetName}</span>
                  ${r.notes ? `<div style="font-size:9px; color:#64748b; font-style:italic;">${r.notes}</div>` : ''}
                </div>
                <div style="display:flex; gap:2px;">
                  <button class="win-btn" onclick="navigateToEntity('npc', '${r.targetNpcId}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                  <button class="win-btn" onclick="removeNpcRelationship('${npcObj.id}', '${r.targetNpcId}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;">X</button>
                </div>
              </div>
            `;
          }).join('');

          const inItems = inboundRels.map(ib => {
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:2px;">
                <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                  <strong style="color:#0f766e; font-size:10px;">← Viewed as ${ib.rel.type} by:</strong> <span style="font-size:10px;">${ib.sourceNpc.name}</span>
                  ${ib.rel.notes ? `<div style="font-size:9px; color:#64748b; font-style:italic;">${ib.rel.notes}</div>` : ''}
                </div>
                <button class="win-btn" onclick="navigateToEntity('npc', '${ib.sourceNpc.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
              </div>
            `;
          }).join('');

          relsHtml = `<div style="display:flex; flex-direction:column; gap:2px;">${outItems}${inItems}</div>`;
        }

        // 6. Owned & Carried Items
        const ownedItems = (topo.items || []).filter(i => String(i.ownerNpcId) === String(npcObj.id));
        let ownedItemsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No items owned or carried.</div>';
        if (ownedItems.length > 0) {
          ownedItemsHtml = ownedItems.map(itm => {
            const isCarried = (itm.possessionMode === 'carried');
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:2px;">
                <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                  <span style="font-weight:bold; font-size:10px;">💎 ${itm.name}</span>
                  <span class="entity-badge-tag" style="font-size:8px; ${isCarried ? 'background:#0f766e; color:#fff;' : 'background:#475569; color:#fff;'}">${isCarried ? '🎒 Carried' : '📦 Stored @ Node #' + (itm.nodeId || '?')}</span>
                </div>
                <div style="display:flex; gap:2px;">
                  <button class="win-btn" onclick="toggleItemPossessionMode('${itm.id}', false)" style="font-size:9px; padding:1px 3px;">${isCarried ? 'Store' : 'Equip'}</button>
                  <button class="win-btn" onclick="navigateToEntity('item', '${itm.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                </div>
              </div>
            `;
          }).join('');
        }

        // 7. Three-Clue Secrets Known
        const secrets = Array.isArray(npcObj.secretsKnown) ? npcObj.secretsKnown : [];
        let secretsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No secret lore recorded.</div>';
        if (secrets.length > 0) {
          secretsHtml = secrets.map((sec, sIdx) => {
            const isRev = (typeof sec === 'object') ? !!sec.revealed : false;
            const text = (typeof sec === 'object') ? sec.secret : sec;
            return `
              <label style="display:flex; align-items:flex-start; gap:6px; cursor:pointer; font-size:10px; padding:3px 0; border-bottom:1px dashed #e2e8f0;">
                <input type="checkbox" ${isRev ? 'checked' : ''} onchange="toggleNpcSecretRevealed('${npcObj.id}', ${sIdx})" style="margin-top:2px; cursor:pointer;">
                <span style="${isRev ? 'text-decoration:line-through; color:#64748b;' : 'color:#0f172a; font-weight:bold;'}">${text} ${isRev ? '<strong style="color:#16a34a; font-size:9px;">[REVEALED TO PLAYERS]</strong>' : ''}</span>
              </label>
            `;
          }).join('');
        }

        // 8. Referencing Quests
        const referencingQuests = (topo.quests || []).filter(q => 
          (q.npcIds && q.npcIds.includes(npcObj.id)) || 
          (q.npcIds && q.npcIds.includes(entity.id)) ||
          (q.nodeId && currentStationId && String(q.nodeId) === String(currentStationId))
        );
        let questsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No active quests currently feature this NPC.</div>';
        if (referencingQuests.length > 0) {
          questsHtml = referencingQuests.map(q => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:3px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <span style="font-weight:bold; font-size:11px;">📜 ${q.title || q.name}</span>
                <span style="font-size:9px; color:#475569;">[Anchor: ${q.nodeId ? `Node #${q.nodeId}` : 'Unassigned'}]</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('quest', '${q.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${q.nodeId ? `<button class="win-btn" onclick="centerOnNode(${q.nodeId})" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
              </div>
            </div>
          `).join('');
        }

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <h3 style="font-size:13px; color:#000080; margin:0 0 2px 0;">👤 ${entity.name || entity.title}</h3>
              <span class="entity-badge-tag" style="${statusBadgeStyle}">${npcStatus}</span>
            </div>
            <div style="display:flex; gap:3px; flex-wrap:wrap; margin-top:3px;">
              <span class="entity-badge-tag">${entity.moduleId ? `Module: ${entity.moduleId}` : 'Custom Authored'}</span>
              <span class="entity-badge-tag" style="background:#dbeafe; color:#1e40af;">${isPrototype ? 'Available Prototype' : 'Active in Campaign'}</span>
              ${fourCornerBadge}
              ${entity.faction ? `<span class="entity-badge-tag" style="background:#f1f5f9; color:#334155;">${entity.faction}</span>` : ''}
            </div>
          </div>

          <div style="font-size:11px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:calc(100% - 130px);">
            <div><strong>Role / Vocation:</strong> ${entity.role || entity.category || 'Resident / Specialist'}</div>

            <!-- Sociological Alignment & Cultural Dissonance Engine -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="color:#0f172a; font-size:10px;">🏛️ Sociological Profile:</strong>
                ${dissonance ? `<span class="${dissonance.badgeClass}" style="${dissonance.style}">${dissonance.level}</span>` : ''}
              </div>
              <div style="font-size:10px; color:#334155;">
                Culture Quadrant: <strong>${npcObj.culture || (hostNode ? hostNode.culture + ' (Inherited)' : 'Universal')}</strong> &bull; 
                Vector: <strong>${npcObj.odv ? `[S:${npcObj.odv.s}, E:${npcObj.odv.e}, C:${npcObj.odv.c}]` : '[Default 2,2,2]'}</strong>
              </div>
              ${dissonance ? `
                <div style="font-size:9px; color:#475569; margin-top:2px;">
                  Host Node #${hostNode.id} (${hostNode.culture} [${hostNode.odv ? `${hostNode.odv.s},${hostNode.odv.e},${hostNode.odv.c}` : '2,2,2'}]) &bull; <strong>${dissonance.summary}</strong>
                </div>
                ${dissonance.warning ? `
                  <div style="margin-top:3px; background:#fef2f2; border:1px solid #f87171; padding:4px 6px; border-radius:2px; font-size:9px; color:#991b1b; line-height:1.3;">
                    ⚠️ ${dissonance.warning}
                  </div>
                ` : ''}
              ` : `
                <div style="font-size:9px; color:#64748b; margin-top:2px; font-style:italic;">Station to a node to compute cultural friction.</div>
              `}
            </div>

            <!-- Tabletop GM Tactical Play-Aids -->
            <div style="background:#fff7ed; border:1px solid #fdba74; padding:6px; border-radius:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="color:#9a3412; font-size:10px;">🎲 Party Standing Dial:</strong>
                <span class="entity-badge-tag" style="background:${curStandObj.bg}; color:${curStandObj.color}; border:1px solid ${curStandObj.color}; font-weight:bold;">
                  ${curStandObj.label}
                </span>
              </div>
              <div style="display:flex; gap:4px; margin-bottom:4px;">
                <button class="win-btn" onclick="setNpcPartyDisposition('${npcObj.id}', -1)" style="flex:1; font-size:10px;">- Step Down</button>
                <button class="win-btn" onclick="setNpcPartyDisposition('${npcObj.id}', 1)" style="flex:1; font-size:10px;">+ Step Up</button>
              </div>

              <!-- Leverage / Vulnerabilities -->
              ${(npcObj.leverage && (npcObj.leverage.vulnerability || npcObj.leverage.bribe)) ? `
                <div style="background:#fff; border:1px solid #fed7aa; padding:4px 6px; border-radius:2px; font-size:9px; margin-top:3px;">
                  ${npcObj.leverage.vulnerability ? `<div><strong>Vulnerability:</strong> ${npcObj.leverage.vulnerability}</div>` : ''}
                  ${npcObj.leverage.bribe ? `<div><strong>Accepted Bribe / Price:</strong> ${npcObj.leverage.bribe}</div>` : ''}
                </div>
              ` : ''}
            </div>

            <!-- Three-Clue Secrets Known -->
            <div>
              <div style="font-size:10px; font-weight:bold; color:#0f172a; margin-bottom:2px;">🗝️ Secrets Known (Three-Clue Tracker):</div>
              <div style="background:#fff; border:1px solid #cbd5e1; padding:4px 6px; border-radius:2px;">
                ${secretsHtml}
              </div>
            </div>

            <!-- Dialogue Hooks -->
            ${(npcObj.dialogueHooks && npcObj.dialogueHooks.length > 0) ? `
              <div>
                <strong style="font-size:10px;">💬 Dialogue Hooks &amp; Quotes:</strong>
                <div style="background:#fff; border:1px solid #ddd; padding:4px 6px; border-radius:2px; font-size:9px; line-height:1.35; margin-top:2px;">
                  ${npcObj.dialogueHooks.map(h => `<div style="font-style:italic; margin-bottom:2px;">&ldquo;${h}&rdquo;</div>`).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Inter-NPC Social Graph -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="font-size:10px;">👥 Inter-NPC Relationships:</strong>
                <button class="win-btn" onclick="promptAddNpcRelationship('${npcObj.id}')" style="font-size:9px; padding:1px 4px;">+ Add Tie...</button>
              </div>
              ${relsHtml}
            </div>

            <!-- Owned & Carried Relics -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="font-size:10px;">💎 Owned / Carried Relics (${ownedItems.length}):</strong>
                <button class="win-btn" onclick="openNewEntityModal('item')" style="font-size:9px; padding:1px 4px;">+ Add Item</button>
              </div>
              ${ownedItemsHtml}
            </div>

            <div>
              <strong>Motivation, Agenda &amp; Personality:</strong>
              <p style="color:#333; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd;">${entity.motivation || entity.notes || 'No description provided.'}</p>
            </div>

            <!-- Associated / Referencing Quests -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong>Quests Featuring this NPC (${referencingQuests.length}):</strong>
                <button class="win-btn" onclick="openNewEntityModal('quest')" style="font-size:9px; padding:1px 4px;">+ New Quest</button>
              </div>
              ${questsHtml}
            </div>
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; flex-direction:column; gap:2px;">
              <strong>Station to Node:</strong>
              <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${entity.id}', this.value, ${isPrototype})">
                ${nodeOptions}
              </select>
            </label>

            ${(currentStationId) ? `
              <button class="win-btn" onclick="centerOnNode(${currentStationId})"><strong>🎯 Center Stationed Node on Canvas</strong></button>
            ` : ''}

            <div style="display:flex; gap:4px; margin-top:4px;">
              ${isPrototype ? `
                <button class="win-btn" style="flex:1;" onclick="promotePrototypeToCampaign('${entity.id}')"><strong>+ Add NPC to Campaign</strong></button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('npc', '${entity.id}')">Delete NPC...</button>
              ` : `
                <button class="win-btn" style="flex:1;" onclick="openEditEntityModal('${entity.id}')">Edit NPC</button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('npc', '${entity.id}')">Delete NPC...</button>
              `}
            </div>
          </div>
        `;
      }

      // Highlight selected row in table
      document.querySelectorAll('#em-table-body tr').forEach(r => r.classList.remove('selected'));
      renderEntityManagerList();
    }


    // --- Navigation & Cross-Linking ---
    function navigateToEntity(type, id) {
      if (document.getElementById('modal-entity-manager') && document.getElementById('modal-entity-manager').style.display !== 'none') {
        CurrentEntityTab = type;
        updateEntityTabButtons();
        renderEntityManagerTree();
        renderEntityManagerList();
        selectEntityItem(id);
      } else {
        openEntityManager(type, id);
      }
    }
    window.navigateToEntity = navigateToEntity;
