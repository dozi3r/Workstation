---
id: FACT-06
title: Tactical Bastion Fortification Ranks (Levels 1 to 4)
set: Set C (Faction & Governance)
tier: Tier 2 (Topological & Settlement Anchor)
pipeline_tier: 2
provides: ["Defense: Bastion-Garrison","Security: Fortified-Perimeter-Wall"]
requires: ["Material: Smelted-Alloy","Material: Direct-Reduced-Iron"]
culture_quadrant: Hierarchy / Clan
operational_profile: Produce / Deliver
mtg_color: Colorless / Any Alignment
node_prerequisites:
  location: ANY Node on the Pointcrawl Network (ADR-02)
  resources: Dressed Stone + Timber + Convict Labor + Silver Links
standalone_fallback: "Can represent an abandoned ancient ruined redoubt that players can garrison and slowly rebuild over a campaign."

injected_mechanics:
  fortification_ranks:
    level_1:
      name: "Timber Stockade / Ditch"
      cost: "500 Silver Links + 10 Timber Carts"
      effects: "Halves minor pest attacks; vulnerable to fire; cannot withstand siege catapults."
    level_2:
      name: "Dressed Stone Curtain Wall (20 ft)"
      cost: "2,000 Silver Links + 50 Stone Carts + 1 Month Labor"
      effects: "Complete pest perimeter; iron portcullis; protects garrison from light missile fire."
    level_3:
      name: "Fortified Citadel & Cisterns (40 ft)"
      cost: "5,000 Silver Links + Master Mason + Anti-Iron-Blight Supplies"
      effects: "Withstands multi-month siege; subterranean fallout crypts; projects force 1 node."
    level_4:
      name: "Impregnable Chemical Redoubt (60 ft)"
      cost: "15,000 Silver Links + Dynamo Connection + Arc Smelter Output"
      effects: "Active chemical smokewall ports; arc searchlights; controls regional trade artery."
  threat_clocks:
    siege_attrition_clock: "Siege Supply Clock [8 Ticks] - Tracks grain, arrows, and clean water under siege."
  yields_resource: "Defensible Player Stronghold, Safe Rest Haven & Regional Force Projection"
---

# MODULE FACT-06: TACTICAL BASTION FORTIFICATION RANKS (LEVELS 1 TO 4)

### 1. Architectural Ruleset

While only 14 nodes can achieve macro-political Sovereign Hub status, **any node on the pointcrawl graph can be fortified into a Tactical Bastion** ([ADR-02](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/adr/0002-hub-eligibility-vs-bastions.md)).

* **Bastion Role:** A Bastion is a physical engineering fortification designed to protect life-support systems, seal out stirge swarms, and provide secure resting havens for players and garrisons.
* **Progressive Upgrade Pipeline:** Players or factions can invest surplus silver, stone, and labor to upgrade a settlement through 4 distinct fortification ranks (Levels 1 to 4).
* **Crypt Sub-Levels:** Level 3+ Bastions automatically include subterranean "Hell" vaults chiseled into bedrock, providing fallout shelter during extreme pest swarms or orbital weather cataclysms.

### 2. GM Socket Placement & Downtime Rules
* **Downtime Project:** Players can spend downtime between adventures managing bastion expansion, hiring stonemasons, and digging cistern wells.
* **Siege Resolution:** When besieged, compare the attacker's Siege Force value against the Bastion's Rank; resolve combat on the 8-tick Siege Supply Clock.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
