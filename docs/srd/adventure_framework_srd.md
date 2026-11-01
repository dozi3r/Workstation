# Universal Adventure Framework SRD

Version: 1.0.0  
Status: Authoritative Standard  
Authority: ADR-0001, ADR-0002, CONTEXT.md  

---

## 1. Scope & Tabletop Runtime Role

The **Universal Adventure Framework SRD** governs tabletop gameplay procedures for pointcrawl exploration, hazard resolution, threat escalation, and resource management.

While the [Campaign Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md) models structural macro-balance and network topology, this specification provides actionable, system-agnostic mechanics for Game Masters and players at the table. Any module authored for the Creator suite references these standardized primitives.

---

## 2. Threat Clock Engine

Dynamic tension and escalating hazards are tracked through visual segmented **Threat Clocks**.

```
[ ][ ][ ][ ] (4-Tick Clock)
```

### 2.1 Clock Sizes
* **4-Tick Clock (Imminent / Tactical)**: Immediate tactical crises, stealth detection, airlock breach, rising floodwaters, or alarm response.
* **6-Tick Clock (Operational / Environmental)**: Node-wide shifts, storm approach, generator overheating, or guard patrol rotation.
* **8-Tick Clock (Macro-Geopolitical / Climax)**: Island-wide faction war mobilization, volcano caldera rupture, or planar collider countdown.

### 2.2 Tick Escalation Triggers
A clock ticks forward (+1) under the following conditions:
1. **Complications & Soft Moves**: A player fails an action check or succeeds with a cost.
2. **Time Traversal**: Traversing a hazardous edge between nodes advances active transit clocks by +1 tick.
3. **Resource Neglect**: Failing to refuel a brazier, bypass a security pylon, or pay an extortion toll.

### 2.3 Clock Full Consequence
When all segments fill, the threat triggers immediately:
* Patrol arrives in force with heavy weapons.
* Perimeter wards drop, triggering an immediate monster swarm incursion.
* Structural collapse blocks the transit corridor.

---

## 3. Universal Hazard & Difficulty Tiers

To remain system-agnostic across d20 (D&D 5e, OSR), 2d6 (PbtA, Traveller), and dice-pool systems (FitD), all tests and hazards in modules are defined using standardized severity tiers.

| Severity Tier | Universal Intent | d20 DC Equivalent | 2d6 Target | Damage Die Equivalent | Consequence Scale |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Light** | Routine stress; competent specialist easily succeeds | DC 10 | 6+ | 1d6 (3 dmg) | Minor delay, superficial injury, small equipment loss |
| **Moderate** | Significant friction; active opposition or harsh terrain | DC 13 | 8+ | 2d8 (9 dmg) | Moderate wound, resource depletion, +1 Threat Tick |
| **Severe** | Critical peril; extreme environmental or martial lethality | DC 16 | 10+ | 4d10 (22 dmg) | Crippling injury, equipment shattered, node lockdown |
| **Lethal** | Apocalyptic catastrophe; direct blast or death trap | DC 20 | 12+ | 8d12 (52 dmg) | Instant death / downing, permanent structural ruin |

---

## 4. Logistical & Resource Flow Architecture

Modules in the Creator suite model material supply chains. Tabletop adventures enforce these resources through abstract supply units.

### 4.1 Electrical & Hydraulic Power
* **Units**: High-Amperage Direct Current (kW) or Hydraulic Flow Rate ($m^3/s$).
* **Baseline**: Modules such as `INFRA-01` produce surplus power (24 kW). Connected consumer modules (`INFRA-02`, `INFRA-04`) consume discrete power units.
* **Brownout / Blackout**: If generation drops below consumption, connected arc furnaces or cryo-stasis chambers shut down, escalating local containment clocks.

### 4.2 Chemical Fuel & Protective Smokewalls
* **Units**: Fuel Casks, Carbide Drums, or Burn Hours.
* **Perimeter Defense**: Nodes vulnerable to environmental apex predators (e.g. Stirge swarms, spore plagues) require continuous deterrent burns.
* **Depletion**: Each long rest or transit cycle consumes 1 Fuel Unit per perimeter pylon. Depletion drops the protective ward to zero, allowing swarms free ingress.

