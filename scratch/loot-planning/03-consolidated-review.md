# Independent consolidated-plan review

Reviewed: 00-coordination-and-gates.md, 01-shared-contract.md, host-readiness-findings.md, mod-findings.md, and the independent-risk-audit.md evidence. Review date: 2026-11-08. This is document review only; no runtime gates or builds were run.

## Verdict

The reconciled package is comprehensive and ready for user review at G0. A second pass verified coordinator dispositions and amended team/shared contracts; no unresolved planning contradiction remains. It provides two separately assignable works, a coordinating agent, evidence-driven dependencies, a host adapter boundary, and measurable release gates. Implementation remains unauthorized. A plan-review pass is not a host-readiness, engine-correctness or release pass.

## Findings from the first pass (now dispositioned)

| ID | Severity | Finding | Required disposition / owner |
|---|---|---|---|
| CR01 | High planning contradiction | Mod contract item 6 names topology.modData.loot_simulator; host proposes campaign.extensions; shared contract requires campaign state without fixing physical location. Existing source confirms map-level modData hydration. | Coordinator explicitly supersedes the mod physical location with the shared campaign-global transport requirement. Host chooses the physical location at G1 and proves map/campaign navigation and all package paths at G2. |
| CR02 | High mathematical contradiction | Mod sampling normalizes tables separately before entries; shared contract normalizes all eligible entries within source. Equal table shares and equal entry weights produce different probabilities when table sizes differ. | Coordinator explicitly chooses source-wide entry normalization for MVP and supersedes equal-table normalization; omit table-weight controls or specify their exact contribution to entry mass in the frozen contract. Example fixture: one source, a 1-entry table and a 9-entry table, all item weights 1: shared contract gives each entry 1/10, not singleton 1/2. |
| CR03 | Medium coordination contradiction | Mod plan assigns G2 to engine and G3 to host; coordinator assigns G2 host, G3 engine. | Coordinator gate IDs are authoritative; team labels are superseded. Link all evidence and future tickets to coordinator IDs. |
| CR04 | High integration omission | Shared contract forbids name matching for resolution, but current mutation upsert can name-match on create fallback. Fresh ID alone may not prevent a name-based update. | Explicitly require create-only semantics that bypass name upsert, preserving existing same-name items. G2 test must include distinct supplied IDs and same names. |
| CR05 | Medium unresolved representation | Quantity is defined as units per slot, but normal host item schema mapping is not settled: one entity with count vs multiple entities affects possession, quest links, editing and acceptance receipts. | G1 explicitly freezes the physical host representation, field mapping, split/stack behavior and result-to-instance receipt cardinality. Do not claim this is merely UI grouping. |
| CR06 | Medium gate clarity | Shared contract leaves durable commit semantics and undo/reaccept behavior to G1. Team text says no P0/P1 issues at implementation approval while implementation starts after G0. | G0 may approve execution of discovery/contract work; feature code affecting those semantics waits for G1. Distinguish user approval of plan from actual contract freeze and runtime gates. |

Second-pass verification: 02-review-disposition.md explicitly resolves CR01–CR06. The mod plan now uses adapter-accessed campaign-global state, source-wide item normalization without MVP table weights, and central gate IDs. The shared contract now explicitly blocks name-upsert creation and assigns quantity representation plus durability/undo details to the G1 checklist. G0 authorizes discovery/contract work; dependent runtime implementation waits for G1. These findings are CLOSED AS PLANNING OMISSIONS; their runtime risks remain NOT RUN.

## Strengths verified in the plan

- Explicit source ownership, dirty-baseline capture and source-only team workspaces prevent accidental overwrites and conflicting generated builds.
- Existing promotion reuse, lifecycle duplication and explicit serializer risks are grounded in actual code and assigned to host work.
- Preview acceptance covers atomic batches, row-level idempotency, generation plus revision guards, undo conflicts and persistence failures.
- Weighted pool equations, global identity uniqueness, quantity independence, empty-source visibility and deterministic inputs are testable rather than vague promises.
- Portable campaigns must retain accepted knowledge without installed sources or mod code; missing/future schema handling is conservative.
- Import trust boundary distinguishes executable mods from declarative data and tests safe text rendering and offline script bundling.
- Exact mathematical fixtures establish correctness; empirical seeded simulation is supplementary evidence.
- Runtime gate definitions identify actual evidence, reviewers and revision fingerprints. Mock-only integration cannot pass.

## Additional gatecheck clarifications

These do not require expanding MVP scope; record them in G1 fixtures and gate evidence:

1. Define globally canonical item identity as namespace plus definition ID, not an unqualified local definitionId. Unique-mode fixtures include equal local IDs in different namespaces.
2. Include ordinary map navigation in campaign-global state tests, not only campaign A/B switching. Reopening the mod on another map must show the same campaign presets/history.
3. Separate interactive slot count from quantity units in simulation output; source frequencies count draws, not physical units.
4. Supply resource-limit fixtures for aggregate state, depth and string lengths in addition to single-file byte caps. 100 history entries does not bound 100 very large snapshots.
5. Pin each starter pack to a specific game edition/title before provenance review, especially Smash. This can be resolved by team data research; comprehensive game-fidelity claims remain excluded.
6. An accepted-item source update needs three-way comparison (accepted source baseline, current source, locally edited item) to uphold preservation of campaign edits.
7. Tests must distinguish browser persistence success from local folder/disk durability; permission/quota failures cannot report a fully saved acceptance.
8. Freeze public API contracts at G1, then let mod pure engine and host foundations proceed concurrently against identical fixtures. Changes reopen the affected gate.

## Gate status at this review

- Document review: COMPLETE — ready for G0 user review; CR01–CR06 have explicit reconciled planning dispositions.
- G0 user approval of reviewed plans: pending.
- G1 exact contract and fixtures: NOT RUN; planned work.
- G2–G6 implementation/runtime/release: NOT RUN.
- No production source, migrations, compiled bundles, ticket tracker or runtime behavior was changed by this review.

## Release recommendation

Keep the two teams and coordinator structure. Retain the coordinator dispositions and independent audit as the contract and adversarial test inventory. Require a fresh independent review of implemented integration; this planning review cannot certify behavior that does not yet exist.

