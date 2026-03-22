# @reputo/storage

Shared S3 abstraction used by the API and workflow workers.

## Public Surface

- `Storage` for presigned uploads, presigned downloads, upload verification, and direct object reads or writes
- `createS3Client` for consistent AWS client setup
- shared errors, types, and key utilities re-exported from the package root

## Commands

```bash
pnpm --filter @reputo/storage build
pnpm --filter @reputo/storage test
pnpm --filter @reputo/storage typecheck
pnpm --filter @reputo/storage docs
```

## Docs

- Generated API docs: [docs/README.md](docs/README.md)
