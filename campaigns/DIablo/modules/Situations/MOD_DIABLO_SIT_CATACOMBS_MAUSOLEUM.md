---
id: "MOD_DIABLO_SIT_CATACOMBS_MAUSOLEUM"
title: "Catacombs Mausoleum"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Defense: Safe-Retreat-Route", "Lore: Mausoleum-Threshold"]
requires: ["Authority: Town-Sanctuary", "Ecology: Catacombs-Descent"]
tarot_affinity: ["Death", "Judgement"]
culture_quadrant: "Hierarchy"
operational_profile: "Deliver"
mtg_color: "White"
hub_eligibility: "candidate"
summary: "A mausoleum in the catacombs that opens when the party arrives, letting them return to town from that level."
standalone_fallback: "Run it as a one-shot: deep in a catacomb, a sealed mausoleum opens and offers the party a way back to the surface, at the risk of what slumbers in the tombs around it."
injected_mechanics:
  output_dial:
    level_1: "The mausoleum opens as the party arrives and the way to town is clear."
    level_2: "The mausoleum is open but the route to it is watched and the party must fight or sneak through."
    level_3: "The approach is contested by the catacombs' dead and retreat becomes a costly dash."
    level_4: "The exit is cut off or compromised and the party is trapped in the catacombs with no safe route home."
  threat_clocks:
    - name: "Tombs Awaken"
      ticks: 6
      advances_when: "The party lingers near the mausoleum, makes noise, or disturbs the catacombs' dead."
  yields_resource: "A reliable return path from the catacombs to town for recovery and resupply."
linked_entity: "N_CATACOMBS_MAUSOLEUM"
related: ["MOD_DIABLO_SIT_CURSED_CATHEDRAL", "MOD_DIABLO_SIT_TRISTRAM"]
---

# MODULE MOD_DIABLO_SIT_CATACOMBS_MAUSOLEUM: Catacombs Mausoleum

A mausoleum in the catacombs that opens when the party arrives, letting them return to town from that level.

### Dramatic Premise
Delvers who need a way out + a mausoleum that opens only once they reach the catacombs = escape that depends on how far they have gone.

### Core Premise
When the party reaches the catacombs, the mausoleum opens so they can return to town from that level. It rewards progress with a way home and ties the Cursed Cathedral's depths to Tristram.

### GM Placement & Synergies
Place it at the point where the party first enters the catacombs. It consumes the party's momentum and tempts them to retreat, and feeds scenes in Tristram and the Cathedral. An arrival goes well when the party reaches it intact and uses it to regroup. It goes badly when the route is contested, or when the party treats it as a guarantee and is caught by what stirs in the tombs.

### 5D Sensory Pentagon
- **Physical environment:** A mausoleum within the catacombs that opens on the party's arrival.
- **Behaviors:** Delvers reach the catacombs and the mausoleum opens to let them return to town.
- **Relationships:** It sits within the Cursed Cathedral's depths and connects that level to Tristram.
- **Attitudes:** Wary gratitude at an exit that appears only after progress.
- **Values:** Passage earned by descent, and the link between the sacred ruin and the town.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Cursed Cathedral):** The ruin holds its passages and decides who may use them. *Leverage:* The mausoleum opens only once delvers reach the catacombs. *Blind spot:* It is corrupted and cannot guarantee safe passage.
* **Main opponent (The catacombs' dead):** The tombs are theirs and intruders do not leave. *Leverage:* They crowd the approach to the mausoleum. *Blind spot:* They are tied to the catacombs and cannot easily follow past it.
* **Thematic shadow (Tristram):** The town at the far end of the passage needs delvers to return alive. *Leverage:* Offers rest and supply at the end of the route. *Blind spot:* Passive and unable to help those still in the catacombs.
* **Tertiary outcast (A lost delver in the catacombs):** Any exit is worth trusting when the tombs close in. *Leverage:* Knows where the mausoleum lies. *Blind spot:* Desperate and easily misled.

### Output Dial
- **Level 1:** The mausoleum opens as the party arrives and the way to town is clear.
- **Level 2:** The mausoleum is open but the route to it is watched and the party must fight or sneak through.
- **Level 3:** The approach is contested by the catacombs' dead and retreat becomes a costly dash.
- **Level 4:** The exit is cut off or compromised and the party is trapped in the catacombs with no safe route home.

### Threat Clocks
- **Tombs Awaken [6 Ticks]:** advances when The party lingers near the mausoleum, makes noise, or disturbs the catacombs' dead.

### Yields
A reliable return path from the catacombs to town for recovery and resupply.

### Related Modules
- `MOD_DIABLO_SIT_CURSED_CATHEDRAL`
- `MOD_DIABLO_SIT_TRISTRAM`

### Standalone Fallback
Run it as a one-shot: deep in a catacomb, a sealed mausoleum opens and offers the party a way back to the surface, at the risk of what slumbers in the tombs around it.
