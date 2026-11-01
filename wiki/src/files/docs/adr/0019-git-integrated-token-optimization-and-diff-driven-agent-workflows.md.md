---
file_path: "docs/adr/0019-git-integrated-token-optimization-and-diff-driven-agent-workflows.md"
title: "ADR 0019: Tooling-Integrated Token Optimization, Diff-Driven Agent Workflows, and Invariant Guardrails"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "7115b8eb68960b93"
reviewed_hash: "7115b8eb68960b93"
stale: false
size_bytes: 7446
line_count: 67
---

# ADR 0019: Tooling-Integrated Token Optimization, Diff-Driven Agent Workflows, and Invariant Guardrails

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`docs/adr/0019-git-integrated-token-optimization-and-diff-driven-agent-workflows.md` serves as a foundational **Architectural Decision Record (ADR)** within **Volume I: System Architecture, Governance & Ontology**. It establishes the developer tooling shims (Node.js Electron shim, Git MinGit, Ripgrep CLI with `.ignore`), the Unbounded Read Ban on compiled single-file distributions, the Source-Only Worktree Invariant for multi-agent workflows, process tree termination in test runners, and zero-token AST knowledge graph inspection via [[File:Find-CodebaseNode.ps1]].
<!-- END_CUSTOM_NOTES -->
