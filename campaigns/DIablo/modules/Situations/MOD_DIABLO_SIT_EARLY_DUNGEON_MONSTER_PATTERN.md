---
id: "MOD_DIABLO_SIT_EARLY_DUNGEON_MONSTER_PATTERN"
title: "Early Dungeon Monster Pattern"
kind: "situation"
ip: "DIABLO"
set: "Diablo"
tier: "Tier 2 (Topological & Biome Anchors)"
pipeline_tier: 2
provides: ["Lore: Monster-Behavior-Primer", "Ecology: Early-Dungeon-Foe-Mix", "Defense: Target-Priority-Doctrine"]
requires: ["Defense: Party-Positioning", "Lore: Scout-Intelligence"]
tarot_affinity: ["The Magician", "The Hermit"]
culture_quadrant: "Clan"
operational_profile: "Service"
mtg_color: "Red"
hub_eligibility: "never"
summary: "The first dungeon levels pair Skeletons, Archers, Fallen Ones and Zombies so that their tactics teach the patterns of tougher foes later on. The party learns by reading speed and range and by choosing the order of attack."
standalone_fallback: "Run it as a one-room tactics puzzle. A fast skittish pack, a middling rank of footsoldiers with a few ranged shooters behind them, and a slow heavy hitter that slips away all enter in one fight. The party wins by choosing the order in which to deal with them."
injected_mechanics:
  output_dial:
    level_1: "The party reads the speeds correctly and clears the rooms in a sensible order with only minor scrapes."
    level_2: "Shooters and footsoldiers arrive together, and the party must corner the Archers while the Skeletons press."
    level_3: "The party misjudges the order, so the Fallen Ones swarm them while Archers pin them and a Zombie lumbers into the gap."
    level_4: "The party is caught in the open between fast chasers, a firing line and a heavy hitter and is overrun before it can regroup."
  threat_clocks:
    - name: "Pack Closes the Gap"
      ticks: 6
      advances_when: "The party ignores the speed differences or lets ranged monsters set up at a distance."
    - name: "Stragglers Return"
      ticks: 4
      advances_when: "A Zombie escapes and the party fails to double back for it."
  yields_resource: "The party learns reusable tactical patterns of speed, range and order of attack that transfer to tougher foes deeper down."
---

# MODULE MOD_DIABLO_SIT_EARLY_DUNGEON_MONSTER_PATTERN: Early Dungeon Monster Pattern

The first dungeon levels pair Skeletons, Archers, Fallen Ones and Zombies so that their tactics teach the patterns of tougher foes later on. The party learns by reading speed and range and by choosing the order of attack.

### Dramatic Premise
A cautious delver who reads how each monster moves + a mixed pack that punishes the wrong order of attack = tactics learned the hard way, or a rout.

### Core Premise
The early dungeon teaches by example. Skeletons with an Archer variation, quick Fallen Ones and slow Zombies each model a tactic found in worse monsters later. The recommended order is Fallen Ones first, then the Skeleton footsoldiers (cornering Archers first if they appear), then back for any Zombies that escaped. The first thing to note on meeting a monster is its speed relative to the rest of the level.

### GM Placement & Synergies
Place this in the first stretch of a delve or at the start of a campaign as a tutorial encounter. It consumes party positioning and scouting information, and it feeds the party's habits for deeper levels, including the Counselor-type monsters in the depths, which do not chase and are the exception. An arrival goes well when the party identifies speeds and sequences its targets. It goes badly when the party stands still in the open and lets the shooters set up.

### 5D Sensory Pentagon
- **Physical environment:** Narrow early dungeon rooms where the shooters can find a distance to fire from and the pack can close in. Fallen Ones hide from the Archers.
- **Behaviors:** Most monsters chase the party once it enters their room, even those with ranged attacks. Ranged monsters find the party, then set up at a distance to fire. Fallen Ones close the gap fastest, and Zombies lag behind.
- **Relationships:** Fallen Ones hide from the Archers. Skeletons are the footsoldiers, some with an Archer variation. Zombies are slower and may slip away to be hunted later.
- **Attitudes:** Fallen Ones are fast but merely bothersome. Skeletons are middle-of-the-road. Zombies are slow but can deal out serious damage.
- **Values:** Reading speed relative to the rest of the level matters most. Dealing with threats in the right order matters more than raw force.

### Dramatic Opposition Web (4-Corner Matrix)
* **Establishment (Skeletons):** Middle-of-the-road footsoldiers holding the line and chasing intruders. *Leverage:* Steady numbers, with Archer variants adding range. *Blind spot:* Unremarkable, so they are dangerous mainly when the party ignores the order of attack.
* **Main opponent (Archers):** Find the intruder, set up at a distance, and fire. *Leverage:* Ranged pressure that punishes a party caught in the open. *Blind spot:* Exposed once cornered, and cornering them first is the recommended answer.
* **Thematic shadow (Fallen Ones):** Fast but merely bothersome, they hide from the Archers and are first to close the gap. *Leverage:* Speed that forces the party to commit early. *Blind spot:* Weak individually, so they are dealt with first.
* **Tertiary outcast (Zombies):** Slow and relentless, able to deal serious damage. *Leverage:* Heavy blows against anyone who lets them close. *Blind spot:* Slowness lets them be escaped, and the party must double back for any that got away.

### Output Dial
- **Level 1:** The party reads the speeds correctly and clears the rooms in a sensible order with only minor scrapes.
- **Level 2:** Shooters and footsoldiers arrive together, and the party must corner the Archers while the Skeletons press.
- **Level 3:** The party misjudges the order, so the Fallen Ones swarm them while Archers pin them and a Zombie lumbers into the gap.
- **Level 4:** The party is caught in the open between fast chasers, a firing line and a heavy hitter and is overrun before it can regroup.

### Threat Clocks
- **Pack Closes the Gap [6 Ticks]:** advances when The party ignores the speed differences or lets ranged monsters set up at a distance.
- **Stragglers Return [4 Ticks]:** advances when A Zombie escapes and the party fails to double back for it.

### Yields
The party learns reusable tactical patterns of speed, range and order of attack that transfer to tougher foes deeper down.

### Standalone Fallback
Run it as a one-room tactics puzzle. A fast skittish pack, a middling rank of footsoldiers with a few ranged shooters behind them, and a slow heavy hitter that slips away all enter in one fight. The party wins by choosing the order in which to deal with them.
