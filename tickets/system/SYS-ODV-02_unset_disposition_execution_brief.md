---
id: SYS-ODV-02
title: "Execution Brief: Unset [S, E, C] Disposition (SYS-ODV-01, six agent sessions)"
pipeline_tier: 0
target_surface: "src/workstation/scripts/, network/odv_archetype_matrix.html, tools/, tools/krynn/compiler/, campaigns/**, test/run_tests.js, campaigns/Test-CampaignPackage.ps1, CONTEXT.md, docs/adr/"
status: ready_for_spec
triage: ready-for-agent
category: "system_architecture"
wave: "Platform Architecture: Data Integrity"
grounded_prerequisites: ["SYS-ODV-01 (design and owner decisions)", "Commit 402bcd3 (line anchors)"]
grounded_yields: ["getOdv resolver", "No fake ODV writes", "Visible unset state", "Unknown-aware consumers", "Migrated campaign data", "Validator and docs"]
provides: ["Engine: Canonical-ODV-Resolver", "Validator: ODV-Integrity-Check"]
requires: ["Engine: CampaignMutationEngine", "Surface: start.html"]
blocked_by: ["None"]
blocks: []
standalone_fallback: "Each session ends green and committed. Stopping after any session leaves a working app."
---

# SYS-ODV-02: Execution brief

## 1. Executive summary

Six sessions (S1 to S6), each sized for one agent run. Run them in order. Start each session fresh and tell the agent: **"Execute session SN of tickets/system/SYS-ODV-02_unset_disposition_execution_brief.md."** The agent reads section 2 and its own session only. Rationale and the survey live in `SYS-ODV-01`; do not read it unless a step is unclear.

## 2. Rules for every session

1. **Do not explore.** Every edit site is listed. Line numbers are from commit `402bcd3` and drift after edits: locate each site with `Grep` on the quoted anchor text, then `Read` at most 40 lines around it. Never read a whole file over 300 lines.
2. **Never read or edit compiled output**: `start.html`, `wiki/pages/**`, `wiki/wiki_graph.json`, `network/platform_audit_dashboard.html`. `network/odv_archetype_matrix.html` is hand-maintained source, not compiled; it is in scope for S4 only.
3. **No new dependencies, no `fetch`, no ES modules.** Plain functions on `window`, same as the rest of `sociology_data.js`.
4. **Canonical model** (all sessions):
   - `entity.odv` is `{ s, e, c }` with integers 1..4, or absent. Absent means **unset**.
   - `entity.odvSource` is `"authored" | "imported" | "mod"`, present only when `odv` is present.
   - `npc.disposition` is never an ODV. Party standing lives only in `dispositionToParty`.
   - Never write the literal fallback `|| 2` (or `|| 1`) on an S/E/C value again.
