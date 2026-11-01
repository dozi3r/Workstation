# 0011: Selective Sub-Map Importing and Entity Conflict Resolution

## Context
Creator Studio supports scale-fluid hierarchical cartography, where campaigns contain recursive pointcrawl submaps (`maps`) linked via Portal Nodes (`childMapId`). As creators author bespoke submaps (such as citadels, floorplans, or holy sanctums), they require the ability to extract submaps from one setting and import them into another without replacing the host campaign or causing data loss.

Challenges:
1. Standard importing was all-or-nothing: importing a file destroyed the active campaign.
2. Stationed campaign entities (NPCs, quests, items, threat clocks) in the incoming package might share identical names or IDs with entities in the host project but contain conflicting attributes (e.g. different motivations, faction alignments, or threat clock parameters).
3. Without a conflict detector, merging would either cause silent clobbering or generate orphaned duplicates.

## Decision
1. **Universal Package Parser**:
   - Ingest incoming campaign packages in-memory from local folders (via `showDirectoryPicker()`), `.zip` archives (via `ZeroCorsZip`), or `.creator.json` documents before making any state mutations.
2. **Selective Map Checklist with Dual Destination Modes**:
   - Present an interactive checklist of all maps in the package with node/edge counts and asset previews.
   - Support two modes:
     - **Start New Campaign**: Replaces active session with only the selected maps.
     - **Merge / Add to Current Campaign**: Appends selected maps into the current `maps` registry, dynamically resolving map ID collisions.
3. **Inline Portal Node Binding**:
   - In Merge mode, allow the author to bind an imported submap directly to any pointcrawl node in the current active map via an inline dropdown, immediately instantiating a Portal Node (`childMapId`).
4. **Entity Conflict Detection & Resolution**:
   - Scan incoming entities stationed on selected maps against the host campaign roster.
   - Detect collisions on ID or normalized name where attributes differ.
   - Present an interactive resolution table offering three actions per conflict:
     - **Keep Existing**: Discard incoming entity; retain host version.
     - **Overwrite**: Update host entity with incoming attributes.
     - **Clone as New**: Generate a unique namespaced ID and append a distinct identifier, preserving both versions independently.

## Consequences
- Campaigns become truly modular: pointcrawl submaps function as modular building blocks that can be shared, recombined, and remixed across projects.
- World architects have complete agency over how narrative lore and threat clocks merge, eliminating accidental data clobbering.
