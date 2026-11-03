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
      } else if (toolName === 'pin') {
        setStatusBarMessage(`Pin Tool [P]: Click anywhere on canvas to place a Spatial Pin (Submap, NPC, Quest, Item, Clock, or Ticket).`);
      } else {
        setStatusBarMessage(`Switched to tool: ${toolName.toUpperCase()}`);
      }
    }

    function getToolKey(name) {
      const map = { 'select':'V', 'pan':'H', 'move':'M', 'node-t2':'N', 'node-t3':'A', 'road':'L', 'hegemony':'I', 'rect':'R', 'circle':'C', 'line':'W', 'pin':'P', 'erase':'E' };
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

      const prevTicks = curTicks;
      const delta = newTicks - prevTicks;
      const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);
      if (cme && typeof cme.tickClock === 'function' && (typeof evaluateTrackerConsequences !== 'function' || typeof window === 'undefined' || typeof window.confirm !== 'function')) {
        cme.tickClock(topo, tracker.id, delta);
      } else {
        tracker.currentTicks = newTicks;
        if (tracker.value !== undefined) tracker.value = newTicks;
      }
      if (typeof evaluateTrackerConsequences === 'function') {
        evaluateTrackerConsequences(tracker, prevTicks, tracker.currentTicks);
      }

      if (typeof pushHistoryState === 'function') {
        pushHistoryState(`Tick Clock: ${tracker.name || tracker.title || 'Threat'}`);
      }
      if (typeof saveActiveCampaign === 'function') {
        saveActiveCampaign();
      }
      if (typeof recordUserMilestoneInChangelog === 'function') {
        recordUserMilestoneInChangelog(`Ticked clock "${tracker.name || tracker.title || tracker.id}" to ${newTicks}/${maxTicks}`, [{ op: 'tick_clock', clock: tracker.id, delta: newTicks - curTicks }]);
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
        } else if (ent.type === 'spatialPin') {
          const p = (topo.spatialPins || []).find(pn => String(pn.id) === String(ent.id)) || ent.pin;
          const isLocked = !p || !!p.locked;
          return {
            type: 'spatialPin',
            id: ent.id,
            pin: p,
            initX: p ? (p.x || 0) : 0,
            initY: p ? (p.y || 0) : 0,
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
              item.node.x = snapCoord(Math.round(item.initX + dx), ev);
              item.node.y = snapCoord(Math.round(item.initY + dy), ev);
              if (item.node.coordinates) {
                item.node.coordinates.x = item.node.x;
                item.node.coordinates.y = item.node.y;
              }
            } else if (item.type === 'shape' && item.shape) {
              const sdx = snapCoord(Math.round(item.initX + dx), ev) - item.initX;
              const sdy = snapCoord(Math.round(item.initY + dy), ev) - item.initY;
              item.shape.x = Math.round(item.initX + sdx);
              item.shape.y = Math.round(item.initY + sdy);
              if (item.shape.type === 'line') {
                item.shape.x2 = Math.round(item.initX2 + sdx);
                item.shape.y2 = Math.round(item.initY2 + sdy);
              }
            } else if (item.type === 'spatialPin' && item.pin) {
              item.pin.x = snapCoord(Math.round(item.initX + dx), ev);
              item.pin.y = snapCoord(Math.round(item.initY + dy), ev);
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

      // Detect rapid double-click on the same node (survives SVG <g> replacement during selectNode -> renderCanvas)
      const now = Date.now();
      const isRapidSecondClick = (
        (e.detail && e.detail >= 2) ||
        (Workstation._lastNodeMouseDownId !== undefined &&
         Workstation._lastNodeMouseDownId !== null &&
         String(Workstation._lastNodeMouseDownId) === String(nodeId) &&
         Workstation._lastNodeMouseDownTime &&
         (now - Workstation._lastNodeMouseDownTime) < 420 &&
         !Workstation._lastNodeDragMoved)
      );
      if (isRapidSecondClick) {
        Workstation._lastNodeMouseDownId = null;
        Workstation._lastNodeMouseDownTime = 0;
        Workstation.isDraggingNode = false;
        Workstation.draggedNodeId = null;
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        if (typeof navigateToNodeSubmap === 'function') {
          navigateToNodeSubmap(nodeId);
        } else if (targetNode && targetNode.childMapId && typeof switchActiveMap === 'function') {
          switchActiveMap(targetNode.childMapId);
        }
        return;
      }
      Workstation._lastNodeMouseDownId = String(nodeId);
      Workstation._lastNodeMouseDownTime = now;
      Workstation._lastNodeDragMoved = false;

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
            Workstation._lastNodeDragMoved = true;
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
        const rawX = Math.round((ev.clientX - rect.left - Workstation.pan.x) / Workstation.zoom);
        const rawY = Math.round((ev.clientY - rect.top - Workstation.pan.y) / Workstation.zoom);
        const curX = snapCoord(rawX, ev);
        const curY = snapCoord(rawY, ev);
        const coordsEl = document.getElementById('sb-coords');
        if (coordsEl) coordsEl.textContent = `X: ${curX}, Y: ${curY}`;

        const topo = Workstation.activeTopology;
        const node = topo && topo.nodes && topo.nodes[Workstation.draggedNodeId.toString()];
        if (node && !node.locked) {
          if (node.x !== curX || node.y !== curY) {
            hasMovedDuringDrag = true;
            Workstation._lastNodeDragMoved = true;
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

    // Spatial Pin Dragging & Interaction (Full parity with Pointcrawl Nodes)
    function onPinMouseDown(e, pinId) {
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
        if (typeof deleteSpatialPin === 'function') deleteSpatialPin(pinId);
        return;
      }

      const topo = Workstation.activeTopology;
      const targetPin = topo && Array.isArray(topo.spatialPins) ? topo.spatialPins.find(p => String(p.id) === String(pinId)) : null;
      if (!targetPin) return;

      if (e.ctrlKey) {
        e.stopPropagation();
        e.preventDefault();
        if (typeof selectByType === 'function') {
          selectByType('spatialPin', null, targetPin);
        }
        return;
      }

      if (e.shiftKey) {
        e.stopPropagation();
        e.preventDefault();
        if (typeof toggleEntitySelection === 'function') {
          toggleEntitySelection({ type: 'spatialPin', id: pinId, pin: targetPin });
        }
        return;
      }

      const isAlreadyInMulti = (typeof isEntitySelected === 'function' && isEntitySelected('spatialPin', pinId) && Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 1);

      // Detect rapid double-click on the same pin (survives SVG <g> replacement during selectSpatialPin -> renderCanvas)
      const now = Date.now();
      const isRapidSecondClick = (
        (e.detail && e.detail >= 2) ||
        (Workstation._lastPinMouseDownId !== undefined &&
         Workstation._lastPinMouseDownId !== null &&
         String(Workstation._lastPinMouseDownId) === String(pinId) &&
         Workstation._lastPinMouseDownTime &&
         (now - Workstation._lastPinMouseDownTime) < 420 &&
         !Workstation._lastPinDragMoved)
      );
      if (isRapidSecondClick) {
        Workstation._lastPinMouseDownId = null;
        Workstation._lastPinMouseDownTime = 0;
        Workstation._lastPinDragMoved = false;
        Workstation.isDraggingPin = false;
        Workstation.draggedPinId = null;
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        const links = (typeof getPinLinks === 'function') ? getPinLinks(targetPin) : (Array.isArray(targetPin.links) ? targetPin.links : []);
        const subLink = links.find(l => l.type === 'submap' && l.id);
        const primaryLink = links[0] || { type: targetPin.targetType || 'npc', id: targetPin.targetId || '' };
        const target = subLink || primaryLink;
        if (target.type === 'submap' && target.id && typeof switchActiveMap === 'function') {
          switchActiveMap(target.id);
        } else if (target.type === 'node' && target.id && typeof centerOnNode === 'function') {
          centerOnNode(target.id);
        } else if (target.type === 'ticket' && target.id && typeof openTicketCenter === 'function') {
          openTicketCenter();
          if (typeof switchTicketCenterTab === 'function') switchTicketCenterTab('campaign');
          if (typeof selectTicket === 'function') selectTicket(target.id, 'campaign');
        } else if (target.type && target.id && typeof openEntityManager === 'function') {
          openEntityManager(target.type, target.id);
        } else if (typeof openSpatialPinModal === 'function') {
          openSpatialPinModal(targetPin.x, targetPin.y, targetPin.id);
        }
        return;
      }

      Workstation._lastPinMouseDownId = pinId;
      Workstation._lastPinMouseDownTime = now;
      Workstation._lastPinDragMoved = false;

      if (!isAlreadyInMulti) {
        try {
          selectSpatialPin(pinId);
        } catch (err) {
          console.error('[Workstation] selectSpatialPin warning:', err);
        }
      }

      if (isAlreadyInMulti) {
        startGroupDrag(e);
        return;
      }

      if (targetPin.locked) {
        Workstation.isDraggingPin = false;
        Workstation.draggedPinId = null;
        setStatusBarMessage(`⚠️ Spatial Pin "${targetPin.label || targetPin.id}" is locked 🔒. Unlock in Properties Inspector to move.`);

        const startClientX = e.clientX || 0;
        const startClientY = e.clientY || 0;
        let alertFired = false;

        const onLockedPinMove = (ev) => {
          const dist = Math.hypot((ev.clientX || 0) - startClientX, (ev.clientY || 0) - startClientY);
          if (dist > 4 && !alertFired) {
            alertFired = true;
            window.removeEventListener('mousemove', onLockedPinMove);
            window.removeEventListener('mouseup', onLockedPinUp);
            const errMsg = `Cannot move Spatial Pin "${targetPin.label || targetPin.id}": Position is locked 🔒. Unlock "Position Locked" in Properties Inspector to move.`;
            setStatusBarMessage(`⚠️ ${errMsg}`);
            alert(errMsg);
          }
        };
        const onLockedPinUp = () => {
          window.removeEventListener('mousemove', onLockedPinMove);
          window.removeEventListener('mouseup', onLockedPinUp);
        };
        window.addEventListener('mousemove', onLockedPinMove);
        window.addEventListener('mouseup', onLockedPinUp);
        return;
      }

      if (e.preventDefault) e.preventDefault();

      const startClientX = e.clientX || 0;
      const startClientY = e.clientY || 0;
      const initX = targetPin.x || 0;
      const initY = targetPin.y || 0;
      let hasMovedDuringDrag = false;

      Workstation.isDraggingPin = true;
      Workstation._winPinDragActive = true;
      Workstation.draggedPinId = pinId;
      Workstation.dragStart = { x: startClientX, y: startClientY };
      Workstation.pinDragInit = { x: initX, y: initY, clientX: startClientX, clientY: startClientY };

      const onWinPinMouseMove = (ev) => {
        if (!Workstation.isDraggingPin || Workstation.draggedPinId === null) return;
        const dx = ((ev.clientX || 0) - startClientX) / (Workstation.zoom || 1);
        const dy = ((ev.clientY || 0) - startClientY) / (Workstation.zoom || 1);
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          hasMovedDuringDrag = true;
          Workstation._lastPinDragMoved = true;
          const rawX = Math.round(initX + dx);
          const rawY = Math.round(initY + dy);
          const curX = snapCoord(rawX, ev);
          const curY = snapCoord(rawY, ev);
          const coordsEl = document.getElementById('sb-coords');
          if (coordsEl) coordsEl.textContent = `X: ${curX}, Y: ${curY}`;

          const curTopo = Workstation.activeTopology;
          const pin = curTopo && Array.isArray(curTopo.spatialPins) ? curTopo.spatialPins.find(p => String(p.id) === String(Workstation.draggedPinId)) : null;
          if (pin && !pin.locked) {
            if (pin.x !== curX || pin.y !== curY) {
              pin.x = curX;
              pin.y = curY;
              scheduleRenderCanvas();
            }
          }
        }
      };

      const onWinPinMouseUp = () => {
        window.removeEventListener('mousemove', onWinPinMouseMove);
        window.removeEventListener('mouseup', onWinPinMouseUp);
        Workstation._winPinDragActive = false;
        if (Workstation.isDraggingPin) {
          Workstation.isDraggingPin = false;
          Workstation.draggedPinId = null;
          if (hasMovedDuringDrag) {
            try { updatePropertiesGrid(); } catch (err) { console.error(err); }
            try { saveActiveCampaign(); } catch (err) { console.error(err); }
          }
        }
      };

      window.addEventListener('mousemove', onWinPinMouseMove);
      window.addEventListener('mouseup', onWinPinMouseUp);
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
          const nextX = snapCoord(Math.round(initialX + dx), ev);
          const nextY = snapCoord(Math.round(initialY + dy), ev);
          const effDx = nextX - initialX;
          const effDy = nextY - initialY;
          shape.x = nextX;
          shape.y = nextY;
          if (shape.type === 'line') {
            shape.x2 = Math.round(initialX2 + effDx);
            shape.y2 = Math.round(initialY2 + effDy);
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

    // Interactive Grip Handle Resizing for Drawn Shapes (Rect, Circle/Ellipse, Line)
    function onShapeGripMouseDown(e, shape, handleKey) {
      if (!shape) return;
      const topo = Workstation.activeTopology;
      const sLayer = (typeof getLayerById === 'function') ? getLayerById(shape.layerId || 'layer-drawings', topo) : null;
      const isLocked = !!(shape.locked || (sLayer && sLayer.locked));
      if (isLocked) {
        setStatusBarMessage(`⚠️ Cannot resize locked shape "${shape.name || shape.id}" 🔒.`);
        return;
      }

      const cadSvg = document.getElementById('cad-svg');
      if (!cadSvg) return;

      const initRect = {
        x: shape.x || 0,
        y: shape.y || 0,
        w: Math.max(10, shape.width || 100),
        h: Math.max(10, shape.height || 60),
        rx: shape.rx || shape.radius || 40,
        ry: shape.ry || shape.radius || 40,
        x2: shape.x2 !== undefined ? shape.x2 : ((shape.x || 0) + 100),
        y2: shape.y2 !== undefined ? shape.y2 : (shape.y || 0)
      };

      let resized = false;
      const onGripMove = (ev) => {
        const svgRect = cadSvg.getBoundingClientRect();
        const rawX = Math.round((ev.clientX - svgRect.left - Workstation.pan.x) / (Workstation.zoom || 1));
        const rawY = Math.round((ev.clientY - svgRect.top - Workstation.pan.y) / (Workstation.zoom || 1));
        const curX = snapCoord(rawX, ev);
        const curY = snapCoord(rawY, ev);
        resized = true;

        if (shape.type === 'rect') {
          let left = initRect.x;
          let top = initRect.y;
          let right = initRect.x + initRect.w;
          let bottom = initRect.y + initRect.h;

          if (handleKey.includes('w')) left = Math.min(curX, right - 10);
          if (handleKey.includes('e')) right = Math.max(curX, left + 10);
          if (handleKey.includes('n')) top = Math.min(curY, bottom - 10);
          if (handleKey.includes('s')) bottom = Math.max(curY, top + 10);

          shape.x = Math.round(left);
          shape.y = Math.round(top);
          shape.width = Math.max(10, Math.round(right - left));
          shape.height = Math.max(10, Math.round(bottom - top));
          setStatusBarMessage(`Resizing "${shape.name || 'Box'}": X=${shape.x}, Y=${shape.y}, W=${shape.width}, H=${shape.height}`);
        } else if (shape.type === 'circle') {
          const cx = initRect.x;
          const cy = initRect.y;
          if (handleKey === 'e' || handleKey === 'w') {
            const newRx = Math.max(6, Math.round(Math.abs(curX - cx)));
            shape.rx = newRx;
            if (ev.shiftKey) shape.ry = newRx;
          } else if (handleKey === 'n' || handleKey === 's') {
            const newRy = Math.max(6, Math.round(Math.abs(curY - cy)));
            shape.ry = newRy;
            if (ev.shiftKey) shape.rx = newRy;
          }
          shape.radius = Math.max(shape.rx || 10, shape.ry || 10);
          setStatusBarMessage(`Resizing "${shape.name || 'Circle'}": RX=${shape.rx}, RY=${shape.ry} (Hold Shift for uniform circle)`);
        } else if (shape.type === 'line') {
          if (handleKey === 'start') {
            shape.x = curX;
            shape.y = curY;
          } else {
            shape.x2 = curX;
            shape.y2 = curY;
          }
          const len = Math.round(Math.hypot((shape.x2 || 0) - (shape.x || 0), (shape.y2 || 0) - (shape.y || 0)));
          setStatusBarMessage(`Resizing "${shape.name || 'Line'}": Length=${len}px`);
        }

        scheduleRenderCanvas();
      };

      const onGripUp = () => {
        window.removeEventListener('mousemove', onGripMove);
        window.removeEventListener('mouseup', onGripUp);
        if (resized) {
          try { updatePropertiesGrid(); } catch (err) { console.error(err); }
          try { saveActiveCampaign(); } catch (err) { console.error(err); }
        }
      };

      window.addEventListener('mousemove', onGripMove);
      window.addEventListener('mouseup', onGripUp);
    }
    window.onShapeGripMouseDown = onShapeGripMouseDown;

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
        addNodeAt(snapCoord(clickX, e), snapCoord(clickY, e), 2);
        return;
      } else if (Workstation.activeTool === 'node-t3') {
        addNodeAt(snapCoord(clickX, e), snapCoord(clickY, e), 3);
        return;
      } else if (Workstation.activeTool === 'pin') {
        const px = snapCoord(clickX, e);
        const py = snapCoord(clickY, e);
        const createdPin = addSpatialPinAt(px, py);
        if (createdPin && typeof openSpatialPinModal === 'function' && typeof document !== 'undefined' && document.getElementById('modal-spatial-pin-picker')) {
          openSpatialPinModal(px, py, createdPin.id);
        }
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

      if (Workstation.isDraggingPin && Workstation.draggedPinId !== null && Workstation.draggedPinId !== undefined) {
        const topo = Workstation.activeTopology;
        const pin = topo && Array.isArray(topo.spatialPins) ? topo.spatialPins.find(p => String(p.id) === String(Workstation.draggedPinId)) : null;
        if (pin && !pin.locked) {
          const dInit = Workstation.pinDragInit;
          const rawX = dInit ? Math.round(dInit.x + (((e.clientX || 0) - dInit.clientX) / (Workstation.zoom || 1))) : curX;
          const rawY = dInit ? Math.round(dInit.y + (((e.clientY || 0) - dInit.clientY) / (Workstation.zoom || 1))) : curY;
          const nx = snapCoord(rawX, e);
          const ny = snapCoord(rawY, e);
          if (pin.x !== nx || pin.y !== ny) {
            Workstation._lastPinDragMoved = true;
            pin.x = nx;
            pin.y = ny;
            scheduleRenderCanvas();
          }
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

        // 3. Enclosed spatial pins
        (topo.spatialPins || []).forEach(p => {
          if (!p) return;
          const isPlayerPreview = document.body.classList.contains('player-preview-active') || (typeof Workstation !== 'undefined' && Workstation.playerPreviewMode);
          if (isPlayerPreview && p.visible === false) return;
          const px = p.x || 0;
          const py = p.y || 0;
          if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
            found.push({ type: 'spatialPin', id: p.id, pin: p });
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
      if (Workstation.isDraggingPin) {
        Workstation.isDraggingPin = false;
        Workstation.draggedPinId = null;
        Workstation.pinDragInit = null;
        if (Workstation._lastPinDragMoved) {
          updatePropertiesGrid();
          saveActiveCampaign();
        }
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
      const layers = ['map-bg-layer', 'grid-layer', 'drawings-layer', 'edges-layer', 'corridor-labels-layer', 'nodes-layer', 'portals-layer', 'clocks-layer', 'spatial-pins-layer', 'interaction-layer'];
      layers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('transform', transform);
      });
    }

    // Spatial Pin Selection, Creation & Deletion (Multi-Entity POI Container)
    function normalizeSpatialPin(pin) {
      if (!pin || typeof pin !== 'object') return pin;
      if (pin.visible === undefined) pin.visible = true;
      if (pin.locked === undefined) pin.locked = false;
      if (!Array.isArray(pin.links)) {
        pin.links = [];
        if (pin.targetType && pin.targetId) {
          pin.links.push({ type: pin.targetType, id: String(pin.targetId) });
        }
      }
      // Keep legacy targetType / targetId synced with primary link for backwards compatibility
      if (pin.links.length > 0) {
        pin.targetType = pin.links[0].type || 'npc';
        pin.targetId = String(pin.links[0].id || '');
      } else if (!pin.targetType) {
        pin.targetType = 'npc';
        pin.targetId = '';
      }
      return pin;
    }
    window.normalizeSpatialPin = normalizeSpatialPin;

    function getPinLinks(pin) {
      if (!pin) return [];
      normalizeSpatialPin(pin);
      return Array.isArray(pin.links) ? pin.links : [];
    }
    window.getPinLinks = getPinLinks;

    function resolvePinLinkTitle(type, id) {
      const topo = Workstation.activeTopology;
      if (!topo) return String(id || '');
      const sId = String(id || '');
      if (type === 'submap') {
        const allMaps = (typeof maps !== 'undefined' && maps) ? maps : (topo.maps || {});
        const m = allMaps[sId];
        return m ? (m.name || sId) : sId;
      } else if (type === 'npc') {
        const n = (topo.npcs || []).find(item => String(item.id) === sId);
        return n ? (n.name || sId) : sId;
      } else if (type === 'item') {
        const it = (topo.items || []).find(item => String(item.id) === sId);
        return it ? (it.name || sId) : sId;
      } else if (type === 'quest') {
        const q = (topo.quests || []).find(item => String(item.id) === sId);
        return q ? (q.title || q.name || sId) : sId;
      } else if (type === 'tracker') {
        const t = (topo.trackers || []).find(item => String(item.id) === sId);
        return t ? (t.name || sId) : sId;
      } else if (type === 'faction') {
        const f = (topo.factions || []).find(item => String(item.id) === sId);
        return f ? (f.name || sId) : sId;
      } else if (type === 'ticket') {
        const tk = (topo.tickets || topo.customTickets || []).find(item => String(item.id) === sId);
        return tk ? (tk.title || tk.name || sId) : sId;
      }
      return sId;
    }
    window.resolvePinLinkTitle = resolvePinLinkTitle;

    function selectSpatialPin(pinId) {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(topo.spatialPins)) return;
      const pin = topo.spatialPins.find(p => String(p.id) === String(pinId));
      if (!pin) return;
      normalizeSpatialPin(pin);
      if (typeof setSelection === 'function') {
        setSelection([{ type: 'spatialPin', id: pin.id, pin: pin }]);
      } else {
        Workstation.selectedEntities = [{ type: 'spatialPin', id: pin.id, pin: pin }];
        Workstation.selectedEntity = { type: 'spatialPin', id: pin.id, pin: pin };
        renderCanvas();
        if (typeof updateObjectSelector === 'function') updateObjectSelector();
        if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
      }
      const linkCount = (pin.links || []).length;
      setStatusBarMessage(`Selected Spatial Pin [${(pin.targetType || 'pin').toUpperCase()}${linkCount > 1 ? ` +${linkCount - 1}` : ''}]: ${pin.label || pin.targetId || pin.id}`);
    }
    window.selectSpatialPin = selectSpatialPin;

    function addSpatialPinAt(x, y, targetType = null, targetId = null, label = null, extraLinks = null) {
      const topo = Workstation.activeTopology;
      if (!topo) return null;
      if (!Array.isArray(topo.spatialPins)) topo.spatialPins = [];

      // Choose a sensible default target if not specified
      let defType = targetType || 'npc';
      let defId = targetId || '';
      let defLabel = label || '';

      if (!targetType && (!Array.isArray(extraLinks) || extraLinks.length === 0)) {
        const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';
        const allMaps = (typeof maps !== 'undefined' && maps) ? maps : {};
        const childMapIds = Object.keys(allMaps).filter(mId => mId !== curMapId);
        if ((topo.npcs || []).length > 0) {
          defType = 'npc';
          defId = topo.npcs[0].id;
          defLabel = topo.npcs[0].name || defId;
        } else if (childMapIds.length > 0) {
          defType = 'submap';
          defId = childMapIds[0];
          defLabel = allMaps[defId].name || defId;
        } else if ((topo.quests || []).length > 0) {
          defType = 'quest';
          defId = topo.quests[0].id;
          defLabel = topo.quests[0].title || topo.quests[0].name || defId;
        } else {
          defLabel = `Pin ${topo.spatialPins.length + 1}`;
        }
      }

      const links = Array.isArray(extraLinks) && extraLinks.length > 0
        ? extraLinks.map(l => ({ type: l.type, id: String(l.id) }))
        : (defId ? [{ type: defType, id: String(defId) }] : []);

      if (links.length > 0) {
        defType = links[0].type;
        defId = links[0].id;
        if (!defLabel) defLabel = resolvePinLinkTitle(defType, defId);
      }

      const newPin = {
        id: `pin_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000).toString(36)}`,
        x: Math.round(x),
        y: Math.round(y),
        targetType: defType,
        targetId: defId,
        links: links,
        label: defLabel || `Pin ${topo.spatialPins.length + 1}`,
        visible: true,
        locked: false,
        notes: ''
      };

      topo.spatialPins.push(newPin);
      if (typeof setTool === 'function' && Workstation.activeTool === 'pin') {
        setTool('select');
      }
      selectSpatialPin(newPin.id);
      saveActiveCampaign();
      setStatusBarMessage(`Placed Spatial Pin "${newPin.label || newPin.id}" at (${newPin.x}, ${newPin.y}). Configure linked entities in modal or Properties Grid.`);
      return newPin;
    }
    window.addSpatialPinAt = addSpatialPinAt;

    function deleteSpatialPin(pinId, skipConfirm = false) {
      const topo = Workstation.activeTopology;
      if (!topo || !Array.isArray(topo.spatialPins)) return;
      const pin = topo.spatialPins.find(p => String(p.id) === String(pinId));
      if (!pin) return;
      if (!skipConfirm && typeof confirm === 'function' && !confirm(`Delete Spatial Pin "${pin.label || pin.id}"?`)) return;
      topo.spatialPins = topo.spatialPins.filter(p => String(p.id) !== String(pinId));
      if (Workstation.selectedEntity && Workstation.selectedEntity.type === 'spatialPin' && String(Workstation.selectedEntity.id) === String(pinId)) {
        Workstation.selectedEntity = { type: 'global' };
      }
      renderCanvas();
      if (typeof updateObjectSelector === 'function') updateObjectSelector();
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();
      saveActiveCampaign();
      setStatusBarMessage(`Deleted Spatial Pin "${pin.label || pin.id}".`);
    }
    window.deleteSpatialPin = deleteSpatialPin;

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

      // Remove incident corridors (adj, infBy, links, edgeData, edgeNotes, edgeSlottedModules) via canonical seam
      if (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.removeCorridorsForNode) {
        CampaignMutationEngine.removeCorridorsForNode(topo, nodeId, {
          nodesArray: typeof nodes !== 'undefined' ? nodes : null,
          linksArray: typeof links !== 'undefined' ? links : null,
          edgeSlottedModules: typeof edgeSlottedModules !== 'undefined' ? edgeSlottedModules : null
        });
      } else {
        Object.keys(topo.nodes).forEach(k => {
          const other = topo.nodes[k];
          if (other.adj) other.adj = other.adj.filter(id => String(id) !== String(nodeId));
          if (other.infBy) other.infBy = other.infBy.filter(id => String(id) !== String(nodeId));
        });
        if (topo.edgeData) {
          Object.keys(topo.edgeData).forEach(pairKey => {
            const matched = (typeof CampaignMutationEngine !== 'undefined' && CampaignMutationEngine.corridorMatchesNode)
              ? CampaignMutationEngine.corridorMatchesNode(pairKey, nodeId)
              : pairKey.split(/->|--|-/).some(part => String(part).trim() === String(nodeId));
            if (matched) {
              delete topo.edgeData[pairKey];
            }
          });
        }
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

      if (typeof pushHistoryState === 'function') {
        pushHistoryState(`Create ${edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road'}: ${uId} -> ${vId}`);
      }

      if (edgeType === 'road') {
        CampaignMutationEngine.addCorridor(topo, uId, vId, 'adj', {}, {
          nodesArray: typeof nodes !== 'undefined' ? nodes : null
        });
        setStatusBarMessage(`Created Transit Road between Node ${uId} and Node ${vId}.`);
      } else if (edgeType === 'hegemony') {
        CampaignMutationEngine.addCorridor(topo, uId, vId, 'inf', {}, {
          nodesArray: typeof nodes !== 'undefined' ? nodes : null
        });
        setStatusBarMessage(`Created Hegemony Vector: Node ${uId} -> Node ${vId}.`);
      }

      renderCanvas();
      saveActiveCampaign();
    }

    function deleteEdge(uId, vId, edgeType, targetMapId = null) {
      const curId = (typeof activeMapId !== "undefined") ? activeMapId : "map_root";
      const isTargetingChildMap = targetMapId && targetMapId !== curId;
      const mapDict = (typeof maps !== "undefined" && maps) ? maps : (Workstation.activeTopology && Workstation.activeTopology.maps ? Workstation.activeTopology.maps : {});

      const uKey = String(uId);
      const vKey = String(vId);
      const pairKey = CampaignMutationEngine.formatCorridorKey(uKey, vKey, 'adj');
      const edgeKey = CampaignMutationEngine.formatCorridorKey(uKey, vKey, edgeType === 'hegemony' ? 'inf' : 'adj');

      if (isTargetingChildMap) {
        const targetMap = mapDict[targetMapId];
        if (!targetMap) return;

        CampaignMutationEngine.removeCorridor(targetMap, uKey, vKey, edgeType === 'hegemony' ? 'inf' : 'adj');

        if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
        if (typeof CurrentEntityTab !== 'undefined' && CurrentEntityTab === 'edge' && typeof renderEntityManagerList === 'function') {
          renderEntityManagerList();
        }
        if (typeof setStatusBarMessage === 'function') {
          setStatusBarMessage(`Deleted corridor on child map ${targetMap.name || targetMapId}: ${uId} -> ${vId}.`);
        }
        return;
      }

      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) return;

      if (typeof pushHistoryState === 'function') {
        pushHistoryState(`Sever ${edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road'}: ${uId} -> ${vId}`);
      }

      CampaignMutationEngine.removeCorridor(topo, uKey, vKey, edgeType === 'hegemony' ? 'inf' : 'adj', {
        nodesArray: typeof nodes !== 'undefined' ? nodes : null,
        linksArray: typeof links !== 'undefined' ? links : null,
        edgeSlottedModules: typeof edgeSlottedModules !== 'undefined' ? edgeSlottedModules : null
      });

      selectGlobal();
      renderCanvas();
      saveActiveCampaign();
      if (typeof CurrentEntityTab !== 'undefined' && CurrentEntityTab === 'edge' && typeof renderEntityManagerList === 'function') {
        renderEntityManagerList();
      }
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

    function promptMovePin(pinId) {
      const topo = Workstation.activeTopology;
      const pin = topo && Array.isArray(topo.spatialPins) ? topo.spatialPins.find(p => String(p.id) === String(pinId)) : null;
      if (!pin) {
        alert("Please select a spatial pin to move.");
        return;
      }
      if (pin.locked) {
        const errMsg = `Cannot move Spatial Pin "${pin.label || pin.id}": Position is locked 🔒. Unlock "Position Locked" in Properties Inspector to move.`;
        setStatusBarMessage(`⚠️ ${errMsg}`);
        alert(errMsg);
        return;
      }
      const input = prompt(`Enter new coordinates for Spatial Pin "${pin.label || pin.id}" as "X, Y" (Canvas bounds 0-2000, 0-1500):`, `${Math.round(pin.x || 0)}, ${Math.round(pin.y || 0)}`);
      if (input === null) return;
      const parts = input.split(',').map(s => parseInt(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        pin.x = parts[0];
        pin.y = parts[1];
        renderCanvas();
        updatePropertiesGrid();
        saveActiveCampaign();
        setStatusBarMessage(`Moved Spatial Pin "${pin.label || pin.id}" to (${pin.x}, ${pin.y}).`);
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

    // Snap-to-Grid (20px CAD Alignment)
    function snapCoord(val, ev) {
      const num = Math.round(Number(val) || 0);
      if (ev && ev.altKey) return num; // Holding Alt temporarily bypasses grid snap
      if (Workstation && Workstation.snapToGrid) {
        const step = Number(Workstation.gridSnapSize) || 20;
        return Math.round(num / step) * step;
      }
      return num;
    }

    function toggleSnapToGrid() {
      if (!Workstation) return;
      Workstation.snapToGrid = !Workstation.snapToGrid;
      if (!Workstation.gridSnapSize) Workstation.gridSnapSize = 20;
      const btn = document.getElementById('btn-snap-grid');
      if (btn) btn.classList.toggle('active', !!Workstation.snapToGrid);
      const chk = document.getElementById('menu-check-snap');
      if (chk) chk.textContent = Workstation.snapToGrid ? '✓' : '';
      setStatusBarMessage(`Snap to Grid (20px): ${Workstation.snapToGrid ? 'ENABLED' : 'DISABLED'} (Hold Alt while dragging to bypass)`);
    }

    // Zoom to Fit All / Frame Selection ([F])
    function zoomToFitCanvas(onlySelected = false) {
      const topo = Workstation.activeTopology;
      if (!topo) return;
      const container = document.getElementById('canvas-container');
      const rect = container ? container.getBoundingClientRect() : { width: 900, height: 650 };
      const viewW = Math.max(200, rect.width || 900);
      const viewH = Math.max(200, rect.height || 650);

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const includePt = (x, y, pad = 35) => {
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) return;
        if (x - pad < minX) minX = x - pad;
        if (y - pad < minY) minY = y - pad;
        if (x + pad > maxX) maxX = x + pad;
        if (y + pad > maxY) maxY = y + pad;
      };

      const selList = Array.isArray(Workstation.selectedEntities) && Workstation.selectedEntities.length > 0
        ? Workstation.selectedEntities
        : (Workstation.selectedEntity && Workstation.selectedEntity.type !== 'global' ? [Workstation.selectedEntity] : []);

      if (onlySelected || selList.length > 0) {
        selList.forEach(item => {
          if (item.type === 'node') {
            const n = item.node || (topo.nodes && topo.nodes[String(item.id)]);
            if (n) includePt(n.x, n.y, 45);
          } else if (item.type === 'spatialPin') {
            const p = item.pin || (topo.spatialPins || []).find(sp => String(sp.id) === String(item.id));
            if (p) includePt(p.x, p.y, 40);
          } else if (item.type === 'shape') {
            const s = item.shape || (topo.shapes || []).find(sh => String(sh.id) === String(item.id));
            if (s) {
              includePt(s.x || 0, s.y || 0, 20);
              if (s.type === 'rect') includePt((s.x || 0) + (s.width || 100), (s.y || 0) + (s.height || 60), 20);
              else if (s.type === 'circle') {
                const r = s.radius || 40;
                includePt((s.x || 0) - (s.rx || r), (s.y || 0) - (s.ry || r), 20);
                includePt((s.x || 0) + (s.rx || r), (s.y || 0) + (s.ry || r), 20);
              } else if (s.type === 'line') {
                includePt(s.x2 !== undefined ? s.x2 : (s.x || 0), s.y2 !== undefined ? s.y2 : (s.y || 0), 20);
              }
            }
          } else if (item.type === 'edge' && topo.nodes) {
            const u = topo.nodes[String(item.u)];
            const v = topo.nodes[String(item.v)];
            if (u) includePt(u.x, u.y, 45);
            if (v) includePt(v.x, v.y, 45);
          }
        });
      }

      // If nothing was selected or selection had no spatial bounds, fit all visible canvas entities
      if (minX === Infinity) {
        Object.values(topo.nodes || {}).forEach(n => {
          if (n) includePt(n.x, n.y, 50);
        });
        (topo.spatialPins || []).forEach(p => {
          if (p && p.visible !== false) includePt(p.x, p.y, 40);
        });
        (topo.shapes || []).forEach(s => {
          if (!s || s.visible === false) return;
          includePt(s.x || 0, s.y || 0, 20);
          if (s.type === 'rect') includePt((s.x || 0) + (s.width || 100), (s.y || 0) + (s.height || 60), 20);
          else if (s.type === 'circle') {
            const r = s.radius || 40;
            includePt((s.x || 0) + (s.rx || r), (s.y || 0) + (s.ry || r), 20);
          } else if (s.type === 'line') {
            includePt(s.x2 !== undefined ? s.x2 : (s.x || 0), s.y2 !== undefined ? s.y2 : (s.y || 0), 20);
          }
        });
      }

      if (minX === Infinity) {
        resetZoom();
        return;
      }

      const contentW = Math.max(120, maxX - minX);
      const contentH = Math.max(120, maxY - minY);
      const margin = 80;
      const scaleX = (viewW - margin) / contentW;
      const scaleY = (viewH - margin) / contentH;
      const newZoom = Math.min(2.2, Math.max(0.15, Math.min(scaleX, scaleY)));

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      Workstation.zoom = newZoom;
      Workstation.pan.x = Math.round((viewW / 2) - centerX * newZoom);
      Workstation.pan.y = Math.round((viewH / 2) - centerY * newZoom);

      applyCanvasTransform();
      const zoomPct = Math.round(Workstation.zoom * 100);
      const zoomEl = document.getElementById('sb-zoom');
      if (zoomEl) zoomEl.textContent = `Zoom: ${zoomPct}%`;
      setStatusBarMessage(`Framed canvas view (${zoomPct}% zoom).`);
    }

    function panToCanvasPoint(x, y, targetZoom = null, pulseRing = true) {
      const container = document.getElementById('canvas-container');
      const rect = container ? container.getBoundingClientRect() : { width: 900, height: 650 };
      const viewW = Math.max(200, rect.width || 900);
      const viewH = Math.max(200, rect.height || 650);

      if (targetZoom !== null && !isNaN(targetZoom)) {
        Workstation.zoom = Math.min(4.0, Math.max(0.2, targetZoom));
      }
      Workstation.pan.x = Math.round((viewW / 2) - x * Workstation.zoom);
      Workstation.pan.y = Math.round((viewH / 2) - y * Workstation.zoom);
      applyCanvasTransform();
      const zoomPct = Math.round(Workstation.zoom * 100);
      const zoomEl = document.getElementById('sb-zoom');
      if (zoomEl) zoomEl.textContent = `Zoom: ${zoomPct}%`;
      if (pulseRing) pingCanvasCoordinate(x, y);
    }

    function pingCanvasCoordinate(x, y) {
      const layer = document.getElementById('interaction-layer');
      if (!layer) return;
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', x);
      ring.setAttribute('cy', y);
      ring.setAttribute('r', '26');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#ffca28');
      ring.setAttribute('stroke-width', '3');
      ring.setAttribute('class', 'cad-ping-ring');
      layer.appendChild(ring);
      setTimeout(() => {
        if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
      }, 1350);
    }

    // =========================================================================
    // Multi-Link Spatial Pin / POI Configuration Modal (#modal-spatial-pin-picker)
    // =========================================================================
    let _spatialPinModalState = {
      activeTab: 'npc',
      links: [] // Array of { type, id }
    };

    function openSpatialPinModal(x, y, existingPinId = null) {
      const modal = document.getElementById('modal-spatial-pin-picker');
      if (!modal) return;
      const topo = Workstation.activeTopology;
      if (!topo) return;

      let existingPin = null;
      if (existingPinId && Array.isArray(topo.spatialPins)) {
        existingPin = topo.spatialPins.find(p => String(p.id) === String(existingPinId));
      }

      const idEl = document.getElementById('spp-pin-id');
      const xEl = document.getElementById('spp-x');
      const yEl = document.getElementById('spp-y');
      const labelEl = document.getElementById('spp-label');
      const iconEl = document.getElementById('spp-icon');
      const visEl = document.getElementById('spp-visible');
      const notesEl = document.getElementById('spp-notes');
      const searchEl = document.getElementById('spp-search');

      if (idEl) idEl.value = existingPin ? existingPin.id : '';
      if (xEl) xEl.value = existingPin ? existingPin.x : Math.round(x || 400);
      if (yEl) yEl.value = existingPin ? existingPin.y : Math.round(y || 300);
      if (labelEl) labelEl.value = existingPin ? (existingPin.label || '') : '';
      if (iconEl) iconEl.value = existingPin ? (existingPin.icon || '') : '';
      if (visEl) visEl.checked = existingPin ? (existingPin.visible !== false) : true;
      if (notesEl) notesEl.value = existingPin ? (existingPin.notes || '') : '';
      if (searchEl) searchEl.value = '';

      if (existingPin) {
        normalizeSpatialPin(existingPin);
        _spatialPinModalState.links = (existingPin.links || []).map(l => ({ type: l.type, id: String(l.id) }));
        if (_spatialPinModalState.links.length > 0) {
          _spatialPinModalState.activeTab = _spatialPinModalState.links[0].type || 'all';
        } else {
          _spatialPinModalState.activeTab = 'all';
        }
      } else {
        _spatialPinModalState.links = [];
        _spatialPinModalState.activeTab = 'all';
      }

      if (typeof openModal === 'function') {
        openModal('modal-spatial-pin-picker');
      } else {
        modal.classList.remove('hidden');
      }
      setSpatialPinModalTab(_spatialPinModalState.activeTab);
      renderSpatialPinSelectedTags();
    }

    function setSpatialPinModalTab(tab) {
      _spatialPinModalState.activeTab = tab || 'all';
      const tabContainer = document.getElementById('spp-filter-tabs');
      if (tabContainer) {
        tabContainer.querySelectorAll('button[data-spp-tab]').forEach(btn => {
          const isAct = btn.getAttribute('data-spp-tab') === _spatialPinModalState.activeTab;
          btn.classList.toggle('active', isAct);
        });
      }
      renderSpatialPinModalChecklist();
    }

    function getEntitiesForSpatialPinTab(tab) {
      const topo = Workstation.activeTopology;
      if (!topo) return [];
      const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';
      const allMaps = (typeof maps !== 'undefined' && maps) ? maps : (topo.maps || {});

      const collectSingleTab = (t) => {
        if (t === 'npc') {
          return (topo.npcs || []).map(n => ({
            type: 'npc',
            id: String(n.id),
            title: n.name || n.id,
            meta: `${n.archetype || n.role || 'NPC'}${n.currentNodeId ? ' @ Node ' + n.currentNodeId : ''}`
          }));
        } else if (t === 'item') {
          return (topo.items || []).map(it => ({
            type: 'item',
            id: String(it.id),
            title: it.name || it.id,
            meta: `${it.type || it.category || 'Item'}${it.rarity ? ' • ' + it.rarity : ''}`
          }));
        } else if (t === 'submap') {
          return Object.keys(allMaps).filter(mId => mId !== curMapId).map(mId => {
            const m = allMaps[mId] || {};
            return {
              type: 'submap',
              id: String(mId),
              title: m.name || mId,
              meta: `${m.scaleTier || m.scale || 'Sub-Map'} (${Object.keys(m.nodes || {}).length} nodes)`
            };
          });
        } else if (t === 'quest') {
          return (topo.quests || []).map(q => ({
            type: 'quest',
            id: String(q.id),
            title: q.title || q.name || q.id,
            meta: `${q.status || 'Active'}`
          }));
        } else if (t === 'tracker') {
          return (topo.trackers || []).map(tr => ({
            type: 'tracker',
            id: String(tr.id),
            title: tr.name || tr.id,
            meta: `${tr.currentTicks !== undefined ? tr.currentTicks : (tr.value || 0)}/${tr.maxTicks || tr.max || 6} segments`
          }));
        } else if (t === 'faction') {
          return (topo.factions || []).map(f => ({
            type: 'faction',
            id: String(f.id),
            title: f.name || f.id,
            meta: `${f.culture || f.quadrant || 'Faction'}`
          }));
        } else if (t === 'ticket') {
          return (topo.tickets || topo.customTickets || []).map(tk => ({
            type: 'ticket',
            id: String(tk.id),
            title: tk.title || tk.name || tk.id,
            meta: `${tk.status || 'Todo'} • ${tk.priority || 'Med'}`
          }));
        }
        return [];
      };

      if (tab === 'all') {
        return [
          ...collectSingleTab('submap'),
          ...collectSingleTab('npc'),
          ...collectSingleTab('item'),
          ...collectSingleTab('quest'),
          ...collectSingleTab('tracker'),
          ...collectSingleTab('faction'),
          ...collectSingleTab('ticket')
        ];
      }
      return collectSingleTab(tab);
    }

    function renderSpatialPinModalChecklist() {
      const listEl = document.getElementById('spp-entities-checklist');
      if (!listEl) return;

      const tab = _spatialPinModalState.activeTab || 'all';
      const filterEl = document.getElementById('spp-search');
      const q = filterEl ? (filterEl.value || '').trim().toLowerCase() : '';

      const items = getEntitiesForSpatialPinTab(tab).filter(item => {
        if (!q) return true;
        return item.title.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || (item.meta || '').toLowerCase().includes(q);
      });

      const iconMap = { npc: '👤', item: '🎒', submap: '🌀', quest: '📜', tracker: '⏱️', faction: '🛡️', ticket: '🎫' };

      if (items.length === 0) {
        listEl.innerHTML = `<div style="padding:14px; text-align:center; color:#666; font-size:11px;">No matching entities found. Use the <b>Quick-Create &amp; Link New</b> buttons above to create one on the spot!</div>`;
        return;
      }

      listEl.innerHTML = items.map(item => {
        const iType = item.type || tab;
        const isChecked = _spatialPinModalState.links.some(l => l.type === iType && String(l.id) === String(item.id));
        const safeId = String(item.id).replace(/'/g, "\\'");
        return `<label style="display:flex; align-items:center; justify-content:space-between; padding:4px 6px; border-bottom:1px dotted #ddd; cursor:pointer; font-size:11px; background:${isChecked ? '#e0f2fe' : 'transparent'};">
          <span style="display:flex; align-items:center; gap:6px;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSpatialPinModalLink('${iType}', '${safeId}', this.checked)">
            <span>${iconMap[iType] || '📌'}</span>
            <b>${escapeHtml(item.title)}</b>
            <span style="color:#666; font-size:10px;">[${escapeHtml(iType.toUpperCase())}: ${escapeHtml(item.id)}]</span>
          </span>
          <span style="font-size:10px; color:#555;">${escapeHtml(item.meta || '')}</span>
        </label>`;
      }).join('');
    }

    function toggleSpatialPinModalLink(type, id, checked) {
      const sId = String(id);
      const existsIdx = _spatialPinModalState.links.findIndex(l => l.type === type && String(l.id) === sId);
      if (checked && existsIdx === -1) {
        _spatialPinModalState.links.push({ type, id: sId });
        const labelInput = document.getElementById('spp-label');
        if (labelInput && (!labelInput.value || /^Pin \d+$/.test(labelInput.value.trim()))) {
          labelInput.value = resolvePinLinkTitle(type, sId);
        }
      } else if (!checked && existsIdx !== -1) {
        _spatialPinModalState.links.splice(existsIdx, 1);
      }
      renderSpatialPinModalChecklist();
      renderSpatialPinSelectedTags();
    }

    function removeSpatialPinModalLink(type, id) {
      toggleSpatialPinModalLink(type, id, false);
    }

    function renderSpatialPinSelectedTags() {
      const container = document.getElementById('spp-selected-summary');
      if (!container) return;
      if (_spatialPinModalState.links.length === 0) {
        container.innerHTML = `0 linked entities selected (standalone map marker).`;
        return;
      }
      const iconMap = { npc: '👤', item: '🎒', submap: '🌀', quest: '📜', tracker: '⏱️', faction: '🛡️', ticket: '🎫' };
      container.innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">` + _spatialPinModalState.links.map((l, idx) => {
        const title = resolvePinLinkTitle(l.type, l.id);
        const safeId = String(l.id).replace(/'/g, "\\'");
        return `<span style="display:inline-flex; align-items:center; gap:4px; padding:1px 6px; background:${idx === 0 ? '#fff8e1' : '#ffffff'}; border:1px solid ${idx === 0 ? '#f57f17' : '#0284c7'}; border-radius:3px; font-size:10px; font-weight:bold;">
          <span>${iconMap[l.type] || '📌'} ${escapeHtml(title)}</span>
          ${idx === 0 ? '<span style="font-size:9px; color:#e65100;">(Primary)</span>' : ''}
          <button type="button" style="border:none; background:transparent; color:#b71c1c; cursor:pointer; font-weight:bold; padding:0 2px;" onclick="removeSpatialPinModalLink('${l.type}', '${safeId}')" title="Unlink">✕</button>
        </span>`;
      }).join('') + `</div>`;
    }

    function quickCreateForSpatialPin(type) {
      const topo = Workstation.activeTopology;
      if (!topo) return;
      const namePromptMap = {
        npc: 'Enter name for new NPC:',
        item: 'Enter name for new Item / Loot:',
        submap: 'Enter name for new Sub-Map / Portal destination:',
        quest: 'Enter title for new Quest / Hook:',
        tracker: 'Enter name for new Clock / Tracker:',
        faction: 'Enter name for new Faction:',
        ticket: 'Enter title for new GM Ticket:'
      };
      const rawName = (typeof prompt === 'function') ? prompt(namePromptMap[type] || 'Enter name for new entity:') : null;
      if (!rawName || !rawName.trim()) return;
      const name = rawName.trim();
      let newId = '';

      const cme = (typeof window !== 'undefined' && window.CampaignMutationEngine) || (typeof CampaignMutationEngine !== 'undefined' ? CampaignMutationEngine : null);

      if (type === 'npc') {
        if (!Array.isArray(topo.npcs)) topo.npcs = [];
        newId = `npc_${Date.now().toString(36)}`;
        topo.npcs.push({ id: newId, name: name, role: 'Key Figure', odv: { s: 2, e: 2, c: 2 }, disposition: [2, 2, 2], status: 'Active', relationships: [], inventory: [], notes: '' });
      } else if (type === 'item') {
        if (!Array.isArray(topo.items)) topo.items = [];
        newId = `item_${Date.now().toString(36)}`;
        topo.items.push({ id: newId, name: name, category: 'Artifact', type: 'Artifact', rarity: 'Uncommon', possessionMode: 'stored', description: '' });
      } else if (type === 'submap') {
        const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';
        if (typeof createMap === 'function') {
          const createdMap = createMap(name, 'site', curMapId, null);
          if (createdMap && createdMap.id) newId = createdMap.id;
        }
        if (!newId) {
          const allMaps = (typeof maps !== 'undefined' && maps) ? maps : (topo.maps || {});
          newId = `map_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString(36).slice(-3)}`;
          allMaps[newId] = {
            id: newId,
            name: name,
            scaleTier: 'site',
            parentMapId: curMapId,
            parentNodeId: null,
            nodes: [],
            links: [],
            edgeData: {},
            shapes: [],
            spatialPins: []
          };
        }
        if (typeof renderMapNavigatorTree === 'function') renderMapNavigatorTree();
        if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
      } else if (type === 'quest') {
        if (!Array.isArray(topo.quests)) topo.quests = [];
        newId = `quest_${Date.now().toString(36)}`;
        topo.quests.push({ id: newId, title: name, name: name, status: 'Active', npcIds: [], itemIds: [], trackerIds: [], steps: [], description: '' });
      } else if (type === 'tracker') {
        if (!Array.isArray(topo.trackers)) topo.trackers = [];
        newId = `trk_${Date.now().toString(36)}`;
        topo.trackers.push({ id: newId, name: name, currentTicks: 0, maxTicks: 6, value: 0, max: 6, scopeTier: 'settlement', category: 'Threat Clock', triggerRefs: [], consequences: [] });
      } else if (type === 'faction') {
        if (!Array.isArray(topo.factions)) topo.factions = [];
        newId = `fac_${Date.now().toString(36)}`;
        topo.factions.push({ id: newId, name: name, cvfQuadrant: 'Clan', culture: 'Clan', quadrant: 'Clan', odv: { s: 2, e: 2, c: 2 }, disposition: [2, 2, 2], influence: 50, controlledNodeIds: [], diplomaticStances: {}, notes: '' });
      } else if (type === 'ticket') {
        if (!Array.isArray(topo.tickets)) topo.tickets = [];
        newId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
        topo.tickets.push({ id: newId, title: name, status: 'Todo', priority: 'Medium', notes: '' });
      }

      if (cme && typeof cme.normalizeEntities === 'function' && type !== 'submap') {
        cme.normalizeEntities(topo);
      }

      if (newId) {
        toggleSpatialPinModalLink(type, newId, true);
        if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
        saveActiveCampaign();
      }
    }

    function submitSpatialPinModal() {
      const topo = Workstation.activeTopology;
      if (!topo) return;
      if (!Array.isArray(topo.spatialPins)) topo.spatialPins = [];

      const idEl = document.getElementById('spp-pin-id');
      const xEl = document.getElementById('spp-x');
      const yEl = document.getElementById('spp-y');
      const labelEl = document.getElementById('spp-label');
      const iconEl = document.getElementById('spp-icon');
      const visEl = document.getElementById('spp-visible');
      const notesEl = document.getElementById('spp-notes');

      const pinId = idEl ? idEl.value : '';
      const x = xEl ? (parseInt(xEl.value) || 400) : 400;
      const y = yEl ? (parseInt(yEl.value) || 300) : 300;
      const label = labelEl ? (labelEl.value || '').trim() : '';
      const icon = iconEl ? (iconEl.value || '') : '';
      const visible = visEl ? visEl.checked : true;
      const notes = notesEl ? (notesEl.value || '') : '';

      let pin = pinId ? topo.spatialPins.find(p => String(p.id) === String(pinId)) : null;
      if (!pin) {
        pin = addSpatialPinAt(x, y, null, null, label, _spatialPinModalState.links);
      }
      if (pin) {
        pin.x = x;
        pin.y = y;
        pin.links = _spatialPinModalState.links.map(l => ({ type: l.type, id: String(l.id) }));
        if (pin.links.length > 0) {
          pin.targetType = pin.links[0].type;
          pin.targetId = String(pin.links[0].id);
        }
        pin.label = label || (pin.links.length > 0 ? resolvePinLinkTitle(pin.links[0].type, pin.links[0].id) : pin.label || 'POI Pin');
        pin.icon = icon;
        pin.visible = visible;
        pin.notes = notes;
        normalizeSpatialPin(pin);
      }

      if (typeof closeModal === 'function') {
        closeModal('modal-spatial-pin-picker');
      } else {
        const modal = document.getElementById('modal-spatial-pin-picker');
        if (modal) modal.classList.add('hidden');
      }

      renderCanvas();
      if (pin) selectSpatialPin(pin.id);
      saveActiveCampaign();
      setStatusBarMessage(`Saved Spatial Pin "${pin ? pin.label : ''}" (${_spatialPinModalState.links.length} linked entities).`);
    }

    // =========================================================================
    // Drag-and-Drop Entities from Roster / Map Tree onto Canvas
    // =========================================================================
    function onEntityListDragStart(ev, type, id, label, isPrototype = false) {
      if (!ev || !ev.dataTransfer) return;
      const typeNorm = (type === 'npcs') ? 'npc'
        : (type === 'items') ? 'item'
        : (type === 'quests') ? 'quest'
        : (type === 'trackers') ? 'tracker'
        : (type === 'factions') ? 'faction'
        : (type === 'tickets') ? 'ticket'
        : type;
      const payload = JSON.stringify({
        csEntityDrop: true,
        type: typeNorm,
        id: String(id),
        label: String(label || id),
        isPrototype: !!isPrototype
      });
      ev.dataTransfer.setData('application/x-cs-entity', payload);
      ev.dataTransfer.setData('text/plain', payload);
      ev.dataTransfer.effectAllowed = 'copyLink';
    }

    function handleCanvasEntityDrop(e) {
      if (!e || !e.dataTransfer) return false;
      let raw = e.dataTransfer.getData('application/x-cs-entity') || '';
      if (!raw) {
        const txt = e.dataTransfer.getData('text/plain') || '';
        if (txt.startsWith('{') && txt.includes('"csEntityDrop":true')) raw = txt;
      }
      if (!raw) return false;

      let data = null;
      try { data = JSON.parse(raw); } catch (err) { return false; }
      if (!data || !data.csEntityDrop) return false;

      const svg = document.getElementById('cad-svg');
      const rect = svg ? svg.getBoundingClientRect() : { left: 0, top: 0 };
      const worldX = snapCoord((e.clientX - rect.left - Workstation.pan.x) / Workstation.zoom, e);
      const worldY = snapCoord((e.clientY - rect.top - Workstation.pan.y) / Workstation.zoom, e);

      const topo = Workstation.activeTopology;
      if (!topo) return true;

      let targetId = String(data.id);
      let targetLabel = data.label || targetId;

      // If dragging a prototype item or NPC, instantiate it into the active topology first
      if (data.isPrototype && data.type === 'item' && typeof instantiateItemPrototype === 'function') {
        const inst = instantiateItemPrototype(targetId);
        if (inst && inst.id) {
          targetId = String(inst.id);
          targetLabel = inst.name || targetLabel;
        }
      }

      // Check if dropped directly onto an existing Spatial Pin (within 24px) -> append link to that pin!
      const hitPin = (topo.spatialPins || []).find(p => {
        if (!p || p.visible === false) return false;
        const dx = (p.x || 0) - worldX;
        const dy = (p.y || 0) - worldY;
        return Math.sqrt(dx * dx + dy * dy) <= 24;
      });

      if (hitPin) {
        normalizeSpatialPin(hitPin);
        if (!hitPin.links.some(l => l.type === data.type && String(l.id) === targetId)) {
          hitPin.links.push({ type: data.type, id: targetId });
          normalizeSpatialPin(hitPin);
        }
        selectSpatialPin(hitPin.id);
        saveActiveCampaign();
        setStatusBarMessage(`Linked [${data.type.toUpperCase()}] "${targetLabel}" into existing Spatial Pin "${hitPin.label || hitPin.id}".`);
        return true;
      }

      const created = addSpatialPinAt(worldX, worldY, data.type, targetId, targetLabel, [{ type: data.type, id: targetId }]);
      if (created) {
        setStatusBarMessage(`Dropped [${data.type.toUpperCase()}] "${targetLabel}" as Spatial Pin at (${worldX}, ${worldY}).`);
      }
      return true;
    }

    // =========================================================================
    // Right-Click Canvas Context Menu (#cad-context-menu)
    // =========================================================================
    function closeCanvasContextMenu() {
      const menu = document.getElementById('cad-context-menu');
      if (menu) menu.style.display = 'none';
    }

    function openCanvasContextMenu(e, contextType, data) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      hideCanvasHoverCard();

      const menu = document.getElementById('cad-context-menu');
      if (!menu) return;

      const svg = document.getElementById('cad-svg');
      const rect = svg ? svg.getBoundingClientRect() : { left: 0, top: 0 };
      const worldX = snapCoord(((e ? e.clientX : 400) - rect.left - Workstation.pan.x) / Workstation.zoom, e);
      const worldY = snapCoord(((e ? e.clientY : 300) - rect.top - Workstation.pan.y) / Workstation.zoom, e);

      let rowsHtml = '';

      if (contextType === 'node' && data) {
        const node = data;
        const nId = String(node.id).replace(/'/g, "\\'");
        rowsHtml = `
          <div class="ctx-header">📍 Node ${escapeHtml(String(node.id))}: ${escapeHtml(node.name || '')}</div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); selectNode('${nId}'); if(typeof openEntityManager==='function'){ openEntityManager('node'); if(typeof selectEntityItem==='function') selectEntityItem('${nId}'); }"><span>🔍 Inspect in Node Explorer</span><span class="ctx-shortcut">DblClick</span></div>
          ${node.childMapId ? `<div class="ctx-item" onclick="closeCanvasContextMenu(); if(typeof switchActiveMap==='function') switchActiveMap('${escapeHtml(node.childMapId)}');"><span>🗺️ Enter Portal Sub-Map (${escapeHtml(node.childMapId)})</span></div>` : `<div class="ctx-item" onclick="closeCanvasContextMenu(); selectNode('${nId}'); if(typeof promptCreateNewSubMapForNode==='function') promptCreateNewSubMapForNode('${nId}');"><span>🗺️ Create / Link Child Sub-Map...</span></div>`}
          <div class="ctx-item" onclick="closeCanvasContextMenu(); openSpatialPinModal(${ (node.x || 0) + 28 }, ${ (node.y || 0) - 24 }, null);"><span>📌 Drop Spatial Pin Near Node...</span></div>
          <div class="ctx-sep"></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); Workstation.activeTopology.nodes['${nId}'].locked = !Workstation.activeTopology.nodes['${nId}'].locked; renderCanvas(); updatePropertiesGrid(); saveActiveCampaign();"><span>${node.locked ? '🔓 Unlock Node Position' : '🔒 Lock Node Position'}</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); promptMoveNode('${nId}');"><span>📐 Move to Exact Coordinates...</span></div>
          <div class="ctx-sep"></div>
          <div class="ctx-item" style="color:#b71c1c;" onclick="closeCanvasContextMenu(); deleteNode('${nId}');"><span>🗑️ Delete Node</span><span class="ctx-shortcut">Del</span></div>
        `;
      } else if (contextType === 'spatialPin' && data) {
        const pin = normalizeSpatialPin(data);
        const pId = String(pin.id).replace(/'/g, "\\'");
        const links = getPinLinks(pin);
        const submapLink = links.find(l => l.type === 'submap');
        const trackerLink = links.find(l => l.type === 'tracker');
        rowsHtml = `
          <div class="ctx-header">📌 Pin: ${escapeHtml(pin.label || pin.id)} (${links.length} link${links.length === 1 ? '' : 's'})</div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); openSpatialPinModal(${pin.x || 0}, ${pin.y || 0}, '${pId}');"><span>⚙️ Configure Linked Entities / Edit Pin...</span></div>
          ${submapLink ? `<div class="ctx-item" onclick="closeCanvasContextMenu(); if(typeof switchActiveMap==='function') switchActiveMap('${escapeHtml(submapLink.id)}');"><span>🗺️ Enter Linked Portal Map (${escapeHtml(resolvePinLinkTitle('submap', submapLink.id))})</span></div>` : ''}
          ${trackerLink ? `<div class="ctx-item" onclick="closeCanvasContextMenu(); (function(){ const tId='${escapeHtml(trackerLink.id)}'; if(typeof advanceTrackerTick==='function'){ advanceTrackerTick(tId, 1); } else if(typeof adjustTrackerTicks==='function'){ adjustTrackerTicks(tId, 1); } else { const t=(Workstation.activeTopology.trackers||[]).find(x=>String(x.id)===tId); if(t){ const maxT=t.maxTicks||t.max||6; const curT=(t.currentTicks!==undefined?t.currentTicks:(t.value||0)); const nextT=(curT+1)>maxT?0:(curT+1); if(window.CampaignMutationEngine&&typeof window.CampaignMutationEngine.tickClock==='function'){ window.CampaignMutationEngine.tickClock(Workstation.activeTopology, tId, nextT - curT); } else { t.currentTicks=nextT; t.value=nextT; } if(typeof evaluateTrackerConsequences==='function'){ evaluateTrackerConsequences(t, curT, t.currentTicks); } } } renderCanvas(); updatePropertiesGrid(); saveActiveCampaign(); })();"><span>⏱️ Advance Linked Clock (+1 Tick)</span></div>` : ''}
          <div class="ctx-sep"></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); (function(){ const p=(Workstation.activeTopology.spatialPins||[]).find(x=>String(x.id)==='${pId}'); if(p){ p.visible = (p.visible === false); renderCanvas(); updatePropertiesGrid(); saveActiveCampaign(); } })();"><span>${pin.visible === false ? '👁️ Show Pin on Canvas' : '🌫️ Hide Pin on Canvas'}</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); (function(){ const p=(Workstation.activeTopology.spatialPins||[]).find(x=>String(x.id)==='${pId}'); if(p){ p.locked = !p.locked; renderCanvas(); updatePropertiesGrid(); saveActiveCampaign(); } })();"><span>${pin.locked ? '🔓 Unlock Pin Position' : '🔒 Lock Pin Position'}</span></div>
          <div class="ctx-sep"></div>
          <div class="ctx-item" style="color:#b71c1c;" onclick="closeCanvasContextMenu(); deleteSpatialPin('${pId}');"><span>🗑️ Delete Spatial Pin</span><span class="ctx-shortcut">Del</span></div>
        `;
      } else if (contextType === 'edge' && data) {
        const uId = String(data.u).replace(/'/g, "\\'");
        const vId = String(data.v).replace(/'/g, "\\'");
        const eType = data.edgeType || 'road';
        rowsHtml = `
          <div class="ctx-header">🛤️ ${eType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road'}: ${escapeHtml(String(data.u))} ↔ ${escapeHtml(String(data.v))}</div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); selectEdge('${eType}', '${uId}', '${vId}'); if(typeof openEntityManager==='function') openEntityManager('edge');"><span>🔍 Inspect Corridor & Conduits</span><span class="ctx-shortcut">DblClick</span></div>
          <div class="ctx-sep"></div>
          <div class="ctx-item" style="color:#b71c1c;" onclick="closeCanvasContextMenu(); deleteEdge('${uId}', '${vId}', '${eType}');"><span>✂️ Sever Corridor</span><span class="ctx-shortcut">Del</span></div>
        `;
      } else if (contextType === 'shape' && data) {
        const shape = data;
        const sId = String(shape.id).replace(/'/g, "\\'");
        rowsHtml = `
          <div class="ctx-header">📐 Shape: ${escapeHtml(shape.name || shape.label || shape.type || shape.id)}</div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); selectShape('${sId}');"><span>🔍 Inspect Shape Properties</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); (function(){ const s=(Workstation.activeTopology.shapes||[]).find(x=>String(x.id)==='${sId}'); if(s){ s.visible = (s.visible === false); renderCanvas(); updatePropertiesGrid(); saveActiveCampaign(); } })();"><span>${shape.visible === false ? '👁️ Show Shape on Canvas' : '🌫️ Hide Shape on Canvas'}</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); (function(){ const s=(Workstation.activeTopology.shapes||[]).find(x=>String(x.id)==='${sId}'); if(s){ s.locked = !s.locked; renderCanvas(); updatePropertiesGrid(); saveActiveCampaign(); } })();"><span>${shape.locked ? '🔓 Unlock Shape' : '🔒 Lock Shape'}</span></div>
          <div class="ctx-sep"></div>
          <div class="ctx-item" style="color:#b71c1c;" onclick="closeCanvasContextMenu(); deleteShape('${sId}');"><span>🗑️ Delete Shape</span><span class="ctx-shortcut">Del</span></div>
        `;
      } else {
        // Empty Canvas context menu
        rowsHtml = `
          <div class="ctx-header">🗺️ Canvas Actions (${worldX}, ${worldY})</div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); openSpatialPinModal(${worldX}, ${worldY}, null);"><span>📌 Drop Multi-Link Spatial Pin Here...</span><span class="ctx-shortcut">P</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); addNodeAt(${worldX}, ${worldY}, 1);"><span>⚪ Add Tier 1 Node Here</span><span class="ctx-shortcut">1</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); addNodeAt(${worldX}, ${worldY}, 2);"><span>🟡 Add Tier 2 Crucible Node Here</span><span class="ctx-shortcut">2</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); addNodeAt(${worldX}, ${worldY}, 3);"><span>🔴 Add Tier 3 Climax Node Here</span><span class="ctx-shortcut">3</span></div>
          <div class="ctx-sep"></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); openGlobalSearchModal();"><span>🔍 Global Search / Jump to Anything...</span><span class="ctx-shortcut">Ctrl+F</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); zoomToFitCanvas();"><span>📐 Zoom to Fit All / Selection</span><span class="ctx-shortcut">F</span></div>
          <div class="ctx-item" onclick="closeCanvasContextMenu(); toggleSnapToGrid();"><span>${Workstation.snapToGrid ? '✓ ' : ''}Snap to Grid (20px)</span></div>
        `;
      }

      menu.innerHTML = rowsHtml;
      menu.style.display = 'block';
      const clientX = e ? e.clientX : 300;
      const clientY = e ? e.clientY : 200;
      const maxLeft = Math.max(10, window.innerWidth - 245);
      const maxTop = Math.max(10, window.innerHeight - 260);
      menu.style.left = `${Math.min(clientX, maxLeft)}px`;
      menu.style.top = `${Math.min(clientY, maxTop)}px`;
    }

    // =========================================================================
    // Rich Hover Preview Cards (#cad-hover-preview-card)
    // =========================================================================
    let _hoverCardTimer = null;

    function hideCanvasHoverCard() {
      if (_hoverCardTimer) {
        clearTimeout(_hoverCardTimer);
        _hoverCardTimer = null;
      }
      const card = document.getElementById('cad-hover-preview-card');
      if (card) card.style.display = 'none';
    }

    function scheduleCanvasHoverCard(e, type, data) {
      if (Workstation.isDraggingNode || Workstation.isDraggingPin || Workstation.isPanning) return;
      if (_hoverCardTimer) clearTimeout(_hoverCardTimer);
      const clientX = e ? e.clientX : 0;
      const clientY = e ? e.clientY : 0;

      _hoverCardTimer = setTimeout(() => {
        const card = document.getElementById('cad-hover-preview-card');
        const topo = Workstation.activeTopology;
        if (!card || !topo || !data) return;

        let html = '';
        if (type === 'node') {
          const n = data;
          const nIdStr = String(n.id);
          const stationedNpcs = (topo.npcs || []).filter(npc => String(npc.nodeId !== undefined ? npc.nodeId : npc.currentNodeId) === nIdStr);
          const nodeQuests = (topo.quests || []).filter(q => String(q.nodeId !== undefined ? q.nodeId : q.originNodeId) === nIdStr || String(q.targetNodeId) === nIdStr);
          const slottedCount = (topo.slottedModules && Array.isArray(topo.slottedModules[nIdStr])) ? topo.slottedModules[nIdStr].length : 0;
          html = `
            <div class="hover-title"><span>📍 ${escapeHtml(n.name || 'Node ' + n.id)}</span><span style="font-size:9px; color:#555;">Tier ${n.tier || 1} • ${escapeHtml(n.culture || 'Clan')}</span></div>
            ${n.archetypeName ? `<div style="font-size:10px; color:#004d40; font-weight:bold; margin-bottom:3px;">${escapeHtml(n.archetypeName)} ${Array.isArray(n.disposition) ? `[${n.disposition.join(',')}]` : ''}</div>` : ''}
            <div style="font-size:10px; color:#333;">
              <div>👤 NPCs Stationed: <b>${stationedNpcs.length}</b> ${stationedNpcs.length > 0 ? `(${stationedNpcs.slice(0, 2).map(x => escapeHtml(x.name)).join(', ')})` : ''}</div>
              <div>📜 Active Quests: <b>${nodeQuests.length}</b> • 🧩 Modules: <b>${slottedCount}</b></div>
              ${n.childMapId ? `<div style="color:#b71c1c; font-weight:bold; margin-top:2px;">🗺️ Portal to Sub-Map: ${escapeHtml(n.childMapId)} (Double-click)</div>` : ''}
            </div>
          `;
        } else if (type === 'spatialPin') {
          const pin = normalizeSpatialPin(data);
          const links = getPinLinks(pin);
          const iconMap = { npc: '👤', item: '🎒', submap: '🗺️', quest: '📜', tracker: '⏱️', faction: '🚩', ticket: '🎫' };
          const listHtml = links.slice(0, 6).map(l => {
            const title = resolvePinLinkTitle(l.type, l.id);
            let extra = '';
            if (l.type === 'tracker') {
              const t = (topo.trackers || []).find(tr => String(tr.id) === String(l.id));
              if (t) extra = ` (${t.currentTicks !== undefined ? t.currentTicks : (t.value || 0)}/${t.maxTicks || t.max || 6})`;
            }
            return `<div style="padding:1px 0;">${iconMap[l.type] || '📌'} <b>[${escapeHtml(l.type.toUpperCase())}]</b> ${escapeHtml(title)}${escapeHtml(extra)}</div>`;
          }).join('');
          html = `
            <div class="hover-title"><span>📌 ${escapeHtml(pin.label || 'POI Pin')}</span><span style="font-size:9px; color:#555;">${links.length} Link${links.length === 1 ? '' : 's'}</span></div>
            <div style="font-size:10px; color:#222;">${listHtml || '<i>Standalone marker</i>'}</div>
            ${pin.notes ? `<div style="margin-top:4px; padding-top:3px; border-top:1px dotted #ccc; font-size:9px; color:#444;">${escapeHtml(String(pin.notes).slice(0, 120))}</div>` : ''}
            <div style="margin-top:3px; font-size:9px; color:#666;">Right-click to configure or advance clocks • Double-click to open</div>
          `;
        } else if (type === 'edge') {
          const pairKey = [String(data.u), String(data.v)].sort().join('-');
          const eData = (topo.edgeData && (topo.edgeData[`${data.u}->${data.v}`] || topo.edgeData[pairKey])) || {};
          const flows = Array.isArray(eData.conduits) ? eData.conduits.length : 0;
          html = `
            <div class="hover-title"><span>🛤️ ${data.edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Corridor'}</span><span style="font-size:9px;">${escapeHtml(String(data.u))} ↔ ${escapeHtml(String(data.v))}</span></div>
            <div style="font-size:10px; color:#333;">
              <div>Type: <b>${escapeHtml(eData.type || eData.terrain || 'Standard Route')}</b></div>
              ${flows > 0 ? `<div>Active Conduits: <b>${flows}</b></div>` : ''}
              ${eData.hazard ? `<div style="color:#b71c1c;">Hazard: ${escapeHtml(eData.hazard)}</div>` : ''}
            </div>
          `;
        }

        if (!html) return;
        card.innerHTML = html;
        card.style.display = 'block';
        const left = Math.min(window.innerWidth - 280, clientX + 16);
        const top = Math.min(window.innerHeight - 160, clientY + 16);
        card.style.left = `${Math.max(8, left)}px`;
        card.style.top = `${Math.max(8, top)}px`;
      }, 180);
    }

    // =========================================================================
    // Global Search / "Jump to Anything" Palette (Ctrl+F / Ctrl+P)
    // =========================================================================
    let _globalSearchState = {
      category: 'all',
      results: [],
      selectedIndex: 0
    };

    function openGlobalSearchModal() {
      const modal = document.getElementById('modal-global-search');
      if (!modal) return;
      if (typeof openModal === 'function') {
        openModal('modal-global-search');
      } else {
        modal.classList.remove('hidden');
      }
      _globalSearchState.selectedIndex = 0;
      renderGlobalSearchResults();
      const input = document.getElementById('gs-search-input');
      if (input) {
        setTimeout(() => {
          input.focus();
          input.select();
        }, 20);
      }
    }

    function setGlobalSearchCategory(cat) {
      _globalSearchState.category = (cat === 'pin') ? 'spatialPin' : (cat || 'all');
      _globalSearchState.selectedIndex = 0;
      const bar = document.getElementById('gs-category-tabs');
      if (bar) {
        bar.querySelectorAll('button[data-gs-cat]').forEach(btn => {
          const btnCat = btn.getAttribute('data-gs-cat');
          btn.classList.toggle('active', btnCat === cat || btnCat === _globalSearchState.category);
        });
      }
      renderGlobalSearchResults();
    }

    function collectGlobalSearchEntries() {
      const topo = Workstation.activeTopology;
      if (!topo) return [];
      const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';
      const allMaps = (typeof maps !== 'undefined' && maps && Object.keys(maps).length > 0)
        ? maps
        : { [curMapId]: { id: curMapId, name: topo.name || 'Root Map', nodes: topo.nodes || {}, spatialPins: topo.spatialPins || [] } };

      const entries = [];

      // 1. Maps, Nodes across all maps, and Spatial Pins across all maps
      Object.keys(allMaps).forEach(mId => {
        const m = allMaps[mId] || {};
        const isCur = (mId === curMapId);
        const mapNodes = isCur ? (topo.nodes || {}) : (m.nodes || {});
        const mapPins = isCur ? (topo.spatialPins || []) : (m.spatialPins || []);
        const mapName = m.name || mId;

        entries.push({
          cat: 'map',
          icon: '🗺️',
          title: mapName,
          subtitle: `Map [${mId}] • ${Object.keys(mapNodes).length} nodes`,
          mapId: mId,
          entityId: mId
        });

        Object.keys(mapNodes).forEach(nKey => {
          const n = mapNodes[nKey];
          if (!n) return;
          entries.push({
            cat: 'node',
            icon: '📍',
            title: `${n.name || 'Node ' + n.id} (#${n.id})`,
            subtitle: `Node on ${mapName} • Tier ${n.tier || 1} ${n.culture || ''} (${n.x || 0}, ${n.y || 0})`,
            mapId: mId,
            entityId: n.id,
            x: n.x || 0,
            y: n.y || 0
          });
        });

        (mapPins || []).forEach(p => {
          if (!p) return;
          const links = Array.isArray(p.links) ? p.links : (p.targetId ? [{ type: p.targetType || 'npc', id: p.targetId }] : []);
          entries.push({
            cat: 'spatialPin',
            icon: '📌',
            title: p.label || `Pin ${p.id}`,
            subtitle: `Spatial Pin on ${mapName} (${p.x || 0}, ${p.y || 0}) • ${links.length} link(s)`,
            mapId: mId,
            entityId: p.id,
            x: p.x || 0,
            y: p.y || 0
          });
        });
      });

      // Helper to locate a pin or node hosting a given entity
      const findEntityCoords = (type, id) => {
        const sId = String(id);
        for (const mId of Object.keys(allMaps)) {
          const isCur = (mId === curMapId);
          const m = allMaps[mId] || {};
          const mapPins = isCur ? (topo.spatialPins || []) : (m.spatialPins || []);
          for (const p of mapPins) {
            if (!p) continue;
            const links = Array.isArray(p.links) ? p.links : (p.targetId ? [{ type: p.targetType, id: p.targetId }] : []);
            if (links.some(l => l.type === type && String(l.id) === sId)) {
              return { mapId: mId, x: p.x || 0, y: p.y || 0, pinId: p.id };
            }
          }
        }
        return null;
      };

      // 2. NPCs
      (topo.npcs || []).forEach(npc => {
        if (!npc) return;
        const pinLoc = findEntityCoords('npc', npc.id);
        const nId = npc.nodeId !== undefined ? npc.nodeId : (npc.currentNodeId || null);
        entries.push({
          cat: 'npc',
          icon: '👤',
          title: npc.name || npc.id,
          subtitle: `NPC • ${npc.archetype || npc.role || 'Character'}${nId ? ' @ Node ' + nId : ''}${pinLoc ? ' 📌 Pinned' : ''}`,
          entityId: npc.id,
          nodeId: nId,
          pinLoc: pinLoc
        });
      });

      // 3. Items
      (topo.items || []).forEach(it => {
        if (!it) return;
        const pinLoc = findEntityCoords('item', it.id);
        const nId = it.nodeId !== undefined ? it.nodeId : (it.locationNodeId || null);
        entries.push({
          cat: 'item',
          icon: '🎒',
          title: it.name || it.id,
          subtitle: `Item • ${it.type || it.category || 'Gear'}${it.rarity ? ' (' + it.rarity + ')' : ''}${pinLoc ? ' 📌 Pinned' : ''}`,
          entityId: it.id,
          nodeId: nId,
          pinLoc: pinLoc
        });
      });

      // 4. Quests
      (topo.quests || []).forEach(q => {
        if (!q) return;
        const pinLoc = findEntityCoords('quest', q.id);
        const nId = q.nodeId !== undefined ? q.nodeId : (q.originNodeId || q.targetNodeId || null);
        entries.push({
          cat: 'quest',
          icon: '📜',
          title: q.title || q.name || q.id,
          subtitle: `Quest • ${q.status || 'Active'}${nId ? ' @ Node ' + nId : ''}`,
          entityId: q.id,
          nodeId: nId,
          pinLoc: pinLoc
        });
      });

      // 5. Trackers
      (topo.trackers || []).forEach(t => {
        if (!t) return;
        const pinLoc = findEntityCoords('tracker', t.id);
        const nId = t.nodeId !== undefined ? t.nodeId : (t.linkedNodeId || null);
        const curT = t.currentTicks !== undefined ? t.currentTicks : (t.value || 0);
        const maxT = t.maxTicks || t.max || 6;
        entries.push({
          cat: 'tracker',
          icon: '⏱️',
          title: t.name || t.id,
          subtitle: `Clock / Tracker • ${curT}/${maxT} segments`,
          entityId: t.id,
          nodeId: nId,
          pinLoc: pinLoc
        });
      });

      // 6. Factions
      (topo.factions || []).forEach(f => {
        if (!f) return;
        const pinLoc = findEntityCoords('faction', f.id);
        const nId = f.headquartersNodeId !== undefined ? f.headquartersNodeId : (f.hqNodeId || null);
        entries.push({
          cat: 'faction',
          icon: '🚩',
          title: f.name || f.id,
          subtitle: `Faction • ${f.culture || f.quadrant || 'Clan'}`,
          entityId: f.id,
          nodeId: nId,
          pinLoc: pinLoc
        });
      });

      return entries;
    }

    function renderGlobalSearchResults() {
      const container = document.getElementById('gs-results-container');
      if (!container) return;
      const input = document.getElementById('gs-search-input');
      const query = input ? (input.value || '').trim().toLowerCase() : '';
      const cat = _globalSearchState.category || 'all';

      const allEntries = collectGlobalSearchEntries();
      const filtered = allEntries.filter(item => {
        if (cat !== 'all' && item.cat !== cat) return false;
        if (!query) return true;
        return item.title.toLowerCase().includes(query) ||
               item.subtitle.toLowerCase().includes(query) ||
               String(item.entityId).toLowerCase().includes(query);
      }).slice(0, 60);

      _globalSearchState.results = filtered;
      if (_globalSearchState.selectedIndex >= filtered.length) {
        _globalSearchState.selectedIndex = 0;
      }

      const countEl = document.getElementById('gs-results-count');
      if (countEl) {
        countEl.textContent = `Showing ${filtered.length} result${filtered.length === 1 ? '' : 's'}. Use ↑/↓ arrows and Enter to jump.`;
      }

      if (filtered.length === 0) {
        container.innerHTML = `<div style="padding:18px; text-align:center; color:#666; font-size:11px;">No matching campaign entities found.</div>`;
        return;
      }

      container.innerHTML = filtered.map((r, idx) => {
        const isSel = idx === _globalSearchState.selectedIndex;
        return `<div class="search-result-row ${isSel ? 'active-row' : ''}" onclick="executeGlobalSearchJump(${idx})">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:14px;">${r.icon}</span>
            <div>
              <div style="font-weight:bold;">${escapeHtml(r.title)}</div>
              <div class="search-meta" style="font-size:10px; color:${isSel ? '#e0e0e0' : '#666'};">${escapeHtml(r.subtitle)}</div>
            </div>
          </div>
          <span style="font-size:10px; opacity:0.85;">Jump ↵</span>
        </div>`;
      }).join('');
    }

    function onGlobalSearchKeyDown(e) {
      if (!e) return;
      const len = (_globalSearchState.results || []).length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (len > 0) _globalSearchState.selectedIndex = (_globalSearchState.selectedIndex + 1) % len;
        renderGlobalSearchResults();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (len > 0) _globalSearchState.selectedIndex = (_globalSearchState.selectedIndex - 1 + len) % len;
        renderGlobalSearchResults();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeGlobalSearchJump(_globalSearchState.selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (typeof closeModal === 'function') {
          closeModal('modal-global-search');
        } else {
          const modal = document.getElementById('modal-global-search');
          if (modal) modal.classList.add('hidden');
        }
      }
    }

    function executeGlobalSearchJump(idx) {
      const r = (_globalSearchState.results || [])[idx];
      if (!r) return;
      if (typeof closeModal === 'function') {
        closeModal('modal-global-search');
      } else {
        const modal = document.getElementById('modal-global-search');
        if (modal) modal.classList.add('hidden');
      }

      const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';

      if (r.cat === 'map') {
        if (r.mapId && r.mapId !== curMapId && typeof switchActiveMap === 'function') {
          switchActiveMap(r.mapId);
        }
        zoomToFitCanvas(false);
        return;
      }

      if (r.cat === 'node') {
        if (r.mapId && r.mapId !== curMapId && typeof switchActiveMap === 'function') {
          switchActiveMap(r.mapId);
        }
        selectNode(r.entityId);
        panToCanvasPoint(r.x || 0, r.y || 0, Math.max(Workstation.zoom, 1.0), true);
        return;
      }

      if (r.cat === 'spatialPin') {
        if (r.mapId && r.mapId !== curMapId && typeof switchActiveMap === 'function') {
          switchActiveMap(r.mapId);
        }
        selectSpatialPin(r.entityId);
        panToCanvasPoint(r.x || 0, r.y || 0, Math.max(Workstation.zoom, 1.0), true);
        return;
      }

      // Entity types: npc, item, quest, tracker, faction
      if (r.pinLoc) {
        if (r.pinLoc.mapId && r.pinLoc.mapId !== curMapId && typeof switchActiveMap === 'function') {
          switchActiveMap(r.pinLoc.mapId);
        }
        selectSpatialPin(r.pinLoc.pinId);
        panToCanvasPoint(r.pinLoc.x, r.pinLoc.y, Math.max(Workstation.zoom, 1.0), true);
        return;
      }

      if (r.nodeId && Workstation.activeTopology && Workstation.activeTopology.nodes && Workstation.activeTopology.nodes[String(r.nodeId)]) {
        const n = Workstation.activeTopology.nodes[String(r.nodeId)];
        selectNode(n.id);
        panToCanvasPoint(n.x || 0, n.y || 0, Math.max(Workstation.zoom, 1.0), true);
        return;
      }

      const tabMap = { npc: 'npcs', item: 'items', quest: 'quests', tracker: 'trackers', faction: 'factions' };
      if (typeof openEntityManager === 'function' && tabMap[r.cat]) {
        openEntityManager(tabMap[r.cat]);
      } else if (typeof switchEntityTab === 'function' && tabMap[r.cat]) {
        switchEntityTab(tabMap[r.cat]);
      }
      if (typeof selectEntityItem === 'function') {
        selectEntityItem(r.entityId);
      } else if (typeof selectRosterEntityForInspector === 'function') {
        selectRosterEntityForInspector(r.cat, r.entityId);
      }
    }

    function initCanvasInteractions() {
      const container = document.getElementById('canvas-container');
      if (!container || container.dataset.cadInteractionsBound) return;
      container.dataset.cadInteractionsBound = "true";

      // Prevent middle-click browser autoscroll
      container.addEventListener('auxclick', (e) => {
        if (e.button === 1) e.preventDefault();
      });

      // Right-click on empty canvas background opens context menu
      container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openCanvasContextMenu(e, 'canvas', null);
      });

      // Dismiss context menu on any click or Escape
      window.addEventListener('click', () => closeCanvasContextMenu());
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeCanvasContextMenu();
          hideCanvasHoverCard();
        }
      });

      // Mouse wheel zoom centered under cursor pointer
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        hideCanvasHoverCard();
        const rect = container.getBoundingClientRect();
        const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const factor = e.deltaY < 0 ? 1.15 : (1 / 1.15);
        zoomAt(Workstation.zoom * factor, cursor);
      }, { passive: false });

      // Window-level mousemove and mouseup to handle high-speed drag operations
      window.addEventListener('mousemove', (e) => {
        if (Workstation.isDraggingNode || Workstation.isDraggingPin || Workstation.isPanning) {
          onCanvasMouseMove(e);
        }
      });
      window.addEventListener('mouseup', (e) => {
        if (Workstation.isDraggingNode || Workstation.isDraggingPin || Workstation.isPanning) {
          onCanvasMouseUp(e);
        }
      });

      // External File & Roster Entity Drag and Drop Support
      const dropTarget = document.getElementById('cad-svg') || container;
      dropTarget.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      dropTarget.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      dropTarget.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (handleCanvasEntityDrop(e)) return;
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const name = (file.name || '').toLowerCase();
          if (name.endsWith('.csmod') || name.endsWith('.zip')) {
            if (typeof packEngine !== 'undefined' && typeof packEngine.openInstallerDialog === 'function') {
              packEngine.openInstallerDialog(file);
            }
          }
        }
      });
      window.addEventListener('dragover', (e) => e.preventDefault());
      window.addEventListener('drop', (e) => e.preventDefault());
    }

// Exported globals
window.setTool = setTool;
window.getToolKey = getToolKey;
window.onClockCalloutMouseDown = onClockCalloutMouseDown;
window.handleClockSegmentClick = handleClockSegmentClick;
window.onNodeMouseDown = onNodeMouseDown;
window.onPinMouseDown = onPinMouseDown;
window.onShapeMouseDown = onShapeMouseDown;
window.onShapeGripMouseDown = onShapeGripMouseDown;
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
window.promptMovePin = promptMovePin;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.zoomAt = zoomAt;
window.resetZoom = resetZoom;
window.snapCoord = snapCoord;
window.toggleSnapToGrid = toggleSnapToGrid;
window.zoomToFitCanvas = zoomToFitCanvas;
window.panToCanvasPoint = panToCanvasPoint;
window.pingCanvasCoordinate = pingCanvasCoordinate;
window.openSpatialPinModal = openSpatialPinModal;
window.setSpatialPinModalTab = setSpatialPinModalTab;
window.renderSpatialPinModalChecklist = renderSpatialPinModalChecklist;
window.renderSpatialPinSelectedTags = renderSpatialPinSelectedTags;
window.toggleSpatialPinModalLink = toggleSpatialPinModalLink;
window.removeSpatialPinModalLink = removeSpatialPinModalLink;
window.quickCreateForSpatialPin = quickCreateForSpatialPin;
window.submitSpatialPinModal = submitSpatialPinModal;
window.onEntityListDragStart = onEntityListDragStart;
window.handleCanvasEntityDrop = handleCanvasEntityDrop;
window.openCanvasContextMenu = openCanvasContextMenu;
window.closeCanvasContextMenu = closeCanvasContextMenu;
window.scheduleCanvasHoverCard = scheduleCanvasHoverCard;
window.hideCanvasHoverCard = hideCanvasHoverCard;
window.openGlobalSearchModal = openGlobalSearchModal;
window.setGlobalSearchCategory = setGlobalSearchCategory;
window.renderGlobalSearchResults = renderGlobalSearchResults;
window.onGlobalSearchKeyDown = onGlobalSearchKeyDown;
window.executeGlobalSearchJump = executeGlobalSearchJump;
window.initCanvasInteractions = initCanvasInteractions;