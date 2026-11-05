---
title: "ODV Krynn Adaptation: Work Document"
status: draft
audience: authors of the Krynn campaign presets and the 64-cell ODV matrix
generated_by: scratchpad build script (cells data + ledger); regenerate rather than hand-edit tables
related: ["sociology/07_Granular_64_Disposition_Matrix.md", "src/workstation/scripts/sociology_data.js", "docs/srd/authoring_engine_srd.md", "tickets/system/SYS-ODV-01_unset_disposition_state_and_placeholder_remediation.md"]
---

# ODV Krynn Adaptation: Work Document

Goal: keep the 64-cell `[S, E, C]` matrix sociologically intact and replace its generic-fantasy content with Krynn content grounded in `Sources/` (five Chronicles and Legends novels plus the annotated-commentary extractions). Output: this document and `campaigns/Krynn_V3_Five_Book_Odyssey/odv_matrix_krynn.json`, a drop-in override for `network/odv_archetype_matrix.html`.

Source abbreviations: **SF** The Soulforge, **BA** Brothers in Arms, **AT** Dragons of Autumn Twilight, **WN** Dragons of Winter Night, **SD** Dragons of Spring Dawning, **AC** Annotated Chronicles. Numbers refer to `Sources/extractions/<book>/01_peoples_factions_and_councils.md` (-01), `02_dramatis_personae.md` (-02) and the commentary files (AC-03 cosmology, AC-04 worldbuilding).

## 1. Findings in brief

1. **The five source extractions do not use one scale.** Each labels S, E and C differently, and Winter Night runs S backwards for several factions. The numbers cannot be loaded into the matrix as written (section 3).
2. **Every actor was re-scored against the canonical dials** in `authoring_engine_srd.md` §3.1 using the Krynn evidence signatures in section 2 (section 4).
3. **All 64 cells now have a Krynn archetype:** 54 scored from a named source actor, 6 derived from sourced institutions without a single named occupant, 4 crisis-states of another cell. Confidence: 15 high, 39 medium, 10 low.
4. **12 source CVF labels disagree with what the engine derives** from the re-scored vector (section 5). These are the most useful hooks for play: the faction says Hierarchy, behaves like Market.
5. **Thorbardin's clans fill six cells and the Dragonarmies and their organs thirteen.** One polity is not one cell. That is the sociology working as intended.
6. **Cell `[2, 2, 2]` is now Palanthas.** Ninety of 144 nodes in the current Krynn presets carry `[2,2,2]` as an importer placeholder (SYS-ODV-01). Until that ticket lands, every unset Krynn node reads as "the Unspoiled City, politely refusing to mobilize". Do not leave that unreviewed (section 8).

## 2. How the matrix works, and the Krynn evidence signatures

The matrix is a Cartesian product of three 1 to 4 dials. Each cell supplies an archetype name, a Core Boon, a Core Burden, a Micro Passive (inside the entity), a Macro Passive (radiating outward) and an exemplar NPC. Two readings are derived by rule in `sociology_data.js`:

- **CVF quadrant** from `[S, E]`: S>=3 and E<=2 Clan; S>=3 and E>=3 Adhocracy; S<=2 and E<=2 Hierarchy; otherwise Market.
- **Operational mode** from `[S, C]`: S>=3 and C<=2 Design; S>=3 and C>=3 Service; S<=2 and C<=2 Produce; otherwise Deliver.

So a re-score is never cosmetic: it moves the faction's quadrant, mode, corridor friction and crisis behavior.

**Scoring rule used throughout:** score the organization as a unit in its stated state; when sub-bodies diverge, score them separately; when a crisis flips behavior, record the crisis-state as its own cell (SOC-03). Judge conduct, not self-description.

| Dial | Level | What to look for in the Krynn text | Anchor examples |
| :--- | :---: | :--- | :--- |
| **S** structure | 1 | Doctrine that cannot be amended; ritual, caste or oath as law; no precedent means no action | Gilean's Aesthetics, Crownguard literalists, Silvanesti caste law, Dragonarmy drill |
| | 2 | Written charters, tests, tariffs, protocols, but with a mechanism to change them | Conclave, Tarsis tariff books, Palanthas Senate, Gnome guild code |
| | 3 | Moots, deeds over birth, situational roles, improvised alliances | Solace hearth moot, Kagonesti, Neidar, Whitestone Alliance |
| | 4 | No lasting rule; whoever shouts, wanders or is touched by the moment decides | Kender, Aghar, Fizban, renegade mages |
| **E** boundary | 1 | Sealed gates, memory-wipe, refusal of aid, outsiders unwelcome | Thorbardin, Silvanesti, Dimernesti, Library |
| | 2 | Guard the members first; hospitality under watch; defend, do not seek | Solace, Qualinesti, Knights, Ice-Folk-adjacent hosts |
| | 3 | Contract, tariff, barter, brokerage; the outside is a market | Tarsis, Hope's End, Daewar, Scrounger |
| | 4 | Annex, extract, enslave; or boundaries that simply do not exist | Dragonarmies, Daergar, Seeker chapterhouses |
| **C** coupling | 1 | One keep, one master, one silo; fall of the center affects no one else | Dargaard, Khisanth, Theobald, Raistlin |
| | 2 | Independent houses, clans or companies with voluntary ties | Que-Shu bands, Dimernesti, Baron Ivor's companies, Haven houses |
| | 3 | Shared infrastructure and mutual dependence, with redundancy | Qualinost, Knights' Orders, Kalaman war council allies, Hylar lift |
| | 4 | One body, one mind or one chain; failure of the center spreads | Silvanesti under Lorac, Ice Folk, draconian brood, Ariakas's crown |

