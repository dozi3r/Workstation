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

  // ---- Presets (Phase 2) ----
  const FFT_PRESETS = {
    sentry_triage: {
      name: "Emergency Sentry Triage", purpose: "Fight, detain or pass travelers at a checkpoint",
      cues: [
        { id: "weapons_drawn", label: "Party has drawn weapons or active war magic?", testType: "boolean_query", targetValue: true, exitDirection: "yes", exitAction: "ATTACK_HOSTILE", exitLabel: "Sound alarm and engage" },
        { id: "official_writ", label: "Carries an official writ or seal?", testType: "item_check", targetValue: "writ", exitDirection: "yes", exitAction: "GRANT_PASSAGE", exitLabel: "Salute and open the gate" },
        { id: "can_pay_toll", label: "Can pay the entry levy?", testType: "gold_threshold", targetValue: 50, exitDirection: "no", exitAction: "REFUSE_ENTRY", exitLabel: "Turn away" }
      ],
      defaultExit: { action: "GRANT_PASSAGE_WITH_ESCORT", label: "Allow entry under armed escort" }
    },
    bail_ransom: {
      name: "Bail / Ransom Determination", purpose: "Release a prisoner or hold them indefinitely",
      cues: [
        { id: "kin_in_power", label: "Prisoner is kin to someone in authority?", testType: "boolean_query", targetValue: true, exitDirection: "yes", exitAction: "RELEASE", exitLabel: "Release quietly" },
        { id: "ransom_paid", label: "Can the ransom be paid?", testType: "gold_threshold", targetValue: 100, exitDirection: "yes", exitAction: "RELEASE_ON_RANSOM", exitLabel: "Release on ransom" }
      ],
      defaultExit: { action: "HOLD_INDEFINITELY", label: "Hold in the dungeon" }
    },
    trade_parley: {
      name: "Trade Parley Protocol", purpose: "Accredit, tariff or seize a trading party",
      cues: [
        { id: "contraband", label: "Carrying contraband?", testType: "boolean_query", targetValue: true, exitDirection: "yes", exitAction: "SEIZE_GOODS", exitLabel: "Seize cargo" },
        { id: "guild_standing", label: "In good standing with the guild?", testType: "faction_standing", targetValue: { factionId: "guild", min: 1 }, exitDirection: "yes", exitAction: "ACCREDIT", exitLabel: "Accredit and trade freely" }
      ],
      defaultExit: { action: "APPLY_TARIFF", label: "Allow trade with a tariff" }
    },
    contagion_inspection: {
      name: "Contagion / Infiltration Inspection", purpose: "Burn, quarantine or cleanse arrivals",
      cues: [
        { id: "visible_plague", label: "Shows visible signs of plague?", testType: "boolean_query", targetValue: true, exitDirection: "yes", exitAction: "BURN", exitLabel: "Burn belongings and isolate" },
        { id: "cleansing_rite", label: "Carries proof of a cleansing rite?", testType: "item_check", targetValue: "cleansing_token", exitDirection: "yes", exitAction: "CLEANSE_PASS", exitLabel: "Pass" }
      ],
      defaultExit: { action: "QUARANTINE", label: "Hold in quarantine for observation" }
    }
  };

  function createDefaultFft(templateType) {
    const src = FFT_PRESETS[templateType] || FFT_PRESETS.sentry_triage;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = "fft_" + (FFT_PRESETS[templateType] ? templateType : "sentry_triage");
    return copy;
  }

  // ---- Pure editing helpers (return a new tree; never mutate the input) ----
  function cloneFft(fft) { return JSON.parse(JSON.stringify(fft)); }

  function moveCue(fft, index, delta) {
    const out = cloneFft(fft);
    const j = index + delta;
    if (index < 0 || index >= out.cues.length || j < 0 || j >= out.cues.length) return out;
    const tmp = out.cues[index]; out.cues[index] = out.cues[j]; out.cues[j] = tmp;
    return out;
  }

  function addCue(fft, cue) {
    const out = cloneFft(fft);
    let id = (cue && cue.id) || "cue";
    const ids = new Set(out.cues.map(function (c) { return c.id; }));
    let n = 1, candidate = id;
    while (ids.has(candidate)) candidate = id + "_" + (++n);
    out.cues.push(Object.assign({ testType: "boolean_query", targetValue: true, exitDirection: "yes", exitAction: "EXIT" }, cue, { id: candidate }));
    return out;
  }

  function removeCue(fft, index) {
    const out = cloneFft(fft);
    if (index >= 0 && index < out.cues.length) out.cues.splice(index, 1);
    return out;
  }

  return {
    FFT_TEST_TYPES: FFT_TEST_TYPES, FFT_PRESETS: FFT_PRESETS,
    validateFft: validateFft, evaluateFastAndFrugalTree: evaluateFastAndFrugalTree,
    createDefaultFft: createDefaultFft, moveCue: moveCue, addCue: addCue, removeCue: removeCue
  };
});
