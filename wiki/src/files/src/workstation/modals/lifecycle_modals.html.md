---
file_path: "src/workstation/modals/lifecycle_modals.html"
title: "lifecycle_modals.html"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "cf914bdffbdb8189"
reviewed_hash: "cf914bdffbdb8189"
stale: false
size_bytes: 41740
line_count: 644
---

# lifecycle_modals.html

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/modals/lifecycle_modals.html` serves as a **Workstation Shell Template** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**. Modal 2 (New Campaign Wizard) hosts `#new-campaign-presets-list` which dynamically renders available campaign presets from the campaigns directory with zero hardcoded templates. Modal 3 (Save As New Campaign) provides explicit target destination selectors indicating that saving into `/campaigns/` binds live disk sync directly to the selected slug subfolder.
<!-- END_CUSTOM_NOTES -->
