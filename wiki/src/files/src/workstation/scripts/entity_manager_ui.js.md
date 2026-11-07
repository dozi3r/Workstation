---
file_path: "src/workstation/scripts/entity_manager_ui.js"
title: "entity_manager_ui.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "52a3905c66f9536e"
reviewed_hash: "52a3905c66f9536e"
stale: false
size_bytes: 292095
line_count: 4772
---

# entity_manager_ui.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_manager_ui.js` controls the universal Entity Manager MDI workspace surface within Creator Studio (`start.html`).

### Key Capabilities
- **Workspace Navigation & Tabs**: Handles workspace lifecycle (`openEntityManager`), tab switching across NPCs, Quests, Items, Resources, Creatures, Clocks, Factions, and Nodes (`switchEntityManagerTab`), and visual active state button indicators (`updateEntityTabButtons`).
- **Resource Explorer Tab (`em-tab-resource`)**: Provides dedicated commodity logistics explorer with multi-map node aggregation, Dwarf Fortress physical stockpile and batch specs, and public settlement depot filters.
- **Bestiary Explorer Tab (`em-tab-creature`)**: Delivers full monster manual explorer with Threat Tier (0-5) and Kind filters, 6 Relative Capability stat bars with visual pips, Dread Index gauge (1-10) and Dread Effect hazard notes, embedded Fast-and-Frugal Tree preview, and collapsible Source Figures & Rating Rationale hydrated from `topo.creatureEvidence`.
- **Quest Explorer & Crucible Inspector**: Renders color-coded threat badges, `✓ X/Y` step completion meter, `⚡ Crucible` pill, and multi-branch What-If Crucible cards (`parseQuestCrucibleNotes` extracting Canonical Resolution, Divergence Point, Snarky vs Altruistic, Immediate Dilemma, Long-Term Ripple, Secondary Fork, Key NPC Reactions, and Table Hooks). Also features semantic Quest Giver (`giverNpcId`) and Quest Target (`targetNpcId`) rows with one-click inspection and canvas centering, and step narrative rendering (`step.text`).
- **Hierarchical Classification Tree**: Builds and updates the categorized left sidebar tree (`renderEntityManagerTree`, `addTreeItem`), grouping entities by module, station node, cultural quadrant, threat level, or tier.
- **Filterable Entity Roster Table**: Generates the central multi-column tabular ledger (`renderEntityManagerList`, `renderMiniClockGauge`) displaying status tags, ownership indicators, station nodes, and archetype badges.
- **Comprehensive Entity Inspector**: Implements the in-depth right inspector pane (`selectEntityItem`), providing editable fields, ODV coordinate readouts, relationship tables, quest step progression lists, item inventory links, and clock gauge controllers.
- **Deep-Link Entity Navigation**: Exposes `navigateToEntity(type, id)` to programmatically transition workstation focus from canvas nodes or HUD badges directly into the specific entity inspector.
- Gigerenzer suite (ADR 0024): NPC and faction panes render the heuristic badge and decision-tree dossier; Edge Explorer shows a natural-frequency summary under hazard risk.
- **Multi-Campaign Sources Popover & External Entity Staging**: Features `#em-btn-sources` and `#em-sources-popover` (`toggleEntitySourcesPopover`, `renderEntitySourcesPopover`) letting authors toggle external campaigns on-demand or ingest local `.json`/folder packages. Renders `[EXTERNAL CAMPAIGNS]` folder nodes in the classification tree (`appendExternalCampaignsTreeSection`), adds `[Ext: <Campaign>]` badges and `+ Import` transplant actions in the central table (`renderEntityManagerList`), and mounts source-aware inspect viewports (`selectEntityItem`) resolving relational seams from `externalSourcePool` with read-only badges and transplant packaging triggers.
- **Multi-Explorer Enrichment & Narrative Depth**:
  - **NPC Inspector**: Renders polymorphic dialogue hooks (`renderNpcDialogueHooksHtml`) supporting string quotes, bifocal `Spoken: ... | Subtext: ...` subtext blocks, and `{ text, revealed }` objects (`[REVEALED IN CANON]`); expands Four-Corners opposition roles to literary archetypes (`Mentor`, `Nemesis`, `Ally`, `Opponent`, `Outcast`, `Catalyst`, `Shadow`, `Target`); integrates clickable Faction pill and bidirectional inventory links.
  - **Item Inspector**: Displays inline condition/status badges (`intact`, `damaged`, `depleted`, `attuned`, `lost`, `destroyed`), currency valuation/pricing, and external campaign foreign-key safety.
  - **Faction Inspector**: Implements 4-Axis Power Matrix (`Reach`, `Force`, `Wealth`, `Secrecy`), operational status badges (`Active`, `Ascendant`, `Underground`, `Contested`, `Dissolved`), unionized territorial node resolution (`territoryNodeIds` and `controlledNodeIds`), affiliated character aggregation (`memberNpcIds` and faction matching), and `🎯 Highlight on Canvas` territorial button with external campaign isolation.
  - **Creature Bestiary**: Surfaces archaic/scientific taxonomy names, `stationing.roamingScope` badges/inline editor, damage/condition immunities, harvest yields & domestication profile cards, and ecological relational links.
  - **Node Inspector (Subtab 1 Telemetry)**: Displays Danger Rating (0-4), Node Category selector, Demographics Census & Faction Presence card, Party Rapport badges, collapsible Node Lore reader, and Commodity Logistics summary.
<!-- END_CUSTOM_NOTES -->
