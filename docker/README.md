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
│   ├── prometheus/
│   │   └── prometheus.yml            # Scrape targets (cAdvisor, node-exporter)
│   └── grafana/
│       └── provisioning/
│           ├── datasources/
│           │   ├── loki.yml          # Auto-provisioned Loki datasource
│           │   └── prometheus.yml    # Auto-provisioned Prometheus datasource
│           └── dashboards/
│               ├── dashboards.yml    # Dashboard provider config
│               ├── service-overview.json
│               ├── container-metrics.json
│               └── service-logs.json
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
| `grafana`                | Dashboards (observability)         | 3000    |
| `loki`                   | Log aggregation (observability)    | 3100    |
| `promtail`               | Log shipping (observability)       | -       |
| `prometheus`             | Metrics storage (observability)    | 9090    |
| `cadvisor`               | Container metrics (observability)  | -       |
| `node-exporter`          | Host metrics (observability)       | -       |

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

## Observability

The observability stack is included in every compose file and provides both **logs** and **metrics**.

### Architecture

**Logs pipeline:**
- **Promtail** scrapes container logs via the Docker socket and ships them to Loki with labels (`env`, `service`, `container`, `compose_project`).
- **Loki** stores and indexes logs with configurable retention (default 7 days).
- **Traefik** JSON access logs feed latency and status-code panels.

**Metrics pipeline:**
- **cAdvisor** exports per-container CPU, memory, network I/O, and disk metrics.
- **node-exporter** exports host-level CPU, RAM, disk, and network metrics.
- **Prometheus** scrapes cAdvisor and node-exporter every 15s and stores time-series data.

**Grafana** provides the query UI and prebuilt dashboards for both logs and metrics.

### Verify Observability

```bash
cd docker

# Verify containers are running
docker ps | grep -E "grafana|loki|promtail|prometheus|cadvisor|node-exporter"

# Verify Loki is ready (from within the Docker network)
docker exec loki wget -qO- http://localhost:3100/ready

# Verify Prometheus targets are up
docker exec prometheus wget -qO- http://localhost:9090/api/v1/targets | head -c 500
```

### Environment Setup

1. Copy `env/examples/grafana.env.example` to `env/grafana.env` and set a strong admin password (required in staging and production).
2. Add `GRAFANA_DOMAIN`, `GRAFANA_AUTH`, and `OBSERVABILITY_ENV` to `env/shared.env` (see `env/examples/shared.env.example`). Generate `GRAFANA_AUTH` with: `htpasswd -nbB user yourpassword` (use the raw output as the value).

### Grafana Access

In **staging and production**, Grafana is exposed via Traefik at `https://<GRAFANA_DOMAIN>` and protected by:
- **Traefik basic auth** — set `GRAFANA_AUTH` in `shared.env` (htpasswd format). Users must pass this before reaching Grafana.
- **Grafana login** — set admin credentials in `grafana.env`; anonymous access is disabled.

Both layers apply; use distinct credentials per environment. Local dev (`docker-compose.dev.yml`) keeps anonymous access for convenience.

### Prebuilt Dashboards

| Dashboard          | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| Service Overview   | Log volume, error rate, latency (p50/p95/p99), top errors by service |
| Container Metrics  | Host CPU/RAM/disk gauges, per-container CPU, memory, network I/O     |
| Service Logs       | Per-service log viewer with search, volume chart, error/warning count |

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

### Useful PromQL Queries

```promql
# Host CPU usage (%)
1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))

# Host memory usage (%)
1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)

# CPU usage per container
sum by (name) (rate(container_cpu_usage_seconds_total[5m]))

# Memory usage per container
container_memory_usage_bytes{name!=""}

# Network receive rate per container
sum by (name) (rate(container_network_receive_bytes_total[5m]))

# Top 5 containers by CPU
topk(5, sum by (name) (rate(container_cpu_usage_seconds_total[5m])))
```

### Configuration Reference

| File                                            | Purpose                                      |
| ----------------------------------------------- | -------------------------------------------- |
| `observability/loki/loki-config.yml`            | Storage, retention (7 d), ingestion limits    |
| `observability/promtail/promtail-config.yml`    | Docker SD, relabeling, pipeline stages        |
| `observability/prometheus/prometheus.yml`        | Scrape config (cAdvisor, node-exporter, self) |
| `observability/grafana/provisioning/datasources/loki.yml` | Auto-provisioned Loki datasource    |
| `observability/grafana/provisioning/datasources/prometheus.yml` | Auto-provisioned Prometheus datasource |
| `observability/grafana/provisioning/dashboards/` | Dashboard JSON files                        |

### Retention & Resource Limits

- **Loki** retention is 7 days by default — change `reject_old_samples_max_age` in `loki-config.yml`.
- **Prometheus** retention is 15 days in production (7 days in dev/preview) — change `--storage.tsdb.retention.time` in the compose file.
- **Loki** memory limit: 512 MB. **Promtail** memory limit: 256 MB. **Prometheus** memory limit: 512 MB. **cAdvisor** memory limit: 256 MB. **node-exporter** memory limit: 128 MB. Adjust `deploy.resources.limits` in the compose file as needed.
- All observability images are pinned and excluded from Watchtower (`com.centurylinklabs.watchtower.enable=false`).

### Security & Sensitive Data

- Observability containers do not expose ports publicly — they communicate only on the Docker network.
- Grafana is the only service exposed externally, via Traefik with TLS + basic auth.
- Promtail drops observability container logs (loki, grafana, promtail, prometheus, cadvisor, node-exporter) to avoid feedback loops.
- **Log redaction guidance:** avoid logging request bodies, tokens, or credentials. If structured logging is used, omit sensitive fields at the logger level rather than relying on Promtail filters.

## Security Notes

- Local development files use safe default values
- Production environment files (`.env`) are gitignored
- Never commit production credentials to the repository
- In production, use IAM roles for AWS instead of access keys
