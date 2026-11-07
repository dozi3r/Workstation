    // ========================================================================
    // UNIVERSAL CAMPAIGN ENTITY MANAGER - UI (TREE, LIST & INSPECTOR PANELS)
    // ========================================================================
    function escapeHtml(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    window.escapeHtml = escapeHtml;

    function getEdgeDisplayInfo(edge) {
      if (!edge) return { primaryTitle: 'Corridor', endpointsSubtitle: null, metaSubtitle: '', dirArrow: '⮂', uLabel: '', vLabel: '', endpointsText: '' };
      const isHegem = edge.edgeType === 'hegemony';
      const dirArrow = isHegem ? '➔' : '⮂';

      const resolveLabel = (node, id) => {
        if (!node) return `Node #${id}`;
        if (typeof getNodeDisplayName === 'function') return getNodeDisplayName(node);
        return node.displayName || node.name || `Node #${id}`;
      };

      const uLabel = resolveLabel(edge.uNode, edge.uId);
      const vLabel = resolveLabel(edge.vNode, edge.vId);
      const endpointsText = `[#${edge.uId}] ${uLabel} ${dirArrow} [#${edge.vId}] ${vLabel}`;

      // Safe custom name check: only treat as generic if empty or exact default string
      const isGeneric = !edge.name ||
                        edge.name === `Corridor ${edge.edgeKey}` ||
                        edge.name === `Corridor ${edge.pairKey}` ||
                        edge.name === `Corridor Node ${edge.uId}-Node ${edge.vId}` ||
                        edge.name === `Corridor Node ${edge.uId}->Node ${edge.vId}`;
      const hasCustomName = !isGeneric;

      return {
        primaryTitle: hasCustomName ? edge.name : endpointsText,
        endpointsSubtitle: hasCustomName ? endpointsText : null,
        metaSubtitle: `Layer: ${edge.layerId || (isHegem ? 'layer-hegemony' : 'layer-roads')} • Key: ${edge.edgeKey}`,
        dirArrow,
        uLabel,
        vLabel,
        endpointsText
      };
    }
    window.getEdgeDisplayInfo = getEdgeDisplayInfo;

    function escapeJsArg(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    /**
     * Resolves a node object across the active topology or multi-scale maps by its numeric/string ID.
     */
    function resolveNodeObject(nid, targetTopo = null) {
      if (nid == null || nid === '') return null;
      const currentTopo = targetTopo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
      const sId = String(nid).trim();

      if (currentTopo && currentTopo.nodes) {
        if (Array.isArray(currentTopo.nodes)) {
          const found = currentTopo.nodes.find(n => n && String(n.id) === sId);
          if (found) return found;
        } else if (typeof currentTopo.nodes === 'object') {
          if (currentTopo.nodes[sId]) return currentTopo.nodes[sId];
          if (currentTopo.nodes[nid]) return currentTopo.nodes[nid];
          const found = Object.values(currentTopo.nodes).find(n => n && String(n.id) === sId);
          if (found) return found;
        }
      }

      const mapDict = (typeof maps !== 'undefined' && maps) ? maps : (currentTopo && currentTopo.maps ? currentTopo.maps : null);
      if (mapDict && typeof mapDict === 'object') {
        for (const mId of Object.keys(mapDict)) {
          const m = mapDict[mId];
          if (m && m.nodes) {
            if (Array.isArray(m.nodes)) {
              const found = m.nodes.find(n => n && String(n.id) === sId);
              if (found) return found;
            } else if (typeof m.nodes === 'object') {
              if (m.nodes[sId]) return m.nodes[sId];
              if (m.nodes[nid]) return m.nodes[nid];
              const found = Object.values(m.nodes).find(n => n && String(n.id) === sId);
              if (found) return found;
            }
          }
        }
      }

      return null;
    }
    window.resolveNodeObject = resolveNodeObject;

    /**
     * Formats a node reference to display its ID and location name (e.g. "Node 26: The Dragon's Lair").
     */
    function formatNodeRef(nid, targetTopo = null) {
      if (nid == null || nid === '') return '(Unassigned)';
      const cleanId = String(nid).replace(/^Node\s*#?/i, '').trim();
      const nodeObj = resolveNodeObject(cleanId, targetTopo);
      const rawName = nodeObj ? (nodeObj.displayName || nodeObj.name || (typeof window.getNodeDisplayName === 'function' ? window.getNodeDisplayName(nodeObj) : (nodeObj.label || ''))) : '';
      const trimmedName = String(rawName).trim();

      if (!trimmedName) {
        return `Node ${cleanId}`;
      }

      const lower = trimmedName.toLowerCase();
      const idLower = cleanId.toLowerCase();
      if (lower === `node ${idLower}` || lower === `node #${idLower}` || lower === `#${idLower}` || lower === idLower) {
        return `Node ${cleanId}`;
      }

      if (lower.startsWith(`node ${idLower}:`) || lower.startsWith(`node #${idLower}:`)) {
        return trimmedName;
      }

      return `Node ${cleanId}: ${trimmedName}`;
    }
    window.formatNodeRef = formatNodeRef;

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

    window.CreatorStudio = window.CreatorStudio || {};
    if (!window.CreatorStudio.edgeClassifications) {
      window.CreatorStudio.edgeClassifications = {
        'road': {
          id: 'road',
          label: 'Transit Road (Bidirectional)',
          shortLabel: 'Road',
          isDirectional: false,
          icon: '🛣️',
          badgeStyle: 'background:#1e3a8a; color:#fff;'
        },
        'hegemony': {
          id: 'hegemony',
          label: 'Hegemonic Vector (Directional)',
          shortLabel: 'Hegemony',
          isDirectional: true,
          icon: '⚔️',
          badgeStyle: 'background:#7f1d1d; color:#fff;'
        }
      };
    }

    function buildNodeDict(nodes) {
      const nodeDict = {};
      if (Array.isArray(nodes)) {
        nodes.forEach(n => {
          if (n && n.id !== undefined) nodeDict[String(n.id)] = n;
        });
      } else if (typeof nodes === 'object' && nodes !== null) {
        Object.keys(nodes).forEach(k => {
          if (nodes[k]) nodeDict[String(k)] = nodes[k];
        });
      }
      return nodeDict;
    }

    function resolveEdgeEndpointsAndMetrics(edgeItem, targetTopo) {
      if (!edgeItem || !targetTopo) return edgeItem;
      const nodeDict = buildNodeDict(targetTopo.nodes);

      edgeItem.uNode = nodeDict[String(edgeItem.uId)] || null;
      edgeItem.vNode = nodeDict[String(edgeItem.vId)] || null;

      if (edgeItem.uNode && edgeItem.vNode) {
        const ux = edgeItem.uNode.x || 0;
        const uy = edgeItem.uNode.y || 0;
        const vx = edgeItem.vNode.x || 0;
        const vy = edgeItem.vNode.y || 0;
        const dist = Math.round(Math.hypot(vx - ux, vy - uy));
        edgeItem.lengthPx = dist;
        edgeItem.formattedDist = (typeof formatDistance === 'function') ? formatDistance(dist) : `${dist} px`;
      } else {
        edgeItem.lengthPx = 0;
        edgeItem.formattedDist = 'Unknown';
      }

      if (typeof calculateCorridorHazard === 'function') {
        edgeItem.hazardInfo = calculateCorridorHazard(edgeItem, edgeItem.uNode, edgeItem.vNode);
      } else {
        edgeItem.hazardInfo = { levelName: 'Level 0 (No Hazard)', dc: 10 };
      }

      return edgeItem;
    }
    window.resolveEdgeEndpointsAndMetrics = resolveEdgeEndpointsAndMetrics;

    function getEdgesForMapScope(scope = 'all') {
      const topo = Workstation.activeTopology;
      const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
      const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});
      const curMapName = (mapDict[curMapId] && mapDict[curMapId].name) || (topo && topo.name) || "Root Map";

      const extractEdgesFromMap = (mId, mName, mapObj) => {
        if (!mapObj) return [];
        const nodeDict = buildNodeDict(mapObj.nodes);

        const mEdgeData = mapObj.edgeData || {};
        const mEdgeNotes = mapObj.edgeNotes || {};
        const mEdgeSlottedModules = (mId === curMapId && typeof edgeSlottedModules !== 'undefined')
          ? edgeSlottedModules
          : (mapObj.edgeSlottedModules || {});

        const edges = [];
        const seenRoadPairs = new Set();

        Object.keys(nodeDict).forEach(uKey => {
          const u = nodeDict[uKey];
          const uId = (isNaN(u.id) || String(u.id).includes('-')) ? u.id : parseInt(u.id);

          // 1. Transit Roads (u.adj)
          if (Array.isArray(u.adj)) {
            u.adj.forEach(rawVId => {
              const vId = (isNaN(rawVId) || String(rawVId).includes('-')) ? rawVId : parseInt(rawVId);
              const pairKey = [String(uId), String(vId)].sort().join('-');
              if (!seenRoadPairs.has(pairKey)) {
                seenRoadPairs.add(pairKey);
                const rec = mEdgeData[pairKey] || mEdgeData[`${uId}-${vId}`] || mEdgeData[`${vId}-${uId}`] || {};
                const slotted = (mEdgeSlottedModules && (mEdgeSlottedModules[pairKey] || mEdgeSlottedModules[`${uId}-${vId}`])) || rec.modules || [];
                const notes = (mEdgeNotes && (mEdgeNotes[pairKey] || mEdgeNotes[`${uId}-${vId}`])) || '';

                const edge = {
                  id: pairKey,
                  edgeKey: pairKey,
                  pairKey: pairKey,
                  edgeType: 'road',
                  isDirectional: false,
                  uId: uId,
                  vId: vId,
                  name: rec.name || '',
                  condition: rec.condition || 'Passable',
                  hazardLevel: rec.hazardLevel !== undefined ? rec.hazardLevel : 0,
                  blocked: !!rec.blocked,
                  tollCost: rec.tollCost || 'None',
                  patrolFaction: rec.patrolFaction || 'neutral',
                  visible: rec.visible !== false,
                  layerId: rec.layerId || 'layer-roads',
                  conduitType: rec.conduitType || 'Standard Route',
                  dedicatedFlows: Array.isArray(rec.dedicatedFlows) ? rec.dedicatedFlows : [],
                  capacity: (typeof rec.capacity === 'number') ? rec.capacity : null,
                  demographics: rec.demographics || null,
                  factionPresence: Array.isArray(rec.factionPresence) ? rec.factionPresence : [],
                  partyRapport: (typeof rec.partyRapport === 'number') ? rec.partyRapport : null,
                  modules: Array.isArray(slotted) ? slotted : [],
                  notes: notes,
                  _mapId: mId,
                  _mapName: mName
                };
                resolveEdgeEndpointsAndMetrics(edge, mapObj);
                edges.push(edge);
              }
            });
          }

          // 2. Hegemonic Vectors (u.infBy)
          if (Array.isArray(u.infBy)) {
            u.infBy.forEach(rawSrcId => {
              const srcId = (isNaN(rawSrcId) || String(rawSrcId).includes('-')) ? rawSrcId : parseInt(rawSrcId);
              const edgeKey = `${srcId}->${uId}`;
              const pairKey = [String(srcId), String(uId)].sort().join('-');
              const rec = mEdgeData[edgeKey] || mEdgeData[pairKey] || {};
              const slotted = (mEdgeSlottedModules && (mEdgeSlottedModules[edgeKey] || mEdgeSlottedModules[pairKey])) || rec.modules || [];
              const notes = (mEdgeNotes && (mEdgeNotes[edgeKey] || mEdgeNotes[pairKey])) || '';

              const edge = {
                id: edgeKey,
                edgeKey: edgeKey,
                pairKey: pairKey,
                edgeType: 'hegemony',
                isDirectional: true,
                uId: srcId,
                vId: uId,
                name: rec.name || '',
                condition: rec.condition || 'Passable',
                hazardLevel: rec.hazardLevel !== undefined ? rec.hazardLevel : 0,
                blocked: !!rec.blocked,
                tollCost: rec.tollCost || 'None',
                patrolFaction: rec.patrolFaction || 'neutral',
                visible: rec.visible !== false,
                layerId: rec.layerId || 'layer-hegemony',
                conduitType: rec.conduitType || 'Standard Route',
                dedicatedFlows: Array.isArray(rec.dedicatedFlows) ? rec.dedicatedFlows : [],
                capacity: (typeof rec.capacity === 'number') ? rec.capacity : null,
                demographics: rec.demographics || null,
                factionPresence: Array.isArray(rec.factionPresence) ? rec.factionPresence : [],
                partyRapport: (typeof rec.partyRapport === 'number') ? rec.partyRapport : null,
                modules: Array.isArray(slotted) ? slotted : [],
                notes: notes,
                _mapId: mId,
                _mapName: mName
              };
              resolveEdgeEndpointsAndMetrics(edge, mapObj);
              edges.push(edge);
            });
          }
        });

        return edges;
      };

      const getActiveEdges = () => {
        return extractEdgesFromMap(curMapId, curMapName, topo);
      };

      let edgeList = [];

      if (!scope || scope === 'all' || scope.startsWith('type:') || scope.startsWith('conduit:') || scope.startsWith('hazard:') || scope.startsWith('status:') || scope.startsWith('has:')) {
        edgeList = getActiveEdges();
      } else if (scope === `map:${curMapId}`) {
        edgeList = getActiveEdges();
      } else if (scope === 'map:all') {
        edgeList = [...getActiveEdges()];
        Object.keys(mapDict).forEach(mId => {
          if (mId !== curMapId) {
            const m = mapDict[mId];
            const mName = m.name || mId;
            edgeList.push(...extractEdgesFromMap(mId, mName, m));
          }
        });
      } else if (scope.startsWith('map:')) {
        const targetMapId = scope.replace('map:', '');
        const targetMap = (targetMapId === curMapId) ? topo : mapDict[targetMapId];
        if (targetMap) {
          const mName = (targetMapId === curMapId) ? curMapName : (targetMap.name || targetMapId);
          edgeList = extractEdgesFromMap(targetMapId, mName, targetMap);
        }
      } else {
        edgeList = getActiveEdges();
      }

      if (scope === 'type:road') {
        return edgeList.filter(e => e.edgeType === 'road');
      }
      if (scope === 'type:hegemony') {
        return edgeList.filter(e => e.edgeType === 'hegemony');
      }
      if (scope.startsWith('conduit:')) {
        const cType = scope.replace('conduit:', '');
        return edgeList.filter(e => e.conduitType === cType);
      }
      if (scope === 'hazard:high') {
        return edgeList.filter(e => e.hazardLevel >= 2);
      }
      if (scope === 'hazard:safe') {
        return edgeList.filter(e => e.hazardLevel === 0);
      }
      if (scope === 'status:blocked') {
        return edgeList.filter(e => e.blocked || e.condition.toLowerCase().includes('blockaded') || e.condition.toLowerCase().includes('besieged'));
      }
      if (scope === 'status:secret') {
        return edgeList.filter(e => e.visible === false);
      }
      if (scope === 'status:open') {
        return edgeList.filter(e => !e.blocked && e.visible !== false && e.hazardLevel < 2);
      }
      if (scope === 'has:flows') {
        return edgeList.filter(e => Array.isArray(e.dedicatedFlows) && e.dedicatedFlows.length > 0);
      }
      if (scope === 'has:modules') {
        return edgeList.filter(e => Array.isArray(e.modules) && e.modules.length > 0);
      }
      if (scope === 'has:contested') {
        return edgeList.filter(e => (e.patrolFaction && e.patrolFaction.toLowerCase() === 'contested') || (Array.isArray(e.factionPresence) && e.factionPresence.length > 1));
      }

      return edgeList;
    }
    window.getEdgesForMapScope = getEdgesForMapScope;

    async function jumpToEdgeMap(mapId, edgeKey, uId, vId, edgeType) {
      const curId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';
      if (typeof switchActiveMap === 'function' && mapId && mapId !== curId) {
        await switchActiveMap(mapId);
      }
      if (typeof selectEdge === 'function') {
        selectEdge(edgeType, uId, vId);
      }
      const topo = Workstation.activeTopology;
      if (topo && topo.nodes) {
        const nodeDict = buildNodeDict(topo.nodes);
        const u = nodeDict[String(uId)];
        const v = nodeDict[String(vId)];
        if (u && v) {
          const midX = (u.x + v.x) / 2;
          const midY = (u.y + v.y) / 2;
          const container = document.getElementById('canvas-container');
          if (container && typeof Workstation !== 'undefined') {
            const cw = container.clientWidth || 800;
            const ch = container.clientHeight || 600;
            if (!Workstation.pan) Workstation.pan = { x: 0, y: 0 };
            const zoom = Workstation.zoom || 1.0;
            Workstation.pan.x = (cw / 2) - (midX * zoom);
            Workstation.pan.y = (ch / 2) - (midY * zoom);
            if (typeof applyCanvasTransform === 'function') applyCanvasTransform();
          }
        }
      }
      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(`Focused ${edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road'} [${edgeKey}] on Map [${mapId}]`);
      }
    }
    window.jumpToEdgeMap = jumpToEdgeMap;

    function normalizeEntityType(type) {
      const normMap = {
        npcs: 'npc',
        quests: 'quest',
        items: 'item',
        resources: 'resource',
        creatures: 'creature',
        trackers: 'tracker',
        factions: 'faction',
        nodes: 'node',
        edges: 'edge'
      };
      return normMap[type] || type || 'npc';
    }

    function getAllKnownNodesMap() {
      const topo = Workstation.activeTopology;
      const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});
      const nodeMap = {};
      if (topo && topo.nodes) {
        Object.keys(topo.nodes).forEach(k => {
          nodeMap[String(k)] = topo.nodes[k];
        });
      }
      Object.keys(mapDict).forEach(mId => {
        const m = mapDict[mId];
        if (m && m.nodes) {
          if (Array.isArray(m.nodes)) {
            m.nodes.forEach(n => {
              if (n && n.id != null) nodeMap[String(n.id)] = n;
            });
          } else if (typeof m.nodes === 'object') {
            Object.keys(m.nodes).forEach(k => {
              nodeMap[String(k)] = m.nodes[k];
            });
          }
        }
      });
      return nodeMap;
    }

    function getEntityEffectiveNodeId(e, type) {
      if (!e) return null;
      const t = type || CurrentEntityTab;
      if (t === 'item' || t === 'resource') {
        return (typeof getItemEffectiveNodeId === 'function') ? getItemEffectiveNodeId(e) : (e.nodeId != null ? e.nodeId : (e.location && e.location.nodeId));
      }
      if (t === 'creature') {
        return (typeof getCreatureEffectiveNodeId === 'function') ? getCreatureEffectiveNodeId(e) : ((e.stationing && e.stationing.nodeId != null) ? e.stationing.nodeId : (e.nodeId != null ? e.nodeId : null));
      }
      return e.nodeId != null ? e.nodeId : (e.headquartersNodeId != null ? e.headquartersNodeId : null);
    }

    function openEntityManager(type, selectEntityId) {
      closeAllMenus();
      CurrentEntityTab = normalizeEntityType(type);
      if (typeof window !== 'undefined') window.CurrentEntityTab = CurrentEntityTab;
      SelectedEntityId = selectEntityId || null;
      SelectedEntityFilter = 'all';

      MDIWindowManager.open('modal-entity-manager');
      if (typeof initWorkspaceSplitters === 'function') {
        initWorkspaceSplitters();
      }

      updateEntityTabButtons();
      renderEntityManagerTree();
      renderEntityManagerList();

      if (SelectedEntityId) {
        selectEntityItem(SelectedEntityId);
      }
    }

    function switchEntityManagerTab(type) {
      CurrentEntityTab = normalizeEntityType(type);
      if (typeof window !== 'undefined') window.CurrentEntityTab = CurrentEntityTab;
      SelectedEntityId = null;
      SelectedEntityFilter = 'all';
      updateEntityTabButtons();
      renderEntityManagerTree();
      renderEntityManagerList();
      document.getElementById('em-detail-pane').innerHTML = '<div style="font-size:11px; color:#666; text-align:center; margin-top:40px;">Select an item to inspect, edit, or station to a node.</div>';
    }

    function updateEntityTabButtons() {
      ['npc', 'quest', 'item', 'resource', 'creature', 'tracker', 'faction', 'node', 'edge'].forEach(t => {
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
        'resource': 'Resource & Commodity Catalog - Physical Logistics & Supply Chains',
        'creature': 'Bestiary & Encounter Matrix - Ecological Threats & Heuristics',
        'tracker': 'Threat Clocks & Trackers - Escalation Dials',
        'faction': 'Faction Dossier - Cultural Alignment & Diplomatic Matrix',
        'node': 'Node Explorer - Spatial Topology & Hub Roster',
        'edge': 'EM Edge Explorer - Spatial Corridors & Conduits'
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
        } else if (CurrentEntityTab === 'edge') {
          btnNew.textContent = '+ New Edge...';
        } else if (CurrentEntityTab === 'faction') {
          btnNew.textContent = '+ New Faction...';
        } else if (CurrentEntityTab === 'resource') {
          btnNew.textContent = '+ New Resource...';
        } else if (CurrentEntityTab === 'creature') {
          btnNew.textContent = '+ New Creature...';
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

        // 1. Map Hierarchy & Scale-Fluid Child Maps Scope
        const mapHeader = document.createElement('div');
        mapHeader.style.padding = '4px 6px 2px 6px';
        mapHeader.style.fontSize = '10px';
        mapHeader.style.fontWeight = 'bold';
        mapHeader.style.color = '#555';
        mapHeader.textContent = 'MAP SCOPE & CHILD MAPS:';
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

      if (CurrentEntityTab === 'edge') {
        // EDGE EXPLORER TREE
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});
        const curMapName = (mapDict[curMapId] && mapDict[curMapId].name) || (topo && topo.name) || "Root Map";

        const activeEdges = getEdgesForMapScope('all');
        const allMapsEdges = getEdgesForMapScope('map:all');

        // 1. Map Hierarchy & Scale-Fluid Child Maps Scope
        const mapHeader = document.createElement('div');
        mapHeader.style.padding = '4px 6px 2px 6px';
        mapHeader.style.fontSize = '10px';
        mapHeader.style.fontWeight = 'bold';
        mapHeader.style.color = '#555';
        mapHeader.textContent = 'MAP SCOPE & CHILD MAPS:';
        container.appendChild(mapHeader);

        addTreeItem(container, `Active Map: ${curMapName} (${activeEdges.length})`, 'all');
        if (Object.keys(mapDict).length > 1) {
          addTreeItem(container, `All Maps Global (${allMapsEdges.length})`, 'map:all');
          Object.keys(mapDict).forEach(mId => {
            const m = mapDict[mId];
            const mName = m.name || mId;
            const count = getEdgesForMapScope(`map:${mId}`).length;
            addTreeItem(container, `🌀 ${mName} (${count})`, `map:${mId}`);
          });
        }

        // 2. By Classification
        const classHeader = document.createElement('div');
        classHeader.style.padding = '8px 6px 2px 6px';
        classHeader.style.fontSize = '10px';
        classHeader.style.fontWeight = 'bold';
        classHeader.style.color = '#555';
        classHeader.textContent = 'BY CLASSIFICATION:';
        container.appendChild(classHeader);

        const roadCount = activeEdges.filter(e => e.edgeType === 'road').length;
        const hegemCount = activeEdges.filter(e => e.edgeType === 'hegemony').length;
        addTreeItem(container, `Transit Roads (Bidirectional) (${roadCount})`, 'type:road');
        addTreeItem(container, `Hegemonic Vectors (Directional) (${hegemCount})`, 'type:hegemony');

        // 3. By Conduit & Logistics
        const conduitHeader = document.createElement('div');
        conduitHeader.style.padding = '8px 6px 2px 6px';
        conduitHeader.style.fontSize = '10px';
        conduitHeader.style.fontWeight = 'bold';
        conduitHeader.style.color = '#555';
        conduitHeader.textContent = 'BY CONDUIT & LOGISTICS:';
        container.appendChild(conduitHeader);

        const flowsCount = activeEdges.filter(e => Array.isArray(e.dedicatedFlows) && e.dedicatedFlows.length > 0).length;
        addTreeItem(container, `With Dedicated Supply Flows (${flowsCount})`, 'has:flows');
        ['Caravan Trade Route', 'Arcane / Ley Conduit', 'Aqueduct / Pipeline', 'Smuggling Tunnel', 'Military Supply Line'].forEach(cType => {
          const cCount = activeEdges.filter(e => e.conduitType === cType).length;
          if (cCount > 0) {
            addTreeItem(container, `${cType} (${cCount})`, `conduit:${cType}`);
          }
        });

        // 4. By Condition & Hazard
        const condHeader = document.createElement('div');
        condHeader.style.padding = '8px 6px 2px 6px';
        condHeader.style.fontSize = '10px';
        condHeader.style.fontWeight = 'bold';
        condHeader.style.color = '#555';
        condHeader.textContent = 'BY CONDITION & HAZARD:';
        container.appendChild(condHeader);

        const openCount = activeEdges.filter(e => !e.blocked && e.visible !== false && e.hazardLevel < 2).length;
        const highHazardCount = activeEdges.filter(e => e.hazardLevel >= 2).length;
        const blockedCount = activeEdges.filter(e => e.blocked || e.condition.toLowerCase().includes('blockaded') || e.condition.toLowerCase().includes('besieged')).length;
        const secretCount = activeEdges.filter(e => e.visible === false).length;

        addTreeItem(container, `Passable / Open (${openCount})`, 'status:open');
        addTreeItem(container, `High Hazard (Level 2+) (${highHazardCount})`, 'hazard:high');
        if (blockedCount > 0) addTreeItem(container, `Blockaded / Impassable (${blockedCount})`, 'status:blocked');
        if (secretCount > 0) addTreeItem(container, `Secret Roads (Hidden Fog) (${secretCount})`, 'status:secret');

        // 5. Topology Activity
        const actHeader = document.createElement('div');
        actHeader.style.padding = '8px 6px 2px 6px';
        actHeader.style.fontSize = '10px';
        actHeader.style.fontWeight = 'bold';
        actHeader.style.color = '#555';
        actHeader.textContent = 'TOPOLOGY ACTIVITY:';
        container.appendChild(actHeader);

        const modCount = activeEdges.filter(e => Array.isArray(e.modules) && e.modules.length > 0).length;
        addTreeItem(container, `With Slotted Modules (${modCount})`, 'has:modules');
        const contestedCount = activeEdges.filter(e => (e.patrolFaction && e.patrolFaction.toLowerCase() === 'contested') || (Array.isArray(e.factionPresence) && e.factionPresence.length > 1)).length;
        if (contestedCount > 0) {
          addTreeItem(container, `Contested / Guarded Routes (${contestedCount})`, 'has:contested');
        }
        return;
      }

      if (CurrentEntityTab === 'faction') {
        // FACTION DOSSIER TREE
        const activeFactions = getActiveEntityList('faction');

        const allHeader = document.createElement('div');
        allHeader.style.padding = '4px 6px 2px 6px';
        allHeader.style.fontSize = '10px';
        allHeader.style.fontWeight = 'bold';
        allHeader.style.color = '#555';
        allHeader.textContent = 'FACTIONS SCOPE:';
        container.appendChild(allHeader);

        addTreeItem(container, `All Factions (${activeFactions.length})`, 'all');

        // 1. By Cultural Quadrant
        const cultHeader = document.createElement('div');
        cultHeader.style.padding = '8px 6px 2px 6px';
        cultHeader.style.fontSize = '10px';
        cultHeader.style.fontWeight = 'bold';
        cultHeader.style.color = '#555';
        cultHeader.textContent = 'BY CULTURAL QUADRANT:';
        container.appendChild(cultHeader);

        ['Clan', 'Adhocracy', 'Market', 'Hierarchy'].forEach(c => {
          const count = activeFactions.filter(f => f.cvfQuadrant === c).length;
          addTreeItem(container, `${c} (${count})`, `culture:${c}`);
        });

        // 2. Territorial Influence
        const terrHeader = document.createElement('div');
        terrHeader.style.padding = '8px 6px 2px 6px';
        terrHeader.style.fontSize = '10px';
        terrHeader.style.fontWeight = 'bold';
        terrHeader.style.color = '#555';
        terrHeader.textContent = 'TERRITORIAL INFLUENCE:';
        container.appendChild(terrHeader);

        const hqCount = activeFactions.filter(f => f.headquartersNodeId != null).length;
        const terrCount = activeFactions.filter(f => Array.isArray(f.controlledNodeIds) && f.controlledNodeIds.length > 0).length;
        const unseatedCount = activeFactions.filter(f => !f.headquartersNodeId && (!Array.isArray(f.controlledNodeIds) || f.controlledNodeIds.length === 0)).length;

        addTreeItem(container, `With Headquarters (${hqCount})`, 'has:hq');
        addTreeItem(container, `Controlling Territory (${terrCount})`, 'has:territory');
        if (unseatedCount > 0) {
          addTreeItem(container, `Unseated / Nomadic (${unseatedCount})`, 'has:unseated');
        }
        return;
      }

      // ENTITIES (NPCS, QUESTS, ITEMS, RESOURCES, CREATURES, TRACKERS) TREE
      const activeList = getActiveEntityList(CurrentEntityTab);
      const protoList = getPrototypesForType(CurrentEntityTab);

      // 1. All Active
      addTreeItem(container, `All Active (${activeList.length})`, 'all');
      addTreeItem(container, `Unassigned (${activeList.filter(e => !getEntityEffectiveNodeId(e)).length})`, 'unassigned');

      // Resource Sectors & Physical Logistics
      if (CurrentEntityTab === 'resource') {
        const secHeader = document.createElement('div');
        secHeader.style.padding = '8px 6px 2px 6px';
        secHeader.style.fontSize = '10px';
        secHeader.style.fontWeight = 'bold';
        secHeader.style.color = '#555';
        secHeader.textContent = 'BY COMMODITY SECTOR:';
        container.appendChild(secHeader);

        const getResourceSector = (r) => {
          const cat = r.category || '';
          const m = cat.match(/(?:Commodity|Resource)\s*:\s*([^,;]+)/i);
          if (m) return m[1].trim();
          if (cat.includes('_and_')) return cat.replace(/_/g, ' ');
          return cat || 'General Commodities';
        };

        const sectorMap = {};
        activeList.forEach(r => {
          const s = getResourceSector(r);
          sectorMap[s] = (sectorMap[s] || 0) + 1;
        });

        Object.keys(sectorMap).sort().forEach(sec => {
          addTreeItem(container, `${sec} (${sectorMap[sec]})`, `sector:${sec}`);
        });

        const logHeader = document.createElement('div');
        logHeader.style.padding = '8px 6px 2px 6px';
        logHeader.style.fontSize = '10px';
        logHeader.style.fontWeight = 'bold';
        logHeader.style.color = '#555';
        logHeader.textContent = 'BY PHYSICAL LOGISTICS:';
        container.appendChild(logHeader);

        const allNodesMap = getAllKnownNodesMap();
        let stockpiledCount = 0;
        let haltedCount = 0;
        activeList.forEach(r => {
          const effNid = getEntityEffectiveNodeId(r);
          const n = effNid ? allNodesMap[String(effNid)] : null;
          const modD = n && n.modData && n.modData.pre_industrial_resources;
          if (modD) {
            if (modD.stockpile && Object.keys(modD.stockpile).length > 0) stockpiledCount++;
            if (modD.backpressureHalt) haltedCount++;
          }
        });
        addTreeItem(container, `With Depot Stockpile (${stockpiledCount})`, 'logistics:stockpiled');
        if (haltedCount > 0) {
          addTreeItem(container, `⛔ Backpressure Halted (${haltedCount})`, 'logistics:backpressure');
        }
      }

      // Bestiary Threat Tiers (Creatures)
      if (CurrentEntityTab === 'creature') {
        const threatHeader = document.createElement('div');
        threatHeader.style.padding = '8px 6px 2px 6px';
        threatHeader.style.fontSize = '10px';
        threatHeader.style.fontWeight = 'bold';
        threatHeader.style.color = '#555';
        threatHeader.textContent = 'BY THREAT TIER:';
        container.appendChild(threatHeader);

        const threatNames = {
          '0': 'Tier 0: Minion / Vermin',
          '1': 'Tier 1: Common Encounter',
          '2': 'Tier 2: Dangerous Threat',
          '3': 'Tier 3: Apex / Elite Lair',
          '4': 'Tier 4: Legendary Monster',
          '5': 'Tier 5: World-Ender Crucible'
        };
        for (let t = 0; t <= 5; t++) {
          const count = activeList.filter(c => (c.threatTier !== undefined ? c.threatTier : 2) === t).length;
          if (count > 0) {
            addTreeItem(container, `${threatNames[t] || `Tier ${t}`} (${count})`, `threat:${t}`);
          }
        }
      }

      // Tracker Scope Tiers (DEV-03)
      if (CurrentEntityTab === 'tracker') {
        const tierHeader = document.createElement('div');
        tierHeader.style.padding = '8px 6px 2px 6px';
        tierHeader.style.fontSize = '10px';
        tierHeader.style.fontWeight = 'bold';
        tierHeader.style.color = '#555';
        tierHeader.textContent = 'BY SCOPE TIER:';
        container.appendChild(tierHeader);

        const normTrackerScope = (t) => {
          const raw = (t && t.scopeTier ? t.scopeTier : 'settlement').toLowerCase();
          return raw === 'city' ? 'settlement' : raw;
        };

        ['quest', 'settlement', 'faction', 'world'].forEach(sc => {
          const count = activeList.filter(t => normTrackerScope(t) === sc).length;
          const label = sc === 'settlement' ? 'CITY / SETTLEMENT' : sc.toUpperCase();
          addTreeItem(container, `${label} Scope (${count})`, `scope:${sc}`);
        });
      }

      // 2. By Node Section (Aggregated Multi-Map Topology)
      const nodeHeader = document.createElement('div');
      nodeHeader.style.padding = '4px 6px 2px 6px';
      nodeHeader.style.fontSize = '10px';
      nodeHeader.style.fontWeight = 'bold';
      nodeHeader.style.color = '#555';
      nodeHeader.textContent = 'BY NODE STATION:';
      container.appendChild(nodeHeader);

      const allKnownNodes = getAllKnownNodesMap();
      Object.keys(allKnownNodes).forEach(k => {
        const count = activeList.filter(e => String(getEntityEffectiveNodeId(e)) === String(k)).length;
        if (count > 0) {
          const n = allKnownNodes[k];
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


    let CurrentEntitySort = 'default';
    function setEntityManagerSort(sortMode) {
      CurrentEntitySort = sortMode || 'default';
      renderEntityManagerList();
    }
    window.setEntityManagerSort = setEntityManagerSort;

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
          const nodeTickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('node', node.id) : [];
          const nodeTkBadge = nodeTickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${nodeTickets.length}</span>` : '';

          tr.innerHTML = `
            <td><strong>${colorDot}#${node.id}${hiddenBadge}${lockBadge}</strong></td>
            ${isMultiMapScope ? `<td><span class="entity-badge-tag" style="font-size:9px;" title="${node._mapName}">${node._mapName || nodeMapId}</span></td>` : ''}
            <td><strong>${node.name}</strong>${submapBadge}${nodeTkBadge}</td>
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

      if (CurrentEntityTab === 'edge') {
        // EDGE EXPLORER TABLE
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        const mapDict = (typeof maps !== "undefined" && maps) ? maps : (topo && topo.maps ? topo.maps : {});
        const isMultiMapScope = SelectedEntityFilter === 'map:all' || SelectedEntityFilter.startsWith('map:');

        thead.innerHTML = `<th style="width:70px;">Key</th>${isMultiMapScope ? '<th style="width:85px;">Map</th>' : ''}<th>Corridor / Conduit Name</th><th style="width:160px;">Endpoints</th><th style="width:85px;">Type</th><th style="width:110px;">Condition &amp; Hazard</th><th style="width:80px;">Length</th><th style="width:110px;">Conduit / Flows</th><th style="width:50px; text-align:center;">Mods</th><th style="width:75px; text-align:center;">Action</th>`;

        const allEdges = getEdgesForMapScope(SelectedEntityFilter);
        let displayEdges = allEdges.filter(e => {
          if (!searchTerm) return true;
          const uName = (e.uNode && e.uNode.name) || '';
          const vName = (e.vNode && e.vNode.name) || '';
          const flowsStr = Array.isArray(e.dedicatedFlows) ? e.dedicatedFlows.map(f => typeof f === 'string' ? f : (f && f.tag ? f.tag : '')).join(' ') : '';
          const modsStr = Array.isArray(e.modules) ? e.modules.join(' ') : '';
          const matchStr = `${e.name} ${e.edgeKey} ${e.uId} ${e.vId} ${uName} ${vName} ${e.conduitType} ${flowsStr} ${modsStr} ${e.notes}`.toLowerCase();
          return matchStr.includes(searchTerm);
        });

        displayEdges.forEach(edge => {
          const tr = document.createElement('tr');
          if (SelectedEntityId && (String(SelectedEntityId) === String(edge.edgeKey) || String(SelectedEntityId) === String(edge.pairKey))) {
            tr.classList.add('selected');
          }

          const isHegem = edge.edgeType === 'hegemony';
          const glyph = isHegem ? '⚔️' : '🛣️';
          const typeBadge = isHegem
            ? `<span class="entity-badge-tag" style="background:#7f1d1d; color:#fff;">Hegemony</span>`
            : `<span class="entity-badge-tag" style="background:#1e3a8a; color:#fff;">Road</span>`;

          let statusIcons = '';
          if (edge.visible === false) statusIcons += ' <span title="Secret / Concealed Road (Hidden in Player View)">👁️‍🗨️</span>';
          if (edge.blocked) statusIcons += ' <span title="Blockaded / Impassable" style="color:#b91c1c;">🚫</span>';

          const mapCell = isMultiMapScope
            ? `<td><span class="entity-badge-tag" style="background:#334155; color:#fff;">${edge._mapName}</span></td>`
            : '';

          const uName = (edge.uNode && edge.uNode.name) || `Node ${edge.uId}`;
          const vName = (edge.vNode && edge.vNode.name) || `Node ${edge.vId}`;
          const dirArrow = isHegem ? '➔' : '⮂';

          let condPill = `<span class="entity-badge-tag" style="background:#15803d; color:#fff;">Passable</span>`;
          if (edge.blocked) {
            condPill = `<span class="entity-badge-tag" style="background:#b91c1c; color:#fff;">Blockaded</span>`;
          } else if (edge.hazardLevel >= 3) {
            condPill = `<span class="entity-badge-tag" style="background:#991b1b; color:#fff;">Hazard L${edge.hazardLevel}</span>`;
          } else if (edge.hazardLevel >= 1) {
            condPill = `<span class="entity-badge-tag" style="background:#d97706; color:#fff;">Hazard L${edge.hazardLevel}</span>`;
          } else if (edge.condition && edge.condition !== 'Passable') {
            condPill = `<span class="entity-badge-tag" style="background:#475569; color:#fff;">${edge.condition}</span>`;
          }

          const flowTags = Array.isArray(edge.dedicatedFlows) ? edge.dedicatedFlows.map(f => typeof f === 'string' ? f : (f && f.tag ? f.tag : '')).filter(Boolean) : [];
          let conduitHtml = `<span style="font-size:10px; color:#555;">${edge.conduitType || 'Standard'}</span>`;
          if (flowTags.length > 0) {
            conduitHtml += `<div style="font-size:9px; color:#065f46; font-weight:bold;">[${flowTags.slice(0, 2).join(', ')}${flowTags.length > 2 ? '...' : ''}]</div>`;
          }

          const modsBadge = (edge.modules && edge.modules.length > 0)
            ? `<span class="entity-badge-tag" style="background:#701a75; color:#fff;">M:${edge.modules.length}</span>`
            : `<span style="color:#aaa;">-</span>`;

          const escapedKey = escapeJsArg(edge.edgeKey);
          const escapedMapId = escapeJsArg(edge._mapId);
          const edgeTickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('edge', edge.edgeKey || edge.id) : [];
          const edgeTkBadge = edgeTickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${edgeTickets.length}</span>` : '';

          const displayInfo = getEdgeDisplayInfo(edge);
          const nameCellHtml = displayInfo.endpointsSubtitle
            ? `
              <div style="font-weight:bold; color:#0f172a; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(displayInfo.primaryTitle)}">${escapeHtml(displayInfo.primaryTitle)}${edgeTkBadge}</div>
              <div style="font-size:10px; color:#334155; font-weight:500; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(displayInfo.endpointsSubtitle)}">${escapeHtml(displayInfo.endpointsSubtitle)}</div>
              <div style="font-size:9px; color:#64748b;">${escapeHtml(displayInfo.metaSubtitle)}</div>
            `
            : `
              <div style="font-weight:bold; color:#0f172a; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(displayInfo.primaryTitle)}">${escapeHtml(displayInfo.primaryTitle)}${edgeTkBadge}</div>
              <div style="font-size:9px; color:#64748b;">${escapeHtml(displayInfo.metaSubtitle)}</div>
            `;

          tr.innerHTML = `
            <td><strong>${glyph} ${edge.edgeKey}</strong>${statusIcons}</td>
            ${mapCell}
            <td>
              ${nameCellHtml}
            </td>
            <td>
              <div style="display:flex; align-items:center; gap:2px; font-size:10px;">
                <button class="win-btn" style="padding:1px 3px; font-size:9px;" onclick="event.stopPropagation(); selectEntityItem('${escapeJsArg(edge.uId)}', false, '${escapedMapId}'); switchEntityManagerTab('node');">#${edge.uId}</button>
                <span>${dirArrow}</span>
                <button class="win-btn" style="padding:1px 3px; font-size:9px;" onclick="event.stopPropagation(); selectEntityItem('${escapeJsArg(edge.vId)}', false, '${escapedMapId}'); switchEntityManagerTab('node');">#${edge.vId}</button>
              </div>
            </td>
            <td>${typeBadge}</td>
            <td>${condPill}</td>
            <td style="font-size:10px;">${edge.formattedDist}</td>
            <td>${conduitHtml}</td>
            <td style="text-align:center;">${modsBadge}</td>
            <td style="text-align:center;">
              <button class="win-btn" style="font-size:9px; padding:1px 4px;" title="Focus Corridor on Canvas" onclick="event.stopPropagation(); jumpToEdgeMap('${escapedMapId}', '${escapedKey}', '${escapeJsArg(edge.uId)}', '${escapeJsArg(edge.vId)}', '${escapeJsArg(edge.edgeType)}');">Go</button>
              <button class="win-btn" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Sever / Delete Corridor" onclick="event.stopPropagation(); if (confirm('Sever this ${edge.edgeType} connection between Node ${edge.uId} and Node ${edge.vId}?')) { deleteEdge('${escapeJsArg(edge.uId)}', '${escapeJsArg(edge.vId)}', '${escapeJsArg(edge.edgeType)}'); renderEntityManagerTree(); renderEntityManagerList(); }">Del</button>
            </td>
          `;

          tr.onclick = () => selectEntityItem(edge.edgeKey, false, edge._mapId);
          tbody.appendChild(tr);
        });

        document.getElementById('em-footer-stats').textContent = `Showing ${displayEdges.length} edges and conduits (${SelectedEntityFilter}).`;
        return;
      }

      // ENTITIES (NPCS, QUESTS, ITEMS, RESOURCES, CREATURES, TRACKERS) TABLE
      if (CurrentEntityTab === 'npc') {
        thead.innerHTML = '<th style="min-width:130px;">Name</th><th style="min-width:120px;">Role &amp; Status</th><th style="width:75px;">Standing</th><th style="min-width:150px;">Stationed Node</th><th style="width:110px;">Culture / [S,E,C]</th><th>Source</th><th style="width:35px; text-align:center;">Action</th>';
      } else if (CurrentEntityTab === 'quest') {
        thead.innerHTML = '<th>Quest Title</th><th>Type / Stakes</th><th style="min-width:150px;">Stationed Node</th><th>Source</th><th style="width:35px; text-align:center;">Action</th>';
      } else if (CurrentEntityTab === 'resource') {
        thead.innerHTML = '<th style="min-width:130px;">Resource / Commodity</th><th style="min-width:110px;">Sector / Category</th><th style="width:110px;">Stockpile &amp; Units</th><th style="min-width:150px;">Stationed Node / Depot</th><th>Source Mod</th><th style="width:35px; text-align:center;">Action</th>';
      } else if (CurrentEntityTab === 'creature') {
        thead.innerHTML = '<th style="min-width:140px;">Creature / Monster</th><th style="width:85px;">Threat Tier</th><th style="width:110px;">Kind / Subtype</th><th style="width:75px;">Dread</th><th style="min-width:150px;">Lair / Station Node</th><th>Source Campaign</th><th style="width:35px; text-align:center;">Action</th>';
      } else if (CurrentEntityTab === 'tracker') {
        thead.innerHTML = '<th>Threat / Clock Title</th><th style="width:75px;">Scope Tier</th><th style="width:85px;">Type</th><th style="width:95px;">Ticks / Progress</th><th style="min-width:140px;">Stationed Node</th><th>Source / Faction</th><th style="width:35px; text-align:center;">Action</th>';
      } else if (CurrentEntityTab === 'faction') {
        thead.innerHTML = '<th style="min-width:140px;">Faction Name</th><th style="min-width:110px;">CVF Culture</th><th style="width:75px;">Color</th><th>Leader NPC</th><th style="min-width:150px;">Headquarters</th><th style="width:85px;">Territory</th><th style="width:35px; text-align:center;">Action</th>';
      } else {
        thead.innerHTML = '<th style="min-width:130px;">Item / Relic Name</th><th>Category</th><th>Owner &amp; Carrier</th><th style="min-width:150px;">Stationed Node</th><th>Source</th><th style="width:35px; text-align:center;">Action</th>';
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
            activeNodeId: activeInstance ? getEntityEffectiveNodeId(activeInstance) : null,
            currentTicks: activeInstance ? activeInstance.currentTicks : p.currentTicks,
            ownerNpcId: activeInstance ? activeInstance.ownerNpcId : p.ownerNpcId,
            possessionMode: activeInstance ? activeInstance.possessionMode : p.possessionMode,
            status: activeInstance ? activeInstance.status : p.status,
            dispositionToParty: activeInstance ? activeInstance.dispositionToParty : p.dispositionToParty
          };
        });
      } else {
        displayList = activeList.filter(item => {
          if (CurrentEntityTab === 'faction') {
            if (SelectedEntityFilter.startsWith('culture:')) {
              return item.cvfQuadrant === SelectedEntityFilter.replace('culture:', '');
            }
            if (SelectedEntityFilter === 'has:hq') {
              return item.headquartersNodeId != null;
            }
            if (SelectedEntityFilter === 'has:territory') {
              return Array.isArray(item.controlledNodeIds) && item.controlledNodeIds.length > 0;
            }
            if (SelectedEntityFilter === 'has:unseated') {
              return !item.headquartersNodeId && (!Array.isArray(item.controlledNodeIds) || item.controlledNodeIds.length === 0);
            }
          }
          if (CurrentEntityTab === 'resource') {
            if (SelectedEntityFilter.startsWith('sector:')) {
              const sec = SelectedEntityFilter.replace('sector:', '').toLowerCase();
              const cat = (item.category || '').toLowerCase();
              return cat.includes(sec);
            }
            if (SelectedEntityFilter === 'logistics:stockpiled') {
              const eff = getEntityEffectiveNodeId(item);
              const allN = getAllKnownNodesMap();
              const n = eff ? allN[String(eff)] : null;
              return !!(n && n.modData && n.modData.pre_industrial_resources && n.modData.pre_industrial_resources.stockpile && Object.keys(n.modData.pre_industrial_resources.stockpile).length > 0);
            }
            if (SelectedEntityFilter === 'logistics:backpressure') {
              const eff = getEntityEffectiveNodeId(item);
              const allN = getAllKnownNodesMap();
              const n = eff ? allN[String(eff)] : null;
              return !!(n && n.modData && n.modData.pre_industrial_resources && n.modData.pre_industrial_resources.backpressureHalt);
            }
          }
          if (CurrentEntityTab === 'creature') {
            if (SelectedEntityFilter.startsWith('threat:')) {
              const th = parseInt(SelectedEntityFilter.replace('threat:', ''), 10);
              return (item.threatTier !== undefined ? item.threatTier : 2) === th;
            }
          }
          if (CurrentEntityTab === 'tracker' && SelectedEntityFilter.startsWith('scope:')) {
            const sc = SelectedEntityFilter.replace('scope:', '').toLowerCase();
            const rawTier = (item.scopeTier || 'settlement').toLowerCase();
            const normTier = (rawTier === 'city') ? 'settlement' : rawTier;
            return normTier === (sc === 'city' ? 'settlement' : sc);
          }
          if (SelectedEntityFilter === 'unassigned') {
            const effNode = getEntityEffectiveNodeId(item);
            return !effNode;
          }
          if (SelectedEntityFilter.startsWith('node:')) {
            const nId = SelectedEntityFilter.replace('node:', '');
            const effNode = getEntityEffectiveNodeId(item);
            return String(effNode) === String(nId);
          }
          return true;
        });

        if (CurrentEntitySort === 'name') {
          displayList.sort((a, b) => String(a.name || a.title || '').localeCompare(String(b.name || b.title || '')));
        } else if (CurrentEntitySort === 'scope') {
          const scopeRank = { world: 4, faction: 3, settlement: 2, city: 2, quest: 1 };
          displayList.sort((a, b) => {
            if (CurrentEntityTab === 'tracker') {
              const rA = scopeRank[(a.scopeTier || 'settlement').toLowerCase()] || 0;
              const rB = scopeRank[(b.scopeTier || 'settlement').toLowerCase()] || 0;
              if (rB !== rA) return rB - rA;
            }
            return String(a.role || a.category || a.type || a.scopeTier || '').localeCompare(String(b.role || b.category || b.type || b.scopeTier || ''));
          });
        } else if (CurrentEntitySort === 'progress' || (CurrentEntitySort === 'default' && CurrentEntityTab === 'tracker')) {
          displayList.sort((a, b) => {
            const pA = (a.currentTicks || 0) / (a.maxTicks || 6);
            const pB = (b.currentTicks || 0) / (b.maxTicks || 6);
            return pB - pA;
          });
        } else if (CurrentEntitySort === 'node') {
          displayList.sort((a, b) => String(a.nodeId || a.headquartersNodeId || 'zzz').localeCompare(String(b.nodeId || b.headquartersNodeId || 'zzz')));
        }
      }

      // Filter by search keyword
      if (searchTerm) {
        displayList = displayList.filter(e => {
          const name = (e.name || e.title || '').toLowerCase();
          const role = (e.role || e.category || e.type || '').toLowerCase();
          const mod = (e.moduleId || '').toLowerCase();
          const notes = (e.notes || e.motivation || '').toLowerCase();
          const faction = (e.faction || '').toLowerCase();
          const desc = (e.description || '').toLowerCase();
          const cvf = (e.cvfQuadrant || '').toLowerCase();
          const targetNid = (CurrentEntityTab === 'item') ? getItemEffectiveNodeId(e) : (e.activeNodeId || e.nodeId || e.headquartersNodeId);
          const locStr = targetNid ? formatNodeRef(targetNid, topo).toLowerCase() : '';
          return name.includes(searchTerm) || role.includes(searchTerm) || mod.includes(searchTerm) || notes.includes(searchTerm) || faction.includes(searchTerm) || desc.includes(searchTerm) || cvf.includes(searchTerm) || locStr.includes(searchTerm);
        });
      }

      displayList.forEach(item => {
        const tr = document.createElement('tr');
        if (SelectedEntityId === item.id) tr.className = 'selected';

        const nameVal = item.name || item.title;
        const roleVal = item.role || item.category || item.type;
        const nodeVal = item.isPrototype ? (item.inCampaign ? `${formatNodeRef(item.activeNodeId, topo)} (In Use)` : '(In Pool)') : formatNodeRef(item.nodeId, topo);
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
          const tickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('npc', item.id) : [];
          const tkBadge = tickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${tickets.length}</span>` : '';

          tr.innerHTML = `
            <td><strong>👤 ${nameVal}</strong>${tkBadge}</td>
            <td><div>${roleVal || '-'}</div><div style="margin-top:2px;">${statusBadge}</div></td>
            <td>${standingBadge}</td>
            <td>${nodeVal}</td>
            <td>${cultBadge}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('npc', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete NPC">Del</button></td>
          `;
        } else if (CurrentEntityTab === 'resource') {
          const effNodeId = getEntityEffectiveNodeId(item);
          const formattedNode = effNodeId ? formatNodeRef(effNodeId, topo) : '(Unassigned Depot)';
          const tickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('item', item.id) : [];
          const tkBadge = tickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${tickets.length}</span>` : '';

          let stockpileDisplay = `<span style="color:#64748b;">${escapeHtml(item.specs || 'Batch Standard')}</span>`;
          if (effNodeId) {
            const allNodesMap = getAllKnownNodesMap();
            const n = allNodesMap[String(effNodeId)];
            const modD = n && n.modData && n.modData.pre_industrial_resources;
            if (modD && modD.stockpile) {
              const matchedKey = Object.keys(modD.stockpile).find(k => k.toLowerCase().includes((item.name || '').toLowerCase()));
              if (matchedKey) {
                stockpileDisplay = `<strong style="color:#0f766e;">${modD.stockpile[matchedKey]} units</strong> in depot`;
              }
            }
          }

          const escapedId = escapeJsArg(item.id);
          tr.innerHTML = `
            <td><strong>📦 ${nameVal}</strong>${tkBadge}</td>
            <td><span class="entity-badge-tag" style="background:#e0f2fe; color:#0369a1;">${roleVal || 'Commodity'}</span></td>
            <td>${stockpileDisplay}</td>
            <td>${formattedNode}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('resource', '${escapedId}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Resource">Del</button></td>
          `;
        } else if (CurrentEntityTab === 'item') {
          const ownerNpc = (topo.npcs || []).find(n => String(n.id) === String(item.ownerNpcId));
          const isCarried = (item.possessionMode === 'carried' && ownerNpc);
          const ownerBadge = ownerNpc
            ? `<span class="entity-badge-tag" style="${isCarried ? 'background:#0f766e; color:#fff;' : 'background:#475569; color:#fff;'}">${isCarried ? '🎒 ' : '📦 '}${ownerNpc.name}</span>`
            : '<span class="entity-badge-tag" style="background:#f1f5f9; color:#64748b;">(Unowned)</span>';

          const effNodeId = getItemEffectiveNodeId(item);
          const formattedNode = effNodeId ? formatNodeRef(effNodeId, topo) : '(Unassigned)';
          const nodeDisplay = effNodeId
            ? (isCarried ? `${formattedNode} <span style="font-size:9px; color:#0f766e; font-weight:bold;">(Carried)</span>` : formattedNode)
            : '(Unassigned)';
          const tickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('item', item.id) : [];
          const tkBadge = tickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${tickets.length}</span>` : '';

          tr.innerHTML = `
            <td><strong>💎 ${nameVal}</strong>${tkBadge}</td>
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
          const scopeTier = item.scopeTier || 'settlement';
          const scopeBadgeColor = scopeTier === 'world' ? '#dc2626' : (scopeTier === 'faction' ? '#d97706' : (scopeTier === 'settlement' ? '#2563eb' : '#16a34a'));
          const tickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('tracker', item.id) : [];
          const tkBadge = tickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${tickets.length}</span>` : '';

          tr.innerHTML = `
            <td><strong>⏱️ ${nameVal}</strong>${tkBadge}</td>
            <td><span class="entity-badge-tag" style="background:${scopeBadgeColor}; color:#fff; text-transform:uppercase; font-size:8px;">${scopeTier}</span></td>
            <td><span class="me-badge ${isTriggered ? 'me-badge-crisis' : ''}">${roleVal || 'Threat Clock'}</span></td>
            <td>
              <span class="clock-mini-gauge">${gaugeHtml}</span>
              <strong style="font-size:10px; color:${isTriggered ? '#b91c1c' : '#333'}; margin-left:3px;">${curTicks}/${maxTicks}</strong>
            </td>
            <td>${nodeVal}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('tracker', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Clock">Del</button></td>
          `;
        } else if (CurrentEntityTab === 'faction') {
          const leaderNpc = (topo.npcs || []).find(n => String(n.id) === String(item.leaderNpcId));
          const leaderBadge = leaderNpc
            ? `<span class="entity-badge-tag" style="background:#0284c7; color:#fff; cursor:pointer;" onclick="event.stopPropagation(); switchEntityManagerTab('npc'); selectEntityItem('${leaderNpc.id}');">👤 ${leaderNpc.name}</span>`
            : '<span class="entity-badge-tag" style="background:#f1f5f9; color:#64748b;">(Council)</span>';
          const hqNode = item.headquartersNodeId ? formatNodeRef(item.headquartersNodeId, topo) : '(Unseated)';
          const terrCount = Array.isArray(item.controlledNodeIds) ? item.controlledNodeIds.length : 0;
          const cult = item.cvfQuadrant || 'Clan';
          const color = item.colorIdentity || 'C';
          const tickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('faction', item.id) : [];
          const tkBadge = tickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${tickets.length}</span>` : '';

          tr.innerHTML = `
            <td><strong>👑 ${nameVal}</strong>${tkBadge}</td>
            <td><span class="entity-badge-tag" style="background:#4338ca; color:#fff;">${cult}</span></td>
            <td><span class="entity-badge-tag" style="background:#0f172a; color:#f8fafc; font-weight:bold;">${color}</span></td>
            <td>${leaderBadge}</td>
            <td>${hqNode}</td>
            <td><span class="entity-badge-tag" style="background:#15803d; color:#fff;">${terrCount} Nodes</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('faction', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Faction">Del</button></td>
          `;
        } else {
          const tickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity('quest', item.id) : [];
          const tkBadge = tickets.length > 0 ? ` <span class="entity-badge-tag" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size:8px;">TK:${tickets.length}</span>` : '';
          tr.innerHTML = `
            <td><strong>📜 ${nameVal}</strong>${tkBadge}</td>
            <td>${roleVal || '-'}</td>
            <td>${nodeVal}</td>
            <td><span class="entity-badge-tag">${srcVal}</span></td>
            <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('quest', '${item.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Quest">Del</button></td>
          `;
        }

        tr.setAttribute('draggable', 'true');
        tr.title = 'Click to inspect • Drag onto the CAD Canvas to place or link into a Spatial Pin';
        tr.ondragstart = (ev) => {
          if (typeof onEntityListDragStart === 'function') {
            onEntityListDragStart(ev, CurrentEntityTab, item.id, nameVal, !!item.isPrototype);
          }
        };
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

    function switchEdgeDetailSubtab(subtab) {
      const overviewBtn = document.getElementById('em-edge-subtab-overview');
      const propsBtn = document.getElementById('em-edge-subtab-props');
      const overviewView = document.getElementById('em-edge-subtab-overview-view');
      const propsView = document.getElementById('em-edge-subtab-props-view');
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
    window.switchEdgeDetailSubtab = switchEdgeDetailSubtab;

    function renderAssignedTicketsSection(targetType, targetId, defaultNodeId = null) {
      const tickets = (typeof getTicketsForEntity === 'function') ? getTicketsForEntity(targetType, targetId) : [];
      let html = `
        <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; margin-top:6px; border-radius:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="font-size:10px; font-weight:bold; color:#000080;">AUTHORING TICKETS (${tickets.length}):</div>
            <button class="win-btn" onclick="if(typeof openNewCampaignTicketModal==='function') openNewCampaignTicketModal('${escapeJsArg(targetType)}', '${escapeJsArg(targetId)}', ${defaultNodeId != null ? `'${escapeJsArg(defaultNodeId)}'` : 'null'})" style="font-size:9px; padding:1px 5px; color:#000080;">+ New Ticket</button>
          </div>
      `;
      if (tickets.length === 0) {
        html += `<div style="font-size:9px; color:#64748b; font-style:italic;">No tickets assigned to this entity.</div>`;
      } else {
        html += `<div style="display:flex; flex-direction:column; gap:3px;">`;
        tickets.forEach(tk => {
          const statusSlug = (tk.status || 'draft').toLowerCase().replace(/\s+/g, '_');
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #e2e8f0; padding:2px 5px; border-radius:2px; font-size:10px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <strong style="color:#000080; cursor:pointer;" onclick="if(typeof openTicketCenter==='function') { openTicketCenter(); if(typeof switchTicketCenterTab==='function') switchTicketCenterTab('campaign'); selectTicket('${escapeJsArg(tk.id)}', 'campaign'); }">${tk.id}</strong>: ${escapeHtml(tk.title)}
              </div>
              <div style="display:flex; gap:3px; align-items:center;">
                <span class="ticket-badge-status status-${statusSlug}" style="font-size:8px; padding:0 3px;">${escapeHtml(tk.status || 'ready')}</span>
                <button class="win-btn" onclick="if(typeof openEditTicketModal==='function') openEditTicketModal('${escapeJsArg(tk.id)}')" style="font-size:8px; padding:0 3px;">✏️</button>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }
      html += `</div>`;
      return html;
    }
    window.renderAssignedTicketsSection = renderAssignedTicketsSection;

    function renderLinkedTrackersSection(targetType, targetId, defaultNodeId = null) {
      const trackers = (typeof getTrackersForEntity === 'function') ? getTrackersForEntity(targetType, targetId) : [];
      let html = `
        <div style="background:#fef2f2; border:1px solid #fecaca; padding:6px; margin-top:6px; border-radius:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="font-size:10px; font-weight:bold; color:#991b1b;">⏱️ LINKED THREAT CLOCKS (${trackers.length}):</div>
            <button class="win-btn" onclick="openNewEntityModal('tracker', ${defaultNodeId != null ? `'${escapeJsArg(defaultNodeId)}'` : 'null'})" style="font-size:9px; padding:1px 5px; color:#991b1b;">+ New Clock</button>
          </div>
      `;
      if (trackers.length === 0) {
        html += `<div style="font-size:9px; color:#64748b; font-style:italic;">No threat clocks linked to this ${escapeHtml(targetType)}.</div>`;
      } else {
        html += `<div style="display:flex; flex-direction:column; gap:3px;">`;
        trackers.forEach(trk => {
          const cur = trk.currentTicks || 0;
          const max = trk.maxTicks || 6;
          const gauge = renderMiniClockGauge(cur, max);
          const scope = (trk.scopeTier === 'city' ? 'settlement' : (trk.scopeTier || 'settlement')).toUpperCase();
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #fecaca; padding:3px 5px; border-radius:2px; font-size:10px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <strong style="color:#991b1b; cursor:pointer;" onclick="navigateToEntity('tracker', '${escapeJsArg(trk.id)}')">⏱️ ${escapeHtml(trk.name || trk.title)}</strong>
                <span class="entity-badge-tag" style="font-size:8px; background:#fee2e2; color:#991b1b;">${scope}</span>
                <span class="clock-mini-gauge" style="margin-left:3px;">${gauge}</span>
                <strong style="font-size:9px; color:#333;">${cur}/${max}</strong>
              </div>
              <div style="display:flex; gap:2px; align-items:center;">
                <button class="win-btn" onclick="advanceTrackerTick('${escapeJsArg(trk.id)}', -1); selectEntityItem('${escapeJsArg(targetId)}', false);" style="font-size:8px; padding:0 4px;" title="Decrement Tick">-1</button>
                <button class="win-btn" onclick="advanceTrackerTick('${escapeJsArg(trk.id)}', 1); selectEntityItem('${escapeJsArg(targetId)}', false);" style="font-size:8px; padding:0 4px; color:#991b1b; font-weight:bold;" title="Advance Tick">+1</button>
                <button class="win-btn" onclick="navigateToEntity('tracker', '${escapeJsArg(trk.id)}')" style="font-size:8px; padding:0 4px;">Inspect</button>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }
      html += `</div>`;
      return html;
    }
    window.renderLinkedTrackersSection = renderLinkedTrackersSection;

    function updateTrackerScopeTier(trackerId, newScope) {
      const activeList = getActiveEntityList('tracker');
      const trk = activeList.find(t => String(t.id) === String(trackerId) || String(t.prototypeId) === String(trackerId));
      if (!trk) return;
      trk.scopeTier = newScope || 'settlement';
      saveActiveCampaign();
      renderEntityManagerTree();
      renderEntityManagerList();
      selectEntityItem(trk.id, false);
      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(`Updated Clock "${trk.name}" Scope Tier to ${trk.scopeTier.toUpperCase()}.`);
      }
    }
    window.updateTrackerScopeTier = updateTrackerScopeTier;

    function advanceQuestStep(questId, stepIndex) {
      const topo = Workstation.activeTopology || {};
      const quest = (topo.quests || []).find(q => q.id === questId);
      if (!quest || !Array.isArray(quest.steps) || !quest.steps[stepIndex]) return;
      const step = quest.steps[stepIndex];
      step.isCompleted = true;

      if (step.triggerTrackerId) {
        const delta = step.tickDelta || 1;
        if (typeof advanceTrackerTick === 'function') {
          const trk = advanceTrackerTick(step.triggerTrackerId, delta);
          if (trk) {
            const maxTicks = trk.maxTicks || 6;
            if (typeof setStatusBarMessage === 'function') {
              setStatusBarMessage(`Advanced Quest Step: "${step.title}". Triggered +${delta} on Clock "${trk.name || trk.title}" (${trk.currentTicks}/${maxTicks}).`);
            }
          }
        }
      } else {
        if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Advanced Quest Step: "${step.title}".`);
      }

      saveActiveCampaign();
      renderEntityManagerList();
      selectEntityItem(questId, false);
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    }
    window.advanceQuestStep = advanceQuestStep;

    function resetQuestStep(questId, stepIndex) {
      const topo = Workstation.activeTopology || {};
      const quest = (topo.quests || []).find(q => q.id === questId);
      if (!quest || !Array.isArray(quest.steps) || !quest.steps[stepIndex]) return;
      const step = quest.steps[stepIndex];
      const wasCompleted = !!step.isCompleted;
      step.isCompleted = false;

      if (wasCompleted && step.triggerTrackerId) {
        const delta = step.tickDelta || 1;
        if (typeof advanceTrackerTick === 'function') {
          const trk = advanceTrackerTick(step.triggerTrackerId, -delta);
          if (trk) {
            if (typeof setStatusBarMessage === 'function') {
              setStatusBarMessage(`Reset Quest Step: "${step.title}". Rolled back -${delta} on Clock "${trk.name || trk.title}" (${trk.currentTicks}/${trk.maxTicks || 6}).`);
            }
          }
        }
      }

      saveActiveCampaign();
      if (typeof renderCanvas === 'function') renderCanvas();
      renderEntityManagerList();
      selectEntityItem(questId, false);
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
    }
    window.resetQuestStep = resetQuestStep;

    function updateQuestStepTrigger(questId, stepIndex, trackerId, tickDelta) {
      const topo = Workstation.activeTopology || {};
      const quest = (topo.quests || []).find(q => q.id === questId);
      if (!quest || !Array.isArray(quest.steps) || !quest.steps[stepIndex]) return;
      quest.steps[stepIndex].triggerTrackerId = trackerId || null;
      if (tickDelta !== undefined) quest.steps[stepIndex].tickDelta = parseInt(tickDelta, 10) || 1;
      saveActiveCampaign();
      selectEntityItem(questId, false);
    }
    window.updateQuestStepTrigger = updateQuestStepTrigger;

    function editQuestStep(questId, stepIndex) {
      const topo = Workstation.activeTopology || {};
      const quest = (topo.quests || []).find(q => q.id === questId);
      if (!quest || !Array.isArray(quest.steps) || !quest.steps[stepIndex]) return;
      const step = quest.steps[stepIndex];
      const newTitle = prompt('Edit Quest Step Title / Objective:', step.title || '');
      if (newTitle === null) return;
      if (newTitle.trim()) step.title = newTitle.trim();
      saveActiveCampaign();
      selectEntityItem(questId, false);
    }
    window.editQuestStep = editQuestStep;

    function deleteQuestStep(questId, stepIndex) {
      const topo = Workstation.activeTopology || {};
      const quest = (topo.quests || []).find(q => q.id === questId);
      if (!quest || !Array.isArray(quest.steps) || !quest.steps[stepIndex]) return;
      quest.steps.splice(stepIndex, 1);
      quest.steps.forEach((s, idx) => { s.order = idx + 1; });
      saveActiveCampaign();
      selectEntityItem(questId, false);
    }
    window.deleteQuestStep = deleteQuestStep;

    function moveQuestStep(questId, stepIndex, dir) {
      const topo = Workstation.activeTopology || {};
      const quest = (topo.quests || []).find(q => q.id === questId);
      if (!quest || !Array.isArray(quest.steps)) return;
      const newIdx = stepIndex + dir;
      if (newIdx < 0 || newIdx >= quest.steps.length) return;
      const temp = quest.steps[stepIndex];
      quest.steps[stepIndex] = quest.steps[newIdx];
      quest.steps[newIdx] = temp;
      quest.steps.forEach((s, idx) => { s.order = idx + 1; });
      saveActiveCampaign();
      selectEntityItem(questId, false);
    }
    window.moveQuestStep = moveQuestStep;

    function addQuestStep(questId) {
      const topo = Workstation.activeTopology || {};
      const quest = (topo.quests || []).find(q => q.id === questId);
      if (!quest) return;
      if (!Array.isArray(quest.steps)) quest.steps = [];

      const title = prompt('Enter Quest Step Title / Objective:');
      if (!title) return;

      const trackers = topo.trackers || [];
      let trackerPrompt = '';
      if (trackers.length > 0) {
        trackerPrompt = 'Optionally enter linked Threat Clock ID to advance on trigger:\n' +
          trackers.map(t => `${t.id}: ${t.name || t.title}`).join('\n') + '\n(Leave blank for no clock trigger)';
      }
      const linkedTrkId = trackerPrompt ? prompt(trackerPrompt) : '';

      quest.steps.push({
        id: `step_${Date.now().toString().slice(-4)}`,
        order: quest.steps.length + 1,
        title: title,
        isCompleted: false,
        triggerTrackerId: linkedTrkId ? linkedTrkId.trim() : null,
        tickDelta: 1
      });

      saveActiveCampaign();
      renderEntityManagerList();
      selectEntityItem(questId, false);
      if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Added step "${title}" to quest.`);
    }
    window.addQuestStep = addQuestStep;

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
                <strong>Stationed Entities (${rec.totals.npcs + rec.totals.quests + rec.totals.items + (rec.totals.resources || 0) + (rec.totals.creatures || 0) + rec.totals.trackers} total):</strong>
                ${rec.totals.submaps > 0 ? `<span style="font-size:9px; color:#0f766e; font-weight:bold;">🌀 ${rec.totals.submaps} Sub-Map(s)</span>` : ''}
              </div>

              <!-- Direct Entities -->
              <div style="display:flex; flex-direction:column; gap:2px; margin-top:3px; font-size:10px;">
                ${rec.direct.npcs.map(n => `<div style="cursor:pointer; color:#000080;" onclick="switchEntityManagerTab('npc'); selectEntityItem('${escapeJsArg(n.id)}', false);">&bull; NPC: <strong>${escapeHtml(n.name)}</strong> (${escapeHtml(n.role || 'Resident')})</div>`).join('')}
                ${rec.direct.quests.map(q => `<div style="cursor:pointer; color:#b91c1c;" onclick="switchEntityManagerTab('quest'); selectEntityItem('${escapeJsArg(q.id)}', false);">&bull; Quest: <strong>${escapeHtml(q.title || q.name)}</strong> [${escapeHtml(q.threat || 'Threat')}]</div>`).join('')}
                ${rec.direct.items.map(i => `<div style="cursor:pointer; color:#065f46;" onclick="switchEntityManagerTab('item'); selectEntityItem('${escapeJsArg(i.id)}', false);">&bull; Item: <strong>${escapeHtml(i.name)}</strong> [${escapeHtml(i.category || 'Gear')}]</div>`).join('')}
                ${(rec.direct.resources || []).map(r => `<div style="cursor:pointer; color:#0f766e;" onclick="switchEntityManagerTab('resource'); selectEntityItem('${escapeJsArg(r.id)}', false);">&bull; Resource: <strong>${escapeHtml(r.name)}</strong> [${escapeHtml(r.category || 'Commodity')}]</div>`).join('')}
                ${(rec.direct.creatures || []).map(c => `<div style="cursor:pointer; color:#c2410c;" onclick="switchEntityManagerTab('creature'); selectEntityItem('${escapeJsArg(c.id)}', false);">&bull; Creature: <strong>${escapeHtml(c.name)}</strong> [Tier ${c.threatTier !== undefined ? c.threatTier : 2} ${escapeHtml(c.kind || 'Beast')}]</div>`).join('')}
                ${rec.direct.trackers.map(t => `<div style="cursor:pointer; color:#991b1b;" onclick="switchEntityManagerTab('tracker'); selectEntityItem('${escapeJsArg(t.id)}', false);">&bull; Clock: <strong>${escapeHtml(t.name)}</strong> (${t.currentTicks || 0}/${t.maxTicks || 6} ticks)</div>`).join('')}
                ${(rec.direct.npcs.length + rec.direct.quests.length + rec.direct.items.length + (rec.direct.resources || []).length + (rec.direct.creatures || []).length + rec.direct.trackers.length === 0) ? '<span style="color:#777; font-style:italic;">No direct entities stationed here.</span>' : ''}
              </div>

              <!-- Recursive Sub-Map Entities -->
              ${rec.submaps.length > 0 ? `
                <div style="margin-top:6px; background:#f0fdf4; border:1px solid #bbf7d0; padding:4px 6px; border-radius:2px;">
                  <div style="font-size:9px; font-weight:bold; color:#166534; margin-bottom:2px;">RECURSIVE SUB-MAP ENTITIES (${rec.submaps.reduce((acc, sm) => acc + sm.npcs.length + sm.quests.length + sm.items.length + (sm.resources || []).length + (sm.creatures || []).length + sm.trackers.length, 0)}):</div>
                  <div style="display:flex; flex-direction:column; gap:2px; font-size:9px;">
                    ${rec.submaps.map(sm => {
                      const allSubEnts = [...sm.npcs.map(n => ({ type:'npc', label: `NPC: ${n.name}`, id: n.id })),
                                          ...sm.quests.map(q => ({ type:'quest', label: `Quest: ${q.title || q.name}`, id: q.id })),
                                          ...sm.items.map(i => ({ type:'item', label: `Item: ${i.name}`, id: i.id })),
                                          ...(sm.resources || []).map(r => ({ type:'resource', label: `Resource: ${r.name}`, id: r.id })),
                                          ...(sm.creatures || []).map(c => ({ type:'creature', label: `Creature: ${c.name}`, id: c.id })),
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

            <!-- Linked Threat Clocks (DEV-01) -->
            ${renderLinkedTrackersSection('node', node.id, node.id)}

            <!-- Assigned Authoring Tickets (DEV-01 & DEV-04) -->
            ${renderAssignedTicketsSection('node', node.id, node.id)}
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

      if (CurrentEntityTab === 'edge') {
        let edgeMapId = optMapId || curMapId;
        const allEdges = getEdgesForMapScope('map:all');
        let edge = allEdges.find(e => (String(e.edgeKey) === String(id) || String(e.id) === String(id) || String(e.pairKey) === String(id)) && (!optMapId || String(e._mapId) === String(optMapId)));
        if (!edge) {
          edge = allEdges.find(e => String(e.edgeKey) === String(id) || String(e.id) === String(id) || String(e.pairKey) === String(id));
        }
        if (!edge) return;
        edgeMapId = edge._mapId || curMapId;
        let targetTopo = (edgeMapId === curMapId) ? topo : (mapDict[edgeMapId] || topo);

        const escapedKey = escapeJsArg(edge.edgeKey);
        const escapedPairKey = escapeJsArg(edge.pairKey);
        const escapedMapId = escapeJsArg(edgeMapId);
        const isHegem = edge.edgeType === 'hegemony';

        const mapBadge = `<span class="entity-badge-tag" style="background:#1e40af; color:#fff;">Map: ${(mapDict[edgeMapId] && mapDict[edgeMapId].name) || edgeMapId}</span>`;

        const uName = (edge.uNode && edge.uNode.name) || `Node ${edge.uId}`;
        const vName = (edge.vNode && edge.vNode.name) || `Node ${edge.vId}`;
        const uCulture = (edge.uNode && edge.uNode.culture) || 'Neutral';
        const vCulture = (edge.vNode && edge.vNode.culture) || 'Neutral';

        let modulesHtml = '<div style="font-size:10px; color:#777; font-style:italic;">No modules slotted on this corridor.</div>';
        if (edge.modules && edge.modules.length > 0) {
          modulesHtml = edge.modules.map(mId => {
            const mObj = (typeof ALL_MODULES !== 'undefined') ? ALL_MODULES.find(x => x.id === mId) : null;
            const mTitle = mObj ? mObj.title : mId;
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #ddd; padding:3px 5px; margin-bottom:3px;">
                <span style="font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><strong>[${mId}]</strong> ${mTitle}</span>
                <button class="win-btn" onclick="openModuleExplorer('${escapeJsArg(mId)}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
              </div>
            `;
          }).join('');
        }

        const displayInfo = getEdgeDisplayInfo(edge);
        const detailTitleHtml = displayInfo.endpointsSubtitle
          ? `
            <div style="font-size:12px; font-weight:bold; margin-top:2px; color:#0f172a;" title="${escapeHtml(displayInfo.primaryTitle)}">${escapeHtml(displayInfo.primaryTitle)}</div>
            <div style="font-size:11px; color:#334155; font-weight:600; margin-top:1px;" title="${escapeHtml(displayInfo.endpointsSubtitle)}">${escapeHtml(displayInfo.endpointsSubtitle)}</div>
          `
          : `
            <div style="font-size:12px; font-weight:bold; margin-top:2px; color:#0f172a;" title="${escapeHtml(displayInfo.primaryTitle)}">${escapeHtml(displayInfo.primaryTitle)}</div>
          `;

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:10px; color:#666; font-weight:bold;">${isHegem ? 'HEGEMONIC VECTOR' : 'TRANSIT CORRIDOR'} #${edge.edgeKey}</div>
              ${mapBadge}
            </div>
            ${detailTitleHtml}
            <div style="display:flex; gap:3px; margin-top:4px; flex-wrap:wrap;">
              <span class="entity-badge-tag">${edge.edgeType.toUpperCase()}</span>
              <span class="entity-badge-tag">${edge.formattedDist}</span>
              ${edge.visible === false ? '<span class="entity-badge-tag" style="background:#475569; color:#fff;">👁️‍🗨️ Secret Road</span>' : '<span class="entity-badge-tag" style="background:#0f766e; color:#fff;">👁️ Visible</span>'}
              ${edge.blocked ? '<span class="entity-badge-tag" style="background:#b91c1c; color:#fff;">🚫 Blockaded</span>' : ''}
            </div>
            <!-- Sub-tabs for Edge Detail Pane -->
            <div style="display:flex; gap:3px; margin-top:6px; border-bottom:1px solid #999; padding-bottom:1px;">
              <button id="em-edge-subtab-overview" class="win-btn active" style="font-size:10px; padding:2px 6px;" onclick="switchEdgeDetailSubtab('overview')">Telemetry &amp; Links</button>
              <button id="em-edge-subtab-props" class="win-btn" style="font-size:10px; padding:2px 6px;" onclick="switchEdgeDetailSubtab('props')">Properties Grid</button>
            </div>
          </div>

          <!-- SUBTAB 1: Overview & Telemetry -->
          <div id="em-edge-subtab-overview-view" style="font-size:11px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:calc(100% - 175px); padding-top:4px;">
            <!-- Endpoints -->
            <div class="bevel-inset" style="padding:6px; background:#f8fafc;">
              <strong style="font-size:10px; color:#475569;">CONNECTED ENDPOINTS:</strong>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-top:4px;">
                <div style="flex:1; background:#fff; border:1px solid #cbd5e1; padding:4px; text-align:center;">
                  <div style="font-weight:bold; color:#000080; cursor:pointer;" onclick="selectEntityItem('${escapeJsArg(edge.uId)}', false, '${escapedMapId}'); switchEntityManagerTab('node');">#${edge.uId}: ${uName}</div>
                  <span class="entity-badge-tag" style="font-size:8px;">${uCulture}</span>
                </div>
                <div style="font-weight:bold; font-size:14px; color:#64748b;">${isHegem ? '➔' : '⮂'}</div>
                <div style="flex:1; background:#fff; border:1px solid #cbd5e1; padding:4px; text-align:center;">
                  <div style="font-weight:bold; color:#000080; cursor:pointer;" onclick="selectEntityItem('${escapeJsArg(edge.vId)}', false, '${escapedMapId}'); switchEntityManagerTab('node');">#${edge.vId}: ${vName}</div>
                  <span class="entity-badge-tag" style="font-size:8px;">${vCulture}</span>
                </div>
              </div>
            </div>

            <!-- Hazard & Travel Resolution -->
            <div class="bevel-inset" style="padding:6px; background:#fff;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-size:10px; color:#475569;">HAZARD &amp; TRAVEL RISK:</strong>
                <span class="entity-badge-tag" style="background:${edge.hazardLevel >= 2 ? '#b91c1c' : '#059669'}; color:#fff;">Hazard L${edge.hazardLevel} (DC ${edge.hazardInfo ? edge.hazardInfo.dc : 10})</span>
              </div>
              <div style="margin-top:4px; font-size:10px; color:#555;">
                Condition: <strong>${edge.condition}</strong> • Patrol: <strong>${edge.patrolFaction}</strong>
              </div>
              ${typeof computeConduitNaturalFrequency === 'function' ? `<div style="margin-top:4px; font-size:10px; color:#334155;">${escapeHtml(computeConduitNaturalFrequency(Workstation.activeTopology && Workstation.activeTopology.edgeData && (Workstation.activeTopology.edgeData[edge.edgeKey] || Workstation.activeTopology.edgeData[edge.pairKey]) || { hazardLevel: edge.hazardLevel }, 20).readableSummary)}</div>` : ''}
              <button class="win-btn" style="width:100%; margin-top:6px; font-weight:bold; padding:3px 6px;" onclick="openCorridorHazardDialog('${escapeJsArg(edge.uId)}', '${escapeJsArg(edge.vId)}', Workstation.activeTopology && Workstation.activeTopology.edgeData && (Workstation.activeTopology.edgeData['${escapedKey}'] || Workstation.activeTopology.edgeData['${escapedPairKey}']))">🎲 Roll Tabletop Hazard Check...</button>
            </div>

            <!-- Slotted Modules -->
            <div class="bevel-inset" style="padding:6px; background:#fff;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="font-size:10px; color:#475569;">SLOTTED WORLDBUILDING MODULES:</strong>
                <button class="win-btn" style="font-size:9px; padding:1px 4px;" onclick="const mid = prompt('Enter module ID to slot into corridor (e.g. SPARK-01, INFRA-01):'); if (mid) { if (typeof slotEdgeModule === 'function') slotEdgeModule('${escapedKey}', mid.trim().toUpperCase()); saveActiveCampaign(); renderEntityManagerTree(); renderEntityManagerList(); selectEntityItem('${escapedKey}', false, '${escapedMapId}'); }">+ Slot Module</button>
              </div>
              ${modulesHtml}
            </div>

            <!-- Notes preview -->
            ${edge.notes ? `
              <div class="bevel-inset" style="padding:6px; background:#fff; font-size:10px;">
                <strong style="color:#475569;">CORRIDOR LORE NOTES:</strong>
                <div style="margin-top:2px; color:#333; white-space:pre-wrap;">${edge.notes}</div>
              </div>
            ` : ''}

            <!-- Linked Threat Clocks (DEV-01) -->
            ${renderLinkedTrackersSection('edge', edge.edgeKey || edge.id, edge.uId)}

            <!-- Assigned Authoring Tickets (DEV-01 & DEV-04) -->
            ${renderAssignedTicketsSection('edge', edge.edgeKey || edge.id, edge.uId)}
          </div>

          <!-- SUBTAB 2: Properties Grid (VB6 Property Table) -->
          <div id="em-edge-subtab-props-view" style="display:none; font-size:11px; overflow-y:auto; max-height:calc(100% - 175px); background:#fff; border:1px solid #7f9db9; margin-top:4px; padding:2px;">
            <table class="vb-props-table" style="width:100%; border-collapse:collapse;">
              <tbody id="em-edge-props-tbody"></tbody>
            </table>
          </div>

          <!-- Action Footer -->
          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:4px;">
            <button class="win-btn" onclick="jumpToEdgeMap('${escapedMapId}', '${escapedKey}', '${escapeJsArg(edge.uId)}', '${escapeJsArg(edge.vId)}', '${escapeJsArg(edge.edgeType)}')"><strong>🎯 Select &amp; Center on CAD Canvas</strong></button>
            <button class="win-btn" style="color:#b91c1c; font-weight:bold; margin-top:2px;" onclick="if (confirm('Sever this ${edge.edgeType} connection between Node ${edge.uId} and Node ${edge.vId}?')) { deleteEdge('${escapeJsArg(edge.uId)}', '${escapeJsArg(edge.vId)}', '${escapeJsArg(edge.edgeType)}', '${escapedMapId}'); renderEntityManagerTree(); renderEntityManagerList(); document.getElementById('em-detail-pane').innerHTML = '<div style=\\'font-size:11px; color:#666; text-align:center; margin-top:40px;\\'>Corridor severed successfully.</div>'; }">✂️ Sever / Delete Corridor...</button>
          </div>
        `;

        // Render Property Grid into #em-edge-props-tbody
        const propsTbody = document.getElementById('em-edge-props-tbody');
        if (propsTbody && typeof renderEdgeProperties === 'function') {
          renderEdgeProperties(propsTbody, edge, targetTopo);
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
        const rawScope = entity.scopeTier || (activeInstance && activeInstance.scopeTier) || 'settlement';
        const scopeTier = (rawScope === 'city') ? 'settlement' : rawScope;

        // Collect all attributed triggers: quests (via steps or trackerIds) + explicit entity.triggerRefs (NPCs, Items, Quests, Factions, Trackers)
        const triggerRows = [];
        const seenKeys = new Set();
        const addTriggerRow = (eType, eId, label) => {
          const k = `${eType}:${eId}`;
          if (seenKeys.has(k)) return;
          seenKeys.add(k);
          triggerRows.push(`
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:2px 5px; border-radius:2px; font-size:10px; margin-bottom:2px;">
              <span>${label}</span>
              <button class="win-btn" onclick="switchEntityManagerTab('${escapeJsArg(eType)}'); selectEntityItem('${escapeJsArg(eId)}', false);" style="font-size:8px; padding:1px 3px;">Inspect</button>
            </div>
          `);
        };

        (topo.quests || []).forEach(q => {
          const viaSteps = Array.isArray(q.steps) && q.steps.some(st => String(st.triggerTrackerId) === String(entity.id));
          const viaIds = Array.isArray(q.trackerIds) && q.trackerIds.some(tid => String(tid) === String(entity.id));
          if (viaSteps || viaIds) {
            addTriggerRow('quest', q.id, `📜 Quest: <strong>${escapeHtml(q.title || q.name)}</strong>${viaSteps ? ' <span style="color:#b91c1c; font-size:9px;">(Step Trigger)</span>' : ''}`);
          }
        });

        const refs = Array.isArray(entity.triggerRefs) ? entity.triggerRefs : (activeInstance && Array.isArray(activeInstance.triggerRefs) ? activeInstance.triggerRefs : []);
        refs.forEach(ref => {
          if (!ref || !ref.entityId) return;
          const rType = ref.entityType || 'quest';
          const rId = ref.entityId;
          if (rType === 'quest') {
            const q = (topo.quests || []).find(x => String(x.id) === String(rId));
            addTriggerRow('quest', rId, `📜 Quest: <strong>${escapeHtml(q ? (q.title || q.name) : rId)}</strong>`);
          } else if (rType === 'npc') {
            const n = (topo.npcs || []).find(x => String(x.id) === String(rId));
            addTriggerRow('npc', rId, `👤 NPC: <strong>${escapeHtml(n ? n.name : rId)}</strong>`);
          } else if (rType === 'item') {
            const i = (topo.items || []).find(x => String(x.id) === String(rId));
            addTriggerRow('item', rId, `💎 Item: <strong>${escapeHtml(i ? i.name : rId)}</strong>`);
          } else if (rType === 'faction') {
            const f = (topo.factions || []).find(x => String(x.id) === String(rId));
            addTriggerRow('faction', rId, `👑 Faction: <strong>${escapeHtml(f ? f.name : rId)}</strong>`);
          } else if (rType === 'tracker') {
            const t = (topo.trackers || []).find(x => String(x.id) === String(rId));
            addTriggerRow('tracker', rId, `⏱️ Clock: <strong>${escapeHtml(t ? t.name : rId)}</strong>`);
          }
        });

        const triggersHtml = triggerRows.length > 0
          ? triggerRows.join('')
          : '<div style="font-size:9px; color:#64748b; font-style:italic;">No active entities or quests currently trigger this clock. Click "Edit Clock" to attribute triggers.</div>';

        let tickTrackHtml = '';
        for (let i = 1; i <= maxTicks; i++) {
          const filled = i <= curTicks;
          tickTrackHtml += `<div class="clock-tick-box ${filled ? (isTriggered ? 'filled' : 'filled-warning') : ''}">${i}</div>`;
        }

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3 style="font-size:13px; color:#b91c1c; margin:0;">${entity.name || entity.title}</h3>
              <select class="win-select-input" style="font-size:9px; font-weight:bold; padding:1px 4px; width:130px;" onchange="updateTrackerScopeTier('${escapeJsArg(entity.id)}', this.value)" title="Change Clock Escalation Scope Tier">
                <option value="quest" ${scopeTier === 'quest' ? 'selected' : ''}>Scope: QUEST</option>
                <option value="settlement" ${scopeTier === 'settlement' ? 'selected' : ''}>Scope: SETTLEMENT</option>
                <option value="faction" ${scopeTier === 'faction' ? 'selected' : ''}>Scope: FACTION</option>
                <option value="world" ${scopeTier === 'world' ? 'selected' : ''}>Scope: WORLD</option>
              </select>
            </div>
            <div style="margin-top:3px;">
              <span class="entity-badge-tag">${entity.moduleId ? `Module: ${entity.moduleId}` : 'Custom Authored'}</span>
              <span class="entity-badge-tag" style="background:${isTriggered ? '#fee2e2; color:#b91c1c; border-color:#ef4444;' : '#dbeafe; color:#1e40af;'}">${isTriggered ? '⚠️ CRISIS TRIGGERED' : (isPrototype ? 'Available Prototype' : 'Active in Campaign')}</span>
            </div>
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

            <!-- Trigger Attribution (DEV-01 & DEV-03) -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="font-size:10px; color:#0f172a;">⚡ Attributed Triggers &amp; Linked Entities:</strong>
                ${!isPrototype ? `<button class="win-btn" onclick="openEditEntityModal('${escapeJsArg(entity.id)}')" style="font-size:8px; padding:1px 4px;">+ Link Triggers</button>` : ''}
              </div>
              ${triggersHtml}
            </div>

            <!-- Assigned Authoring Tickets (DEV-01 & DEV-04) -->
            ${renderAssignedTicketsSection('tracker', entity.id, activeInstance ? activeInstance.nodeId : entity.suggestedNode)}
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; flex-direction:column; gap:2px;">
              <strong>Station to Node:</strong>
              <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${entity.id}', this.value, ${isPrototype})">
                ${nodeOptions}
              </select>
            </label>

            ${(activeInstance && activeInstance.nodeId) ? `
              <button class="win-btn" onclick="centerOnNode('${escapeJsArg(activeInstance.nodeId)}')"><strong>🎯 Center Stationed Node on Canvas</strong></button>
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
              <button class="win-btn" onclick="centerOnNode('${escapeJsArg(sn.nodeId)}', '${escapeJsArg(sn.mapId || '')}')" style="font-size:9px; padding:1px 5px; white-space:nowrap;">🎯 Center</button>
            </div>
          `).join('');
        }

        let npcsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No NPCs linked to this quest.</div>';
        if (linkedNpcs.length > 0) {
          npcsHtml = linkedNpcs.map(npc => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:3px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <span style="font-weight:bold; font-size:11px;">${npc.name}</span>
                <span style="font-size:9px; color:#475569;">(${npc.role || 'Resident'}) - ${npc.nodeId ? formatNodeRef(npc.nodeId, topo) : 'Unassigned'}</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('npc', '${npc.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${npc.nodeId ? `<button class="win-btn" onclick="centerOnNode('${escapeJsArg(npc.nodeId)}')" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
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
                <span style="font-size:9px; color:#475569;">[${item.category || 'Gear'}] - ${item.nodeId ? formatNodeRef(item.nodeId, topo) : 'Unassigned'}</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('item', '${item.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${item.nodeId ? `<button class="win-btn" onclick="centerOnNode('${escapeJsArg(item.nodeId)}')" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
              </div>
            </div>
          `).join('');
        }

        const steps = Array.isArray(questObj.steps) ? questObj.steps : [];
        let stepsHtml = '';
        if (steps.length === 0) {
          stepsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No progress steps configured. Click "+ Add Step" to define milestones and clock triggers.</div>';
        } else {
          stepsHtml = steps.map((st, sIdx) => {
            const allTrks = topo.trackers || [];
            const trkOptions = `<option value="">(No Clock Trigger)</option>` + allTrks.map(t => `<option value="${escapeHtml(t.id)}" ${String(st.triggerTrackerId) === String(t.id) ? 'selected' : ''}>⚡ ${escapeHtml(t.name || t.title)} (${t.currentTicks || 0}/${t.maxTicks || 6})</option>`).join('');
            return `
              <div style="display:flex; flex-direction:column; gap:3px; background:${st.isCompleted ? '#f0fdf4' : '#fff'}; border:1px solid ${st.isCompleted ? '#86efac' : '#cbd5e1'}; padding:4px 6px; border-radius:2px; margin-bottom:3px;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
                  <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">
                    <span style="font-weight:bold; font-size:11px; ${st.isCompleted ? 'text-decoration:line-through; color:#15803d;' : 'color:#0f172a;'}">${sIdx + 1}. ${escapeHtml(st.title)}</span>
                  </div>
                  <div style="display:flex; gap:2px; align-items:center;">
                    ${!st.isCompleted
                      ? `<button class="win-btn" onclick="advanceQuestStep('${escapeJsArg(questObj.id)}', ${sIdx})" style="font-size:9px; font-weight:bold; color:#15803d; padding:1px 5px;" title="Complete step and advance linked clock">▶ Advance</button>`
                      : `<button class="win-btn" onclick="resetQuestStep('${escapeJsArg(questObj.id)}', ${sIdx})" style="font-size:9px; color:#64748b; padding:1px 4px;" title="Reset step and roll back linked clock">↺ Reset</button>`}
                    <button class="win-btn" onclick="moveQuestStep('${escapeJsArg(questObj.id)}', ${sIdx}, -1)" style="font-size:8px; padding:1px 3px;" title="Move Step Up">↑</button>
                    <button class="win-btn" onclick="moveQuestStep('${escapeJsArg(questObj.id)}', ${sIdx}, 1)" style="font-size:8px; padding:1px 3px;" title="Move Step Down">↓</button>
                    <button class="win-btn" onclick="editQuestStep('${escapeJsArg(questObj.id)}', ${sIdx})" style="font-size:8px; padding:1px 3px;" title="Edit Step Title">✏️</button>
                    <button class="win-btn" onclick="deleteQuestStep('${escapeJsArg(questObj.id)}', ${sIdx})" style="font-size:8px; padding:1px 3px; color:#b91c1c;" title="Delete Step">🗑️</button>
                  </div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; font-size:9px;">
                  <span style="color:#64748b;">Trigger on Advance:</span>
                  <select class="win-select-input" style="font-size:9px; padding:0 2px; flex:1; max-width:210px;" onchange="updateQuestStepTrigger('${escapeJsArg(questObj.id)}', ${sIdx}, this.value)">
                    ${trkOptions}
                  </select>
                </div>
              </div>
            `;
          }).join('');
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

            <!-- Quest Milestones & Escalation Triggers (DEV-02) -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="color:#0f172a;">🎯 Quest Steps &amp; Clock Triggers:</strong>
                ${!isPrototype ? `<button class="win-btn" onclick="addQuestStep('${escapeJsArg(questObj.id)}')" style="font-size:9px; padding:1px 4px; color:#000080;">+ Add Step</button>` : ''}
              </div>
              ${stepsHtml}
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

            <!-- Linked Threat Clocks (DEV-01) -->
            ${renderLinkedTrackersSection('quest', questObj.id, currentStationId)}

            <!-- Assigned Authoring Tickets (DEV-01 & DEV-04) -->
            ${renderAssignedTicketsSection('quest', questObj.id, currentStationId)}
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; flex-direction:column; gap:2px;">
              <strong>Main Quest Anchor Node:</strong>
              <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${entity.id}', this.value, ${isPrototype})">
                ${nodeOptions}
              </select>
            </label>

            ${(currentStationId) ? `
              <button class="win-btn" onclick="centerOnNode('${escapeJsArg(currentStationId)}')"><strong>🎯 Center Anchor Node on Canvas</strong></button>
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
                <span style="font-size:9px; color:#475569;">[Anchor: ${q.nodeId ? formatNodeRef(q.nodeId, topo) : 'Unassigned'}]</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('quest', '${q.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${q.nodeId ? `<button class="win-btn" onclick="centerOnNode('${escapeJsArg(q.nodeId)}')" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
              </div>
            </div>
          `).join('');
        }

        const possessionBadge = ownerNpc
          ? (isCarried
              ? `<span class="entity-badge-tag" style="background:#0f766e; color:#fff;">🎒 Equipped / Carried by ${ownerNpc.name}</span>`
              : `<span class="entity-badge-tag" style="background:#475569; color:#fff;">📦 Stored at ${itemObj.nodeId ? formatNodeRef(itemObj.nodeId, topo) : 'Unassigned'} (Owned by ${ownerNpc.name})</span>`)
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
                    ? `🎒 Dynamically inherits station node from carrier <strong>${ownerNpc.nodeId != null ? formatNodeRef(ownerNpc.nodeId, topo) : 'Unassigned'}</strong>.`
                    : `📦 Stored at designated station <strong>${itemObj.nodeId ? formatNodeRef(itemObj.nodeId, topo) : 'Unassigned'}</strong> (e.g. in vault/armory).`}
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

            <!-- Linked Threat Clocks (DEV-01) -->
            ${renderLinkedTrackersSection('item', itemObj.id, effNodeId)}

            <!-- Assigned Authoring Tickets (DEV-01 & DEV-04) -->
            ${renderAssignedTicketsSection('item', itemObj.id, effNodeId)}
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            ${isCarried ? `
              <div style="font-size:10px; background:#f0fdf4; border:1px solid #86efac; padding:4px 6px; border-radius:2px; color:#166534;">
                <strong>Station Node: ${effNodeId != null ? formatNodeRef(effNodeId, topo) : 'Unassigned'}</strong> (Inherited from carrier ${ownerNpc.name}). To station elsewhere, switch possession to "Stored at Node".
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
              <button class="win-btn" onclick="centerOnNode('${escapeJsArg(effNodeId)}')"><strong>🎯 Center Stationed Node on Canvas</strong></button>
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
      } else if (CurrentEntityTab === 'resource') {
        // DEDICATED RESOURCE & COMMODITY INSPECTOR
        const resObj = activeInstance || entity;
        const effNodeId = getEntityEffectiveNodeId(resObj);
        const allNodesMap = getAllKnownNodesMap();
        const stationNode = effNodeId ? allNodesMap[String(effNodeId)] : null;

        // DF Physical Logistics & Storage Inspector
        const modData = stationNode && stationNode.modData && stationNode.modData.pre_industrial_resources;
        let storageHtml = '';
        if (stationNode) {
          const inputHoppers = modData && modData.inputHopper ? Object.entries(modData.inputHopper) : [];
          const outputBins = modData && modData.outputBin ? Object.entries(modData.outputBin) : [];
          const stockpiles = modData && modData.stockpile ? Object.entries(modData.stockpile) : [];
          const isHalted = modData && modData.backpressureHalt;

          storageHtml = `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="color:#0f172a; font-size:11px;">🏭 Depot &amp; Facility Logistics:</strong>
                ${isHalted ? '<span class="entity-badge-tag" style="background:#fee2e2; color:#b91c1c; border:1px solid #ef4444; font-weight:bold;">⛔ Backpressure Halt</span>' : '<span class="entity-badge-tag" style="background:#dcfce7; color:#166534;">🟢 Flow Active</span>'}
              </div>
              <div style="font-size:10px; color:#334155; margin-bottom:4px;">
                Depot Station: <strong>${formatNodeRef(effNodeId, topo)}</strong>
                ${stationNode.tier === 0 ? '<span class="entity-badge-tag" style="font-size:8px; margin-left:3px;">T0 Settlement</span>' : ''}
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:9px;">
                <div style="background:#fff; border:1px solid #e2e8f0; padding:4px; border-radius:2px;">
                  <div style="font-weight:bold; color:#475569;">📥 Input Hopper (Raw):</div>
                  <div>${inputHoppers.length > 0 ? inputHoppers.map(([k, v]) => `${escapeHtml(k)}: <strong>${v}</strong>`).join('<br>') : '<span style="color:#94a3b8; font-style:italic;">Empty</span>'}</div>
                </div>
                <div style="background:#fff; border:1px solid #e2e8f0; padding:4px; border-radius:2px;">
                  <div style="font-weight:bold; color:#475569;">📤 Output Bin (Export):</div>
                  <div>${outputBins.length > 0 ? outputBins.map(([k, v]) => `${escapeHtml(k)}: <strong>${v}</strong>`).join('<br>') : '<span style="color:#94a3b8; font-style:italic;">Empty</span>'}</div>
                </div>
              </div>
              <div style="background:#fff; border:1px solid #e2e8f0; padding:4px; border-radius:2px; margin-top:4px; font-size:9px;">
                <div style="font-weight:bold; color:#0f766e;">🏛️ Long-Term Stockpile:</div>
                <div>${stockpiles.length > 0 ? stockpiles.map(([k, v]) => `${escapeHtml(k)}: <strong>${v}</strong> units`).join(' &bull; ') : '<span style="color:#94a3b8; font-style:italic;">No stockpiled inventory recorded yet.</span>'}</div>
              </div>
            </div>
          `;
        } else {
          storageHtml = `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px; font-size:10px; color:#64748b;">
              📦 <em>This commodity is currently unstationed. Assign it to a settlement depot or resource facility node below to enable physical hauling, production hoppers, and stockpile tracking.</em>
            </div>
          `;
        }

        // Active In-Transit Conduits & Shipments
        const inTransitShipments = [];
        const edgesList = (typeof getEdgesForMapScope === 'function') ? getEdgesForMapScope('all') : [];
        edgesList.forEach(ed => {
          const edModData = ed.modData && ed.modData.pre_industrial_resources;
          if (edModData && Array.isArray(edModData.inTransit)) {
            edModData.inTransit.forEach(sh => {
              if (sh && (sh.resource || '').toLowerCase().includes((resObj.name || '').toLowerCase())) {
                inTransitShipments.push({ ...sh, edgeKey: ed.edgeKey || `${ed.uId}-${ed.vId}` });
              }
            });
          }
        });

        let transitHtml = '';
        if (inTransitShipments.length > 0) {
          transitHtml = `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:6px; border-radius:2px;">
              <strong style="color:#166534; font-size:11px;">🚚 Active Hauling Shipments (${inTransitShipments.length}):</strong>
              <div style="display:flex; flex-direction:column; gap:2px; margin-top:3px; font-size:9px;">
                ${inTransitShipments.map(s => `
                  <div style="background:#fff; border:1px solid #86efac; padding:2px 5px; border-radius:2px;">
                    Route: <strong>${s.from} &rarr; ${s.to}</strong> &bull; Cargo: <strong>${s.qty} units</strong> &bull; ETA: <strong>${s.etaTurns} turns</strong> (${s.edgeKey})
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        const referencingQuests = (topo.quests || []).filter(q =>
          (q.itemIds && q.itemIds.includes(resObj.id)) ||
          (q.itemIds && q.itemIds.includes(entity.id)) ||
          (q.nodeId && effNodeId && String(q.nodeId) === String(effNodeId))
        );

        let questsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No active quests currently reference this resource.</div>';
        if (referencingQuests.length > 0) {
          questsHtml = referencingQuests.map(q => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:3px;">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px;">
                <span style="font-weight:bold; font-size:11px;">📜 ${escapeHtml(q.title || q.name)}</span>
                <span style="font-size:9px; color:#475569;">[Anchor: ${q.nodeId ? formatNodeRef(q.nodeId, topo) : 'Unassigned'}]</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('quest', '${escapeJsArg(q.id)}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${q.nodeId ? `<button class="win-btn" onclick="centerOnNode('${escapeJsArg(q.nodeId)}')" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
              </div>
            </div>
          `).join('');
        }

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <h3 style="font-size:13px; color:#0f766e; margin-bottom:2px;">📦 ${escapeHtml(entity.name || entity.title)}</h3>
            <span class="entity-badge-tag">${entity.moduleId ? `Module: ${escapeHtml(entity.moduleId)}` : 'Pre-Industrial Resource Mod'}</span>
            <span class="entity-badge-tag" style="background:#dbeafe; color:#1e40af;">${isPrototype ? 'Available Prototype' : 'Active in Campaign'}</span>
            <span class="entity-badge-tag" style="background:#e0f2fe; color:#0369a1;">${escapeHtml(entity.category || 'Commodity / Resource')}</span>
          </div>

          <div style="font-size:11px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:calc(100% - 130px);">
            <!-- Storage & Physical Logistics -->
            ${storageHtml}

            <!-- In-Transit Hauling -->
            ${transitHtml}

            <!-- Specifications & Batch Specs -->
            ${entity.specs ? `
              <div>
                <strong>Batch Specs &amp; Logistics Traits:</strong>
                <p style="color:#333; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd; font-family:Consolas, monospace;">${escapeHtml(entity.specs)}</p>
              </div>
            ` : ''}

            <!-- Provenance & Lore -->
            <div>
              <strong>Extraction Lore, Refining &amp; Industrial Context:</strong>
              <p style="color:#333; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd;">${escapeHtml(entity.motivation || entity.notes || 'Universal pre-industrial trade commodity and physical supply anchor.')}</p>
            </div>

            <!-- Referencing Quests -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong>Referencing Quests (${referencingQuests.length}):</strong>
                <button class="win-btn" onclick="openNewEntityModal('quest')" style="font-size:9px; padding:1px 4px;">+ New Quest</button>
              </div>
              ${questsHtml}
            </div>

            <!-- Linked Threat Clocks -->
            ${renderLinkedTrackersSection('item', resObj.id, effNodeId)}

            <!-- Assigned Authoring Tickets -->
            ${renderAssignedTicketsSection('item', resObj.id, effNodeId)}
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; flex-direction:column; gap:2px;">
              <strong>Station to Node / Depot:</strong>
              <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${escapeJsArg(entity.id)}', this.value, ${isPrototype})">
                ${nodeOptions}
              </select>
            </label>

            ${(effNodeId) ? `
              <button class="win-btn" onclick="centerOnNode('${escapeJsArg(effNodeId)}')"><strong>🎯 Center Stationed Depot on Canvas</strong></button>
            ` : ''}

            <div style="display:flex; gap:4px; margin-top:4px;">
              ${isPrototype ? `
                <button class="win-btn" style="flex:1;" onclick="promotePrototypeToCampaign('${escapeJsArg(entity.id)}', 'resource')"><strong>+ Add Resource to Campaign</strong></button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('resource', '${escapeJsArg(entity.id)}')">Delete Resource...</button>
              ` : `
                <button class="win-btn" style="flex:1;" onclick="openEditEntityModal('${escapeJsArg(entity.id)}')">Edit Resource</button>
                <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('resource', '${escapeJsArg(entity.id)}')">Delete Resource...</button>
              `}
            </div>
          </div>
        `;
      } else if (CurrentEntityTab === 'faction') {
        const facObj = activeInstance || entity;
        const leaderNpc = (topo.npcs || []).find(n => String(n.id) === String(facObj.leaderNpcId));
        const cult = facObj.cvfQuadrant || 'Clan';
        const color = facObj.colorIdentity || 'C';
        const disp = Array.isArray(facObj.disposition) ? facObj.disposition : [2, 2, 2];
        const hqNodeId = facObj.headquartersNodeId;
        const hqNode = hqNodeId ? resolveNodeObject(hqNodeId, topo) : null;
        const terrList = Array.isArray(facObj.controlledNodeIds) ? facObj.controlledNodeIds : [];
        const memberNpcs = (topo.npcs || []).filter(n => n.factionId === facObj.id || n.faction === facObj.name);

        // Build Diplomatic Stance table
        const otherFactions = (topo.factions || []).filter(f => f.id !== facObj.id);
        let diploTableHtml = '';
        if (otherFactions.length === 0) {
          diploTableHtml = '<div style="font-size:10px; color:#64748b; font-style:italic;">No other factions registered in active campaign.</div>';
        } else {
          diploTableHtml = `
            <table class="win-table" style="width:100%; font-size:10px; margin-top:3px;">
              <thead>
                <tr>
                  <th>Target Faction</th>
                  <th style="width:110px;">Stance</th>
                </tr>
              </thead>
              <tbody>
                ${otherFactions.map(other => {
                  const currentStance = (facObj.diplomaticStances && facObj.diplomaticStances[other.id]) || 'Neutral';
                  return `
                    <tr>
                      <td><strong>👑 ${other.name}</strong></td>
                      <td>
                        <select class="win-select-input" style="font-size:9px; padding:1px 2px;" onchange="updateFactionStance('${facObj.id}', '${other.id}', this.value)">
                          <option value="Allied" ${currentStance === 'Allied' ? 'selected' : ''}>Allied (+2)</option>
                          <option value="Neutral" ${currentStance === 'Neutral' ? 'selected' : ''}>Neutral (0)</option>
                          <option value="Hostile" ${currentStance === 'Hostile' ? 'selected' : ''}>Hostile (-2)</option>
                          <option value="Vassal" ${currentStance === 'Vassal' ? 'selected' : ''}>Vassal</option>
                          <option value="Rival" ${currentStance === 'Rival' ? 'selected' : ''}>Rival</option>
                        </select>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `;
        }

        pane.innerHTML = `
          <div style="border-bottom:1px solid #ccc; padding-bottom:6px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <h3 style="font-size:13px; color:#000080; margin-bottom:2px;">👑 ${facObj.name}</h3>
              <div style="display:flex; gap:3px;">
                <span class="entity-badge-tag" style="background:#4338ca; color:#fff;">${cult}</span>
                <span class="entity-badge-tag" style="background:#0f172a; color:#f8fafc; font-weight:bold;">${color}</span>
              </div>
            </div>
            <span class="entity-badge-tag">${facObj.type || 'Power Group'}</span>
            <span class="entity-badge-tag" style="background:#dbeafe; color:#1e40af;">[S:${disp[0]} E:${disp[1]} C:${disp[2]}]</span>
          </div>

          <div style="font-size:11px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; max-height:calc(100% - 130px);">
            <!-- Faction Leader Card -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="font-size:10px; font-weight:bold; color:#475569; margin-bottom:2px;">FACTION LEADER / SPOKESPERSON:</div>
              ${leaderNpc ? `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="color:#0284c7;">👤 ${leaderNpc.name}</strong> (${leaderNpc.role || 'Resident'})
                  </div>
                  <button class="win-btn" onclick="switchEntityManagerTab('npc'); selectEntityItem('${leaderNpc.id}');" style="font-size:9px; padding:1px 4px;">Inspect Leader</button>
                </div>
              ` : `
                <div style="font-size:10px; color:#64748b;">(Autonomous Council / No Individual Leader Assigned)</div>
              `}
            </div>

            <!-- Headquarters Node Card -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px; border-radius:2px;">
              <div style="font-size:10px; font-weight:bold; color:#475569; margin-bottom:2px;">HEADQUARTERS LOCATION:</div>
              ${hqNode ? `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="color:#000080;">🌐 Node ${hqNodeId}:</strong> ${hqNode.name} (${hqNode.culture || 'Adhocracy'})
                  </div>
                  <button class="win-btn" onclick="switchEntityManagerTab('node'); selectEntityItem('${hqNodeId}');" style="font-size:9px; padding:1px 4px;">Inspect Node</button>
                </div>
              ` : `
                <div style="font-size:10px; color:#64748b;">(Unseated / Nomadic / Secret Enclave)</div>
              `}
            </div>

            <!-- Controlled Territory Badges -->
            <div>
              <strong>Controlled Territory (${terrList.length} Nodes):</strong>
              <div style="display:flex; flex-wrap:wrap; gap:3px; margin-top:2px;">
                ${terrList.length > 0 ? terrList.map(nid => {
                  const nodeObj = resolveNodeObject(nid, topo);
                  const nName = nodeObj ? (nodeObj.displayName || nodeObj.name || `Node ${nid}`) : `Node ${nid}`;
                  return `<button class="win-btn" onclick="switchEntityManagerTab('node'); selectEntityItem('${nid}');" style="font-size:9px; padding:1px 4px;">📍 #${nid}: ${nName}</button>`;
                }).join('') : '<span style="font-size:10px; color:#64748b; font-style:italic;">No territorial nodes claimed.</span>'}
              </div>
            </div>

            <!-- Member NPCs -->
            <div>
              <strong>Associated Characters (${memberNpcs.length}):</strong>
              <div style="display:flex; flex-wrap:wrap; gap:3px; margin-top:2px;">
                ${memberNpcs.length > 0 ? memberNpcs.map(m => {
                  return `<button class="win-btn" onclick="switchEntityManagerTab('npc'); selectEntityItem('${m.id}');" style="font-size:9px; padding:1px 4px;">👤 ${m.name}</button>`;
                }).join('') : '<span style="font-size:10px; color:#64748b; font-style:italic;">No member characters assigned to this faction.</span>'}
              </div>
            </div>

            <!-- Heuristic style & decision tree (Gigerenzer suite) -->
            ${typeof renderHeuristicBadgeHtml === 'function' ? renderHeuristicBadgeHtml(facObj.disposition) : ''}
            ${typeof renderFftDossierHtml === 'function' ? renderFftDossierHtml('faction', facObj) : ''}

            <!-- Diplomatic Stances Matrix -->
            <div>
              <div style="font-weight:bold; color:#000080; margin-bottom:2px;">🤝 Diplomatic Stance Matrix:</div>
              ${diploTableHtml}
            </div>

            <!-- Dossier & Lore -->
            <div>
              <strong>Ideological Agenda &amp; Dossier:</strong>
              <p style="color:#333; line-height:1.3; margin-top:2px; font-size:10px; background:#fff; padding:6px; border:1px solid #ddd;">${facObj.description || facObj.notes || 'No description provided.'}</p>
            </div>

            <!-- Linked Threat Clocks (DEV-01) -->
            ${renderLinkedTrackersSection('faction', facObj.id, hqNodeId)}

            <!-- Assigned Authoring Tickets (DEV-01 & DEV-04) -->
            ${renderAssignedTicketsSection('faction', facObj.id, hqNodeId)}
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            ${hqNodeId ? `
              <button class="win-btn" onclick="centerOnNode('${escapeJsArg(hqNodeId)}')"><strong>🎯 Center Headquarters on Canvas</strong></button>
            ` : ''}

            <div style="display:flex; gap:4px; margin-top:4px;">
              <button class="win-btn" style="flex:1;" onclick="openEditEntityModal('${facObj.id}')">Edit Faction</button>
              <button class="win-btn" style="color:#b91c1c; font-weight:bold;" onclick="promptEntityDelete('faction', '${facObj.id}')">Delete Faction...</button>
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
        const inboundRels = (topo.npcs || []).filter(other => other.id !== npcObj.id && Array.isArray(other.relationships) && other.relationships.some(r => String(r.targetNpcId) === String(npcObj.id))).map(other => {
          const matchingRel = other.relationships.find(r => String(r.targetNpcId) === String(npcObj.id));
          return {
            sourceNpc: other,
            rel: matchingRel
          };
        });

        const relTypeColors = {
          'Ally': '#16a34a', 'Rival': '#dc2626', 'Family': '#9333ea',
          'Superior': '#0284c7', 'Subordinate': '#0891b2',
          'Debtor': '#ea580c', 'Creditor': '#d97706',
          'Informant': '#4f46e5', 'Handler': '#2563eb'
        };

        let relsHtml = '<div style="font-size:10px; color:#666; font-style:italic;">No recorded social relationships.</div>';
        if (outboundRels.length > 0 || inboundRels.length > 0) {
          const outItems = outboundRels.map(r => {
            const targetNpc = (topo.npcs || []).find(n => String(n.id) === String(r.targetNpcId));
            const targetName = targetNpc ? targetNpc.name : `NPC [${r.targetNpcId}]`;
            const rType = r.relationshipType || r.relationship || r.type || 'Connected';
            const col = relTypeColors[rType] || '#0f172a';
            const s = typeof r.sentiment === 'number' ? r.sentiment : 0;
            const sBadge = (s > 0)
              ? `<span style="font-size:8.5px; padding:1px 4px; border-radius:2px; font-weight:bold; background:#dcfce7; color:#15803d; border:1px solid #86efac;">+${s}</span>`
              : (s < 0)
              ? `<span style="font-size:8.5px; padding:1px 4px; border-radius:2px; font-weight:bold; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;">${s}</span>`
              : `<span style="font-size:8.5px; padding:1px 4px; border-radius:2px; font-weight:bold; background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;">0</span>`;

            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:2px;">
                <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px; flex:1;">
                  <strong style="color:${col}; font-size:10px;">→ ${rType}:</strong> 
                  <span style="font-size:10px; font-weight:bold; cursor:pointer; color:#1e1b4b;" onclick="navigateToEntity('npc', '${r.targetNpcId}')">${targetName}</span>
                  ${sBadge}
                  ${r.notes ? `<div style="font-size:9px; color:#64748b; font-style:italic;">${r.notes}</div>` : ''}
                </div>
                <div style="display:flex; gap:2px;">
                  <button class="win-btn" onclick="openAddNpcRelationshipModal('${npcObj.id}', '${r.targetNpcId}')" style="font-size:9px; padding:1px 4px;" title="Edit relationship">Edit</button>
                  <button class="win-btn" onclick="removeNpcRelationship('${npcObj.id}', '${r.targetNpcId}', true)" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete relationship">X</button>
                </div>
              </div>
            `;
          }).join('');

          const inItems = inboundRels.map(ib => {
            const inType = ib.rel.relationshipType || ib.rel.type || 'Connected';
            const col = relTypeColors[inType] || '#0f766e';
            const s = typeof ib.rel.sentiment === 'number' ? ib.rel.sentiment : 0;
            const sBadge = (s > 0)
              ? `<span style="font-size:8.5px; padding:1px 4px; border-radius:2px; font-weight:bold; background:#dcfce7; color:#15803d; border:1px solid #86efac;">+${s}</span>`
              : (s < 0)
              ? `<span style="font-size:8.5px; padding:1px 4px; border-radius:2px; font-weight:bold; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;">${s}</span>`
              : `<span style="font-size:8.5px; padding:1px 4px; border-radius:2px; font-weight:bold; background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;">0</span>`;

            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1px solid #cbd5e1; padding:3px 6px; border-radius:2px; margin-bottom:2px;">
                <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:4px; flex:1;">
                  <strong style="color:${col}; font-size:10px;">← Viewed as ${inType} by:</strong> 
                  <span style="font-size:10px; font-weight:bold; cursor:pointer; color:#1e1b4b;" onclick="navigateToEntity('npc', '${ib.sourceNpc.id}')">${ib.sourceNpc.name}</span>
                  ${sBadge}
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
                  <span class="entity-badge-tag" style="font-size:8px; ${isCarried ? 'background:#0f766e; color:#fff;' : 'background:#475569; color:#fff;'}">${isCarried ? '🎒 Carried' : '📦 Stored @ ' + (itm.nodeId ? formatNodeRef(itm.nodeId, topo) : 'Unassigned')}</span>
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
                <span style="font-size:9px; color:#475569;">[Anchor: ${q.nodeId ? formatNodeRef(q.nodeId, topo) : 'Unassigned'}]</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="win-btn" onclick="window.navigateToEntity('quest', '${q.id}')" style="font-size:9px; padding:1px 4px;">Inspect</button>
                ${q.nodeId ? `<button class="win-btn" onclick="centerOnNode('${escapeJsArg(q.nodeId)}')" style="font-size:9px; padding:1px 4px;">🎯</button>` : ''}
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

            <!-- Heuristic style & decision tree (Gigerenzer suite) -->
            ${typeof renderHeuristicBadgeHtml === 'function' ? renderHeuristicBadgeHtml(npcObj.odv) : ''}
            ${typeof renderFftDossierHtml === 'function' ? renderFftDossierHtml('npc', npcObj) : ''}

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

            <!-- Inter-NPC Social Web & Relational Graph -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="font-size:10px;">👥 Social Web &amp; Relationships (${outboundRels.length + inboundRels.length}):</strong>
                <div style="display:flex; gap:3px;">
                  <button class="win-btn" onclick="openAddNpcRelationshipModal('${npcObj.id}')" style="font-size:9px; padding:1px 5px;">+ Add Tie...</button>
                  <button class="win-btn" onclick="openSocialGraphModal('${npcObj.id}')" style="font-size:9px; padding:1px 5px; font-weight:bold; color:#312e81;" title="Open interactive 2D SVG Social Graph">🕸️ Graph</button>
                </div>
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

            <!-- Linked Threat Clocks (DEV-01) -->
            ${renderLinkedTrackersSection('npc', npcObj.id, npcObj.nodeId)}

            <!-- Assigned Authoring Tickets (DEV-01 & DEV-04) -->
            ${renderAssignedTicketsSection('npc', npcObj.id, npcObj.nodeId)}
          </div>

          <div style="margin-top:auto; padding-top:8px; border-top:1px solid #ccc; display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; flex-direction:column; gap:2px;">
              <strong>Station to Node:</strong>
              <select id="detail-node-assign" class="win-select-input" onchange="assignEntityToNode('${entity.id}', this.value, ${isPrototype})">
                ${nodeOptions}
              </select>
            </label>

            ${(currentStationId) ? `
              <button class="win-btn" onclick="centerOnNode('${escapeJsArg(currentStationId)}')"><strong>🎯 Center Stationed Node on Canvas</strong></button>
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

    function updateFactionStance(sourceId, targetId, stance) {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(topo.factions)) return;
      const fac = topo.factions.find(f => f.id === sourceId);
      if (fac) {
        if (!fac.diplomaticStances) fac.diplomaticStances = {};
        fac.diplomaticStances[targetId] = stance;
        if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
        if (typeof setStatusBarMessage === 'function') {
          setStatusBarMessage(`Updated diplomatic stance for ${fac.name} -> ${stance}.`);
        }
      }
    }
    window.updateFactionStance = updateFactionStance;
