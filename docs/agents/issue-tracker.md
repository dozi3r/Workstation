# Issue tracker: Local ticket manifest

Issues for this repo are **tickets** that live in the repo itself and are viewed inside the Workstation (`tickets/unified_ticket_tracker.html`, and the Ticket Command Center MDI window). There is no GitHub Issues, no `gh` CLI, and no web access: the app is zero-CORS and offline, so tickets must be readable from local files with no network.

## Where tickets live

| Kind | Source of truth | ID pattern |
| :--- | :--- | :--- |
| Platform / architecture / dev tickets | `tickets/system/<ID>_<slug>.md` (YAML frontmatter + body) | `SYS-<AREA>-NN` (e.g. `SYS-START-22`), dev tickets `DEV-NN` |
| Creative modules (CWT) | `tickets/creative/creative_backlog_manifest.json` + `tickets/creative/backlog/<category>/<ID>.md` | `CWT-NNN` |
| Tier 0 substratum | `tickets/tier_0/tier_0_manifest.json` + `tickets/tier_0/tickets/` | `T0-DOM-NN` |

`tickets/master_ticket_manifest.json` and `tickets/unified_ticket_tracker.html` are **generated**. Never hand-edit them. Regenerate with:

```powershell
powershell -ExecutionPolicy Bypass -File .\tickets\Build-UnifiedTracker.ps1
```

(`Build-Suite.ps1` also runs it.) Subagents in worktrees follow the Source-Only Invariant in `AGENTS.md`: edit ticket sources, do not run the build or commit compiled output.

## Ticket file conventions

- One ticket per file. Copy the frontmatter shape of a recent ticket such as `tickets/system/SYS-START-22_background_map_resizing_and_transform_persistence.md`: `id`, `title`, `pipeline_tier`, `target_surface`, `status`, `category`, `wave`, `grounded_prerequisites`, `grounded_yields`, `provides`, `requires`, `standalone_fallback`.
- Filename: `<ID>_<snake_case_slug>.md`. Next ID in a series = highest existing number + 1; check `tickets/system/` first.
- `status` values the tracker understands: `discovery`, `ready_for_spec`, `ready_for_authoring`, `in_drafting`, `in_editorial`, `shipped`, `rejected`. Do not invent new ones without updating `tickets/build_unified_tracker.js` badges.
- Blocking: `blocked_by` / `blocks` arrays of ticket IDs in frontmatter. A ticket is unblocked when every blocker is `shipped`.
- Triage state is the `triage:` frontmatter field (see `triage-labels.md`).
- Reference tickets in commits and code by ID (e.g. `feat(workstation): ... (SYS-START-22)`).

## When a skill says "publish to the issue tracker"

Create a new `tickets/system/<ID>_<slug>.md` (specs from `/to-spec` and tracer-bullet tickets from `/to-tickets` both go here), set `status: discovery` and `triage: needs-triage` unless told otherwise, then regenerate the tracker so it appears in the app. Creative-writing tickets go through `tickets/creative/` per `tickets/creative/README.md`.

## When a skill says "fetch the relevant ticket"

Read the ticket file by ID from the paths above (`rg -l "^id: SYS-START-22" tickets`). The manifest has the same data, but do not read the generated HTML.

## Comments and conversation history

Append to the bottom of the ticket file under a `## Comments` heading.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a ticket file; each **child** is its own ticket file.

- **Map**: `tickets/system/<MAP-ID>_<slug>.md` (Notes / Decisions-so-far / Fog body).
- **Child ticket**: `tickets/system/<CHILD-ID>_<slug>.md`, with a `parent: <MAP-ID>` frontmatter field, a `type:` field (`research`/`prototype`/`grilling`/`task`), and a status of `claimed` or `resolved` recorded in a `wayfinder:` frontmatter field (the app `status` stays `discovery` until shipped or rejected).
- **Blocking**: `blocked_by` frontmatter. Unblocked when every listed ticket is `resolved`/`shipped`.
- **Frontier**: scan children whose `parent` is the map, open, unblocked, unclaimed; lowest ID wins.
- **Claim**: set `wayfinder: claimed` and save before any work.
- **Resolve**: append the answer under `## Answer`, set `wayfinder: resolved`, then append a context pointer (gist + ticket ID) to the map's Decisions-so-far.

## PRs as a request surface

Off. There is no external PR queue to triage.
