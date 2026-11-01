---
file_path: "docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md"
title: "0005: Campaign Entity Architecture (NPCs, Quests, Items) with Module Ingestion & Node Stationing"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "c63b4eea26886ccd"
reviewed_hash: "c63b4eea26886ccd"
stale: false
size_bytes: 2782
line_count: 29
---

# 0005: Campaign Entity Architecture (NPCs, Quests, Items) with Module Ingestion & Node Stationing

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md` formalizes the campaign narrative entity architecture within **Volume I: System Architecture, Governance & Ontology**, enabling tabletop Game Masters and worldbuilders to layer characters, quest arcs, and technological items directly atop the mathematical pointcrawl network.

### Key Decision Matrix
1. **Unified Root Collection Model**:
   Entities are stored in root arrays on the campaign topology JSON: `topology.npcs = []`, `topology.quests = []`, and `topology.items = []`. Nodes reference these via optional `nodeId` stationing attributes, guaranteeing bi-directional lookup without nested data corruption.
2. **Two-Tier Architecture (Module Prototype Pool vs Active Roster)**:
   - **Module Prototype Library (`MODULE_ENTITY_PROTOTYPES`)**: Latent characters (e.g. Commander Hrolf vs Magistrate Leiderman in `SPARK-07`) and relics (e.g. Pelton Dynamo in `INFRA-01`) extracted from registered module sourcebooks.
   - **Active Campaign Roster**: Entities explicitly promoted or custom-authored, persisted in browser `localStorage`.
3. **Dedicated Windows 95 Management Dialogs**:
   A unified multi-pane manager (`#modal-entity-manager`) with scope navigation tree (`All Active`, `Unassigned`, `By Node`, `By Module Prototype`), search/filter, and inspector actions (`Add to Campaign`, `Station to Node`, `Edit`, `Remove`). Accessible via `Ctrl+F5` (NPCs), `Ctrl+F6` (Quests), and `Ctrl+F7` (Items).
4. **Bi-Directional Property Grid & Canvas Integration**:
   Selecting a node in the CAD canvas dynamically renders collapsible categories in the Visual Basic 6 Property Grid: `[ Assigned NPCs ]`, `[ Active Quests ]`, and `[ Local Items & Relics ]` with clickable links to inspect or reassign. The canvas renders real-time telemetry badges (`N:# Q:# I:#`) directly on node perimeters.
5. **Zero-CORS Offline Execution**:
   Maintains the strict zero-CORS offline execution invariant, operating completely self-contained from disk under `file:///`.
<!-- END_CUSTOM_NOTES -->
