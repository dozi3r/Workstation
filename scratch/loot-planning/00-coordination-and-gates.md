# AdventureCAD modular loot: coordinated delivery plan

Status: planning draft for red-team review; implementation is not authorized by this document.
User confirmed the product design and requested two separately owned works plus one coordinating agent before implementation. Planning date: 2026-11-08 (America/New_York).

## Read this package

1. This document: delivery ownership, dependencies, gate evidence, and approval boundaries.
2. `01-shared-contract.md`: proposed interface and behavioral contract both teams must sign off.
3. `host-readiness-findings.md`: host-team investigation and implementation plan.
4. `mod-findings.md`: mod-team investigation and implementation plan.
5. `independent-risk-audit.md`: independent adversarial review of design and existing integration paths.
6. `02-review-disposition.md`: reconciliation of findings and remaining blockers.

These are review artifacts in scratch, not new application behavior. After approval, promote the settled specification into `docs/specs/` and necessary decisions into `docs/adr/`, with the repository's wiki notes and build workflow. Do not treat scratch as a runtime dependency.

## Confirmed product scope

The first release is a Workstation Mod with small labeled source packs for Diablo 2, Oblivion, and Super Smash Bros. Each source contains selectable tables, source-specific declarative settings, and reusable item knowledge. Selected sources produce one combined pool. Source weights specify total source shares; eligible entry weights specify distribution inside each source. A five-slot drop may mix games. Named presets restore all selections and settings. Repeats are enabled by default; uniqueness is optional per batch. Results are previews until accepted into the Active Campaign Roster.

Knowledge records support full descriptions, mechanics, provenance, tags, and optional original-system values, while permitting explicit incomplete records. Existing AdventureCAD item entities and prototypes must be reused through explicit identity mappings where appropriate. Accepted campaign instances preserve their details and source reference; updates are reviewed explicitly. Recent rolls are bounded and reproducible. Batch simulations report observed frequencies. Empty pools block generation; undersized unique pools return the available distinct items with a visible explanation.

Faithful game engines, comprehensive catalogs, and contextual suggestions belong in the existing ticket backlog. Suggestions eventually explain matched conditions and permit overrides. No cross-game rarity or currency conversion is assumed.

## Two teams and one coordinator

| Owner | Owns | Must not own |
|---|---|---|
| Team A: AdventureCAD readiness | General host capabilities, item-instance acceptance, persistence/remapping preservation, capability detection, host tests and host wiki notes | Drop probabilities, game catalogs, source filters, mod presentation |
| Team B: Loot Simulator Mod | `mods/loot_simulator/`, portable data pack validation/editor, knowledge adapters, pool engine, presets/history/simulation, mod tests and documentation | Direct patches to host serializers, prototype promotion semantics, campaign reset code |
| Coordinating agent | Shared contract, work package dependency graph, independent review disposition, gate evidence, integration branch, generated bundles, final acceptance report | Silent changes to either team's agreed semantics; self-certifying unresolved critical findings |

Team A should expose the smallest reusable capabilities demonstrated necessary by evidence. Do not build a universal extension framework or a new independent item database solely for this mod. Team B uses a small host adapter so its pure engine and fixtures can proceed before host changes land. Neither team reaches into the other's private internals. A missing host capability becomes an interface request with a failing scenario, not a mod-side workaround.

## Workspace and integration discipline

The current checkout already contains extensive modified and untracked campaign, ticket, wiki, and generated distribution files. Preserve them. Before implementation, the coordinator records branch/commit, status, touched-file hashes, and baseline failures. Worktree creation and Git writes follow repository and environment permissions; do not discard or stash someone else's work to obtain a clean tree. Establish separate source-only workspaces from an agreed baseline that includes needed existing work. A commit alone does not describe this dirty checkout.

Each team may edit only its assigned source/test/documentation paths. Any shared-file change requires reassignment by the coordinator. Teams do not run `Build-Suite.ps1` or commit generated distributions in isolated worktrees (AGENTS.md and ADR-0019). The coordinator alone compiles the combined result in an authorized integration workspace. Do not hand-edit `start.html`, generated ticket manifests, or compiled wiki HTML.

