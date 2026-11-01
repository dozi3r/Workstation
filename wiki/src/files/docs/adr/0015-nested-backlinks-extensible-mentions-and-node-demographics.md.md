---
file_path: "docs/adr/0015-nested-backlinks-extensible-mentions-and-node-demographics.md"
title: "ADR 0015: Nested Scale-Fluid Backlink Propagation, Extensible Wiki Mentions, and Node/Corridor Demographics"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "87d7098a97456e6f"
reviewed_hash: "87d7098a97456e6f"
stale: false
size_bytes: 7473
line_count: 69
---

# ADR 0015: Nested Scale-Fluid Backlink Propagation, Extensible Wiki Mentions, and Node/Corridor Demographics

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`docs/adr/0015-nested-backlinks-extensible-mentions-and-node-demographics.md` serves as a **Architectural Decision Record (ADR)** within **Volume I: System Architecture, Governance & Ontology**.

### Amendment v2 (2026-10-31)
The original Decision was amended before any implementation. Binding rules: demographics extend the SYS-RACE-02 census object (chips edit `tags` only); `node.faction` is preserved and `factionPresence` is added; `partyRapport` reuses the NPC Hostile/Unfriendly/Neutral/Friendly/Allied scale; wiki tokens are registry-driven with one shared regex; nested backlinks reuse `getRecursiveNodeEntities()`; all mutations call `pushHistoryState()`; export/import must round-trip the new and previously dropped node fields. Canonical terms live in [[File:CONTEXT.md]].
<!-- END_CUSTOM_NOTES -->
