# Creator Studio - Workstation Mods & Extensions Directory

This directory houses client-side **Workstation Mods / Extensions** (`mods/<mod_id>/`) for Creator Studio (`start.html`).

> [!NOTE]
> In Creator Studio terminology, **Modules** (`modules/` or `campaigns/*/modules/`) are narrative worldbuilding units (Tier 1-5 yields, hazards, and dilemmas).
> **Mods** (`mods/<mod_id>/`) are software plugins that extend the CAD workstation UI, menu bar, properties inspector, and authoring tools.

---

## Mod Directory Structure

Each mod lives in its own subdirectory:

```text
mods/
  └── <mod_id>/
        ├── mod.json       <-- Metadata and configuration
        ├── mod.js         <-- Client-side JavaScript entrypoint
        └── assets/        <-- (Optional) Local assets, styles, icons
```

### 1. `mod.json` Specification

```json
{
  "id": "regional_biomes",
  "name": "Regional Biomes & Visual Explorer",
  "version": "1.0.0",
  "author": "Creator Studio",
  "description": "Dynamic biome assignment for nodes and transit road corridors pulling from regional image folders.",
  "entry": "mod.js",
  "enabled": true
}
```

### 2. `mod.js` Entrypoint Lifecycle

Mods register themselves synchronously via the global `window.CreatorStudio` API:

```javascript
(function() {
  if (!window.CreatorStudio) return;

  window.CreatorStudio.registerMod({
    id: "my_custom_mod",
    name: "My Custom Mod",
    version: "1.0.0",
    menuItems: [
      { label: "Open Mod Tool...", action: function() { ... } }
    ],
    renderNodeProperties: function(tbody, context) { ... },
    renderEdgeProperties: function(tbody, context) { ... }
  });
})();
```

---

## Compilation & Offline Discovery

To ensure 100% offline, zero-CORS execution via `file:///`:
1. Drop any mod folder into `mods/`.
2. Run either:
   ```powershell
   powershell -File .\Build-Suite.ps1
   ```
   Or for quick mod-only updates:
   ```powershell
   powershell -File .\mods\Update-Mods.ps1
   ```
All active mods will automatically register into `start.html`.