## 3. Source audit: five extractions, five scales

| Extraction | What S / E / C mean there | Typical example | Usable as-is? |
| :--- | :--- | :--- | :--- |
| SF Soulforge | Solidarity / Expressiveness / Constraint | Seekers `[1,4,4]`: hysteria and law | No: E and C measure display and enforcement, not boundary or coupling |
| AT Autumn Twilight | Social Stratification / Ecological Exploitation / Cultural Openness | Que-Shu `[4,1,1]`: herd egalitarian, xenophobic | No: S direction is canonical but meaning differs; C is openness (an E concept) |
| BA Brothers in Arms | Unlabeled fractions | Hope's End `[2.1,1.8,3.8]` | Rounded guesses only |
| WN Winter Night | Mixed: S appears to run rigid-high for Hylar, Silvanesti, Crownguard, Blue Wing | Hylar `[4,2,4]` and Aghar `[1,1,1]` | No: the same Aghar are `[4,1,4]` in AT and `[1,1,1]` here |
| SD Spring Dawning | Canonical labels (Structure, Boundary, Coupling) | Aesthetics `[1,1,1]`, Dimernesti `[1,2,2]` | Mostly, with five re-scores |

Consequences: the Krynn compiler and the 144-node presets cannot trust any extraction vector. SD agrees with the canonical dials for 3 of the 7 factions it scores; the other four were revised.

## 4. Categorization ledger: sources to S / E / C

Each row is one source actor, its published score, and the canonical re-score with the cell it lands in. "Engine" is the CVF quadrant derived from the new vector; where it disagrees with the source label it is flagged in section 5.

