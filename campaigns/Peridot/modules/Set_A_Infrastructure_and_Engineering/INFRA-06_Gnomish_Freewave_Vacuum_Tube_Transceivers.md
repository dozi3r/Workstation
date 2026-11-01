---
id: INFRA-06
title: Gnomish Freewave Vacuum-Tube Transceivers
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
provides: ["Signal: Freewave-HF-Radio","Chem: Commercial-Sulfuric-Acid"]
requires: ["Power: High-Amperage-DC"]
culture_quadrant: Adhocracy / Clan
operational_profile: Design / Service
mtg_color: Blue / Red
node_prerequisites:
  facility: Concealed Cavern, Workshop Attic, or Subterranean Bunker
  power_source: Lead-Acid Wet Cells or Dynamo Capacitor Bank
  hardware: Copper Vacuum Tubes + Quartz Crystals + Directional Wire Loop
standalone_fallback: "Can function as a crystal detector receiver without batteries; can ONLY listen to high-power broadcasts, cannot transmit."

injected_mechanics:
  signal_quality_dial:
    level_1: "Static Murmur - Heavy atmospheric interference from stirge wings; Morse clicks only."
    level_2: "Readable Audio - Crackling voice; range limited to 2 adjacent nodes."
    level_3: "Clear Broadcast - Resonant, crystal-clear voice across entire regional network."
    level_4: "Overdriven Feedback - Audio howl; burns out filaments; reveals exact transmitter location."
  threat_clocks:
    battery_depletion: "Lead-Acid Battery Clock [6 Ticks] - Rigs require periodic dynamo recharging."
    imperial_intercept: "Triangulation Clock [4 Ticks] - Broadcasters risk imperial directional intercepts."
  yields_resource: "Instantaneous Wireless Intelligence, Smuggler Coordination & Frequency Jamming"
---

# MODULE INFRA-06: GNOMISH FREEWAVE VACUUM-TUBE TRANSCEIVERS

### 1. Telecommunications Architecture

The clandestine wireless communications grid operated by subterranean artificers, bypassing imperial courier checkpoints and hostile wilderness paths.

* **The Freewave Field Rig:** Heavy, brass-reinforced teak case containing three glowing triode vacuum tubes, a lead-acid wet cell, and a quartz crystal oscillator.
* **Three-Tiered Frequency Spectrum:**
  * **3.5 MHz (Coastal Watch):** Fishermen, lighthouse keepers, and harbor watchers.
  * **7.0 MHz (The Free-Net):** Smuggler codes, black-market auctions, and escaped convict alerts.
  * **14.0 MHz (Imperial Command):** Encrypted high-frequency military traffic between governors and archpriests.
* **Directional Loop ("Pinpoint Array"):** Handheld rotating copper wire ring used to measure signal azimuth and triangulate illicit transmissions to within 50 yards.

### 2. GM Socket Placement & Information Warfare
* **Input Dependency:** Needs rechargeable lead-acid batteries (recharged via `INFRA-01`) and spare vacuum tubes.
* **Signal Warfare Actions:**
  * *Eavesdrop Check (2d6):* On 10+, intercept clean enemy battle orders. On 7–9, fragmented intel mixed with static. On 6-, emit a loud receiver squelch alerting listeners.
  * *Frequency Jamming:* Transmit white-noise arc interference, disabling all radio coordination in the node for $1\text{d}4$ hours.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
