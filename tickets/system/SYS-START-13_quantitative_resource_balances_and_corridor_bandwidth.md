---
id: SYS-START-13
title: "Quantitative Resource Accounting & Corridor Capacity Simulation"
pipeline_tier: 0
target_surface: "start.html"
status: shipped
category: "system_architecture"
wave: "Workstation Architecture: Logistics & Supply Flow Simulation"
grounded_prerequisites: ["docs/srd/adventure_framework_srd.md (Section 4)", "tickets/system/SYS-START-08_ad_hoc_resource_supply_flows_and_conduits.md", "src/workstation/scripts/stage_5_slotting.js"]
grounded_yields: ["Quantitative Resource Parser", "Network Flow Balance Calculator", "Corridor Bandwidth & Bottleneck Checker", "Brownout & Deficit Warning Badges"]
provides: ["Logistics: Quantitative-Balances", "Logistics: Corridor-Bandwidth"]
requires: ["Workstation: start.html", "Logistics: Ad-Hoc-Resource-Yields", "Topology: Active-Graph"]
standalone_fallback: "Qualitative boolean presence matching without quantitative balance calculations."
---
# SYS-START-13: Quantitative Resource Accounting & Corridor Capacity Simulation
*Category: system_architecture | Target Surface: `start.html` (`src/workstation/`)*  
*Status: ready*  
*Date: 2026-10-30*

## 1. Overview & Objective
Section 4 of the Universal Adventure Framework SRD establishes formal logistics units for tabletop play: Electrical Power (kW), Chemical Fuel (Drums / Burn Hours), Water ($m^3/s$), and Food/Grain (Rations). However, Creator Studio's current simulation engine (`stage_5_slotting.js`) treats resource tags as purely qualitative boolean strings: if a single mill produces `"Power: 60V-DC-24kW"`, thirty connected arc furnaces requiring that exact string are all marked 100% satisfied (`deficits: 0`). Furthermore, physical corridors have no capacity limits—a narrow mountain footpath can transmit unlimited tons of heavy ore without bottlenecking.

This ticket implements:
1. **Quantitative Resource Tag Grammar**: Parses optional numerical quantities and units embedded in resource tags (`Category: Name [Quantity Unit]`), falling back to qualitative catalyst behavior if no unit is specified.
2. **Network Supply/Demand Balance Engine**: Computes net supply minus consumption across connected graph components ($\Delta = \sum \text{Yield} - \sum \text{Demand}$), identifying quantitative brownouts and deficits.
3. **Corridor Bandwidth & Chokepoint Auditing**: Enforces throughput caps (`edgeRecord.capacity`), warning GMs when transit corridors are overloaded.

---

## 2. Implementation Deliverables

### 2.1 Resource Tag Grammar & Parser (`src/workstation/scripts/stage_5_slotting.js`)
Implement `parseResourceTag(tagStr)`:
```javascript
function parseResourceTag(str) {
  if (!str || typeof str !== 'string') return null;
  const match = str.match(/^([^:]+):\s*([^\[]+)(?:\[\s*(\d+(?:\.\d+)?)\s*([a-zA-Z0-9_\-\/^]+)\s*\])?$/);
  if (!match) return { raw: str, category: 'General', name: str.trim(), quantity: null, unit: null };
  return {
    raw: str.trim(),
    category: match[1].trim(),
    name: match[2].trim(),
    quantity: match[3] ? parseFloat(match[3]) : null,
    unit: match[4] ? match[4].trim() : null
  };
}
```
* **Catalytic / Qualitative Fallback**: If `quantity === null`, the resource functions as an infinite qualitative prerequisite (e.g. `Tech: Machine-Tooling`). If `quantity` is specified, it participates in quantitative tallying.

### 2.2 Balance Accounting & Deficit Engine
In `auditAllSupplyLines()`:
1. For each connected component or reachable partition:
   - Group quantitative tags by canonical key (`category + ':' + name + ':' + unit`).
   - Tally Total Yield:
     $$S_{\text{total}} = \sum \text{node.provides.quantity} + \sum \text{slotted.provides.quantity}$$
   - Tally Total Demand:
     $$D_{\text{total}} = \sum \text{node.requires.quantity} + \sum \text{slotted.requires.quantity}$$
   - Net Balance:
     $$\text{Balance} = S_{\text{total}} - D_{\text{total}}$$
2. **Deficit Evaluation**:
   - If $\text{Balance} < 0$, flag **Quantitative Deficit** on consumer nodes:
     - Warning: `⚠️ Deficit: Demanded 36 kW, Available 24 kW (Shortage: -12 kW)`.
     - Suggest brownout / stasis consequence per Adventure Framework SRD.

### 2.3 Corridor Throughput & Bandwidth Limits
1. In `property_grid_inspector.js`, when inspecting a corridor edge, expose:
   - `Throughput Capacity` (Options: `Unbounded (Default)`, `10 Units (Footpath)`, `25 Units (Cart Road)`, `50 Units (Paved Highway)`, `100 Units (Railway / Canal)`).
2. When evaluating resource flow through a corridor, sum the transmitted quantities:
   - If `transmittedFlow > edgeRecord.capacity`, flag corridor warning:
     `⛔ Bottleneck: Corridor overloaded (Flow: 45 / Cap: 25 Units). Transit hazard escalated!`

### 2.4 UI Badges & Recommendation Engine Integration
1. Display quantitative surplus/deficit meters in the Property Grid `[ Local Resource Logistics ]` category.
2. Upgrade `calculateRecommendationScore` in `stage_5_slotting.js`: Award higher recommendation points to modules that produce the exact quantitative shortage needed by an adjacent cluster.

---

## 3. Verification & Testing Criteria
1. **Unit Test Coverage (`test/run_tests.js`)**:
   - Parse tag `"Power: Geothermal-Steam [24 kW]"`: assert `quantity === 24` and `unit === 'kW'`.
   - Node 1 provides `24 kW`, Node 2 demands `10 kW`, Node 3 demands `20 kW`.
   - Run audit: assert total demand `30 kW`, total supply `24 kW`, deficit `-6 kW` flagged on Node 3.
   - Set corridor capacity between Node 1 and Node 2 to `5 kW`: assert bottleneck detected.
2. **Zero-CORS Compliance**:
   - Ensure pure client-side mathematical calculation with zero external libraries.
