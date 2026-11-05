---
id: SYS-ODV-04
title: "Campaign Override Slots (generalize SYS-ODV-03 matrix overlay)"
pipeline_tier: 0
target_surface: "src/workstation/scripts/campaign_override_slots.js, build_suite.js, state_adapter.js, map_store.js, selective_importer.js, scripts/test_suite.js, test/run_tests.js, CONTEXT.md"
status: ready_for_spec
triage: ready-for-agent
category: "system_architecture"
wave: "Platform Architecture: Data Integrity"
grounded_prerequisites: ["Commit bdbcd95 (SYS-ODV-03 matrix overlay)"]
grounded_yields: ["Slot registry", "Runtime override discovery", "Validator per slot"]
provides: ["Engine: Campaign-Override-Slots"]
requires: ["Surface: start.html"]
blocked_by: ["None"]
---

# Campaign Override Slots

A campaign may ship files that replace app defaults. Each replaceable thing is a **slot**:
`{ id, files:[names], parse, validate, apply(payload), clear() }`. One routine,
`applyCampaignOverrides(overrides)`, clears all slots then applies each present one.
A bad slot warns and is skipped (validator `--strict` fails). It returns a report
(applied / fell back / why). Payload shape: `campaign.overrides = { odvMatrix: {...} }`.
Slot list lives in one UMD file `campaign_override_slots.js` read by the build, app and validator.
First slot: `odvMatrix` (files: `odv/matrix.json`, `odv_matrix.json`, `odv_matrix_*.json`; wraps `setCampaignOdvMatrix`).
Also accept an `overrides/` subfolder for future slots.

## Sessions (sequential; each ends green and committed)

1. **S1 Slot core.** New script, registry, `applyCampaignOverrides`, `clearCampaignOverrides`, report; register `odvMatrix`. Tests: apply, clear, bad payload skipped, one slot failing leaves others intact.
2. **S2 Build side.** `build_suite.js` discovers via the slot list, writes `registry[k].overrides`; generated `network/campaign_odv_matrices.js` derives from it. Krynn output unchanged.
3. **S3 Load side.** `loadCampaignProjectPackage` calls `applyCampaignOverrides` (replace the matrix lines). `loadCampaignFromDirectoryHandle` and package import scan slot filenames into `pkg.overrides`, so picked folders apply with no rebuild.
4. **S4 Validator + docs.** `scripts/test_suite.js` validates via each slot; ADR; `CONTEXT.md` term "Campaign Override Slot"; SRD and preset-builder skill notes.
