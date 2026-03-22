**@reputo/onchain-data v0.0.0**

***

# @reputo/onchain-data

TypeScript package for syncing token transfer data into PostgreSQL with a provider abstraction. Fetches onchain transfers (for example via Alchemy), normalizes them, and persists them with chain metadata plus sync state.

## Features

- **Provider abstraction**: Normalize provider payloads once and persist them consistently
- **PostgreSQL persistence**: TypeORM-backed PostgreSQL storage with schema auto-sync and sync-state tracking
- **Sync service**: `createSyncAssetTransfersService` runs incremental sync for a supported asset key
- **Read repository**: `createAssetTransferRepository` exposes paginated transfer reads for downstream workflows

## Installation

```bash
pnpm add @reputo/onchain-data
```

## Usage

### Syncing token transfers

Create a sync service for a supported asset key. It fetches transfers from the configured provider and persists them to PostgreSQL, updating sync state for the next run.

```typescript
import { createSyncAssetTransfersService } from '@reputo/onchain-data';

const databaseUrl = process.env.DATABASE_URL!;

const service = await createSyncAssetTransfersService({
  assetKey: 'fet_ethereum',
  databaseUrl,
  alchemyApiKey: process.env.ALCHEMY_API_KEY!,
});

const result = await service.sync();
console.log(result);
// { assetKey, fromBlock, toBlock, insertedCount }

await service.close();
```

### Reading transfers by address

Use the read-only repository to query transfers for an address (optional block range and direction).

```typescript
import {
  createAssetTransferRepository,
  ONCHAIN_ASSET_KEYS,
} from '@reputo/onchain-data';

const repo = await createAssetTransferRepository({
  databaseUrl: process.env.DATABASE_URL!,
});

const transfers = await repo.findTransfersByAddresses({
  assetId: ONCHAIN_ASSET_KEYS.indexOf('fet_ethereum'),
  addresses: ['0x1234...'],
  page: 1,
  limit: 100,
  orderBy: 'time_asc',
});

// ... use transfers

await repo.close();
```

### Types and metadata

```typescript
import {
  OnchainAssets,
  type AssetTransferRecord,
  type AssetTransferSyncState,
} from '@reputo/onchain-data';

const metadata = OnchainAssets.fet_ethereum;
const record: AssetTransferRecord | null = null;
const syncState: AssetTransferSyncState | null = null;
```

## API Reference

Run `pnpm docs` in this package to generate API documentation. Public exports include:

- **Service**: `createSyncAssetTransfersService`, `CreateSyncAssetTransfersServiceInput`, `SyncAssetTransfersService`, `SyncAssetTransfersResult`
- **Repository**: `createAssetTransferRepository`, `AssetTransferReadRepository`, `AssetTransferRepository`
- **Shared**: `AssetTransferRecord`, `AssetTransferSyncState`, `ONCHAIN_ASSET_KEYS`, `ONCHAIN_ASSETS`, `OnchainAssets`, and normalization/block utilities

## License

Released under the **GPL-3.0** license. See [LICENSE](_media/LICENSE) file for details.

This project is open source and welcomes contributions from the community.
