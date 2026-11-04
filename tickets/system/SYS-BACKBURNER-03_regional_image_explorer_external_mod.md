---
id: SYS-BACKBURNER-03
title: "Regional Scenery Image Recommendation Engine (Parked in External Mod)"
pipeline_tier: 0
target_surface: "External Mod (regional_biomes)"
status: discovery
category: "system_architecture"
wave: "Backburner / Parked External Mod"
grounded_prerequisites: ["Native node.biome and edgeRecord.biome properties in property_grid_inspector.js"]
grounded_yields: ["Core workstation decoupled from ~1GB regional image catalogs while preserving native biome tagging"]
provides: ["Backburner: External-Regional-Image-Mod"]
requires: ["Workstation: Mod-API"]
standalone_fallback: "Core nodes and roads natively support Biome classification (24 presets + custom strings) in property_grid_inspector.js without bundling image catalogs."
---

# SYS-BACKBURNER-03: Regional Scenery Image Recommendation Engine (Parked in External Mod)
*Category: system_architecture | Target Surface: External Mod (`regional_biomes`)*
*Status: discovery (Backburner / Parked External Mod)*

---

## 1. Executive Summary & Architectural Decision

The **Regional Scenery Image Browser** (`regions/regional_image_browser.html`, `regions/Find-RegionalImage.ps1`, `regions/regional_image_catalog.json`) and its associated ~1 GB image library are not needed during core workstation development and have been evicted from `Workstation 2.5` (archived to `.archive/cleanup_2026_11_03/regions/` and maintained separately in the external `regional_biomes` mod repository).

### Core Invariant Preserved
- **Native `biome` Property**: Every node (`node.biome`) and road (`edgeRecord.biome`) in `start.html` retains first-class **Biome / Ecological Zone** support directly inside `src/workstation/scripts/property_grid_inspector.js`, `sociology_data.js`, and `campaign_mutation_engine.js` (`CORE_BIOME_PRESETS`: 24 structured ecological zones across 8 categories plus custom text entry), with automatic backward compatibility for legacy `node.modData.regional_biomes.biome` values.
- **Zero Image Bloat**: No regional image explorers, `.ps1` scenery recommenders, or multi-megabyte image catalogs are compiled or tracked in the core repository.
