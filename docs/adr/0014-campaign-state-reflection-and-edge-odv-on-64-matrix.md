# ADR 0014: Campaign State Reflection, Corridor Disposition, and Dense Summary Cells on the 64-Cell ODV Matrix

## Status
Accepted (2026-10-30)

## Context
Creator Studio parameterizes node governance and corridor friction through a 64-cell Organizational Disposition Vector (`[S, E, C]`) matrix defined in Section 3 of the Authoring Engine SRD. While `network/odv_archetype_matrix.html` provides a GM exploration and tuning suite for these archetypes, it operated in isolation from the active campaign pointcrawl topology.

To turn the matrix into an operational campaign heatmap and sociological command deck, several architectural challenges arose:
1. **Edge Disposition Semantics**: Nodes have discrete sociopolitical perimeters, but transit road corridors connect two potentially divergent nodes. Edges needed a clear rule to map to the 64-cell space without breaking network physics.
2. **Matrix Cell Density vs. Visual Scanability**: The previous cells were fixed-height stubs (`h-28`) showing only titles and archetype names. GMs needed core boons, burdens, tactical micro-passives, corridor macro-passives, and exemplar personas visible across the 4×4 grid without narrative bloat.
3. **Multi-Node Occupancy & Scalable Granularity**: Because campaigns may concentrate nodes in particular cultural tiers or quadrants (e.g. four frontier settlements sharing `[4, 4, 3]`), displaying every node name inline inside a 4×4 grid cell caused layout blowout and uneven grid rows.

## Decision
1. **Autonomous Corridor Disposition (`edge.odv`) with Midpoint Fallback**:
   - Transit road edges (`E_adj`) can declare an explicit autonomous disposition vector (`edge.odv = { s, e, c }`), enabling neutral smuggling trails, pirate corridors, or strict imperial toll-routes.
   - If `edge.odv` is undeclared, the corridor disposition defaults to the rounded centroid midpoint of its connected endpoint nodes:
     $$S_{\text{edge}} = \text{round}\left(\frac{S_u + S_v}{2}\right), \quad E_{\text{edge}} = \text{round}\left(\frac{E_u + E_v}{2}\right), \quad C_{\text{edge}} = \text{round}\left(\frac{C_u + C_v}{2}\right)$$
   - Both nodes and edges are indexed into the active campaign occupancy registry.

2. **Dense Structured Cell Summaries**:
   - Each matrix cell is redesigned to an adaptive min-height (`min-h-[190px] md:min-h-[220px]`) displaying concise, stripped 1-line key-value rules:
     - ✨ **Boon**: Core systemic rule bonus.
     - ⚠️ **Burden**: Vulnerability trigger.
     - ⚔️ **Micro**: Tactical redoubt encounter passive.
     - 🗺️ **Macro**: Strategic pointcrawl corridor aura.
     - 🎭 **NPC**: Exemplar persona name.

3. **Cell Occupancy Counters & Dossier Roster Enumeration**:
   - Cells display concise occupancy numerical badges in their header:
     - `📍 <N> Nodes` (emerald pill badge)
     - `🔗 <M> Edges` (amber pill badge)
   - When an archetype cell is selected, the **Active GM Dossier** at the top renders a dedicated **Active Campaign Occupants** section enumerating every mapped node and edge with full names, IDs, and corridor friction ratings ($\Delta \ge 5$).

4. **Two-Way Workstation Cross-Linking**:
   - Every node entry in the dossier roster provides an `"Open on Canvas ↗"` deep link (`start.html?selectNode=<id>`), instantly jumping the GM from sociological analysis to CAD workstation editing.

## Consequences
- **Positive**:
  - Cell height and geometry remain stable and uniform across 4×4 table rows regardless of node collision count.
  - Zero-CORS offline execution is fully preserved across `localStorage`, `CreatorStudioMapDB`, and file loaders.
  - Complete authorial control over corridor tension and transit road culture.
- **Negative / Trade-offs**:
  - Identifying specific node names for a shared archetype requires clicking the cell to inspect the dossier roster rather than reading names directly inside the grid card.
