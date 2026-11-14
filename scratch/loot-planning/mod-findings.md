# Loot Simulator Mod: implementation planning findings

Status: planning only; no product implementation authorized by this document. Proposed contracts require coordinator ratification and independent gate review. Paths below are repository relative; line references describe inspected working tree, not immutable commit anchors.

## Evidence and fit

- AGENTS.md:9-25 requires offline file execution, modular source edits, suite compilation and wiki synchronization; never edit compiled start.html as source.
- mods/README.md:8 distinguishes software Workstation Mods from narrative Modules. A loot source pack must not masquerade as a Tier 1-5 worldbuilding module.
- workstation_state.js (src/workstation/scripts/):308-374 exposes registerMod, enabled flags, topology access, save, refresh and MDI registration. This is an integration foundation, not proof of all required mutation/persistence capabilities.
- Same file:315-328 subscribes a mod to campaignLoaded; state_adapter.js:1257-1264 also directly invokes onCampaignLoad. Verify duplicate invocation behavior; load handlers must be idempotent.
- mods/pre_industrial_resources/mod.js:7-18 demonstrates UMD/Node-testable mod registration; :26-40 demonstrates namespaced topology.modData.
- src/workstation/scripts/entity_core.js:970-1000 deduplicates promoted prototypes and shallow-spreads them into campaign entities. :1027 onward remaps prototype references. This flow is not a repeated-drop instance constructor and must not be called for every result.
- src/workstation/scripts/campaign_exporter.js:112,579-580 exports/imports items, but does not establish preservation of an arbitrary mod state in every package format. Host team must prove the complete matrix.
- test/run_tests.js:12-42 uses Node fs/path/vm with local assertions; use the established harness with pure engine fixtures.
- docs/adr/0022-coauthoring-architecture-and-rejected-patterns.md:15-19 favors structured mutation envelopes and auditable batches; separate app entrypoints and hidden auto-replay are rejected later in that document.

## Ownership and boundaries

