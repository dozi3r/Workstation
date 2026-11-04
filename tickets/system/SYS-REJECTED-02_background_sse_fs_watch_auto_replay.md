---
id: SYS-REJECTED-02
title: "REJECTED: Background SSE fs.watch Auto-Replay & Silent State Overwrite"
pipeline_tier: 0
target_surface: "server.js, workstation_persistence.js (Rejected Guardrail)"
status: rejected
category: "system_architecture"
wave: "Architecture Guardrails (Do Not Implement)"
grounded_prerequisites: ["ADR-0022 Co-Authoring Architecture and Rejected Patterns", "Phase 1 Sync Digest Modal (#modal-sync-digest)"]
grounded_yields: ["Permanent guardrail against silent mid-drag state overwrites from background file watchers"]
provides: ["Guardrail: Explicit-Sync-Digest-Only"]
requires: ["ADR: 0022-Rejected-Patterns"]
standalone_fallback: "External file updates are detected on focus/sync and presented via the non-destructive Sync Digest Modal."
---

# SYS-REJECTED-02: Background SSE `fs.watch` Auto-Replay & Silent State Overwrite (DO NOT IMPLEMENT)
*Category: system_architecture | Target Surface: `server.js`, `workstation_persistence.js` (Architecture Guardrail)*
*Status: rejected (Permanent Architectural Guardrail)*

---

## 1. Proposal Summary (Rejected)

During the review of real-time co-authoring between external IDE agents and the browser workstation, we evaluated adding a persistent Server-Sent Events (`GET /api/events`) `fs.watch` stream in `server.js` that automatically reloads `topology.json` into browser memory whenever an external agent writes to disk.

---

## 2. Why We Permanently Rejected This Pattern

1. **Destructive Race Conditions During Active Authoring**: If a human author is mid-drag on the pointcrawl canvas or typing in an NPC modal while an external CLI agent writes a multi-step change to `campaigns/<id>/topology.json`, an automatic background state reload wipes out the user's uncommitted in-memory edits or corrupts active DOM selection references.
2. **`fs.watch` Multi-Fire Noise on Windows**: Windows `fs.watch` frequently emits 2–4 rapid events per atomic write/rename cycle, triggering redundant parses and layout thrashing.
3. **Superior Shipped Alternative (`Sync Digest Modal`)**: Instead of silent background overwrites, `workstation_persistence.js` detects newer disk state on window focus or explicit sync and surfaces the **External Changes Detected (`#modal-sync-digest`)** diff summary (`+N added, ~M modified, -K removed`), giving the author explicit one-click control over when to accept external disk mutations.
