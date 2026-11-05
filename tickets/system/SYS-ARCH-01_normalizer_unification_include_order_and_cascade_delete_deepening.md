---
id: SYS-ARCH-01
title: "Normalizer Unification, Engine Include Order & Cascade-Delete Deepening (Architecture Review Phase 1)"
pipeline_tier: 0
target_surface: "src/workstation/scripts/ (campaign_mutation_engine.js, cad_interaction.js, entity_cascade_delete.js, state_adapter.js, campaign_exporter.js), src/workstation/template.html, test/run_tests.js"
status: ready_for_spec
triage: ready-for-agent
category: "system_architecture"
wave: "Platform Architecture: Deep Modules & Test Seams"
grounded_prerequisites: ["CampaignMutationEngine UMD kernel (ADR-0022)", "Commit 84f6332 (baseline for this brief)"]
grounded_yields: ["One normalizeSpatialPin", "Dead alias block removed", "Census-aware dossier demographics", "One reference-integrity scrub shared by delete preview and delete execution"]
provides: ["Engine: Canonical-Spatial-Pin-Normalizer", "Engine: Entity-Reference-Descriptors"]
requires: ["Engine: CampaignMutationEngine", "Surface: start.html"]
blocked_by: ["None"]
blocks: ["SYS-ARCH-02 (campaign session owner, candidate 1)", "SYS-ARCH-03 (stationing module, candidate 4)"]
standalone_fallback: "Every phase is an independent atomic commit; stopping after any phase leaves the suite green and the app working."
---

# SYS-ARCH-01: Execution brief for a coding agent

You are executing phase 1 of an architecture review of Creator Studio (Workstation 2.5). This brief merges the original review with the owner's guardrails, and **every claim below was re-checked against source at commit `84f6332`**. Where the guardrails and the code disagreed, the code wins, and the correction is called out in section 2.

Do the phases in order (A → B → C → D). Each phase is one Conventional atomic commit. Run the full suite after each phase. Stop and report if the suite goes red and you cannot explain why.

---

## 1. Ground rules (non-negotiable)

1. **Edit sources only**: `src/workstation/**`, `test/run_tests.js`, `wiki/src/files/**`. Never hand-edit `start.html` or anything else that is compiled.
2. **Single-file, zero-CORS output** (ADR-0004, ADR-0016). All scripts are inlined into **one `<script>` block** in `start.html`. Do not introduce ES modules, `import`, `fetch`, or a bundler.
3. **Dual-homed UMD for pure domain code** (ADR-0022). Domain logic goes in `campaign_mutation_engine.js`, which `require()`s in Node and attaches to `window` in the browser. Its UMD tail (lines 11-30) is where browser globals get published.
4. **Never delete the mirror globals** `nodes`, `links`, `maps`, `activeMapId`, `nodeSlottedModules`, `edgeSlottedModules` (declared with `let` in `state_adapter.js:18-38`). The mirror `nodes` is an **Array**. `Workstation.activeTopology.nodes` is a **dict keyed by id**. Mods and 43 test sandboxes depend on both.
5. **Verification commands**, run from the repo root:
   - Baseline **before any edit**, recording the pass/fail counts in your first report: `powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1`
   - After each phase: `powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1`
   - Once at the end, in the primary checkout only: `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1 --stamp-reviewed`
   - In a git worktree, follow the Source-Only Invariant: do not run `Build-Suite.ps1` and do not commit compiled bundles.
6. **Wiki notes** (AGENTS.md rule 4). For every source file you modify, update the `<!-- BEGIN_CUSTOM_NOTES -->` block in `wiki/src/files/<relPath>.md`.
7. **Lookup before grep**:
   - Use `powershell -ExecutionPolicy Bypass -File .\Find-CodebaseNode.ps1 -Symbol "<name>"` before broad searches.
   - Never read or grep `start.html`, `wiki/wiki_graph.json`, or `network/platform_audit_dashboard.html`.
   - Read large scripts in windows of 50 lines or fewer.
8. **The tests run in hand-built `vm` sandboxes.** If you make a file depend on `CampaignMutationEngine` at runtime, every sandbox that loads that file must get the engine injected. `require()` takes the Node branch of the UMD, so it does **not** publish root globals. See "Test helper" in phase A.

---

## 2. Corrections to the guardrails (verified against source)

