---
file_path: "regions/HOW_TO_USE.md"
title: "PORTABLE REGIONAL IMAGE STUDIO"
volume: "vol-7"
kind: "Technical Documentation / Guide"
current_hash: "0680e0c10e133512"
reviewed_hash: "0680e0c10e133512"
stale: false
size_bytes: 4656
line_count: 77
---

# PORTABLE REGIONAL IMAGE STUDIO

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/HOW_TO_USE.md` is the **Regional Scenery Engine Operator Manual & Integration Guide** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. It provides human authors and autonomous agents with practical step-by-step instructions for querying, browsing, and embedding visual assets within tabletop campaign modules.

It is paired with [[File:regions/IMAGE_ENGINE_SPEC.md]] and [[File:regions/README.md]].

---

## Core Operational Workflows
- **Interactive Visual Browsing**: Instructions for launching [[File:regions/regional_image_browser.html]] offline via `file:///` to filter assets by environment, view high-resolution lightboxes, and copy Markdown snippet links.
- **CLI Querying & Scripting**: Detailed syntax examples for searching the catalog via [[File:regions/Find-RegionalImage.ps1]], demonstrating compound keyword searches, mood filtering, and batch recommendation output.
- **Markdown Embedding Syntax**: Standardized image linking conventions for campaign modules:
  - Local Scenery: `![[regions/images/<category>/<subcategory>/<filename>.png]]`
  - Island Cartography: `![[regions/island_macro_and_aerials/<folder>/<filename>.png]]`
- **Asset Ingestion Protocol**: Rules for adding new imagery via [[File:regions/Update-RegionalImageCatalog.ps1]], including directory naming standards and tag guidelines.
<!-- END_CUSTOM_NOTES -->
