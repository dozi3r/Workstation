---
file_path: "src/workstation/scripts/module_explorer.js"
title: "module_explorer.js"
volume: "vol-4"
kind: "Workstation Modular JS Engine"
current_hash: "38eb6288230743e2"
reviewed_hash: "38eb6288230743e2"
stale: false
size_bytes: 55109
line_count: 1212
---

# module_explorer.js

<!-- BEGIN_CUSTOM_NOTES -->
### Architectural Purpose & Role
`src/workstation/scripts/module_explorer.js` serves as the Comprehensive Module Explorer, Sourcebook Reader, and In-App GM Custom Module Studio (`SYS-START-09`).

### Core Subsystems & Responsibilities
- **Module Catalog & Multi-Axis Filtering**: Filters and inspects 5-Tier Worldbuilding Modules across campaigns (`All Campaigns`, `Custom / Homebrew`, and installed sourcebooks from `/campaigns/`), pipeline tiers (`1..5`), CVF cultures, and search queries (`filterModules`, resolving IDs via `resolveModuleExplorerId` and resetting conflicting filters automatically when opened via `openSourceModuleFromInspector`). Also preserves string node IDs (`updateTargetNodeDropdown`) and escapes rendered module table cells/actions.
- **In-App GM Custom Module Studio (`SYS-START-09`)**: Provides `openCustomModuleEditor()`, `editOrCloneCurrentModule()`, `saveCustomModuleFromStudio()`, `syncCustomModulesToCatalog()`, `promoteNodeEndowmentsToModule()`, and `exportCustomModuleDraftMarkdown()` / `exportModuleMarkdownFile()`, enabling GMs to author, clone, edit, persist (`activeTopology.custom_modules`), and export `.md` worldbuilding modules with YAML frontmatter.
- **Module & Entity Deletion Controls**: Features individual delete buttons in the catalog table and inspector detail header, as well as per-entity deletion buttons inside Tab 2 (Narrative Entities) for discrete NPCs, Quests, and Items. Integrates with `promptEntityDelete('module', modId)` to audit all slotted nodes and spawned active campaign entities prior to deletion or backup.
<!-- END_CUSTOM_NOTES -->
