# Docker

Docker assets for local development, staging or production deployments, and preview environments. Local compose runs the full app stack with Traefik, Temporal, MongoDB, PostgreSQL, and observability. Staging and production use prebuilt GHCR images behind Traefik with Watchtower, while preview uses a smaller PullPreview-style stack.

## Compose Files

- `docker/docker-compose.dev.yml` for local development; builds images from the repo and routes local traffic through Traefik.
- `docker/docker-compose.yml` for staging and production; pulls GHCR images and includes Traefik, Watchtower, and observability.
- `docker/preview/docker-compose.preview.yml` for ephemeral preview environments; uses prebuilt images and the Caddy preview proxy.

## Commands

```bash
docker compose -f docker/docker-compose.dev.yml up --build
docker compose --env-file docker/env/shared.env -f docker/docker-compose.yml up -d
PREVIEW_IMAGE_TAG=<tag> AWS_ACCESS_KEY_ID=<key> AWS_SECRET_ACCESS_KEY=<secret> docker compose -f docker/preview/docker-compose.preview.yml up -d
```

## Config

Environment templates live in `docker/env/examples`. Copy the templates you need into `docker/env` before starting the local or staging and production stacks.

```bash
cp docker/env/examples/*.env.example docker/env/
for file in docker/env/*.env.example; do mv "$file" "${file%.example}"; done
```