# Goal: Fix the issue with minimal risk and verified correctness

Steps:

1. Reproduce: make the failure deterministic.
2. Localize: find the smallest surface area that explains the failure.
3. Root-cause: explain precisely *why* it fails (not symptoms).
4. Add a regression test that fails before the fix (when feasible).
5. Implement the smallest safe fix — no refactors unless necessary.
6. Verify: run targeted tests/typecheck. If shared code changed, run workspace-wide.

Output:

- What was broken (1–2 sentences).
- Root cause.
- Files changed + intent.
- Commands run + results.
- Edge cases or follow-ups.
