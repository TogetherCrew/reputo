# @reputo/database

Shared MongoDB package for connection handling, Mongoose schemas, and model exports used by the API and workflow workers.

## Public Surface

- `connect` and `disconnect`
- model values: `AlgorithmPresetModelValue` and `SnapshotModelValue`
- schemas: `AlgorithmPresetSchema` and `SnapshotSchema`
- shared constants, plugins, and TypeScript types re-exported from `./shared`

The model values use the `Value` suffix to avoid colliding with exported domain types.

## Commands

```bash
pnpm --filter @reputo/database build
pnpm --filter @reputo/database test
pnpm --filter @reputo/database typecheck
pnpm --filter @reputo/database docs
```

## Docs

- Generated API docs: [docs/README.md](docs/README.md)
