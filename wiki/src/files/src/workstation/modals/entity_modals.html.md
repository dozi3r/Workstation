---
file_path: "src/workstation/modals/entity_modals.html"
title: "entity_modals.html"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "a59f9bbc48ce2dca"
reviewed_hash: "a59f9bbc48ce2dca"
stale: false
size_bytes: 63522
line_count: 924
---

# entity_modals.html

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/modals/entity_modals.html` serves as a **Workstation Shell Template** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

### Bestiary & Resource Explorer Integration
- Houses tab strip controls `#em-tab-industry` (`🏭 Industry`), `#em-tab-resource` (`📦 Resources`), and `#em-tab-creature`, plus the `#em-filter-node`, `#em-filter-category`, `#em-filter-status`, `#em-sort-select`, and `#em-filter-summary` Entity Explorer overhaul filter bar within the Master Entity Explorer modal (`modal-entity-manager`).
- Houses `#ee-creature-extensions` inside the Entity Creation and Editing dialog (`modal-entity-edit`), providing controls for:
  - Kind / Family classification (`beast`, `undead`, `demon`, `humanoid`, `construct`, `elemental`, etc.)
  - Subtype / Breed
  - Body Size categories (Tiny to Gargantuan)
  - Threat Tier (0 to 5)
  - Dread Index (1 to 10) and Dread Effect
  - Roaming Scope (`stationary_lair`, `adjacent_corridor`, `district_wide`, `campaign_wide`)
  - 6 Relative Capabilities (Might, Agility, Resilience, Cunning, Awareness, Presence) on a 1-5 pip scale.
- **Cross-Campaign Sources & Transplant Packaging Modals**:
  - Houses `#em-btn-sources` and `#em-sources-popover` containing source checkboxes, dynamic count badge, and buttons for `+ Load JSON...` and `+ Load Folder...`.
  - Houses `#modal-transplant-package` (`win-dialog` / Win95 styling) providing primary entity summary, target station node dropdown, ID conflict resolution selector (`auto_unique`, `overwrite_if_exists`, `preserve_strict`), scrollable dependency mapping table with 3-way action selectors (`copy`, `reassign`, `omit`), candidate target dropdowns, and execution triggers.
<!-- END_CUSTOM_NOTES -->
