---
file_path: "index.html"
title: "Creator Studio - Redirecting to Workstation..."
volume: "vol-1"
kind: "Standalone Zero-CORS HTML Workstation"
current_hash: "00dc6f818c22cb72"
reviewed_hash: "00dc6f818c22cb72"
stale: false
size_bytes: 1138
line_count: 28
---

# Creator Studio - Redirecting to Workstation...

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`index.html` is the **Master Visual Launcher & Active Session Telemetry Bus Bar** at the root of the Creator Studio repository (**Volume I: System Architecture, Governance & Ontology**). It provides a single-click dashboard connecting all standalone HTML workstations (`network/`, `tarot/`, `regions/`, `wiki/`) and Markdown manuals (`README.md`, `docs/MODULES_CATALOG.md`, `sociology/07_Granular_64_Disposition_Matrix.md`, `sociology/08_Tarot_Sociology_Matrix.md`), while inspecting browser `localStorage` in real time to display the user's active pointcrawl topology session.

---

## Core Invariants & Contracts
- **Zero-CORS `file:///` Execution**: Opens directly from disk in any browser without a local web server.
- **Shared `localStorage` Session Bus Contract**: `index.html` reads and manages two global browser storage keys shared with [[File:network/network_builder.html]] and [[File:network/campaign_studio.html]]:
  - `creator_studio_active_topology`: JSON payload containing the user's live `nodes` and `links` arrays.
  - `creator_studio_topology_timestamp`: ISO/epoch timestamp recording when the topology was last saved.
- **Non-Destructive Session Reset (`resetActiveSession()`)**: Allows the user to clear `creator_studio_active_topology` and `creator_studio_topology_timestamp` from `localStorage` if they wish to revert from a custom topology back to the default canonical preset.

---

## Data Flow & UI Architecture
1. **Top Navigation Header**: Links directly to [[File:wiki/index.html]] (`📚 Technical Manual & Wiki`), [[File:README.md]] (`📖 Suite Manual`), and [[File:docs/MODULES_CATALOG.md]] (`📦 48 Modules Catalog`).
2. **Active Workstation Topology Bus Bar (`#session-banner`)**:
   - On `DOMContentLoaded`, `updateSessionStatus()` inspects `localStorage.getItem("creator_studio_active_topology")`.
   - When a custom session is present, `#session-status-dot` turns emerald green, `#session-badge` displays `"Custom Active"`, and `#session-desc` reports the exact node count, link count, and last-modified timestamp.
   - Provides a `Resume Step 1 ->` button routing directly to [[File:network/campaign_studio.html]].
3. **7-Card Workstation Grid**:
   - **Card 0**: [[File:network/network_builder.html]] (*Visual Network Builder — Step 0*).
   - **Card 1**: [[File:network/campaign_studio.html]] (*Campaign Studio — Step 1 Flagship*).
   - **Card 2**: [[File:network/network_visualizer.html]] (*Network Visualizer — Step 2*).
   - **Card 3**: [[File:tarot/tarot_matrix_browser.html]] (*Tarot Sociology Browser — SOC-08*).
   - **Card 4**: [[File:tarot/tarot_deck_analytics.html]] (*Deck Analytics Dashboard*).
   - **Card 5**: [[File:regions/regional_image_browser.html]] (*Scenery & Image Studio — 344 Assets*).
   - **Card 6 (Full-Width Banner)**: [[File:wiki/index.html]] (*Technical Manual & Bidirectional Codebase Wiki — 8 Volumes, 350+ File Pages*).

---

## AI Agent Maintenance Checklist
- **When adding a new top-level HTML workstation**: Add a launcher card to `index.html`, register the surface in [[File:docs/navigation_manifest.json]], and document it in [[File:QUICKSTART.md]].
- **When modifying `localStorage` keys in `state.js` or `network_builder.html`**: Ensure `creator_studio_active_topology` and `creator_studio_topology_timestamp` remain synchronized with `updateSessionStatus()` and `resetActiveSession()` in `index.html`.
<!-- END_CUSTOM_NOTES -->
