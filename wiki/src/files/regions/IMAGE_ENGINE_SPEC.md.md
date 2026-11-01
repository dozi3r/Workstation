---
file_path: "regions/IMAGE_ENGINE_SPEC.md"
title: "REGIONAL VISUAL ASSET DATABASE & INGESTION PIPELINE SPECIFICATION"
volume: "vol-7"
kind: "Technical Documentation / Guide"
current_hash: "c561e74b6edb59c0"
reviewed_hash: "c561e74b6edb59c0"
stale: false
size_bytes: 20122
line_count: 407
---

# REGIONAL VISUAL ASSET DATABASE & INGESTION PIPELINE SPECIFICATION

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/IMAGE_ENGINE_SPEC.md` is the **Master Architectural Specification for the Regional Visual Asset Database & Ingestion Pipeline** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. Governed by [[File:docs/adr/0001-dual-mode-preset-architecture.md]] and [[File:docs/adr/0007-system-agnostic-dials.md]], this 407-line specification establishes the design principles, schema contracts, and taxonomy governing all 372 visual assets.

---

## Foundational Tenets & Design Contracts
1. **System-Agnostic & Zone-Decoupled**: Assets never encode specific node or zone numbers into filenames or metadata. Nodes are assigned dynamically during campaign authoring (e.g., via 7-wave Tarot distributions). Images are classified strictly by environmental, hydrological, architectural, and atmospheric attributes.
2. **Two Decoupled Asset Layers**:
   - **Local Scene Images (344 assets)**: Stored in `regions/images/`, categorized across 8 terrain classes for pointcrawl scene visualization.
   - **Island Macro & Cartography (28 assets)**: Stored in `regions/island_macro_and_aerials/`, containing high-altitude aerials, 3D elevation maps, and macro cartography keys.
3. **TypeScript Schema (`RegionalVisualAsset`)**: Codifies the schema implemented in [[File:regions/regional_image_catalog.json]]:
   - `id` (`IMG-XXXX`), `relative_path`, `filename`, `legacy_filename`.
   - `category`, `subcategory`, `tags[]`, `description`.
   - `mood_and_atmosphere`, `lighting`, `recommended_node_types[]`.
4. **8 Environment Categories**: `mountains_and_highlands`, `valleys_and_canyons`, `waters_and_wetlands`, `forests_and_woodlands`, `plains_and_grasslands`, `coasts_and_islands`, `settlements_and_bastions`, `ancient_ruins_and_vaults`.
5. **Future AI Vision Integration**: Outlines future vision-language model (VLM) automated tagging and semantic embedding pipelines.
<!-- END_CUSTOM_NOTES -->
