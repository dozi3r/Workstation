---
file_path: "src/workstation/scripts/property_grid_inspector.js"
title: "property_grid_inspector.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "fe8daa1574fddf77"
reviewed_hash: "fe8daa1574fddf77"
stale: false
size_bytes: 228343
line_count: 4762
---

# property_grid_inspector.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/property_grid_inspector.js` provides the Visual Basic 6 / Delphi styled two-column Property Grid dock for inspecting, editing, and auditing nodes, transit corridors, hegemony vectors, and global campaign parameters.

### Core Subsystems & Responsibilities
- **Object Selection Architecture**: Synchronizes selected entity context (`selectNode`, `selectEdge`, `selectShape`, `deleteShape`, `selectGlobal`) with the dock dropdown selector (`updateObjectSelector`, `onObjectSelectorChange`).
- **CAD Vector Shape Inspector**: Dedicated property inspection for drawn vector shapes (`type: 'shape'`), supporting geometry (X, Y, Width, Height, Radius, X2/Y2 endpoints), layer assignment, fill/stroke colors, stroke style (solid, dashed, dotted), opacity slider, and lock toggles.
- **VB6 Two-Column Property Engine**: Renders collapsible category rows and editable attribute rows across:
  - *Topology*: Node ID, name, tier, type, AutoCAD layer index color.
  - *Geometry*: Coordinates (X, Y), position lock, player fog-of-war concealment.
  - *Sociology & Alignment*: 3D Granular Disposition `[S, E, C]`, CVF Cultural Quadrant, Operational Profile (`Design`, `Service`, `Produce`, `Deliver`), and Tarot deck associations.
  - *In-Cell Custom Editors (`SYS-START-02`, `SYS-START-08` & `SYS-START-09`)*: Provides specialized VB6 property cell renderers including dropdown selectors (`appendSelectPropRow`), extensible editable comboboxes with dynamic datalists (`appendComboboxPropRow`), inline color swatch + hex editors (`appendColorPropRow`), `[...]` ellipsis modal collection builders (`appendEllipsisPropRow`, `openNodeCollectionModal`, `openResourceTagModal`) for bidirectional `adj`, directional `infBy`, ad-hoc node `provides`/`requires`, and edge `dedicatedFlows` conduits, plus 1-click `promoteNodeEndowmentsToModule` promotion into Custom Module Studio.
  - *Hierarchical Cartography*: Associated nested sub-maps, portal links, and sub-submap anchors.
  - *Campaign Narrative Anchors*: Assigned NPCs, active quests, stationed items, local threat clocks, and stationed Bestiary creatures (direct + recursive sub-map creatures) with one-click jump to inspect each creature in the Bestiary tab.
  - *Corridor / Edge Telemetry*: Transit distance, operational status, hazard levels, transit modules, hegemony vectors, and patrolling/roaming creatures, dynamically populated with setting-agnostic patrol factions dynamically populated from `getCampaignFactionSuggestions()` via `appendComboboxPropRow` preserving arbitrary custom factions losslessly.
  - *Demographics & Geopolitics (ADR-0015 v2)*: Renders demographic census readouts, in-cell tag chips (`appendChipInputPropRow`) for peoples and faction presence with datalist suggestions, controlling faction selectors, and party rapport editors (`appendPartyRapportPropRow`) across nodes and non-hegemony corridors.
  - *Dynamic Mod Hooks*: Injects third-party mod inspector fields seamlessly into active property categories.
- **Bi-Directional Wiki Link Inspector**: Parses and renders embedded `[[Token]]` backlinks (`appendBacklinksPropRow`) with live navigation into the technical manual, grouping direct citations alongside scale-fluid sub-map and stationed entity citations (`↳ via ...`).
- Gigerenzer suite (ADR 0024): appendHazardOpticsRows adds percentage / natural-frequency hazard display, editable scout rates, and a copyable odds sheet under Hazard Rating.
- Gigerenzer suite (ADR 0024): node property grid has a Dread Risk What-If section (run and clear buttons).
- **Entity Explorer Property Grid Parity (`renderEntityExplorerProperties`)**: Extends property inspection to all campaign entities:
  - *Creatures*: Threat Tier, Kind, Stationed Lair Node, Roaming Scope, Dread Index, Capabilities, Immunities, and 1-click Bestiary jump button.
  - *Resources*: Category, Supply Tier, Stationed Depot Node, Price Index, and 1-click Resource Catalog jump button.
  - *Items*: Condition/Status dropdown (`intact`, `damaged`, `depleted`, `attuned`, `lost`, `destroyed`) and Valuation/Price index.
  - *Factions*: Operational Status dropdown, 4-Axis Power Matrix (`Reach`, `Force`, `Wealth`, `Secrecy`), and Territory Size / Affiliated Members readouts.
  - *NPCs*: Expanded Four-Corners literary roles, Dialogue Hooks, Secrets Known, and Tactical Leverage readouts.
<!-- END_CUSTOM_NOTES -->
