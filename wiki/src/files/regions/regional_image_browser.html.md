---
file_path: "regions/regional_image_browser.html"
title: "Regional Visual Asset Database & Scene Recommendation Studio"
volume: "vol-7"
kind: "Standalone Zero-CORS HTML Workstation"
current_hash: "2ebf33073fb0f6c6"
reviewed_hash: "2ebf33073fb0f6c6"
stale: false
size_bytes: 974303
line_count: 24834
---

# Regional Visual Asset Database & Scene Recommendation Studio

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/regional_image_browser.html` is the **Standalone Zero-CORS Regional Visual Asset Filtering & Pinning Studio** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. Operating entirely offline via the `file:///` protocol, this single-file HTML workstation provides a rich interactive gallery for filtering and inspecting all 372 cataloged assets.

It is governed by [[File:regions/IMAGE_ENGINE_SPEC.md]] and [[File:regions/HOW_TO_USE.md]].

---

## Interface Capabilities & Zero-CORS Architecture
- **Zero-CORS Ingestion**: Inlines or reads [[File:regions/regional_image_catalog.json]] to render immediate visual grids without requiring a local web server daemon.
- **Dynamic Multi-Faceted Filtering**:
  - Filter chips for all 8 environmental categories and 23 subcategories.
  - Real-time text search indexing filenames, descriptive captions, and tags.
  - Lighting and atmospheric mood dropdown selectors.
- **Visual Lightbox & Card Inspector**: Displays asset details (`id`, path, dimensions, tags, recommended node types) and high-resolution previews.
- **One-Click Markdown Export**: Provides buttons to copy standardized Markdown embed links (`![caption](relative_path)`) directly into the clipboard for pasting into campaign modules.
<!-- END_CUSTOM_NOTES -->
