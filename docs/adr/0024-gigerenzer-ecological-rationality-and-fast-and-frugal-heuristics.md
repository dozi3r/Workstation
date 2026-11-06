# 0024. Ecological rationality and fast-and-frugal heuristics

Status: accepted

## Context

NPCs, factions and conduits carry static descriptions and a disposition vector. A GM at the table needs a quick, deterministic answer to "what does this guard do?" and a clear reading of corridor risk. Gerd Gigerenzer's work on decision-making under uncertainty (*Rationality for Mortals*, Oxford University Press, 2008) gives two tools that fit: fast-and-frugal trees and natural frequencies.

## Decision

1. **Heuristic profiles are derived, not stored.** `deriveHeuristicProfile(s, e, c)` in `sociology_data.js` maps all 64 ODV cells to one heuristic. The CVF quadrant from `deriveCvfQuadrant(s, e)` picks it. C sets `searchPatience` and the `strictness` (C 3 or 4 is codified, C 1 or 2 is improvised).

   | Quadrant | Heuristic |
   | :--- | :--- |
   | Clan | Social Proof |
   | Hierarchy | Fast-and-Frugal Tree |
   | Adhocracy | Take-the-Best |
   | Market | Tallying with 1/N allocation |

   The quadrant-to-heuristic table is a Creator Studio design mapping. It is not a claim from the book.

2. **Fast-and-frugal trees are optional entity data.** NPCs and factions may carry an `fft` object. `fast_frugal_tree.js` validates and evaluates it. Cues run in order, the first matching exit wins, and `defaultExit` applies when none match. Allowed `testType` values: `boolean_query`, `faction_standing`, `item_check`, `disposition_threshold`, `gold_threshold`. An invalid tree throws.

3. **Natural frequencies are derived from edge data.** `computeConduitNaturalFrequency` in `natural_frequency_engine.js` turns a conduit into whole-number counts for a sample of trips. Optional edge fields: `hazardProbability`, `scoutDetectionRate`, `scoutFalseAlarmRate` (all 0 to 1). When `hazardProbability` is absent the rate comes from `hazardLevel` (0, 5, 15, 30, 50 percent for levels 0 to 4).

4. **Ecological mismatch warnings.** `diagnoseEcologicalMatch(profile, env)` returns warnings when a heuristic does not fit its environment, for example Take-the-Best with highly redundant cues, or a fixed-order tree under asymmetric threats.

## Schema invariants

- Every new field is optional. Campaigns without them load and behave as before.
- `fft` is deep-copied when a prototype is promoted to an active entity.
- The evaluator and the natural-frequency engine are pure UMD modules with no DOM access. UI lives in `fft_editor_ui.js` and `property_grid_inspector.js`.

## UI surfaces

- NPC and faction dossiers show a heuristic badge and the tree diagram, with an editor dialog (`openFftBuilderModal`) that tests the tree against a mock party.
- The conduit property grid has a Hazard Optics section: percentage or natural-frequency view, a 2x2 hit/miss table, and a copyable encounter odds sheet.
- The Edge Explorer shows the natural-frequency summary under hazard and travel risk.
- `odv_archetype_matrix.html` has a Heuristics view that groups the 64 cells by strategy and explains where each one fits or fails.

## Dread risk what-if

After a catastrophe, travelers avoid the dreaded conduits and crowd onto detours, where congestion can cost more lives than the original event. `simulateDreadRiskCascade(topo, opts)` in `dread_risk.js` models this as a pure what-if. It never writes to the topology.

- Dread index: `severity x (1 + novelty) x C / max(1, S)`, using the source node's ODV. Diversion rate: `min(1, index / 10)`.
- Each road at the source node is a dreaded conduit. Diverted traffic takes the shortest road path that avoids that conduit. Blocked roads are skipped.
- Assumptions, all overridable per edge: `trafficVolume` (default 100), nominal `capacity` (default 1.25 x traffic), hard cap of 2 x capacity. Flow beyond the hard cap is reported as unserved (stranded), not lost.
- Detour casualties are `added flow x loss rate(effective level) x congestion`. Congestion is at least 1. Load above nominal capacity raises the effective hazard level by 1, and load above 1.5 x capacity raises it by 2 (capped at 4), so crowding makes even a hazard-free road dangerous. Flow is conserved: entering = direct + served + unserved.
- Nodes on detours are flagged Refugee Strain, or Famine Risk when congestion exceeds 1.5.
- `dread_risk_overlay.js` runs it from a "Dread Risk What-If" button in the node property grid, tints dreaded (red) and detour (amber) conduits on the canvas, and writes the totals to the status bar. A clear button removes it.
- The loss rates and capacity defaults are tuning values, not figures from the book.

## Consequences

- GMs get deterministic checkpoint and parley outcomes from authored trees.
- Hazard numbers read as counts, which makes the cost of scouts and false alarms visible.
- Heuristic assignment is a lens over existing ODV data, so changing the ODV matrix changes the profiles with no migration.
