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

## Library usage

The public API provides helpers to discover and retrieve algorithm definitions from the read-only registry. See the full API reference in [docs](docs/globals.md).

```ts
import {
    getAlgorithmDefinitionKeys,
    getAlgorithmDefinitionVersions,
    getAlgorithmDefinition,
} from '@reputo/reputation-algorithms/api'

// List all algorithm keys (sorted)
const keys = getAlgorithmDefinitionKeys()

// Inspect available versions for a key
const versions = getAlgorithmDefinitionVersions('voting_engagement')

// Fetch a definition (returns a JSON string)
const json = getAlgorithmDefinition({
    key: 'voting_engagement',
    version: 'latest',
})
const definition = JSON.parse(json)
```

## Algorithm definition creation

Definitions live under `packages/reputation-algorithms/src/registry/` as versioned JSON files, and an auto-generated index (`index.gen.ts`) wires them into the runtime registry. Follow this flow to add a new algorithm:

1. Create a new definition from a template
    - Using the provided script from `package.json`:

        ```bash
        pnpm --filter @reputo/reputation-algorithms algorithm:create <key> <version>
        ```

    - Examples:

        ```bash
        pnpm --filter @reputo/reputation-algorithms algorithm:create voting_engagement 1.1.0
        ```

    - This scaffolds: `src/registry/<key>/<version>.json`
    - Requirements enforced by the CLI:
        - `key` is `snake_case` (e.g., `voting_engagement`)
        - `version` is SemVer (e.g., `1.0.0`, `1.0.0-beta`)

2. Edit the generated JSON file
    - Fill in `key`, `version`, metadata, inputs, and outputs according to the schema.

3. Validate the registry
    - Validate all definitions against the JSON Schema and guard against duplicates:

        ```bash
        pnpm --filter @reputo/reputation-algorithms registry:validate
        ```

4. Generate the registry index
    - Build the in-repo registry index to include your new version:

        ```bash
        pnpm --filter @reputo/reputation-algorithms registry:build
        ```

    - This writes/updates `src/registry/index.gen.ts` (auto-generated; do not edit).

5. Build the package
    - `pnpm build` compiles TypeScript. The `prebuild` step automatically runs validation and registry generation:

        ```json
        {
            "scripts": {
                "prebuild": "pnpm registry:validate && pnpm registry:build",
                "build": "tsc"
            }
        }
        ```

## License

Released under the **GPL-3.0** license. See [LICENSE](LICENSE) file for details.

This project is open source and welcomes contributions from the community.
