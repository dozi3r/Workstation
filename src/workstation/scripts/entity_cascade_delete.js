    // ========================================================================
    // UNIVERSAL CAMPAIGN ENTITY MANAGER - CASCADE DELETION & BACKUP SUBSYSTEM
    // ========================================================================
    function getEntityIcon(type) {
      if (type === 'npc') return '👤';
      if (type === 'quest') return '📜';
      if (type === 'item') return '💎';
      if (type === 'tracker') return '⏱️';
      if (type === 'node') return '🌐';
      if (type === 'map') return '🌀';
      if (type === 'module') return '📦';
      return '🔹';
    }
    window.getEntityIcon = getEntityIcon;

    function analyzeEntityDependencies(targetType, targetId) {
      const topo = Workstation.activeTopology || {};
      if (typeof ensureEntityCollections === 'function') ensureEntityCollections(topo);
      const activeCampModules = topo.campaign_modules || [];

      let targetObj = null;
      let targetName = '';
      let targetRole = '';
      let targetNodeId = null;
      let targetModuleId = null;
      let isTargetActive = false;
      let targetDetails = '';

      if (targetType === 'node') {
        const n = topo.nodes ? (topo.nodes[targetId.toString()] || topo.nodes[targetId]) : null;
        targetObj = n || { id: targetId, name: `Node ${targetId}` };
        targetName = targetObj.name || `Node ${targetId}`;
        targetRole = `Pointcrawl Node (Tier ${targetObj.tier !== undefined ? targetObj.tier : '?'})`;
        targetNodeId = targetId;
        isTargetActive = true;
        const slottedCount = (targetObj.modules && Array.isArray(targetObj.modules)) ? targetObj.modules.length : 0;
        const adjCount = (targetObj.adj && Array.isArray(targetObj.adj)) ? targetObj.adj.length : 0;
        targetDetails = `Coords: (${targetObj.x || 0}, ${targetObj.y || 0}) • Slotted Modules: ${slottedCount} • Corridors: ${adjCount}`;
      } else if (targetType === 'module') {
        const m = (typeof ALL_MODULES !== 'undefined') ? ALL_MODULES.find(mod => mod.id === targetId) : null;
        targetObj = m || { id: targetId, title: targetId };
        targetName = m ? `[${m.id}] ${m.title}` : `Module ${targetId}`;
        targetRole = `Worldbuilding Module (${m ? (m.tier || `Tier ${m.pipeline_tier || '?'}`) : 'Custom'})`;
        targetModuleId = targetId;
        let slottedNodes = [];
        if (topo.nodes) {
          Object.keys(topo.nodes).forEach(nid => {
            if (topo.nodes[nid].modules && topo.nodes[nid].modules.includes(targetId)) slottedNodes.push(nid);
          });
        }
        const hasSpawned = (topo.npcs || []).some(e => e.moduleId === targetId) ||
                           (topo.quests || []).some(e => e.moduleId === targetId) ||
                           (topo.items || []).some(e => e.moduleId === targetId) ||
                           (topo.trackers || []).some(e => e.moduleId === targetId);
        isTargetActive = activeCampModules.includes(targetId) || slottedNodes.length > 0 || hasSpawned;
        targetDetails = slottedNodes.length > 0 ? `Slotted on Node(s): ${slottedNodes.join(', ')}` : (isTargetActive ? 'Registered in Active Campaign' : 'Available Module Pool');
      } else {
        const activeList = getActiveEntityList(targetType);
        const protoList = getPrototypesForType(targetType);
        const activeInstance = activeList.find(e => String(e.id) === String(targetId) || String(e.prototypeId) === String(targetId));
        const protoInstance = protoList.find(p => String(p.id) === String(targetId));
        targetObj = activeInstance || protoInstance || { id: targetId, name: `${targetType} ${targetId}` };
        targetName = targetObj.name || targetObj.title || `${targetType} ${targetId}`;
        targetRole = targetObj.role || targetObj.category || targetObj.type || targetType.toUpperCase();
        targetNodeId = activeInstance ? activeInstance.nodeId : (targetObj.suggestedNode || targetObj.nodeId || null);
        targetModuleId = targetObj.moduleId || null;
        isTargetActive = !!activeInstance;

        if (targetType === 'tracker') {
          const curTicks = activeInstance ? (activeInstance.currentTicks || 0) : (targetObj.currentTicks || 0);
          const maxTicks = targetObj.maxTicks || (targetObj.type === 'Output Dial' ? 4 : 6);
          targetDetails = `${curTicks}/${maxTicks} Ticks Escalated ${targetNodeId ? `(Node #${targetNodeId})` : ''}`;
        } else {
          targetDetails = targetNodeId ? `Stationed at Node #${targetNodeId}` : (isTargetActive ? 'Active in Campaign Roster (Unassigned)' : 'Module Prototype Pool');
        }
      }

      const dependencies = [];
      const visited = new Set();
      visited.add(`${targetType}:${targetId}`);

      function addDep(type, ent, reason, isActive) {
        if (!ent) return;
        const entId = ent.id !== undefined ? ent.id : ent.key;
        const key = `${type}:${entId}`;
        if (visited.has(key)) return;
        visited.add(key);

        const name = ent.name || ent.title || `[${entId}]`;
        const role = ent.role || ent.category || ent.type || type.toUpperCase();
        const nodeId = ent.nodeId !== undefined ? ent.nodeId : (type === 'node' ? entId : null);

        dependencies.push({
          type: type,
          id: entId,
          name: name,
          role: role,
          nodeId: nodeId,
          moduleId: ent.moduleId || null,
          isActive: !!isActive,
          reason: reason,
          rawObject: ent
        });
      }

      // 1. QUEST RELATIONSHIPS
      (topo.quests || []).forEach(q => {
        let reason = null;
        if (targetType === 'npc') {
          if (q.npcIds && (q.npcIds.includes(targetId) || (targetObj && targetObj.prototypeId && q.npcIds.includes(targetObj.prototypeId)))) {
            reason = `Assigned in Quest Roster`;
          } else if (targetNodeId && q.nodeId && String(q.nodeId) === String(targetNodeId)) {
            reason = `Anchored at Same Node #${targetNodeId}`;
          } else if ((q.motivation || q.notes || '').toLowerCase().includes(targetName.toLowerCase())) {
            reason = `Referenced in Quest Narrative`;
          }
        } else if (targetType === 'item') {
          if (q.itemIds && (q.itemIds.includes(targetId) || (targetObj && targetObj.prototypeId && q.itemIds.includes(targetObj.prototypeId)))) {
            reason = `Required Relic/Item in Quest Roster`;
          } else if (targetNodeId && q.nodeId && String(q.nodeId) === String(targetNodeId)) {
            reason = `Anchored at Same Node #${targetNodeId}`;
          }
        } else if (targetType === 'tracker') {
          if ((q.threat && (q.threat.includes(targetName) || targetName.includes(q.threat))) || q.trackerId === targetId) {
            reason = `Quest Stakes Threat Clock`;
          } else if (targetNodeId && q.nodeId && String(q.nodeId) === String(targetNodeId)) {
            reason = `Anchored at Same Node #${targetNodeId}`;
          }
        } else if (targetType === 'node') {
          if (String(q.nodeId) === String(targetId)) {
            reason = `Anchored at this Node #${targetId}`;
          }
        } else if (targetType === 'module') {
          if (q.moduleId === targetId) {
            reason = `Originating Source Module [${targetId}]`;
          }
        }
        if (reason) {
          addDep('quest', q, reason, true);
        }
      });

      // 2. NPC RELATIONSHIPS
      (topo.npcs || []).forEach(n => {
        let reason = null;
        if (targetType === 'quest') {
          if (targetObj && targetObj.npcIds && targetObj.npcIds.includes(n.id)) {
            reason = `Assigned Character in Quest`;
          } else if (targetNodeId && String(n.nodeId) === String(targetNodeId)) {
            reason = `Stationed at Quest Anchor Node #${targetNodeId}`;
          }
        } else if (targetType === 'npc') {
          if (targetNodeId && String(n.nodeId) === String(targetNodeId)) {
            reason = `Co-stationed at Node #${targetNodeId}`;
          } else if ((topo.quests || []).some(q => (q.npcIds || []).includes(targetId) && (q.npcIds || []).includes(n.id))) {
            reason = `Co-featured in Shared Quest`;
          }
        } else if (targetType === 'item') {
          if (targetNodeId && String(n.nodeId) === String(targetNodeId)) {
            reason = `Stationed with Item at Node #${targetNodeId}`;
          } else if ((topo.quests || []).some(q => (q.itemIds || []).includes(targetId) && (q.npcIds || []).includes(n.id))) {
            reason = `Connected via Shared Quest`;
          }
        } else if (targetType === 'tracker') {
          if (n.threat && (n.threat.includes(targetName) || targetName.includes(n.threat))) {
            reason = `Tied to Escalation Clock`;
          } else if (targetNodeId && String(n.nodeId) === String(targetNodeId)) {
            reason = `Co-stationed at Node #${targetNodeId}`;
          }
        } else if (targetType === 'node') {
          if (String(n.nodeId) === String(targetId)) {
            reason = `Stationed at this Node #${targetId}`;
          }
        } else if (targetType === 'module') {
          if (n.moduleId === targetId) {
            reason = `Spawned Character from Module [${targetId}]`;
          }
        }
        if (reason) {
          addDep('npc', n, reason, n.nodeId != null || true);
        }
      });

      // 3. ITEM RELATIONSHIPS
      (topo.items || []).forEach(itm => {
        let reason = null;
        if (targetType === 'quest') {
          if (targetObj && targetObj.itemIds && targetObj.itemIds.includes(itm.id)) {
            reason = `Required Relic/Reward in Quest`;
          } else if (targetNodeId && String(itm.nodeId) === String(targetNodeId)) {
            reason = `Stationed at Quest Anchor Node #${targetNodeId}`;
          }
        } else if (targetType === 'npc') {
          if (targetNodeId && String(itm.nodeId) === String(targetNodeId)) {
            reason = `Co-stationed at Node #${targetNodeId}`;
          } else if ((topo.quests || []).some(q => (q.npcIds || []).includes(targetId) && (q.itemIds || []).includes(itm.id))) {
            reason = `Linked via Shared Quest`;
          }
        } else if (targetType === 'node') {
          if (String(itm.nodeId) === String(targetId)) {
            reason = `Stationed at this Node #${targetId}`;
          }
        } else if (targetType === 'module') {
          if (itm.moduleId === targetId) {
            reason = `Spawned Relic/Item from Module [${targetId}]`;
          }
        }
        if (reason) {
          addDep('item', itm, reason, itm.nodeId != null || true);
        }
      });

      // 4. TRACKER / CLOCK RELATIONSHIPS
      (topo.trackers || []).forEach(trk => {
        let reason = null;
        if (targetType === 'quest') {
          if (targetObj && targetObj.threat && (targetObj.threat.includes(trk.name) || trk.name.includes(targetObj.threat))) {
            reason = `Quest Stakes Threat Clock`;
          } else if (targetNodeId && String(trk.nodeId) === String(targetNodeId)) {
            reason = `Stationed at Quest Anchor Node #${targetNodeId}`;
          }
        } else if (targetType === 'npc') {
          if (targetObj && targetObj.threat && (targetObj.threat.includes(trk.name) || trk.name.includes(targetObj.threat))) {
            reason = `Associated Threat Clock`;
          } else if (targetNodeId && String(trk.nodeId) === String(targetNodeId)) {
            reason = `Co-stationed at Node #${targetNodeId}`;
          }
        } else if (targetType === 'node') {
          if (String(trk.nodeId) === String(targetId)) {
            reason = `Stationed at this Node #${targetId}`;
          }
        } else if (targetType === 'module') {
          if (trk.moduleId === targetId) {
            reason = `Spawned Threat Clock from Module [${targetId}]`;
          }
        }
        if (reason) {
          const isAct = (trk.currentTicks || 0) > 0 || trk.nodeId != null;
          addDep('tracker', trk, reason, isAct);
        }
      });

      // 5. NODE RELATIONSHIP
      if (targetType !== 'node' && targetNodeId) {
        const n = topo.nodes ? (topo.nodes[targetNodeId.toString()] || topo.nodes[targetNodeId]) : null;
        if (n) {
          addDep('node', { ...n, id: targetNodeId }, `Station Node #${targetNodeId}`, true);
        }
      }

      // 5b. SUB-MAP / PORTAL RELATIONSHIPS
      const allMaps = (typeof maps !== 'undefined' && maps) ? maps : {};
      const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';

      if (targetType === 'node') {
        const targetNode = topo.nodes ? (topo.nodes[targetId.toString()] || topo.nodes[targetId]) : null;
        const directChildMapIds = new Set();
        if (targetNode && targetNode.childMapId && allMaps[targetNode.childMapId]) {
          directChildMapIds.add(targetNode.childMapId);
        }
        Object.keys(allMaps).forEach(mId => {
          const m = allMaps[mId];
          if (m && (m.parentMapId === curMapId || (!m.parentMapId && curMapId === 'map_root')) && String(m.parentNodeId) === String(targetId)) {
            directChildMapIds.add(mId);
          }
        });

        directChildMapIds.forEach(mId => {
          const m = allMaps[mId];
          addDep('map', {
            id: m.id || mId,
            name: m.name || mId,
            role: `Attached Sub-Map (${m.scaleTier || 'region'})`,
            nodeId: targetId
          }, `Portal Sub-Map Attached to Node #${targetId}`, true);
        });
      }

      // 6. MODULE RELATIONSHIP
      if (targetType !== 'module' && targetModuleId) {
        const m = (typeof ALL_MODULES !== 'undefined') ? ALL_MODULES.find(mod => mod.id === targetModuleId) : null;
        if (m) {
          addDep('module', m, `Source Module [${targetModuleId}]`, activeCampModules.includes(targetModuleId));
        }
      }

      const activeCount = dependencies.filter(d => d.isActive).length;

      return {
        target: {
          type: targetType,
          id: targetId,
          name: targetName,
          role: targetRole,
          nodeId: targetNodeId,
          moduleId: targetModuleId,
          isActive: isTargetActive,
          details: targetDetails,
          rawObject: targetObj
        },
        dependencies: dependencies,
        totalCount: dependencies.length,
        activeCount: activeCount
      };
    }
    window.analyzeEntityDependencies = analyzeEntityDependencies;

    function promptEntityDelete(targetType, targetId) {
      if (typeof closeAllMenus === 'function') closeAllMenus();

      const depData = analyzeEntityDependencies(targetType, targetId);
      window._activeDeletionContext = depData;

      const target = depData.target;
      const deps = depData.dependencies;
      const totalCount = depData.totalCount;
      const activeCount = depData.activeCount;

      const titleEl = document.getElementById('ed-modal-title');
      if (titleEl) {
        titleEl.textContent = `Confirm Deletion & Cascade: ${target.name}`;
      }

      const alertContainer = document.getElementById('ed-alert-container');
      if (alertContainer) {
        alertContainer.innerHTML = `
          <!-- Target Summary Card -->
          <div style="background:#fff; border:1px solid #cbd5e1; padding:8px 10px; border-radius:2px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:10px; color:#64748b; font-weight:bold; text-transform:uppercase;">Primary Deletion Target:</div>
              <div style="font-size:13px; font-weight:bold; color:#0f172a; margin-top:1px;">
                ${getEntityIcon(target.type)} ${escapeHtml(target.name)}
              </div>
              <div style="font-size:10px; color:#475569; margin-top:2px;">
                <span class="entity-badge-tag" style="font-size:9px;">${target.role}</span> &bull; ${escapeHtml(target.details)}
              </div>
            </div>
            <div style="flex-shrink:0; margin-left:10px;">
              ${target.isActive ? `
                <span class="entity-badge-tag" style="background:#fee2e2; color:#b91c1c; border:1px solid #ef4444; font-weight:bold; font-size:10px; padding:3px 8px;">
                  ⚡ ACTIVE IN CAMPAIGN
                </span>
              ` : `
                <span class="entity-badge-tag" style="background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1; font-size:10px; padding:3px 8px;">
                  ⚪ Inactive / Prototype
                </span>
              `}
            </div>
          </div>

          <!-- Relational Impact Alert Banner -->
          <div style="background:${activeCount > 0 ? '#fef2f2' : '#f0fdf4'}; border:1px solid ${activeCount > 0 ? '#f87171' : '#86efac'}; border-left:4px solid ${activeCount > 0 ? '#dc2626' : '#16a34a'}; padding:8px 10px; border-radius:2px; margin-top:6px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <strong style="color:${activeCount > 0 ? '#991b1b' : '#166534'}; font-size:12px;">
                ${activeCount > 0 ? `⚠️ ATTENTION: ${activeCount} ACTIVE ENTIT${activeCount === 1 ? 'Y' : 'IES'} AFFECTED` : 'ℹ️ No Active Campaign Conflicts'}
              </strong>
              <span class="entity-badge-tag" style="background:${activeCount > 0 ? '#fee2e2; color:#991b1b;' : '#dcfce7; color:#166534;'} font-size:9px;">
                ${totalCount} Related Entit${totalCount === 1 ? 'y' : 'ies'} Found
              </span>
            </div>
            <div style="font-size:11px; color:${activeCount > 0 ? '#7f1d1d' : '#14532d'}; margin-top:3px; line-height:1.35;">
              ${activeCount > 0 
                ? `Deleting this ${target.type.toUpperCase()} affects <strong>${totalCount} related entities</strong>, of which <strong>${activeCount} are currently ACTIVE</strong> in the campaign (stationed on nodes or active in the roster). Check any linked entities below to delete them together, or leave unchecked to keep them safely preserved:`
                : `Found <strong>${totalCount} related entities</strong> in the worldbuilding pools. None are currently active on pointcrawl graph nodes.`}
            </div>
          </div>
        `;
      }

      const listContainer = document.getElementById('ed-dependencies-list');
      if (listContainer) {
        listContainer.innerHTML = '';

        if (deps.length === 0) {
          listContainer.innerHTML = `
            <div style="text-align:center; padding:30px 10px; font-size:11px; color:#64748b; font-style:italic;">
              No linked or referencing entities found across the campaign. This ${target.type} can be deleted cleanly with zero collateral impact.
            </div>
          `;
        } else {
          const categories = [
            { type: 'quest', label: 'Related Quests & Dilemmas', icon: '📜' },
            { type: 'npc', label: 'Related NPCs & Characters', icon: '👤' },
            { type: 'item', label: 'Related Items & Relics', icon: '💎' },
            { type: 'tracker', label: 'Related Threat Clocks & Dials', icon: '⏱️' },
            { type: 'node', label: 'Related Graph Nodes', icon: '🌐' },
            { type: 'map', label: 'Attached Portal Sub-Maps', icon: '🌀' },
            { type: 'module', label: 'Related Worldbuilding Modules', icon: '📦' }
          ];

          categories.forEach(cat => {
            const catDeps = deps.map((d, idx) => ({ ...d, originalIndex: idx })).filter(d => d.type === cat.type);
            if (catDeps.length === 0) return;

            const headerDiv = document.createElement('div');
            headerDiv.style.cssText = 'font-size:10px; font-weight:bold; color:#1e3a8a; padding:4px 2px 2px 2px; border-bottom:1px solid #e2e8f0; margin-top:4px;';
            headerDiv.innerHTML = `${cat.icon} ${cat.label.toUpperCase()} (${catDeps.length}):`;
            listContainer.appendChild(headerDiv);

            catDeps.forEach(d => {
              const rowLabel = document.createElement('label');
              rowLabel.style.cssText = `display:flex; align-items:center; justify-content:space-between; background:${d.isActive ? '#fff7ed' : '#f8fafc'}; border:1px solid ${d.isActive ? '#fdba74' : '#e2e8f0'}; padding:4px 8px; border-radius:2px; cursor:pointer; margin-top:2px;`;

              rowLabel.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                  <input type="checkbox" class="ed-dep-checkbox" data-idx="${d.originalIndex}" onchange="updateDeletionSelectionSummary()" style="cursor:pointer;">
                  <div style="min-width:0;">
                    <div style="font-size:11px; font-weight:bold; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${getEntityIcon(d.type)} ${escapeHtml(d.name)}
                    </div>
                    <div style="font-size:9px; color:#475569;">
                      <span>${d.role}</span> &bull; 
                      <span>${d.nodeId ? `Node #${d.nodeId}` : 'Unassigned'}</span> &bull; 
                      <strong style="color:#b45309;">${escapeHtml(d.reason)}</strong>
                    </div>
                  </div>
                </div>
                <div style="margin-left:8px; flex-shrink:0;">
                  ${d.isActive ? `
                    <span class="entity-badge-tag" style="background:#fee2e2; color:#b91c1c; border:1px solid #ef4444; font-weight:bold; font-size:9px;">
                      ⚡ ACTIVE
                    </span>
                  ` : `
                    <span class="entity-badge-tag" style="background:#f1f5f9; color:#64748b; font-size:9px;">
                      ⚪ Inactive
                    </span>
                  `}
                </div>
              `;
              listContainer.appendChild(rowLabel);
            });
          });
        }
      }

      updateDeletionSelectionSummary();

      const modal = document.getElementById('modal-entity-delete-confirm');
      if (modal) {
        modal.classList.remove('hidden');
        if (typeof MDIWindowManager !== 'undefined' && MDIWindowManager.highestZIndex) {
          modal.style.zIndex = Math.max(9999, MDIWindowManager.highestZIndex + 10);
        }
      }
    }
    window.promptEntityDelete = promptEntityDelete;

    function setAllDeletionCheckboxes(checked) {
      document.querySelectorAll('.ed-dep-checkbox').forEach(cb => {
        cb.checked = checked;
      });
      updateDeletionSelectionSummary();
    }
    window.setAllDeletionCheckboxes = setAllDeletionCheckboxes;

    function setActiveOnlyDeletionCheckboxes() {
      const depData = window._activeDeletionContext;
      if (!depData) return;
      document.querySelectorAll('.ed-dep-checkbox').forEach(cb => {
        const idx = parseInt(cb.getAttribute('data-idx'));
        const dep = depData.dependencies[idx];
        cb.checked = dep ? dep.isActive : false;
      });
      updateDeletionSelectionSummary();
    }
    window.setActiveOnlyDeletionCheckboxes = setActiveOnlyDeletionCheckboxes;

    function updateDeletionSelectionSummary() {
      const depData = window._activeDeletionContext;
      const targetName = depData && depData.target ? depData.target.name : 'Target';
      const checkedBoxes = document.querySelectorAll('.ed-dep-checkbox:checked');
      const checkedCount = checkedBoxes.length;
      const total = 1 + checkedCount;

      const summaryEl = document.getElementById('ed-selection-summary');
      if (summaryEl) {
        if (checkedCount === 0) {
          summaryEl.innerHTML = `Selected for deletion: <strong>1 entity</strong> ("${escapeHtml(targetName)}").`;
        } else {
          summaryEl.innerHTML = `Selected for deletion: <strong>${total} entities</strong> ("${escapeHtml(targetName)}" + ${checkedCount} linked entities).`;
        }
      }
    }
    window.updateDeletionSelectionSummary = updateDeletionSelectionSummary;

    async function removeFileAtRelativePath(rootHandle, relPath) {
      if (!rootHandle || !relPath || typeof rootHandle.getDirectoryHandle !== "function") return false;
      const clean = String(relPath).replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
      const parts = clean.split("/").filter(Boolean);
      if (parts.length === 0) return false;
      const fileName = parts.pop();
      let curDir = rootHandle;
      for (const seg of parts) {
        try {
          curDir = await curDir.getDirectoryHandle(seg, { create: false });
        } catch(e) {
          return false;
        }
      }
      if (!curDir || typeof curDir.removeEntry !== "function") return false;
      try {
        await curDir.removeEntry(fileName);
        console.log(`[ProjectDirectory] Removed module file via path: ${clean}`);
        return true;
      } catch(e) {
        return false;
      }
    }

    function matchesModuleFileName(entryName, idStr) {
      if (!entryName || typeof entryName !== "string") return false;
      const lowerName = entryName.toLowerCase();
      const lowerId = String(idStr).toLowerCase();
      if (!lowerName.endsWith(".md")) return false;
      return (
        lowerName === `${lowerId}.md` ||
        lowerName === `module_${lowerId}.md` ||
        lowerName.startsWith(`${lowerId}_`) ||
        lowerName.startsWith(`${lowerId}-`)
      );
    }

    async function removeModuleFileFromDirRecursive(dirHandle, idStr, maxDepth = 4) {
      if (!dirHandle || maxDepth < 0) return false;
      let removedAny = false;
      if (typeof dirHandle.removeEntry === "function") {
        const directCandidates = [
          `${idStr}.md`,
          `${idStr.toLowerCase()}.md`,
          `${idStr.toUpperCase()}.md`,
          `module_${idStr}.md`
        ];
        for (const candidate of directCandidates) {
          try {
            await dirHandle.removeEntry(candidate);
            removedAny = true;
            console.log(`[ProjectDirectory] Removed module file: ${candidate}`);
          } catch(e) {}
        }
      }
      if (typeof dirHandle.values === "function") {
        const toRemove = [];
        const subDirs = [];
        try {
          for await (const entry of dirHandle.values()) {
            if (!entry) continue;
            if (entry.kind === "file" && matchesModuleFileName(entry.name, idStr)) {
              toRemove.push(entry.name);
            } else if (entry.kind === "directory" && maxDepth > 0 && !entry.name.startsWith(".") && entry.name !== "node_modules") {
              subDirs.push(entry);
            }
          }
        } catch(e) {}
        for (const fName of toRemove) {
          try {
            await dirHandle.removeEntry(fName);
            removedAny = true;
            console.log(`[ProjectDirectory] Removed module file: ${fName}`);
          } catch(e) {}
        }
        for (const subEntry of subDirs) {
          let subHandle = subEntry;
          if (typeof subHandle.values !== "function" && typeof dirHandle.getDirectoryHandle === "function") {
            try { subHandle = await dirHandle.getDirectoryHandle(subEntry.name, { create: false }); } catch(e) { subHandle = null; }
          }
          if (subHandle) {
            const subRemoved = await removeModuleFileFromDirRecursive(subHandle, idStr, maxDepth - 1);
            if (subRemoved) removedAny = true;
          }
        }
      }
      return removedAny;
    }

    async function purgeModulesManifestInDir(dirHandle, idSet) {
      if (!dirHandle || typeof dirHandle.getFileHandle !== "function") return;
      try {
        const manifestHandle = await dirHandle.getFileHandle("modules_manifest.json", { create: false });
        const file = await manifestHandle.getFile();
        const text = await file.text();
        let manifestList = JSON.parse(text);
        if (Array.isArray(manifestList)) {
          const beforeLen = manifestList.length;
          manifestList = manifestList.filter(m => !idSet.has(String(m.id)));
          if (manifestList.length !== beforeLen) {
            const writable = await manifestHandle.createWritable();
            await writable.write(JSON.stringify(manifestList, null, 2));
            await writable.close();
            console.log(`[ProjectDirectory] Updated modules_manifest.json on disk.`);
          }
        }
      } catch(e) {}
    }

    async function resolveActiveDirectoryHandlesForModuleDeletion() {
      const handles = [];
      const addUnique = (h) => {
        if (h && !handles.includes(h)) handles.push(h);
      };
      addUnique(window.activeProjectDirectoryHandle);
      addUnique(window.campaignsRootDirectoryHandle);
      if (handles.length === 0) {
        if (typeof getBoundProjectDirectoryHandle === "function") {
          try {
            const h = await getBoundProjectDirectoryHandle();
            if (h) {
              window.activeProjectDirectoryHandle = h;
              addUnique(h);
            }
          } catch(e) {}
        }
        if (typeof getStoredCampaignsFolderHandle === "function") {
          try {
            const ch = await getStoredCampaignsFolderHandle();
            if (ch) {
              window.campaignsRootDirectoryHandle = ch;
              addUnique(ch);
            }
          } catch(e) {}
        }
      }
      return handles;
    }

    async function deleteModuleFilesFromBoundProjectDirectory(modIds) {
      if (!Array.isArray(modIds) || modIds.length === 0) return;
      const handles = await resolveActiveDirectoryHandlesForModuleDeletion();
      if (handles.length === 0) return;

      const idSet = new Set(modIds.map(String));
      const modMetaMap = new Map();
      const catalog = (typeof ALL_MODULES !== "undefined" && Array.isArray(ALL_MODULES)) ? ALL_MODULES : [];
      for (const mId of modIds) {
        const idStr = String(mId);
        const found = catalog.find(m => m && String(m.id) === idStr);
        if (found) modMetaMap.set(idStr, found);
      }

      for (const dirHandle of handles) {
        try {
          if (typeof verifyDirectoryPermission === "function") {
            const ok = await verifyDirectoryPermission(dirHandle, true);
            if (!ok) continue;
          }

          const touchedCampaignDirs = new Set();

          for (const mId of modIds) {
            const idStr = String(mId);
            const meta = modMetaMap.get(idStr);
            let removed = false;

            if (meta) {
              const pathCandidates = [];
              if (meta.file_url) pathCandidates.push(meta.file_url);
              if (meta.path) pathCandidates.push(meta.path);
              if (meta.campaign && meta.path) {
                const cleanRel = String(meta.path).replace(/^\.\//, "");
                pathCandidates.push(`${meta.campaign}/${cleanRel}`);
                pathCandidates.push(`campaigns/${meta.campaign}/${cleanRel}`);
              }
              if (meta.file_url && String(meta.file_url).startsWith("campaigns/")) {
                pathCandidates.push(String(meta.file_url).replace(/^campaigns\//, ""));
              }
              for (const rel of pathCandidates) {
                if (await removeFileAtRelativePath(dirHandle, rel)) {
                  removed = true;
                }
              }
              if (meta.campaign && typeof dirHandle.getDirectoryHandle === "function") {
                try {
                  const campSub = await dirHandle.getDirectoryHandle(meta.campaign, { create: false });
                  if (campSub) touchedCampaignDirs.add(campSub);
                } catch(e) {}
                try {
                  const campsRoot = await dirHandle.getDirectoryHandle("campaigns", { create: false });
                  const campSub = await campsRoot.getDirectoryHandle(meta.campaign, { create: false });
                  if (campSub) touchedCampaignDirs.add(campSub);
                } catch(e) {}
              }
            }

            // Also scan modules/ and root / nested subfolders for matching filenames
            try {
              const modulesDir = await dirHandle.getDirectoryHandle("modules", { create: false });
              if (await removeModuleFileFromDirRecursive(modulesDir, idStr, 3)) {
                removed = true;
              }
            } catch(e) {}

            if (!removed) {
              await removeModuleFileFromDirRecursive(dirHandle, idStr, 3);
            }
          }

          await purgeModulesManifestInDir(dirHandle, idSet);
          for (const campDir of touchedCampaignDirs) {
            await purgeModulesManifestInDir(campDir, idSet);
          }
        } catch(err) {
          console.warn("[ProjectDirectory] Error deleting module files from disk:", err);
        }
      }
    }
    window.deleteModuleFilesFromBoundProjectDirectory = deleteModuleFilesFromBoundProjectDirectory;

    async function confirmExecuteDeletion(doBackup) {
      const depData = window._activeDeletionContext;
      if (!depData) return;

      const target = depData.target;
      const checkedIndices = [];
      document.querySelectorAll('.ed-dep-checkbox:checked').forEach(cb => {
        checkedIndices.push(parseInt(cb.getAttribute('data-idx')));
      });

      const checkedDeps = checkedIndices.map(idx => depData.dependencies[idx]).filter(Boolean);
      const preservedDeps = depData.dependencies.filter((d, idx) => !checkedIndices.includes(idx));

      const allToDelete = [
        {
          type: target.type,
          id: target.id,
          name: target.name,
          isActive: target.isActive,
          rawObject: target.rawObject,
          isPrimaryTarget: true
        },
        ...checkedDeps
      ];

      if (doBackup) {
        try {
          await saveDeletedBackupZip(target, checkedDeps, preservedDeps);
        } catch(err) {
          console.error("[EntityDelete] Failed to generate backup ZIP:", err);
          if (!confirm("Failed to generate backup ZIP archive. Proceed with deletion anyway?")) {
            return;
          }
        }
      }

      // If modules are being deleted, delete markdown files directly from bound project/campaigns directory
      const deletedModIds = allToDelete.filter(e => e.type === 'module').map(e => e.id);
      if (deletedModIds.length > 0) {
        await deleteModuleFilesFromBoundProjectDirectory(deletedModIds);
      }

      executeEntityDeletion(allToDelete);

      if (typeof closeModal === 'function') {
        closeModal('modal-entity-delete-confirm');
      } else {
        const m = document.getElementById('modal-entity-delete-confirm');
        if (m) m.classList.add('hidden');
      }

      const msg = `Deleted ${allToDelete.length} entity/entities${doBackup ? ' with backup ZIP' : ''}.`;
      if (typeof setStatusBarMessage === 'function') {
        setStatusBarMessage(msg);
      }
    }
    window.confirmExecuteDeletion = confirmExecuteDeletion;

    async function saveDeletedBackupZip(target, checkedDeps, preservedDeps) {
      if (typeof window.ZeroCorsZip === "undefined") {
        alert("ZeroCorsZip engine not loaded.");
        return;
      }

      const zip = new window.ZeroCorsZip();
      const topo = Workstation.activeTopology || {};

      const sanitizeSlug = (str) => (str || 'entity').toString().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const targetSlug = sanitizeSlug(target.name || target.title || target.id);
      const zipFileName = `_deleted_${target.type}_${targetSlug}_backup.zip`;

      // 1. Primary target JSON
      const primaryFileName = `_deleted_${target.type}_${targetSlug}_${target.id}.json`;
      zip.addFile(primaryFileName, JSON.stringify(target.rawObject || target, null, 2));

      if (target.type === 'module' && target.rawObject && target.rawObject.raw_markdown) {
        zip.addFile(`_deleted_module_${targetSlug}.md`, target.rawObject.raw_markdown);
      }

      // 2. Each checked linked entity
      checkedDeps.forEach(ent => {
        const slug = sanitizeSlug(ent.name || ent.title || ent.id);
        const fileName = `_deleted_${ent.type}_${slug}_${ent.id}.json`;
        zip.addFile(fileName, JSON.stringify(ent.rawObject || ent, null, 2));

        if (ent.type === 'module' && ent.rawObject && ent.rawObject.raw_markdown) {
          zip.addFile(`_deleted_module_${slug}.md`, ent.rawObject.raw_markdown);
        }
      });

      // 3. Deletion audit manifest
      const manifest = {
        deletedAt: new Date().toISOString(),
        campaignName: (topo && topo.name) || "Creator Studio Campaign",
        primaryTarget: {
          type: target.type,
          id: target.id,
          name: target.name,
          wasActive: target.isActive,
          details: target.details
        },
        deletedCount: 1 + checkedDeps.length,
        deletedEntities: [
          {
            type: target.type,
            id: target.id,
            name: target.name,
            wasActive: target.isActive,
            isPrimaryTarget: true
          },
          ...checkedDeps.map(e => ({
            type: e.type,
            id: e.id,
            name: e.name,
            wasActive: e.isActive,
            relationshipReason: e.reason
          }))
        ],
        preservedLinkedEntities: preservedDeps.map(e => ({
          type: e.type,
          id: e.id,
          name: e.name,
          wasActive: e.isActive,
          unlinkedRelationship: e.reason
        }))
      };
      zip.addFile("_deleted_manifest.json", JSON.stringify(manifest, null, 2));

      // 4. Full campaign snapshot before deletion
      zip.addFile("_deleted_campaign_snapshot.json", JSON.stringify(topo, null, 2));

      // 5. Download blob
      const zipBlob = zip.generateBlob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      return zipFileName;
    }
    window.saveDeletedBackupZip = saveDeletedBackupZip;

    function executeEntityDeletion(allToDelete) {
      const topo = Workstation.activeTopology || {};
      if (typeof ensureEntityCollections === 'function') ensureEntityCollections(topo);

      if (!Array.isArray(topo.deletedPrototypes)) topo.deletedPrototypes = [];
      if (!Array.isArray(topo.deletedModules)) topo.deletedModules = [];

      const deletedIdsByType = {
        npc: new Set(),
        quest: new Set(),
        item: new Set(),
        tracker: new Set(),
        node: new Set(),
        module: new Set(),
        map: new Set()
      };

      allToDelete.forEach(ent => {
        if (deletedIdsByType[ent.type]) {
          deletedIdsByType[ent.type].add(String(ent.id));
          if (ent.type !== 'node' && ent.type !== 'module' && ent.type !== 'map') {
            topo.deletedPrototypes.push(String(ent.id));
          } else if (ent.type === 'module') {
            topo.deletedModules.push(String(ent.id));
          }
        }
      });

      // 1. Delete NPCs
      if (topo.npcs && deletedIdsByType.npc.size > 0) {
        topo.npcs = topo.npcs.filter(n => !deletedIdsByType.npc.has(String(n.id)));
      }

      // 2. Delete Quests
      if (topo.quests && deletedIdsByType.quest.size > 0) {
        topo.quests = topo.quests.filter(q => !deletedIdsByType.quest.has(String(q.id)));
      }

      // 3. Delete Items
      if (topo.items && deletedIdsByType.item.size > 0) {
        topo.items = topo.items.filter(i => !deletedIdsByType.item.has(String(i.id)));
      }

      // 4. Delete Trackers
      if (topo.trackers && deletedIdsByType.tracker.size > 0) {
        topo.trackers = topo.trackers.filter(t => !deletedIdsByType.tracker.has(String(t.id)));
      }

      // 4b. Delete Attached Sub-Maps (if explicitly selected for cascade deletion)
      const allMaps = (typeof maps !== 'undefined' && maps) ? maps : {};
      const curMapId = (typeof activeMapId !== 'undefined') ? activeMapId : 'map_root';

      if (deletedIdsByType.map.size > 0) {
        deletedIdsByType.map.forEach(mapId => {
          if (allMaps[mapId]) {
            // Re-parent any children that belonged to this map
            Object.keys(allMaps).forEach(otherId => {
              if (allMaps[otherId] && allMaps[otherId].parentMapId === mapId) {
                allMaps[otherId].parentMapId = null;
                allMaps[otherId].parentNodeId = null;
              }
            });

            if (typeof deletePersistedMapFromDB === 'function') {
              try {
                deletePersistedMapFromDB(mapId).catch(err => console.warn('[CascadeDelete] IDB delete error for map:', mapId, err));
              } catch (e) {
                console.warn('[CascadeDelete] Error initiating IDB delete for map:', mapId, e);
              }
            }
            delete allMaps[mapId];
          }
        });

        // If active map was deleted, switch to first available map or create a clean root
        if (deletedIdsByType.map.has(String(activeMapId))) {
          const remainingMapIds = Object.keys(allMaps);
          if (remainingMapIds.length > 0) {
            activeMapId = remainingMapIds[0];
            if (typeof switchActiveMap === 'function') {
              switchActiveMap(activeMapId);
            }
          } else {
            // All maps were deleted: initialize clean root map
            activeMapId = 'map_root';
            allMaps['map_root'] = {
              id: 'map_root',
              name: 'Root Map',
              scaleTier: 'region',
              parentMapId: null,
              parentNodeId: null,
              nodes: [],
              links: []
            };
            nodes = [];
            links = [];
            if (typeof switchActiveMap === 'function') {
              switchActiveMap('map_root');
            }
          }
        }
      }

      // 5. Delete Nodes & Clean/Unlink Attached Sub-Maps
      if (topo.nodes && deletedIdsByType.node.size > 0) {
        deletedIdsByType.node.forEach(nodeIdStr => {
          const n = topo.nodes[nodeIdStr];
          const childId = n ? n.childMapId : null;

          if (childId && allMaps[childId]) {
            if (!deletedIdsByType.map.has(String(childId))) {
              allMaps[childId].parentNodeId = null;
            }
          }

          Object.keys(allMaps).forEach(mId => {
            const m = allMaps[mId];
            if (m && (m.parentMapId === curMapId || (!m.parentMapId && curMapId === 'map_root')) && String(m.parentNodeId) === String(nodeIdStr)) {
              if (!deletedIdsByType.map.has(String(mId))) {
                m.parentNodeId = null;
              }
            }
          });

          delete topo.nodes[nodeIdStr];
        });

        Object.keys(topo.nodes).forEach(k => {
          const n = topo.nodes[k];
          if (n.adj) n.adj = n.adj.filter(id => !deletedIdsByType.node.has(String(id)));
          if (n.infBy) n.infBy = n.infBy.filter(id => !deletedIdsByType.node.has(String(id)));
        });

        if (topo.links) {
          topo.links = topo.links.filter(l => !deletedIdsByType.node.has(String(l.source)) && !deletedIdsByType.node.has(String(l.target)));
        }
      }

      // 6. Delete Modules
      if (deletedIdsByType.module.size > 0) {
        try {
          if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
            const prevRaw = localStorage.getItem('cs_deleted_modules');
            const prevList = prevRaw ? JSON.parse(prevRaw) : [];
            const merged = Array.from(new Set([...(Array.isArray(prevList) ? prevList.map(String) : []), ...Array.from(deletedIdsByType.module)]));
            localStorage.setItem('cs_deleted_modules', JSON.stringify(merged));
          }
        } catch(e) {}
        if (topo.campaign_modules) {
          topo.campaign_modules = topo.campaign_modules.filter(mId => !deletedIdsByType.module.has(String(mId)));
        }
        if (topo.nodes) {
          Object.keys(topo.nodes).forEach(k => {
            const n = topo.nodes[k];
            if (n.modules) {
              n.modules = n.modules.filter(mId => !deletedIdsByType.module.has(String(mId)));
            }
          });
        }
        // Purge runtime ALL_MODULES & MODULES_MANIFEST & custom_modules
        if (Array.isArray(topo.custom_modules)) {
          topo.custom_modules = topo.custom_modules.filter(m => !deletedIdsByType.module.has(String(m.id)));
        }
        if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
          deletedIdsByType.module.forEach(mId => {
            const idx = ALL_MODULES.findIndex(m => String(m.id) === String(mId));
            if (idx !== -1) ALL_MODULES.splice(idx, 1);
          });
        }
        if (typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST) && MODULES_MANIFEST !== ALL_MODULES) {
          deletedIdsByType.module.forEach(mId => {
            const idx = MODULES_MANIFEST.findIndex(m => String(m.id) === String(mId));
            if (idx !== -1) MODULES_MANIFEST.splice(idx, 1);
          });
        }
        // Purge nodeSlottedModules
        if (typeof nodeSlottedModules !== 'undefined' && nodeSlottedModules) {
          Object.keys(nodeSlottedModules).forEach(nid => {
            if (Array.isArray(nodeSlottedModules[nid])) {
              nodeSlottedModules[nid] = nodeSlottedModules[nid].filter(mId => !deletedIdsByType.module.has(String(mId)));
            }
          });
        }
        // Purge edgeSlottedModules
        if (typeof edgeSlottedModules !== 'undefined' && edgeSlottedModules) {
          Object.keys(edgeSlottedModules).forEach(ek => {
            if (deletedIdsByType.module.has(String(edgeSlottedModules[ek]))) {
              delete edgeSlottedModules[ek];
            }
          });
        }
        // Purge all maps in registry
        if (typeof maps !== 'undefined' && maps) {
          Object.values(maps).forEach(m => {
            if (m && m.nodes) {
              (Array.isArray(m.nodes) ? m.nodes : Object.values(m.nodes)).forEach(n => {
                if (n && n.modules) n.modules = n.modules.filter(mId => !deletedIdsByType.module.has(String(mId)));
              });
            }
            if (m && m.nodeSlottedModules) {
              Object.keys(m.nodeSlottedModules).forEach(nid => {
                if (Array.isArray(m.nodeSlottedModules[nid])) {
                  m.nodeSlottedModules[nid] = m.nodeSlottedModules[nid].filter(mId => !deletedIdsByType.module.has(String(mId)));
                }
              });
            }
            if (m && m.edgeSlottedModules) {
              Object.keys(m.edgeSlottedModules).forEach(ek => {
                if (deletedIdsByType.module.has(String(m.edgeSlottedModules[ek]))) {
                  delete m.edgeSlottedModules[ek];
                }
              });
            }
          });
        }
      }

      // 7. UNLINK REFERENCES ACROSS REMAINING PRESERVED ENTITIES
      if (topo.quests) {
        topo.quests.forEach(q => {
          if (q.npcIds) q.npcIds = q.npcIds.filter(id => !deletedIdsByType.npc.has(String(id)));
          if (q.itemIds) q.itemIds = q.itemIds.filter(id => !deletedIdsByType.item.has(String(id)));
          if (q.nodeId && deletedIdsByType.node.has(String(q.nodeId))) q.nodeId = null;
        });
      }

      if (topo.npcs) {
        topo.npcs.forEach(n => {
          if (n.nodeId && deletedIdsByType.node.has(String(n.nodeId))) n.nodeId = null;
          if (n.threat && Array.from(deletedIdsByType.tracker).some(tid => n.threat.includes(tid))) n.threat = '';
        });
      }

      if (topo.items) {
        topo.items.forEach(i => {
          if (i.nodeId && deletedIdsByType.node.has(String(i.nodeId))) i.nodeId = null;
        });
      }

      if (topo.trackers) {
        topo.trackers.forEach(t => {
          if (t.nodeId && deletedIdsByType.node.has(String(t.nodeId))) t.nodeId = null;
        });
      }

      // 8. Persist & Refresh UI
      if (typeof activeMapId !== 'undefined' && deletedIdsByType.map.has(String(activeMapId))) {
        if (typeof switchActiveMap === 'function') {
          switchActiveMap('map_root');
        }
      }
      if (typeof updateBreadcrumbsHUD === 'function') updateBreadcrumbsHUD();
      if (typeof renderLayoutTabs === 'function') renderLayoutTabs();
      if (typeof renderMapNavigatorList === 'function') renderMapNavigatorList();

      if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
      if (typeof renderCanvas === 'function') renderCanvas();
      if (typeof updatePropertiesGrid === 'function') updatePropertiesGrid();

      if (typeof renderEntityManagerTree === 'function') renderEntityManagerTree();
      if (typeof renderEntityManagerList === 'function') renderEntityManagerList();

      if (typeof SelectedEntityId !== 'undefined' && SelectedEntityId && allToDelete.some(e => String(e.id) === String(SelectedEntityId))) {
        SelectedEntityId = null;
        const pane = document.getElementById('em-detail-pane');
        if (pane) {
          pane.innerHTML = '<div style="font-size:11px; color:#666; text-align:center; margin-top:40px;">Entity deleted. Select another entity to inspect, edit, or station to a node.</div>';
        }
      }

      if (typeof filterModules === 'function') filterModules();
      if (typeof SelectedModuleId !== 'undefined' && SelectedModuleId && deletedIdsByType.module.has(String(SelectedModuleId))) {
        if (typeof clearModuleInspector === 'function') clearModuleInspector();
      }
    }
    window.executeEntityDeletion = executeEntityDeletion;
