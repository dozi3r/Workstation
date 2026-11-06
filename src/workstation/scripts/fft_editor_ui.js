// Fast-and-Frugal Tree editor dialog, dossier renderer and heuristic badge (Win95 skin).
// Depends on fast_frugal_tree.js (UMD globals) and sociology_data.js; browser only.
// Authority: tickets/plans/gigerenzer_heuristics_implementation_plan.md (Proposal A, Phase 2)
(function () {
  const esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  const jsArg = function (s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); };
  const MODAL_ID = 'modal-fft-builder';
  let B = null; // builder state: { entityType, entityId, fft, party }

  const TYPE_LABELS = {
    boolean_query: 'Yes/No question', faction_standing: 'Faction standing (id:min)',
    item_check: 'Party holds item', disposition_threshold: 'Disposition at least', gold_threshold: 'Party gold at least'
  };

  function findEntity(entityType, entityId) {
    const topo = (typeof Workstation !== 'undefined' && Workstation.activeTopology) || null;
    if (!topo) return null;
    const list = entityType === 'npc' ? topo.npcs : topo.factions;
    return (list || []).find(function (e) { return String(e.id) === String(entityId); }) || null;
  }

  function formatTarget(type, v) {
    if (type === 'faction_standing') { const t = v || {}; return (t.factionId || '') + ':' + (t.min != null ? t.min : 1); }
    if (type === 'boolean_query') return v === false ? 'false' : 'true';
    return v == null ? '' : String(v);
  }
  function parseTarget(type, raw) {
    raw = String(raw == null ? '' : raw).trim();
    if (type === 'faction_standing') { const p = raw.split(':'); return { factionId: p[0] || '', min: Number(p[1]) || 0 }; }
    if (type === 'boolean_query') return raw.toLowerCase() !== 'false';
    if (type === 'gold_threshold' || type === 'disposition_threshold') return Number(raw) || 0;
    return raw;
  }

  // ---- Heuristic badge (works for any {s,e,c} vector) ----
  function renderHeuristicBadgeHtml(vec) {
    if (!vec || typeof deriveHeuristicProfile !== 'function') return '';
    const v = Array.isArray(vec) ? { s: vec[0], e: vec[1], c: vec[2] } : vec;
    if (v.s == null || v.e == null || v.c == null) return '';
    const p = deriveHeuristicProfile(v.s, v.e, v.c);
    const names = { SOCIAL_PROOF: 'Social Proof', FAST_AND_FRUGAL_TREE: 'Fast-and-Frugal Tree', TAKE_THE_BEST: 'Take-the-Best', TALLYING: 'Tallying + 1/N' };
    const colors = { SOCIAL_PROOF: '#166534', FAST_AND_FRUGAL_TREE: '#991b1b', TAKE_THE_BEST: '#92400e', TALLYING: '#1e40af' };
    return '<div style="background:#f8fafc; border:1px solid #cbd5e1; padding:5px 6px; border-radius:2px; font-size:10px;">' +
      '<strong style="color:#0f172a;">&#129504; Heuristic Operational Style:</strong> ' +
      '<span class="entity-badge-tag" style="background:#fff; color:' + colors[p.primary] + '; border:1px solid ' + colors[p.primary] + ';">' + names[p.primary] + '</span> ' +
      '<span class="entity-badge-tag">' + esc(p.strictness) + ' &bull; patience ' + p.searchPatience + '</span>' +
      '<div style="color:#475569; margin-top:2px;">' + esc(p.summary) + '</div></div>';
  }

  // ---- Dossier (read-only tree diagram + actions) ----
  function renderFftDossierHtml(entityType, entity) {
    if (!entity) return '';
    const idArg = jsArg(entity.id);
    const head = '<div style="font-weight:bold; color:#000080; margin-bottom:2px;">&#127795; Decision Tree (Fast-and-Frugal):</div>';
    if (!entity.fft) {
      return '<div>' + head + '<div style="font-size:10px; color:#64748b; font-style:italic;">No decision tree authored.</div>' +
        '<button class="win-btn" style="font-size:10px; margin-top:3px;" onclick="openFftBuilderModal(\'' + entityType + '\', \'' + idArg + '\')">Author Decision Tree...</button></div>';
    }
    const fft = entity.fft;
    const rows = (fft.cues || []).map(function (cue, i) {
      const exitsOn = cue.exitDirection === 'yes' ? 'YES' : 'NO';
      const contOn = cue.exitDirection === 'yes' ? 'NO' : 'YES';
      return '<div style="display:flex; gap:6px; align-items:stretch; margin-bottom:2px;">' +
        '<div style="flex:1; background:#fff; border:1px solid #94a3b8; padding:3px 5px; font-size:10px;"><strong>' + (i + 1) + '.</strong> ' + esc(cue.label || cue.id) +
        '<div style="color:#64748b; font-size:9px;">&darr; ' + contOn + ' continues</div></div>' +
        '<div style="width:46%; background:#f1f5f9; border:1px solid #cbd5e1; padding:3px 5px; font-size:10px;">If <strong>' + exitsOn + '</strong>: ' + esc(cue.exitLabel || cue.exitAction) + '</div></div>';
    }).join('');
    return '<div>' + head +
      '<div style="font-size:10px; color:#334155; margin-bottom:3px;"><strong>' + esc(fft.name || 'Untitled tree') + '</strong>' + (fft.purpose ? ' &mdash; ' + esc(fft.purpose) : '') + '</div>' +
      rows +
      '<div style="background:#e0f2fe; border:1px solid #7dd3fc; padding:3px 5px; font-size:10px;">No cue fired: <strong>' + esc((fft.defaultExit && (fft.defaultExit.label || fft.defaultExit.action)) || '?') + '</strong></div>' +
      '<div style="display:flex; gap:4px; margin-top:3px;">' +
      '<button class="win-btn" style="font-size:10px;" onclick="openFftBuilderModal(\'' + entityType + '\', \'' + idArg + '\')">Edit / Test...</button>' +
      '<button class="win-btn" style="font-size:10px; color:#b91c1c;" onclick="removeEntityFft(\'' + entityType + '\', \'' + idArg + '\')">Remove</button></div></div>';
  }

  // ---- Builder dialog ----
  function ensureModal() {
    let el = document.getElementById(MODAL_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = MODAL_ID;
    el.className = 'modal-overlay hidden';
    el.style.zIndex = 10060;
    el.innerHTML = '<div class="win-dialog bevel-outset" style="width:640px; max-width:96vw; max-height:92vh; display:flex; flex-direction:column;">' +
      '<div class="title-bar"><div class="title-bar-text">Decision Tree Builder</div>' +
      '<div class="title-bar-controls"><button class="win-btn" onclick="closeModal(\'' + MODAL_ID + '\')">X</button></div></div>' +
      '<div id="fft-builder-body" class="dialog-body" style="padding:8px; overflow-y:auto; display:flex; flex-direction:column; gap:6px; font-size:11px;"></div></div>';
    document.body.appendChild(el);
    return el;
  }

  function cueRowHtml(cue, i, total) {
    const typeOpts = window.FFT_TEST_TYPES.map(function (t) {
      return '<option value="' + t + '"' + (cue.testType === t ? ' selected' : '') + '>' + TYPE_LABELS[t] + '</option>';
    }).join('');
    return '<div style="border:1px solid #94a3b8; background:#fff; padding:4px; display:flex; flex-direction:column; gap:3px;">' +
      '<div style="display:flex; gap:3px; align-items:center;"><strong>' + (i + 1) + '.</strong>' +
      '<input class="win-select-input" style="flex:1;" value="' + esc(cue.label) + '" placeholder="Question" onchange="fftBuilderSet(' + i + ',\'label\',this.value)">' +
      '<button class="win-btn" ' + (i === 0 ? 'disabled' : '') + ' onclick="fftBuilderMove(' + i + ',-1)">&uarr;</button>' +
      '<button class="win-btn" ' + (i === total - 1 ? 'disabled' : '') + ' onclick="fftBuilderMove(' + i + ',1)">&darr;</button>' +
      '<button class="win-btn" style="color:#b91c1c;" onclick="fftBuilderRemove(' + i + ')">Del</button></div>' +
      '<div style="display:flex; gap:3px; flex-wrap:wrap;">' +
      '<select class="win-select-input" onchange="fftBuilderSet(' + i + ',\'testType\',this.value)">' + typeOpts + '</select>' +
      '<input class="win-select-input" style="width:110px;" title="Target value" value="' + esc(formatTarget(cue.testType, cue.targetValue)) + '" onchange="fftBuilderSet(' + i + ',\'targetValue\',this.value)">' +
      '<select class="win-select-input" onchange="fftBuilderSet(' + i + ',\'exitDirection\',this.value)">' +
      '<option value="yes"' + (cue.exitDirection === 'yes' ? ' selected' : '') + '>Exit if YES</option>' +
      '<option value="no"' + (cue.exitDirection === 'no' ? ' selected' : '') + '>Exit if NO</option></select>' +
      '<input class="win-select-input" style="width:120px;" placeholder="ACTION_CODE" value="' + esc(cue.exitAction) + '" onchange="fftBuilderSet(' + i + ',\'exitAction\',this.value)">' +
      '<input class="win-select-input" style="flex:1; min-width:100px;" placeholder="Exit label" value="' + esc(cue.exitLabel) + '" onchange="fftBuilderSet(' + i + ',\'exitLabel\',this.value)"></div></div>';
  }

  function renderBuilder() {
    if (!B) return;
    const f = B.fft, p = B.party;
    const presetOpts = Object.keys(window.FFT_PRESETS).map(function (k) { return '<option value="' + k + '">' + esc(window.FFT_PRESETS[k].name) + '</option>'; }).join('');
    const boolCues = f.cues.filter(function (c) { return c.testType === 'boolean_query'; });
    const errors = window.validateFft(f);
    let result = '';
    if (errors.length) {
      result = '<div style="color:#991b1b;">' + errors.map(esc).join('<br>') + '</div>';
    } else {
      const r = window.evaluateFastAndFrugalTree(f, {
        partyGold: p.gold, disposition: p.disposition, partyItems: p.items.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        factionStandings: p.standings, queryAnswers: p.answers
      });
      result = '<strong>' + esc(r.label) + '</strong> <span class="entity-badge-tag">' + esc(r.action) + '</span><br>' +
        'Looked at ' + r.cuesInspected + ' of ' + r.totalCues + ' cues &bull; frugality ' + Math.round(r.frugality * 100) + '%<br>' +
        '<span style="color:#475569;">' + r.trace.map(function (t) { return esc(t.cueId) + '=' + (t.holds ? 'yes' : 'no'); }).join(' &rarr; ') + '</span>';
    }
    document.getElementById('fft-builder-body').innerHTML =
      '<div style="display:flex; gap:4px; align-items:center;"><label>Name <input class="win-select-input" value="' + esc(f.name) + '" onchange="fftBuilderMeta(\'name\',this.value)"></label>' +
      '<label style="flex:1;">Purpose <input class="win-select-input" style="width:100%;" value="' + esc(f.purpose) + '" onchange="fftBuilderMeta(\'purpose\',this.value)"></label></div>' +
      '<div style="display:flex; gap:4px;"><select id="fft-preset-pick" class="win-select-input">' + presetOpts + '</select>' +
      '<button class="win-btn" onclick="fftBuilderLoadPreset()">Load Preset</button></div>' +
      f.cues.map(function (c, i) { return cueRowHtml(c, i, f.cues.length); }).join('') +
      '<div><button class="win-btn" onclick="fftBuilderAdd()">+ Add Cue</button></div>' +
      '<div style="display:flex; gap:4px; align-items:center;"><strong>Default exit:</strong>' +
      '<input class="win-select-input" style="width:150px;" value="' + esc(f.defaultExit && f.defaultExit.action) + '" onchange="fftBuilderDefault(\'action\',this.value)">' +
      '<input class="win-select-input" style="flex:1;" value="' + esc(f.defaultExit && f.defaultExit.label) + '" onchange="fftBuilderDefault(\'label\',this.value)"></div>' +
      '<fieldset style="border:1px solid #94a3b8; padding:4px;"><legend>Test against a mock party</legend>' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
      '<label>Gold <input type="number" class="win-select-input" style="width:60px;" value="' + p.gold + '" onchange="fftBuilderParty(\'gold\',this.value)"></label>' +
      '<label>Disposition <input type="number" class="win-select-input" style="width:50px;" value="' + p.disposition + '" onchange="fftBuilderParty(\'disposition\',this.value)"></label>' +
      '<label>Items <input class="win-select-input" style="width:140px;" placeholder="seal, writ" value="' + esc(p.items) + '" onchange="fftBuilderParty(\'items\',this.value)"></label>' +
      '<label>Standings <input class="win-select-input" style="width:130px;" placeholder="guild:2, phalanx:1" value="' + esc(p.standingsText) + '" onchange="fftBuilderParty(\'standings\',this.value)"></label></div>' +
      (boolCues.length ? '<div style="margin-top:3px;">' + boolCues.map(function (c) {
        return '<label style="margin-right:8px;"><input type="checkbox" ' + (p.answers[c.id] ? 'checked' : '') + ' onchange="fftBuilderAnswer(\'' + jsArg(c.id) + '\',this.checked)"> ' + esc(c.label || c.id) + '</label>';
      }).join('') + '</div>' : '') +
      '<div style="background:#ffffe1; border:1px solid #000; padding:4px; margin-top:4px;">' + result + '</div></fieldset>' +
      '<div class="dialog-footer" style="justify-content:flex-end; gap:6px;">' +
      '<button class="win-btn" onclick="closeModal(\'' + MODAL_ID + '\')">Cancel</button>' +
      '<button class="win-btn" ' + (errors.length ? 'disabled' : '') + ' style="font-weight:bold; background:#000080; color:#fff;" onclick="fftBuilderSave()">Save Tree</button></div>';
  }

  function openFftBuilderModal(entityType, entityId) {
    const ent = findEntity(entityType, entityId);
    if (!ent) { alert('Add this character or faction to the active campaign before authoring a decision tree.'); return; }
    ensureModal();
    B = {
      entityType: entityType, entityId: entityId,
      fft: ent.fft ? JSON.parse(JSON.stringify(ent.fft)) : window.createDefaultFft('sentry_triage'),
      party: { gold: 0, disposition: 0, items: '', standingsText: '', standings: {}, answers: {} }
    };
    renderBuilder();
    openModal(MODAL_ID);
  }

  function update(next) { B.fft = next; renderBuilder(); }
  window.fftBuilderSet = function (i, key, val) {
    const next = JSON.parse(JSON.stringify(B.fft)); const cue = next.cues[i];
    if (key === 'targetValue') cue.targetValue = parseTarget(cue.testType, val);
    else if (key === 'testType') { const raw = formatTarget(cue.testType, cue.targetValue); cue.testType = val; cue.targetValue = parseTarget(val, raw); }
    else cue[key] = val;
    update(next);
  };
  window.fftBuilderMove = function (i, d) { update(window.moveCue(B.fft, i, d)); };
  window.fftBuilderRemove = function (i) { update(window.removeCue(B.fft, i)); };
  window.fftBuilderAdd = function () { update(window.addCue(B.fft, { id: 'cue', label: 'New question' })); };
  window.fftBuilderMeta = function (k, v) { B.fft[k] = v; renderBuilder(); };
  window.fftBuilderDefault = function (k, v) { B.fft.defaultExit = B.fft.defaultExit || {}; B.fft.defaultExit[k] = v; renderBuilder(); };
  window.fftBuilderLoadPreset = function () {
    const k = document.getElementById('fft-preset-pick').value;
    if (B.fft.cues.length && !confirm('Replace the current tree with this preset?')) return;
    update(window.createDefaultFft(k));
  };
  window.fftBuilderParty = function (k, v) {
    const p = B.party;
    if (k === 'gold' || k === 'disposition') p[k] = Number(v) || 0;
    else if (k === 'items') p.items = v;
    else if (k === 'standings') {
      p.standingsText = v; p.standings = {};
      String(v).split(',').forEach(function (pair) { const s = pair.split(':'); if (s[0].trim()) p.standings[s[0].trim()] = Number(s[1]) || 0; });
    }
    renderBuilder();
  };
  window.fftBuilderAnswer = function (id, on) { B.party.answers[id] = !!on; renderBuilder(); };

  window.fftBuilderSave = function () {
    const errors = window.validateFft(B.fft);
    if (errors.length) { alert(errors.join('\n')); return; }
    const ent = findEntity(B.entityType, B.entityId);
    if (!ent) return;
    ent.fft = JSON.parse(JSON.stringify(B.fft));
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    closeModal(MODAL_ID);
    if (typeof selectEntityItem === 'function') selectEntityItem(B.entityId, false);
    if (typeof setStatusBarMessage === 'function') setStatusBarMessage('Saved decision tree for ' + (ent.name || ent.id) + '.');
  };

  window.removeEntityFft = function (entityType, entityId) {
    const ent = findEntity(entityType, entityId);
    if (!ent || !confirm('Remove the decision tree from ' + (ent.name || ent.id) + '?')) return;
    delete ent.fft;
    if (typeof saveActiveCampaign === 'function') saveActiveCampaign();
    if (typeof selectEntityItem === 'function') selectEntityItem(entityId, false);
  };

  window.openFftBuilderModal = openFftBuilderModal;
  window.renderFftDossierHtml = renderFftDossierHtml;
  window.renderHeuristicBadgeHtml = renderHeuristicBadgeHtml;
})();
