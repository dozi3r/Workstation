---
id: "MOD_DIABLO_SIT_CHAMBER_OF_BONE"
title: "Chamber of Bone"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Infravision-Oddity", "Ecology: Bone-Vault-Hazard"]
requires: ["Defense: Dark-Sight-Method", "Signal: Heat-Vision-Sense"]
tarot_affinity: ["The Moon", "Death", "The Hermit"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "Black"
hub_eligibility: "never"
summary: "A dungeon area built around a main room. The source only hints that its surroundings behave differently under infravision, so the rest is left for the table to fill in."
standalone_fallback: "Run it as a one-room crawl. The party reaches a bone-strewn main chamber and finds that heat-sight or similar darkvision reveals something different outside the room than inside it. They decide whether to investigate the difference or leave."
injected_mechanics:
  output_dial:
    level_1: "The chamber is an eerie bone-filled room, and the infravision trick is only a curious quirk."
    level_2: "The oddity outside the main room points to a real hidden feature that the party must work around."
    level_3: "The hidden feature turns hostile and the party is caught between the room and the dark beyond."
    level_4: "What the chamber concealed breaks loose and the party must flee or be buried among the bones."
  threat_clocks:
    - name: "The Chamber Notices"
      ticks: 4
      advances_when: "The party lingers, probes the periphery, or makes noise in or around the main room."
  yields_resource: "A revealed secret about the chamber's layout or hidden contents, plus safe knowledge of how to see what others miss."
linked_entity: "N_CHAMBER_OF_BONE"
---

# MODULE MOD_DIABLO_SIT_CHAMBER_OF_BONE: Chamber of Bone

A dungeon area built around a main room. The source only hints that its surroundings behave differently under infravision, so the rest is left for the table to fill in.

### Dramatic Premise
Curious explorers who trust their special senses + a chamber that looks different once they step outside its main room = a discovery they cannot unsee, or a trap they walked into.

### Core Premise
The canon gives only a hint: the main room is notable, and infravision used outside it is worth trying. Treat the room as a bone-heavy anchor, and let the strangeness live in the surrounding space, where sight does not behave as the party expects. Everything beyond that hint is a GM judgement.

### GM Placement & Synergies
Place it as a short side detour deep in a dungeon, after the party has settled into relying on their senses. It consumes a Dark-Sight-Method and feeds Lore or a hazard that the next scene can use. It goes well when the party experiments and learns something. It goes badly when they treat the main room as the whole chamber and walk into what the periphery was hiding.

### 5D Sensory Pentagon
- **Physical environment:** A main room of piled bone, with the passages beyond it dark and strange to sight.
- **Behaviors:** Explorers test their darkvision at the edge of the main room and compare what they see inside and outside.
- **Relationships:** The chamber stands apart from the rest of the dungeon. Its main room is the anchor, and the outer area is the part to be probed.
- **Attitudes:** Playful curiosity, as the source's "for grins" suggests, shading into unease.
- **Values:** Experimentation, observation, and the nerve to look at what others avoid.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The delvers' conventional wisdom):** The main room is the place that matters, so clear it and move on. *Leverage:* It offers a simple, proven route through the chamber. *Blind spot:* It never looks at the periphery, where the difference is.
* **Main opponent (Whatever lurks beyond the main room):** The chamber's secrets are meant to be found only by those who look the wrong way. *Leverage:* Darkness, the unexpected, and the main room's distraction. *Blind spot:* It is revealed by the same senses it exploits.
* **Thematic shadow (The over-curious scout):** Every sense must be tested and every oddity poked. *Leverage:* Willingness to try what others will not. *Blind spot:* Recklessness, because the reward is unknown.
* **Tertiary outcast (The skittish survivor):** The chamber should be left alone. *Leverage:* Memory of what went wrong for earlier visitors. *Blind spot:* Fear keeps the warnings vague, so nobody can act on them.

### Output Dial
- **Level 1:** The chamber is an eerie bone-filled room, and the infravision trick is only a curious quirk.
- **Level 2:** The oddity outside the main room points to a real hidden feature that the party must work around.
- **Level 3:** The hidden feature turns hostile and the party is caught between the room and the dark beyond.
- **Level 4:** What the chamber concealed breaks loose and the party must flee or be buried among the bones.

### Threat Clocks
- **The Chamber Notices [4 Ticks]:** advances when The party lingers, probes the periphery, or makes noise in or around the main room.

### Yields
A revealed secret about the chamber's layout or hidden contents, plus safe knowledge of how to see what others miss.

### Standalone Fallback
Run it as a one-room crawl. The party reaches a bone-strewn main chamber and finds that heat-sight or similar darkvision reveals something different outside the room than inside it. They decide whether to investigate the difference or leave.
