# Agent operations

Select commands by the files and behaviors changed. Commands below run from the named project root; launch/build/test commands can write files or start processes.

## Read-only orientation (AdventureCAD)

```powershell
node scripts/agent_context.js --status
node scripts/agent_context.js --route session
node scripts/find_codebase_node.js --file src/workstation/scripts/state_adapter.js
node scripts/find_codebase_node.js --symbol switchActiveMap
git diff --stat -- src/workstation docs
git diff -U3 -- src/workstation/scripts/state_adapter.js
git log -5 --oneline -- src/workstation/scripts/state_adapter.js
rg -n 'switchActiveMap' src/workstation/scripts test
```

The graph inspector also supports `--resource`, `--stale`, and `--json` (PowerShell wrapper: `-File`, `-Symbol`, `-Resource`, `-Stale`, `-Json`). High-fanout files can produce long output; query the smallest relevant owner/symbol. Graph results are cached build evidence, not a live source scan.

For a bounded source window: `Get-Content <path> | Select-Object -Skip <zero-based-offset> -First 40`. Programmatic parsing can inspect a large artifact without printing its full contents.

## Validation and side effects

| Change / need | Command | Scope and effects |
|---|---|---|
| Onboarding maps or retrieval helper | `node scripts/agent_context.js --check` | Checks index paths, fingerprints, local Markdown links, and startup size; writes nothing. Fingerprint drift is a review signal, not a correctness verdict. |
| Workstation source, routing, wiki notes, campaign data | `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1` | Compiles source, regenerates router/bundles/wiki/graph; potentially broad generated diffs. Run from integrated workspace, respecting source-only worktree rules. |
| Full AdventureCAD verification after a normal build | `node scripts/test_suite.js --skip-build` | Tests JS, validates campaigns, checks wiki drift, and probes loopback servers. The default runner without `--skip-build` invokes a build with **blanket `--stamp-reviewed`**. Preserve unrelated review markers. This is not read-only. |
| One existing workstation campaign | `node scripts/test_suite.js --campaign <campaign-directory-name>` | Validates the selected package; narrower than full suite. Read current harness for flags before changing scope. |
| Wiki drift | `node scripts/find_codebase_node.js --stale` | Reports cached wiki drift; rebuild to refresh its evidence. |


Suites 59-62 in `test/run_tests.js` cover the four recent architecture sprints: mutation ownership, session isolation, roster navigation, and portable package adapters. `--quick` on the master runner skips loopback probes; it still checks wiki drift. Neither flag makes the entire harness read-only.

Package compatibility is checked through this project's loader, mutation engine and package tests. Producer-specific quality checks belong to the producing project. The context helper rejects paths outside this project root.

## Build review discipline

1. Capture live status before edits; preserve unrelated changes and deletions. Inspect path-scoped diffs afterward.
2. Update curated notes on changed source files before compilation. New documentation is discovered by the wiki build.
3. Run the build without a blanket `--stamp-reviewed` when unrelated wiki drift exists. Refresh only reviewed notes' hashes after checking the source. A review stamp is an assertion, not a way to hide failures.
4. Inspect generated changes separately from authored changes. Do not reset generated files that already carried another session's work.
5. Report exact commands/results and remaining failures. Do not call a full suite passing when only a link checker or selected package passed.

Use [the handoff template](HANDOFF_TEMPLATE.md) to leave evidence. Keep dates and commit references with historical results; test duration and pass counts are not enduring contracts.
