# Shared contract proposal: AdventureCAD host and Loot Simulator Mod

Status: proposed for G0/G1 review. Names below are interface proposals, not claims that these APIs exist.

## Boundary and capability contract

The host owns campaign identity, revision/generation tracking, instance IDs, mutation transactions, persistence, undo, entity inspection, and MDI integration. The mod owns source packs, item-definition resolution, drop calculations, presets, history content and UI. The host adapter returns structured success/error/warning envelopes consistent with ADR-0022. Capability negotiation fails clearly on unsupported host versions and disables acceptance while allowing safe inspection where possible.

Proposed adapter operations:

| Operation | Input | Output / guarantee |
|---|---|---|
| `getLootCapabilities()` | none | Host API version, supported persistence/acceptance capabilities |
| `readCampaignContext()` | none | Stable campaign ID, session generation, revision, selection/map context snapshot |
| `resolveItemReference(ref)` | Explicit type + namespace + stable ID | Cloned readable definition/prototype/entity snapshot, or structured missing result; never implicit name matching |
| `readModState(namespace)` | `loot_simulator` | Versioned cloned campaign payload |
| `commitLootAcceptance(request)` | Guarded batch below | Fresh item instances and receipt; one reversible mutation; idempotent retry |
| `commitModState(request)` | Expected campaign context + namespace payload | Validated campaign-scoped update through host save/history discipline |
| `inspectItem(ref)` | Definition or active item reference | Existing item inspector where feasible, mod knowledge reader fallback |
| lifecycle subscriptions | Load/unload/reset/rename/disable | Consistent cancellation/invalidation and unsubscribe behavior |

Prefer adapting existing mechanisms over adding exact API names verbatim. Freeze actual names and envelopes at G1. Audit existing direct calls and event bus load hooks for double dispatch. The implementation currently spells the rename callback `onCampaignRename` in `workstation_state.js`, while some documentation uses `onCampaignRenamed`; resolve against tests, not wording alone.

## Identity model

An item definition is reusable knowledge; an item instance belongs to a campaign. A loot row points to a definition and holds roll rules. A prototype is an existing AdventureCAD library object that may supply knowledge. A campaign item entity is a concrete object that may have ownership/location/quest relationships. These identities must not be conflated.

Proposed stable IDs use explicit namespaces: `sourceId`, `tableId`, `entryId`, `definitionId`; installed pack version/hash is separate from identity. Imported catalog namespaces cannot overwrite another source silently. Same-name items are distinct unless explicitly mapped by the author. References to host prototypes and campaign entities carry their type and scope. Reusing an active entity as knowledge copies its item details only and never clones owner/location/quest relationships by default.

The mod must not rely on `promotePrototypeToCampaign` for repeated drops. Existing promotion deduplicates against `prototypeId` and rewrites references. Each accepted result gets a new host item ID; two dropped copies share a definition reference but have independent mutable data. Knowledge links are not remapped as campaign instance references during clone/import.

Generic mutation upsert is also unsafe as an unqualified creation path: `campaign_mutation_engine.js:467-493` can resolve an existing record by name even when an explicit new ID was supplied. The host must expose creation-only semantics or prove a guarded engine path that cannot fall back to names. Test with a pre-existing custom item of the same name and verify it remains unchanged.

## Data shapes (conceptual)

Source pack: `schemaVersion`, `sourceId`, display name, source edition/version, pack version, provenance, settings schema, definitions, tables. A table contains stable entry IDs, definition references, positive finite relative weights, inclusive integer quantity bounds, eligibility tags/conditions and optional documented setting-driven modifiers. Source imports contain JSON data only; no JavaScript, eval, remote fetch, expression execution, arbitrary HTML or dynamic code.

Definition: stable ID, name, description, source provenance/citations, completeness/missing fields, tags, original-system rarity/value/mechanics, optional typed host reference, and source-specific structured facts. Do not fabricate absent mechanics. Preserve raw system labels; optional normalized tags are explicit author mappings. Shared knowledge may be shown through an extended existing inspector or a mod reader, but must not create two authoritative mutable descriptions.

Campaign mod state: schema version; campaign-owned preset copies; imported/custom pack content needed to reopen; pinned source versions/definitions needed by history; bounded history; acceptance receipts. Separate an optional machine-wide reusable preset library from campaign state. Editing a global preset must not silently modify saved campaign copies. Unknown fields belonging to other mods survive all paths.

