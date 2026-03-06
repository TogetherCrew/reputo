---
name: review-code
description: >
  Reviews Reputo code changes for correctness, regressions, boundary
  violations, security, and missing tests. Use when the user asks for a
  code review, PR review, or risk assessment of changes.
disable-model-invocation: true
---

# Review Code

## Instructions

- Read the repo root `AGENTS.md` and the nearest scoped `AGENTS.md`
  for the files being reviewed.
- Focus on findings first. Prioritize correctness bugs, behavioral
  regressions, layering violations, contract drift, security issues,
  performance risks, and missing or weak tests.
- Verify that monorepo boundaries are respected: `packages/` stay
  reusable, imports use public entrypoints, and app/package
  responsibilities remain clear.
- Prefer concise, concrete feedback tied to code paths or symbols. Only
  raise issues that are actionable or materially risky.
- If context is missing, ask only the minimum blocking question needed to continue the review.

## Response

- Group findings by severity: blocker, should-fix, nice-to-have.
- For each finding, explain the risk and the likely impact.
- Include a short list of the top changes you would make first.
- If no findings are discovered, say so explicitly and mention any
  residual testing or confidence gaps.
