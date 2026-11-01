# ADR 0018: Master Sociological Reference Hub, Contextual Dossier Enrichment, and Procedural 5D Sensory Hermeneutics

## Status
Accepted (2026-10-31)

## Context
Creator Studio parameterizes settlement and corridor governance via the 64-cell Organizational Disposition Vector (`[S, E, C]`) matrix (`network/odv_archetype_matrix.html` and `src/workstation/scripts/sociology_data.js`). While [ADR-0014](0014-campaign-state-reflection-and-edge-odv-on-64-matrix.md) connected this matrix to active campaign pointcrawl topologies and dense summary cells, extensive operational, psychological, and environmental mechanics documented in `sociology/` remained marooned in static markdown files:
1. **Operational Power & Levers (`SOC-02`)**: Strategic trade-offs, basis of power, and player negotiation levers/fatal errors for *Design, Service, Produce, Deliver*.
2. **Crisis Metamorphism (`SOC-03`)**: Four-stage disaster clocks and metamorphic shifts under existential threat.
3. **Sensory Pentagon (`SOC-04`)**: Groysberg's 5-dimension cultural architecture (*Behaviors, Relationships, Attitudes, Values, Environment*).
4. **Pointcrawl Faction Dynamics (`SOC-05`)**: Frontline faction diplomacy and MTG 5-color ideological anchors.
5. **Deterministic Diagnostics (`SOC-06`)**: Step-by-step diagnostic test battery to classify entities into `[S, E, C]` without subjective drift.

To turn `odv_archetype_matrix.html` into the definitive master reference and action engine without inducing cognitive overload or grid layout bloat, several architectural trade-offs had to be resolved:
- **Trade-off 1 (Information Architecture)**: Stacking all markdown documentation directly on the page would push the 64-cell CAD grid hundreds of pixels down the viewport.
- **Trade-off 2 (5D Radar vs. Discrete Algebra)**: Groysberg's 5-dimension continuous radar pentagon contains dozens of subjective qualitative sub-facets. Forcing all 5 dimensions into the coordinate vector would cause a combinatoric explosion from 64 to 1,024 cells ($4^5$).
- **Trade-off 3 (Contextual Tabletop Utility)**: GMs running encounters need immediate, archetype-specific levers and failure states without manual page-flipping.

## Decision
1. **Unified Multi-Tab Master Reference Hub (`#master-reference-hub`)**:
   - The top collapsible guide in `network/odv_archetype_matrix.html` is refactored into a 6-tab reference hub:
     - `[📖 1–4 Scale Guide]`: Core S, E, C scalars, CVF, and operational mode derivations.
     - `[⚡ Power & Levers (SOC-02)]`: Institutional power bases, strengths, blind spots, effective levers, and fatal player errors.
     - `[🌪️ Crisis Clocks (SOC-03)]`: Biome ecology fit and the 4 crisis metamorphic shifts.
     - `[🎲 5D Sensory Skin (SOC-04)]`: Complete 5-dimension tables (1–6 options each) for procedural settlement skinning.
     - `[🗺️ Faction & Colors (SOC-05)]`: Frontline diplomacy categories and MTG 5-color anchors.
     - `[🌳 Diagnostic Tree (SOC-06)]`: Flowchart and guidelines for deterministic classification.

2. **Contextual Dossier Enrichment**:
   - When any archetype cell is selected, the **Active GM Dossier** dynamically derives and displays:
     - **Player Negotiation Levers (`SOC-02`)**: Specific *Effective Player Lever* and *Fatal Player Error* derived from `deriveOperationalMode(s, c)`.
     - **Crisis Metamorphic Shift (`SOC-03`)**: Specific *Metamorphic Fate* (e.g. Clan collapsing into Emergency Despotism/Hierarchy) derived from `deriveCvfQuadrant(s, e)`.

3. **Procedural 5D Sensory Roller Drawer (`SOC-04`)**:
   - Rather than bloating the coordinate vector, the 5-dimension pentagon is implemented as an interactive `🎲 Roll 5D Sensory Skin` tool inside the dossier card.
   - Generates biased tactical readouts (Atmosphere sound, Authority protocol, Foreigner reception, Sacred core, Decor) on demand.

4. **Deterministic 3-Question Diagnostic Wizard (`SOC-06`)**:
   - A header action button (`🧭 Diagnose Faction`) launches a lightweight 3-question modal (deviance tolerance $\rightarrow$ border openness $\rightarrow$ command centralization) that tunes dials $S, E, C$ and selects the matching cell.

5. **Shared Data Engine Foundation (`sociology_data.js`)**:
   - All dictionaries (`SOC_OPERATIONAL_LEVERS`, `SOC_CRISIS_METAMORPHISM`, `SOC_SENSORY_PENTAGON`, `SOC_FACTION_COLORS`, `SOC_DIAGNOSTIC_QUESTIONS`) and the `rollSensoryProfile()` generator are centralized in `src/workstation/scripts/sociology_data.js`, ensuring full zero-CORS parity for both `odv_archetype_matrix.html` and the native MDI window inside `start.html`.

## Consequences
- **Positive**:
  - The matrix becomes a self-contained master reference engine fulfilling all requirements of `SOC-01` through `SOC-07`.
  - Zero cognitive bloat on the 4×4 grid cells.
  - Zero-CORS offline execution preserved.
  - High inter-rater reliability via the interactive diagnostic wizard.
- **Negative / Trade-offs**:
  - Requires maintaining the multi-tab navigation state alongside dial tuner and search filter states in `odv_archetype_matrix.html`.
