---
file_path: "README.md"
title: "CREATOR STUDIO &bull; UNIVERSAL CAMPAIGN AUTHORING SUITE"
volume: "vol-1"
kind: "Technical Documentation / Guide"
current_hash: "dfeb1d28f2ee35f0"
reviewed_hash: "dfeb1d28f2ee35f0"
stale: false
size_bytes: 4565
line_count: 59
---

# CREATOR STUDIO &bull; UNIVERSAL CAMPAIGN AUTHORING SUITE

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`README.md` is the **Primary Human-Facing Repository Entrypoint & Suite Architecture Overview** within **Volume I: System Architecture, Governance & Ontology**. Linked directly from the header of [[File:index.html]] (`📖 Suite Manual`), it introduces Game Masters, worldbuilders, and software engineers to Creator Studio's decoupled, system-agnostic design (*Cairn, Knave, Into the Odd, Mothership, OSR, FitD, 5e, PbtA, GURPS*), maps the top-level directory tree, and explains the **3-Step Campaign Creation Loop**.

---

## Core Invariants & Contracts
- **Zero-Server Portability**: `README.md` documents the core guarantee that the entire workspace can be copied to any directory or drive and executed offline over `file:///` with zero dependencies on external parent folders.
- **Portable Relative Links Invariant**: Per [[File:docs/audit/2026-10-creator-studio-audit-dossier.md]] (Stage 4, Section 5.1) and [[File:.scratch/creator-remediation/issues/01-fix-stale-desktop-links.md]], all Markdown links inside `README.md` must use strictly relative paths (e.g., `network/campaign_studio.html`, `tarot/tarot_matrix_browser.html`, `regions/regional_image_browser.html`) rather than hardcoded local desktop paths (`file:///c:/Users/...`).
- **Historical Directory Tree Note**: The ASCII tree in Section 1 reflects the original 5-folder layout (`network/`, `tarot/`, `sociology/`, `modules/`, `regions/`), including the historical module paths under `modules/Set_A..G/` (which were subsequently migrated into multi-campaign packages under `campaigns/opal_island/modules/Set_A..G/` and `campaigns/generic_starter/modules/`, as tracked in [[Ticket:SYS-AUDIT-01]] and [[Series:series_g_duplicate_and_orphan_audit]]).

---

## Data Flow & Subsystem Routing
`README.md` organizes the workstation into four operational pillars:
- **1. The 3-Step Campaign Creation Loop (`network/`)**:
  - **Step 0 (Graph Creation)**: [[File:network/network_builder.html]] — Visual node placement, background terrain calibration, and asymmetric influence tethering.
  - **Step 1 (Campaign Authoring & Slotting)**: [[File:network/campaign_studio.html]] — Wave sequencing, Major/Minor Arcana draws, `[S, E, C]` dial balancing, and module slotting.
  - **Step 2 (Verification & Simulation)**: [[File:network/network_visualizer.html]] and [[File:network/Run-NetworkEngine.ps1]] — 7-wave cascade animation and headless Monte Carlo balancing.
- **2. Tarot Sociology Master Engine (`tarot/` & `sociology/`)**:
  - Routes users to [[File:tarot/tarot_matrix_browser.html]], [[File:tarot/tarot_deck_analytics.html]], [[File:tarot/Generate-TarotSociologyMatrix.ps1]], and the 8 sociological specifications ([[File:sociology/01_Core_Cultural_Quadrants.md]] through [[File:sociology/08_Tarot_Sociology_Matrix.md]]).
- **3. Universal Modular Library (`modules/` & `campaigns/`)**:
  - Highlights how setting-specific mechanics—such as [[Mod:INFRA-01]] (Pelton Dynamos), [[Mod:INFRA-09]] (Zim-Sharr Braziers), [[Mod:FACT-07]] (Canonical 22-Node Distribution), and [[Mod:SPARK-08]] (22-Card Arrival Gambits)—operate as optional plug-and-play assets with mandatory **Standalone Fallback Modes**.
- **4. Visual Scenery Browser (`regions/`)**:
  - Routes users to [[File:regions/regional_image_browser.html]] and [[File:regions/regional_image_catalog.json]] (344 curated environment illustrations).

---

## AI Agent Maintenance Checklist
- **When adding or renaming top-level HTML surfaces**: Verify that links in `README.md`, [[File:QUICKSTART.md]], and [[File:index.html]] remain valid relative paths.
- **When auditing repository links ([[Ticket:SYS-AUDIT-01]])**: Ensure module links in Section 3.B either resolve via `docs/MODULES_CATALOG.md` or point to `campaigns/opal_island/modules/Set_A..G/`.
<!-- END_CUSTOM_NOTES -->
