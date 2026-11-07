---
id: "MOD_DIABLO_SIT_RANDOMLY_GENERATED_DUNGEON_WORLD"
title: "Randomly Generated Dungeon World"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Ever-Shifting-Depths", "Ecology: Reshuffled-Monster-Roster", "Material: Unpredictable-Arms-Cache"]
requires: ["Defense: Adaptable-Party", "Authority: Table-Consent-To-Improvise"]
tarot_affinity: ["The Wheel of Fortune", "The Fool", "The Moon"]
culture_quadrant: "Adhocracy"
operational_profile: "Design"
mtg_color: "Red"
hub_eligibility: "candidate"
summary: "The game's world is generated randomly: levels, weapons, monsters and the cast of characters change each time the game is started, so the same play-through is never repeated."
standalone_fallback: "Run it as a one-shot descent. Before play, shuffle the layout, the foes and the loot with random tables, and let the party learn each new level only by entering it. Nothing is carried over from a previous run, and no map is trusted."
injected_mechanics:
  output_dial:
    level_1: "The shuffle is a curiosity: new rooms, a few unfamiliar foes and some odd finds keep the party alert but comfortable."
    level_2: "The reshuffle bites: the party's chosen weapons and spells do not suit the foes that appear, and they must trade or improvise to keep going."
    level_3: "The world turns hostile to habit: plans fail repeatedly, supplies run thin and the party is forced to relearn how to fight as the cast around them changes."
    level_4: "Nothing known survives: the party enters a level wholly unlike any expectation, unprepared and underequipped, and the descent threatens to end them."
  threat_clocks:
    - name: "Preparation Eroded"
      ticks: 6
      advances_when: "The party relies on past knowledge, a stale map or a familiar tactic that the reshuffled world no longer honors."
    - name: "Arsenal Mismatch"
      ticks: 4
      advances_when: "The party meets foes their current arms and spells cannot answer, and has no chance to win, buy or barter replacements."
  yields_resource: "Fresh armaments and magic spells won, bought or bartered along the way, plus hard-won knowledge of a threat the party has now learned to counter."
---

# MODULE MOD_DIABLO_SIT_RANDOMLY_GENERATED_DUNGEON_WORLD: Randomly Generated Dungeon World

The game's world is generated randomly: levels, weapons, monsters and the cast of characters change each time the game is started, so the same play-through is never repeated.

### Dramatic Premise
Adventurers who rely on known routes and familiar foes + a world that reshuffles itself every time = they must win, buy or barter new means and learn each threat anew.

### Core Premise
The dungeon world is built fresh each time the game starts. Levels, weapons, monsters and nearly everything else are generated randomly, the cast shuffles and the possibilities shift. Whether the party plays as Rogue, Warrior or Sorcerer, each run is its own story. At the table, treat the shuffle as the point: the party must win, buy or barter for what they need and learn each foe as it comes, and the difficulty can be raised to suit their skill.

### GM Placement & Synergies
Place this as the framing condition of a whole descent rather than a single location. It consumes the party's assumptions and rewards improvisation, and it feeds any module that supplies foes, trade or loot, since all of those can be rolled fresh. It pairs naturally with the fixed-geography concept so that Tristram stays a stable anchor above the churn. An arrival goes well when the party treats each level as new, trades smartly and adapts. It goes badly when they cling to a plan from a past descent and discover it no longer applies.

### 5D Sensory Pentagon
- **Physical environment:** Labyrinthine levels and cavernous grottos whose layout is different each time the game starts.
- **Behaviors:** Delvers win, buy or barter armaments and magic spells, then learn to use them against a long list of foes.
- **Relationships:** The cast of characters shuffles, so allies and enemies shift between runs. Friends or enemies can also join over the Net.
- **Attitudes:** No play-through repeats, so confidence in past experience is misplaced. Every descent is treated as a first one.
- **Values:** Adaptability, resourcefulness and skill matter more than memorized solutions.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (The Dungeon Itself (as the generating order)):** The depths remake themselves so that no one can master them once and for all. *Leverage:* Control over what is found, who is met and where the passages lead. *Blind spot:* It offers no stable ground, so even its own agents cannot predict its next shape.
* **Main opponent (The Long List of Foes):** Every delver is prey, and the roster of monsters shifts to keep them off balance. *Leverage:* Variety and surprise: the party never knows exactly what waits below. *Blind spot:* They are only as dangerous as the party's lack of preparation and adaptability.
* **Thematic shadow (The Guide-Seeker (a delver who wants a fail-safe route)):** A single best solution must exist if only someone writes it down. *Leverage:* Shared notes, habit and confidence that save effort on familiar ground. *Blind spot:* Their certainty fails the moment the world reshuffles.
* **Tertiary outcast (The Barterer (a merchant of arms and spells)):** Everything is a trade, and what a delver lacks can be bought if the price is met. *Leverage:* Access to the armaments and magic spells that delvers need. *Blind spot:* Their stock is only as good as the party's coin and their willingness to deal.

### Output Dial
- **Level 1:** The shuffle is a curiosity: new rooms, a few unfamiliar foes and some odd finds keep the party alert but comfortable.
- **Level 2:** The reshuffle bites: the party's chosen weapons and spells do not suit the foes that appear, and they must trade or improvise to keep going.
- **Level 3:** The world turns hostile to habit: plans fail repeatedly, supplies run thin and the party is forced to relearn how to fight as the cast around them changes.
- **Level 4:** Nothing known survives: the party enters a level wholly unlike any expectation, unprepared and underequipped, and the descent threatens to end them.

### Threat Clocks
- **Preparation Eroded [6 Ticks]:** advances when The party relies on past knowledge, a stale map or a familiar tactic that the reshuffled world no longer honors.
- **Arsenal Mismatch [4 Ticks]:** advances when The party meets foes their current arms and spells cannot answer, and has no chance to win, buy or barter replacements.

### Yields
Fresh armaments and magic spells won, bought or bartered along the way, plus hard-won knowledge of a threat the party has now learned to counter.

### Source Figures (verbatim evidence; not read by the app)
```
Dungeon levels: 16
```

### Standalone Fallback
Run it as a one-shot descent. Before play, shuffle the layout, the foes and the loot with random tables, and let the party learn each new level only by entering it. Nothing is carried over from a previous run, and no map is trusted.
