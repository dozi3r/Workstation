---
file_path: "docs/srd/campaign_preset_specification_srd.md"
title: "Campaign Preset Specification SRD"
volume: "vol-2"
kind: "System Reference Document (SRD)"
current_hash: "bf2ff9474bee7df1"
reviewed_hash: "bf2ff9474bee7df1"
stale: false
size_bytes: 3830
line_count: 69
---

# Campaign Preset Specification SRD

<!-- BEGIN_CUSTOM_NOTES -->
## Architectural Role & Subsystem Context
`docs/srd/campaign_preset_specification_srd.md` is the **Production Packaging & Schema Standard for Modular Campaign Sourcebooks** within **Volume II: System Reference Documents (The Dual SRD & Substratum)**. Governed by [[File:docs/adr/0001-dual-mode-preset-architecture.md]], [[File:docs/srd/ip_module_framework_srd.md]], and [[File:docs/srd/authoring_engine_srd.md]], it specifies the exact directory structure and JSON schemas required for any campaign setting package (`campaigns/<campaign_id>/`) to be ingested by [[File:build_suite.js]] and audited by [[File:campaigns/Test-CampaignPackage.ps1]].

For an end-to-end engineering guide on applying this specification, consult [[Series:series_f_campaign_authoring_and_ip_conversion]].

---

## Core Invariants & Schema Contracts
Every campaign setting folder in `campaigns/<campaign_id>/` (such as `campaigns/generic_starter/`, `campaigns/opal_island/`, and `campaigns/sun_wukong/`, while folders starting with `_` like `campaigns/_template/` or `.` are skipped) must satisfy four strict contracts:

1. **`campaign.json` Identity Contract**:
   - Required fields: `id` (string), `name` (string), `enabled` (boolean), `author` (string), `description` (string), `presetFile` (`"preset.json"`), and `manifestFile` (`"modules_manifest.json"`).
   - If `"enabled": false`, [[File:build_suite.js]] registers the campaign in `CAMPAIGN_REGISTRY` with `metadata.enabled = false`, excluding it from default active module pools until toggled on by the user.
2. **`preset.json` Topological & Procedural Contract**:
   - **`nodes`**: Dictionary with string keys `"1"` through `"22"` (21 spatial POIs + Key `"22"` Core Equilibrium Key). Every node object must define `name`, `x`, `y`, `eligible` (`bool`), `hubEligibility` (`"candidate"` or `"never"` / `"always"`), `adj` (`number[]`), `infBy` (`number[]`), `cat` (string), `culture` (`"Hierarchy"`, `"Adhocracy"`, `"Market"`, `"Clan"`, or `"Universal"`), and `tier` (`0..3`).
   - **`waves`**: Array of **7 wave objects** sequencing progressive Tarot card draws across the 22 nodes.
   - **`disembarkTable`**: Array of **22 card objects** (`The Fool` through `The World`), each defining `upEvent`, `revEvent`, `upGain`, and `revDebt`.
   - **`colorWheel`**: Array of **5 color profiles** (`White`, `Blue`, `Black`, `Red`, `Green`), each defining `culture`, `opsProfile`, `theme`, `perimeterDefense`, `leader`, `economy`, and `flaw`.
3. **`modules_manifest.json` Catalog Contract**:
   - Pure JSON array indexing every setting module (`id`, `title`, `set`, `tier`, `pipeline_tier`, `path`, `tarot`, `culture`, `color`, `provides`, `requires`, `summary`).
4. **`modules/*.md` Worldbuilding Files Contract**:
   - Markdown files conforming to [[File:docs/srd/ip_module_framework_srd.md]] and [[File:templates/IP_MODULE_TEMPLATE.md]] with valid YAML frontmatter (`pipeline_tier`, `provides`, `requires`, `standalone_fallback`, `injected_mechanics`).

---

## Data Flow & Execution Pipeline
- **Template Scaffold**: Authors copy `campaigns/_template/` ([[File:campaigns/_template/campaign.json]], [[File:campaigns/_template/preset.json]], [[File:campaigns/_template/modules_manifest.json]]) to `campaigns/<new_id>/`.
- **Automated Quality Gate**: [[File:campaigns/Test-CampaignPackage.ps1]] validates the new folder against every cardinality and schema rule in this SRD.
- **Suite Compilation**: Stage 3 of [[File:build_suite.js]] reads all valid `campaigns/<id>/` folders, enriches module metadata from the `.md` files, and bundles `CAMPAIGN_REGISTRY` into [[File:network/campaign_studio.html]], [[File:network/network_visualizer.html]], [[File:network/network_builder.html]], and [[File:network/platform_audit_dashboard.html]].

---

## AI Agent Maintenance Checklist
- **Before compiling a new or modified campaign preset**: Always run:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\campaigns\Test-CampaignPackage.ps1 -Campaign <campaign_id>
  ```
- **After validation passes (`0 errors`)**: Run `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1` to bundle the campaign into all offline HTML surfaces and generate wiki pages for its modules.
<!-- END_CUSTOM_NOTES -->
