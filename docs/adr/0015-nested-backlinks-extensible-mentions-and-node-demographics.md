# ADR 0015: Nested Scale-Fluid Backlink Propagation, Extensible Wiki Mentions, and Node/Corridor Demographics

## Status
Accepted (2026-10-30); **Amended v2 (2026-10-31)**. See the Amendment section at the end, which supersedes conflicting Decision items.

## Context
Creator Studio's Visual Basic 6 Property Grid Inspector (`src/workstation/scripts/property_grid_inspector.js`) and offline Bidirectional Wiki Engine (`src/workstation/scripts/wiki_engine.js`) provide inline entity inspection and `@` / `[[...]]` cross-referencing. However, as campaigns scale across recursive sub-maps and rich entity rosters, four functional gaps emerged:

1. **Restricted Token Vocabulary**: The bracket token lexer supported only `Node`, `Map`, `Mod`, `Module`, `Faction`, and `Corridor`. Mentions of NPCs (`[[NPC:...]]`), Items (`[[Item:...]]`), Quests, or custom entities registered by Workstation Mods lacked formal bracket syntax and typed autocompletion.
2. **Shallow Citation Visibility (Scale-Fluid Isolation)**: Portal nodes (`node.childMapId`) did not roll up backlinks targeting their nested descendant nodes, submaps, or stationed NPCs. If a farm node noted that an NPC stationed in an outpost's submap barracks had gone missing, inspecting the outpost portal node showed `(No inbound citations)`, breaking spatial awareness for GMs operating at the parent map tier.
3. **Absence of Demographics & Geopolitics on Nodes & Corridors**: Worldbuilders had no native mechanism to record species/peoples presence or faction control on nodes or transit corridors without burying this information in freeform text notes. Manual typing caused spelling divergences (e.g. "Goblin" vs "goblins").
4. **Unstructured Party Rapport**: Campaign GMs lacked an immediate, at-a-glance stance and lore rationale field for how settlements view the player party before the upcoming Event Tracker subsystem is introduced.

## Decision

1. **Extensible Wiki Mentions & Mod Registration Hook**:
   - Expand the bracket token lexer to recognize `[[NPC:...]]`, `[[Item:...]]`, `[[Quest:...]]`, and `[[Tracker:...]]`.
   - Expose `window.CreatorStudio.registerWikiTokenType(spec)` allowing workstation mods (`mods/<id>/mod.js`) to register custom prefix types, resolvers, and autocomplete suggestions.
   - Natural `@` mentions scan across all active campaign entities (Nodes, Maps, NPCs, Items, Quests) with typed badge glyphs in the autocomplete suggestions.

2. **Transitive Nested Backlink Aggregation**:
   - The Wiki Engine computes transitive backlinks for portal nodes: querying a node checks for direct citations (`node:id`), direct citations of entities stationed on that node, and recursively queries all descendant maps pointed to by `childMapId`.
   - In the Property Grid Inspector, backlinks are visually partitioned into **Direct Citations** and **Nested Sub-Map Citations** (displaying full breadcrumb paths, e.g. `↳ via Outpost Interior > Barracks [#2] > Sgt. Bob`).
   - Cyclic submap references are intercepted via visited-set cycle detection.

3. **Demographics & Factions with Dynamic Campaign-Wide Suggestion**:
   - Both Pointcrawl Nodes and Transit Corridors feature `demographics` and `factions` string arrays.
   - Authoring uses non-blocking chip/tag rows directly inside the Property Grid with an inline `<input list="...">` `<datalist>` dropdown that harvests all distinct tags already entered across the active campaign without modal dialog interruptions.

4. **Structured Party Rapport & Lore Rationale**:
   - Introduce `partyReputation` on Nodes and Corridors containing an integer stance (`-2` Hostile to `+2` Revered) and a narrative notes string for local context.
   - Backwards-compatible with legacy single-string formats.

## Consequences

- **Positive**:
  - GMs inspecting macro portal nodes immediately see all lore connections and quest ties anchored anywhere inside nested sub-maps.
  - Demographics and factions become structured queryable attributes ready for procedural encounter tables and hazard rolls.
  - Workstation mods can extend the in-app wiki syntax without modifying core compiler scripts.
- **Negative / Trade-offs**:
  - Deeply nested submaps with dozens of nodes require recursive crawl during index refresh; mitigated by caching and executing during `buildWikiIndex()` rather than every canvas render frame.

---

## Amendment v2 (2026-10-31): Supersedes Decision §1-4 Where They Conflict

An independent pre-execution audit found that the original decision would have corrupted existing data and regressed shipped invariants. No code from the original decision had been implemented. The following rules **supersede** the Decision section above; the original text is retained for history.

1. **Demographics are a superset of the SYS-RACE-02 census, not a flat array.**
   - Nodes: `demographics = { primary?, minorities: [], social_friction_notes?, tags: string[] }`. Corridors: `{ tags: string[] }`.
   - Chip UI edits `tags` only. `primary` / `minorities` are never rewritten by the chip UI (protects `network/generic_network_topology.json` and the slotting census readout in `stage_5_slotting.js`).
   - All reads go through `normalizeDemographics()` (accepts `undefined`, legacy array, or census object) and `getDemographicNames()`.
2. **Factions: keep `node.faction`; add `factionPresence`.**
   - `node.faction` (Controlling Faction) is unchanged and remains the input to corridor tension math.
   - New `factionPresence: string[]` on nodes and corridors. The field name `factions` is rejected.
3. **Party Rapport reuses the NPC disposition scale.**
   - Field name `partyRapport` (not `partyReputation`) = `{ stance: -2..2, notes }`.
   - Labels come from a shared `PARTY_STANCE_LABELS` constant: Hostile / Unfriendly / Neutral / Friendly / Allied (identical to `setNpcPartyDisposition`). The labels Suspicious / Welcomed / Revered are rejected.
4. **Wiki tokens are registry-driven.**
   - A single `WIKI_TOKEN_TYPES` registry and one regex factory feed **both** `extractTokensFromText()` and `renderWikiDecoratedText()`. Unregistered `[[X:...]]` text stays literal (no catch-all type pattern).
   - Each type supplies `resolve`, `navigate`, `hovercard`, and `getSuggestions`; `navigateToWikiEntity`, `showWikiHovercard`, and `openWikiAutocomplete` delegate to it.
   - `registerWikiTokenType` is added as a property on the existing `window.CreatorStudio` object (never reassigning it, which would drop `registerMod`).
   - Multi-word mentions use `@"Multi Word"`; autocomplete inserts the quoted form.
5. **Nested backlinks reuse `getRecursiveNodeEntities()`.** No second crawler. Backlink aggregation rebuilds the index at most once per query (`getBacklinksForEntity(..., { skipRebuild: true })` for inner lookups). `appendBacklinksPropRow` keeps its polymorphic `(tbody, entityType, entityId)` signature so map inspection continues to work.
6. **Shipped invariants are binding.** Every demographic / faction-presence / rapport mutation calls `pushHistoryState()` before mutating (SYS-START-10). Chip edits update their own cell in place without rebuilding the property grid.
7. **Round-trip persistence.** Campaign JSON export and `importCampaignData()` must carry `demographics`, `factionPresence`, `partyRapport`, and the previously dropped `provides`, `requires`, `exportDown`, `importUp`.

Execution plan with defect ledger and red-first SUITE 19: `plan_nested_backlinks_and_demographics_v2.md` (conversation artifact).
