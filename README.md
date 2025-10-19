![Reputo](.github/assets/banner.png 'Reputo')

<p align="center">
  <br/>
  <a href="https://logid.xyz">Reputo</a> is a privacy-preserving, modular reputation-and-voting platform inspired by Snapshot.
  <br/>
</p>

<div align="center">

[![CI](https://github.com/togethercrew/reputo/actions/workflows/main.yml/badge.svg)](https://github.com/togethercrew/reputo/actions/workflows/main.yml)&nbsp;[![Coverage Status](https://codecov.io/gh/togethercrew/reputo/branch/main/graph/badge.svg)](https://codecov.io/gh/togethercrew/reputo)&nbsp;[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

</div>

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Apps & Packages](#apps--packages)
5. [Tooling & Development Workflow](#tooling--development-workflow)
6. [Environment Setup](#environment-setup)
7. [Docker & Infrastructure](#docker--infrastructure)
8. [Testing](#testing)
9. [Deployment & Release](#deployment--release)
10. [Contributing](#contributing)
11. [License](#license)
12. [Team](#team)

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
pnpm start:backend    # API only
pnpm start:frontend   # UI only
pnpm start:temporal   # Workflows only
```

> Requires **Node 20+** and **pnpm 10.12.4+**

### Local development (Docker Compose)

#### Minimal local stack

```bash
# Basic local development setup
docker compose -f docker/docker-compose.local.yml up --build

# Services available at:
# - API: http://localhost:3000
# - UI: http://localhost:8080
# - Workflows: Background service
```

### Quick health checks

```bash
# API health check
curl http://localhost:3000/healthz

# UI accessibility
open http://localhost:8080

# Check all services are running
docker ps
```

---

## Prerequisites

### Development Environment

-   **Node.js**: 20.x or higher
-   **pnpm**: 10.12.4 or higher (specified in `packageManager`)
-   **Docker**: For containerized development
-   **Git**: With Lefthook for git hooks

### Production/Staging Deployment

-   **Docker & Docker Compose**: Container orchestration
-   **Traefik**: Reverse proxy (included in compose)
-   **Domain & DNS**: For SSL certificate generation
-   **Cloudflare API Token**: For DNS challenge (Let's Encrypt)

---

## Project Structure

```
reputo/
├── apps/
│   ├── api/                        # NestJS API server
│   ├── ui/                         # React + Vite frontend
│   └── workflows/                  # Temporal workflows
├── packages/
│   ├── reputation-algorithms/      # Shared TypeScript algorithms
│   └── database/                   # Mongoose database layer
├── docker/
│   ├── docker-compose.yml          # Production/staging setup
│   ├── docker-compose.local.yml    # Local development
│   ├── docker-compose.preview.yml  # PR preview environments
│   ├── Dockerfile                  # Multi-stage build
│   ├── traefik.yml                 # Reverse proxy config
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
├── tsconfig.base.json              # Shared TypeScript config
└── commitlint.config.mjs           # Commit message linting
```

---

## Apps & Packages

| Path                             | Stack                                                                                                                                                                                                           | Notes                               | Status         | Documentation                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------- | ----------------------------------------------------------- |
| `apps/api`                       | ![nestjs](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white&style=flat)                                                                                                                   | REST API with health checks         | ✅ Basic Setup | -                                                           |
| `apps/ui`                        | ![react](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat) + ![vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat)                            | Single-page application             | ✅ Basic Setup | -                                                           |
| `apps/workflows`                 | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | Temporal workflows                  | 🔄 In Progress | -                                                           |
| `packages/reputation-algorithms` | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | Algorithm registry & definitions    | ✅ Ready       | [📚 README](packages/reputation-algorithms/docs/globals.md) |
| `packages/database`              | ![mongoose](https://img.shields.io/badge/-Mongoose-880000?logo=mongoose&logoColor=white&style=flat) + ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat) | Type-safe database models & schemas | ✅ Ready       | [📚 README](packages/database/docs/globals.md)              |

---

## Tooling & Development Workflow

### Tools & Conventions

-   **Monorepo**: pnpm workspaces with workspace protocol for internal packages
-   **Test runner**: Vitest with SWC compilation and V8 coverage
-   **Lint/Format**: Biome (replaces ESLint + Prettier) for consistent code style
-   **Git hooks**: Lefthook for pre-commit checks and commit message validation
-   **Versioning**: Semantic Release with conventional commits
-   **Containers**: Multi-stage Docker builds with optimized production images
-   **CI/CD**: GitHub Actions with comprehensive quality gates
-   **Branching**: GitHub Flow (feature branches → main)
-   **Package Manager**: pnpm 10.12.4 with workspace dependencies

### Code Quality Pipeline

1. **Pre-commit**: Biome formatting and linting
2. **Commit**: Conventional commit message validation
3. **Pre-push**: Full test suite execution
4. **CI**: Quality gate with parallel testing, linting, and building

### Root Workspace Commands

```bash
# Parallel development
pnpm dev              # Run all apps in development mode
pnpm start            # Run all apps in production mode
pnpm build            # Build all packages and apps
pnpm test             # Run all tests with Vitest
pnpm ci:test          # Run tests with coverage reporting

# Code quality
pnpm check            # Run Biome on all packages (format + lint)
pnpm lint             # Lint all packages
pnpm format           # Format all packages

# Release management
pnpm release          # Semantic release for all packages
pnpm cz               # Interactive conventional commit
```

### Individual App Commands

```bash
# API development
pnpm --filter @reputo/api dev
pnpm --filter @reputo/api build
pnpm --filter @reputo/api test

# UI development
pnpm --filter @reputo/ui dev
pnpm --filter @reputo/ui build
pnpm --filter @reputo/ui preview

# Workflows development
pnpm --filter @reputo/workflows dev
pnpm --filter @reputo/workflows build

# Algorithms development
pnpm --filter @reputo/reputation-algorithms dev
pnpm --filter @reputo/reputation-algorithms build
pnpm --filter @reputo/reputation-algorithms test

# Database development
pnpm --filter @reputo/database build
pnpm --filter @reputo/database test
pnpm --filter @reputo/database docs
```

### Development Workflow

```bash
# Setup development environment
pnpm install
pnpm dev

# Make changes with auto-formatting
# (Biome runs on save in most editors)

# Run quality checks
pnpm check    # Format + lint + type check
pnpm test     # Run test suite

# Commit with conventional format
pnpm run cz   # Interactive commit helper
```

---

## Environment Setup

### Environment Strategy

We follow a three-tier deployment strategy with automated promotion:

#### Preview Environment (Pull Requests)

-   **Trigger**: Adding `pullpreview` label to PRs
-   **Infrastructure**: AWS Lightsail (auto-provisioned via PullPreview)
-   **URL**: Dynamic subdomain generated per PR
-   **Cleanup**: Auto-expires after 48h or PR closure
-   **Purpose**: Design review and QA testing

#### Staging Environment

-   **Trigger**: Merge to `main` branch (automated)
-   **URL**:
    -   UI: [staging.logid.xyz](https://staging.logid.xyz)
    -   API: [api-staging.logid.xyz](https://api-staging.logid.xyz)
    -   Traefik: [traefik-staging.logid.xyz/dashboard](https://traefik-staging.logid.xyz/dashboard/)
-   **Deployment**: Watchtower auto-pulls `staging` tagged images
-   **Purpose**: Integration testing and release preparation

#### Production Environment

-   **Trigger**: Manual workflow dispatch with commit SHA
-   **URL**:
    -   UI: [logid.xyz](https://logid.xyz)
    -   API: [api.logid.xyz](https://api.logid.xyz)
    -   Traefik: [traefik.logid.xyz/dashboard](https://traefik.logid.xyz/dashboard/)
-   **Process**: Promotes staging images with `production` tags
-   **Purpose**: Live user-facing environment

### Environment Variables

#### Docker Environment (.env)

Create a `.env` file in the `docker/` directory:

| Variable           | Purpose                         | Example                     |
| ------------------ | ------------------------------- | --------------------------- |
| `UI_DOMAIN`        | Frontend domain                 | `staging.logid.xyz`         |
| `API_DOMAIN`       | Backend API domain              | `api-staging.logid.xyz`     |
| `TRAEFIK_DOMAIN`   | Traefik dashboard domain        | `traefik-staging.logid.xyz` |
| `TRAEFIK_AUTH`     | Dashboard basic auth (htpasswd) | `admin:$2y$10$...`          |
| `IMAGE_TAG`        | Docker image tag                | `staging` / `production`    |
| `CF_DNS_API_TOKEN` | Cloudflare DNS API token        | `your-cloudflare-token`     |

#### Application Environment

| Variable   | Purpose             | Default (dev) | Required |
| ---------- | ------------------- | ------------- | -------- |
| `NODE_ENV` | Runtime environment | `development` | No       |

---

## Docker & Infrastructure

### Multi-stage Dockerfile

Our `docker/Dockerfile` uses an optimized multi-stage build:

1. **Base**: Node.js 20 with pnpm installed via corepack
2. **Build**: Install all dependencies, build all apps, deploy to isolated directories
3. **Runtime**: Three separate lightweight images for `api`, `ui`, and `workflows`

```dockerfile
# Example build command
docker build -f docker/Dockerfile --target api -t reputo/api .
```

### Traefik Reverse Proxy

Features:

-   **TLS**: Automatic HTTPS with Let's Encrypt via Cloudflare DNS challenge
-   **Routing**: Domain-based routing with middleware support
-   **Dashboard**: Protected with basic authentication
-   **Health checks**: Built-in monitoring and failover
-   **CORS**: Configurable cross-origin resource sharing

### Container Registry

All images are published to GitHub Container Registry:

```
ghcr.io/togethercrew/reputo/api:${TAG}
ghcr.io/togethercrew/reputo/ui:${TAG}
ghcr.io/togethercrew/reputo/workflows:${TAG}
```

### Watchtower Auto-deployment

Automated container updates with:

-   Image monitoring with label-based filtering
-   Rolling restart strategy to minimize downtime
-   Automatic cleanup of old images
-   60-second polling interval for rapid deployments

### Docker Commands

```bash
# Local development
docker compose -f docker/docker-compose.local.yml up --build

# Production-like environment
docker compose -f docker/docker-compose.yml up --build

# Build specific targets
docker build -f docker/Dockerfile --target api -t reputo/api .
docker build -f docker/Dockerfile --target ui -t reputo/ui .
docker build -f docker/Dockerfile --target workflows -t reputo/workflows .

# Cleanup
docker compose down --volumes
docker image prune -f
```

---

## Testing

### Test Framework

This project uses **Vitest** for all testing needs:

```bash
# Run all tests across workspace
pnpm test

# Run with coverage reporting
pnpm ci:test

# Watch mode for development
pnpm test --watch

# Run tests for specific package
pnpm --filter @reputo/api test
```

### Testing Configuration

-   **Framework**: Vitest with SWC compilation for fast execution
-   **Coverage**: V8 coverage provider with comprehensive reporting
-   **Layout**: Tests adjacent to source files (`*.test.ts`, `*.spec.ts`)
-   **Reporting**: Coverage reports generated in `coverage/` directory
-   **Config**: Shared configuration in `vitest.config.ts` with project-specific overrides

### Coverage Targets

-   Minimum coverage thresholds enforced in CI
-   Coverage reports uploaded to Codecov for tracking
-   Per-package coverage reporting for monorepo visibility

### Test Types

-   **Unit tests**: Individual function/component testing
-   **Integration tests**: API endpoint testing with supertest
-   **E2E tests**: Planned for UI workflow testing

---

## Deployment & Release

### Automated Staging Deployment

1. **Quality Gate**: Merge to `main` triggers comprehensive testing

    - Parallel linting, formatting, type checking
    - Full test suite execution with coverage
    - Multi-target Docker builds

2. **Build & Push**: After quality gate passes

    - Multi-stage Docker image builds
    - Push to GitHub Container Registry with `staging` tag
    - Semantic versioning and changelog generation

3. **Staging Deployment**: Watchtower auto-deployment
    - Detects new `staging` images
    - Rolling restart of containers
    - Health check verification

### Manual Production Promotion

1. **Verify staging** environment stability and functionality

2. **Trigger promotion** workflow:

    ```bash
    # Via GitHub CLI
    gh workflow run promote-production.yml -f commit=abc123...

    # Via GitHub UI
    Actions → Promote to Production → Run workflow
    ```

3. **Automated promotion**:

    - Re-tags staging images with `production` tag
    - Watchtower detects and deploys to production
    - Zero-rebuild deployment (exact staging artifacts)

4. **Verification**:
    - Health checks validate deployment
    - Rollback capability via image re-tagging

### Image Tagging Strategy

-   **Feature branches**: `main-{commit-sha}` for specific testing
-   **Staging**: `staging` (auto-deployed from main branch)
-   **Production**: `production` and `prod-{commit-sha}` (manually promoted from staging)

### Rollback Process

Fast rollback capability:

1. Identify previous production image tag
2. Re-tag with `production`
3. Watchtower automatically redeploys
4. Typical rollback time: 2-3 minutes

---

## Contributing

### Branching Strategy: GitHub Flow

1. **Create feature branch** from `main`

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Make changes** with conventional commits

    ```bash
    git commit -m "feat(api): add user authentication endpoint"
    ```

3. **Open Pull Request** to `main`

    - Add `pullpreview` label for preview deployment
    - Ensure CI passes (quality gate + tests)
    - Request review from maintainers

4. **Merge** after approval (squash merge preferred)

### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/) enforced by commitlint.

**Scopes**: `api`, `ui`, `workflows`, `algorithms`, `database`, `docker`, `ci`

### Pull Request Checklist

-   [ ] `pnpm check` passes (Biome formatting and linting)
-   [ ] `pnpm test` passes with adequate coverage
-   [ ] Documentation updated if needed
-   [ ] PR has descriptive title and body
-   [ ] Conventional commit messages used
-   [ ] At least one reviewer approval
-   [ ] Preview deployment tested (if applicable)

---

## License

Released under the **GPL-3.0** license. See [LICENSE](LICENSE) file for details.

This project is open source and welcomes contributions from the community.

---

## Team

| [![Cyrille Derche](https://github.com/cyri113.png?size=100)](https://github.com/cyri113) | [![Behzad Rabiei](https://github.com/Behzad-rabiei.png?size=100)](https://github.com/Behzad-rabiei) |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Cyrille Derche](https://github.com/cyri113)                                             | [Behzad Rabiei](https://github.com/Behzad-rabiei)                                                   |

_Built with ❤️ by the TogetherCrew team_
