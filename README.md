# Reputo 🚀

[![CI](https://github.com/togethercrew/reputo/actions/workflows/main.yml/badge.svg)](https://github.com/togethercrew/reputo/actions/workflows/main.yml)  
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)  
[![Coverage Status](https://codecov.io/gh/togethercrew/reputo/branch/main/graph/badge.svg)](https://codecov.io/gh/togethercrew/reputo)

---

## ✨ What is Reputo?

**Reputo** is a privacy-preserving, modular reputation-and-voting platform inspired by Snapshot, designed for SingularityNET DAOs and the wider web-3 ecosystem.

### 🎯 Vision & Planned Features

- 🧩 **Highly customizable** – admins compose "Reputation Strategies" from pluggable data services, algorithms and weights
- ⚡ **Scalable & reliable** – Temporal-orchestrated micro-services keep long-running jobs durable and auditable
- 🛡️ **Privacy-first** – homomorphic encryption & ZK-proofs let anyone verify results without exposing raw personal data
- 📝 **Compliant** – a consent dashboard lets community members grant or revoke data processing rights (GDPR-ready)

### 🚧 Current Development Status

This project is in **early development stage**. The current implementation includes:

- ✅ Complete monorepo infrastructure with pnpm workspaces
- ✅ Multi-stage Docker builds and container orchestration
- ✅ CI/CD pipelines with automated testing and deployment
- ✅ Basic NestJS API with health checks
- ✅ React UI foundation with Vite
- ✅ Foundational reputation algorithms package
- 🔄 Temporal workflows integration (planned)
- 🔄 Advanced reputation algorithms (in development)
- 🔄 Privacy features (homomorphic encryption, ZK-proofs) (planned)

---

## 📚 Table of Contents

1. [🚀 Quick Start](#-quick-start)
2. [📋 Prerequisites](#-prerequisites)
3. [📁 Project Structure](#-project-structure)
4. [🧩 Apps & Packages](#-apps--packages)
5. [🛠️ Tooling & Conventions](#-tooling--conventions)
6. [🌍 Environment Strategy](#-environment-strategy)
7. [🔑 Environment Variables](#-environment-variables)
8. [🐳 Docker & Infrastructure](#-docker--infrastructure)
9. [🧪 Testing](#-testing)
10. [🤝 Contributing](#-contributing)
11. [🚢 Deployment & Release Process](#-deployment--release-process)
12. [🏗️ Architecture](#-architecture)
13. [🔧 Development Scripts](#-development-scripts)
14. [📄 License](#-license)

---

## 🚀 Quick Start

### 🖥️ Local development (pnpm)

```bash
# Install dependencies
pnpm install

# Run all services in parallel
pnpm dev

# Run individual services
pnpm start:backend    # API only
pnpm start:frontend   # UI only
pnpm start:temporal   # Workflows only only
```

> Requires **Node 20+** and **pnpm 10.12.4+**

### 🐳 Local development (Docker Compose)

#### Minimal local stack

```bash
# Basic local development setup
docker compose -f docker/docker-compose.local.yml up --build

# Services available at:
# - API: http://localhost:3000
# - UI: http://localhost:8080
# - Workflows: Background service
```

#### Production-like setup

```bash
# Full staging/production environment setup with Traefik
docker compose -f docker/docker-compose.yml up --build

# Requires .env file in docker/ directory
```

### ✅ Quick health checks

```bash
# API health check
curl http://localhost:3000/healthz

# UI accessibility
open http://localhost:8080

# Check all services are running
docker ps
```

---

## 📋 Prerequisites

### Development Environment

- **Node.js**: 20.x or higher
- **pnpm**: 10.12.4 or higher (specified in `packageManager`)
- **Docker**: For containerized development
- **Git**: With Lefthook for git hooks

### Production/Staging Deployment

- **Docker & Docker Compose**: Container orchestration
- **Traefik**: Reverse proxy (included in compose)
- **Domain & DNS**: For SSL certificate generation
- **Cloudflare API Token**: For DNS challenge (Let's Encrypt)

### Planned Dependencies (Future Releases)

- **Temporal**: Workflow orchestration engine
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage

---

## 📁 Project Structure

```
reputo/
├── apps/
│   ├── api/                     # NestJS API server
│   │   ├── src/
│   │   │   ├── main.ts         # Application entry point
│   │   │   ├── app.module.ts   # Root module
│   │   │   ├── app.controller.ts # Health check endpoints
│   │   │   └── app.service.ts  # Core business logic
│   │   ├── test/               # E2E tests
│   │   ├── package.json        # API dependencies
│   │   └── nest-cli.json       # NestJS configuration
│   ├── ui/                     # React + Vite frontend
│   │   ├── src/
│   │   │   ├── main.tsx        # React entry point
│   │   │   ├── App.tsx         # Main React component
│   │   │   └── assets/         # Static assets
│   │   ├── public/             # Public static files
│   │   ├── index.html          # HTML template
│   │   └── vite.config.ts      # Vite configuration
│   └── workflows/              # Temporal workflows (planned)
│       ├── src/
│       │   └── index.ts        # Workflow definitions
│       └── package.json        # Workflow dependencies
├── packages/
│   └── reputation-algorithms/   # Shared TypeScript algorithms
│       ├── src/
│       │   ├── index.ts        # Main exports
│       │   └── hello.service.ts # Example service
│       └── package.json        # Package configuration
├── docker/
│   ├── docker-compose.yml      # Production/staging setup
│   ├── docker-compose.local.yml # Local development
│   ├── docker-compose.preview.yml # PR preview environments
│   ├── Dockerfile              # Multi-stage build
│   ├── traefik.yml            # Reverse proxy config
│   └── .env.example           # Environment template
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   ├── main.yml           # Main workflow (staging)
│   │   ├── promote-production.yml # Production promotion
│   │   ├── pull-request.yml   # PR checks
│   │   └── pull-preview.yml   # Preview deployments
│   └── PULL_REQUEST_TEMPLATE.md
├── coverage/                   # Test coverage reports
├── node_modules/              # pnpm workspace dependencies
├── package.json               # Root workspace config
├── pnpm-workspace.yaml        # Workspace definition
├── biome.json                 # Linting & formatting
├── lefthook.yml              # Git hooks
├── vitest.config.ts          # Test runner config
├── tsconfig.base.json        # Shared TypeScript config
└── commitlint.config.mjs     # Commit message linting
```

---

## 🧩 Apps & Packages

| 📂 Path                          | 🛠️ Stack                                                                                                                                                                             | 📝 Notes                     | 🔄 Status      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | -------------- |
| `apps/api`                       | ![nestjs](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white&style=flat)                                                                                        | REST API with health checks  | ✅ Basic Setup |
| `apps/ui`                        | ![react](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat) + ![vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat) | Single-page application      | ✅ Basic Setup |
| `apps/workflows`                 | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                            | Temporal workflows (planned) | 🔄 In Progress |
| `packages/reputation-algorithms` | ![typescript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)                                                                            | Pure algorithms – no I/O     | 🔄 In Progress |

### Current API Endpoints

- `GET /` - Welcome message
- `GET /healthz` - Health check with system metrics

### Package Dependencies

Each app/package has its own `package.json` with specific dependencies:

- **API**: NestJS core, Express, RxJS, workspace algorithms
- **UI**: React 19, Vite, TypeScript, workspace algorithms
- **Workflows**: TypeScript (Temporal SDK to be added)
- **Algorithms**: Pure TypeScript with no external dependencies

---

## 🛠️ Tooling & Conventions

- 🏗️ **Monorepo**: pnpm workspaces with workspace protocol for internal packages
- 🧪 **Test runner**: Vitest with SWC compilation and V8 coverage
- 🎨 **Lint/Format**: Biome (replaces ESLint + Prettier) for consistent code style
- 🪝 **Git hooks**: Lefthook for pre-commit checks and commit message validation
- 🏷️ **Versioning**: Semantic Release with conventional commits
- 🐳 **Containers**: Multi-stage Docker builds with optimized production images
- 🔄 **CI/CD**: GitHub Actions with comprehensive quality gates
- 🌿 **Branching**: GitHub Flow (feature branches → main)
- 📦 **Package Manager**: pnpm 10.12.4 with workspace dependencies

### Code Quality Pipeline

1. **Pre-commit**: Biome formatting and linting
2. **Commit**: Conventional commit message validation
3. **Pre-push**: Full test suite execution
4. **CI**: Quality gate with parallel testing, linting, and building

---

## 🌍 Environment Strategy

We follow a three-tier deployment strategy with automated promotion:

### 🔍 Preview Environment (Pull Requests)

- **Trigger**: Adding `pullpreview` label to PRs
- **Infrastructure**: AWS Lightsail (auto-provisioned via PullPreview)
- **URL**: Dynamic subdomain generated per PR
- **Cleanup**: Auto-expires after 48h or PR closure
- **Purpose**: Design review and QA testing

### 🧪 Staging Environment

- **Trigger**: Merge to `main` branch (automated)
- **URL**:
    - UI: [staging.logid.xyz](https://staging.logid.xyz)
    - API: [api-staging.logid.xyz](https://api-staging.logid.xyz)
    - Traefik: [traefik-staging.logid.xyz/dashboard](https://traefik-staging.logid.xyz/dashboard/)
- **Deployment**: Watchtower auto-pulls `staging` tagged images
- **Purpose**: Integration testing and release preparation

### 🚀 Production Environment

- **Trigger**: Manual workflow dispatch with commit SHA
- **URL**:
    - UI: [logid.xyz](https://logid.xyz)
    - API: [api.logid.xyz](https://api.logid.xyz)
    - Traefik: [traefik.logid.xyz/dashboard](https://traefik.logid.xyz/dashboard/)
- **Process**: Promotes staging images with `production` tags
- **Purpose**: Live user-facing environment

---

## 🔑 Environment Variables

### Docker Environment (.env)

Create a `.env` file in the `docker/` directory:

| Variable           | Purpose                         | Example                     |
| ------------------ | ------------------------------- | --------------------------- |
| `UI_DOMAIN`        | Frontend domain                 | `staging.logid.xyz`         |
| `API_DOMAIN`       | Backend API domain              | `api-staging.logid.xyz`     |
| `TRAEFIK_DOMAIN`   | Traefik dashboard domain        | `traefik-staging.logid.xyz` |
| `TRAEFIK_AUTH`     | Dashboard basic auth (htpasswd) | `admin:$2y$10$...`          |
| `IMAGE_TAG`        | Docker image tag                | `staging` / `production`    |
| `CF_DNS_API_TOKEN` | Cloudflare DNS API token        | `your-cloudflare-token`     |

### Application Environment

| Variable   | Purpose             | Default (dev) | Required |
| ---------- | ------------------- | ------------- | -------- |
| `NODE_ENV` | Runtime environment | `development` | No       |

## 🐳 Docker & Infrastructure

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

- **TLS**: Automatic HTTPS with Let's Encrypt via Cloudflare DNS challenge
- **Routing**: Domain-based routing with middleware support
- **Dashboard**: Protected with basic authentication
- **Health checks**: Built-in monitoring and failover
- **CORS**: Configurable cross-origin resource sharing

### Container Registry

All images are published to GitHub Container Registry:

```
ghcr.io/togethercrew/reputo/api:${TAG}
ghcr.io/togethercrew/reputo/ui:${TAG}
ghcr.io/togethercrew/reputo/workflows:${TAG}
```

### Watchtower Auto-deployment

Automated container updates with:

- Image monitoring with label-based filtering
- Rolling restart strategy to minimize downtime
- Automatic cleanup of old images
- 60-second polling interval for rapid deployments

---

## 🧪 Testing

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

- 🧪 **Framework**: Vitest with SWC compilation for fast execution
- 🛡️ **Coverage**: V8 coverage provider with comprehensive reporting
- 🗂️ **Layout**: Tests adjacent to source files (`*.test.ts`, `*.spec.ts`)
- 📊 **Reporting**: Coverage reports generated in `coverage/` directory
- 🔧 **Config**: Shared configuration in `vitest.config.ts` with project-specific overrides

### Coverage Targets

- Minimum coverage thresholds enforced in CI
- Coverage reports uploaded to Codecov for tracking
- Per-package coverage reporting for monorepo visibility

### Test Types

- **Unit tests**: Individual function/component testing
- **Integration tests**: API endpoint testing with supertest
- **E2E tests**: Planned for UI workflow testing

---

## 🤝 Contributing

### 🌿 Branching Strategy: GitHub Flow

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

### 📝 Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/) enforced by commitlint:

```
feat(scope): add new feature
fix(scope): bug fix
docs(scope): documentation update
style(scope): formatting changes
refactor(scope): code refactoring
test(scope): add or update tests
chore(scope): maintenance tasks
ci(scope): CI/CD pipeline changes
```

**Scopes**: `api`, `ui`, `workflows`, `algorithms`, `docker`, `ci`

### ✅ Pull Request Checklist

- [ ] `pnpm check` passes (Biome formatting and linting)
- [ ] `pnpm test` passes with adequate coverage
- [ ] Documentation updated if needed
- [ ] PR has descriptive title and body
- [ ] Conventional commit messages used
- [ ] At least one reviewer approval
- [ ] Preview deployment tested (if applicable)

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

## 🚢 Deployment & Release Process

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

- **Feature branches**: `main-{commit-sha}` for specific testing
- **Staging**: `staging` (auto-deployed from main branch)
- **Production**: `production` and `prod-{commit-sha}` (manually promoted from staging)

### Rollback Process

Fast rollback capability:

1. Identify previous production image tag
2. Re-tag with `production`
3. Watchtower automatically redeploys
4. Typical rollback time: 2-3 minutes

---

### Component Responsibilities

- **🔀 Traefik**: TLS termination, domain routing, load balancing, dashboard
- **🖼️ UI**: React SPA with Vite build, served as static files via http-server
- **⚙️ API**: NestJS REST API with health checks and business logic
- **📦 Algorithms**: Pure TypeScript functions for reputation calculations
- **⏱️ Workflows**: Temporal-based background job processing (planned)
- **🐋 Watchtower**: Automated container updates with rolling deployment
- **📦 GHCR**: Container image registry and artifact storage

### Technology Stack

| Layer              | Technology                       | Purpose                              |
| ------------------ | -------------------------------- | ------------------------------------ |
| **Frontend**       | React 19, TypeScript, Vite       | User interface                       |
| **Backend**        | NestJS, Express, TypeScript      | API and business logic               |
| **Workflows**      | Temporal (planned), TypeScript   | Background job processing            |
| **Infrastructure** | Docker, Traefik, Watchtower      | Containerization and deployment      |
| **CI/CD**          | GitHub Actions, Watchtower       | Automation and deployment management |
| **Monitoring**     | Health checks, Traefik dashboard | System monitoring                    |

---

## 🔧 Development Scripts

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
```

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

## 📄 License

Released under the **GPL-3.0** license. See [LICENSE](LICENSE) file for details.

This project is open source and welcomes contributions from the community.

---

## 👥 Team

| [![Cyrille Derche](https://github.com/cyri113.png?size=100)](https://github.com/cyri113) | [![Behzad Rabiei](https://github.com/Behzad-rabiei.png?size=100)](https://github.com/Behzad-rabiei) |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Cyrille Derche](https://github.com/cyri113)                                             | [Behzad Rabiei](https://github.com/Behzad-rabiei)                                                   |

_Built with ❤️ by the TogetherCrew team_
