---
file_path: "sociology/01_Core_Cultural_Quadrants.md"
title: "MODULE SOC-01: THE FOUR CULTURAL QUADRANTS"
volume: "vol-6"
kind: "Sociology Specification"
current_hash: "75dc2e803cab8fe3"
reviewed_hash: "75dc2e803cab8fe3"
stale: false
size_bytes: 8225
line_count: 105
---

# MODULE SOC-01: THE FOUR CULTURAL QUADRANTS

<!-- BEGIN_CUSTOM_NOTES -->
### 1. Architectural Purpose & Theoretical Foundation
`sociology/01_Core_Cultural_Quadrants.md` (**Module SOC-01**) is the macro-sociological foundation of **Volume VI: Sociology Hermeneutics & Tarot Matrix Engine**. It adapts Kim Cameron and Robert Quinn's **Competing Values Framework (CVF, 1999)**—derived from Quinn & Rohrbaugh's spatial model of organizational effectiveness—into a deterministic behavioral engine for pointcrawl settlements, bastions, syndicates, and cults.

Rather than treating faction alignment as moral good vs. evil, `SOC-01` models every institution along two orthogonal structural tensions. An organization cannot maximize both poles of either axis simultaneously; optimizing one pole creates an inescapable operational blind spot:
- **Axis Y — Structural Stability vs. Flexibility (`S` Dial in [[File:sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md]])**:
  - *Flexibility / Dynamic Entropy (`S >= 3`)*: Organic adaptation, decentralized initiative, tolerance for operational error, and high improvisation. Vulnerable to infighting and lack of enduring infrastructure.
  - *Stability / Predictable Order (`S <= 2`)*: Standardized operating procedures (SOPs), rigid chains of command, and defensive fortifications. Vulnerable to bureaucratic paralysis when confronted with out-of-manual anomalies.
- **Axis X — Internal vs. External Boundary Focus (`E` Dial in [[File:sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md]])**:
  - *Internal Focus / Centripetal Cohesion (`E <= 2`)*: Mutual aid, member preservation, doctrinal unity, and kinship loyalty. Insular and suspicious of foreign alliances.
  - *External Focus / Centrifugal Rivalry (`E >= 3`)*: Territorial expansion, market dominance, resource extraction, and competitive leverage. Treats personnel as expendable capital.

### 2. The Four CVF Cultural Archetypes & Tabletop Mechanics

| Quadrant | Coordinate Split (`[S, E]`) | Core Action & Motto | Leader Archetype | Justice & Social Debt | Fatal Structural Flaw |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Quadrant A: The Clan** | `S >= 3, E <= 2`<br>*(Flexible + Internal)* | **"Collaborate"**<br>*"We stand together, or we drown together."* | Facilitator / Mentor / Patriarch | **Restorative**: Banishment or restitution; once vouched, demands unconditional mutual defense. | **Consensus Paralysis**: Marathon elder council debates while perimeter defenses burn. |
| **Quadrant B: The Adhocracy** | `S >= 3, E >= 3`<br>*(Flexible + External)* | **"Create"**<br>*"First to invent, last to surrender."* | Visionary / Artificer / Maverick | **Pragmatic**: Crimes forgiven if the offender provides salvage or invents a breakthrough solution. | **Exhaustion & Anarchy**: Constant pivoting burns through lives and capital; zero enduring institutions. |
| **Quadrant C: The Market** | `S <= 2, E >= 3`<br>*(Stable + External)* | **"Compete"**<br>*"Results justify the balance sheet."* | Hard-Driver / Producer / Cartel Boss | **Punitive & Financial**: Debtor workhouses, crippling fines, bounty hunters, and contract liens. | **Moral Attrition & Sabotage**: Cutthroat internal quotas breed paranoia; subordinates sell out masters. |
| **Quadrant D: The Hierarchy** | `S <= 2, E <= 2`<br>*(Stable + Internal)* | **"Control"**<br>*"Protocol is life; deviation is extinction."* | Coordinator / Monitor / High Arbiter | **Inquisitorial**: Mandatory quarantine, transit papers, biometric bands, and summary penal labor. | **Brittle Rigidity**: Paralyzed by unrecorded horrors; sentries wait for orders from dead superiors. |

### 3. Vague Game Conversion Dials & Friction Checks
Section 3 of `SOC-01` provides a rapid `1-to-5` dial conversion (**Stability Dial** and **External Focus Dial**) and a `2d6` **Friction Check** modifier table when player characters negotiate across cultural boundaries:
- Proposing collective sacrifice to a **Market** faction imposes **Disadvantage / `-2`**.
- Proposing an unsanctioned, rule-breaking shortcut to a **Hierarchy** faction triggers **Alarm / Immediate Arrest**.
- Proposing a mercenary legal contract to a **Clan** faction induces **Deep Insult / Loss of Trust**.

### 4. Visual Diagrams & Downstream Compiler Consumers
- **Associated Reference Diagrams**: Illustrated by [[File:sociology/4_culture_types.png]], [[File:sociology/Culture-Diagram-Clean.png]], [[File:sociology/1-s2.png]] (flagged under [[Ticket:SYS-AUDIT-01]]), and synthesized in [[File:sociology/00 sociology all.png]].
- **Algebraic Formalization**: Formalized into the `getCvfQuadrant(s, e)` derivation inside [[File:tarot/generate_tarot_matrix.js]] and [[File:sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md]], which classify all 64 archetypes in [[File:sociology/07_Granular_64_Disposition_Matrix.md]] and all 264 Major Arcana profiles in [[File:sociology/08_Tarot_Sociology_Matrix.md]].
- **Cross-Cutting Series**: Analyzed in [[Series:series_c_sociology_and_tarot_hermeneutics]] and consolidated in [[File:sociology/SOCIOLOGY_MASTER_COMPENDIUM.md]].
<!-- END_CUSTOM_NOTES -->
