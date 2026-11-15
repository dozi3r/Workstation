---
file_path: "src/workstation/scripts/wiki_engine.js"
title: "wiki_engine.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "c19fd5a5ea18afcd"
reviewed_hash: "c19fd5a5ea18afcd"
stale: false
size_bytes: 53210
line_count: 1321
---

# wiki_engine.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/wiki_engine.js` provides the zero-CORS bidirectional wiki, inverted backlink indexing, `@` mentions, `[[wikilinks]]`, autocomplete popover, hover preview cards, and deep cartographic navigation within Creator Studio.

### Core Subsystems & Responsibilities (ADR-0015 v2)
- **Extensible Wiki Token Registry**: Maintains `WIKI_TOKEN_TYPES` covering built-in types (`node`, `map`, `mod`/`module`, `faction`, `corridor`, `npc`, `item`, `quest`, `tracker`) and registers mod-extended token types via `window.CreatorStudio.registerWikiTokenType(spec)`.
- **Unified Bracket & Mention Parser**: Generates unified dynamic bracket token regex via `buildWikiBracketRegex()` and supports natural `@` mentions with quoted multi-word identifiers (`@"Sergeant Bob"`).
- **Scale-Fluid Nested Backlinks**: Computes trans-scale inbound citations for portal nodes using `getNestedBacklinksForNode(nodeId, mapId)`, reusing `getRecursiveNodeEntities()` across items, industries, and resources with cycle guards and performing a single backlink index build. Distinguishes direct citations from descendant sub-map and stationed entity citations with breadcrumb paths (`↳ via A > B > C`).
- **Entity Hovercards & Navigation**: Resolves hovercards and navigation targets (`navigateToWikiEntity`) across all entities, focusing the active map canvas on stationed nodes and opening entity inspector modals.
- **Dynamic Autocomplete Engine**: Powers `[[` and `@` popovers with ranked entity candidates (nodes, maps, slotted modules, factions, active NPCs, items, quests, trackers, and registered mod token suggestions).
<!-- END_CUSTOM_NOTES -->
