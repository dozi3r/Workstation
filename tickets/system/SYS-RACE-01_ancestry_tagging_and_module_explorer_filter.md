---
id: SYS-RACE-01
title: "System-Agnostic Ancestry Tagging & Module Explorer Filter"
pipeline_tier: 0
target_surface: "src/campaign_studio/ & network/campaign_studio.html"
status: shipped
category: "system_architecture"
wave: "Platform Architecture: Ancestry & System Agnosticism"
grounded_prerequisites: ["Existing Module Explorer in campaign_studio.html", "Authoring Engine SRD"]
grounded_yields: ["Optional ancestry_requirements schema tag", "Module Explorer ancestry filter dropdown"]
provides: ["Schema: Ancestry-Requirements-Tag", "UI: Module-Explorer-Species-Filter"]
requires: ["Surface: campaign_studio.html", "Manifest: network/modules_manifest.json"]
standalone_fallback: "Modules lacking ancestry tags default to 'Universal / Ancestry-Agnostic' and render in all searches without restrictions."
---

# SYS-RACE-01: System-Agnostic Ancestry Tagging & Module Explorer Filter
*Category: system_architecture | Target Surface: campaign_studio.html*
*Status: ready_for_spec*

---

## 1. Executive Problem Statement & Philosophy

Creator Studio is fundamentally system-agnostic and setting-neutral. GMs must never feel shoehorned into canonical fantasy tropes (e.g. assuming all mines are Dwarven, all forests are Elven, or all raiders are Orcish).
* **The Rule of Agnosticism**: Modules should default to culture-neutral sociological roles (e.g. *Palatial Scribes*, *Highland Charcoalers*, *Subterranean Miners*, *Littoral Mariners*).
* **The Exception Gate**: An ancestry/species requirement is *only* permitted if an encounter, hazard, or mechanical yield is fundamentally tied to a unique physiological or anatomical trait (e.g., gills for deep-sea hydrothermal vents, darkvision/echolocation for unlit blind chasms, or stone-digestion for lithovores).

To support GMs who *do* want ancestral flavoring or physiological prerequisites, Creator Studio needs an explicit schema tag and a dedicated filter in the Module Explorer.

---

## 2. Technical Specification & Schema Contract

### 2.1 Module Frontmatter Schema Extension
Modules may optionally declare:
```yaml
ancestry_requirements:
  type: "universal | physiological_prerequisite | cultural_variant"
  traits: ["Aquatic-Respiration", "Subterranean-Tremorsense"]
  suggested_demographics: ["Gill-Folk", "Merfolk", "Amphibious Beastfolk"]
```
* If omitted, the compilation parser defaults the module to:
  `ancestry_requirements: { type: "universal", traits: [], suggested_demographics: ["Any / System-Agnostic"] }`

### 2.2 Module Explorer UI Extension (`campaign_studio.html`)
In the Module Explorer (Stage 1):
1. **Ancestry / Species Filter Dropdown**:
   * `All Modules` (Default)
   * `Universal Only` (Pure system-agnostic modules with zero physiological requirements)
   * `Physiologically Specific` (Modules requiring specific biologies: aquatic, tremorsense, winged)
2. **Badge Indicator on Module Cards**:
   * Universal modules display a subtle `🌐 Universal` pill badge.
   * Trait-specific modules display a cyan `🧬 Biology: [Trait]` badge with tooltip explaining the prerequisite.

---

## 3. Definition of Done & Acceptance Criteria

- [ ] Schema documented in `docs/srd/authoring_engine_srd.md` under Module Specification.
- [ ] Parser updated in `build_suite.js` to preserve `ancestry_requirements` metadata.
- [ ] Filter dropdown added to `src/campaign_studio/` templates and compiled to `network/campaign_studio.html`.
- [ ] Verified offline zero-CORS execution via `Build-Suite.ps1`.
