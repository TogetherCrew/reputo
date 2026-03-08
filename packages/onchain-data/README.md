# @reputo/onchain-data

TypeScript package for fetching onchain data and persisting to SQLite via Drizzle ORM.

## Features

- **API Module**: HTTP client with retry logic, timeout handling, concurrency limiting, and paginated fetchers
- **DB Module**: SQLite database creation and Drizzle ORM-based persistence
- **Resources Module**: Extensible resource pattern (api, normalize, repository, schema, types per resource)

## Installation

```bash
pnpm add @reputo/onchain-data
```

## Usage

### Creating a Client

```typescript
import { createOnchainDataClient } from '@reputo/onchain-data';

const client = createOnchainDataClient({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
});

const data = await client.get('/endpoint');
```

### Persisting to SQLite

```typescript
import { createDb, closeDbInstance } from '@reputo/onchain-data';

const db = createDb({ path: './data.db' });

// Use db.drizzle for ORM operations

closeDbInstance(db);
```

## API Reference

See the [generated documentation](./docs/README.md) for full API details.

## License

GPL-3.0
