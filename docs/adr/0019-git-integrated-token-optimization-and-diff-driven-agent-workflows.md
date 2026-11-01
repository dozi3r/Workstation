# ADR 0019: Git-Integrated Token Optimization and Diff-Driven Agent Workflows

## Status
Accepted (2026-10-31)

## Context
As Creator Studio expanded into a multi-surface authoring workstation containing over 290 tracked files, 2,500 bidirectional wiki backlinks, and comprehensive automated test suites, pair-programming with Large Language Model (LLM) agents began incurring significant context-window overhead:

1. **Whole-File Re-Reading Overhead**: Agents inspecting the results of small, localized code modifications frequently re-read 500–1,500 line files, consuming 2,000 to 6,000 prompt tokens per verification cycle.
2. **Conversation History Bloat**: Without persistent version control anchors, multi-turn sessions accumulated extensive narrative descriptions of previous code states, exhausting context limits and increasing latency.
3. **Multi-Agent Collision & Context Bleed**: Launching parallel or autonomous subagents directly against the active working directory risked simultaneous file mutations and required subagents to load extensive global context rather than isolated diffs.
4. **Manual Documentation Drift Detection**: Auditing whether documentation or wiki pages drifted from implementation required reading large specification files, when only a few functions or schemas actually changed.

While Git was established as an industry standard for source control, it was previously treated purely as an external administrative utility rather than a core, first-class architectural primitive within the workstation's agent router and test harness.

## Decision

### 1. Zero-Install Git Runtime & Global Terminal Shim
- **User-Scope Installation**: Git is provisioned via `Git.MinGit` in user-space, avoiding Windows UAC administrative prompts and ensuring unattended agent execution.
- **Persistent Shim**: An on-PATH shim executable is maintained in `C:\Users\Milo\AppData\Roaming\Antigravity\bin\git.cmd`, ensuring instant, zero-configuration availability across all standard PowerShell and Command Prompt shells.
- **Windows Longpaths & Autocrlf**: Global configurations enforce `core.longpaths = true` (to safely traverse deep nested research and module hierarchies) and `core.autocrlf = true`.

### 2. Diff-Driven Context Verification Protocol
- **Granular Diff Inspection**: Agents must prioritize `git diff -U3 <path>` and `git diff --stat` over whole-file reads when verifying modifications. 
- **Token Economy**: Verifying a 20-line edit via unified diff consumes approximately 100 tokens, yielding a **~95% token reduction** compared to re-reading the entire file.

### 3. Conventional Atomic Commits & Commit State Anchors
- **Atomic Milestones**: Every completed feature, bug fix, or documentation update is committed as an atomic unit adhering to Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`).
- **Commit State Anchors**: In agent handoff transcripts and multi-session roadmaps, workstation state is referenced by its immutable Git commit SHA rather than inlined file dumps, allowing any subsequent agent session to synchronize instantly with zero prompt bloat.

### 4. Isolated Worktree Sandboxing for Multi-Agent Workflows
- **Worktree Isolation**: Subagents performing parallel tasks, refactor experiments, or alternative implementations must operate in linked Git worktrees (`git worktree add`).
- **Patch Merging**: Subagents return only their concise patch diffs to the orchestrator, preventing workspace collisions and isolating context leakage. Temporary worktrees are pruned upon branch integration.

### 5. Surface Routing & Zero-Token Documentation Sync
- **Documentation Surfaces Table**: `AGENTS.md` indexes authoritative architecture specifications against source code directories (e.g., `src/workstation/scripts/entity_*.js` ➔ `docs/adr/0005-campaign-entity-architecture-npcs-quests-items.md`).
- **Automated Routing**: Diff-driven skills (`atomic-documentation`) leverage this table to identify stale documentation surfaces from `git diff --name-only` in under 200 tokens.

### 6. Non-Disruptive Fast Pre-Commit Validation
- **Local Hook**: A lightweight pre-commit hook runs syntax verification (`test/run_tests.js`) in `<1 second` before commits land.
- **Non-Blocking Invariant**: The pre-commit hook checks only executable JavaScript syntax on staged files, reserving the 13-second comprehensive test suite (`Test-Suite.ps1`) for major compilation phases and pre-push gates.

## Consequences

### Positive
- **Dramatic Token Reduction**: Context consumption for change verification, regression hunts, and documentation audits decreases by 70% to 95%.
- **Zero-CORS Invariant Preservation**: Git operates strictly at the operating system file level, requiring zero network calls, zero external CDNs, and zero HTTP fetch dependencies in compiled HTML tools.
- **Fail-Safe Rollback**: Erroneous code changes or accidental deletions can be restored instantly via `git restore` with zero token overhead.
- **Offline Independence**: Git repositories reside locally on disk, maintaining the workstation's ground rule of full offline autonomy.

### Neutral / Trade-offs
- Staged binary assets exceeding GitHub thresholds (such as multi-hundred-megabyte slide decks) must be filtered in `.gitignore` or tracked via Git LFS.
- Commit messages must strictly follow the conventional format to keep the repository history parseable by automated tooling.