### 4.3 Munitions & Scrap Economy
* **Units**: Silver Scrap, Bullion Vouchers, Iron Ore ingots.
* **Currency Parity**: 1 Silver Voucher = Standard laborer daily wage = 10 Copper/Silver scrap.
* **Barter Leverage**: Factions in Market quadrants refuse fiat currency; trade requires raw chemical fuel, munitions, or technological salvage.

---

## 5. Supply Line Severance & Dual-Layer Corridor Rules

### 5.1 Physical Corridors vs. Hegemonic Vectors
The runtime pointcrawl distinguishes between physical pathways and ideological vectors:
* **Physical Transit Corridors ($E_{adj}$)**: Represent physical terrain traversable by the party (roads, mountain passes, navigable rivers, subways). Subject to travel times, random encounters, environmental hazard ratings, and logistical severance.
* **Hegemonic Power Vectors ($E_{inf}$)**: Intangible channels of political, feudal, religious, or mercantile authority. They cannot be walked, ambushed, or physically blocked, but exert cultural pressure, tax tariffs, and ideological amalgams on downstream settlements.

### 5.2 Supply Line Severance Rules
When a physical transit edge $(u, v)$ between two nodes is blocked, destroyed, or seized by hostile forces:

1. **Upstream Isolation**: Node $u$ stockpiles unsent raw materials, risking local volatile storage disasters.
2. **Downstream Starvation**: Node $v$ immediately enters **Supply Starvation**:
   * Industrial outputs cease within $1\text{d}4$ campaign days.
   * Defensive wards lose fuel recharge.
   * Local food rations convert to starvation riots (+1 Threat Tick every 24 hours).
3. **Emergency Bypass**: Re-routing supplies through an alternate multi-hop path imposes a 50% tariff loss or double transit risk.
4. **Hegemonic Immunity**: Severing a physical corridor does *not* sever hegemonic vectors unless political authority was uniquely tied to that physical supply line.

### 5.3 Living Campaign Fog-of-War Tabletop Procedures
When running a campaign in **Living Campaign (Fog-of-War) Mode**:
1. **Frontier Arrival**: The party may only travel to nodes that are either **Known Anchors** or directly adjacent via an open physical corridor to a currently revealed node.
2. **Unshrouding the Frontier**: Upon first physical arrival or successful remote scouting of a shrouded node:
   * The Game Master triggers the **Tarot Reveal** in Creator Studio (or draws the physical card).
   * The node's Amalgamation Score, Sociological Disposition, and Hub/Satellite status are calculated dynamically.
   * The Game Master executes the **Dockside Arrival / Disembark Protocol** (Section 6) using the newly revealed card.
3. **Pre-Seeded Anchors**: Starting perimeter nodes (e.g. Nodes 1, 2, 6, 20) are permanently revealed at Session 1 start to provide initial quest hooks and stable bastions.

---

## 6. Dockside Arrival & Disembark Protocol

When the player party first arrives at a perimeter entry node (e.g. Node 1 Beachhead Bastion / The Outpost):

1. **Card Resolution**: The Game Master references the active preset's Disembark Table corresponding to the node's drawn Tarot card.
2. **Upright Draw**:
   * The party receives the **Upright Event** (warm reception, efficient cargo handlers, intact wards).
   * The party receives the **Starting Boon** (e.g. tool kit, tactical insight, safe bunking pass).
3. **Reversed Draw**:
   * The party suffers the **Reversed Event** (spilled cargo, dockside shakedown, sputtering torch).
   * The party incurs the **Starting Complication / Debt** (e.g. lost heirloom, labor debt contract, local criminal suspicion).

---

## 7. Module Injected Mechanics & Tabletop Execution

Every module in the Creator suite incorporates system-agnostic runtime tools designed for immediate Game Master invocation.

