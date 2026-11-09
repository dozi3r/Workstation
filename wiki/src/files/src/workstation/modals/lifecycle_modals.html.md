---
file_path: "src/workstation/modals/lifecycle_modals.html"
title: "lifecycle_modals.html"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "898d54573e70399a"
reviewed_hash: "898d54573e70399a"
stale: false
size_bytes: 52518
line_count: 784
---

# lifecycle_modals.html

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/modals/lifecycle_modals.html` serves as a **Workstation Shell Template** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**. Modal 2 (New Campaign Wizard) hosts `#new-campaign-presets-list` which dynamically renders available campaign presets from the campaigns directory with zero hardcoded templates. Modal 3 (Save As New Campaign) provides explicit target destination selectors indicating that saving into `/campaigns/` binds live disk sync directly to the selected slug subfolder. Modal 3B (`#modal-campaign-settings`, SYS-START-19) provides dedicated dialog controls for campaign title, slug, author, root map name, pitch/description, Dial 8 Climax Trigger mode, and Tier 0 Substratum layer enablement.
<!-- END_CUSTOM_NOTES -->
