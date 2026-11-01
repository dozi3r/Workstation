---
file_path: "regions/regional_image_catalog.json"
title: "regional_image_catalog.json"
volume: "vol-7"
kind: "Authoritative JSON Data / Manifest"
current_hash: "2076e1944a22876c"
reviewed_hash: "2076e1944a22876c"
stale: false
size_bytes: 923544
line_count: 23299
---

# regional_image_catalog.json

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`regions/regional_image_catalog.json` is the **Authoritative Single Source of Truth Database for Regional Visual Assets** within **Volume VII: Regional Scenery & Visual Asset Engine (regions/)**. This 23,299-line JSON database cataloges 372 visual assets, providing complete metadata, environmental taxonomies, and tabletop recommendations.

It is governed by the schema specified in [[File:regions/IMAGE_ENGINE_SPEC.md]].

---

## Schema Structure & Asset Breakdown
The JSON file consists of an array of 372 objects matching the `RegionalVisualAsset` contract:
- **Local Scenery Images (344 entries)**:
  - `mountains_and_highlands` (49 assets: peaks, foothills, domes)
  - `valleys_and_canyons` (17 assets: gorges, cliffs, roads)
  - `waters_and_wetlands` (83 assets: streams, rapids, waterfalls, tarns, swamps)
  - `forests_and_woodlands` (18 assets: redwoods, fey woods, temperate)
  - `plains_and_grasslands` (6 assets: savannas, grasslands)
  - `coasts_and_islands` (51 assets: beaches, bluffs, sea caves, lagoons)
  - `settlements_and_bastions` (96 assets: castles, citadels, harbors, temples)
  - `ancient_ruins_and_vaults` (24 assets: overgrown ruins, vaults, crypts)
- **Macro Cartography & Aerials (28 entries)**:
  - `calderas_and_aerial_overviews` (14 assets: satellite and high-altitude views)
  - `annotated_cartography` (14 assets: Tinkercad workplanes, annotated maps)
- **Downstream Consumers**: Consumed by [[File:regions/Find-RegionalImage.ps1]], [[File:regions/regional_image_browser.html]], [[File:regions/REGIONAL_IMAGE_INDEX.md]], and [[File:network/campaign_studio.html]].
<!-- END_CUSTOM_NOTES -->