### 7.1 Dynamic Dials (Levels 1 to 4)
Modules feature 4-level dials (e.g. *Output Dial*, *Truth Dial*, *Sovereignty Dial*):
* **Level 1 (Dormant / Folklore / Marginal)**: Baseline operational state, rustic rumor, or minimal energy. Routine difficulty checks (Light Tier).
* **Level 2 (Standard / Operational / Supervised)**: Default active condition. Reliable output with moderate environmental side effects (Moderate Tier).
* **Level 3 (Overdriven / Exposed / Unstable)**: Surge capacity or political revelation. Doubled outputs accompanied by hazardous fallout, active opposition, or severe risk (Severe Tier).
* **Level 4 (Catastrophic / Eschatological / Meltdown)**: Structural failure, bio-weapon activation, or total revolt. Triggers immediate Lethal Tier hazard consequences.

### 7.2 Threat Clock Tabletop Procedures
Threat Clocks bridge narrative player choices with systemic danger:
* **Advancing Clocks**: GMs advance clocks by +1 tick as a consequence of failed skill tests, time spent searching/resting in hostile zones, or neglected supply maintenance.
* **Halting or Reversing Clocks**: Players can reduce active clock segments by sacrificing resources (e.g. 1 Fuel Unit, 100 Silver Scrap), completing tactical sabotage objectives, or negotiating political concessions.
* **Cascading Clocks**: When a clock segment completely fills, it may ignite a secondary clock on an adjacent node (e.g. Penstock Rupture on Node 4 triggers Food Riot on Node 5).

### 7.3 Hazard Severity Binding
Module mechanics map directly to the Universal Hazard Severity Tiers defined in Section 3:
* **Light Traps / Friction**: DC 10 / 6+ / 1d6 damage (e.g. razor-sedge nick, slippery gangway).
* **Moderate Perils**: DC 13 / 8+ / 2d8 damage (e.g. stirge proboscis drill, toxic bog fumes).
* **Severe Catastrophes**: DC 16 / 10+ / 4d10 damage (e.g. arc flash shockwave, iron-thorn constriction).
* **Lethal Climax Breaches**: DC 20 / 12+ / 8d12 damage (e.g. particle collider planar rupture, boiling steam geyser).

---

## 8. Campaign Turn & Logistical Supply Economy

Pointcrawl travel and downtime are tracked in discrete **Campaign Turns** (1 Turn = 1 Travel Watch / 8 Hours, or 1 Long Rest).

### 8.1 Turn Consumption Cycle
During each Campaign Turn:
1. **Perimeter Burn**: Guarded settlements consume 1 Fuel Unit per perimeter pylon or brazier. If fuel is zero, protective wards drop and threat clocks advance.
2. **Power Grid Audit**: Sovereign Hubs verify that active dynamo outputs ($\ge 24\text{ kW}$) satisfy downstream consumer draw. Deficits trigger brownouts, shutting down arc furnaces or cryo-containment first.
3. **Transit Wear**: Parties traversing hazardous corridors roll against edge hazards or advance edge traversal clocks by +1.

### 8.3 Clock-Driven Supply Severance Degradation (Q2 Standard)
Supply edge cuts or blocked physical corridors do not inflict instantaneous binary ruin or zero-consequence immunity. Instead, severed dependencies advance a standardized **4-Segment Threat Clock** at a rate of **+1 Tick per Campaign Turn**:

* **Tick 0 / 4 (Reserves Holding)**: Baseline operation. Local buffer storage and emergency stockpiles absorb the logistical deficit. All module functions and yields remain normal.
* **Tick 1 / 4 (Depleted Reserves)**: Local storage exhausted. Operational output diminishes (-1 mechanical yield or advantage).
* **Tick 2 / 4 (Operational Strain)**: Rationing, black-market inflation, and civil unrest emerge. +1 Regional Peril or hazard modifier applied to all checks within the node.
* **Tick 3 / 4 (Critical Distress)**: Infrastructure buckling and structural failures occur. Adjacent connected nodes suffer secondary stress.
* **Tick 4 / 4 (Threat Threshold)**: The threat clock reaches maximum capacity and activates the Climax Trigger Protocol.

### 8.4 Climax Trigger Protocol & The Crisis Gate Window (Q3 Standard & Dial 8)
When a module reaches Threat Clock 4/4, its resolution is determined by **Dial 8: Climax Trigger Protocol**:

