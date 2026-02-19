# Goal: Implement a feature end-to-end

Steps:

1. Clarify intent + acceptance criteria from the chat context (no guessing).
2. Identify impacted package(s), entrypoints, and existing patterns to follow.
3. Implement incrementally in small diffs:
    - Avoid cross-package boundary leaks in the monorepo
4. Add tests at the right level
5. Add “feature completeness” essentials (as applicable):
    - Validation + good errors
    - Logging/metrics for key actions
    - Docs/readme/ADR if behavior/contract changed
6. Verify (run build, lint and test command at root level)

Output (required):

- What was added (1–2 sentences).
- Acceptance criteria checklist (what’s satisfied).
- Key code changes (files + intent).
- Tests added/updated + cases covered.
- Commands run + results (exact).
- Any rollout notes / migrations / env vars / CI considerations.
