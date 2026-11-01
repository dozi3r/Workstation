// Visual Basic 6 Property Grid & Entity Inspector
    // Selection Handlers
    function selectNode(nodeId, e = null) {
      const topo = Workstation.activeTopology;
      const nodeObj = topo && topo.nodes ? topo.nodes[nodeId.toString()] : null;

      if (e && e.ctrlKey) {
        if (typeof selectByType === 'function') {
          selectByType('node', null, nodeObj);
          return;
        }
      }
      if (e && e.shiftKey) {
        if (typeof toggleEntitySelection === 'function') {
          toggleEntitySelection({ type: 'node', id: nodeId, node: nodeObj });
          return;
        }
      }

      if (typeof setSelection === 'function') {
        setSelection([{ type: 'node', id: nodeId, node: nodeObj }]);
      } else {
        Workstation.selectedEntity = { type: 'node', id: nodeId };
        renderCanvas();
        updateObjectSelector();
        updatePropertiesGrid();
      }
      const nodeName = nodeObj ? (nodeObj.name || `Node ${nodeId}`) : `Node ${nodeId}`;
      setStatusBarMessage(`Selected Node ${nodeId}: ${nodeName}`);
    }

    function selectEdge(edgeType, uId, vId, e = null) {
      const pair = [String(uId), String(vId)].sort().join('-');
      const edgeKey = (edgeType === 'hegemony') ? `${uId}->${vId}` : pair;
      const edgeItem = { type: 'edge', edgeType, uId, vId, pair, edgeKey };

      if (e && e.ctrlKey) {
        if (typeof selectByType === 'function') {
          selectByType('edge', edgeType, edgeItem);
          return;
        }
      }
      if (e && e.shiftKey) {
        if (typeof toggleEntitySelection === 'function') {
          toggleEntitySelection(edgeItem);
          return;
        }
      }

      if (typeof setSelection === 'function') {
        setSelection([edgeItem]);
      } else {
        Workstation.selectedEntity = edgeItem;
        renderCanvas();
        updateObjectSelector();
        updatePropertiesGrid();
      }
      const typeLabel = edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road';
      setStatusBarMessage(`Selected ${typeLabel}: ${uId} ${edgeType === 'hegemony' ? '->' : '<->'} ${vId}`);
    }

    function selectGlobal() {
      if (typeof clearSelection === 'function') {
        clearSelection();
      } else {
        Workstation.selectedEntity = { type: 'global' };
        renderCanvas();
        updateObjectSelector();
        updatePropertiesGrid();
      }
      setStatusBarMessage(`Global Campaign selected.`);
    }

    function selectShape(shapeId, e = null) {
      const topo = Workstation.activeTopology;
      const shape = (topo && Array.isArray(topo.shapes)) ? topo.shapes.find(s => s.id === shapeId) : null;

      if (e && e.ctrlKey) {
        if (typeof selectByType === 'function' && shape) {
          selectByType('shape', shape.type, shape);
          return;
        }
      }
      if (e && e.shiftKey) {
        if (typeof toggleEntitySelection === 'function') {
          toggleEntitySelection({ type: 'shape', id: shapeId, shape: shape });
          return;
        }
      }

      if (typeof setSelection === 'function') {
        setSelection([{ type: 'shape', id: shapeId, shape: shape }]);
      } else {
        Workstation.selectedEntity = { type: 'shape', id: shapeId, shape: shape };
        renderCanvas();
        updateObjectSelector();
        updatePropertiesGrid();
      }
      const shapeName = shape ? (shape.name || shape.id) : shapeId;
      const shapeType = shape ? (shape.type || 'rect').toUpperCase() : 'SHAPE';
      setStatusBarMessage(`Selected CAD Shape [${shapeType}]: ${shapeName}`);
    }

    function deleteShape(shapeId, skipConfirm = false) {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(topo.shapes)) return;
      const shape = topo.shapes.find(s => s.id === shapeId);
      if (!shape) return;
      if (!skipConfirm && !confirm(`Delete shape "${shape.name || shape.id}"?`)) return;
      topo.shapes = topo.shapes.filter(s => s.id !== shapeId);
      if (typeof removeFromSelection === 'function') {
        removeFromSelection('shape', shapeId);
      } else if (Workstation.selectedEntity && Workstation.selectedEntity.type === 'shape' && Workstation.selectedEntity.id === shapeId) {
        Workstation.selectedEntity = { type: 'global' };
      }
      renderCanvas();
      updateObjectSelector();
      updatePropertiesGrid();
      if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
      saveActiveCampaign();
      setStatusBarMessage(`Deleted shape "${shape.name || shape.id}".`);
    }

    // Update Object Dropdown Selector in Properties Dock
    function updateObjectSelector() {
      const sel = document.getElementById('prop-object-selector');
      if (!sel) return;
      sel.innerHTML = '';

      if (Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 1) {
        const optMulti = document.createElement('option');
        optMulti.value = 'multi';
        optMulti.textContent = `Multiple Selection (${Workstation.selectedEntities.length} items)`;
        sel.appendChild(optMulti);

        const nodeCount = Workstation.selectedEntities.filter(e => e.type === 'node').length;
        const shapeCount = Workstation.selectedEntities.filter(e => e.type === 'shape').length;
        const edgeCount = Workstation.selectedEntities.filter(e => e.type === 'edge').length;
        if (nodeCount > 0 && nodeCount < Workstation.selectedEntities.length) {
          const opt = document.createElement('option');
          opt.value = 'multi-filter-node';
          opt.textContent = `  ↳ Filter Selection: Nodes (${nodeCount})`;
          sel.appendChild(opt);
        }
        if (shapeCount > 0 && shapeCount < Workstation.selectedEntities.length) {
          const opt = document.createElement('option');
          opt.value = 'multi-filter-shape';
          opt.textContent = `  ↳ Filter Selection: Shapes (${shapeCount})`;
          sel.appendChild(opt);
        }
        if (edgeCount > 0 && edgeCount < Workstation.selectedEntities.length) {
          const opt = document.createElement('option');
          opt.value = 'multi-filter-edge';
          opt.textContent = `  ↳ Filter Selection: Edges (${edgeCount})`;
          sel.appendChild(opt);
        }
      }

      const optGlobal = document.createElement('option');
      optGlobal.value = 'global';
      optGlobal.textContent = `Global: ${(Workstation.activeTopology && Workstation.activeTopology.name) || 'Campaign'}`;
      sel.appendChild(optGlobal);

      const topo = Workstation.activeTopology;
      if (topo && topo.nodes) {
        // Node group
        const optGrpNodes = document.createElement('optgroup');
        optGrpNodes.label = '── Pointcrawl Nodes ──';
        Object.keys(topo.nodes).forEach(k => {
          const n = topo.nodes[k];
          const opt = document.createElement('option');
          opt.value = `node-${k}`;
          opt.textContent = `Node ${k}: ${n.name || 'Node ' + k} [Tier ${n.tier !== undefined ? n.tier : 2}]`;
          optGrpNodes.appendChild(opt);
        });
        sel.appendChild(optGrpNodes);

        // Edge group (Transit Roads & Hegemony Vectors)
        const optGrpEdges = document.createElement('optgroup');
        optGrpEdges.label = '── Corridors & Conduits ──';
        const seenPairs = new Set();
        Object.keys(topo.nodes).forEach(uKey => {
          const u = topo.nodes[uKey];
          const uId = u.id !== undefined ? u.id : uKey;
          // Roads
          (u.adj || []).forEach(vId => {
            const pairKey = [String(uId), String(vId)].sort().join('-');
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              const opt = document.createElement('option');
              opt.value = `edge-road-${pairKey}`;
              opt.textContent = `Road: ${pairKey.replace('-', ' <-> ')}`;
              optGrpEdges.appendChild(opt);
            }
          });
          // Hegemony Vectors
          (u.infBy || []).forEach(srcId => {
            const opt = document.createElement('option');
            opt.value = `edge-hegemony-${srcId}->${uId}`;
            opt.textContent = `Vector: ${srcId} -> ${uId}`;
            optGrpEdges.appendChild(opt);
          });
        });
        if (optGrpEdges.children.length > 0) {
          sel.appendChild(optGrpEdges);
        }

        // Cartographic Maps group
        if (typeof maps !== "undefined" && Object.keys(maps).length > 0) {
          const optGrpMaps = document.createElement('optgroup');
          optGrpMaps.label = '── Cartographic Maps ──';
          Object.keys(maps).forEach(mId => {
            const m = maps[mId];
            const opt = document.createElement('option');
            opt.value = `map-${mId}`;
            opt.textContent = `Map: ${m.name || mId} [${(m.scaleTier || 'region').toUpperCase()}]`;
            optGrpMaps.appendChild(opt);
          });
          sel.appendChild(optGrpMaps);
        }

        if (Array.isArray(topo.shapes) && topo.shapes.length > 0) {
          const optGrpShapes = document.createElement('optgroup');
          optGrpShapes.label = '── CAD Drawing Shapes ──';
          topo.shapes.forEach(s => {
            const opt = document.createElement('option');
            opt.value = `shape-${s.id}`;
            opt.textContent = `Shape: ${s.name || s.id} [${(s.type || 'rect').toUpperCase()}]`;
            optGrpShapes.appendChild(opt);
          });
          sel.appendChild(optGrpShapes);
        }
      }

      if (Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 1) {
        sel.value = 'multi';
      } else if (Workstation.selectedEntity) {
        if (Workstation.selectedEntity.type === 'node') {
          sel.value = `node-${Workstation.selectedEntity.id}`;
        } else if (Workstation.selectedEntity.type === 'edge') {
          const ent = Workstation.selectedEntity;
          if (ent.edgeType === 'road') {
            sel.value = `edge-road-${ent.pair}`;
          } else {
            sel.value = `edge-hegemony-${ent.uId}->${ent.vId}`;
          }
        } else if (Workstation.selectedEntity.type === 'shape') {
          sel.value = `shape-${Workstation.selectedEntity.id}`;
        } else {
          sel.value = 'global';
        }
      } else {
        sel.value = 'global';
      }
    }

    function onObjectSelectorChange(val) {
      if (!val || val === 'global') {
        selectGlobal();
      } else if (val === 'multi') {
        updatePropertiesGrid();
      } else if (val === 'multi-filter-node') {
        const filtered = (Workstation.selectedEntities || []).filter(e => e.type === 'node');
        if (typeof setSelection === 'function') setSelection(filtered);
      } else if (val === 'multi-filter-shape') {
        const filtered = (Workstation.selectedEntities || []).filter(e => e.type === 'shape');
        if (typeof setSelection === 'function') setSelection(filtered);
      } else if (val === 'multi-filter-edge') {
        const filtered = (Workstation.selectedEntities || []).filter(e => e.type === 'edge');
        if (typeof setSelection === 'function') setSelection(filtered);
      } else if (val.startsWith('node-')) {
        const idStr = val.replace('node-', '');
        const id = (isNaN(idStr) || idStr.includes('-')) ? idStr : parseInt(idStr);
        selectNode(id);
      } else if (val.startsWith('edge-road-')) {
        const rawPair = val.replace('edge-road-', '');
        const parts = rawPair.split('-');
        if (parts.length === 2) {
          selectEdge('road', parts[0], parts[1]);
        }
      } else if (val.startsWith('edge-hegemony-')) {
        const rawKey = val.replace('edge-hegemony-', '');
        const parts = rawKey.split('->');
        if (parts.length === 2) {
          selectEdge('hegemony', parts[0], parts[1]);
        }
      } else if (val.startsWith('shape-')) {
        const sId = val.replace('shape-', '');
        const topo = Workstation.activeTopology;
        const shape = topo && Array.isArray(topo.shapes) ? topo.shapes.find(s => s.id === sId) : null;
        if (shape) {
          Workstation.selectedEntity = { type: 'shape', id: sId, shape: shape };
          updatePropertiesGrid();
          renderCanvas();
        }
      } else if (val.startsWith('map-')) {
        const mId = val.replace('map-', '');
        if (typeof switchActiveMap === 'function') {
          switchActiveMap(mId);
        }
        selectGlobal();
      }
    }
    // Render Multi-Entity Selection Properties (AutoCAD Shared Attribute Inspector)
    function renderMultiSelectionProperties(tbody, selectedList, topo) {
      const count = selectedList.length;
      appendCategoryRow(tbody, `Multiple Selection (${count} Items)`);

      const nodeItems = selectedList.filter(e => e.type === 'node');
      const shapeItems = selectedList.filter(e => e.type === 'shape');
      const edgeItems = selectedList.filter(e => e.type === 'edge');
      const nodeCount = nodeItems.length;
      const shapeCount = shapeItems.length;
      const edgeCount = edgeItems.length;

      const summaryParts = [];
      if (nodeCount > 0) summaryParts.push(`${nodeCount} Pointcrawl Node${nodeCount > 1 ? 's' : ''}`);
      if (shapeCount > 0) summaryParts.push(`${shapeCount} CAD Shape${shapeCount > 1 ? 's' : ''}`);
      if (edgeCount > 0) summaryParts.push(`${edgeCount} Corridor/Edge${edgeCount > 1 ? 's' : ''}`);

      appendPropRow(tbody, 'Selection Summary', summaryParts.join(', '), false);

      // Category: General Shared Attributes
      appendCategoryRow(tbody, 'General Shared Attributes');

      // 1. Canvas Layer (Universal: Nodes, Shapes, Edges)
      const layers = (typeof getTopologyLayers === 'function') ? getTopologyLayers(topo) : (topo.layers || []);
      const layerIds = new Set();
      selectedList.forEach(item => {
        if (item.type === 'node') {
          const n = topo.nodes[item.id.toString()];
          if (n) layerIds.add(n.layerId || 'layer-nodes');
        } else if (item.type === 'shape') {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) layerIds.add(s.layerId || 'layer-drawings');
        } else if (item.type === 'edge') {
          const uId = item.uId !== undefined ? item.uId : item.id;
          const vId = item.vId;
          const edgeKey = `${uId}->${vId}`;
          const pairKey = `${Math.min(uId, vId)}--${Math.max(uId, vId)}`;
          const edgeRecord = (topo.edgeData && (topo.edgeData[edgeKey] || topo.edgeData[pairKey])) || {};
          layerIds.add(edgeRecord.layerId || (item.edgeType === 'hegemony' ? 'layer-hegemony' : 'layer-roads'));
        }
      });

      const currentLayerVal = layerIds.size === 1 ? Array.from(layerIds)[0] : '*VARIES*';
      const layerOptions = [
        ...(layerIds.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
        ...layers.map(l => ({ val: l.id, label: `${l.name}${l.isCore ? ' (Core)' : ''}` }))
      ];

      appendSelectPropRow(tbody, 'Canvas Layer', currentLayerVal, layerOptions, val => {
        if (val === '*VARIES*') return;
        selectedList.forEach(item => {
          if (item.type === 'node') {
            const n = topo.nodes[item.id.toString()];
            if (n) n.layerId = val;
          } else if (item.type === 'shape') {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.layerId = val;
          } else if (item.type === 'edge') {
            const uId = item.uId !== undefined ? item.uId : item.id;
            const vId = item.vId;
            const edgeKey = `${uId}->${vId}`;
            const pairKey = `${Math.min(uId, vId)}--${Math.max(uId, vId)}`;
            if (!topo.edgeData) topo.edgeData = {};
            if (!topo.edgeData[edgeKey] && !topo.edgeData[pairKey]) topo.edgeData[edgeKey] = {};
            const rec = topo.edgeData[edgeKey] || topo.edgeData[pairKey];
            rec.layerId = val;
          }
        });
        renderCanvas();
        updatePropertiesGrid();
        if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
        saveActiveCampaign();
        setStatusBarMessage(`Assigned all ${selectedList.length} selected entities to layer "${val}".`);
      });

      // 2. Position Locked (Nodes & Shapes)
      if (nodeCount > 0 || shapeCount > 0) {
        const lockStates = new Set();
        nodeItems.forEach(item => {
          const n = topo.nodes[item.id.toString()];
          if (n) lockStates.add(n.locked ? 'true' : 'false');
        });
        shapeItems.forEach(item => {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) lockStates.add(s.locked ? 'true' : 'false');
        });
        const currentLockVal = lockStates.size === 1 ? Array.from(lockStates)[0] : '*VARIES*';
        const lockOptions = [
          ...(lockStates.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
          { val: 'false', label: 'False (Movable)' },
          { val: 'true', label: 'True 🔒 (Locked)' }
        ];
        appendSelectPropRow(tbody, 'Position Locked', currentLockVal, lockOptions, val => {
          if (val === '*VARIES*') return;
          const isLocked = (val === 'true');
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) n.locked = isLocked;
          });
          shapeItems.forEach(item => {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.locked = isLocked;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Set position lock to ${isLocked} for all ${nodeCount + shapeCount} spatial items.`);
        });
      }

      // 3. Visible to Players (Nodes, Edges, Shapes)
      if (nodeCount > 0 || edgeCount > 0 || shapeCount > 0) {
        const visStates = new Set();
        nodeItems.forEach(item => {
          const n = topo.nodes[item.id.toString()];
          if (n) visStates.add(n.visible !== false ? 'true' : 'false');
        });
        edgeItems.forEach(item => {
          const uId = item.uId !== undefined ? item.uId : item.id;
          const vId = item.vId;
          const edgeKey = `${uId}->${vId}`;
          const pairKey = `${Math.min(uId, vId)}--${Math.max(uId, vId)}`;
          const rec = (topo.edgeData && (topo.edgeData[edgeKey] || topo.edgeData[pairKey])) || {};
          visStates.add(rec.visible !== false ? 'true' : 'false');
        });
        shapeItems.forEach(item => {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) visStates.add(s.visible !== false ? 'true' : 'false');
        });
        const currentVisVal = visStates.size === 1 ? Array.from(visStates)[0] : '*VARIES*';
        const visOptions = [
          ...(visStates.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
          { val: 'true', label: 'True 👁️ (Revealed)' },
          { val: 'false', label: 'False 👁️‍🗨️ (Hidden / Fog of War)' }
        ];
        appendSelectPropRow(tbody, 'Visible to Players', currentVisVal, visOptions, val => {
          if (val === '*VARIES*') return;
          const isVis = (val === 'true');
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) n.visible = isVis;
          });
          edgeItems.forEach(item => {
            const uId = item.uId !== undefined ? item.uId : item.id;
            const vId = item.vId;
            const edgeKey = `${uId}->${vId}`;
            const pairKey = `${Math.min(uId, vId)}--${Math.max(uId, vId)}`;
            if (!topo.edgeData) topo.edgeData = {};
            if (!topo.edgeData[edgeKey] && !topo.edgeData[pairKey]) topo.edgeData[edgeKey] = {};
            const rec = topo.edgeData[edgeKey] || topo.edgeData[pairKey];
            rec.visible = isVis;
          });
          shapeItems.forEach(item => {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.visible = isVis;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Updated player visibility to ${isVis} across selected elements.`);
        });
      }

      // Category: Shape Vector Styling (If shapes are selected)
      if (shapeCount > 0) {
        appendCategoryRow(tbody, `Shape Styling & Colors (${shapeCount} Shapes)`);

        // Fill Color
        const fillColors = new Set();
        shapeItems.forEach(item => {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) fillColors.add(s.fillColor || 'rgba(59, 130, 246, 0.2)');
        });
        const currentFill = fillColors.size === 1 ? Array.from(fillColors)[0] : '*VARIES*';
        appendColorPropRow(tbody, 'Fill Color', currentFill, val => {
          shapeItems.forEach(item => {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.fillColor = val;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Updated fill color on all ${shapeCount} selected shapes.`);
        });

        // Stroke Color
        const strokeColors = new Set();
        shapeItems.forEach(item => {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) strokeColors.add(s.strokeColor || '#2563eb');
        });
        const currentStroke = strokeColors.size === 1 ? Array.from(strokeColors)[0] : '*VARIES*';
        appendColorPropRow(tbody, 'Stroke Color', currentStroke, val => {
          shapeItems.forEach(item => {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.strokeColor = val;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Updated stroke color on all ${shapeCount} selected shapes.`);
        });

        // Stroke Width
        const strokeWidths = new Set();
        shapeItems.forEach(item => {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) strokeWidths.add(s.strokeWidth || 2);
        });
        const currentWidth = strokeWidths.size === 1 ? Array.from(strokeWidths)[0] : '*VARIES*';
        appendPropRow(tbody, 'Stroke Width', currentWidth, true, val => {
          const w = Math.max(1, parseFloat(val) || 1);
          shapeItems.forEach(item => {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.strokeWidth = w;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
        });

        // Stroke Style
        const strokeStyles = new Set();
        shapeItems.forEach(item => {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) strokeStyles.add(s.strokeDash || 'solid');
        });
        const currentStyle = strokeStyles.size === 1 ? Array.from(strokeStyles)[0] : '*VARIES*';
        const styleOptions = [
          ...(strokeStyles.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
          { val: 'solid', label: 'Solid Line' },
          { val: 'dashed', label: 'Dashed (6, 4)' },
          { val: 'dotted', label: 'Dotted (2, 3)' }
        ];
        appendSelectPropRow(tbody, 'Stroke Style', currentStyle, styleOptions, val => {
          if (val === '*VARIES*') return;
          shapeItems.forEach(item => {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.strokeDash = val;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
        });

        // Opacity (0-100%)
        const opacities = new Set();
        shapeItems.forEach(item => {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s) opacities.add(Math.round((s.opacity !== undefined ? s.opacity : 1.0) * 100));
        });
        const currentOpacity = opacities.size === 1 ? Array.from(opacities)[0] : '*VARIES*';
        appendPropRow(tbody, 'Opacity (0-100%)', currentOpacity, true, val => {
          const clamped = Math.max(0, Math.min(100, parseFloat(val) || 100)) / 100;
          shapeItems.forEach(item => {
            const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
            if (s) s.opacity = clamped;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Set opacity to ${Math.round(clamped * 100)}% on all ${shapeCount} selected shapes.`);
        });
      }

      // Category: Node Topology & Styling (If nodes are selected)
      if (nodeCount > 0) {
        appendCategoryRow(tbody, `Node Appearance & Geometry (${nodeCount} Nodes)`);

        // Node CAD Color
        const cadColors = (typeof AUTOCAD_COLORS !== 'undefined') ? AUTOCAD_COLORS : (window.AUTOCAD_COLORS || []);
        const nodeColors = new Set();
        nodeItems.forEach(item => {
          const n = topo.nodes[item.id.toString()];
          if (n) nodeColors.add((n.color || '').toLowerCase());
        });
        const currentColor = nodeColors.size === 1 ? Array.from(nodeColors)[0] : '*VARIES*';
        const colorOptions = [
          ...(nodeColors.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
          ...cadColors.map(c => ({ val: (c.val || '').toLowerCase(), label: c.label }))
        ];
        appendSelectPropRow(tbody, 'Node Color (CAD)', currentColor, colorOptions, val => {
          if (val === '*VARIES*') return;
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) n.color = val;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Set CAD color to ${val || 'Auto'} for all ${nodeCount} selected nodes.`);
        });

        // If Homogeneous Node Selection (ONLY nodes selected)
        if (nodeCount === count) {
          // Node Shape
          const nodeShapes = new Set();
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) nodeShapes.add(n.shape || 'circle');
          });
          const curShapeVal = nodeShapes.size === 1 ? Array.from(nodeShapes)[0] : '*VARIES*';
          const shapeOptions = [
            ...(nodeShapes.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
            { val: 'circle', label: 'Circle (Standard)' },
            { val: 'square', label: 'Square (Fortress / Site)' },
            { val: 'triangle', label: 'Triangle (Apex / Hazard)' },
            { val: 'diamond', label: 'Diamond (Checkpoint)' },
            { val: 'star', label: 'Star (Sovereign 5-Pt)' },
            { val: 'oval', label: 'Oval / Capsule (Sprawl)' },
            { val: 'pentagon', label: 'Pentagon (Stronghold)' }
          ];
          appendSelectPropRow(tbody, 'Shape', curShapeVal, shapeOptions, val => {
            if (val === '*VARIES*') return;
            nodeItems.forEach(item => {
              const n = topo.nodes[item.id.toString()];
              if (n) n.shape = val;
            });
            renderCanvas();
            updatePropertiesGrid();
            saveActiveCampaign();
          });

          // Node Tier
          const tiers = new Set();
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) tiers.add(n.tier !== undefined ? n.tier : 2);
          });
          const curTierVal = tiers.size === 1 ? Array.from(tiers)[0] : '*VARIES*';
          const tierOptions = [
            ...(tiers.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
            { val: 2, label: 'Tier 2 (Standard Settlement / POI)' },
            { val: 3, label: 'Tier 3 (Hazard / Apex Site)' },
            { val: 0, label: 'Tier 0 (Meta Equilibrium Key)' }
          ];
          appendSelectPropRow(tbody, 'Tier', curTierVal, tierOptions, val => {
            if (val === '*VARIES*') return;
            const t = parseInt(val);
            nodeItems.forEach(item => {
              const n = topo.nodes[item.id.toString()];
              if (n) {
                n.tier = t;
                n.eligible = (t === 2);
              }
            });
            renderCanvas();
            updatePropertiesGrid();
            saveActiveCampaign();
          });

          // Node Diameter / Radius
          const radii = new Set();
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) radii.add(n.radius || (n.tier === 0 ? 22 : (n.tier === 3 ? 15 : 18)));
          });
          const curRadVal = radii.size === 1 ? Array.from(radii)[0] : '*VARIES*';
          const radOptions = [
            ...(radii.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
            { val: 12, label: 'Small (12px / 24px dia)' },
            { val: 15, label: 'Compact (15px / 30px dia)' },
            { val: 18, label: 'Standard (18px / 36px dia)' },
            { val: 22, label: 'Large (22px / 44px dia)' },
            { val: 26, label: 'Hub Major (26px / 52px dia)' },
            { val: 32, label: 'Colossal (32px / 64px dia)' }
          ];
          appendSelectPropRow(tbody, 'Diameter / Size', curRadVal, radOptions, val => {
            if (val === '*VARIES*') return;
            const r = parseInt(val);
            nodeItems.forEach(item => {
              const n = topo.nodes[item.id.toString()];
              if (n) n.radius = r;
            });
            renderCanvas();
            updatePropertiesGrid();
            saveActiveCampaign();
          });

          // Culture Quadrant
          const cultures = new Set();
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) cultures.add(n.culture || 'Clan');
          });
          const curCultVal = cultures.size === 1 ? Array.from(cultures)[0] : '*VARIES*';
          const cultOptions = [
            ...(cultures.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
            { val: 'Clan', label: 'Clan (Cohesion / Internal)' },
            { val: 'Adhocracy', label: 'Adhocracy (Energy / Innovation)' },
            { val: 'Market', label: 'Market (Structure / Extraction)' },
            { val: 'Hierarchy', label: 'Hierarchy (Stability / Control)' }
          ];
          appendSelectPropRow(tbody, 'Culture Quadrant', curCultVal, cultOptions, val => {
            if (val === '*VARIES*') return;
            nodeItems.forEach(item => {
              const n = topo.nodes[item.id.toString()];
              if (n) n.culture = val;
            });
            renderCanvas();
            updatePropertiesGrid();
            saveActiveCampaign();
          });

          const opProfiles = new Set();
          nodeItems.forEach(item => {
            const n = topo.nodes[item.id.toString()];
            if (n) opProfiles.add(n.opProfile || 'Produce');
          });
          const curOpVal = opProfiles.size === 1 ? Array.from(opProfiles)[0] : '*VARIES*';
          const opOptions = [
            ...(curOpVal === '*VARIES*' ? [{ val: '*VARIES*', label: '*VARIES* (Mixed Profiles)' }] : []),
            { val: 'Design', label: 'Design (Innovation / Blueprint)' },
            { val: 'Service', label: 'Service (Support / Administration)' },
            { val: 'Produce', label: 'Produce (Extraction / Manufacturing)' },
            { val: 'Deliver', label: 'Deliver (Logistics / Distribution)' }
          ];
          appendSelectPropRow(tbody, 'Operational Profile', curOpVal, opOptions, val => {
            if (val === '*VARIES*') return;
            nodeItems.forEach(item => {
              const n = topo.nodes[item.id.toString()];
              if (n) n.opProfile = val;
            });
            renderCanvas();
            updatePropertiesGrid();
            saveActiveCampaign();
          });
        }
      }

      // If Homogeneous Edge Selection (ONLY edges selected)
      if (edgeCount === count) {
        appendCategoryRow(tbody, `Corridor Properties (${edgeCount} Edges)`);

        const conditions = new Set();
        const hazards = new Set();
        edgeItems.forEach(item => {
          const uId = item.uId !== undefined ? item.uId : item.id;
          const vId = item.vId;
          const edgeKey = `${uId}->${vId}`;
          const pairKey = `${Math.min(uId, vId)}--${Math.max(uId, vId)}`;
          const rec = (topo.edgeData && (topo.edgeData[edgeKey] || topo.edgeData[pairKey])) || {};
          conditions.add(rec.condition || 'Passable');
          hazards.add(rec.hazardLevel || 0);
        });

        // Condition
        const curCond = conditions.size === 1 ? Array.from(conditions)[0] : '*VARIES*';
        const condOptions = [
          ...(conditions.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
          { val: 'Passable', label: 'Passable (Open & Clear)' },
          { val: 'Paved Highway', label: 'Paved Highway (Expedited Transit)' },
          { val: 'Rough Terrain', label: 'Rough Terrain (Half Speed)' },
          { val: 'Hazardous', label: 'Hazardous (Damage / Survival Check)' },
          { val: 'Blockaded / Besieged', label: 'Blockaded / Besieged (Passage Denied)' },
          { val: 'Subterranean Chasm', label: 'Subterranean Chasm (Special Gear Required)' }
        ];
        appendSelectPropRow(tbody, 'Condition', curCond, condOptions, val => {
          if (val === '*VARIES*') return;
          edgeItems.forEach(item => {
            const uId = item.uId !== undefined ? item.uId : item.id;
            const vId = item.vId;
            const edgeKey = `${uId}->${vId}`;
            const pairKey = `${Math.min(uId, vId)}--${Math.max(uId, vId)}`;
            if (!topo.edgeData) topo.edgeData = {};
            if (!topo.edgeData[edgeKey] && !topo.edgeData[pairKey]) topo.edgeData[edgeKey] = {};
            const rec = topo.edgeData[edgeKey] || topo.edgeData[pairKey];
            rec.condition = val;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
        });

        // Hazard Rating
        const curHaz = hazards.size === 1 ? Array.from(hazards)[0] : '*VARIES*';
        const hazOptions = [
          ...(hazards.size > 1 ? [{ val: '*VARIES*', label: '*VARIES*' }] : []),
          { val: 0, label: 'Level 0 (No Hazard)' },
          { val: 1, label: 'Level 1 (Low Threat - 1 Tick Dial)' },
          { val: 2, label: 'Level 2 (Moderate Peril - 2 Tick Dial)' },
          { val: 3, label: 'Level 3 (High Danger - 3 Tick Dial)' },
          { val: 4, label: 'Level 4 (Catastrophic Chokepoint)' }
        ];
        appendSelectPropRow(tbody, 'Hazard Rating', curHaz, hazOptions, val => {
          if (val === '*VARIES*') return;
          const h = parseInt(val) || 0;
          edgeItems.forEach(item => {
            const uId = item.uId !== undefined ? item.uId : item.id;
            const vId = item.vId;
            const edgeKey = `${uId}->${vId}`;
            const pairKey = `${Math.min(uId, vId)}--${Math.max(uId, vId)}`;
            if (!topo.edgeData) topo.edgeData = {};
            if (!topo.edgeData[edgeKey] && !topo.edgeData[pairKey]) topo.edgeData[edgeKey] = {};
            const rec = topo.edgeData[edgeKey] || topo.edgeData[pairKey];
            rec.hazardLevel = h;
          });
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
        });
      }

      // Actions
      appendCategoryRow(tbody, 'Batch Operations');
      if (nodeCount > 0 || shapeCount > 0) {
        appendButtonPropRow(tbody, 'Batch Offset', '✥ Reposition Selection (Enter ΔX, ΔY)...', () => {
          promptRepositionSelection();
        });
      }
      appendActionPropRow(tbody, '[Delete All Selected]', `Delete all ${count} entities`, () => {
        if (typeof deleteSelected === 'function') {
          deleteSelected();
        }
      });
      appendActionPropRow(tbody, '[Deselect All]', 'Clear active multi-selection', () => {
        if (typeof clearSelection === 'function') {
          clearSelection();
        }
      });
    }

    // AutoCAD MOVE by Displacement Vector (@ΔX, ΔY)
    function promptRepositionSelection() {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(Workstation.selectedEntities) || Workstation.selectedEntities.length === 0) return;
      const input = prompt('Enter displacement offset delta X, Y (e.g. 50, -20):');
      if (!input) return;
      const parts = input.split(',').map(s => parseFloat(s.trim()));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        alert('Invalid offset. Please enter as "dx, dy" (e.g. 100, -50).');
        return;
      }
      const dx = parts[0];
      const dy = parts[1];
      let movedCount = 0;
      Workstation.selectedEntities.forEach(item => {
        if (item.type === 'node') {
          const n = topo.nodes[item.id.toString()];
          if (n && !n.locked) {
            n.x = (n.x || 0) + dx;
            n.y = (n.y || 0) + dy;
            movedCount++;
          }
        } else if (item.type === 'shape') {
          const s = (topo.shapes || []).find(sh => sh.id === item.id) || item.shape;
          if (s && !s.locked) {
            s.x = (s.x || 0) + dx;
            s.y = (s.y || 0) + dy;
            if (s.type === 'line') {
              s.x2 = (s.x2 !== undefined ? s.x2 : s.x) + dx;
              s.y2 = (s.y2 !== undefined ? s.y2 : s.y) + dy;
            }
            movedCount++;
          }
        }
      });
      renderCanvas();
      updatePropertiesGrid();
      saveActiveCampaign();
      setStatusBarMessage(`Repositioned ${movedCount} unlocked entities by (${dx}, ${dy}).`);
    }

    // Two-Column Visual Basic 6 Property Grid Engine
    function updatePropertiesGrid(targetTbody = null, targetEntity = null, targetTopo = null) {
      const tbody = targetTbody || document.getElementById('vb-props-body');
      if (!tbody) return;
      tbody.innerHTML = '';
      const topo = targetTopo || Workstation.activeTopology;
      if (!topo) return;

      if (!targetEntity && Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 1) {
        renderMultiSelectionProperties(tbody, Workstation.selectedEntities, topo);
        return;
      }

      const entity = targetEntity || Workstation.selectedEntity || { type: 'global' };

      if (entity.type === 'node') {
        const node = topo.nodes[entity.id.toString()];
        if (!node) return;

        // Category: Topology
        appendCategoryRow(tbody, 'Topology');
        appendPropRow(tbody, 'ID', node.id, false);
        appendPropRow(tbody, 'Name', node.name, true, val => { node.name = val; renderCanvas(); saveActiveCampaign(); });

        const layers = (typeof getTopologyLayers === 'function') ? getTopologyLayers(topo) : (topo.layers || []);
        appendSelectPropRow(tbody, 'Canvas Layer', node.layerId || 'layer-nodes', layers.map(l => ({ val: l.id, label: `${l.name}${l.isCore ? ' (Core)' : ''}` })), val => {
          node.layerId = val;
          renderCanvas();
          updatePropertiesGrid();
          if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
          saveActiveCampaign();
          setStatusBarMessage(`Node ${node.id} assigned to layer "${val}".`);
        });

        appendSelectPropRow(tbody, 'Tier', node.tier, [
          { val: 2, label: 'Tier 2 (Standard Settlement / POI)' },
          { val: 3, label: 'Tier 3 (Hazard / Apex Site)' },
          { val: 0, label: 'Tier 0 (Meta Equilibrium Key)' }
        ], val => { node.tier = parseInt(val); node.eligible = (node.tier === 2); renderCanvas(); updatePropertiesGrid(); saveActiveCampaign(); });
        appendPropRow(tbody, 'X Position', node.x, !node.locked, val => { if (!node.locked) { node.x = parseInt(val) || 0; renderCanvas(); saveActiveCampaign(); } });
        appendPropRow(tbody, 'Y Position', node.y, !node.locked, val => { if (!node.locked) { node.y = parseInt(val) || 0; renderCanvas(); saveActiveCampaign(); } });
        appendSelectPropRow(tbody, 'Position Locked', node.locked ? 'true' : 'false', [
          { val: 'false', label: 'False (Movable)' },
          { val: 'true', label: 'True 🔒 (Locked)' }
        ], val => {
          node.locked = (val === 'true');
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Node ${node.id} position ${node.locked ? 'locked 🔒' : 'unlocked'}.`);
        });
        appendButtonPropRow(tbody, 'Reposition', '✥ Move Node (Enter X, Y)...', () => promptMoveNode(node.id));

        // Category: Geometry & Appearance
        appendCategoryRow(tbody, 'Geometry & Appearance');
        appendSelectPropRow(tbody, 'Shape', node.shape || 'circle', [
          { val: 'circle', label: 'Circle (Standard)' },
          { val: 'square', label: 'Square (Fortress / Site)' },
          { val: 'triangle', label: 'Triangle (Apex / Hazard)' },
          { val: 'diamond', label: 'Diamond (Checkpoint)' },
          { val: 'star', label: 'Star (Sovereign 5-Pt)' },
          { val: 'oval', label: 'Oval / Capsule (Sprawl)' },
          { val: 'pentagon', label: 'Pentagon (Stronghold)' }
        ], val => {
          node.shape = val;
          renderCanvas();
          saveActiveCampaign();
          setStatusBarMessage(`Updated Node ${node.id} shape to ${val}.`);
        });
        appendSelectPropRow(tbody, 'Diameter / Size', node.radius || (node.tier === 0 ? 22 : (node.tier === 3 ? 15 : 18)), [
          { val: 12, label: 'Small (12px / 24px dia)' },
          { val: 15, label: 'Compact (15px / 30px dia)' },
          { val: 18, label: 'Standard (18px / 36px dia)' },
          { val: 22, label: 'Large (22px / 44px dia)' },
          { val: 26, label: 'Hub Major (26px / 52px dia)' },
          { val: 32, label: 'Colossal (32px / 64px dia)' }
        ], val => {
          node.radius = parseInt(val);
          renderCanvas();
          saveActiveCampaign();
          setStatusBarMessage(`Updated Node ${node.id} radius to ${val}px.`);
        });

        // AutoCAD Standard Palette (ACI 1-9)
        appendSelectPropRow(tbody, 'Node Color (CAD)', (node.color || '').toLowerCase(), AUTOCAD_COLORS.map(c => ({ val: (c.val || '').toLowerCase(), label: c.label })), val => {
          node.color = val;
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Node ${node.id} color set to ${val ? val : 'Auto'}.`);
        });

        // Fog-of-War Player Visibility
        appendSelectPropRow(tbody, 'Visible to Players', node.visible !== false ? 'true' : 'false', [
          { val: 'true', label: 'True 👁️ (Revealed Location)' },
          { val: 'false', label: 'False 👁️‍🗨️ (Hidden / Fog of War)' }
        ], val => {
          node.visible = (val === 'true');
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Node ${node.id} is now ${node.visible ? 'visible to players' : 'hidden from players (Fog of War)'}.`);
        });

        // Category: Sociology & [S, E, C] Disposition
        appendCategoryRow(tbody, 'Sociology & [S, E, C] Disposition');
        appendSelectPropRow(tbody, 'Culture Quadrant', node.culture || 'Clan', [
          { val: 'Clan', label: 'Clan (Cohesion / Internal)' },
          { val: 'Adhocracy', label: 'Adhocracy (Energy / Innovation)' },
          { val: 'Market', label: 'Market (Structure / Extraction)' },
          { val: 'Hierarchy', label: 'Hierarchy (Stability / Control)' }
        ], val => { node.culture = val; renderCanvas(); saveActiveCampaign(); });
        appendSelectPropRow(tbody, 'Operational Profile', node.opProfile || 'Produce', [
          { val: 'Design', label: 'Design (Innovation / Blueprint)' },
          { val: 'Service', label: 'Service (Support / Administration)' },
          { val: 'Produce', label: 'Produce (Extraction / Manufacturing)' },
          { val: 'Deliver', label: 'Deliver (Logistics / Distribution)' }
        ], val => { node.opProfile = val; renderCanvas(); saveActiveCampaign(); });
        appendPropRow(tbody, 'Category', node.cat || 'Standard Location', true, val => { node.cat = val; saveActiveCampaign(); });

        // [S,E,C] Tri-State Vector & Archetype (Editable Core Sociology)
        const cardFallback = (typeof drawnCards !== "undefined") ? drawnCards[node.id] : null;
        const curS = (node.odv && (node.odv.s !== undefined ? node.odv.s : node.odv[0])) || (cardFallback ? ((cardFallback.index % 4) + 1) : 2);
        const curE = (node.odv && (node.odv.e !== undefined ? node.odv.e : node.odv[1])) || (cardFallback ? (((cardFallback.index * 2) % 4) + 1) : 2);
        const curC = (node.odv && (node.odv.c !== undefined ? node.odv.c : node.odv[2])) || (cardFallback ? (((cardFallback.index * 3) % 4) + 1) : 2);
        if (!node.odv || typeof node.odv !== 'object' || Array.isArray(node.odv)) {
          node.odv = { s: curS, e: curE, c: curC };
        }
        const odvTag = `[${curS}, ${curE}, ${curC}]`;
        const archetype = (typeof ODV_MATRIX_64 !== "undefined" && ODV_MATRIX_64[odvTag])
          ? ODV_MATRIX_64[odvTag]
          : { archetypeName: 'Standard Archetype', coreBoon: 'N/A', coreBurden: 'N/A' };

        const secOptions = [
          { val: 1, label: '1 (Low / Insular / Rigid)' },
          { val: 2, label: '2 (Moderate / Balanced)' },
          { val: 3, label: '3 (High / Dynamic)' },
          { val: 4, label: '4 (Extreme / Unbounded)' }
        ];
        appendSelectPropRow(tbody, 'S (Spiritual / Flex)', curS, secOptions, val => {
          node.odv.s = parseInt(val) || 2;
          saveActiveCampaign();
          updatePropertiesGrid();
        });
        appendSelectPropRow(tbody, 'E (Economic / Ext)', curE, secOptions, val => {
          node.odv.e = parseInt(val) || 2;
          saveActiveCampaign();
          updatePropertiesGrid();
        });
        appendSelectPropRow(tbody, 'C (Coercive / Scale)', curC, secOptions, val => {
          node.odv.c = parseInt(val) || 2;
          saveActiveCampaign();
          updatePropertiesGrid();
        });
        appendPropRow(tbody, 'Disposition Vector', odvTag, false);
        appendPropRow(tbody, '64-Cell Archetype', archetype.archetypeName || 'Adaptive Cell', false);
        if (archetype.coreBoon) appendPropRow(tbody, 'Core Boon', archetype.coreBoon.replace(/\*\*/g, ''), false);
        if (archetype.coreBurden) appendPropRow(tbody, 'Core Burden', archetype.coreBurden.replace(/\*\*/g, ''), false);
        appendActionPropRow(tbody, '[Sync Quadrant]', '🔄 Derive Quadrant from [S, E]', () => {
          if (typeof deriveCvfQuadrant === 'function') {
            node.culture = deriveCvfQuadrant(node.odv.s, node.odv.e);
            renderCanvas();
            updatePropertiesGrid();
            saveActiveCampaign();
            setStatusBarMessage(`Node ${node.id} Culture Quadrant synced to ${node.culture} from [${node.odv.s}, ${node.odv.e}, ${node.odv.c}].`);
          }
        });

        // Category: Hierarchical Cartography (Associated Sub-Maps & Child Portals)
        appendCategoryRow(tbody, 'Associated Sub-Maps');
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        const rec = getRecursiveNodeEntities(node.id, curMapId);

        if (rec.direct.submaps.length === 0 && rec.submaps.length === 0) {
          appendPropRow(tbody, 'Sub-Map Status', '(None associated)', false);
        } else {
          rec.direct.submaps.forEach((m, idx) => {
            const tierLabel = (typeof SCALE_TIERS !== "undefined" && SCALE_TIERS[m.scaleTier]) ? SCALE_TIERS[m.scaleTier].label.split(' / ')[0] : (m.scaleTier || 'region');
            const dispTag = m.dispositionModifier ? ` [${m.dispositionModifier}]` : '';
            const desc = `${m.name} (${tierLabel})${dispTag}`;
            appendActionPropRow(tbody, `Direct Sub-Map #${idx+1}`, `🌀 Enter ${desc} ->`, () => {
              if (typeof switchActiveMap === 'function') switchActiveMap(m.id);
            });
          });

          // Render nested descendant sub-submaps
          const nestedSubmaps = rec.submaps.filter(sm => !rec.direct.submaps.some(dm => dm.id === sm.mapId));
          nestedSubmaps.forEach((sm, idx) => {
            const pathStr = sm.path.join(' > ');
            appendActionPropRow(tbody, `Nested Submap #${idx+1}`, `↳ ${sm.mapName} (${pathStr}) ->`, () => {
              if (typeof switchActiveMap === 'function') switchActiveMap(sm.mapId);
            });
          });
        }

        // Action to create or attach a new submap anchored directly to this node
        appendActionPropRow(tbody, '[+ Create Sub-Map]', `+ Create Sub-Map for Node ${node.id}...`, () => {
          if (typeof openNewMapModal === 'function') {
            openNewMapModal();
          } else if (typeof openNewSubMapPrompt === 'function') {
            openNewSubMapPrompt();
          }
        });

        // Portal Bridge Logistics (SYS-START-12)
        if (node.childMapId || (rec.direct && rec.direct.submaps.length > 0)) {
          appendCategoryRow(tbody, 'Portal Bridge Logistics');
          appendSelectPropRow(tbody, 'Export Down', node.exportDown !== false ? 'Enabled' : 'Disabled', ['Enabled', 'Disabled'], val => {
            node.exportDown = (val === 'Enabled');
            saveActiveCampaign();
            if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
          });
          appendSelectPropRow(tbody, 'Import Up', node.importUp !== false ? 'Enabled' : 'Disabled', ['Enabled', 'Disabled'], val => {
            node.importUp = (val === 'Enabled');
            saveActiveCampaign();
            if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
          });
        }

        // Category: Demographics & Geopolitics (ADR-0015 v2)
        appendCategoryRow(tbody, 'Demographics & Geopolitics');

        // 1. Read-only Census row (SYS-RACE-02 format)
        const prim = (node.demographics && node.demographics.primary) ? `${node.demographics.primary.name} (${node.demographics.primary.percentage}%)` : null;
        const mins = (node.demographics && Array.isArray(node.demographics.minorities)) ? node.demographics.minorities.map(m => `${m.name} (${m.percentage}%)`).join(', ') : '';
        const censusSummary = prim ? (mins ? `${prim}, ${mins}` : prim) : (mins || 'Universal Mixed (100%)');
        appendPropRow(tbody, 'Census', censusSummary, false);

        // 2. Peoples (tags) chip row
        appendChipInputPropRow(
          tbody,
          'Peoples (tags)',
          () => (node.demographics && Array.isArray(node.demographics.tags)) ? node.demographics.tags : [],
          `dl-demo-node-${node.id}`,
          () => (typeof getDemographicNames === 'function') ? getDemographicNames(node.demographics) : [],
          (tag) => {
            if (typeof addDemographicTag === 'function') addDemographicTag(node, tag);
          },
          (tag) => {
            if (typeof removeDemographicTag === 'function') removeDemographicTag(node, tag);
          }
        );

        // 3. Controlling Faction
        appendComboboxPropRow(
          tbody,
          'Controlling Faction',
          node.faction || 'neutral',
          `dl-controlling-faction-${node.id}`,
          () => {
            const pool = (typeof getCampaignFactionSuggestions === 'function') ? getCampaignFactionSuggestions() : [];
            const suggestions = [
              { val: 'neutral', label: 'Neutral / Unguarded' },
              { val: 'Contested', label: 'Contested / Warring Factions' }
            ];
            pool.forEach(f => {
              if (f && f.toLowerCase() !== 'neutral' && f.toLowerCase() !== 'contested') {
                if (!suggestions.some(s => s.val.toLowerCase() === f.toLowerCase())) {
                  suggestions.push({ val: f, label: f });
                }
              }
            });
            return suggestions;
          },
          val => {
            let canonical = (val || '').trim();
            if (canonical === 'Neutral / Unguarded' || canonical.toLowerCase() === 'neutral') {
              canonical = 'neutral';
            } else if (canonical === 'Contested / Warring Factions' || canonical.toLowerCase() === 'contested') {
              canonical = 'Contested';
            } else if (canonical && typeof registerCampaignFaction === 'function') {
              registerCampaignFaction(canonical);
            }
            if (typeof pushHistoryState === 'function') pushHistoryState(`Change Controlling Faction: ${canonical}`);
            node.faction = canonical || 'neutral';
            saveActiveCampaign();
            if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
          }
        );

        // 4. Factions Present chip row
        appendChipInputPropRow(
          tbody,
          'Factions Present',
          () => Array.isArray(node.factionPresence) ? node.factionPresence : [],
          `dl-fac-node-${node.id}`,
          () => (typeof getCampaignFactionSuggestions === 'function') ? getCampaignFactionSuggestions() : [],
          (fac) => {
            if (typeof addFactionPresence === 'function') addFactionPresence(node, fac);
          },
          (fac) => {
            if (typeof removeFactionPresence === 'function') removeFactionPresence(node, fac);
          }
        );

        // 5. Party Rapport
        appendPartyRapportPropRow(tbody, 'Party Rapport', node.partyRapport, (newRapport) => {
          if (typeof setPartyRapport === 'function') {
            setPartyRapport(node, newRapport);
          } else {
            node.partyRapport = newRapport;
            saveActiveCampaign();
          }
        });

        // Category: GM Notes & [[Wiki]] Citations
        appendCategoryRow(tbody, 'GM Notes & Citations');
        appendTextareaPropRow(tbody, 'Node Lore Notes', node.customNotes || '', 3, val => {
          node.customNotes = val;
          saveActiveCampaign();
          if (typeof buildWikiIndex === 'function') buildWikiIndex();
        });
        appendBacklinksPropRow(tbody, 'node', node.id);

        // Category: Connectivity
        appendCategoryRow(tbody, 'Connectivity');
        const adjSummary = (node.adj && node.adj.length > 0)
          ? `${node.adj.length} Road${node.adj.length === 1 ? '' : 's'} [${node.adj.join(', ')}]`
          : '(None)';
        appendEllipsisPropRow(tbody, 'Adjacencies (adj)', adjSummary, () => {
          openNodeCollectionModal(node, 'adj');
        });
        const infSummary = (node.infBy && node.infBy.length > 0)
          ? `${node.infBy.length} Source${node.infBy.length === 1 ? '' : 's'} [${node.infBy.join(', ')}]`
          : '(None)';
        appendEllipsisPropRow(tbody, 'Influenced By (infBy)', infSummary, () => {
          openNodeCollectionModal(node, 'infBy');
        });

        // Category: Local Resource Logistics (SYS-START-08)
        appendCategoryRow(tbody, 'Local Resource Logistics');
        if (!Array.isArray(node.provides)) node.provides = [];
        if (!Array.isArray(node.requires)) node.requires = [];
        appendEllipsisPropRow(tbody, 'Ad-Hoc Yields (provides)', node.provides.length ? node.provides.join(', ') : '(None)', () => {
          openResourceTagModal(node, 'provides', 'node', `Node #${node.id}`);
        });
        appendEllipsisPropRow(tbody, 'Ad-Hoc Demands (requires)', node.requires.length ? node.requires.join(', ') : '(None)', () => {
          openResourceTagModal(node, 'requires', 'node', `Node #${node.id}`);
        });
        if (node.requires.length > 0 && typeof checkNodeAdHocSupplyLine === 'function') {
          const adHocAudit = checkNodeAdHocSupplyLine(node.id);
          appendPropRow(tbody, 'Logistics Status', adHocAudit.ok ? '✅ All Demands Met' : `⚠️ Deficit: ${adHocAudit.missing.join(', ')}`, false);
        }
        if ((node.provides && node.provides.length > 0) || (node.requires && node.requires.length > 0)) {
          appendActionPropRow(tbody, '[+ Promote to Module]', 'Convert Endowments to Custom Module...', () => {
            if (typeof promoteNodeEndowmentsToModule === 'function') {
              promoteNodeEndowmentsToModule(node.id);
            }
          });
        }

        // Category: Slotted Modules
        appendCategoryRow(tbody, 'Slotted Modules');
        if (!Array.isArray(node.modules)) node.modules = [];
        if (node.modules.length === 0) {
          appendPropRow(tbody, '(None)', 'No modules slotted', false);
        } else {
          node.modules.forEach((modId, idx) => {
            const modObj = (typeof ALL_MODULES !== "undefined") ? ALL_MODULES.find(m => m.id === modId) : null;
            const title = modObj ? `${modId}: ${modObj.title}` : modId;
            appendActionPropRow(tbody, `Module #${idx+1}`, title, () => {
              openModuleExplorer(modId, node.id);
            });
          });
        }
        appendActionPropRow(tbody, '[+ Slot / Browse]', 'Open Module Explorer...', () => {
          openModuleExplorer(null, node.id);
        });

        // Category: Assigned NPCs (Direct + Recursive Sub-Maps)
        appendCategoryRow(tbody, `Assigned NPCs (${rec.totals.npcs} total)`);
        if (rec.direct.npcs.length === 0 && rec.totals.npcs === 0) {
          appendPropRow(tbody, '(None)', 'No NPCs stationed here', false);
        } else {
          rec.direct.npcs.forEach((n, idx) => {
            const stIcon = (n.dispositionToParty === 2) ? '🔵+2' : ((n.dispositionToParty === 1) ? '🟢+1' : ((n.dispositionToParty === -1) ? '🟠-1' : ((n.dispositionToParty === -2) ? '🔴-2' : '⚪0')));
            const statTag = (n.status && n.status !== 'Active') ? ` [${n.status}]` : '';
            appendActionPropRow(tbody, `Direct NPC #${idx+1}`, `[${stIcon}] ${n.name}${statTag} (${n.role || 'Resident'})`, () => {
              openEntityManager('npc', n.id);
            });
          });
          rec.submaps.forEach(sm => {
            sm.npcs.forEach((n, idx) => {
              const stIcon = (n.dispositionToParty === 2) ? '🔵+2' : ((n.dispositionToParty === 1) ? '🟢+1' : ((n.dispositionToParty === -1) ? '🟠-1' : ((n.dispositionToParty === -2) ? '🔴-2' : '⚪0')));
              appendActionPropRow(tbody, `Sub-Map NPC`, `🌀 ${sm.mapName} [#${n.nodeId}]: [${stIcon}] ${n.name}`, () => {
                if (typeof switchActiveMap === 'function') switchActiveMap(sm.mapId);
                setTimeout(() => openEntityManager('npc', n.id), 60);
              });
            });
          });
        }
        appendActionPropRow(tbody, '[+ Add NPC]', `+ Add NPC to Node ${node.id}...`, () => {
          openNewEntityModal('npc', node.id);
        });

        // Category: Active Quests (Direct + Recursive Sub-Maps)
        appendCategoryRow(tbody, `Active Quests (${rec.totals.quests} total)`);
        if (rec.direct.quests.length === 0 && rec.totals.quests === 0) {
          appendPropRow(tbody, '(None)', 'No quests anchored here', false);
        } else {
          rec.direct.quests.forEach((q, idx) => {
            appendActionPropRow(tbody, `Direct Quest #${idx+1}`, `${q.title || q.name} [${q.status || 'Active'}]`, () => {
              openEntityManager('quest', q.id);
            });
          });
          rec.submaps.forEach(sm => {
            sm.quests.forEach((q, idx) => {
              appendActionPropRow(tbody, `Sub-Map Quest`, `🌀 ${sm.mapName} [#${q.nodeId}]: ${q.title || q.name}`, () => {
                if (typeof switchActiveMap === 'function') switchActiveMap(sm.mapId);
                setTimeout(() => openEntityManager('quest', q.id), 60);
              });
            });
          });
        }
        appendActionPropRow(tbody, '[+ Add Quest]', `+ Add Quest to Node ${node.id}...`, () => {
          openNewEntityModal('quest', node.id);
        });

        // Category: Local Items & Relics (Direct + Recursive Sub-Maps)
        appendCategoryRow(tbody, `Local Items & Relics (${rec.totals.items} total)`);
        if (rec.direct.items.length === 0 && rec.totals.items === 0) {
          appendPropRow(tbody, '(None)', 'No items stationed here', false);
        } else {
          rec.direct.items.forEach((itm, idx) => {
            const isCarried = (itm.possessionMode === 'carried' && itm.ownerNpcId);
            const carrierNpc = isCarried ? (topo.npcs || []).find(n => String(n.id) === String(itm.ownerNpcId)) : null;
            const carrierTag = carrierNpc ? ` [🎒 Carried by ${carrierNpc.name}]` : (itm.ownerNpcId ? ` [📦 Stored (Owned)]` : '');
            appendActionPropRow(tbody, `Direct Item #${idx+1}`, `${itm.name}${carrierTag} [${itm.category || 'Gear'}]`, () => {
              openEntityManager('item', itm.id);
            });
          });
          rec.submaps.forEach(sm => {
            sm.items.forEach((itm, idx) => {
              appendActionPropRow(tbody, `Sub-Map Item`, `🌀 ${sm.mapName} [#${itm.nodeId}]: ${itm.name}`, () => {
                if (typeof switchActiveMap === 'function') switchActiveMap(sm.mapId);
                setTimeout(() => openEntityManager('item', itm.id), 60);
              });
            });
          });
        }
        appendActionPropRow(tbody, '[+ Add Item]', `+ Add Item to Node ${node.id}...`, () => {
          openNewEntityModal('item', node.id);
        });

        // Category: Threat Clocks & Trackers (Direct + Recursive Sub-Maps)
        appendCategoryRow(tbody, `Threat Clocks & Trackers (${rec.totals.trackers} total)`);
        if (rec.direct.trackers.length === 0 && rec.totals.trackers === 0) {
          appendPropRow(tbody, '(None)', 'No threat clocks stationed here', false);
        } else {
          rec.direct.trackers.forEach((trk, idx) => {
            appendActionPropRow(tbody, `Direct Clock #${idx+1}`, `${trk.name} [${trk.currentTicks || 0}/${trk.maxTicks || 6} Ticks]`, () => {
              openEntityManager('tracker', trk.id);
            });
          });
          rec.submaps.forEach(sm => {
            sm.trackers.forEach((trk, idx) => {
              appendActionPropRow(tbody, `Sub-Map Clock`, `🌀 ${sm.mapName} [#${trk.nodeId}]: ${trk.name}`, () => {
                if (typeof switchActiveMap === 'function') switchActiveMap(sm.mapId);
                setTimeout(() => openEntityManager('tracker', trk.id), 60);
              });
            });
          });
        }
        appendActionPropRow(tbody, '[+ Add Clock]', `+ Add Threat Clock to Node ${node.id}...`, () => {
          openNewEntityModal('tracker', node.id);
        });

        // Category: Mod Extensions (Dynamic Hooks)
        appendCategoryRow(tbody, 'Mod Extensions');
        let hasMods = false;
        Object.keys(Workstation.registeredMods || {}).forEach(modId => {
          const mod = Workstation.registeredMods[modId];
          if (typeof mod.renderNodeProperties === 'function') {
            hasMods = true;
            try {
              mod.renderNodeProperties(tbody, {
                node,
                nodeId: node.id,
                topo,
                save: saveActiveCampaign,
                refresh: updatePropertiesGrid,
                appendPropRow,
                appendSelectPropRow,
                appendActionPropRow,
                appendCategoryRow
              });
            } catch (err) {
              console.error(`[Mod ${modId}] renderNodeProperties error:`, err);
            }
          } else if (mod.nodeProperties || mod.customProperties) {
            hasMods = true;
            const props = mod.nodeProperties || mod.customProperties;
            props.forEach(prop => {
              const val = (node.modData && node.modData[modId] && node.modData[modId][prop.key] !== undefined)
                ? node.modData[modId][prop.key]
                : ((node.modData && node.modData[prop.key] !== undefined) ? node.modData[prop.key] : (prop.default || ''));
              appendPropRow(tbody, `${mod.name}: ${prop.label}`, val, true, newVal => {
                if (!node.modData) node.modData = {};
                if (!node.modData[modId]) node.modData[modId] = {};
                node.modData[modId][prop.key] = newVal;
                saveActiveCampaign();
              });
            });
          }
        });
        if (!hasMods) {
          appendPropRow(tbody, '(Status)', 'No active module extensions', false);
        }

      } else if (entity.type === 'edge') {
        // Corridor / Edge Properties: Complex First-Class Authoring Entity
        const isRoad = entity.edgeType === 'road';
        const uId = entity.uId;
        const vId = entity.vId;
        const pairKey = [String(uId), String(vId)].sort().join('-');
        const edgeKey = isRoad ? pairKey : `${uId}->${vId}`;

        // Ensure edge data dictionaries exist on activeTopology
        if (!topo.edgeData) topo.edgeData = {};
        if (!topo.edgeData[edgeKey]) {
          topo.edgeData[edgeKey] = {
            name: '',
            condition: 'Passable',
            hazardLevel: 0,
            tollCost: '',
            patrolFaction: 'neutral',
            modules: []
          };
        }
        const edgeRecord = topo.edgeData[edgeKey];

        appendCategoryRow(tbody, 'Corridor Identity & Classification');
        appendPropRow(tbody, 'Corridor Type', isRoad ? 'TRANSIT ROAD (Bidirectional)' : 'HEGEMONY VECTOR (Directional)', false);
        appendPropRow(tbody, 'Edge Key', edgeKey, false);
        appendPropRow(tbody, 'Endpoints', `Node ${uId} ${isRoad ? '<->' : '->'} Node ${vId}`, false);
        appendPropRow(tbody, 'Custom Name', edgeRecord.name || '', true, val => {
          edgeRecord.name = val;
          renderCanvas();
          updateObjectSelector();
          saveActiveCampaign();
        });

        const defaultEdgeLayer = isRoad ? 'layer-roads' : 'layer-hegemony';
        const edgeLayers = (typeof getTopologyLayers === 'function') ? getTopologyLayers(topo) : (topo.layers || []);
        appendSelectPropRow(tbody, 'Canvas Layer', edgeRecord.layerId || defaultEdgeLayer, edgeLayers.map(l => ({ val: l.id, label: `${l.name}${l.isCore ? ' (Core)' : ''}` })), val => {
          edgeRecord.layerId = val;
          renderCanvas();
          updatePropertiesGrid();
          if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
          saveActiveCampaign();
          setStatusBarMessage(`Edge ${edgeKey} assigned to layer "${val}".`);
        });

        appendSelectPropRow(tbody, 'Classification', entity.edgeType || 'road', [
          { val: 'road', label: 'Transit Road (Bidirectional E_adj)' },
          { val: 'hegemony', label: 'Hegemony Vector (Directional E_inf)' }
        ], val => {
          if (val !== entity.edgeType) {
            if (entity.edgeType === 'road') {
              const u = topo.nodes[String(uId)];
              const v = topo.nodes[String(vId)];
              if (u && u.adj) u.adj = u.adj.filter(id => String(id) !== String(vId));
              if (v && v.adj) v.adj = v.adj.filter(id => String(id) !== String(uId));
              createEdge(uId, vId, 'hegemony');
            } else {
              const v = topo.nodes[String(vId)];
              if (v && v.infBy) v.infBy = v.infBy.filter(id => String(id) !== String(uId));
              createEdge(uId, vId, 'road');
            }
            selectEdge(val, uId, vId);
          }
        });

        // Cartographic metrics
        const uNode = topo.nodes[String(uId)];
        const vNode = topo.nodes[String(vId)];
        if (uNode && vNode) {
          const dist = Math.round(Math.hypot(vNode.x - uNode.x, vNode.y - uNode.y));
          const formattedDist = (typeof formatDistance === 'function') ? ` (${formatDistance(dist)})` : '';
          appendPropRow(tbody, 'Cartographic Length', `${dist} px${formattedDist}`, false);
        }

        // Operational Status & Travel Hazards
        appendCategoryRow(tbody, 'Corridor State & Navigation');
        appendSelectPropRow(tbody, 'Condition', edgeRecord.condition || 'Passable', [
          { val: 'Passable', label: 'Passable (Open & Clear)' },
          { val: 'Paved Highway', label: 'Paved Highway (Expedited Transit)' },
          { val: 'Rough Terrain', label: 'Rough Terrain (Half Speed)' },
          { val: 'Hazardous', label: 'Hazardous (Damage / Survival Check)' },
          { val: 'Blockaded / Besieged', label: 'Blockaded / Besieged (Passage Denied)' },
          { val: 'Subterranean Chasm', label: 'Subterranean Chasm (Special Gear Required)' }
        ], val => {
          edgeRecord.condition = val;
          renderCanvas();
          saveActiveCampaign();
        });

        appendSelectPropRow(tbody, 'Hazard Rating', edgeRecord.hazardLevel || 0, [
          { val: 0, label: 'Level 0 (No Hazard)' },
          { val: 1, label: 'Level 1 (Low Threat - 1 Tick Dial)' },
          { val: 2, label: 'Level 2 (Moderate Peril - 2 Tick Dial)' },
          { val: 3, label: 'Level 3 (High Danger - 3 Tick Dial)' },
          { val: 4, label: 'Level 4 (Catastrophic Chokepoint)' }
        ], val => {
          edgeRecord.hazardLevel = parseInt(val) || 0;
          saveActiveCampaign();
        });

        appendPropRow(tbody, 'Toll / Permit', edgeRecord.tollCost || 'None', true, val => {
          edgeRecord.tollCost = val;
          saveActiveCampaign();
        });

        appendComboboxPropRow(
          tbody,
          'Patrol Faction',
          edgeRecord.patrolFaction || 'neutral',
          `dl-patrol-faction-${edgeKey}`,
          () => {
            const pool = (typeof getCampaignFactionSuggestions === 'function') ? getCampaignFactionSuggestions() : [];
            const suggestions = [
              { val: 'neutral', label: 'Neutral / Unguarded' },
              { val: 'Contested', label: 'Contested / Warring Factions' }
            ];
            pool.forEach(f => {
              if (f && f.toLowerCase() !== 'neutral' && f.toLowerCase() !== 'contested') {
                if (!suggestions.some(s => s.val.toLowerCase() === f.toLowerCase())) {
                  suggestions.push({ val: f, label: f });
                }
              }
            });
            return suggestions;
          },
          val => {
            let canonical = (val || '').trim();
            if (canonical === 'Neutral / Unguarded' || canonical.toLowerCase() === 'neutral') {
              canonical = 'neutral';
            } else if (canonical === 'Contested / Warring Factions' || canonical.toLowerCase() === 'contested') {
              canonical = 'Contested';
            } else if (canonical && typeof registerCampaignFaction === 'function') {
              registerCampaignFaction(canonical);
            }
            if (typeof pushHistoryState === 'function') pushHistoryState(`Change Patrol Faction: ${canonical}`);
            edgeRecord.patrolFaction = canonical;
            saveActiveCampaign();
            if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
          }
        );

        // Fog-of-War Corridor Visibility
        appendSelectPropRow(tbody, 'Visible to Players', edgeRecord.visible !== false ? 'true' : 'false', [
          { val: 'true', label: 'True 👁️ (Revealed Corridor)' },
          { val: 'false', label: 'False 👁️‍🗨️ (Secret / Hidden Road)' }
        ], val => {
          edgeRecord.visible = (val === 'true');
          renderCanvas();
          saveActiveCampaign();
          setStatusBarMessage(`Edge ${edgeKey} is now ${edgeRecord.visible ? 'visible to players' : 'marked hidden (secret road)'}.`);
        });

        // Dedicated Conduits & Resource Supply Flows (SYS-START-08)
        appendCategoryRow(tbody, 'Dedicated Conduits & Flows');
        appendSelectPropRow(tbody, 'Conduit Type', edgeRecord.conduitType || 'Standard Route', [
          { val: 'Standard Route', label: 'Standard Route (General Transit)' },
          { val: 'Aqueduct / Pipeline', label: 'Aqueduct / Pipeline (Water & Fluid)' },
          { val: 'Caravan Trade Route', label: 'Caravan Trade Route (Bulk Goods)' },
          { val: 'Smuggling Tunnel', label: 'Smuggling Tunnel (Covert Supply)' },
          { val: 'Arcane / Ley Conduit', label: 'Arcane / Ley Conduit (Energy Flow)' },
          { val: 'Military Supply Line', label: 'Military Supply Line (Ordnance & Rations)' }
        ], val => {
          edgeRecord.conduitType = val;
          renderCanvas();
          saveActiveCampaign();
        });
        if (!Array.isArray(edgeRecord.dedicatedFlows)) edgeRecord.dedicatedFlows = [];
        const normFlows = edgeRecord.dedicatedFlows.map(f => typeof f === 'string' ? f : (f && f.tag ? f.tag : '')).filter(Boolean);
        appendEllipsisPropRow(tbody, 'Dedicated Conduits', normFlows.length ? normFlows.join(', ') : '(None)', () => {
          openResourceTagModal(edgeRecord, 'dedicatedFlows', 'edge', `Edge ${edgeKey}`);
        });

        // Throughput Capacity & Bandwidth (SYS-START-13)
        const capOptions = ['Unbounded (Default)', '10 Units (Footpath)', '25 Units (Cart Road)', '50 Units (Paved Highway)', '100 Units (Railway / Canal)'];
        const currentCapStr = (typeof edgeRecord.capacity === 'number') ? `${edgeRecord.capacity} Units` : 'Unbounded (Default)';
        const matchedOpt = capOptions.find(o => o.startsWith(currentCapStr)) || 'Unbounded (Default)';
        appendSelectPropRow(tbody, 'Throughput Cap', matchedOpt, capOptions, val => {
          if (val.startsWith('Unbounded')) {
            edgeRecord.capacity = null;
          } else {
            const num = parseInt(val.split(' ')[0], 10);
            edgeRecord.capacity = isNaN(num) ? null : num;
          }
          saveActiveCampaign();
          if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
        });

        // Demographics & Geopolitics for Transit Corridors (ADR-0015 v2)
        if (entity.edgeType !== 'hegemony') {
          appendCategoryRow(tbody, 'Demographics & Geopolitics');

          appendChipInputPropRow(
            tbody,
            'Peoples (tags)',
            () => (edgeRecord.demographics && Array.isArray(edgeRecord.demographics.tags)) ? edgeRecord.demographics.tags : [],
            `dl-demo-edge-${edgeKey}`,
            () => (typeof getDemographicNames === 'function') ? getDemographicNames(edgeRecord.demographics) : [],
            (tag) => {
              if (typeof addDemographicTag === 'function') addDemographicTag(edgeRecord, tag);
            },
            (tag) => {
              if (typeof removeDemographicTag === 'function') removeDemographicTag(edgeRecord, tag);
            }
          );

          appendChipInputPropRow(
            tbody,
            'Factions Present',
            () => Array.isArray(edgeRecord.factionPresence) ? edgeRecord.factionPresence : [],
            `dl-fac-edge-${edgeKey}`,
            () => (typeof getCampaignFactionSuggestions === 'function') ? getCampaignFactionSuggestions() : [],
            (fac) => {
              if (typeof addFactionPresence === 'function') addFactionPresence(edgeRecord, fac);
            },
            (fac) => {
              if (typeof removeFactionPresence === 'function') removeFactionPresence(edgeRecord, fac);
            }
          );

          appendPartyRapportPropRow(tbody, 'Party Rapport', edgeRecord.partyRapport, (newRapport) => {
            if (typeof setPartyRapport === 'function') {
              setPartyRapport(edgeRecord, newRapport);
            } else {
              edgeRecord.partyRapport = newRapport;
              saveActiveCampaign();
            }
          });
        }

        // Slotted Modules on Edge
        appendCategoryRow(tbody, 'Slotted Modules & Frameworks');
        if (typeof edgeSlottedModules === "undefined") edgeSlottedModules = {};
        const slottedOnEdge = edgeSlottedModules[edgeKey] || edgeSlottedModules[pairKey] || edgeRecord.modules || [];
        if (slottedOnEdge.length === 0) {
          appendPropRow(tbody, '(None)', 'No modules slotted on this corridor', false);
        } else {
          slottedOnEdge.forEach((modId, idx) => {
            const modObj = (typeof ALL_MODULES !== "undefined") ? ALL_MODULES.find(m => m.id === modId) : null;
            const title = modObj ? `${modId}: ${modObj.title}` : modId;
            appendActionPropRow(tbody, `Module #${idx+1}`, title, () => {
              if (typeof openModuleExplorer === 'function') openModuleExplorer(modId);
            });
          });
        }
        appendActionPropRow(tbody, '[+ Slot / Browse]', '+ Slot Worldbuilding Module on Edge...', () => {
          const modInput = prompt(`Slot module into corridor "${edgeKey}" (enter module ID e.g. SPARK-01, INFRA-01):`);
          if (modInput) {
            const trimmed = modInput.trim().toUpperCase();
            if (typeof slotEdgeModule === 'function') {
              slotEdgeModule(edgeKey, trimmed);
            } else {
              if (!edgeSlottedModules[edgeKey]) edgeSlottedModules[edgeKey] = [];
              if (!edgeSlottedModules[edgeKey].includes(trimmed)) edgeSlottedModules[edgeKey].push(trimmed);
            }
            if (!edgeRecord.modules) edgeRecord.modules = [];
            if (!edgeRecord.modules.includes(trimmed)) edgeRecord.modules.push(trimmed);
            saveActiveCampaign();
            updatePropertiesGrid();
            setStatusBarMessage(`Slotted module ${trimmed} on corridor ${edgeKey}.`);
          }
        });

        // Active Campaign Narrative Anchors (Tickets, Trackers, Quests stationed along this route)
        appendCategoryRow(tbody, 'Route Encounters & Backlog');
        const hazardInfo = calculateCorridorHazard(edgeRecord, uNode, vNode);
        appendActionPropRow(tbody, '🎲 Travel Check', `Roll Hazard (${hazardInfo.levelName} - DC ${hazardInfo.dc})...`, () => {
          openCorridorHazardDialog(uId, vId, edgeRecord);
        });
        const assignedTickets = (topo.tickets || []).filter(tk => tk.nodeId == uId || tk.nodeId == vId);
        if (assignedTickets.length === 0) {
          appendPropRow(tbody, 'Tickets', 'No creative tickets anchored to connected nodes', false);
        } else {
          assignedTickets.forEach((tk, idx) => {
            appendActionPropRow(tbody, `Ticket #${idx+1}`, `${tk.id}: ${tk.title} [${tk.status || 'Backlog'}]`, () => {
              if (typeof openTicketCenter === 'function') openTicketCenter();
            });
          });
        }

        // Sociological & Physical Corridor Dynamics
        if (typeof generateCorridorSociogram === 'function' && uNode && vNode) {
          appendCategoryRow(tbody, 'Sociological & Transit Dynamics');
          const fakeLink = { from: uId, to: vId, type: isRoad ? 'twoway' : 'oneway', layer: isRoad ? 'transit' : 'hegemony' };
          const sociogram = generateCorridorSociogram(fakeLink, uNode, vNode);
          if (sociogram && sociogram.angles) {
            sociogram.angles.forEach(ang => {
              appendPropRow(tbody, ang.title || 'Dynamic', ang.text || ang.content || '', false);
            });
          }
        }

        // GM Corridor Notes & Wiki Citations
        appendCategoryRow(tbody, 'Corridor Notes & Lore');
        const edgeNotes = (topo.edgeNotes && (topo.edgeNotes[edgeKey] || topo.edgeNotes[pairKey])) || '';
        appendTextareaPropRow(tbody, 'Corridor Notes', edgeNotes, 3, val => {
          if (!topo.edgeNotes) topo.edgeNotes = {};
          topo.edgeNotes[edgeKey] = val;
          saveActiveCampaign();
          if (typeof buildWikiIndex === 'function') buildWikiIndex();
        });
        // Category: Mod Extensions (Dynamic Hooks for Corridors / Edges)
        appendCategoryRow(tbody, 'Mod Extensions');
        let hasEdgeMods = false;
        Object.keys(Workstation.registeredMods || {}).forEach(modId => {
          const mod = Workstation.registeredMods[modId];
          if (typeof mod.renderEdgeProperties === 'function') {
            hasEdgeMods = true;
            try {
              mod.renderEdgeProperties(tbody, {
                entity,
                isRoad,
                uId,
                vId,
                edgeKey,
                pairKey,
                edgeRecord,
                uNode,
                vNode,
                topo,
                save: saveActiveCampaign,
                refresh: updatePropertiesGrid,
                appendPropRow,
                appendSelectPropRow,
                appendActionPropRow,
                appendCategoryRow
              });
            } catch (err) {
              console.error(`[Mod ${modId}] renderEdgeProperties error:`, err);
            }
          } else if (mod.edgeProperties) {
            hasEdgeMods = true;
            mod.edgeProperties.forEach(prop => {
              if (!edgeRecord.modData) edgeRecord.modData = {};
              if (!edgeRecord.modData[modId]) edgeRecord.modData[modId] = {};
              const val = edgeRecord.modData[modId][prop.key] !== undefined ? edgeRecord.modData[modId][prop.key] : (prop.default || '');
              appendPropRow(tbody, `${mod.name}: ${prop.label}`, val, true, newVal => {
                if (!edgeRecord.modData) edgeRecord.modData = {};
                if (!edgeRecord.modData[modId]) edgeRecord.modData[modId] = {};
                edgeRecord.modData[modId][prop.key] = newVal;
                saveActiveCampaign();
              });
            });
          }
        });
        if (!hasEdgeMods) {
          appendPropRow(tbody, '(Status)', 'No active corridor extensions', false);
        }

        appendCategoryRow(tbody, 'Corridor Actions');
        appendActionPropRow(tbody, '[Sever Connection]', `Delete this ${entity.edgeType.toUpperCase()} Corridor`, () => {
          if (confirm(`Sever this ${entity.edgeType} connection between Node ${uId} and Node ${vId}?`)) {
            if (entity.edgeType === 'road') {
              const u = topo.nodes[String(uId)];
              const v = topo.nodes[String(vId)];
              if (u && u.adj) u.adj = u.adj.filter(id => String(id) !== String(vId));
              if (v && v.adj) v.adj = v.adj.filter(id => String(id) !== String(uId));
            } else {
              const v = topo.nodes[String(vId)];
              if (v && v.infBy) v.infBy = v.infBy.filter(id => String(id) !== String(uId));
            }
            selectGlobal();
            renderCanvas();
            saveActiveCampaign();
            setStatusBarMessage(`Severed corridor between ${uId} and ${vId}.`);
          }
        });

      } else if (entity.type === 'shape') {
        const shape = (topo.shapes || []).find(s => s.id === entity.id) || entity.shape;
        if (!shape) return;

        appendCategoryRow(tbody, 'Shape Identity & Layer');
        appendPropRow(tbody, 'Shape ID', shape.id, false);
        appendPropRow(tbody, 'Name', shape.name || '', true, val => {
          shape.name = val;
          renderCanvas();
          saveActiveCampaign();
          if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
        });
        appendPropRow(tbody, 'Primitive Type', (shape.type || 'rect').toUpperCase(), false);

        const shapeLayers = (typeof getTopologyLayers === 'function') ? getTopologyLayers(topo) : (topo.layers || []);
        appendSelectPropRow(tbody, 'Canvas Layer', shape.layerId || 'layer-drawings', shapeLayers.map(l => ({ val: l.id, label: `${l.name}${l.isCore ? ' (Core)' : ''}` })), val => {
          shape.layerId = val;
          renderCanvas();
          updatePropertiesGrid();
          if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
          saveActiveCampaign();
          setStatusBarMessage(`Shape "${shape.name || shape.id}" assigned to layer "${val}".`);
        });

        appendCategoryRow(tbody, 'Geometry & Dimensions');
        appendPropRow(tbody, 'X Position', shape.x || 0, !shape.locked, val => {
          shape.x = parseFloat(val) || 0;
          renderCanvas();
          saveActiveCampaign();
        });
        appendPropRow(tbody, 'Y Position', shape.y || 0, !shape.locked, val => {
          shape.y = parseFloat(val) || 0;
          renderCanvas();
          saveActiveCampaign();
        });

        if (shape.type === 'rect') {
          appendPropRow(tbody, 'Width', shape.width || 100, !shape.locked, val => {
            shape.width = Math.max(1, parseFloat(val) || 10);
            renderCanvas();
            saveActiveCampaign();
          });
          appendPropRow(tbody, 'Height', shape.height || 60, !shape.locked, val => {
            shape.height = Math.max(1, parseFloat(val) || 10);
            renderCanvas();
            saveActiveCampaign();
          });
        } else if (shape.type === 'circle') {
          appendPropRow(tbody, 'Radius', shape.radius || 40, !shape.locked, val => {
            shape.radius = Math.max(1, parseFloat(val) || 10);
            shape.rx = shape.radius;
            shape.ry = shape.radius;
            renderCanvas();
            saveActiveCampaign();
          });
        } else if (shape.type === 'line') {
          appendPropRow(tbody, 'X2 Endpoint', shape.x2 !== undefined ? shape.x2 : ((shape.x || 0) + 100), !shape.locked, val => {
            shape.x2 = parseFloat(val) || 0;
            renderCanvas();
            saveActiveCampaign();
          });
          appendPropRow(tbody, 'Y2 Endpoint', shape.y2 !== undefined ? shape.y2 : (shape.y || 0), !shape.locked, val => {
            shape.y2 = parseFloat(val) || 0;
            renderCanvas();
            saveActiveCampaign();
          });
        }

        appendCategoryRow(tbody, 'Appearance & Styling');
        appendColorPropRow(tbody, 'Fill Color', shape.fillColor || 'rgba(59, 130, 246, 0.2)', val => {
          shape.fillColor = val;
          renderCanvas();
          saveActiveCampaign();
        });
        appendColorPropRow(tbody, 'Stroke Color', shape.strokeColor || '#2563eb', val => {
          shape.strokeColor = val;
          renderCanvas();
          saveActiveCampaign();
        });
        appendPropRow(tbody, 'Stroke Width', shape.strokeWidth || 2, true, val => {
          shape.strokeWidth = Math.max(1, parseFloat(val) || 1);
          renderCanvas();
          saveActiveCampaign();
        });
        appendSelectPropRow(tbody, 'Stroke Style', shape.strokeDash || 'solid', [
          { val: 'solid', label: 'Solid Line' },
          { val: 'dashed', label: 'Dashed (6, 4)' },
          { val: 'dotted', label: 'Dotted (2, 3)' }
        ], val => {
          shape.strokeDash = val;
          renderCanvas();
          saveActiveCampaign();
        });

        if (shape.type === 'rect' || shape.type === 'circle') {
          appendCategoryRow(tbody, 'Interior Text & Typography');
          appendPropRow(tbody, 'Interior Text', shape.text || '', true, val => {
            shape.text = val;
            renderCanvas();
            saveActiveCampaign();
          });
          appendColorPropRow(tbody, 'Text Color', shape.textColor || '#0f172a', val => {
            shape.textColor = val;
            renderCanvas();
            saveActiveCampaign();
          });
          appendPropRow(tbody, 'Base Font Size', shape.fontSize || 13, !shape.locked, val => {
            shape.fontSize = Math.max(8, parseInt(val) || 13);
            renderCanvas();
            saveActiveCampaign();
          });
          appendSelectPropRow(tbody, 'Font Weight', shape.fontWeight || 'bold', [
            { val: 'bold', label: 'Bold' },
            { val: 'normal', label: 'Normal' }
          ], val => {
            shape.fontWeight = val;
            renderCanvas();
            saveActiveCampaign();
          });
        }
        appendPropRow(tbody, 'Opacity (0-100%)', Math.round((shape.opacity ?? 1.0) * 100), true, val => {
          shape.opacity = Math.max(0, Math.min(1, (parseFloat(val) || 100) / 100));
          renderCanvas();
          saveActiveCampaign();
        });

        appendSelectPropRow(tbody, 'Locked', shape.locked ? 'true' : 'false', [
          { val: 'false', label: 'False (Movable)' },
          { val: 'true', label: 'True 🔒 (Locked)' }
        ], val => {
          shape.locked = (val === 'true');
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
        });

        appendCategoryRow(tbody, 'Shape Actions');
        appendActionPropRow(tbody, '[Delete Shape]', 'Delete this drawing entity', () => {
          deleteShape(shape.id);
        });

      } else {
        // Global Campaign & Active Map Overview
        appendCategoryRow(tbody, 'Campaign Attributes');
        appendPropRow(tbody, 'Title', topo.name || 'Untitled Campaign', true, val => {
          topo.name = val;
          updateObjectSelector();
          saveActiveCampaign();
        });
        appendPropRow(tbody, 'Campaign ID', topo.id || 'custom', false);

        // Active Map Scale Tier & Full Cartographic Properties
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        const curMap = (typeof maps !== "undefined" && maps) ? maps[curMapId] : null;
        if (curMap) {
          appendCategoryRow(tbody, 'Active Map Cartography');
          appendPropRow(tbody, 'Active Map Name', curMap.name || (topo.name || 'Root Map'), true, val => {
            curMap.name = val;
            if (curMapId === "map_root" && topo) topo.name = val;
            if (typeof updateBreadcrumbsHUD === 'function') updateBreadcrumbsHUD();
            if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
            saveActiveCampaign();
          });
          appendPropRow(tbody, 'Internal Map ID', curMap.id || curMapId, false);
          appendPropRow(tbody, 'Node Prefix', curMap.nodePrefix !== undefined ? curMap.nodePrefix : '', true, val => {
            curMap.nodePrefix = val.trim();
            saveActiveCampaign();
            if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
          });
          appendSelectPropRow(tbody, 'Scale Tier', curMap.scaleTier || 'region', [
            { val: 'cosmic', label: 'Cosmic (Planar)' },
            { val: 'continent', label: 'Continent (Realm)' },
            { val: 'region', label: 'Region (Wilderness)' },
            { val: 'settlement', label: 'Settlement (City)' },
            { val: 'district', label: 'District (City Ward)' },
            { val: 'site', label: 'Site (Stronghold / Complex)' },
            { val: 'building', label: 'Building (Dungeon)' },
            { val: 'chamber', label: 'Chamber (Room Level)' },
            { val: 'floorplan', label: 'Floorplan (Interior)' }
          ], val => {
            curMap.scaleTier = val;
            if (typeof updateBreadcrumbsHUD === 'function') updateBreadcrumbsHUD();
            if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
            saveActiveCampaign();
          });
          const curScale = (typeof getMapScale === 'function') ? getMapScale(curMapId) : { value: 5, unit: 'miles', pixels: 20 };
          appendPropRow(tbody, 'Cartographic Scale', `1 sq = ${curScale.value} ${curScale.unit} (${curScale.pixels}px)`, false);
          appendSelectPropRow(tbody, 'Disposition Bias', curMap.dispositionModifier || '', [
            { val: '', label: 'None / Inherited (Neutral)' },
            { val: 'Hierarchy', label: 'Hierarchy (+S, +C)' },
            { val: 'Clan', label: 'Clan (-S, +C)' },
            { val: 'Market', label: 'Market (+S, -C)' },
            { val: 'Adhocracy', label: 'Adhocracy (-S, -C)' },
            { val: 'Fortified', label: 'Fortified Bastion (+2 Stability)' },
            { val: 'Hazardous', label: 'Hazardous / Volatile (-2 Stability)' },
            { val: 'Sanctuary', label: 'Sacred Sanctuary (+2 Cohesion)' },
            { val: 'Subterranean', label: 'Subterranean Depth' }
          ], val => {
            curMap.dispositionModifier = val;
            saveActiveCampaign();
            if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
          });
          if (curMap.parentMapId && typeof maps !== 'undefined' && maps[curMap.parentMapId]) {
            appendPropRow(tbody, 'Parent Map', maps[curMap.parentMapId].name || curMap.parentMapId, false);
            if (curMap.parentNodeId) {
              appendPropRow(tbody, 'Parent POI Anchor', `Node #${curMap.parentNodeId}`, false);
            }
          }
          const bgStatus = (curMap.mapMetadata && (curMap.mapMetadata.name || curMap.mapMetadata.dataUrl))
            ? `${curMap.mapMetadata.name || 'Image'} (${Math.round((curMap.mapMetadata.opacity !== undefined ? curMap.mapMetadata.opacity : 0.85) * 100)}%)`
            : 'Tactical CAD Grid';
          appendPropRow(tbody, 'Background Asset', bgStatus, false);
          appendTextareaPropRow(tbody, 'Map Lore & Environment', curMap.customNotes || '', 3, val => {
            curMap.customNotes = val;
            saveActiveCampaign();
          });
          appendButtonPropRow(tbody, 'Map Properties', '⚙️ Edit Full Map Properties...', () => openMapPropertiesDialog(curMapId));
        }

        appendCategoryRow(tbody, 'Topological Balance Summary');
        appendPropRow(tbody, 'Total Nodes', Object.keys(topo.nodes || {}).length, false);
        
        let roadCount = 0;
        let infCount = 0;
        Object.keys(topo.nodes || {}).forEach(k => {
          const n = topo.nodes[k];
          roadCount += (n.adj || []).length;
          infCount += (n.infBy || []).length;
        });
        appendPropRow(tbody, 'Transit Roads', Math.round(roadCount / 2), false);
        appendPropRow(tbody, 'Hegemony Vectors', infCount, false);
        appendPropRow(tbody, 'Equilibrium Status', (typeof globalInversion !== "undefined" && globalInversion) ? 'Panopticon Lockdown' : 'Harmonic Equilibrium', false);

        // Global GM Campaign Notes & Wiki Citations
        appendCategoryRow(tbody, 'Global Notes & Citations');
        appendTextareaPropRow(tbody, 'Campaign Lore Notes', topo.customNotes || '', 3, val => {
          topo.customNotes = val;
          saveActiveCampaign();
          if (typeof buildWikiIndex === 'function') buildWikiIndex();
        });
        appendBacklinksPropRow(tbody, 'map', curMapId);
      }
    }

    function appendCategoryRow(tbody, name) {
      const tr = document.createElement('tr');
      tr.className = 'category-row';
      const td = document.createElement('td');
      td.colSpan = 2;
      td.textContent = name;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }

    function appendPropRow(tbody, propName, value, isEditable, onCommit) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      if (isEditable) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'vb-cell-input';
        input.value = value !== undefined ? value : '';
        if (value === '*VARIES*') {
          input.style.fontStyle = 'italic';
          input.style.color = '#777';
          input.addEventListener('focus', () => {
            if (input.value === '*VARIES*') {
              input.value = '';
              input.style.fontStyle = 'normal';
              input.style.color = '#000';
            }
          });
          input.addEventListener('blur', () => {
            if (input.value === '') {
              input.value = '*VARIES*';
              input.style.fontStyle = 'italic';
              input.style.color = '#777';
            }
          });
        }
        input.addEventListener('change', () => {
          if (input.value !== '*VARIES*' && onCommit) {
            onCommit(input.value);
          }
        });
        tdVal.appendChild(input);
      } else {
        tdVal.textContent = value !== undefined ? value : '';
        tdVal.style.padding = '2px 4px';
        tdVal.style.color = value === '*VARIES*' ? '#777' : '#555';
        if (value === '*VARIES*') tdVal.style.fontStyle = 'italic';
      }
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendSelectPropRow(tbody, propName, curVal, options, onCommit) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      const select = document.createElement('select');
      select.className = 'vb-cell-input';
      if (curVal === '*VARIES*') {
        select.style.fontStyle = 'italic';
        select.style.color = '#777';
      }
      options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.val;
        o.textContent = opt.label;
        if (opt.val == curVal) o.selected = true;
        if (opt.val === '*VARIES*') {
          o.style.fontStyle = 'italic';
          o.style.color = '#777';
        }
        select.appendChild(o);
      });
      select.addEventListener('change', () => {
        if (select.value !== '*VARIES*') {
          select.style.fontStyle = 'normal';
          select.style.color = '#000';
          if (onCommit) onCommit(select.value);
        }
      });
      tdVal.appendChild(select);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendComboboxPropRow(tbody, propName, value, datalistId, getSuggestions, onCommit) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';

      let displayVal = value !== undefined ? value : '';
      if (typeof displayVal === 'string') {
        if (displayVal.toLowerCase() === 'neutral') {
          displayVal = 'Neutral / Unguarded';
        } else if (displayVal.toLowerCase() === 'contested') {
          displayVal = 'Contested / Warring Factions';
        }
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'vb-combobox-wrapper';
      wrapper.style.cssText = 'position: relative; display: flex; width: 100%; box-sizing: border-box; align-items: stretch;';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'flex';
      wrapper.style.width = '100%';
      wrapper.style.boxSizing = 'border-box';
      wrapper.style.alignItems = 'stretch';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'vb-cell-input';
      input.style.cssText = 'flex: 1; min-width: 0;';
      input.style.flex = '1';
      input.style.minWidth = '0';
      input.value = displayVal;

      if (value === '*VARIES*') {
        input.style.fontStyle = 'italic';
        input.style.color = '#777';
        input.addEventListener('focus', () => {
          if (input.value === '*VARIES*') {
            input.value = '';
            input.style.fontStyle = 'normal';
            input.style.color = '#000';
          }
        });
        input.addEventListener('blur', () => {
          if (input.value === '') {
            input.value = '*VARIES*';
            input.style.fontStyle = 'italic';
            input.style.color = '#777';
          }
        });
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vb-combobox-btn';
      btn.textContent = '▼';
      btn.style.cssText = 'flex: 0 0 17px; width: 17px; margin: 0; padding: 0; background: #d4d0c8; border: 1px solid; border-color: #ffffff #808080 #808080 #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 8px; font-family: monospace; user-select: none;';
      btn.style.flex = '0 0 17px';
      btn.style.width = '17px';
      btn.style.margin = '0';
      btn.style.padding = '0';
      btn.style.background = '#d4d0c8';
      btn.style.border = '1px solid';
      btn.style.borderColor = '#ffffff #808080 #808080 #ffffff';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.fontSize = '8px';
      btn.style.fontFamily = 'monospace';
      btn.style.userSelect = 'none';

      const menu = document.createElement('div');
      menu.className = 'vb-combobox-menu';
      menu.style.cssText = "position: absolute; top: 100%; left: 0; right: 0; max-height: 160px; overflow-y: auto; background: #ffffff; border: 1px solid #7f9db9; box-shadow: 2px 2px 4px rgba(0,0,0,0.25); z-index: 10000; display: none; font-family: Tahoma, 'Segoe UI', sans-serif; font-size: 11px;";
      menu.style.position = 'absolute';
      menu.style.top = '100%';
      menu.style.left = '0';
      menu.style.right = '0';
      menu.style.maxHeight = '160px';
      menu.style.overflowY = 'auto';
      menu.style.background = '#ffffff';
      menu.style.border = '1px solid #7f9db9';
      menu.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.25)';
      menu.style.zIndex = '10000';
      menu.style.display = 'none';
      menu.style.fontFamily = "Tahoma, 'Segoe UI', sans-serif";
      menu.style.fontSize = '11px';

      let isOpen = false;
      function commitValue(committedVal) {
        if (committedVal !== '*VARIES*' && onCommit) {
          onCommit(committedVal);
        }
      }

      function openMenu() {
        const suggestions = (typeof getSuggestions === 'function') ? getSuggestions() : (getSuggestions || []);
        menu.innerHTML = '';
        suggestions.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'vb-combobox-item';
          const label = (typeof item === 'object' && item !== null) ? (item.label || item.val) : String(item);
          const val = (typeof item === 'object' && item !== null) ? (item.val || item.label) : String(item);
          itemDiv.textContent = label;
          itemDiv.style.padding = '2px 6px';
          itemDiv.style.cursor = 'pointer';
          itemDiv.style.whiteSpace = 'nowrap';
          itemDiv.style.overflow = 'hidden';
          itemDiv.style.textOverflow = 'ellipsis';
          itemDiv.addEventListener('mouseenter', () => {
            itemDiv.style.background = '#0a246a';
            itemDiv.style.color = '#ffffff';
          });
          itemDiv.addEventListener('mouseleave', () => {
            itemDiv.style.background = '';
            itemDiv.style.color = '#000000';
          });
          const handleSelect = (e) => {
            if (e) {
              if (e.preventDefault) e.preventDefault();
              if (e.stopPropagation) e.stopPropagation();
            }
            input.value = label;
            closeMenu();
            commitValue(val || label);
          };
          itemDiv.addEventListener('mousedown', handleSelect);
          itemDiv.addEventListener('click', handleSelect);
          menu.appendChild(itemDiv);
        });
        menu.style.display = 'block';
        isOpen = true;
      }

      function closeMenu() {
        menu.style.display = 'none';
        isOpen = false;
      }

      function toggleMenu() {
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }

      btn.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        toggleMenu();
      });

      input.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!isOpen) openMenu();
      });

      const onDocClick = (e) => {
        if (typeof document !== 'undefined' && document.body && document.body.contains && !document.body.contains(wrapper)) {
          if (document.removeEventListener) document.removeEventListener('click', onDocClick);
          return;
        }
        if (wrapper && wrapper.contains) {
          if (!wrapper.contains(e.target)) {
            closeMenu();
          }
        } else {
          closeMenu();
        }
      };
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('click', onDocClick);
      }

      input.addEventListener('change', () => {
        commitValue(input.value);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          closeMenu();
          commitValue(input.value);
        } else if (e.key === 'Escape') {
          closeMenu();
        }
      });

      if (datalistId) {
        input.setAttribute('list', datalistId);
        let dl = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById(datalistId) : null;
        if (!dl && typeof document !== 'undefined' && document.createElement) {
          dl = document.createElement('datalist');
          dl.id = datalistId;
          if (document.body && document.body.appendChild) {
            document.body.appendChild(dl);
          }
        }
        if (dl) {
          const suggestions = (typeof getSuggestions === 'function') ? getSuggestions() : (getSuggestions || []);
          dl.innerHTML = '';
          suggestions.forEach(item => {
            const opt = document.createElement('option');
            if (typeof item === 'object' && item !== null) {
              opt.value = item.val || item.label;
              if (item.label && item.label !== item.val) opt.textContent = item.label;
            } else {
              opt.value = String(item);
            }
            dl.appendChild(opt);
          });
        }
      }

      wrapper.appendChild(input);
      wrapper.appendChild(btn);
      wrapper.appendChild(menu);
      tdVal.appendChild(wrapper);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function normalizeHexColor(val, fallback = '#2563eb') {
      if (!val || typeof val !== 'string' || val === '*VARIES*') return fallback;
      const trimmed = val.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
      if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
        return '#' + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3];
      }
      const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (rgbMatch) {
        const r = Math.max(0, Math.min(255, parseInt(rgbMatch[1], 10))).toString(16).padStart(2, '0');
        const g = Math.max(0, Math.min(255, parseInt(rgbMatch[2], 10))).toString(16).padStart(2, '0');
        const b = Math.max(0, Math.min(255, parseInt(rgbMatch[3], 10))).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
      return fallback;
    }

    function appendColorPropRow(tbody, propName, curVal, onCommit) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      tdVal.style.display = 'flex';
      tdVal.style.alignItems = 'center';
      tdVal.style.gap = '4px';
      tdVal.style.padding = '1px 2px';

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = normalizeHexColor(curVal);
      colorInput.style.width = '18px';
      colorInput.style.height = '16px';
      colorInput.style.padding = '0';
      colorInput.style.border = '1px solid #808080';
      colorInput.style.cursor = 'pointer';
      colorInput.style.background = 'transparent';
      colorInput.style.flexShrink = '0';

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.className = 'vb-cell-input';
      textInput.style.flex = '1';
      textInput.value = curVal !== undefined ? curVal : '';
      if (curVal === '*VARIES*') {
        textInput.style.fontStyle = 'italic';
        textInput.style.color = '#777';
      }

      colorInput.addEventListener('input', () => {
        textInput.value = colorInput.value;
        textInput.style.fontStyle = 'normal';
        textInput.style.color = '#000';
      });
      colorInput.addEventListener('change', () => {
        textInput.value = colorInput.value;
        if (onCommit) onCommit(colorInput.value);
      });
      textInput.addEventListener('change', () => {
        if (textInput.value && textInput.value !== '*VARIES*') {
          colorInput.value = normalizeHexColor(textInput.value, colorInput.value);
          if (onCommit) onCommit(textInput.value);
        }
      });

      tdVal.appendChild(textInput);
      tdVal.appendChild(colorInput);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendEllipsisPropRow(tbody, propName, summaryText, onOpenModal) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';

      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.justifyContent = 'space-between';
      wrap.style.width = '100%';
      wrap.style.paddingLeft = '4px';

      const span = document.createElement('span');
      span.textContent = summaryText || '(None)';
      span.style.overflow = 'hidden';
      span.style.textOverflow = 'ellipsis';
      span.style.whiteSpace = 'nowrap';
      span.style.fontSize = '11px';
      span.style.color = summaryText && summaryText !== '(None)' ? '#000' : '#666';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'win-btn';
      btn.textContent = '...';
      btn.title = `Edit ${propName}`;
      btn.style.width = '20px';
      btn.style.height = '17px';
      btn.style.padding = '0';
      btn.style.fontSize = '10px';
      btn.style.lineHeight = '14px';
      btn.style.fontWeight = 'bold';
      btn.style.flexShrink = '0';
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onOpenModal) onOpenModal();
      };

      wrap.appendChild(span);
      wrap.appendChild(btn);
      tdVal.appendChild(wrap);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function openNodeCollectionModal(node, mode) {
      if (!node || !activeTopology || !activeTopology.nodes) return;
      const isAdj = mode === 'adj';
      const modalId = 'vb-node-collection-modal';
      let overlay = document.getElementById(modalId);
      if (overlay) overlay.remove();

      overlay = document.createElement('div');
      overlay.id = modalId;
      overlay.className = 'modal-overlay';
      overlay.style.display = 'flex';
      overlay.style.zIndex = '10050';

      const currentList = Array.isArray(node[mode]) ? node[mode].map(n => Number(n)) : [];
      const selectedSet = new Set(currentList);

      const allNodes = Object.values(activeTopology.nodes)
        .filter(n => n && String(n.id) !== String(node.id))
        .sort((a, b) => Number(a.id) - Number(b.id));

      const win = document.createElement('div');
      win.className = 'win-outset';
      win.style.width = '380px';
      win.style.maxWidth = '92vw';
      win.style.background = 'var(--win-bg, #c0c0c0)';
      win.style.padding = '2px';
      win.style.display = 'flex';
      win.style.flexDirection = 'column';
      win.style.boxShadow = '4px 4px 12px rgba(0,0,0,0.45)';

      const titleText = isAdj
        ? `Edit Adjacencies (Transit Roads) — Node #${node.id}`
        : `Edit Hegemony Sources (infBy) — Node #${node.id}`;

      const subtitleText = isAdj
        ? `Check connected neighbor nodes for "${node.name || 'Node #' + node.id}". Bidirectional roads will sync automatically:`
        : `Check upstream nodes that project hegemony into "${node.name || 'Node #' + node.id}":`;

      win.innerHTML = `
        <div class="dock-titlebar" style="background:#000080; color:#fff; display:flex; align-items:center; justify-content:space-between; padding:3px 6px; font-weight:bold; font-size:11px;">
          <span>${escapeHtml(titleText)}</span>
          <button type="button" class="win-btn" id="vb-coll-close-btn" style="width:16px; height:16px; padding:0; line-height:12px; font-size:10px; font-weight:bold;">✕</button>
        </div>
        <div style="padding:8px; display:flex; flex-direction:column; gap:6px; font-size:11px;">
          <div style="color:#222; line-height:1.35;">${escapeHtml(subtitleText)}</div>
          <div id="vb-coll-list" class="win-inset" style="background:#fff; height:220px; overflow-y:auto; padding:4px; display:flex; flex-direction:column; gap:2px;"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <div style="display:flex; gap:4px;">
              <button type="button" class="win-btn" id="vb-coll-all-btn" style="padding:2px 8px; font-size:10px;">Select All</button>
              <button type="button" class="win-btn" id="vb-coll-none-btn" style="padding:2px 8px; font-size:10px;">Clear</button>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="win-btn" id="vb-coll-apply-btn" style="padding:3px 12px; font-weight:bold; font-size:11px;">OK</button>
              <button type="button" class="win-btn" id="vb-coll-cancel-btn" style="padding:3px 10px; font-size:11px;">Cancel</button>
            </div>
          </div>
        </div>
      `;

      overlay.appendChild(win);
      document.body.appendChild(overlay);

      const listEl = win.querySelector('#vb-coll-list');
      const checkboxes = [];

      if (allNodes.length === 0) {
        listEl.innerHTML = `<div style="color:#777; font-style:italic; padding:6px;">No other nodes exist on this map.</div>`;
      } else {
        allNodes.forEach(targetNode => {
          const nid = Number(targetNode.id);
          const lbl = document.createElement('label');
          lbl.style.display = 'flex';
          lbl.style.alignItems = 'center';
          lbl.style.gap = '6px';
          lbl.style.padding = '2px 4px';
          lbl.style.cursor = 'pointer';
          lbl.style.fontSize = '11px';

          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = String(nid);
          cb.checked = selectedSet.has(nid);
          checkboxes.push(cb);

          const text = document.createElement('span');
          text.textContent = `#${nid}: ${targetNode.name || 'Node ' + nid} (Tier ${targetNode.tier || 1} ${targetNode.culture || 'Clan'})`;

          lbl.appendChild(cb);
          lbl.appendChild(text);
          listEl.appendChild(lbl);
        });
      }

      const closeModal = () => overlay.remove();
      win.querySelector('#vb-coll-close-btn').onclick = closeModal;
      win.querySelector('#vb-coll-cancel-btn').onclick = closeModal;
      win.querySelector('#vb-coll-all-btn').onclick = () => checkboxes.forEach(c => { c.checked = true; });
      win.querySelector('#vb-coll-none-btn').onclick = () => checkboxes.forEach(c => { c.checked = false; });

      win.querySelector('#vb-coll-apply-btn').onclick = () => {
        const newIds = checkboxes.filter(c => c.checked).map(c => Number(c.value)).filter(n => !isNaN(n));
        if (isAdj) {
          const newSet = new Set(newIds);
          const selfId = Number(node.id);
          node.adj = newIds;
          // Synchronize bidirectional road links on all other nodes
          allNodes.forEach(other => {
            if (!Array.isArray(other.adj)) other.adj = [];
            const otherId = Number(other.id);
            const hasSelf = other.adj.some(x => Number(x) === selfId);
            if (newSet.has(otherId) && !hasSelf) {
              other.adj.push(selfId);
            } else if (!newSet.has(otherId) && hasSelf) {
              other.adj = other.adj.filter(x => Number(x) !== selfId);
            }
          });
        } else {
          node.infBy = newIds;
        }
        closeModal();
        renderCanvas();
        updatePropertiesGrid();
        saveActiveCampaign();
        if (typeof setStatusBarMessage === 'function') {
          setStatusBarMessage(`Updated ${isAdj ? 'Adjacencies (adj)' : 'Influenced By (infBy)'} on Node #${node.id}.`);
        }
      };
    }

    function openResourceTagModal(targetObj, propKey, targetType, targetLabel) {
      if (!targetObj) return;
      const existingModal = document.getElementById('vb-resource-tag-modal-overlay');
      if (existingModal) existingModal.remove();

      const rawExisting = Array.isArray(targetObj[propKey]) ? targetObj[propKey] : [];
      const currentSet = new Set(rawExisting.map(x => typeof x === 'string' ? x : (x && x.tag ? x.tag : '')).filter(Boolean));

      // Gather canonical & custom resource tags across catalog and active topology
      const tagPool = new Set([
        "Water: Artesian-Flow",
        "Water: Baseline-Potable-Well-Head",
        "Food: Baseline-Subsistence-Rations",
        "Cal: Grain-Bushels",
        "Shelter: Weatherproof-Civic-Fabric",
        "Civic: Vernacular-Shelter",
        "Defense: Local-Palisade-and-Watch",
        "Economy: Baseline-Mundane-Smithy-and-Trade",
        "Health: Folk-Leechcraft-and-Midwifery",
        "Sanitation: Vernacular-Midden-Management",
        "Social: Communal-Folklore-Solidarity"
      ]);
      currentSet.forEach(t => tagPool.add(t));

      const modSource = (typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST))
        ? MODULES_MANIFEST
        : ((typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) ? ALL_MODULES : []);
      modSource.forEach(m => {
        (m.provides || []).forEach(p => {
          if (typeof isMaterialRequirement !== 'function' || isMaterialRequirement(p)) tagPool.add(p);
        });
        (m.requires || []).forEach(r => {
          if (typeof isMaterialRequirement !== 'function' || isMaterialRequirement(r)) tagPool.add(r);
        });
      });

      const topo = Workstation.activeTopology || {};
      Object.values(topo.nodes || {}).forEach(n => {
        (n.provides || []).forEach(t => { if (t) tagPool.add(t); });
        (n.requires || []).forEach(t => { if (t) tagPool.add(t); });
      });
      Object.values(topo.edgeData || {}).forEach(ed => {
        (ed.dedicatedFlows || []).forEach(f => {
          const t = typeof f === 'string' ? f : (f && f.tag);
          if (t) tagPool.add(t);
        });
      });

      const titleMap = {
        provides: `Ad-Hoc Resource Yields (provides) — ${targetLabel}`,
        requires: `Ad-Hoc Resource Demands (requires) — ${targetLabel}`,
        dedicatedFlows: `Dedicated Corridor Conduits — ${targetLabel}`
      };

      const overlay = document.createElement('div');
      overlay.id = 'vb-resource-tag-modal-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;';

      const win = document.createElement('div');
      win.className = 'win95-panel';
      win.style.cssText = 'width:400px;max-width:94vw;background:#c0c0c0;border:2px outset #ffffff;box-shadow:4px 4px 12px rgba(0,0,0,0.5);font-family:var(--font-stack, Tahoma, sans-serif);font-size:11px;color:#000;';

      win.innerHTML = `
        <div style="background:#000080;color:#fff;font-weight:bold;padding:3px 6px;display:flex;align-items:center;justify-content:space-between;">
          <span>📦 ${escapeHtml(titleMap[propKey] || 'Resource Tag Editor')}</span>
          <button id="vb-res-close-btn" class="win-btn" style="padding:0 5px;font-weight:bold;line-height:14px;">✕</button>
        </div>
        <div style="padding:8px;display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;gap:4px;">
            <input id="vb-res-custom-input" type="text" placeholder="Add custom tag (e.g. Ore: Iron-Veins)..." style="flex:1;padding:2px 4px;border:2px inset #808080;font-size:11px;" />
            <button id="vb-res-add-btn" class="win-btn" style="padding:2px 8px;font-weight:bold;">+ Add Tag</button>
          </div>
          <input id="vb-res-filter-input" type="text" placeholder="Filter existing resource tags..." style="width:100%;padding:2px 4px;border:2px inset #808080;font-size:11px;box-sizing:border-box;" />
          <div id="vb-res-list" style="max-height:220px;overflow-y:auto;background:#ffffff;border:2px inset #808080;padding:4px;display:flex;flex-direction:column;gap:2px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <div style="display:flex;gap:4px;">
              <button id="vb-res-clear-btn" class="win-btn" style="padding:2px 6px;font-size:10px;">Clear All</button>
            </div>
            <div style="display:flex;gap:6px;">
              <button id="vb-res-apply-btn" class="win-btn" style="padding:2px 12px;font-weight:bold;">OK</button>
              <button id="vb-res-cancel-btn" class="win-btn" style="padding:2px 10px;">Cancel</button>
            </div>
          </div>
        </div>
      `;

      overlay.appendChild(win);
      document.body.appendChild(overlay);

      const listEl = win.querySelector('#vb-res-list');
      const filterInput = win.querySelector('#vb-res-filter-input');
      const customInput = win.querySelector('#vb-res-custom-input');

      function renderTagList() {
        const filterText = (filterInput.value || '').trim().toLowerCase();
        listEl.innerHTML = '';
        const sortedTags = Array.from(tagPool).sort((a, b) => {
          const aSel = currentSet.has(a) ? 0 : 1;
          const bSel = currentSet.has(b) ? 0 : 1;
          if (aSel !== bSel) return aSel - bSel;
          return a.localeCompare(b);
        });
        sortedTags.forEach(tag => {
          if (filterText && !tag.toLowerCase().includes(filterText)) return;
          const lbl = document.createElement('label');
          lbl.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 4px;cursor:pointer;user-select:none;';
          lbl.onmouseenter = () => { lbl.style.background = '#e2e8f0'; };
          lbl.onmouseleave = () => { lbl.style.background = 'transparent'; };

          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = tag;
          cb.checked = currentSet.has(tag);
          cb.onchange = () => {
            if (cb.checked) currentSet.add(tag);
            else currentSet.delete(tag);
          };

          const span = document.createElement('span');
          span.textContent = tag;
          if (currentSet.has(tag)) span.style.fontWeight = 'bold';

          lbl.appendChild(cb);
          lbl.appendChild(span);
          listEl.appendChild(lbl);
        });
      }

      renderTagList();
      filterInput.oninput = renderTagList;

      const addCustomTag = () => {
        const raw = (customInput.value || '').trim();
        if (!raw) return;
        tagPool.add(raw);
        currentSet.add(raw);
        customInput.value = '';
        renderTagList();
      };
      win.querySelector('#vb-res-add-btn').onclick = addCustomTag;
      customInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomTag();
        }
      };

      const closeModal = () => overlay.remove();
      win.querySelector('#vb-res-close-btn').onclick = closeModal;
      win.querySelector('#vb-res-cancel-btn').onclick = closeModal;
      win.querySelector('#vb-res-clear-btn').onclick = () => {
        currentSet.clear();
        renderTagList();
      };

      win.querySelector('#vb-res-apply-btn').onclick = () => {
        const updated = Array.from(currentSet);
        targetObj[propKey] = updated;
        if (targetType === 'node' && targetObj.id !== undefined && typeof getNode === 'function') {
          const studioNode = getNode(targetObj.id);
          if (studioNode) studioNode[propKey] = [...updated];
        }
        closeModal();
        if (typeof auditAllSupplyLines === 'function') auditAllSupplyLines();
        if (typeof updateTargetNodeSidebar === 'function') updateTargetNodeSidebar();
        renderCanvas();
        updatePropertiesGrid();
        saveActiveCampaign();
        if (typeof setStatusBarMessage === 'function') {
          setStatusBarMessage(`Updated ${propKey} on ${targetLabel} (${updated.length} resource tag${updated.length === 1 ? '' : 's'}).`);
        }
      };
    }

    function appendActionPropRow(tbody, propName, label, onAction) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      tdVal.style.padding = '2px 4px';
      
      const link = document.createElement('a');
      link.href = 'javascript:void(0)';
      link.style.color = '#000080';
      link.style.textDecoration = 'underline';
      link.style.cursor = 'pointer';
      link.textContent = label;
      link.onclick = (e) => { e.preventDefault(); if (onAction) onAction(); };
      
      tdVal.appendChild(link);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendButtonPropRow(tbody, propName, buttonLabel, onAction) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      tdVal.style.padding = '2px 4px';

      const btn = document.createElement('button');
      btn.className = 'win-btn';
      btn.style.width = '100%';
      btn.style.fontSize = '10px';
      btn.style.padding = '2px 6px';
      btn.style.fontWeight = 'bold';
      btn.textContent = buttonLabel;
      btn.onclick = (e) => { e.preventDefault(); if (onAction) onAction(); };

      tdVal.appendChild(btn);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendTextareaPropRow(tbody, propName, value, rows = 3, onCommit) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      tdVal.style.padding = '2px';

      const textarea = document.createElement('textarea');
      textarea.className = 'vb-cell-input';
      textarea.rows = rows;
      textarea.style.resize = 'vertical';
      textarea.value = value || '';
      textarea.placeholder = 'Type @ or [[ to cite entities...';
      textarea.addEventListener('change', () => { if (onCommit) onCommit(textarea.value); });

      if (typeof attachWikiAutocomplete === 'function') {
        setTimeout(() => attachWikiAutocomplete(textarea), 0);
      }

      tdVal.appendChild(textarea);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendBacklinksPropRow(tbody, entityType, entityId) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = 'Backlinks';
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      tdVal.style.padding = '3px 4px';

      const currentMap = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
      const backlinks = (entityType === 'node' && typeof getNestedBacklinksForNode === 'function')
        ? getNestedBacklinksForNode(entityId, currentMap)
        : ((typeof getBacklinksForEntity === 'function')
          ? getBacklinksForEntity(entityType, entityId, currentMap)
          : []);

      if (backlinks.length === 0) {
        tdVal.innerHTML = `<span style="color:#777; font-style:italic; font-size:10px;">(No inbound citations)</span>`;
      } else {
        const listDiv = document.createElement('div');
        listDiv.style.maxHeight = '140px';
        listDiv.style.overflowY = 'auto';
        listDiv.style.display = 'flex';
        listDiv.style.flexDirection = 'column';
        listDiv.style.gap = '3px';

        const directHits = backlinks.filter(b => !b.isNested && (!b.traversalPath || b.traversalPath.length === 0));
        const nestedHits = backlinks.filter(b => b.isNested || (b.traversalPath && b.traversalPath.length > 0));

        function renderHitItem(b) {
          const item = document.createElement('div');
          item.style.fontSize = '10px';
          item.style.padding = '2px 4px';
          item.style.background = '#f0f4f8';
          item.style.border = '1px solid #cbd5e1';
          item.style.cursor = 'pointer';
          item.style.borderRadius = '2px';
          item.title = `"${escapeAttr(b.snippet || '')}"`;

          const viaStr = (b.traversalPath && b.traversalPath.length > 0)
            ? `<div style="color:#0284c7; font-size:9px; margin-top:1px;">↳ via ${escapeHtml(b.traversalPath.join(' &gt; '))}</div>`
            : '';

          item.innerHTML = `<div><strong>${escapeHtml(b.sourceName)}</strong> <span style="color:#64748b; font-size:9px;">[${escapeHtml(b.field)}]</span></div>${viaStr}`;
          item.onclick = () => {
            if (typeof navigateToWikiEntity === 'function') {
              navigateToWikiEntity(b.sourceType, b.sourceId, b.mapId);
            }
          };
          return item;
        }

        if (nestedHits.length > 0 && directHits.length > 0) {
          const directHeader = document.createElement('div');
          directHeader.style.fontSize = '9px';
          directHeader.style.fontWeight = 'bold';
          directHeader.style.color = '#475569';
          directHeader.textContent = `Direct Citations (${directHits.length}):`;
          listDiv.appendChild(directHeader);

          directHits.forEach(b => listDiv.appendChild(renderHitItem(b)));

          const nestedHeader = document.createElement('div');
          nestedHeader.style.fontSize = '9px';
          nestedHeader.style.fontWeight = 'bold';
          nestedHeader.style.color = '#475569';
          nestedHeader.style.marginTop = '4px';
          nestedHeader.textContent = `Sub-Map & Stationed Citations (${nestedHits.length}):`;
          listDiv.appendChild(nestedHeader);

          nestedHits.forEach(b => listDiv.appendChild(renderHitItem(b)));
        } else if (nestedHits.length > 0) {
          const nestedHeader = document.createElement('div');
          nestedHeader.style.fontSize = '9px';
          nestedHeader.style.fontWeight = 'bold';
          nestedHeader.style.color = '#475569';
          nestedHeader.textContent = `Sub-Map & Stationed Citations (${nestedHits.length}):`;
          listDiv.appendChild(nestedHeader);

          nestedHits.forEach(b => listDiv.appendChild(renderHitItem(b)));
        } else {
          directHits.forEach(b => listDiv.appendChild(renderHitItem(b)));
        }

        tdVal.appendChild(listDiv);
      }

      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendChipInputPropRow(tbody, propName, getTags, datalistId, getSuggestions, onAdd, onRemove) {
      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      tdVal.style.padding = '3px 4px';

      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '4px';

      const chipsContainer = document.createElement('div');
      chipsContainer.style.display = 'flex';
      chipsContainer.style.flexWrap = 'wrap';
      chipsContainer.style.gap = '3px';

      const inputRow = document.createElement('div');
      inputRow.style.display = 'flex';
      inputRow.style.gap = '2px';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'vb-cell-input';
      input.placeholder = 'Type & press Enter...';
      input.style.fontSize = '10px';
      input.style.flex = '1';
      if (datalistId) {
        input.setAttribute('list', datalistId);
      }

      const datalist = document.createElement('datalist');
      if (datalistId) datalist.id = datalistId;

      function refreshDatalist() {
        datalist.innerHTML = '';
        if (typeof getSuggestions === 'function') {
          const suggestions = getSuggestions() || [];
          const currentTags = (typeof getTags === 'function' ? getTags() : []) || [];
          const lowerTags = currentTags.map(t => String(t).toLowerCase());
          suggestions.forEach(s => {
            if (!lowerTags.includes(String(s).toLowerCase())) {
              const opt = document.createElement('option');
              opt.value = s;
              datalist.appendChild(opt);
            }
          });
        }
      }

      function renderChips() {
        chipsContainer.innerHTML = '';
        const tags = (typeof getTags === 'function' ? getTags() : []) || [];
        if (tags.length === 0) {
          const emptySpan = document.createElement('span');
          emptySpan.style.color = '#888';
          emptySpan.style.fontStyle = 'italic';
          emptySpan.style.fontSize = '9px';
          emptySpan.textContent = '(None)';
          chipsContainer.appendChild(emptySpan);
        } else {
          tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.style.display = 'inline-flex';
            chip.style.alignItems = 'center';
            chip.style.gap = '3px';
            chip.style.background = '#e2e8f0';
            chip.style.border = '1px solid #cbd5e1';
            chip.style.borderRadius = '3px';
            chip.style.padding = '1px 4px';
            chip.style.fontSize = '9px';
            chip.style.color = '#1e293b';

            const labelSpan = document.createElement('span');
            labelSpan.textContent = tag;
            chip.appendChild(labelSpan);

            const delBtn = document.createElement('span');
            delBtn.textContent = '×';
            delBtn.style.cursor = 'pointer';
            delBtn.style.fontWeight = 'bold';
            delBtn.style.color = '#64748b';
            delBtn.title = `Remove ${tag}`;
            delBtn.onmouseenter = () => { delBtn.style.color = '#ef4444'; };
            delBtn.onmouseleave = () => { delBtn.style.color = '#64748b'; };
            delBtn.onclick = (e) => {
              e.stopPropagation();
              if (typeof onRemove === 'function') onRemove(tag);
              renderChips();
              refreshDatalist();
              input.focus();
            };
            chip.appendChild(delBtn);

            chipsContainer.appendChild(chip);
          });
        }
      }

      function commitInput() {
        const rawVal = input.value.trim();
        if (rawVal) {
          const parts = rawVal.split(',').map(p => p.trim()).filter(Boolean);
          parts.forEach(p => {
            if (typeof onAdd === 'function') onAdd(p);
          });
          input.value = '';
          renderChips();
          refreshDatalist();
          input.focus();
        }
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitInput();
        }
      });

      input.addEventListener('change', () => {
        commitInput();
      });

      refreshDatalist();
      renderChips();

      container.appendChild(chipsContainer);
      inputRow.appendChild(input);
      if (datalistId) inputRow.appendChild(datalist);
      container.appendChild(inputRow);

      tdVal.appendChild(container);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    function appendPartyRapportPropRow(tbody, propName, currentRapport, onCommit) {
      const norm = (typeof normalizePartyRapport === 'function')
        ? normalizePartyRapport(currentRapport)
        : (currentRapport || { stance: 0, notes: '' });

      const tr = document.createElement('tr');
      tr.className = 'prop-row';

      const tdName = document.createElement('td');
      tdName.className = 'prop-name';
      tdName.textContent = propName;
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.className = 'prop-val';
      tdVal.style.padding = '2px 4px';

      const flexBox = document.createElement('div');
      flexBox.style.display = 'flex';
      flexBox.style.flexDirection = 'column';
      flexBox.style.gap = '3px';

      const select = document.createElement('select');
      select.className = 'vb-cell-select';
      select.style.fontSize = '10px';
      select.style.padding = '1px 2px';

      const stanceOptions = [
        { val: -2, label: '-2: Hostile' },
        { val: -1, label: '-1: Unfriendly' },
        { val: 0, label: '0: Neutral' },
        { val: 1, label: '1: Friendly' },
        { val: 2, label: '2: Allied' }
      ];

      stanceOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = String(opt.val);
        option.textContent = opt.label;
        if (opt.val === norm.stance) option.selected = true;
        select.appendChild(option);
      });

      const notesInput = document.createElement('input');
      notesInput.type = 'text';
      notesInput.className = 'vb-cell-input';
      notesInput.style.fontSize = '10px';
      notesInput.placeholder = 'Rapport / disposition notes...';
      notesInput.value = norm.notes || '';

      function save() {
        const stance = parseInt(select.value, 10);
        const notes = notesInput.value.trim();
        if (typeof onCommit === 'function') {
          onCommit({ stance, notes });
        }
      }

      select.addEventListener('change', save);
      notesInput.addEventListener('change', save);

      flexBox.appendChild(select);
      flexBox.appendChild(notesInput);
      tdVal.appendChild(flexBox);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }
    function togglePropertiesDock() {
      const dock = document.getElementById('properties-dock');
      dock.style.display = dock.style.display === 'none' ? 'flex' : 'none';
    }

    // ========================================================================
    // LIVE TABLETOP TRAVEL HAZARD & ENCOUNTER ENGINE (SYS-START-11)
    // ========================================================================
    function calculateCorridorHazard(edgeRecord, uNode, vNode) {
      const baseLevel = (edgeRecord && typeof edgeRecord.hazardLevel === 'number')
        ? edgeRecord.hazardLevel
        : (edgeRecord && edgeRecord.hazard ? parseInt(edgeRecord.hazard, 10) : 0);

      // Compute Manhattan ODV friction delta: |Su - Sv| + |Eu - Ev| + |Cu - Cv|
      let frictionDelta = 0;
      if (uNode && vNode) {
        const uOdv = (Array.isArray(uNode.odv) ? uNode.odv : (uNode.odv && typeof uNode.odv === 'object' ? [uNode.odv.s || 1, uNode.odv.e || 1, uNode.odv.c || 1] : null)) || [1, 1, 1];
        const vOdv = (Array.isArray(vNode.odv) ? vNode.odv : (vNode.odv && typeof vNode.odv === 'object' ? [vNode.odv.s || 1, vNode.odv.e || 1, vNode.odv.c || 1] : null)) || [1, 1, 1];
        frictionDelta = Math.abs(uOdv[0] - vOdv[0]) + Math.abs(uOdv[1] - vOdv[1]) + Math.abs(uOdv[2] - vOdv[2]);
      }

      // If friction delta >= 5, escalate hazard tier by +1 (capped at Lethal = 4)
      const isHighFriction = frictionDelta >= 5;
      const effectiveLevel = Math.min(4, isHighFriction ? baseLevel + 1 : baseLevel);

      const TIER_SPECS = [
        { level: 0, name: 'Safe', dc: 8, target2d6: 4, damageDice: '0', avgDamage: 0, complication: 'Uneventful transit with routine supply passage.' },
        { level: 1, name: 'Light', dc: 10, target2d6: 6, damageDice: '1d6', avgDamage: 3, complication: 'Minor terrain delay, equipment snag, or lone scout interaction.' },
        { level: 2, name: 'Moderate', dc: 13, target2d6: 8, damageDice: '2d8', avgDamage: 9, complication: 'Ambush, wash-out, or hostile border patrol. Advance incident threat clock by +1 tick.' },
        { level: 3, name: 'Severe', dc: 16, target2d6: 10, damageDice: '4d10', avgDamage: 22, complication: 'Corridor blockade, bridge breach, or deadly environmental surge.' },
        { level: 4, name: 'Lethal', dc: 20, target2d6: 12, damageDice: '8d12', avgDamage: 52, complication: 'Catastrophic terrain collapse or total annihilation threat.' }
      ];

      const spec = TIER_SPECS[effectiveLevel] || TIER_SPECS[0];
      return {
        baseLevel,
        frictionDelta,
        isHighFriction,
        effectiveLevel,
        levelName: spec.name,
        dc: spec.dc,
        target2d6: spec.target2d6,
        damageDice: spec.damageDice,
        avgDamage: spec.avgDamage,
        complication: spec.complication
      };
    }

    function rollHazardCheck(hazard, mod = 0) {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const d6_1 = Math.floor(Math.random() * 6) + 1;
      const d6_2 = Math.floor(Math.random() * 6) + 1;
      const sum2d6 = d6_1 + d6_2;

      const totalD20 = d20 + mod;
      const passedD20 = totalD20 >= hazard.dc;
      const passed2d6 = sum2d6 >= hazard.target2d6;

      let damageTotal = 0;
      const diceParts = (hazard.damageDice || '0').split('d');
      if (diceParts.length === 2) {
        const count = parseInt(diceParts[0], 10) || 0;
        const sides = parseInt(diceParts[1], 10) || 0;
        for (let i = 0; i < count; i++) {
          damageTotal += Math.floor(Math.random() * sides) + 1;
        }
      }

      return {
        d20,
        mod,
        total: totalD20,
        passed: passedD20,
        twoD6: sum2d6,
        d6_1,
        d6_2,
        passed2d6,
        damageDice: hazard.damageDice,
        damageTotal: passedD20 ? Math.floor(damageTotal / 2) : damageTotal
      };
    }

    let currentTravelSession = null;

    function openCorridorHazardDialog(uId, vId, edgeRecord) {
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo) return;
      const uNode = topo.nodes[String(uId)];
      const vNode = topo.nodes[String(vId)];
      const hazard = calculateCorridorHazard(edgeRecord, uNode, vNode);

      currentTravelSession = { uId, vId, edgeRecord, uNode, vNode, hazard, lastRoll: null };

      const modal = document.getElementById('modal-travel-resolution');
      if (!modal) return;

      const uName = (uNode && uNode.name) || `Node ${uId}`;
      const vName = (vNode && vNode.name) || `Node ${vId}`;

      const headerEl = document.getElementById('travel-res-header');
      if (headerEl) {
        headerEl.textContent = `${uName} ↔ ${vName}`;
      }

      const badgeEl = document.getElementById('travel-res-badge');
      if (badgeEl) {
        badgeEl.textContent = `Hazard Tier ${hazard.effectiveLevel}: ${hazard.levelName.toUpperCase()}`;
        badgeEl.style.background = hazard.effectiveLevel >= 3 ? '#dc2626' : (hazard.effectiveLevel >= 2 ? '#d97706' : '#2563eb');
        badgeEl.style.color = '#ffffff';
      }

      const detailsEl = document.getElementById('travel-res-details');
      if (detailsEl) {
        detailsEl.innerHTML = `
          <div><strong>Baseline Hazard:</strong> Level ${hazard.baseLevel}</div>
          <div><strong>ODV Friction Delta:</strong> Δ = ${hazard.frictionDelta} ${hazard.isHighFriction ? '<span style="color:#dc2626; font-weight:bold;">(+1 Tier Escalation: High Tension)</span>' : '(Normal)'}</div>
          <div><strong>Standard Target DC:</strong> ${hazard.dc} (d20) | <strong>2d6 Target:</strong> ${hazard.target2d6}+</div>
          <div><strong>Complication / Damage:</strong> ${hazard.damageDice} damage (avg ${hazard.avgDamage})</div>
          <div style="margin-top:6px; font-style:italic; color:#334155; font-size:11px;">"${hazard.complication}"</div>
        `;
      }

      const rollBox = document.getElementById('travel-res-roll-box');
      if (rollBox) {
        rollBox.innerHTML = '<span style="color:#64748b;">Ready to roll travel check. Enter party modifier if applicable.</span>';
      }

      modal.style.display = 'flex';
      modal.classList.remove('hidden');
    }

    function closeTravelResolutionModal() {
      const modal = document.getElementById('modal-travel-resolution');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
      }
      currentTravelSession = null;
    }

    function executeTravelRoll() {
      if (!currentTravelSession) return;
      const modInput = document.getElementById('travel-res-modifier');
      const mod = modInput ? (parseInt(modInput.value, 10) || 0) : 0;

      const rollRes = rollHazardCheck(currentTravelSession.hazard, mod);
      currentTravelSession.lastRoll = rollRes;

      const rollBox = document.getElementById('travel-res-roll-box');
      if (rollBox) {
        const outcomeColor = rollRes.passed ? '#059669' : '#dc2626';
        const outcomeText = rollRes.passed ? 'PASSED / SAFE PASSAGE' : 'FAILED / COMPLICATION TRIGGERED';
        rollBox.innerHTML = `
          <div style="font-size:14px; font-weight:bold; color:${outcomeColor}; margin-bottom:4px;">${outcomeText}</div>
          <div><strong>d20 Roll:</strong> [${rollRes.d20}] + ${rollRes.mod} = <strong>${rollRes.total}</strong> vs DC ${currentTravelSession.hazard.dc}</div>
          <div><strong>2d6 Roll:</strong> [${rollRes.d6_1}] + [${rollRes.d6_2}] = <strong>${rollRes.twoD6}</strong> vs Target ${currentTravelSession.hazard.target2d6}+</div>
          <div><strong>Applied Damage:</strong> <span style="font-weight:bold; color:#dc2626;">${rollRes.damageTotal}</span> (${rollRes.damageDice} roll${rollRes.passed ? ', halved on pass' : ''})</div>
        `;
      }
    }

    function triggerTravelThreatTick() {
      if (!currentTravelSession) return;
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo) return;
      const { uId, vId } = currentTravelSession;
      let tracker = (topo.trackers || []).find(t => String(t.nodeId) === String(uId) || String(t.nodeId) === String(vId));
      if (!tracker && topo.trackers && topo.trackers.length > 0) {
        tracker = topo.trackers[0];
      }
      if (tracker) {
        const maxTicks = tracker.maxTicks || 6;
        tracker.currentTicks = Math.min(maxTicks, (tracker.currentTicks || 0) + 1);
        if (typeof pushHistoryState === 'function') pushHistoryState(`Travel Complication: +1 Tick on ${tracker.name || tracker.title}`);
        if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
        if (typeof scheduleRenderCanvas === 'function') scheduleRenderCanvas();
        if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Advanced threat clock "${tracker.name || tracker.title}" to ${tracker.currentTicks}/${maxTicks}.`);
        alert(`Threat Clock "${tracker.name || tracker.title}" advanced to ${tracker.currentTicks}/${maxTicks}!`);
      } else {
        alert('No threat clocks anchored to this corridor to advance.');
      }
    }

    function severCorridorFromTravel() {
      if (!currentTravelSession) return;
      const { edgeRecord } = currentTravelSession;
      if (edgeRecord) {
        edgeRecord.hazardLevel = 3;
        edgeRecord.blocked = true;
        if (typeof pushHistoryState === 'function') pushHistoryState(`Travel Complication: Blocked corridor`);
        if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
        if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
        if (typeof scheduleRenderCanvas === 'function') scheduleRenderCanvas();
        if (typeof setStatusBarMessage === 'function') setStatusBarMessage(`Corridor blocked due to travel hazard failure!`);
        alert('Corridor has been blocked and escalated to Severe hazard.');
      }
    }

// Exported globals
window.selectNode = selectNode;
window.selectEdge = selectEdge;
window.selectGlobal = selectGlobal;
window.selectShape = selectShape;
window.deleteShape = deleteShape;
window.updateObjectSelector = updateObjectSelector;
window.onObjectSelectorChange = onObjectSelectorChange;
window.updatePropertiesGrid = updatePropertiesGrid;
function renderNodeProperties(targetTbody, node, topo = null) {
  if (!targetTbody || !node) return;
  updatePropertiesGrid(targetTbody, { type: 'node', id: node.id }, topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null));
}
window.renderNodeProperties = renderNodeProperties;
window.renderMultiSelectionProperties = renderMultiSelectionProperties;
window.promptRepositionSelection = promptRepositionSelection;
window.appendCategoryRow = appendCategoryRow;
window.appendPropRow = appendPropRow;
window.appendSelectPropRow = appendSelectPropRow;
window.appendColorPropRow = appendColorPropRow;
window.appendEllipsisPropRow = appendEllipsisPropRow;
window.openNodeCollectionModal = openNodeCollectionModal;
window.openResourceTagModal = openResourceTagModal;
window.appendActionPropRow = appendActionPropRow;
window.appendButtonPropRow = appendButtonPropRow;
window.appendTextareaPropRow = appendTextareaPropRow;
window.appendBacklinksPropRow = appendBacklinksPropRow;
window.appendChipInputPropRow = appendChipInputPropRow;
window.appendPartyRapportPropRow = appendPartyRapportPropRow;
window.togglePropertiesDock = togglePropertiesDock;
window.calculateCorridorHazard = calculateCorridorHazard;
window.rollHazardCheck = rollHazardCheck;
window.openCorridorHazardDialog = openCorridorHazardDialog;
window.closeTravelResolutionModal = closeTravelResolutionModal;
window.executeTravelRoll = executeTravelRoll;
window.triggerTravelThreatTick = triggerTravelThreatTick;
window.severCorridorFromTravel = severCorridorFromTravel;