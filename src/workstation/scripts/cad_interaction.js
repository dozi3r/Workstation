// CAD Canvas Interaction & Tool Gestures
    // Set Active CAD Tool
    function setTool(toolName) {
      Workstation.activeTool = toolName;
      document.querySelectorAll('.palette-tool-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(`tool-${toolName}`);
      if (activeBtn) activeBtn.classList.add('active');

      document.getElementById('sb-tool').textContent = `Tool: ${toolName.toUpperCase()} [${getToolKey(toolName)}]`;
      const container = document.getElementById('canvas-container');
      if (container && !Workstation.isPanning) {
        if (toolName === 'pan') container.style.cursor = 'grab';
        else if (['rect', 'circle', 'line'].includes(toolName)) container.style.cursor = 'crosshair';
        else container.style.cursor = 'crosshair';
      }

      if (toolName === 'move') {
        setStatusBarMessage(`Move Tool: Click any node to select and move it, or enter coordinates in Properties.`);
      } else if (toolName === 'rect') {
        setStatusBarMessage(`Box Tool [R]: Click and drag on canvas to draw a vector rectangle / zone.`);
      } else if (toolName === 'circle') {
        setStatusBarMessage(`Circle Tool [C]: Click and drag on canvas to draw a vector circle / perimeter.`);
      } else if (toolName === 'line') {
        setStatusBarMessage(`Line Tool [W]: Click and drag on canvas to draw a vector line / corridor.`);
      } else {
        setStatusBarMessage(`Switched to tool: ${toolName.toUpperCase()}`);
      }
    }

    function getToolKey(name) {
      const map = { 'select':'V', 'pan':'H', 'move':'M', 'node-t2':'N', 'node-t3':'A', 'road':'L', 'hegemony':'I', 'rect':'R', 'circle':'C', 'line':'W', 'erase':'E' };
      return map[name] || '';
    }

    // Draggable Threat Clock Overlay Callouts
    let draggingClock = null;
    function onClockCalloutMouseDown(e, tracker, nodeId) {
      if (e.button === 1 || Workstation.isSpaceDown) {
        e.preventDefault();
        e.stopPropagation();
        Workstation.isPanning = true;
        Workstation.isMiddleMousePanning = (e.button === 1);
        Workstation.dragStart = { x: e.clientX, y: e.clientY };
        const container = document.getElementById('canvas-container');
        if (container) container.style.cursor = 'grabbing';
        return;
      }

      const topo = Workstation.activeTopology;
      const node = topo.nodes[nodeId.toString()];
      if (!node) return;

      const r = node.tier === 0 ? 22 : (node.tier === 3 ? 15 : 18);
      const defaultY = -r - 28;

      draggingClock = {
        tracker: tracker,
        startX: e.clientX,
        startY: e.clientY,
        initialOffsetX: tracker.offsetX !== undefined ? tracker.offsetX : 0,
        initialOffsetY: tracker.offsetY !== undefined ? tracker.offsetY : defaultY
      };

      const onMouseMove = (ev) => {
        if (!draggingClock) return;
        const dx = (ev.clientX - draggingClock.startX) / Workstation.zoom;
        const dy = (ev.clientY - draggingClock.startY) / Workstation.zoom;
        draggingClock.tracker.offsetX = Math.round(draggingClock.initialOffsetX + dx);
        draggingClock.tracker.offsetY = Math.round(draggingClock.initialOffsetY + dy);
        scheduleRenderCanvas();
      };

      const onMouseUp = () => {
        if (draggingClock) {
          saveActiveCampaign();
          draggingClock = null;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    // Interactive Threat Clock Segment Ticking Engine
    function handleClockSegmentClick(e, trackerId, segmentIdx) {
      if (e) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.preventDefault === 'function') e.preventDefault();
      }
      const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
      if (!topo || !Array.isArray(topo.trackers)) return;
      const tracker = topo.trackers.find(t => String(t.id) === String(trackerId));
      if (!tracker) return;

      const maxTicks = tracker.maxTicks || (tracker.type === 'Output Dial' ? 4 : 6);
      const curTicks = tracker.currentTicks || 0;

      let newTicks;
      if (segmentIdx === curTicks - 1) {
        // Clicking active tip decrements / unticks by 1
        newTicks = Math.max(0, curTicks - 1);
      } else if (segmentIdx >= curTicks) {
        // Ticking forward
        newTicks = Math.min(maxTicks, segmentIdx + 1);
      } else {
        // Clicking lower segment sets to that level
        newTicks = Math.min(maxTicks, segmentIdx + 1);
      }

      tracker.currentTicks = newTicks;

      if (typeof pushHistoryState === 'function') {
        pushHistoryState(`Tick Clock: ${tracker.name || tracker.title || 'Threat'}`);
      }
      if (typeof saveActiveCampaign === 'function') {
        saveActiveCampaign();
      }

      const trackerName = tracker.name || tracker.title || 'Threat Clock';
      if (newTicks >= maxTicks) {
        if (typeof setStatusBarMessage === 'function') {
          setStatusBarMessage(`⚠️ THREAT TRIGGERED: "${trackerName}" is fully escalated!`);
        }
      } else {
        if (typeof setStatusBarMessage === 'function') {
          setStatusBarMessage(`Clock "${trackerName}": ${newTicks}/${maxTicks} ticks.`);
        }
      }

      if (typeof scheduleRenderCanvas === 'function') {
        scheduleRenderCanvas();
      }
    }

    // Multi-Entity Group Drag Engine (AutoCAD Group Repositioning)
    function startGroupDrag(e) {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(Workstation.selectedEntities)) return;

      const initialPositions = Workstation.selectedEntities.map(ent => {
        if (ent.type === 'node') {
          const n = topo.nodes[ent.id.toString()];
          const nLayer = (typeof getLayerById === 'function' && n) ? getLayerById(n.layerId || 'layer-nodes', topo) : null;
          const isLocked = !n || !!n.locked || !!(nLayer && nLayer.locked);
          return {
            type: 'node',
            id: ent.id,
            node: n,
            initX: n ? n.x : 0,
            initY: n ? n.y : 0,
            isLocked
          };
        } else if (ent.type === 'shape') {
          const s = (topo.shapes || []).find(sh => sh.id === ent.id) || ent.shape;
          const sLayer = (typeof getLayerById === 'function' && s) ? getLayerById(s.layerId || 'layer-drawings', topo) : null;
          const isLocked = !s || !!s.locked || !!(sLayer && sLayer.locked);
          return {
            type: 'shape',
            id: ent.id,
            shape: s,
            initX: s ? (s.x || 0) : 0,
            initY: s ? (s.y || 0) : 0,
            initX2: s ? (s.x2 !== undefined ? s.x2 : ((s.x || 0) + 100)) : 0,
            initY2: s ? (s.y2 !== undefined ? s.y2 : (s.y || 0)) : 0,
            isLocked
          };
        }
        return null;
      }).filter(Boolean);

      const movableCount = initialPositions.filter(p => !p.isLocked).length;
      if (movableCount === 0) {
        setStatusBarMessage(`⚠️ All selected entities are locked 🔒 and cannot be moved.`);
        return;
      }

      Workstation.isGroupDragging = true;
      let hasMoved = false;
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;

      const onWinGroupMouseMove = (ev) => {
        if (!Workstation.isGroupDragging) return;
        const dx = (ev.clientX - startMouseX) / Workstation.zoom;
        const dy = (ev.clientY - startMouseY) / Workstation.zoom;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          hasMoved = true;
          initialPositions.forEach(item => {
            if (item.isLocked) return;
            if (item.type === 'node' && item.node) {
              item.node.x = Math.round(item.initX + dx);
              item.node.y = Math.round(item.initY + dy);
              if (item.node.coordinates) {
                item.node.coordinates.x = item.node.x;
                item.node.coordinates.y = item.node.y;
              }
            } else if (item.type === 'shape' && item.shape) {
              item.shape.x = Math.round(item.initX + dx);
              item.shape.y = Math.round(item.initY + dy);
              if (item.shape.type === 'line') {
                item.shape.x2 = Math.round(item.initX2 + dx);
                item.shape.y2 = Math.round(item.initY2 + dy);
              }
            }
          });
          scheduleRenderCanvas();
        }
      };

      const onWinGroupMouseUp = () => {
        window.removeEventListener('mousemove', onWinGroupMouseMove);
        window.removeEventListener('mouseup', onWinGroupMouseUp);
        Workstation.isGroupDragging = false;
        if (hasMoved) {
          try { updatePropertiesGrid(); } catch (err) { console.error(err); }
          try { saveActiveCampaign(); } catch (err) { console.error(err); }
        }
      };

      window.addEventListener('mousemove', onWinGroupMouseMove);
      window.addEventListener('mouseup', onWinGroupMouseUp);
    }

    // Node & Canvas Event Handling
    function onNodeMouseDown(e, nodeId) {
      if (e.button !== undefined && e.button !== 0 && e.button !== 1) return;
      if (e.button === 1 || Workstation.isSpaceDown) {
        e.preventDefault();
        e.stopPropagation();
        Workstation.isPanning = true;
        Workstation.isMiddleMousePanning = (e.button === 1);
        Workstation.dragStart = { x: e.clientX, y: e.clientY };
        const container = document.getElementById('canvas-container');
        if (container) container.style.cursor = 'grabbing';
        return;
      }

      if (Workstation.activeTool === 'erase') {
        deleteNode(nodeId);
        return;
      }

      if (Workstation.activeTool === 'road' || Workstation.activeTool === 'hegemony') {
        if (!Workstation.linkingSourceNodeId) {
          Workstation.linkingSourceNodeId = nodeId;
          setStatusBarMessage(`Linking: Select target node for ${Workstation.activeTool.toUpperCase()} link.`);
        } else {
          createEdge(Workstation.linkingSourceNodeId, nodeId, Workstation.activeTool);
          Workstation.linkingSourceNodeId = null;
        }
        return;
      }

      const targetNode = Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[nodeId.toString()];
      const nodeLayer = (typeof getLayerById === 'function' && targetNode) ? getLayerById(targetNode.layerId || 'layer-nodes') : null;

      // AutoCAD Ctrl+Click Type Select: Select all nodes
      if (e.ctrlKey) {
        e.stopPropagation();
        e.preventDefault();
        if (typeof selectByType === 'function') {
          selectByType('node', null, targetNode);
        }
        return;
      }

      // Shift+Click: Toggle node in multi-selection
      if (e.shiftKey) {
        e.stopPropagation();
        e.preventDefault();
        if (typeof toggleEntitySelection === 'function') {
          toggleEntitySelection({ type: 'node', id: nodeId, node: targetNode });
        }
        return;
      }

      // Multi-Entity Drag Check
      const isAlreadyInMulti = (typeof isEntitySelected === 'function' && isEntitySelected('node', nodeId) && Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 1);

      if (!isAlreadyInMulti) {
        try {
          selectNode(nodeId);
        } catch (err) {
          console.error('[Workstation] selectNode warning:', err);
        }
      }

      if (isAlreadyInMulti) {
        startGroupDrag(e);
        return;
      }

      if (targetNode && (targetNode.locked || (nodeLayer && nodeLayer.locked))) {
        Workstation.isDraggingNode = false;
        Workstation.draggedNodeId = null;

        // Defer locked alert until the user actually attempts to drag/move the node
        const startClientX = e.clientX;
        const startClientY = e.clientY;
        let alertFired = false;

        const onLockedNodeMove = (ev) => {
          const dist = Math.hypot(ev.clientX - startClientX, ev.clientY - startClientY);
          if (dist > 4 && !alertFired) {
            alertFired = true;
            window.removeEventListener('mousemove', onLockedNodeMove);
            window.removeEventListener('mouseup', onLockedNodeUp);
            const lockReason = (nodeLayer && nodeLayer.locked)
              ? `Canvas Layer "${nodeLayer.name}" is locked 🔒. Unlock in Layers Manager (Ctrl+L) to move.`
              : 'Position is locked 🔒. Unlock "Position Locked" in Properties Inspector to move.';
            const errMsg = `Cannot move Node ${nodeId} ("${targetNode.name || 'Node ' + nodeId}"): ${lockReason}`;
            setStatusBarMessage(`⚠️ ${errMsg}`);
            alert(errMsg);
          }
        };
        const onLockedNodeUp = () => {
          window.removeEventListener('mousemove', onLockedNodeMove);
          window.removeEventListener('mouseup', onLockedNodeUp);
        };
        window.addEventListener('mousemove', onLockedNodeMove);
        window.addEventListener('mouseup', onLockedNodeUp);
        return;
      }

      if (e.preventDefault) e.preventDefault();

      // Establish drag state and window listeners BEFORE selectNode so dragging is never blocked
      Workstation.isDraggingNode = true;
      Workstation.draggedNodeId = nodeId;
      Workstation.dragStart = { x: e.clientX, y: e.clientY };
      Workstation._winNodeDragActive = true;
      let hasMovedDuringDrag = false;

      const cadSvg = document.getElementById('cad-svg');
      const onWinMouseMove = (ev) => {
        if (!Workstation.isDraggingNode || Workstation.draggedNodeId === null) return;
        if (!cadSvg) return;
        const rect = cadSvg.getBoundingClientRect();
        const curX = Math.round((ev.clientX - rect.left - Workstation.pan.x) / Workstation.zoom);
        const curY = Math.round((ev.clientY - rect.top - Workstation.pan.y) / Workstation.zoom);
        const coordsEl = document.getElementById('sb-coords');
        if (coordsEl) coordsEl.textContent = `X: ${curX}, Y: ${curY}`;

        const topo = Workstation.activeTopology;
        const node = topo && topo.nodes && topo.nodes[Workstation.draggedNodeId.toString()];
        if (node && !node.locked) {
          if (node.x !== curX || node.y !== curY) {
            hasMovedDuringDrag = true;
            node.x = curX;
            node.y = curY;
            if (node.coordinates) {
              node.coordinates.x = curX;
              node.coordinates.y = curY;
            }
            scheduleRenderCanvas();
          }
        }
      };

      const onWinMouseUp = () => {
        window.removeEventListener('mousemove', onWinMouseMove);
        window.removeEventListener('mouseup', onWinMouseUp);
        Workstation._winNodeDragActive = false;
        if (Workstation.isDraggingNode) {
          Workstation.isDraggingNode = false;
          Workstation.draggedNodeId = null;
          if (hasMovedDuringDrag) {
            try { updatePropertiesGrid(); } catch (err) { console.error(err); }
            try { saveActiveCampaign(); } catch (err) { console.error(err); }
          }
        }
      };

      window.addEventListener('mousemove', onWinMouseMove);
      window.addEventListener('mouseup', onWinMouseUp);
    }

    // CAD Vector Shape Dragging & Interaction
    function onShapeMouseDown(e, shape) {
      if (!shape) return;
      if (e.button !== undefined && e.button !== 0 && e.button !== 1) return;
      if (e.button === 1 || Workstation.isSpaceDown) {
        e.preventDefault();
        e.stopPropagation();
        Workstation.isPanning = true;
        Workstation.isMiddleMousePanning = (e.button === 1);
        Workstation.dragStart = { x: e.clientX, y: e.clientY };
        const container = document.getElementById('canvas-container');
        if (container) container.style.cursor = 'grabbing';
        return;
      }

      if (Workstation.activeTool === 'erase') {
        e.stopPropagation();
        e.preventDefault();
        if (typeof deleteShape === 'function') {
          deleteShape(shape.id, true);
        }
        return;
      }

      e.stopPropagation();
      if (e.preventDefault) e.preventDefault();

      // AutoCAD Ctrl+Click Type Select: Select all shapes of same primitive type
      if (e.ctrlKey) {
        if (typeof selectByType === 'function') {
          selectByType('shape', shape.type, shape);
        }
        return;
      }

      // Shift+Click: Toggle shape in multi-selection
      if (e.shiftKey) {
        if (typeof toggleEntitySelection === 'function') {
          toggleEntitySelection({ type: 'shape', id: shape.id, shape: shape });
        }
        return;
      }

      const topo = Workstation.activeTopology;
      const sLayer = (typeof getLayerById === 'function') ? getLayerById(shape.layerId || 'layer-drawings', topo) : null;
      const isLocked = !!(shape.locked || (sLayer && sLayer.locked));

      // Multi-Entity Drag Check
      const isAlreadyInMulti = (typeof isEntitySelected === 'function' && isEntitySelected('shape', shape.id) && Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 1);

      if (!isAlreadyInMulti) {
        try {
          if (typeof selectShape === 'function') {
            selectShape(shape.id);
          } else {
            Workstation.selectedEntity = { type: 'shape', id: shape.id, shape: shape };
            if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
            if (typeof renderCanvas === 'function') renderCanvas();
          }
        } catch (err) {
          console.error('[Workstation] selectShape error:', err);
        }
      }

      if (isAlreadyInMulti) {
        startGroupDrag(e);
        return;
      }

      if (isLocked) {
        const lockReason = (sLayer && sLayer.locked)
          ? `Canvas Layer "${sLayer.name}" is locked 🔒. Unlock in Layers Manager (Ctrl+L) to move.`
          : 'Shape position is locked 🔒. Unlock in Properties Inspector to move.';
        setStatusBarMessage(`⚠️ Cannot move shape "${shape.name || shape.id}": ${lockReason}`);
        return;
      }

      Workstation.isDraggingShape = true;
      Workstation.draggedShapeId = shape.id;
      let hasMovedDuringDrag = false;

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const initialX = shape.x || 0;
      const initialY = shape.y || 0;
      const initialX2 = shape.x2 !== undefined ? shape.x2 : ((shape.x || 0) + 100);
      const initialY2 = shape.y2 !== undefined ? shape.y2 : (shape.y || 0);

      const onWinShapeMouseMove = (ev) => {
        if (!Workstation.isDraggingShape || Workstation.draggedShapeId !== shape.id) return;
        const dx = (ev.clientX - startMouseX) / Workstation.zoom;
        const dy = (ev.clientY - startMouseY) / Workstation.zoom;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          hasMovedDuringDrag = true;
          shape.x = Math.round(initialX + dx);
          shape.y = Math.round(initialY + dy);
          if (shape.type === 'line') {
            shape.x2 = Math.round(initialX2 + dx);
            shape.y2 = Math.round(initialY2 + dy);
          }
          scheduleRenderCanvas();
          const coordsEl = document.getElementById('sb-coords');
          if (coordsEl) coordsEl.textContent = `X: ${shape.x}, Y: ${shape.y}`;
        }
      };

      const onWinShapeMouseUp = () => {
        window.removeEventListener('mousemove', onWinShapeMouseMove);
        window.removeEventListener('mouseup', onWinShapeMouseUp);
        if (Workstation.isDraggingShape && Workstation.draggedShapeId === shape.id) {
          Workstation.isDraggingShape = false;
          Workstation.draggedShapeId = null;
          if (hasMovedDuringDrag) {
            try { updatePropertiesGrid(); } catch (err) { console.error(err); }
            try { saveActiveCampaign(); } catch (err) { console.error(err); }
          }
        }
      };

      window.addEventListener('mousemove', onWinShapeMouseMove);
      window.addEventListener('mouseup', onWinShapeMouseUp);
    }

    // CAD Drawing Rubber-Band Preview Functions
    function clearShapeDrawPreview() {
      const interactionLayer = document.getElementById('interaction-layer');
      if (interactionLayer) {
        const preview = interactionLayer.querySelector('#shape-draw-preview');
        if (preview) preview.remove();
      }
    }

    function renderShapeDrawPreview(type, start, current) {
      const interactionLayer = document.getElementById('interaction-layer');
      if (!interactionLayer || !start || !current) return;

      let preview = interactionLayer.querySelector('#shape-draw-preview');
      if (!preview) {
        preview = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        preview.setAttribute('id', 'shape-draw-preview');
        interactionLayer.appendChild(preview);
      }
      preview.innerHTML = '';

      if (type === 'rect') {
        const minX = Math.min(start.x, current.x);
        const minY = Math.min(start.y, current.y);
        const width = Math.max(1, Math.abs(current.x - start.x));
        const height = Math.max(1, Math.abs(current.y - start.y));
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', minX);
        rect.setAttribute('y', minY);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', 'rgba(59, 130, 246, 0.25)');
        rect.setAttribute('stroke', '#2563eb');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('stroke-dasharray', '4,4');
        rect.setAttribute('pointer-events', 'none');
        preview.appendChild(rect);
      } else if (type === 'circle') {
        const minX = Math.min(start.x, current.x);
        const minY = Math.min(start.y, current.y);
        const width = Math.max(1, Math.abs(current.x - start.x));
        const height = Math.max(1, Math.abs(current.y - start.y));
        const rx = width / 2;
        const ry = height / 2;
        const cx = minX + rx;
        const cy = minY + ry;
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ellipse.setAttribute('cx', cx);
        ellipse.setAttribute('cy', cy);
        ellipse.setAttribute('rx', rx);
        ellipse.setAttribute('ry', ry);
        ellipse.setAttribute('fill', 'rgba(59, 130, 246, 0.25)');
        ellipse.setAttribute('stroke', '#2563eb');
        ellipse.setAttribute('stroke-width', '2');
        ellipse.setAttribute('stroke-dasharray', '4,4');
        ellipse.setAttribute('pointer-events', 'none');
        preview.appendChild(ellipse);
      } else if (type === 'line') {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', start.x);
        line.setAttribute('y1', start.y);
        line.setAttribute('x2', current.x);
        line.setAttribute('y2', current.y);
        line.setAttribute('stroke', '#2563eb');
        line.setAttribute('stroke-width', '2.5');
        line.setAttribute('stroke-dasharray', '4,4');
        line.setAttribute('pointer-events', 'none');
        preview.appendChild(line);
      }
    }

    // CAD Marquee Selection Preview
    function clearMarqueePreview() {
      const interactionLayer = document.getElementById('interaction-layer');
      if (interactionLayer) {
        const preview = interactionLayer.querySelector('#marquee-selection-preview');
        if (preview) preview.remove();
      }
    }

    function renderMarqueePreview(start, current) {
      const interactionLayer = document.getElementById('interaction-layer');
      if (!interactionLayer || !start || !current) return;

      let preview = interactionLayer.querySelector('#marquee-selection-preview');
      if (!preview) {
        preview = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        preview.setAttribute('id', 'marquee-selection-preview');
        preview.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
        preview.setAttribute('stroke', '#2563eb');
        preview.setAttribute('stroke-width', '1.5');
        preview.setAttribute('stroke-dasharray', '4,4');
        preview.setAttribute('pointer-events', 'none');
        interactionLayer.appendChild(preview);
      }

      const minX = Math.min(start.x, current.x);
      const minY = Math.min(start.y, current.y);
      const width = Math.max(1, Math.abs(current.x - start.x));
      const height = Math.max(1, Math.abs(current.y - start.y));

      preview.setAttribute('x', minX);
      preview.setAttribute('y', minY);
      preview.setAttribute('width', width);
      preview.setAttribute('height', height);
    }

    function onCanvasMouseDown(e) {
      if (e.button === 1) { // Middle click pan (AutoCAD / Photoshop)
        e.preventDefault();
        Workstation.isPanning = true;
        Workstation.isMiddleMousePanning = true;
        Workstation.dragStart = { x: e.clientX, y: e.clientY };
        const container = document.getElementById('canvas-container');
        if (container) container.style.cursor = 'grabbing';
        return;
      }

      if (Workstation.isSpaceDown || Workstation.activeTool === 'pan') {
        Workstation.isPanning = true;
        Workstation.isMiddleMousePanning = false;
        Workstation.dragStart = { x: e.clientX, y: e.clientY };
        const container = document.getElementById('canvas-container');
        if (container) container.style.cursor = 'grabbing';
        return;
      }

      const rect = document.getElementById('cad-svg').getBoundingClientRect();
      const clickX = Math.round((e.clientX - rect.left - Workstation.pan.x) / Workstation.zoom);
      const clickY = Math.round((e.clientY - rect.top - Workstation.pan.y) / Workstation.zoom);

      if (['rect', 'circle', 'line'].includes(Workstation.activeTool)) {
        const topo = Workstation.activeTopology;
        const targetLayerId = (typeof getActiveLayerId === 'function' ? getActiveLayerId() : null) || 'layer-drawings';
        const targetLayer = (typeof getLayerById === 'function') ? getLayerById(targetLayerId, topo) : null;
        if (targetLayer && targetLayer.locked) {
          const errMsg = `Cannot draw on locked layer "${targetLayer.name}" 🔒. Unlock in Layers Manager (Ctrl+L) first.`;
          setStatusBarMessage(`⚠️ ${errMsg}`);
          alert(errMsg);
          return;
        }

        Workstation.isDrawingShape = true;
        Workstation.shapeDrawType = Workstation.activeTool;
        Workstation.shapeDrawStart = { x: clickX, y: clickY };
        Workstation.shapeDrawLayerId = targetLayerId;
        renderShapeDrawPreview(Workstation.shapeDrawType, Workstation.shapeDrawStart, { x: clickX, y: clickY });

        const onWinShapeDrawUp = (ev) => {
          window.removeEventListener('mouseup', onWinShapeDrawUp);
          if (Workstation.isDrawingShape) {
            onCanvasMouseUp(ev);
          }
        };
        window.addEventListener('mouseup', onWinShapeDrawUp);
        return;
      }

      if (Workstation.activeTool === 'move') {
        const topo = Workstation.activeTopology;
        if (Workstation.selectedEntity && Workstation.selectedEntity.type === 'node') {
          const selNodeId = Workstation.selectedEntity.id;
          const node = topo && topo.nodes && topo.nodes[String(selNodeId)];
          if (node) {
            if (node.locked) {
              const errMsg = `Cannot move Node ${selNodeId} ("${node.name || 'Node ' + selNodeId}"): Position is locked 🔒. Unlock in Properties Inspector to move.`;
              setStatusBarMessage(`⚠️ ${errMsg}`);
              alert(errMsg);
              return;
            }
            node.x = clickX;
            node.y = clickY;
            if (node.coordinates) {
              node.coordinates.x = clickX;
              node.coordinates.y = clickY;
            }
            renderCanvas();
            updatePropertiesGrid();
            saveActiveCampaign();
            setStatusBarMessage(`Moved Node ${selNodeId} to (${clickX}, ${clickY}).`);
            return;
          }
        } else {
          setStatusBarMessage("Move Tool: Click any node to select it first, then click where to place it.");
          return;
        }
      }

      if (Workstation.activeTool === 'node-t2') {
        addNodeAt(clickX, clickY, 2);
        return;
      } else if (Workstation.activeTool === 'node-t3') {
        addNodeAt(clickX, clickY, 3);
        return;
      }

      if (Workstation.activeTool === 'select') {
        Workstation.isMarqueeSelecting = true;
        Workstation.marqueeStart = { x: clickX, y: clickY };
        Workstation.marqueeShift = !!e.shiftKey;
        renderMarqueePreview(Workstation.marqueeStart, { x: clickX, y: clickY });

        const onWinMarqueeUp = (ev) => {
          window.removeEventListener('mouseup', onWinMarqueeUp);
          if (Workstation.isMarqueeSelecting) {
            onCanvasMouseUp(ev);
          }
        };
        window.addEventListener('mouseup', onWinMarqueeUp);
        return;
      }

      // Background click: deselect and show global properties
      selectGlobal();
    }

    function onCanvasMouseMove(e) {
      const cadSvg = document.getElementById('cad-svg');
      if (!cadSvg) return;
      const rect = cadSvg.getBoundingClientRect();
      const curX = Math.round((e.clientX - rect.left - Workstation.pan.x) / Workstation.zoom);
      const curY = Math.round((e.clientY - rect.top - Workstation.pan.y) / Workstation.zoom);
      const coordsEl = document.getElementById('sb-coords');
      if (coordsEl) coordsEl.textContent = `X: ${curX}, Y: ${curY}`;

      if (Workstation.isPanning) {
        const dx = e.clientX - Workstation.dragStart.x;
        const dy = e.clientY - Workstation.dragStart.y;
        Workstation.pan.x += dx;
        Workstation.pan.y += dy;
        Workstation.dragStart = { x: e.clientX, y: e.clientY };
        applyCanvasTransform();
        return;
      }

      if (Workstation.isDrawingShape && Workstation.shapeDrawStart) {
        renderShapeDrawPreview(Workstation.shapeDrawType, Workstation.shapeDrawStart, { x: curX, y: curY });
        return;
      }

      if (Workstation.isMarqueeSelecting && Workstation.marqueeStart) {
        renderMarqueePreview(Workstation.marqueeStart, { x: curX, y: curY });
        return;
      }

      if (!Workstation._winNodeDragActive && Workstation.isDraggingNode && Workstation.draggedNodeId !== null && Workstation.draggedNodeId !== undefined) {
        const topo = Workstation.activeTopology;
        const node = topo && topo.nodes && topo.nodes[Workstation.draggedNodeId.toString()];
        if (node && !node.locked) {
          node.x = curX;
          node.y = curY;
          if (node.coordinates) {
            node.coordinates.x = curX;
            node.coordinates.y = curY;
          }
          renderCanvas();
        }
      }
    }

    function onCanvasMouseUp(e) {
      if (Workstation.isDrawingShape && Workstation.shapeDrawStart) {
        const start = Workstation.shapeDrawStart;
        const cadSvg = document.getElementById('cad-svg');
        let curX = start.x;
        let curY = start.y;
        if (cadSvg && e) {
          const rect = cadSvg.getBoundingClientRect();
          curX = Math.round((e.clientX - rect.left - Workstation.pan.x) / Workstation.zoom);
          curY = Math.round((e.clientY - rect.top - Workstation.pan.y) / Workstation.zoom);
        }

        const type = Workstation.shapeDrawType;
        const targetLayerId = Workstation.shapeDrawLayerId || 'layer-drawings';
        Workstation.isDrawingShape = false;
        Workstation.shapeDrawStart = null;
        clearShapeDrawPreview();

        const topo = Workstation.activeTopology;
        if (!topo) return;
        if (!Array.isArray(topo.shapes)) topo.shapes = [];

        let newShape = null;
        const shapeId = 'shape-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000).toString(36);
        const count = topo.shapes.filter(s => s.type === type).length + 1;

        if (type === 'rect') {
          const minX = Math.min(start.x, curX);
          const minY = Math.min(start.y, curY);
          const width = Math.abs(curX - start.x);
          const height = Math.abs(curY - start.y);
          if (width >= 5 && height >= 5) {
            newShape = {
              id: shapeId,
              type: 'rect',
              name: `Box ${count}`,
              layerId: targetLayerId,
              x: minX,
              y: minY,
              width: width,
              height: height,
              fillColor: 'rgba(59, 130, 246, 0.2)',
              strokeColor: '#2563eb',
              strokeWidth: 2,
              strokeDash: 'solid',
              opacity: 1.0,
              visible: true,
              locked: false
            };
          }
        } else if (type === 'circle') {
          const minX = Math.min(start.x, curX);
          const minY = Math.min(start.y, curY);
          const width = Math.abs(curX - start.x);
          const height = Math.abs(curY - start.y);
          const rx = Math.round(width / 2);
          const ry = Math.round(height / 2);
          const cx = minX + rx;
          const cy = minY + ry;
          const radius = Math.max(rx, ry);
          if (radius >= 4) {
            newShape = {
              id: shapeId,
              type: 'circle',
              name: `Circle ${count}`,
              layerId: targetLayerId,
              x: cx,
              y: cy,
              radius: radius,
              rx: rx,
              ry: ry,
              fillColor: 'rgba(59, 130, 246, 0.2)',
              strokeColor: '#2563eb',
              strokeWidth: 2,
              strokeDash: 'solid',
              opacity: 1.0,
              visible: true,
              locked: false
            };
          }
        } else if (type === 'line') {
          const dist = Math.hypot(curX - start.x, curY - start.y);
          if (dist >= 5) {
            newShape = {
              id: shapeId,
              type: 'line',
              name: `Line ${count}`,
              layerId: targetLayerId,
              x: start.x,
              y: start.y,
              x2: curX,
              y2: curY,
              fillColor: 'transparent',
              strokeColor: '#2563eb',
              strokeWidth: 2,
              strokeDash: 'solid',
              opacity: 1.0,
              visible: true,
              locked: false
            };
          }
        }

        if (newShape) {
          topo.shapes.push(newShape);
          setTool('select');
          if (typeof selectShape === 'function') {
            selectShape(newShape.id);
          } else {
            Workstation.selectedEntity = { type: 'shape', id: newShape.id, shape: newShape };
          }
          if (typeof renderLayersManagerUI === 'function') renderLayersManagerUI();
          renderCanvas();
          updatePropertiesGrid();
          saveActiveCampaign();
          setStatusBarMessage(`Created CAD Shape "${newShape.name}". Switched to Select tool.`);
        }
        return;
      }

      if (Workstation.isMarqueeSelecting && Workstation.marqueeStart) {
        const start = Workstation.marqueeStart;
        const cadSvg = document.getElementById('cad-svg');
        let curX = start.x;
        let curY = start.y;
        if (cadSvg && e) {
          const rect = cadSvg.getBoundingClientRect();
          curX = Math.round((e.clientX - rect.left - Workstation.pan.x) / Workstation.zoom);
          curY = Math.round((e.clientY - rect.top - Workstation.pan.y) / Workstation.zoom);
        }

        const isShift = !!Workstation.marqueeShift;
        Workstation.isMarqueeSelecting = false;
        Workstation.marqueeStart = null;
        clearMarqueePreview();

        const minX = Math.min(start.x, curX);
        const minY = Math.min(start.y, curY);
        const maxX = Math.max(start.x, curX);
        const maxY = Math.max(start.y, curY);
        const width = maxX - minX;
        const height = maxY - minY;

        if (width < 5 && height < 5) {
          if (!isShift) {
            selectGlobal();
          }
          return;
        }

        const topo = Workstation.activeTopology;
        if (!topo) return;

        const found = [];

        // 1. Enclosed nodes
        Object.keys(topo.nodes || {}).forEach(k => {
          const n = topo.nodes[k];
          if (n && n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY) {
            const nId = isNaN(k) || String(k).includes('-') ? k : parseInt(k);
            found.push({ type: 'node', id: nId, node: n });
          }
        });

        // 2. Intersecting/enclosed shapes
        (topo.shapes || []).forEach(s => {
          if (!s || s.visible === false) return;
          let sMinX = 0, sMinY = 0, sMaxX = 0, sMaxY = 0;
          if (s.type === 'rect') {
            sMinX = s.x || 0;
            sMinY = s.y || 0;
            sMaxX = sMinX + (s.width || 100);
            sMaxY = sMinY + (s.height || 60);
          } else if (s.type === 'circle') {
            const r = s.radius || 40;
            const rx = s.rx || r;
            const ry = s.ry || r;
            sMinX = (s.x || 0) - rx;
            sMinY = (s.y || 0) - ry;
            sMaxX = (s.x || 0) + rx;
            sMaxY = (s.y || 0) + ry;
          } else if (s.type === 'line') {
            sMinX = Math.min(s.x || 0, s.x2 !== undefined ? s.x2 : (s.x || 0));
            sMinY = Math.min(s.y || 0, s.y2 !== undefined ? s.y2 : (s.y || 0));
            sMaxX = Math.max(s.x || 0, s.x2 !== undefined ? s.x2 : (s.x || 0));
            sMaxY = Math.max(s.y || 0, s.y2 !== undefined ? s.y2 : (s.y || 0));
          }
          if (sMinX <= maxX && sMaxX >= minX && sMinY <= maxY && sMaxY >= minY) {
            found.push({ type: 'shape', id: s.id, shape: s });
          }
        });

        if (isShift) {
          if (typeof addToSelection === 'function') {
            found.forEach(item => addToSelection(item));
          }
        } else {
          if (found.length > 0) {
            if (typeof setSelection === 'function') {
              setSelection(found);
            }
          } else {
            selectGlobal();
          }
        }
        return;
      }

      if (!Workstation._winNodeDragActive && Workstation.isDraggingNode) {
        Workstation.isDraggingNode = false;
        Workstation.draggedNodeId = null;
        updatePropertiesGrid();
        saveActiveCampaign();
      }
      if (Workstation.isPanning) {
        Workstation.isPanning = false;
        Workstation.isMiddleMousePanning = false;
        const container = document.getElementById('canvas-container');
        if (container) {
          container.style.cursor = Workstation.isSpaceDown ? 'grab' : (Workstation.activeTool === 'pan' ? 'grab' : 'crosshair');
        }
      }
    }
    function applyCanvasTransform() {
      const transform = `translate(${Workstation.pan.x}, ${Workstation.pan.y}) scale(${Workstation.zoom})`;
      
      // Transform all dynamic layer groups
      const dynamicGroups = document.querySelectorAll('#cad-svg .canvas-layer-group');
      dynamicGroups.forEach(el => el.setAttribute('transform', transform));

      // Transform fixed / legacy layers
      const layers = ['map-bg-layer', 'grid-layer', 'drawings-layer', 'edges-layer', 'corridor-labels-layer', 'nodes-layer', 'portals-layer', 'clocks-layer', 'interaction-layer'];
      layers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('transform', transform);
      });
    }

    // Node & Edge Mutation Functions
    function addNodeAt(x, y, tier) {
      const topo = Workstation.activeTopology;
      const curMapId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
      const prefix = (typeof getMapNodePrefix === "function") ? getMapNodePrefix(curMapId) : "";

      let newId;
      let newName;
      let num = 1;

      if (prefix) {
        const existingKeys = Object.keys(topo.nodes || {});
        while (existingKeys.includes(`${prefix}${num}`) || existingKeys.includes(String(num))) {
          num++;
        }
        newId = `${prefix}${num}`;
        newName = `${prefix}${num}`;
      } else {
        const existingIds = Object.keys(topo.nodes || {}).map(k => parseInt(k)).filter(n => !isNaN(n));
        while (existingIds.includes(num)) num++;
        newId = num;
        newName = `Node ${num}`;
      }

      topo.nodes[newId.toString()] = {
        id: newId,
        name: newName,
        wave: 1,
        x: x,
        y: y,
        tier: tier,
        eligible: (tier === 2),
        culture: "Clan",
        adj: [],
        infBy: []
      };

      renderCanvas();
      selectNode(newId);
      saveActiveCampaign();
      setStatusBarMessage(`Added Node ${newId} (Tier ${tier}) at (${x}, ${y})`);
    }

    function deleteNodeDirect(nodeId) {
      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) return;
      const nodeKey = nodeId.toString();
      if (!topo.nodes[nodeKey]) return;

      const n = topo.nodes[nodeKey];
      const childId = n ? n.childMapId : null;
      const allMaps = (typeof maps !== 'undefined' && maps) ? maps : {};
      if (childId && allMaps[childId]) {
        allMaps[childId].parentNodeId = null;
      }
      const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';
      Object.keys(allMaps).forEach(mId => {
        const m = allMaps[mId];
        if (m && (m.parentMapId === curMapId || (!m.parentMapId && curMapId === 'map_root')) && String(m.parentNodeId) === String(nodeId)) {
          m.parentNodeId = null;
        }
      });

      delete topo.nodes[nodeKey];

      // Remove references in adj and infBy
      Object.keys(topo.nodes).forEach(k => {
        const other = topo.nodes[k];
        if (other.adj) other.adj = other.adj.filter(id => String(id) !== String(nodeId));
        if (other.infBy) other.infBy = other.infBy.filter(id => String(id) !== String(nodeId));
      });

      // Remove incident edgeData
      if (topo.edgeData) {
        Object.keys(topo.edgeData).forEach(pairKey => {
          const parts = pairKey.split('-');
          if (parts.includes(String(nodeId))) {
            delete topo.edgeData[pairKey];
          }
        });
      }
    }

    function deleteNode(nodeId) {
      if (typeof promptEntityDelete === 'function') {
        promptEntityDelete('node', nodeId);
        return;
      }
      deleteNodeDirect(nodeId);
      selectGlobal();
      renderCanvas();
      saveActiveCampaign();
      setStatusBarMessage(`Deleted Node ${nodeId}.`);
    }

    function createEdge(uId, vId, edgeType) {
      if (String(uId) === String(vId)) return;
      const topo = Workstation.activeTopology;
      const u = topo.nodes[uId.toString()];
      const v = topo.nodes[vId.toString()];
      if (!u || !v) return;

      if (edgeType === 'road') {
        if (!u.adj) u.adj = [];
        if (!v.adj) v.adj = [];
        if (!u.adj.some(id => String(id) === String(vId))) u.adj.push(vId);
        if (!v.adj.some(id => String(id) === String(uId))) v.adj.push(uId);
        setStatusBarMessage(`Created Transit Road between Node ${uId} and Node ${vId}.`);
      } else if (edgeType === 'hegemony') {
        if (!v.infBy) v.infBy = [];
        if (!v.infBy.some(id => String(id) === String(uId))) v.infBy.push(uId);
        setStatusBarMessage(`Created Hegemony Vector: Node ${uId} -> Node ${vId}.`);
      }

      renderCanvas();
      saveActiveCampaign();
    }

    function deleteEdge(uId, vId, edgeType) {
      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) return;
      const uKey = String(uId);
      const vKey = String(vId);
      const pairKey = [uKey, vKey].sort().join('-');
      const edgeKey = (edgeType === 'hegemony') ? `${uId}->${vId}` : pairKey;

      const u = topo.nodes[uKey];
      const v = topo.nodes[vKey];

      if (edgeType === 'hegemony') {
        if (v && v.infBy) {
          v.infBy = v.infBy.filter(id => String(id) !== uKey);
        }
      } else {
        if (u && u.adj) {
          u.adj = u.adj.filter(id => String(id) !== vKey);
        }
        if (v && v.adj) {
          v.adj = v.adj.filter(id => String(id) !== uKey);
        }
      }

      if (topo.edgeData) {
        delete topo.edgeData[edgeKey];
        delete topo.edgeData[pairKey];
      }
      if (typeof edgeSlottedModules !== "undefined") {
        delete edgeSlottedModules[edgeKey];
        delete edgeSlottedModules[pairKey];
      }

      selectGlobal();
      renderCanvas();
      saveActiveCampaign();
      setStatusBarMessage(`Deleted ${edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road'}: ${uId} ${edgeType === 'hegemony' ? '->' : '<->'} ${vId}.`);
    }

    function promptMoveNode(nodeId) {
      const topo = Workstation.activeTopology;
      const node = topo && topo.nodes && topo.nodes[String(nodeId)];
      if (!node) {
        alert("Please select a node to move.");
        return;
      }
      if (node.locked) {
        const errMsg = `Cannot move Node ${node.id} ("${node.name || 'Node ' + node.id}"): Position is locked 🔒. Unlock "Position Locked" in Properties Inspector to move.`;
        setStatusBarMessage(`⚠️ ${errMsg}`);
        alert(errMsg);
        return;
      }
      const input = prompt(`Enter new coordinates for Node ${node.id} (${node.name || 'Node'}) as "X, Y" (Canvas bounds 0-2000, 0-1500):`, `${node.x}, ${node.y}`);
      if (input === null) return;
      const parts = input.split(',').map(s => parseInt(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        node.x = parts[0];
        node.y = parts[1];
        if (node.coordinates) {
          node.coordinates.x = parts[0];
          node.coordinates.y = parts[1];
        }
        renderCanvas();
        updatePropertiesGrid();
        saveActiveCampaign();
        setStatusBarMessage(`Moved Node ${node.id} to (${node.x}, ${node.y}).`);
      } else {
        alert("Invalid coordinates. Please enter two comma-separated numbers (e.g. 450, 320).");
      }
    }
    // Zoom & Pan Functions (CAD / Photoshop Deep-Zoom with Cursor-Centering)
    function zoomIn(centerPoint) {
      zoomAt(Workstation.zoom * 1.25, centerPoint);
    }

    function zoomOut(centerPoint) {
      zoomAt(Workstation.zoom / 1.25, centerPoint);
    }

    function zoomAt(targetZoom, centerPoint) {
      const container = document.getElementById('canvas-container');
      const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: 800, height: 600 };

      const cx = (centerPoint && centerPoint.x !== undefined) ? centerPoint.x : rect.width / 2;
      const cy = (centerPoint && centerPoint.y !== undefined) ? centerPoint.y : rect.height / 2;

      // Invariant world coordinates under cursor/focus point
      const worldX = (cx - Workstation.pan.x) / Workstation.zoom;
      const worldY = (cy - Workstation.pan.y) / Workstation.zoom;

      // Deep zoom: 0.02 (2% deep overview) to 10.0 (1000% detailed macro)
      const clampedZoom = Math.min(10.0, Math.max(0.02, targetZoom));
      Workstation.zoom = clampedZoom;

      Workstation.pan.x = cx - worldX * Workstation.zoom;
      Workstation.pan.y = cy - worldY * Workstation.zoom;

      applyCanvasTransform();
      const zoomPct = Math.round(Workstation.zoom * 100);
      const zoomEl = document.getElementById('sb-zoom');
      if (zoomEl) zoomEl.textContent = `Zoom: ${zoomPct}%`;
    }

    function resetZoom() {
      Workstation.zoom = 1.0;
      Workstation.pan = { x: 0, y: 0 };
      applyCanvasTransform();
      const zoomEl = document.getElementById('sb-zoom');
      if (zoomEl) zoomEl.textContent = `Zoom: 100%`;
    }

    function initCanvasInteractions() {
      const container = document.getElementById('canvas-container');
      if (!container || container.dataset.cadInteractionsBound) return;
      container.dataset.cadInteractionsBound = "true";

      // Prevent middle-click browser autoscroll
      container.addEventListener('auxclick', (e) => {
        if (e.button === 1) e.preventDefault();
      });

      // Mouse wheel zoom centered under cursor pointer
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const factor = e.deltaY < 0 ? 1.15 : (1 / 1.15);
        zoomAt(Workstation.zoom * factor, cursor);
      }, { passive: false });

      // Window-level mousemove and mouseup to handle high-speed drag operations
      window.addEventListener('mousemove', (e) => {
        if (Workstation.isDraggingNode || Workstation.isPanning) {
          onCanvasMouseMove(e);
        }
      });
      window.addEventListener('mouseup', (e) => {
        if (Workstation.isDraggingNode || Workstation.isPanning) {
          onCanvasMouseUp(e);
        }
      });
    }

// Exported globals
window.setTool = setTool;
window.getToolKey = getToolKey;
window.onClockCalloutMouseDown = onClockCalloutMouseDown;
window.handleClockSegmentClick = handleClockSegmentClick;
window.onNodeMouseDown = onNodeMouseDown;
window.onShapeMouseDown = onShapeMouseDown;
window.startGroupDrag = startGroupDrag;
window.renderShapeDrawPreview = renderShapeDrawPreview;
window.clearShapeDrawPreview = clearShapeDrawPreview;
window.renderMarqueePreview = renderMarqueePreview;
window.clearMarqueePreview = clearMarqueePreview;
window.onCanvasMouseDown = onCanvasMouseDown;
window.onCanvasMouseMove = onCanvasMouseMove;
window.onCanvasMouseUp = onCanvasMouseUp;
window.applyCanvasTransform = applyCanvasTransform;
window.addNodeAt = addNodeAt;
window.deleteNode = deleteNode;
window.deleteNodeDirect = deleteNodeDirect;
window.createEdge = createEdge;
window.deleteEdge = deleteEdge;
window.promptMoveNode = promptMoveNode;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.zoomAt = zoomAt;
window.resetZoom = resetZoom;
window.initCanvasInteractions = initCanvasInteractions;