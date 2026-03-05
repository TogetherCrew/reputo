# Docker Configuration

This directory contains Docker configuration files for different deployment environments.

## Directory Structure

```
docker/
├── docker-compose.yml                # Production/Staging deployment
├── docker-compose.dev.yml            # Local development (builds from source)
├── preview/                          # Preview env (Caddy + compose)
│   ├── Caddyfile
│   └── docker-compose.preview.yml
├── Dockerfile                        # Multi-stage build for all services
├── env/                              # Environment variables
│   ├── examples/                     # Templates (copy to parent)
│   │   ├── api.env.example
│   │   ├── grafana.env.example
│   │   ├── mongodb.env.example
│   │   ├── shared.env.example
│   │   ├── temporal.env.example
│   │   ├── temporal-postgresql.env.example
│   │   ├── temporal-ui.env.example
│   │   ├── ui.env.example
│   │   └── workflows.env.example
├── mongo/                            # MongoDB initialization scripts
│   ├── init.js                       # Database initialization script
│   ├── healthcheck.js                # Replica set health check
│   └── keyfile.txt                   # Replica set authentication key
├── observability/                    # Observability stack configuration
│   ├── loki/
│   │   └── loki-config.yml           # Loki storage, retention, limits
│   ├── promtail/
│   │   └── promtail-config.yml       # Docker log scraping and relabeling
│   └── grafana/
│       └── provisioning/
│           ├── datasources/
│           │   └── loki.yml          # Auto-provisioned Loki datasource
│           └── dashboards/
│               ├── dashboards.yml    # Dashboard provider config
│               └── service-overview.json
└── traefik/                          # Traefik configuration
    └── traefik.yml                   # Reverse proxy + JSON access logs
```

## Docker Compose Files

### Production/Staging (`docker-compose.yml`)

Used for production and staging deployments. Features:

- Pre-built images from GitHub Container Registry (GHCR)
- Traefik reverse proxy with TLS via Cloudflare
- Watchtower for automatic container updates
- External `web` network

```bash
cd docker
docker-compose up -d
```

### Local Development (`docker-compose.dev.yml`)

Used for local development. Features:

