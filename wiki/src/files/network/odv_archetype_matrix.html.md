---
file_path: "network/odv_archetype_matrix.html"
title: "Creator Studio: 64-Cell ODV Archetype Matrix & Hermeneutics Explorer"
volume: "vol-5"
kind: "Standalone Zero-CORS HTML Workstation"
current_hash: "359b3e9274d4755e"
reviewed_hash: "359b3e9274d4755e"
stale: false
size_bytes: 189213
line_count: 3384
---

# Creator Studio: 64-Cell ODV Archetype Matrix & Hermeneutics Explorer

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`network/odv_archetype_matrix.html` serves as a **Standalone Zero-CORS HTML Workstation** within **Volume V: Network Surfaces, Topologies & CLI Simulation (network/)**.

It provides a high-density, interactive tactical and strategic exploration suite for the 64-cell Organizational Disposition Vector (`[S, E, C]`) matrix defined in `docs/srd/authoring_engine_srd.md` (Section 3).

### Key Subsystems & Features
1. **Dynamic Engine Integration**:
   - Rather than hardcoding the 64 archetypes, the visualizer dynamically references `src/workstation/scripts/sociology_data.js` via zero-CORS script tags and runtime object lookups (`window.ODV_MATRIX_64`).
   - Supports live mod overrides (`window.ODV_MATRIX_OVERRIDE`) and zero-CORS local drag-and-drop / JSON upload of community or homebrew matrices.
2. **Master Sociological Reference Hub (6-Tab Drawer)**:
   - Consolidates modules `SOC-01` through `SOC-06` into a collapsible multi-tab knowledge and action hub:
     - **📖 1–4 Scale Guide (`SOC-01`)**: Interactive cards for Dials S, E, and C with direct dial-tuning callbacks.
     - **⚡ Power & Levers (`SOC-02`)**: Institutional power bases, strengths, blind spots, effective player negotiation levers, and fatal errors for Design, Service, Produce, and Deliver. Includes Porter/Groysberg strategic operations grid.
     - **🌪️ Crisis Clocks (`SOC-03`)**: Metamorphic survival shifts under existential strain, plus Duncan Environmental Uncertainty Matrix.
     - **🎲 5D Sensory Skin (`SOC-04`)**: Reference tables for Behaviors, Relationships, Attitudes, Values, and Environment with an interactive room roller.
     - **🗺️ Faction & Colors (`SOC-05`)**: CVF political factions, MTG color pairings, and corridor friction tension rules.
     - **🌳 Diagnostic Tree (`SOC-06`)**: Deterministic 3-step behavioral decision tree with live coordinate calibration.
3. **Contextual Dossier Enrichment & Procedural Encounter Tools**:
   - In addition to Core Boons, Burdens, and Passives, the **Active GM Dossier** features dynamic Negotiation Levers (`SOC-02`), Crisis Metamorphic Shifts (`SOC-03`), and an instant 5-Dimension Sensory Skin Room Roller (`SOC-04`).
4. **Deterministic Faction Diagnostic Wizard Modal (`SOC-06`)**:
   - Header button (`🧭 Diagnose Faction (SOC-06)`) launches an interactive zero-CORS modal that leads GMs through three inter-rater behavioral calibration questions, automatically computing and tuning the 3 dials to the exact archetype.
5. **Interactive ODV Dial Tuner & Multi-Perspective Views**:
   - 3-dial interactive tuner allowing real-time selection and testing.
   - Layered 3D Grids ($4 \times 4 \times 4$) with dynamic slice tiering by Centralization (C), Permeability (E), or Solidarity (S).
   - Filterable, searchable 64-card catalog and 4-column CVF quadrant layout.
6. **Active Campaign State Reflection & Enriched Occupant Badges (ADR 0014 & SOC-05)**:
   - Ingests active campaign topology from `localStorage` (`creator_studio_maps_registry`), file upload, or universal 22-node fallback.
   - Displays stationed settlement nodes and traversing corridors with faction tags, MTG color badges, and road friction hazard levels (`[Allied Artery]`, `[Regulated Border]`, `[Contested Frontline Δ≥5]`).
   - Deep-links directly to the desktop workstation canvas (`../start.html?selectNode=<id>`, `../start.html?selectEdge=<key>`).
<!-- END_CUSTOM_NOTES -->
