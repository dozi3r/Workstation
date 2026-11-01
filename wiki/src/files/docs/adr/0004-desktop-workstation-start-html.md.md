---
file_path: "docs/adr/0004-desktop-workstation-start-html.md"
title: "0004: Desktop Workstation Architecture (start.html) with Win95 Chrome and Mod API"
volume: "vol-1"
kind: "Architectural Decision Record (ADR)"
current_hash: "3440ddd71470230b"
reviewed_hash: "3440ddd71470230b"
stale: false
size_bytes: 2839
line_count: 29
---

# 0004: Desktop Workstation Architecture (start.html) with Win95 Chrome and Mod API

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`docs/adr/0004-desktop-workstation-start-html.md` formalizes the architectural shift from a multi-page dashboard launcher (`index.html`) to an integrated, single-document desktop workstation container (`start.html`) inspired by AutoCAD, Photoshop, and classic Visual Basic 6.

### Key Decision Matrix
1. **Preserve `index.html` & Establish `start.html`**: Retains `index.html` as the web dashboard while establishing `start.html` as the primary authoring workstation.
2. **Pure Offline Win95/VB6 Chrome**: Uses a zero-dependency, self-contained CSS 3D-bevel design system (`#008080` teal desktop, `#c0c0c0` grey bevels, system fonts, zero emojis, zero external CDN scripts) ensuring 100% offline zero-CORS functionality.
3. **Modal Startup Dialogue**: Centered "Welcome to Creator Studio" modal dialog featuring `Continue Last Campaign`, `New Campaign...`, `Load / Import Campaign...`, and `Settings`.
4. **CAD Menu & Tool Palette**: Top menus (`File`, `Edit`, `View`, `Insert`, `Tools`, `Mods`, `Help`) and left palette (Select, Pan, Node T2, Node T3, Transit Road, Hegemony Vector, Erase, Ruler, Text) with a reserved Mod Tools section.
5. **Two-Column VB6 Property Grid**: Categorized inspector (`Property` | `Value`) providing immediate bi-directional binding for nodes, links, and global campaign attributes.
6. **Tri-Point Mod Area Architecture**: Standardized runtime registration hook (`window.CreatorStudio.registerMod`) providing worldbuilding modules with dedicated menu commands, palette tool slots, and property grid fields.
7. **System Backlog Ticket Isolation**: Complex future enhancements are cleanly deferred to formal development tickets (`SYS-START-01`, `SYS-START-02`, `SYS-START-03`).
<!-- END_CUSTOM_NOTES -->
