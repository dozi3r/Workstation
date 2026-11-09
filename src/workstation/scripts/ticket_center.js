    // ========================================================================
    // TICKET COMMAND CENTER ENGINE (F9)
    // ========================================================================
    let activeTicketTab = 'repo'; // 'repo' | 'campaign'
    let selectedTicketId = null;
    let selectedTicketSource = 'repo';

    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function escapeJsArg(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    function openTicketCenter() {
      MDIWindowManager.open('modal-ticket-center');
      renderTicketList();
    }

    function switchTicketCenterTab(tab) {
      activeTicketTab = tab;
      const tabRepoBtn = document.getElementById('tc-tab-repo');
      const tabCampBtn = document.getElementById('tc-tab-campaign');
      const trackFilter = document.getElementById('tc-filter-track');

      if (tab === 'repo') {
        if (tabRepoBtn) tabRepoBtn.classList.add('active');
        if (tabCampBtn) tabCampBtn.classList.remove('active');
        if (trackFilter) trackFilter.style.display = 'inline-block';
      } else {
        if (tabRepoBtn) tabRepoBtn.classList.remove('active');
        if (tabCampBtn) tabCampBtn.classList.add('active');
        if (trackFilter) trackFilter.style.display = 'none';
      }
      renderTicketList();
    }

    function getCombinedTickets() {
      const rawRepo = (typeof MASTER_TICKETS_DATA !== 'undefined' ? MASTER_TICKETS_DATA : []);
      const overrides = (Workstation.activeTopology && Workstation.activeTopology.ticketOverrides) ? Workstation.activeTopology.ticketOverrides : {};
      const repoTickets = rawRepo.map(t => {
        if (overrides[t.id]) {
          return Object.assign({}, t, overrides[t.id]);
        }
        return t;
      });
      const campTickets = (Workstation.activeTopology && Workstation.activeTopology.tickets) ? Workstation.activeTopology.tickets : [];
      return { repoTickets, campTickets };
    }

    function formatTicketTargetBadge(t) {
      const topo = Workstation.activeTopology || {};
      const type = t.targetType || (t.nodeId ? 'node' : 'campaign');
      const id = t.targetId || t.nodeId;
      if (!id || type === 'campaign') return '<span style="color:#64748b;">[Campaign]</span>';
      if (type === 'node') return `<span style="color:#0284c7; cursor:pointer;" onclick="event.stopPropagation(); centerOnNode('${escapeJsArg(id)}')" title="Center Node on Canvas">[Node ${escapeHtml(id)}]</span>`;
      if (type === 'npc') {
        const npc = (topo.npcs || []).find(n => String(n.id) === String(id));
        return `<span style="color:#7c3aed; cursor:pointer;" onclick="event.stopPropagation(); if(typeof openEntityManager==='function') openEntityManager('npc', '${escapeJsArg(id)}')" title="Inspect NPC">[NPC] ${escapeHtml((npc && npc.name) || id)}</span>`;
      }
      if (type === 'quest') {
        const q = (topo.quests || []).find(x => String(x.id) === String(id));
        return `<span style="color:#ea580c; cursor:pointer;" onclick="event.stopPropagation(); if(typeof openEntityManager==='function') openEntityManager('quest', '${escapeJsArg(id)}')" title="Inspect Quest">[Quest] ${escapeHtml((q && (q.title || q.name)) || id)}</span>`;
      }
      if (type === 'item') {
        const it = (topo.items || []).find(x => String(x.id) === String(id));
        return `<span style="color:#16a34a; cursor:pointer;" onclick="event.stopPropagation(); if(typeof openEntityManager==='function') openEntityManager('item', '${escapeJsArg(id)}')" title="Inspect Item">[Item] ${escapeHtml((it && it.name) || id)}</span>`;
      }
      if (type === 'tracker') {
        const trk = (topo.trackers || []).find(x => String(x.id) === String(id));
        return `<span style="color:#dc2626; cursor:pointer;" onclick="event.stopPropagation(); if(typeof openEntityManager==='function') openEntityManager('tracker', '${escapeJsArg(id)}')" title="Inspect Threat Clock">[Clock] ${escapeHtml((trk && trk.name) || id)}</span>`;
      }
      if (type === 'faction') {
        const f = (topo.factions || []).find(x => String(x.id) === String(id));
        return `<span style="color:#d97706; cursor:pointer;" onclick="event.stopPropagation(); if(typeof openEntityManager==='function') openEntityManager('faction', '${escapeJsArg(id)}')" title="Inspect Faction">[Faction] ${escapeHtml((f && f.name) || id)}</span>`;
      }
      if (type === 'edge') {
        return `<span style="color:#0891b2; cursor:pointer;" onclick="event.stopPropagation(); if(typeof openEntityManager==='function') openEntityManager('edge', '${escapeJsArg(id)}')" title="Inspect Transit Corridor">[Corridor ${escapeHtml(id)}]</span>`;
      }
      return `<span style="color:#64748b;">[${type}]</span>`;
    }

    function renderTicketList() {
      const { repoTickets, campTickets } = getCombinedTickets();
      const campCountEl = document.getElementById('tc-campaign-count');
      if (campCountEl) campCountEl.textContent = campTickets.length;

      const trackFilter = document.getElementById('tc-filter-track') ? document.getElementById('tc-filter-track').value : 'all';
      const tierFilter = document.getElementById('tc-filter-tier') ? document.getElementById('tc-filter-tier').value : 'all';
      const statusFilter = document.getElementById('tc-filter-status') ? document.getElementById('tc-filter-status').value : 'all';
      const searchVal = document.getElementById('tc-search-input') ? document.getElementById('tc-search-input').value.toLowerCase().trim() : '';

      const sourceList = activeTicketTab === 'repo' ? repoTickets : campTickets;
      const filtered = sourceList.filter(t => {
        if (activeTicketTab === 'repo' && trackFilter !== 'all') {
          if (t.track !== trackFilter && t.category !== trackFilter) return false;
        }
        if (tierFilter !== 'all') {
          const tTier = t.pipeline_tier !== undefined ? t.pipeline_tier : t.tier;
          if (String(tTier) !== tierFilter) return false;
        }
        if (statusFilter === 'not_shipped') {
          const s = (t.status || '').toLowerCase();
          if (s === 'shipped' || s === 'done') return false;
        } else if (statusFilter === 'hide_done') {
          const s = (t.status || '').toLowerCase();
          if (s === 'done') return false;
        } else if (statusFilter !== 'all') {
          if ((t.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
        }
        if (searchVal) {
          const matchStr = `${t.id || ''} ${t.title || ''} ${t.summary || ''} ${t.category || ''} ${t.syllogism || ''}`.toLowerCase();
          if (!matchStr.includes(searchVal)) return false;
        }
        return true;
      });

      const tbody = document.getElementById('tc-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (filtered.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="text-align:center; color:#777; padding:18px;">No tickets match current filters.</td>`;
        tbody.appendChild(tr);
        clearTicketInspector();
      } else {
        filtered.forEach(t => {
          const tr = document.createElement('tr');
          const isSelected = selectedTicketId === t.id && selectedTicketSource === activeTicketTab;
          if (isSelected) tr.classList.add('selected');

          const tierNum = t.pipeline_tier !== undefined ? t.pipeline_tier : (t.tier !== undefined ? t.tier : '-');
          const isDev = (t.type === 'dev' || (t.id && t.id.startsWith('DEV-')) || t.track === 'Platform Development');
          const tierDisplay = isDev ? 'DEV' : (tierNum !== '-' ? `T${tierNum}` : '-');
          const statusSlug = (t.status || 'draft').toLowerCase().replace(/\s+/g, '_');
          const statusLabel = (t.status || 'Draft').replace(/_/g, ' ').toUpperCase();
          const targetBadge = formatTicketTargetBadge(t);

          tr.innerHTML = `
            <td><strong>${t.id || 'TK'}</strong></td>
            <td>${tierDisplay}</td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:210px;" title="${escapeHtml(t.title || '')}">${escapeHtml(t.title || '(Untitled)')}</td>
            <td style="font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:125px;">${targetBadge}</td>
            <td><span class="ticket-badge-status status-${statusSlug}">${statusLabel}</span></td>
            <td style="text-align:center;">
              <button class="win-btn" onclick="event.stopPropagation(); openEditTicketModal('${escapeJsArg(t.id)}')" style="font-size:9px; padding:1px 4px; color:#000080;" title="Edit Ticket">Edit</button>
            </td>
          `;
          tr.ondblclick = () => {
            openEditTicketModal(t.id);
          };
          tr.onclick = () => selectTicket(t.id, activeTicketTab);
          tbody.appendChild(tr);
        });

        // Ensure selection
        const currentStillExists = filtered.some(t => t.id === selectedTicketId && selectedTicketSource === activeTicketTab);
        if (!currentStillExists) {
          selectTicket(filtered[0].id, activeTicketTab);
        } else {
          selectTicket(selectedTicketId, activeTicketTab);
        }
      }

      // Update footer
      const footerStatus = document.getElementById('tc-footer-status');
      if (footerStatus) {
        footerStatus.textContent = `Showing ${filtered.length} of ${sourceList.length} tickets (${activeTicketTab === 'repo' ? 'Repository Master Backlog' : 'Campaign Author Tickets'}).`;
      }
    }

    function selectTicket(id, source) {
      selectedTicketId = id;
      selectedTicketSource = source;

      // Update selection styling in table
      const tbody = document.getElementById('tc-table-body');
      if (tbody) {
        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
          const firstTd = tr.querySelector('td strong');
          if (firstTd && firstTd.textContent === id) {
            tr.classList.add('selected');
          } else {
            tr.classList.remove('selected');
          }
        });
      }

      const { repoTickets, campTickets } = getCombinedTickets();
      const list = source === 'repo' ? repoTickets : campTickets;
      const t = list.find(item => item.id === id);

      const detailPane = document.getElementById('tc-detail-pane');
      if (!detailPane) return;
      if (!t) {
        clearTicketInspector();
        return;
      }

      const tierNum = t.pipeline_tier !== undefined ? t.pipeline_tier : (t.tier !== undefined ? t.tier : '-');
      const statusSlug = (t.status || 'draft').toLowerCase().replace(/\s+/g, '_');
      const statusLabel = (t.status || 'Draft').replace(/_/g, ' ').toUpperCase();
      const priority = t.priority || 'Medium';

      // Four-corners rendering
      let fourCornersHtml = '';
      if (typeof t.four_corners === 'object' && t.four_corners !== null) {
        fourCornersHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px;">
            <div style="background:#fff; border:1px solid #ccc; padding:4px;"><strong>Establishment:</strong><div style="font-size:11px; color:#333;">${escapeHtml(t.four_corners.establishment || 'None')}</div></div>
            <div style="background:#fff; border:1px solid #ccc; padding:4px;"><strong>Opponent:</strong><div style="font-size:11px; color:#333;">${escapeHtml(t.four_corners.opponent || 'None')}</div></div>
            <div style="background:#fff; border:1px solid #ccc; padding:4px;"><strong>Shadow:</strong><div style="font-size:11px; color:#333;">${escapeHtml(t.four_corners.shadow || 'None')}</div></div>
            <div style="background:#fff; border:1px solid #ccc; padding:4px;"><strong>Outcast:</strong><div style="font-size:11px; color:#333;">${escapeHtml(t.four_corners.outcast || 'None')}</div></div>
          </div>
        `;
      } else if (t.fourCorners) {
        fourCornersHtml = `<div style="background:#fff; border:1px solid #ccc; padding:6px; white-space:pre-wrap; font-size:11px;">${escapeHtml(t.fourCorners)}</div>`;
      } else {
        fourCornersHtml = `<div style="font-size:11px; color:#777;">No four-corner opposition defined.</div>`;
      }

      // Dials & Clocks rendering
      let dialsHtml = '';
      const dials = t.dials || [];
      if (dials.length > 0) {
        dialsHtml = dials.map(d => `<li style="font-size:11px; margin-bottom:2px;">${escapeHtml(d)}</li>`).join('');
      } else if (t.mechanics) {
        dialsHtml = `<li style="font-size:11px; white-space:pre-wrap;">${escapeHtml(t.mechanics)}</li>`;
      } else {
        dialsHtml = `<li style="font-size:11px; color:#777;">No dials configured.</li>`;
      }

      let clocksHtml = '';
      const clocks = t.threat_clocks || [];
      if (clocks.length > 0) {
        clocksHtml = clocks.map(c => `<li style="font-size:11px; margin-bottom:2px;"><strong>${escapeHtml(c)}</strong></li>`).join('');
      } else {
        clocksHtml = `<li style="font-size:11px; color:#777;">No threat clocks bound.</li>`;
      }

      // Provides & Requires rendering
      const provides = (t.provides || []).join(', ') || 'None';
      const requires = (t.requires || []).join(', ') || 'None';

      const isDev = (t.type === 'dev' || (t.id && t.id.startsWith('DEV-')) || t.track === 'Platform Development');
      const tierBadge = isDev ? 'DEV' : (tierNum !== '-' ? `Tier ${tierNum}` : '-');

      // Build Inspector View
      detailPane.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #808080; padding-bottom:6px; margin-bottom:8px;">
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:13px; font-weight:bold; color:#000080;">${escapeHtml(t.id)}</span>
              <span class="ticket-badge-status status-${statusSlug}">${statusLabel}</span>
              <span style="font-size:10px; background:#e0e7ff; color:#3730a3; padding:1px 5px; border-radius:2px; font-weight:bold;">${tierBadge}</span>
              <span style="font-size:10px; background:#fef3c7; color:#92400e; padding:1px 5px; border-radius:2px; font-weight:bold;">${escapeHtml(priority)}</span>
            </div>
            <div style="font-size:12px; font-weight:bold; color:#111; margin-top:3px;">${escapeHtml(t.title || '(Untitled)')}</div>
            <div style="font-size:10px; color:#555; margin-top:2px;">Track: ${escapeHtml(t.track || t.category || 'General')} | Category: ${escapeHtml(t.category || '-')} | Target: ${formatTicketTargetBadge(t)}</div>
          </div>
          <div style="display:flex; gap:4px; align-items:center;">
            <button class="win-btn" onclick="openEditTicketModal('${escapeJsArg(t.id)}')" style="font-size:10px; font-weight:bold; color:#000080;" title="Edit Ticket in Dialog">✏️ Edit</button>
            ${(t.status || '').toLowerCase() === 'done'
              ? `<button class="win-btn" onclick="markTicketUndone('${t.id}', '${source}')" style="font-size:10px; color:#555;" title="Reopen / Mark as Incomplete">Reopen</button>`
              : `<button class="win-btn" onclick="markTicketDone('${t.id}', '${source}')" style="font-size:10px; font-weight:bold; color:#15803d;" title="Mark this ticket as Done">✓ Mark Done</button>`}
            <button class="win-btn" onclick="exportSelectedTicketMarkdown()" title="Export as TEMPLATE.md Markdown">Export .md</button>
            ${source === 'campaign' ? `<button class="win-btn" onclick="deleteCampaignTicket('${t.id}')" style="color:#b91c1c;" title="Delete Ticket">Delete</button>` : ''}
          </div>
        </div>

        ${source === 'campaign' ? `
        <!-- Campaign Author Controls -->
        <div class="bevel-thin-inset" style="background:#eef2f6; padding:6px; margin-bottom:8px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <label style="font-size:10px; display:flex; align-items:center; gap:4px;">
            <strong>Status:</strong>
            <select class="win-select-input" style="font-size:10px;" onchange="updateCampaignTicketProp('${t.id}', 'status', this.value)">
              <option value="ready_for_authoring" ${t.status === 'ready_for_authoring' ? 'selected' : ''}>Ready to Author</option>
              <option value="in_drafting" ${t.status === 'in_drafting' ? 'selected' : ''}>In Drafting</option>
              <option value="shipped" ${t.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
              <option value="backlog" ${t.status === 'backlog' ? 'selected' : ''}>Backlog</option>
            </select>
          </label>
          <label style="font-size:10px; display:flex; align-items:center; gap:4px;">
            <strong>Priority:</strong>
            <select class="win-select-input" style="font-size:10px;" onchange="updateCampaignTicketProp('${t.id}', 'priority', this.value)">
              <option value="Low" ${t.priority === 'Low' ? 'selected' : ''}>Low</option>
              <option value="Medium" ${t.priority === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="High" ${t.priority === 'High' ? 'selected' : ''}>High</option>
              <option value="Critical" ${t.priority === 'Critical' ? 'selected' : ''}>Critical</option>
            </select>
          </label>
          <label style="font-size:10px; display:flex; align-items:center; gap:4px;">
            <strong>Spatial Node:</strong>
            <select class="win-select-input" style="font-size:10px;" onchange="updateCampaignTicketProp('${t.id}', 'nodeId', this.value)">
              <option value="">(None / Unassigned)</option>
              ${Object.keys(Workstation.activeTopology.nodes || {}).sort((a,b) => {
                const na = Number(a), nb = Number(b);
                if (!isNaN(na) && !isNaN(nb)) return na - nb;
                return String(a).localeCompare(String(b));
              }).map(nid => {
                const nodeLabel = (typeof formatNodeRef === 'function')
                  ? formatNodeRef(nid, Workstation.activeTopology)
                  : `${nid}: ${(Workstation.activeTopology.nodes[nid] && (Workstation.activeTopology.nodes[nid].name || Workstation.activeTopology.nodes[nid].displayName || Workstation.activeTopology.nodes[nid].label)) || ''}`;
                return `<option value="${nid}" ${String(t.nodeId) === String(nid) ? 'selected' : ''}>${escapeHtml(nodeLabel)}</option>`;
              }).join('')}
            </select>
          </label>
          ${t.nodeId ? `<button class="win-btn" style="font-size:10px;" onclick="if(typeof centerOnNode==='function') centerOnNode('${escapeJsArg(t.nodeId)}')">Center on Node</button>` : ''}
        </div>
        ` : ''}

        <!-- 1. Central Dramatic Syllogism -->
        <div style="margin-bottom:8px;">
          <div style="font-size:11px; font-weight:bold; color:#000080; border-bottom:1px solid #ccc; padding-bottom:2px;">1. Egri Central Dramatic Syllogism</div>
          <div style="background:#fff; border:1px solid #ccc; padding:6px; font-style:italic; font-size:11px; margin-top:3px; color:#1e293b;">
            ${escapeHtml(t.syllogism || t.summary || 'No dramatic syllogism recorded.')}
          </div>
        </div>

        <!-- 2. Four-Corner Opposition -->
        <div style="margin-bottom:8px;">
          <div style="font-size:11px; font-weight:bold; color:#000080; border-bottom:1px solid #ccc; padding-bottom:2px;">2. Four-Corner Opposition (Truby)</div>
          ${fourCornersHtml}
        </div>

        <!-- 3. Injected Mechanics (Clocks & Dials) -->
        <div style="margin-bottom:8px;">
          <div style="font-size:11px; font-weight:bold; color:#000080; border-bottom:1px solid #ccc; padding-bottom:2px;">3. Injected Mechanics (Clocks &amp; Severity Dials)</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:3px;">
            <div style="background:#fff; border:1px solid #ccc; padding:4px;">
              <strong style="font-size:10px; color:#555;">Severity Dials:</strong>
              <ul style="margin:2px 0 0 14px; padding:0;">${dialsHtml}</ul>
            </div>
            <div style="background:#fff; border:1px solid #ccc; padding:4px;">
              <strong style="font-size:10px; color:#555;">Threat Clocks:</strong>
              <ul style="margin:2px 0 0 14px; padding:0;">${clocksHtml}</ul>
            </div>
          </div>
        </div>

        <!-- 4. Logistics & Supply Flows -->
        <div style="margin-bottom:8px;">
          <div style="font-size:11px; font-weight:bold; color:#000080; border-bottom:1px solid #ccc; padding-bottom:2px;">4. Supply &amp; Resource Contracts</div>
          <div style="font-size:11px; margin-top:3px;">
            <strong>Provides:</strong> <code style="background:#e0f2fe; padding:1px 4px; border-radius:2px;">${escapeHtml(provides || t.resources || 'None')}</code><br>
            <strong>Requires:</strong> <code style="background:#fef2f2; padding:1px 4px; border-radius:2px;">${escapeHtml(requires)}</code>
          </div>
        </div>

        <!-- 5. Brief / Acceptance Notes -->
        <div>
          <div style="font-size:11px; font-weight:bold; color:#000080; border-bottom:1px solid #ccc; padding-bottom:2px;">5. Authoring Brief &amp; Execution Notes</div>
          <div style="font-size:11px; background:#fafafa; border:1px solid #ccc; padding:6px; margin-top:3px; white-space:pre-wrap; color:#333;">
            ${escapeHtml(t.agent_brief || t.notes || t.summary || 'None recorded.')}
          </div>
          ${t.ticket_file ? `<div style="font-size:10px; color:#666; margin-top:4px;">Source File: <code>${escapeHtml(t.ticket_file)}</code></div>` : ''}
        </div>
      `;
    }

    function clearTicketInspector() {
      const detailPane = document.getElementById('tc-detail-pane');
      if (detailPane) {
        detailPane.innerHTML = `<div style="font-size:11px; color:#666; text-align:center; margin-top:50px;">No ticket selected.</div>`;
      }
    }

    function markTicketDone(ticketId, source) {
      if (source === 'campaign') {
        updateCampaignTicketProp(ticketId, 'status', 'done');
      } else {
        if (!Workstation.activeTopology) return;
        if (!Workstation.activeTopology.ticketOverrides) {
          Workstation.activeTopology.ticketOverrides = {};
        }
        Workstation.activeTopology.ticketOverrides[ticketId] = { status: 'done' };
        saveActiveCampaign();
        renderTicketList();
        selectTicket(ticketId, 'repo');
        setStatusBarMessage(`Marked ticket ${ticketId} as Done.`);
      }
    }
    window.markTicketDone = markTicketDone;

    function markTicketUndone(ticketId, source) {
      if (source === 'campaign') {
        updateCampaignTicketProp(ticketId, 'status', 'ready_for_authoring');
      } else {
        if (!Workstation.activeTopology) return;
        if (Workstation.activeTopology.ticketOverrides && Workstation.activeTopology.ticketOverrides[ticketId]) {
          delete Workstation.activeTopology.ticketOverrides[ticketId];
          saveActiveCampaign();
          renderTicketList();
          selectTicket(ticketId, 'repo');
          setStatusBarMessage(`Reopened ticket ${ticketId}.`);
        }
      }
    }
    window.markTicketUndone = markTicketUndone;

    function getKnownTicketCategories() {
      const defaults = [
        "Tier 1: Macro Governance",
        "Tier 2: Settlement & Biome",
        "Tier 3: Apex Hazard Engine",
        "Tier 4: Resource Supply Flow",
        "Tier 5: Climax & Eschatology",
        "Creative Module",
        "Dungeon Room",
        "NPC Dialogue",
        "Dynamic Threat",
        "Faction Crisis",
        "Mechanic Bug",
        "Platform Architecture",
        "UI / UX Bug",
        "CAD Engine",
        "Data Model"
      ];
      const set = new Set(defaults);

      if (Workstation.activeTopology && Array.isArray(Workstation.activeTopology.tickets)) {
        Workstation.activeTopology.tickets.forEach(t => {
          if (t.category && typeof t.category === 'string' && t.category.trim()) {
            set.add(t.category.trim());
          }
        });
      }

      if (typeof MASTER_TICKETS_DATA !== 'undefined' && Array.isArray(MASTER_TICKETS_DATA)) {
        MASTER_TICKETS_DATA.forEach(t => {
          if (t.category && typeof t.category === 'string' && t.category.trim()) {
            set.add(t.category.trim());
          }
        });
      }

      return Array.from(set);
    }
    window.getKnownTicketCategories = getKnownTicketCategories;

    function populateTicketCategoryDatalist() {
      const dl = document.getElementById('tc-category-datalist');
      if (!dl) return;
      dl.innerHTML = '';
      const cats = getKnownTicketCategories();
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        dl.appendChild(opt);
      });
    }
    window.populateTicketCategoryDatalist = populateTicketCategoryDatalist;

    function onTicketTypeChanged(type) {
      const gmFields = document.getElementById('ntc-gm-fields');
      const devFields = document.getElementById('ntc-dev-fields');
      const titleInput = document.getElementById('ntc-title');
      const catInput = document.getElementById('ntc-category');
      const notesLabel = document.getElementById('ntc-notes-label');
      const modalTitle = document.getElementById('ntc-modal-title');

      if (type === 'dev') {
        if (modalTitle) modalTitle.textContent = 'Create New Development Ticket';
        if (gmFields) gmFields.classList.add('hidden');
        if (devFields) devFields.classList.remove('hidden');
        if (titleInput) titleInput.placeholder = 'e.g. Implement resizable dock panels or fix SVG click hitbox';
        if (catInput && (!catInput.value || catInput.value.startsWith('Tier '))) {
          catInput.value = 'Platform Architecture';
        }
        if (notesLabel) notesLabel.textContent = 'Development Brief & Acceptance Criteria:';
      } else {
        if (modalTitle) modalTitle.textContent = 'Create New Campaign Ticket';
        if (gmFields) gmFields.classList.remove('hidden');
        if (devFields) devFields.classList.add('hidden');
        if (titleInput) titleInput.placeholder = 'e.g. The Sunken Saltworks & Alchemical Revolt';
        if (catInput && (!catInput.value || catInput.value === 'Platform Architecture')) {
          catInput.value = 'Tier 2: Settlement & Biome';
        }
        if (notesLabel) notesLabel.textContent = 'Authoring Brief & Acceptance Notes:';
      }
    }
    window.onTicketTypeChanged = onTicketTypeChanged;

    function onEditTicketTypeChanged(type) {
      const gmFields = document.getElementById('etc-gm-fields');
      const devFields = document.getElementById('etc-dev-fields');
      if (type === 'dev') {
        if (gmFields) gmFields.classList.add('hidden');
        if (devFields) devFields.classList.remove('hidden');
      } else {
        if (gmFields) gmFields.classList.remove('hidden');
        if (devFields) devFields.classList.add('hidden');
      }
    }
    window.onEditTicketTypeChanged = onEditTicketTypeChanged;

    function populateTicketNodeSelect(nodeSelect) {
      if (!nodeSelect) return;
      nodeSelect.innerHTML = '';
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = '(None / Unassigned)';
      nodeSelect.appendChild(defaultOpt);
      const topo = Workstation.activeTopology || {};
      const allMaps = (typeof maps !== 'undefined' && maps) ? maps : {};
      if (Object.keys(allMaps).length > 1) {
        Object.keys(allMaps).forEach(mId => {
          const m = allMaps[mId];
          const isCur = (mId === (typeof activeMapId !== 'undefined' ? activeMapId : 'map_root'));
          const mapNodes = isCur ? (topo.nodes ? Object.values(topo.nodes) : (m.nodes || [])) : (Array.isArray(m.nodes) ? m.nodes : Object.values(m.nodes || {}));
          if (mapNodes.length > 0) {
            const grp = document.createElement('optgroup');
            grp.label = `${m.name || mId} [${(m.scaleTier || 'region').toUpperCase()}]`;
            mapNodes.forEach(n => {
              const opt = document.createElement('option');
              opt.value = String(n.id);
              opt.textContent = `Node ${n.id}: ${n.name || n.label || ''}`;
              grp.appendChild(opt);
            });
            nodeSelect.appendChild(grp);
          }
        });
      } else if (topo.nodes) {
        Object.keys(topo.nodes).sort((a, b) => {
          const na = Number(a), nb = Number(b);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return String(a).localeCompare(String(b));
        }).forEach(nid => {
          const opt = document.createElement('option');
          opt.value = nid;
          opt.textContent = (typeof formatNodeRef === 'function')
            ? formatNodeRef(nid, topo)
            : `${nid}: ${(topo.nodes[nid] && (topo.nodes[nid].name || topo.nodes[nid].label)) || ''}`;
          nodeSelect.appendChild(opt);
        });
      }
    }

    function onTicketTargetTypeChanged(targetType, prefix = 'new') {
      const idSelect = document.getElementById(prefix === 'edit' ? 'etc-target-id' : 'ntc-target-id');
      if (!idSelect) return;
      idSelect.innerHTML = '<option value="">(None / General)</option>';

      const topo = Workstation.activeTopology || {};
      let list = [];
      if (targetType === 'npc') {
        list = (topo.npcs || []).map(n => ({ id: n.id, label: `${n.name} [${n.role || 'NPC'}]`, nodeId: n.nodeId }));
      } else if (targetType === 'quest') {
        list = (topo.quests || []).map(q => ({ id: q.id, label: `${q.title || q.name} [Quest]`, nodeId: q.nodeId }));
      } else if (targetType === 'item') {
        list = (topo.items || []).map(i => ({ id: i.id, label: `${i.name} [${i.category || 'Item'}]`, nodeId: i.nodeId }));
      } else if (targetType === 'tracker') {
        list = (topo.trackers || []).map(t => ({ id: t.id, label: `${t.name || t.title} [Clock]`, nodeId: t.nodeId }));
      } else if (targetType === 'faction') {
        list = (topo.factions || []).map(f => ({ id: f.id, label: `${f.name} [Faction]`, nodeId: f.headquartersNodeId }));
      } else if (targetType === 'node') {
        if (typeof getNodesForMapScope === 'function') {
          const allNodes = getNodesForMapScope('map:all');
          list = allNodes.map(n => ({ id: String(n.id), label: `Node ${n.id}: ${n.name || 'Node'}${n._mapName ? ' (' + n._mapName + ')' : ''}`, nodeId: n.id }));
        } else {
          const nodes = topo.nodes || {};
          list = Object.keys(nodes).map(k => ({ id: k, label: `${k}: ${nodes[k].name || 'Node'}`, nodeId: k }));
        }
      } else if (targetType === 'edge') {
        if (typeof getEdgesForMapScope === 'function') {
          const allEdges = getEdgesForMapScope('map:all');
          list = allEdges.map(e => ({
            id: e.edgeKey || e.id,
            label: `${e.edgeKey}: ${e.name || 'Corridor'} (#${e.uId} -> #${e.vId})`,
            nodeId: e.uId
          }));
        } else {
          const edges = topo.links || topo.edges || [];
          list = edges.map(e => {
            const u = e.from != null ? e.from : e.source;
            const v = e.to != null ? e.to : e.target;
            const key = e.id || `${u}-${v}`;
            return { id: key, label: `Corridor ${u} -> ${v}`, nodeId: u };
          });
        }
      }

      list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.label;
        if (item.nodeId != null) opt.setAttribute('data-node-id', String(item.nodeId));
        idSelect.appendChild(opt);
      });
    }
    window.onTicketTargetTypeChanged = onTicketTargetTypeChanged;

    function onTicketTargetEntityChanged(targetId, prefix = 'new') {
      if (!targetId) return;
      const idSelect = document.getElementById(prefix === 'edit' ? 'etc-target-id' : 'ntc-target-id');
      const nodeSelect = document.getElementById(prefix === 'edit' ? 'etc-node' : 'ntc-node');
      if (idSelect && nodeSelect) {
        const selectedOpt = idSelect.options[idSelect.selectedIndex];
        if (selectedOpt && selectedOpt.hasAttribute('data-node-id')) {
          const nId = selectedOpt.getAttribute('data-node-id');
          if (nId) nodeSelect.value = nId;
        }
      }
    }
    window.onTicketTargetEntityChanged = onTicketTargetEntityChanged;

    function openNewCampaignTicketModal(initialTargetType = 'campaign', initialTargetId = '', initialNodeId = null) {
      const nodeSelect = document.getElementById('ntc-node');
      populateTicketNodeSelect(nodeSelect);

      populateTicketCategoryDatalist();

      // Reset fields
      const typeSelect = document.getElementById('ntc-type');
      if (typeSelect) {
        typeSelect.value = 'gm';
        onTicketTypeChanged('gm');
      }
      if (document.getElementById('ntc-title')) document.getElementById('ntc-title').value = '';
      if (document.getElementById('ntc-category')) document.getElementById('ntc-category').value = 'Tier 2: Settlement & Biome';
      if (document.getElementById('ntc-priority')) document.getElementById('ntc-priority').value = 'Medium';
      if (document.getElementById('ntc-syllogism')) document.getElementById('ntc-syllogism').value = '';
      if (document.getElementById('ntc-four-corners')) document.getElementById('ntc-four-corners').value = '';
      if (document.getElementById('ntc-mechanics')) document.getElementById('ntc-mechanics').value = '';
      if (document.getElementById('ntc-resources')) document.getElementById('ntc-resources').value = '';
      if (document.getElementById('ntc-target-surface')) document.getElementById('ntc-target-surface').value = 'start.html';
      if (document.getElementById('ntc-prereqs')) document.getElementById('ntc-prereqs').value = '';
      if (document.getElementById('ntc-notes')) document.getElementById('ntc-notes').value = '';

      // Set target entity binding
      const targetTypeSelect = document.getElementById('ntc-target-type');
      if (targetTypeSelect) {
        targetTypeSelect.value = initialTargetType || 'campaign';
        onTicketTargetTypeChanged(targetTypeSelect.value, 'new');
      }
      const targetIdSelect = document.getElementById('ntc-target-id');
      if (targetIdSelect && initialTargetId) {
        targetIdSelect.value = String(initialTargetId);
      }
      if (initialNodeId != null && nodeSelect) {
        nodeSelect.value = String(initialNodeId);
      }

      openModal('modal-ticket-author-new');
    }

    function saveNewCampaignTicket() {
      const title = document.getElementById('ntc-title') ? document.getElementById('ntc-title').value.trim() : '';
      if (!title) {
        alert('Please enter a ticket title.');
        return;
      }

      const type = document.getElementById('ntc-type') ? document.getElementById('ntc-type').value : 'gm';
      const category = document.getElementById('ntc-category') ? (document.getElementById('ntc-category').value.trim() || 'General') : 'General';
      const priority = document.getElementById('ntc-priority') ? document.getElementById('ntc-priority').value : 'Medium';
      const nodeId = document.getElementById('ntc-node') ? document.getElementById('ntc-node').value : '';
      
      let tier = 2;
      const tierMatch = category.match(/Tier\s*(\d)/i);
      if (tierMatch) {
        tier = parseInt(tierMatch[1], 10);
      } else if (type === 'dev') {
        tier = 0;
      }

      const syllogism = document.getElementById('ntc-syllogism') ? document.getElementById('ntc-syllogism').value.trim() : '';
      const fourCorners = document.getElementById('ntc-four-corners') ? document.getElementById('ntc-four-corners').value.trim() : '';
      const mechanics = document.getElementById('ntc-mechanics') ? document.getElementById('ntc-mechanics').value.trim() : '';
      const resources = document.getElementById('ntc-resources') ? document.getElementById('ntc-resources').value.trim() : '';
      const targetSurface = document.getElementById('ntc-target-surface') ? document.getElementById('ntc-target-surface').value.trim() : 'start.html';
      const prereqs = document.getElementById('ntc-prereqs') ? document.getElementById('ntc-prereqs').value.trim() : '';
      const notes = document.getElementById('ntc-notes') ? document.getElementById('ntc-notes').value.trim() : '';
      const targetType = document.getElementById('ntc-target-type') ? document.getElementById('ntc-target-type').value : '';
      const targetId = document.getElementById('ntc-target-id') ? document.getElementById('ntc-target-id').value : '';

      if (!Workstation.activeTopology.tickets) {
        Workstation.activeTopology.tickets = [];
      }

      const ticketNum = String(Workstation.activeTopology.tickets.length + 1).padStart(2, '0');
      const idPrefix = (type === 'dev') ? 'DEV-' : 'CAMP-';
      const trackName = (type === 'dev') ? 'Platform Development' : 'Campaign Authoring';

      const newTicket = {
        id: `${idPrefix}${ticketNum}`,
        title: title,
        type: type,
        category: category,
        track: trackName,
        tier: tier,
        pipeline_tier: tier,
        priority: priority,
        status: 'ready_for_authoring',
        nodeId: nodeId,
        syllogism: syllogism,
        fourCorners: fourCorners,
        mechanics: mechanics,
        resources: resources,
        targetSurface: targetSurface,
        prereqs: prereqs,
        notes: notes,
        targetType: targetType,
        targetId: targetId,
        createdAt: new Date().toISOString()
      };

      Workstation.activeTopology.tickets.push(newTicket);
      saveActiveCampaign();
      closeModal('modal-ticket-author-new');
      setStatusBarMessage(`Created ${type === 'dev' ? 'Development' : 'Campaign Author'} Ticket: ${newTicket.id} - "${newTicket.title}"`);

      // Switch to campaign tab and select
      switchTicketCenterTab('campaign');
      renderTicketList();
      selectTicket(newTicket.id, 'campaign');
    }

    function openEditTicketModal(ticketId) {
      if (!Workstation.activeTopology) return;
      const { repoTickets, campTickets } = getCombinedTickets();
      let t = campTickets.find(item => item.id === ticketId) || repoTickets.find(item => item.id === ticketId);
      if (!t) return;

      populateTicketCategoryDatalist();

      // Populate nodes select
      const nodeSelect = document.getElementById('etc-node');
      populateTicketNodeSelect(nodeSelect);
      if (nodeSelect) {
        nodeSelect.value = t.nodeId != null ? String(t.nodeId) : '';
      }

      const isDev = (t.type === 'dev' || (t.id && t.id.startsWith('DEV-')) || t.track === 'Platform Development');
      const ticketType = isDev ? 'dev' : 'gm';

      document.getElementById('etc-id').value = t.id;
      document.getElementById('etc-title').value = t.title || '';
      if (document.getElementById('etc-type')) {
        document.getElementById('etc-type').value = ticketType;
        onEditTicketTypeChanged(ticketType);
      }
      document.getElementById('etc-status').value = t.status || 'ready_for_authoring';
      document.getElementById('etc-priority').value = t.priority || 'Medium';
      document.getElementById('etc-category').value = t.category || t.track || '';
      document.getElementById('etc-notes').value = t.notes || t.agent_brief || t.summary || '';

      if (document.getElementById('etc-syllogism')) document.getElementById('etc-syllogism').value = t.syllogism || '';
      if (document.getElementById('etc-four-corners')) {
        if (typeof t.four_corners === 'object' && t.four_corners !== null) {
          document.getElementById('etc-four-corners').value = `Establishment: ${t.four_corners.establishment || ''}\nOpponent: ${t.four_corners.opponent || ''}\nShadow: ${t.four_corners.shadow || ''}\nOutcast: ${t.four_corners.outcast || ''}`;
        } else {
          document.getElementById('etc-four-corners').value = t.fourCorners || '';
        }
      }
      if (document.getElementById('etc-mechanics')) document.getElementById('etc-mechanics').value = t.mechanics || '';
      if (document.getElementById('etc-resources')) document.getElementById('etc-resources').value = t.resources || '';
      if (document.getElementById('etc-target-surface')) document.getElementById('etc-target-surface').value = t.targetSurface || t.target_surface || 'start.html';
      if (document.getElementById('etc-prereqs')) document.getElementById('etc-prereqs').value = t.prereqs || '';

      const targetTypeSelect = document.getElementById('etc-target-type');
      if (targetTypeSelect) {
        targetTypeSelect.value = t.targetType || (t.nodeId ? 'node' : 'campaign');
        onTicketTargetTypeChanged(targetTypeSelect.value, 'edit');
        const targetIdSelect = document.getElementById('etc-target-id');
        if (targetIdSelect && (t.targetId || t.nodeId)) {
          targetIdSelect.value = String(t.targetId || t.nodeId);
        }
      }

      openModal('modal-ticket-edit');
    }
    window.openEditTicketModal = openEditTicketModal;

    function saveEditedCampaignTicket() {
      const id = document.getElementById('etc-id').value;
      if (!Workstation.activeTopology) return;
      if (!Workstation.activeTopology.tickets) Workstation.activeTopology.tickets = [];

      const title = document.getElementById('etc-title').value.trim();
      if (!title) {
        alert('Please enter a ticket title.');
        return;
      }

      const updatedFields = {
        title: title,
        type: document.getElementById('etc-type') ? document.getElementById('etc-type').value : 'gm',
        status: document.getElementById('etc-status').value,
        priority: document.getElementById('etc-priority').value,
        category: document.getElementById('etc-category').value.trim(),
        nodeId: document.getElementById('etc-node').value,
        targetType: document.getElementById('etc-target-type').value,
        targetId: document.getElementById('etc-target-id').value,
        syllogism: document.getElementById('etc-syllogism') ? document.getElementById('etc-syllogism').value.trim() : '',
        fourCorners: document.getElementById('etc-four-corners') ? document.getElementById('etc-four-corners').value.trim() : '',
        mechanics: document.getElementById('etc-mechanics') ? document.getElementById('etc-mechanics').value.trim() : '',
        resources: document.getElementById('etc-resources') ? document.getElementById('etc-resources').value.trim() : '',
        targetSurface: document.getElementById('etc-target-surface') ? document.getElementById('etc-target-surface').value.trim() : 'start.html',
        prereqs: document.getElementById('etc-prereqs') ? document.getElementById('etc-prereqs').value.trim() : '',
        notes: document.getElementById('etc-notes').value,
        updatedAt: new Date().toISOString()
      };

      const campTicket = Workstation.activeTopology.tickets.find(item => item.id === id);
      let sourceTab = 'campaign';
      if (campTicket) {
        Object.assign(campTicket, updatedFields);
      } else {
        // Repo Master Backlog ticket override
        sourceTab = 'repo';
        if (!Workstation.activeTopology.ticketOverrides) Workstation.activeTopology.ticketOverrides = {};
        Workstation.activeTopology.ticketOverrides[id] = Object.assign({}, Workstation.activeTopology.ticketOverrides[id] || {}, updatedFields);
      }

      saveActiveCampaign();
      closeModal('modal-ticket-edit');
      setStatusBarMessage(`Updated ticket ${id}: "${title}".`);
      renderTicketList();
      selectTicket(id, sourceTab);
      if (typeof refreshEntityManager === 'function') {
        refreshEntityManager({ preserveDetail: true });
      } else {
        if (typeof renderEntityManagerList === 'function') renderEntityManagerList();
        if (typeof SelectedEntityId !== 'undefined' && SelectedEntityId && typeof selectEntityItem === 'function') {
          selectEntityItem(SelectedEntityId, false);
        }
      }
    }
    window.saveEditedCampaignTicket = saveEditedCampaignTicket;

    function promptDeleteCampaignTicket(ticketId) {
      if (!ticketId) return;
      if (confirm(`Are you sure you want to delete campaign ticket ${ticketId}?`)) {
        deleteCampaignTicket(ticketId);
        closeModal('modal-ticket-edit');
      }
    }
    window.promptDeleteCampaignTicket = promptDeleteCampaignTicket;

    function updateCampaignTicketProp(ticketId, prop, value) {
      if (!Workstation.activeTopology || !Workstation.activeTopology.tickets) return;
      const t = Workstation.activeTopology.tickets.find(item => item.id === ticketId);
      if (t) {
        t[prop] = value;
        saveActiveCampaign();
        renderTicketList();
        selectTicket(ticketId, 'campaign');
        setStatusBarMessage(`Updated ${prop} for Ticket ${ticketId}.`);
      }
    }

    function deleteCampaignTicket(ticketId) {
      if (!confirm(`Are you sure you want to delete campaign ticket ${ticketId}?`)) return;
      if (!Workstation.activeTopology || !Workstation.activeTopology.tickets) return;
      Workstation.activeTopology.tickets = Workstation.activeTopology.tickets.filter(t => t.id !== ticketId);
      saveActiveCampaign();
      selectedTicketId = null;
      renderTicketList();
      setStatusBarMessage(`Deleted campaign ticket ${ticketId}.`);
    }

    function exportSelectedTicketMarkdown() {
      const { repoTickets, campTickets } = getCombinedTickets();
      const list = selectedTicketSource === 'repo' ? repoTickets : campTickets;
      const t = list.find(item => item.id === selectedTicketId) || list[0];
      if (!t) {
        alert('Please select a ticket to export.');
        return;
      }

      const tierNum = t.pipeline_tier !== undefined ? t.pipeline_tier : (t.tier !== undefined ? t.tier : 2);
      const category = t.category || t.track || 'Creative Module';
      const status = t.status || 'ready_for_authoring';
      const priority = t.priority || 'Medium';
      const nodeId = t.nodeId || t.node || 'None';
      const syllogism = t.syllogism || t.summary || 'Central dramatic argument goes here.';

      let fcText = '';
      if (typeof t.four_corners === 'object' && t.four_corners !== null) {
        fcText = `- Establishment: ${t.four_corners.establishment || 'TBD'}\n- Opponent: ${t.four_corners.opponent || 'TBD'}\n- Shadow: ${t.four_corners.shadow || 'TBD'}\n- Outcast: ${t.four_corners.outcast || 'TBD'}`;
      } else if (t.fourCorners) {
        fcText = t.fourCorners;
      } else {
        fcText = '- Establishment: TBD\n- Opponent: TBD\n- Shadow: TBD\n- Outcast: TBD';
      }

      let mechText = '';
      if (t.dials && t.dials.length) {
        mechText += `### Severity Dials (Levels 1 to 4)\n` + t.dials.map(d => `- ${d}`).join('\n') + '\n\n';
      }
      if (t.threat_clocks && t.threat_clocks.length) {
        mechText += `### Active Threat Clocks\n` + t.threat_clocks.map(c => `- ${c}`).join('\n') + '\n';
      }
      if (!mechText && t.mechanics) {
        mechText = t.mechanics;
      }
      if (!mechText) {
        mechText = `- Threat Clock: [4 Ticks] - Standard Escalation\n- Severity Dial: Level 2 - Moderate Pressure`;
      }

      const provides = (t.provides || []).join(', ') || t.resources || 'None';
      const requires = (t.requires || []).join(', ') || 'None';

      const isDev = (t.type === 'dev' || (t.id && t.id.startsWith('DEV-')) || t.track === 'Platform Development');
      let markdown = '';

      if (isDev) {
        markdown = `---
id: ${t.id}
title: "${t.title}"
pipeline_tier: 0
target_surface: "${t.targetSurface || t.target_surface || 'start.html'}"
status: "${status}"
category: "${category}"
track: "Platform Development"
priority: "${priority}"
stationed_node: "${nodeId}"
created_at: "${t.createdAt || new Date().toISOString()}"
---

# ${t.id}: ${t.title}
*Category: ${category} | Priority: ${priority} | Target Surface: ${t.targetSurface || t.target_surface || 'start.html'}*

## 1. Overview & Objective
${t.notes || t.agent_brief || t.summary || 'Engineering brief pending.'}

## 2. Implementation Deliverables & Seams
- **Target Surface**: \`${t.targetSurface || t.target_surface || 'start.html'}\`
- **Spatial Anchor Node**: \`${nodeId}\`
- **Prerequisites / Seams**: \`${t.prereqs || 'None'}\`

## 3. Acceptance Criteria & Definition of Done
- [ ] Implement and test changes test-first.
- [ ] Run full test suite verification (\`Test-Suite.ps1\`).
- [ ] Zero-CORS offline execution verified.
`;
      } else {
        markdown = `---
id: ${t.id}
title: "${t.title}"
track: "${category}"
pipeline_tier: ${tierNum}
status: "${status}"
priority: "${priority}"
stationed_node: "${nodeId}"
created_at: "${t.createdAt || new Date().toISOString()}"
---

# ${t.id}: ${t.title}

## 1. Premise & Dramatic Argument
**Central Dramatic Syllogism (Lajos Egri):**
> ${syllogism}

## 2. Four-Corner Opposition (John Truby)
${fcText}

## 3. Injected Mechanics (Threat Clocks & Severity Dials)
${mechText}

## 4. Supply & Resource Flow Contracts
- **Spatial Anchor Node**: \`${nodeId}\`
- **Provides**: \`${provides}\`
- **Requires**: \`${requires}\`

## 5. Scene Calculus & Tactical Beats
${t.agent_brief || t.notes || t.summary || 'Authoring brief pending.'}

## 6. Definition of Done
- [ ] Four-corner opposition validated against setting sociology.
- [ ] Threat clocks and severity dials integrated with spatial node.
- [ ] Zero-CORS offline execution verified.
`;
      }

      const expText = document.getElementById('exp-markdown-text');
      const expTitle = document.getElementById('exp-modal-title');
      const expStatus = document.getElementById('exp-copy-status');
      if (expText) expText.value = markdown;
      if (expTitle) expTitle.textContent = `Export: ${t.id} - ${t.title}`;
      if (expStatus) expStatus.textContent = '';

      openModal('modal-ticket-export');
    }

    function copyExportedMarkdown() {
      const expText = document.getElementById('exp-markdown-text');
      const expStatus = document.getElementById('exp-copy-status');
      if (!expText) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(expText.value).then(() => {
          if (expStatus) expStatus.textContent = 'Copied to clipboard!';
        }).catch(() => {
          expText.select();
          document.execCommand('copy');
          if (expStatus) expStatus.textContent = 'Copied to clipboard!';
        });
      } else {
        expText.select();
        document.execCommand('copy');
        if (expStatus) expStatus.textContent = 'Copied to clipboard!';
      }
    }

    function downloadExportedMarkdown() {
      const expText = document.getElementById('exp-markdown-text');
      if (!expText || !expText.value) return;
      const filename = `${selectedTicketId || 'ticket'}.md`;
      const blob = new Blob([expText.value], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusBarMessage(`Downloaded ${filename}.`);
    }

    // Zero-CORS Lightweight Markdown Renderer for Module Notes
    function renderMarkdownText(md) {
      if (!md) return '<p><em>No markdown content available.</em></p>';

      // Strip YAML frontmatter
      let content = md.replace(/^---[\s\S]*?---\r?\n/, '');

      // Escape basic HTML
      let html = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Code blocks ``` ... ```
      html = html.replace(/```([a-z0-9_-]*)\r?\n([\s\S]*?)```/gi, (match, lang, code) => {
        return `<pre style="background:#222; color:#eee; padding:8px; border-radius:3px; font-size:11px; overflow-x:auto;"><code>${code}</code></pre>`;
      });

      // Headers #, ##, ###
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Bold and Italic
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Inline code
      html = html.replace(/`([^`]+)`/g, '<code style="background:#e8e8e8; padding:1px 4px; font-family:monospace; font-size:11px;">$1</code>');

      // Lists
      html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');

      // Blockquotes
      html = html.replace(/^>\s+(.*)$/gim, '<blockquote style="border-left:3px solid #000080; margin:4px 0; padding-left:8px; color:#444;">$1</blockquote>');

      // Horizontal lines
      html = html.replace(/^---$/gim, '<hr style="border:none; border-top:1px solid #ccc; margin:8px 0;">');

      // Double newlines to paragraphs
      const blocks = html.split(/\n{2,}/);
      return blocks.map(b => {
        const trimmed = b.trim();
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr')) {
          return trimmed;
        }
        return `<p style="margin-bottom:6px;">${trimmed.replace(/\n/g, '<br>')}</p>`;
      }).join('\n');
    }