Accepted item: normal host item fields (`id`, `name`, `category`, `specs`, `notes`, `status: "Active"`, `possessionMode: "stored" | "carried"`, `nodeId`, `submapId`, `ownerNpcId`, optional integer `quantity >= 1`) plus a namespaced payload (`extensions.loot_simulator`) holding definition ref, source/table/entry provenance, pack version/hash, immutable accepted knowledge snapshot, roll/result IDs, quantity, and explicit update history. Existing host fields remain editable. Review/apply updates performs a field-aware three-way comparison (accepted baseline, new source, local item edits) and preserves local edits unless the user explicitly chooses replacement. Removing source packs leaves accepted snapshots readable. All generated `specs` and `notes` must pass Sovereign Invariant #1 (`FORBIDDEN_TOKENS` and `NON_ITEM_KEYWORDS` in `audit_campaign_quality.js`).

## Pool mathematics

For enabled source s, let W_s be its nonnegative source weight. Resolve selected tables, validate entries, apply source settings/filters, and exclude nonpositive eligible entry weights. Let a_se be the resulting entry weight. Sources with W_s=0 or no eligible entries contribute no probability. Display excluded sources and why. Normalize only participating sources:

`P(entry e from source s) = W_s / sum(W_participating) * a_se / sum(a_sEligible)`.

Source weights specify total share rather than multiplying unnormalized item weights across catalogs. Selected overlapping tables can contain multiple intentional routes to the same definition; each row contributes once by stable table+entry identity, while repeatedly selecting the same table contributes nothing extra. Show aggregated definition probability and entry provenance. If an importer cannot distinguish duplicate routes from duplicate IDs, reject rather than invent intent.

Sampling uses a stable sorted entry order and a versioned specified pseudorandom algorithm, numeric normalization and draw procedure. Unique mode selects without replacement by definition ID across the complete pool, removing all routes to that definition after selection and recomputing participating source normalization. Thus equal source shares apply per remaining draw, not a quota over a unique batch. Quantity does not change selection weight.

Drop count means selected result slots. Each result draws an integer quantity from its entry bounds under the same versioned RNG procedure. Five slots can yield more than five physical units. Unique mode forbids selecting the same definition twice but permits one selected result to have quantity >1. Visual stacking/grouping must not change raw result identities or acceptance receipts.

G1 decision on quantity-to-instance mapping (`CR05` frozen): one host item entity is created per accepted result slot with a validated integer `quantity` field (`quantity >= 1`, default `1`) and separate host entity IDs for separate result slots. Host item bridge provides a post-acceptance Split/Stack operation so a stack of $N$ can be split into independent single-unit entities when assigning an individual item to an NPC or Quest. Do not silently discard quantity or expand a single stack into thousands of entities on roll acceptance. The request/receipt schema reports exact `{ resultId, itemId, quantity }` mappings.

Reject invalid requested counts and invalid weights/quantity bounds. No eligible entries means no roll and no success history entry. Unique exhaustion returns the available distinct definitions with requested/actual counts and reason. No hidden fallback to default filters or a different source.

## Reproducibility and history

Persist seed, RNG/engine/schema versions, canonical settings, effective resolved pool and quantities/provenance, result order, timestamp, and stable roll/result IDs. A seed alone is insufficient. Canonical serialization and content hashes detect changes; hash algorithm and encoding become G1 fixtures. Share immutable pool snapshots among history entries by content hash to control size, while retaining all reachable snapshots until their referencing entries are evicted.

Storage & performance budgets (right-sized for browser `localStorage` ~5 MiB origin ceiling):
- Inline campaign `extensions.loot_simulator` payload ceiling: **256 KiB** max (up to 50 compact roll records + campaign preset copies + acceptance receipts).
- User-imported custom packs (up to **5 MiB** / 10,000 entries per pack) and extended history/simulation caches live in browser IndexedDB (`CreatorStudioMapDB`), never raw `localStorage`.
- Portable exports (`.creator.json`, `.zip`, bound project folder) embed only the immutable definition snapshots referenced by accepted items and retained campaign history.
- Interactive drop cap: 100 result slots; simulation cap: 100,000 draws per job (chunked/cancellable). Validate bytes, depth, array lengths, strings and aggregate state before mutation. At a limit, show the rejected operation or explicit retention choice; never silently lose accepted items. Accepted snapshots are not evicted with history.

History retains result snapshots even if exact replay cannot be supported. Never label a recalculation against updated sources as an exact replay. Legacy/unknown engine versions display retained outcomes and an explicit replay-unavailable reason. Simulation uses separate RNG state and cannot alter the next interactive roll. Simulation is read-only campaign-wise unless the user explicitly saves its summary; it creates no items and does not fill history with individual simulated drops.

## Acceptance transaction

Request includes API version; campaign ID, session generation and expected revision; roll ID; selected result IDs; immutable result payloads/digest; optional validated node/map/owner destination; and idempotency keys derived from roll ID + result ID within the campaign. Host validates current context, result integrity, destination existence, supported item schema and limits before changing any item.

