---
file_path: "src/workstation/template.html"
title: "Creator Studio - Campaign Authoring Workstation"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "36e0bf5e586288d8"
reviewed_hash: "36e0bf5e586288d8"
stale: false
size_bytes: 53218
line_count: 771
---

# Creator Studio - Campaign Authoring Workstation

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/template.html` serves as the primary desktop workstation HTML scaffolding shell, compiled into `start.html` via `Build-Suite.ps1`. It defines the desktop icon grid, Win95 taskbar, Start Menu, top menu bar, CAD canvas viewport, HUD layers, and hidden file inputs. It populates `BUNDLED_TOPOLOGIES` dynamically from `CAMPAIGN_REGISTRY` without hardcoding legacy presets.

### Subsystems & Integrations
- **Pack Ingestion Entry Points**: Provides hidden file input `#pack-installer-file-input` triggering `packEngine.onPackFileSelected()`, with menu triggers integrated into the Start Menu ("Install Entity Pack (.csmod)..."), File Menu ("Install Entity Pack (.csmod)..."), and Help Menu documentation reference.
- **MDI Scaffolding & Viewport**: Hosts the CAD SVG canvas, HUD overlays, toolbar palettes, and placeholder injection slots for modular modal files (`studio_mdi_windows.html`, `entity_modals.html`, `lifecycle_modals.html`, `explorer_modals.html`, `ticket_modals.html`).
- **Script Include Order (SYS-ARCH-01)**: `// @@INCLUDE: scripts/campaign_mutation_engine.js @@` is the first script include. The engine has no dependencies, and its UMD tail publishes the root aliases (`getNodesList`, `formatCorridorKey`, `normalizeSpatialPin`, and the rest) before any other workstation script loads. `build_suite.js` inlines includes in template order, so this order is the compiled order. Suite 49 guards it.
<!-- END_CUSTOM_NOTES -->
