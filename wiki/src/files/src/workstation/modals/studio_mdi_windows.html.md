---
file_path: "src/workstation/modals/studio_mdi_windows.html"
title: "studio_mdi_windows.html"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "7b4c2ae6e9cc5194"
reviewed_hash: "7b4c2ae6e9cc5194"
stale: false
size_bytes: 33573
line_count: 463
---

# studio_mdi_windows.html

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/modals/studio_mdi_windows.html` defines the Win95/VB6 MDI modal window dialog markup for the Creator Studio desktop shell, inlined during build into `start.html`.

### Contained MDI Windows & Dialogs
- **Pack Installer (`#modal-pack-installer`)**: Guided 3-step installation dialog for `.csmod` entity module packs with tabs for Overview/Manifest, Portal Anchor Node selection, and Entity Conflict resolution.
- **Sourcebooks & Packages (`#modal-sourcebooks`)**: Dual-tab package manager displaying official modules and the `Installed Entity Packs (.csmod)` management ledger with one-click safe teardown/uninstall.
- **Campaign Export (`#modal-campaign-export`)**: Multi-format campaign exporter including the `Export as Pack (.csmod)` slice with configurable manifest fields, entity cluster checkboxes, and standalone `.csmod` bundle generation.
<!-- END_CUSTOM_NOTES -->
