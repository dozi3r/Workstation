---
file_path: "QUICKSTART.md"
title: "Creator Studio — Quickstart & Evaluation Guide"
volume: "vol-1"
kind: "Technical Documentation / Guide"
current_hash: "25d38296c2aa8811"
reviewed_hash: "25d38296c2aa8811"
stale: false
size_bytes: 3797
line_count: 57
---

# Creator Studio — Quickstart & Evaluation Guide

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`QUICKSTART.md` is the **5-Minute Onboarding & Interactive Evaluation Walkthrough** within **Volume I: System Architecture, Governance & Ontology**. Whereas [[File:README.md]] provides a high-level architectural overview of the repository, `QUICKSTART.md` walks a Game Master or evaluator step-by-step through an immediate hands-on session inside [[File:network/campaign_studio.html]], covering canvas interaction hotkeys, IndexedDB map persistence, `[S, E, C]` sociological dial overrides, Minor Arcana corridor hermeneutics, and wave progression.

---

## Core Invariants & Operational Walkthrough
`QUICKSTART.md` documents the six interactive workflows of the flagship [[File:start.html]] workstation:
- **Step 1 & 2 (Offline Launch & IndexedDB Map Persistence)**: Opening [[File:start.html]] via `file:///`, dragging and dropping a `.png`/`.jpg`/`.webp` map onto the canvas (persisted in `CreatorStudioMapDB` via [[File:src/workstation/scripts/map_store.js]]), adjusting opacity (default 85%), and panning/zooming via [[File:src/workstation/scripts/canvas_hud.js]].
- **Step 3 (Canvas Tool Palette & Hotkeys)**:
  - `N`: Add Node (place Point of Interest on canvas).
  - `O`: 1-Way Link (create directed asymmetric influence edge).
  - `T`: 2-Way Corridor (create bidirectional physical transit road).
  - `V`: Select / Move (drag nodes or inspect elements).
  - `X`: Erase Element (delete node or corridor).
- **Step 4 (Inspector & `[S, E, C]` Sociological Dials)**: Inspecting a node via [[File:src/workstation/scripts/workstation_core.js]], clicking `🎲 Reveal & Roll Now` in Living Campaign fog-of-war mode, adjusting the **Structure (1–4)**, **Execution/Energy (1–4)**, and **Coordination/Cohesion (1–4)** dials across all 64 archetypes ([[File:sociology/07_Granular_64_Disposition_Matrix.md]]), and slotting modules via [[File:src/workstation/scripts/stage_5_slotting.js]].
- **Step 5 (Corridor Hermeneutics & Academic Citations)**: Toggling edges between **Physical Transit** (`transit`) and **Hegemonic Tethers** (`hegemony`), assigning Minor Arcana suits (**Wands**, **Cups**, **Swords**, **Disks**), reviewing the **Harmonic Consensus** across `SOC-01`, `SOC-09`, `SOC-05`, and SRD Transit rules, and stamping lore via `★ Adopt into Corridor Lore`.
- **Step 6 (Territorial Factions & Emergent Waves)**: Managing custom factions in [[File:src/workstation/scripts/entity_manager.js]] and advancing or pregenerating waves in [[File:mods/tarot_balancing/mod.js]].

---

## Data Flow & Complementary Surface Directory
Section 2 of `QUICKSTART.md` provides a concise directory routing users to the seven primary surfaces:
- [[File:start.html]] — Master desktop workstation shell.
- [[File:index.html]] — Visual launcher dashboard.
- [[File:network/network_visualizer.html]] — 7-wave animation and Sovereign Hub balance visualizer.
- [[File:tarot/tarot_matrix_browser.html]] — Multi-deck Major & Minor Arcana matrix browser.
- [[File:tarot/minor_matrix_browser.html]] — Dedicated 56-corridor Minor Arcana edge matrix browser.
- [[File:regions/regional_image_browser.html]] — 344-asset visual scenery recommendation browser.
- [[File:tickets/unified_ticket_tracker.html]] — Unified backlog tracker for CWT, Tier 0, and SYS tickets.

---

## AI Agent Maintenance Checklist
- **When modifying canvas hotkeys (`N`, `O`, `T`, `V`, `X`) or inspector button labels**: Update `QUICKSTART.md` alongside [[File:src/workstation/scripts/canvas_hud.js]] and [[File:src/workstation/scripts/workstation_core.js]] so the evaluation walkthrough matches the live UI.
- **When adding a new top-level workstation surface**: Add it to the Complementary Standalone Tools table in `QUICKSTART.md` and [[File:index.html]].
<!-- END_CUSTOM_NOTES -->
