---
file_path: "test/verify_patrol_faction_gate.js"
title: "verify_patrol_faction_gate.js"
volume: "vol-8"
kind: "Node.js / Browser Engine Script"
current_hash: "f02fc4ded572eeae"
reviewed_hash: "f02fc4ded572eeae"
stale: false
size_bytes: 13355
line_count: 337
---

# verify_patrol_faction_gate.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`test/verify_patrol_faction_gate.js` is the dedicated red-team quality gate and regression verification script for edge corridor patrol faction architecture.

### Gates Enforced
1. **Gate 1: Setting-Agnostic Purity**: Asserts that no setting-specific lore factions (`Imperial Frontier Guard`, `Civic Guilds`, `Ancient Dynasts`, `Corsair Anchorage`) are hardcoded into CAD property grid inspectors.
2. **Gate 2: Dynamic Campaign Faction Resolution**: Asserts that edge patrol faction options query `getCampaignFactionSuggestions()`.
3. **Gate 3: Lossless Custom Patrol Faction Preservation**: Asserts that arbitrary custom patrol factions (e.g., imported sci-fi/cyberpunk factions) are never coerced to `neutral` or clobbered.
4. **Gate 4: Extensible Combobox Input Support**: Asserts that edge inspectors provide a Win95/VB6 `<input type="text" list="...">` combobox with datalist for both preset selection and custom text input.
<!-- END_CUSTOM_NOTES -->
