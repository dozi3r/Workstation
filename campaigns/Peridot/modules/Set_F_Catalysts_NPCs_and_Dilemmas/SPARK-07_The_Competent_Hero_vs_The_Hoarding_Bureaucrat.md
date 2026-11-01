---
id: SPARK-07
title: The Competent Hero vs. The Hoarding Bureaucrat
set: Set F (Catalysts, NPCs & Dilemmas)
tier: Tier 4 (Dynamic Narrative Sparks & Dilemmas)
pipeline_tier: 4
provides: ["Dilemma: Outpost-Command-Mutiny"]
requires: ["Sociology: Garrison-Supply-Hoarding"]
culture_quadrant: Hierarchy Crisis
operational_profile: Deliver vs. Produce
mtg_color: White / Black
prerequisites: [Settlement Frontier Garrison, Outpost, or Colonial Stronghold]
standalone_fallback: "Can drop into any starting town where the military commander and civil administrator despise each other."

injected_mechanics:
  factional_schism:
    the_competent_hero:
      name: "Commander Hrolf / Veteran Voss"
      role: "Grizzled disgraced military veteran organizing defenses, fixing walls, and sharing rations."
      motivation: "Keeping the common people alive against swarms and famine."
    the_hoarding_bureaucrat:
      name: "Magistrate Leiderman / Comptroller Vane"
      role: "Cold colonial tax commissioner hoarding medicine, salt, and silver links."
      motivation: "Meeting imperial profit quotas to secure a royal pardon and return home."
  threat_clocks:
    mutiny_countdown_clock: "Garrison Mutiny Clock [4 Ticks] - Soldiers ready to execute the bureaucrat."
  yields_resource: "Faction Loyalty, Military Command Passes & Stashed Colonial Bullion"
---

# MODULE SPARK-07: THE COMPETENT HERO VS. THE HOARDING BUREAUCRAT

### 1. Social Dynamic Catalyst

The archetypal starting settlement dilemma where players are caught between practical battlefield survival and corrupt administrative authority.

* **The Conflict:**
  * **The Hero (Commander Hrolf):** Lacks political authority but has the absolute loyalty of the common soldiers and convict laborers. He needs medicine and ammunition to reinforce the perimeter, but cannot touch the official warehouses without committing treason.
  * **The Bureaucrat (Magistrate Leiderman):** Holds the royal seal and controls the keys to the magazines. He refuses to release supplies without signed imperial requisitions, secretly skimming 30% of all rations for his private fallout yacht.
* **The Player Dilemma:**
  * Helping the Hero mutiny solves the immediate life-support crisis, but brings the wrath of the Imperial Fleet down upon the settlement.
  * Backing the Bureaucrat upholds the law and maintains legitimacy, but forces the convicts to starve and weakens the walls.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
