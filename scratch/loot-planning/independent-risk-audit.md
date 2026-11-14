# Independent red-team review: modular loot planning

Status: planning audit, not implementation approval. Reviewed the accepted conversation design against current source. No application code changed or builds run.

## Evidence that changes the plan

1. `src/workstation/scripts/entity_core.js:971` promotes prototypes, but line 979 returns an existing active entity for the same prototype. Calling this for repeated drops collapses independent items. It is not a general item-instance factory.
2. `src/workstation/scripts/campaign_mutation_engine.js:447` upserts entities. Lines 467–493 resolve by name/title, including fallback when an explicit ID does not identify an existing record. Distinct same-name loot instances could update one another. The host contract must provide explicit create semantics that never name-deduplicate.
3. `src/workstation/scripts/workstation_state.js:308` registers mods; line 316 subscribes a load handler. `src/workstation/scripts/state_adapter.js:1257` directly dispatches load callbacks, then line 1271 emits campaignLoaded. A path can therefore deliver duplicate load callbacks. Contract tests must verify behavior rather than assume exactly-once delivery.
4. The implementation uses `onCampaignRename` (`workstation_state.js:328`), while CONTEXT vocabulary says onCampaignRenamed. Source is authoritative; standardize and compatibility-test the published spelling before parallel teams code against it.
5. `state_adapter.js:154` copies active topology modData into the active map and line 368 hydrates it from target map. This demonstrates map-scoped handling, not proof of campaign-global extension state. Presets/history must not disappear or fork on ordinary map navigation.
6. `campaign_exporter.js:112` serializes items using explicit campaign fields. `map_store.js:1502` and `pack_engine.js:714` also construct explicit entity payloads. Existing item-array preservation does not prove arbitrary extension-state round trips across every save/import route.
7. ADR-0022 specifies programmatic mutation envelopes, changelog and compensating undo. Loot acceptance must integrate with the supported mutation system rather than silently editing arrays.
8. `AGENTS.md` requires offline file execution, modular sources, and centralized compilation. Mods README and `mods/Update-Mods.ps1` describe build-time discovery. Installing data packs at runtime and installing executable mods are different capabilities and need distinct contracts.
9. `docs/agents/issue-tracker.md` makes local Markdown ticket files authoritative; generated manifest/HTML must not be hand-edited. Approved ticket statuses and blocked_by relationships already exist.

## Blockers and objective release conditions

| ID | Severity | Failure | Required proof before release |
|---|---|---|---|
| R01 | Blocker | Repeated loot overwrites an existing item | Accept two drops of the same definition into separate records with distinct IDs; existing same-name custom item remains byte-equivalent. |
| R02 | Blocker | Campaign or map transition loses/leaks state | Campaign A → map A2 → campaign B → A preserves A presets/history and exposes none in B; include open loot window and pending simulation. |
| R03 | Blocker | Save route discards knowledge or presets | Round-trip all supported campaign formats and workspace saves; missing mod preserves opaque data, re-enabling restores it. |
| R04 | Blocker | Reaccepting or stale previews duplicates/writes into wrong campaign | Double-click accept and retry share an idempotency key; campaign generation mismatch rejects mutation; one accepted batch has one undo record. |
| R05 | Blocker | Untrusted imported text becomes executable markup or code | Data-only JSON schema; no eval/script/function imports; hostile names/descriptions/tags/settings labels render as text or sanitized supported markup. Prototype-polluting keys rejected. |
| R06 | Blocker | Failed migration destroys user data | Unknown future schema remains preserved/read-only; old schema migrates on a copy; invalid migration leaves original unchanged with actionable error. |
| R07 | Major | Probability UI contradicts actual sampler | Enumerated toy fixtures match documented probabilities exactly; zero/negative/nonfinite/overflow weights rejected or explicitly disabled by schema. |
| R08 | Major | Reproducibility falsely promises seed-only replay | Exact replay fixture includes engine version, PRNG version, canonical ordering, normalized settings, resolved eligible pool/weights/quantities, source versions and definition snapshots/hashes. Changed sources cannot silently reroll a different result. |
| R09 | Major | Uniqueness bypassed by duplicate table rows | Multiple rows referencing the same canonical definition cannot produce duplicate unique items. Source-disjoint same-name items remain distinct. |
| R10 | Major | Simulation blocks the workstation or grows storage without limit | Bounded item/batch/import sizes and history byte budget; cancellation works; large run processes in worker or yielding chunks; no active-roster mutations from simulation. |
| R11 | Major | Mod-disabled host breaks existing campaigns | Baseline old campaigns, existing promotion behavior, entity editor/quest links/export remain correct with mod absent. |

## Probability semantics that must be frozen before implementation

