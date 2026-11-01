---
file_path: "network/platform_audit_dashboard.html"
title: "Creator Studio: Platform Explorer & Master Audit"
volume: "vol-5"
kind: "Standalone Zero-CORS HTML Workstation"
current_hash: "32ef01ec65c778ff"
reviewed_hash: "32ef01ec65c778ff"
stale: false
size_bytes: 4478319
line_count: 14564
---

# Creator Studio: Platform Explorer & Master Audit

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`network/platform_audit_dashboard.html` is the **Universal Platform Explorer & Master Audit Visualizer (Step 3)** within **Volume V: Network Surfaces, Topologies & CLI Simulation (network/)**. Compiled by [[File:build_suite.js]] (lines 487–494), this tool visualizes repository-wide platform health, campaign module registries, and the multi-tier backlog.

---

## Build Mirror & Repository Hygiene Notice
> [!WARNING]
> **🔗 DUPLICATE BUILD MIRROR (SYS-AUDIT-01)**: [[File:build_suite.js]] writes the compiled output of this dashboard to both `network/platform_audit_dashboard.html` and `tickets/creative/platform_audit_visualizer.html` for folder convenience. Always treat `network/platform_audit_dashboard.html` (and source manifests in `tickets/` and `campaigns/`) as canonical. Tracked under [[Ticket:SYS-AUDIT-01]] and [[Series:series_g_duplicate_and_orphan_audit]].

---

## Features & Data Ingestion
- **Ticket Backlog Exploration**: Ingests and renders data from [[File:tickets/master_ticket_manifest.json]] and [[File:tickets/creative/creative_backlog_manifest.json]].
- **Campaign Verification**: Audits multi-campaign packages in `campaigns/`, verifying module schemas, resource tags, and node slotting completeness.
- **Zero-CORS Portable UI**: Runs offline via `file:///` with rich search, status filtering, and visual dependency graphs.
<!-- END_CUSTOM_NOTES -->
