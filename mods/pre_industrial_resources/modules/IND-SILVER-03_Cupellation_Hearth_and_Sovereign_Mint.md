---
id: "IND-SILVER-03"
title: "Cupellation Hearth & Sovereign Mint"
set: "Set_A_Infrastructure_and_Engineering"
category: "Mining_and_Metallurgy"
tier: 1
pipeline_tier: 2
chain_id: "CHAIN-SILVER"
chain_stage: 3
chain_role: "manufacturing"
provides:
  - "Currency: Silver-Coinage"
  - "Ore: Lead-Slag"
requires:
  - "Metal: Crude-Bullion"
  - "Fuel: Charcoal-or-Coal"
  - "Alloy: Crucible-Steel"
  - "Metal: Forged-Iron"
  - "Material: Bone-Ash"
culture_quadrant: Hierarchy
operational_profile: Refine / Certify
mtg_color: White / Black
node_prerequisites:
  security: Walled Mint Court with a Single Guarded Gate and Strongroom
  hearth: Bellows-Blown Cupellation Hearth Lined with Bone Ash
  charter: Sovereign Warrant to Coin with a Sealed Trial Box
standalone_fallback: "If bone ash runs out, the refiners line the hearth with lime and crushed shell; the litharge soaks away more slowly, each melt takes twice as long and coin output halves."
injected_mechanics:
  coin_fineness_dial:
    level_1: "Cold Hearth - No crude bullion arriving; furnaces banked, dies locked in the strongroom and the coiners unpaid."
    level_2: "True Standard - Cupels drink the litharge cleanly, the assayer passes each melt, and coins are struck at lawful weight and fineness, with samples set aside for the trial box."
    level_3: "Light Coin - Assays fudged or blanks cut short; merchants weigh every coin and rumours of thin silver reach foreign markets."
    level_4: "Cried Down - Debasement exposed; the sovereign devalues the coin by proclamation, calls it in for melting, and mint officials face the gallows."
  threat_clocks:
    trial_box_clock: "Trial Box Clock [6 Ticks] - Each month of coining adds a tick; when full a jury of outside assayers opens the sealed box, and any coin under standard means a fine, removal or prison for the Master of the Mint."
    clipped_edge_clock: "Clipped Edge Clock [4 Ticks] - Each week that clippers and sweaters shave the soft hammered coin adds a tick; when full the market refuses the coin at face value and weighs every piece."
  yields_resource: "Struck Silver Coin (400 Coins/Day from two striking benches)"
---
# Cupellation Hearth & Sovereign Mint (`IND-SILVER-03`)
> **Industry Chain**: `CHAIN-SILVER` (Stage 3: `manufacturing`)

## 1. Architectural Overview & Operational Loop
Crude bullion is melted in bone-ash cupels inside a draft-controlled hearth, where an oxidizing blast burns away base lead and base impurities into the porous hearth lining. The purified molten silver is cast into bars, rolled to precise thickness, blanked with iron punches, and struck between heavy steel dies bearing the sovereign seal. The required inputs of Metal: Crude-Bullion, Fuel: Charcoal-or-Coal, and Material: Bone-Ash, shaped with Metal: Forged-Iron punches and Alloy: Crucible-Steel dies, are refined and stamped into gleaming Currency: Silver-Coinage, and the spent hearth leaves Ore: Lead-Slag (litharge and hearth slag) that still carries lead.

The hearth runs near a thousand degrees under a bellows blast; the lead turns to litharge and soaks into the bone lining; what does not soak in runs off as a dark hearth slag. Litharge cake and slag are broken out of the spent hearth and carted away for resmelting. Every melt is fire-assayed before coining: a weighed sample is cupelled and the silver bead weighed. Coiners strike each blank by hand between a lower die set in a block and a hammered upper die; upper dies crack far sooner, so the engraver is never idle. Merchants pay the assay charge and the sovereign's share before receiving coin.
- **Refining Hearth:** bone-ash lined and bellows-blown.
- **Assay Room:** furnace, cupels and a fine balance.
- **Striking Benches:** die blocks and counted blanks.
- **Strongroom:** dies and the sealed trial box.

## 2. Granular Disposition Baseline (`[S, E, C]`)
- **Baseline Coordinate**: `[1, 2, 4]` — **Sovereign Treasury** (`Hierarchy`).
- **Sociological Rationale**: High-security royal minting operations enforce absolute bureaucratic accountability, strict auditing, and severe penal consequences for assay tampering.

## 3. Stationed Entities & Roster Prototypes

### Key Personnel (NPC Prototypes)
- name: "Royal Assayer Lord Valerian Vance"
  role: "Master of the Mint"
  disposition: "[1, 2, 4]"
  motivation: "Guarantee exact coin weight and fineness to uphold crown credit across foreign realms."
- name: "Die-Sinker Kaelen Swift"
  role: "Master Engraver"
  disposition: "[2, 4, 2]"
  motivation: "Craft tamper-proof dies with micro-detailing that prevents counterfeiting rings."
