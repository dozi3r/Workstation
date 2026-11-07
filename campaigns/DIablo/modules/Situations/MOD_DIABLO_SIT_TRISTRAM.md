---
id: "MOD_DIABLO_SIT_TRISTRAM"
title: "Tristram"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Authority: Quest-Giving-Townsfolk", "Material: Item-Appraisal-And-Resale", "Material: Healing-Scroll-Stock", "Defense: Mana-Shield-Scroll-Stock", "Lore: Safe-Hub-Base", "Material: Ground-Item-Storage"]
requires: ["Material: Dungeon-Loot", "Lore: Dungeon-Access-Route"]
tarot_affinity: ["The Hermit", "The Tower", "The Moon"]
culture_quadrant: "Market"
operational_profile: "Service"
mtg_color: "White"
hub_eligibility: "always"
summary: "A medieval village built over a labyrinth of dungeons. It is the party's fixed home base: the dungeon changes, the town does not. Its townsfolk hand out most quests and trade for what the party hauls up from below."
standalone_fallback: "Run Tristram as a one-session hub scenario. The party arrives, meets the townsfolk, takes two or three requests tied to something below the town, and has to choose what loot to carry back and what to leave in storage."
injected_mechanics:
  output_dial:
    level_1: "Tristram is a quiet market town where the party trades loot, buys scrolls and collects a few simple requests."
    level_2: "Quests pile up, shop stock is thin, and the party must pick which errands to run and which loot to carry back."
    level_3: "The town is in trouble, with its water poisoned or a great curse spreading, and the townsfolk press the party to act now."
    level_4: "The town is overrun or abandoned, services stop, and whatever is under the church has reached the surface."
  threat_clocks:
    - name: "The Curse Spreads Through Town"
      ticks: 6
      advances_when: "The party ignores the cathedral or the quests it feeds, or comes back empty-handed."
    - name: "Town Services Collapse"
      ticks: 4
      advances_when: "A townsperson is hurt, a shop runs short of stock, or the party fails to deliver what the town asked for."
  yields_resource: "Quick cash and trade for loot, identification of magical items, healing and mana shield scrolls, free storage of items, and the quests that point toward the dungeon."
linked_entity: "N_TRISTRAM"
related: ["MOD_DIABLO_SIT_CURSED_CATHEDRAL", "MOD_DIABLO_SIT_DIABLO_DUNGEON", "MOD_DIABLO_SIT_DUNGEON", "MOD_DIABLO_ABI_TOWN_PORTAL", "MOD_DIABLO_SIT_FISSURE_BEHIND_PEPIN_HOUSE", "MOD_DIABLO_SIT_CRYPT_IN_THE_GRAVEYARD"]
---

# MODULE MOD_DIABLO_SIT_TRISTRAM: Tristram

A medieval village built over a labyrinth of dungeons. It is the party's fixed home base: the dungeon changes, the town does not. Its townsfolk hand out most quests and trade for what the party hauls up from below.

### Dramatic Premise
A town that depends on adventurers to fetch what it needs + a labyrinth that sits directly beneath its streets = every errand is a bargain with the thing under the church.

### Core Premise
Tristram is the one fixed place in a world of shifting dungeons. The geography of the town does not change while what lies below does. The townsfolk give most of the quests and ask for things taken from the dungeon, then trade them for other items or services. The cathedral is cursed and leads into the labyrinth, and the town sits on top of it all.

### GM Placement & Synergies
Place Tristram at the start of the campaign and as the repeated return point between dungeon trips. It consumes dungeon loot and quest results, and feeds back scrolls, identification, quests, storage and rest. It connects to the Cursed Cathedral, the Town Portal, the wider dungeon, the fissure behind Pepin's house and the crypt in the graveyard. An arrival goes well when the party comes in with loot, a clear request and a sense of what to carry. It goes badly when they arrive wounded, with nothing to trade and a town that needs more than they have.

### 5D Sensory Pentagon
- **Physical environment:** A medieval village with a central fountain, a stream to the southeast, a graveyard, a church with a cursed cathedral, a blacksmith and the witch's hut across the water.
- **Behaviors:** Townsfolk each have something worth saying, ask for items snatched from the dungeon, and trade them for other items or services. Adventurers clean house before hauling goodies back, and drop surplus items on the ground as storage.
- **Relationships:** Cain stands near the fountain. Pepin the Healer and Gillian have houses of their own. Adria the Witch lives across the stream. Ogden keeps the tavern. Wirt whispers for attention behind Gillian's house. All of them depend on whoever goes below.
- **Attitudes:** Hopeful and needy. The townsfolk treat the adventurer as the only one who can fix things, and a wounded townsman begs for help at the cathedral entrance.
- **Values:** Useful trade, practical services, quick cash for unwanted treasure, and a base the party can return to after each excursion.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Cain and the townsfolk):** The town survives by giving quests to the one who can go below, and by trading fairly with them when they return. *Leverage:* They hold the quests, the identification of magical items and the shop inventories. *Blind spot:* They are helpless without an adventurer and cannot protect the town themselves.
* **Main opponent (The desecrated cathedral):** The church over the dungeon has been turned to something that preys on the town from beneath. *Leverage:* It is the entry to the labyrinth and the source of the town's troubles. *Blind spot:* It is tied to one place, and the party can always climb back out of it.
* **Thematic shadow (Adria the Witch):** Power is a trade good. Knowledge and scrolls are for sale to anyone who brings her something useful. *Leverage:* She supplies healing and mana shield scrolls and buys unwanted treasure. *Blind spot:* She lives apart across the stream and is treated warily by the rest of the town.
* **Tertiary outcast (Wirt):** The town ignores him, so he deals quietly with anyone who will listen. *Leverage:* He whispers offers from behind Gillian's house that others will not make. *Blind spot:* No one trusts him, and he has little of his own to bargain with.

### Output Dial
- **Level 1:** Tristram is a quiet market town where the party trades loot, buys scrolls and collects a few simple requests.
- **Level 2:** Quests pile up, shop stock is thin, and the party must pick which errands to run and which loot to carry back.
- **Level 3:** The town is in trouble, with its water poisoned or a great curse spreading, and the townsfolk press the party to act now.
- **Level 4:** The town is overrun or abandoned, services stop, and whatever is under the church has reached the surface.

### Threat Clocks
- **The Curse Spreads Through Town [6 Ticks]:** advances when The party ignores the cathedral or the quests it feeds, or comes back empty-handed.
- **Town Services Collapse [4 Ticks]:** advances when A townsperson is hurt, a shop runs short of stock, or the party fails to deliver what the town asked for.

### Yields
Quick cash and trade for loot, identification of magical items, healing and mana shield scrolls, free storage of items, and the quests that point toward the dungeon.

### Source Figures (verbatim evidence; not read by the app)
```
Price of Scroll of Healing: 50 gold pieces each
```

### Related Modules
- `MOD_DIABLO_SIT_CURSED_CATHEDRAL`
- `MOD_DIABLO_SIT_DIABLO_DUNGEON`
- `MOD_DIABLO_SIT_DUNGEON`
- `MOD_DIABLO_ABI_TOWN_PORTAL`
- `MOD_DIABLO_SIT_FISSURE_BEHIND_PEPIN_HOUSE`
- `MOD_DIABLO_SIT_CRYPT_IN_THE_GRAVEYARD`

### Standalone Fallback
Run Tristram as a one-session hub scenario. The party arrives, meets the townsfolk, takes two or three requests tied to something below the town, and has to choose what loot to carry back and what to leave in storage.
