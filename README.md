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

1. [Apps & Packages](#apps--packages)
2. [Quick Start](#quick-start)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Environments](#environment-setup)
6. [Contributing](#contributing)
7. [License](#license)
8. [Team](#team)

---

## Apps & Packages

| Path                             | Stack                                                                                                                                                                                                           | Status         | Links                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `apps/api`                       | ![nestjs](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white&style=flat)                                                                                                                   | ✅ Ready       | [📚 README](apps/api/README.md) · [📖 API Docs](https://api-staging.logid.xyz/reference) |
| `apps/ui`                        | ![next](https://img.shields.io/badge/-Next.js-000000?logo=nextdotjs&logoColor=white&style=flat)                                                                                                                 | ✅ Ready       | [📚 README](apps/ui/README.md) · [🌐 App](https://staging.logid.xyz)                     |
| `apps/workflows`                 | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | 🔄 In Progress | -                                                                                        |
| `packages/reputation-algorithms` | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                                                       | ✅ Ready       | [📚 README](packages/reputation-algorithms/README.md)                                    |
| `packages/database`              | ![mongoose](https://img.shields.io/badge/-Mongoose-880000?logo=mongoose&logoColor=white&style=flat) + ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat) | ✅ Ready       | [📚 README](packages/database/README.md)                                                 |

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

---

## Prerequisites

### Development Environment

- **Node.js**: 20.x or higher
- **pnpm**: 10.12.4 or higher
- **Docker**: For containerized development
- **Git**: With Lefthook for git hooks

### Production/Staging Deployment

- **Docker & Docker Compose**: Container orchestration
- **Traefik**: Reverse proxy
- **Domain & DNS**: For SSL certificate generation
- **Cloudflare API Token**: For DNS challenge

---

## Project Structure

```text
reputo/
├── apps/
│   ├── api/                        # NestJS API server
│   ├── ui/                         # Next.js frontend
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

## Environments

We follow a three-tier deployment strategy with automated promotion:

#### Preview Environment (Pull Requests)

- **Trigger**: Adding `pullpreview` label to PRs
- **Infrastructure**: AWS Lightsail
- **URL**: Dynamic subdomain generated per PR
- **Cleanup**: Auto-expires after 48h or PR closure

#### Staging Environment

- **Trigger**: Merge to `main` branch (automated)
- **URL**:
    - UI: [staging.logid.xyz](https://staging.logid.xyz)
    - API: [api-staging.logid.xyz](https://api-staging.logid.xyz)
    - Traefik: [traefik-staging.logid.xyz/dashboard](https://traefik-staging.logid.xyz/dashboard/)
- **Deployment**: Watchtower auto-pulls `staging` tagged images

#### Production Environment

- **Trigger**: Manual workflow dispatch with commit SHA
- **URL**:
    - UI: [logid.xyz](https://logid.xyz)
    - API: [api.logid.xyz](https://api.logid.xyz)
    - Traefik: [traefik.logid.xyz/dashboard](https://traefik.logid.xyz/dashboard/)
- **Process**: Promotes staging images with `production` tags

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
