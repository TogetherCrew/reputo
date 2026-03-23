# @reputo/onchain-data

Workspace package for syncing supported onchain assets into PostgreSQL and querying the normalized transfer store.

## Public Surface

- `createSyncAssetTransfersService` for incremental transfer sync
- `createAssetTransferRepository` for paginated transfer reads
- asset metadata and constants: `ONCHAIN_ASSET_KEYS`, `ONCHAIN_ASSETS`, and `OnchainAssets`
- normalization helpers and transfer types exported from the package root

## Commands

```bash
pnpm --filter @reputo/onchain-data build
pnpm --filter @reputo/onchain-data test
pnpm --filter @reputo/onchain-data test:postgres
pnpm --filter @reputo/onchain-data typecheck
pnpm --filter @reputo/onchain-data docs
```

## Docs

- Generated API docs: [docs/README.md](docs/README.md)
