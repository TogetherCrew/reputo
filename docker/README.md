# Docker Configuration

This directory contains Docker configuration files for different deployment environments.

## Directory Structure

```
docker/
├── docker-compose.yml          # Production/Staging deployment
├── docker-compose.dev.yml      # Local development (builds from source)
├── docker-compose.preview.yml  # PullPreview CI environment
├── Dockerfile                  # Multi-stage build for all services
├── env/                        # Environment variables
│   ├── examples/               # Templates (copy to parent)
│   │   ├── api.env.example
│   │   ├── mongodb.env.example
│   │   ├── shared.env.example
│   │   ├── temporal.env.example
│   │   ├── temporal-postgresql.env.example
│   │   ├── temporal-ui.env.example
│   │   ├── typescript-worker.env.example
│   │   ├── ui.env.example
│   │   └── workflows.env.example
├── mongo/                      # MongoDB initialization scripts
│   ├── init.js                 # Database initialization script
│   ├── healthcheck.js          # Replica set health check
│   └── replica.key             # Replica set authentication key
└── traefik/                    # Traefik configuration
    └── traefik.yml             # Reverse proxy configuration
```

## Docker Compose Files

### Production/Staging (`docker-compose.yml`)

Used for production and staging deployments. Features:

-   Pre-built images from GitHub Container Registry (GHCR)
-   Traefik reverse proxy with TLS via Cloudflare
-   Watchtower for automatic container updates
-   External `web` network

```bash
cd docker
docker-compose up -d
```

### Local Development (`docker-compose.dev.yml`)

Used for local development. Features:

-   Builds images from source code
-   Hot-reload via mounted source volumes
-   MongoDB with replica set and authentication
-   Exposed ports for direct access (API: 3000, UI: 8080, Temporal UI: 8088)

```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

### Preview Environment (`docker-compose.preview.yml`)

Used by PullPreview for ephemeral PR environments. Features:

-   Builds images from source code
-   Traefik without TLS (HTTP only)
-   Uses `PULLPREVIEW_PUBLIC_DNS` for dynamic routing

## Environment Files

All environment templates are located in `env/examples/` and should be copied to `env/` before running compose files.

### Template Files

Copy these templates and update with your values:

| Template                                       | Target                        | Description                                        |
| ---------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| `env/examples/api.env.example`                 | `env/api.env`                 | API service configuration (MongoDB, AWS, Temporal) |
| `env/examples/mongodb.env.example`             | `env/mongodb.env`             | MongoDB root credentials                           |
| `env/examples/shared.env.example`              | `env/shared.env`              | Production domains and Traefik config              |
| `env/examples/temporal.env.example`            | `env/temporal.env`            | Temporal server database settings                  |
| `env/examples/temporal-postgresql.env.example` | `env/temporal-postgresql.env` | PostgreSQL credentials for Temporal                |
| `env/examples/temporal-ui.env.example`         | `env/temporal-ui.env`         | Temporal UI settings                               |
| `env/examples/typescript-worker.env.example`   | `env/typescript-worker.env`   | TypeScript worker configuration                    |
| `env/examples/ui.env.example`                  | `env/ui.env`                  | UI service settings                                |
| `env/examples/workflows.env.example`           | `env/workflows.env`           | Workflows service configuration                    |

### Quick Setup

```bash
cd docker/env/examples
# Copy all example files one directory up
for f in *.env.example; do cp "$f" "../${f%.example}"; done

# Edit the files with your values (now in docker/env/*.env)
```

## Services

| Service                  | Description                     | Ports   |
| ------------------------ | ------------------------------- | ------- |
| `api`                    | NestJS backend API              | 3000    |
| `ui`                     | Next.js frontend                | 8080    |
| `workflows`              | Temporal workflow orchestrator  | -       |
| `typescript-worker`      | Temporal activity worker        | -       |
| `mongodb`                | MongoDB database (replica set)  | 27017   |
| `temporal`               | Temporal server                 | 7233    |
| `temporal-ui`            | Temporal web dashboard          | 8088    |
| `temporal-postgresql`    | PostgreSQL for Temporal         | -       |
| `temporal-elasticsearch` | Elasticsearch for Temporal      | -       |
| `traefik`                | Reverse proxy (production only) | 80, 443 |
| `watchtower`             | Auto-updater (production only)  | -       |

## MongoDB Replica Set

All MongoDB instances are configured as replica sets (`rs0`) to support:

-   Change Streams (used by workflows)
-   Transactions

The `mongo/` folder contains initialization scripts:

-   `init.js` - Creates database user on first startup
-   `healthcheck.js` - Verifies replica set status
-   `replica.key` - Authentication key for replica set members

## Traefik Configuration

The `traefik/` folder contains:

-   `traefik.yml` - Static configuration for Traefik reverse proxy
    -   HTTP to HTTPS redirection
    -   Cloudflare DNS challenge for TLS certificates
    -   Docker provider configuration

## Security Notes

-   Local development files use safe default values
-   Production environment files (`.env`) are gitignored
-   Never commit production credentials to the repository
-   In production, use IAM roles for AWS instead of access keys
