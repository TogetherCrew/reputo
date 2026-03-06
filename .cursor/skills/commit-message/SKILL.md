---
name: commit-message
description: >
    Generates a Conventional Commit message from the current Reputo diff.
    Use when changes are ready to summarize, a diff needs a commit title,
    or the agent should proactively suggest a commitlint-compatible
    message.
---

# Commit Message

## Instructions

- Base the message on the actual current diff, not on assumptions about
  the intended change.
- Infer the scope from the affected workspace when possible, such as
  `api`, `ui`, `workflows`, or a package name.
- Use Conventional Commit format: `type(scope): subject`.
- Keep the subject line under 72 characters.
- Add a body only when the reason for the change is not obvious from
  the subject.
- Keep the message compatible with commitlint. Do not create the commit
  unless the user explicitly asks.

## Response

- Return the final commit message ready to paste.
- If there is no meaningful diff, say so instead of inventing a message.