5. **Verify** at the end of each session:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1
   ```
   If it fails and the cause is not obvious in two attempts, stop and report the failing assertion.
6. **Commit** at the end of each session, in this order (matches repo history):
   - Source: `git add` only the files you edited; Conventional message given in the session.
   - Then `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1 --stamp-reviewed`, then `git add -A` and commit `build: recompile suite distributions`, then commit any remaining wiki output as `docs(wiki): regenerate wiki pages, graph and manifest`.
7. **Wiki notes**: for each source file you edit, add one bullet to the `<!-- BEGIN_CUSTOM_NOTES -->` block of `wiki/src/files/<relPath>.md` describing the ODV change. One line each; no prose essays.
8. Use `git diff --stat` to check your work, not re-reads.

---

## S1: Canonical resolver (display unchanged)

**Goal:** add `getOdv`, `getEdgeOdv`, `getNodeQuadrant`, `normalizeOdvInput`; rebuild `resolveNodeOdv` on top of them with identical output for valid data. The only intended data change: importers and the mutation engine stop *storing* `[2,2,2]` for entities that arrive without an ODV. The canvas still shows the old fallback values until S4.

**File: `src/workstation/scripts/sociology_data.js`**

1. Insert above `function resolveNodeOdv(node, fallbackIndex) {` (≈1278):
   ```js
   // Canonical ODV reader (SYS-ODV-01). Never invents a value.
   function normalizeOdvInput(raw) {
     if (raw === undefined || raw === null || raw === "" || typeof raw === "number") return null;
     let v = null;
     if (Array.isArray(raw)) v = raw.slice(0, 3);
     else if (typeof raw === "string") { const m = raw.match(/(-?\d+)\D+(-?\d+)\D+(-?\d+)/); if (m) v = [m[1], m[2], m[3]]; }
     else if (typeof raw === "object") v = [raw.s, raw.e, raw.c];
     if (!v || v.length < 3) return null;
     const n = v.map(x => Number(x));
     if (n.some(x => !Number.isInteger(x) || x < 1 || x > 4)) return { invalid: true, raw };
     return { s: n[0], e: n[1], c: n[2] };
   }

   function getOdv(entity) {
     const unset = (source) => ({ set: false, s: null, e: null, c: null, tag: null, source });
     if (!entity) return unset("unset");
     let raw = entity.odv;
     if (raw === undefined || raw === null) raw = (typeof entity.disposition === "number") ? undefined : entity.disposition;
     const v = normalizeOdvInput(raw);
     if (!v) return unset("unset");
     if (v.invalid) return unset("invalid");
     return { set: true, s: v.s, e: v.e, c: v.c, tag: `[${v.s}, ${v.e}, ${v.c}]`, source: entity.odvSource || "imported" };
   }

   function getEdgeOdv(edge, uOdv, vOdv, edgeRecord) {
     const own = getOdv(edge && (edge.odv || edge.disposition) ? edge : edgeRecord);
     const bothSet = !!(uOdv && uOdv.set !== false && uOdv.s && vOdv && vOdv.set !== false && vOdv.s);
     const totalDelta = bothSet ? Math.abs(uOdv.s - vOdv.s) + Math.abs(uOdv.e - vOdv.e) + Math.abs(uOdv.c - vOdv.c) : null;
     if (own.set) return { ...own, explicit: true, totalDelta, isHighHazard: totalDelta !== null && totalDelta >= 5 };
     if (!bothSet) return { set: false, s: null, e: null, c: null, tag: null, source: "unset", explicit: false, totalDelta: null, isHighHazard: false };
     const s = Math.round((uOdv.s + vOdv.s) / 2), e = Math.round((uOdv.e + vOdv.e) / 2), c = Math.round((uOdv.c + vOdv.c) / 2);
     return { set: true, s, e, c, tag: `[${s}, ${e}, ${c}]`, source: "midpoint", explicit: false, totalDelta, isHighHazard: totalDelta >= 5 };
   }

   // Authored culture wins; else derive from a set ODV; else null (unknown).
   function getNodeQuadrant(node) {
     if (!node) return null;
     if (node.culture) return node.culture;
     const o = getOdv(node);
     return o.set ? deriveCvfQuadrant(o.s, o.e) : null;
   }
   ```
2. Rewrite the parsing half of `resolveNodeOdv` to use `getOdv`: if `getOdv(node).set`, return `{ s, e, c, tag, explicit: true }`. Otherwise keep the **existing** fallback block (mod resolver, culture table, `[2,2,2]`) unchanged and return `explicit: false`. Delete the old array/object/string parsing branches. Keep the final clamp.
3. Leave `resolveEdgeOdv` as is in S1.
4. Export the four new functions in both export blocks (≈1917 `window.resolveNodeOdv = ...` and ≈1950 `module.exports`).

**Fix argument mix-up** (`fallbackIndex` receives `topo`): change `resolveNodeOdv(n, activeTopo)` → `resolveNodeOdv(n)` at `campaign_exporter.js` ≈1499 and ≈1713, `resolveNodeOdv(u, topo)` / `resolveNodeOdv(v, topo)` → no second arg at `cad_canvas_renderer.js` ≈891-892, and `resolveNodeOdv(node, topo)` at `sociology_data.js` ≈1758 and ≈1898.

**Replace duplicate normalizers with the canonical reader:**
- `src/workstation/scripts/campaign_mutation_engine.js` ≈43 `function normalizeOdv(val) {`: body becomes: if `window.normalizeOdvInput` exists use it and return the `{s,e,c}` or `null` (also `null` on `invalid`); otherwise inline the same logic (the engine is UMD and also runs under node tests, so keep a local copy rather than depending on `window`). **Callers must handle `null`:**
  - ≈113 `if (!npc.odv || Array.isArray(npc.odv)) npc.odv = normalizeOdv(npc.odv || npc.disposition);` → compute `const o = normalizeOdv(npc.odv !== undefined ? npc.odv : (typeof npc.disposition === 'number' ? null : npc.disposition));` then `if (o) npc.odv = o; else delete npc.odv;`
  - ≈115-117 and ≈442-444: **delete** the blocks that copy `dispositionToParty` into `disposition`. If `typeof npc.disposition === 'number'` and `dispositionToParty === undefined`, move it: `npc.dispositionToParty = npc.disposition; delete npc.disposition;`
  - ≈197 `f.odv = normalizeOdv(f.odv || f.disposition);` → same set-or-delete pattern.
  - ≈1452-1466: `curOdv` may be `null`; when a change supplies an ODV, set `targetObj.odv = next; targetObj.odvSource = 'authored';` and stop writing `targetObj.disposition`.
- `src/workstation/scripts/selective_importer.js` ≈395-405 and ≈477-493: same set-or-delete pattern via a local copy of `normalizeOdvInput`; tag `odvSource = 'imported'` when set; apply the NPC scalar `disposition` → `dispositionToParty` move; delete the copy at ≈403-405.
- `src/workstation/scripts/state_adapter.js` ≈672 `normalizeOdvVector`: replace the `: 2` defaults with `normalizeOdvInput`; return `undefined` when null or invalid. Remove the `odvDefault` fallback argument at ≈771 and ≈874 (no producer of `odvDefault` exists in `src/` or `tools/`).

**Tests (`test/run_tests.js`)**: add a block right after the `resolveNodeOdv` assertions (≈2283) using the same `sandbox`:
- `getOdv({})` → `set:false, source:'unset'`; `getOdv({odv:null})` → unset; `getOdv({odv:[0,1,2]})` → `source:'invalid'`; `getOdv({odv:[9,9,9]})` → invalid; `getOdv({odv:'[1, 3, 4]'})` → tag `[1, 3, 4]`; `getOdv({odv:{s:4,e:1,c:3}, odvSource:'authored'})` → `source:'authored'`; `getOdv({disposition:1})` → unset (NPC scalar is not an ODV); `getOdv({disposition:[3,3,3]})` → set.
- `getEdgeOdv(null, {set:true,s:1,e:1,c:1}, {set:false}, null)` → `set:false, totalDelta:null, isHighHazard:false`.
- `getNodeQuadrant({culture:'Clan'})` → `'Clan'`; `getNodeQuadrant({})` → `null`.
- Existing assertions must still pass unchanged.

**Commit:** `refactor(odv): add canonical getOdv resolver and stop coercing 0 to 2`

---

## S2: Stop writing fake values

**Goal:** no code path writes an ODV or culture the user did not choose.

1. `property_grid_inspector.js` ≈1150-1157 (anchor `// [S,E,C] Tri-State Vector & Archetype`): replace `curS/curE/curC` and the `if (!node.odv ...) node.odv = {...}` assignment with `const o = getOdv(node);`. Do not assign `node.odv` during render. Delete the `drawnCards` tarot fallback here (tarot is a mod resolver concern, not inspector state).
2. Same block, the three `appendSelectPropRow` calls for S/E/C (≈1181-1195): prepend option `{ val: '', label: '— Unset —' }`; current value is `o.set ? o.s : ''`. Handler:
   ```js
   val => {
     if (val === '') { delete node.odv; delete node.odvSource; }
     else {
       const cur = getOdv(node);
       node.odv = cur.set ? { s: cur.s, e: cur.e, c: cur.c } : { s: null, e: null, c: null };
       node.odv.s = parseInt(val, 10);   // .e / .c in the other two handlers
       if (node.odv.s && node.odv.e && node.odv.c) node.odvSource = 'authored';
     }
     saveActiveCampaign(); updatePropertiesGrid();
   }
   ```
   A partly filled vector (`{s:3,e:null,c:null}`) is invalid by design, so `getOdv` reports unset until all three are chosen. That is the intended behaviour.
3. Same block: `Disposition Vector` row shows `o.set ? o.tag : 'Unset'`; `64-Cell Archetype`, `Core Boon`, `Core Burden` rows render only when `o.set`. `[Sync Quadrant]` action is disabled (status-bar message "Set S, E and C first") when `!o.set`.
4. ≈1119 Culture Quadrant select: prepend `{ val: '', label: '— Unset —' }`, current value `node.culture || ''`, handler `if (val) node.culture = val; else delete node.culture;`. Same for Operational Profile ≈1125 (`node.opProfile`).
5. NPC block ≈2650 (anchor `const disp = Array.isArray(npc.disposition) ? npc.disposition : [2, 2, 2];`) and faction block in `entity_manager_ui.js` ≈2601 (anchor `const disp = Array.isArray(facObj.disposition)`): read via `getOdv`, show `Unset` when not set, never default to `[2,2,2]`.
6. `entity_crud_dialogs.js`:
   - ≈486 (`ee-npc-odv-s`) and ≈560-563 (`ee-faction-odv-*`): populate from `getOdv(entity)`; empty string when unset. Ensure each of the six `<select>`s in `src/workstation/modals/entity_modals.html` has a first `<option value="">— Unset —</option>` (grep `ee-npc-odv-` and `ee-faction-odv-`).
   - ≈697 and ≈808 (`entity.disposition = [` / `newEntity.disposition = [`): read the three selects; if all three are non-empty set `odv = {s,e,c}` and `odvSource = 'authored'`, else delete `odv`. Stop writing `disposition` for factions.
7. `cad_interaction.js` ≈2218 and ≈2258: remove `odv: { s: 2, e: 2, c: 2 }, disposition: [2, 2, 2]` from the new NPC and new faction literals. In the faction literal also remove `cvfQuadrant: 'Clan', culture: 'Clan', quadrant: 'Clan'`.
8. `entity_core.js` ≈1169 `disposition: [2, 2, 2],`: remove.
9. `state_adapter.js` ≈427-429 `createMap`: first node gets `culture` only when `dispositionModifier` is one of the four quadrants; otherwise omit the property (do not default to `Hierarchy`).
10. `sociology_data.js`:
    - `applyMdiOdvToSelectedNode` ≈1789-1795: replace `Number(s) || 2` with a guard: if `normalizeOdvInput([s,e,c])` is null or invalid, alert and return false. Add `node.odvSource = 'authored';` next to `node.odvOverridden = true;`.
    - `applySensoryRollToSelectedNode` ≈1758: if `!getOdv(node).set` and no explicit `s,e,c` args, alert "Set this node's [S, E, C] first" and return false. Remove the `|| 2` fallbacks.
11. `property_grid_inspector.js` ≈4203-4204 (edge inspector, anchor `uNode.odv.s || 1`): use `getOdv(uNode)` / `getOdv(vNode)`; when either is unset, show friction as `Unknown`.

**Tests:** add to `test/run_tests.js` near the S1 block: build a node `{id:1}` and call `getOdv` after a simulated inspector render is not practical; instead assert `cad_interaction.js` source no longer contains `disposition: [2, 2, 2]` and `property_grid_inspector.js` source no longer contains `node.odv = { s: curS` (string-contains checks, same style as existing source assertions in the file).

**Commit:** `fix(odv): stop writing placeholder dispositions on view and create`

---

## S3: Make unset visible

**Goal:** the author can see at a glance which nodes, NPCs and factions have no disposition.

1. **Canvas node badge** — `cad_canvas_renderer.js`, node drawing block (anchor `// Color coding by AutoCAD Index Color`, ≈1196). After the node shape is appended to its group, if `Workstation.showUnsetOdvOverlay !== false && !getOdv(node).set`, append an SVG `text` element `?` at `(r * 0.75, -r * 0.75)` with `font-size` 11, `font-weight` bold, `fill` `#f59e0b`, `stroke` `#000`, `stroke-width` 0.5, `pointer-events` `none`, class `canvas-node-odv-unset`. Nodes with neither `culture` nor ODV also get `stroke-dasharray="3,2"` on the shape. Do not change fill colours.
2. **Overlay toggle** — find where `Workstation.showContradictionOverlay` is toggled (grep `showContradictionOverlay` in `src/workstation/scripts/` and `src/workstation/template.html`) and add a sibling toggle `Workstation.showUnsetOdvOverlay` (default `true`) with label "Highlight Unset Dispositions", same pattern, same menu.
3. **Inspector** — already done in S2. For culture-only nodes the Disposition Vector row reads `Unset (culture: <culture>)`.
4. **Roster filter** — `entity_manager_ui.js`: find the NPC/faction list filter controls (grep `CurrentEntityTab` near the list render ≈1249). Add a select `Disposition: All / Unset / Imported / Authored` filtering by `getOdv(item).set` and `.source`. Show a count suffix on the Unset option, e.g. `Unset (37)`.
5. **Node list summary** — status bar on campaign load: find the existing load-complete `setStatusBarMessage` in `state_adapter.js` `loadCampaignProjectPackage` (≈919) and append ` | <n> of <total> nodes have no [S, E, C]` counted over all maps with `getOdv`.

**Tests:** assert `getOdv` is referenced in `cad_canvas_renderer.js` source and the string `showUnsetOdvOverlay` exists in both renderer and toggle source.

**Manual check (report, do not skip):** open `start.html` via `file:///`, load BaldursGate, confirm `?` badges appear and the toggle hides them. Use the browser preview if available; otherwise state that it was not checked.

**Commit:** `feat(odv): show unset dispositions on canvas, inspector and roster`

---

## S4: Consumers treat unset as Unknown

**Goal:** no derived system computes from an invented vector. This is where behaviour changes.

`sociology_data.js`:
1. `resolveNodeOdv`: delete the culture table and the `[2,2,2]` default. Keep the mod resolver hook: if a registered `customOdvFallbackResolver` returns a valid vector, return it with `explicit: false, source: 'mod'`. Otherwise return `{ set: false, s: null, e: null, c: null, tag: null, explicit: false }`. Every caller below must tolerate `set: false`.
2. `resolveEdgeOdv`: becomes `return getEdgeOdv(edge, uNodeOdv, vNodeOdv, edgeRecord);`.
3. `buildCampaignOdvIndex` (≈1380): add `index["UNASSIGNED"] = { nodes: [], edges: [] };` after the 64-cell loop. Unset nodes and unset edges go there. Node entry `culture` uses `getNodeQuadrant(n)` (may be `null`).
4. `getSuggestedCultureForNode` (≈1079): use `getOdv(node)`; only derive when `set`. Leave the biome heuristic (it is a suggestion, shown as such).
5. `getCulturalHarmonyScore` (≈1116): use `getNodeQuadrant` for current and neighbours; skip neighbours that return `null`; if current is `null` return `{ bonus: 0, currentCulture: null, harmoniousNeighbors: [], clashingNeighbors: [] }`.
6. `synthesizeCorridorReasonings` (≈1153): resolve both ends with `getOdv`. If either is unset, set `totalDelta = null`, `consensus` to an "Unknown: one or both endpoints have no [S, E, C]" message, and skip the delta-dependent angle; keep the faction and physical angles. Badge text `Friction: Unknown`. Cultures via `getNodeQuadrant`, displayed as `Unknown` when null.

Other files:
7. `cad_canvas_renderer.js` ≈891-894: use `getOdv(u)` / `getOdv(v)`; `isHighFriction` is false when either is unset.
8. `entity_core.js` ≈20-44 NPC fit: if `!getOdv(node).set`, return a result with `level: 'Unknown'`, `summary: 'Node disposition unset'`, neutral style, `deltaD: null`. Replace `npcOdv.s || 2` with values from `getOdv(npc)`.
9. `supply_chain_simulator.js` ≈184: `const quad = getNodeQuadrant(n) || 'Unassigned';` and make sure any lookup keyed by quadrant tolerates `'Unassigned'` (grep the next 20 lines for a `[quad]` lookup).
10. `campaign_exporter.js`: ≈1017 and ≈1061 node ODV → `getOdv(n)`; emit `null` (JSON) or `Unset` (markdown/HTML) when not set. ≈1175 NPC → same. ≈1499-1501 and ≈1713-1715 → `getOdv` and `getNodeQuadrant(n) || 'Unassigned'`. ≈1581 Foundry flags: `odv: getOdv(npc).set ? {...} : null`, and `disposition: npc.dispositionToParty ?? 0` renamed to `partyStanding`.
11. `network/odv_archetype_matrix.html`: it loads `../src/workstation/scripts/sociology_data.js` (≈1147) then redefines `resolveNodeOdv` (≈1328), `buildCampaignOdvIndex` (≈1430), and possibly `resolveEdgeOdv`. **Delete those inline definitions** so the page uses the canonical ones. Grep the inline script for other duplicated function names from `sociology_data.js`'s export list and report them, but delete only these three. Render the `UNASSIGNED` bucket as a 65th card below the 4×4×4 grid, titled "Unassigned (no [S, E, C])", listing node and edge names.

**Tests (`test/run_tests.js`):**
- ≈2276-2283: replace the three fallback assertions with: untagged node → `set:false`, `tag:null`; `{culture:'Clan'}` → `set:false`; `getNodeQuadrant({culture:'Clan'})` → `'Clan'`.
- ≈2226-2227: the inline script still contains calls to `buildCampaignOdvIndex`, so the `find` keeps working; if not, change it to find the script containing `renderDenseCellRowsHtml`.
- Add: `buildCampaignOdvIndex({nodes:[{id:1},{id:2,odv:[1,1,1]}], links:[{source:1,target:2}]})` → `UNASSIGNED.nodes.length === 1` and `UNASSIGNED.edges.length === 1`. Check the link field names used by `registerCorridor` callers (≈1470-1490) before writing the fixture.
- ≈2721-2723: rerun and fix any count that changed because nodes moved to `UNASSIGNED`; adjust expected numbers only, and say which in the commit body.

**Commit:** `feat(odv): treat unset dispositions as unknown in derived systems`

---

## S5: Data migration

**Goal:** apply owner decisions 1, 2 and 4 from SYS-ODV-01 section 3 to data on disk and in browser storage.

1. **Audit script** `tools/audit_odv.js` (node, read-only, no deps). For each `campaigns/<name>/` read `topology.json`, `preset.json`, `campaign.json`, `maps/*.json`; walk `maps` (object) or the file itself; count per campaign: nodes, set, exactly `[2,2,2]`, culture-only, out-of-range, NPCs/factions set/unset. For `mods/**/modules/*.md` and `campaigns/**/modules/*.md` collect `disposition:`/`odv:` triplets and classify each file's scale: all values in 1..4 → `1-4`; contains 0 and max ≤ 3 → `0-3`; contains negatives → `signed-3`; anything else (e.g. 0 and 4 together, or 5) → `MIXED`. Print a table and the list of `MIXED` files. Run it and save output to the scratchpad as `before.txt`.
2. **Krynn compiler** `tools/krynn/compiler/data_maps.js`: ≈9 change the default `odv = [2, 2, 2]` to `odv = null`; in the returned object emit `odv` and `odvSource: 'imported'` only when `odv` is non-null (grep where `odv` is placed in the return literal). ≈801 `odv: r.odv || [2, 2, 2]` → `odv: r.odv || null`. Grep `data_npcs.js` and `data_factions_and_items.js` for `[2, 2, 2]` / `|| 2` defaults and apply the same. **Do not change the `culture = 'Hierarchy'` defaults**; instead have the audit report how many Krynn nodes have `culture: 'Hierarchy'` and no source `culture` (the owner will decide separately). Find the compiler entry point (`tools/krynn/compiler/*.js` with a `main` or `writeFileSync`) and run it to regenerate the three Krynn volumes.
3. **Migration script** `tools/migrate_odv_placeholders.js` (node, idempotent, `--dry-run` flag default on, `--write` to apply). For BaldursGate, migmag, Peridot, Fallout2 (hard-coded list), in every file from step 1:
   - Node with ODV exactly `[2,2,2]` (array or object) → delete `odv` and `disposition`. Keep `culture`.
   - Other node ODVs → convert to `{s,e,c}` object, set `odvSource: 'imported'`, delete node `disposition`.
   - NPCs/factions: same two rules.
   - NPC with numeric `disposition`: move to `dispositionToParty` if absent, delete `disposition`.
   - Runs **before** scale conversion.
4. **Scale conversion** (same script, after step 3): `campaigns/Fallout2/campaign.json` gets top-level `"odvScale": "signed-3"`; convert Fallout2 node/NPC values with the map `-3→1, -2→1, -1→2, 0→2, 1→3, 2→4, 3→4`. For module `.md` files classified `0-3`, add `odvScale: "0-3"` to frontmatter and rewrite each triplet `+1`. **Skip `MIXED` files**, list them in the commit body. **Stop before `--write` on Fallout2 and print the before/after for its 17 non-placeholder nodes so the owner can confirm the signed mapping.** If running unattended, apply everything except Fallout2 scale conversion and report.
5. **Importer support** for `odvScale` in `selective_importer.js` and `campaign_mutation_engine.js` `normalizeEntities`: if the package or module declares `odvScale`, convert with the same map before `normalizeOdvInput`. Put the conversion in one function `convertOdvScale(vec, scale)` in `sociology_data.js`, exported, with a local copy in the UMD engine.
6. **Browser storage migration** — `workstation_state.js` ≈713-724 (anchor `maps[mKey].nodeSlottedModules = normalizeNodeSlottedModules`), `state_adapter.js` `loadCampaignProjectPackage` (≈919), and `map_store.js` `loadPersistedMapFromDB` (≈107): call one new function `migrateOdvPlaceholdersInMaps(maps)` (in `state_adapter.js`) that, for each node lacking `odvSource` and lacking `odvOverridden === true`, deletes an ODV equal to `[2,2,2]`. Guard with a per-campaign flag `localStorage['cs_odv_migrated_v1:' + campaignId]` so it runs once.
7. Run `node tools/audit_odv.js` again; save as `after.txt`. Expected (from SYS-ODV-01): BG 0 of 190 set, migmag 0 of 30, Peridot 3 of 53, Fallout2 17 of 180, Krynn at most 54 of 144 per volume. Explain any difference.
8. `powershell -File .\campaigns\Test-CampaignPackage.ps1` must pass for every campaign.

**Commits:** `chore(odv): add audit and migration scripts`, then `feat(krynn): stop compiling placeholder dispositions` (compiler + regenerated Krynn data), then `data(campaigns): strip placeholder dispositions and normalize scales` (paste before/after audit tables in the body), then `feat(odv): migrate placeholder dispositions in saved campaigns`.

---

## S6: Guardrails and docs

1. `campaigns/Test-CampaignPackage.ps1`: add checks — fail on any node/NPC/faction ODV outside 1..4 (after `odvScale` conversion), fail on `odvScale` not in `1-4|0-3|signed-3`, fail if an NPC `disposition` is an array or a node/faction `disposition` is a number, print `Unset: n of total` per campaign (informational).
2. `.claude/skills/campaign-preset-builder/` (or wherever `Skill` `campaign-preset-builder` lives; grep `name: campaign-preset-builder`): where it instructs emitting `odv`, add: "Emit `odv` only when the source supports a value. Never emit `[2, 2, 2]` as a default. Set `odvSource: imported`."
3. `CONTEXT.md`: add terms **Unset Disposition** (node, NPC or faction with no `odv`; derived systems report Unknown) and **ODV Provenance** (`odvSource`: authored, imported, mod). Under Granular Disposition, add *placeholder `[2, 2, 2]`* to the avoid list.
4. New ADR `docs/adr/00NN-unset-disposition-and-odv-provenance.md` (next free number; check `docs/adr/`). Record: absent-plus-provenance chosen over `[0,0,0]` (collides with 0-based data and was coerced to `[2,2,2]`) and `[9,9,9]` (clamped to `[4,4,4]`); canonical 1..4 on disk with `odvScale` conversion on import; owner decisions 1 to 4. Short, atomic-prose voice.
5. `docs/srd/authoring_engine_srd.md` section 3: one paragraph stating that a vector may be unset and how derived systems behave.
6. Set `status: done` in both `SYS-ODV-01` and this ticket.

**Commit:** `docs(odv): record unset disposition model, validator and preset guidance`
