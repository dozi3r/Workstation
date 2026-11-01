---
file_path: "sociology/07_Granular_64_Disposition_Matrix.md"
title: "THE 64-CELL GRANULAR DISPOSITION MATRIX: BOONS, BURDENS & PASSIVES"
volume: "vol-6"
kind: "Sociology Specification"
current_hash: "643d13dadd0ab4cc"
reviewed_hash: "643d13dadd0ab4cc"
stale: false
size_bytes: 63238
line_count: 219
---

# THE 64-CELL GRANULAR DISPOSITION MATRIX: BOONS, BURDENS & PASSIVES

<!-- BEGIN_CUSTOM_NOTES -->
### 1. Architectural Purpose & Role
`sociology/07_Granular_64_Disposition_Matrix.md` (**Module SOC-07**) is the exhaustive 64-cell archetypal lookup table for the **Organizational Disposition Vector (`[S, E, C]`)** defined in [[File:sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md]]. It functions both as a human-readable design reference and as a **machine-parsed data source** directly ingested by [[File:tarot/generate_tarot_matrix.js]] during suite compilation.

### 2. Structural Organization (4 Stability Blocks $\times$ 16 Cells = 64 Archetypes)
The matrix is organized into four macro blocks corresponding to the **Structural Stability & Entropy (`S`)** dial, with 16 rows per block (`E` from `1..4` $\times$ `C` from `1..4`):

| Block | Stability Dial (`S`) | Governance Posture | Coordinate Range | Representative Cornerstone Archetypes |
| :--- | :---: | :--- | :---: | :--- |
| **Block 1** | **`S = 1`** | **Immutable Order / Absolute Stasis** | `[1, 1, 1]` to `[1, 4, 4]` | `[1, 1, 1]` *The Sealed Monolith* $\cdot$ `[1, 1, 4]` *The Monastic Hive* $\cdot$ `[1, 4, 1]` *The Penal Workhouse* $\cdot$ `[1, 4, 4]` *The Biomechanical Hive* |
| **Block 2** | **`S = 2`** | **Codified Protocol / Structured Governance** | `[2, 1, 1]` to `[2, 4, 4]` | `[2, 1, 1]` *The Hermetic Academy* $\cdot$ `[2, 2, 2]` *The Agricultural Shire* $\cdot$ `[2, 3, 4]` *The Continental Trade Matrix* $\cdot$ `[2, 4, 4]` *The Imperial Directorate* |
| **Block 3** | **`S = 3`** | **Adaptive Heuristics / Situational Flexibility** | `[3, 1, 1]` to `[3, 4, 4]` | `[3, 1, 1]` *The Master Artificer's Cell* $\cdot$ `[3, 2, 3]` *The Mutualist Network* $\cdot$ `[3, 3, 2]` *The Independent Caravan* $\cdot$ `[3, 4, 4]` *The Predatory Swarm* |
| **Block 4** | **`S = 4`** | **Hyper-Entropy / Radical Metamorphosis** | `[4, 1, 1]` to `[4, 4, 4]` | `[4, 1, 1]` *The Volatile Hermit* $\cdot$ `[4, 2, 1]` *The Free Drifter* $\cdot$ `[4, 4, 1]` *The Lone Apex Predator* $\cdot$ `[4, 4, 4]` *The Entropic Vortex* |

### 3. Dual-Horizon Passive Schema (Micro vs. Macro)
Every row in `SOC-07` provides seven strictly formatted columns:
- **`Tag [S,E,C]`** & **`Archetype Name`**: Unique coordinate key and system-agnostic title.
- **`Core Boon`** & **`Core Burden`**: The inherent organizational advantage and its corresponding structural blind spot.
- **`Micro Passive (Internal)`**: Governs mechanics *inside* the entity's perimeter (damage redistribution, morale immunity, crafting precision, or internal deviance purges).
- **`Macro Passive (Influence Sphere)`**: Governs ambient effects projected *outward* across connected pointcrawl edges (quarantine null-zones, tariff embargoes, assimilation creep, or speculative liquidity).
- **`Exemplar NPC & Interaction Hook`**: Named archetype, signature dialogue quote, and immediate tabletop dilemma.

### 4. Compiler Ingestion Contract (`tarot/generate_tarot_matrix.js`)
> [!IMPORTANT]
> **Strict Markdown Table Formatting Invariant**: Lines 19–45 of [[File:tarot/generate_tarot_matrix.js]] parse `sociology/07_Granular_64_Disposition_Matrix.md` via regular expression (`/\|\s*\*\*`\[(\d),\s*(\d),\s*(\d)\]`\*\*\s*\|\s*\*\*([^*]+)\*\*\s*\|.../`). Every one of the 64 rows must preserve its exact 7-column Markdown pipe structure so `generate_tarot_matrix.js` can bind all 264 Major Arcana profiles in [[File:tarot/tarot_sociology_matrix.json]] and [[File:sociology/08_Tarot_Sociology_Matrix.md]] to their corresponding `matrix64Link` object.

- **Cross-Cutting Series**: Detailed in [[Series:series_c_sociology_and_tarot_hermeneutics]] and visualized in the 64-Cell Heatmap tab of [[File:tarot/tarot_deck_analytics.html]].
<!-- END_CUSTOM_NOTES -->
