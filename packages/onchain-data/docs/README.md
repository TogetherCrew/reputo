**@reputo/onchain-data v0.0.0**

***

# @reputo/onchain-data

TypeScript package for syncing token transfer data into SQLite with a provider abstraction. Fetches onchain transfers (e.g. via Alchemy), normalizes them, and persists to a local SQLite database with chain metadata and sync state.

## Features

- **Provider abstraction**: Pluggable token-transfer providers (e.g. Alchemy for Ethereum); normalize once, persist to SQLite
- **SQLite persistence**: SQLite via `better-sqlite3` with sync-state tracking (from/to block) per chain
- **Sync service**: `createSyncTokenTransfersService` runs incremental sync for a given token chain (contract, start block, API key)
- **Read repository**: `createTokenTransferRepository` exposes `findByAddress` and `insertMany` over the same DB
- **Shared types and metadata**: Exported enums (`SupportedChain`, `SupportedToken`, `SupportedTokenChain`, `TransferDirection`), `TokenChainMetadata`, `TokenTransferRecord`, and chain metadata (`TOKEN_CHAIN_METADATA`)

## Installation

```bash
pnpm add @reputo/onchain-data
```

## Usage

### Syncing token transfers

Create a sync service for a supported token chain (e.g. Ethereum). It uses the configured provider (e.g. Alchemy) to fetch transfers and persists them to SQLite, updating sync state for the next run.

```typescript
import {
  createSyncTokenTransfersService,
  SupportedTokenChain,
} from '@reputo/onchain-data';

const service = createSyncTokenTransfersService({
  tokenChain: SupportedTokenChain.FET_ETHEREUM,
  dbPath: './data.db',
  alchemyApiKey: process.env.ALCHEMY_API_KEY!,
});

const result = await service.sync();
console.log(result);
// { tokenChain, fromBlock, toBlock, insertedCount }

service.close();
```

### Reading transfers by address

Use the read-only repository to query transfers for an address (optional block range and direction).

```typescript
import {
  createTokenTransferRepository,
  SupportedTokenChain,
  TransferDirection,
} from '@reputo/onchain-data';

const repo = createTokenTransferRepository({ dbPath: './data.db' });

const received = repo.findByAddress({
  tokenChain: SupportedTokenChain.FET_ETHEREUM,
  address: '0x1234...',
  direction: TransferDirection.TO,
  fromBlock: '0x1000',
  toBlock: '0x2000',
});

// ... use received (TokenTransferRecord[])

repo.close();
```

### Types and metadata

```typescript
import {
  SupportedTokenChain,
  TOKEN_CHAIN_METADATA,
  type TokenTransferRecord,
  type TokenChainMetadata,
} from '@reputo/onchain-data';

const metadata: TokenChainMetadata = TOKEN_CHAIN_METADATA[SupportedTokenChain.FET_ETHEREUM];
// metadata.contractAddress, metadata.startBlock, etc.
```

## API Reference

Run `pnpm docs` in this package to generate API documentation. Public exports include:

- **Service**: `createSyncTokenTransfersService`, `CreateSyncTokenTransfersServiceInput`, `SyncTokenTransfersService`, `SyncTokenTransfersResult`
- **Repository**: `createTokenTransferRepository`, `TokenTransferReadRepository`, `TokenTransferRepository`
- **Shared**: `SupportedChain`, `SupportedProvider`, `SupportedToken`, `SupportedTokenChain`, `TransferDirection`, `TOKEN_CHAIN_METADATA`, `TokenChainMetadata`, `TokenTransferRecord`, `TokenTransferSyncState`, and normalization/block utilities

## License

Released under the **GPL-3.0** license. See [LICENSE](_media/LICENSE) file for details.

This project is open source and welcomes contributions from the community.
