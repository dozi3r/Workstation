---
file_path: "Build-Suite.ps1"
title: "Build-Suite.ps1 — Campaign Creator - Centralized Suite Build Runner"
volume: "vol-3"
kind: "PowerShell Automation / Simulation Runner"
current_hash: "c04855b6d7e486c1"
reviewed_hash: "c04855b6d7e486c1"
stale: false
size_bytes: 942
line_count: 26
---

# Build-Suite.ps1 — Campaign Creator - Centralized Suite Build Runner

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`Build-Suite.ps1` is the **Master PowerShell Build Entrypoint & Node.js Runtime Locator** within **Volume III: Build Pipeline, Compiler & Legacy Scratch Tooling**. Referenced in Ground Rule #3 of [[File:AGENTS.md]], [[File:docs/navigation_manifest.json]], and every surface Compass Header, it provides a resilient, zero-configuration Windows PowerShell wrapper that locates a valid `node.exe` binary on the host machine and executes [[File:build_suite.js]].

It is the first stage of [[Series:series_e_zero_cors_compiler_and_agent_router]].

---

## Core Invariants & Contracts
- **Canonical Build Command**: Every modification to modular source files (`src/workstation/`, `mods/`), campaign packages (`campaigns/`), Tarot decks (`tarot/decks/`), ticket manifests (`tickets/`), or wiki sources (`wiki/src/`) must be compiled by invoking:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
  ```
- **3-Tier Node.js Binary Discovery Fallback**: Because Windows workstation environments do not always expose `node.exe` on the default shell `PATH`, `Build-Suite.ps1` resolves `$nodePath` through a three-step cascade (lines 9–17):
  - **Tier 1 (System PATH)**: Checks `Get-Command node -ErrorAction SilentlyContinue`.
  - **Tier 2 (Known Bundled Runtime)**: Checks `Test-Path "C:\Program Files\Adobe\Adobe Photoshop 2024\node.exe"`.
  - **Tier 3 (Recursive Program Files / AppData Scan)**: Scans `C:\Program Files` and `$env:LOCALAPPDATA` for any `node.exe` binary (`Get-ChildItem -Filter node.exe -Recurse | Select-Object -First 1`).
- **Fail-Fast Exit Contract**: If no `node.exe` binary can be found across all three tiers, `Build-Suite.ps1` logs a descriptive `Write-Error` and exits with code `1`.

---

## Data Flow & Execution Pipeline
1. **Invocation**: Triggered by a developer or AI agent from the repository root (`c:\Users\Milo\Documents\Antigravity\Creator_Full_Standalone`).
2. **Runtime Resolution**: Resolves `$nodePath` and prints `Running build_suite.js with Node: <path>` in cyan.
3. **Delegation to Master Compiler**: Executes `& "$nodePath" "$PSScriptRoot\build_suite.js"`, which in turn orchestrates [[File:build_suite.js]], [[File:tickets/build_unified_tracker.js]], [[File:tarot/generate_minor_matrix.js]], [[File:tarot/generate_tarot_matrix.js]], and [[File:wiki/build_wiki.js]] (using `process.execPath` so child Node processes inherit the exact `$nodePath` discovered by `Build-Suite.ps1`).

---

## AI Agent Maintenance Checklist
- **Whenever you edit any source file in the repository**: Run `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1` rather than invoking `node` directly, especially on systems where `node` is not on the default PowerShell `PATH`.
- **When adding child Node.js scripts to `build_suite.js`**: Always invoke them via `"${process.execPath}"` inside `execSync(...)` so they inherit the `node.exe` binary resolved by `Build-Suite.ps1`.
<!-- END_CUSTOM_NOTES -->
