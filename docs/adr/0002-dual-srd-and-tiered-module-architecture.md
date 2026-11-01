# 0002: Dual SRD and Tiered Worldbuilding Module Architecture

## Context
Modules in Creator Studio were previously organized into a flat catalog across arbitrary legacy sets (Sets A through G) and treated by the user interface as undifferentiated cards slottable into any node. This conflated macro-governance rules (`FACT-01`), edge transit corridors (`EDGE-01`), industrial supply chains (`INFRA-01` -> `INFRA-02`), and campaign climax triggers (`ESOT-06`). Furthermore, modules intertwined authoring engine graph math with tabletop runtime rules (clocks, DC saves, damage dice).

## Decision
1. We separate the formal documentation into a **Dual SRD**:
   - **Authoring Engine SRD**: Codifies pointcrawl graph theory, 64-cell disposition algebra, 7-wave drawing protocol, dial balancing, and smothering algorithms.
   - **Adventure Framework SRD**: Codifies lightweight, system-agnostic tabletop runtime mechanics (hazard clocks, resolution checks, damage tiers, faction turns).
2. We re-stratify the worldbuilding content into a **5-Tier Worldbuilding Pipeline**:
   - **Tier 1 (Macro Network & Governance)**: System-wide network rules and tension polarities.
   - **Tier 2 (Topological & Biome Anchors)**: Node physical ecology, biomes, and edge corridors.
   - **Tier 3 (Infrastructural Supply Chains)**: Industrial nodes with explicit typed `provides: [...]` and `requires: [...]` Resource Tags.
   - **Tier 4 (Dynamic Narrative Sparks & Clocks)**: Faction crises, social dilemmas, and arrival gambits.
   - **Tier 5 (Esoteric & Eschatological Engines)**: Reality anomalies, time-loops, and campaign-climax colliders.
3. Modules declare dependencies via machine-readable Resource Tags, while the user interface presents them in cohesive **Module Bundles**.

## Consequences
- The flat 48-module manifest will be reorganized into a structured, dependency-aware taxonomy during remediation.
- Campaign Studio UI can validate unbroken supply chains along pointcrawl edges and prevent nonsensical socketing (e.g. slotting macro network rules into single nodes).
- The authoring engine remains decoupled from any specific tabletop RPG ruleset.
