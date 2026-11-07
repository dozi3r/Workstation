---
id: "MOD_DIABLO_SIT_UNIQUES"
title: "Uniques"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 4 (Dynamic Narrative Sparks & Dilemmas)"
pipeline_tier: 4
provides: ["Material: Magical-Item-Reward", "Lore: Named-Monster-Lead", "Ecology: Empowered-Horde"]
requires: ["Ecology: Ordinary-Monster-Kin", "Lore: Dungeon-Setting"]
tarot_affinity: ["The Tower", "The Devil", "Strength"]
culture_quadrant: "Clan"
operational_profile: "Produce"
mtg_color: "Red"
hub_eligibility: "never"
summary: "Named, randomly placed monsters that are devastating versions of ordinary monster types. They resemble their kin apart from coloring or armaments, hit harder and resist more, and lead a horde of more dangerous siblings who share the Unique's special magic until it dies. Slaying one yields a magical item."
standalone_fallback: "Run it as a single hunt: the party meets a named, oddly colored brute at the head of an empowered pack in any dark place. They break the pack's borrowed magic by killing the leader, and the leader drops one magical item."
injected_mechanics:
  output_dial:
    level_1: "A named monster is spotted with only a thin escort, a manageable fight that dangles a reward."
    level_2: "The Unique leads a horde of noticeably tougher siblings, and the party must work to reach and fell the leader."
    level_3: "The Unique's resistances and its empowered pack overwhelm a straight fight, forcing the party to retreat, split the horde, or find a way to isolate the leader."
    level_4: "A Unique with a lethal magic ability and a large horde corners the party, and every minion fights with borrowed power until the leader is somehow brought down."
  threat_clocks:
    - name: "The Horde Closes In"
      ticks: 6
      advances_when: "The party lingers in the open, fights the minions piecemeal, or fails to locate the Unique."
    - name: "Borrowed Power Holds"
      ticks: 4
      advances_when: "The party's attacks are wasted on resistant targets or the Unique stays shielded behind its minions."
  yields_resource: "A magical item from the slain Unique, plus the collapse of the horde's special magic."
---

# MODULE MOD_DIABLO_SIT_UNIQUES: Uniques

Named, randomly placed monsters that are devastating versions of ordinary monster types. They resemble their kin apart from coloring or armaments, hit harder and resist more, and lead a horde of more dangerous siblings who share the Unique's special magic until it dies. Slaying one yields a magical item.

### Dramatic Premise
Heroes who need rewards worth the risk + a named brute whose borrowed magic empowers its whole horde = they must decapitate the pack to claim the prize.

### Core Premise
A Unique is a named, randomly placed monster that is a devastating version of an ordinary type. It looks like its kin apart from coloring or armaments, hits harder, resists more, and usually leads more dangerous ordinary siblings. It grants its horde its special magic ability, and the minions lose that ability when it dies. Killing it rewards the party with a magical item.

### GM Placement & Synergies
Place a Unique as a mid-delve encounter in any area where ordinary monsters of its type already live, so the contrast is obvious. It consumes the party's resources and attention and feeds them a magical item, which can tie into item-property hooks. An arrival goes well when the party spots the unusual coloring early, targets the leader, and watches the horde falter. It goes badly when they treat it as a routine fight, meet the leader's resistances unprepared, and are ground down by empowered minions.

### 5D Sensory Pentagon
- **Physical environment:** A familiar monster type seen wrong: unusual coloring or armaments, ringed by a pack of ordinary-looking kin that are plainly tougher than they should be.
- **Behaviors:** The horde moves and fights as the Unique's retinue, hitting harder than their kind normally would, while the leader shrugs off attacks that would fell its brethren.
- **Relationships:** Leader and minions are bound by the Unique's special magic ability. The minions hold it only as long as the leader lives.
- **Attitudes:** Dread at a foe that is a devastating version of its kin, set against grim satisfaction that there is a reward for the trouble.
- **Values:** Risk answered by reward: killing the named monster pays out a magical item.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Unique):** A named, devastating version of its kin that leads by empowering the horde. *Leverage:* Greater punch, more resistances, and a special magic ability shared with its minions. *Blind spot:* Its horde's power depends wholly on its survival, and its death strips that power away.
* **Main opponent (The adventurers):** A hard fight is worthwhile if the reward is a magical item. *Leverage:* They can target the leader and break the horde's borrowed magic. *Blind spot:* They must survive the stronger minions and the Unique's resistances long enough to do it.
* **Thematic shadow (The empowered horde):** Ordinary kin made more dangerous by a leader's gift. *Leverage:* Numbers and amplified strength. *Blind spot:* Their edge is borrowed and vanishes when the Unique dies.
* **Tertiary outcast (Ordinary monsters of the same type):** Plain brethren who lack the leader's mark and share only its shape. *Leverage:* They are easy to mistake for the Unique's kin and can mask its location. *Blind spot:* They are overshadowed and are the weaker version of their kind.

### Output Dial
- **Level 1:** A named monster is spotted with only a thin escort, a manageable fight that dangles a reward.
- **Level 2:** The Unique leads a horde of noticeably tougher siblings, and the party must work to reach and fell the leader.
- **Level 3:** The Unique's resistances and its empowered pack overwhelm a straight fight, forcing the party to retreat, split the horde, or find a way to isolate the leader.
- **Level 4:** A Unique with a lethal magic ability and a large horde corners the party, and every minion fights with borrowed power until the leader is somehow brought down.

### Threat Clocks
- **The Horde Closes In [6 Ticks]:** advances when The party lingers in the open, fights the minions piecemeal, or fails to locate the Unique.
- **Borrowed Power Holds [4 Ticks]:** advances when The party's attacks are wasted on resistant targets or the Unique stays shielded behind its minions.

### Yields
A magical item from the slain Unique, plus the collapse of the horde's special magic.

### Source Figures (verbatim evidence; not read by the app)
```
Experience relative to ordinary type: approximately double
```

### Standalone Fallback
Run it as a single hunt: the party meets a named, oddly colored brute at the head of an empowered pack in any dark place. They break the pack's borrowed magic by killing the leader, and the leader drops one magical item.
