// Fast-and-Frugal Tree (FFT) evaluator. Pure, no DOM. UMD: browser (window), Node tests, build.
// A tree has M ordered cues; each cue has one immediate exit. If no cue exits, defaultExit applies (M+1 exits).
// Authority: tickets/plans/gigerenzer_heuristics_implementation_plan.md (Proposal A)
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(root);
  else Object.assign(root, factory(root));
})(typeof window !== "undefined" ? window : globalThis, function () {
  const FFT_TEST_TYPES = ["boolean_query", "faction_standing", "item_check", "disposition_threshold", "gold_threshold"];

  // Returns an array of error strings; empty means valid.
  function validateFft(fft) {
    const errors = [];
    if (!fft || typeof fft !== "object") return ["fft must be an object"];
    if (!Array.isArray(fft.cues) || fft.cues.length === 0) errors.push("fft.cues must be a non-empty array");
    const seen = new Set();
    (fft.cues || []).forEach((cue, i) => {
      const at = "cues[" + i + "]";
      if (!cue || typeof cue !== "object") { errors.push(at + " must be an object"); return; }
      if (!cue.id) errors.push(at + " is missing id");
      else if (seen.has(cue.id)) errors.push(at + " duplicate id '" + cue.id + "'");
      else seen.add(cue.id);
      if (FFT_TEST_TYPES.indexOf(cue.testType) === -1) errors.push(at + " has unknown testType '" + cue.testType + "'");
      if (cue.exitDirection !== "yes" && cue.exitDirection !== "no") errors.push(at + " exitDirection must be 'yes' or 'no'");
      if (!cue.exitAction) errors.push(at + " is missing exitAction");
    });
    if (!fft.defaultExit || !fft.defaultExit.action) errors.push("fft.defaultExit.action is required");
    return errors;
  }

  // Does the cue's condition hold for this context? (Not yet interpreted as an exit.)
  function testCue(cue, ctx) {
    const items = ctx.partyItems || [];
    const standings = ctx.factionStandings || {};
    const answers = ctx.queryAnswers || {};
    switch (cue.testType) {
      case "boolean_query":
        return Boolean(answers[cue.id]) === Boolean(cue.targetValue);
      case "item_check":
        return items.some(function (it) { return String(it) === String(cue.targetValue); });
      case "gold_threshold":
        return Number(ctx.partyGold || 0) >= Number(cue.targetValue);
      case "disposition_threshold":
        return Number(ctx.disposition || 0) >= Number(cue.targetValue);
      case "faction_standing": {
        const t = cue.targetValue || {};
        return Number(standings[t.factionId] || 0) >= Number(t.min || 0);
      }
      default:
        throw new Error("Unknown FFT testType: " + cue.testType);
    }
  }

  function evaluateFastAndFrugalTree(fft, ctx) {
    const errors = validateFft(fft);
    if (errors.length) throw new Error("Invalid FFT: " + errors.join("; "));
    ctx = ctx || {};
    const total = fft.cues.length;
    const trace = [];
    for (let i = 0; i < total; i++) {
      const cue = fft.cues[i];
      const holds = testCue(cue, ctx);
      trace.push({ cueId: cue.id, holds: holds });
      if ((holds ? "yes" : "no") === cue.exitDirection) {
        return {
          resolved: true, action: cue.exitAction, label: cue.exitLabel || cue.exitAction,
          cueTriggered: cue, stepIndex: i, cuesInspected: i + 1, totalCues: total,
          frugality: 1 - (i + 1) / total, trace: trace
        };
      }
    }
    return {
      resolved: true, action: fft.defaultExit.action, label: fft.defaultExit.label || fft.defaultExit.action,
      cueTriggered: null, stepIndex: total, cuesInspected: total, totalCues: total,
      frugality: 0, trace: trace
    };
  }

  return { FFT_TEST_TYPES: FFT_TEST_TYPES, validateFft: validateFft, evaluateFastAndFrugalTree: evaluateFastAndFrugalTree };
});
