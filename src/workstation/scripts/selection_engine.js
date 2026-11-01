// Selection Engine & Multi-Entity Grouping Architecture (SYS-START-01 & ADR-0013)
// Provides AutoCAD-style Shift+Click toggle, Ctrl+Click type-select, marquee box selection,
// and synchronized multi-selection state across nodes, edges, and vector shapes.

(function() {
  function getSelectedEntities() {
    if (!Array.isArray(Workstation.selectedEntities)) {
      Workstation.selectedEntities = [];
    }
    return Workstation.selectedEntities;
  }

  function isEntitySelected(type, id, extra = null) {
    const list = getSelectedEntities();
    return list.some(item => {
      if (item.type !== type) return false;
      if (type === 'edge') {
        if (item.edgeKey && extra && extra.edgeKey) return item.edgeKey === extra.edgeKey;
        if (item.pair && extra && extra.pair) return item.pair === extra.pair;
        if (String(item.id) === String(id)) return true;
        return false;
      }
      return String(item.id) === String(id);
    });
  }

  function setSelection(items, primary = null) {
    Workstation.selectedEntities = Array.isArray(items) ? [...items] : [];
    if (primary) {
      Workstation.selectedEntity = primary;
    } else if (Workstation.selectedEntities.length > 0) {
      Workstation.selectedEntity = Workstation.selectedEntities[0];
    } else {
      Workstation.selectedEntity = { type: 'global' };
    }
    syncSelectionUI();
  }

  function clearSelection() {
    Workstation.selectedEntities = [];
    Workstation.selectedEntity = { type: 'global' };
    syncSelectionUI();
  }

  function addToSelection(item) {
    if (!item || !item.type) return;
    if (!Array.isArray(Workstation.selectedEntities)) Workstation.selectedEntities = [];
    if (!isEntitySelected(item.type, item.id, item)) {
      Workstation.selectedEntities.push(item);
    }
    Workstation.selectedEntity = item;
    syncSelectionUI();
  }

  function removeFromSelection(type, id, extra = null) {
    if (!Array.isArray(Workstation.selectedEntities)) return;
    Workstation.selectedEntities = Workstation.selectedEntities.filter(item => {
      if (item.type !== type) return true;
      if (type === 'edge' && extra) {
        if (item.edgeKey && extra.edgeKey && item.edgeKey === extra.edgeKey) return false;
        if (item.pair && extra.pair && item.pair === extra.pair) return false;
      }
      return String(item.id) !== String(id);
    });
    if (Workstation.selectedEntities.length > 0) {
      Workstation.selectedEntity = Workstation.selectedEntities[0];
    } else {
      Workstation.selectedEntity = { type: 'global' };
    }
    syncSelectionUI();
  }

  function toggleEntitySelection(item) {
    if (!item || !item.type) return;
    if (isEntitySelected(item.type, item.id, item)) {
      removeFromSelection(item.type, item.id, item);
    } else {
      addToSelection(item);
    }
  }

  // AutoCAD Ctrl+Click: Select All of Shared Primitive Type
  function selectByType(type, subType = null, targetEntity = null) {
    const topo = Workstation.activeTopology;
    if (!topo) return;
    const newSelection = [];

    if (type === 'shape') {
      const shapes = topo.shapes || [];
      const matchType = subType || (targetEntity ? targetEntity.type : null);
      shapes.forEach(s => {
        if (!matchType || s.type === matchType) {
          newSelection.push({ type: 'shape', id: s.id, shape: s });
        }
      });
      const typeLabel = matchType ? matchType.toUpperCase() : 'ALL';
      setStatusBarMessage(`AutoCAD Type-Select: Selected all ${newSelection.length} [${typeLabel}] shapes.`);
    } else if (type === 'node') {
      const nodes = topo.nodes || {};
      Object.keys(nodes).forEach(k => {
        const n = nodes[k];
        const nId = isNaN(k) || String(k).includes('-') ? k : parseInt(k);
        newSelection.push({ type: 'node', id: nId, node: n });
      });
      setStatusBarMessage(`AutoCAD Type-Select: Selected all ${newSelection.length} nodes on active map.`);
    } else if (type === 'edge') {
      const edgeType = subType || (targetEntity ? targetEntity.edgeType : 'road');
      if (edgeType === 'road') {
        const renderedRoads = new Set();
        Object.keys(topo.nodes || {}).forEach(uKey => {
          const u = topo.nodes[uKey];
          const uId = isNaN(uKey) || String(uKey).includes('-') ? uKey : parseInt(uKey);
          if (u && u.adj) {
            u.adj.forEach(vId => {
              const pairKey = [String(uId), String(vId)].sort().join('-');
              if (!renderedRoads.has(pairKey)) {
                renderedRoads.add(pairKey);
                newSelection.push({ type: 'edge', edgeType: 'road', uId, vId, pair: pairKey, edgeKey: pairKey });
              }
            });
          }
        });
        setStatusBarMessage(`AutoCAD Type-Select: Selected all ${newSelection.length} transit roads.`);
      } else if (edgeType === 'hegemony') {
        Object.keys(topo.nodes || {}).forEach(uKey => {
          const u = topo.nodes[uKey];
          const uId = isNaN(uKey) || String(uKey).includes('-') ? uKey : parseInt(uKey);
          if (u && u.infBy) {
            u.infBy.forEach(vId => {
              const edgeKey = `${vId}->${uId}`;
              newSelection.push({ type: 'edge', edgeType: 'hegemony', uId: vId, vId: uId, edgeKey: edgeKey });
            });
          }
        });
        setStatusBarMessage(`AutoCAD Type-Select: Selected all ${newSelection.length} hegemony influence vectors.`);
      }
    }

    if (newSelection.length > 0) {
      const primary = targetEntity || newSelection[0];
      setSelection(newSelection, primary);
    }
  }

  function syncSelectionUI() {
    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof updateObjectSelector === 'function') updateObjectSelector();
    if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();

    const count = (Workstation.selectedEntities || []).length;
    if (count > 1) {
      const nodeCount = Workstation.selectedEntities.filter(e => e.type === 'node').length;
      const shapeCount = Workstation.selectedEntities.filter(e => e.type === 'shape').length;
      const edgeCount = Workstation.selectedEntities.filter(e => e.type === 'edge').length;
      const parts = [];
      if (nodeCount > 0) parts.push(`${nodeCount} Node${nodeCount > 1 ? 's' : ''}`);
      if (shapeCount > 0) parts.push(`${shapeCount} Shape${shapeCount > 1 ? 's' : ''}`);
      if (edgeCount > 0) parts.push(`${edgeCount} Edge${edgeCount > 1 ? 's' : ''}`);
      setStatusBarMessage(`Selected ${count} entities (${parts.join(', ')})`);
    } else if (count === 1) {
      const item = Workstation.selectedEntities[0];
      if (item.type === 'node') {
        const topo = Workstation.activeTopology;
        const n = topo && topo.nodes ? topo.nodes[String(item.id)] : null;
        setStatusBarMessage(`Selected Node ${item.id}: ${n ? (n.name || 'Node ' + item.id) : item.id}`);
      } else if (item.type === 'shape') {
        const s = item.shape || ((Workstation.activeTopology && Workstation.activeTopology.shapes) ? Workstation.activeTopology.shapes.find(sh => sh.id === item.id) : null);
        setStatusBarMessage(`Selected CAD Shape [${(s ? s.type : 'shape').toUpperCase()}]: ${s ? (s.name || s.id) : item.id}`);
      } else if (item.type === 'edge') {
        const typeLabel = item.edgeType === 'hegemony' ? 'Hegemony Vector' : 'Transit Road';
        setStatusBarMessage(`Selected ${typeLabel}: ${item.uId} ${item.edgeType === 'hegemony' ? '->' : '<->'} ${item.vId}`);
      }
    } else {
      setStatusBarMessage(`Global Campaign selected.`);
    }
  }

  // Exports
  window.getSelectedEntities = getSelectedEntities;
  window.isEntitySelected = isEntitySelected;
  window.setSelection = setSelection;
  window.clearSelection = clearSelection;
  window.addToSelection = addToSelection;
  window.removeFromSelection = removeFromSelection;
  window.toggleEntitySelection = toggleEntitySelection;
  window.selectByType = selectByType;
  window.syncSelectionUI = syncSelectionUI;
})();
