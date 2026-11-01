---
file_path: "src/workstation/scripts/mdi_window_manager.js"
title: "mdi_window_manager.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "674a4dec7b5ee160"
reviewed_hash: "674a4dec7b5ee160"
stale: false
size_bytes: 108442
line_count: 2412
---

# mdi_window_manager.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/mdi_window_manager.js` manages MDI window state, titlebar dragging, maximize/minimize/restore behavior, taskbar integration, and dynamic mod UI registration. It provides `refreshModUI()` to dynamically populate the workstation `Mods` menubar with interactive entries, supporting both hover- and click-activated flyout submenus (`menuItems` / `menuOptions`), CAD palette buttons (`paletteTools`), and dock tab transitions (`switchDockTab`). It also powers the New Campaign Wizard via `getCampaignFolderPresets()` and `renderNewCampaignPresetsList()`, offering only campaigns from the `/campaigns/` folder as presets to build from without any hardcoded templates.

Lifecycle management functions include `connectCampaignsFolder({ autoLoad })` with non-destructive option flags to prevent auto-loading collisions during save workflows, `openSaveAsNewCampaignModal()` and `autoUpdateSaveAsSlug()` displaying live disk sync status, `confirmSaveAsNewCampaign()` binding live disk sync directly to `/campaigns/<slug>` on disk without passing deprecated project handles, and `renderInstalledCampaignsModalList()` cleanly loading disk campaigns and dismissing modal dialogues (`modal-load`).
<!-- END_CUSTOM_NOTES -->
