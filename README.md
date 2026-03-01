![Reputo](.github/assets/banner.png 'Reputo')

<p align="center">
  <br/>
  <a href="https://logid.xyz">Reputo</a> is a privacy-preserving, modular reputation platform inspired by Snapshot.
  <br/>
</p>

<div align="center">

[![CI](https://github.com/togethercrew/reputo/actions/workflows/main.yml/badge.svg)](https://github.com/togethercrew/reputo/actions/workflows/main.yml)&nbsp;[![Coverage Status](https://codecov.io/gh/togethercrew/reputo/branch/main/graph/badge.svg)](https://codecov.io/gh/togethercrew/reputo)&nbsp;[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

</div>

## Table of Contents

1. [Apps & Packages](#apps--packages)
2. [Quick Start](#quick-start)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Algorithm Development](#algorithm-development)
6. [Contributing](#contributing)
7. [License](#license)
8. [Team](#team)

---

## Apps & Packages

| Path                             | Stack                                                                                                                                                                                                           | Status   | Links                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `apps/api`                       | ![nestjs](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white&style=flat)                                                                                                                   | ✅ Ready | [📚 README](apps/api/README.md) · [📖 API Docs](https://api-staging.logid.xyz/reference) |
| `apps/ui`                        | ![next](https://img.shields.io/badge/-Next.js-000000?logo=nextdotjs&logoColor=white&style=flat)                                                                                                                 | ✅ Ready | [📚 README](apps/ui/README.md) · [🌐 App](https://staging.logid.xyz)                     |
| `apps/workflows`                 | ![temporal](https://img.shields.io/badge/-Temporal-000000?logo=temporal&logoColor=white&style=flat) + ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat) | ✅ Ready | [📚 README](apps/workflows/README.md)                                                    |
| `packages/reputation-algorithms` | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | ✅ Ready | [📚 README](packages/reputation-algorithms/README.md)                                    |
| `packages/algorithm-validator`   | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | ✅ Ready | [📚 README](packages/algorithm-validator/README.md)                                      |
| `packages/database`              | ![mongoose](https://img.shields.io/badge/-Mongoose-880000?logo=mongoose&logoColor=white&style=flat) + ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat) | ✅ Ready | [📚 README](packages/database/README.md)                                                 |
| `packages/storage`               | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | ✅ Ready | [📚 README](packages/storage/README.md)                                                  |
| `packages/deepfunding-portal-api`| ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | ✅ Ready | [📚 README](packages/deepfunding-portal-api/README.md)                                   |

---

## Quick Start

### Local development (pnpm)

```bash
# Install dependencies
pnpm install

# Build project
pnpm build

# Run all services in parallel
pnpm dev

# Run individual services
pnpm -F @reputo/api dev   # API only
```

### Local development (Docker Compose)

#### Minimal local stack

```bash
# Basic local development setup
docker compose -f docker/docker-compose.dev.yml up --build
```

---

## Prerequisites

### Development Environment

-   **Node.js**: 20.x or higher
-   **pnpm**: 10.12.4 or higher
-   **Docker**: For containerized development
-   **Git**: With Lefthook for git hooks

### Production/Staging Deployment

-   **Docker & Docker Compose**: Container orchestration
-   **Traefik**: Reverse proxy
-   **Domain & DNS**: For SSL certificate generation
-   **Cloudflare API Token**: For DNS challenge

---

## Project Structure

```text
reputo/
├── apps/
│   ├── api/                        # NestJS API server
│   ├── ui/                         # Next.js frontend
│   └── workflows/                  # Temporal workflows & algorithm workers
├── packages/
│   ├── algorithm-validator/        # Shared Zod validation library
│   ├── database/                   # Mongoose database layer
│   ├── deepfunding-portal-api/      # DeepFunding Portal API client & SQLite ingest
│   ├── reputation-algorithms/       # Algorithm definitions registry
│   └── storage/                    # Framework-agnostic S3 utilities
├── scripts/
│   ├── create-algorithm.ts         # Unified algorithm creation CLI
│   └── validate-algorithms.ts      # Algorithm sync validation CLI
├── docker/
│   ├── docker-compose.yml          # Production/staging setup
│   ├── docker-compose.dev.yml      # Local development
│   ├── preview/                    # PR preview environments
│   ├── Dockerfile                  # Multi-stage build
│   └── traefik.yml                 # Reverse proxy config
├── .github/
│   ├── workflows/                  # CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md
├── coverage/                       # Test coverage reports
├── node_modules/                   # pnpm workspace dependencies
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # Workspace definition
├── biome.json                      # Linting & formatting
├── lefthook.yml                    # Git hooks
├── vitest.config.ts                # Test runner config
├── tsconfig.vitest.json            # Vitest TS config
└── commitlint.config.mjs           # Commit message linting
```

## Environments

We follow a three-tier deployment strategy with automated promotion:

#### Preview Environment (Pull Requests)

-   **Trigger**: Adding `pullpreview` label to PRs
-   **Infrastructure**: AWS Lightsail
-   **URL**: Dynamic subdomain generated per PR
-   **Cleanup**: Auto-expires after 48h or PR closure

#### Staging Environment

-   **Trigger**: Merge to `main` branch (automated)
-   **URL**:
    -   UI: [staging.logid.xyz](https://staging.logid.xyz)
    -   API: [api-staging.logid.xyz](https://api-staging.logid.xyz)
    -   Traefik: [traefik-staging.logid.xyz/dashboard](https://traefik-staging.logid.xyz/dashboard/)
-   **Deployment**: Watchtower auto-pulls `staging` tagged images

#### Production Environment

-   **Trigger**: Manual workflow dispatch with commit SHA
-   **URL**:
    -   UI: [logid.xyz](https://logid.xyz)
    -   API: [api.logid.xyz](https://api.logid.xyz)
    -   Traefik: [traefik.logid.xyz/dashboard](https://traefik.logid.xyz/dashboard/)
-   **Process**: Promotes staging images with `production` tags

---

## Algorithm Development

This section guides you through creating, configuring, and implementing reputation algorithms.

### Overview

Algorithms in Reputo consist of two parts:

1. **Algorithm Definition** - A JSON schema that describes the algorithm's metadata, inputs, outputs, and runtime configuration. Located in `packages/reputation-algorithms/src/registry/`.

2. **Activity Implementation** - TypeScript code that executes the algorithm logic. Located in `apps/workflows/src/activities/typescript/algorithms/`.

### Step 1: Create a New Algorithm

Use the unified CLI to create both the definition and activity scaffold in one command:

```bash
pnpm algorithm:create <key> <version>
```

**Example:**

```bash
pnpm algorithm:create proposal_engagement 1.0.0
```

This creates:

-   `packages/reputation-algorithms/src/registry/proposal_engagement/1.0.0.json` - Algorithm definition
-   `apps/workflows/src/activities/typescript/algorithms/proposal-engagement/compute.ts` - Activity implementation
-   `apps/workflows/src/activities/typescript/algorithms/proposal-engagement/index.ts` - Activity export

**Requirements:**

-   `key` must be `snake_case` (e.g., `voting_engagement`, `proposal_score`)
-   `version` must be valid SemVer (e.g., `1.0.0`, `2.1.0-beta`)

### Step 2: Configure the Algorithm Definition

Edit the generated JSON file to define your algorithm's schema:

```json
{
    "key": "proposal_engagement",
    "name": "Proposal Engagement",
    "category": "Engagement",
    "description": "Calculates user engagement based on proposal interactions",
    "version": "1.0.0",
    "inputs": [
        {
            "key": "proposals",
            "label": "Proposals CSV",
            "type": "csv",
            "csv": {
                "hasHeader": true,
                "columns": [
                    { "key": "user_id", "type": "string" },
                    { "key": "proposal_id", "type": "string" },
                    {
                        "key": "action",
                        "type": "enum",
                        "enum": ["view", "vote", "comment"]
                    }
                ]
            }
        }
    ],
    "outputs": [
        {
            "key": "engagement_scores",
            "label": "Engagement Scores",
            "type": "csv",
            "csv": {
                "columns": [
                    { "key": "user_id", "type": "string" },
                    { "key": "score", "type": "number" }
                ]
            }
        }
    ],
    "runtime": "typescript"
}
```

**Key fields:**

| Field     | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| `inputs`  | Define expected input data schema (CSV columns, types, constraints) |
| `outputs` | Define output data schema                                           |
| `runtime` | The runtime environment for the algorithm (e.g., `typescript`)      |

### Step 3: Implement the Activity Logic

Edit the generated activity file to implement your algorithm:

```typescript
// apps/workflows/src/activities/typescript/algorithms/proposal-engagement/compute.ts

export async function computeProposalEngagement(
    snapshot: Snapshot,
    storage: Storage
): Promise<AlgorithmResult> {
    const { inputs } = snapshot.algorithmPresetFrozen

    // 1. Get input data
    const inputKey = getInputValue(inputs, 'proposals')
    const buffer = await storage.getObject({ bucket, key: inputKey })
    const rows = parse(buffer.toString('utf8'), { columns: true })

    // 2. Implement your algorithm logic
    const scores = computeEngagementScores(rows)

    // 3. Serialize and upload output
    const outputCsv = stringify(scores, { header: true })
    const outputKey = generateKey('snapshot', snapshotId, `${algorithmKey}.csv`)
    await storage.putObject({
        bucket,
        key: outputKey,
        body: outputCsv,
        contentType: 'text/csv',
    })

    // 4. Return output locations
    return {
        outputs: {
            engagement_scores: outputKey,
        },
    }
}
```

### Step 4: Validate Synchronization

Ensure all algorithm definitions have corresponding activity implementations:

```bash
pnpm algorithm:validate
```

This checks:

-   Every definition has a matching algorithm directory with `compute.ts`
-   Every algorithm is registered in the dispatcher
-   Every algorithm is exported in the algorithms index

### Step 5: Build and Test

```bash
# Validate and build the algorithms package
pnpm --filter @reputo/reputation-algorithms build

# Build the workflows package
pnpm --filter @reputo/workflows build

# Run tests
pnpm test
```

### Adding a New Version

To add a new version of an existing algorithm:

```bash
pnpm algorithm:create voting_engagement 2.0.0
```

This creates a new version file. The activity implementation is shared across versions unless you need version-specific logic.

### CLI Reference

| Command                                                                        | Description                                     |
| ------------------------------------------------------------------------------ | ----------------------------------------------- |
| `pnpm algorithm:create <key> <version>`                                        | Create algorithm definition + activity scaffold |
| `pnpm algorithm:validate`                                                      | Validate definitions and activities are in sync |
| `pnpm --filter @reputo/reputation-algorithms algorithm:create <key> <version>` | Create definition only                          |

---

## Contributing

### Branching Strategy: GitHub Flow

1. **Create feature branch** from `main`

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Open Pull Request** to `main`

    - Add `pullpreview` label for preview deployment
    - Ensure CI passes
    - Request review from maintainers

3. **Merge** after approval

---

## License

Released under the **GPL-3.0** license. See [LICENSE](LICENSE) file for details.

---

## Team

| [![Cyrille Derche](https://github.com/cyri113.png?size=100)](https://github.com/cyri113) | [![Mohammad Khaki](https://github.com/arvandmoe.png?size=100)](https://github.com/arvandmoe) | [![Behzad Rabiei](https://github.com/Behzad-rabiei.png?size=100)](https://github.com/Behzad-rabiei) |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Cyrille Derche](https://github.com/cyri113)                                             | [Mohammad Khaki](https://github.com/arvandmoe)                                               | [Behzad Rabiei](https://github.com/Behzad-rabiei)                                                   |
