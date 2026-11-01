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
      const repoTickets = (typeof MASTER_TICKETS_DATA !== 'undefined' ? MASTER_TICKETS_DATA : []);
      const campTickets = (Workstation.activeTopology && Workstation.activeTopology.tickets) ? Workstation.activeTopology.tickets : [];
      return { repoTickets, campTickets };
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
        if (statusFilter !== 'all') {
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
        tr.innerHTML = `<td colspan="4" style="text-align:center; color:#777; padding:18px;">No tickets match current filters.</td>`;
        tbody.appendChild(tr);
        clearTicketInspector();
      } else {
        filtered.forEach(t => {
          const tr = document.createElement('tr');
          const isSelected = selectedTicketId === t.id && selectedTicketSource === activeTicketTab;
          if (isSelected) tr.classList.add('selected');

          const tierNum = t.pipeline_tier !== undefined ? t.pipeline_tier : (t.tier !== undefined ? t.tier : '-');
          const statusSlug = (t.status || 'draft').toLowerCase().replace(/\s+/g, '_');
          const statusLabel = (t.status || 'Draft').replace(/_/g, ' ').toUpperCase();

          tr.innerHTML = `
            <td><strong>${t.id || 'TK'}</strong></td>
            <td>T${tierNum}</td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:260px;" title="${escapeHtml(t.title || '')}">${escapeHtml(t.title || '(Untitled)')}</td>
            <td><span class="ticket-badge-status status-${statusSlug}">${statusLabel}</span></td>
          `;
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

      // Build Inspector View
      detailPane.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #808080; padding-bottom:6px; margin-bottom:8px;">
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:13px; font-weight:bold; color:#000080;">${escapeHtml(t.id)}</span>
              <span class="ticket-badge-status status-${statusSlug}">${statusLabel}</span>
              <span style="font-size:10px; background:#e0e7ff; color:#3730a3; padding:1px 5px; border-radius:2px; font-weight:bold;">Tier ${tierNum}</span>
              <span style="font-size:10px; background:#fef3c7; color:#92400e; padding:1px 5px; border-radius:2px; font-weight:bold;">${escapeHtml(priority)}</span>
            </div>
            <div style="font-size:12px; font-weight:bold; color:#111; margin-top:3px;">${escapeHtml(t.title || '(Untitled)')}</div>
            <div style="font-size:10px; color:#555; margin-top:2px;">Track: ${escapeHtml(t.track || t.category || 'General')} | Category: ${escapeHtml(t.category || '-')}</div>
          </div>
          <div style="display:flex; gap:4px;">
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
              ${Object.keys(Workstation.activeTopology.nodes || {}).sort((a,b) => {
                const na = Number(a), nb = Number(b);
                if (!isNaN(na) && !isNaN(nb)) return na - nb;
                return String(a).localeCompare(String(b));
              }).map(nid => {
                const nodeObj = Workstation.activeTopology.nodes[nid];
                const nodeTitle = nodeObj ? (nodeObj.name || nodeObj.label || `#${nid}`) : `#${nid}`;
                return `<option value="${nid}" ${String(t.nodeId) === String(nid) ? 'selected' : ''}>${nid}: ${escapeHtml(nodeTitle)}</option>`;
              }).join('')}
            </select>
          </label>
          ${t.nodeId ? `<button class="win-btn" style="font-size:10px;" onclick="if(typeof centerCanvasOnNode==='function') centerCanvasOnNode('${t.nodeId}')">Center on Node</button>` : ''}
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

    function openNewCampaignTicketModal() {
      const nodeSelect = document.getElementById('ntc-node');
      if (nodeSelect) {
        nodeSelect.innerHTML = '<option value="">(None / Unassigned)</option>';
        if (Workstation.activeTopology && Workstation.activeTopology.nodes) {
          Object.keys(Workstation.activeTopology.nodes).sort().forEach(nid => {
            const opt = document.createElement('option');
            opt.value = nid;
            opt.textContent = `${nid}: ${(Workstation.activeTopology.nodes[nid] && Workstation.activeTopology.nodes[nid].label) || ''}`;
            nodeSelect.appendChild(opt);
          });
        }
      }

      // Reset fields
      if (document.getElementById('ntc-title')) document.getElementById('ntc-title').value = '';
      if (document.getElementById('ntc-syllogism')) document.getElementById('ntc-syllogism').value = '';
      if (document.getElementById('ntc-four-corners')) document.getElementById('ntc-four-corners').value = '';
      if (document.getElementById('ntc-mechanics')) document.getElementById('ntc-mechanics').value = '';
      if (document.getElementById('ntc-resources')) document.getElementById('ntc-resources').value = '';
      if (document.getElementById('ntc-notes')) document.getElementById('ntc-notes').value = '';

      openModal('modal-ticket-author-new');
    }

    function saveNewCampaignTicket() {
      const title = document.getElementById('ntc-title') ? document.getElementById('ntc-title').value.trim() : '';
      if (!title) {
        alert('Please enter a ticket title.');
        return;
      }

      const category = document.getElementById('ntc-category') ? document.getElementById('ntc-category').value : 'Creative Module';
      const tier = document.getElementById('ntc-tier') ? parseInt(document.getElementById('ntc-tier').value, 10) : 2;
      const priority = document.getElementById('ntc-priority') ? document.getElementById('ntc-priority').value : 'Medium';
      const nodeId = document.getElementById('ntc-node') ? document.getElementById('ntc-node').value : '';
      const syllogism = document.getElementById('ntc-syllogism') ? document.getElementById('ntc-syllogism').value.trim() : '';
      const fourCorners = document.getElementById('ntc-four-corners') ? document.getElementById('ntc-four-corners').value.trim() : '';
      const mechanics = document.getElementById('ntc-mechanics') ? document.getElementById('ntc-mechanics').value.trim() : '';
      const resources = document.getElementById('ntc-resources') ? document.getElementById('ntc-resources').value.trim() : '';
      const notes = document.getElementById('ntc-notes') ? document.getElementById('ntc-notes').value.trim() : '';

      if (!Workstation.activeTopology.tickets) {
        Workstation.activeTopology.tickets = [];
      }

      const ticketNum = String(Workstation.activeTopology.tickets.length + 1).padStart(2, '0');
      const newTicket = {
        id: `CAMP-${ticketNum}`,
        title: title,
        category: category,
        track: 'Campaign Authoring',
        tier: tier,
        priority: priority,
        status: 'ready_for_authoring',
        nodeId: nodeId,
        syllogism: syllogism,
        fourCorners: fourCorners,
        mechanics: mechanics,
        resources: resources,
        notes: notes,
        createdAt: new Date().toISOString()
      };

      Workstation.activeTopology.tickets.push(newTicket);
      saveActiveCampaign();
      closeModal('modal-ticket-author-new');
      setStatusBarMessage(`Created Campaign Author Ticket: ${newTicket.id} - "${newTicket.title}"`);

      // Switch to campaign tab and select
      switchTicketCenterTab('campaign');
      selectTicket(newTicket.id, 'campaign');
    }

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

      const markdown = `---
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