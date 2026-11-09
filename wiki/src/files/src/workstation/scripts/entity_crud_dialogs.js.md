---
file_path: "src/workstation/scripts/entity_crud_dialogs.js"
title: "entity_crud_dialogs.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "46182b53d51c690d"
reviewed_hash: "46182b53d51c690d"
stale: false
size_bytes: 91722
line_count: 1650
---

# entity_crud_dialogs.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/entity_crud_dialogs.js` manages custom entity creation modals, editing workflows, and spatial quest analysis within Creator Studio (`start.html`).

### Key Capabilities
- **Multi-Node Quest Spanning Engine**: Computes and previews the topological footprint of narrative quests across pointcrawl nodes (`getQuestSpanningNodes`, `updateQuestSpanningPreview`), identifying anchor stations, objective nodes, and referenced character/item locations.
- **Quest Semantic Giver & Target Assignment**: Powers `#ee-quest-giver` and `#ee-quest-target` selectors, binding origin and target NPCs to `quest.giverNpcId` and `quest.targetNpcId`, deduplicating them into `quest.npcIds`, and including them in topological footprint calculations (`updateQuestSpanningPreview`).
- **Custom Entity Authoring Dialog**: Powers the New Entity creation modal (`openNewEntityModal`), pre-populating fields based on the active entity tab and auto-suggesting stationing candidates.
- **Entity Edit Controller**: Handles in-flight modification of existing campaign entities (`openEditEntityModal`), populating existing traits, descriptions, requirements, and reward structures.
- **Bestiary Creature Authoring**: Powers `#ee-creature-extensions` in `openNewEntityModal('creature')` and `openEditEntityModal`, configuring kind, breed/subtype, body size, threat tier 0-5, dread index 1-10, dread effect, roaming scope, and 6 relative capabilities.
- **Tactical & Behavior Initialization**: In `saveCustomEntity()`, generates slugified IDs (`creature_<slug>`), synthesizes initial Fast-and-Frugal Trees (`fastAndFrugalTree`), sets up senses, defenses, and locomotion matrices, and stations the creature to active node lairs.
- **Persistence & Canvas Synchronization**: Validates and commits created/updated entities to the active campaign topology (`saveCustomEntity`), triggering canvas HUD refreshes, properties grid updates, and notification status messages.
- **Transplant Package Wizard & Foreign-Key Rewriter (`TransplantService`)**: Implements `analyzeTransplantDependencies`, `openTransplantPackageModal`, `closeTransplantPackageModal`, `updateTransplantDepRow`, and `executeTransplantPackage`. Analyzes all outbound dependencies (quest giver/target NPCs, associated cast, relics, threat clocks, step triggers, faction leaders, social web ties), presents interactive 3-way dependency actions (`copy`, `reassign`, `omit`), handles ID conflict strategies (`auto_unique`, `overwrite_if_exists`, `preserve_strict`), rewrites all relational foreign keys, assigns target stationing, and commits the imported package cleanly into the active campaign.
<!-- END_CUSTOM_NOTES -->
