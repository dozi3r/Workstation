---
id: SYS-START-11
title: "Interactive Canvas Threat Clocks & Live Tabletop Travel Hazard Roller"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Live Tabletop Play Runtime"
grounded_prerequisites: ["docs/srd/adventure_framework_srd.md", "src/workstation/scripts/cad_canvas_renderer.js", "src/workstation/scripts/cad_interaction.js", "src/workstation/scripts/property_grid_inspector.js"]
grounded_yields: ["Interactive SVG Threat Clock Ticks", "Threat Escalation Alarm Banner", "1-Click Corridor Hazard Roller", "Encounter Resolution Dialog"]
provides: ["Runtime: Interactive-Clocks", "Runtime: Hazard-Roller", "Adventure: Encounter-Resolution"]
requires: ["Workstation: start.html", "Topology: Active-Graph", "AdventureFramework: Severity-Tiers"]
standalone_fallback: "Modal-only manual numeric editing of tracker ticks and static hazard text."
---
# SYS-START-11: Interactive Canvas Threat Clocks & Live Tabletop Travel Hazard Roller
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-10-30*

## 1. Overview & Objective
Creator Studio campaigns are authored to be executed at the gaming table. However, currently threat clocks on the canvas are merely draggable graphic overlays (`onClockCalloutMouseDown` in `cad_interaction.js`); a GM cannot tick or untick a clock directly on the map during play without opening the Entity Manager modal (`Ctrl+K`), searching the tracker, and updating numeric fields. Furthermore, while transit corridors define hazard levels (0–3) and ODV friction deltas ($\Delta \ge 5$), there is no mechanism to resolve player travel checks, roll hazard dice, or determine encounter complications.

This ticket implements:
1. **Interactive Canvas Threat Clocks**: Direct click handlers on SVG clock segments to increment, decrement, and visually trigger alarms when clocks reach capacity.
2. **Live Tabletop Corridor Hazard Roller**: A 1-click **[ 🎲 Roll Travel Hazard & Check ]** tool in the Property Grid and corridor context menu that calculates DCs, simulates dice throws (d20 / 2d6), rolls damage, and presents dynamic encounter complications.

---

## 2. Implementation Deliverables

### 2.1 Interactive SVG Threat Clocks (`src/workstation/scripts/cad_canvas_renderer.js` & `cad_interaction.js`)
1. **Segment Markup**:
   In `cad_canvas_renderer.js`, render each segment of the threat clock callout with explicit data attributes and hover styling:
   ```html
   <rect class="threat-tick-segment" data-clock-id="${tracker.id}" data-segment-idx="${i}"
         fill="${i < currentTicks ? '#ef4444' : '#1e293b'}"
         stroke="#64748b" stroke-width="1"
         style="cursor: pointer; transition: fill 0.15s ease;" />
   ```
2. **Click & Alarm Interaction**:
   In `cad_interaction.js`, add `handleClockSegmentClick(e, trackerId, segmentIdx)`:
   - If `segmentIdx === currentTicks - 1`: Decrement ticks by 1 (untick).
   - If `segmentIdx >= currentTicks`: Increment ticks to `segmentIdx + 1`.
   - If `currentTicks >= totalTicks`:
     - Add CSS class `threat-clock-breached` (red pulsing border glow).
     - Emit system alert: `setStatusBarMessage("⚠️ THREAT TRIGGERED: " + tracker.name + " is fully escalated!")`.
     - Trigger Win95 alert banner or audio click chime (optional synthesis).
   - Call `saveActiveCampaign()` and `Workstation.history.push("Tick Clock: " + tracker.name)`.

### 2.2 Live Travel Hazard & Encounter Roller (`src/workstation/scripts/property_grid_inspector.js`)
Under `Route Encounters & Backlog` (`property_grid_inspector.js:1455`), append an active tabletop resolution widget:
1. **Inspection Action**:
   ```javascript
   appendActionPropRow(tbody, '🎲 Travel Check', 'Resolve Corridor Transit...', () => {
     openCorridorHazardDialog(uId, vId, edgeRecord);
   });
   ```
2. **Hazard Calculation Logic**:
   - Severity Level: Read `edgeRecord.hazardLevel || 0` (0: Safe, 1: Light, 2: Moderate, 3: Severe, 4: Lethal).
   - Sociological Friction: Compute endpoint ODV delta:
     $$\Delta = |S_u - S_v| + |E_u - E_v| + |C_u - C_v|$$
     If $\Delta \ge 5$, escalate baseline hazard by $+1$ tier (e.g., Light $\to$ Moderate).
   - Adventure Framework Standard Targets:
     - **Light**: DC 10 / 2d6 target 6+ / Damage: 1d6 (3 avg) / Minor delay.
     - **Moderate**: DC 13 / 2d6 target 8+ / Damage: 2d8 (9 avg) / +1 Threat Tick.
     - **Severe**: DC 16 / 2d6 target 10+ / Damage: 4d10 (22 avg) / Corridor blockage.
     - **Lethal**: DC 20 / 2d6 target 12+ / Damage: 8d12 (52 avg) / Catastrophic collapse.
3. **Win95 Resolution Modal (`#modal-travel-resolution`)**:
   - Displays simulated dice rolls (d20 check vs DC, or 2d6 PbtA style).
   - Lists incident narrative spark from slotted corridor modules or sociology table.
   - 1-Click quick actions:
     - `[ +1 Tick to Incident Threat Clock ]`
     - `[ Block Corridor (Sever Route) ]`
     - `[ Dismiss / Party Succeeded ]`

---

## 3. Verification & Testing Criteria
1. **Unit Test Coverage (`test/run_tests.js`)**:
   - Render clock with 4 ticks; trigger click on segment 2; assert `currentTicks === 3`.
   - Trigger click on segment 2 again; assert `currentTicks === 2`.
   - Assert `isThreatTriggered` returns true when `currentTicks === 4`.
   - Test hazard rating calculation: assert node pair with $\Delta = 6$ escalates Moderate (2) to Severe (3).
2. **Zero-CORS Offline Execution**:
   - Verify all modal dialogs render via native DOM elements and CSS bevels without external libraries.
