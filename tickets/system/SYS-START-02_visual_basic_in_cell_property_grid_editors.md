---
id: SYS-START-02
title: "Visual Basic In-Cell Custom Property Grid Editors"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Property Grid In-Cell Controls"
grounded_prerequisites: ["docs/adr/0004-desktop-workstation-start-html.md", "start.html"]
grounded_yields: ["In-Cell Dropdown Menus", "Color Picker Cells", "Modal Tag Collection Editors"]
provides: ["PropertyGrid: In-Cell-Editors", "PropertyGrid: Type-Specific-Renderers"]
requires: ["Surface: start.html"]
standalone_fallback: "Property grid uses standard HTML text/number inputs."
---

# SYS-START-02: Visual Basic In-Cell Custom Property Grid Editors
*Category: system_architecture | Target Surface: `start.html`*
*Status: shipped*

---

## 1. Problem Statement & Scope
In Visual Basic 6 and modern CAD property inspectors, properties have dedicated in-place cell renderers (e.g. dropdown arrows, color pickers, and ellipsis `[...]` buttons that open modal collection builders). The initial version of `start.html` uses direct text/number inputs.

This ticket specifies enhanced, high-precision in-cell controls for complex sociological and topological attributes.

---

## 2. Technical Requirements & Acceptance Criteria
1. **Dropdown Editors (`ComboBoxCell`)**:
   - `Tier`: Restrict to `Tier 2 (Perimeter / Hub Eligible)`, `Tier 3 (Apex / Hazard)`, `Tier 0 (Meta Key)`.
   - `Culture`: Restrict to `Clan`, `Adhocracy`, `Market`, `Hierarchy`.
   - `Operational Profile`: Restrict to `Design`, `Service`, `Produce`, `Deliver`.
2. **Collection Modal Editors (`EllipsisButton [...]`)**:
   - Clicking `[...]` on `adj` (Adjacencies) opens a Win95 checkbox dialog listing all 22 nodes to toggle connections.
   - Clicking `[...]` on `infBy` opens an influence tether modal.
3. **Color & Swatch Editors**:
   - Node badge color and custom marker icon pickers.
