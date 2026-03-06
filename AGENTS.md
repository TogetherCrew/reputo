# Reputo Instructions

- `apps/` are deployables: `api`, `ui`, and `workflows`.
- `packages/` are reusable libraries.
- Run workspace scripts from the repo root with `pnpm --filter <workspace> ...`.
- `packages/` must never import from `apps/`.
- `apps/` may depend on `packages/`, but not on sibling apps.
- Prefer package public entrypoints over deep internal imports.
- Keep explicit types at public boundaries.
- If behavior changes, update or add tests.
- Never put secrets, tokens, or credentials in code or logs.
- Keep diffs focused and PR-sized.
