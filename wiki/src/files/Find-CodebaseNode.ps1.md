---
file_path: "Find-CodebaseNode.ps1"
title: "Find-CodebaseNode.ps1 — Zero-Token Codebase Graph & Dependency Inspector for Creator Studio"
volume: "vol-3"
kind: "PowerShell Automation / Simulation Runner"
current_hash: "ca3f2660ca2fc522"
reviewed_hash: "ca3f2660ca2fc522"
stale: false
size_bytes: 12001
line_count: 264
---

# Find-CodebaseNode.ps1 — Zero-Token Codebase Graph & Dependency Inspector for Creator Studio

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`Find-CodebaseNode.ps1` serves as the **Zero-Token CLI Codebase Graph, Symbol & Supply-Chain Inspector** within **Volume III: Build Pipeline & Workstation Tooling**.

- **Zero-Token Graph Navigation**: Queries `wiki/wiki_graph.json` (compiled deterministically by `wiki/build_wiki.js` during `Build-Suite.ps1`) to expose inbound backlinks/callers, outbound dependencies, declared functions/subroutines, and `provides`/`requires` resource contracts in milliseconds without LLM token overhead.
- **Supported Query Modes**:
  - `-File "<path>"`: Inspects a file's blast radius, callers, outbound links, declared symbols, and sync status.
  - `-Symbol "<name>"`: Locates where any JS/PowerShell/Python function is declared and which files invoke it.
  - `-Resource "<tag>"`: Traces worldbuilding module supply chains across `provides` and `requires` contracts.
  - `-Stale`: Lists any tracked files whose SHA-256 hash has drifted from its last reviewed wiki note.
  - `-Json`: Emits raw JSON for programmatic agent consumption.
<!-- END_CUSTOM_NOTES -->
