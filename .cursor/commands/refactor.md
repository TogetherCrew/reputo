# Goal: Refactor without changing external behavior

Rules:

- No functional changes, no behavioral drift.
- Preserve public APIs, route contracts, and error shapes.
- Prefer small commits: rename/structure/dedup only.

Steps:

1) Identify target pain (duplication, naming, long functions, unclear boundaries).
2) Make the refactor in tiny steps with continuous typecheck/tests.
3) If risk exists, add characterization tests first (lock in behavior).
4) Keep diffs readable (avoid large formatting-only changes).

Output:

- Refactored code (scoped changes).
- Before/after summary (what improved and why).
- Commands run + results.