* **Mode A: Crisis Gate Window (Default / Recommended)**:
  Maxing out a Level 4 threat clock opens a **mandatory 1-Session Heroic Crisis Window**. Rather than narrative fiat destroying the node off-screen, the Game Master frames an immediate high-stakes crisis mission (e.g. rushing emergency medicine through hostile passes, rebooting a flooding Pelton dynamo, repelling a desperate bandit siege).
  * **Heroic Resolution**: Completing the crisis mission relieves the immediate catastrophe, reducing the clock by **-2 Ticks** (back to Tick 2 / Operational Strain) and granting a brief recovery window.
  * **Crisis Neglect / Failure**: If the party ignores the crisis or fails the mission, the node permanently collapses into an irreversible Level 4 blighted ruin.
* **Mode B: Hardcore Cataclysm**:
  Immediate and irreversible Level 4 systemic collapse upon reaching Tick 4/4. The module is destroyed and the node is permanently transformed without an intervention grace window.

---

## 9. Sociological Archetype & Faction Behavioral Reactions

How local factions respond to player interventions and supply crises is governed by their Competing Values Framework (CVF) quadrant and Granular Disposition `[S, E, C]`:

* **Hierarchy Nodes (Control)**: Bureaucratic tribunals, martial curfews, ration cards. Responds to shortages with increased guard patrols, hoarding for garrisons, and harsh punitive penalties.
* **Market Nodes (Compete)**: Price gouging, mercenary contracts, black-market arbitrage. Responds to shortages with hyper-inflation, extortion tolls, and desperate debt-slavery labor auctions.
* **Clan Nodes (Collaborate)**: Mutual aid, communal sacrifice, deep xenophobia. Responds to shortages by sharing among kin while aggressively expelling or robbing outside travelers.
* **Adhocracy Nodes (Create)**: Experimental jury-rigging, outlaw smuggling, reckless innovation. Responds to shortages with dangerous makeshift prototypes, wild gambits, or ideological mutinies.

---

## 10. Modular Campaign Sourcebook Ecosystem (Q1 Architecture)

To support expanding campaign worlds, third-party settings, and external Intellectual Property (IP) collaborations (akin to *Universes Beyond* in Magic: The Gathering), Creator Studio treats every campaign as an independent, modular **Sourcebook**.

### 10.1 Sourcebook Package Standard
Each campaign resides in its own isolated directory: `campaigns/<campaign_id>/`:
```text
campaigns/<campaign_id>/
├── campaign.json             # Manifest metadata (id, name, author, default dials, enabled flag)
├── preset.json               # 22-Node pointcrawl topology, coordinates, wave sequence, disembark table
├── modules_manifest.json     # Machine-readable catalog of setting-specific modules
└── modules/                  # Modular worldbuilding markdown source documents
```

### 10.2 Sourcebook Toggling & Aggregation
Like enabling or disabling rulebooks in tabletop digital tools, Game Masters can activate or deactivate sourcebooks individually:
1. **Isolated Mode**: Run a pure standalone campaign (e.g. *Tutorial Isle* or *Opal Island*) with only its native nodes, waves, and modules.
2. **Aggregated Multi-Book Mode**: Enable multiple sourcebooks simultaneously. The authoring engine aggregates all active modules into a unified slotting catalog with clear sourcebook attribution badges.
3. **Cross-Campaign Tarot Scoring**: Modules from any sourcebook can slot into any campaign graph, automatically evaluated by the Weighted Affinity Scoring Engine (+10 Tarot, +5 Culture Match, -5 Culture Clash, +3 Color Match).

---

## 11. Cross-Specification Authority

* **Authoring Engine SRD**: Consult [Authoring Engine SRD](authoring_engine_srd.md) for graph topology, mathematical hub election, 64-cell sociological algebra, and network supply web flow.
* **Scenario Primitives SRD**: Consult [Scenario Primitives SRD](scenario_primitives_srd.md) for architectural deconstruction guidelines and mechanical contract schemas.
* **Tarot Sociology Matrix**: Consult [Disposition Matrix & Tarot Decision Framework](../../sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md) for detailed NPC personas, tactical passives, and cultural boons.
* **Module Library**: Consult [Module Master Catalog](../MODULES_CATALOG.md) for the modular worldbuilding asset catalog.

