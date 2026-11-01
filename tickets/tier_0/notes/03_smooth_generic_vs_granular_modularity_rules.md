---
title: "Smooth Generic vs Granular Modularity: Technical Rules of Engagement"
author: "Creator Studio Architecture"
domain: "Cross-Cutting System Architecture"
type: "Architectural Rule Specification"
status: "in_research"
---

# 03: Smooth Generic vs Granular Modularity: Technical Rules of Engagement

## 1. The Core Principle
> **"Never force the GM to think about mundane infrastructure unless a crisis makes it dramatic."**

## 2. Technical Implementation in Simulation Engines

### Mode A: Smooth Generic
* In `campaign_studio.html` and `Run-NetworkEngine.ps1`, when `enable_tier_0_substratum: true`:
  * Every node with node type `Settlement`, `Hub`, or `Outpost` has its baseline `Food:`, `Water:`, and `Shelter:` flags satisfied implicitly.
  * No warning badges are thrown for missing low-level survival resources.
  * The recommendation engine prioritizes high-concept Tier 1–5 modules (alchemy, bastions, leylines, politics).

### Mode B: Granular Modularity
* When `enable_tier_0_substratum: false` (or set to "Granular / Survival Mode"):
  * Settlements require explicit Tier 2/3 food and water modules within reachability distance ($k \le 2$ graph hops).
  * Nodes lacking food or water trigger active **Starvation / Drought Clocks**.
  * GMs can socket specific Tier 0 templates (e.g. `T0-DOM-01` or `T0-DOM-02`) directly into node auxiliary sockets.
