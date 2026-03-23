# @reputo/workflows

Temporal workers that orchestrate snapshot execution and run TypeScript algorithms.

## Surface

- orchestrator worker loads snapshots from MongoDB, resolves dependencies, and coordinates execution
- algorithm worker runs TypeScript compute functions and reads or writes snapshot data through S3 storage
- onchain-data worker resolves the `onchain-data` dependency on its dedicated task queue
- current TypeScript algorithms: `contribution_score`, `proposal_engagement`, `token_value_over_time`, `voting_engagement`

## Commands

```bash
pnpm --filter @reputo/workflows build

pnpm --filter @reputo/workflows dev

pnpm --filter @reputo/workflows dev:orchestrator
pnpm --filter @reputo/workflows dev:algorithm-typescript
pnpm --filter @reputo/workflows dev:onchain-data

pnpm --filter @reputo/workflows start:orchestrator
pnpm --filter @reputo/workflows start:algorithm-typescript
pnpm --filter @reputo/workflows start:onchain-data

pnpm --filter @reputo/workflows test
pnpm --filter @reputo/workflows typecheck
```

The public `dev` commands build and watch the shared package dependencies first. `dev:app` and `dev:*:app` are internal app-only processes used by the root monorepo `pnpm dev`.

## Config

Use `apps/workflows/envs.example` as the local reference file. The workers require Temporal, MongoDB, storage/AWS, DeepFunding, and onchain-data PostgreSQL settings. `pnpm --filter @reputo/workflows dev` starts all three workers together, while the `dev:*` commands remain available when you only want one worker.
