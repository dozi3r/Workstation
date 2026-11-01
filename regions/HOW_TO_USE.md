# PORTABLE REGIONAL IMAGE STUDIO
## Standalone Visual Database, Scene Recommendation Browser & Image Library

Welcome! This package is a 100% self-contained, offline visual asset library containing **344 curated landscape, architectural, and landmark photographs/renders** from Campaign Setting.

---

### Quick Start: How to Open & Browse

1. **Double-click `index.html`** (or `regional_image_browser.html`) in this folder.
   - It opens in your default web browser (Chrome, Edge, Firefox, Safari).
   - **No installation or internet required.** Zero web servers needed.
   - All 344 images load directly from the local `images/` subfolder.

2. **Or Browse in File Explorer / Finder:**
   - Open the [`images/`](images/) folder directly to browse raw files organized by geography and architecture:
     - `mountains_and_highlands/` (glaciated peaks, scree foothills, granite domes)
     - `valleys_and_canyons/` (river gorges, cliffs, valley roads & bridges)
     - `waters_and_wetlands/` (streams, rivers, waterfalls, lakes, swamps & mangroves)
     - `forests_and_woodlands/` (redwoods, fey woods, temperate hardwoods)
     - `plains_and_grasslands/` (savanna & razor-sedge plains)
     - `coasts_and_islands/` (beaches & bluffs, sea caves, rocky surf, lagoons)
     - `settlements_and_bastions/` (castles & fortresses, walled towns, harbors, monasteries)
     - `ancient_ruins_and_vaults/` (cyclopean pyramids, ruins, stepwells, cisterns, crypts)

---

### Dynamic Selection Counts (Live Faceted Browsing)

Every tab, button, and dropdown option features **real-time dynamic counts** that show you how many images are in that selection *before* you click it:

* **Live Perspective Counts:** When you apply a filter (e.g. clicking *Waters & Wetlands* or searching for `bridge`), every other tab and button instantly updates its count badge to show how many images will be visible if that option is selected.
* **Toggle to Clear:** Clicking an already active tab or button toggles it back to "All" for fast, fluid navigation.
* **Zero-Result Badges:** If an option has `(0)` matches with your current filter combination, its pill automatically dims so you never waste clicks on empty selections.

---

### Path & Markdown Copying Modes

In the top-right corner of the browser header, click the **Path: Relative (./images/) ⚙️** chip to configure how paths are copied:

1. **Portable Relative Mode (Default):**
   - Clicking **Markdown** copies: `![Caption](images/category/subcategory/filename.png)`
   - Clicking **Path** copies: `images\category\subcategory\filename.png`
   - *Why this is awesome:* You can drop this entire folder into an **Obsidian vault**, VS Code workspace, or campaign wiki, and all Markdown embeds work immediately without breaking!
2. **Absolute Path Mode:**
   - Click "Auto-Detect" to detect your local folder directory automatically, or type your own path.
   - Clicking **Markdown** copies: `![Caption](file:///C:/YourFolder/images/...)`
   - Clicking **Path** copies: `C:\YourFolder\images\...`

---

### Features in the Studio

* **Filter Pills with Dynamic Counts:** Filter by 8 Environmental Categories or 6 Architectural Density Levels:
  - `🌲 Wilderness` — Pure untouched wilderness with 0 buildings.
  - `🏰 Isolated Structure` — Lone castles, hillforts, hermit bothies, mountain chapels.
  - `🌉 Civil Infrastructure` — Stone arch bridges, wooden swamp boardwalks, lighthouses.
  - `🏘️ Dense Settlement` — Walled towns, citadels, coastal ports.
  - `🏛️ Ancient Ruins` — Overgrown pyramids, stepwells, neolithic circles.
  - `🗝️ Subterranean Vault` — Flooded marble cisterns, cavern crypts, carved caves.
* **Real-Time Tag & Keyword Search:** Search by keywords (e.g. `stream`, `bridge`, `fog`, `castle`, `boardwalk`).
* **Pin to Zone / Node:** Click the **☆ Pin** button on any card to assign that image to a custom Campaign Node (e.g. "Node #7"). The card displays `★ Node #7` and can be filtered with "Show Pinned Only". Pins are saved in your browser's local storage.
* **Full View Modal:** Click any thumbnail for full resolution, camera orientation, and atmospheric narrative scene pitches.

---

### Included Files

| File / Folder | Description |
| :--- | :--- |
| **`index.html`** | Standalone interactive visual browser & pinning studio. |
| **`images/`** | Complete directory of 344 curated image files (PNG/JPG/WEBP). |
| **`regional_image_catalog.json`** | Authoritative JSON database with full metadata, dimensions, and tags. |
| **`REGIONAL_IMAGE_INDEX.md`** | Master Markdown catalog table with relative preview links. |
| **`HOW_TO_USE.md`** | This guide. |
