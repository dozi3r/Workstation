    // ========================================================================
    // COMPREHENSIVE MODULE EXPLORER & SOURCEBOOK CONTROLLER
    // ========================================================================
    let SelectedModuleId = null;
    let CurrentModuleTargetNodeId = null;
    let CurrentModuleTab = 'overview';
    let ModuleReaderMode = 'rendered';

    function openModuleExplorer(moduleId, targetNodeId) {
      closeAllMenus();
      if (typeof syncCustomModulesToCatalog === "function") {
        syncCustomModulesToCatalog(Workstation.activeTopology);
      }
      MDIWindowManager.open('modal-module-explorer');

      // Populate campaign dropdown
      const campSelect = document.getElementById('me-filter-campaign');
      campSelect.innerHTML = '<option value="all">All Campaigns</option>';
      const campaigns = {
        'custom_homebrew': 'Custom / Homebrew'
      };
      ALL_MODULES.forEach(m => {
        const cId = m.isCustom ? 'custom_homebrew' : (m.campaign || (typeof activeCampaignId !== 'undefined' ? activeCampaignId : 'campaign'));
        const cName = m.isCustom ? 'Custom / Homebrew' : (m.campaign_name || cId);
        campaigns[cId] = cName;
      });
      Object.keys(campaigns).forEach(cId => {
        const opt = document.createElement('option');
        opt.value = cId;
        opt.textContent = campaigns[cId];
        campSelect.appendChild(opt);
      });

      // Populate target node selector
      updateTargetNodeDropdown(targetNodeId);

      // Filter and render catalog list
      filterModules(moduleId);
    }

    function updateTargetNodeDropdown(targetNodeId) {
      const nodeSelect = document.getElementById('me-target-node');
      nodeSelect.innerHTML = '<option value="">(No Node Selected)</option>';
      const topo = Workstation.activeTopology;
      if (topo && topo.nodes) {
        Object.keys(topo.nodes).forEach(nid => {
          const n = topo.nodes[nid];
          const opt = document.createElement('option');
          opt.value = nid;
          opt.textContent = `Node ${nid}: ${n.name}`;
          nodeSelect.appendChild(opt);
        });
      }

      // Default target node to passed node, selected node, or null
      let activeNodeId = targetNodeId;
      if (!activeNodeId && Workstation.selectedEntity && Workstation.selectedEntity.type === 'node') {
        activeNodeId = Workstation.selectedEntity.id;
      }
      if (activeNodeId) {
        nodeSelect.value = activeNodeId.toString();
        CurrentModuleTargetNodeId = parseInt(activeNodeId);
      } else {
        nodeSelect.value = '';
        CurrentModuleTargetNodeId = null;
      }
    }

    function onTargetNodeChange() {
      const val = document.getElementById('me-target-node').value;
      CurrentModuleTargetNodeId = val ? parseInt(val) : null;
      updateModuleSlotButton();
      renderModuleEntitiesTab();
      filterModules(SelectedModuleId);
    }

    function ensureCampaignModules(topo) {
      if (!topo) return;
      if (!Array.isArray(topo.campaign_modules)) {
        const activeCamp = localStorage.getItem("cs_active_campaign") || topo.campaign_id || (typeof activeCampaignId !== "undefined" ? activeCampaignId : "emerald_isle");
        const set = new Set();
        if (typeof ALL_MODULES !== 'undefined') {
          const registeredCount = (typeof CAMPAIGN_REGISTRY !== "undefined") ? Object.keys(CAMPAIGN_REGISTRY).length : 1;
          ALL_MODULES.forEach(m => {
            if (registeredCount <= 1 || (m.campaign || '') === activeCamp || (m.campaign_name || '') === (topo.name || activeCamp)) {
              set.add(m.id);
            }
          });
        }
        if (topo.nodes) {
          Object.values(topo.nodes).forEach(n => {
            if (n.modules) n.modules.forEach(mId => set.add(mId));
          });
        }
        if (Array.isArray(topo.deletedModules)) {
          topo.deletedModules.forEach(delId => set.delete(delId));
        }
        topo.campaign_modules = Array.from(set);
      } else if (Array.isArray(topo.deletedModules) && topo.deletedModules.length > 0) {
        topo.campaign_modules = topo.campaign_modules.filter(mId => !topo.deletedModules.includes(String(mId)) && !topo.deletedModules.includes(mId));
      }
    }

    function isModuleInActiveCampaign(mId) {
      const topo = Workstation.activeTopology;
      if (!topo) return true;
      if (Array.isArray(topo.deletedModules) && (topo.deletedModules.includes(String(mId)) || topo.deletedModules.includes(mId))) {
        return false;
      }
      ensureCampaignModules(topo);
      return topo.campaign_modules.includes(mId);
    }

    function updateModuleCampaignButton() {
      const btn = document.getElementById('me-btn-campaign-toggle');
      if (!btn) return;
      const m = ALL_MODULES.find(mod => mod.id === SelectedModuleId);
      if (!m) {
        btn.disabled = true;
        btn.textContent = '+ Add to Campaign';
        return;
      }
      btn.disabled = false;
      const inCamp = isModuleInActiveCampaign(m.id);
      if (inCamp) {
        btn.innerHTML = '<strong>✓ In Campaign</strong>';
        btn.style.color = '#047857';
        btn.style.background = '#e6f4ea';
        btn.title = 'Module is registered in this campaign. Click to remove from campaign.';
      } else {
        btn.innerHTML = '<strong>+ Add to Campaign</strong>';
        btn.style.color = '#000080';
        btn.style.background = '#dbeafe';
        btn.title = `Import ${m.id} from ${m.campaign_name || m.campaign || 'project'} into active campaign`;
      }
    }

    function toggleModuleInCampaign() {
      if (!SelectedModuleId) return;
      const topo = Workstation.activeTopology;
      if (!topo) return;
      ensureCampaignModules(topo);

      const m = ALL_MODULES.find(mod => mod.id === SelectedModuleId);
      if (!m) return;

      const idx = topo.campaign_modules.indexOf(m.id);
      if (idx >= 0) {
        let slottedNodes = [];
        if (topo.nodes) {
          Object.keys(topo.nodes).forEach(nid => {
            if (topo.nodes[nid].modules && topo.nodes[nid].modules.includes(m.id)) {
              slottedNodes.push(nid);
            }
          });
        }
        if (slottedNodes.length > 0) {
          if (!confirm(`Module ${m.id} is currently slotted on Node(s) ${slottedNodes.join(', ')}. Removing it from the campaign will unslot it. Proceed?`)) {
            return;
          }
          slottedNodes.forEach(nid => {
            topo.nodes[nid].modules = topo.nodes[nid].modules.filter(id => id !== m.id);
          });
          renderCanvas();
        }
        topo.campaign_modules.splice(idx, 1);
        saveActiveCampaign();
        setStatusBarMessage(`Removed ${m.id} from active campaign.`);
      } else {
        topo.campaign_modules.push(m.id);
        saveActiveCampaign();
        setStatusBarMessage(`Added ${m.id} ("${m.title}") to active campaign.`);
      }

      updateModuleCampaignButton();
      updateModuleSlotButton();
      filterModules(SelectedModuleId);
    }

    function filterModules(preferSelectId) {
      const scopeFilter = document.getElementById('me-filter-scope') ? document.getElementById('me-filter-scope').value : 'all';
      const campFilter = document.getElementById('me-filter-campaign').value;
      const tierFilter = document.getElementById('me-filter-tier').value;
      const cultureFilter = document.getElementById('me-filter-culture').value;
      const searchVal = document.getElementById('me-search-input').value.toLowerCase().trim();

      const tbody = document.getElementById('me-table-body');
      tbody.innerHTML = '';

      const topo = Workstation.activeTopology;
      ensureCampaignModules(topo);

      const filtered = ALL_MODULES.filter(m => {
        if (topo && Array.isArray(topo.deletedModules) && (topo.deletedModules.includes(String(m.id)) || topo.deletedModules.includes(m.id))) {
          return false;
        }
        if (scopeFilter === 'in_campaign' && !isModuleInActiveCampaign(m.id)) return false;
        if (scopeFilter === 'outside_campaign' && isModuleInActiveCampaign(m.id)) return false;
        const mCamp = m.isCustom ? 'custom_homebrew' : (m.campaign || (typeof activeCampaignId !== 'undefined' ? activeCampaignId : 'campaign'));
        if (campFilter !== 'all' && mCamp !== campFilter) return false;
        if (tierFilter !== 'all') {
          const tNum = m.pipeline_tier || (m.tier && m.tier.match(/Tier\s*(\d)/i) ? parseInt(m.tier.match(/Tier\s*(\d)/i)[1]) : null);
          if (tNum != parseInt(tierFilter)) return false;
        }
        if (cultureFilter !== 'all') {
          if (!m.culture || !m.culture.toLowerCase().includes(cultureFilter.toLowerCase())) return false;
        }
        if (searchVal) {
          const matchId = (m.id || '').toLowerCase().includes(searchVal);
          const matchTitle = (m.title || '').toLowerCase().includes(searchVal);
          const matchSet = (m.set || '').toLowerCase().includes(searchVal);
          const matchYields = (m.yields || '').toLowerCase().includes(searchVal);
          const matchProvides = (m.provides || []).some(p => p.toLowerCase().includes(searchVal));
          const matchRequires = (m.requires || []).some(r => r.toLowerCase().includes(searchVal));
          const matchMd = (m.raw_markdown || '').toLowerCase().includes(searchVal);
          if (!matchId && !matchTitle && !matchSet && !matchYields && !matchProvides && !matchRequires && !matchMd) return false;
        }
        return true;
      });

      // Track how many are slotted
      let slottedCount = 0;

      filtered.forEach(m => {
        const tr = document.createElement('tr');
        tr.id = `me-row-${m.id}`;

        // Check if slotted on any node
        let slottedOnNodes = [];
        if (topo && topo.nodes) {
          Object.keys(topo.nodes).forEach(nid => {
            const n = topo.nodes[nid];
            if (n.modules && n.modules.includes(m.id)) {
              slottedOnNodes.push(nid);
            }
          });
        }
        if (slottedOnNodes.length > 0) slottedCount++;

        const inCamp = isModuleInActiveCampaign(m.id);
        let statusBadge = '';
        if (slottedOnNodes.length > 0) {
          statusBadge = `<span class="me-badge me-badge-slotted">N:${slottedOnNodes.join(',')}</span>`;
        } else if (inCamp) {
          statusBadge = `<span class="me-badge" style="color:#047857; background:#dcfce7; font-weight:bold;">In Camp</span>`;
        } else {
          statusBadge = `<span class="me-badge" style="color:#64748b; background:#f1f5f9;">Available</span>`;
        }

        const tierDisplay = m.pipeline_tier ? `T${m.pipeline_tier}` : (m.tier && m.tier.match(/Tier\s*(\d)/i) ? `T${m.tier.match(/Tier\s*(\d)/i)[1]}` : 'T0');

        tr.innerHTML = `
          <td><strong>${m.id}</strong></td>
          <td title="${m.title}">${m.title}</td>
          <td><span class="me-badge">${tierDisplay}</span></td>
          <td>${statusBadge}</td>
          <td style="text-align:center;"><button class="win-btn" onclick="event.stopPropagation(); promptEntityDelete('module', '${m.id}')" style="font-size:9px; padding:1px 4px; color:#b91c1c;" title="Delete Module">Del</button></td>
        `;

        tr.onclick = () => selectModuleItem(m.id);
        tbody.appendChild(tr);
      });

      document.getElementById('me-catalog-count').textContent = `Showing ${filtered.length} of ${ALL_MODULES.length} modules (${slottedCount} slotted across graph)`;

      // Auto-select
      let toSelect = preferSelectId || SelectedModuleId;
      if (!toSelect || !filtered.some(m => m.id === toSelect)) {
        toSelect = filtered.length > 0 ? filtered[0].id : null;
      }
      if (toSelect) {
        selectModuleItem(toSelect);
      } else {
        clearModuleInspector();
      }
    }

    function selectModuleItem(modId) {
      SelectedModuleId = modId;

      // Update row selection styling
      document.querySelectorAll('#me-table-body tr').forEach(r => r.classList.remove('selected'));
      const activeRow = document.getElementById(`me-row-${modId}`);
      if (activeRow) {
        activeRow.classList.add('selected');
        activeRow.scrollIntoView({ block: 'nearest' });
      }

      const m = ALL_MODULES.find(mod => mod.id === modId);
      if (!m) return;

      // Header Banner
      document.getElementById('me-detail-id').textContent = m.id;
      document.getElementById('me-detail-title').textContent = `${m.id}: ${m.title}`;
      document.getElementById('me-detail-tier').textContent = m.tier || `Tier ${m.pipeline_tier || '3'}`;
      document.getElementById('me-detail-set').textContent = m.set || 'Core';
      document.getElementById('me-detail-culture').textContent = m.culture || 'Universal';
      document.getElementById('me-detail-color').textContent = m.color || m.mtg_color || 'Colorless';
      document.getElementById('me-detail-summary').textContent = m.summary || m.yields || 'Worldbuilding module.';

      updateModuleSlotButton();
      updateModuleCampaignButton();
      const editBtn = document.getElementById('me-btn-edit-clone');
      if (editBtn) {
        editBtn.innerHTML = m.isCustom ? '✏️ Edit Custom' : '📋 Clone to Custom';
      }

      // Tab 1: Overview
      const tierDescMap = {
        1: "Tier 1: Macro Network & Governance Engine - Establishes Sovereign Hubs, island-wide geopolitical balance, and tariff policies.",
        2: "Tier 2: Topological & Biome Anchor - Establishes terrain hazards, regional climates, and physical transit corridors.",
        3: "Tier 3: Infrastructural Supply Chain Anchor - Generates continuous industrial power, hydraulic energy, and metallurgical feeds.",
        4: "Tier 4: Dynamic Narrative Sparks & Dilemmas - High-tension faction dilemmas, famine riots, and mutiny clocks.",
        5: "Tier 5: Esoteric & Eschatological Engines - Planar collision, forbidden alchemical archives, and cosmic convergence."
      };
      const pTier = m.pipeline_tier || (m.tier && m.tier.match(/Tier\s*(\d)/i) ? parseInt(m.tier.match(/Tier\s*(\d)/i)[1]) : 3);
      document.getElementById('me-tier-desc').textContent = tierDescMap[pTier] || m.tier || 'Universal Tabletop Module';

      // Cultural Alignment
      const cultureEl = document.getElementById('me-culture-chip');
      if (cultureEl) {
        cultureEl.textContent = m.culture ? `${m.culture} (${m.color || 'Neutral'})` : '(Universal affinity)';
      }

      // Prerequisites & Fallback
      let prereqText = '';
      if (m.prerequisites && typeof m.prerequisites === 'object') {
        prereqText = Object.keys(m.prerequisites).map(k => `<strong>${k}:</strong> ${m.prerequisites[k]}`).join('<br>');
      } else if (Array.isArray(m.prerequisites)) {
        prereqText = m.prerequisites.join(', ');
      } else if (typeof m.prerequisites === 'string') {
        prereqText = m.prerequisites;
      } else {
        prereqText = 'None specified (Can be slotted anywhere).';
      }
      document.getElementById('me-prereqs').innerHTML = prereqText;
      document.getElementById('me-fallback').textContent = m.fallback || m.standalone_fallback || 'Standard fallback execution.';

      // Supply Chain Tags
      const provContainer = document.getElementById('me-provides-tags');
      provContainer.innerHTML = '';
      (m.provides || []).forEach(p => {
        const tag = document.createElement('span');
        tag.className = 'me-badge';
        tag.style.background = '#d1fae5';
        tag.style.color = '#065f46';
        tag.textContent = p;
        provContainer.appendChild(tag);
      });
      if ((m.provides || []).length === 0) provContainer.textContent = '(None)';

      const reqContainer = document.getElementById('me-requires-tags');
      reqContainer.innerHTML = '';
      (m.requires || []).forEach(r => {
        const tag = document.createElement('span');
        tag.className = 'me-badge';
        tag.style.background = '#fee2e2';
        tag.style.color = '#991b1b';
        tag.textContent = r;
        reqContainer.appendChild(tag);
      });
      if ((m.requires || []).length === 0) reqContainer.textContent = '(None)';

      document.getElementById('me-yields-text').textContent = m.yields || (m.injected_mechanics && m.injected_mechanics.yields_resource) || 'None';

      // Tab 2: Narrative Entities
      renderModuleEntitiesTab();

      // Tab 3: Mechanics & Clocks
      renderModuleMechanicsTab(m);

      // Tab 4: Full Sourcebook & Notes
      const rawMd = m.raw_markdown || '';
      const renderedEl = document.getElementById('me-reader-rendered');
      if (renderedEl) renderedEl.innerHTML = renderMarkdownText(rawMd);
      const rawEl = document.getElementById('me-reader-raw');
      if (rawEl) rawEl.value = rawMd;
      const fileLink = document.getElementById('me-source-file-link');
      if (m.file_url) {
        fileLink.href = m.file_url;
        fileLink.style.display = 'inline';
      } else {
        fileLink.style.display = 'none';
      }

      document.getElementById('me-footer-status').textContent = `Inspecting ${m.id} (${m.campaign_name || m.campaign || 'Universal'}).`;
    }

    function updateModuleSlotButton() {
      const btn = document.getElementById('me-btn-slot');
      const m = ALL_MODULES.find(mod => mod.id === SelectedModuleId);
      if (!m) {
        btn.disabled = true;
        btn.textContent = 'Slot into Node';
        return;
      }
      btn.disabled = false;

      if (!CurrentModuleTargetNodeId) {
        btn.textContent = 'Select Node to Slot';
        btn.style.background = '#d4d0c8';
        return;
      }

      const topo = Workstation.activeTopology;
      const node = topo && topo.nodes ? topo.nodes[CurrentModuleTargetNodeId] : null;
      const isSlotted = node && node.modules && node.modules.includes(m.id);

      if (isSlotted) {
        btn.textContent = `Unslot from Node ${CurrentModuleTargetNodeId}`;
        btn.style.background = '#fee2e2';
        btn.style.color = '#991b1b';
      } else {
        btn.textContent = `Slot into Node ${CurrentModuleTargetNodeId}`;
        btn.style.background = '#d1fae5';
        btn.style.color = '#065f46';
      }
    }

    function toggleSlotCurrentModule() {
      if (!SelectedModuleId) return;
      if (!CurrentModuleTargetNodeId) {
        alert("Please select a target node in the 'Slot Target Node' dropdown to slot this module.");
        document.getElementById('me-target-node').focus();
        return;
      }

      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes || !topo.nodes[CurrentModuleTargetNodeId]) {
        alert("Target node not found.");
        return;
      }

      const node = topo.nodes[CurrentModuleTargetNodeId];
      if (!Array.isArray(node.modules)) node.modules = [];

      const idx = node.modules.indexOf(SelectedModuleId);
      if (idx >= 0) {
        node.modules.splice(idx, 1);
        setStatusBarMessage(`Unslotted ${SelectedModuleId} from Node ${CurrentModuleTargetNodeId} (${node.name}).`);
      } else {
        node.modules.push(SelectedModuleId);
        setStatusBarMessage(`Slotted ${SelectedModuleId} into Node ${CurrentModuleTargetNodeId} (${node.name}).`);
      }

      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      updateModuleSlotButton();
      filterModules(SelectedModuleId);
    }

    function renderModuleEntitiesTab() {
      const m = ALL_MODULES.find(mod => mod.id === SelectedModuleId);
      if (!m) return;

      const npcs = m.extracted_npcs || [];
      const quests = m.extracted_quests || [];
      const items = m.extracted_items || [];

      document.getElementById('me-tab-ent-count').textContent = npcs.length + quests.length + items.length;
      document.getElementById('me-ent-npc-count').textContent = npcs.length;
      document.getElementById('me-ent-quest-count').textContent = quests.length;
      document.getElementById('me-ent-item-count').textContent = items.length;

      // NPCs
      const npcList = document.getElementById('me-ent-npcs-list');
      npcList.innerHTML = '';
      if (npcs.length === 0) {
        npcList.innerHTML = '<div style="font-size:11px; color:#777; font-style:italic;">No discrete NPCs cataloged in this module.</div>';
      } else {
        npcs.forEach(npc => {
          const div = document.createElement('div');
          div.style.padding = '4px 6px';
          div.style.background = '#fafafa';
          div.style.border = '1px solid #e0e0e0';
          div.style.display = 'flex';
          div.style.justifyContent = 'space-between';
          div.style.alignItems = 'center';
          div.innerHTML = `
            <div>
              <strong>${npc.name}</strong> <span class="me-badge">${npc.role || 'Agent'}</span>
              <div style="font-size:10px; color:#444;">${npc.motivation || ''}</div>
            </div>
            <div style="display:flex; gap:3px;">
              <button class="win-btn" onclick="promoteSingleEntity('npc', '${npc.id}', '${m.id}')" style="font-size:10px; padding:2px 6px; white-space:nowrap;">
                + Add to Node ${CurrentModuleTargetNodeId || '...'}
              </button>
              <button class="win-btn" onclick="promptEntityDelete('npc', '${npc.id}')" style="font-size:10px; padding:2px 5px; color:#b91c1c;" title="Delete NPC">
                Del
              </button>
            </div>
          `;
          npcList.appendChild(div);
        });
      }

      // Quests
      const questList = document.getElementById('me-ent-quests-list');
      questList.innerHTML = '';
      if (quests.length === 0) {
        questList.innerHTML = '<div style="font-size:11px; color:#777; font-style:italic;">No discrete quests or dilemma vectors cataloged.</div>';
      } else {
        quests.forEach(q => {
          const div = document.createElement('div');
          div.style.padding = '4px 6px';
          div.style.background = '#fafafa';
          div.style.border = '1px solid #e0e0e0';
          div.style.display = 'flex';
          div.style.justifyContent = 'space-between';
          div.style.alignItems = 'center';
          div.innerHTML = `
            <div>
              <strong>${q.title}</strong> <span class="me-badge me-badge-crisis">${q.threat || 'Threat'}</span>
              <div style="font-size:10px; color:#444;">${q.notes || ''}</div>
            </div>
            <div style="display:flex; gap:3px;">
              <button class="win-btn" onclick="promoteSingleEntity('quest', '${q.id}', '${m.id}')" style="font-size:10px; padding:2px 6px; white-space:nowrap;">
                + Add to Node ${CurrentModuleTargetNodeId || '...'}
              </button>
              <button class="win-btn" onclick="promptEntityDelete('quest', '${q.id}')" style="font-size:10px; padding:2px 5px; color:#b91c1c;" title="Delete Quest">
                Del
              </button>
            </div>
          `;
          questList.appendChild(div);
        });
      }

      // Items
      const itemList = document.getElementById('me-ent-items-list');
      itemList.innerHTML = '';
      if (items.length === 0) {
        itemList.innerHTML = '<div style="font-size:11px; color:#777; font-style:italic;">No discrete technological relics or items cataloged.</div>';
      } else {
        items.forEach(itm => {
          const div = document.createElement('div');
          div.style.padding = '4px 6px';
          div.style.background = '#fafafa';
          div.style.border = '1px solid #e0e0e0';
          div.style.display = 'flex';
          div.style.justifyContent = 'space-between';
          div.style.alignItems = 'center';
          div.innerHTML = `
            <div>
              <strong>${itm.name}</strong> <span class="me-badge">${itm.category || 'Gear'}</span>
              <div style="font-size:10px; color:#444;">${itm.specs || itm.notes || ''}</div>
            </div>
            <div style="display:flex; gap:3px;">
              <button class="win-btn" onclick="promoteSingleEntity('item', '${itm.id}', '${m.id}')" style="font-size:10px; padding:2px 6px; white-space:nowrap;">
                + Add to Node ${CurrentModuleTargetNodeId || '...'}
              </button>
              <button class="win-btn" onclick="promptEntityDelete('item', '${itm.id}')" style="font-size:10px; padding:2px 5px; color:#b91c1c;" title="Delete Item">
                Del
              </button>
            </div>
          `;
          itemList.appendChild(div);
        });
      }
    }

    function renderModuleMechanicsTab(m) {
      // Clocks
      const clockContainer = document.getElementById('me-threat-clocks-container');
      clockContainer.innerHTML = '';
      const clocks = m.threat_clocks || [];
      if (clocks.length === 0) {
        clockContainer.innerHTML = '<div style="font-size:11px; color:#777; font-style:italic;">No formal threat clocks defined in frontmatter.</div>';
      } else {
        clocks.forEach(c => {
          const box = document.createElement('div');
          box.className = 'me-clock-box';
          box.innerHTML = `<strong style="font-size:11px; color:#b91c1c;">${c}</strong>`;
          clockContainer.appendChild(box);
        });
      }

      // Dials
      const dialContainer = document.getElementById('me-dials-container');
      dialContainer.innerHTML = '';
      const dials = m.dials || [];
      if (dials.length === 0) {
        dialContainer.innerHTML = '<div style="font-size:11px; color:#777; font-style:italic;">No output dial levels defined.</div>';
      } else {
        dials.forEach((d, idx) => {
          const box = document.createElement('div');
          box.className = 'me-dial-box';
          box.innerHTML = `<span class="me-badge" style="background:#047857; color:#fff;">L${idx+1}</span> <strong style="font-size:11px; color:#065f46;">${d}</strong>`;
          dialContainer.appendChild(box);
        });
      }

      // Four-Corner Opposition
      const fcContainer = document.getElementById('me-four-corners-container');
      fcContainer.innerHTML = '';
      if (m.four_corners) {
        const roles = [
          { key: 'establishment', label: 'Establishment (The Law / Status Quo)', color: '#1e3a8a' },
          { key: 'opponent', label: 'Opponent (Rival Faction / Competitor)', color: '#b91c1c' },
          { key: 'shadow', label: 'Shadow (Black Market / Profiteer)', color: '#4b5563' },
          { key: 'outcast', label: 'Outcast (Exiles / Convicts / Pariahs)', color: '#92400e' }
        ];
        roles.forEach(r => {
          const val = m.four_corners[r.key];
          if (val) {
            const card = document.createElement('div');
            card.style.padding = '6px 8px';
            card.style.background = '#fff';
            card.style.border = '1px solid #d1d5db';
            card.innerHTML = `
              <div style="font-size:10px; font-weight:bold; color:${r.color}; text-transform:uppercase;">${r.label}</div>
              <div style="font-size:11px; font-weight:bold; margin-top:2px;">${val}</div>
            `;
            fcContainer.appendChild(card);
          }
        });
      }
      if (fcContainer.children.length === 0) {
        fcContainer.innerHTML = '<div style="font-size:11px; color:#777; font-style:italic;">No Four-Corner opposition matrix established.</div>';
      }
    }

    function switchModuleTab(tabName) {
      CurrentModuleTab = tabName;
      ['overview', 'entities', 'mechanics', 'notes'].forEach(t => {
        const btn = document.getElementById(`me-tab-btn-${t}`);
        const content = document.getElementById(`me-tab-content-${t}`);
        if (t === tabName) {
          btn.classList.add('active');
          content.classList.add('active');
        } else {
          btn.classList.remove('active');
          content.classList.remove('active');
        }
      });
    }

    function setReaderViewMode(mode) {
      ModuleReaderMode = mode;
      const btnRendered = document.getElementById('me-btn-view-rendered');
      const btnRaw = document.getElementById('me-btn-view-raw');
      const renderedPane = document.getElementById('me-reader-rendered');
      const rawPane = document.getElementById('me-reader-raw');

      if (mode === 'rendered') {
        btnRendered.classList.add('active');
        btnRaw.classList.remove('active');
        renderedPane.style.display = 'block';
        rawPane.style.display = 'none';
      } else {
        btnRendered.classList.remove('active');
        btnRaw.classList.add('active');
        renderedPane.style.display = 'none';
        rawPane.style.display = 'block';
      }
    }

    function promoteCurrentModuleEntities() {
      const m = ALL_MODULES.find(mod => mod.id === SelectedModuleId);
      if (!m) return;

      const targetNode = CurrentModuleTargetNodeId;
      const topo = Workstation.activeTopology;
      ensureEntityCollections(topo);

      let count = 0;
      (m.extracted_npcs || []).forEach(npc => {
        if (!topo.npcs.some(e => e.name === npc.name)) {
          topo.npcs.push({
            id: `npc-${Date.now()}-${count}`,
            name: npc.name,
            role: npc.role,
            faction: npc.faction,
            motivation: npc.motivation,
            moduleId: m.id,
            nodeId: targetNode
          });
          count++;
        }
      });

      (m.extracted_quests || []).forEach(q => {
        if (!topo.quests.some(e => e.title === q.title)) {
          topo.quests.push({
            id: `quest-${Date.now()}-${count}`,
            title: q.title,
            type: q.type,
            threat: q.threat,
            notes: q.notes,
            moduleId: m.id,
            nodeId: targetNode
          });
          count++;
        }
      });

      (m.extracted_items || []).forEach(itm => {
        if (!topo.items.some(e => e.name === itm.name)) {
          topo.items.push({
            id: `item-${Date.now()}-${count}`,
            name: itm.name,
            category: itm.category,
            specs: itm.specs,
            notes: itm.notes,
            moduleId: m.id,
            nodeId: targetNode
          });
          count++;
        }
      });

      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      setStatusBarMessage(`Promoted ${count} entities from ${m.id} to campaign ${targetNode ? `(Stationed to Node ${targetNode})` : ''}.`);
      alert(`Promoted ${count} entities from ${m.id} into active campaign roster.`);
    }

    function promoteSingleEntity(type, entityId, modId) {
      const m = ALL_MODULES.find(mod => mod.id === modId);
      if (!m) return;

      const list = type === 'npc' ? m.extracted_npcs : (type === 'quest' ? m.extracted_quests : m.extracted_items);
      const entity = list.find(e => e.id === entityId);
      if (!entity) return;

      const topo = Workstation.activeTopology;
      ensureEntityCollections(topo);
      const activeList = getActiveEntityList(type);

      const targetNode = CurrentModuleTargetNodeId;

      const newEnt = {
        id: `${type}-${Date.now().toString().slice(-6)}`,
        nodeId: targetNode,
        moduleId: m.id,
        isCustom: false,
        status: 'Active'
      };

      if (type === 'npc') {
        newEnt.name = entity.name;
        newEnt.role = entity.role;
        newEnt.faction = entity.faction;
        newEnt.motivation = entity.motivation;
      } else if (type === 'quest') {
        newEnt.title = entity.title;
        newEnt.type = entity.type;
        newEnt.threat = entity.threat;
        newEnt.notes = entity.notes;
      } else {
        newEnt.name = entity.name;
        newEnt.category = entity.category;
        newEnt.specs = entity.specs;
        newEnt.notes = entity.notes;
      }

      activeList.push(newEnt);
      saveActiveCampaign();
      renderCanvas();
      updatePropertiesGrid();
      setStatusBarMessage(`Added ${type.toUpperCase()} "${newEnt.name || newEnt.title}" to Node ${targetNode || 'Pool'}.`);
    }

    function clearModuleInspector() {
      SelectedModuleId = null;
      const idEl = document.getElementById('me-detail-id');
      if (idEl) idEl.textContent = '-';
      const titleEl = document.getElementById('me-detail-title');
      if (titleEl) titleEl.textContent = 'No module selected';
      const sumEl = document.getElementById('me-detail-summary');
      if (sumEl) sumEl.textContent = 'Please select a module from the list.';
      const renderedEl = document.getElementById('me-reader-rendered');
      if (renderedEl) renderedEl.innerHTML = '<div style="font-size:11px; color:#777; font-style:italic;">No module selected.</div>';
      const rawEl = document.getElementById('me-reader-raw');
      if (rawEl) rawEl.value = '';
    }
    window.clearModuleInspector = clearModuleInspector;

    // ========================================================================
    // IN-APP GM CUSTOM MODULE STUDIO & EDITOR (SYS-START-09)
    // ========================================================================
    function syncCustomModulesToCatalog(topo) {
      const activeTopo = topo || (typeof Workstation !== 'undefined' ? Workstation.activeTopology : null);
      if (typeof ALL_MODULES === 'undefined' || !Array.isArray(ALL_MODULES)) return;

      // Remove any previously injected custom modules that are no longer in activeTopo.custom_modules
      for (let i = ALL_MODULES.length - 1; i >= 0; i--) {
        if (ALL_MODULES[i] && ALL_MODULES[i].isCustom) {
          ALL_MODULES.splice(i, 1);
        }
      }
      if (typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST) && MODULES_MANIFEST !== ALL_MODULES) {
        for (let i = MODULES_MANIFEST.length - 1; i >= 0; i--) {
          if (MODULES_MANIFEST[i] && MODULES_MANIFEST[i].isCustom) {
            MODULES_MANIFEST.splice(i, 1);
          }
        }
      }

      if (!activeTopo || !Array.isArray(activeTopo.custom_modules)) return;

      activeTopo.custom_modules.forEach(cm => {
        if (!cm || !cm.id) return;
        if (Array.isArray(activeTopo.deletedModules) && (activeTopo.deletedModules.includes(String(cm.id)) || activeTopo.deletedModules.includes(cm.id))) {
          return;
        }
        const normalized = normalizeCustomModuleRecord(cm);
        const existingIdx = ALL_MODULES.findIndex(m => m.id === normalized.id);
        if (existingIdx >= 0) {
          ALL_MODULES[existingIdx] = normalized;
        } else {
          ALL_MODULES.unshift(normalized);
        }
        if (typeof MODULES_MANIFEST !== 'undefined' && Array.isArray(MODULES_MANIFEST) && MODULES_MANIFEST !== ALL_MODULES) {
          const mIdx = MODULES_MANIFEST.findIndex(m => m.id === normalized.id);
          if (mIdx >= 0) {
            MODULES_MANIFEST[mIdx] = normalized;
          } else {
            MODULES_MANIFEST.unshift(normalized);
          }
        }
      });
    }
    window.syncCustomModulesToCatalog = syncCustomModulesToCatalog;

    function normalizeCustomModuleRecord(raw) {
      const pTier = parseInt(raw.pipeline_tier) || 3;
      const tierLabels = {
        1: 'Tier 1: Macro Governance',
        2: 'Tier 2: Biome & Edge',
        3: 'Tier 3: Infrastructure',
        4: 'Tier 4: Social / Catalyst',
        5: 'Tier 5: Esoteric / Climax'
      };
      const provides = Array.isArray(raw.provides)
        ? raw.provides.map(s => String(s).trim()).filter(Boolean)
        : (typeof raw.provides === 'string' ? raw.provides.split(',').map(s => s.trim()).filter(Boolean) : []);
      const requires = Array.isArray(raw.requires)
        ? raw.requires.map(s => String(s).trim()).filter(Boolean)
        : (typeof raw.requires === 'string' ? raw.requires.split(',').map(s => s.trim()).filter(Boolean) : []);
      const fallback = raw.standalone_fallback || raw.fallback || 'Standard fallback execution.';
      const yields = raw.yields || (provides.length > 0 ? provides.join(', ') : 'Custom Module Output');

      const mod = {
        id: String(raw.id || 'CUST-01').trim(),
        title: String(raw.title || 'Untitled Custom Module').trim(),
        pipeline_tier: pTier,
        tier: raw.tier || tierLabels[pTier] || `Tier ${pTier}`,
        set: raw.set || 'Set H: Homebrew',
        campaign: 'custom_homebrew',
        campaign_name: 'Custom / Homebrew',
        isCustom: true,
        culture: raw.culture || 'Hierarchy',
        color: raw.color || raw.mtg_color || 'Artifact / Colorless',
        mtg_color: raw.color || raw.mtg_color || 'Artifact / Colorless',
        summary: raw.summary || yields,
        yields: yields,
        provides: provides,
        requires: requires,
        prerequisites: raw.prerequisites || 'Any compatible settlement node.',
        fallback: fallback,
        standalone_fallback: fallback,
        extracted_npcs: Array.isArray(raw.extracted_npcs) ? raw.extracted_npcs : [],
        extracted_quests: Array.isArray(raw.extracted_quests) ? raw.extracted_quests : [],
        extracted_items: Array.isArray(raw.extracted_items) ? raw.extracted_items : [],
        threat_clocks: Array.isArray(raw.threat_clocks) ? raw.threat_clocks : [],
        dials: Array.isArray(raw.dials) ? raw.dials : [],
        raw_markdown: raw.raw_markdown || ''
      };
      if (!mod.raw_markdown) {
        mod.raw_markdown = buildCustomModuleMarkdown(mod);
      }
      return mod;
    }
    window.normalizeCustomModuleRecord = normalizeCustomModuleRecord;

    function generateNextCustomModuleId() {
      const existingIds = new Set();
      if (typeof ALL_MODULES !== 'undefined' && Array.isArray(ALL_MODULES)) {
        ALL_MODULES.forEach(m => { if (m && m.id) existingIds.add(String(m.id).toUpperCase()); });
      }
      const topo = Workstation.activeTopology;
      if (topo && Array.isArray(topo.custom_modules)) {
        topo.custom_modules.forEach(m => { if (m && m.id) existingIds.add(String(m.id).toUpperCase()); });
      }
      let num = 1;
      while (existingIds.has(`CUST-${String(num).padStart(2, '0')}`)) {
        num++;
      }
      return `CUST-${String(num).padStart(2, '0')}`;
    }

    function openCustomModuleEditor(initialMod) {
      closeAllMenus();
      MDIWindowManager.open('modal-custom-module-editor');

      const mod = initialMod || {};
      const nextId = mod.id || generateNextCustomModuleId();
      const pTier = mod.pipeline_tier || (mod.tier && mod.tier.match(/Tier\s*(\d)/i) ? parseInt(mod.tier.match(/Tier\s*(\d)/i)[1]) : 3);

      document.getElementById('cme-id').value = nextId;
      document.getElementById('cme-title').value = mod.title || '';
      document.getElementById('cme-tier').value = String(pTier);
      document.getElementById('cme-set').value = mod.set || 'Set H: Homebrew';
      document.getElementById('cme-culture').value = mod.culture || 'Hierarchy';
      document.getElementById('cme-color').value = mod.color || mod.mtg_color || 'Artifact / Colorless';
      document.getElementById('cme-yields').value = mod.yields || '';
      document.getElementById('cme-provides').value = Array.isArray(mod.provides) ? mod.provides.join(', ') : (mod.provides || '');
      document.getElementById('cme-requires').value = Array.isArray(mod.requires) ? mod.requires.join(', ') : (mod.requires || '');
      document.getElementById('cme-prereqs').value = typeof mod.prerequisites === 'string' ? mod.prerequisites : '';
      document.getElementById('cme-fallback').value = mod.standalone_fallback || mod.fallback || '';

      const npcsLines = (mod.extracted_npcs || []).map(n => `${n.name || ''} | ${n.role || 'Agent'} | ${n.motivation || ''}`).join('\n');
      const questsLines = (mod.extracted_quests || []).map(q => `${q.title || ''} | ${q.threat || '4 Ticks'} | ${q.notes || ''}`).join('\n');
      const itemsLines = (mod.extracted_items || []).map(i => `${i.name || ''} | ${i.category || 'Gear'} | ${i.specs || i.notes || ''}`).join('\n');

      document.getElementById('cme-npcs').value = npcsLines;
      document.getElementById('cme-quests').value = questsLines;
      document.getElementById('cme-items').value = itemsLines;
      document.getElementById('cme-markdown').value = mod.body_markdown || mod.raw_markdown || '';

      const statusEl = document.getElementById('cme-status-msg');
      if (statusEl) {
        statusEl.textContent = mod.id ? `Editing module ${mod.id}` : `Creating new custom module (${nextId})`;
      }
    }
    window.openCustomModuleEditor = openCustomModuleEditor;

    function editOrCloneCurrentModule() {
      const m = (typeof ALL_MODULES !== 'undefined') ? ALL_MODULES.find(mod => mod.id === SelectedModuleId) : null;
      if (!m) {
        openCustomModuleEditor();
        return;
      }
      if (m.isCustom) {
        openCustomModuleEditor(m);
      } else {
        const cloned = JSON.parse(JSON.stringify(m));
        cloned.id = generateNextCustomModuleId();
        cloned.title = `${m.title} (Custom)`;
        cloned.set = 'Set H: Homebrew';
        cloned.isCustom = true;
        openCustomModuleEditor(cloned);
      }
    }
    window.editOrCloneCurrentModule = editOrCloneCurrentModule;

    function collectCustomModuleDraftFromForm() {
      const idVal = (document.getElementById('cme-id').value || '').trim() || generateNextCustomModuleId();
      const titleVal = (document.getElementById('cme-title').value || '').trim() || 'Untitled Custom Module';
      const tierVal = parseInt(document.getElementById('cme-tier').value) || 3;
      const setVal = (document.getElementById('cme-set').value || '').trim() || 'Set H: Homebrew';
      const cultureVal = document.getElementById('cme-culture').value || 'Hierarchy';
      const colorVal = document.getElementById('cme-color').value || 'Artifact / Colorless';
      const yieldsVal = (document.getElementById('cme-yields').value || '').trim();
      const providesArr = (document.getElementById('cme-provides').value || '').split(',').map(s => s.trim()).filter(Boolean);
      const requiresArr = (document.getElementById('cme-requires').value || '').split(',').map(s => s.trim()).filter(Boolean);
      const prereqsVal = (document.getElementById('cme-prereqs').value || '').trim() || 'Any compatible settlement node.';
      const fallbackVal = (document.getElementById('cme-fallback').value || '').trim() || 'Standard fallback execution when upstream corridors are severed.';

      const npcs = (document.getElementById('cme-npcs').value || '').split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        return {
          id: `PROTO-NPC-${idVal}-${idx + 1}`,
          name: parts[0] || `Agent ${idx + 1}`,
          role: parts[1] || 'Specialist',
          motivation: parts[2] || 'Maintain local operations.'
        };
      });

      const quests = (document.getElementById('cme-quests').value || '').split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        return {
          id: `PROTO-QST-${idVal}-${idx + 1}`,
          title: parts[0] || `Dilemma ${idx + 1}`,
          type: 'Custom Hook',
          threat: parts[1] || '4 Ticks',
          notes: parts[2] || ''
        };
      });

      const items = (document.getElementById('cme-items').value || '').split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        return {
          id: `PROTO-ITM-${idVal}-${idx + 1}`,
          name: parts[0] || `Apparatus ${idx + 1}`,
          category: parts[1] || 'Gear',
          specs: parts[2] || '',
          notes: parts[2] || ''
        };
      });

      const bodyMd = (document.getElementById('cme-markdown').value || '').trim();

      const draft = normalizeCustomModuleRecord({
        id: idVal,
        title: titleVal,
        pipeline_tier: tierVal,
        set: setVal,
        culture: cultureVal,
        color: colorVal,
        yields: yieldsVal || (providesArr.length > 0 ? providesArr.join(', ') : 'Custom Module Yield'),
        provides: providesArr,
        requires: requiresArr,
        prerequisites: prereqsVal,
        standalone_fallback: fallbackVal,
        extracted_npcs: npcs,
        extracted_quests: quests,
        extracted_items: items,
        raw_markdown: bodyMd
      });
      draft.raw_markdown = buildCustomModuleMarkdown(draft, bodyMd);
      return draft;
    }

    function buildCustomModuleMarkdown(mod, customBody) {
      const provYaml = JSON.stringify(mod.provides || []);
      const reqYaml = JSON.stringify(mod.requires || []);
      const body = (customBody !== undefined ? customBody : (mod.raw_markdown || '')).replace(/^---[\s\S]*?---\s*/, '').trim();
      const lines = [
        '---',
        `id: "${mod.id}"`,
        `title: "${(mod.title || '').replace(/"/g, '\\"')}"`,
        `pipeline_tier: ${mod.pipeline_tier || 3}`,
        `set: "${(mod.set || 'Set H: Homebrew').replace(/"/g, '\\"')}"`,
        `culture: "${mod.culture || 'Hierarchy'}"`,
        `mtg_color: "${mod.color || 'Artifact / Colorless'}"`,
        `provides: ${provYaml}`,
        `requires: ${reqYaml}`,
        `standalone_fallback: "${(mod.standalone_fallback || mod.fallback || '').replace(/"/g, '\\"')}"`,
        '---',
        '',
        `# ${mod.id}: ${mod.title}`,
        `*${mod.tier || `Tier ${mod.pipeline_tier || 3}`} | Culture: ${mod.culture || 'Universal'} | Color: ${mod.color || 'Colorless'}*`,
        '',
        body || `## 1. Architectural Overview\n${mod.summary || mod.yields || 'Custom worldbuilding module.'}\n\n## 2. Supply Chain & Standalone Fallback\n- **Provides:** ${(mod.provides || []).join(', ') || 'None'}\n- **Requires:** ${(mod.requires || []).join(', ') || 'None'}\n- **Standalone Fallback:** ${mod.standalone_fallback || 'Standard fallback.'}`
      ];
      return lines.join('\n');
    }
    window.buildCustomModuleMarkdown = buildCustomModuleMarkdown;

    function saveCustomModuleFromStudio() {
      const topo = Workstation.activeTopology;
      if (!topo) return;
      ensureEntityCollections(topo);
      ensureCampaignModules(topo);

      const draft = collectCustomModuleDraftFromForm();
      if (!Array.isArray(topo.custom_modules)) topo.custom_modules = [];

      // Remove from deletedModules if re-created
      if (Array.isArray(topo.deletedModules)) {
        topo.deletedModules = topo.deletedModules.filter(id => String(id) !== String(draft.id));
      }

      const existingIdx = topo.custom_modules.findIndex(m => m.id === draft.id);
      if (existingIdx >= 0) {
        topo.custom_modules[existingIdx] = draft;
      } else {
        topo.custom_modules.push(draft);
      }

      if (!topo.campaign_modules.includes(draft.id)) {
        topo.campaign_modules.push(draft.id);
      }

      syncCustomModulesToCatalog(topo);
      saveActiveCampaign();

      MDIWindowManager.close('modal-custom-module-editor');
      openModuleExplorer(draft.id, CurrentModuleTargetNodeId);
      if (typeof auditAllSupplyLines === 'function') auditAllSupplyLines();
      renderCanvas();
      updatePropertiesGrid();
      setStatusBarMessage(`Saved custom module ${draft.id} ("${draft.title}") to campaign.`);
    }
    window.saveCustomModuleFromStudio = saveCustomModuleFromStudio;

    function promoteNodeEndowmentsToModule(nodeId) {
      const topo = Workstation.activeTopology;
      if (!topo || !topo.nodes) return;
      const node = topo.nodes[String(nodeId)] || topo.nodes[nodeId];
      if (!node) return;

      const nextId = generateNextCustomModuleId();
      const draftInit = {
        id: nextId,
        title: `${node.name || `Node ${nodeId}`} Logistics Package`,
        pipeline_tier: node.tier || 3,
        set: 'Set H: Homebrew',
        culture: node.culture || 'Hierarchy',
        provides: Array.isArray(node.provides) ? [...node.provides] : [],
        requires: Array.isArray(node.requires) ? [...node.requires] : [],
        yields: (Array.isArray(node.provides) && node.provides.length > 0) ? node.provides.join(', ') : 'Local Settlement Endowments',
        prerequisites: `Originated at ${node.name || `Node #${nodeId}`} (${node.cat || 'Settlement'}).`,
        standalone_fallback: node.operationalProfile
          ? `Node operates under ${node.operationalProfile} profile when supply lines are severed.`
          : 'Operations degrade to local subsistence rations upon corridor severance.',
        body_markdown: `## 1. Architectural Overview\nPromoted from ad-hoc endowments on **${node.name || `Node #${nodeId}`}**.\n\n## 2. Operational Notes\n${node.customNotes || 'Provides reusable supply chain contracts for pointcrawl nodes.'}`
      };

      CurrentModuleTargetNodeId = parseInt(nodeId) || nodeId;
      openCustomModuleEditor(draftInit);
      setStatusBarMessage(`Pre-populated Custom Module Studio (${nextId}) from Node #${nodeId} endowments.`);
    }
    window.promoteNodeEndowmentsToModule = promoteNodeEndowmentsToModule;

    function downloadMarkdownFile(filename, content) {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }

    function exportCustomModuleDraftMarkdown() {
      const draft = collectCustomModuleDraftFromForm();
      const slug = `${draft.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`;
      downloadMarkdownFile(slug, draft.raw_markdown);
      setStatusBarMessage(`Exported ${slug} with standardized YAML frontmatter.`);
    }
    window.exportCustomModuleDraftMarkdown = exportCustomModuleDraftMarkdown;

    function exportModuleMarkdownFile() {
      const m = (typeof ALL_MODULES !== 'undefined') ? ALL_MODULES.find(mod => mod.id === SelectedModuleId) : null;
      if (!m) return;
      const mdContent = m.raw_markdown && m.raw_markdown.startsWith('---')
        ? m.raw_markdown
        : buildCustomModuleMarkdown(m, m.raw_markdown || '');
      const slug = `${m.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${(m.title || 'module').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`;
      downloadMarkdownFile(slug, mdContent);
      setStatusBarMessage(`Exported ${slug}.`);
    }
    window.exportModuleMarkdownFile = exportModuleMarkdownFile;