| Actor | Source | Source scale | Source vector | Canonical `[S,E,C]` | Cell | Source CVF | Engine CVF / mode | Rationale |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| Seeker Theocracy, Solace chapter (Hederick) | AT-01 §2.1 | Strat/Exploit/Openness | [2,4,2] | `[2, 4, 1]` | The Seeker Chapterhouse | Hierarchy | Market / Produce | Chartered local arm extracting from a colony; engine reads Market because E=4. Self-image is Hierarchy, behavior is Market. |
| Que-Shu plainsmen | AT-01 §2.2 | Strat/Exploit/Openness | [4,1,1] | `[1, 1, 2]` | The Blood-Oath Tribes | Clan | Hierarchy / Produce | Absolute tribal law, caste barriers and stoning of heresy are S1, not S4. Source "egalitarian" refers to the herd, not the law. Engine reads Hierarchy. |
| Qualinesti Court of the Sun | AT-01 §2.3 | Strat/Exploit/Openness | [1,3,3] | `[2, 2, 3]` | The Court of the Sun | Hierarchy/Clan | Hierarchy / Deliver | Court ritual is codified (S2) rather than immutable; protective, not transactional (E2); one realm, shared architecture (C3). |
| Qualinesti under Porthios (crisis mode) | AT-01 §2.3; WN-01 §6 | Strat/Exploit/Openness | n/a | `[1, 2, 4]` | The Exodus Column | n/a | Hierarchy / Deliver | Not scored in source. Derived from the exodus and the purity faction: SOC-03 crisis metamorphosis of the Court of the Sun. |
| Aghar (Xak Tsaroth warrens) | AT-01 §2.4 | Strat/Exploit/Openness | [4,1,4] | `[4, 1, 3]` | The Aghar Warrens | Adhocracy | Clan / Service | Scavenger flight and regroup is E1 (hermetic hiding), not C4. Engine reads Clan (S>=3, E<=2). |
| Red Dragonarmy / Pax Tharkas mines | AT-01 §2.5 | Strat/Exploit/Openness | [1,4,4] | `[1, 4, 3]` | The Red Wing Legion | Market/Hierarchy | Market / Deliver | Split in two: the wing as a legion (1,4,3) and the mines as a penal workhouse (1,4,1). |
| Kender / wayfarers | AT-01 §2 diagram | Strat/Exploit/Openness | [4,2,4] | `[4, 3, 1]` | The Kender Wayfarers | Adhocracy | Adhocracy / Design | Kender have no perimeter (E3 open exchange) and no coupling (C1): individual wanderers, not a hive. |
| Free Community of Solace | SF-01 §2.1 | Solidarity/Expressiveness/Constraint | [3,2,2] | `[3, 2, 2]` | The Free Canopy Commons | Clan | Clan / Design | Matches numerically but only by coincidence: SF S means solidarity, here S means structural entropy. Moots, no written law: S3. |
| Seekers of Haven / Cult of Belzor | SF-01 §2.2 | Solidarity/Expressiveness/Constraint | [1,4,4] | `[1, 3, 1]` | The Tithe-Vault of Belzor | Hierarchy | Market / Produce | Priesthood ledger is the vault cell (1,3,1); the grieving flock is a separate populist wildfire (4,2,3). Source "E=4 hysteria" is expressiveness, not boundary. |
| Conclave of Wizards | SF-01 §2.3 | Solidarity/Expressiveness/Constraint | [2,1,4] | `[2, 1, 3]` | The Conclave of Three Robes | Hierarchy | Hierarchy / Deliver | Three Orders bound by oath: codified (S2), hermetic about the Art (E1), integrated across Towers (C3). |
| Theobald's Academy | SF-01 §2.4 | Solidarity/Expressiveness/Constraint | [1,2,4] | `[2, 1, 1]` | The Hedge-School of Theobald | Hierarchy | Hierarchy / Produce | A windowless schoolhouse is a silo (C1) that dismisses outside anomaly (E1); lessons are codified but trivial (S2). |
| Itinerant carnivals | SF-01 §2.5 | Solidarity/Expressiveness/Constraint | [2,4,1] | `[4, 3, 3]` | The Charlatan Circuit | Adhocracy | Adhocracy / Service | Wagon trains are improvisational (S4) and sell to every village (E3); the circuit works as a traveling bazaar. |
| Baron Ivor's company | BA-01 §2 Faction 1 | fractional, unlabeled | [2.8,3.4,2.2] | `[2, 4, 2]` | The Mad Baron's Company | Clan/Hierarchy | Market / Produce | Contract war for hire: S2 codified Oath, E4 as a mercenary core, C2 independent companies. |
| Hope's End Merchants Guild | BA-01 §2 Faction 2 | fractional, unlabeled | [2.1,1.8,3.8] | `[1, 3, 2]` | The Guild-City Cartel | Market/Adhocracy | Market / Produce | Fixed wages, apprentice charters, quality stamp: guild cartel. Source C 3.8 reads as "constraint"; coupling is loose between guilds. |
| Vanguard of the Red Wing (Kholos) | BA-01 §2 Faction 3 | fractional, unlabeled | [1.2,4.0,1.4] | `[1, 4, 3]` | The Red Wing Legion | Hierarchy | Market / Deliver | Same cell as Verminaard's legion; C1.4 undercounts supply from Sanction. |
| Kender / half-kender mercenaries | BA-01 §2 Faction 4 | fractional, unlabeled | [3.9,1.2,3.8] | `[3, 3, 2]` | The Scrounger's Barter-Ring | Adhocracy | Adhocracy / Design | The barter ring is E3 (trade), not E1: it moves surplus across three parties. |
| Hylar / Thorbardin | WN-01 §2 | S appears inverted (high = rigid) | [4,2,4] | `[1, 1, 3]` | The Mountain Sealed | Hierarchy | Hierarchy / Deliver | Hylar S=4 is rigidity. Under canonical S this is immutable (S1). Sealed gates are E1. |
| Daewar | WN-01 §2 | S appears inverted | [3,3,3] | `[2, 3, 3]` | The Forge-Temple Combine | Market | Market / Deliver | Source label Market contradicts the engine at S3. S2 resolves it. |
| Theiwar | WN-01 §2 | S appears inverted | [1,4,1] | `[4, 3, 2]` | The Theiwar Shadow-Web | Hierarchy (Shadow) | Adhocracy / Design | Occult intrigue and secret pacts: erratic (S4), brokering (E3), cell structure (C2). |
| Daergar | WN-01 §2 | S appears inverted | [1,3,2] | `[1, 4, 2]` | The Daergar Quarry-State | Hierarchy | Market / Produce | Slave-quarries are extraction (E4), not trade (E3). |
| Klar | WN-01 §2 | S appears inverted | [2,1,2] | `[4, 1, 2]` | The Renegade Circle | Clan | Clan / Design | Omen-driven, erratic voting: S4. Secondary occupant of (4,1,2). |
| Neidar | WN-01 §2 | S appears inverted | [3,2,2] | `[3, 1, 2]` | The Neidar Craft-Clans | Clan | Clan / Design | Exiles who refuse the mountain: hermetic toward Thorbardin (E1). |
| Aghar (Thorbardin) | WN-01 §2 | S appears inverted | [1,1,1] | `[4, 1, 3]` | The Aghar Warrens | Clan (Degraded) | Clan / Service | Same people as AT-01; the two books score them [4,1,4] and [1,1,1] on opposite S. |
| Tarsis oligarchy | WN-01 §3 | unlabeled | [2,4,3] | `[2, 3, 2]` | The Dust-Port Consortium | Market | Market / Produce | They buy and sell, they do not take (E3). Merchant council, no common ledger (C2). |
| Silvanesti royalists | WN-01 §4 | S appears inverted | [4,1,4] | `[1, 1, 4]` | The Dreaming Court | Hierarchy | Hierarchy / Deliver | Caste law is immutable (S1). The kingdom's mind-link to Lorac is the coupling (C4). |
| Kagonesti | WN-01 §5 | S appears inverted | [1,1,1] | `[3, 1, 3]` | The Wild-Elf Wood | Clan/Adhocracy | Clan / Service | Chief by deed (S3), no written law, kin-web (C3). |
| Qualinesti in exile | WN-01 §6 | unlabeled | [3,2,3] | `[2, 2, 3]` | The Court of the Sun | Hierarchy/Clan | Hierarchy / Deliver | Folded into the Court of the Sun cell. |
| Ice Folk | WN-01 §7 | unlabeled | [3,1,2] | `[3, 1, 4]` | The Ice Folk Hearth | Clan | Clan / Service | One tribe, one boat-fleet, shared meat: coupling is high (C4). |
| Crownguard knights | WN-01 §8 | S appears inverted | [4,1,4] | `[1, 2, 3]` | The Measure-Bound Knights | Hierarchy (Literalist) | Hierarchy / Deliver | Literal Measure is S1; knights defend rather than seal (E2); Orders interlock (C3). |
| Whitestone Council | WN-01 §9 | unlabeled | n/a | `[2, 1, 2]` | The Whitestone Parley | n/a | Hierarchy / Produce | Neutral ground with a sealed-weapon covenant. |
| Blue Dragonarmy | WN-01 §10 | S appears inverted | [4,3,3] | `[2, 4, 3]` | The Blue Wing Prefecture | Market/Hierarchy | Market / Deliver | Disciplined (S2) conquest (E4) governed through delegation (C3). |
| Mount Nevermind gnomes | WN-01 §11 | S appears inverted | [1,2,4] | `[2, 1, 4]` | The Guild-Bound Mountain | Adhocracy | Hierarchy / Deliver | Guild code, committees and isolation: engine reads Hierarchy. The "adhocracy" label described their output, not their governance. |
| Solamnic War Council | SD-01 §2.1 | Structure/Boundary/Coupling (canonical) | [2,2,4] | `[2, 2, 4]` | The Solamnic War Council | Hierarchy | Hierarchy / Deliver | Agrees. |
| Palanthas patricians | SD-01 §2.2 | canonical | [2,3,2] | `[2, 2, 2]` | The Unspoiled City | Market/Hierarchy | Hierarchy / Produce | Walled, denial-driven city is protective (E2), not trading. |
| Aesthetic Order of Gilean | SD-01 §2.2 | canonical | [1,1,1] | `[1, 1, 1]` | The Sealed Chronicle | Hierarchy | Hierarchy / Produce | Agrees. The source diagram lists them under Adhocracy by mistake. |
| Dimernesti | SD-01 §2.3 | canonical | [1,2,2] | `[1, 2, 2]` | The Drowned Sanctuary | Clan | Hierarchy / Produce | Agrees on vector; engine reads Hierarchy (S<=2, E<=2), not Clan. |
| Metallic dragons | SD-01 §2.4 | canonical | [4,3,2] | `[4, 2, 4]` | The Bonded Flight | Adhocracy/Clan | Clan / Service | Soul-bond couples rider and dragon (C4); they defend rather than trade (E2). |
| Unified Dragonarmies / Highlord Council | SD-01 §2.5 | canonical | [1,4,1] | `[2, 4, 4]` | The Imperial Directorate | Market | Market / Deliver | Codified command (S2) under one crown (C4). The source's Silo reading describes the council in collapse (see crisis paths). |
| Raistlin in the Palanthas Tower | AC-02 §2.2; AC-03 §3.5 | not scored | n/a | `[3, 1, 1]` | The Master Artificer's Tower | n/a | Clan / Design | Single-master tower. |
| Lord Soth / Dargaard Keep | SD-01 §2.5 | not scored | n/a | `[1, 2, 1]` | The Cursed Warden | n/a | Hierarchy / Produce | Undead warden; sworn, solitary. |
| Fizban (Paladine's mortal mask) | AT-02 §3.3; AC-03 §1.3 | individual, Autumn scale | [1,1,4] | `[4, 1, 1]` | The Gray Wanderer | Divine Adhocracy | Clan / Design | Order reversed in source; non-interference is the hermit boundary. |
| Eben Shatterstone | AT-02 §4.5 | individual, Autumn scale | [2,4,4] | `[3, 3, 1]` | The Wildcat Turncoat | Market | Adhocracy / Design | A one-man brokerage: no organization to couple. |
| Khisanth in Xak Tsaroth | AT-02 §4.3 | not scored | n/a | `[4, 4, 1]` | The Wyrm in the Ruin | n/a | Adhocracy / Design | Solitary apex predator. |
| Sanction hatcheries & draconian brood | AC-03 §5.1–5.2 | not scored | n/a | `[1, 4, 4]` | The Draconian Brood | n/a | Market / Deliver | Total conversion; commander-dependent. |
| White, Black and Green Wings | AC-04 §3.1 | not scored | n/a | `[3, 4, 2]` | The Ice-Boat Flotilla | n/a | Adhocracy / Design | Placed at (3,4,2), (3,4,3), (3,4,4) respectively. |

## 5. Where self-image and behavior disagree

Rows where the source quadrant differs from the engine quadrant. They are useful as faction secrets: the council says one thing and the matrix says another.

| Actor | Source says | Engine derives | Why it matters in play |
| :--- | :--- | :--- | :--- |
| Seeker Theocracy, Solace chapter (Hederick) | Hierarchy | Market | Chartered local arm extracting from a colony; engine reads Market because E=4. Self-image is Hierarchy, behavior is Market. |
| Que-Shu plainsmen | Clan | Hierarchy | Absolute tribal law, caste barriers and stoning of heresy are S1, not S4. Source "egalitarian" refers to the herd, not the law. Engine reads Hierarchy. |
| Aghar (Xak Tsaroth warrens) | Adhocracy | Clan | Scavenger flight and regroup is E1 (hermetic hiding), not C4. Engine reads Clan (S>=3, E<=2). |
| Seekers of Haven / Cult of Belzor | Hierarchy | Market | Priesthood ledger is the vault cell (1,3,1); the grieving flock is a separate populist wildfire (4,2,3). Source "E=4 hysteria" is expressiveness, not boundary. |
| Baron Ivor's company | Clan/Hierarchy | Market | Contract war for hire: S2 codified Oath, E4 as a mercenary core, C2 independent companies. |
| Vanguard of the Red Wing (Kholos) | Hierarchy | Market | Same cell as Verminaard's legion; C1.4 undercounts supply from Sanction. |
| Theiwar | Hierarchy (Shadow) | Adhocracy | Occult intrigue and secret pacts: erratic (S4), brokering (E3), cell structure (C2). |
| Daergar | Hierarchy | Market | Slave-quarries are extraction (E4), not trade (E3). |
| Mount Nevermind gnomes | Adhocracy | Hierarchy | Guild code, committees and isolation: engine reads Hierarchy. The "adhocracy" label described their output, not their governance. |
| Dimernesti | Clan | Hierarchy | Agrees on vector; engine reads Hierarchy (S<=2, E<=2), not Clan. |
| Fizban (Paladine's mortal mask) | Divine Adhocracy | Clan | Order reversed in source; non-interference is the hermit boundary. |
| Eben Shatterstone | Market | Adhocracy | A one-man brokerage: no organization to couple. |

## 6. Coverage of the 64 cells

Status: **D** direct (a named source actor scores here), **X** derived (assembled from sourced institutions or phenomena, no single occupant), **E** crisis-state (a cell reached by another cell under strain). Confidence: **H** two or more independent source passages agree, **M** one passage plus judgment, **L** thin evidence, treat as a placeholder to revisit. Invented exemplar figures are marked †.

Full text for every cell is in the JSON file. The tables show the mapping.

### S = 1, Immutable Order

| Cell | Krynn archetype | Generic name replaced | Occupant | Exemplar | Engine CVF / mode | St | Cf | Sources |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `[1, 1, 1]` | **The Sealed Chronicle** | The Sealed Monolith | Aesthetic Order of Gilean / Great Library of Palanthas | Astinus of Palanthas | Hierarchy / Produce | D | H | SD-01 §2.2; AC-03 §1.3 |
| `[1, 1, 2]` | **The Blood-Oath Tribes** | The Autonomous Cloister | Que-Shu plainsmen (tribal law, chieftain's line, spirit shamanate) | Chieftain Arrowhead | Hierarchy / Produce | D | M | AT-01 §2.2; AC-04 |
| `[1, 1, 3]` | **The Mountain Sealed** | The Sanctum Bastion | Thorbardin and the Council of the Thanes (Hylar-led Life-Tree) | Thane Hornfel Kytur | Hierarchy / Deliver | D | M | WN-01 §2; AC-04 §4.2 |
| `[1, 1, 4]` | **The Dreaming Court** | The Monastic Hive | Silvanesti kingdom under Lorac Caladon (House Royal through House Mason) | Lorac Caladon | Hierarchy / Deliver | D | M | WN-01 §4; AC-04 §4.3 |
| `[1, 2, 1]` | **The Cursed Warden** | The Hermit Sentinel | Dargaard Keep: Lord Soth and his banshee escort | Lord Soth | Hierarchy / Produce | D | M | SD-01 §2.5; AC-03 §3.5 |
| `[1, 2, 2]` | **The Drowned Sanctuary** | The Fortified Enclave | Dimernesti (sea elves) beneath the Blood Sea Maelstrom | Apoletta | Hierarchy / Produce | D | H | SD-01 §2.3 (source scored [1,2,2]) |
| `[1, 2, 3]` | **The Measure-Bound Knights** | The Phalanx League | Knights of Solamnia, Crownguard literalists (Order of the Rose) | Derek Crownguard | Hierarchy / Deliver | D | H | WN-01 §8 (Measure vs Code) |
| `[1, 2, 4]` | **The Exodus Column** | The Totalitarian Commune | Qualinesti under Porthios's martial hawks (crisis-mode of the Court of the Sun) | Crown Prince Porthios | Hierarchy / Deliver | E | M | AT-01 §2.3; WN-01 §6 |
| `[1, 3, 1]` | **The Tithe-Vault of Belzor** | The Vault of Records | Temple of Belzor, Haven (priesthood, tithes, estate-confiscation rolls) | Judith | Market / Produce | D | M | SF-01 §2.2, §3.2 |
| `[1, 3, 2]` | **The Guild-City Cartel** | The Guild Cartel | Hope's End Merchants Guild and Revolutionary Council | The Lord Mayor of Hope's End | Market / Produce | D | H | BA-01 §2 Faction 2 |
| `[1, 3, 3]` | **The Gate-Tax Combine** | The Commercial Combine | Impostor court of 'Good King' Wilhelm of Blödehelm (toll gates, tax collectors, guard network) | King Wilhelm of Blödehelm (the impostor) | Market / Deliver | X | M | BA-01 §2 Faction 2–3 |
| `[1, 3, 4]` | **The Steel Treasury of Sanction** | The Corporate Directorate | Temple of Luerkhisis treasury and Sanction foundries underwriting the Dragonarmies | High Cleric Wyrllish | Market / Deliver | X | M | BA-01 §2 Faction 3; AC-03 |
| `[1, 4, 1]` | **The Pax Tharkas Mines** | The Penal Workhouse | Red Wing slave-mines and hobgoblin taskmasters at Pax Tharkas | Fewmaster Toede | Market / Produce | D | H | AT-01 §2.5 |
| `[1, 4, 2]` | **The Daergar Quarry-State** | The Armament Mill | Daergar dark dwarves (slave-quarries, blood-cults) in Thorbardin | A Daergar Quarry-Master † | Market / Produce | D | L | WN-01 §2 (Daergar) |
| `[1, 4, 3]` | **The Red Wing Legion** | The Imperial Legion | Red Dragonarmy under Highlord Verminaard (Draconian line cohorts) | Highlord Verminaard | Market / Deliver | D | H | AT-01 §2.5; AC-04 §3.1 |
| `[1, 4, 4]` | **The Draconian Brood** | The Biomechanical Hive | Sanction egg-corruption labs and the draconian cohorts they hatch | Dracart | Market / Deliver | D | H | AC-03 §5.1–5.2 |

### S = 2, Codified Protocol

| Cell | Krynn archetype | Generic name replaced | Occupant | Exemplar | Engine CVF / mode | St | Cf | Sources |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `[2, 1, 1]` | **The Hedge-School of Theobald** | The Hermetic Academy | Master Theobald's Academy of Magic near Solace | Master Theobald | Hierarchy / Produce | D | H | SF-01 §2.4, §3.3 |
| `[2, 1, 2]` | **The Whitestone Parley** | The Federated Sanctuary | Whitestone Council of free nations on Sancrist | Lord Gunthar uth Wistan | Hierarchy / Produce | D | M | WN-01 §9 |
| `[2, 1, 3]` | **The Conclave of Three Robes** | The Curia Network | Conclave of Wizards at the Tower of Wayreth (White, Red and Black Robes) | Par-Salian | Hierarchy / Deliver | D | H | SF-01 §2.3, §3.1; AC-03 §3.3–3.4 |
| `[2, 1, 4]` | **The Guild-Bound Mountain** | The Ecclesiastical State | Gnomes of Mount Nevermind (guilds, committees, Life Quest) | Gnosh | Hierarchy / Deliver | D | M | WN-01 §9, §11 (source scored [1,2,4], Adhocracy) |
| `[2, 2, 1]` | **The Barony Hearth** | The Chartered Freehold | Langtree barony and its self-sufficient winter economy | Baron Ivor of Langtree | Hierarchy / Produce | D | M | BA-01 §2 Faction 1 |
| `[2, 2, 2]` | **The Unspoiled City** | The Agricultural Shire | Palanthas Patrician Senate and Lord Amothus | Lord Amothus | Hierarchy / Produce | D | M | SD-01 §2.2; AC-04 §4.5 |
| `[2, 2, 3]` | **The Court of the Sun** | The Defensive Commonwealth | Qualinesti nation under Speaker Solostaran (peacetime Qualinost) | Speaker Solostaran | Hierarchy / Deliver | D | M | AT-01 §2.3 |
| `[2, 2, 4]` | **The Solamnic War Council** | The Constitutional Republic | Kalaman Citadel and the reformed Solamnic War Council | Lord Ambor | Hierarchy / Deliver | D | M | SD-01 §2.1 (source scored [2,2,4]) |
| `[2, 3, 1]` | **The Haven Counting-Houses** | The Merchant Banking House | Haven aldermen and merchant houses | An Alderman of Haven † | Market / Produce | D | L | SF-01 §3.2 |
| `[2, 3, 2]` | **The Dust-Port Consortium** | The Trade Port Consortium | Tarsis the Beautiful: Governor and Merchant Council | The Governor of Tarsis | Market / Produce | D | H | WN-01 §3; AC-04 §4.4 |
| `[2, 3, 3]` | **The Forge-Temple Combine** | The Logistical Trust | Daewar merchant-warriors of Thorbardin | A Daewar Thane † | Market / Deliver | D | L | WN-01 §2 (Daewar) |
| `[2, 3, 4]` | **The Steel Standard Exchange** | The Continental Trade Matrix | Ansalon-wide steel-piece currency and barter network | A Factor of the Steel Exchange † | Market / Deliver | X | M | AC-04 §5.1 |
| `[2, 4, 1]` | **The Seeker Chapterhouse** | The Colonial Charter Company | Solace chapter of the Seeker Theocracy (High Theocrat Hederick) | High Theocrat Hederick | Market / Produce | D | H | AT-01 §2.1 (source: Hierarchy) |
| `[2, 4, 2]` | **The Mad Baron's Company** | The Professional Mercenary Core | Baron Ivor's mercenary army (Center, Line, Flank, Archers, Warmage Division) | Baron Ivor of Langtree | Market / Produce | D | H | BA-01 §2 Faction 1 |
| `[2, 4, 3]` | **The Blue Wing Prefecture** | The Territorial Prefecture | Blue Dragonarmy under Highlord Kitiara uth Matar | Highlord Kitiara uth Matar | Market / Deliver | D | H | WN-01 §10; AC-04 §3.1 |
| `[2, 4, 4]` | **The Imperial Directorate** | The Imperial Directorate | Unified Dragonarmies under Emperor Ariakas at Neraka | Emperor Ariakas | Market / Deliver | D | M | SD-01 §2.5 (source scored [1,4,1]) |

### S = 3, Adaptive Heuristics

| Cell | Krynn archetype | Generic name replaced | Occupant | Exemplar | Engine CVF / mode | St | Cf | Sources |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `[3, 1, 1]` | **The Master Artificer's Tower** | The Master Artificer's Cell | Raistlin Majere in the Tower of High Sorcery at Palanthas | Raistlin Majere | Clan / Design | D | M | SD-01 §1; AC-03 §3.5; AC-02 §2.2 |
| `[3, 1, 2]` | **The Neidar Craft-Clans** | The Craft Fellowship | Neidar hill dwarves (Flint Fireforge's kin) | Flint Fireforge | Clan / Design | D | M | WN-01 §2 (Neidar); AC-02 §2.6 |
| `[3, 1, 3]` | **The Wild-Elf Wood** | The Ecological Tribe | Kagonesti of Southern Ergoth | A Kagonesti Chief † | Clan / Service | D | M | WN-01 §5 |
| `[3, 1, 4]` | **The Ice Folk Hearth** | The Decentralized Kin-Mesh | Ice Folk of Icewall Glacier | Harald Haarfagre | Clan / Service | D | M | WN-01 §7 (source scored [3,1,2]) |
| `[3, 2, 1]` | **The Groundside Camps** | The Frontier Outpost | Groundside outcasts and transient encampments beneath Solace | Gilon Majere | Clan / Design | D | L | SF-01 §2.1 |
| `[3, 2, 2]` | **The Free Canopy Commons** | The Free Towns League | Free Community of Solace and the Inn of the Last Home | Otik Sandath | Clan / Design | D | H | SF-01 §2.1, §3.4; AC-04 §4.1 |
| `[3, 2, 3]` | **The Whitestone Alliance** | The Mutualist Network | Whitestone Army under Laurana (knights, elves, militia, metallic dragons) | Laurana | Clan / Service | D | M | SD-01 §2.1, §2.4 (source scored Hierarchy) |
| `[3, 2, 4]` | **The Refugee Host** | The Citizen Militia Mesh | Refugee column of Pax Tharkas (humans, dwarves, Qualinesti children) under Elistan | Elistan of Haven | Clan / Service | D | M | AT-01 §2.4; WN-01 §1 |
| `[3, 3, 1]` | **The Wildcat Turncoat** | The Wildcat Prospector | Eben Shatterstone, ruined noble turned double agent | Eben Shatterstone | Adhocracy / Design | D | M | AT-02 §4.5; AT-01 §2.5 |
| `[3, 3, 2]` | **The Scrounger's Barter-Ring** | The Independent Caravan | Scrounger and the kender/half-kender quartermasters of Company C | Scrounger | Adhocracy / Design | D | H | BA-01 §2 Faction 4 |
| `[3, 3, 3]` | **The Dragonlance Forge-Venture** | The Venture Consortium | Theros Ironfeld and the smiths forging the first Dragonlances | Theros Ironfeld | Adhocracy / Service | X | M | WN-01 §9 |
| `[3, 3, 4]` | **The Waystation Mesh** | The Merchant Syndicate Mesh | Innkeepers, ostlers and caravan stops linking Haven, Solace and Qualinesti | A Roadhouse Keeper † | Adhocracy / Service | X | L | SF-01 §2.1; AC-04 §4.1 |
| `[3, 4, 1]` | **The Mud-Foot Raiders** | The Corsair Privateer | Fewmaster Toede's goblin irregulars (wolf-mounted scouts) | Fewmaster Toede | Adhocracy / Design | D | M | AT-01 §2.5; AT-02 §4.6 |
| `[3, 4, 2]` | **The Ice-Boat Flotilla** | The Raider Flotilla | White Dragonarmy under Highlord Feal-Thas (Thanoi, ice-nomads, Sleet) | Highlord Feal-Thas | Adhocracy / Design | D | M | AC-04 §3.1; WN-01 §7 |
| `[3, 4, 3]` | **The Black Wing Vanguard** | The Expansionist Vanguard | Black Dragonarmy under Highlord Lucien of Takar | Highlord Lucien of Takar | Adhocracy / Service | D | L | AC-04 §3.1; SD-01 §2.5 |
| `[3, 4, 4]` | **The Green Wing Swarm** | The Predatory Swarm | Green Dragonarmy under Salah-Khan and Cyan Bloodbane (goblin/ogre swarm, Kapak, poison) | Highlord Salah-Khan | Adhocracy / Service | D | M | AC-04 §3.1 |

### S = 4, Hyper-Entropy

| Cell | Krynn archetype | Generic name replaced | Occupant | Exemplar | Engine CVF / mode | St | Cf | Sources |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `[4, 1, 1]` | **The Gray Wanderer** | The Volatile Hermit | Fizban the Fabulous (Paladine in mortal guise), bound by divine non-interference | Fizban the Fabulous | Clan / Design | D | M | AC-03 §1.3; AT-02 §3.3 |
| `[4, 1, 2]` | **The Renegade Circle** | The Rogue Alchemical Cell | Renegade mages hunted by the Conclave | A Renegade Hedge-Mage † | Clan / Design | D | L | SF-01 §2.3; AC-03 §3.3 |
| `[4, 1, 3]` | **The Aghar Warrens** | The Shifting Tribe | Aghar (gully dwarves) of Xak Tsaroth and the Pax Tharkas mines | Bupu Bulp | Clan / Service | D | M | AT-01 §2.4; WN-01 §2 (Aghar) |
| `[4, 1, 4]` | **The Dream Made Flesh** | The Metamorphic Hive | Silvanesti under Cyan Bloodbane's nightmare (the crisis-metamorphosis of the Dreaming Court) | Cyan Bloodbane | Clan / Service | E | M | WN-01 §4; AC-04 §4.3 |
| `[4, 2, 1]` | **The Wayfaring Rangers** | The Free Drifter | Itinerant rangers, bards and half-elf wanderers | Tanis Half-Elven | Clan / Design | D | M | AT-01 §2.1; AT-02 §2.1 |
| `[4, 2, 2]` | **The Sivak Phantom Cell** | The Phantom Cell | Sivak infiltrators of the Blue Wing | A Sivak Infiltrator † | Clan / Design | D | L | WN-01 §10; AC-03 §5.2 |
| `[4, 2, 3]` | **The Belzor Flock** | The Populist Wildfire | Fanatical commoners of the Cult of Belzor | A Grieving Widow of Haven † | Clan / Service | D | M | SF-01 §2.2 |
| `[4, 2, 4]` | **The Bonded Flight** | The Living Symbiont Collective | Metallic dragons and their soul-bonded Dragonlance riders | Silvara | Clan / Service | D | M | SD-01 §2.4 |
| `[4, 3, 1]` | **The Kender Wayfarers** | The Master Charlatan | Kender (Tasslehoff Burrfoot and his kin) | Tasslehoff Burrfoot | Adhocracy / Design | D | M | AT-02 §2.7; AC-02 §2.5 |
| `[4, 3, 2]` | **The Theiwar Shadow-Web** | The Shadow Smuggler Network | Theiwar dark dwarves and their secret pacts | Thane Realgar | Adhocracy / Design | D | M | WN-01 §2 (Theiwar) |
| `[4, 3, 3]` | **The Charlatan Circuit** | The Chaos Bazaar | Itinerant carnivals, illusionists and tonic-sellers | Waylan the Illusionist | Adhocracy / Service | D | M | SF-01 §2.5 |
| `[4, 3, 4]` | **The Orb Frenzy** | The Speculative Mania | Whitestone delegations under the influence of the Dragon Orb | Derek Crownguard | Adhocracy / Service | E | M | WN-01 §9 |
| `[4, 4, 1]` | **The Wyrm in the Ruin** | The Lone Apex Predator | Khisanth (Onyx) in flooded Xak Tsaroth | Khisanth | Adhocracy / Design | D | M | AT-02 §4.3 |
| `[4, 4, 2]` | **The Slave-Takers' Drive** | The Feral Corsair Crew | Plunder bands and slave-drives marching captives to Sanction and Neraka | Commander Kholos | Adhocracy / Design | X | L | BA-01 §2 Faction 3 |
| `[4, 4, 3]` | **The Plains-Host of Neraka** | The Scavenger Horde | Goblin, ogre and human mercenary legions bivouacked outside Neraka | A Hobgoblin Warlord † | Adhocracy / Service | D | M | SD-01 §2.5 |
| `[4, 4, 4]` | **The Maelstrom of Istar** | The Entropic Vortex | The Blood Sea vortex over drowned Istar (Zeboim's storm) | Zeboim | Adhocracy / Service | E | L | SD-01 §1; AC-03 §2.1–2.2 |

Totals: 54 direct, 6 derived, 4 crisis-state; 10 of 64 exemplars are invented archetype figures (†) because the sources name no suitable person.

## 7. Crisis metamorphosis paths in Krynn (SOC-03)

Each pair is one polity moving between cells under the pressure the text records. They give the GM a clock to run, not a fixed outcome.

| From | To | Trigger in the source | What flips |
| :--- | :--- | :--- | :--- |
| Dreaming Court `[1,1,4]` | Dream Made Flesh `[4,1,4]` | Lorac wields the Dragon Orb under Cyan Bloodbane's whisper (WN-01 §4) | S1 to S4: order becomes delirium, the coupling remains and becomes the contagion |
| Court of the Sun `[2,2,3]` | Exodus Column `[1,2,4]` | Red Wing takes the Abanasinian plain; elves pack for Southern Ergoth (AT-01 §2.3) | S2 to S1 and C3 to C4: protocol hardens, purity purge begins |
| Whitestone Parley `[2,1,2]` | Orb Frenzy `[4,3,4]` | Derek brings the Orb of Icewall to the council (WN-01 §9) | Neutral ground becomes an auction; Tasslehoff's throw ends it |
| Imperial Directorate `[2,4,4]` | Plains-Host `[4,4,3]` | Ariakas's crown or shield fails (SD-01 §2.5) | Command collapses into plunder bands and succession feuds |
| Hope's End Guild-City `[1,3,2]` | Refugee Host `[3,2,4]` (same citizen-mesh pattern) | Gate Tax, siege, apprentices on the walls (BA-01 §2) | Guild charter yields to a citizen mesh; monopoly becomes survival |

## 8. Implications for the repository (not applied)

1. **Loading the file.** Open `network/odv_archetype_matrix.html`, use the matrix upload button, pick `campaigns/Krynn_V3_Five_Book_Odyssey/odv_matrix_krynn.json`. The page then labels the matrix "Custom Mod (64 Archetypes)". It now loads automatically: the build discovers `campaigns/Krynn_V3_Five_Book_Odyssey/odv_matrix.json` (renamed from `odv_matrix_krynn.json`), and opening the campaign applies it as a per-cell overlay (see "Campaign Matrix Overlay" in `CONTEXT.md`). Re-run `Build-Suite.ps1` after editing the JSON.
2. **Campaign data.** Re-scoring 144 nodes was not done. The 90 placeholder `[2,2,2]` values should become unset under SYS-ODV-01 phase 5, then be authored from the ledger in section 4, not guessed. The V1, V2 and V3 presets share this matrix.
3. **Extractions.** The five `01_peoples_factions_and_councils.md` files carry vectors that will mislead any future import. Suggest a header note on each pointing here. `Sources/` is gitignored, so this is a local edit.
4. **Authoring skill.** `campaign-preset-builder` should score against the canonical dial text in section 2, not against extraction labels.
5. **Wiki.** New tracked files need wiki notes and `Build-Suite.ps1 --stamp-reviewed` per AGENTS.md; not run.
6. **Open source questions.** A crisis path for the gnome guild-mountain; Que-Shu secondary tribes; the Klar as a primary occupant of any cell; replacing the † figures with named characters if later passes find them.

## 9. Method and limits

- Evidence base: the seven-part extractions for each book and the five annotated-commentary files, not the novels directly. Page-level claims inherit the extractions' accuracy.
- Scores are judgments against stated rubrics. Confidence L cells (10) are placeholders for a second pass.
- Exemplar quotes are original lines written for play, not text from the novels.
