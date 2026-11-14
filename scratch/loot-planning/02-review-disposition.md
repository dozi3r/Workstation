# Coordinator disposition of planning review

Status: planning reconciled for user review. Runtime work and gates remain NOT RUN. This document resolves competing proposals; `00-coordination-and-gates.md` and `01-shared-contract.md` are authoritative.

| Finding | Disposition | Owner / evidence gate |
|---|---|---|
| CR01 campaign state location | Resolved in planning. Mod schema item 6 requires adapter-accessed campaign-global transport (`extensions.loot_simulator`, capped at 256 KiB inline for `localStorage` safety, with large custom packs in IndexedDB `CreatorStudioMapDB`), persisted in `creator_studio_campaign_entities` (fixing `initTopology` multi-map early return) and all package formats. | Host; G1 fixtures and G2 map-navigation, multi-map reload, plus all-format round trips |
| CR02 table probability conflict | Resolved. MVP has no table-level weights; all eligible entries across selected tables normalize within their source. | Mod; G3 exact 1-entry + 9-entry equal-weight fixture gives every entry 1/10 |
| CR03 conflicting gate numbers | Resolved. Central G0–G6 exclusively govern both teams. Local M/H and MOD/HOST labels are task IDs. | Coordinator; all gate evidence references central IDs |
| CR04 name upsert | Resolved as a mandatory requirement. Shared contract requires create-only semantics (`create_entity` / `options.createOnly`) that bypass name fallback even with fresh IDs, plus Sovereign Invariant #5 reciprocal crosslink sync (`node.itemIds`, `npc.carriedItemIds`, `quest.itemIds`) on create and `revertBatch`. | Host; G2 existing same-name item remains unchanged and `audit_campaign_quality.js` passes |
| CR05 quantity representation | Resolved for G1. Each accepted result slot creates one host item entity with integer `quantity >= 1` (default `1`) and a unique entity ID, paired with a host Split/Stack helper for single-unit assignment to NPCs/Quests. | Host + mod; G1 physical quantity fixture; G2/G4 behavior |
| CR06 approval versus contract freeze | Resolved. User G0 approval authorizes baseline/contract work; dependent runtime feature implementation waits for G1 agreement. | Coordinator; G0 approval and G1 signed fixture packet |
| CR07 zero-CORS bundling & corpus provenance | Resolved. Starter packs compile into zero-CORS JS for `file:///`; `diablo2` and `oblivion` starter items draw from verified `Campaign Converter` corpora and pass `FORBIDDEN_TOKENS` / `NON_ITEM_KEYWORDS` checks; `promptLoadRuntimeModFile` rejects `.json` data packs. | Host + mod; G2/G3 verification |

## Additional reviewer clarifications adopted

Canonical definition identity means namespace plus definition ID; source-disjoint equal local IDs are distinct. Source frequencies count selected slots, while quantity-unit totals are separate. Aggregate byte/depth/string budgets are mandatory. Starter editions/titles and provenance are frozen at G1 before content implementation; choosing illustrative coverage does not imply faithful simulation. Source update review compares accepted baseline, new source, and local edits. Browser storage and disk/folder success are reported separately. Every contract change reopens affected fixtures and gates.

## Risk disposition

R01–R06 in the independent audit are required host/mod implementation blockers for the affected paths. R07–R11 are mandatory high-priority release checks. Recording the requirement closes a planning omission, never the underlying runtime risk. All remain unverified until implementations and actual evidence exist. Independent review must rerun against the combined code; author self-review cannot substitute.

## Current status

- Planning package produced and reconciled: complete.
- Independent document review: see `03-consolidated-review.md` for reviewer verdict.
- User approval of reviewed plans (G0): pending.
- Exact interface/schema/RNG/quantity/limits freeze (G1): planned, not completed.
- Host, engine, integration, adversarial runtime and release gates (G2–G6): NOT RUN.
- Product implementation, migrations, builds and ticket generation: not performed.

## Next authorized step after approval

Coordinator records the current working baseline without disturbing existing work, allocates real local ticket IDs, and assigns HOST-00/HOST-01 and MOD-00 contract tasks. Both teams return matching contract fixtures, chosen host transport/quantity mapping and failure semantics for G1 review. Runtime implementation then follows the dependency schedule. Any proposed product behavior change returns to the user; routine engineering choices remain with the coordinator and reviewers.
