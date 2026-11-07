---
file_path: "src/workstation/modals/entity_modals.html"
title: "entity_modals.html"
volume: "vol-4"
kind: "Workstation Shell Template"
current_hash: "e42aa9e0a7883505"
reviewed_hash: "e42aa9e0a7883505"
stale: false
size_bytes: 53274
line_count: 810
---

# entity_modals.html

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/modals/entity_modals.html` serves as a **Workstation Shell Template** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

### Bestiary & Resource Explorer Integration
- Houses tab strip controls `#em-tab-resource` and `#em-tab-creature` within the Master Entity Explorer modal (`modal-entity-manager`).
- Houses `#ee-creature-extensions` inside the Entity Creation and Editing dialog (`modal-entity-edit`), providing controls for:
  - Kind / Family classification (`beast`, `undead`, `demon`, `humanoid`, `construct`, `elemental`, etc.)
  - Subtype / Breed
  - Body Size categories (Tiny to Gargantuan)
  - Threat Tier (0 to 5)
  - Dread Index (1 to 10) and Dread Effect
  - Roaming Scope (`stationary_lair`, `adjacent_corridor`, `district_wide`, `campaign_wide`)
  - 6 Relative Capabilities (Might, Agility, Resilience, Cunning, Awareness, Presence) on a 1-5 pip scale.
<!-- END_CUSTOM_NOTES -->
