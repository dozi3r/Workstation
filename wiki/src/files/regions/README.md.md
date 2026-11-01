---
file_path: "regions/README.md"
title: "CAMPAIGN CREATOR: VISUAL SCENERY & IMAGE ENGINE"
volume: "vol-7"
kind: "Technical Documentation / Guide"
current_hash: "77e98c7d1c1e7e6f"
reviewed_hash: "77e98c7d1c1e7e6f"
stale: false
size_bytes: 3561
line_count: 44
---

# CAMPAIGN CREATOR: VISUAL SCENERY & IMAGE ENGINE

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/README.md` is the **Subsystem Entrypoint & Overview for the Regional Visual Asset Engine** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. It documents the repository layout, asset inventories, and toolchain powering instant visual immersion across campaign settings.

---

## Subsystem Architecture Summary
- **Visual Asset Inventory**:
  - 344 local scenery assets organized in human-navigable folders under `regions/images/`.
  - 28 macro cartography and elevation aerials under `regions/island_macro_and_aerials/`.
- **Integrated Surfaces & Runners**:
  - [[File:regions/IMAGE_ENGINE_SPEC.md]] — Master architectural specification.
  - [[File:regions/HOW_TO_USE.md]] — Practical operator handbook.
  - [[File:regions/regional_image_browser.html]] — Zero-CORS standalone HTML filtering workstation.
  - [[File:regions/regional_image_catalog.json]] — Authoritative JSON database.
  - [[File:regions/REGIONAL_IMAGE_INDEX.md]] — Human-readable visual catalog.
  - [[File:regions/Find-RegionalImage.ps1]] — CLI recommendation runner.
  - [[File:regions/Update-RegionalImageCatalog.ps1]] — Ingestion and metadata synchronizer.
- **Pointcrawl Integration**: Explains how visual scenery pins link into [[File:network/campaign_studio.html]] and setting module handbooks.
<!-- END_CUSTOM_NOTES -->
