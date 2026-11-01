---
file_path: "sociology/04_Sensory_Pentagon_Generator.md"
title: "MODULE SOC-04: THE 5-DIMENSION CULTURAL PENTAGON"
volume: "vol-6"
kind: "Sociology Specification"
current_hash: "75abb1011dbb7ca5"
reviewed_hash: "75abb1011dbb7ca5"
stale: false
size_bytes: 8963
line_count: 85
---

# MODULE SOC-04: THE 5-DIMENSION CULTURAL PENTAGON

<!-- BEGIN_CUSTOM_NOTES -->
### 1. Architectural Purpose & Theoretical Foundation
`sociology/04_Sensory_Pentagon_Generator.md` (**Module SOC-04**) bridges macro-level faction sociology with immediate, room-level sensory immersion at the gaming table. Adapted from **Boris Groysberg, Jeremiah Lee, Jesse Price, and J. Yo-Jud Cheng's *Harvard Business Review* Multi-Dimensional Culture Architecture**, `SOC-04` decomposes institutional culture into **Five Tangible Dimensions** (`Behaviors`, `Relationships`, `Attitudes`, `Values`, and `Physical Environment`), each parameterized on a **`1d6` scale** from totalitarian rigidity (`1`) to feral entropy (`6`).

When player characters cross a settlement gate or infiltrate a guildhall, GMs either roll `5d6` to procedurally generate a textured outpost in 30 seconds or read the deterministic 5D radar coordinates pre-computed from a node's `[S, E, C]` vector.

### 2. The Five Sensory Dimensions (`1d6` Scale Summary)

| Dimension | Focus & Sensory Channel | Rating `1` (Rigid / Totalitarian) | Rating `3–4` (Pragmatic / Communal) | Rating `6` (Feral / Entropic) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Behaviors** | *Discipline Style & Acoustic Atmosphere* | **Strict Iron Whip**: Cane-wielding patrols, enforced silence, clicking boots. Unscheduled speech triggers interrogation. | **Pragmatic Routine (`3`) / Boisterous Fellowship (`4`)**: Sizzling stalls or tavern ballads (`+2` gossip when buying grog). | **Feral Chaos**: Unchecked brawling, gunshots into the air; any sign of weakness invites muggers. |
| **2. Relationships** | *Authority Gradient & Communication* | **Autocratic God-Emperor**: Unseen rulers, wax directives, herald megaphones. Requires noble contacts. | **Mercenary Contract (`3`) / Elder Consensus (`4`)**: Itemized invoices or open town brazier debates. | **Secret Brotherhood**: Dummy mayors fronting covert syndicates; requires thieves' cant awareness checks. |
| **3. Attitudes** | *Psychological Safety & Foreigner Stance* | **Lethal Paranoia**: Mistakes treated as treason; outsiders assumed to be saboteurs. Failed social check = arrest. | **Wary Neutrality (`3`) / Inquisitive Opportunism (`4`)**: Perimeter bazaar trade; exotic relics fetch `150%` value. | **Desperate Recklessness**: Suicidal high-risk gambits; outsiders conscripted as shock-troops with huge bounties. |
| **4. Values** | *The Sacred Core vs. Expendable Currency* | **The Law's Letter**: Statute is sacred; human comfort and mercy are expendable. | **Silver Balance (`3`) / Survival of the Clan (`4`)**: Solvency or bloodline preservation overrides foreign treaties. | **Individual Liberty**: Refusal of masters even if lighting a torch attracts apex predators. |
| **5. Environment** | *Architectural Layout & Olfactory Decor* | **Fortified Panopticon**: Central watchtowers, dressed granite, caustic lye and bleach; stealth penalized. | **Merchant Shallows (`3`) / Communal Longhouses (`4`)**: Canvas awnings and salted eel, or peat hearths (`-1` extra fatigue). | **Sunken Ruins / Shanty Trenches**: Rusted sheet metal in muddy ravines; movement halved without boardwalks. |

### 3. Deterministic Derivation in the Tarot & Campaign Compilers
In [[File:tarot/generate_tarot_matrix.js]] (`getGroysberg5D(s, e, c)`, lines 91–98), every `[S, E, C]` disposition vector is automatically projected onto the `1-to-6` Groysberg Pentagon:
```javascript
const behaviors     = s === 4 ? 6 : s === 3 ? 4 : s === 2 ? 2 : 1;
const relationships = Math.min(6, Math.max(1, Math.round((5 - s + c) * 0.75)));
const attitudes     = Math.min(6, Math.max(1, Math.round((s + e) * 0.75)));
const values        = Math.min(6, Math.max(1, Math.round((5 - e + s) * 0.75)));
const environment   = Math.min(6, Math.max(1, Math.round((5 - s + c * 1.2) * 0.65)));
```
These 5 coordinates power the interactive **SVG 5D Culture Radar Pentagons** rendered in [[File:tarot/tarot_matrix_browser.html]], the multi-deck radar overlays in [[File:tarot/tarot_deck_analytics.html]], and the `sensoryPentagon` JSON block in [[File:sociology/06_Disposition_Matrix_and_Tarot_Decision_Framework.md]].

### 4. Visual Diagrams & Related Links
- **Associated Reference Diagrams**: Illustrated by [[File:sociology/https3A2F2Fblogs-images.png]] (flagged for URL-encoded filename cleanup under [[Ticket:SYS-AUDIT-01]]) and synthesized in [[File:sociology/00 sociology all.png]].
- **Cross-Cutting Series**: Documented in [[Series:series_c_sociology_and_tarot_hermeneutics]] and consolidated in [[File:sociology/SOCIOLOGY_MASTER_COMPENDIUM.md]].
<!-- END_CUSTOM_NOTES -->
