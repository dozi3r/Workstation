// ============================================================================
// [WORKSTATION SCRIPT: social_graph_renderer.js]
// Deterministic 2D SVG NPC Social Relational Graph & Sociological Web Explorer
// ADR 0021 Compliant - Zero Divide-by-Zero, Zero External Dependencies
// ============================================================================
(function () {
  'use strict';

  // Semantic Relationship Palette
  const REL_COLORS = {
    'Ally': '#16a34a',         // Emerald Green
    'Rival': '#dc2626',        // Crimson Red
    'Family': '#9333ea',       // Royal Purple
    'Superior': '#0284c7',     // Sky Blue
    'Subordinate': '#0891b2',  // Deep Cyan
    'Debtor': '#ea580c',       // Burnt Orange
    'Creditor': '#d97706',     // Amber
    'Informant': '#4f46e5',    // Indigo
    'Handler': '#2563eb'       // Cobalt Blue
  };

  const FACTION_QUADRANT_COLORS = {
    'Clan': '#10b981',       // Green
    'Adhocracy': '#f59e0b',  // Yellow / Amber
    'Market': '#ef4444',     // Red
    'Hierarchy': '#3b82f6',  // Blue
    'Universal': '#64748b'   // Gray
  };

  function stringHash(str) {
    if (!str) return 0;
    let hash = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // --- Core Deterministic 2D Layout & SVG Generator (Pure, Headless Safe) ---
  function generateSocialGraphSvg(topo, options = {}) {
    if (!topo || !Array.isArray(topo.npcs)) {
      return '<svg viewBox="-400 -300 800 600" xmlns="http://www.w3.org/2000/svg"><text x="0" y="0" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="12">No active campaign roster</text></svg>';
    }

    const npcs = topo.npcs;
    const factions = Array.isArray(topo.factions) ? topo.factions : [];
    const focusNpcId = options.focusNpcId ? String(options.focusNpcId) : null;
    const factionFilter = options.factionFilter ? String(options.factionFilter) : null;
    const minSentiment = typeof options.minSentiment === 'number' ? options.minSentiment : 0;
    const connectedOnly = options.connectedOnly !== false;

    // Build faction lookup map
    const factionMap = {};
    factions.forEach(f => {
      if (f && f.id) factionMap[String(f.id)] = f;
    });

    // Collect all valid relationships across active NPCs
    const rawEdges = [];
    npcs.forEach(n => {
      const sourceId = String(n.id);
      if (Array.isArray(n.relationships)) {
        n.relationships.forEach(r => {
          if (!r || !r.targetNpcId) return;
          const targetId = String(r.targetNpcId);
          // Check target exists in active roster
          const targetNpc = npcs.find(other => String(other.id) === targetId);
          if (!targetNpc) return;

          const relType = String(r.relationshipType || r.type || 'Ally').trim();
          const sentiment = typeof r.sentiment === 'number' ? r.sentiment : 0;

          if (Math.abs(sentiment) < minSentiment) return;

          // If faction filter active, ensure at least one endpoint belongs to filtered faction
          if (factionFilter) {
            const sFac = n.factionId ? String(n.factionId) : '';
            const tFac = targetNpc.factionId ? String(targetNpc.factionId) : '';
            if (sFac !== factionFilter && tFac !== factionFilter) return;
          }

          rawEdges.push({
            sourceId,
            targetId,
            sourceNpc: n,
            targetNpc,
            type: relType,
            sentiment,
            notes: r.notes || ''
          });
        });
      }
    });

    // Determine nodes to include
    let visibleNpcMap = new Map();
    if (focusNpcId) {
      const focusNpc = npcs.find(n => String(n.id) === focusNpcId);
      if (focusNpc) {
        visibleNpcMap.set(focusNpcId, { npc: focusNpc, degree: 0 });

        // 1st degree connections
        rawEdges.forEach(e => {
          if (e.sourceId === focusNpcId) {
            visibleNpcMap.set(e.targetId, { npc: e.targetNpc, degree: 1 });
          } else if (e.targetId === focusNpcId) {
            visibleNpcMap.set(e.sourceId, { npc: e.sourceNpc, degree: 1 });
          }
        });

        // 2nd degree connections
        rawEdges.forEach(e => {
          const sVisible = visibleNpcMap.get(e.sourceId);
          const tVisible = visibleNpcMap.get(e.targetId);
          if (sVisible && sVisible.degree === 1 && !visibleNpcMap.has(e.targetId)) {
            visibleNpcMap.set(e.targetId, { npc: e.targetNpc, degree: 2 });
          } else if (tVisible && tVisible.degree === 1 && !visibleNpcMap.has(e.sourceId)) {
            visibleNpcMap.set(e.sourceId, { npc: e.sourceNpc, degree: 2 });
          }
        });

        if (!connectedOnly) {
          npcs.forEach(n => {
            const id = String(n.id);
            if (!visibleNpcMap.has(id)) {
              visibleNpcMap.set(id, { npc: n, degree: 3 });
            }
          });
        }
      }
    } else {
      // Global Mode
      npcs.forEach(n => {
        const id = String(n.id);
        if (factionFilter && String(n.factionId || '') !== factionFilter) return;

        const hasEdge = rawEdges.some(e => e.sourceId === id || e.targetId === id);
        if (!connectedOnly || hasEdge) {
          visibleNpcMap.set(id, { npc: n, degree: 0 });
        }
      });
    }

    if (visibleNpcMap.size === 0) {
      return `
        <svg viewBox="-400 -300 800 600" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="-10" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="14" font-weight="bold">No characters match current filters</text>
          <text x="0" y="16" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Adjust min sentiment slider or uncheck "Connected Only"</text>
        </svg>
      `;
    }

    // Node Positions Layout Engine (Deterministic with Collocation & NaN Guard)
    const positions = {};

    if (focusNpcId && visibleNpcMap.has(focusNpcId)) {
      // Focus Mode Layout: Concentric Rings
      positions[focusNpcId] = { x: 0, y: 0 };

      const ring1 = [];
      const ring2 = [];
      const ring3 = [];

      visibleNpcMap.forEach((entry, id) => {
        if (id === focusNpcId) return;
        if (entry.degree === 1) ring1.push(id);
        else if (entry.degree === 2) ring2.push(id);
        else ring3.push(id);
      });

      // Layout Ring 1
      const n1 = ring1.length;
      ring1.forEach((id, i) => {
        const hash = stringHash(id);
        const jitterR = (hash % 16) - 8;
        const angle = (2 * Math.PI * i) / Math.max(1, n1);
        const r = 165 + jitterR;
        let x = r * Math.cos(angle);
        let y = r * Math.sin(angle);
        if (isNaN(x) || !isFinite(x)) x = 0;
        if (isNaN(y) || !isFinite(y)) y = 0;
        positions[id] = { x: Math.round(x), y: Math.round(y) };
      });

      // Layout Ring 2
      const n2 = ring2.length;
      ring2.forEach((id, i) => {
        const hash = stringHash(id);
        const jitterR = (hash % 20) - 10;
        const angle = (2 * Math.PI * i) / Math.max(1, n2) + 0.2;
        const r = 275 + jitterR;
        let x = r * Math.cos(angle);
        let y = r * Math.sin(angle);
        if (isNaN(x) || !isFinite(x)) x = 0;
        if (isNaN(y) || !isFinite(y)) y = 0;
        positions[id] = { x: Math.round(x), y: Math.round(y) };
      });

      // Layout Ring 3
      const n3 = ring3.length;
      ring3.forEach((id, i) => {
        const hash = stringHash(id);
        const angle = (2 * Math.PI * i) / Math.max(1, n3) + 0.4;
        const r = 360 + ((hash % 16) - 8);
        let x = r * Math.cos(angle);
        let y = r * Math.sin(angle);
        if (isNaN(x) || !isFinite(x)) x = 0;
        if (isNaN(y) || !isFinite(y)) y = 0;
        positions[id] = { x: Math.round(x), y: Math.round(y) };
      });
    } else {
      // Global Mode: Quadrant Clusters
      const quadrantCenters = {
        'Clan': { cx: -180, cy: -110 },
        'Adhocracy': { cx: 180, cy: -110 },
        'Market': { cx: 180, cy: 110 },
        'Hierarchy': { cx: -180, cy: 110 },
        'Unassigned': { cx: 0, cy: 0 }
      };

      const groups = { 'Clan': [], 'Adhocracy': [], 'Market': [], 'Hierarchy': [], 'Unassigned': [] };

      visibleNpcMap.forEach((entry, id) => {
        const npc = entry.npc;
        let quad = 'Unassigned';
        if (npc.factionId && factionMap[String(npc.factionId)]) {
          quad = factionMap[String(npc.factionId)].cvfQuadrant || 'Unassigned';
        } else if (npc.culture) {
          quad = npc.culture;
        }
        if (!groups[quad]) groups[quad] = [];
        groups[quad].push(id);
      });

      Object.keys(groups).forEach(quadKey => {
        const members = groups[quadKey];
        const center = quadrantCenters[quadKey] || { cx: 0, cy: 0 };
        const count = members.length;
        if (count === 0) return;

        members.forEach((id, i) => {
          const hash = stringHash(id);
          const orbitR = count === 1 ? 0 : Math.min(100, 32 + count * 8);
          const angle = count === 1 ? 0 : (2 * Math.PI * i) / count;
          const jitterR = (hash % 14) - 7;
          const r = orbitR + (count > 1 ? jitterR : 0);
          let x = center.cx + r * Math.cos(angle);
          let y = center.cy + r * Math.sin(angle);

          if (isNaN(x) || !isFinite(x)) x = center.cx;
          if (isNaN(y) || !isFinite(y)) y = center.cy;
          positions[id] = { x: Math.round(x), y: Math.round(y) };
        });
      });
    }

    // Filter edges to only those with both ends visible
    const visibleEdges = rawEdges.filter(e => positions[e.sourceId] && positions[e.targetId]);

    // Construct SVG
    let svg = '<svg viewBox="-450 -320 900 640" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">\n';

    // SVG Defs
    svg += '  <defs>\n';
    svg += '    <filter id="sg-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.2"/></filter>\n';
    Object.keys(REL_COLORS).forEach(rtype => {
      const col = REL_COLORS[rtype];
      const markerId = `sg-arrow-${rtype.toLowerCase()}`;
      svg += `    <marker id="${markerId}" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${col}"/></marker>\n`;
    });
    svg += '  </defs>\n';

    // Subtle background guidelines
    if (focusNpcId) {
      svg += '  <circle cx="0" cy="0" r="165" fill="none" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1"/>\n';
      svg += '  <circle cx="0" cy="0" r="275" fill="none" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1"/>\n';
      svg += '  <text x="0" y="-170" text-anchor="middle" font-size="9" fill="#94a3b8">1st-Degree Social Circle</text>\n';
      svg += '  <text x="0" y="-280" text-anchor="middle" font-size="9" fill="#94a3b8">2nd-Degree Extended Circle</text>\n';
    } else {
      svg += '  <line x1="-420" y1="0" x2="420" y2="0" stroke="#f1f5f9" stroke-width="1.5"/>\n';
      svg += '  <line x1="0" y1="-300" x2="0" y2="300" stroke="#f1f5f9" stroke-width="1.5"/>\n';
      svg += '  <text x="-400" y="-270" font-size="10" font-weight="bold" fill="#94a3b8">CLAN (Collaborate)</text>\n';
      svg += '  <text x="240" y="-270" font-size="10" font-weight="bold" fill="#94a3b8">ADHOCRACY (Create)</text>\n';
      svg += '  <text x="-400" y="280" font-size="10" font-weight="bold" fill="#94a3b8">HIERARCHY (Control)</text>\n';
      svg += '  <text x="250" y="280" font-size="10" font-weight="bold" fill="#94a3b8">MARKET (Compete)</text>\n';
    }

    // Render Edges
    svg += '  <g class="sg-edges">\n';
    visibleEdges.forEach(e => {
      const p1 = positions[e.sourceId];
      const p2 = positions[e.targetId];
      if (!p1 || !p2) return;

      const col = REL_COLORS[e.type] || '#64748b';
      const absSent = Math.abs(e.sentiment);
      const strokeWidth = Math.max(1.5, Math.min(6, (absSent / 100) * 4 + 1.5));
      const isNeg = e.sentiment < 0;
      const markerAttr = `marker-end="url(#sg-arrow-${e.type.toLowerCase()})"`;
      const dashAttr = isNeg ? 'stroke-dasharray="4,3"' : '';

      svg += `    <line class="sg-edge" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${col}" stroke-width="${strokeWidth}" stroke-opacity="0.75" ${dashAttr} ${markerAttr} style="cursor:pointer;">\n`;
      svg += `      <title>${e.sourceNpc.name} → [${e.type}] → ${e.targetNpc.name} (${e.sentiment >= 0 ? '+' : ''}${e.sentiment})${e.notes ? '\n' + e.notes : ''}</title>\n`;
      svg += `    </line>\n`;
    });
    svg += '  </g>\n';

    // Render Nodes
    svg += '  <g class="sg-nodes">\n';
    visibleNpcMap.forEach((entry, id) => {
      const pos = positions[id];
      if (!pos) return;

      const npc = entry.npc;
      const isFocus = (id === focusNpcId);
      const faction = npc.factionId ? factionMap[String(npc.factionId)] : null;
      const factionColor = faction ? (FACTION_QUADRANT_COLORS[faction.cvfQuadrant] || '#3b82f6') : '#64748b';
      const isLeader = faction && String(faction.leaderNpcId) === id;
      const icon = isLeader ? '👑' : '👤';

      const cleanName = (npc.name || 'Unnamed Character').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const displayName = cleanName.length > 18 ? cleanName.substring(0, 16) + '…' : cleanName;
      const roleText = (npc.role || (faction ? faction.name : 'Resident')).replace(/&/g, '&amp;');
      const displayRole = roleText.length > 20 ? roleText.substring(0, 18) + '…' : roleText;

      svg += `    <g class="sg-node" data-id="${id}" transform="translate(${pos.x}, ${pos.y})" onclick="if(window.handleSocialGraphNodeClick) window.handleSocialGraphNodeClick('${id}')" ondblclick="if(window.handleSocialGraphNodeDblClick) window.handleSocialGraphNodeDblClick('${id}')" style="cursor:pointer;" filter="url(#sg-shadow)">\n`;

      if (isFocus) {
        svg += `      <circle cx="0" cy="0" r="28" fill="#4338ca" fill-opacity="0.15" stroke="#4338ca" stroke-width="2" stroke-dasharray="3,3"/>\n`;
      }

      svg += `      <circle cx="0" cy="0" r="20" fill="#ffffff" stroke="${factionColor}" stroke-width="${isFocus ? 3.5 : 2.5}"/>\n`;
      svg += `      <text x="0" y="5" text-anchor="middle" font-size="14">${icon}</text>\n`;
      svg += `      <text x="0" y="32" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#0f172a">${displayName}</text>\n`;
      svg += `      <text x="0" y="44" text-anchor="middle" font-size="8.5" fill="#64748b">${displayRole}</text>\n`;
      svg += `      <title>${npc.name} (${npc.role || 'Resident'})\nFaction: ${faction ? faction.name : 'Unassigned'}\nClick to focus • Double-click to inspect</title>\n`;
      svg += `    </g>\n`;
    });
    svg += '  </g>\n';

    svg += '</svg>';
    return svg;
  }
  window.generateSocialGraphSvg = generateSocialGraphSvg;

  // --- UI Interactivity & MDI Integration ---
  let activeFocusNpcId = null;

  function openSocialGraphModal(focusNpcId = null) {
    if (typeof MDIWindowManager !== 'undefined' && MDIWindowManager.open) {
      MDIWindowManager.open('modal-social-graph');
    } else {
      const el = document.getElementById('modal-social-graph');
      if (el) el.classList.remove('hidden');
    }

    if (focusNpcId) activeFocusNpcId = String(focusNpcId);
    syncSocialGraphControls();
    renderSocialGraph();
  }
  window.openSocialGraphModal = openSocialGraphModal;

  function syncSocialGraphControls() {
    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
    if (!topo) return;

    // Focus select
    const focusSelect = document.getElementById('sg-focus-select');
    if (focusSelect) {
      const curVal = activeFocusNpcId || '';
      let opts = '<option value="">-- All Characters (Global) --</option>';
      (topo.npcs || []).forEach(n => {
        opts += `<option value="${n.id}" ${String(n.id) === curVal ? 'selected' : ''}>${n.name} (${n.role || 'Resident'})</option>`;
      });
      focusSelect.innerHTML = opts;
    }

    // Faction filter
    const factionSelect = document.getElementById('sg-faction-filter');
    if (factionSelect) {
      const curFac = factionSelect.value;
      let fOpts = '<option value="">All Factions / Free Agents</option>';
      (topo.factions || []).forEach(f => {
        fOpts += `<option value="${f.id}" ${f.id === curFac ? 'selected' : ''}>👑 ${f.name} (${f.cvfQuadrant || 'Universal'})</option>`;
      });
      factionSelect.innerHTML = fOpts;
    }
  }
  window.syncSocialGraphControls = syncSocialGraphControls;

  function setSocialGraphFocus(npcId) {
    activeFocusNpcId = npcId ? String(npcId) : null;
    const focusSelect = document.getElementById('sg-focus-select');
    if (focusSelect) focusSelect.value = activeFocusNpcId || '';
    renderSocialGraph();
  }
  window.setSocialGraphFocus = setSocialGraphFocus;

  function resetSocialGraphView() {
    activeFocusNpcId = null;
    const focusSelect = document.getElementById('sg-focus-select');
    if (focusSelect) focusSelect.value = '';
    const factionSelect = document.getElementById('sg-faction-filter');
    if (factionSelect) factionSelect.value = '';
    const sentSlider = document.getElementById('sg-min-sentiment');
    if (sentSlider) {
      sentSlider.value = 0;
      const sentVal = document.getElementById('sg-min-sentiment-val');
      if (sentVal) sentVal.textContent = '0';
    }
    const connCheck = document.getElementById('sg-connected-only');
    if (connCheck) connCheck.checked = true;
    renderSocialGraph();
  }
  window.resetSocialGraphView = resetSocialGraphView;

  function renderSocialGraph() {
    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
    const viewport = document.getElementById('social-graph-viewport');
    if (!viewport || !topo) return;

    const factionSelect = document.getElementById('sg-faction-filter');
    const sentSlider = document.getElementById('sg-min-sentiment');
    const connCheck = document.getElementById('sg-connected-only');

    const options = {
      focusNpcId: activeFocusNpcId,
      factionFilter: factionSelect ? factionSelect.value : null,
      minSentiment: sentSlider ? parseInt(sentSlider.value, 10) || 0 : 0,
      connectedOnly: connCheck ? connCheck.checked : true
    };

    const svgMarkup = generateSocialGraphSvg(topo, options);
    viewport.innerHTML = svgMarkup + `
      <div id="social-graph-hud" style="position:absolute; bottom:6px; left:8px; font-size:10px; color:#64748b; background:rgba(255,255,255,0.88); padding:2px 6px; border-radius:2px; border:1px solid #e2e8f0; pointer-events:none;">
        Click node to set focus • Double-click node to inspect in Entity Manager
      </div>
    `;

    renderSocialGraphSidebar();
  }
  window.renderSocialGraph = renderSocialGraph;

  function renderSocialGraphSidebar() {
    const cardEl = document.getElementById('sg-selected-card');
    if (!cardEl) return;

    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
    if (!topo || !activeFocusNpcId) {
      cardEl.innerHTML = '<div style="font-size:10px; color:#64748b; font-style:italic;">Click on any character node to inspect relationships, sentiment balance, and quick actions.</div>';
      return;
    }

    const npc = (topo.npcs || []).find(n => String(n.id) === activeFocusNpcId);
    if (!npc) {
      cardEl.innerHTML = '<div style="font-size:10px; color:#64748b; font-style:italic;">Character not found in active roster.</div>';
      return;
    }

    const faction = npc.factionId ? (topo.factions || []).find(f => String(f.id) === String(npc.factionId)) : null;
    const rels = Array.isArray(npc.relationships) ? npc.relationships : [];
    const inbound = (topo.npcs || []).filter(other => other.id !== npc.id && Array.isArray(other.relationships) && other.relationships.some(r => String(r.targetNpcId) === String(npc.id)));

    let relItemsHtml = '';
    if (rels.length === 0 && inbound.length === 0) {
      relItemsHtml = '<div style="font-size:9px; color:#94a3b8; font-style:italic;">No recorded social ties.</div>';
    } else {
      relItemsHtml = rels.map(r => {
        const target = (topo.npcs || []).find(n => String(n.id) === String(r.targetNpcId));
        const col = REL_COLORS[r.relationshipType || r.type] || '#64748b';
        const s = typeof r.sentiment === 'number' ? r.sentiment : 0;
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #e2e8f0; padding:2px 5px; border-radius:2px; margin-bottom:2px;">
            <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              <span style="color:${col}; font-weight:bold; font-size:9px;">● ${r.relationshipType || r.type}:</span>
              <span style="font-size:9px;">${target ? target.name : r.targetNpcId}</span>
            </div>
            <span style="font-size:8.5px; font-weight:bold; color:${s >= 0 ? '#16a34a' : '#dc2626'};">${s >= 0 ? '+' : ''}${s}</span>
          </div>
        `;
      }).join('');
    }

    cardEl.innerHTML = `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:3px; padding:8px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
          <div>
            <strong style="font-size:12px; color:#0f172a;">${npc.name}</strong>
            <div style="font-size:9.5px; color:#64748b;">${npc.role || 'Resident'} &bull; ${faction ? faction.name : 'Free Agent'}</div>
          </div>
          <button class="win-btn" onclick="openAddNpcRelationshipModal('${npc.id}')" style="font-size:9px; padding:1px 5px;">+ Tie</button>
        </div>
        <div style="margin-top:6px;">
          <strong style="font-size:10px; color:#334155; display:block; margin-bottom:3px;">Social Ties (${rels.length} out / ${inbound.length} in):</strong>
          <div style="max-height:160px; overflow-y:auto;">${relItemsHtml}</div>
        </div>
        <div style="display:flex; gap:4px; margin-top:8px;">
          <button class="win-btn" onclick="if(window.openEntityManager){openEntityManager('npc'); selectEntityItem('${npc.id}');}" style="flex:1; font-size:10px; font-weight:bold;">Inspect in Manager</button>
          <button class="win-btn" onclick="setSocialGraphFocus(null)" style="font-size:10px;">Clear Focus</button>
        </div>
      </div>
    `;
  }

  function handleSocialGraphNodeClick(nodeId) {
    setSocialGraphFocus(nodeId);
  }
  window.handleSocialGraphNodeClick = handleSocialGraphNodeClick;

  function handleSocialGraphNodeDblClick(nodeId) {
    if (typeof openEntityManager === 'function') {
      openEntityManager('npc');
      if (typeof selectEntityItem === 'function') {
        selectEntityItem(nodeId);
      }
    }
  }
  window.handleSocialGraphNodeDblClick = handleSocialGraphNodeDblClick;

  // --- Modal Dialog: Add / Edit NPC Relationship ---
  function openAddNpcRelationshipModal(sourceNpcId, targetNpcId = null) {
    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) ? Workstation.activeTopology : null;
    if (!topo || !Array.isArray(topo.npcs)) return;

    const sourceNpc = topo.npcs.find(n => String(n.id) === String(sourceNpcId));
    if (!sourceNpc) return;

    const sourceNameEl = document.getElementById('rel-source-name');
    const sourceIdInput = document.getElementById('rel-source-id');
    const targetSelect = document.getElementById('rel-target-id');
    const typeSelect = document.getElementById('rel-type-select');
    const sentSlider = document.getElementById('rel-sentiment-slider');
    const sentVal = document.getElementById('rel-sentiment-val');
    const recipCheck = document.getElementById('rel-reciprocal-check');
    const recipHint = document.getElementById('rel-reciprocal-hint');
    const notesInput = document.getElementById('rel-notes-input');

    if (!sourceNameEl || !sourceIdInput || !targetSelect) return;

    sourceNameEl.textContent = `${sourceNpc.name} (${sourceNpc.role || 'Resident'})`;
    sourceIdInput.value = sourceNpc.id;

    // Populate target select with all other NPCs
    let targetOpts = '';
    const otherNpcs = topo.npcs.filter(n => String(n.id) !== String(sourceNpc.id));
    otherNpcs.forEach(other => {
      targetOpts += `<option value="${other.id}" ${targetNpcId && String(other.id) === String(targetNpcId) ? 'selected' : ''}>${other.name} (${other.role || 'Resident'})</option>`;
    });
    targetSelect.innerHTML = targetOpts;

    // Check if editing existing relationship
    let existingRel = null;
    if (targetNpcId && Array.isArray(sourceNpc.relationships)) {
      existingRel = sourceNpc.relationships.find(r => String(r.targetNpcId) === String(targetNpcId));
    }

    if (existingRel) {
      if (typeSelect) typeSelect.value = existingRel.relationshipType || existingRel.type || 'Ally';
      const s = typeof existingRel.sentiment === 'number' ? existingRel.sentiment : 0;
      if (sentSlider) sentSlider.value = s;
      if (sentVal) sentVal.textContent = (s >= 0 ? '+' : '') + s;
      if (notesInput) notesInput.value = existingRel.notes || '';
    } else {
      if (typeSelect) typeSelect.value = 'Ally';
      if (sentSlider) sentSlider.value = 0;
      if (sentVal) sentVal.textContent = '0';
      if (notesInput) notesInput.value = '';
    }

    if (recipCheck) recipCheck.checked = true;
    updateReciprocalHint();

    // Listen to changes for reciprocal hint
    if (typeSelect) {
      typeSelect.onchange = updateReciprocalHint;
    }

    if (typeof openModal === 'function') openModal('modal-npc-relationship-crud');
    else {
      const modal = document.getElementById('modal-npc-relationship-crud');
      if (modal) modal.classList.remove('hidden');
    }
  }
  window.openAddNpcRelationshipModal = openAddNpcRelationshipModal;

  function updateReciprocalHint() {
    const typeSelect = document.getElementById('rel-type-select');
    const recipHint = document.getElementById('rel-reciprocal-hint');
    if (!typeSelect || !recipHint) return;
    const invMap = window.INVERSE_RELATIONSHIPS || {};
    const inv = invMap[typeSelect.value] || typeSelect.value;
    recipHint.textContent = `Inverse: ${inv}`;
  }
  window.updateReciprocalHint = updateReciprocalHint;

  function updateRelSentimentDisplay(val) {
    const valEl = document.getElementById('rel-sentiment-val');
    if (!valEl) return;
    const num = parseInt(val, 10) || 0;
    valEl.textContent = (num >= 0 ? '+' : '') + num;
    if (num > 0) {
      valEl.style.background = '#dcfce7';
      valEl.style.color = '#15803d';
    } else if (num < 0) {
      valEl.style.background = '#fee2e2';
      valEl.style.color = '#b91c1c';
    } else {
      valEl.style.background = '#f1f5f9';
      valEl.style.color = '#475569';
    }
  }
  window.updateRelSentimentDisplay = updateRelSentimentDisplay;

  function submitNpcRelationshipModal() {
    const sId = document.getElementById('rel-source-id')?.value;
    const tId = document.getElementById('rel-target-id')?.value;
    const relType = document.getElementById('rel-type-select')?.value;
    const sentSlider = document.getElementById('rel-sentiment-slider');
    const sentiment = sentSlider ? parseInt(sentSlider.value, 10) || 0 : 0;
    const recipCheck = document.getElementById('rel-reciprocal-check');
    const isReciprocal = recipCheck ? recipCheck.checked : false;
    const notes = document.getElementById('rel-notes-input')?.value || '';

    if (!sId || !tId) return;

    if (typeof addNpcRelationship === 'function') {
      addNpcRelationship(sId, tId, relType, sentiment, notes, isReciprocal);
    }

    if (typeof closeModal === 'function') closeModal('modal-npc-relationship-crud');
    else {
      const modal = document.getElementById('modal-npc-relationship-crud');
      if (modal) modal.classList.add('hidden');
    }
  }
  window.submitNpcRelationshipModal = submitNpcRelationshipModal;

})();
