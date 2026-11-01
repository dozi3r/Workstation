---
file_path: "network/network_builder.html"
title: "Network Builder - Redirecting to Workstation..."
volume: "vol-5"
kind: "Standalone Zero-CORS HTML Workstation"
current_hash: "732c872d71f578e5"
reviewed_hash: "732c872d71f578e5"
stale: false
size_bytes: 2017
line_count: 44
---

# Network Builder - Redirecting to Workstation...

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`network/network_builder.html` is the **Universal Network Builder & Topological Graph Canvas (Deprecated Redirect Stub)** within **Volume V: Network Surfaces, Topologies & CLI Simulation (network/)**. Per [[File:docs/adr/0004-desktop-workstation-start-html.md]], [[File:docs/adr/0007-unified-workstation-consolidating-index-and-campaign-studio.md]], and [[File:tickets/system/SYS-START-15_vestigial_framework_retirement_and_pipeline_decommissioning.md]], this surface has been deprecated and compiled by [[File:build_suite.js]] as a zero-CORS instant redirect stub forwarding to [[File:start.html]].

Pointcrawl graph CAD editing, visual spatial node positioning, vector flow assignment, and topology JSON export are now native capabilities of [[File:start.html]].

---

## Historical Context & Decommissioning
- **Origin**: Created as "Step 0" in the original 3-step authoring pipeline (`network_builder.html` -> `campaign_studio.html` -> `platform_audit_dashboard.html`).
- **Retirement**: Workstation 2.0 (`start.html`) integrated full CAD vector graphics, node/edge wiring, and multi-scale cartography into a unified Windows 95/VB6 desktop shell.
- **Zero-CORS Stub**: Retained as a valid HTML surface emitting client-side `window.location.replace('../start.html')` to preserve inbound wiki backlinks without breaking offline execution.
<!-- END_CUSTOM_NOTES -->