| Guardrail claim | What the code says | Consequence for you |
| :--- | :--- | :--- |
| C2.1: `deleteEntity` only scrubs `topo.spatialPins`, not child maps | **Partly wrong.** `deleteEntity` already walks `state.maps \|\| state.activeTopology.maps` and scrubs each `m.spatialPins`, `m.nodes` and `m.links` (`campaign_mutation_engine.js:925-933`). But the UI calls it with `topo = Workstation.activeTopology`, which carries no `maps`, while the registry is the separate global `maps`. So child-map pins are scrubbed today **only by the UI duplicate** (`entity_cascade_delete.js:1033-1037`). | Pass the registry in. Don't build a new walk (phase D2). |
| C2.2: preserve the ticket audit note | **Already done.** The engine writes the identical `\n[Audit: Target <type> (<id>) was deleted on <ISO>]` note (`campaign_mutation_engine.js:846-851`). The UI copy (`entity_cascade_delete.js:984-994`) never double-writes for engine-handled types, because the engine has already retargeted the ticket to `campaign`. | Keep the UI ticket retarget **only for `map` and `module` targets**. The engine is never called for those types (`:952`). |
| C5.3: demographics is `{ groups: [...], totalPopulation }` | **Wrong.** `CONTEXT.md` and `normalizeDemographics` (`entity_core.js:964-988`) define `{ primary: {name, percentage}, minorities: [...], social_friction_notes, tags: [] }`. Test 19.10 (`run_tests.js:2918`) pins that shape. Also, line `:79` is not the bug: it is an unnormalized pass-through, while the parallel code at `:417` normalizes. | The real bug is the Obsidian node dossier at `campaign_exporter.js:1103-1110`, which only renders flat arrays. Census-shaped nodes print "Cosmopolitan / mixed frontier demographic." (phase C). |
| C6: the include-order "bug" in `template.html` | **No runtime effect.** The engine's UMD tail already publishes `formatCorridorKey`, `parseCorridorKey` and the other 10 aliases on `root`. The `state_adapter.js:1236-1264` block never runs (state_adapter is included at template line 715, the engine at 717), and it would only re-assign the same values plus an unused `CampaignStateAdapter`. Its only reader is a source-text test (`run_tests.js:7805-7806`). | Delete the block and move the engine include first, for clarity (phase B). |
| C5.1 / C5.2 (mutate in place, preserve canvas defaults) | **Correct.** Nine call sites in `cad_interaction.js` and `property_grid_inspector.js`, plus `cad_canvas_renderer.js:656`, ignore the return value. The engine's caller at `:456` does `Object.assign(normPayload, pinNorm)`, so a mutate-and-return-same-object version is drop-in there too. | Phase A as specified. |
| ADR-0018 citations | **Ambiguous.** Two files carry 0018 (isolation/clean-slate, and the sociological compendium). 0011 is also duplicated, and 0023 exists. | Cite ADRs by file name in commits and notes. Renumbering is out of scope. |

---

## 3. Phase A: one `normalizeSpatialPin`

**Today**
- `campaign_mutation_engine.js:61-78` returns a **new** object. It defaults `targetType` to `'node'`, generates an `id`, coerces `x`/`y`, defaults `label` to `'POI Pin'`, rebuilds `links` as `{type, id}`, and drops all other properties.
- `cad_interaction.js:1397-1417` **mutates in place**. It defaults `visible: true` and `locked: false`, defaults `targetType` to `'npc'`, syncs `targetType`/`targetId` from `links[0]`, and publishes `window.normalizeSpatialPin`.

**Do**
1. Rewrite the engine's `normalizeSpatialPin(pin)` to **mutate `pin` in place and return the same `pin`**:
   - Return `null` for a non-object.
   - `id`: fill via `generateMonotonicId('pin')` only if missing.
   - `x`, `y`: `Number(...) || 0`.
   - `label`: `String(pin.label || pin.name || 'POI Pin')`.
   - `visible`: `true` if `undefined`. `locked`: `false` if `undefined`.
   - `links`: if it isn't an array, build `[]`, then push `{type: targetType, id: String(targetId)}` when both are present. If it is an array, **keep each link object** (don't rebuild it), but coerce `id` to `String` and default a missing `type` to `'node'`.
   - Sync `targetType`/`targetId` from `links[0]` when links exist. Otherwise default `targetType` to **`'npc'`** (the canvas default, used on every non-engine path) and `targetId` to `''`.
   - Never delete unknown properties (`color`, `notes`, mod-injected fields).
2. Publish it from the UMD tail: `root.normalizeSpatialPin = root.CampaignMutationEngine.normalizeSpatialPin;`. It is already in the export list at `:2462`.
3. Delete the local `function normalizeSpatialPin` and `window.normalizeSpatialPin = ...` in `cad_interaction.js:1396-1417`. Its call sites resolve to the global. Confirm no other local shadow remains (`Find-CodebaseNode.ps1 -Symbol normalizeSpatialPin`).
4. **Test helper.** In `test/run_tests.js`, add one function, `injectEngine(sandbox)`. It `require()`s the engine and sets `sandbox.CampaignMutationEngine`, `sandbox.CreatorStudio = { ai: engine }`, and the same root aliases the UMD tail publishes, including `normalizeSpatialPin`. Call it in every sandbox that loads `cad_interaction.js`, `cad_canvas_renderer.js` or `property_grid_inspector.js` and now fails.
5. **New tests**, through the engine's `require()` seam with no DOM:
   - Returns the same reference.
   - Preserves `color`/`notes`.
   - Defaults `visible`/`locked`.
   - Legacy `targetType`/`targetId` turns into `links`.
   - `links[0]` drives `targetType`/`targetId`.
   - A link object keeps its extra fields.
   - Non-object returns `null`.

