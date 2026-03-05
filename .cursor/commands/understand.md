# Goal: Explain the selected code/files

Steps:

1. Explain what it does in plain English (what problem it solves).
2. Walk through the data flow: entrypoints → core logic → side effects.
3. List key abstractions and invariants.
4. Identify hidden coupling, risks, and common failure modes.
5. Recommend safe change points (where to extend without breaking).

If context is missing, ask at most one clarifying question.

Output:

- Explanation + flow + invariants.
- Risks and edge cases.
- Safe modification points.
