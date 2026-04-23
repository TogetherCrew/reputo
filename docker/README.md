# Docker

Docker assets are split into three paths:

- `docker/docker-compose.dev.yml`: local hot-reload stack for testing the monorepo behind Traefik.
- `docker/docker-compose.yml`: staging or production deployment using prebuilt GHCR images and Watchtower.
- `docker/preview/docker-compose.preview.yml`: PullPreview deployment using prebuilt preview images.

## Environment Files

Tracked examples under `docker/env/examples/*.env.example` are the source of truth. Runtime files in `docker/env/*.env` are local-only and ignored by Git.

```bash
mkdir -p docker/env
cp docker/env/examples/shared.env.example docker/env/shared.env
cp docker/env/examples/grafana.env.example docker/env/grafana.env
cp docker/env/examples/api.env.example docker/env/api.env
cp docker/env/examples/ui.env.example docker/env/ui.env
cp docker/env/examples/workflows.env.example docker/env/workflows.env
cp docker/env/examples/mongodb.env.example docker/env/mongodb.env
cp docker/env/examples/temporal.env.example docker/env/temporal.env
cp docker/env/examples/temporal-ui.env.example docker/env/temporal-ui.env
cp docker/env/examples/temporal-postgresql.env.example docker/env/temporal-postgresql.env
cp docker/env/examples/onchain-data-postgresql.env.example docker/env/onchain-data-postgresql.env
```

For htpasswd-style values such as `TRAEFIK_AUTH` and `GRAFANA_AUTH`, keep the doubled dollar signs from the examples. Docker Compose env files require `$` to be escaped as `$$`.

## Local Hot Reload

```bash
docker compose -f docker/docker-compose.dev.yml up --build
```

The dev stack builds `docker/Dockerfile.dev`, mounts the repo into `/workspace`, and runs watch-mode commands for the API, UI, and workers. Useful local endpoints:

- UI: `http://localhost`
- API via Traefik: `http://localhost/api`
- Traefik dashboard: `http://localhost:8080/dashboard/`
- Temporal UI: `http://localhost:8088`
- Grafana: `http://localhost:3001`

## Staging And Production

`docker/docker-compose.yml` deploys mutable channel tags. Set `IMAGE_TAG=staging` on the staging host and `IMAGE_TAG=production` on the production host.

Main branch builds publish:

- `sha-<commit>`: immutable image tag per affected app
- `staging`: mutable deployment tag for affected apps only

Production promotion resolves the digest behind `sha-<commit>` and retags only the affected apps to:

- `production`
- `prod-<commit>`

Deploy with:

```bash
docker compose --env-file docker/env/shared.env -f docker/docker-compose.yml up -d
```

## Preview

Pull request preview builds publish only `preview-<commit>` tags. Preview compose expects `PREVIEW_IMAGE_TAG` plus the required cloud credentials:

```bash
PREVIEW_IMAGE_TAG=preview-<commit> \
AWS_ACCESS_KEY_ID=<key> \
AWS_SECRET_ACCESS_KEY=<secret> \
docker compose -f docker/preview/docker-compose.preview.yml up -d
```
