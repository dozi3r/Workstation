---
id: SYS-ODV-01
title: "Unset [S, E, C] Disposition State, Provenance & Placeholder Remediation"
pipeline_tier: 0
target_surface: "src/workstation/scripts/ (sociology_data.js, property_grid_inspector.js, cad_canvas_renderer.js, entity_core.js, campaign_exporter.js, campaign_mutation_engine.js, selective_importer.js, supply_chain_simulator.js, cad_interaction.js, entity_crud_dialogs.js, entity_manager_ui.js, state_adapter.js), tools/krynn/compiler/, campaigns/**, test/run_tests.js, campaigns/Test-CampaignPackage.ps1"
status: ready_for_spec
triage: ready-for-agent
category: "system_architecture"
wave: "Platform Architecture: Data Integrity"
grounded_prerequisites: ["Commit 402bcd3 (baseline for this survey)"]
grounded_yields: ["One canonical ODV resolver with an explicit unset state", "Visible unset badge on canvas, inspector, roster and archetype matrix", "Per-campaign placeholder audit and migration", "Single canonical 1..4 scale on disk"]
provides: ["Engine: Canonical-ODV-Resolver", "Validator: ODV-Integrity-Check"]
requires: ["Engine: CampaignMutationEngine", "Surface: start.html"]
blocked_by: ["None"]
blocks: ["SYS-ODV-02 (execution brief, six agent sessions)"]
standalone_fallback: "Phases 1 and 2 stand alone: they stop new fake values being written and make unset nodes visible, with no data migration."
---

# SYS-ODV-01: Unset disposition state

## 1. Problem

`[S, E, C]` has no "not chosen yet" value. Every reader substitutes `[2, 2, 2]` (The Deliberative Concord) when the field is missing, zero, or malformed. Every writer that creates a node, NPC or faction stamps `[2, 2, 2]` in. Result: a deliberate Concord and "nobody has looked at this yet" are byte-identical, and every downstream system (corridor friction, culture quadrant, archetype matrix, NPC fit, exports, sensory rolls) runs on the fake value as if it were authored.

## 2. Survey (baseline 402bcd3)

### 2.1 Data on disk

Node dispositions across `campaigns/*/topology.json` and `campaigns/*/maps/*.json`:

| Campaign | Nodes | Has ODV | Of those, exactly `[2,2,2]` | Culture only, no ODV | Out-of-range values |
| :--- | ---: | ---: | ---: | ---: | :--- |
| BaldursGate | 190 | 112 | **112 (100%)** | 78 | none |
| Fallout2 | 180 | 49 | 32 | 18 | **signed scale**: The Den `[-2,-2,-1]`, New Reno `[-3,-2,-2]`, Redding `[0,1,1]` (+7 more) |
| Krynn V1 / V2 / V3 | 144 each | 144 | **90 (63%)** | 0 | none |
| migmag | 30 | 30 | **30 (100%)** | 0 | none |
| Peridot | 53 | 53 | 50 | 0 | none |

Edges: no edge in any campaign carries an ODV; all corridor values are derived midpoints.

Module markdown (`mods/**`, `campaigns/**/modules`) NPC prototype dispositions use at least three scales. Digit histogram: `0`×154, `1`×493, `2`×566, `3`×382, `4`×293, `5`×2, `-1`×107, `-2`×21, `-3`×1. Example: `IND-IRON-03_Blacksmith_Forge.md` has `disposition: "[0, 1, 2]"`.

Conclusions:
- Most `[2,2,2]` values on disk are importer placeholders, not authored choices. The Krynn compiler stamps them at `tools/krynn/compiler/data_maps.js:9` (`odv = [2, 2, 2]`) and `:801` (`r.odv || [2, 2, 2]`).
- `0` is already a real value in 0-based sources, and negatives are real in signed sources. Both are currently coerced: `0 || 2` gives `2`, and negatives clamp to `1`.

### 2.2 Why `[0,0,0]` or `[9,9,9]` would not work as the sentinel

