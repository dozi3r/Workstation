# 0010: Portable Campaign Packages, Dual-Mode Archives, and Project Directory Synchronization

## Context
Creator Studio operates as an offline, zero-CORS desktop workstation (`start.html`) running directly from the local filesystem (`file:///`). Campaign authoring involves complex, interconnected data models: multi-scale pointcrawl topologies (`maps`), 7-wave Tarot card assignments, active campaign entity rosters (NPCs, quests, items, clocks, tickets), and embedded cartographic background images.

Previously:
1. Workstation state was saved solely to browser `localStorage` and `IndexedDB` under fixed keys. Clearing browser site data or switching machines resulted in complete work loss unless manually exported.
2. Large embedded base64 map images risked triggering browser `QuotaExceededError` (~5MB limit) when saving `maps` directly into `localStorage`.
3. The File menu lacked a proper "Save As" flow, and the File Open loader used a legacy flat format that stripped submaps and Tarot draws upon import.
4. Users could not easily identify where their campaign files lived on disk for manual backups or version control.

## Decision
1. **Portable Campaign Package (`.creator.json`)**:
   - Establish `.creator.json` as the primary, self-contained single-file campaign document.
   - Encodes the full recursive multi-scale pointcrawl hierarchy (`maps`), active campaign entities, 7-wave Tarot states, global dials, and base64-encoded background map images.
   - Fully portable across machines: any user can drag-and-drop or open the file in `start.html` on any device to reproduce the exact authoring state.

2. **Dual-Mode Archive Packaging (`.zip`)**:
   - Provide an optional multi-file archive package (`.zip`) decompressing the campaign into `campaign.json`, `preset.json`, and an `assets/` directory containing discrete PNG/JPG map images.
   - Enables authors to edit map artwork in external image editors (Photoshop/GIMP) while keeping topological JSON lightweight and diffable.

3. **Hybrid Desktop File Lifecycle & Project Directory**:
   - Implement **File &rarr; Save As...** (<kbd>Ctrl+Shift+S</kbd>) to trigger a lossless `.creator.json` or `.zip` export to disk.
   - Implement **File &rarr; Set Project Directory...** leveraging the Chromium File System Access API (`showDirectoryPicker()`). When bound, <kbd>Ctrl+S</kbd> writes campaign files directly to the chosen folder on disk without repeated download dialogs.
   - In environments without directory picker support (e.g. Firefox or security sandboxes), fall back transparently to browser blob downloads.

4. **Unified Lossless File Ingestion**:
   - Deprecate all flat-topology loaders. All file opening, preset loading, and drag-and-drop operations route through `importCampaignData()`, guaranteeing that submaps, stationed entities, and card assignments are never discarded.

## Consequences
- Campaign saves become indestructible and easily portable across machines and collaborators.
- High-resolution map backgrounds can be either embedded (zero-friction single file) or externalized (modular editing).
- Authors gain full visibility into where their campaign files are saved on disk.
- Sets the foundation for bundling user-authored campaigns (like Silica Island) directly into the `campaigns/` directory as built-in presets.
