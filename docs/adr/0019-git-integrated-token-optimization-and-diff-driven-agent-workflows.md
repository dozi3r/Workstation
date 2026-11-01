# ADR 0019: Tooling-Integrated Token Optimization, Diff-Driven Agent Workflows, and Invariant Guardrails

## Status
Accepted (2026-10-31)

## Context
As Creator Studio expanded into a multi-surface authoring workstation containing over 290 tracked files, 2,500 bidirectional wiki backlinks, and comprehensive automated test suites, pair-programming with Large Language Model (LLM) agents began incurring significant context-window overhead and operational friction:

1. **Whole-File Re-Reading Overhead**: Agents inspecting the results of small, localized code modifications frequently re-read 500–1,500 line files, consuming 2,000 to 6,000 prompt tokens per verification cycle.
2. **Monolithic Bundle Ingestion Trap**: Agents attempting to inspect or grep compiled single-file distributions (`start.html` at 5.9 MB, `platform_audit_dashboard.html` at 4.5 MB, `wiki/wiki_graph.json` at 1.6 MB) flooded the context window with hundreds of thousands of redundant tokens.
3. **Conversation History Bloat**: Without persistent version control anchors, multi-turn sessions accumulated extensive narrative descriptions of previous code states, exhausting context limits and increasing latency.
4. **Tooling & Runtime Ambiguity**: The mistaken assumption that Node.js, Git, or modern search tools were unavailable caused agents to avoid running build scripts, fail back to slow manual file parsing, and bypass automated quality gates.
5. **Multi-Agent Collision & Context Bleed**: Launching parallel or autonomous subagents directly against the active working directory risked simultaneous file mutations, unresolvable 3-way merge conflicts on compiled bundles, and process tree leaks.

## Decision

### 1. Dual-Runtime Node.js Shim Architecture
- **Embedded Electron Runtime**: Node is provisioned without external setup by leveraging Antigravity's bundled Electron executable via `set ELECTRON_RUN_AS_NODE=1`.
- **Global On-PATH Shim**: An on-PATH shim executable is maintained in `C:\Users\Milo\AppData\Roaming\Antigravity\bin\node.cmd` (and `agy-node.cmd`), exposing Node v24 system-wide across Command Prompt and PowerShell sessions.
- **PowerShell Safe Quoting**: When executing one-liner node evals from PowerShell, scripts must use outer double quotes and inner single quotes (e.g., `node -e "console.log('Safe eval')"`).

### 2. Zero-Install Git Runtime & Global Terminal Shim
- **User-Scope Installation**: Git is provisioned via `Git.MinGit` in user-space, avoiding Windows UAC administrative prompts and ensuring unattended agent execution.
- **Persistent Shim**: An on-PATH shim executable is maintained in `C:\Users\Milo\AppData\Roaming\Antigravity\bin\git.cmd`.
- **Windows Longpaths & Autocrlf**: Global configurations enforce `core.longpaths = true` (to safely traverse deep nested research and module hierarchies) and `core.autocrlf = true`.

### 3. Ripgrep Scoped Search & Declarative `.ignore` Engine
- **Dynamic Path Resolution**: `C:\Users\Milo\AppData\Roaming\Antigravity\bin\rg.cmd` dynamically resolves `rg.exe` across any installed WinGet package version without brittle hardcoded paths.
- **Declarative Context Protection**: A root `.ignore` file excludes compiled distributions (`start.html`, `network/platform_audit_dashboard.html`, `wiki/wiki_graph.json`, `wiki/pages/`) so `rg` queries return sub-millisecond, targeted source lines without manual exclusion flags.

### 4. The Unbounded Read Ban & Diagnostic Window Protocol
- **Prohibited Invariant**: Agents are strictly prohibited from performing unbounded whole-file reads or broad greps on compiled monolithic distributions (`start.html`, `platform_audit_dashboard.html`, `wiki/wiki_graph.json`).
- **Source of Truth Rule**: All UI, logic, and data edits must target modular source files (`src/workstation/template.html`, `src/workstation/scripts/*.js`, `campaigns/`, `docs/`, `wiki/src/`).
- **Diagnostic Window Exception**: If `test/run_tests.js` or `Build-Suite.ps1` reports a compilation or syntax error in a compiled surface, agents are permitted to read **only** bounded diagnostic line ranges ($\le 50$ lines with explicit `StartLine` and `EndLine`) centered around the reported error line.

### 5. Diff-Driven Context Verification Protocol
- **Granular Diff Inspection**: Agents must prioritize `git diff -U3 <path>` and `git diff --stat` over whole-file reads when verifying modifications. 
- **Token Economy**: Verifying a 20-line edit via unified diff consumes approximately 100 tokens, yielding a **~95% token reduction** compared to re-reading the entire file.

### 6. Conventional Atomic Commits & Commit State Anchors
- **Atomic Milestones**: Every completed feature, bug fix, or documentation update is committed as an atomic unit adhering to Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`).
- **Commit State Anchors**: In agent handoff transcripts and multi-session roadmaps, workstation state is referenced by its immutable Git commit SHA rather than inlined file dumps, allowing any subsequent agent session to synchronize instantly with zero prompt bloat.

### 7. The Source-Only Worktree Invariant for Multi-Agent Sandboxing
- **Worktree Isolation**: Subagents performing parallel tasks, refactor experiments, or alternative implementations must operate in linked Git worktrees or isolated subagent workspaces (`Workspace: 'branch'`).
- **The Source-Only Invariant**: Subagents in isolated workspaces/worktrees must **NEVER** run `Build-Suite.ps1` or commit compiled distributions (`start.html`, `wiki/pages/*`, `wiki_graph.json`). Subagents only mutate and commit modular source files. The parent orchestrator merges the branch and compiles the suite once on the integration branch, completely preventing 3-way merge conflicts across 6 MB single-file bundles.
- **Worktree Gitignore**: `.worktrees/` and `worktrees/` are ignored in `.gitignore`.

### 8. Process Tree Termination Guardrail in Test Suites
- **Process Leak Prevention**: On Windows, PowerShell's `Stop-Process` kills only the top-level process wrapper (`cmd.exe`), leaking child Electron background processes.
- **Mandatory Process Tree Kill**: Test harnesses launching servers (`Test-Suite.ps1`) must terminate child process trees via `taskkill /PID $proc.Id /T /F 2>$null` to prevent zombie processes and TCP port collision (`EADDRINUSE: 8991`).

### 9. AST Graph Inspection First (`Find-CodebaseNode.ps1`)
- **Zero-Token Discovery**: Before reading files or grepping, agents must query `wiki/wiki_graph.json` via `Find-CodebaseNode.ps1` (`-Symbol`, `-File`, `-Resource`, `-Stale`) to identify exact callers and dependencies with zero token overhead.

## Consequences

### Positive
- **Dramatic Token Reduction**: Context consumption for change verification, regression hunts, and documentation audits decreases by 70% to 95%.
- **Zero-CORS Invariant Preservation**: All developer tooling operates strictly at the OS and build level; client-side browser runtime remains 100% offline, Zero-CORS compliant.
- **Merge Safety**: Multi-agent parallel tasks cannot corrupt compiled distribution files.
- **Reliable Automation**: Test harnesses and build runners execute without port locks, execution policy errors, or orphaned processes.

### Neutral / Trade-offs
- Windows Command Prompt wrappers (`.cmd`) require careful quote handling in PowerShell.
- Subagents must be explicitly instructed not to run the full build suite in isolated worktree branches.
