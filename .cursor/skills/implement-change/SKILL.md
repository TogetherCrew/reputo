---
name: implement-change
description: >
    Implements features, bug fixes, and safe refactors in the Reputo
    monorepo. Use when the user asks to add behavior, fix a regression,
    refactor code, or make an end-to-end code change.
---

# Implement Change

## Instructions

- Read the repo root `AGENTS.md` and the nearest scoped `AGENTS.md`
  for every file you touch before making decisions.
- Keep the monorepo boundaries intact: `apps/` are deployables,
  `packages/` are reusable libraries, `packages/` must not import from
  `apps/`, and apps must not depend on sibling apps.
- Prefer package public entrypoints over deep imports and keep explicit
  types at public boundaries.
- Match the workflow to the request.
- Feature work: clarify acceptance criteria, identify impacted
  workspaces, add validation and meaningful errors, and cover the new
  behavior with tests.
- Bug fix work: reproduce the failure when feasible, localize the
  smallest failing surface, explain the root cause, add a regression
  test when practical, and apply the smallest safe fix.
- Refactor work: identify the specific pain point, preserve external
  behavior and contracts, add characterization tests when risk exists,
  and work in small reviewable steps.
- Keep diffs focused. Do not mix opportunistic cleanup into the
  requested change unless it is necessary for correctness.

## Verification

- Run verification from the repo root and prefer scoped commands such as
  `pnpm --filter <workspace> ...`.
- Start with targeted checks for the touched workspace. If shared code,
  public contracts, or cross-workspace behavior changed, widen
  verification to the affected packages and apps.
- Remember that git hooks run `pnpm check` on pre-commit and
  `pnpm check` plus `pnpm test` on pre-push. Use that as the minimum bar
  for broad changes.

## Response

- Summarize what changed in 1-2 sentences.
- State the acceptance criteria or bug/root-cause outcome.
- List the main files changed and why.
- Report the commands run and the important results.
- Call out remaining risks, edge cases, or rollout notes when relevant.
