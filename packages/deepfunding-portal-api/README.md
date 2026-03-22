# @reputo/deepfunding-portal-api

Workspace package for fetching DeepFunding Portal data and persisting it to SQLite with Drizzle.

## Public Surface

- `createDeepFundingClient`, endpoint fetchers, and pagination helpers
- `createDb`, `closeDbInstance`, and `BOOTSTRAP_SQL`
- `createRepos` plus repo, normalize, schema, and type exports for rounds, pools, proposals, users, milestones, reviews, comments, and comment votes

## Commands

```bash
pnpm --filter @reputo/deepfunding-portal-api build
pnpm --filter @reputo/deepfunding-portal-api test
pnpm --filter @reputo/deepfunding-portal-api typecheck
pnpm --filter @reputo/deepfunding-portal-api sync
pnpm --filter @reputo/deepfunding-portal-api validate
pnpm --filter @reputo/deepfunding-portal-api fetch-api
pnpm --filter @reputo/deepfunding-portal-api docs
```

## Docs

- Generated API docs: [docs/README.md](docs/README.md)
