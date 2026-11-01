---
file_path: "templates/examples/DND-01_Barovian_Mists_and_the_Vampire_Sovereign.md"
title: "DND-01: The Barovian Mists & The Vampire Sovereign"
volume: "vol-8"
kind: "Technical Documentation / Guide"
current_hash: "24f73fb15b77c9bc"
reviewed_hash: "24f73fb15b77c9bc"
stale: false
size_bytes: 8266
line_count: 83
---

# DND-01: The Barovian Mists & The Vampire Sovereign

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`templates/examples/DND-01_Barovian_Mists_and_the_Vampire_Sovereign.md` is an **Exemplar IP Conversion Module (Gothic Fantasy Archetype)** within **Volume VIII: Campaign Packages, Modules, Templates & Unified Ticket Backlog**. It provides a definitive blueprint for compressing a sprawling 256-page gothic tabletop campaign (specifically Tracy & Laura Hickman's *Ravenloft* / *Curse of Strahd*) into a tightly scoped, system-agnostic pointcrawl governance engine.

Governed by [[File:docs/srd/adventure_framework_srd.md]], [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], and cataloged within [[Series:series_d_module_supply_chains_and_contracts]].

---

## Gothic Fantasy Conversion & Sovereignty Mechanics
The module showcases how narrative villains function as active macro-political network hubs rather than static dungeon bosses:
1. **Topological Edge Manipulation**: Strahd's mastery of the suffocating Barovian mists translates into dynamic graph edge control—allowing the sovereign hub to seal, poison, or reopen transit vectors connecting settlements (Barovia, Vallaki, Krezk).
2. **Dual Societal Resource Stabilizers**:
   - *Wizard of Wines Vintage*: Represents the sole caloric and psionic sedative preventing the soulless population from succumbing to despair riots (tracked via the 4-tick *Wine Starvation* clock).
   - *Chapel Consecration & Sanguine Tithe*: The balance between vampiric blood extraction and church sanctuary fields.
3. **Escalation Output Dials**:
   - **Level 1 (Light Tier / DC 10)**: Creeping Mountain Chill & Corvidae Surveillance.
   - **Level 2 (Moderate Tier / DC 13 / 2d8)**: The Count's Surveillance & Curfew Enforcement.
   - **Level 3 (Severe Tier / DC 16 / 4d10)**: Blood Tithe Demanded & Dire Wolf Raids.
   - **Level 4 (Lethal Climax / DC 20 / 8d12)**: Suffocating Planar Lockdown & Undead Levee Mobilization.

---

## Resource Contracts & Supply Chain Interlocks
- **Module Classification**: **Tier 1 (Macro Network & Sovereign Hub Engine)**. Hub eligibility: `always`.
- **`provides`**:
  - `Authority: Zarovich-Blood-Decree` (allows bearers to navigate military blockades unmolested).
  - `Bio: Wizard-of-Wines-Vintage`.
  - `Soul: Amber-Temple-Vestige-Pacts` (dark boons accompanied by sociological rot).
- **`requires`**:
  - `Bio: Humanoid-Sanguine-Tithe`.
  - `Material: Consecrated-Silver-Relics`.

---

## Dramatic 4-Corner Opposition
- **1. Establishment / Hegemony**: *Lord Strahd von Zarovich & The Boyars* (feudal autocracy, obsession with Tatyana, absolute edge control).
- **2. Main Opponent / Challenger**: *The Keepers of the Feather & Silver Dragon* (avian reconnaissance, underground resistance, paranoid secrecy flaw).
- **3. Thematic Shadow / Profiteer**: *Vistani Caravans & Blood-Wine Smugglers* (inter-planar transit, contraband monopoly, extortion).
- **4. Tertiary Outcast / Victim**: *Soulless Peasantry & Mongrelfolk* (existential apathy, xenophobic scapegoating mobs, numerical bulk).
<!-- END_CUSTOM_NOTES -->
