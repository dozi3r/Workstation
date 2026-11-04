---
id: SYS-BACKBURNER-02
title: "Google Drive Desktop & Virtual Directory File-Lock Hardening (Deferred)"
pipeline_tier: 0
target_surface: "server.js, server.ps1 (Loopback Persistence Layer)"
status: discovery
category: "system_architecture"
wave: "Backburner / Phase 2 Deferred"
grounded_prerequisites: ["Atomic temp-file + rename writes in server.js and server.ps1"]
grounded_yields: ["Retry-with-backoff rename wrapper for cloud-synced virtual filesystems"]
provides: ["Backburner: Cloud-Sync-Lock-Resilience"]
requires: ["Server: Loopback-Atomic-Write"]
standalone_fallback: "Local filesystem and Git repositories operate with atomic temp-file writes and zero lock contention."
---

# SYS-BACKBURNER-02: Google Drive Desktop & Virtual Directory File-Lock Hardening (Deferred)
*Category: system_architecture | Target Surface: `server.js`, `server.ps1`*
*Status: discovery (Backburner / Deferred)*

---

## 1. Executive Summary & Deferral Rationale

When a workspace directory is mounted inside a virtual cloud-sync drive (such as Google Drive for Desktop `G:\` or OneDrive), background cloud indexers briefly acquire read locks on newly written `.tmp` files, which can occasionally cause `fs.renameSync` to throw `EPERM` or `EBUSY` on Windows.

### Why This Remains on the Backburner
1. **Git-First Workflow**: Creator Studio workspaces are tracked via local Git repositories rather than live-mounted Google Drive virtual folders.
2. **Low-Risk Enhancement**: If cloud-folder hosting is needed in the future, a 3-attempt exponential backoff (50ms, 150ms, 300ms) around `fs.renameSync` in `server.js` can be added without architectural changes.
