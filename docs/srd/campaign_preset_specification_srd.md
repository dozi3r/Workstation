# Campaign Preset Specification SRD
## Production Standard for Modular Tabletop Setting Packages

**Version**: 1.0.0  
**Status**: Authoritative Standard  
**Authority**: [ADR-0001](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/adr/0001-dual-mode-preset-architecture.md), [IP Module Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/ip_module_framework_srd.md), [Authoring Engine SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/authoring_engine_srd.md)  
**Compiler**: `powershell -ExecutionPolicy Bypass -File .\Build-Suite.ps1`  
**Validator**: `powershell -ExecutionPolicy Bypass -File .\campaigns\Test-CampaignPackage.ps1 -Campaign <id>`

---

## 1. Directory Structure Contract
Every campaign setting in Creator Studio resides within its own isolated subfolder under `campaigns/<campaign_id>/`:

```text
campaigns/<campaign_id>/
├── campaign.json            # Identity, author, and enablement metadata
├── preset.json              # Scale-fluid pointcrawl topology, waves, arrival table, color wheel
├── topology.json            # Spatial coordinates, edge conduits, and scale tiers
├── modules_manifest.json    # JSON array catalog of setting modules
└── modules/                 # Authoritative 5-Tier module Markdown files (*.md)
```

Folders beginning with `_` or `.` are skipped by the build compiler. Settings with `"enabled": false` in `campaign.json` are registered in manifests but excluded from default active pools.

---

## 2. Manifest Specifications

### 2.1 `campaign.json`
```json
{
  "id": "setting_identifier",
  "name": "Human-Readable Campaign Setting Name",
  "enabled": true,
  "author": "Author Name / Organization",
  "description": "Comprehensive setting description and aesthetic elevator pitch.",
  "presetFile": "preset.json",
  "manifestFile": "modules_manifest.json"
}
```

### 2.2 `preset.json` Requirements
- **`nodes`**: An array or dictionary of scale-fluid spatial node objects ($N \ge 1$):
  - Node count is **unconstrained**: compact settings (5–10 nodes), regional campaigns (11–25 nodes), or expansive world networks (26–60+ nodes).
  - Each node defines:
    - `id` (String): Unique node identifier (e.g., `N_WATERFRONT`, `1`).
    - `name` (String): Setting-specific proper noun.
    - `x`, `y` (Number): Canvas display coordinates.
    - `scaleTier` (String, optional): `"region"`, `"settlement"`, `"site"`, or `"room"`.
    - `adj` (Array): Connected node identifiers or numbers.
    - `culture` (String, optional): CVF quadrant (`"Hierarchy"`, `"Adhocracy"`, `"Market"`, `"Clan"`, or `"Universal"`).
    - `tier` (Number, optional): Bastion rank or settlement tier (0 to 3).
- **`waves`** (Array, optional): Progressive exploration wave objects sequencing narrative discovery or campaign tiers.
- **`disembarkTable` / `tarotCards`** (Array, optional): Arrival and exploration gambit events declaring `upEvent`, `revEvent`, `upGain`, and `revDebt`.
- **`colorWheel`** (Object, optional): Cultural color profiles (`White`, `Blue`, `Black`, `Red`, `Green`) defining `culture`, `opsProfile`, `theme`, `leader`, `economy`, and `flaw`.

> [!NOTE]
> *Legacy 22-Node Archetype Presets*: Early builds (retired in [ADR-0011](../adr/0011-retirement-of-vestigial-tarot-balancing-engine.md)) hardcoded a 22-node Major Arcana format. Modern Creator Studio is completely scale-fluid; presets are never restricted by a minimum or maximum node limit.

---

## 3. Worldbuilding Module Architecture
Modules must reside in `modules/` and declare typed frontmatter conforming to the [IP Module Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/ip_module_framework_srd.md):
- `pipeline_tier`: 1 (Governance), 2 (Biomes/Transit), 3 (Supply Chains), 4 (Dilemmas), 5 (Climaxes).
- `provides: [...]`: Typed outgoing resources.
- `requires: [...]`: Typed incoming prerequisites.
- `standalone_fallback`: Narrative clause explaining survival if severed from external edges.
- `injected_mechanics`: 4-level output dial and 1–3 segmented threat clocks.
