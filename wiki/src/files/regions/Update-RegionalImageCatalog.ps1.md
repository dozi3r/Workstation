---
file_path: "regions/Update-RegionalImageCatalog.ps1"
title: "Update-RegionalImageCatalog.ps1"
volume: "vol-7"
kind: "PowerShell Automation / Simulation Runner"
current_hash: "a2cc5c902038e6bf"
reviewed_hash: "a2cc5c902038e6bf"
stale: false
size_bytes: 12537
line_count: 303
---

# Update-RegionalImageCatalog.ps1

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/Update-RegionalImageCatalog.ps1` is the **Incremental Ingestion Engine & Catalog Synchronizer** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. This 303-line PowerShell tool scans the physical file hierarchy under `regions/images/` and `regions/island_macro_and_aerials/` to update the authoritative machine-readable database [[File:regions/regional_image_catalog.json]].

It enforces the structural integrity contracts specified in [[File:regions/IMAGE_ENGINE_SPEC.md]].

---

## Execution Pipeline & Ingestion Logic
1. **Recursive Directory Traversal**: Scans all 8 category directories under `regions/images/` (344 scene assets) and the 2 cartography directories in `regions/island_macro_and_aerials/` (28 macro assets).
2. **Deterministic ID Allocation**: Preserves existing sequential identifiers (`IMG-0001` through `IMG-0372`) and assigns new sequential IDs to newly discovered assets.
3. **Metadata Extraction & Merging**:
   - Parses the relative file path into `category` and `subcategory` properties.
   - Extracts human-readable name tokens from snake_case filenames.
   - Merges newly discovered files while strictly preserving existing hand-curated `description`, `tags`, `mood_and_atmosphere`, `lighting`, and `recommended_node_types` fields.
4. **JSON Database Serialization**: Writes the formatted, sorted asset array back to [[File:regions/regional_image_catalog.json]] with clean 2-space indentation.
5. **Regeneration Trigger**: Informs the user to run `Build-RegionalImageIndex.ps1` to synchronize the human-readable Markdown compendium [[File:regions/REGIONAL_IMAGE_INDEX.md]].
<!-- END_CUSTOM_NOTES -->
