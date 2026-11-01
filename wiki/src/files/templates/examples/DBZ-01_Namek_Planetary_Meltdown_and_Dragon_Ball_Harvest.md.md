---
file_path: "templates/examples/DBZ-01_Namek_Planetary_Meltdown_and_Dragon_Ball_Harvest.md"
title: "DBZ-01: The Namek Planetary Meltdown & Dragon Ball Harvest"
volume: "vol-8"
kind: "Technical Documentation / Guide"
current_hash: "cd013f71596843ce"
reviewed_hash: "cd013f71596843ce"
stale: false
size_bytes: 8313
line_count: 84
---

# DBZ-01: The Namek Planetary Meltdown & Dragon Ball Harvest

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`templates/examples/DBZ-01_Namek_Planetary_Meltdown_and_Dragon_Ball_Harvest.md` is an **Exemplar IP Conversion Module (Anime / Shonen Archetype)** within **Volume VIII: Campaign Packages, Modules, Templates & Unified Ticket Backlog**. It serves as a canonical reference implementation demonstrating how high-octane shonen battle anime (specifically Akira Toriyama's *Dragon Ball Z: Planet Namek Saga*) can be rigorously translated into Creator Studio's universal, system-agnostic 5-tier architecture.

Directly governed by [[File:docs/srd/adventure_framework_srd.md]], [[File:docs/adr/0002-dual-srd-and-tiered-module-architecture.md]], and cataloged in [[Series:series_d_module_supply_chains_and_contracts]].

---

## IP Conversion Mechanics & Shonen Tropes
The module deconstructs iconic shonen tropes into formal pointcrawl game mechanics:
1. **The Doomsday Countdown Clock**: Toriyama's legendary "5 minutes until Namek explodes" is converted into an 8-tick *Namek Core Meltdown* threat clock that advances on failed actions, high-output combat misses, or death beam strikes.
2. **Sensor Telemetry vs. Ki Suppression**: The tension between technological scanners (Scouters) and internal spiritual discipline (Ki suppression) is codified in the 4-tick *Scouter Convergence* clock, which ticks up whenever players exceed Light Tier energy thresholds.
3. **Escalation Output Dials**:
   - **Level 1 (Light Tier / DC 10)**: Suppressed Ki & Hidden Radar Scans.
   - **Level 2 (Moderate Tier / DC 13 / 2d8)**: Scouter Intercept & Elite Ambush.
   - **Level 3 (Severe Tier / DC 16 / 4d10)**: High-Energy Clash & Leyline Shatter (fracturing island nodes).
   - **Level 4 (Lethal Climax / DC 20 / 8d12)**: Planetary Core Rupture.

---

## Resource Contracts & Supply Chain Interlocks
- **Module Classification**: **Tier 5 (Esoteric & Eschatological Engine)**. Hub eligibility: `never`.
- **`provides`**:
  - `Climax: Porunga-Three-Wish-Invocation` (macro-level miracle capable of reviving fallen nodes or terraforming biomes).
  - `Bio: Namekian-Dragon-Ball-Set`.
  - `Tech: Capsule-Corp-Gravity-Vessel`.
- **`requires`**:
  - `Authority: Namekian-Elder-Concession` (the spoken passphrase in the Namekian mother tongue).
  - `Tech: Scouter-Telemetry-Grid`.
  - `Power: Super-Ki-Aura-Surge`.

---

## Dramatic 4-Corner Opposition
- **1. Establishment / Hegemony**: *The Frieza Planetary Trade Army* (ruthless liquidation, absolute immortality, blind command terror).
- **2. Main Opponent / Challenger**: *The Saiyan Vanguard & Earth Guerrillas* (Zenkai recovery surges, martial pride, competitive dueling flaw).
- **3. Thematic Shadow / Profiteer**: *Rogue Mercenary Scavengers* (opportunistic pod theft, ransoming dragon relics).
- **4. Tertiary Outcast / Victim**: *The Indigenous Namekian Agrarians* (sacred Ajissa ecology, pacifist vulnerability, linguistic key).
<!-- END_CUSTOM_NOTES -->