- Builds images from source code
- Hot-reload via mounted source volumes
- MongoDB with replica set and authentication
- Exposed ports for direct access (API: 3000, UI: 8080, Temporal UI: 8088)
- Observability included (Grafana at http://localhost:3001)

```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

### Preview Environment (`docker-compose.preview.yml`)

Used by PullPreview for ephemeral PR environments. Features:

- Pre-built images from GHCR (built in CI, not on the instance)
- **Caddy** reverse proxy (HTTP only; see `preview/Caddyfile`)
- Uses `PULLPREVIEW_PUBLIC_DNS` for dynamic routing
- Image tag controlled by `PREVIEW_IMAGE_TAG` env var
- Observability included (Grafana at `/grafana`)

## Environment Files

All environment templates are located in `env/examples/` and should be copied to `env/` before running compose files.

### Template Files

Copy these templates and update with your values:

| Template                                       | Target                        | Description                                        |
| ---------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| `env/examples/api.env.example`                 | `env/api.env`                 | API service configuration (MongoDB, AWS, Temporal) |
| `env/examples/grafana.env.example`             | `env/grafana.env`             | Grafana admin credentials and settings             |
| `env/examples/mongodb.env.example`             | `env/mongodb.env`             | MongoDB root credentials                           |
| `env/examples/shared.env.example`              | `env/shared.env`              | Production domains and Traefik config              |
| `env/examples/temporal.env.example`            | `env/temporal.env`            | Temporal server database settings                  |
| `env/examples/temporal-postgresql.env.example` | `env/temporal-postgresql.env` | PostgreSQL credentials for Temporal                |
| `env/examples/temporal-ui.env.example`         | `env/temporal-ui.env`         | Temporal UI settings                               |
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

| Service                  | Description                        | Ports   |
| ------------------------ | ---------------------------------- | ------- |
| `api`                    | NestJS backend API                 | 3000    |
| `ui`                     | Next.js frontend                   | 8080    |
| `orchestrator-worker`    | Temporal workflow orchestrator     | -       |
| `typescript-worker`      | Temporal algorithm activity worker | -       |
| `mongodb`                | MongoDB database (replica set)     | 27017   |
| `temporal`               | Temporal server                    | 7233    |
| `temporal-ui`            | Temporal web dashboard             | 8088    |
| `temporal-postgresql`    | PostgreSQL for Temporal            | -       |
| `temporal-elasticsearch` | Elasticsearch for Temporal         | -       |
| `traefik`                | Reverse proxy (production only)    | 80, 443 |
| `watchtower`             | Auto-updater (production only)     | -       |
| `grafana`                | Log dashboards (observability)     | 3000    |
| `loki`                   | Log aggregation (observability)    | 3100    |
| `promtail`               | Log shipping (observability)       | -       |

## MongoDB Replica Set

All MongoDB instances are configured as replica sets (`rs0`) to support:

- Change Streams (used by workflows)
- Transactions

The `mongo/` folder contains initialization scripts:

- `init.js` - Creates database user on first startup
- `healthcheck.js` - Verifies replica set status
- `keyfile.txt` - Authentication key for replica set members

## Traefik Configuration

The `traefik/` folder contains:

- `traefik.yml` - Static configuration for Traefik reverse proxy
    - HTTP to HTTPS redirection
    - Cloudflare DNS challenge for TLS certificates
    - Docker provider configuration
    - JSON access logs (used by observability for latency/error panels)

## Observability (Grafana + Loki + Promtail)

The observability stack (Grafana + Loki + Promtail) is included in every compose file and
ships logs from all services into Loki with Grafana dashboards for troubleshooting.

### Architecture

- **Promtail** scrapes container logs via the Docker socket and ships them to Loki with labels (`env`, `service`, `container`, `compose_project`).
- **Loki** stores and indexes logs with configurable retention (default 7 days).
- **Grafana** provides the query UI and prebuilt dashboards.
- **Traefik** JSON access logs feed latency and status-code panels.

### Verify Observability

```bash
cd docker

# Verify containers are running
docker ps | grep -E "grafana|loki|promtail"

# Verify Loki is ready (from within the Docker network)
docker exec loki wget -qO- http://localhost:3100/ready
```

### Environment Setup

1. Copy `env/examples/grafana.env.example` to `env/grafana.env` and set a strong admin password.
2. Add `GRAFANA_DOMAIN` and `OBSERVABILITY_ENV` to `env/shared.env` (see `env/examples/shared.env.example`).

### Grafana Access

Grafana is exposed via Traefik at `https://<GRAFANA_DOMAIN>` and protected by the same basic-auth middleware used for the Traefik dashboard.

### Prebuilt Dashboards

| Dashboard          | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| Service Overview   | Log volume, error rate, latency (p50/p95/p99), top errors by service |

Dashboards are auto-provisioned from `observability/grafana/provisioning/dashboards/`.
Drop additional JSON files there and restart Grafana to add more.

### Useful LogQL Queries

```logql
# All logs for a service
{service="api", env="production"}

# Error-rate approximation (5xx from Traefik access logs)
sum(rate({service="traefik"} | json | OriginStatus >= 500 [$__auto])) by (service)

# Latency p95 from Traefik (Duration is in nanoseconds)
quantile_over_time(0.95, {service="traefik"} | json | unwrap Duration | __error__="" [$__auto]) / 1000000

# Slow requests (> 1 second)
{service="traefik"} | json | Duration > 1000000000

# Recent exceptions across all services
{env="production"} |~ "(?i)(error|exception|fatal|panic)"

# API errors with JSON parsing
{service="api"} | json | level="error"
```

### Configuration Reference

| File                                            | Purpose                                   |
| ----------------------------------------------- | ----------------------------------------- |
| `observability/loki/loki-config.yml`            | Storage, retention (7 d), ingestion limits |
| `observability/promtail/promtail-config.yml`    | Docker SD, relabeling, pipeline stages    |
| `observability/grafana/provisioning/datasources/loki.yml` | Auto-provisioned Loki datasource |
| `observability/grafana/provisioning/dashboards/` | Dashboard JSON files                     |

### Retention & Resource Limits

- **Loki** retention is 7 days by default — change `reject_old_samples_max_age` in `loki-config.yml`.
- **Loki** memory limit: 512 MB. **Promtail** memory limit: 256 MB. Adjust `deploy.resources.limits` in the compose file as needed.
- All three observability images are pinned and excluded from Watchtower (`com.centurylinklabs.watchtower.enable=false`).

### Security & Sensitive Data

- Observability containers do not expose ports publicly — they communicate only on the Docker network.
- Grafana is the only service exposed externally, via Traefik with TLS + basic auth.
- Promtail drops its own container logs (loki, grafana, promtail) to avoid feedback loops.
- **Log redaction guidance:** avoid logging request bodies, tokens, or credentials. If structured logging is used, omit sensitive fields at the logger level rather than relying on Promtail filters.

## Security Notes

- Local development files use safe default values
- Production environment files (`.env`) are gitignored
- Never commit production credentials to the repository
- In production, use IAM roles for AWS instead of access keys
