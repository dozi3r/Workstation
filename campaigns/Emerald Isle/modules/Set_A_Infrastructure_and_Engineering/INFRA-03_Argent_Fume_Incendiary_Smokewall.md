---
id: INFRA-03
title: The "Argent-Fume" Incendiary Smokewall Barrier
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Defense: Acetylene-Smoke-Screen","Defense: Stirge-Swarm-Immunity"]
requires: ["Chem: CaC2-Carbide-Pellets","Water: Distilled-Potable-Water"]
culture_quadrant: Hierarchy / Clan
operational_profile: Deliver / Produce
mtg_color: White / Blue
node_prerequisites:
  perimeter: Defensible Settlement Enclosure or Bastion
  chemical_fuel: Calcium Carbide Drums (INFRA-02) + Water Drip
  structure_tier: Fortified Masonry Rampart (Minimum 30-ft Height)
standalone_fallback: "If carbide supplies are severed, braziers can be converted to crude sulfur-pitch smudge pots; defense reduced from Level 4 to Level 2 (burns local fuel; protects only against minor stirge scouting probes, vulnerable to swarms)."

injected_mechanics:
  wall_defense_dial:
    level_1: "Pilot Flukes Only - Low sulfur pilot flames; perimeter vulnerable to night swarm."
    level_2: "Smoke Smudge Mode - Heavy pitch smoke; repels 1d6 swarms; visibility impaired."
    level_3: "Full Argent-Fume Ignition - 60-ft searing sparking white flame; 100% stirge immunity."
    level_4: "Overpressure Flare - Maximum carbide feed; wall emits concussive blasts and blinding flash."
  threat_clocks:
    fuel_depletion_clock: "Fuel Reserve Clock [8 Ticks] - Without shipments, carbide lasts 48 hours."
    burst_disk_overpressure: "Masonry Pressure Clock [4 Ticks] - Chimney clogs risk explosive wall rupture."
  yields_resource: "Total Settlement Airborne Immunity from Crystalline Pest Swarms"
---

# MODULE INFRA-03: THE "ARGENT-FUME" INCENDIARY SMOKEWALL BARRIER

### 1. Fortification Architecture

The primary life-support barrier protecting human settlements from aerial stirge extinction.

* **60-Foot Hollow Masonry Rampart:** Thick stone curtain with a hollow, pitch-sealed interior flue core.
* **Lead-Lined Reaction Troughs:** Buried chambers at wall base metered with calcium carbide and silver flakes via hand-cranked rotary hoppers. Controlled water drips trigger violent effervescence:
  $$\text{CaC}_2 + 2\text{H}_2\text{O} \longrightarrow \text{C}_2\text{H}_2 \text{ (Acetylene Gas)} + \text{Ca(OH)}_2 \text{ (Slaked Lime)}$$
* **Silver Updraft & Brazier Crest:** Bubbling acetylene gas carries microscopic silver flakes up the chimneys. Vents through ceramic nozzles beneath iron braziers filled with rendered whale oil and sulfur, igniting into a blinding, crackling 60-foot white flame screen.
* **Safety Relief:** Spring-loaded interior masonry "burst disks" vent excess pressure into courtyard blast trenches if nozzles clog.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes Calcium Carbide from `INFRA-02` and Silver Flake from convict mining.
* **Failure State:** If upstream supply lines are severed, the settlement has **48 hours (8 ticks on the Fuel Clock)** before the wall goes dark and millions of stirges breach the perimeter.

### 3. Vague Game Mechanics
* **Pest Immunity:** As long as the wall burns at Level 3+, flying pest swarms cannot cross the perimeter; silicon wings shatter in the intense silver thermal updraft.
* **Smokewall Sabotage Check:** Closing the water metering valves drops the wall by 1 defense level per 10 minutes.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
