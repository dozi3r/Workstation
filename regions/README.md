# CAMPAIGN CREATOR: VISUAL SCENERY & IMAGE ENGINE
## Decoupled Environmental Assets, Architectural Classification & Recommendation Studio
*Root Directory: [`Creator/regions/`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/)*

---

### Overview

The `regions/` directory houses the **Universal Visual Scenery Database & Recommendation Engine**. It provides **344 photographic and rendered landscape assets** decoupled from fixed map coordinates and tagged with building presence, architectural classification, hydrology, mood, and environmental biomes for runtime scene generation and pointcrawl node pinning.

---

### 1. The Visual Asset Architecture

* **Decoupled Scenery Taxonomy:** All 344 assets live in [`regions/images/`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/images/) across 8 standardized environmental categories:
  * `mountains/` (Glacial horns, granite ridges, scree slopes, elevation passes)
  * `valleys/` (Limestone gorges, river switchbacks, dry canyons, transit funnels)
  * `waters/` (Alpine cataracts, lakes, estuaries, coastal surf, freshwater flumes)
  * `forests/` (Deep redwood canopies, mossy old-growth, sylvan groves, living barriers)
  * `plains/` (Highland meadows, razor-sedge basins, barren plateaus)
  * `coasts/` (Sea arches, chalk cliffs, volcanic skerry reefs, smugglers' tidal caves)
  * `settlements/` (Frontier outposts, fortified bastions, timber boardwalks, mill towers)
  * `ruins/` (Ancient monoliths, cyclopean vaults, subterranean corridors, broken aqueducts)
* **Central Catalog:** [`regions/regional_image_catalog.json`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/regional_image_catalog.json) provides structured metadata including building types, count, mood, hydrology, tags, and narrative scene pitches for each asset.
* **Full Visual Index:** [`regions/REGIONAL_IMAGE_INDEX.md`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/REGIONAL_IMAGE_INDEX.md) provides a categorized Markdown index with clickable preview links.

---

### 2. Available Tooling

| Tool / File | Purpose |
| :--- | :--- |
| **[`regional_image_browser.html`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/regional_image_browser.html)** | Interactive browser studio to filter scenery assets by category, architectural density, mood, and hydrology, and generate Markdown handout embeds. |
| **[`Find-RegionalImage.ps1`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/Find-RegionalImage.ps1)** | CLI search tool to recommend images by environment tags and building categories directly from the terminal. |
| **[`Update-RegionalImageCatalog.ps1`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/Update-RegionalImageCatalog.ps1)** | Ingestion engine to scan, tag, classify, and update the catalog when new images are added. |
| **[`IMAGE_ENGINE_SPEC.md`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/IMAGE_ENGINE_SPEC.md)** | Technical specification covering schema, building taxonomy, and API integration. |
| **[`HOW_TO_USE.md`](file:///c:/Users/Milo/Documents/Antigravity/Creator/regions/HOW_TO_USE.md)** | GM guide for pairing scenery assets with pointcrawl campaign nodes. |

---

### 3. Setting Dossiers Note

For GMs running the original Campaign Setting setting, canonical regional dossiers (covering historical campaign notes and specific location bios) are cataloged in the core project library. In the Campaign Creator suite, all scenery assets are fully decoupled so they can illustrate any custom campaign world.
