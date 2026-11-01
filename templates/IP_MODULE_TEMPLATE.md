---
# ==============================================================================
# CREATOR STUDIO: UNIVERSAL IP MODULE AUTHORING TEMPLATE
# ==============================================================================
# Copy this file, rename it to [PREFIX]-[NUMBER]_[Short_Title].md, and fill out
# the fields below. Consult docs/srd/ip_module_framework_srd.md for full guidance.
# ==============================================================================

id: "IP-001"                              # Unique alphanumeric ID (e.g. HIST-01, DBZ-01, DND-01)
title: "The Module Title"                 # Evocative title of the location, event, or engine
set: "Custom IP Campaign Set"             # Set/Pack name (e.g. The Late Roman Republic, Namek Saga, Ravenloft)
tier: "Tier 3 (Infrastructural Supply Chains)" # Formal pipeline tier label
pipeline_tier: 3                          # Numeric tier index: 1 (Governance), 2 (Biome), 3 (Supply), 4 (Dilemma), 5 (Climax)

# --- RESOURCE SUPPLY CONTRACTS ---
# Typed machine-readable strings in the format: "[Category]: [Asset-Name]"
# Categories: Power, Material, Bio, Tech, Authority, Labor, Climax, Ecology
provides:
  - "Material: Refined-Asset-Name"
  - "Bio: Sustenance-Or-Extract"
requires:
  - "Power: Grid-Or-Battery-Input"
  - "Labor: Specialist-Or-Levy"

# --- TOPOLOGICAL & SOCIOLOGICAL MAPPING ---
tarot_affinity:                           # 1 to 3 Major Arcana cards matching the module's thematic soul
  - "The Emperor"
  - "The Tower"
culture_quadrant: "Hierarchy / Control"   # Hierarchy, Clan, Market, Adhocracy (or hybrid)
operational_profile: "Deliver / Matrix"   # Deliver, Design, Produce, or Service
mtg_color: "White / Blue"                 # 5-color organizational identity: White, Blue, Black, Red, Green, or Colorless
hub_eligibility: "candidate"              # candidate (can be sovereign hub), never (outpost only), always (locked hub)

# --- STANDALONE FALLBACK ---
# What happens if outside trade corridors are severed or this is played as an isolated one-shot?
standalone_fallback: "If severed from outside power or supply corridors, the facility relies on local emergency reserves, reducing output dial to Level 1 and halving operational capacity without halting play."

# --- INJECTED TABLETOP RUNTIME MECHANICS ---
injected_mechanics:
  output_dial:
    # 4-Level dial scaling with universal difficulty tiers:
    # Level 1 (Light DC 10 / 1d6 dmg), Level 2 (Moderate DC 13 / 2d8 dmg),
    # Level 3 (Severe DC 16 / 4d10 dmg), Level 4 (Lethal DC 20 / 8d12 dmg).
    level_1: "Dormant / Routine State - Minimal output; passive rumors; routine inspection (Light Tier, DC 10 / 1d6 damage)."
    level_2: "Standard Operational State - Standard output; expected quotas met; active guards (Moderate Tier, DC 13 / 2d8 damage)."
    level_3: "Overdriven / Crisis State - Doubled output; high heat/pollution; active strikes or sabotage (Severe Tier, DC 16 / 4d10 damage)."
    level_4: "Catastrophic Meltdown - Total systemic failure; structural collapse; lethal fallout (Lethal Tier, DC 20 / 8d12 damage)."

  threat_clocks:
    # 1 to 3 visual progress clocks: 4 Ticks (Tactical), 6 Ticks (Environmental), 8 Ticks (Macro/Climax)
    primary_crisis: "Facility Meltdown [6 Ticks] - Advances (+1) when checks fail or maintenance is skipped."
    tactical_alarm: "Garrison Security Alert [4 Ticks] - Advances (+1) on loud combat or stealth failures."

  yields_resource: "Summary of high-value narrative or tactical rewards the party gains by securing this site."
---

# MODULE [ID]: [TITLE]

### 1. Mechanical Architecture & Core Premise
*Provide a 2-3 paragraph breakdown of the location, engine, or event. Focus on physical layout, functional machinery, environmental conditions, and the core stakes. What makes this location dynamic and alive?*

* **The Physical Anchor / Heart of the Node:** Describe the physical landmark, machine, or chamber at the center of the node (e.g. the furnace core, the senate floor, the gravity chamber, the ancient crypt).
* **The Dynamic Engine at Stake:** How does this location transform inputs into outputs? What happens when characters interact with the levers?
* **The Escalation Trigger:** What specific player actions or clock expirations cause the situation to escalate from stability into open crisis?

---

### 2. Dramatic Opposition Web (4-Corner Matrix)
*Every great scenario has at least four competing forces with irreconcilable worldviews. Map the local actors into the 4-Corner Matrix below:*

* **1. Establishment / Hegemony ([Faction / NPC Name]):**
  * *Worldview & Goal:* The entrenched ruling authority defending order and existing contracts.
  * *Leverage:* Legal power, garrison troops, economic monopoly, fortified walls.
  * *Blind Spot / Fatal Flaw:* Arrogance, bureaucratic paralysis, inflexibility, fear of scandal.

* **2. Main Opponent / Challenger ([Faction / NPC Name]):**
  * *Worldview & Goal:* The insurgent, rival claimant, warlord, or saboteur seeking to overturn the status quo.
  * *Leverage:* Guerilla strike cells, fanatic followers, high-energy weapons, populist anger.
  * *Blind Spot / Fatal Flaw:* Collateral recklessness, internal factional infighting, fanaticism.

* **3. Thematic Shadow / Profiteer ([Faction / NPC Name]):**
  * *Worldview & Goal:* The opportunist, black-market broker, corrupt merchant, or parasite thriving in the cracks of the conflict.
  * *Leverage:* Smuggling tunnels, black-market scrip, forbidden intelligence, mercenary hirelings.
  * *Blind Spot / Fatal Flaw:* Venal selfishness, vulnerability to extortion, no real loyalty.

* **4. Tertiary Outcast / Victim ([Faction / NPC Name]):**
  * *Worldview & Goal:* The discarded labor force, native exile, subterranean pariah, or innocent caught between the warring powers.
  * *Leverage:* Intimate knowledge of maintenance conduits, hidden caches, moral authority, desperate bravery.
  * *Blind Spot / Fatal Flaw:* Starvation, lack of heavy weapons, trauma, deep suspicion of outsiders.

---

### 3. GM Placement & Tactical Synergies
*Instructions for the Game Master on how to slot this module into a campaign network:*

* **Recommended Placement:** Which pointcrawl node type does this suit? (e.g. Outer Perimeter Gate Node 1, Interior Industry Node 14, Subterranean Chokepoint Node 18, Sovereign Hub).
* **Supply Chain Interlocks:**
  * *Consumes:* Explicitly list the upstream resources needed from adjacent nodes.
  * *Feeds:* List the downstream facilities that starve if this node's output drops to zero.
* **Arrival / Disembark Integration:** If travelers arrive here directly, what is the **Upright Boon** (favorable welcome, trade credit, tactical shortcut) vs **Reversed Debt** (confiscated cargo, dock shakedown, toxic fume exposure)?
* **Standalone Fallback:** Explain how a Game Master running a one-shot or isolated adventure uses this module without needing the rest of the campaign graph.
