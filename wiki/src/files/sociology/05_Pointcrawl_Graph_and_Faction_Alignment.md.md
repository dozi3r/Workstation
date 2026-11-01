---
file_path: "sociology/05_Pointcrawl_Graph_and_Faction_Alignment.md"
title: "MODULE SOC-05: POINTCRAWL GRAPH & FACTION ALIGNMENT"
volume: "vol-6"
kind: "Sociology Specification"
current_hash: "1bceb67a3082df22"
reviewed_hash: "1bceb67a3082df22"
stale: false
size_bytes: 5246
line_count: 67
---

# MODULE SOC-05: POINTCRAWL GRAPH & FACTION ALIGNMENT

<!-- BEGIN_CUSTOM_NOTES -->
### 1. Architectural Purpose & Role
`sociology/05_Pointcrawl_Graph_and_Faction_Alignment.md` (**Module SOC-05**) is the canonical, setting-agnostic methodology for mapping pointcrawl network topology ($G = (V, E)$) to organizational sociology. It supersedes the earlier setting-coupled file [[File:sociology/05_Node_and_Faction_Mapping.md]] (tracked under [[Ticket:SYS-AUDIT-01]] and [[Series:series_g_duplicate_and_orphan_audit]]).

By uniting **CVF Cultural Quadrants** ([[File:sociology/01_Core_Cultural_Quadrants.md]]), **Operational Profiles** ([[File:sociology/02_Operational_Profiles_and_Power.md]]), and **Five-Color Ideological Axes** (`White`, `Blue`, `Black`, `Red`, `Green`), `SOC-05` provides deterministic rules for assigning institutional behaviors to nodes based on their spatial role in the graph.

### 2. Universal Ideological & Sociological Mapping Matrix

| Ideological Axis (MTG Color) | CVF Cultural Quadrant | Operational Profile | Systemic Function in Pointcrawl Graph | Sensory Signature & Atmosphere |
| :--- | :--- | :--- | :--- | :--- |
| **Order / Hegemony (`White`)** | **Hierarchy** *(Control)* | **Deliver** *(Matrix)* | Bastion chokepoints, perimeter gates, quarantine and customs staging hubs. | Polished masonry, ringing alarm bells, strict inspection desks, formal wax seals. |
| **Knowledge / Industry (`Blue`)** | **Adhocracy** *(Create)* | **Design** *(Enclave)* | Research enclaves, high-head dynamo stations, specialized artificer labs. | Hissing steam, mechanical drone, chalkboard diagrams, experimental apparatus. |
| **Exploitation / Cartel (`Black`)** | **Market** *(Compete)* | **Produce** *(Enforced)* | Mining colonies, penal slag mills, bulk resource extraction depots. | Smog and sulfur fumes, tally ledgers, clinking iron chains, predatory contracts. |
| **Freedom / Corsair (`Red`)** | **Clan / Adhocracy** | **Design / Service** | Rebel freeholds, smuggling coves, wild border bazaars. | Shouted bargains, bonfires, improvised barricades, loose egalitarian codes. |
| **Ecology / Kinship (`Green`)** | **Clan** *(Collaborate)* | **Service** *(Mutualist)* | High-canopy refuges, indigenous groves, herbalist cloisters. | Living timber walls, peat smoke, murmuring consensus circles, shared communal larders. |

### 3. Step-by-Step Topological Alignment Workflow
1. **Node Elevation & Spatial Classification**:
   - *Perimeter / Gate Nodes* $\to$ **Hierarchy (`White`)** to regulate entry traffic and quarantine external threats.
   - *Energy / Industrial Generation Nodes* $\to$ **Market / Adhocracy (`Blue / Black`)** driven by technical insight and extraction quotas.
   - *Wilderness / Canopy Refuges* $\to$ **Clan (`Green`)** where survival depends on mutual trust and ecological attunement.
   - *Maritime / Smuggling Anchorages* $\to$ **Adhocracy / Clan (`Red`)** governed by fluid prize-sharing pacts.
2. **Edge Tension Inference**:
   - Edges linking **Hierarchy** $\leftrightarrow$ **Market** nodes generate tariff disputes, smuggling arbitrage, and jurisdictional friction.
   - Edges linking **Clan** $\leftrightarrow$ **Hierarchy** nodes generate conscription resistance, tax evasion, and border skirmishes.
3. **Dynamic Crisis Shifts**: Integrates with [[File:sociology/03_Environmental_Uncertainty_and_Crisis.md]] so severe famine fractures `Hierarchy` nodes into cutthroat `Market` warlords, while existential external sieges compress feuding `Clans` into martial `Hierarchy`.

### 4. Downstream Consumers & Cross-References
- **Compiler Implementation**: The color-to-quadrant-and-profile mapping table in Section 2 is codified directly in `getMtgColor(quadrant, operationalProfile)` inside [[File:tarot/generate_tarot_matrix.js]] (lines 78–83).
- **Setting Implementation**: For the concrete 22-node Opal Island implementation of `SOC-05`, see [[File:campaigns/opal_island/modules/Set_C_Faction_and_Governance/FACT-07_Canonical_22_Node_Faction_Distribution.md]].
- **Cross-Cutting Series**: Analyzed in [[Series:series_c_sociology_and_tarot_hermeneutics]] and bundled into [[File:sociology/SOCIOLOGY_MASTER_COMPENDIUM.md]].
<!-- END_CUSTOM_NOTES -->