Mod team owns mods/loot_simulator/**, loot data schemas and fixtures, engine tests in a separate mod-specific test file, and corresponding documentation notes. Host team owns core entity APIs, persistence plumbing, lifecycle guarantees and generic UI integration. Coordinator owns shared contract version, acceptance evidence, dependency tickets and final integrated build. Core test runner/template/build inclusion edits belong to host/integrator; mod team supplies requested hunks, never races edits.

One mod contains many declarative source packs. Initial installation is build-time mod discovery; importing a source pack is runtime JSON data ingestion within the installed mod. No arbitrary JavaScript settings callbacks or executable source-pack import. Faithful engines later ship as reviewed mod code.

## Proposed data contracts (ratification required)

1. SourcePack: schemaVersion, namespaced sourceId, version, name, provenance, completeness, itemDefinitions[], tables[], settingDefinitions[]. Stable IDs are independent of display names. References contain sourceId + definitionId + version/hash. Original game rarity/value/category remain source-specific; no invented cross-game power equivalence.
2. ItemDefinition: stable ID, name, description, tags, optional mechanics/lore/value/media references, provenance and missing-field indicators; optional host knowledge-record binding. Tables do not duplicate canonical item descriptions. Imported legacy rows can contain local definitions that become reusable records at ingest. Host knowledge ID resolution must distinguish unavailable from deleted from ambiguous; never match solely by display name.
3. TableEntry: unique entryId, definitionRef, positive finite weight, quantity min/max bounded integers, declarative eligibility. No table-level weights in MVP: eligible selected entries normalize source-wide. Duplicate definition references are legal entry paths, documented in odds breakdown.
4. Preset: schemaVersion, id, name, selected source versions, tables, source weights, validated setting values, shared filters, requested slots, uniqueness mode. Global presets are reusable local library records; campaign copies are detached and portable. Explicit copy/update, no surprise live linking.
5. RollRecord: rollId, campaign identity/generation, engineVersion, PRNG version, seed, canonical input/catalog digest, effective settings, results snapshots, exclusions/warnings, acceptance receipts. Frozen minimal definition snapshots support replay after a pack disappears; large catalogs are content-addressed with retention accounting. Exact replay either succeeds from retained inputs or clearly reports unavailable; seed alone never promises replay.
6. Campaign mod state: host-owned versioned campaign extension transport accessed only through the adapter, containing campaign preset copies, bounded recent history (max 50 compact roll records inline, 256 KiB ceiling for `localStorage` safety) and acceptance receipts. Physical location is persisted alongside `creator_studio_campaign_entities` and all package formats (`campaign.json`, `preset.json`, `topology.json`, `entities.json`); map-scoped `topology.modData` is never used for campaign loot state. User-imported custom packs (up to 5 MiB) and global presets use IndexedDB (`CreatorStudioMapDB`) outside campaign identity. Portable campaign export embeds only the immutable definition snapshots referenced by accepted items and retained history, and never relies on local library existence.Starter packs (`diablo2`, `oblivion`, `smash`) compile directly into the zero-CORS JS bundle so `file:///` execution never requires HTTP `fetch()`.
7. Host transaction request: explicit createInstances, destination campaign identity/generation, result IDs, definition snapshots/references, requested quantity/placement, idempotency key. Host generates unique entity IDs, deep-copies nested state, validates destinations, commits one undoable batch and returns result-to-instance receipts. A repeat click is idempotent; a new roll can legitimately create another instance of the same definition. Reject stale previews after campaign switch.

## Sampling semantics

Compute eligible entries after all source/table/shared filters. Normalize each enabled source to its configured share among nonempty positive-weight sources. Within a source normalize all eligible entries across selected tables directly; MVP has no table-level weights. Flatten the resulting probabilities into a shared pool. Thus equal source shares survive different catalog sizes, and every slot can choose any source. Display probability mass and all excluded-source warnings before rolling. Selected empty sources are visibly excluded and remaining shares renormalized, as resolved in the shared contract; the whole empty pool blocks rolling.

Repeated mode samples with replacement. Unique mode excludes a definition identity globally within the batch, across tables; after each draw remove all paths to that definition and renormalize remaining source/entry probabilities. Requested slots describe distinct result draws, while quantity is each result's units; make this distinction visible. Unique shortfall returns all available identities and a warning, never loops indefinitely. Definitions with identical names but different identities are distinct; cross-source identity aliases require explicit mappings rather than heuristics.

Weights must be finite nonnegative source values and finite positive entry values; zero disables a source. Reject NaN, Infinity, negative, overflowing totals, invalid quantity ranges and unsupported setting versions. Stable canonical ordering is explicit (IDs, not locale sorting). Specify PRNG algorithm, integer draws, number of consumed draws and quantity sampling so adding UI code cannot perturb outcomes. Use numerically safe normalization and test extreme ratios. Do not fabricate original-game drop rates.

## Phased work packages and exit evidence

M0 Contract and fixture design: publish schemas, examples, error envelopes, host stub and all ambiguity decisions. Exit: host/mod/coordinator agree, independent reviewer finds no unresolved P0/P1 contract issue.

M1 Pure catalog + resolver: validate/import declarative packs atomically, resolve definitions, detect duplicate IDs/unresolved references and unsupported versions, derive eligibility with reason traces. Exit: valid fixtures roundtrip; malicious strings render as text; malformed/oversized packs fail without corrupting existing packs.

M2 Pure roll engine: shared pool normalization, settings, uniqueness, quantity, versioned RNG and frozen replay. Exit: exact hand-computable toy pools, golden seeded vectors, unique cross-table duplicates, empty/zero/extreme weights, deterministic reorder policy, shortfall termination. Statistical sanity uses a fixed seed and predetermined tolerance; exact math tests establish correctness rather than flaky frequencies alone.

M3 Mod UI and authoring: register one native MDI tool; source/table settings, odds inspector, named presets, editable data and JSON import/export, roll preview and item knowledge inspector. Exit: keyboard-accessible controls, clear incomplete data, five-item mixed roll possible, no active roster mutation on preview. Include basic table and item editing (accepted both in-app and file authoring), not just JSON import.

M4 Host integration: consume ratified adapter only; campaign instance acceptance, individual/all selections, source-update review, history persistence and campaign switch cleanup. Exit: host contract suite and integrated save/reload/rename/Save As/merge/delete/undo matrix pass; repeats create separate entities; repeat acceptance does not duplicate; item edits never mutate source definitions.

M5 Simulation and content: cancellable/chunked batch simulation with explicit limits, progress, source/item frequencies and expected probabilities, bounded aggregates rather than saving every batch result. Three starter packs with representative weapons/consumables or suitable game categories, source-specific controls that actually alter eligibility, provenance, coverage and approximation labels. Exit: responsiveness and storage benchmarks agreed by gate, distributions match toy pools, no claim of complete game fidelity.

M6 Release handoff: source-pack author guide, schema migration guide, limitations, verified offline sample campaign, diagnostics/export reproduction bundle, mod disable/uninstall behavior and ticket links. Coordinator alone performs integrated suite build/test and wiki drift check in controlled checkout.

## Tests and release gates

The authoritative gate names, sequencing and evidence are in 00-coordination-and-gates.md: G0 plan review; G1 contract freeze; G2 host readiness; G3 engine/data readiness; G4 integrated MVP; G5 independent adversarial review; G6 release readiness. Local phases above map to those gates and do not redefine them. Implementation requires G0 user approval; P2 parallel foundations require G1 contract agreement.

Performance budgets are proposed measurable limits, not discovered host guarantees: initially 100 history records, 100 results per interactive roll, 100,000 simulated slots per job, 5 MiB JSON import and configurable library quota. Ratify against realistic catalogs and benchmark target hardware; avoid silently clipping data. Cancelled simulations must not mutate campaigns or leave delayed callbacks targeting another campaign.

## Red-team challenge register

- Repeated drops collapse via prototype promotion: require dedicated instance constructor and regression fixture.
- Two entries reference one item and defeat unique mode: normalize uniqueness by definition identity, remove every path.
- A source becomes empty after filtering and silently changes odds: explicit preview warning or blocked policy, ratify before code.
- Same source ID different version imported: stage conflict preview, explicit replace/install-as-new decision; preserve history snapshots.
- Existing bound item is removed: show unresolved link and retained snapshot; no name-based relinking.
- Imported descriptions contain HTML/script or prototype-pollution keys: validate plain data, safe rendering, key allowlists and size/depth limits; never eval JSON packs.
- Nested item arrays alias canonical knowledge after acceptance: deep-copy and mutate-one-side regression.
- Campaign changes while simulation/acceptance pending: generation token and cancellation; host validates again at commit.
- Partial acceptance fails halfway: atomic transaction or no change; receipt persistence and undo semantics verified.
- Uninstalled mod loses campaign information: preserve opaque namespaced state and accepted item snapshots; core displays ordinary item fields.
- Frozen history grows unbounded through embedded pack snapshots: bounded bytes plus content-addressed sharing and explicit eviction diagnostics.
- Statistical output suggests faithful game odds: consistent approximation/coverage labels and published weighting semantics.

## Backlog tickets to prepare after plan approval

Separate parent works for MOD-LOOT and HOST-LOOT (IDs chosen from actual ticket inventory by coordinator); each work package above becomes a child with dependencies and evidence. Faithful D2 engine, faithful Oblivion leveled lists, faithful Smash version-specific behavior, comprehensive catalogs, contextual table suggestions, identity alias authoring, advanced quantity expressions and additional import adapters remain explicit backlog. Suggestion metadata/tags and reason traces are included now; automatic context selection is deferred.

## Executable work breakdown for team assignment

Proposed paths are owned mod source files, not existing implementations. Each task delivers its source, tests and per-file wiki source note as applicable. Ticket IDs below are planning labels until coordinator allocates repository ticket IDs.

| Work | Depends on | Target files | Deliverable and required evidence |
|---|---|---|---|
| MOD-00 | coordinator G0 | mods/loot_simulator/schemas/*.json; docs contract owned by coordinator | Reviewed source/item/table/preset/roll schemas and host adapter examples; all fixture validation outcomes captured. |
| MOD-01 | MOD-00 | mods/loot_simulator/catalog.js, resolver.js; test/loot_catalog.test.js | Atomic pack staging, identity/version handling, eligibility reasons; invalid refs, conflicts, malicious/deep/oversized fixtures fail cleanly. |
| MOD-02 | MOD-01 | mods/loot_simulator/engine.js, rng.js; test/loot_engine.test.js | Flattened shared probability pool and seeded sampler; exact math/golden vectors and uniqueness/quantity termination evidence. |
| MOD-03 | MOD-01 | mods/loot_simulator/presets.js, migrations.js; test/loot_presets.test.js | Global library vs detached campaign presets, validated migration/import/export; roundtrip and unresolved-version diagnostics. |
| MOD-04 | MOD-02, MOD-03; host window capability | mods/loot_simulator/mod.js, ui.js, mod.json | Native MDI settings, authoring, preview and knowledge inspection; keyboard/manual walkthrough, no-preview-mutation assertion. |
| MOD-05 | MOD-04; HOST acceptance and storage gate | mods/loot_simulator/host_adapter.js, history.js; test/loot_integration.test.js | Guarded acceptance, portable history, source update review; generation+revision mismatch rejection, receipt idempotence and undo fixtures. |
| MOD-06 | MOD-02 | mods/loot_simulator/simulation.js; test/loot_simulation.test.js | Chunked/cancellable aggregates; fixed-seed frequency sanity, declared runtime/memory/storage limits and campaign-switch cancellation proof. |
| MOD-07 | MOD-01, MOD-02 | mods/loot_simulator/sources/{diablo2,oblivion,smash}.json (and zero-CORS JS bundle) | Reviewed starter packs with working declarative controls and provenance/coverage labels. Derive `oblivion` and `diablo2` definitions/provenance directly from existing authoritative workspace corpora (`campaigns/TheElderScrolls_Oblivion/campaign.json`, `Campaign Converter/sources/oblivion`, and `Campaign Converter/conversions/diablo2_complete/unpacked`), pin exact Smash title, and verify zero `FORBIDDEN_TOKENS` / `NON_ITEM_KEYWORDS` (`audit_campaign_quality.js`). |
| MOD-08 | MOD-05, MOD-06, MOD-07 | mods/loot_simulator/README.md; mod-specific release fixtures | Author guide, known limits, reproduction sample and complete gate evidence; independent review issue closure. |

The host guard contract must include BOTH campaign generation and state revision. An idempotency receipt key is dropID + resultID scoped to campaign identity; transaction receipt covers accept-all as well. A stale revision rejection leaves previews intact for explicit revalidation. Do not silently regenerate outcomes. Coordinator owns final interaction between global transaction key and per-result receipt keys so accepting one result then Accept All creates only remaining instances.

## Shared contract acknowledgement

Reviewed and aligned with 00-coordination-and-gates.md and 01-shared-contract.md. Those documents are authoritative for shared semantics and gates. MVP has no table-level weights: all eligible selected entries normalize source-wide. Empty sources are visibly excluded and remaining shares renormalize; a wholly empty pool blocks the roll. Contract-defined generation plus revision guards, per-result receipts, atomic undo and source-independent accepted snapshots apply.

Resource budgets defer to `01-shared-contract.md` (256 KiB inline campaign state ceiling for `localStorage` safety, 50 inline roll records, 5 MiB / 10,000 entries per imported pack in IndexedDB `CreatorStudioMapDB`), with benchmark validation at G1/release. Earlier per-mod budget examples are illustrative only. No unresolved product decision remains in this plan. G1 freezes concrete adapter names, numeric/RNG/hash algorithms, edition-specific starter coverage and measured budgets.

