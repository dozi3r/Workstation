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

## Deferred

The dread-risk cascade (traffic diversion after a catastrophe, with secondary casualties) is not built. If built, it should be an opt-in what-if overlay that never writes `hazardLevel`, guards S at 0, caps diverted flow by detour capacity, and conserves total traffic.

## Consequences

- GMs get deterministic checkpoint and parley outcomes from authored trees.
- Hazard numbers read as counts, which makes the cost of scouts and false alarms visible.
- Heuristic assignment is a lens over existing ODV data, so changing the ODV matrix changes the profiles with no migration.
