---
file_path: "src/workstation/template.html"
title: "Creator Studio - Campaign Authoring Workstation"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "c13eadd48ebcee3e"
reviewed_hash: "08e585076e03056e"
stale: true
size_bytes: 49622
line_count: 735
---

# Creator Studio - Campaign Authoring Workstation

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/template.html` serves as the primary desktop workstation HTML scaffolding shell, compiled into `start.html` via `Build-Suite.ps1`. It defines the desktop icon grid, Win95 taskbar, Start Menu, top menu bar, CAD canvas viewport, HUD layers, and hidden file inputs. It populates `BUNDLED_TOPOLOGIES` dynamically from `CAMPAIGN_REGISTRY` without hardcoding legacy presets.

### Subsystems & Integrations
- **Pack Ingestion Entry Points**: Provides hidden file input `#pack-installer-file-input` triggering `packEngine.onPackFileSelected()`, with menu triggers integrated into the Start Menu ("Install Entity Pack (.csmod)..."), File Menu ("Install Entity Pack (.csmod)..."), and Help Menu documentation reference.
- **MDI Scaffolding & Viewport**: Hosts the CAD SVG canvas, HUD overlays, toolbar palettes, and placeholder injection slots for modular modal files (`studio_mdi_windows.html`, `entity_modals.html`, `lifecycle_modals.html`, `explorer_modals.html`, `ticket_modals.html`).
<!-- END_CUSTOM_NOTES -->
