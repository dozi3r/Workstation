---
id: SYS-START-06
title: "Selective Sub-Map Package Importer & Entity Conflict Resolution Engine"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Multi-Scale Cartography & Asset Composition"
grounded_prerequisites: ["docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md", "docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md", "docs/adr/0010-portable-campaign-packages-and-project-directory-synchronization.md", "docs/adr/0011-selective-submap-importing-and-entity-conflict-resolution.md"]
grounded_yields: ["Selective Map Import Modal", "Universal Package Parser (Folder, Zip, Creator JSON)", "Multi-Map Hierarchy Checklist", "Entity Conflict Detection & Resolution UI", "Portal Node Inline Attachment"]
provides: ["Cartography: Selective-Map-Import", "Cartography: Map-Merging", "Entities: Conflict-Detector", "Entities: Collision-Resolution"]
requires: ["Workstation: start.html", "Cartography: Multi-Map-Registry", "Engine: ZeroCorsZip"]
standalone_fallback: "Direct JSON file import without selective filtering."
---

# SYS-START-06: Selective Sub-Map Package Importer & Entity Conflict Resolution Engine
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/scripts/`)*  
*Status: shipped*  
*Authority: [ADR-0011](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/adr/0011-selective-submap-importing-and-entity-conflict-resolution.md), [ADR-0010](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/adr/0010-portable-campaign-packages-and-project-directory-synchronization.md), [ADR-0003](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/adr/0003-bidirectional-wiki-and-scale-fluid-nested-maps.md)*

---

## 1. Problem Statement & Scope
While Creator Studio allows exporting portable campaign packages and directories, authors frequently need to compose campaigns modularly—for example, taking a fortress outpost or cathedral submap from one setting (like *Silica Island*) and bringing it into another campaign (like *Opal Island*) without overwriting the destination campaign.

Previously:
1. Importing a file replaced the entire workspace unconditionally. Authors could not pick specific submaps from a multi-map campaign.
2. Stationed narrative entities (NPCs, quests, items, dials) carried risk of silent clobbering: if an NPC with the same ID or name existed in both the host project and the incoming package with differing motivations or roles, one would silently overwrite the other.
3. No mechanism existed to bind an imported submap directly to an existing pointcrawl node as a Portal Node (`childMapId`) during the import step.

---

## 2. Technical Requirements & Acceptance Criteria

### 1. Universal Package Ingestion Source
- Allow the user to select an incoming campaign via:
  - Local Project Folder (via `window.showDirectoryPicker()`)
  - Campaign Archive (`.zip` / `.csz` parsed by `ZeroCorsZip`)
  - Self-Contained Package (`.creator.json` / `.json`)
- Ingest and parse in-memory before applying changes to active state.

### 2. Selective Map Checklist & Destination Choice
- Open an interactive Windows 95 MDI modal (`modal-selective-map-import`):
  - **Destination Mode**:
    - `(*) Start New Campaign with Selected Maps`: Resets workspace and loads selected maps.
    - `( ) Merge / Add Selected Maps into Current Campaign`: Appends selected maps into current project.
  - **Map Checklist**:
    - Checkbox per map, displaying Map Name, Scale Tier badge (`🌐`, `🗺️`, `🏰`), node/corridor counts, and image asset indicators.
    - When in "Merge / Add" mode, provide an inline dropdown per map row: `Attach to Node in Current Map: [Standalone Layout Tab] | [Node #X: Name]`.
    - Selecting a node automatically binds `childMapId`, establishing a traversable Portal Node.

### 3. Entity Conflict Detection & Resolution
- When "Import Stationed Entities" is active, compare incoming NPCs, quests, items, trackers, and tickets against the active campaign roster.
- Match on ID or case-insensitive Name:
  - If identical, ignore (no conflict).
  - If attributes differ (e.g. role, motivation, threat clock max ticks, specs):
    - Flag as a detected conflict.
    - Render a side-by-side comparison with a per-conflict resolution selector:
      - **Keep Existing**: Retain active campaign version.
      - **Overwrite Current**: Replace active campaign version with incoming.
      - **Clone / Keep Both**: Generate a unique namespaced ID and append a tag (e.g. `[Imported]`), rebinding the clone to the imported node.

### 4. Zero-CORS Asset & Storage Integrity
- When maps with background images are imported, write image data into `CreatorStudioMapDB` IndexedDB so images persist across sessions.
- Re-render canvas, breadcrumbs HUD, layout tabs, and properties inspector immediately upon completion.
