---
file_path: "src/workstation/scripts/social_graph_renderer.js"
title: "social_graph_renderer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "41397ba69215ac8b"
reviewed_hash: "41397ba69215ac8b"
stale: false
size_bytes: 28348
line_count: 641
---

# social_graph_renderer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/social_graph_renderer.js` provides deterministic 2D SVG visualization and interactive manipulation of the NPC Social Relational Graph (ADR 0021) within the Creator Studio desktop workstation (`start.html`).

### Key Capabilities
- **Deterministic 2D Layout Engine**: Projects active roster characters into concentric 2D space without iterative physics loops or thread-locking simulation timers.
- **Focus Mode**: Positions focus character at origin `(0, 0)` with 1st-degree neighbors arranged along Orbit 1 ($R_1 = 165\text{px}$), 2nd-degree relations on Orbit 2 ($R_2 = 275\text{px}$), and unconnected characters on Orbit 3 ($R_3 = 360\text{px}$).
- **Global CVF Quadrant Mode**: Arranges uncentered global networks into 4 cultural quadrant clusters (`Clan`, `Adhocracy`, `Market`, `Hierarchy`) with deterministic angular spacing and hash jitter.
- **Collocation & Zero-Divide-by-Zero Guard**: Applies deterministic ID hash offsets to ensure no coordinates ever resolve to `NaN` or `Infinity`, even with 0, 1, or collocated unassigned NPCs.
- **Semantic Edge Palette**: Renders typed relationship lines (`Ally`, `Rival`, `Family`, `Superior`, `Subordinate`, `Debtor`, `Creditor`, `Informant`, `Handler`) with stroke width proportional to absolute sentiment and dash patterns for negative sentiment.
- **Interactive MDI Window & Modals**: Implements `#modal-social-graph` MDI window controls, focus selection, sentiment filtering, and `#modal-npc-relationship-crud` creation/editing dialogs.
<!-- END_CUSTOM_NOTES -->
