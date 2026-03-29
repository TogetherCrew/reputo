**@reputo/onchain-data v0.0.0**

***

# @reputo/onchain-data

Workspace package for syncing raw EVM asset transfer data into PostgreSQL.

## Public Surface

- `createDb` for PostgreSQL-backed package state
- `syncEvmAssetTransfer` for syncing raw Alchemy ERC-20 transfer rows into PostgreSQL

## Internal Layout

- `src/adapters/evm/transfers` owns transfer persistence and sync orchestration
- `src/adapters/evm/sync-state` owns transfer sync-state persistence
- `src/adapters/evm/provider` owns block helpers, provider contracts, and Alchemy transport

## Stored Tables

- `evm_asset_transfers`
- `evm_asset_transfer_sync_state`

The package stores raw provider items. It does not normalize transfer data or expose read/query repositories. The returned TypeORM `DataSource` owns its own lifecycle via `await db.destroy()`.

## Commands

```bash
pnpm --filter @reputo/onchain-data build
pnpm --filter @reputo/onchain-data test
pnpm --filter @reputo/onchain-data test:postgres
pnpm --filter @reputo/onchain-data typecheck
pnpm --filter @reputo/onchain-data docs
```
