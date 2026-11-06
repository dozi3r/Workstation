// Dread Risk what-if cascade. Pure, no DOM, never mutates the topology. UMD: browser, Node tests, build.
// After a catastrophe at a node, travelers avoid its conduits and crowd onto detours, which can cost more lives
// than the original event (Gigerenzer's post-9/11 driving analysis). Authority: ADR 0024, plan Proposal C.
//
// Assumptions (all overridable): a conduit carries `trafficVolume` (default baselineTraffic) per period; its nominal
// `capacity` defaults to 1.25 x its own traffic; it cannot take more than 2 x capacity in total.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(root);
  else Object.assign(root, factory(root));
})(typeof window !== "undefined" ? window : globalThis, function () {
  // Per-traveler loss rate by effective hazard level 0..4 (same scale as natural_frequency_engine).
  const LOSS_RATE = [0, 0.05, 0.15, 0.30, 0.50];

  function pairKey(a, b) { return [String(a), String(b)].sort().join("-"); }
  function rateFor(level) { return LOSS_RATE[Math.min(4, Math.max(0, Math.round(Number(level) || 0)))]; }
  function num(v, d) { const n = Number(v); return isFinite(n) ? n : d; }

  function buildRoadGraph(topo) {
    const g = {};
    const nodes = (topo && topo.nodes) || {};
    Object.keys(nodes).forEach(function (id) { g[id] = g[id] || new Set(); });
    Object.keys(nodes).forEach(function (id) {
      (nodes[id].adj || []).forEach(function (other) {
        const o = String(other);
        if (!nodes[o]) return;
        const rec = topo.edgeData && topo.edgeData[pairKey(id, o)];
        if (rec && rec.blocked) return;
        g[id].add(o); g[o].add(id);
      });
    });
    return g;
  }

  // Shortest path a -> b over roads, excluding the single edge a-b. Returns node id array or null.
  function detourPath(graph, a, b) {
    const prev = {}; prev[a] = null;
    const queue = [a];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === b) break;
      graph[cur].forEach(function (nx) {
        if ((cur === a && nx === b) || (cur === b && nx === a)) return;
        if (Object.prototype.hasOwnProperty.call(prev, nx)) return;
        prev[nx] = cur; queue.push(nx);
      });
    }
    if (!Object.prototype.hasOwnProperty.call(prev, b)) return null;
    const path = [];
    for (let c = b; c !== null; c = prev[c]) path.unshift(c);
    return path;
  }

  function dreadIndex(severity, novelty, odv) {
    const s = Math.max(1, num(odv && odv.s, 2));
    const c = Math.max(1, num(odv && odv.c, 2));
    return num(severity, 0) * (1 + num(novelty, 0)) * (c / s);
  }

  // opts: { sourceNodeId, severity (1-10), novelty (0-1, default 0.5), baselineTraffic (default 100), odv }
  function simulateDreadRiskCascade(topo, opts) {
    opts = opts || {};
    const src = String(opts.sourceNodeId);
    const nodes = (topo && topo.nodes) || {};
    if (!nodes[src]) throw new Error("Unknown source node: " + opts.sourceNodeId);
    const baseline = num(opts.baselineTraffic, 100);
    const severity = Math.min(10, Math.max(0, num(opts.severity, 5)));
    const odv = opts.odv || nodes[src].odv || { s: 2, e: 2, c: 2 };
    const D = dreadIndex(severity, opts.novelty === undefined ? 0.5 : opts.novelty, odv);
    const phi = Math.min(1, D / 10);
    const eventLevel = Math.min(4, Math.max(1, Math.ceil(severity / 2.5)));
    const graph = buildRoadGraph(topo);
    const edgeRec = function (a, b) { return (topo.edgeData && topo.edgeData[pairKey(a, b)]) || {}; };
    const trafficOf = function (a, b) { return Math.max(0, num(edgeRec(a, b).trafficVolume, baseline)); };
    const capacityOf = function (a, b) { const c = num(edgeRec(a, b).capacity, NaN); return isFinite(c) ? c : trafficOf(a, b) * 1.25; };

    // Pass 1: decide each dread conduit's diversion and route it; accumulate load per detour edge.
    const added = {}; // edgeKey -> flow added
    const ends = {};  // edgeKey -> [nodeA, nodeB] (node ids may contain "-", so never parse keys)
    const conduits = [];
    const primaryEdges = Array.from(graph[src] || []);
    primaryEdges.forEach(function (other) {
      const T = trafficOf(src, other);
      const diverted = phi * T;
      const path = diverted > 0 ? detourPath(graph, src, other) : null;
      let served = 0;
      const pathEdges = [];
      if (path) {
        for (let i = 0; i < path.length - 1; i++) {
          const k = pairKey(path[i], path[i + 1]);
          pathEdges.push(k); ends[k] = [path[i], path[i + 1]];
        }
        // Limit by the tightest hard cap (2 x capacity) minus what the edge already carries.
        let room = diverted;
        for (let i = 0; i < path.length - 1; i++) {
          const k = pathEdges[i];
          const spare = Math.max(0, 2 * capacityOf(path[i], path[i + 1]) - trafficOf(path[i], path[i + 1]) - (added[k] || 0));
          room = Math.min(room, spare);
        }
        served = Math.max(0, room);
        pathEdges.forEach(function (k) { added[k] = (added[k] || 0) + served; });
      }
      conduits.push({
        edgeKey: pairKey(src, other), u: src, v: other, traffic: T, direct: T - diverted, diverted: diverted,
        served: served, unserved: diverted - served, detourPath: path || [], detourEdgeKeys: pathEdges,
        primaryLosses: (T - diverted) * rateFor(Math.max(num(edgeRec(src, other).hazardLevel, 0), eventLevel))
      });
    });

    // Pass 2: congestion and casualties on every detour edge, using the final combined load.
    const detours = {};
    Object.keys(added).forEach(function (k) {
      const a = ends[k][0], b = ends[k][1];
      const own = trafficOf(a, b), cap = capacityOf(a, b), load = own + added[k];
      const congestion = Math.max(1, load / (cap || 1));
      const level = num(edgeRec(a, b).hazardLevel, 0);
      const bump = congestion > 1.5 ? 2 : (congestion > 1 ? 1 : 0);
      detours[k] = {
        edgeKey: k, u: a, v: b, added: added[k], load: load, capacity: cap, congestion: congestion,
        hazardLevel: level, escalatedLevel: Math.min(4, level + bump),
        casualties: added[k] * rateFor(Math.min(4, level + bump)) * congestion // crowding raises the effective hazard
      };
    });

    const detourList = Object.keys(detours).map(function (k) { return detours[k]; });
    const sum = function (arr, f) { return arr.reduce(function (t, x) { return t + f(x); }, 0); };
    const primary = sum(conduits, function (c) { return c.primaryLosses; });
    const secondary = sum(detourList, function (d) { return d.casualties; });
    const flagged = {};
    detourList.forEach(function (d) {
      [d.u, d.v].forEach(function (id) {
        if (id === src) return;
        const tag = d.congestion > 1.5 ? "Famine Risk" : "Refugee Strain";
        if (!flagged[id] || tag === "Famine Risk") flagged[id] = tag;
      });
    });

    return {
      sourceNodeId: src, severity: severity, dreadIndex: D, diversionRate: phi, eventLevel: eventLevel,
      conduits: conduits, detours: detourList,
      primaryEdgeKeys: conduits.map(function (c) { return c.edgeKey; }),
      detourEdgeKeys: detourList.map(function (d) { return d.edgeKey; }),
      flaggedNodes: Object.keys(flagged).map(function (id) { return { nodeId: id, tag: flagged[id] }; }),
      totals: {
        entering: sum(conduits, function (c) { return c.traffic; }),
        direct: sum(conduits, function (c) { return c.direct; }),
        diverted: sum(conduits, function (c) { return c.diverted; }),
        served: sum(conduits, function (c) { return c.served; }),
        unserved: sum(conduits, function (c) { return c.unserved; }),
        primaryLosses: primary, secondaryLosses: secondary,
        amplificationPct: primary > 0 ? (secondary / primary) * 100 : null
      }
    };
  }

  function formatDreadSummary(result) {
    const t = result.totals;
    const amp = t.amplificationPct === null ? "n/a" : Math.round(t.amplificationPct) + "% of primary";
    return "Dread Cascade (what-if): Primary Losses: " + Math.round(t.primaryLosses) +
      " | Secondary Detour Losses: " + Math.round(t.secondaryLosses) + " (" + amp + ")" +
      (t.unserved > 0.5 ? " | Stranded: " + Math.round(t.unserved) : "");
  }

  return { DREAD_LOSS_RATE: LOSS_RATE, dreadIndex: dreadIndex, simulateDreadRiskCascade: simulateDreadRiskCascade, formatDreadSummary: formatDreadSummary };
});
