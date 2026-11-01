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
├── preset.json              # 22-node topology, 7 waves, disembark table, color wheel
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
- **`nodes`**: A dictionary containing string keys `"1"` through `"22"`.
  - Keys 1–21 represent spatial locations on the pointcrawl canvas.
  - Key 22 represents the subterranean or metaphysical **Core Equilibrium Key**.
  - Each node defines:
    - `name` (String): Setting-specific proper noun.
    - `x`, `y` (Number): Canvas display coordinates.
    - `eligible` (Boolean): True if capable of hub election; False if chokepoint or dependent.
    - `hubEligibility` (String): `"candidate"` or `"never"`.
    - `adj` (Array of Numbers): Connected node numbers (aligned with 52 canonical links).
    - `infBy` (Array of Numbers): Inbound influence source nodes.
    - `cat` (String): Spatial category (e.g., "Outer Perimeter Bastion", "Wild Plains").
    - `culture` (String): CVF quadrant (`"Hierarchy"`, `"Adhocracy"`, `"Market"`, `"Clan"`, or `"Universal"`).
    - `tier` (Number): Bastion rank or settlement tier (0 to 3).
- **`waves`**: Exactly 7 wave objects sequencing the procedural card deal and balancing progression.
- **`disembarkTable`**: Exactly 22 card objects for the Major Arcana (`The Fool` to `The World`), each declaring `upEvent`, `revEvent`, `upGain`, and `revDebt`.
- **`colorWheel`**: Exactly 5 cultural color profiles (`White`, `Blue`, `Black`, `Red`, `Green`) defining `culture`, `opsProfile`, `theme`, `perimeterDefense`, `leader`, `economy`, and `flaw`.

---

## 3. Worldbuilding Module Architecture
Modules must reside in `modules/` and declare typed frontmatter conforming to the [IP Module Framework SRD](file:///c:/Users/Milo/Documents/Antigravity/Creator/docs/srd/ip_module_framework_srd.md):
- `pipeline_tier`: 1 (Governance), 2 (Biomes/Transit), 3 (Supply Chains), 4 (Dilemmas), 5 (Climaxes).
- `provides: [...]`: Typed outgoing resources.
- `requires: [...]`: Typed incoming prerequisites.
- `standalone_fallback`: Narrative clause explaining survival if severed from external edges.
- `injected_mechanics`: 4-level output dial and 1–3 segmented threat clocks.
