# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the strings used in this repo's local ticket files.

Triage state is recorded in a `triage:` field in the ticket's YAML frontmatter (`tickets/system/*.md`). The unified tracker ignores this field, so it does not affect the generated manifest or the in-app badges.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this ticket |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

## `wontfix` is also `status: rejected`

Declining a ticket additionally sets `status: rejected` so it shows as rejected in the app. Follow the existing convention of a `SYS-REJECTED-NN_<slug>.md` ticket that records why (see `SYS-REJECTED-01`, `SYS-REJECTED-02`), so future work does not re-propose it.

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), set `triage:` to the corresponding string from this table.