| Candidate | What the current code does with it | Verdict |
| :--- | :--- | :--- |
| `[0,0,0]` | `parseInt(0) \|\| 2` turns it into `[2,2,2]` **and** sets `explicit: true` (`sociology_data.js:1286`). Collides with 154 legitimate zeros in 0-based module data. | Rejected. Indistinguishable from neutral today, ambiguous with real data. |
| `[9,9,9]` | Clamped to `[4,4,4]` with `explicit: true` (`sociology_data.js:1333`). Any consumer that misses the check computes Δ up to 24 and flags every corridor High-Hazard. | Rejected. Silently becomes a real archetype. |
| `null` / field absent + provenance field | Absent is already what "no ODV" means in 96 BG/Fallout nodes. A consumer that forgets the check fails visibly instead of inventing a Concord. | **Recommended.** |

### 2.3 Field-name collision

`disposition` means two different things:
- Nodes and factions: `[S, E, C]` array.
- NPCs: party standing scalar `-2..+2`. `selective_importer.js:403` and `campaign_mutation_engine.js:115,443` copy `dispositionToParty` into `npc.disposition`.

`resolveNodeOdv` and `normalizeOdv` read `.disposition` as an ODV fallback, so an NPC with standing `1` and no `odv` resolves to `[2,2,2]` explicit. The exporter writes `disposition: npc.disposition || 0` next to `odv` (`campaign_exporter.js:1581`).

### 2.4 Consumers that assume a valid value

Readers (default substitution):

| Location | Behaviour on unset |
| :--- | :--- |
| `sociology_data.js:1278` `resolveNodeOdv` | Mod resolver, then culture-derived vector, then `[2,2,2]`. Computes `explicit` but most callers discard it. Callers at `campaign_exporter.js:1499,1713` and `cad_canvas_renderer.js:891` pass `topo` as `fallbackIndex`. |
| `sociology_data.js:1339` `resolveEdgeOdv` | Midpoint of two fake vectors; `totalDelta` and `isHighHazard` computed from them. |
| `sociology_data.js:1380` `buildCampaignOdvIndex` | Unset nodes pile into the `[2,2,2]` cell, inflating it in `odv_archetype_matrix.html` and the contradiction matrix. |
| `sociology_data.js:1153` `synthesizeCorridorReasonings` | Reads raw `node.odv`; unset gives `[2,2,2]`, array-form ODV gives `NaN` deltas. |
| `sociology_data.js:1079,1116` culture suggestion and harmony score | Derive quadrant from fake vector, else default `Hierarchy`. |
| `sociology_data.js:1758` sensory pentagon | Rolls a sensory profile from the fake vector and **appends it to node notes**. |
| `cad_canvas_renderer.js:891` | Corridor friction render from fake vectors. |
| `entity_core.js:24-44` NPC-to-node fit | NPC side already supports unset ("Universal"); node side defaults to 2. |
| `supply_chain_simulator.js:184` | Quadrant from `odv.s \|\| 2`. |
| `property_grid_inspector.js:4203` edge inspector | Defaults to `[1,1,1]`, inconsistent with every other site. |
| `campaign_exporter.js:1017,1061,1175,1500,1714` | Exports `[2,2,2]` as authored data. |

Writers (launder the placeholder into "set"):

| Location | Behaviour |
| :--- | :--- |
| `property_grid_inspector.js:1150-1157` | **Opening the inspector on an unset node writes `{2,2,2}` (or a tarot-card value) into `node.odv`.** The next save persists it. Viewing a node makes it look authored. |
| `property_grid_inspector.js:1119,1125` | Culture dropdown shows `Clan` and op-profile shows `Produce` when unset. |
| `property_grid_inspector.js:1182-1192` | S/E/C selects have no unset option; `parseInt(val) \|\| 2`. |
| `sociology_data.js:1789-1795` `applyMdiOdvToSelectedNode` | Sets `odvOverridden = true` (existing partial provenance flag) and overwrites `culture`. |
| `cad_interaction.js:2218,2258` | New NPC / faction created with `[2,2,2]`. |
| `entity_crud_dialogs.js:486,560,697,808`, `entity_manager_ui.js:2601`, `property_grid_inspector.js:2650` | NPC / faction editors default fields to 2. |
| `campaign_mutation_engine.js:43` `normalizeOdv` (used at 113, 197, 1452) | Any falsy or non-array input becomes `[2,2,2]`. |
| `selective_importer.js:395-493` | Same `\|\| 2` coercion for NPC and faction import. |
| `state_adapter.js:427` `createMap` | First node gets `culture: Hierarchy`. |
| `tools/krynn/compiler/data_maps.js:9,801`, `data_npcs.js`, `data_factions_and_items.js` | Bake placeholders into compiled campaign JSON. |