Host creates all requested instances or none, updates receipt state in the same transaction, atomically enforces Sovereign Invariant #5 reciprocal crosslinks (`node.itemIds[]` on the target `submapId`, `npc.carriedItemIds[]` when `possessionMode === "carried"`, and `quest.itemIds[]` when linked, plus `ownerNpcId: null` when `possessionMode === "stored"`), records one audit/undo batch, saves through the existing persistence discipline, and returns created/existing IDs. Retrying an accepted row returns its receipt; separately generated results for the same definition remain separate. Partial acceptance records each row independently. Repeating accept-all adds only rows not previously accepted. Failure produces a structured error and no partially accepted state. Browser `localStorage`/IndexedDB success and bound disk-folder durability are reported distinctly in the response envelope rather than claiming disk success prematurely.

Undo (`revertBatch`) compensates the exact acceptance batch, its receipts, and all reciprocal foreign-key arrays (`node.itemIds`, `npc.carriedItemIds`, `quest.itemIds` via `ENTITY_REFERENCE_DESCRIPTORS`), without deleting independently edited/linked items silently. If subsequent edits prevent safe compensation, report a conflict and require a reviewable resolution. Successful undo clears the corresponding acceptance receipt so the preview row can be explicitly re-accepted if desired. Generic prototype promotion semantics remain unchanged.

## Persistence and compatibility matrix

Team A must prove each row, with a host change only where a test demonstrates a gap:

| Path | Required outcome |
|---|---|
| Browser save/reload and campaign switch | Campaign presets/imported data/history/receipts and accepted snapshots survive; no campaign bleed |
| Rename | Display name changes; identity/reference semantics remain stable; no duplicate state |
| Save As / clone | New campaign scope; instance references remap; source definition identities remain stable; receipts scope to the clone |
| Portable JSON / ZIP / bound folder | Self-contained accepted knowledge and campaign-required source state survive |
| Full import | Validate versions before commit; preserve namespace and snapshot references |
| Selective merge | Explicit policy for selected item snapshots, source conflicts, preset/history inclusion; no accidental wholesale source-campaign state overwrite |
| Mod disabled or missing | Host still renders/edit ordinary item fields; preserves opaque data and accepted snapshot access |
| Newer schema / older host | Preserve data; block unsupported mutation; clear compatibility message |

Selective merge proposal: transfer accepted-item snapshots with selected items; transfer only their required definition snapshots; do not import unrelated history or presets by default. Offer explicit full mod-state import separately with collision preview. Test deletion/cascade, remapping, undo, co-authoring and entity editing against namespaces and receipts.

Current `state_adapter.js:154,368` copies/hydrates `modData` with map state, and `workstation_state.js:786-895` (`initTopology`) returns early on multi-map campaigns after hydrating `creator_studio_campaign_entities` without reading `creator_studio_active_topology`. Therefore, campaign-wide mod state (`extensions`) must be persisted and hydrated alongside `creator_studio_campaign_entities` (as well as `campaign.json`, `preset.json`, `topology.json`, `entities.json`, `campaign_exporter.js`, and `selective_importer.js`). Host owns the transport location; mod code accesses it strictly through the adapter and never assumes `topology.modData.loot_simulator`.

## G1 decision checklist

G0 approves scope, ownership, proposed semantics and this gated process. G1 freezes the concrete implementation contract before dependent runtime code. Required decisions: actual host API names/version/errors; campaign extension envelope location and all transport owners; quantity-to-instance mapping; persistence durability/failure semantics; idempotency/undo/re-accept rules; deterministic RNG algorithm, numeric limits, canonicalization and hash encoding; validated setting vocabulary and safe condition operators; exact source-pack editions and starter coverage; collision/update UX; measured data/history budgets; late/duplicate lifecycle compatibility and supported runtime/browser matrix. Record each decision with fixtures, owner, rationale and both teams' acknowledgement. A changed product behavior returns to the user; a routine implementation choice can be resolved by the coordinator with reviewer evidence.

## Security and future extension

Treat item prose and pack fields as untrusted content: safe text rendering or the project's verified sanitizer, safe citation links, and escaped offline bundling including `</script>` cases. Block prototype pollution and reject unsupported conditions/schema versions. Parsing/validation stages work on detached data, committing only after the entire pack passes. Runtime mod code remains a separate trusted extension installation path, never a table import path.

Future faithful engines use an explicitly versioned engine interface and identify game/edition; declarative table packs cannot execute code. Future contextual suggestions read a host-supplied context snapshot and return proposed preset/table selections with reasons. They do not mutate selection automatically. These extension seams need names and boundaries now, not implementation in MVP.
