// Campaign Override Slots (SYS-ODV-04): campaign-shipped files that replace app defaults.
// UMD: used by the app (window), Node tests, and the build. Add a slot = add one entry to SLOTS.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(root);
  else Object.assign(root, factory(root));
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  // file patterns are relative to the campaign folder (also looked up under overrides/)
  const SLOTS = [
    {
      id: "odvMatrix",
      files: [/^odv\/matrix\.json$/i, /^odv_matrix\.json$/i, /^odv_matrix_.+\.json$/i],
      parse(raw) {
        const o = typeof raw === "string" ? JSON.parse(raw.replace(/^﻿/, "")) : raw;
        return o && o.matrix ? o : { matrix: o };
      },
      validate(p) {
        const cells = p && p.matrix;
        if (!cells || typeof cells !== "object") throw new Error("matrix must be an object");
        Object.keys(cells).forEach(k => {
          const m = /^\[([1-4]), ([1-4]), ([1-4])\]$/.exec(k);
          if (!m) throw new Error(`bad tag '${k}'`);
          const c = cells[k];
          if (c.tag !== undefined && c.tag !== k) throw new Error(`cell ${k} tag mismatch`);
          if (!c.archetypeName) throw new Error(`cell ${k} missing archetypeName`);
        });
        return Object.keys(cells).length < 64 ? [`${Object.keys(cells).length}/64 cells; rest fall back to built-in`] : [];
      },
      apply(p) { if (root.setCampaignOdvMatrix) root.setCampaignOdvMatrix(p); },
      clear() { if (root.setCampaignOdvMatrix) root.setCampaignOdvMatrix(null); }
    }
  ];

  // Which slot (if any) owns this campaign-relative path. Accepts an overrides/ prefix.
  function matchSlotFile(relPath, slots) {
    const rp = String(relPath).replace(/\\/g, "/").replace(/^\.?\//, "").replace(/^overrides\//i, "");
    return (slots || SLOTS).find(s => s.files.some(re => re.test(rp))) || null;
  }

  function clearCampaignOverrides(slots) {
    (slots || SLOTS).forEach(s => { try { s.clear(); } catch (e) { console.warn(`[overrides] clear ${s.id}:`, e.message); } });
  }

  // Clears every slot, then applies each present one. A bad slot is skipped, never fatal.
  // Returns [{id, status:'applied'|'skipped', warnings?, error?}].
  function applyCampaignOverrides(overrides, slots) {
    const list = slots || SLOTS;
    clearCampaignOverrides(list);
    const report = [];
    list.forEach(s => {
      if (!overrides || overrides[s.id] == null) return;
      try {
        const payload = s.parse ? s.parse(overrides[s.id]) : overrides[s.id];
        const warnings = (s.validate ? s.validate(payload) : []) || [];
        s.apply(payload);
        report.push({ id: s.id, status: "applied", warnings });
      } catch (e) {
        console.warn(`[overrides] ${s.id} skipped:`, e.message);
        report.push({ id: s.id, status: "skipped", error: e.message });
      }
    });
    return report;
  }

  return { CAMPAIGN_OVERRIDE_SLOTS: SLOTS, matchSlotFile, applyCampaignOverrides, clearCampaignOverrides };
});
