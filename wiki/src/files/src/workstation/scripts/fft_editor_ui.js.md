---
file_path: "src/workstation/scripts/fft_editor_ui.js"
title: "fft_editor_ui.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "50657bbae8de32ca"
reviewed_hash: "50657bbae8de32ca"
stale: false
size_bytes: 18339
line_count: 276
---

# fft_editor_ui.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/fft_editor_ui.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/fft_editor_ui.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/fft_editor_ui.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
- Gigerenzer suite (ADR 0024): Win95 decision-tree builder dialog (openFftBuilderModal), dossier diagram (renderFftDossierHtml) and heuristic badge (renderHeuristicBadgeHtml). Mounted from entity_manager_ui.js NPC, faction, and Bestiary creature panes.
- Bestiary Creature Behavior Adapter: Provides `normalizeCreatureFft(fft)` ensuring cue IDs, boolean query test types, and target values are normalized for 100% compatibility with `fast_frugal_tree.js`, plus creature entity resolution in `getEntityFft` and `openFftBuilderModal('creature', id)`.
<!-- END_CUSTOM_NOTES -->
