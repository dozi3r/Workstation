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
  for (let lvl = 0; lvl <= 3; lvl++) for (let n = 1; n <= 37; n++) {
    const r = nf.computeConduitNaturalFrequency({ hazardLevel: lvl }, n);
    const m = r.matrix;
    if (m.hits + m.misses + m.falseAlarms + m.correctRejections !== n) conserved = false;
    if (Object.keys(m).some(k => m[k] < 0)) conserved = false;
  }
  assert(conserved, 'matrix cells are non-negative and sum to sample size across levels and sizes');
  assert(/8 of 17 alarms are real/.test(base.readableSummary), 'summary states how many alarms are real');
};
