# 0004: Desktop Workstation Architecture (start.html) with Win95 Chrome and Mod API

## Context
The workstation previously used a dashboard-style landing page (`index.html`) linking across disparate tool pages (`network_builder.html`, `campaign_studio.html`, etc.). To unify campaign pointcrawl authoring into a single high-productivity desktop workstation—inspired by AutoCAD, Photoshop, and classic Visual Basic 6 desktop applications—we require an application container (`start.html`) with beveled 3D chrome, classic menu bar, left tool palette, central pointcrawl canvas, and a bi-directional property grid.

Furthermore, future expansion into setting-specific mechanics requires a formal extension point ("Mod Area") so individual modules can inject tools, menus, and property attributes without polluting the core engine.

## Decision
1. **Preserve `index.html` & Establish `start.html`**:
   `index.html` remains untouched as the dashboard index. `start.html` is introduced as the single-document desktop workstation container.
2. **Authentic Zero-CORS Lightweight Win95/VB6 Chrome**:
   Use a self-contained, lightweight CSS 3D-bevel design system (system fonts, `#008080` teal desktop, `#c0c0c0` grey bevels, zero external CDNs/fonts, zero emojis) ensuring 100% offline functionality.
3. **Modal Startup Dialogue**:
   On launch, display a classic beveled "Welcome to Creator Studio" modal dialog featuring `Continue Last Campaign`, `New Campaign`, `Load / Import Campaign`, and `Settings`.
4. **CAD Menu & Tool Palette**:
   Standard top menus (`File`, `Edit`, `View`, `Insert`, `Tools`, `Mods`, `Help`) and a left CAD palette (Pointer, Pan, Node Tier 2, Node Tier 3, Transit Edge, Hegemony Edge, Eraser, Ruler, Text) with a reserved Mod Tools section.
5. **Two-Column Visual Basic Property Grid**:
   A categorized property inspector (`Property` | `Value`) that immediately binds to the active selection (Node, Link, or Global Campaign) with bi-directional synchronization to local storage.
6. **Tri-Point Mod Area Architecture**:
   Expose `window.CreatorStudio.registerMod(...)` allowing modules to hook into the `Mods` menu, the left tool palette, and the property grid without core modification.
7. **Deferral to Development Tickets**:
   Canvas Layers & Grouping (`SYS-START-01`), advanced in-cell grid editors (`SYS-START-02`), and the extended Module SDK runtime (`SYS-START-03`) are deferred to formal system tickets to avoid unvetted complexity.

## Consequences
- Authors gain an integrated pointcrawl drafting and attribute editing experience in a single view.
- Offline performance is maximized via pure embedded CSS with zero CDN dependencies.
- Third-party modules gain a structured interface to extend the authoring environment.
- Backlog tickets cleanly isolate future layering and advanced editor features.
