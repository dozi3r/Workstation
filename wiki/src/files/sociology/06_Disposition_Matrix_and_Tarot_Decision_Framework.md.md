---
file_path: "sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md"
title: "MODULE SOC-06: SYSTEMATIC DISPOSITION MATRIX & TAROT DECISION FRAMEWORK"
volume: "vol-6"
kind: "Sociology Specification"
current_hash: "17464aaf0ca73ab2"
reviewed_hash: "17464aaf0ca73ab2"
stale: false
size_bytes: 53227
line_count: 577
---

# MODULE SOC-06: SYSTEMATIC DISPOSITION MATRIX & TAROT DECISION FRAMEWORK

<!-- BEGIN_CUSTOM_NOTES -->
### 1. Architectural Purpose & Authority
`sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md` (**Module SOC-06**) is the mathematical and methodological linchpin of **Volume VI: Sociology Hermeneutics & Tarot Matrix Engine**. Listed in [[File:AGENTS.md]] and [[File:docs/navigation_manifest.json]] as an authoritative governing specification for [[File:network/campaign_studio.html]], [[File:network/Run-NetworkEngine.ps1]], [[File:tarot/tarot_matrix_browser.html]], and [[File:tarot/tarot_deck_analytics.html]], `SOC-06` replaces subjective faction adjectives with the **Organizational Disposition Vector (`ODV = [S, E, C]`)** and a **6-Step Deterministic Diagnostic Battery** engineered for high inter-rater reliability.

### 2. The 3-Dial Coordinate Vector (`ODV = [S, E, C]`)
Every entity—settlement, syndicate, NPC, or Tarot card orientation—is scored across three orthogonal integer dials from `1` to `4` ($4^3 = 64$ discrete coordinates in [[File:sociology/07_Granular_64_Disposition_Matrix.md]]):
- **Dial `S` — Structural Stability vs. Entropy (`1..4`)**: `1` = *Rigid Clockwork* (immutable order, capital treason for error); `2` = *Codified System* (standard SOPs); `3` = *Pragmatic Adaptation* (heuristic problem-solving); `4` = *Fluid Entropy* (radical ad-hocracy and continuous flux).
- **Dial `E` — Boundary Focus / Intent (`1..4`)**: `1` = *Hermetic Autarky* (outsiders as contagion, sacred preservation); `2` = *Mutualist Cohesion* (protective community perimeter); `3` = *Mercantile Exchange* (contractual trade leverage); `4` = *Predatory Conquest* (extractive imperialism).
- **Dial `C` — Systemic Coupling / Topology (`1..4`)**: `1` = *Atomized Silo* (autonomous solo workshops); `2` = *Decoupled Guild* (seasonal caches); `3` = *Federated Mesh* (shared regional logistics); `4` = *Total Matrix Hive* (hardwired continental grid / cyber-somatic symbiosis).

### 3. The 6-Step Diagnostic Battery & Deterministic Pipeline
To prevent evaluator drift, analysts score six empirical tests (`1` to `4`) and average each pair:
- **Focus (`E`)**: `Test E.1` (*The Metric of Triumph*) & `Test E.2` (*The Stranger Encounter*) $\to E = \text{round}((\text{E.1} + \text{E.2})/2)$.
- **Stability (`S`)**: `Test S.1` (*The Deviance / Error Threshold*) & `Test S.2` (*Structural Reconfiguration Cadence*) $\to S = \text{round}((\text{S.1} + \text{S.2})/2)$.
- **Coupling (`C`)**: `Test C.1` (*The Decapitation Vulnerability*) & `Test C.2` (*Logistical Autarky Horizon*) $\to C = \text{round}((\text{C.1} + \text{C.2})/2)$.

From `[S, E, C]`, Section 3 and Section 6 derive:
- **CVF Cultural Quadrant** (`SOC-01`): `Clan` (`S>=3, E<=2`), `Adhocracy` (`S>=3, E>=3`), `Hierarchy` (`S<=2, E<=2`), `Market` (`S<=2, E>=3`).
- **Operational Profile** (`SOC-02`): `Design` (`S>=3, C<=2`), `Service` (`S>=3, C>=3`), `Produce` (`S<=2, C<=2`), `Deliver` (`S<=2, C>=3`).
- **Duncan Uncertainty Stance (`U`)**: $U = \text{clamp}(1, 4, \lfloor (S + \min(4, \text{Degree}(N))) / 2 \rfloor)$.
- **Player Friction Dial ($F_p$)**: $F_p = \text{clamp}(1, 4, 1 + \lfloor (|S_{\text{party}} - S_{\text{target}}| + |E_{\text{party}} - E_{\text{target}}|) / 2 \rfloor)$.
- **Topological Network Influence Affinity**: $\text{Affinity}(A, B) = 1.0 - (|S_A - S_B| + |E_A - E_B| + |C_A - C_B|) / 9$.

### 4. Multi-Deck Tarot Calibration & The 8 Macro Octants
- **Comparative Tarot Walkthrough (Section 5)**: Proves how the same card (**Key I: The Reversed Magician**) yields three distinct coordinates across different ontological lenses: Rider-Waite-Smith (`[4, 4, 1]` *Street Grifter*), Crowley Thoth (`[2, 1, 1]` *Solipsistic Hermetic*), and H.R. Giger (`[1, 4, 4]` *Biomechanical Hive*).
- **The 8 Octant Dossiers (Section 7)**: Details the Core Boon, Core Burden, Systemic/Encounter/Tarot Passives, and Dial Gradient Scaling (`Intensity = sum(|D_i - 2.5|)`) for all 8 binary `[Low/High]` combinations.
- **Campaign Studio JSON Contract (Section 8)**: Defines the canonical `disposition` JSON payload embedded in pointcrawl nodes.
- **Cross-Cutting Series**: Central specification analyzed in [[Series:series_c_sociology_and_tarot_hermeneutics]] and implemented in [[File:tarot/generate_tarot_matrix.js]].
<!-- END_CUSTOM_NOTES -->