**Watch for:** engine upserts of existing pins will now also record `visible`/`locked` field diffs in the changelog. If a changelog-count assertion breaks, verify the new count is correct before updating it.

Commit: `refactor(engine): unify normalizeSpatialPin as in-place canonical normalizer (SYS-ARCH-01)`

---

## 4. Phase B: engine first, dead alias block gone

1. In `src/workstation/template.html`, move `// @@INCLUDE: scripts/campaign_mutation_engine.js @@` (line ~717) above `// @@INCLUDE: scripts/map_store.js @@` (line ~713). The engine has no dependencies, so putting it first is safe. Check `build_suite.js` does not order includes independently of the template.
2. Delete `state_adapter.js:1236-1264` (the `if (typeof CampaignMutationEngine !== "undefined")` block and `window.CampaignStateAdapter`). Confirm `CampaignStateAdapter` has no readers in `src/` or `mods/` first. The grep at `84f6332` found none.
3. Replace the source-text assertions at `run_tests.js:7805-7806` with a behavior check: after `injectEngine`, `getNodesList` and `ensureQueryableNodesCollection` are functions on the sandbox.

Commit: `refactor(workstation): include engine first and drop dead CampaignStateAdapter aliases (SYS-ARCH-01)`

---

## 5. Phase C: census-aware dossier demographics

1. `campaign_exporter.js:1101-1110`: render through `getDemographicNames()`, or better, `normalizeDemographics()`, so you can show `primary.name` (`percentage`%), each minority (`name`, `percentage`%), then `tags`. Keep the "Cosmopolitan" fallback only when everything is empty. Use the same `typeof … === 'function'` guard style as `:417`.
2. `campaign_exporter.js:79`: normalize the same way `:417` does.
3. Test: a census-shaped node renders its primary and minority names in the node markdown. A flat array still renders.

Commit: `fix(export): render census demographics in obsidian node dossier (SYS-ARCH-01)`

---

## 6. Phase D: one reference-integrity scrub

**Goal:** `CampaignMutationEngine.deleteEntity` is the only scrub for entity types (`npc`, `quest`, `item`, `tracker`, `faction`, `node`). The delete **preview** and the **scrub** read one set of reference rules. The UI keeps only the work the engine does not do.

### D1: make the tests engine-aware first (no production change)

The cascade suites build sandboxes **without** the engine:
- Suite 4 at `run_tests.js:510-590`.
- Probably also the sandboxes at ~1878, ~4664, ~4842 and ~6194. Check each one.

In those sandboxes the `cme` branch at `entity_cascade_delete.js:949-956` is skipped, and the UI duplicate does all the work. Call `injectEngine(sandbox)` in each one, and confirm the suite is still green **before** you remove anything. This proves the engine path covers what those tests assert.

### D2: pass the map registry into the engine

1. In `deleteEntity`, read an optional `batchContext.maps` and walk it **in addition to** `state.maps` / `state.activeTopology.maps`. Each pass is idempotent.
2. In `executeEntityDeletion`, call `cme.deleteEntity(topo, ent.type, ent.id, { allowMissingEntity: true, maps: (typeof maps !== 'undefined' ? maps : undefined) })`.
3. Engine test: an NPC linked from a pin on a **child** map, passed via `batchContext.maps`, is scrubbed.

### D3: one table of reference descriptors

1. Inside the engine, extract the reference fields that `deleteEntity` scrubs into one declarative table:
   - which collection, which field or nested path, which target type
   - the operation: null it, filter it, or retarget it
2. Drive both the scrub and a new exported read-only query from that table. A suggested name is `findEntityReferences(state, type, id, { maps })`, returning a list of `{ collection, entityId, field }`.
3. Do not change scrub behavior in this step. Every existing `deleteEntity` assertion (suite 44, `run_tests.js:7436-7480`) must stay green unchanged.
4. Rewire `analyzeEntityDependencies` (`entity_cascade_delete.js:17-366`) to take its id-based referrers from that query.
5. **Keep** the name-substring heuristics (`q.motivation`/`q.notes` at ~:119, `q.threat` at ~:129), but report them as a distinct "mentions (not scrubbed)" group so the preview no longer implies they will be removed.
6. Keep the map/portal and module sections of the preview (`:310-366`) as they are.
7. Parity test: for a fixture with every reference kind, the set of id-based referrers from `analyzeEntityDependencies` equals what `deleteEntity` actually changes (compare against its `changes` output).

