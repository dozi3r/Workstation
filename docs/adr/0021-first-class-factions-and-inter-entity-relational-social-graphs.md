# 0021: First-Class Factions and Inter-Entity Relational Social Graphs

## Context
In previous iterations of Creator Studio, factions were modeled opportunistically as unstructured string labels or isolated objects in `campaignFactions`, while pointcrawl nodes, NPCs, and quests carried fragmented references. Game Masters and worldbuilders require factions to operate as first-class campaign entities with:
- Formal sociopolitical attributes (CVF Cultural Quadrant: Clan, Adhocracy, Market, Hierarchy).
- Color identity mapping (White, Blue, Black, Red, Green, Colorless).
- Granular disposition vectors `[S, E, C]` (1..4) mapped to the 64-archetype sociological matrix.
- Structured territorial control (`headquartersNodeId` anchor and `controlledNodeIds` pointcrawl territorial sets).
- Character leadership (`leaderNpcId` foreign key to active campaign NPCs).
- Inter-faction diplomatic matrices (`diplomaticStances` mapping target faction IDs to Allied, Neutral, Hostile, Vassal, or Rival).

Without unified entity lifecycle management, factions risk being orphaned or wiped during map switching, pack export/import, or cascade deletion operations.

## Decision
1. **First-Class Collection Architecture**:
   Store factions uniformly in `Workstation.activeTopology.factions = []`, adhering to the standard campaign entity schema with `isCustom`, `status`, `cvfQuadrant`, `colorIdentity`, `leaderNpcId`, `headquartersNodeId`, `controlledNodeIds`, `diplomaticStances`, and `disposition`.
2. **Backwards Compatibility & Global Sync**:
   Maintain 100% backward compatibility with legacy `campaignFactions` and `getCampaignFactionSuggestions()`. `registerCampaignFaction(name)` synchronously populates `topo.factions` and `campaignFactions`.
3. **Map-Switch & Storage Persistence**:
   Extend `cachedEntities` in `state_adapter.js` to preserve `factions` across child map navigation. Ensure `saveActiveCampaign()` and `initTopology()` serialize and hydrate `factions` in `creator_studio_campaign_entities`.
4. **Relational Cascade Deletion**:
   Incorporate `faction` into `entity_cascade_delete.js`. Deleting an NPC clears corresponding `faction.leaderNpcId`. Deleting a node clears `headquartersNodeId` and purges it from `controlledNodeIds`. Deleting a faction decouples `npc.factionId` and purges diplomatic stances across surviving factions.
5. **Pack Engine & Selective Importer Integration**:
   Include `factions` in `.csmod` packaging (`entities.json`), manifest schemas, cluster foreign key remapping (`remapEntityCluster`), and `selective_importer.js` conflict resolution loops.
6. **MDI Entity Manager Dossier**:
   Provide dedicated Win95 UI in `entity_manager_ui.js` featuring cultural quadrant badges, territorial badge lists, leader NPC links, canvas jump shortcuts, and interactive diplomatic stance dropdowns.

## Consequences
- Factions operate as authoritative entities driving territorial pointcrawl dynamics, ideological tensions, and political intrigue.
- Eliminates silent faction state erasure when switching between multi-scale nested maps.
- Provides a clean semantic bridge into inter-character relational webs and 2D social graph visualizers.
