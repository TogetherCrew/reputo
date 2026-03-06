---
name: add-tests
description: >
    Adds or updates deterministic tests for Reputo code changes. Use when
    the user asks for test coverage, regression tests, edge-case tests,
    or validation of behavior changes.
---

# Add Tests

## Instructions

- Read the repo root `AGENTS.md` and the nearest scoped `AGENTS.md`
  for the code under test before choosing the test seam.
- Determine the right workspace and runner first. Use the existing test
  setup instead of introducing a new framework.
- Cover the critical behaviors, not just the happy path. Include
  validation failures, edge cases, and contract-sensitive flows where
  they matter.
- Keep tests deterministic: control time, randomness, network,
  filesystem, and environment-dependent inputs.
- Mock boundaries such as HTTP, database, broker, storage, or external
  services. Do not mock internal helpers unless the repo already uses
  that seam.
- Prefer readable Arrange/Act/Assert structure and names that describe behavior.

## Verification

- Run the narrowest relevant test command first from the repo root,
  usually with `pnpm --filter <workspace> ...` when a workspace-specific
  script exists.
- If the change affects shared behavior or exported contracts, extend
  verification to the impacted dependents.

## Response

- List the test files added or updated.
- List the behaviors covered.
- Mention any fixtures or mocks introduced and why.
- Report the commands run and the important results.
