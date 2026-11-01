---
file_path: "src/workstation/scripts/stage_5_slotting.js"
title: "stage_5_slotting.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "1d47a45eeaf1c426"
reviewed_hash: "1d47a45eeaf1c426"
stale: false
size_bytes: 62056
line_count: 1403
---

# stage_5_slotting.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/stage_5_slotting.js` serves as the Stage 5 Module Slotting, BFS Supply Line Reachability, and Ad-Hoc Resource Logistics Engine within **Volume IV: Workstation Core & Pointcrawl CAD Engine**.

### Core Subsystems & Responsibilities
- **BFS Supply Chain & Ad-Hoc Logistics (`SYS-START-08`)**: Evaluates module and settlement resource dependencies via `checkModuleSupplyLine(nodeId, mod)` and `checkNodeAdHocSupplyLine(nodeId)`, merging slotted module yields, local and reachable `node.provides` endowments, Tier 0 substratum baselines, and corridor `edgeRecord.dedicatedFlows` conduits.
- **Network Supply Line Auditing**: `auditAllSupplyLines()` audits both slotted modules and ad-hoc node demands (`node.requires`), updating `#supply-integrity-badge` and rendering local logistics cards inside `updateTargetNodeSidebar()`.
<!-- END_CUSTOM_NOTES -->
