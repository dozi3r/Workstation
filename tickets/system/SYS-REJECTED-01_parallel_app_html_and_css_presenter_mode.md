---
id: SYS-REJECTED-01
title: "REJECTED: Parallel app.html Entry Point & CSS .presenter-mode Shell Fork"
pipeline_tier: 0
target_surface: "start.html (Rejected Guardrail)"
status: rejected
category: "system_architecture"
wave: "Architecture Guardrails (Do Not Implement)"
grounded_prerequisites: ["ADR-0007 Unified Workstation Consolidating Index and Campaign Studio", "ADR-0022 Co-Authoring Architecture and Rejected Patterns"]
grounded_yields: ["Permanent guardrail against parallel HTML entry points and CSS-hidden MDI state traps"]
provides: ["Guardrail: Single-Entry-Start-HTML"]
requires: ["ADR: 0022-Rejected-Patterns"]
standalone_fallback: "start.html remains the sole unified workstation surface."
---

# SYS-REJECTED-01: Parallel `app.html` Entry Point & CSS `.presenter-mode` Shell Fork (DO NOT IMPLEMENT)
*Category: system_architecture | Target Surface: `start.html` (Architecture Guardrail)*
*Status: rejected (Permanent Architectural Guardrail)*

---

## 1. Proposal Summary (Rejected)

A partner proposal (Workstation 2.6 Tickets 10–13) suggested either:
1. Creating a second compiled application entry point (`app.html`) with modern CSS theme tokens alongside `start.html`, or
2. Adding a `.presenter-mode` CSS class on `<body>` that hides the Win95 MDI chrome, menu bar, and status bar while keeping all 38 workstation scripts running underneath.

---

## 2. Why We Permanently Rejected This Pattern

1. **Violation of ADR-0007 (Single Unified Workstation Surface)**: We previously retired `index.html`, `network/campaign_studio.html`, and `network/network_builder.html` specifically because maintaining parallel HTML entry points doubled build times, fractured bookmark/wiki links, and caused UI regressions where modals worked in one shell and broke in the other.
2. **DOM & Keyboard Shortcut State Traps**: Hiding `.mdi-titlebar`, `.menu-bar`, and `.taskbar` via CSS `.presenter-mode` without changing the window manager's state machine leaves floating MDI windows un-closable, un-draggable, and able to trap keyboard focus when triggered by hotkeys or double-clicks.
3. **Full-Canvas Need Already Solved**: The workstation already provides `toggleFullMapMode()` (`F11` / `Full Map` toolbar button), which cleanly collapses peripheral docks while preserving window management invariants.
