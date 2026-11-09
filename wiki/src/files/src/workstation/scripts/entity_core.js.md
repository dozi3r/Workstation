---
file_path: "src/workstation/scripts/entity_core.js"
title: "entity_core.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "796903dd426fa55e"
reviewed_hash: "796903dd426fa55e"
stale: false
size_bytes: 85481
line_count: 1948
---

# entity_core.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_core.js` provides foundational campaign entity state, prototype retrieval, and behavioral math within the Creator Studio desktop workstation (`start.html`).

### Key Capabilities
- **Campaign Entity State**: Maintains active tab state (`CurrentEntityTab`), active filter criteria (`SelectedEntityFilter`), and selected entity selection pointer (`SelectedEntityId`).
- **Sociological Inheritance Engine (`getNpcEffectiveSociology`)**: Resolves effective sociology for NPCs via a 4-tier waterfall: (1) explicit bespoke vector/culture on NPC, (2) inherited from affiliated Faction, (3) inherited from host settlement Node, (4) clean 'Unset'. Eliminates synthetic `[2, 2, 2]` defaults.
- **ODV Dissonance Engine**: Computes granular sociopolitical dissonance (`computeNpcNodeDissonance`) between character effective `[S, E, C]` vectors and their stationed node environments without synthetic fallback.
- **Possession & Secret Toggles**: Manages item possession modes (`carried` vs. `stored`) with effective spatial resolution (`getItemEffectiveNodeId`), NPC secret exposure flags (`toggleNpcSecretRevealed`), and party disposition vectors (`setNpcPartyDisposition`).
- **Demographics, Factions & Party Rapport (ADR-0015 v2)**: Provides pure normalizers and mutators (`normalizeDemographics`, `getDemographicNames`, `normalizePartyRapport`, `PARTY_STANCE_LABELS`, `addDemographicTag`, `removeDemographicTag`, `addFactionPresence`, `removeFactionPresence`, `setPartyRapport`) preserving SYS-RACE-02 census data while enabling freeform peoples tags, multi-map faction suggestion aggregation (`getCampaignFactionSuggestions`), and standardized 5-point rapport tracking with pre-mutation history snapshots (`pushHistoryState`).
- **Prototypes & Stationing**: Queries campaign module prototypes (`getPrototypesForType`), accesses typed active entity rosters (`getActiveEntityList`), promotes prototypes into campaign instances (`promotePrototypeToCampaign`), stations entities to pointcrawl nodes (`assignEntityToNode`), and controls threat clock ticks/dials (`advanceTrackerTick`, `resetTrackerTicks`, `setTrackerDialLevel`).
- **Resource Partitioning & Bestiary Support**: Defines `isResourceItem(item)` to partition commodity resources out of standard items, `getCreatureEffectiveNodeId(creature)` for resolving multi-scale lair node stationing, and `getBackingEntityList(type)` to route resource mutations to `topo.items` and creatures to `topo.creatures`.
- **Removal (SYS-ARCH-01)**: `removeEntityFromCampaign` opens the cascade dialog (`promptEntityDelete`). Without the dialog it deletes through `CampaignMutationEngine.deleteEntity` (passing the `maps` registry) so references are unlinked the same way. The old fallback that filtered four collections and unlinked nothing is gone.
- Gigerenzer suite (ADR 0024): promotePrototypeToCampaign deep-copies the optional fft so promoted entities never share a tree.
- **Cross-Campaign Exploration Engine (`CrossCampaignService`)**: Discovers external campaigns across bundled `CAMPAIGN_REGISTRY`, IndexedDB `campaign_library`, and custom user files/folders (`customRegisteredSources`). Normalizes all package formats, deep-clones external entities stamping `_isExternal: true`, `_sourceCampaignId`, `_externalKey: "ext::<sourceId>::<id>"`, decouples active node stationing to null while preserving `_originalNodeId` / `_originalNodeName`, and guarantees strict isolation so external entities never leak into `getActiveEntityList(type)`.
<!-- END_CUSTOM_NOTES -->
