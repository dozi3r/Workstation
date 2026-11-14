---
file_path: "src/workstation/template.html"
title: "Creator Studio - Campaign Authoring Workstation"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "493b60b2d59afb72"
reviewed_hash: "493b60b2d59afb72"
stale: false
size_bytes: 59971
line_count: 895
---

# Creator Studio - Campaign Authoring Workstation

<!-- BEGIN_CUSTOM_NOTES -->
The shell registers built-in campaign summaries (`registerBundledCampaign`) and loads per-campaign `campaigns/<folder>/campaign_bundle.js` payloads on demand via `ensureCampaignBundleLoaded` and `hydrateBundledCampaign`.

### Architectural Purpose & Role
`src/workstation/template.html` serves as the primary desktop workstation HTML scaffolding shell, compiled into `start.html` via `Build-Suite.ps1`. It defines the desktop icon grid, Win95 taskbar, Start Menu, top menu bar, CAD canvas viewport, HUD layers, and hidden file inputs. It populates `BUNDLED_TOPOLOGIES` dynamically from `CAMPAIGN_REGISTRY` without hardcoding legacy presets.

### Subsystems & Integrations
- **Pack Ingestion Entry Points**: Provides hidden file input `#pack-installer-file-input` triggering `packEngine.onPackFileSelected()`, with menu triggers integrated into the Start Menu ("Install Entity Pack (.csmod)..."), File Menu ("Install Entity Pack (.csmod)..."), and Help Menu documentation reference.
- **Campaign Settings Triggers (SYS-START-19)**: Integrates openCampaignSettingsModal() triggers in the File menu, Edit menu, via hotkey Ctrl+Shift+P, and via clickable cursor-pointer interaction on the #sb-campaign status bar badge.
- **MDI Scaffolding & Viewport**: Hosts the CAD SVG canvas, HUD overlays, toolbar palettes, and placeholder injection slots for modular modal files (`studio_mdi_windows.html`, `entity_modals.html`, `lifecycle_modals.html`, `explorer_modals.html`, `ticket_modals.html`).
- **Script Include Order (SYS-ARCH-01)**: `// @@INCLUDE: scripts/campaign_mutation_engine.js @@` is the first script include. The engine has no dependencies, and its UMD tail publishes the root aliases (`getNodesList`, `formatCorridorKey`, `normalizeSpatialPin`, and the rest) before any other workstation script loads. `build_suite.js` inlines includes in template order, so this order is the compiled order. Suite 49 guards it.
- Gigerenzer suite (ADR 0024): includes fast_frugal_tree.js, natural_frequency_engine.js and fft_editor_ui.js.
- Gigerenzer suite (ADR 0024): also includes dread_risk.js and dread_risk_overlay.js.
<!-- END_CUSTOM_NOTES -->
