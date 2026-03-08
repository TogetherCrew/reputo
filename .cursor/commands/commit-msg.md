# Goal: Generate a commit message from the current diff

Steps:

1. Read the staged diff / changed files list — base the message only on actual changes.
2. Identify affected scope(s) from package/app names (e.g. `api`, `ui`, `workflows`).
3. Write a Conventional Commit (`type(scope): subject`) compatible with `@commitlint/config-conventional`.
4. Keep the subject line under 72 chars. Add a body only if the _why_ isn't obvious.

Output:

- The commit message, ready to copy. (don't commit by yourself)
