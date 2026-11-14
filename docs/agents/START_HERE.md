# Agent entry point

Use this map to resume AdventureCAD / Creator Studio work without loading the full wiki or Git history.

## Startup contract

1. Read the root [AGENTS.md](../../AGENTS.md) instructions, then this page. Run `node scripts/agent_context.js --status` from AdventureCAD for a compact live Git and documentation-fingerprint report.
2. Identify the requested outcome and select one route with `node scripts/agent_context.js --route <id>`. Read only that route's authorities and relevant source excerpts. If the task crosses boundaries, select the additional route explicitly.
3. Inspect existing changes on the files you will touch. A commit identifies committed state only; the working tree may contain substantial newer work.
4. Finish orientation when you can name the owner, inputs/outputs, invariants, and appropriate validation for the task. Expand reading when a concrete unanswered question requires it.

Suggested startup reading budget: this page plus about 3,000 tokens of selected material, excluding applicable operating instructions. This is a target, not a reason to skip relevant constraints or truncate an important specification.

## System in one paragraph

AdventureCAD is the project directory; Creator Studio is the workstation/product name used throughout its docs. It is a system-agnostic campaign authoring workstation with recursive pointcrawl geography, a 64-cell sociological model, modular worldbuilding, campaign rosters, and offline portable packages. Source HTML/JS is compiled into the unified `start.html` workstation. Offline `file:///` operation remains supported alongside optional local loopback servers. Portable campaign packages are an input/output contract. The workstation does not depend on a particular package producer or its source tree.

## Choose the next read

| Need | Read |
|---|---|
| Ownership boundaries, source locations, related wiki series | [Architecture routes](ARCHITECTURE_MAP.md) |
| Commands, side effects, validation selection | [Operations](OPERATIONS.md) |
| Documentation conflicts and dated onboarding evidence | [Findings](ONBOARDING_FINDINGS.md) |
| Resume unfinished work or leave a handoff | [Handoff template](HANDOFF_TEMPLATE.md) |
| Domain definitions | [CONTEXT.md](../../CONTEXT.md), only the relevant section |
| Architectural rationale | [ADR index directory](../adr/), select by route |

## Project boundary

Keep this project's instructions, routes, fingerprints, builds and runtime self-contained. Accept completed campaign packages through the workstation's import/load contract. External producers may target that contract; their implementation, folders and lifecycle are outside this project.

## Authority and freshness

- User instructions and applicable agent instructions govern the work. These maps are navigation aids, not new domain specifications.
- `CONTEXT.md` defines terminology; ADRs explain decisions; SRDs specify contracts. Current source and targeted tests establish implemented behavior. When these disagree, record both; a code behavior is not automatically the intended contract.
- The wiki graph and per-file notes are generated indexes with curated notes. Query the graph first, then verify consequential answers in source. A missing symbol may mean stale indexing, not absent code.
- `docs/navigation_manifest.json` supplies surface routing data. The `AGENTS.md` prose template lives in `build_suite.js`; editing the generated file alone will be overwritten.
- Package catalogs, fingerprints, commit hashes, and test results are dated observations. Refresh only the evidence needed for the task. A matching fingerprint proves unchanged bytes, not correctness.

## Context economy

Keep decisions and rationale in their existing authority; link to them here. Read source files, not compiled distributions. Use bounded `rg -n` results and line windows, graph queries for callers, and path-scoped `git diff` / `git log` for changes and history. Tool output consumes context even when a script describes itself as "zero-token."

At handoff, save unresolved work and evidence with [the template](HANDOFF_TEMPLATE.md). On a fresh chat, re-check live state rather than assuming the previous conversation or this dated snapshot is current.
