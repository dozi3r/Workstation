---
file_path: "docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md"
title: "0006: Comprehensive Module Explorer, Worldbuilding Sourcebook & Multi-Tier Mechanics Inspector"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "aa32d1b7275124f4"
reviewed_hash: "aa32d1b7275124f4"
stale: false
size_bytes: 4362
line_count: 34
---

# 0006: Comprehensive Module Explorer, Worldbuilding Sourcebook & Multi-Tier Mechanics Inspector

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`docs/adr/0006-comprehensive-module-explorer-and-mechanics-inspector.md` formalizes the Module Explorer architecture within **Volume I: System Architecture, Governance & Ontology**, establishing `start.html` as the primary, authoritative environment for exploring, slotting, and extracting data from all 118+ worldbuilding modules.

### Key Decision Matrix
1. **Module Explorer as the Primary Source of Module Truth**:
   Hosts an integrated Win95/VB6 multi-pane workstation dialog (`#modal-module-explorer`) containing all 118+ modules across `campaigns/generic_starter`, `campaigns/opal_island`, and `campaigns/sun_wukong`.
2. **Four-Tab Deep Inspection Architecture**:
   - **Tab 1: Overview & Supply Chain**: 5-Tier classification, cultural quadrant, Tarot affinities, node placement prerequisites, standalone fallback execution mode, and bi-directional supply chain contracts (`provides` / `requires` tags).
   - **Tab 2: Narrative Entities (NPCs, Quests, Items)**: Automated parsing of latent characters, dilemmas, and apparatus with one-click promotion into the active campaign roster and direct node stationing.
   - **Tab 3: Mechanics, Clocks & Dials**: Interactive breakdown of Threat Clocks with tick escalation, Output Dials (Levels 1 to 4 severity/output), and Four-Corner Sociological Opposition (Establishment, Opponent, Shadow, Outcast).
   - **Tab 4: Full Sourcebook & Notes**: Zero-CORS offline formatted markdown reader rendering full mechanical architecture, GM placement sockets, sabotage hazards, and cross-references, with raw source toggle and file links.
3. **Interactive Node Slotting Engine**:
   Modules are slotted directly onto map nodes (`node.modules = []`), creating explicit topological anchors for supply chains and narrative threats.
4. **CAD Canvas & Property Grid Telemetry Synchronization**:
   The CAD canvas renders real-time multi-dimensional spatial telemetry badges on node perimeters (`M:# N:# Q:# I:#`), tracking slotted modules (`M`), assigned NPCs (`N`), active quests (`Q`), and stationed items (`I`). The Property Grid displays a dedicated `[ Slotted Modules ]` category with direct inspection links.
5. **Zero-CORS Offline Execution Invariant**:
   Maintains pure client-side functionality with zero external CDNs, compiled directly into `start.html` via `build_suite.js`.
<!-- END_CUSTOM_NOTES -->
