# Goal: Add meaningful tests

Steps:

1) Determine the target package(s) and test runner in use.
2) Identify critical behaviors + failure modes (happy path, validation errors, edge cases, auth/permissions if relevant).
3) Prefer deterministic tests:
   - Control time, randomness, network, and env.
   - Mock boundaries (HTTP, DB client, message broker), not internal helpers.
4) Add tests with readable naming + Arrange/Act/Assert.
5) Ensure they run fast and independently.

Output:

- Test files added/updated (paths).
- Test cases covered (bullet list).
- Any fixtures/mocks introduced and why.
- Commands run + results.
