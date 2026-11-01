---
file_path: "src/workstation/scripts/entity_core.js"
title: "entity_core.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "df9eec52d9093a20"
reviewed_hash: "df9eec52d9093a20"
stale: false
size_bytes: 30429
line_count: 738
---

# entity_core.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_core.js` provides foundational campaign entity state, prototype retrieval, and behavioral math within the Creator Studio desktop workstation (`start.html`).

### Key Capabilities
- **Campaign Entity State**: Maintains active tab state (`CurrentEntityTab`), active filter criteria (`SelectedEntityFilter`), and selected entity selection pointer (`SelectedEntityId`).
- **ODV Dissonance Engine**: Computes granular sociopolitical dissonance (`computeNpcNodeDissonance`) between character `[S, E, C]` vectors / cultural affiliations and their stationed node environments.
- **Possession & Secret Toggles**: Manages item possession modes (`carried` vs. `stored`) with effective spatial resolution (`getItemEffectiveNodeId`), NPC secret exposure flags (`toggleNpcSecretRevealed`), and party disposition vectors (`setNpcPartyDisposition`).
- **Demographics, Factions & Party Rapport (ADR-0015 v2)**: Provides pure normalizers and mutators (`normalizeDemographics`, `getDemographicNames`, `normalizePartyRapport`, `PARTY_STANCE_LABELS`, `addDemographicTag`, `removeDemographicTag`, `addFactionPresence`, `removeFactionPresence`, `setPartyRapport`) preserving SYS-RACE-02 census data while enabling freeform peoples tags, multi-map faction suggestion aggregation (`getCampaignFactionSuggestions`), and standardized 5-point rapport tracking with pre-mutation history snapshots (`pushHistoryState`).
- **Prototypes & Stationing**: Queries campaign module prototypes (`getPrototypesForType`), accesses typed active entity rosters (`getActiveEntityList`), promotes prototypes into campaign instances (`promotePrototypeToCampaign`), stations entities to pointcrawl nodes (`assignEntityToNode`), and controls threat clock ticks/dials (`advanceTrackerTick`, `resetTrackerTicks`, `setTrackerDialLevel`).
<!-- END_CUSTOM_NOTES -->
