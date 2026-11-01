// CAD Canvas Renderer & Visual Geometry Engine
    // Geometric SVG Math Helpers for Node Shapes
    function computeStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      const points = [];
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        points.push(`${Math.round(x)},${Math.round(y)}`);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        points.push(`${Math.round(x)},${Math.round(y)}`);
        rot += step;
      }
      return points.join(' ');
    }

    function computePolygonPoints(cx, cy, sides, radius) {
      const points = [];
      const step = (Math.PI * 2) / sides;
      let angle = -Math.PI / 2;
      for (let i = 0; i < sides; i++) {
        points.push(`${Math.round(cx + Math.cos(angle) * radius)},${Math.round(cy + Math.sin(angle) * radius)}`);
        angle += step;
      }
      return points.join(' ');
    }

    // Render Background Grid
    function renderGrid() {
      const gridLayer = document.getElementById('grid-layer');
      if (!gridLayer) return;
      gridLayer.innerHTML = '';
      const topo = typeof Workstation !== 'undefined' ? Workstation.activeTopology : null;
      const bgLayer = (typeof getLayerById === 'function' && topo) ? getLayerById('layer-bg', topo) : null;
      const isBgVisible = !bgLayer || bgLayer.visible !== false;
      const bgOpacity = bgLayer ? (bgLayer.opacity ?? 1.0) : 1.0;
      if (!Workstation.showGrid || !isBgVisible) return;
      gridLayer.setAttribute('opacity', String(0.6 * bgOpacity));

      const spacing = 40;
      const width = 2000;
      const height = 1500;

      for (let x = 0; x < width; x += spacing) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', x);
        line.setAttribute('y2', height);
        line.setAttribute('class', 'canvas-grid-line');
        gridLayer.appendChild(line);
      }
      for (let y = 0; y < height; y += spacing) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'canvas-grid-line');
        gridLayer.appendChild(line);
      }
    }

    // Render Centered Auto-Shrink Interior Text for Drawing Shapes (Rect, Circle)
    function renderShapeCenteredText(shape, isSelected) {
      if (!shape || !shape.text || (shape.type !== 'rect' && shape.type !== 'circle')) return null;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'shape-interior-text-group');
      g.setAttribute('pointer-events', 'none');

      let cx, cy, availW, availH;
      if (shape.type === 'rect') {
        const w = Math.max(1, shape.width || 100);
        const h = Math.max(1, shape.height || 60);
        cx = (shape.x || 0) + w / 2;
        cy = (shape.y || 0) + h / 2;
        availW = Math.max(10, w - 12);
        availH = Math.max(8, h - 8);
      } else {
        const r = shape.radius || 40;
        const rx = shape.rx || r;
        const ry = shape.ry || r;
        cx = shape.x || 0;
        cy = shape.y || 0;
        // Inscribed rectangle within ellipse
        availW = Math.max(10, Math.floor(1.414 * rx - 12));
        availH = Math.max(8, Math.floor(1.414 * ry - 8));
      }

      const lines = String(shape.text).split('\n');
      const nLines = lines.length;
      let maxLen = 1;
      lines.forEach(l => { if (l.length > maxLen) maxLen = l.length; });

      const baseSize = shape.fontSize || 13;
      const sw = Math.floor(availW / (maxLen * 0.62));
      const sh = Math.floor(availH / (nLines * 1.3));
      const finalSize = Math.max(7, Math.min(baseSize, isNaN(sw) ? baseSize : sw, isNaN(sh) ? baseSize : sh));
      const lineHeight = Math.round(finalSize * 1.25);
      const totalTextHeight = (nLines - 1) * lineHeight;
      const startY = Math.round(cy - (totalTextHeight / 2) + (finalSize * 0.35));

      const textColor = shape.textColor || (isSelected ? '#991b1b' : '#0f172a');

      lines.forEach((lineText, idx) => {
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', String(cx));
        t.setAttribute('y', String(startY + idx * lineHeight));
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-family', 'var(--font-stack, "Segoe UI", Tahoma, sans-serif)');
        t.setAttribute('font-size', `${finalSize}px`);
        t.setAttribute('font-weight', shape.fontWeight || 'bold');
        t.setAttribute('fill', textColor);
        t.setAttribute('pointer-events', 'none');

        if (lineText.length * 0.62 * finalSize > availW) {
          t.setAttribute('textLength', String(availW));
          t.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        }

        t.textContent = lineText;
        g.appendChild(t);
      });

      return g;
    }

    // Render CAD Shape SVG Element (Rect, Circle, Line)
    function renderShapeSvgElement(shape, opacity, isSelected, isLocked) {
      if (!shape) return null;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `canvas-shape canvas-shape-${shape.type || 'rect'} ${isSelected ? 'selected' : ''}`);
      g.setAttribute('opacity', String(opacity ?? 1.0));
      g.style.cursor = isLocked ? 'default' : 'pointer';

      let prim;
      const strokeColor = isSelected ? '#f43f5e' : (shape.strokeColor || '#2563eb');
      const strokeW = isSelected ? Math.max(3, (shape.strokeWidth || 2) + 1) : (shape.strokeWidth || 2);
      const fillColor = shape.fillColor || 'rgba(59, 130, 246, 0.2)';

      if (shape.type === 'rect') {
        prim = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        prim.setAttribute('x', shape.x || 0);
        prim.setAttribute('y', shape.y || 0);
        prim.setAttribute('width', Math.max(1, shape.width || 100));
        prim.setAttribute('height', Math.max(1, shape.height || 60));
        prim.setAttribute('rx', '2');
        prim.setAttribute('fill', fillColor);
        prim.setAttribute('stroke', strokeColor);
        prim.setAttribute('stroke-width', String(strokeW));
        if (shape.strokeDash === 'dashed') prim.setAttribute('stroke-dasharray', '6,4');
        else if (shape.strokeDash === 'dotted') prim.setAttribute('stroke-dasharray', '2,3');
      } else if (shape.type === 'circle') {
        prim = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        const r = shape.radius || 40;
        prim.setAttribute('cx', shape.x || 0);
        prim.setAttribute('cy', shape.y || 0);
        prim.setAttribute('rx', String(shape.rx || r));
        prim.setAttribute('ry', String(shape.ry || r));
        prim.setAttribute('fill', fillColor);
        prim.setAttribute('stroke', strokeColor);
        prim.setAttribute('stroke-width', String(strokeW));
        if (shape.strokeDash === 'dashed') prim.setAttribute('stroke-dasharray', '6,4');
        else if (shape.strokeDash === 'dotted') prim.setAttribute('stroke-dasharray', '2,3');
      } else if (shape.type === 'line') {
        prim = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        prim.setAttribute('x1', shape.x || 0);
        prim.setAttribute('y1', shape.y || 0);
        prim.setAttribute('x2', shape.x2 !== undefined ? shape.x2 : ((shape.x || 0) + 100));
        prim.setAttribute('y2', shape.y2 !== undefined ? shape.y2 : (shape.y || 0));
        prim.setAttribute('stroke', strokeColor);
        prim.setAttribute('stroke-width', String(strokeW));
        if (shape.strokeDash === 'dashed') prim.setAttribute('stroke-dasharray', '6,4');
        else if (shape.strokeDash === 'dotted') prim.setAttribute('stroke-dasharray', '2,3');
      }

      if (prim) g.appendChild(prim);

      // Render Interior Centered Auto-Shrink Text (Rect, Circle)
      if (shape.text && (shape.type === 'rect' || shape.type === 'circle')) {
        const interiorTextGroup = renderShapeCenteredText(shape, isSelected);
        if (interiorTextGroup) g.appendChild(interiorTextGroup);
      }

      if (shape.name) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        let textX = shape.x || 0;
        let textY = (shape.y || 0) - 5;
        if (shape.type === 'circle') {
          textX = shape.x || 0;
          textY = (shape.y || 0) - (shape.radius || 40) - 5;
        }
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('font-family', 'var(--font-stack)');
        text.setAttribute('font-size', '10px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', isSelected ? '#be123c' : '#1e293b');
        text.setAttribute('pointer-events', 'none');
        text.textContent = shape.name;
        g.appendChild(text);
      }

      // AutoCAD-style Grip Handles when selected
      if (isSelected) {
        const createGrip = (gx, gy) => {
          const grip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          grip.setAttribute('x', gx - 3);
          grip.setAttribute('y', gy - 3);
          grip.setAttribute('width', 6);
          grip.setAttribute('height', 6);
          grip.setAttribute('fill', '#2563eb');
          grip.setAttribute('stroke', '#ffffff');
          grip.setAttribute('stroke-width', '1.5');
          grip.setAttribute('class', 'cad-grip-handle');
          grip.setAttribute('pointer-events', 'none');
          return grip;
        };

        if (shape.type === 'rect') {
          const sx = shape.x || 0;
          const sy = shape.y || 0;
          const sw = Math.max(1, shape.width || 100);
          const sh = Math.max(1, shape.height || 60);
          g.appendChild(createGrip(sx, sy));
          g.appendChild(createGrip(sx + sw, sy));
          g.appendChild(createGrip(sx, sy + sh));
          g.appendChild(createGrip(sx + sw, sy + sh));
        } else if (shape.type === 'circle') {
          const cx = shape.x || 0;
          const cy = shape.y || 0;
          const cr = shape.radius || 40;
          const crx = shape.rx || cr;
          const cry = shape.ry || cr;
          g.appendChild(createGrip(cx - crx, cy));
          g.appendChild(createGrip(cx + crx, cy));
          g.appendChild(createGrip(cx, cy - cry));
          g.appendChild(createGrip(cx, cy + cry));
        } else if (shape.type === 'line') {
          const lx1 = shape.x || 0;
          const ly1 = shape.y || 0;
          const lx2 = shape.x2 !== undefined ? shape.x2 : (lx1 + 100);
          const ly2 = shape.y2 !== undefined ? shape.y2 : ly1;
          g.appendChild(createGrip(lx1, ly1));
          g.appendChild(createGrip(lx2, ly2));
        }
      }

      const handleShapeMouseDown = (e) => {
        if (e.button !== 0 && e.type === 'mousedown') return;
        if (typeof onShapeMouseDown === 'function') {
          onShapeMouseDown(e, shape);
        } else if (typeof onShapeClick === 'function') {
          onShapeClick(e, shape);
        } else if (typeof selectShape === 'function') {
          e.stopPropagation();
          selectShape(shape.id);
        } else {
          e.stopPropagation();
          Workstation.selectedEntity = { type: 'shape', id: shape.id, shape: shape };
          if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
          if (typeof renderCanvas === 'function') renderCanvas();
        }
      };

      g.addEventListener('mousedown', handleShapeMouseDown);

      return g;
    }
    window.renderShapeSvgElement = renderShapeSvgElement;

    // Standard AutoCAD Index Colors (ACI 1-9)
    const AUTOCAD_COLORS = [
      { val: '', label: 'Auto (Quadrant / Tier)', hex: '', stroke: '#94a3b8' },
      { val: '#ff0000', label: '1 - Red (#ff0000)', hex: '#ff0000', stroke: '#991b1b' },
      { val: '#ffff00', label: '2 - Yellow (#ffff00)', hex: '#ffff00', stroke: '#854d0e' },
      { val: '#00ff00', label: '3 - Green (#00ff00)', hex: '#00ff00', stroke: '#166534' },
      { val: '#00ffff', label: '4 - Cyan (#00ffff)', hex: '#00ffff', stroke: '#0e7490' },
      { val: '#0000ff', label: '5 - Blue (#0000ff)', hex: '#0000ff', stroke: '#1e3a8a' },
      { val: '#ff00ff', label: '6 - Magenta (#ff00ff)', hex: '#ff00ff', stroke: '#86198f' },
      { val: '#ffffff', label: '7 - White (#ffffff)', hex: '#ffffff', stroke: '#334155' },
      { val: '#808080', label: '8 - Dark Gray (#808080)', hex: '#808080', stroke: '#1e293b' },
      { val: '#c0c0c0', label: '9 - Light Gray (#c0c0c0)', hex: '#c0c0c0', stroke: '#475569' }
    ];
    window.AUTOCAD_COLORS = AUTOCAD_COLORS;
    // Toggle GM Vision (Fog-of-War Concealment vs Authoring Visibility)
    function toggleGmVision() {
      Workstation.showGmVision = !Workstation.showGmVision;
      const btn = document.getElementById('btn-focus-gm-vision');
      if (btn) btn.classList.toggle('active', Workstation.showGmVision);
      renderCanvas();
      setStatusBarMessage(Workstation.showGmVision ? "GM Vision Active: Concealed fog elements visible (dashed / ghost)." : "Player View Active: Concealed fog elements completely hidden.");
    }
    window.toggleGmVision = toggleGmVision;

    // Lock / Unlock All Node Positions in Active Map
    function lockAllNodes(lock = true) {
      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) return;
      let count = 0;
      Object.keys(topo.nodes).forEach(k => {
        topo.nodes[k].locked = !!lock;
        count++;
      });
      renderCanvas();
      updatePropertiesGrid();
      saveActiveCampaign();
      setStatusBarMessage(`${lock ? 'Locked 🔒' : 'Unlocked'} positions for all ${count} nodes on active map.`);
    }
    window.lockAllNodes = lockAllNodes;

    /**
     * Recursively discovers all child submaps, nested sub-submaps, and all stationed entities
     * (NPCs, Quests, Items, Threat Clocks) anchored to a node or its descendant maps.
     */
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

    function getRecursiveNodeEntities(nodeId, mapId) {
      const targetMapId = mapId || (typeof activeMapId !== "undefined" ? activeMapId : "map_root");
      const result = {
        rootNodeId: nodeId,
        rootMapId: targetMapId,
        direct: {
          npcs: [],
          quests: [],
          items: [],
          trackers: [],
          submaps: []
        },
        submaps: [], // Array of { mapId, mapName, scaleTier, path: [...], nodes: [...], npcs: [...], quests: [...], items: [...], trackers: [...] }
        allNodes: [{ mapId: targetMapId, nodeId: nodeId }],
        totals: {
          npcs: 0,
          quests: 0,
          items: 0,
          trackers: 0,
          submaps: 0
        }
      };

      const allMaps = (typeof maps !== "undefined" && maps) ? maps : {};
      const topo = Workstation.activeTopology || {};
      const campaignNpcs = topo.npcs || [];
      const campaignQuests = topo.quests || [];
      const campaignItems = topo.items || [];
      const campaignTrackers = topo.trackers || [];

      const rootNode = (topo.nodes && (topo.nodes[nodeId] || topo.nodes[String(nodeId)]))
        || (allMaps[targetMapId] && Array.isArray(allMaps[targetMapId].nodes) && allMaps[targetMapId].nodes.find(n => String(n.id) === String(nodeId)));

      // Direct entities stationed on this node
      result.direct.npcs = campaignNpcs.filter(e => String(e.nodeId) === String(nodeId));
      result.direct.items = campaignItems.filter(e => {
        const effNode = getItemEffectiveNodeId(e);
        return effNode != null && String(effNode) === String(nodeId);
      });
      result.direct.trackers = campaignTrackers.filter(e => String(e.nodeId) === String(nodeId));
      result.direct.quests = campaignQuests.filter(q => {
        if (String(q.nodeId) === String(nodeId)) return true;
        if (Array.isArray(q.npcIds) && q.npcIds.some(nId => result.direct.npcs.some(n => n.id === nId))) return true;
        if (Array.isArray(q.itemIds) && q.itemIds.some(iId => result.direct.items.some(i => i.id === iId))) return true;
        return false;
      });

      // Find direct child maps attached to this node
      Object.keys(allMaps).forEach(mId => {
        const m = allMaps[mId];
        const isChild = (rootNode && rootNode.childMapId === m.id);
        const isAnchored = (m.parentMapId === targetMapId && String(m.parentNodeId) === String(nodeId));
        if (isChild || isAnchored) {
          if (!result.direct.submaps.some(sm => sm.id === m.id)) {
            result.direct.submaps.push(m);
          }
        }
      });

      // Recursive Traversal
      const visitedMaps = new Set([targetMapId]);
      function traverseSubmap(subMap, path) {
        if (!subMap || visitedMaps.has(subMap.id)) return;
        visitedMaps.add(subMap.id);

        const subEntry = {
          mapId: subMap.id,
          mapName: subMap.name || subMap.id,
          scaleTier: subMap.scaleTier || 'region',
          path: [...path, subMap.name || subMap.id],
          nodes: [],
          npcs: [],
          quests: [],
          items: [],
          trackers: []
        };

        let subNodes = [];
        if (subMap.id === activeMapId && topo.nodes) {
          subNodes = Object.values(topo.nodes);
        } else if (Array.isArray(subMap.nodes)) {
          subNodes = subMap.nodes;
        } else if (subMap.nodes && typeof subMap.nodes === 'object') {
          subNodes = Object.values(subMap.nodes);
        }

        subNodes.forEach(sNode => {
          const sNodeId = sNode.id;
          subEntry.nodes.push(sNode);
          result.allNodes.push({ mapId: subMap.id, nodeId: sNodeId });

          const sNpcs = campaignNpcs.filter(e => String(e.nodeId) === String(sNodeId));
          const sItems = campaignItems.filter(e => {
            const effNode = getItemEffectiveNodeId(e);
            return effNode != null && String(effNode) === String(sNodeId);
          });
          const sTrackers = campaignTrackers.filter(e => String(e.nodeId) === String(sNodeId));
          const sQuests = campaignQuests.filter(q => {
            if (String(q.nodeId) === String(sNodeId)) return true;
            if (Array.isArray(q.npcIds) && q.npcIds.some(nId => sNpcs.some(n => n.id === nId))) return true;
            if (Array.isArray(q.itemIds) && q.itemIds.some(iId => sItems.some(i => i.id === iId))) return true;
            return false;
          });

          sNpcs.forEach(n => subEntry.npcs.push({ ...n, _subMap: subMap, _subNode: sNode }));
          sItems.forEach(i => subEntry.items.push({ ...i, _subMap: subMap, _subNode: sNode }));
          sQuests.forEach(q => subEntry.quests.push({ ...q, _subMap: subMap, _subNode: sNode }));
          sTrackers.forEach(t => subEntry.trackers.push({ ...t, _subMap: subMap, _subNode: sNode }));

          // Check for deeper sub-submaps
          Object.keys(allMaps).forEach(nextMId => {
            const nextM = allMaps[nextMId];
            const isChildNext = (sNode.childMapId === nextM.id);
            const isAnchoredNext = (nextM.parentMapId === subMap.id && String(nextM.parentNodeId) === String(sNodeId));
            if (isChildNext || isAnchoredNext) {
              traverseSubmap(nextM, subEntry.path);
            }
          });
        });

        result.submaps.push(subEntry);
      }

      const rootName = (allMaps[targetMapId] && allMaps[targetMapId].name) || (topo.name || targetMapId);
      result.direct.submaps.forEach(dm => {
        traverseSubmap(dm, [rootName]);
      });

      let recNpcs = 0, recQuests = 0, recItems = 0, recTrackers = 0;
      result.submaps.forEach(sm => {
        recNpcs += sm.npcs.length;
        recQuests += sm.quests.length;
        recItems += sm.items.length;
        recTrackers += sm.trackers.length;
      });

      result.totals.npcs = result.direct.npcs.length + recNpcs;
      result.totals.quests = result.direct.quests.length + recQuests;
      result.totals.items = result.direct.items.length + recItems;
      result.totals.trackers = result.direct.trackers.length + recTrackers;
      result.totals.submaps = result.submaps.length;

      return result;
    }
    window.getRecursiveNodeEntities = getRecursiveNodeEntities;

    let _canvasRenderScheduled = false;
    function scheduleRenderCanvas() {
      if (_canvasRenderScheduled) return;
      _canvasRenderScheduled = true;
      requestAnimationFrame(() => {
        _canvasRenderScheduled = false;
        renderCanvas();
      });
    }
    window.scheduleRenderCanvas = scheduleRenderCanvas;

    // Resolve or fallback to proper SVG layer container group
    function getLayerContainer(layerId, defaultFallbackId = 'layer-drawings', topo = null) {
      const targetId = layerId || defaultFallbackId;
      const group = document.getElementById(`layer-group-${targetId}`);
      if (group) return group;
      if (targetId === 'layer-nodes') return document.getElementById('nodes-layer') || document.getElementById('cad-svg');
      if (targetId === 'layer-roads' || targetId === 'layer-hegemony') return document.getElementById('edges-layer') || document.getElementById('cad-svg');
      if (targetId === 'layer-annotations') return document.getElementById('corridor-labels-layer') || document.getElementById('cad-svg');
      return document.getElementById('drawings-layer') || document.getElementById('cad-svg');
    }
    window.getLayerContainer = getLayerContainer;

    // Render Main Canvas Elements (Edges & Nodes)
    function renderCanvas() {
      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) return;

      if (typeof ensureTopologyLayers === 'function') {
        ensureTopologyLayers(topo);
      }

      const cadSvg = document.getElementById('cad-svg');
      const interactionLayer = document.getElementById('interaction-layer');

      // Ensure dynamic layer groups exist and are ordered by zIndex ascending
      const topoLayers = (typeof getTopologyLayers === 'function')
        ? getTopologyLayers(topo)
        : [...(topo.layers || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

      if (cadSvg) {
        topoLayers.forEach(l => {
          let group = document.getElementById(`layer-group-${l.id}`);
          if (!group) {
            group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.id = `layer-group-${l.id}`;
            group.setAttribute('class', 'canvas-layer-group');
            group.setAttribute('data-layer-id', l.id);
            if (interactionLayer) {
              cadSvg.insertBefore(group, interactionLayer);
            } else {
              cadSvg.appendChild(group);
            }
          } else if (interactionLayer && group.nextSibling !== interactionLayer) {
            cadSvg.insertBefore(group, interactionLayer);
          }

          group.style.display = (l.visible === false) ? 'none' : '';
          group.setAttribute('opacity', String(l.opacity ?? 1.0));

          // Clear previous render elements (preserve background image if layer-bg)
          if (l.id !== 'layer-bg') {
            group.innerHTML = '';
          }
        });
      }

      const edgesLayer = document.getElementById('edges-layer');
      const nodesLayer = document.getElementById('nodes-layer');
      const corridorLabelsLayer = document.getElementById('corridor-labels-layer');
      if (edgesLayer) edgesLayer.innerHTML = '';
      if (nodesLayer) nodesLayer.innerHTML = '';
      if (corridorLabelsLayer) corridorLabelsLayer.innerHTML = '';

      const bgLayerObj = (typeof getLayerById === 'function') ? getLayerById('layer-bg', topo) : null;
      const isBgVisible = !bgLayerObj || bgLayerObj.visible !== false;
      const bgOpacityMultiplier = bgLayerObj ? (bgLayerObj.opacity ?? 1.0) : 1.0;

      const annotLayerObj = (typeof getLayerById === 'function') ? getLayerById('layer-annotations', topo) : null;
      const isAnnotLayerVisible = !annotLayerObj || annotLayerObj.visible !== false;
      const annotOpacity = annotLayerObj ? (annotLayerObj.opacity ?? 1.0) : 1.0;

      const roadsLayerObj = (typeof getLayerById === 'function') ? getLayerById('layer-roads', topo) : null;
      const isRoadsLayerVisible = !roadsLayerObj || roadsLayerObj.visible !== false;
      const roadsOpacityMultiplier = roadsLayerObj ? (roadsLayerObj.opacity ?? 1.0) : 1.0;

      const hegemLayerObj = (typeof getLayerById === 'function') ? getLayerById('layer-hegemony', topo) : null;
      const isHegemLayerVisible = !hegemLayerObj || hegemLayerObj.visible !== false;
      const hegemOpacityMultiplier = hegemLayerObj ? (hegemLayerObj.opacity ?? 1.0) : 1.0;

      // Render Background Map Image if available
      const bgImg = document.getElementById("canvas-bg-image");
      if (bgImg) {
        const imgSrc = (typeof activeMapMetadata !== "undefined" && activeMapMetadata)
          ? (activeMapMetadata.dataUrl || activeMapMetadata.url)
          : null;
        if (Workstation.showBgMap && isBgVisible && imgSrc) {
          bgImg.setAttribute("href", imgSrc);
          bgImg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imgSrc);
          bgImg.setAttribute("width", activeMapMetadata.width || 1920);
          bgImg.setAttribute("height", activeMapMetadata.height || 1080);
          bgImg.setAttribute("opacity", String((activeMapMetadata.opacity || 0.85) * bgOpacityMultiplier));
          bgImg.style.display = "block";
        } else {
          bgImg.setAttribute("href", "");
          bgImg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "");
          bgImg.style.display = "none";
        }
      }

      // Render CAD Drawings Layer
      const drawingsLayer = document.getElementById('drawings-layer');
      if (drawingsLayer) drawingsLayer.innerHTML = '';
      if (Array.isArray(topo.shapes)) {
        topo.shapes.forEach(shape => {
          const sLayerId = shape.layerId || 'layer-drawings';
          const sLayer = (typeof getLayerById === 'function') ? getLayerById(sLayerId, topo) : null;
          if ((sLayer && sLayer.visible === false) || shape.visible === false) return;
          const finalOpacity = (shape.opacity ?? 1.0) * (sLayer ? (sLayer.opacity ?? 1.0) : 1.0);
          const isSelected = (typeof isEntitySelected === 'function')
            ? isEntitySelected('shape', shape.id)
            : ((Workstation.selectedEntity && Workstation.selectedEntity.type === 'shape' && Workstation.selectedEntity.id === shape.id) ||
               (Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.some(e => e.type === 'shape' && e.id === shape.id)));
          const shapeEl = renderShapeSvgElement(shape, finalOpacity, isSelected, !!(sLayer && sLayer.locked));
          if (shapeEl) {
            const shapeTarget = getLayerContainer(sLayerId, 'layer-drawings', topo);
            shapeTarget.appendChild(shapeEl);
          }
        });
      }

      // 1. Render Edges (Transit Corridors & Hegemony Conduits)
      const renderedRoads = new Set();
      Object.keys(topo.nodes).forEach(uKey => {
        const u = topo.nodes[uKey];
        const uId = (isNaN(uKey) || String(uKey).includes('-')) ? uKey : parseInt(uKey);

        // Render Transit Roads (E_adj)
        if (u.adj) {
          u.adj.forEach(vId => {
            const pairKey = [String(uId), String(vId)].sort().join('-');
            if (!renderedRoads.has(pairKey)) {
              renderedRoads.add(pairKey);
              const v = topo.nodes[vId.toString()];
              if (v) {
                // Compound Layer Visibility Check:
                // 1. Endpoint U layer check
                const uLayerObj = (typeof getLayerById === 'function') ? getLayerById(u.layerId || 'layer-nodes', topo) : null;
                const isULayerVisible = !uLayerObj || uLayerObj.visible !== false;

                // 2. Endpoint V layer check
                const vLayerObj = (typeof getLayerById === 'function') ? getLayerById(v.layerId || 'layer-nodes', topo) : null;
                const isVLayerVisible = !vLayerObj || vLayerObj.visible !== false;

                // 3. Edge layer check
                const edgeRecord = topo.edgeData && topo.edgeData[pairKey];
                const edgeLayerId = (edgeRecord && edgeRecord.layerId) || 'layer-roads';
                const edgeLayerObj = (typeof getLayerById === 'function') ? getLayerById(edgeLayerId, topo) : null;
                const isEdgeLayerVisible = !edgeLayerObj || edgeLayerObj.visible !== false;

                // Suppress edge if either endpoint layer or edge layer is hidden
                if (!isULayerVisible || !isVLayerVisible || !isEdgeLayerVisible) {
                  return;
                }

                // Global HUD road visibility toggle
                if (!Workstation.showRoads) {
                  return;
                }

                // Fog-of-War Visibility Check
                const isUVisible = (u.visible !== false);
                const isVVisible = (v.visible !== false);
                const isEdgeExplicitHidden = !!(edgeRecord && edgeRecord.visible === false);
                const isRoadHidden = !isUVisible || !isVVisible || isEdgeExplicitHidden;

                if (isRoadHidden && !Workstation.showGmVision) {
                  return; // Completely suppress hidden road in Player View
                }

                const isSelected = (typeof isEntitySelected === 'function')
                  ? isEntitySelected('edge', pairKey, { pair: pairKey, edgeKey: pairKey })
                  : (Workstation.selectedEntity && Workstation.selectedEntity.type === 'edge' && Workstation.selectedEntity.pair === pairKey);
                const isDimmed = Workstation.activeLayerFocus === 'hegemony';

                const handleRoadSelect = (e) => {
                  if (e.button !== 0 && e.type === 'mousedown') return;
                  e.stopPropagation();
                  e.preventDefault();
                  selectEdge('road', uId, vId, e);
                };

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', u.x);
                line.setAttribute('y1', u.y);
                line.setAttribute('x2', v.x);
                line.setAttribute('y2', v.y);
                line.setAttribute('class', 'canvas-edge canvas-edge-road');
                line.setAttribute('stroke', isSelected ? '#f43f5e' : (isRoadHidden ? '#94a3b8' : (isDimmed ? '#334155' : '#3b82f6')));
                line.setAttribute('stroke-width', isSelected ? '4' : '2.5');
                line.style.cursor = 'pointer';
                if (isRoadHidden) {
                  line.setAttribute('stroke-dasharray', '5,5');
                  line.setAttribute('opacity', String(0.38 * roadsOpacityMultiplier));
                } else if (isDimmed) {
                  line.setAttribute('opacity', String(0.2 * roadsOpacityMultiplier));
                } else {
                  line.setAttribute('opacity', String(1.0 * roadsOpacityMultiplier));
                  line.setAttribute('marker-start', 'url(#arrow-twoway-start)');
                  line.setAttribute('marker-end', 'url(#arrow-twoway-end)');
                }
                line.addEventListener('mousedown', handleRoadSelect);
                line.addEventListener('click', handleRoadSelect);

                const roadTargetContainer = getLayerContainer(edgeLayerId, 'layer-roads', topo);
                roadTargetContainer.appendChild(line);

                // Transparent 16px hitbox for click precision
                const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                hitbox.setAttribute('x1', u.x);
                hitbox.setAttribute('y1', u.y);
                hitbox.setAttribute('x2', v.x);
                hitbox.setAttribute('y2', v.y);
                hitbox.setAttribute('stroke', 'transparent');
                hitbox.setAttribute('stroke-width', '16');
                hitbox.setAttribute('pointer-events', 'stroke');
                hitbox.style.cursor = 'pointer';
                hitbox.addEventListener('mousedown', handleRoadSelect);
                hitbox.addEventListener('click', handleRoadSelect);
                roadTargetContainer.appendChild(hitbox);

                // Corridor module telemetry badge, dedicated flows, or custom name
                if (Workstation.showCorridorLabels !== false && isAnnotLayerVisible) {
                  const edgeMods = (typeof edgeSlottedModules !== "undefined" && edgeSlottedModules[pairKey]) || (topo.edgeData && topo.edgeData[pairKey] && topo.edgeData[pairKey].modules) || [];
                  const edgeFlows = (topo.edgeData && topo.edgeData[pairKey] && Array.isArray(topo.edgeData[pairKey].dedicatedFlows)) ? topo.edgeData[pairKey].dedicatedFlows : [];
                  const edgeName = (topo.edgeData && topo.edgeData[pairKey] && topo.edgeData[pairKey].name) || '';
                  if (edgeMods.length > 0 || edgeFlows.length > 0 || edgeName) {
                    const midX = Math.round((u.x + v.x) / 2);
                    const midY = Math.round((u.y + v.y) / 2);
                    const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    badgeG.setAttribute('transform', `translate(${midX}, ${midY})`);
                    badgeG.setAttribute('opacity', String(annotOpacity));
                    badgeG.style.cursor = 'pointer';
                    badgeG.addEventListener('mousedown', handleRoadSelect);
                    badgeG.addEventListener('click', handleRoadSelect);

                    const metaTags = [];
                    if (edgeMods.length > 0) metaTags.push(`M:${edgeMods.length}`);
                    if (edgeFlows.length > 0) metaTags.push(`F:${edgeFlows.length}`);
                    const metaSuffix = metaTags.length > 0 ? (edgeName ? ` (${metaTags.join(' ')})` : metaTags.join(' ')) : '';
                    const labelText = `${edgeName}${metaSuffix}`;
                    const bgWidth = Math.max(32, labelText.length * 6 + 10);
                    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    bgRect.setAttribute('x', -bgWidth / 2);
                    bgRect.setAttribute('y', -7);
                    bgRect.setAttribute('width', bgWidth);
                    bgRect.setAttribute('height', 14);
                    bgRect.setAttribute('rx', 3);
                    bgRect.setAttribute('fill', isSelected ? '#be123c' : '#1e3a8a');
                    bgRect.setAttribute('stroke', isSelected ? '#ffe4e6' : '#93c5fd');
                    bgRect.setAttribute('stroke-width', '1');
                    badgeG.appendChild(bgRect);

                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', 0);
                    text.setAttribute('y', 3.5);
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('font-family', 'var(--font-stack)');
                    text.setAttribute('font-size', '8px');
                    text.setAttribute('font-weight', 'bold');
                    text.setAttribute('fill', '#ffffff');
                    text.setAttribute('pointer-events', 'none');
                    text.textContent = labelText;
                    badgeG.appendChild(text);

                    const annotContainer = getLayerContainer('layer-annotations', 'layer-annotations', topo);
                    annotContainer.appendChild(badgeG);
                  }
                }
              }
            }
          });
        }

        // Render Hegemony Influence Vectors (E_inf) with curved Bézier arcs
        if (u.infBy) {
          u.infBy.forEach(vId => {
            const v = topo.nodes[vId.toString()];
            if (v) {
              const edgeKey = `${vId}->${uId}`;
              const pairKey = [String(uId), String(vId)].sort().join('-');

              // Compound Layer Visibility Check:
              const uLayerObj = (typeof getLayerById === 'function') ? getLayerById(u.layerId || 'layer-nodes', topo) : null;
              const isULayerVisible = !uLayerObj || uLayerObj.visible !== false;
              const vLayerObj = (typeof getLayerById === 'function') ? getLayerById(v.layerId || 'layer-nodes', topo) : null;
              const isVLayerVisible = !vLayerObj || vLayerObj.visible !== false;

              const edgeRecord = topo.edgeData && (topo.edgeData[edgeKey] || topo.edgeData[pairKey]);
              const edgeLayerId = (edgeRecord && edgeRecord.layerId) || 'layer-hegemony';
              const edgeLayerObj = (typeof getLayerById === 'function') ? getLayerById(edgeLayerId, topo) : null;
              const isEdgeLayerVisible = !edgeLayerObj || edgeLayerObj.visible !== false;

              // Suppress conduit if either endpoint layer or edge layer is hidden
              if (!isULayerVisible || !isVLayerVisible || !isEdgeLayerVisible) {
                return;
              }

              // Global HUD influence visibility toggle
              if (!Workstation.showInfluence) {
                return;
              }

              // Fog-of-War Visibility Check
              const isUVisible = (u.visible !== false);
              const isVVisible = (v.visible !== false);
              const edgeRecordVisible = !!(edgeRecord && edgeRecord.visible === false);
              const isVecHidden = !isUVisible || !isVVisible || edgeRecordVisible;

              if (isVecHidden && !Workstation.showGmVision) {
                return; // Suppress in Player View
              }

              const isSelected = (typeof isEntitySelected === 'function')
                ? isEntitySelected('edge', edgeKey, { edgeKey, edgeType: 'hegemony', uId: vId, vId: uId })
                : (Workstation.selectedEntity && Workstation.selectedEntity.type === 'edge' && (Workstation.selectedEntity.edgeKey === edgeKey || (Workstation.selectedEntity.edgeType === 'hegemony' && Workstation.selectedEntity.uId == vId && Workstation.selectedEntity.vId == uId)));
              const isDimmed = Workstation.activeLayerFocus === 'roads';

              const curve = (typeof computeCorridorCurve === "function")
                ? computeCorridorCurve(v.x, v.y, u.x, u.y, 26)
                : { ctrlX: Math.round((v.x + u.x)/2), ctrlY: Math.round((v.y + u.y)/2 - 24) };

              const handleHegemonySelect = (e) => {
                if (e.button !== 0 && e.type === 'mousedown') return;
                e.stopPropagation();
                e.preventDefault();
                selectEdge('hegemony', vId, uId, e);
              };

              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.setAttribute('d', `M ${v.x} ${v.y} Q ${curve.ctrlX} ${curve.ctrlY} ${u.x} ${u.y}`);
              path.setAttribute('class', 'canvas-edge canvas-edge-hegemony');
              path.setAttribute('fill', 'none');
              path.setAttribute('stroke', isSelected ? '#f43f5e' : (isVecHidden ? '#94a3b8' : (isDimmed ? '#312e81' : '#8b5cf6')));
              path.setAttribute('stroke-width', isSelected ? '3.5' : '2');
              path.setAttribute('stroke-dasharray', isVecHidden ? '3,3' : (isDimmed ? '2,4' : '5,4'));
              path.style.cursor = 'pointer';
              if (isVecHidden) {
                path.setAttribute('opacity', String(0.35 * hegemOpacityMultiplier));
              } else if (isDimmed) {
                path.setAttribute('opacity', String(0.25 * hegemOpacityMultiplier));
              } else {
                path.setAttribute('opacity', String(1.0 * hegemOpacityMultiplier));
                path.setAttribute('marker-end', 'url(#arrow-hegemony)');
              }
              path.addEventListener('mousedown', handleHegemonySelect);
              path.addEventListener('click', handleHegemonySelect);

              const hegemTargetContainer = getLayerContainer(edgeLayerId, 'layer-hegemony', topo);
              hegemTargetContainer.appendChild(path);

              // Transparent hitbox
              const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              hitbox.setAttribute('d', `M ${v.x} ${v.y} Q ${curve.ctrlX} ${curve.ctrlY} ${u.x} ${u.y}`);
              hitbox.setAttribute('fill', 'none');
              hitbox.setAttribute('stroke', 'transparent');
              hitbox.setAttribute('stroke-width', '16');
              hitbox.setAttribute('pointer-events', 'stroke');
              hitbox.style.cursor = 'pointer';
              hitbox.addEventListener('mousedown', handleHegemonySelect);
              hitbox.addEventListener('click', handleHegemonySelect);
              hegemTargetContainer.appendChild(hitbox);

              // Hegemony vector label / module / dedicated flow badge
              if (Workstation.showCorridorLabels !== false && isAnnotLayerVisible) {
                const vecRec = topo.edgeData && (topo.edgeData[edgeKey] || topo.edgeData[pairKey]);
                const vecMods = (typeof edgeSlottedModules !== "undefined" && (edgeSlottedModules[edgeKey] || edgeSlottedModules[pairKey])) || (vecRec && vecRec.modules) || [];
                const vecFlows = (vecRec && Array.isArray(vecRec.dedicatedFlows)) ? vecRec.dedicatedFlows : [];
                const vecName = (vecRec && vecRec.name) || '';
                if (vecMods.length > 0 || vecFlows.length > 0 || vecName) {
                  const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                  badgeG.setAttribute('transform', `translate(${curve.ctrlX}, ${curve.ctrlY})`);
                  badgeG.setAttribute('opacity', String(annotOpacity));
                  badgeG.style.cursor = 'pointer';
                  badgeG.addEventListener('mousedown', handleHegemonySelect);
                  badgeG.addEventListener('click', handleHegemonySelect);

                  const metaTags = [];
                  if (vecMods.length > 0) metaTags.push(`M:${vecMods.length}`);
                  if (vecFlows.length > 0) metaTags.push(`F:${vecFlows.length}`);
                  const metaSuffix = metaTags.length > 0 ? (vecName ? ` (${metaTags.join(' ')})` : metaTags.join(' ')) : '';
                  const labelText = `${vecName}${metaSuffix}`;
                  const bgWidth = Math.max(32, labelText.length * 6 + 10);
                  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                  bgRect.setAttribute('x', -bgWidth / 2);
                  bgRect.setAttribute('y', -7);
                  bgRect.setAttribute('width', bgWidth);
                  bgRect.setAttribute('height', 14);
                  bgRect.setAttribute('rx', 3);
                  bgRect.setAttribute('fill', isSelected ? '#be123c' : '#581c87');
                  bgRect.setAttribute('stroke', isSelected ? '#ffe4e6' : '#d8b4fe');
                  bgRect.setAttribute('stroke-width', '1');
                  badgeG.appendChild(bgRect);

                  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                  text.setAttribute('x', 0);
                  text.setAttribute('y', 3.5);
                  text.setAttribute('text-anchor', 'middle');
                  text.setAttribute('font-family', 'var(--font-stack)');
                  text.setAttribute('font-size', '8px');
                  text.setAttribute('font-weight', 'bold');
                  text.setAttribute('fill', '#ffffff');
                  text.setAttribute('pointer-events', 'none');
                  text.textContent = labelText;
                  badgeG.appendChild(text);

                  const annotContainer = getLayerContainer('layer-annotations', 'layer-annotations', topo);
                  annotContainer.appendChild(badgeG);
                }
              }
            }
          });
        }
      });

      // 2. Render Nodes
      Object.keys(topo.nodes).forEach(nodeKey => {
        const node = topo.nodes[nodeKey];
        const nodeId = (isNaN(nodeKey) || String(nodeKey).includes('-')) ? nodeKey : parseInt(nodeKey);

        const nodeLayerId = node.layerId || 'layer-nodes';
        const nodeLayerObj = (typeof getLayerById === 'function') ? getLayerById(nodeLayerId, topo) : null;
        const isNodeLayerVisible = !nodeLayerObj || nodeLayerObj.visible !== false;
        if (!isNodeLayerVisible) {
          return; // Suppress node if layer is hidden
        }
        const nodeLayerOpacity = nodeLayerObj ? (nodeLayerObj.opacity ?? 1.0) : 1.0;

        // Fog-of-War Visibility Check
        const isNodeHidden = (node.visible === false);
        if (isNodeHidden && !Workstation.showGmVision) {
          return; // Suppress hidden node in Player View
        }

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        const isNodeSelected = (typeof isEntitySelected === 'function')
          ? isEntitySelected('node', nodeId)
          : (Workstation.selectedEntity && Workstation.selectedEntity.type === 'node' && String(Workstation.selectedEntity.id) === String(nodeId));
        if (isNodeSelected) {
          g.classList.add('selected');
        }
        g.setAttribute('opacity', String((isNodeHidden ? 0.45 : 1.0) * nodeLayerOpacity));

        // Node Shape & Diameter Styling
        const shapeType = node.shape || 'circle';
        const r = node.radius || (node.tier === 0 ? 22 : (node.tier === 3 ? 15 : 18));

        // Color coding by AutoCAD Index Color (ACI) or Cultural Quadrant / Tier
        let fill = '#334155';
        let stroke = '#94a3b8';
        let textColor = '#ffffff';

        if (node.color) {
          fill = node.color;
          const match = AUTOCAD_COLORS.find(c => (c.val || '').toLowerCase() === (node.color || '').toLowerCase());
          stroke = match ? match.stroke : '#ffffff';
          const cLower = (node.color || '').toLowerCase();
          if (cLower === '#ffffff' || cLower === '#ffff00' || cLower === '#00ffff' || cLower === '#c0c0c0') {
            textColor = '#000000';
          }
        } else if (node.tier === 0) { fill = '#7e22ce'; stroke = '#c084fc'; }
        else if (node.tier === 3) { fill = '#991b1b'; stroke = '#f87171'; }
        else {
          if (node.culture === 'Clan') { fill = '#166534'; stroke = '#4ade80'; }
          else if (node.culture === 'Adhocracy') { fill = '#9a3412'; stroke = '#fb923c'; }
          else if (node.culture === 'Market') { fill = '#854d0e'; stroke = '#facc15'; }
          else if (node.culture === 'Hierarchy') { fill = '#1e40af'; stroke = '#60a5fa'; }
        }

        // Check if any active tracker on this node has triggered crisis (max ticks or Level 4)
        const nodeTrackers = (Workstation.activeTopology.trackers || []).filter(t => String(t.nodeId) === String(nodeId));
        const hasCrisis = nodeTrackers.some(t => {
          const cur = t.currentTicks || 0;
          const max = t.maxTicks || (t.type === 'Output Dial' ? 4 : 6);
          return cur >= max;
        });

        // Dynamic SVG Shape Creation
        let shapeEl;
        if (shapeType === 'square') {
          shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          shapeEl.setAttribute('x', -r);
          shapeEl.setAttribute('y', -r);
          shapeEl.setAttribute('width', r * 2);
          shapeEl.setAttribute('height', r * 2);
          shapeEl.setAttribute('rx', 3);
        } else if (shapeType === 'triangle') {
          shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          const topY = -Math.round(r * 1.25);
          const botY = Math.round(r * 0.85);
          const sideX = Math.round(r * 1.15);
          shapeEl.setAttribute('points', `0,${topY} ${sideX},${botY} ${-sideX},${botY}`);
        } else if (shapeType === 'diamond') {
          shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          const ext = Math.round(r * 1.25);
          shapeEl.setAttribute('points', `0,${-ext} ${ext},0 0,${ext} ${-ext},0`);
        } else if (shapeType === 'star') {
          shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          shapeEl.setAttribute('points', computeStarPoints(0, 0, 5, Math.round(r * 1.35), Math.round(r * 0.55)));
        } else if (shapeType === 'oval') {
          shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          shapeEl.setAttribute('rx', Math.round(r * 1.35));
          shapeEl.setAttribute('ry', Math.round(r * 0.95));
        } else if (shapeType === 'pentagon') {
          shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          shapeEl.setAttribute('points', computePolygonPoints(0, 0, 5, Math.round(r * 1.2)));
        } else {
          // Default: Circle
          shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          shapeEl.setAttribute('r', r);
        }

        shapeEl.setAttribute('class', 'node-circle node-shape');
        shapeEl.setAttribute('fill', fill);
        shapeEl.setAttribute('stroke', stroke);

        if (isNodeHidden) {
          shapeEl.setAttribute('stroke-dasharray', '3,3');
        }

        if (hasCrisis) {
          shapeEl.classList.add('node-hazard-pulse');
        }

        g.appendChild(shapeEl);

        // Fog-of-War Hidden Icon Badge (👁️‍🗨️)
        if (isNodeHidden) {
          const hiddenBadge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          hiddenBadge.setAttribute('x', r + 6);
          hiddenBadge.setAttribute('y', -r + 2);
          hiddenBadge.setAttribute('font-size', '10px');
          hiddenBadge.setAttribute('pointer-events', 'none');
          hiddenBadge.textContent = '👁️‍🗨️';
          hiddenBadge.setAttribute('title', 'Hidden from players (Fog of War)');
          g.appendChild(hiddenBadge);
        }

        // Portals: If node has childMapId, render concentric cyan portal ring and portal badge
        if (node.childMapId) {
          const portalHalo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          portalHalo.setAttribute('r', r + 6);
          portalHalo.setAttribute('fill', 'none');
          portalHalo.setAttribute('stroke', '#06b6d4');
          portalHalo.setAttribute('stroke-width', '2');
          portalHalo.setAttribute('stroke-dasharray', '4,2');
          portalHalo.setAttribute('class', 'node-portal-ring');
          g.appendChild(portalHalo);

          const portalBadge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          portalBadge.setAttribute('x', -r - 8);
          portalBadge.setAttribute('y', -r + 2);
          portalBadge.setAttribute('font-size', '11px');
          portalBadge.setAttribute('class', 'portal-badge');
          portalBadge.setAttribute('cursor', 'pointer');
          portalBadge.textContent = '🌀';
          portalBadge.setAttribute('title', 'Double-click or click to descend into child sub-map');
          portalBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof switchActiveMap === 'function') switchActiveMap(node.childMapId);
          });
          g.appendChild(portalBadge);
        }

        // Position Lock Visual Badge (🔒)
        if (node.locked) {
          const lockBadge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lockBadge.setAttribute('x', -r - 8);
          lockBadge.setAttribute('y', r + 8);
          lockBadge.setAttribute('font-size', '10px');
          lockBadge.setAttribute('pointer-events', 'none');
          lockBadge.textContent = '🔒';
          g.appendChild(lockBadge);
        }

        // Node ID Badge
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badge.setAttribute('y', 3);
        badge.setAttribute('class', 'node-badge');
        badge.setAttribute('fill', textColor);
        const displayId = (node.id !== undefined && node.id !== null) ? node.id.toString() : nodeId.toString();
        badge.textContent = displayId;
        if (displayId.length >= 4) {
          badge.setAttribute('font-size', '8px');
        } else if (displayId.length === 3) {
          badge.setAttribute('font-size', '9px');
        }
        g.appendChild(badge);

        // Node Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('y', r + 13);
        label.setAttribute('class', 'node-label');
        label.textContent = node.name || (displayId.startsWith('Node') ? displayId : `Node ${displayId}`);
        g.appendChild(label);

        // Dynamic Mod Canvas Node Overlay Hook
        Object.keys(Workstation.registeredMods || {}).forEach(modId => {
          const mod = Workstation.registeredMods[modId];
          if (typeof mod.renderCanvasNode === 'function') {
            try {
              mod.renderCanvasNode(g, {
                node,
                nodeId,
                r,
                topo,
                Workstation
              });
            } catch (err) {
              console.error(`[Mod ${modId}] renderCanvasNode error:`, err);
            }
          }
        });

        // Node Narrative Entity Telemetry Badge (NPCs, Quests, Items, Trackers - Direct + Recursive Sub-Maps)
        const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
        const rec = getRecursiveNodeEntities(nodeId, curMapId);
        const directNpc = rec.direct.npcs.length;
        const totalNpc = rec.totals.npcs;
        const directQuest = rec.direct.quests.length;
        const totalQuest = rec.totals.quests;
        const directItem = rec.direct.items.length;
        const totalItem = rec.totals.items;
        const directTracker = rec.direct.trackers.length;
        const totalTracker = rec.totals.trackers;
        const submapCount = rec.totals.submaps;
        const nodeModCount = (node.modules && Array.isArray(node.modules)) ? node.modules.length : 0;
        const nodeProvidesCount = (node.provides && Array.isArray(node.provides)) ? node.provides.length : 0;
        const nodeRequiresCount = (node.requires && Array.isArray(node.requires)) ? node.requires.length : 0;
        const adHocSupplyCheck = (nodeRequiresCount > 0 && typeof checkNodeAdHocSupplyLine === 'function')
          ? checkNodeAdHocSupplyLine(nodeId)
          : { ok: true, missing: [] };

        if (nodeModCount > 0 || nodeProvidesCount > 0 || nodeRequiresCount > 0 || totalNpc > 0 || totalQuest > 0 || totalItem > 0 || totalTracker > 0 || submapCount > 0) {
          const parts = [];
          if (nodeModCount > 0) parts.push(`M:${nodeModCount}`);
          if (nodeProvidesCount > 0) parts.push(`P:${nodeProvidesCount}`);
          if (nodeRequiresCount > 0) parts.push(adHocSupplyCheck.ok ? `R:${nodeRequiresCount}` : `⚠️R:${adHocSupplyCheck.missing.length}`);
          if (totalNpc > 0) parts.push(`N:${totalNpc}${submapCount > 0 && directNpc !== totalNpc ? '*' : ''}`);
          if (totalQuest > 0) parts.push(`Q:${totalQuest}`);
          if (totalItem > 0) parts.push(`I:${totalItem}`);
          if (totalTracker > 0) parts.push(`T:${totalTracker}`);
          if (submapCount > 0) parts.push(`🌀${submapCount}`);
          const badgeStr = parts.join(' ');
          const badgeWidth = Math.max(48, badgeStr.length * 5.8 + 6);

          const entBadgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          entBadgeBg.setAttribute('x', -badgeWidth / 2);
          entBadgeBg.setAttribute('y', -r - 13);
          entBadgeBg.setAttribute('width', badgeWidth);
          entBadgeBg.setAttribute('height', 11);
          entBadgeBg.setAttribute('rx', 2);
          entBadgeBg.setAttribute('fill', nodeModCount > 0 ? '#1e3a8a' : (submapCount > 0 ? '#0f766e' : '#000080'));
          entBadgeBg.setAttribute('stroke', '#ffffff');
          entBadgeBg.setAttribute('stroke-width', '1');
          g.appendChild(entBadgeBg);

          const entBadgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          entBadgeText.setAttribute('x', 0);
          entBadgeText.setAttribute('y', -r - 4);
          entBadgeText.setAttribute('font-family', 'var(--font-stack)');
          entBadgeText.setAttribute('font-size', '8px');
          entBadgeText.setAttribute('font-weight', 'bold');
          entBadgeText.setAttribute('fill', '#ffffff');
          entBadgeText.setAttribute('text-anchor', 'middle');
          entBadgeText.setAttribute('pointer-events', 'none');
          entBadgeText.textContent = badgeStr;
          g.appendChild(entBadgeText);
        }

        // Render Live Threat Clocks & Severity Dials Spatial Canvas Overlays (if showClocks is enabled)
        const visibleTrackers = (Workstation.showClocks !== false && isAnnotLayerVisible)
          ? nodeTrackers.filter(t => t.showOnCanvas !== false)
          : [];
        if (visibleTrackers.length > 0) {
          visibleTrackers.forEach((t, idx) => {
            const curTicks = t.currentTicks || 0;
            const maxTicks = t.maxTicks || (t.type === 'Output Dial' ? 4 : 6);
            const isTriggered = curTicks >= maxTicks;
            const isDial = t.type === 'Output Dial';

            const defaultY = -r - 28 - (idx * 28);
            const offX = (t.offsetX !== undefined && t.offsetX !== null) ? t.offsetX : 0;
            const offY = (t.offsetY !== undefined && t.offsetY !== null) ? t.offsetY : defaultY;

            const calloutG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            calloutG.setAttribute('class', isTriggered ? 'canvas-clock-callout threat-clock-breached' : 'canvas-clock-callout');
            calloutG.setAttribute('transform', `translate(${offX}, ${offY})`);
            calloutG.setAttribute('opacity', String(annotOpacity));
            calloutG.setAttribute('data-tracker-id', t.id);

            const rawTitle = t.name || t.title || 'Threat Clock';
            const truncTitle = rawTitle.length > 18 ? rawTitle.substring(0, 16) + '..' : rawTitle;

            const segWidth = 9;
            const segHeight = 7;
            const segGap = 2;
            const segsTotalWidth = (maxTicks * segWidth) + ((maxTicks - 1) * segGap);
            const calloutWidth = Math.max(88, Math.max(truncTitle.length * 5.4 + 16, segsTotalWidth + 20));
            const calloutHeight = 24;

            // Connector line to node center if callout has been dragged away
            if (Math.abs(offX) > 25 || Math.abs(offY - defaultY) > 20) {
              const connLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              connLine.setAttribute('x1', 0);
              connLine.setAttribute('y1', calloutHeight / 2);
              connLine.setAttribute('x2', -offX);
              connLine.setAttribute('y2', -offY);
              connLine.setAttribute('stroke', isTriggered ? '#ef4444' : '#94a3b8');
              connLine.setAttribute('stroke-width', '1');
              connLine.setAttribute('stroke-dasharray', '2,2');
              connLine.setAttribute('pointer-events', 'none');
              calloutG.appendChild(connLine);
            }

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', -calloutWidth / 2);
            rect.setAttribute('y', -calloutHeight / 2);
            rect.setAttribute('width', calloutWidth);
            rect.setAttribute('height', calloutHeight);
            rect.setAttribute('rx', 2);
            rect.setAttribute('fill', isTriggered ? '#fee2e2' : '#ffffff');
            rect.setAttribute('stroke', isTriggered ? '#dc2626' : (isDial ? '#059669' : '#000080'));
            rect.setAttribute('stroke-width', isTriggered ? '2' : '1.2');
            calloutG.appendChild(rect);

            const textTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textTitle.setAttribute('x', 0);
            textTitle.setAttribute('y', -3);
            textTitle.setAttribute('font-family', 'var(--font-stack)');
            textTitle.setAttribute('font-size', '7.5px');
            textTitle.setAttribute('font-weight', 'bold');
            textTitle.setAttribute('fill', isTriggered ? '#991b1b' : '#1e293b');
            textTitle.setAttribute('text-anchor', 'middle');
            textTitle.setAttribute('pointer-events', 'none');
            textTitle.textContent = truncTitle;
            calloutG.appendChild(textTitle);

            // Interactive Threat Clock Segments
            const segGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const startX = -segsTotalWidth / 2;
            const segY = 1;
            for (let k = 0; k < maxTicks; k++) {
              const isFilled = k < curTicks;
              const segRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              segRect.setAttribute('class', 'threat-tick-segment');
              segRect.setAttribute('data-clock-id', t.id);
              segRect.setAttribute('data-segment-idx', String(k));
              segRect.setAttribute('x', String(startX + (k * (segWidth + segGap))));
              segRect.setAttribute('y', String(segY));
              segRect.setAttribute('width', String(segWidth));
              segRect.setAttribute('height', String(segHeight));
              segRect.setAttribute('rx', '1');
              segRect.setAttribute('fill', isFilled ? (isTriggered ? '#dc2626' : (isDial ? '#059669' : '#ef4444')) : '#ffffff');
              segRect.setAttribute('stroke', isTriggered ? '#991b1b' : (isDial ? '#047857' : '#64748b'));
              segRect.setAttribute('stroke-width', '1');
              segRect.setAttribute('style', 'cursor: pointer;');
              const segmentTitle = isDial ? `Dial Level ${k + 1}/4` : `Threat Tick ${k + 1}/${maxTicks}`;
              segRect.setAttribute('title', segmentTitle);

              segRect.addEventListener('mousedown', (e) => {
                if (e.button === 0) e.stopPropagation();
              });
              segRect.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof handleClockSegmentClick === 'function') {
                  handleClockSegmentClick(e, t.id, k);
                }
              });
              segGroup.appendChild(segRect);
            }
            calloutG.appendChild(segGroup);

            // Click to inspect tracker (header / empty space)
            calloutG.addEventListener('click', (e) => {
              if (e.target && e.target.classList && e.target.classList.contains('threat-tick-segment')) return;
              e.stopPropagation();
              openEntityManager('tracker');
              selectEntityItem(t.id, false);
            });

            // Drag to reposition callout offset
            calloutG.addEventListener('mousedown', (e) => {
              if (e.target && e.target.classList && e.target.classList.contains('threat-tick-segment')) return;
              if (e.button !== 0) return;
              e.stopPropagation();
              onClockCalloutMouseDown(e, t, nodeId);
            });

            g.appendChild(calloutG);
          });
        }

        // Interaction Binding
        g.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          onNodeMouseDown(e, nodeId);
        });

        // Double click on node to navigate into child sub-map if attached
        g.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          if (node.childMapId && typeof switchActiveMap === 'function') {
            switchActiveMap(node.childMapId);
          } else {
            openNewSubMapPrompt();
          }
        });

        const nodeTargetContainer = getLayerContainer(nodeLayerId, 'layer-nodes', topo);
        nodeTargetContainer.appendChild(g);
      });

      // Update Breadcrumbs HUD
      if (typeof updateBreadcrumbsHUD === 'function') {
        updateBreadcrumbsHUD();
      }
    }
    function toggleGrid() {
      Workstation.showGrid = !Workstation.showGrid;
      renderGrid();
      setStatusBarMessage(`Grid lines ${Workstation.showGrid ? 'enabled' : 'disabled'}.`);
    }

    function toggleInfluenceVectors() {
      Workstation.showInfluence = !Workstation.showInfluence;
      renderCanvas();
      setStatusBarMessage(`Hegemony vectors ${Workstation.showInfluence ? 'visible' : 'hidden'}.`);
    }

// Exported globals
window.computeStarPoints = computeStarPoints;
window.computePolygonPoints = computePolygonPoints;
window.renderGrid = renderGrid;
window.AUTOCAD_COLORS = AUTOCAD_COLORS;
window.toggleGmVision = toggleGmVision;
window.lockAllNodes = lockAllNodes;
window.getItemEffectiveNodeId = getItemEffectiveNodeId;
window.getRecursiveNodeEntities = getRecursiveNodeEntities;
window.scheduleRenderCanvas = scheduleRenderCanvas;
window.renderCanvas = renderCanvas;
window.toggleGrid = toggleGrid;
window.toggleInfluenceVectors = toggleInfluenceVectors;