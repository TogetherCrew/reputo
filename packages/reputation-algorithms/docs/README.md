**@reputo/reputation-algorithms v0.0.0**

***

# @reputo/reputation-algorithms

Read-only registry of versioned algorithm definitions used by the UI, API, and workflow workers.

## Public Surface

- root exports of algorithm definition types and registry errors
- `@reputo/reputation-algorithms/api` helpers: `getAlgorithmDefinitionKeys`, `getAlgorithmDefinitionVersions`, `getAlgorithmDefinition`, and `searchAlgorithmDefinitions`
- registry JSON files under `src/registry`
- generated registry index at `src/registry/index.gen.ts`

## Commands

```bash
pnpm --filter @reputo/reputation-algorithms registry:validate
pnpm --filter @reputo/reputation-algorithms registry:build
pnpm --filter @reputo/reputation-algorithms build
pnpm --filter @reputo/reputation-algorithms test
pnpm --filter @reputo/reputation-algorithms typecheck
pnpm --filter @reputo/reputation-algorithms docs
```

For end-to-end scaffolding across the registry and workflow implementation, use `pnpm algorithm:create <key> <version>` from the repo root.

## Docs

- Generated API docs: [docs/README.md](docs/README.md)
