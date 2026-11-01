---
id: SYS-START-03
title: "Module Extension SDK & Runtime Mod Hook Provider"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Dynamic Worldbuilding Module Extensibility"
grounded_prerequisites: ["docs/adr/0004-desktop-workstation-start-html.md", "start.html", "CONTEXT.md"]
grounded_yields: ["Dynamic Mod Registry", "Sandboxed Execution Lifecycle", "Custom Module UI Injections"]
provides: ["Extensibility: Mod-SDK", "Extensibility: Runtime-Hook-Provider"]
requires: ["Surface: start.html"]
standalone_fallback: "Core workstation executes without active external modules."
---

# SYS-START-03: Module Extension SDK & Runtime Mod Hook Provider
*Category: system_architecture | Target Surface: `start.html`*
*Status: shipped*

---

## 1. Problem Statement & Scope
As distinct worldbuilding modules (`modules/` and `campaigns/*/modules/`) are authored, individual modules will require bespoke interactive tools (e.g. subterranean fungal bloom propagation calculators, custom clock counters, or regional weather roll tables).

This ticket establishes the formal contract for the **Module Extension SDK**, allowing modular campaigns to inject custom tools, menu items, and properties into `start.html`.

---

## 2. Technical Requirements & Acceptance Criteria
1. **Global Registration API**:
   - `window.CreatorStudio.registerMod({ id, name, version, menuItems, paletteTools, customProperties, onInit, onSelect })`.
2. **Menu Ingestion**:
   - Dynamically inject items into the `Mods` menu on the menu bar.
3. **Palette Tool Registration**:
   - Add tool buttons with custom cursor handlers to the `Mod Tools` section of the left palette.
4. **Property Grid Extensions**:
   - Inject custom categories and properties under `[Mod Extensions]` when selected nodes have corresponding module tags.
5. **Zero-CORS Offline Safety**:
   - Module scripts must load locally via `<script>` injection or bundled manifests without external network calls.
