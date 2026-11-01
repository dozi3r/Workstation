---
id: CWT-###
title: "<Target Module / Scenario Title>"
pipeline_tier: 1 | 2 | 3 | 4 | 5
target_set: Set A | Set B | Set C | Set D | Set E | Set F | Set G
tarot_affinities: ["<Major Arcana 1>", "<Major Arcana 2>"]
culture_quadrant: "Hierarchy | Market | Clan | Adhocracy"
mtg_color: "W | U | B | R | G | Colorless"
status: "discovery | ready_for_authoring | in_drafting | in_editorial | ready_to_compile | shipped"
blocked_by: ["None (can start immediately) | CWT-###"]
blocks: ["CWT-###"]
grounded_prerequisites: ["<Concept or resource that must already exist in campaign>"]
grounded_yields: ["<New concept or resource established by this ticket>"]
provides: ["<Domain: Identifier>"]
requires: ["<Domain: Identifier>"]
standalone_fallback: "<How the module degrades gracefully if upstream supply/lore is severed>"
---

# TICKET CWT-###: <TITLE>

## 1. Narrative Premise & Central Dramatic Argument
*Drawing from `writing-discovery` (Mazin / Egri)*

* **The Stasis / The Lie:** What entrenched, flawed assumption do the locals or authorities cling to?
* **The Crucible / Conflict:** What event or pressure shatters that Lie and forces active collision?
* **Egri's Syllogism:**  
  $$\text{[Fatal Flaw / Worldview]} + \text{[Crucible Pressure]} = \text{[Thematic Result / Crisis]}$$
* **The Truth / Synthesis:** What moral or tactical reality is proven in the climax?

---

## 2. 4-Corner Opposition & Faction Dynamic
*Drawing from `writing-discovery` (Truby)*

* **Corner 1 (The Establishment / Primary Protagonist-Foil):** The visible authority defending the status quo.
* **Corner 2 (The Zealot / Main Opponent):** Attacks the establishment's weakness ruthlessly; believes entirely in their righteous cause.
* **Corner 3 (The Thematic Shadow):** Shares the same goal as the players or reformers, but employs corrupt, cynical, or catastrophic shortcuts.
* **Corner 4 (The Tertiary Foil / Outcast):** An external or fringe voice exposing the blind spots of all three other corners.

---

## 3. Injected Mechanics & Tabletop Primitives
*Conforms to `adventure_framework_srd.md`*

### 3.1 4-Level Dynamic Dial
* **Level 1 (Dormant / Folklore / Marginal):** Baseline state; DC 10 checks (Light Severity Tier).
* **Level 2 (Standard / Supervised / Operational):** Active condition; DC 13 checks (Moderate Severity Tier).
* **Level 3 (Overdriven / Surge / Exposed):** High output with hazardous fallout; DC 16 checks (Severe Severity Tier).
* **Level 4 (Catastrophic / Meltdown / Revolt):** Full structural rupture or incursion; DC 20 / Lethal Severity Tier.

### 3.2 Threat Clocks
* **[Clock 1 Name] [4 Ticks / 6 Ticks / 8 Ticks]:**  
  * Trigger: What soft move or neglected resource ticks this clock?
  * Consequence when full: What hard move triggers immediately?
* **[Clock 2 Name] [4 Ticks / 6 Ticks]:**

---

## 4. Logistical & Resource Flow Contract
*Conforms to `authoring_engine_srd.md` (Section 8)*

* **Input Prerequisites (`requires`):**
  * Environmental: `[Geography: ... | Ecology: ...]`
  * Material Supply: `[Power: ... | Chem: ... | Material: ...]`
* **Output Yields (`provides`):**
  * Yield 1: `[Type: Identifier]`
  * Yield 2: `[Type: Identifier]`
* **Standalone Fallback Mode:**
  * Exact mechanical and narrative behavior if input prerequisites are blocked or severed.

---

## 5. Scene Calculus & Encounter Sparks
*Drawing from `writing-generation` (Nash / McKee / Stein)*

* **Encounter 1: The Arrival Collision:**
  * *Collision ($><$):* Who collides over what immediate, irreconcilable goal?
  * *Polarity Shift ($+ \to -$):* How does the party's status or resources pivot?
  * *Bifocal Subtext:* What is spoken aloud vs. what is the unspoken agenda?
* **Encounter 2: The Severance Crisis:**
  * *Dilemma:* Irreconcilable goods or best among bad options.

---

## 6. Definition of Done & Acceptance Criteria

- [ ] Target module markdown written to `modules/Set_X/<ID>_<Slug>.md`
- [ ] Frontmatter contains valid `pipeline_tier`, `provides`, `requires`, `fallback`, `tarot_affinity`, and `culture_quadrant`
- [ ] Mechanics strictly bound to Universal Hazard Tiers (Light / Moderate / Severe / Lethal)
- [ ] Authoritative cross-reference block appended to bottom of markdown
- [ ] Module registered in `network/modules_manifest.json`
- [ ] Suite compiled via `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1`
- [ ] Zero build warnings, zero syntax errors, and zero CORS errors in browser
