---
name: understand-code
description: >
    Explains Reputo code in plain English with data flow, invariants, and
    safe extension points. Use when the user asks what code does, how a
    flow works, or where to change something safely.
disable-model-invocation: true
---

# Understand Code

## Instructions

- Read the selected files plus the repo root `AGENTS.md` and any nearest
  scoped `AGENTS.md` that define the relevant boundaries.
- Explain the code in plain English before diving into implementation details.
- Walk the flow from entrypoints to core logic to side effects.
- Call out the important abstractions, invariants, and assumptions that
  keep the code correct.
- Highlight hidden coupling, likely failure modes, and areas where
  changes would be risky.
- Recommend safe modification points for extending the code without
  breaking surrounding behavior.
- If context is missing, ask at most one clarifying question before proceeding.

## Response

- Summarize what the code does and why it exists.
- Describe the main data flow.
- List the key invariants and risks.
- Point to the safest places to extend or modify the behavior.