Planning performs no build, migration, ticket compilation, code changes, or commit. Proposed ticket IDs below are work-package labels, not allocated repository IDs.

## Sequenced execution

| Phase | Team A | Team B | Coordinator |
|---|---|---|---|
| P0: establish baseline | Trace every required save/load and entity path | Inspect source-pack/editor and pool contracts | Record dirty baseline and known failures; allocate ownership |
| P1: freeze contract | Validate host feasibility and failure envelopes | Validate mod feasibility using fixtures | Resolve identity, persistence, acceptance, RNG, import limits; obtain independent review |
| P2: independent foundations | Implement minimum host adapter and round-trip fixtures | Implement pure validation, knowledge resolution, weighted engine against fake host | Track API/schema changes and shared contract tests |
| P3: first vertical slice | Deliver guarded atomic instance acceptance | Deliver one source, one preview, inspect, accept, reopen | Verify one source through actual save/reload and undo before broadening |
| P4: complete MVP | Close all required runtime/persistence paths | Add three packs, presets/editor/import, history and simulation | Integrate real host adapter and audit all lifecycle paths |
| P5: adversarial verification | Host migration, isolation, remapping, rollback tests | Distribution, deterministic replay, hostile imports, UI tests | Independent red-team rerun; full suite and browser evidence |
| P6: release readiness | Host compatibility/change notes | Pack provenance and user guide | Final gate report, reversible release package, approval |

P2 work can run concurrently after contract agreement. P3 integration cannot pass with a fake host. P4 cannot hide a failing vertical slice behind more catalog content. Changes to shared identity or persistence schemas return both teams to the affected contract gate.

## Gate definitions

Every gate records status (PASS, FAIL, BLOCKED, NOT RUN), reviewer, exact source revision and dirty-file fingerprint, commands/scenarios, expected/actual outcomes, evidence location, finding IDs, and disposition. A proposed test is not a passing test. Baseline failures remain visible; a release needs explicit disposition of any relevant pre-existing failures.

| Gate | Required evidence | Blocking criteria |
|---|---|---|
| G0: plan review | Both team plans, shared contract, source evidence, risk disposition, user approval to implement | Unassigned ownership, unresolved identity/quantity/acceptance semantics, unspecified persistence paths |
| G1: contract freeze | Valid/invalid JSON fixtures, fake host and host contract suite, schema/API versions and compatibility table | Different interpretation by teams; unresolved replay or missing-source behavior |
| G2: host readiness | Item instance isolation; atomic failure; duplicate-click idempotency; stale campaign rejection; all required round trips | Lost metadata, roster corruption, reference remapping of definitions, cross-campaign mutation |
| G3: engine/data readiness | Hand-calculated probability fixtures, seed golden vectors, strict import rejection, three labeled pack manifests | Biased source shares, hidden filter fallback, code execution from data, unaudited content claims |
| G4: integrated MVP | Real preview/accept/save/reopen/undo; presets/history; five mixed-capable slots; offline and loopback UI evidence | Fake adapters in production, unusable item inspector, repeated results collapse into one entity |
| G5: independent adversarial review | Findings with severity, reproduction, fixes, retest evidence; no unresolved critical/high items | Data loss, injection, incorrect probability semantics, non-reproducible claimed replay, campaign isolation failure |
| G6: release readiness | Full suite, wiki/build check, clean scoped diff, baseline disposition, backup/rollback rehearsal, user-facing limitations | Unexplained regressions, destructive migration, false faithful-simulation claims |

G0 passes only after the user approves the reviewed plans. This planning session does not pass implementation gates. Coordinator can require rework and halt integration. Critical/high findings cannot be waived by the implementing team; critical data-loss/security defects require correction before release. Medium findings need named ownership and an explicit scope decision.

## Required test inventory

