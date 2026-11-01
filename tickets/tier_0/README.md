# Tier 0: Baseline Settlement Substratum (Future Project Specification)
*System-Agnostic Fantasy World Baseline Framework*
*Location: `tickets/tier_0/`*

---

## 1. Executive Purpose & Architectural Vision

**Creator Studio** excels at high-concept socio-political tension, eschatological rifts, and ideological conflicts across pointcrawl graphs. However, it previously carried a major implicit assumption:
> *The Game Master already has the mundane scaffolding of an average fantasy world running in their head.*

When a GM sits down to build a world from scratch, or when an automated simulation evaluates supply chains, that assumption collapses if there is no underlying baseline framework for basic survival:
* Where does the grain come from to feed a Sovereign Hub?
* How does a remote satellite survive a seasonal drought without an industrial aqueduct?
* What mundane institutions exist before high-order alchemy or imperial bastions arrive?

**Project Tier 0** provides the universal, modular substrate for the **average mundane needs of any fantasy world**, bridging raw subsistence with Creator Studio's Tier 1–5 macro engines.

---

## 2. The Dual-Mode UX Philosophy

To prevent worldbuilding fatigue, Tier 0 enforces the platform's core dual-mode approach:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 0 SUBSTRATUM MODES                         │
├───────────────────────────────────┬────────────────────────────────────┤
│   MODE A: SMOOTH GENERIC          │   MODE B: GRANULAR MODULARITY      │
│   ("Checkbox Through" / Fast Track)│   (Deep Authoring / Power Sandbox) │
├───────────────────────────────────┼────────────────────────────────────┤
│ • "Enable Baseline Substratum: ON"│ • Settlement population thresholds │
│ • All nodes gain implicit food,   │ • Exact bushel/calorie accounting  │
│   water, shelter, and order       │ • Drought & blight vulnerability   │
│ • No socket micromanagement       │ • Modular socketing of farms/wells │
│ • 0 extra minutes for the GM      │ • Local crisis & famine threat dials│
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **Smooth Generic ("Checkbox Through")**:
   When toggled ON, every settlement node automatically inherits an implicit baseline substratum. GMs can proceed straight to Tier 1–5 political tension without worrying about anyone starving.
2. **Granular Modularity (Deep Authoring)**:
   When toggled OFF or customized, GMs can inspect, slot, or disrupt individual mundane survival systems, turning logistical survival into active player quests.

---

## 3. The 8 Mundane Survival Domains

Tier 0 organizes baseline worldbuilding into 8 discrete domains:

1. **Food & Caloric Subsistence (DOM-01)**:
   Dry-grain agriculture, foraging perimeters, river fishing, pastoral grazing, winter root cellars.
2. **Water & Hydrology (DOM-02)**:
   Artesian wells, snowmelt streams, communal cisterns, gravity flumes, drought reserves.
3. **Shelter & Civic Municipal Fabric (DOM-03)**:
   Wattle-and-daub / timber / stone masonry, chimney soot ventilation, road paving, fire brigades.
4. **Peacekeeping & Perimeter Defense (DOM-04)**:
   Village bailiff, town watch, earthen berms, ditch-and-palisade, communal horn alarms.
5. **Trade, Barter & Mundane Craft (DOM-05)**:
   Weekly market square, village smithy, cooperage, leather tannery, barter ratios & copper coin.
6. **Health, Folk Medicine & Midwifery (DOM-06)**:
   Herbal leachcraft, bone setting, midwifes, willow-bark fever tea, quarantined pest huts.
7. **Waste, Drainage & Sanitation (DOM-07)**:
   Midden heaps, night-soil collection, sewer runnels, burial grounds, stray dog scavengers.
8. **Folklore, Shrine & Communal Rites (DOM-08)**:
   Wayside shrines, hearth gods, harvest festival vigils, local taboos, funeral rites.

---

## 4. How to Use This Project Tracker (Zero-Overhead Workflow)

To prevent breaking or remaking the main Creator Studio platform every time you have an idea:

1. **Add Notes Anytime**: Drop raw markdown thoughts, rules of thumb, or research directly into `tickets/tier_0/notes/` (e.g. `notes/my_agriculture_idea.md`).
2. **Add Domain Tickets**: Copy `T0_TEMPLATE.md` into `tickets/tier_0/tickets/` when you want to define a specific modular mechanic or settlement profile.
3. **Batch Compile & Visualize**: Whenever you want to review all progress at once, run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\tickets\tier_0\Build-Tier0Tracker.ps1
   ```
   This automatically parses all notes and tickets, extracts metadata, and regenerates `tier_0_project_visualizer.html` offline!