Tests that encode the current fallback: `test/run_tests.js:2276-2283` (expect `[2,2,2]` and culture-derived vectors for untagged nodes).

### 2.5 Size estimate

Not a rewrite. About 25 call sites in 12 source files, most of them a one-line change once a single resolver exists. The real cost is the data migration in section 4 phase 5, because it needs owner judgment about which existing `[2,2,2]` values are deliberate.

## 3. Owner decisions (resolved 2026-11-04)

1. **Existing `[2,2,2]` on disk: unset.**
   - Krynn V1/V2/V3: unset only where the compiler stamped the default (`data_maps.js:9,801`). A Krynn source record that explicitly carries `[2,2,2]` stays set with `odvSource: "imported"`.
   - BaldursGate, migmag, Peridot, Fallout2: every node `[2,2,2]` becomes unset (`odv` removed). Non-`[2,2,2]` values stay set with `odvSource: "imported"`.
   - Expected result after migration: BG 0 of 190 set, migmag 0 of 30, Peridot 3 of 53, Fallout2 17 of 180 (before scale conversion), Krynn at most 54 of 144 per volume plus any explicit Concords.
   - The loss of any deliberate Concord outside Krynn is accepted; they are re-set by hand.
2. **Culture-only nodes: partial disposition.** Authored `culture` is kept and shown. S/E/C stay unset. The culture-to-vector fallback in `resolveNodeOdv` (Clan becomes `[3,2,2]`, etc.) is removed. Systems that need only a quadrant (harmony score, supply chain) may use authored `culture`; systems that need S/E/C treat the node as unset.
3. **Unset in derived systems: Unknown.** Corridor friction shows "Unknown" and is left out of hazard counts. Edge midpoint is unset if either endpoint is unset. Harmony score skips unset neighbours (culture-only neighbours still count per decision 2). NPC fit shows "Unknown" on the node side. Exports write `null`. The archetype matrix gets a 65th "Unassigned" bucket. The sensory pentagon refuses unset nodes.
4. **Scales: declare and convert.** Each module and campaign source declares `odvScale`: `"1-4"` (default when absent), `"0-3"`, or `"signed-3"`. The importer and migration convert to canonical 1..4; only 1..4 is stored on disk. Mapping:
   - `"0-3"`: add 1.
   - `"signed-3"` (−3..+3, seven steps onto four): −3/−2 become 1, −1/0 become 2, +1 become 3, +2/+3 become 4. **Check this mapping against Fallout2's intended meaning before running phase 5.** A source that mixes scales in one file is flagged by the audit report for hand review rather than guessed.

## 4. Phases

Each phase is one Conventional atomic commit. Run `Test-Suite.ps1` after each.

### Phase 1: Canonical model and resolver (no visible change)

- Canonical shape: `odv: { s, e, c } | null` plus `odvSource: "authored" | "imported" | "mod"`. No `"derived"` or `"placeholder"` source: per section 3 the code no longer invents vectors, and placeholders are removed rather than tagged. Absent `odv` means unset. Retire reading `.disposition` as an ODV on NPCs; keep it as a read-only legacy alias on nodes and factions during migration.
- One resolver in `sociology_data.js`: `getOdv(entity) -> { set: boolean, s, e, c, tag, source }`. Values outside 1..4 return `set: false` with `source: "invalid"` instead of clamping. Keep `resolveNodeOdv` as a thin wrapper that preserves today's output, so phase 1 changes no behaviour.
- One normalizer replaces `normalizeOdv` (mutation engine) and the importer copies; it returns `null` for falsy input instead of `[2,2,2]`.
- Fix the `fallbackIndex` / `topo` argument mix-up at the four call sites.
- Tests: resolver unit tests for absent, `null`, array, object, string, `0`, out-of-range, NPC-with-scalar-disposition.

