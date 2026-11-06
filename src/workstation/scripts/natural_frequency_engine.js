// Natural Frequency engine: converts conduit hazard probabilities into whole-number counts. Pure, no DOM.
// UMD: browser (window), Node tests, build.
// Authority: tickets/plans/gigerenzer_heuristics_implementation_plan.md (Proposal D)
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(root);
  else Object.assign(root, factory(root));
})(typeof window !== "undefined" ? window : globalThis, function () {
  // Used only when a conduit has no explicit hazardProbability. Index = hazardLevel 0..4 (the inspector offers 0-4).
  const HAZARD_LEVEL_BASE_RATE = [0, 0.05, 0.15, 0.30, 0.50];

  function rate(v, fallback) {
    const n = Number(v);
    if (v === undefined || v === null || v === "" || !isFinite(n)) return fallback;
    return Math.min(1, Math.max(0, n));
  }

  function baseRateFor(conduit) {
    const explicit = rate(conduit.hazardProbability, null);
    if (explicit !== null) return explicit;
    const lvl = Math.min(HAZARD_LEVEL_BASE_RATE.length - 1, Math.max(0, parseInt(conduit.hazardLevel, 10) || 0));
    return HAZARD_LEVEL_BASE_RATE[lvl];
  }

  function computeConduitNaturalFrequency(conduit, sampleSize) {
    conduit = conduit || {};
    const n = Math.max(1, Math.floor(Number(sampleSize) || 100));
    const baseRate = baseRateFor(conduit);
    const sensitivity = rate(conduit.scoutDetectionRate, 0.8);
    const falseAlarmRate = rate(conduit.scoutFalseAlarmRate, 0.1);

    // Each count is rounded once and the complement is subtracted, so every row sums exactly.
    const threat = Math.round(n * baseRate);
    const safe = n - threat;
    const hits = Math.round(threat * sensitivity);
    const misses = threat - hits;
    const falseAlarms = Math.round(safe * falseAlarmRate);
    const correctRejections = safe - falseAlarms;
    const alerts = hits + falseAlarms;

    return {
      sampleSize: n,
      totalThreatWatches: threat,
      totalSafeWatches: safe,
      matrix: { hits: hits, misses: misses, falseAlarms: falseAlarms, correctRejections: correctRejections },
      // The Gigerenzer point: of all alarms raised, how many were real.
      alertsTotal: alerts,
      readableSummary:
        "Out of " + n + " expeditions across this pass, " + threat + " meet a real hazard. " +
        "Scouts sound the alarm on " + hits + " of them and miss " + misses + ". " +
        "They also raise a false alarm on " + falseAlarms + " safe trips, so " + hits + " of " + alerts + " alarms are real."
    };
  }

  return { HAZARD_LEVEL_BASE_RATE: HAZARD_LEVEL_BASE_RATE, computeConduitNaturalFrequency: computeConduitNaturalFrequency };
});
