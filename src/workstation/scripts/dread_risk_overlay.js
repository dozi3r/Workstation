// Dread Risk what-if overlay: runs dread_risk.js on the active topology, tints the affected conduits on the CAD
// canvas and reports totals in the status bar. Never writes to the campaign (ADR 0024). Browser only.
(function () {
  let state = null; // { topo, result }

  function injectStyle() {
    if (document.getElementById('dread-risk-style')) return;
    const st = document.createElement('style');
    st.id = 'dread-risk-style';
    st.textContent = '@keyframes dreadPulse { 0%,100% { opacity:1 } 50% { opacity:.45 } } .dread-pulse { animation: dreadPulse 1.2s ease-in-out infinite; }';
    document.head.appendChild(st);
  }

  // 'primary' (dreaded conduit), 'detour' (receives displaced traffic) or null. Used by cad_canvas_renderer.js.
  window.getDreadOverlayEdgeKind = function (pairKey) {
    if (!state || state.topo !== (window.Workstation && Workstation.activeTopology)) return null;
    if (state.result.primaryEdgeKeys.indexOf(pairKey) !== -1) return 'primary';
    if (state.result.detourEdgeKeys.indexOf(pairKey) !== -1) return 'detour';
    return null;
  };

  window.runDreadRiskWhatIf = function (nodeId) {
    const topo = window.Workstation && Workstation.activeTopology;
    if (!topo || !topo.nodes || !topo.nodes[String(nodeId)]) { alert('Select a node on the active map first.'); return; }
    const raw = window.prompt('Catastrophe severity at this node (1 = minor raid, 10 = massacre):', '7');
    if (raw === null) return;
    const severity = Number(raw);
    if (!isFinite(severity) || severity < 1 || severity > 10) { alert('Enter a number from 1 to 10.'); return; }
    const node = topo.nodes[String(nodeId)];
    const odv = typeof resolveNodeOdv === 'function' ? resolveNodeOdv(node) : undefined;
    const result = window.simulateDreadRiskCascade(topo, { sourceNodeId: nodeId, severity: severity, odv: odv });
    state = { topo: topo, result: result };
    injectStyle();
    if (typeof renderCanvas === 'function') renderCanvas();
    const flagged = result.flaggedNodes.map(function (f) {
      const n = topo.nodes[f.nodeId];
      return (n && n.name ? n.name : f.nodeId) + ' (' + f.tag + ')';
    });
    if (typeof setStatusBarMessage === 'function') {
      setStatusBarMessage(window.formatDreadSummary(result) + (flagged.length ? ' | ' + flagged.join(', ') : '') + ' | What-if only: nothing saved.');
    }
  };

  window.clearDreadRiskWhatIf = function () {
    state = null;
    if (typeof renderCanvas === 'function') renderCanvas();
    if (typeof setStatusBarMessage === 'function') setStatusBarMessage('Dread risk what-if cleared.');
  };

  window.isDreadRiskWhatIfActive = function () { return !!state; };
})();