1. Probability: a source with two entries and another with 1,000 entries have equal total share at equal source weights; verify exact normalized probabilities, then empirical seeded frequencies as secondary evidence. Zero weights, empty selected tables, overlapping tables and duplicate definitions are explicit cases.
2. Unique batches: uniqueness applies to definition identity across all selected tables, not display name; renormalize remaining source shares after removing a selected definition. Explain pool exhaustion. Distribution summaries describe sampling without replacement when enabled.
3. Quantities: five slots mean five selected entries before optional visual grouping. Entry quantity ranges do not alter selection odds. Quantity validation rejects fractional/negative/unbounded units.
4. Acceptance: accepting the same preview row twice creates no duplicate; distinct rows for the same definition create independent instances (one entity per accepted slot with integer `quantity >= 1` and post-acceptance Split/Stack support). One failed row prevents partial batch acceptance. Acceptance and Undo (`revertBatch`) atomically maintain Sovereign Invariant #5 reciprocal crosslinks (`node.itemIds[]` on target `submapId`, `npc.carriedItemIds[]`, `quest.itemIds[]`) and pass `audit_campaign_quality.js`. Item, metadata, history acceptance marker and changelog agree after undo/retry.
5. Staleness: roll in campaign A, switch to B, then accept A's open preview; reject. Also test reset, Save As, rename, import, concurrent edits, deleted owners, stale revision, and simulation cancellation.
6. Persistence: browser save/reopen, portable `.creator.json`, ZIP, bound folder, campaign rename/Save As, full import, selective map/entity merge and conflict handling. Keep unknown mod data when mod disabled. Preserve accepted item knowledge when source is removed.
7. Replay: same seed and frozen effective pool/settings/schema/engine/RNG versions reproduce selection order and quantities. Editing/removing/updating a source afterward cannot silently change an existing roll. Display replay-unavailable when retained evidence is insufficient.
8. Imports: malicious HTML/Markdown, script-closing sequences in bundled JSON, prototype-pollution keys, duplicate IDs, broken references, unknown future schema, NaN/infinity-like values, oversized files and excessive nesting. Invalid input leaves existing library/campaign unchanged.
9. Interaction: keyboard selection, labeled controls, readable long item records, MDI close/reopen/resize, disabled mod, empty/error states, responsive progress/cancel for large simulations. No UI requirement for network access.
10. Regression: existing mods register and render; entity editing/promotion/cascade deletion, quest links, stationing, package import and undo continue to work. New tests validate behavior rather than copying implementation details.

## Existing verification tools

Use `node test/run_tests.js` for focused host regressions where supported, then the integrated `powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1` (Node-backed suite). Inspect actual runner arguments before adding targeted tests. Its phases include build, JS tests, campaign packages, wiki drift, and loopback verification (`scripts/test_suite.js`). Source-only teams run focused tests without suite compilation. Coordinator runs `Build-Suite.ps1` and required wiki review stamping only after reviewing the resulting source diff. Browser tests cover both `file:///` and supported loopback runtimes; a Node-only test does not establish browser correctness.

## Backlog map for the existing ticket system

After G0 approval, allocate real IDs by inspecting `tickets/system/`. Use source Markdown tickets with established frontmatter; generated tracker files remain build products. Suggested parent: Modular Loot MVP delivery. Child tickets: shared contract and fixtures; host item instantiation; host mod state preservation; host lifecycle and capability integration; mod engine; source schema/editor; item knowledge; presets/history/replay; simulator UI and batch analysis; starter data provenance; integration/red-team gates. Link each to the appropriate team package and blockers.

Separate deferred children: faithful Diablo 2 rules; faithful Oblivion rules; Smash edition-specific simulation; expanded catalogs; context-based recommendations; optional cross-system conversion. Faithful modes require explicit edition/version evidence and fresh design review. A rule engine cannot be represented as a few unexplained weights.

## Rollback and handoff

Never automatically rewrite installed source files or existing campaign items on startup. Retain previous versions before migrations. A disabled/uninstalled mod must leave accepted items inspectable through the host and preserve opaque mod state for later restoration. Test downgrade detection; preserve newer unknown payloads rather than destroying them. Rollback is source/package reversal plus restoration of a verified campaign backup if data migration occurred, not a promise that reversing code reverses data.

Each team hands over: source revision and diff, contract/schema versions, tests and evidence, remaining findings, migrations, touched files, compatibility limits, and no generated bundles. Coordinator integrates in dependency order, requests independent verification, then provides the user a reviewable release report. Implementation begins only after separate approval of this planning package.
