# @reputo/reputation-algorithms

Framework-agnostic TypeScript library for describing, validating, and discovering versioned algorithm definitions via a read-only registry. JSON Schema–driven, Ajv-validated, identical API in Node and the browser; no code execution.

## Features

- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Schema-driven**: JSON Schema validation using Ajv
- **Framework-agnostic**: Works in Node.js and browser environments
- **Registry-based**: Read-only registry for algorithm discovery
- **No code execution**: Safe, validation-only approach

## Installation

```bash
pnpm add @reputo/reputation-algorithms
```

## Usage

```typescript
import { validateAlgorithm, getAlgorithm } from '@reputo/reputation-algorithms'

// Validate an algorithm definition
const isValid = validateAlgorithm(algorithmData)

// Get algorithm from registry
const algorithm = getAlgorithm('voting_engagement', '1.0.0')
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Generate documentation
pnpm docs

# Build the library
pnpm build
```

## License

GPL-3.0
