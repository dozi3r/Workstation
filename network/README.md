# CAMPAIGN CREATOR: NETWORK ENGINE & TOPOLOGY SUBSYSTEM
## Topological Balancing, Spatial Authoring & Influence Systems
*Root Directory: [`Creator/network/`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/)*

---

### Overview

The `network/` directory houses the mathematical, algorithmic, and visual tools that govern pointcrawl network authoring, topological balancing, and wave-based Tarot distribution.

---

### 1. The Tools & Workflow Pipeline

```text
  ┌─────────────────────────────────┐
  │  Step 0: Network Creation       │  network_builder.html
  │  • Spatial node placement on map│  (Map Import, 4 Tools, Renaming,
  │  • 1-Way & 2-Way influence links│   Influence Tethering, JSON Export)
  └────────────────┬────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────┐
  │  Step 1: Tarot Balancing        │  Run-NetworkEngine.ps1
  │  • 7-Wave Arcana distribution   │  network_visualizer.html
  │  • Asymmetric influence math    │  (Hub Elections, Proximity Smothering,
  │  • 5 Sovereign Hub elections    │   Card 22 Global Inversion Reversal)
  └────────────────┬────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────┐
  │  Step 2: Module Slotting & Play │  campaign_studio.html
  │  • 48 system-agnostic modules   │  modules_manifest.json
  │  • Faction & Bastion adaptation │  (Preset Selector & Campaign Dossier)
  └─────────────────────────────────┘
```

---

### 2. File Index

| Filename | Type | Purpose |
| :--- | :---: | :--- |
| **[`network_builder.html`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/network_builder.html)** | Interactive Web App | **Step 0 Network Creation Studio.** Drag nodes over custom imported maps, tether with 1-way and 2-way influence, set Hub Eligibility (`candidate`, `never`, `always`), load presets, and export Step 0 Graph JSON, modular preset JSON, or manifests. |
| **[`campaign_studio.html`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/campaign_studio.html)** | Interactive Web App | **Step 1 Campaign Creation & Tarot Studio.** Imports Step 0 graph JSON or modular presets, configures waves, manages card drawing, calculates Sovereign Hub balancing & smothering with configurable hub target dial (2-8), slots modules into nodes and edges, filters by Pipeline Tier (1-5) and Resource Tags, and exports unified dossiers. |
| **[`network_visualizer.html`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/network_visualizer.html)** | Interactive Web App | **Step 1 Tarot Network Visualizer.** Live 7-wave Major Arcana distribution, Sovereign Hub election, MTG color tags, and 48-module inspector. |
| **[`Run-NetworkEngine.ps1`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/Run-NetworkEngine.ps1)** | PowerShell Engine | Automated Monte Carlo simulation of Tarot shuffles, influence propagation, and CSV/Markdown export. Supports `-Preset Generic`, `-SovereignHubCount <N>`, and custom topologies. |
| **[`presets/generic_archetype.json`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/presets/generic_archetype.json)** | JSON Preset | **Universal Archetypes 22-Node Pointcrawl.** System-agnostic baseline graph with matching schema, hub eligibility, and 7-wave sequencing. |
| **[`generic_network_topology.json`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/generic_network_topology.json)** | JSON Dataset | **Universal 22-Node Archetype Topology.** Legacy baseline graph coordinates and influence links. |
| **[`modules_manifest.json`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/modules_manifest.json)** | JS Manifest | Machine-readable catalog of all 48 universal modules. |
| **[`network_balance_matrix.csv`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/network_balance_matrix.csv)** | CSV Dataset | Exported 10-column balance calculations across 22 nodes. |
| **[`network_balance_report.md`](file:///c:/Users/Milo/Documents/Antigravity/Creator/network/network_balance_report.md)** | Markdown Report | Exported balancing dossier and hub profiles. |

---

### 3. Step 0 Studio Controls

* **Select / Move (`V` or `1`):** Click and drag nodes across the canvas. Click to inspect, see connections sorted by directionality, and rename.
* **1-Way Influence (`O` or `2`):** Click Source $\to$ Click Target to create a directional feed vector ($A \to B$).
* **2-Way Influence (`T` or `3`):** Click two nodes to establish a mutual influence tether ($A \leftrightarrow B$).
* **Erase / Unlink (`X` or `4`):** Click two nodes to sever their connection, or click directly on any edge line on canvas.
