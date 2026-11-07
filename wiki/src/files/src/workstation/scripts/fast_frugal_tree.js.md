---
file_path: "src/workstation/scripts/fast_frugal_tree.js"
title: "fast_frugal_tree.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "489e141260a5a719"
reviewed_hash: "76bb93130007885f"
stale: true
size_bytes: 8286
line_count: 155
---

# fast_frugal_tree.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/fast_frugal_tree.js` serves as a **Workstation Modular JS Engine** within **Volume IV: Workstation Architecture & Mod Engine (src/workstation/ & mods/)**.

- **Workstation Modular Engine**: Inlined into `start.html` via `// @@INCLUDE: scripts/fast_frugal_tree.js @@` inside `src/workstation/template.html`.
- **Single Source of Truth Rule**: Always edit `src/workstation/scripts/fast_frugal_tree.js` rather than the compiled bundle in `start.html`, then run `Build-Suite.ps1`.
- Gigerenzer suite (ADR 0024): pure UMD fast-and-frugal tree validator/evaluator, four presets, and immutable cue-edit helpers (moveCue, addCue, removeCue). Invalid trees throw.
<!-- END_CUSTOM_NOTES -->
