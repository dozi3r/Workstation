# Onboarding findings: 2026-11-09

This dated reference separates observed evidence from unresolved documentation drift. Re-check relevant evidence before implementation; this is not a new backlog or a claim that the whole system was audited.

## Baseline observed before this documentation task

| Item | Observation |
|---|---|
| AdventureCAD HEAD | `22516681710f41dd8e5f07fe7b2c618bf20bcda7` |
| Recent completed work | Four architecture sprints: mutation owner, session projection/teardown, roster navigation, portable packages/dual adapters |
| AdventureCAD working tree | 464 modified, 14 deleted, 23 untracked status entries at initial observation; includes campaign data, generated wiki/bundles, Test-Suite.ps1, and deleted research reports. These changes predate this task. Counts change as work continues. |
| User-reported status | `/improvecodebasearchitecture` ran and minor bugs were fixed. This statement is context, not a fresh full-suite result from this onboarding. |

## Conflicts and how to proceed

| Topic | Evidence | Handling |
|---|---|---|
| Developer guide source map | `docs/AI_DEVELOPER_GUIDE.md` names older files such as `workstation_core.js`, `entity_manager.js`, `stage_5_slotting.js`, and `stage_6_export.js` under workstation scripts; current owners have been split/renamed. | Read its design rationale, then resolve current ownership through [architecture routes](ARCHITECTURE_MAP.md), graph queries, and actual source paths. |
| Offline vs local server wording | Root rules emphasize standalone `file:///`; ADR 0016/0022 and current `server.js` / `server.ps1` also support loopback co-authoring. | Preserve offline operation while using explicit server adapters when available. Do not infer that all network operations are forbidden in every mode. |
| Generated instructions | Header says AGENTS.md is generated from the manifest; prose and task pointers are actually templated in `build_suite.js`. | Update the generator for durable prose changes, and the manifest for surface metadata. |
| Graph misses | A lookup for `CampaignSessionProjection` returned no declared symbol even though recent commits discuss session projection. | Search current owner source with a bounded query. Architectural concepts need not be symbol names; an index miss is not proof of missing behavior. |
| "Zero-token" tooling labels | Graph tools and Git reduce the amount of code to read but still return text into the conversation. | Use compact queries and bounded output. Token savings depend on retrieval scope, not the label. |

## Maintenance triggers

- On a source ownership change, update the affected route in [context-index.json](context-index.json) and [architecture map](ARCHITECTURE_MAP.md).
- On a resolved conflict, replace its handling with the fixing commit / evidence; avoid growing a second permanent history log.
- On a new task, inspect current Git status and relevant file fingerprints. The compact helper compares selected files to a dated reference, not all source or all wiki notes.
- Store current task state with [a handoff](HANDOFF_TEMPLATE.md); preserve existing domain definitions and ADRs as the decision authorities.

## Validation of these artifacts

On 2026-11-09:

- The onboarding context index is now project-local: five documents, nine routes, and 15 selected AdventureCAD-owned source fingerprints. Run `node scripts/agent_context.js --check` for current link counts, startup size and freshness.
- Exercised route retrieval, invalid-route failure behavior, project-root containment, and persistence of the startup pointer after regeneration. `node --check` passed for the retrieval helper and modified build generator.
- `node build_suite.js` succeeded and generated the router, wiki pages, and graph. Seven new source pages have curated wiki custom notes linking the onboarding artifacts.
- `node scripts/test_suite.js`: build, headless JavaScript, campaign-package validation, wiki phase, and Node loopback probe passed during that invocation. PowerShell/.NET loopback probe failed with `connect ECONNREFUSED 127.0.0.1:8992`; the cause was not diagnosed in this documentation task. The full suite therefore **did not pass**.
- That default test invocation internally passed `--stamp-reviewed` to the build. Its apparent zero-drift result did not represent review of unrelated files. Restored the five unrelated pre-existing scratch/loot-planning reviewed hashes and rebuilt normally; expect those five stale notes to remain until their owning work reviews them.

The final normal build preserves those unrelated review markers. Use [operations](OPERATIONS.md) for a stamp-free build-then-test sequence. No campaign content, installation targets, or existing research deletions were intentionally edited by this task. Generated outputs were refreshed by the normal project build.

## Project boundary clarification

AdventureCAD is independent of package-producing projects. Its only exchange contract is completed portable campaign output accepted by its own loader. Onboarding routes, fingerprints and validation commands stay within this project. Producer-specific findings and source fingerprints live with the producer. No producer-specific reference was found in the inspected workstation runtime, server or package loader sources; the initial onboarding tooling had introduced cross-project references, which were removed.

### Remaining temporary-tooling exceptions

The broader boundary scan found legacy producer-coupled diagnostics under `scratch/`. These are outside the inspected workstation runtime/server/loader paths, but prevent claiming that the entire folder is isolated:

- `scratch/check_raw_topo.js`, `scratch/check_raw_links.js`, `scratch/inspect_node_shape.js`, and several other inspection scripts read a producer workspace's extraction or synthesis intermediates through hard-coded paths.
- `scratch/run_update.js` contains conditional writes to a sibling producer output copy as well as local campaign files. Do not run it as project-local maintenance without separating those targets.
- `scratch/loot-planning/mod-findings.md` and `02-review-disposition.md` refer to external corpora in draft planning/review notes. These pre-existing notes were not rewritten or stamped reviewed by the boundary correction.
- `campaigns/jttw_5_flaming_mountains/campaign.json` retains a producer credit in its author field. This is supplied package provenance, not executable coupling.

These observations do not authorize deleting or relocating existing scratch work. Separate producer-specific diagnostics from workstation maintenance before claiming repository-wide independence. Runtime independence and folder-wide cleanup are distinct findings.
