---
file_path: "regions/REGIONAL_IMAGE_INDEX.md"
title: "REGIONAL VISUAL ASSET DATABASE"
volume: "vol-7"
kind: "Technical Documentation / Guide"
current_hash: "374c4324e22a418b"
reviewed_hash: "374c4324e22a418b"
stale: false
size_bytes: 100265
line_count: 568
---

# REGIONAL VISUAL ASSET DATABASE

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/REGIONAL_IMAGE_INDEX.md` is the **Master Human-Readable Markdown Visual Catalog** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. This 568-line Markdown compendium provides an organized, table-driven visual reference guide for all 372 regional visual assets.

It is generated directly from [[File:regions/regional_image_catalog.json]] via `regions/Build-RegionalImageIndex.ps1`.

---

## Catalog Structure & Organization
- **Top-Level Environmental Categories**: Arranged systematically across the 8 primary domains plus the island macro cartography section.
- **Tabular Visual Entries**: For each subcategory, provides Markdown tables detailing:
  - **Asset ID**: Unique identifier (`IMG-0001` through `IMG-0372`).
  - **Preview & Path**: Direct relative link to the image file on disk.
  - **Tags & Attributes**: Key environmental tags, lighting conditions, and mood keywords.
  - **Tabletop Recommendations**: Suggested pointcrawl node archetypes for instant scene pinning.
- **Reference Companion**: Serves as the primary offline text index for GMs and authors working in Markdown environments without launching a browser.
<!-- END_CUSTOM_NOTES -->
