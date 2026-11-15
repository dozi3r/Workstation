---
id: MINE-GRAPHITE-01
title: Plumbago Drift Mine
set: Set A (Infrastructure & Engineering)
tier: Tier 3 (Infrastructural Supply Chain Anchor)
pipeline_tier: 3
chain_id: CHAIN-GRAPHITE
chain_stage: 1
chain_role: extraction
provides: ["Mineral: Graphite"]
requires: ["Timber: Mine-Props"]
culture_quadrant: Hierarchy / Clan
operational_profile: Produce / Exchange
mtg_color: White / Black
node_prerequisites:
  geology: Black Lead Pipes and Nodules in Hard Fell Rock
  drainage: Pick-Cut Drainage Level Below the Workings
  security: Guardhouse Built Over the Mine Mouth
standalone_fallback: "If no props can be had, the proprietors seal the drift and sell from stockpile only, which doubles the price of black lead and sends every crucible-maker hunting for smugglers."

injected_mechanics:
  mine_mouth_dial:
    level_1: "Sealed Years - The drift is shut and walled; a lone keeper watches the empty guardhouse while prices climb."
    level_2: "Opening Season - Miners follow the black pipe by candlelight; nodules come out soft and clean, needing little dressing."
    level_3: "Full Working - Night and day shifts; every miner stripped and searched at the guardhouse door."
    level_4: "Raided Mouth - Armed men storm the guardhouse; the drift lies open and the stockroom is emptied by dawn."
  threat_clocks:
    black_lead_smuggling: "Boot-Lining Clock [6 Ticks] - Nodules leave the mine in boots, hair and hollow tools; each tick puts more false-priced wad on the black market."
    drainage_level_flood: "Drowned Drift Clock [4 Ticks] - The drainage level silts; water climbs into the lower pipes as the workings go deeper."
  yields_resource: "Hand-Picked Plumbago Nodules (2 Hundredweight/Day in an Opening Season)"
---

# MODULE MINE-GRAPHITE-01: PLUMBAGO DRIFT MINE

### 1. Drift & Security Architecture

The plumbago drift is a small, jealously guarded hole in a bare fellside, worked only in short seasons and then walled up again so that the black lead stays scarce and dear.

* **Black Lead Pipes:** Irregular pockets and inclined pipes of soft, greasy graphite running through hard rock. They are hard to find and easy to empty; a good pocket can be cleared in days, then the miners must hunt again.
* **Drainage Level & Timbered Drift:** A long, low tunnel cut with picks and wedges to let water out from below, with timber props set wherever the rock is broken. Drainage is the constant fight as the workings go deeper.
* **Guardhouse & Search Room:** A stone house built directly over the mine mouth, with a barred stockroom for the sorted nodules. Every miner going off shift is stripped and searched, and the house is locked and garrisoned through the sealed years.

### 2. GM Socket Placement & Supply Synergy
* **Input Dependency:** Consumes `Timber: Mine-Props` delivered from the sawmills to brace the drift and the broken ground around each pipe.
* **Output Transmission:** Ships locked casks of `Mineral: Graphite` to the **Bell and Artillery Bronze Foundry (`IND-BRONZE-01`)**, where it is blended with clay into fire-proof crucibles and used to dress casting moulds.
* **Tactical Chokepoint:** The proprietors will not sell at the mine. Every legitimate cask moves under seal to a distant buyer, so anyone who controls the road controls the founders' crucibles.

### 3. Notable Characters & Personnel

```text
name: Warden Hask Ellory
role: Guardhouse Keeper & Proprietors' Agent
motivation: Keep the mine sealed through the lean years and catch whoever is carrying nodules down the valley.
disposition: [3, -1, 2]
```

```text
name: Mabbet Sowerby
role: Pipe-Finder & Veteran Miner
motivation: Find the next black pipe before the season closes, and quietly sell one bootful to pay off her son's debts.
disposition: [-1, 1, 0]
```

### 4. Vague Game Hazards
* **Wet Drift Collapse:** Broken rock around a cleared pipe slumps once its graphite is gone; exploring old pockets without fresh props risks a cave-in ($2\text{d}8$ bludgeoning damage).
* **Guardhouse Justice:** Being caught with black lead on the person, or receiving it, brings armed pursuit and a sentence of years of exile labor rather than a fine.

### Key Personnel (NPC Prototypes)
- name: "Jory Pattle"
  role: "Valley Carrier & Receiver of Stolen Wad"
  disposition: "[-2, 2, -1]"
  motivation: "Buy nodules from searched-but-careless miners and pass them to crucible-makers who ask no questions, cutting the good stuff with false wad when buyers are blind."
- name: "Proprietor's Factor Lenna Crowse"
  role: "Shareholders' Accountant & Cask Dispatcher"
  disposition: "[2, 1, 3]"
  motivation: "Decide when stock is low enough to reopen the drift, and keep the sealed price high without starving the foundries into finding another source."
