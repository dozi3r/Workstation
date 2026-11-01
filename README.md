# CREATOR STUDIO &bull; UNIVERSAL CAMPAIGN AUTHORING SUITE
## Decoupled System-Agnostic Pointcrawl, Sociological Alignment & Modular Worldbuilding Suite

---

## 1. Overview & Architecture

The **Creator Studio** is a self-contained, zero-CORS development environment for designing, balancing, and populating scale-fluid pointcrawl campaign networks for tabletop roleplaying games (*Cairn, Knave, Into the Odd, Mothership, OSR, FitD, 5e, PbtA, GURPS*).

```text
Creator Studio/
├── Launch-Workstation.bat       # Zero-install loopback launcher (Node.js or native .NET)
├── Launch-AppMode.bat           # Desktop window app launcher (Chromium/Edge)
├── Stop-Workstation.bat         # Loopback server graceful shutdown script
├── start.html                   # Universal Desktop Workstation Shell & Pointcrawl CAD Canvas
├── admin.html                   # Workstation Administrative Hub & Master HTML/Wiki Directory
├── src/workstation/             # Modular source templates, modals, and workstation scripts
├── network/                     # Pointcrawl topology, contradiction, and ODV archetype tools
│   ├── network_builder.html                 # Step 0: Topological Graph Canvas
│   ├── contradiction_matrix_dashboard.html  # Network Contradiction Matrix Dashboard
│   ├── platform_audit_dashboard.html        # Universal Platform Explorer & Audit Visualizer
│   └── odv_archetype_matrix.html            # 64-Cell ODV Archetype Matrix Explorer
├── sociology/                   # Core organizational sociology foundations & reference tables
│   ├── 01_Core_Cultural_Quadrants.md        # [SOC-01] Macro 4-quadrant engine (Clan, Adhocracy, Market, Hierarchy)
│   ├── 02_Operational_Profiles_and_Power.md # [SOC-02] Strategic trade-offs (Design, Service, Produce, Deliver)
│   ├── 03_Environmental_Uncertainty_and_Crisis.md # [SOC-03] Uncertainty grid & disaster clocks
│   ├── 04_Sensory_Pentagon_Generator.md     # [SOC-04] Groysberg 5-dimension procedural generator
│   ├── 05_Pointcrawl_Graph_and_Faction_Alignment.md # [SOC-05] Universal pointcrawl mapping
│   ├── 06_Disposition_Matrix_and_Tarot_Decision_Framework.md # Diagnostic 6-question battery
│   └── 07_Granular_64_Disposition_Matrix.md # Authoritative 64-archetype [S, E, C] matrix
├── campaigns/                   # Multi-campaign sourcebooks & 5-tier modular assets
├── regions/                     # Visual scenery engine & 344-image asset recommendation browser
├── tickets/                     # Master Unified Backlog & Tier 0 Substratum trackers
└── wiki/                        # 8-Volume Technical Manual & Bidirectional Codebase Wiki
```

---

## 2. Core Campaign Authoring Workflow

1. **Launch Workstation**:
   - **Recommended (Secure Loopback)**: Double-click [`Launch-Workstation.bat`](Launch-Workstation.bat) (or run `powershell -File .\Launch-Workstation.ps1`). Selects Node.js or native Windows `.NET HttpListener`, opening `http://127.0.0.1:8080/start.html` with full Secure Context API capabilities.
   - **Desktop Window Mode**: Double-click [`Launch-AppMode.bat`](Launch-AppMode.bat) to launch in dedicated Chromium/Edge application window mode.
   - **Standalone Offline**: Open [`start.html`](start.html) directly via `file:///` in any browser.
   - **Stop Server**: Click `File -> Exit Workstation (Stop Server)` or run [`Stop-Workstation.bat`](Stop-Workstation.bat).
2. **Author Pointcrawls**: Author multi-scale pointcrawl graphs, configure layers and vector geometry, set `[S, E, C]` sociological disposition dials, manage active entities (NPCs, Quests, Items, Clocks), and slot 5-tier worldbuilding modules.
3. **Inspect Contradictions & Archetypes (`network/`)**: Open [`network/contradiction_matrix_dashboard.html`](network/contradiction_matrix_dashboard.html) and [`network/odv_archetype_matrix.html`](network/odv_archetype_matrix.html) to audit structural friction across corridors and explore the 64-cell `[S, E, C]` sociological matrix.
4. **Audit Supply Chains & Modules (`network/platform_audit_dashboard.html`)**: Inspect module resource contracts (`provides`/`requires`), standalone fallbacks, and setting coverage across campaigns.

---

## 3. Build & Verification Gate

After modifying any workstation script, module, or wiki note, recompile and verify the suite:
```powershell
powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
powershell -ExecutionPolicy Bypass -File .\Test-Suite.ps1
```
