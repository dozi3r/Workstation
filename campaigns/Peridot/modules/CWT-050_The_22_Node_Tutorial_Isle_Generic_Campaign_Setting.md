---
id: CWT-050
title: The 22-Node 'Tutorial Isle' Generic Campaign Setting (Levels 1-6)
set: Wave 5 Campaign Presets & Sandboxes
tier: Tier 1 (Macro Network & Governance Engine)
pipeline_tier: 1
provides: ["Preset: Generic-Tutorial-Isle-22Node", "Playbook: Level-1-6-Starter-Sandbox"]
requires: ["System: Authoring-Engine-Core"]
culture_quadrant: All Quadrants (Universal)
operational_profile: Design / Deliver
mtg_color: WUBRG
standalone_fallback: "If advanced high-tier modules are unslotted, Tutorial Isle operates completely self-contained on its 6 Starter primitives and Tier 0 settlement substratum, delivering a seamless Level 1-6 sandbox progression without external dependencies."
injected_mechanics:
  output_dial:
    level_1: "Peaceful Frontier Borderlands - Prosperous coastal trade; sunny harvesting; occasional wandering wolves or goblin scouts (Light Tier, DC 10 Survival)."
    level_2: "Rising Seam Friction - Night curfews imposed; double tariffs on highway bridges; scattered missing merchant wagons (Moderate Tier, DC 13 Perception)."
    level_3: "Frontier Incursion Siege - Clay pit warrens erupt; outlying farmsteads burn; pirates blockade harbor entrance (Severe Tier, DC 16 Tactics / 4d10 damage)."
    level_4: "Total Island-Wide Bedrock Shatter - Ancient barrow seals collapse; undead revenants storm town walls; sovereign garrison falls into total crisis (Lethal Tier, DC 20 Survival / 8d12 combat)."
  threat_clocks:
    goblin_raid_escalation: "Warren Incursion Escalation Clock [4 Ticks] - Skirmishing raiding bands converge on the town perimeter."
    barrow_seal_fracture: "Ancient Barrow Seal Fracture Clock [6 Ticks] - Necrotic miasma seeps from the sealed tomb chambers."
  yields_resource: "22-Node Topology Blueprint, Level 1-6 Adventure Hooks, System-Agnostic Campaign Sandbox"
---

# MODULE CWT-050: THE 22-NODE 'TUTORIAL ISLE' GENERIC CAMPAIGN SETTING

### 1. Mechanical Architecture & Sandbox Topology
Designed as a universal, system-agnostic onboarding canvas inspired by classic computer RPG starting zones (such as *Might & Magic III: Isles of Terra* and classic frontier borderlands), the 22-Node Tutorial Isle provides a complete laboratory for pointcrawl gameplay. Structured across three concentric geographic rings—the Coastal Harbor Basin (Nodes 01–06), the Interior Farmland & River Valleys (Nodes 07–15), and the High Mountain & Barrow Wilderness (Nodes 16–22)—the setting delivers clean pacing from level 1 rat-catchers to level 6 provincial saviors.

* **Ring 1: Safe Harbor & Sovereign Seat (Nodes 01–06):** The bustling port town, flour watermill, coastal sea cave, and town watch barracks. Low hazard tiers, clear barter economies, and explicit guild quests.
* **Ring 2: Agrarian Flumes & Bandit Corridors (Nodes 07–15):** Terraced rice flumes, iron slag pits, and goblin warrens where trade conflicts and supply severed edges emerge.
* **Ring 3: The Barrow Wilds & Glacial Spire (Nodes 16–22):** Ancient cairns, deep aquifers, and solitary stargazer peaks harboring esoteric planar threats and climax engines.

### 2. Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Harbor Bailiff & Merchant Watch):** Overworked port administrators striving to maintain law and grain prices while undermanned against expanding frontier incursions.
* **Main Opponent (The Warren War-Chiefs & Highway Brigands):** Displaced human deserters and organized goblin clans uniting under an aggressive warlord to reclaim ancestral island pastures.
* **Thematic Shadow (The Smuggler & Contraband Syndicate):** Corrupt harbor merchants operating out of hidden sea caves, selling military crossbows and poison to the highest bidder.
* **Tertiary Outcast (The Barrow Keepers & Wayside Hermits):** Vow-bound hermits living in moss-covered stone cells along the high ridge, desperately warning indifferent townsfolk of cracking necromantic seals.

### 3. GM Placement & Tactical Synergies
* **Placement:** Operates as the **Primary Setting Macro-Preset** (`campaigns/generic_starter/preset.json`), establishing graph topology, default node coordinates, and 22 canonical links.
* **Supply Chain Interlocks:** Integrates all starter supply tokens: `Cal: Grain-Bushels`, `Water: Artesian-Flow`, `Civic: Vernacular-Shelter`, providing the foundational testing ground for Adjacency Smothering and Sovereign Hub elections.
* **Standalone Fallback:** Designed to run with zero plugins; GMs can run full ten-session campaigns with nothing more than the core manifest.
