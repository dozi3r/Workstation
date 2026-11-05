# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **single-context**.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. `AGENTS.md` sections 2 and 3 map each surface to its governing ADRs and SRDs in `docs/srd/`.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT.md
├── docs/adr/        (0001-... through 0022-...)
├── docs/srd/        (formal specs: authoring engine, presets, modules)
└── src/workstation/
```

`wiki/pages/docs/adr/` and `wiki/src/files/docs/adr/` mirror the ADRs for the in-app wiki. Edit only `docs/adr/`; the wiki copies are produced by `Build-Suite.ps1`.

## Use the glossary's vocabulary

When your output names a domain concept (in a ticket title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md` (e.g. **Pointcrawl Graph**, **Node**, **Corridor Key**, **Active Campaign Roster**, **Sterile Slate**), not the synonyms listed under its _Avoid_ lines.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0022 (co-authoring architecture and rejected patterns), but worth reopening because…_
