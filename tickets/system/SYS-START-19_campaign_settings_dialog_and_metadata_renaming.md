---
id: SYS-START-19
title: "Workstation Campaign Settings Dialog & In-Place Metadata Renaming"
pipeline_tier: 0
target_surface: "start.html"
status: completed
category: "system_architecture"
wave: "Workstation Architecture: Campaign Management & Project Identity"
grounded_prerequisites: [
  "docs/adr/0004-desktop-workstation-start-html.md",
  "docs/adr/0018-campaign-state-isolation-clean-slate-lifecycle-engine-and-zero-artifact-campaign-switching.md",
  "src/workstation/scripts/map_store.js",
  "src/workstation/scripts/mdi_window_manager.js",
  "src/workstation/scripts/workstation_state.js",
  "CONTEXT.md"
]
grounded_yields: [
  "Campaign Settings MDI Dialog",
  "In-Place Campaign Name & Metadata Mutation",
  "Synchronized Save-As Identity Renaming",
  "Mod Lifecycle Events (campaignRenamed, campaignLoaded)",
  "Mod Custom Property Preservation"
]
provides: ["Workstation: Campaign-Settings", "Workstation: Campaign-Renaming", "ModAPI: Campaign-Events"]
requires: ["Workstation: start.html", "MDIWindowManager", "WorkstationState"]
standalone_fallback: "Campaign renaming performed exclusively via manual JSON editing or File -> Save As New Campaign."
---
# SYS-START-19: Workstation Campaign Settings Dialog & In-Place Metadata Renaming
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: open*  
*Date: 2026-11-01*

## 1. Overview & Objective
Currently, while Creator Studio supports creating a campaign via `File -> New Campaign...` and cloning via `File -> Save As New Campaign...` (`modal-save-as-new`), there is no dedicated dialog within the workstation for an author to inspect or modify an active campaign's metadata (Display Name, Author, Description, Climax Trigger, Global Dials, or Root Map Title) in-place. Authors wanting to rename a project must either manually edit on-disk JSON files (`campaign.json`, `preset.json`, `topology.json`) or perform a full "Save As" copy.

Furthermore, when campaigns are renamed or branched, third-party and setting-specific Workstation Mods (`window.CreatorStudio.registerMod`) must continue functioning without stale cached campaign keys, broken references, or discarded custom entity properties.

This ticket delivers:
1. **In-Workstation Campaign Settings MDI Window (`modal-campaign-settings`)**: Dedicated Win95 dialog allowing authors to view and mutate active campaign metadata in-place.
2. **Unified Campaign Identity Synchronization**: Synchronized propagation of name changes across `campaign.json`, `preset.json`, `topology.json`, `maps.map_root.name`, browser window title, and status bar `#sb-campaign`.
3. **Save As Identity Hardening**: Guaranteeing that when an author saves a new campaign via `modal-save-as-new`, all nested topology and preset schemas receive the new name and slug synchronously.
4. **Mod Extension Invariants & Event Bus**: Dispatching `campaignRenamed` and `campaignLoaded` lifecycle events on `window.CreatorStudio` while strictly preserving mod-injected properties across all nodes, corridors, and entities.

---

## 2. Implementation Deliverables

### 2.1 Campaign Settings MDI Window (`src/workstation/modals/studio_mdi_windows.html` & `mdi_window_manager.js`)
- Add a new MDI dialog window `#modal-campaign-settings` accessible via:
  - Top Menu: `File -> Campaign Settings...` (and `Edit -> Campaign Settings...`).
  - Status Bar: Double-clicking or clicking the bottom-left `#sb-campaign` status pane.
- Fields provided in the dialog:
  - **Campaign Display Name**: Text input binding to `topology.campaignName` / `topology.name`.
  - **Campaign Identifier (`slug`)**: Read-only display of the current active folder slug/id, with a helper link: *"To change the folder slug on disk, use File -> Save As New Campaign"*.
  - **Author**: Text input binding to `campaign.author`.
  - **Description**: Textarea binding to `campaign.description`.
  - **Root Map Title**: Text input updating `maps[rootMapId].name`.
  - **Climax Trigger Dial**: Dropdown selection (e.g. `crisis`, `scheduled_turn`, `manual`).
  - **Substratum Dials**: Checkbox / toggle for Tier 0 Agrarian Substratum and local escalation rules.
- Actions:
  - **Apply & Save**: Commits changes to the in-memory active topology, calls `setProjectDirectoryDirty(true)`, flushes directly to bound disk directory (`campaign.json`, `preset.json`, `topology.json`), updates `#sb-campaign`, and closes modal.
  - **Save As New...**: Opens `modal-save-as-new` pre-filled with the current values.
  - **Cancel**: Reverts uncommitted inputs.

### 2.2 Workstation Mod Lifecycle Event Hooks (`src/workstation/scripts/workstation_state.js`)
- Expose an event emitter on `window.CreatorStudio`:
  - `window.CreatorStudio.on(event, handler)`
  - `window.CreatorStudio.emit(event, payload)`
- When a campaign name or identity changes in Campaign Settings:
  ```javascript
  window.CreatorStudio.emit('campaignRenamed', {
    campaignId: activeCampaignId,
    oldName: oldCampaignName,
    newName: newCampaignName,
    topology: Workstation.activeTopology
  });
  ```
- When a campaign is loaded or switched:
  ```javascript
  window.CreatorStudio.emit('campaignLoaded', {
    campaignId: activeCampaignId,
    campaignName: currentCampaignName,
    topology: Workstation.activeTopology
  });
  ```
- **Mod Property Preservation**: Ensure that serialization routines in `map_store.js` (`exportPackage()`, `flushProjectDirectoryNow()`, `saveActiveCampaignAsNew()`) preserve arbitrary mod-injected properties attached to nodes (e.g. `node.tarot_data`, `node.weather_state`), edges, and entities.

### 2.3 Save As New Campaign Flow Hardening (`src/workstation/scripts/map_store.js`)
- When `saveActiveCampaignAsNew(name, slug, description, ...)` executes:
  - Set `topology.id = slug`.
  - Set `topology.name = name`.
  - Set `topology.campaignName = name`.
  - Set `maps[rootMapId].name = name` (if matching previous campaign title).
  - Update `activeTopology` nested sub-object if present.
  - Update local storage keys (`cs_active_campaign = slug`).

---

## 3. Acceptance Criteria
- [ ] Clicking `File -> Campaign Settings...` or `#sb-campaign` opens the Campaign Settings MDI window.
- [ ] Mutating the campaign name and clicking "Apply & Save" updates `campaign.json`, `preset.json`, `topology.json`, and `#sb-campaign` in the bound disk folder.
- [ ] Workstation mods receive the `campaignRenamed` event via `window.CreatorStudio.on('campaignRenamed', ...)`.
- [ ] Mod-injected fields on nodes, corridors, and entities remain intact across renames and Save As cloning.
- [ ] Executing `File -> Save As New Campaign...` cleanly writes the new slug, title, and root map without lingering references to the parent campaign.
