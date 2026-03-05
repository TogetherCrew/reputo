# Goal: Add meaningful tests

Steps:

1. Determine target package(s) and test runner.
2. Identify critical behaviors and failure modes (happy path, validation, edge cases, auth).
3. Write deterministic tests:
   - Control time, randomness, network, and env.
   - Mock boundaries (HTTP, DB, broker), not internal helpers.
   - Use readable names and Arrange/Act/Assert.
4. Ensure tests run fast and independently.

Output:

- Test files added/updated (paths).
- Test cases covered (bullet list).
- Fixtures/mocks introduced and why.
- Commands run + results.
