# 0005: Campaign Entity Architecture (NPCs, Quests, Items) with Module Ingestion & Node Stationing

## Context
Creator Studio's pointcrawl networks model mathematical topologies, 64-cell sociological profiles, and modular worldbuilding rules. However, Game Masters running tabletop campaigns require an integrated narrative layer: Non-Player Characters (NPCs), quest vectors, and items/relics stationed across nodes.

Furthermore, worldbuilding modules (`modules/` and `campaigns/`) contain latent characters (e.g. Commander Hrolf vs Magistrate Leiderman in `SPARK-07`) and items (e.g. Pelton Dynamo in `INFRA-01`). Authors need a way to browse these prototypes by module, inspect them, promote them into an active campaign roster, assign them to nodes, or author custom entities from scratch.

## Decision
1. **Unified Root Collection Model**:
   Store active entities in root arrays on the campaign topology JSON: `topology.npcs = []`, `topology.quests = []`, and `topology.items = []`. Nodes reference these via `nodeId` stationing attributes, enabling bi-directional lookup.
2. **Two-Tier Architecture (Module Prototype Pool vs Active Roster)**:
   - **Module Prototype Catalog**: An indexed catalog of latent NPCs, quests, and artifacts extracted from registered module sets (e.g. Set F Catalysts, Set A Infrastructure).
   - **Active Campaign Roster**: Entities explicitly promoted or custom-created, saved in browser `localStorage`.
3. **Dedicated Windows 95 Management Dialogs**:
   Introduce modal/modeless dialog windows for entity management:
   - `NPC Manager`: View active roster, filter by module/node/unassigned, inspect motivations/roles, promote prototypes, or create new NPCs.
   - `Quest Tracker`: Track primary quest hooks, faction stakes, objectives, threat clocks, and node dependencies.
   - `Item Catalog`: Manage technology anchors, relics, barter gear, and resource yields.
4. **Bi-Directional Property Grid & Canvas Integration**:
   - Selecting a node renders dedicated collapsible categories in the Visual Basic 6 Property Grid: `[ Assigned NPCs ]`, `[ Active Quests ]`, and `[ Local Items & Relics ]`.
   - The CAD canvas displays visual entity badges on node perimeters (e.g., `N:2 Q:1 I:3`) providing instant spatial telemetry.
5. **Zero-CORS Offline Execution**:
   All entity catalogs, prototype libraries, and dialog controllers execute self-contained under `file:///` without external servers or CDNs.

## Consequences
- Pointcrawl nodes become rich, character-driven adventure locations rather than bare topological graphs.
- Authors can seamlessly draw from pre-authored module content or design bespoke NPCs, quests, and items.
- Pointcrawl balancing and simulation remain mathematically intact, while narrative depth is dynamically overlaid.
