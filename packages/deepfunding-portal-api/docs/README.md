**@reputo/deepfunding-portal-api v0.0.0**

***

# @reputo/deepfunding-portal-api

TypeScript package for fetching data from the DeepFunding Portal API and persisting to SQLite via Drizzle ORM.

## Features

- **Fetch Module**: HTTP client with retry logic, timeout handling, and paginated fetchers for all API resources
- **DB Module**: SQLite database creation and Drizzle ORM-based persistence

## Installation

```bash
pnpm add @reputo/deepfunding-portal-api
```

## Usage

### Fetching Data

```typescript
import { createDeepFundingClient, fetchRounds, fetchAllPages, fetchUsers } from '@reputo/deepfunding-portal-api';

const client = createDeepFundingClient({
  baseUrl: 'https://deepfunding.ai/wp-json/deepfunding/v1',
  apiKey: 'your-api-key',
});

// Fetch all rounds (no pagination - returns Promise directly)
const rounds = await fetchRounds(client);

// Fetch paginated resources (returns async generator)
const users = await fetchAllPages(fetchUsers(client));
```

### Persisting to SQLite

```typescript
import { 
  createNewDeepFundingPortalDb, 
  closeDeepFundingPortalDb,
  ingestRounds 
} from '@reputo/deepfunding-portal-api';

// Create a new database
const db = createNewDeepFundingPortalDb({ path: './data.db' });

// Ingest data
ingestRounds(db, rounds);

// Close when done
closeDeepFundingPortalDb(db);
```

## API Reference

See the [generated documentation](./docs/README.md) for full API details.

## License

GPL-3.0
