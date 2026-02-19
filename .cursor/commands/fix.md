# Goal: Fix the issue with minimal risk and verified correctness

Steps:

1) Reproduce: identify the failing command(s) and make the failure deterministic.
2) Localize: find the smallest surface area that explains the failure (logs, stack traces, git blame, recent changes).
3) Root cause: explain precisely why it fails (not symptoms).
4) Prevent regression: add/adjust a test that fails before the fix (when feasible).
5) Implement the smallest safe fix:
   - No refactors unless necessary.
   - Keep API behavior stable unless the bug is in the API contract itself.
6) Verify:
   - Run targeted tests/typecheck in affected package(s).
   - If shared libs/config changed, run workspace-wide checks.

Final report (required):

- What was broken (1–2 sentences).
- Root cause (concrete).
- What changed (high-level).
- Key code changes (files + intent).
- Commands run + results (exact).
- Edge cases / follow-ups / CI risks.
