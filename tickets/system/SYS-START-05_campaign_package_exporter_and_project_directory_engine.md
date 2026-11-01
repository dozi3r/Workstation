---
id: SYS-START-05
title: "Campaign Package Exporter, Lossless Save/Save-As & Project Directory Engine"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Persistence, Cross-Platform Portability & Cartographic Packaging"
grounded_prerequisites: ["docs/adr/0004-desktop-workstation-start-html.md", "docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md", "docs/adr/0008-workstation-mod-extension-architecture-and-save-isolation.md", "docs/adr/0010-portable-campaign-packages-and-project-directory-synchronization.md"]
grounded_yields: ["Hardened Campaign Exporter Modal", "Lossless Save As (.creator.json)", "Dual-Mode ZIP Campaign Exporter (.zip)", "Unified Lossless File Ingestion", "File System Access Project Directory Binding"]
provides: ["Storage: Portable-Campaign-Package", "Storage: Lossless-Save-As", "Storage: Project-Directory-Sync", "Storage: Zip-Archive-Export"]
requires: ["Workstation: start.html", "Cartography: Multi-Map-Registry"]
standalone_fallback: "Native browser Blob download of .creator.json and localStorage/IndexedDB fallback."
---

# SYS-START-05: Campaign Package Exporter, Lossless Save/Save-As & Project Directory Engine
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/scripts/`)*  
*Status: shipped*  
*Authority: [ADR-0010](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/adr/0010-portable-campaign-packages-and-project-directory-synchronization.md), [ADR-0004](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/adr/0004-desktop-workstation-start-html.md), [ADR-0007](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md)*

---

## 1. Problem Statement & Scope
While Creator Studio provides rich recursive pointcrawl cartography, 7-wave Tarot balancing, and stationed campaign entity rosters, authors face critical friction and failure states in file persistence and cross-machine sharing:
1. **Campaign Exporter Failure (0 KB Downloads)**: Clicking "Campaign Dossier & Exporter..." (<kbd>Ctrl+E</kbd>) to generate Campaign JSON or GM Markdown Dossier fails silently or produces a 0 KB download. This is caused by missing global scoping for topological evaluation helpers (`getNodeIncomingSources`, `getNodeAdjacents`) and lack of try/catch error boundaries in the exporter UI.
2. **Quota Hazard & Volatile Storage**: Currently, <kbd>Ctrl+S</kbd> saves only to browser `localStorage` and `IndexedDB`. When multi-scale submaps contain embedded high-resolution background images, stringifying the multi-map registry into `localStorage` risks triggering browser `QuotaExceededError` (~5MB limit).
3. **Destructive File Loader Discrepancy**: The menubar action "File &rarr; Open Preset / Campaign..." uses a naive legacy parser (`importJsonFromDisk`) that parses only a flat `nodes` array and actively clears `maps`, `drawnCards`, `sovereignHubs`, and `nodeSlottedModules`, instead of routing through the authoritative, lossless `importCampaignData` engine.
4. **Lack of Disk Awareness & Backup Confidence**: Authors cannot easily choose where campaign saves are stored on disk, making manual backups uncertain and cross-machine handoffs cumbersome.

---

## 2. Technical Requirements & Acceptance Criteria

### 1. Robust Campaign Exporter Hardening
- Guarantee that `getNodeIncomingSources(nid)` and `getNodeAdjacents(nid)` are defined as authoritative globals with safe fallbacks in `src/workstation/scripts/state_adapter.js` (and properly exported by `mods/tarot_balancing/mod.js`).
- Wrap `generateCampaignJSON()` and `generateCampaignMarkdown()` in defensive try/catch blocks within `updateExportOutput()` so that errors surface transparent diagnostic banners instead of failing silently with 0 KB text buffers.
- Provide immediate visual confirmation and file size telemetry in the exporter header (e.g. `Campaign JSON: 3 Maps, 53 Nodes, 2 Images (~4.2 MB)`).

### 2. Lossless Save & "Save As..." Workflow
- Add **File &rarr; Save As...** to the menubar and keyboard shortcuts (<kbd>Ctrl+Shift+S</kbd>).
- "Save As..." exports a complete, self-contained **Portable Campaign Package** (`.creator.json` or `.cs-campaign.json`) containing:
  - All recursive submaps (`maps`), active map pointer, and root pointer.
  - Active campaign entity rosters (NPCs, quests, items, dials/threat clocks, tickets).
  - 7-wave Tarot progression, card draws, and sovereign hub elections.
  - Global dial toggles and supply-chain slotting.
  - Cartographic background image metadata and data URLs.
- Update `saveActiveCampaign()` (<kbd>Ctrl+S</kbd>) to prioritize saving to the bound disk handle if a Project Directory or file handle exists, falling back to IndexedDB/localStorage with an on-screen status confirmation.

### 3. Dual-Mode Archive Packaging (ZIP Archive)
- Provide **Export Campaign Archive (.zip)** in the exporter modal and File menu.
- Deconstruct the monolithic campaign into clean components inside the zip:
  - `campaign.json`: Core campaign metadata, dials, factions, and entity rosters.
  - `preset.json`: Topological nodes, corridors, waves, and submap definitions.
  - `assets/`: Discrete PNG/JPG/WebP background map images extracted from base64 strings.
- Ingestion engine supports importing either `.creator.json` or `.zip` packages transparently.

### 4. File System Access API & "Set Project Directory..."
- Implement **File &rarr; Set Project Directory...** using Chromium's `window.showDirectoryPicker()`.
- When a local folder is selected:
  - Automatically persist file handles in IndexedDB.
  - On <kbd>Ctrl+S</kbd>, stream `campaign.json`, `preset.json`, and extracted image assets directly into the directory on disk.
  - Provide a desktop status indicator in the bottom status bar displaying active project folder path (e.g. `Dir: C:\Users\...\MyCampaign`).
  - Fall back gracefully to standard browser file download in non-Chromium or restricted environments.

### 5. Unified Lossless File Ingestion
- Replace all legacy flat JSON import calls with `importCampaignData(data, sourceLabel)`.
- Ensure drag-and-dropping any `.json`, `.creator.json`, or `.zip` file onto the CAD canvas immediately triggers full multi-scale hydration.
