# Creator Studio — Quickstart & Evaluation Guide

**Welcome to Creator Studio.** This self-contained creative workstation lets Game Masters and worldbuilders design, balance, and populate emergent pointcrawl campaigns with deep sociological nuance.

No web servers, Node runtimes, or database engines are required to run the tools. Double-click **`start.html`** to run offline directly in your browser (`file:///`).

---

## 🚀 The 5-Minute Quickstart

### Step 1: Open the Universal Workstation
- **Recommended (Secure Loopback)**: Double-click **`Launch-Workstation.bat`** (or `Launch-AppMode.bat` for standalone window mode). Runs via local loopback (`http://127.0.0.1:8080/start.html`) with full modern Secure Context API capabilities.
- **Standalone Offline**: Double-click **`start.html`** to run offline directly via `file:///` in Chrome, Firefox, Safari, or Edge.

### Step 2: Import Your Map or Use Tactical CAD Grid
- **Drag & drop** any campaign map image (`.png`, `.jpg`, `.webp`) onto the canvas or configure map settings in the toolbar.
- Map images persist automatically inside browser storage (`IndexedDB` / `CreatorStudioMapDB`) or your bound project folder.
- Navigate with **Middle-Click Pan** and **Mousewheel Zoom**, and organize elements across custom **CAD Layers**.

### Step 3: Draw Your Nodes, Corridors & Portals
Use the CAD tool palette:
- **Add Node**: Place Points of Interest (POIs) and configure custom shapes, colors, and scale tiers.
- **Transit Road (`E_adj`) & Hegemony Link (`E_inf`)**: Connect nodes with bidirectional physical corridors or directional influence links.
- **Scale-Fluid Portals**: Link any node to a nested child map (`childMapId`) to drill down from continents and regions to cities, districts, and dungeons.

### Step 4: Configure Sociological Dials `[S, E, C]` & Slot Modules
Select any node to inspect and configure its properties:
1. **Granular Disposition `[S, E, C]`**: Set Structure (1–4), Energy (1–4), and Cohesion (1–4) to map the settlement onto the 64-cell sociological matrix and Competing Values Framework (Clan, Adhocracy, Market, Hierarchy).
2. **5-Tier Module Slotting**: Attach worldbuilding modules (`Tier 1..5`) with machine-readable `provides` and `requires` resource contracts, automatic supply-flow BFS verification, and standalone fallbacks.
3. **Active Campaign Roster**: Populate nodes with authoritative NPCs, Quests, Items, and Threat Clocks.

---

## 🧭 Standalone Workstation Surfaces

| Surface File | Description & Purpose |
| :--- | :--- |
| **`start.html`** | Universal Desktop Workstation Shell & Pointcrawl CAD Canvas. |
| **`admin.html`** | Administrative Hub linking every HTML tool to its Wiki page and specification. |
| **`network/network_builder.html`** | Standalone Topological Graph Canvas (Step 0). |
| **`network/contradiction_matrix_dashboard.html`** | Network Contradiction Matrix & Corridor Friction Visualizer. |
| **`network/odv_archetype_matrix.html`** | 64-Cell ODV `[S, E, C]` Archetype Matrix & Hermeneutics Explorer. |
| **`network/platform_audit_dashboard.html`** | Universal Module Catalog Reader & Supply-Chain Audit Visualizer. |
| **`regions/regional_image_browser.html`** | Visual scenery recommendation engine across 344+ environment illustrations. |
| **`tickets/unified_ticket_tracker.html`** | Master Unified Backlog & Ticket Execution Command Center. |
| **`wiki/index.html`** | 8-Volume Technical Manual & Bidirectional Codebase Wiki. |

---

## 🛠️ Developer & Build Notes

If you modify source JSON datasets, modular templates under `src/workstation/`, or campaign modules, recompile the suite by running:
```powershell
powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
```
All compiled distributions remain 100% offline and zero-CORS compatible.
