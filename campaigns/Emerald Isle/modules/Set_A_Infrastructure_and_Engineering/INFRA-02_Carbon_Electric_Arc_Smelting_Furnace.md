---
id: INFRA-02
title: Carbon Electric Arc Smelting Furnace
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Material: Smelted-Alloy","Chem: CaC2-Carbide-Pellets"]
requires: ["Power: High-Amperage-DC","Material: Direct-Reduced-Iron"]
culture_quadrant: Hierarchy / Market
operational_profile: Produce / Design
mtg_color: Red / Black
node_prerequisites:
  power_source: High-Amperage Electrical Dynamo (INFRA-01)
  raw_feedstock: Quicklime (CaO) + Crushed Metallurgical Coke (C)
  facility_tier: Industrial Foundry or Sovereign Hub
standalone_fallback: "If power grid is severed, can be converted into a coal-blast cupola furnace; temperature drops from 4500°F to 2200°F, capable of casting iron tools but CANNOT synthesize Calcium Carbide."

injected_mechanics:
  furnace_temperature_dial:
    level_1: "Preheat Mode (1500°F) - Electrodes retracted; crucible warming on wood fire."
    level_2: "Active Arc Smelt (4500°F) - Continuous blinding lightning arc; synthesis active."
    level_3: "Overcharged Flare (5200°F) - Extreme molten boil; crucible cracking hazard."
    level_4: "Thermal Breach - Firebrick melts; molten carbide spills into foundry floor."
  threat_clocks:
    carbon_monoxide_buildup: "CO Gas Clock [6 Ticks] - Toxic gas builds up if ventilation stalls."
    firebrick_degradation: "Crucible Wear Clock [8 Ticks] - Firebrick lining erodes under high heat."
  yields_resource: "Calcium Carbide (CaC2) Pellets & Slagged Silver Byproducts"
---

# MODULE INFRA-02: CARBON ELECTRIC ARC SMELTING FURNACE

### 1. Metallurgical Architecture

The Electric Arc Furnace is the sole chemical foundry on the island capable of fusing raw refractory minerals into volatile ammunition.

* **Refractory Crucible:** Firebrick bowl bound by heavy wrought-iron hoops, holding up to 500 lbs of dry charge.
* **Suspended Carbon Electrodes:** Twin 4-inch cylinders of pressed synthetic carbon lowered via hand-cranked worm gears. When energized by the DC Dynamo (`INFRA-01`), current jumps the gap, generating a sustained **4,500°F (2,480°C)** lightning arc.
* **Chemical Synthesis:**
  $$\text{CaO (Quicklime)} + 3\text{C (Coke)} \xrightarrow{4500^{\circ}\text{F}} \text{CaC}_2 \text{ (Calcium Carbide)} + \text{CO (Carbon Monoxide)}$$
* **Jaw-Crusher & Silver Tumbler:** Molten carbide cools into grey slate-like ingots, crushed in mechanical jaw-crushers to pea-gravel pellets, and tumbled with fine convict silver flake.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes Quicklime barged from coastal bluffs and Coke hauled from foothill collieries. Powered by `INFRA-01`.
* **Output Transmission:** Produces sealed drums of Calcium Carbide pellets required to fuel the **Argent-Fume Smokewall (`INFRA-03`)**.

### 3. Vague Game Hazards
* **Smoked-Glass Requirement (Arc-Blindness):** Viewing the naked electric arc without smoked-quartz goggles causes immediate blindness for $1\text{d}6$ hours (Tag: *Arc-Blind*).
* **Carbon Monoxide Gas:** The reaction vents copious carbon monoxide. If ventilation fans stall, workers advance 1 tick every 10 minutes on the CO Clock (headache $\to$ nausea $\to$ death).

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