- Define eligible entry mass w(e), including table weighting if offered. For source s with share W(s), combined mass is p(e)=W(s)/sum(W(active))*w(e)/sum(w(eligible in s)). Empty sources have no eligible mass; UI must show the resulting effective shares and excluded source rather than claim original shares still hold.
- Source share applies to draws, not quantity units. An entry returning a stack of 100 arrows must not silently count as 100 draws for source-frequency summaries.
- Define requested count as number of result entries/stacks. Each entry quantity uses a documented integer distribution, separately sampled. Otherwise quantity and five-item semantics conflict.
- Unique mode requires weighted sampling without replacement by canonical item identity, not row identity. After selecting an identity remove all its rows; recompute effective source shares among nonexhausted sources. UI explains that equal shares cannot remain fixed once one source is exhausted.
- A shared item listed in multiple tables accumulates weight only according to an explicit overlap policy. Recommended: stable entry IDs allow deliberate multiple contributions, but source-level eligibility UI exposes combined identity probability. Never accidentally double-import a table.
- Distinguish impossible whole pool from an individually emptied source: no whole-pool candidates blocks; some empty sources are excluded with a visible warning. Do not broaden filters.
- No implicit cross-game rarity/value/level equivalence. Native values retain source namespaces; common tags are curated mappings with provenance.

## Knowledge and instance adversarial cases

- Name is not identity. Namespaced definition IDs remain stable through renames; campaign instance IDs are distinct.
- Do not turn every table row into a campaign entity merely to make it inspectable. Knowledge catalog entries can remain latent; existing item entities may be linked where appropriate.
- Existing campaign item reuse must not use that mutable item as the permanent canonical source for every future drop without explicit handling. Snapshot at acceptance and retain provenance.
- Updating a source must not overwrite campaign edits. A comparison must show old snapshot, new source and local changes; unavailable source still permits inspection/export of accepted item.
- Removing a pack used by saved presets/history must produce unresolved references with preserved data, not delete presets or make the entire window fail.
- Item description, mechanics, provenance and completeness must remain readable from the existing entity inspector, not exclusively from the mod UI.
- Avoid claiming every starter entry is comprehensive; include provenance/completeness and game/version identity. Source identity includes the selected Smash title and Diablo/Oblivion editions.

## Two-team gate ownership

- Coordinator owns the versioned shared contract and fixture corpus; neither team changes it unilaterally. The host team owns generic APIs and existing-flow regression tests. Mod team owns algorithms, source data, source settings, simulation and its own UI.
- Host team must supply a test double/adapter satisfying the frozen contract so mod development can proceed independently. Passing a mock is not evidence of host integration.
- Contract gate must cover capabilities/version negotiation, explicit instance creation/idempotency/undo, opaque campaign extension persistence, definition lookup, lifecycle teardown and safe MDI registration.
- Integration gate runs only from the coordinating checkout after both source changes land. Team worktrees remain source-only. One owner updates generated bundles/wiki/tracker; no concurrent generated-file merges.
- Preserve the current dirty checkout. Establish a recorded baseline revision plus preexisting-change inventory before any implementation worktrees. Tests failing at baseline must be distinguished from regressions, never waived silently.
- Planning red-team completion means issues recorded with severity, owner and disposition. It does not equal passing runtime gates. No implementation authorization is inferred from accepting design.

## Gatecheck packet required for each gate

Include gate ID, exact source revisions, baseline, acceptance criteria, commands/manual procedures, actual outputs, fixture versions, unresolved findings, reviewer and explicit pass/fail. No gate passes while an unaccepted blocker remains. Major risk acceptance must identify user-visible limitation and approving owner.

## Mandatory adversarial matrix

1. Two identical drops plus existing same-name custom entity; accept individually, entire batch, double click, retry after interruption, undo then redo.
2. Navigate map/campaign, rename, Save As, reset/new campaign, disable/re-enable mod while window open and while simulation running.
3. JSON export/import, ZIP, folder save, selective merge and collision cloning: references remapped, source IDs unchanged, instance IDs reconciled.
4. Empty source, all-empty pool, 0 weights, very large weights, fractional weights, NaN-like input, count 0/negative/over cap, quantity range reversed.
5. Unique pool smaller than request, aliases across tables, filtered-out source, source exhausted mid-batch.
6. Import oversized/deep nesting, duplicate IDs, corrupt schema, unknown future schema, markup injection, unsafe keys, unsupported declarative setting type.
7. Repeat seed with stable inputs, reorder JSON objects, update/remove pack, change algorithm version; exact replay remains exact or explicitly unavailable.
8. Storage quota/write failure mid-accept, partial validation failure: no partial roster mutation or falsely marked acceptance.

## Review verdict

The product design is viable, but current prototype promotion, name-resolving upsert and map-scoped modData are unsafe foundations unless the host readiness contract explicitly addresses them. These are implementation blockers for their affected paths, not reasons to enlarge the mod into a parallel item system. Independent consolidated-plan review remains pending.
