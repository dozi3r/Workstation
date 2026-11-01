---
file_path: "regions/Find-RegionalImage.ps1"
title: "Find-RegionalImage.ps1"
volume: "vol-7"
kind: "PowerShell Automation / Simulation Runner"
current_hash: "f3ddc7e6dfcffc6f"
reviewed_hash: "f3ddc7e6dfcffc6f"
stale: false
size_bytes: 11348
line_count: 314
---

# Find-RegionalImage.ps1

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/Find-RegionalImage.ps1` is the **CLI Scene Recommendation & Node Pinning Engine** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. This 313-line PowerShell script provides autonomous AI coding assistants, setting designers, and GMs with an instantaneous, deterministic query interface to discover and pin visual assets to pointcrawl nodes without generative AI latency or token cost.

It is governed by [[File:regions/IMAGE_ENGINE_SPEC.md]] and [[File:regions/HOW_TO_USE.md]].

---

## Command Parameters & Query Engine
- **Faceted Search Filters**:
  - `-Category`: Filters across the 8 primary environmental domains (e.g., `coasts_and_islands`, `mountains_and_highlands`, `settlements_and_bastions`).
  - `-Subcategory`: Drills into specific terrain types (e.g., `glaciated_peaks`, `sea_caves_and_coves`, `castles_and_fortresses`).
  - `-Tag`, `-Keywords`: Matches descriptive tag tokens, atmospheric adjectives, or architectural features.
  - `-Atmosphere`, `-Lighting`: Filters by mood (e.g., `ominous`, `pastoral`) and illumination (`twilight`, `subterranean_glow`, `harsh_noon`).
  - `-RecommendedNodeType`: Maps to pointcrawl archetypes (e.g., `coastal_port`, `sacred_spring`, `chokepoint_keep`).
- **Tabletop Output & Node Pinning**:
  - `-MaxResults`: Controls output list length (defaulting to 5).
  - `-PinToNode <ID>`: Automatically formats and associates the selected asset's relative path with a specific campaign node in the active setting preset.
  - Formats output as clickable Markdown image links (`![caption](relative_path)`) for direct inclusion in module handbooks.
<!-- END_CUSTOM_NOTES -->
