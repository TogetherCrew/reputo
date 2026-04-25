# Komodo Resources

This directory contains the declarative Komodo resources for Reputo. Core syncs
the tree from the `main` branch through the `reputo-main` ResourceSync in
`_sync.toml`.

## Layout

- `_sync.toml` defines the ResourceSync itself. `managed = false` and
  `delete = false` keep this first iteration non-destructive.
- `servers.toml` defines the staging and production Periphery servers.
- `stacks/reputo-infra.toml` defines staging and production infra stacks from
  `docker/compose/infra.yml` plus `docker/compose/observability.yml`.
- `stacks/reputo-apps.toml` defines staging and production app stacks from
  `docker/compose/apps.yml`.
- `procedures/promote-production.toml` defines the manual production deploy
  procedure that can be used after GitHub Actions promotes image tags.
- `alerters/slack.toml` defines the Slack alerter.
- `schedules/prune-images.toml` defines a scheduled Procedure. Komodo schedules
  are stored on Procedures or Actions, not as standalone `[[schedule]]`
  resources.

## Stack Posture

The Stack resources point at the existing host checkout in `/opt/reputo` and
reuse the split Compose files instead of duplicating Compose YAML into Komodo.
Both app stacks keep `poll_for_updates = false`, `webhook_enabled = false`, and
`deploy = false` until Phase 5. Infra stacks also keep polling disabled.

Each stack writes `docker/env/shared.env` at deploy time from the TOML
`environment` block. The environment deliberately keeps the existing channel
tags:

- staging stacks set `IMAGE_TAG=staging`
- production stacks set `IMAGE_TAG=production`

Per-service env files such as `docker/env/api.env` and
`docker/env/workflows.env` remain host-local runtime files and are not committed
or synced here.

## Required Komodo Variables And Secrets

Create these in Komodo before deploying or testing the resources:

- `KOMODO_PASSKEY`
- `KOMODO_WEBHOOK_SECRET`
- `KOMODO_SLACK_WEBHOOK_URL`
- `STAGING_PERIPHERY_ADDRESS`
- `PRODUCTION_PERIPHERY_ADDRESS`
- `STAGING_TRAEFIK_DOMAIN`
- `STAGING_UI_DOMAIN`
- `STAGING_API_DOMAIN`
- `STAGING_TEMPORAL_UI_DOMAIN`
- `STAGING_TRAEFIK_AUTH`
- `STAGING_CF_DNS_API_TOKEN`
- `STAGING_GRAFANA_DOMAIN`
- `STAGING_GRAFANA_AUTH`
- `STAGING_ALLOWED_ORIGINS`
- `PRODUCTION_TRAEFIK_DOMAIN`
- `PRODUCTION_UI_DOMAIN`
- `PRODUCTION_API_DOMAIN`
- `PRODUCTION_TEMPORAL_UI_DOMAIN`
- `PRODUCTION_TRAEFIK_AUTH`
- `PRODUCTION_CF_DNS_API_TOKEN`
- `PRODUCTION_GRAFANA_DOMAIN`
- `PRODUCTION_GRAFANA_AUTH`
- `PRODUCTION_ALLOWED_ORIGINS`

Keep secrets in Komodo or the password manager only. Do not commit resolved
values.
