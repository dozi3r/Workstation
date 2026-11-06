// Gigerenzer heuristics suite (Phase 1): heuristic profiles, FFT evaluator, natural frequencies.
// Called from run_tests.js with the shared assert helpers.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports = function testGigerenzerHeuristics(h) {
  const { assert, assertEqual, ROOT } = h;
  console.log('\n--- Suite: Gigerenzer Heuristics (Phase 1) ---');
  const scripts = path.join(ROOT, 'src', 'workstation', 'scripts');

  // ---- Heuristic profiles (sociology_data.js) ----
  const sandbox = { window: {}, console: console, Math: Math };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(scripts, 'sociology_data.js'), 'utf8'), sandbox);
  const w = sandbox.window;
  assert(typeof w.deriveHeuristicProfile === 'function', 'sociology_data exports deriveHeuristicProfile');

  const valid = ['SOCIAL_PROOF', 'FAST_AND_FRUGAL_TREE', 'TAKE_THE_BEST', 'TALLYING'];
  let allCovered = true, allMatchQuadrant = true;
  const quadToPrimary = { Clan: 'SOCIAL_PROOF', Hierarchy: 'FAST_AND_FRUGAL_TREE', Adhocracy: 'TAKE_THE_BEST', Market: 'TALLYING' };
  for (let s = 1; s <= 4; s++) for (let e = 1; e <= 4; e++) for (let c = 1; c <= 4; c++) {
    const p = w.deriveHeuristicProfile(s, e, c);
    if (!p || valid.indexOf(p.primary) === -1) allCovered = false;
    if (p && p.primary !== quadToPrimary[w.deriveCvfQuadrant(s, e)]) allMatchQuadrant = false;
  }
  assert(allCovered, 'every one of the 64 cells maps to exactly one known heuristic');
  assert(allMatchQuadrant, 'heuristic follows deriveCvfQuadrant(s,e) for all 64 cells');
  assertEqual(w.deriveHeuristicProfile(4, 4, 4).strictness, 'codified', 'C>=3 is codified');
  assertEqual(w.deriveHeuristicProfile(4, 4, 2).strictness, 'improvised', 'C<=2 is improvised');
  assertEqual(w.deriveHeuristicProfile(1, 1, 3).searchPatience, 3, 'searchPatience equals C');
  assertEqual(w.deriveHeuristicProfile(99, -5, 'x').primary, w.deriveHeuristicProfile(4, 1, 1).primary, 'out-of-range input is clamped');
  assertEqual(w.getHeuristicProfile({}), null, 'getHeuristicProfile returns null without odv');
  assertEqual(w.getHeuristicProfile({ odv: { s: 3, e: 3, c: 1 } }).primary, 'TAKE_THE_BEST', 'getHeuristicProfile reads node.odv');

  const ttb = w.deriveHeuristicProfile(3, 3, 1);
  assertEqual(w.diagnoseEcologicalMatch(ttb, { cueRedundancy: 'high' })[0].code, 'OVERFITTING_ONE_REASON', 'TTB in redundant cues warns');
  assertEqual(w.diagnoseEcologicalMatch(ttb, { cueRedundancy: 'low' }).length, 0, 'TTB in sparse cues is a good fit');
  assertEqual(w.diagnoseEcologicalMatch(w.deriveHeuristicProfile(1, 1, 4), { threat: 'asymmetric' })[0].code, 'PROCEDURAL_PARALYSIS', 'FFT under asymmetric threat warns');
  assertEqual(w.diagnoseEcologicalMatch(null, {}).length, 0, 'diagnose tolerates null profile');

  // ---- FFT evaluator ----
  const fftMod = require(path.join(scripts, 'fast_frugal_tree.js'));
  const tree = {
    cues: [
      { id: 'c1', testType: 'boolean_query', targetValue: true, exitDirection: 'yes', exitAction: 'ATTACK' },
      { id: 'c2', testType: 'item_check', targetValue: 'seal', exitDirection: 'yes', exitAction: 'PASS' },
      { id: 'c3', testType: 'gold_threshold', targetValue: 50, exitDirection: 'no', exitAction: 'REFUSE' }
    ],
    defaultExit: { action: 'ESCORT' }
  };
  assertEqual(fftMod.validateFft(tree), [], 'valid tree has no errors');

  const r1 = fftMod.evaluateFastAndFrugalTree(tree, { queryAnswers: { c1: true }, partyItems: ['seal'], partyGold: 0 });
  assertEqual([r1.action, r1.stepIndex, r1.cuesInspected], ['ATTACK', 0, 1], 'cue 1 exits immediately');
  assertEqual(r1.trace.length, 1, 'cues 2 and 3 are never evaluated after an early exit (noncompensatory)');
  assert(Math.abs(r1.frugality - (1 - 1 / 3)) < 1e-9, 'frugality = 1 - inspected/total');

  const r2 = fftMod.evaluateFastAndFrugalTree(tree, { partyItems: ['seal'], partyGold: 0 });
  assertEqual([r2.action, r2.stepIndex], ['PASS', 1], 'cue 2 exits when cue 1 does not');

  const r3 = fftMod.evaluateFastAndFrugalTree(tree, { partyItems: [], partyGold: 10 });
  assertEqual([r3.action, r3.stepIndex], ['REFUSE', 2], '"no" exit direction fires when condition fails');

  const r4 = fftMod.evaluateFastAndFrugalTree(tree, { partyItems: [], partyGold: 100 });
  assertEqual([r4.action, r4.stepIndex, r4.cueTriggered, r4.frugality], ['ESCORT', 3, null, 0], 'default exit when no cue exits');

  const fs1 = { cues: [{ id: 'f', testType: 'faction_standing', targetValue: { factionId: 'phalanx', min: 2 }, exitDirection: 'yes', exitAction: 'OK' }], defaultExit: { action: 'NO' } };
  assertEqual(fftMod.evaluateFastAndFrugalTree(fs1, { factionStandings: { phalanx: 3 } }).action, 'OK', 'faction_standing meets minimum');
  assertEqual(fftMod.evaluateFastAndFrugalTree(fs1, {}).action, 'NO', 'missing standing counts as 0');
  const ds = { cues: [{ id: 'd', testType: 'disposition_threshold', targetValue: 1, exitDirection: 'yes', exitAction: 'OK' }], defaultExit: { action: 'NO' } };
  assertEqual(fftMod.evaluateFastAndFrugalTree(ds, { disposition: 2 }).action, 'OK', 'disposition_threshold');

  const bad = { cues: [{ id: 'x', testType: 'telepathy', exitDirection: 'maybe' }, { id: 'x', testType: 'item_check', exitDirection: 'yes', exitAction: 'A' }], defaultExit: {} };
  const errs = fftMod.validateFft(bad);
  assert(errs.some(e => /unknown testType/.test(e)), 'unknown testType rejected');
  assert(errs.some(e => /exitDirection/.test(e)), 'bad exitDirection rejected');
  assert(errs.some(e => /duplicate id/.test(e)), 'duplicate cue id rejected');
  assert(errs.some(e => /defaultExit/.test(e)), 'missing defaultExit action rejected');
  let threw = false;
  try { fftMod.evaluateFastAndFrugalTree(bad, {}); } catch (e) { threw = true; }
  assert(threw, 'evaluating an invalid tree throws');
  assertEqual(fftMod.validateFft(null).length, 1, 'null tree is invalid');
  assert(fftMod.validateFft({ cues: [], defaultExit: { action: 'A' } }).length > 0, 'empty cue list is invalid');

  // ---- Natural frequencies ----
  const nf = require(path.join(scripts, 'natural_frequency_engine.js'));
  const base = nf.computeConduitNaturalFrequency({ hazardProbability: 0.1, scoutDetectionRate: 0.8, scoutFalseAlarmRate: 0.1 }, 100);
  assertEqual(base.matrix, { hits: 8, misses: 2, falseAlarms: 9, correctRejections: 81 }, 'classic 10% / 80% / 10% example');
  assertEqual(base.totalThreatWatches + base.totalSafeWatches, 100, 'threat + safe = sample');
  assertEqual(base.alertsTotal, 17, 'alerts = hits + false alarms');

  const zero = nf.computeConduitNaturalFrequency({ hazardProbability: 0 }, 100);
  assertEqual([zero.totalThreatWatches, zero.matrix.hits, zero.matrix.misses], [0, 0, 0], '0% base rate has no threats (explicit 0 is not replaced by a default)');
  const allFalse = nf.computeConduitNaturalFrequency({ hazardProbability: 0, scoutFalseAlarmRate: 1 }, 50);
  assertEqual([allFalse.matrix.falseAlarms, allFalse.matrix.correctRejections], [50, 0], '100% false alarms');
  const all = nf.computeConduitNaturalFrequency({ hazardProbability: 1, scoutDetectionRate: 1 }, 10);
  assertEqual([all.matrix.hits, all.matrix.misses, all.alertsTotal], [10, 0, 10], '100% hazard with perfect scouts');
  const tiny = nf.computeConduitNaturalFrequency({ hazardProbability: 0.3 }, 1);
  const tm = tiny.matrix;
  assertEqual(tm.hits + tm.misses + tm.falseAlarms + tm.correctRejections, 1, 'sample of 1 still sums to 1');
  assertEqual(nf.computeConduitNaturalFrequency({}, 0).sampleSize, 100, 'invalid sample size falls back to 100');
  assertEqual(nf.computeConduitNaturalFrequency({ hazardProbability: 5 }, 10).totalThreatWatches, 10, 'rates above 1 are clamped');

  // Legacy edges: only hazardLevel, no new fields
  assertEqual(nf.computeConduitNaturalFrequency({ hazardLevel: 3 }, 100).totalThreatWatches, 30, 'hazardLevel 3 default is 30%');
  assertEqual(nf.computeConduitNaturalFrequency({ hazardLevel: 0 }, 100).totalThreatWatches, 0, 'hazardLevel 0 default is 0%');
  assertEqual(nf.computeConduitNaturalFrequency(undefined, 100).totalThreatWatches, 0, 'undefined conduit is safe');

  let conserved = true;
  assertEqual(nf.computeConduitNaturalFrequency({ hazardLevel: 4 }, 100).totalThreatWatches, 50, 'hazardLevel 4 (catastrophic) default is 50%');
  assertEqual(nf.computeConduitNaturalFrequency({ hazardLevel: 9 }, 100).totalThreatWatches, 50, 'hazardLevel above 4 clamps to 4');
  for (let lvl = 0; lvl <= 4; lvl++) for (let n = 1; n <= 37; n++) {
    const r = nf.computeConduitNaturalFrequency({ hazardLevel: lvl }, n);
    const m = r.matrix;
    if (m.hits + m.misses + m.falseAlarms + m.correctRejections !== n) conserved = false;
    if (Object.keys(m).some(k => m[k] < 0)) conserved = false;
  }
  assert(conserved, 'matrix cells are non-negative and sum to sample size across levels and sizes');
  assert(/8 of 17 alarms are real/.test(base.readableSummary), 'summary states how many alarms are real');

  // ---- Dread risk what-if ----
  const dr = require(path.join(scripts, 'dread_risk.js'));
  const mkTopo = () => ({
    nodes: {
      A: { id: 'A', adj: ['B', 'C'], odv: { s: 1, e: 2, c: 4 } },
      B: { id: 'B', adj: ['A', 'C'] },
      C: { id: 'C', adj: ['A', 'B', 'D'] },
      D: { id: 'D', adj: ['C'] }
    },
    edgeData: { 'A-B': { hazardLevel: 1 }, 'A-C': { hazardLevel: 1 }, 'B-C': { hazardLevel: 2 } }
  });
  const topo1 = mkTopo();
  const snapshot = JSON.stringify(topo1);
  const res = dr.simulateDreadRiskCascade(topo1, { sourceNodeId: 'A', severity: 10 });
  assertEqual(JSON.stringify(topo1), snapshot, 'what-if never mutates the topology');
  assertEqual(res.diversionRate, 1, 'diversion rate clamps at 1');
  const T = res.totals;
  assert(Math.abs(T.entering - (T.direct + T.served + T.unserved)) < 1e-9, 'flow conserved: entering = direct + served + unserved');
  assertEqual(T.direct, 0, 'full dread leaves no direct traffic');
  assert(T.secondaryLosses > 0 && T.primaryLosses === 0, 'all traffic diverted: losses are on detours');
  assertEqual(res.conduits.find(c => c.v === 'B').detourPath.join('>'), 'A>C>B', 'A-B detours through C');
  assert(res.detours.every(d => d.congestion >= 1), 'congestion multiplier is at least 1');
  assert(res.flaggedNodes.some(f => f.nodeId === 'C'), 'node on the detour is flagged');

  const free = { nodes: { A: { id: 'A', adj: ['B', 'C'], odv: { s: 1, e: 1, c: 4 } }, B: { id: 'B', adj: ['A', 'C'] }, C: { id: 'C', adj: ['A', 'B'] } }, edgeData: {} };
  const crowd = dr.simulateDreadRiskCascade(free, { sourceNodeId: 'A', severity: 10 });
  assert(crowd.detours.some(d => d.congestion > 1.5 && d.escalatedLevel >= 2) && crowd.totals.secondaryLosses > 0, 'crowding makes a hazard-free detour dangerous');

  const calm = dr.simulateDreadRiskCascade(mkTopo(), { sourceNodeId: 'A', severity: 0 });
  assertEqual([calm.totals.diverted, calm.detours.length, calm.flaggedNodes.length], [0, 0, 0], 'severity 0 causes no diversion');
  const mid = dr.simulateDreadRiskCascade(mkTopo(), { sourceNodeId: 'A', severity: 3, novelty: 0, odv: { s: 2, e: 2, c: 2 } });
  assert(mid.diversionRate > 0 && mid.diversionRate < 1 && mid.totals.direct > 0, 'partial dread splits traffic');
  assert(mid.totals.amplificationPct !== null && mid.totals.primaryLosses > 0, 'amplification is reported when primary losses exist');
  assertEqual(dr.dreadIndex(5, 0, { s: 0, c: 3 }), 15, 'S of 0 is guarded (treated as 1)');
  assert(isFinite(dr.simulateDreadRiskCascade(mkTopo(), { sourceNodeId: 'A', severity: 10, odv: { s: 0, e: 1, c: 4 } }).dreadIndex), 'S of 0 gives a finite dread index');

  const leaf = dr.simulateDreadRiskCascade(mkTopo(), { sourceNodeId: 'D', severity: 10, odv: { s: 1, e: 1, c: 4 } });
  assertEqual([leaf.totals.served, leaf.totals.unserved], [0, leaf.totals.diverted], 'no detour: diverted traffic is unserved, not lost');
  assert(Math.abs(leaf.totals.entering - (leaf.totals.direct + leaf.totals.served + leaf.totals.unserved)) < 1e-9, 'flow conserved with no detour');

  const tight = mkTopo(); tight.edgeData['A-C'].capacity = 10; tight.edgeData['A-C'].trafficVolume = 10;
  const capped = dr.simulateDreadRiskCascade(tight, { sourceNodeId: 'A', severity: 10 });
  assert(capped.totals.unserved > 0, 'detour capacity caps diverted flow');
  assert(Math.abs(capped.totals.entering - (capped.totals.direct + capped.totals.served + capped.totals.unserved)) < 1e-9, 'flow conserved under capacity caps');

  const blocked = mkTopo(); blocked.edgeData['B-C'].blocked = true;
  assertEqual(dr.simulateDreadRiskCascade(blocked, { sourceNodeId: 'A', severity: 10 }).conduits.find(c => c.v === 'B').detourPath.length, 0, 'blocked roads are not used as detours');

  const dashed = { nodes: { 'n-1': { id: 'n-1', adj: ['n-2', 'n-3'], odv: { s: 1, e: 1, c: 4 } }, 'n-2': { id: 'n-2', adj: ['n-1', 'n-3'] }, 'n-3': { id: 'n-3', adj: ['n-1', 'n-2'] } }, edgeData: {} };
  const dres = dr.simulateDreadRiskCascade(dashed, { sourceNodeId: 'n-1', severity: 10 });
  assert(dres.totals.served > 0 && dres.detours.length > 0, 'node ids containing hyphens work');

  let threwDr = false;
  try { dr.simulateDreadRiskCascade(mkTopo(), { sourceNodeId: 'nope' }); } catch (e) { threwDr = true; }
  assert(threwDr, 'unknown source node throws');
  assert(/Dread Cascade \(what-if\): Primary Losses: \d+ \| Secondary Detour Losses: \d+/.test(dr.formatDreadSummary(res)), 'summary line format');
};
