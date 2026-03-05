# Goal: Refactor without changing external behavior

Steps:

1. Identify the pain point (duplication, naming, long functions, unclear boundaries).
2. If risk exists, add characterization tests first to lock in behavior.
3. Refactor in tiny steps with continuous typecheck/tests.
4. Preserve public APIs, route contracts, and error shapes.
5. Keep diffs readable — avoid large formatting-only changes.

Output:

- Before/after summary (what improved and why).
- Files changed.
- Commands run + results.
