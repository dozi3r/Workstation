---
id: SYS-RACE-02
title: "Node Ancestry & Demographic Census Schema in Graph Topology"
pipeline_tier: 0
target_surface: "network/generic_network_topology.json & network/network_builder.html"
status: shipped
category: "system_architecture"
wave: "Platform Architecture: Ancestry & System Agnosticism"
grounded_prerequisites: ["network/generic_network_topology.json", "Node detail cards in network_builder.html"]
grounded_yields: ["Demographics schema block on pointcrawl nodes", "Census editor in Network Builder inspector"]
provides: ["Topology: Node-Demographics-Schema", "UI: Node-Inspector-Census-Card"]
requires: ["Surface: network_builder.html", "Topology: generic_network_topology.json"]
standalone_fallback: "Nodes without census data default to homogeneous local population matching the regional Sovereign Hub."
---

# SYS-RACE-02: Node Ancestry & Demographic Census Schema in Graph Topology
*Category: system_architecture | Target Surface: network_builder.html & generic_network_topology.json*
*Status: ready_for_spec*

---

## 1. Executive Problem Statement & Philosophy

When a Game Master designs a pointcrawl graph in Creator Studio, every Node currently tracks:
* Spatial coordinates `[x, y]`
* Structural tier (Sovereign Hub, Major Satellite, Minor Satellite)
* 3D Tarot sociological vector `[S, E, C]` (Structure, Energy, Cohesion)
* Biome and connectivity edges

However, GMs frequently have specific worldbuilding ideas regarding **who lives where** (e.g. "This river junction is 60% human fishermen, 30% river-folk, and 10% mountain goblin refugees"). Without a structured place to record demographic proportions:
1. GMs must maintain external notes outside the tool.
2. The authoring suite cannot cross-reference whether a slotted module (such as a deep-water canal or subterranean warren) makes sociological or physiological sense for that node's inhabitants.

---

## 2. Technical Specification & Schema Contract

### 2.1 Topology Node Extension (`generic_network_topology.json`)
Extend the `nodes` object schema:
```json
{
  "id": "node_01",
  "name": "Ardent Spire",
  "type": "Sovereign Hub",
  "tier": 1,
  "demographics": {
    "primary": {
      "name": "Highland Caldera Human",
      "percentage": 65
    },
    "minorities": [
      { "name": "Deep-Delve Gnomes", "percentage": 25, "traits": ["Darkvision", "Subterranean-Engineering"] },
      { "name": "Nomadic Ash-Striders", "percentage": 10, "traits": ["Heat-Tolerance"] }
    ],
    "social_friction_notes": "Highlanders control civic magistracy; deep-delvers control subterranean aqueducts."
  }
}
```

### 2.2 Network Canvas & Inspector UI Extension (`network_builder.html` & `campaign_studio.html`)
1. **Node Detail Inspector**: Add a "Demographic Census" collapsible accordion card.
2. **Census Quick-Editor**:
   * Add / Remove demographic group chips.
   * Percentage slider bar summing to 100%.
   * Freeform traits badge chips (e.g. `Darkvision`, `Amphibious`, `Flight`).
3. **Module Compatibility Cross-Check**:
   * If a slotted module has `ancestry_requirements.traits` (e.g. `Amphibious`), check if any demographic on that node possesses that trait.
   * If not, display an advisory badge: `⚠️ Environmental Prerequisite Mismatch: Node lacks amphibious population`.

---

## 3. Definition of Done & Acceptance Criteria

- [ ] Node schema extended in `network/generic_network_topology.json`.
- [ ] Inspector UI card authored in `network/network_builder.html`.
- [ ] Compatibility checker integrated into `campaign_studio.html` module slotting view.
- [ ] Build compiled cleanly via `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1`.
