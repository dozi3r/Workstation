---
file_path: "docs/srd/authoring_engine_srd.md"
title: "Campaign Authoring Engine SRD"
volume: "vol-2"
kind: "System Reference Document (SRD)"
current_hash: "04763b5c60a91c9a"
reviewed_hash: "04763b5c60a91c9a"
stale: false
size_bytes: 16411
line_count: 238
---

# Campaign Authoring Engine SRD

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/srd/authoring_engine_srd.md` is the **Primary Mathematical & Algorithmic System Reference Document (SRD)** within **Volume II: System Reference Documents (The Dual SRD & Substratum)**. Established under [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]] and [[File:.scratch/creator-remediation/issues/06-authoring-engine-srd.md]], it codifies the formal graph theory, 64-cell sociological algebra, 7-wave Major Arcana balancing protocol, Amalgamation Score formula, Adjacency Smothering algorithm, Living Campaign fog-of-war subgraph rules, 5-Tier socket capacities, weighted module Recommendation Scoring, and BFS supply-flow reachability algebra that govern [[File:network/campaign_studio.html]], [[File:network/network_builder.html]], [[File:network/network_visualizer.html]], [[File:network/contradiction_matrix_dashboard.html]], [[File:network/platform_audit_dashboard.html]], and [[File:network/Run-NetworkEngine.ps1]].

It is the core specification for [[Series:series_a_balancing_and_smothering_math]] and [[Series:series_d_module_supply_chains_and_contracts]], and pairs with [[File:docs/srd/adventure_framework_srd.md]] (which governs tabletop runtime play).

---

## Core Mathematical Invariants & Contracts
Any modification to [[File:src/campaign_studio/scripts/stage_4_balancing.js]], [[File:src/campaign_studio/scripts/stage_5_slotting.js]], or [[File:network/Run-NetworkEngine.ps1]] must strictly preserve the mathematical contracts defined in this SRD:

| Section | Formal Rule / Equation | Invariant & Implementation Contract |
| :--- | :--- | :--- |
| **Section 2: Pointcrawl Graph $G = (V, E_{adj}, E_{inf})$** | 22 nodes ($1 \le i \le 22$), 52 directed adjacency pairings (26 bidirectional corridors in $E_{adj}$), directed influence vectors $E_{inf}$. | Dual-layer edge routing (`layer: "transit" | "hegemony" | "both"`): `transit` governs $E_{adj}$ (movement, BFS supply flow, Adjacency Smothering); `hegemony` governs $E_{inf}$ (Amalgamation Score). Nodes 12, 15, 16, 17, 18, 19, 21, and 22 are hardcoded `Eligible = false`. |
| **Section 3: `[S, E, C]` Sociological Algebra** | Organizational Disposition Vector $[S, E, C] \in \{1, 2, 3, 4\}^3$ yielding 64 archetypes across the 4 CVF Quadrants (`Clan`, `Adhocracy`, `Market`, `Hierarchy`). | Maps 1:1 to [[File:sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md]] and [[File:sociology/07_Granular_64_Disposition_Matrix.md]]. |
| **Section 4.1–4.3: Amalgamation Formula** | $\text{BaseWeight}(K, O) = \pm(K + 1)$ for $K \in [0, 21]$; $\text{IncomingScore}(i) = \sum_{s \in InfBy(i)} 0.5 \times \text{BaseWeight}(s)$; $\text{TotalScore}(i) = \text{Round}(\text{BaseWeight}(i) + \text{IncomingScore}(i), 2)$. | Must round strictly to **2 decimal places** (`Math.round(val * 100) / 100` in JS; `[Math]::Round(..., 2)` in PowerShell). |
| **Section 4.4: Adjacency Smothering** | Sort eligible candidates by descending `TotalScore`, tie-breaking by **ascending `ID`**. Elect up to 5 Sovereign Hubs $\mathcal{H}$; any candidate $c$ adjacent in $E_{adj}$ to an already-elected $h \in \mathcal{H}$ is smothered ($c \in \mathcal{S}$). | Identical candidate ordering and smothering across [[File:src/campaign_studio/scripts/stage_4_balancing.js]] and [[File:network/Run-NetworkEngine.ps1]]. |
| **Section 4.5–4.6: Color Wheel & Card 22** | Ranks 1–5 map to `White`, `Blue`, `Black`, `Red`, `Green`. Card 22 Reversed triggers Global Inversion. | Evaluated at completion of Wave 7 (or when Node 22 is revealed in Living Campaign mode). |
| **Section 5: Living Campaign Subgraph ($R \subseteq V$)** | When `fogOfWarMode = true`, all balancing formulas evaluate exclusively over the revealed node set $R$ (`InfBy(i) \cap R`). | Default Known Anchors are Nodes 1, 2, 6, and 20. When $R = V$, results match Omniscient mode and `Run-NetworkEngine.ps1` identically. |
| **Section 6–7: Socket Allocation & Recommendation Score $RS(m, v)$** | Sovereign Hub = 4 sockets; Satellite = 3 sockets; Hazard/Enclave = 2 sockets; Transit Corridor = 1–2 sockets. $RS(m, v) = 3\mathbb{I}_{\text{Tarot}} + 2\mathbb{I}_{\text{Culture}} + 1\mathbb{I}_{\text{Color}} + 3\mathbb{I}_{\text{SupplyIn}} + 2\mathbb{I}_{\text{SupplyOut}} - 5\mathbb{I}_{\text{Slotted}}$. | Recommends curated Module Bundles (*Carbochemical Defense Complex* [[Mod:INFRA-01]]+[[Mod:INFRA-02]]+[[Mod:INFRA-03]], *Ordnance Foundry*, *Resonant Telecom Grid*, *Glacial Sanctuary*). |
| **Section 8: Supply Reachability & Severance** | $\text{Supplied}(v) = \text{LocalYields}(v) \cup \bigcup_{u \in \text{Reachable}(v, k)} \text{LocalYields}(u)$ ($k = 3$ hops over unblocked $E_{adj}$). | Unmet material `requires` tags place module $m$ into **Severed Supply Status**, activating its `standalone_fallback` mode. |

---

## Data Flow & Execution Pipeline
- **Governed Surfaces**: Registered in [[File:docs/navigation_manifest.json]] as the primary specification for [[File:network/campaign_studio.html]], [[File:network/network_builder.html]], [[File:network/network_visualizer.html]], [[File:network/contradiction_matrix_dashboard.html]], [[File:network/platform_audit_dashboard.html]], [[File:network/Run-NetworkEngine.ps1]], and [[File:tarot/minor_matrix_browser.html]].
- **Data Inputs**: Consumes topology definitions from [[File:network/generic_network_topology.json]] and presets from [[File:network/presets/generic_archetype.json]] and `campaigns/*/preset.json`.

---

## AI Agent Maintenance Checklist
- **Before modifying any balancing, wave, or supply-chain algorithm**: Consult `docs/srd/authoring_engine_srd.md` and verify that any formula change is applied simultaneously to [[File:src/campaign_studio/scripts/stage_4_balancing.js]] and [[File:network/Run-NetworkEngine.ps1]].
- **After modifying balancing code**: Run `powershell -ExecutionPolicy Bypass -File .\network\Run-NetworkEngine.ps1` and `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1` to verify Conformance Requirements (Section 10).
<!-- END_CUSTOM_NOTES -->
