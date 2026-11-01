---
id: SYS-START-20
title: "Enhanced Campaign Selector UI & Rich Metadata Inspection"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
track: "Platform Development"
priority: "Medium"
wave: "Workstation Architecture: Project Management & Campaign Launcher"
grounded_prerequisites: [
  "docs/adr/0004-desktop-workstation-start-html.md",
  "src/workstation/scripts/map_store.js",
  "src/workstation/scripts/mdi_window_manager.js",
  "src/workstation/modals/lifecycle_modals.html"
]
grounded_yields: [
  "Rich Campaign Statistics Badges (Nodes, NPCs, Quests, Items, Maps, Mods)",
  "Responsive Dual-Line Card Typography for Long Titles",
  "Uniform Disk, Library, and Preset Metadata Extraction",
  "Multi-Map Aggregated Census"
]
provides: ["Workstation: Rich-Campaign-Selector", "Launcher: Census-Inspection"]
requires: ["Workstation: start.html", "MDIWindowManager", "scanCampaignsDirectory"]
standalone_fallback: "Default compact campaign list showing folder names and generic descriptions."
alias_id: "DEV-01"
---
# SYS-START-20: Enhanced Campaign Selector UI & Rich Metadata Inspection (DEV-01)
*Category: system_architecture | Priority: Medium | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready | Author: Development Backlog*  
*Date: 2026-11-01*

## 1. Overview & Objective
When opening or switching campaigns in Creator Studio via `File -> Open Campaign...` (`#modal-load`) or the initial desktop greeting (`#modal-welcome`), the campaign cards currently display minimal details (only folder name and description). Long campaign titles (such as *"The Iron Crisis of Nashkel & The Deep Mines"* or lengthy community titles) wrap unpredictably, clipping action buttons and making distinction between campaign states difficult.

Furthermore, authors managing multiple campaigns require immediate visibility into project scope prior to loading—including how many nodes, NPCs, quests, items, submaps, and third-party workstation mods are bundled.

### Acceptance Criteria / Acceptance Test:
Feature will be accepted when:
1. Every campaign card in `#modal-installed-campaigns-list` and `#welcome-installed-campaigns-grid` displays an aggregated census badge row:
   - **Nodes count** (aggregated across all maps in multi-map packages)
   - **NPCs count**
   - **Quests count**
   - **Items count**
   - **Maps count** (when $> 1$)
   - **Active Mods / Modules count**
2. Long campaign titles and descriptions wrap cleanly in a structured dual-line layout with fixed-height action buttons (`Open`, `Delete/Hide`) that never get pushed off-screen or overlap text.
3. Metadata inspection functions identically across all three sources:
   - Discovered on-disk folders (`/campaigns/<folder>/`)
   - In-browser IndexedDB library packages
   - Built-in `CAMPAIGN_REGISTRY` presets

---

## 2. Implementation Deliverables & Architectural Seams

### 2.1 Rich Metadata Extraction (`src/workstation/scripts/map_store.js`)
In `scanCampaignsDirectory()`:
- Ensure deep scanning parses `topology.json` and `campaign.json` to extract granular counts:
  - `mapsCount`: `Object.keys(topoData.maps || {}).length || 1`
  - `nodeCount`: Sum of nodes across all maps in `topoData.maps`, or fallback to `topoData.nodes`.
  - `npcCount`: `(campMeta.entities?.npcs || topoData.npcs || topoData.entities?.npcs || []).length`
  - `questCount`: `(campMeta.entities?.quests || topoData.quests || topoData.entities?.quests || []).length`
  - `itemCount`: `(campMeta.entities?.items || topoData.items || topoData.entities?.items || []).length`
  - `modCount`: `(topoData.custom_modules || campMeta.mods || campMeta.enabled_mods || []).length`
- Store these parsed stats directly onto each record in `window.discoveredDiskCampaigns[name]`.

### 2.2 Card Layout & Census Badges (`src/workstation/scripts/mdi_window_manager.js`)
In `renderInstalledCampaignsModalList()`:
- Replace inline truncated strings with a flexible Win95 tile layout:
  - **Header Row**: Folder icon, campaign display title (bold, `#000080`, supporting multi-line wrapping or word break), and source badge (`📁 Disk`, `💾 Library`, `📦 Preset`).
  - **Census Pills Row**: Inline flex pill row with compact micro-badges:
    - `🗺️ X Maps` (if $> 1$)
    - `📍 X Nodes`
    - `👤 X NPCs`
    - `📜 X Quests`
    - `⚔️ X Items`
    - `🧩 X Mods` (if $> 0$)
  - **Description Row**: Italicized secondary text with gentle ellipsis and line clamping.
  - **Action Buttons**: Right-aligned fixed-width button container (`Open` in bold, `🗑️` delete icon).
- Mirror the same census card formatting in `renderWelcomeCampaignsList()` for `#welcome-installed-campaigns-grid`.

### 2.3 Search & Filter Tuning (`src/workstation/scripts/mdi_window_manager.js`)
- Update launcher search filter (`#campaign-launcher-search`) so users can search not just by title or folder, but also by mod name or entity keywords.

---

## 3. Acceptance Checklist
- [ ] Campaign cards render node, NPC, quest, item, and mod statistics accurately.
- [ ] Multi-map campaigns (e.g. Baldur's Gate 1 with 16 maps) show correct aggregated totals.
- [ ] Long campaign titles wrap cleanly without breaking card layout or overflowing button bounds.
- [ ] Both Open Campaign modal (`#modal-load`) and Welcome window (`#modal-welcome`) reflect new rich cards.
- [ ] Tests and suite compilation pass with zero errors.
