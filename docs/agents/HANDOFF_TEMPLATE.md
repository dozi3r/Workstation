# Task handoff template

Copy this template to a task-specific Markdown file in `docs/agents/handoffs/` when unfinished work must survive a chat. Link it from the task's existing ticket or the current chat. Keep one current handoff per task; replace superseded state rather than accumulating transcripts.

```markdown
# <Task>: handoff

Updated: <date and timezone>
Status: <in progress / blocked / complete>
Project / branch / HEAD: <root, branch, commit; say if no Git>

## Outcome and boundaries
<User's requested result, accepted constraints, explicit approvals relevant to next steps.>

## Resume here
<One concrete next action and its completion criterion.>

## Current changes
| Path | This task's change | Pre-existing changes to preserve |
|---|---|---|
| ... | ... | ... |

## Decisions and evidence
| Decision / fact | Source path + symbol, ADR, or commit | Verified / inferred / unresolved |
|---|---|---|
| ... | ... | ... |

## Validation
| Exact command + working directory | Result + date | Limits / outstanding failures |
|---|---|---|
| ... | ... | ... |

## Remaining work
<Ordered concrete actions; identify dependencies and user input actually required.>

## Retrieval
<Route IDs; 3-8 exact relevant paths/symbols; targeted history command if needed.>
```

Before resuming: read applicable instructions, compare HEAD and path-scoped working diffs, then verify assumptions that changed. A prior approval applies only to its recorded scope. A handoff is task state, not permission to discard other work.

Before completing: put durable decisions in their existing authority (ADRs or `wiki/src/series/` when cross-cutting architecture changed), record validation, and mark the handoff complete. Keep temporary diagnostics, secrets, raw corpora, and lengthy tool output out of the handoff.
