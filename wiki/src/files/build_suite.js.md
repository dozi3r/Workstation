---
file_path: "build_suite.js"
title: "build_suite.js"
volume: "vol-3"
kind: "Node.js / Browser Engine Script"
current_hash: "892091d8a80bbab6"
reviewed_hash: "892091d8a80bbab6"
stale: false
size_bytes: 71319
line_count: 1432
---

# build_suite.js

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`build_suite.js` is the **Centralized Asset Compiler, Zero-CORS Bundler & Agent Navigation Engine** within **Volume III: Build Pipeline, Compiler & Legacy Scratch Tooling**. Created under [[File:.scratch/creator-remediation/issues/04-build-centralized-compiler.md]] to eliminate the Multiple Source of Truth Hazard identified in [[File:docs/audit/2026-10-creator-studio-audit-dossier.md]] and governed by [[File:docs/adr/0001-dual-mode-preset-architecture.md]], [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], and [[File:docs/navigation_manifest.json]], it is the single build orchestrator that compiles modular HTML/JS sources, multi-campaign sourcebooks, Tarot decks, unified ticket trackers, Compass Headers, and the Bidirectional Codebase Wiki into 100% offline `file:///` distributions. Includes defensive map node hydration for scale-fluid multi-map presets when individual maps omit `nodes` arrays.

For a deep cross-cutting analysis of this subsystem, consult [[Series:series_e_zero_cors_compiler_and_agent_router]].

---

## Core Invariants & Contracts
- **Zero External Dependencies**: Uses only built-in Node.js standard library modules (`fs`, `path`, `child_process.execSync`) so it can execute on any standalone Node binary discovered by [[File:Build-Suite.ps1]].
- **Idempotent Fenced Injection**: Every dataset injected into HTML distributions (`CAMPAIGN_REGISTRY`, `MODULES_MANIFEST`, `DEFAULT_WAVES`, `ALL_MODULES`, `TICKETS`, `MASTER_TICKETS_DATA`) is wrapped in deterministic comment fences (`// [AUTO-GENERATED ... VIA build_suite.js]`) or resolved from [[File:src/workstation/template.html]] (`// @@INJECT_*@@`), guaranteeing repeatable builds without file corruption.
- **Script-Safe HTML Serialization**: When inlining raw Markdown module bodies or ticket manifests into `<script>` blocks (such as `ALL_MODULES` in [[File:network/platform_audit_dashboard.html]] and `MASTER_TICKETS_DATA` in [[File:start.html]]), `build_suite.js` escapes closing `</script>` tags via `.replace(/<\/script>/gi, '<\\/script>')` and avoids regex `$` dollar sign replacement hazards using functional replacers `() => replacement`.
- **Build-Time Mirror Note ([[Ticket:SYS-AUDIT-01]])**: Lines 487–494 write an identical mirror of [[File:network/platform_audit_dashboard.html]] to [[File:tickets/creative/platform_audit_visualizer.html]], tracked under Category A of [[Series:series_g_duplicate_and_orphan_audit]].

---

## Operational Verification
To execute asset compilation and verify zero-CORS compliance:
```powershell
powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1
```
<!-- END_CUSTOM_NOTES -->