### Phase 2: Stop writing fake values

- `property_grid_inspector.js:1150-1157`: render from `getOdv`, never assign `node.odv` on render.
- Add "— Unset —" as the first option on S/E/C selects (nodes, NPCs, factions) and on Culture / Operational Profile. Choosing a value sets `odvSource: "authored"`; choosing Unset deletes `odv`.
- New NPC / faction / map first node: create with no ODV and no culture.
- `applyMdiOdvToSelectedNode`: set `odvSource: "authored"` alongside the existing `odvOverridden`.
- Sensory pentagon: refuse on unset nodes with a status-bar message.

### Phase 3: Make unset visible (the immediate pain point)

- Canvas: unset nodes get a distinct treatment (dashed outline or `?` badge) and a toggle layer "Highlight unset dispositions". Culture-only nodes keep their quadrant colour with the same `?` badge.
- Inspector: "Disposition Vector" row reads `Unset`, or `Unset (culture: Clan)` for culture-only nodes.
- Roster / entity manager: filter "Disposition: Unset / Imported / Authored" with counts per category (nodes, NPCs, factions).
- Archetype matrix: 65th "Unassigned" bucket.
- Status bar or campaign summary: "142 of 190 nodes have no authored disposition".

### Phase 4: Consumers branch on `set`

Convert every reader in section 2.4 to `getOdv` and handle `set: false` per decision 3. Includes corridor friction and hazard, edge midpoint (unset if either endpoint unset), culture suggestion, harmony score, NPC fit (node side becomes "Unknown"), supply chain quadrant, exporters (`null`), edge inspector default. Update `test/run_tests.js:2276-2283` to the new expectations.

### Phase 5: Data migration (decisions in section 3)

- `tools/Audit-Odv.js` (node, read-only): per campaign and per module source, counts of set / `[2,2,2]` / unset / culture-only / out-of-range, detected scale, and mixed-scale files. Run before and after; paste both reports into the commit body.
- Krynn compiler: drop the `[2,2,2]` defaults at `data_maps.js:9,801` and in `data_npcs.js` / `data_factions_and_items.js`; emit `odv` only when the source record has one, with `odvSource: "imported"`. Recompile V1/V2/V3.
- BaldursGate, migmag, Peridot, Fallout2: one-shot migration script removes every node `[2,2,2]` and the matching `disposition` alias, tags remaining values `odvSource: "imported"`, and keeps `culture` untouched (decision 2). Apply to `topology.json`, `preset.json`, `campaign.json` and `maps/*.json` so the copies stay in sync.
- Scale conversion (decision 4): add `odvScale: "signed-3"` to Fallout2 and `odvScale: "0-3"` to the module sources that the audit flags as 0-based, then convert. Fallout2 runs after the `[2,2,2]` pass, so its converted values are not mistaken for placeholders.
- NPCs and factions follow the same rules; an NPC scalar `disposition` is moved to `dispositionToParty` and removed.
- Saved user campaigns in IndexedDB (`CreatorStudioMapDB`): migrate on load in `state_adapter.js`. Strip `[2,2,2]` only where `odvSource` is absent and `odvOverridden` is not true (the user never chose it in-app). Bump the schema version so the migration runs once.

### Phase 6: Guardrails

- `campaigns/Test-CampaignPackage.ps1`: fail on out-of-range or non-canonical ODV, fail on an `odvScale` value other than the three defined, fail if NPC `disposition` is an array or node `disposition` is a scalar, and report the unset share per campaign (informational, not a failure).
- `campaign-preset-builder` skill: emit no ODV rather than a default when the source has none.

### Phase 7: Docs

- `CONTEXT.md`: define Unset Disposition and ODV provenance; add *placeholder* to the avoid list for "neutral".
- ADR: record the sentinel decision (absent + provenance, not `[0,0,0]` / `[9,9,9]`) and the canonical 1..4 on-disk scale. Update `docs/srd/authoring_engine_srd.md` section 3 and the wiki notes for every touched file, then `Build-Suite.ps1 --stamp-reviewed`.
