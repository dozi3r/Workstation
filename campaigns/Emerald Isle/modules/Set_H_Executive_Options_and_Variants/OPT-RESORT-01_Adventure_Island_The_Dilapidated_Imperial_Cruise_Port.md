---
id: OPT-RESORT-01
title: Adventure Island: The Dilapidated Imperial Cruise Port & Aquatic Shallows
set: Set H (Executive Options & Setting Addons)
tier: Tier 2 (Topological & Biome Anchor / Social Spark)
pipeline_tier: 2
is_option: true
option_group: adventure_island_resort
option_type: biome_topological_variant
default_active: false
provides: ["Topology: Dilapidated-Boardwalk-Promenade", "Ecology: Brackish-Lagoon-Shallows", "Trade: Sunken-Luxury-Salvage"]
requires: ["Geography: Littoral-Coastline-Swamp"]
culture_quadrant: Market / Adhocracy
operational_profile: Service / Extraction / Relic Barter
mtg_color: Blue / Black / Green
prerequisites: [The Blackmire Swamp (Node 5) or The Coastal Shelf (Node 6)]
standalone_fallback: "Can replace any swamp or coastal lagoon node with a rotting luxury cruise port and water-park resort colonized by indigenous aquatic tribes."

injected_mechanics:
  resort_integrity_dial:
    level_1: "Gilded Ghost Resort: Decaying grand arcades remain above water; aquatic tribes trade pearls for rum peacefully at the dock."
    level_2: "Silt Inundation: Lower casino floors and swim-up bars submerge in brackish slime; boardwalk timbers groan under foot traffic."
    level_3: "Rotting Guerilla Turf: Aggressive aquatic ambushers defend flooded vaults with coral spears; swamp crocodiles nest in honeymoon cabanas."
    level_4: "Total Mangrove Reclamation: The boardwalks collapse into the sulfur bog; predatory deep-sea abominations swim through the grand ballroom."
  threat_clocks:
    boardwalk_collapse_clock: "Boardwalk Structural Collapse Clock [4 Ticks] - Rotted pilings buckle under sudden combat or gear weight."
    aquatic_territorial_surge_clock: "Aquatic Territorial Surge Clock [6 Ticks] - Native lagoon tribes push war canoes to reclaim the dry beaches."
  yields_resource: "Aged Imperial Vintage Rum, Corroded Casino Chips, Mother-of-Pearl Tridents & Carnival Facade Scrap"
---

# MODULE OPT-RESORT-01: ADVENTURE ISLAND: THE DILAPIDATED IMPERIAL CRUISE PORT

### 1. The Cancun-Cozumel Quid Pro Quo

Settlers and adventurers often wonder why **The Blackmire Swamp (Node #5)** is crisscrossed by decaying iron boardwalks, painted stucco archways, and rusted revolving turnstiles.

The answer is an imperial treaty known as the **"Adventure Island Concession"**:
* When the continental empire agreed to finance the military outpost at Node #1 and ship political convicts across the sea, high-ranking patricians and merchant guilds demanded a luxury kickback.
* On the sunnier southeastern shore—where a slender white-sand beach strip directly abuts the primeval mangrove swamp (Node #5 and Node #6)—they erected **"Adventure Island"**: a garish, duty-free leisure resort styled after a tropical cruise terminal (complete with cabana strips, roulette pavilions, swim-up rum palapas, and pleasure barges).
* For two golden decades, imperial aristocrats vacationed on the outer beach while prisoners broke rock in the interior mines just twenty miles away.

```text
  [THE CARIBBEAN BEACH FRONT]           [THE RESORT PROMENADE]            [THE BLACKMIRE SWAMP]
    Outer Coral Reef & Surf      <───>   Dilapidated Boardwalks    <───>   Carnivorous Pitcher Bogs
   (White Sand, Beached Barges)         (Sunken Casinos & Cabanas)         (Sulfur Vapors, Crocodile Nests)
```

---

### 2. The Decay & The Aquatic Colonization

When political upheaval shook the mainland, the passenger cruise lines abruptly ceased. Left without maintenance crews or imported supplies, the resort was swiftly swallowed by the swamp:

* **Sunken Architecture:** Warm, brackish swamp water flooded the ground-level boutiques, buffet halls, and swimming pools.
* **The New Sovereigns (The Silt-Merfolk):** The indigenous aquatic race of the littoral shelf moved in and occupied the rotting structures. They found the garish ruins utterly fascinating:
  - **Slot Machine Oracles:** Tribal shamans interpret the clanking levers and spinning painted cherries of rusty slot machines as divine prophecies.
  - **Cocktail Reliquaries:** Sealed cellars of imported vintage rum and colorful glassware are treated as consecrated ancestral draughts.
  - **Neon-Dye Warpaint:** Warriors scrape peeling Day-Glo enamel from fiberglass waterslides to paint glowing totems upon their scales.

---

### 3. Tactical Exploration & Tabletop Encounters

* **The Boardwalk Hazard:** Walking the elevated boardwalks requires caution. Under combat stress or explosive impacts, the `Boardwalk Structural Collapse Clock` advances. A failure drops characters directly into 8 feet of warm, stagnant bog water teeming with giant carnivorous leeches and acid pitcher sludge (`ECOL-04`).
* **The Smuggler's Port of Call:** Despite its rot, Adventure Island remains the best black-market port on the island. Corsair skiffs (`Node 20`) routinely slip past the reef to trade black powder and refined silver to the aquatic chieftains in exchange for sunken imperial gold, pearl jewelry, and concentrated venom secretions.

---

## Authoritative Specifications & Cross-References
* **Authoring Engine Standard**: Governed by [Campaign Authoring Engine SRD (Section 6: Module Architecture & Section 8: Resource Tag Taxonomy)](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/srd/authoring_engine_srd.md).
* **Tabletop Runtime Mechanics**: Governed by [Universal Adventure Framework SRD (Section 2: Threat Clocks, Section 3: Hazard Severity Tiers & Section 8: Fallback Execution)](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/docs/srd/adventure_framework_srd.md).
* **Sociological Alignment**: Mapped to 64-Cell Disposition Matrix in [Tarot Decision Framework](file:///c:/Users/Milo/Documents/Antigravity/Creator_Full_Standalone/sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md).