### D4: trim the UI duplicate

In `executeEntityDeletion`, **remove** only what the engine now provably covers:

| Remove | Lines (at `84f6332`) | Why it's safe |
| :--- | :--- | :--- |
| Per-collection `.filter` for npcs, quests, items, trackers, factions | 958-981 | Engine removes the entity from its collection |
| Tracker `triggerRefs` filter | 997-1008 | Engine `:792-797` |
| Pin scrub for entity types | 1010-1037 | Engine `:855-885` + `:931` with D2 |
| Quest `trackerIds` / `steps[].triggerTrackerId` and the rest of section 7 that duplicates engine fields | 1253-1335. Diff field by field against the engine before you delete anything. | Engine `:709-736` and the table from D3 |

**Keep** in the UI (the engine is never called for these, or they are UI concerns):
- `deletedPrototypes`/`deletedModules` bookkeeping (`:915-933`).
- The `nodeChildMapSnapshot`.
- Sub-map deletion, reparenting and `deletePersistedMapFromDB` (`:1039-1150`).
- Module deletion, including the `dedicatedFlows` purge (`:1151-1252`).
- Ticket retargeting with the audit note **for `map`/`module` targets only**.
- Pin-link scrubbing for `map`/`submap` link types only.
- Persist and refresh (`:1336+`).

**Source-text tests that will break** (convert each to a behavior assertion through the sandbox or the engine; don't just delete it):
- `run_tests.js:6619` (`sanitizePinArray(topo.spatialPins)`).
- `run_tests.js:6645-6646` (`q.trackerIds.filter`, `st.triggerTrackerId && deletedIdsByType.tracker.has`).
- `run_tests.js:7692` (`CampaignMutationEngine.removeCorridorsForNode` in the cascade file): keep that call if it is still there.

**Dead fallback:** the fallback branch in `entity_core.js:910-924` (`removeEntityFromCampaign`, used only if `promptEntityDelete` is undefined) filters 4 collections and scrubs nothing. Replace it with a call to `CampaignMutationEngine.deleteEntity` with `maps` passed. Don't leave a second, weaker encoding behind.

Commits, one per sub-phase:
- `test(cascade): inject engine into cascade sandboxes`
- `feat(engine): deleteEntity accepts map registry`
- `refactor(engine): declarative entity reference descriptors shared by preview and scrub`
- `refactor(cascade): remove duplicate scrub now owned by engine`

All four end with `(SYS-ARCH-01)`.

---

## 7. Definition of done

- [ ] `Test-Suite.ps1` is green after every phase, with no fewer passing assertions than the baseline. Any converted source-text assertions are listed in your report.
- [ ] `normalizeSpatialPin` has exactly one definition (in the engine).
- [ ] `entity_cascade_delete.js` no longer filters the five entity collections or scrubs entity-type pins, triggerRefs or tickets. It still handles maps, modules, IndexedDB and UI.
- [ ] For entity types, the preview's id-based referrers and the engine's scrub come from one table, and a parity test proves it.
- [ ] The node dossier renders census demographics.
- [ ] Wiki custom notes are updated for each touched source. `Build-Suite.ps1 --stamp-reviewed` has run once in the primary checkout.
- [ ] The manual smoke test is done in `start.html` via `file:///`:
  - Delete an NPC that is pinned on a child map: the pin link is gone after reload.
  - Delete a submap that a ticket targets: the ticket is retargeted to campaign with the audit note.
  - Drag-create a pin: it is visible and unlocked.

## 8. Out of scope (later tickets)

- **Candidate 1, campaign session owner (SYS-ARCH-02)**: covers `resetWorkstationSlate` leaks (`waves`, `drawnCards`, `blockedEdges`, `wikiIndex`, `moduleSeveranceClocks`, `fogOfWarMode`, `activeCampaignId`), one map-record shape, and one dispatcher for the Campaign Mod Lifecycle. `onCampaignRenamed` has no emitter in `src/`; check `mods/`. Mirror globals stay, synced through one seam. Read `0007-…` and `0018-campaign-state-isolation-…` first.
- **Candidate 4, stationing module (SYS-ARCH-03)**: covers the duplicate `getItemEffectiveNodeId` (`entity_core.js:8`, `cad_canvas_renderer.js:339`), the `getRecursiveNodeEntities` predicate written twice, and the strict-equality `n.id === nId`.
- **Candidate 3**, the human-edit commit step: needs a decision on ADR-0022's changelog scope first.
- Any other Corridor Key outliers (`campaign_exporter.js:1528`, `wiki_engine.js:223`, `ticket_center.js:587`).
- ADR renumbering.

## Comments
