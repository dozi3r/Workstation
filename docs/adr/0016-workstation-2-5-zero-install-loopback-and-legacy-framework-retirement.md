# ADR 0016: Workstation 2.5 Zero-Install Loopback Architecture and Legacy Framework Retirement

## Status
Accepted (2026-10-31)

## Context
Creator Studio originated as a zero-CORS, single-file desktop application executing strictly via the `file:///` protocol. While this guaranteed complete offline portability without requiring a local web server, modern browser security policies increasingly penalize `file:///` origins:
1. **Opaque Origin Restrictions**: Local `file:///` pages run in an opaque origin (`origin: null`), preventing standard cross-document messaging and cross-window storage sharing.
2. **Canvas Readback Tainting**: Modern Chromium and WebKit browsers flag HTML `<canvas>` elements as tainted when exporting raster graphics with local images under `file:///`, breaking high-resolution pointcrawl map exports.
3. **Partitioned Storage Ephemerality**: In-browser IndexedDB and localStorage partitions under `file:///` are frequently swept or isolated across browser sessions and tabs.
4. **File System Access API Sandbox Boundaries**: Direct disk synchronization (`showDirectoryPicker`) requires modern permissions that are best exercised in a verified Secure Context (`window.isSecureContext === true`).

In response, the experimental Workstation 2.0 rewrite introduced a zero-install local loopback server (`server.js` and pure PowerShell `.NET` `server.ps1`), binding to `127.0.0.1` and granting the workstation full Secure Context privileges. However, core feature development continued in the original Workstation repository (introducing CAD drawing tools, threat clocks, trans-scale portal logistics, and ADR 0015 nested backlinks).

Simultaneously, the codebase accumulated legacy artifacts that hindered authoring flexibility:
- **Abandoned Fixed-22 Topologies**: Vestigial 22-node datasets (`generic_network_topology.json` and `generic_archetype.json`) created confusion alongside the canonical 59-node Emerald Isle campaign package.
- **Tarot Modulo-22 Mathematical Fallback**: Untagged nodes defaulted to Tarot Major Arcana card modulo arithmetic (`(id - 1) % 22`), imposing a mystical framework onto system-agnostic pointcrawls.
- **Campaign Directory Nesting Defect**: Selecting a direct campaign folder (such as `campaigns/Emerald Isle`) during disk operations caused `map_store.js` to create a recursive subfolder `campaigns/Emerald Isle/emerald_isle/` and duplicate 5MB of assets due to case mismatch between folder names and slugs.

## Decision

### 1. Dual-Runtime Architecture (Loopback + Zero-CORS Offline)
Workstation 2.5 unifies the cutting-edge application codebase with the zero-install dual-engine loopback launcher:
- **Node.js Engine (`server.js`)**: High-performance HTTP static server with dynamic port hunting (8080..8100), MIME resolution, CORS headers, and `/api/shutdown`.
- **Native Windows Fallback (`server.ps1`)**: Pure PowerShell `.NET System.Net.HttpListener` implementation ensuring loopback execution on any standard Windows machine without Node.js or administrator privileges.
- **Zero-CORS Invariant Preservation**: Standalone offline execution via direct double-click of `start.html` (`file:///`) remains fully functional and first-class without errors.
- **Origin-Aware UI**:
  - The status bar displays a protocol indicator (`#sb-origin`) reflecting `[⚡ Loopback :<port>]` in Secure Contexts or `[📁 Offline file://]` under standalone mode.
  - The File menu features an `Exit Workstation (Stop Server)` action that sends a POST to `/api/shutdown` when on HTTP, and provides a clear close dialog under `file:///`.
  - Standard keyboard shortcuts (`Ctrl+C`) remain strictly reserved for browser clipboard copy.

### 2. Retirement of Fixed-22 Topologies & Tarot Fallbacks
- **Purge Vestigial Topologies**: Deleted `network/generic_network_topology.json` and `network/presets/generic_archetype.json`.
- **Clean Slate Starter**: Introduced `network/presets/blank_canvas.json` (0 nodes, 0 edges, root map) and registered it as a 1-click option in the New Campaign Wizard.
- **Mathematical ODV Baseline**: Untagged nodes in `src/workstation/scripts/sociology_data.js` resolve to Competing Values Framework (CVF) culture quadrants (`Clan -> [3, 2, 2]`, `Adhocracy -> [3, 3, 3]`, `Market -> [2, 3, 2]`, `Hierarchy -> [2, 2, 2]`) and default to the neutral mathematical centroid `[2, 2, 2]` ("The Deliberative Concord" in `ODV_MATRIX_64`).
- **Mod Registration Hook**: Expose `window.CreatorStudio.registerOdvFallbackResolver(fn)` allowing external mods (e.g., custom Tarot or astrological decks) to supply custom node disposition mapping.
- **Retire Monolithic Tarot Compendiums**: Removed `sociology/08_Tarot_Sociology_Matrix.md` and `09_Minor_Arcana_Edge_Matrix.md` from core distribution, preserving them in external backup for a future optional workstation mod.

### 3. Campaign Directory Nesting Guard
In `src/workstation/scripts/map_store.js` and `mdi_window_manager.js`:
- Direct campaign directories are classified via `dirLooksLikeCampaign(handle)` and slug-normalized comparison (`slugifyCampaignName(rootHandle.name) === slug`).
- When saving to an active direct campaign directory, the engine writes directly to `rootHandle` without creating a duplicate child directory.
- Single campaign directories are never bound to `window.campaignsRootDirectoryHandle`.

## Consequences

### Positive
- Modern browser security errors, canvas readback export tainting, and storage partition wiping are eliminated under loopback mode.
- Users without Node.js can launch instantly using native Windows PowerShell/.NET.
- Zero-CORS offline execution via `file:///` remains completely intact.
- The New Campaign Wizard supports clean pointcrawl creation without cloning Emerald Isle.
- 417 headless unit tests pass with 100% compliance across all 19 suites.
- Recursive duplicate folder creation is permanently prevented.

### Negative / Trade-offs
- The core workstation no longer ships bundled Tarot Major Arcana card names; users desiring Tarot hermeneutics must install the upcoming Tarot Mod via `window.CreatorStudio.registerMod()`.