- name: "Ottilie Marchbank"
  role: "Mint Assayer and Keeper of the Trial Box"
  disposition: "[1, 1, 4]"
  motivation: "Keep her assay book honest while the mint's best customer presses her to pass thin melts, knowing that when debasement is found the assayer hangs first."
- name: "Corvin Delacour"
  role: "Licensed Bullion Merchant to the Mint"
  disposition: "[4, 4, 3]"
  motivation: "Turn the bullion he advanced to the mine crews into coin before his creditors call in his notes, even if it means a little copper in every melt and a gift for the assayer."

<!-- BEGIN_NPC_MIRROR (generated by infographic/tools/sync_npc_mirror.js - do not edit by hand) -->
```text
name: Royal Assayer Lord Valerian Vance
role: Master of the Mint
motivation: Guarantee exact coin weight and fineness to uphold crown credit across foreign realms.
disposition: [1, 2, 4]
```
```text
name: Die-Sinker Kaelen Swift
role: Master Engraver
motivation: Craft tamper-proof dies with micro-detailing that prevents counterfeiting rings.
disposition: [2, 4, 2]
```
```text
name: Ottilie Marchbank
role: Mint Assayer and Keeper of the Trial Box
motivation: Keep her assay book honest while the mint's best customer presses her to pass thin melts, knowing that when debasement is found the assayer hangs first.
disposition: [1, 1, 4]
```
```text
name: Corvin Delacour
role: Licensed Bullion Merchant to the Mint
motivation: Turn the bullion he advanced to the mine crews into coin before his creditors call in his notes, even if it means a little copper in every melt and a gift for the assayer.
disposition: [4, 4, 3]
```
<!-- END_NPC_MIRROR -->

### Material Stocks & Items (Item Prototypes)
- **Bone-Ash Cupel** (`Tool`): Compressed calcined bone hearth designed to absorb base metal oxides during fire assay.
- **Steel Coinage Die** (`Tool`): Hardened tool-steel punch engraved with the sovereign's likeness and mint marks.
- **Struck Silver Coin** (`Commodity`): Hand-hammered coin of the sovereign standard, sold by the bag to merchants and paymasters.
- **Litharge Cake** (`Commodity`): Heavy grey cake of lead oxide dug from the spent hearth lining, sold back to lead workers.
- **Sealed Trial Box** (`Relic`): Locked chest of sample coins that only an outside jury may open.

## 4. Operational Dials & Failure Modes (Quests & Crises)
- **Dial — `Coin Fineness Purity` (`0–10`)**: At `0–3`, debased alloy sparks inflation and merchant riots. At `8–10`, sterling purity establishes absolute trust in regional trade, and full-weight soft silver draws clippers and sweaters who shave it for profit.
- **Quest Hook — *The Clipped Shillings***: An audit reveals widespread coin clipping originating within the mint guards, threatening Lord Valerian with treason charges if he fails to unmask the ringleader. Assayer Ottilie Marchbank privately tells the party the clipping is a decoy: Corvin Delacour's last six melts were thin, and the trial box will be opened in forty days.

## 5. GM Socket Placement & Supply Synergy
* **Input Dependency:** Refines `Metal: Crude-Bullion` from the **Stamping Mill & Patio Amalgamation Floor (`IND-SILVER-02`)** on hearths fed with `Fuel: Charcoal-or-Coal` from the **Charcoal Burner's Mound (`IND-CHARCOAL-01`)** or the **Deep Colliery and Coking Ovens (`MINE-COAL-01`)**, lined with `Material: Bone-Ash` from the **Civic Abattoir (`IND-CATTLE-02`)**; strikes with dies of `Alloy: Crucible-Steel` from the **Crucible Steelworks and Foundry (`IND-STEEL-01`)** and blanks, punches and tongs of `Metal: Forged-Iron` from the **Blacksmith Forge (`IND-IRON-03`)**.
* **Output Transmission:** Issues `Currency: Silver-Coinage`, an end product of the silver chain, to merchants, paymasters and the treasury, and carts `Ore: Lead-Slag` (litharge cake and hearth slag) to the **Lead Smelting Bole & Plumbery (`IND-LEAD-01`)** for resmelting.
* **Tactical Chokepoint:** The strongroom and the die chest. Steal a die and anyone can strike coin that passes as the sovereign's own.

## 6. Vague Game Hazards
* **Hearth Fume:** Leaning over the refining hearth in the full blast leaves refiners choking and dizzy ($1\text{d}6$ damage per hour of close work).
* **Molten Spill:** A cracked cupel or slipped crucible throws white-hot silver across the floor ($2\text{d}6$ fire damage).
* **Litharge Dust:** Breaking out spent hearth lining and litharge cake raises a yellow-red lead dust that sickens the breakers over time ($1\text{d}4$ damage per day and a creeping colic).
* **Treason Search:** Anyone caught with clippings, blanks or a die inside the mint court is seized on the spot and held for the hangman.
